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
  foret:   {vir:[2,6],  serre:.4,droiteS:5.5,spirMax:420,ench:.8,penteMax:.3,monteeMax:.4},  /* la pelote s'enroule : spirale permise plus loin */
  canyon:  {vir:[2.5,7],serre:.5,droiteS:5,spirMax:300,ench:1,penteMax:.6,monteeMax:.2},
  dunes:   {vir:[2,6],  serre:.3,droiteS:5,spirMax:270,ench:.8,penteMax:.6,monteeMax:.4},   /* les vagues montent exprès : c'est le tremplin */
  grotte:  {vir:[2.5,7],serre:.5,droiteS:5,spirMax:300,ench:1,penteMax:.4,monteeMax:.2},
  banquise:{vir:[2,6],  serre:.3,droiteS:5,spirMax:300,ench:.8,penteMax:1.3,monteeMax:.1}}; /* la glace : un toboggan à 45° */
function rythmeCible(carte){return Object.assign({},RYTHME_CIBLES.base,RYTHME_CIBLES[carte]||{});}
/* la fiche d'une route — ctrl : les points de contrôle À PLAT (x, z : le plan ; y : l'altitude) · o : {vP (m/s), rP (m), marks (MODMARK : les figures protégées), pas (m)} */
function rythmeMesure(ctrl,o){
  o=o||{};const vP=o.vP||78,rP=o.rP||(40+.3*vP),pas=o.pas||5,n0=ctrl.length;
  if(n0<4)return {L:0,s:0,vir:0,virKm:0,serreKm:0,infr:0,droiteMax:0,droiteS:0,droites5:0,ench:0,enchKm:0,spirMax:0,spirales:0,coudes:0,cretes:0,pente:0,penteP95:0,penteMax:0,montee:0,rMin:0,rMed:0,pts:n0};
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
  for(let i=0;i<=N;i++){const k=kap[i],sg=Math.abs(k)>=kV?(k>0?1:-1):0;
    if(sg&&!prot[i]){if(Math.abs(k)>=kS)serreL+=ds;if(Math.abs(k)>=kI){infrL+=ds;if(!sInfr.length||i*ds-sInfr[sInfr.length-1]>60)sInfr.push(Math.round(i*ds));}}
    if(sg&&cur&&cur.sg===sg){cur.i1=i;cur.ang+=Math.abs(k)*ds;}
    else{if(cur&&cur.ang>=20*Math.PI/180)V.push(cur);cur=sg?{sg:sg,i0:i,i1:i,ang:Math.abs(k)*ds,prot:prot[i]}:null;}}
  if(cur&&cur.ang>=20*Math.PI/180)V.push(cur);
  let droiteMax=0,droites5=0,ench=0,spirMax=0,spirales=0,prev=-1;const dS=5*vP; /* 5 s de croisière */
  const gaps=[];let last=0;
  for(const v of V){const g=(v.i0-last)*ds;gaps.push(g);last=v.i1;}gaps.push((N-last)*ds);
  for(const g of gaps){if(g>droiteMax)droiteMax=g;if(g>dS)droites5++;}
  for(let j=1;j<V.length;j++)if((V[j].i0-V[j-1].i1)*ds<150)ench++;
  for(const v of V){const deg=v.ang*180/Math.PI;let pr=0;for(let k=v.i0;k<=v.i1;k++)if(prot[k]){pr=1;break;}
    if(!pr){if(deg>spirMax)spirMax=deg;if(deg>=(o.spirMax||300))spirales++;}}
  /* 5) LA PENTE (lissée sur 20 m) : médiane, p95, maxi ; la part en montée ; la descente moyenne · les CRÊTES AVEUGLES sur le dessin de contrôle */
  const g=[];let up=0,dyT=0;const Wp=Math.max(1,Math.round(10/ds));
  for(let i=Wp;i<=N-Wp;i++){const a=P[i-Wp],c=P[i+Wp],h=Math.hypot(c.x-a.x,c.z-a.z);if(h<1)continue;const s=(c.y-a.y)/h;g.push(Math.abs(s));if(s>.02)up++;}
  g.sort(function(a,b){return a-b;});dyT=P[N].y-P[0].y;
  let cretes=0;for(let i=1;i<n0-1;i++){const a=ctrl[i-1],b=ctrl[i],c=ctrl[i+1],h1=Math.hypot(b.x-a.x,b.z-a.z),h2=Math.hypot(c.x-b.x,c.z-b.z);if(h1<4||h2<4)continue;
    const g1=(b.y-a.y)/h1,g2=(c.y-b.y)/h2;if(g1-g2>.30)cretes++;}
  const km=L/1000;
  return {L:Math.round(L),s:+(L/vP).toFixed(1),vir:V.length,virKm:+(V.length/km).toFixed(2),serreKm:+((serreL/90)/km).toFixed(2),infr:+(infrL).toFixed(0),infrS:sInfr,
    droiteMax:Math.round(droiteMax),droiteS:+(droiteMax/vP).toFixed(1),droites5:droites5,ench:ench,enchKm:+(ench/km).toFixed(2),spirMax:Math.round(spirMax),spirales:spirales,
    coudes:coudes,cretes:cretes,pente:+(g.length?g[g.length>>1]:0).toFixed(3),penteP95:+(g.length?g[Math.floor(g.length*.95)]:0).toFixed(3),penteMax:+(g.length?g[g.length-1]:0).toFixed(3),
    montee:+(g.length?up/g.length:0).toFixed(2),descente:+((-dyT)/L).toFixed(3),rMin:Math.round(rMin===1e9?0:rMin),rMinRP:+((rMin===1e9?0:rMin)/rP).toFixed(2),rMed:Math.round(rMed),pts:n0,
    virages:V.map(function(v){return [Math.round(v.i0*ds),Math.round(v.i1*ds),Math.round(v.ang*180/Math.PI)*v.sg];})};}
/* la NOTE : 0 = la route tient toutes les cibles ; chaque manquement coûte proportionnellement (les coudes et l'infranchissable coûtent cher) */
function rythmeNote(f,c){
  if(!f||!f.L)return 1e9;let n=0;
  if(f.virKm<c.vir[0])n+=(c.vir[0]-f.virKm)*2;if(f.virKm>c.vir[1])n+=(f.virKm-c.vir[1])*1.2;
  if(f.serreKm<c.serre)n+=(c.serre-f.serreKm)*1.5;
  n+=f.infr*.2; /* 0,2 par mètre infranchissable */
  if(f.droiteS>c.droiteS)n+=(f.droiteS-c.droiteS)*1.5;n+=f.droites5*.8;
  if(f.enchKm<c.ench)n+=(c.ench-f.enchKm)*1.2;
  if(f.spirMax>c.spirMax)n+=(f.spirMax-c.spirMax)/60;n+=f.spirales*1.5;
  n+=f.coudes*1.2;n+=f.cretes*.6;
  if(f.penteP95>c.penteMax)n+=(f.penteP95-c.penteMax)*6;
  if(f.montee>c.monteeMax)n+=(f.montee-c.monteeMax)*4;
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
