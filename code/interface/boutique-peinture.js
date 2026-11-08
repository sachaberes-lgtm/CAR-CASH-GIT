/* ===== BOUTIQUE : LE NUANCIER — LE RAYON PEINTURES A SON PROPRE SYSTÈME (2026-11-07, Sacha : « dans la boutique les boîtes de Léo sont bien pour les voitures et achats, mais pas adaptées pour les peintures, traînées, figures… retravaille au max l'ergonomie, adaptée au mobile et à chaque catégorie d'item » · « chaque type d'item doit avoir un système propre ») =====
   Une peinture n'est pas une caisse qu'on photographie : c'est une COULEUR, une MATIÈRE, qu'on veut voir sur la caisse. Le rayon devient un
   NUANCIER de peintre :
   · des PASTILLES de tôle vernie (la peinture elle-même, sa finition, son animation pour une légendaire), serrées en grille — six par rangée
     debout comme couché, chacune ≥ 48 px sous le pouce — au lieu de trois grosses boîtes : on voit d'un coup d'œil beaucoup plus de couleurs ;
   · pas de texte sur la pastille : son ÉTAT en un signe — une coche (à toi), la coche bleue (équipée), l'anneau cyan qui se remplit (le défi
     « ou gagne-la » : sa jauge ; à zéro, un anneau pâle), une pièce (en $), un cadenas (une mission) ; le PRIX est celui de la famille, écrit une fois en tête ;
   · en haut, collée, la BARRE DES FAMILLES (UNIES · DÉGRADÉS · MOTIFS · ANIMÉES, leur prix, « à toi / total ») : un toucher saute à la
     famille, la famille qu'on regarde s'allume pendant qu'on fait défiler ;
   · TOUCHER une pastille = la caisse la porte tout de suite (bqEssaie, inchangé : le nom, la rareté, le défi au-dessus de la caisse ; le
     grand bouton du bas achète / équipe, inchangé) ; GARDER LE DOIGT = la LOUPE : le nom, la rareté, l'état ou le défi et sa jauge, au-dessus
     du doigt, sans rien essayer tant qu'on ne lâche pas ; glisser fait défiler et ferme la loupe.
   Branché par deux crochets dans boutique-scene-1.js (bqPeintRail → bqNuancierHtml ; le cadre de ce qu'on regarde → bqNuancierSel). Les
   cartes .bqK des autres rayons, l'inventaire, la boutique du jour (peintCarte) et la sauvegarde ne changent pas. */
const BQN={rail:null,pan:null,loupe:null,t:0,x:0,y:0,el:null,vue:0,fam:''};
const BQN_FAM=['commun','rare','epique','legendaire'];
/* l'état d'une peinture, en un mot (la loupe, l'étiquette lue) et une classe (le signe de la pastille) */
function bqNuanceEtat(d){const a=shopOwned('peinture',d.id);let eq=false;try{eq=shopEqD('peinture').id===d.id;}catch(e){}
  if(eq)return {c:'eq',t:sansAcc(TR('ÉQUIPÉE'))};if(a)return {c:'a',t:sansAcc(TR('À TOI'))};
  if(d.def){const p=peintDefFrac(d);return {c:'defi',t:sansAcc(TR('À GAGNER')),p:p,eur:d.eur?eurTxt(d.eur):''};}
  if(d.mis2)return {c:'mis',t:sansAcc(TR('MISSION'))};if(d.pack==='chat')return {c:'mis',t:sansAcc(TR('PACK CHAT'))};
  if(d.eur)return {c:'eur',t:eurTxt(d.eur)};if(d.p)return {c:'pc',t:bqPxT(d.p)};return {c:'mis',t:sansAcc(TR('MISSION'))};}
