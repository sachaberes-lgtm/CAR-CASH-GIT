/* LA FENÊTRE D'ACHAT (2026-10-01, Sacha : « il faut que la fenêtre de la voiture sorte de la page en mode pop-up pour valider la
   transaction »). Toucher une caisse de la vitrine la fait SORTIR de la grille : sa carte quitte sa place (un trou reste dans la
   grille), grandit et vient se poser au centre sur un voile — même photo, même nom — avec ce qu'il faut pour décider : la rareté, sa
   phrase, le prix, UN lingot d'or (ACHETER) et ANNULER. Fermer (ANNULER, le voile, Échap) la renvoie À SA PLACE, par le même chemin
   à l'envers. Le trajet est un FLIP : la carte est posée au centre, mesurée, puis part de la place de la vignette (--dx, --dy, --s).
   L'ACHAT passe par l'App Store (StoreKit, avec le compte développeur) : `shopPaye(i)` est la SEULE porte à brancher — elle rend une
   promesse tenue quand Apple a encaissé, et alors seulement `shopDonne(i)` pose la caisse. Tant qu'elle n'est pas branchée, ACHETER
   le DIT dans la fenêtre (« BIENTÔT DISPONIBLE ») et ne donne jamais rien. Déjà à toi : ÉQUIPER (l'atelier s'ouvre sur elle). */
Object.assign(I18N,{"ÉQUIPER":"EQUIP","Achat unique, via ton compte App Store. À toi pour toujours.":"One-time purchase through your App Store account. Yours forever.",
  "Elle t'attend à l'atelier.":"It's waiting for you in the garage.","Les achats ouvriront à la sortie sur l'App Store.":"Purchases open when the game launches on the App Store.","INDISPONIBLE":"UNAVAILABLE","L'achat est indisponible pour le moment.":"Buying is unavailable right now."});
