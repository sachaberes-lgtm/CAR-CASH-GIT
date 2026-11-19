/* ===== L'ORBITE DES VOYAGES (2026-11-16, Sacha : « retravaille la génération de la map espace pour qu'on n'ait plus l'impression que chaque fois qu'on va dans l'espace c'est la
   même chose ; des modules qui jouent avec l'endroit et l'envers », puis, sur les maquettes (passation/espace-endroit-envers-1.html) : « la roue, la petite lune, l'astéroïde percé,
   la nébuleuse : garde ; travaille aussi les modules de virage comme des montagnes russes, de vitesse et de variation de direction, que chaque map soit unique sans niquer
   l'optimisation », « code-les sauf l'accélérateur », « il faut que la génération propose une trajectoire de route complètement unique à chaque partie ») =====
   `?espace=voyages` (ORB_VOY) : sans lui, rien ne change (aucun tirage de plus, aucune marque, aucun décor).
   LE VOYAGE : chaque route d'orbite tire un voyage (LA STATION, LA LUNE, LA CEINTURE, LE NUAGE, LE GRAND TOUR) — jamais celui de la route d'avant (la pioche) — qui donne :
     · le poids de chaque module (ses tracés préférés ; les modules d'avant restent possibles, rares) ;
     · son GÉANT, climax des routes longues (temps fort des routes courtes) ; le grand tour en a deux ;
     · LA SILHOUETTE de la route : la façon dont l'axe tourne du départ au portail (spirale, S, zigzag, vague, crochet), son ampleur et son sens, tirés pour CETTE route —
       avec les modules, leur ordre et leurs réglages, deux parties ne dessinent jamais la même trajectoire.
   LES TRACÉS (sans décor : la variété qui ne coûte rien) : LES BOSSES et LE PIQUÉ TOURNANT (des FIGURES : leur relief est gardé par pisteTord, posé sur la descente), LE BALANCIER,
   LE DÉVERS INVERSÉ et LA SPIRALE QUI SE SERRE (calmes : la descente tenue, la dalle couchée par leurs couchers), LES MARCHES (figure).
   LES GÉANTS : LA ROUE (on roule dans la jante d'une station, entrée la tête en bas), LA PETITE LUNE (la dalle couchée VERS L'EXTÉRIEUR : la lune reste sous les roues jusqu'en
   dessous), L'ASTÉROÏDE PERCÉ (le demi-tonneau dans le tunnel), LA NÉBULEUSE (le demi-tonneau dans le gaz). Leur décor est AJUSTÉ À LA ROUTE BÂTIE (voyDecorPose) et ne prend
   que des matières déjà compilées au menu : celle de l'épave (la jante, la roche, le tunnel), la lune glacée, le gaz de la comète — aucun programme neuf, aucun gel. */
const ORB_VOY=ORB_RU||typeof location!=='undefined'&&/[?&]espace=voyages\b/.test(location.search); /* (2026-11-17, LES ROUTES UNIQUES) sous ORB_RU, les voyages entrent dans le sac de toutes les routes */
const VOY_LISTE={
  STATION:{nom:'la station',g:['roue'],w:{bosses:3,pique:2.6,marches:2.2,balancier:1.4,spirale:1,stengel:.8,faille:1,cascade:.6,torsade:.3,bobsleigh:.3,surbaisse:.3,plongeant:.4,fronde:.3}},
  LUNE:{nom:'la lune',g:['lune'],w:{balancier:3,spirale:2.6,stengel:2.2,bosses:1.4,marches:1,pique:.8,faille:1,cascade:.6,surbaisse:.4,sret:.3,fronde:.3}},
  CEINTURE:{nom:'la ceinture',g:['asteroide'],w:{marches:3,pique:2.6,spirale:2.2,bosses:1.6,balancier:1,stengel:.8,faille:1.2,cascade:.8,plongeant:.4,ceinture:.3}},
  NUAGE:{nom:'le nuage',g:['nebuleuse'],w:{stengel:3,bosses:2.6,balancier:2.2,spirale:1.4,pique:1.2,marches:.8,faille:1,cascade:.6,torsade:.4,sret:.3}},
  GRAND:{nom:'le grand tour',g:null,w:{bosses:1.6,pique:1.6,balancier:1.6,stengel:1.6,marches:1.6,spirale:1.6,faille:1,cascade:.6,torsade:.3,sret:.3,surbaisse:.3,fronde:.3,plongeant:.3,bobsleigh:.3,ceinture:.3}}};
