/* ===== LA BOUTIQUE DU JOUR (2026-10-10, Léo : « fais un shop type Fortnite — comme ce n'est pas hebdomadaire, trouve un moyen ») =====
   Pas de serveur, pas d'équipe qui remplit la vitrine chaque semaine : la vitrine se TIRE d'elle-même chaque jour, dans le catalogue du jeu.
   · Le jour = le jour UTC (minuit UTC, comme Fortnite : 2 h du matin l'été à Paris) ; la graine = ce jour.
   · Tirée UNE fois, au 1er passage du jour, parmi ce qui n'est PAS encore à toi, puis GARDÉE (SAVE.d.bq) : ce que tu achètes reste en
     vitrine, marqué ACQUIS (un tirage refait à chaque achat remélangerait tout).
   · À LA UNE : deux caisses (rare et plus, de préférence), en grand ; DU JOUR : deux caisses et deux habillages.
   · Compte à rebours jusqu'au renouvellement ; à zéro, la nouvelle vitrine tombe toute seule.
   Dans la console (BOUTIQUE) : les onglets se taisent, la barre dit « BOUTIQUE DU JOUR » + l'horloge, la bande devient des CARTES à la
   couleur de leur rareté. Toucher une carte montre l'objet sur le plateau (rien ne change avant), et ÉQUIPER devient ACHETER + le prix.
   Triche possible en avançant l'horloge du téléphone : jeu hors ligne, on l'accepte. `dbgBoutiqueJour(j)` : la vitrine d'un autre jour. */
function bqJour(){return Math.floor(Date.now()/864e5)+(BQ_DECALE|0);}
var BQ_DECALE=0;
function bqCles(){const V=[],C=[];
  for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;const u=CAR_UNLOCK[i];if(u&&u.p>0)V.push('v:'+i);} // (2026-10-10) les caisses en € passent dans les OFFRES (bqOffres)
  for(const cat of ['peinture','aile','trainee'])for(const d of COSM[cat])if(d.p>0)C.push(cat+':'+d.id);
  return {V:V,C:C};}
function bqCos(k){const p=k.indexOf(':'),cat=k.slice(0,p);if(cat==='figure')return {cat:cat,d:window.FIG?FIG.par[k.slice(p+1)]:null};return {cat:cat,d:COSM[cat]&&COSM[cat].find(function(x){return x.id===k.slice(p+1);})};}
function bqA(k){if(k[0]==='v'){const i=+k.slice(2);return carUnlockedVrai(i)||i===(SAVE.d.equipped|0);}const o=bqCos(k);return !!o.d&&shopOwned(o.cat,o.d.id);}
function bqValide(k){if(typeof k!=='string')return false;if(k[0]==='v'){const i=+k.slice(2);return !!CARS[i]&&!carRetiree(i)&&!!CAR_UNLOCK[i]&&CAR_UNLOCK[i].p>0;}const o=bqCos(k);return !!o.d&&o.d.p>0;} /* (24/10, relecture) …et toujours EN VENTE (un prix en dollars, comme au tirage, bqCles) : une vitrine tirée avant une mise à jour qui a retiré le prix d'un objet (passé en euros, devenu récompense de mission) était gardée jusqu'à minuit UTC, sa carte disait « $ NaN » ou « $ 0 » — elle est retirée */
function bqRar(k){if(k[0]==='v')return carRar(+k.slice(2));const o=bqCos(k);return cosmRar(o.cat,o.d);}
function bqTire(j){const r=mulberry32(Math.imul(j,2654435761)^0x5B0071C),{V,C}=bqCles(),rg={commun:0,rare:1,exotique:1,defi:1,epique:2,legendaire:3,mythique:3,infini:3};
  const mel=function(L){L=L.slice();for(let i=L.length-1;i>0;i--){const k=Math.floor(r()*(i+1)),t=L[i];L[i]=L[k];L[k]=t;}return L;};
  const neuf=function(L){return mel(L.filter(function(k){return !bqA(k);})).concat(mel(L.filter(bqA)));}; // ce qui n'est pas à toi d'abord
  const Vn=neuf(V),une=Vn.filter(function(k){return !bqA(k)&&rg[bqRar(k)]>=1;}).slice(0,2);
  for(const k of Vn)if(une.length<2&&une.indexOf(k)<0)une.push(k);
  /* (même jour, Léo : « un peu plus de choix, qu'on puisse glisser vers le bas, mais pas tout non plus ») DU JOUR : trois caisses et trois
     habillages (six cartes au lieu de quatre) — la vitrine fait huit objets, jamais tout le catalogue. */
  const Cn=neuf(C).slice(0,BQ_N.hab),jour=Vn.filter(function(k){return une.indexOf(k)<0;}).slice(0,BQ_N.jour-Cn.length).concat(Cn);
  return une.concat(jour);}
