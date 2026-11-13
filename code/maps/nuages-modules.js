/* ===== LES MODULES DES NUAGES — LES GRANDS MODULES (2026-11-12, Sacha, après avoir joué les vingt petits : « je suis un peu déçu des modules », puis « oui, plus marqués ») =====
   Le premier jet (même jour : « une vingtaine de PETITS modules qui se combinent ») tirait deux ou trois modules de 2 à 4 s à chaque temps fort : à 300 km/h ils se fondaient en une seule courbe ;
   la plupart tournaient de 35 à 60° (on ne les distinguait pas), la torsade ne couchait la dalle que de 21 à 30°, et leurs nuages, à 13-26 m du bord et de 50 à 100 m, passaient en un éclair.
   Désormais : DIX GRANDS MODULES, UN par temps fort, de 5 à 8 s de croisière, chacun UN geste qu'on reconnaît — et des nuages qu'on voit venir de loin (des tours de 170 à 250 m, des tapis de
   200 à 280 m, posés au bout d'une approche droite). Toujours vers l'avant (aucun virage ne finit à plus de NUA2.capMax° de l'axe de la descente : `cote` et `borne`), toujours à la mesure du
   saut (le relief × kR, voir NUA2.relief), au plus DEUX modules qui couchent la dalle par route (« les routes torsadées donnent envie de vomir, il en faut moins », 11/11).
     LA PORTE DES TITANS (porteTitans) · une longue droite vers deux tours géantes, la dalle s'incline de ~19° pour passer entre elles, un mouton à percer juste après, puis un virage de sortie
     LE TOUR DU GÉANT    (tourGeant)   · un virage de 68-80° autour d'un congestus, la dalle couchée à ~49° (un vélodrome), une falaise de ouate à l'extérieur qu'on voit dès l'approche
     LE SLALOM DES TOURS (slalomTours) · quatre virages alternés de 44-54°, chacun autour d'une tour plantée en son cœur
     LE TUNNEL DE OUATE  (tunnel)      · trois moutons en file sur la route, chacun entre deux nuages : pouf, pouf, pouf — la petite gamme qui monte (voir LE POUF)
     LE RUBAN            (ruban)       · une longue droite où la dalle ondule d'un bord sur l'autre (jusqu'à ~35°) entre de petits nuages
     L'ANNEAU            (anneau)      · une approche qui remonte un peu, puis un plongeon au travers d'un beignet de ouate de 260-340 m (une porte de tours s'il n'y tient pas)
     AU RAS DE LA MER    (rasMer)      · un grand balayage de 58-72° au ras d'un plancher de stratus : leurs sommets juste sous la dalle, d'un côté puis de l'autre
     LA CASCADE          (cascade)     · trois marches : un replat au bord d'un banc, une chute en virage, et un mouton au pied de la dernière
     LE COULOIR          (couloir)     · un balayage entre deux murs de ouate, l'un au-dessus d'un bord, l'autre sous le bord opposé
     LE BALCON           (balcon)      · la route se calme en courbe au-dessus d'un immense tapis de nuages (on voit la descente devant soi), puis plonge vers un mouton
   Et cinq qui JOUENT avec les nuages (même jour, Sacha : « des modules qui interagissent plus avec les nuages, par exemple une route qui fait un virage serré derrière un gros nuage ; utilise
   l'environnement de manière inventive ») :
     LE VIRAGE CACHÉ     (virageCache)  · on fonce droit sur une grande tour de ouate ; la route tourne serré (1,9-2,2 rP, 68-80°) juste avant elle et disparaît DERRIÈRE — la tour est posée
                                          au-delà du cœur du virage (`d0` : son centre recule d'autant), un mouton attend à la sortie
     LE DOUBLE RIDEAU    (doubleCache)  · deux virages serrés opposés, chacun caché derrière sa tour : la route disparaît, reparaît, disparaît
     LA PLONGÉE DANS LA COUCHE (plongeeCouche) · un piqué entre deux paires de grands stratus : on y entre par le haut (leurs sommets à hauteur de dalle) et on en ressort par-dessous
                                          (le gros de la ouate au-dessus de la tête), un mouton au fond
     LE MUR DE OUATE     (murOuate)     · un long virage qui FRÔLE un mur de nuages continu, à l'intérieur, à 8 m du bord de la dalle
     LE CANYON DE OUATE  (canyonOuate)  · un couloir étroit entre deux falaises de nuages, à 6 m de chaque bord, qui tourne doucement
   K : le nécessaire de genCtrl1 — fS(l, dy, n) une droite · fA(a°, R, n, dy) un arc (a > 0 : à gauche) · rf() le hasard des modules · i() l'index du dernier point de contrôle ·
   T (m par seconde de croisière, déjà raccourci sur une route courte : kT) · rP (le rayon tenable) · dev() l'écart du cap à l'axe (°) · kR (la part du relief gardée à cette vitesse).
   `?module=tunnel` : tous les temps forts jouent ce module (banc). `?sans=nuagesv2` : la route d'avant les nuages du 12/11 (filet, puits). */
