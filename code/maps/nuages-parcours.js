/* ===== LE PARCOURS CARTE POSTALE (2026-11-13, Sacha : « la génération de maps dans les nuages, elle est nulle. Ça va tout droit, ça descend bêtement […] il faut des virages,
   qu'il se passe des trucs, qu'on aille en dessous, que ça tourne d'un coup ; exploite l'environnement, les nuages : un virage derrière un gros nuage, on voit pas où ça va ; et puis
   on descend ; une longue spirale qui va loin ; on passe au-dessus des nuages la tête en dessous, on revient à l'endroit, et on descend d'un coup, en mode parc Astérix, comme une
   montagne russe ; un effet carte postale, contemplatif, une sensation de liberté comme dans Dragons ; plein de modules, de la variété, qu'on sache pas où la route va nous mener »,
   puis « fais ça de manière très optimisée, en one shot, prends ton temps, pas de bug ») =====
   MESURÉ AVANT (banc outils/banc-routes/parcours.cjs, `?parcours=0`, 10 graines) : la route plongeait de 36-38° PARTOUT (la pente était une règle), en plongée de plus de 40° 40-46 % du
   temps, deux ou trois modules par route, des tenues droites jusqu'à 8-9 s, et le cap borné à 150° de l'axe : ni spirale, ni épingle, ni passage sous la route.
   LA ROUTE EST DÉSORMAIS UNE SUITE DE TABLEAUX, reliés par des liaisons courtes qui tournent toujours (1,2-2,2 s de croisière, jamais une droite) :
     · chaque tableau est DESSINÉ TEL QU'ON LE VERRA : son plan (les virages), son profil VRAI (l'assiette par rapport à l'horizon : une chute de 55°, une spirale à 26°, un plat
       au ras des nuages), ses roulis (la dalle qui se retourne), ses dévers (la dalle relevée dans une épingle) et SES nuages. Il est marqué `plat` : pisteTord le rejoue tel quel ;
     · la pente n'est plus une règle : le dessin la porte (genCtrl dessine la descente, 34° dans les liaisons — `NUA_PC.tan` — et pisteTord ne l'ajoute plus) ;
     · le cap est libre : la route tourne sur elle-même (la spirale), revient (les lacets), passe sous elle-même (le pont).
   LES TABLEAUX (`?tableau=spirale` : tous les tableaux de la route sont celui-là — banc) :
     ACCROCHE  · LE RIDEAU (rideau)        · on fonce sur une tour de ouate ; la route vire SERRÉ juste devant elle (100-128°, dalle relevée à 40°) et disparaît DERRIÈRE ; elle
                                            reparaît en plongeant d'un coup (crête, ~58°) au travers d'une nappe — pouf
     VERTIGE   · LA SPIRALE (spirale)      · l'escalier du géant : 1,1 à 1,5 tour autour d'une colonne de nuages, à 24-29°, la dalle relevée de 31° vers l'intérieur ; à chaque tour
                                            on passe 350-500 m sous le précédent ; on en sort au travers d'une nappe — la spirale qui va loin
               · LE PONT (pont)            · une boucle de 270° presque à plat : la route repasse SOUS elle-même (74-135 m de vide selon le palier) — on se voit passer au-dessus
     VOLTIGE   · LA VOLTIGE (voltige)      · la route se redresse à l'horizontale ; dans une longue courbe la dalle se retourne vers l'intérieur : la tête en bas au-dessus d'une MER
                                            de nuages (leurs sommets 46-62 m sous la dalle) ; elle revient à l'endroit… puis la crête, et la chute de 52-58° au travers d'une nappe
     CHUTE     · LE GRAND HUIT (grandHuit) · la montée en courbe (on ne voit plus que le ciel), la crête, la chute de 54-60° au travers d'une nappe, la bosse (un mouton au sommet :
                                            pouf), une ligne pour se poser, le virage relevé
               · LE TOBOGGAN (toboggan)    · une plongée de 46-52°, trois nappes traversées d'affilée (pouf, pouf, pouf : la petite gamme qui monte)
               · LE PLAFOND (plafond)      · on plonge au travers d'une couche épaisse et l'on file DESSOUS, en descente douce (18-22°), sous un plafond de stratus (leur dessous
                                            44-62 m au-dessus de la dalle) — aller en dessous des nuages
     DANSE     · LES LACETS DU COL (lacetsCol) · deux ou trois épingles de 155-170° qui descendent, dalle relevée à 52° (un bobsleigh), une tour au cœur de chacune : vue d'avion, un col
               · LE LOOPING (looping)      · un looping au milieu du ciel, entre deux nuages
     VISTA     · LA GRANDE COURBE (grandeCourbe) · 130-165° d'un seul geste au large d'un massif, à 22-26° de pente, dalle penchée de 29° : on regarde le ciel tourner — la carte postale
   et, du paquet des modules des nuages (nuages-modules.js), ceux qui TOURNENT : le virage caché, le double rideau, l'épingle, le slalom des tours, les chicanes, le mur de ouate, le
   tour du géant, le grand S, au ras de la mer, le balcon, le canyon, le tunnel, l'anneau, la cascade (la porte des titans, le ruban et la plongée dans la couche, de longues droites,
   sont laissés de côté).
   LA DRAMATURGIE (le programme d'une route, tiré selon sa durée) : ACCROCHE → VERTIGE → VOLTIGE, l'enchaînement de Sacha, au cœur de chaque route assez longue, entouré de DANSE,
   de VISTA et de CHUTE ; jamais deux fois le même tableau dans une route ; l'ouverture (le départ tenu de pisteTord) et la fin jouent des modules qui ne roulent pas la dalle, puis
   L'ARRIVÉE (des courbes entre deux haies de nuages, taillées à la place qui reste) ; le surf (le climax d'avant) en finale s'il tient. Les routes rapides (~30 s) jouent deux ou trois tableaux.
   LA SÉCURITÉ DU SAUT : les chutes sont DROITES en plan (une chute qui vrille dérobait la route sous un saut, de côté) et le saut est refusé là où la route se déroberait sous le vol
   (nuaSautRefuse, route-sans-haut.js : le regard devant, plus loin nitro tenue) — banc outils/banc-routes/vols-sim.cjs : aucun saut mortel permis, du palier 0 au palier 27.
   `?parcours=0` : la route d'avant (la grande descente, ses modules, ses circuits) · `dbgParcours()` : le programme et les tableaux de la route en cours. */
