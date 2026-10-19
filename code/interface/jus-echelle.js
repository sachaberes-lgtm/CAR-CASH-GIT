/* ---- LE JUS SUR L'OBJECTIF (2026-08-18) : des TACHES peintes en 2D par-dessus l'image (plus de particules 3D). Ce qui fait « projection »,
   c'est l'IRRÉGULARITÉ (le rayon bruité), les SATELLITES et la COULURE — les trois ensemble, sinon ça reste un rond. */
/* LE JUS v2 — DES GOUTTES PIXEL (2026-09-26, vague 2, « L'ENCRE ET L'OR »). Verdict du directeur artistique : les taches (un polygone
   plein, d'UNE couleur, bord dur, à 85 % sur l'écran — moutarde, gris, mauve selon le fruit) se lisaient comme un BUG D'INTERFACE, pas
   comme du jus sur l'objectif. Désormais chaque tache est une GOUTTE dessinée dans la langue du HUD :
   · la forme (le rayon bruité, les satellites, la coulure) est posée sur une GRILLE DE 4 px ;
   · TROIS TONS sur le corps du fruit (SATURÉ — éclairci vers le blanc, il virait au papier beige) : un CŒUR clair, un liseré d'ENCRE
     #1c0430 de 2 px (la même encre que les contours d'arcade), un REFLET blanc en haut à gauche (c'est lui qui dit « liquide sur une
     vitre ») ; le corps est plus transparent que son liseré — une goutte, pas un autocollant ;
   · opacité ≤ .55 : on voit la route à travers, toujours.
   Chaque goutte est cuite UNE fois à sa naissance dans une petite toile RÉUTILISÉE (la file plafonne à 14 taches) — la coulure s'y
   allonge au fil des images, à pleine opacité (pas de double couche à la jointure) — puis la toile est recopiée ×2 au pixel près, sans
   lissage. Plus aucun tracé de chemin par image. */
/* LE JUS v3 — PLUS GROS, PLUS OPAQUE (2026-09-28, Sacha : « les taches de jus de fruit doivent être plus opaques et grosses »).
   · la TAILLE se prend sur la plus PETITE dimension de l'écran (la même goutte en vertical et en paysage — sur la largeur, le paysage
     les gonflait au plafond) et monte d'environ ×1,5 : rayon ~37-73 px sur un téléphone (24-49 avant), plafond 90 (60) ;
   · l'OPACITÉ : pleine (.9) pendant la première moitié de sa vie, puis elle s'efface — au lieu de ≤ .55 en fondu dès l'impact ;
     corps .94 / cœur .9 dans la goutte (80 / 77 % avant), coulure .95 ; le liseré d'encre et le reflet restent pleins ;
   · le COULOIR de conduite reste dégagé : l'ellipse interdite s'élargit de la taille de la goutte (une grosse goutte posée au bord
     de l'ellipse y débordait) ; `JUS_N` (le brouillon) passe de 128 à 192 cellules pour les plus grosses. */
/* LE JUS v3b (même soir, Sacha : « elles sont trop sur les côtés ; un peu plus grosses, et pouvoir apparaître PARTOUT sur l'écran ») :
   plus d'ellipse interdite ni de bande du haut — la goutte tombe n'importe où (le HUD reste dessiné par-dessus) ; rayon ×1,25 encore
   (~46-91 px sur téléphone, plafond 110), `JUS_N` 240. Le couloir dégagé de la vague 2 est donc ABANDONNÉ, à sa demande. */
/* LE JUS v4 — DISCRET ET HORS DE LA ROUTE (2026-09-29, Sacha : « les trois », après la passe « jeu pro » : DEUX critiques indépendantes
   classaient les taches n°1 des défauts — « on dirait un bug d'affichage », une goutte rose couvrait la moitié de la caisse en pleine nitro,
   huit « sucettes » orange envahissaient l'écran en ORBITE). La goutte pixel garde son dessin (encre, cœur, reflet) mais :
   · rayon ÷3 environ (~11-34 px sur un téléphone, plafond 40 — c'était 46-91, plafond 110) ;
   · elle ne tombe plus sur la zone de CONDUITE (une ellipse autour de la caisse et de la route devant elle) : la couronne et les coins ;
   · 6 à la fois au plus (14), vie 0,7-1,1 s (1,1-1,8), pleine .8 le premier tiers puis s'efface (.9 la moitié), coulure courte (plus de « tige »). */
/* LE JUS v5 — UN PEU PLUS VISIBLE, ET GÊNANT (2026-09-30, Sacha à la session INTERFACE : « rends un peu plus visibles et gênantes à l'écran
   les taches de jus de fruit »). Entre la v4 (discrète, hors de la route) et la v3b (jugée trop) :
   · rayon ×1,7 environ (~19-57 px sur un téléphone, plafond 68 — v4 : 11-34 / 40, v3b : 46-91 / 110), coulure un peu plus longue ;
   · GÊNANTES : plus de la moitié tombent n'importe où, route et caisse comprises (55 %) ; les autres gardent la couronne ;
   · 8 à la fois au plus (v4 : 6, v3b : 14 — avec la LIGNE PARFAITE, un fruit toutes les ~2,4 s : le plafond reste), vie 0,9-1,4 s,
     pleines .86 les premiers 40 % puis elles s'effacent. */