const NUA_GENRES={cum:['mediocris','humilis'],tour:['congestus','cisaille','champignon'],plat:['stratocumulus','humilis'],petit:['altocumulus','fractus','humilis'],forme:['meduse','gateau','spirale','vague','mediocris']};
const NUA_SEUL=(function(){const m=typeof location!=='undefined'&&/[?&]module=([a-zA-Z]+)/.exec(location.search);return m?m[1]:'';})();
function nuaModules(K){
  const rf=K.rf,fS=K.fS,fA=K.fA,T=K.T,rP=K.rP,G=NUA_GENRES,U=function(a,b){return a+(b-a)*rf();},kR=K.kR==null?1:K.kR;let NU=[]; /* kR : la part du relief gardée à cette vitesse (voir NUA2.relief) */
  const cote=function(a){const d=K.dev();let s=Math.abs(d)>70?(d>0?-1:1):(rf()<.5?1:-1); /* (2026-11-12 soir) 14 → 70° : les modules ne ramenaient plus que vers l'axe, la route filait droit */if(Math.abs(d+s*a)>NUA2.capMax&&Math.abs(d-s*a)<Math.abs(d+s*a))s=-s;return s;}; /* le côté d'un virage de a° : celui qui ramène vers l'axe dès qu'on s'en écarte de 14° */
  const borne=function(s,a){const f=Math.abs(K.dev()+s*a);return f>NUA2.capMax?Math.max(34,a-(f-NUA2.capMax)):a;}; /* l'angle permis : le virage ne finit pas à plus de capMax° de l'axe */
  const nuage=function(t,s,o){NU.push(Object.assign({i:K.i(),t:t,s:s},o||{}));}; /* un nuage du module, là où le dessin en est : t = cote (d'un côté : s = +1 à gauche) | porte (un de chaque côté) | coeur (au centre du virage de rayon R) | anneau | mouton */
  const fin=function(nom,x){const m=Object.assign({fig:'nu-'+nom,nu:NU},x||{});NU=[];return m;};
  const arcN=function(s,a,Rk,p,coeur,dehors){const R=Rk*rP,l=a/57.3*R;fA(s*a*.5,R,0,p*l*.5);if(coeur)nuage('coeur',s,Object.assign({R:R},coeur));if(dehors)nuage('cote',-s,dehors);fA(s*a*.5,R,0,p*l*.5);}; /* un arc en deux moitiés : son nuage au milieu, au cœur du virage (et, parfois, un autre derrière, à l'extérieur) · p : la pente du dessin */
  const sortie=function(a0){const s=cote(a0),a=borne(s,U(a0-6,a0+6)),R=3*rP;fA(s*a,R,0,-.03*a/57.3*R);}; /* un virage de sortie, vers l'axe */
  const M={};
  M.porteTitans=function(){const s=rf()<.5?1:-1,th=U(.3,.36); /* ~17-21° : au-delà, un saut pendant que la dalle revient part de travers (trouvé au banc) */
    fS(1.6*T,-.02*T,2);const i0=K.i();fS(.6*T,-.02*T,2);const i1=K.i(); /* l'approche, droite : les deux tours se voient de loin */
    fS(.4*T,-.02*T);nuage('porte',0,{r:[180,250],e:30,b:.42,g:G.tour});fS(.5*T,-.02*T);const i2=K.i();
    nuage('mouton',0,{r:[26,34]});fS(.6*T,-.02*T,2);const i3=K.i();fS(.6*T,-.02*T,2);sortie(42);fS(.3*T,-.02*T); /* la dalle est revenue à plat AVANT le virage de sortie */
    return fin('porte-titans',{c:[[i0,i1,s*th],[i2,i3,-s*th]],calme:1,couche:1});};
  M.tourGeant=function(){const s=cote(76),a=borne(s,U(68,80)),R=U(3.1,3.5)*rP,l=a/57.3*R,p=-.04;
    fS(.6*T,-.02*T);nuage('cote',-s,{r:[180,240],e:34,b:.5,g:G.tour});fS(.4*T,-.02*T);const ia=K.i();fS(.5*T,-.02*T);const ib=K.i(); /* la falaise, à l'extérieur, dès l'approche */
    fA(s*a*.5,R,0,p*l*.5);nuage('coeur',s,{R:R,r:[110,160],g:G.tour});nuage('cote',-s,{r:[150,210],e:30,b:.5,g:G.tour});fA(s*a*.5,R,0,p*l*.5);
    const ic=K.i();fS(.5*T,-.02*T);const id=K.i();fS(.5*T,-.02*T);
    return fin('tour-geant',{c:[[ia,ib,-s*.85],[ic,id,s*.85]],calme:1,couche:1});};
  M.slalomTours=function(){let s=cote(50);fS(.5*T,-.02*T);
    for(let k=0;k<4;k++){arcN(s,U(44,54),2.5,-.04,{r:[70,100],g:G.tour});if(k<3)fS(.15*T,-.02*T);s=-s;}
    fS(.4*T,-.02*T);return fin('slalom-tours');};
  M.tunnel=function(){const s=cote(28),a=U(24,30),R=7*rP,l=a/57.3*R;fS(.7*T,-.02*T,2);
    for(let k=0;k<3;k++){fA(s*a/6,R,1,-.03*l/6);nuage('mouton',0,{r:[26,34]});nuage('porte',0,{r:[80,110],e:12,b:.5,g:k===1?G.forme:G.cum});fA(s*a/6,R,1,-.03*l/6);fS(.25*T,-.02*T);}
    fS(.5*T,-.02*T);return fin('tunnel');};
  M.ruban=function(){const s=rf()<.5?1:-1,th=U(.55,.62),I=[];fS(.6*T,-.02*T);I.push(K.i());
    for(let k=0;k<4;k++){fS(1.15*T,-.02*T,3);I.push(K.i());if(k<3)nuage('porte',0,{r:[50,70],e:14,b:.5,g:G.petit});}fS(.5*T,-.02*T);
    return fin('ruban',{c:[[I[0],I[1],s*th],[I[1],I[2],-2*s*th],[I[2],I[3],2*s*th],[I[3],I[4],-s*th]],calme:1,couche:1});};
  M.anneau=function(){fS(1.2*T,-.03*T,2);fS(.6*T,.04*kR*T);fS(.7*T,-.18*kR*T,2);nuage('anneau',0,{r:[260,340],e:16,b:.5,g:G.forme});fS(.8*T,-.22*kR*T,2);fS(.6*T,-.03*T);sortie(36);fS(.3*T,-.02*T);return fin('anneau');};
  M.rasMer=function(){const s=cote(66),a=borne(s,U(58,72)),R=5.2*rP,l=a/57.3*R;fS(.5*T,-.02*T);
    for(let k=0;k<4;k++){fA(s*a/4,R,0,-.05*l/4);nuage('cote',k%2?s:-s,{r:[170,240],e:12,b:1.04,g:G.plat});}
    fS(.5*T,-.02*T);return fin('ras-mer');};
  M.cascade=function(){let s=cote(36);fS(.4*T,-.02*T);
    for(let k=0;k<3;k++){fS(.6*T,.22*kR*.6*T,2);nuage('cote',-s,{r:[120,170],e:14,b:1.04,g:G.plat});const a=U(32,40),R=3*rP,l=a/57.3*R;fA(s*a,R,0,-.24*kR*l);if(k===2)nuage('mouton',0,{r:[26,32]});s=-s;}
    fS(.4*T,0);return fin('cascade');};
  M.couloir=function(){const s=rf()<.5?1:-1,s2=cote(36),a=U(30,40),R=6*rP,l=a/57.3*R;fS(.5*T,-.02*T);
    for(let k=0;k<3;k++){fA(s2*a/3,R,2,-.03*l/3);nuage('cote',s,{r:[160,220],e:14,b:-.1,g:G.plat});nuage('cote',-s,{r:[160,220],e:14,b:1.05,g:G.plat});}
    fS(.5*T,-.02*T);return fin('couloir');};
  M.balcon=function(){const s=cote(50),a=borne(s,U(44,56)),R=4.8*rP,l=a/57.3*R;fS(.4*T,.05*kR*T);
    fA(s*a*.5,R,0,.3*kR*l*.5);nuage('cote',-s,{r:[220,290],e:20,b:1.04,g:G.plat});fA(s*a*.5,R,0,.24*kR*l*.5);
    fS(.5*T,0);fS(.9*T,-.24*kR*T,2);nuage('mouton',0,{r:[26,32]});fS(.5*T,-.02*T);return fin('balcon');};
  /* ---- LES MODULES QUI JOUENT AVEC LES NUAGES ---- */
  M.virageCache=function(){const s=cote(76),a=borne(s,U(68,80)),R=U(1.9,2.2)*rP,l=a/57.3*R;
    fS(1.3*T,-.02*T,2); /* l'approche, droite : on fonce sur la tour */
    fA(s*a*.5,R,0,-.04*l*.5);nuage('cote',s,{r:[130,180],e:20,d0:R-20,b:.35,g:G.tour});fA(s*a*.5,R,0,-.04*l*.5); /* la tour AU-DELÀ du cœur : vue de l'approche, la route passe derrière elle */
    fS(.3*T,-.02*T);nuage('mouton',0,{r:[24,30]});fS(.6*T,-.02*T);nuage('cote',-s,{r:[110,150],e:22,b:.5,g:G.cum});fS(.4*T,-.02*T);return fin('virage-cache');};
  M.doubleCache=function(){let s=cote(60);fS(.9*T,-.02*T,2);
    for(let k=0;k<2;k++){const a=borne(s,U(55,65)),R=U(2,2.3)*rP,l=a/57.3*R;fA(s*a*.5,R,0,-.04*l*.5);nuage('cote',s,{r:[110,150],e:20,d0:R-20,b:.35,g:G.tour});fA(s*a*.5,R,0,-.04*l*.5);fS(.35*T,-.02*T);s=-s;}
    fS(.4*T,-.02*T);return fin('double-cache');};
  M.plongeeCouche=function(){fS(.8*T,-.02*T,2);fS(.4*T,.03*kR*T);
    fS(.5*T,-.2*kR*.5*T,2);nuage('porte',0,{r:[200,270],e:18,b:.75,g:G.plat}); /* on entre dans la couche : la dalle passe près de leur sommet */
    fS(.6*T,-.24*kR*.6*T,2);nuage('porte',0,{r:[180,240],e:18,b:.25,g:G.plat}); /* on en ressort par-dessous : le gros de la ouate au-dessus de la tête */
    nuage('mouton',0,{r:[26,32]});fS(.6*T,-.06*T,2);sortie(38);fS(.3*T,-.02*T);return fin('plongee-couche');};
  M.murOuate=function(){const s=cote(64),a=borne(s,U(56,70)),R=3.6*rP,l=a/57.3*R;fS(.5*T,-.02*T);
    for(let k=0;k<6;k++){fA(s*a/6,R,0,-.04*l/6);nuage('cote',s,{r:[100,140],e:8,b:.3,g:k%2?G.plat:G.cum});} /* six nuages serrés, la route au tiers de leur hauteur : un mur qui monte au-dessus de la dalle */
    fS(.5*T,-.02*T);return fin('mur-ouate');};
  M.canyonOuate=function(){const s=cote(30),a=U(24,32),R=6.5*rP,l=a/57.3*R;fS(.6*T,-.02*T);
    for(let k=0;k<4;k++){fA(s*a/4,R,2,-.03*l/4);nuage('porte',0,{r:[130,180],e:6,b:.3,g:k%2?G.tour:G.cum});} /* quatre paires, la route au tiers de leur hauteur : deux falaises */
    fS(.5*T,-.02*T);return fin('canyon-ouate');};
  /* ---- LE TIRAGE : UN grand module par temps fort, dans un paquet mélangé, jamais le même deux fois de suite, au plus deux modules couchés par route ---- */
  const NOMS=Object.keys(M),COUCHE={porteTitans:1,tourGeant:1,ruban:1};let paq=[],der='',nCouche=0;
  const mele=function(t){for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}return t;};
  const tire=function(){if(NUA_SEUL&&M[NUA_SEUL])return NUA_SEUL;for(let e=0;e<24;e++){if(!paq.length)paq=mele(NOMS.slice());const m=paq.shift();if(m===der||(COUCHE[m]&&nCouche>=2))continue;der=m;if(COUCHE[m])nCouche++;return m;}return 'slalomTours';};
  const fort=function(pose){const m=tire();pose(M[m]);return [m];};
  return {M:M,fort:fort,un:fort,noms:NOMS};
}
/* ===== LES NUAGES DES MODULES (2026-11-12, même demande : « il faut qu'on profite des nuages, essaie de travailler l'interaction ») ===== Appelée à la fin de buildCoton : chaque module de la route
   (MODS[k].nu, voir nuaModules) pose ses nuages, des instances du ciel de coton comme les autres — mais AU RAS de la route, là où le plan d'avion (NU_ORD) garde un couloir libre de 95 m :
     cote   · à côté de la route, du côté s (le flanc à `e` m du bord de la dalle ; `d0` m plus loin encore : la tour du virage caché, au-delà de son cœur) ; b = où passe la route dans la hauteur du nuage (0,5 : à mi-hauteur · 1,04 : le sommet juste sous la dalle,
              on le rase · −0,1 : la base au-dessus de la dalle, on passe dessous)
     porte  · un de chaque côté : on passe entre deux nuages
     coeur  · au centre du virage (rayon R) : la route en fait le tour ; sa taille est bornée par le rayon
     anneau · le beignet de ouate, couché à plat, la route plonge au travers (refusé si elle n'y tient pas : une porte à la place)
     mouton · un petit nuage bas posé sur la route (porte, piqué, vagues, marche) : on le perce — voir LE POUF, plus bas
   La garde de la route reste celle de cotonPose (le PROFIL du gabarit contre chaque point du ruban, où qu'il soit : la route qui plonge plus loin compte aussi) avec une marge en plan de `e` m au
   lieu de 113 ; l'anneau, que cette garde refuserait toujours (elle ne connaît pas les trous), a la sienne : chaque lobe contre chaque point (cotonExactTouche). Jamais un nuage SUR la route.
   Hasard `cr` (le flux des nuages : la route ne bouge pas d'un point). `dbgNuaModules()` : les modules de la route en cours, leurs nuages posés et refusés. */
