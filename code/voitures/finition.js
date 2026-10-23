/* ===== LA FINITION STUDIO (2026-10-20, Léo : « une manière plus moderne et plus stylée, plus polie — brillante ET poly — sans te limiter
   au poly ; garder toute la beauté en ayant l'air solide ; sur toutes les voitures en même temps ») — puis, entre trois essais : « essai 2
   finalement dans le jeu ». ===== ALLUMÉE dans le jeu ; `?finition=ancien` (ou `dbgFinition(0)` au banc) = le garage d'avant. Trois couches,
   posées sur TOUTE la gamme sans retoucher un seul dessin (les réglages de l'essai 2, « plus fort » ; l'essai 1 et l'entre-deux sont dans
   l'historique git, commits fc686839 et 4918f591) :
   1. LA LUMIÈRE DE STUDIO au garage (`paintEnvStudio`) : le cube de reflets passe de 64² à 256² (des reflets NETS) et porte de longues
      boîtes à lumière à hauteur de flanc — un peu SOUS l'horizon, là où regarde un flanc vu d'en haut — et de grands panneaux au plafond :
      quand la caisse tourne, des bandes blanches glissent de pan en pan (avant, les flancs reflétaient un mur terne : d'un bloc).
   2. LE VERNIS PROFOND au garage (`finLaque`) : la laque montre plus sa couleur de face et devient miroir en rasant ; le plancher
      lumineux baisse (des ombres plus franches). Rendu à la sortie du garage : en course, la couleur garde sa lisibilité.
   3. LES REFLETS QUI ÉCLATENT au garage (`fstuHdr`) : un cube de reflets ne monte qu'à 1 (blanc) ; une laque n'en prend que 20 %, une boîte
      à lumière n'y laissait qu'un voile. Sur la tôle des caisses, ce qui est presque blanc dans le cube compte ×4 (comme une vraie lampe) :
      une bande NETTE et brillante court sur le pan qui la regarde. Les matières des caisses ont leur clé de programme à elles
      (`customProgramCacheKey`) : les meubles de l'atelier, qui partagent lpMat, ne la voient pas.
   (ESSAI ÉCARTÉ, gardé derrière `&aretes=1` : un filet de lumière sur chaque arête vive, par barycentres — sur les facettes fines du kit il
   dessinait des dents de scie autour des roues, pas un chanfrein propre. WebGL2 seulement.) */
const FSTU={on:!/[?&]finition=(ancien|0)/.test(location.search),aretes:/[?&]aretes=1/.test(location.search),garage:false,env:'ciel',menuW:1,uArK:{value:1},uHdr:{value:0}};
const FSTU_LAQUE={p:[1.35,3.6,1.8,.2,.0],k:[1.3,3.2,1.8,1,.02]}; // (20/10, Léo : « pas assez visible, pousse plus fort ») v2 — v1 : p [.8,3,2,.2,.03], k [.9,2.6,2,1,.05] // [de face, en rasant, dureté, métal, plancher lumineux] (lpMat : p [.25,1.5,3,.2] · .06 ; k [.6,1.8,2.4,1] · .07)
function finAreteOk(){try{return FSTU.on&&FSTU.aretes&&renderer.capabilities.isWebGL2;}catch(e){return false;}}
/* les drapeaux d'arête d'une géométrie NON indexée : pour chaque triangle, ses trois côtés (opposés aux sommets 0, 1, 2) — vif si l'angle avec
   la facette voisine dépasse `deg` ; un côté sans voisine (le bord d'une pièce) ne l'est pas. aArete = (drapeau 0, 1, 2, rang du sommet). */
