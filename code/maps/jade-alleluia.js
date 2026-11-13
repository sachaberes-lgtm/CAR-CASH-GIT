/* ===== LA DESCENTE ALLÉLUIA (2026-11-13, Sacha : « trop de tout droit, c'est insupportable, on s'ennuie… la map va trop dans une seule direction ; il faut que ça
   descende beaucoup plus, au moins 45 degrés, voire 50 ; joue sur la taille des trucs ; des zones contemplatives, carte postale : trois îlots bien répartis, puis on
   descend dans un petit couloir d'îlots ; un petit îlot qui flotte et bam, le virage se met juste devant ; on passe sous une cascade ; des formes nouvelles, plus
   larges, des îlots plus petits ; des modules qui interagissent avec le décor ; comme les îles flottantes d'Avatar », puis : « exploite à fond l'endroit et l'envers :
   ça baisse, ça remonte, une spirale derrière des tours, paf paf on passe derrière des tours, on sort d'un couloir et en fait on est à l'envers », puis : « très
   optimisé, en une fois, pas de bug », puis : « pas de torsade trop serrée, et pas plus de 10 secondes dans une même direction » ; et la CHARTE DES ROUTES de la
   supervision (passation/CHARTE-ROUTES.md du banc juge : R1-R10, les mêmes pour les six maps)) =====
   La route de Jade est une DESCENTE faite de SCÈNES, chacune avec SON décor posé pour elle (des tours, des îles, des îlots, des cascades), reliées par des liaisons
   courtes qui tournent toujours. La tortue a un cap ET une pente : les liaisons plongent à 24-32°, le grand plongeon à 50-56° (ses crêtes s'arrondissent à la
   mesure de la vitesse), les montagnes russes remontent ; les demi-tonneaux et le mur
   écrivent leur roulis. PAS DE LOOPING (Sacha, 13/11, après avoir joué : « pas de looping »).
   DEUX FAMILLES (la parité de la graine — charte R5 : deux routes voisines ne partagent que leur climax), chacune quatre scènes, SON ENVERS et deux RACCOURCIS ;
   CHAQUE ROUTE (le paquet) : une des quatre, le 1er raccourci, L'ENVERS, le climax (55-65 %), le 2e raccourci, puis une autre des quatre s'il reste de la place —
   5 modules aux paliers 0-5, 4 plus vite (la première scène est du remplissage : LA DURÉE DES MAPS raccourcit la route) ; la tête en bas sur 10-15 % de CHAQUE
   route (supervision, évaluation n° 2 : « un passage à l'envers sur CHAQUE route, 8-20 % ») :
     famille paire   · plongee (LE GRAND PLONGEON : une crête entre deux pics, 2 s à 50-56°, la ressource, et le virage se met juste devant un îlot)
                     · SON ENVERS : couloir (LE COULOIR QUI RETOURNE : un pic renversé l'annonce, un couloir de pics où la dalle se met à rouler — on en sort LA TÊTE EN BAS au-dessus du vide, puis elle se remet)
                     · ilots (LE COULOIR D'ÎLOTS : un slalom entre de petits îlots à hauteur d'yeux) · chas (LE CHAS DE L'AIGUILLE : deux tours si proches que la
                       route passe tout juste, une île en linteau) · mur (LE MUR DU MASSIF : la dalle couchée à 68-76° contre une paroi de pics, une tour derrière)
                     · raccourcis : spirale (autour d'une tour) · stade (deux demi-tours autour de deux tours)
     famille impaire · tours (DERRIÈRE LES TOURS : 3 virages alternés, chacun enroulé autour de sa tour, paf, paf ; l'avant-dernier remonte)
                     · cascade (SOUS LA CASCADE : une île au-dessus du virage, sa cascade tombe en travers de la route) · russes (LES MONTAGNES RUSSES)
                     · voute (LA VOÛTE D'ÎLES : un balayage en S sous trois ou quatre îles qui flottent juste au-dessus de la route)
                     · SON ENVERS : envers (L'ENVERS SOUS LES ÎLES : un pic renversé l'annonce, puis un virage la tête en bas, le monde à l'endroit sous les roues… au-dessus de la tête)
                     · raccourcis : colimacon (autour d'une île) · puits (autour d'une cage de trois tours)
     LE CLIMAX (toutes) : balcon (LA CARTE POSTALE : un grand virage presque à plat au bord du vide, trois îles de tailles différentes bien réparties, un massif qui
                       pleure ses cascades — puis on plonge), vers 55-65 % de la route, MODMARK.climax.
   LES RACCOURCIS (charte R6) : une LÈVRE presque à plat ; sous elle la route plonge à 30° (LA CHUTE), se redresse (la ressource) et fait une boucle de 360° presque
   à plat autour de son décor ; LA SORTIE-TREMPLIN se recale sur la ligne de la lèvre et remonte à 14-17° sur toute la zone de pose, puis LE REPLAT (sans lui, la
   plus longue droite de la route au palier 20). Qui saute à la lèvre (le saut nitro, volant lâché) se pose sur le tremplin 1,5-2,3 s plus tard, ~200-250 m plus
   loin, à toutes les vitesses : le vrai saut (VEQ_K.saut × SPD, pesanteur 23-28 m/s²) est joué à chaque essai (`racOk`), et LE COULOIR DU VOL (jadeCouloirVol)
   n'y laisse rien poser. MODMARK.rac (i0 = la lèvre, i1 = la pose), LES FILS D'OR (jadeFilsOr) dessinent le vol.
   PAS DE TORSADE TROP SERRÉE (R3 : ≤ 60°/s, ≤ 45°/s au 95e centile) : tout roulis écrit suit `rp` (la vitesse jamais plus de 1,11 × la moyenne) — un demi-tonneau
   en 5 s (≤ 40°/s), la dalle du mur se couche en ~2,8 s ; plus de looping, de vrille ni de tire-bouchon.
   JAMAIS PLUS DE 10 S DANS UNE MÊME DIRECTION (R1) ni de tout droit qui ennuie (R2) : LA BOUSSOLE (un cap visé qui tourne de 95-150° toutes les 4,5-6,5 s ; une
   liaison arrivée dessus en choisit une autre) et LE GARDE-FOU (si les 6 dernières secondes tiennent dans 60°, la route vire de 70-100°) ; chaque essai est mesuré
   comme le juge : la tangente 3D dans un cône de 30° (≤ 8 s visés) et de 8° (≤ 3,6 s), le roulis, l'envers (8-20 %, ≤ 8,8 s d'affilée), le plus court écart entre
   deux passages (≥ 20 m), les raccourcis ; le meilleur de N essais est gardé. Jade roule comme les autres maps roulées : TORD.on (la caméra, le vol et le bord de la
   route suivent la dalle ; TORD.pente : la pente pousse toujours) — le saut part et retombe vers la dalle quittée (VOLR_FIGE), c'est la physique du juge.
   `?sans=jadev3` rend la vallée d'avant (genJade1) ; `?jscene=russes,couloir` impose les premières scènes. Les décors : JADE.deco3 (tours, îles, cascades :
   jadeDeco3Pose, jade-3) et JADE.pose (les pics au bord, comme avant) ; JADE.zc3 : les scènes où rien ne se pose au hasard près de la route. */
const JADE_V3=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadev3(,|&|$)/.test(location.search);
const JADE_A={essais:10,force:typeof location==='undefined'?null:((/[?&]jscene=([a-z,]+)/.exec(location.search)||[])[1]||null),bank:20*Math.PI/180,demi:5};
const JA_FAM=[{autres:['plongee','ilots','chas','mur'],env:'couloir',rac:['spirale','stade']},{autres:['tours','cascade','russes','voute'],env:'envers',rac:['colimacon','puits']}];
const JA_CLES=['plongee','couloir','ilots','chas','mur','spirale','stade','tours','cascade','russes','voute','envers','colimacon','puits','balcon'];
const JA_ENVERS={couloir:1,envers:1,mur:1};
/* LES ÎLES (des gabarits à part, après les rochers : JADE_ILE0) — rayon (m), hauteur (m), sorte : 4 l'île (dessus plat, dessous en cône), 5 le massif (large, en gradins) */
const JADE_ILE=[[8,16,4],[13,25,4],[21,40,4],[31,58,4],[64,128,5],[88,166,5]];
const JADE_ILE0=JADE_NTPL+3;
function jadeIleDe(r,massif){let bi=-1,bd=1e9;for(let k=0;k<JADE_ILE.length;k++){if(!!massif!==(JADE_ILE[k][2]===5))continue;const d=Math.abs(JADE_ILE[k][0]-r);if(d<bd){bd=d;bi=k;}}return JADE_ILE0+Math.max(0,bi);}
function genJadeA(rnd,graine){const g0=(rnd()*4294967296)>>>0,gr=(graine==null?g0:graine)|0,fam=gr&1,rot=(gr>>>1)%JA_FAM[gr&1].autres.length,t0=performance.now();let best=null;const notes=[];
  for(let e=0;e<JADE_A.essais;e++){const r9=jadeAGen(mulberry32((g0^Math.imul(e+1,0x9E3779B1))>>>0),fam,rot);r9.essai=e;notes.push(+r9.note.toFixed(2));if(!best||r9.note<best.note)best=r9;if(r9.note<=.6)break;}
  best.notes=notes;best.fam=fam;best.ms=Math.round(performance.now()-t0);jadeAApplique(best);return best.ctrl;}