function cotonExactTouche(S,x,y0,z,cap,rx,ry,rz,mh,mv){ /* ce nuage (gabarit S, origine x,y0,z, tourné de cap, échelles rx·ry·rz) mord-il sur la route ? — lobe par lobe (et leurs reflets si le nuage est sans dessus dessous) */
  const c=Math.cos(cap),s=Math.sin(cap),Rb=1.7*Math.max(rx,rz)+mh,st=Math.max(1,Math.round(9/Math.max(.5,L/Math.max(1,NP-1)))),sym=!!COTON.sym,ym=S.base+S.top,rm=Math.max(rx,rz);
  for(let i=0;i<NP;i+=st){const p=pts[i],X=p.x-x,Z=p.z-z;if(X*X+Z*Z>Rb*Rb)continue;const Y=p.y-y0,lx=X*c-Z*s,lz=X*s+Z*c;
    for(const b of S.B){const dx=lx-b[0]*rx,dz=lz-b[2]*rz,a=b[3]*rm+mh,bv=b[3]*(b[4]||1)*ry+mv,dh2=(dx*dx+dz*dz)/(a*a);if(dh2>=1)continue;
      let dy=Y-b[1]*ry;if(dh2+dy*dy/(bv*bv)<1)return true;if(sym){dy=Y-(ym-b[1])*ry;if(dh2+dy*dy/(bv*bv)<1)return true;}}}
  return false;}
