/* ===== LE HUD DES FIGURES v3 (2026-10-15, Sacha : « retravaille l'HUD pour le système de figure, il est buggé et trop discret ; anime, mets de
   la couleur et tout pour les figures » — le pourquoi et le dessin sont dans <style id="figuresHud">). Remplace l'ancienne ligne #figCombo.
   `fhLance` (figLance : la figure PART, son nom tombe en grand) · `fhPlante` (figPaye : elle est PLANTÉE — éclair, confettis, une pastille de plus
   dans la ligne, le × grimpe) · `fhFin` (la pose : encaissée = la ligne flashe en or et s'envole vers la chaîne d'aura ; chute = rouge, tout tombe)
   · `fhTick` (chaque image, depuis figHud : les minuteries, AUCUNE écriture DOM tant que rien ne change) · `fhLegMaj`/`fhLegFx` (le rappel).
   Plus de texte au-dessus de la caisse pour une figure (CHA.sansPop dans figPaye) : ce HUD le dit, en mieux. */
/* ===== LE HUD DES FIGURES v4 (2026-10-15 soir, Sacha : « retravaille l'HUD des figures aussi, il faut que ce soit parfait : là c'est écrit en
   double et tout ; il faut des figures bien écrites, avec des moyens de rendre ça addictif »). RELEVÉ au banc (captures en temps réel) : deux
   « ×2 » à l'écran (« SALTO AVANT ×2 » = deux tours, « 100 ×2 » = la chaîne d'aura) ; le nom revenait en grand ET en pastille à la plantée ;
   à la pose, la ligne s'envolait PAR-DESSUS la carte moteur (« SALTO AVANTNEAU ») ; le rappel écrivait « ↑ AVANT » pour le SALTO AVANT ; un
   HÉLICO 720 tout simple partait sous « HÉLICO 720 ×2 » (le nombre de tours lu comme une répétition) ; rien ne disait de quel côté elle part.
   · LE NOM, une seule fois, bien écrit (`figNom`) : les tours se disent en mots ou en degrés — DOUBLE TONNEAU, TRIPLE SALTO AVANT, TOUPIE 720,
     HÉLICO 1440, QUADRUPLE TONNEAU (un DOUBLE TONNEAU doublé) ; jamais « ×2 », qui reste au combo et à la chaîne ;
   · LA FLÈCHE du geste devant le nom (▲ avant, ▼ arrière, ◄ ou ► : le côté où elle part) ;
   · LA LIGNE DU COMBO : une PASTILLE muette par figure plantée (sa couleur ; plus grosse pour une figure neuve dans le vol — varier paie) et
     « COMBO ×1,5 » ; au-delà du meilleur combo jamais posé (`SAVE.d.figRec`), « RECORD » bat à côté — battu à la pose, il est gardé ;
   · À LA POSE : la ligne flashe en or et s'éteint SUR PLACE (elle ne traverse plus l'écran) ; à la chute, elle tombe en rouge ;
   · LE RAPPEL (#fhLeg) écrit les vrais noms, et le geste que vise le pouce s'ALLUME en direct (`.arme`) : on voit ce qui va partir. */
const FIG_MULT={fr:['','','DOUBLE ','TRIPLE ','QUADRUPLE ','QUINTUPLE ','SEXTUPLE ','SEPTUPLE ','OCTUPLE '],en:['','','DOUBLE ','TRIPLE ','QUAD ','QUINT ','SEXT ','SEPT ','OCT ']};
function figNom(f,reps,lg){lg=lg||(LANG==='en'?'en':'fr');let n=sansAcc(lg==='en'&&f.en?f.en:f.n),k=Math.max(1,reps|0);if(k<2)return n;
  const deg=n.match(/^(.*?)(\d{3,4})$/);if(deg)return deg[1]+(+deg[2]*k); // TOUPIE 360 → TOUPIE 720 · HELICO 720 → HELICO 1440
  if(/^DOUBLE /.test(n)){n=n.slice(7);k*=2;} // DOUBLE TONNEAU doublé → QUADRUPLE TONNEAU
  const M=FIG_MULT[lg==='en'?'en':'fr'];return (M[k]||k+'X ')+n;}
