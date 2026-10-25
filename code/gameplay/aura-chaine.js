/* ===== L'AURA v2 — LA CHAÎNE (2026-09-26, user : « on ne voit pas le compteur d'aura ni clairement quelle figure rapporte combien
   de points ; invente tout un système avec des multiplicateurs quand tu enchaînes ») =====
   UNE chaîne, au sol comme en l'air. Chaque geste de style y entre avec SES points, écrits à l'écran (« 360° +45 ») ; chaque
   geste DIFFÉRENT ajoute ×1 au multiplicateur (plafond ×10) ; refaire le même rapporte 30 % de moins à chaque fois et ne fait
   pas monter le ×. La chaîne reste ouverte tant qu'on enchaîne : 3,5 s AU SOL pour placer le geste suivant, horloge GELÉE en
   l'air (le vol EST l'enchaînement). Quand le temps tombe, elle s'ENCAISSE d'un coup : points × multiplicateur, dans le compteur
   (en haut à droite, toujours visible). Exploser la chaîne ouverte = tout perdre. Barème (base, avant ×) :
     AIR : 180° de vrille +45 par demi-tour · BIG AIR +50 · AIR MONSTRE +110 · MÉTÉORE +100 · DAUPHIN +80 (+ ce qu'il monte en direct) · BUMP +30
     POSE : PARFAITE +70 · DIVINE +120 · GAP +120 · ARRACHÉE +120 · AU CHEVEU +220
     ROUTE : VIRAGE SERRÉ +45 · FRÔLÉ/SLALOM +20 · RASE-BORD +40 · MINI/SUPER/ULTRA TURBO +50/100/180 · RÉCOLTE +30 · PURE SPEED +120 */
/* (2026-10-01, Sacha : « rends parfait tout le gameplay : l'argent gagné, le flow, l'aura, le nitro ») LA CHAÎNE SE FERME.
   MESURÉ (LE GRAND LIVRE, pilote de mesure, 45 s) : sur la route comme dans la boucle décoller / se poser, AUCUNE chaîne n'était
   encaissée — la RÉCOLTE (toutes les 5 pièces), la RAFALE de fruits et les paliers de NITROOO (toutes les 2 s) relançaient les 3,5 s
   sans fin, et en vol l'horloge est gelée. Deux issues, toutes deux fausses : mourir chaîne ouverte = « AURA 0 » à l'écran de fin ;
   ou encaisser d'un coup une chaîne à ×10 gonflée par ces robinets (~100 points par seconde × 10 : un rang MYTHE en une minute).
   · LES ROBINETS SORTENT DE LA CHAÎNE (`rob`, 6e argument de chaineAura : RÉCOLTE, RAFALE, paliers de NITROOO, et la NAGE du dauphin —
     « DAUPHIN EN VOL ») : ce qui coule en continu tombe DIRECTEMENT dans le compteur, sans ×, sans relancer l'horloge. La chaîne ne
     porte plus que des GESTES (figure, drift, frôlé, fronde, pose…) : eux seuls la gardent en vie et font monter le ×. MESURÉ avec les
     robinets encore dans la chaîne (boucle de sauts au ras de la route, 0 mort) : 34 600 d'aura encaissée en 26 s — la nage du dauphin
     (4 100 points) multipliée par ×7 ; un rang MYTHE en 40 s.
   · LEUR TARIF EST RECALÉ sur leur fréquence d'aujourd'hui (LA LIGNE PARFAITE pose un fruit toutes les 2,4 s et tient la NITROOO) :
     RÉCOLTE 30 → 20 · RAFALE 40+30r → 15+6r · palier de NITROOO 60+40p → 15+8p. Mesuré avant : ces trois-là faisaient 76 % des points
     de chaîne de la route (5 300 sur 6 990 en 48 s), loin devant les gestes.
   · UNE CHAÎNE VIT `CHA_VIE` SECONDES AU PLUS (vol compris) : passé ce temps elle s'encaisse au sol — tout de suite si on roule, à la
     pose si on vole (exploser avant = perdue, la règle ne change pas). On ne joue plus toute une partie sur une seule chaîne : on
     risque au plus CHA_VIE secondes de gains, et le ×10 redevient un exploit (dix gestes différents en 25 s). */
const CHA={pts:0,x:0,fam:{},n:0,t:0,age:0,liste:[],v:0,vAff:-1,rec:0,recB:false,recP:-1,urg:false},CHA_FEN=3.5,CHA_XMAX=10,CHA_VIE=25;
let trkBigA=false,trkMonstre=false,virT=0,virPaye=false,virC=0,virD=false;
const avEl={};
function avE(id){return avEl[id]||(avEl[id]=document.getElementById(id));}
/* (2026-09-28, nuit — Sacha : « réduis la taille des HUD, c'est compliqué de voir la route ») l'échelle des ANNONCES (slam, verdict, geste sur la
   caisse) : un cran plus douce que celle du tableau de bord (--hudK, <style id="hudTaille">) — ce sont les moments de fête, ils restent gros,
   mais ne couvrent plus la caisse. Couché (l'ordi, un téléphone tourné) : plus petit encore. Même seuil que la media du paysage. */
