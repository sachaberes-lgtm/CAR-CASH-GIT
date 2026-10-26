/* ================= LE GARAGE EST LE MENU (2026-09-30, sketch de Léo) =================
   « le garage devient le nouveau menu » : l'accueil n'existe plus à l'écran — le routeur, en arrivant sur 'home', ouvre l'atelier en
   mode MENU (`garAccueil`). Deux modes, une seule scène : MENU (profil · PLAY · réglages · socle des MISSIONS · [🔒][LEVEL][BOUTIQUE])
   et BOUTIQUE (l'ancien atelier : fiche, onglets, vignettes, achat, MENU | BOUTIQUE | JOUER — sa maison rend le MENU). */
/* ================= LE GARAGE, HUB DES TROIS (2026-10-06) =================
   Sacha : « enlève les boutons MISSION et CARRIÈRE de l'écran d'accueil et mets-les dans le garage, le garage doit servir de hub aux 3 ».
   · L'ACCUEIL : la porte des MISSIONS devient la PORTE DU GARAGE (même place, même largeur, à côté du ⚙) ; la BOUTIQUE la rejoint en
     carré ; la rangée des tuiles (GARAGE · CARRIÈRE · BOUTIQUE) s'efface. La porte montre ce qu'il y a derrière : la cible des missions
     avec ses trois cases (le même #mMisPips, rempli par le même code) et le trophée de la carrière — le joueur qui les cherchait les voit.
   · LE GARAGE : une barre ATELIER · MISSIONS · CARRIÈRE (#gHub), au MÊME endroit sur les trois pages. Chaque page garde sa rangée
     d'actions (HOME à gauche, JOUER en or à droite ; la carrière, elle, se joue en touchant un monde) ; la carrière ouverte du hub
     remplace son RETOUR par HOME — on ne « revient » pas d'un onglet, on en change. */
{document.documentElement.classList.add('hub');
  try{const hm=$('mHome'),ou=hm&&hm.querySelector('.mOutils'),mb=ou&&ou.querySelector('.mMisBtn'),ge=ou&&ou.querySelector('.mGear'),
      sh=hm&&hm.querySelector('.mIcons [data-m="shop"]'),bd=$('bdGar');
    if(mb&&ge&&sh){
      mb.classList.add('mHubPorte');mb.setAttribute('data-m','garage');mb.setAttribute('aria-label','Garage');
      mb.innerHTML='<span data-fr="GARAGE">'+TR('GARAGE')+'</span>'; // (2026-10-07, Sacha : « le bouton garage doit être simplifié, avec juste l'inscription GARAGE dessus ») — plus d'icône ni d'aperçu
      if(bd)mb.appendChild(bd);
      sh.classList.remove('ico');sh.classList.add('pbCarre','mHubShop');sh.setAttribute('aria-label','Boutique');
      Array.from(sh.childNodes).forEach(function(n){if(n.nodeType===3)n.remove();});
      ou.insertBefore(sh,ge);}
  }catch(e){console.warn('hub : accueil',e);}}
/* ================= L'ACCUEIL DU CIEL (2026-10-10, Léo) =================
   « Nouvelle interface : le ciel, la voiture, tout reste identique au main ; la seule chose qu'on change, ce sont les BOUTONS — plus petits,
   mieux cadrés dans l'écran ; le logo doré est très beau : peut-être des flammes très légères derrière, quelque chose d'un peu fluide qui
   donne un peu de vie sans trop en faire ; les boutons : MISSIONS, GARAGE, RÉGLAGES, JOUER, CARRIÈRE. »
   · RANGÉE 1 (`.mOutils`, que lisent garLibre et menuCadre pour poser la caisse au-dessus) : MISSIONS · GARAGE · CARRIÈRE, trois tuiles
     (icône + mot) ; MISSIONS reprend ses trois cases (#mMisPips, remplies par mFill) — depuis que le garage a perdu sa barre de hub, c'est
     d'ici qu'on rejoint les missions et la carrière.
   · RANGÉE 2 (`.mAccP`) : ⚙ · JOUER (le mot d'or, un cran plus petit) · la BOUTIQUE en € (gardée : c'est la seule porte du shop payant).
   · Les vraies touches sont DÉPLACÉES (leurs écouteurs, leur badge, leur aiguillage `data-m` restent) ; MISSIONS et CARRIÈRE sont neuves
     (l'aiguilleur de la coque lit `data-m` : 'mis', 'carr'). */
try{const hm=$('mHome'),ou=hm&&hm.querySelector('.mOutils'),gar=ou&&ou.querySelector('.mHubPorte'),ge=ou&&ou.querySelector('.mGear'),
    sh=ou&&ou.querySelector('.mHubShop'),pl=hm&&hm.querySelector('.mPlay');
  if(ou&&gar&&ge&&sh&&pl){hm.classList.add('acc2');
    const tuile=function(m,ic,fr,lb,plus){const d=document.createElement('div');d.className='pbtn mAccB';d.setAttribute('data-m',m);d.setAttribute('role','button');d.setAttribute('aria-label',lb);
      d.innerHTML='<i class="pxi pxi-'+ic+'" aria-hidden="true"></i><span data-fr="'+fr+'">'+TR(fr)+'</span>'+(plus||'');return d;};
    const mi=tuile('mis','cible','MISSIONS','Missions','<b class="mMisPips" id="mMisPips" aria-hidden="true"><u></u><u></u><u></u></b>');
    gar.classList.add('mAccB');gar.insertAdjacentHTML('afterbegin','<i class="pxi pxi-voiture" aria-hidden="true"></i>');
    /* (même jour, Léo : « recadre bien les boutons : ils sont un peu éparpillés bizarrement ») UN SEUL BLOC, sur une grille, bords alignés.
       (puis, Léo : « branche la MISSION au PLAY comme la dernière fois » — la barre fine du 5/10 — et « au menu, remplace SHOP par OFFRES »)
       RANGÉE : ⚙ · GARAGE · CARRIÈRE · OFFRES (la boutique en €, renommée) ; dessous, MISSIONS en BARRE FINE branchée sur JOUER (deux
       conducteurs d'or), puis JOUER dans sa plaque. */
    try{Object.assign(I18N,{'REGLAGES':'SETTINGS'});if(!ge.querySelector('span'))ge.insertAdjacentHTML('beforeend','<span data-fr="REGLAGES">'+TR('REGLAGES')+'</span>');}catch(e){} /* (UX 8) le mot sous le pictogramme : un enfant lit, il ne devine pas */
    ou.insertBefore(ge,gar);
    {const bd=sh.querySelector('.mBadge');sh.className='pbtn mAccB mOffres';sh.setAttribute('aria-label','Achat');
      sh.innerHTML='<i class="pxi pxi-cadeau" aria-hidden="true"></i><span data-fr="ACHAT">'+TR('ACHAT')+'</span>'; /* (2026-10-15 matin, Sacha : « offre doit s'appeler boutique » ; même jour, après-midi : « dans l'écran d'accueil change le bouton boutique pour un bouton offre » ; le soir : « dans l'écran d'accueil, l'offre doit maintenant s'appeler achat ») */if(bd)sh.appendChild(bd);ou.appendChild(sh);}
    mi.classList.add('mMisBarre');
    const bas=document.createElement('div');bas.className='mAccP';pl.parentNode.insertBefore(bas,pl);bas.appendChild(mi);bas.appendChild(pl);
    }
}catch(e){console.warn('accueil du ciel',e);}
/* (les FLAMMES du logo — feu de DOOM, puis contour des lettres en cubes — ont été essayées le 2026-10-10 et retirées le même soir, Léo :
   « enlève les flammes, sois plus mature : juste le logo, fais-le briller encore plus ». Elles vivent dans l'historique, commits 844674a → dd9993f.) */
function hubCtx(){ // l'onglet du hub où l'on est ('' = hors du hub)
  if(!garageOn||!gEl||(started&&!gameOver))return '';
  if(gEl.classList.contains('missions'))return 'mis';
  if(gEl.classList.contains('menu'))return '';
  return 'atl';}
function hubSync(){ // appelée à chaque image de l'atelier (garageRender) et à sa fermeture : n'écrit dans la page que si l'état CHANGE
  const t=hubCtx(),cache=!!t&&(!!GAR.go||gEl.classList.contains('inv')||gEl.classList.contains('quiet')||gEl.classList.contains('launching')),k=t+(cache?'-':'');
  if(k===hubSync.k)return;const t0=hubSync.t;hubSync.k=k;hubSync.t=t;
  const el=hubSync.el||(hubSync.el=document.getElementById('gHub'));if(!el)return;
  document.documentElement.classList.toggle('hubOn',!!t);el.classList.toggle('cache',cache);
  if(GTN&&GTN.el)GTN.el.classList.toggle('on',t==='atl'&&!cache); // (2026-10-09) LA JAUGE : dans l'atelier seulement
  {const hm=document.getElementById('gHomeMini');if(hm){hm.classList.toggle('on',t==='atl'&&!cache);try{gHomePlace(true);}catch(e){}}} // (2026-10-09) le PETIT HOME aussi
  if(t!==t0)el.querySelectorAll('.ghT').forEach(function(b){const on=b.getAttribute('data-h')===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
  if(t&&!t0)try{m2Portes();}catch(e){}}
function hubVa(t,b){ // changer d'onglet : les deux onglets sont des modes de l'atelier
  const cur=hubCtx();if(!cur||GAR.go||ecranWipe._on)return;
  if(b)uiPop(b);uiClic('onglet');
  if(t===cur)return;
  if(t==='mis'){if(!gEl.classList.contains('missions')){GAR.misVit=false;garMode('missions');}}
  else if(gEl.classList.contains('missions')||gEl.classList.contains('menu'))garMode('boutique');
  hubSync();}
document.querySelectorAll('#gHub .ghT').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();hubVa(b.getAttribute('data-h'),b);});});
/* LA JAUGE POUR TOURNER LE GARAGE (2026-10-09, Léo) — voir son CSS (fin de <style id="hubGarage">). Le curseur = l'angle de la VUE
   ramené dans [−180°, 180°] (le milieu : face à la porte ; à droite, le décor tourne comme sous un doigt qui glisse vers la droite).
   Saisie : le balancement est versé dans le regard (pas de saut), l'élan et le retour à la porte s'arrêtent ; le tour de base `k0` est
   figé pour toute la saisie (sinon, au bout du rail, ±180° basculerait d'un tour complet). Clavier : ← → 15°, Début = la porte. */
var GTN={el:document.getElementById('gTourne'),id:null,k0:0,t:-1,deg:999}; // var : hubSync peut tourner avant cette ligne
var GT_LISSE=.14,GT_FREIN=6,GT_ELAN=.6; // (2026-10-10) le ressort de la vue quand la jauge mène (s), le frein de l'élan lâché (/s), la part de la vitesse du doigt gardée au lâcher — (même jour, Léo : « moins d'effet glissade ») ressort .24 → .14, frein 2,2 → 6 : un coup de pouce file de quelques degrés et se pose, il ne glisse plus
function gtMene(){return typeof GTN!=='undefined'&&!!GTN&&!!GTN.gt&&!garageDrag;} // la jauge mène la vue (posé par gtVise, rendu quand la vue s'est posée ou que le doigt saisit le décor)
function gtWrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function gTourneMaj(){
  if(!GTN||!GTN.el||!GTN.el.classList.contains('on'))return;
  /* (même soir, Léo : « plus smooth la glisse de la jauge ») le curseur montre la CIBLE (GAR.vAc) : il colle au doigt et file avec l'élan,
     la vue le rattrape par son ressort (au lieu d'un curseur qui traînait derrière la vue). L'élan s'arrête en douceur au bout du rail. */
  if(GTN.glisse){if(!GAR.vW){GTN.glisse=false;}else{const lo=GTN.k0-Math.PI,hi=GTN.k0+Math.PI;if(GAR.vAc<lo||GAR.vAc>hi){GAR.vAc=Math.min(hi,Math.max(lo,GAR.vAc));GAR.vW=0;GTN.glisse=false;}}}
  const a0=gtWrap(GTN.id!=null||GTN.glisse?(GAR.vAc-GTN.k0)+0:(GAR.vAc!=null?GAR.vAc:(GAR.vA||0)));
  /* (2026-10-10, Léo : « encore plus smooth ») le curseur AFFICHÉ rejoint la cible en ~35 ms : un toucher loin sur le rail le fait filer au
     lieu de sauter ; sous le doigt l'écart reste d'un pixel ou deux. Passé un demi-tour d'écart (la vue a fait le tour), il se pose net. */
  const dt9=Math.min(.05,GAR.dtR||.016);if(GTN.aD==null||Math.abs(a0-GTN.aD)>Math.PI||REDUCED_MOTION)GTN.aD=a0;else GTN.aD+=(a0-GTN.aD)*(1-Math.exp(-dt9*30));if(Math.abs(a0-GTN.aD)<1e-4)GTN.aD=a0;
  const a=GTN.aD,t=Math.round((.5-a/(2*Math.PI))*10000)/10000;
  if(t!==GTN.t){GTN.t=t;const st=GTN.el.style;st.setProperty('--t',t);st.setProperty('--f0',Math.min(t,.5));st.setProperty('--f1',Math.max(t,.5));}
  const d=Math.round(-a*180/Math.PI);if(d!==GTN.deg){GTN.deg=d;GTN.el.setAttribute('aria-valuenow',d);}}
function gtLibre(){return garageOn&&!GAR.go&&!GAR.fige&&!ecranWipe._on&&hubCtx()==='atl';}
function gtSaisit(){
  if(GAR.swK){GAR.vA=(GAR.vA||0)+(GAR.swO||0);GAR.swO=GAR.swP=GAR.swK=0;}
  const cur=GAR.vAc!=null?GAR.vAc:(GAR.vA||0);GTN.k0=cur-gtWrap(cur);GAR.ret=null;GAR.vW=0;}
function gtVise(a){const n=performance.now();GAR.vAc=GTN.k0+a;GTN.gt=1;GTN.fixe=true;
  /* (2026-10-10) la vitesse du doigt se mesure sur ses 100 dernières ms (et plus sur les deux derniers événements, bruités) : l'élan du lâcher */
  const H=GTN.h||(GTN.h=[]);H.push(n,GAR.vAc);while(H.length>2&&n-H[0]>100)H.splice(0,2);
  GTN.v=H.length>=4&&n-H[0]>12?(GAR.vAc-H[1])/((n-H[0])/1000):0;
  GTN.tv=n;GAR.vW=0;GAR.ret=null;GAR.mvT=GAR.tDoigt=n;}
function gtDuDoigt(e){const r=GTN.el.querySelector('.gtRail').getBoundingClientRect();
  const t=THREE.MathUtils.clamp((e.clientX-r.left)/Math.max(1,r.width),0,1);gtVise(-(t-.5)*2*Math.PI);}
if(GTN.el){
  GTN.el.addEventListener('pointerdown',function(e){e.stopPropagation();if(!gtLibre()||GTN.id!=null)return;
    GTN.id=e.pointerId;GTN.glisse=false;GTN.tv=null;GTN.v=0;GTN.h=[];try{GTN.el.setPointerCapture(e.pointerId);}catch(_){}GTN.el.classList.add('tient');gtSaisit();gtDuDoigt(e);hap(4);});
  GTN.el.addEventListener('pointermove',function(e){if(e.pointerId!==GTN.id)return;e.stopPropagation();if(!gtLibre())return;gtDuDoigt(e);});
  const fin=function(e){if(e.pointerId!==GTN.id)return;e.stopPropagation();GTN.id=null;GTN.el.classList.remove('tient');const n=performance.now();GAR.tDoigt=n;
    if(GTN.tv!=null&&n-GTN.tv<90&&Math.abs(GTN.v||0)>.3){GAR.vW=THREE.MathUtils.clamp(GTN.v*GT_ELAN,-VITRINE_CAM.dElan*.75,VITRINE_CAM.dElan*.75);GTN.glisse=true;} // (≤ 1,5 rad/s ÷ frein 6 : au plus ~14° de course après le lâcher) // lâchée en mouvement : elle GLISSE et ralentit (le frein de la vue)
    GTN.tv=null;};
  GTN.el.addEventListener('pointerup',fin);GTN.el.addEventListener('pointercancel',fin);GTN.el.addEventListener('lostpointercapture',fin);
  GTN.el.addEventListener('keydown',function(e){if(!gtLibre())return;const k=e.code;
    if(k!=='ArrowLeft'&&k!=='ArrowRight'&&k!=='Home')return;e.preventDefault();e.stopPropagation();gtSaisit();
    const a=gtWrap(GAR.vAc!=null?GAR.vAc:(GAR.vA||0));
    gtVise(k==='Home'?0:THREE.MathUtils.clamp(a+(k==='ArrowLeft'?1:-1)*Math.PI/12,-Math.PI,Math.PI));});}
/* (même jour) DEBOUT, la jauge vit DANS la console, juste avant la rangée des boutons ; COUCHÉE, elle retourne à côté de la barre du hub
   (position fixe, en bas à gauche). Même nœud, mêmes écouteurs : on ne fait que le déplacer quand l'orientation change. */
const GT_COUCHE=matchMedia('(orientation:landscape) and (max-height:540px),(orientation:landscape) and (min-aspect-ratio:3/2) and (max-height:820px)');
function gtPlace(){if(!GTN.el)return;const bas=document.getElementById('gBottom'),act=document.getElementById('gAct'),hub=document.getElementById('gHub');
  const dedans=!GT_COUCHE.matches&&bas&&act&&act.parentNode===bas; // (2026-10-10, Léo : « au-dessus des trois bandes colorées ») debout : JUSTE AU-DESSUS de la console, hors du panneau
  if(dedans){if(GTN.el.nextSibling!==bas)bas.parentNode.insertBefore(GTN.el,bas);}
  else if(hub&&GTN.el.previousSibling!==hub)hub.parentNode.insertBefore(GTN.el,hub.nextSibling);
  document.documentElement.classList.toggle('gtConsole',!!dedans);}
try{gtPlace();if(GT_COUCHE.addEventListener)GT_COUCHE.addEventListener('change',gtPlace);else GT_COUCHE.addListener(gtPlace);}catch(e){}
/* LE PETIT HOME (2026-10-09) : en haut à droite, centré sur la hauteur de la plaque du compte (debout : le plafond de l'atelier). */
function gHomePlace(force){const el=document.getElementById('gHomeMini');if(!el||!el.classList.contains('on'))return;
  const n=performance.now();if(!force&&n-(gHomePlace._t||0)<200)return;gHomePlace._t=n;
  const m=document.getElementById('gCompteur'),r=m&&m.getBoundingClientRect();if(!r||!r.height)return;
  const top=Math.max(6,Math.round(r.top+(r.height-32)/2));if(top===gHomePlace._k)return;gHomePlace._k=top;el.style.setProperty('--hmT',top+'px');}
try{const hm=document.getElementById('gHomeMini');const va=function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(hm);const c=$('gClose');if(c)c.click();};
  hm.addEventListener('click',va);hm.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();va(e);}});}catch(e){}
document.documentElement.classList.add('misS'); // l'écran MISSIONS de Sacha : ses règles CSS vivent sous html.misS
/* (même soir, Léo : « enlève la porte ») la porte FERMÉE au menu (Sacha, b8e7ce7) va avec SA version : par défaut (ou ?porte=1) elle
   descend au menu et s'ouvre au JOUER. */
