/* ===== BOUTIQUE : LE RAYON AILES, LA MOLETTE (2026-11-07, Sacha : « dans la boutique les boîtes de Léo sont bien pour les voitures et achats, mais pas adaptées pour les peintures, traînées, figures… retravaille au max l'ergonomie, adaptée au mobile et à chaque catégorie d'item » · « chaque type d'item doit avoir un système propre ») ===== */
/* Une aile ne se juge pas dans une boîte : elle se juge SUR la caisse. Le rayon AILES quitte la grille de cartes (trois par rangée, 330 px de
   haut debout : la caisse, coincée dessus, se voyait de profil, l'aile de chant) pour UNE MOLETTE :
   · une seule rangée de vignettes (la photo de l'aile vue de dessus, son nom, son prix ou son état) qui défile au doigt et s'AIMANTE au
     milieu ; celle du milieu est ESSAYÉE sur la caisse dès que la molette se pose — on compare d'un geste, sans viser ;
   · ◀ ▶ aux deux bouts (le pouce, 44 px et plus) : l'aile d'à côté ; les flèches du clavier aussi (ordinateur) ; la molette de la souris ;
   · au-dessus, la RÉGLETTE : un trait par aile, à la couleur de sa rareté (plein = à toi), qu'on balaie du doigt pour filer d'un bout à
     l'autre ; à gauche la famille de l'aile du milieu (son logo, son nom, « à toi / total »), à droite sa place (05 / 16) ;
   · dans la molette, une TRANCHE noire ouvre chaque famille (COMMUNES, RARES…) : les raretés restent rangées, sans intertitre pleine largeur ;
   · debout, le rayon tient en ~150 px (contre 330) : la place rendue va à la caisse (GBQ.zone suit le panneau) ; couché, une colonne
     étroite à droite qui défile de haut en bas, la caisse a toute la gauche ;
   · la caméra : trois-quarts ARRIÈRE et un peu plus haut (BQA_POV, BQA_ANG), là où une aile se lit — fondu en une demi-seconde, rendu en
     quittant le rayon.
   Le reste ne change pas : toucher = bqEssaie (le bras pose la pièce), le bouton #gBqBtn achète / équipe (bqAction), les photos viennent
   d'aileFile (bqPhotos). La grille partagée (.bqRail) est vidée tant que le rayon AILES est ouvert : ses cartes cachées ne tiennent pas la
   file du studio photo. Crochet : garBqPanneau appelle bqAileMaj(pan, voulu) à chaque image. Banc : window.dbgBqAile(). */
const BQA={el:null,k:'',essK:'',on:false,pose:0,doigt:0,scT:0,e:0,povS:null,angS:null,vu:'',lay:''};
const BQA_ANG=2.45; /* le cap de la caisse dans le rayon AILES (GAR_TAB_ANG : 1.2 de profil, 3.5 trois-quarts arrière des traînées) */
const BQA_POV={debout:{h:1.1,d:.97,ty:.05},couche:{h:.85,d:.98,ty:.05}}; /* la caméra monte (m) : on voit l'aile par-dessus, déployée */
Object.assign(I18N,{"AILE PRÉCÉDENTE":"PREVIOUS WING","AILE SUIVANTE":"NEXT WING","CHOISIR UNE AILE":"PICK A WING"});
/* ===== LE MÊME PRINCIPE D'ENTRÉE DANS CHAQUE RAYON (2026-11-07, Sacha : « une boutique pro, game designer senior, chaque type d'item a son propre système ») =====
   En ouvrant PEINTURES, AILES ou TRAÎNÉES, on REGARDE déjà un objet du rayon : celui qu'on porte (AILES : celui où la molette s'était
   arrêtée). Avant, tant qu'on n'avait rien touché, le nom flottant et le bouton parlaient encore de la CAISSE (« LA HONTE · ÉQUIPÉE »).
   Silencieux : shopTab / shopShow posent l'objet sur la caisse sans bras d'atelier, sans son, sans toucher à l'argent. */
function bqRayonRegarde(cat,k){if(GBQ.cat!==cat||!garageOn||GAR.go)return;
  try{if(SHOP.tab!==cat)shopTab(cat);if(k){const j=COSM[cat].findIndex(function(d){return cat+':'+d.id===k;});if(j>=0&&SHOP.i[cat]!==j)shopShow(cat,j);}GBQ.ck='';}catch(e){}}
