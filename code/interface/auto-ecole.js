/* ============================================================================
   L'AUTO-ÉCOLE — LA PREMIÈRE PARTIE GUIDÉE (2026-09-25)
   ----------------------------------------------------------------------------
   Six gestes, dans l'ordre où le jeu les exige : TOURNER, NITRO, DÉCOLLER (sortir par le bord), VOLER au nitro en guidant au pouce,
   SE POSER, la FIGURE (double-tap NITRO).
   ⚠ LES RÈGLES D'UN BON TUTORIEL, appliquées ici :
     · on apprend EN JOUANT, une idée à la fois — la consigne s'annonce, puis on la FAIT ;
     · une étape se valide par le GESTE lui-même, jamais par un bouton « OK » ;
     · chaque réussite se FÊTE (coche, son, vibration, gerbe de pixels) ;
     · on ne peut PAS mourir : un raté remet la caisse sur la route (même chemin que le BAC À SABLE) ;
     · on ne peut PAS la passer (2026-11-22, Sacha) ; on peut la revoir depuis les réglages.
   Piste : `genTuto()` (dessinée à la main : larges virages, une descente, un looping), ciel nu de l'aurore.
   ========================================================================== */
const TUTO={on:false,i:0,t:0,l:0,r:0,hold:0,air:0,vole:false,fini:0,attente:false};
/* ===== L'AUTO-ÉCOLE v3, PLEIN ÉCRAN (2026-11-22, Sacha : « il faut une refonte ultra poussée du tuto […] là il y a juste une putain de fenêtre et on peut
   skip trop rapidement […] faudra pas qu'on puisse le skip […] des trucs qui prennent tout l'écran, des jolies animations 3D avec des pouces en pixels […]
   quand tu dois tourner, quand tu dois sortir, un grand truc sur l'écran en transparent avec un pouce ») =====
   Plus de carte ni de bouton PASSER. Un calque PLEIN ÉCRAN, transparent, par-dessus la course (`#ecole`, pointer-events:none : il ne prend JAMAIS un doigt) :
     · l'ACCUEIL (une fois) : « AUTO-ÉCOLE », les six gestes en tuiles, « ici, impossible de perdre » ;
     · pour chaque geste, une CARTE-TITRE (2 s : « 1/6 », le mot géant en relief, une phrase) pendant laquelle le jeu n'exige rien ni ne reproche rien ;
     · puis le CALQUE DU GESTE : un grand POUCE en pixels (ou les TOUCHES du clavier sur l'ordinateur) fait le geste EN GRAND, à l'endroit réel de la commande
       (le volant, le bouton NITRO, les flèches), avec ses flèches géantes translucides ; le rappel (mot + phrase) reste en haut, dans le ciel. Dès que le joueur
       agit, le pouce s'estompe ; s'il ne fait plus rien, il revient ; s'il n'y arrive pas, il se relance ;
     · la RÉUSSITE en grand (l'éloge, la coche qui tourne, la gerbe) ; un RATÉ se dit en grand, gentiment, avec la manière de réussir ;
     · la progression : six tuiles discrètes en haut, toujours visibles ;
     · à la fin, le PERMIS en plein écran (la carte qui tourne, le tampon, la prime).
   Tout ce qui bouge est en transform/opacity (iPhone chaud, mode économie) ; le relief est du CSS 3D sur des pixels (SVG crispEdges) ; rien ne tourne une fois la
   leçon finie (le calque est RETIRÉ du document). Les *mots* entre étoiles sont surlignés, les [touches] dessinées. */
const TUTO_ETAPES=[
  {ico:'volant',t:'TOURNE',  d:'Glisse ton *pouce* à gauche, puis à droite', dk:'Flèches [←] puis [→]', geste:'glisse', bravo:'BIEN !',
    get g(){return tutoTouche()&&typeof TCTL!=='undefined'&&TCTL.pad?'fleches':'glisse';}},
  {ico:'eclair',t:'NITRO',   d:'Garde le doigt sur *NITRO*', dk:'Maintiens [ESPACE]', geste:'nitro', g:'nitro', bravo:'PARFAIT !'},
  {ico:'rampe', t:'DÉCOLLE', d:'Sors de la route *par le bord* !', dk:'Sors de la route *par le bord* !', geste:'bord', g:'bord', bravo:'ÇA DÉCOLLE !'},
  {ico:'eclair',t:'VOLE',    d:'En l\'air, garde *NITRO* et reviens sur la route', dk:'En l\'air, tiens [ESPACE] et reviens sur la route', geste:'nitro', g:'vole', bravo:'TU VOLES !'},
  {ico:'cible', t:'POSE-TOI',d:'Vise *l\'anneau* sur la route. Doré = parfait !', dk:'Vise *l\'anneau* sur la route. Doré = parfait !', geste:'pose', g:'pose', bravo:'POSÉ !'},
  {ico:'rotation',t:'FIGURE',get d(){return figGlisseOn()?'Pose le pouce sur *NITRO*, glisse, lâche':'Tape *2 fois* vite sur *NITRO*';}, dk:'Tape *2 fois* vite sur [ESPACE]', geste:'figure',
    get g(){return figGlisseOn()&&tutoTouche()?'glisseN':'double';}, bravo:'STYLÉ !'} /* (2026-10-15) FIGURES › GLISSER : la consigne et le pouce suivent le réglage */
];
/* LES MOTS (FR → EN) de la leçon v3 — posés ici : le calque est le seul à les dire */
Object.assign(I18N,{'TOURNE':'STEER','NITRO':'NITRO','DÉCOLLE':'TAKE OFF','VOLE':'FLY','POSE-TOI':'LAND IT','FIGURE':'TRICK',
  'BIEN !':'NICE!','PARFAIT !':'PERFECT!','ÇA DÉCOLLE !':'LIFTOFF!','TU VOLES !':"YOU'RE FLYING!",'POSÉ !':'LANDED!','STYLÉ !':'STYLISH!',
  'Glisse ton *pouce* à gauche, puis à droite':'Slide your *thumb* left, then right','Flèches [←] puis [→]':'Arrows [←] then [→]',
  'Appuie sur la flèche *gauche*, puis la *droite*':'Press the *left* arrow, then the *right* one',
  'Garde le doigt sur *NITRO*':'Keep your finger on *NITRO*','Maintiens [ESPACE]':'Hold [SPACE]',
  'Sors de la route *par le bord* !':'Drive off the road *over the edge*!',
  'En l\'air, garde *NITRO* et reviens sur la route':'In the air, hold *NITRO* and steer back over the road',
  'En l\'air, tiens [ESPACE] et reviens sur la route':'In the air, hold [SPACE] and steer back over the road',
  'Vise *l\'anneau* sur la route. Doré = parfait !':'Aim for *the ring* on the road. Gold = perfect!',
  'Pose le pouce sur *NITRO*, glisse, lâche':'Thumb on *NITRO*, slide, release','Tape *2 fois* vite sur *NITRO*':'Tap *NITRO* *twice*, fast',
  'Tape *2 fois* vite sur [ESPACE]':'Tap [SPACE] *twice*, fast',
  'AUTO-ÉCOLE':'DRIVING SCHOOL','6 gestes pour piloter':'6 moves to master','Ici, *impossible de perdre* !':"Here, *you can't lose*!",
  'ON CONTINUE !':'MOVING ON!','PRESQUE !':'ALMOST!','OUPS !':'OOPS!','PAS GRAVE !':'NO WORRIES!','ENCORE UNE FOIS !':'ONE MORE TIME!',
  'Te revoilà sur la route : *reste dessus*':"Back on the road: *stay on it*",'En l\'air, garde *NITRO* appuyé':'In the air, keep *NITRO* pressed',
  'En l\'air, tiens [ESPACE]':'In the air, hold [SPACE]','Garde *NITRO* et vise *le dessus* de la route':'Hold *NITRO* and aim *above* the road',
  'Tiens [ESPACE] et vise *le dessus* de la route':'Hold [SPACE] and aim *above* the road','On reprend ce geste':"Let's do that move again",
  'GLISSE !':'SLIDE!','TIENS !':'HOLD!','×2':'×2','ESPACE':'SPACE',
  'PERMIS OBTENU !':'LICENSE EARNED!','PERMIS DE CONDUIRE':'DRIVING LICENSE','CATÉGORIE':'CLASS','CIEL':'SKY','VALIDÉ':'APPROVED','PRIME':'BONUS',
  'TU ES PRÊT !':"YOU'RE READY!",'Maintenant, une seule vie.':'From now on, one life.'});
