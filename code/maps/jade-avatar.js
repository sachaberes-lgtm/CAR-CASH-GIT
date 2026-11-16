/* ===== JADE, LES VERBES (2026-11-16, Sacha : « refonte totale de la génération de route et de map. C'est tout le temps la même chose : il faut que chaque partie
   soit une expérience unique qui fasse vivre et voyager le joueur, sans que ça nuise trop à l'optimisation déjà faite pour iOS. Je t'ai mis des maquettes de
   modules, tu dois en faire d'autres. Inspiration Avatar 1 : que la route interagisse bien avec le décor » — passation/JADE-INSPIRATION-AVATAR-1.md) =====
   Chaque module dit CE QUE LA ROUTE FAIT À LA MONTAGNE (un verbe), et une vallée est une suite de verbes différents :
     POSÉE      · gue (LE GUÉ DU CIEL : trois ou quatre îlots en escalier, la route se pose sur chacun — palier, crête, palier)
                · ange (LE FLEUVE QUI TOMBE, un RACCOURCI : un plateau, sa rivière le long de la route, la lèvre au bord du vide ; la rivière tombe en cascade,
                  la route plonge avec elle, tourne autour d'une grappe d'îles et revient se poser sous la lèvre — qui saute du bord file droit)
     SUSPENDUE  · pont (LE PONT DE LIANES : d'un pic à l'autre, la dalle se creuse au milieu, pendue par des lianes à une île qui flotte au-dessus)
     PERCÉE     · gouffre (LE GOUFFRE PERCÉ, un climax : une couronne de pics ; on passe le rebord, on plonge à 52-56° dans le trou à côté d'une cascade, on ressort dessous)
     TAILLÉE    · galerie (LA GALERIE : la dalle couchée à 50-58° contre une paroi de pics, un toit d'îles renversées au-dessus, des colonnes côté vide)
     ENROULÉE   · ceinture (LA CEINTURE, un RACCOURCI : le tour d'un pic géant, un îlot dehors, un îlot dedans)
     VIVANTE    · pierres (LES PIERRES QUI PASSENT, un ENVERS : un S couché sous des rochers qui dérivent en travers — le décor bouge —, on en sort la tête en bas)
     et TROIS NOUVEAUX :
     GRAVIE     · belvedere (LE BELVÉDÈRE, un climax : on MONTE en tournant entre des pics, on se pose sur un sommet plat — trois îles en carte postale —, on pique)
     ARROSÉE    · escalier (L'ESCALIER DES CASCADES : deux ou trois virages alternés, chacun sous la cascade d'une île, une vasque plus bas)
     TRESSÉE    · mouton (LE SAUTE-MOUTON : on passe SOUS une île renversée, on remonte se poser SUR la suivante, deux fois)
   Les scènes de la descente Alléluia restent au catalogue (les raccourcis spirale, colimaçon, puits, stade ; les envers couloir et envers ; le balcon ; les autres
   en remplissage) : c'est la même tortue, le même juge, la même boussole (jade-alleluia.js, jadeAGen) — ce fichier n'y ajoute que des scènes et LE PAQUET.
   LE PAQUET (jadeAvPaquet) : une ouverture (elle tourne sur cinq graines), un raccourci, l'envers, le climax (il tourne sur trois, décalé), l'autre raccourci,
   puis du remplissage s'il reste de la place ; un des deux raccourcis est toujours un neuf (ange ou ceinture) ; jamais deux verbes pareils de suite.
   LE DÉCOR QUI TOUCHE LA ROUTE : `av` sur un décor de scène — anc:'haut' (une île SOUS la dalle : son sommet à 2,6 m sous le point le plus bas de la dalle
   au-dessus d'elle, la route est posée), anc:'bas' (o.y est son ventre : un toit), plat (un sommet plat), m (la marge de la garde), lia (les lianes d'un pont) ;
   jadeAvAncre (appelée par jadeDeco3Pose) ; jadeAvPose (les cascades libres) ; jadeAvBatit (lianes : UN maillage ; rivières : UN maillage ; pierres : UNE
   famille d'instances, sans collision, déplacée par jadeAvTick) — trois appels de dessin au plus, et sur ALLEGE une liane sur deux et un seul plan par liane.
   `?jade=avatar` : ALLUME tout (Jade publiée est validée : rien ne change sans le drapeau). `?jscene=gue,pont` impose les premières scènes, comme avant. */
