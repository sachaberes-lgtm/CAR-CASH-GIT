/* ===== LES MODULES DES NUAGES (2026-11-12, Sacha : « ça manque de modules sur la map nuage : une vingtaine de PETITS modules qui se combinent les uns aux autres sans que ça fasse trop lourd, certains
   en interaction avec les nuages — tu passes entre deux nuages avec une route légèrement torsadée ; une map contemplative, fun, smooth, où l'on profite des nuages ») =====
   Vingt modules de 2 à 5 s de croisière, dessinés à la VRAIE taille (rayons en rP, longueurs en secondes de croisière) et tirés PAR DEUX OU TROIS à chaque temps fort de la phrase (`fort`) : un par
   famille, jamais le même deux fois de suite, chaque famille dans son paquet mélangé. Aucun ne fait demi-tour : le plus grand virage tourne de ~80°, et `cote` choisit le côté qui ramène vers l'axe
   de la descente. La pente de leur dessin MODULE la descente de la route (voir NUAGES_V2 dans route-sans-haut.js : un dessin qui monte de 30 % adoucit la pente d'autant — un balcon ; un dessin
   qui plonge l'accentue — un piqué). Chaque module pose SES nuages (`nu`, lus par cotonModules plus bas) : la route a une raison de tourner, de se coucher, de plonger.
     LES COURBES    lacet (un S doux, un cumulus au cœur de chaque courbe) · slalom (trois virages alternés autour de trois nuages) · epaule (un virage franc autour d'un nuage, une tour derrière)
                    baionnette (on se décale entre deux nuages) · toboggan (un S ample qui plonge) · esses (deux virages alternés, la dalle couchée à 34° — un petit surf)
     LES PORTES     porte (une droite franche entre deux tours) · porteTorse (la même, la dalle se couche d'un bord sur l'autre entre deux portes) · allee (un balayage entre deux rangées de cumulus)
                    couloir (un nuage au-dessus d'un bord, un autre sous l'autre bord) · portes (deux portes décalées, un S entre elles) · anneau (un piqué au travers d'un beignet de ouate)
     (les deux modules couchés, esses et porteTorse, sont tirés avec les torsades : quatre familles de cinq)
     LE RELIEF      balcon (la pente s'adoucit en courbe : on voit la route plonger devant soi) · pique (la pente s'accentue, on rase un banc à l'arrivée) · vagues (deux ou trois ondulations)
                    marche (un replat puis un piqué : qui saute plane longtemps) · cascade (deux marches en virage)
     LES TORSADES   corniche (un long virage couché le long d'une falaise de ouate) · ruban (une droite où la dalle ondule d'un bord sur l'autre) · ras (un grand balayage au ras des nuages)
   K : le nécessaire de genCtrl1 — fS(l, dy, n) une droite · fA(a°, R, n, dy) un arc (a > 0 : à gauche) · rf() le hasard des modules · i() l'index du dernier point de contrôle ·
   T (m par seconde de croisière) · rP (le rayon tenable) · dev() l'écart du cap à l'axe (°). `?module=balcon` : tous les temps forts jouent ce module (banc). */
