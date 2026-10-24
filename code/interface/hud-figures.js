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
const FH={el:null,nom:null,b:null,d:null,cs:null,more:null,x:null,rec:null,legs:null,legCle:'',vu:false,nomT:0,fin:'',finT:0,xv:-1,ease:'',va:null,arme:-2,recBat:false,rp:'',rpT:'-',horsN:0,trioT:0,nomPl:false};
const FH_COUL=['var(--fh1)','var(--fhVert)','var(--fh2)','var(--fh0)']; // l'emplacement 1 (l'avant, cyan) · le 2 (l'arrière, vert — 2026-10-15 soir) · le 3 (le côté, magenta) · la figure que la caisse fait SEULE (or)
const FH_N=[26,22]; // le corps du nom (px) : couché · debout — plafonné par la largeur (police pixel : 1 em par lettre)
function fhEase(){if(!FH.ease){try{FH.ease=getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();}catch(e){}FH.ease=FH.ease||'ease-out';}return FH.ease;}
function fhAnime(el,k,ms,o){if(!el||!el.animate)return null;if(REDUCED_MOTION&&!(o&&o.rm))return null; // « Réduire les animations » (iOS) : l'état final s'affiche, sans le mouvement
  try{return el.animate(k,Object.assign({duration:ms,easing:fhEase()},o||{}));}catch(e){return null;}}
function fhEl(){if(FH.el)return FH.el;const e=document.createElement('div');e.id='fh';e.setAttribute('aria-hidden','true');
  e.innerHTML='<div class="fhNom"><i class="pxi fhD"></i><b></b></div><div class="fhLigne"><u class="fhMore"></u><span class="fhCs"></span></div><div class="fhBas"><em class="fhX"></em><u class="fhRec"></u></div>';document.body.appendChild(e); /* (v5) la ligne des NOMS du combo, puis le × dessous */
  FH.el=e;FH.nom=e.firstChild;FH.d=FH.nom.firstChild;FH.b=FH.nom.lastChild;FH.cs=e.querySelector('.fhCs');FH.more=e.querySelector('.fhMore');FH.x=e.querySelector('.fhX');FH.rec=e.querySelector('.fhRec');return e;}
