/* ===== LA VILLE CYBERPUNK : LES MODULES ROUTE-VILLE (2026-11-18, Sacha : « on a l'impression que la route fait son chemin et qu'autour il y a des immeubles qui ont été
   générés » — « que la ville et la route se mélangent », le sentiment de VISITER une ville, unique à chaque passage ; l'ambiance du piqué du Cinquième Élément, de
   Coruscant, sans rien copier ; très peu de bâtiments neufs : l'INTERACTION route-immeubles) =====
   Lot A (passation/ville-cyber/LOT-A.md). La carte 'ville' seule : Crypto City, la vitrée, les nuages et l'orbite gardent leur route au bit près.
   Trois modules neufs, au patron des scènes de ville-scenes.js (une fonction de route dans le contexte G de vsModules, ses ANCRES dans FILETMARK, son PLAN réservé
   AVANT les tours ordinaires — vcReserve, appelé par vsReserve : la règle vsLibre, une pièce que la route frôle est abandonnée, jamais posée à travers —, ses
   volumes posés APRÈS — vcBatir, appelé par vsBatirG : les familles existantes, corps/genre et néons, 0 appel de dessin —, sa longueur `lg`, son nom, son dévers) :
   · LE SLALOM DES TOURS (`slalomtours`) : calage sur la trame, puis 2 tours fines et hautes plantées SUR l'axe d'arrivée ; la route roule droit sur chacune, l'évite au
     dernier moment (un écart de 49 m, coups de volant de 42-45° à 2,3-2,45 rP — 2 rP et plus tenus, mesuré), la longe à 15 m du bord de la dalle, à l'intérieur du virage, et
     revient dans l'axe : la tour suivante est droit devant, évitée de l'autre côté ;
   · LE PIQUÉ (`pique`) : calage, une crête courte, et la route BASCULE (rayon vertical 1,7 × la croisière) : 30-38° de plongée DANS l'axe, entre deux murs de
     tours à 15 m du bord, à travers 2-4 NAPPES DE CIRCULATION (des files de lucioles immobiles en travers, étagées : une sous la dalle, la suivante au-dessus, en
     alternance ; 12 m au moins de tout le ruban en 3D, et hors de la bande de l'audit — 36 m en plan, −3 / +14 m — ; hors du couloir des sauts ; une luciole sur deux sur ALLEGE),
     la ressource (1,3 × le rayon, 3,3 rP au moins) au ras d'une rue (l'ancre 'rue' de la plongée : une dalle dure), puis une remontée qui tourne ;
   · LES MONTAGNES RUSSES DES TOITS (`russes`) : 2-3 vagues qui ondulent en S ; chaque crête passe au ras d'un toit-terrasse (l'ancre 'toit' de la crête des toits),
     chaque creux plonge sous le niveau des toits, entre deux tours ; rayon vertical 2,05 × la croisière dessiné (1,7 et plus tenu).
   LE SAUT : en conduite la caisse reste collée à la dalle (aucune crête ne la lance seule : boucle-2-conduite.js) ; le saut nitro est REFUSÉ sur la crête et le piqué,
   et sur chaque crête des montagnes russes (fenêtres `ss`, vcSautRefuse — comme la crête sans saut des nuages).
   LES PENTES : la ville comprime toute pente au-delà de 30 % (adoucirPentes, VILLE_PENTE) — ces modules dessinent la pente INVERSE (vcDessin) : après la
   compression, la route a exactement la pente voulue ; leurs crêtes et leurs creux sont des arcs verticaux à pas de 4° (adoucirCretes n'a rien à raboter).
   `?sans=villecyber` : la ville d'avant, au bit près (route et décor). `?villescene=slalomtours|pique|russes` : le module ouvre la route (banc). */
const VILLE_CYBER=VILLE_CALME&&!/[?&]sans=([^&]*,)?villecyber(,|&|$)/.test(location.search);
const VC_TYPES={cslalom:1,cpique:1,crusse:1};
function vcDessin(g){const S=VILLE_PENTE.seuil,K=VILLE_PENTE.garde,a=Math.abs(g);return a<=S?g:(g<0?-1:1)*(S+(a-S)/K);} /* la pente à dessiner pour qu'adoucirPentes rende g */
/* LE PAQUET : une carte route-ville EN TÊTE (laquelle : la graine) — si elle ne tient pas à l'ouverture, elle reste en tête et passe à la place suivante qui la tient —,
   une graine sur trois une deuxième juste derrière, la dernière au hasard du paquet : une route en joue en général une ou deux.
   Aucun tirage : l'ordre du paquet mélangé seul change. (Un lot ultérieur refait le tirage unique de la ville : ce branchement est fait pour être retiré.) */
function vcPaquet(t,MCJ,gr){const C=[];for(let k=0;k<MCJ.length;k++)if(MCJ[k]&&MCJ[k].cle)C.push(k);if(!C.length)return;if(t.length&&C.indexOf(t[0])>=0)return;
  const j=(((gr>>1)%C.length)+C.length)%C.length,c=C[j],q=t.indexOf(c);if(q<0)return;t.splice(q,1);t.unshift(c);
  if(((gr%3)+3)%3===0&&C.length>1){const c2=C[(j+1)%C.length],q2=t.indexOf(c2);if(q2>1){t.splice(q2,1);t.splice(Math.min(1,t.length),0,c2);}}} /* une graine sur trois, une deuxième juste derrière (la route du palier 0 joue deux ou trois cartes du paquet) */