const NUA_MOD={poses:0,refus:0,anneaux:0,moutons:0,liste:[]};
function cotonModules(cr,perp){
  NUA_MOD.poses=0;NUA_MOD.refus=0;NUA_MOD.anneaux=0;NUA_MOD.moutons=0;NUA_MOD.liste=[];if(NUA_POUF.dans)NUA_POUF.dans.fill(0);NUA_POUF.pul.length=0; /* le ciel est rebâti : plus aucun rebond en cours (les chiffres des nuages sont neufs) */
  if(!MODS||!(NP>2)||!(L>0)||!nua2On())return 0;
  const k9=(NP-1)/L,H0=COTON.corrH,V0=COTON.corrV;COTON.corrV=0;
  const taille=function(q){return q.r[0]+(q.r[1]-q.r[0])*cr();};
  const aCote=function(i,sd,q,r){ /* sd : +1 = du côté de perp (à droite de la marche) */
    const p=pts[i],pq=perp(i),kk=cotonDe(cr,q.g),S=COTON.S[kk],plat=q.b>1||q.b<0,sy=plat?.72:0,h=(S.top-S.base)*r*(sy||1),e=q.e||18;COTON.corrH=e-18;
    for(let t=0;t<6;t++){const d=ROAD_HALF+e+(q.d0||0)+r*(.7+.2*t); /* d0 : (le virage caché) le nuage recule au-delà du cœur du virage — la garde, elle, garde sa marge `e` */if(cotonPose(p.x+pq[0]*sd*d,p.y-(q.b==null?.5:q.b)*h,p.z+pq[1]*sd*d,r,kk,cr,sy||undefined)){NUA_MOD.poses++;return true;}}
    NUA_MOD.refus++;return false;};
  const auCoeur=function(i,sd,q){const p=pts[i],pq=perp(i),e=22;let r=Math.min(taille(q),((q.R||0)-ROAD_HALF-e)/1.45);COTON.corrH=e-18;
    for(let t=0;t<3&&r>=30;t++,r*=.82){const kk=cotonDe(cr,q.g),S=COTON.S[kk],h=(S.top-S.base)*r;if(cotonPose(p.x+pq[0]*sd*q.R,p.y-.5*h,p.z+pq[1]*sd*q.R,r,kk,cr)){NUA_MOD.poses++;return true;}}
    NUA_MOD.refus++;return false;};
  const anneau=function(i,q){if(COTON.n>=COTON.cap)return false;const p=pts[i],t=T[i],lh=Math.hypot(t.x,t.z)||1,kk=cotonDe(cr,['anneau']),S=COTON.S[kk],sy=.8,sx=1.2,cap=Math.atan2(-t.z/lh,t.x/lh);
    for(let e=0;e<3;e++){const r=q.r[0]+(q.r[1]-q.r[0])*e/2,h=(S.top-S.base)*r*sy,y0=p.y-(S.base+S.top)*.5*r*sy;
      if(cotonExactTouche(S,p.x,y0,p.z,cap,r*sx,r*sy,r,ROAD_HALF+20,18))continue;
      const o=COTON.n*COTON_ST,I=COTON.I;I[o]=p.x;I[o+1]=y0;I[o+2]=p.z;I[o+3]=r;I[o+4]=cap;I[o+5]=kk;I[o+6]=cr()*6.28;I[o+7]=h;I[o+8]=sx;I[o+9]=sy;I[o+10]=I[o+11]=I[o+12]=.96;COTON.n++;NUA_MOD.poses++;NUA_MOD.anneaux++;return true;}
    return false;};
  const mouton=function(i,q){if(!NUA_POUF.on||COTON.n>=COTON.cap)return false; /* un petit nuage posé SUR la route (le seul qui échappe à la garde) : bas (son sommet à ~10 m de la dalle : la caméra voit par-dessus), un peu de côté — on le perce, ou on l'évite */
    const p=pts[i],pq=perp(i),r=taille(q),kk=cotonDe(cr,['humilis','mediocris']),S=COTON.S[kk],sy=.62,lat=(cr()*2-1)*10,h=(S.top-S.base)*r*sy,o=COTON.n*COTON_ST,I=COTON.I;
    I[o]=p.x+pq[0]*lat;I[o+1]=p.y+3-(S.base+S.top)*.5*r*sy;I[o+2]=p.z+pq[1]*lat;I[o+3]=r;I[o+4]=cr()*6.2832;I[o+5]=kk;I[o+6]=cr()*6.28;I[o+7]=h;I[o+8]=1;I[o+9]=sy;I[o+10]=I[o+11]=I[o+12]=.98;COTON.n++;NUA_MOD.poses++;NUA_MOD.moutons++;return true;};
  try{for(const m of MODS){if(!m.nu||!m.nu.length)continue;let np=NUA_MOD.poses;
    for(const q of m.nu){const i=Math.max(1,Math.min(NP-2,Math.round(q.s*k9)));
      if(q.t==='cote')aCote(i,-q.s9,q,taille(q));
      else if(q.t==='coeur')auCoeur(i,-q.s9,q);
      else if(q.t==='porte'){const r=taille(q);aCote(i,1,q,r);aCote(i,-1,q,r*(.85+cr()*.25));}
      else if(q.t==='mouton')mouton(i,q);
      else if(q.t==='anneau'){if(!anneau(i,q)){const q2={r:[90,130],e:16,b:.5,g:q.g},r=taille(q2);aCote(i,1,q2,r);aCote(i,-1,q2,r);}}}
    NUA_MOD.liste.push({fig:m.fig,s:Math.round(m.s0+60),nuages:NUA_MOD.poses-np,voulus:m.nu.length});}}
  finally{COTON.corrH=H0;COTON.corrV=V0;} /* quoi qu'il arrive, la garde du plan d'avion est rendue telle quelle : les poussières et les oiseaux (nuEmbBati) la relisent juste après */
  return NUA_MOD.poses;}
