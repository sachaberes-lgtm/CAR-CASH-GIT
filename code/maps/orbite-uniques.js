/* ===== L'ORBITE, LA ROUTE UNIQUE (2026-11-17, Sacha : « c'est toujours la même chose… il met les mêmes modules et la map a globalement la même direction. Je veux que les virages
   soient vraiment aléatoires : on roule 100 mètres, après un virage pendant 50 mètres, après ça descend, après ça remonte… Les modules, on les voit pas assez. Que la map soit unique
   à chaque fois, une expérience totalement différente à chaque partie. Il faut que ce soit optimisé. ») =====
   MESURÉ (passation/routes-uniques/avant, 200 graines) : la route était un SQUELETTE — ~150-200 m droits puis toujours le même demi-S, une pente constante (−28 à −32°), et
   toujours la même fin (grand tour → lacet → rentrée → plongée, ~45 % de la route) ; au palier 10, 19 suites de modules sur 200, deux modules par route ; les dix des VOYAGES dormaient.
   Désormais (ORB_RU, `?sans=uniques` = la route d'avant au bit près) UN PLAN par graine (orbUPlan, tiré du sac commun gameplay/route-uniques.js) :
   - LE SAC : les 20 grands modules (ceux du ruban ET des voyages, géants compris) et 8 petits, dans un ordre tiré au hasard pesé (ce qui vient de passer ne revient pas) ;
     l'humeur et le voyage ne font que PENCHER les poids. Tressés : jamais trois grands de suite, jamais plus de deux petits de suite.
   - LE TEMPS FORT (la marque climax) : un des grands tours (grande torsade, S retourné, faille à l'envers, un géant) — à une place tirée de la route (début, milieu ou fin).
   - L'OUVERTURE (sept) : demi-S · grand virage d'un côté · plongeon · direct (droit dans le 1er module) · S serré · bosse · mur (droit dans un virage couché).
   - LA FIN (quatre) : la désorbitation (rentrée + plongée, une route sur quatre environ) · un grand virage et la plongée seule · le lacet · un dernier module.
   - LE RELIEF (cinq, la pente que pisteTord tient, ORB5.prof) : rampe · douce · raide · paliers (des replats entre des marches) · vagues (ça respire, parfois ça remonte).
   - LA SILHOUETTE (sept, l'axe de la route : orbVoyAxe) : spirale · S · zigzag · vague · crochet · dérive · libre — en miroir une fois sur deux.
   - LES LIAISONS : une suite tirée de petits gestes (un virage de 30-120°, une droite courte, un S, une épingle large), parfois rien (deux modules collés).
   - LES PETITS MODULES (orbUModules, 2-5 s réelles, les primitives d'orbModules, aucun décor ni matière neuve) : le mur · l'esse · la marche · la bosse · le quart · la chicane ·
     le plongeon · (le lacet, qui existait).
   Les règles de sécurité restent celles d'orbModules : le budget d'envers (ORB_ENVMAX), jamais deux grands tours de dalle d'affilée, une faille OU une cascade, la faille à
   l'envers sur une route d'au moins 100 s, la borne capMax autour de l'axe, « jamais plus de ~9 s du même côté » (cote, SENS). Crochet : dbgOrbU(). */
/* (2026-11-18, L'ESPACE SANS GÉANTS — voir ESP_SANS_GEANTS, orbite-modules.js) le sac et le temps fort sans les quatre géants des voyages (la roue, la petite lune, l'astéroïde
   percé, la nébuleuse) : 16 grands modules et 8 petits ; le temps fort est la torsade, le S retourné ou la faille à l'envers (OU_CX2 sur les routes courtes). */
const OU_GRANDS=['torsade','sret','surbaisse','bobsleigh','plongeant','faille','cascade','fronde','ceinture','failleEnvers','bosses','pique','balancier','stengel','marches','spirale','roue','lune','asteroide','nebuleuse'].filter(function(k){return !ESP_SANS_GEANTS||VOY_GEANTS.indexOf(k)<0;});
const OU_PETITS=['mur','esse','marche','bosse','quart','chicane','plongeon','lacet'];
const OU_LONGS={ceinture:1,balancier:1,bobsleigh:1}; /* les plus longs à placer (14-16 s) : un peu plus lourds, sinon ils passaient sous 8 % des routes */
const OU_CX=['torsade','sret','failleEnvers','roue','lune','asteroide','nebuleuse'].filter(function(k){return !ESP_SANS_GEANTS||VOY_GEANTS.indexOf(k)<0;}),OU_CX2=['surbaisse','fronde','stengel','plongeant']; /* OU_CX2 : sur une route trop courte pour un grand tour (les paliers rapides), le temps fort est un virage qui passe au plafond */ /* les grands tours qui peuvent porter la marque du temps fort */
const OU_OUV=['demiS','grand','plongeon','direct','sserre','bosse','mur'],OU_OUVW={demiS:1,grand:1.1,plongeon:.22,direct:.8,sserre:1,bosse:.26,mur:.3}; /* plongeon et bosse sont aussi des modules : moins lourds, aucun 1er module au-dessus de 15 % */
const OU_SIL=['spirale','S','zigzag','vague','crochet','derive','libre'],OU_REL=['rampe','douce','raide','paliers','vagues'];
const OU_FIN=['desorb','virage','lacet','module'],OU_FINW={desorb:.8,virage:1.1,lacet:.9,module:1.1};
Object.assign(ORB_DR,{mur:4.4,esse:4.8,marche:3.6,bosse:4,quart:5.4,chicane:4.2,plongeon:4.4});
Object.assign(ORB_NOM,{mur:'le mur',esse:'l\'esse',marche:'la marche',bosse:'la bosse',quart:'le quart',chicane:'la chicane',plongeon:'le plongeon',lacet:'le lacet'});
const OU={kAx:1,uw:1,der:null,force:(function(){const o={},q=typeof location!=='undefined'?location.search:'';for(const k of ['ouv','sil','rel','fin','cx']){const m=new RegExp('[?&]orb'+k+'=([a-zA-Z]+)').exec(q);if(m)o[k]=m[1];}return o;})()}; /* OU.force : `?orbouv= ?orbsil= ?orbrel= ?orbfin= ?orbcx=` imposent l'ouverture, la silhouette, le relief, la fin, le temps fort (banc, essais en jeu) */
/* ===== L'ENTRÉE TENUE (2026-11-18, Sacha : « le module de l'espace, il est très buggé […] j'ai rien compris ce qui se passait ») =====
   MESURÉ (outils/banc-espace/etat-entree.cjs, entree-test.cjs ; 60 graines × paliers 0-27) : sur une route à plan, le 1er module commençait 1,2-1,7 s réelles après l'entrée
   et la dalle se couchait à plus de 25° dès 0,6-0,8 s (l'ouverture partait au bout des ~110 m de départ) — sous l'entrée en orbite (ORBFX.warp : flash, secousse, tunnel,
   flou radial pendant 1,9 s ; le voile 0,5 s ; le ciel 1,2 s) : le joueur roulait une figure qu'il n'avait pas vue venir. Désormais L'ENTRÉE : OU_ENTREE_S
   secondes RÉELLES (vPalier × élan) d'une courbe douce, tenue par pisteTord (ORB5.s0U, le départ tenu ; ORB5.cE : la dalle à moins de 20°, la pente du relief tenue), puis
   l'ouverture ; le 1er module jamais avant. La route s'allonge de l'entrée (le plan garde toute sa place). Pour toutes les routes à plan : la même route que l'on arrive par un
   portail ou au départ (MESURÉ : au départ la caisse part plus lente, l'entrée y dure un peu plus). `?sans=entreetenue` = la route d'avant (build 121) au bit près. */