function finArete(geo,deg){
  const P=geo.attributes.position;if(!P||geo.index){finZero(geo);return;}
  const n=P.count,nt=(n/3)|0,a=P.array,N=new Float32Array(nt*3),cs=Math.cos((deg||24)*Math.PI/180),q=v=>Math.round(v*2000);
  for(let t=0;t<nt;t++){const i=t*9,ux=a[i+3]-a[i],uy=a[i+4]-a[i+1],uz=a[i+5]-a[i+2],vx=a[i+6]-a[i],vy=a[i+7]-a[i+1],vz=a[i+8]-a[i+2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;N[t*3]=x/l;N[t*3+1]=y/l;N[t*3+2]=z/l;}
  const cle=(p,r)=>{const A=q(a[p*3])+','+q(a[p*3+1])+','+q(a[p*3+2]),B=q(a[r*3])+','+q(a[r*3+1])+','+q(a[r*3+2]);return A<B?A+'|'+B:B+'|'+A;};
  const M=new Map();
  for(let t=0;t<nt;t++)for(let k=0;k<3;k++){const c=cle(t*3+(k+1)%3,t*3+(k+2)%3);let L=M.get(c);if(!L)M.set(c,L=[]);L.push(t*3+k);}
  const F=new Float32Array(n*4);
  for(const L of M.values()){if(L.length!==2)continue;const t0=(L[0]/3)|0,t1=(L[1]/3)|0;
    if(N[t0*3]*N[t1*3]+N[t0*3+1]*N[t1*3+1]+N[t0*3+2]*N[t1*3+2]>cs)continue;
    for(const e of L){const t=(e/3)|0,k=e%3;for(let v=0;v<3;v++)F[(t*3+v)*4+k]=1;}}
  for(let i=0;i<n;i++)F[i*4+3]=i%3;
  geo.setAttribute('aArete',new THREE.Float32BufferAttribute(F,4));}
function finZero(geo){const P=geo.attributes.position;if(!P)return;const F=new Float32Array(P.count*4);for(let i=0;i<P.count;i++)F[i*4+3]=i%3;geo.setAttribute('aArete',new THREE.Float32BufferAttribute(F,4));}
// toutes les pièces de la caisse dont la matière dessine les arêtes : la tôle (laque, métallisé, nacre) calcule ses arêtes, le reste porte des zéros
function finCaisse(){carGroup.traverse(o=>{if(!o.isMesh||!o.geometry||Array.isArray(o.material)||!o.material||!o.material.userData.arete)return;
  if(o.geometry.attributes.aArete)return;const g=o.material.userData.g;
  if(g==='p'||g==='k'||g==='n'||(typeof g==='string'&&g.indexOf('pm:')===0))finArete(o.geometry);else finZero(o.geometry);});}
// le code des arêtes, greffé dans lpMat (voir lpMat `ar`)
const FSTU_V='attribute vec4 aArete;varying vec3 vArF;varying vec3 vArB;\n',
      FSTU_VM='vArF=aArete.xyz;vArB=vec3(step(aArete.w,.5),step(.5,aArete.w)*step(aArete.w,1.5),step(1.5,aArete.w));\n',
      FSTU_F='varying vec3 vArF;varying vec3 vArB;uniform float uArK;\n',
      FSTU_HDR='uniform float uStuHdr;vec3 fstuHdr(vec3 e){return e*(1.+uStuHdr*4.5*smoothstep(.5,.92,dot(e,vec3(.299,.587,.114))));}\n', // (v2 : ×5,5 — v1 ×3,4)
      FSTU_FM='{vec3 e3=mix(vec3(1.),vArB,step(.5,vArF));float e9=min(e3.x,min(e3.y,e3.z)),w9=fwidth(e9)+1e-5;\n'+
        'float l9=(1.-smoothstep(w9*1.1,w9*2.8,e9))*(1.-smoothstep(.25,.5,w9))*uArK;gl_FragColor.rgb=mix(gl_FragColor.rgb,gl_FragColor.rgb*1.45+vec3(.07),l9);}\n';
// le vernis profond : au garage (on) ou rendu à la course (off) — sur les matières de la caisse posée
/* (2026-10-20, Léo, sur la page AVANT | APRÈS de toute la gamme : « juste le requin était mieux ») LES CAISSES QUI GARDENT LE GARAGE D'AVANT :
   pour elles, au garage, le reflet de l'atelier d'origine (paintEnvAtelier), leur vernis d'origine et pas de reflets qui éclatent. Une seule
   caisse est au garage à la fois : le cube de reflets se repeint quand on passe de l'une à l'autre (64² ↔ 256²). */
const FSTU_SANS={requin:1};
/* `on` : false (course, ciel d'un niveau) · true (le GARAGE : la lumière de studio) · 'menu' (LE MENU CIEL : le ciel du menu en reflets nets, voir
   paintEnvMenu). FSTU.env dit quel cube est peint ('ciel', 'atelier', 'studio', 'menu') : on ne repeint que s'il le faut. */
function finLaque(on){FSTU.garage=on||false;const sans=!!FSTU_SANS[carGroup.userData.shape];
  const w=on==='menu'?FSTU.menuW:1; // (menu ciel) la finition se dose avec le jour : la nuit, un vernis profond ne reflète que du noir et éteint la caisse
  FSTU.uHdr.value=FSTU.on&&on&&!sans?(on==='menu'?FSTU_MENU_HDR*w*1:1):0;if(!FSTU.on)return;
  const mel=(a,b)=>a.map((v,i)=>v+(b[i]-v)*w);
  if(on===true){try{if(sans){if(FSTU.env!=='atelier')paintEnvAtelier();}else if(FSTU.env!=='studio')paintEnvStudio();}catch(e){}}
  on=!!on&&!sans;
  carGroup.traverse(o=>{const ms=o.isMesh?(Array.isArray(o.material)?o.material:[o.material]):[];
    for(const m of ms){
      /* (2026-10-20, Léo : « d'autres voitures qui manquent la finition ? » — mesuré à l'écran : LA HONTE, REQUIN, ACIDE, LA CAISSE-NUAGE) la tôle des
         matières `rimify` (hors kit) : le même vernis EFFECTIF que la laque du kit (reflet de face .24×1,35, en rasant .24×3,6), ramené à SA réflectivité */
      if(m&&m.userData&&m.userData.uVr&&m.userData.rimK!==0&&m.reflectivity>0){const U=m.userData.uVr.value,L=FSTU_LAQUE.p,r=m.reflectivity;
        if(!m.userData.uVr0)m.userData.uVr0=U.toArray();
        if(on)U.fromArray(mel(m.userData.uVr0,[.24*L[0]/r,.24*L[1]/r,L[2],Math.max(.2,m.userData.uVr0[3])]));else U.fromArray(m.userData.uVr0);continue;}if(!m||!m.userData||!m.userData.uV)continue;const L=FSTU_LAQUE[m.userData.g==='k'?'k':(m.userData.g==='p'||(typeof m.userData.g==='string'&&m.userData.g.indexOf('pm:')===0))?'p':''];if(!L)continue;
      if(!m.userData.uV0)m.userData.uV0=[m.userData.uV.value.toArray(),m.userData.uG.value];
      if(on){m.userData.uV.value.fromArray(mel(m.userData.uV0[0],L.slice(0,4)));m.userData.uG.value=m.userData.uV0[1]+(L[4]-m.userData.uV0[1])*w;}else{m.userData.uV.value.fromArray(m.userData.uV0[0]);m.userData.uG.value=m.userData.uV0[1];}}});}
/* LA LUMIÈRE DE STUDIO : le cube en 256², murs sombres, des boîtes à lumière NETTES (un cœur blanc, un halo court) à hauteur de flanc,
   deux colonnes verticales (elles balaient la caisse quand elle tourne), un grand panneau au plafond ; la porte garde le bas de ses flammes */
function paintEnvStudio(){FSTU.env='studio';
  const S=256;
  envCvs.forEach(function(cv,f){if(cv.width!==S){cv.width=cv.height=S;}const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);
    const boite=(x,y,w,h,col,a,halo)=>{const g=c.createLinearGradient(0,y-halo,0,y+h+halo);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(halo/(h+2*halo),'rgba('+col+','+(a*.35).toFixed(2)+')');
        g.addColorStop(.5,'rgba('+col+','+a+')');g.addColorStop(1-halo/(h+2*halo),'rgba('+col+','+(a*.35).toFixed(2)+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.fillRect(x,y-halo,w,h+2*halo);
        c.fillStyle='rgba(255,255,255,'+Math.min(1,a+.1).toFixed(2)+')';c.fillRect(x+3,y+h*.25,w-6,Math.max(2,h*.5));},
      colonne=(x,y,w,h,col,a)=>{const g=c.createLinearGradient(x-8,0,x+w+8,0);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(.5,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');
        c.fillStyle=g;c.fillRect(x-8,y,w+16,h);c.fillStyle='rgba(255,255,255,'+a+')';c.fillRect(x+w*.3,y+4,w*.4,h-8);};
    if(f===2){c.fillStyle='#050608';c.fillRect(0,0,S,S);                                                    // +Y : le plafond noir…
      const g=c.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,'rgba(255,248,236,.95)');g.addColorStop(.55,'rgba(255,244,228,.55)');g.addColorStop(1,'rgba(255,244,228,0)');
      c.fillStyle=g;c.fillRect(0,0,S,S);c.fillStyle='rgba(255,255,255,.92)';c.fillRect(56,84,144,88);                // …et son grand panneau
      for(const y of [30,226]){c.fillStyle='rgba(255,246,232,.85)';c.fillRect(24,y-2,208,4);}return;}
    if(f===3){const g=c.createRadialGradient(128,128,8,128,128,150);g.addColorStop(0,'#1a1d24');g.addColorStop(1,'#07080a');c.fillStyle=g;c.fillRect(0,0,S,S);return;} // −Y : le sol
    const gr=c.createLinearGradient(0,0,0,S);gr.addColorStop(0,'#030305');gr.addColorStop(.40,'#0b0d12');gr.addColorStop(.50,'#11141a');gr.addColorStop(.53,'#07080b');gr.addColorStop(1,'#030304'); // (v2 : plus sombres, la lumière ressort)
    c.fillStyle=gr;c.fillRect(0,0,S,S);
    const chaud=(f===0||f===5),col=chaud?'255,236,210':'214,236,255';
    /* (mesuré à la MIRE, dbgFinition('mire') : un flanc droit vu de la caméra du garage reflète ~30° SOUS l'horizon — rangées 192-223 ;
       une épaule qui rentre, 128-159 ; un capot ou un toit vus en rasant, 64-95) */
    boite(8,198,240,12,col,.92,7);                                                                           // LA boîte à lumière des flancs (v2 ,92 ; v1 ,82 — à 1 elle brûlait le bas d'une porte jaune)
    boite(16,146,224,9,col,1,6);                                                                             // celle des épaules (v2 plus large et pleine)
    boite(24,80,208,8,col,.95,6);                                                                            // celle des capots et des toits, en rasant (v2 plus pleine)
    if(f!==4){colonne(54,40,12,180,col,1);colonne(192,40,12,180,col,1);}                                    // deux colonnes sur chaque mur (v2 : trois murs, pleine force) : elles balaient la caisse quand elle tourne
    if(f===4){const n=c.createLinearGradient(0,150,0,256);n.addColorStop(0,'rgba(196,86,26,0)');n.addColorStop(.6,'rgba(196,86,26,.55)');n.addColorStop(1,'rgba(106,22,12,.8)');c.fillStyle=n;c.fillRect(40,150,176,106);} // la porte : le bas de ses flammes
  });
  envTex.needsUpdate=true;}
/* ===== LE MENU CIEL (2026-10-20, Léo : « fais en sorte que la voiture soit aussi belle dans le menu ciel ») ===== la caisse du menu reflétait le
   ciel du matin en 64², sans une arête : une laque tiède. Le ciel du menu est repeint en 256², ASSOMBRI (le contraste fait la laque, comme les murs
   du studio), et porte des bandes de lumière NETTES aux hauteurs que regardent les pans (mesurées à la mire au garage) : la mer de nuages au
   soleil pour les flancs, l'horizon doré pour les épaules, un voile de ciel clair pour les capots ; le soleil en disque net. Le vernis profond et
   les reflets qui éclatent (plus doux qu'au garage : FSTU_MENU_HDR) suivent. REQUIN (FSTU_SANS) garde le ciel d'avant. */
const FSTU_MENU_HDR=1;
function paintEnvMenu(B){FSTU.env='menu';FSTU.envB=B;FSTU.garage=false; // (garage=false : finMenu repose la laque, au dosage de ce ciel)
  const S=256,stops=B.env,zen=stops[0][1],sol=stops[stops.length-1][1],s1=B.eS1,s2=B.eS2,
    sunF=Math.abs(SUN_DIR.x)>Math.abs(SUN_DIR.z)?(SUN_DIR.x>0?0:1):(SUN_DIR.z>0?4:5),
    /* le jour se lit comme dans paintEnv (la bande d'horizon du ciel) : de jour des bandes blanc chaud et le soleil ; la nuit (les heures du titre)
       des bandes à la couleur du néon du ciel, plus douces, et pas de soleil */
    jour=(()=>{const h9=(stops.find(s=>s[0]>=.58)||stops[stops.length-1])[1],n9=parseInt(h9.slice(1),16),l9=(.3*(n9>>16&255)+.59*(n9>>8&255)+.11*(n9&255))/255;return Math.min(1,Math.max(0,(l9-.35)/.45));})(),
    mixc=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(','),
    chaud=mixc([s1[0],s1[1],s1[2]],[255,240,220],.45+.5*jour),dore=mixc([s1[0],s1[1],s1[2]],[255,222,170],.6*jour),clair=mixc([s1[0],s1[1],s1[2]],[255,250,242],.5+.45*jour),kA=.6+.4*jour;FSTU.menuW=.55+.45*jour; // (v2) des blancs CHAUDS : la teinte de la laque reste la sienne (un blanc bleuté virait le vert au canard)
  const bande=(c,y,h,col,a,halo)=>{const g=c.createLinearGradient(0,y-halo,0,y+h+halo);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(.5,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');
      c.fillStyle=g;c.fillRect(0,y-halo,S,h+2*halo);c.fillStyle='rgba(255,255,255,'+Math.min(1,a).toFixed(2)+')';c.fillRect(0,y+h*.3,S,Math.max(2,h*.4));};
  envCvs.forEach(function(cv,f){if(cv.width!==S)cv.width=cv.height=S;const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);
    if(f===2){c.fillStyle=zen;c.fillRect(0,0,S,S);c.fillStyle='rgba(6,6,14,.6)';c.fillRect(0,0,S,S);
      const g=c.createRadialGradient(128,128,10,128,128,110);g.addColorStop(0,'rgba('+clair+',.75)');g.addColorStop(1,'rgba('+clair+',0)');c.fillStyle=g;c.fillRect(0,0,S,S);return;} // le zénith, un voile clair au milieu (les toits)
    if(f===3){c.fillStyle=sol;c.fillRect(0,0,S,S);c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,S,S);return;}
    const gr=c.createLinearGradient(0,0,0,S);for(const st of stops)gr.addColorStop(st[0],st[1]);c.fillStyle=gr;c.fillRect(0,0,S,S);
    c.fillStyle='rgba(8,8,18,'+(.2+.35*jour).toFixed(2)+')';c.fillRect(0,0,S,S);                         // le ciel ASSOMBRI : les bandes ressortent (moins la nuit : il l'est déjà)
    bande(c,198,12,chaud,.95*kA,10);                                                                     // la mer de nuages au soleil : les flancs
    bande(c,146,7,dore,.85*kA,8);                                                                        // l'horizon doré : les épaules
    bande(c,84,6,clair,.6*kA,10);
    if(B.course){bande(c,76,12,clair,.7*kA,12);bande(c,106,6,clair,.5*kA,6);bande(c,166,10,chaud,.65*kA,10);}   // (EN COURSE, 20/10) la caméra voit la caisse de DOS et de dessus : le toit et le capot reflètent le mur d'en face au-dessus de l'horizon (larges bandes claires), l'arrière et le coffre le mur de derrière sous l'horizon                                                                        // le ciel clair : les capots et les toits en rasant
    c.fillStyle='rgba('+s2[0]+','+s2[1]+','+s2[2]+','+(s2[3]*.8).toFixed(2)+')';c.fillRect(0,120,S,4);
    if(f===sunF&&B.sunHalo!==0&&jour>.3){const h=c.createRadialGradient(128,110,0,128,110,34);h.addColorStop(0,'rgba(255,250,236,1)');h.addColorStop(.22,'rgba(255,240,205,.95)');h.addColorStop(.5,'rgba(255,214,150,.35)');h.addColorStop(1,'rgba(255,214,150,0)');
      c.fillStyle=h;c.fillRect(0,0,S,S);}                                                                // le soleil : un disque net, un halo court
  });
  envTex.needsUpdate=true;}