const PORTE_FERMEE=/[?&]porte=1\b/.test(location.search); // (2026-10-08, Léo : « rouvre la porte en flammes ») la porte de Sacha ne ferme plus le garage : le rideau de feu brûle, grand ouvert, derrière la caisse — `?porte=1` la remet fermée (elle s'ouvrait au JOUER).
/* AVANT le 08/10 : PORTE_FERMEE=MENU_SACHA||?porte=1 */ // (2026-10-04) Léo l'avait enlevée le matin, puis : « remets une porte maintenant que les flammes sont plus jolies » — la porte fermée de Sacha revient (voir LA PORTE v2)
/* ⚠ LE GARAGE DE SACHA (2026-10-06, Sacha : « j'aime pas les modifs que Léo a faites dans le garage concernant les boutons et le HUD ; garde
   les améliorations qu'il a faites dans le garage 3D, puis remets mes boutons et mon affichage » · « tu peux garder son bouton inventaire,
   mais retravaille-le dans la DA du reste du jeu ») : la vitrine de Léo (le menu ?menu=leo) est retirée (18/10). Le bouton GARAGE ouvre la
   CONSOLE de Sacha telle qu'avant la vitrine (le nom,
   le compte, ⚙, les onglets, les vignettes, HOME · BOUTIQUE · JOUER). La 3D de Léo reste partout : l'atelier aéré, la porte et son feu, la
   caméra sans déclic, le BURN-OUT au doigt tenu sur la caisse, le BOUTON INVENTAIRE et ses bras-robots — `garAtelierLibre()` dit quand
   l'atelier est à toi. */
function garAtelierLibre(){return !!(gEl&&garageOn&&!gEl.classList.contains('menu')&&!gEl.classList.contains('missions'));}
/* LA VUE DE LÉO DANS LA CONSOLE DE SACHA (2026-10-06, Léo : « sans changer le garage de Sacha, remets le beau point de vue — l'angle travaillé,
   légèrement éloigné, vers la porte —, le glissé et le burn-out »). La console (ses boutons, sa fiche, ses onglets, la barre du HUB) ne bouge
   pas d'un pixel ; seule la 3D derrière reprend ce que la vitrine faisait : la caméra de présentation (`VITRINE_CAM` : recul calculé sur la
   caisse, regard sur l'entrée, porte relevée sur le feu, retour à la porte après 3 s), le GLISSÉ en ressort (le doigt hors de la caisse tourne
   la vue, sur la caisse il tient le plateau) et le BURN-OUT complet (dérapage, DONUT au doigt, coup de gaz). `garVueLeo()` dit quand : l'atelier
   est libre (voir garAtelierLibre), hors du départ direct de l'accueil (`quiet` : le JOUER de l'accueil reste celui de Sacha). */
function garVueLeo(){return garAtelierLibre()&&!gEl.classList.contains('quiet');}
try{Object.assign(I18N,{'PERMIS':'LICENSE','AUTO-ECOLE':'DRIVING SCHOOL','NIVEAUX ACCOMPLIS':'LEVELS CLEARED','AUCUN NIVEAU TERMINE':'NO LEVEL CLEARED YET','FRANCHIS TON 1ER PORTAIL':'CROSS YOUR FIRST PORTAL','A BATTRE':'NEXT UP','A DECOUVRIR':'TO DISCOVER','A DECOUVRIR1':'TO DISCOVER','TOUT EST TERMINE':'ALL CLEARED'});}catch(e){}
/* LE RECORD DE FORTUNE (2026-10-06, Léo : « une barre money sur le total jamais atteint ») : `SAVE.d.bankMax` = le plus haut total que la banque
   ait jamais tenu, relevé à CHAQUE entrée d'argent (fin de partie, défis, permis, partie interrompue) — pas seulement au garage : un achat fait
   juste après une partie ne doit pas l'effacer. `bankMaxVu` = le record que la jauge a déjà montré (pour fêter celui qu'on vient de battre). */
function bankMaxMaj(){const b=bank();if(b>(SAVE.d.bankMax||0))SAVE.d.bankMax=b;}
try{Object.assign(I18N,{'SOMMET':'PEAK','RECORD !':'RECORD!','CASH':'CASH','AURA':'AURA','ENCORE':'NEED','A TA PORTEE !':'IT\'S YOURS!','COLLECTION COMPLETE':'FULL COLLECTION','INTOUCHABLE':'UNTOUCHABLE','A TA PORTEE':'AFFORDABLE','VERS':'TO','TOUT EST A TOI':'YOU OWN IT ALL','SOMMET ATTEINT':'TOP RANK','TUNING':'TUNING','SHOP':'SHOP','INVENTAIRE':'INVENTORY','MAINTIENS LA CAISSE':'HOLD YOUR CAR','OBJETS':'ITEMS','OBJET':'ITEM','RIEN ICI POUR LE MOMENT':'NOTHING HERE YET'});}catch(e){}
try{const b9=document.querySelector('#gOutils [data-go="set"]'),s9=b9&&b9.querySelector('.boulon');if(s9)s9.outerHTML=pxi('reglages');}catch(e){} /* (2026-10-06) LE GARAGE DE SACHA : son ⚙ en pixels */
/* ================= L'INVENTAIRE (2026-10-04, Léo : « quand on maintient sur la voiture, ça active un inventaire comme le shop, mais avec les
   objets possédés, entourés par une lueur de la couleur de leur rareté ») =================
   · LE GESTE : en VITRINE, le doigt (ou la souris) posé SUR la caisse (`garSurCaisse` : sa carrosserie projetée à l'écran, un peu élargie) et
     TENU : après `INV.D0` (0,12 s : un tap ne montre rien) un anneau de la couleur de la caisse se remplit sous le doigt en `INV.D` (0,45 s) ;
     plein, le tiroir s'ouvre (vibration). Bouger de plus de 12 px = c'est un glissé (la caisse tourne), le geste s'annule. Le relâcher qui
     suit l'ouverture est AVALÉ (`INV.mange`) : il ne tape pas la caisse. Au clavier : I.
   · LE TIROIR (`#gInv`) : les onglets de la console (VOITURES · PEINTURE · AILES · TRAÎNÉES, avec leur compte) et une grille de ce qui est À
     TOI — les caisses possédées (`carUnlockedVrai` : en TEST tout s'équipe, mais l'inventaire dit la vérité ; la caisse équipée y est
     toujours), les habillages possédés (ceux d'origine compris). Rangé du plus rare au plus commun (`INV_RANG`), chaque tuile dans la LUEUR
     de sa famille : les cinq couleurs du garage (`RARETES`), et une lueur d'autant plus forte que la famille est rare (`INV_LUEUR`). Les
     habillages n'avaient pas de famille : `cosmRar` leur en donne une à leur prix (d'origine = COMMUNE, ≤ 5 000 = RARE, au-delà = ÉPIQUE,
     gagné par défi = DÉFI ; aucun LÉGENDAIRE : c'est le rang des caisses du vrai argent).
   · TOUCHER une tuile ÉQUIPE, tout de suite : une caisse passe par la bascule du plateau (`garageSaute`), un habillage se pose sur la caisse
     (`shopEquip` + `buildCar`) ; éclair de sa couleur derrière (`#gEclat`), coche verte sur la tuile. Ailes et traînées se montrent pendant
     qu'on est sur leur onglet (`trailApercu`, `carWingL`), comme dans la console.
   · FERMER : la croix, un tap dans la scène, Échap ; tout changement de mode (`garMode`, SHOP, HOME, JOUER, closeGarage) le referme.
   `dbgInv()` : état · `dbgInv('ouvre'|'ferme')` · `dbgInv('cat','peinture')`. */
var INV={on:false,cat:'voiture',hold:null,mange:null,raf:0,D0:.12,D:.45};
const INV_RANG={infini:6,mythique:5,legendaire:4,epique:3,exotique:2,defi:2,rare:1,commun:0},INV_LUEUR={commun:.35,rare:.6,exotique:.7,epique:.82,defi:.7,legendaire:1,mythique:1,infini:1};
function cosmRar(cat,d){if(!d)return 'commun';if(d.r)return d.r;if(cat==='figure')return !d.p?'commun':d.p<=120000?'rare':d.p<=250000?'epique':'legendaire'; /* (2026-10-14) une figure : sa rareté suit son prix — (2026-10-25, Sacha) seuils ×10 comme les prix de v899 : rare ≤ 120 k, épique ≤ 250 k */
if(d.mis)return d.mis>=8?'epique':'rare';if(!d.p)return 'commun';return d.p<4000?'commun':d.p<60000?'rare':d.p<250000?'epique':d.p<900000?'legendaire':'mythique';} /* (2026-10-14) la grille de l'équilibrage : commune < 4 k · rare < 60 k (l'ex-tranche EXOTIQUE 16-60 k est RARE depuis le 2026-10-18, Sacha) · épique < 250 k · légendaire < 900 k (`r` sur la fiche a le dernier mot) */
function invListe(cat){
  if(cat==='voiture'){const eq=equippedCar(),L=[];for(let i=0;i<CARS.length;i++)if(!carRetiree(i)&&(i===eq||carUnlockedVrai(i)))L.push({cat:cat,i:i,r:carRar(i),eq:i===eq});
    return L.sort(function(a,b){return (INV_RANG[b.r]-INV_RANG[a.r])||(carOrdre(b.i)-carOrdre(a.i));});}
  if(cat==='figure'){const L=[];if(window.FIG)FIG.liste.forEach(function(f,j){if(figPossede(f.id))L.push({cat:cat,i:j,d:f,r:cosmRar(cat,f),eq:!FIGV2.on||figEquipee(f.id)>=0});}); /* (LES FIGURES v2) équipée = dans un des trois emplacements */return L.sort(function(a,b){return (figPeut(a.d.id)[0]-figPeut(b.d.id)[0])||(INV_RANG[b.r]-INV_RANG[a.r])||((b.d.p||0)-(a.d.p||0));});} /* (2026-10-15) rangées par DIRECTION, comme à la boutique : l'avant, l'arrière, les côtés */ // (2026-10-14) toutes JOUENT (le double-tap tire au hasard parmi elles)
  const e=shopEqD(cat),L=[];COSM[cat].forEach(function(d,j){if(shopOwned(cat,d.id))L.push({cat:cat,i:j,d:d,r:cosmRar(cat,d),eq:e===d});});
  return L.sort(function(a,b){return (INV_RANG[b.r]-INV_RANG[a.r])||((b.d.p||0)-(a.d.p||0));});
}
function invTotal(cat){ // (2026-10-20) tout ce qui existe dans l'onglet (le dénominateur de la progression)
  if(cat==='voiture'){let n=0;for(let i=0;i<CARS.length;i++)if(!carRetiree(i))n++;return n;}
  if(cat==='figure')return window.FIG?FIG.liste.length:0;
  return COSM[cat]?COSM[cat].length:0;}