window.dbgNuaModules=function(){return {on:nua2On(),pente:NUA2.desc,poses:NUA_MOD.poses,refus:NUA_MOD.refus,anneaux:NUA_MOD.anneaux,moutons:NUA_MOD.moutons,poufs:NUA_POUF.n,blocs:NUA_POUF.blocs,cubes:NCB.n,leger:nuaPoufLeger(),rebonds:NUA_POUF.pul.length,modules:NUA_MOD.liste};};
/* ===== LE POUF (2026-11-12, Sacha : « travaille aussi une animation et un bruit qui fait pouf quand on traverse un nuage, mais fais ça léger et sans bug », puis « améliore le pouf sans
   surcharger la version iOS ») =====
   Les nuages du ciel de coton (des instances : tout le décor des nuages, ceux des modules compris) ne savaient pas qu'on les traversait — seuls les anciens bancs, coussins et tours (CLOUDS) le
   savaient, et il n'y a plus de banc sur la route des nuages. Désormais, en course aux nuages : quand la caisse entre dans un nuage (au sol dans un MOUTON, en vol dans n'importe lequel)
     · LE NUAGE RÉAGIT : un petit nuage (un mouton, un cumulus de moins de 75 m) se GONFLE et rebondit — il s'élargit et s'aplatit d'un coup (+14 %), revient, se resserre, se pose, en 0,9 s.
       Gratuit : cotonTick recompose déjà la matrice de chaque nuage à chaque image ; on ne fait que moduler son rayon et son étirement (rendus au chiffre près à la fin) ;
     · L'ANNEAU : les cubes ne partent plus en gerbe au hasard mais en ANNEAU, en travers de la marche, qui s'ouvre autour de la caisse et l'accompagne un instant (82 % de sa vitesse) — un
       rond de fumée qu'on vient de percer. Des cubes de 1,5 à 2,2 m qui NE SE CASSENT PAS (leur âge de casse dépasse leur vie) : douze sur l'ordinateur, plus trois qui se cassent une fois
       (24 au plus) ; SEPT sur le téléphone (1,25 à 1,7 m), aucun qui se casse. La première version en lançait dix à seize de 1 à 5 m, qui se cassaient deux fois : jusqu'à ~200 blocs par pouf ;
     · LE VOILE : une bouffée blanche d'un instant, celle des anciens bancs de route (cloudIn : le voile CSS, la brume qui se resserre, le vent feutré) — 0,1 s pleine, éteinte en ~0,4 s ;
       c'est elle qu'on voit vraiment à pleine vitesse (les cubes, eux, filent derrière) ; une opacité et deux réglages de brume : rien à dessiner, le téléphone l'a aussi ;
     · LA TROUÉE : la ouate s'efface là où l'on passe et suit la caisse tant qu'on est dedans (les huit trouées de nuages-casses.js : un uniforme, rien à dessiner de plus) — sur le téléphone,
       sans les blocs du tunnel ;
     · LE BRUIT : `nuage.entre`, le « pouf » feutré de la console de son (déjà chargé), un rien plus présent au sol et dans le cœur du nuage ; des poufs ENCHAÎNÉS (moins de 2,5 s d'écart)
       montent la gamme (do ré mi sol la do) : trois moutons d'affilée font une petite phrase ; `nuage.sort` quand on en ressort ;
     · LA MAIN : le pouf des vibrations (sensNuage), comme pour un banc ; la caméra tressaille à peine (0,08), au sol seulement.
   Sur la route des nuages le pouf REMPLACE l'éclatement du décor de nuages-casses.js (nuCasseDecor : 240 à 300 cubes et une secousse de 0,5 à 0,7, qui partait en plus à chaque mouton).
   Rien ne touche à la caisse (ni frein, ni vol, ni vue bouchée : la ouate s'efface à moins de 40 m de la caméra). Rien de neuf à compiler ni à charger : même lot de blocs, même matière, même
   son. La mesure est exacte (les lobes du gabarit, repliés quand le nuage est sans dessus dessous), faite seulement pour les nuages dont la boîte contient la caisse.
   Le téléphone (ALLEGE ou TEL_NATIF, le vrai téléphone : l’ordinateur garde tout) a la version légère ; `?pouf=0` : ni pouf ni mouton ; `dbgNuaModules()` : poufs, blocs du dernier pouf, version légère ou non. */
