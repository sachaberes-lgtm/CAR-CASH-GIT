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
   PUIS (2026-11-16, Sacha : « toujours les deux mêmes boucles de merde ; il faut que la génération change à chaque map ») : LES GRANDS SAUTS (cirque, passe,
   corniche, lacets, le fleuve : des raccourcis SANS BOUCLE, le vol calculé), LES ITINÉRAIRES (six voyages, sept trames : JAV_ITIN, JAV_TRAMES, jadeAvPaquet),
   trois modules de plus (viaduc, essaim, défilé), la ceinture en demi-tour ; plus aucune boucle de 360° avec le drapeau.
   LE DÉCOR QUI TOUCHE LA ROUTE : `av` sur un décor de scène — anc:'haut' (une île SOUS la dalle : son sommet à 2,6 m sous le point le plus bas de la dalle
   au-dessus d'elle, la route est posée), anc:'bas' (o.y est son ventre : un toit), plat (un sommet plat), m (la marge de la garde), lia (les lianes d'un pont) ;
   jadeAvAncre (appelée par jadeDeco3Pose) ; jadeAvPose (les cascades libres) ; jadeAvBatit (lianes : UN maillage ; rivières : UN maillage ; pierres : UNE
   famille d'instances, sans collision, déplacée par jadeAvTick) — trois appels de dessin au plus, et sur ALLEGE une liane sur deux et un seul plan par liane.
   `?jade=avatar` : ALLUME tout (Jade publiée est validée : rien ne change sans le drapeau). `?jscene=gue,pont` impose les premières scènes, comme avant. */
const JADE_AV=typeof location!=='undefined'&&/[?&]jade=avatar(&|$)/.test(location.search);
const JAV_CLES=['gue','pont','gouffre','galerie','belvedere','escalier','mouton','pierres','ange','ceinture','cirque','passe','corniche','lacets','viaduc','essaim','defile'];
if(JADE_AV)for(const c of JAV_CLES)if(JA_CLES.indexOf(c)<0)JA_CLES.push(c);
const JAV_VERBE={gue:'posee',ange:'posee',pont:'suspendue',gouffre:'percee',galerie:'taillee',ceinture:'enroulee',spirale:'enroulee',stade:'enroulee',colimacon:'enroulee',puits:'enroulee',
  pierres:'vivante',belvedere:'gravie',escalier:'arrosee',cascade:'arrosee',mouton:'tressee',balcon:'contemplee',couloir:'renversee',envers:'renversee',mur:'couchee',
  plongee:'plongee',ilots:'slalomee',chas:'enfilee',tours:'contournee',russes:'ballottee',voute:'couverte',
  cirque:'survolee',passe:'enfilee',corniche:'couchee',lacets:'zigzag',viaduc:'portee',essaim:'traversee',defile:'serree'};
/* ===== LES ITINÉRAIRES (2026-11-16, Sacha : « c'est tout le temps la même génération de route, elle est bien mais il faut qu'elle change à chaque map ; il y a
   toujours les deux mêmes boucles ; invente d'autres modules, que chaque génération de map fasse vivre une expérience et un parcours uniques ») =====
   Une vallée = UN itinéraire (il tourne d'une graine à l'autre : six graines de suite, six voyages) : ses scènes d'ouverture, ses climax, ses envers, SES DEUX
   GRANDS SAUTS (les raccourcis, jamais une boucle), son remplissage, l'allure de ses liaisons (pente, rayon, respirations, durée), son ouverture et le biais de son
   décor (jadeAvDecoBiais) ; puis l'ORDRE des étapes est tiré parmi sept trames (le climax, l'envers et les sauts ne tombent pas toujours au même endroit).
   O : l'ouverture · R : un grand saut · E : l'envers · C : le climax · F : une scène de plus. Sans ouverture (grands paliers : la route raccourcit), ni O ni F.
   ouv : 'calme' (2 s à plat, comme avant) · 'plonge' (1 s, puis on pique à 32-38°) · 'balcon' (un long virage à plat, puis on bascule). */
const JAV_TRAMES=[['O','R','E','C','R'],['O','E','R','C','R'],['R','O','E','C','R'],['O','R','C','E','R'],['O','F','R','E','C','R'],['R','E','O','C','R'],['O','R','E','F','C','R']];
const JAV_ITIN=[
  {nom:'LA VALLÉE DES CASCADES',ouv:['escalier','gue'],clx:['belvedere','balcon'],env:['pierres','envers'],rac:['ange','cirque','corniche'],plus:['cascade','voute','essaim','ilots'],
   lia:{th0:22,thv:8,R0:2.8,Rv:.9,pause:.35,d0:.6,dv:.5},ouv9:'balcon',deco:{casc:{p:.26,n:26},brume:{n:1.5,bas:.7},ray:1.5}},
  {nom:'LES PILIERS DU CIEL',ouv:['viaduc','pont'],clx:['gouffre','belvedere'],env:['couloir','pierres'],rac:['passe','cirque','lacets'],plus:['chas','tours','defile','mur'],
   lia:{th0:30,thv:8,R0:2.4,Rv:.6,pause:.2,d0:.5,dv:.4},ouv9:'calme',deco:{dens:1.25,haut:90,larg:1.3}},
  {nom:'LA FORÊT SUSPENDUE',ouv:['mouton','gue','pont'],clx:['belvedere','balcon'],env:['pierres','envers'],rac:['ange','corniche','cirque'],plus:['essaim','voute','ilots','viaduc'],
   lia:{th0:20,thv:8,R0:3,Rv:.8,pause:.4,d0:.6,dv:.5},ouv9:'balcon',deco:{pins:{k:1.2,pin:.9},lian:1.6}},
  {nom:'LA GRANDE CHUTE',ouv:['plongee','defile'],clx:['gouffre'],env:['couloir','envers'],rac:['cirque','passe','lacets'],plus:['russes','galerie','mur','chas'],
   lia:{th0:34,thv:8,R0:2.2,Rv:.6,pause:.1,d0:.45,dv:.35},ouv9:'plonge',deco:{dens:.6,haut:-70,nua:1.4}},
  {nom:'LES MURS DE JADE',ouv:['galerie','defile'],clx:['gouffre','balcon'],env:['envers','pierres'],rac:['corniche','passe'],plus:['mur','tours','chas','ceinture'],
   lia:{th0:28,thv:8,R0:2.4,Rv:.7,pause:.2,d0:.5,dv:.4},ouv9:'calme',deco:{larg:1.3,dens:1.25,roch:{p:.18,n:3}}},
  {nom:'LA NUÉE',ouv:['essaim','mouton'],clx:['belvedere','gouffre'],env:['pierres'],rac:['cirque','lacets','ange'],plus:['voute','ilots','ceinture','viaduc'],
   lia:{th0:24,thv:10,R0:2.6,Rv:.9,pause:.3,d0:.55,dv:.5},ouv9:'plonge',deco:{roch:{p:.75,n:4},larg:.75}}];
/* LE PAQUET d'une vallée — g : la graine ; ouverture : la place pour une ouverture ; kv : vPalier / rayonPalier (les lacets ne tiennent qu'aux grandes vitesses).
   Rend {file (toutes les étapes, dans l'ordre), plus (le remplissage, s'il reste de la place), climax, lia (l'allure des liaisons), ouv, itin (le numéro), nom} */
function jadeAvPaquet(g,ouverture,kv){g=g>>>0;const h=mulberry32((Math.imul(g,0x9E3779B1)^0xA7A7A12)>>>0),pick=function(a){return a[(h()*a.length)|0];};
  const mel=function(A){A=A.slice();for(let i=A.length-1;i>0;i--){const j=(h()*(i+1))|0,x=A[i];A[i]=A[j];A[j]=x;}return A;};
  const ix=(g+((g/JAV_ITIN.length)|0))%JAV_ITIN.length,it=JAV_ITIN[ix]; /* six graines de suite : six itinéraires ; le tour suivant décale d'un cran */
  let R9=mel(it.rac.filter(function(c){return c!=='lacets'||kv>=1.6;}));for(const c of mel(['cirque','passe','corniche','ange']))if(R9.length<2&&R9.indexOf(c)<0)R9.push(c);
  const A=pick(it.ouv),C9=pick(it.clx),E=pick(it.env),F9=mel(it.plus.concat(it.ouv.filter(function(c){return c!==A;})));
  const V=JAV_VERBE;let file=null;
  for(let e=0;e<12&&!file;e++){const T9=pick(JAV_TRAMES),rs=e%2?[R9[1],R9[0]]:[R9[0],R9[1]];let nr=0;const f=[];
    for(const t of T9){if(!ouverture&&(t==='O'||t==='F'))continue;f.push(t==='O'?A:t==='R'?rs[nr++]:t==='E'?E:t==='C'?C9:F9[0]);}
    let ok=true;for(let i=1;i<f.length;i++)if(V[f[i]]===V[f[i-1]]||f[i]===f[i-1])ok=false;if(ok||e===11)file=f;}
  const plus=F9.filter(function(c){return file.indexOf(c)<0;}).concat(mel(['voute','ilots','tours','chas','russes','plongee']));
  return {file:file,plus:plus,climax:C9,lia:it.lia,ouv:ouverture?it.ouv9:'calme',itin:ix,nom:it.nom};}
/* LE DÉCOR DE L'ITINÉRAIRE : le tirage de la vallée (jadeDecoTire) penché vers son itinéraire — chaque valeur imposée est une des valeurs que le tirage sait déjà
   sortir (le coût reste dans la plage d'avant, téléphone compris) */
function jadeAvDecoBiais(D,ix){const it=JAV_ITIN[ix];if(!it||!D)return;for(const k9 in it.deco)D[k9]=it.deco[k9];if(D.li)D.li.push('itinéraire : '+it.nom);}
/* LES SCÈNES — S9 : le catalogue de jadeAGen ; X : sa tortue et ses outils (va, arcP, crete, dec, pic, cote…) */
function jadeAvScenes(S9,X){
  const r=X.r,rd=X.rd,PI=X.PI,vT=X.vT,vP=X.vP,rP=X.rP,RH=X.RH,C=X.C,P=X.P,va=X.va,arcP=X.arcP,crete=X.crete,centre=X.centre,surArc=X.surArc,dec=X.dec,pic=X.pic,cote=X.cote,vers=X.vers,rp=X.rp,k=X.k,Fv=X.Fv;
  /* une île SOUS la dalle (la route est POSÉE dessus) ; une île renversée AU-DESSUS (son ventre plat `clear` m au-dessus de la route : un toit) */
  const sous=function(kk,rr,o){return dec(Object.assign({t:'ile',k:kk,rel:1,s:1,lat:4,dy:0,r:rr,massif:rr>=38?1:0,av:{anc:'haut',m:1.5,plat:1}},o||{}));}; /* (décalée de 4 m : une île centrée pile sous l'axe de la route tombe dans un cas limite de la garde `libre` — une rangée vide au sommet du gabarit) */ /* massif : au-delà de 38 m, une mésa (la grande, 47 m, est toujours dans la palette avec le drapeau) */
  const toit=function(kk,rr,clear,s,lat){return dec({t:'ile',k:kk,rel:1,s:s||0,lat:lat||0,dy:clear,r:rr,inv:1,av:{anc:'bas',m:5,plat:1}});};
  const palier=function(sg,ri,o,deg){const i0=k();va(Math.max(2*ri+44,.3*vT),sg*(deg||3)*rd,0,{n:2});return sous(i0+1,ri,o);}; /* deg : son virage (3° : presque droit) */ /* (le rayon réel d'une grande mésa dépasse son rayon nominal : le palier la couvre toute) */ /* un palier presque à plat, son îlot dessous */
  /* LE GUÉ DU CIEL (POSÉE) */
  S9.gue=function(){const n=3+(r()<.35?1:0),sg=cote(.9);
    for(let j=0;j<n;j++){va(.45*vT,sg*(4+r()*4)*rd,-1.5*rd);palier(sg,46+r()*8); /* (la dalle fait 52 m : l'îlot doit la porter) */
      crete(-(26+r()*6)*rd,sg*(22+r()*8)*rd);va(.25*vT,sg*4*rd,X.th());} /* la marche : une crête ronde, on tient la pente */
    va(.4*vT,sg*6*rd,-(20+r()*6)*rd);};
  /* LE PONT DE LIANES (SUSPENDUE) */
  S9.pont=function(){const sg=cote(.6);
    va(.45*vT,sg*5*rd,-1.5*rd);palier(sg,46+r()*8); /* le pic A */
    const i0=k();crete(-(20+r()*6)*rd,sg*(22+r()*6)*rd);va(.3*vT,sg*5*rd,X.th());const iM=k(); /* le pont se creuse… */
    va(.75*vT,sg*(8+r()*6)*rd,(10+r()*4)*rd);va(.45*vT,sg*4*rd,-1.5*rd);const i1=k(); /* …on écrase les amortisseurs, on remonte */
    palier(sg,46+r()*8); /* le pic B */
    dec({t:'ile',k:iM,rel:1,s:-sg,lat:10+r()*30,dy:150+r()*50,r:36+r()*12,casc:1,av:{anc:'bas',m:6,lia:[i0,i1]}}); /* L'ÎLE qui tient le pont, loin au-dessus */
    crete(-(30+r()*8)*rd,-sg*(22+r()*8)*rd);va(.3*vT,-sg*5*rd,X.th());}; /* et on repart dans le vide, de l'autre côté */
  /* LE GOUFFRE PERCÉ (PERCÉE) */
  S9.gouffre=function(){const sg=cote(1.2),thB=-(4+r()*3)*rd,i0=k();
    arcP((2.6+r()*.5)*rP,sg*(40+r()*20)*rd,thB);va(.35*vT,0,thB);const iR=k(),yR=P.y; /* l'approche presque à plat : on voit la couronne */
    const s1=r()<.5?-1:1;crete(-(52+r()*4)*rd,s1*(22+r()*8)*rd);const iC=k();va((1.3+r()*.4)*vT,s1*(26+r()*10)*rd,X.th());const iF=k(); /* le rebord, puis la plongée dans le trou */
    va(.9*vT,s1*12*rd,-(16+r()*4)*rd);const i1=k();X.ZC.push([i0,i1]);
    const iE=Math.round(iR+(iC-iR)*.6),a=C[iE],b=C[iF],cx=(a.x+b.x)/2,cz=(a.z+b.z)/2,Rc=Math.hypot(b.x-a.x,b.z-a.z)/2+RH+24,n=10+((r()*3)|0),a0=r()*6.2832,grands=[(r()*n)|0,(r()*n)|0,(r()*n)|0];
    for(let j=0;j<n;j++){const an=a0+j*6.2832/n+(r()-.5)*.2,x=cx+Math.sin(an)*Rc,z=cz+Math.cos(an)*Rc,ri=25+r()*10;
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
    const bU=function(u){return bk*Math.min(rp(u/fr),rp((1-u)/fr));},nW=Math.max(5,Math.min(10,Math.round(Rp*a/75))); /* bU : le dévers réel à u (rampes comprises) — la dalle penche vers le centre */
    for(let j=1;j<=nW;j++){const u=j/(nW+1),al=a*u,ri=26+r()*8,cu=Math.cos(bU(u)),q=surArc(c,f0,sg,al,Rp-RH*cu-6-ri),ii=Math.round(i0+(i1-i0)*u);
      dec({t:'tour',x:q.x,z:q.z,r:ri,top:C[ii].y+110+r()*120,foot:C[ii].y-120,k:ii,clr:RH*cu+5});} /* LA PAROI : des pics contre le bord bas de la dalle (posée la première : elle compte plus que le toit) */
    for(let j=1;j<=nW;j++){const ii=Math.round(i0+(i1-i0)*j/(nW+1));
      const u2=(j+.5)/(nW+1),b2=bU(u2);if(j<nW&&b2>.8*bk){const i2=Math.round(i0+(i1-i0)*u2),rr=14+r()*6,D=9+Math.sin(b2)*rr;toit(i2,rr,D*Math.cos(b2),sg,D*Math.sin(b2));} /* LE TOIT : entre deux piliers, une île renversée au-dessus de la caisse (le long de la normale) */
      if(j%2){const q2=surArc(c,f0,sg,a*u2,Rp+RH*Math.cos(b2)+5+24);dec({t:'tour',x:q2.x,z:q2.z,r:24,top:C[Math.round(i0+(i1-i0)*u2)].y+RH*Math.sin(b2)+34+r()*20,foot:C[ii].y-140,k:ii,clr:RH*Math.cos(b2)+5});}}}; /* LES COLONNES côté vide : une fenêtre entre chaque */ /* LES COLONNES côté vide : une fenêtre entre chaque */
  /* LE BELVÉDÈRE (GRAVIE) */
  S9.belvedere=function(){const a=(150+r()*40)*rd,sg=cote(a),Rp=Math.max((2+r()*.3)*rP,3.4*vT/a),thU=(8+r()*3)*rd,i0=k();
    va(.5*vT,sg*6*rd,-4*rd);const c=centre(Rp,sg),y0=P.y,iA=k();arcP(Rp,sg*a,thU);const iH=k(); /* on MONTE en tournant */
    dec({t:'tour',x:c.x,z:c.z,r:Math.min(56,Rp-RH-9),top:P.y+30+r()*60,foot:y0-160,k:iA});
    for(let j=0;j<4;j++){const ii=Math.round(iA+(iH-iA)*(.14+.24*j));pic(ii,sg,13+r()*8,60+r()*90,5+r()*3);} /* entre les pics, au creux du virage */
    va(.35*vT,sg*4*rd,-1*rd);const iS=k(),rM=46+r()*8,pS=P.clone(),fS=X.phi();va(Math.max(2*rM+10,.75*vT),sg*5*rd,-1*rd,{n:2});sous(iS+1,rM,{casc:2}); /* LE SOMMET : un plateau, ses cascades */
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
    for(let j=0;j<2;j++){crete(-(24+r()*5)*rd,sg*(22+r()*6)*rd);va(.3*vT,sg*4*rd,X.th());va(.35*vT,sg*3*rd,-2*rd);const rr=24+r()*8,iT=k();va(Math.max(2.6*rr+24,.3*vT),sg*3*rd,-1.5*rd,{n:2});toit(iT+1,rr,15+r()*4); /* DESSOUS : un creux à plat sous le ventre d'une île */
      va(.7*vT,sg*(6+r()*5)*rd,(7+r()*4)*rd);va(.45*vT,sg*4*rd,-1.5*rd);palier(sg,46+r()*6);} /* DESSUS */
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
  /* ===== LES GRANDS SAUTS (2026-11-16, Sacha : « toujours les deux mêmes boucles de merde, invente autre chose ») — les raccourcis SANS BOUCLE =====
     LA LÈVRE presque à plat ; sous elle la route plonge (LA CHUTE) et part en DÉTOUR : des arcs dont le cap revient à celui de la lèvre sans jamais faire le tour
     (un Ω autour d'un cirque, d'une porte, d'un massif ; des lacets aux grandes vitesses) ; elle revient sur la ligne de la lèvre PLUS LOIN et PLUS BAS. Le saut
     file droit au-dessus du détour. La pente du détour est CALCULÉE sur le vol : là où la route rejoint la ligne (l'avance F), le vol de référence (1,4 × la
     croisière, l'impulsion du saut, une pesanteur de 26 m/s²) est à h(F) ; la route y arrive 25 m plus bas, puis LA SORTIE-TREMPLIN de jadeAGen remonte à 14-17°
     sur toute la zone de pose, puis le replat (le même vol, jugé pareil : `vole`, MODMARK.rac, les fils d'or, le couloir du vol). */
  const levre=function(){const z9={ro:function(){return 0;}};va(.6*vP,(r()-.5)*14*rd,-2*rd,z9);va(.45*vP,0,-2*rd,z9);return {iL:k(),pL:P.clone(),fL:X.phi()};}; /* la lèvre À PLAT (roulis écrit nul) : le saut retombe le long de la normale quittée — penchée, un vol long dériverait de côté */
  const chute=function(s){va(.5*vP,(s||0)*9*rd,-30*rd);}; /* LA CHUTE : on plonge sous la lèvre en s'écartant déjà de la ligne du vol (sinon un saut lent retombe tout de suite dessus) */
  const avance=function(L){const F=Fv(L.fL);return (P.x-L.pL.x)*F.x+(P.z-L.pL.z)*F.z;};
  const travers=function(L,x,z){const S=X.Sv(L.fL);return (x-L.pL.x)*S.x+(z-L.pL.z)*S.z;}; /* l'écart (signé) d'un point à la ligne du vol */
  /* le plan d'un détour : [R, angle signé] un arc de rayon R en plan, [0, longueur] une droite en plan — rend son avance le long de la ligne et sa longueur */
  const planDe=function(L9,ph0){let ph=ph0||0,f=0,l=0;for(const a of L9){if(a[0]>0){const d=a[1];f+=a[0]*(Math.sin(ph+d)-Math.sin(ph))/Math.sign(d);l+=a[0]*Math.abs(d);ph+=d;}else{f+=a[1]*Math.cos(ph);l+=a[1];}}return {f:f,l:l};};
  const volH=function(F){const t=F/(1.4*vP);return 10*t-13*t*t;}; /* la hauteur du vol de référence à l'avance F (m, par rapport à la lèvre) */
  /* LE RECALAGE : le cap remis sur celui de la lèvre, puis un S qui ramène la route SOUS la ligne du vol (sinon un saut rapide passe à côté) */
  const recale=function(L,th9){const dh=X.ang(X.phi()-L.fL);if(Math.abs(dh)>2*rd)arcP(1.6*rP,-dh,th9);const e=travers(L,P.x,P.z);if(Math.abs(e)<6)return;
    const R=1.6*rP,b=Math.min(80*rd,Math.acos(Math.max(-1,Math.min(1,1-Math.abs(e)/(2*R))))),sg=e>0?-1:1;arcP(R,sg*b,th9);arcP(R,-sg*b,th9);};
  const detour=function(L,L9,o){o=o||{};const h0=X.ang(X.phi()-L.fL);L9=L9.map(function(a,j){return j===0&&a[0]>0?[a[0],a[1]-h0]:a;}); /* le premier arc part du cap où la chute nous a laissés */
    const lt=.3*vP,pl=planDe(L9,h0),F0=avance(L)+lt*Math.cos(h0)+pl.f,yT=L.pL.y+volH(F0)-25;
    const th9=-Math.max(3*rd,Math.min(32*rd,Math.atan2(Math.max(0,P.y-yT),Math.max(1,pl.l+lt))));const segs=[];
    va(lt,0,th9); /* la pente du détour, en ligne droite : les arcs qui suivent sont exacts en plan */
    for(let j=0;j<L9.length;j++){const a=L9[j],s9={i0:k(),f0:X.phi(),a:a};
      if(a[0]>0){s9.c=centre(a[0],a[1]>0?1:-1);arcP(a[0],a[1],th9,o.ro&&o.ro[j]?o.ro[j]:undefined);}
      else va(a[1]/Math.cos(th9),0,th9);
      s9.i1=k();segs.push(s9);}
    recale(L,th9);
    return {segs:segs,F0:F0,yT:yT,th:th9};};
  /* LA SORTIE : recalée sur la ligne de la lèvre, le tremplin, le replat (comme jadeAGen) */
  const sortie=function(L){const e=travers(L,P.x,P.z),dh=X.ang(X.phi()-L.fL),Lc=.55*vP,psi=Math.max(-.35,Math.min(.35,-e/Lc-dh/2));
    va(Lc,psi,(14+r()*3)*rd);va(Lc,-psi,X.th());const dh2=X.ang(X.phi()-L.fL);va((2.1+r()*.2)*vP,-dh2,X.th());va((1+r()*.2)*vP,(r()<.5?-1:1)*(12+r()*6)*rd,(r()*3-1)*rd);}; /* le replat tourne déjà (aux grands paliers, la sortie était la plus longue droite de la route) */
  /* LA COURONNE : des pics au-dehors d'un arc (une fenêtre de temps en temps) */
  const couronne=function(s9,n,hMin,hVar){const sg9=s9.a[1]>0?1:-1,al9=Math.abs(s9.a[1]),R=s9.a[0];
    for(let j=1;j<=n;j++){if(r()<.3)continue;const al=al9*j/(n+1),ri=24+r()*10,q=surArc(s9.c,s9.f0,sg9,al,R+RH+10+ri),ii=Math.round(s9.i0+(s9.i1-s9.i0)*j/(n+1));
      dec({t:'tour',x:q.x,z:q.z,r:ri,top:C[ii].y+hMin+r()*hVar,foot:C[ii].y-170,k:ii,clr:RH+10});}};
  /* LA CASCADE DU BORD : une île au-dehors du milieu d'un arc, sa cascade tombe en travers de la route, vers le centre */
  const chuteBord=function(s9){const sg9=s9.a[1]>0?1:-1,R=s9.a[0],ri=22+r()*8,q=surArc(s9.c,s9.f0,sg9,Math.abs(s9.a[1])/2,R+ri*.55),ii=Math.round((s9.i0+s9.i1)/2),dx=s9.c.x-q.x,dz=s9.c.z-q.z,l=Math.hypot(dx,dz)||1;
    dec({t:'ile',x:q.x,z:q.z,y:C[ii].y+40+ri*.95+r()*20,r:ri,k:ii,cascDir:[dx/l,dz/l]});};
  /* LE FOND DU CIRQUE : deux ou trois îles, loin sous la route, du côté du cirque opposé à la ligne du vol */
  const fosse=function(L,s9,yT){const c=s9.c,R=s9.a[0],S=X.Sv(L.fL),F=Fv(L.fL),sgL=travers(L,c.x,c.z)>=0?1:-1;
    for(let j=0;j<3;j++){const ri=10+r()*14,an=(r()-.5)*PI,dd=Math.max(0,R-RH-ri-14)*(.35+.5*r()),u=sgL*Math.abs(Math.cos(an))*dd,w=Math.sin(an)*dd;
      dec({t:'ile',x:c.x+S.x*u+F.x*w,z:c.z+S.z*u+F.z*w,y:yT-50-r()*140,r:ri,k:s9.i0,casc:j===0?1:0});}};
  /* LE CIRQUE (SURVOLÉE) : un Ω autour d'un cirque vide (sa couronne de pics, des îles au fond, la cascade du bord) ; le saut le survole */
  S9.cirque=function(){const L=levre(),s=r()<.5?-1:1,R1=(1.35+r()*.2)*rP,R=(1.6+r()*.3)*rP,a=(85+r()*20)*rd;chute(s);const i0=k();
    const D9=detour(L,[[R1,s*a],[R,-2*s*a],[R1,s*a]]),s2=D9.segs[1];X.ZC.push([i0,k()]);
    couronne(s2,7,80,140);chuteBord(s2);fosse(L,s2,D9.yT);sortie(L);X.RAC.push({iL:L.iL,sc:X.sc()});};
  /* LA PASSE (ENFILÉE) : le détour enroule une tour géante, une autre se dresse de l'autre côté de la ligne — le saut file ENTRE les deux, dans la porte */
  S9.passe=function(){const L=levre(),s=r()<.5?-1:1,R1=(1.4+r()*.2)*rP,R=(1.6+r()*.25)*rP,a=(90+r()*20)*rd;chute(s);const i0=k();
    const D9=detour(L,[[R1,s*a],[R,-2*s*a],[R1,s*a]]),s2=D9.segs[1];X.ZC.push([i0,k()]);
    const S=X.Sv(L.fL),F=Fv(L.fL),c=s2.c,fM=(c.x-L.pL.x)*F.x+(c.z-L.pL.z)*F.z,sgL=travers(L,c.x,c.z)>=0?1:-1,g9=17+r()*7;
    for(const c9 of [sgL,-sgL]){let rT=24+r()*10;const lat=c9*(g9+rT),x0=L.pL.x+F.x*fM+S.x*lat,z0=L.pL.z+F.z*fM+S.z*lat;
      let dmin=1e9;for(let i=i0;i<=k();i++){const d=Math.hypot(C[i].x-x0,C[i].z-z0);if(d<dmin)dmin=d;} /* la tour du dedans ne touche pas la route qui l'enroule */
      if(dmin-RH-10<rT)rT=dmin-RH-10;if(rT<14)continue;
      dec({t:'tour',x:L.pL.x+F.x*fM+S.x*c9*(g9+rT),z:L.pL.z+F.z*fM+S.z*c9*(g9+rT),r:rT,top:L.pL.y+70+r()*130,foot:D9.yT-260,k:s2.i0,clr:RH+10});}
    couronne(s2,5,60,120);sortie(L);X.RAC.push({iL:L.iL,sc:X.sc()});};
  /* LA CORNICHE (COUCHÉE) : le Ω enroule un massif, la dalle couchée à 40-52° contre sa paroi ; le saut file au ras du rocher */
  S9.corniche=function(){const L=levre(),s=r()<.5?-1:1,R1=(1.45+r()*.2)*rP,R=(1.7+r()*.25)*rP,a=(88+r()*12)*rd,fr=Math.min(.45,2.4*vT/(R*2*a)),bk=Math.min((40+r()*10)*rd,35*rd*fr*R*2*a/vT);chute(s);const i0=k(); /* le couchage : jamais plus de ~35°/s (aux petits paliers l'arc est court : on couche moins) */
    const sg2=-s,bU=function(u){return bk*Math.min(rp(u/fr),rp((1-u)/fr));};
    const D9=detour(L,[[R1,s*a],[R,-2*s*a],[R1,s*a]],{ro:[null,{dro:2*bk,ro:function(u){return -sg2*bU(u);}},null]}),s2=D9.segs[1];X.ZC.push([i0,k()]);
    const c=s2.c,lc=Math.abs(travers(L,c.x,c.z));
    {const rM=Math.min(56,R-RH*Math.cos(bk)-16,lc-24);if(rM>=20)dec({t:'tour',x:c.x,z:c.z,r:rM,top:L.pL.y+90+r()*120,foot:D9.yT-220,k:s2.i0,clr:RH*Math.cos(bk)+8});} /* LE MASSIF au cœur du Ω */
    const n=Math.max(5,Math.min(10,Math.round(R*2*a/80)));
    for(let j=1;j<=n;j++){const u=j/(n+1),cu=Math.cos(bU(u)),ri=20+r()*8,q=surArc(c,s2.f0,sg2,2*a*u,R-RH*cu-6-ri),ii=Math.round(s2.i0+(s2.i1-s2.i0)*u);
      if(Math.abs(travers(L,q.x,q.z))-ri<16)continue; /* rien dans la ligne du vol */
      dec({t:'tour',x:q.x,z:q.z,r:ri,top:C[ii].y+100+r()*120,foot:C[ii].y-140,k:ii,clr:RH*cu+5});} /* LA PAROI : des pics contre le bord bas de la dalle couchée */
    sortie(L);X.RAC.push({iL:L.iL,sc:X.sc()});};
  /* LES LACETS (ZIGZAG, aux grandes vitesses seulement) : quatre virages alternés qui descendent, chacun autour d'un pilier ; le saut file droit au-dessus */
  S9.lacets=function(){const L=levre(),s=r()<.5?-1:1,R=(1.4+r()*.2)*rP,a=(42+r()*12)*rd,Lg=(.25+r()*.1)*vP,L2=2*Lg+2*R*(1-Math.cos(a))/Math.sin(a);chute(s);const i0=k();
    const D9=detour(L,[[R,s*a],[0,Lg],[R,-2*s*a],[0,L2],[R,2*s*a],[0,Lg],[R,-s*a]]);X.ZC.push([i0,k()]);
    for(const j of [2,4]){const s9=D9.segs[j],rT=Math.min(56,R-RH-12);if(rT>=18)dec({t:'tour',x:s9.c.x,z:s9.c.z,r:rT,top:C[s9.i0].y+90+r()*120,foot:C[s9.i1].y-160,k:s9.i0,clr:RH+12});
      couronne(s9,4,60,100);}
    sortie(L);X.RAC.push({iL:L.iL,sc:X.sc()});};
  /* LE FLEUVE QUI TOMBE (POSÉE, un grand saut) : le plateau, ses mésas, la rivière ; la lèvre au bord, la rivière tombe dans le cirque que la route contourne ;
     le saut file au-dessus de la chute ; on se pose sur une mésa */
  S9.ange=function(){const s=r()<.5?-1:1;va(.45*vT,(r()-.5)*10*rd,-1.2*rd);const iPl=k();va(1.15*vT,(r()-.5)*8*rd,-1.2*rd,{n:3}); /* LE PLATEAU : un vrai moment à plat */
    const L=levre(),iL=L.iL,pL=L.pL,F=Fv(L.fL),rM=47,ms=[],cum=[0];for(let i=iPl+1;i<=iL;i++)cum.push(cum[cum.length-1]+C[i].distanceTo(C[i-1]));const Lp=cum[cum.length-1];
    for(let d=Lp-58,n9=0;d>=30&&n9<4;d-=104,n9++){let j=0;while(j<cum.length-2&&cum[j+1]<d)j++;const t9=Math.min(1,(d-cum[j])/Math.max(1,cum[j+1]-cum[j])),p=C[iPl+j].clone().lerp(C[iPl+j+1],t9).addScaledVector(X.Sv(L.fL),s*4),a9={anc:'haut',m:1.5,plat:1};
      ms.push(a9);ms.push(dec({t:'ile',x:p.x,z:p.z,y:p.y,r:rM,massif:1,k:iL,av:a9}));} /* des mésas bout à bout sous la route, la première finit au bord de la lèvre */
    const riv9=dec({t:'riv',k:iL,a:C[iPl].clone(),b:pL.clone(),cote:s,off:RH+7,w:9,mesas:[],F:[F.x,F.z],lg:300+r()*160}); /* LA RIVIÈRE, du côté du cirque */
    chute(s);const i0=k(),R1=(1.35+r()*.2)*rP,R=(1.6+r()*.3)*rP,a=(85+r()*20)*rd;
    const D9=detour(L,[[R1,s*a],[R,-2*s*a],[R1,s*a]]),s2=D9.segs[1];X.ZC.push([i0,k()]);couronne(s2,6,70,120);fosse(L,s2,D9.yT);
    sortie(L);palier(r()<.5?-1:1,46+r()*6,null,26+r()*12);va(.5*vT,(r()<.5?-1:1)*(8+r()*6)*rd,-(10+r()*6)*rd); /* on se pose sur une mésa, et on la quitte en tournant */
    for(let m=0;m<ms.length;m+=2){const a9=ms[m],o=ms[m+1];let ko=false; /* une mésa que la route d'après traverserait est retirée (rayon réel ~62 m, haute de ~63 m) */
      for(let j=iL+1;j<=k()&&!ko;j++){const q=C[j];if(Math.hypot(q.x-o.x,q.z-o.z)<62+RH+10&&q.y>o.y-63-18&&q.y<o.y+10)ko=true;}
      if(ko)o.t='non';else riv9.mesas.push(a9);}
    X.RAC.push({iL:iL,sc:X.sc()});};
  /* LA CEINTURE (ENROULÉE) : un demi-tour autour d'un pic géant, un îlot dehors, un îlot dedans — plus une boucle */
  S9.ceinture=function(){const a=(150+r()*40)*rd,sg=cote(a),Rp=Math.max((2.1+r()*.3)*rP,4*vT/a),thC=-(14+r()*6)*rd;va(.3*vT,0,thC);const c=centre(Rp,sg),y0=P.y,iA=k();arcP(Rp,sg*a,thC);const iB=k();
    dec({t:'tour',x:c.x,z:c.z,r:Math.min(56,Rp-RH-36),top:y0+120+r()*120,foot:P.y-160,k:iA});
    const n=6+((r()*3)|0);for(let j=0;j<n;j++){const ii=Math.round(iA+(iB-iA)*(j+.5)/n),r1=8+r()*4;dec({t:'ile',k:ii,rel:1,s:j%2?sg:-sg,lat:RH+5+r1*1.45+r()*3,dy:-3+r()*13,r:r1,bord:1});}
    va(.4*vT,-sg*(10+r()*10)*rd,-(24+r()*6)*rd);};
  /* LE VIADUC DE PIERRE (PORTÉE) : un long balayage presque à plat, posé sur une file de colonnes de pierre (leur sommet sous la dalle) ; puis on plonge du bout */
  S9.viaduc=function(){const sg=cote(.7),n=4+((r()*3)|0),sp=70+r()*25,th0=-(2+r()*2.5)*rd;va(.35*vT,sg*6*rd,th0);
    for(let j=0;j<n;j++){va(sp,sg*(5+r()*6)*rd,th0,{n:1});const ri=20+r()*10,top=P.y-7.5;
      dec({t:'tour',x:P.x,z:P.z,r:ri,top:top,foot:top-(180+r()*140),k:k(),clr:RH+2});}
    va(.3*vT,sg*5*rd,th0);crete(-(30+r()*8)*rd,-sg*(20+r()*8)*rd);va(.3*vT,-sg*5*rd,X.th());};
  /* LA NUÉE (TRAVERSÉE) : un S au milieu d'un essaim d'îles, à toutes les hauteurs, au bord et au-dessus de la route */
  S9.essaim=function(){const n=3+(r()<.5?1:0),thE=-(16+r()*8)*rd;let sg=cote(0);
    for(let j=0;j<n;j++){const v9=vers(),a=(38+r()*20)*rd*(v9===0?1:v9===sg?1.3:.7),Rp=(2.3+r()*.5)*rP;arcP(Rp,sg*a*.5,thE);const ka=k();
      for(let q=0;q<5;q++){const ri=5+r()*9;
        if(r()<.3)dec({t:'ile',k:ka,rel:1,s:r()<.5?-1:1,lat:r()*22,dy:26+ri*1.2+r()*30,r:ri,inv:r()<.4?1:0}); /* au-dessus de la route */
        else dec({t:'ile',k:ka,rel:1,s:r()<.5?-1:1,lat:RH+6+ri*1.4+r()*70,dy:-30+r()*80,r:ri,bord:1});} /* au bord, en haut, en bas */
      arcP(Rp,sg*a*.5,thE);sg=-sg;}};
  /* LE DÉFILÉ (SERRÉE) : deux murs de pics hauts et serrés de chaque côté, un S qui descend entre eux — le ciel en bande au-dessus */
  S9.defile=function(){const thD=-(20+r()*6)*rd,n=2+(r()<.5?1:0);let sg=cote(0);const i0=k();
    for(let j=0;j<n;j++){const a=(28+r()*16)*rd,Rp=Math.max(2.4*rP,(1.1+r()*.3)*vT/a);arcP(Rp,sg*a,thD);sg=-sg;}
    const i1=k();let acc=0;for(let i=i0+1;i<=i1;i++){acc+=C[i].distanceTo(C[i-1]);if(acc<34)continue;acc=0;for(const s9 of [-1,1])pic(i,s9,14+r()*12,180+r()*200,3.5+r()*2.5);}
    crete(-(34+r()*8)*rd,(r()-.5)*30*rd);va(.4*vT,(r()-.5)*16*rd,X.th());};}
/* ---- après la génération : les décors à part (pierres, rivières) et les repères des lianes passent dans le monde ---- */
function jadeAvApplique(b){const C=b.ctrl,A={itin:b.itin,pierres:[],riv:[],pm:null,n:{},scn:b.SCN.map(function(s9){return {nom:s9.nom,a:C[s9.i0].clone(),b:C[s9.i1].clone()};})}; /* scn : les scènes (le banc les retrouve sur la route bâtie) */
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
      const b=B[i];for(let w=-1;w<=1;w+=.5){const x=p.x+b.x*w*ROAD_HALF,z=p.z+b.z*w*ROAD_HALF;if(Math.hypot(x-cx,z-cz)>rm*.92)continue;const y=p.y+b.y*w*ROAD_HALF;if(y<lo)lo=y;}}); /* la dalle sur toute sa largeur, là où l'île la porte */
    return Math.floor(((lo<1e9?lo:o.y)-2.6)/VX)*VX;}
  return yt;}
