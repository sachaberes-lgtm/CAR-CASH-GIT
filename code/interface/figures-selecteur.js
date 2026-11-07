/* ===== LE SÉLECTEUR DE FIGURES : UN SEUL POUR LA BOUTIQUE ET L'INVENTAIRE (2026-11-05, Sacha : « dans la boutique et l'inventaire retravaille le système de sélection des figures de manière pro poussé et ingénieuse » · « manque d'ergonomie global à revoir ») =====
   Avant : deux sélecteurs (#gFigSel, #bqFigSel) à deux comportements, des cases de 8 px, un mode caché (armer une case avant de toucher une figure),
   des cartes en double pour les figures à deux sens, aucun moyen de se rattraper. Désormais UNE logique, ici, que les deux écrans appellent :
   · TOUCHER UNE FIGURE L'ÉQUIPE, tout de suite, dans le bon emplacement (`fsAuto`) : celui qu'on vise (le filtre de direction), sinon celui qu'elle
     occupe déjà, sinon un emplacement vide qui l'accepte, sinon elle prend la place de la moins bien classée (rareté, puis prix) parmi ceux où elle va ;
   · UNE FIGURE À DEUX SENS (rodéo, tire-bouchon, cosmique) montre ses deux gestes en petites pastilles de couleur : toucher la pastille l'équipe
     DANS CE sens (`FSEL.pick`) — une seule carte par figure, plus de doublon ni de badge « aussi » ;
   · ANNULER : équiper affiche une puce « ANNULER » pendant 5 s (`fsMontre`), qui remet les trois emplacements comme avant (`fsAnnule`) ;
   · LES TROIS CASES (le « dock ») sont aussi le filtre de geste : en toucher une ne montre que les figures de ce geste, et toucher une figure
     l'y équipe ; le mode s'écrit sur la pastille de tête (« ↑ AVANT ✕ ») — la retoucher, ou toucher ✕, revient à TOUT ;
   · LES PASTILLES : TOUT · À MOI · À ACHETER (boutique) et le TRI (ordre du catalogue → rareté → prix) ;
   · PARTOUT : l'inventaire du garage (#gFigSel + #gStrip), le coffre (#gInv, ivDock) et la boutique (#bqFigSel) ;
   Rien ne change dans la logique d'équipement (figEquipe, figSlots, figPeut, SAVE.d.figEq3) : aucune sauvegarde n'est touchée.
   Banc : `dbgFsel()` rend l'état, `dbgFsel('dir',k)` / `('tri')` / `('part','moi')` les posent. */
var FSEL={dir:-1,part:'tout',tri:'cat',pick:{},undo:null,tm:0}; /* dir : l'emplacement visé (−1 = tous) · part : tout | moi | acheter · tri : cat | rar | prix · pick : id → le sens choisi d'une figure à deux sens */
const FS_TRI=['cat','rar','prix'],FS_TRI_N={cat:'ORDRE',rar:'RARETÉ',prix:'PRIX'},FS_COURT=['AVANT','ARRIÈRE','CÔTÉS'];
try{Object.assign(I18N,{'TOUT':'ALL','À MOI':'MINE','À ACHETER':'TO BUY','TRI':'SORT','ORDRE':'ORDER','RARETÉ':'RARITY','PRIX':'PRICE','AVANT':'FRONT','ARRIÈRE':'BACK','CÔTÉS':'SIDES',
  "TOUCHE UNE FIGURE POUR L'ÉQUIPER ICI":'TAP A TRICK TO EQUIP IT HERE','ELLE SE RANGE TOUTE SEULE · OU TOUCHE UN EMPLACEMENT':'IT SLOTS IN BY ITSELF · OR TAP A SLOT','REMPLACE':'REPLACES','AUCUNE FIGURE POUR CE GESTE':'NO TRICK FOR THIS MOVE','RIEN À AFFICHER':'NOTHING TO SHOW','REMIS COMME AVANT':'BACK AS BEFORE'});}catch(e){}