function invRgba(hex,a){const n=parseInt(String(hex).slice(1),16)||0;return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a.toFixed(2)+')';}
function invRender(){
  const g=$('ivGrille');if(!g)return;let tot=0;
  document.querySelectorAll('#gInv .ivTab').forEach(function(b){const c=b.getAttribute('data-c'),on=c===INV.cat,n=invListe(c).length;tot+=n;
    b.classList.toggle('on',on);b.setAttribute('aria-selected',on);const em=b.querySelector('em');if(em&&em.textContent!==String(n))em.textContent=n;});
  const ic=$('ivCompte');if(ic)ic.textContent=tot+' '+TR(tot>1?'OBJETS':'OBJET');
  const L=invListe(INV.cat);
  {const T=Math.max(L.length,invTotal(INV.cat)),pb=$('ivProgBarre'),pt=$('ivProgTxt'); /* (2026-10-20) la progression de la collection : possédés / total de l'onglet */
    if(pb)pb.style.setProperty('--p',T?(L.length/T).toFixed(3):0);if(pt)pt.textContent=L.length+' / '+T;}
  const k=INV.cat+':'+L.map(function(o){return o.i;}).join(',')+':'+LANG+(INV.cat==='peinture'?':'+equippedCar():'')+(INV.cat==='figure'?':'+figSlots().join(','):'');
  if(g._k!==k){g._k=k;
    const hx=function(c){return '#'+(c>>>0).toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
    g.innerHTML=!L.length?'<p class="ivVide">'+TR('RIEN ICI POUR LE MOMENT')+'</p>':L.map(function(o,n){const ri=rarInfo(o.r),lu=INV_LUEUR[o.r]||.5;let fig='',nm='';
      if(o.cat==='voiture'){nm=TR(CARS[o.i].name);fig=PHOTO.cache[o.i]?'<img alt="" src="'+PHOTO.cache[o.i]+'">':'<i class="ivPh"></i>';}
      else{const d=o.d;nm=TR(d.n);
        if(o.cat==='peinture'){const c9=d.id==='usine'?CARS[equippedCar()].color:d.c;fig='<i class="ivSw'+cosmSwCl(d)+'" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(c9))+'"></i>';}
        else if(o.cat==='trainee')fig='<i class="ivRub" style="color:'+(d.rainbow?'#ff9b1a':d.rgb?rg(d.rgb):'#ff8a24')+';background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 35%,#fff 100%)')+'"></i>';
        else if(o.cat==='figure')fig='<i class="pxi pxi-rotation ivAile" style="color:'+ri.c+'"></i>';
        else fig='<i class="pxi pxi-aile ivAile" style="color:#dff6ff"></i>';}
      const nmA=sansAcc(String(nm)).replace(/"/g,'');
      return '<div class="ivT r-'+o.r+'" data-i="'+o.i+'" role="button" tabindex="0" aria-label="'+nmA+' · '+sansAcc(TR(ri.n1))+'" style="--rc:'+ri.c+';--rg:'+invRgba(ri.c,.26+.42*lu)+';--rf:'+invRgba(ri.c,.06+.18*lu)+';--rk:'+lu+';--n:'+n+'">'+fig+'<b>'+nmA+'</b><small>'+sansAcc(TR(ri.n1))+'</small><u'+(o.cat==='peinture'&&o.d.id!=='usine'?' class="x">'+pxi('croix'):'>'+(o.cat==='figure'&&FIGV2.on&&o.eq?figSlots().map(function(x,i9){return x===o.d.id?pxi(FIG_FAM[i9][2]):'';}).join(''):pxi('coche')))+'</u></div>';}).join(''); /* (LES FIGURES v2) une figure équipée porte le NUMÉRO de son emplacement (1 · 2 · 3 = les boutons de vol) */
    if(INV.cat==='voiture')setTimeout(function(){if(!INV.on)return;g.querySelectorAll('.ivT').forEach(function(el){if(!el.querySelector('.ivPh'))return;const i=+el.getAttribute('data-i');
      photoFile(i,function(url){const v=el.querySelector('.ivPh');if(!v||!el.isConnected)return;const im=document.createElement('img');im.alt='';im.src=url;v.replaceWith(im);});});},420); // les photos manquantes APRÈS l'entrée du tiroir (une photo = deux caisses rebâties : pas pendant qu'il glisse)
  }
  const eqs={};L.forEach(function(o){if(o.eq)eqs[o.i]=1;});
  g.querySelectorAll('.ivT').forEach(function(el){el.classList.toggle('eq',!!eqs[+el.getAttribute('data-i')]);});
}
function invOuvre(){
  if(!INV||INV.on||GAR.go||!garAtelierLibre())return false;
  if(SHOP.tab!=='voiture'||SHOP.prev)shopTab('voiture');{const eq=equippedCar();if(GAR.sw&&!GAR.sw.fait)GAR.sw.to=eq;else if(garageI!==eq)garageShow(eq);} /* (2026-10-07, audit avant publication ; une bascule en cours vise désormais TA caisse) l'inventaire équipe TA caisse : la fiche revient sur elle (sinon le plateau montrait la caisse équipée sous le nom et le prix d'une autre) */
  INV.cat='figure'; /* (2026-10-25, Sacha : « quand on ouvre l'inventaire, on arrive directement sur les figures ») */
  INV.on=true;if(!((SAVE.d.ast|0)&4)){SAVE.d.ast=(SAVE.d.ast|0)|4;SAVE.mark();}
  gEl.classList.remove('aideInv');gEl.classList.add('inv');garLibre._r=null;
  const g=$('ivGrille');if(g){g._k=null;g.scrollTop=0;}invRender();
  if(GAR_TAB_ANG[INV.cat]!=null)garTourneVers(GAR_TAB_ANG[INV.cat]); // (2026-10-24) en tournant, comme les onglets
  feuilleOuvre($('gInv'),'on');return true;
}
function invFerme(sec){
  if(!INV||!INV.on)return;INV.on=false;const el=$('gInv');
  if(gEl)gEl.classList.remove('inv');garLibre._r=null;
  if(sec){if(el)el.classList.remove('on','sortant');return;}
  feuilleFerme(el,'on');
}
function invEquipe(i,el){
  if(!INV.on||GAR.go)return;uiPop(el);const cat=INV.cat;let des=false;if(GAR_TAB_ANG[cat]!=null)garTourneVers(GAR_TAB_ANG[cat]); /* (2026-10-24, Léo : « quand on sélectionne, ça ne tourne pas vers l'autre ») toucher un objet ramène la caisse face à ce qu'il habille (le plateau l'avait fait dériver) */
  if(cat==='figure'){const f=window.FIG&&FIG.liste[i];if(f){if(FIGV2.on)figEqToast(f.id);garFigEssai(f.id,figEquipee(f.id));}hap(8);invRender();return;} // (2026-10-14) toucher une figure : la caisse la fait sur le plateau — (LES FIGURES v2) et elle prend (ou rend) son emplacement
  if(cat==='voiture'){if(i===equippedCar()){uiClic('nav');return;}if(!carUnlocked(i))return;
    SAVE.d.equipped=i;SAVE.flush();level=i;levelCash=0;garageSaute(i);}       // le même geste que ÉQUIPER : la caisse de départ — et la bascule du plateau
  else{let d=COSM[cat][i];if(!d)return;if(shopEqD(cat)===d){const u9=cat==='peinture'&&d.id!=='usine'?COSM.peinture.findIndex(function(x){return x.id==='usine';}):-1;if(u9<0){uiClic('nav');return;}i=u9;d=COSM.peinture[u9];des=true;} /* (2026-10-26, Léo : « quand on appuie sur une peinture sélectionnée, ça la désélectionne et laisse la couleur originale ») retoucher la peinture ÉQUIPÉE équipe D'ORIGINE à sa place */if(!shopEquip(cat,i))return; /* (2026-10-14, session SON) toucher ce qui est DÉJÀ équipé répond d'un tick (muet avant) */
    SHOP.prev=null;buildCar(CARS[equippedCar()]);GAR.pressT=GAR.PRESS_D;}     // l'habillage se pose sur la caisse (elle accuse le coup)
  try{if(SONV2)sfx(des?'ui.off':'ui.equipe');else if(!des)fanfare();}catch(er){}hap(10);
  try{if(cat==='peinture'){const d9=COSM.peinture[i]||{},c9=d9.c!=null?d9.c:(d9.grad?d9.grad[1]:des?CARS[equippedCar()].color:0xff7a3a);ATL.c=new THREE.Color(c9);}atlConstruit(cat);}catch(er){} // (même soir) LES OUTILS construisent l'objet
  el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');
  {const e9=$('gEclat');if(e9){e9.style.setProperty('--rc',el.style.getPropertyValue('--rc')||'#ffd75e');e9.classList.remove('on');void e9.offsetWidth;e9.classList.add('on');}} // l'éclair de SA couleur derrière la caisse
  invRender();
}
/* le doigt est-il SUR la caisse ? sa carrosserie (`carBody` : sans les flaques de phares au sol) projetée à l'écran, élargie de 8 % + 10 px */
function garCaisseRect(){
  if(!carGroup||!carGroup.visible)return null;const b=GAR._ib||(GAR._ib=new THREE.Box3()),v=GAR._iv||(GAR._iv=new THREE.Vector3());
  carGroup.updateMatrixWorld(true);b.setFromObject(carBody||carGroup);if(b.isEmpty())return null;
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(let k=0;k<8;k++){v.set(k&1?b.max.x:b.min.x,k&2?b.max.y:b.min.y,k&4?b.max.z:b.min.z).project(camera);
    const sx=(v.x*.5+.5)*VP.w,sy=(.5-v.y*.5)*VP.h;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}
  return {x0:x0,x1:x1,y0:y0,y1:y1};
}
function garSurCaisse(e){
  try{const r=garCaisseRect();if(!r)return false;const mx=(r.x1-r.x0)*.08+10,my=(r.y1-r.y0)*.08+10;
    return e.clientX>=r.x0-mx&&e.clientX<=r.x1+mx&&e.clientY>=r.y0-my&&e.clientY<=r.y1+my;}catch(er){return false;}
}
function invHoldFin(){if(!INV||!INV.hold)return;INV.hold=null;cancelAnimationFrame(INV.raf);const a=$('gInvAnneau');if(a)a.classList.remove('on');}
/* ===== LE PREMIER BURN-OUT, REVENU (2026-10-08, Léo : « reviens sur le premier burn-out, celui où on ne pouvait pas faire de donuts ;
   reviens sur celui-là et laisse-moi juste faire des donuts avec lui aussi ; reviens sur les premiers petits carrés transparents ; si tu y
   arrives, intègre quelques cubes blancs comme tu as fait là ; remets-le sur le main — la fumée ET le mouvement, les deux »). Ce bloc est
   celui du 05/10 au soir (commit 683984d : la fumée en GROS PIXELS transparents qui s'émiettent, le dérapage au ressort vif ω 7 / ζ ,5, la
   poupe qui chasse, la gomme en pixels, le rupteur), RECOPIÉ tel quel. Ce qui s'y ajoute, et rien d'autre :
   · LES DONUTS (voir LE DOIGT QU'ELLE SUIT, plus bas) : le doigt qui tourne autour d'elle la fait tourner tour pour tour, un petit cercle
     n'importe où aussi (à la vitesse du doigt) ; le ressort d'origine les suit ; en donut le pivot glisse au milieu du plateau, la vue
     recule pour le cadrer ; « DONUT ×n » et un anneau de fumée à chaque tour ;
   · LE VOLUME DE LA FUMÉE (`burnCubes`) : chaque bouffée en pixels porte en elle quelques petits cubes, à sa couleur et sa transparence ;
   · ce qui a été réglé depuis et qui n'est ni la fumée ni le mouvement : 0,8 s de maintien (`BURN_TENU`), le pouce qui peut glisser
     pendant la charge (`BURN_GLISSE`), « PAS ENCORE À TOI », la console de Sacha (`garAtelierLibre`), les feux stop, les pixels du chat.
   Tout le reste du burn-out d'après le 05/10 (fumée en volumes puis en cubes, voile, jet sous la roue, poids, flou des roues…) est dans
   l'historique git (dernier état : commit d6fea98).
   ----- LE BURN-OUT (2026-10-05, Léo : « lorsque j'appuie sur la voiture, au lieu d'ouvrir l'inventaire — qui va être ajouté à côté du
   bouton jouer —, la voiture va booster de manière satisfaisante : c'est un burn-out, puisque sinon elle foncerait. Un effet un peu
   stylé, travaillé, design. Avec des pixels. De la transparence, parce qu'il y aura de la fumée. Maintenue longtemps, la fumée disparaît
   mais peut s'accumuler, et le joueur peut jouer avec. Accordé à ce qu'on a déjà ; si tu surpasses, encore mieux. ») =====
   LE GESTE : le doigt TENU sur la caisse, en vitrine — 0,28 s sans bouger (0,14 s au premier jet), et ça part ; tant qu'il tient, ça brûle. Il peut alors
   GLISSER : la vue tourne autour de la caisse qui fume (et le doigt pousse la fumée). Un tap bref reste le « tonk » de tôle. Lâché : le
   moteur retombe en pétaradant. L'INVENTAIRE a son bouton, COFFRE, à côté de JOUER (et la touche I).
   LA CAISSE : les roues ARRIÈRE patinent (les essieux soudés de l'arrière, voir ESSIEUX), l'avant reste planté ; l'arrière s'écrase, le nez
   se lève, la carrosserie tremble, la poupe chasse de deux degrés ; le plateau s'arrête de tourner ; la caméra vibre à peine.
   LA FUMÉE (BURN.fum) : des bouffées EN PIXELS — chaque quad face caméra est une grille de 7 × 7 cases, ronde aux bords dentelés, dense
   au cœur ; en vieillissant elle s'ÉMIETTE case par case (le pixel art qui se dissout). Éclairée d'en haut, rosie par le feu près de la
   porte, bleuie par l'anneau du plateau au ras du sol. Elle monte, s'étale sous le plafond, vit 6 à 10 s : tenue longtemps, elle REMPLIT
   l'atelier (320 bouffées, recyclées de la plus vieille — le remplissage d'écran d'un téléphone). Le doigt qui GLISSE la pousse (le rayon du doigt dans la salle) ; un tap dans
   la fumée la SOUFFLE. Des quads et non des points WebGL : certains téléphones plafonnent `gl_PointSize` à 64 px.
   LE FEU (BURN.feu) : des pixels ADDITIFS de 3 × 3 (cœur blanc) — pétarades à l'échappement (le rupteur qui bégaie, les crépitements du
   lâcher) et, quand les gommes chauffent (`chaud`, ~3 s), des braises qui giclent des pneus. LES TRACES : deux bandes de gomme sur le
   plateau, qui foncent avec la durée et s'effacent en ~40 s.
   LE SON : le VRAI moteur du palier (ENG_SND — chaque palier son timbre, celui de la course) poussé au RUPTEUR (l'allumage coupe ~8 fois
   par seconde : le « brap-brap »), le crissement de la course (skid) ; au lâcher, ses crépitements (crackle). Aucun nœud neuf : les mêmes
   chaînes, leurs portes s'ouvrent et se referment (voir LES PORTES DU GRAPHE AUDIO).
   Console : dbgBurn() → l'état · dbgBurn(s) → un burn-out de s secondes (sans doigt) · dbgBurn(0) → coupé. */
const BURN={on:false,hold:null,bouge:false,k:0,t:0,chaud:0,rpm:0,son:false,cut:0,pops:[],fum:null,feu:null,gom:null,yaw:0,yawV:0,cib:0,pivK:0,drz:.8,rr:2.4,
  hapT:0,auto:0,autoW:0,ar:[],arW:[],roues:[],pots:[],corps:false,tE:0,tF:0,tP:0, // (2026-10-09) arW déclaré : absent, la 1re CHARGE (doigt tenu avant tout burn-out) jetait « arW is not iterable » à chaque image
  don:0,donK:0,donM:0,acc:0,n:0,nT:0,scx:0,scy:0,fA:null,fR:0,tx:null,ty:0,th:null,tT:0,sT:0,sAu:0,kc:0,mc:0,aideT:0,cad:0,Rs:3, // (2026-10-08) LE DONUT AU DOIGT
  qx:0,qz:0,qvx:0,qvz:0,fsx:0,fsz:0,fsOk:false,sv:null,so:null,sp:null,
  chg:0,nitro:false,recul:false,nk:0,rk:0,rkP:0,dzP:null,nE:0,btn:null, // (2026-10-08) LA CHARGE qui se voit · LA NITRO et LA MARCHE ARRIÈRE (boutons, clavier) // (2026-10-08) LA CAISSE SE BALADE : où elle est partie sur le plateau, sa vitesse, le doigt au sol
  kick:0,feuxK:0,pix:null,gr:null, // ce que le reste du jeu lit (la caméra, les feux stop, le chat) · les cubes blancs
  c:new THREE.Vector3(),
  v:new THREE.Vector3(),w:new THREE.Vector3(),u:new THREE.Vector3(),r:new THREE.Vector3(),q:new THREE.Vector3()};
const BURN_VS='attribute vec3 iP;attribute float iA;attribute float iS;attribute float iG;attribute float iSd;attribute vec3 iC;\n'+
  'varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'void main(){vec4 mv=modelViewMatrix*vec4(iP,1.);mv.xy+=position.xy*iS;gl_Position=projectionMatrix*mv;vUv=uv;vA=iA;vG=iG;vSd=iSd;vC=iC;vY=iP.y;}';
/* LA GRILLE D'ÉCRAN : chaque bouffée est dessinée en GROS PIXELS de `uPx` pixels d'écran (5 px CSS), les MÊMES pour toutes, près ou
   loin — la fumée se lit comme du pixel art, pas comme des tampons flous. On lit l'UV au CENTRE du gros pixel (dérivées : dFdx/dFdy), le
   bruit reste celui de la bouffée (6 × 6 cases) : rien ne scintille quand elle bouge. */
const BURN_FS_FUM='uniform float uY0;uniform vec3 uBleu;uniform float uPx;\n'+
  'varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+vSd*91.7)*43758.5453);}\n'+
  'void main(){if(vA<.003)discard;\n'+
  ' vec2 fc=(floor(gl_FragCoord.xy/uPx)+.5)*uPx-gl_FragCoord.xy;vec2 u=vUv+dFdx(vUv)*fc.x+dFdy(vUv)*fc.y;\n'+
  ' const float G=6.;vec2 c=floor(u*G);float d=length(u-.5)*2.;float r=h(c);\n'+
  ' if(d>.7+.3*r)discard;\n'+                       // le bord dentelé : une bouffée ronde, en cases
  ' if(r<vG*vG*.9)discard;\n'+                      // elle s'émiette case par case en vieillissant
  ' float dens=(1.-d*d*.55)*(.8+.2*h(c+7.3));\n'+
  ' vec3 col=vC*(.74+.34*u.y);\n'+                  // la lumière vient d'en haut
  ' float yb=clamp(1.-(vY-uY0)/1.7,0.,1.);col=mix(col,uBleu,yb*.32*(1.-u.y*.6));\n'+ // au ras du sol, l'anneau du plateau la bleuit
  ' gl_FragColor=vec4(col,vA*dens);}';
const BURN_FS_FEU='varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}';
function burnPool(N,additif,frag){
  const base=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();
  g.index=base.index;g.setAttribute('position',base.attributes.position);g.setAttribute('uv',base.attributes.uv);
  const P=new Float32Array(N*3),A=new Float32Array(N),S=new Float32Array(N),G=new Float32Array(N),Sd=new Float32Array(N),C=new Float32Array(N*3);
  for(let i=0;i<N;i++){P[i*3+1]=-1e4;Sd[i]=Math.random();}
  const ia=function(a,n){const x=new THREE.InstancedBufferAttribute(a,n);x.setUsage(THREE.DynamicDrawUsage);return x;};
  g.setAttribute('iP',ia(P,3));g.setAttribute('iA',ia(A,1));g.setAttribute('iS',ia(S,1));g.setAttribute('iG',ia(G,1));
  g.setAttribute('iSd',new THREE.InstancedBufferAttribute(Sd,1));g.setAttribute('iC',ia(C,3));g.instanceCount=N;
  const m=new THREE.ShaderMaterial({uniforms:{uY0:{value:GARAGE_Y},uBleu:{value:new THREE.Color(.34,.8,1)},uPx:{value:5}},vertexShader:BURN_VS,fragmentShader:frag,
    transparent:true,depthWrite:false,blending:additif?THREE.AdditiveBlending:THREE.NormalBlending,extensions:{derivatives:true}});
  const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.renderOrder=additif?9:8;o.visible=false;scene.add(o);
  return {o:o,g:g,N:N,P:P,A:A,S:S,G:G,C:C,V:new Float32Array(N*3),age:new Float32Array(N).fill(1e9),life:new Float32Array(N).fill(1),
    s0:new Float32Array(N),s1:new Float32Array(N),op:new Float32Array(N),c0:new Float32Array(N*3),i:0,n:0,feu:!!additif};
}
function burnEmet(F,x,y,z,vx,vy,vz,life,s0,s1,op,r,gg,b){
  const i=F.i;F.i=(F.i+1)%F.N;const j=i*3;if(F===BURN.fum&&F.age[i]<F.life[i]&&F.A[i]>.05)BURN.brusque=(BURN.brusque|0)+1; // (le banc) une bouffée ENCORE VISIBLE reprise d'un coup
  F.P[j]=x;F.P[j+1]=y;F.P[j+2]=z;F.V[j]=vx;F.V[j+1]=vy;F.V[j+2]=vz;F.age[i]=0;F.life[i]=life;F.s0[i]=s0;F.s1[i]=s1;F.op[i]=op;
  F.c0[j]=r;F.c0[j+1]=gg;F.c0[j+2]=b;F.o.visible=true;
}
function burnPas(F,dt,t){ // fait vivre un réservoir : âge, mouvement, taille, opacité, couleur — rend le nombre de vivants
  const ay=GARAGE_Y,yMax=ay+GAR.H-.45,hw=GAR.W/2-.5,hd=GAR.D/2-.4;let n=0;
  const dr=Math.exp(-dt*(F.feu?2.4:1.15));
  for(let i=0;i<F.N;i++){
    const j=i*3;if(F.age[i]>=F.life[i]){if(F.P[j+1]>-1e3){F.P[j+1]=-1e4;F.A[i]=0;}continue;}
    n++;const a=F.age[i]+=dt,g=Math.min(1,a/F.life[i]);
    let vx=F.V[j]*dr,vy=F.V[j+1],vz=F.V[j+2]*dr;
    if(F.feu)vy=vy*dr-(F.arc?1.6:5.5)*dt;                             // les braises retombent (les pixels du chat flottent)
    else{vy+=(.38-vy)*Math.min(1,dt*.7);                              // la fumée MONTE, sans se presser
      vx+=Math.sin(t*.8+F.S[i]*3.1+F.P[j+1]*.9+i)*.34*dt;vz+=Math.cos(t*.67+i*.37+F.P[j]*.7)*.34*dt;} // et tourbillonne
    let x=F.P[j]+vx*dt,y=F.P[j+1]+vy*dt,z=F.P[j+2]+vz*dt;
    if(y>yMax){y=yMax;if(vy>0)vy=0;vx+=x*.05*dt;vz+=z*.05*dt;}         // sous le plafond, elle s'étale
    if(y<ay+.04){y=ay+.04;if(vy<0)vy*=F.feu?-.35:0;}
    if(x>hw||x<-hw){x=Math.max(-hw,Math.min(hw,x));vx*=-.3;}
    if(z>hd||z<-hd){z=Math.max(-hd,Math.min(hd,z));vz*=-.3;}
    F.P[j]=x;F.P[j+1]=y;F.P[j+2]=z;F.V[j]=vx;F.V[j+1]=vy;F.V[j+2]=vz;F.G[i]=g;
    if(F.arc){F.S[i]=F.s0[i];F.A[i]=(Math.random()<.2?0:1)*Math.pow(1-g,.7)*F.op[i];F.C[j]=F.c0[j];F.C[j+1]=F.c0[j+1];F.C[j+2]=F.c0[j+2];} // le chat : ils SCINTILLENT et gardent leur couleur
    else if(F.feu){F.S[i]=F.s0[i]*(1-.5*g);F.A[i]=Math.pow(1-g,1.4)*F.op[i];
      F.C[j]=F.c0[j]+(1-F.c0[j])*g*.2;F.C[j+1]=F.c0[j+1]*(1-.75*g);F.C[j+2]=F.c0[j+2]*(1-.9*g);}   // blanc-jaune → orange → rouge
    else{F.S[i]=F.s0[i]+(F.s1[i]-F.s0[i])*(1-Math.exp(-a*.55));
      F.A[i]=Math.min(1,a/.25)*Math.pow(1-g,1.3)*F.op[i];
      if(F===BURN.fum&&BURN.hor&&a>.6*BURN.hor)F.A[i]*=Math.max(0,1-(a-.6*BURN.hor)/(.4*BURN.hor)); // près d'être reprise : elle s'efface (L'HORIZON)
      const w=Math.max(0,Math.min(1,(z-4)/8))*.5;                     // près de la porte, le feu la rosit
      F.C[j]=F.c0[j]+(1-F.c0[j])*w;F.C[j+1]=F.c0[j+1]+(.6-F.c0[j+1])*w;F.C[j+2]=F.c0[j+2]+(.46-F.c0[j+2])*w;}
  }
  F.n=n;const at=F.g.attributes;at.iP.needsUpdate=true;at.iA.needsUpdate=true;at.iS.needsUpdate=true;at.iG.needsUpdate=true;at.iC.needsUpdate=true;
  if(!n)F.o.visible=false;
  return n;
}
function burnMonde(x,y,z,out){out.set(x,y,z);carGroup.localToWorld(out);return out;} // un point de la caisse, dans la salle
/* LA FUMÉE QUI S'EFFACE (2026-10-08, Léo : « la fumée disparaît progressivement ; là, à un certain niveau, il y en a qui disparaît très
   rapidement — équilibre : que le joueur puisse faire pas mal de fumée, mais que ce ne soit pas trop facile de tout remplir »). Le réservoir
   recyclait la plus vieille bouffée d'un coup : avec 320 bouffées et ~116 par seconde quand les pneus sont chauds, une bouffée vivait 2,8 s
   au lieu de ses 6-10 s, et DISPARAISSAIT d'une image à l'autre. Désormais `N` bouffées, et L'HORIZON : le débit lissé (`BURN.deb`) dit dans
   combien de temps une bouffée sera reprise (`BURN.hor` ≈ ,92 N / débit — il raccourcit vite, s'allonge lentement) ; passé 60 % de cet
   horizon elle s'EFFACE, et n'est plus là quand on la reprend. Au repos du pied, l'horizon dépasse sa vie : rien ne change. Au plus fort, ~4 s
   de fumée visible : beaucoup, sans remplir tout l'atelier. */
const BURN_FUM={N:680,deb:[60,90]}; // (2026-10-08, Léo : « un peu plus de fumée ») débit ×1,3 (46 + 70·chaud → 60 + 90·chaud bouffées/s) ET réservoir ×1,3 (520 → 680) : ~30 % de fumée en plus à l'écran, le même horizon (~4 s au plus fort) — pas plus facile de remplir l'atelier
function burnPools(){ // les réservoirs (la fumée en pixels, le feu, les pixels du chat, les cubes blancs) — créés par la chauffe de l'atelier : rien ne compile au 1er burn-out
  if(!BURN.fum){BURN.fum=burnPool(BURN_FUM.N,false,BURN_FS_FUM);BURN.feu=burnPool(180,true,BURN_FS_FEU);}
  if(!BURN.pix){BURN.pix=burnPool(520,true,BURN_FS_FEU);BURN.pix.arc=true;} // (2026-10-06) les PIXELS du chat pop-tart (voir NY_PIX)
  burnCubesInit();
  return [BURN.fum.o,BURN.feu.o,BURN.pix.o].concat(BURN.gr.M);
}
function burnPrepare(){ // à chaque départ : les essieux de l'arrière, les pneus, les pots — la caisse a pu changer
  burnPools();
  BURN.ar=ESSIEUX.filter(function(E){return E.position.z<0;});
  BURN.roues=[];
  for(const w of wheels)if(w.position.z<0)BURN.roues.push({x:w.position.x,y:w.position.y-(w.userData.R||.4),z:w.position.z,R:w.userData.R||.4,l:w.userData.large||.3});
  const G=garGabarit();
  if(!BURN.roues.length)for(const sx of [-1,1])BURN.roues.push({x:sx*G.b*.75,y:0,z:-G.a*.6,R:.4,l:.3});
  if(!BURN.ar.length)BURN.arW=wheels.filter(function(w){return w.position.z<0&&w.parent;});else BURN.arW=[];
  const px=Math.min(.42,G.b*.32);BURN.pots=[[-px,.3,-G.a+.08],[px,.3,-G.a+.08]];
  BURN.drz=Math.min(.9,G.a*.4);BURN.rr=Math.hypot(G.a,G.b);BURN.ga=G.a;BURN.gb=G.b; // le PIVOT du dérapage (vers l'avant : l'arrière balaie) · le rayon de la caisse
  BURN.Rs=Math.min(4.4,BURN.drz*(2-DON_PIV.donMax)+DON_PIV.glisse+BURN.rr+.2); // (le donut) le cercle le plus large que balaie un coin (pivot devant, glisse comprise) — la vue recule pour le cadrer (`garBurnR`)
  burnGommeInit();
}
/* LA PISTE DE GOMME (même soir, avec le DÉRAPAGE) : une toile de 128 × 128 sur tout le plateau (un texel ≈ 7 cm : des traces en PIXELS),
   posée sur `GAR.pod` (elle tourne avec lui) ; chaque image de burn-out, les roues arrière y déposent de la gomme là où elles SONT — sur place
   ça noircit sous les pneus, en dérapage ça dessine les DONUTS. Elle s'efface en ~45 s (alpha décrémenté une fois par seconde : la
   composition `destination-out` resterait bloquée par l'arrondi sur 8 bits). */
function burnGommeInit(){
  if(BURN.gom||!GAR.pod)return;const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  const tex=new THREE.CanvasTexture(cv);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  const m=new THREE.Mesh(new THREE.CircleGeometry(4.4,48),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:.9}));
  m.rotation.x=-Math.PI/2;m.position.y=GAR.POD+.004;m.renderOrder=1;GAR.pod.add(m);
  BURN.gom={cv:cv,x:x,tex:tex,m:m,N:N,sale:false,tF:0};
}
/* LA GOMME DU TAIL WHIP (2026-10-22, Sacha : « une trace de pneus sur le sol, comme pour les donuts ») : l'essai d'une figure À PLAT à l'inventaire pose la
   caisse sur le plateau ; les QUATRE pneus y laissent la même gomme que le donut (même toile), d'un point à l'autre (rien ne saute quand ça va vite). */