var BQ_N={une:2,jour:6,hab:3};
function bqVitrine(){const j=bqJour();let b=SAVE.d.bq;
  if(!b||b.j!==j||!Array.isArray(b.l)||b.l.length!==BQ_N.une+BQ_N.jour||!b.l.every(bqValide)||b.l.some(function(k){return k[0]==='v'&&CAR_UNLOCK[+k.slice(2)]&&CAR_UNLOCK[+k.slice(2)].k==='premium';})){b={j:j,l:bqTire(j)};SAVE.d.bq=b;try{SAVE.mark();}catch(e){}}
  return b;}
function bqReste(){const ms=Math.max(0,(bqJour()+1-(BQ_DECALE|0))*864e5-Date.now()),t=Math.floor(ms/1000),d2=function(n){return (n<10?'0':'')+n;};
  return d2(Math.floor(t/3600))+':'+d2(Math.floor(t/60)%60)+':'+d2(t%60);}
function bqFig(cat,d){const hx=function(c){return '#'+(c>>>0).toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
  if(cat==='peinture')return '<i class="fnSw'+cosmSwCl(d)+'" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0xff7a3a))+'"></i>';
  if(cat==='trainee')return '<i class="fnRub" style="background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 35%,#fff 100%)')+'"></i>';
  return '<i class="pxi pxi-aile fnAile"></i>';}
function bqCarte(k,une,sansRuban){const ri=rarInfo(bqRar(k)),c=ri.c,a=bqA(k);let nom='',ty='',px='',eur=false,fig='';
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{};nom=TR(CARS[i].name);ty='CAISSE';if(u.k==='premium'){px=eurTxt(u.eur);eur=true;}else px=fmtC(u.p||0);fig='<i class="fnPh"></i>';}
  else{const o=bqCos(k);nom=TR(o.d.n);ty=SHOP_LBL[o.cat];px=fmtC(o.d.p);fig=bqFig(o.cat,o.d);}
  return '<div class="fnC'+(une?' une':'')+(a?' acquis':'')+'" data-fn="'+k+'" role="button" aria-label="'+String(nom).replace(/"/g,'')+'" style="--rc:'+c+';--rcL:'+invRgba(c,.98)+';--rcD:'+invRgba(c,.22)+'">'
    +'<i class="fnFond"></i>'+fig+(k[0]==='v'?rarLogo(+k.slice(2)):'')+(une&&!sansRuban?'<s class="fnBan">'+sansAcc(TR('À LA UNE'))+'</s>':'')
    +'<span class="fnTy">'+sansAcc(TR(ty))+(une?' · '+sansAcc(TR(ri.n1)):'')+'</span><b class="fnN">'+sansAcc(String(nom))+'</b>'
    +'<em class="fnP'+(eur?' eur':'')+'">'+(a?pxi('coche')+'<span>'+sansAcc(TR('ACQUIS'))+'</span>':px)+'</em></div>';}
