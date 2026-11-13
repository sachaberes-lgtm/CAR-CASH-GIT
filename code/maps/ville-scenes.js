/* ===== LA VILLE QUI SE VISITE (2026-11-13 soir, Sacha : « retravaille la ville : ça manque d'art, d'âme, de beauté ; la route est juste posée, elle va trop
   souvent tout droit ; il faut que ça monte, que ça descende, des virages un peu inclinés dans des immeubles, un tunnel qui passe dans un immeuble comme en Chine,
   passer très près du sol ; des virages fun, légers, lisibles, beaux, aussi faciles à prendre en volant qu'en roulant ; des modules qui font interagir la route et
   les bâtiments ; des cartes postales ; chaque partie a sa génération unique » — puis « fais-le en une fois, très optimisé, prends ton temps, pas de bug ») =====
   Conception : docs/superpowers/specs/2026-11-13-ville-ame-design.md. Ce morceau porte tout ce qui est neuf ; les fichiers partagés n'ont que des raccords :
   · VILLE_AME : l'interrupteur (`?sans=villeame` : la ville v1559, au tirage près) ; VILLE_BANK : le DÉVERS de la route de la ville (une normale par point de
     contrôle, posée par genCtrl1, lue par pisteRoute → TORD.N, sans TORD.on : la gravité reste la gravité, la caisse tient au rail comme aux dunes) ;
   · vsModules(G) : la ROUTE — les liaisons vivantes, le souffle léger et les SCÈNES (traversée, passerelle, virage de façade, spirale, crête des toits, portes de
     lumière, plongée, nœud). G est le contexte de genCtrl1 (arc, straight, courbe, le cap, le hasard `rf`…). Chaque scène dépose ses ANCRES dans FILETMARK ;
   · vsDevers : le dévers — automatique (≤ 24°, la courbure moyennée), SCRIPTÉ par scène (`dv`), nul sur l'entrée, les raccourcis, les crêtes, les couloirs (`nul`), l'arrivée ;
   · vsReserve / vsBatir : le DÉCOR des scènes, dans buildVoxCity — les emprises réservées AVANT les tours (aucune tour ordinaire dedans), les volumes posés APRÈS
     elles (aucun tirage `vr` décalé), dans les familles existantes (0 appel de rendu ; les portiques des PORTES : une instance de la matière néon) ;
   · villeAbri : la pluie s'éteint sous un toit. */
const VILLE_AME=!/[?&]sans=([^&]*,)?villeame(,|&|$)/.test(location.search);
const VILLE_BANK={N:null,max:0};
const VS_PER={x:1/.0131,z:1/.0173}; /* la GRAINE des façades (villeMatTours : fract(x·0,0131 + z·0,0173)) revient tous les 76,34 m en x et 57,80 m en z : deux volumes décalés
   d'un nombre entier de périodes ont la même façade — une tour percée reste UNE tour, pas trois immeubles empilés */
