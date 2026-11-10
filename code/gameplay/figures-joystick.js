/* ===== LE JOYSTICK NITRO ET LA FIGURE AU HASARD ADAPTÉE (2026-11-10, Sacha : « retravaille le système de figure : le bouton nitro doit être un joystick
   qui permet de faire les figures de la direction où tu le pousses, et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées
   tant que c'est adapté à la direction de la voiture ») — la spec est docs/superpowers/specs/2026-11-10-joystick-nitro-figures-design.md.
   · `FJOY` : l'état partagé (`on` : `?figjoy=0` rend le double-tap d'avant, le pouce gauche choisit l'emplacement et NITRO ne glisse plus).
   · `figTireAdapte(o)` : LE DOUBLE-TAP. Parmi les figures possédées (`veqFigsAMoi`) on garde (1) celles qui TIENNENT dans le vol (`figDose` ≥ `figDMin` — le
     tirage ne donne jamais une figure que `figLance` refuserait) ; (2) celles de la DIRECTION du pouce gauche (côté si le pouce braque, avant / arrière si
     on pousse : `figPeut`) — sans figure pour cette direction, on garde toutes celles qui tiennent (REPLI : un débutant qui n'a que le tonneau n'est pas refusé) ;
     (3) pouce au neutre et une figure déjà en train de tourner : on CONTINUE dans son sens (un salto garde son orientation, une toupie son côté) ; puis
     `FIG.tire` évite de redonner la même deux fois de suite. Rend {f, dx, sens} (f orientée avant / arrière quand elle va dans les deux sens) ou null.
   · `window.dbgTirage(n,o)` : n tirages À SEC (sans lancer), les compteurs de ce qui serait faux. `window.dbgJoy()` : l'état du joystick. */
const FJOY={on:!/[?&]figjoy=0\b/.test(location.search),der:null,ders:-1,sens:0,cote:0,n:0,refus:0,vib:0,arme:true,dir:null,tireSaut:null,log:[],vide:0,rejet:0,lent:700,repos:400}; // lent : au-delà (ms depuis la zone morte), le mouvement n'est plus une poussée ; repos : un pouce immobile aussi longtemps devient le nouveau centre (gliMv)
function fjDispoSaut(){return 2*VEQ_K.saut/(FALL_G*gK())-.15;} // le temps de vol qu'un saut nitro donne (le budget des figures qui partent avec lui)
function fjPouce(o){let x,y; // le pouce GAUCHE : x > 0 = à gauche, y > 0 = en avant (le même repère que figDirSlot) — o.x / o.y : le banc
  if(o&&o.x!=null){x=+o.x||0;y=+o.y||0;}
  else if(FDIR.force){x=FDIR.force[0];y=FDIR.force[1];}
  else if(TCTL.act){x=TCTL.st;y=TCTL.sv;}
  else{x=(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);y=(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);}
  return [x,y];}
function fjSlotPouce(x,y){if(Math.abs(x)>=.3&&Math.abs(x)>=Math.abs(y)*.85)return 2;return y<=-.3?1:y>=.3?0:-1;} // 2 côté · 1 arrière · 0 avant · −1 neutre (figDirSlot, mais le neutre se distingue de l'avant)
function figTireAdapte(o){o=o||{};if(!window.FIG)return null;const C=FX2.corps;if(C&&C.occupe()>=3)return null; // trois figures en cours : rien ne part
  const bud=o.dispo!=null?o.dispo:figBudget(),douce=o.dispo!=null,xy=fjPouce(o),k=fjSlotPouce(xy[0],xy[1]);
  let ids=veqFigsAMoi().filter(function(id){const f=FIG.par[id];return f&&figDose(f,bud)>=figDMin(f,douce);});
  if(!ids.length)return null;
  if(k>=0){const D=ids.filter(function(id){return figPeut(id).indexOf(k)>=0;});if(D.length)ids=D;else FJOY.repli=(FJOY.repli|0)+1;} // (REPLI) pas de figure pour cette direction : toutes celles qui tiennent
  let run=null;if(C)for(let i=C.figs.length-1;i>=0&&!run;i--){const r=C.figs[i];if(!r.paye&&r.mv&&r.mv.length)run=r;} // la figure qui tourne encore (la plus récente)
  let f=FIG.tire(ids,FJOY.der);if(!f)return null;FJOY.der=f.id;
  const P=figPeut(f.id),dx=Math.abs(xy[0])>=.3?xy[0]:null;let sens;
  if(P.indexOf(0)>=0||P.indexOf(1)>=0){ // un salto : son orientation — le pouce (avant / arrière), sinon celle de la figure qui tourne, sinon le hasard
    const d9=k===0&&P.indexOf(0)>=0?'avant':k===1&&P.indexOf(1)>=0?'arriere':run&&(run.f.sens==='avant'||run.f.sens==='arriere')&&P.indexOf(run.f.sens==='avant'?0:1)>=0?run.f.sens:P.length>1?(Math.random()<.5?'avant':'arriere'):(P[0]===0?'avant':'arriere');
    f=FIG.oriente(f,d9);}
  if(k<0&&run&&P.indexOf(2)>=0&&run.s)sens=run.s; // pouce au neutre, une toupie / un tonneau tourne : on continue dans son sens
  return {f:f,dx:dx,sens:sens};}
