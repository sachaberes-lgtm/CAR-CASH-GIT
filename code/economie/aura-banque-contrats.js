/* ============================================================================
   L'AURA ET LA BANQUE (2026-08-17) — la nouvelle règle
   ----------------------------------------------------------------------------
   DEUX MONNAIES QUI NE FONT PAS LE MÊME MÉTIER, et c'est tout l'intérêt :
     · L'ARGENT s'accumule en BANQUE d'une partie à l'autre et ACHÈTE les caisses.
       Il récompense la régularité — jouer souvent finit par payer.
     · L'AURA ne s'achète rien. Elle monte sur le STYLE (figures, vitesse tenue,
       décollages), donne un RANG à vie, et le rang ouvre les caisses que l'argent
       ne peut PAS acheter. Elle récompense le panache.
   ⚠ SI L'AURA ACHETAIT AUSSI, elle serait juste un deuxième porte-monnaie et le
   joueur choisirait la monnaie la plus facile à farmer. En la rendant INCONVERTIBLE,
   les deux voies restent nécessaires : le farmeur n'aura jamais LE MANS 24, le
   styliste devra quand même remplir son compte pour rouler en EL PATRON.
   ========================================================================== */
const AURA_RANKS=[ // seuil d'aura → titre. Le ton du jeu : arrogant, cash, second degré.
  {v:0,      n:'ANONYME'},        {v:400,    n:'REMARQUÉ'},
  {v:1500,   n:'ON PARLE DE TOI'},{v:4000,   n:'RÉPUTÉ'},
  {v:10000,  n:'LÉGENDE LOCALE'}, {v:24000,  n:'STAR DU BITUME'},
  {v:55000,  n:'MYTHE'},          {v:120000, n:'DIVINITÉ DU CIEL'},
  {v:250000, n:'PATRON DU CIEL'}, {v:500000, n:'ICÔNE'},          // (2026-10-14, équilibrage) l'aura ne s'arrête plus au bout de 25 minutes :
  {v:1000000,n:'LÉGENDE ÉTERNELLE'},{v:2500000,n:'LE CIEL T\'APPARTIENT'} //   ~8 h de jeu pour un bon joueur, le même ordre que la banque
];
function auraRank(total){ // l'index de rang atteint pour une aura donnée
  const a=total==null?(SAVE.d.aura||0):total;
  let r=0;for(let i=0;i<AURA_RANKS.length;i++)if(a>=AURA_RANKS[i].v)r=i;
  return r;
}
function auraRankName(r){return TR((AURA_RANKS[r==null?auraRank():r]||AURA_RANKS[0]).n);}
function auraSansNom(){return true;} // (2026-10-14, ordre de Sacha : « plus de surnom bizarre, juste l'aura ») sous la charte 6 on n'ÉCRIT plus aucun nom de rang : le chiffre d'aura seul. Les paliers (auraRank, déblocages) ne changent pas.
function auraNext(){ // ce qu'il reste pour le rang suivant (null au sommet)
  const r=auraRank();if(r>=AURA_RANKS.length-1)return null;
  const n=AURA_RANKS[r+1];return {n:n.n,reste:Math.max(0,n.v-(SAVE.d.aura||0)),seuil:n.v};
}
function bank(){return SAVE.d.bank||0;}
function carStat(k){
  if(k==='cash')return SAVE.d.best||0;
  if(k==='bank')return bank();
  if(k==='aura')return auraRank();          // ⚠ un RANG, pas l'aura brute : les seuils restent lisibles
  if(k==='carnet')return (SAVE.d.mis&&SAVE.d.mis.n)|0; // carnets de contrats REMPLIS
  if(k==='carrN')return ((SAVE.d.carr||{}).nuages)|0; // (2026-09-27) niveaux de la carrière NUAGES terminés
  if(k==='carrV')return ((SAVE.d.carr||{}).ville)|0;  // (2026-09-27) niveaux de la carrière VILLE terminés
  return (SAVE.d.ex&&SAVE.d.ex[k])||0;
}
function carRetiree(i){const c=CARS[i];return !!(c&&c.retire);} // (2026-10-02) une caisse RETIRÉE de la gamme (sa ligne reste : les index de sauvegarde ne bougent pas)
function carPrice(i){const u=CAR_UNLOCK[i];return (!carRetiree(i)&&u&&u.p)||0;} // 0 = pas à vendre (une caisse retirée ne se vend plus)
/* LES CINQ FAMILLES (2026-09-26) — une caisse porte sa famille (`rar` dans sa fiche) ; les 16 d'origine la déduisent de leur
   condition : boutique = LÉGENDAIRE, contrat/rang d'aura = DÉFI, prix ≥ 1 M = ÉPIQUE, ≥ 20 000 = RARE, sinon COMMUNE.
   ⚠ LÉGENDAIRE = en BOUTIQUE seulement (vrai argent) : c'est la règle du joueur. */