function bqAileListe(){const L=COSM.aile.slice(),ri=function(d){return Math.max(0,RARETES.findIndex(function(x){return x.id===cosmRar('aile',d);}));},px=function(d){return d.p||d.pk||0;};
  return L.map(function(d,n){return [d,n];}).sort(function(a,b){return (a[0].p===0?-1:0)-(b[0].p===0?-1:0)||ri(a[0])-ri(b[0])||px(a[0])-px(b[0])||a[1]-b[1];}).map(function(e){return e[0];});}
/* l'état d'une aile, en un mot : ÉQUIPÉE · À TOI · le prix (trop cher : grisé) · MISSION */
function bqAileEtat(d){const a=shopOwned('aile',d.id);if(a&&shopEqD('aile')===d)return {t:sansAcc(TR('ÉQUIPÉE')),c:'eq'};if(a)return {t:sansAcc(TR('À TOI')),c:'acq'};
  if(d.eur)return {t:eurTxt(d.eur),c:'eur'};if(d.p)return {t:bqPxT(d.p),c:bank()<d.p?'pc cher':'pc'};return {t:sansAcc(TR('MISSION')),c:'defi'};}
function bqAileHtml(L){const fam=function(d){return cosmRar('aile',d);},nb={},ok={};L.forEach(function(d){const f=fam(d);nb[f]=(nb[f]|0)+1;if(shopOwned('aile',d.id))ok[f]=(ok[f]|0)+1;});
  let h='';L.forEach(function(d,n){const f=fam(d),ri=rarInfo(f),s=bqAileEtat(d);
    if(!n||fam(L[n-1])!==f)h+='<div class="baTr" style="--rc:'+ri.c+'" aria-hidden="true"><span class="bqRl">'+pxi(RAR_LOGO[f]||'etoile')+'</span><b>'+sansAcc(TR(ri.n))+'</b><em><i>'+(ok[f]|0)+'</i>/'+nb[f]+'</em></div>';
    h+='<button type="button" class="baK'+(shopOwned('aile',d.id)?' a':'')+(s.c==='eq'?' eq':'')+'" data-k="aile:'+d.id+'" data-n="'+n+'" data-rar="'+f+'" style="--rc:'+ri.c+'" aria-label="'+sansAcc(TR(d.n)).replace(/"/g,'')+' · '+String(s.t).replace(/<[^>]*>/g,'').replace(/"/g,'')+'">'
      +'<span class="baPh" data-pha="'+d.id+'"></span>'
      +'<span class="baTx"><span class="baN">'+sansAcc(TR(d.n))+'</span><span class="baP '+s.c+'">'+(s.c==='eq'||s.c==='acq'?pxi('coche'):s.c==='defi'?pxi('verrou'):'')+'<span>'+String(s.t).replace(/</g,'')+'</span></span></span></button>';});
  return h;}
function bqAileReglette(L){return L.map(function(d,n){const f=cosmRar('aile',d);return '<i data-n="'+n+'" class="'+(shopOwned('aile',d.id)?'a':'')+'" style="--rc:'+rarInfo(f).c+'"></i>';}).join('');}
function bqAileOk(){return garageOn&&!GAR.go&&!ecranWipe._on&&GBQ.on&&GBQ.panOn;}
function bqAileCouche(){return !!BQA.el&&BQA.el.parentNode&&BQA.el.parentNode.classList.contains('cote');}
/* la vignette au MILIEU de la molette (le repère : le milieu de la piste, en x debout, en y couché) */
function bqAileMilieu(){const r=BQA.el&&BQA.el.querySelector('.baRail');if(!r)return null;const K=r.querySelectorAll('.baK');if(!K.length)return null;
  const R=r.getBoundingClientRect(),v=bqAileCouche(),m=v?R.top+R.height/2:R.left+R.width/2;let best=null,bd=1e9;
  K.forEach(function(k){const b=k.getBoundingClientRect(),c=v?b.top+b.height/2:b.left+b.width/2,d=Math.abs(c-m);if(d<bd){bd=d;best=k;}});return best;}
/* amener une vignette au milieu (doux : en glissant) ; essai : la poser sur la caisse tout de suite */
function bqAileVa(k,essai,doux){if(!k)return;const r=k.parentNode,v=bqAileCouche();
  const t=v?k.offsetTop+k.offsetHeight/2-r.clientHeight/2:k.offsetLeft+k.offsetWidth/2-r.clientWidth/2;
  if(essai)bqAileEssaie(k);
  try{r.scrollTo(v?{top:t,behavior:doux?'smooth':'auto'}:{left:t,behavior:doux?'smooth':'auto'});}catch(e){if(v)r.scrollTop=t;else r.scrollLeft=t;}}
