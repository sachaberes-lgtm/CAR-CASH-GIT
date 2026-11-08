/* ===== BOUTIQUE : LES AILES ET LES TRAÎNÉES EN RAYONS CLASSIQUES (2026-11-07, Sacha : « la boutique est horrible, j'aime pas le système des ailes, fais un truc classique » · « les ailes, elles sont à refaire complètement : quelque chose de plus classique, deux par deux, où tu présentes correctement les ailes avec la voiture du joueur, joliment, avec des beaux éclairages » · « les traînées sont toujours dans des boîtes, c'est nul : on les met par ligne ») =====
   Deux rayons, un même langage, sans aucune boîte de verre :
   · AILES — une grille de cartes, DEUX par rangée. Chaque carte est une petite scène de studio : un fond à la couleur de la rareté, un spot
     blanc qui tombe d'en haut, des rayons de lumière, un sol éclairé, et TA caisse (celle que tu conduis, avec sa peinture) qui porte CETTE aile,
     déployée, vue de trois quarts arrière (bcAileFile → carPhoto, aile.avec). Les épiques et plus scintillent, les légendaires ont un reflet
     qui passe. Sous la scène : le nom (une ligne, le corps qui descend s'il faut, jamais coupé n'importe où), puis le prix, À TOI, ÉQUIPÉE ou
     MISSION (le violet-bleu du bouton MISSIONS du garage, --bqMis).
   · TRAÎNÉES — une LIGNE par traînée, sur toute la largeur : à gauche la traînée qui coule derrière la caisse sur sa route de nuit (la plaque
     animée de traineeCarte), à droite son nom et son état. Seules les lignes en vue s'animent.
   Un intertitre par rareté (son logo, son nom, « à toi / total »), rien d'autre : plus de sous-titres de famille.
   Toucher une carte ou une ligne = l'essayer sur la caisse (bqEssaie, comme partout) ; le grand bouton du bas achète / équipe, inchangé.
   Les cartes sont des `.bcK` (pas des `.bqK`) : aucune des feuilles des anciennes boîtes ne les touche. Branché dans garBqPanneau
   (boutique-scene-1.js : bcRail, bcMaj). La molette des ailes : `?molette=1` ; ce rayon classique entier : `?bqc=0` le coupe.
   `dbgBqc()` : les cartes, leurs boîtes et leurs photos (banc). */
const BQC={on:!/[?&]bqc=0\b/.test(location.search),io:null,eq:'',lay:''};
function bcT(s){return sansAcc(TR(s));}
/* l'état d'un habillage, en une pastille : ÉQUIPÉE · À TOI · le prix (trop cher : grisé) · € · MISSION (et sa jauge) */
function bcEtat(cat,d,k){const a=bqA(k);let eq=false;try{eq=a&&shopEqD(cat).id===d.id;}catch(e){}
  if(eq)return {c:'eq',h:pxi('coche')+'<b>'+bcT('ÉQUIPÉE')+'</b>',t:bcT('ÉQUIPÉE')};
  if(a)return {c:'a',h:pxi('coche')+'<b>'+bcT('À TOI')+'</b>',t:bcT('À TOI')};
  if(d.pack==='chat')return {c:'eur',h:'<b>'+bcT('PACK CHAT')+'</b>',t:bcT('PACK CHAT')};
  if(d.eur)return {c:'eur',h:'<b>'+eurTxt(d.eur)+'</b>',t:eurTxt(d.eur)};
  if(d.p)return {c:'pc'+(bank()<d.p?' cher':''),h:'<b>'+bqPxT(d.p)+'</b>' /* le prix porte déjà son « € » (fmtSolde) : pas de pièce en plus */,t:bqPxT(d.p)};
  let j='';try{const m=m2DeHab(cat,d);if(m){const t=m2Seuil(m);j='<u><em style="width:'+Math.round(100*m2Frac(m,m2Val(m),t))+'%"></em></u>';}}catch(e){}
  return {c:'mis',h:pxi('verrou')+'<b>'+bcT('MISSION')+'</b>'+j,t:bcT('MISSION')};}
/* l'intertitre d'une rareté */
function bcTete(f,n,a){const ri=rarInfo(f);
  return '<div class="bcH r-'+f+'" style="--rc:'+ri.c+'"><i>'+pxi(RAR_LOGO[f]||'etoile')+'</i><b>'+bcT(ri.n)+'</b><s></s><em><i>'+a+'</i>/'+n+'</em></div>';}
