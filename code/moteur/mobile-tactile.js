// DÉTECTION MOBILE : IS_TOUCH / IS_MOBILE sont déclarés plus haut (bloc TRIPTYQUE) car le post-traitement s'en sert aussi
// ---------- LA VERSION TÉLÉPHONE : deux pouces, écran nu, coque d'écrans ----------
// ⚠ Rien ici ne réécrit une équation : le tactile pilote le MÊME objet `keys` et le MÊME `steer`
// que le clavier (voir `TCTL` et le `const target=` de la boucle). Le desktop ne bouge pas d'un
// pixel — tout est scopé sous body.touch. `?touch=1` force l'interface tactile sur ordinateur.
if(IS_MOBILE||/[?&]touch=1/.test(location.search)){
  document.body.classList.add('touch');
  TCTL.on=true;
  AUTO_GAS=true; // GAZ AUTOMATIQUE : deux pouces, pas trois — ça pousse tout seul, on gère la trajectoire
  TCTL.pad=false;SAVE.d.tctl='stick'; // ⚠ (2026-09-25) le réglage COMMANDES est retiré : tout le monde au VOLANT (un joueur resté sur « flèches » ne pourrait plus en sortir)
  setTimeout(function(){applyQ(SAVE.d.q==='fast');},0); // qualité d'image retenue (applyQ est défini plus bas dans ce bloc)
  document.body.classList.toggle('tpad',TCTL.pad);
  SANDBOX=BALADE;SAVE.d.sand=false; // ⚠ UN SEUL MODE (2026-09-25, user) : le bac à sable, le parc et le Survivant sont retirés de l'interface — une ancienne sauvegarde ne doit pas en rallumer un en douce
  const $t=function(i){return document.getElementById(i);};
  /* ===== MODE GAUCHER (2026-10-28, Léo : « une fonction gaucher pour les gauchers en jeu ») ===== le volant passe à DROITE, la NITRO et les flèches à
     GAUCHE (CSS `body.gaucher`). Le stick garde SA mécanique à l'identique : les x du pouce sont MIROITÉS dans le rectangle du volant (`sL+sR-x`) et le
     braquage lu est renversé — la place au bord, l'arc du pouce, le drift se retrouvent côté droit, comme une image dans un miroir. */
  let GAU=!!SAVE.d.gaucher; document.body.classList.toggle('gaucher',GAU);
  const nl=$t('nitroLbl'); if(nl)nl.textContent='NITRO';
  // ⚠ on écrit AUSSI dataset.fr : c'est lui que relit applyLangDOM à chaque bascule de langue —
  // sans ça, changer de langue faisait revenir « molette » sur un écran qui n'en a pas.
  const gh=$t('gHint'); if(gh){gh.textContent='glisse pour tourner · pince pour zoomer';gh.dataset.fr=gh.textContent;}
  // ---- BOUTONS : ils pilotent le MÊME objet `keys` que le clavier → aucune nouvelle physique ----
  function bindHold(el,code,onDown,vis){ if(!el)return; vis=vis||el; el._tenu=code; // `vis` : l'élément qui s'ENFONCE (la zone NITRO élargie enfonce le disque)
    const dn=function(e){ if(e.cancelable)e.preventDefault(); e.stopPropagation(); // un appui sur un bouton n'arme JAMAIS le volant
      if(!keys[code]){keys[code]=true;vis.classList.add('on');if(SENSG&&code==='Space'&&running&&!paused&&!gameOver&&mode!=='boom')vis._t9=performance.now();else hap(9);if(onDown)onDown();} }; // (2026-10-14, gameplay · accord) en course, la NITRO répond elle-même à l'image suivante (allumage [14,26,10], « à vide » 6, saut nitro, figure) : le tic d'appui (9) partait 16 ms avant — deux impulsions pour un seul appui. Il reste pour les flèches, et pour la nitro hors course
    const up=function(e){ if(e&&e.cancelable)e.preventDefault();
      if(e&&e.touches&&keys[code])for(let i=0;i<e.touches.length;i++){const c=e.touches[i].target;const b=c&&c.closest?c.closest('#tNitro,#tNitroZone,#tLeft,#tRight'):null;if(b&&b._tenu===code)return;} // (2026-10-14, chasse aux bugs) un AUTRE doigt tient encore cette commande (le pouce sur le disque NITRO, quand la paume quitte la zone élargie) : le lever d'un intrus ne coupe plus la nitro sous le pouce — même règle que le volant (2026-09-30)
      if(vis._t9){if((hap._t||0)<vis._t9)hap(9);vis._t9=0;} // (2026-10-14, accord) un appui plus bref qu'une image : la nitro n'a rien vu, rien n'a vibré — le tic d'appui part au lâcher (mesuré au banc : sinon, silence)
      if(code==='Space'&&keys[code]&&!figGlisseOn())veqDoigt(false); keys[code]=false; vis.classList.remove('on'); }; // (2026-10-14) le relâcher du doigt compte pour le TONNEAU — (2026-10-15) sauf en FIGURES › GLISSER (voir GLI)
    el.addEventListener('touchstart',dn,{passive:false});
    el.addEventListener('touchend',up,{passive:false});
    el.addEventListener('touchcancel',up,{passive:false});
    let ms9=false; el.addEventListener('mousedown',function(e){ms9=true;dn(e);}); addEventListener('mouseup',function(e){if(ms9){ms9=false;up(e);}}); // repli souris (test au clic, ?touch=1) — (2026-10-09) le relâcher ne lâche QUE le bouton pris à la souris : chaque fin de glissé du volant coupait la NITRO tenue à ESPACE (seuil de rallumage, impulsion de vol rebrûlée)
  }
  bindHold($t('tLeft'),'ArrowLeft',start);
  bindHold($t('tRight'),'ArrowRight',start);
  bindHold($t('tUp'),'ArrowUp',start); bindHold($t('tDown'),'ArrowDown',start); // (2026-10-27) FLÈCHES : l'assiette en vol, et le drift (bas) comme au clavier
  const nitroDown=function(){ if(!figGlisseOn())veqDoigt(true); if(boomSkip())return; start(); // (2026-10-15) en FIGURES › GLISSER, taper NITRO = booster, rien d'autre // (2026-10-14) l'appui compte pour le TONNEAU (double-tap) // NITRO + double-tap = BRAQUAGE (même règle que la barre ESPACE)
    if(started&&!gameOver){ const n9=performance.now();
      lastSpaceT=n9; } }; // (double-tap « DÉCOLLAGE » retiré)
  bindHold($t('tNitro'),'Space',nitroDown);
  bindHold($t('tNitroZone'),'Space',nitroDown,$t('tNitro')); // (2026-09-26, audit UX) le pouce qui dérive hors du disque touche encore la NITRO
  /* (2026-10-15) LA FIGURE AU GLISSÉ (voir GLI) : le point d'appui sur NITRO, le glissé, le lâcher. Écouteurs à part (passifs) : bindHold garde
     seul la nitro. Le doigt reste à l'élément où il s'est posé : on suit son glissé même hors du bouton. */
  /* (2e passe) LE COUP SEC : le doigt resté sur NITRO, un geste brusque (de 12 px à seuil + 8 px en moins de `GLI.coup` ms) lance la figure
     TOUT DE SUITE, sans lâcher (le boost continue) ; un seul par appui. → ET ↓ DE N'IMPORTE OÙ : sur la moitié DROITE de l'écran, hors des
     boutons, un glissé vers la droite ou le bas fait la figure sans passer par NITRO (`GLI.part` : ← ↑ y restent sans effet). */
  const gliDn=function(id,x,y,part){GLI.id=id;GLI.x0=x;GLI.y0=y;GLI.tq=0;GLI.fait=false;GLI.part=!!part;figGVoit(null);},
    gliDir=function(x,y){const d=figGDir(x-GLI.x0,y-GLI.y0);return d&&(!GLI.part||d===(GAU?'l':'r')||d==='d')?d:null;},
    gliMv=function(id,x,y){if(GLI.id!==id)return;if(!figGlisseOn()||GLI.fait){figGVoit(null);return;}
      const n=performance.now(),dist=Math.hypot(x-GLI.x0,y-GLI.y0),d=gliDir(x,y);if(!GLI.tq&&dist>=12)GLI.tq=n;
      if(d&&GLI.tq&&n-GLI.tq<=GLI.coup&&dist>=GLI.seuil+8){GLI.fait=true;figGVoit(null);GLI.req=d;GLI.reqT=n;GLI.coups=(GLI.coups|0)+1;return;}
      figGVoit(d);},
    gliUp=function(id,x,y){if(GLI.id!==id)return;GLI.id=null;const d=figGlisseOn()&&!GLI.fait?gliDir(x,y):null;figGVoit(null);
      if(d){GLI.req=d;GLI.reqT=performance.now();}},
    gliCoupe=function(){GLI.id=null;figGVoit(null);},
    gliLibre=function(x,t){return figGlisseOn()&&started&&!gameOver&&!paused&&GLI.id==null&&(GAU?x<=(VP.w||innerWidth)*.5:x>=(VP.w||innerWidth)*.5)&&document.body.classList.contains('play')
      &&!!t&&!!t.closest&&!t.closest('#tNitro,#tNitroZone,#tSteer,#tGear,#tSet,#tPanel,#tFig,#mob,#overlay,#garage,#modale,button,input,a,[role=button],.pbtn,.tbtn');};
  [$t('tNitro'),$t('tNitroZone')].forEach(function(el){if(!el)return;
    el.addEventListener('touchstart',function(e){const t=e.changedTouches[0];if(t)gliDn('t'+t.identifier,t.clientX,t.clientY);},{passive:true});
    el.addEventListener('touchmove',function(e){for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];gliMv('t'+t.identifier,t.clientX,t.clientY);}},{passive:true});
    el.addEventListener('touchend',function(e){for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];gliUp('t'+t.identifier,t.clientX,t.clientY);}},{passive:true});
    el.addEventListener('touchcancel',gliCoupe,{passive:true});
    el.addEventListener('mousedown',function(e){gliDn('souris',e.clientX,e.clientY);});}); // la souris du cadre de l'ordi fait le même geste au clic tenu
  document.addEventListener('touchstart',function(e){const t=e.changedTouches[0];if(t&&gliLibre(t.clientX,e.target))gliDn('a'+t.identifier,t.clientX,t.clientY,true);},{passive:true});
  document.addEventListener('touchmove',function(e){if(!GLI.part)return;for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];gliMv('a'+t.identifier,t.clientX,t.clientY);}},{passive:true});
  document.addEventListener('touchend',function(e){if(!GLI.part)return;for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];gliUp('a'+t.identifier,t.clientX,t.clientY);}},{passive:true});
  document.addEventListener('touchcancel',function(){if(GLI.part)gliCoupe();},{passive:true});
  document.addEventListener('mousedown',function(e){if(e.button===0&&gliLibre(e.clientX,e.target))gliDn('ma',e.clientX,e.clientY,true);});
  addEventListener('mousemove',function(e){if(GLI.id==='souris'||GLI.id==='ma')gliMv(GLI.id,e.clientX,e.clientY);});
  addEventListener('mouseup',function(e){if(GLI.id==='souris'||GLI.id==='ma')gliUp(GLI.id,e.clientX,e.clientY);});
  // ---- LE VOLANT ANALOGIQUE : toute la moitié gauche. Le stick NAÎT sous le pouce (jamais de
  //      position imposée), FLOTTE au-delà du plein braquage (revenir au centre rend la main
  //      IMMÉDIATEMENT) et se recentre au lâcher. Axe X = braquage · axe Y = assiette en vol.
  // (2026-09-28, user : « augmente la sensibilité de l'axe haut bas du joystick ») : assiette pleine à 44 px au lieu de 66 (×1,5), zone morte
  // 14 % → 10 %, courbe 1,25 → 1,15. Le geste du DRIFT (pouce tiré vers le bas au sol) garde SA distance : il lit les pixels (`TCTL.dy`).
  const sz=$t('tSteer'),stk=$t('tStick'),knb=$t('tKnob'),LOCK=SENSG?VOLANT_PX:54,LOCKV=44,LOCKU=SENSG?38:44,PIQ_K=SENSG?1.12:1,ARC_B=.45,ARC_P=1.5,ARC_M=6,ARC_MAX=42.5,ARC_R0=38*Math.pow(LOCK/54,1.2); // 46 px = braquage plein (54 avant le 14/10) · 44 px = la course du BAS (le drift s'y mesure) · 38 px = assiette pleine vers le HAUT · ARC_* : l'arc du pouce (voir stMove)
  /* (2026-10-14, passe SENSATIONS — Sacha : « sur mobile le joystick n'est pas assez sensible, améliore un petit peu la sensibilité »)
     UN PETIT PEU, sur toute la chaîne du pouce, sans toucher à ce que la caisse SAIT faire (plafonds de lacet et de tangage, VOL_TAU : inchangés) :
     · braquage plein à 46 px au lieu de 54 (−15 % de course : le même geste braque ~18 % de plus) ; la zone morte reste 6 % (2,8 px au lieu de 3,2) ;
     · l'arc du pouce suit la course : sa descente à la butée va comme la course^1,2 (37,6 px à 54 → ~31 à 46), d'où ARC_R0 = 38 × (course/54)^1,2 ;
     · en vol, pouce vers le HAUT : assiette pleine à 38 px au lieu de 44 (`LOCKU`, le socle flotte au-delà comme avant) ; vers le BAS la course
       reste 44 px — c'est elle que lit le GESTE DU DRIFT (34,9 px, seuil d'arc ≤ 42,5 : rien ne bouge) — et l'assiette y monte 12 % plus vite (`PIQ_K`) ;
     · le lissage du volant et du manche passe de τ 47 ms à τ 30 ms quand c'est le POUCE qui tient le stick (`VOL_LIS_D`, dans la boucle) : un pouce
       est déjà analogique, le lissage du clavier (tout ou rien) lui ajoutait du retard pour rien. Le clavier garde ses 47 ms.
     `?sens=0` rend le volant d'avant, au pixel près (pour comparer) ; `?volant=40` essaie une autre course (34 à 60 px : plus petit = plus sensible).
     MESURÉ (banc node `sensations/banc/volant-sim.cjs`, le vrai stMove joué par des pouces simulés, 5 prises) : même geste → +18 à +22 % de braquage ;
     drifts involontaires en slalom 29 → 6 et 58 → 41 images sur 420 (prises tendues), 0 ailleurs ; butée tenue 1 s : 38 → 0 ; le drift VOULU part toujours
     (12 à 29 px de tirage à droite, comme avant à gauche). */
  function stSet(h,v,kx,ky){ if(GAU)h=-h; TCTL.st=h; TCTL.sv=v; // kx/ky : la place du POUCE en pixels depuis la base
    if(knb)knb.style.transform='translate('+(GAU?-(kx||0):(kx||0))+'px,'+(ky||0)+'px)';
    if(stk){stk.style.setProperty('--sl',Math.max(0,h).toFixed(3));stk.style.setProperty('--sr',Math.max(0,-h).toFixed(3));} } // (2026-10-28) la glissière remplit son trait du côté où l'on braque // (2026-09-30) le bouton est dessiné SOUS le pouce (×1) : à ×0,62 de la course (×0,5 en vertical, sur la valeur COURBÉE) il traînait derrière le doigt et mentait sur la butée
  if(sz){
    /* ⚠ TROIS GESTES NOMMÉS, DEUX ENTRÉES (2026-09-24) : le doigt ET la souris passent par les mêmes
       `stDown/stMove/stUp`. Sans le repli souris, le volant était le seul contrôle du téléphone
       injoignable sur l'écran d'ordi (`?tel=1`) — on n'y conduisait qu'aux flèches du clavier, pas
       « au pouce ». La souris prend l'identifiant 'souris'. */
    /* (2026-09-30, relecture du volant) LA PLACE AU BORD : un stick né à 20 px du bord gauche n'avait que 20/54 = 37 % de sa course vers
       la gauche, 32 % de braquage (le doigt bute sur le verre avant la butée) ; né à moins de ~35 px du bas, ni drift ni assiette pleine. Le demi-axe GAUCHE
       (gx) et le demi-axe BAS (gy) se calent sur la place RÉELLE à la naissance (6 px de marge : un pouce ne pointe pas le dernier pixel
       du verre), planchers 24/20 px pour ne pas faire une gâchette. Loin des bords, rien ne change : gx=54, gy=44. Le rectangle du
       volant est lu UNE fois par appui (sL/sT/sB) : aucune lecture de layout forcée pendant le glissé. */
    let sL=0,sT=0,sB=0,sR=0,gx=LOCK,gy=LOCKV,fx9=0,fy9=0;
    const dispL=function(vx){ return (GAU?(sR-sL)-(vx-sL):vx-sL)+'px'; }; // la place AFFICHÉE du stick (le calcul vit dans le monde miroir)
    const stDown=function(id,x,y){
      if(boomSkip())return; // (2026-09-25) un tap passe l'explosion
      const r=sz.getBoundingClientRect(); sL=r.left; sT=r.top; sB=r.bottom; sR=r.right; if(GAU)x=sL+sR-x;
      fx9=x; fy9=y; /* filtre du pouce : voir stMove */
      gx=Math.max(24,Math.min(LOCK,x-sL-6)); gy=Math.max(20,Math.min(LOCKV,sB-y-6));
      TCTL.id=id; TCTL.ox=x; TCTL.oy=y; TCTL.x0=TCTL.lx=x; TCTL.ly=y; TCTL.ab=TCTL.tr=0; TCTL.ar=-1; TCTL.act=true; TCTL.doigt=true; TCTL.dy=0; TCTL.dyS=0; // (le pouce en pixels repart de zéro : un appui immobile ne rejoue pas le dernier glissé)
      stk.style.left=dispL(x); stk.style.top=(y-sT)+'px';
      stSet(0,0); sz.classList.add('act'); sz.classList.add('used'); // la consigne « GLISSE POUR TOURNER » a fait son travail
      start();
    };
    const stMove=function(x,y){
      if(GAU)x=sL+sR-x;
      /* (2026-10-28, Léo : « pas très smooth ») LE POUCE FILTRÉ : le capteur tactile tremble de ±1-2 px, soit 2 à 4 % de braquage avec une course de 46 px —
         c'est ce grain qu'on sentait. Un petit passe-bas (×.55) sur les micro-mouvements (< 4 px par image) ; un vrai glissé, lui, passe tel quel, sans retard. */
      {const ddx=x-fx9,ddy=y-fy9; fx9+=ddx*(Math.abs(ddx)<4?.55:1); fy9+=ddy*(Math.abs(ddy)<4?.55:1); x=fx9; y=fy9;}
      const ox0=TCTL.ox,oy0=TCTL.oy,rawX=x-ox0,dxm=x-TCTL.lx,dym=y-TCTL.ly; TCTL.lx=x; TCTL.ly=y;
      if(rawX>LOCK){TCTL.ox=x-LOCK;gx=Math.max(gx,Math.min(LOCK,TCTL.ox-sL-6));} // STICK FLOTTANT sur les DEUX axes : la base suit le doigt (en s'écartant du bord, le demi-axe gauche regagne sa place — jamais il ne rétrécit en cours d'appui)
      if(rawX<-gx)TCTL.ox=x+gx;       // au-delà de la butée, donc revenir au centre rend la main
      /* (2026-09-30, le drift au geste) LE SOCLE SUIT L'ARC. Le pouce gauche pivote à sa base (sous le coin bas-gauche) : glissé vers la
         DROITE il DESCEND, de plus en plus (pente .3-.5 au départ, .6-1,2 au-delà de la butée) ; vers la GAUCHE il monte, de moins en moins.
         Au-delà de la butée le socle ne flottait qu'en X : la descente de l'arc s'accumulait dans `py` — 37 à 44 px à +80 px (sim-drift.js)
         = DRIFT involontaire, et en vol un cabré de -0,66 à -1. Un seul point ne peut pas être juste aux deux bouts du stick, d'où deux parts :
         · le socle GLISSE sur l'arc à la pente qu'a l'arc SOUS lui (ARC_B = .45, la pente de départ des prises simulées), quand le pouce
           descend (à droite) ou monte (à gauche) — au NEUTRE, le pouce revenu sous l'anneau se lit à plat. (À gauche la glisse ne suit pas
           la montée du pouce, plus plate au bout : le socle coulait de 12 px à chaque slalom ±80.) Bonus mesuré : posé à droite du volant,
           un grand balayage jusqu'au bord gauche piquait en vol (0,7 à 1, et encore 0,7-0,9 revenu au neutre) — 0 (prise tendue : 0,35).
         · ce que le bout de l'arc descend EN PLUS (le pouce y est plus pentu que le socle) est un excès PAR PIXEL de socle parcouru à
           droite de la pose (`ab`/`tr`, borné à ARC_P par px de glissé), retiré de la lecture à proportion du braquage à droite (`cr`) :
           à la butée on lit ce qu'on lisait en y arrivant, au neutre et à gauche rien ne change, et un slalom relit la même chose au même
           endroit. Essayés et rejetés au banc node : tout rentrer dans le socle (piqué 0,2 à 0,7 au neutre au retour, jusqu'à 1 en
           contre-braquant) ; le rendre au retour (drift au 2e passage) ; un excès cumulé sans position (5 slaloms : plus de drift du tout).
         Le vrai geste du drift (tirer vers le bas, droit ou vers la base du pouce) ne tire pas le socle en X : il compte en entier. */
      const fx=TCTL.ox-ox0,pou9=TCTL.id!=='souris'; /* (2026-10-09) L'ARC est celui d'un POUCE qui pivote : un curseur glisse droit. À la souris il décalait le seuil du drift (42,5 px à droite, 34,9 à gauche) — pou9 le réserve au doigt ; la zone morte croisée reste pour tous */
      if(pou9&&fx>0&&dym>0){const g=Math.min(dym,ARC_B*fx),f9=Math.min(fx,TCTL.ox-TCTL.x0);TCTL.oy+=g;
        if(f9>0){TCTL.ab+=Math.min(dym-g,(ARC_P-ARC_B)*fx)*f9/fx;TCTL.tr+=f9;}}
      else if(pou9&&fx<0&&dym<0)TCTL.oy+=ARC_B*fx;
      const pxr=x-TCTL.ox,cr=pxr>0&&TCTL.tr>0?TCTL.ab/TCTL.tr*Math.max(0,TCTL.ox-TCTL.x0)*Math.min(1,pxr/LOCK):0,rawY=y-TCTL.oy-cr;
      if(rawY>gy)TCTL.oy=y-cr-gy;        // IMMÉDIATEMENT (jamais collé au plein braquage)
      if(rawY<-LOCKU){TCTL.oy=y-cr+LOCKU;gy=Math.max(gy,Math.min(LOCKV,sB-TCTL.oy-6));} // (2026-10-14) vers le HAUT le socle flotte dès 38 px (LOCKU)
      if(TCTL.ox!==ox0||TCTL.oy!==oy0){stk.style.left=dispL(TCTL.ox);stk.style.top=(TCTL.oy-sT)+'px';} // (2026-09-30) l'ANNEAU suit la base flottante (il restait planté où le pouce s'était posé) — écrit seulement quand la base bouge
      const px=Math.max(-gx,Math.min(LOCK,pxr)),py=Math.max(-LOCKU,Math.min(gy,y-TCTL.oy-cr)),
            nx=px<0?px/gx:px/LOCK,ny=py<0?py/LOCKU:py/gy,
            ax=Math.abs(nx)<.06?0:nx, // zone morte : le pouce tremble, pas la caisse
            /* (2026-09-30) ZONE MORTE CROISÉE : le pouce pivote à sa base, un glissé « de côté » décrit un ARC — 54 px de braquage portent
               15 à 30 px de vertical, soit 35 à 70 % d'assiette avec l'ancienne zone morte fixe de 10 % (tourner en vol faisait piquer ou
               cabrer). La zone morte verticale s'ÉLARGIT avec le braquage (10 % au neutre → 55 % = 24 px au plein braquage) et la sortie est
               re-étalée sur ce qui reste : une poussée franche (44 px) donne toujours l'assiette pleine. Au neutre la courbe linéaire
               re-étalée colle à l'ancienne (ny^1,15) à 0,015 près au-delà de 40 % de course — la sensibilité réglée le 28/09 est gardée. */
            dz=.10+.45*Math.abs(nx),ay=Math.abs(ny)<=dz?0:(ny<0?-1:1)*Math.min(1,(Math.abs(ny)-dz)/(1-dz)*(ny>0?PIQ_K:1)); // (2026-10-14) vers le BAS l'assiette monte 12 % plus vite (PIQ_K) : la course, elle, reste celle du drift
      TCTL.dy=py>0?py*LOCKV/gy:py; // le pouce en PIXELS vers le bas (le drift s'y mesure, indépendant de la sensibilité) — rapporté aux 44 px d'une course pleine quand le bas de l'écran la raccourcit
      /* (2026-09-30) L'ENTRÉE EN DRIFT CONNAÎT L'ARC DU JOUEUR. Dans la course, l'arc d'un pouce tendu descend déjà de 37,6 px à la butée
         droite (> 34,9 : drift sans rien tirer), celui d'une prise basse de 21,7. `ar` = la descente de CET arc à la butée, relevée pendant
         les glissés LATÉRAUX (|dx| > |dy|, braquage ≥ 40 %) : sur toutes les prises simulées la descente suit nx^1,2 à ±1,5 px près. Pour
         ENTRER à droite il faut tirer ARC_M px sous son propre arc — jamais moins que 34,9 (le geste réglé le 28/09, inchangé pour les
         prises à plat : basse 13 px à la butée, moyenne 7), jamais plus que 42,5 (sous la course de 44 : toujours joignable). Tirer est
         vertical ou vers la base du pouce : `ar` ne bouge pas, le tirage compte en entier. Avant le premier glissé, ARC_R0 = 38 (prudent).
         `ar` monte d'un coup mais ne DESCEND que d'1 px par glissé : un pouce qui tremble (±2 px) l'échantillonnait au creux, et le pic
         suivant passait le seuil (simulé : 1 drift sur une prise tendue tenue à la butée ; 0 ainsi, sans rien tirer de plus). Pas de
         relevé pouce déjà TIRÉ (dy ≥ 42,5) : pousser plus loin en plein drift ne fait pas croire à un arc profond (sinon +8 px au drift suivant).
         `dyS` = ce seuil d'entrée (la conduite y applique le plancher 34,9) ; RESTER en drift demande 34,9 comme avant (`tireBas`) : on en
         sort au même geste. */
      if(pou9&&nx>=.4&&Math.abs(dxm)>Math.abs(dym)&&TCTL.dy<ARC_MAX){const r9=TCTL.dy/Math.pow(nx,1.2);TCTL.ar=TCTL.ar<0||r9>TCTL.ar?r9:Math.max(r9,TCTL.ar-1);}
      TCTL.dyS=pou9&&nx>0?Math.min(ARC_MAX,(TCTL.ar<0?ARC_R0:TCTL.ar)*Math.pow(nx,1.2)+ARC_M):0; // la conduite y ajoute le plancher de 34,9 (DRIFT_PX)
      stSet(-(ax<0?-1:ax>0?1:0)*Math.pow(Math.abs(ax),1.15),   // pouce à GAUCHE = braquage à gauche (steer>0) — (conduite v4) courbe 1,35 → 1,15 : 25 % de pouce = 20 % du cap (15 % avant)
            -ay,px,Math.max(-LOCKU,Math.min(gy,y-TCTL.oy))); // pouce vers le HAUT = sv>0 (en vol, `volSens()` en fait MONTE par défaut depuis le 2026-10-10, PLONGE au réglage) — le bouton reste SOUS le pouce (sans `cr`)
    };
    const stUp=function(){ TCTL.act=false;TCTL.id=null;stSet(0,0);sz.classList.remove('act'); };
    sz.addEventListener('touchstart',function(e){
      if(TCTL.pad)return;
      if(e.cancelable)e.preventDefault();
      /* (2026-09-30) LE VOLANT N'A QU'UN PROPRIÉTAIRE : un 2e contact dans la moitié gauche (la paume, un doigt de la main qui tient le
         téléphone) VOLAIT le stick — il sautait sous l'intrus, le vrai pouce était ignoré, et au lever de l'intrus le braquage tombait à 0
         sous un pouce toujours posé. Tant que le pouce qui tient le volant est sur le verre, un nouveau contact ne fait que passer
         l'explosion. (Un identifiant RECYCLÉ — Android réemploie 0, 1, 2… — qui arrive dans changedTouches est un nouvel appui.) */
      if(TCTL.act){ let tient=false;
        for(let i=0;i<e.touches.length;i++)if(e.touches[i].identifier===TCTL.id)tient=true;
        for(let i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===TCTL.id)tient=false;
        if(tient){boomSkip();return;} }
      const t=e.changedTouches[0]; stDown(t.identifier,t.clientX,t.clientY);
    },{passive:false});
    sz.addEventListener('touchmove',function(e){
      if(e.cancelable)e.preventDefault();
      if(!TCTL.act){ // (2026-10-14, chasse aux bugs) le pouce RESTÉ POSÉ pendant la mort (syncJeu a rendu le volant sous lui) : à la partie suivante son 1er glissé refait naître le stick sous lui — sinon volant mort jusqu'à lever puis reposer le doigt
        if(TCTL.fant!=null&&TCTL.play&&!paused&&mode!=='boom')for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i];
          if(t.identifier===TCTL.fant){TCTL.fant=null;stDown(t.identifier,t.clientX,t.clientY);break;} }
        return; }
      for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i];
        if(t.identifier===TCTL.id)stMove(t.clientX,t.clientY); }
    },{passive:false});
    const stEnd=function(e){
      if(TCTL.fant!=null)for(let i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===TCTL.fant)TCTL.fant=null; // (2026-10-14, chasse aux bugs) le pouce orphelin s'est levé : plus rien à reprendre
      if(!TCTL.act)return;
      for(let i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===TCTL.id)stUp();
    };
    sz.addEventListener('touchend',stEnd,{passive:false});
    sz.addEventListener('touchcancel',stEnd,{passive:false});
    /* (2026-10-14, Sacha : « on a un souci de maniabilité avec le joystick : on le perd souvent du doigt » — et déjà le 09/10 : « quand on
       saute dans le vide vite, des fois le joystick disparaît et on peut plus contrôler la voiture ») LE POUCE ORPHELIN. Un doigt appartient
       pour toujours à l'élément où il s'est POSÉ : posé pendant le VOLET de REJOUER (`#wipe` prend le doigt), pendant le lâcher du JOUER (il
       tombe sur le canvas, les commandes ne sont pas encore là), sur la feuille de pause qui redescend pendant le 3-2-1, ou sur la carte de
       l'auto-école, ce pouce n'était JAMAIS celui du volant — pas d'anneau, braquage 0 tant qu'on ne le relevait pas (le correctif du 09/10,
       commit 11c4441, n'avait jamais été fusionné : il est porté ici). Désormais, en course, un doigt posé dans la zone du volant qui ne
       tient aucun bouton DEVIENT le volant : quand la course part (`cc:jeu`) s'il attendait déjà, sinon à son premier mouvement — et il est
       suivi par son IDENTIFIANT, sur `window`, où qu'il soit né. Les doigts nés SUR le volant gardent leurs écouteurs à eux, juste au-dessus :
       rien ne change pour eux. Pas pendant l'explosion (y reposer le pouce ne la passe pas), pas en pause (le doigt y fait défiler la feuille).
       `stDoigts` = les doigts sur le verre au dernier événement tactile (la liste `touches` du navigateur, recopiée : rien à oublier au lever).
       `stIntrus` = ceux qui se sont posés pendant qu'un autre tenait le volant (la paume, voir le 30/09) : ils ne l'héritent jamais. */
    let stDoigts=[],stIntrus=[];
    const stNote=function(e){ let tenu=false; stDoigts=[];
      for(let i=0;i<e.touches.length;i++){const t=e.touches[i];stDoigts.push({id:t.identifier,x:t.clientX,y:t.clientY,tg:t.target});if(t.identifier===TCTL.id)tenu=true;}
      if(stIntrus.length)stIntrus=stIntrus.filter(function(id){for(let i=0;i<stDoigts.length;i++)if(stDoigts[i].id===id)return true;return false;});
      if(TCTL.act&&TCTL.id!=='souris'&&!tenu){ if(e.type==='touchcancel'){TCTL.nAnn=(TCTL.nAnn||0)+1;stStat();} if(!stHerite())stUp(); } }; // FILET : le doigt du volant n'est plus sur le verre (lever perdu, doigt adopté qui se lève) → le volant se rend, il ne reste jamais braqué tout seul
    /* (2026-10-14, Sacha : « dans l'app, souvent, quand mon pouce se déplace trop, il se détache ») LE POUCE QUI ROULE. Dans Chrome un
       pouce tiré très loin reste accroché (banc volant-doigts : jusqu'à x = 90 %). Sur le verre d'un iPhone, un pouce qui s'étire se
       couche : sa surface de contact change, et l'écran peut le compter un instant comme DEUX doigts, puis lâcher le premier. Le second,
       arrivé pendant que le premier tenait, était un « intrus » (la règle de la paume, 30/09) : il n'héritait jamais → volant mort sous
       un pouce toujours posé. Désormais, quand le doigt du volant disparaît, un contact né il y a moins de 0,45 s À MOINS DE 90 px de lui
       REPREND le volant sans à-coup (la base glisse de l'écart : même braquage à l'instant du relais). Une paume posée depuis
       longtemps, ou loin, n'hérite toujours pas. ⚠ Non reproduit sur un vrai téléphone : TCTL.nHer / TCTL.nAnn comptent les relais et
       les doigts coupés par le système (dbgTouch, et la ligne VERSION des réglages) pour le savoir. */
    const stNe={};
    const stStat=function(){ try{const v=document.getElementById('mvVer');if(v)v.textContent=v.textContent.replace(/ · VOLANT.*$/,'')+' · VOLANT R'+(TCTL.nHer||0)+' C'+(TCTL.nAnn||0);}catch(_){} }; // R = relais du pouce, C = doigts coupés par le système
    const stHerite=function(){
      const n9=performance.now(); let r=null;
      for(let i=0;i<stDoigts.length;i++){ const d=stDoigts[i];
        if(d.id===TCTL.id||!stLibre(d.tg)||!(n9-(stNe[d.id]||0)<450))continue;
        const dvx=GAU?sL+sR-d.x:d.x,dx=dvx-TCTL.lx,dy=d.y-TCTL.ly; if(dx*dx+dy*dy>8100)continue;
        if(!r)r=sz.getBoundingClientRect();
        if(d.x<r.left||d.x>r.right||d.y<r.top||d.y>r.bottom)continue;
        TCTL.ox+=dx;TCTL.oy+=dy;TCTL.x0+=dx;TCTL.lx=dvx;TCTL.ly=d.y;TCTL.id=d.id;fx9=dvx;fy9=d.y;
        stk.style.left=dispL(TCTL.ox);stk.style.top=(TCTL.oy-sT)+'px';
        const k=stIntrus.indexOf(d.id); if(k>=0)stIntrus.splice(k,1);
        TCTL.nHer=(TCTL.nHer||0)+1; stStat(); return true; }
      return false; };
    const stLibre=function(tg){ return !!(tg&&tg.isConnected)&&!(tg.closest&&tg.closest('.tbtn,#tNitroZone,#tSet,#modale,button,[data-a],[data-m]')); }; // le doigt d'un bouton (NITRO, pause, PASSER) reste à son bouton
    const stAdopte=function(){
      if(TCTL.act||TCTL.pad||!started||gameOver||paused||mode==='boom')return;
      let r=null;
      for(let i=0;i<stDoigts.length;i++){ const d=stDoigts[i];
        if(stIntrus.indexOf(d.id)>=0||!stLibre(d.tg))continue; // (un doigt qui se pose SUR le volant est pris ici puis repris, à l'identique, par son propre touchstart)
        if(!r)r=sz.getBoundingClientRect();
        if(d.x<r.left||d.x>r.right||d.y<r.top||d.y>r.bottom)continue;
        stDown(d.id,d.x,d.y);return; }
    };
    addEventListener('visibilitychange',function(){ if(document.hidden){stDoigts=[];stIntrus=[];if(TCTL.act&&TCTL.id!=='souris')stUp();} }); // l'appli passe derrière : des levers peuvent se perdre — la liste repart vide et le volant se rend
    document.addEventListener('cc:jeu',stAdopte); // la course part (JOUER, REJOUER) : le pouce qui attendait sur le verre prend le volant tout de suite
    addEventListener('touchstart',function(e){
      if(TCTL.act&&TCTL.id!=='souris'){ let tient=false; // le volant est tenu par un doigt toujours posé : ceux qui arrivent sont des intrus, pour toute leur vie
        for(let i=0;i<e.touches.length;i++)if(e.touches[i].identifier===TCTL.id)tient=true;
        for(let i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===TCTL.id)tient=false;
        if(tient)for(let i=0;i<e.changedTouches.length;i++){stIntrus.push(e.changedTouches[i].identifier);stNe[e.changedTouches[i].identifier]=performance.now();} }
      stNote(e); stAdopte(); },{capture:true,passive:true});
    addEventListener('touchmove',function(e){
      stNote(e);
      if(TCTL.pad)return;
      if(!TCTL.act){stAdopte();return;}
      for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i];
        if(t.identifier===TCTL.id&&!sz.contains(t.target)){if(e.cancelable)e.preventDefault();stMove(t.clientX,t.clientY);} } // (un doigt né sur le volant est suivi par l'écouteur du volant : jamais deux fois)
    },{capture:true,passive:false});
    addEventListener('touchend',stNote,{capture:true,passive:true});    // le lever du doigt adopté : c'est le filet de stNote qui rend le volant
    addEventListener('touchcancel',stNote,{capture:true,passive:true});
    addEventListener('mousemove',function(e){ // le même pouce orphelin, à la souris (le cadre de l'ordi : bouton enfoncé pendant le volet)
      if(TCTL.act||TCTL.pad||!(e.buttons&1)||(e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents)||!started||gameOver||paused||mode==='boom'||!stLibre(e.target))return;
      const r=sz.getBoundingClientRect(); if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)stDown('souris',e.clientX,e.clientY); });
    // repli SOURIS : on attrape sur le volant, on suit et on lâche PARTOUT (le curseur sort vite de la zone)
    sz.addEventListener('mousedown',function(e){ if(TCTL.pad||e.button!==0)return; e.preventDefault(); stDown('souris',e.clientX,e.clientY); });
    addEventListener('mousemove',function(e){ if(TCTL.act&&TCTL.id==='souris')stMove(e.clientX,e.clientY); });
    addEventListener('mouseup',function(){ if(TCTL.act&&TCTL.id==='souris')stUp(); });
  }
  // ---- LE BOUTON DE RÉGLAGES : UN SEUL. Il ouvre le panneau — et OUVRIR MET EN PAUSE
  //      (on ne fouille pas dans les options à 1400 km/h). Fermer reprend la partie.
  const gear=$t('tGear'),pan=$t('tPanel');
  // QUALITÉ D'IMAGE : on ne touche QUE le canvas 3D. Le HUD est du DOM, il reste net au pixel quoi
  // qu'il arrive — on enlève donc les pixels là où ils coûtent, jamais sur une jauge.
  // ⚠ (2026-09-24, « pourquoi c'est pixelisé comme ça ») : RAPIDE 0,66 → 1,0 et NETTE 1,15 → 1,5, sur téléphone
  // comme sur l'ordi en `?tel=1`. À 0,66 un iPhone rendait l'image sur ~260 px de large : c'était LA pixellisation.
  // Le plafond peut monter sans risque parce que la résolution adaptative redescend si le GPU peine — et
  // qu'elle sait maintenant REMONTER (voir la boucle).
  try{if(!I18N['HAUTE'])I18N['HAUTE']='HIGH';}catch(e){} /* (OPTIMISATION) le 3e choix du réglage IMAGE (voir L'IMAGE EN AUTOMATIQUE) */
  function applyQ(fast){ DPR_CAP=dprPlafond(fast); // (2026-10-14, passe perf mobile) le plafond NETTE se taille sur le palier (palier 2 : 1,5 comme avant) — voir NETTE PAR PALIER
    qlReprise(); } // (2026-09-27) pleine résolution tout de suite + l'échelle QL recalée sur le nouveau plafond (et son plancher NET)
  // ⚠ LES INTERRUPTEURS PASSENT PAR LES BOUTONS DU DESKTOP (`.click()`) au lieu de refaire leur
  // logique : son, voix, musique, Survivant et Parc ont des EFFETS DE BORD (suspend du contexte
  // audio, exclusion mutuelle police/parc, reconstruction de la scène de menu). Les dupliquer, ce
  // serait deux vérités qui divergent au premier changement.
  const clic=function(el){ if(el)el.click(); };
  function panSync(){ if(!pan)return;
    const run=(started&&!gameOver),el=pan.querySelectorAll('.tp,.tpH,.tpResume');
    if(run){const s9=function(id,v){const e=document.getElementById(id);if(e)e.textContent=v;},av9=document.getElementById('avVal'); // (charte v5) la PAUSE dit où en est la partie
      try{s9('tpAu',av9&&av9.textContent.trim()?av9.textContent:'0');s9('tpMo',(engTier|0)+1);s9('tpNv',LVL.cur?LVL.n:runStats.zones+1);}catch(e){}}
    for(let i=0;i<el.length;i++){ const e=el[i],a=e.getAttribute('data-a'),g=e.getAttribute('data-g');
      if(g)e.style.display=((g==='run')===run)?'':'none'; // « LA PARTIE » n'existe qu'en jeu
      if(a==='close')e.innerHTML=run?tpLbl('lecture','REPRENDRE'):tpLbl('croix','FERMER');
      else if(a==='snd')e.innerHTML=tpLbl(SND.sfx?'son':'muet','SON',SND.sfx?'ON':'OFF',SND.sfx);
      else if(a==='mus')e.innerHTML=tpLbl('musique','MUSIQUE',SND.music?'ON':'OFF',SND.music);
      else if(a==='ctl')e.innerHTML=tpLbl(TCTL.pad?'fleches':'volant','COMMANDES',TCTL.pad?'FLECHES':'VOLANT',true);
      else if(a==='q'){e.innerHTML=tpLbl('eclair','IMAGE',qLbl(),true);}
      else if(a==='surv')e.innerHTML=tpLbl('drapeau','SURVIVANT',SURV.armed?'ON':'OFF',SURV.armed); }
    const hd=pan.querySelector('.tpH'); if(hd)hd.textContent=run?'PAUSE':'CASH CAR'; }
  function panOpen(o,compte){ if(!pan)return;
    if(o)feuilleOuvre(pan,'open');else feuilleFerme(pan,'open'); // la pause MONTE du bas et y redescend
    if(o){ panSync(); if(started&&!gameOver&&!paused)togglePause(); }
    else if(started&&!gameOver&&paused){ if(compte)repriseCompte(); else togglePause(); } }
  /* LA REPRISE EN 3-2-1 (2026-09-26, audit UX) : REPRENDRE est en BAS de l'écran — le pouce le quittait que la caisse repartait déjà
     à pleine vitesse (le ralenti de reprise est coupé par la règle « aucun ralenti »). Trois temps de 0,3 s, jeu GELÉ : ce n'est
     pas un ralenti, c'est un compte. Rouvrir la pause (ou quitter) pendant le compte l'annule. */
  function repriseCompte(){
    if(repriseCompte.t)return;
    repriseCompte.t=-1; // (2026-09-28) posé DÈS l'appel : pendant qu'on attend le réveil du son, un second REPRENDRE ne lance pas un second compte
    let n=3,parti=false;
    const pas=function(){
      const s9=avE('slam9');
      if(!started||gameOver||!paused||(pan.classList.contains('open')&&!pan.classList.contains('sortant'))){repriseCompte.t=0;if(s9)s9.classList.remove('compte','on');return;} // la feuille qui DESCEND encore n'annule rien
      if(n===0){repriseCompte.t=0;if(s9)s9.classList.remove('compte','on');try{sfx('ui.go');}catch(e){}togglePause();return;} // retirer `on` AUSSI : sinon l'animation normale repart et le « 1 » revient en grand
      slam(String(n),'','#ffd75e','#ff7ad5',64,9);{const s8=avE('slam9');if(s8)s8.classList.add('compte');} // un chiffre = 0,3 s : l'entrée doit être lisible tout de suite
      try{if(SONV2){if(AC&&AC.state!=='running'&&SND.sfx)AC.resume().then(function(){sfx('ui.bip');}).catch(function(){});else sfx('ui.bip');}else chimeNote(noteP(n===1?4:2,1),0,.08,.1);}catch(e){}hap(6); // (2026-09-27) ces bips et la vibration étaient avalés par le commentaire ci-dessus
      n--;repriseCompte.t=setTimeout(pas,300);};
    /* (2026-09-28) LE « 3 » ATTEND QUE LE SON SOIT RÉVEILLÉ. `AC.resume()` est asynchrone : lancé juste avant le compte, le premier
       bip tombait sur un contexte encore suspendu (`sfxOk` le refuse) — on n'entendait que « 2 » et « 1 ». On part à la promesse
       résolue (ou rejetée), avec un filet à 400 ms si elle ne répond jamais (iOS « interrupted ») : la pause ne doit jamais rester coincée. */
    const go=function(){if(parti)return;parti=true;pas();};
    let r9=null;try{busPlein();if(AC&&SND.sfx&&AC.state!=='running')r9=AC.resume();}catch(e){} // la sortie remonte : les bips du compte s'entendent
    if(r9&&r9.then){r9.then(go,go);setTimeout(go,400);}else go(); }
  // ⚠ `click` EN PLUS DE `touchstart` (2026-09-05) — `#tGear`/`#tPanel` s'affichent maintenant sur
  // DESKTOP aussi (voir CSS `body.play #tSet`), or une souris ne déclenche JAMAIS `touchstart` :
  // sans ce doublon d'écouteurs, le seul bouton de réglages visible en jeu serait injoignable au
  // clavier-souris. Fonctions NOMMÉES (pas des closures anonymes dupliquées) pour qu'un seul corps
  // serve les deux entrées — sinon la logique finit par diverger au premier changement, comme le
  // commentaire plus haut le dit déjà pour les interrupteurs eux-mêmes.
  function gearOpenHandler(e){ if(e.cancelable)e.preventDefault(); e.stopPropagation(); if(started&&!gameOver&&mode==='boom'){boomSkip();return;} /* (passe qualité) pendant l'explosion, le ⏸ avance à l'écran de fin (comme NITRO / Entrée) au lieu d'ouvrir une pause sur une partie déjà perdue */ uiClic('nav'); panOpen(true); } // (charte, règle 8) le ⏸ sonne AVANT que la pause ne coupe le son — (2026-09-28) plus de hap(10) derrière : uiClic vibre déjà, le pouce sentait DEUX coups
  function panTapHandler(e){
    if(e.cancelable)e.preventDefault(); e.stopPropagation();
    const el=e.target&&e.target.closest?e.target.closest('.tp'):null;
    if(!el)return; // (2026-09-25) le fond ne relance plus rien : un doigt posé par mégarde renvoyait la caisse en plein virage — seule REPRENDRE (ou Échap) rend la main
    const a=el.getAttribute('data-a');
    if(a==='close')panOpen(false,true);
    else if(a==='snd'){clic(sndBtnEl);panSync();}
    else if(a==='mus'){clic(musBtnEl);panSync();}
    else if(a==='ctl'){ TCTL.pad=!TCTL.pad; TCTL.act=false; TCTL.id=null; TCTL.st=0; TCTL.sv=0;
      if(sz)sz.classList.remove('act'); keys.ArrowLeft=keys.ArrowRight=false;
      document.body.classList.toggle('tpad',TCTL.pad);
      SAVE.d.tctl=TCTL.pad?'pad':'stick'; SAVE.flush(); panSync(); }
    else if(a==='q'){ SAVE.d.q=qSuivant(SAVE.d.q); SAVE.d.qChoisi=1; SAVE.flush(); applyQ(SAVE.d.q==='fast'); panSync(); }
    else if(a==='surv'){ clic(survBtnEl); panSync(); }
    else if(a==='tous'){ setPauseOuvre(); } // (2026-10-14, charte 6) TOUS LES REGLAGES : l'écran complet par-dessus la pause
    else if(a==='resp'){ panOpen(false); if(started&&!gameOver&&mode==='drive')respawn(); }
    else if(a==='reset'||a==='quit'){ const q9=a==='quit'; // (2026-09-25) CONFIRMÉS : QUITTER tombait sous le pouce et terminait la partie d'un seul tap
      modale({titre:q9?'QUITTER LA PARTIE ?':'RECOMMENCER ?',texte:q9?(TUTO.on?(SAVE.d.permis?'Tu reprendras la leçon au prochain départ.':"Tu reprendras la leçon au prochain départ : le PERMIS et sa prime t'attendent."):'Tes gains sont versés au compte.'):'Les gains de cette partie ne seront PAS versés.', // (2026-09-29) pendant la leçon, « tes gains sont versés » taisait l'enjeu
        boutons:[{l:q9?'QUITTER':'RECOMMENCER',ic:q9?'quitter':'rejouer',cls:'pb-red',v:1},{l:'CONTINUER',ic:'lecture',v:0}]}) // CONTINUER en DERNIER : Échap clique le dernier bouton
      .then(function(r){ if(!r.v||!started||gameOver)return;
        const f9=function(){ if(!started||gameOver)return; const rc9=mode!=='boom'; if(rc9)feuilleFerme(pan,'open');else panOpen(false); // (2026-10-14, chasse aux bugs) RECOMMENCER ferme la feuille SANS dépauser : panOpen(false) passait par togglePause (« GO ! », musique de la partie abandonnée relancée, jeu qui repart) juste avant resetGame
          if(q9){if(rc9){paused=false;try{if(AC&&SND.sfx&&AC.state!=='running')AC.resume();}catch(e){}} /* (2026-10-14, chasse aux bugs) QUITTER aussi ferme la feuille SANS togglePause : la musique de la partie abandonnée repartait 0,66 s (play à la seconde où on l'avait laissée) juste pour être étranglée par le tape-stop d'endGame — on sort de la pause à la main, le son se réveille pour l'écran de fin, la musique reste arrêtée (musicStop la range proprement) */ if(TUTO.on)tutoQuitte();const sb=SANDBOX;SANDBOX=false;endGame();SANDBOX=sb;}
          else if(mode==='boom')endGame(); // (2026-10-12, passe qualité) la caisse EXPLOSE déjà : la partie est finie — RECOMMENCER sautait endGame (ni virement, ni aura, ni record, ni écran de fin). On la solde, l'écran de fin et son REJOUER suivent.
          else { /* (2026-10-14, chasse aux bugs) …et passe par le VOLET comme REJOUER : la piste neuve se construisait à l'écran, sous la feuille qui descendait. Le jeu reste gelé sous le voile ; le son (endormi par la pause) se réveille pour le volet — la musique abandonnée, elle, reste en pause : resetGame lance la neuve en fondu */
            let r9=null;try{busPlein();if(AC&&SND.sfx&&AC.state!=='running')r9=AC.resume();}catch(e){}
            if(ecranWipe._on){resetGame();} // un fondu déjà en cours ignorerait le nôtre : jamais une partie gelée sans feuille
            else{ecranWipe(function(){if(started&&!gameOver){resetGame(); /* ===== RECOMMENCER PUIS ARRIÈRE-PLAN (24/10, relecture : « la course roule sous la PAUSE ») ===== l'appli passée derrière pendant le volet a ROUVERT la feuille (paused encore vrai) ; resetGame remet paused=false : la partie neuve roulait sous la pause ouverte, REPRENDRE ne la gelait plus. La feuille ouverte = la partie neuve part en PAUSE, REPRENDRE sous le pouce (comme un retour d'arrière-plan) */
                if(pan.classList.contains('open')&&!pan.classList.contains('sortant'))panOpen(true);}});
              if(r9&&r9.then&&SONV2)r9.then(function(){try{if(ecranWipe._on)sfx('ui.volet');}catch(e){}},function(){});} } }; // le son du volet, perdu sur le contexte encore endormi, part au réveil
        f9(); }); } // (2026-09-28) tutoQuitte : la leçon quittée sera reproposée
    uiClic(a==='close'?'retour':a==='tous'?'nav':a==='snd'?(SND.sfx?'on':'off'):a==='mus'?(SND.music?'on':'off'):a==='surv'?(SURV.armed?'on':'off'):(a==='ctl'||a==='q'||a==='volh'||a==='figg')?'onglet':(a==='reset'||a==='quit')?'danger':''); /* (console de son) le RÔLE — ici le clic part APRÈS la bascule : l'interrupteur sonne son nouvel état */ // ⚠ EN DERNIER : un bouton qui SORT de la pause (reprendre, recommencer, quitter) garde son clic ; en pause il reste le visuel et la vibration
  }
  /* (2026-10-14, chasse aux bugs) LE ⏸ AU DEUXIÈME DOIGT. Un doigt qui tape ⏸ pendant qu'un autre TIENT le volant ou la NITRO ne produit AUCUN `click`
     (le navigateur n'en synthétise pas pour un toucher secondaire en multi-touch — Chrome comme Safari iOS) : impossible de mettre en pause sans lâcher la
     commande. On lit donc le `touchend` du doigt NÉ sur le ⏸ (suivi par son identifiant) ; seul le cas « un autre doigt est encore posé » est pris ici —
     un doigt seul garde son `click` d'avant, inchangé. `gearTt` écarte le click éventuel qui suivrait quand même (pas de double déclenchement). */
  let gearId=null,gearTt=0;
  if(gear){
    gear.addEventListener('touchstart',function(e){ if(gearId===null&&e.changedTouches.length)gearId=e.changedTouches[0].identifier; },{passive:true});
    gear.addEventListener('touchcancel',function(){ gearId=null; },{passive:true});
    gear.addEventListener('touchend',function(e){
      let t=null; for(let i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===gearId)t=e.changedTouches[i];
      if(!t)return; gearId=null;
      if(!e.touches.length)return; // dernier doigt levé : le click suit, c'est lui qui ouvre
      const r=gear.getBoundingClientRect(); if(t.clientX<r.left-12||t.clientX>r.right+12||t.clientY<r.top-12||t.clientY>r.bottom+12)return; // le doigt a glissé hors du bouton : rien
      gearTt=performance.now(); gearOpenHandler(e); },{passive:false}); }
  if(gear)gear.addEventListener('click',function(e){ if(performance.now()-gearTt<700){e.stopPropagation();return;} gearOpenHandler(e); }); // au relâcher (voir mHit) : le panneau défile, un glissé n'active rien
  if(pan)pan.addEventListener('click',panTapHandler);
  /* ===== L'INCLINAISON (2026-10-27, Léo : « c'est trop dur de jouer en maintenant, le rond donne envie de maintenir ») =====
     Le téléphone se penche comme un volant, sur toutes les poses : droit, couché, retourné. On lit la DIRECTION DU BAS dans le repère de l'écran
     (deviceorientation → vecteur pesanteur, donc ni angle d'Euler ni signe propre à un système) : l'angle de ce vecteur est le volant, qu'on
     tourne le téléphone comme une roue (paysage) ou qu'on le bascule sur le côté (portrait). Le neutre est la pose du joueur AU DÉPART de la
     course (et à chaque rotation de l'écran) : aucune pose à tenir. Plein braquage à 22°, zone morte 2,5°. Le pouce garde l'assiette en vol
     et la NITRO ; la boucle lit TCTL.inclV à la place du braquage du stick (voir boucle-1). Réglage INCLINAISON, ON/OFF, mémorisé. */
  const INCL_PLEIN=22*Math.PI/180,INCL_MORT=2.5*Math.PI/180;
  const INCL_PPLEIN=14*Math.PI/180,INCL_PMORT=3*Math.PI/180;
  let inclLis=0,inclPL=0,inclOk=false,inclAttache=false;
  function inclOri(e){
    if(e.beta==null||e.gamma==null)return;
    const b=e.beta*Math.PI/180,g=e.gamma*Math.PI/180,dx=Math.sin(g)*Math.cos(b),dy=-Math.sin(b), // le bas du monde dans le repère de l'APPAREIL
          o=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0),a=((o%360)+360)%360;
    const dr=a===90?-dy:a===180?-dx:a===270?dy:dx, du=a===90?dx:a===180?-dy:a===270?-dx:dy; // …puis dans celui de l'ÉCRAN : vers la droite / vers le haut
    if(Math.hypot(dr,du)<.35)return; // téléphone à plat : pas de volant (le vecteur n'a plus de sens)
    inclOk=true; const ang=Math.atan2(dr,-du), dz=-Math.cos(g)*Math.cos(b), pit=Math.atan2(-dz,-du); // pit > 0 = haut du téléphone vers l'arrière (écran qui regarde le ciel)
    if(TCTL.inclPN==null)TCTL.inclPN=pit;
    if(TCTL.inclN==null)TCTL.inclN=ang;
    let rel=ang-TCTL.inclN; if(rel>Math.PI)rel-=2*Math.PI; else if(rel<-Math.PI)rel+=2*Math.PI;
    const pay=(a===90||a===270); /* PAYSAGE (2026-10-28, Léo : « un peu chaud en rotation ») : le téléphone y tourne comme une ROUE, un geste bien plus ample que la bascule du portrait → plein braquage à 36° (22° en portrait), zone morte 4°, lissage plus lourd */
    inclLis+=(rel-inclLis)*(pay?.28:.4); // un peu de lissage : la main tremble, le capteur aussi
    inclPL+=((pit-TCTL.inclPN)-inclPL)*.4; /* LE TANGAGE : le haut du téléphone vers SOI = pouce HAUT (monte/plonge selon le réglage POUCE HAUT), vers l'avant = pouce BAS. Plein à 14°, zone morte 3° ; le pouce posé sur le stick reprend la main */
    {const mp=Math.abs(inclPL),pm=pay?4*Math.PI/180:INCL_PMORT,pp=pay?22*Math.PI/180:INCL_PPLEIN,vp=mp<pm?0:(inclPL<0?1:-1)*Math.min(1,(mp-pm)/(pp-pm)); TCTL.inclP=vp; if(TCTL.incl&&!TCTL.act)TCTL.sv=vp;
      if(mp<5*Math.PI/180)TCTL.inclPN+=(pit-TCTL.inclPN)*.004;}
    if(Math.abs(inclLis)<6*Math.PI/180)TCTL.inclN+=rel*.004; // le NEUTRE suit très lentement la main (le poignet se fatigue, la pose dérive) : jamais sur un vrai virage (> 6°)
    const m=Math.abs(inclLis),mo=pay?4*Math.PI/180:INCL_MORT,pl=pay?36*Math.PI/180:INCL_PLEIN; TCTL.inclV=m<mo?0:(inclLis<0?1:-1)*Math.pow(Math.min(1,(m-mo)/(pl-mo)),1.15); // `rel` > 0 = tourné dans le sens horaire (bord droit en bas) = braquage à DROITE (steer < 0)
    if(TCTL.incl&&TCTL.play)TCTL.doigt=true; // le lissage rapide du pouce (τ 30 ms), pas celui du clavier
  }
  function inclPerm(){ const D=window.DeviceOrientationEvent;
    if(D&&typeof D.requestPermission==='function'){ try{ D.requestPermission().then(function(r){ if(r!=='granted')toast(pxi('croix')+' '+TR('CAPTEUR REFUSÉ : RÉGLAGES › SAFARI')); }).catch(function(){}); }catch(_){} } }
  function inclMarche(on){ TCTL.incl=!!on; TCTL.inclV=0; TCTL.inclP=0; TCTL.inclN=TCTL.inclPN=null; inclLis=inclPL=0; if(!on&&!TCTL.act)TCTL.sv=0;
    if(on&&!inclAttache){ addEventListener('deviceorientation',inclOri); inclAttache=true; }
    if(!on&&inclAttache){ removeEventListener('deviceorientation',inclOri); inclAttache=false; } }
  /* LES TROIS COMMANDES (2026-10-27, Léo : « des options de joystick différentes : les flèches, le slide (actuel), et l'inclinaison ») :
     VOLANT (le stick qui naît sous le pouce) → FLÈCHES (deux boutons, comme le clavier) → INCLINAISON (le téléphone penché). Mémorisé (`SAVE.d.cmd`). */
  function gauSet(on){ if(TCTL.act){TCTL.act=false;TCTL.id=null;TCTL.st=0;TCTL.sv=0;if(sz)sz.classList.remove('act');} GAU=!!on; SAVE.d.gaucher=GAU?1:0; SAVE.flush(); document.body.classList.toggle('gaucher',GAU); } // (2026-10-28) le MODE GAUCHER
  function cmdMode(){ return TCTL.pad?'fleches':TCTL.incl?'incl':'volant'; }
  function cmdSet(m,calme){ TCTL.pad=(m==='fleches'); TCTL.act=false; TCTL.id=null; TCTL.st=0; TCTL.sv=0;
    if(sz)sz.classList.remove('act'); keys.ArrowLeft=keys.ArrowRight=keys.ArrowUp=keys.ArrowDown=false; document.body.classList.toggle('tpad',TCTL.pad);
    inclMarche(m==='incl'); SAVE.d.cmd=m; SAVE.d.tctl=TCTL.pad?'pad':'stick'; SAVE.flush();
    if(!calme&&m==='incl'){ inclPerm(); toast(pxi('coche')+' '+TR('PENCHE LE TÉLÉPHONE POUR TOURNER')); } }
  document.addEventListener('cc:jeu',function(){ TCTL.inclN=TCTL.inclPN=null; inclLis=inclPL=0; }); // le neutre = la pose du joueur au départ de la course
  addEventListener('orientationchange',function(){ TCTL.inclN=TCTL.inclPN=null; inclLis=inclPL=0; });
  if(SAVE.d.cmd==='fleches')cmdSet('fleches',true);
  if(SAVE.d.cmd==='incl'){ inclMarche(true); document.addEventListener('touchend',function f(){ document.removeEventListener('touchend',f); inclPerm(); },{passive:true}); } // au relancement, l'autorisation du capteur se redemande au 1er toucher (iOS l'exige d'un geste)
  // ---- SYNCHRO PARESSEUSE (8 Hz) : apparition des commandes, écran de mort, gel en paysage.
  //      Un petit tick plutôt qu'un branchement dans loop() — et zéro écriture DOM si rien n'a changé.
  function syncJeu(){
    const play=(started&&!gameOver),dead=(started&&gameOver); // (reste vraie à l'accueil d'après-mort : body.dead y masque encore les restes du HUD de course)
    if(dead!==TCTL.dead){ TCTL.dead=dead; document.body.classList.toggle('dead',dead); if(dead)TCTL.mortT=performance.now(); } // l'écran de mort a sa propre hiérarchie
    if(play!==TCTL.play){ TCTL.play=play; document.body.classList.toggle('play',play);
      if(gear)gear.innerHTML=pxi(play?'pause':'reglages'); // en jeu c'est un bouton PAUSE, au menu un bouton réglages
      if(!play){ for(const k in keys)keys[k]=false; TCTL.fant=(TCTL.act&&TCTL.id!=='souris')?TCTL.id:null; // (2026-10-14, chasse aux bugs) on retient le doigt encore posé sur le volant (voir le touchmove de #tSteer)
        try{document.querySelectorAll('#tNitro.on,#tLeft.on,#tRight.on,#tUp.on,#tDown.on').forEach(function(b){b.classList.remove('on');});}catch(e){} // (2026-10-14, chasse aux bugs) …et un bouton tenu à la mort ne reste pas DESSINÉ enfoncé à la partie suivante, nitro coupée (comme l'écouteur blur)
        TCTL.act=false; TCTL.id=null; TCTL.st=0; TCTL.sv=0; if(sz)sz.classList.remove('act'); } }
  }
  document.addEventListener('cc:jeu',syncJeu); // (2026-09-25) les commandes apparaissaient 0 à 140 ms APRÈS le départ, au hasard du tick
  setInterval(function(){
    syncJeu(); const play=(started&&!gameOver);
    /* (2026-09-27, user : « je veux un mode horizontal et vertical ») : plus de gel quand le téléphone se couche — on joue dans
       les DEUX sens. La caméra suit toute seule (`fovFit` → `POR` : 0 en paysage, 1 en portrait, recalculé à chaque rotation). */
    if(window.__setPause&&!(started&&!gameOver&&paused)){ /* (2026-10-14, UX 8) RÉGLAGES ouverts depuis la pause, mais la pause n'existe plus (QUITTER confirmé pendant qu'ils étaient ouverts, ou reprise par un autre chemin) : on referme TOUT l'état d'un coup — sinon TCTL.ov restait vrai, l'observateur ne rouvrait pas la racine et l'écran de fin affichait #mSet au lieu de #mDead */
      window.__setPause=false; document.body.classList.remove('setPause','setPauseSort');
      for(const k in mScr){const e=mScr[k];if(!e)continue;clearTimeout(e._sortT);e.classList.remove.apply(e.classList,SENS);}
      if(overlay.style.display!=='none'){ TCTL.ov=true; mGo(mRoot(),'racine',true); } else TCTL.ov=false; }
    const ovOpen=(overlay.style.display!=='none'); // le menu vient d'apparaître (mort, retour du garage, premier lancement) ?
    if(ovOpen!==TCTL.ov){ TCTL.ov=ovOpen; if(ovOpen)mGo(mRoot(),'racine',true); } // filet : l'observateur plus bas l'a normalement déjà fait
  },140);
  // ---- GESTES PARASITES DU NAVIGATEUR : zoom pincé, double-tap, menu long-appui, tirer-pour-rafraîchir ----
  addEventListener('gesturestart',function(e){e.preventDefault();},{passive:false});
  addEventListener('gesturechange',function(e){e.preventDefault();},{passive:false});
  addEventListener('dblclick',function(e){e.preventDefault();},{passive:false});
  addEventListener('contextmenu',function(e){e.preventDefault();});
  addEventListener('touchmove',function(e){ // le doigt ne fait défiler QUE le menu, la fiche et le panneau
    // ⚠ preventDefault sur touchmove ANNULE la séquence pointer* (pointercancel) : dans le garage,
    // c'est le glissé qui fait tourner l'atelier — on le laisse passer. Rien ne défile pour autant :
    // `touch-action:none` sur le canvas et le HUD bloque déjà le scroll du navigateur.
    if(garageOn)return;
    const tg=e.target;
    if(!(tg&&tg.closest&&tg.closest('#overlay,#gCard,#tPanel,#modale,#plq,#prof'))&&e.cancelable)e.preventDefault(); /* (2026-10-17) l'atelier de la plaque et le profil défilent au doigt (debout, sur un petit écran) */ // (2026-09-29) la FENÊTRE est hors de #overlay : son contenu ne défilait pas au doigt
  },{passive:false});
  // ---- GARAGE AU DOIGT : le PINCEMENT remplace la molette (il n'y a pas de molette sur un pouce) ----
  (function(){ let pd=0;
    addEventListener('touchmove',function(e){
      if(!garageOn||e.touches.length<2){pd=0;return;}
      const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
      if(pd>0)garageDist=THREE.MathUtils.clamp(garageDist-(d-pd)*.014,4.6,8.6); // même plafond que la molette (voir plus haut)
      pd=d;
    },{passive:true});
    addEventListener('touchend',function(){pd=0;},{passive:true});
  })();
  // ---- PLEIN ÉCRAN / PORTRAIT / VEILLE : demandés sur le GESTE (splash, menu) ----
  const imm=function(){goImmersive();};
  const sp0=$t('splash'); if(sp0)sp0.addEventListener('touchend',imm,{passive:true});
  overlay.addEventListener('touchend',imm,{passive:true});
  // ---- iOS : le contexte audio ne démarre QUE sur un geste — on le relance tant qu'il dort ----
  // Il peut être 'suspended' (politique navigateur) MAIS AUSSI 'interrupted' — l'état d'après un
  // appel, Siri ou une alarme. Ne tester que 'suspended' laissait le jeu muet pour toute la partie.
  function audioKick(){ try{ if(AC&&(SND.sfx||musGraphe())&&!paused&&AC.state!=='running')AC.resume(); }catch(e){} } // (2026-10-14, session SON) musique branchée : un contexte « interrupted » se relance même SON coupé
  addEventListener('touchend',audioKick,{passive:true});
  addEventListener('touchstart',audioKick,{passive:true}); // au plus tôt : dès que le doigt se pose
  // ---- retour dans l'appli : l'écran se rendormirait, l'audio resterait suspendu ----
  addEventListener('visibilitychange',function(){
    // (2026-09-26) l'appli passe en arrière-plan en pleine course : la pause générale a gelé le jeu, mais sans panneau — au retour,
    // un jeu figé, volant mort, et « PAUSE » écrit dans un #msg masqué. On ouvre le vrai panneau : REPRENDRE attend sous le pouce.
    if(document.hidden){ if(started&&!gameOver&&paused&&pan&&(!pan.classList.contains('open')||pan.classList.contains('sortant'))){feuilleOuvre(pan,'open');panSync();} return; } // (2026-09-29) « sortant » : parti pendant le 3-2-1 qui suit REPRENDRE — le compte s'annule, le panneau revient
    // (2026-09-29) une course qui a DÉMARRÉ pendant que l'appli dormait (REJOUER puis bouton d'accueil dans la foulée) : au retour elle
    // roule sans pause ni panneau — on la met en pause, REPRENDRE sous le pouce
    if(started&&!gameOver&&mode==='boom')boomSkip(); // (2026-10-14, chasse aux bugs) retour pendant l'explosion : comme le ⏸ (gearOpenHandler) — vers l'écran de fin, jamais une PAUSE sur la caisse qui brûle
    else if(started&&!gameOver&&!paused&&pan&&!pan.classList.contains('open'))panOpen(true);
    wakeAsk(); audioKick(); });
  /* ===== L'APPEL ENTRANT MET LA COURSE EN PAUSE (24/10, débogage sortie iOS : « appel entrant / Siri / centre de contrôle ») =====
     Sur iPhone, un appel (la bannière), Siri ou une alarme passent PAR-DESSUS le jeu sans le cacher : pas de visibilitychange, la course
     continuait muette pendant que le pouce allait décrocher — la caisse tombait, la partie était perdue. Le seul signe fiable : le
     contexte audio passe « interrupted » (état propre à WebKit). On le guette et on ouvre la PAUSE, exactement comme au retour
     d'arrière-plan : REPRENDRE attend sous le pouce, et le toucher qui reprend relance le contexte (audioKick, repriseCompte).
     Le contexte n'existe qu'après initAudio : on se branche au premier toucher, une fois par contexte (`_appelGuette`). */
  function appelGuette(){ try{ if(!AC||AC._appelGuette||!AC.addEventListener)return; AC._appelGuette=1; const ac9=AC;
    ac9.addEventListener('statechange',function(){ try{
      if(ac9===AC&&ac9.state==='interrupted'&&started&&!gameOver&&!paused&&mode!=='boom'&&pan&&!pan.classList.contains('open'))panOpen(true);
      /* (24/10, relecture : « l'appel tombe pendant le 3-2-1 ») la pause existe déjà, mais REPRENDRE vient d'être touché : la feuille descend
         (sortant ou fermée) et le compte tourne (repriseCompte.t) — il relançait la course sous la bannière d'appel. La feuille remonte, ce qui annule le compte
         (même geste que le retour d'arrière-plan, plus haut). */
      else if(ac9===AC&&ac9.state==='interrupted'&&started&&!gameOver&&paused&&repriseCompte.t&&mode!=='boom'&&pan&&(!pan.classList.contains('open')||pan.classList.contains('sortant'))&&!window.__setPause){feuilleOuvre(pan,'open');panSync();}
    }catch(e){} }); }catch(e){} }
  addEventListener('touchend',appelGuette,{passive:true}); appelGuette();
  /* (même passe) l'appli passe derrière en plein appui : le volant est lâché plus haut (stUp), la NITRO et les flèches aussi — comme au
     `blur` (voir curseurs), qu'une WebView n'envoie pas toujours. Sans ça, une touche restée « enfoncée » repartait au REPRENDRE. */
  addEventListener('visibilitychange',function(){ if(!document.hidden)return; try{ for(const k in keys)keys[k]=false;
    document.querySelectorAll('#tNitro.on,#tLeft.on,#tRight.on,#tUp.on,#tDown.on').forEach(function(e){e.classList.remove('on');}); }catch(e){} });
  /* (même passe) LE CHAMP DE LA FENÊTRE (#modC : « colle un code de sauvegarde, ou un code secret ») : comme le pseudo (boost-depart) et
     la plaque, iOS pouvait laisser la page remontée après la fermeture du clavier — on la recale, seulement si elle a bougé. */
  try{ const mc9=$t('modC'); if(mc9)mc9.addEventListener('blur',function(){setTimeout(function(){try{if(scrollX||scrollY)scrollTo(0,0);}catch(e){}},60);}); }catch(e){}
  // ---- BASCULE D'ORIENTATION : iOS annonce des dimensions PÉRIMÉES — on recadre après le pivot ----
  const reflow=function(){ clearTimeout(reflow._t); reflow._t=setTimeout(function(){ // (2026-09-29) une seule fois par rafale (clavier, barre d'adresse) : applyDPR réalloue toutes les cibles de rendu
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); fovFit(); applyDPR(); },280); };
  addEventListener('orientationchange',reflow);
  if(window.visualViewport)visualViewport.addEventListener('resize',reflow);
  // ---- saisie du nom : clavier adapté, pas de correction automatique sur un pseudo de 8 lettres ----
  try{ const ni=$t('nameInput');
    if(ni){ni.setAttribute('autocapitalize','characters');ni.setAttribute('autocorrect','off');ni.setAttribute('enterkeyhint','done');} }catch(e){}

  /* ================= LA COQUE : ACCUEIL · MORT · MODES · RÉGLAGES =================
     Un routeur d'écrans minuscule (une classe .on) plutôt qu'un menu qui déroule tout d'un bloc.
     C'est la grammaire des jeux mobiles qui marchent : UN écran = UNE décision, un bouton qui saute
     aux yeux, et le reste rangé derrière des icônes. Le classement a disparu (il ne servait à rien
     sur téléphone). Le GARAGE, lui, n'a pas d'écran ici : son bouton ouvre le VRAI atelier 3D. */
  const mob=$t('mob'),mScr={home:$t('mHome'),dead:$t('mDead'),modes:$t('mModes'),set:$t('mSet'),shop:$t('mShop')};
  let mCur='home';
  try{ const ne=$t('nameEntry'),dd=$t('mDead'); // la saisie de record vient s'asseoir DANS l'écran de mort
    if(ne&&dd){const rp=dd.querySelector('.mFin');dd.insertBefore(ne,rp?rp.nextSibling:null);} /* REJOUER en tête : le record se signe ensuite, sans repousser l'action principale sous le clavier */ }catch(e){}
  // (2026-09-28) après une mort, MENU ramène à l'ACCUEIL : la partie finie reste « finie » (started && gameOver) jusqu'au prochain
  // départ, mais la racine devient l'accueil — le RETOUR des sous-écrans y revient, plus sur l'écran de mort (voir accueilRetour)
  function mRoot(){return (started&&gameOver&&!MENUV.retour)?'dead':'home';}
  /* LE ROUTEUR, AVEC UN SENS (2026-09-25, transitions App Store). Chaque écran a une PROFONDEUR : aller plus loin
     POUSSE (l'écran arrive de droite, l'ancien file à gauche), revenir RAMÈNE (l'inverse), changer de racine
     (accueil ↔ mort) fond l'un dans l'autre. L'écran qui part garde `.sort` le temps de s'effacer, posé EN DESSOUS
     en absolu : il ne pousse pas la page. `sansSortie` : l'overlay vient d'apparaître, il n'y a rien à faire partir. */
  const PROF={home:0,dead:0,modes:1,set:1,shop:1},SENS=['on','sort','avant','retour','racine','revu'];
  function mGo(id,sens,sansSortie){
    if(!sansSortie)uiGarde(); // (2026-09-29) le 2e tap d'un double-tap ne tombe pas sur l'écran qui arrive
    const prev=mCur,de=mScr[prev],vers=mScr[id];mCur=id;
    if(!sens)sens=(prev===id)?'racine':((PROF[id]|0)>(PROF[prev]|0)?'avant':(PROF[id]|0)<(PROF[prev]|0)?'retour':'racine');
    for(const k in mScr){const e=mScr[k];if(!e)continue;clearTimeout(e._sortT);e.classList.remove.apply(e.classList,SENS);}
    if(de&&de!==vers&&!sansSortie&&!REDUCED_MOTION){de.classList.add('sort',sens);
      de._sortT=setTimeout(function(){de.classList.remove('sort',sens);},220);}
    if(vers){ void vers.offsetWidth; // reflow : le MÊME écran rejoue son entrée (retour d'atelier, écran de mort)
      for(let i=0;i<vers.children.length;i++)vers.children[i].style.setProperty('--i',Math.min(i,9));
      vers.classList.add('on',sens); }
    if(overlay){overlay.scrollTop=0;overlay.setAttribute('data-ecran',id);} // le fond suit l'écran : l'accueil laisse voir le monde
    mFill();
    if(id==='home')try{garAccueil();}catch(e){} } // (2026-09-30, sketch de Léo) « le garage devient le nouveau menu » : l'ACCUEIL ouvre l'atelier
  /* (2026-10-14, charte 6, demande de Sacha) TOUS LES REGLAGES DEPUIS LA PAUSE. La ligne du panneau de pause ouvre l'écran complet #mSet PAR-DESSUS
     la course en pause (la pause reste ouverte dessous, `paused` ne bouge pas) ; son ◀ referme l'écran et rend la pause, mise à jour (panSync).
     `window.__setPause` est le drapeau : TCTL.ov est posé à la main (l'observateur de l'overlay et le tick de 140 ms ne rouvrent pas la racine
     à la place de l'écran), mTap('back') et Échap le lisent. Ouvert depuis l'accueil, #mSet ne passe pas par ici : son ◀ ramène toujours à l'accueil. */
  function setPauseOuvre(){
    if(window.__setPause||!(started&&!gameOver&&paused))return;
    window.__setPause=true; // (2026-10-14, session SON) plus de uiClic('nav') ici : panTapHandler sonne déjà « nav » pour TOUS LES REGLAGES (c'était nav PUIS appui principal)
    try{uiGarde();}catch(e){} // (2026-10-14, chasse aux bugs) mGo(…,true) saute le verrou du double-tap : le 2e tap d'un double-tap sur la ligne tombait sur une ligne de RÉGLAGES (bascule en silence)
    document.body.classList.add('setPause');document.body.classList.remove('setPauseSort');
    overlay.setAttribute('data-ecran','set'); // AVANT l'affichage : mGo force un reflow avant de le poser, et le fond (transition d'opacité de ::before) partait de l'accueil (transparent) → la pause se lisait derrière les réglages
    TCTL.ov=true;overlay.style.display='flex';
    mGo('set','avant',true); }
  function setPauseFerme(){
    if(!window.__setPause)return;
    window.__setPause=false;
    try{uiGarde();}catch(e){} // (2026-10-14, chasse aux bugs) même verrou à la sortie : le 2e tap du double-tap sur le ◀ rejouait mTap('back') → mGo('home') (accueil qui clignote), puis tombait sur la pause
    if(mScr.set)mScr.set.classList.remove('on','sort','avant','retour'); /* (2026-10-14, UX 8) interface par défaut : la page RÉGLAGES s'éteint à l'instant (seul le fond s'efface en fondu) — ses lignes restaient lisibles sous la pause translucide */
    const fin=function(){ document.body.classList.remove('setPause','setPauseSort'); overlay.style.display='none'; TCTL.ov=false;
      for(const k in mScr){const e=mScr[k];if(!e)continue;clearTimeout(e._sortT);e.classList.remove.apply(e.classList,SENS);}
      mCur=mRoot(); overlay.setAttribute('data-ecran',mCur);
      try{panSync();}catch(e){} };
    if(REDUCED_MOTION){fin();return;}
    document.body.classList.add('setPauseSort'); setTimeout(fin,130); } // le fond d'encre s'efface en fondu sec (opacité seule), la pause réapparaît dessous
  window.__mHomeSur=function(){if(mCur!=='home')mGo('home','racine',true);else{try{mFill();}catch(e){}}}; // (passe qualité) déjà sur l'accueil (retour du garage) : on remplit quand même — la pastille GARAGE gardait le compte d'avant un achat // (2026-09-30) le garage-menu montre l'ACCUEIL, d'où que vienne le routeur (mGo('home') rappelle garAccueil → garMode('menu') : ici, mCur vaut déjà 'home')
  function mStatBox(v,l){return '<div class="mStat"><b>'+v+'</b><span>'+l+'</span></div>';}
  let mCntT=0;
  function mCount(el,to,direct){ // égrène le montant : départ franc, arrivée en douceur (ease-out cubique)
    if(!el)return;
    if(mCntT)clearInterval(mCntT);
    if(to<=0||direct){el.textContent=fmtC(Math.max(0,to));return;} // direct : on REVIENT sur l'écran (réglages, garage) — le compte ne se rejoue pas
    el.textContent=fmtC(0);let t0=0;const D=750,T0=performance.now()+(REDUCED_MOTION?0:360); // (2026-09-28) le ticket entre à 390 ms (section 21) : le compte part avec lui, en même temps que les notes (320 ms)
    mCntT=setInterval(function(){ if(performance.now()<T0)return; if(!t0)t0=performance.now();
      const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,3);
      el.textContent=fmtC(Math.round(to*e));
      if(k>=1){clearInterval(mCntT);mCntT=0;if(!REDUCED_MOTION){el.classList.remove('clac');void el.offsetWidth;el.classList.add('clac');}} // (charte v4) l'arrivée CLAQUE
    },28);
  }
  /* L'ÉCRAN DE MORT A UNE VOIX (2026-09-26, audit son) : l'écran le plus vu était muet. 300 ms après son apparition (la traîne du son
     de mort passe d'abord), huit notes de la gamme des pièces montent avec les compteurs, puis l'arrivée sonne — en fanfare si record.
     Une seule fois par mort (clé = l'instant de la mort) : mFill est rappelé à chaque retour sur l'écran. */
  function mCompteSon(rec){
    if(!TCTL.mortT||mCompteSon._k===TCTL.mortT)return;mCompteSon._k=TCTL.mortT;
    // (2026-09-28) `mCur` reste 'dead' après REJOUER (et au garage) : la fanfare partait au départ de la course suivante.
    // L'écran de mort, c'est aussi la partie FINIE et le menu VISIBLE.
    const ici=function(){return mCur==='dead'&&started&&gameOver&&overlay.style.display!=='none';};
    /* (2026-09-28, console de son) L'ÉCRAN DE MORT, CALÉ SUR SES NOUVELLES DURÉES (session INTERFACE). Enseigne à 80 ms · carte AURA à
       250 ms (son « NOUVEAU RANG ») · le montant s'égrène de 360 à 1110 ms : neuf crans de la gamme qui RALENTISSENT avec le compteur
       (chaque cran tombe quand le montant franchit un neuvième de plus du chemin : 43 ms d'écart au départ, 250 ms avant la pose),
       le dernier sur la quinte, puis la POSE sur l'accord (1110 ms) · un RECORD part à 810 ms pour que son TAAA (0,3 s) tombe pile sur
       la pose — sauf sur une fin de monde, qui a déjà sa fanfare · une caisse gagnée à la fin de la partie sonne quand tout est posé.
       0 $ versés : pas de compte (mCount affiche d'un coup), donc ni crans ni pose. La jauge des missions et le carnet : objRender. */
    if(SONV2){
      const s9=function(ms,id,o){setTimeout(function(){if(ici())try{sfx(id,o);}catch(e){}},ms);};
      const d9=REDUCED_MOTION?0:360,cpt=!!mCntT;
      s9(80,'mort.enseigne');
      if(commitExploits._rangMonte)s9(250,'ui.debloque');
      if(cpt){for(let j=0;j<9;j++)s9(d9+Math.round(750*(1-Math.sqrt(1-j/9))),'ui.compte',{st:sonPd(j)});s9(d9+750,'mort.compteFin');}
      if(rec)s9(d9+450,'ui.record');
      if(commitExploits._neuves&&!document.body.classList.contains('touch'))s9(1750,'caisse.debloquee'); /* sur téléphone la caisse gagnée n'est pas affichée (#mNew masqué) : pas de son sans image */
      if(rec)setTimeout(function(){if(ici())pixBurst($t('mOverT'),34);},900);
      return;}
    for(let i=0;i<8;i++)setTimeout(function(){if(ici())try{chimeNote(noteP(i,1),0,.035,.06);}catch(e){}},320+i*85);
    setTimeout(function(){if(!ici())return;try{if(rec)rewardSfx('m3',3);else{chimeNote(noteP(4,1),0,.08,.3);chimeNote(noteP(7,1),.06,.07,.36);}}catch(e){}},1040);
    if(rec)setTimeout(function(){if(ici())pixBurst($t('mOverT'),34);},900); // (charte v4) un record, ça se voit aussi : l'enseigne crache ses confettis
  }
  const MORT_FLOT=!/[?&]mort=ancien\b/.test(location.search); /* (2026-10-25) L'ÉCRAN DE MORT FLOTTANT (voir mFill) — `?mort=ancien` = les cartes d'avant */
  Object.assign(I18N,{'PARTIE':'THIS RUN','MOYENNE':'AVERAGE','VS MOY':'VS AVG'});
  window.dbgMortAura=function(a,moy,n,rec){if(a!=null&&started&&!gameOver)auraRun=Math.max(0,+a||0);if(moy!=null){SAVE.d.auraH={s:Math.round(moy*(n||10)),n:n||10};}if(rec!=null)SAVE.d.auraMax=Math.round(rec);return {partie:Math.round(auraRun),moyenne:SAVE.d.auraH,record:SAVE.d.auraMax};}; /* (banc) l'aura de la partie en cours (et la moyenne, le record) pour voir le graphe de l'écran de mort */
  function mFill(){ try{
    const b1=$t('mBest'),b2=$t('mBest2'),mc=$t('mCar');
    if(b1)b1.textContent=fmtC(best); if(b2)b2.textContent=fmtC(best);
    if(mc)mc.textContent=TR('CAISSE')+' : '+TR(CARS[Math.min(CARS.length-1,Math.max(0,level|0))].name);
    if(mCur==='dead'){
      const m9=Math.round(money),rec=!SANDBOX&&money>(RUNX.best0||0)&&money>START_CASH+.5&&(RUNX.best0||0)>0; // (2026-10-14, charte 6, Sacha : les badges restent) un record bat un record PRÉCÉDENT (> 0) : à la toute 1re partie, aucun // (2026-09-25) montants BRUTS : l'arrondi manquait un record sur deux, et 1,61 $ n'est pas un record
      /* VERSÉS AU COMPTE = ce que la banque a VRAIMENT gagné depuis le départ — le magot MONTE au lieu de s'afficher : 750 ms qui font le sel de
         la fin de run. (2026-09-28) C'était le seul virement de la course (`_vire`) : « $ 37 VERSÉS » au-dessus d'une barre d'objectif « +$ 537 »,
         qui compte aussi la prime du permis et celles des défis. Même calcul que la barre (objRender) : les deux chiffres ne se contredisent plus. */
      {const d9=$t('mDead');if(d9)d9.classList.toggle('m5',MORT_FLOT);} /* (2026-10-25) l'écran flottant : son style (css/mort-flottante.css) ne vise que #mDead.m5 */
      const prem9=mFill._mort!==TCTL.mortT;mFill._mort=TCTL.mortT; // (2026-09-29) le compte (montant, aura) ne se joue qu'à la PREMIÈRE apparition de l'écran de cette mort
      {const v9=RUNX.verse!=null?RUNX.verse:Math.max(0,Math.floor(bank())-Math.floor(RUNX.bank0||0)),c9=$t('mCash'),t9=$t('mCashTot');
       if(c9)c9.style.setProperty('--n',fmtC(v9).length); // le corps du montant se règle sur sa longueur finale (« $ 128,4 k » tient debout)
       if(t9){const j9=jourFinTexte();t9.textContent=TR('COMPTE')+(LANG==='fr'?' : ':': ')+fmtSolde(bank()); /* (2026-10-14, GAMEPLAY) le ×2 du jour et la prime de série se disent dans la ligne qui existe déjà */
        if(j9){const i9=t9.appendChild(document.createElement('i'));i9.className='mJour';i9.appendChild(document.createElement('u')).textContent=' · ';i9.append(j9.replace(/^ · /,''));}} /* (2026-10-15) …mais sur SA ligne (.mJour) : le texte reste « COMPTE : $ N · ×2 DU JOUR », le « · » est seulement masqué */
       mCount(c9,v9,!prem9);}
      const ot=$t('mOverT');
      // (2026-09-26, audit UX) LES RECORDS NE SE CONTREDISENT PLUS : le jeu criait « RECORD BATTU » sur l'AURA en course, et
      // l'écran de fin ne jugeait que l'argent. Le titre s'allume pour l'argent, l'AURA ou le MOTEUR — les héros de cet écran.
      // (2026-09-28) une AUTO-ÉCOLE QUITTÉE n'est pas une partie : ni « NOUVEAU RECORD ! » ni fanfare pour qui vient d'abandonner la leçon
      const tq9=!SANDBOX&&!!TUTO.quitte,recA=!SANDBOX&&!!CHA.recB&&CHA.rec>0,recM=!SANDBOX&&engTier>(RUNX.engAvant|0)&&(RUNX.engAvant|0)>0,recT=!tq9&&(rec||recA||recM);
      ot.textContent=TR(SANDBOX?'ENTRAINEMENT TERMINE':tq9?'AUTO-ECOLE INTERROMPUE':(recT?'NOUVEAU RECORD !':'GAME OVER'));
      {const c9=$t('mCash'),cl=c9&&c9.parentNode;if(cl){let em=cl.querySelector('em.mCashRec');if(!em){em=document.createElement('em');em.className='mCashRec';cl.appendChild(em);}
        em.textContent=TR('RECORD !');em.style.display=(rec&&!tq9)?'':'none';}} // (2026-09-30, R7-3) le record d'ARGENT se VOIT : « NOUVEAU RECORD ! » s'allumait sans dire lequel, la plaque d'argent était la seule sans badge
      ot.style.color=recT?'var(--aura)':'var(--neoR)'; // (2026-09-28, charte au complet) l'or est au lingot REJOUER : le record parle la couleur de l'aura
      {const CAUSES={eau:'AU FOND DE L EAU',lave:'ENGLOUTI PAR LA LAVE',roche:'ECRASE SUR LA ROCHE',paroi:'ENCASTRE DANS LA PAROI',canyon:'AU FOND DU CANYON',sable:'ENSEVELI DANS LE SABLE',oasis:"AU FOND DE L'OASIS",obelisque:"CONTRE L'OBELISQUE",pyramide:'CONTRE LA PYRAMIDE',sol:'AU PIED DES TOURS',riviere:'A LA RIVIERE !',air:"TROP LONGTEMPS EN L'AIR : POSE-TOI AVANT",vide:'TOMBE DANS LE VIDE',tour:'ENCASTRE DANS UNE TOUR',arret:"6 S A L'ARRET : ROULE OU CREVE",police:'DERNIER DE LA MEUTE',
         facade:'ENCASTRE DANS UNE FACADE',seine:'A LA SEINE !',arbre:'ENCASTRE DANS UN ARBRE',poudreuse:'ENSEVELI DANS LA POUDREUSE',glace:'FRACASSE SUR LA GLACE',sousbois:'ECRASE DANS LES FOUGERES',pic:'ENCASTRE DANS UN PIC DE JADE'}; /* (chasse aux bugs) la mort 'pic' des PICS DE JADE n'avait pas de cause sous GAME OVER */ I18N['ENCASTRE DANS UN PIC DE JADE']='SMASHED INTO A JADE PEAK';
       const mc9=$t('mCause'),k9=SANDBOX?'':(CAUSES[mortCause]||'');if(mc9){mc9.textContent=k9?TR(k9):'';mc9.style.display=k9?'':'none';mc9.style.color='';if(MORT_VOIR&&!SANDBOX){let v9=document.getElementById('mCauseVoir');if(!v9){v9=document.createElement('div');v9.id='mCauseVoir';v9.style.cssText='position:absolute;left:6px;right:6px;bottom:3px;z-index:99;padding:3px 8px;font:600 11px/1.3 monospace;color:#ffd75e;background:rgba(0,0,0,.6);text-align:center;pointer-events:none;white-space:normal';$t('mDead').appendChild(v9);}v9.textContent=(k9?TR(k9):'(aucun texte)')+' ['+(mortCause||'?')+'] '+mortInfo;}}}
      mCompteSon(recT);
      // Ce qui se gagne DANS une partie, c'est le MOTEUR (la caisse, elle, se choisit au garage) :
      // c'est donc lui qu'on montre en fin de run, pas un palier de voiture qui ne veut plus rien dire.
      {const rj=document.querySelector('#mDead [data-m="replay"]');if(rj){const k9=tq9?'REPRENDRE':'REJOUER',tx=TR(k9);let sp=rj.querySelector('span');if(!sp){sp=document.createElement('span');rj.textContent='';rj.appendChild(sp);}
        sp.textContent=tx;if(sp.dataset.fr)sp.dataset.fr=k9;rj.style.setProperty('--nb',Math.max(7,tx.length));}} // (le texte vit dans son <span> : c'est lui que la règle « tient dans le lingot » dimensionne sur --nb signes) // (2026-09-29) après une leçon QUITTÉE, le lingot relance la leçon : il le dit
      {let nG=shopAPortee();for(let i=0;i<CARS.length;i++){const p9=carPrice(i);if(p9&&!carUnlockedVrai(i)&&p9<=bank())nG++;} // (2026-09-29, audit) la pastille du GARAGE vit aussi ici : le débutant enchaîne REJOUER et ne revoit pas l'accueil
       const bg=$t('bdGar2');if(bg){bg.textContent=nG||'';bg.classList.toggle('on',nG>0);}}
      const nw=$t('mNew'),E=ENGINE_TIERS[Math.min(ENGINE_TIERS.length-1,Math.max(0,engTier|0))];nw.style.display='none';
      { // LES DEUX CARTES : l'AURA gagnée (et le rang), le MOTEUR atteint (et s'il bat ton record)
        const au=commitExploits._aura||0,rg=commitExploits._rangMonte,eN=engTier>(RUNX.engAvant|0),hx=(typeof engNeon==='function')?engNeon(E.col||0xffd75e):'#'+(E.col||0xffd75e).toString(16).padStart(6,'0'); /* (2026-09-28) le néon du palier, comme la carte moteur de la course (session UHD) : la rouille et l'acier ne font plus une carte boueuse */
        const h=$t('mHero'),fA=function(v){return fmtAura(v).replace(/[\u202f\u00a0]/g,' ');}; // (2026-09-28) le formateur d'aura du HUD, sans les espaces fines insécables que la police pixel n'a pas (même geste que le compteur du garage)
        /* (2026-09-25) LE « PRESQUE » : mourir à 3 pièces du V6, c'est LA raison de relancer — et c'était invisible. La carte MOTEUR dit la
           distance au palier suivant quand il AURAIT été un record (sinon le record à battre) ; la carte AURA dit ce qui manque au rang suivant,
           et sa barre se remplit de la partie. ⚠ SAVE.d.aura contient DÉJÀ la partie (commitExploits) : ne pas rajouter auraRun. */
        const ea=RUNX.engAvant|0,nx=ENGINE_TIERS[engTier+1],mq=nx?nx.coins-coinsGot:0,
              pr=!!nx&&mq>0&&engTier+1>ea&&mq<=Math.max(3,Math.ceil((nx.coins-E.coins)*.3)),
              ci=!eN&&ea>engTier?ENGINE_TIERS[ea]:null,an=auraNext(),a1=SAVE.d.aura||0,bas=AURA_RANKS[auraRank()].v;
        /* (2026-09-29, Sacha : « on ne doit pas compter l'aura, c'est juste le score d'une partie ») : la carte dit le SCORE de la partie —
           plus de « + » (qui se lisait « ajouté à un total »), plus de total de carrière, plus de rang ni de jauge ; dessous, le meilleur
           score (ou RECORD ! quand il vient de tomber). */
        /* L'ÉCRAN DE MORT FLOTTANT (2026-10-25, Sacha : « plus de fenêtres, un truc flottant, aérien, moderne ») : le MOTEUR flotte dans le vide,
           plus gros, avec son seul palier ; l'AURA devient un graphe en bougies, lisible d'un coup d'œil — la PARTIE (violet), ta MOYENNE et
           ton RECORD. La moyenne et le record sont ceux d'AVANT la partie (commitExploits) : le graphe dit si tu as fait mieux que d'habitude.
           `?mort=ancien` = les deux cartes d'avant. */
        if(h&&MORT_FLOT){
          const n9=(SAVE.d.auraH&&SAVE.d.auraH.n)|0,moy0=commitExploits._moy||0,moyV=Math.round(moy0>0?moy0:(n9<=1?au:0)),
                recV=Math.max(commitExploits._recAvant||0,SAVE.d.auraMax||0,au),M9=Math.max(1,au,moyV,recV),
                hP=function(v){return Math.max(4,Math.round(v/M9*78));},
                bg9=function(k,v,lb){return '<div class="m5Col m5'+k+'" style="--h:'+hP(v)+'%"><div class="m5Pied"><span class="m5Val">'+fA(v)+'</span><i class="m5Meche"></i><i class="m5Corps"></i></div><small>'+TR(lb)+'</small></div>';};
          let vd9='';
          if(!tq9&&au>0&&(commitExploits._recAvant||0)>0&&(recA||au>commitExploits._recAvant))vd9='<em class="m5Vd rec">'+pxi('etoile')+' '+TR('RECORD !')+'</em>';
          else if(!tq9&&moy0>0&&au>0){const p9=Math.round((au-moy0)/moy0*100);vd9=p9>=1?'<em class="m5Vd up">▲ +'+p9+' % '+TR('VS MOY')+'</em>':p9<=-1?'<em class="m5Vd down">▼ '+p9+' % '+TR('VS MOY')+'</em>':'<em class="m5Vd">= '+TR('MOYENNE')+'</em>';}
          h.className='mHero m5Hero';
          h.innerHTML='<div class="m5Mot" style="--ec:'+hx+'"><div class="m5Scene"><i class="m5Halo"></i><canvas class="hMotCv" width="480" height="321"></canvas><i class="m5Ombre"></i></div>'
            +'<div class="m5Pal'+(eN&&!tq9?' rec':'')+'"><span>'+TR('PALIER')+'</span><b>'+(engTier+1)+'</b></div></div>'
            +'<div class="m5Aura"><div class="m5Tete"><small>'+TR('AURA')+'</small><b id="mAuraV">0</b>'+vd9+'</div>'
            +'<div class="m5Graphe"><i class="m5Ligne" style="--h:'+hP(recV)+'%"></i>'+bg9('P',au,'PARTIE')+bg9('M',moyV,'MOYENNE')+bg9('R',recV,'RECORD')+'</div></div>';
        }
        else if(h){h.className='mHero';h.innerHTML='<div class="hCard hAura"><small>'+TR('AURA')+'</small><b id="mAuraV" style="--n:'+fA(au).length+'">0</b>'
            +(recA&&!tq9&&au>0?'<em>'+TR('RECORD !')+'</em><div class="hNx hNxC6">'+TR('MEILLEUR')+' <span>'+fA(Math.max(SAVE.d.auraMax||0,au))+'</span></div>':'<div class="hNx">'+TR('MEILLEUR')+' <span>'+fA(Math.max(SAVE.d.auraMax||0,au))+'</span></div>')+'</div>' /* (2026-10-14, charte 6) cartes JUMELLES : la sous-ligne MEILLEUR est toujours là (.hNxC6 = celle que seule la charte 6 montre, quand le badge RECORD ! se tait) */
          +'<div class="hCard hMot hMot3" style="--ec:'+hx+'"><small>'+TR('MOTEUR ATTEINT')+'</small><canvas class="hMotCv" width="480" height="321"></canvas>'
            +'<div class="hMotN"><i>'+TR('PALIER')+'</i>'+(engTier+1)+'</div>'+(eN&&!tq9?'<em>'+TR('RECORD !')+'</em>':'')
            +(pr?'<div class="hNx hPres"><span>'+presqueTxt(mq)+'</span><span>'+pxi('haut')+' '+TR(nx.n)+'</span></div>':ci?'<div class="hNx hRec"><span>'+TR('RECORD')+'</span><span>'+TR('PALIER')+' '+(ea+1)+'</span></div>':'' /* (29/09, DEBUGGING) deux morceaux insécables : le chiffre ne tombe plus seul à la ligne */)+'</div>'; // (2026-09-28) « RECORD · PALIER 18 » : le nom du moteur (STATOREACTEUR) cassait la ligne ; la carte parle déjà en paliers
        }
        if(h){ /* (2026-10-25) les deux dessins (flottant ou cartes) partagent le moteur 3D et le compte de l'aura */
          {const cv9=h.querySelector('.hMotCv');ENG_MORT.cv=cv9;ENG_MORT.ctx=cv9?cv9.getContext('2d'):null;} // le moteur 3D y tourne (engVigRender)
          {const av9=$t('mAuraV');if(av9){av9.textContent=fA(prem9?0:au);av9.classList.toggle('zero',au<=0);}if(prem9&&av9)setTimeout(function(){countUp(av9,au,function(v){return fA(v);});},REDUCED_MOTION?0:260);} // la carte AURA est distribuée à 250 ms : le chiffre monte quand on la voit
          if(an){const u=$t('mAuraB'),D=Math.max(1,an.seuil-bas),w1=Math.min(100,(a1-bas)/D*100),w0=rg?0:Math.max(0,(a1-au-bas)/D*100);
            if(u){u.style.width=w0.toFixed(1)+'%';requestAnimationFrame(function(){requestAnimationFrame(function(){u.style.width=w1.toFixed(1)+'%';});});}}}
      }
      /* (2026-10-25, Sacha) les quatre chiffres (MULTI MAX, KM/H MAX, NIVEAU, FRÉNÉSIE) laissent leur place à GARAGE et RÉGLAGES (#mDuo) */
      if($t('mStatsBox'))$t('mStatsBox').innerHTML=mStatBox('×'+Math.max(1,runStats.xMax|0),TR('MULTI MAX'))+ /* (2026-09-26) « 0 FIGURES » à côté de « +820 AURA » : le compteur ne voyait que l'ancienne chaîne en $ */mStatBox(Math.round(runStats.vmax),'KM/H MAX')+mStatBox(LVL.cur?LVL.n:runStats.zones+1,TR('NIVEAU')) // (2026-09-27) en carrière : le VRAI numéro du niveau · (2026-09-30) partout : celui de la bannière (runStats.zones compte la zone de l'école : « NIVEAU 2 » après « NIVEAU 1 »)
        // (v3) la plus longue FRÉNÉSIE de la partie — .rec quand elle a battu le record (le style : session UI)
        +(function(){const t9=RUNX.frenMax||0,rc=t9>=5&&t9>=(SAVE.d.frenRec||0)-.05;return '<div class="mStat mFren'+(rc?' rec':'')+(t9<1?' zero':'')+'"><b>'+frenDuree(t9)+'</b><span>'+TR(rc?'RECORD':'FRENESIE')+'</span></div>';})();
      {const o9=$t('mObj');if(o9)objRenderV2(o9);} // (l'ancien objRender gardait l'absence d'élément)
    }else if(mCur==='shop'){
      if(!SAVE.d.shopVu){SAVE.d.shopVu=1;SAVE.flush();}
      shopRender();
    }else if(mCur==='home'){
      try{m2Portes();}catch(e){} // la porte MISSIONS : une case allumée par mission prête
      soldeEcrit($t('mBankV'),bank()); /* (2026-10-14) le SOLDE PRÉCIS */
      let nG=shopAPortee();for(let i=0;i<CARS.length;i++){const p9=carPrice(i);if(p9&&!carUnlockedVrai(i)&&p9<=bank())nG++;}
      const bg=$t('bdGar'),bs=$t('bdShop');
      if(bg){bg.textContent=nG||'';bg.classList.toggle('on',nG>0);} // tout ce qui s'achète en argent du jeu est au GARAGE
      if(bs){bs.textContent='NEW';bs.classList.toggle('on',!SAVE.d.shopVu);} // allumée en permanence, elle apprenait à l'œil à ignorer les pastilles
    }else if(mCur==='modes'){
      const set9=function(id,sid,on){const c=$t(id),s=$t(sid);
        if(c){c.classList.toggle('on',on);c.classList.toggle('off',!on);} if(s)s.textContent=on?'ON':'OFF';};
      set9('mmSurv','mmSurvS',SURV.armed);
      set9('mmSand','mmSandS',SANDBOX);
    }else if(mCur==='set'){
      const sv=function(id,txt,on){const e=$t(id);if(e){e.textContent=txt;e.parentNode.classList.toggle('off',!on);}};
      sv('mvSnd',SND.sfx?'ON':'OFF',SND.sfx);
      {const i9=$t('mvSnd');const x9=i9&&i9.parentNode.querySelector('.pxi');if(x9)x9.className='pxi pxi-'+(SND.sfx?'son':'muet');} // (2026-09-28) le même haut-parleur que la pause : barré quand le son est coupé
      sv('mvMus',SND.music?'ON':'OFF',SND.music);
      sv('mvVib',SND.vib?'ON':'OFF',SND.vib);
      sv('mvVolH',TR(volSens()<0?'MONTE':'PLONGE'),true);
      sv('mvVolInv',volInv()<0?'ON':'OFF',volInv()<0);
      sv('mvGau',TR(GAU?'GAUCHER':'DROITIER'),true);
      sv('mvIncl',TR(cmdMode()==='incl'?'INCLINAISON':cmdMode()==='fleches'?'FLECHES':'VOLANT'),true);
      sv('mvFigG',TR(figGlisseOn()?'GLISSER':'2 TAPS'),true); // (2026-10-15) LA FIGURE AU GLISSÉ
      sv('mvCtl',TR(TCTL.pad?'FLECHES':'VOLANT'),true);
      sv('mvQ',TR(qLbl()),true);
      sv('mvLang',LANG.toUpperCase(),true);

      {const e9=$t('mvTuto');if(e9){const on9=!SAVE.d.permis;e9.hidden=false;e9.textContent=on9?'+'+fmtC(500):TR('REVOIR');}} /* (2026-10-14, charte 6) la ligne s'appelle AUTO-ECOLE, sa valeur dit le geste (REVOIR) — ou la prime */ // (2026-09-29, audit) tant que la prime n'a pas été versée, REVOIR L'AUTO-ÉCOLE le dit
      volUI();
    }
  }catch(e){} }
  /* (2026-09-28, console de son) LE RÔLE DU CLIC DE LA COQUE. Le clic part AVANT la bascule (voir mTap) : un interrupteur annonce donc
     l'état qu'il VA prendre. JOUER / REJOUER font le bruit de MOTEUR (2026-10-16, avant : l'appui principal, or) ; SON sonne après sa propre bascule (plus bas). */
  function mRole9(a){
    if(a==='play'||a==='replay')return 'jouer'; // (2026-10-16, Sacha) le bruit de MOTEUR (ui.jouer)
    if(a==='back'||a==='menu')return 'retour';
    if(a==='mus')return SND.music?'off':'on';
    if(a==='vib')return SND.vib?'off':'on';
    if(a==='volh'||a==='figg')return 'onglet';
    if(a==='surv')return SURV.armed?'off':'on';
    if(a==='park')return PARK.on?'off':'on';
    if(a==='sand')return SANDBOX?'off':'on';
    if(a==='q'||a==='lang'||a==='ctl')return 'onglet';
    if(a==='wipe')return 'danger';
    return 'nav';
  }
  /* LE PASSAGE DIRECT (2026-10-17, session UI-REVUE, Sacha : « soigne les transitions entre chaque écran, qu'elles soient fluides »).
     Mesuré au banc (390×844, chrono des classes de #wipe) : ACCUEIL → RÉGLAGES (ou ACHAT, MODES) passait par le volet pixel — couvrir
     160 ms, fermer l'atelier dessous (closeGarage : caisse rebâtie, ciel repeint, une image de 83 ms), découvrir 280 ms avec une image de
     133 ms EN PLEIN balayage — ~800 ms dont un palier sombre, pour une simple page de réglages ; et le RETOUR refaisait tout à l'envers
     (openGarage sous un second volet). L'accueil, c'est l'atelier en mode menu (body.garMenuH) avec #overlay forcé par-dessus : la page
     peut s'y poser SANS fermer l'atelier — son fond (::before, opaque, fondu en --t-slow) recouvre le ciel qui continue de vivre dessous,
     la page entre avec le langage de la coque (sortie 150 ms, cascade) et le RETOUR n'a plus qu'à la retirer (mGo('home') → garAccueil :
     l'atelier est déjà là). Le volet reste pour les vrais changements de DÉCOR (atelier ↔ course, fin → accueil, garage ↔ accueil).
     `?menupasse=0` = le volet comme avant. */
  const MENU_PASSE=!/[?&]menupasse=0\b/.test(location.search);
  function surAccueilCiel(){return MENU_PASSE&&garageOn&&!GAR.go&&!ecranWipe._on&&document.body.classList.contains('garMenuH');}
  function mTap(a,el){
    if(a!=='snd'){ if(a==='tuto'||a==='shopRestore')hap(8); /* (2026-10-14, session SON) ces deux-là répondent par un toast coche (ui.ok) : le résultat passe devant le clic (avant : nav + ok, deux sons) */ else uiClic(a==='shopSoon'&&!(el&&el.hasAttribute('data-car'))?'refus':mRole9(a)); /* « BIENTÔT DISPONIBLE » = refus, comme le même mot sur la plaque verrouillée du garage */ }uiPop(el);if(a==='play'||a==='replay')pixBurst(el,16); // chaque bouton REBONDIT ; JOUER lâche une gerbe — (2026-09-28) SON : le clic part APRÈS la bascule (plus bas)
    if(a==='replay'&&started&&gameOver){ m2Rejoue(); /* (2026-10-16) LES MISSIONS v2 : les parties enchaînées */ const r9=function(){ DEPMUS.sort=performance.now(); goImmersive(); ecranWipe(function(){ if(started&&gameOver){ tutoArme(); resetGame(); } }); }; r9(); } // REJOUER : tout de suite, sans repasser par l'atelier — mais par un fondu (la piste neuve se construit DESSOUS) · (2026-09-28) tutoArme : « REVOIR L'AUTO-ÉCOLE » promet le PROCHAIN départ, REJOUER compris (sans effet si elle est déjà faite)
    else if(a==='play'&&jadePlayOk()){ const go9=function(){goImmersive();jadeJouer();}; // (2026-10-12, Léo) le JOUER lance le SOLEIL DE JADE, avec sa musique
      if(SAVE.d.facile==null&&!SAVE.d.tuto)Promise.resolve().then(go9);else go9(); }
    else if(a==='play'&&sfPlayOk()){ const go9=function(){goImmersive();classiqueJouer();}; // (2026-10-13, Sacha) le JOUER lance le MODE CLASSIQUE AU HASARD
      if(SAVE.d.facile==null&&!SAVE.d.tuto)Promise.resolve().then(go9);else go9(); }
    else if(a==='play'||a==='replay'){ // la partie sans fin : parc, Survivant armé, ?menu=leo
      if(a==='play'&&SAVE.d.facile==null&&!SAVE.d.tuto){Promise.resolve().then(function(){goImmersive();playViaGarage(true);});}
      else{goImmersive(); playViaGarage(true);} } // 1re partie = AUTO-ÉCOLE : tutoArme passe SOUS le voile (la reconstruction de la piste figeait le bouton avant qu'il monte)
    else if(a==='tuto'){ SAVE.d.tuto=0;SAVE.d.tutoProv=0;SAVE.flush();toast(pxi('coche')+' '+TR('L\'AUTO-ÉCOLE T\'ATTEND AU PROCHAIN JOUER')); }
    else if(a==='back'&&window.__setPause){ setPauseFerme(); } // (2026-10-14, charte 6) le ◀ des réglages ouverts depuis la pause rend la pause
    else if(a==='back'&&mCur==='set'&&window.__setGar){ window.__setGar=false; ecranWipe(function(){ openGarage(); }); } // (2026-10-19, Sacha) les RÉGLAGES ouverts par le ⚙ du garage : le RETOUR y ramène (comme __offGar)
    else if(a==='back'&&mCur==='shop'&&window.__offGar){ window.__offGar=false; ecranWipe(function(){ openGarage(); try{gModeVa('shop');}catch(e){} }); } // (2026-10-10) venue de la PORTE DES OFFRES du garage : le RETOUR y ramène
    else if(a==='back')mGo(mRoot());
    else if(a==='mis'){ if(started&&gameOver&&!garageOn){GAR.aMis=true;ecranWipe(function(){ accueilRetour(); mGo('home','racine'); });} else garMissionsOuvre(); } // (2026-09-30) les MISSIONS vivent dans l'atelier (la constellation) — l'ancien écran #mMis n'est plus ouvert d'ici
    else if((a==='modes'||a==='set')&&garageOn){ if(surAccueilCiel())mGo(a); else ecranWipe(function(){ window.__mRetour=a; closeGarage(); }); } // (2026-09-30) depuis le garage-menu : l'atelier se ferme sous le volet, l'observateur de l'overlay ouvre l'écran (retour : le menu)
    else if(a==='modes'||a==='set')mGo(a);
    // (2026-09-28) MENU : l'écran de mort rend la main à l'ACCUEIL — sous le volet, la course est rangée et la vitrine revient
    else if(a==='menu'&&started&&gameOver){ /* (2026-10-25, Sacha : « la maison de l'écran de mort ramène à l'écran titre, GARAGE ouvre le garage ») plus de GAR.aGar ici : le bouton GARAGE (#mDuo) a pris ce rôle */ ecranWipe(function(){ accueilRetour(); mGo('home','racine'); }); }
    else if(a==='shop'){ if(surAccueilCiel())mGo('shop'); else ecranWipe(function(){ if(garageOn){window.__mRetour='shop';closeGarage();} else mGo('shop'); }); } // LA BOUTIQUE : l'écran des caisses en vrai argent (depuis le garage-menu : l'atelier se ferme d'abord)
    else if(a==='custom'){ ecranWipe(function(){openGarage();shopTab('peinture');}); } // la PERSONNALISATION (peinture, ailes, traînées) vit au GARAGE
    else if(a==='shopSoon'){ if(el&&el.hasAttribute('data-car'))shopPop(el); else toast(pxi('panier')+' '+TR('INDISPONIBLE')); } // (2026-10-01) la caisse SORT de la vitrine : la fenêtre d'achat (shopPop)
    else if(a==='shopRestore'){ toast(pxi('coche')+' '+TR('AUCUN ACHAT À RESTAURER')); } // LA BOUTIQUE : le même atelier 3D, onglet PEINTURE — on essaie sur la vraie caisse
    /* (2026-09-30, Léo : « quand je finis une partie et que j'appuie sur GARAGE, ça me renvoie sur l'ancien ») GARAGE ouvre LE GARAGE-MENU
       (profil, JOUER, missions, [NIVEAU], BOUTIQUE) — plus l'atelier en mode boutique. Après une partie, c'est le chemin de MENU (la course
       est rangée sous le volet, puis l'accueil = le garage). La boutique reste à un bouton (BOUTIQUE, en bas du garage). */
    /* (2026-09-30, Sacha : « c'est buggé, les boutons ne sont pas connectés ») GARAGE et MISSIONS, APRÈS UNE PARTIE, depuis le menu : la course
       était finie (started && gameOver restent vrais jusqu'au prochain JOUER) → ils repassaient par accueilRetour, qui ne rejoue qu'une fois
       (MENUV.retour) → le bouton ne faisait RIEN jusqu'à la partie suivante. L'atelier déjà ouvert (garageOn) = on y va tout droit. */
    else if(a==='garage'){ if(started&&gameOver&&!garageOn){ GAR.aGar=true; /* (2026-10-25) le bouton GARAGE de l'écran de mort ouvre le garage, pas l'écran titre */ }
      if(started&&gameOver&&!garageOn)ecranWipe(function(){ accueilRetour(); mGo('home','racine'); }); else ecranWipe(function(){ if(garageOn)garMode('boutique'); else openGarage(); }); } // (2026-09-30, Sacha : ses boutons) GARAGE = l'ATELIER (caisses, peinture, ailes, traînées) — le menu, on y est déjà
    else if(a==='surv'){ clic(survBtnEl); mFill(); }
    else if(a==='sand'){ SANDBOX=!SANDBOX; SAVE.d.sand=SANDBOX; SAVE.flush(); mFill(); }
    else if(a==='snd'){ clic(sndBtnEl); uiClic(SND.sfx?'on':'off'); mFill(); } // (2026-09-28) cliqué AVANT la bascule, le clic tombait sur SND.sfx encore faux : RALLUMER le son était muet et sans vibration (couper, lui, se tait — c'est juste)
    else if(a==='mus'){ clic(musBtnEl); mFill(); }
    else if(a==='vib'){ SND.vib=!SND.vib; SAVE.d.vib=SND.vib; SAVE.flush(); if(SND.vib)hap(14); mFill(); } // rallumées : elles se présentent d'une impulsion
    else if(a==='lang'){ langNext(); applyLangDOM(); mFill(); try{const v9=document.getElementById('mvVer');if(v9)v9.textContent=TR('VERSION')+' '+CC_VER.replace(/^LOCALE/,TR('LOCALE'));}catch(e9){} }
    else if(a==='volh'){ volhBascule(); mFill(); }
    else if(a==='volinv'){ volInvBascule(); mFill(); }
    else if(a==='gau'){ gauSet(!GAU); mFill(); }
    else if(a==='incl'){ cmdSet(cmdMode()==='volant'?'fleches':cmdMode()==='fleches'?'incl':'volant'); mFill(); }
    else if(a==='figg'){ figGBascule(); mFill(); } // (2026-10-15) FIGURES : 2 TAPS ⇄ GLISSER
    else if(a==='ctl'){ TCTL.pad=!TCTL.pad; TCTL.act=false; TCTL.id=null; TCTL.st=0; TCTL.sv=0;
      keys.ArrowLeft=keys.ArrowRight=false; document.body.classList.toggle('tpad',TCTL.pad);
      SAVE.d.tctl=TCTL.pad?'pad':'stick'; SAVE.flush(); mFill(); }
    else if(a==='q'){ SAVE.d.q=qSuivant(SAVE.d.q); SAVE.d.qChoisi=1; SAVE.flush(); applyQ(SAVE.d.q==='fast'); mFill(); }
    else if(a==='exp'){ const c9=SAVE.export();
      modale({titre:'MA SAUVEGARDE',texte:'Garde ce code : il restaure toute ta progression.',champ:c9,lecture:true,
        boutons:[{l:'COPIER',ic:'copier',cls:'pb-gold',v:1},{l:'FERMER',v:0}]}).then(function(r){
        if(!r.v)return;
        /* (2026-09-30, R7-11) sans presse-papier (page en http, fichier local, refus du navigateur), la feuille se fermait sans un mot : le joueur
           croyait avoir sauvegardé. Échec = un toast, et la feuille REVIENT avec le code à sélectionner à la main. */
        const rate9=function(){toast(pxi('croix')+' '+TR('COPIE IMPOSSIBLE : COPIE-LE A LA MAIN'));
          modale({titre:'MA SAUVEGARDE',texte:'Sélectionne le code et copie-le à la main.',champ:c9,lecture:true,boutons:[{l:'FERMER',v:0}]});};
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c9).then(function(){toast(pxi('coche')+' '+TR('COPIE !'));},rate9);else rate9(); }); }
    else if(a==='imp'||a==='code'){ /* (2026-10-14, UX 8) UNE seule ligne « ENTRER UN CODE » : une sauvegarde (restaure + recharge) OU un code cousin (voir codeCousin) — la ligne RESTAURER est masquée */
      modale({titre:'ENTRER UN CODE',texte:'Colle un code de sauvegarde, ou un code secret.',champ:'',boutons:[{l:'VALIDER',ic:'coche',cls:'pb-gold',v:1},{l:'ANNULER',v:0}]}).then(function(r){
        if(!r.v)return;
        const t9=String(r.texte||'').trim();
        if(t9&&SAVE.neuf){let s9=false;try{s9=typeof JSON.parse(decodeURIComponent(escape(atob(t9)))).v==='number';}catch(e){}if(s9){toast(pxi('croix')+' '+TR('LE SITE NE RESTAURE PAS LES SAUVEGARDES'));return;}} /* (2026-10-24, chasse aux bugs) le site ne garde rien (SAVE.neuf) : importer puis recharger rendait un compte VIDE, et la session en cours partait avec */
        if(t9&&SAVE.import(t9)){SAVE.natif=2; /* (24/10, relecture : « restaurer un code depuis la pause ») plus AUCUNE écriture jusqu'au rechargement, comme l'EFFACEMENT : la page cachée par ce rechargement posait la partie en pause (enCoursPose) dans la sauvegarde restaurée, qui recevait au lancement suivant l'argent et l'aura d'un autre profil */toast(pxi('coche')+' '+TR('RESTAURE — RECHARGE…'));setTimeout(function(){location.reload();},900);return;}
        if(codeCousin(r.texte)){toast(pxi('coche')+' '+TR('TOUT EST DÉBLOQUÉ !'),true);try{if(SONV2)sfx('caisse.debloquee');}catch(e){}hap([20,40,20,40,60]);try{mFill();}catch(e){}}
        else toast(pxi('croix')+' '+TR('CODE INCONNU')); }); }
    else if(a==='wipe'){
      modale({titre:'TOUT EFFACER ?',texte:'Argent, caisses, habillages, missions, records et réglages : tout repart de zéro.',
        boutons:[{l:'EFFACER',ic:'corbeille',cls:'pb-red',v:1},{l:'ANNULER',v:0}]}).then(function(r){
        if(r.v){SAVE.d=SAVE.san(null);SAVE.flush();SAVE.natif=2; /* (2026-10-24) plus AUCUNE écriture jusqu'au rechargement : le passage en arrière-plan qui l'accompagne versait la partie en pause (enCoursPose) dans le compte effacé */try{localStorage.removeItem('ccLang');}catch(e){}location.reload();} }); } // (passe qualité) « …et réglages : tout repart de zéro » : la LANGUE aussi (rangée à part, ccLang) — le jeu repart sur celle du téléphone
  }
  /* LA SECONDE CHANCE À L'ÉCRAN DE FIN (UX 8, 2026-10-14 soir — PILOTAGE et DEBUGING : la plaque #mChance existait, cachée, jamais branchée : la
     fonction validée par Sacha était invisible). Contrat de la session GENERAL : chanceEtat() → {ok, prix, reste}, chanceJoue(), chanceRefuse(),
     l'événement `cc:chance` à l'ouverture, à l'extinction et à l'achat. La plaque se relit à chaque événement ; même garde de 600 ms que les
     autres touches de l'écran de fin (les pouces qui martèlent NITRO ne paient pas par erreur). */
  try{(function(){const el=$t('mChance');if(!el||typeof chanceEtat!=='function')return;
    Object.assign(I18N,{'CONTINUER':'CONTINUE','NON MERCI':'NO THANKS'});
    el.removeAttribute('data-fr');el.innerHTML='<span class="chT" data-fr="CONTINUER">'+TR('CONTINUER')+'</span><b class="chP"></b><i class="chBar" aria-hidden="true"></i>';
    const non=document.createElement('div');non.id='mChanceNon';non.className='pbtn';non.setAttribute('role','button');non.tabIndex=0;non.hidden=true;
    non.setAttribute('data-fr','NON MERCI');non.textContent=TR('NON MERCI');el.parentNode.insertBefore(non,el.nextSibling);
    const fond=document.createElement('div');fond.id='mChanceFond';fond.hidden=true;fond.setAttribute('aria-hidden','true');el.parentNode.insertBefore(fond,el);
    let vu=false;
    const maj=function(){let e=null;try{e=chanceEtat();}catch(_){e=null;}const ok=!!(e&&e.ok);
      if(ok){const p9=e.gratuit?(LANG==='en'?'FREE':'GRATUIT'):pxi('lecture')+'<span>'+TR('PUB')+'</span>';if(el._p9!==p9){el._p9=p9;el.querySelector('.chP').innerHTML=p9;}  /* (15/10 soir, Sacha : « au lieu de payer il faut regarder une pub ») CONTINUER ▶ PUB, plus de prix */
        if(!vu){vu=true;el.style.setProperty('--chD',Math.max(300,e.reste||5500)+'ms');el.classList.remove('chOn');void el.offsetWidth;el.classList.add('chOn');}}
      else vu=false;
      el.hidden=!ok;non.hidden=!ok;fond.hidden=!ok;el.classList.toggle('pb-gold',ok);el.classList.toggle('pb-cyan',!ok);document.body.classList.toggle('chOffre',ok);};
    const sourd=function(){return !!(TCTL.mortT&&performance.now()-TCTL.mortT<600);};
    const go=function(e){e.preventDefault();e.stopPropagation();if(sourd()||el.hidden)return;uiPop(el);let r=false;try{r=chanceJoue();}catch(_){r=false;}if(!r){uiClic('refus');maj();}};
    el.addEventListener('click',go);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')go(e);});
    const refuse=function(e){e.preventDefault();e.stopPropagation();if(sourd()||non.hidden)return;uiClic('retour');try{chanceRefuse();}catch(_){}maj();};
    non.addEventListener('click',refuse);non.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')refuse(e);});
    /* (vu au banc) `cc:chance` part quand l'offre s'OUVRE — l'écran de fin n'est pas encore là, chanceEtat().ok est encore faux — et plus rien
       ensuite : la plaque SUIT donc l'offre, relue toutes les 200 ms pendant sa fenêtre (5,5 s + marge), puis se tait. */
    let suitT=0;const suit=function(){maj();clearInterval(suitT);let n=0;suitT=setInterval(function(){maj();if(++n>45)clearInterval(suitT);},200);};
    document.addEventListener('cc:chance',suit);window.__chanceMaj=maj;maj();})();}catch(e){console.warn('seconde chance',e);}
  /* LE ×2 DU GAIN À L'ÉCRAN DE FIN (2026-10-19, Sacha au quiz : « ×2 sur le gain ») — contrat : dblEtat() → {ok, v}, dblJoue(apres). La plaque
     #mDouble (laque, néon VERT de l'argent — jamais l'or : REJOUER reste le seul lingot) prend la case que la seconde chance libère : debout
     sous la plaque d'argent, couchée la case `row` au-dessus de ⌂ · REJOUER (NON MERCI y était pendant l'offre). Elle entre 1,1 s après que
     l'écran de fin est jouable (le compte du grand chiffre est fini), se relit toutes les 250 ms (l'offre de seconde chance et la machine à
     sous la font attendre). Vue → le grand chiffre MONTE de N à 2 N et claque, la ligne COMPTE suit ; même garde de 600 ms que les autres
     touches de l'écran de fin. */
  try{(function(){const ch=$t('mChance');if(!ch||typeof dblEtat!=='function')return;
    const el=document.createElement('div');el.id='mDouble';el.className='pbtn pb-cash';el.setAttribute('role','button');el.tabIndex=0;el.hidden=true;
    el.innerHTML='<span class="dbT">×2</span><b class="dbS"></b><b class="dbP">'+pxi('lecture')+'<span data-fr="PUB">'+TR('PUB')+'</span></b>';
    ch.parentNode.insertBefore(el,ch);
    let vu0=0,mort=-1,prep=false,deja=false;
    const maj=function(){let e=null;try{e=dblEtat();}catch(_){e=null;}const ok=!!(e&&e.ok);
      if(mort!==TCTL.mortT){mort=TCTL.mortT;prep=false;deja=false;}
      if(!ok)vu0=0;else if(!vu0)vu0=performance.now();
      const voir=ok&&(deja||performance.now()-vu0>=1100); // (une pub fermée trop tôt : la plaque revient tout de suite, sans rejouer son entrée)
      if(voir)deja=true;
      if(voir){const s9='+'+fmtC(e.v);if(el._s9!==s9){el._s9=s9;el.querySelector('.dbS').textContent=s9;}
        if(!prep){prep=true;pubPrepare('double-gain');} // la régie va chercher sa pub pendant que la plaque monte
        el.setAttribute('aria-label','×2 '+s9+' '+TR('PUB'));
        if(el.hidden){el.hidden=false;el.classList.remove('dbOn');void el.offsetWidth;el.classList.add('dbOn');}}
      else if(!el.hidden)el.hidden=true;};
    const monte=function(v){ // le grand chiffre passe de v à 2 v (0,6 s, ease-out), puis claque ; la ligne COMPTE dit le nouveau solde
      const c9=$t('mCash'),t9=$t('mCashTot');
      if(t9&&t9.firstChild&&t9.firstChild.nodeType===3)t9.firstChild.nodeValue=TR('COMPTE')+(LANG==='fr'?' : ':': ')+fmtSolde(bank());
      try{if(SONV2)sfx('piece.serie');else rewardSfx('m3',2);}catch(_){}hap([10,30,10,30,24]);
      if(!c9)return;if(mCntT){clearInterval(mCntT);mCntT=0;}
      c9.style.setProperty('--n',fmtC(2*v).length);
      if(REDUCED_MOTION){c9.textContent=fmtC(2*v);return;}
      const t0=performance.now(),D=600;
      mCntT=setInterval(function(){const k=Math.min(1,(performance.now()-t0)/D),q=1-Math.pow(1-k,3);c9.textContent=fmtC(Math.round(v*(1+q)));
        if(k>=1){clearInterval(mCntT);mCntT=0;c9.classList.remove('clac');void c9.offsetWidth;c9.classList.add('clac');}},28);};
    const apres=function(vue,v){if(vue)monte(v);maj();};window.__dblApres=apres;
    const sourd=function(){return !!(TCTL.mortT&&performance.now()-TCTL.mortT<600);};
    const go=function(ev){ev.preventDefault();ev.stopPropagation();if(sourd()||el.hidden)return;uiPop(el);uiClic('');hap(8);let r=false;
      try{r=dblJoue(apres);}catch(_){r=false;}if(!r)uiClic('refus');maj();};
    el.addEventListener('click',go);el.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' ')go(ev);});
    setInterval(maj,250);maj();})();}catch(e){console.warn('double',e);}
  if(mob){
    const mHit=function(e){
      const el=e.target&&e.target.closest?e.target.closest('[data-m]'):null;
      if(!el)return;
      if(e.cancelable)e.preventDefault(); e.stopPropagation();
      // (2026-09-26, audit UX) LES POUCES ARRIVENT AVANT L'ÉCRAN : on martèle NITRO pour passer l'explosion, et le 3e tap tombait sur
      // RÉGLAGES (sous la nitro) ; le pouce du volant, sur GARAGE. 0,6 s d'écran de mort « sourd » avale ces réflexes.
      if(started&&gameOver&&TCTL.mortT&&performance.now()-TCTL.mortT<600)return;
      mTap(el.getAttribute('data-m'),el);
    };
    /* ⚠ AU RELÂCHER, PLUS AU CONTACT (2026-09-24, audit UX) : `touchstart` déclenchait l'action dès que le doigt
       se posait — impossible de faire DÉFILER les réglages en glissant sur une ligne (chaque ligne est un bouton),
       impossible d'annuler en glissant hors du bouton. `click` est le geste natif : il part au relâcher, et le
       navigateur l'annule tout seul si le doigt a glissé (défilement). Même chose pour la souris. */
    mob.addEventListener('click',mHit);
  }
  // L'ancien overlay lançait la partie AU MOINDRE CLIC, n'importe où. Avec de vrais écrans, c'est un
  // piège : on bloque tout clic parasite en phase de CAPTURE.
  // ⚠ DEUX EXCEPTIONS, et elles comptent : la saisie de record, et #saveRow — c'est par les boutons
  // du menu desktop (masqués ici) que la coque bascule Survivant et Parc, pour ne pas dupliquer
  // leurs effets de bord. Bloqués en capture, ces `.click()` ne parvenaient jamais à leur bouton :
  // le mode s'affichait ON dans l'écran MODES et restait OFF dans le jeu.
  document.addEventListener('click',function(e){
    const t=e.target;
    if(t&&t.closest&&t.closest('#overlay')&&!t.closest('#nameEntry,#saveRow,#garageRow,#mob'))e.stopPropagation(); // #mob : ses boutons agissent au clic (voir mHit)
  },true);
  /* LA COQUE PARLE LA LANGUE DU JOUEUR (2026-09-24) : tous ses libellés étaient écrits en dur en français. Chaque
     texte « nu » de #mob et #tPanel est enveloppé une fois dans un <span data-fr> — applyLangDOM les traduit
     ensuite comme le reste (sans toucher aux valeurs écrites par le jeu : montants, pastilles, titre). */
  (function(){for(const z of [mob,pan]){if(!z)continue;
    const w=document.createTreeWalker(z,NodeFilter.SHOW_TEXT),L9=[];let n9;
    while((n9=w.nextNode()))if(n9.nodeValue.trim()&&!n9.parentNode.closest('[data-fr],b,.mmS,.etat,.lg,#mBest,#mBest2,#mCar,#mCash,#mOverT,#mNew,#mStatsBox,textarea,input'))L9.push(n9);
    for(const t9 of L9){const sp=document.createElement('span'),x=t9.nodeValue.trim();sp.setAttribute('data-fr',x);sp.textContent=x;t9.parentNode.replaceChild(sp,t9);}}
    const sn=$t('spNote');if(sn){sn.textContent='touche CASH CAR — le son s\'allume avec toi';sn.dataset.fr=sn.textContent;} // sur un téléphone on TOUCHE, on ne clique pas
    try{applyLangDOM();}catch(e){}})();
  // L'OVERLAY APPARAÎT (mort, retour d'atelier) → l'écran racine est posé TOUT DE SUITE, avant la prochaine image — plus
  // au tick de 140 ms (l'ancien écran s'affichait un instant avant de céder la place à celui de la mort).
  try{ new MutationObserver(function(){ const o=overlay.style.display!=='none';
    if(o!==TCTL.ov){TCTL.ov=o;if(o){const r9=(window.__mRetour&&mScr[window.__mRetour]&&!(started&&!gameOver))?window.__mRetour:mRoot();window.__mRetour=null;mGo(r9,'racine',true);}} }).observe(overlay,{attributes:true,attributeFilter:['style']}); }catch(e){}
  // un fondu au noir se lève, ou le voile d'ouverture s'efface : l'écran découvert JOUE son entrée à cet instant-là
  document.addEventListener('cc:revele',function(){ if(overlay.style.display!=='none'&&!garageOn)mGo(mCur,'racine',true); });
  // ÉCHAP (la version téléphone jouée au clavier) : il referme ce qui est ouvert, dans l'ordre où l'œil le lit — la
  // fenêtre, la pause ; en course il MET EN PAUSE ; dans un sous-écran il REVIENT, comme le bouton retour.
  addEventListener('keydown',function(e){ if(e.code!=='Escape'||e.repeat)return;
    if(ecranWipe._on)return; // (2026-09-29) sous un voile, l'écran qu'on quitte n'est plus à nous
    const md=$t('modale');
    if(md&&md.classList.contains('on')&&!md.classList.contains('sortant')){const bs=md.querySelectorAll('.modB .pbtn');if(bs.length)bs[bs.length-1].click();return;} // le DERNIER bouton d'une fenêtre est toujours l'annulation
    if(window.__setPause){uiClic('retour');setPauseFerme();return;} // (2026-10-14, charte 6) les réglages ouverts depuis la pause : Échap = leur ◀
    if(pan&&pan.classList.contains('open')&&!pan.classList.contains('sortant')){panOpen(false,true);uiClic('retour');return;}
    if(PROF[mCur]&&surAccueilCiel()){mTap('back',null);return;} // (2026-10-17) une page posée sur l'accueil-atelier : Échap = son RETOUR
    if(garageOn||(typeof stallOn!=='undefined'&&stallOn))return; // l'atelier et l'étal ont déjà leur Échap
    if(started&&!gameOver){panOpen(true);hap(10);return;}
    if(overlay.style.display!=='none'&&PROF[mCur])mTap('back',null);
  });
  // (2026-09-28) DEUX PORTES POUR LE CODE HORS DE CE BLOC (mGo et panOpen y sont en portée de bloc, 'use strict') :
  // `__mGo` — le garage envoie en BOUTIQUE au lever de son voile ; `__panBascule` — la touche P passe par le VRAI panneau
  // (la pause nue figeait le jeu sans rien à l'écran — #msg est masqué en coque — et P relançait la course SOUS le panneau).
  window.__mGo=function(id){if(mScr[id])mGo(id);};
  window.__mFill=function(){mFill();}; // (2026-10-18, débogage) TROISIÈME PORTE : la machine à sous rafraîchit l'écran de fin (le COMPTE après un gain)
  window.__panBascule=function(){
    const md=$t('modale');if(md&&md.classList.contains('on'))return; // une fenêtre ouverte (RECOMMENCER ?, QUITTER ?) garde la main
    if(window.__setPause)return; // (2026-10-14, charte 6) les réglages complets sont ouverts par-dessus la pause : P ne reprend pas la course dessous
    if(pan&&pan.classList.contains('open')&&!pan.classList.contains('sortant')){panOpen(false,true);return;} // comme REPRENDRE : le 3-2-1
    if(started&&!gameOver&&mode==='boom'){boomSkip();return;} // (passe qualité) P / Échap pendant l'explosion : comme le ⏸ (voir gearOpenHandler)
    if(started&&!gameOver){panOpen(true);hap(10);}
  };
  mGo('home');
}