function bqAileEssaie(k){const key=k.getAttribute('data-k');if(!key||!bqAileOk())return;BQA.essK=key;
  uiPop(k);GSON9=false;const pan=document.getElementById('gBqPan');if(pan)pan.classList.remove('menu');GBQ.figDir=null;
  bqEssaie(key);if(GSON9)hap(8);else{uiClic('nav');hap(5);}}
/* ◀ ▶ (et le clavier) : l'aile d'à côté */
function bqAilePas(s){if(!bqAileOk()||!BQA.el)return;const K=[].slice.call(BQA.el.querySelectorAll('.baK'));if(!K.length)return;
  const c=BQA.el.querySelector('.baK.sel')||bqAileMilieu(),i=Math.max(0,K.indexOf(c)),j=Math.max(0,Math.min(K.length-1,i+s));
  if(j===i){const b=BQA.el.querySelector(s<0?'.baFl.g':'.baFl.d');if(b)gSecoue(b);return;}bqAileVa(K[j],true,true);}
/* la réglette : le doigt qui la balaie amène l'aile sous lui (la molette se pose, l'essai part au repos) */
function bqAileRegletteDoigt(e){const g=BQA.el.querySelector('.baRg'),R=g.getBoundingClientRect(),K=BQA.el.querySelectorAll('.baK');if(!K.length)return;
  const n=Math.max(0,Math.min(K.length-1,Math.floor((e.clientX-R.left)/Math.max(1,R.width)*K.length)));if(BQA.rgN===n)return;BQA.rgN=n;BQA.doigt=performance.now();bqAileVa(K[n],false,false);hap(3);}
function bqAileEl(pan){if(BQA.el&&BQA.el.isConnected)return BQA.el;
  const el=document.createElement('div');el.id='bqAile';el.setAttribute('role','group');
  el.innerHTML='<div class="baTete"><span class="baFam"></span><span class="baPos"></span></div><div class="baRg" role="slider" tabindex="-1"></div>'
    +'<div class="baPiste"><button type="button" class="baFl g">'+pxi('gauche')+pxi('haut')+'</button><div class="baRail"></div><button type="button" class="baFl d">'+pxi('droite')+pxi('bas')+'</button></div><div class="baDesc" aria-live="polite"></div>';
  pan.appendChild(el);BQA.el=el;const rail=el.querySelector('.baRail');
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.baFl,.baK');if(!b)return;e.stopPropagation();if(!bqAileOk())return;
    if(b.classList.contains('baFl')){uiPop(b);bqAilePas(b.classList.contains('g')?-1:1);return;}
    if(b.classList.contains('sel')&&BQA.essK===b.getAttribute('data-k')){uiPop(b);bqAileVa(b,false,true);return;} /* déjà sur la caisse : on la recentre, sans rejouer le bras */
    bqAileVa(b,true,true);});
  ['pointerdown','touchstart'].forEach(function(t){rail.addEventListener(t,function(){BQA.doigt=performance.now();},{passive:true});});
  rail.addEventListener('scroll',function(){PHQ.defile=performance.now();BQA.scT=performance.now();clearTimeout(BQA.pose);BQA.pose=setTimeout(bqAilePose,170);},{passive:true});
  rail.addEventListener('wheel',function(e){if(bqAileCouche()||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;e.preventDefault();BQA.doigt=performance.now();rail.scrollBy({left:e.deltaY});},{passive:false}); /* la molette de la souris fait défiler debout aussi */
  const rg=el.querySelector('.baRg');
  rg.addEventListener('pointerdown',function(e){e.stopPropagation();if(!bqAileOk())return;BQA.rgId=e.pointerId;BQA.rgN=-1;try{rg.setPointerCapture(e.pointerId);}catch(_){}rg.classList.add('tient');bqAileRegletteDoigt(e);});
  rg.addEventListener('pointermove',function(e){if(e.pointerId!==BQA.rgId)return;e.stopPropagation();bqAileRegletteDoigt(e);});
  const fin=function(e){if(e.pointerId!==BQA.rgId)return;BQA.rgId=null;rg.classList.remove('tient');clearTimeout(BQA.pose);BQA.pose=setTimeout(bqAilePose,120);};
  rg.addEventListener('pointerup',fin);rg.addEventListener('pointercancel',fin);rg.addEventListener('lostpointercapture',fin);
  rg.addEventListener('click',function(e){e.stopPropagation();});
  return el;}
/* la molette s'est posée : si c'est le doigt qui l'a fait tourner, l'aile du milieu part sur la caisse */
function bqAilePose(){if(!BQA.el||!bqAileOk()||BQA.rgId!=null)return;const k=bqAileMilieu();if(!k)return;bqAileMarque(k);
  if(performance.now()-BQA.doigt<4000&&k.getAttribute('data-k')!==BQA.essK)bqAileEssaie(k);}