const JADE_AV=typeof location!=='undefined'&&/[?&]jade=avatar(&|$)/.test(location.search);
const JAV_CLES=['gue','pont','gouffre','galerie','belvedere','escalier','mouton','pierres','ange','ceinture'];
if(JADE_AV)for(const c of JAV_CLES)if(JA_CLES.indexOf(c)<0)JA_CLES.push(c);
const JAV_VERBE={gue:'posee',ange:'posee',pont:'suspendue',gouffre:'percee',galerie:'taillee',ceinture:'enroulee',spirale:'enroulee',stade:'enroulee',colimacon:'enroulee',puits:'enroulee',
  pierres:'vivante',belvedere:'gravie',escalier:'arrosee',cascade:'arrosee',mouton:'tressee',balcon:'contemplee',couloir:'renversee',envers:'renversee',mur:'couchee',
  plongee:'plongee',ilots:'slalomee',chas:'enfilee',tours:'contournee',russes:'ballottee',voute:'couverte'};
/* LE PAQUET d'une vallée — g : la graine ; rendu : {file (dans l'ordre, climax compris), apres (le 2e raccourci), plus (le remplissage), climax} */
function jadeAvPaquet(g,ouverture){g=g>>>0;const h=mulberry32((Math.imul(g,0x9E3779B1)^0xA7A7A12)>>>0);
  const A5=['gue','pont','mouton','escalier','galerie'],C3=['gouffre','belvedere','balcon'],E3=['pierres','couloir','envers'],RN=['ange','ceinture'],RV=['spirale','colimacon','puits','stade'];
  const mel=function(A){for(let i=A.length-1;i>0;i--){const j=(h()*(i+1))|0,x=A[i];A[i]=A[j];A[j]=x;}return A;};
  let A=A5[g%5];const clx=C3[(g+2*((g/5)|0))%3],env=h()<.5?'pierres':E3[1+((h()*2)|0)]; /* l'ouverture tourne sur 5 graines, le climax sur 3 (décalé à chaque tour) ; l'envers : une fois sur deux les pierres */
  const neuf=RN[(g+((g/2)|0))%2],autre=h()<.4?RN[1-RN.indexOf(neuf)]:RV[(h()*RV.length)|0];let racs=h()<.5?[neuf,autre]:[autre,neuf];
  const V=JAV_VERBE,mal=function(){const s=(ouverture?[A]:[]).concat([racs[0],env,clx,racs[1]]);for(let i=1;i<s.length;i++)if(V[s[i]]===V[s[i-1]])return true;return false;};
  if(mal())racs=[racs[1],racs[0]];
  for(let e=0;e<5&&mal();e++)A=A5[(A5.indexOf(A)+1)%5];
  const plus=mel(A5.filter(function(c){return c!==A;})).concat(mel(['tours','voute','ilots','chas','russes','plongee']));
  return {file:(ouverture?[A]:[]).concat([racs[0],env,clx]),apres:racs[1],plus:plus,climax:clx};}
