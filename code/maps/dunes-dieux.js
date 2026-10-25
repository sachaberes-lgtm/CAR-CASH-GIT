/* ===== LES DIEUX À TÊTE D'ANIMAL ET LE SPHINX-CHAT (2026-10-23, Léo : « fais un sphynx chat égyptien plutôt, et quelques statues avec des têtes d'animaux choisis ») =====
   Six statues assises (le corps du pharaon, style A : trône cubique, mains à plat, collier usekh, tablier plissé — avec une TÊTE de dieu) : HORUS le faucon (double couronne), ANUBIS le chacal (noir, grandes oreilles),
   THOT l'ibis (long bec courbe, croissant de lune), AMON le bélier (cornes d'or, disque), SEKHMET la lionne (disque et uræus), SOBEK le crocodile (long museau, deux plumes) — et LE SPHINX-CHAT (Bastet couchée, oreilles
   dressées, yeux de khôl, collier usekh) en trois livrées. Tout en FACETTES FRANCHES (anneaux de 8 à 14 pans, plans nets, rien de plus fin que la matière de la pierre) : la matière des décors les lit plates.
   Les colosses de la place tirent quatre dieux distincts (`dnDieuxTirage`, dans le flux du décor : D.sd — jamais le tracé), la porte du départ est gardée par deux petits dieux, l'allée des obélisques est une allée de chats.
   `?sans=dunesdieux` rend le pharaon assis et le sphinx de Gizeh d'avant. Console : `dbgDunes('galerie', s, ['dieuFaucon','sphinxChat0d'])` (voir DN_ECH). */
const DN_DIEUX={on:!/[?&]sans=([^&]*,)?dunesdieux(,|&|$)/.test(location.search),liste:['faucon','chacal','ibis','belier','lionne','crocodile'],nom:{faucon:'dieuFaucon',chacal:'dieuChacal',ibis:'dieuIbis',belier:'dieuBelier',lionne:'dieuLionne',crocodile:'dieuCrocodile',pharaon:'pharaon'}};
/* le corps du pharaon assis (celui de DN_MOD.pharaon, à l'identique — mêmes pièces, mêmes tailles), sans la tête : ns = les pans des cuisses et des tibias, le torse en a ns + 4 */
function dnCorpsAssis(g,ns){ns=ns||8;const C=DN_COL,gr=C.gres,g2=C.gres2,cre=[.97,.87,.70],rg=[.93,.78,.58],nt=ns+4,nb=Math.min(7,ns);
  const Ry=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.4}),Rz=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.4});
  g.box(0,0,0,.70,.03,.84,g2,1,1);g.box(0,.03,0,.64,.03,.78,gr,1);g.box(0,.052,.405,.52,.012,.012,gr,4);
  g.box(0,.06,-.05,.44,.32,.50,gr,1);g.box(0,.38,-.285,.44,.44,.07,gr,1);g.box(0,.82,-.285,.40,.03,.065,g2,1);
  for(const sx of [-1,1]){g.box(sx*.223,.13,-.05,.014,.20,.30,C.or,3);g.box(sx*.226,.14,-.05,.012,.16,.24,C.lapis,3);g.box(sx*.227,.16,-.05,.01,.045,.14,C.or,3);}
  for(const sx of [-1,1]){const X=sx*.108;
    g.loft([Rz(-.12,.086,.070,2.6,X,.455),Rz(.04,.090,.072,2.6,X,.455),Rz(.17,.086,.068,2.6,X,.452),Rz(.245,.066,.060,2.4,X,.45)],ns,gr,5,3);
    g.loft([Ry(.45,.066,.062,2.4,X,.262),Ry(.31,.060,.058,2.4,X,.268),Ry(.18,.058,.055,2.4,X,.272),Ry(.098,.063,.060,2.4,X,.274)],ns,gr,5,3);
    g.box(X,.06,.335,.12,.04,.21,g2,1);g.sph(X,.080,.44,.058,.024,.030,3,6,gr,5);}
  g.box(0,.51,.10,.30,.026,.23,rg,5);for(let i=-3;i<=3;i++)g.box(i*.044,.536,.10,.017,.004,.23,i&1?C.or:cre,3);g.box(0,.51,.22,.30,.04,.012,C.or,3);
  g.loft([Ry(.505,.135,.082,2.8,0,-.085),Ry(.56,.145,.086,2.8,0,-.085),Ry(.63,.168,.094,3,0,-.085),Ry(.662,.186,.098,3.2,0,-.085),Ry(.684,.200,.099,3.4,0,-.085),Ry(.702,.205,.097,3.4,0,-.085),Ry(.722,.178,.082,2.8,0,-.085),Ry(.738,.120,.066,2.4,0,-.085),Ry(.752,.058,.054,2.2,0,-.082)],nt,[gr,gr,gr,C.or,C.turq,C.or,C.azur,gr],[5,5,5,3,3,3,3,5],3);
  g.box(0,.505,.0,.272,.024,.022,C.or,3);g.box(0,.507,.012,.052,.032,.012,C.lapis,3);
  for(const sx of [-1,1]){g.tube([sx*.205,.70,-.085],[sx*.215,.60,-.06],.050,.043,nb,gr,5,1);g.sph(sx*.215,.595,-.06,.045,.042,.045,3,6,gr,5);
    g.tube([sx*.215,.595,-.06],[sx*.14,.555,.115],.043,.036,nb,gr,5,1);g.tube([sx*.147,.558,.095],[sx*.14,.555,.12],.046,.046,nb,C.or,3,1);g.sph(sx*.128,.552,.19,.047,.020,.078,3,6,cre,5);}}