const NUA_PC={on:typeof location==='undefined'||!/[?&]parcours=0\b/.test(location.search),tan:.68,der:null,
  seul:(function(){const m=typeof location!=='undefined'&&/[?&]tableau=([a-zA-Z]+)/.exec(location.search);return m?m[1]:'';})()};
if(NUA_PC.on)Object.assign(RYTHME_CIBLES.nuages,{penteMax:1.6,cretesFig:0,serre:0,droiteF:[0,.3]}); /* le directeur de rythme ne compte plus les chutes des tableaux comme des fautes (elles sont voulues), ni l'absence de droite franche (le parcours tourne) : le premier dessin est presque toujours gardé — la variété du tirage reste entière (MESURÉ : le meilleur-de-6 préférait les routes qui s'ouvraient par une longue approche droite) */
function nuaParcours(K){
  const rf=K.rf,T=K.T,rP=K.rP,G=NUA_GENRES,DG=Math.PI/180,pA=-Math.atan(NUA_PC.tan),KL=Math.hypot(1,NUA_PC.tan),kC=.6+.4*(K.kR==null?1:K.kR); /* pA : l'assiette des liaisons (−34°) · KL : ce que la pente allonge le chemin · kC : la part de chute gardée à haut palier */
  /* L'ATELIER : `E` dessine pour de vrai ; `atelier(1)` dessine À BLANC — il ne fait que mesurer (la durée du tableau en secondes de croisière, chaque tirage à sa valeur médiane) */
  const atelier=function(sec){let NU=[],L=0;
    return {sec:sec,
      U:sec?function(a,b){return (a+b)*.5;}:function(a,b){return a+(b-a)*rf();},
      sg:sec?function(){return 1;}:function(){return rf()<.5?1:-1;},
      aD:sec?function(l){L+=l;}:K.aD,
      aC:sec?function(a,R,p0,p1){L+=Math.abs(a)*DG*R/Math.max(.3,Math.cos((p0+p1)/2));}:K.aC,
      boucle:sec?function(s,Rl){L+=2*Math.PI*Rl;}:K.boucle,
      ix:sec?function(){return 0;}:K.i,
      nuage:function(t,s,o){if(!sec)NU.push(Object.assign({i:K.i(),t:t,s:s},o||{}));},
      fin:function(nom,x){const m=Object.assign({g:1,plat:1,fig:'nu-'+nom,nu:NU},x||{});NU=[];return m;},
      duree:function(){const d=L/T;L=0;return d;}};};
  const M={};
  /* ACCROCHE — LE RIDEAU */
  M.rideau=function(E){const s=E.sg(),a=E.U(100,128),R=E.U(1.9,2.1)*rP,pt=pA*.55,kb=.7,pd=pA-E.U(22,27)*DG*kC;
    E.aD(1.2*T,pA,pA,3);const ia=E.ix();E.aD(.45*T,pA,pt);const i0=E.ix(); /* l'approche : on fonce sur la tour, la dalle se relève */
    E.aC(s*a*.5,R,pt,pt);E.nuage('cote',s,{r:[210,270],e:24,d0:R-20,b:.42,g:G.tour});E.aC(s*a*.5,R,pt,pt);const i1=E.ix(); /* la tour AU-DELÀ du cœur du virage : vue de l'approche, la route passe derrière */
    E.aD(.4*T,pt,pt);const ic=E.ix();E.aD(.7*T,pt,pd); /* la dalle revient à plat AVANT la crête */
    E.aD(.55*T,pd,pd);E.nuage('nappe',0,{r:[110,150]});E.aD(.55*T,pd,pd);E.aD(.9*T,pd,pA);E.nuage('cote',-s,{r:[90,130],e:30,b:.5,g:G.cum}); /* la chute, DROITE en plan : un saut qui s'envolerait retrouve la route sous lui (une chute qui vrille la dérobait de côté — MESURÉ au banc des sauts) */
    return E.fin('rideau',{nom:'le rideau',c:[[ia,i0,-s*kb],[i1,ic,s*kb]]});};
  /* VERTIGE — LA SPIRALE */
  M.spirale=function(E){const s=E.sg(),R=E.U(1.95,2.2)*rP,Re=R*1.3,ps=-E.U(24,29)*DG,tr=K.court?E.U(260,320):E.U(300,400),kb=.55,n=Math.max(3,Math.round(tr/110));
    E.aD(.4*T,pA,pA);const ia=E.ix();E.aC(s*50,Re,pA,ps);const ib=E.ix(); /* l'entrée : le rayon se resserre, la pente s'adoucit, la dalle se relève */
    for(let k=0;k<n;k++){E.aC(s*tr/n*.5,R,ps,ps);E.nuage('coeur',s,{R:R,r:[75,115],g:k%2?G.tour:G.cum});E.aC(s*tr/n*.5,R,ps,ps);if(k%2===0)E.nuage('cote',-s,{r:[55,85],e:34,b:.5,g:G.petit});} /* la colonne : un nuage au cœur tous les ~110°, chacun à la hauteur du tour */
    const ic=E.ix();E.aC(s*50,Re,ps,pA);const id=E.ix();E.aD(.3*T,pA,pA);E.nuage('nappe',0,{r:[120,160]});E.aD(.4*T,pA,pA); /* la sortie, au travers d'une nappe */
    return E.fin('spirale',{nom:'la spirale',c:[[ia,ib,-s*kb],[ic,id,s*kb]]});};
  /* VERTIGE — LE PONT */
  M.pont=function(E){const s=E.sg(),R=E.U(1.9,2.1)*rP,pf=-E.U(6,9)*DG,pl=-E.U(5,8)*DG,kb=.5;
    E.aD(.7*T,pA,pf);E.aD(R+.25*T,pf,pf,4);const ia=E.ix(); /* la route d'en haut : presque à plat, sur une longueur de rayon — c'est sous elle qu'on repassera */
    E.aC(s*30,R,pf,pl);const ib=E.ix();E.aC(s*105,R,pl,pl);E.nuage('coeur',s,{R:R,r:[70,110],g:G.tour});E.aC(s*105,R,pl,pl);const ic=E.ix();E.aC(s*30,R,pl,pl);const id=E.ix();
    E.aD(R+.3*T,pl,pl,4);E.aD(.8*T,pl,pA);E.nuage('cote',-s,{r:[110,160],e:40,b:.5,g:G.cum});
    return E.fin('pont',{nom:'le pont',c:[[ia,ib,-s*kb],[ic,id,s*kb]]});};
  /* VOLTIGE — LA TÊTE EN BAS AU-DESSUS DE LA MER, PUIS LA CHUTE */
  M.voltige=function(E){const Tr=4.3*T/(K.sR||.5),sj=E.sg(),ar=E.U(32,38),Rr=Tr/(2*ar*DG),a2=E.U(32,44),pd=-(E.U(52,58)*kC+31*(1-kC))*DG,R=3.2*rP;
    /* la dalle se retourne AUTOUR de la route pendant qu'elle tourne : le tracé reste celui qu'on a dessiné, à l'horizontale au ras de la mer. Un demi-tour en 4,3 s À LA VITESSE RÉELLE (K.sR :
       les secondes réelles d'une unité T), ~42°/s — sous les 44°/s de LES ROULIS À LA VITESSE RÉELLE (pisteTord ; la charte R3 : un demi-tour ≥ 3 s ; il se faisait en 1,1 s, à 162°/s) ;
       la courbe s'élargit d'autant (64-76° par demi-tour, au rayon qu'il faut : une longue courbe de carte postale, la tête en bas ~5 s).
       Elle roule VERS L'INTÉRIEUR de la courbe (−sj) et revient par le même chemin (+sj) : sur la tranche, la dalle porte la caisse comme le mur d'un vélodrome — roulée vers l'extérieur, la route
       se dérobait sous elle (MESURÉ : un saut y était refusé presque partout, voir nuaSautRefuse) */
    const mer=function(){E.nuage('dessous',0,{r:[120,170],prof:[46,62],g:G.plat});};
    E.aD(.8*T,pA,0);E.aD(.3*T,0,0);mer();const ia=E.ix();E.aC(sj*ar,Rr,0,0);mer();E.aC(sj*ar,Rr,0,0);const ib=E.ix(); /* on se redresse à l'horizontale ; la dalle se retourne dans une longue courbe */
    E.aC(-sj*a2*.5,R,0,0);mer();E.aC(-sj*a2*.5,R,0,0);mer(); /* la tête en bas, au ras des sommets */
    const ic=E.ix();E.aC(sj*ar,Rr,0,0);mer();E.aC(sj*ar,Rr,0,0);const id=E.ix(); /* on revient à l'endroit, en tournant encore */
    E.aD(.3*T+.08*Tr,0,0);E.aD(.75*T,0,pd); /* (le coucher borné finit un peu après sa courbe : la droite l'attend) LA CRÊTE : la montagne russe (le saut y est refusé par le regard devant : nuaSautRefuse) */
    E.aD(.6*T,pd,pd);E.nuage('nappe',0,{r:[120,170]});E.aD(.7*T,pd,pd);E.aD(.9*T,pd,pA); /* la chute, droite en plan, au travers d'une nappe */
    return E.fin('voltige',{nom:'la voltige',c:[[ia,ib,-sj*Math.PI],[ic,id,sj*Math.PI]],vif:1});};
  /* CHUTE — LE GRAND HUIT */
  M.grandHuit=function(E){const s=E.sg(),pu=E.U(9,13)*DG,pd=-(E.U(54,60)*kC+31*(1-kC))*DG,pc=E.U(14,18)*DG*kC,pe=-E.U(30,36)*DG,a=E.U(80,110),R=2.4*rP,kb=.6;
    E.aD(1.0*T,pA,pu);E.aC(s*E.U(20,30),4*rP,pu,pu);E.aD(.85*T,pu,pd); /* la montée, en courbe : on ne voit plus que le ciel ; la crête */
    E.aD(.6*T,pd,pd);E.nuage('nappe',0,{r:[120,170]});E.aD(.7*T,pd,pd); /* la chute, droite en plan, au travers d'une nappe */
    E.aD(1.0*T,pd,pc);E.aC(s*E.U(16,24),4.5*rP,pc,pc);E.nuage('mouton',0,{r:[22,28]});E.aD(.7*T,pc,pe);E.aD(.8*T,pe,pe); /* la bosse, un mouton à son sommet ; puis une ligne droite où l'on se pose avant le virage */
    const i4=E.ix();E.aC(s*a*.5,R,pe,(pe+pA)/2);const i5=E.ix();E.aC(s*a*.5,R,(pe+pA)/2,pA);const i6=E.ix();E.nuage('cote',-s,{r:[120,170],e:30,b:.5,g:G.cum}); /* le virage relevé */
    return E.fin('grand-huit',{nom:'le grand huit',c:[[i4,i5,-s*kb],[i5,i6,s*kb]]});};
  /* CHUTE — LE TOBOGGAN */
  M.toboggan=function(E){const s=E.sg(),pt=-(E.U(46,52)*kC+31*(1-kC))*DG;
    E.aD(.4*T,pA,pA);E.aD(.7*T,pA,pt);
    for(let k=0;k<3;k++){E.aD(.55*T,pt,pt);E.nuage('nappe',0,{r:[110,150]});} /* trois nappes d'affilée, la plongée droite en plan */
    E.aD(1.0*T,pt,pA);E.nuage('cote',s,{r:[150,220],e:40,b:.5,g:G.tour});
    return E.fin('toboggan',{nom:'le toboggan'});};
  /* CHUTE — LE PLAFOND */
  M.plafond=function(E){const s=E.sg(),pd=-E.U(40,46)*DG,pp=-E.U(18,22)*DG,R=3*rP,a1=E.U(50,70),a2=E.U(60,85);
    const pl=function(){E.nuage('plafond',0,{r:[130,180],h:[44,62],g:G.plat});};
    E.aD(.4*T,pA,pA);E.aD(.5*T,pA,pd);
    E.aD(.45*T,pd,pd);E.nuage('nappe',0,{r:[150,200]});E.aD(.45*T,pd,pd);E.aD(.8*T,pd,pp); /* au travers de la couche */
    E.aC(s*a1*.5,R,pp,pp);pl();E.aC(s*a1*.5,R,pp,pp);pl();E.aD(.3*T,pp,pp);pl();E.aC(-s*a2*.5,R,pp,pp);pl();E.aC(-s*a2*.5,R,pp,pp);pl(); /* dessous : le plafond de ouate */
    E.aD(1.2*T,pp,pA); /* la sortie : la pente revient à celle des liaisons. Dessous on file à 18-22° (et non presque à plat) : la crête de sortie ne perd plus que ~14° — à 24°, un vol plané (nitro tenue) parti avant elle s'envolait au-dessus de la descente (MESURÉ : vols-sim.cjs) */
    return E.fin('plafond',{nom:'le plafond'});};
  /* DANSE — LES LACETS DU COL */
  M.lacetsCol=function(E){let s=E.sg();const n=K.court?2:(E.sec?2:(rf()<.35?3:2)),R=E.U(1.85,2.05)*rP,ph=-E.U(12,16)*DG,pl=pA*1.12,kb=.9,C=[];
    E.aD(.4*T,pA,pl);
    for(let k=0;k<n;k++){const th=E.U(155,170);E.aD(E.U(.6,.9)*T,pl,pl);const ia=E.ix();E.aC(s*th*.25,R,pl,ph);const ib=E.ix();E.aC(s*th*.25,R,ph,ph);E.nuage('coeur',s,{R:R,r:[70,110],g:G.tour});
      E.aC(s*th*.25,R,ph,ph);const ic=E.ix();E.aC(s*th*.25,R,ph,pl);const id=E.ix();E.nuage('cote',-s,{r:[50,80],e:28,b:.55,g:G.petit});
      C.push([ia,ib,-s*kb],[ic,id,s*kb]);s=-s;} /* l'épingle se prend relevée, à plat (12-16°) ; on peut y sauter : avec le volant en l'air on se repose dans l'épingle (MESURÉ, vols-sim.cjs) */
    E.aD(.5*T,pl,pA);
    return E.fin('lacets-col',{nom:'les lacets du col',c:C});};
  /* DANSE — LE LOOPING */
  M.looping=function(E){const s=E.sg(),Rl=Math.max(110,Math.min(420,(.85*K.vD+40)*K.kT));
    E.aD(.9*T,pA,0);E.aD(.4*T,0,0);const i0=E.ix();E.boucle(s,Rl);const i1=E.ix();E.aD(.5*T,0,0);E.aD(.9*T,0,pA);
    E.nuage('cote',s,{r:[120,170],e:40,b:.3,g:G.cum});E.nuage('cote',-s,{r:[120,170],e:40,b:.3,g:G.cum});
    return E.fin('looping',{nom:'le looping',ss:[[i0,i1]]});};
  /* VISTA — LA GRANDE COURBE */
  M.grandeCourbe=function(E){const s=E.sg(),a=E.U(130,165),R=E.U(3.6,4.3)*rP,pc=-E.U(22,26)*DG,kb=.5; /* 22-26° : la sortie vers les liaisons (34°) ne perd que ~10° — une crête de sortie plus forte refusait le saut sur toute la fin de la courbe */
    E.aD(.5*T,pA,pc);const ia=E.ix();E.aC(s*a*.2,R,pc,pc);const ib=E.ix();E.aC(s*a*.3,R,pc,pc);E.nuage('coeur',s,{R:R,r:[150,240],g:G.tour});E.nuage('cote',-s,{r:[220,300],e:170,b:.3,g:G.plat});
    E.aC(s*a*.3,R,pc,pc);const ic=E.ix();E.aC(s*a*.2,R,pc,pc);const id=E.ix();E.aD(.6*T,pc,pA);
    return E.fin('grande-courbe',{nom:'la grande courbe',c:[[ia,ib,-s*kb],[ic,id,s*kb]]});};
  /* RACCOURCI — LA BOUCLE et LE STADE (2026-11-13, la charte des routes : « des sauts à faire pour apprendre des raccourcis ») : la route fait le tour d'un nuage — un cercle (la boucle) ou un
     ovale de circuit (le stade : deux épingles du même côté et la ligne droite du retour) — en descendant de D m, et ressort EXACTEMENT sous la lèvre, dans le même sens, sur une piste de pose
     droite et longue. Qui va tout droit (le saut nitro, ou sortir par le bord) survole le tour et se pose sur la piste, à toute vitesse (la piste couvre le vol le plus long, 1,8 × la croisière,
     saut compris) ; qui roule fait le tour du nuage et passe SOUS la route d'où les autres ont sauté. La lèvre et la pose sont marquées (racs → MODMARK {rac:1, i0 : la lèvre, i1 : la pose}).
     D : 70-90 m (une chute de 2,5-2,8 s depuis le bord) — assez pour passer dessous (le vide entre les deux routes ≥ D), assez peu pour ne jamais voler trop longtemps. Le tour est À PLAT (sans dévers) :
     la caisse qui sort par le bord tombe « sous SA dalle » (la gravité de la route quittée) — relevé, il la jetait de biais, hors de la piste (MESURÉ : raccourcis-nuages.cjs). La piste de pose : droite
     jusqu'où se pose le plus lent, puis une courbe douce jusqu'où se pose le plus rapide (au plus ±20° de volant en l'air), puis la pente revient. */
  const raccourci=function(E,stade){const s=E.sg(),s2=E.sg(),R=(stade?E.U(1.6,1.8):E.U(1.7,1.95))*rP, /* (R6) plus serrés qu'au premier jet (1,9-2,3 rP) : la route longue tient la voltige, un raccourci ET un pli */D=E.U(70,90),lr=stade?E.U(1.1,1.5)*T:0,Lt=2*Math.PI*R+2*lr,pl=-Math.atan(D/Lt);
    E.aD(.7*T,pA,pl);E.aD(.5*T,pl,pl,2);const iL=E.ix(); /* l'approche : la route se calme et file vers la lèvre */
    if(stade){ /* deux épingles du MÊME côté et la ligne droite du retour : on revient sur la ligne de l'approche, lr m derrière la lèvre — on passe dessous, et l'on file vers la piste de pose */
      E.aC(s*45,R,pl,pl);E.aC(s*90,R,pl,pl);E.nuage('coeur',s,{R:R,r:[70,105],g:G.tour});E.aC(s*45,R,pl,pl); /* l'épingle de l'aller */
      E.aD(lr*.5,pl,pl,2);E.nuage('cote',s,{r:[90,130],e:Math.max(30,R-ROAD_HALF-110),b:.5,g:G.cum});E.aD(lr*.5,pl,pl,2); /* la ligne droite du retour, un nuage au milieu du stade */
      E.aC(s*45,R,pl,pl);E.aC(s*90,R,pl,pl);E.nuage('coeur',s,{R:R,r:[70,105],g:G.tour});E.aC(s*45,R,pl,pl); /* l'épingle du retour */
      E.aD(lr,pl,pl,3);E.aD(1.5*T,pl,pl,3);const iP=E.ix();E.aD(2.3*T,pl,pl,4);E.aC(s2*24,6*rP,pl,pl);E.aD(1.0*T,pl,pA); /* sous la lèvre, puis la piste de pose (droite, puis une courbe douce) */
      return E.fin('stade',{nom:'le stade',racs:[[iL,iP]]});}
    E.aC(s*45,R,pl,pl);E.aC(s*90,R,pl,pl);E.nuage('coeur',s,{R:R,r:[85,125],g:G.tour});E.aC(s*90,R,pl,pl);E.nuage('coeur',s,{R:R,r:[70,110],g:G.cum});E.aC(s*90,R,pl,pl);E.aC(s*45,R,pl,pl);
    E.aD(1.5*T,pl,pl,3);const iP=E.ix();E.aD(2.3*T,pl,pl,4);E.aC(s2*24,6*rP,pl,pl);E.aD(1.0*T,pl,pA); /* la piste de pose, sous la lèvre : droite, puis une courbe douce ; puis la pente revient */
    return E.fin('boucle',{nom:'la boucle',racs:[[iL,iP]]});};
  M.boucle=function(E){return raccourci(E,0);};M.stade=function(E){return raccourci(E,1);};
  /* ---- LE PAQUET : les tableaux et les modules des nuages qui tournent, par rôle (le poids de chacun) ---- */
  const O=K.NUA?K.NUA.M:{},POOL={
    A:{rideau:4,virageCache:2,doubleCache:2,epingle:1},
    V:{spirale:5,pont:3},
    O:{voltige:1},
    R:{boucle:1,stade:1},
    P:{lacetsCol:4,looping:2,pont:1}, /* (la charte R6) LE PLI : un tableau où la route se replie sous elle-même et qu'on saute tout droit, à toutes les vitesses (MESURÉ au juge, 24 graines : les lacets 5 fois sur 6, le looping 2 sur 2 ; la spirale et le pont presque jamais — un saut sans volant ne retombe pas sur un étage circulaire) */
    C:{grandHuit:4,plafond:3,toboggan:2,cascade:1},
    D:{lacetsCol:4,slalomTours:2,chicanes:2,looping:2,murOuate:1,tourGeant:1,esseGeante:1},
    W:{grandeCourbe:4,rasMer:2,balcon:1,canyonOuate:1,tunnel:1,anneau:1}},
    FINAL={virageCache:2,doubleCache:2,chicanes:2,slalomTours:2,epingle:1,murOuate:1,esseGeante:1,rasMer:1,canyonOuate:1,tunnel:1,balcon:1}, /* les modules de l'arrivée : aucun ne roule ni ne couche la dalle */
    OUVRE={chicanes:2,slalomTours:2,esseGeante:2,murOuate:1,rasMer:1,canyonOuate:1,tunnel:1}; /* ceux de l'ouverture, pendant le départ tenu (pas de virage caché : l'accroche vient juste après) */
  /* la durée d'un module des nuages : le même module, dessiné à blanc (son propre paquet, sans hasard) */
  const dO={L:0},NUAd=K.NUA?nuaModules({rf:function(){return .5;},fS:function(l){dO.L+=l;},fA:function(a,R){dO.L+=Math.abs(a)*DG*R;},i:function(){return 0;},T:T,rP:rP,dev:function(){return 0;},court:K.court,kR:K.kR}):null;
  const blanc=atelier(1),DUR={};
  const duree=function(nm){if(DUR[nm]!=null)return DUR[nm];let d=1e9;
    if(M[nm]){M[nm](blanc);d=blanc.duree()*1.05;}else if(NUAd&&NUAd.M[nm]){dO.L=0;NUAd.M[nm]();d=dO.L/T*KL*1.02;} /* un module des nuages se dessine en plan : la pente des liaisons (KL) allonge son chemin */
    return (DUR[nm]=d+.2);};
  const deja={},E=atelier(0),poses=[]; /* poses : les tableaux posés, {nm, mk : leur marque (MODMARK)} — le climax s'y choisit à la fin */
  const pioche=function(P9,place,tous){const C=[];let S=0; /* un nom du paquet P9, au poids, parmi ceux qui tiennent dans « place » (s) et n'ont pas encore joué */
    for(const nm in P9){if((!tous&&deja[nm])||(!M[nm]&&!O[nm])||duree(nm)>place)continue;C.push(nm);S+=P9[nm];}
    if(!C.length)return null;let u=rf()*S;for(const nm of C){u-=P9[nm];if(u<=0)return nm;}return C[C.length-1];};
  const tire=function(role,place){
    if(NUA_PC.seul){const nm=NUA_PC.seul;return (M[nm]||O[nm])&&duree(nm)<=place?nm:null;} /* (banc) ?tableau=… : celui-là à chaque place, s'il tient */
    return pioche(POOL[role],place);};
  /* jouer un tableau ; lim : s'il finit à moins de « lim » s de la place gardée au bout (K.reste), il est DÉFAIT (le dessin, ses marques) — un tableau ne déborde jamais sur
     l'arrivée tenue à l'endroit, où pisteTord ne le jouerait pas (ni chute, ni retournement) */
  const joueUn=function(pose,nm,lim){const v=lim!=null?K.sauve():null,n0=poses.length;deja[nm]=1;poses.push({nm:nm,mk:pose(M[nm]?function(){return M[nm](E);}:O[nm])});cum=0;
    if(v&&K.reste()<lim){K.rends(v);poses.length=n0;return false;}return true;};
  /* LES LIAISONS : des virages à la pente des liaisons, jamais une droite — un virage franc (55-100°), un coup de volant (75-110° à 1,55-1,8 rP), une esse (35-60° deux fois) ou un balayage (28-45° au large) */
  /* LE CAP QUI CHANGE (2026-11-13, la charte des routes R1, Sacha : « jamais plus de 10 s dans la même direction »). Le juge mesure, depuis chaque point, combien de temps le cap reste à ±30°
     de celui de ce point : un slalom (±25° autour d'un même axe) le tient indéfiniment. Ici, l'ÉVENTAIL des caps depuis l'instant tR (unités T) : capR, le cap de référence, et lo/hi, les
     écarts extrêmes vus depuis ; dès qu'il couvre 60° (alors, de n'importe quel point, un cap est à plus de 30°), la fenêtre repart d'ici. Une liaison qui arrive après plus de 4 s RÉELLES
     sans cet éventail s'ouvre par un VIRAGE FRANC (65-100°), du côté qui SORT de l'éventail — sans lui, un module en slalom, une esse puis un tableau droit tenaient le cap 10-12 s
     (MESURÉ, banc juge : paliers 0 et 20). */
  let cum=0,capR=null,tR=0,cLo=0,cHi=0;const capW=4/(K.sR||.5),capT=K.total(),capJ=[]; /* capJ : (banc) le journal des liaisons — [t (unités T), écart au cap de référence, éventail bas, haut (°), virage franc] */
  const capEc=function(){let d=K.cap()-capR;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
  const capVu=function(){if(!K.cap)return;const t=capT-K.total();if(capR===null){capR=K.cap();tR=t;cLo=cHi=0;return;}const d=capEc();cLo=Math.min(cLo,d);cHi=Math.max(cHi,d);if(cHi-cLo>=60*DG){capR=K.cap();tR=t;cLo=cHi=0;}};
  const liaison=function(d){let t=0,n=0;capVu();let fr=!!K.cap&&capT-K.total()-tR>capW;const sF=fr?(capEc()-cLo>=cHi-capEc()?1:-1):0; /* le virage franc sort de l'éventail par le bord le plus proche */if(K.cap)capJ.push([+(capT-K.total()).toFixed(1),Math.round(capEc()/DG),Math.round(cLo/DG),Math.round(cHi/DG),fr?sF:0]);
    while(t<d-.25&&n++<8){const u=fr?0:rf();let s=rf()<.5?1:-1;if(fr)s=sF;else if(Math.abs(cum+s*90)>200)s=-s; /* jamais une spirale par accident : au plus ~200° du même côté */
      let a,R;if(fr){a=65+rf()*35;R=(1.9+rf()*.7)*rP;}else if(u<.36){a=55+rf()*45;R=(1.9+rf()*.7)*rP;}else if(u<.56){a=75+rf()*35;R=(1.55+rf()*.25)*rP;}else if(u<.8){a=35+rf()*25;R=(2.1+rf()*.6)*rP;}else{a=28+rf()*17;R=(4+rf()*1.2)*rP;} /* un virage franc · un COUP DE VOLANT (serré : ça tourne d'un coup) · une esse · un balayage */
      const k2=!fr&&u>=.56&&u<.8?2:1;let tt=a*DG*R/T*KL;
      if(tt*k2>d-t+.5){a=Math.max(fr?60:28,a*(d-t+.3)/(tt*k2));tt=a*DG*R/T*KL;} /* jamais beaucoup plus long que ce qu'il reste : le dernier virage se resserre en angle (28° au moins : pas de douille ; 60° pour le virage franc) */
      K.aC(s*a,R,pA,pA);cum+=s*a;t+=tt;fr=false;
      if(k2===2){s=-s;K.aC(s*a,R,pA,pA);cum+=s*a;t+=tt;}}
    capVu();return t;};
  /* L'ARRIVÉE (un module qui ne roule pas la dalle : pisteTord y tient la route à l'endroit, le portail au bout) : de grandes courbes alternées à 3,2 rP, une porte de nuages à chaque
     demi-courbe — la haie d'honneur — jusqu'à 1,5 s du portail (rien ne le masque) ; taillée à la durée `d` qui reste */
  const arrivee=function(d){const NU=[],R=3.2*rP;let s=rf()<.5?1:-1,t=0,k=0; /* nom : 'l'arrivée' */
    while(t<d-.4&&k++<6){const a=Math.max(28,Math.min(75,(d-t)*T/(R*DG*KL)));K.aC(s*a*.5,R,pA,pA);t+=a*.5*DG*R/T*KL;if(t<d-1.5)NU.push({i:K.i(),t:'porte',s:0,r:[70,105],e:22,b:.5,g:G.cum});K.aC(s*a*.5,R,pA,pA);t+=a*.5*DG*R/T*KL;s=-s;}
    return {fig:'nu-arrivee',nom:'l\'arrivée',nu:NU};};
  const joue=function(pose){
    const prog=[],B0=K.reste();
    /* LE PROGRAMME : les rôles de la route, mélangés par graine — deux raccourcis sur une route longue (un sur une route moyenne), la voltige deux fois sur trois ; une fois sur trois
       l'enchaînement de Sacha (ACCROCHE → VERTIGE → VOLTIGE) au cœur, d'un seul tenant. Jamais deux fois le même tableau dans une route (deja). */
    const dO=duree('voltige');let vo=false,pli=false,coeur=false; /* (R3) la voltige dure ~13 s réelles (deux demi-tours de 4,3 s) : tirée seulement si la route a la place (dO + 8), et moins souvent quand elle en prendrait plus du tiers */
    {const mele9=function(t){for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}return t;};
      vo=B0>=dO+8&&rf()<(B0>=2.5*dO?.6:.4);coeur=vo&&B0>=dO+30&&rf()<.3;const R9=mele9((B0>=58?['A','V','C','D','W']:B0>=36?['A','V','C','D']:B0>=20?['A','C','D']:['C','A']).concat(vo&&!coeur?['O']:[]));
      if(coeur){R9.splice(R9.indexOf('A'),1);R9.splice(R9.indexOf('V'),1);R9.splice((rf()*2)|0,0,B0>=58?'R':'A','V','O');} /* l'enchaînement de Sacha, d'un seul tenant, une fois sur trois — sur une route longue son accroche est un raccourci : la route fait le tour d'un gros nuage, on ne voit pas où elle va (la charte R6) */
      if(!coeur&&R9.indexOf('O')>2){R9.splice(R9.indexOf('O'),1);R9.splice((rf()*3)|0,0,'O');} /* la voltige, quand elle est tirée, parmi les trois premiers : elle tient presque toujours */
      if(!(coeur&&B0>=58)&&rf()<(B0>=58?1:B0>=36?.6:.4))R9.splice((rf()*3)|0,0,'R');
      pli=!coeur&&B0>=58;if(pli)R9.splice((rf()*4)|0,0,'P'); /* (la charte R6 : deux raccourcis par route au palier 0, dont un qui marche à toutes les vitesses) une route longue a un raccourci ET un PLI */ /* un raccourci, tôt (il demande ~18 s de croisière : sur une route de 45 s, deux d'affilée ne laisseraient rien au reste) */
      if(B0>=58&&rf()<.35)R9.push('R'); /* le second, en fin de route, s'il tient */
      prog.push.apply(prog,R9);}
    const joues=[];
    /* L'OUVERTURE : pisteTord tient le départ (~6 s de croisière au palier 0) — aucun tableau n'y joue, mais un module qui tourne sans rouler la dalle, oui ; puis un virage qui révèle le ciel */
    {const av=K.avant(),nm=!NUA_PC.seul&&av>3.4?pioche(OUVRE,av+1.8):null;if(nm){joueUn(pose,nm);joues.push(nm);}liaison(Math.max(nm?1:1.4,K.avant()));}
    const att={};if(!NUA_PC.seul){if(vo)att.O=dO;if(B0>=58)att.R=Math.min(duree('boucle'),duree('stade'));if(pli)att.P=Math.min(duree('lacetsCol'),duree('looping'));if(coeur)att.V=Math.min(duree('spirale'),duree('pont'));} /* l'enchaînement de Sacha (ACCROCHE → VERTIGE → VOLTIGE) garde son vertige : la spirale ou le pont, qui se replient, y tiennent lieu de raccourci */ /* les rôles qui DOIVENT jouer (la voltige tirée ; le raccourci et le pli d'une route longue) : leur place est gardée — les rôles joués avant eux ne la mangent pas */
    for(const role of prog){const place=K.reste()-1.2;if(place<4)break;let res=0;for(const k in att)if(k!==role)res+=att[k]+1.8;
      const nm=tire(role,place-res)||(role==='R'?tire(coeur?'A':'V',place-res):null);delete att[role];if(!nm||!joueUn(pose,nm,0))continue;joues.push(nm);if(nm==='boucle'||nm==='stade')cum=0;else liaison(1.2+rf()*1);} /* après un raccourci, pas de liaison : sa piste de pose (droite, puis une courbe douce) en tient lieu */
    if(!NUA_PC.seul&&K.surf&&K.reste()>K.surfEst()+1.2&&rf()<.55){const v9=K.sauve(),n9=poses.length;poses.push({nm:'surf',mk:pose(function(){return K.surf();})});cum=0;if(K.reste()<0){K.rends(v9);poses.length=n9;}else{joues.push('surf');liaison(1.2+rf()*.6);}} /* le finale : le surf, s'il tient */
    for(let k=0;k<6&&K.reste()>3;k++){const p9=K.reste()-1.2,nm=tire(['D','W','C','A'][k%4],p9)||tire('D',p9)||tire('W',p9)||tire('A',p9);if(!nm)break;if(!joueUn(pose,nm,0))continue;joues.push(nm);liaison(1.2+rf()*.8);} /* ce qui reste de place : encore un tableau, s'il en tient un */
    const tF=K.total();for(let k=0;k<4&&K.total()>2.5;k++){const nm=NUA_PC.seul?null:pioche(FINAL,K.total()-.3);if(!nm)break;joueUn(pose,nm);joues.push(nm);liaison(Math.min(1.4,K.total()));} /* l'arrivée : des modules qui tournent sans rouler la dalle (pisteTord l'y tient à l'endroit), plutôt que des esses molles */
    if(K.total()>1.6){pose(function(){return arrivee(K.total());});joues.push('arrivee');} /* L'ARRIVÉE : ce qui reste, en courbes, entre deux haies de nuages */
    for(let k=0;k<12&&K.total()>.6;k++)liaison(Math.min(2.4,K.total())); /* (au cas où) des virages jusqu'au portail */
    /* LE CLIMAX (la charte des routes : un seul par route, la marque porte climax:1) : la voltige si elle a joué (la tête sous les nuages), sinon le surf du finale, sinon la
       montagne russe (grand huit, plafond, toboggan, cascade), sinon le vertige (spirale, pont, looping), sinon le plus long des autres. Aucun tirage : la route ne change pas. */
    let cx=null;{const RG={voltige:5,surf:4,grandHuit:3,plafond:3,toboggan:3,cascade:3,spirale:2,pont:2,looping:2};let r9=-1;
      for(const q of poses){if(!q.mk)continue;const r=(RG[q.nm]||1)*100+Math.min(99,duree(q.nm));if(r>r9){r9=r;cx=q;}}if(cx)cx.mk.climax=1;}
    NUA_PC.der={prog:prog.join(''),tableaux:joues,climax:cx?cx.nm:null,caps:capJ,secondes:Math.round(B0),fin:+tF.toFixed(1)};return NUA_PC.der;};
  return {joue:joue,M:M,duree:duree};
}
window.dbgParcours=function(){const d=NUA_PC.der;return {on:NUA_PC.on,seul:NUA_PC.seul,der:d,modules:(typeof MODS!=='undefined'&&MODS||[]).map(function(m){return {fig:m.fig,s0:Math.round(m.s0+60),s1:Math.round(m.s1),sansSaut:m.ss?m.ss.map(function(e){return [Math.round(e[0]),Math.round(e[1])];}):null};})};};