/* (2026-09-29, 3e verdict — Sacha : « les textes de figure sont beaucoup trop gros et bloquent la vue ») encore un cran : .82/.72 → .60/.52 pour
   les annonces du couloir (BOOST, ×8 DÉMENT, +AURA, CHAÎNE PERDUE, IMPACT MÉTÉORE…), .72/.62 → .56/.48 pour les textes de figure. */
function annK(){return (VP.w>VP.h&&VP.h<=540)?.52:.60;}
/* (même nuit, Sacha : « c'est surtout les textes de figure et de MONSTRE qui dérangent ») les TEXTES DE FIGURE — le geste qui suit la caisse
   (popTexte) et le verdict de pose (MONSTRE, MÉTÉORE…) — un cran plus petits que les annonces : ils passent SUR la route, souvent. */
function figK(){return (VP.w>VP.h&&VP.h<=540)?.48:.56;}
function fmtAura(n){return Math.round(n).toLocaleString(LOC()).replace(/[  ]/g,' ');} // (2026-09-28) au format de la LANGUE (« 12,500 » en anglais), et des espaces que la police pixel sait dessiner
function sansAcc(t){return String(t).normalize('NFD').replace(/[̀-ͯ]/g,'');} // la police pixel n'a pas de capitales accentuées (« MÉTÉORE » s'afficherait « MéTéORE »)
/* (2026-09-29, Sacha : « liste des textes qui s'affichent au milieu de l'écran, il y en a trop » — il a rayé les n° 1 VIRAGE SERRÉ,
   2 FRÔLÉ, 4 PORTE, 5 RASE-BORD, 13 MINI/SUPER/ULTRA TURBO, 29 les pastilles sous le verdict). Le geste rapporte toujours son aura (le
   compteur en haut à gauche monte) ; il ne s'ÉCRIT plus au-dessus de la caisse. */
/* LA FRONDE (2026-09-30, Sacha : « trouve des moyens de rendre le jeu plus fun quand tu roules »). Mesuré au pilote auto (route-journal.js,
   moteur 8, 90 s au sol) : ~290 événements par minute, jamais plus de 2,5 s sans rien — la route ne manque pas d'ÉVÉNEMENTS. Ce qui manquait :
   que bien PILOTER rende de la VITESSE qu'on sent. Le VIRAGE SERRÉ (charge latérale > 32 tenue 0,9 s) ne rendait que de l'aura muette.
   Désormais, pris SANS GLISSER, il catapulte à la SORTIE (la charge retombe sous 12) : élan, flamme d'or, champ qui s'ouvre, son de fronde.
   Sa force monte avec la TENUE (0,9 → 2,7 s) et avec la CORDE (le temps passé sur la moitié intérieure du virage, au-delà de 20 % de la
   demi-route) : l'intérieur, c'est la ligne de course. Deux styles, deux paiements : le drift a son MINI-TURBO, l'adhérence sa FRONDE
   (un virage où l'on a glissé — drift, flaque — ne tire pas). Aucun texte au centre : l'aura passe par la chaîne muette. */
const FRONDE={on:true,dv:16,k0:.9,kT:1.8,corde:.6,cd:0,n:0,pMax:0};
function frondeLache(t,c){
  if(!FRONDE.on||introD||PARK.on||mode!=='drive'||FRONDE.cd>0||!(vA>8)||!running||gameOver)return;
  const k=THREE.MathUtils.clamp((t-FRONDE.k0)/FRONDE.kT,0,1),co=t>0?Math.min(1,c/t):0,p=(.4+.6*k)*(1+FRONDE.corde*co); /* 0,4 (tenu juste) → 1,6 (tenu long, à la corde) */
  vA+=FRONDE.dv*p;boost=Math.max(boost,.45+.45*p);momT=Math.min(4.3,momT+.6*p);nitroGain(.05+.07*p,'fronde'); /* un pad donne +18 : la fronde pleine en vaut une et demie */
  fovPunch=Math.max(fovPunch,5+6*p);shake=Math.max(shake,.1+.08*p);hap(p>1.1?[10,24,16]:[10,20]);
  flowAdd(4+6*p,'route');FRONDE.cd=.8;FRONDE.n++;FRONDE.pMax=Math.max(FRONDE.pMax,p);
  try{if(SONV2)sfx('fronde',{st:sonPd(Math.round(p*3))});else boostSnd(1+.2*p);}catch(e){}
  try{chaineAuraMuette('FRONDE',Math.round(30+40*p),'fronde',false,SONV2);}catch(e){}
  try{const sp9=CARS[level];for(const sd of [-1,1]){DRIFT_V.set(sd*sp9.w*.22,.43,-sp9.l*.5-.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,3+Math.round(3*p),7);}}catch(e){} /* la gerbe d'or aux pots : on la voit partir */
}
/* LE TRAIN DE BOOSTS (même demande) : les pads vivent sur trois voies (gauche, axe, droite) — les prendre TOUS, À LA SUITE, sans en rater
   un, pousse de plus en plus fort : +18 → +38 d'élan, la poussée dure plus longtemps, la plaque sonne un degré plus haut à chaque maillon
   (pentatonique), BOOST ×2, ×3… dans la MÊME annonce (pas de texte en plus). Un pad passé sans le prendre (à côté, ou survolé) casse le
   train : le suivant repart à ×1. Plafond de la poussée au 5e maillon ; le compte, lui, continue. */