/* ---- LES TÊTES (repère local : l'origine au centre de la base du cou, +z devant, +y en haut ; le tout à l'échelle s de la tête) ---- */
const DN_TR=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.3}),DN_TZ=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.3});
const DN_PD={rouge:[.88,.32,.24],blanc:[1,.97,.90],basalte:[.58,.55,.70],fauve:[.98,.52,.38],noir:[.10,.09,.10],crane:[.97,.87,.70],granit:[.74,.50,.45],vert:[.20,.64,.50],papyrus:[.55,.78,.42]};
function dnLappets(g,cols){for(const sx of [-1,1])for(let i=0;i<4;i++)g.box(sx*(.094+.004*i),.088-i*.0385,.026,.044+.005*i,.037,.076,cols[i&1],3);}       // les lappets de la perruque, sur la poitrine
function dnOeil(g,sx,x,y,z,r,or){const C=DN_COL;g.box(sx*x,y-r*.8,z-r*.6,r*1.4,r*1.7,r*1.6,or||C.or,3);g.box(sx*(x+r*.55),y-r*.5,z-r*.1,r*.7,r*1.1,r*1.2,C.noir,0);}       // un œil : un anneau d'or, une pupille noire
function dnDisque(g,y,z,r,ep){const C=DN_COL;g.sph(0,y,z,r,r,ep||r*.4,4,10,C.or,3);g.frus(0,y-r*.7,z+ep*.2+.004,.012,.014,.006,.008,r*.55,C.or,3);}             // le disque solaire (une lentille d'or) et son uræus
const DN_TETE={
  // HORUS : le crâne, le bec d'or à crochet, l'œil d'Horus (le trait sous l'œil et sa queue), la double couronne rouge et blanche, l'uræus
  faucon:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR;g.cyl(0,-.012,-.002,.050,.044,.042,8,p,5);
    g.loft([R(.030,.040,.046,2.2,0,.004),R(.066,.054,.058,2.3,0,.010),R(.104,.060,.062,2.3,0,.012),R(.140,.052,.054,2.3,0,.010),R(.166,.030,.034,2.2,0,.008)],10,p,5,3);
    g.tube([0,.084,.040],[0,.072,.124],.032,.012,6,C.or,3,1);g.tube([0,.072,.124],[0,.034,.142],.014,.004,5,C.or,3,1);
    for(const sx of [-1,1]){dnOeil(g,sx,.056,.108,.036,.016);g.box(sx*.062,.064,.044,.006,.040,.012,C.noir,0);g.box(sx*.063,.100,.002,.006,.008,.060,C.noir,0);}
    dnLappets(g,[C.lapis,C.or]);g.frus(0,.160,-.004,.112,.116,.094,.094,.036,DN_PD.rouge,3,0,0,1);g.frus(0,.194,-.006,.070,.072,.042,.042,.100,DN_PD.blanc,3,0,0,1);g.sph(0,.298,-.006,.034,.038,.034,3,8,DN_PD.blanc,3);g.frus(0,.158,.052,.016,.022,.008,.010,.042,C.or,3);},
  // ANUBIS : le chacal noir, le museau long, la truffe, les deux grandes oreilles droites doublées d'or, les yeux d'or
  chacal:function(g,P){const C=DN_COL,p=DN_PD.basalte,R=DN_TR;g.cyl(0,-.012,-.002,.050,.044,.042,8,p,5);
    g.loft([R(.030,.038,.046,2.2,0,.004),R(.064,.050,.056,2.3,0,.008),R(.100,.054,.058,2.3,0,.010),R(.134,.046,.048,2.3,0,.008),R(.156,.028,.032,2.2,0,.006)],10,p,5,3);
    g.tube([0,.076,.034],[0,.056,.156],.034,.016,7,p,5,1);g.sph(0,.056,.162,.018,.016,.019,3,6,DN_PD.noir,0);g.box(0,.044,.080,.026,.008,.060,DN_PD.noir,0);
    for(const sx of [-1,1]){g.frus(sx*.038,.132,-.012,.060,.030,.012,.010,.160,p,5,sx*.014,-.012);g.frus(sx*.038,.136,.000,.036,.012,.008,.006,.134,C.or,3,sx*.014,-.012);dnOeil(g,sx,.050,.098,.040,.012);g.box(sx*.056,.088,.020,.006,.006,.050,C.or,3);}
    dnLappets(g,[C.lapis,C.or]);},
  // THOT : l'ibis, le long bec courbe qui plonge, le croissant de lune et son disque
  ibis:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR,bk=[.17,.15,.19];g.cyl(0,-.012,-.002,.046,.040,.042,8,p,5);
    g.loft([R(.030,.036,.040,2.2,0,.004),R(.064,.048,.050,2.3,0,.008),R(.100,.050,.050,2.3,0,.008),R(.128,.040,.042,2.3,0,.006),R(.148,.022,.024,2.2,0,.004)],10,p,5,3);
    {const A=[[0,.082,.030],[0,.070,.110],[0,.048,.166],[0,.010,.204],[0,-.036,.214]],r=[.022,.017,.012,.007,.002];for(let i=0;i<4;i++)g.tube(A[i],A[i+1],r[i],r[i+1],6,bk,0,i===3);}
    for(const sx of [-1,1])dnOeil(g,sx,.048,.108,.026,.012);dnLappets(g,[C.lapis,C.or]);
    {const pl=[],R9=.082,r9=.060;for(let i=0;i<=8;i++){const a=3.40+i/8*2.62;pl.push([Math.cos(a)*R9,Math.sin(a)*R9]);}for(let i=8;i>=0;i--){const a=3.40+i/8*2.62;pl.push([Math.cos(a)*r9,Math.sin(a)*r9+.024]);}
      g.push();g.T(0,.226,.010);g.Rx(-Math.PI/2);g.ext(pl,0,.020,C.or,3);g.pop();}
    g.push();g.T(0,.236,0);g.Rx(Math.PI/2);g.cyl(0,-.010,0,.040,.040,.020,12,C.or,3);g.pop();},
  // AMON : le bélier, le nez busqué, les cornes d'or en volute, le disque et l'uræus, deux plumes
  belier:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.042,.050,2.2,0,.004),R(.066,.056,.060,2.3,0,.010),R(.104,.060,.062,2.3,0,.012),R(.138,.050,.052,2.3,0,.010),R(.160,.030,.034,2.2,0,.008)],10,p,5,3);
    g.sph(0,.084,.056,.038,.036,.056,4,8,p,5);g.tube([0,.074,.040],[0,.038,.112],.046,.034,8,p,5,1);g.sph(0,.034,.116,.035,.031,.033,3,8,p,5);for(const sx of [-1,1]){g.box(sx*.016,.036,.146,.010,.012,.008,DN_PD.noir,0);dnOeil(g,sx,.056,.100,.040,.013);g.box(sx*.062,.094,-.040,.020,.044,.026,p,5);}
    for(const sx of [-1,1]){const H=[[sx*.054,.112,.004],[sx*.104,.124,-.030],[sx*.132,.082,-.052],[sx*.116,.032,-.014],[sx*.080,.026,.036]],r=[.028,.026,.021,.015,.006];for(let i=0;i<4;i++)g.tube(H[i],H[i+1],r[i],r[i+1],6,C.or,3,i===3);}
    dnDisque(g,.200,-.004,.060,.026);for(const sx of [-1,1])g.frus(sx*.024,.230,-.010,.034,.022,.026,.014,.140,sx<0?C.lapis:C.turq,3);},
  // SEKHMET : la lionne, le museau large, la truffe, les oreilles rondes, le disque solaire et l'uræus, la perruque
  lionne:function(g,P){const C=DN_COL,p=DN_PD.fauve,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.044,.048,2.2,0,.004),R(.066,.058,.060,2.3,0,.010),R(.104,.064,.064,2.3,0,.012),R(.138,.056,.056,2.3,0,.010),R(.160,.034,.038,2.2,0,.008)],10,p,5,3);
    g.sph(0,.094,-.066,.110,.108,.052,3,8,[.84,.38,.28],5);g.frus(0,.030,.040,.084,.090,.060,.052,.062,p,5,0,.070);g.box(0,.092,.134,.034,.022,.022,DN_PD.noir,0);g.box(0,.042,.146,.046,.006,.010,DN_PD.noir,0);
    for(const sx of [-1,1]){g.sph(sx*.056,.160,-.014,.032,.034,.016,3,6,p,5);dnOeil(g,sx,.052,.104,.046,.012);g.box(sx*.056,.094,.030,.006,.006,.044,DN_PD.noir,0);}
    dnLappets(g,[C.turq,C.or]);dnDisque(g,.208,-.006,.064,.026);},
  // SOBEK : le crocodile, le long museau plat, la bosse du bout, les yeux en bulbes, la mâchoire, deux hautes plumes
  crocodile:function(g,P){const C=DN_COL,p=DN_PD.vert,Z=DN_TZ,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.046,.052,2.2,0,.004),R(.062,.056,.062,2.3,0,.008),R(.094,.052,.056,2.3,0,.006),R(.116,.036,.040,2.2,0,.004)],10,p,5,3);
    g.loft([Z(.030,.050,.036,2.4,0,.062),Z(.090,.043,.030,2.4,0,.058),Z(.150,.036,.026,2.4,0,.054),Z(.200,.034,.028,2.4,0,.054),Z(.224,.020,.017,2.2,0,.050)],8,p,5,3);
    g.loft([Z(.050,.042,.014,2.4,0,.030),Z(.140,.030,.012,2.4,0,.028),Z(.210,.022,.011,2.4,0,.034)],6,DN_PD.crane,5,3);
    for(const sx of [-1,1]){dnOeil(g,sx,.036,.104,.022,.014);g.box(sx*.014,.070,.214,.012,.010,.012,DN_PD.noir,0);}
    dnLappets(g,[C.lapis,C.or]);for(const sx of [-1,1])g.frus(sx*.028,.122,-.010,.040,.024,.030,.014,.200,sx<0?C.azur:C.or,3);dnDisque(g,.140,.016,.038,.018);}
};
/* un dieu assis : le corps du pharaon et la tête de `kind` (peau : la teinte de la pierre de la tête ; s : l'échelle de la tête) — haut ~ 1,05, face à +z */
function dnDieu(kind,seed){const g=dnKit(seed||201),S={faucon:1.55,chacal:1.50,ibis:1.62,belier:1.50,lionne:1.50,crocodile:1.50}[kind]||1.3;dnCorpsAssis(g,8);
  g.push();g.T(0,.744,-.07);g.Sc(S);DN_TETE[kind](g,{peau:DN_PD.crane});g.pop();return g.fin();}
