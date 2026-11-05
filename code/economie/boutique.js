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
  if(SAVE.d.owned.indexOf(i)<0){SAVE.d.owned.push(i);carWas[i]=true;try{feteCaisse(i);}catch(e){}} /* (2026-10-23) la fête de sa rareté */
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
  const arc=shArcHtml(i,a).replace('class="shArc"','class="shArc spArc"'); // (2026-10-20) le chat : « + TRAÎNÉE ARC-EN-CIEL INCLUSE » sous son nom
  el.innerHTML='<div class="spCarte '+rar+(arc?' avecArc':'')+'" data-car="'+i+'">'
    +'<span class="spRare">'+sansAcc(TR(RAR[rar]))+'</span>'+''
    +'<div class="shPhoto big">'+(ph?'<img src="'+ph+'" alt="">':'<i class="pxi pxi-voiture shAttente"></i>')+'</div>'
    +'<b class="spNom" id="spNom">'+insec(TR(CARS[i].name))+'</b>'+arc
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
  setTimeout(function(){if(SPOP.i===i&&el.classList.contains('on'))shopTourne(i,el);},spDuree()+60); /* la vue garage démarre une fois la fenêtre posée */
}
function shopPopVise(r){ // pose --dx/--dy/--s : l'écart entre la vignette `r` et la carte posée au centre
  const c=SPOP.el&&SPOP.el.querySelector('.spCarte');if(!c||!r||!(r.width>0))return;
  const f=c.getBoundingClientRect();if(!(f.width>0))return;
  c.style.setProperty('--dx',Math.round(r.left+r.width/2-(f.left+f.width/2))+'px');
  c.style.setProperty('--dy',Math.round(r.top+r.height/2-(f.top+f.height/2))+'px');
  c.style.setProperty('--s',Math.min(1,r.width/f.width).toFixed(3));
}
/* LA VUE GARAGE (2026-10-25, Sacha : « quand on clique sur une voiture, il faut qu'elle se mette à tourner, qu'on la voie comme dans le garage ») :
   la photo de la fenêtre d'achat devient un plateau tournant — STN poses de la même caisse (carPhoto, 4e argument = l'azimut), prises une par une
   entre deux images, cadrées pour tous les angles ; dès que la première est prête la caisse tourne (une pose manquante est sautée), et on peut
   la faire pivoter au doigt / à la souris (elle reprend sa ronde au lâcher). Fermer la fenêtre arrête tout (le jeton SPOP.tour). */
const STN=12;
function shopTourne(i,el){
  const host=el.querySelector('.shPhoto.big');if(!host)return;
  const T=SPOP.tour={i:i,F:[],a:0,v:0,drag:null,shown:-1,t0:performance.now(),stop:false};
  const vit=function(){return SPOP.tour===T&&!T.stop&&el.classList.contains('on');};
  const az=function(k){return PHOTO_AZ+k*2*Math.PI/STN;};
  let k=0;(function suite(){if(!vit()||k>=STN)return;const n=k++;try{carPhoto(i,function(u){if(u)T.F[n]=u;},null,az(n));}catch(e){}setTimeout(suite,90);})();
  host.style.touchAction='none';host.style.cursor='grab';
  host.addEventListener('pointerdown',function(e){T.drag={x:e.clientX,a:T.a};T.v=0;try{host.setPointerCapture(e.pointerId);}catch(_){}host.style.cursor='grabbing';});
  host.addEventListener('pointermove',function(e){if(!T.drag)return;const na=T.drag.a-(e.clientX-T.drag.x)*.012;T.v=(na-T.a);T.a=na;});
  const lache=function(){T.drag=null;host.style.cursor='grab';};
  host.addEventListener('pointerup',lache);host.addEventListener('pointercancel',lache);
  const calme=document.documentElement.getAttribute('data-reduced-motion')==='1';
  let t9=performance.now();
  (function tour(t){if(!vit())return;const dt=Math.min(.05,(t-t9)/1000);t9=t;
    if(!T.drag){if(Math.abs(T.v)>.002){T.a+=T.v;T.v*=.94;}else if(!calme)T.a+=dt*.7;} /* l'élan du lâcher, puis la ronde (un tour en 9 s) */
    const P=2*Math.PI,n=Math.round(((T.a%P)+P)%P/(P/STN))%STN;let j=n;for(let d=0;d<STN;d++){const a=(n+d)%STN,b=(n-d+STN)%STN;if(T.F[a]){j=a;break;}if(T.F[b]){j=b;break;}}
    if(T.F[j]&&j!==T.shown){T.shown=j;let im=host.querySelector('img');if(!im){const at=host.querySelector('.shAttente');if(at)at.remove();im=document.createElement('img');im.alt='';host.insertBefore(im,host.firstChild);}if(im.src!==T.F[j])im.src=T.F[j];}
    requestAnimationFrame(tour);})(t9);
}
function shopPopFerme(){
  const el=SPOP.el;if(!el||!el.classList.contains('on')||el.classList.contains('sortant'))return;
  if(SPOP.tour)SPOP.tour.stop=true;
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
  peinture:[ /* (2026-11-05) LE NUANCIER v3 : D'ORIGINE seule ici ; toutes les autres viennent de PEINT_CAT (plus bas) */
    {id:'usine',   n:"D'ORIGINE",        p:0,     d:'La teinte du constructeur. Elle a fait ses preuves.'}],
  aile:[ /* (2026-10-18, Sacha : « rajoute un zéro pour tous les prix des ailes ») les prix ×10 ; HÉLICES, PLUMES et CHAUVE-SOURIS gardent leur rareté d'avant, écrite en `r` (cosmRar la déduisait du prix) */
    {id:'panneaux',n:'PANNEAUX',          p:0,     d:'Deux planches de planeur, un aileron qui suit tes virages, des feux de position. Au boost, elles tirent deux traînées blanches.'},
    {id:'helices', n:'HÉLICES',           p:300000, r:'commun',    d:'Quatre rotors qui s\'emballent au boost et piquent du nez pour foncer. Ça ne vole pas mieux, mais ça brasse de l\'air.'},
    {id:'plumes',  n:'PLUMES D\'ANGE',    p:1200000,r:'rare',      d:'De vraies plumes blanches et dorées qui battent lentement et s\'ouvrent en éventail. Au boost, elles sèment de la poussière d\'or.'},
    {id:'chauve',  n:'CHAUVE-SOURIS',     p:2500000,r:'rare',      d:'Membranes veinées de violet, doigts d\'os. Elles battent vite, de travers, et se replient en flèche au boost. Pour les vols de nuit.'},
    // (2026-10-14) LES AILES POP (voir AILES_POP) — `ico`/`col` : le pictogramme de la vignette et sa couleur
    {id:'pigeon',   n:'PIGEON',            p:600000, r:'rare',      ico:'ai_pigeon', col:'#b4bac4',d:'Gris, deux barres noires, un cou vert-violet. Il claque des ailes au décollage, bat trop vite et plane sans savoir pourquoi.'},
    {id:'origami',  n:'AVION EN PAPIER',   p:900000, r:'rare',      ico:'ai_origami',col:'#f4f1ea',d:'Une feuille à grands carreaux pleine de gribouillis, un volet plié. Le pan claque au vent quand tu boostes : c\'est toi qui pilotes.'},
    {id:'monarque', n:'MONARQUE',          p:1200000,r:'rare',      ico:'ai_monarque',col:'#ff8a1a',d:'Orange et noir, nervures et points blancs, comme les vrais. Elles battent, planent, battent encore. Jusqu\'à 900 à l\'heure.'},
    {id:'pixel',    n:'8-BIT',             p:2500000,r:'rare',      ico:'ai_pixel',  col:'#ffd75e',d:'Des ailes d\'ange en gros pixels, animées image par image. Au boost, elles clignotent de toutes les couleurs, comme avec l\'étoile.'},
    {id:'baron',    n:'BARON ROUGE',       p:3800000,r:'rare',      ico:'ai_baron',  col:'#ff4a4e',d:'Toile rouge, haubans, ailerons, et l\'écharpe du pilote qui claque au vent. Un chien sur sa niche en rêve encore.'},
    {id:'rouages',  n:'ENGRENAGES',        p:4000000, /* (2026-11-05, Opus : jury ECO-23) les ailes du haut ramenées sous 5 M, l'ordre gardé ; avant 10 M */r:'epique',    ico:'ai_rouages',col:'#e0a84a',d:'Les rouages font battre l\'aile, la chaudière crache sa vapeur au boost. Léonard l\'avait dessinée, toi tu la pilotes.'},
    {id:'xwing',    n:'AILES EN X',        p:4200000, /* (ECO-23) avant 12 M */r:'epique',    ico:'ai_xwing',  col:'#e8e4da',d:'Repliées en croisière, elles s\'écartent en X dès que tu boostes, réacteurs à fond. Verrouillez les ailes en position d\'attaque.'},
    {id:'fee',      n:'FÉE',               p:4500000, /* (ECO-23) avant 16 M */r:'epique',    ico:'ai_fee',    col:'#d9b8ff',d:'Quatre voiles irisés qui bourdonnent et sèment de la poussière de fée. Il suffit d\'y croire. Et d\'un plein de nitro.'},
    {id:'dragon',   n:'DRAGON',            p:4800000, /* (ECO-23) avant 45 M */r:'legendaire',ico:'ai_dragon', col:'#ff5a2a',d:'Membranes veinées de lave, griffes, grands coups d\'aile. Au boost, la lave flambe et crache des braises.'},
    {id:'air',      n:'SANS AILES',        p:5000000, /* (ECO-23) avant 50 M */r:'legendaire',ico:'ai_air',    col:'#dff1ff',d:'Les ailes, c\'est pour les pigeons. Dix buses à air comprimé planquées dans la carrosserie : elle crache des bouffées blanches, pivote sur elle-même et s\'envole. Bon. Ça a marché.'}, // (2026-10-18, Léo) LA BLAGUE : l'aile la plus chère de la boutique… n'a pas d'aile (voir AILES_POP.air)
    {id:'phenix',   n:'PHÉNIX',            mis:10,pk:400000,r:'legendaire',ico:'flamme',col:'#ffb02a',d:'Des plumes de feu qui battent en semant des étincelles. Tu exploses ? Tu renais de tes cendres. Au prochain run.'}],
  trainee:[
    {id:'nitro',   n:'NITRO',             p:0,     d:'Orange brûlé. Le classique des tuyères.'},
    {id:'rose',    n:'ROSE NÉON',         p:40000,  rgb:[1.45,.22,1.05],pop:'neon',sil:{c:1.45,h:.75,f:0,p:.3},d:'Le rose des enseignes. On te suit à la trace.'},
    {id:'or',      n:'POUDRE D\'OR',      p:150000, rgb:[1.5,1.22,.3],pop:'paillettes',sil:{c:1.3,h:1.05,f:.1,p:1.9},d:'Tu ne laisses pas de la fumée derrière toi. Tu laisses de l\'or.'},
    {id:'arcenciel',n:'ARC-EN-CIEL',      mis:5,   rainbow:1,d:'Ne s\'achète pas : elle se gagne en relevant des défis.'},
    {id:'wow',     n:'WOW',               p:300000, wow:1,rgb:[1.45,.35,1.25],d:'Much sillage. Very mots. Wow.'}, // (2026-10-14) LA TRAÎNÉE WOW (voir wowStep) — la signature du DOGE
    // (2026-10-14) LES TRAÎNÉES POP (voir TRX) — `pop` : son moteur · `rgb` : la couleur du ruban qui l'accompagne · `rubOff` : pas de ruban (l'effet EST la traînée)
    {id:'sakura',   n:'SAKURA',            p:80000,  r:'rare',      pop:'sakura', rgb:[1.35,.6,.9],sil:{c:1.05,h:1.2,f:0,p:.5}, ico:'tr_sakura', col:'#ff9cc4',d:'Des pétales de cerisier, comme dans un générique d\'animé. Le drame, c\'est pour les autres.'},
    {id:'matrice',  n:'MATRICE',           p:110000, r:'rare',      pop:'matrice',rgb:[.25,1.25,.4],sil:{c:1.3,h:.65,f:0,p:1.8},ico:'tr_matrice',col:'#3dff6a',d:'Pilule rouge avalée : du code vert ruisselle derrière toi. La route, c\'est toi qui la réécris.'},
    {id:'anneaux',  n:'ANNEAUX D\'OR',     p:220000, r:'rare',      pop:'anneaux',rgb:[1.3,1.05,.25],sil:{c:1.3,h:1,f:.06,p:1.3},ico:'tr_anneaux',col:'#ffd23a',d:'Tu sèmes des anneaux comme un hérisson qui vient de se cogner. Sauf que toi, tu ne ralentis pas.'},
    {id:'glouton',  n:'GLOUTON',           p:400000, r:'rare',      pop:'glouton',rubOff:1,      ico:'tr_glouton',col:'#ffe14a',d:'Une ligne de pastilles et quatre fantômes à tes trousses. Lâche la nitro : ils deviennent bleus.'},
    {id:'hyper',    n:'HYPERESPACE',       p:900000, r:'epique',    pop:'hyper',  rgb:[.42,.98,2.2],sil:{c:1.6,h:.8,f:0,p:2.4},ico:'tr_hyper', col:'#9fd0ff',d:'Les étoiles s\'étirent en traits. Tu passes en vitesse lumière, les autres restent des touristes.'}, /* (2026-10-18, HYPERESPACE v2) ruban .95,1.15,1.6 (un blanc bleuté, délavé) → bleu ÉLECTRIQUE : le feu de pixels du nitro le prend aussi (nfeuPalTrainee) */
    {id:'grille',   n:'LA GRILLE',         p:2000000,r:'epique',    pop:'grille', rubOff:1,      ico:'tr_grille', col:'#2ee8ff',d:'Un mur de lumière dans ton sillage. Celui qui te colle finit en pixels.'}, /* (2026-10-18, Sacha : « the grid doit être epic ») ÉPIQUE, et son prix dans sa famille (350 000 → 200 000 : épique < 250 000, voir cosmRar) */
    {id:'billets',  n:'FAIS PLEUVOIR',     p:5000000,r:'legendaire',pop:'billets',rgb:[.45,1.3,.55],sil:{c:1.15,h:1.05,f:.08,p:1},ico:'tr_billets',col:'#5cd685',d:'Des liasses qui s\'envolent à chaque nitro. Ce n\'est pas du gaspillage, c\'est de la communication.'},
    {id:'foudre',   n:'FOUDRE DIVINE',     mis:11,pk:450000,r:'legendaire',pop:'foudre',rgb:[.85,.55,1.7],sil:{c:1.3,h:.75,f:0,p:2},ico:'foudre',col:'#b98aff',d:'Des éclairs crépitent derrière toi. Le marteau, tu l\'as laissé au garage.'} /* (2026-10-18, Sacha : « divine ligthing doit etre legendaire ») LÉGENDAIRE (elle était MYTHIQUE) ; son prix `pk` (450 000, Poki) est déjà dans la famille */]
};
/* (2026-10-18 soir, Sacha : « enlève la traînée menthe ») LES HABILLAGES RETIRÉS : leur ligne SORT de COSM (la sauvegarde les désigne par leur id,
   aucun index ne bouge) ; qui l'avait acheté est remboursé au prix payé au chargement et l'id sort de shop.own (voir LES CAISSES RETIRÉES dans SAVE) ;
   qui la portait repart avec celle d'origine. `n` = le nom que dit le message de remboursement. (2026-10-18 soir, Sacha : « supprime block rain »)
   PLUIE DE BLOCS aussi. Leurs émetteurs TRX_EMET (bulles, blocs) restent, sans traînée qui les appelle. (2026-10-18 soir, Sacha : « 88 mph enlève »)
   88 MILES À L'HEURE aussi (140 000 $, épique) : sa ligne et son pictogramme tr_88 sortent ; son émetteur TRX_EMET.retour reste. */
