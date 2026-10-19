/* LE FRÔLÉ (2026-09-25, user : « rends la conduite plus fun et plus addictive »). Passer AU RAS d'un plot, à bonne
   vitesse, sans le toucher. Le jeu punissait le plot touché (perte de vitesse) mais ne disait RIEN au pilote qui l'avait
   évité de 20 cm — or c'est ce geste-là qui fait les grands jeux de caisse arcade (le « near miss » de Burnout) : le
   risque paie TOUT DE SUITE, en nitro, en FLOW et en aura. Un slalom pris au cordeau ENCHAÎNE les frôlés : la chaîne
   tient 1,4 s entre deux plots, et le souffle comme le « ting » montent d'un cran à chaque maillon. */
const FROLE={n:0,t:0};
function frole(c9,dl,k){
  k=k||1;c9.frole=true;const pres=Math.max(0,Math.min(1,1-(dl-1.6)/2)); // 1 = rasé de près, 0 = large (3,6 m) · k : plots frôlés dans la même image (une PORTE)
  FROLE.n+=k;FROLE.t=1.4;
  nitroGain((.08+.08*pres)*(k>1?1.5:1),'frole');flowAdd((4+4*pres)*(k>1?1.5:1),'style','n'); // (v4→v5) frôler, c'est un peu de NARCISSE — flowAdd lui verse la part du style // ×1,5 (et non ×2) : la porte paie plus sans gonfler le FLOW
  momT=Math.min(4.3,momT+.6); // (momentum v2) le style NOURRIT la réserve de vitesse
  try{chaineAuraMuette(FROLE.n>=2?'SLALOM ×'+FROLE.n:'FRÔLÉ',20,'frole',false,SONV2);}catch(e){}
  if(k===1&&FROLE.n>=2)popTexte('SLALOM ×'+FROLE.n,FROLE.n>=3?'#ffd75e':'#7dffec'); // (2026-09-29, Sacha) FRÔLÉ ! et PORTE ! ne s'écrivent plus : seul le SLALOM parle
  try{froleSnd(pres,FROLE.n,c9);}catch(e){} // (2026-10-14, session SON) + l'objet frôlé : le souffle passe de SON côté
  hap(FROLE.n>=3?[8,20,8]:8);fovPunch=Math.max(fovPunch,1.5+2*pres);
  try{sparkBurst(sparkBlue,c9.mesh.position,3+Math.round(3*pres),5);}catch(e){}
  if(SENS)try{sensCoup((lat-side*c9.lat>0?1:-1)*(.35+.5*pres),0,0);}catch(e){} // (2026-10-14, sensations) le SOUFFLE du plot rasé : la caisse s'en écarte d'un rien (plus on rase près, plus elle tique) — le frôlé se lisait aux étincelles, pas dans la caisse
}
// combien de secondes avant de perdre le palier, si on ne nourrit plus (répit, pente, fuite — le même barème que la perte)
function flowReste(){
  const fr9=FLOW.lv===4,m=FLOW.v-(fr9||FREN.arme?FREN.seuil:FLOW.lv*25);if(m<=0)return 0; // (2026-09-30) ARMÉE, ce qu'on perd d'abord c'est l'armement (88), pas le palier (75) : le tic et « lâche » le comptent
  if(fr9){const b=FLOW2.triade.brule[FREN.k];return b>0?m/b:9;} // (v4) en frénésie : la brûlure de la triade
  const G=FLOW2.grace,tG=Math.max(0,G-FLOW.idle);
  const rG=flowPerteDe(1,FLOW.v,FLOW.lv,0,false,FLOW.vit,FLOW.nit),rF=Math.max(.01,flowPerteDe(1,FLOW.v,FLOW.lv,G+1,false,FLOW.vit,FLOW.nit));
  if(rG*tG>=m)return rG>0?m/rG:tG;
  return tG+(m-rG*tG)/rF;
}
function flowTick(dt){
  if(!started||gameOver)return;
  FLOW.vit=flowVitN();
  const air=mode==='fall',nit=FLOW.nit=nitroOn&&mode!=='boom';
  // EN VOL, LE RÉPIT NE S'ÉCOULE PAS : le vide retient le flow (c'est lui qui le fait vivre). (v3, Sacha : « tant que le nitro est
  // activé, le flow ne baisse pas ») — LE NITRO NON PLUS : il suspend tout, la perte comme le répit. C'est le bouclier de la montée.
  if(!air&&!nit)FLOW.idle+=dt;
  flowTagTick();
  if(FLOW.lv<4&&dt>0){ // (v5) PSYCHO hors frénésie (en frénésie, frenTriade le tient) : la vitesse TENUE paie, la lenteur coûte
    const P=FLOW2.psy;FLOW.psyT=mode!=='boom'&&FLOW.vit>=(air?P.air:P.sol)?FLOW.psyT+dt:0;
    if(FLOW.psyT>=P.t){FLOW.psyT-=P.t;flowAdd(air?P.q[1]:P.q[0],air?'risque':'style','p');}
    if(FLOW.vit>=FLOW2.lent.re)FLOW.psyOk=true; // le départ lancé (0,4 → 1 en ~6 s) n'est pas une lenteur : -PSYCHO s'arme à la croisière
    if(FLOW.psyOk&&mode==='drive'&&!nit&&FLOW.v>0&&FLOW.vit<FLOW2.lent.vit){ // trop lent : le répit saute une fois, l'étiquette rouge reste tant qu'on traîne
      if(!FLOW.lent9){FLOW.lent9=true;FLOW.idle=Math.max(FLOW.idle,FLOW2.grace);}flowTag('p',-1);}
    else if(FLOW.lent9&&FLOW.vit>=FLOW2.lent.re)FLOW.lent9=false;
  }
  const fr9=FLOW.lv===4;
  if(fr9)frenTriade(dt,air,nit); // (v4) les trois traits vivent et meurent AVANT qu'on compte la brûlure
  FLOW.v=Math.min(100,Math.max(0,FLOW.v-flowPerteDe(dt,FLOW.v,FLOW.lv,FLOW.idle,air,FLOW.vit,nit,FREN.k)));
  if(fr9){frenTient(dt);if(FREN.k===3&&!air&&dt>0)frenNourrit(dt*2);} // les trois tenus : la jauge SE REGONFLE et scintille
  const lv=flowLvDe(FLOW.v);
  if(FREN.arme&&FLOW.v<FREN.seuil){FREN.arme=false;FLOW.aff=-1; // (v4) l'arme retombe avec la jauge : sous la zone rouge, il faut la remplir de nouveau
    // (2026-09-30) …et ça se DIT : elle tombait en silence, le joueur posait sa figure ensuite et rien ne partait, sans savoir pourquoi
    try{if(SONV2)sfx('flow.perdu');pixBurst(FLOW.el&&FLOW.el.querySelector('.fZ'),6);}catch(e){}hap(6);}
  // (2026-09-25) LE FLOW PRÉVIENT AVANT DE LÂCHER : un tic qui ACCÉLÈRE quand il reste moins d'1,1 s avant de perdre le palier (au sol
  // seulement : en vol on ne peut rien nourrir). Nourrir (pièce, drift, frôlé…) remet idle à 0 : le tic se tait tout seul.
  // En FRÉNÉSIE — et ARMÉE (2026-09-30) —, le plancher n'est plus le palier mais le bord de la zone rouge.
  let rest=9;
  if(FLOW.lv>0&&mode==='drive'&&(!nit||FLOW.lv===4)){ // (v3) nitro allumé : rien ne fuit, rien ne sonne — sauf en frénésie (v4 : la triade décide)
    rest=flowReste();
    FLOW.tk-=dt;
    if(rest<1.1&&FLOW.tk<=0){FLOW.tk=.1+.3*rest;try{if(SONV2)sfx('alerte.tic');else chimeNote(noteP(FLOW_ACC[FLOW.lv][0],2),0,.025,.05);}catch(e){}hap(4);}
  }
  if(lv<FLOW.lv){try{flowDropSnd(FLOW.lv);}catch(e){}hap(fr9?[10,30,10,30,24]:[6,30,6]);FLOW.lv=lv;FLOW.tk=0;
    if(fr9){FLOW.idle=0;try{frenMus(false);}catch(e){} // la frénésie lâche : SON MORCEAU S'ÉTRANGLE — c'est ça qu'on ne veut plus jamais entendre
      // (v3) …ET LA TRIADE SE VIDE : la jauge retombe au seuil de la triade (un filet au-dessus : le répit laisse 2 s pour la nourrir
      // avant de glisser dans le rose). Y revenir, c'est remonter toute la dernière cellule — plus de retour en deux figures.
      FLOW.v=Math.min(FLOW.v,FLOW2.retombee+1);FLOW.lv=Math.min(FLOW.lv,flowLvDe(FLOW.v));
      frenFin(false);}}
  flowHudMaj(rest);
}
/* (HUD v4) LA BANDE DU FLOW — la pilule de 9 px qu'on ne lisait pas est devenue une bande PLEINE LARGEUR sous la jauge de nitro.
   Quatre segments aux couleurs des paliers (cyan · or · rose · violet — les remplir tous, c'est la FRÉNÉSIE), le NOM du palier à
   gauche, et à droite ce qu'il VAUT : le multiplicateur de CASH, en vert billet — l'ancien « FLOW ×2 » annonçait ×2 quand l'argent
   montait de ×1,5, et se confondait avec le × de la chaîne d'aura. Elle est là dès le départ, VIDE : une jauge vide demande à être
   remplie. Elle bat quand le palier suivant est à portée, se hachure de rouge quand elle FUIT, clignote quand elle LÂCHE — au même
   rythme que le tic sonore. Écrite seulement quand quelque chose change. */