/* (2026-11-07, Sacha : « j'aime pas comment t'as mis les peintures en boule, c'est nul, trouve autre chose ») LA CARTE D'UNE PEINTURE : TA caisse
   (celle que tu conduis, avec son aile) photographiée DANS cette peinture, comme au catalogue — trois par rangée ; dessous, le nom et la pastille d'état
   (la même que les ailes et les traînées). Toucher = l'essayer sur le plateau ; garder le doigt = la loupe (inchangé). */
function bqNuanceEtiq(E){if(E.c==='eq')return pxi('coche')+'<b>'+sansAcc(TR('ÉQUIPÉE'))+'</b>';if(E.c==='a')return pxi('coche')+'<b>'+sansAcc(TR('À TOI'))+'</b>';
  if(E.c==='defi')return pxi('cible')+'<b>'+sansAcc(TR('DÉFI'))+'</b>'+ /* (2026-11-07) « DÉFI » et sa jauge (le prix en € de la famille est écrit une fois, dans l'intertitre) */(E.p>=0?'<u><em style="width:'+Math.round(E.p*100)+'%"></em></u>':'');
  if(E.c==='mis')return pxi('verrou')+'<b>'+E.t+'</b>';return '<b>'+E.t+'</b>';}
function bqNuanceHtml(k,n,cur){const d=bqCos(k).d;if(!d)return '';
  const r=cosmRar('peinture',d),ri=rarInfo(r),E=bqNuanceEtat(d),nom=sansAcc(TR(d.n)),cher=E.c==='pc'&&d.p&&bank()<d.p;
  return '<button type="button" class="pN pC r-'+r+' e-'+E.c+(k===cur?' sel':'')+'" data-k="'+k+'" style="--rc:'+ri.c+';--i:'+Math.min(n,18)+'"'
    +' title="'+nom.replace(/"/g,'')+'" aria-label="'+(nom+' · '+sansAcc(TR(ri.n1))+' · '+E.t).replace(/"/g,'')+'">'
    +'<span class="pCsc" aria-hidden="true"><span class="pCph" data-bcp="'+d.id+'"><i class="pCatt">'+pxi('voiture')+'</i></span></span>'
    +'<span class="pCn">'+nom+'</span><span class="pCe e-'+E.c+(cher?' cher':'')+'">'+bqNuanceEtiq(E)+'</span></button>';}