/* LE JUS v6 — GROS ET DÉRANGEANT (2026-09-30, Sacha : « les taches de fruit éclaté sur l'écran ne sont pas assez grosses et
   dérangeantes »). Retour vers la v3b (qu'il avait voulue) et plus loin dans la gêne :
   · rayon ~45-90 px sur un téléphone, plafond 112 (v5 : 19-57 / 68 ; v3b : 46-91 / 110) ; coulure plus longue ;
   · OÙ : 35 % tombent EXPRÈS sur la zone de conduite (la caisse et la route devant elle), 45 % n'importe où, 20 % dans la couronne ;
   · 10 à la fois au plus (8), vie 1,3-2 s (0,9-1,4), pleines .93 les premiers 55 % (.86 / 40 %) ;
   · elles GLISSENT : passé 0,3 s, la goutte descend l'écran (12-34 px/s, par pas de 4 px) — du jus qui coule sur la vitre. */
/* LE JUS v7 — LA ROUTE DÉGAGÉE (2026-10-07, Sacha : « améliore la visibilité de la route, notamment en enlevant les taches de fruit écrasé
   du milieu de l'écran »). La v6 en jetait EXPRÈS 35 % sur la caisse et la route (et 45 % n'importe où) : la route était sous le jus.
   Désormais AUCUNE tache ne se pose dans la ZONE DE LA ROUTE (`JUS_ZONE` : une ellipse autour de la caisse et de la route devant elle,
   centrée (½ W, 0,56 H), demi-axes 0,33 W × 0,37 H, élargie du rayon de la goutte) : elles vivent sur les BORDS et dans les coins.
   Elles gardent leur taille (v6) et leur dessin, mais ni leur glissade ni leur coulure n'entrent dans la zone (`gm`, coulure raccourcie).
   `dbgJus` rend aussi la part de la zone repeinte (visée : 0). */