const RARETES=[
  /* LES SEPT RARETÉS (2026-10-10, Léo : « les voitures DÉFI n'existent plus : il y en aura de plusieurs raretés, selon la difficulté du défi ;
     les principales : communes, rares, exotiques, épiques, légendaires, MYTHIQUE, INFINI » — on pourra en créer d'autres). DÉFI n'est plus une
     famille : une caisse qui se gagne prend la rareté de la difficulté de son défi (rarDefi). LA HONTE est la seule COMMUNE. */
  {id:'commun',    n:'COMMUNES',   n1:'COMMUNE',   c:'#b9c4d6'},
  {id:'rare',      n:'RARES',      n1:'RARE',      c:'#4db8ff'},
  {id:'exotique',  n:'EXOTIQUES',  n1:'EXOTIQUE',  c:'#3ee8a8'},
  {id:'epique',    n:'ÉPIQUES',    n1:'ÉPIQUE',    c:'#c77dff'},
  {id:'legendaire',n:'LÉGENDAIRES',n1:'LÉGENDAIRE',c:'#ffd75e'},
  {id:'mythique',  n:'MYTHIQUES',  n1:'MYTHIQUE',  c:'#ff4d6d'},
  {id:'infini',    n:'INFINIS',    n1:'INFINI',    c:'#ff8af0'}];
const RAR_FAM=RARETES.filter(function(x){return x.id!=='exotique';}); /* (2026-10-18, Sacha) les familles du garage : EXOTIQUE n'a plus d'objet (tout est passé RARE) — elle reste dans RARETES pour le BUMP x3 de la course */
/* la rareté d'une caisse qui se GAGNE = la difficulté de son défi (2026-10-10, posée par Claude, à revoir par Léo dans la salle blanche) :
   contrats 1-3 RARE · 6-7 EXOTIQUE · 8-9 ÉPIQUE ; rang d'aura MYTHE (POSTER 84) LÉGENDAIRE ; 100 pubs ÉPIQUE ; défi encore à définir
   (COMÈTE) EXOTIQUE. (La CAISSE-NUAGE et LE LINGOT, ex-trophées de la carrière, sont à l'argent du jeu : leur famille suit le prix.) */
function rarDefi(u){if(u.k==='carnet')return u.v>=8?'epique':'rare'; /* (2026-10-18, Sacha : « tout les item exotique doivent etre passer en rare ») plus d'EXOTIQUE : les contrats 6-7 et le défi à définir sont RARES */if(u.k==='aura')return u.v>=6?'legendaire':'epique';
  if(u.k==='pubs'||u.k==='runs')return 'epique';return 'rare';}
function carRar(i){const c=CARS[i];if(c&&c.rar&&c.rar!=='defi')return c.rar;const u=CAR_UNLOCK[i];
  if(!u)return 'commun';if(u.k==='premium')return 'legendaire';if(u.k)return rarDefi(u);return u.p>=1e6?'epique':u.p>=20e3?'rare':'commun';}
function carOrdre(i){const c9=CARS[i];if(c9&&c9.ordre!=null)return c9.ordre;return carPrixOrdre(i);} // DANS UNE FAMILLE : un rang posé à la main (la salle
function carPrixOrdre(i){ // blanche, `ordre` sur la fiche) passe devant le prix ; une liste qui MÉLANGE les familles reste au prix (carPrixOrdre)
  const u=CAR_UNLOCK[i];if(!u)return -1;if(u.p)return u.p;if(u.eur)return parseFloat(String(u.eur).replace(',','.'))||0;
  if(u.k==='carnet')return u.v;if(u.k==='aura')return 100+u.v;return 1e9;} // dans une famille : du plus accessible au plus dur