const SPOP={el:null,src:null,i:-1,t:0};
function shopPaye(i){return Promise.reject(new Error('storekit'));} // `i` = l'index d'une caisse OU 'palette' (PALETTE_PACK.produit) — (2026-10-14, palette) puis palDonne() ; ⚠ LA porte de StoreKit : tenir la promesse QUAND Apple a encaissé — jamais avant
function shopDonne(i){ // la caisse payée en vrai argent : posée dans `owned`, sans toucher à la banque du jeu
  if(!Array.isArray(SAVE.d.owned))SAVE.d.owned=[];
  if(SAVE.d.owned.indexOf(i)<0){SAVE.d.owned.push(i);carWas[i]=true;}
  SAVE.flush();
}
function spDuree(){const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-slow'));return document.documentElement.getAttribute('data-reduced-motion')==='1'?0:(v>0?v:420);}
function shopPopEl(){
  if(SPOP.el)return SPOP.el;
  const el=SPOP.el=document.createElement('div');el.id='shPop';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.addEventListener('click',function(e){
    e.stopPropagation();
    if(!el.classList.contains('on')||el.classList.contains('sortant'))return;
    const b=e.target.closest('[data-sp]');
    if(!b){if(!e.target.closest('.spCarte')){uiClic('retour');shopPopFerme();}return;} // le VOILE ferme
    const k=b.getAttribute('data-sp'),i=SPOP.i;
    if(k==='non'){uiClic('retour');shopPopFerme();return;}
    if(carOwned(i)){ // ÉQUIPER : la fenêtre rentre, puis l'atelier s'ouvre sur la caisse
      uiClic('nav');hap(8);shopPopFerme();
      setTimeout(function(){window.__offGar=false; /* (2026-10-14, chasse aux bugs) on QUITTE OFFRES par ÉQUIPER : le drapeau « venue de la porte du garage » n'était consommé que par RETOUR — il restait armé et le RETOUR d'une visite suivante (mort, accueil) rouvrait le garage-boutique */ ecranWipe(function(){openGarage();shopTab('voiture');garageShow(i);});},spDuree());return;}
    if(b.classList.contains('off'))return;
    uiClic('');hap(12);b.classList.add('off');el.classList.add('attend');
    shopPaye(i).then(function(){
      shopDonne(i);el.classList.remove('attend');try{if(SONV2)sfx('ui.achat');else uiClic('');}catch(_){}hap([12,40,12,40,30]);/* (2026-10-14, session SON) 'ok' n'est pas un rôle d'uiClic (il retombait sur ui.tap, un 2e appui) : une caisse ACHETÉE sonne le tiroir-caisse, comme tout achat du garage — et le toast d'après se tait */try{pixBurst(b,18);}catch(_){}
      try{shopRender();}catch(_){}shopPopFerme();toast(pxi('coche')+' '+insec(TR(CARS[i].name))+' — '+TR('À TOI'),true);
    },function(){ // pas encore branché : on le DIT, dans la fenêtre, et rien n'est donné
      el.classList.remove('attend');el.classList.add('refus');uiClic('refus');hap([10,40,10]);
      const s=b.querySelector('span');if(s)s.textContent=sansAcc(TR('INDISPONIBLE'));
      const n=el.querySelector('.spNote');if(n)n.textContent=TR("L'achat est indisponible pour le moment.");
    });
  });
  // Échap : c'est la fenêtre qui se ferme — pas l'écran de la boutique (écouteur en CAPTURE, avant celui de la coque)
  addEventListener('keydown',function(e){if(e.code!=='Escape'||!el.classList.contains('on')||el.classList.contains('sortant'))return;
    e.stopImmediatePropagation();e.preventDefault();uiClic('retour');shopPopFerme();},true);
  document.body.appendChild(el);return el;
}
function shopPop(src){
  const i=+src.getAttribute('data-car'),u=CAR_UNLOCK[i];if(!u||u.k!=='premium'||!CARS[i])return;
  const el=shopPopEl();if(el.classList.contains('on'))return;
  clearTimeout(SPOP.t);
  const a=carOwned(i),une=!!u.une,im=src.querySelector('.shPhoto img'),ph=PHOTO.cache[i]||(im?im.src:'');
  const RAR={leg:'LÉGENDAIRE',epi:'ÉPIQUE',rar:'RARE'},rar=u.rar||'leg';
  el.innerHTML='<div class="spCarte '+rar+'" data-car="'+i+'">'
    +'<span class="spRare">'+sansAcc(TR(RAR[rar]))+'</span>'+''
    +'<div class="shPhoto big">'+(ph?'<img src="'+ph+'" alt="">':'<i class="pxi pxi-voiture shAttente"></i>')+'</div>'
    +'<b class="spNom" id="spNom">'+insec(TR(CARS[i].name))+'</b>'
    +'<span class="spDesc">'+(LANG==='fr'?CARS[i].desc:TR(CARS[i].desc))+'</span>'
    +(a?'<div class="spPrix aToi">'+pxi('coche')+'<b>'+sansAcc(TR('À TOI'))+'</b></div>'
       :'<div class="spPrix">'+'<em>'+eurTxt(u.eur)+'</em></div>')
    +'<div class="spBtns"><div class="pbtn pb-gold spOui" role="button" data-sp="oui">'+pxi(a?'coche':'panier')+'<span>'+sansAcc(TR(a?'ÉQUIPER':'ACHETER'))+'</span></div>'
    +'<div class="pbtn pb-cyan spNon" role="button" data-sp="non">'+pxi('gauche')+'<span>'+TR('ANNULER')+'</span></div></div>'
    +'<small class="spNote">'+TR(a?"Elle t'attend à l'atelier.":"Achat unique, via ton compte App Store. À toi pour toujours.")+'</small></div>';
  el.setAttribute('aria-labelledby','spNom');
  // LA CARTE SORT DE LA PAGE : mesurée à sa place, puis au centre — le trajet se joue de l'une à l'autre
  const r=src.getBoundingClientRect();
  if(SPOP.src&&SPOP.src!==src)SPOP.src.classList.remove('spParti');
  SPOP.src=src;SPOP.i=i;
  el.classList.remove('sortant','refus','attend');el.classList.add('on');
  shopPopVise(r);
  src.classList.add('spParti');
  try{uiGarde();}catch(e){}try{typeof sfx==='function'&&sfx('ui.modale');}catch(e){}hap(8);
}
function shopPopVise(r){ // pose --dx/--dy/--s : l'écart entre la vignette `r` et la carte posée au centre
  const c=SPOP.el&&SPOP.el.querySelector('.spCarte');if(!c||!r||!(r.width>0))return;
  const f=c.getBoundingClientRect();if(!(f.width>0))return;
  c.style.setProperty('--dx',Math.round(r.left+r.width/2-(f.left+f.width/2))+'px');
  c.style.setProperty('--dy',Math.round(r.top+r.height/2-(f.top+f.height/2))+'px');
  c.style.setProperty('--s',Math.min(1,r.width/f.width).toFixed(3));
}
function shopPopFerme(){
  const el=SPOP.el;if(!el||!el.classList.contains('on')||el.classList.contains('sortant'))return;
  try{uiGarde();}catch(e){} // (2026-10-14, chasse aux bugs) la fenêtre qui s'efface a pointer-events:none : le 2e tap d'un double-tap sur ANNULER / ÉQUIPER traversait jusqu'à OFFRES (vignette, RETOUR) — comme à l'ouverture, on avale les clics 320 ms
  const src=SPOP.src;
  if(src&&src.isConnected)shopPopVise(src.getBoundingClientRect()); // la vignette a pu bouger (défilement) : on vise sa place d'ARRIVÉE (la carte est au repos, sa mesure est juste)
  el.classList.add('sortant');
  try{typeof sfx==='function'&&sfx('ui.feuilleFerme');}catch(e){}
  clearTimeout(SPOP.t);SPOP.t=setTimeout(function(){el.classList.remove('on','sortant','refus','attend');if(src)src.classList.remove('spParti');SPOP.src=null;},spDuree());
}
/* LES PHOTOS DE LA BOUTIQUE ARRIVENT UNE PAR UNE (2026-09-30, revue de GAMEPLAY) : la vitrine s'ouvre tout de suite, chaque vignette
   attend en pulsant (une voiture pixel), et les photos se prennent une par une ENTRE deux images, après la transition d'écran — puis
   restent en cache pour la session. */
const SHQ={q:[],on:false}; // (essayé : remonter la caisse d'avant UNE fois à la fin de la file au lieu d'après chaque photo — MESURÉ pire, 0,8 s contre 0,3 : gardé tel quel)
function shopPhotoVeut(i){if(SHQ.q.indexOf(i)<0)SHQ.q.push(i);if(!SHQ.on){SHQ.on=true;setTimeout(shopPhotoTour,380);}}
function shopPhotoTour(){
  const sc=document.getElementById('mShop');
  if(!SHQ.q.length||!sc||!sc.classList.contains('on')||(started&&!gameOver)){SHQ.on=false;return;} // hors de la boutique (ou en course) : la file attend la prochaine ouverture
  const i=SHQ.q.shift();
  const pose=function(u){if(u)sc.querySelectorAll('[data-car="'+i+'"] .shPhoto,[data-car="'+i+'"].shUne .shPhoto').forEach(function(ph){if(ph.querySelector('img'))return;const at=ph.querySelector('.shAttente');if(at)at.remove();
    const im=document.createElement('img');im.alt='';im.src=u;im.className='shArrive';ph.insertBefore(im,ph.firstChild);});};
  if(PHOTO.cache[i])pose(PHOTO.cache[i]);else try{carPhoto(i,pose);}catch(e){} // (OPTIMISATION) la photo s'encode hors du fil (toBlob) : elle se pose à son arrivée
  setTimeout(shopPhotoTour,40); // une photo, puis on rend la main : l'écran respire entre deux
}
function shopAPortee(){let n=0;for(const cat in COSM)for(const d of COSM[cat])if(d.p&&!shopOwned(cat,d.id)&&d.p<=bank())n++;return n;}
/* ---------------- LA BOUTIQUE ---------------- */
const COSM={
  peinture:[
    {id:'usine',   n:'D\'ORIGINE',        p:0,     d:'La teinte du constructeur. Elle a fait ses preuves.'},
    {id:'menthe',  n:'MENTHE GLACÉE',     p:2500,  c:0x5ff0c6,d:'Fraîche comme un billet qui sort du distributeur.'},
    {id:'minuit',  n:'BLEU MINUIT',       p:5000,  c:0x2b43c4,d:'Le bleu des néons de la ville, à trois heures du matin.'},
    {id:'noir',    n:'NOIR MAT',          p:9000,  c:0x202128,g:'s',d:'Pas un reflet. Même la police hésite.'},
    {id:'couchant',n:'COUCHER DE SOLEIL', p:18000, grad:[0xffc23a,0xff4f8b,0x6b3cff],d:'Du miel en bas, du violet en haut : le ciel de 19 h, en laque.'},
    {id:'chrome',  n:'CHROME MIROIR',     p:60000, c:0xe9eef5,g:'c',d:'Tu te vois dedans. Les autres aussi.'},
    {id:'or',      n:'OR MASSIF',         mis:4,   c:0xffc93a,g:'o',d:'Ne s\'achète pas : elle se gagne en relevant des défis.'},
    // (2026-10-14) LES PEINTURES POP — la rareté se lit en couleur (`r`), le prix suit la grille de l'équilibrage (rare 5-12 k · exotique 20-45 k · épique 80-180 k · légendaire 300-500 k)
    {id:'ogre',     n:'VERT OGRE',         p:5000,  r:'rare',      c:0x6f9a2e,g:'s',d:'Le vert des marais. Ça sent un peu, mais c\'est chez toi.'},
    {id:'herisson', n:'BLEU HÉRISSON',     p:7000,  r:'rare',      c:0x1e50e6,d:'Le bleu d\'un hérisson pressé. Les anneaux sont en option.'},
    {id:'poupee',   n:'ROSE POUPÉE',       p:9000,  r:'rare',      c:0xff5fb0,d:'Rose bonbon, laque parfaite. Tu n\'es pas en plastique, tu es en carbone.'},
    {id:'banana',   n:'BANANA',            p:20000, r:'rare',      grad:[0x2a5cb8,0xffd21f,0xffe45c],d:'Salopette en bas, jaune en haut. Elle dit « banana » à chaque virage.'},
    {id:'gotham',   n:'NUIT DE GOTHAM',    p:32000, r:'rare',      c:0x0d0f15,g:'g',d:'Noir laqué, la ville qui brille dedans. Les toits sont à toi.'},
    {id:'envers',   n:'MONDE À L\'ENVERS', p:42000, r:'rare',      grad:[0x150709,0x6e0f16,0xe0262f],d:'Noir en bas, rouge sang en haut : cette caisse vient de l\'autre côté. Les guirlandes clignotent.'},
    {id:'vaporwave',n:'VAPORWAVE',         p:85000, r:'epique',    grad:[0x2bd9e8,0xff5ec8,0x7a2bff],d:'Cyan, rose, violet : un coucher de soleil de 1986 sur une cassette usée.'},
    {id:'lave',     n:'LAVE',              p:130000,r:'epique',    grad:[0x1a0500,0xd8340a,0xffb21a],d:'Du volcan au toit, la coulée ne refroidit jamais. N\'y jette pas d\'anneau.'},
    {id:'holo',     n:'HOLOGRAMME',        p:300000,r:'legendaire',grad:[0x9ff2ff,0xf3b4ff,0xfff3ae],g:'c',d:'Chrome irisé qui change de couleur à chaque angle. Une carte rare… en voiture.'},
    {id:'guerrier', n:'SUPER GUERRIER',    mis:12,pk:350000,r:'mythique',grad:[0xff8a00,0xffd23a,0xfff4a8],g:'o',d:'Doré du toit aux pneus. Les cheveux se dressent, le niveau dépasse les 9 000.'}],
  aile:[ /* (2026-10-18, Sacha : « rajoute un zéro pour tous les prix des ailes ») les prix ×10 ; HÉLICES, PLUMES et CHAUVE-SOURIS gardent leur rareté d'avant, écrite en `r` (cosmRar la déduisait du prix) */
    {id:'panneaux',n:'PANNEAUX',          p:0,     d:'Deux planches de planeur, un aileron qui suit tes virages, des feux de position. Au boost, elles tirent deux traînées blanches.'},
    {id:'helices', n:'HÉLICES',           p:30000, r:'commun',    d:'Quatre rotors qui s\'emballent au boost et piquent du nez pour foncer. Ça ne vole pas mieux, mais ça brasse de l\'air.'},
    {id:'plumes',  n:'PLUMES D\'ANGE',    p:120000,r:'rare',      d:'De vraies plumes blanches et dorées qui battent lentement et s\'ouvrent en éventail. Au boost, elles sèment de la poussière d\'or.'},
    {id:'chauve',  n:'CHAUVE-SOURIS',     p:250000,r:'rare',      d:'Membranes veinées de violet, doigts d\'os. Elles battent vite, de travers, et se replient en flèche au boost. Pour les vols de nuit.'},
    // (2026-10-14) LES AILES POP (voir AILES_POP) — `ico`/`col` : le pictogramme de la vignette et sa couleur
    {id:'pigeon',   n:'PIGEON',            p:60000, r:'rare',      ico:'ai_pigeon', col:'#b4bac4',d:'Gris, deux barres noires, un cou vert-violet. Il claque des ailes au décollage, bat trop vite et plane sans savoir pourquoi.'},
    {id:'origami',  n:'AVION EN PAPIER',   p:90000, r:'rare',      ico:'ai_origami',col:'#f4f1ea',d:'Une feuille à grands carreaux pleine de gribouillis, un volet plié. Le pan claque au vent quand tu boostes : c\'est toi qui pilotes.'},
    {id:'monarque', n:'MONARQUE',          p:120000,r:'rare',      ico:'ai_monarque',col:'#ff8a1a',d:'Orange et noir, nervures et points blancs, comme les vrais. Elles battent, planent, battent encore. Jusqu\'à 900 à l\'heure.'},
    {id:'pixel',    n:'8-BIT',             p:250000,r:'rare',      ico:'ai_pixel',  col:'#ffd75e',d:'Des ailes d\'ange en gros pixels, animées image par image. Au boost, elles clignotent de toutes les couleurs, comme avec l\'étoile.'},
    {id:'baron',    n:'BARON ROUGE',       p:380000,r:'rare',      ico:'ai_baron',  col:'#ff4a4e',d:'Toile rouge, haubans, ailerons, et l\'écharpe du pilote qui claque au vent. Un chien sur sa niche en rêve encore.'},
    {id:'rouages',  n:'ENGRENAGES',        p:1000000,r:'epique',    ico:'ai_rouages',col:'#e0a84a',d:'Les rouages font battre l\'aile, la chaudière crache sa vapeur au boost. Léonard l\'avait dessinée, toi tu la pilotes.'},
    {id:'xwing',    n:'AILES EN X',        p:1200000,r:'epique',    ico:'ai_xwing',  col:'#e8e4da',d:'Repliées en croisière, elles s\'écartent en X dès que tu boostes, réacteurs à fond. Verrouillez les ailes en position d\'attaque.'},
    {id:'fee',      n:'FÉE',               p:1600000,r:'epique',    ico:'ai_fee',    col:'#d9b8ff',d:'Quatre voiles irisés qui bourdonnent et sèment de la poussière de fée. Il suffit d\'y croire. Et d\'un plein de nitro.'},
    {id:'dragon',   n:'DRAGON',            p:4500000,r:'legendaire',ico:'ai_dragon', col:'#ff5a2a',d:'Membranes veinées de lave, griffes, grands coups d\'aile. Au boost, la lave flambe et crache des braises.'},
    {id:'air',      n:'SANS AILES',        p:5000000,r:'legendaire',ico:'ai_air',    col:'#dff1ff',d:'Les ailes, c\'est pour les pigeons. Dix buses à air comprimé planquées dans la carrosserie : elle crache des bouffées blanches, pivote sur elle-même et s\'envole. Bon. Ça a marché.'}, // (2026-10-18, Léo) LA BLAGUE : l'aile la plus chère de la boutique… n'a pas d'aile (voir AILES_POP.air)
    {id:'phenix',   n:'PHÉNIX',            mis:10,pk:400000,r:'mythique',ico:'flamme',col:'#ffb02a',d:'Des plumes de feu qui battent en semant des étincelles. Tu exploses ? Tu renais de tes cendres. Au prochain run.'}],
  trainee:[
    {id:'nitro',   n:'NITRO',             p:0,     d:'Orange brûlé. Le classique des tuyères.'},
    {id:'rose',    n:'ROSE NÉON',         p:4000,  rgb:[1.45,.22,1.05],pop:'neon',sil:{c:1.45,h:.75,f:0,p:.3},d:'Le rose des enseignes. On te suit à la trace.'},
    {id:'or',      n:'POUDRE D\'OR',      p:15000, rgb:[1.5,1.22,.3],pop:'paillettes',sil:{c:1.3,h:1.05,f:.1,p:1.9},d:'Tu ne laisses pas de la fumée derrière toi. Tu laisses de l\'or.'},
    {id:'arcenciel',n:'ARC-EN-CIEL',      mis:5,   rainbow:1,d:'Ne s\'achète pas : elle se gagne en relevant des défis.'},
    {id:'wow',     n:'WOW',               p:30000, wow:1,rgb:[1.45,.35,1.25],d:'Much sillage. Very mots. Wow.'}, // (2026-10-14) LA TRAÎNÉE WOW (voir wowStep) — la signature du DOGE
    // (2026-10-14) LES TRAÎNÉES POP (voir TRX) — `pop` : son moteur · `rgb` : la couleur du ruban qui l'accompagne · `rubOff` : pas de ruban (l'effet EST la traînée)
    {id:'sakura',   n:'SAKURA',            p:8000,  r:'rare',      pop:'sakura', rgb:[1.35,.6,.9],sil:{c:1.05,h:1.2,f:0,p:.5}, ico:'tr_sakura', col:'#ff9cc4',d:'Des pétales de cerisier, comme dans un générique d\'animé. Le drame, c\'est pour les autres.'},
    {id:'matrice',  n:'MATRICE',           p:11000, r:'rare',      pop:'matrice',rgb:[.25,1.25,.4],sil:{c:1.3,h:.65,f:0,p:1.8},ico:'tr_matrice',col:'#3dff6a',d:'Pilule rouge avalée : du code vert ruisselle derrière toi. La route, c\'est toi qui la réécris.'},
    {id:'anneaux',  n:'ANNEAUX D\'OR',     p:22000, r:'rare',      pop:'anneaux',rgb:[1.3,1.05,.25],sil:{c:1.3,h:1,f:.06,p:1.3},ico:'tr_anneaux',col:'#ffd23a',d:'Tu sèmes des anneaux comme un hérisson qui vient de se cogner. Sauf que toi, tu ne ralentis pas.'},
    {id:'glouton',  n:'GLOUTON',           p:40000, r:'rare',      pop:'glouton',rubOff:1,      ico:'tr_glouton',col:'#ffe14a',d:'Une ligne de pastilles et quatre fantômes à tes trousses. Lâche la nitro : ils deviennent bleus.'},
    {id:'hyper',    n:'HYPERESPACE',       p:90000, r:'epique',    pop:'hyper',  rgb:[.42,.98,2.2],sil:{c:1.6,h:.8,f:0,p:2.4},ico:'tr_hyper', col:'#9fd0ff',d:'Les étoiles s\'étirent en traits. Tu passes en vitesse lumière, les autres restent des touristes.'}, /* (2026-10-18, HYPERESPACE v2) ruban .95,1.15,1.6 (un blanc bleuté, délavé) → bleu ÉLECTRIQUE : le feu de pixels du nitro le prend aussi (nfeuPalTrainee) */
    {id:'grille',   n:'LA GRILLE',         p:200000,r:'epique',    pop:'grille', rubOff:1,      ico:'tr_grille', col:'#2ee8ff',d:'Un mur de lumière dans ton sillage. Celui qui te colle finit en pixels.'}, /* (2026-10-18, Sacha : « the grid doit être epic ») ÉPIQUE, et son prix dans sa famille (350 000 → 200 000 : épique < 250 000, voir cosmRar) */
    {id:'billets',  n:'FAIS PLEUVOIR',     p:500000,r:'legendaire',pop:'billets',rgb:[.45,1.3,.55],sil:{c:1.15,h:1.05,f:.08,p:1},ico:'tr_billets',col:'#5cd685',d:'Des liasses qui s\'envolent à chaque nitro. Ce n\'est pas du gaspillage, c\'est de la communication.'},
    {id:'foudre',   n:'FOUDRE DIVINE',     mis:11,pk:450000,r:'legendaire',pop:'foudre',rgb:[.85,.55,1.7],sil:{c:1.3,h:.75,f:0,p:2},ico:'eclair',col:'#b98aff',d:'Des éclairs crépitent derrière toi. Le marteau, tu l\'as laissé au garage.'} /* (2026-10-18, Sacha : « divine ligthing doit etre legendaire ») LÉGENDAIRE (elle était MYTHIQUE) ; son prix `pk` (450 000, Poki) est déjà dans la famille */]
};
/* (2026-10-18 soir, Sacha : « enlève la traînée menthe ») LES HABILLAGES RETIRÉS : leur ligne SORT de COSM (la sauvegarde les désigne par leur id,
   aucun index ne bouge) ; qui l'avait acheté est remboursé au prix payé au chargement et l'id sort de shop.own (voir LES CAISSES RETIRÉES dans SAVE) ;
   qui la portait repart avec celle d'origine. `n` = le nom que dit le message de remboursement. (2026-10-18 soir, Sacha : « supprime block rain »)
   PLUIE DE BLOCS aussi. Leurs émetteurs TRX_EMET (bulles, blocs) restent, sans traînée qui les appelle. (2026-10-18 soir, Sacha : « 88 mph enlève »)
   88 MILES À L'HEURE aussi (140 000 $, épique) : sa ligne et son pictogramme tr_88 sortent ; son émetteur TRX_EMET.retour reste. */
const HAB_RETIRES={'trainee:menthe':{p:2000,n:'LA TRAÎNÉE MENTHE'},'trainee:blocs':{p:30000,n:'LA TRAÎNÉE PLUIE DE BLOCS'},'trainee:retour':{p:140000,n:'LA TRAÎNÉE 88 MILES À L\'HEURE'}};
Object.assign(I18N,{"LA TRAÎNÉE 88 MILES À L'HEURE":"THE 88 MPH TRAIL"}); /* le message de remboursement, en anglais */
/* (2026-10-18 soir, Sacha : « la trainé rainbow doit etre incluse avec le pack nian cat ») LE PACK DU CHAT : l'ARC-EN-CIEL (`pack:'chat'`, voir LES
   MISSIONS v2 — LES HABILLAGES QUI SE GAGNENT) est à toi avec le CHAT POP-TART (shopOwned → m2Chat). La boutique le DIT enfin : sa carte affichait
   « MISSION » (et l'inventaire le prix de la PALETTE) ; elle affiche « PACK CHAT », son bouton AVEC LE CHAT mène à l'offre du chat (rayon ACHAT),
   et la carte du chat porte « + ARC-EN-CIEL » tant qu'on ne l'a pas. chatPackI = la place du chat dans CARS (-1 s'il n'y est plus). */
function chatPackI(){for(let i=0;i<CARS.length;i++)if(CARS[i]&&CARS[i].shape==='poptart'&&!CARS[i].retire)return i;return -1;}
/* (2026-10-14, Sacha : « une grande palette de peintures, façon Geometry Dash » — passe graphismes · palette) LA PALETTE : 40 peintures AJOUTÉES après
   les 17 (qui ne bougent pas : prix, carnets, possessions). le PACK les donne TOUTES les 40, argent réel (PALETTE_PACK : 0,99 €, UNIQUEMENT par shopPaye('palette') puis palDonne) ; 30 d'entre elles sont
   rangées en grille 10 teintes × 3 valeurs — PASTELS laqués · FRANCS laqués · MÉTALLISÉS profonds ; colonnes : rouge, orange, jaune, anis, vert, sarcelle,
   azur, violet, rose, neutre. Les 10 autres sont SECRÈTES : chacune se gagne GRATUITEMENT par un DÉFI caché (GAMEPLAY appelle secDonne(id)), ou avec le pack. Tant qu'une secrète n'est pas
   gagnée, ses champs VISIBLES (n, d, c, grad, g) se masquent d'eux-mêmes (« ? ? ? », l'indice, une pastille ardoise mate) : toutes les listes qui dérivent
   de COSM la cachent sans qu'on y touche. `window.PAL_REVELE=1` (bancs, planche) lève le masque. Les finitions k (MÉTALLISÉ) et n (NACRE) sont de simples
   clés LP_MAT (Phong + vernis en uniform) : zéro programme de plus. `?palette=0` = le jeu d'avant (rien n'est ajouté). */
const PALETTE_ON=!/[?&]palette=0\b/.test(location.search);
const PALETTE_PACK={id:'palette',produit:'cashcar.palette40',eur:'0,99 €',n:'LA PALETTE',ids:[]}; // `produit` = l'identifiant App Store Connect, écrit ICI seulement
const PAL_MASQUE=0x2a2d36; // la pastille d'une secrète pas encore gagnée : ardoise mate
if(PALETTE_ON){
  for(const e of [ // [id, nom, couleur, finition (rien = laque), rareté, description] — rangée par rangée, dans l'ordre de la grille
    /* (planche du 14/10) valeurs MESURÉES à l'écran : sur la tôle éclairée, le MÉTALLISÉ rend ~×1,8-2 plus clair que la laque (le reflet du ciel teinté par la couleur) — ses entrées sont donc ~÷1,8 de la teinte voulue ; les verts et le sarcelle francs saturaient au fluo (canal vert ×1,4) */
    ["dragee","ROSE DRAG\u00c9E",0xffb6bd,null,"rare","Le rose des bapt\u00eames. Tu roules quand m\u00eame \u00e0 300."],
    ["abricot","ABRICOT",0xffc596,null,"rare","Doux comme un fruit, rapide comme un vol."],
    ["vanille","VANILLE",0xfff0a6,null,"rare","Une boule de glace qui ne fond pas \u00e0 1 000 km/h."],
    ["pistache","PISTACHE",0xd6f2a0,null,"rare","Le vert des glaciers italiens. Les pneus, eux, sont chauds."],
    ["amande","VERT AMANDE",0xbfe9c4,null,"rare","Le vert de la voiture de ta grand-m\u00e8re. En plus nerveux."],
    ["ecume","\u00c9CUME",0xa6ebe2,null,"rare","La mousse sur la vague. La vague, c'est toi."],
    ["piscine","BLEU PISCINE",0xa9d6ff,null,"rare","Le bleu d'une piscine de palace. Plongeoir compris."],
    ["lilas","LILAS",0xd3c2ff,null,"rare","Une fleur de printemps qui double par la droite."],
    ["barbapapa","BARBE \u00c0 PAPA",0xffc2e4,null,"rare","Sucre fil\u00e9, carrosserie dure. Ne l\u00e8che pas."],
    ["neige","BLANC NEIGE",0xf3f5f7,null,"rare","Propre comme un compte en Suisse."],
    ["bolide","ROUGE BOLIDE",0xe3242b,null,"rare","Le rouge des grandes marques. Sans le cheval, avec l'arrogance."],
    ["emeute","ORANGE \u00c9MEUTE",0xff6b14,null,"rare","Visible depuis l'espace. C'est le but."],
    ["taxi","JAUNE TAXI",0xffc61a,null,"rare","Tout le monde te fait signe. Tu ne t'arr\u00eates pas."],
    ["citron","CITRON VERT",0x9ac81e,null,"rare","Acide. Comme tes d\u00e9passements."],
    ["billet","VERT BILLET",0x1c9a4c,null,"rare","La couleur pr\u00e9f\u00e9r\u00e9e de ton banquier."],
    ["lagon","LAGON",0x109a94,null,"rare","L'eau des \u00eeles o\u00f9 tu d\u00e9penses tes primes."],
    ["azur","AZUR",0x2b8cff,null,"rare","Le ciel sans un nuage. Le tien."],
    ["royal","VIOLET ROYAL",0x7a3cf0,null,"rare","La couleur des rois. Et de ceux qui roulent comme eux."],
    ["fuchsia","FUCHSIA",0xe61e78,null,"rare","Trop voyant ? Juste assez."],
    ["argent","ARGENT BROSS\u00c9",0x8b8f95,"k","rare","M\u00e9tal bross\u00e9, reflet discret. L'argent ne crie pas, il brille."],
    ["bordeaux","BORDEAUX",0x3c0811,"k","rare","Un grand cru, mis en bouteille dans de la t\u00f4le."],
    ["cuivre","CUIVRE",0x5d2810,"k","rare","Le m\u00e9tal des vieux tuyaux. Pass\u00e9 au polish."],
    ["bronze","BRONZE",0x4e3b13,"k","rare","La troisi\u00e8me marche du podium ? Pas ce soir."],
    ["olive","OLIVE",0x2e330f,"k","rare","Du kaki m\u00e9tallis\u00e9. Une jeep qui serait all\u00e9e \u00e0 l'op\u00e9ra."],
    ["anglais","VERT ANGLAIS",0x08291a,"k","rare","Le vert des bolides d'avant-guerre. Le th\u00e9 est en option."],
    ["petrole","BLEU P\u00c9TROLE",0x062b31,"k","rare","Profond comme une nappe de p\u00e9trole. En plus propre."],
    ["abysse","BLEU ABYSSE",0x0c1733,"k","rare","Le bleu du fond des oc\u00e9ans. Personne ne t'y trouve."],
    ["aubergine","AUBERGINE",0x210e2c,"k","rare","Un violet presque noir. Classe sans le faire expr\u00e8s."],
    ["framboise","FRAMBOISE",0x450a25,"k","rare","Un rouge m\u00fbri au soleil. Sucr\u00e9, pas mou."],
    ["graphite","GRAPHITE",0x1c1e22,"k","rare","Le gris des voitures de direction. Celles qui ne s'arr\u00eatent jamais."],
  ]){COSM.peinture.push(Object.assign({id:e[0],n:e[1],c:e[2],r:e[4],pack:'palette',d:e[5]},e[3]?{g:e[3]}:{}));PALETTE_PACK.ids.push(e[0]);}
  for(const e of [ // [id, nom, couleur | dégradé [bas, milieu, haut], finition, rareté, description, INDICE]
    ["prisme","PRISME",[0xff4a3a,0xffd23a,0x3a8cff],"c","legendaire","La lumi\u00e8re se casse en trois sur ta carrosserie.","Six en l'air, sans toucher terre."],
    ["fantome","FANT\u00d4ME",0xe8eef8,"n","epique","Blanc nacr\u00e9, presque transparent. Personne ne t'a vu passer.","Deux minutes. Pas un bord."],
    ["orrose","OR ROSE",0xf0a890,"o","legendaire","L'or des montres dont personne ne regarde l'heure.","Divin, et tr\u00e8s, tr\u00e8s vite."],
    ["eclair","\u00c9CLAIR",[0x1a2a8a,0x3a7bff,0xe8f4ff],"c","legendaire","Du bleu nuit au blanc \u00e9lectrique : la foudre qui monte.","Le compteur a une limite. Pas toi."],
    ["nacre","NACRE",[0xe6dcef,0xfbf8f2,0xdcefff],"n","epique","L'int\u00e9rieur d'un coquillage, poli par cinq vagues parfaites.","Cinq fois parfait. \u00c0 la suite."],
    ["orage","CIEL D'ORAGE",[0x11151e,0x2e3646,0xaab1c4],"k","epique","Ardoise en bas, \u00e9clair en haut. Le ciel quand il se f\u00e2che.","Sous l'orage, le pied loin du bouton."],
    ["jadeimperial","JADE IMP\u00c9RIAL",[0x08382a,0x1a9c6c,0xa6f0cc],"n","legendaire","La pierre des empereurs, taill\u00e9e sur le plus long chemin.","Les pics gardent le chemin le plus long."],
    ["lunaire","LUNAIRE",[0x2a2c34,0x9a9da6,0xf2f2f6],"s","epique","Poussi\u00e8re de crat\u00e8re, sans un grain d'atmosph\u00e8re.","En orbite, passe la troisi\u00e8me porte."],
    ["lampadaire","LAMPADAIRE",[0x101422,0x2a3a6a,0xffc85a],"g","legendaire","La nuit en bas, le r\u00e9verb\u00e8re sur le toit. La ville t'\u00e9claire.","La ville, la nuit, applaudit les acrobates."],
    ["cameleon","CAM\u00c9L\u00c9ON",[0x0e6a48,0x1d5ed0,0x8a2bd0],"c","mythique","Vert, bleu, violet : elle change de peau \u00e0 chaque monde.","Quatre mondes, une seule vie."],
  ]){const o={id:e[0],sec:e[0],pack:'palette',r:e[4],ind:e[6]},vu=function(){return !!window.PAL_REVELE||shopOwned('peinture',o.id);},gr=Array.isArray(e[2]);
    Object.defineProperties(o,{n:{get:function(){return vu()?e[1]:'? ? ?';},enumerable:true},d:{get:function(){return vu()?e[5]:e[6];},enumerable:true},
      c:{get:function(){return vu()?(gr?undefined:e[2]):PAL_MASQUE;},enumerable:true},grad:{get:function(){return vu()&&gr?e[2]:undefined;},enumerable:true},
      g:{get:function(){return vu()?e[3]:'s';},enumerable:true}});
    COSM.peinture.push(o);PALETTE_PACK.ids.push(e[0]);}
  Object.assign(I18N,{"LA PALETTE": "THE PALETTE", "COULEUR SECRÈTE": "SECRET COLOUR", "LES 40 COULEURS SONT À TOI": "ALL 40 COLOURS ARE YOURS", "COULEUR": "COLOUR", "ROSE DRAGÉE": "SUGAR PINK", "Le rose des baptêmes. Tu roules quand même à 300.": "Christening pink. You're still doing 300.", "ABRICOT": "APRICOT", "Doux comme un fruit, rapide comme un vol.": "Soft as a fruit, fast as a flight.", "VANILLE": "VANILLA", "Une boule de glace qui ne fond pas à 1 000 km/h.": "A scoop of ice cream that won't melt at 1,000 km/h.", "PISTACHE": "PISTACHIO", "Le vert des glaciers italiens. Les pneus, eux, sont chauds.": "Italian gelato green. The tyres, though, are hot.", "VERT AMANDE": "ALMOND GREEN", "Le vert de la voiture de ta grand-mère. En plus nerveux.": "Your grandma's car green. With more attitude.", "ÉCUME": "SEA FOAM", "La mousse sur la vague. La vague, c'est toi.": "The foam on the wave. You are the wave.", "BLEU PISCINE": "POOL BLUE", "Le bleu d'une piscine de palace. Plongeoir compris.": "Five-star hotel pool blue. Diving board included.", "LILAS": "LILAC", "Une fleur de printemps qui double par la droite.": "A spring flower that overtakes on the right.", "BARBE À PAPA": "CANDY FLOSS", "Sucre filé, carrosserie dure. Ne lèche pas.": "Spun sugar, hard shell. Don't lick it.", "BLANC NEIGE": "SNOW WHITE", "Propre comme un compte en Suisse.": "Clean as a Swiss bank account.", "ROUGE BOLIDE": "RACING RED", "Le rouge des grandes marques. Sans le cheval, avec l'arrogance.": "The red of the big brands. Without the horse, with the arrogance.", "ORANGE ÉMEUTE": "RIOT ORANGE", "Visible depuis l'espace. C'est le but.": "Visible from space. That's the point.", "JAUNE TAXI": "TAXI YELLOW", "Tout le monde te fait signe. Tu ne t'arrêtes pas.": "Everyone waves at you. You don't stop.", "CITRON VERT": "LIME", "Acide. Comme tes dépassements.": "Sour. Like your overtakes.", "VERT BILLET": "CASH GREEN", "La couleur préférée de ton banquier.": "Your banker's favourite colour.", "LAGON": "LAGOON", "L'eau des îles où tu dépenses tes primes.": "The water of the islands where you spend your bonuses.", "AZUR": "AZURE", "Le ciel sans un nuage. Le tien.": "A sky without a single cloud. Yours.", "VIOLET ROYAL": "ROYAL PURPLE", "La couleur des rois. Et de ceux qui roulent comme eux.": "The colour of kings. And of those who drive like them.", "FUCHSIA": "FUCHSIA", "Trop voyant ? Juste assez.": "Too loud? Exactly loud enough.", "ARGENT BROSSÉ": "BRUSHED SILVER", "Métal brossé, reflet discret. L'argent ne crie pas, il brille.": "Brushed metal, quiet shine. Money doesn't shout, it gleams.", "BORDEAUX": "BURGUNDY", "Un grand cru, mis en bouteille dans de la tôle.": "A great vintage, bottled in sheet metal.", "CUIVRE": "COPPER", "Le métal des vieux tuyaux. Passé au polish.": "Old-pipe metal. Freshly polished.", "BRONZE": "BRONZE", "La troisième marche du podium ? Pas ce soir.": "Third step of the podium? Not tonight.", "OLIVE": "OLIVE", "Du kaki métallisé. Une jeep qui serait allée à l'opéra.": "Metallic khaki. A jeep that went to the opera.", "VERT ANGLAIS": "BRITISH GREEN", "Le vert des bolides d'avant-guerre. Le thé est en option.": "Pre-war racing green. Tea is optional.", "BLEU PÉTROLE": "PETROL BLUE", "Profond comme une nappe de pétrole. En plus propre.": "Deep as an oil slick. Only cleaner.", "BLEU ABYSSE": "ABYSS BLUE", "Le bleu du fond des océans. Personne ne t'y trouve.": "Deep-ocean blue. Nobody finds you down there.", "AUBERGINE": "AUBERGINE", "Un violet presque noir. Classe sans le faire exprès.": "Almost-black purple. Classy without trying.", "FRAMBOISE": "RASPBERRY", "Un rouge mûri au soleil. Sucré, pas mou.": "A red that ripened in the sun. Sweet, not soft.", "GRAPHITE": "GRAPHITE", "Le gris des voitures de direction. Celles qui ne s'arrêtent jamais.": "Boardroom grey. Those cars never stop.", "PRISME": "PRISM", "La lumière se casse en trois sur ta carrosserie.": "Light splits in three on your bodywork.", "Six en l'air, sans toucher terre.": "Six in the air, without touching down.", "FANTÔME": "GHOST", "Blanc nacré, presque transparent. Personne ne t'a vu passer.": "Pearl white, almost see-through. Nobody saw you pass.", "Deux minutes. Pas un bord.": "Two minutes. Not one edge.", "OR ROSE": "ROSE GOLD", "L'or des montres dont personne ne regarde l'heure.": "The gold of watches nobody checks the time on.", "Divin, et très, très vite.": "Divine, and very, very fast.", "ÉCLAIR": "LIGHTNING", "Du bleu nuit au blanc électrique : la foudre qui monte.": "From night blue to electric white: lightning on the rise.", "Le compteur a une limite. Pas toi.": "The speedometer has a limit. You don't.", "NACRE": "PEARL", "L'intérieur d'un coquillage, poli par cinq vagues parfaites.": "The inside of a shell, polished by five perfect waves.", "Cinq fois parfait. À la suite.": "Perfect five times. In a row.", "CIEL D'ORAGE": "STORM SKY", "Ardoise en bas, éclair en haut. Le ciel quand il se fâche.": "Slate below, lightning above. The sky when it's angry.", "Sous l'orage, le pied loin du bouton.": "In the storm, keep your foot off the button.", "JADE IMPÉRIAL": "IMPERIAL JADE", "La pierre des empereurs, taillée sur le plus long chemin.": "The emperors' stone, cut on the longest road.", "Les pics gardent le chemin le plus long.": "The peaks guard the longest road.", "LUNAIRE": "LUNAR", "Poussière de cratère, sans un grain d'atmosphère.": "Crater dust, without a grain of atmosphere.", "En orbite, passe la troisième porte.": "In orbit, pass the third gate.", "LAMPADAIRE": "STREETLIGHT", "La nuit en bas, le réverbère sur le toit. La ville t'éclaire.": "Night below, the lamp on the roof. The city lights you up.", "La ville, la nuit, applaudit les acrobates.": "The city, at night, cheers for acrobats.", "CAMÉLÉON": "CHAMELEON", "Vert, bleu, violet : elle change de peau à chaque monde.": "Green, blue, purple: it changes skin in every world.", "Quatre mondes, une seule vie.": "Four worlds, one life."});
}
/* LES PEINTURES PAR RARETÉ, EN EUROS, ET LES MOTIFS (2026-10-16, Sacha : « toutes les couleurs classiques doivent être en rareté commune ; les
   dégradés de plusieurs couleurs, rare — pareil pour l'or ; les épiques, c'est des motifs : léopard, tigre, fleur… ; enlève la rareté mythique ;
   classe-les dans l'ordre de rareté » · « génère une dizaine de peintures épiques avec des motifs ; couleur pleine : commun ; dégradée : rare ; avec
   des motifs : épique ; légendaire, on verra après — pas de légendaire pour l'instant ; communes 1 €, rares 3 €, épiques 5 € »).
   · LA RÈGLE (`peintRegle`), une seule pour toutes les peintures : un MOTIF = ÉPIQUE · un DÉGRADÉ (`grad`) ou l'OR (g:'o') = RARE · une couleur
     pleine (laque, mat, métallisé, nacre, chrome, laqué noir) = COMMUNE. Plus aucune peinture exotique, légendaire ni mythique — ces raretés
     restent aux caisses, ailes et traînées.
   · LE PRIX EN EUROS (`PEINT_EUR` → `d.eur`) : 1 € · 3 € · 5 €, par la même porte que les caisses en € : `shopPaye('peinture:'+id)` (produit App
     Store à créer : `cashcar.peinture.<id>`), puis `habDonne`. Tant que StoreKit n'est pas branché, ACHETER le DIT (« L'achat est indisponible
     pour le moment. ») et ne donne rien (`habPaye`). Le prix en pièces (`p`) des peintures est retiré : celles déjà achetées restent à toi.
     Se gagnent toujours, sans prix : l'OR MASSIF et le SUPER GUERRIER (carnets), les dix SECRÈTES (leur défi, ou le pack). D'ORIGINE reste offerte.
   · L'ORDRE (`peintOrdre`) : le rayon PEINTURES de la boutique et la bande de la console vont de la COMMUNE à l'ÉPIQUE.
   · LES MOTIFS (`MOTIFS`) : onze peintures épiques. Chacune est une toile de 512 px qui se raccorde sur ses quatre bords (`motTore`), dessinée une
     fois (`motTex`), posée sur la tôle en PROJECTION TRIPLANAIRE dans le repère de la caisse (`motGreffe`/`MOT_GLSL` : côtés, toit, nez, poupe,
     chacun à l'endroit — le « $ » se lit des deux côtés). Le kit coule la tôle peinte dans son propre tampon (`pm:<id>`, voir peintPal) : les
     accents gardent leur couleur ; un gabarit hors kit greffe sa matière de carrosserie (bodyM). `s` = répétitions par mètre ; `c` = la teinte
     de fond (les outils de l'atelier, les replis). Les pastilles des listes montrent le motif (`motFond`). Essayer : `dbgHab('peinture','tigre')`.
   `?peintures=avant` = les raretés et les prix d'avant, sans les motifs. */
const PEINT_V2=!/[?&]peintures=avant\b/.test(location.search);
const PEINT_EUR={commun:'1 €',rare:'3 €',epique:'5 €'};
const PEINT_SEC_R={prisme:'rare',fantome:'commun',orrose:'rare',eclair:'rare',nacre:'rare',orage:'rare',jadeimperial:'rare',lunaire:'rare',lampadaire:'rare',cameleon:'rare'}; // les secrètes : leur vraie matière reste masquée tant qu'on ne les a pas gagnées
function peintRegle(d){if(d.mot)return 'epique';if(d.sec)return PEINT_SEC_R[d.id]||'rare';return (d.grad||d.g==='o')?'rare':'commun';}
const MOT_W=512;
function motAlea(s){return function(){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function motTore(x,f){for(const ox of [-MOT_W,0,MOT_W])for(const oy of [-MOT_W,0,MOT_W]){x.save();x.translate(ox,oy);f();x.restore();}} // chaque forme est posée avec ses huit voisines : la toile se raccorde sur ses quatre bords
function motForme(R,k){const h=[];for(let i=0;i<3;i++)h.push([2+i+((R()*2)|0),R()*6.283,(k==null?.22:k)*(.4+.6*R())/(1+i*.5)]);return h;} // une tache : trois harmoniques sur le rayon
function motTache(x,cx,cy,r,h,sy){x.beginPath();for(let i=0;i<=40;i++){const t=i/40*6.2832;let q=1;for(const e of h)q+=e[2]*Math.sin(e[0]*t+e[1]);
  const X=cx+Math.cos(t)*r*q,Y=cy+Math.sin(t)*r*q*(sy||1);if(i)x.lineTo(X,Y);else x.moveTo(X,Y);}x.closePath();}
function motPose(x,cx,cy,r,h,col,sy){motTore(x,function(){motTache(x,cx,cy,r,h,sy);x.fillStyle=col;x.fill();});}
function motGrille(n,R,j){const L=[],c=MOT_W/n;for(let a=0;a<n;a++)for(let b=0;b<n;b++)L.push([(a+.5)*c+(R()-.5)*c*j,(b+.5)*c+(R()-.5)*c*j]);return L;} // des points sans paquets : une grille secouée
function motLueur(x,cx,cy,r,c0,c1){motTore(x,function(){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,c0);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r);});}
function motBande(x,P,col){motTore(x,function(){x.beginPath();x.moveTo(P[0][0]-P[0][2],P[0][1]);for(const q of P)x.lineTo(q[0]-q[2],q[1]);for(let k=P.length-1;k>=0;k--)x.lineTo(P[k][0]+P[k][2],P[k][1]);x.closePath();x.fillStyle=col;x.fill();});} // une rayure : [x du milieu, y, demi-largeur]
const MOTIFS={
  leopard:{s:.42,c:0xd29a45,f:function(x,R){x.fillStyle='#d29a45';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<9;i++)motLueur(x,R()*MOT_W,R()*MOT_W,60+R()*90,R()<.5?'rgba(238,192,112,.4)':'rgba(170,110,40,.32)','rgba(200,150,70,0)'); // le pelage ondule
    for(const p of motGrille(6,R,.6)){const r=19+R()*12;motPose(x,p[0],p[1],r*.62,motForme(R,.25),'#a65d1b');      // la rosette : un cœur fauve…
      const n=3+((R()*3)|0),a0=R()*6.28;for(let k=0;k<n;k++){const a=a0+k/n*6.2832+(R()-.5)*.5,d=r*(.85+R()*.15);
        motPose(x,p[0]+Math.cos(a)*d,p[1]+Math.sin(a)*d,r*(.3+R()*.14),motForme(R,.35),'#1a110a');}}            // …dans un anneau noir en morceaux
    for(let i=0;i<30;i++)motPose(x,R()*MOT_W,R()*MOT_W,4+R()*6,motForme(R,.3),'#1a110a');}},
  tigre:{s:.45,c:0xee8320,f:function(x,R){x.fillStyle='#ee8320';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<8;i++)motLueur(x,R()*MOT_W,R()*MOT_W,70+R()*100,'rgba(255,186,90,.5)','rgba(255,186,90,0)');
    const n=9;for(let i=0;i<n;i++){const x0=(i+.2+R()*.6)*MOT_W/n,y0=R()*MOT_W,L=MOT_W*(.45+R()*.5),w=9+R()*9,A=6+R()*12,fr=.6+R()*1.2,ph=R()*6.28,pen=(R()-.5)*.35,P=[];
      for(let k=0;k<=24;k++){const t=k/24,y=y0+t*L;P.push([x0+A*Math.sin(t*6.283*fr+ph)+pen*(y-y0),y,w*Math.pow(Math.sin(Math.PI*t),.6)+.5]);}motBande(x,P,'#140c06'); // la rayure s'effile aux deux bouts
      if(R()<.6){const t0=.2+R()*.5,yb=y0+t0*L,xb=x0+A*Math.sin(t0*6.283*fr+ph)+pen*(yb-y0),sg=R()<.5?-1:1,Lb=40+R()*50,wb=w*.55; // une fourche
        motTore(x,function(){x.beginPath();x.moveTo(xb,yb-wb);x.quadraticCurveTo(xb+sg*Lb*.6,yb-wb*.2,xb+sg*Lb,yb+Lb*.35);x.quadraticCurveTo(xb+sg*Lb*.5,yb+wb*.9,xb,yb+wb);x.closePath();x.fillStyle='#140c06';x.fill();});}}}},
  zebre:{s:.45,c:0xf1ede4,f:function(x,R){x.fillStyle='#f1ede4';x.fillRect(0,0,MOT_W,MOT_W);
    const n=11;for(let i=0;i<n;i++){const x0=(i+R()*.3)*MOT_W/n,w=8+R()*8,a1=10+R()*14,a2=4+R()*8,p1=R()*6.28,p2=R()*6.28,p3=R()*6.28,k1=1+((R()*2)|0),P=[];
      for(let k=0;k<=48;k++){const t=k/48;P.push([x0+a1*Math.sin(t*6.2832*k1+p1)+a2*Math.sin(t*6.2832*3+p2),t*MOT_W,w*(1+.45*Math.sin(t*6.2832*2+p3))]);}motBande(x,P,'#121212');}}}, // des fréquences entières : la rayure se raccorde en haut et en bas
  vache:{s:.38,c:0xf4f2ec,f:function(x,R){x.fillStyle='#f4f2ec';x.fillRect(0,0,MOT_W,MOT_W);
    for(const p of motGrille(3,R,.7))motPose(x,p[0],p[1],38+R()*32,motForme(R,.3),'#151515');
    for(let i=0;i<4;i++)motPose(x,R()*MOT_W,R()*MOT_W,10+R()*14,motForme(R,.3),'#151515');}},
  fleurs:{s:.45,c:0xff5aa5,f:function(x,R){x.fillStyle='#ff5aa5';x.fillRect(0,0,MOT_W,MOT_W);
    const T=[['#fffaf2','#ffc928',8],['#ff9b21','#fff4d6',6],['#c8f04a','#ff8a1f',5],['#7fe3ff','#fffaf2',6]]; // [pétales, cœur, nombre de pétales]
    const fl=function(cx,cy,r,ty,a0){const q=T[ty];motTore(x,function(){x.save();x.translate(cx,cy);x.rotate(a0);
      for(let k=0;k<q[2];k++){x.save();x.rotate(k/q[2]*6.2832);x.beginPath();x.ellipse(r*.55,0,r*.5,r*.24,0,0,6.2832);x.fillStyle=q[0];x.fill();x.lineWidth=2;x.strokeStyle='rgba(120,20,60,.25)';x.stroke();x.restore();}
      x.beginPath();x.arc(0,0,r*.3,0,6.2832);x.fillStyle=q[1];x.fill();x.restore();});};
    for(const p of motGrille(4,R,.55))fl(p[0],p[1],34+R()*20,R()<.5?0:1+((R()*3)|0),R()*6.28);
    for(const p of motGrille(4,R,.9))if(R()<.6)fl(p[0]+64,p[1]+64,14+R()*8,(R()*4)|0,R()*6.28);}},
  camo:{s:.4,c:0x6f7b44,f:function(x,R){x.fillStyle='#6f7b44';x.fillRect(0,0,MOT_W,MOT_W);
    for(const L of [['#45522a',5,46,40],['#86683f',4,38,34],['#24241a',5,22,22]])for(const p of motGrille(L[1],R,1))motPose(x,p[0],p[1],L[2]+R()*L[3],motForme(R,.4),L[0],.75+R()*.5);}},
  damier:{s:.42,c:0xf2f2f2,f:function(x){const n=8,c=MOT_W/n;for(let a=0;a<n;a++)for(let b=0;b<n;b++){x.fillStyle=(a+b)&1?'#141414':'#f2f2f2';x.fillRect(a*c,b*c,c,c);}}},
  ecailles:{s:.5,c:0x1a8a55,f:function(x,R){x.fillStyle='#0b3524';x.fillRect(0,0,MOT_W,MOT_W);
    const nc=8,nr=10,cw=MOT_W/nc,rh=MOT_W/nr,r=cw*.62,V=[];for(let j=0;j<nr;j++){V.push([]);for(let i=0;i<nc;i++)V[j].push(R());}
    for(let j=-2;j<=nr+2;j++){const jj=((j%nr)+nr)%nr,y=MOT_W-j*rh,ox=(jj&1)*cw/2; // du bas vers le haut : chaque rangée recouvre le haut de celle du dessous — on voit le bord ARRONDI des écailles, tourné vers le sol
      for(let i=-1;i<=nc;i++){const v=V[jj][((i%nc)+nc)%nc],cx=i*cw+ox,cy=y-r*.35,g=x.createRadialGradient(cx,cy-r*.2,r*.1,cx,cy+r*.15,r*1.05);
        g.addColorStop(0,'hsl('+(140+v*22).toFixed(0)+',70%,'+(46+v*10).toFixed(0)+'%)');g.addColorStop(.7,'hsl('+(150+v*15).toFixed(0)+',75%,24%)');g.addColorStop(1,'#06261a');
        x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle=g;x.fill();x.beginPath();x.arc(cx,cy,r-2,.12*Math.PI,.88*Math.PI);x.lineWidth=4;x.strokeStyle='#e6bf57';x.stroke();}}}},
  coccinelle:{s:.5,c:0xd8141c,f:function(x,R){x.fillStyle='#d8141c';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<6;i++)motLueur(x,R()*MOT_W,R()*MOT_W,80+R()*80,'rgba(255,90,80,.35)','rgba(255,90,80,0)');
    for(const p of motGrille(4,R,.5))motPose(x,p[0],p[1],22+R()*12,motForme(R,.06),'#120808');
    for(const p of motGrille(4,R,.4))if(R()<.45)motPose(x,p[0]+64,p[1]+64,9+R()*6,motForme(R,.05),'#120808');}},
  galaxie:{s:.32,c:0x2a1a6a,f:function(x,R){x.fillStyle='#0a0720';x.fillRect(0,0,MOT_W,MOT_W);
    const N=['255,70,200','70,150,255','150,80,255','60,230,220'];
    for(let i=0;i<12;i++){const c=N[(R()*4)|0],a=.18+R()*.25;motLueur(x,R()*MOT_W,R()*MOT_W,70+R()*130,'rgba('+c+','+a.toFixed(2)+')','rgba('+c+',0)');} // les nébuleuses
    for(let i=0;i<260;i++){const cx=R()*MOT_W,cy=R()*MOT_W,r=.7+R()*R()*2.2,a=.45+R()*.55;motTore(x,function(){x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';x.fill();});}
    for(let i=0;i<9;i++){const cx=R()*MOT_W,cy=R()*MOT_W,r=10+R()*10;motLueur(x,cx,cy,r,'rgba(255,255,255,1)','rgba(160,190,255,0)'); // les étoiles qui brillent, en croix
      motTore(x,function(){x.fillStyle='rgba(255,255,255,.85)';x.fillRect(cx-r*1.4,cy-.8,r*2.8,1.6);x.fillRect(cx-.8,cy-r*1.4,1.6,r*2.8);});}}},
  cash:{s:.45,c:0x1d7f45,f:function(x,R){x.fillStyle='#1d7f45';x.fillRect(0,0,MOT_W,MOT_W);
    x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=10;for(let k=-5;k<5;k++){x.beginPath();x.moveTo(k*128,0);x.lineTo(k*128+MOT_W,MOT_W);x.stroke();} // le guillochage du billet
    x.font='900 92px "Arial Black",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
    for(let b=0;b<4;b++)for(let a=0;a<4;a++){const cx=(a+.5+(b&1)*.5)*128,cy=(b+.5)*128,ro=(R()-.5)*.5;
      motTore(x,function(){x.save();x.translate(cx,cy);x.rotate(ro);x.lineWidth=10;x.strokeStyle='#0c4425';x.strokeText('$',0,4);x.fillStyle='#ffd23a';x.fillText('$',0,4);x.restore();});}}}};
const MOT_TX={},MOT_URL={};
function motToile(id,w){const M=MOTIFS[id];if(!M)return null;const cv=document.createElement('canvas');cv.width=cv.height=w;const x=cv.getContext('2d');
  let h=7;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619);x.scale(w/MOT_W,w/MOT_W);M.f(x,motAlea(h));return cv;} // le même tirage à chaque fois : la peinture ne change pas d'une caisse à l'autre
function motTex(id){if(MOT_TX[id])return MOT_TX[id];const cv=motToile(id,MOT_W);if(!cv)return null;const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return MOT_TX[id]=t;}
function motUrl(id){if(MOT_URL[id]!=null)return MOT_URL[id];let u='';try{const cv=motToile(id,128);u=cv?cv.toDataURL('image/jpeg',.88):'';}catch(e){}return MOT_URL[id]=u;}
function motFond(d){const c='#'+((d.c||0)>>>0).toString(16).padStart(6,'0'),u=motUrl(d.mot);return u?'url('+u+') center/200% auto,'+c:c;} // la PASTILLE d'un motif (le fond CSS des listes)
/* la projection : chaque face prend la toile du plan qui lui fait face (pondérée par sa normale ^12 : un pan en biais prend surtout le plan le plus proche — à ^6 le damier virait au gris en fondant deux plans),
   retournée là où il faut pour se lire À L'ENDROIT de l'extérieur — dans le repère de la caisse : le motif colle à la tôle quand elle roule */
const MOT_GLSL='vec3 mN9=normalize(vMotN),mA9=pow(abs(mN9),vec3(12.));mA9/=max(1e-4,mA9.x+mA9.y+mA9.z);vec3 mP9=vMotP*uMotS;\n'+
  'vec3 motC=texture2D(uMot,vec2(mN9.x<0.?mP9.z:-mP9.z,mP9.y)).rgb*mA9.x+texture2D(uMot,vec2(mN9.y<0.?mP9.x:-mP9.x,mP9.z)).rgb*mA9.y+texture2D(uMot,vec2(mN9.z<0.?-mP9.x:mP9.x,mP9.y)).rgb*mA9.z;\n'+
  'diffuseColor.rgb*=motC;\n';
const MOT_FAIT=new WeakSet(); // les matières déjà greffées (un clone de matière perd la greffe : la fin de buildCar le rattrape)
function motGreffe(m,id){const T=motTex(id),M=MOTIFS[id];if(!T||!M||MOT_FAIT.has(m))return m;MOT_FAIT.add(m);const prev=m.onBeforeCompile,pk=String(prev),uT={value:T},uS={value:M.s};
  m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.uMot=uT;sh.uniforms.uMotS=uS;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMotP;varying vec3 vMotN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMotP=transformed;vMotN=objectNormal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uMot;uniform float uMotS;varying vec3 vMotP;varying vec3 vMotN;')
      .replace('#include <color_fragment>','#include <color_fragment>\n'+MOT_GLSL).replace('vColor*uGlow','vColor*motC*uGlow');}; // le plancher lumineux du kit prend le motif aussi
  m.customProgramCacheKey=function(){return 'motif|'+pk;}; // ⚠ r128 réutilise un programme d'une matière à l'autre par cette clé : une par greffe d'origine (la laque du kit, le vernis rimify) ; le motif, lui, vit dans un uniform
  m.userData.mot=id;return m;}