const VS_HC=40; /* la hauteur libre d'un couloir au-dessus du bitume (la caméra de conduite est à 2-4 m du toit de la caisse, 9 m en vol) */
const VS_H=function(x,z){const s=Math.sin(x*12.9898+z*78.233)*43758.5453;return s-Math.floor(s);}; /* un hasard né de la PLACE : ni `vr` ni `rnd` */
/* ===== LA ROUTE ===== */
function vsModules(G){
  const arc=G.arc,straight=G.straight,courbe=G.courbe,rf=G.rf,thrH=G.thrH,rP=G.rP,LV=G.LV,vD=G.vD,hand=G.hand,PI2=Math.PI/2;
  const ix=function(){return G.ctrl.length-1;},P=function(){return G.P();};
  let der=0; /* le côté du dernier virage dessiné ici : les virages légers repartent de l'AUTRE côté (des S, jamais 10 s à tourner du même côté) */
  const cote=function(a9,alt){if(alt&&der){const t=thrH(.5,a9);rf();return t>=.97?1:t<=.03?-1:-der;} /* l'AUTRE côté, toujours — sauf si le garde-fou d'enroulement l'impose (il défait le cap gagné : c'est déjà l'autre côté) */
    return rf()<thrH(.5+hand*.22,a9)?1:-1;};
  const Rv=function(R){return Math.max(G.rPl(),R);}; /* arc() relève le rayon au plancher : le centre se calcule au même rayon */
  const centre=function(sg,R){const p=P(),ph=G.phi();return {x:p.x+sg*R*Math.cos(ph),z:p.z-sg*R*Math.sin(ph)};}; /* le centre du cercle que la route va parcourir (comme filet) */
  /* LE CALAGE SUR LA TRAME : un virage qui amène le cap sur un multiple de 90° — les tours de la ville sont alignées sur les axes, une tour percée, une passerelle,
     un nœud, une avenue restent des boîtes droites. Sous 24° ce serait une douille : on tourne de 90° de plus (66-114°). Rend l'axe ('x' ou 'z') et la marche (ux, uz). */
  const calage=function(Rk){const ph=G.phi(),t=Math.round(ph/PI2)*PI2;let d=t-ph;
    if(Math.abs(d)<35/57.2958)d+=cote(90,true)*PI2; /* (la charte, R1) sous 35° le calage ne sortirait pas du cône de 30° : on tourne de 90° de plus (55-125°) */
    else if(der&&Math.sign(d)===der)d-=der*PI2; /* (la règle des 10 s) 24-45° du même côté que le virage d'avant : on prend l'autre axe, 45-66° de l'autre côté */
    const R=Rv((Rk||2.1)*rP),a=d*57.2958;arc(a,R,Math.max(3,Math.ceil(Math.abs(a)/10)),-Math.abs(d)*R*.05);
    der=d<0?-1:1;const q=((Math.round(G.phi()/PI2)%4)+4)%4;return {ax:q%2?'x':'z',ux:q===1?1:q===3?-1:0,uz:q===0?1:q===2?-1:0,sg:der};};
  /* LA LIAISON VIVANTE (la montée de la phrase) : 2-3 virages légers de 35-75° à 1,9-2,6 rP, enchaînés en S sans droite entre eux ; chacun MONTE (5-9 %) ou
     DESCEND (12-20 %), en alternance : la houle — ça monte, ça descend, et on ne roule jamais tout droit */
  const liaison=function(n){let sg=0,mt=rf()<.45;
    for(let k=0;k<n;k++){sg=sg===0?cote(undefined,true):-sg; /* un vrai S : chaque virage repart de l'autre côté */
      const kL=1+.45*Math.max(0,LV-1),a=(k%2===0?60+rf()*25:35+rf()*15)/Math.sqrt(kL),R=Rv(Math.max((1.9+rf()*.7)*rP,(2.2+rf()*.6)*vD*kL)),L=a/57.2958*R, /* (la charte, R1) un GRAND virage (60-85°) puis un petit (35-50°) de l'autre côté : la direction change (deux S égaux la gardaient) ; à haut palier, plus larges et moins coudés (kL) */ /* (la charte, R7) le rayon suit aussi la VITESSE (2,2-2,8 s de croisière) : à 340 m/s un saut vole 600 m, il doit pouvoir se reposer dans le virage */p=mt?.02+rf()*.02:-(.12+rf()*.08); /* (LA PASSE IMAGE) des montées de 2-4 % : moins de bosses qui cachent la ville */
      arc(sg*a,R,Math.max(3,Math.ceil(a/10)),p*L);mt=!mt;}if(sg)der=sg;};
  /* LE SOUFFLE LÉGER : là où la phrase posait une droite franche ou un balayage à 6,5 rP (on ne les sentait pas), une courbe au pouce de 28-50° à 2,2-4 rP qui
     ondule — jamais de droite (Sacha, 13/11 : « pas plus de 10 secondes dans une même direction ») */
  const souffle=function(sl){ /* (la règle des 10 s) plus de ligne de mire droite avant le climax : TO THE MOON est déjà une rampe droite de 5 s */
    const kL=1+.45*Math.max(0,LV-1),a=(40+rf()*20)/Math.sqrt(kL),R=Rv(Math.max(2.2*vD*kL,Math.min(4*rP,Math.max(2.2*rP,sl.L/(a/57.2958))))),sg=cote(undefined,true),p=rf()<.4?.04:-.1;
    arc(sg*a,R,Math.max(3,Math.ceil(a/8)),p*a/57.2958*R);der=sg;};
  /* LA TRAVERSÉE (la gare de Liziba, à Chongqing : le train qui passe DANS l'immeuble) : calage, la ligne de mire (la tour en face), 120-180 m presque plats AU
     TRAVERS d'une tour percée — un hall éclairé, plafond à 40 m —, la sortie */
  const sTraversee=function(){const C=calage(2+rf()*.4),l0=Math.max(.3*vD,40*LV);straight(l0,-.02*l0,1);
    const Lt=(120+rf()*60)*Math.min(LV,1.8),iA=ix(),A=P().clone();straight(Lt,-.012*Lt,Math.max(2,Math.round(Lt/60)));const iB=ix(),B9=P().clone();
    const l1=Math.max(.3*vD,35*LV);straight(l1,-.03*l1,1);
    der=C.sg;FILETMARK.push({anc:[{t:'tunnel',ax:C.ax,ux:C.ux,uz:C.uz,x0:A.x,z0:A.z,x1:B9.x,z1:B9.z}]});return {fig:'traversee',nul:[[iA,iB]]};};
  /* LA PASSERELLE (les tours Petronas) : calage, deux tours jumelles de part et d'autre de la route, reliées par un pont de verre 30 m au-dessus d'elle (parfois deux) */
  const sPasserelle=function(){const C=calage(2+rf()*.4),l0=Math.max(.3*vD,35*LV);straight(l0,-.02*l0,1);
    const Lp=(100+rf()*40)*Math.min(LV,1.8),iA=ix(),A=P().clone();straight(Lp,-.02*Lp,2);const iB=ix(),B9=P().clone();const l1=Math.max(.3*vD,35*LV);straight(l1,-.03*l1,1);
    der=C.sg;FILETMARK.push({anc:[{t:'passerelle',ax:C.ax,ux:C.ux,uz:C.uz,x0:A.x,z0:A.z,x1:B9.x,z1:B9.z,deux:rf()<.5}]});return {fig:'passerelle',nul:[[iA,iB]]};};
  /* LE VIRAGE DE FAÇADE (Minority Report) : 100-130° à 2,2-2,55 rP, la dalle couchée à 45° vers une géante en croix bâtie au centre, à 14 m du bord : la façade
     défile contre la portière */
  const sFacade=function(){const sg=cote(120,true),R=Rv((2.2+rf()*.35)*rP),a=100+rf()*30,l=Math.max(.4*vD,40*LV);straight(l,-.03*l,1);
    const c=centre(sg,R),i0=ix();arc(sg*a,R,Math.ceil(a/9),-a/57.2958*R*.08);const i1=ix();straight(l,-.03*l,1);
    der=sg;FILETMARK.push({anc:[{t:'facade',x:c.x,z:c.z,R:R}]});return {fig:'facade',dv:[[i0,i1,1.45]]};}; /* (R13) la dalle couchée à 83° : on roule sur le mur, la tour devant le toit */
  /* LA RAMPE DU PHARE (la rampe du pont de Nanpu, à Shanghai — Sacha, 13/11 : « pas de torsade trop serrée et pas plus de 10 secondes dans une même direction ») :
     260-330° qui MONTENT (7 %) autour d'une tour-phare, à 2,6-2,9 rP — large, jamais un tour complet sur soi-même, jamais plus de 9 s de croisière dans le virage —,
     la dalle couchée à 26° ; on sort en haut et la liaison suivante replonge */
  const sSpirale=function(){const sg=cote(300,true),R=Rv((2.6+rf()*.3)*rP),a=Math.min(260+rf()*70,8.5*vD/R*57.2958),l=Math.max(1.1*vD,40*LV);straight(l,-.02*l,Math.max(1,Math.round(l/80)));
    const c=centre(sg,R),i0=ix();arc(sg*a,R,Math.ceil(a/9),.07*a/57.2958*R);const i1=ix();const l1=Math.max(1.1*vD,50*LV);straight(l1,-.04*l1,Math.max(1,Math.round(l1/80)));der=sg;
    FILETMARK.push({anc:[{t:'phare',x:c.x,z:c.z,R:R}]});return {fig:'spirale',dv:[[i0,i1,.45]]};};
  /* LA CRÊTE DES TOITS : une rampe qui monte (11 %) en tournant, un palier qui passe 8 m au-dessus d'un toit-terrasse (hélistation, blocs techniques, mâts), puis la
     plongée (22 %) : à fond, on décolle */
  const sCrete=function(){const sg=cote(undefined,true),L1=(1.4+rf()*.5)*vD,Lp=(.55+rf()*.2)*vD,L2=(1.3+rf()*.4)*vD;
    courbe(L1,.11*L1,sg*(22+rf()*14),3);const iA=ix(),A=P().clone();straight(Lp,-.01*Lp,2);const iB=ix(),B9=P().clone();courbe(L2,-.22*L2,-sg*(26+rf()*16),3);der=-sg;
    FILETMARK.push({anc:[{t:'toit',x0:A.x,z0:A.z,x1:B9.x,z1:B9.z}]});return {fig:'crete',nul:[[Math.max(0,iA-2),iB+2]]};};
  /* LES PORTES DE LUMIÈRE (Blade Runner, F-Zero) : un grand S de 2-3 virages de 50-72° à 2,3-2,7 rP ; un portique de néon enjambe la route tous les ~0,9 s,
     dans le repère de la dalle (il penche avec le dévers) */
  const sPortes=function(){const n=2+(rf()<.5?1:0),R=Rv((2.3+rf()*.4)*rP),l=Math.max(.35*vD,35*LV);let sg=cote(undefined,true);straight(l,-.03*l,1);
    const ia=ix();for(let k=0;k<n;k++){const a=50+rf()*22;arc(sg*a,R,Math.ceil(a/8),-a/57.2958*R*.06);der=sg;sg=-sg;}const ib=ix();straight(l,-.03*l,1);
    const Q=[],D=Math.max(70,.9*vD);let s=0,nx=40;
    for(let i=ia+1;i<=ib;i++){const a9=G.ctrl[i-1],b9=G.ctrl[i],d=Math.hypot(b9.x-a9.x,b9.z-a9.z);while(nx<=s+d){const f=(nx-s)/Math.max(d,1e-6);Q.push({x:a9.x+(b9.x-a9.x)*f,z:a9.z+(b9.z-a9.z)*f});nx+=D;}s+=d;}
    FILETMARK.push({anc:[{t:'portes',q:Q}]});return {fig:'portes'};};
  /* LA PLONGÉE (la poursuite de Coruscant) : on plonge à 25 % EN TOURNANT, le calage pose l'avenue sur la trame, on file 12 m au-dessus de la rue (une dalle dure :
     on y meurt si on tombe) entre deux murs de tours, puis on remonte en tournant franchement (36-52°) — aucune ligne droite de plus de ~1,5 s */
  const sPlongee=function(){const sd=cote(undefined,true),L1=(1.4+rf()*.4)*vD;courbe(L1,-.25*L1,sd*(20+rf()*10),4);
    const C=calage(2.2),Lb=(1.1+rf()*.4)*vD,L3=(1.3+rf()*.3)*vD,iA=ix(),A=P().clone();straight(Lb,-.01*Lb,2);const iB=ix(),B9=P().clone();const sm9=cote(undefined,true);courbe(L3,.10*L3,sm9*(36+rf()*16),3);der=sm9;
    FILETMARK.push({anc:[{t:'rue',ax:C.ax,ux:C.ux,uz:C.uz,x0:A.x,z0:A.z,x1:B9.x,z1:B9.z}]});return {fig:'plongee',nul:[[Math.max(0,iA-1),iB+1]]};};
  /* LE NŒUD (les échangeurs de Chongqing : le tunnel sous le tunnel) : calage, on traverse une tour par un couloir haut, on fait le tour du pâté de maisons
     (trois quarts de tour d'angles droits du même côté, en descendant de 84-98 m), et on la retraverse PAR-DESSOUS, à angle droit, dans un second couloir.
     Géométrie : u = la marche, v = le côté des virages ; la tour (Su × Sv) au centre Ct ; sortie à Su/2 + e, virage, L2, virage, L3, virage, Ld jusqu'à la face :
     L3 = Su/2 + e − R ramène la dernière ligne pile sur Ct. */
  const sNoeud=function(){const C=calage(2+rf()*.3),hi=ROAD_HALF+14,SX=2*(2*VS_PER.x-hi),SZ=2*(2*VS_PER.z-hi),Su=C.ax==='z'?SZ:SX,Sv=C.ax==='z'?SX:SZ;
    const l0=Math.max(.3*vD,40*LV);straight(l0,-.02*l0,1);
    const iU0=ix(),Ct={x:P().x+C.ux*Su/2,z:P().z+C.uz*Su/2};straight(Su,0,Math.max(2,Math.round(Su/60)));const iU1=ix();
    const sg=-C.sg,R=Rv((1.75+rf()*.15)*rP),e=Math.max(60*LV,R-Su/2+40),L3=Su/2+e-R,D9=76+rf()*10; /* (la règle des 10 s) le tour du pâté de maisons part du côté OPPOSÉ au calage ; le plus court possible : ~8 s de virages au palier 0 */
    let L2=Math.max(40*LV,Sv/2+70-R),tot=e+3*PI2*R+L2+L3+(R+L2-Sv/2);
    if(D9/tot>.12){const k9=(D9/.12-tot)/2;L2+=k9;tot+=2*k9;}
    const s=D9/tot,Ld=R+L2-Sv/2,nS=function(l){return Math.max(1,Math.round(l/80));};
    straight(e,-s*e,nS(e));arc(sg*90,R,9,-s*PI2*R);straight(L2,-s*L2,nS(L2));arc(sg*90,R,9,-s*PI2*R);
    straight(L3,-s*L3,nS(L3));arc(sg*90,R,9,-s*PI2*R);straight(Ld,-s*Ld,nS(Ld));
    const iL0=ix();straight(Sv,0,Math.max(2,Math.round(Sv/60)));const iL1=ix();const l1=Math.max(.5*vD,50*LV);straight(l1,-.03*l1,1);
    der=sg;FILETMARK.push({anc:[{t:'noeud',x:Ct.x,z:Ct.z,ax:C.ax}]});return {fig:'noeud',nul:[[iU0,iU1],[iL0,iL1]]};};
  /* LA VRILLE DES TOURS (R13) : 62-88° de courbe douce sur 9,6 s RESSENTIES (la croisière × l'élan 1,8 → 1), la dalle y fait un tour complet (vsDevers, `vr`) ; un point de contrôle
     tous les ~45 m (≤ 12° de roulis de l'un à l'autre : buildTrack mélange les normales en ligne droite) ; l'ancre 'vrille' au milieu (le pont de verre, ses deux tours) */
  const sVrille=function(dy9){const pal=typeof engTier!=='undefined'?(engTier|0):0,EL=1.8-.8*Math.min(1,Math.max(0,pal/25)),Lv=9.6*vD*EL,sg=cote(undefined,true),a=110+rf()*40,R=Rv(Lv/(a/57.2958));
    const l0=Math.max(.3*vD,40*LV);straight(l0,-.02*l0,1);const i0=ix();arc(sg*a,R,Math.max(16,Math.ceil(R*a/57.2958/45)),-(dy9!=null?dy9:.04*Lv)); /* dy9 : (LA PLONGÉE EN VRILLE) la descente de la rampe d'entrée, à la place de la rampe */const i1=ix();const l1=Math.max(.3*vD,40*LV);straight(l1,-.02*l1,1);der=sg;
    const im=(i0+i1)>>1,Cm=G.ctrl[im],Ca=G.ctrl[Math.max(0,im-1)],Cb=G.ctrl[Math.min(G.ctrl.length-1,im+1)],tl=Math.hypot(Cb.x-Ca.x,Cb.z-Ca.z)||1;
    const gr9=VILLE_BANK.graine,v9=gr9!=null?((gr9%4)+4)%4:(rf()*4)|0,an=[];
    if(v9===2)for(const f of [.38,.5,.62]){const j=Math.round(i0+(i1-i0)*f),Pj=G.ctrl[j],Pa=G.ctrl[Math.max(0,j-1)],Pb=G.ctrl[Math.min(G.ctrl.length-1,j+1)],lj=Math.hypot(Pb.x-Pa.x,Pb.z-Pa.z)||1;
      an.push({t:'anneau',x:Pj.x,z:Pj.z,j:j,ux:(Pb.x-Pa.x)/lj,uz:(Pb.z-Pa.z)/lj,w:2*ROAD_HALF+40,h:2*ROAD_HALF+40,centre:1});} /* les ANNEAUX : des cadres de lumière AUTOUR de l'axe — la dalle tourne dedans */
    else an.push({t:'vrille',v:v9,x:Cm.x,z:Cm.z,ux:(Cb.x-Ca.x)/tl,uz:(Cb.z-Ca.z)/tl});
    FILETMARK.push({anc:an});return {fig:'vrille',nom:['vrille du pont de verre','vrille du monorail','vrille des anneaux','vrille des tours'][v9],vr:[[i0,i1]]};};
  const scenes=[sTraversee,sPasserelle,sFacade,sSpirale,sCrete,sPortes,sPlongee];
  /* LES LONGUEURS (en secondes de croisière, au palier 0 puis au palier 20 ; mesurées : outils de la session, long-scenes.cjs) — la place d'une scène se juge sur SA longueur */
  const LONG=new Map([[sTraversee,[7,3.2]],[sPasserelle,[6.4,2.4]],[sFacade,[5.6,2.8]],[sSpirale,[10.7,10.7]],[sCrete,[4,3.6]],[sPortes,[7.6,4.2]],[sPlongee,[7.9,6]],[sNoeud,[19.4,9.8]]]),
    LONGN={'slalom des géantes':[12.2,6.8],'épingle de la tour':[7.2,4],'bougie':[6.1,5],'krach':[6,5.6]};
  return {liaison:liaison,souffle:souffle,sTraversee:sTraversee,sPasserelle:sPasserelle,sFacade:sFacade,sSpirale:sSpirale,sCrete:sCrete,sPortes:sPortes,sPlongee:sPlongee,sNoeud:sNoeud,
    scenes:scenes,vrille:sVrille,nomme:function(fn,nom){const f=function(){return Object.assign({nom:nom},fn()||{});};f.nom=nom;return f;},
    souffleL:function(){const kL=1+.45*Math.max(0,LV-1);return Math.max(G.rPl(),2.2*vD*kL,2.2*rP)*(60/57.2958)/Math.sqrt(kL);}, /* la longueur d'un souffle sans consigne (souffle({L:0})), au plus */
    longueur:function(fn){const f=LONG.get(fn)||(fn&&LONGN[fn.nom])||[8,6],u=Math.max(0,Math.min(1,(LV-1.08)/2.63));return 1.08*vD*(f[0]+(f[1]-f[0])*u);}, /* la longueur d'une scène (m), au pire des graines mesurées, + 8 % */
cote:cote,setDer:function(s){der=s>0?1:s<0?-1:0;},estScene:function(f){return scenes.indexOf(f)>=0||f===sNoeud;}};
}
/* LE CONTRAT DE LA CHARTE (passation/CHARTE-ROUTES.md § 3) : chaque MODMARK de la ville porte son NOM en clair (le banc juge compte la variété par nom) */
const VS_NOMS={traversee:'traversée',passerelle:'passerelle',facade:'virage de façade',spirale:'rampe du phare',crete:'crête des toits',portes:'portes de lumière',plongee:'plongée',
  noeud:'nœud',tourgeante:'tour de la géante',rondpoint:'rond-point',moon:'to the moon',parking:'parking',saut:'saut',grandsaut:'grand saut'};