function rarListe(r){const L=[];for(let i=0;i<CARS.length;i++)if(carRar(i)===r&&!carRetiree(i))L.push(i);return L.sort(function(a,b){return carOrdre(a)-carOrdre(b);});}
const RAR_LOGO={commun:'rond',rare:'gemme',exotique:'palmier',epique:'flamme',legendaire:'couronne',mythique:'dragon',infini:'infini',defi:'cible'}; // (2026-10-10, Léo : « trouve les pictogrammes adaptés pour que les gens comprennent exactement ce que c'est ») COMMUNE un simple rond · RARE la gemme · LÉGENDAIRE la couronne · MYTHIQUE le dragon · INFINI le signe ∞ (la roue et la cible étaient le même dessin) // (2026-10-09, Léo : « enlève les nombres de voitures dans chaque rareté, fais des logotypes ») — DÉFI : la cible des missions
function rarInfo(r){return RARETES.find(function(x){return x.id===r;})||RARETES[0];}
function carOwned(i){return !!(SAVE.d.owned&&SAVE.d.owned.indexOf(i)>=0);}
/* LE CODE COUSIN (2026-10-14, Léo : « dans les réglages, tout en bas, un bouton ENTRER UN CODE ; quand quelqu'un tape cousin, il débloque toutes
   les voitures et tous les trucs débloquables ») : RÉGLAGES › ENTRER UN CODE. « cousin » (ou « cousin 1.61 ») pose `SAVE.d.cousin` — et sur
   CET appareil tout est À TOI : les caisses (carUnlockedVrai : en vente, en €, à défi), les habillages (shopOwned), les FIGURES (figPossede),
   tous les niveaux de la carrière. Rien n'est écrit ailleurs (l'argent, l'aura et les records ne bougent pas) ; EFFACER MA PROGRESSION l'enlève. */
function codeCousin(t){const k=String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  if(k!=='cousin'&&k!=='cousin161')return false;SAVE.d.cousin=1;SAVE.flush();try{GBQ.rk='';GBQ.uk='';}catch(e){}
  try{carSnapshot();}catch(e){} // (2026-10-14) la photo des caisses acquises suit : sans elle, la partie suivante criait « NOUVELLE CAISSE » ~70 fois au 1er gain
  return true;}
function cousin(){try{return !!SAVE.d.cousin;}catch(e){return false;}} // (SAVE peut ne pas exister encore : le tout premier buildCar tourne avant lui)
/* (2026-10-14, Sacha, après la revue des idées de Léo : « le code cousin ne débloque PLUS rien de ce qui se paie en euros ») un code partageable
   vidait la boutique en vrai argent (et l'App Store, règle 3.1.1, interdit d'ouvrir un contenu payant autrement que par l'achat). Il garde tout le
   reste : caisses à l'argent du jeu et à défi, habillages, figures, niveaux. `carEuros(i)` = la caisse se vend en € (le futur pack de peintures
   devra lire la même règle). */
function carEuros(i){const u=CAR_UNLOCK[i];return !!(u&&(u.k==='premium'||u.eur));}
/* (2026-09-26, user : « pour la version test donne-moi accès à toutes les voitures mais en laissant les conditions d'obtention »)
   TEST_CAISSES : toutes les caisses s'ÉQUIPENT, mais la fiche du garage continue d'écrire la VRAIE condition (voir garageShow).
   ⚠ à remettre à false pour la version publique : c'est l'unique interrupteur. */
const TEST_CAISSES=true; // false : les caisses se GAGNENT (c'était l'édition des portails, retirée le 14/10)
function carUnlocked(i){return !carRetiree(i)&&(TEST_CAISSES||carUnlockedVrai(i));}
/* (2026-09-30) ⚠ carUnlocked OUVRE (équiper, JOUER) ; ce qui dit AU JOUEUR où il en est — « une caisse à ta portée » (objectif, garPortee,
   pastille du GARAGE), « nouvelle caisse gagnée » (carSnapshot/carScan) et le bouton ACHETER — lit carUnlockedVrai : en TEST tout était
   « déjà à toi », le testeur ne voyait jamais la boucle achat → caisse que vivra le joueur. */