function fhNet(t){return sansAcc(String(t)).replace(/[<>&"]/g,'');}
function fhTitre(t,rp){return rp==='legendaire'?String(t).toLowerCase().replace(/(^|[\s'-])(\S)/g,function(m,a,c){return a+c.toUpperCase();}):t;} // (19/10) la LÉGENDAIRE en minuscules gothiques à capitale initiale (Salto Cosmique) : ses capitales gothiques ne se lisaient pas
function fhNom(t,c,g,dir,rp){const e=fhEl();t=fhNet(t);const b=FH.b;
  if(dir!==undefined){FH.d.className='pxi fhD'+(dir?' pxi-'+dir:' vide');} // (v4) la flèche du geste : ▲ ▼ ◄ ► (undefined = on garde celle d'avant : la plantée, le combo perdu)
  if(rp!==undefined){FH.rp=rp||'';if(rp)FH.nom.setAttribute('data-rp',rp);else FH.nom.removeAttribute('data-rp');} // (v5) la RARETÉ du nom : sa couleur et sa police ('' = Press Start 2P, la couleur c)
  t=fhTitre(t,FH.rp);
  if(b.textContent!==t||FH.rpT!==FH.rp){const K=FIG_RP[FH.rp]||FIG_RP.commun;FH.rpT=FH.rp;b.textContent=t;b.setAttribute('data-t',t); /* (v5) même hauteur de capitale que Press Start 2P (k), la largeur selon la chasse de SA police (w) */
    b.style.fontSize=Math.round(K.k*Math.max(12,Math.min(FH_N[VP.w>VP.h?0:1],Math.floor(VP.w*.8/Math.max(1,(t.length+1.5)*K.w))-2)))+'px';}
  if(c)FH.nom.style.setProperty('--fc',c);else FH.nom.style.removeProperty('--fc');FH.nom.className='fhNom on'+(g==='ko'?' ko':'');e.classList.add('on');if(!FH.vu)document.body.classList.add('fhOn');FH.vu=true;
  if(g==='in')fhAnime(FH.nom,[{transform:'scale(2.3) rotate(-7deg)',opacity:0,filter:'brightness(3)'},{transform:'scale(.92) rotate(2deg)',opacity:1,filter:'brightness(1.6)',offset:.45},
    {transform:'scale(1.05) rotate(0deg)',offset:.72},{transform:'none',opacity:1,filter:'none'}],460);
  else if(g==='pl')fhAnime(FH.nom,[{transform:'scale(1.4)',filter:'brightness(3.2)'},{transform:'scale(.94)',filter:'brightness(1.5)',offset:.5},{transform:'none',filter:'none'}],400);
  else if(g==='ko')fhAnime(FH.nom,[{transform:'none'},{transform:'translateX(-10px) rotate(-3deg)'},{transform:'translateX(9px) rotate(2deg)'},{transform:'translateX(-6px)'},{transform:'translateX(4px)'},{transform:'none'}],460,{easing:'steps(6)'});}
function fhMaillon(t,rp,o){fhEl();o=o||{};const i=document.createElement('i');i.className='fhM'; // (v5) un MAILLON par figure plantée : son nom, dans sa rareté (remplace la pastille muette de la v4)
  i.setAttribute('data-rp',rp);if(o.b)i.setAttribute('data-b','1');if(o.d)i.setAttribute('data-d','1');i.textContent=fhTitre(fhNet(t),rp);FH.cs.appendChild(i);fhCsCale();
  fhAnime(i,[{transform:'translateY(-26px) scale('+(o.neuf?2.2:1.7)+')',opacity:0,filter:'brightness(3)'},{transform:'translateY(2px) scale(.94)',opacity:1,offset:.55},{transform:'none',opacity:1,filter:'none'}],420);return i;}
function fhMaillonMaj(i,t,rp){i.setAttribute('data-rp',rp);i.textContent=fhTitre(fhNet(t),rp);fhCsCale(); // (v5) le BUMP qui suit un BUMP : le même maillon grandit (DOUBLE BUMP…)
  fhAnime(i,[{transform:'scale(1.7)',filter:'brightness(3)'},{transform:'scale(.94)',offset:.5},{transform:'none',filter:'none'}],380);}
function fhCsCale(){const L=FH.cs.children,ch=VP.w>VP.h?10:8,lim=Math.min(VP.w*.94,680)*.92; // (v5) la ligne tient en largeur : les plus anciens maillons sortent, « … » devant (estimé sur la chasse de chaque police — --fhCh, ×1,2, « + » et ses marges = 2 corps : aucune mise en page lue)
  let w=0,k=L.length;while(k>0){const e=L[k-1],n=e.textContent.length,K=FIG_RP[e.getAttribute('data-rp')]||FIG_RP.commun,ww=(n*K.w*1.2+2)*ch+n;if(k<L.length&&(w+ww>lim||L.length-k>=6))break;w+=ww;k--;}
  if(k>0){for(let j=0;j<k;j++)L[0].remove();FH.horsN+=k;}
  const m=FH.horsN?'…':'';if(FH.more.textContent!==m)FH.more.textContent=m;}
function figRec(){return +(SAVE.d&&SAVE.d.figRec)||0;} // le meilleur combo jamais POSÉ (le × du vol)
function fhXMaj(){const c=FX2.cv,x=c.n>=2?figCvX():0;fhEl();FH.el.classList.toggle('combo',c.n>=2);if(x===FH.xv)return;const monte=x>FH.xv;FH.xv=x; /* (v5) la ligne des noms n'existe qu'à partir de DEUX figures : une figure seule s'écrit une fois, en grand */
  FH.x.innerHTML=x?'<small>'+fhNet(TR('COMBO'))+'</small> '+figCvTxtX(x):'';FH.x.style.setProperty('--xc',x>=3?'var(--fhO)':x>=2?'var(--fh0)':'var(--fhVert)');FH.x.classList.toggle('max',x>=IMPU.xMax); // vert → or → orange → l'arc-en-ciel du plafond
  {const bat=x>0&&x>figRec()+1e-6;if(bat!==FH.recBat){FH.recBat=bat;FH.rec.textContent=bat?fhNet(TR('RECORD')):'';FH.rec.classList.toggle('on',bat);if(bat){fhAnime(FH.rec,[{transform:'scale(2.2)',opacity:0},{transform:'scale(.9)',opacity:1,offset:.6},{transform:'none'}],380);try{hap([6,20,6]);}catch(e){}}}} // (v4) le RECORD bat à côté du × : on le voit tomber en plein vol
  if(x&&monte)fhAnime(FH.x,[{transform:'scale(2.1)',filter:'brightness(2.6)'},{transform:'scale(.9)',offset:.5},{transform:'none',filter:'none'}],380);}
function fhLance(s,r,o){if(!r||!r.f||!window.FIG)return;const c=o&&o.douce?3:s>=0?Math.min(2,s):3;r.fhc=c; // (figLance) la figure part : son nom, en grand, dans la couleur de son emplacement
  if(FH.fin)fhRaz(); /* (v5) la ligne du vol d'avant s'éteignait encore : on repart à neuf (avant, son fondu « forwards » restait posé sur #fh — la figure suivante partait invisible) */
  fhNom(figNom(r.f,figRepsEnCours(r)),null,'in',r.flD||null,figRarH(r.f));FH.nomT=performance.now()+1900;FH.nomPl=false; /* (v4) le nom bien écrit (plus « HELICO 720 ×2 » pour un hélico simple) et la flèche du geste — (v5) dans la couleur et la police de SA RARETÉ (plus celle de l'emplacement) */
  if(s>=0)fhLegFx(s,false);}
function fhPlante(r,f,reps,neuf){if(!f||!window.FIG)return;const t=figNom(f,reps),rp=figRarH(f); // (figPaye) plantée : elle claque et tombe dans la ligne
  if(FH.fin)fhRaz();
  const m=fhMaillon(t,rp,{neuf:neuf,d:!!(r&&r.douce)});fhXMaj(); /* (v5) son MAILLON entre dans la ligne du combo */
  fhSeule(t,rp,undefined,1000,m,Math.min(12,6+2*FX2.cv.n));}
function fhSeule(t,rp,dir,ms,m,nb){const n=performance.now(); // (v5) une figure SEULE claque en grand dans sa rareté (la ligne n'existe pas encore) ; dans un COMBO, le grand nom tombe dans la ligne
  if(FX2.cv.n<2){fhNom(t,null,'pl',dir,rp);FH.nomT=n+ms;FH.nomPl=true;try{pixBurst(FH.b,nb);}catch(e){}return;} //   (il s'éteint, son maillon arrive) : jamais écrit deux fois — Sacha, 15/10 : « là c'est écrit en double »
  if(FH.nom.classList.contains('on')&&FH.nomT>n+140&&(FH.nomPl||FH.b.textContent===fhNet(t)))FH.nomT=n+140; // le grand nom est celui d'une figure DÉJÀ dans la ligne (nomPl) : il s'éteint — une figure lancée, encore en l'air, garde le sien
  try{pixBurst(m,nb);}catch(e){}}
function fhBump(k,neuf){fhEl();const t=TR(bumpNomH(k)),rp=figRarH(BUMP_FIG,k); // (v5) LE BUMP s'écrit comme une figure plantée : en grand s'il est seul, son maillon dans la ligne
  if(FH.fin)fhRaz();
  const L=FH.cs.lastElementChild;let m=L;if(k>1&&L&&L.getAttribute('data-b'))fhMaillonMaj(L,t,rp);else m=fhMaillon(t,rp,{neuf:neuf,b:1}); // collé au BUMP d'avant : le même maillon grandit
  fhXMaj();fhSeule(t,rp,null,1100,m,Math.min(10,4+2*k));}
function fhTrio(txt){if(!FH.el||!FH.vu)return; // (v5, comboNote) LE COMBO À TROIS NOMMÉ : son nom en grand (arc-en-ciel), ses trois maillons soulignés d'or
  fhNom(txt,null,'in',null,'combo');FH.nomT=FH.trioT=performance.now()+1700;FH.nomPl=false;
  const L=FH.cs.children;let n=0;for(let i=L.length-1;i>=0&&n<3;i--){if(L[i].getAttribute('data-b')||L[i].getAttribute('data-d'))continue;L[i].classList.add('trio');n++;}}
function figBumpNote(k,pts){if(!FIGV2.on||!BUMP_FIG_ON||!figTutoOk())return; /* (2026-10-18, débogage) figTutoOk : pas de combo invisible payé pendant l'auto-école */ // (v5) LE BUMP, FIGURE À PART ENTIÈRE DU COMBO DU VOL — appelée au rebond sur la tranche (k = son rang dans le vol)
  FX2.pts+=Math.max(0,pts||0);const neuf=!FX2.cv.ids.bump;figCvNote(BUMP_FIG,1);fhBump(k,neuf);}
function fhFin(ok){const c=FX2.cv;if(!FH.el||!FH.vu||c.n<1)return;const n=performance.now(); // (la pose) — à appeler AVANT figCvRaz
  if(ok){if(!(FH.trioT>n))FH.nom.classList.remove('on');FH.el.classList.add('paye');FH.el.classList.remove('perdu'); // (v5) un combo NOMMÉ fermé par la pose reste écrit pendant l'encaissement
    const M=FH.cs.children,D=c.n>=2?1000+70*M.length:600;
    if(FH.xv>0)fhAnime(FH.x,[{transform:'scale(1)',filter:'none'},{transform:'scale(2)',filter:'brightness(3)',offset:.35},{transform:'scale(1)',filter:'none'}],420,{delay:70*M.length});
    for(let i=0;i<M.length;i++)fhAnime(M[i],[{transform:'none',filter:'none'},{transform:'translateY(-5px) scale(1.15)',filter:'brightness(3)',offset:.4},{transform:'none',filter:'none'}],300,{delay:i*70}); /* (v5) les maillons s'allument l'un après l'autre : on lit ce qu'on encaisse, puis le × claque */
    {const x=c.n>=2?figCvX():0;if(x>figRec()+1e-6){SAVE.d.figRec=Math.round(x*100)/100;SAVE.mark();}} // (v4) le RECORD battu à la pose est gardé
    FH.fin='efface';FH.finT=n+D;fhAnime(FH.el,[{opacity:1},{opacity:1,offset:.7},{opacity:0}],D,{fill:'forwards',rm:true});} /* (v4) elle s'éteint SUR PLACE : plus de vol à travers l'écran par-dessus la carte moteur */
  else{if(c.n>=2)fhNom(TR('COMBO PERDU'),'var(--fhKo)','ko',undefined,'');else FH.nom.classList.remove('on'); /* une figure seule : « FIGURE RATÉE ! » le dit déjà sur la caisse (flowCasse) — les maillons tombent, sans un 2e texte */
    FH.el.classList.add('perdu');FH.el.classList.remove('paye');
    const L=FH.cs.children;for(let i=0;i<L.length;i++)fhAnime(L[i],[{transform:'none',opacity:1},{transform:'translateY(46px) rotate('+(i%2?18:-16)+'deg)',opacity:0}],520,{delay:120+i*70,fill:'forwards',easing:'steps(5)'});
    FH.fin='efface';FH.finT=n+1050;}}
/* (v4) fhVole retirée : la ligne du combo ne traverse plus l'écran (elle passait par-dessus la carte moteur) */
function fhRaz(){if(FH.vu)document.body.classList.remove('fhOn');FH.vu=false;FH.fin='';FH.nomT=0;FH.xv=-1;FH.recBat=false;FH.horsN=0;FH.trioT=0;if(!FH.el)return;if(FH.va){try{FH.va.cancel();}catch(e){}FH.va=null;}
  try{FH.el.getAnimations().forEach(function(a){a.cancel();});}catch(e){}
  FH.el.className='';FH.nom.className='fhNom';FH.cs.textContent='';FH.more.textContent='';FH.x.textContent='';FH.x.classList.remove('max');FH.rec.textContent='';FH.rec.classList.remove('on');}
function fhTick(vol){if(!FH.vu)return;const n=performance.now(); // (chaque image, depuis figHud) rien n'est écrit tant que rien ne change
  if(FH.fin){if(n<FH.finT)return;fhRaz();return;}
  if(!vol){if(mode==='drive'&&!gameOver&&FH.cs.firstChild){FH.nom.classList.remove('on');FH.el.classList.add('paye');FH.fin='efface';FH.finT=n+500;fhAnime(FH.el,[{opacity:1},{opacity:0}],500,{fill:'forwards',rm:true});return;}fhRaz();return;} // (les figures plantées sont déjà dans la chaîne)
  if(FH.nomT&&n>FH.nomT){FH.nomT=0;FH.nom.classList.remove('on');} // le nom s'éteint ; la ligne du combo reste tant qu'on vole
  if(!FH.nomT&&!FH.cs.firstChild)fhRaz();}
function fhLegMaj(){const el=document.getElementById('fhLeg');if(!el||!window.FIG)return;const S=figSlots(),cle=S.join(',')+'|'+LANG;if(FH.legCle===cle)return;FH.legCle=cle; // (en vol) ↑ figure 1 · ◄► figure 2
  const I=['haut','bas','fleches']; // (2026-10-15, les directions) chaque figure avec le geste et la couleur de SON emplacement ; un emplacement vide ne s'affiche pas (le tonneau ne part que de côté)
  el.innerHTML=S.map(function(id,i){if(!id)return '';const f=FIG.par[id];return '<div class="fhL" data-s="'+i+'" style="--fc:'+FH_COUL[i]+'">'+pxi(I[i])+'<b data-rp="'+figRarH(f)+'">'+fhTitre(fhNet(figNom(f,1)),figRarH(f))+'</b></div>';}).join(''); /* (v4) les vrais noms : « SALTO AVANT », plus « AVANT » qui se lisait comme une direction */
  FH.legs=[];FH.arme=-2;[].forEach.call(el.children,function(c){FH.legs[+c.getAttribute('data-s')]=c;});} // rangés par EMPLACEMENT : un geste refusé ne secoue pas l'autre
function fhArme(){if(!FH.legs||figGlisseOn())return;const s=figDirSlot();if(s===FH.arme)return; // (v4, chaque image en vol) le geste que vise le pouce s'ALLUME
  const a=FH.legs[FH.arme];if(a)a.classList.remove('arme');FH.arme=s;const b=FH.legs[s];if(b)b.classList.add('arme');}
function fhLegFx(s,ko){const b=FH.legs&&FH.legs[s];if(!b||s<0)return;
  if(ko){b.classList.add('ko');clearTimeout(b._k);b._k=setTimeout(function(){b.classList.remove('ko');},460);
    fhAnime(b,[{transform:'none'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'none'}],400,{easing:'steps(4)'});}
  else fhAnime(b,[{transform:'scale(1.22)',filter:'brightness(2.8)'},{transform:'none',filter:'none'}],360);}
window.dbgImpu=function(a,n){if(a==='tap'){const r=figImpulsion();return r?(r.attente?'attente':'ok'):'refus';}if(a==='slot'){const r=figLance(n|0,{});return r?(r.attente?'attente':'ok'):'refus';}
  const C=FX2.corps,e=document.getElementById('fh');return {on:IMPU.on,dir:FDIR.on,mode:mode,go:gameOver,intro:!!introD,eta:+(+CAMV.eta).toFixed(2),combo:{n:FX2.cv.n,dist:FX2.cv.dist,x:figCvX(),noms:FX2.cv.noms.slice()},ptsVol:FX2.pts,
    hud:e?e.className+' : '+e.textContent:'',chaine:CHA.liste.slice(),chutes:FX2.chutes,
    figs:C?C.figs.map(function(r){return r.f.id+(r.s>0?'+':'-')+' tours '+(r.mv[0]?r.mv[0].tours:0)+(r.paye?' payée':r.fini?' finie':'');}):null};};
function figIco(f){let m=null;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null&&(!m||Math.abs(f.m[i].t)>Math.abs(m.t)))m=f.m[i];
  if(!m)return 'fgBa';let n=0;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null)n++;if(n>1)return 'fgCo';
  const a=m.a;if(Math.abs(a[0])>.9)return m.t>0?'fgAv':'fgAr';if(Math.abs(a[1])>.9)return 'fgTo';if(Math.abs(a[2])>.9)return 'fgTn';return 'fgCo';}
function figCourt(f){const c=LANG==='en'?(f.ce||f.en||f.n):(f.c||f.n);return String(c).split(' ')[0].slice(0,8);}
function figHudMaj(){const el=document.getElementById('tFig');if(!el||!window.FIG)return;const S=figSlots(),cle=S.join(',')+'|'+LANG;if(FX2.cle===cle)return;FX2.cle=cle;
  el.innerHTML=S.map(function(id,i){if(!id)return '';const f=i<2&&FIG.oriente?FIG.oriente(FIG.par[id],FIG_DIR[i]):FIG.par[id];return '<div class="tFigB" data-s="'+i+'" role="button" aria-label="'+sansAcc(TR(f.n)).replace(/"/g,'')+'">'
    +'<i class="pxi pxi-rotation '+figIco(f)+'" aria-hidden="true"></i><b>'+sansAcc(figCourt(f)).replace(/[<>&"]/g,'')+'</b><u>'+(i+1)+'</u></div>';}).join('');
  FX2.bts=[];[].forEach.call(el.children,function(b){FX2.bts[+b.getAttribute('data-s')]=b;});FX2.btOn[0]=FX2.btOn[1]=FX2.btOn[2]=false;} // (les deux familles) rangés par EMPLACEMENT : 1 = avant, 2 = côté
/* ===== LES RELANCES SANS LECTURE FORCÉE (2026-10-24, passe perf PC : « get offsetWidth 31 ms en course, getImageData 325 ms au menu ») =====
   PCL_ON : l'interrupteur de TOUTE la passe « lectures 2D » (ici, la vignette du ciel dans atelier-ferme.js, chainHudShow, chaineEncaisse) —
   ?pclect=0 rend l'ancien comportement ; un vrai téléphone (TEL_NATIF) le garde aussi. Défini ICI, le plus tôt des morceaux qui s'en servent.
   figBtFx : `void b.offsetWidth` forçait style ET mise en page de tout le HUD à chaque figure lancée ; on ALTERNE l'animation et sa jumelle
   (.boum / .boum2, même dessin, autre nom — figures.css) : le nom change, le navigateur la relance à la même image. Deux appels dans la même
   tâche gardent le dernier, comme avant. */
const PCL_ON=!TEL_NATIF&&(function(){try{return new URLSearchParams(location.search).get('pclect')!=='0';}catch(e){return true;}})();
function figBtFx(s,c){const b=FX2.bts&&FX2.bts[s];if(!b)return;if(PCL_ON){const x=b.classList.contains(c);b.classList.remove('boum','non','boum2','non2');b.classList.add(x?c+'2':c);return;}b.classList.remove('boum','non');void b.offsetWidth;b.classList.add(c);}
function figHud(){ // (chaque image) les boutons n'existent qu'en VOL ; « on » = tenu
  figRedP();const v=FIGV2.on&&started&&!gameOver&&mode==='fall'&&!introD&&figTutoOk();fhTick(v||FR.on);if(v&&FDIR.on)fhArme(); // (2026-10-17) la figure SUR LA ROUTE garde son HUD tant qu'elle tourne (le rappel des gestes, lui, reste au vol)
  if(v!==FX2.vis){FX2.vis=v;document.body.classList.toggle('figVol',v);if(v){if(FDIR.on)fhLegMaj();else figHudMaj();}} // (2026-10-15) au joystick : le RAPPEL ↑ 1 · ◄► 2, plus de boutons
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