function jadeAGen(r,fam,rot){
  const vP=typeof vPalier==='function'?vPalier():78,rP=typeof rayonPalier==='function'?rayonPalier():63,vT=vP*(DUREE_ELAN[0]+(DUREE_ELAN[1]-DUREE_ELAN[0])*Math.min(1,Math.max(0,engTier|0)/DUREE.t1)), /* vT : LA VITESSE RESSENTIE (1,8 × la croisière au palier 0, la croisière au palier 25 : la durée des maps et le juge comptent avec elle) */RH=ROAD_HALF||26,rd=Math.PI/180,PI=Math.PI;
  const LC=Math.max(3400,(typeof longueurCible==='function'&&longueurCible())||6400);
  const C=[],RO=[],NX=[],D=[],MM=[],ZC=[],MK=[],SCN=[],RAC=[];
  let P=new THREE.Vector3(0,0,0),phi=r()*6.2832,th=0,lon=0,scCur=-1,cible=phi,tCible=0;const phi0=phi;
  const sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x),ang=a=>Math.atan2(Math.sin(a),Math.cos(a));
  /* LA RAMPE : de 0 à 1, une vitesse qui monte en 10 % du temps, reste, puis retombe — jamais plus de 1,11 × la moyenne (le roulis : pas de torsade trop serrée) */
  const rp=u=>{u=u<0?0:u>1?1:u;return u<.1?u*u/.18:u>.9?1-(1-u)*(1-u)/.18:(u-.05)/.9;};
  const Fv=f=>new THREE.Vector3(Math.sin(f),0,Math.cos(f)),Sv=f=>new THREE.Vector3(Math.cos(f),0,-Math.sin(f)),Y=new THREE.Vector3(0,1,0);
  const push=(ro,nx)=>{C.push(P.clone());RO.push(ro==null?NaN:ro);NX.push(nx||null);};
  const k=()=>C.length-1;
  /* va : `len` m (dans l'espace), le cap tourne de `dP`, la pente passe de la courante à `th1` (en douceur) ; o.ro(u) : le roulis écrit ; o.dro : le roulis total
     (au moins un point de contrôle tous les ~14° de roulis) ; o.n : au moins n pas */
  const va=(len,dP,th1,o)=>{o=o||{};const t0=th,n=Math.max(o.n||0,2,Math.ceil(len/42),Math.ceil(Math.abs(dP)/.14),Math.ceil(Math.abs(th1-t0)/.1),Math.ceil(Math.abs(o.dro||0)/.24));
    for(let i=1;i<=n;i++){const tm=t0+(th1-t0)*sm((i-.5)/n);phi+=dP/n/2;const l9=len/n;
      P.x+=Math.cos(tm)*Math.sin(phi)*l9;P.y+=Math.sin(tm)*l9;P.z+=Math.cos(tm)*Math.cos(phi)*l9;phi+=dP/n/2;th=t0+(th1-t0)*sm(i/n);push(o.ro?o.ro(i/n):null,null);}
    lon+=len;};
  const arcP=(Rp,dP,th1,o)=>va(Rp*Math.abs(dP)/Math.max(.35,Math.cos((th+th1)/2)),dP,th1,o); /* un arc de rayon Rp EN PLAN (exact à pente constante) */
  /* LA CRÊTE : une pente qui s'accentue s'arrondit à la mesure de la vitesse (rayon ≈ 0,85 v²/g, g = la pesanteur du vol) — sinon un saut pris dessus file loin au-dessus de la route */
  const crete=(th1,dP)=>{const d=th-th1,lc=Math.min(2.2*vT,Math.max(.6*vT,d>0?.85*vT*vT/23*d:0)),s9=dP?(dP>0?1:-1):(r()<.5?-1:1);va(lc,s9*Math.max(Math.abs(dP||0),(22+r()*10)*rd),th1);}; /* au plus 2,2 s, et elle tourne d'au moins 22° */
  const centre=(Rp,sg)=>P.clone().addScaledVector(Sv(phi),sg*Rp);
  const surArc=(c,f0,sg,al,dist)=>c.clone().addScaledVector(Sv(f0+sg*al),-sg*dist); /* le point de l'arc (centre c, parti au cap f0) après `al` rad, à `dist` du centre */
  const dec=o=>{o.sc=scCur;if(o.k==null)o.k=k();D.push(o);return o;};
  const pic=(k9,s9,r9,h9,gap)=>dec({t:'pic',k:k9,s:s9,r:r9,h:h9,gap:gap});
  /* LA BOUSSOLE : toutes les 4,5-6,5 s de route, le cap visé tourne de 95-150° — `cote(net)` : le côté (±1) dont le cap de sortie (cap + côté × net) est le plus près
     du cap visé (un sur huit au hasard) ; `vers()` : le côté de la boussole (0 : on y est) */
  const vers=()=>{const d=ang(cible-phi);return Math.abs(d)<15*rd?0:d>0?1:-1;};
  const boussole=()=>{const t9=lon/vP;if(t9-tCible<4.5+r()*2)return;tCible=t9;cible=phi+(r()<.5?-1:1)*(95+r()*55)*rd;};
  /* le cap moyen (en plan) de la route entre t1 et t2 secondes en arrière (les bouts presque verticaux ne comptent pas) */
  const capMoyen=(t1,t2)=>{let acc=0,sx=0,sz=0;for(let i=C.length-1;i>0;i--){const a=C[i-1],b=C[i],l=a.distanceTo(b);acc+=l;if(acc<t1*vT)continue;if(acc>t2*vT)break;const dx=b.x-a.x,dz=b.z-a.z,lp=Math.hypot(dx,dz);if(lp<.3*l)continue;sx+=dx;sz+=dz;}return sx*sx+sz*sz>1?Math.atan2(sx,sz):null;};
  let nForce=0;const garde=()=>{if(lon<5*vT)return;const c0=capMoyen(0,1.5);if(c0==null)return;let mn=0,mx=0;for(let q=1;q<4;q++){const c=capMoyen(1.5*q,1.5*q+1.5);if(c==null)continue;const d=ang(c-c0);if(d<mn)mn=d;if(d>mx)mx=d;}if(mx-mn>=60*rd)return; /* les 6 dernières secondes en quatre caps moyens : s'ils tiennent tous dans 60°, la route vire */
    const d=ang(cible-phi),sg=Math.abs(d)>10*rd?(d>0?1:-1):(r()<.5?-1:1);arcP((2.1+r()*.5)*rP,sg*(70+r()*30)*rd,th<-.1?th:-(22+r()*6)*rd);nForce++;}; /* LE GARDE-FOU : jamais plus de 10 s dans la même direction */
  const cote=net=>{if(r()<.12)return r()<.5?-1:1;if(Math.abs(net)<.2)return ang(cible-phi)>=0?1:-1;return Math.abs(ang(phi+net-cible))<=Math.abs(ang(phi-net-cible))?1:-1;};
  /* LA LIAISON : des arcs (35-80°, 2,1-3 rP) qui vont vers le cap visé ; arrivée dessus, elle en choisit un autre (une fois) ; parfois une respiration de 0,5-1,3 s ; la pente 24-32° */
  const liaison=dur=>{boussole();garde();let reste=dur*vT,sg=r()<.5?-1:1,prem=true,neuve=false;const thL=-(30+r()*8)*rd;
    while(reste>40){if(!prem&&r()<.25){const ld=Math.min(reste,(.5+r()*.8)*vT);va(ld,(r()-.5)*8*rd,thL);reste-=ld;if(reste<40)break;}
      let d=ang(cible-phi),a;if(Math.abs(d)<=22*rd&&!neuve){neuve=true;tCible=lon/vP;cible=phi+(r()<.5?-1:1)*(95+r()*55)*rd;d=ang(cible-phi);}
      if(Math.abs(d)>22*rd){sg=d>0?1:-1;a=Math.max(35*rd,Math.min(Math.abs(d),(45+r()*35)*rd));}else{sg=prem?sg:-sg;a=(35+r()*30)*rd;}
      const Rp=(2.6+r()*1.0)*rP,l=Rp*a/Math.cos(thL),f9=Math.min(1,(reste+40)/l);va(l*f9,sg*a*f9,thL);reste-=l*f9;prem=false;}};
  /* LE RACCOURCI (forme : spirale | stade | colimacon | puits) — une lèvre presque à plat, une boucle de 360° qui descend de ~100-120 m, la sortie-tremplin sous la lèvre */
  const raccourci=forme=>{const sg=r()<.5?-1:1,thS=-(4.5+r()*1)*rd;
    va(.6*vP,(r()-.5)*14*rd,-2*rd);va(.45*vP,0,-2*rd);const iL=k(),pL=P.clone(),fL=phi; /* LA LÈVRE : la file d'or part d'ici */
    va(.5*vP,sg*10*rd,-30*rd); /* LA CHUTE SOUS LA LÈVRE : la route plonge à 30° en tournant — le saut file tout droit au-dessus */
    va(.45*vP,sg*8*rd,thS); /* la ressource : la boucle repart presque à plat */
    if(forme==='stade'){const R1=(1.5+r()*.15)*rP,Lg=(.7+r()*.3)*vP,c1=centre(R1,sg);arcP(R1,sg*(PI-18*rd),thS);va(Lg,0,thS);const c2=centre(R1,sg);arcP(R1,sg*PI,thS);va(Lg,0,thS);
      for(const c of [c1,c2])dec({t:'tour',x:c.x,z:c.z,r:R1-RH-8,top:pL.y+100+r()*120,foot:P.y-120,k:iL});} /* LE STADE : deux demi-tours autour de deux tours */
    else{const Rp=(1.85+r()*.2)*rP,c=centre(Rp,sg);arcP(Rp,sg*(2*PI-18*rd),thS);const yb=P.y;
      if(forme==='spirale')dec({t:'tour',x:c.x,z:c.z,r:Rp-RH-8,top:pL.y+90+r()*110,foot:yb-80,k:iL}); /* LA SPIRALE : la route s'enroule derrière une tour géante */
      else if(forme==='colimacon')dec({t:'ile',x:c.x,z:c.z,y:(pL.y+yb)/2,r:Math.min(88,(Rp-RH-12)/1.3),massif:Rp-RH-12>=80?1:0,k:iL,casc:1}); /* LE COLIMAÇON : autour d'une île qui flotte à mi-hauteur */
      else for(let j=0;j<3;j++){const an=fL+j*2.094+.5,q=c.clone().add(new THREE.Vector3(Math.sin(an),0,Math.cos(an)).multiplyScalar(Rp*.38));dec({t:'tour',x:q.x,z:q.z,r:Rp*.62-RH-10,top:pL.y+60+r()*140,foot:yb-100,k:iL});}} /* LE PUITS : une cage de trois tours */
    {const Sl=Sv(fL),e=(P.x-pL.x)*Sl.x+(P.z-pL.z)*Sl.z,dh=ang(phi-fL),Lc=.55*vP,psi=Math.max(-.35,Math.min(.35,-e/Lc-dh/2)); /* l'écart de côté et de cap avec la ligne de la lèvre */
      va(Lc,psi,(14+r()*3)*rd);va(Lc,-psi,th);const dh2=ang(phi-fL);va((2.1+r()*.2)*vP,-dh2,th);va((1+r()*.2)*vP,0,(r()*3-1)*rd);} /* LA SORTIE-TREMPLIN : recalée sur la ligne de la lèvre, elle monte sur toute la zone de pose (les vols de 0,9 à 1,9 × la croisière s'y posent), puis LE REPLAT : elle se couche presque à plat — sans lui, c'était la plus longue droite (2,8 s au palier 20) */
    RAC.push({iL:iL,sc:scCur});};
  const S9={
    spirale(){raccourci('spirale');},stade(){raccourci('stade');},colimacon(){raccourci('colimacon');},puits(){raccourci('puits');},
    tours(){const n=3,thD=-(26+r()*7)*rd;let sg=cote(0);
      for(let j=0;j<n;j++){const v9=vers(),a=(78+r()*22)*rd*(v9===0?1:v9===sg?1.25:.75),Rp=(1.9+r()*.35)*rP,thA=j===n-2&&r()<.75?(8+r()*7)*rd:thD; /* l'alternance dérive vers la boussole ; l'avant-dernier remonte : ça baisse, ça remonte */
        va(.25*vT,0,thA);const c=centre(Rp,sg),y0=P.y,i0=k();arcP(Rp,sg*a,thA);
        dec({t:'tour',x:c.x,z:c.z,r:Rp-RH-7,top:Math.max(y0,P.y)+120+r()*140,foot:Math.min(y0,P.y)-140,k:i0});sg=-sg;}},
    couloir(){const sg=r()<.5?-1:1,thC=-(22+r()*5)*rd,a=(14+r()*10)*rd*cote(1),i0=k();
      va((.5+r()*.1)*vT,a,thC);const iR=k();va(JADE_A.demi*vT,(35+r()*15)*rd*cote(1),thC,{dro:PI,ro:u=>sg*PI*rp(u)}); /* le couloir : la dalle y roule d'un demi-tour, en 5 s */
      const i1=Math.round(iR+(k()-iR)*.65);let acc=0;
      for(let i=i0+1;i<=i1;i++){acc+=C[i].distanceTo(C[i-1]);if(acc<40)continue;acc=0;for(const s9 of [-1,1])pic(i,s9,12+r()*10,130+r()*170,5+r()*3);} /* les murs de pics */
      dec({t:'pic',k:Math.round((i0+iR)/2),dessus:1,inv:1,r:18+r()*10,clear:38+r()*8,gap:8}); /* L'ANNONCE : il pend, renversé */
      const Le=(1.1+r()*.3)*vT,ae=(40+r()*30)*rd*cote(1),i2=k();va(Le,ae,-(24+r()*6)*rd,{ro:()=>sg*PI});const i3=k(); /* LA TÊTE EN BAS, au-dessus du vide, dans un virage */
      for(let j=0;j<3;j++){const ii=Math.round(i2+(i3-i2)*(.22+.26*j));dec({t:'pic',k:ii,dessus:1,inv:1,r:20+r()*12,clear:50+r()*25,gap:8}); /* au-dessus (le monde à l'endroit, sous les roues) */
        dec({t:'ile',k:ii,rel:1,s:j%2?1:-1,lat:RH+40+r()*70,dy:-(70+r()*90),r:13+r()*14});} /* et dessous (au-dessus de la tête) */
      va(JADE_A.demi*vT,(35+r()*15)*rd*cote(1),-(26+r()*5)*rd,{dro:PI,ro:u=>sg*PI*(1+rp(u))});}, /* le tonneau s'achève, aussi doucement */
    plongee(){const thP=-(52+r()*4)*rd,s1=r()<.5?-1:1,aT=(110+r()*30)*rd,sgT=cote(aT);
      crete(thP,s1*(20+r()*10)*rd);const iC=k();for(const s9 of [-1,1])pic(iC,s9,22+r()*10,150+r()*120,7+r()*3); /* LA CRÊTE : on bascule entre deux pics */
      va((1.9+r()*.5)*vT,s1*(28+r()*10)*rd,thP);va(.9*vT,s1*12*rd,-(16+r()*4)*rd); /* 2 s à 50-56° (jamais tout droit), la ressource */
      const Rp=(1.9+r()*.25)*rP,f0=phi,c=centre(Rp,sgT),iT=k();arcP(Rp,sgT*aT,-(12+r()*4)*rd);
      const al=Math.min(aT*.45,55*rd),ri=10+r()*6,iA=Math.min(k(),iT+Math.max(1,Math.round((k()-iT)*al/aT))),q=surArc(c,f0,sgT,al,Rp+RH+7+ri*.9);
      dec({t:'ile',x:q.x,z:q.z,y:C[iA].y+6+r()*10,r:ri,k:iT});}, /* L'ÎLOT : là où filait le plongeon — le virage se met juste devant lui */
    cascade(){const a=(55+r()*30)*rd,Rp=(2.3+r()*.4)*rP,sg=cote(a),thC=-(26+r()*5)*rd;
      va(.4*vT,0,thC);const iA=k();arcP(Rp,sg*a,thC);const iM=Math.round((iA+k())/2),ri=24+r()*8;
      dec({t:'ile',k:iM,rel:1,s:-sg,lat:ri*.55,dy:40+ri*.95+r()*20,r:ri,cascRoute:sg}); /* L'ÎLE au-dessus du virage, décalée vers l'extérieur : sa cascade tombe en travers */
      dec({t:'ile',k:iA,rel:1,s:-sg,lat:RH+110+r()*120,dy:-(40+r()*60),r:30,casc:1});},
    voute(){const n=3+(r()<.5?1:0),thV=-(22+r()*6)*rd;let sg=cote(0); /* LA VOÛTE D'ÎLES : un balayage en S sous trois ou quatre îles qui flottent juste au-dessus de la route — on passe dessous, la lumière tombe entre elles */
      va(.3*vT,0,thV);
      for(let j=0;j<n;j++){const v9=vers(),a=(34+r()*14)*rd*(v9===0?1:v9===sg?1.3:.7),Rp=Math.max(2.2*rP,(1.0+r()*.25)*vT/a);arcP(Rp,sg*a*.5,thV);const ka=k(); /* chaque virage ~1,1 s ; le slalom dérive vers la boussole */
        const ri=13+r()*8;dec({t:'ile',k:ka,rel:1,s:(r()-.5)*.5,lat:0,dy:30+ri*1.25+r()*8,r:ri}); /* l'île au-dessus de la route, au milieu du virage (son cône s'arrête ~15-30 m au-dessus de la caisse) */
        if(j%2)dec({t:'ile',k:ka,rel:1,s:-sg,lat:RH+16+r()*24,dy:-(24+r()*40),r:8+r()*6,bord:1}); /* et une petite, plus bas, au bord */
        arcP(Rp,sg*a*.5,thV);sg=-sg;}
      va(.4*vT,(r()-.5)*12*rd,-(26+r()*4)*rd);},
    balcon(){const a=(95+r()*45)*rd,Rp=(3.3+r()*.8)*rP,sg=cote(a),thB=-(6+r()*3)*rd,i0=k();
      va(.6*vT,0,thB);const iA=k(),fA=phi,pA=P.clone(),yA=P.y;arcP(Rp,sg*a,thB);const iB=k();ZC.push([i0,iB]);
      const fM=fA+sg*a*.5,tri=[[-.1,250+r()*60,30+r()*25,13+r()*4,0],[.32,470+r()*90,-(110+r()*60),26+r()*6,0],[.72,780+r()*160,-(40+r()*80),70+r()*18,1]]; /* LE TRIO : petit, moyen, massif */
      for(const t9 of tri){const an=fM-sg*t9[0],x=pA.x+Math.sin(an)*t9[1],z=pA.z+Math.cos(an)*t9[1];
        dec({t:'ile',x:x,z:z,y:yA+t9[2],r:t9[3],massif:t9[4],casc:t9[4]?2:1,k:iA,dR:t9[1]});}
      crete(-(49+r()*4)*rd,sg*18*rd);va((1.3+r()*.3)*vT,sg*(24+r()*12)*rd,th);va(.7*vT,sg*10*rd,-(26+r()*4)*rd);}, /* et on PIQUE : 48-52°, en tournant */
    ilots(){const n=4+2*((r()*2)|0),thI=-(25+r()*5)*rd;let sg=cote(0);
      for(let j=0;j<n;j++){const v9=vers(),a=(40+r()*14)*rd*(v9===0?1:v9===sg?1.35:.65),Rp=(1.95+r()*.25)*rP;arcP(Rp,sg*a*.5,thI);const ka=k(); /* le slalom dérive vers la boussole */
        {const r1=7+r()*4,r2=7+r()*5;dec({t:'ile',k:ka,rel:1,s:sg,lat:RH+5+r1*1.45+r()*3,dy:-2+r()*14,r:r1,bord:1});dec({t:'ile',k:ka,rel:1,s:-sg,lat:RH+8+r2*1.45+r()*4,dy:-4+r()*16,r:r2,bord:1});} /* au creux et dehors, à hauteur d'yeux */
        if(j%2)dec({t:'ile',k:ka,rel:1,s:(r()-.5)*.6,lat:0,dy:28+r()*8,r:6+r()*3});
        arcP(Rp,sg*a*.5,thI);sg=-sg;}},
    russes(){const sg=cote(1.6); /* les deux bosses tournent du même côté (~90°) */
      for(let j=0;j<2;j++){if(j)garde();crete(-(44+r()*6)*rd,sg*10*rd);va(.4*vT,sg*10*rd,th);va(.6*vT,sg*12*rd,(12+r()*7)*rd);va(.3*vT,sg*8*rd,th); /* on plonge, on tient, on remonte */
        const i9=k();for(const s9 of [-1,1])pic(i9,s9,14+r()*8,140+r()*140,6+r()*3);va(.3*vT,sg*6*rd,-4*rd);}}, /* la crête entre deux tours */
    chas(){const a=(60+r()*30)*rd,Rp=(2+r()*.3)*rP,sg=cote(a);arcP(Rp,sg*a,-(14+r()*4)*rd);va(.5*vT,(r()-.5)*10*rd,-8*rd);const i9=k();
      for(const s9 of [-1,1])pic(i9,s9,24+r()*12,170+r()*140,3.5+r());dec({t:'pic',k:i9,dessus:1,r:16+r()*8,clear:30+r()*6,gap:6}); /* le chas : deux tours, un linteau */
      crete(-(46+r()*6)*rd,(r()-.5)*24*rd);va(.7*vT,(r()-.5)*20*rd,th);}, /* et on plonge derrière */
    envers(){const sg=r()<.5?-1:1,a=(75+r()*35)*rd*cote(1),thE=-(24+r()*6)*rd;
      {const iA=k();va(.5*vT,(r()-.5)*10*rd,thE);dec({t:'pic',k:Math.round((iA+k())/2),dessus:1,inv:1,r:16+r()*10,clear:44+r()*14,gap:8});} /* L'ANNONCE : un pic renversé pend au-dessus de la route — le décor bascule */
      va(JADE_A.demi*vT,(35+r()*15)*rd*cote(1),thE,{dro:PI,ro:u=>sg*PI*rp(u)});const i0=k();va((1.1+r()*.3)*vT,a,thE,{ro:()=>sg*PI});const i1=k(); /* le demi-tonneau (5 s), la tête en bas dans un virage */
      for(let j=0;j<4;j++){const ii=Math.round(i0+(i1-i0)*(.14+.24*j));dec({t:'pic',k:ii,dessus:1,inv:1,r:18+r()*14,clear:45+r()*30,gap:8});}
      for(let j=0;j<3;j++){const ii=Math.round(i0+(i1-i0)*(.2+.3*j));dec({t:'ile',k:ii,rel:1,s:j%2?1:-1,lat:RH+30+r()*80,dy:-(60+r()*90),r:12+r()*16});}
      va(JADE_A.demi*vT,(35+r()*15)*rd*cote(1),-26*rd,{dro:PI,ro:u=>sg*PI*(1-rp(u))});}, /* on se remet à l'endroit (dans l'autre sens) */
    mur(){const a=(160+r()*30)*rd,Rp=Math.max((2.4+r()*.2)*rP,7.4*vT/a),sg=cote(a),thM=-(14+r()*4)*rd,bk=(68+r()*8)*rd,cb=Math.cos(bk);
      va(.5*vT,0,thM);const c=centre(Rp,sg),y0=P.y,i0=k(),f0=phi,fr=Math.min(.45,2.8*vT/(Rp*a));arcP(Rp,sg*a,thM,{dro:2*bk,ro:u=>-sg*bk*Math.min(rp(u/fr),rp((1-u)/fr))});const i1=k(); /* la dalle se couche en ~2,8 s, se relève de même */
      dec({t:'tour',x:c.x,z:c.z,r:Rp-RH*cb-62,top:Math.max(y0,P.y)+120+r()*120,foot:Math.min(y0,P.y)-150,k:i0}); /* LA TOUR au centre, derrière la paroi */
      for(let j=1;j<=6;j++){const al=a*j/7,ri=17+r()*6,q=surArc(c,f0,sg,al,Rp-RH*cb-6-ri),ii=Math.round(i0+(i1-i0)*j/7);dec({t:'tour',x:q.x,z:q.z,r:ri,top:C[ii].y+100+r()*120,foot:C[ii].y-120,k:ii,clr:RH*cb+5});}}}; /* LA PAROI : des pics contre le bord bas de la dalle couchée */
  const scene=(nom,o)=>{boussole();garde();scCur=SCN.length;const i0=k();SCN.push({nom:nom,i0:i0,i1:i0});S9[nom]();SCN[scCur].i1=k();
    const m={i0:i0,i1:k(),nom:nom,fig:nom};if(o&&o.climax)m.climax=1;MM.push(m);MK.push(nom);scCur=-1;};
  /* LE PAQUET (2026-11-13 ; puis la supervision, évaluation n° 2 : « un passage à l'envers sur CHAQUE route, 8-20 % ; vise 5-6 modules ») : la famille de la
     graine ; A (une de ses quatre scènes, tournées d'une graine à l'autre — paliers 0-5 : plus vite, la route raccourcit), le 1er raccourci, L'ENVERS de la famille (annoncé par un pic renversé, joué sur du calme,
     ressorti sur un balayage), le climax vers 55-65 %, le 2e raccourci, puis B s'il reste de la place. Jamais deux figures à l'envers de suite. */
  const mel=A=>{for(let i=A.length-1;i>0;i--){const j=(r()*(i+1))|0,x=A[i];A[i]=A[j];A[j]=x;}return A;};
  const F9=JA_FAM[fam&1],a4=F9.autres.slice(),autres=a4.slice(rot|0).concat(a4.slice(0,rot|0)),racs=mel(F9.rac.slice()); /* les autres TOURNENT d'une graine à l'autre de la famille (R5 : sur 8 graines, toutes les scènes passent) */
  if(r()<.5){const x=autres[1];autres[1]=autres[2];autres[2]=x;}
  let file=(LC>=34*vT?[autres[0]]:[]).concat([racs[0],F9.env]);const apres=[racs[1]],plus=LC>=34*vT?autres.slice(1):[]; /* A : le remplissage, tant que la longueur visée le permet (LA DURÉE DES MAPS : plus courte aux grands paliers) */
  if(JADE_A.force){const v=JADE_A.force.split(',').filter(function(c){return JA_CLES.indexOf(c)>=0;});file=v.concat(file.filter(function(c){return v.indexOf(c)<0;}));if(v.indexOf(racs[1])>=0)apres.length=0;}
  push(null,null);
  va(Math.max(2*vP,200),(r()-.5)*8*rd,0,{n:4}); /* L'OUVERTURE : 2 s de croisière après le portail, à plat */
  va(.8*vT,(r()<.5?-1:1)*(20+r()*15)*rd,-16*rd); /* et ça bascule, en tournant */
  const fin9=2.2*vT,vus={};let climax=false,der=null;
  const suite=(nom,o)=>{if(vus[nom])return;vus[nom]=1;if(der)liaison(.5+r()*.5);scene(nom,o);der=nom;if(o&&o.climax)climax=true;};
  for(const nom of file)suite(nom,nom==='balcon'?{climax:1}:null);
  if(!climax)suite('balcon',{climax:1});
  for(const nom of apres)suite(nom);
  for(const nom of plus){if(lon>LC-fin9-7*vT)break;if(JA_ENVERS[nom]&&JA_ENVERS[der])continue;suite(nom);} /* B (et plus) s'il reste de la place */
  boussole();garde();{const d=ang(cible-phi),sg=Math.abs(d)>5*rd?(d>0?1:-1):(r()<.5?-1:1);arcP((2.3+r()*.4)*rP,sg*Math.max(35*rd,Math.min(60*rd,Math.abs(d))),-8*rd);}const iFin=k();va(fin9,0,0,{n:3}); /* LA FIN */
  /* ---- les décors relatifs (au bord d'un point, `rel`) passent dans le monde ---- */
  const tan=i=>{const a=C[Math.max(0,i-1)],b=C[Math.min(C.length-1,i+1)];let tx=b.x-a.x,tz=b.z-a.z;const l=Math.hypot(tx,tz)||1;return [tx/l,tz/l];};
  for(const o of D)if(o.rel){const p=C[o.k],t=tan(o.k);o.x=p.x+t[1]*o.s*o.lat;o.z=p.z-t[0]*o.s*o.lat;o.y=p.y+o.dy;if(o.cascRoute){o.cascDir=[t[1]*o.cascRoute,-t[0]*o.cascRoute];}}
  /* ---- LE DÉVERS et LES NORMALES (passées à buildTrack par TORD.N) : le roulis écrit (demi-tonneaux, mur), les normales écrites (NX : plus aucune scène ne s'en sert), ailleurs la dalle
     se couche vers l'intérieur du virage (courbure lissée sur ±W, tanh), éteinte près de ce qui est écrit, au départ et à l'arrivée ---- */
  const n=C.length,sc=new Float64Array(n),kap=new Float32Array(n),hh=new Float32Array(n),W9=Math.max(JADE_BANK.W,.9*vT),WE=Math.max(110,.8*vT); /* lissé sur ~0,9 s de route ressentie */
  for(let i=1;i<n;i++)sc[i]=sc[i-1]+C[i].distanceTo(C[i-1]);
  for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)];hh[i]=Math.max(1,a.distanceTo(b)/2);}
  for(let i=1;i<n-1;i++){const ax=C[i].x-C[i-1].x,az=C[i].z-C[i-1].z,bx=C[i+1].x-C[i].x,bz=C[i+1].z-C[i].z,la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);
    kap[i]=(la<2||lb<2||NX[i])?0:Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((C[i].distanceTo(C[i-1])+C[i+1].distanceTo(C[i]))/2);}
  const lisse=a9=>{const o9=new Float32Array(n);for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W9;j--){sw+=hh[j];sk+=a9[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W9;j++){sw+=hh[j];sk+=a9[j]*hh[j];}o9[i]=sk/sw;}return o9;};
  const kl=lisse(lisse(kap)),kref=1/(2.4*1.8*rP),ecr=[];for(let i=0;i<n;i++)if(!isNaN(RO[i])||NX[i])ecr.push(sc[i]);
  const N=[];let bmx=0;
  for(let i=0;i<n;i++){if(NX[i]){N.push(NX[i].clone());continue;}
    let m=sm(sc[i]/300)*sm((sc[n-1]-sc[i])/260);for(const e of ecr){const d=Math.abs(sc[i]-e);if(d<WE+20)m=Math.min(m,sm((d-12)/WE));}
    const b9=isNaN(RO[i])?JADE_A.bank*Math.tanh(kl[i]/kref)*m:RO[i],t=tan(i);
    N.push(new THREE.Vector3(-t[1]*Math.sin(b9),Math.cos(b9),t[0]*Math.sin(b9)));if(isNaN(RO[i])&&Math.abs(b9)>bmx)bmx=Math.abs(b9);}
  for(let i=1;i<n;i++)if(N[i].lengthSq()<1e-6)N[i].copy(N[i-1]);
  /* ---- LES CONTRÔLES, COMME LE JUGE (passation/CHARTE-ROUTES.md) : la route rééchantillonnée tous les 4 m, ses normales (celles des points de contrôle, mélangées),
     la tangente 3D ; les cônes de 30° et de 8°, le roulis lissé sur 0,5 s, l'envers, le plus court écart entre deux passages, les raccourcis au tir ---- */
  const PAS=4,Ltot=sc[n-1],nR=Math.max(3,Math.floor(Ltot/PAS)+1),Q=new Float64Array(nR*3),NN=new Float64Array(nR*3),TT=new Float64Array(nR*3),BB=new Float64Array(nR*3),SS=new Float64Array(nR),KI=new Float64Array(nR);
  {let kk=0;for(let q=0;q<nR;q++){const s=Math.min(Ltot,q*PAS);while(kk<n-2&&sc[kk+1]<s)kk++;const ds=(sc[kk+1]-sc[kk])||1,t=Math.max(0,Math.min(1,(s-sc[kk])/ds)),A=C[kk],B9=C[kk+1],NA=N[kk],NB=N[kk+1];
    Q[q*3]=A.x+(B9.x-A.x)*t;Q[q*3+1]=A.y+(B9.y-A.y)*t;Q[q*3+2]=A.z+(B9.z-A.z)*t;NN[q*3]=NA.x+(NB.x-NA.x)*t;NN[q*3+1]=NA.y+(NB.y-NA.y)*t;NN[q*3+2]=NA.z+(NB.z-NA.z)*t;SS[q]=s;KI[q]=kk+t;}}
  for(let q=0;q<nR;q++){const a=Math.max(0,q-1),b=Math.min(nR-1,q+1);let x=Q[b*3]-Q[a*3],y=Q[b*3+1]-Q[a*3+1],z=Q[b*3+2]-Q[a*3+2];const l=Math.hypot(x,y,z)||1;TT[q*3]=x/l;TT[q*3+1]=y/l;TT[q*3+2]=z/l;
    let nx=NN[q*3],ny=NN[q*3+1],nz=NN[q*3+2];const d=nx*TT[q*3]+ny*TT[q*3+1]+nz*TT[q*3+2];nx-=d*TT[q*3];ny-=d*TT[q*3+1];nz-=d*TT[q*3+2];let ln=Math.hypot(nx,ny,nz);if(ln<1e-4){nx=0;ny=1;nz=0;ln=1;}
    NN[q*3]=nx/ln;NN[q*3+1]=ny/ln;NN[q*3+2]=nz/ln;BB[q*3]=TT[q*3+1]*NN[q*3+2]-TT[q*3+2]*NN[q*3+1];BB[q*3+1]=TT[q*3+2]*NN[q*3]-TT[q*3]*NN[q*3+2];BB[q*3+2]=TT[q*3]*NN[q*3+1]-TT[q*3+1]*NN[q*3];}
  const dotT=(a,b)=>TT[a*3]*TT[b*3]+TT[a*3+1]*TT[b*3+1]+TT[a*3+2]*TT[b*3+2];
  const tenue=deg=>{const c9=Math.cos(deg*rd);let best=0;for(let i=0;i<nR-1;i++){let j=i+1;while(j<nR&&dotT(i,j)>=c9)j++;const d=SS[j-1]-SS[i];if(d>best)best=d;if(j>=nR)break;}return best/vT;};
  const t30=tenue(30),t8=tenue(8);
  let rMax=0,rP95=0;{const inc=new Float64Array(nR);for(let i=0;i<nR-1;i++){const tx=TT[i*3],ty=TT[i*3+1],tz=TT[i*3+2];let mx=NN[i*3+3],my=NN[i*3+4],mz=NN[i*3+5];const d=mx*tx+my*ty+mz*tz;mx-=d*tx;my-=d*ty;mz-=d*tz;
      const ax=NN[i*3],ay=NN[i*3+1],az=NN[i*3+2],cx=ay*mz-az*my,cy=az*mx-ax*mz,cz=ax*my-ay*mx;inc[i]=Math.atan2(cx*tx+cy*ty+cz*tz,ax*mx+ay*my+az*mz);}
    const w=Math.max(1,Math.round(.5*vT/PAS)),tx9=[];let acc=0;for(let i=0;i<nR-1;i++){acc+=inc[i];if(i>=w)acc-=inc[i-w];if(i>=w-1)tx9.push(Math.abs(acc)/(w*PAS)*vT/rd);}
    tx9.sort(function(a,b){return a-b;});if(tx9.length){rMax=tx9[tx9.length-1];rP95=tx9[Math.min(tx9.length-1,Math.floor(.95*tx9.length))];}}
  let env=0,envR=0,envMax=0;for(let q=0;q<nR;q++){if(NN[q*3+1]<0){env++;envR+=PAS;if(envR>envMax)envMax=envR;}else envR=0;}const envPart=env/nR*100,envMaxS=envMax/vT;
  const CG=40,cle9=(x,y,z)=>((Math.floor(x/CG)&1023)*1024+(Math.floor(y/CG)&1023))*1024+(Math.floor(z/CG)&1023),grille=new Map();
  for(let q=0;q<nR;q+=1){const cx=Math.floor(Q[q*3]/CG),cy=Math.floor(Q[q*3+1]/CG),cz=Math.floor(Q[q*3+2]/CG);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const kk=(((cx+a)&1023)*1024+((cy+b)&1023))*1024+((cz+c)&1023);let l=grille.get(kk);if(!l)grille.set(kk,l=[]);l.push(q);}}
  let dMin=1e9;for(let q=0;q<nR;q+=3){const l=grille.get(cle9(Q[q*3],Q[q*3+1],Q[q*3+2]));if(!l)continue;for(const j of l){if(SS[j]>SS[q]-200)continue;const d=Math.hypot(Q[q*3]-Q[j*3],Q[q*3+1]-Q[j*3+1],Q[q*3+2]-Q[j*3+2]);if(d<dMin)dMin=d;}}
  /* LE TIR (la physique du juge et du jeu : pesanteur du vol 23 m/s² le long de la normale quittée, impulsion du saut 21 m/s, 6 s au plus) */
  const qDe=ic=>{let b=0;for(let q=0;q<nR;q++)if(KI[q]<=ic)b=q;else break;return b;};
  const vole=(i,lat,vMul,yaw,vUp,minAhead,g9)=>{const nx=NN[i*3],ny=NN[i*3+1],nz=NN[i*3+2],cy=Math.cos(yaw*rd),sy=Math.sin(yaw*rd),g=g9||23,dt=1/30;
    let px=Q[i*3]+BB[i*3]*lat,py=Q[i*3+1]+BB[i*3+1]*lat,pz=Q[i*3+2]+BB[i*3+2]*lat;const v0=vP*vMul;
    let vx=(TT[i*3]*cy+BB[i*3]*sy)*v0+nx*vUp,vy=(TT[i*3+1]*cy+BB[i*3+1]*sy)*v0+ny*vUp,vz=(TT[i*3+2]*cy+BB[i*3+2]*sy)*v0+nz*vUp,dist=0;
    for(let t=0;t<6;t+=dt){const ox=px,oy=py,oz=pz;vx-=nx*g*dt;vy-=ny*g*dt;vz-=nz*g*dt;px+=vx*dt;py+=vy*dt;pz+=vz*dt;dist+=Math.hypot(vx,vy,vz)*dt;
      const l=grille.get(cle9(px,py,pz));if(!l)continue;
      for(const j of l){if(SS[j]<SS[i]+minAhead)continue;const qx=Q[j*3],qy=Q[j*3+1],qz=Q[j*3+2],Nx=NN[j*3],Ny=NN[j*3+1],Nz=NN[j*3+2];
        const h=(px-qx)*Nx+(py-qy)*Ny+(pz-qz)*Nz,h0=(ox-qx)*Nx+(oy-qy)*Ny+(oz-qz)*Nz;if(!(h0>0&&h<=0&&h>-8))continue;
        if(Math.abs((px-qx)*BB[j*3]+(py-qy)*BB[j*3+1]+(pz-qz)*BB[j*3+2])>=RH)continue;if(Math.abs((px-qx)*TT[j*3]+(py-qy)*TT[j*3+1]+(pz-qz)*TT[j*3+2])>=PAS*1.6)continue;
        const vv=Math.hypot(vx,vy,vz)||1;return {j:j,dist:dist,cosA:(vx*TT[j*3]+vy*TT[j*3+1]+vz*TT[j*3+2])/vv};}}
    return null;};
  let racOk=0,racRob=0;const racInfo=[];
  for(const R9 of RAC){const qL=qDe(R9.iL),vms=new Set();let pose=-1;
    for(const vm of [1.2,.9,1.5,1.8])for(const opt9 of [[0,21],[-(RH+.5),0],[RH+.5,0]])for(const yaw of [0,-12,12]){if(vms.has(vm)||vms.size>=3)continue;const v9=vole(qL,opt9[0],vm,yaw,opt9[1],120);
      if(!v9||v9.cosA<Math.cos(55*rd)||SS[v9.j]-SS[qL]-v9.dist<150)continue;vms.add(vm);if(vm===1.2||pose<0)pose=v9.j;}
    let vrai=0;for(const vm of [1,1.5,1.9]){let ok9=false;for(const yaw of [0,-8,8]){const v9=vole(qL,0,vm,yaw,VEQ_K.saut*SPD,120,28);if(v9&&v9.cosA>=Math.cos(55*rd)&&SS[v9.j]-SS[qL]-v9.dist>=150){ok9=true;break;}}if(ok9)vrai++;}R9.vrai=vrai;
    if(vms.size>=2&&vrai>=2)racOk++;if(vms.size>=3&&vrai>=2)racRob++;R9.i1=pose>=0?Math.max(R9.iL+1,Math.round(KI[pose])):null;racInfo.push(vms.size);
    if(R9.sc>=0&&R9.i1!=null){const m=MM[R9.sc];m.i0=R9.iL;m.i1=R9.i1;m.rac=1;}racInfo[racInfo.length-1]=vms.size+'/'+vrai;}
  /* ---- LES DÉCORS des scènes ne touchent pas la route d'une autre ; aucun passage à moins de 45 m de haut d'un autre (en plan à moins de 2 demi-largeurs + 26 m) ---- */
  const scE=new Int16Array(nR).fill(-1);for(let q9=0;q9<SCN.length;q9++)for(let q=0;q<nR;q++)if(KI[q]>=SCN[q9].i0&&KI[q]<=SCN[q9].i1)scE[q]=q9;
  let croisDur=0;{const dP=2*RH+26;for(let q=0;q<nR;q+=3){const l=grille.get(cle9(Q[q*3],Q[q*3+1],Q[q*3+2]));if(!l)continue;for(const j of l){if(j<=q||SS[j]-SS[q]<350||(scE[q]>=0&&scE[q]===scE[j]))continue;
    if(Math.hypot(Q[q*3]-Q[j*3],Q[q*3+2]-Q[j*3+2])<dP&&Math.abs(Q[q*3+1]-Q[j*3+1])<45)croisDur++;}}}
  const TPLH=r9=>{let h=190;for(const t9 of JADE_TPL)if(t9[0]<=r9)h=t9[1];return h;};
  let confl=0;const conflits=[];
  for(const o of D){if(o.t!=='tour'&&o.t!=='ile')continue;const sc9=o.sc>=0?SCN[o.sc]:null,a9=sc9?sc9.i0-1:-1,b9=sc9?sc9.i1+1:-1;
    const rr=o.t==='tour'?Math.min(o.r,56):o.r,hi=o.t==='tour'?o.top:o.y+o.r*1.1,lo=o.t==='tour'?o.top-TPLH(rr):o.y-o.r*1.1;let hit=false;
    for(let q=0;q<nR&&!hit;q+=2){const e=KI[q];if(e>=a9&&e<=b9)continue;const py=Q[q*3+1];if(py<lo-15||py>hi+15)continue;if(Math.hypot(Q[q*3]-o.x,Q[q*3+2]-o.z)<rr+RH+8)hit=true;}
    if(hit){confl++;conflits.push(o.t+(sc9?':'+sc9.nom:''));o.ko=1;}}
  const note=croisDur*.2+confl*1.2+Math.abs(lon-LC)/LC*3+Math.max(0,t30-8)*1.5+Math.max(0,t8-3.6)*2+Math.max(0,rMax-50)*.2+Math.max(0,rP95-30)*.2
    +Math.max(0,envPart-20)*.5+Math.max(0,8-envPart)*.5+Math.max(0,envMaxS-8.8)*2+(dMin<20?5:0)+Math.max(0,2-racOk)*4+(racRob>=1?0:3);
  const vri=[];{let a9=-1;for(let i=0;i<=n;i++){const e=i<n&&(!isNaN(RO[i])||NX[i]);if(e&&a9<0)a9=i;if(!e&&a9>=0){vri.push({s0:Math.round(sc[a9]),s1:Math.round(sc[i-1])});a9=-1;}}}
  let yMin=1e9;for(const p of C)if(p.y<yMin)yMin=p.y;
  let pMax=0;for(let q=0;q<nR;q++){const dv=-Math.asin(Math.max(-1,Math.min(1,TT[q*3+1])))/rd;if(dv>pMax&&!(Math.abs(NN[q*3+1])<.2))pMax=dv;} /* (la pente la plus raide, en degrés, hors des points presque verticaux) */
  return {ctrl:C,N:N,D:D,MM:MM,MK:MK,ZC:ZC,SCN:SCN,RAC:RAC,note:note,croisDur:croisDur,confl:confl,conflits:conflits,t30:+t30.toFixed(1),t8:+t8.toFixed(1),rollMax:Math.round(rMax),rollP95:Math.round(rP95),
    envers:+envPart.toFixed(1),enversMaxS:+envMaxS.toFixed(1),dMin:Math.round(dMin),racOk:racOk,racRob:racRob,racVm:racInfo,nForce:nForce,lon:Math.round(lon),LC:Math.round(LC),penteMax:Math.round(pMax),
    chute:Math.round(-yMin),pente:+(-yMin/Math.max(1,lon)).toFixed(3),phi0:phi0,iFin:iFin,bankMax:Math.round(bmx*57.3),vri:vri,vP:Math.round(vP),vT:Math.round(vT),rP:Math.round(rP)};}