if(PEINT_V2){
  for(const e of [ // [id, nom, description] — le motif : MOTIFS[id]
    ["leopard","LÉOPARD","Des rosettes noires sur fond doré. Tu ne chasses pas : tu doubles."],
    ["tigre","TIGRE","Orange brûlé, rayures noires. Le roi de la jungle a troqué ses griffes contre des pneus."],
    ["zebre","ZÈBRE","Noir sur blanc ou blanc sur noir ? Personne ne sait. Toi, tu fonces."],
    ["vache","VACHE","Des taches noires sur fond blanc. Meuh, à 300 à l'heure."],
    ["fleurs","FLOWER POWER","Des marguerites sur fond rose. Peace, love et nitro."],
    ["camo","CAMOUFLAGE","Kaki, brun, vert sapin. Invisible en forêt. À 900 à l'heure, un peu moins."],
    ["damier","DAMIER","Le drapeau d'arrivée peint sur toute la caisse. Tu as déjà gagné."],
    ["ecailles","PEAU DE DRAGON","Des écailles vertes cerclées d'or. Le dragon a mué : la peau est à toi."],
    ["coccinelle","COCCINELLE","Rouge vif, pois noirs. Porte-bonheur, et en plus elle va vite."],
    ["galaxie","GALAXIE","Des nébuleuses et mille étoiles sur la carrosserie. Le ciel de nuit, en laque."],
    ["cash","PLEIN AUX AS","Des dollars d'or sur fond vert billet. Discret ? Non."],
  ])COSM.peinture.push({id:e[0],n:e[1],mot:e[0],c:MOTIFS[e[0]].c,d:e[2]});
  for(const d of COSM.peinture){if(d.id==='usine')continue;const r=peintRegle(d);d.r=r;if(!d.mis&&!d.sec){d.eur=PEINT_EUR[r];delete d.p;}} // la rareté ÉCRITE et le prix en euros ; carnets et secrètes se gagnent toujours
  Object.assign(I18N,{"LÉOPARD":"LEOPARD","Des rosettes noires sur fond doré. Tu ne chasses pas : tu doubles.":"Black rosettes on gold. You don't hunt: you overtake.",
    "TIGRE":"TIGER","Orange brûlé, rayures noires. Le roi de la jungle a troqué ses griffes contre des pneus.":"Burnt orange, black stripes. The king of the jungle traded his claws for tyres.",
    "ZÈBRE":"ZEBRA","Noir sur blanc ou blanc sur noir ? Personne ne sait. Toi, tu fonces.":"Black on white or white on black? Nobody knows. You just floor it.",
    "VACHE":"COW","Des taches noires sur fond blanc. Meuh, à 300 à l'heure.":"Black patches on white. Moo, at 300 km/h.",
    "FLOWER POWER":"FLOWER POWER","Des marguerites sur fond rose. Peace, love et nitro.":"Daisies on pink. Peace, love and nitro.",
    "CAMOUFLAGE":"CAMO","Kaki, brun, vert sapin. Invisible en forêt. À 900 à l'heure, un peu moins.":"Khaki, brown, pine green. Invisible in the woods. At 900 km/h, a bit less.",
    "DAMIER":"CHEQUERED","Le drapeau d'arrivée peint sur toute la caisse. Tu as déjà gagné.":"The finish flag painted all over the car. You've already won.",
    "SANS AILES":"NO WINGS","Les ailes, c'est pour les pigeons. Dix buses à air comprimé planquées dans la carrosserie : elle crache des bouffées blanches, pivote sur elle-même et s'envole. Bon. Ça a marché.":"Wings are for pigeons. Ten compressed-air nozzles hidden in the bodywork: it spits white puffs, spins on the spot and takes off. Well. It worked.","PEAU DE DRAGON":"DRAGON SKIN","Des écailles vertes cerclées d'or. Le dragon a mué : la peau est à toi.":"Green scales rimmed with gold. The dragon shed its skin: it's yours now.",
    "COCCINELLE":"LADYBUG","Rouge vif, pois noirs. Porte-bonheur, et en plus elle va vite.":"Bright red, black dots. A lucky charm, and fast too.",
    "GALAXIE":"GALAXY","Des nébuleuses et mille étoiles sur la carrosserie. Le ciel de nuit, en laque.":"Nebulae and a thousand stars on your bodywork. The night sky, lacquered.",
    "PLEIN AUX AS":"LOADED","Des dollars d'or sur fond vert billet. Discret ? Non.":"Gold dollars on cash green. Subtle? No.",
    "L'achat est indisponible pour le moment.":"Buying is unavailable right now."});
}
/* LES MISSIONS v2 — LES HABILLAGES QUI SE GAGNENT (2026-10-16, Sacha : « un objet donné par une mission ne s'achète plus : la boutique
   affiche à la place la mission qui le débloque ») : `mis2` = l'id de la mission ; plus de prix (ni dollars ni euros), plus de carnet.
   L'ARC-EN-CIEL (carnet 5) n'est plus la récompense d'aucune mission : « elle reste UNIQUEMENT dans le pack de la voiture chat » —
   `pack:'chat'` (shopOwned : à toi avec le CHAT POP-TART ; qui l'a déjà gagnée au carnet la garde, elle est dans `own`). */
{const H9={};for(const m of M2)if(m.r&&m.r.cat)H9[m.r.cat+':'+m.r.id]=m.id;
  for(const cat of ['peinture','aile','trainee'])for(const d of COSM[cat]){const id=H9[cat+':'+d.id];
    if(id){d.mis2=id;delete d.mis;delete d.p;delete d.eur;if(/relevant des défis/.test(d.d||''))d.d="Ne s'achète pas : elle se gagne par une mission.";}
    else if(d.mis){delete d.mis;if(d.id==='arcenciel'){d.pack='chat';d.d="Ne s'achète pas : elle vient avec le CHAT POP-TART.";}}}}