/* LES SCÈNES — S9 : le catalogue de jadeAGen ; X : sa tortue et ses outils (va, arcP, crete, dec, pic, cote…) */
function jadeAvScenes(S9,X){
  const r=X.r,rd=X.rd,PI=X.PI,vT=X.vT,vP=X.vP,rP=X.rP,RH=X.RH,C=X.C,P=X.P,va=X.va,arcP=X.arcP,crete=X.crete,centre=X.centre,surArc=X.surArc,dec=X.dec,pic=X.pic,cote=X.cote,vers=X.vers,rp=X.rp,k=X.k,Fv=X.Fv;
  /* une île SOUS la dalle (la route est POSÉE dessus) ; une île renversée AU-DESSUS (son ventre plat `clear` m au-dessus de la route : un toit) */
  const sous=function(kk,rr,o){return dec(Object.assign({t:'ile',k:kk,rel:1,s:0,lat:0,dy:0,r:rr,av:{anc:'haut',m:1.5,plat:1}},o||{}));};
  const toit=function(kk,rr,clear,s,lat){return dec({t:'ile',k:kk,rel:1,s:s||0,lat:lat||0,dy:clear,r:rr,inv:1,av:{anc:'bas',m:5,plat:1}});};
  const palier=function(sg,ri,o){const i0=k();va(Math.max(2*ri+16,.3*vT),sg*3*rd,-1.5*rd,{n:2});return sous(i0+1,ri,o);}; /* un palier presque à plat, son îlot dessous */
  /* LE GUÉ DU CIEL (POSÉE) */
  S9.gue=function(){const n=3+(r()<.35?1:0),sg=cote(.9);
    for(let j=0;j<n;j++){va(.45*vT,sg*(4+r()*4)*rd,-1.5*rd);palier(sg,13+r()*12);
      crete(-(26+r()*6)*rd,sg*(22+r()*8)*rd);va(.25*vT,sg*4*rd,X.th());} /* la marche : une crête ronde, on tient la pente */
    va(.4*vT,sg*6*rd,-(20+r()*6)*rd);};
  /* LE PONT DE LIANES (SUSPENDUE) */
  S9.pont=function(){const sg=cote(.6);
    va(.45*vT,sg*5*rd,-1.5*rd);palier(sg,21+r()*13); /* le pic A */
    const i0=k();crete(-(20+r()*6)*rd,sg*(22+r()*6)*rd);va(.3*vT,sg*5*rd,X.th());const iM=k(); /* le pont se creuse… */
    va(.75*vT,sg*(8+r()*6)*rd,(10+r()*4)*rd);va(.45*vT,sg*4*rd,-1.5*rd);const i1=k(); /* …on écrase les amortisseurs, on remonte */
    palier(sg,21+r()*13); /* le pic B */
    dec({t:'ile',k:iM,rel:1,s:-sg,lat:10+r()*30,dy:150+r()*50,r:36+r()*12,casc:1,av:{anc:'bas',m:6,lia:[i0,i1]}}); /* L'ÎLE qui tient le pont, loin au-dessus */
    crete(-(30+r()*8)*rd,-sg*(22+r()*8)*rd);va(.3*vT,-sg*5*rd,X.th());}; /* et on repart dans le vide, de l'autre côté */
  /* LE GOUFFRE PERCÉ (PERCÉE) */
  S9.gouffre=function(){const sg=cote(1.2),thB=-(4+r()*3)*rd,i0=k();
    arcP((2.6+r()*.5)*rP,sg*(40+r()*20)*rd,thB);va(.35*vT,0,thB);const iR=k(),yR=P.y; /* l'approche presque à plat : on voit la couronne */
    const s1=r()<.5?-1:1;crete(-(52+r()*4)*rd,s1*(22+r()*8)*rd);const iC=k();va((1.3+r()*.4)*vT,s1*(26+r()*10)*rd,X.th());const iF=k(); /* le rebord, puis la plongée dans le trou */
    va(.9*vT,s1*12*rd,-(16+r()*4)*rd);const i1=k();X.ZC.push([i0,i1]);
    const iE=Math.round(iR+(iC-iR)*.6),a=C[iE],b=C[iF],cx=(a.x+b.x)/2,cz=(a.z+b.z)/2,Rc=Math.hypot(b.x-a.x,b.z-a.z)/2+RH+24,n=10+((r()*3)|0),a0=r()*6.2832,grands=[(r()*n)|0,(r()*n)|0,(r()*n)|0];
    for(let j=0;j<n;j++){const an=a0+j*6.2832/n+(r()-.5)*.2,x=cx+Math.sin(an)*Rc,z=cz+Math.cos(an)*Rc,ri=22+r()*9;
      let bd=1e9,bi=-1;for(let i=i0;i<=i1;i++){const d=Math.hypot(C[i].x-x,C[i].z-z);if(d<bd){bd=d;bi=i;}}
      const pres=bd<ri+RH+14,haut=pres&&C[bi].y>yR-90,gr=grands.indexOf(j)>=0;
      if(haut)dec({t:'tour',x:x,z:z,r:ri,top:C[bi].y-9,foot:C[bi].y-9-(170+r()*150),k:iR}); /* côté ENTRÉE : la route passe au-dessus du rebord */
      else if(pres)dec({t:'ile',x:x,z:z,y:yR-10,r:ri,k:iR,av:{m:8}}); /* côté SORTIE : une pointe courte, la route ressort loin dessous */
      else dec({t:'tour',x:x,z:z,r:gr?ri+8:ri,top:yR+(gr?70+r()*80:8+r()*34),foot:yR-(200+r()*160),k:iR});} /* la couronne, ses trois grands piliers */
    {const an=Math.atan2(b.x-a.x,b.z-a.z)+s1*(1.2+r()*.6),x=cx+Math.sin(an)*(Rc+18),z=cz+Math.cos(an)*(Rc+18),l=Math.hypot(cx-x,cz-z)||1;
      dec({t:'ile',x:x,z:z,y:yR+18,r:34,k:iR,cascDir:[(cx-x)/l,(cz-z)/l],av:{plat:1}});}}; /* LA CASCADE qui tombe dans le trou */
  /* LA GALERIE (TAILLÉE) */
  S9.galerie=function(){const a=(125+r()*35)*rd,Rp=Math.max((2.3+r()*.2)*rP,5.2*vT/a),sg=cote(a),thM=-(15+r()*4)*rd,bk=(50+r()*8)*rd,cb=Math.cos(bk),sb=Math.sin(bk);
    va(.45*vT,0,thM);const c=centre(Rp,sg),i0=k(),f0=X.phi(),fr=Math.min(.45,2.4*vT/(Rp*a));
    arcP(Rp,sg*a,thM,{dro:2*bk,ro:function(u){return -sg*bk*Math.min(rp(u/fr),rp((1-u)/fr));}});const i1=k(); /* la dalle se couche contre la paroi en ~2,4 s, se relève de même */
    const nW=Math.max(5,Math.min(10,Math.round(Rp*a/75)));
    for(let j=1;j<=nW;j++){const al=a*j/(nW+1),ri=17+r()*6,q=surArc(c,f0,sg,al,Rp-RH*cb-6-ri),ii=Math.round(i0+(i1-i0)*j/(nW+1));
      dec({t:'tour',x:q.x,z:q.z,r:ri,top:C[ii].y+110+r()*120,foot:C[ii].y-120,k:ii,clr:RH*cb+5});} /* LA PAROI : des pics contre le bord bas de la dalle */
    const nT=Math.max(3,Math.min(6,Math.round(Rp*a/130)));
    for(let j=0;j<nT;j++){const u=fr*.6+(1-fr*1.2)*(j+.5)/nT,ii=Math.round(i0+(i1-i0)*u),al=a*u;
      toit(ii,15+r()*8,RH*sb+10+r()*4); /* LE TOIT : le ventre plat d'une île renversée */
      const q=surArc(c,f0,sg,al+.06,Rp+RH*cb+5+16.5);dec({t:'tour',x:q.x,z:q.z,r:16.5,top:C[ii].y+RH*sb+34+r()*20,foot:C[ii].y-140,k:ii,clr:RH*cb+5});}}; /* LES COLONNES côté vide : une fenêtre entre chaque */
  /* LE BELVÉDÈRE (GRAVIE) */
  S9.belvedere=function(){const a=(150+r()*40)*rd,sg=cote(a),Rp=Math.max((2+r()*.3)*rP,3.4*vT/a),thU=(8+r()*3)*rd,i0=k();
    va(.5*vT,sg*6*rd,-4*rd);const c=centre(Rp,sg),y0=P.y,iA=k();arcP(Rp,sg*a,thU);const iH=k(); /* on MONTE en tournant */
    dec({t:'tour',x:c.x,z:c.z,r:Math.min(56,Rp-RH-9),top:P.y+30+r()*60,foot:y0-160,k:iA});
    for(let j=0;j<4;j++){const ii=Math.round(iA+(iH-iA)*(.14+.24*j));pic(ii,sg,13+r()*8,60+r()*90,5+r()*3);} /* entre les pics, au creux du virage */
    va(.35*vT,sg*4*rd,-1*rd);const iS=k(),rM=40+r()*10,pS=P.clone(),fS=X.phi();va(Math.max(2*rM+10,.75*vT),sg*5*rd,-1*rd,{n:2});sous(iS+1,rM,{casc:2}); /* LE SOMMET : un plateau, ses cascades */
    X.ZC.push([i0,k()]);
    for(const t9 of [[-.5,260+r()*60,-(20+r()*30),13+r()*4,0],[.1,480+r()*90,-(120+r()*60),26+r()*6,0],[.6,800+r()*160,-(60+r()*80),70+r()*18,1]]){const an=fS+sg*t9[0];
      dec({t:'ile',x:pS.x+Math.sin(an)*t9[1],z:pS.z+Math.cos(an)*t9[1],y:pS.y+t9[2],r:t9[3],massif:t9[4],casc:t9[4]?2:1,k:iS,dR:t9[1]});} /* LA CARTE POSTALE : trois îles, de la petite au massif */
    crete(-(49+r()*4)*rd,sg*18*rd);va((1.2+r()*.3)*vT,sg*(24+r()*12)*rd,X.th());va(.7*vT,sg*10*rd,-(26+r()*4)*rd);}; /* et on PIQUE du sommet */
  /* L'ESCALIER DES CASCADES (ARROSÉE) */
  S9.escalier=function(){const n=2+(r()<.5?1:0),thC=-(27+r()*5)*rd;let sg=cote(0);
    for(let j=0;j<n;j++){const v9=vers(),a=(55+r()*25)*rd*(v9===0?1:v9===sg?1.25:.75),Rp=(2.2+r()*.4)*rP;va(.3*vT,0,thC);const iA=k();arcP(Rp,sg*a,thC);const iM=Math.round((iA+k())/2),ri=22+r()*9;
      dec({t:'ile',k:iM,rel:1,s:-sg,lat:ri*.55,dy:40+ri*.95+r()*20,r:ri,cascRoute:sg}); /* l'île au-dessus du virage : sa cascade tombe en travers de la route */
      dec({t:'ile',k:iM,rel:1,s:sg,lat:RH+50+r()*60,dy:-(50+r()*50),r:21+r()*10,casc:1});sg=-sg;}}; /* LA VASQUE, plus bas, au creux : la marche suivante */
  /* LE SAUTE-MOUTON (TRESSÉE) */
  S9.mouton=function(){const sg=cote(.8);
    for(let j=0;j<2;j++){crete(-(24+r()*5)*rd,sg*(22+r()*6)*rd);va(.3*vT,sg*4*rd,X.th());toit(k(),16+r()*8,15+r()*4); /* DESSOUS */
      va(.7*vT,sg*(6+r()*5)*rd,(7+r()*4)*rd);va(.45*vT,sg*4*rd,-1.5*rd);palier(sg,14+r()*10);} /* DESSUS */
    va(.4*vT,sg*5*rd,-(20+r()*6)*rd);};
  /* LES PIERRES QUI PASSENT (VIVANTE) — l'envers de la vallée */
  S9.pierres=function(){const sg=r()<.5?-1:1,thE=-(22+r()*6)*rd,d=JADE_A.demi,c1=cote(.6),a1=(30+r()*14)*rd,iA=k();
    va(.5*vT,(r()-.5)*10*rd,thE);
    va(d*vT/2,c1*a1,thE,{dro:PI/2,ro:function(u){return sg*PI*rp(u/2);}});const iM=k(); /* LE S COUCHÉ : deux virages contraires pendant le demi-tonneau (5 s) */
    va(d*vT/2,-c1*a1*.8,thE,{dro:PI/2,ro:function(u){return sg*PI*rp(.5+u/2);}});const i0=k();
    {const n=6+((r()*3)|0);for(let j=0;j<n;j++){const ii=Math.round(iA+(iM-iA)*(j+.5)/n);
      dec({t:'pierre',k:ii,h:36+r()*26,amp:55+r()*60,v:(7+r()*8)*(r()<.5?-1:1),ph:r()*6.2832,rot:(.1+r()*.25)*(r()<.5?-1:1),roc:r()});}} /* les rochers dérivent en travers, au-dessus de la tête */
    const a=(75+r()*35)*rd*cote(1);va((1.1+r()*.3)*vT,a,thE,{ro:function(){return sg*PI;}});const i1=k(); /* la tête en bas, dans un virage */
    for(let j=0;j<3;j++){const ii=Math.round(i0+(i1-i0)*(.18+.3*j));dec({t:'pic',k:ii,dessus:1,inv:1,r:18+r()*14,clear:45+r()*30,gap:8});
      dec({t:'ile',k:ii,rel:1,s:j%2?1:-1,lat:RH+30+r()*80,dy:-(60+r()*90),r:12+r()*16});}
    va(d*vT,(35+r()*15)*rd*cote(1),-26*rd,{dro:PI,ro:function(u){return sg*PI*(1-rp(u));}});}; /* on se remet à l'endroit */
  /* LES DEUX RACCOURCIS NEUFS (la lèvre, la chute, la boucle et la sortie-tremplin sont celles de jadeAGen : le même vol, jugé pareil) */
  const rac=function(forme){const sg=r()<.5?-1:1,thS=-(4.5+r()*1)*rd;let iPl=-1;
    if(forme==='ange'){va(.45*vT,(r()-.5)*10*rd,-1.2*rd);iPl=k();va(1.15*vT,(r()-.5)*8*rd,-1.2*rd,{n:3});} /* LE PLATEAU : un vrai moment à plat, le long de la rivière */
    va(.6*vP,(r()-.5)*14*rd,-2*rd);va(.45*vP,0,-2*rd);const iL=k(),pL=P.clone(),fL=X.phi(); /* LA LÈVRE */
    if(forme==='ange'){const F=Fv(fL),rM=47,a1={anc:'haut',m:1.5,plat:1},a2={anc:'haut',m:1.5,plat:1},p2=pL.clone().addScaledVector(F,-.82*rM),p1=C[iPl+2];
      dec({t:'ile',x:p2.x,z:p2.z,y:pL.y,r:rM,k:iL,av:a2});dec({t:'ile',x:p1.x,z:p1.z,y:p1.y,r:rM,k:iL,av:a1}); /* deux mésas bout à bout : la lèvre est au bord de la seconde */
      dec({t:'riv',k:iL,a:C[iPl].clone(),b:pL.clone().addScaledVector(F,.12*rM),cote:sg,off:RH+7,w:9,mesas:[a1,a2],F:[F.x,F.z],lg:300+r()*160});} /* LA RIVIÈRE, du côté de la boucle : elle tombe du bord */
    va(.5*vP,sg*10*rd,-30*rd);va(.45*vP,sg*8*rd,thS); /* LA CHUTE SOUS LA LÈVRE, la ressource */
    const Rp=(1.85+r()*.2)*rP,c=centre(Rp,sg),iA=k();arcP(Rp,sg*(2*PI-18*rd),thS);const iB=k(),yb=P.y;
    if(forme==='ceinture'){dec({t:'tour',x:c.x,z:c.z,r:Math.min(56,Rp-RH-36),top:pL.y+90+r()*110,foot:yb-80,k:iL}); /* LE PIC GÉANT */
      for(let j=0;j<8;j++){const ii=Math.round(iA+(iB-iA)*(j+.5)/8),r1=8+r()*4;dec({t:'ile',k:ii,rel:1,s:j%2?sg:-sg,lat:RH+5+r1*1.45+r()*3,dy:-3+r()*13,r:r1,bord:1});}} /* L'ANNEAU : un îlot dehors, un îlot dedans */
    else for(let j=0;j<3;j++){const an=fL+j*2.094+r(),q=c.clone().add(new THREE.Vector3(Math.sin(an),0,Math.cos(an)).multiplyScalar(Rp*(.12+.2*r())));
      dec({t:'ile',x:q.x,z:q.z,y:pL.y-18-(pL.y-yb)*j*.45,r:13+r()*14,k:iL,casc:j===1?1:0});} /* LA GRAPPE D'ÎLES au cœur de la boucle, étagée */
    {const Sl=X.Sv(fL),e=(P.x-pL.x)*Sl.x+(P.z-pL.z)*Sl.z,dh=X.ang(X.phi()-fL),Lc=.55*vP,psi=Math.max(-.35,Math.min(.35,-e/Lc-dh/2));
      va(Lc,psi,(14+r()*3)*rd);va(Lc,-psi,X.th());const dh2=X.ang(X.phi()-fL);va((2.1+r()*.2)*vP,-dh2,X.th());va((1+r()*.2)*vP,0,(r()*3-1)*rd);} /* LA SORTIE-TREMPLIN, le replat */
    if(forme==='ange')sous(k()-1,22+r()*7); /* on se pose sur une île */
    X.RAC.push({iL:iL,sc:X.sc()});};
  S9.ange=function(){rac('ange');};S9.ceinture=function(){rac('ceinture');};}