/* UN RATÉ SE DIT GENTIMENT : le message d'origine (les appelants, ici et dans seconde-chance.js) → un titre doux et la manière de réussir */
const TUTO_RATES={
  'SORTI ! SUIS LA ROUTE':{t:'OUPS !',d:'Te revoilà sur la route : *reste dessus*'},
  'ENCORE ! NITRO EN L\'AIR':{t:'PRESQUE !',d:'En l\'air, garde *NITRO* appuyé',dk:'En l\'air, tiens [ESPACE]'},
  'RATÉ ! NITRO, VISE LE DESSUS':{t:'PRESQUE !',d:'Garde *NITRO* et vise *le dessus* de la route',dk:'Tiens [ESPACE] et vise *le dessus* de la route'},
  'RATÉ ! ON RECOMMENCE':{t:'PAS GRAVE !',d:'On reprend ce geste'},
  'TAPE 2 FOIS VITE SUR NITRO':{t:'ENCORE UNE FOIS !',d:'Tape *2 fois* vite sur *NITRO*',dk:'Tape *2 fois* vite sur [ESPACE]'},
  'GLISSE DEPUIS NITRO, LACHE':{t:'ENCORE UNE FOIS !',d:'Pose le pouce sur *NITRO*, glisse, lâche'}};
function tutoTouche(){return document.body.classList.contains('touch')&&!PC_CLAVIER;} /* (2026-11-16) la vraie version PC : les consignes au clavier — au doigt (téléphone) ou au clavier */
function tutoMarque(s){ /* « *mot* » → surligné, « [touche] » → une touche ; le reste est échappé */
  return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];})
    .replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]/g,function(m,k){return '<kbd>'+TR(k)+'</kbd>';}).replace(/ ([!?:;])/g,'&nbsp;$1');} /* (2026-11-09, chasse) l'espace avant ! ? : ; ne se coupe plus */
function tutoTxt(E){return tutoTouche()&&E.geste==='glisse'&&typeof TCTL!=='undefined'&&TCTL.pad?'Appuie sur la flèche *gauche*, puis la *droite*':(tutoTouche()||!E.dk?E.d:E.dk);} /* (2026-11-12, S-02) COMMANDES = FLÈCHES : la consigne ne demande plus un glissé du pouce */
/* ---------- LES PIXELS : une grille de caractères → un SVG net (une ligne de même couleur = un seul rectangle) ---------- */
/* (2026-11-22, finitions, Sacha : « des pouces en pixels », « magnifique ») LA PEAU DU POUCE : cinq tons chauds pour le volume (o le contour d'encre, d l'ombre profonde, s l'ombre,
   m le ton moyen, l la lumière, h le reflet) et l'ongle (p son bord, q son ombre, n sa nacre, w son éclat). Une peau PÊCHE, claire : posé sur le bouton NITRO (une boule de feu
   orange à l'ongle jaune), le pouce de la leçon ne se confond pas avec lui. */
const EC_PAL={o:'#190d35',d:'#b2573a',s:'#e58f63',m:'#f9bd8e',l:'#ffdcb8',h:'#fff4e2',n:'#ffe6e4',q:'#ffc9c6',p:'#ef9d98',w:'#ffffff'};
function ecSvg(G,pal,cls,mono,fondu){ /* fondu : les n dernières lignes s'estompent (le poignet du pouce se fond, pas de bord coupé net) — une opacité FIXE par rectangle */
  const L=G.split('|'),W=L.reduce(function(m,r){return Math.max(m,r.length);},0),H=L.length;let r='';
  for(let y=0;y<H;y++){let x=0;const l=L[y];while(x<l.length){const ch=l[x];if(ch==='.'){x++;continue;}let x2=x;while(x2<l.length&&l[x2]===ch)x2++;
    r+='<rect x="'+x+'" y="'+y+'" width="'+(x2-x)+'" height="1" fill="'+(mono||pal[ch]||'#fff')+'"'+(fondu&&y>=H-fondu?' opacity="'+((H-y)/(fondu+1)).toFixed(2)+'"':'')+'/>';x=x2;}}
  return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'" shape-rendering="crispEdges" aria-hidden="true">'+r+'</svg>';}
/* LE POUCE GÉANT (24 × 28) — (2026-11-22, finitions, Sacha : « des pouces en pixels », le doigt blanc plat se lisait « botte » ou « gant ») un VRAI pouce vu de dessus, en
   relief : le bout large et arrondi, le grand ongle nacré à l'éclat blanc, la pulpe bombée, la taille au pli de la phalange (deux plis en creux, leur bourrelet clair dessous),
   un doigt TRAPU et un peu cambré (un pouce, pas un index), puis la base qui s'élargit vers la paume (à droite ; `#ecole.mG` le retourne quand la main vient de la gauche) et se FOND (EC_FONDU lignes estompées : le
   pouce continue hors du dessin, pas de semelle). La lumière vient d'en haut à gauche : reflet et lumière à gauche, ombre puis ombre profonde à droite. Le bout du doigt est en
   (9, 0) — le même point d'ancrage à l'écran qu'avant (.e3Sv) : les animations n'ont pas bougé. Choisi sur planche agrandie parmi dix essais. */