/* ---- après la pose des îles : les cascades libres (la rivière qui tombe du bord de sa mésa) ---- */
function jadeAvPose(X){const R0=JADE.avR;JADE.av=R0?{itin:R0.itin,pierres:R0.pierres,riv:R0.riv,scn:R0.scn,pm:null,n:{}}:null;const A=JADE.av;if(!A)return;A.n.rivieres=0;
  A.poses=(JADE.deco3||[]).filter(function(o){return o.av;}).map(function(o){return {r:Math.round(o.r),anc:o.av.anc||'',ok:!!o.av.q,why:o.av.q?'':o.av.why||'',sommet:o.av.q?Math.round(o.av.q[4]):null,rm:o.av.q?Math.round(o.av.q[2]):null,x:o.av.q?Math.round(o.av.q[0]):Math.round(o.x),z:o.av.q?Math.round(o.av.q[1]):Math.round(o.z),y:Math.round(o.y)};});
  for(const R of A.riv){const q=R.mesas.length&&R.mesas[0].q;if(!q)continue;const s9=R.cote,ox=R.F[1]*s9,oz=-R.F[0]*s9,ex=(R.b.x+ox*R.off)-q[0],ez=(R.b.z+oz*R.off)-q[1],e=ex*ox+ez*oz,av9=Math.sqrt(Math.max(0,q[2]*q[2]*.94-e*e)); /* le point du bord de la mésa sur la ligne de la rivière */
    X.CASC.push([q[0]+ox*e+R.F[0]*av9,q[4]-1.2,q[1]+oz*e+R.F[1]*av9,R.F[0],R.F[1],R.w*1.5,Math.min(ALLEGE?420:900,R.lg),X.jr()]);A.n.rivieres++;}}