const VOY_GEANTS=['roue','lune','asteroide','nebuleuse'],VOY_SILS=['spirale','S','zigzag','vague','crochet'];
const VOY_FORCE=(function(){const m=typeof location!=='undefined'&&/[?&]voyage=([a-z]+)/.exec(location.search);return m?{station:'STATION',lune:'LUNE',ceinture:'CEINTURE',nuage:'NUAGE',grand:'GRAND'}[m[1]]||'':'';})(); /* `?voyage=station|lune|ceinture|nuage|grand` : ce voyage à chaque route (banc, essai) */
let VOY=null; /* le voyage de la route en cours de dessin (un par essai du directeur de rythme ; le tirage, lui, est gardé dans ORB_PIOCHE.vo pour les six essais) */
/* les places (s réelles) et le temps la tête en bas de chaque module neuf — ajoutés aux tables d'orbite-modules.js */
Object.assign(ORB_DR,{bosses:12.6,pique:7.8,balancier:14.8,stengel:7.4,marches:12.8,spirale:8.6,roue:14.2,lune:14.6,asteroide:14.8,nebuleuse:14.8});
Object.assign(ORB_ENVS,{stengel:2.6,roue:4.4,lune:3.4,asteroide:6.4,nebuleuse:6.2});
Object.assign(ORB_NOM,{bosses:'les bosses',pique:'le piqué tournant',balancier:'le balancier',stengel:'le dévers inversé',marches:'les marches',spirale:'la spirale qui se serre',roue:'la roue',lune:'la petite lune',asteroide:'l\'astéroïde percé',nebuleuse:'la nébuleuse'});
Object.assign(ORB_FIG,{bosses:'bosses',pique:'pique',balancier:'balancier',stengel:'stengel',marches:'marches',spirale:'spirale',roue:'roue',lune:'lune',asteroide:'asteroide',nebuleuse:'nebuleuse'});
Object.assign(ORB_COMPO,{roue:1,lune:1,asteroide:1,nebuleuse:1}); /* les géants se posent en trois marques (entrée, cœur, sortie) */
const VOY_FACE={stengel:1,roue:1,lune:1,asteroide:1,nebuleuse:1}; /* ceux qui passent la verticale : ils comptent comme « le virage qui change de face » de la route */