function vsTenue(C){const n=C.length;if(n<3)return {t30:0,t8:0};
  const pal=typeof engTier!=='undefined'?(engTier|0):0,vw=70+((typeof lvPiste==='function'?lvPiste():1)-1)*100,vP=vw*(1.8-.8*Math.min(1,Math.max(0,pal/25))),PAS=8;
  const X=[C[0].x],Y=[C[0].y],Z=[C[0].z];let reste=PAS;
  for(let i=1;i<n;i++){const a=C[i-1],b=C[i],L=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);let s=reste;while(s<=L){const t=s/L;X.push(a.x+(b.x-a.x)*t);Y.push(a.y+(b.y-a.y)*t);Z.push(a.z+(b.z-a.z)*t);s+=PAS;}reste=s-L;}
  const m=X.length,tx=new Float64Array(m),ty=new Float64Array(m),tz=new Float64Array(m),cp=new Float64Array(m),hz=new Float64Array(m);
  for(let i=0;i<m;i++){const a=Math.max(0,i-1),b=Math.min(m-1,i+1);let x=X[b]-X[a],y=Y[b]-Y[a],z=Z[b]-Z[a];const l=Math.hypot(x,y,z)||1;tx[i]=x/l;ty[i]=y/l;tz[i]=z/l;cp[i]=Math.atan2(tx[i],tz[i]);hz[i]=Math.hypot(tx[i],tz[i]);}
  const tenue=function(deg){const c=Math.cos(deg/57.2958),r=deg/57.2958;let best=0;for(let i=0;i<m-1;i++){let j=i+1;
    while(j<m){if(tx[i]*tx[j]+ty[i]*ty[j]+tz[i]*tz[j]<c)break;if(hz[i]>=.35&&hz[j]>=.35){let d=cp[j]-cp[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)>r)break;}j++;}
    if(j-1-i>best)best=j-1-i;if(j>=m)break;}return best*PAS/vP;};
  return {t30:tenue(30),t8:tenue(8)};} /* la tenue de cap d'une route, en secondes ressenties (la définition du juge commun : passation/CHARTE-ROUTES.md, R1-R2) */
function vsMalusTenue(C){const t=vsTenue(C);return Math.max(0,t.t30-8.5)*12+Math.max(0,t.t8-4.3)*12;}
function vsMalusRac(marks){if((typeof lvPiste==='function'?lvPiste():1)>=1.5)return 0;let n=0,t=0;for(const m of marks)if(m){t++;if(m.rac)n++;}return (n<2?30:0)+(t<4?20:0);} /* (la charte, R6 et R4) aux paliers lents, une route garde DEUX raccourcis et QUATRE modules : le meilleur-de-N écarte les essais qui en ont moins */
function vsNommer(marks){for(const m of marks)if(m&&!m.nom)m.nom=VS_NOMS[m.fig]||m.fig||'module';}
/* ===== LES CROISEMENTS (le meilleur-de-N) ===== une route plus vivante (elle tourne, elle remonte : la rampe du phare, la crête, la houle) peut repasser au-dessus d'un
   morceau déjà parcouru À LA MÊME HAUTEUR. MESURÉ (banc croise.cjs, 40 graines, palier 0) : 6 routes sur 40 se recoupaient sous 46 m de hauteur libre, jusqu'à 0 m (les
   dalles se traversent). Les raccourcis le font EXPRÈS (la route sage passe sous le saut) : leurs croisements internes ne comptent pas. Rend un malus : 6 par croisement
   (deux morceaux à plus de 150 m l'un de l'autre sur la route, à moins de 60 m en plan, à moins de 50 m en hauteur), regroupé par tranches de 200 m comme le banc. */
function vsCroise(ctrl,marks){
  const P=[{x:ctrl[0].x,y:ctrl[0].y,z:ctrl[0].z,s:0,i:0}];let s=0;
  for(let i=1;i<ctrl.length;i++){const a=ctrl[i-1],b=ctrl[i],d=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z),n=Math.max(1,Math.ceil(d/12));for(let k=1;k<=n;k++){s+=d/n;P.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n,z:a.z+(b.z-a.z)*k/n,s:s,i:i});}}
  const mod=new Int32Array(ctrl.length).fill(-1);marks.forEach(function(m,k){if(m&&(m.fig==='saut'||m.fig==='grandsaut'))for(let i=Math.max(0,m.ia!=null?m.ia:m.i0);i<=(m.i2!=null?m.i2:m.i1)&&i<ctrl.length;i++)mod[i]=k;}); /* (ia, i2 : le module entier d'un raccourci, dont i0-i1 ne sont que la lèvre et la pose) */
  const H=60,G=new Map();for(let k=0;k<P.length;k++){const p=P[k],key=Math.floor(p.x/H)*100003+Math.floor(p.z/H);let l=G.get(key);if(!l)G.set(key,l=[]);l.push(k);}
  const vu=new Set();let n=0,dm=1e9;
  for(let a=0;a<P.length;a++){const p=P[a],cx=Math.floor(p.x/H),cz=Math.floor(p.z/H);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const l=G.get((cx+dx)*100003+cz+dz);if(!l)continue;
      for(const b of l){if(b<=a)continue;const q=P[b];if(q.s-p.s<150||Math.abs(q.y-p.y)>=50||Math.hypot(q.x-p.x,q.z-p.z)>H)continue;
        if(q.s-p.s>=200){const d3=Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z);if(d3<dm)dm=d3;} /* (la charte, R10) le frôlement le plus serré */
        if(mod[p.i]>=0&&mod[p.i]===mod[q.i])continue;const k=Math.floor(p.s/200)+'/'+Math.floor(q.s/200);if(!vu.has(k)){vu.add(k);n++;}}}}
  return n*6+(dm<14?40:0);} /* (R10 : à moins de 14 m, l'essai est écarté) */
/* ===== LE DÉVERS DE LA VILLE ===== la recette des dunes (courbure du plan moyennée sur ±W, pliée par un tanh) : la dalle se couche vers l'INTÉRIEUR du virage,
   24° au plus ; les scènes en demandent plus (`dv` : [[i0, i1, rad]], rampes de 60 m) ; ZÉRO sur l'entrée, les raccourcis (un saut part dans l'axe de la normale :
   sur une dalle couchée il partirait de travers), les crêtes et les couloirs (`nul`), l'arrivée. Rend {N : une normale par point de contrôle, max : °}. */