function jadeAApplique(b){
  MODMARK.length=0;CAMPM.length=0;for(const m of b.MM)MODMARK.push(m);
  JADE.bankN=b.N; /* (toujours : les demi-tonneaux et le mur en ont besoin) */JADE.bankMax=b.bankMax;JADE.ras=null;JADE.pics=null;JADE.lev=null;JADE.frol=0;
  const C=b.ctrl,tan=i=>{const a=C[Math.max(0,i-1)],c=C[Math.min(C.length-1,i+1)];const tx=c.x-a.x,tz=c.z-a.z,l=Math.hypot(tx,tz)||1;return [tx/l,tz/l];};
  /* les pics au bord (comme les modules d'avant : jadeBatit les pose avec `un`) */
  const PO=[];for(const o of b.D){if(o.t!=='pic')continue;const p=C[o.k],t=tan(o.k);PO.push({x:p.x,z:p.z,y:p.y,ix:(o.s||0)*t[1],iz:-(o.s||0)*t[0],r:o.r,h:o.h||0,bas:0,gap:o.gap,dessus:o.dessus||0,clear:o.clear||0,inv:o.inv||0});}
  JADE.pose=PO.length?PO:null;
  JADE.deco3=b.D.filter(function(o){return o.t==='tour'||o.t==='ile';}).map(function(o){return {t:o.t,x:o.x,y:o.y,z:o.z,r:o.r,top:o.top,foot:o.foot,massif:o.massif||0,coeur:o.coeur||0,inv:o.inv||0,
    casc:o.casc||0,cascDir:o.cascDir||null,clr:o.clr,dR:o.dR,bord:o.bord||0,ko:o.ko||0};});
  JADE.zc3=b.ZC.map(function(z){return [C[z[0]].clone(),C[z[1]].clone()];});
  JADE.rac3=b.RAC.filter(function(R9){return R9.i1!=null;}).map(function(R9){return {p0:C[R9.iL].clone(),p1:C[R9.i1].clone()};}); /* les lèvres des raccourcis (les fils d'or : jadeFilsOr) */
  JADE.Q={depart:{p:C[0].clone(),phi:b.phi0},fin:{p:C[b.iFin].clone(),phi:0}};
  JADE.vrille=b.vri;JADE.desc=b.pente;JADE.mk=b.MK;
  JADE.a3={ms:b.ms,note:+b.note.toFixed(2),essai:b.essai,notes:b.notes,famille:b.fam,croisDur:b.croisDur,confl:b.confl,conflits:b.conflits,nForce:b.nForce,t30:b.t30,t8:b.t8,rollMax:b.rollMax,rollP95:b.rollP95,
    envers:b.envers,enversMaxS:b.enversMaxS,dMin:b.dMin,racOk:b.racOk,racRob:b.racRob,racVm:b.racVm,penteMax:b.penteMax,lon:b.lon,LC:b.LC,chute:b.chute,pente:b.pente,bankMax:b.bankMax,vP:b.vP,vT:b.vT,rP:b.rP,
    scenes:b.SCN.map(function(s){return s.nom;}),climax:b.MM.filter(function(m){return m.climax;}).map(function(m){return m.nom;}),raccourcis:b.MM.filter(function(m){return m.rac;}).map(function(m){return m.nom;})};}