const GFGOM={p:null};
function garFigGomme(dt,marque){
  if(!GAR.pod)return;if(!BURN.gom)burnGommeInit();const G=BURN.gom;if(!G)return;
  if(!marque){GFGOM.p=null;return;}
  GAR.pod.updateMatrixWorld();const L=[];
  for(const w of wheels){if(!w||!w.position)continue;const R=w.userData.R||.4,v=new THREE.Vector3(w.position.x,w.position.y-R+.02,w.position.z);carGroup.localToWorld(v);GAR.pod.worldToLocal(v);L.push([v.x,v.z,Math.max(2,Math.round((w.userData.large||.3)/.069))]);}
  const P=GFGOM.p;GFGOM.p=L;
  G.x.fillStyle='rgba(12,9,14,.42)';
  for(let i=0;i<L.length;i++){const a=P&&P.length===L.length?P[i]:L[i],b=L[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05));
    for(let k=1;k<=n;k++){const t=k/n,px=((a[0]+(b[0]-a[0])*t)/8.8+.5)*G.N,py=((a[1]+(b[1]-a[1])*t)/8.8+.5)*G.N;G.x.fillRect(Math.round(px-b[2]/2),Math.round(py-b[2]/2),b[2],b[2]);}}
  G.sale=true;G.tex.needsUpdate=true;
}
function burnGomme(dt){
  const G=BURN.gom;if(!G)return;
  if(BURN.k>.25&&!GAR.go&&BURN.roues.length){GAR.pod.updateMatrixWorld();
    G.x.fillStyle='rgba(12,9,14,'+(.1+.14*BURN.k).toFixed(3)+')';
    for(const r of BURN.roues){const w=burnMonde(r.x,r.y+.02,r.z,BURN.q);GAR.pod.worldToLocal(w);
      const px=(w.x/8.8+.5)*G.N,py=(w.z/8.8+.5)*G.N,t9=Math.max(2,Math.round(r.l/.069));G.x.fillRect(Math.round(px-t9/2),Math.round(py-t9/2),t9,t9);}
    G.sale=true;G.tex.needsUpdate=true;}
  G.tF+=dt;if(G.sale&&G.tF>1){G.tF=0;const im=G.x.getImageData(0,0,G.N,G.N),d=im.data;let reste=0;
    for(let i=3;i<d.length;i+=4)if(d[i]){d[i]=Math.max(0,d[i]-5);reste|=d[i];}
    G.x.putImageData(im,0,0);G.tex.needsUpdate=true;if(!reste)G.sale=false;}
}
function burnPop(f){ // une PÉTARADE : du feu en pixels qui crache des pots, et une bouffée sombre
  if(!BURN.feu||!BURN.pots.length)return;
  const fw=BURN.u.set(Math.sin(carGroup.rotation.y),0,Math.cos(carGroup.rotation.y));
  for(const p of BURN.pots){const o=burnMonde(p[0],p[1],p[2],BURN.q);
    const n=Math.round(10+14*f);for(let i=0;i<n;i++){const v=3+Math.random()*5*f;
      if(NYAN.on&&BURN.pix){const c=nyanPixC();burnEmet(BURN.pix,o.x,o.y,o.z,-fw.x*v+(Math.random()-.5)*2,.4+Math.random()*1.6,-fw.z*v+(Math.random()-.5)*2,.4+Math.random()*.45,.07+Math.random()*.06,0,1,c[0],c[1],c[2]);continue;} // le chat pétarade en PIXELS
      burnEmet(BURN.feu,o.x,o.y,o.z,-fw.x*v+(Math.random()-.5)*1.6,.3+Math.random()*1.3,-fw.z*v+(Math.random()-.5)*1.6,.2+Math.random()*.26,.12+Math.random()*.12,0,1,1,.86+Math.random()*.14,.5+Math.random()*.35);}
    burnEmet(BURN.fum,o.x,o.y,o.z,-fw.x*1.4,.3,-fw.z*1.4,2.8+Math.random()*1.5,.28,.8,.3,.42,.4,.47);}
}
/* (2026-10-07, Léo : « il n'y a que les voitures qu'on possède qui peuvent faire le burn-out ») — la caisse du plateau doit être À TOI ou
   celle que tu as ÉQUIPÉE ; sinon le doigt tenu ne fait pas partir le moteur : le cadenas parle et le relâcher est avalé. */
try{Object.assign(I18N,{'PAS ENCORE À TOI':'NOT YOURS YET'});}catch(e){}
function burnPermis(){const i=garageI|0;return carUnlockedVrai(i)||i===equippedCar();}
function burnRefus(){ // le doigt a tenu sur une caisse qui n'est pas à toi
  uiClic('refus');toast(pxi('verrou')+' '+TR('PAS ENCORE À TOI'));
  const b=[$('gBuy'),$('gEquip')].find(function(x){return x&&x.offsetParent;});if(b)gSecoue(b);else hap([8,40,8]);
}
function burnDebut(e){ // pointerdown : le doigt se pose sur la caisse
  if(BURN.hold||GAR.go||GAR.sw||!garAtelierLibre()||(INV&&INV.on)||GATL.on)return; /* (2026-10-12) l'ATELIER FERMÉ : la caisse tenue par les pinces se tourne, c'est tout */ /* (2026-10-06) aussi dans la console de Sacha */
  if(e.button>0||!garSurCaisse(e))return;
  BURN.hold={id:e.pointerId,x:e.clientX,y:e.clientY,t0:performance.now(),non:!burnPermis()};BURN.bouge=false; // `non` : pas à toi, pas de burn-out
}
function burnPart(){ // ça part : le doigt a tenu
  if(BURN.on)return;burnPrepare();BURN.on=true;BURN.t=0;BURN.pops.length=0;BURN.corps=true;
  BURN.acc=BURN.n=0;BURN.fA=null;BURN.tx=null;BURN.th=null;BURN.sT=BURN.sAu=BURN.kc=BURN.mc=0;BURN.fsOk=false;if(BURN.pivK<.01)BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;try{burnCentre();}catch(_){} // (le donut) le centre du VOLANT du doigt : le milieu du plateau, à l'écran
  hap([14,30,10]);try{burnPop(.75);burnAnneau(.5);}catch(_){} // (2026-10-08) le départ se VOIT : une pétarade et un anneau de fumée
  if(!((SAVE.d.ast|0)&8)){SAVE.d.ast=(SAVE.d.ast|0)|8;try{SAVE.mark();}catch(_){}if(gEl)gEl.classList.remove('aideInv');} // l'astuce a servi
}
function burnFin(){ // le doigt se lève (ou la vitrine se ferme) : le moteur retombe en pétaradant
  const etait=BURN.on;BURN.hold=null;BURN.on=false;BURN.auto=0;BURN.autoW=0;BURN.nitro=BURN.recul=false;
  if(etait){const n=performance.now();BURN.pops=[n+70,n+250,n+450,n+720].slice(0,2+Math.round(2*Math.min(1,BURN.t/1.5)));}
}
function burnCoupe(){ // l'atelier se ferme : silence, plus rien à l'écran
  burnFin();BURN.k=0;BURN.rpm=0;BURN.pops.length=0;
  if(BURN.yaw){garageAng-=BURN.yaw;GAR.podSpin=(GAR.podSpin||0)-BURN.yaw;}BURN.yaw=BURN.yawV=BURN.cib=BURN.pivK=0;BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;BURN.chg=BURN.nk=BURN.rk=0;BURN.dzP=null;burnBtnsVoir(false);
  BURN.don=BURN.donK=BURN.donM=BURN.acc=BURN.n=BURN.cad=BURN.feuxK=0;const bt=document.getElementById('gBurnTxt');if(bt)bt.classList.remove('on','on2');
  for(const F of [BURN.fum,BURN.feu,BURN.pix])if(F){F.age.fill(1e9);burnPas(F,0,0);F.o.visible=false;}
  if(BURN.gr)for(const im of BURN.gr.M){im.count=0;im.visible=false;}
  if(BURN.corps){carBody.rotation.set(0,0,0);carBody.position.set(0,0,0);BURN.corps=false;}
  if(AC&&BURN.son){const T=AC.currentTime;stt(gainN.gain,0,T,.06);stt(engLfoG.gain,0,T,.06);if(skidG)stt(skidG.gain,0,T,.05);BURN.son=false;}
}
const BURN_DOIGT=false; // (2026-10-08, Léo : « ce n'est plus le doigt qui agit sur la fumée, mais bien la voiture elle-même ») le GLISSÉ ne la pousse plus (`true` le rend) — voir LA CAISSE DANS LA FUMÉE
const BURN_SOUFFLE={on:true,vieillit:.45}; // (même soir, Léo : « quand on tapote avec le doigt, ça disperse la fumée ») le TAP revient seul : il souffle la fumée sous le doigt (elle s'écarte du point touché, file un peu vers le fond, monte) et la DISPERSE — chaque bouffée touchée avance vers la fin de sa vie de `vieillit` × ce qui lui reste (× la force du coup) : elle s'éclaircit et s'émiette au lieu de seulement bouger
function burnDoigt(cx,cy,dx,dy,souffle){ // le DOIGT dans la fumée : il la pousse (glissé) ou la souffle (tap)
  if(souffle?!BURN_SOUFFLE.on:!BURN_DOIGT)return false;
  const F=BURN.fum;if(!F||!F.n)return false;
  const o=camera.position,v=BURN.v.set(cx/VP.w*2-1,-(cy/VP.h)*2+1,.5).unproject(camera).sub(o).normalize();
  const R=BURN.r.setFromMatrixColumn(camera.matrixWorld,0),U=BURN.w.setFromMatrixColumn(camera.matrixWorld,1);
  const tg=Math.tan(camera.fov*Math.PI/360)*2/Math.max(1,VP.h);let touche=0;
  for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3;
    const px=F.P[j]-o.x,py=F.P[j+1]-o.y,pz=F.P[j+2]-o.z,t=px*v.x+py*v.y+pz*v.z;if(t<.4)continue;
    const qx=px-v.x*t,qy=py-v.y*t,qz=pz-v.z*t,d=Math.sqrt(qx*qx+qy*qy+qz*qz),rad=.9+.09*t+F.S[i]*.5;if(d>rad)continue;
    const f=1-d/rad;touche++;
    if(souffle){const k=3.2*f/Math.max(.05,d);F.V[j]+=qx*k+v.x*f*1.8;F.V[j+1]+=qy*k+v.y*f*1.8+.4*f;F.V[j+2]+=qz*k+v.z*f*1.8;F.age[i]+=(F.life[i]-F.age[i])*BURN_SOUFFLE.vieillit*f;}
    else{const k=f*t*tg*9;F.V[j]+=(R.x*dx-U.x*dy)*k;F.V[j+1]+=(R.y*dx-U.y*dy)*k;F.V[j+2]+=(R.z*dx-U.z*dy)*k;}}
  return touche>0;
}
/* LE DOIGT QU'ELLE SUIT — LES DONUTS (2026-10-08, sur le premier burn-out ; même lecture du doigt que la veille). Trois lectures du doigt,
   mélangées : (1) LE VOLANT — l'angle du doigt AUTOUR DU MILIEU DU PLATEAU, tour pour tour (le bout de la caisse le plus près du doigt le
   suit ; près du milieu, sous `DON.plein` px, la direction du trait le remplace) ; (2) LE DONUT À LA VITESSE DU DOIGT — le doigt qui tourne
   SUR LUI-MÊME ailleurs (un petit cercle, n'importe où) la fait tourner dans son sens à `DON.kv` rad par px parcouru ; (3) LE GLISSÉ
   D'ORIGINE (,009 rad par px, `DON.derape`) — ce qui ne tourne ni autour d'elle ni sur lui-même : le dérapage du premier burn-out. Le doigt
   ne pose qu'un CAP (`BURN.cib`) : c'est le ressort d'origine (burnDerape) qui la fait tourner, part, dépasse et revient. */
const BURN_GLISSE=24; // tenu 0,8 s, un pouce posé GLISSE de plus de 12 px : pendant la charge on tolère 24 px (une fois parti, 12 px = « le doigt bouge »)
const BURN_TENU=950;  // (Léo, 2026-10-07/08) le maintien qui déclenche le burn-out : 280 ms → 500 → 1 500 → 1 000 → 800 → 950 (même soir, Léo : « dès qu'on appuie longtemps, ça fait le burn, même quand on tourne la voiture — ça prend un tout petit peu plus de temps, mais ça se voit et se ressent plus » : voir LA CHARGE)
const DON={mort:16,plein:44,gain:1,kv:1/70,avance:1.6,derape:.009,pitch:.06};
function burnCentre(){ // le centre du VOLANT : le milieu du plateau, à mi-hauteur de caisse, à l'écran
  const v=BURN.c;if(GAR.pod)GAR.pod.getWorldPosition(v);else carGroup.getWorldPosition(v);v.y=GARAGE_Y+.55;v.project(camera);
  BURN.scx=(v.x*.5+.5)*VP.w;BURN.scy=(.5-v.y*.5)*VP.h;
}
function burnVolant(v){ // le volant bridé : jamais plus de `avance` rad devant la caisse (ce qui dépasse est perdu, rien ne tourne longtemps après le doigt)
  const e=BURN.cib-BURN.yaw;if(v>0)v=Math.max(0,Math.min(v,DON.avance-e));else if(v<0)v=Math.min(0,Math.max(v,-DON.avance-e));BURN.cib+=v;
}
function burnSol(cx,cy){ // (2026-10-08) où le doigt touche le PLATEAU (à mi-hauteur de caisse), dans le repère de la caisse au repos (celui de `burnDerape`)
  const v=BURN.sv||(BURN.sv=new THREE.Vector3()),o=BURN.so||(BURN.so=new THREE.Vector3()),p=BURN.sp||(BURN.sp=new THREE.Vector3());
  v.set(cx/VP.w*2-1,1-cy/VP.h*2,.5).unproject(camera);camera.getWorldPosition(o);v.sub(o);if(v.y>-1e-4||!GAR.pod)return;
  const t=(GARAGE_Y+.55-o.y)/v.y;GAR.pod.getWorldPosition(p);const dx=o.x+v.x*t-p.x,dz=o.z+v.z*t-p.z,r=garRot(),cr=Math.cos(r),sr=Math.sin(r);
  BURN.fsx=dx*cr-dz*sr;BURN.fsz=dx*sr+dz*cr;BURN.fsOk=true;
}
function burnGeste(dx,dy,cx,cy){ // le doigt bouge pendant le burn-out (dx, dy : depuis le mouvement d'avant ; cx, cy : où il est)
  const n=performance.now();try{burnCentre();burnSol(cx,cy);}catch(_){} // le milieu du plateau à l'écran (la vue recule pendant le donut)
  const rx=cx-BURN.scx,ry=cy-BURN.scy,r=Math.hypot(rx,ry),a=Math.atan2(ry,rx);
  const w=BURN.fA==null?0:Math.max(0,Math.min(1,(Math.min(r,BURN.fR)-DON.mort)/(DON.plein-DON.mort)));
  const dA=BURN.fA==null?0:Math.atan2(Math.sin(a-BURN.fA),Math.cos(a-BURN.fA));BURN.fA=a;BURN.fR=r;
  const ds=Math.hypot(dx,dy),tg=Math.min(1,Math.abs(dA)*r/Math.max(1e-3,ds));   // la part du geste qui TOURNE autour du plateau
  if(BURN.tx==null){BURN.tx=cx;BURN.ty=cy;BURN.th=null;}
  const sx=cx-BURN.tx,sy=cy-BURN.ty;let dT=0;
  if(sx*sx+sy*sy>=16){const h=Math.atan2(sy,sx);                         // LE TRAIT, tous les 4 px
    if(BURN.th!=null){dT=Math.atan2(Math.sin(h-BURN.th),Math.cos(h-BURN.th));if(Math.abs(dT)>2.2)dT=0;} // un aller-retour n'est pas un virage
    BURN.th=h;BURN.tx=cx;BURN.ty=cy;}
  const dtm=Math.min(.25,(n-(BURN.tT||n))/1000),e9=Math.exp(-dtm/.3);BURN.tT=n;
  BURN.sT*=e9;BURN.sAu*=e9;const aT=Math.abs(BURN.sT);                    // ce que le trait a tourné, et le doigt autour d'elle, sur ~0,3 s
  const kT=Math.max(0,Math.min(1,(aT-.45)/.4)),gT=aT>.05?Math.max(0,Math.min(1,(Math.abs(BURN.sAu)/aT-.35)/.4)):1; // le trait TOURNE · … autour d'elle
  BURN.kc+=(kT-BURN.kc)*Math.min(1,dtm/.12);BURN.mc+=(kT*(1-gT)-BURN.mc)*Math.min(1,dtm/.12); // jugés AVANT ce pas (un coin n'est pas un cercle)
  const k=BURN.kc,m=BURN.mc;
  BURN.sT+=Math.max(-.35,Math.min(.35,dT));BURN.sAu+=dA;
  const P=dA*w+dT*(1-w),S=(BURN.sT<0?-1:1)*ds*DON.kv;                     // (1) le volant · (2) la vitesse du doigt
  const v=-((1-m)*P+m*S)*DON.gain;if(v)burnVolant(v);                     // le doigt dans le sens des aiguilles (à l'écran) = la caisse aussi, vue d'en haut
  BURN.cib+=dx*DON.derape*(1-w*tg)*(1-k);                                // (3) LE GLISSÉ D'ORIGINE : elle DÉRAPE — et tout, près du centre
}
function garBurnR(x){const c=BURN.cad||0;return c>.001?x+(Math.max(x,BURN.Rs*.92)-x)*c:x;} // le recul de l'atelier : en donut, le cercle balayé tient dans la place libre
function burnTxt(txt,col,lent){ // un mot qui jaillit au-dessus de la caisse, et s'envole
  let e=document.getElementById('gBurnTxt');
  if(!e){e=document.createElement('div');e.id='gBurnTxt';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  let r=null;try{r=garCaisseRect();}catch(_){}
  const x=r?(r.x0+r.x1)/2:VP.w/2,y=r?Math.max(40,r.y0-8):VP.h*.4;
  e.textContent=TR(txt);e.style.setProperty('--bc',col||'#ffd75e');e.style.left=Math.round(Math.max(60,Math.min(VP.w-60,x)))+'px';e.style.top=Math.round(y)+'px';
  e.classList.toggle('lent',!!lent);e.classList.toggle('calme',!!REDUCED_MOTION);
  const k=burnTxt._k=!burnTxt._k;e.classList.remove(k?'on':'on2');e.classList.add(k?'on2':'on'); // deux animations jumelles : relance sans remise en page
}
function burnAnneau(f){ // un ANNEAU de fumée en pixels qui s'ouvre autour de la caisse
  const F=BURN.fum;if(!F)return;const c=BURN.c;carGroup.updateMatrixWorld();carGroup.getWorldPosition(c);
  const N=Math.round(16*f),R=BURN.rr*.65;
  for(let i=0;i<N;i++){const a=(i+Math.random()*.4)/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),v=(2.4+Math.random()*1.2)*f;
    burnEmet(F,c.x+ca*R,GARAGE_Y+.3,c.z+sa*R,ca*v,.12+Math.random()*.3,sa*v,3+Math.random()*1.6,.38,1.2+.4*f,.24,.8,.78,.88);}
}
function burnBravo(){ // un tour complet : le mot, l'anneau, la pétarade, le pouce
  const n=performance.now(),N=BURN.n;
  burnTxt(N>1?TR('DONUT')+' ×'+N:'DONUT !',N>=5?'#ff7ad9':N>=3?'#ff9a3c':'#ffd75e');burnAnneau(Math.min(1.5,.75+.12*N));BURN.pops.push(n+30);hap([10,24,10]);
  if(!((SAVE.d.ast|0)&16)){SAVE.d.ast=(SAVE.d.ast|0)|16;try{SAVE.mark();}catch(_){}} // le 1er donut : l'astuce a servi
  BURN.pops.sort(function(a,b){return a-b;});
}
function burnTours(dt){ // compte les tours complets du donut (dans un sens : repartir dans l'autre recommence le compte)
  if(BURN.donK>.12&&BURN.on){const sg=Math.sign(BURN.don);if(BURN.acc&&Math.sign(BURN.acc)!==sg){BURN.acc=0;BURN.n=0;}
    BURN.acc+=BURN.yawV*dt;BURN.nT=0;
    if(Math.abs(BURN.acc)>=2*Math.PI){BURN.acc-=sg*2*Math.PI;BURN.n++;burnBravo();}}
  else{BURN.nT+=dt;if(BURN.nT>.9){BURN.acc=0;BURN.n=0;}}
}
Object.assign(I18N,{'DONUT !':'DONUT!','TOURNE AUTOUR · DONUT':'CIRCLE AROUND · DONUT'});
/* LE VOLUME DE LA FUMÉE (2026-10-08, Léo : « les cubes blancs ne doivent pas être une entité séparée de la première fumée : qu'ils
   l'ENRICHISSENT, pour lui donner du volume — sinon ça fait deux fumées différentes ; une seule, avec les deux »). Les cubes n'ont plus de
   vie à eux : chaque image, chaque BOUFFÉE en pixels vivante porte en elle `BURN_CUB.par` petits cubes — placés DANS sa boule (des
   écarts tirés de sa graine, donc fixes pour elle : ils bougent avec elle), à SA couleur (le rose de la porte, le bleu du plateau au ras du
   sol compris), à SA transparence (une bande d'opacité par cran de son alpha) et à sa taille (un cinquième de la bouffée, ≤ 30 cm, sur une
   grille de 6 cm : des pixels en volume) ; quand la bouffée s'ÉMIETTE case par case, ses cubes s'en vont avec elle, par la même règle
   (hachage < âge² × ,9). Ombrés comme les flammes de la porte (dessus clair, flancs, dessous sombre) : la lumière d'en haut de la fumée.
   La même matière que les cubes de la porte : rien de compilé. */