const JUS_ZONE={cx:.5,cy:.56,a:.33,b:.37};
function jusHors(x,y,m,W,H){const ex=(x-W*JUS_ZONE.cx)/(W*JUS_ZONE.a+m),ey=(y-H*JUS_ZONE.cy)/(H*JUS_ZONE.b+m);return ex*ex+ey*ey>1;} // le point (x, y), gonflé de m px, est-il HORS de la route ?
const JUS_N=240,JUS=[],JUS_PX=4,JUS_TOILE=[],JUS_BLANC=new THREE.Color(1,1,1),JUS_ENCRE='#1c0430',JUS_M=new Uint8Array(JUS_N*JUS_N);let JUS_IM=null; // masque et pixels de brouillon RÉUTILISÉS (JUS_N cellules = la plus grande goutte)
function jusToile(){ // une toile libre de la réserve (15 au plus : la file plafonne à 14 taches)
  for(const t of JUS_TOILE)if(!t.pris){t.pris=true;return t;}
  const cv=document.createElement('canvas');cv.width=cv.height=64;const t={cv:cv,x:cv.getContext('2d'),pris:true};JUS_TOILE.push(t);return t;
}
function juiceScreen(col,power,n){
  // ⚠ REDUCED_MOTION : pas de taches qui gonflent et coulent sur l'écran. La gerbe 3D, le croc et
  // l'aura restent — le fruit se lit toujours, sans giclée plein cadre.
  if(!juiceCx||REDUCED_MOTION)return;
  const W=juiceCv.width,H=juiceCv.height,cc=new THREE.Color(col),hsl=cc.getHSL({h:0,s:0,l:0}); // le CORPS : le fruit, SATURÉ
  cc.setHSL(hsl.h,Math.max(hsl.s,.78),Math.min(.6,Math.max(.46,hsl.l)));const k2=cc.clone().lerp(JUS_BLANC,.38); // …et son CŒUR clair
  const cR=cc.r*255|0,cG=cc.g*255|0,cB=cc.b*255|0,kR=k2.r*255|0,kG=k2.g*255|0,kB=k2.b*255|0,corps='rgba('+cR+','+cG+','+cB+',.95)';
  const B9=Math.min(W,H); // (v3) la taille suit la plus petite dimension : même goutte debout ou couché
  for(let k=0;k<(n||1);k++){
    // (v3b) plus grosses : rayon ~46-91 px sur un téléphone (v3 : 37-73, vague 2 : 24-49), plafond 110 — la forme et ses satellites tiennent dans JUS_N
    const R=Math.min(112,(B9*.1+Math.random()*B9*.1)*(.8+power*.45)),coul=R*(.5+Math.random()*.9); // (v6) ~45-90 px, plafond 112 — (v5) ×1,7 — (v4) ÷3
    /* (v3b, Sacha : « pouvoir apparaître partout sur l'écran ») PARTOUT, uniformément : plus d'ellipse centrale interdite ni de bande du
       haut (elles repoussaient tout sur les côtés). Le HUD est dessiné PAR-DESSUS le jus, rien de ce qu'on lit n'est jamais caché. */
    let x=0,y=0,hors=false; // (v7) JAMAIS sur la route : hors de JUS_ZONE (le corps : rayon bruité jusqu'à ~1,2 R ; les satellites qui tomberaient dedans sont retirés plus bas)
    for(let t9=0;t9<24&&!hors;t9++){x=Math.random()*W;y=Math.random()*H;hors=jusHors(x,y,R*1.2,W,H);}
    if(!hors){ // filet (mesuré : ~1 tirage sur 100 debout) : la bande du HAUT si elle existe (debout), sinon les bandes des CÔTÉS (couché) — sinon au ras du haut
      const hb=H*(JUS_ZONE.cy-JUS_ZONE.b)-R*1.2,lb=W*(JUS_ZONE.cx-JUS_ZONE.a)-R*1.2;
      if(hb>0){x=Math.random()*W;y=Math.random()*hb;}else if(lb>0){x=Math.random()<.5?Math.random()*lb:W-Math.random()*lb;y=Math.random()*H;}else{x=Math.random()*W;y=-R*.4;}}
    const vie9=1.3+Math.random()*.7,gl9=12+Math.random()*22;let gm=0; // (v7) la GLISSADE s'arrête avant la route
    for(let d9=JUS_PX;d9<=gl9*vie9;d9+=JUS_PX){if(!jusHors(x,y+d9,R*1.2,W,H))break;gm=d9;}
    // (vague 2) des GOUTTES, plus des flaques (l'ancien montait à 100 px, satellites jusqu'à 2,7 R) — la taille (v3) est tirée plus haut
    if(JUS.length>=10){const v=JUS.shift();v.toile.pris=false;} // (v6) 10 — (v5) 8 // plafond (v4 : 6 — c'était 14 ; à 20 taches, mesuré, 76 % de l'écran était repeint)
    const t=jusToile(),C=JUS_PX/2; // la toile est en CELLULES de 2 px : le liseré fait une cellule, la forme se pose par blocs de deux (4 px)
    const ext=Math.min(JUS_N-4,Math.ceil(R*2.05/JUS_PX)*JUS_PX),Nw=ext,Nh=Nw+Math.ceil(coul*1.6/C)+4; // demi-étendue en px = largeur en cellules ; la coulure dessous
    if(t.cv.width!==Nw||t.cv.height!==Nh){t.cv.width=Nw;t.cv.height=Nh;}else t.x.clearRect(0,0,Nw,Nh);
    const N=9+((Math.random()*5)|0),pts=[];for(let i=0;i<N;i++)pts.push(R*(.62+Math.random()*.55)); // rayon BRUITÉ : c'est ça, une éclaboussure
    const sat=[];for(let i=0,ns=3+((Math.random()*3)|0);i<ns;i++)sat.push({a:Math.random()*6.2832,d:R*(1.25+Math.random()*.7),r:R*(.12+Math.random()*.12)});
    for(let i=sat.length-1;i>=0;i--){const s9=sat[i],sx=x+Math.cos(s9.a)*s9.d,sy=y+Math.sin(s9.a)*s9.d;if(!jusHors(sx,sy,s9.r,W,H)||!jusHors(sx,sy+gm,s9.r,W,H))sat.splice(i,1);} // (v7) pas une gouttelette sur la route, même après la glissade
    const dedans=function(px,py){ // px, py : décalage au centre, en pixels écran
      const a=(Math.atan2(py,px)+6.2832)%6.2832,f=a/6.2832*N,i0=f|0,w=f-i0;
      if(Math.hypot(px,py)<pts[i0%N]*(1-w)+pts[(i0+1)%N]*w)return true;
      for(const s of sat){const dx=px-Math.cos(s.a)*s.d,dy=py-Math.sin(s.a)*s.d;if(dx*dx+dy*dy<s.r*s.r)return true;}
      return false;};
    const M=JUS_M;M.fill(0,0,Nw*Nw);
    for(let cy=0;cy<Nw;cy+=2)for(let cx=0;cx<Nw;cx+=2) // la forme, par blocs de 4 px
      if(dedans((cx+1)*C-ext,(cy+1)*C-ext)){M[cy*Nw+cx]=M[cy*Nw+cx+1]=1;if(cy+1<Nw){M[(cy+1)*Nw+cx]=M[(cy+1)*Nw+cx+1]=1;}}
    if(!JUS_IM)JUS_IM=t.x.createImageData(JUS_N,JUS_N);const d=JUS_IM.data;d.fill(0,0,JUS_N*Nw*4); // (brouillon au pas de JUS_N)
    const hx=Math.round((ext-R*.4)/C)&~1,hy=Math.round((ext-R*.42)/C)&~1,ck=R*.5/C; // le REFLET : en haut à gauche du corps · le CŒUR : la moitié du rayon
    let bas=Nw>>1;
    for(let cy=0;cy<Nw;cy++)for(let cx=0;cx<Nw;cx++){const k9=cy*Nw+cx;if(!M[k9])continue;const o=(cy*JUS_N+cx)*4;
      if(cx===(Nw>>1))bas=Math.max(bas,cy);
      const bord=cx===0||cy===0||cx===Nw-1||cy===Nw-1||!M[k9-1]||!M[k9+1]||!M[k9-Nw]||!M[k9+Nw];
      const refl=!bord&&((cx>=hx&&cx<hx+2&&cy>=hy&&cy<hy+2)||(cx===hx+3&&cy===hy-1));
      const coeur=!bord&&Math.hypot(((cx>>1)<<1)+1-Nw/2+ck*.25,((cy>>1)<<1)+1-Nw/2+ck*.25)<ck; // (par blocs de 4 px, décalé vers la lumière)
      if(bord){d[o]=28;d[o+1]=4;d[o+2]=48;d[o+3]=255;}else if(refl){d[o]=d[o+1]=d[o+2]=255;d[o+3]=255;}
      else if(coeur){d[o]=kR;d[o+1]=kG;d[o+2]=kB;d[o+3]=230;}else{d[o]=cR;d[o+1]=cG;d[o+2]=cB;d[o+3]=240;}} // (v3) corps .94, cœur .9
    t.x.putImageData(JUS_IM,0,0,0,0,Nw,Nw);
    const coulOk=function(c){for(let d9=R*1.1;d9<=R*1.2+c*1.6;d9+=JUS_PX*2)if(!jusHors(x,y+gm+d9,R*.25,W,H))return false;return true;}; // TOUTE la coulure (elle pourrait traverser la zone, les deux bouts dehors)
    let coul9=coul;while(coul9>JUS_PX&&!coulOk(coul9))coul9*=.75;if(!coulOk(coul9))coul9=0; /* (v7, mesuré : la coulure part du BAS du corps, jusqu à ~1,2 R) */ // …et la COULURE aussi (elle pend de ~0,9 R sous le centre)
    JUS.push({x:Math.round(x/JUS_PX)*JUS_PX,y:Math.round(y/JUS_PX)*JUS_PX,r:R,ext:ext,toile:t,c:corps,bas:bas,Lc:0,
      t:0,vie:vie9,coul:coul9,gl:gl9,gy:0,gm:gm}); // (v6) 1,3-2 s, et elle GLISSE (gl px/s) — (v5) 0,9-1,4 s — (v4) 0,7-1,1 s — (v7) gm : jusqu'au bord de la route
  }
}
function juiceScreenTick(dt){
  if(!juiceCx)return;
  const W=juiceCv.width,H=juiceCv.height;
  if(!JUS.length){if(juiceScreenTick._sale){juiceCx.clearRect(0,0,W,H);juiceScreenTick._sale=false;juiceCv.style.visibility='hidden';}return;}
  juiceCx.clearRect(0,0,W,H);if(!juiceScreenTick._sale){juiceScreenTick._sale=true;juiceCv.style.visibility='visible';}
  juiceCx.imageSmoothingEnabled=false; // AU PIXEL PRÈS : la toile est recopiée ×2, sans lissage
  for(let i=JUS.length-1;i>=0;i--){
    const j=JUS[i];j.t+=dt;
    if(j.t>=j.vie){j.toile.pris=false;JUS.splice(i,1);continue;}
    const u=j.t/j.vie,tc=j.toile;
    // LA COULURE : elle descend avec le temps (gravité) — dessinée DANS la toile, par pas de 4 px, liseré d'encre sur les côtés
    const Lc=Math.min(tc.cv.height-j.bas-3,Math.floor(j.coul*u*1.6/JUS_PX)*2);
    if(Lc>j.Lc){const cw=Math.max(2,Math.round(j.r*.3/JUS_PX)*2),x0=(j.ext>>1)-(cw>>1);
      tc.x.fillStyle=JUS_ENCRE;tc.x.fillRect(x0-1,j.bas+1,cw+2,Lc+1);tc.x.clearRect(x0,j.bas,cw,Lc); // (dégagée d'abord : le corps garde SA transparence)
      tc.x.fillStyle=j.c;tc.x.fillRect(x0,j.bas,cw,Lc);j.Lc=Lc;}
    /* la goutte GRANDIT d'un coup puis s'efface. ⚠ LE GONFLEMENT EST EN SECONDES ABSOLUES, pas en fraction de vie : une projection
       arrive TOUJOURS en 90 ms. (vague 2) Il se fait par PALIERS (½, ¾, plein) : jamais de pixels de travers. */
    const g=j.t<.03?.5:j.t<.06?.75:1,e=j.ext*g;
    if(j.t>.3)j.gy=Math.min(j.gm,j.gy+j.gl*dt); // (v6) le jus GLISSE sur la vitre — par pas de 4 px (jamais de pixel de travers) — (v7) jamais jusqu'à la route
    juiceCx.globalAlpha=(u<.55?1:Math.pow((1-u)/.45,1.5))*.93; /* (v6) pleine .93 les premiers 55 % */ /* (v5) pleine .86 les premiers 40 % */ // (v4) pleine .8 le premier tiers, puis elle s'efface // (v3, Sacha : « plus opaques ») pleine .9 la 1re moitié de sa vie, puis elle s'efface — c'était ≤ .55 en fondu dès l'impact
    juiceCx.drawImage(tc.cv,j.x-e,j.y+Math.floor(j.gy/JUS_PX)*JUS_PX-e,e*2,e*2*tc.cv.height/tc.cv.width);
  }
  juiceCx.globalAlpha=1;
}
// (2026-10-14, session SON) L'ÉCHELLE DES FRUITS : le i-ème fruit de la rafale, en demi-tons — 0, 2, 4, 7 puis aller-retour 4-7 (+7 au plus :
// le splotch reste un fruit, pas une voix de souris ; la rafale, bases [0], reste sous l'octave même tonalité comprise)
const SON_FRUIT_ST=[0,2,4,7];
function sonFruitSt(i){i=Math.max(0,i|0);return i<4?SON_FRUIT_ST[i]:SON_FRUIT_ST[2+(i&1)];}
function fruitCroque(pos,col,power,nom){ // nom : le fruit — chacun a SA bouche (console de son)
  fruitRafT=FRUIT_FENETRE;fruitRaf++;
  const r=Math.min(6,fruitRaf);
  /* L'ÉCLABOUSSURE. ⚠ elle partait du CENTRE de la caisse, donc à moitié cachée par la carrosserie —
     d'où « je n'ai pas tellement vu ». Elle part maintenant du NEZ et vers le HAUT, là où la caméra
     de poursuite regarde, et le nombre de gerbes suit la rafale : une, puis deux, puis trois. */
  const p2=crV1.copy(pos);p2.y+=1.1;
  juiceSplash(p2,col,Math.min(1.2,power*.9+r*.18));      // la gerbe 3D reste, mais en appoint
  juiceScreen(col,power,1+Math.min(4,r));                 // …et LE JUS REPEINT L'OBJECTIF : ça, on le voit
  if(SONV2){sfx(FRUIT_SON[nom]||'fruit.peche',{rate:Math.pow(2,sonFruitSt(fruitRaf-1)/12),vol:nom==='PASTÈQUE'?0:-4});if(r>=3)sfx('fruit.rafale',{st:sonFruitSt(fruitRaf-3),vol:-3});}else crunchSfx(r); /* (2026-10-15, Sacha : « équilibre mieux, que les figures fassent plus de bruit que ce qu'on ramasse ») un fruit sortait à −28, au-dessus d'une figure : −4 (−32), la rafale −3 ; la PASTÈQUE (le graal) garde son niveau */ // (2026-10-14, session SON) la série MONTE en demi-tons de pentatonique (0-2-4-7, puis 4-7…) : avant, +2,5 % par fruit (0,4 demi-ton) noyé sous le hasard de la fiche (rj ±6 %, ±1 demi-ton) ; la rafale (key:1) monte avec /* (débogage son 2026-09-29) le plein de nitro sonne à la pompe, seulement s'il y a eu plein */
  shake=Math.max(shake,Math.min(.55,.18+r*.07));
  if(fruitRaf>=3){                                    // 3 fruits d'affilée : ce n'est plus un hasard
    chaineAura('RAFALE ×'+fruitRaf,15+r*6,'rafale',true,SONV2,true); /* (2026-10-01) 40+30r → 15+6r : depuis LA LIGNE PARFAITE un fruit arrive toutes les 2,4 s, la rafale ne retombe plus — 220 points par fruit, le plus gros robinet d'aura de la route (voir LA CHAÎNE SE FERME) */
    trickMsg('🧃 RAFALE ×'+fruitRaf,r>=5?3:2);
  }
}
function fruitRafTick(dt){
  if(fruitRafT<=0)return;
  fruitRafT-=dt;
  if(fruitRafT<=0)fruitRaf=0;
}
function auraComboTick(dt){ // la fenêtre se referme : on solde et on annonce si ça valait le coup
  if(figComboT<=0)return;
  figComboT-=dt;
  if(figComboT>0)return;
  if(figCombo>=5)trickMsg(LANG==='fr'?'✦ ENCHAÎNEMENT DE '+figCombo+' — '+figComboAura+' D\'AURA':'✦ '+figCombo+'-TRICK COMBO — '+figComboAura+' AURA',3);
  figCombo=0;figComboAura=0;
}
function styleFromBoost(dt){
  // ⚠ CALIBRAGE : la nitro est une RESSOURCE (~2 s de réserve) — viser « 100 % en une seule tenue »
  // rendait la jauge INATTEIGNABLE. À 40 %/s, une tenue pleine donne ~80 % : deux boosts enchaînés
  // suffisent, et la fuite (13 %/s) fait qu'il faut les ENCHAÎNER. C'est ça, « sans lâcher ».
  if(fever>0)return;
  styleM=Math.min(100,styleM+40*dt);
  // ⚠ LE DÉCOLLAGE EST RETIRÉ (2026-09-25, user : « le truc de décollage en double-tap, supprime complètement ») : la jauge ne s'ARME plus.
}
// ---------- LE DÉCOLLAGE : double-tap NITRO — la caisse s'ARRACHE vers le ciel, le temps se fige ----------
// (remplace l'ancien « braquage », qui ne faisait que doubler les gains : un bonus comptable, aucun geste.
//  Le ×2 est conservé, mais COLLÉ à l'action — un seul appui, un événement qu'on VOIT.)
// Le ralenti est mesuré : sur 60 frames la caisse fait 25,8 u contre 52,2 u — le monde défile 2× moins vite.
function heistFire(){
  feverArmed=false;fever=10;styleM=0;hap([16,40,16]); // deux coups secs : le braquage se SENT dans la main
  addAura(150,1);                     // LE DÉCOLLAGE : le geste le plus engageant du jeu, donc le mieux payé en aura
  slowT=Math.max(slowT,2);            // 2 s de bullet-time
  if(mode==='drive'&&!introD){
    startFall(42,1);                  // ARRACHEMENT le long de la NORMALE (startFall borne la verticale à 70)
    /* ⚠ LA CAISSE TRAVERSAIT LA ROUTE AU DÉCOLLAGE — corrigé 2026-08-18, et ce n'était pas un
       problème de collision mais de REPÈRE. La ligne d'avant faisait `fallVel.y=max(fallVel.y,36)` :
       elle garantissait la poussée en **Y MONDE**. Or `startFall` décolle le long de la NORMALE de
       la surface, et cette normale est RETOURNÉE quand on roule sur la face du dessous (`side<0`) —
       elle pointe alors vers le bas. Forcer +36 en Y monde renvoyait donc la caisse DROIT DANS LA
       DALLE, qu'elle traversait. Même chose dans un looping, où la normale devient horizontale
       puis s'inverse : on poussait dans le décor.
       L'intention d'origine (« en descente la composante avant mangeait l'impulsion, on ressortait
       en plongeant ») reste valable — on la garantit simplement DANS LE BON REPÈRE : on complète la
       vitesse le long de `F.n`, la normale de décollage, qui pointe toujours à l'opposé du bitume.
       ⚠ `F` est encore la frame posée par `startFall` juste au-dessus : ne rien intercaler ici. */
    const vN9=fallVel.dot(F.n);
    if(vN9<34)fallVel.addScaledVector(F.n,34-vN9);
    airFlash=.6;
  }else if(mode==='fall'){
    fallVel.y=Math.min(70,fallVel.y+34); // en plein vol : une RELANCE, le geste n'est jamais perdu
  }
  // LA COLONNE DE FEU : le souffle qui pousse la caisse, cracké vers le bas
  const p9=carGroup.position;
  for(let k=0;k<54;k++){
    const a=Math.random()*6.2832,r=Math.random()*1.5;
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*r,p9.y-.3,p9.z+Math.sin(a)*r,
      Math.cos(a)*(2+Math.random()*5),-(14+Math.random()*20),Math.sin(a)*(2+Math.random()*5),.22+Math.random()*.24);
  }
  for(let k=0;k<26;k++){const a=Math.random()*6.2832;
    spawnP(smokePool,p9.x+Math.cos(a)*2,p9.y-.5,p9.z+Math.sin(a)*2,
      Math.cos(a)*(6+Math.random()*8),1+Math.random()*3,Math.sin(a)*(6+Math.random()*8),.7+Math.random()*.7);}
  sparkBurst(sparkGold,p9,22,16);sparkBurst(sparkBlue,p9,14,13);
  boostSnd();subBoom(.34);noiseBurst(.5,.2,340);thud(12);
  shake=Math.max(shake,1.1);duckT=Math.max(duckT,.5);
  flashEl.style.background='#ffe6b8';flashEl.style.opacity=.42;
  setTimeout(function(){flashEl.style.opacity=0;flashEl.style.background='#ff2020';},150);
  showMsg('🚀 DÉCOLLAGE — TOUT ×2 ! ★','#ff3ec8');
}
function trickMsg(txt,tier){ // tier: 1 MONSTRE · 2 DOUBLE · 3 TRIPLE (ou true = mis en avant)
  if(TCTL.on){verdPousse(txt,tier);return;} // (vague 3) sur téléphone #trickBox est masqué (écran nu) : le verdict monte au COULOIR des annonces (verdSolde)
  // UN temps fort à la fois : un gros verdict (tier≥2) balaie les petits pops en cours ; sinon on plafonne à 2
  if(tier===2||tier===3){while(trickBox.firstChild)trickBox.firstChild.remove();}
  else while(trickBox.childElementCount>=2)trickBox.firstChild.remove();
  const el=document.createElement('div');
  el.className='trick'+(tier===3?' m3':tier===2?' m2':tier===1?' m1':(tier?' big':''));
  {const m9=LANG!=='fr'&&/^(PARFAIT \(BOOST ×2\) !|PARFAIT !|DIVIN !!|POSÉ LOURD — AÏE…) (.+)$/.exec(txt); // (2026-10-14) le VERDICT de pose arrive composé (grade + verdict) : on traduit les deux moitiés
   el.textContent=m9?TR(m9[1])+' '+TR(m9[2]):TR(txt);} // même porte d'entrée unique que showMsg pour la traduction
  trickBox.appendChild(el);
  setTimeout(()=>{el.remove();},tier===3?1500:tier===2?1200:950);
}
// ---- CHAÎNE DE FIGURES : chaque exploit aérien se NOMME à l'instant où il naît et gonfle la
// chaîne. Rien n'est payé en vol : tout se cashe à l'atterrissage (grade × face × série) —
// et tout S'ENVOLE si on explose. La redite paye de moins en moins : varie le menu !
let chain=0,chainVal=0,chainMult=1,chainSeen={},spinHalf=0,
    curNear=false,curHOff=0,curLatOff=0,curTOff=0,lastNearY=0,lastNearH2=0,lastNearS=0, // lastNearH2 : distance HORIZONTALE² au bitume (au-dessus d'un trou elle explose → l'ombre de contact se cache) · lastNearS : où l'on en est SUR la piste pendant un vol (recentre le LOD de proximité)
    caseHot=false,heartT=0,ladderI=0;        // la MALLETTE tremble + cœur qui cogne · échelle des paliers
