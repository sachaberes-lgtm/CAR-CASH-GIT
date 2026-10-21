/* ---- LA BALADE (`?map=jade`) : le départ se lance seul (le PLAY de l'accueil, son chemin), le HUD du jeu se tait ---- */
const BALADE_CSS=[
  'html.balade #flowHud,html.balade #auraV2,html.balade #avGain,html.balade #avList,html.balade #triade,html.balade #frenTitre,html.balade #frenTraits,html.balade #frenChrono,',
  'html.balade #airHud,html.balade #airPie,html.balade #pwrChip,html.balade #pwrFx,html.balade #misBan,html.balade #coach,html.balade #campChip,html.balade #popTxt,',
  'html.balade #slam9,html.balade #lvlBan,html.balade #engBig,html.balade #chainHud,html.balade #caseHud,html.balade #msg,html.balade .trick,',
  'html.balade #launchLogo,html.balade #launchGlow,html.balade #verdict,html.balade #carCard,html.balade #survHud,html.balade #lastAlert,html.balade #juiceCv,html.balade .bill,html.balade #money,html.balade #cashHud,html.balade #ajCourse,html.balade #ajVols',
  '{display:none!important}',
  'html.balade.jadeAnn #slam9{display:block!important}'].join(''); // (v14) le DÉPART et l'ARRIVÉE du niveau, seuls à parler