/* LE TIRAGE DU VOYAGE (au 1er essai de la route) et l'état de l'essai — rf : le hasard des modules */
function orbVoyEtat(rf,longue){
  if(!ORB_VOY)return null;
  if(ORB_PIOCHE.vo==null){const cles=Object.keys(VOY_LISTE).filter(function(k){return k!==ORB_PIOCHE.voyDer;});const c9=cles[Math.min(cles.length-1,(rf()*cles.length)|0)],cle=VOY_FORCE||c9;
    let g=VOY_LISTE[cle].g;if(!g){const a=VOY_GEANTS.slice(),x=a.splice((rf()*a.length)|0,1)[0];g=[a[(rf()*a.length)|0],x];} /* le grand tour : deux géants, le second en climax */
    if(ESP_SANS_GEANTS)g=[]; /* (2026-11-18, L'ESPACE SANS GÉANTS) le tirage est gardé (le même hasard), le voyage n'a plus de géant : ni temps fort ni climax géant */
    const f=VOY_SILS[Math.min(VOY_SILS.length-1,(rf()*VOY_SILS.length)|0)],s=rf()<.5?-1:1,U=function(a,b){return a+(b-a)*rf();};
    const sil=f==='spirale'?{f,s,A:U(220,360)}:f==='S'?{f,s,A:U(100,150)}:f==='zigzag'?{f,s,A:U(45,70),k:U(1.5,2.5)}:f==='vague'?{f,s,A:U(60,90),k:U(1,1.5)}:{f,s,A:U(140,220),u0:U(.2,.4)};
    ORB_PIOCHE.vo={cle,g,sil};}
  const V=ORB_PIOCHE.vo,L9=VOY_LISTE[V.cle];
  /* la route longue (90 s de croisière et plus) : le dernier géant est son climax, l'autre (grand tour) un temps fort ; plus courte : le géant est un temps fort, le 2e au plus tôt */
  return {cle:V.cle,nom:L9.nom,w:L9.w,sil:V.sil,cxG:longue>=90?V.g[V.g.length-1]:null,fortG:longue>=90?(V.g.length>1?V.g[0]:null):V.g[V.g.length-1],fortAt:0,fortFait:0};
}
/* LA SILHOUETTE : l'angle (rad) dont l'axe de la route a tourné à la part u (0..1) de la route — à la place de la spirale régulière (derAx, genCtrl1) */
function orbVoyAxe(u){const S=VOY&&VOY.sil;if(!S)return 0;return orbVoyAxe0(S,u)+(S.B?S.sB*S.B/57.2958*Math.max(0,Math.min(1,u)):0);} /* (2026-11-17, LES ROUTES UNIQUES) S.B : une dérive d'ensemble sous la silhouette (le contrôle adverse : sans elle, la fin restait à ~40° devant le départ) */
function orbVoyAxe0(S,u){
  const x=Math.max(0,Math.min(1,u)),A=S.A/57.2958;
  if(S.f==='spirale')return S.s*A*x;
  if(S.f==='S')return S.s*A*Math.sin(Math.PI*x); /* elle part d'un côté, puis revient */
  if(S.f==='zigzag'){const q=x*S.k,f9=q-Math.floor(q);return S.s*A*(f9<.25?4*f9:f9<.75?2-4*f9:4*f9-4);} /* une dent de scie arrondie par les virages : de 0 vers +A, −A, puis 0 */
  if(S.f==='vague')return S.s*A*Math.sin(2*Math.PI*S.k*x);
  if(S.f==='derive'){const t=Math.min(1,x/S.u0);return S.s*A*t*t*(3-2*t);} /* (LES ROUTES UNIQUES) LA DÉRIVE : l'axe part franchement d'un côté et y reste */
  if(S.f==='libre')return S.s*A*(.62*(Math.sin(2*Math.PI*S.k*x+S.p1)-Math.sin(S.p1))+.38*(Math.sin(2*Math.PI*S.k2*x+S.p2)-Math.sin(S.p2))); /* (LES ROUTES UNIQUES) LIBRE : deux houles de l'axe, sans dessin d'ensemble */
  const t=Math.max(0,Math.min(1,(x-S.u0)/.35));return S.s*A*t*t*(3-2*t); /* le crochet : droit, puis un grand changement de cap, puis droit */
}
/* LE PORTAIL DU VOYAGE SUR L'AXE : appelée par genCtrl1 (poseO et la phrase) à la place de sAx·TOT_AX·u */
function orbVoyDerAx(u,defaut){return ORB_VOY&&VOY?orbVoyAxe(u):defaut;}