/* LE SAUT REFUSÉ (comme LA CRÊTE SANS SAUT des nuages, nuaSautRefuse) : vrai si la caisse vole au-dessus d'une fenêtre `ss` du piqué ou des montagnes russes dans la seconde
   qui vient (2 s nitro tenue) — appelé par villeEnversRefuse (le saut nitro, le pilote du banc). En conduite la caisse reste collée à la dalle : aucune crête ne la lance seule. */
function vcSautRefuse(){if(!VILLE_CYBER||!LVL.cur||LVL.cur.id!=='ville'||LVL.cur.vitre||LVL.cur.crypto||typeof MODS==='undefined'||!MODS||!MODS.length)return false;
  const b=s+Math.max(40,Math.abs(vA)*SPD*vitMult())*(nitroOn?2:1.2);for(const m of MODS)if(m.ss&&(m.fig==='pique'||m.fig==='russes'||m.fig==='slalomtours'))for(const e of m.ss)if(b>=e[0]&&s<=e[1])return true;return false;}
if(VILLE_CYBER)Object.assign(VS_NOMS,{slalomtours:'slalom des tours',pique:'piqué',russes:'montagnes russes des toits'}); /* LE CONTRAT DE LA CHARTE : le nom en clair */
function vcIndice(MCJ,f9){for(let k=0;k<MCJ.length;k++)if(MCJ[k]&&MCJ[k].cle===f9)return k;return -1;} /* (banc) ?villescene= : l'indice du module dans le paquet */
/* ===== LA ROUTE ===== G : le contexte de vsModules ; H : ses outils (calage, cote, Rv, setDer) */
function vcModules(G,H){
  const arc=G.arc,straight=G.straight,rf=G.rf,rP=G.rP,LV=G.LV,vD=G.vD,ix=function(){return G.ctrl.length-1;},DEG=57.2958;
  /* un tronçon de L m (en plan) à la pente FINALE g, qui tourne de aDeg */
  const seg=function(L,g,aDeg){if(L<.5)return;const dy=vcDessin(g)*L;if(Math.abs(aDeg)>.05)arc(aDeg,L/(Math.abs(aDeg)/DEG),1,dy);else straight(L,dy,1);};
  const droit=function(L,g,aDeg,n){n=Math.max(1,n|0);for(let k=0;k<n;k++)seg(L/n,g,(aDeg||0)/n);};
  /* un arc VERTICAL de rayon R, de l'assiette t0 à t1 (rad, − : plonge), à pas de 4°, qui tourne de aDeg en tout ; rend sa longueur en plan */
  const vArc=function(R,t0,t1,aDeg){const n=Math.max(2,Math.ceil(Math.abs(t1-t0)*DEG/4)),Lt=R*Math.abs(Math.sin(t1)-Math.sin(t0));
    for(let k=0;k<n;k++){const a0=t0+(t1-t0)*k/n,a1=t0+(t1-t0)*(k+1)/n,l=R*Math.abs(Math.sin(a1)-Math.sin(a0));seg(l,Math.tan((a0+a1)/2),(aDeg||0)*l/Math.max(Lt,1e-6));}return Lt;};
  const vLong=function(R,t0,t1){return R*Math.abs(Math.sin(t1)-Math.sin(t0));};
  /* LE SLALOM DES TOURS. Géométrie (u : la marche, v : le côté) : la route arrive DANS l'axe, droit sur la 1re tour ; chaque coup de volant est un arc de 2a (a = 20-23°)
     à R = 2,3-2,45 rP (calage à 2,45 rP : le Catmull-Rom en tient 0,85, soit 2 rP et plus) dont le SOMMET (le cap revient sur la trame) passe à A/2 de l'axe, d'un côté puis de l'autre ; entre deux sommets, une droite S au cap ±a :
     A = 2R(1 − cos a) + S sin a. La tour du sommet k est À L'INTÉRIEUR du virage, à 15 m du bord de la dalle : à A/2 − (28 + 15 + sa demi-largeur) de l'axe, du côté
     d'où vient la route — dans la ligne d'arrivée (A = 40-56 m : son flanc mord la voie). */
  const kC=Math.max(0,Math.min(1,(LV-1.08)/.8)); /* (la place) 0 au palier 0, 1 dès le palier 10 : les droites d'entrée et de sortie raccourcissent, la route y est courte */
  /* (après le contrôle, tour 1 : « en paysage, aucune tour droit devant ») LES TOURS DANS L'AXE : A/2 = 28 + 15 + 6,4 (la demi-largeur d'une tour fine) — le centre de
     chaque tour tombe SUR l'axe d'arrivée : les trois tours sont alignées droit devant, la route ondule autour d'elles (±50 m, au lieu de ±20-28 m : la dalle de 56 m
     cachait l'ondulation) ; 3 tours (2 dès LV 1,5 : la route rapide est courte ; les droites S s'allongent) ; 2a = 42-45° (la demande : 25-45°). */
  /* (après le contrôle, tour 2 : « aucune tour droit devant, à l'image ») LA ROUTE REVIENT DANS L'AXE ENTRE DEUX TOURS : la caisse roule DROIT SUR la tour (une ligne
     droite de 0,45 × la croisière, la tour plein cadre au bout), puis l'évite au dernier moment — l'écart (arc, droite S1, arc : 49 m de côté), le sommet le long de la tour
     (le double arc, la tour à l'intérieur), le retour dans l'axe (arc, S1, arc) — et la tour suivante est de nouveau droit devant, évitée de l'autre côté. Avant, la route
     ondulait d'un sommet à l'autre sans jamais viser une tour : la caméra était déjà dans le virage quand la tour approchait. 2 tours à tous les paliers (3 : 20,7 s au
     palier 0, il ne tenait plus qu'une route forcée sur douze) ; la ligne droite entre elles : 0,3 × la croisière (0,18 dès le palier 10). */
  const sSlalomTours=function(){const C=H.calage(2.45),R=H.Rv((2.3+rf()*.15)*rP),a=(21+rf()*1.5)/DEG,aD=a*DEG,n=2,q=R*(1-Math.cos(a)),A=Math.max(2*(ROAD_HALF+15+12.8),4*q+2); /* (tour 3) 12,8 : la demi-largeur de la tour (25,6 m : à 200 m, une tour de 12,8 m se perdait dans le flou) */
    const S1=Math.max(0,(A/2-2*q)/Math.sin(a)),pe=-.035;
    const arcP=function(s9){arc(s9*aD,R,Math.max(2,Math.ceil(aD/6)),pe*a*R);},dr=function(L9){if(L9>1)straight(L9,pe*L9,Math.max(1,Math.ceil(L9/60)));};
    const l0=Math.max((.4-.2*kC)*vD,30*LV),Lax=Math.max((.3-.12*kC)*vD,30*LV);dr(l0);let sg=H.cote(undefined,true);const tours=[],iS=ix();
    for(let k=0;k<n;k++){if(k>0)dr(Lax); /* dans l'axe : la tour k droit devant */
      arcP(sg);dr(S1);arcP(-sg);const Pk=G.P(),ph=G.phi(),cx=Math.round(Math.cos(ph)),cz=Math.round(-Math.sin(ph)); /* au sommet : le cap est sur la trame ; le centre du virage (-sg) est du côté (cx, cz) × -sg — la tour, sur l'axe */
      tours.push({x:Pk.x,z:Pk.z,ix:-sg*cx,iz:-sg*cz,ux:C.ux,uz:C.uz});arcP(-sg);dr(S1);arcP(sg);if(k<n-1)sg=-sg;}
    const iT=ix();const l1=Math.max((.25-.12*kC)*vD,25*LV);dr(l1);H.setDer(sg);
    FILETMARK.push({anc:[{t:'cslalom',ax:C.ax,tours:tours}]});return {fig:'slalomtours',nom:'slalom des tours',ss:[[Math.max(0,iS-1),iT]]};}; /* ss : (le contrôle) le saut refusé dans le slalom — les tours sont dures en vol, et elles sont dans l'axe : un vol droit les prendrait */
  sSlalomTours.cle='slalomtours';sSlalomTours.nom='slalom des tours';  /* LE PIQUÉ : la crête (2-3 s de montée à 6 %, un plat court), la BASCULE (0 → −th, rayon 1,97 × la croisière — 1,9 tenait 1,69 : le toboggan de l'orbite tient 1,7 — les lissages de la ville en mangent un peu, mesuré), le piqué tenu,
     la RESSOURCE (−th → 0, 1,3 × ce rayon), la rue (12 m au-dessus d'une dalle dure, entre ses murs), la remontée qui tourne (36-52° à 2,3 rP et plus, +10 %).
     Tout le piqué est DANS l'axe (le calage) : on voit le fond. Les nappes de circulation se posent en travers, aux tiers du piqué. */
  const sPique=function(){const C=H.calage(2.45),th=(30+rf()*8)/DEG,Rb=1.97*vD,Rr=Math.max(1.3*Rb,3.3*rP),g=-Math.tan(th); /* (le jury) la ressource à 3 rP et plus */
    const l0=Math.max((.3-.15*kC)*vD,25*LV);droit(l0,.06,0,Math.max(1,Math.round(l0/50)));vArc(Rb,Math.atan(.06),0,0);const lc=Math.max(.15*vD,18*LV);droit(lc,0,0,1);
    const iA=ix(),A=G.P().clone();vArc(Rb,0,-th,0);const Lh=(.6+rf()*.25)*vD;droit(Lh,g,0,Math.max(2,Math.ceil(Lh/40)));vArc(Rr,-th,0,0);const iB=ix(),B=G.P().clone();
    const Lb=(.6-.2*kC+rf()*.2)*vD;straight(Lb,-.01*Lb,2);const iC=ix(),Cc=G.P().clone();
    const sm=H.cote(undefined,true),a3=36+rf()*12,L3=Math.max((.9-.25*kC+rf()*.2)*vD,a3/DEG*2.3*rP);G.courbe(L3,.10*L3,sm*a3,3);vArc(2.2*vD,Math.atan(.10),0,0);droit(Math.max(.45*vD,40),0,0,2);H.setDer(sm); /* (le contrôle : la crête de sortie à 1,34 vD au palier 10, la remontée à +10 % cassée net par la descente de la liaison) la remontée se couche sur un arc de 2,2 vD puis un palier plat : la liaison qui suit ne casse plus que 0 → −10 % */
    const nN=2+(rf()<.5?1:0)+(LV>1.6?1:0),LAB=Math.abs((B.x-A.x)*C.ux+(B.z-A.z)*C.uz),nap=[];
    for(let k=0;k<nN;k++){const f=.18+.64*(nN>1?k/(nN-1):.5),s9=f*LAB;nap.push({x:A.x+C.ux*s9,z:A.z+C.uz*s9,s:s9});}
    FILETMARK.push({anc:[{t:'cpique',ax:C.ax,ux:C.ux,uz:C.uz,A:{x:A.x,z:A.z},B:{x:B.x,z:B.z},L:LAB,nap:nap},{t:'rue',ax:C.ax,ux:C.ux,uz:C.uz,x0:B.x,z0:B.z,x1:Cc.x,z1:Cc.z}]});
    return {fig:'pique',nom:'piqué',nul:[[Math.max(0,iA-3),iC+1]],ss:[[Math.max(0,iA-3),iB]]};}; /* ss : LE SAUT REFUSÉ de la crête au bas de la ressource (vcSautRefuse) — la caisse ne décolle pas seule (collée à la dalle en conduite), et un saut nitro sur la crête volerait 3-5 s au-dessus du piqué, jusque hors de la route */
  sPique.cle='pique';sPique.nom='piqué';
  /* LES MONTAGNES RUSSES DES TOITS : par vague, la montée (arc vertical, la pente s tenue, l'arc de crête), le plat de la crête (100 m : le toit-terrasse 8-11 m sous lui),
     la descente (un peu plus longue : la route perd de la hauteur), l'arc du creux, le plat du creux (ses deux tours). Chaque vague tourne en plan de 14-22°, d'un côté
     puis de l'autre (un S très large : jamais de ligne droite de plus de ~4 s, R ≥ 8 rP). */
  /* (après le contrôle, tour 1 : « ni vague ni toit ne se lit ») des vagues HAUTES : 20-23° de pente tenue (au lieu de 15-18°) et une montée deux fois plus longue —
     ~35-40 m de dénivelé par vague au palier 0 (au lieu de ~18 m, que la dalle de 56 m et le flou de vitesse effaçaient) ; le même rayon vertical (2,05 × la croisière
     dessiné) ; le plat de crête raccourci (50 m) ; 2 vagues (3 ne tenaient pas la place). */
  const sRusses=function(){const n=2,s=.36+rf()*.06-.08*kC,th=Math.atan(s),Rv=2.05*vD,Lu=(.55-.35*kC+rf()*.1)*vD, /* (kC : la route rapide) la pente et la montée raccourcissent — les arcs de 2,05 vD y font déjà le dénivelé : ~35-40 m par vague à tous les paliers */Lp=50,Lk=Math.max(.25*vD,26);
    const l0=Math.max((.35-.15*kC)*vD,30*LV);let sg=H.cote(undefined,true);const i0=ix(),an=[],ss=[];straight(l0,-.02*l0,1);let prev=null;
    for(let k=0;k<n;k++){const ang=sg*(14+rf()*8),Ld=Lu*1.15,W=4*vLong(Rv,0,th)+Lu+Lp+Ld+Lk,kA=ang/W;
      vArc(Rv,0,th,kA*vLong(Rv,0,th));droit(Lu,s,kA*Lu,Math.max(1,Math.ceil(Lu/40)));const iS0=ix();vArc(Rv,th,0,kA*vLong(Rv,0,th));
      droit(Lp/2,0,kA*Lp/2,2);const Pm=G.P().clone();an.push({t:'toit',x0:Pm.x,z0:Pm.z,x1:Pm.x,z1:Pm.z});droit(Lp/2,0,kA*Lp/2,2);
      vArc(Rv,0,-th,kA*vLong(Rv,0,th));droit(Ld,-s,kA*Ld,Math.max(1,Math.ceil(Ld/40)));ss.push([iS0,ix()]);vArc(Rv,-th,0,kA*vLong(Rv,0,th));
      droit(Lk/2,0,kA*Lk/2,1);const Pc=G.P().clone(),ph=G.phi();droit(Lk/2,0,kA*Lk/2,1);
      const cr=[{x:Pm.x,z:Pm.z}];if(prev)cr.push(prev);an.push({t:'crusse',x:Pc.x,z:Pc.z,ux:Math.sin(ph),uz:Math.cos(ph),cr:cr});prev={x:Pm.x,z:Pm.z};sg=-sg;}
    const l1=Math.max((.3-.15*kC)*vD,25*LV);straight(l1,-.02*l1,1);const i1=ix();H.setDer(-sg);
    FILETMARK.push({anc:an});return {fig:'russes',nom:'montagnes russes des toits',nul:[[i0,i1]],ss:ss};}; /* ss : le saut refusé de chaque crête au pied de sa descente (le toit-terrasse 8 m sous la crête : on ne s'y pose pas) */
  sRusses.cle='russes';sRusses.nom='montagnes russes des toits';
  /* LES LONGUEURS (s de croisière, calage compris, au pire de 20 graines aux paliers 0, 10 et 20 (le 18/11, après le resserrage des paliers rapides) — outils/banc-routes/ville-cyber.cjs et ?villescene=) : interpolées sur LV
     ICI (la longueur des scènes, linéaire du palier 0 au palier 20, la surestimait de 40 % au palier 10 : elles n'y tenaient jamais) — VS.longueur lit [v, v] */
  const lgLV=function(T){const x=[1.08,1.88,3.71];if(LV<=x[1]){const f=Math.max(0,(LV-x[0])/(x[1]-x[0]));return T[0]+(T[1]-T[0])*f;}const f=Math.min(1,(LV-x[1])/(x[2]-x[1]));return T[1]+(T[2]-T[1])*f;};
  sSlalomTours.lg=[0,0].fill(lgLV([16.2,9.6,6.4]));sPique.lg=[0,0].fill(lgLV([11.7,8.9,8.3]));sRusses.lg=[0,0].fill(lgLV([12.2,8.4,7.7])); /* (tour 2 : les tours dans l'axe, les vagues hautes — remesuré, 20 graines forcées ; tour 3 : le slalom qui revient dans l'axe, remesuré) */
  return {liste:[sSlalomTours,sPique,sRusses]};
}
/* ===== LE DÉCOR (vsReserve → vcReserve, vsBatirG → vcBatir) =====
   Chaque pièce (une tour, un mur, une nappe) passe SEULE la règle : vsLibre (aucun point de route à moins de 14 m du bord de la dalle, dans sa hauteur −40 / +60) et
   vsAirOk (hors du couloir des sauts) — les nappes, sous la dalle, se jugent en 3D (vcEcart : 12 m au moins de tout le ruban). Une pièce refusée est perdue seule
   (P0.vcPerdus, sa raison dans P0.vcRaisons ; le meilleur-de-N en compte la moitié) ; le plan tient s'il en reste une. P0.zones : les emprises (vsBloque). */