function fsRang(id){const f=window.FIG&&id&&FIG.par[id];return f?(INV_RANG[cosmRar('figure',f)]||0):-1;} // le rang de rareté d'une figure (−1 : aucune)
function fsPrix(id){const f=window.FIG&&id&&FIG.par[id];return f?(f.p||0):0;}
function fsRaz(){FSEL.dir=-1;FSEL.part='tout';} // à l'ouverture de l'inventaire ou du rayon : on repart de TOUT (le tri, lui, reste)
function fsCle(){return FSEL.dir+'|'+FSEL.part+'|'+FSEL.tri+'|'+Object.keys(FSEL.pick).map(function(k){return k+FSEL.pick[k];}).join(',')+'|'+figSlots().join(',');}
/* L'EMPLACEMENT d'une figure qu'on touche (voir plus haut) */
function fsAuto(id){const P=figPeut(id),S=figSlots();
  if(FSEL.dir>=0&&P.indexOf(FSEL.dir)>=0)return FSEL.dir; // le geste visé
  const p=FSEL.pick[id];if(p!=null&&P.indexOf(p)>=0)return p; // le sens choisi sur sa pastille
  for(let j=0;j<P.length;j++)if(S[P[j]]===id)return P[j]; // elle y est déjà
  for(let j=0;j<P.length;j++)if(S[P[j]]==null)return P[j]; // un emplacement vide
  let b=P[0],bv=1e12;for(let j=0;j<P.length;j++){const v=fsRang(S[P[j]])*1e8+fsPrix(S[P[j]]);if(v<bv){bv=v;b=P[j];}} // la moins bien classée
  return b;}
function fsRem(id,k){const o=figSlots()[k];return o&&o!==id&&window.FIG&&FIG.par[o]?FIG.par[o].n:'';} // le nom de la figure qu'équiper `id` en k remplacerait
/* LE FILTRE ET LE TRI d'une liste d'id (ctx : 'bq' la boutique, 'inv' l'inventaire — qui ne montre que ce qu'on possède) */
function fsListe(ids,ctx){const L=ids.filter(function(id){const P=figPeut(id);if(FSEL.dir>=0&&P.indexOf(FSEL.dir)<0)return false;
    if(ctx==='bq'){const own=figPossede(id);if(FSEL.part==='moi'&&!own)return false;if(FSEL.part==='acheter'&&own)return false;}return true;});
  if(FSEL.tri==='rar')L.sort(function(a,b){return (fsRang(b)-fsRang(a))||(fsPrix(b)-fsPrix(a));});
  else if(FSEL.tri==='prix')L.sort(function(a,b){return fsPrix(a)-fsPrix(b);});
  return L;}
/* LA BARRE DE PASTILLES (la même dans les deux écrans ; `data-fs` dit laquelle) */
function fsBarreHtml(ctx){const bq=ctx==='bq';let nm=0,na=0;if(bq&&window.FIG)FIG.liste.forEach(function(f){if(figPossede(f.id))nm++;else na++;});
  const P=function(k,t,on,n){return '<button type="button" class="fsPas'+(on?' on':'')+'" data-fs="'+k+'" aria-pressed="'+(on?'true':'false')+'">'+sansAcc(TR(t))+(n!=null?'<em>'+n+'</em>':'')+'</button>';};
  return (FSEL.dir>=0?'<button type="button" class="fsPas on fsCib" data-fs="tout" style="--dc:'+FIG_DC[FSEL.dir]+'" aria-label="'+sansAcc(TR(FIG_FAM[FSEL.dir][0]))+'">'+pxi(FIG_FAM[FSEL.dir][2])+sansAcc(TR(FS_COURT[FSEL.dir]))+pxi('croix')+'</button>':P('tout','TOUT',FSEL.part==='tout'))+(bq?P('moi','À MOI',FSEL.part==='moi',nm)+P('acheter','À ACHETER',FSEL.part==='acheter',na):'')
    +'<button type="button" class="fsPas fsTri" data-fs="tri">'+sansAcc(TR('TRI'))+' '+sansAcc(TR(FS_TRI_N[FSEL.tri]))+'</button>';}
function fsAideHtml(){return '';} /* (plus de phrase : le geste visé s'écrit sur la pastille de tête « ↑ AVANT ✕ » — toucher une figure l'y équipe, la retoucher revient à TOUT) */
/* UNE CASE du dock (hexagone) : son balisage, et sa mise à jour — la même en boutique et à l'inventaire */
function fsHexHtml(s){return '<button type="button" class="fsHex" data-k="'+s+'" style="--dc:'+FIG_DC[s]+'"><span class="fsCase"><span class="fsIn"></span></span><i class="fsJoy">'+pxi(FIG_FAM[s][2])+'</i><b class="fsNom"></b></button>';}
function fsHexMaj(b,S,vide,vu,flash){const s=+b.getAttribute('data-k'),id=S[s],f=id&&FIG.par[id],c=f?rarInfo(cosmRar('figure',f)).c:vide,nm=f?sansAcc(TR(f.n)):sansAcc(TR('VIDE')),ik=(id||'')+c;
  b.style.setProperty('--fc',c);b.classList.toggle('vide',!f);b.classList.toggle('on',!!vu);b.classList.toggle('cible',FSEL.dir===s);b.setAttribute('aria-pressed',FSEL.dir===s?'true':'false');
  if(b._ik!==ik){b._ik=ik;b.querySelector('.fsIn').innerHTML=f?illuFig(id,c,s===0):'<b class="fsQ">?</b>';} // réécrit seulement si la figure change : sa rotation ne repart pas à chaque retouche
  b.querySelector('.fsNom').textContent=nm;
  b.setAttribute('aria-label',sansAcc(TR(FIG_FAM[s][0]))+' : '+nm);
  if(flash&&f){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}}