const OU_ENTREE=typeof location==='undefined'||!/[?&]sans=([^&]*,)?entreetenue(,|&|$)/.test(location.search),OU_ENTREE_S=2.6;
/* l'entrée d'une route à plan : s0 (m réels, le départ tenu de pisteTord) = OU_ENTREE_S s à la vitesse RÉELLE vE = vPalier × élan (R.Tt, la croisière bornée à 410 m/s × élan,
   est plus lente aux derniers paliers) ; aE : sa fin en m dessinés (ap) ; plus : ce qu'elle ajoute devant l'ouverture — la route s'allonge d'autant (MESURÉ : sans cela, ~0,2 module
   de moins par route et, au palier 27, trois fois plus de reprises d'unicité : des suites de modules plus courtes se répètent plus). null : `?sans=entreetenue`. */
function orbUEntree(X,Tt){if(!OU_ENTREE)return null;const vE=typeof vPalier==='function'&&typeof elanReel==='function'?Math.max(Tt,vPalier()*elanReel()):Tt,s0=Math.max(150,OU_ENTREE_S*vE),aE=s0*X.vS/X.vC;return {s0:s0,aE:aE,plus:Math.max(0,aE-X.ap())};}
function OU_SENSOK(R,s9){const S9=R.sens();return !(S9&&S9.s===s9&&S9.t>2.2);} /* « jamais plus de ~10 s du même côté » : on ne ramène pas vers l'axe en prolongeant un virage qui dure déjà (SENS, en s de croisière) */
const OU_FIGP={lacet:1,marche:1,bosse:1,plongeon:1},OU_FIGV={pique:1,marches:1,bosses:1,lacet:1,plongeon:1,marche:1,bosse:1}; /* FIGV : les figures des voyages (et le lacet) dont la dalle sort couchée : au moins ~2 s de liaison après elles, avant un module qui se couche (MESURÉ : collées à un S retourné ou un géant, l'horizon tournait à 70-88°/s) */ /* les figures (repère libre, relief gardé) : une droite courte après elles, avant tout virage couché d'une liaison (MESURÉ : sans elle, l'horizon tournait à 85-120°/s) */ /* (banc) le dernier plan joué et ce que le pilote en a fait */
/* LE PLAN d'une graine (une fois, gardé par ruPlan : les six essais du directeur de rythme et le vrai départ rendent la même route) */
function orbUPlan(g){return ruPlan('espace',g,function(v){const h=mulberry32((Math.imul(g>>>0,0x85EBCA6B)^0x0B17E5A3^Math.imul(v|0,0x7F4A7C15))>>>0), /* v : la variante du plan (ruRefait : sa suite de modules avait déjà été jouée) */U9=function(a,b){return a+(b-a)*h();};
  const NH=Object.keys(ORB_HUMEURS),hum=ruChoix('espace','hum',NH,h),voy=ruChoix('espace','voy',Object.keys(VOY_LISTE),h);
  const HW=ORB_HUMEURS[hum].w,VW=VOY_LISTE[voy].w,VG=VOY_LISTE[voy].g||[],mx=function(o){let m=0;for(const k in o)m=Math.max(m,o[k]);return m||1;},mH=mx(HW),mV=mx(VW);
  const RJ=v?(OU.rejet||[]):[],biais=function(k){return (RJ.indexOf(k)>=0?.15:1)*(.7+.3*(HW[k]||0)/mH+.3*(VW[k]||0)/mV+(VG.indexOf(k)>=0?.4:0)+(k==='failleEnvers'&&hum==='VERTIGE'?.4:0)+(OU_LONGS[k]?.5:0));}; /* l'humeur et le voyage PENCHENT les poids (0,7 à ~1,4) : le sac fait le reste */
  const F9=OU.force,ouv=F9.ouv||ruChoix('espace','ouv',v>=2?['demiS','grand','direct','sserre']:OU_OUV,h,OU_OUVW), /* une variante refaite : une ouverture sans module imposé */sil=F9.sil||ruChoix('espace','sil',OU_SIL,h),rel=F9.rel||ruChoix('espace','rel',OU_REL,h),fin=F9.fin||ruChoix('espace','fin',OU_FIN,h,OU_FINW);
  let G=ruOrdre('espace',OU_GRANDS.map(function(k){return {k:k,w:biais(k)};}),h),P=ruOrdre('espace',OU_PETITS.map(function(k){return {k:k,w:RJ.indexOf(k)>=0?.15:1};}),h);
  if(v>=2){const mel=function(A){for(let i=A.length-1;i>0;i--){const j=(h()*(i+1))|0,t=A[i];A[i]=A[j];A[j]=t;}return A;};const pen=function(A){return A.filter(function(k){return RJ.indexOf(k)<0;}).concat(A.filter(function(k){return RJ.indexOf(k)>=0;}));};G=pen(mel(G));P=pen(mel(P));} /* (tour 4) une variante refaite deux fois : l'ordre tiré à plat (le sac pèse trop les modules récents aux paliers rapides, les suites y tournaient en rond), ceux de la suite rejetée en dernier */
  if(F9.cx&&G.indexOf(F9.cx)>0){G.splice(G.indexOf(F9.cx),1);G.unshift(F9.cx);}
  const cxL=G.filter(function(k){return OU_CX.indexOf(k)>=0||k===F9.cx;}),cx=cxL[0],cx2=G.filter(function(k){return OU_CX2.indexOf(k)>=0;});G=G.filter(function(k){return k!==cx;});
  if(ouv==='plongeon'||ouv==='bosse'||ouv==='mur')P=P.filter(function(k){return k!==ouv;});if(fin==='lacet')P=P.filter(function(k){return k!=='lacet';});
  const ordre=[];{let iG=0,iP=0,nG=0,nP=0;while(iG<G.length||iP<P.length){let p=iG>=G.length?true:iP>=P.length?false:nP>=2?false:nG>=2?true:h()<(nP===1?.2:nG===1?.5:.34)+(v>=2?.35:0); /* une variante refaite deux fois (sa suite était déjà jouée) : plus de petits modules, donc plus de modules dans la route */
    if(p){ordre.push(P[iP++]);nP++;nG=0;}else{ordre.push(G[iG++]);nG++;nP=0;}}}
  const s=h()<.5?-1:1,A=sil==='spirale'?U9(240,340):sil==='S'?U9(100,150):sil==='zigzag'?U9(45,70):sil==='vague'?U9(55,90):sil==='crochet'?U9(180,300):sil==='derive'?U9(150,240):U9(40,90),B=sil==='spirale'||sil==='crochet'||sil==='derive'?0:U9(170,310),sB=sil==='S'?s:h()<.5?-1:1; /* (le S part du côté où la route dérive : sinon il ramenait la fin droit devant) */ /* B : la dérive d'ensemble (la fin vue du départ : 60-130°) */
  const S9={f:sil,s:s,A:A,B:B,sB:sB,k:sil==='zigzag'?U9(1.5,2.5):sil==='vague'?U9(1,1.6):U9(1.2,2.2),k2:U9(2.4,3.6),u0:sil==='crochet'?U9(.08,.35):U9(.18,.4),p1:h()*6.283,p2:h()*6.283};
  const p={g:g,v:v|0,hum:hum,voy:voy,vo:{cle:voy,g:[],sil:S9},ouv:ouv,sil:sil,rel:rel,fin:fin,ordre:ordre,cx:cx,cxL:cxL,cx2:cx2,cxU:U9(.04,.92),
    geantC:h()<.5,lia:{colle:U9(.06,.22),n:[U9(.05,.2),U9(.3,.5),U9(.25,.45),U9(.1,.25)]},rs:(h()*4294967296)>>>0};
  p.sig=[hum,voy,ouv,sil,rel,fin,cx,Math.round(A*s),Math.round(B*sB),ordre.join('>')].join('|');return p;});}