/* ---- après la génération : les décors à part (pierres, rivières) et les repères des lianes passent dans le monde ---- */
function jadeAvApplique(b){const C=b.ctrl,A={pierres:[],riv:[],pm:null,n:{}};
  const tan=function(i){const a=C[Math.max(0,i-1)],c=C[Math.min(C.length-1,i+1)],tx=c.x-a.x,tz=c.z-a.z,l=Math.hypot(tx,tz)||1;return [tx/l,tz/l];};
  for(const o of b.D){
    if(o.av&&o.av.lia&&typeof o.av.lia[0]==='number')o.av.lia=[C[o.av.lia[0]].clone(),C[o.av.lia[1]].clone()];
    if(o.t==='pierre'){const p=C[o.k],t=tan(o.k);A.pierres.push({x:p.x,y:p.y+o.h,z:p.z,dx:t[1],dz:-t[0],amp:o.amp,v:o.v,ph:o.ph,rot:o.rot,roc:o.roc});}
    else if(o.t==='riv')A.riv.push(o);}
  return A;}
/* ---- L'ANCRAGE d'une île de scène (jadeDeco3Pose) : rend le y de son sommet ---- */
function jadeAvAncre(o,X,cx,cz,rm,Hs,yt){const a=o.av;
  if(a.anc==='bas')return Math.ceil((o.y+Hs)/VX)*VX;
  if(a.anc==='haut'){let lo=1e9;
    X.proches(cx,cz,rm+ROAD_HALF+4,function(i){const p=pts[i];if(Math.abs(p.y-o.y)>40)return; /* ce passage-ci de la route, pas un autre plus bas */
      const b=B[i];if(Math.hypot(p.x-cx,p.z-cz)>rm+ROAD_HALF*Math.hypot(b.x,b.z)+2)return;const y=p.y-Math.abs(b.y)*ROAD_HALF;if(y<lo)lo=y;});
    return Math.floor(((lo<1e9?lo:o.y)-2.6)/VX)*VX;}
  return yt;}