const FLOW_NOM=['FLOW','FLOW I','FLOW II','FLOW III','FRÉNÉSIE'];
function fmtMul(m){const t=String(Math.round(m*10)/10);return LANG==='fr'?t.replace('.',','):t;}
function flowPunch(){const h=FLOW.el;if(!h)return;
  // la FRÉNÉSIE ne « monte » pas comme un palier : la jauge S'EMBRASE, cellule après cellule, de gauche à droite (.embrase)
  const c9=FLOW.lv===4?'embrase':'monte';h.classList.remove('monte','embrase');void h.offsetWidth;h.classList.add(c9);
  if(FLOW.lv>=2)try{pixBurst(h.querySelector(FLOW.lv===4?'.fZ':'.fSeg'),6+FLOW.lv*3);}catch(e){}}
function flowHudMaj(rest){
  const fuit=FLOW.lv===4?(mode==='drive'&&FREN.k<3):FLOW.v>0&&mode==='drive'&&!FLOW.nit&&FLOW.idle>FLOW2.grace,lache=fuit&&FLOW.lv>0&&rest<1.1,pres=FLOW.lv<4&&FLOW.v%25>20;
  const lent=FLOW.revele&&FLOW.lv<4&&FLOW.vit<FLOW2.gate; // la triade GÈLE sous sa vitesse : elle ne prendra rien tant qu'on n'accélère pas
  const k=Math.round(FLOW.v*2)+'|'+FLOW.lv+'|'+(fuit?1:0)+(lache?1:0)+(pres?1:0)+(lent?1:0)+(FLOW.revele?1:0)+(FLOW.nit?1:0)+(FREN.arme?1:0);if(FLOW.aff===k)return;FLOW.aff=k;
  let h=FLOW.el;
  if(!h){h=FLOW.el=document.createElement('div');h.id='flowHud';h.className='on';h.setAttribute('aria-hidden','true');
    // la 4e cellule porte la ZONE ROUGE (.fZ) : son propre remplissage rouge, par-dessus le violet, et le cran du seuil
    h.innerHTML='<b class="fL"></b><span class="fSeg"><i><s></s></i><i><s></s></i><i><s></s></i><i><s></s><b class="fZ"><s></s></b></i><u class="fG"></u></span><em class="fM"></em>';
    FLOW.seg=Array.prototype.slice.call(h.querySelectorAll('.fSeg>i'));
    FLOW.seg.forEach(function(i9,j){i9.style.setProperty('--sc',FLOW_CEL[j]);});
    FLOW.zs=h.querySelector('.fZ s');
    h.style.setProperty('--fzL',((FREN.seuil-75)/25*100).toFixed(1)+'%'); // le seuil ne vit qu'à UN endroit (FREN) : le CSS le reçoit
    document.body.appendChild(h);
    const g=document.createElement('div');g.id='flowGlow';g.setAttribute('aria-hidden','true');document.body.appendChild(g);FLOW.glow=g;FLOW.lvAff=-1;}
  const cur=Math.min(3,Math.floor(FLOW.v/25)),zf=Math.max(0,Math.min(1,(FLOW.v-FREN.seuil)/(100-FREN.seuil)));
  // (2026-09-28, Sacha : « au début la barre ne montre que le cyan, l'or et le rose ; la partie violette et rouge de la DARK TRIAD doit être
  // masquée et commencer à apparaître quand on s'en approche ») : --rv = 0 sous 55, 1 à 75 (et pour de bon une fois la triade révélée)
  h.style.setProperty('--rv',FLOW.revele?'1':Math.max(0,Math.min(1,(FLOW.v-55)/20)).toFixed(3));
  for(let j=0;j<4;j++){const i9=FLOW.seg[j];i9.firstChild.style.setProperty('--f',Math.max(0,Math.min(1,(FLOW.v-25*j)/25)).toFixed(3));
    i9.classList.toggle('cur',j===cur);}
  FLOW.zs.style.setProperty('--f',zf.toFixed(3));
  h.classList.toggle('dansZ',zf>0);h.classList.toggle('fuit',fuit);h.classList.toggle('lache',lache);h.classList.toggle('presque',pres);
  h.classList.toggle('revele',FLOW.revele);h.classList.toggle('lent',lent);
  h.classList.toggle('arme',FREN.arme); // (v4) jauge pleine : la frénésie attend une figure posée
  h.classList.toggle('gele',FLOW.nit&&FLOW.v>0&&FLOW.lv<4); // (v3) le nitro TIENT la jauge de la montée : rien ne fuit tant qu'il brûle
  const tr=frenEl();if(tr){tr.classList.toggle('tremble',FLOW.lv===4&&lache);tr.classList.toggle('froid',FLOW.lv===4&&fuit&&!lache);}
  if(FLOW.lvAff!==FLOW.lv){const av=FLOW.lvAff;FLOW.lvAff=FLOW.lv;h.style.setProperty('--fc',FLOW_COL[FLOW.lv]);h.dataset.lv=FLOW.lv;
    h.querySelector('.fL').textContent=sansAcc(TR(FLOW_NOM[FLOW.lv]));h.querySelector('.fM').textContent='$×'+fmtMul(flowMult());
    const g=FLOW.glow;g.style.setProperty('--fc',FLOW_COL[FLOW.lv]);g.dataset.lv=FLOW.lv;g.style.opacity=FLOW.lv?(.25+FLOW.lv*.15).toFixed(2):'0';
    if(FLOW.lv===4)frenEntre();else{h.classList.remove('embrase','sc1','sc2');if(av===4)frenSort();}} // (sans ça, un retour d'écran — display rendu — rejouerait l'embrasement)
}
/* <<<NITRO2>>> ==============================================================
   LA LOI DU RÉSERVOIR (2026-10-01, Sacha : « il y a un gros problème de gameplay avec le nitro […] on peut avoir du nitro infini en
   continuant à décoller et se poser en boucle »).
   LE TROU : la POSE rendait 20 % de la jauge à CHAQUE contact, la FIGURE posée jusqu'à 1,2 (×1,5 parfaite, ×2 divine), le BUMP ,35 à
   chaque rebond — et les figures qui naissent du nitro lui-même (MÉTÉORE à 1,2 s de réacteur, AIR NITROOO à 2 s) comptaient comme
   les autres. Tenir le nitro en l'air fabriquait donc la figure qui le remboursait à la pose ; et depuis que NITROOO brûlait moitié
   moins (30/09), un vol de 3 s coûtait ,9 et sa pose rendait 1 à 1,6 : la boucle décoller / se poser GAGNAIT du nitro. Au bout, la
   vitesse de NITROOO (×1,10 par seconde tenue) n'avait plus de frein.
   LES LOIS :
   0. À SEC, IL S'ÉTEINT. Le réacteur tenait tant qu'il restait plus de ,005 dans la jauge ; elle se refait de ,2 × dt par image : sous
      ~40 images/s (un iPhone bridé à 30 i/s) la recharge d'UNE image suffisait et le nitro TENU ne s'éteignait jamais, jauge vide.
      Il tient désormais tant que la jauge PAIE l'image (`nitroTientDe`), et se rallume à `seuil`.
   1. LE VOL DÉPENSE, LA ROUTE REMPLIT. Ce que la POSE et la FIGURE rendent est au PRORATA DU VOL FAIT NITRO COUPÉE (`nitroPartDe`) :
      un vol tenu réacteur allumé d'un bout à l'autre ne rend rien, un vol sans nitro rend tout, la moitié rend la moitié.
   2. LA POSE rend ses 20 % pour un VRAI vol : pleine à partir de `pose.plein` secondes, au prorata en dessous (les sautillements au
      bord de la route ne sont pas une pompe).
   3. LE BUMP rend ,35 au 1er rebond d'un vol, puis ×,6 à chaque suivant, rien au-delà du 4e — et rien réacteur allumé.
   4. (RETIRÉE, 18/10, avec NITROOO : le réservoir brûlait moins pendant la comète.) La FRÉNÉSIE garde son nitro qui dure 2× partout
      (demande de Sacha, FLOW v3) : c'est l'état des maîtres, et il se perd tout seul.
   5. LE RASE-BORD (,22/s) ne remplit que nitro COUPÉE : rien ne se remplit en continu pendant que ça brûle.
   6. LA FIGURE SE PAIE (2026-10-17, Sacha : « faire une figure doit coûter 20 % de nitro mais rapporter 30 % avec un bon atterrissage,
      cumulable »). La lancer en vol coûte `figN.cout` (20 % de la jauge) — pas assez dans la jauge : elle ne part pas (le « tchk » de la
      nitro à vide). Plantée, elle rapporte `figN.rend` (40 % depuis le 18/10, 30 % avant) à la POSE RÉUSSIE, et ça s'additionne : trois figures = 120 %, un tonneau ×3
      (trois double-taps, 60 % payés) = 120 %. Chute en plein tour, pose de travers ou à contresens : les 20 % sont perdus. Le SAUT NITRO paie
      déjà ses 20 % (VEQ_K.sautCout) : sa figure rapporte comme les autres. Plus rien n'est rendu EN VOL (le plein à la plantée d'ASPHALT 8
      et la prime du COMBO À TROIS se sont tus), et la recharge de la chaîne (`fig`) ne joue plus quand le vol porte une figure : la loi 6 paie.
   Ce qui se RAMASSE (pads, fruits, la LIGNE PARFAITE) et les gestes de la route (drift, frôlé, fronde…) ne changent pas : tenir le
   nitro « à fond tout le temps » reste le prix de la trajectoire parfaite — sur la ROUTE.
   ⚠ BLOC PUR : ne lit que ses arguments et NITRO2 — le banc de simulation l'exécute tel quel, hors du jeu. Tous les réglages du
   réservoir vivent dans NITRO2, nulle part ailleurs.
   ========================================================================== */