function vsDevers(C,marks,o){
  const n=C.length;if(n<4)return null;
  const sc=new Float64Array(n),kap=new Float64Array(n),hh=new Float64Array(n),bk=new Float64Array(n),mk=new Float64Array(n).fill(1);
  const sm=function(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)];hh[i]=Math.hypot(b.x-a.x,b.z-a.z)/2||1;}
  for(let i=1;i<n-1;i++){const ax=C[i].x-C[i-1].x,az=C[i].z-C[i-1].z,bx=C[i+1].x-C[i].x,bz=C[i+1].z-C[i].z,la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;
    kap[i]=Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((la+lb)/2);}
  const W=Math.max(35,Math.min(110,.45*o.vD)),kref=1/(2.3*o.rP),BM=.5;
  for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W;j--){sw+=hh[j];sk+=kap[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W;j++){sw+=hh[j];sk+=kap[j]*hh[j];}
    bk[i]=BM*Math.tanh((sk/Math.max(sw,1e-6))/kref);}
  for(const m of marks)if(m&&m.dv)for(const d of m.dv){const i0=Math.max(0,d[0]),i1=Math.min(n-1,d[1]);if(i1<=i0)continue;let ks=0;for(let i=i0;i<=i1;i++)ks+=kap[i]*hh[i];const sg=ks<0?-1:1;
    for(let i=i0;i<=i1;i++){const r=Math.min(sm(0,60,sc[i]-sc[i0]),sm(0,60,sc[i1]-sc[i]));bk[i]=sg*Math.max(Math.abs(bk[i])*(bk[i]*sg>0?1:0),d[2]*r)+(bk[i]*sg<0?bk[i]*(1-r):0);}}
  const Z=[];if(o.iEnt>=0)Z.push([-1e9,sc[Math.min(n-1,o.iEnt)]+40]);Z.push([sc[n-1]-200,1e9]);
  for(const m of marks){if(!m)continue;const a=Math.max(0,Math.min(n-1,m.i0)),b=Math.max(0,Math.min(n-1,m.i1));
    if((m.fig==='saut'||m.fig==='grandsaut')&&m.zero){const q=function(i){return sc[Math.max(0,Math.min(n-1,i))];};Z.push([q(m.zero[0][0])-70,q(m.zero[0][1])+30]);Z.push([q(m.zero[1][0])-40,q(m.zero[1][1])+40]);} /* (LA PASSE IMAGE) la lèvre et la pose à plat, la boucle couchée */
    else if(m.fig==='saut'||m.fig==='grandsaut'){const a2=Math.max(0,Math.min(n-1,m.ia!=null?m.ia:m.i0)),b2=Math.max(0,Math.min(n-1,m.i2!=null?m.i2:m.i1));Z.push([sc[a2]-90,sc[b2]+150]);}
    if(m.vr)for(const q of m.vr){const qa=Math.max(0,Math.min(n-1,q[0])),qb=Math.max(0,Math.min(n-1,q[1]));Z.push([sc[qa]-60,sc[qa]+1]);Z.push([sc[qb]-1,sc[qb]+60]);} /* (R13) la vrille part et revient à plat */
    if(m.nul)for(const q of m.nul){const qa=Math.max(0,Math.min(n-1,q[0])),qb=Math.max(0,Math.min(n-1,q[1]));Z.push([sc[qa]-40,sc[qb]+40]);}}
  for(let i=0;i<n;i++)for(const z of Z){const d=Math.max(z[0]-sc[i],sc[i]-z[1],0);mk[i]=Math.min(mk[i],sm(0,70,d));}
  const b0=new Float64Array(n);for(let i=0;i<n;i++)b0[i]=bk[i]*mk[i];
  const b=new Float64Array(n);let mx=0; /* un dernier lissage sur ±25 m : pas de cassure de roulis d'un point de contrôle à l'autre */
  for(let i=0;i<n;i++){let sw=0,s=0;for(let j=i;j>=0&&sc[i]-sc[j]<=25;j--){sw+=hh[j];s+=b0[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<=25;j++){sw+=hh[j];s+=b0[j]*hh[j];}b[i]=s/Math.max(sw,1e-6);if(Math.abs(b[i])>mx)mx=Math.abs(b[i]);}
  /* LA BASCULE (Sacha, 13/11 : « pas de torsade trop serrée » ; la charte, R3 : ≤ 60 °/s) : la dalle ne change jamais d'inclinaison de plus de 24° par seconde de
     croisière. L'ENVELOPPE : |dévers| ne dépasse jamais sa plus petite valeur voisine + 24°/s × la distance (aller puis retour, sur la distance du plan) ; un changement de
     côté repart de zéro. Les sommets s'abaissent là où il le faut, rien ne se décale dans le temps. (La première version réduisait le dévers près des bords d'une zone et
     gardait la même pente au milieu : 72-88 °/s mesurés au banc juge.) */
  /* (le juge à la vitesse RÉELLE, 13/11 soir) 21°/s de croisière, soit 38°/s ressentis au palier 0 (élan 1,8) ; et un changement de côté entre deux points est UNE seule
     bascule : |b(i)| + |b(i+1)| ≤ taux × distance (la première enveloppe repartait de zéro des deux côtés : le double, 66 °/s mesurés au juge) */
  {const rt=(21/57.2958)/Math.max(30,o.vD),e=new Float64Array(n);
   for(let i=0;i<n;i++)e[i]=Math.abs(b[i]);
   for(let i=1;i<n;i++){const d=rt*(sc[i]-sc[i-1]);e[i]=Math.min(e[i],b[i]*b[i-1]<0?Math.max(0,d-e[i-1]):e[i-1]+d);}
   for(let i=n-2;i>=0;i--){const d=rt*(sc[i+1]-sc[i]);e[i]=Math.min(e[i],b[i]*b[i+1]<0?Math.max(0,d-e[i+1]):e[i+1]+d);}
   mx=0;for(let i=0;i<n;i++){b[i]=(b[i]<0?-1:1)*e[i];if(e[i]>mx)mx=e[i];}}
  /* LA VRILLE (R13) : sur [i0, i1], un TOUR COMPLET, au taux constant (montée et descente du taux sur 8 % de la longueur à chaque bout) — b = sg × 2π × F(u), F l'intégrale
     du trapèze ; sg : le côté de la courbe (la dalle part en se couchant DANS le virage). Écrit après l'enveloppe : la vrille a son propre taux. */
  let nVr=0;for(const m of marks)if(m&&m.vr)for(const q of m.vr){const i0=Math.max(0,Math.min(n-1,q[0])),i1=Math.max(0,Math.min(n-1,q[1]));if(i1<=i0+2)continue;
    let ks=0;for(let i=i0;i<=i1;i++)ks+=kap[i]*hh[i];const sg=ks<0?-1:1,e=.08,Lq=Math.max(1,sc[i1]-sc[i0]);
    for(let i=i0;i<=i1;i++){const u=Math.max(0,Math.min(1,(sc[i]-sc[i0])/Lq)),A=u<e?u*u/(2*e):u>1-e?(1-e)-(1-u)*(1-u)/(2*e):e/2+(u-e);b[i]=sg*2*Math.PI*A/(1-e);}nVr++;}
  const N=[];for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],c=C[Math.min(n-1,i+1)],tl=Math.hypot(c.x-a.x,c.z-a.z)||1,tx=(c.x-a.x)/tl,tz=(c.z-a.z)/tl;
    N.push(new THREE.Vector3(-tz*Math.sin(b[i]),Math.cos(b[i]),tx*Math.sin(b[i])));}
  return {N:N,max:Math.round(mx*57.2958),vrilles:nVr};
}
/* ===== LE DÉCOR DES SCÈNES (buildVoxCity) =====
   vsReserve(V), AVANT les tours : chaque ancre devient un PLAN — son emprise (réservée : aucune tour ordinaire, aucune pièce ₿ dedans), ses hauteurs lues sur la
   route FINALE (les lissages déplacent les y) et son verdict. LA RÈGLE (vsLibre) : aucun point de route ne passe à moins de `m` d'un volume de la scène (distance
   exacte en plan, dans la hauteur du volume −40 / +60), SAUF dans les BANDES de la scène — là où sa route doit passer (le couloir d'une tour percée, l'avenue, le
   dessous d'un pont), à ±12 m de son axe et à sa hauteur. Une route qui sort d'un tunnel et tourne trop tôt le long de la tour, un autre étage qui traverse
   l'emprise : la pièce est abandonnée (CITY.vs : sa raison), jamais posée à travers la route. vsBatir(V), APRÈS les tours : les volumes (corps/genre/tqC, durs
   comme toutes les tours : mortels en vol), les néons, les portiques. V : {pts, proches, pasP, snap, corps, genre, tqC, neon, neonC, tqN, sp, AIRZ, root, NEON, CR} */
function vsRect(ax,cx,cz,a0,a1,l0,l1){return ax==='z'?[cx+l0,cx+l1,cz+a0,cz+a1]:[cx+a0,cx+a1,cz+l0,cz+l1];} /* un rectangle décrit le long d'un axe : [a0, a1] le long de la marche, [l0, l1] en travers */
function vsPoints(V,x0,x1,z0,z1,m,cb){const cx=(x0+x1)/2,cz=(z0+z1)/2,R=Math.hypot(x1-x0,z1-z0)/2+m;
  V.proches(cx,cz,R,function(i){const p=V.P[i],dx=Math.max(x0-p.x,0,p.x-x1),dz=Math.max(z0-p.z,0,p.z-z1);if(dx*dx+dz*dz<=m*m)cb(i,p);});}
function vsLibre(V,x0,x1,y0,y1,z0,z1,m,bandes){let ok=true;
  vsPoints(V,x0,x1,z0,z1,m,function(i,p){if(!ok||p.y<y0-40||p.y>y1+60)return;
    if(bandes)for(const b of bandes)if(b&&p.x>=b[0]&&p.x<=b[1]&&p.z>=b[2]&&p.z<=b[3]&&p.y>=b[4]&&p.y<=b[5])return;ok=false;VS_GENE.i=i;VS_GENE.x=Math.round(p.x);VS_GENE.y=Math.round(p.y);VS_GENE.z=Math.round(p.z);});return ok;}
const VS_GENE={i:-1,x:0,y:0,z:0}; /* (banc) le point de route qui a fait abandonner la dernière pièce */
function vsRuns(V,x0,x1,z0,z1,m){ /* les passages de la route dans un rectangle élargi de m : des suites d'indices de pts (pas de la grille, ~12 m), avec leurs y */
  const I=[];vsPoints(V,x0-m,x1+m,z0-m,z1+m,0,function(i){I.push(i);});
  I.sort(function(a,b){return a-b;});const out=[];let cur=null;
  for(const i of I){const y=V.P[i].y;if(cur&&i-cur.i1<=V.pasP*2+1){cur.i1=i;if(y<cur.y0)cur.y0=y;if(y>cur.y1)cur.y1=y;}else{cur={i0:i,i1:i,y0:y,y1:y};out.push(cur);}}
  return out;}
function vsBande(V,r){ /* la BANDE d'une route de scène : le rectangle r et la hauteur de SA route (la suite de points la plus longue dedans) → [x0, x1, z0, z1, y0 − 6, y1 + 6] */
  let best=null;for(const q of vsRuns(V,r[0],r[1],r[2],r[3],0))if(!best||q.i1-q.i0>best.i1-best.i0)best=q;if(!best)return null;
  let y0=1e9,y1=-1e9;for(let i=Math.max(0,best.i0-V.pasP);i<=Math.min(V.P.length-1,best.i1+V.pasP);i++){const p=V.P[i];if(p.x<r[0]||p.x>r[1]||p.z<r[2]||p.z>r[3])continue;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;}
  return y1>-1e8?[r[0],r[1],r[2],r[3],y0-6,y1+6]:null;}