/* ---- LES MAILLAGES (jadeBatit) : lianes, rivières, pierres ---- */
function jadeAvBatit(root,G,M9,FC){const A=JADE.av;if(!A)return;const t0=performance.now();
  const sDe=function(v){let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi;},ds=L/Math.max(1,NP-1);
  /* LES LIANES : du bord de la dalle au ventre de l'île qui tient le pont — un ruban fin (deux plans croisés ; un seul sur ALLEGE), une flèche de 4 % */
  {const Pp=[],I=[],ep=.32,S=6,pas=Math.max(1,Math.round((ALLEGE?34:17)/ds));let nl=0;
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
  liane:function(){return this.l||(this.l=new THREE.MeshBasicMaterial({color:0x14200f,side:THREE.DoubleSide,fog:true}));},
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
window.dbgJadeAv=function(){const A=JADE.av,sDe=function(v){let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return Math.round(bi*L/Math.max(1,NP-1));};
  return {on:JADE_AV,itin:A&&A.itin!=null?JAV_ITIN[A.itin].nom:null,n:A?A.n:null,s:A&&NP>1?A.scn.map(function(o){return [o.nom,sDe(o.a),sDe(o.b)];}):null,L:Math.round(L),scenes:JADE.a3?JADE.a3.scenes:null,verbes:JADE.a3?JADE.a3.scenes.map(function(c){return JAV_VERBE[c]||c;}):null,
  poses:A&&A.poses?A.poses.map(function(o){if(!o.ok||!(NP>1))return o;let bd=1e9,bi=0;for(let i=0;i<NP;i+=2){const p=pts[i];if(Math.abs(p.y-o.sommet)>60)continue;const d=Math.hypot(p.x-o.x,p.z-o.z);if(d<bd){bd=d;bi=i;}}
    return Object.assign({},o,{dRoute:Math.round(bd),dy:+(pts[bi].y-o.sommet).toFixed(1),s:Math.round(bi*L/(NP-1))});}):null,refus:JADE.n3?JADE.n3.pourquoi:null,
  hauts:JADE.geos?JADE_CAT.map(function(c,k){const T9=JADE.geos.p[k];return c.haut&&T9?[k,Math.round(T9.rmax*VX),Math.round(T9.yTop*VX)]:null;}).filter(Boolean):null};};
/* (banc) une vue de côté sur la route à s m : lat (m, de côté, le long de B), h (m, plus haut), rec (m, en arrière) */
window.dbgJadeAvVue=function(s9,lat,h,rec){if(!(NP>1))return null;const i=Math.max(0,Math.min(NP-1,Math.round(s9/L*(NP-1)))),p=pts[i],c=p.clone().addScaledVector(B[i],lat).addScaledVector(T[i],-rec);c.y+=h;
  const w=p.clone().addScaledVector(T[i],50);return window.dbgJadeVue({p:c.toArray(),c:w.toArray(),fov:72});};