const HAB_RETIRES={'peinture:or':{p:0},/* (2026-11-01, Léo : « enlève or massif ») la mission des 2 M$ paie de l'argent à la place (missions/table.js) */ 'peinture:menthe':{p:0},/* (2026-11-01, Léo : « enlever menthe glacée, garder aurore boréale, la renommer menthe glacée ») la menthe d'origine sort ; AURORE BORÉALE (srAurore) prend son nom */ 'peinture:citron':{p:0},'peinture:argent':{p:0},'peinture:bordeaux':{p:0},'peinture:olive':{p:0},'peinture:abysse':{p:0},'peinture:aubergine':{p:0},'peinture:damier':{p:0},'peinture:ecailles':{p:0},/* (2026-10-22, Sacha : « tableau des peintures » : huit peintures en moins — citron, argent, bordeaux, olive, abysse, aubergine, damier, peau de dragon) */ 'peinture:herisson':{p:7000,n:'LA PEINTURE BLEU HÉRISSON'},'peinture:graphite':{p:0},'peinture:petrole':{p:0},'peinture:anglais':{p:0},'peinture:framboise':{p:0},'peinture:bronze':{p:0},'peinture:ecume':{p:0},'peinture:barbapapa':{p:0},'trainee:menthe':{p:2000,n:'LA TRAÎNÉE MENTHE'},'trainee:blocs':{p:30000,n:'LA TRAÎNÉE PLUIE DE BLOCS'},'trainee:retour':{p:140000,n:'LA TRAÎNÉE 88 MILES À L\'HEURE'}};
Object.assign(I18N,{"LA TRAÎNÉE 88 MILES À L'HEURE":"THE 88 MPH TRAIL","LA PEINTURE BLEU HÉRISSON":"THE HEDGEHOG BLUE PAINT"}); /* le message de remboursement, en anglais */
/* (2026-10-18 soir, Sacha : « la trainé rainbow doit etre incluse avec le pack nian cat ») LE PACK DU CHAT : l'ARC-EN-CIEL (`pack:'chat'`, voir LES
   MISSIONS v2 — LES HABILLAGES QUI SE GAGNENT) est à toi avec le CHAT POP-TART (shopOwned → m2Chat). La boutique le DIT enfin : sa carte affichait
   « MISSION » (et l'inventaire le prix de la PALETTE) ; elle affiche « PACK CHAT », son bouton AVEC LE CHAT mène à l'offre du chat (rayon ACHAT),
   et la carte du chat porte « + ARC-EN-CIEL » tant qu'on ne l'a pas. chatPackI = la place du chat dans CARS (-1 s'il n'y est plus). */
function chatPackI(){for(let i=0;i<CARS.length;i++)if(CARS[i]&&CARS[i].shape==='poptart'&&!CARS[i].retire)return i;return -1;}
/* ===== LE NUANCIER v3 (2026-11-05, Sacha : « mets-toi dans la peau d'un game designer et refais correctement le système de peinture […] les communes,
   c'est les couleurs unies ; les rares, les dégradés ; les épiques, des motifs avec des stickers ; les légendaires, comme les épiques mais ils BOUGENT —
   des animations, des écrans, comme dans Apex ; GALAXIE en légendaire, comme si on voyait à travers ; communes 1 €, rares 1 €, épiques 2 €,
   légendaires 3 € ; certaines se débloquent avec des missions ») =====
   UNE TABLE, UNE RÈGLE, UN PRIX — `PEINT_CAT`, écrite dans l'ORDRE DE LA VITRINE (boutique, inventaire, bande du garage la lisent telle quelle) :
   · COMMUNE    = une couleur UNIE (laque, mat) ..... 1 € — treize vives qui font le tour du cercle chromatique, puis quatre pastels ;
   · RARE       = un DÉGRADÉ (les métaux et les nacres y sont : ils changent de teinte avec la lumière) ..... 1 € — rangés par famille :
                  le feu, le froid, le néon, le métal, l'ombre, la pop ;
   · ÉPIQUE     = un MOTIF, une toile peinte (MOTIFS) ..... 2 € — les livrées « stickers » d'abord (sticker bomb, flammes, carbone, graffiti,
                  pop art, vague, dollars), puis les pelages ;
   · LÉGENDAIRE = un motif ANIMÉ, calculé par la carte graphique à chaque image (MOT_ANIM) ..... 3 €.
   « OU GAGNE-LA » : plus d'une peinture sur deux (36 sur 64) a aussi un DÉFI (`def`) : elle s'achète tout de suite, OU se gagne en jouant (peintDefisVerifie, secDonne).
   Plus de secrètes masquées « ? ? ? » : on voit ce qu'on veut et comment l'avoir — la jauge du défi est sur la carte et sous le nom.
   `def.k` = ce qu'on mesure : 'sc:<compteur>' (les compteurs à vie de missions/defis-moteur.js : m2Cpt) · gagne · jours · kmh · frenT · tours · fig ·
   parf · eng · aura · prof · 'b' un exploit d'un coup, sans jauge (donné par secGagne) · 'serie' le 7e jour de la série (missions/aujourdhui.js) ;
   `def.v` le seuil ; `def.u` l'unité affichée ; `def.t` la phrase.
   LES FUSIONS (`PEINT_FUSION`) : quatre teintes qui doublonnaient leur voisine sortent ; qui les avait reçoit la voisine (SAVE.load, avant HAB_RETIRES).
   ⚠ Un id = 2 à 12 LETTRES (la sauvegarde filtre /^[a-zA-Z]{2,12}$/) et ne se renomme jamais. `?peintures=avant` n'existe plus. */
const PALETTE_ON=true;
const PEINT_FUSION={ogre:'billet',vanille:'taxi',abricot:'emeute',amande:'pistache'};
const PEINT_SERIE={k:'serie',t:"Le 7e jour d'une série de 7 jours."};
const PEINT_CAT=[ /* [id, nom, rareté, aspect, description, défi] */
  /* — COMMUNES : les unies, le tour du cercle chromatique — */
  ['bolide','ROUGE BOLIDE','commun',{c:0xe3242b},"Le rouge des grandes marques. Sans le cheval, avec l'arrogance.",{k:'sc:cerise',v:50,t:'Croque 50 cerises.'}],
  ['emeute','ORANGE ÉMEUTE','commun',{c:0xff6b14},"Visible depuis l'espace. C'est le but.",{k:'sc:orange',v:50,t:'Croque 50 oranges.'}],
  ['taxi','JAUNE TAXI','commun',{c:0xffc61a},"Tout le monde te fait signe. Tu ne t'arrêtes pas.",{k:'sc:citron',v:50,t:'Ramasse 50 citrons.'}],
  ['billet','VERT BILLET','commun',{c:0x1c9a4c},'La couleur préférée de ton banquier.',{k:'gagne',v:100000,t:'Gagne 100 000 $ au total.'}],
  ['lagon','LAGON','commun',{c:0x109a94},"L'eau des îles où tu dépenses tes primes."],
  ['azur','AZUR','commun',{c:0x2b8cff},'Le ciel sans un nuage. Le tien.',{k:'sc:myrtille',v:50,t:'Croque 50 myrtilles.'}],
  ['minuit','BLEU MINUIT','commun',{c:0x2b43c4},'Le bleu des néons de la ville, à trois heures du matin.',{k:'sc:nuit',v:10,t:'Joue 10 niveaux de nuit.'}],
  ['royal','VIOLET ROYAL','commun',{c:0x7a3cf0},'La couleur des rois. Et de ceux qui roulent comme eux.',{k:'sc:raisin',v:50,t:'Ramasse 50 raisins.'}],
  ['fuchsia','FUCHSIA','commun',{c:0xe61e78},'Trop voyant ? Juste assez.',{k:'sc:dragon',v:50,t:'Ramasse 50 fruits du dragon.'}],
  ['poupee','ROSE POUPÉE','commun',{c:0xff5fb0},"Rose bonbon, laque parfaite. Tu n'es pas en plastique, tu es en carbone."],
  ['neige','BLANC NEIGE','commun',{c:0xf3f5f7},'Propre comme un compte en Suisse.',{k:'sc:glacier',v:10,t:'Joue 10 niveaux sur le glacier.'}],
  ['nardo','GRIS NARDO','commun',{c:0x74777b},'Le gris des supercars allemandes : presque du béton. Il ne dit rien, il se fait respecter.'],
  ['noir','NOIR MAT','commun',{c:0x202128,g:'s'},'Pas un reflet. Même la police hésite.'],
  ['dragee','ROSE DRAGÉE','commun',{c:0xffb6bd},'Le rose des baptêmes. Tu roules quand même à 300.',{k:'sc:matin',v:10,t:'Joue 10 niveaux le matin.'}],
  ['lilas','LILAS','commun',{c:0xd3c2ff},'Une fleur de printemps qui double par la droite.'],
  ['piscine','BLEU PISCINE','commun',{c:0xa9d6ff},"Le bleu d'une piscine de palace. Plongeoir compris.",{k:'sc:midi',v:10,t:'Joue 10 niveaux en plein jour.'}],
  ['pistache','PISTACHE','commun',{c:0xd6f2a0},'Le vert des glaciers italiens. Les pneus, eux, sont chauds.'],
  /* — RARES : les dégradés. Le feu… — */
  ['lave','LAVE','rare',{grad:[0x1a0500,0xd8340a,0xffb21a]},"Du volcan au toit, la coulée ne refroidit jamais. N'y jette pas d'anneau."],
  ['srBraise','BRAISE FIDÈLE','rare',{grad:[0xb3141c,0xff5a1c,0xffc23a],g:'o'},"Sept jours d'affilée sur l'asphalte : la laque en garde la chaleur.",PEINT_SERIE],
  ['couchant','COUCHER DE SOLEIL','rare',{grad:[0xffc23a,0xff4f8b,0x6b3cff]},'Du miel en bas, du violet en haut : le ciel de 19 h, en laque.'],
  ['envers',"MONDE À L'ENVERS",'rare',{grad:[0x150709,0x6e0f16,0xe0262f]},"Noir en bas, rouge sang en haut : cette caisse vient de l'autre côté.",{k:'sc:envers',v:100,u:'km',t:'Roule 100 km sous la route.'}],
  /* … le froid… */
  ['srLagon','LAGON INTERDIT','rare',{grad:[0x01404f,0x00b3c7,0x9ff7ff],g:'g'},"Une eau que personne n'a le droit de voir. Toi si.",PEINT_SERIE],
  ['eclair','ÉCLAIR','rare',{grad:[0x1a2a8a,0x3a7bff,0xe8f4ff],g:'c'},'Du bleu nuit au blanc électrique : la foudre qui monte.',{k:'kmh',v:1500,u:'kmh',t:'Dépasse 1 500 km/h.'}],
  ['srAurore','AURORE BORÉALE','rare',{grad:[0x3cffc0,0x6fb8ff,0xc77dff],g:'c'},'Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.',PEINT_SERIE],
  ['jadeimperial','JADE IMPÉRIAL','rare',{grad:[0x08382a,0x1a9c6c,0xa6f0cc],g:'n'},'La pierre des empereurs, taillée sur le plus long chemin.',{k:'b',t:'Roule 8 km sur les pics de jade en une partie.'}],
  /* … le néon… */
  ['vaporwave','VAPORWAVE','rare',{grad:[0x2bd9e8,0xff5ec8,0x7a2bff]},'Cyan, rose, violet : un coucher de soleil de 1986 sur une cassette usée.'],
  ['srEtoile','NUIT ÉTOILÉE','rare',{grad:[0x2a1f8f,0x8f5bff,0xff7ad9],g:'c'},'La nuit entière sur ta carrosserie, une semaine de plus.',PEINT_SERIE],
  ['prisme','PRISME','rare',{grad:[0xff4a3a,0xffd23a,0x3a8cff],g:'c'},'La lumière se casse en trois sur ta carrosserie.',{k:'fig',v:6,t:'Enchaîne 6 figures dans un seul saut.'}],
  ['cameleon','CAMÉLÉON','rare',{grad:[0x0e6a48,0x1d5ed0,0x8a2bd0],g:'c'},'Vert, bleu, violet : elle change de peau à chaque monde.',{k:'b',t:'Traverse 4 maps dans la même partie.'}],
  /* … le métal et la nacre… */
  ['chrome','CHROME MIROIR','rare',{grad:[0x4e5866,0xc4ccd8,0x7d8a9c],g:'c'},'Tu te vois dedans. Les autres aussi.',{k:'sc:nuages',v:5,t:'Joue 5 niveaux dans les nuages.'}],
  ['orrose','OR ROSE','rare',{grad:[0xc9786a,0xf0a890,0xffe0d2],g:'o'},"L'or des montres dont personne ne regarde l'heure.",{k:'b',t:'Pose-toi en DIVIN à plus de 900 km/h.'}],
  ['guerrier','SUPER GUERRIER','rare',{grad:[0xff8a00,0xffd23a,0xfff4a8],g:'o'},'Doré du toit aux pneus. Les cheveux se dressent, le niveau dépasse les 9 000.',{k:'eng',v:24,t:'Atteins le palier 24 du moteur.'}],
  ['cuivre','CUIVRE','rare',{grad:[0x2e1205,0x6a2e10,0xc0682e],g:'k'},'Le métal des vieux tuyaux. Passé au polish.'],
  ['holo','HOLOGRAMME','rare',{grad:[0x9ff2ff,0xf3b4ff,0xfff3ae],g:'c'},'Chrome irisé qui change de couleur à chaque angle. Une carte rare… en voiture.'],
  ['nacre','NACRE','rare',{grad:[0xe6dcef,0xfbf8f2,0xdcefff],g:'n'},"L'intérieur d'un coquillage, poli par cinq vagues parfaites.",{k:'parf',v:5,t:"Fais 5 poses parfaites d'affilée."}],
  ['fantome','FANTÔME','rare',{grad:[0xc9d3e4,0xf2f6fc,0xffffff],g:'n'},"Blanc nacré, presque transparent. Personne ne t'a vu passer.",{k:'b',t:'Roule 2 minutes sans toucher un bord.'}],
  /* … l'ombre… */
  ['gotham','NUIT DE GOTHAM','rare',{grad:[0x05060a,0x161b2b,0x3c4a72],g:'g'},'Noir laqué, la ville qui brille dedans. Les toits sont à toi.',{k:'sc:ville',v:10,t:'Joue 10 niveaux dans la ville.'}],
  ['orage',"CIEL D'ORAGE",'rare',{grad:[0x11151e,0x2e3646,0xaab1c4],g:'k'},'Ardoise en bas, éclair en haut. Le ciel quand il se fâche.',{k:'sc:pluie',v:10,t:'Joue 10 niveaux sous la pluie.'}],
  ['lunaire','LUNAIRE','rare',{grad:[0x2a2c34,0x9a9da6,0xf2f2f6],g:'s'},"Poussière de cratère, sans un grain d'atmosphère.",{k:'sc:espace',v:10,t:'Joue 10 niveaux en orbite.'}],
  ['lampadaire','LAMPADAIRE','rare',{grad:[0x101422,0x2a3a6a,0xffc85a],g:'g'},"La nuit en bas, le réverbère sur le toit. La ville t'éclaire.",{k:'b',t:'Fais 25 figures dans la ville en une partie.'}],
  /* … la pop */
  ['banana','BANANA','rare',{grad:[0x2a5cb8,0xffd21f,0xffe45c]},'Salopette en bas, jaune en haut. Elle dit « banana » à chaque virage.'],
  ['sorbet','SORBET','rare',{grad:[0xffb38a,0xff8fc0,0xb9a6ff]},"Pêche, framboise, violette : trois boules qui ne fondent pas à 900 à l'heure."],
  ['toxique','TOXIQUE','rare',{grad:[0x0b1405,0x2fbf14,0xeaff3a]},'Du noir au vert fluo. Ne touche pas : ça brille dans le noir.'],
  /* — ÉPIQUES : les motifs. Les livrées « stickers »… — */
  ['stickers','STICKER BOMB','epique',{mot:'stickers'},'Des dizaines d\'autocollants, pas un centimètre de libre. La caisse des vrais collectionneurs.'],
  ['flammes','FLAMMES','epique',{mot:'flammes'},"Des flammes de hot rod au liseré bleu. Elle va vite même à l'arrêt.",{k:'frenT',v:20,u:'s',t:'Tiens la frénésie 20 secondes.'}],
  ['carbone','CARBONE','epique',{mot:'carbone'},'Fibre tressée sous un vernis épais. Plus léger, plus rapide, plus cher.',{k:'aura',v:20000,t:"Atteins 20 000 d'aura en une partie."}],
  ['graffiti','GRAFFITI','epique',{mot:'graffiti'},'Le mur du parking, bombé sur ta carrosserie. Signé, daté, illégal.',{k:'tours',v:5,t:'Frôle 5 tours dans un seul saut.'}],
  ['popart','POP ART','epique',{mot:'popart'},"Trames, bulles et BOOM ! Ta caisse sort tout droit d'une BD."],
  ['vagues','GRANDE VAGUE','epique',{mot:'vagues'},'Les vagues des estampes japonaises, en écailles. Le calme avant ta nitro.',{k:'prof',v:'prof',t:'Descends au fond de la mer de Jade.'}],
  ['cash','PLEIN AUX AS','epique',{mot:'cash'},"Des dollars d'or sur fond vert billet. Discret ? Non.",{k:'gagne',v:1000000,t:'Gagne 1 000 000 $ au total.'}],
  /* … les pelages et la nature */
  ['tigre','TIGRE','epique',{mot:'tigre'},'Orange brûlé, rayures noires. Le roi de la jungle a troqué ses griffes contre des pneus.'],
  ['leopard','LÉOPARD','epique',{mot:'leopard'},'Des rosettes noires sur fond doré. Tu ne chasses pas : tu doubles.'],
  ['zebre','ZÈBRE','epique',{mot:'zebre'},'Noir sur blanc ou blanc sur noir ? Personne ne sait. Toi, tu fonces.'],
  ['vache','VACHE','epique',{mot:'vache'},'Des taches noires sur fond blanc. Meuh, à 300 à l\'heure.'],
  ['coccinelle','COCCINELLE','epique',{mot:'coccinelle'},'Rouge vif, pois noirs. Porte-bonheur, et en plus elle va vite.'],
  ['fleurs','FLOWER POWER','epique',{mot:'fleurs'},'Des marguerites sur fond rose. Peace, love et nitro.'],
  ['camo','CAMOUFLAGE','epique',{mot:'camo'},'Kaki, brun, vert sapin. Invisible en forêt. À 900 à l\'heure, un peu moins.',{k:'sc:foret',v:10,t:'Joue 10 niveaux dans la forêt.'}],
  ['mousse','MOUSSE','epique',{mot:'mousse'},'Un coussin de vraie mousse sur toute la carrosserie. Douce, vivante, avec ses petits champignons.'],
  /* — LÉGENDAIRES : les animées (MOT_ANIM) — */
  ['galaxie','GALAXIE','legendaire',{mot:'galaxie'},"Ce n'est pas une peinture, c'est une fenêtre : derrière la tôle, une galaxie entière. Tourne autour, elle a de la profondeur.",{k:'jours',v:30,t:'Joue 30 jours différents.'}],
  ['neon','NÉON TOKYO','legendaire',{mot:'neon'},'Des tubes de néon qui courent du capot au becquet. Shibuya, trois heures du matin.'],
  ['sakura','SAKURA.EXE','legendaire',{mot:'sakura'},"Des fleurs de cerisier en pixels tombent sur un écran noir. Parfois l'écran bugue. C'est voulu."],
  ['magma','MAGMA','legendaire',{mot:'magma'},'La roche se fend, la lave coule dans les fissures et respire. Elle ne refroidit jamais.'],
  ['ocean','ABYSSES','legendaire',{mot:'ocean'},"La lumière qui danse au fond d'un lagon, sur toute la carrosserie."],
  ['rgb','RGB','legendaire',{mot:'rgb'},'Toutes les couleurs, en boucle, comme un clavier de gamer. Elle ne choisit pas : elle prend tout.']];