function vsProche(V,x,z,R){let best=-1,bd=R*R;V.proches(x,z,R,function(i){const p=V.P[i],d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd){bd=d;best=i;}});return best;}
function vsAirOk(V,x0,x1,z0,z1,top){for(const a of V.AIRZ){const ex=Math.max(x0-a.x,0,a.x-x1),ez=Math.max(z0-a.z,0,a.z-z1);if(ex*ex+ez*ez<a.r*a.r&&top>a.y-60)return false;}return true;}
function vsReserve(V,essai){ /* essai : (le meilleur-de-N) rien n'est gardé dans CITY */
  const plans=[],hi=ROAD_HALF+14,HC=VS_HC,MS=ROAD_HALF+14,RB=12; /* MS : la marge d'une scène (14 m du bord de la dalle ; les tours ordinaires : 24) · RB : l'axe d'une route de scène reste à ±12 m de sa bande */
  for(const m9 of FILETMARK)if(m9.anc)for(const a of m9.anc){
    if(a.t==='geante'||a.t==='pile')continue; /* (les géantes et les piles des ancres de la v1544 : bâties à part, plus haut dans buildVoxCity) */
    const P0={t:a.t,ok:false,a:a,raison:''};plans.push(P0);const non=function(r){P0.raison=r;if(r==='route'||r==='pont')P0.gene=Object.assign({},VS_GENE);};
    if(a.t==='tunnel'||a.t==='passerelle'||a.t==='rue'){
      const cx=(a.x0+a.x1)/2,cz=(a.z0+a.z1)/2,L=Math.abs((a.x1-a.x0)*a.ux+(a.z1-a.z0)*a.uz);P0.x=cx;P0.z=cz;
      if(a.t==='tunnel'){const Lt=L-20;if(Lt<60){non('court');continue;}const PL=a.ax==='z'?VS_PER.x:VS_PER.z;let D=PL;while(D-hi<14)D+=PL;const Hl=2*D-hi,L2=Lt/2;
        const bd=vsBande(V,vsRect(a.ax,cx,cz,-L2-90,L2+90,-RB,RB));if(!bd){non('bande');continue;}
        const h=VS_H(cx,cz),y0=bd[4]+6,y1=bd[5]-6,top=y1+HC+150+h*260,b=y0-330,Z9=vsRect(a.ax,cx,cz,-L2,L2,-Hl,Hl);
        if(!vsLibre(V,Z9[0],Z9[1],b,top,Z9[2],Z9[3],MS,[bd])){non('route');continue;}if(!vsAirOk(V,Z9[0],Z9[1],Z9[2],Z9[3],top)){non('air');continue;}
        Object.assign(P0,{ok:true,zone:Z9,cx:cx,cz:cz,ax:a.ax,Lt:Lt,D:D,Hl:Hl,y0:y0,y1:y1,top:top,b:b,h:h});}
      else if(a.t==='passerelle'){const PL=a.ax==='z'?VS_PER.x:VS_PER.z;let D=PL;while(D-hi<34)D+=PL;const h=VS_H(cx,cz),hw=Math.min(D-hi-4,V.snap(22+h*14)),dp=V.snap(44+h*18);
        const bd=vsBande(V,vsRect(a.ax,cx,cz,-L/2-90,L/2+90,-RB,RB));if(!bd){non('bande');continue;}
        const y0=bd[4]+6,y1=bd[5]-6,top=y1+280+h*300,b=y0-330;
        const tA=vsRect(a.ax,cx,cz,-dp/2,dp/2,D-hw,D+hw),tB=vsRect(a.ax,cx,cz,-dp/2,dp/2,-D-hw,-D+hw),T1=vsRect(a.ax,cx,cz,-dp/2,dp/2,-D-hw,D+hw),pt=vsRect(a.ax,cx,cz,-8,8,-(D-hw),D-hw);
        if(!vsLibre(V,tA[0],tA[1],b,top,tA[2],tA[3],MS,[bd])||!vsLibre(V,tB[0],tB[1],b,top,tB[2],tB[3],MS,[bd])){non('route');continue;}
        if(!vsLibre(V,pt[0],pt[1],y1+24,y1+(a.deux?110:44),pt[2],pt[3],0,[[pt[0],pt[1],pt[2],pt[3],-1e9,y1+6]])){non('pont');continue;} /* sous le pont, seule SA route passe (30 m plus bas) */
        if(!vsAirOk(V,T1[0],T1[1],T1[2],T1[3],top)){non('air');continue;}
        Object.assign(P0,{ok:true,zone:T1,cx:cx,cz:cz,ax:a.ax,D:D,hw:hw,dp:dp,y0:y0,y1:y1,top:top,b:b,h:h,deux:!!a.deux,tA:tA,tB:tB});}
      else{const Lr=L+60,Wr=ROAD_HALF+80,bd=vsBande(V,vsRect(a.ax,cx,cz,-Lr/2-90,Lr/2+90,-RB-2,RB+2));if(!bd){non('bande');continue;}
        const Z9=vsRect(a.ax,cx,cz,-Lr/2,Lr/2,-Wr,Wr);let ymin=1e9;vsPoints(V,Z9[0],Z9[1],Z9[2],Z9[3],ROAD_HALF+4,function(i,p){if(p.y<ymin)ymin=p.y;});
        const h=VS_H(cx,cz),rue=ymin-12,top=rue+460;
        if(!vsLibre(V,Z9[0],Z9[1],rue-4,rue,Z9[2],Z9[3],0,[[Z9[0],Z9[1],Z9[2],Z9[3],rue+10,1e9]])){non('route');continue;} /* toute route au-dessus de la rue passe à 10 m au moins */
        if(!vsAirOk(V,Z9[0],Z9[1],Z9[2],Z9[3],top)){non('air');continue;}
        Object.assign(P0,{ok:true,zone:Z9,cx:cx,cz:cz,ax:a.ax,ux:a.ux,uz:a.uz,Lr:Lr,Wr:Wr,rue:rue,h:h,bande:bd});}}
    else if(a.t==='facade'||a.t==='phare'){const mg=a.t==='facade'?14:18,rmax=a.R-ROAD_HALF-mg;P0.x=a.x;P0.z=a.z;if(rmax<30){non('petit');continue;}
      let a1=V.snap(rmax*.9),a2=V.snap(a1*.42);while(Math.hypot(a1,a2)>rmax&&a1>12.8){a1-=(typeof VOX_CITY!=="undefined"?VOX_CITY:6.4);a2=V.snap(a1*.42);}if(Math.hypot(a1,a2)>rmax){non('petit');continue;}
      let y0=1e9,y1=-1e9;vsPoints(V,a.x-a.R,a.x+a.R,a.z-a.R,a.z+a.R,ROAD_HALF,function(i,p){const d=Math.hypot(p.x-a.x,p.z-a.z);if(Math.abs(d-a.R)<=ROAD_HALF){if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;}});
      if(!(y1>-1e8)){non('anneau');continue;}
      const h=VS_H(a.x,a.z),top=y1+(a.t==='facade'?200+h*240:140+h*200),b=y0-330,m9=ROAD_HALF+mg-1;
      if(!vsLibre(V,a.x-a1,a.x+a1,b,top,a.z-a2,a.z+a2,m9,null)||!vsLibre(V,a.x-a2,a.x+a2,b,top-14,a.z-a1,a.z+a1,m9,null)){non('route');continue;}
      if(!vsAirOk(V,a.x-a1,a.x+a1,a.z-a1,a.z+a1,top)){non('air');continue;}
      Object.assign(P0,{ok:true,zone:[a.x-a1,a.x+a1,a.z-a1,a.z+a1],cx:a.x,cz:a.z,a1:a1,a2:a2,y0:y0,y1:y1,top:top,b:b,h:h});}
    else if(a.t==='boucle'){const mg=14,rmax=a.R-ROAD_HALF-mg,VX=typeof VOX_CITY!=='undefined'?VOX_CITY:6.4;P0.x=a.x;P0.z=a.z;if(rmax<30){non('petit');continue;} /* LA GÉANTE DE LA BOUCLE : la plus grande croix qui tient */
      let y0=1e9,y1=-1e9;vsPoints(V,a.x-a.R,a.x+a.R,a.z-a.R,a.z+a.R,ROAD_HALF,function(i,p){const d=Math.hypot(p.x-a.x,p.z-a.z);if(Math.abs(d-a.R)<=ROAD_HALF){if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;}});
      if(!(y1>-1e8)){non('anneau');continue;}
      const h=VS_H(a.x,a.z),top=y1+180+h*240,b=y0-330,m9=ROAD_HALF+mg-1;let a1=V.snap(rmax*.9),a2=0,ok=false,r9='route';
      for(;a1>=25;a1-=VX){a2=V.snap(a1*.42);if(Math.hypot(a1,a2)>rmax)continue;
        if(!vsLibre(V,a.x-a1,a.x+a1,b,top,a.z-a2,a.z+a2,m9,null)||!vsLibre(V,a.x-a2,a.x+a2,b,top-14,a.z-a1,a.z+a1,m9,null)){r9='route';continue;}
        if(!vsAirOk(V,a.x-a1,a.x+a1,a.z-a1,a.z+a1,top)){r9='air';continue;}ok=true;break;}
      if(!ok){non(r9);continue;}
      Object.assign(P0,{ok:true,zone:[a.x-a1,a.x+a1,a.z-a1,a.z+a1],cx:a.x,cz:a.z,a1:a1,a2:a2,y0:y0,y1:y1,top:top,b:b,h:h});}
    else if(a.t==='vrille'){P0.x=a.x;P0.z=a.z;const im=vsProche(V,a.x,a.z,60);if(im<0){non('route');continue;} /* LE PONT DE VERRE SOUS LA VRILLE : il croise la route 40 m plus bas, deux tours le portent */
      const v9=a.v|0,ym=V.P[im].y,ax=Math.abs(a.uz)>=Math.abs(a.ux)?'x':'z',h=VS_H(a.x,a.z),hw=V.snap(20+h*8),dp=V.snap(40+h*16),Lb=v9===3?ROAD_HALF+30:ROAD_HALF+74,yb=v9===1?ym-34:ym-44,yt=v9===1?ym-30:ym-37,top=ym+170+h*200,b=ym-330,lp=v9===1?3:8;
      const pont=ax==='x'?[a.x-Lb,a.x+Lb,a.z-lp,a.z+lp]:[a.x-lp,a.x+lp,a.z-Lb,a.z+Lb],tA=ax==='x'?[a.x+Lb,a.x+Lb+2*hw,a.z-dp/2,a.z+dp/2]:[a.x-dp/2,a.x+dp/2,a.z+Lb,a.z+Lb+2*hw],tB=ax==='x'?[a.x-Lb-2*hw,a.x-Lb,a.z-dp/2,a.z+dp/2]:[a.x-dp/2,a.x+dp/2,a.z-Lb-2*hw,a.z-Lb];
      if(v9!==3&&!vsLibre(V,pont[0],pont[1],yb,yt,pont[2],pont[3],ROAD_HALF+4,[[pont[0]-40,pont[1]+40,pont[2]-40,pont[3]+40,yt+26,1e9]])){non('pont');continue;} /* sous le pont, seule la vrille passe (30 m au-dessus de lui au moins) */
      let tours=0;const T9=[];for(const T of [tA,tB])if(vsLibre(V,T[0],T[1],b,top,T[2],T[3],ROAD_HALF+14,null)&&vsAirOk(V,T[0],T[1],T[2],T[3],top)){T9.push(T);tours++;}
      if(!vsAirOk(V,pont[0],pont[1],pont[2],pont[3],yt)){non('air');continue;}
      const zone=[Math.min(pont[0],tA[0],tB[0]),Math.max(pont[1],tA[1],tB[1]),Math.min(pont[2],tA[2],tB[2]),Math.max(pont[3],tA[3],tB[3])];
      if(v9===3&&tours<2){non('route');continue;} /* les tours serrées : les deux, ou rien */
      Object.assign(P0,{ok:true,v:v9,zone:zone,cx:a.x,cz:a.z,ax:ax,pont:v9===3?null:pont,tours:T9,y1:ym,yb:yb,yt:yt,top:top,b:b,h:h});}
    else if(a.t==='toit'){const cx=(a.x0+a.x1)/2,cz=(a.z0+a.z1)/2,w0=ROAD_HALF+12;P0.x=cx;P0.z=cz;
      const Z9=[Math.min(a.x0,a.x1)-w0,Math.max(a.x0,a.x1)+w0,Math.min(a.z0,a.z1)-w0,Math.max(a.z0,a.z1)+w0];
      let ymin=1e9;vsPoints(V,Z9[0],Z9[1],Z9[2],Z9[3],ROAD_HALF+4,function(i,p){if(p.y<ymin)ymin=p.y;});if(!(ymin<1e8)){non('route');continue;}
      const top=ymin-8,b=top-330-VS_H(cx,cz)*80; /* le toit 8 m sous le point le plus bas de toute route qui passe au-dessus de lui, ou à moins d'une demi-dalle de son bord */
      if(!vsLibre(V,Z9[0],Z9[1],b,top,Z9[2],Z9[3],24,[[Z9[0]-24,Z9[1]+24,Z9[2]-24,Z9[3]+24,top+7.5,1e9]])){non('route');continue;}
      if(!vsAirOk(V,Z9[0],Z9[1],Z9[2],Z9[3],top)){non('air');continue;}
      Object.assign(P0,{ok:true,zone:Z9,cx:cx,cz:cz,top:top,b:b,h:VS_H(cx,cz),A:{x:a.x0,z:a.z0},B:{x:a.x1,z:a.z1}});}
    else if(a.t==='noeud'){const Hx=2*VS_PER.x-hi,Hz=2*VS_PER.z-hi,Z9=[a.x-Hx,a.x+Hx,a.z-Hz,a.z+Hz];P0.x=a.x;P0.z=a.z;
      const axU=a.ax,axL=axU==='z'?'x':'z',dm=function(ax){return ax==='z'?Hz:Hx;};
      const bU=vsBande(V,vsRect(axU,a.x,a.z,-dm(axU)-90,dm(axU)+90,-RB,RB)),bL=vsBande(V,vsRect(axL,a.x,a.z,-dm(axL)-90,dm(axL)+90,-RB,RB));
      if(!bU||!bL){non('bande');continue;}
      const yU=[bU[4]+6,bU[5]-6],yL=[bL[4]+6,bL[5]-6];if(yU[0]-6.5-(yL[1]+HC)<10){non('epaisseur');continue;}
      const h=VS_H(a.x,a.z),top=yU[1]+HC+170+h*260,b=yL[0]-330;
      if(!vsLibre(V,Z9[0],Z9[1],b,top,Z9[2],Z9[3],MS,[bU,bL])){non('route');continue;}if(!vsAirOk(V,Z9[0],Z9[1],Z9[2],Z9[3],top)){non('air');continue;}
      Object.assign(P0,{ok:true,zone:Z9,cx:a.x,cz:a.z,Hx:Hx,Hz:Hz,axU:axU,axL:axL,yU:yU,yL:yL,top:top,b:b,h:h});}
    else if(a.t==='portes'){P0.ok=!!(a.q&&a.q.length);if(P0.ok){P0.x=a.q[0].x;P0.z=a.q[0].z;}else non('vide');}
    else if(a.t==='anneau'){P0.ok=true;P0.x=a.x;P0.z=a.z;P0.y1=a.y;if(a.centre){const im=vsProche(V,a.x,a.z,40);if(im<0){P0.ok=false;non('route');}else{a.y=V.P[im].y;P0.y1=a.y;}}} /* (la vrille) centré sur l'axe : sa hauteur, celle de la route finale */ /* (le saut des néons) un anneau de lumière en l'air : du décor, sans emprise */
  }
  if(!essai)CITY.vsP=plans;return plans;}