/* ---- après la pose des îles : les cascades libres (la rivière qui tombe du bord de sa mésa) ---- */
function jadeAvPose(X){const A=JADE.av;if(!A)return;A.n.rivieres=0;
  for(const R of A.riv){const q=R.mesas[1].q||R.mesas[0].q;if(!q)continue;const s9=R.cote,ox=R.F[1]*s9*R.off,oz=-R.F[0]*s9*R.off;
    X.CASC.push([R.b.x+ox,q[4]-1.2,R.b.z+oz,R.F[0],R.F[1],R.w*1.5,Math.min(ALLEGE?420:900,R.lg),X.jr()]);A.n.rivieres++;}}
/* ---- LES MAILLAGES (jadeBatit) : lianes, rivières, pierres ---- */
function jadeAvBatit(root,G,M9,FC){const A=JADE.av;if(!A)return;const t0=performance.now();
  const sDe=function(v){let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi;},ds=L/Math.max(1,NP-1);
  /* LES LIANES : du bord de la dalle au ventre de l'île qui tient le pont — un ruban fin (deux plans croisés ; un seul sur ALLEGE), une flèche de 4 % */
  {const Pp=[],I=[],ep=.55,S=6,pas=Math.max(1,Math.round((ALLEGE?34:17)/ds));let nl=0;
    const ruban=function(a,b,ux,uz){const b0=Pp.length/3,l=a.distanceTo(b);for(let j=0;j<=S;j++){const t=j/S,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t-l*.04*4*t*(1-t),z=a.z+(b.z-a.z)*t;Pp.push(x-ux*ep,y,z-uz*ep,x+ux*ep,y,z+uz*ep);}
      for(let j=0;j<S;j++){const q=b0+j*2;I.push(q,q+1,q+2,q+1,q+3,q+2);}};
    for(const o of JADE.deco3||[]){const a=o.av;if(!a||!a.lia||!a.q)continue;const q=a.q,i0=sDe(a.lia[0]),i1=sDe(a.lia[1]),A3=new THREE.Vector3(),B3=new THREE.Vector3();
      for(let i=i0;i<=i1;i+=pas)for(const sd of [-1,1]){A3.copy(pts[i]).addScaledVector(B[i],sd*(ROAD_HALF-.8));
        const dx=A3.x-q[0],dz=A3.z-q[1],dl=Math.hypot(dx,dz)||1,e=Math.min(dl*.3,q[2]*.25);B3.set(q[0]+dx/dl*e,q[3]+(q[4]-q[3])*.3,q[1]+dz/dl*e);
        ruban(A3,B3,T[i].x,T[i].z);if(!ALLEGE)ruban(A3,B3,B[i].x,B[i].z);nl++;}}
    if(nl){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setIndex(I);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);
      const m=new THREE.Mesh(g,JAV_MAT.liane());m.userData.jeter=true;m.frustumCulled=false;m.matrixAutoUpdate=false;root.add(m);}
    A.n.lianes=nl;}
  /* LES RIVIÈRES : un ruban d'eau posé sur le dessus des mésas, le long de la route (rien n'est dessiné hors de la roche) */
  {const Pp=[],I=[],pas=Math.max(1,Math.round(8/ds));let nq=0;
    for(const R of A.riv){const M=R.mesas.map(function(a){return a.q;}).filter(Boolean);if(!M.length)continue;const i0=sDe(R.a),i1=sDe(R.b);let av=null;
      for(let i=i0;i<=i1;i+=pas){const p=pts[i],b=B[i],bl=Math.hypot(b.x,b.z)||1,bx=b.x/bl*R.cote,bz=b.z/bl*R.cote,cx=p.x+bx*R.off,cz=p.z+bz*R.off;let y=null;
        for(const q of M)if(Math.hypot(cx-q[0],cz-q[1])<q[2]*.96-R.w*.5&&(y==null||q[4]>y))y=q[4];
        if(y==null){av=null;continue;}const cur=[cx-bx*R.w*.5,y+.3,cz-bz*R.w*.5,cx+bx*R.w*.5,y+.3,cz+bz*R.w*.5];
        if(av){const q0=Pp.length/3;Pp.push(av[0],av[1],av[2],av[3],av[4],av[5],cur[0],cur[1],cur[2],cur[3],cur[4],cur[5]);I.push(q0,q0+1,q0+2,q0+1,q0+3,q0+2);nq++;}av=cur;}}
    if(nq){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setIndex(I);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);
      const m=new THREE.Mesh(g,JAV_MAT.eau());m.userData.jeter=true;m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=5;root.add(m);}
    A.n.eau=nq;}
  /* LES PIERRES QUI PASSENT : une famille d'instances d'UN rocher de la palette (sa géométrie copiée : rien de partagé à libérer), SANS collision, hors du tri de la vallée */
  if(A.pierres.length){const t=FC?FC.roc(A.pierres[0].roc):JADE_NTPL,T9=G.p[t],g0=T9&&T9.geo&&(T9.geo[ALLEGE?1:0]||T9.geo[0]);
    if(g0&&g0.attributes&&g0.attributes.position&&g0.attributes.position.count){const n=A.pierres.length,g=g0.clone(),e=ALLEGE&&T9.geo[1]?2:1;g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);
      const aJ=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);for(let i=0;i<n;i++){aJ.array[i*4]=A.pierres[i].roc;aJ.array[i*4+1]=1;}g.setAttribute('aJ',aJ);
      const im=new THREE.InstancedMesh(g,M9.vrO,n);im.frustumCulled=false;im.matrixAutoUpdate=false;im.userData.jeter=true;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(im);
      A.pm={im:im,e:e,M:T9.M/e,H:T9.yTop/e,sc:VX*e,c:new THREE.Vector3(A.pierres[0].x,A.pierres[0].y,A.pierres[0].z)};jadeAvTick(true);}}
  A.n.pierres=A.pm?A.pierres.length:0;A.n.ms=+(performance.now()-t0).toFixed(1);}