/* TOUCHER UNE CASE : viser ce geste (filtre + cible), le rejouer sur le plateau ; la retoucher revient à TOUT */
function fsCase(s,b){if(b)uiPop(b);hap(6);FSEL.dir=FSEL.dir===s?-1:s;const id=figSlots()[s],bq=!!(GBQ.on&&GBQ.cat==='figure'&&!(INV&&INV.on));
  if(FSEL.dir===s&&id){uiClic('onglet');if(!bq)try{garFigEssai(id,s);}catch(e){}}else uiClic('nav');
  fsRafraichis(false);
  if(FSEL.dir===s&&id){if(bq){GBQ.figDir=s;bqEssaie('figure:'+id);} /* en boutique, la figure de la case est essayée (bqEssaie la joue et pose la carte regardée) */
    else if(!(INV&&INV.on)&&SHOP.tab==='figure'){const j=COSM.figure.findIndex(function(d){return d.id===id;});if(j>=0)shopShow('figure',j);}}} /* à l'atelier, sa fiche */
/* TOUT REDESSINER après un changement (garde : l'inventaire garde son défilement — un filtre, lui, repart en haut) */
function fsRafraichis(garde){GBQ.rk='';GBQ.figDir=null;GBQ.vu=-1;try{BQFS.k='';}catch(e){}
  try{if(INV&&INV.on){const g=$('ivGrille');if(g){g._k=null;if(!garde)g.scrollTop=0;}invRender();}}catch(e){console.warn('fsRafraichis',e);}
  try{if(garageOn&&SHOP.tab==='figure'&&!(INV&&INV.on)){GFS.k='';const st=$('gStrip');if(st)st._r=null;gStripHabits('figure',SHOP.i.figure);gFigSelMaj();}}catch(e){console.warn('fsRafraichis atelier',e);}} /* l'atelier : sa bande et ses cases */
/* ANNULER : la puce, le temps qu'elle vit, et le retour en arrière */
function fsPuce(){let el=document.getElementById('fsUndo');if(el)return el;el=document.createElement('button');el.id='fsUndo';el.type='button';el.setAttribute('role','status');
  el.addEventListener('click',function(e){e.stopPropagation();fsAnnule();});document.body.appendChild(el);return el;}
function fsMontre(id,r,avant){const f=window.FIG&&FIG.par[id];if(!f||!r)return;FSEL.undo={prev:avant,id:id};clearTimeout(FSEL.tm);
  const F=FIG_FAM[r.slot],el=fsPuce(),rem=r.parti&&r.parti!==id&&FIG.par[r.parti]?' · '+sansAcc(TR('REMPLACE'))+' '+sansAcc(TR(FIG.par[r.parti].n)):'';
  el.innerHTML='<span class="fuTx">'+pxi(F[2])+' <b>'+sansAcc(TR(f.n))+'</b> · '+sansAcc(TR(FS_COURT[r.slot]))+rem+'</span><span class="fuBt">'+pxi('gauche')+' '+sansAcc(TR('ANNULER'))+'</span>';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');FSEL.tm=setTimeout(fsCache,5000);}
function fsCache(){const el=document.getElementById('fsUndo');if(el)el.classList.remove('on');FSEL.undo=null;}
function fsAnnule(){const U=FSEL.undo;if(!U)return;fsCache();
  SAVE.d.figEq3=U.prev.map(function(x){return x||'';});SAVE.d.figEq=figEquipees().slice(0,2);SAVE.flush();FX2.cle='';delete FSEL.pick[U.id];
  try{if(SONV2)sfx('ui.off');}catch(e){}hap(6);fsRafraichis(true);
  try{toast(pxi('coche')+' '+sansAcc(TR('REMIS COMME AVANT')));}catch(e){}}
/* L'INVENTAIRE : le dock (les trois cases, le mode, les pastilles) au-dessus de la grille, onglet FIGURES seulement */
function ivDockEl(){let el=document.getElementById('ivDock');if(el)return el;const g=document.getElementById('ivGrille');if(!g||!g.parentNode)return null;
  el=document.createElement('div');el.id='ivDock';el.setAttribute('role','group');
  el.innerHTML='<div class="fdRow">'+[0,1,2].map(fsHexHtml).join('')+'</div><div class="fdAide"></div><div class="fdBar"></div>';
  g.parentNode.insertBefore(el,g);
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fsHex'),c=e.target.closest&&e.target.closest('[data-fs]');
    if(!b&&!c)return;e.stopPropagation();if(!INV.on||GAR.go)return;
    if(b)fsCase(+b.getAttribute('data-k'),b);else{const k=c.getAttribute('data-fs');uiPop(c);uiClic('onglet');hap(6);fsBarreClic(k);}});
  return el;}