/* LE RELIEF : la pente visée (× ORB5.desc) le long de la route, en noeuds {u (part de la route), m (le multiple)} — pisteTord la suit à son rythme lent (ORB5.tang, tangBas) */
function orbUProfil(rel,r,LEN,vC){const U9=function(a,b){return a+(b-a)*r();},du=function(s){return s*vC/Math.max(1,LEN);},m0=U9(.55,1.4),u=[0],m=[m0];let x=0; /* m0 : (tour 3) la pente du départ, tirée pour chaque route (16-35°) — deux routes ne partent plus à la même pente (le contrôle adverse : des routes jumelles sur 3 km aux paliers rapides) */
  if(rel==='douce'){const k=U9(.42,.58);u.push(du(U9(1.5,3)),1);m.push(k,k);}
  else if(rel==='raide'){const k=U9(1.3,1.45);u.push(du(U9(1.5,3)),1);m.push(k,k);}
  else if(rel==='paliers'){x=du(U9(.4,1.2));u.push(x);m.push(m0);if(r()<.5){const b=U9(0,.15);x+=du(U9(.8,1.2));u.push(x);m.push(b);x+=du(U9(1.8,3.6));u.push(x);m.push(b);} /* une fois sur deux, la route commence par un replat */while(x<1){const a=U9(1.45,1.75),b=U9(0,.15);x+=du(U9(.8,1.4));u.push(x);m.push(a);x+=du(U9(2.5,5));u.push(x);m.push(a);x+=du(U9(.8,1.2));u.push(x);m.push(b);x+=du(U9(1.8,3.6));u.push(x);m.push(b);}} /* des marches raides (1,35-1,6 ×), des replats presque à plat (0,06-0,2 ×) */
  else if(rel==='vagues'){x=du(U9(.4,1.2));u.push(x);m.push(m0);if(r()<.5){const q=r()<.5?-U9(.18,.42):U9(.35,.65);x+=du(U9(1.2,2));u.push(x);m.push(q);x+=du(U9(1.6,3));u.push(x);m.push(q);} /* une fois sur deux, elle commence par le creux (ou par une remontée) */while(x<1){const fort=U9(1.35,1.6),remonte=r()<.55;x+=du(U9(1,1.6));u.push(x);m.push(fort);x+=du(U9(2.5,5));u.push(x);m.push(fort);
      if(remonte){const q=-U9(.18,.42);x+=du(U9(1.4,2.2));u.push(x);m.push(q);x+=du(U9(1.6,3));u.push(x);m.push(q);} /* ça REMONTE (de ~4 à ~10° à la pente de base) */
      else{const q=U9(.35,.65);x+=du(U9(1,1.6));u.push(x);m.push(q);x+=du(U9(2,4));u.push(x);m.push(q);}}}
  else{u.push(du(U9(2,4)),1);m.push(1,1);}
  return {u:u,m:m};}
function orbUProf(P,x){const u=P.u,m=P.m;if(x<=u[0])return m[0];for(let i=1;i<u.length;i++)if(x<=u[i]){const t=(x-u[i-1])/Math.max(1e-9,u[i]-u[i-1]);return m[i-1]+(m[i]-m[i-1])*t;}return m[m.length-1];}