const BURN_CUB={par:3,N:700,bandes:[.36,.26,.18,.12,.07],seuils:[.27,.19,.13,.085,.045],taille:[.24,.19,.15]};
function burnCubesInit(){
  if(BURN.gr)return;const bx=new THREE.BoxGeometry(1,1,1),ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
  for(let i=0;i<ps.count;i++){const v=nm.getY(i)>.5?1.06:nm.getY(i)<-.5?.6:Math.abs(nm.getX(i))>.5?.8:.9;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;}
  bx.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const M=[];for(const op of BURN_CUB.bandes){const im=new THREE.InstancedMesh(bx,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false,transparent:true,opacity:op,depthWrite:false}),BURN_CUB.N);
    im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(BURN_CUB.N*3),3);im.count=0;im.frustumCulled=false;im.renderOrder=8;im.visible=false;scene.add(im);M.push(im);}
  BURN.gr={M:M,n:new Int32Array(M.length),m:new THREE.Matrix4()};
}
function burnCubes(){ // chaque image : les cubes DE la fumée, tirés des bouffées vivantes
  const G=BURN.gr,F=BURN.fum;if(!G)return;const Q=BURN_CUB,n=G.n,m=G.m,nb=G.M.length,y0=GARAGE_Y;n.fill(0);
  if(F&&F.o.visible){const sd=F.g.attributes.iSd.array;
    for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const A=F.A[i];let b=-1;for(let q=0;q<nb;q++)if(A>Q.seuils[q]){b=q;break;}if(b<0)continue;
      const j=i*3,s=F.S[i],g=F.G[i],q=sd[i],yb=Math.max(0,Math.min(1,1-(F.P[j+1]-y0)/1.7))*.28;
      const r=F.C[j]+(.34-F.C[j])*yb,gg=F.C[j+1]+(.8-F.C[j+1])*yb,bl=F.C[j+2]+(1-F.C[j+2])*yb; // sa couleur (au ras du sol, le bleu du plateau)
      for(let c=0;c<Q.par;c++){let h=Math.sin(q*91.7+c*12.9898)*43758.5453;h-=Math.floor(h);if(h<g*g*.9)continue; // il s'émiette AVEC elle
        const a1=q*6.283+c*2.094,rr=s*(.08+.17*((h*7.3)%1)),S=Math.min(.3,s*Q.taille[c]),gp=.06;
        const x=F.P[j]+Math.cos(a1)*rr,y=F.P[j+1]+(((h*3.1)%1)-.45)*s*.3,z=F.P[j+2]+Math.sin(a1)*rr;
        const bb=Math.min(nb-1,b+(c>1?1:0)),im=G.M[bb],k=n[bb];if(k>=Q.N)continue;            // le plus petit, un cran plus pâle
        m.makeScale(S,S,S);const e=m.elements;e[12]=Math.round(x/gp)*gp;e[13]=Math.round(y/gp)*gp;e[14]=Math.round(z/gp)*gp;im.setMatrixAt(k,m);
        const ca=im.instanceColor.array;ca[k*3]=r;ca[k*3+1]=gg;ca[k*3+2]=bl;n[bb]=k+1;}}}
  for(let b=0;b<nb;b++){const im=G.M[b];im.count=n[b];im.visible=n[b]>0;if(n[b]){im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}}
}
/* LA CAISSE DANS LA FUMÉE (2026-10-08, Léo : « ce n'est plus le doigt qui agit sur la fumée, mais bien la voiture elle-même »). Chaque image,
   la carrosserie (une boîte à sa taille, `garGabarit`, élargie de `m`) agit sur les bouffées qu'elle touche : (1) elle les ÉCARTE — une
   bouffée entrée dans la boîte en sort par la face la plus proche, d'autant plus vite qu'elle y est enfoncée (la fumée ne traverse plus la
   caisse) ; (2) elle les ENTRAÎNE — la vitesse de la carrosserie à cet endroit (son glissement + sa ROTATION : ω × r, plus vive au bout de la
   caisse qu'au pivot) passe dans la bouffée : en dérapage la poupe la balaie, en donut la caisse la fait tourner autour d'elle. Les cubes
   du volume suivent leurs bouffées. */
const BURN_CAISSE={suit:.65,pousse:3.5};
const BURN_NUAGE={arriere:3,v0:2.2,v1:2,cote:.7,flanc:.3,fa0:.3,fa1:1.1,fc0:1.4,fc1:1.6}; // (même soir, Léo : « de la fumée aussi sur le côté ») 30 % des bouffées sortent PAR LE FLANC de leur roue (1,4-3 m/s vers l'extérieur, ,3-1,4 vers l'arrière : deux panaches de côté, comme un vrai burn-out), les autres comme avant (côté ≤ ,7), et la poupe ne pousse plus que ×3 vers l'arrière (×4). Avant : (2026-10-08, Léo : « le nuage plus orienté vers l'arrière, mais c'est bien un peu sur le côté ») MESURÉ avant : les jeunes bouffées filaient à 1,7 m/s sur le côté pour 0,55 vers l'arrière (la caisse les sortait par ses flancs, les roues y sont) — à l'arrière de la caisse la sortie penche ×4 vers l'arrière ; au pneu, lancées à 2,2-4,2 m/s vers l'arrière et ≤ ,55 m/s sur le côté (c'était 1,5-3,2 et ≤ ,9) // (même jour, Léo : « pas autant que le doigt, mais assez pour que ça ait du dynamisme ») la fumée prend 65 % de la vitesse de la carrosserie (elle la balaie sans la coller), et en est écartée en douceur
function burnCaisse(dt){
  const F=BURN.fum;if(!F||!F.o.visible||!(dt>0)||!carGroup.visible)return;
  carGroup.updateMatrixWorld();const p=carGroup.getWorldPosition(BURN.w),ry=carGroup.rotation.y;
  if(!BURN.cp0){BURN.cp0=new THREE.Vector3().copy(p);BURN.cr0=ry;return;}
  const vx=Math.max(-12,Math.min(12,(p.x-BURN.cp0.x)/dt)),vz=Math.max(-12,Math.min(12,(p.z-BURN.cp0.z)/dt));
  let dr=ry-BURN.cr0;dr=Math.atan2(Math.sin(dr),Math.cos(dr));const w=Math.max(-14,Math.min(14,dr/dt));BURN.cp0.copy(p);BURN.cr0=ry;
  if(GAR.go)return;
  let G=null;try{G=garGabarit();}catch(_){}if(!G||!G.a)return;
  const sc=carGroup.scale.x||1,m=.35,ha=G.a*sc+m,hb=G.b*sc+m,ht=p.y+(G.H||1.3)*sc+.25,R2=(ha*ha+hb*hb),c=Math.cos(ry),sn=Math.sin(ry),ke=Math.min(1,dt*6),K9=BURN_CAISSE;
  for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3,dx=F.P[j]-p.x,dz=F.P[j+2]-p.z;
    if(dx*dx+dz*dz>R2||F.P[j+1]>ht)continue;
    const lx=dx*c-dz*sn,lz=dx*sn+dz*c,qx=hb-Math.abs(lx),qz=ha-Math.abs(lz);if(qx<=0||qz<=0)continue; // dehors : rien
    const f=Math.min(1,Math.min(qx,qz)/m);                                 // enfoncée de combien
    const wx=1/(qx+.05),wz=(lz<0?BURN_NUAGE.arriere:1)/(qz+.05),sx=lx<0?-1:1,sz=lz<0?-1:1,nl=Math.hypot(wx,wz); // la face la plus proche — et, à l'ARRIÈRE de la caisse, surtout l'arrière (le nuage part derrière)
    const nx=(sx*wx*c+sz*wz*sn)/nl,nz=(-sx*wx*sn+sz*wz*c)/nl;              // (repère caisse → salle)
    const cvx=(vx+w*dz)*K9.suit,cvz=(vz-w*dx)*K9.suit;                       // la carrosserie à cet endroit : glissement + rotation (ω × r) — la fumée en prend une PART
    const pu=(1.2+.35*Math.hypot(cvx,cvz))*f;                               // (1) elle l'écarte
    F.V[j]+=(cvx-F.V[j])*ke*f+nx*pu*ke*K9.pousse;F.V[j+2]+=(cvz-F.V[j+2])*ke*f+nz*pu*ke*K9.pousse; // (2) elle l'entraîne
    F.V[j+1]+=.25*f*ke;}
}
function burnTick(dt){ // chaque image du garage (après la pose de la caisse, avant la caméra)
  const now=performance.now(),t=now*.001;
  if(!BURN.pret){BURN.pret=true;try{chauffeRendu(burnPools());}catch(e){}} // (2026-10-08) à la 1re image du garage : la fumée en pixels et ses cubes compilés pendant l'entrée — la chauffe de l'atelier au menu ne tourne plus toujours (mesuré : jamais sur l'écran titre de la chute), et le 1er burn-out compilait
  if(BURN.hold&&!BURN.on&&!BURN.bouge&&now-BURN.hold.t0>BURN_TENU){if(!BURN.hold.non){const b9=!!BURN.hold.bouge;burnPart();if(b9){BURN.bouge=true;GAR.platW=0;}}else if(!BURN.hold.dit){BURN.hold.dit=1;burnRefus();}} // (2026-10-08) parti en tournant le plateau : le doigt qui bouge DÉRAPE aussitôt
  {const c9=BURN.hold&&!BURN.on&&!BURN.hold.non&&!GAR.go?Math.max(0,Math.min(1,(now-BURN.hold.t0-BURN_TENU*.25)/(BURN_TENU*.75))):0; // LA CHARGE : le dernier ¾ du maintien, le moteur monte
    if(c9>0&&!BURN.chg)burnPrepare(); // (2026-10-09) la charge démarre : les essieux de LA caisse du moment (elle a pu changer depuis le dernier burn-out) — sinon l'arrière ne patinait pas pendant la charge
    BURN.chg=c9>BURN.chg?c9:BURN.chg+(c9-BURN.chg)*Math.min(1,dt*6);
    if(c9>0&&!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+200-130*c9;hap(c9>.7?6:3);}}   // le pouce la sent venir : des tics de plus en plus serrés // (même soir) 0,28 s, (2026-10-08) 0,8 s : un glissé lent qui démarre doucement reste le PLATEAU
  if(BURN.auto>0&&dt>0){BURN.auto-=dt;if(BURN.autoW)burnVolant(BURN.autoW*dt);if(BURN.auto<=0)burnFin();} // (le banc) un doigt qui tourne à autoW rad/s
  if(GAR.go||!garAtelierLibre())if(BURN.on)burnFin();
  {const kc=BURN.on?1:BURN.chg*.42;BURN.k+=(kc-BURN.k)*Math.min(1,dt*(kc>BURN.k?5:2.6));if(BURN.k<.002&&!BURN.on&&!BURN.chg)BURN.k=0;} // (la charge) elle tremble déjà, les pneus patinent et fument un peu, les feux stop s'allument
  burnNitroTick(dt,now);
  if(BURN.on)BURN.t+=dt;
  BURN.chaud=Math.max(0,Math.min(1,BURN.chaud+(BURN.on?dt*.34:-dt*.22)));
  const k=BURN.k;
  burnDerape(dt);try{burnTours(dt);}catch(_){}
  if(BURN.on&&!BURN.bouge&&BURN.t>1.4&&!BURN.aideT&&!((SAVE.d.ast|0)&16)){BURN.aideT=1;burnTxt('TOURNE AUTOUR · DONUT','#b9a8ff',true);} // l'astuce, une fois par session, tant qu'aucun donut n'a tourné
  BURN.cad+=(((BURN.on||Math.abs(BURN.yawV)>1)&&!GAR.go?Math.max(BURN.donH||0,Math.min(1,BURN.pivK*Math.hypot(BURN.qx,BURN.qz)/1.2)):0)-BURN.cad)*Math.min(1,dt*(BURN.nk>.05||BURN.rk>.05?4.5:2.2)); /* (la nitro) elle bondit vers l'objectif : la vue recule aussi vite */if(BURN.cad<1e-3)BURN.cad=0; // en donut, la vue recule (garBurnR)
  BURN.feuxK=GAR.go?0:k;                                                  // on tient le frein : les feux stop s'allument (carVit)
  // LA CAISSE
  if(k>0&&!GAR.go){
    const sp=46*k*dt*(1+.6*BURN.nk)*(1-2*BURN.rk);for(const E of BURN.ar)E.rotation.x+=sp;for(const w of BURN.arW)w.rotation.x+=sp; // l'arrière patine, l'avant est planté — plus vite à la NITRO, à l'envers en MARCHE ARRIÈRE
    const tr=REDUCED_MOTION?.3:1;
    carBody.rotation.x=-.042*k+Math.sin(t*37)*.004*k*tr;               // le cul s'écrase, le nez se lève
    carBody.rotation.z=Math.sin(t*29+1.3)*.007*k*tr;                    // elle tremble sur ses pneus
    carBody.position.y=-.025*k+(Math.random()-.5)*.012*k*tr;
    carGroup.rotation.y+=Math.sin(t*2.3+Math.sin(t*5.1))*.036*k*tr;     // la poupe chasse
    BURN.corps=true;
    if(BURN.on&&!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+150;hap(4);}
  }else if(BURN.corps){carBody.rotation.set(0,0,0);carBody.position.set(0,0,0);BURN.corps=false;}
  // LA FUMÉE ET LE FEU
  if(k>.02&&BURN.fum&&!GAR.go){
    carGroup.updateMatrixWorld();
    const ry=carGroup.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);
    const db9=(BURN_FUM.deb[0]+BURN_FUM.deb[1]*BURN.chaud)*(1+BURN_NITRO.fumee*BURN.nk),av9=1-2*BURN.rk;BURN.tE+=dt*k*db9;BURN.deb=(BURN.deb||0)+(k*db9-(BURN.deb||0))*Math.min(1,dt*2); // le débit lissé (l'horizon)
    while(BURN.tE>=1){BURN.tE-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x+(Math.random()-.5)*r.l,r.y+.08,r.z-r.R*.55,BURN.q),
        sd=r.x<0?-1:1,sx=fz*sd,sz=-fx*sd,N9=BURN_NUAGE,fl=Math.random()<N9.flanc,                // (2026-10-08) plus vers l'arrière, un peu sur le côté — et une part qui sort PAR LE FLANC
        v=fl?N9.fa0+Math.random()*N9.fa1:N9.v0+Math.random()*N9.v1,l=fl?N9.fc0+Math.random()*N9.fc1:Math.random()*N9.cote,gr=.84+Math.random()*.12;
      burnEmet(BURN.fum,o.x,o.y,o.z,-fx*v*av9+sx*l,.25+Math.random()*.75,-fz*v*av9+sz*l,5.8+Math.random()*4.2,.34+Math.random()*.24,1.05+Math.random()*.5+.45*BURN.chaud,
        .2+Math.random()*.16,gr*.86,gr*.84,gr*.93);}
    if(NYAN.on&&BURN.pix){BURN.tP+=dt*k*(240+170*BURN.chaud); // (2026-10-06) LE CHAT : à la place des braises, les roues giclent des PIXELS multicolores qui scintillent
      while(BURN.tP>=1){BURN.tP-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x+(Math.random()-.5)*r.l,r.y+.1,r.z-r.R*.5,BURN.q),v=1.5+Math.random()*3,c=nyanPixC();
        burnEmet(BURN.pix,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*2.6,1.2+Math.random()*3.2,-fz*v+(Math.random()-.5)*2.6,.8+Math.random()*.9,.15+Math.random()*.14,0,1,c[0],c[1],c[2]);}}
    else BURN.tF+=dt*k*(BURN.chaud>.45?(BURN.chaud-.45)*70:0);
    while(BURN.tF>=1){BURN.tF-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x,r.y+.05,r.z-r.R*.3,BURN.q),v=2+Math.random()*4;
      burnEmet(BURN.feu,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*2,1+Math.random()*2.2,-fz*v+(Math.random()-.5)*2,.35+Math.random()*.4,.05+Math.random()*.05,0,1,1,.5+Math.random()*.4,.15);}
  }
  while(BURN.pops.length&&now>=BURN.pops[0]){BURN.pops.shift();burnPop(.8);try{if(sfxOk()){const e=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0];crackle(Math.max(.35,e.crk));}}catch(_){}}
  if(BURN.fum)BURN.fum.o.material.uniforms.uPx.value=Math.max(2,Math.round(5*renderer.getPixelRatio()));
  try{burnCaisse(dt);}catch(e){if(!burnTick._k){burnTick._k=1;console.warn('burn-out : caisse',e);}} // la CAISSE pousse la fumée (plus le doigt)
  if(!(k>.02&&BURN.fum&&!GAR.go))BURN.deb=(BURN.deb||0)*Math.exp(-dt*1.5);   // plus de pneus : le débit retombe
  {const h9=BURN.fum?.92*BURN.fum.N/Math.max(1,BURN.deb||0):1e9;BURN.hor=BURN.hor||h9;BURN.hor+=(h9-BURN.hor)*Math.min(1,dt*(h9<BURN.hor?3:.25));} // L'HORIZON : vite plus court, lentement plus long
  for(const F of [BURN.fum,BURN.feu,BURN.pix])if(F&&F.o.visible)burnPas(F,dt,t);
  try{burnCubes();}catch(e){if(!burnTick._c){burnTick._c=1;console.warn('burn-out : cubes',e);}} // le VOLUME de la fumée : ses cubes
  try{burnGomme(dt);}catch(e){}
  try{burnSon(dt);}catch(e){if(!burnTick._w){burnTick._w=1;console.warn('burn-out : son',e);}}
}
/* LE DÉRAPAGE (même soir, Léo : « seulement si on appuie longtemps sur la voiture et qu'ensuite on glisse le doigt, la voiture commence à
   déraper en fonction, mais ne tombe jamais vraiment de la plateforme »). En burn-out, le glissé du doigt fait tourner la caisse SUR le
   plateau (`BURN.cib`, ,009 rad par pixel, dans le sens du plateau au doigt) ; elle suit par un ressort MOU, un peu sous-amorti (ω 7 — 9 depuis le 08/10, `BURN_RESSORT` —, ζ ,5 :
   elle part, dépasse, revient — ça glisse), autour d'un PIVOT vers l'avant (`drz` : l'arrière balaie, comme un donut) ; sa vitesse de
   rotation la pousse un peu dehors (±,35 m). BORNÉE : le centre ne s'écarte jamais de plus de 4,3 m − le rayon de la caisse — ses coins
   restent sur le disque. Lâchée, elle se RECENTRE en ~0,7 s en gardant le cap qu'on lui a donné ; puis ce cap est VERSÉ dans le plateau
   (`garageAng` et `GAR.podSpin` bougent d'autant : à l'écran rien ne saute) — JOUER repart d'une caisse alignée. */