function vcRect(A,ux,uz,s0,s1,l0,l1){const vx=uz,vz=-ux,X=[],Z=[];for(const s of [s0,s1])for(const l of [l0,l1]){X.push(A.x+ux*s+vx*l);Z.push(A.z+uz*s+vz*l);}
  return [Math.min.apply(null,X),Math.max.apply(null,X),Math.min.apply(null,Z),Math.max.apply(null,Z)];} /* le rectangle [s0, s1] le long de la marche (ux, uz alignés sur la trame), [l0, l1] en travers */
function vcYIci(V,x,z,r){const b=vsBande(V,[x-r,x+r,z-r,z+r]);return b?(b[4]+b[5])/2:null;} /* la hauteur de SA route ici (la plus longue suite de points dans la fenêtre) */
function vcEcart(V,B){ /* la plus courte distance 3D de la boîte B [x0,x1,y0,y1,z0,z1] au RUBAN (chaque point de route, ±ROAD_HALF en travers, 9 échantillons) */
  let m=1e9;const cx=(B[0]+B[1])/2,cz=(B[4]+B[5])/2,R=Math.hypot(B[1]-B[0],B[5]-B[4])/2+ROAD_HALF+40;
  V.proches(cx,cz,R,function(i){const p=V.P[i],dP=Math.hypot(Math.max(B[0]-p.x,0,p.x-B[1]),Math.max(B[4]-p.z,0,p.z-B[5])),dY=Math.max(B[2]-p.y,0,p.y-B[3]);if(Math.hypot(Math.max(0,dP-ROAD_HALF),dY)>=m)return; /* (le coût) la borne basse : le point le plus proche du ruban ici ne peut pas faire mieux */const a=V.P[Math.max(0,i-1)],c=V.P[Math.min(V.P.length-1,i+1)],tl=Math.hypot(c.x-a.x,c.z-a.z)||1,bx=(c.z-a.z)/tl,bz=-(c.x-a.x)/tl;
    for(let k=-4;k<=4;k++){const x=p.x+bx*ROAD_HALF*k/4,z=p.z+bz*ROAD_HALF*k/4,d=Math.hypot(Math.max(B[0]-x,0,x-B[1]),Math.max(B[2]-p.y,0,p.y-B[3]),Math.max(B[4]-z,0,z-B[5]));if(d<m)m=d;}});
  return m;}