window.dbgTirage=function(n,o){o=o||{};n=Math.max(1,Math.min(5000,n|0||1));const r={tires:{},refus:0,horsTemps:0,horsDirection:0,repetes:0,repli:0},xy=fjPouce(o),k=fjSlotPouce(xy[0],xy[1]),bud=o.dispo!=null?o.dispo:figBudget();let der=null;FJOY.repli=0;
  for(let i=0;i<n;i++){const t=figTireAdapte(o);if(!t){r.refus++;continue;}const id=t.f.src?t.f.src.id:t.f.id,f=FIG.par[id];r.tires[id]=(r.tires[id]|0)+1;
    if(figDose(f,bud)<figDMin(f,o.dispo!=null))r.horsTemps++;
    if(k>=0&&figPeut(id).indexOf(k)<0&&!FJOY.repli)r.horsDirection++;
    if(id===der&&Object.keys(r.tires).length>1)r.repetes++;der=id;}
  r.repli=FJOY.repli|0;return r;};
window.dbgJoy=function(){return {on:FJOY.on,arme:FJOY.arme,dir:FJOY.dir,n:FJOY.n,refus:FX2.refus|0,vib:FJOY.vib,der:FJOY.der,ders:FJOY.ders,sens:FJOY.sens,vide:FJOY.vide,rejet:FJOY.rejet,log:FJOY.log.slice()};};
/* LE JOYSTICK : la direction poussée (u haut · d bas · l gauche · r droite) → l'emplacement de SA direction (0 avant · 1 arrière · 2 côté) ; ◄ ► : la figure du côté,
   partant du côté du pouce (dx > 0 = à gauche, comme le volant). Emplacement vide : le refus (strict), jamais une figure au hasard. Rend vrai si la figure part ou attend l'image
   du décollage. */
function figJoyOpts(d){return {s:d==='u'?0:d==='d'?1:2,o:{double:true,empile:true,strict:!TUTO.on,dx:d==='l'?1:d==='r'?-1:0}};}
function figJoyJoue(d){const j=figJoyOpts(d),r=figLance(j.s,j.o);if(!r)return false;FJOY.n++;FJOY.ders=j.s;
  if(r.attente){FJOY.der=figSlots()[j.s]||null;FJOY.sens=0;}else{FJOY.der=r.f.src?r.f.src.id:r.f.id;FJOY.sens=r.s;}
  return true;}
/* LES REMISES À ZÉRO : mort, seconde chance, nouvelle partie (seconde-chance.js), appli qui part derrière ou perd le focus (iOS n'envoie pas toujours touchcancel) — la poussée en cours,
   sa requête, le réarmement et le pion repartent à neuf ; aucune requête périmée ne part à la reprise. */