/* (2026-10-08, Léo : « dans le premier essai la voiture bougeait un peu plus, elle s'éloignait un peu sur le bord, et c'était stylé — peut-on
   le récupérer sans tout casser ? ») Au premier essai le PIVOT restait DEVANT la caisse : en tournant, son centre décrit un cercle autour de
   ce point et part vers le bord (jusqu'à ~2·`drz`, ~1,8 m). Les donuts l'avaient fait glisser au CENTRE du plateau (`donM` → 1 : la caisse
   restait au milieu). Désormais il n'y glisse qu'au quart (`DON_PIV.donMax`), la vitesse la pousse un peu plus dehors (`glisse` ,35 → ,55 m),
   et la vue recule d'après l'état « donut » (`donH`) pour la garder dans le cadre (`BURN.Rs`). La borne du disque reste (4,3 m − son rayon). */
const DON_PIV={donMax:.25,glisse:.42,kGlisse:.16}; // glisse ,55 → ,42 (même soir : des donuts moins violents)
const BURN_RESSORT={om:8,ze:.5,genou:4,frein:40}; // (même soir, Léo : « moins violent, les tours de donuts ») au-delà de `genou` rad/s un FREIN progressif (`frein` /s sur l'excès) : MESURÉ avant, un doigt rapide la faisait tourner à 11 rad/s (près de 2 tours/s), le centre balayant à 12-14 m/s ; le doigt plus vite que ça : ce qui dépasse est perdu (`DON.avance`)
/* LA CAISSE SE BALADE (2026-10-08, Léo : « quand on le fait vite, ça fait un peu générique, un peu la même chose » · « la voiture ne se
   balade plus assez avec le burn-out »). MESURÉ avant : six gestes rapides (cercle, petits cercles, zigzag, huit, fouet, gribouillis) — la
   caisse tournait autour d'un pivot FIXE (,9 m devant elle) et touchait chaque fois le même bord (1,74 m du centre) : un seul cercle,
   quel que soit le geste. Désormais le pivot VOYAGE (`BURN.qx/qz`, un ressort lourd, ω `om`, ζ `ze`) : (1) vers la MOITIÉ (`suit`) de
   l'endroit où le doigt touche le plateau (`burnSol`) — on l'emmène où on veut, elle traîne et glisse derrière ; (2) les roues arrière la
   POUSSENT dans son axe d'autant plus qu'elle tourne (`pousse` m/s², pleine à 4 rad/s) : le donut MARCHE, il ne reste plus sur place ;
   (3) au bord du plateau elle RENCONTRE le bord, y perd sa vitesse vers l'extérieur et en rebondit un peu (`rebond`). Tenue sans bouger :
   elle reste sur place (le burn-out d'origine). Lâchée : elle revient au centre avec le reste (`pivK`). */
/* LA NITRO ET LA MARCHE ARRIÈRE (2026-10-08, Léo : « ajoute dans les capacités du burn-out : en reculant, et la nitro »). Pendant le
   burn-out, deux touches tenues (l'autre pouce, comme NITRO en course ; au clavier ESPACE / N et ↓ / R) :
   · NITRO (`BURN.nk`, lissé) : le feu SORT DES POTS (bleu au cœur, orange au bout), la fumée ×(1 + `fumee`), les pneus patinent plus vite,
     le moteur au plafond, elle tourne plus fort (`tourne`) et BONDIT devant (`pousse` m/s², vitesse ×(1 + `vit`)) ; à l'appui un coup de
     souffle (boostSnd), au lâcher la pétarade.
   · MARCHE ARRIÈRE (`BURN.rk`) : les roues tournent à l'envers et soufflent la fumée vers l'AVANT, elle RECULE (`recul` m/s² — seule
     exception à « elle ne recule jamais »), le pivot passe derrière (c'est l'avant qui balaie : le donut en marche arrière). Les deux
     ensemble : elle recule fort. Le ressort du doigt se relâche pendant l'une ou l'autre : elle file, puis revient sous le doigt. */
const BURN_NITRO={fumee:.6,tourne:.2,pousse:1.8,recul:1.7,vit:.3,feu:110,lache:.45,boutons:false}; // (même soir, Léo : « enlève les boutons ») plus de touches à l'écran (`boutons` : true les rend) — restent ESPACE / N et ↓ / R au clavier // (même soir, Léo : « reviens sur celle d'avant, juste un peu moins violent, et le suivi moins dénaturé ») MESURÉ en v187 (pousse 3, recul 2,6, vit ,7, ressort relâché ×(1 − ,78), tour ajouté au CAP) : la NITRO jetait la caisse à 7-8 m/s jusqu'au bord, et après elle la caisse restait décalée de ~100° sur le doigt (le tour en plus s'ajoutait pour de bon au cap visé) — désormais `tourne` = une AVANCE passagère (rad, `BURN.nAv`) qui retombe au lâcher, poussées et vitesse plus douces, le ressort du doigt ne se relâche plus que de `lache`
function burnBtnsVoir(on){
  let b=BURN.btn;
  if(!b){if(!on)return;b=BURN.btn=document.createElement('div');b.id='gBurnBtns';b.setAttribute('aria-hidden','true');if(!TEL_NATIF)b.classList.add('clavier');
    b.innerHTML='<button type="button" class="gbB" id="gbRecul"><i class="pxi pxi-bas"></i><span data-fr="ARRIERE">'+TR('ARRIERE')+'</span><small>R</small></button>'+
      '<button type="button" class="gbB" id="gbNitro"><i class="pxi pxi-eclair"></i><span>NITRO</span><small>'+TR('ESPACE')+'</small></button>';
    document.body.appendChild(b);
    for(const [id,k] of [['gbNitro','nitro'],['gbRecul','recul']]){const el=b.querySelector('#'+id);
      const fin=function(e){if(el._p!=null&&e.pointerId===el._p){el._p=null;BURN[k]=false;el.classList.remove('on');}};
      el.addEventListener('pointerdown',function(e){e.stopPropagation();e.preventDefault();if(!BURN.on)return;el._p=e.pointerId;try{el.setPointerCapture(e.pointerId);}catch(_){}BURN[k]=true;el.classList.add('on');});
      el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
      el.addEventListener('click',function(e){e.stopPropagation();});}}
  if(b._on!==on){b._on=on;b.classList.toggle('on',on);if(!on)for(const el of b.children){el._p=null;el.classList.remove('on');}}
}
addEventListener('keydown',function(e){if(!garageOn||!BURN.on)return; // (en CAPTURE : un bouton du garage resté sous le focus ne prend pas l'ESPACE)
  const n9=e.code==='Space'||e.code==='KeyN',r9=e.code==='ArrowDown'||e.code==='KeyR'||e.code==='KeyS';if(!n9&&!r9)return;e.preventDefault();e.stopPropagation();if(e.repeat)return;
  if(n9)BURN.nitro=true;else BURN.recul=true;
  const el=BURN.btn&&BURN.btn.querySelector(n9?'#gbNitro':'#gbRecul');if(el)el.classList.add('on');},true);
addEventListener('keyup',function(e){
  if(e.code==='Space'||e.code==='KeyN'){BURN.nitro=false;const el=BURN.btn&&BURN.btn.querySelector('#gbNitro');if(el&&el._p==null)el.classList.remove('on');}
  else if(e.code==='ArrowDown'||e.code==='KeyR'||e.code==='KeyS'){BURN.recul=false;const el=BURN.btn&&BURN.btn.querySelector('#gbRecul');if(el&&el._p==null)el.classList.remove('on');}},true);