// ---------- FLAVOUR : les phrases qui font le sel du jeu — courtes, arrogantes, cash ----------
const pickL=a=>a[Math.floor(Math.random()*a.length)];
// LE DÉBLOCAGE : elle est à toi, définitivement — on le dit autrement qu'un « nouvelle caisse » plat
const CAR_LINES=['ELLE EST À TOI','CLÉS EN MAIN','LIVRÉE, RODÉE, VOLÉE','TU CHANGES DE MONDE',
  'SIGNÉ, EMBARQUÉ','ELLE T\'ATTENDAIT','NOUVEAU JOUET','ENCARTÉE AU GARAGE'];
const GO_LINES=[ // le départ : une gifle d'encouragement, jamais deux fois la même
 'GO ! NE MEURS PAS','PIED AU PLANCHER — QUESTIONS APRÈS','LA PRUDENCE RESTE AU GARAGE',
 'ROULE COMME SI L\'ESSENCE ÉTAIT GRATUITE','LE FREIN, C\'EST LA PÉDALE DES AUTRES','VAS-Y. LE CIEL REGARDE.'];
const ZONE_LINES=[ // le portail : chaque zone avalée se célèbre
 'NOUVELLE ZONE !','ZONE AVALÉE — SUIVANTE !','ENCORE UNE ZONE AU COMPTEUR !','LA ROUTE EST À TOI !','ZONE SUIVANTE — ON RALENTIT PAS !'];