/* LA TÊTE TOMBÉE d'un dieu (les ruines) : le bloc du cou brisé et la tête, haut ~ 1,7, regarde +z */
function dnTeteTombee(kind,seed){const g=dnKit(seed),C=DN_COL;g.box(0,0,0,.62,.20,.54,C.gres,1,1);g.push();g.T(0,.18,0);g.Sc(4.6);DN_TETE[kind](g,{peau:DN_PD.crane});g.pop();return g.fin();}
/* ---- LE SPHINX-CHAT (long 1, face à +z, haut ~ .60, ts = le côté où sa queue s'enroule) : trois livrées ---- */
function dnTeteChat(g,V){const C=DN_COL,p=V.peau,R=DN_TR;
  g.cyl(0,-.040,0,.062,.054,.060,10,p,5);
  g.loft([R(.000,.054,.050,2.3,0,.000),R(.034,.070,.062,2.4,0,.006),R(.070,.076,.066,2.4,0,.008),R(.104,.066,.058,2.3,0,.006),R(.128,.040,.038,2.2,0,.004)],10,p,5,3);       // le crâne large de la chatte
  g.frus(0,.026,.050,.068,.052,.044,.036,.048,p,5,0,.018);g.frus(0,.056,.096,.024,.018,.014,.012,.018,V.nez,0);g.box(0,.028,.108,.034,.007,.010,DN_PD.noir,0);       // le museau, la truffe, la bouche
  for(const sx of [-1,1]){
    g.frus(sx*.054,.098,-.004,.066,.032,.014,.008,.100,p,5,sx*.016,-.008);g.frus(sx*.054,.102,.008,.044,.014,.009,.005,.084,V.oreille,3,sx*.016,-.008);   // l'oreille dressée, son dedans d'or, l'anneau
    g.box(sx*.036,.066,.056,.044,.024,.016,V.khol,3);g.box(sx*.037,.070,.061,.028,.015,.014,V.iris,3);g.box(sx*.052,.070,.048,.044,.009,.014,V.khol,3);                // l'œil en amande, son iris, le trait de khôl qui file vers l'oreille
    g.box(sx*.040,.050,.080,.060,.004,.006,C.or,3);g.box(sx*.040,.040,.080,.060,.004,.006,C.or,3);                                                                   // les vibrisses, en barres d'or
  }
  if(V.disque){dnDisque(g,.150,-.004,.036,.016);}}