/* ===== LE CIEL DE LA MAP DANS LA LAQUE (2026-10-20, Léo : « les reflets dans la map plus cohérents avec le soleil ou la lumière de la map — là c'est un
   truc de reflet de garage, très répétitif ») EN COURSE, plus de bandes identiques sur chaque mur : le cube est peint PAR DIRECTION du monde (les six
   faces d'un seul tenant, aucune couture) — dégradé du biome en fonction de la hauteur, le SOLEIL à sa vraie place (disque net + halo chaud, l'éclat
   que le vernis fait éclater), une brume d'horizon irrégulière (nuages) qui s'allume côté soleil, un ciel plus sombre à l'opposé, le sol qui prend
   la couleur du biome. La nuit / sans soleil : la même lumière au néon du biome. Convention de lecture : three lit le cube en (−x, y, z) (flipEnvMap)
   et les faces à la convention OpenGL ; la direction du monde de chaque pixel est calculée une fois (`FSTU_DIR`). ===== */
let FSTU_DIR=null;
const FSTU_ECL=[[-.19,.030,3.1,5.3,.4,1.7,.9],[-.08,.022,4.7,7.9,2.1,.6,.8],[.03,.020,2.3,6.1,1.2,3.3,.7],[.14,.026,3.7,9.1,.3,2.4,.7],[.30,.035,2.9,5.7,2.6,.9,.6]]; // [hauteur (sin), demi-épaisseur, fréquence A, fréquence B, phase A, phase B, force]
function fstuDirs(S){if(FSTU_DIR&&FSTU_DIR.S===S)return FSTU_DIR;
  const T=[];for(let f=0;f<6;f++){const A=new Float32Array(S*S*3);
    for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=(i+.5)/S*2-1,v=(j+.5)/S*2-1;let x,y,z;
      if(f===0){x=1;y=-v;z=-u;}else if(f===1){x=-1;y=-v;z=u;}else if(f===2){x=u;y=1;z=v;}else if(f===3){x=u;y=-1;z=-v;}else if(f===4){x=u;y=-v;z=1;}else{x=-u;y=-v;z=-1;}
      const l=Math.hypot(x,y,z),k=(j*S+i)*3;A[k]=-x/l;A[k+1]=y/l;A[k+2]=z/l;}   // (−x : le monde = la lecture à l'envers de flipEnvMap)
    T.push(A);}
  return FSTU_DIR={S,T};}
