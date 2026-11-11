/* ===== LE DIRECTEUR DE RYTHME (2026-11-05, Sacha : « retravaille toutes les générations de maps : fun à rider, spectaculaire, aventure, figures,
   kiff, vitesse — des fois trop de tout droit, des fois trop de courbes, des fois des spirales trop serrées, des fois la route fait des trucs chelous ») =====
   Une seule règle du jeu pour TOUTES les maps, mesurée sur le dessin À PLAT du générateur (ce que le pilote sent au volant, avant que pisteTord
   ne roule la dalle) et comptée en SECONDES de croisière du palier (vPalier) et en rayons tenables (rayonPalier = rP) :
     · un VIRAGE = le cap qui tourne d'un même côté de ≥ 20°, à un rayon < 4 rP (au-delà il passe au pouce : une « droite » qui penche) ;
     · SERRÉ = rayon entre rP et 1,5 rP (volant à fond) · INFRANCHISSABLE = rayon < rP (interdit) ;
     · une DROITE = une tenue sans virage ; sa longueur se compte en secondes (≤ 5 s : « pas de tout droit ») ;
     · une SPIRALE = un cap qui tourne d'un même côté sans jamais contrer : au-delà de `spirMax`°, on « tourne sans rien voir venir » — sauf dans
       une FIGURE déclarée (puits, parking, looping : MODMARK.fig / MODMARK.g) ;
     · un COUDE = une cassure du dessin (deux segments de contrôle qui font plus de `coudeDeg`° entre eux, ou un segment minuscule entre deux longs) :
       le Catmull-Rom en fait un coup de volant que personne n'a dessiné — les « trucs chelous » ;
     · une CRÊTE AVEUGLE = une cassure de pente vers le bas (on ne voit plus la route derrière le sommet).
   `rythmeMesure(ctrl, o)` rend la fiche, `rythmeNote(fiche, cible)` une note (0 = parfait, chaque manquement coûte), `RYTHME_CIBLES[carte]` les cibles
   de chaque map. Les générateurs s'en servent pour CHOISIR entre plusieurs essais (le meilleur-de-N : même graine, même hasard, mais la route
   gardée est celle qui respecte le rythme) ; le banc (`outils/banc-routes/toutes.mjs`, `dbgGenRoute`) s'en sert pour MESURER toutes les maps. */
const RYTHME_CIBLES={ // par map : virages/km [mini, maxi], serrés/km mini, droite ≤ s, spirale ≤ °, enchaînements/km mini, pente lissée maxi (hors plongeon), montée ≤ part
  base:    {vir:[2.5,7],serre:.5,droiteS:5,spirMax:300,ench:1,penteMax:.5,monteeMax:.15,coude:0},
  nuages:  {vir:[2.5,7],serre:.5,droiteS:5,spirMax:330,ench:1,penteMax:.6,monteeMax:.5},   /* sans haut ni bas : la pente ne compte pas */
  espace:  {vir:[2,6],  serre:.3,droiteS:5.5,spirMax:330,ench:.8,penteMax:.6,monteeMax:.5},
  ville:   {vir:[3,8],  serre:.6,droiteS:4.5,spirMax:300,ench:1.2,penteMax:.5,monteeMax:.3},
  crypto:  {vir:[3,8],  serre:.6,droiteS:4.5,spirMax:300,ench:1.2,penteMax:.5,monteeMax:.35},
  jade:    {vir:[2.5,6],serre:.4,droiteS:5,spirMax:270,ench:.8,penteMax:.35,monteeMax:.5},   /* la mer : ni descente ni montée imposée */
  canyon:  {vir:[2.5,7],serre:.5,droiteS:5,spirMax:300,ench:1,penteMax:.6,monteeMax:.2},
  dunes:   {vir:[2,6],  serre:.3,droiteS:5,spirMax:270,ench:.8,penteMax:.6,monteeMax:.4},   /* les vagues montent exprès : c'est le tremplin */
  grotte:  {vir:[2.5,7],serre:.5,droiteS:5,spirMax:300,ench:1,penteMax:.4,monteeMax:.2},
  banquise:{vir:[2,6],  serre:.3,droiteS:5,spirMax:300,ench:.8,penteMax:1.3,monteeMax:.1}}; /* la glace : un toboggan à 45° */
