/* ===== L'INTRO DU JEU, VERSION FINALE (2026-10-23, validée par Léo : « c'est exactement ça ») =====
   Un seul film. Noir, puis une boule de « 1 . 6 1 » (quatre couleurs qui changent) se dessine point après point, tourne sans s'arrêter, pulse, et se tourne au doigt.
   Derrière : un pad infini (Ré, Si mineur, Sol, La) qui bat avec la boule, et des cloches pentatoniques qui suivent la couleur. Dès que la page est prête (≥ 4,6 s), un accord s'ouvre.
   L'APPUI (un vrai tap, pas un glissement) : la boule explose, CASH CAR claque (dActe3), le jeu se prépare dessous, puis le voile fond vers le jeu (fonduDoux).
   `?intro=ancien` = l'intro d'avant (init.js) · `?intro=muet` = sans son. Les anciens films (feu d'artifice, néon, poussière, luxe, hype, caisse, pluie, route, spirale PlayStation, sphère qui s'écroule) sont retirés
   de ce fichier : ils restent dans l'historique git (commit 254157dc). Ce qui suit, avant « LA BOULE », est l'ancien commentaire du film à calendrier (le gros logo, la casse en tuiles, l'horloge `TL`). */
/* ===== L'INTRO DU STUDIO 1.61, VERSION CONSOLE (2026-10-21, Léo : « une nouvelle intro beaucoup plus moderne et stylée pour le label 1.61, du style
   Xbox ou PlayStation : le logo qui apparaît avec une animation, des bruits intenses qui font blip blip blip, puis un silence, un fondu noir ;
   le gros logo CASH CAR doré qui se secoue, se casse en morceaux, casse l'écran noir et laisse voir le jeu ») =====
   L'ATTENTE (22/10, Léo : « le logo cash car tout début sur écran noir complet sans lumière, puis l'animation 1.61, puis cash car apparaît et n'explose pas :
   c'est l'écran qui s'explose quand je le touche ») : au chargement, le titre CASH CAR sur NOIR COMPLET (ni halo ni poussière ni lueur), AUCUN toucher demandé ;
   le film part TOUT SEUL (page chargée, police prête, fenêtre visible, ≥ 1,7 s ; `autoLance`). Le navigateur refuse le son sans toucher : le film passe alors
   MUET (la casse, elle, sonnera au toucher : le contexte attend, déjà construit) ; s'il l'autorise, ou si l'on touche l'écran avant, le film sonne en entier.
   LE FILM. Tout est piloté par UNE horloge, `t` en secondes depuis le départ ; chaque instant est dans `TL` (le son et l'image s'y lisent) :
     0,00  le titre s'éteint en un trait de lumière (le titre de l'attente s'aplatit dedans) ;
     0,30  LES BLIPS : « 1.61 », se dessine en dix temps, un par blip, de CINQ manières au choix :
           FEU D'ARTIFICE (défaut : deux têtes en spirale d'or qui sèment des pixels, explosion en « 1.61 » de petits cubes d'or qui tombent ensuite), NÉON (un tube que les blips allument), POUSSIÈRE (des grains qui affluent),
           LUXE (un trait fin qu'un fil de lumière révèle), HYPE (des coupes sèches sur des chiffres lourds) ;
     1,85  le coup final : le nombre claque ; il reste net un instant ;
     2,80  il S'ÉTEINT (fondu, ou les cubes qui tombent) et le SON COUPE ; 3,55 : noir complet ; SILENCE complet jusqu'à 3,95 (le jeu dessine quelques images dans ce noir) ;
     3,95  le gros logo CASH CAR claque (or métallique / coucher de soleil, comme celui de l'accueil), puis il ATTEND : un frémissement léger, un reflet qui repasse
           toutes les 2,8 s, et dès 5,15 s un « TOUCHE » très discret SOUS le logo (« TAP » en anglais) ; il peut attendre indéfiniment (le jeu est en pause dessous) ;
     AU TOUCHER  l'écran noir et le logo se brisent en ~80 tuiles carrées (petites autour du DOIGT, grandes aux bords) qui volent vers la caméra ; chacune est une
           LOUPE : le logo en gros pixels, puis le jeu agrandi et pixelisé — le voile ne prend plus les touchers, le jeu est jouable dessous. Un toucher PENDANT le 1.61
           coupe au noir : le logo claque aussitôt (`sauterAuLogo`).
   Tout est dessiné dans le canvas de l'écran titre (#fxCv) à la résolution de l'appareil ; rien n'est animé « au pas à pas » : chaque image se
   calcule d'après `t` seul (`window.dbgIntro.voir(t)` montre n'importe quel instant, sans son). Le son est fabriqué ici (WebAudio) : des blips
   de MÊME hauteur (aucune mélodie : toujours aucune musique avant le ciel, Léo 6/10 et 16/10), un grondement, des craquements, la casse.
   Réglages : `?label=neon|feu|poussiere|luxe|hype` choisit le « 1.61 » (par défaut feu), `?label=demo` les enchaîne en boucle (un toucher pour jouer) · `?depart=toucher` = l'ancien départ (le film attend un toucher, avec le son) ·
   `?intro=ancien` = l'intro d'avant (init.js) · `?intro=muet` = sans aucun son · « réduire les animations » = sans secousse ni
   éclats (le voile s'efface) · quelqu'un qui a déjà fini la leçon (SAVE.d.tuto) voit le même film en 20 % plus court · un 2e toucher passe. */