/* l'en-tête suit l'aile du milieu (pendant le défilement aussi) : sa famille, sa place ; le trait de la réglette */
function bqAileMarque(k){if(!k||!BQA.el)return;BQA.dernier=k.getAttribute('data-k');const n=+k.getAttribute('data-n'),f=k.getAttribute('data-rar'),N=BQA.el.querySelectorAll('.baK').length,ri=rarInfo(f),key=n+'|'+f+'|'+N+'|'+LANG;
  if(BQA.vu===key)return;BQA.vu=key;{const d9=(BQA.L||[])[n],de=BQA.el.querySelector('.baDesc');if(de)de.textContent=d9&&d9.d?TR(d9.d):'';} /* sa phrase : c'est elle qui vend l'aile */BQA.el.querySelector('.baFl.g').classList.toggle('off',n===0);BQA.el.querySelector('.baFl.d').classList.toggle('off',n===N-1);
  const fa=BQA.el.querySelector('.baFam'),L=BQA.L||[],tot=L.filter(function(d){return cosmRar('aile',d)===f;}),a=tot.filter(function(d){return shopOwned('aile',d.id);}).length;
  fa.style.setProperty('--rc',ri.c);fa.innerHTML='<span class="bqRl">'+pxi(RAR_LOGO[f]||'etoile')+'</span><b>'+sansAcc(TR(ri.n))+'</b><em><i>'+a+'</i>/'+tot.length+'</em>';
  const d2=function(x){return (x<10?'0':'')+x;};BQA.el.querySelector('.baPos').innerHTML='<b>'+d2(n+1)+'</b> / '+d2(N);
  BQA.el.querySelectorAll('.baRg i').forEach(function(t,j){t.classList.toggle('on',j===n);});
  BQA.el.querySelectorAll('.baK').forEach(function(x){x.classList.toggle('mil',x===k);});
  const rg=BQA.el.querySelector('.baRg');rg.setAttribute('aria-valuenow',n+1);rg.setAttribute('aria-valuemax',N);rg.setAttribute('aria-valuemin',1);}
/* LA CAMÉRA DU RAYON : BQ_POV (le cadrage de la boutique) reçoit, en fondu, celui des ailes ; rendu tel qu'il était en sortant */
function bqAilePov(on,dt){const e0=BQA.e;BQA.e=Math.max(0,Math.min(1,BQA.e+(on?1:-1)*dt/.5));if(e0===BQA.e&&!on&&BQA.e===0)return;
  if(BQ_CADRAGE)return; /* ?cadrage=1 : le panneau de Léo garde la main */
  const e=BQA.e*BQA.e*(3-2*BQA.e);
  ['debout','couche'].forEach(function(s){const P=BQA_POV[s],o=BQ_POV[s];
    if(!o||!o.bqA){BQA.povS=BQA.povS||{};BQA.povS[s]=o;}
    const b=BQA.povS&&BQA.povS[s]||BQ_POV_DEF;
    if(BQA.e===0){BQ_POV[s]=BQA.povS?BQA.povS[s]:null;return;}
    BQ_POV[s]={bqA:1,a:b.a||0,h:(b.h||0)+(P.h||0)*e,d:(b.d==null?1:b.d)*(1+((P.d==null?1:P.d)-1)*e),ty:(b.ty||0)+(P.ty||0)*e,f:b.f||0,sx:b.sx||0,sy:b.sy||0};});
  if(BQA.e===0)BQA.povS=null;}
/* le cap : tant que le rayon AILES est ouvert, la caisse se tourne trois-quarts arrière (shopShow et bqTourne lisent GAR_TAB_ANG) */
function bqAileCap(on){if(on){if(BQA.angS==null){BQA.angS=GAR_TAB_ANG.aile;GAR_TAB_ANG.aile=BQA_ANG;try{bqTourne('aile');}catch(e){}}}
  else if(BQA.angS!=null){GAR_TAB_ANG.aile=BQA.angS;BQA.angS=null;}}