/* ===== LE CIEL DES REFLETS D'AVANCE (2026-10-24, session PERF — Sacha : « quand tu arrives dans une nouvelle map, des fois il y a du temps à
   apparaître ») =====
   MESURÉ (banc du portail, PC) : la construction d'un passage durait ~180 ms dont 94 % dans paintEnvCiel — les 6 faces × 128² du cube des reflets
   calculées PIXEL PAR PIXEL à chaque changement de ciel (et deux fois aux dunes) ; un téléphone y passe une seconde, image figée. Le calcul est
   devenu une fonction pure (envCielCalc) : le pré-bâti l'envoie à un TRAVAILLEUR pour le ciel de la map d'en face (envPrepare, depuis prebPart)
   et le passage n'a plus qu'à recopier les octets (putImageData). Les ciels déjà vus restent en cache (ENVC, 12 au plus, ~0,4 Mo chacun). La clé
   porte tout ce dont l'image dépend (dégradé, néons, halo, direction EXACTE du soleil) : même image au bit près. Sans travailleur : calculé ici,
   comme avant (et gardé). `?envav=0` = sans travailleur ni cache (avant) · `dbgEnvCiel()` = l'état. */
const ENVC={on:!/[?&]envav=0\b/.test(location.search),cache:new Map(),att:new Map(),w:undefined,id:0,pris:0,calc:0,av:0,ms:0};
function envCle(stops,s1,s2,sunHalo,sd){return JSON.stringify([stops,s1,s2,sunHalo,sd.x,sd.y,sd.z]);}
function envGarde(cle,F){ENVC.cache.delete(cle);ENVC.cache.set(cle,F);while(ENVC.cache.size>12)ENVC.cache.delete(ENVC.cache.keys().next().value);} // (le plus récent en dernier)
function envOuvrier(){if(ENVC.w!==undefined)return ENVC.w;
  try{const src="'use strict';var FSTU_DIR=null;\n"+fstuDirs.toString()+"\n"+envCielCalc.toString()+"\nvar ECL="+JSON.stringify(FSTU_ECL)+";\n"+
      "onmessage=function(e){var m=e.data,a=m.a,F=envCielCalc(a[0],a[1],a[2],a[3],a[4],fstuDirs(128).T,ECL,128);postMessage({id:m.id,cle:m.cle,F:F},F.map(function(x){return x.buffer;}));};";
    const W=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    W.onmessage=function(e){const m=e.data;if(ENVC.att.get(m.cle)!==m.id)return;ENVC.att.delete(m.cle);envGarde(m.cle,m.F);ENVC.av++;};
    W.onerror=function(e){try{e.preventDefault();}catch(x){}ENVC.w=null;ENVC.att.clear();};
    ENVC.w=W;}catch(e){ENVC.w=null;}
  return ENVC.w;}