function figRepsEnCours(r){const m=r&&r.mv&&r.mv[0];return m?Math.max(1,Math.round(m.tours/(r.base||m.tours))):1;} // les répétitions prévues (le tour EMPILÉ au double-tap compte)
/* ===== LE HUD DES FIGURES v5 (2026-10-18, Sacha : « retravaille le système de figure, notamment les combos de figures : c'est pas montré
   assez clairement ; et puis les bumps sur les bords de la route doivent être une figure à part entière, cumulable dans des combos ; aussi, en
   fonction de la rareté de la figure, écris-la dans une couleur et une police différente correspondant à la rareté » — au quiz : « une police
   par rareté », toutes en pixels, pour le nom des figures en course seulement). Le dessin est dans <style id="figuresHud"> (v5).
   · LA RARETÉ ÉCRITE (`figRarH`) : celle de la boutique (`cosmRar('figure')`, qui suit le prix) — COMMUNE gris Press Start 2P · RARE bleu
     Silkscreen · EXOTIQUE vert Jersey · ÉPIQUE violet Sixtyfour (halo) · LÉGENDAIRE or Jacquard, le gothique en pixels (un reflet la traverse).
     (2026-10-19, Sacha : « la police des figures légendaires est un peu illisible ») la LÉGENDAIRE s'écrit en MINUSCULES gothiques à capitale
     initiale — Salto Cosmique, Rodeo (`fhTitre`) : ce sont les CAPITALES gothiques qui ne se lisaient pas (« SALTO » se lisait « SALVD »).
     Même police, même or, même reflet ; sa chasse en minuscules (MESURÉE ,77 à ,89 em à k 1,9, contre 1,11 à 1,19 en capitales) → w ,9.
     `FIG_RP` : par rareté, k = la taille qui égale la hauteur de capitale de Press Start 2P, w = la largeur d'une lettre à cette taille
     (MESURÉ au canvas : capitale ,63 / ,54 / ,87 / ,57 em ; chasse ,69 / ,38 / 1 / ,56 em) — même nombres que --rk dans la feuille.
   · LA LIGNE DU COMBO SE LIT (`fhMaillon`, `fhCsCale`) : les pastilles muettes de la v4 sont remplacées par le NOM de chaque figure plantée,
     dans sa rareté, reliés par « + » — TONNEAU + SALTO AVANT + BUMP ; le × du combo en grand dessous ; « … » devant quand la ligne déborde.
     À LA POSE, les maillons s'allument l'un après l'autre (on voit ce qu'on encaisse) et le × claque ; à la chute, ils tombent en rouge.
   · LE COMBO À TROIS NOMMÉ (`fhTrio`, depuis comboNote) : LA PERCEUSE… s'écrit en grand, en arc-en-ciel, ses trois maillons soulignés d'or.
   · LE BUMP, FIGURE À PART ENTIÈRE (`figBumpNote`, au rebond sur la tranche, en vol) : il entre au COMBO DU VOL comme une figure (neuf +0,5 au ×,
     redite +0,25), ses points de chaîne entrent dans FX2.pts (multipliés à la pose, perdus à la chute, comme les autres) ; son nom s'écrit en
     haut (plus de « BUMP +30 » sur la caisse) ; un BUMP qui suit un BUMP grandit sur place : BUMP (commune) → DOUBLE BUMP (rare) → TRIPLE BUMP
     (exotique) → MEGA BUMP (épique). Le nitro et la valeur du bump (BUMP_VAL, ×0,6 par rebond) ne changent pas. `?bumpfig=0` = avant. */
const FIG_RP={commun:{k:1,w:1},rare:{k:1.59,w:1.1},exotique:{k:1.85,w:.7},epique:{k:1.15,w:1.15},legendaire:{k:1.9,w:.9},combo:{k:1,w:1}};
const BUMP_FIG={id:'bump',n:'BUMP',en:'BUMP',aura:30};
const BUMP_FIG_ON=!/[?&]bumpfig=0\b/.test(location.search);
try{if(document.fonts&&document.fonts.load)setTimeout(function(){['CC Silkscreen','CC Jersey','CC Sixtyfour','CC Jacquard'].forEach(function(f){document.fonts.load('20px "'+f+'"','BUMP').catch(function(){});});},2500);}catch(e){} // les quatre polices chargées d'avance (au menu) : la 1re figure rare ne s'écrit pas d'abord en Press Start 2P
function bumpNomH(k){return k>=4?'MEGA BUMP':k===3?'TRIPLE BUMP':k===2?'DOUBLE BUMP':'BUMP';}
function figRarH(f,k){if(!f)return 'commun';if(f.id==='bump')return k>=4?'epique':k===3?'exotique':k===2?'rare':'commun';
  let r='commun';try{r=cosmRar('figure',f);}catch(e){}return FIG_RP[r]?r:'commun';}