try{Object.assign(I18N,{'ARRIERE':'REVERSE','ESPACE':'SPACE'});}catch(e){}
function burnNitroTick(dt,now){
  burnBtnsVoir(BURN_NITRO.boutons&&BURN.on&&!GAR.go);
  const n0=BURN.nk>.5,nv=BURN.on&&BURN.nitro&&!GAR.go?1:0,rv=BURN.on&&BURN.recul&&!GAR.go?1:0;
  BURN.nk+=(nv-BURN.nk)*Math.min(1,dt*(nv?8:3.5));BURN.rk+=(rv-BURN.rk)*Math.min(1,dt*(rv?4:3));
  if(BURN.nk<.002&&!nv)BURN.nk=0;if(BURN.rk<.002&&!rv)BURN.rk=0;
  if(nv&&!BURN.nwas){BURN.nwas=true;BURN.chaud=Math.max(BURN.chaud,.75);try{burnPop(1.2);}catch(_){}try{if(sfxOk())boostSnd(1.15);}catch(_){}hap([12,20,14]);}
  else if(!nv&&BURN.nwas){BURN.nwas=false;const n=now;BURN.pops.push(n+60,n+210,n+400);BURN.pops.sort(function(a,b){return a-b;});}
  if(BURN.nk>.03&&nv)BURN.chaud=Math.min(1,BURN.chaud+dt*.8);
  {const av=BURN.on&&Math.abs(BURN.don)>.5?Math.sign(BURN.don)*BURN_NITRO.tourne*BURN.nk:0;BURN.nAv=(BURN.nAv||0)+(av-(BURN.nAv||0))*Math.min(1,dt*4);} // elle tourne un peu DEVANT le doigt — une avance qui retombe (jamais ajoutée au cap visé : le doigt reste le maître)
  if(BURN.nk>.02&&BURN.feu&&BURN.pots.length&&!GAR.go){const ry=carGroup.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);carGroup.updateMatrixWorld(); // LE FEU DES POTS
    BURN.nE+=dt*BURN_NITRO.feu*BURN.nk;
    while(BURN.nE>=1){BURN.nE-=1;const p=BURN.pots[(Math.random()*BURN.pots.length)|0],o=burnMonde(p[0],p[1],p[2],BURN.q),v=5+Math.random()*6,bl=Math.random()<.35;
      burnEmet(BURN.feu,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*1.2,.2+Math.random()*.9,-fz*v+(Math.random()-.5)*1.2,.16+Math.random()*.22,.14+Math.random()*.14,0,1,bl?.45:1,bl?.6:.62+Math.random()*.35,bl?1:.2);}
    if(!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+90;hap(5);}}
}
const BURN_BALADE={recentre:.9,tauR:.8,revient:.5,suit:.33,om:2.9, /* (même soir, Léo : « pourquoi la voiture s'avance sans cesse devant pendant le burn-out ») MESURÉ : 1-1,3 m vers l'avant en 3 s de balancé ou de donut, même sans poussée, sans doigt-cible, sans cliquet — c'est le PIVOT DEVANT : tournée de y, son centre passe à dz(1 − cos y) devant (,9 m à 90°, 1,8 m retournée). Le pivot reste devant (l'arrière balaie sur le moment), mais la balade le RAMÈNE : la cible retranche `recentre` × ce décalage moyen sur `tauR` s, et elle peut y revenir à `revient` m/s vers son arrière (sinon « elle ne recule jamais » bloquait le retour : un cliquet vers l'avant) */ ze:.8,pousse:2.2,rebond:0,bord:4.3,vmax:2.2}; // (même soir, Léo : « faut pas qu'elle recule non plus, là c'est trop violent ») ω 4,2 → 3,2, ζ ,5 → ,8 (plus de dépassement), suit ,5 → ,4, pousse 3,2 → 2,2, plus de rebond, vitesse ≤ 2,2 m/s — et JAMAIS vers l'arrière de la caisse ; puis (« le juste milieu ») suit ,4 → ,33, ω 3,2 → 2,9 : elle chasse un peu moins le doigt, un peu plus lourde
function burnBord(cx,cz,y){ // de combien rapprocher le centre (cx, cz) pour que les 4 coins de la caisse (cap y) restent à `bord` m du centre du plateau
  const a=BURN.ga||2.2,b=BURN.gb||1,R=BURN_BALADE.bord,co=Math.cos(y),si=Math.sin(y);
  const loin=function(f){let m=0;for(let i=0;i<4;i++){const x=(i&1?b:-b),z=(i&2?a:-a),px=f*cx+x*co+z*si,pz=f*cz-x*si+z*co,d=px*px+pz*pz;if(d>m)m=d;}return Math.sqrt(m);};
  if(loin(1)<=R)return 1;if(loin(0)>R)return 0;let lo=0,hi=1;for(let k=0;k<9;k++){const md=(lo+hi)/2;if(loin(md)<=R)lo=md;else hi=md;}return lo;
} // (2026-10-08, Léo : « la voiture qui suit encore un peu plus ») le ressort qui tire la caisse vers le doigt, ω 7 → 9 : MESURÉ, un doigt qui tourne à 3 rad/s la traînait de 27° (48° à 6 rad/s) — à ω 9, ~20° (~33°) ; puis (même soir, Léo : « ça suit presque TROP — le juste milieu entre satisfaisant et maniable ») ω 8 : le juste milieu entre 7 et 9 ; même amorti (ζ ,5 : elle dépasse un peu, ça glisse)
function burnDerape(dt){
  const d9=Math.min(dt,.1),n=Math.max(1,Math.ceil(d9/.008)),h=d9/n,om=BURN_RESSORT.om,ze=BURN_RESSORT.ze;
  const gn=BURN_RESSORT.genou,fr=BURN_RESSORT.frein;
  for(let i=0;i<n;i++){BURN.yawV+=(om*om*(BURN.cib+(BURN.nAv||0)-BURN.yaw)-2*ze*om*BURN.yawV)*h;const ex=Math.abs(BURN.yawV)-gn;if(ex>0)BURN.yawV-=Math.sign(BURN.yawV)*ex*Math.min(1,fr*h);BURN.yaw+=BURN.yawV*h;} // (les donuts) le frein au-delà du genou
  if(Math.abs(BURN.yaw)>Math.PI){const s2=2*Math.PI*Math.round(BURN.yaw/(2*Math.PI));BURN.yaw-=s2;BURN.cib-=s2;} // (le donut) les tours se replient : la caisse est la même
  BURN.don+=(BURN.yawV-BURN.don)*Math.min(1,dt*3);                       // (le donut) la rotation lissée : le compte des tours, la vue
  BURN.donK=BURN.on?Math.max(0,Math.min(1,(Math.abs(BURN.don)-.8)/2.2)):Math.max(0,BURN.donK-dt*2);
  BURN.donH=BURN.donH||0;BURN.donH+=((BURN.donK>.35?1:BURN.donK<.15?0:BURN.donH)-BURN.donH)*Math.min(1,dt*1.5);if(BURN.donH<1e-3&&BURN.donK<.15)BURN.donH=0; // l'état « donut » (la vue)
  BURN.donM=BURN.donH*DON_PIV.donMax;                                    // en donut, le pivot ne glisse plus qu'au QUART vers le centre : elle s'éloigne sur le bord
  const vise=BURN.on&&(BURN.bouge||BURN.nk>.05||BURN.rk>.05)&&!GAR.go?1:0; /* (2026-10-08) la NITRO et la MARCHE ARRIÈRE la font bouger même doigt immobile */BURN.pivK+=(vise-BURN.pivK)*Math.min(1,dt*(vise?6:(GAR.go?6:1.6)));
  {const B9=BURN_BALADE,lq=Math.max(0,B9.bord-(BURN.gb||1));let tx=0,tz=0;                // LA BALADE : le pivot voyage
    if(vise&&BURN.fsOk){tx=BURN.fsx*B9.suit;tz=BURN.fsz*B9.suit;const tl=Math.hypot(tx,tz);if(tl>lq){tx*=lq/tl;tz*=lq/tl;}}
    {const kR=Math.min(1,dt/B9.tauR);BURN.swAx=(BURN.swAx||0)+((BURN.swX||0)-(BURN.swAx||0))*kR;BURN.swAz=(BURN.swAz||0)+((BURN.swZ||0)-(BURN.swAz||0))*kR; // le décalage MOYEN du pivot devant…
      if(vise){tx-=B9.recentre*BURN.swAx;tz-=B9.recentre*BURN.swAz;}}                                                                         // …que la balade efface
    const N9=BURN_NITRO,tw=B9.pousse*Math.min(1,Math.abs(BURN.yawV)/4),ac=vise?(tw*(1+N9.tourne*BURN.nk)+N9.pousse*BURN.nk)*(1-BURN.rk)-BURN.rk*(N9.recul+N9.pousse*BURN.nk):0, // la NITRO pousse devant, la MARCHE ARRIÈRE tire derrière
      ax=Math.sin(BURN.yaw)*ac,az=Math.cos(BURN.yaw)*ac,lch=Math.max(BURN.nk,BURN.rk),om=B9.om*(1-N9.lache*lch),ze=B9.ze,vm=B9.vmax*(1+N9.vit*BURN.nk); // (le ressort du doigt se relâche : elle file vraiment, puis revient)
    const fx=Math.sin(BURN.yaw),fz=Math.cos(BURN.yaw);
    for(let i=0;i<n;i++){BURN.qvx+=(om*om*(tx-BURN.qx)-2*ze*om*BURN.qvx+ax)*h;BURN.qvz+=(om*om*(tz-BURN.qz)-2*ze*om*BURN.qvz+az)*h;
      if(vise){const vf=BURN.qvx*fx+BURN.qvz*fz,rm=-(B9.revient||0);if(vf<rm&&BURN.rk<.3){BURN.qvx-=(vf-rm)*fx;BURN.qvz-=(vf-rm)*fz;}                 // elle ne RECULE jamais : ce qui partirait vers son arrière est perdu (elle glisse de côté, ou avance)
        const vq=Math.hypot(BURN.qvx,BURN.qvz);if(vq>vm){BURN.qvx*=vm/vq;BURN.qvz*=vm/vq;}}
      BURN.qx+=BURN.qvx*h;BURN.qz+=BURN.qvz*h;}}
  if(BURN.yaw||BURN.pivK>=.001){
    const y=BURN.yaw,ar9=1-2*BURN.rk,dz=BURN.drz*ar9,s0=-Math.max(-DON_PIV.glisse,Math.min(DON_PIV.glisse,BURN.yawV*DON_PIV.kGlisse))*BURN.pivK,sl=s0*ar9; // (2026-10-08) EN MARCHE ARRIÈRE le pivot passe DERRIÈRE (c'est l'avant qui balaie) et la glisse s'inverse : elle tourne en reculant
    if(BURN.dzP!=null&&BURN.pivK>.05){const d9=dz-BURN.dzP,e9=s0*(ar9-(1-2*BURN.rkP)),pk=BURN.pivK;BURN.qx+=(d9*Math.sin(y)-e9*Math.cos(y)/pk);BURN.qz-=(d9*((1-BURN.donM)-Math.cos(y))-e9*Math.sin(y)/pk);} // le pivot change de bout SANS que la caisse saute : la balade absorbe le déplacement
    BURN.dzP=dz;BURN.rkP=BURN.rk; // (2026-10-08, Léo : « faut pas qu'elle recule ») la glisse de l'AUTRE côté du pivot : avant, ce décalage qui tourne avec la caisse la faisait partir EN MARCHE ARRIÈRE autour du cercle (glisse × rotation : 5,6 m/s en arrière à 10 rad/s) ; de ce côté-ci elle AVANCE et c'est l'arrière qui décroche — un vrai donut
    BURN.swX=-dz*Math.sin(y);BURN.swZ=dz*(1-BURN.donM)-dz*Math.cos(y);                                             // (le décalage du pivot devant, pour le recentrage)
    BURN.sl9=sl;
    let cx=BURN.pivK*(BURN.qx-dz*Math.sin(y))+Math.cos(y)*sl,cz=BURN.pivK*(BURN.qz+dz*(1-BURN.donM)-dz*Math.cos(y))-Math.sin(y)*sl; // le pivot : devant la caisse (le dérapage), au centre du plateau (le donut) — et là où la balade l'a emmené
    const c=Math.hypot(cx,cz),f9=burnBord(cx,cz,y);if(f9<1){cx*=f9;cz*=f9; // jamais hors du disque — ses QUATRE COINS (pas le cercle qui l'entoure : de côté elle va ~2,5 m au lieu de 1,74) : elle RENCONTRE le bord
      const ux=cx/Math.max(1e-6,c*f9),uz=cz/Math.max(1e-6,c*f9),vr=BURN.qvx*ux+BURN.qvz*uz;if(vr>0){const k9=1+BURN_BALADE.rebond;BURN.qvx-=k9*vr*ux;BURN.qvz-=k9*vr*uz;}
      const ex=c*(1-f9)/Math.max(.05,BURN.pivK);BURN.qx-=ux*ex*.5;BURN.qz-=uz*ex*.5;} // (et la balade n'insiste pas dehors)
    if(BURN.mes&&BURN.on){const M=BURN.mes;if(M.px!=null&&dt>0){const ym=M.py+Math.atan2(Math.sin(y-M.py),Math.cos(y-M.py))/2,vx=(cx-M.px)/dt,vz=(cz-M.pz)/dt,vf=vx*Math.sin(ym)+vz*Math.cos(ym),v=Math.hypot(vx,vz); // (le banc) recule-t-elle ? est-ce brutal ?
      M.n++;M.rec+=Math.max(0,-vf);M.recMax=Math.max(M.recMax,-vf);M.v+=v;M.vMax=Math.max(M.vMax,v);if(M.pv!=null)M.a.push(Math.hypot(vx-M.pvx,vz-M.pvz)/dt);M.pv=v;M.pvx=vx;M.pvz=vz;}M.px=cx;M.pz=cz;M.py=y;}
    const r=garRot(),cr=Math.cos(r),sr=Math.sin(r);
    carGroup.rotation.y+=y;carGroup.position.x+=cx*cr+cz*sr;carGroup.position.z+=-cx*sr+cz*cr;}
  if(GAR.go||(!BURN.on&&BURN.pivK<.01&&Math.abs(BURN.yawV)<.02)){ // APRÈS l'avoir posée : le cap est versé dans le plateau (à l'image suivante, rien ne saute)
    if(BURN.yaw){garageAng-=BURN.yaw;GAR.podSpin=(GAR.podSpin||0)-BURN.yaw;BURN.yaw=0;}
    BURN.cib=0;if(GAR.go)BURN.yawV=0;BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;BURN.dzP=null;BURN.swX=BURN.swZ=BURN.swAx=BURN.swAz=0;}
}
function burnSon(dt){ // le VRAI moteur du palier, au rupteur, et le crissement de la course
  if(!AC||!osc||!gainN)return;
  const vivant=BURN.k>.004||BURN.rpm>.03||BURN.chg>0;
  if(!vivant||!sfxOk()){if(BURN.son){BURN.son=false;const T=AC.currentTime;stt(gainN.gain,0,T,.12);stt(engLfoG.gain,0,T,.12);if(skidG)stt(skidG.gain,0,T,.08);}return;}
  BURN.son=true;
  if(engLvl!==engTier)engSetTier(engTier);
  const e=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0],cib=BURN.on?.86+.12*BURN.nk-.08*BURN.rk:BURN.chg*.6; // (la charge) le moteur MONTE avant de partir · (la nitro) au plafond
  BURN.rpm+=(cib-BURN.rpm)*Math.min(1,dt*(cib>BURN.rpm?5.5:2.2));
  let rpm=BURN.rpm,cut=0;
  if(BURN.on&&BURN.t>.9){cut=Math.sin(BURN.t*2*Math.PI*8.2)>.35?1:0;rpm-=cut*.06;}   // LE RUPTEUR : l'allumage coupe, le régime bégaie
  if(cut&&!BURN.cut&&Math.random()<.2){try{crackle(Math.max(.25,e.crk*.6));}catch(_){}burnPop(.45);}
  BURN.cut=cut;
  engApplique(engSndParams(e,{rpm:rpm,charge:BURN.on?(cut?.35:.92):BURN.chg*.85,ovr:BURN.on||BURN.chg>.05?0:Math.min(1,BURN.rpm*1.8),drift:0,nA:BURN.nk,thr:(BURN.on&&!cut)||BURN.chg>.1?1:0,
    vsp:.6*BURN.k,wob:0,boost:false,cloudIn:0,dk:1,nB:TEL_NATIF?1:0,gE:VOL_LOCKED?1:.72,lpMin:TEL_NATIF?700:0}));
  if(skidG){const T=AC.currentTime,sk=BURN.k*(.75+.25*Math.sin(BURN.t*3.1)),sq=1050+380*BURN.chaud+110*Math.sin(BURN.t*1.7);
    stt(skidG.gain,Math.min(.17,.13*sk),T,.05);stt(skF1.frequency,sq,T,.06);stt(skF2.frequency,sq*1.56,T,.06);
    if(skD1)stt(skD1.gain,60+120*BURN.k,T,.1);if(skD2)stt(skD2.gain,90+180*BURN.k,T,.1);if(skLfo)stt(skLfo.frequency,13+5*BURN.chaud,T,.1);}
}
window.dbgBurn=function(s,a,b){
  if(s===0){burnFin();return 'coupé';}
  if(s==='permis'){let r=null;try{r=garCaisseRect();}catch(_){}return {caisse:garageI,permis:burnPermis(),rect:r};}
  if(s==='fumee'){const F=BURN.fum,p=carGroup.getWorldPosition(new THREE.Vector3());let n=0,vt=0,dans=0;let G=null;try{G=garGabarit();}catch(_){} // (le banc) la fumée autour de la caisse : tourne-t-elle avec elle ? en reste-t-il DANS la caisse ?
    if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3,dx=F.P[j]-p.x,dz=F.P[j+2]-p.z,r=Math.hypot(dx,dz);if(r>3.5||r<.2||F.P[j+1]>p.y+2)continue;n++;vt+=(F.V[j]*dz-F.V[j+2]*dx)/r;
      if(G){const c=Math.cos(carGroup.rotation.y),sn=Math.sin(carGroup.rotation.y),lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<G.b&&Math.abs(lz)<G.a&&F.P[j+1]<p.y+(G.H||1.3))dans++;}}
    const pc=GAR.pod?GAR.pod.getWorldPosition(new THREE.Vector3()):p;let nj=0,ar=0,co=0;{const c=Math.cos(carGroup.rotation.y),sn=Math.sin(carGroup.rotation.y);if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i]||F.age[i]>1.2)continue;const j=i*3,vlx=F.V[j]*c-F.V[j+2]*sn,vlz=F.V[j]*sn+F.V[j+2]*c;nj++;ar+=-vlz;co+=Math.abs(vlx);}}
    return {proches:n,tourne:n?+(vt/n).toFixed(2):0,dansLaCaisse:dans,w:+BURN.yawV.toFixed(2),jeunes:nj,versArriere:nj?+(ar/nj).toFixed(2):0,surLeCote:nj?+(co/nj).toFixed(2):0,brusques:BURN.brusque|0,vivantes:F?F.n:0,horizon:+(BURN.hor||0).toFixed(1),ecart:+Math.hypot(p.x-pc.x,p.z-pc.z).toFixed(2)};}
  if(s==='mesure'){if(a){BURN.mes={n:0,rec:0,recMax:0,v:0,vMax:0,a:[],px:null};return 'go';}const M=BURN.mes;if(!M||!M.n)return null;const A=M.a.slice().sort(function(x,y){return x-y;});BURN.mes=null;return {recul:+(M.rec/M.n).toFixed(2),reculMax:+M.recMax.toFixed(2),vit:+(M.v/M.n).toFixed(2),vitMax:+M.vMax.toFixed(2),acc90:Math.round(A[(A.length*.9)|0]||0),images:M.n};}
  if(s==='autour'){const F=BURN.fum,R=b||50,v=new THREE.Vector3();let n=0,al=0,bx=0,by=0,bn=0; // (le banc) la fumée À L'ÉCRAN autour du point (x, y) de a : combien de bouffées, leur opacité ; et où est la plus dense
    if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i]||F.A[i]<.03)continue;const j=i*3;v.set(F.P[j],F.P[j+1],F.P[j+2]).project(camera);if(v.z>1)continue;const x=(v.x*.5+.5)*VP.w,y=(.5-v.y*.5)*VP.h;
      if(a&&Math.hypot(x-a[0],y-a[1])<R){n++;al+=F.A[i];}bx+=x*F.A[i];by+=y*F.A[i];bn+=F.A[i];}
    return {n:n,opacite:+al.toFixed(2),centre:bn?[Math.round(bx/bn),Math.round(by/bn)]:null};}
  if(s==='ressort'){if(a!=null)BURN_RESSORT.om=+a;if(b!=null)BURN_RESSORT.ze=+b;return Object.assign({},BURN_RESSORT);} // (le banc) le ressort du doigt à chaud
  if(s==='balade'){if(a&&typeof a==='object'){Object.assign(BURN_BALADE,a);return Object.assign({},BURN_BALADE);}if(a!=null)BURN_BALADE.suit=+a;if(b!=null)BURN_BALADE.pousse=+b;return Object.assign({},BURN_BALADE);} // (le banc) régler la balade à chaud : dbgBurn('balade',0,0) = le pivot fixe d'avant
  if(s==='tourne'){if(!garAtelierLibre())return 'atelier pas libre';if(!BURN.on)burnPart();BURN.bouge=true;BURN.auto=b>0?+b:3;BURN.autoW=a!=null?+a:3;} // un doigt qui tourne sans doigt : a rad/s pendant b secondes
  if(s>0){if(!garAtelierLibre())return 'atelier pas libre';burnPart();BURN.auto=+s;BURN.autoW=0;}
  return {on:BURN.on,k:+BURN.k.toFixed(2),t:+BURN.t.toFixed(2),chaud:+BURN.chaud.toFixed(2),rpm:+BURN.rpm.toFixed(2),fumee:BURN.fum?BURN.fum.n:0,feu:BURN.feu?BURN.feu.n:0,
    essieuxAr:BURN.ar.length,roues:BURN.roues.length,cap:+BURN.yaw.toFixed(2),cib:+BURN.cib.toFixed(2),w:+BURN.yawV.toFixed(2),donut:+BURN.don.toFixed(2),donM:+BURN.donM.toFixed(2),tours:BURN.n,
    pivot:+BURN.pivK.toFixed(2),balade:[+BURN.qx.toFixed(2),+BURN.qz.toFixed(2)],sw:[+(BURN.swAx||0).toFixed(2),+(BURN.swAz||0).toFixed(2)],swI:[+(BURN.swX||0).toFixed(2),+(BURN.swZ||0).toFixed(2)],sl9:+(BURN.sl9||0).toFixed(2),pos:(function(){const a=carGroup.getWorldPosition(new THREE.Vector3()),b=GAR.pod?GAR.pod.getWorldPosition(new THREE.Vector3()):a,r=garRot(),cr=Math.cos(r),sr=Math.sin(r),dx=a.x-b.x,dz=a.z-b.z;return [+(dx*cr-dz*sr).toFixed(2),+(dx*sr+dz*cr).toFixed(2)];})(),cad:+BURN.cad.toFixed(2),centre:[Math.round(BURN.scx),Math.round(BURN.scy)],geste:{tourne:+BURN.kc.toFixed(2),ailleurs:+BURN.mc.toFixed(2)},cubes:BURN.gr?BURN.gr.M.reduce(function(a,im){return a+im.count;},0):0,gomme:!!(BURN.gom&&BURN.gom.sale),plateau:+(GAR.platW||0).toFixed(2),doigt:GAR.doigt||null,son:BURN.son};
};
/* ===== LE BOUTON ROUGE ET SES OUTILS (2026-10-05, Léo : « enlève le bouton coffre ; mets un bouton rouge sur la plateforme qui tourne, à
   côté de la voiture ; quand on appuie, de chaque côté, différents outils se mettent à côté et construisent directement les objets qu'on a
   déjà — pas pour le shop ») =====
   LE BOUTON : un champignon d'arcade rouge sur son socle noir cerclé de jaune et noir, posé SUR le plateau (enfant de `GAR.pod` : il tourne
   avec la caisse), à l'avant droit de la caisse ; son halo rouge respire pour appeler le doigt. Un tap dessus l'enfonce → l'inventaire
   s'ouvre (le même `invOuvre`), un second le referme. En dérapage il s'enfonce dans le plateau (la caisse balaie).
   LES OUTILS : deux bras-robots jaunes d'atelier, un de chaque côté de la caisse — à gauche le PISTOLET À PEINTURE (corps chromé, pot bleu),
   à droite le POSTE À SOUDER (torche, buse de cuivre). Ils SORTENT du plateau à l'ouverture de l'inventaire (0,6 s, bras dépliés), vivent
   (servo qui respire, diode qui clignote), et RENTRENT à sa fermeture. Choisir un objet le fait CONSTRUIRE (`atlConstruit`, ~1,1 s) : la
   PEINTURE → le pistolet balaie la caisse dans un nuage de SA couleur ; l'AILE → le poste soude à l'arrière, gerbes d'étincelles ; la
   TRAÎNÉE → les deux bras aux pots, bouffées ; une CAISSE → les deux bras balaient, le scanner fait le reste. Tout est fait avec le KIT des
   caisses (lpKit / lpMat : zéro programme de plus) et les réservoirs du BURN-OUT (fumée en pixels, feu additif).
   Console : dbgAtelier() → l'état · dbgAtelier(1|0) ouvre / ferme · dbgAtelier('peinture'|'aile'|'trainee'|'voiture') → une construction. */
const ATL_POS={x:-3.54,z:3.54}; // (2026-10-06) la place du bouton rouge, au sol de l'atelier : 5 m du centre (le disque fait 4,5 m, la caisse en dérapage ≤ 4,3), à 135° — à droite de la caisse côté porte. Mesuré (dbgAtelier('pos',x,z)) : debout (343, 388), couché (464, 190) — dans l'image, loin des jauges et de la pile
const ATL={on:false,k:0,press:0,appui:null,btn:null,cap:null,halo:null,bras:[],mats:{},cons:0,cat:'',t:0,v:new THREE.Vector3(),w:new THREE.Vector3(),c:null};
const ATL_PAL={Ro:{g:'p',c:0xff3ec8},Rf:{g:'p',c:0xa8166e},R:{g:'p',c:0xd8262e},Rs:{g:'p',c:0x8e141a},N:{g:'p',c:0x1d2027},K:{g:'p',c:0x626b79},J:{g:'p',c:0xefb52a},Jf:{g:'p',c:0xb9861a},
  B:{g:'p',c:0x2f6cb8},C:{g:'c',c:0xe6e9ee},A:{g:'s',c:0x8792a4},Or:{g:'o',c:0xffc24a},Cu:{g:'o',c:0xd9824a},V:{g:'p',c:0x2f9e63}};