/* ===== LES PETITS MODULES (ajoutés à M par orbModules quand la route a un plan) — X : les outils d'orbModules ===== */
function OU_KC(K){return K.longue/(K.el||1)<40?.72:1;} /* une route de moins de 40 s réelles (paliers ~15 et plus) */
function orbUModules(M,X){
  const kC=OU_KC(X.K),K=X.K,U=X.U,arc=X.arc,Rt=function(d,a,mn){return X.Rt(d*kC,a,mn);},balai=X.balai,cote=X.cote,borne=X.borne,Tt=X.Tt*kC,rP=X.rP,rf=X.rf,fS=K.fS,OK=ORB_K, /* kC : sur une route courte, les petits modules en 72 % de leur temps (pisteTord borne toujours le coucher total : la dalle se couche un peu moins) */pente=function(d){return Math.tan(d/57.2958);};
  /* LE MUR : un seul virage de 60-95°, pris couché à 62-72° (le coucher et le relevé sur 42 % de l'arc chacun : ~33°/s) */
  M.mur=function(){const s=cote(80),d=-s,p=-.03,a=Math.min(95,Math.max(60,borne(s,U(62,94),50))),R=Rt(U(4.2,4.8),a,2.6),lean=U(1.08,1.26);
    const i0=K.i();fS(.3*Tt,p*.3*Tt,1);arc(s*a*.42,R,p);const i1=K.i();arc(s*a*.16,R,p);const i2=K.i();arc(s*a*.42,R,p);fS(.3*Tt,p*.3*Tt,1);const i3=K.i();
    return {fig:'mur',nom:ORB_NOM.mur,calme:1,g:1,c:[[i0,i1,d*lean,OK],[i2,i3,-d*lean,OK]]};};
  /* L'ESSE : deux virages courts opposés, la dalle couchée ~38° dans chacun, d'un bord sur l'autre */
  M.esse=function(){const s=balai(50),p=-.03,th=U(.6,.74),a1=Math.max(35,borne(s,U(40,60),30)),R1=Rt(U(2.3,2.7),a1,2.4);
    const i0=K.i();fS(.3*Tt,p*.3*Tt,1);arc(s*a1*.4,R1,p);const i1=K.i();arc(s*a1*.6,R1,p);const a2=Math.max(35,borne(-s,U(40,60),30)),R2=Rt(U(2.3,2.7),a2,2.4);arc(-s*a2*.6,R2,p);const i3=K.i();arc(-s*a2*.4,R2,p);fS(.3*Tt,p*.3*Tt,1);const i4=K.i();
    return {fig:'esse',nom:ORB_NOM.esse,calme:1,g:1,c:[[i0,i1,-s*th,OK],[i1,i3,2*s*th,OK],[i3,i4,-s*th,OK]]};};
  const Tf=X.Tt,Rf=X.Rt; /* les figures à relief (marche, bosse, plongeon) gardent leur temps : leurs couchers ne s'accélèrent pas */
  /* LE RAYON VERTICAL (le contrôle adverse, 17/11 : la marche faisait des creux de 39 m, la bosse des crêtes de 61 m, sous le rayon que la caisse tient) : une pente ne
     change plus d'un coup — `glisse(a°, L, θ0, θ1)` tourne de a° (0 : droit) sur L m en passant de la pente θ0 à θ1 (degrés, + : monte) en petits pas, sur une longueur
     d'au moins RV·|Δθ|·1,5 (RV = 1,35 × le rayon tenable du palier) */
  const RV=1.35*(typeof rayonPalier==='function'?rayonPalier():40+.3*(typeof vPalier==='function'?vPalier():78)),lMin=function(d0,d1){return RV*Math.abs(d1-d0)/57.2958*1.5;};
  const glisse=function(aDeg,L,d0,d1){const n=Math.max(4,Math.ceil(Math.abs(d1-d0)/2.5)),Lx=Math.max(L,lMin(d0,d1));
    for(let q=0;q<n;q++){const u=(q+.5)/n,d=d0+(d1-d0)*u*u*(3-2*u),l=Lx/n;if(Math.abs(aDeg)<.5)fS(l,pente(d)*l,1);else arc(aDeg/n,l/(Math.abs(aDeg)/n/57.2958),pente(d));}};
  /* LA MARCHE (figure) : une marche raide (~14° de plus que la descente), puis un palier qui tourne en S — les changements de pente arrondis (glisse) */
  M.marche=function(){const s=balai(50),dS=-U(13,16),dP=U(17,22),a=U(60,76),R=Rf(2.4,a,2.6),Lh=a/2/57.2958*R;glisse(0,.3*Tf,-1.7,dS);fS(.7*Tf,pente(dS)*.7*Tf,2);const ia=K.i();glisse(s*a*.5,Lh,dS,dP);const im=K.i();glisse(-s*a*.5,Lh,dP,-1.7);const ib=K.i();fS(.3*Tf,-.03*.3*Tf,1);
    return {fig:'marche',nom:ORB_NOM.marche,g:1,pente:1,c:[[ia,im,-s*.3,OK],[im,ib,s*.3,OK]]};}; /* le palier tourne en S : le cap revient sur sa ligne (MESURÉ : d'un seul côté, le repère libre sortait penché de ~30° et le rappel tournait l'horizon à 80°/s) */
  /* LA BOSSE (figure) : une seule bosse dans un S de 60-72° — la pente suit une sinusoïde en 16 pas, longue d'au moins 2π·A·RV (la crête jamais sous le rayon tenu) */
  M.bosse=function(){const s=cote(40),A=U(12,22),a=U(56,84),Lh=Math.max(U(2.4,3.8)*Tf,2*Math.PI*A/57.2958*RV*1.15),R=Lh/(a/57.2958),N=16;fS(.4*Tf,-.03*.4*Tf,1);const i0=K.i();let im=0;
    for(let j=0;j<N;j++){arc((j<N/2?s:-s)*a/N,R,-.03+pente(A*Math.sin(2*Math.PI*(j+.5)/N)));if(j===N/2-1)im=K.i();}const i1=K.i();fS(.4*Tf,-.03*.4*Tf,1);
    return {fig:'bosse',nom:ORB_NOM.bosse,g:1,pente:1,c:[[i0,im,-s*.21,OK],[im,i1,s*.21,OK]]};};
  /* LE QUART : sur une courbe douce (38-58°), la dalle se couche jusqu'à ~77-86° et revient — jamais l'envers */
  M.quart=function(){const s=cote(50),d=-s,p=-.03,a=Math.min(60,Math.max(35,borne(s,U(38,58),30))),R=Rf(U(5,5.6),a,4),lean=U(1.34,1.5);
    const i0=K.i();fS(.3*Tf,p*.3*Tf,1);arc(s*a*.45,R,p);const i1=K.i();arc(s*a*.1,R,p);const i2=K.i();arc(s*a*.45,R,p);fS(.3*Tf,p*.3*Tf,1);const i3=K.i();
    return {fig:'quart',nom:ORB_NOM.quart,calme:1,g:1,c:[[i0,i1,d*lean,OK],[i2,i3,-d*lean,OK]]};};
  /* LA CHICANE : trois virages serrés alternés (30-38°, 60-76°, 30-38°), la dalle couchée par le dévers de pisteTord */
  M.chicane=function(){const i0=K.i();fS(.3*Tf,-.03*.3*Tf,1);const s=cote(40),R=U(2.8,3.2)*rP,a1=U(30,36),a3=U(30,36);
    arc(s*a1,R,-.04);arc(-s*(a1+a3),R,-.04);arc(s*a3,R,-.04);fS(.3*Tf,-.03*.3*Tf,1);const i1=K.i(); /* le cap revient sur sa ligne (pas de lacet vu de l'horizon) ; la dalle prend le dévers de pisteTord (calme) */
    return {fig:'chicane',nom:ORB_NOM.chicane,calme:1,g:1,c:[]};};
  /* LE PLONGEON (figure) : ~2 s de piqué (jusqu'à ~18° de plus que la descente), puis la ressource en virage */
  M.plongeon=function(){const s=cote(60),dP=-U(12,24),a=U(56,90),R=Rf(U(2,3),a,2.6),Lh=a/2/57.2958*R;const l1=U(.15,.6)*Tf,l2=U(.7,1.5)*Tf;fS(l1,-.03*l1,1);glisse(0,U(.4,.8)*Tf,-1.7,dP);fS(l2,pente(dP)*l2,3); /* (tour 3) des plages larges : deux plongeons ne se ressemblent plus aux paliers rapides */const i1=K.i();
    glisse(s*a*.5,Lh,dP,-6);const im=K.i();glisse(-s*a*.5,Lh,-6,-1.7);const i2=K.i(); /* la ressource en S, arrondie (glisse) : le cap revient sur sa ligne */
    return {fig:'plongeon',nom:ORB_NOM.plongeon,g:1,pente:1,c:[[i1,im,-s*.3,OK],[im,i2,s*.3,OK]]};};
}

/* ===== LE PILOTE : la route d'un plan (appelé par genCtrl1 à la place de la phrase de rythme) =====
   X : U (le plan), ORB (orbModules, ORB.ru ses outils), rf, LEN, vS (m par s de croisière), vC (la croisière de pisteTord), finO (l'arrivée tenue), LV, ap() (les m dessinés),
   ax(u) (l'axe à la part u), poseO (un module et sa marque), fS (une droite), ends : la droite d'arrivée vient après (genCtrl1). */