function vcFrole(V,B){let f=false;const cx=(B[0]+B[1])/2,cz=(B[4]+B[5])/2,R=Math.hypot(B[1]-B[0],B[5]-B[4])/2+ROAD_HALF+12; /* LA RÈGLE DE L'AUDIT (dbgVilleAudit, frole) avec 2 m de garde : un point de route à moins de ROAD_HALF + 8 m EN PLAN dont la bande −3 / +14 m coupe la boîte */
  V.proches(cx,cz,R,function(i){if(f)return;const p=V.P[i],d=Math.hypot(Math.max(B[0]-p.x,0,p.x-B[1]),Math.max(B[4]-p.z,0,p.z-B[5]));if(d<ROAD_HALF+8&&B[3]>p.y-3&&B[2]<p.y+14)f=true;});return f;}
function vcReserve(V,a,P0,non,essai){return rythmeMene(vcReserveG(V,a,P0,non,essai,null));} /* d'un trait (le meilleur-de-N, les bancs) : le même générateur */
/* (après le contrôle, tour 2 : « la tranche qu'on ne peut pas couper grossit quand le piqué joue ») EN TRANCHES : buildVoxCityG mène ce générateur APRÈS vsReserve, une
   pause possible (ech, l'échéance JF.lim) avant chaque pièce — mêmes pièces, même ordre, mêmes résultats ; aucune n'est jugée contre un autre plan, l'ordre ne change rien. */