function carUnlockedVrai(i){
  if(carRetiree(i))return false; // (2026-10-02) retirée : ni à toi, ni à gagner
  if(cousin()&&!carEuros(i))return true; // (2026-10-14) LE CODE COUSIN : toutes les caisses — (même jour, Sacha) SAUF celles qui se paient en EUROS
  if(i<=((SAVE.d.ex&&SAVE.d.ex.floor)|0))return true; // acquise sous les anciennes règles : elle le reste
  const u=CAR_UNLOCK[i];
  if(!u)return true;
  if(u.p||u.k==='premium')return carOwned(i); // caisse à vendre (argent du jeu OU boutique) : possédée ou rien
  return carOwned(i)||carStat(u.k)>=u.v; // caisse à défi : rang d'aura, carrière, pubs… — (2026-10-06) ACHETÉE avant de devenir un défi (L'ÉTERNELLE, COMÈTE), elle le reste
}
/* ============================================================================
   L'ÉCONOMIE v3 — LES CONTRATS, L'OBJECTIF, LA BOUTIQUE (2026-09-25)
   ----------------------------------------------------------------------------
   L'ARGENT N'A QU'UN MÉTIER : S'OFFRIR QUELQUE CHOSE. Tout ce bloc sert à ce que le joueur SACHE, à
   chaque fin de partie, ce qu'il vise, combien il lui manque, et que ça avance sous ses yeux :
     · L'OBJECTIF — la prochaine caisse à vendre (puis le prochain article) : une barre sur l'écran de
       mort, que le virement de la partie remplit en direct. Quand elle est pleine : « À TOI ! ».
     · LES CONTRATS — trois missions courtes à la fois, toutes « dans une partie ». Chacune paie une
       PRIME versée tout de suite en BANQUE (jamais perdue en vol : c'est un salaire, pas une mise).
       Un carnet rempli débloque ce qui NE S'ACHÈTE PAS : trois caisses, puis une peinture, puis une
       traînée ; au-delà, une suite sans fin de carnets qui paient en argent.
     · LA BOUTIQUE — peintures, ailes, traînées, essayées sur la VRAIE caisse dans l'atelier 3D.
   ⚠ Rien ici ne touche au bank-or-bust : la mallette en vol part toujours en fumée.
   ========================================================================== */
const RUNX={coins:0,fruits:0,perfect:0,t:0,nitro:0,fren:0,frenMax:0}; // ce que `runStats` ne comptait pas (v3 : frénésies de la partie, la plus longue en s)
const RAM={p0:new THREE.Vector3(),ok:false,face:1,fv:0,n:[0,0,0,0,0,0,0,0]}; // (2026-09-30) LE RAMASSAGE (pickupsTick) : la caisse à l'image d'avant (un saut décroche) · la face lue · compteurs du banc : pièces/fruits/cristaux au sol, puis en vol, accrochés, filet
/* LE NITRO SE GAGNE AU STYLE (2026-09-25) : une figure encaissée et un bump rechargent la réserve orange, dans la limite
   du réservoir du moteur. La jauge FLASHE : le joueur doit relier le geste à la récompense. */
/* LE CHRONO DE VOL v2 (2026-09-25) — « le camembert pixel ne correspond pas au reste ». Après la charte v3 (boutons arrondis,
   anneau du NITRO), un disque en blocs de 4 px jurait. Il devient le JUMEAU de l'anneau du bouton NITRO : un cadran de verre
   sombre, une piste grise et l'ARC du temps restant (vert → or → rouge, cyan sous « AIR ∞ »), extrémités arrondies, un halo
   à la couleur de l'urgence, et les secondes au centre. Dessiné en ×2 pour un trait net sur écran Retina, et SEULEMENT quand
   l'image change (arc au 1/200, dixième de seconde). */
function airPieDraw(fr,sec,flash){
  // (2026-09-28, Sacha : « le camembert air time n'a pas l'air de ressembler à la barre de nitro et au compteur ») LE CHRONO DE VOL v3 :
  // un bloc du HUD (#airHud) de la main de la jauge NITRO — plus un cadran. On n'écrit que ce qui change : la part restante (--a, au
  // 1/120), les secondes (au dixième), l'état de couleur (data-k : ok cyan · moyen or · urgent rouge · inf = AIRTIME INFINI) et le flash
  // « on regagne du temps ». La cadence d'avant est gardée (les deux seuils tombent sur les mêmes crans).
  const q=Math.round(fr*120+.5),s10=Math.round(sec*10),k=(pwrAirT>0&&TUTO.pa)?'inf':fr>.4?'ok':(fr>.2?'moyen':'urgent'),key=q+'|'+s10+'|'+k+'|'+flash;
  if(airPieDraw._k===key)return;airPieDraw._k=key;
  const el=airPieDraw.el||(airPieDraw.el=document.getElementById('airHud'));if(!el)return;
  const S=airPieDraw.s||(airPieDraw.s=el.querySelector('.ahS'));
  el.style.setProperty('--a',Math.max(0,Math.min(1,q/120)).toFixed(3));
  const t9=decFr(s10/10,1);if(S&&S.textContent!==t9)S.textContent=t9; // (passe qualité) « 5,3 » en français
  if(el.dataset.k!==k)el.dataset.k=k;
  if(!!flash!==el.classList.contains('flash'))el.classList.toggle('flash',!!flash);
}
/* (2026-09-28) `airPiePx` (les cases cuites du cadran pixel) a disparu avec le cadran : le chrono de vol est un bloc du HUD (#airHud). */