const PALETTE_PACK={id:'palette',produit:'cashcar.palette40',eur:'0,99 €',n:'LA PALETTE',ids:PEINT_CAT.filter(function(e){return e[2]==="commun"||e[2]==="rare";}).map(function(e){return e[0];})}; /* l'ancien pack (plus vendu) : palDonne le rend encore à qui restaure ses achats */
Object.assign(I18N,{"LA PALETTE":"THE PALETTE","COULEUR":"COLOUR","PEINTURE":"PAINT","PEINTURE GAGNÉE":"PAINT EARNED","OU GAGNE-LA":"OR EARN IT","DÉFI":"CHALLENGE",
  "UNIES":"SOLID","DÉGRADÉS":"GRADIENTS","MOTIFS":"PATTERNS","ANIMÉES":"ANIMATED","L'achat est indisponible pour le moment.":"Buying is unavailable right now.",
  "ROUGE BOLIDE":"RACING RED","Le rouge des grandes marques. Sans le cheval, avec l'arrogance.":"The red of the big brands. Without the horse, with the arrogance.","Croque 50 cerises.":"Eat 50 cherries.",
  "ORANGE ÉMEUTE":"RIOT ORANGE","Visible depuis l'espace. C'est le but.":"Visible from space. That's the point.","Croque 50 oranges.":"Eat 50 oranges.",
  "JAUNE TAXI":"TAXI YELLOW","Tout le monde te fait signe. Tu ne t'arrêtes pas.":"Everyone waves at you. You don't stop.","Ramasse 50 citrons.":"Pick up 50 lemons.",
  "VERT BILLET":"CASH GREEN","La couleur préférée de ton banquier.":"Your banker's favourite colour.","Gagne 100 000 $ au total.":"Earn $100,000 in total.",
  "LAGON":"LAGOON","L'eau des îles où tu dépenses tes primes.":"The water of the islands where you spend your bonuses.",
  "AZUR":"AZURE","Le ciel sans un nuage. Le tien.":"A sky without a single cloud. Yours.","Croque 50 myrtilles.":"Eat 50 blueberries.",
  "BLEU MINUIT":"MIDNIGHT BLUE","Le bleu des néons de la ville, à trois heures du matin.":"The blue of city neons at three in the morning.","Joue 10 niveaux de nuit.":"Play 10 levels at night.",
  "VIOLET ROYAL":"ROYAL PURPLE","La couleur des rois. Et de ceux qui roulent comme eux.":"The colour of kings. And of those who drive like them.","Ramasse 50 raisins.":"Pick up 50 grapes.",
  "FUCHSIA":"FUCHSIA","Trop voyant ? Juste assez.":"Too loud? Exactly loud enough.","Ramasse 50 fruits du dragon.":"Pick up 50 dragon fruits.",
  "ROSE POUPÉE":"DOLL PINK","Rose bonbon, laque parfaite. Tu n'es pas en plastique, tu es en carbone.":"Candy pink, perfect gloss. You're not plastic, you're carbon.",
  "BLANC NEIGE":"SNOW WHITE","Propre comme un compte en Suisse.":"Clean as a Swiss bank account.","Joue 10 niveaux sur le glacier.":"Play 10 levels on the glacier.",
  "GRIS NARDO":"NARDO GREY","Le gris des supercars allemandes : presque du béton. Il ne dit rien, il se fait respecter.":"The grey of German supercars: almost concrete. It says nothing and commands respect.",
  "NOIR MAT":"MATTE BLACK","Pas un reflet. Même la police hésite.":"Not a single reflection. Even the police hesitate.",
  "ROSE DRAGÉE":"SUGAR PINK","Le rose des baptêmes. Tu roules quand même à 300.":"Christening pink. You're still doing 300.","Joue 10 niveaux le matin.":"Play 10 levels in the morning.",
  "LILAS":"LILAC","Une fleur de printemps qui double par la droite.":"A spring flower that overtakes on the right.",
  "BLEU PISCINE":"POOL BLUE","Le bleu d'une piscine de palace. Plongeoir compris.":"Five-star hotel pool blue. Diving board included.","Joue 10 niveaux en plein jour.":"Play 10 levels in broad daylight.",
  "PISTACHE":"PISTACHIO","Le vert des glaciers italiens. Les pneus, eux, sont chauds.":"Italian gelato green. The tyres, though, are hot.",
  "LAVE":"LAVA","Du volcan au toit, la coulée ne refroidit jamais. N'y jette pas d'anneau.":"From the volcano to the roof, the flow never cools. Don't throw a ring in.",
  "BRAISE FIDÈLE":"LOYAL EMBER","Sept jours d'affilée sur l'asphalte : la laque en garde la chaleur.":"Seven days in a row on the asphalt: the paint keeps the heat.","Le 7e jour d'une série de 7 jours.":"Day 7 of a 7-day streak.",
  "COUCHER DE SOLEIL":"SUNSET","Du miel en bas, du violet en haut : le ciel de 19 h, en laque.":"Honey below, violet above: the 7 pm sky, in gloss.",
  "MONDE À L'ENVERS":"UPSIDE DOWN","Noir en bas, rouge sang en haut : cette caisse vient de l'autre côté.":"Black below, blood red above: this car came from the other side.","Roule 100 km sous la route.":"Drive 100 km on the underside of the road.",
  "LAGON INTERDIT":"FORBIDDEN LAGOON","Une eau que personne n'a le droit de voir. Toi si.":"Water nobody is allowed to see. Except you.",
  "ÉCLAIR":"LIGHTNING","Du bleu nuit au blanc électrique : la foudre qui monte.":"From night blue to electric white: lightning on the rise.","Dépasse 1 500 km/h.":"Go past 1,500 km/h.",
  "AURORE BORÉALE":"NORTHERN LIGHTS","Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.":"The far-north sky, for those who come back every day.",
  "JADE IMPÉRIAL":"IMPERIAL JADE","La pierre des empereurs, taillée sur le plus long chemin.":"The emperors' stone, cut on the longest road.","Roule 8 km sur les pics de jade en une partie.":"Drive 8 km on the jade peaks in one run.",
  "VAPORWAVE":"VAPORWAVE","Cyan, rose, violet : un coucher de soleil de 1986 sur une cassette usée.":"Cyan, pink, violet: a 1986 sunset on a worn-out tape.",
  "NUIT ÉTOILÉE":"STARRY NIGHT","La nuit entière sur ta carrosserie, une semaine de plus.":"The whole night on your bodywork, one more week.",
  "PRISME":"PRISM","La lumière se casse en trois sur ta carrosserie.":"Light splits in three on your bodywork.","Enchaîne 6 figures dans un seul saut.":"Chain 6 tricks in a single jump.",
  "CAMÉLÉON":"CHAMELEON","Vert, bleu, violet : elle change de peau à chaque monde.":"Green, blue, purple: it changes skin in every world.","Traverse 4 maps dans la même partie.":"Cross 4 maps in the same run.",
  "CHROME MIROIR":"MIRROR CHROME","Tu te vois dedans. Les autres aussi.":"You can see yourself in it. So can everyone else.","Joue 5 niveaux dans les nuages.":"Play 5 levels in the clouds.",
  "OR ROSE":"ROSE GOLD","L'or des montres dont personne ne regarde l'heure.":"The gold of watches nobody checks the time on.","Pose-toi en DIVIN à plus de 900 km/h.":"Land a DIVINE at over 900 km/h.",
  "SUPER GUERRIER":"SUPER WARRIOR","Doré du toit aux pneus. Les cheveux se dressent, le niveau dépasse les 9 000.":"Gold from roof to tyres. Hair stands up, the power level is over 9,000.","Atteins le palier 24 du moteur.":"Reach engine tier 24.",
  "CUIVRE":"COPPER","Le métal des vieux tuyaux. Passé au polish.":"Old-pipe metal. Freshly polished.",
  "HOLOGRAMME":"HOLOGRAM","Chrome irisé qui change de couleur à chaque angle. Une carte rare… en voiture.":"Iridescent chrome that changes colour at every angle. A rare card… on wheels.",
  "NACRE":"PEARL","L'intérieur d'un coquillage, poli par cinq vagues parfaites.":"The inside of a shell, polished by five perfect waves.","Fais 5 poses parfaites d'affilée.":"Land 5 perfects in a row.",
  "FANTÔME":"GHOST","Blanc nacré, presque transparent. Personne ne t'a vu passer.":"Pearl white, almost see-through. Nobody saw you pass.","Roule 2 minutes sans toucher un bord.":"Drive 2 minutes without touching an edge.",
  "NUIT DE GOTHAM":"GOTHAM NIGHT","Noir laqué, la ville qui brille dedans. Les toits sont à toi.":"Gloss black, the city shining in it. The rooftops are yours.","Joue 10 niveaux dans la ville.":"Play 10 levels in the city.",
  "CIEL D'ORAGE":"STORM SKY","Ardoise en bas, éclair en haut. Le ciel quand il se fâche.":"Slate below, lightning above. The sky when it's angry.","Joue 10 niveaux sous la pluie.":"Play 10 levels in the rain.",
  "LUNAIRE":"LUNAR","Poussière de cratère, sans un grain d'atmosphère.":"Crater dust, without a grain of atmosphere.","Joue 10 niveaux en orbite.":"Play 10 levels in orbit.",
  "LAMPADAIRE":"STREETLIGHT","La nuit en bas, le réverbère sur le toit. La ville t'éclaire.":"Night below, the lamp on the roof. The city lights you up.","Fais 25 figures dans la ville en une partie.":"Land 25 tricks in the city in one run.",
  "BANANA":"BANANA","Salopette en bas, jaune en haut. Elle dit « banana » à chaque virage.":"Overalls below, yellow above. It says \"banana\" at every turn.",
  "SORBET":"SORBET","Pêche, framboise, violette : trois boules qui ne fondent pas à 900 à l'heure.":"Peach, raspberry, violet: three scoops that won't melt at 900 km/h.",
  "TOXIQUE":"TOXIC","Du noir au vert fluo. Ne touche pas : ça brille dans le noir.":"Black to neon green. Don't touch: it glows in the dark.",
  "STICKER BOMB":"STICKER BOMB","Des dizaines d'autocollants, pas un centimètre de libre. La caisse des vrais collectionneurs.":"Dozens of stickers, not an inch to spare. The collector's car.",
  "FLAMMES":"FLAMES","Des flammes de hot rod au liseré bleu. Elle va vite même à l'arrêt.":"Hot-rod flames with a blue pinstripe. It looks fast even standing still.","Tiens la frénésie 20 secondes.":"Hold frenzy for 20 seconds.",
  "CARBONE":"CARBON","Fibre tressée sous un vernis épais. Plus léger, plus rapide, plus cher.":"Woven fibre under thick clear coat. Lighter, faster, pricier.","Atteins 20 000 d'aura en une partie.":"Reach 20,000 aura in one run.",
  "GRAFFITI":"GRAFFITI","Le mur du parking, bombé sur ta carrosserie. Signé, daté, illégal.":"The car-park wall, sprayed on your bodywork. Signed, dated, illegal.","Frôle 5 tours dans un seul saut.":"Skim 5 towers in a single jump.",
  "POP ART":"POP ART","Trames, bulles et BOOM ! Ta caisse sort tout droit d'une BD.":"Halftones, bubbles and BOOM! Your car jumped straight out of a comic.",
  "GRANDE VAGUE":"GREAT WAVE","Les vagues des estampes japonaises, en écailles. Le calme avant ta nitro.":"The waves of Japanese prints, in scales. The calm before your nitro.","Descends au fond de la mer de Jade.":"Dive to the bottom of the Jade Sea.",
  "PLEIN AUX AS":"LOADED","Des dollars d'or sur fond vert billet. Discret ? Non.":"Gold dollars on cash green. Subtle? No.","Gagne 1 000 000 $ au total.":"Earn $1,000,000 in total.",
  "TIGRE":"TIGER","Orange brûlé, rayures noires. Le roi de la jungle a troqué ses griffes contre des pneus.":"Burnt orange, black stripes. The king of the jungle traded his claws for tyres.",
  "LÉOPARD":"LEOPARD","Des rosettes noires sur fond doré. Tu ne chasses pas : tu doubles.":"Black rosettes on gold. You don't hunt: you overtake.",
  "ZÈBRE":"ZEBRA","Noir sur blanc ou blanc sur noir ? Personne ne sait. Toi, tu fonces.":"Black on white or white on black? Nobody knows. You just floor it.",
  "VACHE":"COW","Des taches noires sur fond blanc. Meuh, à 300 à l'heure.":"Black patches on white. Moo, at 300 km/h.",
  "COCCINELLE":"LADYBUG","Rouge vif, pois noirs. Porte-bonheur, et en plus elle va vite.":"Bright red, black dots. A lucky charm, and fast too.",
  "FLOWER POWER":"FLOWER POWER","Des marguerites sur fond rose. Peace, love et nitro.":"Daisies on pink. Peace, love and nitro.",
  "CAMOUFLAGE":"CAMO","Kaki, brun, vert sapin. Invisible en forêt. À 900 à l'heure, un peu moins.":"Khaki, brown, pine green. Invisible in the woods. At 900 km/h, a bit less.","Joue 10 niveaux dans la forêt.":"Play 10 levels in the forest.",
  "MOUSSE":"MOSS","Un coussin de vraie mousse sur toute la carrosserie. Douce, vivante, avec ses petits champignons.":"A cushion of real moss all over the body. Soft, alive, with its tiny mushrooms.",
  "GALAXIE":"GALAXY","Ce n'est pas une peinture, c'est une fenêtre : derrière la tôle, une galaxie entière. Tourne autour, elle a de la profondeur.":"It's not paint, it's a window: behind the panels, an entire galaxy. Walk around it, it has depth.","Joue 30 jours différents.":"Play on 30 different days.",
  "NÉON TOKYO":"NEON TOKYO","Des tubes de néon qui courent du capot au becquet. Shibuya, trois heures du matin.":"Neon tubes racing from bonnet to spoiler. Shibuya, three in the morning.",
  "SAKURA.EXE":"SAKURA.EXE","Des fleurs de cerisier en pixels tombent sur un écran noir. Parfois l'écran bugue. C'est voulu.":"Pixel cherry blossoms fall across a black screen. Sometimes the screen glitches. On purpose.",
  "MAGMA":"MAGMA","La roche se fend, la lave coule dans les fissures et respire. Elle ne refroidit jamais.":"The rock cracks, lava flows through the fissures and breathes. It never cools.",
  "ABYSSES":"ABYSS","La lumière qui danse au fond d'un lagon, sur toute la carrosserie.":"The light dancing at the bottom of a lagoon, all over your bodywork.",
  "RGB":"RGB","Toutes les couleurs, en boucle, comme un clavier de gamer. Elle ne choisit pas : elle prend tout.":"Every colour, on loop, like a gaming keyboard. It doesn't choose: it takes them all."});
