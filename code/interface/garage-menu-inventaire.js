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
function cosmRar(cat,d){if(!d)return 'commun';if(d.r)return d.r;if(cat==='figure')return !d.p?'commun':d.p<=12000?'rare':d.p<=25000?'epique':'legendaire'; // (2026-10-14) une figure : sa rareté suit son prix
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
      return '<div class="ivT r-'+o.r+'" data-i="'+o.i+'" role="button" tabindex="0" aria-label="'+nmA+' · '+sansAcc(TR(ri.n1))+'" style="--rc:'+ri.c+';--rg:'+invRgba(ri.c,.26+.42*lu)+';--rf:'+invRgba(ri.c,.06+.18*lu)+';--rk:'+lu+';--n:'+n+'">'+fig+'<b>'+nmA+'</b><small>'+sansAcc(TR(ri.n1))+'</small><u>'+(o.cat==='figure'&&FIGV2.on&&o.eq?figSlots().map(function(x,i9){return x===o.d.id?pxi(FIG_FAM[i9][2]):'';}).join(''):pxi('coche'))+'</u></div>';}).join(''); /* (LES FIGURES v2) une figure équipée porte le NUMÉRO de son emplacement (1 · 2 · 3 = les boutons de vol) */
    if(INV.cat==='voiture')setTimeout(function(){if(!INV.on)return;g.querySelectorAll('.ivT').forEach(function(el){if(!el.querySelector('.ivPh'))return;const i=+el.getAttribute('data-i');
      photoFile(i,function(url){const v=el.querySelector('.ivPh');if(!v||!el.isConnected)return;const im=document.createElement('img');im.alt='';im.src=url;v.replaceWith(im);});});},420); // les photos manquantes APRÈS l'entrée du tiroir (une photo = deux caisses rebâties : pas pendant qu'il glisse)
  }
  const eqs={};L.forEach(function(o){if(o.eq)eqs[o.i]=1;});
  g.querySelectorAll('.ivT').forEach(function(el){el.classList.toggle('eq',!!eqs[+el.getAttribute('data-i')]);});
}
function invOuvre(){
  if(!INV||INV.on||GAR.go||!garAtelierLibre())return false;
  if(SHOP.tab!=='voiture'||SHOP.prev)shopTab('voiture');{const eq=equippedCar();if(GAR.sw&&!GAR.sw.fait)GAR.sw.to=eq;else if(garageI!==eq)garageShow(eq);} /* (2026-10-07, audit avant publication ; une bascule en cours vise désormais TA caisse) l'inventaire équipe TA caisse : la fiche revient sur elle (sinon le plateau montrait la caisse équipée sous le nom et le prix d'une autre) */
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
  if(!INV.on||GAR.go)return;uiPop(el);const cat=INV.cat;if(GAR_TAB_ANG[cat]!=null)garTourneVers(GAR_TAB_ANG[cat]); /* (2026-10-24, Léo : « quand on sélectionne, ça ne tourne pas vers l'autre ») toucher un objet ramène la caisse face à ce qu'il habille (le plateau l'avait fait dériver) */
  if(cat==='figure'){const f=window.FIG&&FIG.liste[i];if(f){if(FIGV2.on)figEqToast(f.id);garFigEssai(f.id,figEquipee(f.id));}hap(8);invRender();return;} // (2026-10-14) toucher une figure : la caisse la fait sur le plateau — (LES FIGURES v2) et elle prend (ou rend) son emplacement
  if(cat==='voiture'){if(i===equippedCar()){uiClic('nav');return;}if(!carUnlocked(i))return;
    SAVE.d.equipped=i;SAVE.flush();level=i;levelCash=0;garageSaute(i);}       // le même geste que ÉQUIPER : la caisse de départ — et la bascule du plateau
  else{const d=COSM[cat][i];if(!d)return;if(shopEqD(cat)===d){uiClic('nav');return;}if(!shopEquip(cat,i))return; /* (2026-10-14, session SON) toucher ce qui est DÉJÀ équipé répond d'un tick (muet avant) */
    SHOP.prev=null;buildCar(CARS[equippedCar()]);GAR.pressT=GAR.PRESS_D;}     // l'habillage se pose sur la caisse (elle accuse le coup)
  try{if(SONV2)sfx('ui.equipe');else fanfare();}catch(er){}hap(10);
  try{if(cat==='peinture'){const d9=COSM.peinture[i]||{},c9=d9.c!=null?d9.c:(d9.grad?d9.grad[1]:0xff7a3a);ATL.c=new THREE.Color(c9);}atlConstruit(cat);}catch(er){} // (même soir) LES OUTILS construisent l'objet
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