/* LE BALAYAGE PIXEL DORÉ (2026-10-14, UX 8 · transitions) — la SIGNATURE de CASH CAR : le rideau devient une mosaïque de gros pixels qui balaie
   l'écran en diagonale (haut-gauche → bas-droite pour COUVRIR, retour en sens inverse pour DÉCOUVRIR), front d'or, corps de laque sombre.
   UN canvas 2D plein écran créé une fois, dessiné au rAF SEULEMENT pendant le balayage, puis `display:none`. Même contrat de temps qu'avant
   (couvert à 150 ms, `fn` à 160 ms, la classe se vide à 460 ms après le lever). Sous « réduire les animations » : l'ancien rideau (ou
   son fondu simple) reste. */
const WIPEPX={cv:null,cx:null,ph:'',t0:0,raf:0,W:0,H:0,nc:0,nr:0,rn:null};
function wipePxOk(){return !REDUCED_MOTION&&document.documentElement.getAttribute('data-reduced-motion')!=='1';}
function wipePxDraw(now){
  const P=WIPEPX;if(!P.ph)return;const cx=P.cx,nc=P.nc,nr=P.nr,cw=P.W/nc,ch=P.H/nr,out=P.ph==='out';
  const t=(now-P.t0)/(out?280:150);cx.clearRect(0,0,P.W,P.H);
  for(let j=0;j<nr;j++)for(let i=0;i<nc;i++){
    const d=(i+j)/(nc+nr-2),h=P.rn[j*nc+i];
    let p=out?1-Math.min(1,Math.max(0,(t-(1-d)*.55)/.45)):Math.min(1,Math.max(0,(t-d*.55)/.45));
    if(p<=0)continue;
    const sc=Math.ceil(p*4)/4; // 4 crans : le pixel POP, il ne grossit pas en douceur
    cx.fillStyle=p<.6?(h%9===0?'#fff3b0':'#ffd75e'):(h%3===0?'#0d0a1c':'#07050f');
    const x0=Math.floor(i*cw+cw*(1-sc)/2),y0=Math.floor(j*ch+ch*(1-sc)/2),x1=Math.ceil(i*cw+cw*(1+sc)/2),y1=Math.ceil(j*ch+ch*(1+sc)/2);
    cx.fillRect(x0,y0,x1-x0,y1-y0); }
  if(out&&t>=1.2)wipePxEnd(); }
function wipePxLoop(now){WIPEPX.raf=0;if(!WIPEPX.ph)return;wipePxDraw(now);if(WIPEPX.ph)WIPEPX.raf=requestAnimationFrame(wipePxLoop);}
function wipePxStart(w,ph){
  const P=WIPEPX;
  if(!P.cv){P.cv=document.createElement('canvas');P.cv.className='ux8Cv';P.cx=P.cv.getContext('2d');w.appendChild(P.cv);}
  if(P.cv.parentNode!==w)w.appendChild(P.cv);
  if(ph==='in'){ const W=Math.max(1,innerWidth|0),H=Math.max(1,innerHeight|0),nc=Math.max(2,Math.round(W/28)),nr=Math.max(2,Math.round(H/28));
    if(W!==P.W||H!==P.H||!P.rn){P.W=P.cv.width=W;P.H=P.cv.height=H;P.nc=nc;P.nr=nr;P.rn=new Uint8Array(nc*nr);for(let k=0;k<P.rn.length;k++)P.rn[k]=(k*2654435761>>>13)&255;}
    P.cv.style.display='block'; }
  P.ph=ph;P.t0=performance.now();w.classList.add('ux8Wipe');
  if(!P.raf)P.raf=requestAnimationFrame(wipePxLoop); }