const NUA_POUF={on:typeof location==='undefined'||!/[?&]pouf=0\b/.test(location.search),dans:null,t:-1e9,tt:-1e9,tv:-1e9,kv:0,n:0,ch:0,blocs:0,pul:[],leger:null,GAMME:[0,2,4,7,9,12]};
function nuaPoufLeger(){if(NUA_POUF.leger==null)NUA_POUF.leger=!!(ALLEGE||TEL_NATIF);return NUA_POUF.leger;}
function nuaPoufAnim(cp,r,k){ /* l'anneau de cubes et la trouée */
  if(!NCB.mesh)return;const lg=nuaPoufLeger(),R=Math.min(24,Math.max(9,r*.3)),cv=NCB.cv,v=Math.hypot(cv.x,cv.y,cv.z),n0=NCB.n;
  let tx=0,ty=0,tz=1;if(v>1){tx=cv.x/v;ty=cv.y/v;tz=cv.z/v;}
  let ax=-tz,az=tx;{const l=Math.hypot(ax,az);if(l<1e-3){ax=1;az=0;}else{ax/=l;az/=l;}} /* deux axes en travers de la marche : a (horizontal) et b = t × a */
  const bx=ty*az,by=tz*ax-tx*az,bz=-ty*ax;
  nuCasseTrouee(cp.x,cp.y,cp.z,R);
  const n=lg?7:12,kv=Math.min(1,v/90),ph=Math.random()*6.283;
  for(let q=0;q<n;q++){const a=ph+q/n*6.283+(Math.random()-.5)*.3,c=Math.cos(a),s=Math.sin(a),ux=ax*c+bx*s,uy=by*s,uz=az*c+bz*s,sp=(13+9*k+Math.random()*6)*(.7+.5*kv),d0=R*.3;
    nuCubeNew(cp.x+ux*d0,cp.y+uy*d0+1.2,cp.z+uz*d0,ux*sp+cv.x*.93,uy*sp+cv.y*.93+2,uz*sp+cv.z*.93,(lg?1.25:1.5)+Math.random()*(lg?.45:.7),1.2+Math.random()*.6,9,.94+Math.random()*.06);} /* 9 : l'âge où un gros bloc se casse en quatre — plus que sa vie : celui-ci ne se casse jamais, quelle que soit sa taille · ×0,93 : l'anneau accompagne la caisse, il s'ouvre DEVANT la caméra au lieu de lui passer dessus */
  if(!lg)for(let q=0;q<3;q++){const a=Math.random()*6.283,c=Math.cos(a),s=Math.sin(a),ux=ax*c+bx*s,uz=az*c+bz*s,sp=6+Math.random()*8;
    nuCubeNew(cp.x+ux*R*.2,cp.y+1.5,cp.z+uz*R*.2,ux*sp+cv.x*.55,Math.abs(by*s)*sp+cv.y*.55+5,uz*sp+cv.z*.55,1.35+Math.random()*.3,1.6+Math.random()*.6,.25+Math.random()*.25,.95);} /* 1,35-1,65 : se casse UNE fois (ses quatre morceaux restent sous 1,15) */
  NUA_POUF.blocs=NCB.n-n0;}