function ivDockMaj(){const gi=document.getElementById('gInv'),vis=INV.cat==='figure'&&!!window.FIG;if(gi)gi.classList.toggle('fsOn',vis);if(!vis)return;
  const el=ivDockEl();if(!el)return;const S=figSlots(),P=el._S;el._S=S.slice();
  el.querySelectorAll('.fsHex').forEach(function(b){const s=+b.getAttribute('data-k');fsHexMaj(b,S,'#6c6390',false,!!P&&P[s]!==S[s]);});
  const ai=el.querySelector('.fdAide'),h=fsAideHtml();if(ai._h!==h){ai._h=h;ai.innerHTML=h;}
  const ba=el.querySelector('.fdBar'),bh=fsBarreHtml('inv');if(ba._h!==bh){ba._h=bh;ba.innerHTML=bh;}}
function fsBarreClic(k){
  if(k==='tout'){FSEL.dir=-1;FSEL.part='tout';}
  else if(k==='moi'||k==='acheter')FSEL.part=FSEL.part===k?'tout':k;
  else if(k==='tri')FSEL.tri=FS_TRI[(FS_TRI.indexOf(FSEL.tri)+1)%FS_TRI.length];
  fsRafraichis(false);}
/* L'INVENTAIRE : la liste filtrée, et la pastille d'un geste (équiper CETTE figure DANS CE sens) */
function ivDirs(id){const S=figSlots();return '<span class="ivD">'+figPeut(id).map(function(x){return '<i data-d="'+x+'" class="'+(S[x]===id?'on':'')+'" style="--dc:'+FIG_DC[x]+'" aria-label="'+sansAcc(TR(FIG_FAM[x][0]))+'">'+pxi(FIG_FAM[x][2])+'</i>';}).join('')+'</span>';} // les gestes de la figure en pastilles de la couleur de leur emplacement ; celui qu'elle occupe est plein
function ivFigListe(L){const ids=fsListe(L.map(function(o){return o.d.id;}),'inv');return ids.map(function(id){return L.find(function(o){return o.d.id===id;});});}
function ivFigGeste(i,s,el){const f=window.FIG&&FIG.liste[i];if(!f||!INV.on||GAR.go)return;uiPop(el);FSEL.pick[f.id]=s;if(FIGV2.on)figEqToast(f.id,s);try{garFigEssai(f.id,s);}catch(e){}hap(8);fsRafraichis(true);}
try{const g9=document.getElementById('ivGrille');if(g9)g9.addEventListener('click',function(e){const d=e.target.closest&&e.target.closest('.ivD [data-d]');if(!d)return;const t=d.closest('.ivT');if(!t)return;
  e.stopPropagation();ivFigGeste(+t.getAttribute('data-i'),+d.getAttribute('data-d'),d);},true);}catch(e){} // (capture : avant le toucher de la tuile, qui équiperait dans l'emplacement automatique)
window.dbgFsel=function(a,b){if(a==='dir'){FSEL.dir=+b;fsRafraichis(false);}else if(a==='part'){FSEL.part=b;fsRafraichis(false);}else if(a==='tri'){FSEL.tri=b||'cat';fsRafraichis(false);}else if(a==='raz'){fsRaz();fsRafraichis(false);}
  return {dir:FSEL.dir,part:FSEL.part,tri:FSEL.tri,pick:FSEL.pick,slots:figSlots(),undo:!!FSEL.undo,auto:window.FIG?FIG.liste.map(function(f){return f.id+':'+fsAuto(f.id);}):[]};};