function wipePxEnd(){const P=WIPEPX;P.ph='';if(P.raf){cancelAnimationFrame(P.raf);P.raf=0;}if(P.cv){P.cx.clearRect(0,0,P.W,P.H);P.cv.style.display='none';}}
/* LE FONDU AU NOIR (2026-09-25, user : « les transitions entre les écrans, niveau App Store ») — remplace le rideau à
   cinq barres en `steps()`. C'est le geste des jeux premium quand le DÉCOR change (atelier, boutique, nouvelle course) :
   le voile MONTE en 200 ms, on bascule DESSOUS — même la première construction de l'atelier, qui fige le fil
   d'exécution, s'y cache —, on laisse la scène 3D dessiner DEUX images (sinon on redécouvrirait l'ancien décor le temps
   d'une frame), puis le voile se RETIRE sur la courbe unique (`--ease`, `--t-slow`). `apres` (facultatif) part à l'instant
   où l'on redécouvre : c'est là que le LÂCHER du garage doit démarrer, sous les yeux du joueur. Pendant un fondu, un
   second est IGNORÉ : le voile intercepte déjà le doigt, et au clavier un double Entrée n'ouvrira pas l'atelier deux fois. */
function ecranWipe(fn,apres){
  let w=document.getElementById('wipe');
  if(!w){w=document.createElement('div');w.id='wipe';w.setAttribute('aria-hidden','true');document.body.appendChild(w);}
  if(ecranWipe._on)return;ecranWipe._on=true;const id=ecranWipe._id=(ecranWipe._id|0)+1;
  try{uiGarde(520);}catch(e){} // (2026-10-12, passe qualité) le VOLET arme le verrou du double-tap : le 2e tap d'un HOME du garage tombait sur le JOUER de l'accueil (~200-350 ms) et lançait une course
  w.className='in';const px=wipePxOk();if(px)wipePxStart(w,'in');try{if(SONV2)sfx('ui.volet');else noiseBurst(.18,.05,1800);}catch(e){} // (2026-09-28) le son du volet : session SON
  setTimeout(function(){
    try{fn();}catch(e){console.error(e);}
    let leve=false;
    const lever=function(){ if(leve)return;leve=true;
      w.className='out';if(px)wipePxStart(w,'out');ecranWipe._on=false; // la main revient DÈS que l'écran se redécouvre (le voile qui s'efface ne bloque plus rien)
      try{typeof sfx==='function'&&sfx('ui.voletSort');}catch(e){}
      document.body.classList.add('voletSort');clearTimeout(ecranWipe._vs);ecranWipe._vs=setTimeout(function(){document.body.classList.remove('voletSort');},480); // (charte v4) le contenu est DÉJÀ en place quand le volet le découvre
      if(apres){try{apres();}catch(e){console.error(e);}}
      try{document.dispatchEvent(new Event('cc:revele'));}catch(e){} // la coque rejoue l'entrée de l'écran qu'on découvre
      document.querySelectorAll('#mob .mscr.on').forEach(function(e){e.classList.add('revu');}); // (charte v5) …mais c'est le VOLET qui a fait l'entrée : elle ne se rejouera pas quand il s'en va
      setTimeout(function(){if(ecranWipe._id===id){w.className='';wipePxEnd();}},REDUCED_MOTION?160:460); }; // un fondu relancé entre-temps garde son voile
    requestAnimationFrame(function(){requestAnimationFrame(lever);});
    setTimeout(lever,160); // filet : onglet caché = aucune image, le voile ne doit jamais rester collé
  },REDUCED_MOTION?120:160); // (2026-10-11, passe UX) 210 → 160 ms : le volet entre en 150 ms (voir <style id="uxPasse">), l'écran change dès qu'il couvre
}
function uiPop(el){ // le rebond d'un bouton relâché (re-déclenchable : on retire, on force un reflow, on remet)
  if(!el||!el.classList||REDUCED_MOTION)return;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
  clearTimeout(el._popT);el._popT=setTimeout(function(){el.classList.remove('pop');},300);
}
/* L'APPUI SOUS LE DOIGT (2026-09-28, soir — Sacha : « travaille les animations quand tu cliques sur les boutons »). Sur iPhone, `:active`
   ne se peint pas pour un tap bref : la touche ne s'enfonçait jamais à l'œil. `.appui` est posée AU CONTACT (pointerdown, en capture) sur
   la touche visée, et tenue au moins 90 ms — un tap de 40 ms se VOIT. Chaque règle `:active` de la charte a sa jumelle `.appui` (même
   spécificité). Au contact : le visuel et le micro-tic de la touche qui s'enfonce (sfx 'ui.appui', session SON, gardé) ; le son d'action
   et la vibration restent au relâcher (uiClic) — un seul coup dans le pouce. Un glissé (défilement, bande du garage) annule : pointercancel.
   Hors course seulement : le volant et la nitro ont leurs propres états. */