function nuaPoufPulse(j,t){ /* le nuage j se gonfle et rebondit (au plus quatre à la fois ; un nuage déjà en train de rebondir ne repart pas avant 0,5 s) */
  const P=NUA_POUF.pul,I=COTON.I,o=j*COTON_ST;for(const p of P)if(p.j===j){if(t-p.t0>.5)p.t0=t;return;}
  if(P.length<4)P.push({j:j,t0:t,x:I[o],r:I[o+3],sy:I[o+9]});}
function nuaPoufPulses(t){ /* à chaque image, même hors course : un rebond commencé se finit, et le nuage retrouve SES chiffres */
  const P=NUA_POUF.pul;if(!P.length)return;const I=COTON.I;if(!I){P.length=0;return;}
  for(let q=P.length-1;q>=0;q--){const p=P[q],o=p.j*COTON_ST,u=t-p.t0;
    if(p.j>=COTON.n||I[o]!==p.x){P.splice(q,1);continue;} /* le ciel a été rebâti entre-temps : ce n'est plus le même nuage */
    if(u>.9||u<0){I[o+3]=p.r;I[o+9]=p.sy;P.splice(q,1);continue;}
    const e=Math.exp(-u*5.5)*Math.sin(u*17);I[o+3]=p.r*(1+.2*e);I[o+9]=p.sy*(1-.3*e);}}