function peintOrdre(){const L=COSM.peinture.map(function(d,j){return j;});if(!PEINT_V2)return L; // les indices de COSM.peinture, de la COMMUNE à l'ÉPIQUE (D'ORIGINE en tête ; dans une rareté, l'ordre du catalogue)
  const rg=function(j){const d=COSM.peinture[j];return d.id==='usine'?-1:(INV_RANG[cosmRar('peinture',d)]|0);};return L.sort(function(a,b){return (rg(a)-rg(b))||(a-b);});}
/* acheter un habillage EN EUROS (une peinture) : la porte de StoreKit, comme une caisse — rien n'est donné tant qu'Apple n'a pas encaissé */
function habDonne(cat,id){const o=SAVE.d.shop.own,k=cat+':'+id;if(o.indexOf(k)<0)o.push(k);SAVE.d.shop.eq[cat]=id;SAVE.flush();}
function habPaye(cat,i,bt){const d=COSM[cat]&&COSM[cat][i];if(!d||!d.eur||shopOwned(cat,d.id)||habPaye.on)return false;habPaye.on=1;uiClic('');hap(12);
  shopPaye(cat+':'+d.id).then(function(){habPaye.on=0;habDonne(cat,d.id);garEquipeHabit(cat,i);shopShow(cat,i);hap([10,30,20,30,40]);try{pixBurst($('gCard'),26);gTampon(TR('À TOI !'));}catch(e){}
    try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}}catch(e){}try{GBQ.rk='';gShopJour();}catch(e){}},
    function(){habPaye.on=0;if(bt)try{gSecoue(bt);}catch(e){}uiClic('refus');hap([10,40,10]);toast(pxi('panier')+' '+TR("L'achat est indisponible pour le moment."));});return true;}