/* ===== LA POSE DES DÉCORS DES SCÈNES (jadeBatit, avant les rangs au hasard) — X : les outils de jadeBatit {G, pose, proches, pgVois, snap, jr, ZC (sortie : les
   tranches de route calmes, en indices de pts), CASC (sortie : les cascades)} ===== */
function* jadeDeco3Pose(X){
  JADE.n3={tours:0,iles:0,refus:0,cascades:0,pourquoi:{}};const non=c=>{JADE.n3.pourquoi[c]=(JADE.n3.pourquoi[c]||0)+1;};JADE.cascR=[];const L3=JADE.deco3;
  /* le PROFIL d'un gabarit : pour chaque rangée de cubes, le rayon de sa case pleine la plus éloignée de l'axe (gardé sur le gabarit : une fois par session) */
  const rayons=T9=>{if(T9.rY)return T9.rY;const G9=T9.G,nx=G9.nx,nz=G9.nz,d9=G9.d,M9=T9.M,rY=new Float32Array(G9.ny);
    for(let y=0;y<G9.ny;y++){let m=0;const o9=nx*nz*y;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(d9[o9+i+nx*j]){const e=(i+.5-M9)*(i+.5-M9)+(j+.5-M9)*(j+.5-M9);if(e>m)m=e;}rY[y]=m>0?(Math.sqrt(m)+.71)*VX:0;}
    return T9.rY=rY;};
  /* la dalle (sur toute sa largeur) et la caisse (4 m au-dessus) n'entrent pas dans la montagne gonflée de `marge` : à la hauteur de chaque point, le rayon de SA rangée (et des voisines à moins de marge) */
  const libre=(cx,cz,T9,yb,yt,inv,marge)=>{const rY=rayons(T9),ny=rY.length,H9=ny*VX,rmx=T9.rmax*VX;let ok=true;
    X.proches(cx,cz,rmx+ROAD_HALF+marge+8,function(i){if(!ok)return;const p=pts[i],b=B[i],nn=Nn[i];
      for(let w=-1;w<=1;w++)for(let u=0;u<=4;u+=4){const x=p.x+b.x*ROAD_HALF*w+nn.x*u,y=p.y+b.y*ROAD_HALF*w+nn.y*u,z=p.z+b.z*ROAD_HALF*w+nn.z*u;
        const hy=inv?yt-y:y-yb;if(hy<-marge||hy>H9+marge)continue;const dh=Math.hypot(x-cx,z-cz);if(dh>rmx+marge)continue;
        let rr=0;for(let k9=Math.max(0,Math.floor((hy-marge)/VX)),k1=Math.min(ny-1,Math.floor((hy+marge)/VX));k9<=k1;k9++)if(rY[k9]>rr)rr=rY[k9];
        if(dh<rr+marge){ok=false;JADE.n3.der={i:i,hy:Math.round(hy),dh:Math.round(dh),rr:Math.round(rr),H:Math.round(H9),w:w,u:u};return;}}});return ok;};
  const voisin=(cx,cz,rm,bas,haut)=>X.pgVois(cx,cz,function(q){return Math.hypot(q[0]-cx,q[1]-cz)<(q[2]+rm)*.9&&haut>q[3]-6&&bas<q[4]+6;});
  if(L3)for(const o of L3){if(performance.now()>JF.lim)yield;
    if(o.t==='tour'){const span=o.top-o.foot,cand=[];for(let t=0;t<JADE_NTPL;t++)if(X.G.p[t].rmax*VX<=o.r)cand.push(t);
      cand.sort(function(a,b){const ha=X.G.p[a].yTop*VX>=span,hb=X.G.p[b].yTop*VX>=span;if(ha!==hb)return ha?-1:1;return X.G.p[b].rmax-X.G.p[a].rmax;}); /* assez haute d'abord, puis la plus large */
      let ok=false;for(const t of cand){const T9=X.G.p[t],rm=T9.rmax*VX,Hs=T9.yTop*VX,cx=X.snap(o.x),cz=X.snap(o.z),yt=Math.ceil(o.top/VX)*VX;
        if(yt-Hs<JADE.merY+20){non('tour-abime');continue;}
        if(!libre(cx,cz,T9,yt-Hs,yt,o.inv,o.clr!=null?Math.max(2,o.clr-ROAD_HALF):5)){non('tour-route');continue;}if(voisin(cx,cz,rm,yt-Hs,yt)){non('tour-voisin');continue;}if(!jadeVolLibre(X.CV,cx,cz,rm,yt-Hs,yt)){non('tour-vol');continue;}
        const q9=[cx,cz,rm,yt-Hs,yt,t,(X.jr()*4)|0,X.jr(),ROAD_HALF+12];if(o.inv)q9.inv=1;X.pose(q9);JADE.n3.tours++;ok=true;break;}
      if(!ok){JADE.n3.refus++;if(!cand.length)non('tour-aucun-gabarit');}}
    else{let ok=false;for(let e=0;e<3&&!ok;e++){const t=Math.max(o.massif?JADE_ILE0+4:JADE_ILE0,jadeIleDe(o.r,o.massif)-e),T9=X.G.p[t];if(!T9)break;const rm=T9.rmax*VX,Hs=T9.yTop*VX,cx=X.snap(o.x),cz=X.snap(o.z);
        let yt=Math.round((o.y+Hs/2)/VX)*VX;if(yt-Hs<JADE.merY+20)yt=Math.ceil((JADE.merY+20+Hs)/VX)*VX;
        if(!libre(cx,cz,T9,yt-Hs,yt,o.inv,o.coeur?3:o.bord?2.5:6)){non('ile-route'+(o.coeur?'-coeur':o.bord?'-bord':''));continue;}if(voisin(cx,cz,rm,yt-Hs,yt)){non('ile-voisin');continue;}if(!jadeVolLibre(X.CV,cx,cz,rm,yt-Hs,yt)){non('ile-vol');continue;}
        const q9=[cx,cz,rm,yt-Hs,yt,t,(X.jr()*4)|0,X.jr(),o.dR!=null?o.dR:ROAD_HALF+30];if(o.inv)q9.inv=1;X.pose(q9);JADE.n3.iles++;ok=true;
        /* LES CASCADES : du bord de l'île vers le vide — `cascDir` : celle qui tombe en travers de la route */
        const nc=o.cascDir?1:(o.casc|0);for(let c=0;c<nc;c++){const d=o.cascDir?o.cascDir:(function(){const an=X.jr()*6.2832;return [Math.cos(an),Math.sin(an)];})();
          const lg=Math.min(ALLEGE?420:900,Math.max(120,yt-JADE.eauY)*(o.cascDir?.95:.6+X.jr()*.3));
          X.CASC.push([cx+d[0]*rm*.8,yt-1.5,cz+d[1]*rm*.8,d[0],d[1],o.cascDir?16+X.jr()*6:9+X.jr()*9,lg,X.jr()]);JADE.n3.cascades++;
          if(o.cascDir)JADE.cascR.push({x:cx+d[0]*rm*.8,z:cz+d[1]*rm*.8,y:yt,w:20,vu:false});}}
      if(!ok)JADE.n3.refus++;}}
  /* LE CALME : les tranches de route des scènes contemplatives (en indices de pts) — rien ne s'y pose au hasard près de la route */
  if(JADE.zc3)for(const z of JADE.zc3){let ia=0,ib=0,da=1e18,db=1e18;for(let i=0;i<NP;i+=3){const a=pts[i].distanceToSquared(z[0]),b=pts[i].distanceToSquared(z[1]);if(a<da){da=a;ia=i;}if(b<db){db=b;ib=i;}}X.ZC.push([Math.min(ia,ib)-60,Math.max(ia,ib)+60]);}}