function orbUJoue(X){const U=X.U,R=X.ORB.ru,M=R.M,rf=X.rf,Tt=R.Tt,rP=R.rP,E9=orbUEntree(X,Tt),LEN=X.LEN+(E9?E9.plus:0),vS=X.vS,finO=X.finO,ap=X.ap,fS=X.fS,poseO=X.poseO,Ur=function(a,b){return a+(b-a)*rf();};
  const r9=mulberry32(U.rs);ORB5.prof=orbUProfil(U.rel,r9,LEN,vS);ORB5.s0U=E9?E9.s0:150;ORB5.cE=E9?E9.s0:0; /* (L'ENTRÉE TENUE, orbUEntree) la dalle à moins de 20° dans l'entrée (pisteTord) */ /* le relief de CETTE route (lu par pisteTord) ; le départ tenu de pisteTord : 150 m (au lieu de 450) */
  const ax=function(){X.ax(Math.min(1,ap()/Math.max(1,LEN)));},libre=function(){return LEN-ap()-finO;},bout=function(){return LEN-30-ap()-110*X.LV;};
  const LACK=3.2,lacetU=function(){return 4*74/57.2958*LACK*rP+.6*Tt;}; /* le lacet d'une route à plan : 3,2 rP au lieu de 1,8 (MESURÉ : sur une pente de 35-40°, le lacet serré faisait tourner l'horizon à 60-76°/s) */
  const dur=function(k){return k==='lacet'?lacetU():court&&(k==='asteroide'||k==='nebuleuse')?11.4*Tt:R.duree(k)*(OU_PETITS.indexOf(k)>=0&&court?.72:court&&!(R.envDe(k)>0)?.8:1);};
  const envMax=ORB_ENVMAX*R.DUR9,envCx0=function(k){return k==='torsade'?ORB_ENVS.grande:court&&(k==='asteroide'||k==='nebuleuse')?R.envDe(k)*.75:R.envDe(k);};
  const court=R.DUR9<40;OU.kAx=1;OU.uw=R.DUR9<30?.45:court?.6:1; /* uw : sur une route courte, la silhouette se joue plus tôt (u^0,6) — en 25 s la route n'avait pas le temps de quitter la direction du départ */ /* (une route courte : la silhouette plus ample — en 25 s la route n'a pas le temps de la suivre) */
  let FIN=R.DUR9<30||court&&U.v>=2?'module':court&&U.fin==='desorb'&&U.v?'virage':court&&U.fin==='lacet'?'module':U.fin; /* (de même le lacet de fin : ~6 s à 400 m/s — il reste un petit module, s'il tient) ; une route courte refaite deux fois (sa suite était déjà jouée) finit sur son dernier module : 3-4 s de plus pour un module */ /* court : une route de moins de 40 s réelles (paliers ~15 et plus) — la désorbitation (~12 s) y prenait la place de tous les modules (2 par route, des suites qui se répétaient) : la plongée seule */
  let finRes=FIN==='desorb'?R.duree('rentree')+R.duree('plongee')+1.2*Tt:FIN==='virage'?(court?0:2.4*Tt)+R.duree('plongee'):FIN==='lacet'?lacetU()+.6*Tt:(court?.8:1.4)*Tt;
  const journal=[];const D={ouv:U.ouv,fin:FIN,court:court,rel:U.rel,sil:U.sil,cx:null,joues:journal,colles:0,gestes:0};OU.der=D;
  /* ---- LES GESTES DES LIAISONS ---- */
  let derArc=0;const arcG=function(sg,a,Rk,rest){if(derArc&&derArc!==sg&&!court){fS(.3*Tt,-.03*.3*Tt,1);D.gestes++;}derArc=sg; /* (tour 3) deux virages opposés : 0,3 s de droite entre eux, le dévers bascule sans s'ajouter au lacet vu de l'horizon (MESURÉ : 71°/s sur une pente de 34°) */const Rr=Math.max((court?2.4:2.7)*rP,court?Math.min(Rk,3)*rP:Rk*rP); /* jamais sous 2,7 rP : deux arcs opposés plus serrés, sur une pente de 35°, faisaient tourner l'horizon à 77°/s à leur jonction */let a9=a;if(rest!=null&&a9/57.2958*Rr>rest){a9=rest/Rr*57.2958;if(a9<30)return false;}R.arc(sg*a9,Rr,-.03);D.gestes++;return true;}; /* rest : la place du geste (m) — un virage plus court ne descend jamais sous 30° (la règle v2 des briques) */
  const cote=function(a){return R.cote(a);};
  const geste=function(kind,rest){ax();
    if(kind==='droite'){fS(Math.min(rest,Ur(.35,.9)*Tt),-.03*Tt,1);D.gestes++;return;}
    if(kind==='S'){const s=cote(45);if(arcG(s,Math.max(30,R.borne(s,Ur(32,60),30)),Ur(2.7,3.4),rest*.55)){ax();arcG(-s,Math.max(30,R.borne(-s,Ur(32,60),30)),Ur(2.7,3.4),rest*.55);}return;}
    if(kind==='epingle'){const s=cote(130),a=R.borne(s,Ur(110,150),30);arcG(s,Math.max(30,a),Ur(2.6,3.4),rest);return;}
    const d9=R.dev();if(Math.abs(d9)>20&&OU_SENSOK(R,d9>0?-1:1)){const s9=d9>0?-1:1;arcG(s9,Math.max(30,Math.min(120,Math.abs(d9)*Ur(.8,1.15))),Ur(2.2,3.4),rest);return;} /* LA SILHOUETTE : loin de l'axe (> 20°), le virage y ramène (sinon les modules en S, qui reviennent sur leur ligne, laissaient la route droit devant : le contrôle adverse) */
    const s=cote(70);arcG(s,Math.max(30,R.borne(s,Ur(30,120),30)),Ur(2.2,3.4),rest);};
  const casse=function(){const S9=R.sens();if(S9&&S9.s&&S9.t>(court?5:3.5))arcG(-S9.s,Ur(32,42),Ur(2.6,3.2));}; /* « jamais plus de ~10 s du même côté » : la route tourne depuis 3,5 s de croisière du même côté → un contre-virage avant le module suivant (MESURÉ : rentrée + plongée, ou trois modules ramenés vers l'axe, faisaient 13-19 s du même côté) */
  const GW={vir:3,droite:1,S:1.4,epingle:.6};
  const plat=function(k){return k&&M[k]&&OU_FIGP[k];};
  const LIA=court?1:2.6; /* la plus longue liaison (s réelles) : de la place pour les modules */
  const liaison=function(nMax,apresFig,lent){let n=0;const q=U.lia.n,x=rf();n=x<q[0]?0:x<q[0]+q[1]?1:x<q[0]+q[1]+q[2]?2:3;n=Math.min(n,nMax==null?3:nMax);if(!n)n=1;let der='';if(apresFig){fS(Ur(.45,.7)*Tt,-.03*Tt,1);D.gestes++;der='droite';}
    if(n9Prem){n9Prem=0;const s9=cote(90);arcG(s9,Math.max(30,R.borne(s9,Ur(60,110),30)),Ur(2.4,3.2));if(n>1)n--;} /* après un 1er module qui revient sur sa ligne (le plongeon, la bosse) : un vrai virage, la route ne file pas droit 700 m */
    const a0=ap(),B=Math.max(lent?2:0,Ur(.7,LIA))*Tt;if(lent&&n<2)n=2;
    if(lent){fS(Ur(1,1.2)*Tt,-.03*Tt,1);D.gestes++;const s9=cote(40);arcG(s9,Math.max(30,R.borne(s9,Ur(30,40),30)),Ur(5,6));n--;der='vir';} /* ~1 s de droite (la dalle revient à l'endroit sans dévers par-dessus), puis un grand arc doux */ /* un grand arc doux (5-6 rP : peu de dévers) pendant que la dalle revient */ /* on continue du côté où la figure sortait : son dévers s'éteint au lieu de basculer */
    for(let j=0;j<n;j++){const rest=B-(ap()-a0);if(rest<.35*Tt&&j)break;let t=0;for(const k in GW)if(k!==der||k==='vir')t+=GW[k];let y=rf()*t,kind='vir';for(const k in GW){if(k===der&&k!=='vir')continue;y-=GW[k];if(y<=0){kind=k;break;}}if(Math.abs(R.dev())>(court?15:30)&&OU_SENSOK(R,R.dev()>0?-1:1))kind='vir';geste(kind,Math.max(rest,.6*Tt));der=kind;}}; /* loin de l'axe : un virage qui y ramène */
  /* ---- L'OUVERTURE (après la droite du départ de genCtrl1) ---- */
  const Z9=X.vS/X.vC,aE=E9?E9.aE:0; /* (L'ENTRÉE TENUE) aE : la fin de l'entrée, en m dessinés (ap) — Z9 : le rapport des m dessinés aux m de fS */
  if(E9&&ap()<aE){const l9=(aE-ap())/Z9,k9=Math.max(2,Math.round(l9/(55*X.LV))),a9=Math.min(Ur(10,45),l9/(4*rP)*57.2958),s9=rf()<.5?-1:1;for(let j=0;j<k9;j++)R.arc(s9*a9/k9,l9/(a9/57.2958),-.02);} /* L'ENTRÉE : une courbe DOUCE (10-45°, jamais sous 4 rP : la dalle y penche à peine, pisteTord la borne à 20°), en k9 arcs d'un point (un point tous les ~55 m × LV, comme le départ : un seul point au bout, la courbe de Catmull-Rom cintrait la route), AVANT l'ouverture (et avant D.a0 : la signature vécue se compte toujours depuis l'ouverture) — MESURÉ (uniques/test.cjs) : une droite rendait les 1,5 premiers km trop semblables (formes de dessus 29 → 22 au palier 0, 17 → 12 au palier 10 ; avec la courbe 27 et 22) */
  D.Tt=Tt;D.a0=ap();OU.ent=E9?ap():0; /* (la signature vécue : la seconde réelle, le début de l'ouverture) · OU.ent (L'ENTRÉE TENUE) : la forme (orbUForme) se lit depuis l'ouverture */
  const deb=Math.max(Math.max(150,1.2*X.vC),aE)+85; /* le 1er module : après le départ tenu de pisteTord (ORB5.s0U, + 60 m) */
  const s0=(function(){const a1=orbVoyAxe(.15);return Math.abs(a1)>.05&&rf()<.75?(a1>0?1:-1):rf()<.5?-1:1;})();let premier=null; /* l'ouverture part, trois fois sur quatre, du côté où la silhouette emmène la route */
  const kO=court?.55:1,RO=court?2.2:2.4; /* une route courte : l'ouverture en ~1 s (à 400 m/s elle prenait 4-5 s) */
  const OUV=U.ouv;
  if(OUV==='demiS'){const a=Ur(40,75)*(court?.75:1);R.arc(s0*a,Math.max(RO*rP,kO*Ur(1.3,1.8)*Tt/(a/57.2958)),-.02);R.arc(-s0*Math.max(30,a*Ur(.8,1.2)),Math.max(RO*rP,kO*Ur(1.2,1.7)*Tt/(a/57.2958)),-.02);}
  else if(OUV==='grand'){const a=court?Ur(55,85):Ur(60,140);R.arc(s0*a,court?Ur(2.2,2.6)*rP:Ur(2.4,3.4)*rP,-.02);}
  else if(OUV==='sserre'){let s=s0;for(let j=0;j<(court?2:3);j++){R.arc(s*Ur(32,52),Ur(2,2.6)*rP,-.02);s=-s;}}
  else if(OUV==='plongeon'||OUV==='bosse'||OUV==='mur')premier=OUV;
  else if(OUV==='module'){const L9=U.ordre.filter(function(k){return OU_PETITS.indexOf(k)>=0&&k!=='lacet';});premier=L9.length?L9[0]:null;}
  if(ap()<deb)fS(deb-ap(),-.02*(deb-ap()),1);
  /* ---- LES MODULES : l'ordre du plan, ce qui tient ; le temps fort à SA place ---- */
  const liste=U.ordre.slice(),petit=function(k){return OU_PETITS.indexOf(k)>=0;},envers=function(k){return R.envDe(k)>0||k==='torsade'||k==='sret'||k==='failleEnvers';};
  let cx=null,cxFait=false,nG=0,nP=0,derEnv=false,n=0,derK=null,n9Prem=premier==='plongeon'||premier==='bosse'?1:0;
  /* (2026-11-18, L'ESPACE SANS GÉANTS) une route courte sur deux prenait pour temps fort l'astéroïde percé ou la nébuleuse (le demi-tonneau) : elle prend désormais le virage surbaissé ou le dévers inversé (ceux des virages courts qui passent au plafond), s'ils tiennent */
  for(const k of court?(U.geantC?(ESP_SANS_GEANTS?(U.cx2||OU_CX2).filter(function(q){return q==='stengel'||q==='surbaisse';}):U.cxL.filter(function(q){return q==='asteroide'||q==='nebuleuse';})):[]).concat(U.cx2||OU_CX2,U.cxL):U.cxL.concat(U.cx2||OU_CX2))if(R.ok(k)&&dur(k)+finRes+3*Tt+(court?2*dur('chicane')+1.8*Tt:0)<libre()&&envCx0(k)<=.92*envMax){cx=k;break;}D.cx=cx; /* (tour 4) sur une route courte, le temps fort laisse la place de deux petits modules */ /* le temps fort du plan, s'il tient sur CETTE route (sa place, son envers) ; sinon le suivant du plan */
  const cxAt=U.cxU*Math.max(0,LEN-finO-finRes-(cx?dur(cx):0)),envCx=cx?envCx0(cx):0;
  const joue=function(k,estCx){ax();const i0=MODMARK.length;
    if(n>0&&Math.abs(R.dev())>(court?15:40)&&!OU_FIGV[derK]&&OU_SENSOK(R,R.dev()>0?-1:1)){const d9=R.dev();arcG(d9>0?-1:1,Math.max(30,Math.min(R.DUR9<30?75:court?130:110,Math.abs(d9)*(court?1.05:.9))),R.DUR9<30?2.4:Ur(2.4,3.1));} /* (tour 4 : sous 30 s, au plus 75° — un virage de 130° à 500 m de rayon prenait 3,5 s, la place d'un module) */ /* LA SILHOUETTE : loin de l'axe (> 40°), la liaison est un virage qui y ramène (les petits modules en S reviennent sur leur ligne : sans lui, la route ne suivait pas son axe) */
    else if(n>0){if(court&&!derEnv&&!envers(k)&&!OU_FIGV[derK]&&Math.abs(R.dev())<25&&rf()<.5){D.colles++;}else if(estCx&&libre()-finRes<dur(k)+2.4*Tt)liaison(OU_FIGV[derK]?2:1,plat(derK),OU_FIGV[derK]);else if(!(rf()<U.lia.colle&&!derEnv&&!envers(k)&&!plat(derK)&&!plat(k)&&!OU_FIGV[derK]))liaison(3,plat(derK),OU_FIGV[derK]);else D.colles++;}
    if(libre()-finRes>dur(k)+.6*Tt)casse();if(libre()-finRes<dur(k)*.97){journal.push('~'+k);return false;} /* (tour 3) les gestes l'ont poussé trop loin : il n'entrerait plus avant l'arrivée tenue (pisteTord le refusait) */
    R.joue(k,poseO,estCx,k==='lacet'?LACK:0);n++;derArc=0;journal.push(k+(estCx?'*':'')+'@'+Math.round(R.dev()));derK=k;if(petit(k)){nP++;nG=0;}else{nG++;nP=0;}derEnv=envers(k);if(estCx){cxFait=true;}return true;};
  if(premier){joue(premier,false);}
  for(let garde=0;garde<60;garde++){ax();const lib=libre()-finRes;
    if(cx&&!cxFait&&(ap()>=cxAt||lib<dur(cx)+R.duree('mur')+5*Tt)){if(lib>dur(cx)+1.2*Tt&&R.envS()+envCx<=envMax){if(!joue(cx,true)){cxFait=true;D.cxRate=1;}continue;}cxFait=true;D.cxRate=1;}
    const res=cx&&!cxFait?dur(cx)+3.2*Tt:0,eRes=cx&&!cxFait?envCx:0,manque=(R.DUR9<30?.08:.11)*R.DUR9-R.envS()-eRes;let pris=-1; /* manque : l'envers qui manque encore à la route (la charte : 6 % au moins ; ORB_ENVS compte large — MESURÉ : la petite lune seule, 3,4 s « prévues », ne fait que 4 % de la route la tête en bas) */
    const candE=[];for(let pass=manque>0&&(court||lib-res<22*Tt)?-1:0; /* une route courte : un 2e module qui passe l'envers (la charte : 6 % au moins) — (tour 4) tiré au hasard parmi ceux qui tiennent : sinon les mêmes virages, des suites qui se répètent */pass<2&&pris<0;pass++){for(let i=0;i<liste.length;i++){const k=liste[i];
      if(pass<0&&!(R.envDe(k)>0))continue;
      if(pass===0&&((nP>=2&&petit(k))||(nG>=2&&!petit(k))))continue;
      if(!R.ok(k)||(k===cx&&!cxFait)||dur(k)+(court?.9:LIA+.7)*Tt+res>lib)continue;
      if(R.DUR9<30&&(k==='roue'||k==='lune'))continue; /* (tour 4) sous 30 s réelles, la roue et la petite lune (~14 s) remplissaient la route à elles seules */ /* (le temps fort attend sa place : jamais joué deux fois) */
      if(court&&k==='lacet'&&U.v>=1)continue; /* une route courte refaite : pas le lacet (~6 s à 400 m/s, la place de deux petits modules) */
      if(R.envS()+R.envDe(k)+(k==='torsade'?0:0)+eRes>envMax)continue;
      if(derEnv&&envers(k)&&k!=='surbaisse')continue;
      if(pass<0&&court){candE.push(i);continue;}
      pris=i;break;}
      if(pass<0&&candE.length)pris=candE[(rf()*candE.length)|0];}
    if(pris<0){if(lib-res>3*Tt){liaison(2);continue;}break;}const k=liste.splice(pris,1)[0];if(!joue(k,false))break;} /* rien ne tient avant le temps fort : des gestes, et on réessaie */
  if(n<2||(R.DUR9<30&&n<3)){FIN='module';finRes=.8*Tt;const k2=liste.filter(function(k){return petit(k)&&k!=='lacet'&&R.ok(k);}).sort(function(a,b){return dur(a)-dur(b);})[0]; /* (tour 4) jamais une route à un seul module nommé (sous 30 s réelles : jamais moins de trois) : la fin cède sa place à un petit module (le plus court qui tient) */
    if(k2&&libre()-finRes>dur(k2)+.3*Tt){liste.splice(liste.indexOf(k2),1);joue(k2,false);}}
  if(!MODMARK.some(function(m){return m.climax;})){let b=null;for(const m of MODMARK)if(m.fig&&m.g&&(!b||m.i1-m.i0>b.i1-b.i0))b=m;if(b)b.climax=1;}
  /* ---- LA FIN ---- */
  ax();const plo=function(){ax();casse();poseO(function(){const m=M.plongee(Math.max(0,libre()),bout());delete m.climax;return m;});};
  if(FIN==='desorb'&&libre()>R.duree('rentree')+R.duree('plongee')*.9){if(libre()>R.duree('rentree')+R.duree('plongee')+1.6*Tt)liaison(1,plat(derK),OU_FIGV[derK]);ax();
    casse();const env=R.envS()+ORB_ENVS.rentreeEnv<=envMax&&(!R.LONG||rf()<.35||R.envS()<.11*R.DUR9); /* au plafond sur une route courte (comme avant), une fois sur trois sur une longue — toujours si la route manque d'envers */poseO(function(){const m=M.rentree(env);delete m.climax;return m;});plo();}
  else if((FIN==='desorb'||FIN==='virage')&&libre()>R.duree('plongee')*.9){if(!court&&libre()>R.duree('plongee')+2.6*Tt){const s=cote(90);R.arc(s*Math.max(40,R.borne(s,Ur(70,110),40)),Ur(2.6,3.4)*rP,-.03);}plo();}
  else if(FIN==='lacet'&&libre()>lacetU()+4.2*Tt&&R.ok('lacet')){if(libre()>lacetU()+5.5*Tt)liaison(1,plat(derK),OU_FIGV[derK]);R.joue('lacet',poseO,false,LACK);journal.push('lacet');liaison(1,true,true);} /* après le lacet de fin, ~1 s de droite et un grand arc doux avant l'arrivée tenue (MESURÉ : collé à l'arrivée, son repère revenait à 60-67°/s) */
  else fS(Ur(.8,1.2)*Tt,-.03*Tt,1);
  /* le reste, jusqu'à la droite d'arrivée (l'arrivée tenue à l'endroit de pisteTord) : de grands virages doux, alternés */
  let s=cote(45);for(let g9=0;g9<12;g9++){const L=bout();if(L<40)break;ax();const a=Ur(32,52),Rr=Math.max(3*rP,Math.min(L,1.6*Tt)/(a/57.2958)),l=a/57.2958*Rr;
    if(l>L){const a2=L/Rr*57.2958;if(a2>=30)R.arc(s*a2,Rr,-.03);else fS(L,-.03*L,1);break;}R.arc(s*a,Rr,-.03);s=-s;const d9=R.dev();if(Math.abs(d9)>15&&OU_SENSOK(R,d9>0?-1:1))s=d9>0?-1:1;} /* (vers l'axe s'il s'en écarte, sans jamais prolonger un virage qui dure : la silhouette jusqu'au portail) */
  D.lon=Math.round(ap());D.LEN=Math.round(LEN);return D;}