function palPossede(){const o=SAVE.d.shop.own;return PALETTE_PACK.ids.length>0&&PALETTE_PACK.ids.every(function(id){return o.indexOf('peinture:'+id)>=0;});} // le pack est acquis
function palDonne(){ // APRÈS le succès de shopPaye('palette') (ou une restauration d'achats) : les 40 dans `own` (Sacha, quiz 14 h 10 : les secrètes sont AUSSI dans le pack ; leur DÉFI reste la voie gratuite), jamais la banque du jeu
  if(!PALETTE_ON)return false;const o=SAVE.d.shop.own;let n9=0;for(const id of PALETTE_PACK.ids)if(o.indexOf('peinture:'+id)<0){o.push('peinture:'+id);n9++;}
  SAVE.flush();if(n9){toast(pxi('coche')+' '+TR('LA PALETTE')+' — '+TR('LES 40 COULEURS SONT À TOI'),true);try{hap([20,40,20,40,60]);}catch(e){}}return true;}
function secDonne(id){ // GAMEPLAY : un DÉFI (secret) réussi → sa couleur. Rien en balade ni au bac à sable ; rien si elle est déjà à toi
  if(!PALETTE_ON||(typeof BALADE!=='undefined'&&BALADE)||(typeof SANDBOX!=='undefined'&&SANDBOX))return false;
  const d=COSM.peinture.find(function(x){return x.sec===id;});if(!d||shopOwned('peinture',d.id))return false;
  SAVE.d.shop.own.push('peinture:'+d.id);SAVE.flush();
  if(!(m2LigneDit('col',sansAcc(TR('COULEUR')+' '+TR(d.n)),''))) /* (2026-10-17) en course : la ligne du bas, pas le toast du haut */
    toast(pxi('coche')+' '+TR('MISSION SECRÈTE')+' · '+TR('COULEUR')+' '+TR(d.n),true);try{hap([20,40,20,40,60]);}catch(e){}try{if(typeof SONV2!=='undefined'&&SONV2)sfx('victoire');}catch(e){}return true;}