/* ===== SOUS LA CASCADE : la caisse traverse l'eau (une gerbe d'écume, l'écran qui tremble un peu) — JADE.cascR (rangée avec la carte : voir JADE_CH) ===== */
function jadeCascRoute(){if(JADE.dbgSaut!=null&&mode==='drive'&&s>=JADE.dbgSaut){JADE.dbgSaut=null;try{JADE.dbgSautOk=veqSaut();}catch(e){JADE.dbgSautOk=String(e);}} /* (banc : dbgJadeRac) */
  const L9=JADE.cascR;if(!L9||!L9.length||!started||gameOver||mode==='boom'||!carGroup)return;const c=carGroup.position;
  for(const w of L9){const d=Math.hypot(c.x-w.x,c.z-w.z);if(d>w.w*.6+6){if(d>w.w+40)w.vu=false;continue;}if(w.vu||c.y>w.y)continue;w.vu=true;shake=Math.max(shake,.22);
    if(typeof spawnP==='function'&&typeof spray!=='undefined')for(let i=0;i<46;i++)spawnP(spray,c.x+(Math.random()-.5)*14,c.y+1+Math.random()*5,c.z+(Math.random()-.5)*14,(Math.random()-.5)*16,4+Math.random()*12,(Math.random()-.5)*16,.7+Math.random()*.9);}}