/* ===== LE HUD DES FIGURES v6 (2026-10-25, Sacha : « SALTO AVANT, TAIL WHIP, BUMP, BIG AIR… sont mal affichés, à gauche dans un petit encadré : écrits et stylisés
   en petit, qu'ils sortent à côté de la voiture ; et enlève le multiplicateur de figure (le × 2, × 3) » — le récit complet est en tête de mots-jaillissants.js).
   RETIRÉS : le grand nom du haut (#fh), sa ligne de combo (les noms reliés par « + », « COMBO ×1,5 », RECORD) et le rappel des gestes (#fhLeg, les plaquettes
   à côté de NITRO, avec le geste visé qui s'allumait). RESTE : la règle (figNom, FIG_RP, figRarH, le BUMP figure, le meilleur combo posé) et les six points
   d'entrée que le jeu appelle déjà — leur manière d'écrire a changé, pas leur nom :
   · `fhLance` (la figure PART) : son nom, une seule fois, jaillit de la caisse — du côté du geste (un tail whip part à droite si le pouce est à droite) ;
   · `fhPlante` (elle est PLANTÉE) : rien de plus à écrire, SAUF si son nom a changé en route (un tour empilé pendant le vol : TONNEAU → DOUBLE TONNEAU) —
     « écrit en double » est la plainte du 15/10, elle ne revient pas ;
   · `fhBump` (BUMP → DOUBLE BUMP → TRIPLE BUMP → MEGA BUMP) et `fhTrio` (un combo à trois NOMMÉ, LA PERCEUSE…, en arc-en-ciel et un cran plus grand) ;
   · `fhFin` (la pose) : un combo PERDU s'écrit en rouge (« COMBO PERDU ») ; un combo posé garde son meilleur × dans la sauvegarde (la plaque le montre),
     mais le × ne s'affiche plus. La couleur et la police de chaque nom restent celles de sa RARETÉ (v5). */
function fhLance(s,r,o){if(!r||!r.f||!window.FIG)return;const t=figNom(r.f,figRepsEnCours(r));r.jlNom=t;jaillit(t,{rp:figRarH(r.f),dir:r.flD||null});}
function fhPlante(r,f,reps,neuf){if(!f||!window.FIG)return;const t=figNom(f,reps);if(r){if(r.jlNom===t)return;r.jlNom=t;}jaillit(t,{rp:figRarH(f),dir:r&&r.flD||null});}
function fhBump(k,neuf){jaillit(TR(bumpNomH(k)),{rp:figRarH(BUMP_FIG,k)});}
function fhTrio(txt){jaillit(txt,{rp:'combo',k:1.2});}
function figRec(){return +(SAVE.d&&SAVE.d.figRec)||0;} /* le meilleur combo jamais POSÉ (le × d'un vol) */
function figBumpNote(k,pts){if(!FIGV2.on||!BUMP_FIG_ON||!figTutoOk())return; /* (2026-10-18, débogage) figTutoOk : pas de combo invisible payé pendant l'auto-école */ /* (v5) LE BUMP, FIGURE À PART ENTIÈRE DU COMBO DU VOL — appelée au rebond sur la tranche (k = son rang dans le vol) : ses points de chaîne entrent dans FX2.pts, comme ceux des autres */
  FX2.pts+=Math.max(0,pts||0);const neuf=!FX2.cv.ids.bump;figCvNote(BUMP_FIG,1);fhBump(k,neuf);}
function fhFin(ok){const c=FX2.cv;if(c.n<1)return; /* (la pose) — à appeler AVANT figCvRaz */
  if(ok){const x=c.n>=2?figCvX():0;if(x>figRec()+1e-6){SAVE.d.figRec=Math.round(x*100)/100;SAVE.mark();}}
  else if(c.n>=2)jaillit(TR('COMBO PERDU'),{rp:'ko'});}