/* LA PHOTO : la caisse du joueur dans la peinture j (carPhoto, aile.peint), rangée sous sa clé (caisse, aile portée, peinture) */
function bqPeintFile(id,cb,el){const j=COSM.peinture.findIndex(function(d){return d.id===id;});if(j<0)return;const c=equippedCar();let a='';try{a=shopEqD('aile').id;}catch(e){}
  const k='p1:'+id+':'+c+':'+a;if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}
  PHQ.q.push([k,cb,{k:k,j:j,peint:1,avec:1},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
function bqPeintPhotos(rail){rail=rail||document.querySelector('#gBqPan .bqRail');if(!rail)return;
  rail.querySelectorAll('[data-bcp]:not(.ok):not(.dem)').forEach(function(x){x.classList.add('dem');bqPeintFile(x.getAttribute('data-bcp'),function(url){if(!url||x.classList.contains('ok'))return;
    const im=document.createElement('img');im.alt='';im.className='pCim';im.decoding='async';im.draggable=false;im.src=url;x.textContent='';x.appendChild(im);x.classList.add('ok');},x);});}
/* LE RAYON : la barre des familles, puis une section par famille (son intertitre d'une ligne, sa grille de pastilles) */
function bqNuancierHtml(L){try{peintDefisVerifie(false);}catch(e){} /* un défi rempli depuis la dernière visite : la peinture tombe en ouvrant le rayon (PEINTURE GAGNÉE) */
  bqRayonRegarde('peinture'); /* (2026-11-07, passe finale) en entrant, on regarde la peinture PORTÉE : le nom et le bouton ne parlent plus de la caisse */
  const fam=function(k){return cosmRar('peinture',bqCos(k).d);},G={},cur=bqCourant();L.forEach(function(k){const f=fam(k);(G[f]||(G[f]=[])).push(k);});
  const F=BQN_FAM.filter(function(f){return G[f];}).concat(Object.keys(G).filter(function(f){return BQN_FAM.indexOf(f)<0;}));
  const nom=function(f){return sansAcc(TR(BQ_PEINT_SOUS[f]||rarInfo(f).n));},px=function(f){return PEINT_EUR[f]?eurTxt(PEINT_EUR[f]):'';},nA=function(f){return G[f].filter(bqA).length;};
  /* (2026-11-07, passe finale) le prix et « à toi / total » ne se disent qu'UNE fois, dans la barre des familles (ils l'étaient aussi dans
     l'intertitre) ; l'intertitre garde la rareté et la famille, et explique l'anneau cyan là où il y en a : « ◯ À GAGNER EN JEU » */
  const defi=function(f){return G[f].some(function(k){const d=bqCos(k).d;return d&&bqNuanceEtat(d).c==='defi';});};
  /* (2026-11-07, Sacha : « dans l'onglet peinture, il y a marqué UNI, DÉGRADÉ, MOTIF : enlève, ça sert à rien » · « retravaille comment les couleurs sont présentées, ça peut être beaucoup mieux ») plus de barre des familles ni de sous-titre : un intertitre par RARETÉ (sa pastille, son nom, son prix, « à toi / total »), la légende de l'anneau dessous s'il y a des défis, puis les pastilles rondes vernies (boutique-peinture.css). La barre : `?nuancier=barre`. */
  const barre=/[?&]nuancier=barre\b/.test(location.search);
  let n=0;const S=F.map(function(f){const ri=rarInfo(f);
    return '<section class="pNs" data-pf="'+f+'" style="--rc:'+ri.c+'"><h4 class="pNh"><span class="bqRl">'+pxi(RAR_LOGO[f]||'etoile')+'</span><b>'+sansAcc(TR(ri.n))+'</b><s></s>'+(px(f)?'<u class="pNpx">'+px(f)+'</u>':'')+'<em class="pNct"><i>'+nA(f)+'</i>/'+G[f].length+'</em></h4>'
      +(defi(f)?'<p class="pNlg"><q aria-hidden="true"></q>'+sansAcc(TR('À GAGNER EN JEU'))+'</p>':'')
      +'<div class="pNg">'+G[f].map(function(k){return bqNuanceHtml(k,n++,cur);}).join('')+'</div></section>';});
  const nav='<nav class="pNav" style="--nf:'+F.length+'">'+F.map(function(f){return '<button type="button" data-pf="'+f+'" style="--rc:'+rarInfo(f).c+'"'+(f===F[0]?' class="on"':'')+'><b>'+nom(f)+'</b><em>'+(px(f)?px(f)+' · ':'')+nA(f)+'/'+G[f].length+'</em></button>';}).join('')+'</nav>';
  setTimeout(function(){bqNuancierBranche();bqPeintPhotos();},0);
  return ['<div class="pNu">'+(barre?nav:'')+S.join('')+'</div>'];}
/* le cadre de la pastille qu'on regarde (appelé par garBqPanneau quand ce qu'on regarde change) */
function bqNuancierSel(rail,cur){rail.querySelectorAll('.pN').forEach(function(el){el.classList.toggle('sel',el.getAttribute('data-k')===cur);});bqNuancierEq(rail);}
/* l'équipée suit le grand bouton (ÉQUIPER / DÉSÉQUIPER ne changent pas la liste : le rail n'est pas refait) — sa coche bleue passe d'une pastille à l'autre */
function bqNuancierEq(rail){if(!rail)return;let id='';try{id=shopEqD('peinture').id;}catch(e){return;}const k='peinture:'+id,A=sansAcc(TR('À TOI')),Q=sansAcc(TR('ÉQUIPÉE'));
  rail.querySelectorAll('.pN.e-eq,.pN.e-a').forEach(function(el){const eq=el.getAttribute('data-k')===k;if(el.classList.contains('e-eq')===eq)return;
    el.classList.toggle('e-eq',eq);el.classList.toggle('e-a',!eq);{const p=el.querySelector('.pCe');if(p){p.className='pCe e-'+(eq?'eq':'a');p.innerHTML=bqNuanceEtiq({c:eq?'eq':'a'});}}const l=el.getAttribute('aria-label')||'';el.setAttribute('aria-label',eq?l.replace(A,Q):l.replace(Q,A));});}
/* LES GESTES : branchés une fois sur le rail (il survit aux rayons) ; chaque geste vérifie qu'on est bien dans le nuancier */
function bqNuancierBranche(){const rail=document.querySelector('#gBqPan .bqRail');if(!rail||rail._pN)return;rail._pN=1;BQN.rail=rail;BQN.pan=document.getElementById('gBqPan');
  const ok=function(){return garageOn&&!GAR.go&&!ecranWipe._on&&GBQ.on;};
  rail.addEventListener('click',function(e){const t=e.target.closest&&e.target.closest('.pN, .pNav button');if(!t||!rail.contains(t))return;e.stopPropagation();if(!ok())return;
    if(t.classList.contains('pN')){bqNuancierLoupe(null);uiPop(t);GSON9=false;if(BQN.pan)BQN.pan.classList.remove('menu');GBQ.figDir=null;bqEssaie(t.getAttribute('data-k'));bqNuancierSel(rail,t.getAttribute('data-k'));if(GSON9)hap(8);else uiClic('nav');return;}
    uiClic('onglet');hap(6);bqNuancierVa(t.getAttribute('data-pf'));});
  rail.addEventListener('scroll',function(){bqNuancierLoupe(null);if(!BQN.vue){BQN.vue=1;requestAnimationFrame(function(){BQN.vue=0;bqNuancierFamVue();});}},{passive:true});
  /* la loupe : garder le doigt 0,38 s sur une pastille ; bouger de plus de 10 px (on fait défiler) l'annule */
  rail.addEventListener('pointerdown',function(e){const t=e.target.closest&&e.target.closest('.pN');clearTimeout(BQN.t);if(!t)return;BQN.x=e.clientX;BQN.y=e.clientY;BQN.el=t;
    BQN.t=setTimeout(function(){if(BQN.el===t&&ok()){bqNuancierLoupe(t);hap(5);}},380);},{passive:true});
  rail.addEventListener('pointermove',function(e){if(BQN.el&&Math.hypot(e.clientX-BQN.x,e.clientY-BQN.y)>10){clearTimeout(BQN.t);BQN.el=null;bqNuancierLoupe(null);}},{passive:true});
  const fin=function(){clearTimeout(BQN.t);BQN.el=null;if(BQN.loupe&&BQN.loupe.classList.contains('on')){clearTimeout(BQN.lt);BQN.lt=setTimeout(function(){bqNuancierLoupe(null);},1400);}};
  rail.addEventListener('pointerup',fin,{passive:true});rail.addEventListener('pointercancel',fin,{passive:true});
  {const bt=document.getElementById('gBqBtn');if(bt)bt.addEventListener('click',function(){if(!rail.querySelector('.pNu'))return;setTimeout(function(){bqNuancierEq(rail);},80);setTimeout(function(){bqNuancierEq(rail);},900);});} /* ÉQUIPER : la coche bleue change de pastille */
  rail.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('.pN'))e.preventDefault();});}