const APPUI_SEL='.pbtn,.mLigne,.tp,.gT,.gTab,.gR,.mMode,.misPrix.voir,.mObj[data-m],.shUne,.shCase';
(function(){let cur=null,t0=0;
  const lache=function(){if(!cur)return;const el=cur;cur=null;const r=Math.max(0,90-(performance.now()-t0));
    clearTimeout(el._apT);if(r)el._apT=setTimeout(function(){el.classList.remove('appui');},r);else el.classList.remove('appui');}; // (2026-09-29) re-appui rapide : l'ancien retrait différé ne l'éteint plus sous le doigt
  addEventListener('pointerdown',function(e){if(e.button>0)return;
    const el=e.target&&e.target.closest?e.target.closest(APPUI_SEL):null;
    if(!el||el.closest('#tNitroZone,#tSteer,#touchCtl,#tNitro'))return;
    if(cur&&cur!==el)cur.classList.remove('appui');clearTimeout(el._apT);cur=el;t0=performance.now();el.classList.add('appui');
    if(!el.classList.contains('off')&&!el.classList.contains('arme'))try{typeof sfx==='function'&&sfx('ui.appui');}catch(err){}},{capture:true,passive:true});
  addEventListener('pointerup',lache,{capture:true,passive:true});
  addEventListener('pointercancel',lache,{capture:true,passive:true});
  addEventListener('blur',lache);
  document.addEventListener('visibilitychange',lache); // (2026-09-29) l'appli part en arrière-plan en plein appui : la touche ne reste pas enfoncée
})();
/* L'APPUI POUR TOUS (2026-10-17, session UI-REVUE, Sacha : « je veux une animation et un son pour chaque bouton »). La charte a son
   enfoncement (`.appui` ci-dessus) pour ses familles de touches (APPUI_SEL) ; tout le reste de ce qui se touche — une ligne de mission, une
   case de la boutique, un hexagone de figure, une puce, une étiquette, la croix d'une fenêtre… — ne bougeait pas sous le doigt (relevé au
   banc : le :active seul ne se peint pas sur iPhone pour un tap bref). Même cible que le filet des sons (même liste, ou un curseur « main »),
   même tenue (90 ms au moins), même micro-tic au contact : la touche se TASSE (scale ×0,94 en --t-press) et revient en --t-fast sur la
   courbe de la charte. Propriété individuelle `scale` par l'API d'animation : elle s'ajoute au transform/translate de l'élément au lieu de
   l'écraser, ne touche ni à ses transitions ni à ses animations CSS, et se joue au compositeur. Un curseur (volume, réglages) prend la
   classe `.tient` le temps du geste : son bouton grossit (voir <style id="uiRevue">). Hors course, hors canvas, hors champs de texte,
   jamais un écran entier (#overlay est role=button). `?appui=0` = comme avant. */