/* ===== LES FILS D'OR DE JADE (charte des routes § 2 : « les raccourcis se signalent pareil partout ») — au-dessus de chaque lèvre de raccourci, une file de pièces EN L'AIR
   (`air` : prises en vol seulement) dessine le saut nitro lancé à la croisière du palier, comme le vrai vol (l'impulsion VEQ_K.saut le long de la normale de la lèvre, la
   pesanteur du vol FALL_G × gK le long d'elle aussi : VOLR_FIGE), jusqu'à sa pose sur la sortie-tremplin. Qui roule voit l'or filer au-dessus du vide ; qui saute le cueille.
   Comme ceux de l'orbite (espFilsOr) ; `?filsor=0` = sans. ===== */
/* LE COULOIR DU VOL (2026-11-13) : les vols d'un saut nitro lancé de chaque lèvre de raccourci (VEQ_K.saut le long de la normale, à 1, 1,4 et 1,9 × la croisière, pesanteur
   du vol 23 et 28 m/s² le long de la normale quittée : VOLR_FIGE), joués jusqu'à leur pose ; leurs points dans une grille (cases de 60 m). jadeBatit n'y pose rien. */
function jadeCouloirVol(){if(!JADE.rac3||!JADE.rac3.length||!(NP>1))return null;const t09=performance.now(),G9=new Map(),CS=60,vc=typeof vPalier==='function'?vPalier():78,imN=VEQ_K.saut*SPD,h=1/30,P9=new THREE.Vector3(),V9=new THREE.Vector3(),D9=new THREE.Vector3();
  const pres=p=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(p);if(d<bd){bd=d;bi=i;}}return bi;};let n=0;
  for(const R9 of JADE.rac3){const i0=pres(R9.p0),i1=pres(R9.p1),Nl=Nn[i0];
    for(const vm of [1,1.4,1.9])for(const g of [23,28]){P9.copy(pts[i0]).addScaledVector(Nl,1);V9.copy(T[i0]).multiplyScalar(vc*vm).addScaledVector(Nl,imN);
      for(let t=h;t<5.5;t+=h){V9.addScaledVector(Nl,-g*h);P9.addScaledVector(V9,h);
        const kk=Math.floor(P9.x/CS)*100003+Math.floor(P9.z/CS);let a=G9.get(kk);if(!a)G9.set(kk,a=[]);a.push(P9.x,P9.y,P9.z);n++;
        if(t>.4){let bj=-1,bd=1e18;for(let j=Math.max(i0,i1-Math.round(600*(NP-1)/L));j<=Math.min(NP-1,i1+Math.round(700*(NP-1)/L));j+=4){const d=P9.distanceToSquared(pts[j]);if(d<bd){bd=d;bj=j;}}
          if(bj>=0){D9.subVectors(P9,pts[bj]);if(Math.abs(D9.dot(B[bj]))<ROAD_HALF&&D9.dot(Nn[bj])<1.5)break;}}}}}
  JADE.nVol=n;JADE.cvMs=+(performance.now()-t09).toFixed(1);return {g:G9,CS:CS};}