const RAIN_LINES=[ // la pluie de billets : le compte en banque a le vertige
 '💸 IL PLEUT DES BILLETS — PARAPLUIE INUTILE','💸 LA BANQUE A APPELÉ : ELLE ABANDONNE','💸 TON COMPTE A LE VERTIGE','💸 L\'ARGENT TOMBE PLUS VITE QUE TOI'];
const END_LINES=[ // fin de run (même en crash) : la punchline sous le GAME OVER
 'LA ROUTE GAGNE. CETTE FOIS.','LE BITUME SE SOUVIENDRA DE TOI','MÊME LES LÉGENDES TOUCHENT LE SOL',
 'CRASH TEST RÉUSSI. ENFIN… TEST.','LA GRAVITÉ : 1 — TOI : 0','T\'ES MORT. LES THUNES, ELLES, RESTENT.',
 'REVIENS. LA VITESSE S\'ENNUIE DÉJÀ.'];
const END_TOP=[ // fin de run AVEC record : là on s'incline
 '🏆 RECORD — LES AUTRES JOUENT À UN AUTRE JEU','🏆 LE LEADERBOARD A DEMANDÉ TON AUTOGRAPHE',
 '🏆 RECORD ÉCRASÉ — COMME TES SUSPENSIONS','🏆 HISTORIQUE. LA ROUTE S\'EN REMET À PEINE.'];