/* LE CROCHET, à chaque image de la boutique (voulu : le panneau est ouvert) */
function bqAileMaj(pan,voulu){const cat=BQ_CATS.some(function(c){return c[0]===GBQ.cat;})?GBQ.cat:'voiture',on=!!voulu&&cat==='aile';
  const dt=Math.min(.1,Math.max(0,(performance.now()-(BQA.t||0))/1000));BQA.t=performance.now();
  bqAilePov(on,dt);bqAileCap(on);
  if(pan.getAttribute('data-cat')!==cat)pan.setAttribute('data-cat',cat);
  pan.classList.toggle('bqAileOn',on);
  if(!on){if(BQA.on){BQA.on=false;BQA.k='';BQA.essK='';BQA.vu='';}return;}
  const rail=pan.querySelector('.bqRail');if(rail&&rail.firstChild)rail.textContent=''; /* la grille partagée se tait : la molette la remplace */
  const el=bqAileEl(pan),L=bqAileListe(),eqd=shopEqD('aile'),k=L.map(function(d){return d.id+(shopOwned('aile',d.id)?1:0)+(eqd===d?'e':'')+(d.p&&bank()<d.p?'c':'');}).join(',')+':'+LANG;
  const neuf=!BQA.on;BQA.on=true;
  if(BQA.k!==k){const r=el.querySelector('.baRail'),sc=neuf?null:(bqAileCouche()?r.scrollTop:r.scrollLeft);BQA.k=k;BQA.L=L;BQA.vu='';
    r.innerHTML=bqAileHtml(L);el.querySelector('.baRg').innerHTML=bqAileReglette(L);
    el.querySelector('.baFl.g').setAttribute('aria-label',sansAcc(TR('AILE PRÉCÉDENTE')));el.querySelector('.baFl.d').setAttribute('aria-label',sansAcc(TR('AILE SUIVANTE')));
    el.setAttribute('aria-label',sansAcc(TR('CHOISIR UNE AILE')));el.querySelector('.baRg').setAttribute('aria-label',sansAcc(TR('AILES')));
    bqPhotos(el);
    if(sc!=null){if(bqAileCouche())r.scrollTop=sc;else r.scrollLeft=sc;}}
  /* à l'ouverture : la molette se pose sur l'aile qu'on regarde (celle de l'essai, sinon celle qu'on porte), essayée pour que le bouton parle d'elle */
  const cur=bqCourant(),lay=VP.w+'x'+VP.h+':'+(pan.classList.contains('cote')?1:0);
  if(neuf||BQA.lay!==lay){BQA.lay=lay;const vis=String(cur).indexOf('aile:')===0?cur:(BQA.dernier&&el.querySelector('.baK[data-k="'+BQA.dernier+'"]')?BQA.dernier:'aile:'+eqd.id),kk=el.querySelector('.baK[data-k="'+vis+'"]');
    /* (2026-11-07, passe finale) en revenant dans le rayon, la molette reprend où on l'avait laissée (BQA.dernier) ; l'aile s'y pose EN SILENCE
       (bqRayonRegarde : ni bras ni son — avant, chaque entrée rejouait le bras d'atelier et le clic) */
    if(kk){if(vis!==cur)bqRayonRegarde('aile',vis);BQA.essK=vis;requestAnimationFrame(function(){bqAileVa(kk,false,false);bqAileMarque(kk);});}}
  if(BQA.cur!==cur){BQA.cur=cur;el.querySelectorAll('.baK').forEach(function(x){x.classList.toggle('sel',x.getAttribute('data-k')===cur);});}
  if(performance.now()-BQA.scT<400){const m=bqAileMilieu();if(m)bqAileMarque(m);}
  else if(!BQA.vu){const m=bqAileMilieu();if(m)bqAileMarque(m);}
  if(!PHQ.q.length&&el.querySelector('[data-pha]:not(.ok)'))bqPhotos(el);}
addEventListener('keydown',function(e){if(!BQA.on||!bqAileOk()||e.altKey||e.ctrlKey||e.metaKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const v=bqAileCouche(),s=e.code==='ArrowLeft'||(v&&e.code==='ArrowUp')?-1:e.code==='ArrowRight'||(v&&e.code==='ArrowDown')?1:0;if(!s)return;e.preventDefault();bqAilePas(s);});
window.dbgBqAile=function(o){if(o&&o.pov)Object.assign(BQA_POV,o.pov);const el=BQA.el,r=function(x){if(!x)return null;const b=x.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
  return {on:BQA.on,e:+BQA.e.toFixed(2),ess:BQA.essK,cur:bqCourant(),mil:(bqAileMilieu()||{getAttribute:function(){return null;}}).getAttribute('data-k'),pan:r(document.getElementById('gBqPan')),el:r(el),
    rail:r(el&&el.querySelector('.baRail')),k:el?[].slice.call(el.querySelectorAll('.baK')).slice(0,3).map(r):null,fl:el?[].slice.call(el.querySelectorAll('.baFl')).map(r):null,rg:r(el&&el.querySelector('.baRg')),
    photos:el?el.querySelectorAll('.baPh.ok').length:0,zone:GBQ.zone,pov:BQ_POV,ang:GAR_TAB_ANG.aile};};