function envPrepare(B){ // (le pré-bâti) le ciel d'un biome à venir, calculé par le travailleur (B : une entrée de BIOMES)
  if(!ENVC.on||!FSTU.on||!B||!B.env)return;const sh=B.sunHalo!=null?B.sunHalo:1,cle=envCle(B.env,B.eS1,B.eS2,sh,SUN_DIR);
  if(ENVC.cache.has(cle)||ENVC.att.has(cle))return;const W=envOuvrier();if(!W)return;
  const id=++ENVC.id;ENVC.att.set(cle,id);
  try{W.postMessage({id:id,cle:cle,a:[B.env,B.eS1,B.eS2,sh,{x:SUN_DIR.x,y:SUN_DIR.y,z:SUN_DIR.z}]});}catch(e){ENVC.att.delete(cle);}}
window.dbgEnvCiel=function(){return {on:ENVC.on,cache:ENVC.cache.size,enVol:ENVC.att.size,prisEnCache:ENVC.pris,calculesIci:ENVC.calc,parLeTravailleur:ENVC.av,msDernierCalcul:ENVC.ms,travailleur:!!ENVC.w};};
function paintEnvCiel(stops,s1,s2,sunHalo){FSTU.env='ciel2';FSTU.envB=null;FSTU.garage=false;FSTU.menuW=1;
  const S=128,cle=ENVC.on?envCle(stops,s1,s2,sunHalo,SUN_DIR):null;let F=cle&&ENVC.cache.get(cle);
  if(F){envGarde(cle,F);ENVC.pris++;}
  else{const t9=performance.now();F=envCielCalc(stops,s1,s2,sunHalo,{x:SUN_DIR.x,y:SUN_DIR.y,z:SUN_DIR.z},fstuDirs(S).T,FSTU_ECL,S);ENVC.ms=Math.round(performance.now()-t9);ENVC.calc++;if(cle)envGarde(cle,F);}
  envCvs.forEach(function(cv,f){if(cv.width!==S)cv.width=cv.height=S;const c=cv.getContext('2d'),im=c.createImageData(S,S);im.data.set(F[f]);c.putImageData(im,0,0);});
  envTex.needsUpdate=true;}