const JAV_MAT={l:null,e:null,
  liane:function(){return this.l||(this.l=new THREE.MeshBasicMaterial({color:0x2f4a2a,side:THREE.DoubleSide,fog:true}));},
  eau:function(){return this.e||(this.e=new THREE.MeshBasicMaterial({color:0x8fdde6,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,fog:true}));}};
const JAV_M4=new THREE.Matrix4(),JAV_M4B=new THREE.Matrix4(),JAV_V3=new THREE.Vector3(),JAV_Q=new THREE.Quaternion(),JAV_E=new THREE.Euler();
/* ---- à chaque image (jadeCascRoute) : les pierres dérivent en travers de la route et tournent lentement ; rien n'est fait à plus de 2,6 km ---- */
function jadeAvTick(force){const A=JADE.av,pm=A&&A.pm;if(!pm||!pm.im.parent)return;
  if(!force&&typeof camera!=='undefined'&&camera.position.distanceToSquared(pm.c)>2600*2600)return;
  const t=JADE_U.uTime.value;
  for(let i=0;i<A.pierres.length;i++){const o=A.pierres[i],d=Math.sin(t*o.v/o.amp+o.ph)*o.amp;
    JAV_E.set(.25*Math.sin(o.ph*3),t*o.rot+o.ph,.2*Math.cos(o.ph*5));JAV_Q.setFromEuler(JAV_E);JAV_V3.set(pm.sc,pm.sc,pm.sc);
    JAV_M4.compose(new THREE.Vector3(o.x+o.dx*d,o.y+3*Math.sin(t*.4+o.ph),o.z+o.dz*d),JAV_Q,JAV_V3);JAV_M4B.makeTranslation(-pm.M,-pm.H/2,-pm.M);JAV_M4.multiply(JAV_M4B);pm.im.setMatrixAt(i,JAV_M4);}
  pm.im.instanceMatrix.needsUpdate=true;}
window.dbgJadeAv=function(){const A=JADE.av;return {on:JADE_AV,n:A?A.n:null,scenes:JADE.a3?JADE.a3.scenes:null,verbes:JADE.a3?JADE.a3.scenes.map(function(c){return JAV_VERBE[c]||c;}):null,
  poses:(JADE.deco3||[]).filter(function(o){return o.av;}).map(function(o){return {r:Math.round(o.r),anc:o.av.anc||'',ok:!!o.av.q,sommet:o.av.q?Math.round(o.av.q[4]):null};}),refus:JADE.n3?JADE.n3.pourquoi:null};};