function fjoyRaz(){GLI.id=null;GLI.req=null;FJOY.arme=true;FJOY.dir=null;FJOY.tireSaut=null;figJoyVoit(null);}
addEventListener('blur',fjoyRaz);
document.addEventListener('visibilitychange',function(){if(document.hidden)fjoyRaz();});
/* ===== LE DESIGN DU POUCE (2026-11-10, Sacha : « retravaille un peu le design du pouce ») — il remplace la petite flèche flottante #figGl et le rappel #fhLeg au doigt =====
   #tJoy (créé ici, jamais dans la page ; le style est css/joystick-nitro.css) est centré sur #tNitro, droitier comme gaucher, debout comme couché (la place de NITRO se LIT à chaque
   affichage : getBoundingClientRect) : un SOCLE rond, un PION qui suit le pouce (retenu à `TJ_RET` = 56 px du centre) et quatre REPÈRES ▲ ▼ ◄ ► = la flèche et le NOM COURT de la figure
   ÉQUIPÉE à cette direction (`figSlots`, `figCourt`, la couleur de sa rareté `figRarH` ; emplacement vide : grisé). Au sol, les repères disent ce que fait chaque direction AU SOL (`figGNom` :
   WHEELIE, TAIL WHIP…). Où le rangement des repères est un petit problème : NITRO vit dans le coin du pouce, ► et ▼ n'ont souvent pas la place à leur point cardinal — `tjPlace` cherche
   pour chaque repère l'angle le plus proche de sa direction où il tient dans l'écran (marge 8 px) sans toucher NITRO, le socle ni un autre repère.
   · `figJoyVoit(d,dx,dy,claque)` : (dx,dy) = l'écart du pouce à son point d'appui ; `d` = la direction qui part (au seuil) ; `claque` = vrai à ce coup : le pion « claque » (classe .claque 160 ms,
     flash + secousse ; sous ALLEGE / réduire les animations : un simple changement de couleur) en même temps que la vibration. Sans dx : le pouce est levé, tout s'éteint (le rappel de vol reste).
   · `figJoyLeg(forcer)` : les noms se recalculent quand `figSlots().join(',')+LANG` (+ le mode : vol / sol) change, comme fhLegMaj. `figJoyTick(v)` : chaque image depuis figHud — le rappel
     de VOL (classe .vol : socle pâle + repères, le pouce levé) apparaît au décollage et s'éteint à l'atterrissage.
   · `window.dbgJoyLeg()` (banc) : l'état du pouce ; `dbgJoyLeg('tous')` : le nom court de chaque figure en FR et EN et ses directions. */
const TJ={el:null,sf:null,pion:null,rep:{},cle:'',mode:'',vol:false,tenu:false,d:null,tire:null,px:0,py:0,n:0,claT:0,leger:false};
const TJ_JET=52,TJ_RET=56,TJ_VISE=14,TJ_ORD=['u','d','l','r'],TJ_FL={u:'haut',d:'bas',l:'gauche',r:'droite'},TJ_ANG={u:-90,d:90,l:180,r:0}; // le pion est retenu à 56 px ; à 14 px on VISE
function tjCree(){if(TJ.el)return TJ.el;if(!document.body||!document.body.classList.contains('touch'))return null;
  const el=document.createElement('div');el.id='tJoy';el.setAttribute('aria-hidden','true');
  el.innerHTML='<i class="tjSocle"><u data-a="u"></u><u data-a="d"></u><u data-a="l"></u><u data-a="r"></u></i>'
    +TJ_ORD.map(function(k){return '<b class="tjRep vide" data-d="'+k+'"><i class="pxi pxi-'+TJ_FL[k]+'" aria-hidden="true"></i><span></span></b>';}).join('')+'<i class="tjPion"></i>';
  document.body.appendChild(el);TJ.el=el;TJ.sf=el.firstChild;TJ.pion=el.lastChild;
  TJ.leger=!!(ALLEGE||REDUCED_MOTION);if(TJ.leger)el.classList.add('leger'); // la version allégée et « réduire les animations » : ni filtre ni secousse
  TJ_ORD.forEach(function(k){TJ.rep[k]=el.querySelector('[data-d="'+k+'"]');});
  addEventListener('resize',function(){if(TJ.vol||TJ.tenu)tjPlace();});
  return el;}
function tjNom(k){ // ce que dit le repère k : en vol la figure ÉQUIPÉE de sa direction, au sol ce que la direction fait au sol
  if(mode==='fall'){const S=figSlots(),id=S[k==='u'?0:k==='d'?1:2],f=id&&window.FIG&&FIG.par[id];return f?{t:sansAcc(figCourt(f)),rp:figRarH(f)}:{t:'',rp:null};}
  return {t:figGNom(k)||'',rp:null};}
function figJoyLeg(forcer){const E=tjCree();if(!E)return;
  const cle=mode+'|'+figSlots().join(',')+'|'+LANG+'|'+(GSOL.v2?1:0);TJ.mode=mode;if(!forcer&&cle===TJ.cle)return;TJ.cle=cle;
  TJ_ORD.forEach(function(k){const e=TJ.rep[k],n=tjNom(k);e.lastChild.textContent=n.t||'-';e.classList.toggle('vide',!n.t);if(n.rp)e.setAttribute('data-rp',n.rp);else e.removeAttribute('data-rp');});
  tjPlace();}