/* LES PRIX EN EUROS ET LES MOTIFS (2026-11-05, le nuancier v3 — voir PEINT_CAT) : le prix suit la RARETÉ, une seule grille (`PEINT_EUR`), par la même
   porte que les caisses en € : `shopPaye('peinture:'+id)` (produit App Store : `cashcar.peinture.<id>`), puis `habDonne`. Tant que StoreKit n'est pas
   branché, ACHETER le DIT (« L'achat est indisponible pour le moment. ») et ne donne rien (`habPaye`). Les peintures déjà à toi le restent.
   LES MOTIFS (`MOTIFS`) : chaque épique est une toile de 512 px qui se raccorde sur ses quatre bords (`motTore`), dessinée une fois (`motTex`),
   posée sur la tôle en PROJECTION TRIPLANAIRE dans le repère de la caisse (`motGreffe`/`MOT_GLSL` : côtés, toit, nez, poupe, chacun à l'endroit).
   Le kit coule la tôle peinte dans son propre tampon (`pm:<id>`, voir peintPal) : les accents gardent leur couleur ; un gabarit hors kit greffe sa
   matière de carrosserie (bodyM). `s` = répétitions par mètre ; `c` = la teinte de fond (les outils de l'atelier, les replis). Une légendaire (`anim`)
   n'a pas de toile sur la tôle : son programme (MOT_ANIM) la calcule à chaque image ; sa toile ne sert qu'aux pastilles des listes (`motFond`),
   qu'une animation CSS fait vivre (`.pL`, voir css/peintures.css). Essayer : `dbgHab('peinture','galaxie')`. */
const PEINT_V2=true;
const PEINT_EUR={commun:'1 €',rare:'1 €',epique:'2 €',legendaire:'3 €'};
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
  mousse:{s:.4,c:0x3f6a28,mel:1,touffes:1,f:function(x,R){x.fillStyle='#ffffff';x.fillRect(0,0,MOT_W,MOT_W); /* (2026-11-01, Léo : « de la vraie mousse, plus 3D, un truc qui s'ajoute sur la voiture, qui se mélange avec une couleur ») des PLAQUES de mousse sur fond BLANC pur : le blanc laisse voir la couleur de la caisse (`mel`, voir motGreffe) ; les touffes en relief se posent sur les mêmes plaques (`touffes`, voir motTouffes) */
    const C=[['hsl(104,38%,17%)',1],['hsl(100,40%,26%)',.8],['hsl(94,43%,36%)',.55],['hsl(86,48%,47%)',.3]]; /* du creux sombre à la pointe claire */
    const plaque=function(cx,cy,r){for(let k=0;k<C.length;k++){const q=C[k],rr=r*q[1],dx=-k*r*.07,dy=-k*r*.09;motPose(x,cx+dx,cy+dy,rr,motForme(R,.3),q[0],.8+R()*.4);}};
    const G=motGrille(4,R,.9),pl=[];for(const p of G)if(R()<.72){const r=34+R()*34;plaque(p[0],p[1],r);pl.push([p[0],p[1],r]);}
    for(const q of pl)for(let i=0;i<3;i++){const a=R()*6.28,d=q[2]*(.55+R()*.5);plaque(q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d,10+R()*13);} /* des rejets autour des plaques */
    for(const q of pl)for(let i=0;i<90;i++){const a=R()*6.28,d=q[2]*Math.sqrt(R())*.85,cx=q[0]+Math.cos(a)*d,cy=q[1]+Math.sin(a)*d,r=.8+R()*1.2;motTore(x,function(){x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle='hsla('+(78+((R()*26)|0))+',46%,'+(40+((R()*22)|0))+'%,'+(.35+R()*.4).toFixed(2)+')';x.fill();});} /* le velours */
    for(const q of pl){if(R()<.5)continue;const a=R()*6.28,cx=q[0]+Math.cos(a)*q[2]*.7,cy=q[1]+Math.sin(a)*q[2]*.7,r=5+R()*3;motTore(x,function(){x.beginPath();x.arc(cx,cy+1.5,r,0,6.2832);x.fillStyle='rgba(10,30,10,.4)';x.fill();x.beginPath();x.arc(cx,cy,r,Math.PI,0);x.closePath();x.fillStyle='#d8322b';x.fill();x.fillStyle='#f6ecd8';x.fillRect(cx-r*.28,cy,r*.56,r*.7);for(const w of [[-.5,-.4],[.1,-.65],[.5,-.25]]){x.beginPath();x.arc(cx+w[0]*r,cy+w[1]*r,r*.16,0,6.2832);x.fillStyle='#fffcf4';x.fill();}});} /* un champignon sur une plaque sur deux */
    for(const q of pl)for(let i=0;i<4;i++){const a=R()*6.28,d=q[2]*Math.sqrt(R())*.7,cx=q[0]+Math.cos(a)*d,cy=q[1]+Math.sin(a)*d,r=1.4+R()*1.2;motTore(x,function(){x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle='rgba(225,245,255,.9)';x.fill();});}}}, /* la rosée */
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
/* ===== LES LIVRÉES « STICKERS » ET LES LÉGENDAIRES (2026-11-05, le nuancier v3) =====
   Six toiles épiques de plus (mêmes règles que les pelages : 512 px raccordées, un tirage fixe par id) et les six légendaires. Une légendaire a
   `anim` (la clé de son programme dans MOT_ANIM, posé par motGreffe) ; sa toile `f` ne sert qu'à la pastille des listes. */