/* sauter à une famille : son intertitre vient se poser sous la barre */
function bqNuancierVa(f){const rail=BQN.rail,s=rail&&rail.querySelector('.pNs[data-pf="'+f+'"]'),nv=rail&&rail.querySelector('.pNav');if(!s)return;
  const y=s.offsetTop-(nv?nv.offsetHeight:0)-2;BQN.fam=f;BQN.fige=performance.now()+900;bqNuancierFamMarque(f); /* le temps du glissé, la touche touchée reste allumée (sinon, en bas de liste, la dernière famille la volait) */
  try{rail.scrollTo({top:Math.max(0,y),behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){rail.scrollTop=Math.max(0,y);}}
function bqNuancierFamMarque(f){const nv=BQN.rail&&BQN.rail.querySelector('.pNav');if(!nv)return;nv.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-pf')===f);});}
/* la famille qu'on regarde : la dernière dont l'intertitre est passé sous la barre (en bas de la liste : la dernière) */
function bqNuancierFamVue(){const rail=BQN.rail;if(!rail||!rail.querySelector('.pNu')||performance.now()<(BQN.fige||0))return;const nv=rail.querySelector('.pNav'),y=rail.scrollTop+(nv?nv.offsetHeight:0)+24,S=rail.querySelectorAll('.pNs');
  let f=S.length?S[0].getAttribute('data-pf'):'';S.forEach(function(s){if(s.offsetTop<=y)f=s.getAttribute('data-pf');});
  if(rail.scrollTop+rail.clientHeight>=rail.scrollHeight-4&&S.length)f=S[S.length-1].getAttribute('data-pf');
  if(f!==BQN.fam){BQN.fam=f;bqNuancierFamMarque(f);}}
/* LA LOUPE : au-dessus du doigt (en dessous s'il n'y a pas la place), dans l'écran ; null la ferme */
function bqNuancierLoupe(t){let L=BQN.loupe;if(!t){if(L)L.classList.remove('on');return;}
  if(!L){L=BQN.loupe=document.createElement('div');L.id='pNLoupe';L.setAttribute('aria-hidden','true');document.body.appendChild(L);}
  const d=bqCos(t.getAttribute('data-k')).d;if(!d)return;const r=cosmRar('peinture',d),ri=rarInfo(r),E=bqNuanceEtat(d);let c0=null;if(d.id==='usine')try{c0=CARS[garageI].color;}catch(e){}
  let bas='<span class="pLe e-'+E.c+'">'+(E.c==='eq'||E.c==='a'?pxi('coche'):'')+E.t+'</span>';
  if(E.c==='defi'){const f=d.def,v=peintDefVal(f);bas='<span class="pLd">'+pxi('cible')+' '+(f.k==='gagne'?moDans(sansAcc(TR(f.t)).toUpperCase(),f.v):sansAcc(TR(f.t)).toUpperCase())+'</span>'+(v<0?'':'<span class="pLj"><u><em style="width:'+Math.round(Math.max(0,E.p)*100)+'%"></em></u><b>'+peintDefNb(f,v)+'</b></span>')+(E.eur?'<span class="pLe e-eur">'+sansAcc(TR('OU'))+' '+E.eur+'</span>':'');}
  L.style.setProperty('--rc',ri.c);L.innerHTML=peintPastille(d,'pLsw',c0)+'<span class="pLt"><i>'+sansAcc(TR(ri.n1))+'</i><b>'+sansAcc(TR(d.n))+'</b>'+bas+'</span>';
  L.classList.add('on');const b=t.getBoundingClientRect(),w=L.offsetWidth,h=L.offsetHeight,W=VP.w||innerWidth;
  const x=Math.max(8,Math.min(W-8-w,b.left+b.width/2-w/2));let y=b.top-h-10;if(y<8)y=b.bottom+10;L.style.left=Math.round(x)+'px';L.style.top=Math.round(y)+'px';}
try{if(!I18N['OU'])I18N['OU']='OR';}catch(e){}
try{Object.assign(I18N,{'À GAGNER EN JEU':'WIN IT IN-GAME'});}catch(e){} /* (2026-11-07, passe finale) la légende de l'anneau cyan des défis */