/* ===== LA RÈGLE v2 (2026-11-07, Sacha : « rends ça super propre, super clean : des virages, des tout droits, mais pas trop de trucs bizarres — plein de petits virages,
   des petites douilles ») ===== « UNE COURBE OU UNE DROITE, JAMAIS ENTRE LES DEUX. » Mesuré le 07/11 (passation/GENERATION-ROUTES.md) : la règle du 05/11 tenait ses cibles
   avec des PETITS virages — les recadrages de 2 à 5° (recentre, jCap, gAxe, cap, recadre : trois cordes de quelques mètres), les respirations de 8-20° qui avaient remplacé
   les droites. Désormais :
     · un VIRAGE commence à `virMin` (26°, contre 20) ; sous 26° à moins de 5 rP c'est une DOUILLE (interdite : 0,8 chacune, cible ≤ 0,4/km) ; trois douilles alternées
       d'affilée = un ZIGZAG (2 chacun) ; une courbe de moins de 26° à 5 rP ou plus est un BALAYAGE (la courbe au pouce : bienvenue) ;
     · une DROITE FRANCHE = ≤ 8° de cap sur ≥ 1,8 s de croisière, à plus de 6 rP : VOULUE, 5 à 22 % de la route (la ligne nitro) ; une « droite » entre deux temps forts
       ne coûte qu'au-delà de 6,5 s (5 avant) — ce n'est plus la peine de la remplir de courbes molles ;
     · sur une route roulée (nuages, espace, grotte) la part hors de l'endroit (`horsEndroit`, normale y < 0,5) ne dépasse pas 25 %.
   `?gen=ancien` = la règle et la génération du 05/11. */
/* ===== LA BANDE D'ADAPTATION (2026-11-11, Sacha : « on change de map, il faut une bande de 2 secondes qui permette aux joueurs de s'adapter à la situation et de comprendre les dangers ») =====
   Les 2 premières secondes d'une map sont une droite franche : ni virage, ni module, ni piège. Mesuré au banc (toutes.mjs) : la droite d'ouverture était en MÈTRES,
   donc de plus en plus courte en secondes avec le palier moteur — 1,3 s en grotte et 1,5 s en jade au palier 10, 0,7 s au palier 20, 0,9 s en dunes, 0,6-1 s au glacier.
   `bandeL(l,vP)` : la longueur voulue, au moins BANDE.s secondes de croisière du palier (vP : m/s, celui de la piste par défaut). `?bande=0` : l'ancienne ouverture. */
const BANDE={s:typeof location!=='undefined'&&/[?&]bande=0\b/.test(location.search)?0:2.2};
function bandeL(l,vP,sec){return Math.max(l,(BANDE.s&&sec?sec:BANDE.s)*(vP||(typeof vPalier==='function'?vPalier():78)));}
const GEN_V2=typeof location==='undefined'||!/[?&]gen=ancien\b/.test(location.search);
const RYTHME_V2={virMin:26,douilleMin:4,douilleKm:.4,droiteFMin:[.05,.22],droiteFs:1.8,droiteFdeg:8,horsEndroit:.25,droitePlus:1.5}; /* droiteFMin : la part de la route en droites franches [mini, maxi] */
function rythmeCible(carte){const c=Object.assign({},RYTHME_CIBLES.base,RYTHME_CIBLES[carte]||{});
  if(GEN_V2){c.droiteS+=RYTHME_V2.droitePlus;c.douilleKm=RYTHME_V2.douilleKm;c.droiteF=RYTHME_V2.droiteFMin;c.horsEndroit=RYTHME_V2.horsEndroit;}return c;}