function motRond(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();}
function motEtoile(x,n,R1,R2,a0){x.beginPath();for(let k=0;k<2*n;k++){const a=(a0||0)-Math.PI/2+k*Math.PI/n,r=k&1?R2:R1;if(k)x.lineTo(Math.cos(a)*r,Math.sin(a)*r);else x.moveTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();}
Object.assign(MOTIFS,{
  /* STICKER BOMB : une quarantaine d'autocollants qui se chevauchent — étiquettes, étoiles, éclairs, pastilles 1.61, cœurs, damiers, sourires —
     chacun détouré de blanc et posé de travers, avec son ombre. Aucune vraie marque. */
  stickers:{s:.48,c:0x2a2d36,f:function(x,R){x.fillStyle='#262931';x.fillRect(0,0,MOT_W,MOT_W);
    const C=['#ff3b5c','#ffd23a','#2bd9ff','#7a5cff','#3ddc78','#ff8a1a','#ff5fd2','#14161c'],CL=['#ffd23a','#2bd9ff','#3ddc78','#ff8a1a'],T=['NITRO','1.61','CASH','TURBO','VROOM','GG','MAX','BOOST','WOW','$$$'];
    const pick=function(L){return L[(R()*L.length)|0];};
    const fond=function(path,c){x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=7;x.shadowOffsetY=4;path();x.lineJoin='round';x.lineWidth=12;x.strokeStyle='#fbfbf7';x.stroke();x.restore();path();x.fillStyle=c;x.fill();};
    const S=[
      function(){const t=pick(T),c=pick(C);x.font='900 30px "Arial Black",Arial,sans-serif';const w=x.measureText(t).width+28;fond(function(){motRond(x,-w/2,-22,w,44,12);},c);
        x.textAlign='center';x.textBaseline='middle';x.fillStyle=CL.indexOf(c)>=0?'#14161c':'#fff';x.fillText(t,0,2);},
      function(){fond(function(){motEtoile(x,5,40,17);},pick(CL));x.fillStyle='rgba(255,255,255,.35)';motEtoile(x,5,18,8);x.fill();},
      function(){fond(function(){x.beginPath();x.moveTo(8,-44);x.lineTo(-22,6);x.lineTo(-2,6);x.lineTo(-12,44);x.lineTo(24,-10);x.lineTo(3,-10);x.lineTo(14,-44);x.closePath();},'#ffd23a');},
      function(){const c=pick(C);fond(function(){x.beginPath();x.arc(0,0,38,0,6.2832);},c);x.beginPath();x.arc(0,0,27,0,6.2832);x.lineWidth=3;x.strokeStyle='rgba(255,255,255,.8)';x.stroke();
        x.font='900 22px "Arial Black",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText('1.61',0,1);},
      function(){fond(function(){x.beginPath();x.moveTo(0,30);x.bezierCurveTo(-46,0,-30,-38,0,-16);x.bezierCurveTo(30,-38,46,0,0,30);x.closePath();},'#ff3b5c');},
      function(){fond(function(){motRond(x,-40,-26,80,52,6);},'#fbfbf7');for(let a=0;a<6;a++)for(let b=0;b<4;b++)if((a+b)&1){x.fillStyle='#14161c';x.fillRect(-36+a*12,-22+b*11,12,11);}},
      function(){fond(function(){x.beginPath();x.arc(0,0,34,0,6.2832);},'#ffd23a');x.fillStyle='#14161c';x.beginPath();x.ellipse(-11,-8,4,7,0,0,6.2832);x.ellipse(11,-8,4,7,0,0,6.2832);x.fill();
        x.beginPath();x.arc(0,2,20,.25*Math.PI,.75*Math.PI);x.lineWidth=5;x.lineCap='round';x.strokeStyle='#14161c';x.stroke();},
      function(){const c=pick(C);fond(function(){motRond(x,-46,-16,92,32,16);},c);x.font='900 18px "Arial Black",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=CL.indexOf(c)>=0?'#14161c':'#fff';x.fillText('NO LIMIT',0,1);}];
    for(const p of motGrille(6,R,.9)){const k=(R()*S.length)|0,ro=(R()-.5)*1.1,sc=.75+R()*.55;motTore(x,function(){x.save();x.translate(p[0],p[1]);x.rotate(ro);x.scale(sc,sc);S[k]();x.restore();});}
    for(const p of motGrille(4,R,1)){const k=(R()*S.length)|0,ro=(R()-.5)*1.1,sc=.6+R()*.4;motTore(x,function(){x.save();x.translate(p[0]+40,p[1]+40);x.rotate(ro);x.scale(sc,sc);S[k]();x.restore();});}}},
  /* FLAMMES : les flammes de hot rod — langues jaune → orange → rouge, liseré bleu ciel — sur un noir pailleté ; elles lèchent vers l'arrière */
  flammes:{s:.4,c:0x121216,f:function(x,R){x.fillStyle='#0f0f13';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<500;i++){x.fillStyle='rgba(255,255,255,'+(.03+R()*.05).toFixed(3)+')';x.fillRect(R()*MOT_W,R()*MOT_W,1.5,1.5);}
    const langue=function(x0,y,L,w,cu){motTore(x,function(){x.beginPath();x.moveTo(x0,y-w/2);x.bezierCurveTo(x0+L*.35,y-w*.75+cu*14,x0+L*.62,y-w*.05+cu*26,x0+L,y+cu*24);
      x.bezierCurveTo(x0+L*.55,y+w*.3+cu*8,x0+L*.28,y+w*.7,x0,y+w/2);x.closePath();
      const g=x.createLinearGradient(x0,0,x0+L,0);g.addColorStop(0,'#fff7b0');g.addColorStop(.3,'#ffc81e');g.addColorStop(.68,'#ff5a14');g.addColorStop(1,'#c40f22');
      x.lineJoin='round';x.lineWidth=6;x.strokeStyle='#36c8ff';x.stroke();x.fillStyle=g;x.fill();});};
    for(const y0 of [128,384])for(let i=0;i<3;i++){const x0=i*171+(y0>200?85:0)+(R()-.5)*20,y=y0+(R()-.5)*30;
      for(let k=0;k<3;k++)langue(x0,y+(k-1)*16,130+R()*70-Math.abs(k-1)*35,30-Math.abs(k-1)*8,(R()-.5)*1.6);}}},
  /* CARBONE : le sergé 2/2 de la fibre de carbone, chaque brin éclairé en long, sous un vernis épais */
  carbone:{s:1.6,c:0x1b1d22,f:function(x){x.fillStyle='#0b0c0f';x.fillRect(0,0,MOT_W,MOT_W);const n=16,c=MOT_W/n;
    for(let a=0;a<n;a++)for(let b=0;b<n;b++){const h=((a+b)&3)<2;x.save();x.translate(a*c,b*c);
      const g=h?x.createLinearGradient(0,0,0,c):x.createLinearGradient(0,0,c,0);g.addColorStop(0,'#121317');g.addColorStop(.42,'#3b3f48');g.addColorStop(.58,'#2a2d34');g.addColorStop(1,'#0e0f12');
      x.fillStyle=g;x.fillRect(1,1,c-2,c-2);x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;for(let k=1;k<4;k++){x.beginPath();if(h){x.moveTo(2,k*c/4);x.lineTo(c-2,k*c/4);}else{x.moveTo(k*c/4,2);x.lineTo(k*c/4,c-2);}x.stroke();}x.restore();}}},
  /* GRAFFITI : un mur de béton clair, des nuages de bombe, des coulures, des tags en lettres grasses penchées, des éclaboussures */
  graffiti:{s:.4,c:0xd9d4cb,f:function(x,R){x.fillStyle='#dcd7ce';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<900;i++){x.fillStyle='rgba(60,50,40,'+(.04+R()*.08).toFixed(3)+')';x.fillRect(R()*MOT_W,R()*MOT_W,1+R()*2,1+R()*2);}
    const C=['255,59,92','255,200,40','43,200,255','122,92,255','40,200,110','255,128,26','255,80,200'],pk=function(){return C[(R()*C.length)|0];};
    for(let i=0;i<10;i++){const c=pk();motLueur(x,R()*MOT_W,R()*MOT_W,60+R()*90,'rgba('+c+',.9)','rgba('+c+',0)');}
    for(let i=0;i<16;i++){const cx=R()*MOT_W,cy=R()*MOT_W,L=30+R()*90,w=3+R()*4,c=pk();motTore(x,function(){x.fillStyle='rgba('+c+',.9)';x.fillRect(cx-w/2,cy,w,L);x.beginPath();x.arc(cx,cy+L,w*.85,0,6.2832);x.fill();});}
    const W=['CASH','1.61','NITRO','ZOOM','WOW','FAST'];
    for(let i=0;i<6;i++){const cx=((i&1)+.5)*256+(R()-.5)*60,cy=((i>>1)+.5)*170+(R()-.5)*30,ro=(R()-.5)*.45,t=W[i],c=pk(),c2=pk();
      motTore(x,function(){x.save();x.translate(cx,cy);x.rotate(ro);x.transform(1,0,-.28,1,0,0);x.font='900 70px Impact,"Arial Black",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
        x.lineWidth=20;x.strokeStyle='#121212';x.strokeText(t,0,0);x.lineWidth=8;x.strokeStyle='#fff';x.strokeText(t,0,0);
        const g=x.createLinearGradient(0,-30,0,30);g.addColorStop(0,'rgb('+c+')');g.addColorStop(1,'rgb('+c2+')');x.fillStyle=g;x.fillText(t,0,0);x.restore();});}
    for(let i=0;i<160;i++){const cx=R()*MOT_W,cy=R()*MOT_W,r=.8+R()*R()*5,c=pk();motTore(x,function(){x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle='rgba('+c+',.85)';x.fill();});}}},
  /* POP ART : la trame d'imprimerie (des points qui grossissent et maigrissent) sur fond jaune, et des bulles BOOM ! POW ! ZAP ! WOW ! */
  popart:{s:.42,c:0xffd23a,f:function(x,R){x.fillStyle='#ffd23a';x.fillRect(0,0,MOT_W,MOT_W);const n=32,c=MOT_W/n;x.fillStyle='#ff3d7f';
    for(let a=0;a<n;a++)for(let b=0;b<n;b++){const u=a/n,v=b/n,f=.55+.28*Math.sin(u*6.2832*2)+.22*Math.cos((v+u)*6.2832);x.beginPath();x.arc((a+.5)*c,(b+.5)*c,c*.48*Math.max(.12,Math.min(1,f)),0,6.2832);x.fill();}
    const M=[['BOOM!','#ff2b2b'],['POW!','#2b7bff'],['ZAP!','#14161c'],['WOW!','#ff2b2b']];
    M.forEach(function(m,i){const cx=((i&1)+.5)*256+(R()-.5)*40,cy=((i>>1)+.5)*256+(R()-.5)*40,ro=(R()-.5)*.5;
      motTore(x,function(){x.save();x.translate(cx,cy);x.rotate(ro);motEtoile(x,13,92,62,R());x.fillStyle='#fff';x.fill();x.lineWidth=7;x.lineJoin='round';x.strokeStyle='#14161c';x.stroke();
        x.font='900 46px "Arial Black",Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=10;x.strokeStyle='#14161c';x.strokeText(m[0],0,3);x.fillStyle=m[1];x.fillText(m[0],0,3);x.restore();});});}},
  /* GRANDE VAGUE : le seigaiha des estampes — des éventails d'anneaux, rangée sur rangée, chaque rangée recouvre celle du dessus */
  vagues:{s:.55,c:0x1d4f9a,f:function(x){x.fillStyle='#0f2a5e';x.fillRect(0,0,MOT_W,MOT_W);const r=64;
    for(let j=-2;j<=18;j++){const y=j*32,ox=(j&1)?r:0;for(let i=-1;i<=4;i++){const cx=i*2*r+ox;
      x.beginPath();x.arc(cx,y,r,0,6.2832);x.fillStyle=(j%3===0)?'#1b4f9e':'#163f86';x.fill();
      for(const k of [.93,.74,.55,.36]){x.beginPath();x.arc(cx,y,r*k,0,6.2832);x.lineWidth=k>.9?3:5;x.strokeStyle=k>.9?'#e9c46a':'#f4f1e8';x.stroke();}
      x.beginPath();x.arc(cx,y,r*.16,0,6.2832);x.fillStyle='#f4f1e8';x.fill();}}}},
  /* — LES LÉGENDAIRES : la toile des pastilles ; le programme est dans MOT_ANIM — */
  neon:{s:1,anim:'neon',c:0x14102a,f:function(x,R){x.fillStyle='#0b0916';x.fillRect(0,0,MOT_W,MOT_W);
    for(let j=0;j<8;j++){const y=(j+.5)*64,c=j&1?'#ff2fb8':'#22e6ff';x.save();x.shadowColor=c;x.shadowBlur=14;x.fillStyle=c;x.fillRect(0,y-3,MOT_W,6);x.restore();
      for(let k=0;k<3;k++){const xx=R()*MOT_W;x.fillStyle='rgba(255,255,255,.85)';x.fillRect(xx,y-2,40,4);}}}},
  sakura:{s:1,anim:'sakura',c:0x1a0f2a,f:function(x,R){x.fillStyle='#0d0718';x.fillRect(0,0,MOT_W,MOT_W);const p=8;
    x.fillStyle='rgba(180,60,200,.10)';for(let k=0;k<MOT_W;k+=p*4){x.fillRect(k,0,1,MOT_W);x.fillRect(0,k,MOT_W,1);}
    for(let i=0;i<16;i++){const cx=R()*MOT_W,cy=R()*MOT_W,r=3+((R()*2)|0),a0=R()*6.28,c=R()<.5?'#ff5fa8':'#ffb6d5';
      motTore(x,function(){for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const d=Math.hypot(a,b)/r,an=Math.atan2(b,a)+a0;if(d<=.35+.65*(.5+.5*Math.cos(5*an))){x.fillStyle=d<.3?'#fff2a8':c;x.fillRect(Math.round(cx/p+a)*p,Math.round(cy/p+b)*p,p,p);}}});}}},
  magma:{s:1,anim:'magma',c:0x2a0d05,f:function(x,R){x.fillStyle='#170a07';x.fillRect(0,0,MOT_W,MOT_W);
    for(let i=0;i<12;i++){let px=R()*MOT_W,py=R()*MOT_W;const P=[[px,py]];for(let k=0;k<8;k++){px+=(R()-.5)*90;py+=(R()-.5)*90;P.push([px,py]);}
      motTore(x,function(){x.save();x.shadowColor='#ff5a10';x.shadowBlur=16;x.strokeStyle='#ff7a1a';x.lineWidth=4;x.lineJoin='round';x.beginPath();P.forEach(function(q,k){if(k)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1]);});x.stroke();
        x.shadowBlur=0;x.strokeStyle='#ffe08a';x.lineWidth=1.5;x.stroke();x.restore();});}}},
  ocean:{s:1,anim:'ocean',c:0x0a3a5a,f:function(x,R){x.fillStyle='#04304f';x.fillRect(0,0,MOT_W,MOT_W);for(let i=0;i<7;i++)motLueur(x,R()*MOT_W,R()*MOT_W,120+R()*90,'rgba(10,110,140,.55)','rgba(10,110,140,0)');
    for(let i=0;i<26;i++){const cx=R()*MOT_W,cy=R()*MOT_W,r=30+R()*60;motTore(x,function(){x.save();x.shadowColor='#7ff0ff';x.shadowBlur=10;x.strokeStyle='rgba(150,240,255,.75)';x.lineWidth=2.5;x.beginPath();
      for(let k=0;k<=7;k++){const a=k/7*6.2832,rr=r*(.7+.3*Math.sin(k*2.3+i));if(k)x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7);else x.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7);}x.stroke();x.restore();});}}},
  rgb:{s:1,anim:'rgb',c:0xff3a6a,f:function(x){for(let i=0;i<MOT_W;i+=4){x.fillStyle='hsl('+(i/MOT_W*360).toFixed(1)+',95%,55%)';x.fillRect(i,0,4,MOT_W);}
    const g=x.createLinearGradient(0,0,0,MOT_W);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g;x.fillRect(0,0,MOT_W,MOT_W);}}});
MOTIFS.galaxie.anim='galaxie';MOTIFS.galaxie.s=1; /* (2026-11-05) GALAXIE passe LÉGENDAIRE : sa toile reste la pastille, le programme fait la fenêtre */
/* LES PROGRAMMES DES LÉGENDAIRES (MOT_ANIM) — du GLSL posé dans la laque par motGreffe, juste après la couleur des sommets : chacun écrit `motC`
   (la couleur de la tôle, éclairée comme une laque : reflets, vernis et liseré restent) et `motE` (la lumière propre, ajoutée à la fin : c'est elle que
   le bloom attrape). Repères : vMotP la position dans la caisse (m), vMotN sa normale, vMotD le rayon caméra → tôle dans le repère de la caisse (ce qui
   donne de la PROFONDEUR à la galaxie : on voit à travers, et elle bouge quand on tourne autour), uMotT l'horloge (s). moUV : le plan qui fait face. */
const MOT_ANIM_FN='float moH1(float n){return fract(sin(n*12.9898)*43758.5453);}\n'+
  'float moH2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
  'float moH3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+
  'float moN3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(moH3(i),moH3(i+vec3(1.,0.,0.)),f.x),mix(moH3(i+vec3(0.,1.,0.)),moH3(i+vec3(1.,1.,0.)),f.x),f.y),'+
    'mix(mix(moH3(i+vec3(0.,0.,1.)),moH3(i+vec3(1.,0.,1.)),f.x),mix(moH3(i+vec3(0.,1.,1.)),moH3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}\n'+
  'vec2 moUV(vec3 p,vec3 n){vec3 a=abs(n);if(a.x>a.y&&a.x>a.z)return vec2(n.x<0.?p.z:-p.z,p.y);if(a.y>a.z)return vec2(n.y<0.?p.x:-p.x,p.z);return vec2(n.z<0.?-p.x:p.x,p.y);}\n'+
  'vec3 moHue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}\n';
const MOT_ANIM={
  /* GALAXIE : une nébuleuse (bruit 3D le long du rayon) et trois couches d'étoiles à des profondeurs différentes — la parallaxe fait la fenêtre ;
     les étoiles scintillent, la nébuleuse dérive ; un liseré violet en rasant, comme une vitre */
  galaxie:'vec3 gD=normalize(vMotD),gP=vMotP;float gT=uMotT;vec3 gQ=gD*1.7+gP*.22+vec3(gT*.025,gT*.01,gT*.017);\n'+
    'float gA=moN3(gQ*1.5),gB=moN3(gQ*3.4+5.3),gC=moN3(gQ*7.7+1.7);float gNb=smoothstep(.44,1.02,gA*.62+gB*.30+gC*.14);\n'+
    'motE=vec3(.006,.004,.022)+mix(vec3(.42,.03,.62),vec3(.02,.28,.85),gB)*gNb*1.25+vec3(1.,.35,.75)*pow(gNb,3.)*1.1;\n'+
    'for(int k=0;k<3;k++){float fk=float(k);vec3 sp=(gP+gD*(.45+fk*.75))*(4.5+fk*3.5);vec3 sc=floor(sp),sf=fract(sp)-.5;float sh=moH3(sc+fk*13.1);'+
      'vec3 so=vec3(moH3(sc+1.7),moH3(sc+3.1),moH3(sc+5.9))-.5;float sr=length(sf-so*.6);'+
      'motE+=mix(vec3(.7,.8,1.),vec3(1.,.9,.75),sh)*step(.66,sh)*smoothstep(.16-.03*fk,0.,sr)*(.55+.45*sin(gT*(1.+sh*5.)+sh*50.))*3.4;}\n'+
    'vec3 gS=floor((gP+gD*.3)*38.);motE+=vec3(.85,.9,1.)*step(.985,moH3(gS))*(.5+.5*sin(gT*3.+moH3(gS+2.)*40.))*1.2;\n'+
    'float gF=1.-abs(dot(normalize(vNormal),normalize(vViewPosition)));motE+=vec3(.5,.35,1.)*pow(gF,3.)*.55;motC=vec3(.03,.025,.05);motK=.82;\n',
  /* NÉON TOKYO : des tubes horizontaux cyan et magenta (en long sur le toit), une impulsion de lumière qui court sur chacun, des barrettes qui clignotent */
  neon:'vec3 nP=vMotP,nN=normalize(vMotN);float nT=uMotT;float nS=mix(nP.y,nP.x,step(.6,abs(nN.y)))*5.5;float nI=floor(nS),nL=abs(fract(nS)-.5);\n'+
    'float nH=moH1(nI+3.);vec3 nC=mix(vec3(0.,.85,1.),vec3(1.,.12,.72),step(.5,nH));float nLn=smoothstep(.06,.0,nL)+.4*smoothstep(.22,.0,nL);\n'+
    'float nPu=pow(fract(nP.z*.5*(nH>.5?1.:-1.)-nT*(.45+nH*.5)+nH*7.),6.);float nZ=nP.z*2.5;\n'+
    'float nB=smoothstep(.05,0.,abs(fract(nZ)-.5))*step(.75,moH1(floor(nZ)*1.7+nI*5.3+floor(nT*3.)))*smoothstep(.45,.3,nL);\n'+
    'motE=nC*nLn*(.3+2.6*nPu)+vec3(.55,.3,1.)*nB*.7;motC=vec3(.045,.04,.07)+nC*nLn*.25;\n',
  /* SAKURA.EXE : un écran noir en gros pixels, la grille qui luit à peine, trois couches de fleurs de cerisier en pixels qui tombent en tournant,
     des lignes de balayage, et de temps en temps une rangée qui saute (le bug) */
  sakura:'vec3 kN=normalize(vMotN);vec2 kU=moUV(vMotP,kN);float kT=uMotT;vec2 kQ=(floor(kU*24.)+.5)/24.;\n'+
    'float kRw=floor(kQ.y*16.);float kGl=step(.93,moH1(kRw*3.7+floor(kT*6.)));kQ.x+=kGl*.07*(moH1(kRw+floor(kT*6.)*1.3)-.5);\n'+
    'vec2 kF=fract(kU*24.);float kGd=step(.86,max(kF.x,kF.y));vec3 kE=vec3(.30,.05,.40)*kGd*.45+vec3(.05,.01,.09);vec3 kA=vec3(.035,.02,.07);\n'+
    'for(int k=0;k<3;k++){float fk=float(k),kS=.42+fk*.16;vec2 kV=vec2(kQ.x+sin(kT*.5+fk*2.)*.06,kQ.y+kT*(.09+fk*.045));\n'+
      'vec2 kC=floor(kV/kS),kL=fract(kV/kS);float kH=moH2(kC+fk*7.1);vec2 kO=vec2(.28)+.44*vec2(moH2(kC+2.3),moH2(kC+5.7));\n'+
      'vec2 kD=(kL-kO)*kS;float kR=length(kD)/(.12-.02*fk);float kAn=atan(kD.y,kD.x+1e-5)+kT*(.4+kH)+kH*6.28;\n'+
      'float kPe=step(kR,.38+.62*(.5+.5*cos(5.*kAn)))*step(.32,kH);float kCe=step(kR,.22)*step(.32,kH);vec3 kP=mix(vec3(1.,.36,.66),vec3(1.,.72,.86),moH2(kC+9.1));\n'+
      'kE+=kP*kPe*(1.5-fk*.3)+vec3(1.,.95,.6)*kCe;kA+=kP*kPe*.35;}\n'+
    'kE*=.8+.2*step(.5,fract(kU.y*12.));kE+=vec3(0.,.5,.6)*kGl*.3;motE=kE;motC=kA;motK=.6;\n',
  /* MAGMA : des plaques de basalte (Voronoï dont les germes dérivent), la lave dans les joints qui respire, des braises sous la croûte */
  magma:'vec3 mN=normalize(vMotN);vec2 mU=moUV(vMotP,mN)*2.4;float mT=uMotT;vec2 mI=floor(mU),mF=fract(mU);float d1=8.,d2=8.;\n'+
    'for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=vec2(moH2(mI+g),moH2(mI+g+3.7));o=.5+.38*sin(mT*.35+6.2831*o);float d=length(g+o-mF);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}\n'+
    'float mCr=smoothstep(.11,.0,d2-d1);float mHe=.5+.5*sin(mT*1.6+moN3(vec3(mU*1.2,mT*.25))*7.);float mRk=moN3(vec3(mU*4.,1.7));\n'+
    'motC=vec3(.075,.045,.04)*(.55+.9*mRk)+vec3(.35,.07,0.)*mCr;\n'+
    'motE=vec3(1.,.27,.02)*mCr*(.7+1.7*mHe)+vec3(1.,.78,.3)*pow(mCr,4.)*mHe*1.4+vec3(.6,.1,0.)*smoothstep(.72,1.,moN3(vec3(mU*.8,mT*.2)))*.4;\n',
  /* ABYSSES : les caustiques — la lumière qui danse au fond de l'eau — sur un bleu profond qui ondule */
  ocean:'vec3 oN=normalize(vMotN);vec2 oU=moUV(vMotP,oN)*.9;float oT=uMotT*.45+23.;vec2 oQ=mod(oU*6.2831,6.2831)-250.;vec2 oI=oQ;float oC=1.;\n'+
    'for(int n=0;n<4;n++){float t=oT*(1.-(3.5/float(n+1)));oI=oQ+vec2(cos(t-oI.x)+sin(t+oI.y),sin(t-oI.y)+cos(t+oI.x));oC+=1./max(1e-4,length(vec2(oQ.x/(sin(oI.x+t)/.005),oQ.y/(cos(oI.y+t)/.005))));}\n'+
    'oC/=4.;oC=1.17-pow(max(oC,0.),1.4);float oL=clamp(pow(abs(oC),8.),0.,2.);float oD=moN3(vec3(oU*1.4,uMotT*.12));\n'+
    'motC=mix(vec3(0.,.09,.2),vec3(0.,.33,.48),oD)+oL*.2;motE=vec3(.4,.92,1.)*oL*.75+vec3(0.,.04,.07);\n',
  /* RGB : l'arc-en-ciel qui défile en diagonale sur la caisse, et un reflet blanc qui balaie */
  rgb:'vec3 rP=vMotP;float rT=uMotT;vec3 rC=moHue(fract(rP.z*.16+rP.y*.11+rP.x*.05-rT*.16));float rS=pow(1.-abs(fract(rP.z*.3+rP.y*.15-rT*.4)-.5)*2.,18.);\n'+
    'motC=mix(rC,vec3(1.),.07)*.9+rS*.25;motE=rC*.32+vec3(rS)*.55;\n'};
/* L'HORLOGE DES LÉGENDAIRES : un seul uniform partagé, avancé à chaque image dès qu'une légendaire est greffée (rien avant) */
const MOT_TU={value:0};let MOT_HORL=false;
function motHorloge(){if(MOT_HORL)return;MOT_HORL=true;const t0=performance.now();(function f(){MOT_TU.value=(performance.now()-t0)/1000;requestAnimationFrame(f);})();}
const MOT_TX={},MOT_URL={};
function motToile(id,w){const M=MOTIFS[id];if(!M)return null;const cv=document.createElement('canvas');cv.width=cv.height=w;const x=cv.getContext('2d');
  let h=7;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619);x.scale(w/MOT_W,w/MOT_W);M.f(x,motAlea(h));return cv;} // le même tirage à chaque fois : la peinture ne change pas d'une caisse à l'autre
function motTex(id){if(MOT_TX[id])return MOT_TX[id];const cv=motToile(id,MOT_W);if(!cv)return null;const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return MOT_TX[id]=t;}
function motUrl(id){if(MOT_URL[id]!=null)return MOT_URL[id];let u='';try{const cv=motToile(id,192);u=cv?cv.toDataURL('image/jpeg',.86):'';}catch(e){}return MOT_URL[id]=u;} /* (2026-11-05) 192 px : la grande pastille des cartes de la boutique reste nette */
function motFond(d){const c='#'+((d.c||0)>>>0).toString(16).padStart(6,'0'),u=motUrl(d.mot);return u?'url('+u+') center/200% auto,'+c:c;} // la PASTILLE d'un motif (le fond CSS des listes)
/* la projection : chaque face prend la toile du plan qui lui fait face (pondérée par sa normale ^12 : un pan en biais prend surtout le plan le plus proche — à ^6 le damier virait au gris en fondant deux plans),
   retournée là où il faut pour se lire À L'ENDROIT de l'extérieur — dans le repère de la caisse : le motif colle à la tôle quand elle roule */
const MOT_GLSL='vec3 mN9=normalize(vMotN),mA9=pow(abs(mN9),vec3(12.));mA9/=max(1e-4,mA9.x+mA9.y+mA9.z);vec3 mP9=vMotP*uMotS;\n'+
  'vec3 motC=texture2D(uMot,vec2(mN9.x<0.?mP9.z:-mP9.z,mP9.y)).rgb*mA9.x+texture2D(uMot,vec2(mN9.y<0.?mP9.x:-mP9.x,mP9.z)).rgb*mA9.y+texture2D(uMot,vec2(mN9.z<0.?-mP9.x:mP9.x,mP9.y)).rgb*mA9.z;\n'+
  'diffuseColor.rgb*=motC;\n';
const MOT_GLSL_MEL='vec3 mN9=normalize(vMotN),mA9=pow(abs(mN9),vec3(12.));mA9/=max(1e-4,mA9.x+mA9.y+mA9.z);vec3 mP9=vMotP*uMotS;\n'+
  'vec3 motC=texture2D(uMot,vec2(mN9.x<0.?mP9.z:-mP9.z,mP9.y)).rgb*mA9.x+texture2D(uMot,vec2(mN9.y<0.?mP9.x:-mP9.x,mP9.z)).rgb*mA9.y+texture2D(uMot,vec2(mN9.z<0.?-mP9.x:mP9.x,mP9.y)).rgb*mA9.z;\n'+
  'float motK=1.-smoothstep(.93,.985,min(motC.r,min(motC.g,motC.b)));vec3 motM=mix(vec3(1.),motC,motK);diffuseColor.rgb=mix(diffuseColor.rgb,motC*.72,motK);\n'; /* (2026-11-01) le MÉLANGE : le blanc pur de la toile laisse la couleur de la caisse, le reste (la mousse) la recouvre */
const MOT_FAIT=new WeakSet(); // les matières déjà greffées (un clone de matière perd la greffe : la fin de buildCar le rattrape)
function motGreffe(m,id){const M=MOTIFS[id];if(!M||MOT_FAIT.has(m))return m;const A=M.anim&&MOT_ANIM[M.anim],T=A?null:motTex(id);if(!A&&!T)return m;MOT_FAIT.add(m);
  const prev=m.onBeforeCompile,pk=String(prev),uT={value:T},uS={value:M.s};if(A)motHorloge();
  m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.uMotS=uS;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMotP;varying vec3 vMotN;'+(A?'varying vec3 vMotD;':''))
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvMotP=transformed;vMotN=objectNormal;'+(A?'vMotD=(vec4((modelMatrix*vec4(transformed,1.)).xyz-cameraPosition,0.)*modelMatrix).xyz;':''));
    if(A){sh.uniforms.uMotT=MOT_TU; /* (2026-11-05) UNE LÉGENDAIRE : son programme (MOT_ANIM) remplace la toile ; sa lumière propre s'ajoute à la toute fin (le bloom la prend) */
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uMotS;uniform float uMotT;varying vec3 vMotP;varying vec3 vMotN;varying vec3 vMotD;\n'+MOT_ANIM_FN)
        .replace('#include <color_fragment>','#include <color_fragment>\nvec3 motC=vec3(1.),motE=vec3(0.);float motK=0.;{\n'+A+'}\ndiffuseColor.rgb*=motC;\n').replace('vColor*uGlow','vColor*motC*uGlow')
        .replace('#include <dithering_fragment>','gl_FragColor.rgb=mix(gl_FragColor.rgb+motE,motE+gl_FragColor.rgb*.25,motK);\n#include <dithering_fragment>');return;}
    sh.uniforms.uMot=uT;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uMot;uniform float uMotS;varying vec3 vMotP;varying vec3 vMotN;')
      .replace('#include <color_fragment>','#include <color_fragment>\n'+(M.mel?MOT_GLSL_MEL:MOT_GLSL)).replace('vColor*uGlow',M.mel?'vColor*motM*uGlow':'vColor*motC*uGlow');}; // le plancher lumineux du kit prend le motif aussi
  m.customProgramCacheKey=function(){return 'motif|'+(A?'anim:'+M.anim+'|':M.mel?'mel|':'')+pk;}; // ⚠ r128 réutilise un programme d'une matière à l'autre par cette clé : une par greffe d'origine (la laque du kit, le vernis rimify) ; le motif, lui, vit dans un uniform — une légendaire a SON programme
  m.userData.mot=id;return m;}
/* LES TOUFFES EN RELIEF (2026-11-01, Léo : « plus 3D, un truc qui s'ajoute sur la voiture ») : un motif à `touffes` (la MOUSSE) pose, sur les faces du dessus de la tôle,
   de petits dômes à facettes — UNE SEULE pièce (les dômes fondus en une géométrie, couleur par sommet : un seul dessin, ~230 × 20 triangles) — et SEULEMENT là où la toile a de la
   mousse (même projection que le shader : plan du dessus, (−x, z) × l'échelle du motif) ; le tirage a une graine fixe : la caisse est la même à chaque fois. Posée APRÈS la soudure
   de la caisse (elle fond les pièces) et dans le repère de la caisse (`carBody`). */
const MOT_MASQ={};
function motMasque(id){if(MOT_MASQ[id])return MOT_MASQ[id];const N=64,cv=motToile(id,N),d=cv.getContext('2d').getImageData(0,0,N,N).data,m=new Uint8Array(N*N);for(let i=0;i<N*N;i++)m[i]=Math.min(d[i*4],d[i*4+1],d[i*4+2])<238?1:0;return MOT_MASQ[id]={N:N,m:m};}
let MOT_TGEO=null,MOT_TMAT=null;
function motTouffes(grp,id){const M=MOTIFS[id];if(!M||!M.touffes)return;grp.updateWorldMatrix(true,false);const INV=new THREE.Matrix4().copy(grp.matrixWorld).invert(),REL=new THREE.Matrix4();
  if(!MOT_TGEO){MOT_TGEO=new THREE.IcosahedronGeometry(1,0);MOT_TMAT=new THREE.MeshLambertMaterial({vertexColors:true});}
  const MQ=motMasque(id),R=motAlea(20261101),IP=MOT_TGEO.attributes.position,NV=IP.count;
  grp.traverse(function(o){const m9=o.material;if(!o.isMesh||!m9||Array.isArray(m9)||!m9.userData||m9.userData.mot!==id||o.userData.touffes)return;
    const g=o.geometry,P=g&&g.attributes.position;if(!P)return;o.updateWorldMatrix(true,false);REL.multiplyMatrices(INV,o.matrixWorld);
    const ix=g.index,nt=ix?ix.count/3:P.count/3,A=[],cum=[];let tot=0;
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e=new THREE.Vector3();
    for(let t=0;t<nt;t++){const i0=ix?ix.getX(t*3):t*3,i1=ix?ix.getX(t*3+1):t*3+1,i2=ix?ix.getX(t*3+2):t*3+2;a.fromBufferAttribute(P,i0);b.fromBufferAttribute(P,i1);c.fromBufferAttribute(P,i2);
      n.subVectors(b,a).cross(e.subVectors(c,a));const ar=n.length()*.5;if(ar<1e-7)continue;n.divideScalar(ar*2);if(n.y<.6)continue; // les faces tournées vers le haut seulement
      tot+=ar;cum.push(tot);A.push([i0,i1,i2,n.x,n.y,n.z]);}
    if(!A.length||tot<.8)return;const K=Math.min(ALLEGE?120:230,Math.round(tot*80)),pos3=new Float32Array(K*NV*3),col3=new Float32Array(K*NV*3),Mx=new THREE.Matrix4(),q=new THREE.Quaternion(),q2=new THREE.Quaternion(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color(),UP=new THREE.Vector3(0,1,0),nn=new THREE.Vector3(),vv3=new THREE.Vector3();
    let k=0;for(let it=0;it<2600&&k<K;it++){const w=R()*tot;let lo=0,hi=cum.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(cum[mid]<w)lo=mid+1;else hi=mid;}const T=A[lo];
      a.fromBufferAttribute(P,T[0]);b.fromBufferAttribute(P,T[1]);c.fromBufferAttribute(P,T[2]);let u=R(),v=R();if(u+v>1){u=1-u;v=1-v;}
      pos.copy(a).addScaledVector(e.subVectors(b,a),u).addScaledVector(e.subVectors(c,a),v);
      const uu=-pos.x*M.s,vv=pos.z*M.s,cx=Math.floor((uu-Math.floor(uu))*MQ.N),cy=Math.floor((1-(vv-Math.floor(vv)))*MQ.N);if(!MQ.m[Math.min(MQ.N-1,cy)*MQ.N+Math.min(MQ.N-1,cx)])continue; // pas de mousse sur la toile ici : pas de touffe
      nn.set(T[3],T[4],T[5]);pos.addScaledVector(nn,.012);q.setFromUnitVectors(UP,nn);q2.setFromAxisAngle(UP,R()*6.28);q.multiply(q2);
      const s0=.05+R()*.06;sc.set(s0,s0*(.5+R()*.35),s0*(.8+R()*.4));Mx.compose(pos,q,sc);Mx.premultiply(REL);
      col.setHSL((88+R()*24)/360,.40+R()*.12,.11+R()*.13);
      for(let vi=0;vi<NV;vi++){vv3.fromBufferAttribute(IP,vi).applyMatrix4(Mx);const o3=(k*NV+vi)*3;pos3[o3]=vv3.x;pos3[o3+1]=vv3.y;pos3[o3+2]=vv3.z;col3[o3]=col.r;col3[o3+1]=col.g;col3[o3+2]=col.b;}k++;}
    if(!k)return;const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos3.subarray(0,k*NV*3),3));G.setAttribute('color',new THREE.BufferAttribute(col3.subarray(0,k*NV*3),3));G.computeVertexNormals();
    const T2=new THREE.Mesh(G,MOT_TMAT);T2.userData.touffes=1;T2.userData.noShadow=true;grp.add(T2);});}