/* ===== LES MODULES (ajoutés à M par orbModules) — X : les outils d'orbModules (K, U, arc, Rt, balai, cote, borne, Tt, rP, rf) ===== */
function orbVoyModules(M,X){
  const K=X.K,U=X.U,arc=X.arc,Rt=X.Rt,balai=X.balai,cote=X.cote,borne=X.borne,Tt=X.Tt,rP=X.rP,rf=X.rf,PI=Math.PI,OK=ORB_K,fS=K.fS;
  const pente=function(deg){return Math.tan(deg/57.2958);};
  /* LES BOSSES (figure) : trois bosses en descente, chacune dans un virage de 50-66° qui part de l'autre côté. Le relief du DESSIN est relatif : pisteTord le pose sur la descente de la route
     (~25°) — le sommet d'une bosse passe à ~5° sous l'horizontale, le creux plonge à ~45°. La dalle se couche un peu (12°) dans chaque virage. */
  M.bosses=function(){let s=balai(30);const cB=.21,c=[],A=K.ru?U(14,18):U(19,24), /* (LES ROUTES UNIQUES) des bosses un peu moins hautes (MESURÉ : 66-68°/s vus de l'horizon) */PF=[.55,1,.55,-.55,-1,-.55];fS(.6*Tt,-.03*.6*Tt,1);
    for(let k=0;k<3;k++){const a=Math.max(40,borne(s,U(50,66),36)),Lh=U(3.6,4.1)*Tt, /* (MESURÉ, juge : à ±28-40° le cap restait 13,8 s dans le même cône de 30°) */R=Lh/(a/57.2958),i0=K.i();let im=0;
      for(let j=0;j<6;j++){arc((K.ru&&j>=3?-s:s)*a/6,R,-.03+pente(A*PF[j]));if(j===2)im=K.i();} /* (LES ROUTES UNIQUES) chaque bosse en S : le repère libre ne sort plus penché (MESURÉ : −61° à la sortie des trois bosses, 72°/s au retour) */
      c.push([i0,im,-s*cB,OK],[im,K.i(),s*cB,OK]);s=-s;}
    fS(.5*Tt,-.03*.5*Tt,1);
    return {fig:'bosses',nom:ORB_NOM.bosses,g:1,c:c,pente:1};};
  /* LE PIQUÉ TOURNANT (figure) : une crête, puis la route plonge (jusqu'à ~24° de plus que la descente) en tournant de 95-125° et en se couchant dans le virage (68-78°) */
  M.pique=function(){const s=cote(110),d=-s,a=Math.min(125,Math.max(95,borne(s,U(98,124),80))),R=Rt(6.2,a,3.4),ang=U(1.19,1.36),PP=[0,-.16,-.33,-.45,-.4,-.24,-.08];
    fS(.5*Tt,-.03*.5*Tt,1);fS(.8*Tt,pente(12)*.8*Tt,1);const i1=K.i();let im=0;
    for(let k=0;k<PP.length;k++){arc(s*a/PP.length,R,PP[k]);if(k===3)im=K.i();}fS(.6*Tt,-.03*.6*Tt,1);const i2=K.i();{const a9=U(26,38);if(K.ru)fS(.7*Tt,-.03*.7*Tt,1);arc(-s*a9,Math.max(3*rP,(K.ru?2.6:1.6)*Tt/(a9/57.2958)),-.03);} /* (LES ROUTES UNIQUES) une sortie plus longue (0,7 s de droite, un arc de 2,6 s) : la dalle sortait du piqué couchée de ~50° vue de l'horizon et revenait à 73°/s */ /* la sortie tourne de l'autre côté HORS de la marque (i1) : pisteTord y couche la dalle comme dans une liaison, à son rythme (comme la sortie d'une faille) — la dalle se relève jusqu'au bout de la sortie : sur la pente raide, le roulis vu de l'horizon tourne plus vite que celui de la dalle (MESURÉ, juge : 77°/s quand elle se relevait dans le virage) */
    return {fig:'pique',nom:ORB_NOM.pique,g:1,c:[[i1,im,d*ang,OK],[im,i2,-d*ang,OK]],pente:1,i1:i2};};
  /* LE BALANCIER (calme) : trois grands virages enchaînés sans droite ; la dalle monte presque au mur (62-69°) dans chacun et bascule de l'autre côté d'un sommet à l'autre
     (un virage entier pour changer de mur : ~30°/s) */
  M.balancier=function(){let s=balai(70);const ev=[],p=-.03,th=U(1.08,1.2);fS(.4*Tt,p*.4*Tt,1);let iP=K.i();
    for(let k=0;k<3;k++){const a=Math.max(60,borne(s,k?U(70,88):Math.max(70,s*(s*U(60,72)-K.dev())),55)),R=Rt(5.2,a,3.4);
      arc(s*a*.5,R,p);ev.push([iP,K.i(),k?-2*s*th:-s*th,OK]);iP=K.i();arc(s*a*.5,R,p);if(k<2)s=-s;}
    fS(.6*Tt,p*.6*Tt,1);ev.push([iP,K.i(),s*th,OK]);fS(.3*Tt,p*.3*Tt,1);
    return {fig:'balancier',nom:ORB_NOM.balancier,calme:1,g:1,c:ev};};
  /* LE DÉVERS INVERSÉ (calme) : un virage de 72-98° où la dalle se couche VERS L'EXTÉRIEUR jusqu'à passer la verticale (110-122°) — on pend au-dessus du vide, puis elle revient */
  M.stengel=function(){const s=cote(90),a=Math.min(98,Math.max(72,borne(s,U(74,96),60))),R=Rt(7.2,a,3.6),ang=U(1.92,2.12)*(K.ru&&K.longue/(K.el||1)<40?(ESP_SANS_GEANTS?ESP_KE[0]:1.08):1),p=-.05; /* (LES ROUTES UNIQUES) plus loin au plafond sur une route courte */
    const i0=K.i();fS(.4*Tt,-.03*.4*Tt,1);arc(s*a/2,R,p);const i1=K.i();arc(s*a/2,R,p);fS(.4*Tt,-.03*.4*Tt,1);const i2=K.i();
    return {fig:'stengel',nom:ORB_NOM.stengel,calme:1,g:1,c:[[i0,i1,s*ang,OK],[i1,i2,-s*ang,OK]]};};
  /* LES MARCHES (figure) : une marche raide (~17° de plus que la descente), un palier À PLAT qui tourne (relevé de 27° dans le dessin : à plat sur la route), de l'autre côté à chaque palier */
  /* (2026-11-17, LES ROUTES UNIQUES — le contrôle adverse : creux et crêtes sous le rayon tenable) LES MARCHES d'une route à plan : chaque changement de pente arrondi
     (`glisse` : en petits pas, sur au moins 1,35 × le rayon tenable × l'angle × 1,5), la marche à 14°, le palier à 21°, plus long */
  const RVv=1.35*(typeof rayonPalier==='function'?rayonPalier():40+.3*(typeof vPalier==='function'?vPalier():78));
  const glisseV=function(aDeg,L,d0,d1){const n=Math.max(4,Math.ceil(Math.abs(d1-d0)/2.5)),Lx=Math.max(L,RVv*Math.abs(d1-d0)/57.2958*1.5);
    for(let q=0;q<n;q++){const u=(q+.5)/n,d=d0+(d1-d0)*u*u*(3-2*u),l=Lx/n;if(Math.abs(aDeg)<.5)fS(l,pente(d)*l,1);else arc(aDeg/n,l/(Math.abs(aDeg)/n/57.2958),pente(d));}};
  const marchesU=function(){let s=balai(50);const n=K.longue>=90?3:2,c=[],pM=14,pP=21;let d9=-1.7;
    for(let k=0;k<n;k++){glisseV(0,.3*Tt,d9,-pM);fS(1.2*Tt,-pente(pM)*1.2*Tt,2);const a=Math.max(40,borne(s,U(48,64),36)),R=Rt(3.2,a,2.6),Lh=a*.5/57.2958*R,ia=K.i();glisseV(s*a*.5,Lh,-pM,pP);const im=K.i();arc(-s*a*.5,R,pente(pP));
      c.push([ia,im,-s*.3,OK],[im,K.i(),s*.3,OK]);s=-s;d9=pP;} /* (le palier en S : le repère libre ne sort plus penché) */
    glisseV(0,.3*Tt,d9,-pM);fS(.8*Tt,-pente(pM)*.8*Tt,2);glisseV(0,.3*Tt,-pM,-1.7);
    return {fig:'marches',nom:ORB_NOM.marches,g:1,c:c,pente:1};};
  M.marches=function(){if(K.ru)return marchesU();let s=balai(50);const cM=.4,n=K.longue>=90?3:2,c=[];
    const pM=17,pP=27,dM=2.6;
    for(let k=0;k<n;k++){fS(1.5*Tt,-pente(pM)*1.5*Tt,2);const a=Math.max(40,borne(s,U(48,64),36)),R=Rt(dM,a,2.6),ia=K.i();arc(s*a*.5,R,pente(pP));const im=K.i();arc(s*a*.5,R,pente(pP));
      c.push([ia,im,-s*cM,OK],[im,K.i(),s*cM,OK]);s=-s;}
    fS(1.1*Tt,-pente(pM)*1.1*Tt,2);
    return {fig:'marches',nom:ORB_NOM.marches,g:1,c:c,pente:1};};
  /* LA SPIRALE QUI SE SERRE (calme) : quatre arcs de plus en plus serrés, la dalle de plus en plus couchée (60-72°), puis elle lâche : deux arcs qui s'ouvrent, la dalle revient */
  M.spirale=function(){const s=cote(125),c=[],p=-.03,th=U(1.05,1.25),AA=[18,22,26,30],RK=[6.5,5,4,3.2],kA=Math.min(1,borne(s,126,90)/126);fS(.3*Tt,p*.3*Tt,1);let iP=K.i();
    for(let k=0;k<4;k++){arc(s*AA[k]*kA*U(.92,1.08),RK[k]*rP,p);c.push([iP,K.i(),-s*th/4,OK]);iP=K.i();}
    arc(s*16*kA,3.8*rP,p);arc(s*12*kA,6*rP,p);c.push([iP,K.i(),s*th,OK]);fS(.4*Tt,p*.4*Tt,1);
    return {fig:'spirale',nom:ORB_NOM.spirale,calme:1,g:1,c:c};};
  /* ---- LES GÉANTS : trois marques (entrée, cœur, sortie) ; le cœur porte ses repères (nu {t:'voy', k, i}) — voyDecorPose bâtit le décor sur la route refaite ---- */
  const coeur=function(k,i0,im,i1){return [{t:'voy',k:k,i:i0},{t:'voy',k:k,i:im},{t:'voy',k:k,i:i1}];};
  const trois=function(pose,cx,k,entree,mil,sortie){
    pose(function(){const m=entree();m.fig=k+'-entree';m.nom=ORB_NOM[k]+' (entrée)';m.calme=1;m.g=1;if(cx)m.climax=1;return m;});
    pose(function(){const m=mil();m.fig=k;m.nom=ORB_NOM[k];m.calme=1;m.g=1;m.voy=k;if(cx)m.climax=1;return m;});
    pose(function(){const m=sortie();m.fig=k+'-sortie';m.nom=ORB_NOM[k]+' (sortie)';m.calme=1;m.g=1;if(cx)m.climax=1;return m;});};
  /* LA ROUE : on arrive en se couchant jusqu'à la tête en bas (~125°), on entre par une brèche du haut de la jante, on roule sur son sol intérieur (la dalle tournée vers le moyeu)
     sur 125-150° de virage en descendant — elle se relève jusqu'à ~55° — et l'on ressort par une brèche du bas */
  if(ESP_SANS_GEANTS)return; /* (2026-11-18, L'ESPACE SANS GÉANTS) les quatre géants ne sont plus des modules : R.ok et tire ne les trouvent plus */
  M.roue=function(pose,cx){const s=balai(140),d=-s,p=-.03,a=Math.min(150,Math.max(125,borne(s,U(130,148),115))),R=Rt(7.4,a,3.8),e1=U(2.1,2.25),e2=U(.88,1.0),a0=U(40,50);
    trois(pose,cx,'roue',function(){const i0=K.i();arc(-s*a0,3.6*Tt/(a0/57.2958),p);return {c:[[i0,K.i(),d*e1,OK]]};},
      function(){const i0=K.i();arc(s*a/2,R,p);const im=K.i();arc(s*a/2,R,p);const i1=K.i();return {c:[[i0,i1,-d*(e1-e2),OK]],nu:coeur('roue',i0,im,i1)};},
      function(){const i0=K.i();arc(-s*a0,2.8*Tt/(a0/57.2958),p);return {c:[[i0,K.i(),-d*e2,OK]]};});};
  /* LA PETITE LUNE : la dalle se couche VERS L'EXTÉRIEUR du virage (la lune, au centre, reste sous les roues) : ~40° en arrivant, ~120° au bout de 130-150° de tour, sous la lune */
  M.lune=function(pose,cx){const s=balai(140),p=-.04,a=Math.min(150,Math.max(125,borne(s,U(130,148),115))),R=Rt(7.4,a,3.6),e1=U(.62,.76),e2=U(2.02,2.16),a0=U(36,46);
    trois(pose,cx,'lune',function(){const i0=K.i();arc(-s*a0,3.2*Tt/(a0/57.2958),p);return {c:[[i0,K.i(),s*e1,OK]]};},
      function(){const i0=K.i();arc(s*a/2,R,p);const im=K.i();arc(s*a/2,R,p);const i1=K.i();return {c:[[i0,i1,s*(e2-e1),OK]],nu:coeur('lune',i0,im,i1)};},
      function(){const i0=K.i();arc(-s*a0*1.3,4.4*Tt/(a0*1.3/57.2958),p);return {c:[[i0,K.i(),-s*e2,OK]]};});};
  /* L'ASTÉROÏDE PERCÉ : un S léger ; dans le tunnel la dalle fait un demi-tonneau (π en ~6 s), on ressort la tête en bas, puis elle revient dans un grand virage */
  const percee=function(k,dur0,dS){return function(pose,cx){const kc=K.ru&&K.longue/(K.el||1)<40,dur=dur0*(kc?U(.72,.9):1),sg=rf()<.5?-1:1,s=kc&&Math.abs(K.dev())>10?(K.dev()>0?-1:1):cote(60),p=-.03,a1=kc?U(30,44):U(26,34),a2=kc?U(dS[0]-12,dS[1]+8):U(dS[0],dS[1]); /* kc : (LES ROUTES UNIQUES) sur une route courte, le géant raccourci (entrée 1,8 s, tunnel × 0,8, sortie 4,2 s : ~11 s au lieu de ~15) — il tient aux paliers rapides ; il tourne vers l'axe de la route (entrée du même côté, sortie 30-38° : il en garde ~80°) */
    trois(pose,cx,k,function(){arc((kc?s:-s)*a1,(kc?1.8:2.6)*Tt/(a1/57.2958),p);return {c:[]};},
      function(){const i0=K.i();arc(s*a2/2,dur*.5*Tt/(a2/2/57.2958),p);const im=K.i();arc(s*a2/2,dur*.5*Tt/(a2/2/57.2958),p);const i1=K.i();return {c:[[i0,i1,sg*PI,OK]],nu:coeur(k,i0,im,i1)};},
      function(){const i9=K.i();const a3=kc?U(30,38):U(66,84);arc(-s*a3,(kc?4.2:5)*Tt/(a3/57.2958),p);return {c:[[i9,K.i(),-sg*PI,OK]]};});};};
  M.asteroide=percee('asteroide',6,[75,92]);
  M.nebuleuse=percee('nebuleuse',6.2,[80,96]);
}

/* ===== LE TIRAGE (appelé par tire, orbite-modules.js) : le géant du voyage en temps fort, à sa place ===== */
function orbVoyForce(place,nFort){
  if(!VOY||!VOY.fortG||VOY.fortFait||nFort<VOY.fortAt)return null;
  if(!place(ORB_DR[VOY.fortG]*1))return null;VOY.fortFait=1;return VOY.fortG;}