/* une CARTE d'aile : la scène (fond, spot, rayons, sol, la caisse qui porte l'aile, l'éclat), le nom, l'état */
function bcAileCarte(k,n){const d=bqCos(k).d;if(!d)return '';const f=cosmRar('aile',d),ri=rarInfo(f),E=bcEtat('aile',d,k),nom=bcT(d.n);
  return '<div class="bcK bcA r-'+f+' e-'+E.c.split(' ')[0]+'" data-k="'+k+'" role="button" tabindex="0" style="--rc:'+ri.c+';--i:'+Math.min(n,10)+'" aria-label="'+(nom+' · '+bcT(ri.n1)+' · '+E.t).replace(/"/g,'')+'">'
    +'<span class="bcSc"><i class="bcRay" aria-hidden="true"></i><i class="bcSol" aria-hidden="true"></i><span class="bcPh" data-bca="'+d.id+'"><i class="bcAtt">'+pxi('aile')+'</i></span><i class="bcEcl" aria-hidden="true"></i></span>'
    +'<span class="bcTx"><b class="bcN">'+nom+'</b><span class="bcP '+E.c+'">'+E.h+'</span></span></div>';}
/* une LIGNE de traînée : la route de nuit et la traînée qui coule (traineeCarte), la caisse au bout ; le nom, l'état
   (2026-11-07, Sacha : « on reconnaît pas assez les traînées : tu as fait un pictogramme simplifié, il faudrait un aperçu réel de ce à quoi elles
   ressemblent ») LA VRAIE TRAÎNÉE : une photo prise dans la salle 3D de la boutique (la caisse de départ de profil sur son plateau, la traînée qui
   file derrière elle, telle que le jeu la dessine), rangée dans assets/boutique/trainees/<id>.jpg (refaire : outils/banc-boutique/trainees.cjs).
   Une traînée sans photo garde la plaque dessinée. */
const BQ_TR_PHOTO={nitro:1,rose:1,sakura:1,matrice:1,or:1,anneaux:1,wow:1,glouton:1,hyper:1,grille:1,billets:1,foudre:1,arcenciel:1};
function bcTraineeLigne(k,n){const d=bqCos(k).d;if(!d)return '';const f=cosmRar('trainee',d),ri=rarInfo(f),E=bcEtat('trainee',d,k),nom=bcT(d.n);
  return '<div class="bcK bcT r-'+f+' e-'+E.c.split(' ')[0]+'" data-k="'+k+'" role="button" tabindex="0" style="--rc:'+ri.c+';--tc:'+traineeCoul(d)+';--i:'+Math.min(n,10)+'" aria-label="'+(nom+' · '+bcT(ri.n1)+' · '+E.t).replace(/"/g,'')+'">'
    +'<span class="bcTv'+(BQ_TR_PHOTO[d.id]?' ph':'')+'" aria-hidden="true">'+(BQ_TR_PHOTO[d.id]?'<img class="bcTp" src="assets/boutique/trainees/'+d.id+'.jpg" alt="" decoding="async" draggable="false">':traineeCarte(d)+'<i class="bcTc">'+pxi('voiture')+'</i>')+'</span>'
    +'<span class="bcTx"><b class="bcN">'+nom+'</b><span class="bcP '+E.c+'">'+E.h+'</span></span></div>';}
/* LE RAYON (appelé par garBqPanneau à la place des anciennes cartes) : les intertitres et les cartes, dans une seule grille */
function bcRail(cat,L){try{bqRayonRegarde(cat);}catch(e){} /* en entrant, on regarde déjà ce qu'on porte : le nom et le bouton parlent de l'aile / de la traînée */
  const fam=function(k){return cosmRar(cat,bqCos(k).d);},nb={},ok={};L.forEach(function(k){const f=fam(k);nb[f]=(nb[f]|0)+1;if(bqA(k))ok[f]=(ok[f]|0)+1;});
  const R=[];L.forEach(function(k,n){const f=fam(k);if(!n||fam(L[n-1])!==f)R.push(bcTete(f,nb[f],ok[f]|0));R.push(cat==='aile'?bcAileCarte(k,n):bcTraineeLigne(k,n));});
  BQC.eq='';queueMicrotask(bcApres);
  return ['<div class="bcG" data-cat="'+cat+'">'+R.join('')+'</div>'];}
function bcRailEl(){return document.querySelector('#gBqPan .bqRail');}
/* LA PHOTO d'une aile portée par la caisse du joueur (sa caisse, sa peinture) : rangée sous sa clé, prise par le studio (photoTour → carPhoto) */
function bcAileFile(id,cb,el){const j=COSM.aile.findIndex(function(d){return d.id===id;});if(j<0)return;const c=equippedCar();let p='';try{p=shopEqD('peinture').id;}catch(e){}
  const k='a4:'+id+':'+c+':'+p;if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}
  PHQ.q.push([k,cb,{k:k,j:j,avec:1},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
function bcPhotos(rail){rail.querySelectorAll('[data-bca]:not(.ok)').forEach(function(x){bcAileFile(x.getAttribute('data-bca'),function(url){if(!url||x.classList.contains('ok'))return;
  const im=document.createElement('img');im.alt='';im.className='bcIm';im.decoding='async';im.src=url;x.textContent='';x.appendChild(im);x.classList.add('ok');},x);});}
/* le NOM tient sur sa ligne : le corps descend (9 → 7 px) ; au-delà, deux lignes équilibrées (jamais un mot coupé) */
function bcNoms(rail){rail.querySelectorAll('.bcN').forEach(function(b){const w=b.clientWidth;if(!w)return;const k=w+'|'+b.textContent;if(b._k===k)return;b._k=k;
  b.classList.remove('n8','n7','deux');if(b.scrollWidth<=w+1)return;b.classList.add('n8');if(b.scrollWidth<=w+1)return;b.classList.remove('n8');b.classList.add('n7');if(b.scrollWidth<=w+1)return;b.classList.add('deux');});}
/* après chaque pose du rayon : les gestes (une fois), les photos, les noms, l'œil qui n'anime que les lignes en vue */
function bcApres(){const rail=bcRailEl();if(!rail||!rail.querySelector('.bcG'))return;
  if(!rail._bc){rail._bc=1;
    const essaie=function(t){const pan=document.getElementById('gBqPan');if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;
      uiPop(t);GSON9=false;if(pan)pan.classList.remove('menu');GBQ.figDir=null;bqEssaie(t.getAttribute('data-k'));
      rail.querySelectorAll('.bcK').forEach(function(el){el.classList.toggle('sel',el===t);});if(GSON9)hap(8);else uiClic('nav');};
    rail.addEventListener('click',function(e){const t=e.target.closest&&e.target.closest('.bcK');if(!t||!rail.contains(t))return;e.stopPropagation();essaie(t);});
    rail.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest&&e.target.closest('.bcK');if(!t)return;e.preventDefault();essaie(t);});}
  const cur=bqCourant();rail.querySelectorAll('.bcK').forEach(function(el){el.classList.toggle('sel',el.getAttribute('data-k')===cur);});
  bcPhotos(rail);bcNoms(rail);
  if(BQC.io){BQC.io.disconnect();BQC.io=null;}
  const T=rail.querySelectorAll('.bcT');
  if(T.length){if('IntersectionObserver' in window){BQC.io=new IntersectionObserver(function(E){E.forEach(function(x){x.target.classList.toggle('vit',x.isIntersecting);});},{root:rail,rootMargin:'16px 0px'});T.forEach(function(el){BQC.io.observe(el);});}
    else T.forEach(function(el){el.classList.add('vit');});}}
/* À CHAQUE IMAGE (rayon AILES ou TRAÎNÉES ouvert) : l'équipement change par le grand bouton sans refaire la liste — l'état de chaque carte suit ;
   la largeur change (rotation) : les noms se recalent ; une photo qui manque est redemandée quand la file du studio est vide */
function bcMaj(rail,cat){if(!rail.querySelector('.bcG'))return;let id='';try{const d=shopEqD(cat);id=d&&shopOwned(cat,d.id)?d.id:'';}catch(e){}
  const k=cat+':'+id+'|'+bank()+'|'+LANG;
  if(BQC.eq!==k){const neuf=!BQC.eq;BQC.eq=k;if(!neuf)rail.querySelectorAll('.bcK').forEach(function(el){const kk=el.getAttribute('data-k'),d=bqCos(kk).d;if(!d)return;const E=bcEtat(cat,d,kk),p=el.querySelector('.bcP');
      if(p&&p._h!==E.h){p._h=E.h;p.className='bcP '+E.c;p.innerHTML=E.h;}const c0=E.c.split(' ')[0];if(!el.classList.contains('e-'+c0)){el.className=el.className.replace(/\be-\w+/,'e-'+c0);}});}
  const lay=rail.clientWidth+'|'+LANG;if(BQC.lay!==lay){BQC.lay=lay;bcNoms(rail);}
  if(!PHQ.q.length&&rail.querySelector('[data-bca]:not(.ok)'))bcPhotos(rail);}
window.dbgBqc=function(){const rail=bcRailEl();if(!rail)return null;const r=function(x){const b=x.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
  return {on:BQC.on,cat:GBQ.cat,rail:r(rail),scroll:[rail.scrollTop,rail.scrollHeight,rail.clientHeight],
    cartes:[...rail.querySelectorAll('.bcK')].map(function(el){const n=el.querySelector('.bcN'),p=el.querySelector('.bcP');return {k:el.getAttribute('data-k'),b:r(el),nom:n&&[n.textContent,n.className,n.scrollWidth,n.clientWidth],etat:p&&p.className,photo:!!el.querySelector('.bcIm'),sel:el.classList.contains('sel'),vit:el.classList.contains('vit')};}),
    file:PHQ.q.length};};