function envCielCalc(stops,s1,s2,sunHalo,sd,T,ECL,S){ // (pure : ici ou dans le travailleur) les 6 faces du cube, en octets RGBA
  const OUT=[],hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];},
    ST=stops.map(s=>[s[0],hex(s[1])]),
    jour=(()=>{const h9=(stops.find(s=>s[0]>=.58)||stops[stops.length-1])[1],c=hex(h9),l9=(.3*c[0]+.59*c[1]+.11*c[2])/255;return Math.min(1,Math.max(0,(l9-.35)/.45));})(),
    soleil=sunHalo!==0&&jour>.3,
    mel=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
    grad=p=>{if(p<=ST[0][0])return ST[0][1];for(let i=1;i<ST.length;i++)if(p<=ST[i][0]){const a=ST[i-1],b=ST[i];return mel(a[1],b[1],(p-a[0])/Math.max(1e-4,b[0]-a[0]));}return ST[ST.length-1][1];},
    chaud=mel([s1[0],s1[1],s1[2]],[255,236,205],.5+.45*jour),    // la lumière du soleil : blanc chaud (la teinte de la laque reste la sienne)
    clair=mel([s1[0],s1[1],s1[2]],[255,250,240],.45*jour),
    sombre=.3+.14*jour,                                           // le ciel assombri : le contraste fait la laque
    azS=Math.atan2(sd.x,sd.z),hs=Math.hypot(sd.x,sd.z)||1,sdx=sd.x/hs,sdz=sd.z/hs;
  for(let f=0;f<6;f++){const P=new Uint8ClampedArray(S*S*4),A=T[f];OUT.push(P); // (Uint8ClampedArray : les mêmes arrondis que l'ImageData d'avant)
    for(let q=0;q<S*S;q++){const dx=A[q*3],dy=A[q*3+1],dz=A[q*3+2],hz=Math.hypot(dx,dz)||1e-4,el=dy/hz;       // el = tan(hauteur)
      const cs=dx*sd.x+dy*sd.y+dz*sd.z,ca=(dx*sdx+dz*sdz)/hz,az=Math.atan2(dx,dz);                          // ca = 1 face au soleil, −1 à l'opposé
      let col=grad(Math.min(1,Math.max(0,.5-.5*el)));
      let r=col[0]*sombre,g=col[1]*sombre,b=col[2]*sombre;
      if(dy<0){const k=.55+.2*Math.max(0,ca);r*=k;g*=k;b*=k;}                                                // le sol, plus sombre ; un peu moins côté soleil
      // la brume d'horizon : une bande irrégulière (nuages), allumée côté soleil, plus fine et plus sombre à l'opposé
      const hh=Math.exp(-Math.pow((dy+.015)/.075,2)),nz=.62+.2*Math.sin(az*3+1.3)+.12*Math.sin(az*8.3)*Math.sin(az*2.1+.4)+.06*Math.sin(az*17+2),
        lit=.18+.82*Math.pow(Math.max(0,(ca+.35)/1.35),1.6),bh=hh*nz*lit*(.35+.5*jour);
      r+=(chaud[0]-r)*bh;g+=(chaud[1]-g)*bh;b+=(chaud[2]-b)*bh;
      // un liseré franc sur la ligne d'horizon (la mer de nuages, le bord du monde) — le néon du biome la nuit
      const li=Math.exp(-Math.pow(dy/.012,2))*(.25+.55*Math.max(0,ca))*(soleil?1:.8);r+=(s1[0]-r)*li*.6;g+=(s1[1]-g)*li*.6;b+=(s1[2]-b)*li*.6;
      // le soleil : halo large puis disque net ; sans soleil, la source du biome (néon) à la même place, plus douce
      // LES ÉCLATS (le scintillement) : des tronçons de lumière à bords francs, à des hauteurs de flanc / d'épaule / de toit, de longueurs irrégulières (deux fréquences
      // qui ne se recoupent jamais : rien ne se répète) — plus vifs côté soleil, comme une mer de nuages dont les crêtes accrochent la lumière ; quand la caisse
      // tourne ou tangue, ils glissent d'un pan à l'autre et la tôle brille
      const lt=Math.pow(Math.max(0,(ca+.25)/1.25),1.3),ja=.45+.55*jour;let eb=0;
      for(let n=0;n<ECL.length;n++){const E=ECL[n],m=Math.sin(az*E[2]+E[4])+.8*Math.sin(az*E[3]+E[5]);
        eb+=Math.exp(-Math.pow((dy-E[0])/(E[1]*.6),2))*Math.min(1,Math.max(0,(m-.1)/.2))*E[6];}
      // le COFFRE et le toit (vus de dos, de dessus) reflètent le ciel devant et au-dessus : un voile de ciel clair CONTINU (jamais vide, quel que soit le cap) sous les éclats
      const ci=Math.exp(-Math.pow((dy-.28)/.2,2))*(.015+.02*lt)*ja;
      eb=Math.min(1,eb*(.35+.65*lt)*ja+ci);const wr=(chaud[0]+250)/2,wg=(chaud[1]+246)/2,wb=(chaud[2]+236)/2;r+=(wr-r)*eb;g+=(wg-g)*eb;b+=(wb-b)*eb;
      const hl=Math.exp((cs-1)*(soleil?16:10))*(soleil?.3:.25),hl2=Math.exp((cs-1)*90)*(soleil?.8:.4);   // (halo resserré : large il faisait une tache sur la lunette arrière)
      const cc=soleil?chaud:clair;r+=(cc[0]-r)*Math.min(1,hl+hl2);g+=(cc[1]-g)*Math.min(1,hl+hl2);b+=(cc[2]-b)*Math.min(1,hl+hl2);
      if(soleil){const dk=Math.min(1,Math.max(0,(cs-.99935)/.0004));r+=(255-r)*dk;g+=(250-g)*dk;b+=(238-b)*dk;}
      P[q*4]=Math.min(255,r);P[q*4+1]=Math.min(255,g);P[q*4+2]=Math.min(255,b);P[q*4+3]=255;}}
  return OUT;}