/* la fiche d'une route — ctrl : les points de contrôle À PLAT (x, z : le plan ; y : l'altitude) · o : {vP (m/s), rP (m), marks (MODMARK : les figures protégées), pas (m)} */
function rythmeMesure(ctrl,o){
  o=o||{};const vP=o.vP||78,rP=o.rP||(40+.3*vP),pas=o.pas||5,n0=ctrl.length;
  if(n0<4)return {L:0,s:0,vir:0,virKm:0,serreKm:0,infr:0,droiteMax:0,droiteS:0,droites5:0,ench:0,enchKm:0,spirMax:0,spirales:0,coudes:0,cretes:0,pente:0,penteP95:0,penteMax:0,montee:0,rMin:0,rMed:0,pts:n0,douilles:0,douillesKm:0,zigzags:0,droitesF:0,droitesFMin:0,horsEndroit:0};
  const vMin=(GEN_V2?RYTHME_V2.virMin:20)*Math.PI/180; /* (LA RÈGLE v2) un virage commence à 26° */
  /* 1) LES COUDES, sur le dessin brut : l'angle entre deux segments consécutifs (en plan) et les segments minuscules coincés entre deux longs */
  let coudes=0;const cdeg=o.coudeDeg||14,cL=[];
  for(let i=1;i<n0;i++)cL.push(Math.hypot(ctrl[i].x-ctrl[i-1].x,ctrl[i].z-ctrl[i-1].z));
  for(let i=1;i<n0-1;i++){const a=Math.atan2(ctrl[i].x-ctrl[i-1].x,ctrl[i].z-ctrl[i-1].z),b=Math.atan2(ctrl[i+1].x-ctrl[i].x,ctrl[i+1].z-ctrl[i].z);
    let d=Math.abs(b-a);if(d>Math.PI)d=2*Math.PI-d;const l1=cL[i-1],l2=cL[i];
    if(l1<1||l2<1)continue;
    if(d>cdeg*Math.PI/180&&Math.min(l1,l2)>8)coudes++; /* un vrai angle (deux segments de ≥ 8 m) */
    else if(i<n0-2&&l2<10&&l1>40&&cL[i+1]>40)coudes++;} /* un segment minuscule entre deux longs : le spline y fait une boucle */
  /* 2) LE RUBAN ÉCHANTILLONNÉ (Catmull-Rom centripète, comme le jeu) tous les `pas` m */
  const cv=new THREE.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,n0*16);
  const L=cv.getLength(),N=Math.max(50,Math.round(L/pas)),P=cv.getSpacedPoints(N),ds=L/N;
  /* la protection des figures : les points de contrôle des MODMARK à figure (g ou fig) → abscisses */
  const prot=new Uint8Array(N+1);
  if(o.marks&&o.marks.length){const lg=cv.getLengths(),nC=Math.max(1,n0-1),dv=lg.length-1,sOf=function(j){const f=Math.max(0,Math.min(nC,j))/nC*dv,k=Math.min(dv-1,Math.floor(f));return lg[k]+(lg[k+1]-lg[k])*(f-k);};
    for(const m of o.marks)if(m&&(m.g||m.fig)){const a=Math.max(0,Math.floor(sOf(m.i0)/ds)),b=Math.min(N,Math.ceil(sOf(m.i1)/ds));for(let k=a;k<=b;k++)prot[k]=1;}}
  /* 3) LE CAP et la COURBURE en plan, lissés sur ~20 m */
  const W=Math.max(1,Math.round(10/ds)),kap=new Float32Array(N+1);let rMin=1e9;const rs=[];
  for(let i=W;i<=N-W;i++){const a=P[i-W],b=P[i],c=P[i+W];const h1=Math.atan2(b.x-a.x,b.z-a.z),h2=Math.atan2(c.x-b.x,c.z-b.z);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
    const l=(Math.hypot(b.x-a.x,b.z-a.z)+Math.hypot(c.x-b.x,c.z-b.z))/2;kap[i]=l>.5?d/l:0; /* la différence de cap entre deux cordes = la rotation sur UNE demi-fenêtre */const R=Math.abs(kap[i])>1e-6?1/Math.abs(kap[i]):1e9;
    if(R<rMin&&!prot[i])rMin=R;if(R<4*rP)rs.push(R);}
  rs.sort(function(a,b){return a-b;});const rMed=rs.length?rs[rs.length>>1]:0;
  /* 4) LES VIRAGES : tenues d'un même côté à R < 4 rP, angle total ≥ 20° · les DROITES entre deux virages · les SPIRALES · SERRÉ et INFRANCHISSABLE */
  const kV=1/(4*rP),kS=1/(1.5*rP),kI=1/rP;const V=[];let cur=null,serreL=0,infrL=0,sInfr=[];
  const FZ=[];let fz=null; /* les FIGURES (zones protégées) : ni virage ni droite — un temps fort à part */
  for(let i=0;i<=N;i++){const k=prot[i]?0:kap[i],sg=Math.abs(k)>=kV?(k>0?1:-1):0;
    if(prot[i]){if(fz)fz.i1=i;else fz={i0:i,i1:i};}else if(fz){FZ.push(fz);fz=null;}
    if(sg){if(Math.abs(k)>=kS)serreL+=ds;if(Math.abs(k)>=kI){infrL+=ds;if(!sInfr.length||i*ds-sInfr[sInfr.length-1]>60)sInfr.push(Math.round(i*ds));}}
    if(sg&&cur&&cur.sg===sg){cur.i1=i;cur.ang+=Math.abs(k)*ds;}
    else{if(cur&&cur.ang>=vMin)V.push(cur);cur=sg?{sg:sg,i0:i,i1:i,ang:Math.abs(k)*ds}:null;}}
  if(cur&&cur.ang>=vMin)V.push(cur);if(fz)FZ.push(fz);
  /* 4 bis) (LA RÈGLE v2) LES DOUILLES : les lobes d'un même côté à moins de 5 rP dont l'angle fait entre 4° et `virMin` — le petit coup de volant que personne n'a dessiné ;
     un ZIGZAG = trois douilles alternées d'affilée (moins de 1 s entre deux) · LES DROITES FRANCHES : ≤ 8° de cap sur ≥ 1,8 s de croisière, jamais plus serré que 6 rP */
  let douilles=0,zigzags=0,droitesF=0,droitesFL=0;const DZ=[];
  {const kD=1/(5*rP),dMin=RYTHME_V2.douilleMin*Math.PI/180;let c2=null;const lob=[];
    for(let i=0;i<=N;i++){const k=prot[i]?0:kap[i],sg=Math.abs(k)>=kD?(k>0?1:-1):0;
      if(sg&&c2&&c2.sg===sg){c2.i1=i;c2.ang+=Math.abs(k)*ds;}else{if(c2)lob.push(c2);c2=sg?{sg:sg,i0:i,i1:i,ang:Math.abs(k)*ds}:null;}}
    if(c2)lob.push(c2);
    const D=lob.filter(function(l){return l.ang>=dMin&&l.ang<vMin;});douilles=D.length;for(const d of D)DZ.push([Math.round(d.i0*ds),Math.round(d.i1*ds),Math.round(d.ang*180/Math.PI)*d.sg]);
    let run=1;for(let j=1;j<D.length;j++){if(D[j].sg!==D[j-1].sg&&(D[j].i0-D[j-1].i1)*ds<vP){run++;if(run===3)zigzags++;}else run=1;}
    const kF=1/(6*rP),lF=RYTHME_V2.droiteFs*vP,aF=RYTHME_V2.droiteFdeg*Math.PI/180;let r0=-1,aa=0;
    for(let i=0;i<=N+1;i++){const ok=i<=N&&!prot[i]&&Math.abs(kap[i])<kF;
      if(ok){if(r0<0){r0=i;aa=0;}aa+=Math.abs(kap[i])*ds;}
      else if(r0>=0){if((i-r0)*ds>=lF&&aa<=aF){droitesF++;droitesFL+=(i-r0)*ds;}r0=-1;}}}
  let horsEndroit=0;if(o.hors!=null)horsEndroit=o.hors;else if(o.N&&o.N.length){let h9=0;for(const v of o.N)if(v.y<.5)h9++;horsEndroit=h9/o.N.length;} /* la part de la route roulée sur la tranche ou à l'envers */
  let droiteMax=0,droites5=0,ench=0,spirMax=0,spirales=0;const dS=5*vP; /* 5 s de croisière */
  const TF=V.concat(FZ).sort(function(a,b){return a.i0-b.i0;}),gaps=[];let last=0; /* les temps forts : virages ET figures ; une droite = ce qu'il y a entre deux */
  for(const v of TF){const g=(v.i0-last)*ds;gaps.push(g);last=Math.max(last,v.i1);}gaps.push((N-last)*ds);
  for(const g of gaps){if(g>droiteMax)droiteMax=g;if(g>dS)droites5++;}
  for(let j=1;j<TF.length;j++)if((TF[j].i0-TF[j-1].i1)*ds<150)ench++;
  for(const v of V){const deg=v.ang*180/Math.PI;if(deg>spirMax)spirMax=deg;if(deg>=(o.spirMax||300))spirales++;}
  /* 5) LA PENTE (lissée sur 20 m) : médiane, p95, maxi ; la part en montée ; la descente moyenne · les CRÊTES AVEUGLES sur le dessin de contrôle */
  const g=[];let up=0,dyT=0;const Wp=Math.max(1,Math.round(10/ds));
  for(let i=Wp;i<=N-Wp;i++){const a=P[i-Wp],c=P[i+Wp],h=Math.hypot(c.x-a.x,c.z-a.z);if(h<1)continue;const s=(c.y-a.y)/h;g.push(Math.abs(s));if(s>.02)up++;}
  g.sort(function(a,b){return a-b;});dyT=P[N].y-P[0].y;
  let cretes=0;for(let i=1;i<n0-1;i++){const a=ctrl[i-1],b=ctrl[i],c=ctrl[i+1],h1=Math.hypot(b.x-a.x,b.z-a.z),h2=Math.hypot(c.x-b.x,c.z-b.z);if(h1<4||h2<4)continue;
    const g1=(b.y-a.y)/h1,g2=(c.y-b.y)/h2;if(g1-g2>.30)cretes++;}
  const km=L/1000;
  return {L:Math.round(L),s:+(L/vP).toFixed(1),vir:V.length,virKm:+(V.length/km).toFixed(2),virFKm:+((V.length+2*FZ.length)/km).toFixed(2),virFMin:+((V.length+2*FZ.length)/Math.max(1e-6,L/vP/60)).toFixed(2),serreKm:+((serreL/90)/km).toFixed(2),infr:+(infrL).toFixed(0),infrS:sInfr,
    droiteMax:Math.round(droiteMax),droiteS:+(droiteMax/vP).toFixed(1),droites5:droites5,ench:ench,enchKm:+(ench/km).toFixed(2),spirMax:Math.round(spirMax),spirales:spirales,
    figures:FZ.length,coudes:coudes,cretes:cretes,pente:+(g.length?g[g.length>>1]:0).toFixed(3),penteP95:+(g.length?g[Math.floor(g.length*.95)]:0).toFixed(3),penteMax:+(g.length?g[g.length-1]:0).toFixed(3),
    montee:+(g.length?up/g.length:0).toFixed(2),descente:+((-dyT)/L).toFixed(3),rMin:Math.round(rMin===1e9?0:rMin),rMinRP:+((rMin===1e9?0:rMin)/rP).toFixed(2),rMed:Math.round(rMed),pts:n0,
    douilles:douilles,douillesKm:+(douilles/km).toFixed(2),zigzags:zigzags,droitesF:droitesF,droitesFMin:+(droitesF/(L/vP/60)).toFixed(2),droitesFPart:+(droitesFL/L).toFixed(3),horsEndroit:+horsEndroit.toFixed(2),douillesS:DZ,
    virages:V.map(function(v){return [Math.round(v.i0*ds),Math.round(v.i1*ds),Math.round(v.ang*180/Math.PI)*v.sg];})};}