// ---- L'ÉCHELLE : chaque palier de multiplicateur se CRIE — le plafond ×6 devient un objectif nommé ----
const LADDER=[[2,'ÇA CHAUFFE !'],[3,'EN FEU !!'],[4.5,'AURA EN FUSION'],[6,'MULTI MAX !!']]; // (2026-09-29, passe qualité) « IL PLEUT DES BILLETS » / « JACKPOT MAX » : les figures ne paient plus qu'en aura
const flyV=new THREE.Vector3();
function flyCash(worldPos,n){ // les billets VOLENT de la caisse vers le compteur — l'argent SE VOIT gagné
  flyV.copy(worldPos).project(camera);
  if(flyV.z>1)return; // derrière la caméra : rien à montrer
  if(SONV2&&!document.body.classList.contains('touch')){const m9=Math.min(4,n|0);for(let k=0;k<m9;k++){const i9=m9>1?Math.round(k*(n-1)/(m9-1)):0;sfx('billet.vole',{t:.58+i9*.045,st:sonPd(k)});}} // (console de son) sur téléphone .bill est masqué (écran nu) : pas de son sans image
  const x0=(flyV.x*.5+.5)*innerWidth,y0=(-flyV.y*.5+.5)*innerHeight;
  const r=elMoney.getBoundingClientRect(),x1=r.left+r.width/2,y1=r.top+r.height/2;
  for(let i=0;i<n;i++){
    const b=document.createElement('div');b.className='bill';b.textContent='$';
    b.style.left=(x0+(Math.random()-.5)*70)+'px';b.style.top=(y0+(Math.random()-.5)*46)+'px';
    document.body.appendChild(b);
    setTimeout(()=>{b.style.left=x1+'px';b.style.top=y1+'px';b.style.opacity=0;b.style.fontSize='8px';},30+i*45);
    setTimeout(()=>{b.remove();},640+i*45);
  }
}
function trickPop(k){ // carillon qui MONTE d'un demi-ton par maillon — l'oreille réclame la suite
  chimeNote(noteP(Math.min(7,k-1),1),0,.09,.16); // (même tonalité que les pièces)
}
function chainHudShow(){
  chainHud.textContent=TR('CHAÎNE ×')+decFr(Math.min(6,chainMult),1)+' · +'+Math.round(chainVal);
  chainHud.style.opacity=1;
  chainHud.classList.remove('pulse');void chainHud.offsetWidth;chainHud.classList.add('pulse');
}
function addTrick(id,txt,val,tier,raw,free){ // raw : échelles qui grimpent déjà (vrilles, bumps) — pas de décote. free : figure GRATUITE, zéro dollar : feedback oui, argent non (plus personne depuis le 15/10 soir : le bump paie comme les autres)
  if(fever>0&&!free)fever=Math.min(18,fever+.8); // pendant le BRAQUAGE, chaque figure PROLONGE le plaisir (plafond 18 s) — sauf les gratuites
  const n=(chainSeen[id]=(chainSeen[id]||0)+1);
  /* L'AURA PASSE PAR LE COMBO, PAS PAR LA VALEUR DE LA FIGURE. Même les figures GRATUITES (le bump)
     comptent : elles ne valent pas un dollar mais elles PROLONGENT l'enchaînement, et c'est
     l'enchaînement qu'on récompense. */
  // (aura v2) chaque figure entre dans la CHAÎNE avec ses points (voir chaineAura) — plus de combo à rang invisible
  // (2026-09-26, audit son) `muet` : `trickPop` plus bas sonne déjà le maillon — deux carillons sur deux notes brouillaient la gamme qui monte
  if(id==='vrille')chaineAura(spinHalf*180+'°',45,'vrille',true,true);
  else if(String(id).indexOf('fig_')===0){const f9=window.FIG&&FIG.par[id.slice(4)];chaineAura(txt,FX2.aura>0?FX2.aura:f9?f9.aura:60,id,false,true);} // (2026-10-14) LES FIGURES du double-tap nitro (figures.js) — v2 : l'aura × ses tours (FX2.aura)
  else if(id==='bump')chaineAura(bounceN>1?'BUMP ×'+bounceN:'BUMP',30,'bump',true,true);
  else chaineAura(String(txt).split(' — ')[0],40,id,false,true);
  // (FLOW v2) LE RISQUE NOURRIT LE FLOW EN DIRECT : en l'air la jauge monte PENDANT qu'on vrille (et le vide ne la fait pas fuir).
  // La vrille paie par demi-tour ; les autres selon leur rang, et la redite s'use comme dans la mallette (×0,6).
  if(mode==='fall'&&!free)flowAdd(id==='vrille'?4:(tier===3?12:tier===2?9:6)*Math.pow(.6,n-1),'risque');
  if(!free){ // une figure gratuite ne touche NI la mallette (chainVal) NI le multiplicateur NI l'échelle
    chainVal+=raw?val:val*Math.pow(.6,n-1);
    chainMult+=n===1?.5:.15;
    while(ladderI<LADDER.length&&Math.min(6,chainMult)>=LADDER[ladderI][0]){ // palier franchi : on le crie
      trickMsg('×'+LADDER[ladderI][0]+' — '+TR(LADDER[ladderI][1]),LADDER[ladderI][0]>=4.5?3:2);
      if(SONV2){if(LADDER[ladderI][0]>=6)sfx('fig.jackpot');else sfx('fig.palier',{st:echSt()});}else chimeNote(noteP(ladderI+3,1),0,.12,.22); // l'échelle monte à l'oreille aussi (mi pentatonique)
      ladderI++;
    }
  }
  chain++;if(!free)secFig();m2Fig(id); /* (2026-10-16) LES MISSIONS v2 : figures d'un saut, salto devant la Terre */ // (2026-10-14) LES DÉFIS SECRETS : LAMPADAIRE (les figures de la ville, la nuit)
  if(chain>(runStats.chainMax||0))runStats.chainMax=chain;
  trickMsg(txt+(n>2&&!raw?' ×'+n:''),tier||false); // (dauphin v5) en vol, le dauphin ne s'ÉCRIT pas : on le voit nager
  addStyle(tier===3?16:tier===2?11:7);
  figSnd(id); // (2026-09-28) chaque figure a sa matière, sur l'échelle du vol (voir LA CONSOLE DE SON)
  chainHudShow();
}
function respawn(){
  dmtCoupe();
  try{slideRaz();}catch(e){} // (SLIDE) replacé : le frottement en cours est perdu
  try{bkSkateRaz();BKV.yaw=0;BKV.gl=0;BKV.gk=0;}catch(e){} // (ICE SKATE) la glisse aussi · (2026-10-15 soir) et la glissade sur le verglas
  SVOL.t=0;SVOL.k=0; // (2026-10-14, session SON) replacé : la tension du vol ne survit pas
  for(const t9 of SILS)t9.init=false;rainbowCoupe();nfeuCoupe(); // (2026-09-26) pas de ruban tendu jusqu'au point de replacement
  LIGNE.sPk=null;LIGNE.sPd=LIGNE.sPd0=s; // (LIGNE PARFAITE, audit GAMEPLAY) le balayage de trajet repart d'ici : sinon il ramassait, sans contact, l'objet qu'on venait de rater
  JEAU.dans=false;JEAU.wB=0; // (2026-10-13) replacé sur la route : plus sous l'eau — (2026-10-14, revue des idées de Léo) et plus redressé par elle : wB restait vers 1 en conduite, et au saut suivant la vrille et le vol équilibré étaient coupés 1-2 s
  momT=0; // (momentum v2) repartir = réserve vide
  if(introD){introD=false;if(pigGroup){scene.remove(pigGroup);pigGroup=null;}} // R pendant le largage : on annule proprement
  s=THREE.MathUtils.clamp(safeS-8,0,Math.max(0,L-80));
  lat=0;psi=0;vA=26;vL=0;side=1;FREIN_L=0;PARIS.psiK=0;/* (2026-10-17) ni frein étalé ni renvoi de paroi en cours */driveDir=1;graceT=1.6;prevTvalid=false;yawAcc=0;hopY=0;hopV=0;levreY=0;bascOn=false;bascT=0;mode='drive';yawR=0;slipB=0;glisse9=0;driftYaw=0;driftEnCours=false;driftC=0;driftLv=0;driftT=0;carRoll9=0;rollV=0;pitch9=0;
  if(SENS)try{SENS_PA.rs=1;}catch(e){} // (2026-10-14, sensations · passages) un replacement vient d'avoir lieu : sensPassages le lit à l'image suivante (rien n'est joué ici — respawn sert aussi au chargement et au départ)
}
// FREESTYLE : on ne MEURT jamais dans le parc — on repart sur la piste. La chaîne en cours est perdue
// (on n'a pas su reposer), mais aucune explosion, aucun game over : c'est un bac à sable de figures.
function sandRevive(){ // BAC À SABLE : on efface les dégâts et on repart, la run continue
  clearBoom();
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  airPie.style.display='none';airFlash=0;
  insUsed=false;nitroR=nitroCap();nitroX=0;boost=0;slowT=0;hitT=0;
  respawn();if(SONV2)sfx('respawn'); /* (console de son) le repêchage s'entend */
  hopY=2.2;hopV=0;try{flashEcran('rgba(255,255,255,.35)');}catch(e){} // (2026-09-28) elle RETOMBE sur sa ligne (tassement compris) au lieu d'y apparaître : on voit qu'on repart
}
function parkRespawn(){
  chain=0;chainVal=0;chainMult=1;chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  airPie.style.display='none';airFlash=0;
  respawn();if(SONV2)sfx('respawn');hopY=2.2;hopV=0;try{flashEcran('rgba(255,255,255,.35)');}catch(e){} // (2026-09-28) la caisse retombe sur sa ligne
  showMsg('↻ ON REPART','#7dffec');
}
// ⚠ CE N'EST PLUS L'ARGENT DE LA PARTIE QUI DÉBLOQUE LES CAISSES (2026-08-03). Avant, `level` montait
// en pleine course dès que `levelCash` passait un seuil : la caisse conduite ne changeait plus (elle
// est cosmétique) mais `level` si — d'où un HUD qui affichait la dernière caisse GAGNÉE au lieu de
// celle qu'on PILOTE, et un overdrive de vitesse qui grimpait avec elle. `level` est désormais FIXE
// pour toute la partie : c'est la caisse équipée au garage, point.
// Le déblocage passe par des conditions PERSISTANTES (voir CAR_UNLOCK) ; on scanne ici pour crier
// tout de suite celles qui tombent en direct (record d'argent, palier moteur), le reste est versé à
// la fin du run par commitExploits().
function checkUpgrade(){
  const got=carScan();
  if(!got.length)return;
  boost=Math.max(boost,1.3);try{if(SONV2)sfx('caisse.debloquee');else fanfare();}catch(e){}shake=Math.max(shake,.4);
  sparkBurst(sparkGold,carGroup.position,30,17);
  for(const i of got){
    const sp9=CARS[i];
    showMsg(TR(pickL(CAR_LINES))+' — '+TR(sp9.name)+'  '+TR('(au garage)'),'#ffd75e');
    trickMsg('🔑 '+TR(sp9.name),3);
  }
  SAVE.flush();
}