/* appelé à chaque image du menu (menuVitrine) : le bon ciel peint, la bonne laque posée — sans rien refaire tant que rien ne change */
function finMenu(B){if(!FSTU.on)return;const sans=!!FSTU_SANS[carGroup.userData.shape];
  if(sans){if(FSTU.env!=='ciel')paintEnv(B.env,B.eS1,B.eS2);}else if(FSTU.env!=='menu'||FSTU.envB!==B)paintEnvMenu(B);
  if(FSTU.garage!=='menu')finLaque('menu');}
window.dbgMenuPlan=function(n){MENUV.force=n||null;return MENU_PLANS.map(q=>q.n);}; // (banc) forcer un plan du menu : 'affiche', 'arriere', 'profil' ; dbgMenuPlan() rend la main
window.dbgFinition=function(on){if(on==='mire'){const C=['#ff0000','#ff8800','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffffff'];   // (banc) la MIRE : 8 bandes de 32 px sur les murs — on lit la hauteur reflétée à la couleur
    envCvs.forEach(function(cv,f){cv.width=cv.height=256;const c=cv.getContext('2d');if(f===2){c.fillStyle='#808080';c.fillRect(0,0,256,256);return;}if(f===3){c.fillStyle='#000';c.fillRect(0,0,256,256);return;}
      for(let i=0;i<8;i++){c.fillStyle=C[i];c.fillRect(0,i*32,256,32);}});envTex.needsUpdate=true;return 'mire';}
  if(on==='etat'){let n=0,ar=0,fl=0,lq=[];carGroup.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;if(m.userData&&m.userData.arete){n++;const a=o.geometry.attributes.aArete;if(a){ar++;for(let i=0;i<a.count;i++)if(a.getX(i)+a.getY(i)+a.getZ(i)>0)fl++;}}
    if(m.userData&&m.userData.uV)lq.push(m.userData.g+':'+m.userData.uV.value.toArray().map(v=>+v.toFixed(2)).join('/'));});
  return {env:typeof envCvs!=='undefined'?envCvs[0].width:null,matsArete:n,geoArete:ar,sommetsVifs:fl,laques:lq.slice(0,6),garage:FSTU.garage};}
  if(on!=null){FSTU.on=!!on;try{if(garageOn){if(FSTU.on)paintEnvStudio();else paintEnvAtelier();}buildCar(CARS[level]);}catch(e){return String(e);}}return {on:FSTU.on,arete:finAreteOk(),garage:FSTU.garage};};