function* vcReserveG(V,a,P0,non,essai,ech){const MS=ROAD_HALF+14,MG=ROAD_HALF+15,Y=function(){return !!ech&&ech();}; /* essai : (le meilleur-de-N, vsMalusDecor — une tranche d'un seul tenant) le juge court : les nappes ne se jugent qu'à la pose réelle (jamais perdues, mesuré), chaque mur du piqué d'un seul vsLibre */
  P0.zones=[];P0.vcP=[];P0.vcN=[];P0.vcPerdus=0;P0.vcRaisons={};
  const perd=function(r){P0.vcPerdus++;P0.vcRaisons[r]=(P0.vcRaisons[r]||0)+1;};
  const piece=function(r,b,top){if(!vsLibre(V,r[0],r[1],b,top,r[2],r[3],MS,null)){perd('route');return false;}if(!vsAirOk(V,r[0],r[1],r[2],r[3],top)){perd('air');return false;}P0.zones.push([r[0],r[1],r[2],r[3]]);return true;};
  if(a.t==='cslalom'){let k=0;P0.x=a.tours.length?a.tours[0].x:0;P0.z=a.tours.length?a.tours[0].z:0;
    for(const t of a.tours){if(Y())yield;k++;const h=VS_H(t.x+k*7.1,t.z-k*3.3),hw=V.snap(12.8),hd=V.snap(8+h*5) /* hw : (tour 3) une tour de 25,6 m de large — 12,8 se perdait dans le flou à 200 m —, son centre sur l'axe d'arrivée */,y=vcYIci(V,t.x,t.z,14);if(y==null){perd('bande');continue;}
      const latX=t.ix!==0,cx=t.x+t.ix*(MG+hw),cz=t.z+t.iz*(MG+hw),hx=latX?hw:hd,hz=latX?hd:hw,top=y+230+h*200,b=y-330,r=[cx-hx,cx+hx,cz-hz,cz+hz];
      if(!piece(r,b,top))continue;P0.vcP.push({r:r,b:b,top:top,y:y,h:h,cx:cx,cz:cz,ix:t.ix,iz:t.iz,ux:t.ux,uz:t.uz,hx:hx,hz:hz});if(P0.y1==null)P0.y1=y;}}
  else if(a.t==='cpique'){P0.x=a.A.x;P0.z=a.A.z;const yA=vcYIci(V,a.A.x,a.A.z,14),yB=vcYIci(V,a.B.x,a.B.z,14);if(yA==null||yB==null){non('bande');return;}P0.y1=yA;
    const ux=a.ux,uz=a.uz,WN=MG+44+60,trous=[];
    let kN=0;if(!essai)for(const q of a.nap){if(Y())yield;const y=vcYIci(V,q.x,q.z,10);if(y==null){perd('bande');continue;}const r=vcRect(a.A,ux,uz,q.s-3.4,q.s+3.4,-WN,WN);let ym=y,yM=y;vsPoints(V,r[0],r[1],r[2],r[3],ROAD_HALF+10,function(i,p){if(p.y<ym)ym=p.y;if(p.y>yM)yM=p.y;}); /* ym, yM : la route la plus basse et la plus haute à moins de 38 m en plan (la pente : 36 m en amont, la route est 25 m plus haut) */
      const des=(kN++)%2===1,yt=des?yM+16:Math.min(y-18,ym-6),B=[r[0],r[1],yt-.6,yt+1.3,r[2],r[3]]; /* étagées : une nappe sous la dalle, la suivante AU-DESSUS (15 m : on plonge sous elle — le saut y est refusé), en alternance */
      if(vcEcart(V,B)<12||vcFrole(V,B)){perd('nappe');continue;}if(!vsAirOk(V,r[0],r[1],r[2],r[3],yt+1.3)){perd('air');continue;}P0.vcN.push({s:q.s,y:yt,h:VS_H(q.x,q.z)});trous.push(q.s);P0.zones.push([r[0],r[1],r[2],r[3]]);} /* (la zone : les tours ordinaires s'écartent, la file passe dans une rue) */
    for(const e of [-1,1]){const E9=essai?[1e9,-1e9,1e9,-1e9,-1e9]:null;let n9=0;for(let s=2;s<a.L-36;){if(!E9&&Y())yield;const h=VS_H(a.A.x+s*1.7+e*5,a.A.z+s*.9-e*2),hw=V.snap(10+h*8),dp=V.snap(22+h*18);if(s+dp>a.L-30)break;
      let tr=false;for(const t of trous)if(t>s-6&&t<s+dp+6)tr=true;if(tr){s+=8;continue;} /* la nappe passe entre deux tours */
      const l0=e>0?MG:-MG-2*hw,l1=e>0?MG+2*hw:-MG,r=vcRect(a.A,ux,uz,s,s+dp,l0,l1),top=yA+50+h*170,b=yB-330;
      if(E9){E9[0]=Math.min(E9[0],r[0]);E9[1]=Math.max(E9[1],r[1]);E9[2]=Math.min(E9[2],r[2]);E9[3]=Math.max(E9[3],r[3]);E9[4]=Math.max(E9[4],top);n9++;s+=dp+V.snap(4+h*6);continue;} /* (essai) le mur entier, d'un seul tenant */
      if(piece(r,b,top)){const yc=vcYIci(V,a.A.x+ux*(s+dp/2),a.A.z+uz*(s+dp/2),14);P0.vcP.push({r:r,b:b,top:top,y:yc!=null?yc:yA,h:h,e:e,s:s,dp:dp,hw:hw});}
      s+=dp+V.snap(4+h*6);}
      if(E9&&n9){const b9=yB-330;if(vsLibre(V,E9[0],E9[1],b9,E9[4],E9[2],E9[3],MS,null)&&vsAirOk(V,E9[0],E9[1],E9[2],E9[3],E9[4]))P0.vcP.push({essai:1});else{perd('route');perd('route');}}}} /* (essai) un mur refusé compte pour deux tours perdues */
  else if(a.t==='crusse'){P0.x=a.x;P0.z=a.z;const y=vcYIci(V,a.x,a.z,14);if(y==null){non('bande');return;}P0.y1=y;let yc=y;for(const c of a.cr){const y9=vcYIci(V,c.x,c.z,14);if(y9!=null&&y9>yc)yc=y9;}
    const nx=-a.uz,nz=a.ux,alX=Math.abs(a.ux)>=Math.abs(a.uz);
    for(const e of [-1,1]){if(Y())yield;const h=VS_H(a.x+e*11.3,a.z-e*6.1),hl=V.snap(14+h*10),ha=V.snap(10+h*8),hx=alX?hl:ha,hz=alX?ha:hl,ext=hx*Math.abs(nx)+hz*Math.abs(nz),cx=a.x+e*nx*(MG+ext+6),cz=a.z+e*nz*(MG+ext+6);
      const top=Math.max(yc,y+40)+30+h*110,b=y-330;
      /* (après le contrôle, tour 2 : « un quart des tours de creux perdues ») une autre partie de la route passe là : la tour glisse de 36 m le long du creux, en amont puis
         en aval (toujours au flanc du creux, du même côté) ; perdue seulement si les trois places sont prises */
      let pos=null,rz='';for(const o of [0,36,-36]){const cx9=cx+a.ux*o,cz9=cz+a.uz*o,r=[cx9-hx,cx9+hx,cz9-hz,cz9+hz];
        if(!vsLibre(V,r[0],r[1],b,top,r[2],r[3],MS,null)){rz=rz||'route';continue;}if(!vsAirOk(V,r[0],r[1],r[2],r[3],top)){rz=rz||'air';continue;}pos={r:r,cx:cx9,cz:cz9};break;}
      if(!pos){perd(rz);continue;}P0.zones.push(pos.r.slice());P0.vcP.push({r:pos.r,b:b,top:top,y:y,h:h,cx:pos.cx,cz:pos.cz,e:e,nx:nx,nz:nz});}}
  P0.ok=P0.vcP.length+P0.vcN.length>0;if(!P0.ok)non(P0.vcRaisons.route?'route':P0.vcRaisons.air?'air':'vide');else if(P0.zones.length){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const z of P0.zones){x0=Math.min(x0,z[0]);x1=Math.max(x1,z[1]);z0=Math.min(z0,z[2]);z1=Math.max(z1,z[3]);}P0.cx=(x0+x1)/2;P0.cz=(z0+z1)/2;P0.b=P0.vcP[0].b;}}
