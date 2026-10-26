/* LA BANDE DES HABILLAGES : jusqu'ici on ne feuilletait peintures, ailes et traînées qu'aux flèches, à l'aveugle. Désormais la
   même bande de vignettes que les caisses montre TOUTE la gamme d'un coup d'œil — le nuancier de la laque (chrome, or et
   mat ont leur matière), l'aile, le ruban de la traînée — avec le prix, le cadenas (à gagner) ou la coche (à toi). */
function gStripHabits(cat,i){
  if(gModeM()==='shop'){gShopJour();return;} // (2026-10-10) LA BOUTIQUE DU JOUR mêle caisses et habillages : une seule vitrine
  const st=$('gStrip'),bar=$('gRar');if(!st)return;const L=COSM[cat],md=gModeM(),fi=md==='inv'?'moi':md==='shop'?'achat':md==='tous'?'prix':(SHOP.filtre||'tout'); // (2026-10-09) INVENTAIRE = à moi, BOUTIQUE = à acheter
  try{gModeBoutons();}catch(e){}
  const k='cos:'+md+':'+cat+':'+fi+':'+L.map(function(x){return shopOwned(cat,x.id)?1:0;}).join('')+':'+shopEqD(cat).id+(cat==='figure'&&window.FIG?':'+figSlots().join(','):''); // (L'INVENTAIRE ILLUSTRÉ) une figure équipée ailleurs refait la bande
  const garde=function(d){const a=shopOwned(cat,d.id);return fi==='tout'||(fi==='prix'?!!(d.p||d.eur):fi==='moi'?a:(!a&&!!(d.p||d.eur)));}; // (2026-10-10) SEE ALL ITEMS : tout ce qui a un prix, à toi ou pas // À ACHETER = en vente et pas à toi (les défis se gagnent)
  if(bar&&bar._k!==k&&md!=='tout'){bar._k=k;bar._on=null;let n9=0;for(const d of L)if(garde(d))n9++;gModeTete(bar,md,n9);} // (2026-10-09) en mode, la barre dit le MODE
  else if(bar&&bar._k!==k){bar._k=k;bar._on=null;bar.classList.remove('gModeBar'); // la barre des familles devient celle des FILTRES (même touche, même place)
    const nb=function(f){let n=0;for(const d of L){const a=shopOwned(cat,d.id);if(f==='tout'||(f==='moi'?a:(!a&&!!(d.p||d.eur))))n++;}return n;};
    bar.innerHTML=[['tout','TOUT','var(--tx2)'],['moi','À MOI','var(--neoV)'],['achat','À ACHETER','var(--neoC)']].map(function(f){
      return '<button class="gR gF'+(f[0]===fi?' on':'')+'" data-f="'+f[0]+'" role="tab" aria-selected="'+(f[0]===fi)+'" style="--rc:'+f[2]+'"><span class="gRn">'+sansAcc(TR(f[1]))+'</span><b>'+nb(f[0])+'</b></button>';}).join('');}
  if(st._r!==k){st._r=k;st._n=-1;
    const hx=function(c){return '#'+(c>>>0).toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
    const S9=cat==='figure'&&window.FIG?figSlots():null; // (LES FIGURES v2) équipée = dans un des trois emplacements
    st.innerHTML=(cat==='peinture'?peintOrdre():L.map(function(x9,j){return j;})).map(function(j){const d=L[j],a=shopOwned(cat,d.id),eqd=S9&&FIGV2.on?S9.indexOf(d.id)>=0:shopEqD(cat)===d; /* (2026-10-16) les peintures rangées par RARETÉ (voir peintOrdre) */
      let fig='',ill=false;
      if(cat==='peinture'){const c9=d.id==='usine'?CARS[equippedCar()].color:d.c;
        fig='<i class="gSwc'+(d.grad?'':cosmSwCl(d))+'" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(c9))+'"></i>';}
      else if(cat==='trainee'&&illuTr(d)){fig=illuPx(illuTr(d),'gIc',!a);ill=true;} // (2026-10-14) une traînée POP : son pictogramme et son nom, comme les ailes — (L'INVENTAIRE ILLUSTRÉ) celles d'origine aussi
      else if(cat==='trainee')fig='<i class="gRub" style="color:'+(d.rainbow?'#ff9b1a':d.rgb?rg(d.rgb):'#ff8a24')+';background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 35%,#fff 100%)')+'"></i>';
      else if(cat==='figure'){fig=illuFig(d.id,a?rarInfo(cosmRar(cat,d)).c:'#6c6390',false,'gIc')+(S9?'<s class="fgDir">'+figPeut(d.id).map(function(k9){return '<i'+(S9[k9]===d.id?' class="on"':'')+'>'+pxi(FIG_FAM[k9][2])+'</i>';}).join('')+'</s>':'');ill=true;} // (2026-10-14) une FIGURE — (L'INVENTAIRE ILLUSTRÉ) son anneau, sa caisse, et ses directions (allumée = équipée là)
      else{fig=illuPx(illuAile(d),'gIc',!a);ill=true;} // (2026-10-14) les ailes POP ont leur pictogramme — (L'INVENTAIRE ILLUSTRÉ) celles d'origine aussi
      const et=a?(eqd&&cat==='peinture'&&d.id!=='usine'?pxi('croix'):eqd||S9?'':pxi('coche')):(d.eur?eurTxt(d.eur):d.p?fmtC(d.p):d.pack==='chat'?sansAcc(TR('PACK CHAT')):d.pack?eurTxt(PALETTE_PACK.eur):sansAcc(TR('MISSION'))); /* (2026-10-18 soir) l'ARC-EN-CIEL n'est pas de la palette (voir chatPackI) */ // (2026-10-14, palette) un article du PACK dit son prix en euros // (à gagner : le cadenas est déjà au coin)
      if(!garde(d))return '';
      const rc9=md==='shop'?' style="--rc:'+rarInfo(cosmRar(cat,d)).c+'"':md==='inv'?' style="--rc:#5ee6ff"':md==='tous'?' style="--rc:#ff3ec8"':''; // (2026-10-09) BOUTIQUE : la couleur de la rareté ; INVENTAIRE : le cyan de l'inventaire (« enlève la rareté de l'inventaire »)
      return '<div class="gT cos c-'+cat+(d.ico&&cat==='trainee'?' pop':'')+(ill?' ill':'')+(a?'':' lock')+(eqd?' eq':'')+'" data-cos="'+j+'"'+(cat==='aile'?' data-aile="'+d.id+'"':'')+' role="button" aria-label="'+String(TR(d.n)).replace(/"/g,'')+'"'+rc9+'>'+fig+(cat==='aile'||cat==='figure'||ill?'<b>'+sansAcc(TR(d.n))+'</b>':'')+'<em>'+et+'</em></div>';}).join('');
    if(cat==='aile'&&typeof aileFile==='function')st.querySelectorAll('.gT[data-aile]').forEach(function(el){try{aileFile(el.getAttribute('data-aile'),function(url){ // (L'INVENTAIRE ILLUSTRÉ) l'aile en PHOTO dès que la boutique sait la faire
      if(!url||!el.isConnected||el.classList.contains('photo'))return;const im=document.createElement('img');im.alt='';im.src=url;el.insertBefore(im,el.firstChild);el.classList.add('photo');});}catch(e){console.warn('aileFile',e);}});}
  if(cat==='figure')try{gFigSelMaj();gFigGrilleArme();}catch(e){console.warn('figSel',e);} // (LES TROIS FIGURES ÉQUIPÉES) le sélecteur au-dessus de la grille // (le nom se lit en grand sur la fiche : la vignette montre la MATIÈRE — sauf l'aile, que seul son nom distingue)
  st.querySelectorAll('.gT').forEach(function(el){el.classList.toggle('on',+el.getAttribute('data-cos')===i);});
  const on=st.querySelector('.gT.on');if(on){const x=on.offsetLeft-(st.clientWidth-on.offsetWidth)/2;try{st.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=x;}}
  if(!st._fin){st._fin=1;const f9=function(){st.classList.toggle('finDroite',st.scrollLeft+st.clientWidth>=st.scrollWidth-4);};st.addEventListener('scroll',f9,{passive:true});setTimeout(f9,400);} /* (garage v7) au bout de la bande, plus de fondu */
}
// `openGarage(quiet)` — 2026-09-05 : `quiet=true` (voir `playViaGarage`) ouvre le MÊME atelier 3D
// (la caisse, la salle, la porte) mais SANS la fiche d'achat/échange (`#gTop`/`#gCard`/les flèches) —
// « un bouton play séparé des achats de voitures » (demande du user, après que le bouton JOUER du
// menu s'est mis à traverser tout l'étal). Le garage RESTE la scène du départ (porte qui s'ouvre,
// boost, logo) ; c'est seulement le PAPIER PEINT du shop qui n'a rien à faire sur un lancement rapide.
/* (2026-10-15, Léo : « augmente le bruit ambiant du garage ») L'AIR DE L'ATELIER (`garage.ambiance` : le bourdon des néons, le tube qui grésille,
   la ville au loin) monte d'un cran net : +6 dB sur son niveau de la banque (−12). MESURÉ, bande par bande : il était 4 à 13 dB SOUS la porte en
   feu (`garage.feu`, inchangée) — on ne l'entendait presque pas ; désormais à son niveau dans le grave et le médium (le grésillement reste
   un peu dessous). Le compresseur des effets tient le total (+0,3 dB en sortie) : c'est l'équilibre qui change, pas le volume du garage. */
const GAR_AMB_DB=6;
function openGarage(quiet){
  try{GMODE.m='tout';GMODE.paye=false;GMODE.fam=null;gConsoleCache(true);gVueSeule(false);}catch(e){} /* (2026-10-14, Léo : « l'inventaire, arrête de le faire apparaître sans qu'on y touche ») le garage s'ouvre REPLIÉ : les touches seules, la caisse a la place ; l'inventaire ne s'ouvre qu'à INVENTAIRE */ // (2026-10-12, Léo, le soir : « mets directement l'inventaire dès qu'on arrive dans le garage ») le garage s'ouvre sur l'INVENTAIRE (voir gGarageInv) — avant : (2026-10-12, Léo : « quand on appuie GARAGE, juste les 5 boutons en bas, pas la marge, la voiture encadrée ; seulement quand j'appuie INVENTAIRE s'affiche l'inventaire — pareil pour la BOUTIQUE ») le garage s'ouvre REPLIÉ, aucun mode allumé : INVENTAIRE ou BOUTIQUE déplient leur panneau (gModeVa) // (2026-10-09) la console à trois modes repart dépliée — (2026-10-10) et l'œil rouvert ; (même soir, Léo : « quand j'arrive direct dans le garage, ça montre l'ancien truc avec les raretés, enlève ça ») elle s'ouvre sur l'INVENTAIRE, plus sur la vue par familles (TOUT)
  try{if(PHQ.q.length&&!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}catch(e){} // (2026-09-26) les photos en attente reprennent
  if(started&&!gameOver){showMsg('Le garage se visite depuis le menu');return;} // ⚠ gameOver = on EST au menu : refuser ici bloquait le bouton apres la 1re partie
  try{if(SONV2&&!openGarage._amb)openGarage._amb=sfx('garage.ambiance',{loop:true,vol:GAR_AMB_DB});}catch(e){} // (console de son) l'ATELIER a sa voix : néons, tube qui grésille, la ville au loin
  try{if(SONV2&&!openGarage._feu)openGarage._feu=sfx('garage.feu',{loop:true});}catch(e){} // (2026-09-29) …et la porte BRÛLE : le rideau de flammes gronde et crépite (il monte pendant le lâcher, voir garFeu)
  garageOn=true;gEl.classList.add('on');gEl.classList.toggle('quiet',!!quiet);overlay.style.display='none';document.body.classList.add('inGarage');
  if(pigGroup)pigGroup.visible=false;
  if(!GAR.root)buildGarageRoom();   // L'ATELIER se bâtit à la PREMIÈRE visite : zéro coût pour qui n'y entre jamais
  GAR.root.visible=true;
  try{affichesMaj();}catch(e){} // (2026-09-30) les records du mur, à jour (chiffres ET langue)
  if(FSTU.on){paintEnvStudio();finLaque(true);}else paintEnvAtelier(); // (2026-10-20) `?finition=studio` : la lumière de studio et le vernis profond (voir finition.js) — (2026-09-26) la laque reflète l'ATELIER (tubes, clé chaude, contre-jour cyan), plus le ciel de la dernière course
  // (2026-09-26, vague 2) …et l'atelier a SA lumière (biome `atelier`) au lieu du ciel et du soleil de la dernière course. Posée hors
  // du voyage BIO (BIO.cur reste le ciel du niveau) : closeGarage le rend tel quel. Un voyage en cours se termine d'abord, sinon
  // bioStep repeindrait le ciel du biome par-dessus l'atelier à chaque image.
  if(BIO.k<1){BIO.k=1;bioLerp(BIO.from,BIO.to,1,BIO.cur);}
  bioApply(BIOMES.atelier);MENUV.bio=false;
  garageAng=Math.PI;garagePitch=.2;garageDist=7.8;if(typeof GTN!=='undefined'&&GTN){GTN.fixe=false;GTN.gt=0;GTN.glisse=false;}GAR.vA=0;GAR.vAc=0;GAR.vW=0;GAR.vD=0;GAR.vDv=0;GAR.vDw=0;GAR.preE=0;GAR.aVl=null;GAR.vAv=0;GAR.vDon=true;GAR.ret=null;GAR.tDoigt=0;GAR.pT=.2;GAR.roll=0;GAR.swK=0;GAR.fige=false; // (2026-09-30, Léo, capture de sa branche : « c'est ça que je veux ») on entre DERRIÈRE la caisse, la porte en feu au fond du cadre — le plateau la fait tourner ensuite (voir GAR_CAM_A)
  garageShow(level||0);
  GMIS.mk=0;garMode(GAR.aMenu&&!GAR.aGar?'menu':'boutique');GAR.aMenu=false;GAR.aGar=false; /* (2026-10-22, Sacha : « le bouton maison de l'écran de mort doit ramener au garage, pas à l'écran titre ») aGar = ce retour-là ouvre l'atelier, pas le menu */
  if(GAR.aMis){GAR.aMis=false;garMode('missions');}
  GAR.vueT=0;GAR.vueNeuve=true; // (2026-10-06) LA MISE EN PLACE : l'atelier qui s'ouvre pose son plan d'un coup (voir garageRender) — (2026-09-30) la porte des MISSIONS, venue d'ailleurs (écran de mort…) // (2026-09-30) ouvert par l'ACCUEIL = le menu ; par un autre chemin (mort → GARAGE, missions, objectif) = la boutique
}
/* (2026-10-24, passe perf 3e tour) resetSuit : resetGame suit DANS LA MÊME IMAGE (le JOUER après une partie, au bout du piqué ou du lâcher) et
   rebâtit la caisse équipée (buildCar) — la caisse « du menu » que closeGarage remettait n'était jamais dessinée : une construction de caisse
   de moins (26-30 ms ×4 MESURÉS) au JOUER d'après partie. La caisse dessinée est la même : celle de resetGame. */
function closeGarage(resetSuit){
  GATL.on=false;GATL.c=GATL.cs=GATL.l=GATL.p=0;if(gEl)gEl.classList.remove('atelierInv');BRB.p=0;BRB.plan=null;BRB.TP=null;BRB.attente=null;BRB.libre=null;BRB.joue=false;BRB.yaw=0;BRB.cK=BRB.cY=0;if(BRB.g)BRB.g.visible=false; /* (2026-10-19) le bras des figures non plus */ // (2026-10-12) l'ATELIER FERMÉ ne survit pas au garage
  try{gVueSeule(false);}catch(e){} // (2026-10-10) l'ŒIL ne survit pas à l'atelier
  try{burnCoupe();}catch(e){} // (2026-10-05) le burn-out ne survit pas à l'atelier
  invFerme(true);invHoldFin(); // (2026-10-04) l'INVENTAIRE ne survit pas à l'atelier
  GAR.vD=0;GAR.wD=0;GAR.preE=0;GAR.misVit=false; // (2026-10-05) la composition de la vitrine repart de zéro à la prochaine visite
  chuteSort(true); // (2026-09-30) LA CHUTE : les nuages, les filets de vent et le vent s'en vont avec le menu
  try{bqSonCoupe(.4);BQSON.atelier=false;}catch(e){} // (2026-10-14) …et la voix de la boutique
  GBQ.pose=false;GBQ.platK=1; // (2026-10-15) …et la pose tenue de la boutique
  try{if(openGarage._amb){openGarage._amb.stop(.35);openGarage._amb=null;}}catch(e){}
  try{if(openGarage._feu){openGarage._feu.stop(.35);openGarage._feu=null;}}catch(e){}
  trailApercu(0,false);
  if(SHOP.prev||SHOP.tab!=='voiture'){SHOP.prev=null;SHOP.tab='voiture';if(!resetSuit)buildCar(CARS[equippedCar()]);} // l'essai ne sort pas de l'atelier
  paintEnv(BIO.to.env,BIO.to.eS1,BIO.to.eS2); // (2026-09-26) on rend à la laque le ciel du biome (l'atelier l'avait repeint en studio)
  finLaque(false); // (2026-10-20) le vernis de course (voir finition.js)
  bioApply(BIO.cur); // ⚠ (2026-09-24) le garage/l'étal écrasent le ciel chaque frame (nuit étoilée) : on rend la main au BIOME en sortant, sinon la 1re course gardait leur ciel
  garageOn=false;gEl.classList.remove('on');gEl.classList.remove('quiet');gEl.classList.remove('launching');gEl.classList.remove('missions');GMIS.mk=0;GMIS.e=0;document.body.classList.remove('inGarage');try{hubSync();}catch(e){} // (2026-10-06) la barre du HUB s'en va avec l'atelier
  GAR.affH=null;GAR.dbgAff=null;document.body.style.cursor=''; // (affiches) le curseur main ne survit pas à l'atelier
  garageDecale(0); // (vague 2) l'objectif se recentre : la caméra de l'atelier est celle de la course
  garageFloor.visible=false;
  // ⚠ FERMER PENDANT UNE BASCULE : la caisse est alors écrasée à .001 et le scanner allumé. Sans ce
  // rattrapage on partait en course dans une caisse plate — un bug qui ne se voit qu'en fermant PILE
  // au mauvais moment, donc jamais en test et toujours chez le joueur.
  GAR.sw=null;GAR.go=null;GAR.sous=null;GAR.pressT=0;GAR.impactT=0;carGroup.scale.set(1,1,1);carGroup.rotation.set(0,0,0);
  if(GAR.impactMeshes)for(const m9 of GAR.impactMeshes)m9.visible=false;
  if(GAR.scan)GAR.scan.visible=false;
  if(GAR.root)GAR.root.visible=false;                                     // l'atelier s'éteint derrière toi
  atelierLampes(false);stallKey.intensity=0;stallRim.intensity=0;
  sunSprite.visible=true;horizonGlow.visible=true;for(const r9 of RAYS)r9.visible=true; // le soleil revient sur la piste
  if(pigGroup)pigGroup.visible=true;
  if(!resetSuit)buildCar(CARS[level||0]);   // remet la caisse du menu (resetSuit : resetGame la rebâtit dans la même image)
  camera.up.set(0,1,0);
  frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);
  document.body.classList.remove('garMenuH');overlay.style.display='flex';
}
/* L'APERÇU DE TRAÎNÉE AU GARAGE (2026-09-25, user : « on ne voit pas la traînée de nitro derrière la voiture dans le
   garage »). La vraie traînée est l'HISTOIRE des positions de la caisse : sur son plateau, immobile, elle ne fait aucune
   longueur. On dessine donc deux rubans d'aperçu qui partent des tuyères et ondulent vers l'arrière, à la couleur de la
   traînée essayée (arc-en-ciel compris), additifs et fondus au bout — seulement dans l'onglet TRAÎNÉES. */
const TRPV={r:[],t:0,v1:new THREE.Vector3(),c:new THREE.Color()};
/* L'APERÇU EN VRAIE LUMIÈRE (2026-10-16, session TRAÎNÉES — Sacha : « améliore chaque traînée, il faut qu'elle donne toute envie
   d'acheter »). L'atelier et la boutique montraient une bande PLATE qui sortait des POTS : un pavé de couleur, rien à voir avec la traînée
   de la course (qui part des FEUX ARRIÈRE, cœur + halo, tête chauffée à blanc, pouls d'énergie). Ici, deux sillages à eux (créés à la
   première traînée essayée, même matière que ceux de la course : zéro programme de plus), nourris d'un chemin inventé qui part des feux et
   ondule vers l'arrière, rendus par silRuban. L'ALLUMAGE se voit — la lumière file des feux jusqu'au bout en 0,28 s, la tête flashe —
   parce que l'inventaire ENCHAÎNE (v540) : on n'a qu'une demi-seconde pour la voir. En salle blanche (boutique), le ruban passe en encre. */
const SILPV={s:[],t:0,on:0,id:'',v:new THREE.Vector3()};
function silBlanc(){return !!(garageOn&&GBQ.on&&GBQ.grp&&GBQ.grp.visible);}
function silApercu(dt,on,k9){
  const S=SILPV;
  if(!on){for(const tr of S.s)tr.m.visible=false;S.on=0;S.id='';return false;}
  const d=cosmSur('trainee'),nf=Math.min(2,CAR_FEUX.length);if(!d||!nf)return false;
  if(!S.s.length)S.s.push(mkSillage(),mkSillage());
  const id=d.id+':'+garageI+':'+nf;if(id!==S.id){S.id=id;S.on=0;}            // une autre traînée, une autre caisse : l'allumage se rejoue
  if(k9===0){S.on=0;for(const tr of S.s)tr.m.visible=false;return true;} // (2026-10-17) k9 = 0 : la vitrine coupe le moteur — le ruban s'éteint, il rejaillira des feux
  S.on+=dt;S.t+=dt;
  const neo=d.pop==='neon',rgb=d.rgb||[1.38,.62,.17],ku=.74,kk=Math.max(.8,k9==null?1:k9)*(neo?neonAllume(S.on):1),gro=neo?1:Math.min(1,S.on/.28),ign=neo?0:Math.exp(-S.on*4.5),
    L=11*(.12+.88*gro*(2-gro)),Q=SIL_Q,v=S.v,N=34;
  SIL_ENCRE=silBlanc();SIL_STY=d.sil||null;
  for(let i=0;i<2;i++){const tr=S.s[i];if(i>=nf){tr.m.visible=false;continue;}
    const F=CAR_FEUX[i],sd=nf===1?0:(F.x<0?-1:1);
    tr.g=1;tr.hk=1;tr.clk=S.t;tr.lg=L;
    for(let j=0;j<N;j++){const u=j/(N-1),o=j*8;
      if(!j)potMonde(F,v);
      else{v.set(F.x+sd*u*.4+Math.sin(u*3.1-S.t*3.4+i*.7)*.2*u,F.y+u*.14+Math.sin(u*2.3-S.t*2.6+i)*.08*u,F.z-u*L);carGroup.localToWorld(v);}
      Q[o]=v.x;Q[o+1]=v.y;Q[o+2]=v.z;Q[o+3]=kk;Q[o+4]=rgb[0]*ku;Q[o+5]=rgb[1]*ku;Q[o+6]=rgb[2]*ku;}
    silRuban(tr,N,true,dt,1+ign*1.1,(nf===1?SIL.un:1)*.62);}
  SIL_ENCRE=false;SIL_STY=null;return true;}
function trailApercu(dt,on,k9){ // k9 (2026-09-30, LA CHUTE) : l'intensité, 1 par défaut
  {const d9=on?cosmSur('trainee'):null,a9=!!(d9&&(d9.rainbow||(d9.id==='nitro'&&NYAN.on))), // (2026-10-07) l'ARC-EN-CIEL s'essaie en vrai : le feu de pixels de la course — celui de la boutique, ou la traînée d'origine du chat
         bk9=(NYAN.on&&garageOn&&BURN.k>.03)?BURN.k:0; // …et au BURN-OUT le chat boost sur place : son arc-en-ciel sort de la poupe et suit la caisse dans le donut
   rainbowApercu(dt,a9||bk9>0,camera,Math.max(a9?(k9==null?1:k9):0,bk9));if(a9)on=false;}
  {const d9=on?cosmSur('trainee'):null,w9=!!(d9&&(d9.wow||(d9.id==='nitro'&&WOWT.caisse)));wowApercu(dt,w9);if(w9)on=false;}
  {const d9=on?cosmSur('trainee'):null,p9=d9&&d9.pop||null;trxApercu(dt,p9,k9);if(p9&&d9.rubOff)on=false;} // (2026-10-14) LES TRAÎNÉES POP s'essaient en vrai (le ruban d'aperçu reste, à leur couleur, sauf pour celles qui n'en ont pas) // (2026-10-14) LA TRAÎNÉE WOW s'essaie en vrai
  if(!on){for(const r of TRPV.r)r.m.visible=false;silApercu(0,false);return;}
  if(silApercu(dt,true,k9)){for(const r of TRPV.r)r.m.visible=false;return;} // (2026-10-16, TRAÎNÉES) la VRAIE traînée de lumière, depuis les feux (la bande d'avant reste en repli)
  const N=36;
  if(!TRPV.r.length)for(let k=0;k<2;k++){
    const g=new THREE.BufferGeometry(),pos=new Float32Array(N*2*3),col=new Float32Array(N*2*3),idx=[];
    for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.frustumCulled=false;m.renderOrder=3;scene.add(m);TRPV.r.push({m:m,pos:pos,col:col});}
  TRPV.t+=dt;
  const d=cosm('trainee'),sp=CARS[garageI]||CARS[0],rgb=d&&d.rgb?d.rgb:[1.2,.62,.10],arc=d&&d.rainbow;
  for(let k=0;k<2;k++){const R=TRPV.r[k],sd=k?1:-1;R.m.visible=true;
    for(let i=0;i<N;i++){const u=i/(N-1),w=.2*(1-u)+.035,fa=Math.pow(1-u,1.6)*.8*Math.min(1,u*9+.35)*(k9==null?1:k9); // (2026-09-30, revue des écrans) plus fin, plus doux, fondu dès la tuyère : on voit la couleur, plus un pavé orange
      const x=sd*sp.w*.22+Math.sin(u*3.2-TRPV.t*4.5)*.35*u+sd*u*.5,y=.43+Math.sin(u*2.4-TRPV.t*3.2)*.22*u+u*.35,z=-(sp.l/2+.28)-u*9;
      for(const e of [-1,1]){TRPV.v1.set(x,y+e*w,z);carGroup.localToWorld(TRPV.v1);const o=(i*2+(e>0?1:0))*3;R.pos[o]=TRPV.v1.x;R.pos[o+1]=TRPV.v1.y;R.pos[o+2]=TRPV.v1.z;
        if(arc)TRPV.c.setHSL((u*1.2+(e>0?.08:0)-TRPV.t*.25)%1,1,.55);else TRPV.c.setRGB(rgb[0],rgb[1],rgb[2]);
        R.col[o]=TRPV.c.r*fa;R.col[o+1]=TRPV.c.g*fa;R.col[o+2]=TRPV.c.b*fa;}}
    R.m.geometry.attributes.position.needsUpdate=true;R.m.geometry.attributes.color.needsUpdate=true;}
}
/* LA VITRINE DE L'ACCUEIL (2026-09-25, user, capture à l'appui : « c'est moche ça »). Au menu, rien ne pilotait la caméra :
   elle restait figée au-dessus de la route, visée nulle part — un disque lumineux sur du noir, pas de voiture. Désormais
   un PLAN DE CINÉMA : ta caisse posée sur la route, filmée en contre-plongée trois-quarts avant, la caméra qui tourne
   lentement autour, la ville et ses tours derrière. Jamais pendant une partie ni au garage. */
/* LA VITRINE AU COUCHANT (2026-09-26, vague 2) — MESURÉ : l'écran n°1 du jeu (et la capture App Store n°1) montrait un dégradé bleu
   et une route noire — le ciel du niveau tiré au hasard, pris de 1,9 m, l'horizon au milieu de l'image. Désormais la vitrine a SON
   heure : le COUCHANT et la mer de nuages, posés hors du voyage BIO (BIO.cur reste le ciel du niveau, rendu dès qu'on quitte l'accueil :
   voir menuVitrineFin, et openGarage/closeGarage). Le PLAN se cherche une fois par piste, sur toute sa longueur : une portion droite
   et à plat (la piste part souvent en rampe : la caméra filmait le ciel à 20° de tangage), dégagée (ni pièce, ni plot, ni nuage contre
   l'objectif), et le trois-quarts avant SERRÉ qui met le soleil à ~23° de la caisse — hors du champ (un portrait ne fait que ~24° de
   large, et le « 1.61 » se battait avec le titre), mais son halo embrase le bord de l'image. La caisse est garée au BORD de la route
   (56 m de bitume noir mangeaient toute la moitié basse) et filmée de l'intérieur vers le dehors : derrière elle, le liseré, le vide, la
   mer de nuages et, souvent, un gros cumulus. Caméra à 4 m, visée au-dessus du toit : l'horizon au tiers haut, la caisse vers 60-65 %
   de la hauteur, entre le titre et JOUER — une affiche. Le balancier reste (la vitrine vit) mais il est BORNÉ : la caisse ne sort plus
   par le bord. Hook : `dbgVitrine(cible)` (l'écart visé au soleil, en radians). Banc : scratchpad gfx2-etal/menu.js. */
const MENUV={t:0,cam:new THREE.Vector3(),vis:new THREE.Vector3(),p:new THREE.Vector3(),bio:false,pas:-1,L:-1,s:60,a0:.55,sg:1,lat:0,cible:.4};
// (2026-09-28, Sacha : « les couleurs de l'écran de début sont bof, je préfère le ciel en journée, il matche mieux avec les couleurs
// du jeu rose, bleu, jaune ») le JOUR des NUAGES (celui de la course, validé le 27/09) au lieu du couchant : bleu-violet au zénith,
// bande rose, nuages clairs — le magenta, le cyan et l'or de l'interface s'y lisent mieux. Comparé en captures : couchant · matin ·
// midi · aprem · aurore · lever (aprem/aurore délavent la caisse, lever retombe dans le rouge du couchant). Le voile du haut de
// l'accueil (#overlay::after) a été allégé du même coup : à .84 il éteignait le zénith.
let MENU_BIO='matin';
window.dbgAmb=function(n,o){n=n||MENU_BIO;const B=BIOMES[n];if(!B)return null;if(o&&typeof o==='object')Object.assign(B,JSON.parse(JSON.stringify(o))); // (2026-09-30, dev) retoucher une ambiance à chaud : dbgAmb('matin',{jZen:[…]})
  MENUV.bio=false;if(BIO.name===n||BIO.to===B){bioLerp(B,B,1,BIO.cur);bioApply(BIO.cur);paintEnv(B.env,B.eS1,B.eS2);BIO.pas=(BIO.pas|0)+1;}
  return JSON.parse(JSON.stringify(B));};
/* (2026-10-14, passe graphismes · chaîne de couleur) banc ET téléphone : `dbgChaine()` dit ce que CET appareil exécute vraiment — palier, cran,
   résolution, cible du composer (demi-flottant ou repli 8 bits), passes, halo, piqué, et les uniformes d'étalonnage posés. À lire sur l'iPhone
   (Safari → Développement) pour savoir si l'image jugée est celle qu'on règle. */
window.dbgChaine=function(){const U=acesPass&&acesPass.uniforms,r=function(v){return v&&v.toArray?v.toArray().map(function(x){return +x.toFixed(3);}):v;},rt=composer&&composer.renderTarget2;
  return {tel:IS_MOBILE,basDeGamme:IS_LOW_END,palier:PAL.n,palierSrc:PAL.src,cran:QL.k,bornes:qlBornes(),dpr:+curDPR.toFixed(3),dprEcran:devicePixelRatio,plafond:DPR_CAP,qualite:(typeof SAVE!=='undefined'&&SAVE.d)?SAVE.d.q:null,vhd:VHD.on,
    post:POST_ON,cible:rt?(rt.texture.type===THREE.HalfFloatType?'demi-flottant':'8 bits (repli : clairs écrêtés AVANT le tone mapping)'):null,toile:[renderer.domElement.width,renderer.domElement.height],
    halo:bloomPass?{actif:bloomPass.enabled,force:+bloomPass.strength.toFixed(3),seuil:bloomPass.threshold,rayon:bloomPass.radius,res:BLOOM_RES,etages:bloomPass._nM,base:[bloomPass.renderTargetsVertical[0].width,bloomPass.renderTargetsVertical[0].height],norme:bloomPass.norme,alpha:+(bloomPass._a||0).toFixed(3)}:null,
    reduireAnimations:REDUCED_MOTION,ombre:[sun.shadow.mapSize.x,renderer.shadowMap.type===THREE.PCFSoftShadowMap?'douce':'simple'],flouRadial:FLOU_OK,fxaa:FXAA_ON,gradeTel:GRADE_ACES,
    etal:U?{expo:+U.uExposure.value.toFixed(3),sat:+U.uSat.value.toFixed(3),con:+U.uContrast.value.toFixed(3),vivid:U.uVivid.value,wb:r(U.uWB.value),sh:r(U.uSh.value),hi:r(U.uHi.value),vigK:+U.uVigK.value.toFixed(3),vigC:r(U.uVigC.value),pique:+U.uSharp.value.toFixed(3),trame:+(U.uTrame.value*255).toFixed(2)}:null};};
window.dbgCielObj=function(){return {ROAD_U:ROAD_U,ROUTE_JOUR:ROUTE_JOUR,CHUTE_P:CHUTE_P,horizonGlow:horizonGlow,sunSprite:sunSprite,RAYS:RAYS,CLOUD_MAT:CLOUD_MAT,COTON:COTON,GFX_U:GFX_U,skyU:skyU,fog:scene.fog,aces:acesPass,LVL:LVL,BIO:BIO,hemi:hemi,sun:sun,fill:fill,kick:kick};}; // (2026-09-30, dev) disséquer le ciel au banc
window.dbgMenuCiel=function(b){if(b&&BIOMES[b]){MENU_BIO=b;MENUV.bio=false;}return MENU_BIO;}; // (dev) essayer un autre ciel d'accueil : dbgMenuCiel('matin')
function menuPlan(){ // le meilleur couple (position, angle) pour filmer la caisse devant le couchant — une fois par piste
  MENUV.L=L;let best=9;const sx=SUN_DIR.x,sz=SUN_DIR.z,sn=Math.hypot(sx,sz);
  for(let s9=100;s9<=L-160;s9+=s9<600?20:60){
    frameAt(s9-60,F);const ax=F.t.x,az=F.t.z,ny0=F.n.y;frameAt(s9+60,F);const bx=F.t.x,bz=F.t.z,ny1=F.n.y;
    frameAt(s9,F);const plat=Math.min(ny0,ny1,F.n.y),droit=ax*bx+az*bz;
    if(plat<.96||droit<.8)continue;                                                      // ni rampe, ni épingle (la piste part souvent en rampe : la caméra filmait le ciel à 20° de tangage)
    const ld9=Math.max(0,ROAD_HALF-7);let eG=0,eD=0;                                     // rien devant l'objectif : une pièce posée contre la caisse la masquait
    for(const o of pickups)if(o.face>0&&Math.abs(o.s-s9)<40){if(Math.abs(o.lat+ld9)<16)eG++;if(Math.abs(o.lat-ld9)<16)eD++;}
    for(const c of CLOUDS){const q=c.g.position,ry=Math.max(1,c.ry||c.r);                 // ni un nuage contre l'objectif (une masse floue qui mange l'affiche)
      for(const sd of [-1,1]){const px=F.p.x+F.b.x*ld9*sd-q.x,py=F.p.y+F.b.y*ld9*sd-q.y,pz=F.p.z+F.b.z*ld9*sd-q.z,rr=c.r+60,rv=ry+60;
        if((px*px+pz*pz)/(rr*rr)+py*py/(rv*rv)<1){if(sd<0)eG++;else eD++;}}}
    for(let a9=-.65;a9<=.66;a9+=.05){if(Math.abs(a9)<.38)continue;                      // un trois-quarts avant SERRÉ : la caisse tient dans la largeur d'un portrait (plus large, l'arrière sortait du cadre)
      const lx=-(Math.cos(a9)*F.t.x+Math.sin(a9)*F.b.x),lz=-(Math.cos(a9)*F.t.z+Math.sin(a9)*F.b.z),ln=Math.hypot(lx,lz)||1;
      const ang=Math.acos(Math.max(-1,Math.min(1,(lx*sx+lz*sz)/(ln*sn))));             // l'écart entre le regard et le soleil
      const sc=Math.abs(ang-MENUV.cible)+(1-plat)*8+(1-droit)*.6+(s9-100)*.00001+((a9<0?eD:eG)>0?1:0); // le soleil là où on le veut, une portion plate et droite, dégagée, près du départ
      if(sc<best){best=sc;MENUV.s=s9;MENUV.a0=a9;}}}
  MENUV.sg=MENUV.a0<0?-1:1;
  MENUV.lat=-MENUV.sg*Math.max(0,ROAD_HALF-7); // garée du côté où l'on regarde : la caméra reste sur le bitume, le regard file vers le dehors
}
function menuVitrineFin(){ // on quitte l'accueil : le ciel du niveau reprend la main
  MENUV.bio=false;bioApply(BIO.cur);paintEnv(BIO.to.env,BIO.to.eS1,BIO.to.eS2);skyU.uMer.value=LVL.mer;
}
/* LES PLANS DE L'ACCUEIL (2026-09-28, Sacha : « j'aime bien les boutons et la DA, mais ce qui est affiché à l'écran n'est pas ouf —
   l'image derrière pourrait faire de meilleurs plans, mieux cadrer »). MESURÉ aux captures (844×390 et 390×844) :
   · en PAYSAGE (ce que l'ordi montre) la caisse était filmée au CENTRE, pile derrière le logo et les tuiles : on ne la voyait JAMAIS ;
   · une dalle de bitume noir mangeait la moitié basse (caméra à 4 m au-dessus de la route, regard plongeant) ;
   · au premier instant la caméra arrivait d'en haut, lissée depuis la pose de rebuildMenuScene : une plongée zénithale bizarre.
   LE REMÈDE, en trois temps :
   (1) LA CAISSE VA LÀ OÙ L'INTERFACE LAISSE DE LA PLACE. `menuCadre()` lit les boîtes du logo, des tuiles et de JOUER (une fois par
       seconde, jamais à chaque image : c'est une lecture de mise en page) et en tire la zone libre — la plus large BANDE LATÉRALE en
       paysage, la bande du MILIEU (entre le logo et les tuiles) en portrait. Le plan vise la caisse, puis la caméra PIVOTE (lacet +
       tangage, exacts : atan(ndc × tan(demi-champ))) pour la poser au centre de cette zone, et la DISTANCE est calculée pour qu'elle
       en remplisse la largeur (sa sphère englobante projetée — plus un « ×1,9 + 5,2 » à l'œil).
   (2) TROIS PLANS EN COUPES FRANCHES, comme un réalisateur (le balancier unique lassait) : AFFICHE (trois-quarts avant, BAS, le couchant
       derrière — l'angle cherché par menuPlan) · ARRIÈRE (trois-quarts arrière bas : la route qui file devant la caisse vers l'horizon)
       · PROFIL (plein côté à hauteur de roue, focale longue : la silhouette sur la mer de nuages). Chacun a son mouvement lent ; à la
       COUPE la caméra est POSÉE, jamais lissée depuis le plan d'avant (on verrait le travelling de raccord). À chaque coupe le plan
       choisit son CÔTÉ (miroir) : celui où le SOLEIL reste hors de l'image finale, pivot compris (`menuSoleilVu` le projette) — le
       « 1.61 » se battait avec le logo. Écarté après captures : un plan DRONE depuis le vide
       (plongée à 35-40° : que du noir sous la caisse).
   (3) Caméras BASSES : moins de bitume, plus de ciel. Et la lampe de vitrine est DOSÉE par plan (`lum`) : pile en face d'un profil,
       à 3,4, elle délavait la carrosserie en rose pâle.
   Hook : `dbgVitrine()` rend aussi le plan en cours et la cible à l'écran ; `dbgVitrine(null,'profil')` force un plan (dev). */
const MENU_PLANS=[{n:'affiche',t:8,fov:44,lum:4.4},{n:'arriere',t:7,fov:40,lum:2.9},{n:'profil',t:7,fov:30,lum:.7}]; // lum : le PROFIL a le soleil dans le dos (on le garde hors champ) — il éclaire déjà tout le flanc
MENUV.pl=0;MENUV.pt=0;MENUV.force=null;MENUV.lum=3.4;MENUV.sd=null;MENUV.cadreT=-1;MENUV.cadre={nx:0,ny:-.1,fr:.6,fh:.4,t:-9e9};
MENUV.retour=false; // (2026-09-28) vrai entre le bouton MENU de l'écran de mort et le départ suivant (voir accueilRetour)
function menuZoneSure(){ // les marges d'encoche du moment, en px (--sT/--sB/--sL/--sR : l'iPhone, ou la colonne de l'ordi qui l'imite)
  let e=menuZoneSure.e;
  if(!e){e=menuZoneSure.e=document.createElement('div');e.setAttribute('aria-hidden','true');
    e.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:var(--sT) var(--sR) var(--sB) var(--sL)';
    document.body.appendChild(e);}
  const c=getComputedStyle(e);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0};
}
function menuCadre(){ // la zone de l'écran que l'interface laisse libre → où poser la caisse (NDC) et quelle place elle y prend
  const W=innerWidth,H=Math.max(1,innerHeight),C=MENUV.cadre,T0=performance.now();
  if(T0-C.t<1000&&C.W===W&&C.H===H)return C;C.t=T0;C.W=W;C.H=H; // (2026-10-14, chasse aux bugs) le cache tient 1 s À TAILLE ÉGALE : iPhone tourné, la caisse gardait 1 s le cadrage de l'ancienne orientation
  const home=document.getElementById('mHome');
  let x0=W,x1=0,tB=H*.22,iT=H*.74,vu=false;
  if(home&&home.classList.contains('on')&&home.getClientRects().length){
    for(const q of ['.mTitle','.mOutils','.mIcons','.mPlay']){const e=home.querySelector(q);if(!e)continue;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;
      vu=true;x0=Math.min(x0,r.left);x1=Math.max(x1,r.right);if(q==='.mTitle')tB=r.bottom;if(q==='.mOutils'||q==='.mIcons')iT=Math.min(iT===H*.74?1e9:iT,r.top);}} // (2026-09-28) la rangée MISSIONS · ⚙ ferme la bande de la caisse par le bas
  if(!vu){C.nx=0;C.ny=-.12;C.fr=W>H?.34:.62;C.fh=.4;return C;} // (menu PC, ?pc=1) : au centre, comme avant
  /* (2026-10-01, Léo : « la voiture pas bien calée ») LA BANDE SE COMPTE DANS LA ZONE SÛRE : couché, l'encoche mange 47 px d'un côté
     — la bande comptait depuis le bord de l'écran, la caisse venait se coller contre l'encoche (banc cadrage.mjs : 59 px du bord de
     l'image, 12 de l'encoche). Et elle se pose au MILIEU de la hauteur utile (à −0,2 elle laissait le haut de la bande vide). */
  const Z=menuZoneSure(),gL=x0-Z.l,gR=W-Z.r-x1;
  if(W>H*1.15&&Math.max(gL,gR)>W*.14){ // PAYSAGE : la plus large bande latérale, la caisse au milieu de sa hauteur utile
    const dr=gR>=gL,bw=dr?gR:gL,cx=dr?x1+bw*.5:Z.l+bw*.5,cy=Z.t+(H-Z.t-Z.b)*.47; // (la caisse plonge, nez en bas : son ancre un rien au-dessus du milieu)
    C.nx=cx/W*2-1;C.ny=-(cy/H*2-1);C.fr=Math.min(.8,bw*.78/W);C.fh=.5;
  }else{ // PORTRAIT : la bande entre le bas du logo et le haut des tuiles
    const top=Math.min(tB,iT-40),cy=top+(iT-top)*.56; // un rien sous le milieu de la bande : la caisse pose sur la ligne d'horizon, le ciel au-dessus
    C.nx=0;C.ny=-(cy/H*2-1);C.fr=.62;C.fh=Math.max(.12,(iT-top)/H*.8);
  }
  return C;
}
const MENU_SOL=new THREE.Vector3();
function menuPose(P,C,sd,u,d,tH,tV){ // pose la caméra du plan P, côté `sd` (±1), à l'instant u ∈ [0,1] — la caisse dans la zone libre
  if(P.n==='affiche'){ // trois-quarts avant, bas — l'angle de menuPlan, qui tourne à peine
    const a=sd*(Math.min(.72,Math.max(.36,Math.abs(MENUV.a0)))+(u-.5)*.16);
    MENUV.cam.copy(MENUV.p).addScaledVector(F.t,Math.cos(a)*d).addScaledVector(F.b,Math.sin(a)*d).addScaledVector(F.n,1.7+u*.3);
  }else if(P.n==='arriere'){ // trois-quarts arrière bas : la route qui file devant la caisse, vers l'horizon
    const a=sd*(.55+(u-.5)*.14);
    MENUV.cam.copy(MENUV.p).addScaledVector(F.t,-Math.cos(a)*d).addScaledVector(F.b,Math.sin(a)*d).addScaledVector(F.n,1.45);
  }else{ // PROFIL : plein côté à hauteur de roue, focale longue, lent travelling avant
    MENUV.cam.copy(MENUV.p).addScaledVector(F.b,sd*d).addScaledVector(F.t,(u-.5)*d*.28).addScaledVector(F.n,1.05);
  }
  camera.position.copy(MENUV.cam);
  camera.up.set(0,1,0); // l'horizon de niveau : c'est une photo, pas une poursuite
  camera.lookAt(MENUV.vis);
  camera.rotateY(Math.atan(C.nx*tH));  // la caisse glisse vers la zone libre (lacet exact) …
  camera.rotateX(-Math.atan(C.ny*tV)); // … et à la bonne hauteur (tangage exact)
}
function menuSoleilVu(){ // le soleil « 1.61 » tombe-t-il dans l'image FINALE (pivot compris) ? Rend 0 hors champ, sinon sa proximité du centre
  camera.updateMatrixWorld();
  MENU_SOL.copy(camera.position).addScaledVector(SUN_DIR,1e4).project(camera);
  if(MENU_SOL.z>1)return 0; // derrière la caméra
  const ex=Math.abs(MENU_SOL.x),ey=Math.abs(MENU_SOL.y);
  return (ex<1.25&&ey<1.25)?2.5-ex-ey:0; // (marge : le halo déborde du disque)
}
function menuCamera(dt){
  MENUV.pt+=dt;
  let P=MENU_PLANS[MENUV.pl],coupe=MENUV.sd==null;
  if(MENUV.force){const k=MENU_PLANS.findIndex(q=>q.n===MENUV.force);if(k>=0&&k!==MENUV.pl){MENUV.pl=k;MENUV.pt=0;P=MENU_PLANS[k];coupe=true;}}
  else if(MENUV.pt>P.t){MENUV.pl=(MENUV.pl+1)%MENU_PLANS.length;MENUV.pt=0;P=MENU_PLANS[MENUV.pl];coupe=true;} // LA COUPE
  const C=menuCadre(),sp=CARS[level]||CARS[0],u=Math.min(1,MENUV.pt/P.t);
  if(C.t!==MENUV.cadreT){MENUV.cadreT=C.t;coupe=true;} // la mise en page a bougé (rotation, redimensionnement) : on re-choisit
  const R9=.5*Math.hypot(sp.l||4.2,sp.w||1.9,(sp.h||.8)+.6); // la sphère englobante de la caisse (roues et aileron compris)
  camera.fov=P.fov;camera.updateProjectionMatrix();
  const tV=Math.tan(camera.fov*Math.PI/360),tH=tV*camera.aspect;
  // la distance qui lui donne la largeur de la zone libre (et jamais plus haute que la bande). ×1,3 : MESURÉ aux captures, en trois-quarts
  // la caisse projetée est ~30 % plus large que sa sphère (le nez, plus près, grossit) — sans lui elle sortait par le bord
  const d=Math.max(R9*1.3/(C.fr*tH),R9*.8/(C.fh*tV));
  MENUV.vis.copy(MENUV.p).addScaledVector(F.n,.75);
  MENUV.lum=P.lum;
  if(coupe){ // LE CÔTÉ se choisit À LA COUPE, sur l'image du milieu du plan, et tient tout le plan (sinon le soleil qui frôle le bord
    // du cadre ferait sauter la caméra d'un côté à l'autre en plein plan) : celui où le « 1.61 » reste HORS CHAMP, pivot compris.
    // À égalité : le côté de la route (la caméra sur le bitume plutôt qu'au-dessus du vide).
    let best=1e9;
    for(const sd of [MENUV.sg,-MENUV.sg]){menuPose(P,C,sd,.5,d,tH,tV);const v=menuSoleilVu()+(sd===MENUV.sg?0:.01);if(v<best){best=v;MENUV.sd=sd;}}
  }
  menuPose(P,C,MENUV.sd,u,d,tH,tV); // POSÉE : chaque plan est une fonction lisse du temps, la coupe est franche
}
function menuVitrine(dt){
  MENUV.t+=dt;
  if(!MENUV.bio||MENUV.pas!==BIO.pas){if(!MENUV.bio)paintEnv(BIOMES[MENU_BIO].env,BIOMES[MENU_BIO].eS1,BIOMES[MENU_BIO].eS2);MENUV.bio=true;MENUV.pas=BIO.pas;bioApply(BIOMES[MENU_BIO]);} // (bioStep a pu repeindre le ciel du niveau cette image : on repasse derrière)
  try{finMenu(BIOMES[MENU_BIO]);}catch(e){} // (2026-10-20) la caisse aussi belle qu'au garage : le ciel du menu en reflets nets + le vernis profond (voir finition.js)
  skyU.uMer.value=1; // la mer de nuages sous l'horizon, même si le niveau du dessous (auto-école) a le ciel nu
  if(MENUV.L!==L){menuPlan();MENUV.sd=null;}
  const S9=Math.min(L-10,MENUV.s);frameAt(S9,F);
  MENUV.p.copy(F.p).addScaledVector(F.b,MENUV.lat);carGroup.position.copy(MENUV.p);
  mat4.makeBasis(tmp.crossVectors(F.n,F.t).normalize(),F.n,F.t);carGroup.quaternion.setFromRotationMatrix(mat4);carGroup.visible=true;
  menuCamera(dt); // LES PLANS (voir menuCamera) : le réalisateur pose la caméra, la caisse va là où l'interface laisse de la place
  if(landMark)landMark.visible=false;
  // L'ÉCLAIRAGE DE VITRINE : une lumière douce côté caméra (la carrosserie se lit), un contre-jour rose derrière (la silhouette se détache)
  carLight.position.copy(MENUV.cam).addScaledVector(F.n,2.5);carLight.intensity=MENUV.lum;carLight.distance=60; // (vague 2) 2,4 → 3,4 : au couchant la caisse est à contre-jour, la lampe de vitrine la sort de l'ombre
  nitroLight.position.copy(MENUV.p).addScaledVector(F.t,-4).addScaledVector(F.n,2.2);nitroLight.color.setHex(0xff4fb0);nitroLight.intensity=1.6;
  headSpot.intensity=1.6;
}
/* LE FEU PIXEL de la porte (voir buildGarageRoom). La palette : de la fumée rougie (0 — jamais un trou noir) aux braises, à l'orange, au
   jaune, au blanc ; 36 crans. */
/* LE FEU DE LA PORTE v3 — PIXEL PREMIUM (2026-09-30, Léo : « plus discret, les flammes, là ça fait cheap ; un rendu pixel premium ; et les
   flammes dépassent le haut de la porte »). Le feu de DOOM (chaleur qui monte case par case, pertes au hasard) remplissait la porte
   jusqu'au linteau et grésillait comme une neige de télé. Ici les flammes sont DESSINÉES, comme en pixel art soigné :
   · une HAUTEUR par colonne (deux houles lentes + des LANGUES : sinus élevé au cube, qui naissent, montent et se séparent), ~45 % de la
     porte au repos, ~80 % au LÂCHER, jamais plus de 90 % (la pointe reste sous le linteau) ;
   · la colonne lue ONDULE avec la hauteur (deux sinus qui montent) : les langues se tordent en montant ;
   · l'intensité (1 au seuil → 0 à la pointe) tombe dans SEPT BANDES franches (`FEU_PAL` : rouge sombre, rouge, vermillon, orange,
     ambre, jaune, cœur pâle) — des contours nets, pas de case isolée ;
   · au-dessus, une FUMÉE sombre en TRAMAGE ordonné (Bayer 4 × 4, quatre tons) qui rougeoit un peu près des flammes ; quelques BRAISES
     d'une case qui montent en se balançant (rares au repos, une gerbe au lâcher).
   Tout reste un plan opaque, une texture de 96 × 48, NearestFilter : 4 608 cases, ~2 sinus chacune, 30 pas/s — rien. */
const FEU_PAL=[[92,16,22],[148,28,28],[204,58,30],[236,104,36],[255,152,52],[255,204,102],[255,238,186]];
const FEU_BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
/* LE BRASIER DU CENTRE (2026-10-04, Léo : « intéressant, mais le milieu sombre un peu dérangeant ») : le centre de l'ouverture n'est plus
   une fumée noire mais un BRASIER orange qui ondule — cinq tons en pixels francs, des nappes de chaleur qui montent lentement, tramées
   (Bayer). Il reste SOUS les langues (moins clair que l'orange des flammes) : les flammes des quatre bords et les cubes se lisent dessus.
   Chaque case prend la plus claire des deux couleurs, la flamme ou le brasier. */
const FEU_BRASIER=[[112,24,20],[138,34,22],[164,47,24],[188,62,27],[208,80,31]];
/* LES FLAMMES EN CUBES (2026-10-04, Léo : « enlève la porte, remets des flammes pixelisées façon Minecraft, plus CUBE ; travaille les
   couleurs, la brillance, la transparence — des pixels cubes satisfaisants » · « des flammes dans TOUS LES SENS : là ça sort d'en bas, je
   veux que ça vienne d'en haut, des côtés — et d'en bas »). Le rideau peint (feuPixPas) reste DERRIÈRE, plus sombre, et brûle désormais
   depuis les QUATRE bords ; devant lui, des CUBES de feu (`GAR.feuC`, garFeuCubes) :
   · ils NAISSENT sur les quatre bords de l'ouverture — le seuil, le linteau, les deux montants — groupés en LANGUES qui glissent le long du
     bord (un sinus au carré : on n'en sème que là où il est haut), et partent VERS L'INTÉRIEUR ;
   · le feu MONTE : une poussée vers le haut sur tous — ceux du linteau plongent puis se RECOURBENT vers le haut, ceux des montants filent
     vers le centre en s'élevant ; un tourbillon latéral les fait onduler ;
   · des cubes de 34 cm (à 12 m, la caméra de l'atelier doit LIRE un cube, pas un point) posés sur une GRILLE de 17 cm : ils sautent de
     case en case, ils ne glissent pas ; quatre couches de profondeur, et un sur trois sort de la porte vers l'atelier ; jamais tournés ;
   · six BANDES de couleur par âge (`FEU_CUBES.pal` : cœur blanc chaud → jaune → orange → vermillon → rouge → braise), au-delà de 1 pour
     les premières (le halo du post les attrape), et la TAILLE qui fond par crans avec l'âge ;
   · au LÂCHER (`GAR.feu.k`) : deux fois plus de flammes, plus loin, plus vives.
   `FEU_CUBES.on=false` rend le rideau seul. `dbgFeu()` rend aussi le nombre de cubes. */
const FEU_CUBES={on:true,N:760,c:.34,pas:.17,
  pal:[[2.1,1.85,1.2],[1.95,1.32,.34],[1.65,.7,.12],[1.22,.34,.06],[.92,.2,.06],[.66,.13,.05]], // (brasier) les deux dernières éclaircies : sur l'orange du centre, une braise trop sombre se lisait comme une tache
  taille:[1,.95,.84,.7,.55,.38],seuils:[.8,.62,.44,.27,.12],
  X0:-4.62,X1:4.62,Y0:.04,Y1:4.6};
function feuCubeNait(C,t,k){
  const Q=FEU_CUBES,P=C.p,o=C.n*9,r=Math.random()*(1.25+.55+.45+.45);
  const e=r<1.25?0:r<1.8?1:r<2.25?2:3;                                        // 0 seuil · 1 linteau · 2 montant gauche · 3 montant droit
  let u=0;for(let n=0;n<4;n++){u=Math.random();const s9=Math.sin(u*(e<2?17:9)+t*(e&1?-1.7:2.1)+e*1.9),pr=.18+.82*(s9>0?s9*s9:0);if(Math.random()<pr)break;} // les LANGUES
  const W=Q.X1-Q.X0,Hh=Q.Y1-Q.Y0,f=1+.45*k;
  let x,y,vx,vy;
  if(e===0){x=Q.X0+u*W;y=Q.Y0;vx=(Math.random()-.5)*.5;vy=(1.7+1.5*Math.random())*f;}
  else if(e===1){x=Q.X0+u*W;y=Q.Y1;vx=(Math.random()-.5)*.5;vy=-(1.2+1.1*Math.random())*f;}
  else{x=e===2?Q.X0:Q.X1;y=Q.Y0+u*Hh*.96;vx=(e===2?1:-1)*(1.15+1.05*Math.random())*f;vy=.3*Math.random();}
  P[o]=x;P[o+1]=y;P[o+2]=C.z0+[-.26,-.06,.14,.3][(Math.random()*4)|0];P[o+3]=vx;P[o+4]=vy;
  const L=.5+.55*Math.random()+.25*k;P[o+5]=L;P[o+6]=L;P[o+7]=.75+.5*Math.random();P[o+8]=Math.random()<.33?-(.4+1.3*Math.random()):0;C.n++; // un sur trois SORT de la porte, vers l'atelier
}
function garFeuCubes(dt){
  const C=GAR.feuC,F=GAR.feu,Q=FEU_CUBES;if(!C||!F)return;
  if(!Q.on){if(C.n){C.n=0;C.A.count=C.B.count=0;}return;}
  {const v9=!GAR.porte||GAR.porte.e>.5;if(C.A.visible!==v9)C.A.visible=C.B.visible=v9;} // porte fermée : les cubes la traverseraient — ils attendent qu'elle s'ouvre (le feu se voit par les hublots)
  dt=Math.min(dt,.05);const k=F.k,t=F.t,P=C.p,M=C.m,col=C.A.instanceColor.array;
  C.acc+=dt*(250+520*k)*(REDUCED_MOTION?.5:1);
  while(C.acc>=1){C.acc-=1;if(C.n>=Q.N){C.acc=0;break;}feuCubeNait(C,t,k);}
  const D=.78+.4*k,dr=Math.exp(-1.3*dt);
  for(let i=0;i<C.n;i++){let o=i*9;
    P[o+5]-=dt;
    if(P[o+5]<=0||P[o+1]>Q.Y1+.3||P[o+1]<-.1){C.n--;if(i<C.n){P.copyWithin(o,C.n*9,C.n*9+9);i--;}continue;} // la dernière prend sa place
    const x=P[o],y=P[o+1];
    P[o+3]=P[o+3]*dr+Math.sin(y*3.1+t*4.3+x*.7)*1.3*dt;                        // le tourbillon
    P[o+4]+=1.75*dt;                                                            // le feu MONTE (le linteau plonge puis se recourbe)
    P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+8]*dt;
    const a=P[o+5]/P[o+6],b=a>Q.seuils[0]?0:a>Q.seuils[1]?1:a>Q.seuils[2]?2:a>Q.seuils[3]?3:a>Q.seuils[4]?4:5;
    const sz=Q.c*Q.taille[b]*P[o+7],xs=Math.round(P[o]/Q.pas)*Q.pas,ys=Math.round(P[o+1]/Q.pas)*Q.pas;  // sur la GRILLE : des cases, pas un glissé
    M.makeScale(sz,sz,sz);M.elements[12]=xs;M.elements[13]=ys;M.elements[14]=Math.round(P[o+2]/Q.pas)*Q.pas;C.A.setMatrixAt(i,M);
    const c=Q.pal[b];col[i*3]=c[0]*D;col[i*3+1]=c[1]*D;col[i*3+2]=c[2]*D;}
  C.A.count=C.B.count=C.n;C.A.instanceMatrix.needsUpdate=true;C.A.instanceColor.needsUpdate=true;
}
function feuPixPas(F){
  const W=F.W,H=F.H,t=F.t,k=F.k,hh=F.h,px=F.img.data,dt=F.dt||1/30;
  /* (2026-10-04, Léo : « des flammes dans tous les sens ») le rideau brûle depuis les QUATRE bords : le seuil (hh), le linteau (hT), les
     deux montants (sG, sD) — chacun ses langues ; derrière les cubes, un cran plus sombre (D). */
  const hT=F.hT||(F.hT=new Float32Array(W)),sG=F.sG||(F.sG=new Float32Array(H)),sD=F.sD||(F.sD=new Float32Array(H));
  const top=.34+.3*k;                                                        // la hauteur moyenne des flammes du seuil (part de la porte)
  for(let x=0;x<W;x++){const u=x/(W-1);
    let h=top*(.7+.17*Math.sin(u*7.1+t*.9)+.13*Math.sin(u*13.3-t*1.45));
    const tg=Math.sin(u*23+t*2.3+1.7*Math.sin(u*6.2-t*.8));h+=top*.45*tg*tg*tg*(tg>0?1:0); // les LANGUES
    hh[x]=Math.min(.8,h);
    const tt=Math.sin(u*19-t*1.9+1.3*Math.sin(u*5.1+t*.7));hT[x]=(.17+.12*k)*(.75+.25*Math.sin(u*9.3+t*1.1))+(.14+.08*k)*(tt>0?tt*tt*tt:0);}
  for(let y=0;y<H;y++){const v=1-(y+.5)/H,s1=Math.sin(v*14+t*2.6+1.2*Math.sin(v*4.3-t)),s2=Math.sin(v*11-t*2.2+.8);
    sG[y]=(.08+.05*k)*(.8+.2*Math.sin(v*6+t))+(.07+.04*k)*(s1>0?s1*s1*s1:0);sD[y]=(.08+.05*k)*(.8+.2*Math.sin(v*5.3-t*1.2))+(.07+.04*k)*(s2>0?s2*s2*s2:0);}
  const D=.84+.16*k;                                                         // au repos un cran plus sombre : il est là, il ne crie pas — (brasier) les langues gardent leur éclat : elles se lisent SUR le brasier
  for(let y=0;y<H;y++){const v=1-(y+.5)/H,o0=y*W;
    const ond=v*(2.1*Math.sin(v*11-t*5.2)+1.1*Math.sin(v*23-t*8.3));        // la colonne lue ondule avec la hauteur
    for(let x=0;x<W;x++){const o=(o0+x)*4,u=x/(W-1);
      let xs=Math.round(x+ond+.8*Math.sin(x*.5+t*3.3)*v);xs=xs<0?0:xs>=W?W-1:xs;
      const h=hh[xs];let I=h>0?1-v/h:-1;
      const iT=1-(1-v)/hT[xs],iG=1-u/sG[y],iD=1-(1-u)/sD[y];if(iT>I)I=iT;if(iG>I)I=iG;if(iD>I)I=iD;
      // le BRASIER : des nappes de chaleur qui montent (v − t), deux ondes lentes, le tramage, et un peu plus chaud près des langues
      const hb=.42+.17*Math.sin(u*5.3+t*.9)*Math.sin(v*4.1-t*.7)+.14*Math.sin(u*11-v*7+t*1.6)+.12*Math.sin(v*9-t*2.2+u*3.1)
        +(FEU_BAY[(y&3)*4+(x&3)]/16-.5)*.3+(I>-.6?.25*(1+I/.6):0);
      const cb=FEU_BRASIER[hb<.22?0:hb<.4?1:hb<.56?2:hb<.72?3:4],Kb=.8+.2*k;
      let r=cb[0]*Kb,g9=cb[1]*Kb,b9=cb[2]*Kb;
      if(I>0){const b=I<.1?0:I<.24?1:I<.4?2:I<.57?3:I<.74?4:I<.9?5:6,c=FEU_PAL[b];
        if(c[0]*.3+c[1]*.59+c[2]*.11>(r*.3+g9*.59+b9*.11)/D){r=c[0]*D;g9=c[1]*D;b9=c[2]*D;}} // la plus claire des deux : la langue, ou le brasier
      px[o]=r;px[o+1]=g9;px[o+2]=b9;
      px[o+3]=255;}}
  // LES BRAISES : une case qui monte et se balance, ambre → rouge → éteinte
  const E=F.em,nb=(3.5+60*k)*dt,cnt=Math.floor(nb)+(Math.random()<nb%1?1:0); // ~3,5 braises/s au repos, une gerbe au lâcher
  for(let n=0;n<cnt;n++){if(E.length>=28)break;const x0=Math.random()*W;
    E.push({x:x0,y:H*(1-hh[Math.min(W-1,x0|0)]*(.85+Math.random()*.2)),vy:-(H*(.22+Math.random()*.25)),ph:Math.random()*6.3,l:1});}
  for(let n=E.length-1;n>=0;n--){const e=E[n];e.y+=e.vy*dt;e.l-=dt*(.55+.3*Math.random());
    if(e.l<=0||e.y<1){E.splice(n,1);continue;}
    const x=Math.round(e.x+1.4*Math.sin(e.ph+t*3)),y=e.y|0;if(x<0||x>=W||y<0||y>=H)continue;
    const o=(y*W+x)*4,a=e.l;px[o]=Math.max(px[o],255*a);px[o+1]=Math.max(px[o+1],(90+110*a)*a);px[o+2]=Math.max(px[o+2],40*a);}
  F.cx.putImageData(F.img,0,0);F.tex.needsUpdate=true;
}
function garPortePose(e){ // la porte le long de son RAIL : montée verticale (0 → 4,7 m), coude de 0,28 m, puis à plat sous le plafond (−z)
  const Pt=GAR.porte;if(!Pt||e===Pt.e)return;Pt.e=e;const zD=Pt.zD;
  for(let i=0;i<5;i++){const s0=.47+.94*i,s=s0+(5.51+1.02*i-s0)*e,m=Pt.P[i];
    if(s<=4.7){m.position.set(0,s,zD);m.rotation.set(0,0,0);}
    else if(s<=5.14){const th=(s-4.7)/.44*Math.PI/2;m.position.set(0,4.7+.28*Math.sin(th),zD-.28+.28*Math.cos(th));m.rotation.set(-th,0,0);}
    else{m.position.set(0,4.98,zD-.28-(s-5.14));m.rotation.set(-Math.PI/2,0,0);}}}
function garPorte(dt){ // FERMÉE tant qu'on ne part pas ; le JOUER (GAR.go, retour de vue compris) l'ouvre en 0,8 s, en accélérant puis en freinant
  const Pt=GAR.porte;if(!Pt)return;
  Pt.k=GAR.go?Math.min(1,Pt.k+dt/.8):0;
  /* (2026-10-05, Léo : « centré sur l'entrée, sans la porte ») en VITRINE la porte se LÈVE (1,1 s) : l'entrée et le feu, en face — elle redescend
     quand on quitte la vitrine. ⚠ la porte fermée est un choix de Sacha (menu, boutique) : ici seulement en vitrine, à confirmer avec elle. */
  const vo9=(gEl&&gEl.classList.contains('vitrine')&&!gEl.classList.contains('menu'))?1:0;Pt.kv= /* (2026-10-06) ⚠ la vitrine SEULE : dans la console de Sacha la vue de Léo regarde la porte FERMÉE (son choix, voir garVueLeo) */(Pt.kv||0)+(vo9-(Pt.kv||0))*Math.min(1,dt*1.8);
  const kk9=Math.max(Pt.k,Pt.kv);garPortePose(Pt.force!=null?Pt.force:(!PORTE_FERMEE?1:kk9*kk9*(3-2*kk9))*(1-GATL.cs)); // (Pt.force : dbgPorte, le banc) — (Léo : « enlève la porte ») sans PORTE_FERMEE elle reste RELEVÉE sous le plafond : le feu se voit au menu
  const F=GAR.feu,fl=F?.82+.12*Math.sin(F.t*9.1)+.06*Math.sin(F.t*23.7):1;Pt.mH.emissiveIntensity=fl*(1-Pt.e*.6); // les hublots battent avec le feu
  const B=GAR.beau;if(B){if(B.fac)B.fac.material.opacity=.2*(.15+.85*Pt.e);if(B.braises)B.braises.visible=Pt.e>.3;} // porte fermée : la lumière du feu ne passe plus qu'au ras du sol, pas de braises
}
function garFeu(dt){ // il brûle au repos, il RUGIT pendant le lâcher (k : 0 → 1 en 1,7 s, lissé) ; 30 pas/s (12 si « réduire les animations »)
  const F=GAR.feu;if(!F)return;const G=GAR.go;
  const u=G?Math.min(1,G.t/1.7):0,k0=u*u*(3-2*u);F.k+=(k0-F.k)*Math.min(1,dt*(G?12:3));
  {const po=GAR.porte?Math.max(0,GAR.porte.e):1,db=8*F.k-9*(1-po);if(openGarage._feu&&!BQSON.atelier&&(G||GAR.porte&&Math.abs(db-(GAR.porte.db==null?99:GAR.porte.db))>.3)){if(GAR.porte)GAR.porte.db=db;try{openGarage._feu.gain(db,.05);}catch(e){}}} // le feu GRONDE quand la caisse entre dedans — (2026-09-30) ÉTOUFFÉ derrière la porte fermée
  if(GAR.feuLu)GAR.feuLu.material.opacity=Math.min(1,(.16+.03*Math.sin(F.t*9.1)+.02*Math.sin(F.t*23.7))*(1+F.k*2.4)*(.4+.6*(GAR.porte?Math.max(0,GAR.porte.e):1))); // (v3, Léo : « le sol ») .42 → .16 au repos, elle monte au lâcher ; (porte fermée : la lueur qui passe SOUS la porte)
  try{garFeuCubes(dt);}catch(e){}
  const pas=REDUCED_MOTION?1/12:1/30;F.acc+=dt;if(F.acc<pas)return;F.acc=Math.min(F.acc-pas,pas);F.t+=pas;F.dt=pas;feuPixPas(F);
}
function garBeaute(dt,t9){ // (2026-09-30) L'ATELIER v2 : ce qui vit — le feu qui éclaire et se reflète, le néon, les gyrophares, l'anneau de LED, les braises
  const B=GAR.beau;if(!B)return;const k=GAR.feu?GAR.feu.k:0,po=GAR.porte?Math.max(0,GAR.porte.e):1; // po : l'ouverture de la porte (0 fermée → 1)
  const fl=(1+.07*Math.sin(t9*9.1)+.04*Math.sin(t9*23.7)+.02*Math.sin(t9*41.3))*(1+k*1.4); // le souffle des flammes (celui de la lueur du seuil), et le RUGISSEMENT du lâcher — (Léo : « les reflets des flammes un peu forts, ça ne va pas avec l'aspect premium ; surtout le sol, et le reflet en général ») un souffle calme au repos, tout monte au lâcher
  {const d9=camera.getWorldDirection(B.cd||(B.cd=new THREE.Vector3())),w9=Math.max(0,Math.min(1,d9.z*1.25));B.reflet.visible=w9>.05;B.reflet.material.opacity=Math.min(1,.14*fl)*w9*w9*(.12+.88*po);} /* (Léo) .5 → .14 : un reflet, pas une deuxième porte en feu */ // un REFLET dépend du regard : calé sur la vue de la porte, il s'efface quand la caméra ne regarde plus la porte
  B.murG.material.opacity=B.murD.material.opacity=Math.min(1,.15*fl)*(.2+.8*po);B.plaf.material.opacity=Math.min(1,.06*fl)*(.2+.8*po); // (Léo) murs .42 → .15, plafond .16 → .06 (la façade : voir la porte, .5 → .2)
  for(const n of B.neons)n.material.opacity=.86+.1*Math.sin(t9*2.3)+(Math.random()<.004?-.5:0); // le néon respire, et hoquette parfois
  for(const G9 of B.gyro){const c=Math.cos(t9*4.2+G9.ph),c3=c>0?c*c*c:0;G9.s.material.opacity=c3*.95;G9.s.scale.x=1.2+1.6*c3;} // le faisceau qui passe
  B.led.rotation.z+=dt*(.9+k*6);B.led.material.opacity=Math.min(1,.75+.2*Math.sin(t9*3.1)+k*.6)*(.6); /* (garage-lumiere) l'anneau de LED : un liseré, pas un néon */
  const P=B.braises.geometry.attributes.position,a=P.array,v=B.bv,hd=GAR.D/2,n9=v.length/4;
  for(let i=0;i<n9;i++){const j=i*3,q=i*4;v[q+3]-=dt;
    if(v[q+3]<=0){a[j]=(Math.random()-.5)*9;a[j+1]=.2+Math.random()*2.6;a[j+2]=hd-.4; // elle naît dans le feu…
      v[q]=(Math.random()-.5)*.9;v[q+1]=.5+Math.random()*1.1;v[q+2]=-(.6+Math.random()*1.8)*(1+k*2);v[q+3]=1.4+Math.random()*2.6;}
    a[j]+=v[q]*dt+Math.sin(t9*1.7+i)*dt*.25;a[j+1]+=v[q+1]*dt;a[j+2]+=v[q+2]*dt;} // …monte, et entre dans l'atelier
  P.needsUpdate=true;
}
/* ===== LE SOLEIL DU TITRE (2026-10-25, Sacha : « l'accueil est tout le temps à la même heure ; il faut plusieurs ambiances qui s'adaptent à l'horaire de
   l'appareil, et à la saison, comme dans Animal Crossing ») =====
   Les heures de l'accueil ne sont plus des seuils fixes (nuit 22 h-5 h…) : elles se calent sur le LEVER et le COUCHER du soleil du jour, calculés
   d'après la date, le fuseau horaire et l'heure d'été de l'appareil. Aucun réseau, aucune permission de position : le lieu est deviné du fuseau
   (TITRE_ZONES, la grande ville du fuseau) ; un fuseau inconnu prend sa latitude moyenne et sa longitude de l'heure légale. L'hémisphère Sud a
   donc ses saisons à l'envers. Formule du NOAA (équation du temps + déclinaison), juste à quelques minutes, plus que ce qu'il faut pour une ambiance.
   titreSoleil(d,lat,lon) → {lever,coucher} en heures locales · titreLieu(d,zone) → [lat,lon] · dbgSoleil('2026-06-21T22:00','Europe/Paris') (banc). */
const TITRE_ZONES={'Europe/Paris':[48.9,2.4],'Europe/London':[51.5,-.1],'Europe/Dublin':[53.3,-6.3],'Europe/Lisbon':[38.7,-9.1],'Europe/Madrid':[40.4,-3.7],
  'Europe/Brussels':[50.8,4.4],'Europe/Amsterdam':[52.4,4.9],'Europe/Berlin':[52.5,13.4],'Europe/Zurich':[47.4,8.5],'Europe/Rome':[41.9,12.5],
  'Europe/Vienna':[48.2,16.4],'Europe/Warsaw':[52.2,21],'Europe/Stockholm':[59.3,18.1],'Europe/Oslo':[59.9,10.7],'Europe/Helsinki':[60.2,24.9],
  'Europe/Athens':[38,23.7],'Europe/Istanbul':[41,29],'Europe/Moscow':[55.8,37.6],'Europe/Kiev':[50.5,30.5],'Europe/Kyiv':[50.5,30.5],
  'Africa/Casablanca':[33.6,-7.6],'Africa/Algiers':[36.8,3.1],'Africa/Tunis':[36.8,10.2],'Africa/Cairo':[30,31.2],'Africa/Lagos':[6.5,3.4],
  'Africa/Johannesburg':[-26.2,28],'Africa/Nairobi':[-1.3,36.8],'Asia/Dubai':[25.2,55.3],'Asia/Tehran':[35.7,51.4],'Asia/Kolkata':[22.6,88.4],
  'Asia/Calcutta':[22.6,88.4],'Asia/Karachi':[24.9,67],'Asia/Dhaka':[23.8,90.4],'Asia/Bangkok':[13.8,100.5],'Asia/Jakarta':[-6.2,106.8],
  'Asia/Singapore':[1.3,103.8],'Asia/Hong_Kong':[22.3,114.2],'Asia/Shanghai':[31.2,121.5],'Asia/Seoul':[37.6,127],'Asia/Tokyo':[35.7,139.7],
  'Asia/Manila':[14.6,121],'Australia/Sydney':[-33.9,151.2],'Australia/Melbourne':[-37.8,145],'Australia/Brisbane':[-27.5,153],
  'Australia/Perth':[-32,115.9],'Australia/Adelaide':[-34.9,138.6],'Pacific/Auckland':[-36.8,174.8],'America/New_York':[40.7,-74],
  'America/Toronto':[43.7,-79.4],'America/Montreal':[45.5,-73.6],'America/Halifax':[44.6,-63.6],'America/Chicago':[41.9,-87.6],'America/Denver':[39.7,-105],
  'America/Phoenix':[33.4,-112],'America/Los_Angeles':[34,-118.2],'America/Vancouver':[49.3,-123.1],'America/Anchorage':[61.2,-149.9],
  'Pacific/Honolulu':[21.3,-157.9],'America/Mexico_City':[19.4,-99.1],'America/Bogota':[4.7,-74.1],'America/Lima':[-12,-77],'America/Santiago':[-33.4,-70.7],
  'America/Sao_Paulo':[-23.5,-46.6],'America/Argentina/Buenos_Aires':[-34.6,-58.4],'America/Martinique':[14.6,-61],'America/Guadeloupe':[16.2,-61.5],
  'America/Cayenne':[4.9,-52.3],'Indian/Reunion':[-21.1,55.5],'Pacific/Noumea':[-22.3,166.5],'Pacific/Tahiti':[-17.5,-149.6]};
function titreLieu(d,zone){ // [latitude, longitude est] du fuseau de l'appareil
  if(zone===undefined){try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch(e){zone='';}}
  const z=TITRE_ZONES[zone];if(z)return z;
  const y=d.getFullYear(),legale=-Math.max(new Date(y,0,1).getTimezoneOffset(),new Date(y,6,1).getTimezoneOffset())/60; // heure légale hors heure d'été
  const sud=/^(Australia|Antarctica)\/|Auckland|Sao_Paulo|Santiago|Lima|Johannesburg|Argentina|Montevideo|La_Paz|Asuncion|Maputo|Harare|Lusaka|Windhoek|Antananarivo|Fiji|Tongatapu|Apia|Reunion|Noumea|Tahiti/.test(zone||'');
  return [sud?-30:/^Europe\//.test(zone||'')?48:/^America\//.test(zone||'')?38:35,legale*15];}
function titreSoleil(d,lat,lon){ // lever et coucher du soleil ce jour-là, en heures LOCALES (l'heure d'été de l'appareil est déjà dedans)
  const R=Math.PI/180,n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),g=2*Math.PI/365*(n-1);
  const eq=229.18*(7.5e-5+1.868e-3*Math.cos(g)-3.2077e-2*Math.sin(g)-1.4615e-2*Math.cos(2*g)-4.0849e-2*Math.sin(2*g)); // l'équation du temps (min)
  const dec=6.918e-3-.399912*Math.cos(g)+.070257*Math.sin(g)-6.758e-3*Math.cos(2*g)+9.07e-4*Math.sin(2*g)-2.697e-3*Math.cos(3*g)+1.48e-3*Math.sin(3*g); // la déclinaison (rad)
  let c=Math.cos(90.833*R)/(Math.cos(lat*R)*Math.cos(dec))-Math.tan(lat*R)*Math.tan(dec);c=Math.max(-.985,Math.min(.985,c)); // (jour ou nuit polaire : un jour de 1 h 20 à 22 h 40, jamais de trou)
  const ha=Math.acos(c)/R,decal=-d.getTimezoneOffset(); // demi-arc du jour (°) · décalage de l'appareil à ce jour (min)
  return {lever:(720-4*(lon+ha)-eq+decal)/60,coucher:(720-4*(lon-ha)-eq+decal)/60};}
window.dbgSoleil=function(iso,zone){ // (banc) dbgSoleil('2026-06-21T22:00') : l'heure du titre à cet instant ; zone = un fuseau d'IANA (sinon celui de l'appareil)
  const d=iso?new Date(iso):new Date(),L=titreLieu(d,zone),S=titreSoleil(d,L[0],L[1]),f=function(h){const m=Math.round(h*60);return Math.floor(m/60)+'h'+('0'+m%60).slice(-2);};
  return {date:d.toString(),lieu:L,lever:f(S.lever),coucher:f(S.coucher),heure:titreHeureDe(d,zone)};};
/* ===================== LA CHUTE — LE MENU DANS LE CIEL (2026-09-30, Sacha, capture de Zelda : Tears of the Kingdom à l'appui) =====================
   « Au lieu d'être dans le garage, la voiture doit TOMBER DU CIEL, en face d'une route, dans le biome nuage, de très haut, à l'infini ; garde
   l'affichage et les boutons ; on la voit tomber sur la gauche, à la place de la voiture du garage, et sur la droite les boutons que j'ai faits. »
   · C'EST LE MODE « MENU » DE L'ATELIER, PEINT AILLEURS : tout le reste ne bouge pas (garageOn, #mHome par-dessus, garMode, les portes
     GARAGE / MISSIONS / BOUTIQUE qui ouvrent l'atelier sous leur volet). `garageRender` passe la main à `chuteRender` tant que l'atelier est
     en mode MENU (et pas MISSIONS) — l'atelier est caché, le monde du niveau 1 (la piste du menu, ses nuages, la mer, le ciel du JOUR des
     NUAGES `MENU_BIO`) est dessiné ; revenu à l'atelier (boutique, missions), `chuteSort` lui rend sa lumière, son reflet et ses sons.
   · LA PLACE : la caisse est posée là où l'interface laisse de la place (`menuCadre`, celui de la vitrine : la bande de GAUCHE couché, la
     bande entre le titre et les boutons debout) ; elle y garde la même taille quelle que soit la caisse (sa sphère englobante).
   · L'INFINI : la caisse ne descend pas — c'est l'AIR qui monte. Des bancs de nuage (sprites) montent autour d'elle et passent la caméra,
     des filets de vent (quads additifs, UN appel de dessin) filent vers le haut, SA traînée (celle de la boutique, `trailApercu`) monte
     derrière elle, la caisse tangue, roule, ses roues tournent, la vue balance lentement. De 190 m de haut, la route ne se rapproche
     pas à l'œil : c'est ce qu'on voit, vraiment, en chute libre.
   · LE PLAN (titre v3, 2026-10-01 — voir « L'ÉCRAN TITRE v3 » dans CLAUDE.md) : `chutePlan()` règle le REGARD sur le SOLEIL (dans le dos de
     la caméra, à droite : les nuages éclairés de face), la caisse très haut au-dessus du sommet de la piste, la piste derrière. Autour
     d'elle, les CUMULUS DU TITRE (`CHUTE_NU`) : de vrais nuages v8 posés à la main à trois profondeurs, qui montent.
   · JOUER (`chuteLance`) : elle PIQUE — le nez plonge, elle accélère vers la route, la caméra passe derrière elle, l'air rugit, le champ
     s'ouvre ; elle traverse un banc de nuage (le voile BLANC, `#chuteVoile`) et, sous le voile, la course démarre (même fin que le
     lâcher de l'atelier : closeGarage, puis start()/resetGame()).
   · COÛT : ~16 sprites + 1 maillage de filets + la traînée — les matières sont celles de l'atelier et de la traînée d'aperçu (zéro
     programme de plus mesuré au banc). Hooks : `dbgChute()` (état), `dbgChute({…})` (règle un paramètre de CHUTE_P), `?chute=0` (l'atelier
     comme avant).
   ⚠ `var` et pas `const` : updateContactShadow et cielHorsCourse, déclarées bien plus haut, lisent CHUTE — `var` vaut `undefined` avant
   cette ligne au lieu de lever une erreur (la zone morte d'un const planterait le tout premier rendu). */
var CHUTE={G:new THREE.Vector3(),nu:null,oA:0,oAc:0,oW:0,oP:0,oPc:0,mvT:0,tk:0,tSens:1,on:false,t:0,go:null,L:-1,s:0,C:new THREE.Vector3(),cam:new THREE.Vector3(),f:new THREE.Vector3(),fh:new THREE.Vector3(),lh:new THREE.Vector3(),
  q:new THREE.Quaternion(),m:new THREE.Matrix4(),v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),w:null,fil:null,voile:null,bioPas:-1,vent:false,entree:0};
const CHUTE_OK=!/[?&]chute=0\b/.test(location.search);
const CHUTE_P={cielT:1,voiles:0,brumeT:2.2,elevP:.06,studio:1,amb:.55,sk:1.6,kh:.75,sc:.12,sb:0,sr:1.35,fige:null, /* (2026-10-03) LE MODELÉ DE LA CAISSE, choisi sur planche (banc studio.mjs, f1) : voir chuteStudio */cleC:0xfff1dc,rimC:0xbfe4ff,rim:1.1,rimS:0,lampe:1,az:2.35,cote:0,nuages:1,K:[1.02,1.08,1.1,1],R:[-.3,.5,.72,1],mzA:[1500,.8,9,.2],mzB:null,gite:-.45,coton:0,cle:.5,brume:1,expo:1,trainee:0,alt:900,avant:-1700,pitch:.62,roule:.12,cap:.28,elev:.015, /* (titre v3) voir « L'ÉCRAN TITRE v3 » : alt = au-dessus du SOMMET de la piste, az = l'angle regard ↔ soleil, cote = la piste décalée à droite de la caisse (couché), nuages = les cumulus du titre */ /* (niveau 1 v2) pitch .22 → .55, elev .22 → .30 : à plat, elle PLANAIT ; le nez piqué vers la mer, on la voit TOMBER */vit:14,echelle:1,taille:.82,sol:.3,sous:70,plancher:0,tour:75,sens:1,face:-.785,faceA:.21,vb:.8,cjF:1.2}; /* (2026-10-08, LE SENS DU TOUR) sens : +1 = le décor glisse vers la GAUCHE (mesuré : un point du décor à 1,7 km recule de 0,1 à 0,13 d'écran pour 0,1 rad de tour) — la caisse, nez à droite, a l'air d'AVANCER vers la droite : le sens de lecture (Maass & Russo 2003 : un mouvement de gauche à droite se lit « vers l'avant » chez qui lit de gauche à droite ; Chokron & De Agostini 2000 : on préfère les images orientées vers la droite), le travelling qui suit un sujet allant à droite, et vu d'en haut le sens des aiguilles d'une montre. Le doigt ne l'inverse plus. */ /* (2026-10-08, LA CAISSE EN DIAGONALE) face : l'angle (rad) d'où le regard la voit, autour d'elle — −0,785 (315°) = trois-quarts avant nez à droite : l'avant ET le flanc (phares, calandre, portières ; Léo : « plus diagonale, qu'on voie un peu l'avant et le profil » — choisi sur planche 295° → 345°) ; faceA : le balancement autour (±12°, un aller-retour par tour) ; face:null = la caisse fixe dans le monde, le tour passe par son dos */ /* (2026-10-07, LE TOUR SANS FIN) tour : secondes pour un tour complet du regard autour de la caisse (0 = la vue ne tourne que sous le doigt) */ // (2026-09-30, le JOUR D'ALTITUDE) de très haut au-dessus de TOUT le monde du niveau : les cumulus deviennent un champ de nuages sous la caisse, la mer à perte de vue ; plus de traînée orange ni de plancher peint ; brume repoussée, exposition et clé baissées (l'image sortait délavée) // (choisi aux captures : l'horizon et la mer de nuages dans l'image, le soleil de côté devant — sa lueur rose-or sur l'horizon)
window.dbgChute=function(o){if(o&&typeof o==='object'){if(o.orb!=null){CHUTE.oA=CHUTE.oAc=+o.orb||0;CHUTE.oW=0;CHUTE.tk=0;o=Object.assign({},o);delete o.orb;} /* (le tour sans fin, banc) orb : poser le regard à cet angle (rad) — avec tour:0 il y reste */if(o.NU&&CHUTE.nu){o.NU.forEach(function(d,i){const c=CHUTE.nu[i];if(!c||!d)return;c.a=d[0];c.b=d[1];c.r=d[2];c.v=d[4];c.y=d[5];c.m.scale.set(d[2],d[2],d[2]);const dd=Math.hypot(d[0],d[1]);c.lo=-(1.2*dd+1.3*d[2]);c.hi=.1*dd+1.3*d[2];c.off=false;});for(let i=o.NU.length;i<CHUTE.nu.length;i++)CHUTE.nu[i].off=true;o=Object.assign({},o);delete o.NU;} /* (banc) NU : rejouer la disposition des cumulus du titre sans recharger */
  Object.assign(CHUTE_P,o);CHUTE.L=-1;}
  return {titreCiel:+skyU.uTi.value.x,cadre:(function(){const c=menuCadre();return [+c.nx.toFixed(2),+c.ny.toFixed(2),+c.fr.toFixed(2),+c.fh.toFixed(2)];})(),ecran:(function(){const q=carGroup.position.clone().project(camera);return [+q.x.toFixed(2),+q.y.toFixed(2)];})(),orb:[+CHUTE.oA.toFixed(2),+CHUTE.oP.toFixed(2)],lum:CHUTE.lum9,tris:CHUTE.nu?CHUTE.nu.reduce(function(a,c){return a+(c.m.visible&&c.m.geometry.index?c.m.geometry.index.count/3:0);},0):0,nu:CHUTE.nu?CHUTE.nu.filter(function(c){return c.m.visible;}).length:0,mz:+skyU.uMzA.value.x,ciel:document.body.classList.contains('titreCiel'),on:CHUTE.on,go:!!CHUTE.go,s:Math.round(CHUTE.s),C:CHUTE.C.toArray().map(Math.round),cam:CHUTE.cam.toArray().map(function(x){return +x.toFixed(1);}),P:CHUTE_P,
    pas:CHUTE.nu?CHUTE.nu.filter(function(c){return c.pas;}).map(function(c){return [Math.round(c.D),Math.round(CHUTE.C.y+c.y-camera.position.y),Math.round(c.r),c.m.visible?1:0];}):[], /* (2026-10-25) les nuages de passage : [distance à l'objectif, hauteur par rapport à lui, rayon, visible] */
    route:(function(){try{frameAt(CHUTE.s,F);const q=F.p.clone().project(camera);return [+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(3)];}catch(e){return null;}})()};};
/* LES HEURES DU TITRE — ce que chaque heure règle à côté de son ambiance (BIOMES.titre…) : `P` = les clés de CHUTE_P (les cumulus du titre
   K/R, la mer de nuages mzT/mzO/mzH — rgb + part —, l'angle regard ↔ soleil az, les lampes de la caisse cleS/zenC/rimC/kh/sk/amb/sol/sc/sr
   — ⚠ banc : aux heures sombres, avec les doses du jour, la caisse n'était plus qu'une silhouette noire —, expo),
   `v` = les voiles de l'écran (rgb, haut, bas, bandeau des boutons), `t` = la teinte des bancs et des filets de vent qui montent.
   Une clé absente reprend la valeur d'origine (CHUTE_P0) : le MATIN est le titre v3 au bit près. */
const CHUTE_P0=JSON.parse(JSON.stringify(CHUTE_P));
const TITRE_MZ0=[0,0,0,0];
const TITRE_H={
  matin: {bio:'titreMatin', P:{az:1.8,K:[1.05,1.2,1.5,1.6],R:[-.4,.45,.85,1],mzT:TITRE_MZ0,mzO:TITRE_MZ0,mzH:TITRE_MZ0},v:['4,24,62',.30,.50,'6,28,60',.62],t:[1,1,1]},
  midi:  {bio:'titreMidi',  P:{az:1.8,K:[1.05,1.18,1.4,1.6],R:[-.4,.45,.85,1],mzT:TITRE_MZ0,mzO:[.62,.74,.90,.25],mzH:[1,1,1,.3],kh:.9},v:['2,30,80',.26,.46,'4,30,72',.6],t:[1,1,1]},
  aprem: {bio:'titreAprem', P:{az:1.75,K:[1.04,1.15,1.5,1.6],R:[-.38,.47,.8,1],mzT:TITRE_MZ0,mzO:[.55,.60,.78,.25],mzH:[1,.95,.86,.35],kh:.7},v:['10,30,66',.30,.50,'10,30,62',.62],t:[1,.97,.92]},
  golden:{bio:'titreGolden',P:{az:1.95,K:[1.05,1.3,1.8,1.6],R:[-.35,.42,.75,1],mzT:[.20,.20,.42,.55],mzO:[.30,.24,.44,.6],mzH:[1,.72,.46,.7],cleS:0xffd0a0,rimC:0xffb070,kh:.35,sk:2.1,amb:.75,sol:.9},v:['40,22,46',.30,.52,'34,18,40',.64],t:[1,.84,.70]},
  soir:  {bio:'titreSoir',  P:{K:[1,1.15,1.6,1.6],R:[-.3,.5,.72,1],mzT:[.10,.09,.24,.6],mzO:[.20,.17,.34,.6],mzH:[.85,.60,.70,.6],cleS:0xffc0cc,zenC:0xa8b8ff,rimC:0x9fb4ff,kh:.5,expo:.95,sk:2.3,amb:.85,sol:.9,sc:.3,sr:1.6},v:['20,10,40',.36,.56,'18,10,36',.66],t:[.85,.66,.78]},
  nuit:  {bio:'titreNuit',  P:{K:[.62,.72,1.3,1.4],R:[-.05,.65,.8,1],mzT:[.02,.03,.08,.9],mzO:[.07,.09,.18,.85],mzH:[.50,.58,.76,.85],cleS:0xb8ccff,zenC:0x8fa8ff,rimC:0x86a6ff,kh:.6,sk:2.5,amb:1,sol:1,sc:.35,sr:1.7},v:['2,6,20',.45,.65,'2,6,20',.7],t:[.34,.40,.58]}};
const TITRE_HEURES=['aube','matin','midi','aprem','golden','soir','nuit'];
/* (titre v4) LA PALETTE DU CIEL DU TITRE, par heure — z zénith, m milieu, h horizon (aussi la brume des cumulus : les lointains s'y
   fondent), s lueur du soleil, mh/mo la mer de nuages au soleil/à l'ombre, c les cirrus, ca leur part, hz la distance de la brume. */
const TITRE_CIEL={
  matin: {tw:.9,ry:.3,cr:.38,z:[.10,.33,.70],m:[.36,.66,.90],h:[.86,.92,.95],s:[.50,.43,.31],mh:[1,.98,.95],mo:[.48,.62,.84],c:[.96,.97,.99],ca:.35,hz:1},
  midi:  {tw:.75,ry:.2,cr:.4,z:[.04,.24,.62],m:[.24,.56,.88],h:[.80,.89,.96],s:[.30,.29,.26],mh:[1.02,1.01,1],mo:[.46,.60,.86],c:[1,1,1],ca:.25,hz:1.1},
  aprem: {tw:1,ry:.4,cr:.38,z:[.12,.30,.62],m:[.44,.64,.84],h:[.95,.90,.82],s:[.50,.40,.28],mh:[1,.95,.88],mo:[.50,.55,.76],c:[1,.96,.92],ca:.4,hz:1},
  golden:{tw:1,ry:.7,cr:.34,z:[.12,.22,.50],m:[.56,.58,.74],h:[.96,.84,.70],s:[.42,.26,.12],mh:[1,.84,.66],mo:[.42,.42,.62],c:[1,.82,.66],ca:.5,hz:.9},
  soir:  {tw:1,ry:.45,cr:.36,z:[.04,.07,.22],m:[.20,.20,.44],h:[.66,.48,.56],s:[.28,.14,.15],mh:[.70,.58,.70],mo:[.18,.19,.36],c:[.88,.60,.66],ca:.45,hz:.85},
  nuit:  {tw:.85,ry:0,cr:.45,z:[.010,.016,.045],m:[.03,.05,.12],h:[.10,.14,.26],s:[.04,.06,.12],mh:[.34,.42,.62],mo:[.05,.07,.15],c:[.35,.42,.60],ca:.2,hz:.8}};
/* L'AUBE (2026-10-25, Sacha : « on est tout le temps à l'aube… il faut plusieurs ambiances ») : le soleil n'est pas encore levé — un ciel indigo qui
   pâlit en lavande, un horizon pêche-rose sous la mer de nuages, une brume rosée, les dernières étoiles ; les phares de la caisse encore en veilleuse. */
TITRE_H.aube={bio:'titreAube',P:{K:[1.03,1.2,1.65,1.6],R:[-.33,.46,.74,1],mzT:[.20,.16,.26,.6],mzO:[.26,.22,.36,.6],mzH:[1,.72,.58,.65],cleS:0xffc8b0,zenC:0xb0b4ee,rimC:0xffb8a0,kh:.45,expo:.9,sk:2.6,amb:.9,sol:1,cjA:1.2,cjF:1.8},v:['30,26,60',.34,.54,'28,22,54',.62],t:[.92,.80,.82]};
TITRE_CIEL.aube={tw:1,ry:.55,cr:.36,z:[.05,.09,.28],m:[.40,.36,.58],h:[.98,.66,.52],s:[.52,.32,.22],mh:[1,.78,.66],mo:[.26,.26,.44],c:[1,.74,.66],ca:.42,hz:.9};
/* (2026-10-14, passe graphismes — ÉCRAN TITRE, les 6 heures) Retouche d'étalonnage PAR VALEURS (charte : signatures MATIN/MIDI/SOIR/NUIT, plus de violet-néon,
   sat ≤ 1,30, pas de cobalt, caisse mieux éclairée). Posée ICI, après les définitions de TITRE_CIEL/TITRE_H, donc APRÈS la copie de titreGolden/titreNuit par
   nuagesSoir/nuagesNuit (la course ne bouge pas). Couleurs de ciel/brume en LINÉAIRE. */
{
  const T2=function(h,o){const H=TITRE_H[h];if(o.ciel)Object.assign(TITRE_CIEL[h],o.ciel);if(o.amb)Object.assign(BIOMES[H.bio],o.amb);if(o.P)Object.assign(H.P,o.P);if(o.v)H.v=o.v;if(o.t)H.t=o.t;};
  // SOIR : zénith bleu-mauve doux → horizon pêche (plus de ciel magenta) ; mer de nuages rosé-prune éclairée pêche ; ombres prune désaturée
  T2('soir',{ciel:{z:[.14,.14,.42],m:[.50,.38,.50],h:[.95,.70,.58],s:[.50,.32,.22],mh:[.95,.70,.58],mo:[.30,.21,.25],c:[1,.72,.60]},
    amb:{jZen:[.14,.14,.42],jMid:[.50,.38,.50],jHor:[.95,.70,.58],jSol:[.95,.40,.18],sunTint:[1,.60,.40],fog:[.68,.54,.52],fogCj:[1,.60,.42],fogIn:[.80,.64,.62],hemiS:[.64,.56,.70],hemiG:[.30,.20,.20],sunC:[1,.70,.52],sat:1.05,con:1.12,vigC:[.05,.035,.07],vigK:.22,
      env:[[0,'#2e3470'],[.3,'#8a78a8'],[.48,'#e8907a'],[.58,'#ffb98a'],[.66,'#5a4a66'],[1,'#2a2438']],eS1:[255,185,138,.45],eS2:[150,150,200,.3]},
    P:{mzT:[.26,.18,.22,.6],mzO:[.30,.21,.25,.6],mzH:[.95,.70,.58,.6],cleS:0xffc8a8,zenC:0xb8b8ee,rimC:0xb0b4f0,amb:1,sol:1.1,sk:2.6,expo:.9,cjA:1.3,cjF:1.9},
    v:['34,28,56',.34,.54,'30,24,50',.64],t:[.78,.60,.54]});
  // GOLDEN : or/pêche pâle au lieu de lavande (mer gris-rosé chaud), ciel bleu doux en haut ; la caisse, mieux éclairée, se détache par sa teinte saturée sur un fond pâli
  T2('golden',{ciel:{z:[.09,.22,.54],m:[.36,.50,.74],h:[.98,.80,.60],s:[.46,.32,.18],mh:[1,.86,.66],mo:[.58,.47,.44],c:[1,.84,.66]},
    amb:{jZen:[.09,.22,.54],jMid:[.36,.50,.74],jHor:[.98,.80,.60],fog:[.92,.76,.64],hemiS:[.80,.76,.84],hemiG:[.50,.40,.34],sat:1.08,con:1.14,vigC:[.10,.06,.07],vigK:.2,
      env:[[0,'#2a3c78'],[.3,'#98909e'],[.48,'#ffb070'],[.58,'#ffd08a'],[.66,'#a08a88'],[1,'#605a6a']],eS1:[255,200,140,.5],eS2:[170,170,200,.25]},
    P:{mzT:[.30,.26,.30,.55],mzO:[.58,.47,.44,.6],mzH:[1,.84,.62,.7],amb:.9,sk:2.9,cjA:1.2,cjF:1.8},
    v:['36,28,40',.30,.48,'32,24,36',.58],t:[1,.88,.76]});
  // NUIT : signature #0B1230 → #1E2A52 (outremer saturé → bleu nuit calme), sat 0,9, mer de nuages sombre, cirrus effacés ; caisse lisible
  T2('nuit',{ciel:{z:[.004,.008,.04],m:[.009,.017,.065],h:[.03,.05,.13],s:[.03,.05,.10],mh:[.50,.58,.74],mo:[.045,.055,.10],c:[.22,.28,.42],ca:.12},
    amb:{jZen:[.004,.008,.04],jMid:[.009,.017,.065],jHor:[.03,.05,.13],fog:[.03,.04,.09],hemiS:[.32,.40,.62],sat:.9,con:1.12,vigC:[.005,.01,.03],vigK:.4},
    P:{mzT:[.015,.025,.06,.9],mzO:[.045,.055,.10,.85],mzH:[.52,.60,.78,.85],K:[.5,.58,1.05,1.2],amb:1.1,sk:3.3,cjA:1.2,cjF:1.8},
    v:['4,8,24',.45,.65,'4,8,24',.7]});
  // MIDI : plus de cobalt au coin haut-gauche (zénith #3F8FE0 max, horizon #CFE8F7), voile haut bleu clair, mer de nuages plus claire
  T2('midi',{ciel:{z:[.05,.26,.70],m:[.26,.58,.88],h:[.66,.82,.93],mo:[.62,.74,.90]},
    amb:{jZen:[.05,.26,.70],jHor:[.66,.82,.93],sat:1.12,con:1.2},P:{mzO:[.70,.80,.92,.25],amb:.75,sol:.7,sk:2.1},v:['40,84,150',.2,.34,'40,84,150',.5]});
  // MATIN : sa propre signature (or pâle bas, horizon pêche clair, brume rosée), léger — avant, identique au midi
  T2('matin',{ciel:{m:[.40,.64,.86],h:[.92,.80,.68],s:[.62,.46,.28],mo:[.50,.60,.82],mh:[1,.94,.86]},
    amb:{jHor:[.92,.80,.68],fog:[.88,.80,.78],sunC:[1,.90,.76],sat:1.14,con:1.14},P:{amb:.75,sol:.7,sk:2.1},v:['40,84,150',.24,.44,'40,84,150',.5]});
  // APRÈS-MIDI : mer de nuages crème chaud au lieu de lavande, bleu un peu plus profond en haut, sat 1,15
  T2('aprem',{ciel:{z:[.12,.32,.68],m:[.40,.62,.86],mo:[.74,.70,.72]},amb:{sat:1.15,con:1.15},P:{mzO:[.74,.70,.72,.25],amb:.75,sol:.7,sk:2.1,cjA:1.1,cjF:1.6},v:['40,70,120',.24,.42,'40,70,120',.5]});
}
function titreCiel(on){const U=skyU,T=TITRE_CIEL[TITRE_HF.h]||TITRE_CIEL.matin;U.uTi.value.set(on?1:0,T.ca,0,T.hz);U.uTi2.value.set(T.tw||0,T.ry||0,T.cr||.35,0);if(!on)return T;
  U.uTZen.value.fromArray(T.z);U.uTMid.value.fromArray(T.m);U.uTHor.value.fromArray(T.h);U.uTSol.value.fromArray(T.s);
  U.uTMerH.value.fromArray(T.mh);U.uTMerO.value.fromArray(T.mo);U.uTCir.value.fromArray(T.c);return T;}
/* LE FOND PEINT DE LA MER DE NUAGES (2026-10-18, Léo : « travaille le fond, comme pour le menu ; là c'est un peu bleu ; sois un peintre réaliste
   expressionniste et designer digital »). En course, le ciel d'altitude (cielJour : jZen/jMid/jHor) faisait un aplat d'azur électrique : on y
   ALLUME la couche peinte du menu (`cielTitre` : dégradé sans palier, l'air épais sur l'horizon, la lueur et les rayons du soleil, les cirrus au
   vent, la mer de nuages aux ombres portées et sa perspective aérienne) avec SA palette par heure — le réalisme de l'air (le bleu s'éteint vers
   l'horizon dans une brume chaude, les lointains s'y noient), l'expression du peintre (l'or du soleil contre les ombres bleues de la mer,
   un zénith profond mais rabattu, jamais cobalt) — et la BRUME des cumulus prend la couleur de cet horizon (sinon les lointains se découpent).
   Que des uniforms (le même programme du ciel) : 0 compilé. La nuit (clair de lune), la pluie et l'orage gardent leur ciel. `dbgNuFond(0|1)`. */
const NU_FOND={ // z zénith, m milieu, h horizon (et la brume), s lueur du soleil, mh/mo la mer au soleil/à l'ombre, c les cirrus, ca leur part, hz la distance de l'air, tw/ry/cr les rayons
  matin:{tw:.9,ry:.4,cr:.38,z:[.22,.27,.50],m:[.62,.64,.76],h:[1,.88,.76],s:[.74,.48,.26],mh:[1,.92,.82],mo:[.60,.65,.86],c:[1,.94,.88],ca:.42,hz:.75,sat:1.04,con:1.14},
  midi: {tw:.75,ry:.25,cr:.4,z:[.19,.27,.52],m:[.56,.65,.82],h:[.97,.93,.86],s:[.60,.48,.32],mh:[1.02,1,.96],mo:[.64,.72,.90],c:[1,1,1],ca:.36,hz:.8,sat:1.04,con:1.14},
  soir: {tw:1,ry:.75,cr:.34,z:[.12,.16,.40],m:[.56,.48,.60],h:[1,.76,.56],s:[.64,.34,.14],mh:[1,.82,.62],mo:[.58,.47,.66],c:[1,.80,.64],ca:.5,hz:.8,sat:1.22},
  /* (2026-10-21, Léo : « le ciel noir de l'orage… trop débutant, fais mieux ») L'ORAGE a SON ciel peint (avant : le noir du biome) : un zénith bleu-nuit, un milieu gris-violet meurtri, un horizon mauve où la lumière fuit sous la masse,
     de longues mèches de cirrus au-dessus, la mer d'ombre violette — des TEINTES de violet, pas un aplat. */
  /* (2026-10-21, Léo : « la pluie, c'est pareil : peindre un fond, c'est trop monotone ») LA PLUIE a SON ciel peint : un zénith bleu ardoise, un milieu bleu-argent, un horizon gris-lilas qui s'ouvre en
     pêche vers le soleil bas (l'éclaircie de l'arc-en-ciel), des faisceaux de lumière à travers la couverture, de longues mèches de cirrus, une mer d'ombre bleue éclairée d'argent — plusieurs plans, pas un gris uniforme. */
  pluie:{tw:.6,ry:.4,cr:.45,z:[.20,.17,.27],m:[.42,.32,.43],h:[.80,.58,.58],s:[.72,.42,.30],mh:[.88,.68,.72],mo:[.52,.42,.54],c:[.95,.78,.80],ca:.5,hz:.7,sat:1.05,con:1.08}, // (2026-10-21, Léo : « tout l'écran est bleu, c'est nul » → l'APRÈS-PLUIE ROSE-MAUVE) gris-mauve en haut, rose-pêche en bas, le bleu seulement par touches
  orage:{tw:.55,ry:.12,cr:.5,z:[.035,.045,.12],m:[.15,.12,.25],h:[.40,.25,.33],s:[.30,.15,.24],mh:[.34,.29,.46],mo:[.07,.06,.15],c:[.50,.42,.60],ca:.6,hz:.65,sat:1.08,con:1.14},
  /* nuit : PAS de fond peint — la couche du menu la noircissait (le CLAIR DE LUNE bleu-violet de Sacha, 14/10, reste) */};
const NUF={k:0,on:false,T:null,force:null,av:{},ap:{}};
/* (2026-10-21, Léo : « montre directement les maps pluie et orage sur le menu, comme ça je peux examiner ») DEUX « HEURES » DE PLUS AU TITRE : PLUIE et ORAGE — le ciel peint de la map (NU_FOND.pluie / .orage : mêmes
   couleurs, mêmes cirrus, même mer d'ombre) avec l'éclairage de la caisse d'un temps couvert (calé sur l'après-midi) / d'une nuit d'orage (calé sur la nuit). Plus de touches à l'accueil (retirées le 2026-10-21, le ciel suit l'heure) : `?heure=pluie` / `?heure=orage` ou `dbgHeure('pluie')` pour les examiner. */
{const cl=function(o){return JSON.parse(JSON.stringify(o));},cp=function(src){const o={};for(const k of ['tw','ry','cr','z','m','h','s','mh','mo','c','ca','hz'])o[k]=cl(src[k]);return o;};
  TITRE_CIEL.pluie=cp(NU_FOND.pluie);TITRE_CIEL.orage=cp(NU_FOND.orage);
  BIOMES.titrePluie=bioMet(BIOMES.titreAprem,{nm:'TITRE · PLUIE',jZen:NU_FOND.pluie.z,jMid:NU_FOND.pluie.m,jHor:NU_FOND.pluie.h,sunTint:[1,.78,.68],sunHalo:.4,sunI:(BIOMES.titreAprem.sunI||1)*.7,hemiI:(BIOMES.titreAprem.hemiI||1)*.92});
  BIOMES.titreOrage=bioMet(BIOMES.titreNuit,{nm:'TITRE · ORAGE',jZen:NU_FOND.orage.z,jMid:NU_FOND.orage.m,jHor:NU_FOND.orage.h,stars:0,moon:0,sunHalo:0});
  const pa=cl(TITRE_H.aprem.P),pn=cl(TITRE_H.nuit.P);pa.mzO=[NU_FOND.pluie.mo[0],NU_FOND.pluie.mo[1],NU_FOND.pluie.mo[2],.8];pa.mzH=[NU_FOND.pluie.mh[0],NU_FOND.pluie.mh[1],NU_FOND.pluie.mh[2],.8];
  pn.mzO=[NU_FOND.orage.mo[0],NU_FOND.orage.mo[1],NU_FOND.orage.mo[2],.85];pn.mzH=[NU_FOND.orage.mh[0],NU_FOND.orage.mh[1],NU_FOND.orage.mh[2],.85];
  TITRE_H.pluie={bio:'titrePluie',P:pa,v:cl(TITRE_H.aprem.v),t:[.94,.96,1]};TITRE_H.orage={bio:'titreOrage',P:pn,v:cl(TITRE_H.nuit.v),t:[.86,.86,1]};}
/* ===== LA NUIT DU TITRE = LA NUIT DE LA MAP NUAGES (2026-10-25, Sacha : « les nuages bug à cause de la nuit », puis « prends littéralement le même niveau que la map nuage,
   mets la voiture dans la map nuage, tout simplement ») =====
   MESURÉ (banc, ?heure=nuit) : les cumulus du titre sortaient GRIS, en rochers. L'ambiance titreNuit gardait la lumière des nuages du JOUR (le volSun de BIOMES.titre :
   un blanc chaud ×2,2), un albédo de ,5 et un soleil de ,58 (le T2('nuit') plus haut) et un grade à ,9 de saturation — quand la course de nuit a son CLAIR DE LUNE
   (nuagesNuit, finie au chargement par l'étalonnage et la continuité des maps). Le titre de nuit en prend ICI les valeurs, LUES sur l'ambiance de la course (elles
   suivront ses retouches) : la matière des cumulus (nuK/nuR deviennent les K/R du titre), la lumière (lune, ciel, sol, remplissage), le ciel, la brume, la mer de
   nuages et le grade. La caisse garde son studio. L'orage du titre (copié de la nuit juste au-dessus) ne bouge pas. `?titrenuit=0` = la nuit d'avant. */
if(!/[?&]titrenuit=0\b/.test(location.search)){const S9=SF_CARTES&&SF_CARTES.nuages&&SF_CARTES.nuages.m.nuit,B9=S9&&BIOMES[S9.bio];
  if(B9){const cl=function(o){return JSON.parse(JSON.stringify(o));},T9=BIOMES.titreNuit,H9=TITRE_H.nuit,C9=TITRE_CIEL.nuit;
    for(const k of ['volSun','volSky','volGnd','volAmb','nuLav','nuR','nuK','nuA','sunC','hemiS','hemiG','hemiI','fillC','fillI','jZen','jMid','jHor','fog','sat','con','vigC','vigK'])if(B9[k]!=null)T9[k]=cl(B9[k]);
    if(B9.nuK)H9.P.K=cl(B9.nuK);if(B9.nuR)H9.P.R=cl(B9.nuR);if(B9.mzH)H9.P.mzH=cl(B9.mzH);if(B9.mzO)H9.P.mzO=cl(B9.mzO); /* les cumulus du titre ont leur propre K/R (voir chuteRender) : ceux de la course */
    if(B9.jZen){C9.z=cl(B9.jZen);C9.m=cl(B9.jMid);C9.h=cl(B9.jHor);}}} /* le ciel du titre (titreCiel) : le zénith, le milieu et l'horizon de la course — l'horizon fait aussi la brume des cumulus */
for(const m9 in NU_FOND){const S9=SF_CARTES&&SF_CARTES.nuages&&SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio],P9=NU_FOND[m9];if(!B9)continue; // la brume des cumulus = l'horizon peint ; l'étalonnage rabattu (le bleu électrique venait AUSSI de là : sat 1,14 · con 1,24)
  NUF.av[m9]={fog:B9.fog.slice(),sat:B9.sat,con:B9.con};B9.fog=P9.h.slice();(NUF.ap0=NUF.ap0||{})[m9]=P9.h.slice();if(P9.sat)B9.sat=P9.sat;if(P9.con)B9.con=P9.con;NUF.ap[m9]={fog:B9.fog.slice(),sat:B9.sat,con:B9.con};}
/* LE CIEL D'ARC (2026-10-19, essai — Léo : « le ciel dans ARC Raiders est hyper bien fait ; prends les images pour faire un fond plus réaliste
   encore ; les nuages devant, c'était mieux l'avant-dernière version, avec les cubes, joue plus la transparence »). Les images d'ARC Raiders
   sont à Embark (protégées) : on garde leur LEÇON — un ciel naturel, un bleu profond qui pâlit dans une brume claire, de vrais nuages, l'air
   épais sur l'horizon — avec de VRAIES photos libres (Poly Haven, CC0 : kloppenheim_06, wasteland_clouds, belfast_sunset ; assets/ciel/,
   la moitié haute en 4096 × 1024). Au-dessus de l'horizon : la PHOTO (passe nette, pleine résolution), son soleil calé sur celui du jeu.
   En dessous : la MER DE CUMULUS (merArc) — un vrai pont de nuages éclairé par notre soleil, qui rejoint l'horizon de la photo. La brume
   des cumulus du décor prend la couleur de cet horizon. Les nuages devant : le vitrail MOYEN en VERRE (NV_DOSES.verre). La nuit, la pluie,
   l'orage : inchangés. ?arc=0 = le main d'avant ; dbgCielArc() l'état, dbgCielArc(0|1) A/B sur la même image. */
const CIEL_ARC={ // f la photo · su/se son soleil (colonne 0-1, hauteur en degrés) · ex l'exposition · mh/mo la mer au soleil / à l'ombre · s le liseré · h l'horizon (la brume des cumulus)
  matin:{f:'ciel-matin.jpg',su:.612,se:5,ex:.8,ns:0,mi:0,mh:[1,.89,.76],mo:[.44,.52,.70],s:[.85,.55,.30],h:[.74,.72,.72]},
  midi: {f:'ciel-midi.jpg', su:.603,se:7.5,ex:.8,ns:0,mi:0,mh:[1,.98,.94],mo:[.48,.58,.76],s:[.65,.55,.38],h:[.74,.77,.80]},
  soir: {f:'ciel-soir.jpg', su:.665,se:3,ex:.9,ns:1,mi:0,mh:[1,.80,.68],mo:[.40,.39,.55],s:[.95,.52,.26],h:[.64,.58,.58]}};
const CARC={tex:{},mer:null,force:null};
function cielArcTex(f){let t=CARC.tex[f];if(t)return t.pret?t:null;
  t=CARC.tex[f]=new THREE.Texture();t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
  const im=new Image();im.onload=function(){t.image=im;t.needsUpdate=true;t.pret=true;};im.src='assets/ciel/'+f;return null;}
function cielArcMer(){if(CARC.mer)return CARC.mer.pret?CARC.mer:null;const t=CARC.mer=new THREE.Texture();t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.premultiplyAlpha=false;const im=new Image();im.onload=function(){t.image=im;t.needsUpdate=true;t.pret=true;};im.src='assets/ciel/mer-cumulus.png';return null;}
if(ARC_ON){cielArcMer();for(const m9 in CIEL_ARC){cielArcTex(CIEL_ARC[m9].f); // chargées dès le départ (≈ 1 Mo en tout) ; la brume des cumulus = l'horizon de la photo
  const S9=SF_CARTES&&SF_CARTES.nuages&&SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio];if(B9&&NUF.ap[m9]){B9.fog=CIEL_ARC[m9].h.slice();NUF.ap[m9].fog=B9.fog.slice();}}}
/* (2026-10-20, Léo : « enlever en général le tapis complètement rempli de nuages, l'harmoniser avec la répartition des nuages du premier plan selon la météo ») LE TAPIS CLAIRSEMÉ :
   la mer de cumulus ne couvre plus tout le dessous — des ÎLOTS (la couverture TAPIS_M : plus c'est haut, moins il y en a), l'air de l'horizon entre eux ; plus dense là où
   le premier plan l'est (l'orage). `?tapis=0` = le tapis plein d'avant, `?tapis=.5` pour essayer. */
const TAPIS=(function(){const m=/[?&]tapis=([0-9.]+)/.exec(location.search);return m?+m[1]:1;})(),TAPIS_M={matin:.60,midi:.56,aprem:.52,soir:.54,nuit:.50,orage:.34,pluie:.46,menu:.50};
function tapisPose(m){skyU.uTapis.value=TAPIS?(TAPIS_M[m]||.55)*Math.min(1,TAPIS):0;}
function cielArcPose(m,k){tapisPose(m);const U=skyU,A=CIEL_ARC[m],on=ARC_ON&&CARC.force!==0&&A&&k>.001,tp=on&&cielArcTex(A.f),tm=on&&cielArcMer();
  if(tp){U.uPhT.value=tp;U.uPh.value.set(k,A.su,A.se*Math.PI/180,A.ex);U.uPh2.value.y=A.ns||0;}else U.uPh.value.x=0;
  if(tm&&!A.mi){U.uMrT.value=tm;U.uMr.value.x=1;U.uTMerH.value.fromArray(A.mh);U.uTMerO.value.fromArray(A.mo);U.uTSol.value.fromArray(A.s);for(let i=0;i<3;i++)N8_U.uLav.value.setComponent(i,[.72,.78,.97][i]*.5+Math.min(.97,A.mo[i]*1.4)*.5);}else U.uMr.value.x=0;} /* (2026-10-20, Léo : « les nuages du premier plan et l'arrière-plan n'ont pas la même couleur ») l'ombre des cumulus en cubes prend à moitié celle du TAPIS (mo) : même famille de bleus / mauves, par météo */
function nuFondPose(P,k){const U=skyU;U.uTi.value.set(k,P.ca,0,P.hz);U.uTi2.value.set(P.tw||0,P.ry||0,P.cr||.35,0);
  U.uTZen.value.fromArray(P.z);U.uTMid.value.fromArray(P.m);U.uTHor.value.fromArray(P.h);U.uTSol.value.fromArray(P.s);U.uTMerH.value.fromArray(P.mh);U.uTMerO.value.fromArray(P.mo);U.uTCir.value.fromArray(P.c);}
/* L'ARC-EN-CIEL DE LA PLUIE (2026-10-21) : allumé en douceur quand la météo est la PLUIE (en course, ou — au menu — quand ce ciel est choisi) ; force .3, « léger ». `?arc=...` n'existe pas : `dbgArcEC(x)` pour essayer. */
const ARCEC={cible:null};
function arcEcTick(dt){const U=skyU.uArcE.value,c=LVL&&LVL.cur,run=started&&!gameOver&&c&&c.carte==='nuages';
  let t=run?(c.meteo==='pluie'?.3:0):((typeof TITRE_HF!=='undefined'&&TITRE_HF.h==='pluie')?.3:0);if(ARCEC.cible!=null)t=ARCEC.cible;U.x+=(t-U.x)*Math.min(1,dt*1.6);if(U.x<.002&&t===0)U.x=0;}
window.dbgArcEC=function(x,l,h){ARCEC.cible=x==null?null:+x;if(l!=null)skyU.uArcE.value.y=+l;if(h!=null)skyU.uArcE.value.z=+h;return skyU.uArcE.value.toArray();}; // (banc) x force · l demi-largeur (rad) · h hauteur du soleil forcée (rad)
/* L'ORAGE AU MENU / EN COURSE : les FILS d'électricité dans les nuages (filTick, zones-caisses.js) — sur la map orage, en course et au menu quand ce ciel est choisi ; les cumulus luisent d'un violet sourd. */
const MENU_ECL={on:false};
function menuEclTick(dt){const c=LVL&&LVL.cur,run=started&&!gameOver,o=run?!!(c&&c.carte==='nuages'&&c.meteo==='orage'&&mode!=='boom'):(typeof TITRE_HF!=='undefined'&&TITRE_HF.h==='orage'),U=N8_U;
  filTick(dt,o);
  if(!run){if(o){U.uMood.value.set(1,.1,0,0);U.uInC.value.set(.62,.5,1);MENU_ECL.on=true;}else if(MENU_ECL.on){MENU_ECL.on=false;U.uMood.value.set(1,0,0,0);}}}
function nuFondTick(dt){arcEcTick(dt);menuEclTick(dt);if(!(started&&!gameOver)&&typeof nuPouTick==='function')nuPouTick(dt,performance.now()*.001); // le nuage qui flotte au titre
  // à chaque image : la mer de nuages en course → le fond peint (il APPARAÎT en 0,7 s au portail) ; ailleurs, éteint
  if(typeof CHUTE!=='undefined'&&CHUTE.on){skyU.uPh.value.x=0;skyU.uMr.value.x=0;tapisPose('menu');return;} // (le menu peint son ciel lui-même)
  const c=LVL&&LVL.cur,T=(NUF.force!==0)&&c&&c.carte==='nuages'&&!PARK.on?NU_FOND[c.meteo]:null;if(T)NUF.T=T;
  NUF.k+=((T?1:0)-NUF.k)*(NUF.force!=null?1:Math.min(1,dt*1.5));
  if(!T&&NUF.k<.002){if(!(c&&c.carte==='nuages'))tapisPose('menu');if(NUF.on){skyU.uTi.value.x=0;NUF.on=false;}NUF.k=0;skyU.uPh.value.x=0;skyU.uMr.value.x=0;return;}
  if(NUF.T){nuFondPose(NUF.T,NUF.k);NUF.on=true;cielArcPose(c&&c.meteo,NUF.k);}}
window.dbgCielArc=function(k,o){if(k!==undefined)CARC.force=k==null?null:+k;o=o||{};const c=LVL&&LVL.cur,m9=c&&c.meteo; // (banc) A/B sur la même image : 0 = le main d avant (fond peint + mer peinte + fantômes), 1 = l essai
  if(k===0||k===1){const S9=SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio];if(B9&&CIEL_ARC[m9]&&NUF.av[m9]){B9.fog=(k===0?(NUF.ap0||{})[m9]||NUF.av[m9].fog:CIEL_ARC[m9].h).slice();bioGo(S9.bio,.01);bioStep(1);}
    const d9=k===0?'fantome':'verre';if(NV_DOSES[d9]&&o.nuages!==false)dbgNuVit(1,{dose:d9});}
  for(const q in o)if(CIEL_ARC[m9]&&q in CIEL_ARC[m9])CIEL_ARC[m9][q]=o[q];
  if(o.mr)skyU.uMr.value.set(skyU.uMr.value.x,o.mr[0],o.mr[1],o.mr[2]);if(o.mr2)skyU.uMr2.value.fromArray(o.mr2); // (banc) la profondeur, la tuile, la couverture · le relief, la brume, l abîme, l ombre
  nuFondTick(1);if(paused||o.rendre){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  return {on:ARC_ON,force:CARC.force,meteo:m9,uPh:skyU.uPh.value.toArray().map(function(v){return +v.toFixed(3);}),uMr:skyU.uMr.value.toArray(),photo:Object.keys(CARC.tex).filter(function(f){return CARC.tex[f].pret;}),mer:!!(CARC.mer&&CARC.mer.pret),dose:NUVIT.dose};};
window.dbgNuFond=function(k){NUF.force=k==null?null:+k; // (banc) même image : 0 = le ciel d'avant (et sa brume), 1 = le fond peint
  const c=LVL&&LVL.cur,m9=c&&c.meteo,S9=SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio],E9=(+k===0?NUF.av:NUF.ap)[m9];
  if(B9&&E9){Object.assign(B9,JSON.parse(JSON.stringify(E9)));bioGo(S9.bio,.01);bioStep(1);}nuFondTick(1);
  if(paused||arguments[1]){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  let px=null;if(arguments[1]){const gl=renderer.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,b=new Uint8Array(4);px=[];for(const q of [[.1,.9],[.5,.95],[.9,.9],[.1,.6]]){gl.readPixels(Math.round(q[0]*W),Math.round(q[1]*H),1,1,gl.RGBA,gl.UNSIGNED_BYTE,b);px.push([b[0],b[1],b[2]]);}} // (banc) des pixels du haut de l image
  return {on:NUF.on,k:+NUF.k.toFixed(2),meteo:m9,uTi:+skyU.uTi.value.x.toFixed(2),px:px};};
/* l'heure du TÉLÉPHONE + la saison → l'ambiance (2026-10-25) : les bornes suivent le soleil du jour (voir titreSoleil), plus des heures fixes.
   nuit jusqu'à 45 min avant le lever · AUBE jusqu'à 20 min après · matin jusqu'à 2 h avant le midi solaire · midi jusqu'à 2 h après · après-midi
   jusqu'à 1 h 25 avant le coucher · golden hour jusqu'au coucher (+ 6 min) · soir jusqu'à 1 h 25 après · nuit. À Paris : en juin le soir dure
   jusqu'à 23 h 30, en décembre la golden hour commence à 15 h 30. */
function titreHeureDe(d,zone){const L=titreLieu(d,zone),S=titreSoleil(d,L[0],L[1]),h=d.getHours()+d.getMinutes()/60,mi=(S.lever+S.coucher)/2;
  return h<S.lever-.75?'nuit':h<S.lever+.35?'aube':h<mi-2?'matin':h<mi+2?'midi':h<S.coucher-1.4?'aprem':h<S.coucher+.1?'golden':h<S.coucher+1.4?'soir':'nuit';}
const TITRE_HF={h:null,force:null,tc:0,tcol:new THREE.Color(1,1,1)};
{const q9=(location.search.match(/[?&]heure=([a-zé\-]+)/i)||[])[1];if(q9){const n9=q9.toLowerCase().replace('apres-midi','aprem').replace('après-midi','aprem').replace('goldenhour','golden');if(TITRE_H[n9])TITRE_HF.force=n9;}}
function titreHeurePose(h){ // pose UNE heure : son ambiance (chuteRender la verra changer et la réappliquera), ses réglages, ses voiles, sa teinte
  const H=TITRE_H[h];if(!H)return;TITRE_HF.h=h;
  BIOMES.titre=BIOMES[H.bio];
  const ks={};for(const n in TITRE_H)for(const k in TITRE_H[n].P)ks[k]=1;
  for(const k in ks)CHUTE_P[k]=JSON.parse(JSON.stringify(H.P[k]!==undefined?H.P[k]:CHUTE_P0[k]===undefined?null:CHUTE_P0[k]));
  CHUTE.L=-1; // l'angle regard ↔ soleil a pu changer : le regard se recalcule
  const bs=document.body.style;bs.setProperty('--tvC',H.v[0]);bs.setProperty('--tvA',H.v[1]);bs.setProperty('--tvA2',H.v[2]);bs.setProperty('--tvB',H.v[3]);bs.setProperty('--tvBA',H.v[4]);
  document.body.dataset.heure=h;
  TITRE_HF.tcol.setRGB(H.t[0],H.t[1],H.t[2]);if(CHUTE.w)for(const w of CHUTE.w)w.sp.material.color.copy(TITRE_HF.tcol);
}
function titreHeureTick(dt){ // l'heure, relue toutes les 20 s (un menu laissé ouvert passe de l'après-midi à la golden hour)
  TITRE_HF.tc-=dt;if(TITRE_HF.h&&TITRE_HF.tc>0)return;TITRE_HF.tc=20;
  const h=TITRE_HF.force||titreHeureDe(new Date());if(h!==TITRE_HF.h)titreHeurePose(h);
}
window.dbgHeure=function(h){ // (dev) forcer une heure du titre : dbgHeure('golden') · dbgHeure(null) : l'horloge du téléphone
  if(h!==undefined){TITRE_HF.force=h&&TITRE_H[h]?h:null;TITRE_HF.tc=0;titreHeureTick(0);}
  var L9=titreLieu(new Date()),S9=titreSoleil(new Date(),L9[0],L9[1]);return {heure:TITRE_HF.h,forcee:TITRE_HF.force,horloge:titreHeureDe(new Date()),lever:+S9.lever.toFixed(2),coucher:+S9.coucher.toFixed(2),heures:TITRE_HEURES};};
window.dbgTitre=function(h,o){ /* banc (2026-10-14, passe graphismes) : retoucher à chaud une heure du titre : dbgTitre('midi',{ciel:{z:[..],h:[..]},amb:{fog:[..]},P:{..},v:[..],t:[..]}) ; la repose aussitôt */
  const H=TITRE_H[h];if(!H||!o)return null;if(o.ciel)Object.assign(TITRE_CIEL[h],JSON.parse(JSON.stringify(o.ciel)));if(o.amb)Object.assign(BIOMES[H.bio],JSON.parse(JSON.stringify(o.amb)));if(o.P)Object.assign(H.P,JSON.parse(JSON.stringify(o.P)));if(o.v)H.v=o.v.slice();if(o.t)H.t=o.t.slice();
  TITRE_HF.force=h;TITRE_HF.tc=0;titreHeurePose(h);CHUTE.bioT=null;return {ciel:TITRE_CIEL[h],amb:BIOMES[H.bio].nm};};
/* LA CAISSE AU DOIGT, AU CIEL — v2 « TRASH » (2026-10-07, Léo : « dans le menu ciel la voiture doit pouvoir être tournée, tapée, balancée ;
   le clic sur elle doit être plus trash ») — remplace LE TAPOTEMENT AU CIEL du 03/10 (mêmes points d'entrée : chuteTape, chuteTapeTick).
   · TAPÉE (un tap SUR la caisse) : le COUP part du point touché, dans le sens du rayon — une vraie poussée (V), le couple r × F (W : taper
     le nez ne la fait pas tourner comme taper l'aile) et une part de CHAOS (deux coups ne tombent jamais pareil). Au point d'impact : l'éclat,
     une gerbe d'ÉTINCELLES, des MORCEAUX DE TÔLE à ses couleurs qui s'arrachent et que l'air emporte vers le haut (elle tombe, eux freinent) ;
     la caméra encaisse (secousse + coup de zoom), la tôle craque (pose.choc + debris.tole, pose.lourde quand ça s'emballe), le téléphone vibre.
     LE COMBO : des coups rapprochés (< 0,7 s) frappent de plus en plus fort (×1 → ×2,75) — tapée en rafale, elle part en vrille.
   · TOURNÉE (un glissé qui PART de la caisse — ailleurs le glissé fait toujours tourner la vue) : elle tourne sous le doigt comme une boule
     (gauche-droite autour de la verticale de l'écran, haut-bas autour de son horizontale) et se laisse un peu tirer.
   · BALANCÉE (lâchée en mouvement) : elle garde l'élan du doigt — elle part en toupie et file dans le sens du lancer.
   · LE RETOUR : deux ressorts. La position revient (K/C). La rotation est un QUATERNION (plus un vecteur) : on peut lui faire faire trois
     tours, elle ne les « détord » pas — elle revient par le plus court chemin à son attitude de chute. Tant qu'elle tourne vite (> WL rad/s)
     le ressort la LÂCHE (toupie libre), puis il la rattrape en deux ou trois balancements.
   Rien de neuf à compiler : les morceaux sont des Phong nus (le programme des éclats), étincelles et éclat sont ceux du jeu.
   Réglages : CHUTE_TAP (V/W/WMAX/CHAOS le coup, K/C/KR/CR les ressorts, WL la toupie, TR/TT le doigt). dbgTape() : l'état ; dbgTape('coup')
   frappe la caisse en son centre (banc). */
const CHUTE_TAP={p:new THREE.Vector3(),v:new THREE.Vector3(),Q:new THREE.Quaternion(),w:new THREE.Vector3(),q:new THREE.Quaternion(),
  ray:new THREE.Raycaster(),nd:new THREE.Vector2(),a:new THREE.Vector3(),b:new THREE.Vector3(),o:new THREE.Vector3(),n9:new THREE.Vector3(),
  cR:new THREE.Vector3(),cU:new THREE.Vector3(),pT:new THREE.Vector3(),col:new THREE.Color(),fl:null,flT:9,flS:1,
  V:10,W:6.5,WMAX:20,CHAOS:6,HS:.07,hs:0, /* (2026-10-14, Léo : « augmente l'impact des coups ») poussée ×1,33, pivot ×1,3 ; HS = l'ARRÊT SUR IMAGE au contact (s) */
  K:12,C:2.4,KR:16,CR:1.9,WL:3,TR:.011,TT:.012,PMAX:7,PL:5.5,
  n:0,combo:0,cT:-9,sh:0,deb:null,debM:null,tient:null};
/* LE DOIGT DE BIENVENUE (2026-10-15 soir, Sacha : « une sorte d'icône avec un doigt qui clignote sur la voiture la première fois […] un peu
   accueillant pour la première connexion ») — le dessin et le mouvement : <style id="accueilDoigt">. Montré tant que la caisse du titre n'a
   jamais été tapée (SAVE.d.ast, bit 256), sur l'ACCUEIL seulement (la coque sur « home », le voile d'ouverture parti, ni piqué, ni volet, ni
   auto-école), après 1,2 s d'accueil à l'écran. Le bout du doigt suit le centre de la caisse projeté, LISSÉ (elle tremble dans le vent de la
   chute : la main ne tremble pas avec), gardé dans l'écran pour que la bulle tienne. Le DOM n'est écrit que si la place change d'un pixel.
   La main (16 × 18) : o encre, w gant, g ombre du gant, y/d manchette d'or. */
const CH_DOIGT={el:null,fini:false,on:false,t:0,x:-1,y:-1,tx:'',r:null,rT:0,v:new THREE.Vector3(),BIT:256,
  G:['.....oo.........','....owwo........','....owgo........','....owgo........','....owgo........','....owgooo......','....owgowgooo...',
     '....owgowgowgoo.','.oo.owgowgowgowo','owgoowgowgowgowo','owwwowwwwwwwwwgo','.owwwwwwwwwwwwgo','..owwwwwwwwwwwgo','..owwwwwwwwwwwgo',
     '...owwwwwwwwwgo.','....oyyyyyyyydo.','....oyyyyyyyydo.','....ooooooooooo.'],
  C:{o:'#1c0430',w:'#ffffff',g:'#c8bde8',y:'#ffd75e',d:'#c8901a'}};
try{Object.assign(I18N,{'BIENVENUE !':'WELCOME!','TAPE TA CAISSE':'TAP YOUR CAR'});}catch(e){}
function chuteDoigtEl(){const D=CH_DOIGT;if(D.el)return D.el;const el=document.getElementById('chDoigt');if(!el)return null;
  let r='';for(let y=0;y<D.G.length;y++)for(let x=0;x<16;x++){const c=D.C[D.G[y][x]];if(c)r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+c+'"/>';}
  el.style.setProperty('--cdSvg','url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18" shape-rendering="crispEdges">'+r+'</svg>')+'")');
  return D.el=el;}
function chuteDoigtMontre(v){const D=CH_DOIGT;if(!v)D.t=0;if(D.on===v)return;D.on=v;if(D.el)D.el.classList.toggle('on',v);}
function chuteDoigtTick(dt,Ck,G){const D=CH_DOIGT;if(D.fini)return;
  if((SAVE.d.ast|0)&D.BIT){D.fini=true;chuteDoigtMontre(false);return;}
  if(G||!carGroup.visible||TUTO.on||BIENV.on||PLQ.on||PLQ.prof||ecranWipe._on||!overlay||overlay.getAttribute('data-ecran')!=='home'||document.getElementById('splash')){chuteDoigtMontre(false);return;} /* (pas `overlay.style.display` : au ciel, la feuille du garage-menu montre l'accueil par-dessus un display:none écrit en ligne) */
  const el=chuteDoigtEl();if(!el){D.fini=true;return;}
  D.rT-=dt;if(D.rT<=0||!D.r){D.rT=.5;D.r=renderer.domElement.getBoundingClientRect();} // la place du canevas (le cadre de l'ordi le décale) : relue deux fois par seconde
  const R=D.r;D.v.copy(Ck).project(camera);if(!(R.width>0)||D.v.z>1){chuteDoigtMontre(false);return;}
  let sx=R.left+(D.v.x*.5+.5)*R.width,sy=R.top+(.5-D.v.y*.5)*R.height;
  sx=Math.max(R.left+96,Math.min(R.right-96,sx));sy=Math.max(R.top+24,Math.min(R.bottom-132,sy)); // la bulle (sous la main) reste dans l'écran
  if(D.x<0){D.x=sx;D.y=sy;}else{const k=1-Math.exp(-dt*5);D.x+=(sx-D.x)*k;D.y+=(sy-D.y)*k;}
  const tx='translate3d('+Math.round(D.x)+'px,'+Math.round(D.y)+'px,0)';if(tx!==D.tx){D.tx=tx;el.style.transform=tx;}
  D.t+=dt;if(D.t>1.2)chuteDoigtMontre(true);}
function chuteDoigtFini(){const D=CH_DOIGT;if(D.fini||(!D.on&&D.t<.3))return;D.fini=true; // le 1er coup sur la caisse : la main s'envole, pour toujours — (banc) sauf le tap qui ferme le voile d'ouverture et retombe sur la caisse (D.t < 0,3 s d'accueil) : il ne compte pas
  SAVE.d.ast=(SAVE.d.ast|0)|D.BIT;try{SAVE.flush();}catch(e){} /* écrit tout de suite : l'appli fermée juste après ne la remontre pas */
  const el=D.el;if(el&&D.on){el.classList.add('fini');setTimeout(function(){el.classList.remove('on','fini');},600);}else if(el)el.classList.remove('on');D.on=false;}
function chuteVisible(o){for(let x=o;x;x=x.parent)if(!x.visible)return false;return true;}
function chuteVise(e){ // le rayon du doigt : la 1re pièce VISIBLE et opaque de la caisse, ou rien
  if(!CHUTE.on||CHUTE.go||!carGroup.visible)return null;
  const T=CHUTE_TAP,r=renderer.domElement.getBoundingClientRect();T.nd.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  camera.updateMatrixWorld();T.ray.setFromCamera(T.nd,camera);
  for(const x of T.ray.intersectObject(carGroup,true)){const m=x.object.material;
    if(!x.object.isMesh||!chuteVisible(x.object))continue;if(m&&(m.blending===THREE.AdditiveBlending||(m.transparent&&m.opacity<.5)))continue;return x;}
  return null;
}
function chuteAxes(){const T=CHUTE_TAP;T.cR.set(1,0,0).applyQuaternion(camera.quaternion);T.cU.set(0,1,0).applyQuaternion(camera.quaternion);} // la droite et le haut de l'ÉCRAN, dans le monde
function chuteDebris(){ // les morceaux de tôle (une fois) : 16 boîtes sur UNE géométrie, trois Phong nus (sa couleur, son accent, le noir du dessous)
  const T=CHUTE_TAP;if(T.deb)return;const g=new THREE.BoxGeometry(1,1,1);g.userData.partage=true;
  T.debM=[new THREE.MeshPhongMaterial({color:0xff5a2a,shininess:80,specular:0x777777}),new THREE.MeshPhongMaterial({color:0xffffff,shininess:80,specular:0x777777}),new THREE.MeshPhongMaterial({color:0x17151c,shininess:30,specular:0x333333})];
  T.deb=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(g,T.debM[i%3]);m.visible=false;m.castShadow=m.receiveShadow=false;scene.add(m);
    T.deb.push({m:m,v:new THREE.Vector3(),w:new THREE.Vector3(),t:0,vie:1,s:new THREE.Vector3()});}
  T.di=0;
}
function chuteTape(e){ // TAPÉE : le coup
  const h=chuteVise(e);if(!h)return false;
  try{chuteDoigtFini();}catch(_){} /* (2026-10-15 soir) le doigt de bienvenue a servi */
  const T=CHUTE_TAP,d=T.ray.ray.direction,c=CHUTE.ctr||carGroup.position,now=performance.now()/1000;
  T.combo=now-T.cT<.7?Math.min(6,T.combo+1):1;T.cT=now;const mu=1+.35*(T.combo-1);  // LE COMBO : ×1 → ×2,75
  chuteAxes();const lt=(Math.random()-.5)*2,lu=Math.random()*.8-.2;                       // la poussée : dans le sens du doigt, et DE CÔTÉ (repoussée au loin seulement, elle rapetissait)
  T.v.addScaledVector(d,T.V*mu*.5).addScaledVector(T.cR,T.V*mu*.5*lt).addScaledVector(T.cU,T.V*mu*.5*lu);if(T.v.length()>T.V*3)T.v.setLength(T.V*3);
  T.a.subVectors(h.point,c).cross(d).multiplyScalar(T.W*mu);T.w.add(T.a);                  // le pivot : r × F
  T.w.x+=(Math.random()-.5)*T.CHAOS*mu;T.w.y+=(Math.random()-.5)*T.CHAOS*mu;T.w.z+=(Math.random()-.5)*T.CHAOS*mu; // le chaos
  if(T.w.length()>T.WMAX)T.w.setLength(T.WMAX);
  T.sh=Math.min(2.3,T.sh+.85*mu);T.hs=T.HS*(T.combo>=3?1.35:1);                          // la caméra encaisse (14/10 : plus fort) — et l'arrêt sur image : la caisse fige 70 ms au contact, puis part
  // la normale de la face touchée (dans le monde), pour faire gicler étincelles et morceaux
  const n=T.n9;if(h.face)n.copy(h.face.normal).transformDirection(h.object.matrixWorld);else n.copy(d).negate();if(n.dot(d)>0)n.negate();
  if(!T.fl&&RICH.texEt){T.fl=new THREE.Sprite(new THREE.SpriteMaterial({map:RICH.texEt,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));T.fl.renderOrder=999;T.fl.visible=false;scene.add(T.fl);} // (2026-10-08) l'éclat d'impact : une ÉTOILE nette (la boule floue faisait « naïf »)
  if(!T.fl){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,240,200,.85)');g.addColorStop(1,'rgba(255,210,140,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
    T.fl=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    T.fl.renderOrder=999;T.fl.visible=false;scene.add(T.fl);}
  T.fl.position.copy(h.point).addScaledVector(d,-.15);T.flT=0;T.flS=1.45+.55*(mu-1);T.fl.visible=true;T.fl.material.rotation=Math.random()*3;T.n++;
  try{caisseAction();}catch(_){} // (2026-10-20, Léo) L'ACTION SPÉCIALE de la caisse tapée (voir caisseAction)
  const P=h.point;richCoup(P,n,d,mu,T.combo); // (2026-10-08) LES ÉTINCELLES v2 et LA PLUIE DE RICHESSE (voir ce bloc) — les gerbes sparkGold/dust d'avant, « brutes, naïves », sont retirées
  chuteDebris();const sp=CARS[garageI]||CARS[0];                                         // LES MORCEAUX DE TÔLE, à ses couleurs
  {const M9=Array.isArray(h.object.material)?h.object.material[0]:h.object.material,G9=h.object.geometry,ca=G9&&G9.attributes&&G9.attributes.color; // la couleur de la PIÈCE touchée (sa couleur de sommet × sa matière)
   if(M9&&M9.color)T.debM[0].color.copy(M9.color);else T.debM[0].color.setHex(sp.color!=null?sp.color:0xff5a2a);
   if(ca&&h.face&&M9&&M9.vertexColors){const i9=h.face.a;T.col.setRGB(ca.getX(i9),ca.getY(i9),ca.getZ(i9));T.debM[0].color.multiply(T.col);}
   T.debM[1].color.setHex(sp.accent!=null?sp.accent:0xdddddd);}
  const nd=Math.min(T.deb.length,Math.round(3+2*mu));
  for(let i=0;i<nd;i++){const D=T.deb[T.di];T.di=(T.di+1)%T.deb.length;const sp9=4+Math.random()*6*mu,m=D.m;
    m.position.copy(P).addScaledVector(n,.05);D.v.set(n.x*sp9+(Math.random()-.5)*5,n.y*sp9+(Math.random()-.5)*5+1.5,n.z*sp9+(Math.random()-.5)*5);
    D.w.set((Math.random()-.5)*16,(Math.random()-.5)*16,(Math.random()-.5)*16);m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
    const k9=.5+Math.random()*.8;D.s.set(.34*k9,.05+.05*Math.random(),.24*k9);m.scale.copy(D.s);D.t=0;D.vie=1.3+Math.random()*.9;m.visible=true;}
  try{if(SONV2){if(richSon()){sfx('riche.coup',{vol:-1+3*Math.min(1,mu-1)});sfx('riche.combo',{st:RICH_PD[Math.min(RICH_PD.length-1,T.combo-1)],vol:-3+2*Math.min(1,(T.combo-1)/4),t:.012});} /* (2026-10-16) LE COUP et la note du COMBO qui monte d'un degré à chaque coup de la rafale (voir <<<RICHESSE>>> dans l'atelier) */
      else{sfx('pose.choc',{vol:1+3*Math.min(1,mu-1)});sfx('debris.tole',{vol:3,t:.03});if(T.combo>=2)sfx('pose.lourde',{vol:-2+2*Math.min(1,(T.combo-2)/3),t:.02});}}else{chimeNote(340,0,.05,.10);noiseBurst(.18,.08,900);}}catch(_){} /* la tôle qui encaisse — de plus en plus lourd (l'ancien jeu de sons en repli, banque d'avant) */
  try{hap(T.combo>=3?[40,20,55]:[32,14,26]);}catch(_){}
  return true;
}
function chutePrend(e){ // le doigt se pose : SUR la caisse, il la tient (sinon : la vue, comme avant)
  const T=CHUTE_TAP;T.tient=null;if(!chuteVise(e))return false;
  T.tient={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0,drag:false,wR:new THREE.Vector3()};return true;
}
function chuteTourne(e){ // le doigt glisse sur la caisse : elle tourne comme une boule et se laisse tirer
  const T=CHUTE_TAP,H=T.tient;if(!H)return;const dx=e.clientX-H.x,dy=e.clientY-H.y,n9=performance.now(),dm=Math.max(8,n9-H.t)/1000;
  if(!H.drag&&Math.hypot(e.clientX-H.x0,e.clientY-H.y0)>=14)H.drag=true;
  chuteAxes();
  if(H.drag&&(dx||dy)){T.q.setFromAxisAngle(T.cU,dx*T.TR);T.Q.premultiply(T.q);T.q.setFromAxisAngle(T.cR,dy*T.TR);T.Q.premultiply(T.q);T.Q.normalize();
    T.a.copy(T.cU).multiplyScalar(dx*T.TR/dm).addScaledVector(T.cR,dy*T.TR/dm);H.wR.multiplyScalar(.5).addScaledVector(T.a,.5);T.w.set(0,0,0);}
  H.vx=H.vx*.5+dx/dm*.5;H.vy=H.vy*.5+dy/dm*.5;H.x=e.clientX;H.y=e.clientY;H.t=n9;
  T.pT.copy(T.cR).multiplyScalar((H.x-H.x0)*T.TT).addScaledVector(T.cU,-(H.y-H.y0)*T.TT);{const l9=T.pT.length();if(l9>1e-6)T.pT.setLength(T.PL*Math.tanh(l9/T.PL));} /* (2026-10-08, Léo : « on doit pouvoir amener la voiture plus loin, sans trop de contrôle ») une butée ÉLASTIQUE (tanh) au lieu du mur à 2,5 m : les petits gestes sont les mêmes, et plus on tire, plus elle résiste — jusqu'à ~5 m (PL) ; elle suit toujours le doigt EN RESSORT, avec son retard */
}
function chuteLache(){ // le doigt se lève après un glissé : BALANCÉE — elle garde l'élan du doigt
  const T=CHUTE_TAP,H=T.tient;T.tient=null;if(!H||!H.drag)return;
  if(performance.now()-H.t>90){T.w.set(0,0,0);return;}                                   // le doigt s'était arrêté : elle revient d'elle-même
  T.w.copy(H.wR);if(T.w.length()>T.WMAX)T.w.setLength(T.WMAX);
  chuteAxes();T.v.addScaledVector(T.cR,H.vx*T.TT*.9).addScaledVector(T.cU,-H.vy*T.TT*.9);if(T.v.length()>T.V*3)T.v.setLength(T.V*3);
  if(T.w.length()>4)try{if(SONV2)sfx('debris.tole',{vol:-6,rate:.8});hap(10);}catch(_){}
}
function chuteTapeTick(dt,C,up,sc){ // les deux ressorts, l'éclat, les morceaux, les étincelles ; la caisse tourne autour de son CENTRE (C), pas de son origine
  const T=CHUTE_TAP,H=T.tient,tient=!!(H&&H.drag);CHUTE.ctr=C;let k=Math.min(dt,.05);if(T.hs>0){T.hs-=dt;k*=.06;} // (14/10) l'ARRÊT SUR IMAGE : 70 ms presque figée, puis le coup part
  if(tient){T.v.addScaledVector(T.a.subVectors(T.p,T.pT),-T.K*1.8*k).multiplyScalar(Math.exp(-T.C*2*k));}   // tenue : elle suit le doigt, en ressort
  else T.v.addScaledVector(T.p,-T.K*k).multiplyScalar(Math.exp(-T.C*k));
  T.p.addScaledVector(T.v,k);if(T.p.length()>T.PMAX)T.p.setLength(T.PMAX);
  if(!tient){let qw=T.Q.w,s9=1;if(qw<0){s9=-1;qw=-qw;}const sn=Math.sqrt(Math.max(0,1-qw*qw)),an=2*Math.atan2(sn,qw); // l'écart à l'attitude de chute, par le plus court chemin
    if(sn>1e-7)T.a.set(T.Q.x*s9,T.Q.y*s9,T.Q.z*s9).multiplyScalar(an/sn);else T.a.set(0,0,0);
    const wl=T.w.length()/T.WL,kr=T.KR/(1+wl*wl);                                      // toupie : tant qu'elle tourne vite, le ressort la lâche
    T.w.addScaledVector(T.a,-kr*k).multiplyScalar(Math.exp(-T.CR*(.35+.65/(1+wl*wl))*k)); // (lancée, l'air la freine moins : deux ou trois tours de toupie)
    const wa=T.w.length()*k;if(wa>1e-8){T.q.setFromAxisAngle(T.b.copy(T.w).divideScalar(T.w.length()),wa);T.Q.premultiply(T.q).normalize();}}
  T.sh*=Math.exp(-dt*5.5);if(T.sh<.003)T.sh=0;
  if(T.fl&&T.fl.visible){T.flT+=dt;const u=T.flT/.22;if(u>=1)T.fl.visible=false;else{T.fl.material.opacity=(1-u)*(1-u);const s9=(1.1+u*1.4)*sc*T.flS;T.fl.scale.set(s9,s9,1);}} // l'étoile s'ouvre et meurt vite
  if(T.deb)for(const D of T.deb){if(!D.m.visible)continue;D.t+=dt;if(D.t>=D.vie){D.m.visible=false;continue;} // les morceaux : l'air les emporte vers le HAUT (elle tombe, eux freinent)
    D.v.multiplyScalar(Math.exp(-dt*.9));D.v.y+=9*dt;D.m.position.addScaledVector(D.v,dt);D.m.rotation.x+=D.w.x*dt;D.m.rotation.y+=D.w.y*dt;D.m.rotation.z+=D.w.z*dt;
    const f9=Math.min(1,(D.vie-D.t)/.35);D.m.scale.copy(D.s).multiplyScalar(f9);}
  if(!(running&&!paused&&!gameOver)){updatePool(sparkGold,dt,3);updatePool(dust,dt,2);}  // au menu, la boucle de course ne les fait pas vivre
  richTick(dt,C); // (2026-10-08) LA PLUIE DE RICHESSE : objets, étincelles, flamme, éclats
  if(!tient&&T.p.lengthSq()+T.v.lengthSq()+T.w.lengthSq()<1e-8&&1-Math.abs(T.Q.w)<1e-10){T.Q.identity();return;}
  carGroup.quaternion.premultiply(T.Q);
  T.o.copy(up).multiplyScalar(-.45*sc).applyQuaternion(T.Q);carGroup.position.copy(C).add(T.o).add(T.p);
}
/* LA PLUIE DE RICHESSE — LA CAISSE QUI CRACHE (2026-10-08, Léo : « des billets (bleu turquoise foncé, léger reflet en dégradé vert clair
   fluo), des pièces comme les euros français, des bitcoins, de l'or (bouts de taille variée, luisants, bling), des diamants (taille variée,
   très beaux), des trèfles à quatre feuilles, des fruits ; le tap trash sur la voiture peut provoquer un petit jet de flamme très léger et
   des étincelles qui projettent ces objets au hasard — pas toujours, juste assez pour qu'on ait envie de le refaire ; inspire-toi des études
   sur le cerveau, effort / réconfort ; les étincelles d'avant étaient brutes, naïves, gamines : fais mieux »).
   LE CERVEAU (on s'en sert pour le plaisir du geste — aucun argent réel n'est en jeu, rien ne s'achète) :
   · Fiorillo, Tobler & Schultz 2003 (Science) : l'activité soutenue des neurones à dopamine est MAXIMALE quand la récompense a une chance
     sur deux (l'incertitude la plus forte) → un coup seul paie une fois sur deux environ (mesuré), jamais à coup sûr.
   · Schultz 1997-98 : la dopamine suit l'ÉCART à la prédiction, une récompense prévisible ne fait plus rien → la TAILLE est tirée elle
     aussi (petit / bon / gros / jackpot) et la composition change à chaque gerbe (un diamant, ça surprend).
   · Clark et al. 2009 (Neuron) : le PRESQUE (near-miss) recrute les circuits du gain et donne envie de rejouer, surtout quand c'est nous
     qui agissons → un coup sec sur trois laisse échapper une seule pièce, un éclat — presque.
   · Knutson et al. 2001 : l'ANTICIPATION d'un gain allume le noyau accumbens ; Inzlicht et al. 2018 (« effort paradox ») : l'EFFORT ajoute
     de la valeur → le COMBO (coups rapprochés) fait monter la chance ET la taille, ses étincelles chauffent jusqu'au blanc-or ; 80 ms de
     souffle entre le coup et la gerbe (le temps que ça monte).
   · Pas d'extinction : après 3 coups secs d'affilée, le suivant paie. Le TRÈFLE porte chance : il en sort un, les deux coups suivants +18 %.
   LA MATIÈRE — trois programmes à soi, compilés une fois à l'arrivée au ciel (sous l'écran titre) : le MÉTAL (pièces, bitcoin, or : le
   ciel reflété teinté par le métal, Fresnel, deux éclats spéculaires), la GEMME (le diamant : réfraction dispersée R/V/B après un rebond
   intérieur, feu arc-en-ciel par facette, reflet), le SOUPLE (billet et trèfle : le papier ondule, un reflet vert fluo glisse dessus). Les
   fruits sont ceux de la piste (fruitGeo / FRUIT_MAT, déjà compilés).
   L'AIR : la caisse tombe, l'air remonte autour d'elle (RICH.W m/s) — chaque objet freine selon sa forme : le billet et le trèfle planent
   et papillonnent, la pièce tourbillonne sur sa tranche, l'or et le diamant, denses, filent plus loin avant d'être emportés.
   LE BLING : un éclat en étoile quand une FACETTE renvoie le soleil vers l'œil (calculé, pas tiré au sort) — la pièce qui flashe en
   tournant, le diamant qui scintille.
   LES ÉTINCELLES v2 : des traits de métal en fusion qui REFROIDISSENT (blanc → jaune → orange → rouge sombre), allongés par leur vitesse,
   freinés par l'air, dont certains ÉCLATENT en deux (la meule) — même programme que les filets de vent (0 compilé).
   LA FLAMME : un jet bref et léger au point d'impact — le signal du gain (dorée au jackpot).
   Console : dbgRiche() l'état · dbgRiche('jackpot'|'gros'|'bon'|'petit'|'presque'|'rien') impose le prochain coup · dbgRiche('pluie',t)
   fait cracher la caisse sans coup (t = la taille). */
const RICH={pret:false,chauffe:0,objs:[],libres:{},sp:null,fl:[],gl:[],sec:0,chance:0,force:null,attente:[],
  n:{coups:0,gains:0,presque:0,jackpot:0},W:3,v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),q:new THREE.Quaternion(),
  H:new THREE.Vector3(),cam:new THREE.Vector3(),eu:new THREE.Euler(),
  v4:new THREE.Vector3(),v5:new THREE.Vector3(),v6:new THREE.Vector3(),q2:new THREE.Quaternion(),q3:new THREE.Quaternion(),mx:new THREE.Matrix4()}; // (2026-10-10) les vecteurs du papier qui tombe et de la liasse qui craque
const RICH_UP=new THREE.Vector3(0,1,0),RICH_BOSSE=.0045; // le relief des pièces : la hauteur (m, à l'échelle de la pièce) que donne le blanc de leur carte de hauteur — exagéré (le vrai fait 0,1 mm), sinon il ne se lit pas
const RICH_U={uLum:{value:0},uSunDir:{value:new THREE.Vector3().copy(SUN_DIR)},uSunCol:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uEnv:{value:envTex},uT:{value:0}};
// les objets : kd = freinage par l'air (1/s), fl = papillonnement (m/s²), w = rotation (rad/s), v = élan au départ (m/s), vie (s) ;
// flip = l'axe de la face (la pièce, le jeton et la carte tournent sur un DIAMÈTRE : ils « flashent ») ; nl = les facettes qui renvoient le
// soleil (le bling) ; gem = une gemme (scintille toujours un peu) ; gc = la teinte de son éclat.
// s = LA TAILLE (2026-10-08, Léo : « respecte bien la taille et la différence de chaque objet ») : la VRAIE taille de chaque objet, passée
// par UNE règle — taille à l'écran = 1,05 m × (taille réelle ÷ 15,6 cm)^0,55, le billet faisant 1,05 m (la puissance resserre l'écart, sans
// quoi un diamant ne ferait qu'un pixel) ; plafonnée à ~1,2 m (la bouteille, le crâne, la pastèque, la chaîne). Donc : une pièce de 2 € est
// plus grande qu'une de 1 € (25,75 / 23,25 mm), un jeton (39 mm) plus grand qu'une pièce, la carte (85,6 mm) plus petite que le billet,
// la liasse a la taille du billet, les gemmes et les pépites sont petites (et de tailles variées), chaque fruit a la sienne (la myrtille
// ne fait plus la taille de la pastèque). Les unités de s suivent la forme de chaque objet (rayon d'une pièce, longueur d'un billet…).
const RICH_GEM_NL=[[0,1,0],[.6,.55,.58],[-.7,.5,.3],[.2,.45,-.85],[-.3,-.7,.6]],RICH_OR_NL=[[0,1,0],[.7,.4,.5],[-.6,.5,-.4],[.2,-.6,.7]],RICH_FACE_Y=[[0,1,0],[0,-1,0]];
const RICH_FRUIT_R={MYRTILLE:.13,CERISE:.18,KIWI:.32,'PÊCHE':.34,'PÊCHE PLATE':.34,ORANGE:.36,MANGUE:.43,POMME:.36,MELON:.51,LITCHI:.23,BANANE:.57,GRENADE:.41,'PASTÈQUE':.6,KAKI:.34,PITAYA:.45,MANGOUSTAN:.30,'FIGUE DE BARBARIE':.36,DATTE:.25,'MELON DU DÉSERT':.46}; // (2026-10-20) PAR NOM, plus par rang : la liste des fruits a été refaite (fruits-nouveaux.js : myrtille, cerise, kiwi, pêche, orange, mangue, pomme, melon, litchi) et l'ancienne table par index donnait à la cerise le rayon de la banane, à l'orange celui de la myrtille, à la mangue celui de la pastèque — Léo : « je n'ai pas l'impression de tous les voir » // le RAYON (m) de chaque fruit, dans l'ordre de FRUIT_DEFS : pêche plate 7 cm, banane 18, grenade 10, orange 8, myrtille 1,2, pastèque 30 (plafonnée)
const RICH_T={
  billet:{kd:2.4,fl:5,s:[.88,.96],w:[2,6],v:[3,6],vie:[2.8,3.8],papier:1},                            // 156 × 66 mm → 1,05 m (s = sa longueur) · (2026-10-10, Léo : « un tout petit peu plus petits ») −12 % : 0,92 m — la liasse garde sa taille
  liasse:{kd:.9,fl:.3,s:[1,1.1],w:[3,7],v:[4,7],vie:[2.6,3.4]},                              // le billet, en paquet
  carte:{kd:1.5,fl:3,s:[.74,.77],w:[7,14],v:[4,8],vie:[2.6,3.4],flip:'z',nl:[[0,0,1],[0,0,-1]],gc:[1,1,1]}, // 85,6 × 54 mm → 0,75 m
  trefle:{kd:2.6,fl:4,s:[.44,.5],w:[2,6],v:[3,6],vie:[2.6,3.4],papier:1},                   // 3 cm → 0,42 m · papier : il tombe en feuille (richPapier)
  piece2:{kd:.8,fl:.6,s:[.193,.2],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[.92,.96,1]},  // 2 € : Ø 25,75 mm → 0,39 m (s = son rayon) — l'éclat de l'argent, froid
  piece1:{kd:.8,fl:.6,s:[.18,.187],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[1,.9,.62]}, // 1 € : Ø 23,25 mm → 0,37 m — l'or nordique, chaud
  piece50:{kd:.8,fl:.6,s:[.185,.192],w:[11,20],v:[4,8],vie:[2.4,3.2],flip:'y',nl:RICH_FACE_Y,gc:[1,.86,.55]}, // 50 c : Ø 24,25 mm → 0,38 m
  jeton:{kd:.85,fl:.6,s:[.24,.25],w:[10,18],v:[4,8],vie:[2.4,3.2],flip:'y'},                 // jeton de casino : Ø 39 mm → 0,49 m
  btc:{kd:.75,fl:.5,s:[.245,.26],w:[9,17],v:[4,8],vie:[2.6,3.4],flip:'y',nl:RICH_FACE_Y,gc:[1,.8,.5]},    // la pièce-souvenir : Ø 40 mm → 0,5 m
  montre:{kd:.7,fl:0,s:[.19,.2],w:[3,7],v:[4,8],vie:[2.6,3.4],nl:[[0,1,0],[0,.7,.7],[0,.7,-.7]],gc:[1,.95,.8]}, // la montre fermée : 6,5 cm de tour → 0,65 m
  or:{kd:.5,fl:0,s:[.11,.21],w:[3,9],v:[5,9],vie:[2.4,3.4],nl:RICH_OR_NL},                   // pépites de 1 à 3 cm → 0,23 à 0,42 m
  lingot:{kd:.55,fl:0,s:[.56,.88],w:[3,7],v:[4,8],vie:[2.4,3.4],nl:RICH_OR_NL},              // de 100 g (5 cm) à 1 kg (11,6 cm)
  chaine:{kd:1.1,s:[1.3,1.45],v:[4,7],vie:[2.8,3.6]},                                        // le collier de 50 cm, plafonné (s = sa longueur)
  cigare:{kd:.9,fl:0,s:[.26,.3],w:[2,5],v:[4,8],vie:[2.6,3.4],nl:[[0,1,0],[1,0,0],[-1,0,0]],gc:[1,.9,.7]}, // (2026-10-21, Léo : « un cigare avec sa bague dorée, des clés tout court ») le CIGARE : feuille brune, bague d'or, cendre grise ; ~15 cm → 0,5 m
  cles:{kd:.9,fl:0,s:[.3,.34],w:[2,5],v:[4,8],vie:[2.6,3.4],nl:[[0,0,1],[0,0,-1]],gc:[.97,.97,1]}, // le TROUSSEAU : un anneau, une clé d'or, une clé d'acier
  bague:{kd:.8,fl:0,s:[.3,.34],w:[3,7],v:[4,8],vie:[2.6,3.4],nl:RICH_GEM_NL,gem:1,gc:[.97,.97,1]}, // (2026-10-21, Léo : « ajoute une bague ») un solitaire : jonc d'or + diamant taille brillant ; ~2 cm de diamètre → 0,3 m
  diamant:{kd:.55,fl:0,s:[.08,.13],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:RICH_GEM_NL,gem:1,gc:[.95,.97,1]}, // 5 à 12 mm → 0,16 à 0,26 m
  rubis:{kd:.55,fl:0,s:[.085,.13],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:RICH_GEM_NL,gem:1,gc:[1,.5,.58]},
  emeraude:{kd:.55,fl:0,s:[.12,.17],w:[3,8],v:[5,9],vie:[2.6,3.6],nl:[[0,1,0],[.55,.55,0],[-.55,.55,0],[0,.5,.7],[0,-.6,.6]],gem:1,gc:[.6,1,.72]},
  champagne:{kd:.7,fl:0,s:[.9,.93],w:[3,7],v:[4,7],vie:[2.6,3.4]},                          // 30 cm → plafonnée à 1,2 m
  crane:{kd:.6,fl:0,s:[.22,.27],w:[2,4],v:[4,7],vie:[3,3.8],nl:[[0,1,0],[.5,.6,.6],[-.5,.6,.6]],face:1}, // un crâne de collection, 0,5-0,6 m (Léo : « plus petit ») — face : il part le regard vers la caméra et tourne sur lui-même
  coeur:{kd:1.25,fl:1.1,s:[.17,.25],w:[1.1,2.4],v:[2.5,6.5],vie:[2.4,3.4],face:1,bat:1,pop:1,nl:[[.32,.55,.77],[-.32,.55,.77],[0,.15,1]],gp:40,gs:1.15,gc:[1,.8,.93]}, // (2026-10-15, Léo) le PETIT CŒUR (s = sa largeur ; 2026-10-16, Léo : « plus petits, plus nombreux, et ils explosent — pas tous en même temps » : 17-25 cm, ils viennent en NUÉE (RICH_NUEE) et chacun ÉCLATE à son heure, pop) : léger, il flotte et papillonne un peu, se balance face à toi et BAT (bat, voir richTick), fait de minuscules cubes qu'on voit au travers (richCoeurCubes, RICH_FS_COEUR), et ses lobes scintillent doucement (gp : un éclat large, gs : une étoile à sa taille)
  fleur:{kd:1.3,fl:1.2,s:[.42,.6],w:[1,2],v:[3,6],vie:[3,3.8],fleur:1,nl:[[0,1,0]],gp:22,gs:.9,gc:[1,.92,.96]}, // (2026-10-16, Léo) une PETITE FLEUR (s = sa taille, 42-60 cm) : hibiscus, rose, lilas, lotus, lys ou tulipe — légère, elle flotte, se tourne de trois quarts vers toi et tourne lentement sur sa tige (richTick)
  fruit:{kd:1,fl:.4,s:[.94,1.06],w:[3,7],v:[3,6],vie:[2.4,3.2]}}; // fruit : s = un écart autour de SON rayon (RICH_FRUIT_R, par nom : la règle de taille donne rayon = 0,525 m × (diamètre en cm ÷ 15,6)^0,55 — cerise 2,2 cm, kiwi 6,5, pêche 7, orange 8, mangue 11, pomme 8, melon 15, litchi 3,5)
const RICH_CAP={billet:30,liasse:6,carte:6,trefle:6,jeton:12,montre:4,bague:6,cigare:5,cles:6,piece2:8,piece1:8,piece50:8,btc:7,or:14,lingot:5,diamant:18,rubis:12,emeraude:12,champagne:8,crane:6,coeur:22,fleur:12,fruit:8};
const RICH_PD=[0,2,4,7,9,12,14,16,19,21],RICH_MEL=[0,2,4,7,9,12,14,16,14,12,9,7,4,2]; // RICH_MEL : la mélodie des cœurs qui éclatent — elle monte puis redescend (un aller-retour, pas une chute)
function richSon(){const B=window.CCSON_BANQUE;return !!(B&&B.m&&B.m['riche.coup']);} // richSon : la banque a-t-elle les sons de la pluie de richesse ? (sinon, l'ancien jeu de sons)
 // (2026-10-16) la pentatonique en demi-tons (degré → st) : la note du combo, la mélodie des cœurs
const RICH_NUEE={petit:[.22,4,6],bon:[.35,6,9],gros:[.5,8,12],jackpot:[.75,12,16]}; // (2026-10-16) LA NUÉE DE CŒURS : la chance qu'une gerbe en porte une, combien de petits cœurs (min, max) // (la chaîne : son pool à elle, RICH.ch)
/* (2026-10-14, Léo : « diminue la quantité d'objets déversés lors des coups, garde la variété ; vise quelque chose d'addictif qui joue avec le
   besoin d'effort et de récompense ») LES GERBES MAIGRISSENT (≈ ÷2,5 : petit 1-2, bon 3-5, gros 6-9, jackpot 14-19 ; les répliques aussi), les
   MÉLANGES ne bougent pas (la variété reste) — et L'EFFORT DÉCIDE DE LA TAILLE : un coup isolé paie surtout PETIT (le jackpot n'y tombe
   presque jamais), la RAFALE (le combo) fait monter gros et jackpot (voir richTire). La rareté rend le gros lot lisible : il se MÉRITE. */
const RICH_TIER={ // la taille de la gerbe : combien, et quoi (poids)
  petit:  {n:[1,2],  fl:.75,w:{cles:1,billet:22,piece2:11,piece1:11,piece50:10,jeton:9,fruit:17,trefle:7,or:10,carte:4,rubis:6,emeraude:6,diamant:5,liasse:4,montre:1,fleur:9,champagne:2}},
  bon:    {n:[3,5],  fl:1,  w:{cles:2,cigare:1,bague:2,jeton:9,montre:3,billet:26,piece2:7,piece1:7,piece50:5,or:15,lingot:4,fruit:8,trefle:4,btc:6,diamant:9,rubis:9,emeraude:9,carte:6,liasse:6,champagne:7,chaine:3,fleur:9}},
  gros:   {n:[6,9],  fl:1.3,w:{cles:4,cigare:3,bague:4,jeton:8,montre:5,billet:20,or:16,lingot:6,piece2:5,piece1:5,piece50:3,btc:10,diamant:18,rubis:13,emeraude:13,carte:7,liasse:8,champagne:9,chaine:6,crane:2,trefle:3,fruit:3,fleur:9}},
  jackpot:{n:[14,19],fl:1.8,w:{cles:5,cigare:5,bague:6,jeton:8,montre:6,billet:20,or:15,lingot:7,diamant:24,rubis:16,emeraude:16,btc:10,carte:6,liasse:8,champagne:11,chaine:6,crane:4,piece2:4,piece1:4,piece50:2,trefle:4,fruit:3,fleur:11}}}; // (2026-10-15) + les petits cœurs rouges, dans les quatre tailles · (2026-10-16, Léo : « plus de pierres précieuses en général ») diamants, rubis, émeraudes ≈ ×1,6 (et le diamant entre dans la petite gerbe) ; + les petites fleurs ; (2026-10-16) + les vins chers (le champagne a quatre cousins, plus souvent) ; les cœurs ne sont plus tirés ici : ils viennent en NUÉE (RICH_NUEE)

// ---- LES PROGRAMMES ----
const RICH_VS=['varying vec3 vN;varying vec3 vP;varying vec2 vUv;uniform float uT;uniform float uBend;',
  'void main(){vec3 p=position;vec3 nn=normal;',
  '#ifdef SOUPLE',
  ' float ph=dot(modelMatrix[3].xyz,vec3(.9,1.3,.7))+uT*7.;float a=uBend*.07,b=uBend*.035;', // le papier ONDULE (la phase suit sa place : chaque billet bat à son rythme)
  ' p.z+=sin(p.x*3.2+ph)*a+sin(p.y*5.+ph*1.4)*b;',
  ' nn=normalize(vec3(-cos(p.x*3.2+ph)*a*3.2,-cos(p.y*5.+ph*1.4)*b*5.,1.));',
  '#endif',
  ' vec4 w=modelMatrix*vec4(p,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*nn);vUv=uv;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_STUDIO=['vec3 studio(vec3 r,float fl){', // LE STUDIO DU BIJOUTIER : un reflet à contraste franc (sol sombre, horizon gris, ciel clair, une bande de lumière, des boîtes à lumière) — c'est le contraste qui fait le « bling », le ciel réel n'en a pas
  ' float y=r.y,a=atan(r.z,r.x);vec3 c=mix(vec3(.04,.035,.05)+fl,vec3(.42,.42,.47)+fl*.5,smoothstep(-.4,.04,y));c=mix(c,vec3(1.45),smoothstep(.06,.6,y));',
  ' c+=vec3(1.3)*smoothstep(.07,0.,abs(y-.2));c+=vec3(1.4)*pow(max(0.,cos(a*3.)),36.)*smoothstep(.12,.6,y);return c;}'].join('\n');
const RICH_FS_METAL=['uniform sampler2D uMap;uniform samplerCube uEnv;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;uniform float uShin;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',RICH_STUDIO,
  '#ifdef PIECE', // (2026-10-10, Léo : « les pièces un tout petit peu plus flashy et réalistes ») LE RELIEF FRAPPÉ : une carte de hauteur (le listel, les étoiles, le chiffre, le cordon de la tranche) incline la normale à chaque pixel — c'est lui qui accroche la lumière quand la pièce tourne
  'uniform sampler2D uBump;uniform float uBumpK;',
  'vec3 bosse(vec3 N){vec2 dx=dFdx(vUv),dy=dFdy(vUv);float h=texture2D(uBump,vUv).r;',
  ' float bx=texture2D(uBump,vUv+dx).r-h,by=texture2D(uBump,vUv+dy).r-h;',
  ' vec3 sx=dFdx(vP),sy=dFdy(vP),r1=cross(sy,N),r2=cross(N,sx);float det=dot(sx,r1);', // la normale perturbée par les dérivées (la recette du bump de three, en monde)
  ' return normalize(abs(det)*N-sign(det)*(bx*r1+by*r2)*uBumpK);}',
  '#endif',
  'void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vP);',
  '#ifdef PIECE',
  ' N=bosse(N);',
  '#endif',
  ' vec3 F0=texture2D(uMap,vUv).rgb;',
  ' vec3 R=reflect(-V,N);vec3 env=textureCube(uEnv,vec3(-R.x,R.y,R.z)).rgb;',
  ' float ndv=max(dot(N,V),0.),fr=pow(1.-ndv,5.);',
  '#ifdef PIECE',
  ' vec3 F=F0+(vec3(1.)-F0)*fr*.85;float kS=1.45;', // les pièces : le bord qui blanchit plus franc, les éclats plus forts (le « flashy »)
  '#else',
  ' vec3 F=F0+(vec3(1.)-F0)*fr*.5;float kS=1.;',
  '#endif',
  ' vec3 L=normalize(uSunDir),H=normalize(L+V),H2=normalize(normalize(V+vec3(.3,.9,.2))+V);',
  ' float s1=pow(max(dot(N,H),0.),uShin),s2=pow(max(dot(N,H2),0.),uShin*.7);',
  '#ifdef PIECE',
  ' vec3 rfl=mix(studio(R,.4),env*1.1,.14);vec3 Vb=normalize(V+vec3(0.,.55,0.));float bx9=max(dot(R,Vb),0.);', // les pièces : moins de ciel teinté (l'argent reste argent, l'or reste or)…
  ' rfl+=vec3(.62)*pow(bx9,8.)+vec3(.7)*pow(bx9,90.);', // …et la BOÎTE À LUMIÈRE derrière l'objectif : la face qui te regarde s'allume d'un coup (le « flash » d'une pièce qu'on fait tourner)
  '#else',
  ' vec3 rfl=mix(studio(R,.24),env*1.15,.3);', // le studio d'abord, un peu du vrai ciel (l'heure se lit encore sur l'or)
  '#endif',
  ' vec3 c=F*(rfl+mix(uGnd,uSky,N.y*.5+.5)*.18)+F*(uSunCol*s1*2.4+vec3(s2)*1.6)*kS;',
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
const RICH_FS_GEMME=['uniform samplerCube uEnv;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uTint;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',RICH_STUDIO,
  'vec3 cube(vec3 d){return textureCube(uEnv,vec3(-d.x,d.y,d.z)).rgb;}',
  'void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vP),I=-V;float ndv=max(dot(N,V),0.);',
  ' vec3 hN=normalize(vec3(sin(dot(N,vec3(12.9,78.2,37.7))*43.7),cos(dot(N,vec3(39.3,11.1,83.7))*17.3),sin(dot(N,vec3(73.1,52.2,9.4))*29.1)));', // la facette du FOND, propre à chaque facette vue
  ' vec3 tr=reflect(refract(I,N,.405),hN),tg=reflect(refract(I,N,.413),hN),tb=reflect(refract(I,N,.421),hN);', // l'indice du diamant, un peu différent par couleur : la DISPERSION — elle ne se voit qu'aux bords des bandes du studio (le FEU, là où il est dans un vrai diamant)
  ' vec3 rf=vec3(studio(tr,0.).r,studio(tg,0.).g,studio(tb,0.).b)*1.15+cube(tg)*.12;',
  ' vec3 Rl=reflect(I,N);float fr=.1+.9*pow(1.-ndv,4.);',
  ' vec3 L=normalize(uSunDir),H=normalize(L+V),H2=normalize(normalize(V+vec3(.3,.9,.2))+V);',
  ' float sp=pow(max(dot(N,H),0.),200.)*8.+pow(max(dot(N,H2),0.),120.)*3.;',
  ' vec3 c=mix(rf*uTint,studio(Rl,0.)*.8+cube(Rl)*.4,fr)+uSunCol*sp+vec3(sp*.4);',
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
const RICH_FS_SOUPLE=['uniform sampler2D uMap;uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uSheen;uniform float uSheenK;uniform float uT;uniform float uLum;',
  'varying vec3 vN;varying vec3 vP;varying vec2 vUv;',
  'void main(){vec2 uv=gl_FrontFacing?vUv:vec2(1.-vUv.x,vUv.y);vec4 tx=texture2D(uMap,uv);if(tx.a<.5)discard;',
  ' vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float nl=dot(N,L),df=max(nl,0.)*.75+abs(nl)*.25;', // le papier laisse passer un peu de jour
  ' vec3 hc=mix(uGnd,uSky,N.y*.5+.5);vec3 c=tx.rgb*(hc*.75+uSunCol*df*.6+.2);',
  ' float ndv=abs(dot(N,V)),sw=fract(uv.x*.8+uv.y*.5-uT*.32+dot(vP,vec3(.05)));', // le reflet qui GLISSE en dégradé
  ' float band=smoothstep(0.,.35,sw)*smoothstep(.8,.35,sw);',
  ' c+=uSheen*(pow(1.-ndv,2.)*.55+band*.4)*uSheenK;',
  ' vec3 H=normalize(L+V);c+=uSunCol*pow(max(dot(N,H),0.),36.)*.3*uSheenK;',
  ' float lm=max(tx.r,max(tx.g,tx.b));c+=(tx.rgb*.6+.4)*uLum*smoothstep(.74,.95,lm);', // (2026-10-20, Léo : « les numéros un peu brillants, pas qui scintillent — une petite lumière légère sur le billet ») LE CHIFFRE LUIT : ce qui est presque blanc dans la toile (le grand chiffre, les petites valeurs) émet un peu de sa couleur, constant, même à l'ombre — uLum le dose (0 partout sauf les billets)
  ' gl_FragColor=vec4(c,1.);}'].join('\n');
/* (2026-10-15, Léo : « des petits cœurs rouges — un bon rouge, bien rouge, avec un petit dégradé rose fuchsia et un peu de blanc pour les
   rendre vraiment dreamy ») puis (2026-10-16 : « rends les cœurs en minuscules cubes ; joue la transparence, je ne vois pas assez ce côté
   rouge et blanc fantomatique ; ils sont trop solides et font jeu vidéo — on parle de l'amour, c'est autre chose que du matériel »)
   LE CŒUR FANTÔME : une PEAU de minuscules cubes (richCoeurCubes) qu'on voit au travers. Chaque cube connaît la normale LISSE du cœur à sa
   place (aN) : là où le cœur te fait face il est presque transparent, rouge (on voit le ciel au travers, et les cubes du dos par-dessus) ;
   vers le bord il s'épaissit, passe au FUCHSIA puis au BLANC — la silhouette brille, le milieu est un souffle. Quelques cubes blancs
   scintillent à leur rythme (aR.y = le hasard), une ONDE de lumière monte de la pointe aux lobes (aR.x = la hauteur). Mélange PRÉMULTIPLIÉ :
   ce qui couvre (alpha) et ce qui luit (la couleur au-delà de l'alpha) se dosent à part. Faces des cubes : un peu de soleil, pour qu'on lise
   les cubes. Un programme de plus, compilé sous l'écran titre (richChauffeTick). */
const RICH_VS_COEUR=['attribute vec3 aN;attribute vec2 aR;attribute vec4 aK;uniform float uPop;varying vec3 vN;varying vec3 vP;varying vec3 vH;varying vec2 vR;varying float vPeau;varying float vPop;',
  'void main(){vec3 p=position;vPeau=aK.w;vPop=uPop;',
  ' if(uPop>0.){vec3 C=aK.xyz,j=vec3(fract(aR.y*7.13),fract(aR.y*13.37),fract(aR.y*3.71))-.5,dr=normalize(aN+j*1.1+C*1.2);', // (2026-10-16) POP : le cœur ÉCLATE en ses cubes, qui filent dehors en rapetissant
  '  p=C+(p-C)*(1.-uPop*.65)+dr*uPop*(.3+aR.y*.6);p.y-=uPop*uPop*.3;}',
  ' vec4 w=modelMatrix*vec4(p,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vH=normalize(mat3(modelMatrix)*aN);vR=aR;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_FS_COEUR=['uniform vec3 uSunDir;uniform float uT;uniform vec3 uRouge;uniform vec3 uFuch;uniform float uBlanc;uniform float uA;',
  'varying vec3 vN;varying vec3 vP;varying vec3 vH;varying vec2 vR;varying float vPeau;varying float vPop;',
  'void main(){vec3 N=normalize(vN),Hn=normalize(vH),V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float bo=1.-abs(dot(Hn,V));', // le BORD du cœur (sa silhouette) : 1 ; la face qui te regarde, devant comme au dos : 0
  ' float tw=.5+.5*sin(uT*(2.4+vR.y*4.)+vR.y*37.),on=smoothstep(.14,0.,abs(fract(vR.x*.8-uT*.42)-.5));', // chaque cube scintille à son rythme ; l'onde qui monte
  ' vec3 col=mix(uRouge,uFuch,smoothstep(.35,.88,bo));',
  ' col=mix(col,vec3(1.,.95,.98),clamp(smoothstep(.5,1.,bo)*.9+step(.86,vR.y)*tw*.85,0.,1.));', // blanc tout au bord, et quelques cubes blancs qui scintillent
  ' float df=.66+.34*max(dot(N,L),0.)+.1*N.y;', // les faces des cubes se lisent (un peu de soleil, le dessus plus clair)
  ' float a=min(.92,mix(uA,.86,pow(bo,1.25))*(.8+.2*tw)*(1.+.5*on));',
  ' if(vPeau<.5){col=uRouge*(1.05+.25*tw);a=.3;bo=0.;}', // le DEDANS : des cubes d'un rouge plein, à demi transparents — le cœur est rempli
  ' float fl=smoothstep(0.,.25,vPop)*(1.-vPop);col=mix(col,vec3(1.,.95,.98),fl*.7);a*=pow(1.-vPop,1.4);', // l'éclat blanc du pop, puis les cubes s'éteignent
  ' gl_FragColor=vec4(col*df*a*(1.+.45*on)+col*(.1+.3*bo)*uBlanc*(1.-vPop),a);}'].join('\n');
/* (2026-10-16) LES PÉTALES : de la soie qui laisse passer le jour (éclairés de face COMME de dos), un liseré blanc rosé à la silhouette (la
   lueur des cœurs), un lustre doux ; transparents (aC.a), mélange prémultiplié — ils écrivent la profondeur : les pétales de derrière que
   cache un pétale de devant ne se mélangent pas en bouillie. */
const RICH_VS_FLEUR=['attribute vec4 aC;varying vec3 vN;varying vec3 vP;varying vec4 vC;',
  'void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vC=aC;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const RICH_FS_FLEUR=['uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;',
  'varying vec3 vN;varying vec3 vP;varying vec4 vC;',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vP),L=normalize(uSunDir);',
  ' float nl=dot(N,L),df=max(nl,0.)*.55+max(-nl,0.)*.38+.3;', // le jour passe au travers du pétale
  ' vec3 c=vC.rgb*(mix(uGnd,uSky,N.y*.5+.5)*.32+uSunCol*df*.55+.34);',
  ' float bo=1.-abs(dot(N,V));c+=vec3(1.,.93,.97)*pow(bo,2.4)*.42+uSunCol*pow(max(dot(N,normalize(L+V)),0.),36.)*.22;', // le liseré blanc rosé, le lustre de la soie
  ' float a=vC.a*(.78+.22*bo);gl_FragColor=vec4(c*a,a);}'].join('\n');
 // prémultiplié : ce qui couvre + ce qui luit (le fantôme brille un peu)
function richMat(fs,u,defs,side){const U=Object.assign({},RICH_U,u||{});return new THREE.ShaderMaterial({uniforms:U,vertexShader:RICH_VS,fragmentShader:fs,defines:defs||{},side:side||THREE.FrontSide,fog:false,lights:false,extensions:{derivatives:true}});} /* (24/10, relecture) dFdx/dFdy (le relief de bosse) exigent en WebGL1 la directive des dérivées : three ne la pose que si on la demande, et l'ignore en WebGL2 (voir le ciel, scene-ciel.js) */

// ---- LES DESSINS (canvas) ----
function richCv(w,h,fn){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');fn(x,w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t;}
function richEtoile(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();}
/* (2026-10-10, Léo : « les pièces un tout petit peu plus flashy et réalistes ») LES PIÈCES v2 : chaque pièce a DEUX images tirées du MÊME
   dessin (même graine) — la COULEUR (le métal, plus vif : l'or nordique et le cupronickel montent d'un cran) et la HAUTEUR (gris : le champ
   bas, le LISTEL qui dépasse au bord, les étoiles, l'arbre, le chiffre en relief, la rainure entre les deux métaux, le cordon de la tranche),
   que le programme du métal lit pour incliner la lumière pixel par pixel (#define PIECE) : le relief accroche le soleil quand la pièce tourne.
   Mise en page (512 × 256, une puissance de deux : ses mips existent partout) : les deux faces (centres 128 / 384, 122 ; rayon 120) et la
   TRANCHE en bande au bas de l'image (246-256) — le cordon fin du 2 €, les segments striés du 1 €, la fleur d'Espagne du 50 c. */
function richDuo(fn){ // deux toiles, le même dessin : [couleur, hauteur]
  return [false,true].map(function(H){return richCv(512,256,function(x){let sd=0x51ec7;
    const rn=function(){sd=(sd+0x6D2B79F5)|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;};fn(x,H,rn);});});}
function richFace(x,cx,cy,R,ext,int,face,val,H,rn){ // une face d'euro : le listel, la couronne (12 étoiles), le cœur ; face 0 = côté France (l'arbre dans l'hexagone, RF), 1 = côté commun (le chiffre) — H : la carte de HAUTEUR
  const g=(r,c0,c1)=>{const G=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);G.addColorStop(0,c0);G.addColorStop(1,c1);return G;};
  const frappe=function(dessin,fort){ // ce qui est EN RELIEF : en hauteur, un gris clair ; en couleur, une ombre portée puis une lumière décalées (le relief se lit encore de loin, quand le vrai bosselage n'a plus de pixels)
    if(H){x.fillStyle=x.strokeStyle='#d6d6d6';dessin();return;}
    x.save();x.translate(R*.012,R*.016);x.fillStyle=x.strokeStyle='rgba(60,42,12,'+(fort?.46:.32)+')';dessin();x.restore();
    x.save();x.translate(-R*.008,-R*.011);x.fillStyle=x.strokeStyle='rgba(255,252,236,'+(fort?.42:.3)+')';dessin();x.restore();};
  x.fillStyle=H?'#5c5c5c':g(R,ext[0],ext[1]);x.beginPath();x.arc(cx,cy,R,0,6.2832);x.fill();
  x.lineWidth=R*.07;x.strokeStyle=H?'#ffffff':'rgba(255,250,232,.34)';x.beginPath();x.arc(cx,cy,R*.955,0,6.2832);x.stroke(); // le LISTEL : le rebord qui dépasse, poli
  x.lineWidth=R*.02;x.strokeStyle=H?'#909090':'rgba(60,40,10,.42)';x.beginPath();x.arc(cx,cy,R*.912,0,6.2832);x.stroke();   // son pied
  const r=int?R*.68:R*.76;
  if(int){x.fillStyle=H?'#585858':g(r,int[0],int[1]);x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fill();
    x.strokeStyle=H?'#262626':'rgba(40,30,10,.55)';x.lineWidth=R*.028;x.stroke();} // la RAINURE où les deux métaux se rejoignent
  frappe(function(){for(let i=0;i<12;i++){const a=i/12*6.2832-Math.PI/2;richEtoile(x,cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8,R*.056);}},false); // les 12 étoiles
  if(face===0){ // l'arbre de vie dans l'hexagone, R F
    const fe=[];for(let i=0;i<70;i++){const a=rn()*6.2832,d=Math.sqrt(rn())*r*.48;fe.push(cx+Math.cos(a)*d,cy-r*.18+Math.sin(a)*d*.8);} // (tiré une fois : les deux images ont le même feuillage)
    x.fillStyle=H?'#cfcfcf':'rgba(60,42,12,.26)';for(let i=0;i<fe.length;i+=2){x.beginPath();x.arc(fe[i],fe[i+1],r*.036,0,6.2832);x.fill();} // le feuillage : le relief le dessine, la couleur à peine (en lumière décalée, il faisait des points blancs)
    frappe(function(){x.lineWidth=R*.03;x.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.2832+Math.PI/6;x.lineTo(cx+Math.cos(a)*r*.82,cy+Math.sin(a)*r*.82);}x.stroke();
      x.fillRect(cx-r*.05,cy-r*.05,r*.1,r*.6);
      x.font=Math.round(r*.26)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('R',cx-r*.5,cy+r*.35);x.fillText('F',cx+r*.5,cy+r*.35);},true);
  }else{ // le chiffre, frappé
    frappe(function(){x.font=Math.round(r*(val.length>1?.5:.8))+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(val,cx,cy-r*.05);
      x.font=Math.round(r*.12)+'px "Press Start 2P",monospace';x.fillText(val.length>1?'EURO CENT':'EURO',cx,cy+r*.62);},true);
  }
}
function richTranche(x,H,k,c){ // la TRANCHE (bande 246-256) : h = le relief le long du tour
  if(!H){x.fillStyle=c;x.fillRect(0,244,512,12);}
  for(let i=0;i<512;i++){let h;
    if(k==='2')h=(i%4)<2?1:0;                                                  // le cordon fin
    else if(k==='1')h=Math.floor(i/(512/12))%2?((i%4)<2?1:0):.55;               // six segments striés, six lisses
    else if(k==='50')h=.5+.5*Math.cos(i/512*6.2832*41);                         // la fleur d'Espagne : des creux arrondis
    else h=(i%8)<4?1:0;                                                         // le crénelage large de la pièce-souvenir
    if(H){const v=Math.round(64+h*170);x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(i,244,1,12);}
    else if(h<.99){x.fillStyle='rgba(40,28,8,'+(.34*(1-h))+')';x.fillRect(i,244,1,12);}}}
const RICH_ARG=['#f8fafd','#bcc3cd'],RICH_OR=['#fff0b0','#d9ad48'],RICH_ORN=['#ffeba2','#d2a540']; // l'argent (cupronickel), l'or nordique du 1/2 €, celui des centimes — un cran plus vifs (2026-10-10)
function richTexPiece(k){
  const P=k==='2'?[RICH_ARG,RICH_OR]:k==='1'?[RICH_OR,RICH_ARG]:[RICH_ORN,null];
  return richDuo(function(x,H,rn){x.fillStyle=H?'#5c5c5c':P[0][1];x.fillRect(0,0,512,256);
    richFace(x,128,122,120,P[0],P[1],0,'',H,rn);richFace(x,384,122,120,P[0],P[1],1,k==='50'?'50':k,H,rn);
    richTranche(x,H,k,P[0][0]);});}
function richTexBtc(){return richDuo(function(x,H){x.fillStyle=H?'#5c5c5c':'#c8902e';x.fillRect(0,0,512,256);
  for(const cx of [128,384]){const cy=122,R=120,u=R/124;
    if(H)x.fillStyle='#5c5c5c';else{const G=x.createRadialGradient(cx-38,cy-40,10,cx,cy,R);G.addColorStop(0,'#fff0b0');G.addColorStop(1,'#bc7e1c');x.fillStyle=G;}x.beginPath();x.arc(cx,cy,R,0,6.2832);x.fill();
    x.lineWidth=R*.07;x.strokeStyle=H?'#ffffff':'rgba(255,248,222,.34)';x.beginPath();x.arc(cx,cy,R*.955,0,6.2832);x.stroke(); // le listel
    x.strokeStyle=H?'#d0d0d0':'rgba(90,55,10,.55)';x.lineWidth=3;for(let i=0;i<72;i++){const a=i/72*6.2832;x.beginPath();x.moveTo(cx+Math.cos(a)*R*.8,cy+Math.sin(a)*R*.8);x.lineTo(cx+Math.cos(a)*R*.89,cy+Math.sin(a)*R*.89);x.stroke();} // le crénelage
    if(H)x.fillStyle='#4c4c4c';else{const O=x.createRadialGradient(cx-25,cy-23,8,cx,cy,R*.79);O.addColorStop(0,'#ffb347');O.addColorStop(1,'#e2760c');x.fillStyle=O;}x.beginPath();x.arc(cx,cy,R*.79,0,6.2832);x.fill(); // l'émail (en creux)
    x.save();x.translate(cx,cy);x.rotate(.24);x.fillStyle=H?'#e8e8e8':'#fff';x.font=Math.round(104*u)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('B',4*u,6*u);
    x.fillRect(-22*u,-72*u,11*u,26*u);x.fillRect(4*u,-72*u,11*u,26*u);x.fillRect(-22*u,46*u,11*u,26*u);x.fillRect(4*u,46*u,11*u,26*u);x.restore();} // ₿ : le B et ses deux barres
  richTranche(x,H,'btc','#e8b048');});}
function richTexUni(c){return richCv(4,4,function(x){x.fillStyle=c;x.fillRect(0,0,4,4);});}
/* (2026-10-10, Léo : « les billets, on peut faire plusieurs couleurs — les liasses restent vertes ») UNE SÉRIE : une couleur par valeur ; le 100 est
   celui des liasses. (2026-10-16 : la série est redessinée, voir richTexBillet.) */
/* (2026-10-16, Léo, après les billets « de sa toile » : « trop moches, ils étaient mieux ; le style enfantin dégoûte ; fais juste le chiffre
   écrit de manière CARRÉE — de ma toile, garde seulement l'EMPLACEMENT du chiffre — dans le style de la première version, et plus joli » ;
   la série : 10 rouge (comme l'ancien), 20 bleu « plus français », 50 orange, 100 vert en dégradé (un peu plus vert), 500 violet ; le rose,
   le jaune et le 200 s'en vont) LES BILLETS v3 : le papier de la 1re version (dégradé, guilloche, double cadre, rosace, bande), un voile clair
   au milieu (le filigrane), et la valeur en GRAND au milieu, en lettres carrées (la police pixel du jeu), frappée : ombre d'encre, contour,
   dégradé clair, un fil de lumière. Le 20 a sa tour Eiffel dans la rosace et sa bande BLEU-BLANC-ROUGE ; le 500 est violet et OR. */
const RICH_BILLETS=[ // (2026-10-20, Léo : « chaque billet une plus belle couleur, un dégradé de DEUX couleurs sur chacun ; le 500 en blanc aussi ») c:[départ, arrivée] = le dégradé en diagonale ; l = la couleur des filets/guilloches ; sh = le reflet qui glisse
  {v:'10', m:'DIX DOLLARS',       c:['#7a0c2c','#ff6a58'],l:[255,170,190],sh:[1,.6,.7]},   // grenat → framboise (peu saturé au départ : l'étalonnage du jeu sature ×1,4)
  {v:'20', m:'VINGT FRANCS',      c:['#1a2cae','#30d8ff'],l:[150,215,255],sh:[.55,.85,1],fr:1}, // bleu roi → turquoise, à la française
  {v:'50', m:'CINQUANTE DOLLARS', c:['#d0340a','#ffc83a'],l:[255,215,140],sh:[1,.82,.45]},  // orange brûlé → ambre doré
  {v:'100',m:'CENT DOLLARS',      c:['#0a6a50','#86ec62'],l:[160,255,205],sh:[.5,1,.65]},  // vert sapin → vert menthe
  {v:'500',m:'CINQ CENTS DOLLARS',c:['#4a14c4','#ee5ccc'],l:[225,175,255],sh:[.9,.7,1],or:1}]; // violet → magenta ; les filets restent dorés, le chiffre est BLANC
const RICH_B100=3;
function richTexBillet(B){return richCv(512,236,function(x,w,h){
  const L=function(k,a){const c=B.l.map(function(v){return Math.round(v+(255-v)*k);});return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}, // la couleur des traits, éclaircie de k
    O=function(a){return 'rgba(255,214,128,'+a+')';},T=B.or?function(k,a){return O(a);}:L,F='"Press Start 2P",monospace';
  const G=x.createLinearGradient(0,0,w,h);G.addColorStop(0,B.c[0]);G.addColorStop(1,B.c[1]);x.fillStyle=G;x.fillRect(0,0,w,h); // (2026-10-20) UN dégradé de deux couleurs, en diagonale
  x.lineWidth=1;for(let k=0;k<26;k++){x.strokeStyle=L(0,.09);x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2+Math.sin(i*.03+k*.5)*h*.42*Math.sin(k*.21+1));x.stroke(); // la guilloche, deux familles croisées
    x.strokeStyle=L(.1,.05);x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2-Math.sin(i*.024+k*.61)*h*.4*Math.sin(k*.17+2));x.stroke();}
  x.strokeStyle=T(.25,.42);x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.lineWidth=1;x.strokeRect(18,18,w-36,h-36);           // le double cadre
  x.fillStyle=T(.3,.5);for(const [a,b] of [[14,14],[w-22,14],[14,h-22],[w-22,h-22]])x.fillRect(a,b,8,8);                      // ses coins
  const rx=96,ry=118;for(let i=0;i<14;i++){x.strokeStyle=T(0,.07+i*.012);x.beginPath();x.ellipse(rx,ry,58-i*4,58-i*4,0,0,6.2832);x.stroke();} // la rosace
  x.strokeStyle=T(.2,.16);for(let i=0;i<12;i++){x.save();x.translate(rx,ry);x.rotate(i*Math.PI/6);x.beginPath();x.ellipse(0,-30,9,26,0,0,6.2832);x.stroke();x.restore();}
  if(B.fr){x.fillStyle=L(.6,.85);x.beginPath();x.moveTo(rx-22,ry+40);x.lineTo(rx-6,ry-6);x.lineTo(rx-2,ry-38);x.lineTo(rx,ry-50);x.lineTo(rx+2,ry-38);x.lineTo(rx+6,ry-6);x.lineTo(rx+22,ry+40); // la TOUR EIFFEL
    x.lineTo(rx+12,ry+40);x.quadraticCurveTo(rx,ry+18,rx-12,ry+40);x.closePath();x.fill();x.fillRect(rx-13,ry+14,26,4);x.fillRect(rx-8,ry-10,16,3);x.fillRect(rx-1,ry-58,2,9);}
  else{x.fillStyle=T(.55,.85);x.font='44px '+F;x.textAlign='center';x.textBaseline='middle';x.fillText('$',rx+2,ry+2);}
  const n=B.v.length,fz=n>2?74:92,cx=w*.555,cy=h*.53;x.font=fz+'px '+F;x.textAlign='center';x.textBaseline='middle'; // LE GRAND CHIFFRE CARRÉ, là où le pose la toile de Léo
  {const tw=x.measureText(B.v).width,px=cx-tw*.5-16,py=cy-fz*.5-13,pw=tw+32,ph=fz+26;x.fillStyle='rgba(0,0,0,.3)';richRond(x,px,py,pw,ph,10);x.fill(); // (2026-10-16, Léo : « plus visibles les numéros ») un CARTOUCHE sombre sous le chiffre (le voile clair d'avant le noyait)
   x.strokeStyle=T(.45,.4);x.lineWidth=2;richRond(x,px+4,py+4,pw-8,ph-8,7);x.stroke();}
  x.save();x.shadowColor=B.or?'rgba(255,232,170,.55)':'rgba(255,255,255,.55)';x.shadowBlur=28;x.shadowOffsetX=2000;x.fillStyle='#fff';x.fillText(B.v,cx-2000,cy);x.restore(); // (2026-10-20, Léo) LA LUEUR : un halo blanc doux autour du chiffre, peint dans la toile (le chiffre est dessiné hors toile, seule son ombre floue reste) — la lumière qu'il pose sur le papier ; le chiffre lui-même luit dans le programme (uLum)
  x.fillStyle='rgba(0,0,0,.55)';x.fillText(B.v,cx+6,cy+7);                                                                  // son ombre d'encre
  x.lineJoin='miter';x.lineWidth=9;x.strokeStyle='rgba(0,0,0,.72)';x.strokeText(B.v,cx,cy); /* (2026-10-20) contour, taille et ombre REMIS comme avant (Léo : « remets les numéros comme avant ») */                                  // son contour, épais
  const Z=x.createLinearGradient(0,cy-fz*.5,0,cy+fz*.5);if(B.or){Z.addColorStop(0,'#fff8dc');Z.addColorStop(.5,'#ffd970');Z.addColorStop(1,'#e2a73c');}else{Z.addColorStop(0,'#ffffff');Z.addColorStop(.55,L(.88,1));Z.addColorStop(1,L(.7,1));} // (2026-10-20) le 500 aussi en BLANC (chaud à peine)
  x.fillStyle=Z;x.fillText(B.v,cx,cy);x.save();x.beginPath();x.rect(0,cy-fz*.5,w,fz*.16);x.clip();x.fillStyle='rgba(255,255,255,.45)';x.fillText(B.v,cx,cy);x.restore(); // dégradé clair, et le fil de lumière en haut
  x.font='20px '+F;x.fillStyle=T(.8,.95);x.textAlign='left';x.fillText(B.v,30,42);x.textAlign='right';x.fillText(B.v,w-30,h-38); // les petites valeurs aux coins (un cran plus grandes, plus claires)
  x.textAlign='center';x.font='11px '+F;x.fillStyle=T(.55,.8);x.fillText('CASH CAR',cx,h*.2);
  x.font='7px '+F;x.fillStyle=L(.3,.55);x.fillText((B.fr?'REPUBLIQUE DU CIEL':'BANQUE CENTRALE DU CIEL')+' · '+B.m,cx,h*.84);
  x.textAlign='left';x.fillText('CC '+(4100+B.v.length*977+B.v.charCodeAt(0)*13),30,h-34);                                   // le numéro de série
  const bx=w*.8,bw=w*.075;
  if(B.fr){[['rgba(30,70,200,.75)',0],['rgba(245,245,250,.75)',1],['rgba(220,30,50,.75)',2]].forEach(function(q){x.fillStyle=q[0];x.fillRect(bx+q[1]*bw/3,0,bw/3+.5,h);});} // la bande BLEU-BLANC-ROUGE
  else{const Bd=x.createLinearGradient(0,0,0,h);Bd.addColorStop(0,B.or?'rgba(255,220,140,.5)':'rgba(255,160,220,.38)');Bd.addColorStop(.5,B.or?'rgba(255,245,200,.62)':'rgba(150,250,255,.42)');Bd.addColorStop(1,B.or?'rgba(210,150,60,.5)':'rgba(255,230,140,.38)');x.fillStyle=Bd;x.fillRect(bx,0,bw,h); // la bande irisée
    x.strokeStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){x.beginPath();x.moveTo(bx+4+i*6,0);x.lineTo(bx+4+i*6,h);x.stroke();}}
});}
function richTexTrefle(){return richCv(256,256,function(x){x.clearRect(0,0,256,256);
  x.strokeStyle='#2f7a2a';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(128,132);x.quadraticCurveTo(150,190,132,248);x.stroke(); // la tige
  for(let i=0;i<4;i++){x.save();x.translate(128,128);x.rotate(i*Math.PI/2+Math.PI/4);
    const G=x.createLinearGradient(0,0,0,-110);G.addColorStop(0,'#1f6f2a');G.addColorStop(1,'#4fbf4a');x.fillStyle=G;
    x.beginPath();x.moveTo(0,-4);x.bezierCurveTo(-62,-34,-58,-112,-16,-108);x.bezierCurveTo(-6,-106,0,-96,0,-88);x.bezierCurveTo(0,-96,6,-106,16,-108);x.bezierCurveTo(58,-112,62,-34,0,-4);x.fill(); // un cœur
    x.strokeStyle='rgba(225,255,215,.55)';x.lineWidth=5;x.beginPath();x.moveTo(-22,-62);x.lineTo(0,-46);x.lineTo(22,-62);x.stroke(); // le chevron pâle
    x.strokeStyle='rgba(20,70,25,.45)';x.lineWidth=2;x.beginPath();x.moveTo(0,-6);x.lineTo(0,-84);x.stroke();x.restore();}});}
function richTexEtoile(){return richCv(128,128,function(x){x.clearRect(0,0,128,128);
  const C=x.createRadialGradient(64,64,0,64,64,22);C.addColorStop(0,'rgba(255,255,255,1)');C.addColorStop(.4,'rgba(255,250,235,.55)');C.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=C;x.fillRect(0,0,128,128);
  for(const [a,l,w] of [[0,62,3.2],[Math.PI/2,62,3.2],[Math.PI/4,30,1.8],[-Math.PI/4,30,1.8]]){x.save();x.translate(64,64);x.rotate(a);
    const g=x.createLinearGradient(-l,0,l,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
    x.beginPath();x.moveTo(-l,0);x.lineTo(0,-w);x.lineTo(l,0);x.lineTo(0,w);x.fill();x.restore();}});} // l'éclat : quatre branches fines et un cœur doux
function richTexFlamme(){return richCv(128,128,function(x){x.clearRect(0,0,128,128);
  const G=x.createRadialGradient(64,64,0,64,64,62);G.addColorStop(0,'rgba(255,250,235,1)');G.addColorStop(.25,'rgba(255,214,140,.75)');G.addColorStop(.55,'rgba(255,128,40,.3)');G.addColorStop(1,'rgba(200,40,10,0)');
  x.fillStyle=G;x.fillRect(0,0,128,128);});}

// ---- LES FORMES ----
function richPlat(g){ // non indexée, normales PLATES tournées vers l'extérieur, uv au centre (le métal uni)
  const ng=g.index?g.toNonIndexed():g,p=ng.attributes.position.array,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),m=new THREE.Vector3();
  for(let i=0;i<p.length;i+=9){a.fromArray(p,i);b.fromArray(p,i+3);c.fromArray(p,i+6);m.copy(a).add(b).add(c);
    const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.dot(m)<0){p[i+3]=c.x;p[i+4]=c.y;p[i+5]=c.z;p[i+6]=b.x;p[i+7]=b.y;p[i+8]=b.z;}}
  ng.computeVertexNormals();const uv=new Float32Array(p.length/3*2).fill(.5);ng.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(ng!==g)g.dispose();return ng;}
function richPepite(k){ // une pépite : un icosaèdre cabossé (le même creux pour le même sommet : pas de fissure)
  const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const h=Math.sin(v.x*12.9+v.y*78.2+v.z*37.7+k*9.1)*43758.5453,r=.72+.42*(h-Math.floor(h));v.multiplyScalar(r);v.y*=.68;p.setXYZ(i,v.x,v.y,v.z);}
  return richPlat(g);}
function richLingot(){const g=new THREE.BoxGeometry(1,.42,.5),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*.78);p.setZ(i,p.getZ(i)*.7);}return richPlat(g);}
function richBagueGeo(){ // (2026-10-21, Léo) LA BAGUE : un jonc d'or (tore à facettes), le chaton qui s'évase, quatre griffes — le DIAMANT (richDiamant, matière gemme) est posé dessus à part
  const M=function(x,y,z,rx,ry,rz,sx,sy,sz){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy==null?(sx||1):sy,sz==null?(sx||1):sz));};
  const L=[[new THREE.TorusGeometry(.5,.095,8,28),M(0,0,0,0,0,0,1,1,1.25)],                          // le jonc (un peu plus large que haut : un vrai jonc)
    [new THREE.CylinderGeometry(.2,.1,.2,8),M(0,.6,0)]];                                                // le chaton : évasé vers le haut
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;L.push([new THREE.CylinderGeometry(.028,.045,.3,5),M(Math.cos(a)*.18,.8,Math.sin(a)*.18,Math.sin(a)*.18,0,-Math.cos(a)*.18)]);} // les griffes
  return richFusion(L);}
function richCigareGeo(){ // (2026-10-21, Léo) LE CIGARE : un fuseau brun à facettes (bout rond côté bouche, pointe côté feu), la BAGUE d'or, la cendre grise. Rend {corps, bague, cendre}
  const pts=[];for(let i=0;i<=14;i++){const y=-1+2*i/14;pts.push(new THREE.Vector2(Math.max(.001,.2*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(y),9)))),y));}
  const I=new THREE.Matrix4();
  const bague=new THREE.CylinderGeometry(.215,.215,.26,10,1,true);bague.translate(0,.3,0);
  const cendre=new THREE.CylinderGeometry(.12,.17,.2,8);cendre.translate(0,1.02,0);
  return {corps:richFusion([[new THREE.LatheGeometry(pts,10),I]]),bague:richFusion([[bague,I],[new THREE.TorusGeometry(.215,.014,4,10),new THREE.Matrix4().compose(new THREE.Vector3(0,.43,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),new THREE.Vector3(1,1,1))],[new THREE.TorusGeometry(.215,.014,4,10),new THREE.Matrix4().compose(new THREE.Vector3(0,.17,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),new THREE.Vector3(1,1,1))]]),cendre:richFusion([[cendre,I]])};}
function richClesGeo(){ // (2026-10-21, Léo) LE TROUSSEAU : un anneau d'acier et deux clés (une d'or, une d'acier) : tête ronde, tige, deux dents. Rend {or, ag}
  const T=function(x,y,rz,k){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,rz||0)),new THREE.Vector3(k||1,k||1,k||1));};
  const cle=function(ox,oy,rz,L,out){ // une clé accrochée en (ox,oy), penchée de rz : la tête vers le haut, la tige vers le bas
    const q=function(g,x,y){out.push([g,new THREE.Matrix4().multiplyMatrices(T(ox,oy,rz),T(x,y,0))]);};
    q(new THREE.TorusGeometry(.17,.05,5,14),0,0);q(new THREE.BoxGeometry(.075,L,.07),0,-.17-L/2);
    q(new THREE.BoxGeometry(.15,.07,.07),.075,-.17-L+.06);q(new THREE.BoxGeometry(.11,.07,.07),.055,-.17-L+.17);};
  const or=[],ag=[];cle(-.2,-.12,.18,.85,or);cle(.22,-.1,-.2,.7,ag);
  ag.push([new THREE.TorusGeometry(.34,.03,5,20),T(0,.27,0)]); // l'anneau, passé dans les deux têtes
  return {or:richFusion(or),ag:richFusion(ag)};}
function richDiamant(){ // la taille BRILLANT : la table, la couronne (8 + 16 facettes), le rondiste, la culasse jusqu'à la pointe
  const T=[],G=[],P=[],tY=.3,tR=.54,n=8;
  for(let i=0;i<n;i++){const a=i/n*6.2832;T.push([Math.cos(a)*tR,tY,Math.sin(a)*tR]);}
  for(let i=0;i<2*n;i++){const a=i/(2*n)*6.2832;G.push([Math.cos(a),0,Math.sin(a)]);}
  const ctr=[0,tY,0],cu=[0,-.95,0],tri=(a,b,c)=>P.push(...a,...b,...c);
  for(let i=0;i<n;i++){const t0=T[i],t1=T[(i+1)%n],g0=G[2*i],gm=G[2*i+1],g1=G[(2*i+2)%(2*n)]; // la table, puis la couronne : t0 au-dessus de g0, t1 au-dessus de g1
    tri(ctr,t0,t1);tri(t0,g0,gm);tri(t0,gm,t1);tri(t1,gm,g1);}
  for(let i=0;i<2*n;i++){const g0=G[i],g1=G[(i+1)%(2*n)],mid=[(g0[0]+g1[0])*.5*.6,-.42,(g0[2]+g1[2])*.5*.6];tri(g0,g1,mid);tri(g0,mid,cu);tri(mid,g1,cu);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));return richPlat(g);}
function richPiece(){ // la pièce : un cylindre ; ses deux faces lisent les deux disques de l'image, la tranche lit la bande du bas (son cordon)
  // (2026-10-10) une VRAIE épaisseur (2,2 mm pour 25,75 : .16 du rayon, elle en avait la moitié) — la tranche striée accroche la lumière quand la pièce tourne
  const g=new THREE.CylinderGeometry(1,1,.16,40,1),uv=g.attributes.uv,gr=g.groups,vu=new Uint8Array(uv.count);
  for(const G9 of gr){for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k);if(vu[i])continue;vu[i]=1; // (un sommet servi par deux triangles ne se recale qu'une fois)
    const u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===0)uv.setXY(i,u,.008+v*.031);else if(G9.materialIndex===1)uv.setXY(i,.0156+u*.46875,.0547+v*.9375);else uv.setXY(i,.5156+u*.46875,.0547+v*.9375);}}
  g.clearGroups();return g;}

function richRond(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function richTexCarte(){return richCv(512,656,function(x){ // la carte NOIRE : recto (0-322) et verso (334-656), un trait noir entre les deux (la tranche y lit sa couleur)
  x.fillStyle='#08080b';x.fillRect(0,0,512,656);
  const face=function(y0,dos){const G=x.createLinearGradient(0,y0,512,y0+322);G.addColorStop(0,'#17171d');G.addColorStop(.5,'#0b0b10');G.addColorStop(1,'#1b1b23');x.fillStyle=G;x.fillRect(0,y0,512,322);
    x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=1;for(let i=-322;i<512;i+=5){x.beginPath();x.moveTo(i,y0+322);x.lineTo(i+322,y0);x.stroke();} // le métal BROSSÉ
    if(!dos){const cg=x.createLinearGradient(52,y0+112,116,y0+160);cg.addColorStop(0,'#fff0b5');cg.addColorStop(1,'#b8892c');x.fillStyle=cg;richRond(x,52,y0+110,66,50,9);x.fill(); // la puce
      x.strokeStyle='rgba(90,60,10,.7)';x.lineWidth=2;x.beginPath();x.moveTo(52,y0+135);x.lineTo(118,y0+135);x.moveTo(74,y0+110);x.lineTo(74,y0+160);x.moveTo(96,y0+110);x.lineTo(96,y0+160);x.stroke();
      x.strokeStyle='rgba(225,228,235,.75)';x.lineWidth=3;for(let k=0;k<3;k++){x.beginPath();x.arc(150,y0+135,10+k*9,-.7,.7);x.stroke();} // sans contact
      x.font='19px "Press Start 2P",monospace';x.textBaseline='middle';x.fillStyle='#dfe2ea';x.fillText('CASH CAR',36,y0+58);
      x.textAlign='right';x.font='11px "Press Start 2P",monospace';x.fillStyle='#a7adb8';x.fillText('BLACK',476,y0+58);x.textAlign='left';
      x.font='18px "Press Start 2P",monospace';x.fillStyle='rgba(0,0,0,.8)';x.fillText('4000 1234 5678 9010',38,y0+218);x.fillStyle='#d9dce4';x.fillText('4000 1234 5678 9010',36,y0+215); // en RELIEF
      x.font='9px "Press Start 2P",monospace';x.fillStyle='#b9bec8';x.fillText('L. CASH',38,y0+272);x.fillText('12/99',250,y0+272);
      x.globalAlpha=.9;x.fillStyle='#d9a63a';x.beginPath();x.arc(420,y0+266,24,0,6.2832);x.fill();x.fillStyle='#c9ccd4';x.beginPath();x.arc(450,y0+266,24,0,6.2832);x.fill();x.globalAlpha=1;}
    else{x.fillStyle='#232328';x.fillRect(0,y0+30,512,58);x.fillStyle='#ddd8cb';x.fillRect(36,y0+120,300,40);x.font='11px "Press Start 2P",monospace';x.fillStyle='#444';x.fillText('777',300,y0+142);
      const H=x.createLinearGradient(380,0,470,0);H.addColorStop(0,'#ff9ad8');H.addColorStop(.5,'#8ffcff');H.addColorStop(1,'#fff08a');x.fillStyle=H;x.globalAlpha=.75;x.beginPath();x.arc(425,y0+250,34,0,6.2832);x.fill();x.globalAlpha=1;}};
  face(0,false);face(334,true);});}
function richCarteGeo(){const g=new THREE.BoxGeometry(1,.63,.018),uv=g.attributes.uv;
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===4)uv.setXY(i,u,.509+v*.491);else if(G9.materialIndex===5)uv.setXY(i,u,v*.491);else uv.setXY(i,.5,.5);}
  g.clearGroups();return g;}
function richTexLiasse(){const b=RICH.texBillet.image;return richCv(512,512,function(x){ // la LIASSE : le billet du dessus et sa BANDE ; les feuilles empilées sur la tranche
  x.drawImage(b,0,0,512,236);x.fillStyle='#efe6cf';x.fillRect(228,0,56,236);x.fillStyle='rgba(150,110,40,.6)';x.fillRect(228,0,3,236);x.fillRect(281,0,3,236);
  x.save();x.translate(256,118);x.rotate(-Math.PI/2);x.font='14px "Press Start 2P",monospace';x.fillStyle='#7a5a1a';x.textAlign='center';x.textBaseline='middle';x.fillText('$ 10 000',0,0);x.restore();
  for(let y=256;y<512;y+=4){x.fillStyle=(y/4)%2?'#cfe9e1':'#0c5a66';x.fillRect(0,y,512,4);}x.fillStyle='#efe6cf';x.fillRect(228,256,56,256);});}
function richLiasseGeo(){const g=new THREE.BoxGeometry(1,.46,.12),uv=g.attributes.uv;
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex>=4)uv.setXY(i,u,.539+v*.461);else if(G9.materialIndex>=2)uv.setXY(i,u,v*.5);else uv.setXY(i,.04+v*.12,u*.5);} // les grandes tranches portent la bande ; sur toutes, les feuilles s'empilent dans l'épaisseur
  g.clearGroups();return g;}
function richTexChampagne(){return richCv(128,512,function(x){const Y=function(v){return (1-v)*512;}; // la bouteille, de bas (v 0) en haut (v 1)
  x.fillStyle='#062a12';x.fillRect(0,0,128,512);x.fillStyle='rgba(140,210,160,.22)';x.fillRect(22,Y(.72),7,Y(.06)-Y(.72)); // le verre vert et son reflet
  x.fillStyle='#efe3c2';x.fillRect(0,Y(.46),74,Y(.22)-Y(.46));x.fillStyle='#c9a24a';x.fillRect(0,Y(.46),74,6);x.fillRect(0,Y(.22)-6,74,6);x.fillRect(30,Y(.38),16,Y(.3)-Y(.38)); // l'étiquette
  const G=x.createLinearGradient(0,0,128,0);G.addColorStop(0,'#b8862c');G.addColorStop(.45,'#ffe6a0');G.addColorStop(1,'#a87a22');x.fillStyle=G;x.fillRect(0,0,128,Y(.71)); // la COIFFE dorée
  x.fillStyle='rgba(90,60,10,.35)';for(let i=0;i<14;i++)x.fillRect(Math.random()*128,Math.random()*Y(.8),2,30+Math.random()*60);
  x.fillStyle='#efe3c2';x.fillRect(0,Y(.71),128,8);});}
/* (2026-10-16, Léo : « les bouteilles, on dirait des sodas, des potions Fortnite — reviens sur la bouteille de vin cher, juste deux, trois,
   quatre en plus, mais dans le vin ») LES COUSINS DU CHAMPAGNE : le bordeaux grand cru, le bourgogne, le champagne rosé, le vin liquoreux
   doré — faits comme lui : un profil tourné (richVinGeo), une toile peinte de bas en haut (le verre et son reflet, l'étiquette sur une face,
   la capsule), le programme du métal (le studio du bijoutier s'y reflète comme sur le verre). Sans nom ni marque. */
function richVinStrie(x,Y,c,v0,v1){x.fillStyle=c;x.fillRect(22,Y(v1),7,Y(v0)-Y(v1));x.fillRect(31,Y(v1),2,Y(v0)-Y(v1));} // le reflet du verre
function richVinCoiffe(x,Y,v0,c0,c1,c2){const G=x.createLinearGradient(0,0,128,0);G.addColorStop(0,c0);G.addColorStop(.42,c1);G.addColorStop(1,c2);x.fillStyle=G;x.fillRect(0,0,128,Y(v0));} // la capsule, éclairée de biais
function richVinEtiq(x,Y,v0,v1,fond,fil,enc,l1,l2,deco){ // l'étiquette sur une face (0 → 80 de la toile) : le papier, deux filets, l'emblème, deux lignes de texte
  const a=Y(v1),b=Y(v0);x.fillStyle=fond;x.fillRect(0,a,80,b-a);x.fillStyle=fil;x.fillRect(0,a+5,80,2);x.fillRect(0,b-7,80,2);x.fillRect(4,a+5,1.5,b-a-10);x.fillRect(74,a+5,1.5,b-a-10);
  if(deco)deco(x,40,a+(b-a)*.36);x.textAlign='center';x.textBaseline='middle';x.fillStyle=enc;x.font='7px "Press Start 2P",monospace';x.fillText(l1,40,a+(b-a)*.7);
  x.font='5px "Press Start 2P",monospace';x.fillText(l2,40,a+(b-a)*.84);}
function richVinChateau(x,cx,cy){x.strokeStyle='#5b3a1e';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-22,cy+8);x.lineTo(cx+22,cy+8);x.moveTo(cx-16,cy+8);x.lineTo(cx-16,cy-2);x.lineTo(cx,cy-10);x.lineTo(cx+16,cy-2);x.lineTo(cx+16,cy+8);
  x.moveTo(cx-22,cy+8);x.lineTo(cx-22,cy-6);x.lineTo(cx-19,cy-11);x.lineTo(cx-16,cy-6);x.moveTo(cx+22,cy+8);x.lineTo(cx+22,cy-6);x.lineTo(cx+19,cy-11);x.lineTo(cx+16,cy-6);x.stroke();
  x.fillStyle='#5b3a1e';x.fillRect(cx-3,cy+1,6,7);} // le château, gravé
function richVinBlason(x,cx,cy){x.fillStyle='#c9a24a';x.beginPath();x.moveTo(cx-11,cy-10);x.lineTo(cx+11,cy-10);x.lineTo(cx+11,cy+2);x.quadraticCurveTo(cx,cy+13,cx-11,cy+2);x.closePath();x.fill();
  x.fillStyle='#7a1420';x.fillRect(cx-2,cy-10,4,19);x.fillRect(cx-11,cy-4,22,3);} // le blason
const RICH_VINS=[
  {nom:'bordeaux',p:[[0,0],[.3,0],[.33,.03],[.34,.06],[.34,.72],[.33,.77],[.27,.83],[.17,.88],[.13,.93],[.12,1],[.12,1.2],[.13,1.22],[.13,1.28],[.1,1.3],[0,1.3]],
   peint:function(x,Y){x.fillStyle='#120a0b';x.fillRect(0,0,128,512);richVinStrie(x,Y,'rgba(210,140,150,.16)',.08,.7);   // LE BORDEAUX GRAND CRU : le verre presque noir
     richVinEtiq(x,Y,.2,.48,'#efe6cf','#b8923e','#5a1a1e','GRAND CRU','CLASSE 1982',richVinChateau);
     richVinCoiffe(x,Y,.79,'#3c0810','#8a1a26','#2a050b');x.fillStyle='#c9a24a';x.fillRect(0,Y(.8),128,4);}},                   // la capsule bordeaux, son anneau d'or
  {nom:'bourgogne',p:[[0,0],[.33,0],[.36,.03],[.37,.07],[.37,.42],[.35,.55],[.29,.7],[.21,.84],[.15,.96],[.13,1.04],[.13,1.2],[.14,1.22],[.14,1.28],[.1,1.3],[0,1.3]],
   peint:function(x,Y){x.fillStyle='#16200e';x.fillRect(0,0,128,512);richVinStrie(x,Y,'rgba(170,210,140,.17)',.08,.6);   // LE BOURGOGNE : épaules tombantes, verre vert sombre
     richVinEtiq(x,Y,.16,.4,'#f2ead6','#9c7a34','#3d2a12','GRAND VIN','DE BOURGOGNE',richVinBlason);
     x.fillStyle='#f2ead6';x.fillRect(0,Y(.62),60,Y(.56)-Y(.62));x.fillStyle='#9c7a34';x.fillRect(0,Y(.62),60,2);            // la collerette
     richVinCoiffe(x,Y,.8,'#8a6a22','#f4dc8e','#6e5216');}},                                                                     // la capsule dorée
  {nom:'rose',p:[[0,0],[.33,0],[.36,.03],[.37,.08],[.37,.6],[.34,.7],[.24,.82],[.15,.92],[.13,1],[.13,1.16],[.145,1.18],[.145,1.27],[.1,1.3],[0,1.3]],shin:110,
   peint:function(x,Y){x.fillStyle='#6e2432';x.fillRect(0,0,128,512);x.fillStyle='rgba(255,170,180,.12)';x.fillRect(0,Y(.6),128,Y(.04)-Y(.6));richVinStrie(x,Y,'rgba(255,215,222,.34)',.06,.7);    // LE CHAMPAGNE ROSÉ : le verre clair, le rosé qui se voit
     richVinEtiq(x,Y,.22,.46,'#f7f1ea','#d49a82','#8a4a40','BRUT ROSE','MILLESIME',function(x9,cx,cy){x9.fillStyle='#d49a82';x9.beginPath();x9.arc(cx,cy,9,0,6.2832);x9.fill();x9.fillStyle='#f7f1ea';x9.beginPath();x9.arc(cx,cy,5,0,6.2832);x9.fill();});
     richVinCoiffe(x,Y,.71,'#a8604e','#f6cdbd','#8a4a3c');x.fillStyle='#f7f1ea';x.fillRect(0,Y(.71),128,6);}},                   // la coiffe or rose
  {nom:'liquoreux',p:[[0,0],[.27,0],[.3,.03],[.3,.74],[.29,.79],[.23,.85],[.15,.9],[.115,.95],[.105,1.02],[.105,1.22],[.115,1.24],[.115,1.3],[0,1.3]],shin:120,
   peint:function(x,Y){x.fillStyle='#6a4206';x.fillRect(0,0,128,512);x.fillStyle='rgba(255,200,90,.12)';x.fillRect(0,Y(.64),128,Y(.04)-Y(.64));richVinStrie(x,Y,'rgba(255,236,180,.34)',.06,.72);  // LE VIN LIQUOREUX : fin, le vin couleur d'or au travers du verre clair
     richVinEtiq(x,Y,.24,.5,'#f8f5ec','#c9a24a','#6e5216','PREMIER CRU','VIN DOUX',function(x9,cx,cy){x9.strokeStyle='#c9a24a';x9.lineWidth=1.5;x9.beginPath();x9.arc(cx,cy,10,0,6.2832);x9.stroke();x9.fillStyle='#c9a24a';x9.font='8px "Press Start 2P",monospace';x9.textAlign='center';x9.textBaseline='middle';x9.fillText('1',cx,cy+1);});
     richVinCoiffe(x,Y,.82,'#8a6a22','#f8e6a6','#6e5216');}}];
function richTexVin(V){return richCv(128,512,function(x){V.peint(x,function(v){return (1-v)*512;});});}
function richVinGeo(P){const g=new THREE.LatheGeometry(P.map(function(a){return new THREE.Vector2(a[0],a[1]);}),16),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setY(i,p.getY(i)/1.3);g.translate(0,-.62,0);g.computeVertexNormals();return g;}
function richChampagneGeo(){const P=[[0,0],[.33,0],[.36,.03],[.37,.08],[.37,.6],[.34,.7],[.24,.82],[.15,.92],[.13,1],[.13,1.16],[.145,1.18],[.145,1.27],[.1,1.3],[0,1.3]].map(function(a){return new THREE.Vector2(a[0],a[1]);});
  const g=new THREE.LatheGeometry(P,14),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setY(i,p.getY(i)/1.3);g.translate(0,-.62,0);g.computeVertexNormals();return g;}
function richEmeraude(){ // la taille ÉMERAUDE : table rectangulaire, gradins, rondiste octogonal allongé, culasse en carène
  const oct=function(w,l,c,y){return [[-w+c,y,-l],[w-c,y,-l],[w,y,-l+c],[w,y,l-c],[w-c,y,l],[-w+c,y,l],[-w,y,l-c],[-w,y,-l+c]];};
  const T=oct(.5,.78,.16,.32),S=oct(.78,1.06,.24,.16),G=oct(.9,1.2,.28,0),B=oct(.55,.85,.18,-.32),K0=[0,-.62,-.45],K1=[0,-.62,.45];
  const P=[],tri=function(a,b,c){P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);},quad=function(a,b,c,d){tri(a,b,c);tri(a,c,d);};
  for(let i=0;i<8;i++)tri([0,.32,0],T[i],T[(i+1)%8]);
  for(let i=0;i<8;i++){const j=(i+1)%8;quad(T[i],S[i],S[j],T[j]);quad(S[i],G[i],G[j],S[j]);quad(G[i],B[i],B[j],G[j]);}
  tri(B[0],B[1],K0);tri(B[1],B[2],K0);quad(B[2],B[3],K1,K0);tri(B[3],B[4],K1);tri(B[4],B[5],K1);tri(B[5],B[6],K1);quad(B[6],B[7],K0,K1);tri(B[7],B[0],K0);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));g.scale(.72,1,.72);return richPlat(g);}
function richFusion(L){ // des primitives (géométrie, matrice) → UNE géométrie non indexée, normales plates (chaque primitive garde son sens)
  let n=0;const parts=[];for(const e of L){const gg=e[0].index?e[0].toNonIndexed():e[0].clone();gg.applyMatrix4(e[1]);parts.push(gg);n+=gg.attributes.position.count;e[0].dispose();}
  const pos=new Float32Array(n*3);let o=0;for(const gg of parts){pos.set(gg.attributes.position.array,o);o+=gg.attributes.position.array.length;gg.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.computeVertexNormals();g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2).fill(.5),2));return g;}
function richM4(x,y,z,sx,sy,sz){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz));}
function richCraneGeo(){ // (2026-10-21, Léo : « prends un modèle 3D de crâne réaliste ») LE CRÂNE : un vrai crâne humain scanné — « Scattering Skull » de Vladimir Petkovic (Khronos glTF Sample Assets, CC0 1.0), 188 871 triangles
  // réduits à 3 992 (simplification par quadriques, meshoptimizer) et logés ici en int16 (centré, ±32000 = 1 de demi-grand côté) + indices en uint16. Y en haut, le visage vers +z. Normales LISSES (c'est un os, pas un cristal).
  const P64='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',I64='AAABAAIAAwAEAAUABgAHAAgACQAKAAYACwAMAAYACQAGAA0ADgAPABAAEQASABMAEQAUABIADgAVABAADgAQAA8ADgAPABYAEwANABEACwAXABgAEAAVABkAFAAaABIAGwAcAB0AHgAfACAADgAWAAUADgAFAA8AIQAeACAACwAYACIAIwAEACQAIwAkACUAIgAmACcAFwAiAAsACwAoABcAJgApACoAJgAqACkAKwAdACwALQAPAC4ALwAwACEALwAhACAACwAiAAwALwAcADAAHwAnADEAHwAxADIAHQAcAC0AHQAtACwAMwAwADQAMwA1ADAANQA2ADcANQA4ADYAJQA5ADoAJQA6ACMAOwA8ADcAMgAxAB8AMQAnAD0AAQA+AD8ANQA3AEAANQBAADAAQQBCAEMAQQBDAEQAQQBEAEUAQQBFAEIAOgAqACkARgBHAEgARgBJAEcARgBKAEkAMQA9AEsAMQBLAB8ATABNAE4ATABPAE0AKgA6AFAARABBAFEAUgAuAA8AUwBUAFUAUwBVAFYASgBXACwASgBGAFcAKQBYADoARABWAEEAWQA4AEsAWQBLAFoARQBEAFsAWwBcAEUAWwBRAEEAKQAqAFgAXQBeAF8AUQBbAEQAYABhAGIAYwBkAGUAVgBEAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcAByAHMAcAB0AHEAcABUAHQAXgBdAHUAdABUAFMAcQBwAHYAcQB2AHcAcQB3AHAAZABNAE8AZAB4AE0AeQB6AHsAeQB7AHwAZABiAGMAZABjAGUAcQB2AH0AfgB/AIAAfgCAAIEAggBlAIMAewCEAHwAhQCGAIcAhQCHAIgAdgBxAGYAiQCKAIsAjACNAI4AjACPAI0AaQCQAEoAjwCRAI0AkgBsAJMAjwCUAIIAjwCCAJEAjwCVAJQAlgB1AJcAlgCYAJkAhACaAHwAiQCXAJgAhACbAJoAjACOAJwAjwCUAJwAjACcAHgAdgBmAH0AnQCeAJ8AoAChAJ8AogCjAKQAogCkAKUAogClAJsAogCbAIQApgCeAJ0ApgCnAJ4AqACpAKoAqACqAKsArACtAK4ArwCsALAArwCxALIArwCyAKwArgCzAJwArAC0ALMArgC1ALMAswC1AKwAtAC2ALcAqACrALgAuQC6ALsAvAC5AL0AvAC6AL4AvAC+ALkAvwCeALoAwAB4AJwAwACcALMAwQDCAMMAwQDDAMQAwgDBAMUAxgDHAMgAxQDJAMIAygDLAMwAygDNAMsAzgDPAMsA0ADMAMsA0QDSANMA0QDTANQAywDNAMwAzADNANUA1gDXANUA1QDYANYA2QDaANsA3ADdAN4A3wDgAOEA4gDjAOQA0QDlAOYA5wDiAOgA6ADiAOkA6gDrAOwA6gDtAOsA7gDiAOcA7gDjAOIA6gDvAO0A2gDwAPEA5ADyAPMA7wDqAPQA9QD2APAA9wD4AOYA+QD2APUA+gD7APwA+gD8AP0A+gD9AP4A/AD/AP0AAAH3APkAAQHxAPkAAQH5AAIBAwEEAQUBAwEGAQcBCAEGAQMBCAHyAAYBCAEJAQUBCgEDAQsBAwEFAQoBDAENAQ4BBQEPAQgBEAERARIBCQETARQBCQEVARMBFgEXARgBFgEZARoBGwEcAR0BGQEYAR4BHwEgASEBIgEjASQBJQEmAScBIAEoASkBKgErASwBIwEtAS4BLwEwATEBLwEyATABMwE0ATUBNgE3ATgBOQE6ATsBOQE8AToBPQE+AT8BQAFBAUIBQwFEAUUBRgFHAUgBSQFKAUsBTAFNAU4BTwFQAVEBTwFRAVIBUwFUAVUBVgFXAVgBWQFaAVsBXAFdAV4BXAFfAV0BYAFhAV8BYAFfAVIBYAFSAVEBYgFjAWQBYgFkAWUBZgFdAWcBZgFoAV0BVwFpAWoBawFpAWwBVAFtAW4BbwFwAXEBcgFzAXQBcgF0AXUBdgF3AW4BeAF5AXoBewF8AX0BewF9AX4BfwGAAYEBggGDAYQBhQGGAYcBiAGGAYkBhgGIAYoBiwGIAYwBjAGNAYsBjgGPAZABkQGSAZMBlAGVAZYB+gCXAZgBmAGZAfsAmAH7APoA+wCZAfwAmgGbAZgBmQGYAZsBmgEWAZsBlwGaAZgBnAEZAZcBGQGcAZ0BngEYAZ0BGAEXAR4BnwGgAaEBoAERAaEBoAGiAREBoAEoAaMBowGiAaABpAGlAaYBMgCnATEAMgCoAacBqAFAAFkAqAEwAEAAqAEyADAAMAAyACEAIQAyAAkACQALAAYACQAXAAsAFwAJAKkBqQGnASgAqQEoABcApwFQACgAUACqASoAqgFYACoAUQBEAEMAQwAjAFEAIwBYAFEAWAAjADoAUAAXACgAUAA6ABcAOgADABcAOgA5AAMAOQCrAQMAqwE5ACUAAwAYABcAGACrASYAGAAmACIAqwEpACYAJQApAKsBKQAlAEIAKQBCAEUARQAmACkARQCsASYArQEnACYArQE9ACcArgFLAD0ArwF5AFoAegBqAHsAkgCiAIQAowCwAaQApACwAcMApACxAbIBpACyAaUApQCyAbMBswG0AaUAtAGzAbUBtAHCAKUApQDCAMkAyQCbAKUAyQC2AZsAmgBZAEAAWgB5ADgAWgA4AFkANgBqALcBOABqADYASwA4AB8AHwAeAAwAHwAMACcAJwAMACIAHgAGAAwAHgAhAAkAHgAJAAYAMwAvACAAIAA4ADMAMwA0ALgBNAAwAFcAVwBGADQAVwAcACwAHAANABQAHAAUAC0ADQATABQAFAATABoAGgC5AR0AGgAdALoBugEdACsAugG7AbwBvAG9AboBRwCAAL0BfgCBAL4BvgG/AcABvgHBAb8BvwHCAcMBwwHEAb8BxAHFAcYBxAHGAb8BwAHHAb4BvgHHAX4AyAHJAcoBygF/AMgBfwB+AMgBvQHLAboBywHMAboBzAEaALoBzAESABoAzAHLAc0BywHOAc0BzgHLAb0BgADOAb0BfwDPAdABfwDOAYAA0QHMAc0B0QEZABUA0QEVAMwBFQASAMwBEgAVAA4AEgDSARMAEwDSAQcAEwAHABoAuQEbAB0AKwAbAEgARgBIADQASAC4ATQAuAEvADMAuAHTAS8AHADTAQoAHAAKAAkACgC5AQcABwAGAAoABwDSAQMABwADAAgAAwDSAQQABADSAdQB0gEOANQB1QEEANQBBADVASQAQgAlACQAQgAkAEMAQwAkAFIAUgAjAEMATQBSACQATQDWAU4A1wEQAE4AEADYAU4AEADXAQ4A2AEQABkA2AEZANkBGQDRAdkBzQHaAdkBzQHZAdEBzwF/ANsB2wF/AMoBygHcAdsByQHdAd4ByQHeAcoB3gHcAcoB3AHfAdsB4AHhAc4B4AHOAdAB4QHaAc0B2QFMANgB4gFPAEwATwDiAeMBTwDkAWQAZADkAWUAZQDkAeUBZQDlAYMAlAB4AGUAeACUAIwAlABlAIIA5gFgAGMA5gHnAWAA5wHiAWAA5wHjAeIB4wHkAU8AgwDlAegB6AHmAYMA6AHnAeYB5wHoAekB5AHjAekB5AHpAegB6AHlAeQB4wHnAekB5gGCAIMA5gGRAIIA4gFMAOoB4gHqAesBTACHAOoBTADZAdoB0AHPAewB7AHPAdsB7AHbAd8B7QHfAdwB7QHcAd4B3ADeAN8B7AHuAdAB0AHuAeAB4AGIAOEBhwDrAeoB6wFgAOIB6wHvAWEA6wFhAGAAYQDvAY0AYQCNAGMAYQBjAGIA5gFjAI0AjQCRAOYBlQCyALEAlQCxAPABlQDwAZQAsQCvALQAtADwAbEAtACUAPABrgCcAJQAtACsAK4AtACuAJQAtAC3ALMAtwDAALMA0gDUANMA3wHeAOwB3QDxAd4A7AHyAfMB9AHzAYgAhQCIAPUBhQD1AfYB9wH4AfkB9wH6AfgB+wH6AfwB/QH7AfwB/QH8Af4B3QD+AfwB8QH/Ad4A3gAAAuwBAALyAewB8gGIAPMBiAABAvUB9QH3AfkB/AHxAd0A/wEAAt4AAAICAvIBiADyAQEC9wEDAvoBAwL8AfoB/AEDAvEB8QECAv8BAwL3AQQCAwIEAvEB8QEFAgICAgIAAv8BAgIFAvIBBQIBAvIBBgIBAgUCBAIGAgUCAQIGAvUBBgIEAvcBBgL3AfUBBQLxAQQCBwL6AfsBhgAIAgkCCAIKAgsCCwIKAgwCDALUANIA1AAMAvAA8AANAg4C9QDwAA4CDwL5APUA+QAPAhAC+QAQAgIBAgERAgEBAgESAhECGwETAhQCFQISAhQCFAISAhACFgIbARQCFgIXAhsBGAIbARECEQL4AAEB+AAAAQEB+AARAhsBGwEZAvgAGQIdARoCGgIdARsCGwIcAhoCGQLmAPgA5gAZAh0CAAH4APcAAAH3AB4CwADRAOYAeAAfAk0AHwIuAFIAHwJSAE0ADwARAA0ADQAWAA8AUgAPAAUAUgAFACMAIwAFAAQABQAWAAMADQADABYADQAcAAkALAAtAC4AIAIfAiECIgIhAh8CIQIjAiQCHAIZAhoCGQIcAiUCGQIlAiMC5gAdAsAAHQJ4AMAAIAIuAB8CIwIhAiICJQImAiMCGQIjAh0CHQIfAngAHwIdAiICIwIiAh0CHQEnAhsCIQIoAiACIAIpAi4AKQIsAC4ALAAqAkoASQBKADsAaAArAiwCKwItAoEALQLBAYEALAJJAGgASQAsAkcARwC8AbsBRwC7AUgAKwAsABsASAC7ASsARwC9AbwBgABHACwCgAAsAisCKwKBAIAAwQG+AYEAwwHCAS4CwwEvAsQBLwLDAS4CMAIxAi0CLQIyAjMCqgAyAosAqgCLAIoAiwBoAGcAZwBfAIsAlwB1AF0AdQBfAF4AXQA0AmkAXQBpAJcAXQA1AjQCNQJKAJAANAKQAGgAkAA0AjUCaAA2AjQCXwB1AIsAXwBnADQCiwCWAIkAlgCLAHUAiQCWADcCiQA3AooAigA3AqsAqwCqAIoAlgCZADcCmQA4AjcCOAI5AjcCmQA6AjgCOgK4ADkCOgI5AjgCOQKrADcCuACrADkCuACYAKgAmAC4ADoCOgKZAJgAXwA0Al0ANAI2Al0ANgI2AF0AXQA2ADUCNgA8ADUCPABKADUCPAA7AEoAOwJJADsAOwJoAEkAOwI2AmgAOwI3ADYAOwI2ADYCPAA2ADcANwA7AjsAlwAqApgAKgKXAGkANAJnAGkAiwArAmgAKwKLADwCPAItAisCLQI8AjICwgExAjACMQLCAcEBLQIxAsEBMAIuAsIBPAKLADICqgCpADICMgKpADMCzwDQAMsAPQLQAM8APQLXANYAPgI/Aj0CPwI+AkACPwLXAD0C1QDXAMwA2ABBAkIC2ABDAtYA1gBDAtAA1gDQAD0C0ADOAMsAywDMANAAQwLOANAARAJCAvoAQgJBAv0AQgL9APoAzQBBAtgA/QBBApwBnAH+AP0AnAGXAf4AlwH6AP4AnAFBAkUCRQJBAkYCRgJBAkcCSAJJAkoCSgJGAkgCRQKdAZwBRQJLAp4BRQKeAZ0BSwJMAp4BTQIYAZ4BTQIWARgBFgFNApsB/ACZAZsB/ACeAU4CTgJPAv8ATgL/APwA/wDOAEMC/wBDAv0AzgD/AE8CUAJRAjACUAIwAi0CLwLFAcQBxgHAAVICUgK/AcYBwAHGAVMCxwHJAcgBxwFUAskBVALdAckB3QFVAt4B3gHdANwA3gHcAO0B3QDeAVUCVQL+Ad0AVgL9Af4B/QFXAvsBVwJYAvsBBwL7AVgCBwL4AfoBhQAIAoYAWQIMAgoCDAJZAvAAWgINAvAAWgJbAg0CXAINAlsCDQJcAg4CDgIXAhYCDgIWAvUA9QAWAhQC9QAUAg8CFwIOAlwCFwJdAhwBHAEbARcCHAEnAh0BJwJeAhsCXgIcAhsCHAJfAiUCIwImAiQCKAJgAiACIAJgAikCKQJHAiwAKgJpAEoAKgKoAJgAKgLKAKgAqAA/AkACqABAAqkAPQJAAj4CqQBAAs8AzwBAAj0CqADKAD8CygDMANcAygDXAD8CzQDKAEECRgJHAkgCSQJhAkoCSgJhAksCSwJGAkoCRgJLAkUCYgKeAUwCTQKeAfwATQL8AJsBngFiAk4CYwJPAk4CTwJkAjMCTwIzAs4AMwJkAlACUAItAjMCZQIuAjACLgJlAmYCLgJmAi8CLwJnAmgCLwJoAsUBxQFpAmoCagLGAcUBUwJrAsABVAJsAt0BbAJVAt0BVgJtAv0BVwL9AW0C+AEHAm4C+AH1AfkBWQIKAm8CCgJwAm8CCgIIAnACcAIIAoUAcAKFAPYBcAL2AXEC9gH4AXICbQJWAnMCVgL+AWwCbAJzAlYCbAL+AVUCWAJuAgcCcgJ0AvYB9gF0AnECdQJvAnACdgJZAm8CdgJaAlkCdgJ3AloCeAJ5AnoCeQJ7AnwCfQJ+AnwCfgJ/AoACgQKCAoMChAKFAoYChwKIAnoBegGJAngBegGKAokCiQKKAosCeAGJAowCcAF5AXgBcAF4AYwCjQJ5AW8BeQFwAW8BhwJ6AXkBhgKFAogChAKGAo4CggKEAo4CgwKPAoECgwKQAo8CkQKSApMCfwKTAoACgAJ8An4CfAJ6AnkCegKUAngCeAKUApUClQKUApYCWwJ3ApcCWQJaAvAAWgJ3AlsCWwKXApgCmAKXApYCXwIcAl4CJQJfAiYCmQIhAiQCmQIoAiECRwIqAiwARwLKACoCygBHAkECSQKaAmECSwJhApsCTAJLAmICYgKcAk4CTgKcAmMCTwJjAmQCZAJRAlACUQJlAjACZgJnAi8CZwKdAmgCnQKeAmgCaAKeAp8CoAJoAp8CoALFAWgCxgFqAqECUwLGAaECUwKhAqICcwKjAm0CowJXAm0CVwKjAqQCpQJvAnUCpQJ2Am8CdgKlAqYCdwJ2AqcCpwKXAncClwKoApUClQKWApcCeQKpAqoCqwKsAq0CrgKvArACsAKxArICswKxArQCswK0ArUCXgG2ArcCXgFdAbYCYQFiAV0BYgFhAbgCYgG4AmMBZAFSAWUBUQG5AmABYAG6ArsCYAG7AmEBYQFdAV8BYQG7ArgCuAK7ArwCuAK8Ar0CuAK9Ar4CvgJjAbgCuQK6AmABvAK7AroCvgK9Ar8CvgLAAmMBPwHBAroCvAK6AsECvwLAAr4CPwG6AsICwQK9ArwCvQLDAr8CvwLDAkYBRgFIAb8CwALEAmMBxAJkAWMBUgHEAk8BxQLGAscCRwHIAsYCyQI8AcoCyQLLAjwByQI/AcsCPwE6AcsCzAI7AToBOgE+AcwCygLNAkcBxgLOAscCxwJRAVABugK5AsICyQLBAj8ByQLPAsECzwLDAsECwwK9AsECZAHEAlIBxwLQAsUCxQJIAUcBxQJHAcYCSAHAAr8C0ALHAlABxQLQAkgBwALRAsQCTwHRAlAB0QLQAlABSAHSAsAC0gLRAsAC0QJPAcQC0QLSAtAC0gJIAdACRgHDAkcBwwLPAkcBzwLJAsoCzwLKAkcBPgHTAswC1AI7AcwCOgE8AcsCzQLKAjwBzQLIAkcBxgLIAtUCxgLWAs4CwgLXAj8B1wI9AT8B0wLUAswC1AI5ATsBOQHNAjwB1QLWAsYCzgJRAccC2ALCArkC2QI+AT0B2gLNAtQC1ALNAjkB2gLIAs0C1gLVAtsCUQHcArkCJAHdAg8BDwEiASQBDwHdAggBDwEEASIBBAEPAQUBBAEDAd4CBAHeAicBJwEiAQQBLQEjASIB3wI9AdcCPQHgAtkC2gLUAtMCyALaAtUCwgLhAtcC3wLiAuMCJAHgAt0C5ALzAPIA5ALyAAgB5QLkAOgA5QLoAOYC5gLoAOcC5gLoAuUC5gLnAukC5gLpAuoC5gLqAugC5QLoAusC6wLqAuwC7AILAesCCgEJARQBJQEnARQBJQHtAiYB3gIKARQBAwHuAgsBCwHuAusCBwHyAOUC8gAHAQYBAwEKAQgBCAHvAgkBEwEtASYBEwEmAe0CJgEiAScBIgEmAS0BLQHwAi4BLgHxAiMB8gI+AdkCPgHyAtMCzgLzAlEB8wLcAlEB3ALYArkCwgLYAuEC4gLfAtcC3wLjAuAC5AIIAd0C5AL0AvMA8wD0AvUC8wD1AuQA9QLiAOQA9QL2AvcC9QL3AuIA9wL4AukA9wLpAOIA9wK7APgC+AL5AucC5wL5AvoC5wL6AukC+gLqAukC5wDjAOoCFQEJAe8C+wLwAhUB8AITARUB8AItARMB8gLxAi4B8gLZAvEC1QLaAtMC4gL8AuMC4wL8Av0C/QL+AuMC9wL2ArkA9wK5ALsAuQD/AgADuQAAA58AAAOdAJ8AAAN2AJ0AcwChAJ0AcwCdAHYAoACmAJ0ApgCgAH0AnwCeAKAAoACeAL8AvwABA6AAAgOgAAEDAgMBAwMDAgMEA3IAAgN9AKAAdABmAHEAZgBRAKcApwB9AGYApwCmAH0ABQOeAKcAngAFA7oA7gC6AO8C7gDvAuMA7wIIAeMA+wIVAe8C0wLyAtsC1QLTAtsC2wIGA9YC1gLzAs4C8wLYAtwC4gLXAuEC/QIHA/4C/gIIA+MCCAPgAuMC3QL0AuQC9QIJA/YCCQO5APYCuQAJA/8CAAN3AHYAXABbAHcARQBcAAoDrAELAyYACwOtASYArgFaAEsArwF6AHkAegCwAaMAwwAMA6QApAAMA7EBDQO1AbMBtQENAw4DDQOyAbEBsQEMAw4DsQEOAw0DDgMMA7UBDAPCALUBwgC0AbUBwgAMA8MAswGyAQ0DwQDEAA8DyADFAMEAyADBABADxwDGABEDxwARA+wAEgMRAxMDEgMTAxQDFAMRAxIDxQDIAMcAxwDrAMUA7AARAxQD7AAUA+oAFAMTAw8DEwPGABADxgDIABADxgATAxEDEAMPAxMDDwPEABQD6gAUA8QA6gAVA/QA7wASARYDFwMYA+0AFwPtAO8AGQMaAxsDHAMZAxsDHAMdAxkDHQMaAxkDGgMdAx4DGAMaAx4DGAMeA+0AHgMdAxEBHAMSAREBHAMRAR0DEgEcAxsDEgEbAxYDFgMbAxcDFwMbAxoDFwPvABYD7QAeAx8DHwMgA7YBtgGmAaUBpQGbALYBIAOjAaYBIAOiAaMBogEfAxEBIAOmAbYBIAMfA6IBHgMRAR8D7QDFAOsAHwO2AcUAHwPFAO0AxQC2AckAEgH0ACEDEgEiAxABEAEiAx8BEAEfASEBoQERARABoQEjAyQDHgGfARkBGQGfARoBGQEWAZoBGgEhARcBFwEhASABIAEpAR4BKQGfAR4BKQGgAZ8BJQMmA6QBpAEmA6UBpQGaAJsApQEnA5oApwEoA1AAKAOqAVAAUQApA6cAugAFA+8C7wIqA/sC+wIrA/ACKwMuAfACBgMsA9YC4QL8AuIC/AIHA/0C/gItAwgD4AIIA90C3QIuA/QCLgP1AvQC9QIuAwkDCQNtAP8C/wJtAAADdwBtAFwACgOsAUUArgEvA1oAMAPDALABwwAwAxUDFQMhA/QAIgMSASEDIQExAxABMQMjAxABEAEjA6EBJAOfAaEBGgGfATIDJAMjAzEDnwEkAzIDJAMxAzIDMQMhARoBMgMxAxoBHwEiAyABIAEzAzQDIAE0AzUDNQMoASABNgOjASgBowE2A6YBpAE3AzgDpwEnAygDWACqATkDOQNRAFgApwApAwUDBQMqA+8COgPyAi4B2wLyAjoDLAPzAtYCOwPhAtgC4QI8A/wCPAPhAjsDOwPYAvMC8wI8AzsDPAPzAj0DPAMHA/wCPAM+AwcDBwM+Az8DBwMtA/4CLQMHAz8DLQM/A0ADLQNAAwgDCANBA90CbQB3AAADbQAKA1wACgMLA6wBrQELAz0APQAvA64BLwNCA68BrwFaAC8DrwFCA3oAFQMwA0MDFQNDAyEDRAMiAyEDIgMzAyABNANFAzUDpgFGA6QBJwOqASgDqgEnAzkDRwMFAykD+wIqA0gDSAMrA/sC2wI6AwYDBgNJAywD8wIsAz0DLgPdAkEDLgNuAG0ALgNtAAkDCwMvAz0ASgNCAy8DQgOwAXoAsAFCAzADSwMiA0wDMwNFAzQDNQNNAygBRgOmATYDOANOA08DTwMlAzgDUQA5AykDUAMpAzkDKQNQA0cDUQMuASsDLgFRAzoDLANJAz0DPgM9A0kDPgM8Az0DUgM/Az4DQAM/A1MDQANBAwgDVANuAG8AVANvAG4AbQBVAwoDCgNVAwsDVgMvAwsDQgNXAzADMANXA0MDQwNEAyEDSwMzAyIDSwNYAzMDMwNZA0UDRQNNAzUDWgMoAVsDWgM2AygBOANcA04DXQNeA18DVwNeA0MDTAMiA0QDWANZAzMDTQNgAygBKAFgA1sDOAM3A1wDXANfA04DQwNeA0QDTANhA0sDWQNNA0UDWwNgA1oDNgNaA2IDRgM2A2IDNwOkAUYDXQNfA1wDXQNEA14DYANNA1kDNwNGA2IDRANdA0wDSwNjA1gDWQNkA2ADZQNdA1wDZgNLA2EDWANjA2cDWANoA1kDZQNhA0wDYwNLA2YDWANnA2gDYANpA1oDagNcAzcDXANqA2UDZQNrA2EDYQNrA2YDYwNmA2wDaANkA1kDZANtA2ADYgNaA24DbwNwA3EDbwNxAzcDcQNqAzcDZQNqA2sDawNqA3IDawNyA3MDawNzA2YDZgN0A2wDbgNvA2IDbwM3A2IDcQNyA2oDcwN1A2YDdQN0A2YDQQFjA0QBYwNBAWcDbQNpA2ADbgN2A28DdQNzA3cDdwN0A3UDbAN0A3gDaANtA2QDbQN5A2kDbwN2A3oDcgNxA3cDdwNzA3IDdwN7A3QDdAN7A3gDbANEAWMDfAN5A20DaQN5A30DaQN9A24DbgNaA2kDbgN+A3YDegNwA28DcAN6A38DcAN/A4ADgANxA3ADgAOBA3EDgQN3A3EDgQN7A3cDewOBA4ADeANEAWwDbgN9A34DdgOCA3oDfwN7A4ADewN/A3gDRAFCAUEBQQFAAWcDZwNAAWgDgwNLAX0DSwFKAX4DhAOCA3YDSwGDA0kBhQOGA0kBhwOIA4kDhwOKA4sDiwOKA4wDiwOMA4QDjAOKA4IDggOKA38DeANFAUQBhgONA44DhwOJA48DigOQA38DeAOQA0UBQwFCAUQBkQOSA5MDkQODA5IDgwORA5QDgwOUA0kBhQNJAZQDlQONA4YDjwOOA4cDjgOKA4cDkAOKA0UBlgOXA5QDlQOXA5gDlQOYA40DjQNXAWoBlwOWA5gDagGKA44DigNqAZkDmQNFAYoDWAFDAUUBQwFYAZYDVwGNA5gDVwFWAVkBVwFZAVsBmgObA5wDnQOcA54DnwOgA6EDogOjA6QDpAOlA6YDpwOoA6YDpwOmA6kDqAOqA6sDrAOtA64DrgOvA6wDsAOxA7IDswO0A7UDtgO3A7gDuAO5A7oDuQO7A7oDuQO8A7sDvQO+A78DwAPBA8IDwAPDA8QDxAPFA8YDxAPGA8cDxwPIA8QDyQPKA8sDzAPNA4ABgAHOA88DzgOAAX8BzgPQA9ED0APSA9ED0gPQA3EB0gNxAXABcAGMAtIDjAKJAtMDiwLTA4kC0wOFAYwCjALUA9ID0gPUA9UD0gPVA9ED0QPPA84DzwPWA4ABgAHWA8wDzQPXA8oDygPXA8sDywPYA8kDywPZA9gDvwPaA9sD2gPBA9sDwAPcA90DwAPEA94DxAPIA94D3wPIA9gD4APhA5MBkQGTAeID4wPkA5EB4wPlA+QD5QPmA+QD5gPlA4UBiwKFAdMDhQGLAoYBhwHmA4UB5AOSAZEBvQO/A+cD6AO9A+kDugPqA+sD7APtA+4DsQPvA7ID8AOtA6wDpAPxA6IDogPyA6EDnAOdA/MD9AOaA/UD9gNbAfQDWAGYA5YDWAFXAZgDWwH2A1cB9QP2A/QD9QP3A/YD9QOaA/MD8wOdA/gD8gPxA/kD+gOkA/sDNgH8A/0D/QPwAzYB/gP/AwAEsgPvAwEEAQTvAwIEAwQEBAUEBgQHBLMDswMIBAYECQS4AwoECwTqAwwEDQQOBOgD6APpAw0E5wO/Aw8EvwMQBA8EEQQSBBAEEwTcA94DFAQVBN8DkgHkAxYE5AMXBBgEGQQXBIcBhwEaBBkEGgSHAYsBiAGJARsEGwSJARwEHASJAYoCigIdBBwEiQGGAYsCiwKKAokBHQQeBBwEGwQfBIgBiAEfBCAEGQQaBCEEIQQXBBkEFwQhBBgEFATfAxYE3QMTBCIE3QMjBBEE5wMPBCQEJQQCBAMEJQQBBAIEAQQmBLIDJgQyAf8D/wMyAQAE/gMABPAD+gP7AycE8QP6A/kD+QMoBPIDKAQpBJ4DnQOeAyoEKQQoBFUBKQQqBJ4DnQMqBCsEKwT4A50DLATzA/gD9QPzA/cD9wNsAfYD9gNsAWkBaQFXAfYDLQQuBJkDmQMuBFYBLgQvBFYBLwQwBFYBVgEwBFkBWQEwBFQBWQFUAVMBWwExBPQDmwMyBJwDoAMzBKEDogM0BKMDowM0BDUENQQ2BKUDpwMqAagDrwOwA7IDNwQ4BLEDOQQEBAME7AMEBO0D7gM6BAcElQG0A7MDOwQ8BMcDPQQ+BM0DPgSBAc0DMAQvBG0BMARtAVQBUwFaAVkBWgFTAT8EWgE/BDEEMQRABPQD9ANABEEEmwNCBDIEMgSgA58DoAMyBEMEQwQzBKADQwREBDMERARDBDcBRQQzBEQERQQ0BKIDRgQrATYELAFHBJsCmwJHBEgESwJIBGICnAJiAkkEUQJKBGUCZQJKBGYCZgKdAmcCnQJLBJ4CnwKeAkwEaQLFAaACagJNBKECawKjAk4EawJOBMcBxwFOBFQCVAJOBGwCdAJPBFAEpwJRBJcCeAKVAqkCeAKpAnkCqQJSBKoCqgKsAnkCrgKtAlMErgJTBFQErgJUBK8CsAKvArECtwK1AlUEtwJVBFwBXAFeAbcCXAFWBF8BVwRYBFkEWQRYBFoEWQRaBFsEXARbBFoEXARaBF0EXARdBF4EXQRfBGAEXwRhBGAEYQRfBGIEYQRjBGAEZARlBGMEZARmBGUEZwRoBGkEaARqBGkEagRrBGwEagRsBGkEbQRnBGkEbQRuBGcEbgRvBGcEYwRlBHAEcQReBF0EcQRdBGAEXgRxBHIEcgRcBF4EcwR0BHUEdAR2BHcEdwR2BHgEeAR2BGUEZQRmBHgEcARlBHYEcAR2BHkEeQRjBHAEeQRgBGMEeQRxBGAEcQR6BHIEcQRzBHoEcQR5BHMEeQR2BHsEdARzBHsEdAR7BHYEeQR7BHMEdQR0BHcEfARzBHUEcwR8BHIEcwRyBHoEfQRcBHIEfQR+BFwEXAR+BH8EXAR/BFsEWwSABFkEVwRZBFYEXwFWBIEEgASCBIEEgAR/BIMEfwR+BIQEfgR9BIQEcgSFBH0EhQRyBHwEdQSGBHwEdwR4BIcEdwSHBHUEhwR4BIgEiQRnBG8EigSJBG8EiARnBIkEiQSHBIgEdQSLBIYEhgSFBHwEfQSMBIQEjQR/BIQEfwSNBIMEggSABIMEjgSBBIIEgQSPBF8BgQSOBI8EjgRnAY8EZwFiAWUBZwFlAY8EXQGQBLYCtwK2ApEEkQS1ArcCswK1ApEEswKyArECrgKwApIErgKSBJMErgKTBK0CqwJ5AqwCeQKrAnsCfQKUBH4CTgGTAn8ClQSPApICHQSKAnoBHgSWBJcEHgSXBBwEHASXBJgEGwSYBB8EIASMAYgBjAEgBJkEGgSLAY0BGgSaBCEEGAQhBJsEFQQTBN4DIgQjBN0DEQQjBJwEEQScBBIEEgScBBAEEASdBJ4EngQPBBAEDwSeBCQEJATpA+cDJASfBOkDnwQNBOkDoAShBA4EDASiBAsEowS6A+sDCQQKBKQEpASlBAkEpgQJBKUEpgSnBKgEqAQIBKYECASoBAYEBgSpBAcE7AOqBAQEBQQlBAMEAQQlBKsENgEnBPwDJwT7A/wDJwSsBPoD+gOtBPkDKARTAVUBNgE4Aa4EOAE3AUMERQSvBDQENASwBDUEsAQ2BDUENgSwBEYEKwFHBCwBSQRiAkgEsQRjApwCYwJKBGQCUQJkAkoEZgKyBJ0CoAKzBLQEaQK1BGoCtQRNBGoCUwKiAqMCUwKjAmsCTgSjAnMCTgRzAmwCpAJYAlcCWAKkAm4CcgJuArYEcgL4AW4CcgK3BHQCUAS4BHQCdAK4BLkEdAK5BHECcQJ1AnACdQJxAqUCpgKnAnYCpwKmAuAAugS7BKcCqAJRBKkCqgK8BKwCvAStAqwCrwK9BLECvgRVBL8EvwTABMEEwgTDBMQExQTGBMQExQTHBMYExQRiBMcExwRfBMYExgTIBMQExATIBMIEwQTABMIEwQS+BL8EVgRcAVcEyARYBFcEWARdBFoEXQTGBF8ExgRdBMgEwgTIBMEEvgTBBFwBvgRcAVUEVwRcAcEEwQTIBFcEWATIBF0EYgRfBMcEYgTJBGEEYQTJBGMEygRkBGMEywRmBMwEzQTOBGgEaATOBM8EzwRqBGgEawTQBNEEawRqBNAEzQRoBGcEzQRnBMsEywTOBM0EZgRkBMwE0gTTBGsEawTTBNQEbATVBNYEbATWBGkEbQTXBG4E1wTYBG4E2ARvBG4E2ATXBIoE2ASKBG8EywRnBIgEywSIBHgEeARmBMsEigSQAY8BiQTZBHUEiQR1BIcEhQSGBNoEjAR9BIUEjQSEBIwEdQGCBIMEgwTbBHUB2wSDBI0EjQSMBNsE2gSGBIsEiwR1BNkE2QSJBNwE3ASJBIoEigSPAd0EigTdBNwE3QTZBNwE3QSPAd4E3gTZBN0EggHZBN4EggHfBNkE3wTaBIsEiwTZBN8E2gTgBIUE4ATbBIwE4ASMBIUEdQF0AYIEggR0AY4EZwGOBHQB3wThBOAE3wTgBNoE4QTfBIIB4ATiBHIBcgHiBHMB4wTiBOEEcwHkBHQBZwHlBGYBaAGQBF0BtgLmBJEEsgKzAucEsgLoBLAC6QSrAq0CfQJ7AuoETgFNAZMCkQKTAk0BkgKRApUE6wSCAoECegGIAh0EHQSIAoUCHQSFAh4EHgSFApYEmAQbBBwEmATsBB8EHwTtBCAEIATtBJkEmQTuBIwB7gSNAYwBjQGaBBoEmwTvBBgEGAQWBOQD8AQUBBYEEwQVBCIEnASdBBAEDQSfBPEE8gQLBPMEqAT0BAYEBwSpBPUEBwT1BKoEAAQyAfADRQREBPYE9gSvBEUERwQrAUYE9wRIBEcE9wRJBEgESQT3BPgE+AScAkkE+AT3BLEE+ASxBJwCYwKxBEoERwSxBPcERwSwBLEE+QRKBLAE+QSvBLIEnQKyBEsEnwKzBKACtARpAqACTQS1BPoE+wShAk0E+wQAAKEC/AT9BAIA/AQCAAEAAgCiAqECAgChAgAAogL+BKMCbgL/BLYEtgS3BHICuQQABXECAAWlAnECAAWmAqUCAAUBBeAAAAXgAKYCAQUABbkE4QABBbkEuAThALkEAgVQBAMFBAUFBQYFBwUFBQgFCQUKBQsFCQUMBQoFCgUNBQ4FDQUPBRAFEQUSBRMFFAUVBRYFFwUYBRkFGgUbBRwFHQUeBR8FIAUfBSEFIgUjBSQFJQUmBScFKAUpBSoFKwUsBS0FLQXUBNME1ATVBGsE1gQuBWkEaQQuBW0ELgXXBG0E1wQuBS8F1wSQAYoEjwEwBd4E3gQwBYMBMAWPAY4BMAWOAYMB3gSDAYIBgwExBYQB4QSCAeMEcwEyBeQE5AQyBXQBMgVnAXQBZwEzBTQFZwEyBTMFNAUzBTUFNAU1BTYFNAU2BeUENAXlBGcB5QRoAWYBtgKQBOYE5gQ3BZEEswI4BecE5wQ5BbICOQXoBLIC6ASSBLACkwTpBK0CkwSSBOkE6gQ6BX0COgWUBH0COwVOAX8C6wSEAoIChQKEApYElgSEApcEPAWYBD0FmAQ8BewE7ATtBB8EPgU8BT8FPwU8BUAFQQU9BZgEQQWXBOsElwRBBZgE6wSBAkEFQQVABT0FQgVABUEFQQWBAkMFQwVCBUEFQAVCBUQFRAUxBUAFMQU/BUAFhAFFBYIBggFFBeMERQWEAeMEhAFGBeMEhAFHBUYFRwVMAUYFcwFGBTIFNgVIBeUESAVJBWgBSAVoAeUEaAFKBUsFaAFLBZAETAVLBU0FTAVNBX4BfQF8AU4FTwVQBX0BUQXOBMsEUgXQBGoE0ARTBdEE0gRrBNEE0wQrBS0FVAUlBScFVQUiBSQFGwVWBVcFGgUcBVgFWQVYBVoFWQVaBVsFXAUXBRkFXQUQBV4FDQVfBQ4FBwUIBWAFBwVgBQYFBwUGBQUFYQVQBAIFYQW4BFAEYgXhALgE4AC6BKcCugTfAGMFugRjBVEEUgRkBWUFZQW8BKoCvARTBK0CVAS9BK8CvQRUBEwFwAS/BFUExATDBMUEZgViBMUEYgRPBckETwViBGcFTwVnBVAFSwVMBWgFkARoBeYEkQQ4BbMC6AQ5BWkF6QSSBGoFNAEzAekEMwFrBekEawVsBeoEbQU6BeoEOwVuBU4BTgFuBUwBbgUzBUwBTAFvBZECkQJNAUwBlQSBAo8ClQRDBYECbwVEBUIFMQVvBYQBMQVEBW8FbwVHBYQBRgVMATIFMgVMATMFOwU1BTMFSAVwBUkFTQV7AX4BewFwBXwBfQFOBU8FcQVkBHIFzARRBcsEzwRSBWoEUwXQBHMF0wTSBCsFKwUoBSoFVwVWBR0FGAVbBVoFFQV0BRYFFgV1BRQFdgV3BXgFeQV6BXsFDgULBQoFCwVgBQgFfAUDBQQFfAUCBQMF4QDgAAEFYgXfAOEAYgV9Bd8A3wC6BOAA3wB+BWMFYwVpBX8FgAVkBX8FZAWABYEFZAWBBWUFvAQ3BVMEggVoBVMETAV+Ab0EtAK9BIMFwASDBYQFhAXCBMAEhAXDBMIEZgVnBWIEUAVnBYMFfQG9BH4B5gRoBTcFkQQ3BTgF6ARqBZIEagWFBYYFhgXpBGoF6QSGBTQBbAVrBYcFbQWUBDoFbgU7BTMFNQU7BZQEiAU2BTUFNgWIBYkFNgWKBXAFcAVIBTYFiwWMBXAFfAFwBYwFjQVkBMoEjQVyBWQEcQVyBcwEjgVSBc8EVQUmBY8FIAWQBR8FWAUcBVoFdQV2BZEFdwWSBXsFeQUTBXoFEwWTBREFkwVdBREFlAUQBV0FlQULBQ4FCwWVBZYFlwVgBQsFBgWYBQQFmAV8BQQFYgW4BH0FfQV+Bd8AfgVpBWMFUwQ3BYIFTAVUBGgFfQGDBb0EhAWDBcMEwwRmBcUEwwRnBWYFZwXDBIMFfQFQBYMFOAU3BYEFgAU5BecEOQWABX8FgAXnBDgFOAWBBYAFgQU3BbwENwVoBYIFfwVpBTkFagXoBH4FagV+BYUFMwGHBWsFbQXqBGwFlARtBYkFlASJBYgFlASIBTUFmQVPBU4FygTJBI0FzARyBZoFmwVRBcwEUQWcBc4EnAXPBM4EzwScBY4F0QSdBdIE0gSdBSsFKwWdBSgFjwUiBVUFIwUiBZ4FIAUjBZAFnwUWBXQFlAVdBZMFlAWgBRAFEAWgBQ0FlQUOBV8FlgWXBQsFYAWXBaEFoQUGBWAFBgWhBaIFBgWiBZgFfAWjBQIFAgWjBaQFpAVhBQIFuARhBaUFpQV9BbgENAGGBaYFpgU1ATQBpgWnBTUBqAUzATUBqAWpBYcFqQWqBW0FbQWrBYoFigU2BYkFigWsBXAFcAWsBYsFnwV8AYwFnwVOBXwByQQZBY0FmwWtBVEFrgVRBa0FrgWcBVEFjgWvBVIFjwXQBFIF0ASPBXMFKAWdBVQFJQVzBSYFHQUfBbAFGwVXBRwFdgV1BbEFdgWSBXcFewWSBXkFsgWTBXkFeQWTBRMFoAVfBQ0FXwWzBZYFlgWzBbQFlgWVBV8FmAW1BXwFpAWlBWEFpQW2BX0FfQW2BX4FhQW3BYYFqQW4BaoFqwWsBYoFrAWrBYsFmQVcBU8FTwVcBckEmgWbBcwErwWOBZwFnQXRBFMFJgVzBY8FngUiBY8FIwWeBZAFHwWQBa8FsAVXBR0FmQV0BVwFdAWZBZ8FFgWfBbkFdQUWBbkFkgWyBXkFugVfBaAFtAW7BZYFlwW8BaEFtQWYBaIFfAW1Bb0FfAW9BaMFpAWjBb4FfgW2Bb8FvwW3BX4FhgW3BaYFpwXABagFpwWoBTUBqQWoBcEFqgWrBW0FnwWZBU4FGQXJBFwFjQUZBRgFjQUYBXIFrQWbBcIFrQXCBa4FrgXCBcMFwwWcBa4FwwWvBZwFkAVSBa8FkAWeBVIFnQVTBVQFUwUlBVQFHAWbBVoFWgWbBZoFxAWxBXUFsQXFBXYFxQWSBXYFugWzBV8FtAWzBbsFlgXGBZcFlwXGBbwFvAWiBaEFogW8BccFogXHBbUFpAXIBaUFpQXIBbYFyQW/BbYFtwWFBX4FtwWnBaYFiwW5BYwFuQWfBYwFcgUYBVoFmwVXBcIFwgWwBcMFwwWwBa8FUgWeBY8FHwWvBbAFsAXCBVcFVwWbBRwFmgVyBVoFuQXEBXUFkgXFBcoFygXLBZIFkgXLBbIFkwWyBQ4BzAXGBZYFvQW+BaMFpAXNBcgFtgXOBckFyQXPBb8FDAGnBbcFDAHABacFwAXQBagFqAXRBcEFqQXBBbgFuAWrBaoF0gW5BYsFlAWTBQ4BugWgBZQFswXTBbsFzAWWBbsFxgXUBbwFtQXVBb0FzQWkBb4FyAXOBbYFyQXWBc8FzwXWBdcF0AXRBagF2AW4BcEF2QWrBbgFqwXZBYsFxAW5BdIFsQXaBcUF2gXKBcUF2wW6BZQFugXTBbMF0wXMBbsFvgW9BdwFvgXcBc0FzwXdBbcFzwW3Bb8FtwXdBQwBDAHQBcAFiwXeBdIFxAXeBbEFsQXeBdoFygXfBcsFlAUOAdsF0wXgBcwFxgXhBdQFxwW8BeIFxwXVBbUFzQXjBc4FzQXOBcgFzgXWBckFzwXXBd0F3QUNAQwB0QXYBcEF2QXeBYsF0gXeBcQF0wW6BdsF4AXkBcwF1QXHBeUF1QXmBb0F5gXcBb0F4wXNBdwF1gXOBecF6AXdBdcFDQHbBQ4B2wUNAdMF6QXgBdMFxgXMBeQFvAXUBeEF4gXlBccF4wXnBc4F5wXXBdYF6gXoBdcF6AUNAd0FDQHoBekFDQHpBdMF6QXrBeAF5AXgBeEF5AXhBcYF4QXiBbwF5QXmBdUF7AXcBeYF3AXtBeMF5wXqBdcF6wXpBegF5QXuBeYF5gXvBewF4wXwBecF5wXwBeoF6gXxBegF6AXxBesF4AXrBeEF4gXuBeUF7gXvBeYF7QXcBewF4wXtBfIF6wXzBeEF4gXhBfMF8wX0BeIF9AXuBeIF7wX1BfIF8gXsBe8F7AXyBe0F8gXwBeMF6gXwBfMF8wXxBeoF7gX1Be8F7gX0BfUF8wX1BfQF9QXzBfAF9QXwBfIF8wXrBfEFDgGyBdAF0AWyBcsFywXfBdAF2gX2BfcF9wXKBdoFygX3Bd8F3wX4BdAF0AX4BdEF0QX3BdgF2AX2BbgFuAX2Bd4F3gXZBbgF3gX2BdoF+AXfBfcF9wXRBfgF9wX2BdgFDAEOAdAFJQVTBXMFbQVsBakFbAWHBakFMwGoBYcFigWJBW0F6ARpBX4FcAV7AUkFSQV7AUoFSgV7AU0FSgVNBUsFSQVKBWgBwARVBIMFgwVVBLQCvQS0ArECaAVUBFMEgQW8BGUFZAVRBH8FUQRjBX8FRwVvBUwBkQJDBZUEkQJCBUMFQgWRAm8FkARLBWgFtAJVBLUCqgJSBGUFUgSpAmQFqQJRBGQFUQS7BLoEcQXMBGQEyQTKBGME+QU/BTEFPwX6BT4F+wX8BZkE+wWZBO0E/QWNAe4E/QX+BY0BmgSbBCEEFAT/BRUEFQT/BSIEIgQABiMEDgQBBqAEoASiBKEEogQCBgsE8wTrA/IEowQKBLoD9ASpBAYE9QQDBqoEqgQDBgQEBAYyASYEMgE2AfADMgE3ATYBLwE3ATIBLwEFBjcBBQYGBjcBBgZEBDcB+QQ0BK8ENAT5BLAEsARKBLEEsARHBEYErwRLBLIESwSvBPYEngJLBAcGngIHBkwE+wRNBAAAAQAMBfwE/AQMBQgG/AQIBv0EAgD9BP4E/gSiAgIA/gSkAqMC/gT/BG4C/gRuAqQCtgT/BAkGtgQJBgoGtgQKBrcEtwRPBHQCCwYDBU8EBQUDBQsGCgU+AAwGCgUMBg0FDQZeBQ8FXgUNBg4GDwYQBhEGEgYRBhMGEgYTBngFkQUUBXUFFAZcBXQFWQUVBhYGGwUXBlYFGAZWBRcGGQYsBSsFGQYaBiwFLQUbBtQE1QQcBtYE1gQcBi4FLgUcBh0G1wQvBZABjgEeBh8GjgEfBiAGgwGOASAGgwEhBjEFMQUhBvkFPwX5BfoF+gX7BT4F/AXuBJkE7gT8BSIG7gQiBiMGIwb+Be4E/gX9Be4E/gUkBo0BJAaaBI0BmgQkBiUG8AQWBBgEIwQmBpwEngSdBCcGngQnBiQEJAQoBp8E8QQBBg0EAQYOBA0EoAQpBqIEpAQqBqUEpQSnBKYEAwYFBAQEAQSrBCYEKwYEBiYEJgSrBCsGBQQsBiUEBQQDBi0GqQT0BPUELgajBOsD6wPzBC4GCwQCBi8GKAYkBCcGJwadBCYGJgYjBAAG/wUABiIE7wTwBBgEMAYkBv4FMQYwBv4FJAYwBjIGJAYyBiUGJQYyBjMGMwabBCUGMwbvBJsENAbwBDUGNgYmBgAGJwY3BigGKAY4Bp8EOAbxBJ8EAgaiBCkG8wQvBjkGowQ6BgoEOgakBAoEKgY7BqUEPAb1BPQEPQYDBvUEBgYFBj4GBgY+BkQEBwY/BkwETASzBJ8CswRMBEAGQQazBEIGswRBBrQEQwZpArQEAABEBgEARQYQBkYGEwZHBkgGSQYUBhUFSgZLBkwGTQYVBksGTgYXBk0GHgVPBiEFJAVQBlEGUQZSBicFUgZTBikFKQVTBlQGVQYaBlYGHQYvBS4FLwUeBpABHgaOAZABHgb5BR8GgwEgBiEG+QUhBiAG+QUgBh8G/AX7BfoFMgYwBjEGNQbwBFcGNAZYBv8F/wU2BgAGKQagBAEGWQYCBikGWgZbBgIGAgZbBi8GLgbzBDkGOwanBKUEXAaoBKcEqARdBvQE9ARdBjwG9QQ8Bj0GLQYsBgUEBAZeBjIBMgExATABBAYrBl8GYAY9BjwGPAZdBmEGpwQ7BlwGKgakBDoGowRiBjoGYwYvBlsGKQYBBmQGAQbxBGQGZQbxBDgGNgb/BWYGNQZnBlgGNQZYBjQGNQZXBmcG7wRoBvAEaAZXBvAE/wVYBmkGKAY3BjgGZQZkBvEEWQYpBmQGAgZqBloGYwY5Bi8GowQuBmIGawZcBjsGPQYtBgMGXwYrBqsEMQEyAV4GMQEFBi8BMQE+BgUGPgZLBEQESwT2BEQESwQ+BgcGTAQ/BkAGQgZABmwGQgazBEAGQQZDBrQEbQa1BGkCtQRtBm4Gbgb6BLUETQRvBgAAbwZEBgAARAZwBgEAcQZyBg0GcwZ0BnUGRgZ2BkUGSAZ3BngGeAZ3BnkGegYUBkkGFAZ7BnwGfQYYBn4GHgV9Bk8GTwZ/BiEFIQV/BoAGUQZTBlIGHQYiBi8F+QUeBvwF+QX8BfoFMQb+BYEGMQYzBjIGMwYxBoIGMwaCBu8EVwZoBoMGgwZnBlcGZwaDBoQGaQZYBmcGJgaFBicGJwaFBjcGOAaGBmUGWwZaBmoGhwZjBlsGOQaIBi4GOgY7BioGiQZrBooGawaJBlwGXAZdBqgEPQZgBi0GiwarBCUEXwZeBgQGBwY+BowGjAY/BgcGQwaNBmkCaQKNBm0GjgZvBvoEbwZNBPoEjwZEBm8GRAaPBpAGcQYMBpEGcQaRBnIGdAZ2BnUGRwYQBpIGeQaTBngGSgaUBpUGSwaWBk0GlwZOBk0GfgaYBn0GfQaZBk8GgAZ/BpoGmwZTBlEGnAYbBp0GnAYiBhwGIgYdBhwGHgYiBvwFIgaeBiMGIwaeBoEGgQb+BSMGggZoBu8EgwafBoQGhAZpBmcG/wVpBmYGAgZZBmoGhwagBmMGYwagBjkGoAahBjkGOgaiBjsGigZrBjsGYAajBi0GpAYsBi0GpAYlBCwGJQSkBosGiwZfBqsEMQFeBqUGpgalBl4GYAanBqgGqQanBmEGqQZhBqoGiQarBqoGrAZiBq0GrgaIBqEGrwagBocGWQZkBmUGOAY3BrAGNgaFBiYGaQaxBmYGZgaxBjYGhQawBjcGsAayBjgGOAayBoYGagazBlsGtAavBocGrga1BogGrQZiBrUGtgaiBqwGtga3BqIGqAajBmAGLQajBrgGLQa4BrkGuQa6BqQGuga7BqQGuwa6BqYGuwamBl8GpgZeBl8Gpga8BqUGpQa9Bj4GQAY/Br4GbAZABr4GbAa+Br8GQgbABsEGQgbBBkEGQQaNBkMGbQaNBm4G+gRuBo4GjwZvBsIGkAZwBkQGcAbDBj4AcAY+AAEAwwYMBj4AwwaRBgwGcgaRBsQGdgbFBkUGdwZHBsYGxwZ6BkkGyAZ7BnoGlAbJBpUGSwbKBpYGlgaXBk0GfQaYBpkGmgZ/BssGIgYeBi8FzAaeBiIGgQaCBjEGggbNBmgGaAabBoMGzgafBoMGhAafBs8GhQY2BrEGhgbQBmUG0AbRBmUG0QZZBmUG0gazBmoGswaHBlsG0wavBrQGrwbTBtQG1AbVBqEGoQbVBq4G1gatBrUGtgasBq0GqwapBqoGqAbXBqMGuAajBtcG2AaoBqcGpwbZBtgGpwapBtkGqQbaBtkGqwaJBrcG1QbGBq4GhwbJBrQGhwazBskG0AaGBtsGhgayBtwGhQaxBt0GaQbPBrEGnwbOBs8GzgbeBs8GzgaDBpsGzAadBp4GngZVBt8G3wZTBoIGggZTBs0GzQabBmgGmgbPBt4GhQbdBuAGhgbcBtsG0QbSBlkG0gZqBlkGrgbWBrUG1gaSBq0Gtwa2BuEG2gapBqsG1waoBtgGuga5BrgGvAbiBqUG4ga9BqUGjAY+Br0GjAbjBj8G4wbkBj8G5Aa+Bj8GbAbABkIGjQblBm4GjgbCBm8GkAaPBuYGcAbnBsMGkQboBsQGcgbEBukG6QZzBnIGcwbZBnQG2gZ2BnQGRQaSBhAGRQatBpIGxgZ5BncGxwZ4BpMGlAZ7BskGlQbJBuoGlQbqBsoGTgaXBpgGmAayBpkGmQbgBk8GTwbgBt0GTwbdBn8GzgZQBpoGzgabBlAGzQZTBpsGUwbfBlQGngadBlUGnQbMBpwGzAYiBpwG3gbOBpoG4AaZBrAGsAaZBrIG6wbSBtEG6gazBtIGewbTBrQG7AbUBtMG7AbHBtQG1AbHBtUGtwbFBqsGxAbXBtgG7QamBroG7Qa8BqYGvAbtBuIG4gaMBr0GjAbiBu4GjAbuBuMGwQaNBkEGjQbBBuUG7waOBm4GjgbvBsIGkAbmBnAGwwbwBpEGkQbwBugG6QbZBnMGdgbaBsUGRQbFBuEG4QatBkUGkgbWBkcG1gauBkcGRwauBsYGkwZ5BtUG7AZ6BscG6waWBsoGmAaXBtsGywbPBpoGywZ/Bs8G3AayBpgG0AbbBpcGlwbRBtAG0gbrBuoGswbqBskGyAbsBtMGxwaTBtUGtgatBuEG4QbFBrcGqwbFBtoG2gZ0BtkG2AbpBsQGuAbxBroGugbxBvIGugbyBu0G5AbzBr4Gvgb0Br8GbAa/BsAG9QZuBuUG9QbvBm4G7wb1BsIG9gbmBo8G9gaPBsIG5gbnBnAG9wbDBucG6QbYBtkGxgbVBnkG7AbIBnoGyAbTBnsGtAbJBnsG6wbKBuoGlgbrBtEG0QaXBpYGmAbbBtwG1wb4BrgGuAb4BvEG8gb5Bu0G+Qb6BuIG+QbiBu0G7gbkBuMG8wb0Br4G+wbBBsAG+wb8BsEG/AblBsEG5Qb8BvUGwgb1Bv0G9gbCBv4G5gb3BucG8Ab4BugG6Ab4BsQG+AbXBsQG8Qb/BvIG8gb/BvkG+gbuBuIG7gYAB+QG5AYAB/MGvwYBB8AGwAYCB/sG/AYDB/UG9QYDB/0G/gbCBv0G5gb2BgQH+gYFB+4G7gYFBwYH8wYBB/QGAQe/BvQGAQcCB8AG+wYDB/wGBAf3BuYGwwb4BvAGBgcAB+4G8wYHBwEHCAf7BgIHCQcDB/sGCgf+Bv0G/gYLB/YGBAcMB/cGwwb3BvgG8Qb4BvcG+QYNBw4HDgf6BvkG+gYOBw8HBwfzBgAHAQcIBwIHAwcQBwsHCwf9BgMHCwcKB/0GCgcLB/4GCwcEB/YGDAf/BvcG8Qb3Bv8GDQf5Bv8GDwcFB/oGBQcPBxEHEQcGBwUHEQcABwYHEgcHBwAHDgcTBxQHDQcMBwQHDQf/BgwHDgcNBxMHEQcSBwAHDQcEBxMHDgcUBw8HBwcIBwEHCAcJB/sGCQcVBxAHEAcDBwkHCwcTBwQHCwcUBxMHBwcSBwgHFgcSBxcHFwcPBxYHEQcPBxcHFwcSBxEHFQcWBw8HFgcJBwgHFQcUBxAHFAcVBw8HCQcWBxUHCAcSBxYHFAcLBxAH3QaxBn8GsQbPBn8GgQaeBt8GgQbfBoIGzwZpBoQG4AawBoUGLgaIBmIGigY7BqIGiQZdBlwGYAY8BmEGLQa5BqQGPgYxAaUGuwZfBosGuwaLBqQGXQaqBmEGiQaiBrcGiQaKBqIGogY6BqwGOgZiBqwGtQZiBogGrwbUBqEGrwahBqAGoQaIBjkGiQaqBl0GpwZgBmEGVQZWBt8GVAbfBlYGmwZRBlAGfgZOBpgGSwaVBsoGlQZLBkoGSgZ8BpQGlAZ8BnsGFAZ6BnsGSQYVBRQFSQZ4BscGdwZIBkcGdgZGBnUGcwYNBnIGHAYbBpwGGwZVBp0GKQVUBlYGFwZOBn4GFgZNBhcGFQZNBhYGEAYPBkYGRgYSBXUGEgVzBnUGDQYPBXEGDwUMBnEGPwAMBQEACQb9BAgGCQb/BP0E/wT+BP0ECgYJBhgHCAYMBRgHPwAKBQwFPwA+AAoFEgUOBnMGEAYTBhEGEwZIBngGFAZ8BhcFfAZKBhcFSwYVBkwGfgYYBhcGfQYeBRgGVgYZBikFVgYaBhkGGgZVBi0FLQVVBhsGGwbVBNQEGwYcBtUEGgYtBSwFJwUmBVEGJAVRBiYFJAWaBlAGmgYgBYAGIAUhBYAGFwYbBRYGFQZZBUwGSgZMBhcFFAZ0BRUFkQVJBhQFkQV4BkkGeAaRBXgFeAUTBngGEwYQBkcGcwYOBg0GDQUMBg8FGAcJBQoGCQULBgoGCgYLBk8ECgZPBLcEDAUJBRgHCAYYBwkGmwSaBCUG8AQ0BhQENAb/BRQEJgadBJwECwQvBvMEGQYqBSkFKQUoBVIGIAWaBiQFHgUdBRgGGgUWBhsFFgZYBVkFWwUXBUwGdgV4BZEFDwYRBnsFegVGBg8GEwUSBUYGEgVeBQ4GCAULBgkFCAUFBQsGCQULBQgFDwVeBRAFXgURBV0FXgUSBREFRgZ6BRMFDwZ7BXoFewURBncFEQYSBncFdwUSBngFFAYXBVwFWwUYBRcFTAZZBVsFFgYaBVgFVgUYBh0FIQUfBR4FIAUkBSMFVQUkBSYFJwVSBlQFVAVSBigFKgUZBisFBQUEBQMFUARPBAMF+wXtBOwE7AQ+BfsFPAU+BewEPAU9BUAFlwSEAusEOwV/ApQEewJrBeoEawWrAukEawV7AqsCawTVBGwEsgRmAkoEsgRKBPkE4gTgBOEE4gTjBEYF4gRGBXMB4ARyAXUB4AR1AdsEqAKpApUCqAKXAlEEuwRRBKcCrgQnBDYBQQStBPoDrQRBBEAEQAT5A60E+QM/BFMBUwEoBPkDKwQsBPgD9wMsBBkHGQdsAfcDaQEaB40CLQRpAY0CLQSNAi4EGwcvBC4EGwd/AS8EGwdvAXEBGwcuBI0CGweNAm8BGwfQA38BfwHQA84D0AMbB3EBgQEvBH8BGgeHAo0ChwJ5AY0CGgdpAWsBGgdrARwHhgKIAhwHjgKDAoICkAIdB48CjwIdBx4HHweTApICkwIfB4ACfAKAApQCgAIgB5QClAIgB5YClgIhB5gCXAJdAhcCHAFdAicCJwIiB14CJAImAiMHJAIkB5kCmQJgAigCRwIpAmACRwIlB0gCSAImB5oCJgcnB5oCJwcoB5sCKQeqAygHqgMpByoHKwcsBy0HLgcvBzAHsAMvBzcENwQvBzEHMQc4BDcEOAQxBzIHMgczBzgEMwc5BAIEvgM0B5QBOgQ1B8MDNQc2B8MDNwczBzgHOQc4BysEKgQ7BDkHOwQpBDoHOgcpBFUBOwdVAVQBPwT5AzEEQQSsBEIEMgRCBCcEMgQnBK4EMgSuBEMEQwSuBDgBQgSsBCcErARBBPoDQAQxBPkDKgQpBDsEOQcrBCoEMQcsBCsEHAdrAYYCjgI8B4MCPAcpB4MCgwIpB5ACkgKPAh4HgAIfByAHIQeWAiAHXAKYAl0CIwckByQCRwJgAiUHYAKZAj0HJAc9B5kCPgcjByYCJgJfAj4HIgdfAl4CJwJdAiEHJwIhByIHIQc+ByIHPgcgByMHIgc+B18CYAI9Bz8HQAclB2ACQQcmByUHJgdBBycHJwdBBygHLQcsB0IHLQdCB0MHLgdDB0QHRAcvBy4HRQc5BEYHlAFHB7QDSAe+A5QBNgdGBzcHRgczBzcHMgcxBzMHRgc5BDMHRQdJB+0D7QNJB+4D7gM1BzoElAG0A5UBRQdGB0kHMQcvBywELwcZBywESgeOAoYCPAeOAkoHkgIjBx8HIQddApgCIQcgBz4HIweSAksHSwckByMHPAdKB0wHhgIsB0oHQgdsAUQHQgdrAWwBLwdsARkHNQdJBzYHMwcxBzgHOAcxBysElgGVAToENQfuA0kHSQdGBzYHlgFIB5QBlAE0B0cHRwc0B00HRAdsAS8HawFCBywHLAeGAmsBkAIpBygHTgdPBx0HTgc/B08HTgcdBygHKQc8B0wHQgdEB0MHLAcqB0oHKgdMB0oHTAcqBykHKAdBB04HQAdgAj8HPwdBB0AHQQc/B04HQAdBByUHKAcdB5ACHQdPBx4HSwc9ByQHSwdPBz0HPQdPBz8HTwdLBx4HHgdLB5ICIwcgBx8HLwewAzAHJgdIAiUHQgSbA0EEVAFuATsHVQE7B1AHOgdVAVEHOgdSBzsENwfFAzYHlgE6BMMDNAdTB00HRwdNB7YDrQNDBy4HLQdDB60DLQetAysHqgMqB6sDJwebApoCmgJJAkgCmgKbAmECqgOoAyoBKgcsB1QHVAcsBysHKwetA1QHsAOvAzAHsAM3BLEDRQcEBDkEBARFB+0DtQO0A0cHRwe2A7UDtgNNB7cDtwO5A7gDuQO3A1UHwQNIB8IDlgHDA8IDwwM2B8UDxQM4B8YDOwTGAzkHPAQ7BFIHOwdWB1AHOwduAVYHbQF2AW4BUQdQB1cHUQdXB1IHPARSB1gHPARYB8kDyQNYBz0EgQF2AS8EdwFWB24BVwdWB1kHVwdQB1YHWAdXBz0EVwdZBz0EWQc+BD0EPgRZB1YHdwE+BFYHdwF2AYEBWAdSB1cHdgFtAS8EdwGBAT4ExgM4BzkHSAfBA9oD2gO+A0gHVQdTB1oHUQdVAVAHUQdSBzoHNwc4B8UDSAeWAcIDUwc0B74DtwNNB1UHTQdTB1UHBwQ6BJUBAgQ4BDMHrwMuBzAHrwOuAy4HrgOtAy4HqwMqB1QHKgEoB6oDKAcsAZsCKAcqASwBKgGnA6kDqQMrASoBKwGpAzYEogMzBEUElAR/An4CfQJ8AnsCgARbBH8EWQSABIEEWQSBBFYESARLApsCgQGAAc0DzQPKAz0EPATJA9gDxwPGAzsEvAO5A1UHvANVB1oHWgdTB70DvgO9A1MHwwPAA8IDxAPDA8UDPATIA8cDPATYA8gDPQTKA8kDpgM2BKkDNgSmA6UDpQOjAzUEowOlA6QDogOhAzMEnwOeA5wDnwOcAzIEmgNBBJsDmgP0A0EEWwFaATEE9wPzAywEigGHAYYBFwTmA4cBFwTkA+YDigGLAYcBiwGKAYgBFgTgA5IB4AOTAZIB2APgA98D3wPeA8gD3wMVBN4D3gPcA8AD3QPbA8ED2wMQBL8DtgO4AwkEtgOmBLUDswO1AwgEBwSVAbMD7gMHBOwDOAQCBO8D7wOxAzgE8ANUB60DVAfwA6sDqwPwA6gDqAP9A/wDqAP8A6YDpgP7A6QDogPxA/IDnwOhAygEnAPzA5oDngOfAygEKAShA/ID8QOkA/oD+wOmA/wD/QOoA/AD/gOsA/8D/wOvAyYErwOyAyYEugMKBLgD6gPyBOsDCwTyBOoDDATqA6IE6gOhBKIE6gO8A6EEDgShBLwDEATbAxEE3QPcAxMEFgTfA+AD3QMRBNsD6QO9A+cDDgS8A+gDCQSmBLYDtQOmBAgEBwSqBOwDOQQDBAIErwP/A6wDrAP+A/AD1AOMAlsH1QPUA88D1QPPA9EDzAPXA80DywPXA9kD2APZA+EDwAPdA8ED2gO/A74DvQPoA1oH6AO8A1oHugO7A+oD6gO7A7wD2APhA+AD2QPXA+ED1wNcB+EDXAfXA8wDXQfMA9YD1gPPA9QD1gPUA14HWweMAoUBXwdcB8wDXwfMA10HXAdfB2AH4QNcB+IDkwHhA+ID4gNgB5EBkQFgB+MD4wNeB+UDhQFeB1sHXgfUA1sHXgdfB10HXgddB9YDYAdfB+MDXwdeB+MD4gNcB2AHXgeFAeUDLQRqAWkBVgFYAUUBmQNWAUUBagEtBJkDjgONA2oBlQOFA5QDlAOXA5UDlgOUA5EDlgORA0MBQgFDAZEDkQOTA0IBlQOGA4UDggOEA4wDiwOIA4cDiANKAYkDYQePA4kDjwNhB44DhgNKAUkBSgGIA34DSgGGA2IHSgFiB2EHYQeJA0oBYQeGA44DYgeGA2EHiAOLA34DiwOEA34DkgODA30DkgNjB5MDkwNjB0ABQAFCAZMDaANAAWQHaANkB20DZQdkB0ABZAdmB3wDZAd8A20DfANmB3kDeQNnB30DYwd9A2cHYweSA30DYwdoB0ABaAdlB0ABZAdlB2kHZAdpB2YHZgdpB2oHZgdqB3kDZwdqB2MHagdpB2MHaQdoB2MHaAdpB2UHagdnB3kDkAN4A38DfQNLAX4DfgOEA3YDggN/A3oDTANdA2UDawdPA04DJQNPAyYDbAdtByYDbQcnA6UBRwNIAwUDBgM6A0kDPgNJA1IDQQNAA24HbgAuA28HbgBvB3AHbgBwB28AcAdVA28AVQNtAG8AVQNWAwsDTgNfA2sHbAcmA08DbQdsBycDBQNIAyoDUQMrA0gDUwNuB0ADLgNBA28HcAdxB1UDcgdzB0IDcwdXA0IDVwNyB3QHVwN0B14DTwN1B2wHbAd1B3YHJwNsB3YHdgc5AycDOQN2B1ADSAN3B3gHeAdRA0gDeAdJA1EDSQM6A1EDSQN4B1IDPwNSA1MDQQNuB3kHQQN5B28HVgNKAy8DSgNyB0IDcgdXA3MHegdPA2sHUAN3B0cDbwd7B3AHewdvB3kHcAd7B3EHcQd8B1UDVQN8B1YDfQd0B3IHfQdrB3QHegdrB34Hdgd3B1ADdwdIA0cDfwdSA3gHfwd4B3cHUgN/B1MDbgeAB3kHeQeAB3sHcQd7B4EHfAeCB4MHfAeDB1YDgweEB1YDhAdKA1YDhAdyB0oDhAd9B3IHfQd+B2sHegd1B08DdQeFB3YHdgeGB3cHbgdTA4cHiAd7B4AHeweIB4EHgQeCB3EHggd8B3EHggeBB4kHggeJB4MHfgd9B4QHfgeJB3oHigd1B3oHiwd/B3cHhweAB24HhweIB4AHhgeMB4gHjAeKB4gHiAeKB4EHiQd+B4MHiQeKB3oHigeFB3UHhQeGB3YHiwd3B4YHfweHB1MDhwd/B4sHhweGB4gHigeJB4EHigeMB4YHigeGB4UHiweGB4cHfgeEB4MHawdfA14DawdeA3QHpwGoAScDqAGaACcDJgNtB6UBJQOkATgDKAGgASkBHgEXASABFwEWARoB9AASAe8AGgMYAxcDFQPqAMQAFQPEAMMADwMQA8EA7ADrAMcAdwBbAFUAVQBbAEEAVQBUAHcAVQBBAFYAUwBWAHQAdABWAGYAcABzAHYAcwAEA6EAoQAEAwIDoQACAwMDAwO9AKEAAQONBwMDjQcBA74AjQe+APoC7gD6AroAugC8ALsAvgC6APoCvgABA78A7gDnAOoC7gDqAvoC+QKNB/oCjQe9AAMDvQCNB7wAvQCfAKEAnwC9ALkAvAD4ArsAvACNB/kCvAD5AvgCBANzAHIAVABwAHcAZgBEAFEAAgNyAH0AcgBxAH0AoACdAKEA4wAIAewC7ALqAuMA6gLrAugCCAEKAewC5wLpAPgCIwHxAiQB2QLgAiQB4AI9Ad8C8QLZAiQBEwHtAhQBCQEKAQUBJQEUAe0CBwHrAu4C6wIHAeUC7gIDAQcBAwEKAd4C3gIUAScBCwHsAgoB5wLoAOkA5ADlAvIAOgE/AT4BXAJbApgClAJ6AnwCHAeIAhoHiAKHAhoH+AH2AfUBfgDHAcgBxwHAAWsCQgJEAtgARAL6AP0ARAL9AEMC2ABEAkMCzQDYANUAzwDOADMCzwAzAqkAwgG/AcEB5gAeAvcAAAEeAgEB+QDxAPYA9QD3AAAB9QAAAfkA9wD1APkA8ADaANQA9gDxAPAA8QAeAo4HHgLlAI4H5QDUANkA5QDRANQA2QDbAI4H2wDxAI4H2wDaAPEA1ADaANkA5QAeAuYA5QDZAI4HHgLxAAEBHQEZAhsBDwIUAhACEgIYAhECEgIVAhgCGAIVAhMCEgICARACFAITAhUCGwEYAhMChwBMANoBhwDvAesBjQDvAQsCjQALAo4AjgCPAJwAsgCVAI8AjwCtALIArQCsALIArQCPAI4ACwKtAI4ACwIJAggCCwLvAQkC7wGGAAkC7wGHAIYAhwDaAeEBhwDhAYgA9AGIAOAB7gHsAfMB9AHgAe4B7gHzAfQBCwIMAq0ArQAMArUAtQCuAK0ArAC1AI8HrACPB7AAsACPB5AHsACQB7YAsAC2AK8AkAe3ALYAtwCRB5IHkgeRB9EA0QCTB9IAkwePB9IA0gCPB7UAjweTB5AHkAeTB5EHkQe3AJAHkwfRAJEHkgfRAMAAtwCSB8AAtQAMAtIA3wHtAdwAYABiAGMA0AHOAX8A4QHNAc4B2AFMAE4ADgDXAdQB1wHVAdQB1QHXAdYB1gEkANUB1gFNACQA1gHXAU4ADgDSARIACAADAA0AuQEaAAcAuQEKABsAuAFIABsAuAEbAAoACgDTAbgBHAAvANMBVwAwABwAwAG/AVICuwG6ASsAMwA4ADUAOAAgAB8AagB5AHwAagA4AHkAfAC3AWoAtwF8AJoAtwGaAEAAtwFAADYAQAA3ADYAawB6AKMAegBrAGoAagCSAIQAagCEAHsAbACSAGoAlAeTAKIAkwCjAKIAawCjAJMAkwBsAGsAogCSAJQHkwCUB5IAGAADAKsBpwEyADEApwEJADIApwGpAQkAmgCoAVkAnQEYARkBmgGXARkBjwRlAVIBjwRSAV8BZwFdAWIB4wDoAOQA6ADjAOcAugC5AL8AvwC5AL4AtgC0AK8AeABkAGUAjACUAI8AmACWAIkAlwCJAJYAYgBkAGMAaQBoAJAAKAAiABcALAAcABsADwAtABQADwAUABEAKAALACIADQAGAAgA';
  const dec=function(s,T){const a=atob(s),u=new Uint8Array(a.length);for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return new T(u.buffer);};
  const q=dec(P64,Int16Array),ix=dec(I64,Uint16Array),K=2.1/32000,pos=new Float32Array(q.length);for(let i=0;i<q.length;i++)pos[i]=q[i]*K;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(q.length/3*2).fill(.5),2));g.setIndex(new THREE.BufferAttribute(ix,1));g.computeVertexNormals();g.computeBoundingSphere();
  const vide=new THREE.BufferGeometry();vide.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3));vide.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(6).fill(.5),2)); // plus de « creux » à poser : les orbites sont de vraies cavités
  return {or:g,noir:vide};}
function richCoeurCubes(){ // (2026-10-16) LE CŒUR EN MINUSCULES CUBES : la surface de Taubin, (x² + 9/4·y² + z² − 1)³ − x²z³ − 9/80·y²z³ = 0
  // (z en haut, y l'épaisseur ×.82 : un cœur de bonbon, pas une balle), lue sous sa forme « racine cubique » — même surface :
  // H = (x² + 9/4·y² + z² − 1) − z·∛(x² + 9/80·y²), dont le gradient ne s'annule que sur l'axe (écrite telle quelle, il s'annule sur tout
  // l'équateur : une ligne en travers du cœur). Le cœur est REMPLI À LA GRILLE (13 cubes sur sa largeur) — (2026-10-16, Léo : « le cœur rempli de
  // cubes ») TOUS les cubes du dedans sont gardés, ceux de la PEAU marqués (aK.w = 1 : un voisin est dehors) ; chaque cube fait 72 % de sa case (des joints où passe le ciel). Rangés du DOS vers l'AVANT : le cœur se
  // tourne toujours vers toi (richTick), le fond se peint donc avant le devant — le transparent sans tri. aN = la normale LISSE du cœur à la
  // place du cube (le gradient), aR = (la hauteur 0 → 1, un hasard) : ce que lit RICH_FS_COEUR. 1 de large, centré.
  const E=.82,H=function(x,y,z){return x*x+2.25*y*y+z*z-1-z*Math.cbrt(x*x+.1125*y*y);};
  const ray=function(X,Y,Z){let hi=.04;while(hi<3&&H(X*hi,Y*hi,Z*hi)<0)hi+=.04;let lo=hi-.04;for(let k=0;k<24;k++){const m=(lo+hi)*.5;if(H(X*m,Y*m,Z*m)<0)lo=m;else hi=m;}return (lo+hi)*.5;};
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;                                                  // son gabarit : la forme est étoilée depuis le centre, on la tire en rayons
  for(let a=0;a<72;a++)for(let b=0;b<=36;b++){const th=b/36*Math.PI,ph=a/72*6.2832,X=Math.sin(th)*Math.cos(ph),Z=Math.cos(th),Y=Math.sin(th)*Math.sin(ph),r=ray(X,Y,Z),x=X*r,z=Z*r;
    if(x<x0)x0=x;if(x>x1)x1=x;if(z<y0)y0=z;if(z>y1)y1=z;}
  const k=1/(x1-x0),cy=(y0+y1)*.5,hh=(y1-y0)*k*.5,zz=E*k*.7,st=1/13,hc=st*.36;
  const dans=function(x,y,z){return H(x/k,z/(E*k),y/k+cy)<0;};                       // (x largeur, y hauteur, z épaisseur) du cœur
  const L=[],nx=Math.ceil(.5/st)+1,ny=Math.ceil(hh/st)+1,nz=Math.ceil(zz/st)+1;
  for(let iz=-nz;iz<nz;iz++)for(let iy=-ny;iy<ny;iy++)for(let ix=-nx;ix<nx;ix++){const x=(ix+.5)*st,y=(iy+.5)*st,z=(iz+.5)*st;if(!dans(x,y,z))continue;
    let peau=false;for(let a=-1;a<=1&&!peau;a++)for(let b=-1;b<=1&&!peau;b++)for(let c=-1;c<=1&&!peau;c++)if((a||b||c)&&!dans(x+a*st,y+b*st,z+c*st))peau=true;
    L.push([x,y,z,peau?1:0]);}
  L.sort(function(p,q){return p[2]-q[2];});                                           // du dos vers l'avant
  const FA=[[1,0,0,0,1,0,0,0,1],[-1,0,0,0,0,1,0,1,0],[0,1,0,0,0,1,1,0,0],[0,-1,0,1,0,0,0,0,1],[0,0,1,1,0,0,0,1,0],[0,0,-1,0,1,0,1,0,0]]; // n, u, v (u × v = n : les faces regardent dehors)
  const n=L.length,pos=new Float32Array(n*72),nor=new Float32Array(n*72),an=new Float32Array(n*72),ar=new Float32Array(n*48),ak=new Float32Array(n*96),idx=new Uint16Array(n*36),SG=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let i=0;i<n;i++){const P=L[i],X=P[0]/k,Y=P[2]/(E*k),Z=P[1]/k+cy,q=X*X+.1125*Y*Y;let gx=P[0],gy=P[1],gz=P[2];
    if(q>1e-9){const k3=Z/(3*Math.pow(q,2/3));gx=2*X-k3*2*X;gz=(4.5*Y-k3*.225*Y)/E;gy=2*Z-Math.cbrt(q);} // la normale lisse (sur l'axe : la direction depuis le centre)
    const gl=Math.hypot(gx,gy,gz)||1,hs=(P[1]+hh)/(2*hh),rs=(function(){const h=Math.sin(P[0]*127.1+P[1]*311.7+P[2]*74.7)*43758.5453;return h-Math.floor(h);})();
    for(let f=0;f<6;f++){const F9=FA[f];for(let j=0;j<4;j++){const o=((i*6+f)*4+j),su=SG[j][0],sv=SG[j][1];
        for(let d=0;d<3;d++){pos[o*3+d]=P[d]+hc*(F9[d]+su*F9[3+d]+sv*F9[6+d]);nor[o*3+d]=F9[d];}
        an[o*3]=gx/gl;an[o*3+1]=gy/gl;an[o*3+2]=gz/gl;ar[o*2]=hs;ar[o*2+1]=rs;ak[o*4]=P[0];ak[o*4+1]=P[1];ak[o*4+2]=P[2];ak[o*4+3]=P[3];}
      const b9=(i*6+f)*4,t9=(i*6+f)*6;idx[t9]=b9;idx[t9+1]=b9+1;idx[t9+2]=b9+2;idx[t9+3]=b9;idx[t9+4]=b9+2;idx[t9+5]=b9+3;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('aN',new THREE.BufferAttribute(an,3));g.setAttribute('aR',new THREE.BufferAttribute(ar,2));g.setAttribute('aK',new THREE.BufferAttribute(ak,4));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();g.userData.cubes=n;return g;}
/* (2026-10-16, Léo : « et des petites fleurs — hibiscus tropical, rose, lilas, lotus, LYS, tulipes rose pâle » ; le style choisi : « pétales
   lisses, translucides ») LES SIX FLEURS. Un pétale = une GRILLE (u : du pied à la pointe, v : d'un bord à l'autre) le long d'une NERVURE
   qui se courbe (a0 : l'élévation au pied, cu : de combien elle tourne jusqu'à la pointe — négatif : le pétale se recourbe, comme le lys) ;
   sa largeur suit une FORME (f, u → 0..1 : rond, en éventail, pointu), ses bords se relèvent (cup : le creux) et peuvent friser (ruf) ;
   couleur du pied (c0) à la pointe (c1) entre k0 et k1, le bord vers c2, l'opacité al. Les cœurs de fleur (étamines, pistil, gousse du
   lotus) sont des primitives teintées (richFlPrim). Tout est fusionné en UNE géométrie par fleur (aC = rgba par sommet), 1 de grand,
   centrée, l'axe de la fleur en +y : richTick la penche vers toi de userData.vue (une corolle se lit de face, une tulipe de profil). */
function richFlPart(P,pos,idx,col){P.push({p:pos,i:idx,c:col});}
function richPetale(P,o){
  const nu=o.nu||8,nv=o.nv||6,cph=Math.cos(o.phi||0),sph=Math.sin(o.phi||0),pos=[],col=[],idx=[],c0=o.c0,c1=o.c1||o.c0,c2=o.c2,ds=o.L/nu,v3=new THREE.Vector3();
  let sx=o.r0||0,sy=o.y0||0;
  for(let i=0;i<=nu;i++){const u=i/nu;if(i>0){const tm=o.a0+o.cu*(u-.5/nu);sx+=Math.cos(tm)*ds;sy+=Math.sin(tm)*ds;}
    const th=o.a0+o.cu*u,nX=-Math.sin(th),nY=Math.cos(th),w=o.W*o.f(u),kk=Math.min(1,Math.max(0,(u-(o.k0||0))/((o.k1||1)-(o.k0||0))));
    for(let j=0;j<=nv;j++){const v=-1+2*j/nv,h=(o.cup||0)*w*v*v+(o.ruf||0)*o.W*Math.sin(v*6.5+u*4+(o.rp||0))*u*u,lx=sx+nX*h,ly=sy+nY*h,lz=v*w;
      v3.set(lx*cph-lz*sph,ly,lx*sph+lz*cph);if(o.m)v3.applyMatrix4(o.m);pos.push(v3.x,v3.y,v3.z);
      const e=c2?Math.pow(Math.abs(v),3)*(o.ke!=null?o.ke:.35):0;for(let d=0;d<3;d++){const c=c0[d]+(c1[d]-c0[d])*kk*kk*(3-2*kk);col.push(c2?c+(c2[d]-c)*e:c);}col.push(o.al!=null?o.al:.8);}}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,a+1,b,b+1);}
  richFlPart(P,pos,idx,col);}
function richFlPrim(P,g,M,c,al){ // une primitive de three (sphère, cylindre, boîte), placée par la matrice M, d'une couleur
  g.applyMatrix4(M);const p=g.attributes.position,pos=Array.from(p.array),idx=g.index?Array.from(g.index.array):pos.map(function(_,i){return i;}).slice(0,p.count),col=[];
  for(let i=0;i<p.count;i++)col.push(c[0],c[1],c[2],al==null?1:al);g.dispose();richFlPart(P,pos,idx,col);}
function richFlM(x,y,z,dx,dy,dz,sx,sy,sz){ // matrice : posée en (x,y,z), son axe +y tourné vers (dx,dy,dz), mise à l'échelle
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,dy,dz).normalize());
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx||1,sy||1,sz||1));}
function richFlFin(P){ // fusion, centrage, 1 de grand
  let n=0,m=0;for(const q of P){n+=q.p.length/3;m+=q.i.length;}
  const pos=new Float32Array(n*3),col=new Float32Array(n*4),idx=n>65535?new Uint32Array(m):new Uint16Array(m);let o=0,oi=0;
  for(const q of P){const b=o/3;pos.set(q.p,o);col.set(q.c,b*4);for(let k=0;k<q.i.length;k++)idx[oi+k]=q.i[k]+b;o+=q.p.length;oi+=q.i.length;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aC',new THREE.BufferAttribute(col,4));g.setIndex(new THREE.BufferAttribute(idx,1));
  g.computeBoundingBox();const B=g.boundingBox,c=B.getCenter(new THREE.Vector3()),sz=B.getSize(new THREE.Vector3()),k=1/Math.max(sz.x,sz.y,sz.z);
  g.translate(-c.x,-c.y,-c.z);g.scale(k,k,k);g.computeVertexNormals();g.computeBoundingSphere();return g;}
const RICH_FF={ // les formes de pétale
  rond:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.15)),.45);},
  eventail:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.7)),.55);},
  pointu:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.75);},
  lance:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,.75)),.8);},
  oeuf:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.25)),.5);}};
function richFleurs(){const F=RICH_FF,V=[],S=function(r){return new THREE.SphereGeometry(r,8,6);},C=function(r0,r1,h){return new THREE.CylinderGeometry(r1,r0,h,7,1);},TAU=6.2832;
  // 1. L'HIBISCUS TROPICAL : cinq larges pétales corail en éventail, l'œil cramoisi au pied, le bord qui frise ; la longue colonne d'étamines, pollen d'or, stigmates rouges
  {const P=[];for(let i=0;i<5;i++)richPetale(P,{phi:i*TAU/5+.2,a0:.38,cu:-.3,L:.5,W:.215,f:F.eventail,cup:.22,ruf:.05,rp:i*1.7,r0:.03,c0:[.42,0,.1],c1:[1,.36,.36],c2:[1,.7,.62],k0:.04,k1:.46,ke:.5,al:.84,nu:9,nv:8});
   const d=[.38,1,.1],L9=.5;richFlPrim(P,C(.026,.018,L9),richFlM(d[0]*L9*.5/1.08,L9*.5,d[2]*L9*.5/1.08,d[0],d[1],d[2]),[1,.45,.55],1);
   const tx=.38*L9/1.08,ty=L9*.96,tz=.1*L9/1.08;for(let k=0;k<7;k++){const a=k*TAU/7;richFlPrim(P,S(.024),richFlM(tx+Math.cos(a)*.04,ty-.04+(k%2)*.025,tz+Math.sin(a)*.04,0,1,0),[1,.84,.18],1);}
   for(let k=0;k<5;k++){const a=k*TAU/5;richFlPrim(P,S(.02),richFlM(tx+.025+Math.cos(a)*.022,ty+.045,tz+Math.sin(a)*.022,0,1,0),[.85,.02,.12],1);}
   V.push(richFlFin(P));V[0].userData.vue=1.15;}
  // 2. LA ROSE : quatre couronnes de pétales ronds qui s'ouvrent de plus en plus (le cœur serré, le bord qui se roule), velours rouge ; cinq sépales verts dessous
  {const P=[],R=[[3,1.45,.25,.15,.13,.9,0,.02],[5,1.22,-.1,.21,.16,.8,.02,.015],[5,.98,-.35,.26,.19,.65,.035,.01],[6,.68,-.6,.3,.21,.5,.05,0]];
   R.forEach(function(r,ri){for(let i=0;i<r[0];i++)richPetale(P,{phi:i*TAU/r[0]+ri*.9,a0:r[1],cu:r[2],L:r[3],W:r[4],f:F.rond,cup:r[5],r0:r[6],y0:r[7],c0:[.36,0,.05],c1:[.86,.03,.13],c2:[.98,.3,.38],k0:0,k1:1,ke:.45,al:.9});});
   for(let i=0;i<5;i++)richPetale(P,{phi:i*TAU/5+.3,a0:-.85,cu:.3,L:.17,W:.045,f:F.pointu,cup:.2,r0:.03,c0:[.12,.38,.12],c1:[.25,.58,.2],al:1,nu:5,nv:2});
   V.push(richFlFin(P));V[1].userData.vue=0.9;}
  // 3. LE LILAS : une grappe en cône de petites fleurs à quatre pétales (lilas, du mauve profond au presque blanc), sur sa tige
  {const P=[];const N=62;for(let i=0;i<N;i++){const t=(i+.5)/N,y=t*.62,R9=.23*(1-t*.82)+.04,a=i*2.39996,cx=Math.cos(a)*R9,cz=Math.sin(a)*R9,h=Math.sin(i*12.9898)*43758.5453,rr=h-Math.floor(h);
     const M=richFlM(cx,y,cz,cx,.55,cz),c0=rr<.2?[.86,.74,1]:rr<.6?[.62,.4,.9]:[.72,.52,.96],c1=[Math.min(1,c0[0]+.18),Math.min(1,c0[1]+.2),1];
     for(let j=0;j<4;j++)richPetale(P,{phi:j*TAU/4+a,a0:.28,cu:-.35,L:.058,W:.042,f:F.rond,cup:.3,c0:c0,c1:c1,al:.86,nu:3,nv:2,m:M});}
   richFlPrim(P,C(.012,.008,.8),richFlM(0,.24,0,0,1,0),[.3,.55,.25],1);
   for(let k=0;k<4;k++){const a=k*TAU/4+.4;richFlPrim(P,S(.018),richFlM(Math.cos(a)*.025,.66+(k%2)*.03,Math.sin(a)*.025,0,1,0),[.78,.62,.98],1);} // les boutons du sommet
   V.push(richFlFin(P));V[2].userData.vue=0.35;}
  // 4. LE LOTUS : trois couronnes de pétales pointus en coupe, blancs au pied, roses à la pointe ; la gousse jaune et sa couronne d'étamines
  {const P=[],R=[[7,.35,.25,.36,.15,.45,.05],[8,.8,.3,.34,.14,.5,.04],[8,1.18,.2,.28,.12,.6,.03]];
   R.forEach(function(r,ri){for(let i=0;i<r[0];i++)richPetale(P,{phi:i*TAU/r[0]+ri*.4,a0:r[1],cu:r[2],L:r[3],W:r[4],f:F.pointu,cup:r[5],r0:r[6],c0:[1,.96,.97],c1:[1,.4,.66],c2:[1,.78,.9],k0:.3,k1:1,al:.78});});
   richFlPrim(P,C(.07,.078,.06),richFlM(0,.05,0,0,1,0),[.86,.84,.32],1);
   for(let k=0;k<7;k++){const a=k*TAU/7;richFlPrim(P,S(.011),richFlM(Math.cos(a)*.04,.082,Math.sin(a)*.04,0,1,0),[.95,.72,.18],1);}
   for(let k=0;k<18;k++){const a=k*TAU/18;richFlPrim(P,new THREE.BoxGeometry(.008,.07,.008),richFlM(Math.cos(a)*.09,.06,Math.sin(a)*.09,Math.cos(a)*.6,1,Math.sin(a)*.6),[1,.86,.3],1);}
   V.push(richFlFin(P));V[3].userData.vue=0.8;}
  // 5. LE LYS : six longs tépales blancs qui se recourbent en arrière, une rougeur rose au fond de la gorge ; six étamines aux anthères orange, le pistil
  {const P=[];for(let i=0;i<6;i++)richPetale(P,{phi:i*TAU/6,a0:.92,cu:-1.7,L:.46,W:i%2?.12:.145,f:F.lance,cup:.28,r0:.02,c0:[1,.42,.68],c1:[1,1,1],c2:[1,.97,.98],k0:0,k1:.52,al:.9,nu:10,nv:6});
   for(let k=0;k<6;k++){const a=k*TAU/6+.5,dx=Math.cos(a)*.38,dz=Math.sin(a)*.38,L9=.3;richFlPrim(P,C(.006,.005,L9),richFlM(dx*L9*.5,L9*.46,dz*L9*.5,dx,.92,dz),[.78,.9,.62],1);
     richFlPrim(P,new THREE.BoxGeometry(.065,.022,.026),richFlM(dx*L9,L9*.93,dz*L9,dz,0,-dx),[.86,.38,.1],1);}
   richFlPrim(P,C(.009,.007,.34),richFlM(0,.17,0,0,1,0),[.7,.86,.55],1);richFlPrim(P,S(.02),richFlM(0,.345,0,0,1,0),[.6,.8,.4],1);
   V.push(richFlFin(P));V[4].userData.vue=0.95;}
  // 6. LA TULIPE ROSE PÂLE : six pétales en coupe fermée (trois dehors, trois dedans), les bords plus blancs ; sa tige et une feuille
  {const P=[];for(let i=0;i<3;i++)richPetale(P,{phi:i*TAU/3,a0:1.45,cu:.5,L:.42,W:.22,f:F.oeuf,cup:.62,r0:.06,c0:[.98,.76,.82],c1:[1,.86,.91],c2:[1,.97,.98],ke:.5,al:.8});
   for(let i=0;i<3;i++)richPetale(P,{phi:i*TAU/3+TAU/6,a0:1.5,cu:.48,L:.4,W:.2,f:F.oeuf,cup:.65,r0:.035,c0:[.96,.72,.8],c1:[1,.84,.9],c2:[1,.96,.97],ke:.5,al:.8});
   richFlPrim(P,C(.018,.015,.36),richFlM(0,-.17,0,0,1,0),[.3,.6,.26],1);
   richPetale(P,{phi:.5,a0:1.15,cu:-.25,L:.3,W:.06,f:F.lance,cup:.4,r0:.02,y0:-.34,c0:[.22,.5,.2],c1:[.38,.7,.3],al:1,nu:7,nv:3});
   V.push(richFlFin(P));V[5].userData.vue=0.3;}
  // 7. LA MARGUERITE (2026-10-16) : une vingtaine de pétales blancs en lanière, presque à plat, sur deux rangs ; le cœur jaune bombé
  {const P=[],lan=function(u){return Math.min(1,u*7)*(u>.8?Math.sqrt(Math.max(0,1-Math.pow((u-.8)/.2,2))):1);};
   for(let i=0;i<22;i++)richPetale(P,{phi:i*TAU/22+(i%2)*.07,a0:.14+(i%2)*.12,cu:-.16,L:.42,W:.05,f:lan,cup:.18,r0:.075,c0:[.98,.96,.88],c1:[1,1,1],al:.9,nu:6,nv:2});
   richFlPrim(P,new THREE.SphereGeometry(.095,14,8),richFlM(0,.015,0,0,1,0,1,.5,1),[1,.76,.1],1);
   for(let k=0;k<12;k++){const a=k*2.39996,r9=.02+.05*Math.sqrt((k+.5)/12);richFlPrim(P,S(.012),richFlM(Math.cos(a)*r9,.055-r9*.35,Math.sin(a)*r9,0,1,0),[.92,.55,.05],1);}
   V.push(richFlFin(P));V[6].userData.vue=1.1;}
  return V;}
function richTexMontre(){return richCv(512,512,function(x){ // l'atlas de la MONTRE : le cadran (en haut à gauche), l'or (en haut à droite), le bracelet à maillons (en bas)
  x.fillStyle='#e8b33a';x.fillRect(0,0,512,512);const Go=x.createLinearGradient(256,0,512,256);Go.addColorStop(0,'#ffe9a8');Go.addColorStop(1,'#c58b22');x.fillStyle=Go;x.fillRect(256,0,256,256);
  const c=128;x.fillStyle='#d9a63a';x.beginPath();x.arc(c,c,127,0,6.2832);x.fill();                                   // la lunette
  for(let i=0;i<60;i++){const a=i/60*6.2832;x.strokeStyle=i%2?'rgba(120,80,15,.5)':'rgba(255,240,190,.6)';x.lineWidth=3;x.beginPath();x.moveTo(c+Math.cos(a)*112,c+Math.sin(a)*112);x.lineTo(c+Math.cos(a)*127,c+Math.sin(a)*127);x.stroke();} // cannelée
  const D=x.createRadialGradient(c-20,c-26,8,c,c,110);D.addColorStop(0,'#2c5bb8');D.addColorStop(.7,'#0f2a66');D.addColorStop(1,'#081a44');x.fillStyle=D;x.beginPath();x.arc(c,c,110,0,6.2832);x.fill(); // le cadran BLEU soleillé
  x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;for(let i=0;i<90;i++){const a=i/90*6.2832;x.beginPath();x.moveTo(c,c);x.lineTo(c+Math.cos(a)*110,c+Math.sin(a)*110);x.stroke();}
  for(let h=0;h<12;h++){const a=h/12*6.2832-Math.PI/2;x.save();x.translate(c+Math.cos(a)*88,c+Math.sin(a)*88);x.rotate(a+Math.PI/2);x.fillStyle='#ffdf8a'; // les index d'or
    if(h===0){x.beginPath();x.moveTo(-10,-10);x.lineTo(10,-10);x.lineTo(0,8);x.fill();}else if(h===3){}else x.fillRect(-4,-11,8,22);x.restore();}
  x.fillStyle='#f4f0e6';x.fillRect(c+66,c-9,24,18);x.font='12px "Press Start 2P",monospace';x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.fillText('8',c+78,c+1); // le guichet de la date
  x.font='8px "Press Start 2P",monospace';x.fillStyle='#ffe9b0';x.fillText('CASH CAR',c,c-42);x.font='6px "Press Start 2P",monospace';x.fillText('AUTOMATIC',c,c+44);
  const aig=function(a,l,w){x.save();x.translate(c,c);x.rotate(a);x.fillStyle='#ffe28f';x.beginPath();x.moveTo(-w,6);x.lineTo(0,-l);x.lineTo(w,6);x.fill();x.restore();};
  aig(-Math.PI/3,54,6);aig(Math.PI/3,82,4.5); // 10 h 10 (0 = midi, dans le sens des aiguilles)
  x.fillStyle='#ffe28f';x.beginPath();x.arc(c,c,7,0,6.2832);x.fill();
  const B=x.createLinearGradient(0,400,0,502);B.addColorStop(0,'#c48c26');B.addColorStop(.5,'#ffe7a0');B.addColorStop(1,'#b47c1e');x.fillStyle=B;x.fillRect(0,399,512,104); // le bracelet
  x.fillStyle='rgba(90,55,8,.75)';for(let i=0;i<34;i++)x.fillRect(i*512/34,399,3,104);x.fillRect(0,432,512,3);x.fillRect(0,468,512,3); // les maillons : trois rangs (le maillon central bombé)
});}
function richTexMontreArg(){return richCv(512,512,function(x){ // l'atlas de la MONTRE ARGENTÉE (façon Oyster, sans aucun logo de marque) : le cadran (en haut à gauche), l'or (en haut à droite), le bracelet à maillons (en bas)
  x.fillStyle='#c9ced6';x.fillRect(0,0,512,512);const Go=x.createLinearGradient(256,0,512,256);Go.addColorStop(0,'#f4f6fa');Go.addColorStop(1,'#8e96a3');x.fillStyle=Go;x.fillRect(256,0,256,256);
  const c=128;x.fillStyle='#d5dae2';x.beginPath();x.arc(c,c,127,0,6.2832);x.fill();                                   // la lunette
  for(let i=0;i<60;i++){const a=i/60*6.2832;x.strokeStyle=i%2?'rgba(70,78,92,.5)':'rgba(255,255,255,.8)';x.lineWidth=3;x.beginPath();x.moveTo(c+Math.cos(a)*112,c+Math.sin(a)*112);x.lineTo(c+Math.cos(a)*127,c+Math.sin(a)*127);x.stroke();} // cannelée
  const D=x.createRadialGradient(c-20,c-26,8,c,c,110);D.addColorStop(0,'#f2f4f7');D.addColorStop(.7,'#d3d8df');D.addColorStop(1,'#aab1bc');x.fillStyle=D;x.beginPath();x.arc(c,c,110,0,6.2832);x.fill(); // le cadran ARGENT soleillé
  x.strokeStyle='rgba(80,90,105,.10)';x.lineWidth=1;for(let i=0;i<90;i++){const a=i/90*6.2832;x.beginPath();x.moveTo(c,c);x.lineTo(c+Math.cos(a)*110,c+Math.sin(a)*110);x.stroke();}
  for(let h=0;h<12;h++){const a=h/12*6.2832-Math.PI/2;x.save();x.translate(c+Math.cos(a)*88,c+Math.sin(a)*88);x.rotate(a+Math.PI/2);x.fillStyle='#3a414c'; // les index d'acier
    if(h===0){x.beginPath();x.moveTo(-10,-10);x.lineTo(10,-10);x.lineTo(0,8);x.fill();}else if(h===3){}else x.fillRect(-4,-11,8,22);x.restore();}
  x.fillStyle='#f4f0e6';x.fillRect(c+66,c-9,24,18);x.font='12px "Press Start 2P",monospace';x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.fillText('8',c+78,c+1); // le guichet de la date
  x.font='8px "Press Start 2P",monospace';x.fillStyle='#4a525e';x.fillText('CASH CAR',c,c-42);x.font='6px "Press Start 2P",monospace';x.fillText('AUTOMATIC',c,c+44);
  const aig=function(a,l,w){x.save();x.translate(c,c);x.rotate(a);x.fillStyle='#3b424d';x.beginPath();x.moveTo(-w,6);x.lineTo(0,-l);x.lineTo(w,6);x.fill();x.restore();};
  aig(-Math.PI/3,54,6);aig(Math.PI/3,82,4.5); // 10 h 10 (0 = midi, dans le sens des aiguilles)
  x.fillStyle='#3b424d';x.beginPath();x.arc(c,c,7,0,6.2832);x.fill();
  const B=x.createLinearGradient(0,400,0,502);B.addColorStop(0,'#8f97a3');B.addColorStop(.5,'#f5f7fa');B.addColorStop(1,'#7c8490');x.fillStyle=B;x.fillRect(0,399,512,104); // le bracelet
  x.fillStyle='rgba(50,58,70,.7)';for(let i=0;i<34;i++)x.fillRect(i*512/34,399,3,104);x.fillRect(0,432,512,3);x.fillRect(0,468,512,3); // les maillons : trois rangs (le maillon central bombé)
});}
function richFusionUV(L){ // comme richFusion, mais chaque primitive garde ses uv, recalées par sa fonction (l'atlas)
  let n=0;const parts=[];for(const e of L){const gg=e[0].index?e[0].toNonIndexed():e[0].clone();gg.applyMatrix4(e[1]);const uv=gg.attributes.uv;if(e[2])for(let i=0;i<uv.count;i++){const r=e[2](uv.getX(i),uv.getY(i),i,gg);uv.setXY(i,r[0],r[1]);}
    parts.push(gg);n+=gg.attributes.position.count;e[0].dispose();}
  const pos=new Float32Array(n*3),uvs=new Float32Array(n*2);let o=0,u=0;for(const gg of parts){pos.set(gg.attributes.position.array,o);o+=gg.attributes.position.array.length;uvs.set(gg.attributes.uv.array,u);u+=gg.attributes.uv.array.length;gg.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2));g.computeVertexNormals();return g;}
function richMontreGeo(){ // la MONTRE fermée : le boîtier (cadran sur le dessus, couronne à 3 h, cornes), la lunette, le bracelet qui fait le tour sous le boîtier
  const OR=function(){return [.875,.875];},M=function(x,y,z,rx,ry,rz){return new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)).setPosition(x,y,z);};
  const boite=new THREE.CylinderGeometry(1,1,.42,32,1),gr=boite.groups,cap=new Uint8Array(boite.attributes.uv.count);
  for(const G9 of gr)for(let k=G9.start;k<G9.start+G9.count;k++)cap[boite.index.getX(k)]=G9.materialIndex; // (avant de perdre l'index : qui est le DESSUS)
  const ni=boite.toNonIndexed(),capN=new Uint8Array(ni.attributes.uv.count);{const ix=boite.index;for(let k=0;k<ix.count;k++)capN[k]=cap[ix.getX(k)];}boite.dispose();
  const R=1.828,c=-1.47,a0=129*Math.PI/180,arc=(360-78)*Math.PI/180;
  const bande=new THREE.TorusGeometry(R,.1,6,40,arc);bande.rotateZ(a0);bande.rotateY(-Math.PI/2);bande.scale(5.5,1,1);bande.translate(0,c,0);
  const L=[[ni,new THREE.Matrix4(),function(u,v,i){return capN[i]===1?[u*.5,.5+v*.5]:OR();}],
    [new THREE.TorusGeometry(1,.12,6,32),M(0,.2,0,Math.PI/2),OR],                                      // la lunette
    [new THREE.CylinderGeometry(.16,.16,.22,10),M(1.08,0,0,0,0,Math.PI/2),OR],                        // la couronne
    [bande,new THREE.Matrix4(),function(u,v){return [u,.02+v*.2];}]];                                // le bracelet : les maillons courent le long
  for(const sx of [-.5,.5])for(const sz of [-1.02,1.02])L.push([new THREE.BoxGeometry(.24,.28,.36),M(sx,-.04,sz),OR]); // les cornes
  return richFusionUV(L);}
function richTexJeton(col,val){return richCv(512,288,function(x){ // un JETON : ses deux faces (0-256) et sa tranche (260-288)
  x.fillStyle=col;x.fillRect(0,0,512,288);
  for(const cx of [128,384]){x.fillStyle=col;x.beginPath();x.arc(cx,128,127,0,6.2832);x.fill();
    x.fillStyle='#f4f1ea';for(let k=0;k<8;k++){x.save();x.translate(cx,128);x.rotate(k/8*6.2832);x.fillRect(-13,-127,26,26);x.restore();} // les plots blancs du bord
    x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.arc(cx,128,84,0,6.2832);x.fill();
    x.strokeStyle='#f4f1ea';x.lineWidth=4;x.setLineDash([10,8]);x.beginPath();x.arc(cx,128,80,0,6.2832);x.stroke();x.setLineDash([]);
    x.fillStyle='#fff';x.font=(val.length>3?22:28)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(val,cx,120);
    x.font='8px "Press Start 2P",monospace';x.fillStyle='rgba(255,255,255,.85)';x.fillText('CASH CAR',cx,160);}
  x.fillStyle='#f4f1ea';for(let k=0;k<8;k++)x.fillRect(k*64+25,260,14,28);});} // la tranche : les mêmes plots
function richJetonGeo(){const g=new THREE.CylinderGeometry(1,1,.17,32,1),uv=g.attributes.uv; // Ø 39 mm × 3,3 mm
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===0)uv.setXY(i,u,v*.097);else if(G9.materialIndex===1)uv.setXY(i,u*.5,.111+v*.889);else uv.setXY(i,.5+u*.5,.111+v*.889);}
  g.clearGroups();return g;}
function richInit(){
  if(RICH.pret)return;RICH.pret=true;
  const M={},Gm={};
  const metal=function(tex,shin){return richMat(RICH_FS_METAL,{uMap:{value:tex},uShin:{value:shin||90}});};
  const piece=function(T,shin){const m9=richMat(RICH_FS_METAL,{uMap:{value:T[0]},uBump:{value:T[1]},uBumpK:{value:RICH_BOSSE},uShin:{value:shin}},{PIECE:1});m9.extensions.derivatives=true;return m9;}; // (2026-10-10) les pièces : le métal + le relief frappé (un 4e programme, compilé lui aussi sous l'écran titre)
  M.piece2=piece(richTexPiece('2'),120);M.piece1=piece(richTexPiece('1'),120);M.piece50=piece(richTexPiece('50'),120);M.btc=piece(richTexBtc(),110);
  M.or=metal(richTexUni('#ffb52e'),140);M.lingot=metal(richTexUni('#ffbd3d'),170); // l'or : un jaune profond (F0 de l'or ≈ 1 · .71 · .29), c'est le reflet qui l'éclaire
  M.diamant=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(1,1,1)}});
  RICH.texBillets=RICH_BILLETS.map(richTexBillet);RICH.texBillet=RICH.texBillets[RICH_B100]; // (2026-10-10) la série des sept valeurs ; le 100 (sarcelle) habille aussi la liasse
  M.billets=RICH_BILLETS.map(function(B,i){return richMat(RICH_FS_SOUPLE,{uMap:{value:RICH.texBillets[i]},uSheen:{value:new THREE.Color(B.sh[0],B.sh[1],B.sh[2])},uSheenK:{value:.5},uBend:{value:2.3},uLum:{value:.6}},{SOUPLE:1},THREE.DoubleSide);}); // (même programme : 0 compilé de plus)
  M.billet=M.billets[RICH_B100];
  M.trefle=richMat(RICH_FS_SOUPLE,{uMap:{value:richTexTrefle()},uSheen:{value:new THREE.Color(.55,1,.5)},uSheenK:{value:.35},uBend:{value:.7}},{SOUPLE:1},THREE.DoubleSide);
  M.rubis=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(1,.06,.16)}});M.emeraude=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(.08,.9,.38)}}); // les gemmes de couleur : le programme du diamant, teinté
  M.montre=metal(richTexMontre(),150);M.montreArg=metal(richTexMontreArg(),230);M.argent=metal(richTexUni('#dfe4ec'),230);M.cigare=metal(richTexUni('#5a3418'),35);M.cendre=metal(richTexUni('#8d8a85'),12); // (2026-10-21, Léo : « une montre argentée, Rolex ») la même montre en acier, cadran argent soleillé, bracelet Oyster — une sur deux
  M.cranes=[['#fbf9ff',[1,1,1]]].map(function(P){const m9=metal(richTexUni(P[0]),190);m9.userData.gc=P[1];return m9;}); // (2026-10-21, Léo : « enlève les crânes colorés, garde la blanche, plus stylée ») UN SEUL crâne : blanc nacré, vernis serré — plus de pastels
  M.jetons=[['#c61b2c','5'],['#1d8f3a','25'],['#18181d','100'],['#6a2a9a','500'],['#e09a12','1000']].map(function(J){return richMat(RICH_FS_SOUPLE,{uMap:{value:richTexJeton(J[0],J[1])},uSheen:{value:new THREE.Color(1,1,1)},uSheenK:{value:.28},uBend:{value:0}},{SOUPLE:1},THREE.DoubleSide);}); // la terre cuite des jetons : mate, un peu de lustre
  M.carte=metal(richTexCarte(),130);M.champagne=metal(richTexChampagne(),90);M.vins=[M.champagne].concat(RICH_VINS.map(function(V9){return metal(richTexVin(V9),V9.shin||100);})); // (2026-10-16) les vins : le programme du métal, comme le champagne (0 compilé de plus)M.noir=metal(richTexUni('#16121c'),60);
  M.liasse=richMat(RICH_FS_SOUPLE,{uMap:{value:richTexLiasse()},uSheen:{value:new THREE.Color(.49,1,.62)},uSheenK:{value:.2},uBend:{value:0}},{SOUPLE:1},THREE.DoubleSide); // la liasse ne plie pas
  Gm.piece=richPiece();Gm.billet=new THREE.PlaneGeometry(1,.46,16,4);Gm.trefle=new THREE.PlaneGeometry(1,1,6,6);
  M.coeur=new THREE.ShaderMaterial({uniforms:Object.assign({},RICH_U,{uRouge:{value:new THREE.Color(.86,.015,.08)},uFuch:{value:new THREE.Color(1,.16,.6)},uBlanc:{value:1},uA:{value:.2},uPop:{value:0}}),vertexShader:RICH_VS_COEUR,fragmentShader:RICH_FS_COEUR,
    transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}); // (2026-10-16) le cœur fantôme (voir RICH_FS_COEUR) : transparent, prémultiplié
  M.fleur=new THREE.ShaderMaterial({uniforms:RICH_U,vertexShader:RICH_VS_FLEUR,fragmentShader:RICH_FS_FLEUR,transparent:true,depthWrite:true,side:THREE.DoubleSide,
    blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}); // (2026-10-16) les pétales (voir RICH_FS_FLEUR)
  M.aura=new THREE.SpriteMaterial({map:richCv(64,64,function(x){const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(255,215,228,.46)');G.addColorStop(.42,'rgba(255,170,200,.2)');G.addColorStop(1,'rgba(255,140,180,0)');x.fillStyle=G;x.fillRect(0,0,64,64);}),
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}); // l'aura des cœurs : un halo blanc rosé additif (2026-10-16 : rouge ET blanc) (le programme des éclats : 0 compilé de plus)
  Gm.carte=richCarteGeo();Gm.liasse=richLiasseGeo();Gm.champagne=richChampagneGeo();Gm.vins=[Gm.champagne].concat(RICH_VINS.map(function(V9){return richVinGeo(V9.p);}));Gm.emeraude=richEmeraude();Gm.crane=richCraneGeo();Gm.montre=richMontreGeo();Gm.jeton=richJetonGeo();Gm.coeur=richCoeurCubes();Gm.fleurs=richFleurs();
  Gm.or=[richPepite(1),richPepite(2),richPepite(3)];Gm.lingot=richLingot();Gm.diamant=richDiamant();Gm.bague=richBagueGeo();Gm.cigare=richCigareGeo();Gm.cles=richClesGeo();
  RICH.M=M;RICH.G=Gm;
  for(const k9 in M)for(const m9 of [].concat(M[k9]))if(m9&&m9.uniforms)for(const u9 in m9.uniforms){const v9=m9.uniforms[u9].value;if(v9&&v9.isCanvasTexture)texLibere(v9);} // (2026-10-14, passe perf mobile) les ~30 toiles de la pluie de richesse (pièces, billets, jetons, carte, montre, liasse : ~14 Mo), peintes UNE fois ici et plus jamais relues (la liasse a déjà recopié son billet) : rendues après l'envoi (paliers 0-1)
  for(const t in RICH_CAP){RICH.libres[t]=[];for(let i=0;i<RICH_CAP[t];i++){let m;
      if(t==='fruit'){const fg=fruitGeo(i%FRUIT_DEFS.length);m=new THREE.Mesh(fg,FRUIT_MAT);} // les fruits de la piste, leur matière (déjà compilée)
      else if(t==='cigare'){m=new THREE.Group();m.add(new THREE.Mesh(Gm.cigare.corps,M.cigare),new THREE.Mesh(Gm.cigare.bague,M.or),new THREE.Mesh(Gm.cigare.cendre,M.cendre)); // le cigare : la feuille, la bague d'or, la cendre
        m.traverse(function(c){c.frustumCulled=false;c.castShadow=c.receiveShadow=false;});}
      else if(t==='cles'){m=new THREE.Group();m.add(new THREE.Mesh(Gm.cles.or,M.or),new THREE.Mesh(Gm.cles.ag,M.argent)); // le trousseau : une clé d'or, une clé d'acier et l'anneau
        m.traverse(function(c){c.frustumCulled=false;c.castShadow=c.receiveShadow=false;});}
      else if(t==='bague'){m=new THREE.Group();const dm=new THREE.Mesh(Gm.diamant,M.diamant);dm.position.set(0,.72,0);dm.scale.setScalar(.4);const bd=new THREE.Mesh(Gm.bague,M.or);bd.position.y=-.38;m.add(bd,dm); // la bague : l'or et le diamant
        m.traverse(function(c){c.frustumCulled=false;c.castShadow=c.receiveShadow=false;});}
      else if(t==='crane'){m=new THREE.Group();m.add(new THREE.Mesh(Gm.crane.or,M.cranes[i%M.cranes.length]),new THREE.Mesh(Gm.crane.noir,M.noir)); // le crâne : les os (pastel), les creux (sombres)
        m.traverse(function(c){c.frustumCulled=false;c.castShadow=c.receiveShadow=false;});}
      else if(t==='jeton')m=new THREE.Mesh(Gm.jeton,M.jetons[i%M.jetons.length]);
      else if(t==='coeur'){m=new THREE.Mesh(Gm.coeur,new THREE.ShaderMaterial({uniforms:Object.assign({},M.coeur.uniforms,{uPop:{value:0}}),vertexShader:RICH_VS_COEUR,fragmentShader:RICH_FS_COEUR, // (2026-10-16) chaque cœur sa matière (son pop à lui) : les mêmes réglages, le même programme
        transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}));}
      else if(t==='fleur'){m=new THREE.Mesh(Gm.fleurs[i%Gm.fleurs.length],M.fleur);const a9=new THREE.Sprite(M.aura);a9.scale.setScalar(1.6);a9.renderOrder=4;m.add(a9);m.renderOrder=5;} // (2026-10-16) la fleur et son aura
      else{const g=t==='or'?Gm.or[i%3]:t.indexOf('piece')===0||t==='btc'?Gm.piece:t==='rubis'?Gm.diamant:Gm[t];m=new THREE.Mesh(g,M[t]);}
      if(t==='coeur'){const a9=new THREE.Sprite(M.aura);a9.scale.setScalar(2.2);a9.renderOrder=4;m.add(a9);m.renderOrder=5;} // (2026-10-15) son AURA, derrière lui : elle grandit et bat avec lui (le cœur, transparent, se peint APRÈS elle)
      m.visible=false;m.castShadow=m.receiveShadow=false;m.frustumCulled=false;scene.add(m);
      RICH.libres[t].push({m:m,t:t,v:new THREE.Vector3(),w:new THREE.Vector3(),age:0,vie:1,s:1,ph:0,fd:0,nl:null,gl:null,on:false,
        pa:new THREE.Vector3(),pw:0,fv:.4,ec:0,mode:0,ax:new THREE.Vector3(),gd:new THREE.Vector3(),om:0,A:0,G:0,yr:0,kb:0});}} // (2026-10-10) pa/pw : la précession de la pièce · fv : son fondu de sortie · ec : l'heure où la liasse craque · mode… : le papier qui tombe (richPapier)
  // LES CHAÎNES D'OR : 9 nœuds, 8 maillons (des tores étirés, un sur deux tourné d'un quart), la physique d'une vraie chaîne (richChaine)
  const tg=new THREE.TorusGeometry(1,.36,6,14);tg.scale(1.4,1,1);RICH.ch=[];
  for(let c=0;c<3;c++){const K=9,L=[];for(let j=0;j<K-1;j++){const m=new THREE.Mesh(tg,M.or);m.visible=false;m.frustumCulled=false;m.castShadow=m.receiveShadow=false;scene.add(m);L.push(m);}
    RICH.ch.push({K:K,links:L,P:new Float32Array(K*3),Pp:new Float32Array(K*3),V:new Float32Array(K*3),kd:new Float32Array(K),on:false,age:0,vie:1,L:.15,gl:null});}
  // les éclats (bling) et la flamme : des sprites (programme déjà là), chacun sa matière (son opacité, sa teinte, sa rotation)
  const st=richTexEtoile(),ft=richTexFlamme();RICH.texEt=st;
  for(let i=0;i<36;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:st,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.visible=false;s.renderOrder=6;scene.add(s);RICH.gl.push({s:s,o:null});}
  for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ft,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.visible=false;s.renderOrder=5;scene.add(s);
    RICH.fl.push({s:s,p:new THREE.Vector3(),v:new THREE.Vector3(),age:9,vie:1,r0:.2,r1:1,c:new THREE.Color()});}
  // LES ÉTINCELLES v2 : un maillage de traits (le programme des filets de vent)
  const N=200,g=new THREE.BufferGeometry(),pos=new Float32Array(N*12),col=new Float32Array(N*12),idx=[];
  for(let i=0;i<N;i++){const a=i*4;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);
  const sm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  sm.frustumCulled=false;sm.renderOrder=7;sm.visible=false;scene.add(sm);
  RICH.sp={m:sm,pos:pos,col:col,n:N,P:new Float32Array(N*3),V:new Float32Array(N*3),L:new Float32Array(N),L0:new Float32Array(N),Hh:new Float32Array(N),Wd:new Float32Array(N),K:new Uint8Array(N),i:0,vivant:0};
  RICH.chauffe=3; // trois images : un exemplaire de chaque, minuscule, devant la caméra — les programmes se compilent sous l'écran titre
}
function richChauffeTick(C){
  if(!RICH.chauffe)return;RICH.chauffe--;const on=RICH.chauffe>0;
  for(const t in RICH.libres){const o=RICH.libres[t][0];if(o.on)continue;o.m.visible=on;if(on){o.m.position.copy(C);o.m.scale.setScalar(1e-4);}}
  if(RICH.ch){const c=RICH.ch[0];if(!c.on)for(const m of c.links){m.visible=on;if(on){m.position.copy(C);m.scale.setScalar(1e-4);}}}
  if(RICH.sp){RICH.sp.m.visible=on||RICH.sp.vivant>0;}
}

