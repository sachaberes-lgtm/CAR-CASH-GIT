(function(){
'use strict';
if(window.CC_COLONNE)return; // (2026-09-28) sur l'ordi cette page n'est que le CADRE : le jeu tourne dans la colonne (voir <head>)
/* ================= LES ICÔNES PIXEL (2026-09-24) =================
   ⚠ POURQUOI : la police pixel du jeu n'a AUCUN des symboles d'interface (✕ ◀ ▶ ⚙ ⏸ ↻ ★ ✓ — mesuré) ; ils
   tombaient dans la police du système ou en EMOJI, chacun avec sa facture, ses couleurs, son épaisseur —
   l'exact contraire du titre CASH CAR, où chaque pixel est posé. Ici, chaque icône est une grille 9 × 9
   dessinée à la main, convertie UNE fois en SVG et posée en MASQUE CSS : elle prend la couleur de son
   bouton (`currentColor`), reste nette à toutes les tailles (`crispEdges`) et ne coûte aucun fichier.
   Usage : `<i class="pxi pxi-croix"></i>` dans le HTML, `pxi('croix')` dans le JS. */
const PXI_G={coeur:'.........|.##...##.|####.####|#########|#########|.#######.|..#####..|...###...|....#....',vibre:'..#####..|#.#...#.#|#.#...#.#|..#...#..|#.#...#.#|#.#...#.#|..#...#..|..#.#.#..|..#####..',aimant:'##.....##|.........|##.....##|##.....##|##.....##|###...###|.#######.|..#####..|.........',bouclier:'#########|##.....##|##.....##|##.....##|.##...##.|.##...##.|..##.##..|...###...|....#....',nuage:'.........|.........|....##...|...####..|.##.####.|#########|#########|.#######.|.........',immeuble:'....#....|...###...|...###.##|##.###.##|##.###.##|#########|#########|#########|.........',flamme:'....#....|...##....|...###...|..####.#.|..######.|.###.###.|.##...##.|.##...##.|..#####..',pinceau:'......###|.....####|....####.|...####..|..####...|.#.##....|###......|###......|.#.......',aile:'.........|#........|##.......|###......|#####....|.#######.|..#######|....#####|.......##',trainee:'.........|##.......|.###.....|..####...|...######|..####...|.###.....|##.......|.........',pouce:'...##....|...##....|...##....|...####..|.#######.|.########|.#######.|..#####..|..#####..',cadeau:'.##...##.|#..#.#..#|.#######.|#########|#...#...#|####.####|.#..#..#.|.#..#..#.|.#######.',cible:'..#####..|.#.....#.|#..###..#|#.#...#.#|#.#.#.#.#|#.#...#.#|#..###..#|.#.....#.|..#####..',croix:'##.....##|###...###|.###.###.|..#####..|...###...|..#####..|.###.###.|###...###|##.....##',gauche:'....##...|...###...|..####...|.#####...|######...|.#####...|..####...|...###...|....##...',droite:'...##....|...###...|...####..|...#####.|...######|...#####.|...####..|...###...|...##....',haut:'.........|....#....|...###...|..#####..|.#######.|#########|...###...|...###...|...###...',bas:'...###...|...###...|...###...|#########|.#######.|..#####..|...###...|....#....|.........',lecture:'##.......|####.....|######...|########.|#########|########.|######...|####.....|##.......',pause:'.........|###...###|###...###|###...###|###...###|###...###|###...###|###...###|.........',son:'....#....|...##..#.|####.#..#|####.#..#|####.#..#|####.#..#|...##..#.|....#....|.........',muet:'....#....|...##....|####..#.#|####...#.|####..#.#|####.....|...##....|....#....|.........',musique:'...######|...#....#|...#....#|...#....#|.###..###|####.####|####.####|.##...##.|.........',volant:'..#####..|.#.....#.|#.......#|#..###..#|#########|#...#...#|#...#...#|.#..#..#.|..#####..',fleches:'.........|..#...#..|.##...##.|###...###|###...###|###...###|.##...##.|..#...#..|.........',eclair:'.....###.|....###..|...###...|..######.|.....##..|....##...|...##....|..##.....|.#.......',drapeau:'#.#.#.#.#|##.#.#.#.|#.#.#.#.#|##.#.#.#.|#.#.#.#.#|#........|#........|#........|#........',voiture:'.........|.........|..####...|.#..#.#..|########.|#########|#########|.##...##.|.##...##.',rampe:'.........|.........|........#|......###|.....####|...######|.########|#########|.........',brique:'#########|#...#...#|#########|..#...#..|#########|#...#...#|#########|..#...#..|#########',copier:'...###...|.##...##.|.#######.|.#.....#.|.#.###.#.|.#.....#.|.#.###.#.|.#.....#.|.#######.',importer:'....#....|....#....|..#.#.#..|...###...|....#....|#.......#|#.......#|#########|.........',corbeille:'...###...|#########|.#.....#.|.#.#.#.#.|.#.#.#.#.|.#.#.#.#.|.#.#.#.#.|.#.....#.|..#####..',rejouer:'..#####..|.#.....##|#.....###|#........|#........|#.......#|#.......#|.#.....#.|..#####..',quitter:'#####....|#...#....|#...#.#..|#...#.##.|#..######|#...#.##.|#...#.#..|#...#....|#####....',verrou:'..#####..|.#.....#.|.#.....#.|#########|#########|####.####|####.####|#########|#########',coche:'.........|........#|.......##|#.....##.|##...##..|.##.##...|..###....|...#.....|.........',etoile:'....#....|....#....|...###...|#########|.#######.|..#####..|..##.##..|.##...##.|.#.....#.',trophee:'#########|#.#####.#|#.#####.#|.#######.|..#####..|...###...|....#....|..#####..|.#######.',rotation:'..#####..|.#.....##|#.....###|#........|#..###...|#..#.#..#|#..###..#|.#.....#.|..#####..',panier:'.........|#........|.#######.|.#.#.#.#.|.#######.|..#.#.#..|..#####..|..#...#..|.........',bulle:'.#######.|#.......#|#.#.#.#.#|#.......#|.###.###.|...#.#...|...##....|...#.....|.........',piece:'..#####..|.#.....#.|#..###..#|#.#.....#|#..###..#|#.....#.#|#..###..#|.#.....#.|..#####..',maison:'....#....|...###...|..#####..|.#######.|#########|.#######.|.##...##.|.##...##.|.##...##.',horloge:'..#####..|.#..#..#.|#...#...#|#...#...#|#...###.#|#.......#|#.......#|.#.....#.|..#####..',triade:'....#....|...###...|...###...|..##.##..|.##.#.##.|.###.###.|#########|#########|.........'};
PXI_G.reglages='....###....|.##.###.##.|.#########.|..#######..|####...####|####...####|####...####|..#######..|.#########.|.##.###.##.|....###....'; // (2026-10-15, Sacha : « fais un truc qui ressemble vraiment à un engrenage ») l'ancien 9 × 9 lisait un SOLEIL (huit rayons d'un pixel) ; un rouage, ce sont des DENTS carrées séparées par des creux et un MOYEU percé — il faut 11 × 11 pour que les trois tiennent
PXI_G.coffre='.#######.|#.......#|#.......#|#########|#...#...#|#..###..#|#...#...#|#.......#|#########'; // (2026-10-05) le COFFRE : l'inventaire (le coffre de la caisse)
PXI_G.troisLosanges='.................|.................|.................|.................|.................|.................|..#.....#.....#..|.###...###...###.|#####.#####.#####|.###...###...###.|..#.....#.....#..|.................|.................|.................|.................|.................|.................'; /* (2026-10-25, Sacha : « les trois petits losanges pour choisir les figures ») l'inventaire : les trois EMPLACEMENTS de figures — (2026-10-26, Sacha : « les trois carrés du bouton inventaire doivent être alignés, pas en triangle ») sur une seule ligne, en 17 × 17 (même cadre, pixels plus fins) */
PXI_G.roue='..#####..|.#.....#.|#..###..#|#.#...#.#|#.#.#.#.#|#.#...#.#|#..###..#|.#.....#.|..#####..'; // (2026-10-09) la famille COMMUNE : la roue
PXI_G.gemme='.........|..#####..|.#..#..#.|#########|.#.....#.|..#...#..|...#.#...|....#....|.........'; // (2026-10-09) la famille RARE : la gemme taillée
PXI_G.couronne='.........|#...#...#|#..###..#|##.###.##|#########|#########|.........|#########|.........'; // (2026-10-09) la famille LÉGENDAIRE : la couronne
PXI_G.rond='.........|...###...|..#####..|.#######.|.#######.|.#######.|..#####..|...###...|.........'; // (2026-10-10) COMMUNE : un simple rond
PXI_G.dragon='##.......|.##......|.######..|###.####.|#########|###..#...|####.....|.#######.|..##.....'; // (2026-10-10) MYTHIQUE : la tête de dragon, de profil (cornes, œil, gueule ouverte, croc)
PXI_G.infini='.........|.........|.##...##.|#..#.#..#|#...#...#|#..#.#..#|.##...##.|.........|.........'; // (2026-10-10) INFINI : le signe ∞
PXI_G.palmier='.###.###.|#...#...#|...###...|..#.#.#..|.#..#..#.|....#....|....#....|...#.....|.#####...'; // (2026-10-10) EXOTIQUE : le palmier
PXI_G.oeil='.........|.........|..#####..|.#.....#.|#..###..#|#..###..#|.#.....#.|..#####..|.........'; // (2026-10-09) CACHER / VOIR la console — (2026-10-11, Léo : « remets comme avant ») le dessin d'origine revient ; de la passe UX de Sacha, l'œil ne garde que le recentrage de la vue
PXI_G.tour='....#....|....#....|...###...|...#.#...|..#####..|..#...#..|.#######.|.#.....#.|##.....##'; // (2026-09-28) la Dame de fer
Object.assign(PXI_G,{ // (2026-10-14) LES TRAÎNÉES ET LES AILES POP : un pictogramme chacune (la vignette montre le dessin, le nom dit le reste)
  tr_grille:'..#...#..|..#...#..|#########|..#...#..|..#...#..|#########|..#...#..|..#...#..|.........',
  tr_matrice:'#.#..#...|#.##.#.#.|#..#.#.#.|#.#..#.#.|..#.##.#.|#.#....#.|#...#.#..|....#.#..|....#....',
  tr_anneaux:'..#####..|.##...##.|##.....##|#.......#|#.......#|#.......#|##.....##|.##...##.|..#####..',
  tr_glouton:'.........|..###....|.#####...|###......|##....#.#|###......|.#####...|..###....|.........',
  tr_hyper:'#####....|.........|...######|.........|#######..|.........|..#######|.........|######...',
  tr_sakura:'....#....|...###...|##.###.##|###.#.###|.##...##.|..#####..|.##.#.##.|.#..#..#.|.........',
  tr_billets:'#########|#.......#|#..###..#|#.##....#|#..###..#|#....##.#|#..###..#|#.......#|#########',
  ai_xwing:'#.......#|##.....##|.##...##.|..##.##..|...###...|..##.##..|.##...##.|##.....##|#.......#',
  ai_baron:'.........|#########|.#.....#.|.#.....#.|#########|....#....|...###...|.........|.........',
  ai_monarque:'##.....##|###...###|####.####|.###.###.|..##.##..|.###.###.|.##.#.##.|.#.....#.|.........',
  ai_air:'..#####..|.##...##.|##....###|#....##.#|#...##..#|#..##...#|###....##|.##...##.|..#####..', // (2026-10-18) SANS AILES : le panneau INTERDIT
  ai_dragon:'#........|##.......|###....#.|####..##.|#########|#.#######|#..#.####|#...#.#.#|.........',
  ai_fee:'##.....##|###...###|.###.###.|...#.#...|....#....|...#.#...|.##...##.|.##...##.|.........',
  ai_rouages:'...#.#...|.#######.|.##...##.|###.#.###|.#.###.#.|###.#.###|.##...##.|.#######.|...#.#...',
  ai_pixel:'.......##|.....####|...######|.########|#########|.#######.|..##.##..|...#..#..|.........',
  ai_pigeon:'.........|#.......#|##.....##|.##...##.|..#####..|...###...|....#....|.........|.........',
  ai_origami:'........#|......###|....####.|..######.|#######..|..##.#...|....##...|....#....|.........'});
Object.assign(PXI_G,{ // (2026-10-15, Sacha : « les traînées, les ailes et les figures, il n'y a pas les images » — L'INVENTAIRE ILLUSTRÉ, voir ILLU_COS / ILLU_FIG)
  // les quatre ailes et les six traînées d'origine, qui n'avaient pas de dessin ; la caisse vue de DOS (le tonneau tourne autour de son axe long) ;
  // les ANNEAUX des figures (12 × 12 : la caisse, en calque, se pose au milieu) — rond = salto ou tonneau, à plat = toupie, penché = vrille sur deux axes
  ai_panneaux:'.........|.........|...###...|..#...#..|#########|#########|..#####..|..#...#..|.........',
  ai_helices:'#.#...#.#|.#.....#.|#.#...#.#|...###...|..#####..|...###...|#.#...#.#|.#.....#.|#.#...#.#',
  ai_plumes:'#.......#|##.....##|#.#...#.#|##.#.#.##|#.##.##.#|.###.###.|..##.##..|...#.#...|.........',
  ai_chauve:'.........|#.......#|##.....##|###.#.###|#########|#.##.##.#|#..#.#..#|.........|.........',
  tr_nitro:'.........|......##.|..#######|.########|#########|.########|..#######|......##.|.........',
  tr_rose:'.........|.##...##.|#..#.#..#|#...#...#|#.......#|.#.....#.|..#...#..|...#.#...|....#....',
  tr_or:'....#....|...###...|....#....|.#.....#.|###.#.###|.#.###.#.|....#....|..#...#..|.........',
  tr_arc:'.........|..#####..|.#######.|##.....##|#..###..#|#.#...#.#|#.#...#.#|.........|.........',
  tr_wow:'#.......#|##.....##|#########|#.##.##.#|#########|##..#..##|.#.###.#.|..#####..|.........',
  cv_dos:'.........|..#####..|.#.....#.|.#######.|#########|#.##.##.#|#########|##.....##|##.....##',
  fg_rond:'....####....|..##....#...|.#.....#####|.#......###.|#........#..|#...........|#..........#|#..........#|.#........#.|.#........#.|..##....##..|....####....',
  fg_rond2:'....####....|..##....#...|.#.....#####|.#......###.|#........#..|#...........|...........#|..#........#|.###......#.|#####.....#.|...#....##..|....####....',
  fg_arc:'...####.....|.......##...|.........#..|..........#.|..........#.|..........#.|.........###|..........#.|............|............|............|............',
  fg_ovale:'............|.......####.|.....##....#|...##.....##|..#.......#.|.#..........|#..........#|#.........#.|.#......##..|..######....|............|............',
  fg_danse:'............|............|.#........#.|#..........#|#.#......#.#|#..........#|#..........#|#.#......#.#|#..........#|.#........#.|............|............',
  fg_plat:'............|............|............|............|............|...######...|.##......##.|#..........#|#..........#|.##....#..#.|...######...|.......#....',
  fg_plat2:'............|............|............|............|.#..........|.#.######...|###......##.|#..........#|#..........#|.##....#..#.|...######...|.......#....',
  fg_demi:'............|............|............|............|............|...###......|.##.........|#...........|#...........|.##..#......|...####.....|.....#......'});
(function(){
  let css='',vars='';
  for(const k in PXI_G){
    const rows=PXI_G[k].split('|');let r='';
    const n=rows.length; // 9 × 9 d'ordinaire ; une grille plus fine (l'engrenage, 11 × 11) garde le même cadre, ses pixels sont juste plus petits
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(rows[y][x]==='#')r+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges">'+r+'</svg>';
    vars+='--pxi-'+k+':url("data:image/svg+xml,'+encodeURIComponent(svg)+'");'; // aussi pour les ::before du CSS
    css+='.pxi-'+k+'{--pxi:var(--pxi-'+k+')}';
  }
  const st=document.createElement('style');st.id='pxiCss';st.textContent=':root{'+vars+'}'+css;document.head.appendChild(st);
})();
function pxi(n){return '<i class="pxi pxi-'+n+'" aria-hidden="true"></i>';}
/* LA FENÊTRE DU JEU (2026-09-24) : remplace prompt()/confirm() — les boîtes GRISES du navigateur cassaient l'immersion
   pile sur les gestes les plus graves (sauvegarde, effacement). Même charte que le reste : cadre, titre or, plaques. */
/* LES FEUILLES SE REFERMENT (2026-09-25, transitions App Store) : un panneau ne CLAQUE plus — il redescend et
   s'efface en --t-fast. Il garde sa classe d'ouverture pendant l'animation (sinon `display:none` la couperait net),
   puis la perd. Rouvrir pendant la sortie l'annule simplement. */
function feuilleOuvre(el,cls){ if(!el)return; try{uiGarde();}catch(e){} clearTimeout(el._fermeT); const deja=el.classList.contains(cls)&&!el.classList.contains('sortant');
  el.classList.remove('sortant'); el.classList.add(cls); if(!deja&&el.id!=='modale')try{typeof sfx==='function'&&sfx('ui.feuille');}catch(e){} } // (2026-09-28) la fenêtre a son propre son (ui.modale) ; une feuille déjà ouverte qui change de page (carrière) ne resonne pas
function feuilleFerme(el,cls){ if(!el||!el.classList.contains(cls))return; try{uiGarde();}catch(e){} clearTimeout(el._fermeT);
  try{typeof sfx==='function'&&sfx('ui.feuilleFerme');}catch(e){}
  if(document.documentElement.getAttribute('data-reduced-motion')==='1'){el.classList.remove(cls,'sortant');return;}
  el.classList.add('sortant'); el._fermeT=setTimeout(function(){el.classList.remove(cls,'sortant');},el._sortMs||170); }
function modale(o){return new Promise(function(res){
  const m=document.getElementById('modale'),c=document.getElementById('modC'),b=m.querySelector('.modB');
  m.classList.toggle('facC6',!!o.cartes); // (2026-10-14, charte 6) les boutons en CARTES
  m.classList.toggle('bienv',o.cls==='bienv'); // (2026-10-16) LA QUESTION DE BIENVENUE (bienvMontre) a son habillage
  let ck=m.querySelector('.modCoche');if(ck)ck.remove();ck=null; // (2026-10-16) `o.coche` : une case « NE PLUS ME DEMANDER » sous les cartes, rendue dans `coche`
  if(o.coche){ck=document.createElement('div');ck.className='modCoche';ck.setAttribute('role','checkbox');ck.setAttribute('aria-checked','false');
    ck.innerHTML='<i class="mcBox">'+pxi('coche')+'</i><span>'+TR(o.coche)+'</span>';
    ck.addEventListener('click',function(ev){ev.stopPropagation();const on=!ck.classList.contains('on');ck.classList.toggle('on',on);ck.setAttribute('aria-checked',on?'true':'false');uiClic(on?'on':'off');});
    m.querySelector('.modIn').appendChild(ck);}
  document.getElementById('modT').textContent=TR(o.titre);document.getElementById('modX').textContent=o.texte?TR(o.texte):'';
  c.style.display=o.champ!=null?'':'none';c.value=o.champ||'';c.readOnly=!!o.lecture;
  b.innerHTML='';
  for(const k of o.boutons){const e=document.createElement('div');e.className='pbtn '+(k.cls||'pb-cyan');e.setAttribute('role','button');
    e.innerHTML=(k.ic?pxi(k.ic):'')+'<span>'+TR(k.l)+'</span>'+(k.sous?'<small>'+TR(k.sous)+'</small>':''); // (2026-10-14) k.sous : la promesse d'une carte
    const arme=k.cls==='pb-red'; // (2026-09-26, charte v4) EFFACER / QUITTER / RECOMMENCER s'arment après 420 ms : le 2e tap d'un double appui tombe dans le vide
    if(arme){e.classList.add('arme');setTimeout(function(){e.classList.remove('arme');},420);}
    e.addEventListener('click',function(ev){ev.stopPropagation();if(e.classList.contains('arme')){hap(6);return;}uiClic(k.cls==='pb-red'?'danger':(k.v||o.cls==='bienv')?'':'retour');try{c.blur();}/* (2026-10-16) un bouton v:0 de la question de bienvenue est un CHOIX, pas un ANNULER */catch(_){}feuilleFerme(m,'on');res({v:k.v,texte:c.value,coche:!!(ck&&ck.classList.contains('on'))});});b.appendChild(e);}
  feuilleOuvre(m,'on');try{typeof sfx==='function'&&sfx('ui.modale');}catch(e){}
  if(o.champ!=null)setTimeout(function(){try{c.focus();if(o.lecture)c.select();}catch(e){}},60);
});}
/* (2026-10-16, Léo : « premier niveau apprentissage : tu mets un message à la première ouverture, bien designé, en cohérence avec le reste du
   jeu, avec une option ne plus répéter ; et seulement si on dit que c'est la première fois qu'on joue, ça lance la partie guidée pour
   beginner — sinon on peut enlever ce truc pour toujours ») LA QUESTION DE BIENVENUE. Avant : le 1er JOUER d'une sauvegarde neuve lançait
   D'OFFICE l'auto-école (la leçon), même pour qui avait déjà joué sur un autre téléphone. Désormais, à l'ouverture, sur l'accueil, une fenêtre
   (les deux CARTES de la charte 6) demande : PREMIÈRE FOIS ICI ?
   · OUI, GUIDE-MOI → la leçon part tout de suite (le JOUER de l'accueil, son chemin et sa musique : voir ECOLE_MUS) ;
   · J'AI DÉJÀ JOUÉ → pas de leçon pour cette ouverture (SAVE.d.tuto = 1, `tutoProv` : la question revient à la prochaine ouverture) ;
   · la case NE PLUS ME DEMANDER (SAVE.d.bienv) : la question ne revient plus — avec J'AI DÉJÀ JOUÉ, la leçon est enlevée pour toujours
     (REVOIR L'AUTO-ÉCOLE, dans les réglages, la rend quand on veut).
   Posée UNE fois par ouverture, seulement à qui n'a jamais passé ni sauté la leçon (une sauvegarde qui a déjà des parties : jamais).
   `?bienvenue=0` la tait (bancs), `?bienvenue=1` la pose à chaque ouverture (essai), `dbgBienvenue()` la montre. Le doigt TAPE TA CAISSE attend qu'elle soit refermée (BIENV.on). */
var BIENV={on:false,fait:false,t0:0,iv:0};
function bienvI18n(){Object.assign(I18N,{'PREMIERE FOIS ICI ?':'FIRST TIME HERE?','OUI, GUIDE-MOI':'YES, GUIDE ME',"J'AI DEJA JOUE":"I'VE PLAYED BEFORE",'Une course guidée':'A guided run','Direct en course':'Straight to the race','NE PLUS ME DEMANDER':"DON'T ASK AGAIN",
  'Une minute en roulant pour apprendre, et ton PERMIS rapporte $ 500.':'One minute on the road to learn, and your LICENSE pays $500.'});} // (I18N naît plus bas dans le script : les mots sont posés au démarrage du guet)
function bienvVeut(){/* (2026-10-22, Sacha : « enlève ça du jeu ») la question de bienvenue n'est plus posée */ return false;const d=SAVE.d;if(/[?&]bienvenue=1\b/.test(location.search))return !BALADE; /* (essai) `?bienvenue=1` la pose quelle que soit la sauvegarde */ return !BALADE&&!SIMU_JEU&&!SANDBOX&&!PARK.on&&!d.tuto&&!d.permis&&!d.bienv&&!/[?&]bienvenue=0\b/.test(location.search);}
function bienvPret(){const sp=document.getElementById('splash'),md=document.getElementById('modale');
  return !sp&&!!overlay&&overlay.getAttribute('data-ecran')==='home'&&!(started&&!gameOver)&&!(garageOn&&!document.body.classList.contains('titreCiel'))&&!(GAR&&GAR.go)&&!ecranWipe._on&&!(md&&md.classList.contains('on'))&&!document.body.classList.contains('play')&&!(PLQ&&PLQ.on);} /* (2026-10-17) LA PLAQUE se choisit d'abord (voir plqGuette) */
function bienvGuette(){if(BIENV.iv)return;try{bienvI18n();}catch(e){}BIENV.iv=setInterval(function(){try{
  if(BIENV.fait||!bienvVeut()){clearInterval(BIENV.iv);return;}
  if(!bienvPret()){BIENV.t0=0;return;}
  if(!BIENV.t0){BIENV.t0=performance.now();return;}
  if(performance.now()-BIENV.t0>700){clearInterval(BIENV.iv);bienvMontre();}}catch(e){}},250);} // l'accueil a fini d'entrer (700 ms) : la question se pose
function bienvMontre(force){if(BIENV.on||(!force&&(BIENV.fait||!bienvVeut())))return;BIENV.fait=true;BIENV.on=true;
  try{chuteDoigtMontre(false);}catch(e){}
  modale({titre:'PREMIERE FOIS ICI ?',texte:'Une minute en roulant pour apprendre, et ton PERMIS rapporte $ 500.',cartes:true,cls:'bienv',coche:'NE PLUS ME DEMANDER',
    boutons:[{l:'OUI, GUIDE-MOI',ic:'volant',cls:'pb-gold',sous:'Une course guidée',v:1},{l:"J'AI DEJA JOUE",ic:'eclair',cls:'c6Neutre',sous:'Direct en course',v:0}]}).then(function(r){
    BIENV.on=false;
    if(r.coche)SAVE.d.bienv=1;
    if(r.v){SAVE.d.tuto=0;SAVE.d.tutoProv=0;SAVE.flush();bienvJoue();}
    else{SAVE.d.tuto=1;SAVE.d.tutoProv=r.coche?0:1;SAVE.flush();}});}
function bienvJoue(){ // la leçon part par le JOUER de l'accueil : le même chemin (piqué, voile, piste d'école, musique de la leçon)
  setTimeout(function(){const b=document.querySelector('#mHome [data-m="play"]');if(b)b.click();else try{playViaGarage(true);}catch(e){}},180);}
window.dbgBienvenue=function(k){if(k==='raz'){SAVE.d.tuto=0;SAVE.d.permis=0;SAVE.d.bienv=0;SAVE.d.tutoProv=0;SAVE.flush();BIENV.fait=false;return 'remis à neuf';}bienvMontre(true);return {on:BIENV.on,tuto:SAVE.d.tuto,bienv:SAVE.d.bienv,prov:SAVE.d.tutoProv};};
let toastT=0;
function toast(h,muet){const t=document.getElementById('toast');if(!t)return;t.innerHTML=h;t.classList.add('on');
  try{if(SONV2&&!muet){if(/pxi-coche/.test(h))sfx('ui.ok');else if(/pxi-croix/.test(h))sfx('ui.erreur');}}catch(e){} /* (2026-09-28) session SON */ /* (2026-10-14, session SON) `muet` : l'appelant a DÉJÀ sonné ce que le toast dit (refus, déblocage, achat) — pas de 2e « non-non » ni de ui.ok sous une récompense */ clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},1900);}