const EC_MAIN='.....oooooooo...........|...oohlllllssoo.........|..olhppppppppsdo........|.olhpnnwwnnnqpsdo.......|.olhpnwwnnnnqpsdo.......|.olhpnwnnnnnqpsdo.......|.olhpnnnnnnnqpsdo.......|.olhpnnnnnnnqpsdo.......|.olhpnnnnnnqqpsdo.......|..olhpnnnnqqqpsdo.......|..olhspqqqqqpssdo.......|..olhlsppppppssdo.......|...olhlmmmmmmssdo.......|...olhlmmmmmmssdo.......|....olhdddddddddo.......|....olhlllllllldo.......|....olhlmdddddsdo.......|....olhlmlllllssdo......|....olhlmmmmmmssdo......|....olhllmmmmmmssdo.....|....olhllmmmmmmsssdo....|...olhllmmmmmmmmsssdo...|...olhllsssssssmmsssdo..|...olhlllllllllmmsssdo..|..olhlllmmmmmmmmmmsssdo.|..olhlllmmmmmmmmmmsssdo.|..olhlllmmmmmmmmmmsssdo.|..olhlllmmmmmmmmmmsssdo.',EC_FONDU=4;
/* la flèche pleine du volant (10 × 9) et le chevron doré des grandes traînées (8 × 13), contour d'encre compris */
const EC_FLG='....oo....|...owo....|..owwooooo|.owwwwwwwo|owwwwwwwwo|.owwwwwwwo|..owwooooo|...owo....|....oo....';
const EC_CHEV='oo......|owo.....|owwo....|oywwo...|.oywwo..|..oywwo.|...oywwo|..oywwo.|.oywwo..|oywwo...|owwo....|owo.....|oo......';
function ecMiroir(G){return G.split('|').map(function(l){return l.split('').reverse().join('');}).join('|');}
const EC={el:null,n:{},ph:'',g:'',gen:0,pos:{},calme:0,rel:0,j:-1,okL:0,okR:0};
function ecK(){return Math.min(innerWidth,innerHeight)<500?5:6;} /* la taille d'un pixel du pouce : 120 × 140 sur un téléphone, 144 × 168 au-delà */
function ecMonte(){
  if(EC.el&&EC.el.isConnected)return EC.el;
  const e=document.createElement('div');e.id='ecole';e.setAttribute('role','status');e.setAttribute('aria-live','polite');
  const main=ecSvg(EC_MAIN,EC_PAL,'e3Sv','',EC_FONDU),ombre=ecSvg(EC_MAIN,EC_PAL,'e3Sv',EC_PAL.o,EC_FONDU),chev=ecSvg(EC_CHEV,{o:'#190d35',w:'#ffd75e',y:'#fff4b8'},'e3Ch');
  const chevs='<span class="e3C c1">'+chev+'</span><span class="e3C c2">'+chev+'</span><span class="e3C c3">'+chev+'</span>';
  e.innerHTML='<div class="e3Voile"></div><div class="e3Haut"></div>'
    +'<div class="e3Prog" aria-hidden="true"></div>'
    +'<div class="e3Scene" aria-hidden="true">'
      +'<div class="e3Piste"><div class="e3Rail"></div>'+ecSvg(EC_FLG,{o:'#190d35',w:'#ffffff'},'e3Fl g')+ecSvg(ecMiroir(EC_FLG),{o:'#190d35',w:'#ffffff'},'e3Fl d')+'</div>'
      +'<div class="e3Chevs"><div class="e3Cw">'+chevs+'</div></div>'
      +'<div class="e3Nit"><span class="e3Onde o1"></span><span class="e3Onde o2"></span><span class="e3Onde o3"></span>'
        +'<div class="e3Jauge"><span class="e3JL"></span><span class="e3JF"></span></div><span class="e3X2">×2</span><span class="e3Gl">'+chev+'</span></div>'
      +'<div class="e3Main"><div class="e3Mvt f2"><div class="e3Pose"><div class="e3Doigt">'+main+'</div></div></div><div class="e3Mvt f1"><div class="e3Pose"><div class="e3Doigt">'+main+'</div></div></div>'
        +'<div class="e3Mvt"><div class="e3Pose"><div class="e3Ombre">'+ombre+'</div><div class="e3Doigt">'+main+'<span class="e3Tap"></span></div></div></div></div>'
      +'<div class="e3Kbd"><div class="e3Fle"><span class="e3K l"><span class="e3Kc">◄</span></span><span class="e3K r"><span class="e3Kc">►</span></span></div>'
        +'<div class="e3Esp"><span class="e3K esp"><span class="e3Kc"></span></span></div></div>'
    +'</div>'
    +'<div class="e3Rappel"><span class="e3RMot"></span><span class="e3RPh"></span></div>'
    +'<div class="e3Carte"><div class="e3Tuile"><span class="e3TuF"></span></div><span class="e3Num"></span><span class="e3Mot"></span><span class="e3Ph"></span></div>'
    +'<div class="e3Acc"><span class="e3AMot"></span><span class="e3ASous"></span><div class="e3ATu"></div><span class="e3APh"></span></div>'
    +'<div class="e3Fete"><div class="e3Rayons"></div><div class="e3Badge"><span class="e3BF"></span></div><span class="e3FMot"></span><span class="e3FPh"></span></div>';
  document.body.appendChild(e);EC.el=e;EC.n={};
  ['e3Prog','e3Scene','e3Piste','e3Chevs','e3Nit','e3Main','e3JF','e3RMot','e3RPh','e3Num','e3Mot','e3Ph','e3TuF','e3AMot','e3ASous','e3ATu','e3APh','e3Fete','e3BF','e3FMot','e3FPh','e3Rayons'].forEach(function(k){EC.n[k]=e.querySelector('.'+k);});
  e.querySelector('.e3Esp .e3Kc').textContent=TR('ESPACE');e.querySelector('.e3JL').textContent=TR('TIENS !');
  EC.n.e3Rayons.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
  e.classList.toggle('pc',!tutoTouche());EC.pos={};
  return e;}
function ecRetire(){if(EC.el){EC.el.remove();}EC.el=null;EC.n={};EC.ph='';EC.g='';}
/* LE MOT GÉANT : lettre par lettre (--i : le retard de chaque lettre), sa taille selon sa longueur et la largeur de l'écran */
function ecMot(el,mot,max){
  mot=String(mot);const n=Math.max(4,mot.length),w=Math.min(innerWidth,780)-36;
  el.style.fontSize=Math.max(18,Math.min(max,Math.floor(w/(n*1.06))))+'px';
  el.innerHTML=mot.split('').map(function(ch,i){return ch===' '?'<span class="l e"></span>':'<span class="l" style="--i:'+i+'">'+ch.replace(/[&<>]/g,'')+'</span>';}).join('');
  el.setAttribute('aria-label',mot);}
function ecGrand(){return innerHeight>=520;} /* debout (ou un grand écran) : les grandes tailles ; couché sur un téléphone : on tient dans 390 px de haut */
function ecProg(vient){ /* les six tuiles : faites (vert, coche), celle en cours (or), à venir (sombres) ; `vient` = celle qui vient de se remplir */
  if(!EC.n.e3Prog)return;
  EC.n.e3Prog.innerHTML=TUTO_ETAPES.map(function(x,j){return '<span class="e3Pp'+(j<TUTO.i?' ok':j===TUTO.i?' on':'')+(j===vient?' vient':'')+'">'+(j<TUTO.i?pxi('coche'):pxi(x.ico))+'</span>';}).join('');}
function ecPhase(ph){
  const e=ecMonte();EC.ph=ph;e.dataset.ph=ph;
  e.classList.toggle('on',!!ph);
  if(ph!=='geste'){e.classList.remove('joue','relance');EC.calme=0;}
}
/* LE GESTE MONTRÉ : la mise en scène suit l'étape (data-g) — le pouce, ses flèches, ses ondes, ou les touches du clavier */
function ecGeste(E){
  const e=ecMonte(),g=E?E.g:'';EC.g=g;e.dataset.g=g;e.classList.toggle('pc',!tutoTouche());
  e.classList.remove('okL','okR','jPleine','annonce');EC.okL=EC.okR=0;EC.j=-1;EC.rel=0;if(EC.n.e3JF)EC.n.e3JF.style.transform='scaleX(0)';
  const sc=EC.n.e3Scene;sc.style.animation='none';void sc.offsetWidth;sc.style.animation=''; /* chaque mise en scène repart du début */
  ecPlace(true);}