/* LE NUANCIER v3 EN VITRINE (2026-11-05) : D'ORIGINE, puis PEINT_CAT dans son ordre — la rareté (`r`), le prix (`eur`), le motif (`mot`, sa teinte de
   fond `c`), l'animation (`anim`), le défi (`def`, et `ind` : sa phrase, que l'écran des missions affiche pour une peinture gagnée) */
for(const e of PEINT_CAT){const o=Object.assign({id:e[0],n:e[1],r:e[2],d:e[4]},e[3]);
  if(o.mot){o.c=MOTIFS[o.mot].c;if(MOTIFS[o.mot].anim)o.anim=1;}
  o.eur=PEINT_EUR[o.r];if(e[5]){o.def=e[5];o.ind=e[5].t;}COSM.peinture.push(o);}
Object.assign(I18N,{"SANS AILES":"NO WINGS","Les ailes, c'est pour les pigeons. Dix buses à air comprimé planquées dans la carrosserie : elle crache des bouffées blanches, pivote sur elle-même et s'envole. Bon. Ça a marché.":"Wings are for pigeons. Ten compressed-air nozzles hidden in the bodywork: it spits white puffs, spins on the spot and takes off. Well. It worked."}); /* (l'aile SANS AILES : sa traduction vivait ici, avec les motifs) */
/* LES MISSIONS v2 — LES HABILLAGES QUI SE GAGNENT (2026-10-16, Sacha : « un objet donné par une mission ne s'achète plus : la boutique
   affiche à la place la mission qui le débloque ») : `mis2` = l'id de la mission ; plus de prix (ni dollars ni euros), plus de carnet.
   L'ARC-EN-CIEL (carnet 5) n'est plus la récompense d'aucune mission : « elle reste UNIQUEMENT dans le pack de la voiture chat » —
   `pack:'chat'` (shopOwned : à toi avec le CHAT POP-TART ; qui l'a déjà gagnée au carnet la garde, elle est dans `own`). */
{const H9={};for(const m of M2)if(m.r&&m.r.cat)H9[m.r.cat+':'+m.r.id]=m.id;
  for(const cat of ['peinture','aile','trainee'])for(const d of COSM[cat]){const id=H9[cat+':'+d.id];
    if(id){d.mis2=id;delete d.mis;delete d.p;delete d.eur;if(/relevant des défis/.test(d.d||''))d.d="Ne s'achète pas : elle se gagne par une mission.";}
    else if(d.mis){delete d.mis;if(d.id==='arcenciel'){d.pack='chat';d.d="Ne s'achète pas : elle vient avec le CHAT POP-TART.";}}}}