function cosmSwCl(d){return d.g==='c'?' chrome':d.g==='o'?' or':d.g==='s'?' mat':d.g==='k'?' metal':d.g==='n'?' nacre':'';} // la classe de finition d'une pastille de peinture (une seule table pour toutes les listes)
/* (2026-10-14) LES FIGURES dans la console du garage : COSM.figure est la VUE du catalogue figures.js (même id, nom, prix) — la console
   (onglet, bande, fiche, ACHETER) la traite comme un habillage. Possédées : SAVE.d.figs (figPossede), achetées par shopBuy → figAchat ;
   « équipée » ne veut rien dire pour une figure : toutes celles qu'on a JOUENT (le double-tap tire au hasard parmi elles). */
function figDesc(f,lg){const en=lg==='en'||lg==='zh'; // (2026-10-14, textes) BILINGUE : la fiche des figures restait en français en anglais (aucune clé possible : la phrase est composée)
  const Q=en?{p:'off-axis spin',x:'flip',y:'flat spin',z:'barrel roll'}:{p:'vrille penchée',x:'salto',y:'toupie',z:'tonneau'};
  const tx=function(m,i){const n=['x','y','z'].filter(function(c,j){return Math.abs(m.a[j])>.1;}),q=Q[n.length>1?'p':n[0]],T=Math.abs(m.t);
    if(en)return m.t!=null?(T>1?T+' '+q+'s':(i?'one ':'One ')+q):(i?'a ':'A ')+q+' wobble';
    return m.t!=null?(T>1?T+' tours en '+q:(i?'un':'Un')+' tour en '+q):(i?'un':'Un')+' balancement en '+q;};
  const D=window.FIG&&FIG.dirs?FIG.dirs(f):['cote']; // (2026-10-15, les directions) la fiche dit le GESTE (le hasard parmi tes figures n'existe plus depuis le 15/10)
  if(D.indexOf('cote')>=0)return f.m.map(tx).join(' + ')+(en?'. Thumb to a SIDE + double-tap NITRO: it goes that way.':'. Pouce sur un CÔTÉ + double-tape NITRO : elle part de ce côté.');
  const av=D.indexOf('avant')>=0,ar=D.indexOf('arriere')>=0;
  return f.m.map(tx).join(' + ')+(en?'. Thumb '+(av&&ar?'FORWARD or BACK':av?'FORWARD':'BACK')+' + double-tap NITRO'+(av&&ar?': the flip goes that way.':'.')
                                    :'. Pouce '+(av&&ar?'en AVANT ou en ARRIÈRE':av?'en AVANT':'en ARRIÈRE')+' + double-tape NITRO'+(av&&ar?' : le salto part dans ce sens.':'.'));}