/* LA BOUTIQUE DU GARAGE, SON PLAN (2026-10-10, Léo, après quatre passes — « quand on appuie sur SHOP : en haut LIMITED OFFERS, c'est top ;
   juste dessous, le même carré avec les voitures payantes, et ça doit mener à l'ÉCRAN ROSE — la page avec les trucs payants, éphémères et
   pour toujours ; ensuite la boutique éphémère, un peu aléatoire, j'aime bien ; et tout en bas SEE ALL ITEMS : quelque chose de similaire à
   l'inventaire, mais avec tout ce qui s'achète — pas les raretés, mais les classes : voitures, ailes, puis le reste ») :
   · la PORTE DES OFFRES (bqPorte) : OFFRES, « toutes les voitures payantes », le nombre, trois d'entre elles en éventail. Touchée, l'atelier se
     ferme sous le volet et s'ouvre la page OFFRES de l'accueil (#mShop, la vitrine rose de Sacha : l'offre de lancement + les légendaires) ;
     son RETOUR rouvre le garage, dans la boutique (`window.__offGar`, lu par le routeur de la coque).
   · SEE ALL ITEMS (le lien transparent du bas) : le mode `tous` de la console (gModeVa('tous')) — la page de l'INVENTAIRE, onglets compris
     (VOITURES · PEINTURE · AILES · TRAÎNÉES), mais avec TOUT ce qui s'achète dans l'onglet (à toi : coché ; sinon le prix, $ ou €) ; ◀ dans
     la barre, ou BOUTIQUE, ramène à la vitrine du jour. Les caisses en € ne sont pas tirées dans À LA UNE / DU JOUR. */
function bqEur(i){return parseFloat(String((CAR_UNLOCK[i]||{}).eur||'0').replace(',','.'))||0;}
function bqPayantes(){const L=[];for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(u&&u.k==='premium'&&!carRetiree(i))L.push(i);}
  return L.sort(function(a,b){return bqEur(a)-bqEur(b)||a-b;});}
/* LE BANDEAU DES OFFRES (2026-10-12, Léo : « fusionne LIMITED OFFERS rose avec la boîte orange OFFRES, qui disent la même chose, en un truc
   qui défile les offres ») : en tête de la vitrine du jour, UN bandeau — « OFFRES ÉPHÉMÈRES » et le compte à rebours en haut, puis les
   voitures payantes qui DÉFILENT une à une (photo, nom, prix ; toutes les 2,6 s, points dessous) ; touché, il ouvre les offres (l'écran rose).
   La barre rose du dessus se tait dans la vitrine du jour (#garage.shopJour). */
function bqPorte(L){const V=L.filter(function(i){return !carOwned(i);}).concat(L.filter(carOwned));
  return '<div class="fnPorte fnCarr" role="button" tabindex="0" aria-label="'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'"><i class="fnFond"></i>'
    +'<b class="fpHd">'+pxi('cadeau')+'<span>'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><s class="fpTim">'+pxi('horloge')+'<i>'+bqReste()+'</i></s></b>'
    +'<span class="fpSl">'+V.map(function(i,n){const u=CAR_UNLOCK[i]||{},a=carOwned(i);return '<span class="fpS1'+(n?'':' on')+'"><i class="fpSlPh" data-ph="'+i+'"></i>'
      +'<b class="fpNom">'+sansAcc(TR(CARS[i].name))+'</b><em class="fpPx">'+(a?pxi('coche')+' '+sansAcc(TR('À TOI')):eurTxt(u.eur))+'</em></span>';}).join('')+'</span>'
    +'<span class="fpDots">'+V.map(function(i,n){return '<u'+(n?'':' class="on"')+'></u>';}).join('')+'</span></div>';}