/* la NOTE : 0 = la route tient toutes les cibles ; chaque manquement coûte proportionnellement (les coudes et l'infranchissable coûtent cher) */
function rythmeNote(f,c){
  if(!f||!f.L)return 1e9;let n=0;
  if(GEN_V2&&f.virFMin!=null){ /* (LA RÈGLE v2, 2026-11-07 soir) la cible de virages se lit par MINUTE, pas par km : à 340 m/s une route de 28 s n'a plus que 4-5 virages par km et la note montait à 7-8 sans que la route soit en cause.
       La cible par km (réglée au palier 0, 78 m/s) devient une cible par minute (× 4,68) ; le plancher s'adoucit avec la vitesse (× √(78/vP)) : à haut palier les modules et la fin prennent une plus grande part d'une route courte. Une figure déclarée vaut deux virages. */
    const vP9=f.L/Math.max(1,f.s),k9=Math.sqrt(Math.min(1,78/Math.max(78,vP9))),m0=c.vir[0]*4.68*k9,m1=c.vir[1]*vP9*.06; /* le plafond reste celui par km, lu à la vitesse réelle : les dunes au palier 20 font 33 virages courts par minute, c'est leur nature */
    if(f.virFMin<m0)n+=(m0-f.virFMin)*2/4.68;if(f.virFMin>m1)n+=(f.virFMin-m1)*1.2/4.68;}
  else{const vk=f.virKm;if(vk<c.vir[0])n+=(c.vir[0]-vk)*2;if(vk>c.vir[1])n+=(vk-c.vir[1])*1.2;}
  if(f.serreKm<c.serre)n+=(c.serre-f.serreKm)*1.5;
  n+=f.infr*.2; /* 0,2 par mètre infranchissable */
  if(f.droiteS>c.droiteS)n+=(f.droiteS-c.droiteS)*1.5;n+=f.droites5*.8;
  if(f.enchKm<c.ench)n+=(c.ench-f.enchKm)*1.2;
  if(f.spirMax>c.spirMax)n+=(f.spirMax-c.spirMax)/60;n+=f.spirales*1.5;
  n+=f.coudes*1.2;n+=f.cretes*.6;
  if(f.penteP95>c.penteMax)n+=(f.penteP95-c.penteMax)*6;
  if(f.montee>c.monteeMax)n+=(f.montee-c.monteeMax)*4;
  if(GEN_V2&&c.douilleKm!=null){ /* (LA RÈGLE v2) les douilles coûtent plus qu'un coude ; les droites franches manquantes coûtent ; la route couchée trop longtemps coûte */
    n+=Math.max(0,f.douilles-c.douilleKm*f.L/1000)*.8;n+=(f.zigzags||0)*2;
    if(f.droitesFPart<c.droiteF[0])n+=(c.droiteF[0]-f.droitesFPart)*30;if(f.droitesFPart>c.droiteF[1])n+=(f.droitesFPart-c.droiteF[1])*15; /* la PART de la route en droites franches : 5 à 22 % */
    if(f.horsEndroit>c.horsEndroit)n+=(f.horsEndroit-c.horsEndroit)*8;}
  return +n.toFixed(2);}