function dnSphinxChat(v,ts){const g=dnKit(260+v*7+(ts>0?1:0)),C=DN_COL,R=DN_TR,Z=DN_TZ,
    V=[{c:C.gres,c2:C.gres2,peau:C.gres,nez:[.85,.52,.52],oreille:C.or,khol:C.lapis,iris:C.or,col:[C.or,C.azur,C.turq,C.or],soc:C.gres2},
       {c:DN_PD.basalte,c2:C.granit,peau:DN_PD.basalte,nez:[.20,.14,.15],oreille:C.or,khol:C.or,iris:C.or,col:[C.or,C.turq,C.or,C.lapis],soc:C.gres2},
       {c:[.96,.90,.76],c2:C.gres2,peau:[.96,.90,.76],nez:[.85,.52,.52],oreille:C.turq,khol:C.turq,iris:C.or,col:[C.turq,C.lapis,C.or,C.azur],soc:C.gres,disque:1}][v%3];
  g.box(0,0,.02,.50,.028,1.10,V.soc,1,1);g.box(0,.028,.02,.44,.012,1.04,V.c2,1);
  // le corps : une loge de ronds le long de z — la croupe, le haut des hanches, la taille, les épaules, la poitrine, le départ du cou
  g.loft([Z(-.47,.060,.058,2.4,0,.088),Z(-.37,.138,.124,2.5,0,.152),Z(-.22,.128,.116,2.5,0,.144),Z(-.05,.116,.124,2.5,0,.152),Z(.12,.134,.152,2.5,0,.178),Z(.25,.130,.150,2.4,0,.186),Z(.30,.096,.100,2.3,0,.236)],12,V.c,5,3);
  for(const sx of [-1,1]){g.sph(sx*.108,.100,-.30,.062,.092,.120,4,8,V.c,5);g.box(sx*.098,.034,-.14,.070,.034,.110,V.c2,1);                                                // la hanche, la patte arrière repliée
    g.tube([sx*.086,.100,.10],[sx*.090,.056,.52],.056,.042,8,V.c,5,1);g.sph(sx*.090,.042,.53,.046,.034,.056,3,8,V.c,5);for(const dx of [-.020,.020])g.box(sx*.090+dx,.040,.585,.010,.008,.022,V.c2,1);} // l'avant-bras à plat, la patte, ses griffes
  {const A=[[ts*.030,.102,-.46],[ts*.150,.070,-.50],[ts*.210,.044,-.40],[ts*.220,.040,-.26],[ts*.190,.040,-.15],[ts*.140,.038,-.12]],r=[.028,.026,.022,.019,.015,.008];for(let i=0;i<5;i++)g.tube(A[i],A[i+1],r[i],r[i+1],6,V.c,5,i===4);g.tube([ts*.160,.039,-.125],[ts*.140,.038,-.12],.016,.014,6,C.or,3,1);} // la queue enroulée sur le flanc, son anneau d'or
  g.tube([0,.200,.200],[0,.310,.262],.130,.100,10,V.c,5,1);                                                                                                         // le cou qui se dresse
  g.loft([R(.206,.160,.140,2.4,0,.224),R(.234,.190,.156,2.4,0,.232),R(.262,.190,.152,2.4,0,.240),R(.288,.150,.122,2.3,0,.250),R(.308,.092,.084,2.3,0,.260)],12,[V.col[0],V.col[1],V.col[2],V.col[3]],3,3);   // le collier usekh : quatre bandes
  g.push();g.T(0,.304,.262);g.Sc(1.80);dnTeteChat(g,V);g.pop();
  return g.fin();}
