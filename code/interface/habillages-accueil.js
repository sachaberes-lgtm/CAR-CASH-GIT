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
      const et=a?(eqd||S9?'':pxi('coche')):(d.eur?eurTxt(d.eur):d.p?fmtC(d.p):d.pack==='chat'?sansAcc(TR('PACK CHAT')):d.pack?eurTxt(PALETTE_PACK.eur):sansAcc(TR('MISSION'))); /* (2026-10-18 soir) l'ARC-EN-CIEL n'est pas de la palette (voir chatPackI) */ // (2026-10-14, palette) un article du PACK dit son prix en euros // (à gagner : le cadenas est déjà au coin)
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
  paintEnvAtelier(); // (2026-09-26) la laque reflète l'ATELIER (tubes, clé chaude, contre-jour cyan), plus le ciel de la dernière course
  // (2026-09-26, vague 2) …et l'atelier a SA lumière (biome `atelier`) au lieu du ciel et du soleil de la dernière course. Posée hors
  // du voyage BIO (BIO.cur reste le ciel du niveau) : closeGarage le rend tel quel. Un voyage en cours se termine d'abord, sinon
  // bioStep repeindrait le ciel du biome par-dessus l'atelier à chaque image.
  if(BIO.k<1){BIO.k=1;bioLerp(BIO.from,BIO.to,1,BIO.cur);}
  bioApply(BIOMES.atelier);MENUV.bio=false;
  garageAng=Math.PI;garagePitch=.2;garageDist=7.8;if(typeof GTN!=='undefined'&&GTN){GTN.fixe=false;GTN.gt=0;GTN.glisse=false;}GAR.vA=0;GAR.vAc=0;GAR.vW=0;GAR.vD=0;GAR.vDv=0;GAR.vDw=0;GAR.preE=0;GAR.aVl=null;GAR.vAv=0;GAR.vDon=true;GAR.ret=null;GAR.tDoigt=0;GAR.pT=.2;GAR.roll=0;GAR.swK=0;GAR.fige=false; // (2026-09-30, Léo, capture de sa branche : « c'est ça que je veux ») on entre DERRIÈRE la caisse, la porte en feu au fond du cadre — le plateau la fait tourner ensuite (voir GAR_CAM_A)
  garageShow(level||0);
  GMIS.mk=0;garMode(GAR.aMenu?'menu':'boutique');GAR.aMenu=false;
  if(GAR.aMis){GAR.aMis=false;garMode('missions');}
  GAR.vueT=0;GAR.vueNeuve=true; // (2026-10-06) LA MISE EN PLACE : l'atelier qui s'ouvre pose son plan d'un coup (voir garageRender) — (2026-09-30) la porte des MISSIONS, venue d'ailleurs (écran de mort…) // (2026-09-30) ouvert par l'ACCUEIL = le menu ; par un autre chemin (mort → GARAGE, missions, objectif) = la boutique
}
function closeGarage(){
  GATL.on=false;GATL.c=GATL.cs=GATL.l=GATL.p=0;if(gEl)gEl.classList.remove('atelierInv'); // (2026-10-12) l'ATELIER FERMÉ ne survit pas au garage
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
  if(SHOP.prev||SHOP.tab!=='voiture'){SHOP.prev=null;SHOP.tab='voiture';buildCar(CARS[equippedCar()]);} // l'essai ne sort pas de l'atelier
  paintEnv(BIO.to.env,BIO.to.eS1,BIO.to.eS2); // (2026-09-26) on rend à la laque le ciel du biome (l'atelier l'avait repeint en studio)
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
  buildCar(CARS[level||0]);                 // remet la caisse du menu
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
const MENU_PLANS=[{n:'affiche',t:8,fov:44,lum:3.4},{n:'arriere',t:7,fov:40,lum:2.2},{n:'profil',t:7,fov:30,lum:.45}]; // lum : le PROFIL a le soleil dans le dos (on le garde hors champ) — il éclaire déjà tout le flanc
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