/* la route gardée vieillit le sac (une fois par graine) */
/* LA SIGNATURE VÉCUE (le contrôle adverse, 17/11 : « unique sur le papier, la même route pendant 7 s ») : ce que le joueur vit dans les 10 premières secondes réelles —
   l'ouverture (son type, son côté, l'angle tourné arrondi à 20°), la silhouette (et son côté), le relief, puis chaque module qui commence dans ces 10 s, par FAMILLE de forme
   (la fronde, le virage surbaissé, le plongeant et la rentrée : un même grand virage couché ; le mur et le quart ; la marche et les marches ; la bosse et les bosses ;
   le plongeon et le piqué ; la faille et la cascade ; la torsade et le S retourné ; l'astéroïde et la nébuleuse), avec son côté. Des jetons d'un vocabulaire fini. */
const OU_FAM={fronde:'couche',surbaisse:'couche',plongeant:'couche',rentree:'couche',mur:'mur',quart:'mur',marche:'marche',marches:'marche',bosse:'bosse',bosses:'bosse',plongeon:'plonge',pique:'plonge',faille:'faille',cascade:'faille',torsade:'tour',sret:'tour',asteroide:'percee',nebuleuse:'percee'};
function orbUSig(ctrl,marks){const D=OU.der;if(!D||!ctrl||ctrl.length<3)return [];const n=ctrl.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(ctrl[i].x-ctrl[i-1].x,ctrl[i].z-ctrl[i-1].z));
  const hd=function(i){i=Math.max(0,Math.min(n-2,i));return Math.atan2(ctrl[i+1].x-ctrl[i].x,ctrl[i+1].z-ctrl[i].z);},dA=function(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
  const yaw=function(i0,i1){let t=0;for(let i=Math.max(0,i0);i<Math.min(n-2,i1);i++)t+=dA(hd(i+1),hd(i));return t*57.2958;};
  const iDe=function(sm){let i=0;while(i<n-1&&S[i]<sm)i++;return i;},lim=D.a0+10*(D.Tt||100);
  const mk=(marks||MODMARK).filter(function(m){return m.fig;}),i1=mk.length?mk[0].i0:iDe(D.a0+2*(D.Tt||100)),y0=yaw(iDe(D.a0),i1);
  const T=['o:'+D.ouv+(y0>=0?'+':'-')+Math.round(Math.abs(y0)/20),'s:'+D.sil+(orbVoyAxe(.5)>=0?'+':'-'),'r:'+D.rel];
  const vus={};for(const m of mk){if(S[Math.min(n-1,m.i0)]>lim)break;let f=String(m.fig);f=f==='grande-torsade'?'torsade':f==='s-retourne'?'sret':/^(envers-|faille-envers)/.test(f)?'failleEnvers':f.replace(/-(entree|sortie)$/,'');
    if(vus[f])continue;vus[f]=1;const y=yaw(m.i0,Math.round(m.i0+(m.i1-m.i0)*.5));T.push('m:'+(OU_FAM[f]||f)+(y>=0?'+':'-'));}
  return T;}