function tjMarges(){let e=document.getElementById('tjMarge');if(!e){e=document.createElement('div');e.id='tjMarge';e.setAttribute('aria-hidden','true'); /* (H-14) la sonde des marges sûres : haut, droite, bas, gauche */
    e.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:var(--ccT,env(safe-area-inset-top,0px)) var(--ccR,env(safe-area-inset-right,0px)) var(--ccB,env(safe-area-inset-bottom,0px)) var(--ccL,env(safe-area-inset-left,0px))';document.body.appendChild(e);}
  const c=getComputedStyle(e);return [parseFloat(c.paddingTop)||0,parseFloat(c.paddingRight)||0,parseFloat(c.paddingBottom)||0,parseFloat(c.paddingLeft)||0];}
function tjHeurte(a,b,m){return a[0]<b[2]+m&&a[2]>b[0]-m&&a[1]<b[3]+m&&a[3]>b[1]-m;} // deux rectangles [g,h,d,b] à moins de m px
function tjDist(r,cx,cy){const x=Math.max(r[0],Math.min(cx,r[2])),y=Math.max(r[1],Math.min(cy,r[3]));return Math.hypot(x-cx,y-cy);} // du point au rectangle
function tjPlace(){const E=TJ.el,N=document.getElementById('tNitro');if(!E||!N)return;const b=N.getBoundingClientRect();if(b.width<10||b.height<10)return; // (NITRO caché : rien à centrer)
  /* (2026-11-10, debug HUD H-14) LES REPÈRES RESTENT DANS LA ZONE SÛRE ET HORS DE LA COLONNE DE DROITE : « dans l'écran à 8 px » ne voyait ni l'indicateur
     d'accueil (le repère du BAS y tombait : y 797-821 debout en 390 × 844, 355-379 couché), ni l'encoche couchée (celui de DROITE allait jusqu'à x 833 sur 844),
     ni les plaques de pouvoir couchées (1 584 + 1 392 px² sur NITRO MAX / AIR MAX, banc chevauche.cjs --pouce). Les marges sont celles du jeu (--ccX, sinon
     env(safe-area-inset-X), lues sur une sonde) ; les blocs visibles de la colonne (argent, plaques, chrono de vol, objectif) sont des obstacles comme NITRO. */
  const Z=tjMarges(),O=[];['cashHud','pwrChip','airHud','campChip'].forEach(function(i){const e=document.getElementById(i);if(!e)return;const r=e.getBoundingClientRect();if(r.width>1&&r.height>1&&getComputedStyle(e).visibility!=='hidden')O.push([r.left,r.top,r.right,r.bottom]);});
  const W=innerWidth,H=innerHeight,M=8,cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2,RC=TJ_RET+16+4,K=[b.left-3,b.top-TJ_JET,b.right+3,b.bottom+3]; // (la flamme de NITRO, quand le pouce l'enfonce, monte d'une cinquantaine de px au-dessus de son cadre : les repères ne la couvrent pas)
  E.style.setProperty('--cx',cx.toFixed(1)+'px');E.style.setProperty('--cy',cy.toFixed(1)+'px');
  const T={};TJ_ORD.forEach(function(k){T[k]=[TJ.rep[k].offsetWidth,TJ.rep[k].offsetHeight];});
  const cand={};TJ_ORD.forEach(function(k){const w=T[k][0],h=T[k][1],L=[];
    for(let dl=0;dl<=150;dl+=8)for(let sg=(dl?-1:1);sg<=1;sg+=2){const a=(TJ_ANG[k]+sg*dl)*Math.PI/180;
      for(let t=36;t<=220;t+=2){const px=cx+t*Math.cos(a)-w/2,py=cy+t*Math.sin(a)-h/2,r=[px,py,px+w,py+h];
        if(tjHeurte(r,K,0)||tjDist(r,cx,cy)<RC||O.some(function(o){return tjHeurte(r,o,4);}))continue; // encore sur NITRO, sur le socle ou sur la colonne : plus loin
        if(px>=M+Z[3]&&py>=M+Z[0]&&px+w<=W-M-Z[1]&&py+h<=H-M-Z[2])L.push({r:r,c:dl});break;}} // le plus près d'où il tient ; au-delà de l'écran, plus loin ne sert à rien
    cand[k]=L;});
  const ordre=TJ_ORD.slice().sort(function(p,q){return cand[p].length-cand[q].length;}),sol={},best={c:1e9,s:null};
  function dfs(i,c0){if(c0>=best.c)return;if(i>=ordre.length){best.c=c0;best.s=Object.assign({},sol);return;}const k=ordre[i]; // le rangement où la somme des écarts à la vraie direction est la plus petite (séparation et évaluation)
    for(let j=0;j<cand[k].length;j++){const c=cand[k][j];if(c0+c.c>=best.c)break;let ok=true;for(let m=0;m<i&&ok;m++)if(tjHeurte(c.r,sol[ordre[m]].r,4))ok=false;if(!ok)continue;sol[k]=c;dfs(i+1,c0+c.c);}}
  dfs(0,0);const trouve=!!best.s;if(trouve)Object.assign(sol,best.s);
  TJ_ORD.forEach(function(k){let r;if(trouve)r=sol[k].r;else{const w=T[k][0],h=T[k][1],a=TJ_ANG[k]*Math.PI/180,px=Math.max(M,Math.min(W-M-w,cx+84*Math.cos(a)-w/2)),py=Math.max(M,Math.min(H-M-h,cy+84*Math.sin(a)-h/2));r=[px,py];} // (repli : aucun rangement ne tient — l'écran est minuscule : au plus près, dans l'écran)
    TJ.rep[k].style.left=Math.round(r[0])+'px';TJ.rep[k].style.top=Math.round(r[1])+'px';});}
function tjEteint(){const E=TJ.el;if(!E)return;E.classList.remove('tenu','claque');E.removeAttribute('data-v');E.removeAttribute('data-t');
  TJ_ORD.forEach(function(k){TJ.rep[k].classList.remove('vise','tire');});TJ.d=null;TJ.tire=null;clearTimeout(TJ.claT);
  if(TJ.px||TJ.py){TJ.px=TJ.py=0;TJ.pion.style.translate='';}}
function figJoyVoit(d,dx,dy,claque){
  if(!FJOY.on)return;
  if(dx===undefined||!started||gameOver||paused){if(TJ.tenu){TJ.tenu=false;tjEteint();}return;} // le pouce est levé (ou la course ne tourne plus) : le pion s'éteint, le rappel de vol reste
  const E=tjCree();if(!E)return;
  if(!TJ.tenu){TJ.tenu=true;E.classList.add('tenu');figJoyLeg(true);} // le pouce se pose : le socle s'allume, le pion est au centre
  const L=Math.hypot(dx,dy),s=L>TJ_RET?TJ_RET/L:1,X=Math.round(dx*s*2)/2,Y=Math.round(dy*s*2)/2;
  if(X!==TJ.px||Y!==TJ.py){TJ.px=X;TJ.py=Y;TJ.pion.style.translate=X+'px '+Y+'px';}
  let a=d||null;if(!a&&L>=TJ_VISE)a=Math.abs(dx)>=Math.abs(dy)?(dx<0?'l':'r'):(dy<0?'u':'d'); // la direction VISÉE (avant le seuil) : l'axe le plus poussé
  if(a!==TJ.d){const o=TJ.rep[TJ.d];if(o)o.classList.remove('vise');const n=TJ.rep[a];if(n)n.classList.add('vise');TJ.d=a;if(a)E.setAttribute('data-v',a);else E.removeAttribute('data-v');}
  const t=FJOY.arme?null:FJOY.dir; // « tiré » : la poussée est partie ; il le reste jusqu'au retour vers le centre (le réarmement)
  if(t!==TJ.tire){const o=TJ.rep[TJ.tire];if(o)o.classList.remove('tire');const n=TJ.rep[t];if(n)n.classList.add('tire');TJ.tire=t;if(t)E.setAttribute('data-t',t);else E.removeAttribute('data-t');}
  if(claque){TJ.n++;E.classList.remove('claque');void E.offsetWidth;E.classList.add('claque');clearTimeout(TJ.claT);TJ.claT=setTimeout(function(){E.classList.remove('claque');},160);}}
function figJoyTick(v){ // (chaque image, depuis figHud) le rappel de VOL : socle pâle + repères tant qu'on vole, le pouce levé ; il s'éteint à l'atterrissage
  if(!TCTL.on||!FJOY.on)return;const vol=!!v&&!paused;
  if(vol!==TJ.vol){TJ.vol=vol;const E=vol?tjCree():TJ.el;if(E){E.classList.toggle('vol',vol);if(vol)figJoyLeg(true);}return;}
  if((TJ.vol||TJ.tenu)&&TJ.mode!==mode)figJoyLeg();} // le mode change (décollage / atterrissage sous le pouce) : les repères redisent
window.dbgJoyLeg=function(a){
  if(a==='tous'){const f2=function(f,en){return sansAcc(String(en?(f.ce||f.en||f.n):(f.c||f.n)).split(' ')[0].slice(0,8));};return Object.keys(FIG.par).map(function(id){const f=FIG.par[id];return {id:id,fr:f2(f,false),en:f2(f,true),slots:figPeut(id)};});}
  const o={};TJ_ORD.forEach(function(k){const e=TJ.rep[k];o[k]=e?e.lastChild.textContent:null;});
  return {claques:TJ.n,cle:TJ.cle,vol:TJ.vol,tenu:TJ.tenu,d:TJ.d,tire:TJ.tire,leger:TJ.leger,noms:o,x:TJ.px,y:TJ.py};};