/* la montagne (cylindre de rayon rm, de bas à haut) laisse-t-elle passer le vol ? (10 m de marge : la caisse et son roulis) */
function jadeVolLibre(CV,cx,cz,rm,bas,haut){if(!CV)return true;const r=Math.ceil((rm+10)/CV.CS),bx=Math.floor(cx/CV.CS),bz=Math.floor(cz/CV.CS);
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=CV.g.get((bx+dx)*100003+(bz+dz));if(!a)continue;for(let k=0;k<a.length;k+=3){if(a[k+1]<bas-10||a[k+1]>haut+10)continue;if(Math.hypot(a[k]-cx,a[k+2]-cz)<rm+10)return false;}}
  return true;}
function jadeFilsOr(){
  if(/[?&]filsor=0\b/.test(location.search)||!JADE_V3||!LVL.cur||LVL.cur.piste!=='jade'||!JADE.rac3||!JADE.rac3.length||!(NP>1))return 0;
  const t09=performance.now(),k=L/Math.max(1,NP-1),vc=typeof vPalier==='function'?vPalier():78,g=FALL_G*SPD*gK(),imN=VEQ_K.saut*SPD,h=1/30,P9=new THREE.Vector3(),V9=new THREE.Vector3(),D9=new THREE.Vector3();let n=0;
  const pres=p=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(p);if(d<bd){bd=d;bi=i;}}return bi;};
  for(const R9 of JADE.rac3){const i0=pres(R9.p0),i1=pres(R9.p1),Nl=Nn[i0];if(!(i1>i0))continue;
    P9.copy(pts[i0]).addScaledVector(Nl,.6);V9.copy(T[i0]).multiplyScalar(vc).addScaledVector(Nl,imN);
    const arc=[];let jc=Math.max(i0,i1-Math.round(400/k));
    for(let t=h;t<5;t+=h){V9.addScaledVector(Nl,-g*h);P9.addScaledVector(V9,h);
      let bj=-1,bd=1e18;for(let j=jc;j<=Math.min(NP-1,i1+Math.round(500/k));j+=3){const d=P9.distanceToSquared(pts[j]);if(d<bd){bd=d;bj=j;}}
      D9.subVectors(P9,pts[bj]);const hh=D9.dot(Nn[bj]),la=Math.abs(D9.dot(B[bj]));arc.push({p:P9.clone(),j:bj,t:t});
      if(t>.4&&la<ROAD_HALF&&hh<1.5){arc.pose=1;break;}}
    if(!arc.pose)continue; /* pas de pose en vue : pas de file */
    const tf=arc[arc.length-1].t;let der=null,c=0;
    for(const a of arc){if(a.t<.35||a.t>tf-.3)continue;if(der&&a.p.distanceTo(der)<16)continue;if(++c>14)break;der=a.p;
      const m=pieceNeuve();m.position.copy(a.p);mat4b.makeBasis(B[a.j],Nn[a.j],T[a.j]);m.quaternion.setFromRotationMatrix(mat4b);m.rotateOnWorldAxis(Nn[a.j],a.t*2.2);m.updateMatrix();m.matrixAutoUpdate=false;
      pickups.push({s:a.j*k,lat:0,face:1,nitro:false,fruit:-1,mesh:m,taken:false,ax:Nn[a.j].clone(),deux:false,ci:1,air:1});n++;}}
  JADE.filsOr=n;JADE.foMs=+(performance.now()-t09).toFixed(1);return n;}
window.dbgJadeRac=function(k,saut){ /* (banc) */if(!JADE.rac3||!JADE.rac3[k|0]||!(NP>1))return null;const ds=L/(NP-1);let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(JADE.rac3[k|0].p0);if(d<bd){bd=d;bi=i;}}
  JADE.dbgSaut=saut?bi*ds-2:null;JADE.dbgSautOk=null;return {sLevre:Math.round(bi*ds),s:Math.round(s)};}; /* (banc) le raccourci au tir, dans le vrai jeu : le saut nitro part quand la caisse passe la lèvre (sans la déplacer) */
window.dbgJadeA=function(){return JADE.a3?Object.assign({},JADE.a3,{genMs:JADE.genMs,poses3:JADE.n3||null,cascadesRoute:JADE.cascR?JADE.cascR.length:0,filsOr:JADE.filsOr||0,couloirVolMs:JADE.cvMs||0,couloirVolPts:JADE.nVol||0,filsOrMs:JADE.foMs||0}):{genMs:JADE.genMs};};