// une ligne de panneau : icône · libellé · pastille d'état (l'ÉTAT se lit dans la pastille, la plaque ne se grise plus)
function tpLbl(ic,txt,etat,on){const tg=(etat==='ON'||etat==='OFF'); // ON/OFF → un INTERRUPTEUR pixel ; une valeur → une étiquette or à chevron
  return pxi(ic)+'<span class="tpL">'+TR(txt)+'</span>'+(etat==null?'':tg?'<b class="bascule'+(on?'':' ko')+'">'+etat+'</b>':'<b class="valeur">'+TR(etat)+'</b>');}
addEventListener('error',function(e){try{document.title='ERR:'+e.message+' @'+e.lineno;}catch(_){}}); // capteur d'init (les erreurs top-level échappent à la console headless)
if(typeof THREE==='undefined'){ // CDN indisponible : un message clair plutôt qu'un écran noir muet
  document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#12081f;color:#ffd75e;font:10px var(--pix);text-align:center;padding:20px;z-index:99">'+((function(){try{const l=localStorage.ccLang;return l?l!=='fr':!/^fr/i.test(navigator.language||'fr');}catch(e){return false;}})()?'CASH CAR couldn&#39;t load its 3D engine.<br>Check your internet connection, then reload the page.':'CASH CAR n&#39;a pas pu charger son moteur 3D.<br>V&eacute;rifie ta connexion internet puis recharge la page.')+'</div>'); // (2026-10-14, textes) bilingue
  return;
}