/* LA FORME (tour 3, le contrôle adverse : des paires de routes à moins de 50 m l'une de l'autre sur les 3 premiers km aux paliers rapides) : les 3 premiers km de la
   route dessinée, un point tous les 250 m, dans le repère du départ et au miroir près (le premier écart franc à droite), (l'altitude estimée par le relief tiré est gardée mais pas comparée :
   MESURÉ, aux paliers rapides pisteTord n'a pas le temps de la suivre en 7 s) ; les 400 dernières formes de la séance (en mémoire) ; une route à moins de 60 m (RMS, en plan) d'une d'elles est refaite (sauf la sienne : la même graine régénérée rend la même route). */
const OU_FORMES=[];let OU_SEUIL=typeof location!=="undefined"&&/[?&]orbformes=([0-9]+)/.test(location.search)?+location.search.match(/orbformes=([0-9]+)/)[1]:110; /* (banc : `?orbformes=`) */
function orbUForme(ctrl){if(!ctrl||ctrl.length<3)return null;if(OU.ent>0){let i9=1,a9=0;while(i9<ctrl.length-3&&a9<OU.ent){a9+=Math.hypot(ctrl[i9].x-ctrl[i9-1].x,ctrl[i9].z-ctrl[i9-1].z);i9++;}ctrl=ctrl.slice(i9-1);} /* (2026-11-18, L'ENTRÉE TENUE) la forme se compte depuis la fin de l'entrée (OU.ent, m dessinés) : la courbe douce des ~2,6 premières secondes, presque la même pour toutes les routes, la rendait plus proche d'une autre — MESURÉ (palier 20) : 17 % d'essais de plus */const n=ctrl.length,P=ctrl,o=P[0];let k5=1,acc=0;while(k5<n-1&&acc<50){acc+=Math.hypot(P[k5].x-P[k5-1].x,P[k5].z-P[k5-1].z);k5++;}
  const h=Math.atan2(P[k5].x-o.x,P[k5].z-o.z),c=Math.cos(h),sn=Math.sin(h),D=(ORB5.descZ||ORB5.desc),PR=ORB5.prof;let L=0;for(let i=1;i<n;i++)L+=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);
  const out=[];let s9=0,y=0,i=1,nx=0;for(let q=0;q<=12;q++){const cible=q*250;while(i<n&&s9+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z)<cible){const ds=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);s9+=ds;y-=ds*Math.min(.63,D*(PR?orbUProf(PR,s9/Math.max(1,L)):1));i++;}
    const p=P[Math.min(n-1,i)],dx=p.x-o.x,dz=p.z-o.z;out.push(dx*c-dz*sn,y,dx*sn+dz*c);}
  for(let q=0;q<13;q++)if(Math.abs(out[q*3])>20){if(out[q*3]<0)for(let r=0;r<13;r++)out[r*3]=-out[r*3];break;}return out;}