/* LE DÉCOR, CRITÈRE DU MEILLEUR-DE-N : MESURÉ (banc des maps, 20 villes) — une pièce sur cinq était abandonnée parce qu'une AUTRE partie de la route passait
   trop près (une passerelle et un nœud voisins, une route qui revient frôler son entrée). Les mêmes tests (vsReserve), sur la route candidate échantillonnée
   tous les 10 m : 3 de malus par pièce qui ne tiendrait pas ; le meilleur-de-N garde une route où les scènes se bâtissent. */
function vsMalusDecor(ctrl){
  let n9=0;for(const m9 of FILETMARK)if(m9.anc)for(const a of m9.anc)if(a.t!=='geante'&&a.t!=='pile'&&a.t!=='portes')n9++;if(!n9)return 0;
  const P=[];P.push({x:ctrl[0].x,y:ctrl[0].y,z:ctrl[0].z});
  for(let i=1;i<ctrl.length;i++){const a=ctrl[i-1],b=ctrl[i],d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/10));for(let k=1;k<=n;k++)P.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n,z:a.z+(b.z-a.z)*k/n});}
  const HB=120,G=new Map();P.forEach(function(p,i){const k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let l=G.get(k);if(!l)G.set(k,l=[]);l.push(i);});
  const proches=function(x,z,R9,cb){const r=Math.ceil(R9/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const l=G.get((bx+dx)*100003+(bz+dz));if(l)for(const i of l)cb(i);}};
  const AIRZ=[];for(const m9 of FILETMARK)if(m9.air)for(const a9 of m9.air)AIRZ.push(a9);
  const V={P:P,proches:proches,pasP:1,snap:function(v){const q=typeof VOX_CITY!=="undefined"?VOX_CITY:6.4;return Math.max(1,Math.round(v/q))*q;},AIRZ:AIRZ};
  let perdus=0;for(const p of vsReserve(V,true))if(!p.ok&&p.t!=='portes')perdus++;return perdus*3;}