(function(){
  if(!INTRO_NEUVE)return;
  const sp=document.getElementById('splash'),cv=document.getElementById('fxCv');
  if(!sp||!cv)return;
  const ttl=document.getElementById('spTitle'),g=cv.getContext('2d');
  sp.classList.add('spNoir'); /* l'attente : NOIR COMPLET, sans lumière : le titre posé, ni halo ni lueur (Léo, 22/10) */
  {const st=document.createElement('style');st.textContent='html #splash.spNoir{background:#000}html #splash.spNoir::before{display:none}';document.head.appendChild(st);}
  if(ttl){ttl.classList.remove('tease');ttl.style.cssText+=';animation:none;filter:none;opacity:.92;transform:translateY('+(innerWidth<innerHeight*1.15?-.05*innerHeight:0).toFixed(1)+'px) scale(.88) skewX(var(--sk,0deg))';} /* (le titre se pose à la hauteur où le film dessine : 45 % de l'écran en portrait) */
  if(!/[?&]label=(?!boule)/.test(location.search)&&ttl)ttl.style.display='none'; /* plus de CASH CAR sur noir pendant le chargement : seule la boule */
  window.__intro='attente'; /* (la mise à jour toute seule) l'écran titre attend son toucher : rien n'a sonné, on peut recharger */
  const SANS_SON=/[?&]intro=muet\b/.test(location.search);
  const borne=(x,a,b)=>x<a?a:x>b?b:x;
  const lisse=(a,b,x)=>{x=borne((x-a)/(b-a),0,1);return x*x*(3-2*x);};
  const entre=(a,b,k)=>a+(b-a)*k;
  const sort3=x=>1-Math.pow(1-borne(x,0,1),3);
  const hasard=s=>function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const pique=(i,j)=>{let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;}; /* un hasard FIXE par (i,j) : le scintillement d'une case */

  /* ---- LE CALENDRIER. Les heures de TL sont celles du film ; K les resserre pour qui a déjà fini la leçon. ---- */
  const tuto=!!(SAVE&&SAVE.d&&SAVE.d.tuto),K=tuto?.8:1;
  const BOULE=true; /* (un seul film depuis le 23/10 soir, validé par Léo : « c'est exactement ça ») */
  const TL=(function(k){const T=x=>x*k;return{
    blips:[.30,.544,.766,.959,1.118,1.252,1.349,1.422,1.495,1.556].map(T), /* (gardés : l'ancien code lit blips[0] et blips[9]) */
    plein:T(1.85),
    fondu:T(5.95),noir:T(6.55),slam:T(7.55),casse:T(9.2)};})(K); /* casse : l'instant NOMINAL (le banc) ; la vraie casse est celle du TOUCHER */
  const DUREE_CASSE=1.45; /* secondes d'éclats en vol avant d'ôter le voile */
  const reduit=()=>document.documentElement.getAttribute('data-reduced-motion')==='1'||(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION);

  let W=0,H=0,S=1,ku=1; /* taille logique du voile, échelle du canvas (pixels de l'appareil), unité d'écran (390 px = 1) */
  let pretT=null,tapT=null; /* la boule : l'instant où c'est prêt (elle s'arrête), l'instant de l'appui (elle explose) */
  let lance=false,fini=false,casse=false,doux=false,manuel=false,passee=false,ouvert=false,revele=false,RM=false;
  let TOUCH=null,preAC=null,filmMuet=false,tLance=0,latV=0,tCasse=0,raf=0,sonCasseFait=false,t0a=0,iAC=null,SON=null,SK0={x:0,y:0};
  let GAMECV=null,SNAPPIX=null,GLOSS=null,priseFaite=false; /* la photo du jeu et celle de la scène, en gros pixels ; le reflet des lentilles ; la photo est-elle demandée */
  let LOGO=null,MESH=null,SNAP=null,ECL=null,ETC=null,PXC=null,RAY=null,VIG=null;
  const SPR={};

  function tailleEcran(){return[Math.min(sp.clientWidth||1e5,innerWidth||1e5)||390,Math.min(sp.clientHeight||1e5,innerHeight||1e5)||844];}
  /* ===== LE FILM SANS TRAVAIL REFAIT (2026-10-24, passe perf PC : « le démarrage sur ordinateur ») =====
     Le film tourne PENDANT que le jeu se construit dessous : chaque ms qu'il prend par image retarde la construction. Trace du chef (Mac M4, cadre bureau,
     rechargement à chaud, 36 s) : 295 ms de temps propre dans `tailleEcran`, 672 ms dans `dBoule`.
     · LA TAILLE : `boucle` relisait sp.clientWidth/Height + innerWidth/Height à CHAQUE image, une mise en page FORCÉE de toute la page en construction.
       Elle n'est plus relue que si elle a pu changer (ResizeObserver du voile, `resize`) et, par prudence, une fois par seconde (le cas « sans que resize
       nous le dise » reste attrapé, en ≤ 1 s au lieu d'une image).
     · LA BOULE (`dBoule`) : même dessin au bit près, moins de calcul — l'heure d'apparition de chaque point est calculée une fois (plus de 1 040 Math.pow
       par image), la rotation une fois au lieu de deux (une par passe), et les 96 vignettes de « 1 . 6 1 » sont dessinées depuis des ImageBitmap (les mêmes
       pixels, sans la photo de la toile source que Chrome refait à chaque drawImage d'un canvas : ~520 par image).
     · LA CADENCE (`?pci60=0` pour l'ôter seule) : sur un écran de plus de ~110 Hz (MacBook Pro 120 Hz), la boule qui tourne au ralenti (0,5 rad/s, < 1 px par
       image) est redessinée une image d'écran sur deux, soit 60 i/s, jusqu'à l'appui ; chaque image dessinée est celle de son instant, à 60 Hz rien ne change.
     `?pcintro=0` = tout l'ancien comportement. `window.dbgPciIntro` : les compteurs (lectures de taille, images dessinées / sautées, pas d'écran). */
  const PCI_ON=!/[?&]pcintro=0\b/.test(location.search),PCI_60=PCI_ON&&!/[?&]pci60=0\b/.test(location.search);
  const PCI_N={lectures:0,rendus:0,sautees:0,ecranMs:0,pas:1,prepares:0,prepEvitees:0};window.dbgPciIntro=PCI_N;
  let pciSale=true,pciLu=-1e9,pciPrec=0,pciMin=99,pciNm=0,pciDer=-1e9,pciCourts=0;
  if(PCI_ON){try{new ResizeObserver(function(){pciSale=true;}).observe(sp,{box:'border-box'});}catch(e){} addEventListener('resize',function(){pciSale=true;});}
  function pciTaille(now){ /* la taille du voile, relue seulement si elle a pu changer (sinon : celle qu'on a, donc « rien n'a changé ») */
    if(pciSale||!(now-pciLu<1000)){pciSale=false;pciLu=now;PCI_N.lectures++;return tailleEcran();}
    return[W,H];
  }
  function pciSaute(now){ /* true = cette image d'écran garde le dessin de la précédente (écran de ~110 Hz et plus, régulier : une sur deux, jamais moins ; 60, 75, 90, 100 Hz : rien ne change) */
    const d=now-pciPrec;pciPrec=now;if(d>1&&d<9.4){pciCourts++;if(d<pciMin)pciMin=d;} /* un intervalle d'écran rapide (< 9,4 ms : plus de ~106 Hz) */
    if(++pciNm>=60){PCI_N.pas=pciCourts>=40?2:1;PCI_N.ecranMs=pciCourts?+pciMin.toFixed(2):0;pciNm=0;pciMin=99;pciCourts=0;} /* les deux tiers des 60 derniers intervalles : l'écran est rapide ET la page respire (sous la charge, tout est dessiné comme avant) */
    if(PCI_N.pas>1&&now-pciDer<1.5*PCI_N.ecranMs){PCI_N.sautees++;return true;}
    pciDer=now;PCI_N.rendus++;return false;
  }
  function mesure(){
    const t=tailleEcran();W=t[0];H=t[1]; /* ce qui se VOIT (la fenêtre du cadre), jamais plus : un voile plus large que la fenêtre décalait tout le dessin (vu le 23/10 : logo énorme, coupé à droite) */
    S=Math.max(.6,Math.min(devicePixelRatio||1,2,Math.sqrt(2.2e6/(W*H)))); /* net sur un téléphone, borné en pixels : un grand écran ne coûte pas plus */
    cv.width=Math.round(W*S);cv.height=Math.round(H*S);cv.style.width=W+'px';cv.style.height=H+'px';cv.style.left='0';cv.style.top='0'; /* le dessin et l'écran font EXACTEMENT la même taille */
    ku=Math.max(.75,Math.min(W,H)/390);
  }

  /* ---- LES PETITS OUTILS DE DESSIN ---- */
  function lueur(r,v,b){const n=128,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),d=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
    d.addColorStop(0,'rgba('+r+','+v+','+b+',1)');d.addColorStop(.22,'rgba('+r+','+v+','+b+',.5)');d.addColorStop(.55,'rgba('+r+','+v+','+b+',.14)');d.addColorStop(1,'rgba('+r+','+v+','+b+',0)');
    x.fillStyle=d;x.fillRect(0,0,n,n);return c;}
  function halo(c,s,x,y,rx,ry,a){if(a<=.004)return;c.globalAlpha=a;c.drawImage(s,x-rx,y-ry,2*rx,2*ry);} /* une lueur douce, étirable en ellipse (à poser en `lighter`) */
  function silhouette(src,couleur){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=couleur;x.fillRect(0,0,c.width,c.height);return c;}
  function faitRessources(){
    SPR.bl=lueur(255,255,255);SPR.or=lueur(255,190,80);SPR.ch=lueur(255,238,196);
    {const c2=document.createElement('canvas');c2.width=c2.height=64;const x=c2.getContext('2d'),d=x.createLinearGradient(0,0,64,64);d.addColorStop(0,'rgba(255,255,255,.65)');d.addColorStop(.5,'rgba(255,255,255,0)');d.addColorStop(1,'rgba(255,255,255,.18)');x.fillStyle=d;x.fillRect(0,0,64,64);GLOSS=c2;} /* le reflet d'une lentille */
    {const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),d=x.createRadialGradient(48,48,20,48,48,70);d.addColorStop(0,'rgba(0,0,0,0)');d.addColorStop(1,'rgba(0,0,0,.62)');x.fillStyle=d;x.fillRect(0,0,96,96);VIG=c;}
    {const n=512,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),R=hasard(11);x.translate(n/2,n/2);x.globalCompositeOperation='lighter'; /* les rayons : dix-huit coins de lumière, une seule fois */
      for(let i=0;i<18;i++){const a=i*Math.PI*2/18+(R()-.5)*.25,w=.05+R()*.07,len=n/2*(.7+R()*.3),d=x.createRadialGradient(0,0,0,0,0,len);
        d.addColorStop(0,'rgba(255,225,150,.55)');d.addColorStop(.5,'rgba(255,190,80,.16)');d.addColorStop(1,'rgba(255,170,60,0)');
        x.fillStyle=d;x.beginPath();x.moveTo(0,0);x.arc(0,0,len,a-w,a+w);x.closePath();x.fill();}
      RAY=c;}
  }

  /* ---- LES LABELS : CINQ MANIÈRES D'ÉCRIRE « 1.61 » (2026-10-22, Léo : « regarde en ligne une série d'intro luxueuse ou hype minimaliste de truc très connu avec des designers identitaires de renom, et propose plusieurs 1.61 »).
     Ce que disent les cas lus : Pentagram pour MTV World (des logos en formes d'onde, étirées sur les battements, en noir et blanc), Netflix (un zoom sur le N qui ouvre un spectre, fond noir, le son en deux notes),
     Wolff Olins (une identité née du mouvement), FIFA 2026 (32 carrés en orbite qui se verrouillent), PlayStation (le son posé sur un logo animé déjà fini) : le mouvement sort de l'identité, une seule action majeure à la fois,
     la version muette tient déjà seule, le son tombe quand le logo se fige, la fin est figée et lisible. Et le nom du studio EST le nombre d'or (φ ≈ 1,618).
     ?label=neon · or · poussiere · luxe · hype ; ?label=demo les enchaîne en boucle (un toucher pour jouer le jeu). Tous partagent le même calendrier (`TL`) et le même son. ---- */
  const PENTE=.194; /* tan(11°) : la pente du logo de l'accueil */
  const LAB_ID='boule',DEMO=false;
  const ORDRE_LABELS=['feu','poussiere','luxe','hype','neon'],NOMS_LABELS={feu:"FEU D'ARTIFICE",poussiere:'POUSSIERE',luxe:'LUXE',hype:'HYPE',neon:'NEON'}; /* l'ordre de la démo, les noms à l'écran (la police pixel n'a pas d'accents) */
  const ETS={}; /* les données de chaque label, calculées à la taille de l'écran */
  function bez(p0,p1,p2,p3,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push({x:u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],y:u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]});}return o;}
  function lig(p0,p1,n){const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push({x:p0[0]+(p1[0]-p0[0])*t,y:p0[1]+(p1[1]-p0[1])*t});}return o;}
  function ell(cx,cy,rx,ry,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry});}return o;}
  function glyphes(o){ /* les quatre signes « 1 . 6 1 » : chacun un tracé continu (le centre du trait) en hauteurs de chiffre, posés côte à côte, puis penchés. o : sw (l'épaisseur), pente, gaps (entre les signes), rx/ry (le ventre du 6), fx/fy (le drapeau du 1), dr (le rayon du point) */
    const sw=o.sw,t0=sw/2,rx=o.rx||.20,ry=o.ry||.29,fx=o.fx||.225,fy=o.fy||.1475,dr=o.dr||sw*.725,sx=fx+.045,NH=22,cyb=1-t0-ry,pente=o.pente||0;
    const UN=()=>lig([sx-fx,t0+fy],[sx,t0],7).concat(lig([sx,t0],[sx,1-t0],24).slice(1)); /* le 1 : un drapeau, une hampe (un tableau neuf à chaque appel : les deux 1 ne partagent pas leurs points) */
    const SIX=bez([2*rx,t0+.0875],[2*rx-.14,t0-.1525],[0,t0+.1375],[0,cyb],NH).concat(ell(rx,cyb,rx,ry,Math.PI,-Math.PI,52).slice(1)); /* le 6 : la crosse, qui descend et s'enroule en ventre (NH : où elle finit) */
    const signes=[{pl:UN()},{pt:{x:dr,y:1-dr},dr:dr},{pl:SIX},{pl:UN()}];
    let x0=0;
    signes.forEach(function(g,i){
      let m0=1e9,m1=-1e9;
      if(g.pt){m0=g.pt.x-dr;m1=g.pt.x+dr;}else for(const q of g.pl){m0=Math.min(m0,q.x-sw/2);m1=Math.max(m1,q.x+sw/2);}
      g.dx=x0-m0;x0+=m1-m0+(o.gaps[i]||0);
    });
    let bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
    const borne4=function(x,y,r){bx0=Math.min(bx0,x-r);bx1=Math.max(bx1,x+r);by0=Math.min(by0,y-r);by1=Math.max(by1,y+r);};
    for(const g of signes){
      if(g.pt){g.pt.x+=g.dx+pente*(.5-g.pt.y);borne4(g.pt.x,g.pt.y,dr);continue;}
      for(const q of g.pl){q.x+=g.dx+pente*(.5-q.y);borne4(q.x,q.y,sw/2);}
      g.cum=[0];for(let i=1;i<g.pl.length;i++)g.cum.push(g.cum[i-1]+Math.hypot(g.pl[i].x-g.pl[i-1].x,g.pl[i].y-g.pl[i-1].y));
      g.L=g.cum[g.cum.length-1];
    }
    return{signes:signes,sw:sw,dr:dr,NH:NH,bx0:bx0,bx1:bx1,by0:by0,by1:by1};
  }
  function morceau(sg,a,b,P,h,sw){ /* le bout de tracé entre les fractions a et b de sa longueur, en pixels : un Path2D, son point d'arrivée, deux jeux de taches de lumière (serrées, larges) et des points serrés avec leur normale (pour les grains) */
    const pl=sg.pl,cum=sg.cum,d0=a*sg.L,d1=b*sg.L,p=new Path2D();
    const pt=function(d){let i=0;while(i<cum.length-2&&cum[i+1]<d)i++;const k=(d-cum[i])/Math.max(1e-9,cum[i+1]-cum[i]);return P(pl[i].x+(pl[i+1].x-pl[i].x)*k,pl[i].y+(pl[i+1].y-pl[i].y)*k);};
    let q=pt(d0);p.moveTo(q[0],q[1]);
    for(let i=1;i<pl.length-1;i++)if(cum[i]>d0&&cum[i]<d1){q=P(pl[i].x,pl[i].y);p.lineTo(q[0],q[1]);}
    q=pt(d1);p.lineTo(q[0],q[1]);
    const tache=function(pas,avecN){const o=[],n=Math.max(1,Math.ceil((d1-d0)*h/pas));for(let i=0;i<=n;i++){const d=d0+(d1-d0)*i/n,r=pt(d);o.push(r[0],r[1]);
      if(avecN){const r2=pt(Math.min(sg.L,d+.004)),r1=pt(Math.max(0,d-.004)),tx=r2[0]-r1[0],ty=r2[1]-r1[1],l=Math.hypot(tx,ty)||1;o.push(-ty/l,tx/l);}}return o;};
    return{p:p,x:q[0],y:q[1],k:1,m:1,len:(d1-d0)*h,s1:tache(sw*h*.7),s2:tache(sw*h*1.6),ech:tache(2.4,true)};
  }
  function dixMorceaux(Gl,P,h){ /* le nombre en dix morceaux, un par blip : [signe, début, fin] en fraction de la longueur du tracé ; U[n] = l'union des n premiers (le point exclu) */
    const sg=Gl.signes,sw=Gl.sw,six=sg[2],fh=six.cum[Gl.NH]/six.L,t3=(1-fh)/3,fl=sg[0].cum[7]/sg[0].L;
    const SP=[[0,0,fl+.12],[0,fl+.12,1],[1,0,1],[2,0,fh],[2,fh,fh+t3],[2,fh+t3,fh+2*t3],[2,fh+2*t3,1],[3,0,fl-.015],[3,fl-.015,.62],[3,.62,1]];
    const G=SP.map(function(s){const g=sg[s[0]];
      if(g.pt){const q=P(g.pt.x,g.pt.y),p=new Path2D();p.moveTo(q[0]-.01,q[1]);p.lineTo(q[0]+.01,q[1]);return{p:p,x:q[0],y:q[1],k:g.dr*2/sw,m:3,len:g.dr*h*5,s1:[q[0],q[1]],s2:[q[0],q[1]],ech:[q[0],q[1],0,1]};} /* le point : un trait minuscule, rond, plus gros que le tube (sa lueur est triplée : une seule tache) */
      return morceau(g,s[1],s[2],P,h,sw);});
    const U=[];for(let n=0;n<=10;n++){const u=new Path2D();for(let j=0;j<n;j++)if(!sg[SP[j][0]].pt)u.addPath(G[j].p);U.push(u);}
    return{G:G,U:U};
  }
  function etoile(c,x,y,r,a){ /* une étoile à quatre branches effilées */
    const v=r*.62,q=r*.07;c.globalAlpha=a;c.fillStyle='#fff';c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x-q,y-q,x,y-v);c.quadraticCurveTo(x+q,y-q,x+r,y);c.quadraticCurveTo(x+q,y+q,x,y+v);c.quadraticCurveTo(x-q,y+q,x-r,y);c.fill();
  }
  function allumage(c,t,cx,cy,sw,h){ /* le trait de lumière de l'allumage (le titre faible s'aplatit dedans) ; à poser en addition */
    if(t>=.5)return;const L=W*.47*sort3(t/.2),a=1-lisse(.26,.5,t);
    if(a>0){halo(c,SPR.bl,cx,cy,L*1.02,sw*.8,.55*a);c.globalAlpha=a;c.fillStyle='#fff';c.fillRect(cx-L,cy-1,2*L,2);}
    halo(c,SPR.bl,cx,cy,h*.7,h*.7,Math.exp(-t/.09)*.4);
  }
  function coupFinal(c,t,cx,cy,sw,h,vg,anneau){ /* le coup final : traînée d'objectif, onde de choc (en addition) */
    if(t<TL.plein)return;const a=t-TL.plein,k=Math.exp(-a/.2);
    c.globalCompositeOperation='lighter';c.fillStyle='#fff';
    halo(c,SPR.bl,cx,cy,W*.5,sw*1.6,.7*k*vg);c.globalAlpha=.8*k*vg;c.fillRect(cx-W*.46,cy-1.5,W*.92,3);
    if(anneau){c.globalAlpha=Math.max(0,.6-a*1.4)*vg;c.strokeStyle='#fff';c.lineWidth=2*ku;c.beginPath();c.arc(cx,cy,h*.55+a*W*1.05,0,6.2832);c.stroke();}
    c.globalCompositeOperation='source-over';
  }
  function dNombre(c,M,sw,kc,kl,r1f,r2f){ /* un nombre tout allumé : la lueur (des taches de lumière en addition : un dégradé lisse) puis le cœur blanc, d'un seul coup */
    const r1=sw*r1f,r2=sw*r2f;
    c.lineCap='round';c.lineJoin='round';c.strokeStyle='#fff';
    if(kl>.01){c.globalCompositeOperation='lighter';
      for(const g of M.G){c.globalAlpha=Math.min(1,.14*g.m*kl);for(let i=0;i<g.s1.length;i+=2)c.drawImage(SPR.bl,g.s1[i]-r1,g.s1[i+1]-r1,2*r1,2*r1);
        c.globalAlpha=Math.min(1,.073*g.m*kl);for(let i=0;i<g.s2.length;i+=2)c.drawImage(SPR.bl,g.s2[i]-r2,g.s2[i+1]-r2,2*r2,2*r2);}
      c.globalCompositeOperation='source-over';}
    c.globalAlpha=kc;c.lineWidth=sw;c.stroke(M.U[10]);
    for(const g of M.G)if(g.k>1){c.lineWidth=sw*g.k;c.stroke(g.p);}
  }

  /* ---- 1. NÉON : le tube blanc que les blips allument morceau après morceau, dans le sens de l'écriture ---- */

  /* ---- 2. FEU D'ARTIFICE EN PIXELS (2026-10-22, Léo : « garde la rotation circulaire… au lieu d'un fil banal, un feu d'artifice qui suit le mouvement, un jaillissement de petits pixels minuscules colorés ; à la fin
     du mouvement ça explose et ça donne 1.61 en pixels ; puis les petits cubes se déconstruisent et tombent petit à petit, et ça laisse apparaître le gros logo CASH CAR qui explose » · puis : « le début de la spirale un tout petit
     peu plus lent, 1.61 plus petit, des pixels plus nobles, moins jouet »).
     DEUX têtes descendent en spirale d'or vers le centre (à chaque quart de tour le rayon est divisé par φ), comme avant ; mais plus de trait : elles SEMENT des étincelles (de petits carrés, snappés sur une grille de pixels,
     aux teintes douces : blanc chaud, or, glace, corail, lavande) qui jaillissent et retombent, et chaque blip fait éclater un cercle d'étincelles sur chaque tête. Au coup final le centre EXPLOSE : des centaines de cubes minuscules,
     d'un or champagne, partent du centre en arc et se posent en « 1.61 » (un trait fin, en pixels : 3 × 3 cubes par pixel) ; ils tiennent un instant, puis tombent un à un (au fondu, en silence) ; puis le noir, puis CASH CAR.
     Tout est une fonction de `t` (étincelles et cubes tirés d'avance), une poignée de carrés par image. ---- */
  const PHI=1.6180339887,PAL_FEU=['#fff1cf','#f4d27c','#e3a93c','#ffffff','#8fd4ff','#ff9f8a','#b79cff']; /* blanc chaud, or pâle, or, blanc, glace, corail, lavande */
  const MOTIFS={'1':['..#..','.##..','#.#..','..#..','..#..','..#..','..#..','..#..','.###.'],'.':['#'],'6':['..##.','.#...','#....','#....','####.','#...#','#...#','#...#','.###.']}; /* « 1.61 » en pixels, au trait d'un pixel */
  function bitmapsNombre(){ /* le nombre posé sur une même ligne de base : les cellules [colonne, ligne] de « 1 . 6 1 » */
    const G={},cells=[],gaps=[2,2,1],ordre=['1','.','6','1'];let hb=0;
    for(const ch of ordre){const L=MOTIFS[ch],pts=[];L.forEach(function(s,r){for(let c=0;c<s.length;c++)if(s[c]==='#')pts.push([c,r]);});G[ch]={w:L[0].length,h:L.length,pts:pts};hb=Math.max(hb,L.length);}
    let x0=0;ordre.forEach(function(ch,i){const gl=G[ch],dy=hb-gl.h;for(const p of gl.pts)cells.push([x0+p[0],dy+p[1]]);x0+=gl.w+(gaps[i]||0);});
    return{cols:x0,rows:hb,cells:cells};
  }

  /* ---- 3. POUSSIÈRE : des milliers de grains de lumière affluent et se posent au rythme des blips ; au coup final ils se figent en trait plein ; au fondu le nombre repart en poussière ---- */

  /* ---- 4. LUXE : un trait fin, droit, très espacé ; un fil de lumière avance d'un cran à chaque blip et laisse le nombre derrière lui ; au coup final un reflet le traverse, un filet se tire dessous ---- */

  /* ---- 5. HYPE : des chiffres lourds, penchés ; à chaque blip une COUPE sèche sur un autre morceau du nombre, de plus en plus large (écho, tranches décalées, traits de vitesse) ; au coup final l'image se pose en grand avec un éclair ---- */

  /* ---- 6-8. LES TROIS FILMS MOTEUR (2026-10-23, Léo : « refonte de toute l'intro du studio : luxe et cinéma, ~8 s, un toucher la saute, plus de wahou, plus cohérent avec le jeu, le son du moteur » ; « fais les trois »).
     `?label=caisse|pluie|route`. Même fin que les autres (le nombre en cubes d'or, le coup final, le fondu, le noir, CASH CAR), mais une montée de ~5 s sous un moteur qui prend des tours (trois changements de vitesse), coupée net par un freinage :
     CAISSE (des passages éclair d'une caisse dorée sur un filet d'or, puis elle freine en dévoilant « 1.61 » à mesure que ses phares passent), PLUIE (des pièces et des billets d'or tombent et s'empilent en « 1.61 », du bas vers le haut),
     ROUTE (la route suspendue file vers l'horizon, les étoiles s'étirent, la vitesse monte ; au freinage « 1.61 » se lève de l'horizon dans le ciel). ---- */

  /* 6. CAISSE */

  /* 7. PLUIE */

  /* 8. ROUTE */

  /* 9. SPHÈRE (2026-10-23, Léo : « l'effet éclaboussure étincelle artifice qui fait la courbe φ, explose et laisse paraître 1.61 en sphère, écrit en masse pour former une boule qui tourne sur elle-même, se désintègre, et toutes les lettres tombent, effet terre qui s'écroule ; puis CASH CAR surgit de l'ombre, zoom, et boom : ça explose en écran ciel »).
     Le feu d'artifice en spirale (dLabFeu, sans son nombre en cubes), puis les caractères « 1 . 6 1 » en masse jaillissent du centre et se posent en sphère (spirale de Fibonacci) qui tourne, penchée ; elle tremble, puis lâche : le bas d'abord, tout choit. */
  function geoLabSphere(){
    const land=W>H*1.15,R=Math.min(W*.24,H*(land?.27:.19)),cx=W/2,cy=H*(land?.5:.46),n=Math.round(Math.max(260,Math.min(520,W*H/420))),Rn=hasard(161),ga=Math.PI*(3-Math.sqrt(5));
    const F=()=>new Float32Array(n),px=F(),py=F(),pz=F(),dl=F(),tf=F(),fx=F(),gk=new Uint8Array(n),spr=[];
    for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),th=i*ga;px[i]=r*Math.cos(th);py[i]=y;pz[i]=r*Math.sin(th);dl[i]=Rn()*.4;gk[i]=i%4;
      tf[i]=TL.fondu-.95+(1-(y+1)/2)*.4+Rn()*.18;fx[i]=(Rn()-.5)*120*ku;}
    const TEINTES=[['#fff0b0','#f0b030'],['#c8f0ff','#38b8ff'],['#ffc4d4','#ff4f86'],['#e4d4ff','#9a6bff']]; /* un « 1 . 6 1 » à quatre couleurs : or, bleu glace, rose, violet */
    ['1','.','6','1'].forEach(function(ch,ci){const cc=document.createElement('canvas');cc.width=48;cc.height=64;const x=cc.getContext('2d'),d=x.createLinearGradient(0,8,0,56);d.addColorStop(0,TEINTES[ci][0]);d.addColorStop(1,TEINTES[ci][1]);x.fillStyle=d;x.font='44px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(ch,24,34);spr.push(cc);});
    const sprH=[],HB=[42,200,340,265]; /* la boule qui change de couleur : 24 teintes par signe (départ : or, bleu glace, rose, violet), toutes décalées pareil au fil du temps */
    for(let ci=0;ci<4;ci++){sprH.push([]);for(let st=0;st<24;st++){const h=(HB[ci]+15*st)%360,cc=document.createElement('canvas');cc.width=48;cc.height=64;const x=cc.getContext('2d'),d=x.createLinearGradient(0,8,0,56);d.addColorStop(0,'hsl('+h+',100%,86%)');d.addColorStop(1,'hsl('+h+',95%,56%)');x.fillStyle=d;x.font='44px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(['1','.','6','1'][ci],24,34);sprH[ci].push(cc);}}
    return{sprH:sprH,R:R,cx:cx,cy:cy,n:n,px:px,py:py,pz:pz,dl:dl,tf:tf,fx:fx,gk:gk,spr:spr,gs:Math.max(9*ku,R*.2)};
  }
  /* 10. BOULE (2026-10-23 soir) : seulement la sphère de « 1.61 » ; elle tourne lentement tant que ça charge, s'arrête quand c'est prêt ; l'appui la fait exploser en CASH CAR (dActe3), puis le voile fond vers le jeu. */
  let pasSon=-1;
  let bYaw=0,bPit=0,bVy=0,bVp=0,bDown=false,bMove=0,bLx=0,bLy=0,bLt=0,bTP=null,bGlisse=false; /* la boule se tourne au doigt : angle et pente ajoutés, vitesse (inertie), le doigt est-il posé, la distance parcourue, un glissement vient-il d'avoir lieu */
  function boulePointeur(){
    if(!BOULE)return;
    sp.style.touchAction='none';
    sp.addEventListener('pointerdown',function(ev){
      bDown=true;bMove=0;bLx=ev.clientX;bLy=ev.clientY;bLt=performance.now();bVy=0;bVp=0;
      try{if(SON&&filmMuet&&iAC&&!SON.dr){ /* le film partait muet : ce premier geste libère le son, la suite sonne */
        iAC.resume();filmMuet=false;SON.suite();SON.charge(iAC.currentTime+.05,(performance.now()-tLance)/1000-latV,pretT!==null);}}catch(x){}
    },true);
    addEventListener('pointermove',function(ev){
      if(!bDown)return;
      const dx=ev.clientX-bLx,dy=ev.clientY-bLy,now=performance.now(),dtt=Math.max(.008,(now-bLt)/1000);
      bMove+=Math.abs(dx)+Math.abs(dy);bYaw+=dx*.012;bPit=borne(bPit+dy*.008,-1.1,1.1);bVy=borne(dx*.012/dtt,-8,8);bVp=borne(dy*.008/dtt,-5,5);bLx=ev.clientX;bLy=ev.clientY;bLt=now;
    });
    const lache=function(){if(!bDown)return;bDown=false;if(bMove>12){bGlisse=true;setTimeout(function(){bGlisse=false;},400);}if(performance.now()-bLt>120){bVy=0;bVp=0;}};
    addEventListener('pointerup',lache);addEventListener('pointercancel',lache);
  }
  function dBoule(c,t,e){
    const dtf=bTP===null?0:borne(t-bTP,0,.1);bTP=t;
    if(!bDown){bYaw+=bVy*dtf;bPit+=bVp*dtf;const f=Math.exp(-dtf*2.5);bVy*=f;bVp*=f;bPit*=Math.exp(-dtf*.8);}
    const W0=.5,tau=.7,pt=pretT,tp=tapT;
    const rot=.6+bYaw+W0*t; /* elle tourne sans jamais s'arrêter */
    const cr=Math.cos(rot),sr=Math.sin(rot),ct=Math.cos(.38+bPit),st=Math.sin(.38+bPit),pls=Math.sin(t*3.2),R=e.R*(1+.06*pls),gs=e.gs*(1+.05*pls),s=tp===null?-1:Math.max(0,t-tp); /* elle respire : un léger pouls */
    const ex=s>0?9*(1-Math.pow(1-borne(s/.7,0,1),3)):0,ea=s>0?1-lisse(.15,.75,s):1;
    c.save();
    c.globalCompositeOperation='lighter';halo(c,SPR.or,e.cx,e.cy,R*1.7,R*1.7,(.2*lisse(.8,4,t)+.08*pls)*ea+(s>0?.9*Math.exp(-s*7):0));c.globalCompositeOperation='source-over';
    const pas=Math.floor(t*2.2)%24; /* la teinte avance de 15° toutes les 0,45 s : un tour complet en 11 s */
    if(pasSon!==Math.floor(t*2.2)){pasSon=Math.floor(t*2.2);if(t>3&&tp===null&&pasSon%2===0){try{if(SON&&!filmMuet&&iAC&&SON.dr)SON.note(iAC.currentTime+.02,pasSon>>1);}catch(x){}}} /* une cloche tous les deux pas : elle suit la couleur */
    if(PCI_ON){if(ea>0){ /* (passe perf PC, voir LE FILM SANS TRAVAIL REFAIT) le même dessin au bit près : mêmes expressions, même ordre (les points de derrière, puis ceux de devant, par i croissant) */
      if(!e.pciT0){const T0=new Float64Array(e.n);for(let i=0;i<e.n;i++)T0[i]=.8+Math.pow(i/e.n,.9)*3.2;e.pciT0=T0;e.pciQ=new Float64Array(e.n*4);e.pciZ=new Int8Array(e.n);
        if(typeof createImageBitmap==='function')e.sprH.forEach(function(L,ci){L.forEach(function(cc,st){try{createImageBitmap(cc).then(function(b){if(e.sprH[ci][st]===cc)e.sprH[ci][st]=b;},function(){});}catch(x){}});});} /* les vignettes en ImageBitmap (mêmes pixels) dès qu'elles sont prêtes */
      const T0=e.pciT0,Q=e.pciQ,Z=e.pciZ,gr=1+.6*borne(s/.7,0,1);
      for(let i=0;i<e.n;i++){
        const k=borne((t-T0[i])/.55,0,1);if(k<=0){Z[i]=-1;continue;}
        const b=(1-Math.pow(1-k,3))*(1+ex),x1=e.px[i]*cr+e.pz[i]*sr,z1=-e.px[i]*sr+e.pz[i]*cr,y2=e.py[i]*ct-z1*st,z2=e.py[i]*st+z1*ct;
        const sx=e.cx+x1*R*b,sy=e.cy+y2*R*b;if(sx<-gs||sx>W+gs||sy<-gs||sy>H+gs){Z[i]=-1;continue;}
        const dp=z2*.5+.5,sz=gs*(.55+.45*dp)*gr;Z[i]=z2>=0?1:0;Q[4*i]=sx-sz*.35;Q[4*i+1]=sy-sz*.5;Q[4*i+2]=sz;Q[4*i+3]=(.5+.5*dp)*lisse(0,.15,k)*ea;
      }
      for(let pass=0;pass<2;pass++)for(let i=0;i<e.n;i++)if(Z[i]===pass){c.globalAlpha=Q[4*i+3];c.drawImage(e.sprH[e.gk[i]][pas],Q[4*i],Q[4*i+1],Q[4*i+2]*.7,Q[4*i+2]);}
    }}else
    if(ea>0)for(let pass=0;pass<2;pass++)for(let i=0;i<e.n;i++){
      const k=borne((t-(.8+Math.pow(i/e.n,.9)*3.2))/.55,0,1);if(k<=0)continue; /* noir d'abord, puis la boule se dessine point après point, en spirale du bas vers le haut */
      const b=(1-Math.pow(1-k,3))*(1+ex),x1=e.px[i]*cr+e.pz[i]*sr,z1=-e.px[i]*sr+e.pz[i]*cr,y2=e.py[i]*ct-z1*st,z2=e.py[i]*st+z1*ct;
      if((z2>=0?1:0)!==pass)continue;
      const sx=e.cx+x1*R*b,sy=e.cy+y2*R*b;if(sx<-gs||sx>W+gs||sy<-gs||sy>H+gs)continue;
      const dp=z2*.5+.5,sz=gs*(.55+.45*dp)*(1+.6*borne(s/.7,0,1));c.globalAlpha=(.5+.5*dp)*lisse(0,.15,k)*ea;c.drawImage(e.sprH[e.gk[i]][pas],sx-sz*.35,sy-sz*.5,sz*.7,sz);
    }
    c.globalAlpha=1;c.restore();
  }
  const LABELS={boule:{geo:geoLabSphere,dessin:dBoule}};

  /* ---- LE GROS LOGO CASH CAR : chaque lettre est peinte une fois (extrusion brune, face dorée ou couchant), puis posée/secouée à volonté ---- */
  function peintLettre(c,ch,mot,fs,dp,mg){
    c.setTransform(S,0,0,S,0,0);
    const base=mg+fs*.88,capH=fs*.875,cxm=(fs+2*mg)/2,cym=base-capH/2;
    c.translate(cxm,cym);c.transform(1,0,-.1944,1,0,0);c.translate(-cxm,-cym); /* la pente de la vitesse, −11° : celle du logo de l'accueil */
    c.font=fs+'px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='alphabetic';
    for(let k=dp;k>=1;k--){const q=dp>1?(k-1)/(dp-1):0;c.fillStyle='rgb('+Math.round(entre(110,42,q))+','+Math.round(entre(63,21,q))+',0)';c.fillText(ch,cxm,base+k);} /* l'épaisseur */
    c.lineJoin='miter';c.lineWidth=Math.max(1.5,fs*.045);c.strokeStyle='rgba(58,26,0,.95)';c.strokeText(ch,cxm,base);
    const d=c.createLinearGradient(0,base-capH,0,base);
    const st=mot===0?[[0,'#fffef6'],[.16,'#fff2bd'],[.34,'#ffd84f'],[.48,'#ffb000'],[.60,'#8f4c00'],[.70,'#c57800'],[.84,'#ffcf48'],[1,'#fff1ba']] /* CASH : l'or métallique, une bande ambrée à l'horizon */
      :[[0,'#fff5c8'],[.2,'#ffd75e'],[.4,'#ff9d3a'],[.58,'#ff5d5a'],[.76,'#ff2f8e'],[1,'#b13cff']]; /* CAR : le coucher de soleil */
    st.forEach(s=>d.addColorStop(s[0],s[1]));
    c.fillStyle=d;c.fillText(ch,cxm,base);
  }
  function faitLogo(){
    const lg0=W>H*1.15,fs=Math.min(.80*W/4,(lg0?.26:.32)*H),dp=Math.max(3,Math.round(fs*.09)),mg=Math.ceil(fs*.5),lw=fs+2*mg,lh=fs+dp+2*mg,cyL=H*(lg0?.43:.47),lg=fs*1.22,lettres=[];
    [['CASH',0],['CAR',1]].forEach(function(m,li){
      const yc=cyL+(li-.5)*lg,dx=-.1944*(yc-cyL); /* l'inclinaison décale la ligne du haut à droite, celle du bas à gauche */
      for(let i=0;i<m[0].length;i++){
        const c=document.createElement('canvas');c.width=Math.ceil(lw*S);c.height=Math.ceil(lh*S);
        peintLettre(c.getContext('2d'),m[0][i],li,fs,dp,mg);
        lettres.push({cv:c,sr:silhouette(c,'rgb(255,50,70)'),sc:silhouette(c,'rgb(40,210,255)'),x:W/2+dx+(i-(m[0].length-1)/2)*fs,y:yc,ox:-lw/2,oy:-(mg+fs*.4425),w:lw,h:lh,ph:lettres.length*1.9,mot:li,sw:null});
      }
    });
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const l of lettres){x0=Math.min(x0,l.x+l.ox);y0=Math.min(y0,l.y+l.oy);x1=Math.max(x1,l.x+l.ox+l.w);y1=Math.max(y1,l.y+l.oy+l.h);}
    const gm=fs*.5,gx=x0-gm,gy=y0-gm,gw=x1-x0+2*gm,gh=y1-y0+2*gm,glow=document.createElement('canvas');glow.width=Math.ceil(gw*S);glow.height=Math.ceil(gh*S);
    const gc=glow.getContext('2d'),BIG=6000; /* le halo : l'ombre portée d'un logo posé HORS du canvas (seule son ombre y retombe) */
    for(const l of lettres){gc.save();gc.shadowOffsetX=BIG;gc.shadowColor=l.mot?'rgba(255,100,170,.95)':'rgba(255,190,70,.95)';gc.shadowBlur=fs*.3*S;
      gc.drawImage(l.cv,(l.x+l.ox-gx)*S-BIG,(l.y+l.oy-gy)*S,l.cv.width,l.cv.height);gc.restore();}
    const gt=document.createElement('canvas');gt.width=lettres[0].cv.width;gt.height=lettres[0].cv.height; /* la feuille où un reflet est découpé dans la lettre */
    for(const l of lettres)l.sw=silhouette(l.cv,'#fff');
    LOGO={lettres:lettres,glow:glow,gx:gx,gy:gy,gw:gw,gh:gh,cy:cyL,fs:fs,bw:x1-x0,bh:y1-y0,gt:gt};
  }

  /* ---- LES FISSURES ET LES ÉCLATS : une toile d'araignée (rais + anneaux, bosselée), clippée à l'écran ---- */
  function clipRect(P,x0,y0,x1,y1){
    let out=P;
    for(const b of [[0,1,x0],[0,-1,-x1],[1,1,y0],[1,-1,-y1]]){ /* garde les points où sens × coordonnée ≥ seuil */
      const inp=out;out=[];if(!inp.length)break;
      for(let i=0;i<inp.length;i++){const a=inp[i],c=inp[(i+1)%inp.length],da=b[1]*a[b[0]]-b[2],dc=b[1]*c[b[0]]-b[2];
        if(da>=0)out.push(a);
        if((da>=0)!==(dc>=0)){const k=da/(da-dc);out.push([a[0]+(c[0]-a[0])*k,a[1]+(c[1]-a[1])*k]);}}
    }
    return out;
  }
  function fracture(px,py){ /* l'écran se brise en TUILES carrées de tailles inégales (petites près du logo), comme une mosaïque de pixels : le style du jeu */
    const R=hasard(Math.floor(Math.random()*1e9)),cx=Math.round(px!=null?px:W/2),cy=Math.round(py!=null?py:LOGO.cy);
    const dMax=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy));
    const base=Math.max(64,Math.round(Math.max(W,H)/6.5/8)*8),tuiles=[];
    const decoupe=function(x,y,s,lv){
      const d=Math.hypot(x+s/2-cx,y+s/2-cy)/dMax,p=lv>=3?0:Math.max(0,1.05-d*2.2)*(1-.18*lv);
      if(s>=32&&R()<p){const h=s/2;decoupe(x,y,h,lv+1);decoupe(x+h,y,h,lv+1);decoupe(x,y+h,h,lv+1);decoupe(x+h,y+h,h,lv+1);}
      else tuiles.push({x:x,y:y,s:s,cx:x+s/2,cy:y+s/2,dn:d});
    };
    const gx0=cx-Math.ceil(cx/base)*base,gy0=cy-Math.ceil(cy/base)*base; /* le centre du logo est un sommet de la grille */
    for(let y=gy0;y<H;y+=base)for(let x=gx0;x<W;x+=base)decoupe(x,y,base,0);
    tuiles.sort((a,b)=>b.dn-a.dn); /* les plus éloignées d'abord : celles du centre passent par-dessus */
    MESH={tuiles:tuiles,cx:cx,cy:cy,dMax:dMax};
  }
  function dEtincelles(c,L,t){
    c.globalCompositeOperation='lighter';c.fillStyle='rgb(255,214,120)';
    for(let i=0;i<L.length;i++){const s=L[i],a=t-s.tb;if(a<0||a>s.life)continue;const k=a/s.life,al=(1-k)*(1-k),x=s.x+s.vx*a,y=s.y+s.vy*a+.5*520*ku*a*a,z=s.sz*(1-.5*k)*ku;
      c.globalAlpha=al;c.fillRect(x,y,z,z);if(s.w>.7)halo(c,SPR.or,x,y,z*5,z*5,.4*al);}
    c.globalCompositeOperation='source-over';c.globalAlpha=1;
  }

  /* ---- ACTE 3 : le logo (mode 1 = la photo, sans secousse ni fissures, pour les éclats) ---- */
  function secousse(t){ /* le logo ATTEND qu'on le touche : un frémissement léger, après le coup du claquement */
    const u=t-TL.slam;
    if(RM)return{x:0,y:0,r:0,k:.2,a:0};
    const k=.2+.05*Math.sin(u*2.1),a=(.4+.9*lisse(.3,1.4,u))*ku;
    let jx=0,jy=0;
    if(u>=0){const e=Math.exp(-u*14);jx+=Math.cos(.7)*16*e*ku;jy+=Math.sin(.7)*11*e*ku;}
    const f1=Math.sin(u*97+1.3)+Math.sin(u*151+.4)*.6+Math.sin(u*233+2.1)*.35,f2=Math.sin(u*89+2.2)+Math.sin(u*167+1.1)*.6+Math.sin(u*251+.7)*.35;
    return{x:f1*a*.5+jx,y:f2*a*.5+jy,r:(Math.sin(u*71)+Math.sin(u*123+1))*.5*(.003+.006*k),k:k,a:a};
  }
  function dLettres(c,t,u,s,alpha,sk,fantomes,reflet){
    const L=LOGO,cxL=W/2,cyL=L.cy,k=sk.k;
    c.save();c.translate(cxL,cyL);c.scale(s,s);c.translate(-cxL,-cyL);
    const ca=(1.2+sk.a*.8+16*Math.exp(-u*9))*ku;
    for(let i=0;i<L.lettres.length;i++){const l=L.lettres[i],ui=u-i*.004;if(ui<0)continue;
      const a=lisse(0,.05,ui)*alpha,jx=(Math.sin(u*61+l.ph)+Math.sin(u*107+l.ph*2))*sk.a*.45,jy=(Math.sin(u*67+l.ph*1.5)+Math.sin(u*113+l.ph))*sk.a*.45,jr=Math.sin(u*83+l.ph*3)*.012*k;
      c.save();c.translate(l.x+jx,l.y+jy);c.rotate(jr);
      if(fantomes){c.globalCompositeOperation='lighter';c.globalAlpha=.5*a*Math.max(Math.exp(-u*5),.2+.8*k);c.drawImage(l.sr,l.ox-ca,l.oy,l.w,l.h);c.drawImage(l.sc,l.ox+ca,l.oy,l.w,l.h);c.globalCompositeOperation='source-over';}
      c.globalAlpha=a;c.drawImage(l.cv,l.ox,l.oy,l.w,l.h);
      if(reflet>0&&reflet<1){ /* le reflet : la silhouette de la lettre, éclairée par une bande qui passe (découpée dans la feuille de travail) */
        const gt=L.gt,x=gt.getContext('2d'),bx=entre(L.gx,L.gx+L.gw,reflet)-(l.x+jx+l.ox),bw=L.fs*.55;
        x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,gt.width,gt.height);x.drawImage(l.sw,0,0);
        x.globalCompositeOperation='source-in';x.setTransform(S,0,0,S,0,0);
        const d=x.createLinearGradient(bx-bw,0,bx+bw,bw*.5);d.addColorStop(0,'rgba(255,255,255,0)');d.addColorStop(.5,'rgba(255,255,255,.95)');d.addColorStop(1,'rgba(255,255,255,0)');
        x.fillStyle=d;x.fillRect(0,0,l.w,l.h);x.globalCompositeOperation='source-over';
        c.globalCompositeOperation='lighter';c.globalAlpha=.85*a;c.drawImage(gt,l.ox,l.oy,l.w,l.h);c.globalCompositeOperation='source-over';}
      c.restore();}
    c.restore();
  }
  function dIndice(c,t){ /* l'invitation, très discrète : le logo attend qu'on le touche */
    const a=lisse(0,.8,t-TL.slam-1.2)*(.45+.25*Math.sin((t-TL.slam)*3.1));if(a<=.01)return;
    c.save();c.globalAlpha=a;c.fillStyle='#fff1cf';c.textAlign='center';c.textBaseline='middle';c.font=Math.max(9,Math.round(11*ku))+'px "Press Start 2P",monospace';
    c.fillText(LANG==='fr'?'TOUCHE':'TAP',W/2,Math.min(H-16*ku,LOGO.cy+1.55*LOGO.fs));c.restore();
  }
  function dActe3(c,t,mode){
    const u=t-TL.slam,L=LOGO,cxL=W/2,cyL=L.cy,sk=mode?{x:0,y:0,r:0,k:1,a:0}:secousse(t),k=sk.k,ap=lisse(0,.2,u);
    c.save();c.translate(cxL,cyL);c.rotate(sk.r);c.translate(-cxL+sk.x,-cyL+sk.y);
    c.globalCompositeOperation='lighter';
    const pulse=1+.08*Math.sin(u*38)*k;
    halo(c,SPR.or,cxL,cyL,W*.95*pulse,Math.max(H*.4,W*.8)*pulse,(.30+.34*k)*ap); /* la lumière derrière */
    {const rr=Math.hypot(W,H)*.62;c.save();c.translate(cxL,cyL);c.rotate(RM?0:u*.16);c.globalAlpha=(.10+.32*k)*lisse(0,.25,u);c.drawImage(RAY,-rr,-rr,2*rr,2*rr);c.restore();}
    c.globalAlpha=(.55+.4*k)*ap;c.drawImage(L.glow,L.gx,L.gy,L.gw,L.gh);
    c.globalCompositeOperation='source-over';
    const sl=u<.2?1+.16*(1-sort3(u/.2)):1+(u<.8?.035*Math.sin((u-.26)*26)*Math.exp(-(u-.26)*8):0);
    if(u<.2&&!mode){for(let m=4;m>=1;m--)dLettres(c,t,u,sl*(1+.03*m),.2/m,sk,false);} /* le claquement : les images de l'approche, en traînée */
    dLettres(c,t,u,sl,1,sk,!mode,mode?-1:((u-.42)%2.8)/.6); /* un reflet traverse le logo après le claquement, puis toutes les 2,8 s */
    /* l'éclair du claquement et son onde de choc */
    c.globalCompositeOperation='lighter';
    const rf=Math.hypot(W,H)*.5;halo(c,SPR.bl,cxL,cyL,rf,rf,Math.exp(-u*12)*.8*(u>=0?1:0));
    if(u<.55){c.globalAlpha=Math.max(0,.7-u*1.3);c.strokeStyle='rgb(255,224,150)';c.lineWidth=(6-9*u)*ku;c.beginPath();c.arc(cxL,cyL,u*W*1.2,0,6.2832);c.stroke();}
    c.restore();
  }

  /* LE « PRESENTS » (2026-10-24, Léo : « enlève le premier CASH CAR ; après l'explosion, PRESENTS, puis l'écran menu ciel avec la musique qui apparaît ») : la boule explose, le mot s'écrit
     lettre à lettre sur le noir (or, interlettrage qui se resserre), tient, s'éteint ; PUIS le voile fond sur le ciel, et c'est là, là seulement, que la musique du lobby démarre (`reveler`).
     Le gros logo CASH CAR du film (`dActe3`) n'est plus montré après l'appui : le premier CASH CAR du jeu est celui du menu. s = secondes depuis l'appui. */
  const PRES_FIN=4.1; /* l'instant (s après l'appui) où le texte est éteint ; le voile fond juste après (2026-10-24 : 2,5 → 4,1 s, Léo : « laisse le temps d'apprécier ») */
  function dPresente(c,s,e){
    const sor=1-lisse(PRES_FIN-.7,PRES_FIN,s);if(sor<=.004)return;
    /* (2026-10-24, Léo : « au lieu de PRESENTS, 1.61 STUDIO PRESENTS ») deux lignes : « 1.61 STUDIO » en grand (le « 1.61 » blanc chaud, STUDIO en or), un filet d'or qui s'ouvre depuis le centre,
       puis « PRESENTS » plus petit, très espacé, crème. La ligne du haut s'écrit lettre à lettre (0,7 s), le filet suit, le mot du bas arrive en dernier. */
    const t1='1.61 STUDIO',t2='PRESENTS',n1=t1.length,n2=t2.length;
    const px=Math.max(9,Math.round(Math.min(W/23,H/9,30))),px2=Math.max(8,Math.round(px*.5)),k=sort3((s-.7)/1.5),esp=px*(.95-.5*k);
    const tot=n1*px+(n1-1)*esp,y1=e.cy-px*.1,yR=e.cy+px*.62,y2=yR+px2*2.1;
    c.save();c.textAlign='left';c.textBaseline='alphabetic';c.font=px+'px "Press Start 2P",monospace';
    const grO=c.createLinearGradient(0,y1-px,0,y1);grO.addColorStop(0,'#fff2be');grO.addColorStop(.5,'#ffd75e');grO.addColorStop(1,'#e8a53a');
    const grB=c.createLinearGradient(0,y1-px,0,y1);grB.addColorStop(0,'#ffffff');grB.addColorStop(1,'#ffe9b8');
    let x=W/2-tot/2;
    for(let i=0;i<n1;i++){
      const la=lisse(.7+i*.07,1.15+i*.07,s)*sor;
      if(la>.004){c.globalAlpha=la;c.fillStyle='#1c0430';c.fillText(t1[i],x+px*.12,y1+px*.12);c.fillStyle=i<4?grB:grO;c.fillText(t1[i],x,y1);}
      x+=px+esp;
    }
    /* le filet d'or : il s'ouvre depuis le centre */
    const fl=sort3((s-1.55)/.9);
    if(fl>.004){const wl=tot*.62*fl,g=c.createLinearGradient(W/2-wl/2,0,W/2+wl/2,0);g.addColorStop(0,'rgba(255,215,94,0)');g.addColorStop(.5,'rgba(255,226,150,1)');g.addColorStop(1,'rgba(255,215,94,0)');
      c.globalAlpha=sor*.9;c.fillStyle=g;c.fillRect(W/2-wl/2,yR,wl,Math.max(1,Math.round(px*.1)));}
    /* « PRESENTS » : plus petit, l'interlettrage se resserre doucement */
    const k2=sort3((s-1.9)/1.5),esp2=px2*(2.4-1.3*k2),tot2=n2*px2+(n2-1)*esp2;
    c.font=px2+'px "Press Start 2P",monospace';x=W/2-tot2/2;
    for(let i=0;i<n2;i++){
      const la=lisse(1.9+i*.09,2.4+i*.09,s)*sor;
      if(la>.004){c.globalAlpha=la*.92;c.fillStyle='#1c0430';c.fillText(t2[i],x+px2*.12,y2+px2*.12);c.fillStyle='#ffe9c4';c.fillText(t2[i],x,y2);}
      x+=px2+esp2;
    }
    c.restore();
  }

  /* ---- LA CASSE : la photo de la scène, découpée en éclats qui volent (position = fonction du temps) ---- */
  function prepSnap(){ /* la photo du logo « au repos » (celle que les tuiles montrent) et sa version en gros pixels : prises un peu AVANT la casse, pour que l'image de l'impact n'ait pas à les fabriquer */
    if(SNAP)return;
    const sn=document.createElement('canvas');sn.width=cv.width;sn.height=cv.height;
    const sg=sn.getContext('2d');sg.setTransform(S,0,0,S,0,0);sg.fillStyle='#000';sg.fillRect(0,0,W,H);dActe3(sg,TL.casse,1);
    SNAP=sn;SNAPPIX=pixelise(sn,Math.max(4,Math.round(5*ku)));
  }
  function casser(tc,muet){
    if(casse)return;
    casse=true;tCasse=tc;
    try{
    SK0=muet?{x:0,y:0}:secousse(tc);
    if(TOUCH)fracture(TOUCH.x,TOUCH.y); /* la casse part de l'endroit TOUCHÉ */
    prepSnap(); /* la scène « au repos » (déjà prise un peu avant, sinon ici) */
    const R=hasard(Math.floor(Math.random()*1e9)),ku2=Math.hypot(W,H)/2/465,L=[];
    for(const s of MESH.tuiles){
      const dx=s.cx-MESH.cx,dy=s.cy-MESH.cy,d=Math.hypot(dx,dy),dn=d/MESH.dMax,ang=d>1?Math.atan2(dy,dx):R()*6.28;
      const vr=ku2*(1000/(1+3*dn)+140+R()*160),life=.8+R()*.45;
      L.push({x:s.x,y:s.y,s:s.s,cx:s.cx,cy:s.cy,dl:dn*.06+R()*.015,vx:Math.cos(ang)*vr,vy:Math.sin(ang)*vr,zs:.5+3.2*(1-dn)*(.6+.4*R()),Z:1.5+1.4*(1-dn),life:life,g:ku2*800}); /* Z : l'agrandissement de la loupe */
    }
    ECL=L;
    const E2=[],R2=hasard(21);for(let i=0;i<120;i++){const a=R2()*6.2832,v=(200+R2()*700)*ku;E2.push({tb:0,x:MESH.cx+(R2()-.5)*60,y:MESH.cy+(R2()-.5)*40,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80*ku,life:.5+R2()*.9,sz:1.2+R2()*3,w:R2()});}ETC=E2;
    const R3=hasard(61),uu=Math.max(2,Math.round(2.2*ku)),P3=[];for(let i=0;i<190;i++){const a=R3()*6.2832,v=(260+R3()*950)*ku;P3.push({x:MESH.cx+(R3()-.5)*50,y:MESH.cy+(R3()-.5)*30,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120*ku,sz:(1+Math.floor(R3()*3))*uu,col:R3()<.35?2:R3()<.6?1:R3()<.75?0:Math.floor(R3()*7),zs:1+R3()*3.2,life:.7+R3()*.85,dl:R3()*.05});}PXC=P3;
    }catch(e){window.__introErr=String(e&&e.stack||e).slice(0,400);if(!muet)secours();return;} /* les éclats n'ont pas pu se préparer : le jeu s'ouvre, sans casse */
    if(muet)return;
    ouvrir();reveler();
    programmerCasse(true); /* (le son de la casse : tout de suite, c'est le toucher) */
    setTimeout(finir,(DUREE_CASSE+.15)*1000);
  }
  function dEclats(c,t4){
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.setTransform(S,0,0,S,0,0);
    const gk=Math.exp(-t4*18),gx=SK0.x*gk,gy=SK0.y*gk;
    c.globalCompositeOperation='lighter'; /* le souffle de lumière, DERRIÈRE les éclats */
    const rr=entre(.18,1.25,sort3(t4/.55))*MESH.dMax;halo(c,SPR.ch,MESH.cx,MESH.cy,rr,rr,.85*(1-lisse(.05,.75,t4)));
    c.globalCompositeOperation='source-over';c.globalAlpha=1;
    const pq=Math.max(4,Math.round(5*ku)),fg=GAMECV?GAMECV.width/W:0;
    for(const s of ECL){ /* chaque tuile : la photo du logo, nette puis en gros pixels, et par-dessus une LOUPE sur le jeu (agrandi, en gros pixels) */
      const tt=Math.max(0,t4-s.dl);if(tt>=s.life)continue;
      const tm=tt<.03?0:tt-.03,a=1-lisse(.42*s.life,s.life,tt),sc=1+s.zs*tm*(1+.8*tm),w=s.s*sc,x=gx+s.cx+s.vx*tm,y=gy+s.cy+s.vy*tm+.5*s.g*tm*tm,l=x-w/2,tp=y-w/2;
      const ka=lisse(0,.2,tm),kb=lisse(.05,.3,tm)*a;
      if(a*(1-ka)>.01){c.imageSmoothingEnabled=true;c.globalAlpha=a*(1-ka);c.drawImage(SNAP,s.x*S,s.y*S,s.s*S,s.s*S,l,tp,w,w);}
      c.imageSmoothingEnabled=false;
      if(ka>.01&&SNAPPIX){c.globalAlpha=a*ka;c.drawImage(SNAPPIX,s.x/pq,s.y/pq,s.s/pq,s.s/pq,l,tp,w,w);}
      if(GAMECV&&kb>.02){const sw_=w/s.Z;c.globalAlpha=kb;c.drawImage(GAMECV,(x-sw_/2)*fg,(y-sw_/2)*fg,sw_*fg,sw_*fg,l,tp,w,w);}
      if(GLOSS){c.globalAlpha=.22*a;c.drawImage(GLOSS,l,tp,w,w);}
      c.globalAlpha=.75*a;c.strokeStyle='rgb(255,226,160)';c.lineWidth=ku;c.strokeRect(Math.round(l)+.5,Math.round(tp)+.5,Math.round(w)-1,Math.round(w)-1);
    }
    c.imageSmoothingEnabled=true;
    c.globalAlpha=1;
    dEtincelles(c,ETC,t4);
    if(PXC){c.imageSmoothingEnabled=false; /* les cubes-pixels de la casse */
      for(const q of PXC){const tt=t4-q.dl;if(tt<0||tt>q.life)continue;const f=tt/q.life,z=q.sz*(1+q.zs*tt),x=Math.round(MESH.cx+q.vx*tt-z/2),y=Math.round(MESH.cy+q.vy*tt+.5*900*ku*tt*tt-z/2);
        c.globalAlpha=f<.6?1:1-(f-.6)/.4;c.fillStyle=PAL_FEU[q.col];c.fillRect(x,y,z,z);}
      c.globalAlpha=1;}
    const fa=.9*Math.exp(-t4*9); /* le flash de l'impact */
    if(fa>.02){c.globalCompositeOperation='lighter';halo(c,SPR.bl,MESH.cx,MESH.cy,W*.7,H*.55,fa);c.globalCompositeOperation='source-over';}
    c.globalAlpha=1;
  }

  /* ---- LE SON : tout est fabriqué ici (WebAudio) ; `A` peut être un AudioContext ou un OfflineAudioContext (le banc de mesure).
     Le travail est ÉTALÉ, pour qu'aucune image ne soit sacrifiée : au toucher seulement l'allumage ; `suite()` juste après (réverbération, blips,
     coup final) ; `acte3()` dans le noir complet (claquement, tension) ; `casse(q)` à l'instant de la casse. ---- */
  let IR48=null; /* la réponse de la réverbération, calculée À L'ATTENTE du toucher (10 ms), à 48 kHz */
  function pixelise(src,pq){ /* une copie en petit (1 pixel pour pq × pq) : redessinée sans lissage, elle donne de gros pixels */
    const c2=document.createElement('canvas');c2.width=Math.max(1,Math.ceil(W/pq));c2.height=Math.max(1,Math.ceil(H/pq));const x=c2.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(src,0,0,c2.width,c2.height);return c2;
  }
  function demanderPrise(){ /* l'intro demande une photo de la scène 3D du jeu : la boucle du jeu la prend juste après son rendu (voir boucle-6-hud.js) ; on la verra, agrandie, à travers les tuiles */
    if(priseFaite)return;priseFaite=true;
    window.__introPrise=function(src){try{GAMECV=pixelise(src,Math.max(4,Math.round(5*ku)));}catch(e){GAMECV=null;}}; /* (aucune lecture de pixel : elle forcerait le processeur graphique à finir son image, un accroc juste avant la casse) */
  }
  function irPret(){
    if(IR48)return;
    const sr=48000,n=Math.floor(sr*2.4),c=[new Float32Array(n),new Float32Array(n)];
    for(let ch=0;ch<2;ch++){const d=c[ch];let y=0;for(let i=0;i<n;i++){const k=i/n,a=.9-.8*Math.pow(k,.35);y+=a*((Math.random()*2-1)-y);d[i]=y*Math.pow(1-k,2.4)*(k<.004?k/.004:1);}}
    IR48=c;
  }
  function construitSon(A,t0,dest){
    const comp=A.createDynamicsCompressor();comp.threshold.value=-11;comp.knee.value=10;comp.ratio.value=6;comp.attack.value=.003;comp.release.value=.2;
    const trim=A.createGain();trim.gain.value=.38;comp.connect(trim);trim.connect(dest); /* −8,4 dB APRÈS le compresseur : mesuré au banc, le claquement et la casse montaient à −0,1 dBFS (RMS −9,6 dB) ; ils tiennent maintenant vers −7,5, comme le plus fort de l'ancienne intro (la fission : −8,4 / −16,9) */
    const master=A.createGain();master.gain.value=1;master.connect(comp);
    const busB=A.createGain();busB.gain.value=1;busB.connect(master); /* la tension (grondement, craquements) : un seul fader pour la couper si on passe */
    const nz=A.createBuffer(1,A.sampleRate*2,A.sampleRate);{const d=nz.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const send=A.createGain();send.connect(master); /* (branché à la réverbération par `suite`) */
    const eco=A.createGain();eco.gain.value=1; /* l'écho en ping-pong des blips */
    {const dL=A.createDelay(.5),dR=A.createDelay(.5),fL=A.createGain(),fR=A.createGain(),lp=A.createBiquadFilter(),mg=A.createChannelMerger(2);
      dL.delayTime.value=.085;dR.delayTime.value=.127;fL.gain.value=.32;fR.gain.value=.32;lp.type='lowpass';lp.frequency.value=3200;
      eco.connect(lp);lp.connect(dL);lp.connect(dR);dL.connect(fL);fL.connect(dL);dR.connect(fR);fR.connect(dR);dL.connect(mg,0,0);dR.connect(mg,0,1);mg.connect(master);}
    const env=(t,pk,atk,dec)=>{const x=A.createGain();x.gain.setValueAtTime(.0001,t);x.gain.exponentialRampToValueAtTime(Math.max(.0003,pk),t+atk);x.gain.exponentialRampToValueAtTime(.0002,t+atk+dec);return x;};
    const pan=x=>{if(A.createStereoPanner){const p=A.createStereoPanner();p.pan.value=x||0;return p;}return A.createGain();};
    function oscil(sortie,type,f0,f1,t,d,pk,atk,dec,x,w){ /* un ton qui glisse de f0 à f1 en d secondes, enveloppé ; w = part envoyée à la réverbération */
      const o=A.createOscillator(),e=env(t,pk,atk,dec),p=pan(x);
      o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+d);
      o.connect(e);e.connect(p);p.connect(sortie);
      if(w){const s=A.createGain();s.gain.value=w;p.connect(s);s.connect(send);}
      o.start(t);o.stop(t+atk+dec+.05);
    }
    function souffle(sortie,t,d,type,f0,f1,q,pk,atk,dec,x,w){ /* un souffle de bruit filtré, dont le filtre glisse de f0 à f1 */
      const s=A.createBufferSource();s.buffer=nz;s.loop=true;
      const fl=A.createBiquadFilter(),e=env(t,pk,atk,dec),p=pan(x);
      fl.type=type;fl.Q.value=q||1;fl.frequency.setValueAtTime(f0,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+d);
      s.connect(fl);fl.connect(e);e.connect(p);p.connect(sortie);
      if(w){const m=A.createGain();m.gain.value=w;p.connect(m);m.connect(send);}
      s.start(t,Math.random()*1.5);s.stop(t+atk+dec+.05);
    }
    function blip(t,f,pk,x,court){ /* LE BLIP : deux carrés filtrés qui montent d'un bond, un clic ; même hauteur à chaque fois (pas une note) */
      const d=court?.04:.07;
      for(const dt of [1,1.006]){
        const o=A.createOscillator(),e=env(t,pk*.5,.0015,d),fl=A.createBiquadFilter(),p=pan(x);
        o.type='square';o.frequency.setValueAtTime(f*.78*dt,t);o.frequency.exponentialRampToValueAtTime(f*dt,t+.012);
        fl.type='lowpass';fl.frequency.value=f*4.2;fl.Q.value=.8;
        o.connect(fl);fl.connect(e);e.connect(p);p.connect(master);p.connect(eco);
        const s=A.createGain();s.gain.value=.16;p.connect(s);s.connect(send);
        o.start(t);o.stop(t+d+.03);
      }
      souffle(master,t,.006,'highpass',4500,0,1,pk*.45,.0008,.005,x,0);
    }
    const T=x=>t0+x;
    /* le silence : le son coupe quand le label se dissout, et ne revient qu'avec le claquement du logo */
    /* 0. l'allumage : un coup sourd, un souffle qui monte, un tic */
    const R={ctx:A,master:master,busB:busB,fait:{suite:false,acte3:false}};
    R.suite=function(){
      if(R.fait.suite)return;R.fait.suite=true;
      irPret();const rev=A.createConvolver(); /* un grand hall sombre : du bruit qui s'éteint en s'étouffant */
      {const n=Math.floor(IR48[0].length*A.sampleRate/48000),b=A.createBuffer(2,n,A.sampleRate);
        for(let ch=0;ch<2;ch++){if(A.sampleRate===48000)b.copyToChannel(IR48[ch],ch);else{const d=b.getChannelData(ch),src=IR48[ch],r=48000/A.sampleRate;for(let i=0;i<n;i++){const p=i*r,j=Math.floor(p),f=p-j;d[i]=src[j]*(1-f)+(src[j+1]||0)*f;}}}
        rev.buffer=b;}
      const revOut=A.createGain();revOut.gain.value=.62;rev.connect(revOut);revOut.connect(master);send.connect(rev);
    };
    R.acte3=function(){}; /* (plus de claquement programmé : il sonne à l'appui, `boum`) */
    const ACC=[73.42,110,146.83,220,293.66,440]; /* l'accord de la marque : Ré, quintes et octaves, net et ouvert (pas de notes serrées) */
    function accord(q,pk,att,dec,w){for(let i=0;i<ACC.length;i++){oscil(master,'sine',ACC[i],ACC[i],q,0,pk*(i<2?1.5:1),att,dec,(i-4)*.12,w);oscil(master,'triangle',ACC[i]*1.003,ACC[i]*1.003,q,0,pk*.6,att,dec,(4-i)*.12,w);}}
    R.charge=function(q,el,pret){ /* le chargement : un grave qui monte avec la boule, mais VIVANT : il bat au rythme du pouls de la boule (3,2 rad/s), un pad dont le filtre respire, un chœur de médiums qui s'ouvre en tremblant, un souffle, un voile qui scintille, et des étincelles à mesure que les chiffres apparaissent */
      el=el||0;const dur=Math.max(.8,4.6-el),top=pret?.45:1,gs=[],oc=[];
      const P=A.createGain();P.gain.value=.78;P.connect(master); /* le pouls : tout le chargement passe là, et la boule le fait battre */
      const lf=A.createOscillator(),lg=A.createGain();lf.type='sine';lf.frequency.value=3.2/6.2832;lg.gain.value=.22;lf.connect(lg);lg.connect(P.gain);lf.start(q);oc.push(lf);
      const sub=A.createOscillator(),sg=A.createGain(),s2=A.createOscillator(),s2g=A.createGain();sub.type='sine';sub.frequency.setValueAtTime(41.2,q);sub.frequency.exponentialRampToValueAtTime(73.42,q+dur);
      s2.type='triangle';s2.frequency.setValueAtTime(82.4,q);s2.frequency.exponentialRampToValueAtTime(146.83,q+dur);s2g.gain.value=.22;s2.connect(s2g);s2g.connect(sg); /* l'octave au-dessus, pour que le grave sonne aussi sur un petit haut-parleur */
      sg.gain.setValueAtTime(.0003,q);sg.gain.exponentialRampToValueAtTime(.4*top,q+dur);sub.connect(sg);sg.connect(P);sub.start(q);s2.start(q);gs.push(sg);oc.push(sub,s2);
      const lp=A.createBiquadFilter(),pg=A.createGain(),pr=A.createGain();lp.type='lowpass';lp.Q.value=2.5;lp.frequency.setValueAtTime(180,q);lp.frequency.exponentialRampToValueAtTime(2600,q+dur);
      const fl=A.createOscillator(),fg=A.createGain();fl.type='sine';fl.frequency.value=.11;fg.gain.value=320;fl.connect(fg);fg.connect(lp.frequency);fl.start(q);oc.push(fl); /* le filtre respire, lentement */
      pg.gain.setValueAtTime(.0003,q);pg.gain.exponentialRampToValueAtTime(.12*top,q+dur);pr.gain.value=.5;lp.connect(pg);pg.connect(P);pg.connect(pr);pr.connect(send);gs.push(pg);
      const CH=[{b:73.42,u:[146.83,220,293.66,369.99]},{b:61.74,u:[123.47,185,246.94,293.66]},{b:98,u:[196,246.94,293.66,392]},{b:55,u:[164.81,220,277.18,329.63]}]; /* la progression du pad : Ré, Si mineur, Sol, La, en boucle sans fin */
      const vo=[];CH[0].u.forEach(function(f,i){const o=A.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=[5,-8,6,-5][i];o.connect(lp);o.start(q);oc.push(o);vo.push(o);});
      let ci=0,iv=0;const suivant=function(){ /* l'accord suivant arrive en glissant (un cycle toutes les 7,85 s = quatre pulsations de la boule) */
        try{if(A.state==='closed'){clearInterval(iv);return;}ci=(ci+1)%CH.length;const tt=A.currentTime+.05,c=CH[ci];
          sub.frequency.setTargetAtTime(c.b,tt,.8);s2.frequency.setTargetAtTime(c.b*2,tt,.8);vo.forEach(function(o,i){o.frequency.setTargetAtTime(c.u[i],tt,.7);});}catch(x){clearInterval(iv);}};
      if(!(typeof OfflineAudioContext!=='undefined'&&A instanceof OfflineAudioContext))iv=setInterval(suivant,7850);
      const sh=A.createBufferSource(),bp=A.createBiquadFilter(),hg=A.createGain();sh.buffer=nz;sh.loop=true;bp.type='bandpass';bp.Q.value=2;bp.frequency.setValueAtTime(3500,q);bp.frequency.exponentialRampToValueAtTime(9000,q+dur);
      hg.gain.setValueAtTime(.0003,q);hg.gain.exponentialRampToValueAtTime(.05*top,q+dur);sh.connect(bp);bp.connect(hg);hg.connect(P);sh.start(q);oc.push(sh);gs.push(hg);
      /* le chœur : les notes hautes de l'accord (Ré, La, Ré, La), chacune doublée et désaccordée, qui s'ouvrent en tremblant, de gauche à droite */
      const cg=A.createGain(),cr=A.createGain();cg.gain.setValueAtTime(.0003,q);cg.gain.exponentialRampToValueAtTime(.06*top,q+dur*1.1);cr.gain.value=.55;cg.connect(P);cg.connect(cr);cr.connect(send);gs.push(cg);
      [293.66,440,587.33,880].forEach(function(f,k){for(const dc of [-6,6]){const o=A.createOscillator(),pn=pan(dc>0?.6-k*.2:-.6+k*.2),tg=A.createGain(),tl=A.createOscillator(),tq=A.createGain();
        o.type=k%2?'triangle':'sine';o.frequency.value=f;o.detune.value=dc;tg.gain.value=.5;tl.type='sine';tl.frequency.value=.23+.07*k+(dc>0?.04:0);tq.gain.value=.4;tl.connect(tq);tq.connect(tg.gain);
        o.connect(tg);tg.connect(pn);pn.connect(cg);o.start(q);tl.start(q);oc.push(o,tl);}});
      const br=A.createBufferSource(),bb=A.createBiquadFilter(),bg=A.createGain();br.buffer=nz;br.loop=true;bb.type='bandpass';bb.Q.value=.8;bb.frequency.setValueAtTime(600,q);bb.frequency.exponentialRampToValueAtTime(1500,q+dur);
      bg.gain.setValueAtTime(.0003,q);bg.gain.exponentialRampToValueAtTime(.035*top,q+dur);br.connect(bb);bb.connect(bg);bg.connect(P);br.start(q);oc.push(br);gs.push(bg); /* le souffle du médium : de l'air autour du grave */
      const PF=[1174.7,1318.5,1480,1760,2349.3,2960];
      for(let i=0;i<64;i++){const te=.8+Math.pow(i/64,.9)*3.2;if(te<el)continue;const f=PF[(i*5)%PF.length];oscil(master,'sine',f,f,q+(te-el),0,.045,.002,.35,(Math.random()-.5)*1.4,.55);}
      R.dr={g:gs,o:oc,get iv(){return iv;}};
    };
    const PENTA=[587.33,659.25,739.99,880,987.77,1174.66,987.77,880,739.99,659.25]; /* Ré majeur pentatonique, montée puis descente : jamais fausse avec l'accord */
    R.note=function(q,k){ /* une cloche douce à chaque pas de couleur de la boule */
      const f=PENTA[k%PENTA.length],x=((k*7)%5-2)*.3;
      oscil(master,'sine',f,f,q,0,.05,.004,1.1,x,.7);oscil(master,'triangle',f*2,f*2,q,0,.012,.004,.5,x,.7);
    };
    R.pret=function(q){ /* c'est prêt : l'accord de la marque s'ouvre en grand, un grave l'ancre, puis le chargement retombe en nappe douce */
      accord(q,.04,.15,1.5,.5);oscil(master,'sine',55,36,q,1,.4,.006,1,0,.3);oscil(master,'sine',2349.3,2349.3,q+.05,0,.04,.002,.6,0,.6);
      souffle(master,q,.6,'highpass',2000,9000,1,.08,.05,.6,0,.5);
    };
    R.boum=function(q){ /* l'appui : la boule explose en CASH CAR : un coup de grave énorme, un métal qui sonne, un grand souffle, et l'accord de la marque en pleine puissance */
      if(R.dr){clearInterval(R.dr.iv);for(const g of R.dr.g){g.gain.cancelScheduledValues(q);g.gain.setTargetAtTime(0,q,.08);}R.dr.o.forEach(function(o){try{o.stop(q+.5);}catch(e){}});R.dr=null;}
      oscil(master,'sine',70,28,q,1.8,1.4,.003,1.8,0,.45);oscil(master,'sine',140,50,q,.4,.7,.003,.4,0,.2);
      souffle(master,q,.7,'lowpass',12000,300,.8,.6,.001,.7,0,.4);souffle(master,q,.02,'highpass',3000,0,1,.4,.001,.015,0,0);
      [1,2.76,5.4,8.93].forEach(function(r,i){oscil(master,'sine',190*r,190*r,q,0,.16/(i+1),.002,1.7-.3*i,i%2?.4:-.4,.5);});
      souffle(master,q,.6,'bandpass',500,9000,1.4,.28,.01,.6,0,.5);souffle(master,q+.05,1,'highpass',5000,0,.8,.08,.05,1,0,.6);
      accord(q+.02,.13,.004,2.2,.6);
    };
    /* 5. LA CASSE (programmée au dernier moment par `programmerCasse` : on peut passer le film) */
    R.casse=function(q){
      souffle(master,q,.34,'lowpass',16000,900,.8,.80,.001,.32,0,.25);
      oscil(master,'sine',92,21,q,1.5,.85,.004,1.45,0,.35);oscil(master,'triangle',230,62,q,.3,.34,.003,.28,0,.2);
      souffle(master,q,.9,'bandpass',360,3800,1.1,.30,.12,.80,0,.3);
      for(let i=0;i<64;i++){const k=i/64;souffle(master,q+.02+Math.pow(k,1.6)*1.4,.03,'bandpass',2600+Math.random()*6800,0,14,.11*(1-.72*k)*(.45+.55*Math.random()),.0008,.028+Math.random()*.04,(Math.random()-.5)*1.6,.35);} /* la pluie de verre */
      master.gain.setTargetAtTime(0,q+2.2,.3);
    };
    return R;
  }
  let dSon=.2; /* la marge (s) entre le toucher et le départ du son : de quoi construire le son sans que l'image ne saccade (réglée sur la durée mesurée) */
  function son(geste){
    if(SANS_SON||!SND.sfx||!(VOL.sfx>0))return; /* mute SON ou curseur EFFETS à zéro : l'intro reste muette */
    try{iAC=preAC||new (window.AudioContext||window.webkitAudioContext)();}catch(e){iAC=null;preAC=null;return;}
    preAC=null;
    try{iAC.resume();}catch(e){}
    const vol9=iAC.createGain();vol9.gain.value=(typeof sfxVol==='function'?sfxVol():VOL.sfx);vol9.connect(iAC.destination); /* le curseur EFFETS, après le compresseur */
    if(!geste&&iAC.state!=='running'){ /* le film part SANS toucher et le navigateur refuse le son : il passe muet ; la casse, elle, sonnera au toucher (le contexte attend, déjà construit) */
      filmMuet=true;VOL9=vol9;SON=construitSon(iAC,0,vol9);latV=0;return;}
    t0a=iAC.currentTime+dSon;latV=.05+Math.min(.25,iAC.outputLatency||iAC.baseLatency||0); /* l'image attend le son : elle part quand on l'ENTEND */
    const b0=performance.now();
    VOL9=vol9;SON=construitSon(iAC,t0a,vol9);SONS_DEMO[0]=SON;
    SON.suite();if(BOULE)SON.charge(t0a,0,false); /* tout le premier acte se fabrique MAINTENANT, avant que l'image ne parte : plus d'à-coup pendant les blips */
    dSon=Math.min(.6,Math.max(.12,(performance.now()-b0)/1000*1.6));
    tLance=performance.now()+Math.max(0,t0a-iAC.currentTime)*1000; /* le film part quand le son part : l'horloge de l'image est calée sur celle de l'AudioContext */
  }
  function programmerCasse(vite){
    if(!SON||sonCasseFait)return;sonCasseFait=true;
    try{const A=iAC;if(vite)SON.busB.gain.setTargetAtTime(0,A.currentTime,.03);SON.casse(vite?A.currentTime+.02:Math.max(A.currentTime+.01,t0a+TL.casse));}catch(e){}
    const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},4200);
  }

  /* ---- LE RACCORD AVEC LE JEU (celui de l'ancienne intro : voir `hide()` dans init.js) ---- */
  function ouvrir(){ /* à l'instant du noir complet, sous le voile : le jeu se prépare sans qu'on le voie (et se remet à dessiner : voir `loop`) */
    if(ouvert)return;ouvert=true;
    try{if(!AC&&typeof initAudio==='function')initAudio();}catch(e){}
    try{if(typeof openGarage==='function'&&!IS_MOBILE)openGarage();}catch(e){}
  }
  function reveler(){ /* à l'instant où l'écran noir casse : le voile n'est plus l'écran titre, il ne prend plus les touchers */
    window.__introCouvre=false;if(revele)return;revele=true;
    sp.id=''; /* ⚠ retire l'id AVANT tout : start() et les écrans d'accueil se gardent par `getElementById('splash')` ; et la règle CSS #splash part avec lui. z-index 1000 : les éclats volent PAR-DESSUS tout (la plaque du 1er accueil s'ouvre ~0,85 s après, à 200+) */
    sp.style.cssText='position:fixed;inset:0;z-index:1000;display:block;pointer-events:none;overflow:hidden;background:transparent';
    setTimeout(function(){try{window.dispatchEvent(new Event('resize'));}catch(e){}},30); /* le jeu était en pause sous le film : s'il a été retaillé entre-temps (cadre tourné, volet agrandi), il recalcule sa taille (un bandeau blanc à droite, vu le 23/10) */
    setTimeout(function(){try{document.dispatchEvent(new Event('cc:revele'));}catch(e){}},60); /* le menu joue son entrée dessous */
    setTimeout(function(){try{if(!started){if(musicEl&&musicEl.paused&&musicMenuUrl()&&musicEl.src.indexOf(musicMenuUrl())>=0)musicEl.currentTime=0;musicMenu();}}catch(e){}},260); /* la musique du ciel part avec le ciel */
    setTimeout(function(){window.__intro=null;},1500); /* (le voile s'ouvre : on ne recharge pas encore) */
  }
  function finir(){
    if(fini)return;fini=true;
    window.__introCouvre=false;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('resize',remesure);
    try{sp.remove();}catch(e){}
    SNAP=null;SNAPPIX=null;GAMECV=null;ECL=null;ETC=null;PXC=null;LOGO=null;MESH=null;RAY=null;
  }
  function secours(){ /* l'intro a planté : le jeu s'ouvre sur-le-champ, quoi qu'il arrive (sans casse, sans fondu) */
    if(fini)return;
    try{ouvrir();}catch(e){}
    try{reveler();}catch(e){}
    try{if(SON){SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.05);}}catch(e){}
    finir();
  }
  function finRapide(){ /* qui passe avant le claquement du logo (ou le mode balade) : un fondu court, sans casse */
    if(fini||casse)return;
    ouvrir();reveler();
    if(SON){try{SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.05);const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},500);}catch(e){}}
    sp.style.transition='opacity .4s ease-out';sp.style.opacity='0';
    setTimeout(finir,450);
  }
  function fonduDoux(){ /* « réduire les animations » : ni secousse ni éclats, le voile s'efface simplement */
    if(doux||fini)return;doux=true;
    ouvrir();reveler();
    sp.style.transition='opacity .7s ease-out';sp.style.opacity='0';
    if(SON){try{SON.master.gain.setTargetAtTime(0,iAC.currentTime+.3,.3);const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},2500);}catch(e){}}
    setTimeout(finir,800);
  }
  function tapBoule(){ /* l'appui, une fois que c'est prêt : la boule explose en CASH CAR, le jeu se prépare dessous, puis le voile fond */
    if(!lance||fini||tapT!==null||pretT===null)return;
    tapT=(performance.now()-tLance)/1000-latV;passee=true;
    try{if(iAC&&iAC.state!=='running')iAC.resume();}catch(e){}
    try{if(SON){SON.suite();SON.boum(iAC.currentTime+.02);}}catch(e){}
    try{ouvrir();}catch(e){}
    setTimeout(function(){window.__introCouvre=false;},150);
    setTimeout(fonduDoux,PRES_FIN*1000+80);
  }
  function passer(){
    if(BOULE){tapBoule();return;}
    if(!lance||fini||casse||passee)return;passee=true;
    try{if(iAC&&iAC.state!=='running')iAC.resume();}catch(e){} /* le toucher libère le son (film muet) : la casse sonne */
    const t=(performance.now()-tLance)/1000-latV;
    if(!DEMO&&!RM&&t>=TL.slam+.3){programmerCasse(true);casser(t,false);}
    else if(!DEMO&&!RM&&t<TL.noir-.1){passee=false;sauterAuLogo(t);} /* pendant le 1.61 : on saute au noir juste avant le logo */
    else if(!DEMO&&!RM)passee=false; /* le logo claque : trop tôt pour casser */
    else finRapide();
  }
  function sauterAuLogo(t){
    const cible=TL.noir+.02;
    tLance=performance.now()-(cible+latV)*1000;
    if(SON&&!filmMuet&&iAC){ /* le son : l'ancien se tait, un neuf est calé sur la nouvelle heure (le claquement sonne à l'heure du logo) */
      try{SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.02);}catch(e){}
      try{t0a=iAC.currentTime-cible-latV;SON=construitSon(iAC,t0a,VOL9);}catch(e){}
    }
  }

  /* ---- LA BOUCLE, l'attente du toucher, et le lancement ---- */
  let TPS=[]; /* (banc) la durée de chaque étape de `prepare`, en ms */
  function etape(nom,f){const a=performance.now();f();TPS.push(nom+' '+(performance.now()-a).toFixed(1));}
  let prepEn=''; /* la taille pour laquelle tout est prêt */
  function prepare(){ /* les ressources qui dépendent de la taille ; la police pixel pour le gros logo (apresPolice redessine quand elle est chargée) */
    TPS=[];SNAP=null;SNAPPIX=null;PCI_N.prepares++; /* (la photo du logo se refait à la nouvelle taille) */
    etape('ressources',function(){if(!SPR.bl)faitRessources();});
    etape('etiquette',function(){const ids=DEMO?ORDRE_LABELS:[LABELS[LAB_ID]?LAB_ID:'neon'];for(const k of ids)ETS[k]=LABELS[k].geo();});
    etape('logo',function(){try{apresPolice(function(){faitLogo();});}catch(e){faitLogo();}});
    etape('fracture',fracture);
    prepEn=W+'x'+H+'x'+S;
  }
  let forceId=null; /* (banc) un label précis, quel que soit celui de l'adresse */
  const PERIODE_DEMO=()=>TL.noir+.55; /* la durée d'un tour de la démo */
  const SONS_DEMO={};let VOL9=null;
  function sonDemo(idx,tl){ /* la démo : le son de chaque tour est fabriqué juste avant (le tour suivant à 1,4 s du tour en cours) */
    if(!iAC||!VOL9||SANS_SON)return;
    for(const k of [idx,idx+1]){if(SONS_DEMO[k]||(k>idx&&tl<1.4))continue;try{const r=construitSon(iAC,t0a+k*PERIODE_DEMO(),VOL9);r.suite();SONS_DEMO[k]=r;}catch(e){}}
  }
  function rendu(t){
    g.setTransform(S,0,0,S,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(casse){dEclats(g,t-tCasse);return;}
    g.fillStyle='#000';g.fillRect(0,0,W,H);
    if(BOULE){const e=ETS.boule||(ETS.boule=geoLabSphere());dBoule(g,t,e);if(tapT!==null){g.globalCompositeOperation='source-over';g.globalAlpha=1;dPresente(g,Math.max(0,t-tapT),e);}g.globalCompositeOperation='source-over';g.globalAlpha=1;return;}
    let tl=t,id=forceId||(LABELS[LAB_ID]?LAB_ID:'neon'),idx=0;
    if(DEMO){const T=PERIODE_DEMO(),n=ORDRE_LABELS.length;idx=Math.floor(Math.max(0,t)/T);tl=Math.max(0,t)-idx*T;id=forceId||ORDRE_LABELS[idx%n];} /* la démo : les labels s'enchaînent en boucle */
    if(tl<TL.noir){const e=ETS[id]||(ETS[id]=LABELS[id].geo());LABELS[id].dessin(g,tl,e);}else if(!DEMO&&t>=TL.slam)dActe3(g,t,0);;
    g.globalCompositeOperation='source-over';g.globalAlpha=1;if(!DEMO&&t>=TL.slam){g.drawImage(VIG,0,0,W,H);if(!casse)dIndice(g,t);}
    if(DEMO&&!forceId){g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='9px "Press Start 2P",monospace';g.globalAlpha=.55;g.fillText((idx%ORDRE_LABELS.length+1)+'/'+ORDRE_LABELS.length+'  '+NOMS_LABELS[id],W/2,H-36*ku);g.font='7px "Press Start 2P",monospace';g.globalAlpha=.3;g.fillText('TOUCHE = JOUER',W/2,H-20*ku);g.globalAlpha=1;}
  }
  let erreurs=0;
  function boucle(now){
    if(fini)return;
    raf=requestAnimationFrame(boucle);
    if(manuel)return;
    if(!casse){const t=PCI_ON?pciTaille(now):tailleEcran();if(t[0]!==W||t[1]!==H)remesure();} /* l'écran a changé de taille sans que `resize` nous le dise (cadre du volet, rotation) : tout se refait à la bonne taille (vu le 23/10 : logo énorme, coupé à droite) */
    if(!lance)return;
    try{
      const t=(now-tLance)/1000-latV;
      if(BOULE){if(pretT===null&&t>=4.6&&document.readyState==='complete'&&(!document.fonts||document.fonts.status!=='loading')){pretT=t;try{if(SON&&!filmMuet)SON.pret(iAC.currentTime+.02);}catch(e){}}if(PCI_60&&tapT===null&&pciSaute(now))return;rendu(t);return;} /* la boule : prête dès que la page est chargée (et après 2,6 s au moins) */
      if(DEMO){const T=PERIODE_DEMO(),idx=Math.floor(Math.max(0,t)/T);if(idx>0)sonDemo(idx,t-idx*T);else sonDemo(0,t);rendu(t);return;}
      if(!ouvert&&t>=TL.noir)ouvrir();
      if(!revele&&!doux&&!passee){ /* le jeu ne dessine rien derrière le film (voir `loop`), SAUF quelques images dans le NOIR COMPLET : ses accrocs du premier dessin (relecture du ciel, compilations) ne se voient pas là, et il reprend à chaud 0,5 s avant la casse */
        if(t>=TL.noir+.08&&t<TL.noir+.22){if(window.__introCouvre)window.__introCouvre=false;}
        else if(t>=TL.noir+.22){if(!window.__introCouvre)window.__introCouvre=true;} /* puis il se tait jusqu'au toucher */
      }
      if(!SNAP&&t>=TL.noir+.30)prepSnap(); /* (le logo au repos, pour les tuiles) */
      if(!priseFaite&&t>=TL.noir+.14)demanderPrise(); /* une photo du jeu, juste avant la casse : les tuiles en feront des loupes */ /* le jeu se remet à dessiner, juste avant que l'écran casse (il faut qu'il y ait une image dessous) */
      if(SON&&!filmMuet&&!SON.fait.acte3&&t>=TL.noir-.15)SON.acte3(); /* le claquement et la tension se fabriquent dans le noir complet */
      rendu(t);
    }catch(e){window.__introErr=String(e&&e.stack||e).slice(0,400);if(++erreurs>2)secours();} /* une image qui plante ne doit jamais laisser l'écran noir : on ouvre le jeu */
  }
  function eteintTitre(){ /* le titre faible de l'attente s'aplatit en trait, dans le trait de lumière de l'allumage */
    if(!ttl)return;
    ttl.classList.remove('tease');ttl.style.animation='none';ttl.style.transition='transform .15s cubic-bezier(.6,0,1,.4),opacity .15s linear';ttl.style.opacity='0';ttl.style.transform='scale(1.15,.02)';
    setTimeout(function(){ttl.style.display='none';},180);
  }
  function lancer(geste){
    if(lance||fini)return;lance=true;RM=reduit();tLance=performance.now();window.__intro='joue'; /* l'intro passe : pas de rechargement */
    eteintTitre();
    window.__introCouvre=true; /* le film couvre l'écran : le jeu ne calcule ni ne dessine plus rien dessous, jusqu'à 0,5 s avant la casse (voir `boucle`) */
    try{if(prepEn!==W+'x'+H+'x'+S)prepare();}catch(e){} /* (déjà prêt si on a attendu un peu sur l'écran titre) */
    try{son(geste);}catch(e){} /* le son ne doit JAMAIS bloquer les visuels */
    if(!iAC)tLance=performance.now(); /* (sans son : le film part tout de suite) */
  }
  function chauffe(){ /* pendant l'attente du toucher, hors de vue : tout ce qui est lourd la première fois (le calcul du film, le code du son) se fait maintenant, pas au toucher */
    if(lance||fini)return;
    try{if(!SPR.bl||prepEn!==W+'x'+H+'x'+S)prepare();}catch(e){}
    try{irPret();const b0=performance.now(),A=new OfflineAudioContext(2,4800,48000),r=construitSon(A,0,A.destination);r.suite();r.acte3();dSon=Math.min(.6,Math.max(.12,(performance.now()-b0)/1000*.8));}catch(e){} /* (la 1re construction est la plus lente : la marge en tient compte) */
  }
  function kd(){if(!lance&&!fini)lancer(true);else if(lance&&performance.now()-tLance>600)passer();}
  function pose(e){try{const r=cv.getBoundingClientRect();TOUCH={x:e.clientX-r.left,y:e.clientY-r.top};}catch(x){TOUCH=null;}}
  function remesure(){pciDer=-1e9;if(fini||casse)return;mesure();if(lance){if(PCI_ON&&prepEn===W+'x'+H+'x'+S){PCI_N.prepEvitees++;return;}try{prepare();}catch(e){}}} /* (passe perf PC) un `resize` qui ne change ni la taille ni l'échelle (le zoom du cadre bureau en envoie) ne refait plus tout le film : boule, logo, fracture étaient refaits À L'IDENTIQUE (même règle que `lancer` et `chauffe`) */

  mesure();
  setTimeout(irPret,500); /* pendant l'attente du toucher : 10 ms de calcul, hors de vue */
  setTimeout(chauffe,900); /* puis le reste (quelques dizaines de ms, hors de vue) */
  addEventListener('keydown',kd);addEventListener('resize',remesure);
  sp.addEventListener('pointerdown',pose,true);boulePointeur();
  sp.addEventListener('click',function(){
    if(BOULE&&bGlisse){bGlisse=false;return;} /* un glissement qui tourne la boule n'est pas un appui */
    try{musicDeverrouille();}catch(e){} /* ⚠ LE geste qui libère la musique pour toute la session (voir le lecteur unique) */
    if(!lance)lancer(true);else if(performance.now()-tLance>600)passer(); /* le logo attend : le toucher CASSE l'écran (avant le logo : le film passe) */
  });
  function autoLance(){ /* le film part TOUT SEUL : le navigateur dit si le son est permis sans toucher (sinon le film passe muet, la casse sonnera au toucher) */
    if(lance||fini)return;
    let A=null;if(!SANS_SON&&SND.sfx&&VOL.sfx>0){try{A=new (window.AudioContext||window.webkitAudioContext)();}catch(e){A=null;}}
    if(!A){lancer(false);return;}
    preAC=A;let fait=false;const go=function(){if(fait)return;fait=true;if(lance){try{A.close();}catch(e){}return;}lancer(false);};
    try{A.resume().then(go,go);}catch(e){go();}
    setTimeout(go,300);
  }
  function essaiAuto(n){ /* attendre que la page soit chargée, la police prête et la fenêtre visible */
    if(lance||fini)return;
    if(document.hidden||document.readyState!=='complete'||(n<24&&document.fonts&&document.fonts.status==='loading')){setTimeout(function(){essaiAuto(n+1);},250);return;}
    autoLance();
  }
  if(!DEMO&&!BALADE&&!SIMU_JEU&&!/[?&]depart=toucher\b/.test(location.search))setTimeout(function(){essaiAuto(0);},BOULE?500:1700); /* (?depart=toucher : l'ancien départ au toucher) */
  if(BALADE||SIMU_JEU)setTimeout(finRapide,80); /* (atelier des nuages, simulateur) droit au jeu, sans l'intro */
  raf=requestAnimationFrame(boucle);
  let vuRev=false;
  window.dbgIntro={TL:TL,construitSon:function(A,t0,d){const r=construitSon(A,t0,d);r.suite();r.acte3();return r;},
    voir:function(t,id){manuel=true;forceId=id||null;if(!lance){lance=true;RM=reduit();eteintTitre();}if(!LOGO||!Object.keys(ETS).length){mesure();prepare();}
      if(t<TL.casse){casse=false;ECL=null;if(vuRev){vuRev=false;sp.id='splash';sp.style.cssText='';}}else if(!casse)casser(TL.casse,true);
      if(casse&&!vuRev){vuRev=true;sp.id='';sp.style.cssText='position:fixed;inset:0;z-index:1000;display:block;pointer-events:none;overflow:hidden;background:transparent';} /* (banc) le voile transparent : on voit le jeu dessous */
      rendu(t);return{W:W,H:H,S:S};},
    mesure:function(){mesure();prepare();return{W:W,H:H,S:S,etapes:TPS};},
    labels:Object.keys(LABELS),
    boule:function(o){if(o.pret!==undefined)pretT=o.pret;if(o.tap!==undefined)tapT=o.tap;}, /* (banc) l'instant où c'est prêt / où l'on appuie */
    toucher:function(x,y){TOUCH=x==null?null:{x:x,y:y};}, /* (banc) l'endroit où l'écran casse */
    prise:function(){priseFaite=false;GAMECV=null;demanderPrise();}, /* (banc) la photo du jeu pour les loupes : la boucle la prend à sa prochaine image */
    etat:function(){return{muet:filmMuet,label:LAB_ID,lentille:!!GAMECV,tuiles:MESH&&MESH.tuiles?MESH.tuiles.length:0,lance:lance,fini:fini,casse:casse,doux:doux,RM:RM,manuel:manuel,erreurs:erreurs,t:lance?(performance.now()-tLance)/1000-latV:null,K:K,son:iAC?iAC.state+'@'+iAC.currentTime.toFixed(2)+' lat='+latV.toFixed(3):null};}};
})();