const NITRO2={
  regen:.2,                // la jauge se refait seule (/s), réacteur allumé ou non
  seuil:.3,                // éteint, il ne se rallume qu'à partir de là (anti-clignotement)
  conso:1,                 // ce que le réacteur brûle (/s)
  coup:.12,                // l'allumage EN VOL (le coup de réacteur) : 12 % de la jauge
  pose:{pct:.2,plein:1.2}, // la pose : 20 % de la jauge, pleine à partir de 1,2 s de vol (loi 2)
  fig:{base:.45,par:.12,max:1.2}, // la figure posée : ,45 + ,12 par × de la chaîne, plafond 1,2 (puis ×1,5 parfaite · ×2 divine)
  figN:{cout:.2,rend:.4},  // (2026-10-17, Sacha — loi 6) LA FIGURE SE PAIE : 20 % de la jauge au lancement, 40 % rendus PAR FIGURE plantée à la pose réussie (avant : figAir, le plein tout de suite à la plantée) — (2026-10-18, Sacha : « on peut faire -20 +40 ») 30 → 40 % : +20 % net par figure posée, au lieu de +10 % qu'on ne sentait pas
  bump:{q:.35,k:.6,n:4},   // le bump : ,35 · ,21 · ,13 · ,08 puis rien (loi 3)
  rase:.22                 // le rase-bord (/s), nitro coupée seulement (loi 5)
};
// la part du vol faite NITRO COUPÉE (1 = tout le vol, 0 = réacteur tenu d'un bout à l'autre)
function nitroPartDe(volT,nitT){return volT>1e-3?Math.max(0,Math.min(1,1-nitT/volT)):1;}
// ce que rend la POSE d'un vol de `volT` s dont `nitT` s réacteur allumé, pour une jauge de `cap`
function nitroPoseDe(cap,volT,nitT){return NITRO2.pose.pct*cap*Math.min(1,volT/NITRO2.pose.plein)*nitroPartDe(volT,nitT);}
// ce que rend la FIGURE posée (× de la chaîne `mult`, grade de pose `g` : 1 · 1,5 parfaite · 2 divine)
function nitroFigDe(mult,g,volT,nitT){return Math.min(NITRO2.fig.max,NITRO2.fig.base+mult*NITRO2.fig.par)*(g>=2?2:g>=1.5?1.5:1)*nitroPartDe(volT,nitT);}
// ce que rend le n-ième BUMP du vol (`nit` : réacteur allumé à l'impact)
function nitroBumpDe(n,nit){return nit||n>NITRO2.bump.n?0:NITRO2.bump.q*Math.pow(NITRO2.bump.k,Math.max(0,n-1));}
// ce que le réacteur brûle pendant `dt` (`kFren` : la part de la frénésie, FLOW2.fren.nitro)
function nitroConsoDe(dt,kFren,fren){return dt*NITRO2.conso*(fren?kFren:1);}
// le réacteur TIENT-il ? `res` = ce qui reste (jauge + réserve bleue) · `take` = ce que brûle cette image · `on` = il était allumé
function nitroTientDe(res,take,on){return on?res>Math.max(.005,take):res>NITRO2.seuil;}
/* <<<FIN NITRO2>>> ========================================================== */
const NIT={vol:0,nit:0}; // le vol en cours : sa durée (s), et le temps passé réacteur allumé — remis à zéro par startFall
/* LE GRAND LIVRE (2026-10-01) — chaque gain de nitro, d'argent, d'aura et de flow compté À SA SOURCE, pour caler l'équilibrage sur une
   mesure. FERMÉ par défaut (un test par appel, zéro allocation) ; `dbgLivre('ouvre')` l'ouvre et le remet à zéro, `dbgLivre()` le lit.
   Clés : `n+:src` nitro créditée · `n0:src` nitro offerte mais perdue (jauge pleine) · `n-:…` nitro brûlée · `$:src` argent ·
   `a:…` aura versée au compteur · `ab:famille` points de chaîne avant le × · `f:famille` flow réellement gagné. */