/* LE MEILLEUR-DE-N : `gen(rnd9)` dessine une route avec le flux qu'on lui donne ; on en tire `n` sur des flux dérivés d'UN seul tirage de `rnd`, on garde la mieux notée.
   `apres(ctrl)` (facultatif) rend la fiche à noter (par défaut rythmeMesure sur ctrl) ; `garde()` / `restaure(etat)` (facultatif) sauvent et remettent les effets de bord
   du générateur (Q, marques…) entre deux essais, et la route gardée est REJOUÉE en dernier (ses effets de bord sont ceux qui restent). Rend {ctrl, fiche, note, essai, n}. */
function rythmeMeilleur(rnd,n,carte,gen,o){
  o=o||{};const g0=(rnd()*4294967296)>>>0,c=rythmeCible(carte),vP=typeof vPalier==='function'?vPalier():78,rP=typeof rayonPalier==='function'?rayonPalier():40+.3*vP;
  let best=null;const notes=[];
  for(let e=0;e<n;e++){const r9=mulberry32((g0^Math.imul(e+1,0x9E3779B1))>>>0);
    if(o.avant)o.avant();const ctrl=gen(r9,e);const f=o.fiche?o.fiche(ctrl):rythmeMesure(ctrl,{vP:vP,rP:rP,marks:MODMARK,spirMax:c.spirMax}),nt=rythmeNote(f,c)+(o.malus?o.malus(ctrl,f):0);
    notes.push(nt);if(!best||nt<best.note)best={ctrl:ctrl,fiche:f,note:nt,essai:e};
    if(nt<=(o.assez!=null?o.assez:.5))break;}
  if(best.essai!==notes.length-1&&!o.sansRejeu){const r9=mulberry32((g0^Math.imul(best.essai+1,0x9E3779B1))>>>0);if(o.avant)o.avant();best.ctrl=gen(r9,best.essai);} /* rejouée : ses effets de bord sont les bons */
  best.n=notes.length;best.notes=notes;RYTHME.der={carte:carte,note:best.note,essai:best.essai,n:notes.length,notes:notes,fiche:best.fiche};return best;}
const RYTHME={der:null,N:typeof location!=='undefined'&&/[?&]rythme=0\b/.test(location.search)?1:6}; /* `?rythme=0` : un seul essai (la route d'avant, au tirage près) */
window.dbgRythme=function(){return RYTHME.der;}; /* le dernier choix du directeur de rythme : la note de chaque essai, la fiche de la route gardée */