/* LES ENDROITS RÉELS DES COMMANDES : le volant (le stick sous le doigt, sinon le cercle en pointillés), le bouton NITRO, les flèches du pavé, la caisse à l'écran */
const EC_V=new THREE.Vector3();
function ecRect(id){const x=document.getElementById(id);if(!x)return null;const r=x.getBoundingClientRect();if(r.width<4||r.height<4)return null;return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
function ecVolant(){
  const st=document.getElementById('tStick'),sv=document.getElementById('tSteer');
  if(st&&+getComputedStyle(st).opacity>.05){const r=st.getBoundingClientRect();if(r.width>4)return {x:r.left+r.width/2,y:r.top+r.height/2};}
  if(sv){const r=sv.getBoundingClientRect(),a=getComputedStyle(sv,'::after'),w=parseFloat(a.width),h=parseFloat(a.height),l=parseFloat(a.left),tp=parseFloat(a.top);
    if(r.width>4&&a.content!=='none'&&isFinite(w)&&isFinite(l)&&isFinite(tp))return {x:r.left+l+w/2,y:r.top+tp+h/2};
    /* (2026-11-22, contrôle au doigt) #tSteer couvre TOUT l'écran : « 40 % de sa largeur » posait la piste sur la caisse (couché) et sur NITRO (gaucher). La zone du
       pouce qui conduit : 22 % de la largeur couché, 35 % debout — de l'autre côté en main gauche. */
    if(r.width>4){const f=innerWidth>innerHeight&&innerHeight<=540?.22:.35;return {x:r.left+r.width*(document.body.classList.contains('gaucher')?1-f:f),y:r.top+r.height*(innerHeight>innerWidth?.8:.72)};}} /* debout, sous la caisse (à 72 % la piste barrait ses feux) */
  return {x:innerWidth*.3,y:innerHeight*.76};}
function ecCaisse(){
  try{EC_V.copy(carGroup.position).project(camera);const r=renderer.domElement.getBoundingClientRect();
    if(EC_V.z<1&&isFinite(EC_V.x))return {x:r.left+(EC_V.x+1)/2*r.width,y:r.top+(1-EC_V.y)/2*r.height};}catch(x){}
  return {x:innerWidth/2,y:innerHeight*.62};}
function ecTrans(el,x,y,cle){const k=Math.round(x)+','+Math.round(y);if(EC.pos[cle]===k)return;EC.pos[cle]=k;el.style.transform='translate3d('+Math.round(x)+'px,'+Math.round(y)+'px,0)';}
function ecPlace(force){
  if(!EC.el||!EC.g)return;if(force)EC.pos={};
  const g=EC.g,e=EC.el;
  const C=ecCaisse();
  /* DÉCOLLE : vers le bord le plus proche de la caisse à l'écran ; les chevrons restent dans l'écran */
  if(force||!EC.bd){EC.bd=C.x>=innerWidth/2?1:-1;e.classList.toggle('bG',EC.bd<0);e.style.setProperty('--sgn',EC.bd);} /* fixé à l'entrée de l'étape : le pouce ne change pas de sens en route */
  const bd=EC.bd;
  const cx=g==='bord'?(bd>0?Math.min(C.x,innerWidth-225):Math.max(C.x,225)):C.x;
  /* VOLE / POSE-TOI : les chevrons au-dessus de la caisse ne montent jamais sur le rappel (une caisse haute à l'écran les y poussait) */
  let cy=g==='bord'?C.y-50:C.y,cxv=cx;
  if(g==='vole'||g==='pose'){let rb=0;try{const r=EC.el.querySelector('.e3Rappel').getBoundingClientRect();rb=r.bottom;}catch(x){}
    /* (2026-11-22, contrôle au doigt) POSE-TOI : les chevrons montrent LA ROUTE (le point de bitume le plus proche, projeté à l'écran), plus « le bas de l'écran » :
       pour le débutant qui vole à côté, ils pointaient le vide. Au-dessus du bitume (ou sans radar) : vers le bas, comme avant. Par pas de 15°. */
    let ang=90;
    if(g==='pose'){try{const bi=tryLand._bi;
      if(mode==='fall'&&curNear&&bi>=0&&Nn[bi]&&B[bi]&&(Math.abs(curLatOff)>ROAD_HALF||curHOff<0)){
        EC_V.copy(fallPos).addScaledVector(Nn[bi],-curHOff).addScaledVector(B[bi],-curLatOff).project(camera);
        const r=renderer.domElement.getBoundingClientRect(),dx=r.left+(EC_V.x+1)/2*r.width-C.x,dy=r.top+(1-EC_V.y)/2*r.height-C.y;
        if(EC_V.z<1&&isFinite(dx)&&isFinite(dy)&&dx*dx+dy*dy>900)ang=Math.round(Math.atan2(dy,dx)*180/Math.PI/15)*15;}}catch(x){}
      const a0=EC.ang==null||force?90:EC.ang;EC.ang=a0+((((ang-a0)%360)+540)%360-180); /* le plus court chemin : jamais un tour complet pour 15° */
      if(EC.pos.an!==EC.ang){EC.pos.an=EC.ang;e.style.setProperty('--ang',EC.ang+'deg');}}
    /* couché sur un téléphone : la caisse est haute dans un écran de 390 px — bornés sous le rappel, les chevrons tombaient SUR elle. Ils passent À CÔTÉ (du côté
       opposé à NITRO). Debout : bornés sous le rappel, comme avant. */
    const droit=g==='vole'||ang===90;
    /* (2026-11-22, finitions) l'ORDINATEUR au clavier aussi : la caisse y est grande, les chevrons tombaient dessus et mordaient la consigne — à côté d'elle, d'un cinquième de la fenêtre */
    const pc=!tutoTouche();
    if((!ecGrand()||pc)&&droit){const N0=ecRect('tNitro');cxv=C.x+(N0&&N0.x<innerWidth/2?1:-1)*(pc?Math.max(150,innerWidth*.2):Math.min(150,innerWidth*.2));cy=Math.max(cy,rb+(g==='vole'?(pc?215:200):(pc?255:240)));}
    else if(droit)cy=Math.max(cy,rb+(g==='vole'?185:245));}
  if(!tutoTouche()){ecTrans(EC.n.e3Chevs,cxv,cy,'ch');return;} /* au clavier : les touches ont leur place fixe (CSS), seules les traînées suivent la caisse */
  const S=ecVolant(),N=ecRect('tNitro')||{x:innerWidth-70,y:innerHeight-90,w:90,h:90};
  const k=ecK();let demi=Math.max(60,Math.min(ecGrand()?150:104,innerWidth*.28)); /* (2026-11-22) couché sur un téléphone : 104 (120 : la flèche du côté de la caisse, qui bat de 8 px, mordait encore sa boîte de 6 px — mesuré) */
  /* (2026-11-22, finitions) LA PISTE TIENT ENTIÈRE DANS L'ÉCRAN, FLÈCHES COMPRISES : on bornait le RAIL à 12 px du bord, mais ses flèches sont posées 9 cases plus loin et battent de
     8 px (.e3Fl) — celle du côté du bord sortait de l'écran (debout : x −21 ; gaucher : 427 sur 390). La place libre : de 8 px du bord à 8 px du bord, moins le bouton NITRO s'il
     est à la hauteur de la piste ; si elle manque, c'est le rail qui raccourcit (la course du pouce avec lui), jamais une flèche qui sort. */
  const fl=k*9+8;let lo=8,hi=innerWidth-8;
  if(N.y+N.h/2>S.y-k*5&&N.y-N.h/2<S.y+k*5){if(N.x>S.x)hi=Math.min(hi,N.x-N.w/2-8);else lo=Math.max(lo,N.x+N.w/2+8);}
  demi=Math.max(36,Math.min(demi,(hi-lo)/2-fl));
  e.style.setProperty('--k',k);e.style.setProperty('--nw',Math.round(Math.max(60,Math.min(130,N.w)))+'px');
  let M=S;
  if(g==='fleches'){const L=ecRect('tLeft')||{x:S.x-50,y:S.y},R=ecRect('tRight')||{x:S.x+50,y:S.y};M=L;e.style.setProperty('--dx',Math.round(R.x-L.x)+'px');e.style.setProperty('--dy',Math.round(R.y-L.y)+'px');}
  else if(g==='nitro'||g==='vole'||g==='double'||g==='glisseN')M=N;
  e.style.setProperty('--a',Math.round(Math.max(20,demi-34))+'px');e.style.setProperty('--pw',Math.round(demi*2)+'px');
  /* le volant ne déborde jamais de l'écran : la piste reste entière, le pouce à l'intérieur */
  const sx=Math.max(lo+demi+fl,Math.min(hi-demi-fl,S.x));
  /* NITRO d'un côté ou de l'autre (le mode gaucher le met à gauche) : le pouce arrive du côté de l'écran, la jauge et le ×2 restent dans l'écran */
  const nD=N.x>innerWidth/2;e.classList.toggle('nD',nD);e.classList.toggle('nG',!nD);
  e.classList.toggle('mG',M===N?!nD:S.x<innerWidth/2); /* le pouce vient du côté de SA commande : la paume vers ce bord (le dessin se retourne) */
  e.style.setProperty('--jx',Math.round(Math.max(14-N.x,Math.min(-62,innerWidth-14-N.x-124)))+'px');
  ecTrans(EC.n.e3Piste,sx,S.y,'pi');
  ecTrans(EC.n.e3Main,g==='glisse'||g==='bord'||g==='pose'?sx:M.x,M.y,'ma');
  ecTrans(EC.n.e3Nit,N.x,N.y,'ni');
  ecTrans(EC.n.e3Chevs,cxv,cy,'ch');
}
addEventListener('resize',function(){if(EC.el&&EC.ph){ecPlace(true);const E=TUTO_ETAPES[TUTO.i];if(E&&EC.n.e3RMot)ecMot(EC.n.e3RMot,TR(E.t),ecGrand()?30:22);}});
/* les minuteurs de la leçon : un seul fil (EC.gen) — RECOMMENCER, QUITTER ou la fin de la leçon rendent les anciens caducs ; en PAUSE ils attendent la reprise */
function ecPlus(ms,f){const g=EC.gen;const go=function(){if(g!==EC.gen||!(TUTO.on&&started&&!gameOver&&!TUTO.attente))return;if(paused){setTimeout(go,200);return;}f();};setTimeout(go,ms);}
function ecGerbe(n,cols,x,y){ /* la gerbe de pixels du calque (carrés de 8 px sur une grille de 2), retirée au bout de 0,9 s */
  if(REDUCED_MOTION||!EC.el)return;const box=EC.el;
  for(let i=0;i<n;i++){const p=document.createElement('i');p.className='e3Px';const a=i/n*6.2832+Math.random()*.4,d=90+Math.random()*120;
    p.style.left=x+'px';p.style.top=y+'px';p.style.background=cols[i%cols.length];
    p.style.setProperty('--dx',(Math.round(Math.cos(a)*d/2)*2)+'px');p.style.setProperty('--dy',(Math.round((Math.sin(a)*d*.8-20)/2)*2)+'px');
    box.appendChild(p);setTimeout(function(){p.remove();},950);}}
function tutoAffiche(msg){ /* msg (facultatif) : un raté, dit en grand et gentiment, puis le calque du geste revient */
  msg=typeof msg==='string'?msg:'';
  if(!TUTO.on)return;
  const E=TUTO_ETAPES[TUTO.i];if(!E)return; /* (leçon finie : la caisse attend de se poser — plus de consigne à montrer) */
  ecMonte();EC.gen++;
  /* L'ACCUEIL (une fois) : « AUTO-ÉCOLE », les six gestes, « impossible de perdre » — 3,3 s (finitions : tout est arrivé à 1,1 s, il reste 2,2 s pour lire ; à 2,6 s la phrase n'était lisible que 1,2 s), pendant lesquelles la leçon n'exige rien */
  if(TUTO.i===0&&!TUTO.accueilVu&&!msg){TUTO.accueilVu=1;
    ecMot(EC.n.e3AMot,TR('AUTO-ÉCOLE'),ecGrand()?40:30);EC.n.e3ASous.innerHTML=tutoMarque(TR('6 gestes pour piloter'));EC.n.e3APh.innerHTML=tutoMarque(TR('Ici, *impossible de perdre* !'));
    EC.n.e3ATu.innerHTML=TUTO_ETAPES.map(function(x,j){return '<span class="e3At" style="--i:'+j+'"><b>'+(j+1)+'</b>'+pxi(x.ico)+'</span>';}).join('');
    ecGeste(null);ecPhase('accueil');ecProg(-1);
    try{sfx('tuto.info');}catch(x){}
    ecPlus(3300,function(){tutoAffiche();});return;}
  ecGeste(E);ecProg(-1);
  ecMot(EC.n.e3RMot,TR(E.t),ecGrand()?30:22);EC.n.e3RPh.innerHTML=tutoMarque(TR(tutoTxt(E)));
  if(E.geste==='figure')TUTO.p0=tutoPayees(); /* (v2) le compteur des figures PLANTÉES à l'entrée de l'étape (FIGURES v2 de GAMEPLAY) */
  tutoPlein(E); /* le PLEIN, offert : on apprend sans compter */
  if(msg){ /* LE RATÉ : un titre doux, la manière de réussir, et le pouce qui remontre le geste */
    const R=TUTO_RATES[msg]||{t:'PRESQUE !',d:msg};
    ecMot(EC.n.e3FMot,TR(R.t),ecGrand()?44:32);EC.n.e3FPh.innerHTML=tutoMarque(TR(!tutoTouche()&&R.dk?R.dk:R.d));
    EC.n.e3BF.innerHTML=pxi('coeur');
    ecPhase('rate');hap(14);ecRayons(null);
    try{sfx('tuto.rate');}catch(x){}
    ecPlus(2400,function(){tutoPlein(E);ecPhase('geste');});return;}
  /* (2026-11-22, contrôle au doigt : « DÉCOLLE → VOLE → mort en boucle ») UNE ÉTAPE ATTEINTE EN PLEIN VOL (VOLE, POSE-TOI) N'A PAS DE CARTE-TITRE : 2 s de lecture en
     chute libre (après 1,15 s de bravo), c'était la caisse à 100 m sous la route avant même la consigne, et l'explosion 1,5 s plus tard — en boucle. Le geste se
     demande TOUT DE SUITE (le pouce sur NITRO, les chevrons, le rappel) ; le mot du rappel arrive en grand puis se range (`.annonce`). */
  if((TUTO.i===3||TUTO.i===4)&&mode==='fall'){
    EC.el.classList.add('annonce');ecPhase('geste');TUTO.t=0;
    try{sfx('tuto.info');}catch(x){}return;}
  /* LA CARTE-TITRE : « 1/6 », la tuile du geste qui tourne, le mot géant, la phrase — 2 s, le pouce fait déjà le geste à sa place */
  EC.n.e3Num.textContent=(TUTO.i+1)+'/'+TUTO_ETAPES.length;ecMot(EC.n.e3Mot,TR(E.t),ecGrand()?64:46);EC.n.e3Ph.innerHTML=tutoMarque(TR(tutoTxt(E)));
  EC.n.e3TuF.innerHTML=pxi(E.ico);
  ecPhase('titre');
  try{sfx('tuto.info');}catch(x){} /* la consigne sonne son « ding » */
  ecPlus(2000,function(){tutoPlein(E);ecPhase('geste');TUTO.t=0;}); /* (2026-11-22) le plein est REDONNÉ à l'entrée du geste : NITRO tenu pendant la carte (le pouce y est déjà posé) vidait la réserve avant que le geste compte */
}
/* (2026-11-22, finitions) couché sur un téléphone, la coche et le mot du bravo sont CÔTE À CÔTE (ecole.css) : les rayons partent du centre de la coche, où qu'elle soit */
function ecRayons(r){const y=EC.n.e3Rayons,f=EC.n.e3Fete;if(!y||!f)return;
  if(!r||ecGrand()){y.style.left=y.style.top='';return;}
  const b=f.getBoundingClientRect();y.style.left=Math.round(r.left+r.width/2-b.left)+'px';y.style.top=Math.round(r.top+r.height/2-b.top)+'px';}
function tutoPlein(E){if(E&&(E.geste==='nitro'||E.geste==='figure')){nitroR=Math.max(nitroR,(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2);nitroGain(.01,'ecole');}}
/* (2026-11-22, contrôle au doigt) LA MORT PENDANT LA LEÇON (endGame, seconde-chance.js, après le replacement) : à VOLE et POSE-TOI elle COMPTE comme un raté — au 2e,
   l'étape est ACCORDÉE (comme le fait déjà le délai de 9 s en vol) : sans bouton PASSER, le débutant qui ne sait pas revenir sur la route tournait sans fin
   DÉCOLLE → VOLE → explosion. Et le raté dit QUOI faire (« En l'air, garde NITRO appuyé »), plus « On reprend ce geste ». */
function tutoMort(){
  if(TUTO.i>=TUTO_ETAPES.length)return;
  if(TUTO.i>=3&&TUTO.i<5){const m=TUTO.i===3?'ENCORE ! NITRO EN L\'AIR':'RATÉ ! NITRO, VISE LE DESSUS';
    TUTO.rates=(TUTO.rates|0)+1;TUTO.air=0;TUTO.t=0;
    if(TUTO.rates>=2){TUTO.i=4;tutoBravo('ON CONTINUE !');return;}
    TUTO.i=2;tutoAffiche(m);return;}
  tutoAffiche('RATÉ ! ON RECOMMENCE'); /* (2026-10-14) à l'étape FIGURE on reste à la FIGURE */
}
function tutoArme(){ /* à appeler AVANT le lancement : la piste d'apprentissage doit être construite pour la 1re zone */
  if(SAVE.d.tuto||SANDBOX||PARK.on||TUTO.on||(started&&!gameOver))return;
  TUTO.on=true;runStats.zones=0;rebuildMenuScene();tutoDebut();
}
function tutoDebut(){
  TUTO.on=true;TUTO.i=0;TUTO.t=0;TUTO.l=TUTO.r=0;TUTO.hold=TUTO.air=0;TUTO.vole=false;
  TUTO.touche=0; /* (2026-10-14) le premier geste du joueur n'a pas encore eu lieu : aucun message d'échec (tutoTick) */
  TUTO.rates=0;TUTO.quitte=0;TUTO.pa=0; /* (2026-09-28) les ratés de POSE-TOI (repêchage au 2e), la leçon QUITTÉE (écran de mort), l'airtime PRÊTÉ par la leçon */
  TUTO.fig=0;TUTO.sauts=0;TUTO.accueilVu=0; /* (v2) la FIGURE finie, les sauts tentés à l'étape FIGURE, l'accueil */
  TUTO.attente=true; /* (2026-09-25) la 1re consigne attend la FIN du logo de départ (fireLaunchBoost) */
  /* (2026-09-28) RECOMMENCER pendant la leçon : le calque d'avant se range tout de suite (et ses minuteurs deviennent caducs) ; tutoAffiche le ressort sur l'accueil */
  EC.gen++;if(EC.el)ecPhase('');
  document.body.classList.add('coOn');
}
function tutoBravo(mot){ /* mot (facultatif) : une étape ACCORDÉE ne se dit pas « POSÉ ! » · la réussite d'une étape : l'éloge en GRAND, la coche qui tourne, la gerbe, le son, la vibration — puis la suivante */
  const E=TUTO_ETAPES[TUTO.i];ecMonte();EC.gen++;
  ecMot(EC.n.e3FMot,TR(typeof mot==='string'?mot:E.bravo),ecGrand()?56:40);EC.n.e3FPh.textContent='';
  EC.n.e3BF.innerHTML=pxi('coche');
  ecPhase('bravo');
  try{if(SONV2)sfx('tuto.bravo');else{chimeNote(1046,0,.10,.16);chimeNote(1568,.09,.14,.16);}}catch(e){}hap([10,40,20]);
  TUTO.i++;TUTO.t=0;ecProg(TUTO.i-1);
  {const r=EC.n.e3BF.getBoundingClientRect();ecGerbe(14,PIX_VERT,r.left+r.width/2,r.top+r.height/2);ecRayons(r);}
  /* (v2) LA DERNIÈRE ÉTAPE se finit LES ROUES SUR LA ROUTE : une FIGURE faite en l'air terminait la leçon en plein vol — le vol redevenait mortel. On attend
     la pose, le vol reste infini ; au bout de 8 s la caisse est replacée. */
  if(TUTO.i>=TUTO_ETAPES.length){
    ecPlus(1200,function(){ecPhase('fin');});
    const fin=function(n){
      if(mode==='drive'){tutoFin(false);return;}
      if(mode==='fall'){pwrAirT=Math.max(pwrAirT,2);TUTO.pa=1;}
      if(n>40){sandRevive();ecPlus(300,function(){tutoFin(false);});return;}
      ecPlus(200,function(){fin(n+1);});};
    ecPlus(1300,function(){fin(0);});return;}
  ecPlus(mode==='fall'?950:1150,function(){tutoAffiche();}); /* (2026-11-22) en vol, le bravo est plus court : la caisse tombe pendant qu'on le lit */ /* QUITTER dans l'intervalle : ni consigne ni son sur l'écran de fin ; en PAUSE la suivante attend la reprise (ecPlus) */
}
/* LE PERMIS, EN PLEIN ÉCRAN : la carte arrive en tournant (CSS 3D), le tampon VALIDÉ claque, la prime s'affiche — dans le haut de l'écran : la course, elle,
   continue pour de vrai (une seule vie) et la route devant la caisse reste visible. 3,6 s, puis le calque est RETIRÉ du document. */
function tutoPermis(paye){
  const old=document.getElementById('ecPermis');if(old)old.remove();
  const p=document.createElement('div');p.id='ecPermis';p.setAttribute('role','status');p.setAttribute('aria-live','polite');
  let plaque='';try{plaque=SAVE.d.plq&&SAVE.d.plq.x?String(SAVE.d.plq.x):'';}catch(x){}
  const esc=function(s){return String(s).replace(/[&<>"]/g,'');};
  p.innerHTML='<div class="epVoile"></div><div class="epBloc"><span class="epTitre"></span>'
    +'<div class="epCarte"><div class="epFace"><div class="epBande">'+esc(TR('PERMIS DE CONDUIRE'))+'</div>'
      +'<div class="epCorps"><div class="epPhoto">'+pxi('voiture')+'</div><div class="epInfos"><b>CASH CAR</b><span>'+esc(TR('CATÉGORIE'))+' · '+esc(TR('CIEL'))+'</span>'
      +(plaque?'<span class="epPlq">'+esc(plaque)+'</span>':'')+'<span class="epIcos">'+TUTO_ETAPES.map(function(x){return pxi(x.ico);}).join('')+'</span></div></div>'
      +'<span class="epTampon">'+esc(TR('VALIDÉ'))+'</span><span class="epReflet"></span></div></div>'
    +(paye?'<div class="epPrime"><small>'+esc(TR('PRIME'))+'</small><b>+'+fmtC(500)+'</b></div>':'')
    +'<span class="epSous">'+tutoMarque(TR('Maintenant, une seule vie.'))+'</span></div>';
  document.body.appendChild(p);
  ecMot(p.querySelector('.epTitre'),TR('PERMIS OBTENU !'),ecGrand()?34:26);
  requestAnimationFrame(function(){p.classList.add('on');
    setTimeout(function(){const c=p.querySelector('.epCarte');if(!c||!p.isConnected||REDUCED_MOTION)return;const r=c.getBoundingClientRect();
      for(let i=0;i<16;i++){const q=document.createElement('i');q.className='e3Px';const a=i/16*6.2832,d=110+Math.random()*110;q.style.left=(r.left+r.width/2)+'px';q.style.top=(r.top+r.height/2)+'px';
        q.style.background=['#ffd75e','#ffffff','#7dff9b','#ffd75e'][i%4];q.style.setProperty('--dx',(Math.round(Math.cos(a)*d/2)*2)+'px');q.style.setProperty('--dy',(Math.round(Math.sin(a)*d*.7/2)*2)+'px');p.appendChild(q);}},760);});
  /* (2026-11-22) ses 3,6 s ne s'écoulent PAS sous la pause ni l'appli en arrière-plan (il y est caché) : à la reprise, le permis et la prime sont encore là */
  let reste=3600;const pas=function(){if(!p.isConnected)return;if(!paused&&!document.hidden)reste-=200;
    if(reste<=0){p.classList.add('sort');setTimeout(function(){p.remove();},600);return;}setTimeout(pas,200);};setTimeout(pas,200);
}
function tutoFin(passe){
  TUTO.on=false;EC.gen++;document.body.classList.remove('coOn');
  ecRetire(); /* le calque quitte le document : plus rien ne tourne */
  /* (2026-09-28) L'AIRTIME PRÊTÉ PAR LA LEÇON s'arrête avec elle, sans bruit (il ressortait après le permis en « AIR MAX »). En l'air, la jauge repart neuve. */
  if(TUTO.pa){TUTO.pa=0;if(pwrAirT>0){pwrAirT=0;if(mode==='fall'){fallT=0;fallTR=0;airFlash=.6;}}}
  SAVE.d.tuto=1;
  if(!passe){const paye=!SAVE.d.permis; /* (2026-09-28) la prime du permis ne se verse qu'UNE fois : REVOIR L'AUTO-ÉCOLE ne doit pas devenir un robinet à 500 */
    if(paye){SAVE.d.permis=1;SAVE.d.bank=Math.min(1e30,bank()+500);gagneAjoute(500);bankMaxMaj();}
    /* LE PERMIS SE FÊTE, en plein écran (v3). Il passe par le couloir du haut (hautPasse) : les cartes retenues pendant la leçon attendent derrière lui. */
    hautPasse(function(){tutoPermis(paye);},3600,'slam',3,{min:3200,ferme:true});
    try{if(SONV2)sfx('ui.debloque');else fanfare();}catch(e){}hap([20,60,20,60,60]);}
  SAVE.flush();
  hautArme(); /* les cartes retenues pendant la leçon passent maintenant, l'une après l'autre (le permis d'abord) */
}
/* (2026-09-28) QUITTER N'EST PAS FINIR : on range la leçon, mais elle reprendra au prochain JOUER (SAVE.d.tuto reste à 0). (2026-11-22) Il n'y a plus de PASSER :
   QUITTER (la pause, l'écran de fin, l'appli fermée) est le seul moyen de sortir de la leçon, et elle revient. Le drapeau `quitte` dit à l'écran de mort que ce
   n'est pas une partie (pas de record). */
window.dbgTuto=function(k){ /* banc : l'état de la leçon ; dbgTuto('permis') la termine comme une réussite ; dbgTuto(n) va à l'étape n ; dbgTuto('figure') valide l'étape en cours */
  if(k==='permis'&&TUTO.on)tutoFin(false);
  if(k==='etape'&&TUTO.on){TUTO.accueilVu=1;tutoAffiche();}
  if(k==='figure'&&TUTO.on&&TUTO_ETAPES[TUTO.i])tutoBravo();
  if(typeof k==='number'&&TUTO.on){TUTO.i=Math.max(0,Math.min(TUTO_ETAPES.length-1,k|0));TUTO.accueilVu=1;TUTO.t=0;TUTO.sauts=0;tutoAffiche();}
  return {on:TUTO.on,i:TUTO.i,tuto:SAVE.d.tuto,permis:SAVE.d.permis,bank:bank(),fig:TUTO.fig,sauts:TUTO.sauts,ph:EC.ph,g:EC.g};};
function tutoQuitte(){tutoFin(true);SAVE.d.tuto=0;TUTO.quitte=1;SAVE.flush();}
function tutoPayees(){try{return (typeof FX2!=='undefined'&&FX2&&FX2.payees)|0;}catch(e){return 0;}} /* FIGURES v2 (GAMEPLAY) : +1 par figure PLANTÉE */
function tutoFigOuverte(){return TUTO.on&&TUTO_ETAPES[TUTO.i]&&TUTO_ETAPES[TUTO.i].geste==='figure';} /* (v2) le double-tap des figures, fermé pendant la leçon… sauf à SON étape */
function tutoTick(dt){
  if(!TUTO.on||!started||gameOver||paused)return;
  if(!EC.el||!EC.ph)return;
  {const b=mode==='boom';if(b!==!!EC.boom){EC.boom=b;EC.el.classList.toggle('boom',b);}} /* (2026-11-22) la caisse explose : le pouce, la jauge et les chevrons se retirent (ils restaient sur l'explosion) */
  if(EC.ph==='bravo'||EC.ph==='fin')return;
  /* (2026-11-07) LE POUCE S'EFFACE PENDANT LE GESTE : le doigt est sur le volant ou NITRO → le grand pouce s'estompe ; 0,8 s sans rien faire → il revient */
  {const j=!!((typeof TCTL!=='undefined'&&TCTL.act)||nitroOn||Math.abs(steer)>.05);
    if(j){EC.calme=0;if(!EC.el.classList.contains('joue'))EC.el.classList.add('joue');}
    else if(EC.el.classList.contains('joue')){EC.calme+=dt;if(EC.calme>.8)EC.el.classList.remove('joue');}}
  EC.mT=(EC.mT||0)+dt;if(EC.mT>.25){EC.mT=0;ecPlace(false);} /* le calque suit ses commandes (rotation, clavier qui sort, réglage COMMANDES) et la caisse */
  /* (2026-09-26, audit UX) aux deux premières étapes, une sortie de route (plus d'une demi-seconde en l'air) remet la caisse sur la piste tout de suite, en DISANT
     pourquoi — mais (2026-10-14) jamais un reproche avant le premier geste du joueur, ni dans les 3 premières secondes d'une étape. */
  if(Math.abs(steer)>.05||nitroOn)TUTO.touche=1;
  if(TUTO.i<2&&mode==='fall'){TUTO.chute=(TUTO.chute||0)+dt;if(TUTO.chute>.5){TUTO.chute=0;sandRevive();if(TUTO.touche&&TUTO.t>3&&EC.ph==='geste')tutoAffiche('SORTI ! SUIS LA ROUTE');return;}}else TUTO.chute=0;
  if(EC.ph==='accueil'||EC.ph==='titre')return; /* la carte-titre n'exige rien */
  TUTO.t+=dt;
  /* IL N'Y ARRIVE PAS : toutes les 7 s sans réussite, le pouce se relance en grand (et le rappel saute) */
  EC.rel=(EC.rel||0)+dt;if(EC.rel>7&&EC.ph==='geste'){EC.rel=0;const el=EC.el;el.classList.remove('relance');void el.offsetWidth;el.classList.add('relance');}
  switch(TUTO.i){
    case 0: if(steer>.25&&!TUTO.l){TUTO.l=1;EC.el.classList.add('okL');}if(steer<-.25&&!TUTO.r){TUTO.r=1;EC.el.classList.add('okR');} /* (2026-11-22) steer > 0 = GAUCHE (boucle-1) : la coche s'allumait du côté opposé au pouce */
           if(TUTO.l&&TUTO.r){EC.rel=0;tutoBravo();}break; /* .45 exigeait la moitié du braquage */
    case 1: if(nitroOn)TUTO.hold+=dt;ecJauge(TUTO.hold/1.1);if(TUTO.hold>1.1){EC.rel=0;tutoBravo();}break; /* la nitro tenue compte aussi en l'air */
    case 2: if(mode==='fall'){pwrAirT=Math.max(pwrAirT,9);TUTO.pa=1;EC.rel=0;tutoBravo();}break; /* en vol : l'airtime devient infini le temps d'apprendre (TUTO.pa : prêté par la leçon) */
    case 3: if(mode==='fall'&&nitroOn)TUTO.air+=dt;ecJauge(TUTO.air/.9);
            if(TUTO.air>.9){TUTO.vole=true;EC.rel=0;tutoBravo();}
            else if(mode==='drive'&&TUTO.t>1){TUTO.i=2;TUTO.air=0;tutoAffiche('ENCORE ! NITRO EN L\'AIR');}
            break;
    case 4: if(mode==='drive'){EC.rel=0;tutoBravo();}
            else if(mode==='fall'){pwrAirT=Math.max(pwrAirT,2);TUTO.pa=1;
              /* (2026-09-28) LE DÉBUTANT QUI NE RETROUVE PLUS LA ROUTE : au bout de 9 s de vol on la replace, on reprend à DÉCOLLE et on dit comment réussir ; au 2e
                 raté la pose est ACCORDÉE (elle s'apprendra en jouant). */
              if(TUTO.t>9){sandRevive();TUTO.rates=(TUTO.rates|0)+1;
                if(TUTO.rates>=2)tutoBravo('ON CONTINUE !');
                else{TUTO.i=2;TUTO.air=0;TUTO.t=0;tutoAffiche('RATÉ ! NITRO, VISE LE DESSUS');}}}
            break;
    /* (v2) LA FIGURE : le double-tap NITRO. Réussie = une figure plantée. Trois sauts sans figure plantée : elle est accordée, la caisse sur ses roues. */
    case 5: if(tutoPayees()>(TUTO.p0|0)){EC.rel=0;tutoBravo();}
            else if(TUTO.sauts>=3&&mode==='drive')tutoBravo();
            else if(mode==='fall'&&TUTO.t>12){sandRevive();TUTO.t=0;tutoAffiche(figGlisseOn()?'GLISSE DEPUIS NITRO, LACHE':'TAPE 2 FOIS VITE SUR NITRO');}
            break;
  }
}
function ecJauge(v){ /* la jauge du geste TENU (NITRO, VOLE) : elle se remplit sous le pouce — on voit le temps qu'il reste à tenir */
  v=Math.max(0,Math.min(1,v));const q=Math.round(v*20)/20;if(q===EC.j||!EC.n.e3JF)return;EC.j=q;
  EC.n.e3JF.style.transform='scaleX('+q+')';EC.el.classList.toggle('jPleine',q>=1);}
// LA GERBE DE PIXELS : une poignée de carrés qui jaillissent d'un élément (réussite, achat, clic important)
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LES CONFETTIS PARLENT LA COULEUR DE L'ÉVÉNEMENT : une palette unique pastel (#fff3ad, vert
   menthe, bleu layette) disait la même chose partout. La gerbe lit désormais d'où elle part : l'annonce qui éclate prend SES deux
   couleurs (`--s1/--s2` de #slam9), l'AURA jaillit MAGENTA, la bande du FLOW prend la couleur de son palier (la FRÉNÉSIE : magenta), un
   RECORD (carte moteur) est OR + blanc, l'auto-école est VERTE (validation) ; tout le reste (JOUER, achats) est l'OR de l'argent.
   Carrés de 6 px posés sur une grille de 2 px, 12 au plus : une gerbe, pas une nuée. */
const PIX_OR=['#ffd75e','#ffffff','#ffd75e','#b8860b'],PIX_MAG=['#ff3ec8','#ffffff','#ff7ad5','#ff3ec8'],PIX_VERT=['#62e062','#ffffff','#62e062','#ffd75e'];
const PIX_FREN=['#ff2a3d','#ffffff','#ffb000','#ff2a3d'];
function pixCouleurs(el){
  if(!el.closest)return PIX_OR; // (2026-10-14) un point d'écran (la gerbe de l'impact moteur AU CAPOT, engImpact) n'est pas un élément : el.closest levait une erreur avalée, la gerbe ne partait JAMAIS — elle part en or, comme l'éclair de l'impact
  const sl=el.closest('#slam9');
  if(sl){const a=sl.style.getPropertyValue('--s1').trim()||'#ffd75e',b=sl.style.getPropertyValue('--s2').trim()||'#ff3ec8';return [a,'#ffffff',b,a];}
  const vd=el.closest('#verdHud');if(vd){const c=vd.style.getPropertyValue('--vc').trim()||'#ffd75e';return [c,'#ffffff',c,'#ffd75e'];} // (vague 3) le verdict éclate à la couleur de son rang
  if(el.closest('#auraV2')||el.closest('#auraHud'))return PIX_MAG;
  if(el.classList&&el.classList.contains('fM'))return PIX_OR; // (×3) le ×CASH de la bande éclate en OR : c'est de l'argent, pas une braise
  if(el.closest('#triade')||(FLOW.el&&FLOW.el.contains(el)&&(FLOW.lv>=4||el.closest('.fZ'))))return PIX_FREN; // la FRÉNÉSIE jaillit en BRAISES (rouge, blanc, ambre)
  if(FLOW.el&&FLOW.el.contains(el)){const c=FLOW_COL[FLOW.lv]||'#ffd75e';return [c,'#ffffff',c,'#ffd75e'];}
  if(el.closest('#ecole'))return PIX_VERT;
  return PIX_OR; // l'argent (et le record : or + blanc)
}
/* (2026-09-29, audit iPhone) LE RECTANGLE À L'ÉCRAN d'un élément du HUD rétréci par `zoom` (<style id="hudTaille">). Chrome ≥ 128 rend
   déjà les coordonnées de l'écran ; l'ancien comportement (WebKit, possible sur iPhone) les rend DIVISÉES par le zoom — les gerbes
   partaient à côté du compteur. On mesure une fois lequel des deux on a. `zK(el)` = le zoom effectif d'un élément (1 hors du HUD). */
function zK(el){try{const z=el&&el.closest&&el.closest('#auraV2,#triade,#airHud,#pwrChip,#campChip');return z?(parseFloat(getComputedStyle(z).zoom)||1):1;}catch(e){return 1;}}
function zRect(el){const r=el.getBoundingClientRect();
  if(zRect.leg===undefined){try{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:100px;height:10px;zoom:.5;visibility:hidden;pointer-events:none';document.body.appendChild(d);zRect.leg=d.getBoundingClientRect().width>75;d.remove();}catch(e){zRect.leg=false;}}
  const k=zRect.leg?zK(el):1;if(k===1)return r;
  return {left:r.left*k,top:r.top*k,right:r.right*k,bottom:r.bottom*k,width:r.width*k,height:r.height*k};}
function pixBurst(el,n){
  if(REDUCED_MOTION||!el||HUD_CALME.on)return; /* (2026-11-13, Sacha : « des étincelles sur la barre de flow ») HUD calme : plus de gerbe de pixels */
  const r=el.closest?zRect(el):el.getBoundingClientRect(),cx=Math.round((r.left+r.width/2)/2)*2,cy=Math.round((r.top+r.height/2)/2)*2,cols=pixCouleurs(el);
  n=Math.min(12,n||10);
  for(let i=0;i<n;i++){
    const p=document.createElement('i');p.className='pxBurst';
    const a=Math.random()*6.2832,d=40+Math.random()*70;
    p.style.left=cx+'px';p.style.top=cy+'px';p.style.background=cols[i%cols.length];
    p.style.setProperty('--dx',(Math.round(Math.cos(a)*d/2)*2)+'px');p.style.setProperty('--dy',(Math.round((Math.sin(a)*d-30)/2)*2)+'px');
    document.body.appendChild(p);setTimeout(function(){p.remove();},720);
  }
}