const LIVRE={on:false,t:0,tN:0,tV:0,d:{}};
function livre(k,q){if(!LIVRE.on||!(q>0))return;LIVRE.d[k]=(LIVRE.d[k]||0)+q;}
function nitroPct(p,src){nitroGain(p*((ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2),src);} // (2026-09-26) une PART de la jauge (0,2 = 20 %), quel que soit le moteur
// LE PLEIN = la capacité du MOTEUR (2,0 → 3,6). Tout ce qui « remplit la jauge » passe par ici : écrit `nitroR=2` en dur,
// un portail ou une NITRO INFINIE VIDAIENT un réservoir de 3,6 (porté de la lignée car-crash, 2026-09-28).
function nitroCap(){return (ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2;}
function nitroGain(q,src){
  if(!(q>0))return;const mx=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2;
  const av=nitroR;nitroR=Math.min(mx,nitroR+q);
  if(LIVRE.on){livre('n+:'+(src||'?'),nitroR-av);livre('n0:'+(src||'?'),q-(nitroR-av));}
  if(nitroR>av+.03&&!volgNitro('r',nitroR-av))nbPrend('r'); // (2026-10-12, Léo) elle FLOTTE puis tombe dans la barre (plus de flash blanc sur toute la barre, km/h compris)
}
function runxReset(){m2Raz();/* (2026-10-16) LES MISSIONS v2 : une partie neuve */flowReset();ecoDebutMaj(); /* (2026-10-14, GAMEPLAY) le relèvement du début se décide ICI, une fois par partie (voir ECOD) */jourMaj(); /* (2026-10-14, GAMEPLAY) …et le ×2 du jour juste après : ECOD.k = le MAX des deux, jamais le produit (voir JOUR) */RUNX.best0=best; // le record d'AVANT la partie : c'est lui que l'écran de mort doit battre
RUNX.coins=RUNX.fruits=RUNX.perfect=0;RUNX.t=RUNX.nitro=0;RUNX.fren=RUNX.frenMax=0;
  RUNX.pwr=RUNX.miracles=RUNX.sfMax=0;RAM.n.fill(0);RAM.ok=false;/* (2026-09-30) le ramassage (dbgRamasse) */try{grisantRaz();}catch(e){} // (2026-09-28) pouvoirs v2 et petits trucs grisants
  try{RUNX.engAvant=(SAVE.d.ex&&SAVE.d.ex.eng)|0;}catch(e){RUNX.engAvant=0;} // le meilleur moteur AVANT la partie : l'écran de fin dit « RECORD ! » s'il est battu
  try{RUNX.bank0=bank();}catch(e){RUNX.bank0=0;}RUNX.verse=null;chanceRaz();} /* (2026-10-14) une partie neuve, une SECONDE CHANCE neuve */ // la banque AVANT la partie : l'écran de mort remplit la barre depuis là
function ecoRond(v){if(v<100)return Math.max(10,Math.round(v/10)*10);const p=Math.pow(10,Math.floor(Math.log10(v))-1);return Math.round(v/p)*p;} // 2 chiffres qui se lisent : 3 125 → 3 100 (le cadeau de l'accueil, CADO)
/* (2026-10-14) LES CARNETS POP (10 à 12) sont arrivés APRÈS la suite sans fin : un joueur déjà au-delà les a relevés avec d'autres défis —
   on lui remet leur habillage, une fois (sinon il ne pourrait plus jamais l'avoir). */
const CARNETS_POP=[{cat:'aile',id:'phenix'},{cat:'trainee',id:'foudre'},{cat:'peinture',id:'guerrier'}]; // les récompenses des carnets 10 à 12 (2026-10-18 : les carnets sont retirés, il ne reste que ce cadeau)
function popCarnets(s){if(!s.pop){s.pop=1;if(s.n>=9&&s.n<12){s.ok=[0,0,0];s.best=[0,0,0];s.f=-1;s.w=null;}SAVE.mark();} /* (2026-10-14, chasse aux bugs) un joueur AU carnet 10-12 au moment de la mise à jour gardait les coches et meilleurs essais du carnet de la suite sans fin qui occupait cette place : remis à zéro UNE fois (`pop`, gardé par san) */
  const o=SAVE.d.shop&&SAVE.d.shop.own;if(!o)return;let n=0;for(let i=9;i<12;i++){const r=CARNETS_POP[i-9];
  if(s.n>i&&r.cat){const k=r.cat+':'+r.id;if(o.indexOf(k)<0){o.push(k);n++;}}}if(n)SAVE.mark();}
function misPop(){const s=SAVE.d&&SAVE.d.mis;if(s&&typeof s==='object')try{popCarnets(s);}catch(e){}} // (2026-10-18) une fois, par m2Etat : seule une sauvegarde qui a des carnets est concernée
function misOn(){return started&&!gameOver&&!SANDBOX&&!PARK.on;}
function misTick(dt){ // appelée par la boucle : le temps et la nitro de la partie (les compteurs des missions v2 les lisent)
  if(!misOn()){if(misTick._f!==0){misTick._f=0;try{m2FocusMaj();}catch(e){}}return;} // (2026-09-30) la mission suivie s'éteint hors course
  RUNX.t+=dt;if(nitroOn)RUNX.nitro+=dt;}
// LA BANNIÈRE DE CONTRAT : descend du haut de l'écran, 2,4 s — le jeu continue dessous
// LA BANNIÈRE DE SUCCÈS (v2, 2026-09-25 — « pas jolie, fais beaucoup mieux et moderne ») : une carte de verre sombre,
// la pastille-icône qui s'allume à gauche, deux lignes (ce qu'on a fait, en clair, jamais tronqué) et la prime en pilule
// d'or. Elle entre en rebondissant sous le HUD, un reflet la traverse, elle s'efface sur place.
/* LE CRÉNEAU DU HAUT D'ÉCRAN (2026-09-25) : moteur, défi et permis visaient la même bande sous l'encoche, sans se parler —
   une réception qui franchit un palier ET valide un défi posait la bannière PAR-DESSUS la carte moteur, au meilleur moment.
   Une carte à la fois, les autres en FILE. Piloté par événements uniquement : rien dans la boucle. */
/* (vague 2, 2026-09-26) LA FILE UNIQUE DU COULOIR — H2 du directeur artistique : « cinq voix au même instant » (captures gt1-11/12/16 :
   NOUVEAU RECORD ×2 + PALIER 3 + AURA + la liste + « 3 CYLINDRES » ; RECORD BATTU sur NIVEAU 2 ; le dernier geste pendant l'explosion).
   Les grandes annonces (`slam`), la carte MOTEUR, la bannière de NIVEAU et les cartes de DÉFI/ASTUCE passent TOUTES par ici :
   · une seule voix à la fois dans le couloir `--laneA` ;
   · une PRIORITÉ : 3 = record / mort · 2 = moteur, défi réussi, pouvoir · 1 = niveau, astuce, encaissement · 0 = geste (BOOST, ×n) ;
   · un TEMPS DE LECTURE garanti (`min`) : avant, seule une voix plus forte peut couper ; après, la suivante passe ;
   · une PATIENCE (`ttl`) : un BOOST qui attendrait 2 s ne voudrait plus rien dire — il se tait ; un défi, un moteur attendent leur tour ;
   · deux événements à moins d'une seconde FUSIONNENT : la carte MOTEUR prend le ruban « RECORD BATTU » au lieu de deux annonces ;
   · l'explosion VIDE tout (`hautVide()` en tête d'`explode`). Toujours piloté par événements : rien dans la boucle.
   · (2026-09-30) un VERROU (`ferme`) : pendant son temps de lecture, PERSONNE ne coupe la voix en place, même plus forte (la bannière
     de niveau à promesse, voir lvlAnnonce — la mort seule passe : hautVide) ; un record qui arrive derrière voit sa patience
     allongée d'autant. */
const HAUT={fin:0,q:[],t:0,cur:null};
const HAUT_MIN={slam:450,rec:1000,eng:900,lvl:1400,mis:2000};   // le temps de lecture garanti de chaque famille (ms)
const HAUT_TTL=[450,900,1500,3000];                               // combien de temps une annonce accepte d'ATTENDRE, par priorité
const HAUT_COUPE={ // faire taire la voix qui occupe le couloir (la suivante prend sa place)
  slam:function(){const e=avE('slam9');if(e)e.classList.remove('on');document.body.classList.remove('slamOn');},
  rec:function(){HAUT_COUPE.slam();},
  eng:function(){engPlonge();},                                   // couper la carte moteur = le moteur PLONGE dans la caisse, tout de suite
  lvl:function(){const b=document.getElementById('lvlBan');if(b)b.classList.remove('on');clearTimeout(lvlBanT);},
  mis:function(){const b=document.getElementById('misBan');if(b)b.classList.remove('on');clearTimeout(misBanMontre._t);}
};
function hautPasse(f,ms,k,p,o){ // f affiche · ms = le temps où elle occupe le couloir · k = sa famille · p = sa priorité · o = {ru (ruban), min, ttl, ferme}
  o=o||{};p=p==null?(k==='eng'?2:1):p;
  const n=performance.now(),g=k==='eng'||k==='mis',
    it={f:f,ms:ms,k:k,p:p,q:n,s:0,ru:o.ru||null,garde:g,ferme:!!o.ferme,min:o.min!=null?o.min:(HAUT_MIN[k]||450),
        ttl:o.ttl!=null?o.ttl:(g?9e9:k==='lvl'?4500:HAUT_TTL[Math.max(0,Math.min(3,p))])};
  if(hautFusion(it,n))return;
  if(g&&TUTO.on){HAUT.q.push(it);return;} // l'auto-école garde le haut pour elle : tutoFin relâche la file
  const c=HAUT.cur;
  if(hautCede(c,p,n)){hautMontre(it,n);return;}
  if(c.ferme&&it.k==='rec')it.ttl=Math.max(it.ttl,c.s+c.min-n+400); // un RECORD derrière un verrou : il patiente jusqu'au bout (3 s de patience, 3 s de verrou)
  HAUT.q.push(it);hautArme();
}
function hautCede(c,p,n){return !c||n>=HAUT.fin||n>=c.s+c.min||(p>c.p&&!c.ferme);} // la voix en place laisse-t-elle passer une annonce de priorité p ? (`ferme` : pas même une plus forte avant la fin de son temps de lecture)
function hautMontre(it,n){
  const c=HAUT.cur;if(c&&c!==it&&n<HAUT.fin)try{HAUT_COUPE[c.k]();}catch(e){}
  HAUT.cur=it;it.s=n;HAUT.fin=n+it.ms;
  try{it.f(it);}catch(e){}
  hautArme();
}
function hautMeilleur(n){ // la plus forte d'abord, puis la plus ancienne ; celles dont la patience est épuisée se taisent
  let b=null;
  for(let i=HAUT.q.length-1;i>=0;i--){const it=HAUT.q[i];
    if(it.garde&&TUTO.on)continue;
    if(n-it.q>it.ttl){HAUT.q.splice(i,1);continue;}
    if(!b||it.p>b.p||(it.p===b.p&&it.q<b.q))b=it;}
  return b;
}
function hautArme(){clearTimeout(HAUT.t);
  const n=performance.now(),b=hautMeilleur(n);if(!b)return;
  const c=HAUT.cur;
  let at=n;
  if(c&&n<HAUT.fin&&(b.p<=c.p||c.ferme)){at=c.s+c.min;if(at>=HAUT.fin)at=HAUT.fin+120;} // la voix en place a droit à son temps de lecture (verrouillée : même face à plus fort)
  HAUT.t=setTimeout(function(){
    const n2=performance.now(),b2=hautMeilleur(n2);if(!b2)return;
    const c2=HAUT.cur;
    if(hautCede(c2,b2.p,n2)){HAUT.q.splice(HAUT.q.indexOf(b2),1);hautMontre(b2,n2);}else hautArme();
  },Math.max(0,at-n));
}
function hautFusion(it,n){ // un RECORD et un MOTEUR à moins d'une seconde l'un de l'autre : une seule carte, le moteur portant le ruban
  const c=HAUT.cur,vit=c&&n<HAUT.fin;
  if(it.k==='rec'){
    if(vit&&c.k==='eng'&&n-c.s<1000&&engBig.on&&!engBig.plonge){engRuban(it.ru);return true;}
    for(const w of HAUT.q)if(w.k==='eng'&&n-w.q<1000){w.ru=it.ru;w.p=3;return true;}
  }else if(it.k==='eng'){
    for(let i=HAUT.q.length-1;i>=0;i--){const w=HAUT.q[i];if(w.k==='rec'&&n-w.q<1000){it.ru=w.ru;it.p=3;HAUT.q.splice(i,1);}}
    if(vit&&c.k==='rec'&&n-c.s<1000){it.ru=c.ru;it.p=3;hautMontre(it,n);return true;} // la carte remplace l'annonce du record, ruban compris
  }
  return false;
}
function hautVide(){ // l'explosion, l'écran de mort : plus personne ne parle — la file se vide ET la voix en place se tait
  /* (2026-09-28) PENDANT L'AUTO-ÉCOLE l'explosion n'est qu'un raté : les cartes GARDÉES pour après la leçon (`garde` : défi réussi,
     moteur — la prime est déjà versée) restent dans la file, tutoFin les relâchera. Seules les voix de l'instant se taisent. */
  if(TUTO.on){for(let i=HAUT.q.length-1;i>=0;i--)if(!HAUT.q[i].garde)HAUT.q.splice(i,1);}else HAUT.q.length=0;
  clearTimeout(HAUT.t);
  const c=HAUT.cur;if(c&&performance.now()<HAUT.fin)try{HAUT_COUPE[c.k]();}catch(e){}
  HAUT.cur=null;HAUT.fin=0;engBigCoupe();
  const p=document.getElementById('popTxt');if(p)p.classList.remove('on','on2');popTexte._s=0; // le dernier geste ne survit pas à la caisse (gt1-16)
  try{m2LigneVide();}catch(e){} // (2026-10-17) la ligne des missions du bas se tait avec les autres (l'écran de mort les récapitule)
}
function misBanniere(titre,texte,prime,ico){hautPasse(function(){misBanMontre(titre,texte,prime,ico);},titre==='ASTUCE'?2800:1800,'mis',titre==='ASTUCE'?1:2);} // un défi payé vaut un moteur ; une astuce, un niveau
function misBanMontre(titre,texte,prime,ico){
  try{if(SONV2&&titre==='MISSION RÉUSSIE')sfx('ui.mission');}catch(e){} /* (débogage son 2026-09-29) pendant l'auto-école la bannière attend la fin : le son l'attend aussi */
  let b=document.getElementById('misBan');
  if(!b){b=document.createElement('div');b.id='misBan';b.setAttribute('role','status');document.body.appendChild(b);hasMaj();} // hasMaj : la bannière née, son état se suit (voir HAS_D)
  b.innerHTML='<i class="mbIco">'+pxi(ico||'coche')+'</i><div class="mbTx"><small>'+TR(titre)+'</small><span>'+texte+'</span></div>'
    +(prime?'<b class="mbPrime">'+prime+'</b>':'');
  b.classList.toggle('astuce',titre==='ASTUCE'); // (vague 2) l'astuce parle en cyan (l'information), le défi en vert (la validation)
  b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
  // (2026-09-28, Sacha : « les fenêtres de défi prennent trop d'espace et restent trop longtemps, c'est dangereux ») : un DÉFI se lit
  // d'un coup d'œil (1,6 s) ; une ASTUCE est une phrase, elle garde le temps de se lire (2,6 s) — c'était 2,8 s pour tout
  clearTimeout(misBanMontre._t);misBanMontre._t=setTimeout(function(){b.classList.remove('on');},titre==='ASTUCE'?2600:1600);
}
/* ---------------- L'OBJECTIF ---------------- */
/* (2026-09-28, charte v5) LA VIGNETTE DE L'OBJECTIF : « TU PEUX TE L'OFFRIR — MENTHE » ne vendait rien sans image. Même dessin que les
   vignettes du garage (photo de studio pour une caisse, nuancier pour une peinture, ruban pour une traînée, aile pour une aile). */
function objFig(o){ try{
  const hx9=function(c){return '#'+((c>>>0)&0xffffff).toString(16).padStart(6,'0');},rg9=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
  if(o.car!=null){const ph=carPhoto(o.car);return '<i class="obFig">'+(ph?'<img src="'+ph+'" alt="">':pxi('voiture'))+'</i>';}
  const d=COSM[o.cat]&&COSM[o.cat][o.i];if(!d)return '';
  if(o.cat==='peinture')return '<i class="obFig"><b class="obSw'+cosmSwCl(d)+'" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(160deg,'+d.grad.map(hx9).join(',')+')':hx9(d.c||0))+'"></b></i>';
  if(o.cat==='trainee')return '<i class="obFig"><b class="obRub" style="color:'+(d.rgb?rg9(d.rgb):'#ff8a24')+';background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg9(d.rgb):'#ff6a14')+' 35%,#fff 100%)')+'"></b>'+pxi('voiture')+'</i>'; // (2026-09-28) le ruban part d'une caisse : sans elle, une barre qui flotte
  return '<i class="obFig">'+pxi('aile')+'</i>';
}catch(e){return '';} }
/* LE STUDIO PHOTO (2026-09-25) : chaque caisse premium est CONSTRUITE, photographiée hors écran sous un éclairage de
   studio (clé froide, contre-jour rose, plancher de lumière violet), puis rendue au jeu. On emprunte `carGroup` — la
   seule caisse qui existe — et on reconstruit la caisse équipée à la fin : jamais pendant une partie (la boutique est un
   écran de menu). Les photos sont gardées en mémoire pour la session (une caisse ne se photographie qu'une fois). */
const PHOTO={cache:{},rt:null,scene:null,cam:null};
/* LES PHOTOS GARDÉES (2026-10-16, « la boutique rame de ouf ») — chaque photo du studio (caisse, aile, figure) est rangée dans la base du
   navigateur (IndexedDB `ccPhotos`) avec sa SIGNATURE : la version publiée (CC_BUILD) et la peinture portée (elle colore toute caisse bâtie).
   Au lancement, celles de cette version et de cette peinture reviennent dans PHOTO.cache (adresses blob:, rien à recalculer) ; les autres
   versions s'effacent. Copie locale (jeton CC_BUILD non gravé) : rien n'est gardé — les caisses y changent sans changer de version. */
const PHDB={db:null,n:0};
function phdbSig(){let p='';try{const d=cosmSur('peinture');p=d&&d.id||'';}catch(e){}return CC_BUILD+'|'+p;}
function phdbOuvre(){if(PHDB.db!==null)return;PHDB.db=false;if(/^__/.test(CC_BUILD)||!window.indexedDB||!window.URL||!URL.createObjectURL)return;
  try{const r=indexedDB.open('ccPhotos',1);r.onupgradeneeded=function(){try{r.result.createObjectStore('p');}catch(e){}};
    r.onsuccess=function(){PHDB.db=r.result;phdbLit();};r.onerror=function(){PHDB.db=false;};}catch(e){PHDB.db=false;}}
function phdbLit(){try{const sig=phdbSig(),st=PHDB.db.transaction('p','readwrite').objectStore('p'),q=st.openCursor();
  q.onsuccess=function(){const cu=q.result;if(!cu)return;const v=cu.value,k=cu.key;
    if(!v||String(v.s).split('|')[0]!==CC_BUILD)cu.delete();
    else if(v.s===sig&&v.b&&!PHOTO.cache[k]){try{PHOTO.cache[k]=URL.createObjectURL(v.b);PHDB.n++;}catch(e){}}
    cu.continue();};}catch(e){}}
function phdbEcrit(ck,b,sig){if(!PHDB.db||!b)return;try{PHDB.db.transaction('p','readwrite').objectStore('p').put({s:sig,b:b},String(ck));}catch(e){}}
setTimeout(function(){try{phdbOuvre();}catch(e){}},700);
// une photo de STUDIO : ailes de vol rentrées, ni halos, ni flaques de phares, ni plumes de réacteur — la carrosserie, les roues, point
function photoPropre(){if(carWingL){carWingL.visible=false;carWingR.visible=false;}
  carGroup.traverse(o=>{if(o.isSprite||(o.isMesh&&!(o.userData&&o.userData.lp)&&o.material&&(o.material.transparent||o.material.blending===THREE.AdditiveBlending)))o.visible=false;});}
/* LE STUDIO PHOTO v2 (2026-09-30, Sacha, capture de la boutique : « pourquoi ces photos sont aussi moches ») — MESURÉ sur l'ancien : la caisse
   était tournée PILE face à l'objectif (rotation .72 pour une caméra à .70 d'azimut : on la voyait de face, écrasée), photographiée en
   360 × 220 puis affichée deux fois plus grand sur un écran Retina (flou, escaliers), sous une ambiance à 1,25 et une clé à 1,3 que la
   relève de 1/1,35 brûlait (les jaunes et les verts fluo sortaient en aplat). Désormais une PHOTO DE CATALOGUE : trois-quarts avant, le nez
   vers la gauche, objectif long (24°, pas de déformation), un peu plongeant ; cadrage CALCULÉ sur la boîte de la caisse (elle remplit le
   cadre, qu'elle soit une formule plate ou un monster truck) ; rendue en ×2 puis réduite (bords nets) ; une clé chaude, deux contre-jours
   (rose, cyan) qui la DÉTOURENT, peu d'ambiance (du modelé) ; une relève douce avec une ÉPAULE (les couleurs vives gardent leur dégradé) ;
   une ombre de contact et le reflet d'un sol verni sous les roues. Mêmes appels, même cache : garage, missions et boutique en profitent. */
const PHOTO_W=720,PHOTO_H=440,PHOTO_SS=2,PHOTO_ROT=-.12,PHOTO_AZ=.70,PHOTO_EL=.27;
const PHOTO_AILE={el:1,az:.15}; // (2026-10-15) une aile se photographie DE FACE et d'en haut (57°) : les deux ailes s'ouvrent à gauche et à droite, comme un avion qui arrive (dbgAile pour régler ; essayé de trois quarts : la caisse mangeait la photo)