function atlMat(f){return ATL.mats[f]||(ATL.mats[f]=lpMat(f));}
function atlPiece(fn){const K=lpKit(ATL_PAL);fn(K);const G=K.done(),g=new THREE.Group();for(const f in G)g.add(new THREE.Mesh(G[f],atlMat(f)));return g;}
function atlBuild(){
  if(ATL.btn||!GAR.pod)return;
  /* LE BOUTON (2026-10-06, Léo : « un bouton plus minimaliste, sur le côté, plus éloigné de la voiture, qu'il n'ait pas à se rétracter ») :
     une colonne fine d'encre, un filet de néon rouge, la calotte rouge — rien d'autre. Posé HORS du plateau, au-delà de ce que la caisse
     balaie en dérapage (≤ 4,3 m du centre ; le disque fait 4,5 m) : il ne rentre plus jamais. Sa place : `ATL_POS` (réglable à chaud :
     dbgAtelier('pos', x, z)). */
  /* LE BOUTON DANS LA DA DU JEU (2026-10-06, Sacha : « tu peux garder son bouton inventaire, mais retravaille-le dans la DA du reste du jeu ») :
     plus de champignon d'arcade rouge générique — une BORNE de l'atelier, taillée comme ses meubles (le kit des caisses, huit pans à plat) :
     socle d'encre cerclé d'OR, colonne à huit pans baguée d'or, une platine sertie d'or et dessous le filet de NÉON cyan du plateau ; le
     bouton est une calotte À FACETTES rose néon (la couleur du coffre et de la BOUTIQUE), son halo rose respire. Au-dessus flotte le COFFRE
     en pixels (le pictogramme `PXI_G.coffre` de l'interface, en or cerné d'encre) : on sait ce qu'il ouvre. */
  const b=new THREE.Group();
  b.add(atlPiece(function(K){K.cyl('N',.22,.05,8,0,.025,0,'y',.25);K.cyl('Or',.235,.014,8,0,.057,0,'y');K.cyl('N',.08,.44,8,0,.29,0,'y',.095);
    K.cyl('Or',.088,.02,8,0,.4,0,'y');K.cyl('N',.19,.045,8,0,.535,0,'y',.15);K.cyl('Or',.196,.014,8,0,.565,0,'y');}));
  const neon=new THREE.Mesh(new THREE.CylinderGeometry(.155,.155,.012,8),new THREE.MeshBasicMaterial({color:0x5ee6ff,fog:false}));neon.position.y=.505;b.add(neon);
  const cap=atlPiece(function(K){K.lathe('Ro',[[0,0],[.15,0],[.15,.03],[.125,.075],[.065,.105],[0,.11]],8,0,0,0,'y');K.lathe('Rf',[[0,0],[.158,0],[.158,.012],[0,.012]],8,0,-.004,0,'y');});
  cap.position.y=.59;b.add(cap);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.2,.3,8),new THREE.MeshBasicMaterial({color:0xff3ec8,transparent:true,opacity:.4,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  halo.rotation.x=-Math.PI/2;halo.position.y=.6;b.add(halo);
  {const cv=document.createElement('canvas'),S=8,rows=PXI_G.coffre.split('|');cv.width=cv.height=(rows.length+1)*S;const x=cv.getContext('2d'); // le COFFRE en pixels
   for(const [dx,dy,col] of [[1,1,'#0b0730'],[0,0,'#ffd75e']]){x.fillStyle=col;rows.forEach(function(r,j){for(let i=0;i<r.length;i++)if(r[i]==='#')x.fillRect((i+dx)*S,(j+dy)*S,S,S);});}
   const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
   const ico=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));ico.scale.set(.3,.3,1);ico.position.y=.98;b.add(ico);ATL.ico=ico;}
  b.scale.setScalar(1.6);
  b.position.set(ATL_POS.x,0,ATL_POS.z);GAR.pod.parent.add(b);ATL.btn=b;ATL.cap=cap;ATL.halo=halo;ATL.y0=0;
  // LES DEUX BRAS : pied, colonne, épaule → bras → coude → avant-bras → l'outil
  for(const s of [1,-1]){
    const rig=new THREE.Group(),pied=atlPiece(function(K){K.cyl('N',.3,.12,8,0,.06,0,'y',.34);K.cyl('J',.2,.7,8,0,.47,0,'y',.22);K.cyl('Jf',.23,.06,8,0,.83,0,'y');
      K.box('N',.06,.18,.02,0,.45,.215);});                                    // la plaque du constructeur
    rig.add(pied);
    const ep=new THREE.Group();ep.position.y=.88;rig.add(ep);
    ep.add(atlPiece(function(K){K.cyl('K',.14,.26,10,0,0,0,'x');K.cyl('C',.06,.3,8,0,0,0,'x');}));
    const b1=atlPiece(function(K){K.box('J',.16,.72,.16,0,.36,0);K.box('Jf',.17,.06,.17,0,.7,0);K.box('N',.02,.4,.12,.09,.36,0);});ep.add(b1);
    const co=new THREE.Group();co.position.y=.72;ep.add(co);
    co.add(atlPiece(function(K){K.cyl('K',.11,.22,10,0,0,0,'x');}));
    const b2=atlPiece(function(K){K.box('J',.13,.58,.13,0,.29,0);K.box('Jf',.14,.05,.14,0,.56,0);});co.add(b2);
    const tete=new THREE.Group();tete.position.y=.6;co.add(tete);
    tete.add(atlPiece(s>0?function(K){ // le PISTOLET À PEINTURE
        K.box('C',.12,.2,.1,0,.08,0);K.cyl('C',.035,.18,8,0,.24,0,'y');K.cyl('Or',.02,.06,6,0,.35,0,'y');K.lathe('B',[[0,0],[.08,0],[.08,.14],[.05,.17],[0,.17]],10,0,-.16,0,'y');}
      :function(K){ // le POSTE À SOUDER
        K.box('K',.12,.18,.12,0,.07,0);K.cyl('N',.04,.2,8,0,.24,0,'y');K.cyl('Cu',.022,.1,8,0,.38,0,'y',.012);K.cyl('V',.015,.02,6,.07,.12,0,'x');}));
    const diode=new THREE.Mesh(new THREE.SphereGeometry(.03,6,4),new THREE.MeshBasicMaterial({color:s>0?0x5ff0ff:0xffb347,fog:false}));diode.position.set(0,.2,.06);tete.add(diode);
    rig.visible=false;GAR.pod.add(rig);ATL.bras.push({s:s,rig:rig,ep:ep,co:co,tete:tete,diode:diode});
  }
}
function atlBoutonEcran(){ // où est le bouton à l'écran (px) et son rayon — pour le doigt
  if(!ATL.btn||!ATL.btn.visible)return null;
  ATL.btn.updateMatrixWorld(true);ATL.cap.getWorldPosition(ATL.v);ATL.v.y+=.08;const d=camera.position.distanceTo(ATL.v);ATL.v.project(camera);if(ATL.v.z>1)return null; // (2026-10-06) la CALOTTE, où qu'elle soit (sur son pied)
  const r=.5/(d*Math.tan(camera.fov*Math.PI/360))*VP.h*.5;return {x:(ATL.v.x*.5+.5)*VP.w,y:(.5-ATL.v.y*.5)*VP.h,r:Math.max(26,r)};
}
function atlVise(e){if(GAR.go||!garAtelierLibre()||e.button>0)return false;
  const B=atlBoutonEcran();return !!B&&Math.hypot(e.clientX-B.x,e.clientY-B.y)<B.r;}
function atlPresse(){ // le bouton est enfoncé : l'inventaire s'ouvre (ou se ferme)
  ATL.press=1;hap([12,24,10]);
  try{uiClic(INV.on?'retour':'nav');}catch(e){} // (2026-10-14, session SON) ouvrir / fermer l'inventaire = nav / retour, comme le COFFRE et le ✕ (c'était ui.equipe : « équiper » pour ouvrir un tiroir)
  if(INV.on)invFerme();else invOuvre();
}
function atlConstruit(cat){ATL.cons=1.1;ATL.cat=cat;ATL.t=0;}
function atlTick(dt){
  if(!GAR.pod)return;atlBuild();
  const G=garGabarit(),vit=garAtelierLibre(),t=performance.now()*.001; /* (2026-10-06) la vitrine de Léo OU la console de Sacha */
  // le bouton : sur son pied, à la place de l'ancien socle des missions ; il respire, s'enfonce sous le doigt, et RENTRE dans le sol pendant un
  // dérapage (la caisse balaie jusqu'au bord du plateau) ou un lâcher
  ATL.btn.visible=false; // (2026-10-10, Léo : « enlève le bouton rouge au sol, l'inventaire, il n'a plus aucune utilité ») — l'INVENTAIRE vit dans la console ; la borne ne se montre plus (atlBoutonEcran → null : le doigt ne la trouve plus)
  ATL.press=Math.max(0,ATL.press-dt*3.2);const ap=ATL.appui!=null?1:0;ATL.cap.position.y=.59-.04*Math.max(ap,Math.sin(Math.min(1,ATL.press)*Math.PI*.5));
  ATL.halo.material.opacity=(.22+.18*Math.sin(t*3.4))*(INV.on?.4:1)+ATL.press*.5;ATL.halo.scale.setScalar(1+.06*Math.sin(t*3.4)+ATL.press*.25);
  if(ATL.ico){ATL.ico.position.y=.98+.035*Math.sin(t*2.1)-ATL.press*.05;ATL.ico.material.opacity=INV.on?.45:1;const s9=.3*(1+ATL.press*.18);ATL.ico.scale.set(s9,s9,1);} // le COFFRE flotte, il plonge quand on appuie
  // les bras : ils sortent avec l'inventaire
  const cib=vit&&INV.on&&!GAR.go?1:0;ATL.k+=(cib-ATL.k)*Math.min(1,dt*(cib?4.5:5.5));if(ATL.k<.002)ATL.k=0;
  if(ATL.cons>0)ATL.cons=Math.max(0,ATL.cons-dt);ATL.t+=dt;
  const k=ATL.k,e=k*k*(3-2*k),cons=ATL.cons>0?Math.sin(Math.min(1,(1.1-ATL.cons)/1.1)*Math.PI):0;
  for(const A of ATL.bras){
    A.rig.visible=k>.003;if(!A.rig.visible)continue;
    A.rig.position.set(A.s*(G.b+1.05),GAR.POD-1.25*(1-e),-.15);
    let lev=.35,coude=1.15,sw=0,tx=0; // (repère du plateau) le bras GAUCHE (s = +1, en +x) penche vers −x, le droit vers +x : l'inclinaison porte le signe s
    if(cons>0){ // LA CONSTRUCTION : le bras se tend vers la caisse et balaie
      const actif=ATL.cat==='voiture'||ATL.cat==='trainee'||(ATL.cat==='peinture'&&A.s>0)||(ATL.cat==='aile'&&A.s<0);
      if(actif){sw=Math.sin(ATL.t*(ATL.cat==='aile'?14:5))*(ATL.cat==='aile'?.08:.55);lev=.35+.55*cons;coude=1.15-.55*cons;
        if(ATL.cat==='trainee'||ATL.cat==='aile')tx=-.9*cons;}}
    const vie=Math.sin(t*1.3+A.s)*.04;                                          // le servo qui respire
    A.ep.rotation.set(0,sw+tx*.7*A.s,A.s*(-(1-e)*1.0+e*lev+vie));                // Euler XYZ : on PENCHE (z) puis on BALAIE (y)
    A.co.rotation.z=A.s*(e*coude-(1-e)*.3+vie*.5);A.tete.rotation.z=A.s*(.4*e+cons*.3);
    A.diode.material.color.setHex(Math.sin(t*6+A.s*2)>0?(A.s>0?0x5ff0ff:0xffb347):0x222222);
    A.eA=(A.eA||0)+(cons>0&&k>.3?dt*70*Math.max(.35,cons):0);let n9=0;while(A.eA>=1&&n9<8){A.eA-=1;n9++;} // ~70 jets par seconde et par bras, quelle que soit la cadence
    for(let q9=0;q9<n9;q9++){A.tete.updateMatrixWorld(true);ATL.w.set(0,.36,0);A.tete.localToWorld(ATL.w); // la BUSE (au bout de l'outil)
      const dx9=carGroup.position.x-ATL.w.x,dz9=carGroup.position.z-ATL.w.z,dn=Math.max(.3,Math.hypot(dx9,dz9)),ux=dx9/dn*1.4,uz=dz9/dn*1.4; // vers la caisse
      burnPools();
      if(ATL.cat==='peinture'&&A.s>0){const c=ATL.c||{r:.9,g:.4,b:.7};
        burnEmet(BURN.fum,ATL.w.x,ATL.w.y,ATL.w.z,ux+(Math.random()-.5)*.8,-.4+(Math.random()-.5)*.5,uz+(Math.random()-.5)*.8,1.6+Math.random(),.14,.55,.42,c.r,c.g,c.b);}
      else if(ATL.cat==='aile'&&A.s<0){for(let i=0;i<3;i++)burnEmet(BURN.feu,ATL.w.x,ATL.w.y,ATL.w.z,ux*.6+(Math.random()-.5)*3.4,1+Math.random()*2.8,uz*.6+(Math.random()-.5)*3.4,.3+Math.random()*.4,.08+Math.random()*.07,0,1,1,.75+Math.random()*.25,.45);}
      else{burnEmet(BURN.feu,ATL.w.x,ATL.w.y,ATL.w.z,(Math.random()-.5)*2,.6+Math.random()*1.4,(Math.random()-.5)*2,.25+Math.random()*.25,.05+Math.random()*.04,0,.6,.95,1,.4);
        if(ATL.cat!=='voiture'&&Math.random()<.4)burnEmet(BURN.fum,ATL.w.x,ATL.w.y,ATL.w.z,(Math.random()-.5)*.8,.4,(Math.random()-.5)*.8,1.4,.12,.45,.3,.8,.82,.9);}}
  }
  /* (2026-10-07, soir) plus de burnPas ici : burnTick fait vivre les réservoirs à CHAQUE image du garage — burn-out ou pas. Les deux à la fois (quand BURN.k retombait à 0), la fumée VIEILLISSAIT DEUX FOIS PLUS VITE après le lâcher. */
}
window.dbgAtelier=function(a,x,z){
  if(a==='pos'){ATL_POS.x=x;ATL_POS.z=z;if(ATL.btn)ATL.btn.position.set(x,0,z);}
  else if(a===1)invOuvre();else if(a===0)invFerme();else if(typeof a==='string')atlConstruit(a);
  const B=atlBoutonEcran();return {inventaire:!!INV.on,bras:+ATL.k.toFixed(2),construit:+ATL.cons.toFixed(2),cat:ATL.cat,bouton:B?[Math.round(B.x),Math.round(B.y),Math.round(B.r)]:null};
};
document.querySelectorAll('#gInv .ivTab').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();const c=b.getAttribute('data-c');if(!INV.on||c===INV.cat)return;
  uiPop(b);uiClic('onglet');INV.cat=c;if(GAR_TAB_ANG[c]!=null)garTourneVers(GAR_TAB_ANG[c]); /* comme la console : la caisse TOURNE vers ce qu'on habille (TRAÎNÉES : les tuyères) — (2026-10-24, Léo) elle sautait aux traînées et ne bougeait pas pour le reste */
  const g=$('ivGrille');if(g)g.scrollTop=0;invRender();});});
$('ivGrille').addEventListener('click',function(e){const t=e.target.closest('.ivT');if(!t)return;e.stopPropagation();invEquipe(+t.getAttribute('data-i'),t);});
$('ivFerme').addEventListener('click',function(e){e.stopPropagation();uiPop(e.currentTarget);uiClic('retour');invFerme();});
window.dbgInv=function(a,b){if(a==='ouvre')return invOuvre();if(a==='D'){INV.D=+b||.45;return INV.D;}if(a==='cam'){Object.assign(VITRINE_CAM,b||{});return VITRINE_CAM;}if(a==='gabarit')return garGabarit();if(a==='rect'){const r=garCaisseRect();return r&&{x0:Math.round(r.x0),x1:Math.round(r.x1),y0:Math.round(r.y0),y1:Math.round(r.y1)};}if(a==='ferme'){invFerme();return true;}
  if(a==='mvt')return [GAR.vA||0,GAR.vAv||0,GAR.vAc||0,GAR.vD||0]; // (2026-10-05) le banc du tour au doigt : angle, vitesse, cible, décalage
  if(a==='etat')return {vA:GAR.vA||0,vAv:GAR.vAv||0,vD:GAR.vD||0,vDv:GAR.vDv||0,e:GAR.cErr||0,on:GAR.vDon?1:0,ret:GAR.ret?1:0,dV:GAR.dVs||0,cx:GAR.cdx||0,cy:GAR.cdy||0,b:BURN.k||0,inv:INV.on?1:0,vit:GAR.vit||0,gm:GMIS.e||0,vDw:GAR.vDw||0,pose:GAR.vuePose||0}; // (2026-10-06) le banc de la caméra image par image (lisse.mjs)
  if(a==='cat'&&b){INV.cat=b;if(INV.on)invRender();return INV.cat;}
  const g=$('ivGrille');return {on:INV.on,cat:INV.cat,hold:!!INV.hold,tuiles:g?g.querySelectorAll('.ivT').length:0,eq:g?g.querySelectorAll('.ivT.eq').length:0,
    vitrine:!!(gEl&&gEl.classList.contains('vitrine')),aide:!!(gEl&&gEl.classList.contains('aideInv')),vit:+(GAR.vit||0).toFixed(2),vD:+(GAR.vD||0).toFixed(3),wD:+(GAR.wD||0).toFixed(2),cErr:+(GAR.cErr||0).toFixed(3),porte:GAR.porte?+GAR.porte.e.toFixed(2):null,
    compte:['voiture','peinture','aile','trainee'].map(function(c){return c+':'+invListe(c).length;}).join(' ')};};
function garMode(m){
  if(!gEl)return;
  try{uiGarde(320);}catch(e){} // (2026-10-14, chasse aux bugs) changer d'écran de l'atelier (menu ↔ missions ↔ boutique) arme le verrou du double-tap, comme gModeVa : sans volet (HOME des missions, porte MISSIONS de l'accueil), le 2e tap tombait sur l'écran d'arrivée — le JOUER de l'accueil lançait une course
  invFerme(true);invHoldFin();burnFin();gEl.classList.remove('vitrine','deplie','aideInv');const menu=m==='menu'||m==='missions',mis=m==='missions'; // (2026-09-30) MISSIONS = le menu, vu d'en haut, avec la constellation
  if(menu){if(SHOP.tab!=='voiture'||SHOP.prev)shopTab('voiture');const eq=equippedCar();if(garageI!==eq&&!GAR.sw)garageShow(eq);try{gVueSeule(false);}catch(e){}} // au menu : TA caisse, sans essai — (2026-10-12, passe qualité) et l'ŒIL éteint : Échap depuis la vue seule laissait #garage caché, MISSIONS devenait un ciel sans aucun bouton
  const deMenu9=gEl.classList.contains('menu')||gEl.classList.contains('missions');
  gEl.classList.toggle('menu',menu);gEl.classList.toggle('missions',mis);garLibre._r=null;
  if(!menu&&deMenu9){try{gVueSeule(false);gGarageReplie();}catch(e){}} // (2026-10-14, Léo) de l'accueil au garage : REPLIÉ (l'inventaire ne s'ouvre plus tout seul)
  document.body.classList.toggle('garMenuH',menu&&!mis); // (2026-09-30, Sacha) au MENU, ses boutons : l'accueil #mHome par-dessus l'atelier (voir « LE MENU = LE GARAGE + LES BOUTONS DE SACHA »)
  if(menu&&!mis&&window.__mHomeSur)try{window.__mHomeSur();}catch(e){}
  if(menu)try{m2Portes();}catch(e){}
  if(mis)try{gmRender();}catch(e){console.warn('missions',e);}
}