COSM.figure=(window.FIG?FIG.liste:[]).map(function(f){return {id:f.id,n:f.n,p:f.p,d:figDesc(f,'fr'),fig:1};});
const SHOP_CATS=['voiture','peinture','aile','trainee','figure'];
const SHOP={tab:'voiture',i:{peinture:0,aile:0,trainee:0},prev:null}; // prev : l'article ESSAYÉ (pas forcément à toi)
function shopOwned(cat,id){if(cat==='figure')return figPossede(id);if(cousin())return !!COSM[cat].find(x=>x.id===id); // (2026-10-14) LE CODE COUSIN : tous les habillages
const d=COSM[cat].find(x=>x.id===id);if(!d)return false;
  if(d.pack==='chat'&&m2Chat())return true; /* (2026-10-16, missions v2) l'ARC-EN-CIEL vient avec le chat */if(!d.p&&!d.mis&&!d.mis2&&!d.pack&&!d.sec&&!d.eur&&!d.serie)return true;return SAVE.d.shop.own.indexOf(cat+':'+id)>=0;} // (2026-10-14, palette) pack et secrètes : possédées seulement une fois données
function shopEqD(cat){const id=SAVE.d.shop.eq[cat],d=COSM[cat].find(x=>x.id===id);return (d&&shopOwned(cat,d.id))?d:COSM[cat][0];}
function cosm(cat){return (SHOP.prev&&SHOP.prev.cat===cat)?COSM[cat][SHOP.prev.i]:shopEqD(cat);} // ce que la caisse PORTE (essai compris)
// ⚠ le TOUT PREMIER `buildCar` tourne à l'init, AVANT que `SAVE`/`SHOP` ne soient déclarés (zone morte) : on rend alors l'origine
function cosmSur(cat){try{return cosm(cat);}catch(e){return null;}}
function shopBuy(cat,i){ // ⚠ débit et possession dans la MÊME fonction, comme `carBuy` : jamais l'un sans l'autre
  if(cat==='figure')return figAchat(i); // (2026-10-14) une FIGURE : SAVE.d.figs
  const d=COSM[cat][i];if(!d||!d.p)return {ok:false,raison:'pas-a-vendre'};
  if(shopOwned(cat,d.id))return {ok:false,raison:'deja-possedee'};
  if(bank()<d.p)return {ok:false,raison:'fonds-insuffisants',manque:d.p-bank()};
  SAVE.d.bank=bank()-d.p;SAVE.d.shop.own.push(cat+':'+d.id);SAVE.d.shop.eq[cat]=d.id;SAVE.flush();
  return {ok:true,paye:d.p};
}
function shopEquip(cat,i){const d=COSM[cat][i];if(!d||!shopOwned(cat,d.id))return false;SAVE.d.shop.eq[cat]=d.id;SAVE.flush();return true;}
window.dbgHab=function(cat,id){if(!COSM[cat])return null;const i=COSM[cat].findIndex(function(d){return d.id===id;});if(i<0)return 'inconnu'; // (2026-10-14, bancs) PORTER un habillage à l'essai, à toi ou non
  SHOP.prev={cat:cat,i:i};if(garageOn&&cat!=='peinture')SHOP.tab=cat;buildCar(CARS[garageOn?garageI:level]||CARS[0]);
  return {hab:cat+':'+id,rar:cosmRar(cat,COSM[cat][i]),ailes:carWingL?carWingL.children.length:0,anim:BLING.anim.length,fx:FX_EFF?{pop:FX_EFF.pop||null,rubOff:!!FX_EFF.rubOff}:null};};