/* les volumes : F = {vol, lum, lumA, sommet} de vsBatirG ; k : le groupe du plan */
/* (tour 2) en tranches comme vsBatirG qui le mène (yield*) : une pause possible (ech) avant chaque tour, chaque mur, chaque nappe — mêmes volumes, même ordre */
function* vcBatirG(V,p,k,F,ech){const Y=function(){return !!ech&&ech();},vol=F.vol,lum=F.lum,sommet=F.sommet,h0=VS_H(p.cx||0,p.cz||0),c0=Math.floor(h0*50);p.vcVol=[V.genre.length,0];p.vcNeon=[V.neonC.length,0];
  if(p.t==='cslalom'){let j=0;for(const T of p.vcP){if(Y())yield;j++;const r=T.r,kk=[T.cx,k[1],T.cz,k[3]],col=(c0+j)%5;
      vol(r[0],r[1],T.b,T.top,r[2],r[3],0,false,kk);sommet(T.cx,T.cz,r[1]-r[0],r[3]-r[2],T.top,kk,T.h);
      /* face à l'arrivée : une raie de néon sur toute la hauteur visible (on la voit droit devant) ; sur le flanc que la route frôle : une enseigne verticale */
      const fx=T.cx-T.ux*((T.ux?T.hx:T.hz)+.9),fz=T.cz-T.uz*((T.ux?T.hx:T.hz)+.9),wx=T.ux?.9:2.2,wz=T.ux?2.2:.9;lum(fx-wx,fx+wx,T.y-8,T.y+150+T.h*90,fz-wz,fz+wz,col,kk);
      /* (tour 3) LE MUR DANS L'AXE : quatre bandeaux de néon en travers de la face d'arrivée, sur toute sa largeur, au-dessus de la dalle — on voit de loin une tour barrer la route */
      {const la=(T.ux?T.hz:T.hx)-1,bx=T.ux?.9:la,bz=T.ux?la:.9;for(let b9=0;b9<4;b9++){const yb=T.y+12+b9*(26+T.h*12);lum(fx-bx,fx+bx,yb,yb+2.6,fz-bz,fz+bz,(col+1+(b9&1))%5,kk);}}
      const sx=T.cx-T.ix*(T.hx+.9),sz=T.cz-T.iz*(T.hz+.9),qx=T.ix?.9:3.4,qz=T.ix?3.4:.9;lum(sx-qx,sx+qx,T.y+16,T.y+70+T.h*50,sz-qz,sz+qz,(col+2)%5,kk);}}
  else if(p.t==='cpique'){const a=p.a,ux=a.ux,uz=a.uz,WN=ROAD_HALF+15+44+60,pasL=typeof ALLEGE!=='undefined'&&ALLEGE?34:17; /* (le téléphone, ALLEGE) une luciole sur deux */
    for(const T of p.vcP){if(Y())yield;const r=T.r,mx=(r[0]+r[1])/2,mz=(r[2]+r[3])/2,kk=[mx,k[1],mz,k[3]];vol(r[0],r[1],T.b,T.top,r[2],r[3],0,false,kk);
      if(T.h>.42){const l=T.e>0?ROAD_HALF+15:-(ROAD_HALF+15),q=vcRect(a.A,ux,uz,T.s+T.dp/2-4,T.s+T.dp/2+4,T.e>0?l-1.8:l,T.e>0?l:l+1.8);if(!(typeof veActif==='function'&&veActif()&&vcEcart(V,[q[0],q[1],T.y+14,T.y+64+T.h*50,q[2],q[3]])<12))lum(q[0],q[1],T.y+14,T.y+64+T.h*50,q[2],q[3],(c0+Math.floor(T.h*9))%5,kk);}} /* (2026-11-19, contrôle du lot E) sur la route à étages, l'enseigne qu'une route d'un autre étage frôlerait (12 m) n'est pas posée — MESURÉ, graine 508 au palier 20 : deux enseignes du piqué sur la route du dessous (audit dans 2) */ /* une enseigne verticale tournée vers le piqué */
    for(const N of p.vcN){if(Y())yield;const kk=[a.A.x+ux*N.s,k[1],a.A.z+uz*N.s,k[3]];
      for(const o of [-2.4,2.4]){const c=o<0?5:6,r=vcRect(a.A,ux,uz,N.s+o-.5,N.s+o+.5,-WN,WN);lum(r[0],r[1],N.y-.5,N.y,r[2],r[3],c,kk); /* la file : un trait */
        for(let l=-WN+6,q=0;l<WN-6;l+=pasL,q++){const r9=VS_H(N.s+l*.37,o+q),d=(r9-.5)*7;const b=vcRect(a.A,ux,uz,N.s+o-1.1,N.s+o+1.1,l+d-2.3,l+d+2.3);lum(b[0],b[1],N.y,N.y+1.2,b[2],b[3],c,kk);}}}} /* les lucioles */
  else if(p.t==='crusse'){for(const T of p.vcP){if(Y())yield;const r=T.r,kk=[T.cx,k[1],T.cz,k[3]];vol(r[0],r[1],T.b,T.top,r[2],r[3],0,false,kk);sommet(T.cx,T.cz,r[1]-r[0],r[3]-r[2],T.top,kk,T.h);
      const ax=Math.abs(T.nx)>=Math.abs(T.nz),fx=ax?T.cx-T.e*Math.sign(T.nx)*((r[1]-r[0])/2+.9):T.cx,fz=ax?T.cz:T.cz-T.e*Math.sign(T.nz)*((r[3]-r[2])/2+.9);lum(fx-(ax?.9:3.2),fx+(ax?.9:3.2),T.y+10,T.y+60+T.h*40,fz-(ax?3.2:.9),fz+(ax?3.2:.9),(c0+(T.e>0?1:3))%5,kk);}} /* l'enseigne du creux */
  p.vcVol[1]=V.genre.length;p.vcNeon[1]=V.neonC.length;}