function orbUProche(ctrl,g,seuil){const F=orbUForme(ctrl);if(!F)return false;const t=(seuil||OU_SEUIL)*(seuil||OU_SEUIL)*13;for(const E of OU_FORMES)if(E.g===g){let d=0;for(let q=0;q<39;q++)d+=Math.abs(F[q]-E.F[q]);if(d<1)return false;} /* la route que CETTE graine a déjà gardée : jamais refaite (la même graine régénérée rend la même route) */
  for(const E of OU_FORMES){if(E.g===g)continue;const G=E.F;let d=0;for(let q=0;q<39;q++){if(q%3===1)continue;const e=F[q]-G[q];d+=e*e;if(d>t)break;}if(d<t)return true;}return false;}
function orbUFormeGarde(ctrl,g){const F=orbUForme(ctrl);if(F){for(let q=OU_FORMES.length-1;q>=0;q--)if(OU_FORMES[q].g===g)OU_FORMES.splice(q,1);OU_FORMES.push({g:g,F:F});if(OU_FORMES.length>400)OU_FORMES.shift();}}
function orbUNoms(){const noms=[];for(const m of MODMARK){if(!m.fig)continue;let f=String(m.fig);f=f==='grande-torsade'?'torsade':f==='s-retourne'?'sret':/^(envers-|faille-envers)/.test(f)?'failleEnvers':f.replace(/-(entree|sortie)$/,'');if(noms.indexOf(f)<0)noms.push(f);}return noms;} /* la suite jouée : les modules dans l'ordre (un géant : un nom) */
function orbURefait(g){OU.rejet=(OU.rejet||[]).concat(orbUNoms());return ruRefait('espace',g);} /* refaire la route : ses modules déjà joués pèsent ×0,15 dans la variante (sinon elle retombait souvent sur la même suite) */
function orbUMarque(g,ctrl){const p=orbUPlan(g),noms=orbUNoms();if(ctrl)ruMarque('espace-sig',g,orbUSig(ctrl),null);
  ruMarque('espace',g,noms,{hum:p.hum,voy:p.voy,ouv:p.ouv,sil:p.sil,rel:p.rel,fin:p.fin});}
if(typeof window!=='undefined')window.dbgOrbU=function(){return {on:ORB_RU,der:OU.der,prof:ORB5.prof};};