/* LE RANGEMENT DES PEINTURES (2026-11-05, le nuancier v3) : D'ORIGINE, puis l'ordre de PEINT_CAT — COMMUNES (le cercle chromatique, puis les pastels),
   RARES (feu, froid, néon, métal, ombre, pop), ÉPIQUES (les livrées, puis les pelages), LÉGENDAIRES. L'ordre des listes EST l'ordre à l'écran.
   Plus rien de caché : `peintCachee` reste (la bande du garage l'appelle) et répond toujours non. */
const PEINT_RANG={};PEINT_CAT.forEach(function(e,k){PEINT_RANG[e[0]]=k;});
function peintClef(j){const d=COSM.peinture[j];if(!d||d.id==='usine')return -1;const k=PEINT_RANG[d.id];return k!=null?k:900+j;}
function peintCachee(d){return false;}
function peintOrdre(){return COSM.peinture.map(function(d,j){return j;}).sort(function(a,b){return peintClef(a)-peintClef(b);});}
function peintVoisine(i,pas){const O=peintOrdre(),k=O.indexOf(i);return O[((k<0?0:k)+pas+O.length)%O.length];} /* ◀ ▶ en boutique : la voisine DANS L'ORDRE DE LA VITRINE */
/* acheter un habillage EN EUROS (une peinture) : la porte de StoreKit, comme une caisse — rien n'est donné tant qu'Apple n'a pas encaissé */
function habDonne(cat,id){const o=SAVE.d.shop.own,k=cat+':'+id;if(o.indexOf(k)<0)o.push(k);SAVE.d.shop.eq[cat]=id;SAVE.flush();}
function habPaye(cat,i,bt){const d=COSM[cat]&&COSM[cat][i];if(!d||!d.eur||shopOwned(cat,d.id)||habPaye.on)return false;habPaye.on=1;uiClic('');hap(12);
  shopPaye(cat+':'+d.id).then(function(){habPaye.on=0;habDonne(cat,d.id);garEquipeHabit(cat,i);shopShow(cat,i);hap([10,30,20,30,40]);try{pixBurst($('gCard'),26);gTampon(TR('À TOI !'));}catch(e){}
    try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}}catch(e){}try{GBQ.rk='';gShopJour();}catch(e){}},
    function(){habPaye.on=0;if(bt)try{gSecoue(bt);}catch(e){}uiClic('refus');hap([10,40,10]);toast(pxi('panier')+' '+TR("L'achat est indisponible pour le moment."));});return true;}
/* (2026-11-05, jury HYG-12) palDonne : fonction jamais appelée, retirée */
/* ===== « OU GAGNE-LA » — LES DÉFIS DES PEINTURES (2026-11-05, le nuancier v3) =====
   Une peinture à `def` s'achète, ou se gagne : sa valeur se lit à tout moment (peintDefVal, les records de la partie en cours compris) ; elle tombe
   dès qu'elle passe le seuil (peintDefisVerifie, appelée par m2Verifie : en course quatre fois par seconde, et aux menus), ou par secGagne pour un
   exploit d'un coup (`k:'b'`, les détections de defis-moteur.js). Gagnée : dans `own`, et son id dans `m2.c.pg` (l'écran des missions la raconte).
   En course : la ligne du bas (PEINTURE GAGNÉE) ; aux menus : le toast. Rien en balade ni au bac à sable. */