function baladeDepart(){
  if(!BALADE)return;
  try{const st=document.createElement('style');st.id='baladeCss';st.textContent=BALADE_CSS;document.body.appendChild(st);}catch(e){}
  let n9=0;
  const tente=function(){
    try{if(started&&!gameOver){SANDBOX=true;return;}}catch(e){setTimeout(tente,200);return;}
    if(document.getElementById('splash')||!window.__gameReady){setTimeout(tente,200);return;}
    if(n9++>40)return;
    SANDBOX=true;
    /* (2026-10-11, Léo : « enlève les intros, lance juste la voiture dans la map ») plus de menu, de fondu, de garage ni de sortie par la
       porte : la course part TOUT DE SUITE (start), la caméra se pose d'un coup derrière la caisse (un écart de plus de 50 m = un saut,
       pas un travelling depuis la vitrine) */
    try{if(garageOn)closeGarage();start();camera.position.copy(carGroup.position);camera.position.y+=900;loop._camDriveT=0;setTimeout(function(){document.documentElement.classList.add('parti');},120);}catch(e){console.warn('balade',e);}
    setTimeout(tente,600); // (si le départ n'a pas pris : on retente)
  };
  setTimeout(tente,60);
}
addEventListener('load',function(){setTimeout(baladeDepart,0);});
function buildVoxCity(seed,accC){
  for(const F of CITY.fam||[])for(const x of [F.im,F.imL])x.dispose(); // (passe perf) les tampons d'instances de l'ancienne ville (les géométries sont parties avec trackMeshes)
  CITY.root=null;CITY.n={};CITY.col=null;CITY.ens=[];CITY.solY=null;CITY.imC=CITY.imN=null;CITY.fam=null;CITY.lampes=null;cryptoVide(); // (CRYPTOCITY) ce que la ville d'avant avait de crypto part avec elle // (l'ancien cratère s'éteint avec son quartier)
  if(PARK.on)return; // le parc a sa prairie
  if(LVL.cur&&LVL.cur.id!=='ville')return; // NIVEAUX : la ville n'existe qu'au niveau VILLE
  if(!(NP>1))return;
  const VI=!!(LVL.cur&&LVL.cur.vitre);if(VI)VIT.neuf=true;const VS=VI&&VIT_SOL; // VS : (2026-10-18) LA VILLE VITRÉE AU SOL (voir VIT_SOL) // (2026-10-17) LA VILLE VITRÉE : la même ville (mêmes tirages), des tours de verre — voir « LA VILLE VITRÉE »
  const CR=!!(LVL.cur&&LVL.cur.crypto); // (2026-10-13) CRYPTOCITY : la même ville (mêmes tirages), un autre air — voir cryptoPlace / cryptoTour / cryptoBatit
  const t00=performance.now();
  const vr=mulberry32(seed^0x5EED10C1); // flux DÉRIVÉ (voir ⚠ ci-dessus)
  const root=new THREE.Group();scene.add(root);CITY.root=root;trackMeshes.push(root);
  const snap=v=>Math.max(1,Math.round(v/VOX_CITY))*VOX_CITY; // tout atterrit sur la trame, jamais entre deux
  // LA GRILLE DE HACHAGE DE LA PISTE : un point tous les ~12 m, rangé par cases de 120 m (horizontales)
  const HB=120,grille=new Map(),pasP=Math.max(1,Math.round(12/(L/(NP-1))));
  let yMin=1e9,yMax=-1e9;
  for(let i=0;i<NP;i+=pasP){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);
    if(p.y<yMin)yMin=p.y;if(p.y>yMax)yMax=p.y;}
  const GS=yMin-VIT_SOL_H;if(VS)CITY.solY=GS; // (AU SOL) le sol de la ville : VIT_SOL_H sous le point le plus bas de la route
  // (AU SOL) les tours ne se chevauchent pas (une géante DANS une autre percerait sa façade : la profondeur est en 16 bits) ; aucune ne pousse sous la route
  const PLC=new Map(),plcK=(x,z)=>Math.floor(x/90)*100003+Math.floor(z/90);
  const chev=(cx,cz,hd)=>{const bx=Math.floor(cx/90),bz=Math.floor(cz/90);for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const a=PLC.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j+=3){const ex=a[j]-cx,ez=a[j+1]-cz,rr=a[j+2]+hd+4;if(ex*ex+ez*ez<rr*rr)return true;}}return false;};
  const chevPose=(cx,cz,hd)=>{const k=plcK(cx,cz);let a=PLC.get(k);if(!a)PLC.set(k,a=[]);a.push(cx,cz,hd);};
  const routePres=(cx,cz,hd)=>{const clr=hd+ROAD_HALF+24,c2=clr*clr;let h=false;proches(cx,cz,clr,function(i){if(h)return;const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz<=c2)h=true;});return h;};
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  // LA RÈGLE D'OR : [pied, toit] rognés pour que la route ne traverse JAMAIS la tour (null s'il ne reste rien)
  const tourLibre=(cx,cz,hd,b,t)=>{const clr=hd+ROAD_HALF+24,c2=clr*clr; // (2026-09-26, user : « les immeubles ne doivent JAMAIS toucher la route ») marges élargies
    for(let pass=0;pass<4;pass++){let ok=true;
      proches(cx,cz,clr,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz>c2)return;
        if(p.y>t+60||p.y<b-40)return;ok=false;
        if(p.y>(b+t)*.5)t=Math.min(t,p.y-60);else b=Math.max(b,p.y+44);});
      if(ok)return t-b>=40?[b,t]:null;if(t-b<40)return null;}
    return null;}; // (2026-10-20, Sacha : « le sommet des tours traverse la route ») 4 passes sans solution = pas de tour (avant : elle restait, rognée à moitié)
  const routeAuDessus=(cx,cz,hd,t)=>{let m=1e9;const clr=hd+ROAD_HALF+24,c2=clr*clr; // la route la plus basse au-dessus du toit, sous l'emprise : borne le mât (il montait jusque dans le bitume)
    proches(cx,cz,clr,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz;if(dx*dx+dz*dz<=c2&&p.y>t&&p.y<m)m=p.y;});return m;};
  // LES CELLULES : maille SERRÉE près du ruban (le canyon), lâche au large ; chaque cellule retient le point de piste le plus proche
  const R_CAN=330,R_VIL=IS_MOBILE?1700:2100,SN=IS_MOBILE?66:54,SF=IS_MOBILE?230:200; // (2026-09-26) la forêt va jusqu'au brouillard
  const cellules=(S,R,garde)=>{const m=new Map(),rr=Math.ceil(R/S),pas=Math.max(1,Math.round(S*.6/(L/(NP-1))));
    for(let i=0;i<NP;i+=pas){const cx0=Math.round(pts[i].x/S),cz0=Math.round(pts[i].z/S);
      for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const gx=(cx0+dx)*S,gz=(cz0+dz)*S,d=Math.hypot(gx-pts[i].x,gz-pts[i].z);if(d>R)continue;
        const k=(cx0+dx)+','+(cz0+dz),o=m.get(k);if(!o||d<o[0])m.set(k,[d,i,gx,gz]);}}
    const out=[];for(const v of m.values())if(garde(v[0]))out.push(v);return out;};
  const corps=[],genre=[],neon=[],neonC=[],pubs=[],tqC=[],tqN=[],VTW=[]; // VTW (VILLE VITRÉE) : [1er volume, fin, 1er néon, fin, route, forme] par tour // tqC/tqN (passe perf) : le centre de la TOUR à laquelle appartient chaque volume / néon (son quartier, voir fam)
  // (2026-09-26, vague 2) les ENSEIGNES parlent MAGENTA et CYAN (#ff3ec8 / #3ee8ff et leurs deux voisins) : le jaune, le vert et le violet
  // en faisaient une guirlande. Cinq teintes comme avant (le tirage `vr` ne bouge pas), le feu d'antenne au rouge DANGER, la couronne à l'accent.
  CITY.uPied.value=1;
  const VV9=VILLE_VERRE_V&&!VI&&!CR;VV.on=VV9;VV.n=VV.nv=0;let gvDer=false; // (2026-10-18) LA VILLE, NÉON ET VERRE : ses géantes de verre (voir VILLE_VERRE_V) · gvDer : la dernière tour bâtie en est une
  const NEON=VI?[new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff),new THREE.Color(0xdfeaff), // (VILLE VITRÉE) pas d'enseigne (voir batir) ;
                 new THREE.Color(VIT_PLAFOND?0xff3b3b:0x5ab8ff),new THREE.Color(0xe6f0ff)]: // le feu d'antenne (CLEAN CITY : BLEU — Léo : « les trucs rouges au-dessus, ça ressemble trop à Crypto City »), la couronne en bandeau de lumière blanche
           CR?[new THREE.Color(0x2bff88),new THREE.Color(0xffd23e),new THREE.Color(0xf7931a),new THREE.Color(0x6dffc8), // CRYPTO CITY : le vert profit, l'or, l'orange bitcoin, la menthe…
                 new THREE.Color(0xfff2c8),new THREE.Color(0xff3b5c),new THREE.Color(0xffc63a)]: // …un blanc chaud, le feu d'antenne, la couronne en OR
             (!villeRose())?[new THREE.Color(0xffb04a),new THREE.Color(0xe8eef2),new THREE.Color(0xffb04a),new THREE.Color(0xe8eef2), // (2026-10-14, passe graphismes · facades-jour)
              new THREE.Color(0xffb04a),new THREE.Color(0xe5484d),new THREE.Color(0xe8eef2)]: // DIRECTION §2.2 : enseignes ambre #FFB04A / blanc de bureau #E8EEF2, feu d'antenne rouge de balise #E5484D (l'unique accent saturé), couronne blanche — mêmes indices, même tirage `vr`
             [new THREE.Color(0xff3ec8),new THREE.Color(0x3ee8ff),new THREE.Color(0xff4f9e),new THREE.Color(0x52c8ff),
              new THREE.Color(0xff3ec8),new THREE.Color(0xff3b5c),accC];
  if(!VI){const T9=vtCur();if(T9)for(let i=0;i<6;i++)vtCol(NEON[i],T9);} // (2026-10-16) LES TEINTES DE LA VILLE : magenta et rose des enseignes → la couleur de la ville (le cyan et le rouge des balises restent ; accC l'est déjà)
  if(VV9)VV.acc.copy(NEON[0]); // (NÉON ET VERRE) les filets, les logos et le parapet du verre : le néon de la teinte
  let nT=0;
  // UNE TOUR : (cx,cz) son centre, d sa distance à l'axe, yN l'altitude du tronçon qu'elle BORDE, yLo le plus bas de ce tronçon
  /* L'ENTRÉE SURÉLEVÉE (voir VILLE_ENTREE) : `eEnt(i)` vaut 1 le long de la droite, glisse à 0 au pied de la rampe. Les tours qui bordent
     ces tronçons ont leurs toits ramenés SOUS la route (de `toit` à `toit`+`etage` m plus bas, les plus hautes restant les plus hautes) : sans aucun
     tirage `vr` de plus, la ville garde ses tours, ses teintes et ses néons — elle est juste plus basse là où l'on arrive.
     ⚠ ENTRÉE v2 (2026-10-04, Léo : « les niveaux villes ne sont pas tous des villes ») : MESURÉ (banc villepos.mjs, scratchpad 83e03bdc) —
     sur ~1 km (la droite + la rampe, ~10 s de jeu) TOUTES les tours (les trois rangs ET la forêt proche) passaient sous la route : AU-DESSUS
     DE LA VILLE et MINUIT EN VILLE commençaient par un ciel vide et une route mouillée, aucune tour à l'écran ; plus loin la ville est
     là (1 500-1 700 tours). Désormais seul le MUR (1er rang, au bord de la route) passe dessous — la route reste droite et SURÉLEVÉE au-dessus
     de lui (Sacha, 29/09) ; le 2e et le 3e rang et la forêt gardent leur hauteur : on arrive ENTRE les gratte-ciel. Mêmes tirages. */
  let iEA=-1,iEB=-1;
  if(VILLE_ENTREE){let dA=1e18,dB=1e18;const lim=Math.min(NP,Math.ceil(NP*.45));
    for(let i=0;i<lim;i++){const a=pts[i].distanceToSquared(VILLE_ENTREE.pA),b=pts[i].distanceToSquared(VILLE_ENTREE.pB);if(a<dA){dA=a;iEA=i;}if(b<dB){dB=b;iEB=i;}}
    if(!(iEB>iEA))iEA=iEB=-1;}
  const eEnt=i=>iEA<0?0:i<=iEA?1:i>=iEB?0:1-THREE.MathUtils.smoothstep((i-iEA)/(iEB-iEA),.25,1);
  CITY.entree=iEA<0?null:[iEA,iEB];
  if(CR)cryptoPlace(seed,proches); // (CRYPTOCITY) les taureaux, les bougies, les pièces géantes… se réservent leur place AVANT les tours
  const batir=(cx,cz,d,yN,yLo,canyon,w,p,eE)=>{
    const hd=Math.hypot(w,p)*.5+5,l0=corps.length,lg=genre.length,lq=tqC.length,ln=neon.length,lnc=neonC.length,lqn=tqN.length,le=CITY.ens.length;
    let t;
    if(VS){if(chev(cx,cz,hd))return;const k=canyon?1-Math.min(1,(d-54)/(R_CAN-54)):0,r1=vr(),r2=vr(); // (AU SOL) LES GÉANTES, posées sur le sol : 170 à 1 300 m au bord de la route (une sur six passe le kilomètre), 90 à 470 m au large
      t=GS+(canyon?170+(840-250*k)*Math.pow(r1,1.5)+(r2<.18?260:0):90+380*r1*r2);} // (le 1er rang un peu moins haut : les géantes de derrière se lisent au-dessus)
    else if(canyon){const k=1-Math.min(1,(d-54)/(R_CAN-54));           // LE CANYON : les murs montent AU-DESSUS de la route
      t=yN-50+290*Math.pow(vr(),.75)*(.55+.45*k);if(k>.5&&vr()<.22)t+=160;}
    else t=yN-230+vr()*vr()*470;                                   // AU LARGE : la forêt du village
    if(eE>0&&!VS){const u9=THREE.MathUtils.clamp((t-yN+50)/450,0,1),tE=yN-VILLE_ENTREE_R.toit-(1-u9)*VILLE_ENTREE_R.etage;t+=(tE-t)*eE;} // (2026-09-29) L'ENTRÉE SURÉLEVÉE : le toit passe SOUS la route (juste sous elle pour les plus hautes : on les voit défiler au ras du bitume)
    if(VI&&VIT_PLAFOND&&t>yN)t=yN+(VIT_HC-40)*(1-Math.exp(-(t-yN)/(VIT_HC-40))); // (VILLE VITRÉE) la hauteur AU-DESSUS de la route se tasse en douceur sous le plafond (jamais plus de 110 m) : la route passe ENTRE les deux villes, chaque reflet pend au-dessus de sa tour
    let b=VS?GS-3:Math.min(yLo,yN)-330-vr()*120;if(!VS&&t-b>1000)b=t-1000;
    const bt=VS?(routePres(cx,cz,hd)?null:[b,t]):tourLibre(cx,cz,hd,b,t);if(!bt)return;b=bt[0];t=bt[1];
    if(VS)chevPose(cx,cz,hd);
    const H=t-b,km=(b+t)/2;nT++;
    const GV=VV9&&villeVerreTour(cx,cz,t-yN,canyon),VIt=VI||GV;gvDer=GV;if(VV9){VV.n++;if(GV)VV.nv++;} // (NÉON ET VERRE) une GÉANTE DE VERRE : bâtie comme dans la ville vitrée (VIt) — aucun tirage `vr` de plus ni de moins
    const fo=VIt?vitreForme(cx,cz,H,canyon):0; // (VILLE VITRÉE) la FORME de la tour (0 = droite, à retraits empilés)
    // LES RETRAITS : volumes EMBOÎTÉS qui partent tous du pied (la brume se lit pareil sur tous), plus étroits et plus hauts
    const et=H>260?(vr()<.55?3:2):(vr()<.4?2:1);
    let wk=w,pk=p,yV=b,h0=H; // (VILLE VITRÉE) yV : le haut du dernier volume EMPILÉ · h0 : la hauteur du volume du pied
    for(let k=0;k<et;k++){
      const fr=k===et-1?1:(.5+.36*(k+1)/et+(vr()-.5)*.08);
      /* (2026-10-17, VILLE VITRÉE) les retraits EMPILÉS, pas emboîtés : la profondeur de l'image est en 16 bits (24 m de pas à 400 m) — un volume
         caché DANS un autre, dessiné après lui, perçait sa façade par bandes (mesuré au rayon : le mât à 12 m derrière le verre). Même silhouette. */
      if(VIt&&fo>0){h0=H;yV=t;} // une tour de forme : un seul volume (ci-dessous) — les tirages des retraits ont lieu quand même
      else if(VIt){const y1=b+H*fr;if(y1>yV+1){corps.push(cx,(yV+y1)/2,cz,wk,y1-yV,pk);genre.push(0);tqC.push(cx,km,cz);}if(k===0)h0=H*fr;yV=Math.max(yV,y1);}
      else{corps.push(cx,b+H*fr/2,cz,wk,H*fr,pk);genre.push(0);tqC.push(cx,km,cz);}
      wk=snap(wk*.72);pk=snap(pk*.72);if(wk<VOX_CITY*2||pk<VOX_CITY*2)break;
    }
    if(VIt&&fo>0){corps.push(cx,km,cz,w,H,p);genre.push(0);tqC.push(cx,km,cz);}
    // LES TUYAUX : ils DESCENDENT le long d'une façade jusque dans la brume
    if(H>220&&vr()<(canyon?.7:.5)){
      const nt=1+((vr()*(IS_MOBILE?2:3))|0),tk=snap(3+vr()*2.5);
      for(let t9=0;t9<nt;t9++){const face=(vr()*4)|0,ht=VIt?Math.min(H*(.5+vr()*.45),h0):H*(.5+vr()*.45),gl=(vr()-.5)*.7; // (VILLE VITRÉE) la lame s'arrête au toit du volume qu'elle longe
        const ox=face<2?(face?1:-1)*(w/2+tk/2):gl*w,oz=face<2?gl*p:(face===2?1:-1)*(p/2+tk/2);
        if(VIt&&fo>0)continue; // (VILLE VITRÉE) une tour de forme n'a pas de lame plaquée (sa façade s'effile ou tourne)
        corps.push(cx+ox,b+ht/2,cz+oz,tk,ht,tk);genre.push(1);tqC.push(cx,km,cz);}
    }
    // L'ANTENNE et son FEU ROUGE — sinon, parfois, la COURONNE à l'accent de la zone
    if(H>320&&vr()<.5){let ha=24+vr()*56;if(VIt){if(fo===5)ha=0;else{corps.push(cx,yV+ha/2,cz,1.4,ha,1.4);genre.push(2);tqC.push(cx,km,cz);neon.push(cx,yV+ha,cz,2.2,2.2,2.2);neonC.push(5);tqN.push(cx,km,cz);}} // (VILLE VITRÉE) le mât part du TOIT — pas de mât sur une LAME (son toit est en biais) (il ne traverse plus la tour)
      else{ha=Math.min(ha,routeAuDessus(cx,cz,hd,t)-t-12);if(ha>=8){corps.push(cx,b+(H+ha)/2,cz,2.4,H+ha,2.4);genre.push(2);tqC.push(cx,km,cz);neon.push(cx,t+ha,cz,4.5,4.5,4.5);neonC.push(5);tqN.push(cx,km,cz);}}}
    else if(vr()<.32){if(!VIt||(fo===0&&!vitreBiseau(cx,cz))){neon.push(cx,(VIt?yV:t)-1.4,cz,wk/.72*1.05,2.8,pk/.72*1.05);neonC.push(6);tqN.push(cx,km,cz);}} // (VILLE VITRÉE) pas de couronne carrée sur une tour biseautée
    if(VIt)VTW.push([l0/6,corps.length/6,ln/6,neon.length/6,yN,fo,t]); // (VILLE VITRÉE) la tour, pour la forme et pour son reflet au plafond
    // L'ENSEIGNE VERTICALE : le long du canyon, une tour sur deux porte son néon, à hauteur de ROUTE (on la voit passer)
    if(vr()<(canyon?.5:.18)){
      const hs=Math.min(H*.3,30+vr()*60),ys=Math.max(b+hs/2+20,Math.min(t-hs/2-6,yN+(vr()-.3)*80)),fx=vr()<.5,sg=vr()<.5?-1:1;
      const c5=(vr()*5)|0;if(VIt)return; /* (NÉON ET VERRE) ni sur une géante de verre */ // (VILLE VITRÉE) un quartier d'affaires : pas d'enseigne (le tirage a eu lieu, la suite de la ville ne bouge pas)
      neon.push(cx+(fx?sg*(w/2+1.2):0),ys,cz+(fx?0:sg*(p/2+1.2)),fx?1.8:7.5,hs,fx?7.5:1.8);neonC.push(c5);tqN.push(cx,km,cz);
      if(canyon&&CITY.ens.length<24)CITY.ens.push([cx+(fx?sg*(w/2+1.2):0),ys,cz+(fx?0:sg*(p/2+1.2)),fx?sg:0,fx?0:sg,hs]); // (dev) quelques enseignes à photographier (dbgEnseigne)
    }
    // (CRYPTOCITY) la tour tombe sur un site réservé, ou devient une bougie : bâtie (ses tirages ont eu lieu), puis retirée
    if(CR&&cryptoTour(cx,cz,hd,b,t,canyon)){corps.length=l0;genre.length=lg;tqC.length=lq;neon.length=ln;neonC.length=lnc;tqN.length=lqn;CITY.ens.length=le;}
  };
  /* LE CANYON, BÂTI LE LONG DU RUBAN — et non par cases au sol : la piste de la ville descend en SPIRALE sur 7 à 9 km, plusieurs
     étages de route se superposent à la verticale d'un même point ; une grille horizontale ne voyait que l'étage le plus proche,
     les autres roulaient dans le vide (capture v3-b du 26/09). Chaque tour se pose par rapport au TRONÇON qu'elle borde : trois
     rangs de chaque côté (le mur, la deuxième ligne, le fond de rue). Les autres étages de route, `tourLibre` s'en charge.
     LE BUDGET (iPhone) : une piste de 30 km ferait 20 000 volumes — au-delà du plafond, on éclaircit au hasard, sans trou régulier. */
  const pasC=Math.max(1,Math.round(SN/(L/(NP-1)))),ROWS=[[28,40,.9],[100,60,.7],[190,130,.5]],BUD=IS_MOBILE?1300:2300;
  const kC=Math.min(1,BUD/Math.max(1,(NP/pasC)*2*2.1));
  for(let i=0;i<NP;i+=pasC){const T9=T[i],hl=Math.hypot(T9.x,T9.z);if(hl<.5)continue; // haut des loopings : pas de mur
    const px=-T9.z/hl,pz=T9.x/hl,tx=T9.x/hl,tz=T9.z/hl;
    let yLo=pts[i].y;for(let j=Math.max(0,i-pasC*5);j<=Math.min(NP-1,i+pasC*5);j+=pasC)if(pts[j].y<yLo)yLo=pts[j].y; // le pied se noie sous le point le plus bas du tronçon
    for(const sg of [-1,1])for(const rw of ROWS){if(vr()>rw[2]*kC)continue;
      const w=snap(VS?30+vr()*42:16+vr()*26),p=snap(VS?30+vr()*42:16+vr()*26),hd=Math.hypot(w,p)*.5,lat=ROAD_HALF+rw[0]*(VS?1.7:1)+hd+vr()*rw[1]*(VS?1.6:1),al=(vr()-.5)*SN*.6; // (AU SOL) des géantes : plus larges, plus loin (le ciel et leurs pieds se voient entre elles)
      const nt0=nT,eI=eEnt(i);batir(pts[i].x+px*sg*lat+tx*al,pts[i].z+pz*sg*lat+tz*al,lat,pts[i].y,yLo,true,w,p,rw===ROWS[0]?eI:0); // (2026-10-04) seul le MUR (1er rang) passe sous la route à l'entrée — voir ENTRÉE v2
      // LE PANNEAU : un mur sur quatre du 1er rang porte une réclame, tournée VERS la route, un peu au-dessus d'elle
      if(rw===ROWS[0]&&nT>nt0&&vr()<(IS_MOBILE?.22:.3)){const pw=24+vr()*16,ph=pw*(.75+vr()*.25),d9=lat-hd*.72-1.5;
        (eI>.3||VI||gvDer||CR&&cryptoReserve(pts[i].x+px*sg*d9+tx*al,pts[i].z+pz*sg*d9+tz*al,pw*.6)?[]:pubs).push(pts[i].x+px*sg*d9+tx*al,pts[i].y+16+vr()*40,pts[i].z+pz*sg*d9+tz*al,Math.atan2(-px*sg,-pz*sg),pw,ph);}} // (entrée surélevée : pas de réclame en l'air au-dessus des toits — les tirages restent)
  }
  // AU LARGE : la forêt du village, par cases au sol (le fond de scène), calée sur le point de piste le plus proche
  const cF=cellules(SF,R_VIL,d=>d>R_CAN),kF=Math.min(1,BUD*.55/Math.max(1,cF.length));
  for(const v of cF){if(vr()>kF*.8)continue;const cx=v[2]+(vr()-.5)*SF*.4,cz=v[3]+(vr()-.5)*SF*.4;
    let d2=1e12,yN=pts[v[1]].y,yLo=yN,iN=v[1];
    proches(cx,cz,360,function(i){const p=pts[i],dx=p.x-cx,dz=p.z-cz,e=dx*dx+dz*dz;if(e<d2){d2=e;yN=p.y;iN=i;}if(e<129600&&p.y<yLo)yLo=p.y;});
    const dF=d2<1e12?Math.sqrt(d2):v[0];batir(cx,cz,dF,yN,yLo,false,snap(VS?32+vr()*48:20+vr()*30),snap(VS?32+vr()*48:20+vr()*30),0);} // (2026-10-04, ENTRÉE v2) la forêt garde sa hauteur à l'entrée (elle baissait près de la droite)
  CITY.nC=Math.round(NP/pasC);CITY.nF=cF.length;
  if(VS)vitreSolPose(root,GS); // (AU SOL) le sol de la ville et les piliers de la voie express
  /* (2026-10-17, VILLE VITRÉE v2) LA VILLE D'EN HAUT — Léo : « le plafond de glace, l'effet miroir : une ville qui vient du ciel ». Chaque tour a son
     REFLET accroché au plafond : ses volumes (et ses feux) retournés par rapport au plan à VIT_HC au-dessus de la route qu'elle borde — l'instance
     est RETOURNÉE (échelle −x, −y : un demi-tour, les faces restent à l'endroit) ; sa forme et sa façade sont les mêmes (même centre, même graine).
     La règle d'or tient aussi là-haut (tourLibre) : un reflet qui couperait un étage de route est écourté par sa pointe, ou omis. Les tours d'en
     haut sont DURES, comme celles d'en bas (CITY.col). */
  const nBas=genre.length,formV=new Array(nBas).fill(0),mirOf=[];
  VIT.tours=VI?VTW.map(function(r){const o=r[0]*6;return [corps[o],corps[o+2],r[4],r[5],corps[o+1]+corps[o+4]/2,r[6]];}):null; // (banc) les tours : x, z, route, forme
  const piedV=new Array(nBas).fill(0); // (CLEAN CITY) le volume du PIED de chaque tour, et ses lames : leur pied se noie (VIT_PIED)
  if(VI||VV9)for(const r of VTW)for(let i=r[0];i<r[1];i++){if(genre[i]===0)formV[i]=r[5];if(i===r[0]||genre[i]===1)piedV[i]=1;}
  const verreV=new Uint8Array(nBas);if(VV9)for(const r of VTW)verreV.fill(1,r[0],r[1]); // (NÉON ET VERRE) les volumes des géantes de verre
  if(VI&&VIT_PLAFOND){
    for(const r of VTW){const yC=r[4]+VIT_HC;
      for(let i=r[0];i<r[1];i++){const o=i*6,x=corps[o],z=corps[o+2],w9=corps[o+3],h9=corps[o+4],p9=corps[o+5],yt=2*yC-(corps[o+1]-h9/2);let yb=yt-h9;
        const bt9=tourLibre(x,z,Math.hypot(w9,p9)*.5+5,yb,yt);if(!bt9||bt9[1]<yt-1)continue;yb=bt9[0];
        corps.push(x,(yb+yt)/2,z,w9,yt-yb,p9);genre.push(genre[i]);tqC.push(tqC[i*3],2*yC-tqC[i*3+1],tqC[i*3+2]);formV.push(formV[i]);mirOf.push(i);}
      for(let q=r[2];q<r[3];q++){const o=q*6;neon.push(neon[o],2*yC-neon[o+1],neon[o+2],neon[o+3],neon[o+4],neon[o+5]);neonC.push(neonC[q]);tqN.push(tqN[q*3],2*yC-tqN[q*3+1],tqN[q*3+2]);}}}
  // (2026-09-26, user : « enlève les carrés qui bougent en l'air ») : la CIRCULATION VOLANTE est retirée
  // LES TOURS SONT DURES (2026-09-26, user : « si le joueur entre en collision avec un immeuble, il meurt ») : chaque volume est rangé
  // dans une grille de 60 m ; la boucle de vol demande `villeHeurt(position)` — quelques boîtes testées par image, rien de plus.
  {const CG=60,g9=new Map(),cc=CR?corps.concat(cryptoColBougies()):corps; // (CRYPTO CITY) les bougies sont dures aussi
   for(let k=0;k<cc.length/6;k++){if(k<genre.length&&genre[k]>=2)continue;const o=k*6,x0=cc[o]-cc[o+3]/2,x1=cc[o]+cc[o+3]/2,z0=cc[o+2]-cc[o+5]/2,z1=cc[o+2]+cc[o+5]/2;
     for(let gx=Math.floor(x0/CG);gx<=Math.floor(x1/CG);gx++)for(let gz=Math.floor(z0/CG);gz<=Math.floor(z1/CG);gz++){const kk=gx+','+gz;let a=g9.get(kk);if(!a)g9.set(kk,a=[]);a.push(o);}}
   CITY.col={g:g9,CG:CG,c:Float32Array.from(cc)};}
  // ---- LA POSE (2026-09-28, passe perf iPhone) : par QUARTIERS, en deux vitesses — voir villeTri ----
  const CUBE=new THREE.BoxGeometry(1,1,1),M=new THREE.Matrix4();
  const col=new THREE.Color(),colT=new Float32Array(genre.length*3),colN=new Float32Array(neonC.length*3);
  for(let i=0;i<genre.length;i++){const t9=.8+vr()*.45,g=genre[i]; // (le tirage `vr` dans le MÊME ordre qu'avant : chaque tour garde sa teinte)
    if(VI&&i>=nBas){const j=mirOf[i-nBas];colT[i*3]=colT[j*3];colT[i*3+1]=colT[j*3+1];colT[i*3+2]=colT[j*3+2];continue;} // (VILLE VITRÉE) le reflet a la teinte (et la forme) de sa tour
    if(VI||verreV[i]){const o9=i*6,sd9=((corps[o9]*.0131+corps[o9+2]*.0173)%1+1)%1,q9=(sd9*29.37)%1,st9=VI?(q9<.26?0:q9<.50?1:q9<.66?2:q9<.76?3:4):(q9<.34?0:q9<.44?1:q9<.56?2:q9<.78?3:4),k9=.9+(t9-.8)*.35; /* (NÉON ET VERRE) les seuils de VV_STY */ // (mêmes seuils que le sommet) // (VILLE VITRÉE) la STRUCTURE (la façade, c'est le shader : mêmes seuils)
      if(g===0){const P9=[[.66,.70,.76],[.94,.95,.96],[.93,.94,.95],[.20,.22,.25],[.80,.83,.87]][st9]; /* (CLEAN CITY) le BLANC des tours blanches et des lames */col.setRGB(P9[0]*k9,P9[1]*k9,P9[2]*k9);} // montants d'alu · béton clair · lames blanches · montants noirs · alu argent
      else if(g===1)col.setRGB(.93*k9,.94*k9,.95*k9);else col.setRGB(.88,.90,.93);col.toArray(colT,i*3);colT[i*3]+=8*formV[i];colT[i*3+1]+=8*piedV[i];continue;} // + la FORME (r + 8 × forme, lue au sommet) // les tuyaux deviennent des LAMES de béton clair ; les mâts, acier clair
    if(CR){const o9=i*6,sd9=((corps[o9]*.0131+corps[o9+2]*.0173)%1+1)%1,q9=(sd9*29.37)%1,st9=q9<.26?0:q9<.44?1:q9<.64?2:q9<.80?3:4,k9=Math.min(1.12,t9); // CRYPTO CITY : la STRUCTURE de la tour (la façade, c'est le shader)
      if(g===0){const P9=[[.30,.40,.46],[.74,.62,.36],[.70,.74,.80],[.38,.40,.44],[.94,.94,.92]][st9];col.setRGB(P9[0]*k9,P9[1]*k9,P9[2]*k9);} // VERRE · OR · ARGENT · MÉTAL · BLANC (2026-10-15, Sacha)
      else if(g===1)col.setRGB(.76*k9,.78*k9,.82*k9);else col.setRGB(.16,.16,.18);}               // tuyaux de chrome, mâts sombres
    else if(g===0)col.setRGB(.20*t9,.21*t9,.26*t9);                   // le BÉTON du village : gris-bleu, mouillé
    else if(g===1)col.setRGB(.32*t9,.33*t9,.37*t9);              // le MÉTAL des tuyaux : il accroche le néon
    else col.setRGB(.10,.10,.12);                                // le mât : une ligne sombre
    col.toArray(colT,i*3);}
  for(let i=0;i<neonC.length;i++)NEON[neonC[i]].toArray(colN,i*3);
  const fam=(arr,kT,cols,mat,matL,geo,flip,colL)=>{ // (2026-10-18, NÉON ET VERRE) colL : l'instance AU LOIN a aussi sa couleur (le drapeau du pied des géantes de verre)
    // (2026-10-17) flip : les instances RETOURNÉES (la ville d'en haut de la VILLE VITRÉE) // (2026-10-17) geo : la géométrie des tours PRÈS (la VILLE VITRÉE : ses coins biseautés) ; au loin, toujours le cube // une FAMILLE : tableau maître rangé par quartiers + l'instance complète (PRÈS) et l'instance nue (AU LOIN)
    // ⚠ le quartier se choisit par la TOUR (kT), pas par le volume : les pièces d'une même tour (retraits emboîtés, tuyaux, mât, néons) restent
    // ensemble et dans leur ordre d'origine — là où deux d'entre elles se croisent, la profondeur tombe à égalité sur une ligne de pixels et
    // c'est l'ORDRE qui tranche (mesuré : 5 pixels changeaient de camp quand un retrait partait dans un autre quartier)
    const nb=arr.length/6,cle=new Map();
    for(let i=0;i<nb;i++){const o=i*3,k=Math.floor(kT[o]/VT.QC)+','+Math.floor(kT[o+1]/VT.QC)+','+Math.floor(kT[o+2]/VT.QC);let L=cle.get(k);if(!L)cle.set(k,L=[]);L.push(i);}
    const F={n:nb,M:new Float32Array(nb*16),C:new Float32Array(nb*3),rang:new Int32Array(nb),Q:new Float64Array(cle.size*6),e:new Uint8Array(cle.size),
      z:new Float64Array(cle.size),pP:new Int32Array(cle.size),pL:new Int32Array(cle.size),fP:0,fL:0,d:new Int32Array([2e9,-1,2e9,-1]),vide:[false,false],refait:false};
    let p=0,j=0;
    for(const L of cle.values()){const a=p;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
      for(const i of L){const o=i*6;if(flip&&flip[i])M.makeScale(-arr[o+3],-arr[o+4],arr[o+5]);else M.makeScale(arr[o+3],arr[o+4],arr[o+5]);M.setPosition(arr[o],arr[o+1],arr[o+2]);M.toArray(F.M,p*16); // la matrice d'AVANT, au bit près
        F.C[p*3]=cols[i*3];F.C[p*3+1]=cols[i*3+1];F.C[p*3+2]=cols[i*3+2];F.rang[i]=p++;
        x0=Math.min(x0,arr[o]-arr[o+3]/2);x1=Math.max(x1,arr[o]+arr[o+3]/2);y0=Math.min(y0,arr[o+1]-arr[o+4]/2);y1=Math.max(y1,arr[o+1]+arr[o+4]/2);
        z0=Math.min(z0,arr[o+2]-arr[o+5]/2);z1=Math.max(z1,arr[o+2]+arr[o+5]/2);}
      F.Q[j]=a;F.Q[j+1]=p;F.Q[j+2]=(x0+x1)/2;F.Q[j+3]=(y0+y1)/2;F.Q[j+4]=(z0+z1)/2;F.Q[j+5]=Math.hypot(x1-x0,y1-y0,z1-z0)/2+1;j+=6;}
    F.im=new THREE.InstancedMesh(geo||CUBE,mat,nb);F.imL=new THREE.InstancedMesh(CUBE,matL,nb);
    F.im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(nb*3),3);if(colL)F.imL.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(nb*3),3);
    for(const a of [F.im.instanceMatrix,F.im.instanceColor,F.imL.instanceMatrix,F.imL.instanceColor])if(a)a.setUsage(THREE.DynamicDrawUsage);
    for(const x of [F.im,F.imL]){x.frustumCulled=false;root.add(x);trackMeshes.push(x);} // (le tri, c'est villeTri) — ⚠ la GÉOMÉTRIE part au rebuild (trackMeshes), les MATÉRIAUX sont partagés et gardés
    F.e.fill(1);villeRefait(F);villePousse(F); // tout PRÈS tant qu'aucun rendu n'a trié (= la ville d'avant)
    return F;};
  CITY.fam=[];
  if(VI){const A={a:[],k:[],c:[],f:[]},B={a:[],k:[],c:[],f:[]}; // (VILLE VITRÉE) deux familles : les tours à étages (VRILLÉE, FUSEAU) et toutes les autres
    for(let i=0;i<genre.length;i++){const R=(genre[i]===0&&(formV[i]===2||formV[i]===3))?B:A;for(let q=0;q<6;q++)R.a.push(corps[i*6+q]);for(let q=0;q<3;q++){R.k.push(tqC[i*3+q]);R.c.push(colT[i*3+q]);}R.f.push(i>=nBas?1:0);}
    for(const RG of [[A,vitreGeo()],[B,vitreGeoR()]])if(RG[0].a.length){const F=fam(RG[0].a,RG[0].k,RG[0].c,vitreMatTours(),vitreMatToursLoin(),RG[1],RG[0].f);if(!CITY.imC)CITY.imC=F.im;CITY.fam.push(F);}}
  else if(VV9&&VV.nv){const Cb={a:[],k:[],c:[]},A={a:[],k:[],c:[]},B={a:[],k:[],c:[]}; // (NÉON ET VERRE) le béton de la ville, puis ses géantes de verre (droites · à étages) — chaque tour garde ses pièces ensemble et dans leur ordre
    for(let i=0;i<genre.length;i++){const R=!verreV[i]?Cb:(genre[i]===0&&(formV[i]===2||formV[i]===3))?B:A;for(let q=0;q<6;q++)R.a.push(corps[i*6+q]);for(let q=0;q<3;q++){R.k.push(tqC[i*3+q]);R.c.push(colT[i*3+q]);}}
    if(Cb.a.length){const F=fam(Cb.a,Cb.k,Cb.c,villeMatTours(),villeMatToursLoin());CITY.imC=F.im;CITY.fam.push(F);}
    for(const RG of [[A,vitreGeo()],[B,vitreGeoR()]])if(RG[0].a.length){const F=fam(RG[0].a,RG[0].k,RG[0].c,vitreMatToursNeon(),vitreMatToursNeonLoin(),RG[1],null,true);if(!CITY.imC)CITY.imC=F.im;CITY.fam.push(F);}}
  else if(corps.length){const F=fam(corps,tqC,colT,CR?cryptoMatTours():villeMatTours(),CR?cryptoMatToursLoin():villeMatToursLoin());CITY.imC=F.im;CITY.fam.push(F);}
  if(neon.length){const F=fam(neon,tqN,colN,villeMatNeon(),villeMatNeonLoin());CITY.imN=F.im;CITY.fam.push(F);}
  if(pubs.length){if(!CR)villePubAtlas(); /* (2026-10-16) repeint si la teinte de la ville a changé */ const Qp=new THREE.Quaternion(),Pp=new THREE.Vector3(),Sp=new THREE.Vector3(),Ay=new THREE.Vector3(0,1,0),PL=new THREE.PlaneGeometry(1,1),n9=pubs.length/6;
    const imP=new THREE.InstancedMesh(PL,CR?cryptoMatPub():villeMatPub(),n9);
    for(let i=0;i<n9;i++){const o=i*6;Qp.setFromAxisAngle(Ay,pubs[o+3]);Pp.set(pubs[o],pubs[o+1],pubs[o+2]);Sp.set(pubs[o+4],pubs[o+5],1);M.compose(Pp,Qp,Sp);imP.setMatrixAt(i,M);}
    imP.instanceMatrix.needsUpdate=true;imP.frustumCulled=false;imP.renderOrder=3;root.add(imP);trackMeshes.push(imP);}
  if(CR)cryptoBatit(root); // (CRYPTOCITY) les taureaux, le graphique, les pièces, les diamants, les dirigeables
  if(!VI&&!CR)try{villeRais(root,seed,corps,genre,NEON);}catch(e9){console.warn('rais',e9);} /* (2026-10-20, VILLE EMBELLIE) les rais de projecteur — hasard LOCAL (voir ville-embellie.js), aucun tirage `vr` ni `rnd` */
  CITY.n={pubs:pubs.length/6,tours:nT,volumes:corps.length/6,neons:neon.length/6,routeY:[Math.round(yMin),Math.round(yMax)],ms:Math.round(performance.now()-t00),L:Math.round(L),cellsC:CITY.nC,cellsF:CITY.nF};
}
for(const f of [villeMatTours,villeMatNeon,villeMatToursLoin,villeMatNeonLoin])f().dispose=function(){}; // partagés sur toute la partie : le rebuild ne les jette pas