function cotonPouf(cp){ /* à chaque image (updateClouds) */
  const t=performance.now()*.001;nuaPoufPulses(t);
  if(!NUA_POUF.on||!COTON.root||!COTON.root.visible||!COTON.n||!COTON.I||!started||gameOver||!nua2On())return;
  if(!NUA_POUF.dans||NUA_POUF.dans.length<COTON.cap)NUA_POUF.dans=new Uint8Array(COTON.cap);
  {const vt=t-NUA_POUF.tv;if(vt>=0&&vt<.5){const v=NUA_POUF.kv*(vt<.1?1:Math.exp(-(vt-.1)*6.5));if(v>cloudIn)cloudIn=v;}} /* LE VOILE : la bouffée blanche des bancs (cloudIn → le voile, la brume qui se resserre, le vent feutré), 0,1 s pleine puis éteinte en ~0,4 s */
  const I=COTON.I,D=NUA_POUF.dans,sym=!!COTON.sym,x=cp.x,y=cp.y,z=cp.z;
  for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,r=I[o+3],sx=I[o+8]||1,dx=x-I[o],dz=z-I[o+2],rb=1.75*r*Math.max(1,sx);let k=0;
    if(dx*dx+dz*dz<rb*rb){const S=COTON.S[I[o+5]|0],ry=r*(I[o+9]||1),Y=y-I[o+1];
      if(S&&Y>S.base*ry-4&&Y<S.top*ry+4){const c=Math.cos(I[o+4]),s=Math.sin(I[o+4]),lx=(dx*c-dz*s)/(r*sx),lz=(dx*s+dz*c)/r,ly=Y/ry,ym=S.base+S.top;
        for(const b of S.B){const ex=lx-b[0],ez=lz-b[2],h2=(ex*ex+ez*ez)/(b[3]*b[3]);if(h2>=1)continue;const fy=b[3]*(b[4]||1);let ey=(ly-b[1])/fy,d2=h2+ey*ey;if(sym){ey=(ly-(ym-b[1]))/fy;d2=Math.min(d2,h2+ey*ey);}if(d2<1){const kk=1-Math.sqrt(d2);if(kk>k)k=kk;}}}}
    if(k>0){if(!D[j]){D[j]=1;if(t-NUA_POUF.t>.3){const sol=mode==='drive';NUA_POUF.ch=t-NUA_POUF.t<2.5?Math.min(NUA_POUF.GAMME.length-1,NUA_POUF.ch+1):0;NUA_POUF.t=t;NUA_POUF.tt=t;NUA_POUF.n++;
          if(NUVIT.vox)nuaPoufAnim(cp,r,k);
          if(r<=75)nuaPoufPulse(j,t);
          NUA_POUF.tv=t;NUA_POUF.kv=Math.min(.8,.45+.35*k);
          try{if(SONV2)sfx('nuage.entre',{vol:(sol?4:1)+Math.min(2,2*k),st:NUA_POUF.GAMME[NUA_POUF.ch]});}catch(e9){}
          try{if(SENS)sensNuage(k,false);}catch(e9){}
          if(sol)try{shake=Math.max(shake,.08);}catch(e9){}}}
      else if(NUVIT.vox&&NCB.mesh&&t-NUA_POUF.tt>.22){NUA_POUF.tt=t;const cv=NCB.cv,Rt=Math.min(16,Math.max(7,r*.12)); /* dedans : la trouée suit la caisse (le tunnel) ; un petit bloc de temps en temps, pas sur le téléphone */
        nuCasseTrouee(cp.x+cv.x*.08,cp.y+cv.y*.08,cp.z+cv.z*.08,Rt);
        if(!nuaPoufLeger()){const a=Math.random()*6.283,sp=5+Math.random()*8;nuCubeNew(cp.x+Math.cos(a)*Rt*.7,cp.y+(Math.random()-.3)*Rt*.5,cp.z+Math.sin(a)*Rt*.7,Math.cos(a)*sp+cv.x*.4,2+Math.random()*3,Math.sin(a)*sp+cv.z*.4,.8+Math.random()*.3,1.2+Math.random()*.6,9,.95);}}}
    else if(D[j]){D[j]=0;if(t-NUA_POUF.t>.25){try{if(SONV2)sfx('nuage.sort');}catch(e9){}}}}}