const APPUI_TOUT='button,a[href],[role="button"],[role="tab"],[role="switch"],[role="menuitem"],[role="option"],[role="checkbox"],[data-m],[data-a],[data-c],[data-go],[data-tab],summary,label';
const APPUI_TOUS=!/[?&]appui=0\b/.test(location.search);
(function(){if(!APPUI_TOUS)return;let cur=null,anim=null,t0=0,base=1,glis=null;
  const EASE='cubic-bezier(.32,.72,0,1)';
  /* la touche visée : la plus proche qui SE DIT touchable (rôle, data-*, bouton), à 7 étages au plus ; sinon celle qui POSE le curseur main
     (il s'hérite : l'enfant sous le doigt l'a aussi — on remonte jusqu'au dernier parent qui l'a encore) */
  const cible=function(t){const e0=t&&t.nodeType===1?t:(t&&t.parentElement);if(!e0||!e0.closest)return null;
    if(e0.closest('canvas,[data-muet],#tNitroZone,#tSteer,#touchCtl,#tNitro,#tLeft,#tRight')||e0.closest(APPUI_SEL))return null; /* la charte a déjà son enfoncement */
    if(e0.closest('#hud')&&!e0.closest('#garage'))return null; /* le HUD de course n'est pas une touche */
    let el=e0.closest(APPUI_TOUT);
    if(el){let x=e0,n=0;while(x&&x!==el&&n<8){x=x.parentElement;n++;}if(x!==el)el=null;}
    if(!el){let x=e0,haut=null;for(let n=0;x&&n<7&&x!==document.body;n++,x=x.parentElement){let c='';try{c=getComputedStyle(x).cursor;}catch(_){}if(c==='pointer')haut=x;else if(haut)break;}el=haut;}
    if(!el||el===document.body||el===document.documentElement||el.classList.contains('arme'))return null;
    if(el.matches('input,textarea,select,option'))return null;
    const r=el.getBoundingClientRect();if(r.width<4||r.height<4||r.width*r.height>innerWidth*innerHeight*.35)return null;
    return el;};
  const echelle=function(el){const s=getComputedStyle(el).scale;const v=parseFloat(s);return (s&&s!=='none'&&isFinite(v)&&v>0)?v:1;};
  const lache=function(){
    if(glis){glis.classList.remove('tient');glis=null;}
    if(!cur)return;const el=cur,b0=base;cur=null;anim=null;
    const go=function(){let v=b0*.94;try{v=echelle(el);}catch(x){}
      try{if(el._apA)el._apA.cancel();el._apA=el.animate([{scale:String(v)},{scale:String(b0)}],{duration:REDUCED_MOTION?1:140,easing:EASE});}catch(x){}};
    const r=Math.max(0,90-(performance.now()-t0));if(r)setTimeout(go,r);else go();};
  addEventListener('pointerdown',function(e){if(e.button>0)return;
    const t=e.target;
    if(t&&t.type==='range'&&!t.closest('#touchCtl')){glis=t;t.classList.add('tient');return;}
    const el=cible(t);if(!el||typeof el.animate!=='function')return;
    if(cur&&cur!==el)lache();
    try{if(el._apA)el._apA.cancel();}catch(x){} /* un appui rapide après un autre : on repart de l'échelle VRAIE de la touche */
    cur=el;t0=performance.now();base=echelle(el);
    if(!REDUCED_MOTION)try{anim=el._apA=el.animate([{scale:String(base)},{scale:String(base*.94)}],{duration:70,easing:EASE,fill:'forwards'});}catch(x){anim=null;}
    if(!el.classList.contains('off')&&el.getAttribute('aria-disabled')!=='true')try{typeof sfx==='function'&&sfx('ui.appui');}catch(err){}},{capture:true,passive:true});
  addEventListener('pointerup',lache,{capture:true,passive:true});
  addEventListener('pointercancel',lache,{capture:true,passive:true});
  addEventListener('blur',lache);
  document.addEventListener('visibilitychange',lache);
})();
/* LE VERROU DU DOUBLE-TAP (2026-09-29, audit de sortie) : iOS envoie un `click` par tap. Un double-tap sur RETOUR ouvrait l'accueil au 1er
   tap et lançait une COURSE au 2e (JOUER est dessous, encore transparent mais déjà touchable) ; un double-tap sur ANNULER traversait la
   fenêtre qui s'efface et tombait sur REPRENDRE ; un double-tap sur un monde de la carrière lançait un niveau qu'on n'avait pas choisi.
   Chaque changement d'écran ou de feuille pose `uiGarde()` : pendant 320 ms, les clics d'un vrai doigt sont avalés. Les `.click()`
   programmés (interrupteurs, Entrée, Échap) passent : `isTrusted` est faux pour eux. */
function uiGarde(ms){uiGarde.t=Math.max(uiGarde.t||0,performance.now()+(ms||320));}
addEventListener('click',function(e){if(e.isTrusted&&performance.now()<(uiGarde.t||0)){e.stopPropagation();e.preventDefault();}},true);
function countUp(el,to,fmt){ // un chiffre qui MONTE (départ franc, arrivée douce) — l'aura se compte, elle ne s'affiche pas
  if(!el)return;const t0=performance.now(),D=900;fmt=fmt||function(v){return Math.round(v);};
  if(REDUCED_MOTION||to<=0){el.textContent=fmt(to);return;}
  (function f(){const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(f);})();
}
/* LE DRIFT MINI-TURBO (2026-09-25) : tenir un drift CHARGE des étincelles aux roues arrière — bleues (0,5 s), or (1 s),
   roses (1,7 s). Au relâcher, le niveau atteint part en MINI-TURBO : une poussée, un coup de boost, et de la nitro rendue.
   Le geste que tous les jeux de caisse arcade ont rendu jouissif, posé sur la physique existante (la caisse pivote plus,
   perd un soupçon de vitesse en glisse — et la récupère au centuple à la sortie). */
let driftC=0,driftLv=0,driftSpk=0,driftEnCours=false,driftArm=0,driftCd=0,fovPunch=0,carRoll9=0,rollV=0,susY=0,susV=0,pitch9=0,raseT=0,raseAnn=false;const DRIFT_V=new THREE.Vector3(),EXV=new THREE.Vector3(); // EXV : la vitesse monde de la caisse, héritée par les étincelles d'échappement