window.dbgImpu=function(a,n){if(a==='tap'){const r=figImpulsion();return r?(r.attente?'attente':'ok'):'refus';}if(a==='slot'){const r=figLance(n|0,{});return r?(r.attente?'attente':'ok'):'refus';}
  const C=FX2.corps;return {on:IMPU.on,dir:FDIR.on,mode:mode,go:gameOver,intro:!!introD,eta:+(+CAMV.eta).toFixed(2),combo:{n:FX2.cv.n,dist:FX2.cv.dist,x:figCvX(),noms:FX2.cv.noms.slice()},ptsVol:FX2.pts,
    hud:JAIL.der,chaine:CHA.liste.slice(),chutes:FX2.chutes,
    figs:C?C.figs.map(function(r){return r.f.id+(r.s>0?'+':'-')+' tours '+(r.mv[0]?r.mv[0].tours:0)+(r.paye?' payée':r.fini?' finie':'');}):null};};
function figIco(f){let m=null;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null&&(!m||Math.abs(f.m[i].t)>Math.abs(m.t)))m=f.m[i];
  if(!m)return 'fgBa';let n=0;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null)n++;if(n>1)return 'fgCo';
  const a=m.a;if(Math.abs(a[0])>.9)return m.t>0?'fgAv':'fgAr';if(Math.abs(a[1])>.9)return 'fgTo';if(Math.abs(a[2])>.9)return 'fgTn';return 'fgCo';}