Object.assign(DN_MOD,{
  teteFaucon:function(){return dnTeteTombee('faucon',221);},teteChacal:function(){return dnTeteTombee('chacal',223);},teteIbis:function(){return dnTeteTombee('ibis',225);},
  teteBelier:function(){return dnTeteTombee('belier',227);},teteLionne:function(){return dnTeteTombee('lionne',229);},teteCrocodile:function(){return dnTeteTombee('crocodile',231);},
  dieuFaucon:function(){return dnDieu('faucon',201);},dieuChacal:function(){return dnDieu('chacal',203);},dieuIbis:function(){return dnDieu('ibis',205);},
  dieuBelier:function(){return dnDieu('belier',207);},dieuLionne:function(){return dnDieu('lionne',209);},dieuCrocodile:function(){return dnDieu('crocodile',211);},
  sphinxChat0g:function(){return dnSphinxChat(0,-1);},sphinxChat0d:function(){return dnSphinxChat(0,1);},sphinxChat1g:function(){return dnSphinxChat(1,-1);},sphinxChat1d:function(){return dnSphinxChat(1,1);},
  sphinxChat2g:function(){return dnSphinxChat(2,-1);},sphinxChat2d:function(){return dnSphinxChat(2,1);}});
Object.assign(DN_ECH,{teteFaucon:8,teteChacal:8,teteIbis:8,teteBelier:8,teteLionne:8,teteCrocodile:8,dieuFaucon:30,dieuChacal:30,dieuIbis:30,dieuBelier:30,dieuLionne:30,dieuCrocodile:30,sphinxChat0g:40,sphinxChat0d:40,sphinxChat1g:40,sphinxChat1d:40,sphinxChat2g:40,sphinxChat2d:40});
/* LE TIRAGE (dans le flux du décor, D.sd — jamais le tracé) : les quatre colosses de la place, deux petits dieux pour la porte, la livrée de chaque paire de sphinx-chats ; DN.dieux est relu à chaque construction */
function dnDieuxTirage(){const D=DN.deco,sd=D?D.sd:7;if(DN.dieux&&DN.dieux.sd===sd)return DN.dieux;const rs=mulberry32((sd^0xD1E057)>>>0),A=DN_DIEUX.liste.slice(),P=A.concat(['pharaon']);
  const mel=function(L){for(let i=L.length-1;i>0;i--){const j=(rs()*(i+1))|0,x=L[i];L[i]=L[j];L[j]=x;}return L;};mel(P);mel(A);
  return DN.dieux={sd:sd,col:P.slice(0,4),porte:A.slice(0,2),sph:[(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0],sphD:[(rs()*3)|0],leg:P.slice(4).concat(A)};}
// la tête tombée d'une ruine : au hasard de sa place (jamais du flux du décor), les trois quarts du temps une tête de dieu
function dnTeteNom(p){if(!DN_DIEUX.on)return 'tete';const h=Math.abs(Math.floor(p.x*.173+p.z*.291))%8;return h<6?'tete'+['Faucon','Chacal','Belier','Lionne','Ibis','Crocodile'][h]:'tete';}
function dnNomDieu(k){return DN_DIEUX.nom[k]||'pharaon';}
// le modèle d'un colosse de la place : la clé du tirage (0 à 3) ; d'un sphinx de l'allée : la paire (i), le côté (sg : -1 gauche de la route)
function dnColosseNom(i){return DN_DIEUX.on?dnNomDieu(dnDieuxTirage().col[i&3]):'pharaon';}
function dnSphinxNom(i,sg){if(!DN_DIEUX.on)return 'sphinx';const T=dnDieuxTirage();return 'sphinxChat'+T.sph[i%T.sph.length]+(sg<0?'g':'d');}
function dnLegNom(m){if(!DN_DIEUX.on)return m.k==='sphinx'?'sphinx':'colosse';const T=dnDieuxTirage();if(m.k==='sphinx')return 'sphinxChat'+T.sphD[0]+(Math.sin(m.t-m.a)<0?'g':'d');return dnNomDieu(T.leg[(Math.abs(Math.round(m.x*.37+m.z*.61)))%T.leg.length]);}