/* LA PEINTURE entre par la PALETTE : la clé 'p' (la laque, par convention de tous les gabarits du kit) est
   remplacée avant que l'atelier ne coule les facettes. Un dégradé (`grad`) se calcule PAR SOMMET, sur la
   hauteur : du bas de caisse au toit. */
function peintPal(pal){
  const d=cosmSur('peinture');if(!d||d.id==='usine'||!pal||!pal.p)return pal;
  const o=Object.assign({},pal);o.p=d.mot?{g:'pm:'+d.mot,c:0xffffff,grad:null}:{g:d.g||'p',c:d.c!=null?d.c:d.grad[1],grad:d.grad||null}; // (2026-10-16) un MOTIF : la tôle blanche dans son propre tampon, le motif la colore (voir MOTIFS)
  if(pal.p.f===0)o.p.f=0;return o;
}
const LPG_A=new THREE.Color(),LPG_B=new THREE.Color();
function lpGrad(g,y,col){const u=LPU.cl((y-.35)/1.35,0,1);
  if(u<.5){LPG_A.setHex(g[0]);LPG_B.setHex(g[1]);col.copy(LPG_A).lerp(LPG_B,u*2);}
  else{LPG_A.setHex(g[1]);LPG_B.setHex(g[2]);col.copy(LPG_A).lerp(LPG_B,(u-.5)*2);}}
/* LES TRAÎNÉES TOUJOURS LÀ (2026-10-15 soir, Sacha : « retravaille toutes les traînées, il faut qu'elles soient toutes désirables ») — VU au banc
   (les 17 traînées portées tour à tour, nitro tenue, mer de nuages) : derrière la caisse on ne voyait presque que le FEU DE PIXELS du nitro — les
   pétales, le code, les anneaux, les billets… n'apparaissaient pas. La règle du 7 au 14/10 les ÉTEIGNAIT en réserve bleue et en nitro infinie (« deux
   messages ») ; or tenir la nitro vide la jauge et passe en réserve en ~2 s : la traînée achetée disparaissait justement quand on boostait. La réserve
   reste dite par le feu de pixels et la jauge ; la traînée de la boutique (`FX_EFF`), elle, joue à toute nitro. Les caisses à signature (le chat,
   sans traînée achetée) gardent la règle. `?trainee=signal` = avant. */
const TRAINEE_SIGNAL=/[?&]trainee=signal\b/.test(location.search);
let FX_EFF=null; // la signature de traînée EFFECTIVE (caisse + boutique), recalculée à chaque `buildCar`