const NUA_GENRES={cum:['mediocris','humilis'],tour:['congestus','cisaille','champignon'],plat:['stratocumulus','humilis'],petit:['altocumulus','fractus','humilis'],forme:['meduse','gateau','spirale','vague','mediocris']};
const NUA_SEUL=(function(){const m=typeof location!=='undefined'&&/[?&]module=([a-zA-Z]+)/.exec(location.search);return m?m[1]:'';})();
function nuaModules(K){
  const rf=K.rf,fS=K.fS,fA=K.fA,T=K.T,rP=K.rP,G=NUA_GENRES,U=function(a,b){return a+(b-a)*rf();},kR=K.kR==null?1:K.kR;let NU=[]; /* kR : la part du relief gardée à cette vitesse (voir NUA2.relief) */
  const cote=function(a){const d=K.dev();let s=Math.abs(d)>14?(d>0?-1:1):(rf()<.5?1:-1);if(Math.abs(d+s*a)>NUA2.capMax&&Math.abs(d-s*a)<Math.abs(d+s*a))s=-s;return s;}; /* le côté d'un virage de a° : celui qui ramène vers l'axe dès qu'on s'en écarte de 14° */
  const borne=function(s,a){const f=Math.abs(K.dev()+s*a);return f>NUA2.capMax?Math.max(34,a-(f-NUA2.capMax)):a;}; /* l'angle permis : le virage ne finit pas à plus de capMax° de l'axe */
  const nuage=function(t,s,o){NU.push(Object.assign({i:K.i(),t:t,s:s},o||{}));}; /* un nuage du module, là où le dessin en est : t = cote (d'un côté : s = +1 à gauche) | porte (un de chaque côté) | coeur (au centre du virage de rayon R) | anneau */
  const fin=function(nom,x){const m=Object.assign({fig:'nu-'+nom,nu:NU},x||{});NU=[];return m;};
  const arcN=function(s,a,Rk,p,coeur,dehors){const R=Rk*rP,l=a/57.3*R;fA(s*a*.5,R,0,p*l*.5);if(coeur)nuage('coeur',s,Object.assign({R:R},coeur));if(dehors)nuage('cote',-s,dehors);fA(s*a*.5,R,0,p*l*.5);}; /* un arc en deux moitiés : son nuage au milieu, au cœur du virage (et, parfois, un autre derrière, à l'extérieur) · p : la pente du dessin */
  const M={};
  /* ---- LES COURBES ---- */
  M.lacet=function(){const s=cote(50),a=U(42,58),Rk=U(2.6,3.2);fS(.3*T,-.02*T);arcN(s,a,Rk,-.03,{r:[60,95],g:G.cum});fS(.25*T,0);arcN(-s,a*U(.85,1.05),Rk,-.03,{r:[55,90],g:G.forme});fS(.3*T,-.02*T);return fin('lacet');};
  M.slalom=function(){let s=cote(40);fS(.3*T,-.02*T);for(let k=0;k<3;k++){arcN(s,U(36,46),U(2.2,2.6),-.03,{r:[45,70],g:k===1?G.forme:G.cum});s=-s;}fS(.3*T,-.02*T);return fin('slalom');};
  M.epaule=function(){const s=cote(65),a=borne(s,U(55,75));fS(.45*T,-.02*T);arcN(s,a,U(2.1,2.5),-.05,{r:[55,85],g:G.cum},{r:[130,180],e:24,b:.45,g:G.tour});fS(.4*T,-.02*T);return fin('epaule');};
  M.baionnette=function(){const s=cote(35),a=U(33,38),R=3*rP,l=a/57.3*R;fS(.3*T,-.02*T);nuage('cote',-s,{r:[60,90],e:14,b:.5,g:G.cum});fA(s*a,R,0,-.03*l);fS(U(.5,.8)*T,-.02*T);nuage('cote',s,{r:[60,90],e:14,b:.5,g:G.forme});fA(-s*a,R,0,-.03*l);fS(.3*T,-.02*T);return fin('baionnette');};
  M.toboggan=function(){const s=cote(55),a=U(50,60);fS(.3*T,0);arcN(s,a,2.4,-.2*kR,{r:[50,80],g:G.cum});arcN(-s,a,2.4,-.2*kR,{r:[50,80],g:G.forme});fS(.35*T,.02*T);return fin('toboggan');};
  M.esses=function(){const s=cote(54),R=2.3*rP,th=.6,a1=U(48,60),a2=U(48,60),l1=a1/57.3*R,l2=a2/57.3*R;fS(.3*T,-.02*T);const i0=K.i();
    fA(s*a1*.3,R,0,-.04*l1*.3);const i1=K.i();nuage('coeur',s,{R:R,r:[50,80],g:G.cum});fA(s*a1*.4,R,0,-.04*l1*.4);const i2=K.i();fA(s*a1*.3,R,0,-.04*l1*.3);fS(.5*T,-.02*T);
    fA(-s*a2*.3,R,0,-.04*l2*.3);const i3=K.i();nuage('coeur',-s,{R:R,r:[50,80],g:G.forme});fA(-s*a2*.4,R,0,-.04*l2*.4);const i4=K.i();fA(-s*a2*.3,R,0,-.04*l2*.3);const i5=K.i();fS(.3*T,-.02*T);
    return fin('esses',{c:[[i0,i1,-s*th],[i2,i3,2*s*th],[i4,i5,-s*th]],calme:1});}; /* c : la dalle se couche vers l'intérieur de chaque virage (le coucher scripté de pisteTord, voir MODMARK.c) */
  /* ---- LES PORTES ---- */
  M.porte=function(){const l=U(1.5,2.1)*T;fS(.3*T,-.02*T);fS(l*.5,-.02*l);nuage('porte',0,{r:[110,160],e:16,b:.45,g:G.tour});nuage('mouton',0,{r:[24,32]});fS(l*.5,-.02*l);fS(.3*T,-.02*T);return fin('porte');};
  M.porteTorse=function(){const s=rf()<.5?1:-1,th=U(.36,.46);fS(.3*T,-.02*T);const ia=K.i();fS(.7*T,-.02*T,2);const ib=K.i();nuage('porte',0,{r:[100,150],e:16,b:.45,g:G.tour});fS(.9*T,-.02*T,2);const ic=K.i();nuage('porte',0,{r:[60,90],e:16,b:.5,g:G.cum});fS(.7*T,-.02*T,2);const id=K.i();fS(.3*T,-.02*T);
    return fin('porte-torse',{c:[[ia,ib,s*th],[ib,ic,-2*s*th],[ic,id,s*th]],calme:1});}; /* « tu passes entre deux nuages avec une route légèrement torsadée » : ±21 à 26° */
  M.allee=function(){const s=cote(26),a=U(22,28),R=7*rP,l=a/57.3*R;fS(.25*T,-.02*T);for(let k=0;k<3;k++){fA(s*a/3,R,1,-.03*l/3);nuage('porte',0,{r:[50,75],e:20,b:.5,g:k===1?G.forme:G.cum});}fS(.25*T,-.02*T);return fin('allee');};
  M.couloir=function(){const s=rf()<.5?1:-1,l=U(1.7,2.3)*T;fS(.3*T,-.02*T);fS(l*.33,-.02*l);nuage('cote',s,{r:[120,170],e:14,b:-.1,g:G.plat});fS(l*.34,-.02*l);nuage('cote',-s,{r:[120,170],e:14,b:1.05,g:G.plat});fS(l*.33,-.02*l);fS(.3*T,-.02*T);return fin('couloir');};
  M.portes=function(){const s=cote(35),a=U(33,38),R=3*rP,l=a/57.3*R;fS(.25*T,-.02*T);nuage('porte',0,{r:[65,95],e:14,b:.5,g:G.cum});fA(s*a,R,0,-.03*l);fS(.4*T,-.02*T);fA(-s*a,R,0,-.03*l);nuage('porte',0,{r:[65,95],e:14,b:.5,g:G.forme});fS(.25*T,-.02*T);return fin('portes');};
  M.anneau=function(){fS(.4*T,.03*T);fS(.6*T,-.15*kR*T,2);nuage('anneau',0,{r:[230,330],e:16,b:.5,g:G.forme});fS(.7*T,-.2*kR*T,2);fS(.5*T,-.03*T);return fin('anneau');};
  /* ---- LE RELIEF ---- */
  M.balcon=function(){const s=cote(42),a=U(36,50),R=4*rP,l=a/57.3*R;fS(.3*T,.04*T);fA(s*a*.5,R,0,.3*kR*l*.5);nuage('cote',-s,{r:[130,190],e:16,b:1.04,g:G.plat});fA(s*a*.5,R,0,.26*kR*l*.5);fS(.3*T,0);return fin('balcon');};
  M.pique=function(){const l=U(1.4,1.8)*T;fS(.3*T,0);fS(l*.5,-.26*kR*l*.5,2);nuage('mouton',0,{r:[24,32]});fS(l*.5,-.26*kR*l*.5,2);nuage('cote',rf()<.5?1:-1,{r:[150,220],e:16,b:1.04,g:G.plat});fS(.5*T,.03*T);return fin('pique');};
  M.vagues=function(){const n=2+(rf()<.4?1:0);let s=rf()<.5?1:-1;fS(.3*T,-.02*T);for(let k=0;k<n;k++){fS(.55*T,.17*kR*.55*T,2);fS(.65*T,-.2*kR*.65*T,2);nuage('cote',s,{r:[80,120],e:14,b:1.04,g:G.plat});if(!k)nuage('mouton',0,{r:[22,30]});s=-s;}fS(.3*T,-.02*T);return fin('vagues');};
  M.marche=function(){fS(.3*T,-.02*T);fS(.9*T,.26*kR*.9*T,2);nuage('cote',rf()<.5?1:-1,{r:[80,115],e:14,b:1.04,g:G.cum});fS(1.3*T,-.22*kR*1.3*T,3);nuage('mouton',0,{r:[24,32]});fS(.4*T,0);return fin('marche');};
  M.cascade=function(){let s=cote(36);fS(.25*T,-.02*T);for(let k=0;k<2;k++){fS(.6*T,.22*kR*.6*T,2);const a=U(33,38),R=2.8*rP,l=a/57.3*R;nuage('cote',-s,{r:[70,100],e:14,b:1.04,g:G.plat});fA(s*a,R,0,-.2*kR*l);s=-s;}fS(.3*T,0);return fin('cascade');};
  /* ---- LES TORSADES ---- */
  M.corniche=function(){const s=cote(72),a=borne(s,U(60,82)),R=U(3,3.6)*rP,l=a/57.3*R,p=-.05;fS(.35*T,-.02*T);const ia=K.i();
    fA(s*a*.25,R,0,p*l*.25);const ib=K.i();nuage('cote',-s,{r:[150,210],e:24,b:.5,g:G.tour});fA(s*a*.25,R,0,p*l*.25);nuage('coeur',s,{R:R,r:[70,110],g:G.cum});
    fA(s*a*.25,R,0,p*l*.25);const ic=K.i();nuage('cote',-s,{r:[110,150],e:22,b:.5,g:G.tour});fA(s*a*.25,R,0,p*l*.25);const id=K.i();fS(.3*T,-.02*T);
    return fin('corniche',{c:[[ia,ib,-s*.52],[ic,id,s*.52]],calme:1});};
  M.ruban=function(){const s=rf()<.5?1:-1,th=U(.3,.4),I=[];fS(.3*T,-.02*T);I.push(K.i());for(let k=0;k<4;k++){fS(.8*T,-.02*T,2);I.push(K.i());if(k<3)nuage('cote',k%2?s:-s,{r:[40,60],e:13,b:.5,g:G.petit});}fS(.3*T,-.02*T);
    return fin('ruban',{c:[[I[0],I[1],s*th],[I[1],I[2],-2*s*th],[I[2],I[3],2*s*th],[I[3],I[4],-s*th]],calme:1});};
  M.ras=function(){const s=cote(52),a=borne(s,U(45,60)),R=4.5*rP,l=a/57.3*R;fS(.25*T,-.02*T);for(let k=0;k<3;k++){fA(s*a/3,R,0,-.06*l/3);nuage('cote',k===1?s:-s,{r:[110,160],e:14,b:1.04,g:G.plat});}fS(.25*T,-.02*T);return fin('ras');};
  /* ---- LE TIRAGE : deux ou trois modules de familles différentes à chaque temps fort ---- */
  const FAM=[['lacet','slalom','epaule','baionnette','toboggan'],['porte','allee','couloir','portes','anneau'],['balcon','pique','vagues','marche','cascade'],['corniche','ruban','ras','esses','porteTorse']];
  const paq=[[],[],[],[]];let der='';
  const mele=function(t){for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}return t;};
  const tire=function(f){for(let e=0;e<6;e++){if(!paq[f].length)for(const x of mele(FAM[f].slice()))paq[f].push(x);const m=paq[f].shift();if(m!==der){der=m;return m;}}return FAM[f][0];};
  const fort=function(pose){const n=rf()<.6&&!K.court?3:2, /* K.court : une route de moins de 26 s — deux modules, pas trois */o=mele([0,1,2,3]),L9=[];for(let k=0;k<n;k++)L9.push(NUA_SEUL&&M[NUA_SEUL]?NUA_SEUL:tire(o[k]));
    const ib=L9.indexOf('balcon');if(ib>0){L9.splice(ib,1);L9.unshift('balcon');} /* le balcon ouvre le temps fort : on voit la suite plonger devant soi */
    for(const m of L9)pose(M[m]);return L9;};
  let fam=(rf()*4)|0;const un=function(pose){fam=(fam+1+((rf()*3)|0))%4;const m=NUA_SEUL&&M[NUA_SEUL]?NUA_SEUL:tire(fam);pose(M[m]);return m;}; /* un seul module, d'une autre famille que le précédent (la fin de route) */
  return {M:M,fort:fort,un:un,noms:Object.keys(M)};
}
/* ===== LES NUAGES DES MODULES (2026-11-12, même demande : « il faut qu'on profite des nuages, essaie de travailler l'interaction ») ===== Appelée à la fin de buildCoton : chaque module de la route
   (MODS[k].nu, voir nuaModules) pose ses nuages, des instances du ciel de coton comme les autres — mais AU RAS de la route, là où le plan d'avion (NU_ORD) garde un couloir libre de 95 m :
     cote   · à côté de la route, du côté s (le flanc à `e` m du bord de la dalle) ; b = où passe la route dans la hauteur du nuage (0,5 : à mi-hauteur · 1,04 : le sommet juste sous la dalle,
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
    for(let t=0;t<6;t++){const d=ROAD_HALF+e+r*(.7+.2*t);if(cotonPose(p.x+pq[0]*sd*d,p.y-(q.b==null?.5:q.b)*h,p.z+pq[1]*sd*d,r,kk,cr,sy||undefined)){NUA_MOD.poses++;return true;}}
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