function vsBloque(cx,cz,hd){const L=CITY.vsP;if(!L)return false;for(const p of L)if(p.ok&&p.zone){const z=p.zone;if(cx+hd>z[0]-6&&cx-hd<z[1]+6&&cz+hd>z[2]-6&&cz-hd<z[3]+6)return true;}return false;}
function vsZonesCrypto(){const out=[],L=CITY.vsP;if(!L)return out;for(const p of L)if(p.ok&&p.zone){const z=p.zone;out.push((z[0]+z[1])/2,(z[2]+z[3])/2,Math.hypot(z[1]-z[0],z[3]-z[2])/2+8);}return out;}
function vsBatir(V){
  const plans=CITY.vsP||[],hi=ROAD_HALF+14,HC=VS_HC,grp=[];let nV=0,nN=0;CITY.abris=[];CITY.couloirs=[];CITY.railN=[];
  const vol=function(x0,x1,y0,y1,z0,z1,g,sp,k){if(x1-x0<.5||y1-y0<.5||z1-z0<.5)return;V.corps.push((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,x1-x0,y1-y0,z1-z0);V.genre.push(g);V.tqC.push(k[0],k[1],k[2]);
    const i=V.genre.length-1;if(sp)V.sp.push(i);k[3].push(i);nV++;};
  const lum=function(x0,x1,y0,y1,z0,z1,c,k){if(x1-x0<.3||y1-y0<.3||z1-z0<.3)return;V.neon.push((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,x1-x0,y1-y0,z1-z0);V.neonC.push(c);V.tqN.push(k[0],k[1],k[2]);nN++;};
  /* une boîte décrite le long d'un axe : [a0, a1] le long de la marche, [l0, l1] en travers, autour du centre (cx, cz) */
  const volA=function(ax,cx,cz,a0,a1,l0,l1,y0,y1,g,sp,k){if(ax==='z')vol(cx+l0,cx+l1,y0,y1,cz+a0,cz+a1,g,sp,k);else vol(cx+a0,cx+a1,y0,y1,cz+l0,cz+l1,g,sp,k);};
  const lumA=function(ax,cx,cz,a0,a1,l0,l1,y0,y1,c,k){if(ax==='z')lum(cx+l0,cx+l1,y0,y1,cz+a0,cz+a1,c,k);else lum(cx+a0,cx+a1,y0,y1,cz+l0,cz+l1,c,k);};
  /* l'INTÉRIEUR d'un couloir : deux bandes de lumière au bord du plafond, une traverse tous les 26 m, les deux bouches cadrées de néon, l'abri (la pluie s'y éteint) */
  const couloir=function(ax,cx,cz,demi,yb,yh,k){const yc=yh;
    lumA(ax,cx,cz,-demi+3,demi-3,-hi+1,-hi+3.2,yc-1.4,yc-.2,6,k);lumA(ax,cx,cz,-demi+3,demi-3,hi-3.2,hi-1,yc-1.4,yc-.2,6,k);
    for(const l of [-hi/2,0,hi/2])lumA(ax,cx,cz,-demi+3,demi-3,l-1.3,l+1.3,yc-1.2,yc-.1,6,k); /* (LE PLAFOND ÉCLAIRÉ) trois bandes de long */
    for(let s=-demi+6.5;s<=demi-6.5;s+=13)lumA(ax,cx,cz,s-1,s+1,-hi+3,hi-3,yc-1,yc-.1,6,k); /* une traverse tous les 13 m */
    {const nR0=V.neon.length/6;for(const e of [-1,1])lumA(ax,cx,cz,-demi+2,demi-2,e*(ROAD_HALF+1)-.7,e*(ROAD_HALF+1)+.7,yb+.2,yb+1.6,(Math.floor(Math.abs(cx*.07+cz*.11))+(e>0?1:3))%5,k);for(let q=nR0;q<V.neon.length/6;q++)CITY.railN.push(q);} /* LES RAILS : le bord de la route est une paroi (murCote) */
    {let i0=1e9,i1=-1;V.proches(cx,cz,demi+hi+30,function(i){const p=V.P[i];if(p.y<yb-8||p.y>yc)return;const a=ax==='z'?p.z-cz:p.x-cx,l=ax==='z'?p.x-cx:p.z-cz;if(Math.abs(a)<=demi+2&&Math.abs(l)<=hi){if(i<i0)i0=i;if(i>i1)i1=i;}});
     if(i1>=0&&V.dsP)CITY.couloirs.push([i0*V.dsP-10,i1*V.dsP+10]);} /* l'intervalle de la route (s) DANS le couloir : villeCouloirIci */
    for(const e of [-1,1]){const s=e*demi;lumA(ax,cx,cz,s-1.6,s+1.6,-hi,-hi+3.2,yb,yc,6,k);lumA(ax,cx,cz,s-1.6,s+1.6,hi-3.2,hi,yb,yc,6,k);lumA(ax,cx,cz,s-1.6,s+1.6,-hi,hi,yc-3,yc,6,k);}
    const Z=ax==='z'?[cx-hi,cx+hi,cz-demi,cz+demi]:[cx-demi,cx+demi,cz-hi,cz+hi];CITY.abris.push([Z[0],Z[1],yb-2,yc,Z[2],Z[3]]);};
  /* le sommet d'une tour de scène : la couronne (une fois sur deux), le mât et son feu */
  const sommet=function(cx,cz,dx,dz,top,k,h){if(h>.4)lum(cx-dx*.53,cx+dx*.53,top-1.4,top+1.4,cz-dz*.53,cz+dz*.53,6,k);const ha=36+h*44;vol(cx-1.2,cx+1.2,top,top+ha,cz-1.2,cz+1.2,2,true,k);lum(cx-2.25,cx+2.25,top+ha-2.25,top+ha+2.25,cz-2.25,cz+2.25,5,k);};
  for(const p of plans){if(!p.ok)continue;const k=[p.cx,(p.b!=null?p.b:p.rue||0)+200,p.cz,[]];grp.push(k[3]);
    if(p.t==='tunnel'){const ax=p.ax,L2=p.Lt/2,cx=p.cx,cz=p.cz,yc=p.y1+HC,fl=p.y0-6.5;
      volA(ax,cx,cz,-L2,L2,-p.Hl,-hi,p.b,yc,0,false,k);volA(ax,cx,cz,-L2,L2,hi,p.Hl,p.b,yc,0,false,k); /* les deux murs, du pied au plafond (leur pied se noie avec la ville) */
      volA(ax,cx,cz,-L2,L2,-hi,hi,p.b,fl,0,false,k);                                                          /* le socle sous la route, 6,5 m sous le bitume */
      volA(ax,cx,cz,-L2,L2,-p.Hl,p.Hl,yc,p.top,0,true,k);                                                     /* la tour au-dessus du hall : elle FLOTTE (sans pied) */
      couloir(ax,cx,cz,L2,fl+6.5,yc,k);sommet(cx,cz,ax==='z'?2*p.Hl:2*L2,ax==='z'?2*L2:2*p.Hl,p.top,k,p.h);
      for(const e of [-1,1]){const s=e*(L2+1.2),la=(p.h-.5)*hi;lumA(ax,cx,cz,s-1.2,s+1.2,la-7,la+7,yc+10,yc+50,(Math.floor(p.h*50)+(e>0?2:0))%5,k);}} /* une enseigne verticale sur chaque façade, au-dessus de la bouche */
    else if(p.t==='noeud'){const cx=p.cx,cz=p.cz,ycL=p.yL[1]+HC,flL=p.yL[0]-6.5,flU=p.yU[0]-6.5,ycU=p.yU[1]+HC;
      const demi=function(ax){return ax==='z'?p.Hz:p.Hx;},lat=function(ax){return ax==='z'?p.Hx:p.Hz;}; /* le long d'un couloir : la demi-longueur de la tour sur son axe ; en travers : l'autre */
      volA(p.axL,cx,cz,-demi(p.axL),demi(p.axL),-lat(p.axL),-hi,p.b,ycL,0,false,k);volA(p.axL,cx,cz,-demi(p.axL),demi(p.axL),hi,lat(p.axL),p.b,ycL,0,false,k); /* les murs du couloir BAS */
      volA(p.axL,cx,cz,-demi(p.axL),demi(p.axL),-hi,hi,p.b,flL,0,false,k);                                                                         /* son socle */
      vol(cx-p.Hx,cx+p.Hx,ycL,flU,cz-p.Hz,cz+p.Hz,0,true,k);                                                                                        /* le bloc entre les deux couloirs */
      volA(p.axU,cx,cz,-demi(p.axU),demi(p.axU),-lat(p.axU),-hi,flU,ycU,0,true,k);volA(p.axU,cx,cz,-demi(p.axU),demi(p.axU),hi,lat(p.axU),flU,ycU,0,true,k); /* les murs du couloir HAUT */
      vol(cx-p.Hx,cx+p.Hx,ycU,p.top,cz-p.Hz,cz+p.Hz,0,true,k);                                                                                      /* la tour au-dessus */
      couloir(p.axL,cx,cz,demi(p.axL),flL+6.5,ycL,k);couloir(p.axU,cx,cz,demi(p.axU),flU+6.5,ycU,k);sommet(cx,cz,2*p.Hx,2*p.Hz,p.top,k,p.h);
      for(const e of [-1,1]){const s=e*(demi(p.axU)+1.2);lumA(p.axU,cx,cz,s-1.2,s+1.2,-7,7,ycU+12,ycU+56,(Math.floor(p.h*50)+(e>0?1:3))%5,k);}}
    else if(p.t==='passerelle'){const cx=p.cx,cz=p.cz,ax=p.ax,yr=p.y1;
      for(const T of [p.tA,p.tB]){vol(T[0],T[1],p.b,p.top,T[2],T[3],0,false,k);const tx=(T[0]+T[1])/2,tz=(T[2]+T[3])/2;sommet(tx,tz,T[1]-T[0],T[3]-T[2],p.top,[tx,k[1],tz,k[3]],p.h);}
      const ponts=p.deux?[30,96]:[30];
      for(const yb of ponts){volA(ax,cx,cz,-8,8,-(p.D-p.hw),p.D-p.hw,yr+yb,yr+yb+7,0,true,k);              /* le pont de verre */
        lumA(ax,cx,cz,-8.6,-7.4,-(p.D-p.hw),p.D-p.hw,yr+yb-.7,yr+yb+.3,6,k);lumA(ax,cx,cz,7.4,8.6,-(p.D-p.hw),p.D-p.hw,yr+yb-.7,yr+yb+.3,6,k);}
      for(const e of [-1,1]){const l=e*(p.D-p.hw-1.1);lumA(ax,cx,cz,-6,6,l-1.1,l+1.1,yr+40,yr+40+70+p.h*40,(Math.floor(p.h*50)+(e>0?0:2))%5,k);}} /* une enseigne sur la face intérieure de chaque tour */
    else if(p.t==='facade'||p.t==='phare'||p.t==='boucle'){const cx=p.cx,cz=p.cz;
      vol(cx-p.a1,cx+p.a1,p.b,p.top,cz-p.a2,cz+p.a2,0,false,k);vol(cx-p.a2,cx+p.a2,p.b,p.top-14,cz-p.a1,cz+p.a1,0,false,k); /* la croix : deux lames, l'une 14 m plus basse (pas de toits confondus) */
      sommet(cx,cz,2*p.a1,2*p.a2,p.top,k,p.h);
      if(p.t==='phare'){const r=p.a1+3;for(let yb=p.y1+24;yb<p.top-30;yb+=Math.max(40,(p.top-p.y1)/5)){ /* les ANNEAUX de lumière autour du phare — seulement AU-DESSUS de la rampe : leurs coins débordent de la croix (audit : à 20 m de la route, à hauteur de caisse) */
          lum(cx-r,cx+r,yb,yb+2.2,cz-r,cz-r+1.6,6,k);lum(cx-r,cx+r,yb,yb+2.2,cz+r-1.6,cz+r,6,k);lum(cx-r,cx-r+1.6,yb,yb+2.2,cz-r+1.6,cz+r-1.6,6,k);lum(cx+r-1.6,cx+r,yb,yb+2.2,cz-r+1.6,cz+r-1.6,6,k);}}
      else for(const e of [-1,1]){lum(cx+e*(p.a1+1.1)-.9,cx+e*(p.a1+1.1)+.9,p.y1-20,p.y1+40,cz-6,cz+6,(Math.floor(p.h*50)+(e>0?1:4))%5,k);lum(cx-6,cx+6,p.y1-20,p.y1+40,cz+e*(p.a1+1.1)-.9,cz+e*(p.a1+1.1)+.9,(Math.floor(p.h*50)+(e>0?2:3))%5,k);}}
    else if(p.t==='vrille'){const P9=p.pont;if(P9){vol(P9[0],P9[1],p.yb,p.yt,P9[2],P9[3],0,true,k); /* le pont de verre (ou le monorail) : il flotte (sans pied) */
      const lgX=P9[1]-P9[0]>P9[3]-P9[2];if(p.v===1){const c9=lgX?[(P9[0]+P9[1])/2-30,(P9[0]+P9[1])/2+30,P9[2]-2.6,P9[3]+2.6]:[P9[0]-2.6,P9[1]+2.6,(P9[2]+P9[3])/2-30,(P9[2]+P9[3])/2+30];lum(c9[0],c9[1],p.yt,p.yt+5,c9[2],c9[3],(Math.floor(p.h*50)+1)%5,k);} /* le train du monorail, en lumière */
      if(lgX){lum(P9[0],P9[1],p.yb-.8,p.yb+.2,P9[2]-.6,P9[2]+.6,6,k);lum(P9[0],P9[1],p.yb-.8,p.yb+.2,P9[3]-.6,P9[3]+.6,6,k);lum(P9[0],P9[1],p.yt-.2,p.yt+.8,P9[2]-.6,P9[2]+.6,(Math.floor(p.h*50))%5,k);lum(P9[0],P9[1],p.yt-.2,p.yt+.8,P9[3]-.6,P9[3]+.6,(Math.floor(p.h*50)+2)%5,k);}
      else{lum(P9[0]-.6,P9[0]+.6,p.yb-.8,p.yb+.2,P9[2],P9[3],6,k);lum(P9[1]-.6,P9[1]+.6,p.yb-.8,p.yb+.2,P9[2],P9[3],6,k);lum(P9[0]-.6,P9[0]+.6,p.yt-.2,p.yt+.8,P9[2],P9[3],(Math.floor(p.h*50))%5,k);lum(P9[1]-.6,P9[1]+.6,p.yt-.2,p.yt+.8,P9[2],P9[3],(Math.floor(p.h*50)+2)%5,k);}} /* ses quatre arêtes de lumière : on les voit passer au-dessus de la tête */
      for(const T of p.tours){vol(T[0],T[1],p.b,p.top,T[2],T[3],0,false,k);sommet((T[0]+T[1])/2,(T[2]+T[3])/2,T[1]-T[0],T[3]-T[2],p.top,[(T[0]+T[1])/2,k[1],(T[2]+T[3])/2,k[3]],p.h);}}
    else if(p.t==='toit'){const z=p.zone,top=p.top,h=p.h;
      vol(z[0],z[1],p.b,top,z[2],z[3],0,false,k);                                                             /* la tour au toit-terrasse */
      lum(z[0],z[1],top-1.4,top+.4,z[2],z[2]+1.4,6,k);lum(z[0],z[1],top-1.4,top+.4,z[3]-1.4,z[3],6,k);lum(z[0],z[0]+1.4,top-1.4,top+.4,z[2]+1.4,z[3]-1.4,6,k);lum(z[1]-1.4,z[1],top-1.4,top+.4,z[2]+1.4,z[3]-1.4,6,k); /* le liseré du toit */
      /* sur le toit, HORS de la bande de la route (la dalle passe 8 m au-dessus) : l'hélistation, des blocs techniques, des mâts */
      const horsRoute=function(x,z9,r){const ax=p.A.x,az=p.A.z,bx=p.B.x,bz=p.B.z,dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z9-az)*dz)/l2)),qx=ax+dx*t,qz=az+dz*t;return Math.hypot(x-qx,z9-qz)>ROAD_HALF+8+r;};
      const cands=[];for(const fx of [.2,.5,.8])for(const fz of [.2,.5,.8])cands.push([z[0]+(z[1]-z[0])*fx,z[2]+(z[3]-z[2])*fz]);
      let heli=false,nb=0;for(const c of cands){const r9=VS_H(c[0],c[1]);
        if(!heli&&horsRoute(c[0],c[1],13)&&c[0]-13>z[0]&&c[0]+13<z[1]&&c[1]-13>z[2]&&c[1]+13<z[3]){heli=true;const x=c[0],zz=c[1]; /* l'hélistation : un cadre et un H de lumière */
          lum(x-12,x+12,top,top+.5,zz-12,zz-10.8,6,k);lum(x-12,x+12,top,top+.5,zz+10.8,zz+12,6,k);lum(x-12,x-10.8,top,top+.5,zz-10.8,zz+10.8,6,k);lum(x+10.8,x+12,top,top+.5,zz-10.8,zz+10.8,6,k);
          lum(x-5,x-3.8,top,top+.6,zz-6,zz+6,6,k);lum(x+3.8,x+5,top,top+.6,zz-6,zz+6,6,k);lum(x-3.8,x+3.8,top,top+.6,zz-.6,zz+.6,6,k);continue;}
        if(nb<5&&horsRoute(c[0],c[1],8)&&r9>.25){nb++;const w=V.snap(6+r9*8),hh=4+r9*6;vol(c[0]-w/2,c[0]+w/2,top,top+hh,c[1]-w/2,c[1]+w/2,0,true,k);}
        else if(r9<.18&&horsRoute(c[0],c[1],4)){const ha=24+r9*120;vol(c[0]-1.2,c[0]+1.2,top,top+ha,c[1]-1.2,c[1]+1.2,2,true,k);lum(c[0]-2.25,c[0]+2.25,top+ha-2.25,top+ha+2.25,c[1]-2.25,c[1]+2.25,5,k);}}}
    else if(p.t==='rue'){const ax=p.ax,cx=p.cx,cz=p.cz,L2=p.Lr/2,W=p.Wr,ru=p.rue,h=p.h;
      volA(ax,cx,cz,-L2,L2,-W,W,ru-4,ru,0,true,k);                                                             /* la RUE : une dalle dure (on y meurt si on tombe) */
      for(const l of [-(ROAD_HALF+8),-(ROAD_HALF+34),ROAD_HALF+8,ROAD_HALF+34])lumA(ax,cx,cz,-L2+4,L2-4,l-.6,l+.6,ru,ru+.5,l<0?5:6,k); /* les files de la circulation */
      for(let s=-L2+18,q=0;s<L2-18;s+=22,q++){const r9=VS_H(cx+s,cz+q),l=(r9<.5?-1:1)*(ROAD_HALF+(r9*4%1<.5?8:34));lumA(ax,cx,cz,s-2.2,s+2.2,l-1.1,l+1.1,ru,ru+1.2,l<0?5:6,k);} /* les voitures : des lucioles rouges d'un côté, blanches de l'autre */
      /* LES MURS : de part et d'autre de l'avenue, des tours posées SUR la rue (sans pied : on voit leur base), à 16 m du bord de la dalle */
      for(const e of [-1,1])for(let s=-L2+20;s<L2-20;){const r9=VS_H(cx+s*1.3+e*7,cz+s*.7-e*3),hw=V.snap(10+r9*10),dp=V.snap(24+r9*20),l0=ROAD_HALF+16;
        if(s+dp>L2-6)break;const t9=ru+140+r9*300,W9=vsRect(ax,cx,cz,s,s+dp,e>0?l0:-l0-2*hw,e>0?l0+2*hw:-l0);if(vsLibre(V,W9[0],W9[1],ru,t9,W9[2],W9[3],ROAD_HALF+14,[p.bande])){volA(ax,cx,cz,s,s+dp,e>0?l0:-l0-2*hw,e>0?l0+2*hw:-l0,ru,t9,0,true,k); /* (un mur que la route frôle à la sortie de l'avenue n'est pas bâti) */
        if(r9>.55)lumA(ax,cx,cz,s+dp/2-6,s+dp/2+6,e>0?l0-1.8:-l0,e>0?l0:-l0+1.8,ru+30,ru+30+40+r9*40,Math.floor(r9*50)%5,k);} /* une enseigne tournée vers l'avenue */
        s+=dp+V.snap(8+r9*14);}}
  }
  /* LES PORTES DE LUMIÈRE : des portiques posés dans le repère de la DALLE (T, Nn, B : ils penchent avec le dévers) — une instance de la matière néon */
  const G9=[],A9=[];for(const p of plans)if(p.ok&&p.t==='portes')for(const q of p.a.q){const i=vsProche(V,q.x,q.z,30);if(i>=0)G9.push(i);}for(const p of plans)if(p.ok&&p.t==='anneau')A9.push(p.a);
  if(G9.length||A9.length){const n=G9.length*3+A9.length*4,im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),villeMatNeon(),n),M=new THREE.Matrix4(),S=new THREE.Vector3(),col=new THREE.Color();let j=0;
    const pose=function(i,ox,oy,sx,sy,sz,c){const p=pts[i],t=T[i],nn=Nn[i],bb=B[i];M.makeBasis(bb,nn,t);M.scale(S.set(sx,sy,sz));M.setPosition(p.x+bb.x*ox+nn.x*oy,p.y+bb.y*ox+nn.y*oy,p.z+bb.z*ox+nn.z*oy);im.setMatrixAt(j,M);im.setColorAt(j,c);j++;};
    const w=ROAD_HALF+5;G9.forEach(function(i,g){col.copy(V.NEON[g%5]);pose(i,-w,13,7,34,2.6,col);pose(i,w,13,7,34,2.6,col);pose(i,0,30.5,2*w+7,3,2.6,col);});
    /* LES ANNEAUX DU SAUT DES NÉONS : un cadre de lumière en travers de la trajectoire du saut, à mi-vol — qui saute passe dedans */
    const ax9=new THREE.Vector3(),ay9=new THREE.Vector3(0,1,0),az9=new THREE.Vector3();A9.forEach(function(a,g){az9.set(a.ux,0,a.uz).normalize();ax9.set(a.uz,0,-a.ux).normalize();col.copy(V.NEON[(g+2)%5]);
      const bar=function(ox,oy,sx,sy){M.makeBasis(ax9,ay9,az9);M.scale(S.set(sx,sy,2.6));M.setPosition(a.x+ax9.x*ox,a.y+oy,a.z+ax9.z*ox);im.setMatrixAt(j,M);im.setColorAt(j,col);j++;};
      bar(-a.w/2,0,3.2,a.h);bar(a.w/2,0,3.2,a.h);bar(0,a.h/2,a.w+3.2,3);bar(0,-a.h/2,a.w+3.2,3);});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;V.root.add(im);trackMeshes.push(im);CITY.vsIm=im;}
  CITY.vsG=grp;CITY.vs=plans.map(function(p){return {t:p.t,ok:p.ok,raison:p.raison||'',gene:p.gene||null,x:p.x!=null?Math.round(p.x):null,z:p.z!=null?Math.round(p.z):null,y:p.y1!=null?Math.round(p.y1):p.top!=null?Math.round(p.top):p.rue!=null?Math.round(p.rue):null};});
  return {volumes:nV,neons:nN,portes:G9.length,poses:plans.filter(function(p){return p.ok;}).length,plans:plans.length};
}
/* LA PLUIE SOUS UN TOIT : 1 si la caméra est sous le plafond d'un couloir (à 2 m près), 0 sinon — pluieTick en éteint l'averse */
/* DANS UN COULOIR (le tunnel, les couloirs du nœud) : les bords de la route sont des parois — la conduite y appelle murCote, comme aux couloirs du canyon */
function villeCouloirIci(){const C=CITY.couloirs;if(!C||!C.length)return false;for(const c of C)if(s>=c[0]&&s<=c[1])return true;return false;}
/* LA CAMÉRA SOUS LE PLAFOND : dans l'emprise d'un couloir, jamais plus haut que le plafond − 3 m ; dehors, la limite remonte de 0,8 m par mètre (elle y descend en douceur) */
function villeCamPlafond(p){const A=CITY.abris;if(!A||!A.length)return;for(const b of A){const ex=Math.max(b[0]-p.x,0,p.x-b[1]),ez=Math.max(b[4]-p.z,0,p.z-b[5]),e=Math.hypot(ex,ez);
  if(e>40||p.y<b[2]||p.y>b[3]+400)continue;const lim=b[3]-3+e*.8;if(p.y>lim)p.y=lim;}}
function villeAbri(p){const A=CITY.abris;if(!A||!A.length)return 0;for(const b of A)if(p.x>b[0]-2&&p.x<b[1]+2&&p.y>b[2]&&p.y<b[3]&&p.z>b[4]-2&&p.z<b[5]+2)return 1;return 0;}