function figCourt(f){const c=LANG==='en'?(f.ce||f.en||f.n):(f.c||f.n);return String(c).split(' ')[0].slice(0,8);}
function figHudMaj(){const el=document.getElementById('tFig');if(!el||!window.FIG)return;const S=figSlots(),cle=S.join(',')+'|'+LANG;if(FX2.cle===cle)return;FX2.cle=cle;
  el.innerHTML=S.map(function(id,i){if(!id)return '';const f=i<2&&FIG.oriente?FIG.oriente(FIG.par[id],FIG_DIR[i]):FIG.par[id];return '<div class="tFigB" data-s="'+i+'" role="button" aria-label="'+sansAcc(TR(f.n)).replace(/"/g,'')+'">'
    +'<i class="pxi pxi-rotation '+figIco(f)+'" aria-hidden="true"></i><b>'+sansAcc(figCourt(f)).replace(/[<>&"]/g,'')+'</b><u>'+(i+1)+'</u></div>';}).join('');
  FX2.bts=[];[].forEach.call(el.children,function(b){FX2.bts[+b.getAttribute('data-s')]=b;});FX2.btOn[0]=FX2.btOn[1]=FX2.btOn[2]=false;} // (les deux familles) rangés par EMPLACEMENT : 1 = avant, 2 = côté
function figBtFx(s,c){const b=FX2.bts&&FX2.bts[s];if(!b)return;b.classList.remove('boum','non');void b.offsetWidth;b.classList.add(c);}
function figHud(){ // (chaque image) les boutons n'existent qu'en VOL ; « on » = tenu
  figRedP();const v=FIGV2.on&&started&&!gameOver&&mode==='fall'&&!introD&&figTutoOk(); /* (2026-10-25) plus de minuterie du grand nom ni de rappel des gestes à allumer : les mots s'éteignent seuls */
  if(v!==FX2.vis){FX2.vis=v;document.body.classList.toggle('figVol',v);if(v&&!FDIR.on)figHudMaj();} // (2026-10-15) au joystick : le RAPPEL ↑ 1 · ◄► 2, plus de boutons
  if(v&&FX2.bts)for(let i=0;i<FX2.bts.length;i++){if(!FX2.bts[i])continue;const r=FX2.slots[i],on=!!(r&&r.tient&&!r.paye);if(FX2.btOn[i]!==on){FX2.btOn[i]=on;FX2.bts[i].classList.toggle('on',on);}}}
/* LES TROIS BOUTONS : le doigt (et la souris, dans le cadre de l'ordi) — un appui = l'explosion, tenu = la poussée ; au clavier 1 · 2 · 3 */
(function(){const el=document.getElementById('tFig');if(!el)return;
  const tient=function(s,id){FX2.tenus[s]=true;FX2.ptr[s]=id;figLance(s,{tient:true});},lache=function(id){for(let s=0;s<3;s++)if(FX2.ptr[s]===id){FX2.tenus[s]=false;FX2.ptr[s]=null;}};
  el.addEventListener('touchstart',function(e){if(e.cancelable)e.preventDefault();e.stopPropagation();
    for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i],b=document.elementFromPoint(t.clientX,t.clientY),bt=b&&b.closest&&b.closest('.tFigB');if(bt)tient(+bt.getAttribute('data-s'),'t'+t.identifier);}},{passive:false});
  const fin=function(e){for(let i=0;i<e.changedTouches.length;i++)lache('t'+e.changedTouches[i].identifier);};
  el.addEventListener('touchend',fin,{passive:false});el.addEventListener('touchcancel',fin,{passive:false});
  el.addEventListener('mousedown',function(e){const bt=e.target.closest&&e.target.closest('.tFigB');if(!bt)return;e.preventDefault();e.stopPropagation();tient(+bt.getAttribute('data-s'),'souris');});
  addEventListener('mouseup',function(){lache('souris');});
  const K={Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2}; /* (2026-10-15 soir) trois emplacements : avant · arrière · côté */
  addEventListener('keydown',function(e){const s=K[e.code];if(s==null||e.repeat)return;tient(s,'k'+s);});
  addEventListener('keyup',function(e){const s=K[e.code];if(s!=null)lache('k'+s);});
})();
try{Object.assign(I18N,{'Depuis NITRO, glisse puis lâche : ◄► un tail whip, ▲ ▼ un salto. Au sol, pousse le joystick en avant pour sauter.':'From NITRO, slide then release: ◄► a tail whip, ▲ ▼ a flip. On the ground, push the joystick forward to jump.'});}catch(e){} // (2026-10-15) l'astuce du GLISSER (bit 64 de SAVE.d.ast — libre ; ⚠ san() plafonne ast à 255 : jamais de bit 256)
try{Object.assign(I18N,{'COMBO':'COMBO','RECORD':'RECORD'});}catch(e){} // (HUD des figures v4)
try{Object.assign(I18N,{'COMBO PERDU':'COMBO LOST','En vol, tape 2 fois NITRO : pouce en AVANT = figure 1, sur le CÔTÉ = figure 2.':'In the air, double-tap NITRO: thumb FORWARD = trick 1, to the SIDE = trick 2.','En vol, tape 2 fois NITRO : pouce en AVANT, en ARRIÈRE ou sur le CÔTÉ — chaque geste a sa figure.':'In the air, double-tap NITRO: thumb FORWARD, BACK or to the SIDE — each gesture has its trick.'});}catch(e){} // (2026-10-15) HUD des figures v3 + le choix au joystick
try{Object.assign(I18N,{'En vol, touche une FIGURE : elle explose et fait tourner la caisse. Tiens pour un tour de plus !':'In the air, tap a TRICK: it blasts and spins the car. Hold for one more turn!','TOUPIE DE DRIFT':'DRIFT SPIN','EMPLACEMENTS':'SLOTS','ÉQUIPÉE':'EQUIPPED','REMPLACE':'REPLACES','RETIRÉE':'REMOVED',
  'IL EN FAUT UNE':'KEEP AT LEAST ONE','EMPLACEMENT':'SLOT'});}catch(e){}
window.dbgFig=function(a,b){
  if(a==='lance')return !!figLance(b|0,{});
  if(a==='equipe')return figEquipe(b);
  if(a==='phy')return FIG.PHY;
  const C=FX2.corps;
  return {on:FIGV2.on,equipees:figEquipees(),slots:figSlots(),mode:C?C.mode:null,ecart:C?Math.round(C.ecart()*57.3):0,w:C?C.w.map(function(x){return +x.toFixed(2);}):null,
    figures:C?C.figs.map(function(r){return r.f.id+(r.paye?' payée':r.fini?' finie':'')+' '+r.mv.map(function(m){return (m.th/6.2832).toFixed(2);}).join('/');}):null,
    herite:FX2.herite,lancees:FX2.n,payees:FX2.payees,chutes:FX2.chutes,ptsVol:FX2.pts,budget:C?+(+C.budget).toFixed(2):0,boutons:document.body.classList.contains('figVol')};};