setInterval(function(){try{if(!garageOn)return;const c=document.querySelector('#gStrip .fnCarr');if(!c||!c.offsetParent)return;const S=c.querySelectorAll('.fpS1'),P=c.querySelectorAll('.fpDots u');if(S.length<2)return;
  let i=-1;S.forEach(function(e,j){if(e.classList.contains('on'))i=j;});const n=(i+1)%S.length;if(i>=0){S[i].classList.remove('on');S[i].classList.add('sort');setTimeout(function(){S[i].classList.remove('sort');},500);if(P[i])P[i].classList.remove('on');}
  S[n].classList.add('on');if(P[n])P[n].classList.add('on');}catch(e){}},2600); // (2026-10-12) le défilé des offres
function gOffresPage(){window.__offGar=true;ecranWipe(function(){window.__mRetour='shop';closeGarage();});} // la page OFFRES (rose) ; son RETOUR rouvre la boutique du garage
function bqCourant(){if(GBQ.figK&&GBQ.panOn&&(GBQ.cat==='figure'))return GBQ.figK;if(GBQ.sec!=null&&GBQ.panOn&&SHOP.tab==='voiture')return 'v:'+GBQ.sec; /* (missions v2) la secrète regardée */if(SHOP.tab==='voiture')return 'v:'+garageI;const L=COSM[SHOP.tab],d=L&&L[SHOP.i[SHOP.tab]];return d?SHOP.tab+':'+d.id:'';}
function gShopJour(){const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;try{gModeBoutons();}catch(e){}
  if(gEl)gEl.classList.toggle('shopJour',!GMODE.paye);
  if(GMODE.paye){gShopPaye(bar,st);return;}
  const B=bqVitrine(),kb='fn:'+B.j+':'+LANG;
  if(bar._k!==kb){bar._k=kb;bar._on=null;bar.classList.add('gModeBar');
    bar.innerHTML='<div class="gModeT fnTete" style="--rc:var(--neoM)">'+pxi('panier')+'<span>'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><s></s><b class="fnT">'+pxi('horloge')+'<i>'+bqReste()+'</i></b></div>';}
  const O=bqPayantes(),k='fn:'+B.j+':'+B.l.join(',')+':'+B.l.map(function(x){return bqA(x)?1:0;}).join('')+':'+O.length+':'+LANG;
  st.classList.add('fnBande');
  if(!st._finB){st._finB=1;st.addEventListener('scroll',function(){if(st.classList.contains('fnBande')||st.classList.contains('gModeTous'))st.classList.toggle('finBas',st.scrollTop+st.clientHeight>=st.scrollHeight-4);},{passive:true});} // au bout de la vitrine, plus de fondu
  if(st._r!==k){st._r=k;st._n=-1;st.scrollLeft=0;st.scrollTop=0;st.classList.remove('finBas');
    st.innerHTML=(O.length?bqPorte(O)+'<div class="fnSec"><span>'+sansAcc(TR('À LA UNE'))+'</span><s></s></div>':'')
      +B.l.map(function(x,n){return (n===BQ_N.une?'<div class="fnSec"><span>'+sansAcc(TR('DU JOUR'))+'</span><s></s></div>':'')+bqCarte(x,n<BQ_N.une);}).join('')
      +'<div class="fnTout" role="button" tabindex="0">SEE ALL ITEMS '+pxi('droite')+'</div>'; // (2026-10-10, Léo : « tout en bas de la boutique, pour voir toutes les voitures — écrit en transparent, pas un bouton », puis « en anglais, SEE ALL ITEMS ») → le mode `tous` : la page de l'inventaire, avec tout ce qui s'achète
    bqPhotos(st);}
  const cur=bqCourant();st.querySelectorAll('.fnC').forEach(function(el){el.classList.toggle('on',el.getAttribute('data-fn')===cur);});}
/* LES OFFRES PAYANTES (2026-10-11, Léo : « quand on rappuie sur BOUTIQUE, ça met les offres payantes, mises en page comme la page des
   voitures et items du jour — ça bascule entre les produits FEATURED et les OFFRES PAYANTES ») : BOUTIQUE retouchée (`GMODE.paye`, gModeVa)
   montre les caisses en €, en CARTES comme la vitrine du jour (les deux moins chères en grand, sans ruban, les autres trois par rangée) ;
   retouchée encore, la vitrine du jour revient. Une carte touchée pose la caisse sur le plateau ; ACHETER + son prix en € ouvre la fenêtre
   d'achat. Les autres touches (INVENTAIRE, SEE ALL ITEMS) ramènent toujours à la vitrine du jour au retour. */
function gShopPaye(bar,st){const L=bqPayantes(),kb='fp:'+L.length+':'+LANG;
  if(bar._k!==kb){bar._k=kb;bar._on=null;bar.classList.add('gModeBar');
    bar.innerHTML='<div class="gModeT fnTete" style="--rc:#ffd75e">'+pxi('cadeau')+'<span>'+sansAcc(TR('OFFRES PAYANTES'))+'</span><s></s><b class="fnCompte">'+L.length+' '+sansAcc(TR('VOITURES'))+'</b></div>';}
  const k='fp:'+L.map(function(i){return i+(carOwned(i)?'a':'');}).join(',')+':'+LANG;st.classList.add('fnBande');
  if(st._r!==k){st._r=k;st._n=-1;st.scrollLeft=0;st.scrollTop=0;st.classList.remove('finBas');
    st.innerHTML=L.map(function(i,n){return bqCarte('v:'+i,n<2,true);}).join('');bqPhotos(st);}
  const cur=bqCourant();st.querySelectorAll('.fnC').forEach(function(el){el.classList.toggle('on',el.getAttribute('data-fn')===cur);});}
/* bqPhotos : UNE seule déclaration, plus bas (après bqCarteHtml) — voir LES PHOTOS DES DEUX BOUTIQUES */
try{$('gStrip').addEventListener('click',function(e){const v=e.target.closest&&e.target.closest('.fnTout');if(v){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(v);uiClic('nav');gModeVa('tous');return;}
  const po=e.target.closest&&e.target.closest('.fnPorte');if(po){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(po);uiClic('nav');gOffresPage();return;} // (2026-10-10) la PORTE DES OFFRES : l'écran rose (page OFFRES)
  const t=e.target.closest&&e.target.closest('.fnC');if(!t)return;e.stopPropagation();
  if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(t);GSON9=false;const k=t.getAttribute('data-fn');
  if(k[0]==='v'){const i=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');const eq9=garEquipeCaisse(i);if(i!==garageI)garageSaute(i);else if(eq9)garageShow(i);}
  else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(SHOP.tab!==o.cat)shopTab(o.cat);if(j>=0){garEquipeHabit(o.cat,j);shopShow(o.cat,j);}try{if(SONV2&&!GSON9){sfx('ui.carte',{vol:-3});GSON9=true;}}catch(er){}} /* (2026-10-14, session SON) ui.carte −3 : feuilleter (−34, bus rec) sonnait plus fort que valider (ui.tap −35) — rangé avec ui.equipe (−37) */
  if(GSON9)hap(8);else uiClic('nav'); /* (2026-10-14, session SON) l'action (équiper, bascule, carte) a sonné : le tick se tait — sinon nav + équipe + carte sur UNE vignette */
  gShopJour();});}catch(e){}
setInterval(function(){try{if(!garageOn||gModeM()!=='shop')return;const B=SAVE.d.bq;if(!B||B.j!==bqJour()){const bar=$('gRar'),st=$('gStrip');if(bar)bar._k=null;if(st)st._r=null;gShopJour();return;}
  const v=bqReste();document.querySelectorAll('#gRar .fnT i:not(.pxi),#gStrip .fpTim i:not(.pxi)').forEach(function(t){if(t.textContent!==v)t.textContent=v;});}catch(e){}},1000);
try{Object.assign(I18N,{'BOUTIQUE DU JOUR':'DAILY SHOP','À LA UNE':'FEATURED','ACQUIS':'OWNED','DU JOUR':'DAILY','VOIR TOUTES LES VOITURES':'SEE ALL CARS','OFFRES':'OFFERS','TOUTES LES VOITURES PAYANTES':'ALL PAID CARS','VOITURES':'CARS','OFFRES ÉPHÉMÈRES':'LIMITED OFFERS','OFFRES PAYANTES':'PREMIUM OFFERS','À TOI':'YOURS'});}catch(e){} // (2026-10-10, Léo : « le truc du haut, c'est les OFFRES ÉPHÉMÈRES ») le titre de la vitrine du jour, avec son compte à rebours
try{$('gRar').addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fnRetour');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b);uiClic('retour');gModeVa('shop');});}catch(e){} // ◀ de SEE ALL ITEMS : la vitrine du jour
function gModeVa(m){
  try{uiGarde(300);}catch(e){} // (2026-10-12, passe qualité) BOUTIQUE ↔ ◀ RETOUR change les touches sous le doigt : un double-tap sur RETOUR tombait sur HOME (même coin) et sortait du garage
  if(gEl&&gEl.classList.contains('consoleCachee')){gConsoleCache(false);if(GMODE.m===m){if(m==='inv')gAtelier(true);return;}} // (2026-10-09) la console repliée : la touche la ROUVRE (dans son mode)
  /* (2026-10-10, Léo, deux passes : « INVENTAIRE fait deux trucs différents : enlève celui avec les raretés », puis « quand j'appuie sur BOUTIQUE
     ou INVENTAIRE une deuxième fois, tu fais HIDE ») la touche allumée, retouchée, REPLIE la console (ce que faisait CACHER, retiré) — elle ne
     ramène plus à la vue des raretés ; touchée repliée, elle la rouvre (ligne du dessus). TOUT ne reste que la vue d'ouverture du garage. */
  if(GMODE.m===m){ // (2026-10-11, Léo : « enlève le double-clic INVENTAIRE ou BOUTIQUE qui enlève la page, l'œil fait déjà ça ») la touche allumée, retouchée, ne replie plus rien —
    if(m==='shop'&&GMODE.paye){GMODE.paye=false;const b9=$('gRar'),s9=$('gStrip');if(b9)b9._k=null;if(s9){s9._r=null;s9.scrollTop=0;}gShopJour();return;} // (2026-10-12) RETOUR depuis les offres payantes : la vitrine du jour
    if(m==='shop'){gGarageReplie();return;} /* (2026-10-14) le garage REPLIÉ, plus l'inventaire */ // (2026-10-12, Léo : « BOUTIQUE devient RETOUR quand on appuie dessus ») RETOUR : l'INVENTAIRE (la vue d'arrivée), les cinq touches
    if(m==='inv'){if(GATL.on){gAtelier(false);gGarageReplie();}else gAtelier(true);return;} /* (2026-10-14) RETOUR de l'inventaire : le garage REPLIÉ */ // (2026-10-12, Léo) INVENTAIRE ferme l'atelier ; la même touche, devenue ◀ RETOUR, le rouvre
    return;}
  GMODE.m=m;GMODE.paye=false;GMODE.fam=m==='shop'?gShopFam():null; // (2026-10-10) la famille montrée en BOUTIQUE, détachée de la caisse affichée
  const bar=$('gRar'),st=$('gStrip');if(bar)bar._k=null;if(st){st._r=null;if(m==='tous'){st.scrollTop=0;st.classList.remove('finBas');}}
  gModeCale();
  if(SHOP.tab==='voiture')garageFamilles(carRar(garageI));else gStripHabits(SHOP.tab,SHOP.i[SHOP.tab]);
  gModeBoutons();if(m==='inv')gAtelier(true);}