function peintDefSeuil(f){return f.v==='prof'?M2K.prof:+f.v||1;}
function peintDefVal(f){if(!f||f.k==='b'||f.k==='serie')return -1;let s;try{s=m2Etat();}catch(e){return 0;}const c=s.c||{},r=s.r||{},ex=SAVE.d.ex||{};
  if(f.k.indexOf('sc:')===0)return (c.sc&&+c.sc[f.k.slice(3)])||0;
  switch(f.k){case 'gagne':return c.gagne||0;case 'jours':return c.jours|0;case 'kmh':return Math.max(ex.kmh|0,r.kmh|0);case 'frenT':return Math.max(SAVE.d.frenRec||0,r.frenT||0);
    case 'tours':return r.tours|0;case 'fig':return r.fig|0;case 'parf':return r.parf|0;case 'prof':return r.prof||0;case 'eng':case 'aura':try{return m2Val({k:f.k});}catch(e){return 0;}}
  return 0;}
function peintDefFrac(d){const f=d&&d.def,v=peintDefVal(f);return v<0?-1:Math.max(0,Math.min(1,v/peintDefSeuil(f)));}
function peintDefNb(f,v){const S=peintDefSeuil(f),nb=function(x){return Math.floor(x).toLocaleString(typeof LOC==='function'?LOC():'fr').replace(/[  ]/g,' ');};
  if(f.k==='prof')return Math.min(100,Math.floor(100*v/S))+' %';if(f.k==='gagne')return fmtSolde(Math.min(v,S))+' / '+fmtSolde(S);
  return nb(Math.min(v,S))+' / '+nb(S)+(f.u==='km'?' KM':f.u==='s'?' S':f.u==='kmh'?' KM/H':'');}
function peintGagne(d){if(!d||shopOwned('peinture',d.id))return false;SAVE.d.shop.own.push('peinture:'+d.id);
  try{const c=m2Etat().c;(c.pg||(c.pg=[])).push(d.id);}catch(e){}SAVE.flush();
  if(!m2LigneDit('col',sansAcc(TR(d.n)),''))toast(pxi('pinceau')+' '+TR('PEINTURE GAGNÉE')+' · '+TR(d.n),true);
  try{hap([20,40,20,40,60]);}catch(e){}try{if(typeof SONV2!=='undefined'&&SONV2)sfx('victoire');}catch(e){}try{GBQ.rk='';}catch(e){}return true;}
function secDonne(id){ /* GAMEPLAY : un exploit réussi (secGagne, m2Cpt) → sa peinture. Rien en balade ni au bac à sable ; rien si elle est déjà à toi */
  if((typeof BALADE!=='undefined'&&BALADE)||(typeof SANDBOX!=='undefined'&&SANDBOX))return false;
  const d=COSM.peinture.find(function(x){return x.id===id&&x.def;});return d?peintGagne(d):false;}
const PEINT_EX_SEC=['minuit','chrome','ogre','gotham','envers','guerrier','bolide','emeute','taxi','azur','royal','fuchsia','prisme','orrose','eclair','orage','jadeimperial','lunaire'];
function peintDefisVerifie(enC){if(enC&&!m2Ok())return 0;let s;try{s=m2Etat();}catch(e){return 0;}const c=s.c;
  if(!c.pgv){c.pgv=1;const o=SAVE.d.shop.own,L=c.pg||(c.pg=[]);for(const id of PEINT_EX_SEC){const id2=PEINT_FUSION[id]||id;if(o.indexOf('peinture:'+id2)>=0&&L.indexOf(id2)<0)L.push(id2);}SAVE.mark();} /* les secrètes d'avant, déjà gagnées : l'écran des missions les garde */
  let n=0;for(const d of COSM.peinture){const f=d.def;if(!f||f.k==='b'||f.k==='serie'||shopOwned('peinture',d.id))continue;if(peintDefVal(f)>=peintDefSeuil(f)&&peintGagne(d))n++;}return n;}
/* LES PASTILLES (2026-11-05) : une seule fabrique pour la boutique ; `cosmSwCl` donne la finition (et l'animation d'une légendaire) à toutes les listes */
function peintFond(d,c0){const hx=function(c9){return '#'+((c9>>>0)&0xffffff).toString(16).padStart(6,'0');};return d.mot?motFond(d).replace('center/200% auto','center/100% auto'):d.grad?'linear-gradient(150deg,'+d.grad.map(hx).join(',')+')':hx(d.c!=null?d.c:(c0!=null?c0:0xff7a3a));}
function peintPastille(d,cl,c0){return '<i class="'+cl+cosmSwCl(d)+'" style="background:'+peintFond(d,c0)+'"></i>';}
/* la grande pastille d'une carte de la boutique : la tôle vernie, et pour une peinture à défi pas encore à toi, la cible et sa jauge */
function peintCarte(d){let c0=null;if(d.id==='usine')try{c0=CARS[garageI].color;}catch(e){}let h=peintPastille(d,'bqSw pSw',c0);
  if(d.def&&!shopOwned('peinture',d.id)){const p=peintDefFrac(d);h+='<span class="pDef" title="'+sansAcc(TR(d.def.t)).replace(/"/g,'')+'">'+pxi('cible')+(p>=0?'<u><em style="width:'+Math.round(p*100)+'%"></em></u>':'')+'</span>';}
  return h;}
/* « OU GAGNE-LA » sous le nom de la peinture regardée (#gBqNom) : la phrase du défi, sa jauge (un exploit d'un coup n'en a pas) */
function peintDefHtml(d){const f=d&&d.def;if(!f||shopOwned('peinture',d.id))return '';const v=peintDefVal(f),p=v<0?0:Math.min(1,v/peintDefSeuil(f));
  return '<span class="m2Deb pDeb"><span class="m2DebT">'+pxi('cible')+' '+sansAcc(TR('OU GAGNE-LA'))+' : '+sansAcc(TR(f.t)).toUpperCase()+'</span>'
    +(v<0?'':'<span class="m2DebB"><u><em style="width:'+Math.round(p*100)+'%"></em></u><b>'+peintDefNb(f,v)+'</b></span>')+'</span>';}
window.dbgDefisPeint=function(){return COSM.peinture.filter(function(d){return d.def;}).map(function(d){const v=peintDefVal(d.def);return {id:d.id,r:d.r,defi:d.def.t,val:v,seuil:d.def.k==='b'||d.def.k==='serie'?null:peintDefSeuil(d.def),a:shopOwned('peinture',d.id)};});};
/* ===== LES TRAÎNÉES EN VITRINE (2026-11-05, Sacha : « retravaille la présentation des traînées dans le même esprit » que le nuancier v3) =====
   UNE TABLE, dans l'ordre de la vitrine (TRAINEE_CAT) : la rareté suit le SPECTACLE, le prix monte avec elle (les prix en $ ne bougent pas).
   · COMMUNES    — les RUBANS : un sillage de couleur (NITRO, offerte ; ROSE NÉON) ;
   · RARES       — les PARTICULES : ce qu'on sème (SAKURA, MATRICE, POUDRE D'OR, ANNEAUX D'OR) ;
   · ÉPIQUES     — les EFFETS : un numéro à part entière (WOW, GLOUTON, HYPERESPACE, LA GRILLE) ;
   · LÉGENDAIRES — le SPECTACLE : celles qui ne s'achètent pas comme les autres (FAIS PLEUVOIR, FOUDRE DIVINE par mission, ARC-EN-CIEL avec le chat).
   Ce qui change : POUDRE D'OR épique → rare, WOW légendaire → épique, GLOUTON rare → épique, ARC-EN-CIEL (qui se lisait COMMUNE) → légendaire.
   La carte de la boutique (traineeCarte) montre la traînée EN MOUVEMENT sur une route de nuit : le ruban qui coule hors de la tuyère, ses
   particules qui s'envolent (css/peintures.css, « LES TRAÎNÉES ») — sur le plateau, la caisse ne boost pas : la carte est la seule à la montrer. */
const TRAINEE_CAT=[['nitro','commun'],['rose','commun'],['sakura','rare'],['matrice','rare'],['or','rare'],['anneaux','rare'],
  ['wow','epique'],['glouton','epique'],['hyper','epique'],['grille','epique'],['billets','legendaire'],['foudre','legendaire'],['arcenciel','legendaire']];
Object.assign(I18N,{'RUBANS':'RIBBONS','PARTICULES':'PARTICLES','EFFETS':'EFFECTS','SPECTACLE':'SHOWSTOPPERS'});
const TRAINEE_RANG={};TRAINEE_CAT.forEach(function(e,k){TRAINEE_RANG[e[0]]=k;const d=COSM.trainee.find(function(x){return x.id===e[0];});if(d)d.r=e[1];});
function traineeOrdre(){return COSM.trainee.map(function(d,j){return j;}).sort(function(a,b){const ra=TRAINEE_RANG[COSM.trainee[a].id],rb=TRAINEE_RANG[COSM.trainee[b].id];return (ra!=null?ra:900+a)-(rb!=null?rb:900+b);});}
function traineeCoul(d){if(d.rainbow)return '#ff5ad0';if(d.col)return d.col;if(d.rgb)return 'rgb('+d.rgb.map(function(v){return Math.round(Math.min(1,v/1.45)*255);}).join(',')+')';return '#ff7a1a';}
/* la plaque d'une carte : la nuit, des lignes de vitesse, la tuyère à droite, le ruban qui en coule (aucun pour celles dont l'effet EST la traînée :
   GLOUTON, LA GRILLE), et trois fois son pictogramme qui s'envole */
function traineeCarte(d){let I=null;try{I=illuTr(d);}catch(e){}const ic=I?illuPx(I,'tPx'):'';
  return '<i class="tSw'+(d.rubOff?' sansRuban':'')+(d.rainbow?' arc':'')+'" style="--tc:'+traineeCoul(d)+'"><b class="tRu"></b><b class="tBuse"></b>'+(ic?'<span class="tPa">'+ic+ic+ic+'</span>':'')+'</i>';}
function cosmSwCl(d){return (d.g==='c'?' chrome':d.g==='o'?' or':d.g==='s'?' mat':d.g==='k'?' metal':d.g==='n'?' nacre':'')+(d.anim?' pL pL-'+d.id:'');} /* la classe de finition d'une pastille (une seule table pour toutes les listes) — (2026-11-05) une légendaire : son animation (css/peintures.css) */
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
function shopOwned(cat,id){if(cat==='figure')return figPossede(id);if(cousin()){const c9=COSM[cat].find(x=>x.id===id);if(c9&&((!c9.eur&&(!c9.pack||c9.sec))||cousinTout()))return true;} /* (2026-10-14) LE CODE COUSIN : tous les habillages — (2026-10-24) SAUF ce qui se paie en EUROS (peintures en €, packs PALETTE et CHAT), la règle de Sacha du 14/10 (carEuros) ; les secrètes, gagnables par leur défi, restent offertes ; le reste suit la possession réelle */
const d=COSM[cat].find(x=>x.id===id);if(!d)return false;
  if(d.pack==='chat'&&m2Chat())return true; /* (2026-10-16, missions v2) l'ARC-EN-CIEL vient avec le chat */if(!d.p&&!d.mis&&!d.mis2&&!d.pack&&!d.sec&&!d.eur&&!d.serie)return true;return SAVE.d.shop.own.indexOf(cat+':'+id)>=0;} // (2026-10-14, palette) pack et secrètes : possédées seulement une fois données
function shopEqD(cat){const id=SAVE.d.shop.eq[cat],d=COSM[cat].find(x=>x.id===id);return (d&&shopOwned(cat,d.id))?d:COSM[cat][0];}
/* ===== LES PHOTOS DES CAISSES EN TEINTE D'ORIGINE (2026-11-02, Léo : « quand on va dans les paint des boutiques, ça met toutes les voitures dans ta peinture et on ne peut à peine les distinguer. Enlève-moi ce truc ») =====
   Pendant que le studio photographie une caisse (carPhoto : vignettes de la boutique, de l'inventaire, vue de la fenêtre d'achat), PHOTO_USINE
   est vrai : la caisse porte D'ORIGINE, ni la peinture équipée ni celle qu'on essaie. La caisse qu'on conduit et l'essai en 3D gardent la peinture. */
let PHOTO_USINE=false;
function cosm(cat){if(PHOTO_USINE&&cat==='peinture')return COSM.peinture[0];return (SHOP.prev&&SHOP.prev.cat===cat)?COSM[cat][SHOP.prev.i]:shopEqD(cat);} // ce que la caisse PORTE (essai compris)
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
window.dbgPeintures=function(v){if(v==='voitures')return CARS.map(function(c,i){return {i:i,n:c.name,retire:!!c.retire};});const O=peintOrdre();return COSM.peinture.map(function(d,j){return {j:j,o:O.indexOf(j),id:d.id,n:d.n,r:d.r,eur:d.eur||0,sec:!!d.sec,mot:!!d.mot,grad:!!d.grad,g:d.g||'',c:d.c};});}; // (2026-10-30, banc) la liste des peintures pour la planche
window.dbgHab=function(cat,id){if(!COSM[cat])return null;const i=COSM[cat].findIndex(function(d){return d.id===id;});if(i<0)return 'inconnu'; // (2026-10-14, bancs) PORTER un habillage à l'essai, à toi ou non
  SHOP.prev={cat:cat,i:i};if(garageOn&&cat!=='peinture')SHOP.tab=cat;buildCar(CARS[garageOn?garageI:level]||CARS[0]);
  return {hab:cat+':'+id,rar:cosmRar(cat,COSM[cat][i]),ailes:carWingL?carWingL.children.length:0,anim:BLING.anim.length,fx:FX_EFF?{pop:FX_EFF.pop||null,rubOff:!!FX_EFF.rubOff}:null};};
/* LA PEINTURE entre par la PALETTE : la clé 'p' (la laque, par convention de tous les gabarits du kit) est
   remplacée avant que l'atelier ne coule les facettes. Un dégradé (`grad`) se calcule PAR SOMMET, sur la
   hauteur : du bas de caisse au toit. */
function peintPal(pal){
  const d=cosmSur('peinture');if(!d||d.id==='usine'||!pal||!pal.p)return pal;
  const o=Object.assign({},pal);o.p=d.mot?{g:'pm:'+d.mot,c:MOTIFS[d.mot].mel?pal.p.c:0xffffff,grad:null}:{g:d.g||'p',c:d.c!=null?d.c:d.grad[1],grad:d.grad||null}; // (2026-10-16) un MOTIF : la tôle blanche dans son propre tampon, le motif la colore (voir MOTIFS)
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