const PADCH={on:true,n:0,sL:null,max:0};
function padTrain(sp){
  if(!PADCH.on)return 1;
  let rate=PADCH.sL==null||sp<PADCH.sL;
  if(!rate)for(let j=0;j<PADS.length;j++){const q=PADS[j];if(q>PADCH.sL+8&&q<sp-8){rate=true;break;}}
  PADCH.n=rate?1:PADCH.n+1;PADCH.sL=sp;if(PADCH.n>PADCH.max)PADCH.max=PADCH.n;
  return PADCH.n;
}
function chaineAuraMuette(nom,base,fam,brut,muet){const s9=CHA.sansPop;CHA.sansPop=true;try{return chaineAura(nom,base,fam,brut,muet);}finally{CHA.sansPop=s9;}}
function chaineAura(nom,base,fam,brut,muet,rob){ // rob : un ROBINET (récolte, rafale, palier de NITROOO, nage du dauphin) — payé au compteur, hors chaîne · brut : pas de décote de redite (les échelles qui grimpent déjà : vrilles, bumps) · muet : l'appelant sonne déjà (figure en vol, pose)
  if(!(base>0)||!running||gameOver||(typeof PARK!=='undefined'&&PARK.on))return 0;
  if(rob){ /* (2026-10-01) LE ROBINET : au compteur, tel quel — ni chaîne, ni ×, ni horloge (voir LA CHAÎNE SE FERME) */
    const p=Math.max(1,Math.round(base*auraDragonK()));auraRun+=p;livre('a:robinet.'+(fam||nom),p);auraPop=Math.min(1,auraPop+p/90);
    if(TCTL.on&&!CHA.sansPop&&!LEFIL.on)popTexte(sansAcc(TR(nom))+' +'+p,'#ffd75e',0); /* (LE FIL) un robinet est un flux : le compteur pulse (auraPop), rien ne s'écrit */
    if(!muet)try{chimeNote(noteP(1,1),0,.10,.16);}catch(e){}
    return p;}
  fam=fam||nom;const k=CHA.fam[fam]|0;CHA.fam[fam]=k+1;
  const p=Math.max(1,Math.round(base*(brut?1:Math.pow(.7,k))*auraDragonK())); // (pouvoirs v2) AURA ×2
  const x0=CHA.x;if(k===0)CHA.x=Math.min(CHA_XMAX,CHA.x+1);
  if(CHA.x>(runStats.xMax|0))runStats.xMax=CHA.x; // le meilleur × de la partie : l'écran de fin le montre
  if(!CHA.n)CHA.age=0;CHA.pts+=p;CHA.n++;CHA.t=CHA_FEN;livre('ab:'+fam,p);
  const lb9=sansAcc(TR(nom));CHA.liste.unshift(lb9+' +'+p);if(CHA.liste.length>2)CHA.liste.length=2; // (vague 2, H4) 2 lignes, la dernière en or : la mémoire de la chaîne, pas une 3e voix
  chaHud(true,CHA.x>x0);
  if(TCTL.on&&!CHA.sansPop)popTexte(lb9+' +'+p,CHA.x>x0?'#ff9ee6':'#ffd75e',0); // au-dessus de la caisse : le geste ET ce qu'il rapporte — (v5) sauf à la pose du dauphin : son récapitulatif parle seul
  if(!muet&&!(SONV2&&CHA.x>x0&&(CHA.x===5||CHA.x===8||CHA.x===10)))try{if(SONV2){if(mode==='fall')sfx('fig.maillon',{st:echSt()});else sfx('aura.geste',{st:sonPdAR(CHA.x)});}else chimeNote(noteP(Math.min(7,CHA.x),1),0,.10,.16);}catch(e){} // (console) en l'air, le geste prend l'échelle du vol ; au sol, la gamme de l'aura (marimba) — (2026-10-15) sonPdAR : ×10 jouait +24 (deux octaves), l'octave suffit
  if(pwrAurT>0)try{dragonJus();}catch(e){} // (fruit du dragon) chaque geste fait GICLER le fruit
  return p;
}
/* HUD v3 : LA GRANDE ANNONCE qui claque au centre haut (BOOST, pouvoirs, paliers du ×) — une seule à la fois, la dernière gagne */
function slam(txt,sous,c1,c2,taille,prio,fete){
  // (vague 2) l'annonce prend son tour dans la FILE DU COULOIR (hautPasse) : priorité 0 geste · 1 encaissement · 2 pouvoir · 3 impact ;
  // le compte à rebours de reprise (9) passe devant tout, sans attendre
  prio=prio|0;
  if(prio>=9){engBigCoupe();slamMontre(txt,sous,c1,c2,taille,fete);return;} // (la file garde ses cartes : elles passeront après la reprise ; la carte moteur, elle, a fini sa vie pendant la pause)
  hautPasse(function(){slamMontre(txt,sous,c1,c2,taille,fete);},1450,'slam',Math.min(3,prio));
}
function slamMontre(txt,sous,c1,c2,taille,fete){
  let e=avE('slam9');if(!e){e=document.createElement('div');e.id='slam9';e.setAttribute('aria-hidden','true');document.body.appendChild(e);avEl.slam9=e;}
  const t9=sansAcc(TR(txt)).replace(/[<>&"]/g,''),tl9=Math.min(Math.round((taille||36)*annK()),Math.floor((VP.w-28)*annK()/Math.max(1,t9.length))-2); // (HUD v4) police pixel = 1 em par lettre : l'annonce TIENT dans l'écran
  e.classList.remove('compte');
  e.innerHTML='<b style="font-size:'+tl9+'px" data-t="'+t9+'">'+t9+'</b>'+(sous?'<small>'+sansAcc(TR(sous)).replace(/[<>&]/g,'')+'</small>':''); // data-t : la LÈVRE claire en biseau (H9, voir le CSS)
  e.style.setProperty('--s1',c1||'#ffd75e');e.style.setProperty('--s2',c2||'#ff5ec8');
  e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  // (HUD v4) UNE voix au centre : tant que l'annonce passe, le niveau, le dauphin et les contrats du même couloir s'effacent
  document.body.classList.add('slamOn');clearTimeout(slam._h);slam._h=setTimeout(function(){document.body.classList.remove('slamOn');},1400);
  if(fete)setTimeout(function(){try{pixBurst(e.querySelector('b'),fete);}catch(x){}},140); // (2026-09-26) les annonces HEUREUSES éclatent en confettis pixel
}
function flashEcran(col){ // un coup de couleur sur les bords : le boost, le pouvoir, le gros encaissement
  /* (2026-09-30) « RÉDUIRE LES ANIMATIONS » (iOS) : 33 appels passent par ici — pouvoirs, cratère, record, pulsations de NITROOO toutes les
     0,62 s, rentrée d'orbite toutes les 0,45 s… Sous REDUCED_MOTION : UN coup par seconde au plus, et jamais plus de 40 % d'opacité
     (l'alpha de la couleur est plafonné). Rien ne change quand l'option est éteinte. */
  if(REDUCED_MOTION){const n=performance.now();if(n-(flashEcran._t||-1e9)<1000)return;flashEcran._t=n;
    col=String(col).replace(/rgba?\(([^,]+),([^,]+),([^,)]+)(?:,([^)]+))?\)/,function(m,r,g,b,a){return 'rgba('+r+','+g+','+b+','+Math.min(.4,a==null||!isFinite(+a)?1:+a)+')';});}
  let e=avE('flash9');if(!e){e=document.createElement('div');e.id='flash9';e.setAttribute('aria-hidden','true');document.body.appendChild(e);avEl.flash9=e;}
  /* (2026-10-14, OPTIMISATION — profil d'une course : 36 ms de « mise en page forcée » en 8 s de NITROOO, une toutes les 0,62 s) relancer
     l'animation en ALTERNANT deux animations identiques (flash9 / flash9b) au lieu de `void offsetWidth` : même coup de couleur, à la même
     image, sans recalcul synchrone de toute la page. */
  e.style.setProperty('--ff',col);if(e._vu)return;e._vu=1;Promise.resolve().then(function(){e._vu=0;}); // deux appels dans la même tâche = UNE relance (comme avant)
  const a9=e.classList.contains('on');e.classList.remove(a9?'on':'on2');e.classList.add(a9?'on2':'on');
}
