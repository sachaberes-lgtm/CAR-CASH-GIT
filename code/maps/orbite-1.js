/* ============================================================================
   L'ORBITE : LA LUNE QUI TE REGARDE, LES STARLINK, LA LUMIÈRE DE L'ESPACE (2026-09-27, suite de la vague 3)
   Sacha : « dans le niveau dans l'espace la lune suit le joueur bizarrement, c'est un bug mais j'aime bien : mets sur la lune un
   visage inspiration troll face qui a une expression CHOQUÉE, comme s'il suivait le joueur et qu'il le regardait ; à la place des
   astéroïdes on doit mettre des satellites STARLINK et des débris de satellite, travaille-les bien, que tout soit joli ; après,
   travaille sur la lumière — essaie d'avoir une lumière SPATIALE ».
   ----------------------------------------------------------------------------
   · LA LUNE (`LUNE`) [⚠ RETIRÉE DU CIEL le 2026-10-22 : voir LUNE_ON plus bas, `?lune=ancien` la rend] : l'astre peint UNE fois (`lunePinceau` : 1024 × 512, albédo / relief / mers dans R/G/B), posé en CERCLE à
     l'écran et calculé comme une SPHÈRE dans le fragment. Sa place : le tiers haut-droit de l'image, rejoint avec RETARD — c'est ce
     qui la fait « suivre le joueur », et c'est GARDÉ tel quel (verdict : « c'est un bug mais j'aime bien »). Elle est un peu plus
     grande (LUNE_R 520 → 640) : le visage doit se lire à 60 px.
   · SON VISAGE (dans le même fragment, zéro texture de plus) : un troll dessiné à l'encre SUR la lune — deux yeux ronds écarquillés
     (le droit plus grand : la stupeur n'est jamais symétrique), des pupilles MINUSCULES qui VISENT LA CAISSE (`uOeil` : la direction
     écran lune → caisse, lissée, avec de petites saccades), des sourcils remontés, un front qui se plisse, les plis du troll du nez
     aux coins de la bouche, et une bouche BÉANTE (dents du haut, langue au fond) dont la mâchoire tremble. Toute la face TOURNE sur
     la sphère vers la caisse (~22°) : elle ne regarde pas l'écran, elle TE regarde. `uChoc` (0,5 → 1) : il s'étrangle en vol, à la
     nitro, et à fond quand tu exploses ; un clignement rare (`uCligne`). Les yeux gardent une lueur propre : sur la face de nuit,
     le regard reste là. Les traits ont une largeur MINIMUM d'un pixel (fwidth) : ils ne s'effacent jamais au loin.
   · LES STARLINK ET LES DÉBRIS (`SATS`, remplacent les astéroïdes) : trois InstancedMesh, UNE matière (`SAT_MAT`), les pièces
     d'un même objet distinguées par un attribut de sommet (`aPart` : réseau phasé, coque anodisée, CELLULES SOLAIRES en verre bleu
     nuit quadrillé, dos blanc, isolant d'OR froissé, argent, balise qui clignote, peinture blanche, bande noire, tuyère), les
     VARIANTES d'un même maillage par un attribut (`aVg`, les sommets des autres variantes sont jetés hors champ).
       [0] LES STARLINK entiers (320 faces) : une ou deux ailes (v1.5 / v2 mini), deux antennes paraboliques, un pan d'isolant d'or,
           la balise ; ce sont les PASSANTS au bord de la route, une partie du CHAMP, et les TRAINS — des files de 20 à 26 satellites
           alignés qui GLISSENT dans le ciel (mouvement dans le vertex shader, apparition/disparition en fondu aux deux bouts), leurs
           panneaux tournent en phase décalée : l'éclat du soleil COURT le long du train (le « collier de perles » de Starlink).
       [1] LES GROS DÉBRIS : satellite mort à l'aile brisée, étage de fusée (blanc, bande noire, tuyère), grand pan de panneau
           arraché, petit satellite d'or à quatre ailes — variantes EMPILÉES dans les mêmes sommets (`satEmpile`, `SAT_MAT_E`).
       [2] LES ÉCLATS : un seul prisme irrégulier (36 sommets) dont la MATIÈRE change par instance — éclat de cellule, lambeau d'or,
           tige d'argent, écaille de peinture — pour le champ lointain et les deux anneaux de débris (le syndrome de Kessler).
     Chaque panneau solaire est un MIROIR : quand il renvoie le soleil vers l'œil, il FLAMBE. `GLINT` pose une étoile à quatre
     branches (+ diagonales, + halo) sur chaque Starlink au moment de l'éclat — le « flare » des vraies photos de satellites ; elle
     partage les tampons d'instances du maillage [0] (zéro copie) et coûte 0 pixel hors éclat.
   · LA LUMIÈRE SPATIALE (tout en uniforms et positions de lumières, pondéré par `LVL.espace`, zéro recompilation) :
       – UN SEUL SOLEIL, DUR ET BLANC (`ORB.cle`) : au-dessus, sur la GAUCHE de l'image, un peu derrière l'œil — le même côté que
         celui qui éclaire la Terre et la lune (tout est éclairé du même côté). Il suit le cap de la caméra avec retard (comme la lune
         et la Terre) : la caisse est toujours modelée, flanc gauche au soleil, flanc droit dans le noir. La fenêtre d'ombre suit sa
         direction (`L_DIR`/`L_PERP`/`L_UP` dans la boucle) : l'ombre est portée par CE soleil, pas par le couchant « 1.61 » éteint.
       – PAS DE CIEL : l'hémisphère n'a plus de dessus (noir), son dessous est le BLEU DE LA TERRE (le « earthshine ») ;
       – `fill` vient DE LA TERRE (sa vraie direction, chaque image) : les ventres, le dessous de la route, les flancs bas bleuissent ;
       – `kick` devient le CLAIR DE LUNE, faible, argenté, depuis la lune ;
       – le LISERÉ des caisses (RIM) vient de la Terre, en bleu : la silhouette de la caisse s'ourle du bleu de la planète.
   ⚠ iPhone : AUCUNE lumière ajoutée (tout l'éclairage des satellites est dans le shader) ; ShaderMaterial `fog:false` ; tout est CRÉÉ
     À L'INIT, dans la scène, invisible hors orbite — compilé au menu par `chauffeDivers` : ZÉRO shader au portail. Tampons d'instances
     FIXES (réécrits par orbiteBuild, jamais réalloués), `count` à 0 et `visible=false` hors orbite. 5 appels de rendu (lune, 3
     maillages, éclats de soleil).
   Hooks : `dbgOrbite()` (comptes, visibilité, place de la lune, regard), `dbgOrbite('vue')` (objets dans l'image), `dbgOrbite('cout')`
   (appels/triangles ajoutés), `dbgOrbite('photo')` (la lune au téléobjectif), `dbgOrbite('carte')`, `dbgOrbite('sat')` (un Starlink
   posé devant la caméra, pour le juger de près).
   ========================================================================== */
const ORB={actif:false,lune:false,peinte:false,sol:new THREE.Vector3(0,1,0),haut:new THREE.Vector3(0,1,0),
  t1:new THREE.Vector3(),t2:new THREE.Vector3(),t3:new THREE.Vector3(),A:new THREE.Vector3(),M:new THREE.Matrix4(),Q:new THREE.Quaternion(),
  P:new THREE.Vector3(),S:new THREE.Vector3(),E:new THREE.Euler(),dm:new THREE.Vector3(0,0,-1),cible:new THREE.Vector3(0,0,-1),dr:new THREE.Vector3(),du:new THREE.Vector3(),capOk:false,tp:0,
  cle:new THREE.Vector3(-.55,.7,.4).normalize(),cleC:new THREE.Vector3(),cleOk:false,terre:new THREE.Vector3(0,-1,0),lumOn:false,
  oeil:new THREE.Vector2(-.5,-.8),oeilC:new THREE.Vector2(-.5,-.8),sac:new THREE.Vector2(),sacT:0,choc:.55,cligT:-9,cligProchain:4,
  pc:new THREE.Vector3(),pm:new THREE.Vector3(),rs:0x5EED1};
function orbAlea(){ORB.rs=ORB.rs*16807%2147483647;return ORB.rs/2147483647;} // le hasard du REGARD (saccades, clignements) : un flux à lui — Math.random nourrit d'autres tirages du jeu
/* LA LUNE EST SUPPRIMÉE DU CODE (2026-10-24, Sacha : « retire lune ») : plus de toile, de shader, de visage ni de pinceau (≈ 170 lignes ; l'historique git les garde). Sa DIRECTION (`ORB.dm`) continue de piloter la clé froide : voir orbiteTick. */
/* ---- LES MAILLAGES : des pièces (boîtes, cylindres, prismes) fusionnées en UN tampon, chaque sommet porte sa PIÈCE et sa VARIANTE ----
   Les normales ne sont PAS stockées : le shader les tire des dérivées (des facettes franches, comme les rochers d'avant). */
const SAT_P={ARRAY:0,COQUE:1,CELL:2,DOS:3,OR:4,ARG:5,BALISE:6,BLANC:7,NOIR:8,TUYERE:9};
function satPiece(g,part,vg,fn){ // une pièce : géométrie non indexée, sa pièce (nombre, ou tableau par FACE de 6 sommets), sa variante (-1 = toutes)
  g=g.index?g.toNonIndexed():g;if(fn)fn(g);return {g:g,part:part,vg:vg==null?-1:vg};}
function satBoite(sx,sy,sz,x,y,z,part,vg,rz,rx){ // une boîte (faces +x −x +y −y +z −z), tournée autour de z puis de x, posée en (x,y,z)
  return satPiece(new THREE.BoxGeometry(sx,sy,sz),part,vg,function(g){if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);g.translate(x,y,z);});}
function satCyl(rt,rb,h,seg,x,y,z,part,vg,ouvert,rz){ // un cylindre couché le long de x (rz = π/2 par défaut)
  return satPiece(new THREE.CylinderGeometry(rt,rb,h,seg,1,!!ouvert),part,vg,function(g){g.rotateZ(rz==null?Math.PI/2:rz);g.translate(x,y,z);});}
function satFusion(pieces){
  let n=0;for(const p of pieces)n+=p.g.attributes.position.count;
  const P=new Float32Array(n*3),U=new Float32Array(n*2),A=new Float32Array(n),G=new Float32Array(n);let o=0;
  for(const pc of pieces){const pp=pc.g.attributes.position,uu=pc.g.attributes.uv,c=pp.count;
    for(let i=0;i<c;i++){const j=o+i;P[j*3]=pp.getX(i);P[j*3+1]=pp.getY(i);P[j*3+2]=pp.getZ(i);
      U[j*2]=uu?uu.getX(i):0;U[j*2+1]=uu?uu.getY(i):0;
      A[j]=Array.isArray(pc.part)?pc.part[Math.min(pc.part.length-1,Math.floor(i/6))]:pc.part;G[j]=pc.vg;}
    o+=c;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));
  g.setAttribute('aPart',new THREE.BufferAttribute(A,1));g.setAttribute('aVg',new THREE.BufferAttribute(G,1));return g;}
/* LES VARIANTES EMPILÉES (2026-09-27, retour de la passe perf : « ~228 k sommets/image en orbite sur téléphone, c'est lourd »).
   Les gros débris portaient leurs 4 variantes BOUT À BOUT (828 sommets) et chaque instance les traitait toutes pour n'en garder
   qu'une : les trois quarts du travail jetés. Ici les variantes partagent les MÊMES sommets — chacune dans `aQ0..aQ3` (xyz + sa
   PIÈCE en w), leurs uv deux par deux (`aU01`, `aU23`) — et le vertex shader lit celle de l'instance (aVar.z) : 300 sommets par
   instance au lieu de 828, même appel de rendu. La plus courte est complétée par des sommets repliés (pièce −9). `position` ne sert
   qu'au compte des sommets. ⚠ LA LIMITE D'ATTRIBUTS : 16 en théorie (iPhone comme PC), mais MESURÉ (Chrome/ANGLE) : 15 puis 14
   attributs échouaient au lien (« Too many attributes »). Les pièces sont donc rangées en w, et ce chemin ne déclare pas les deux
   attributs de TRAIN (aMov/aTr, inutiles aux débris) : 12, de la marge partout. */
function satEmpile(pieces){
  const V=[0,1,2,3].map(v=>satFusion(pieces.filter(p=>p.vg===v))),N=Math.max(...V.map(g=>g.attributes.position.count));
  const Q=V.map(()=>new Float32Array(N*4)),U=[new Float32Array(N*4),new Float32Array(N*4)];
  V.forEach(function(g,v){const c=g.attributes.position.count,x=g.attributes.position.array,u=g.attributes.uv.array,a=g.attributes.aPart.array;
    for(let i=0;i<N;i++){Q[v][i*4+3]=i<c?a[i]:-9;if(i>=c)continue;Q[v][i*4]=x[i*3];Q[v][i*4+1]=x[i*3+1];Q[v][i*4+2]=x[i*3+2];
      const o=i*4+(v&1)*2;U[v>>1][o]=u[i*2];U[v>>1][o+1]=u[i*2+1];}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3)); // (le compte des sommets)
  for(let v=0;v<4;v++)g.setAttribute('aQ'+v,new THREE.BufferAttribute(Q[v],4));
  g.setAttribute('aU01',new THREE.BufferAttribute(U[0],4));g.setAttribute('aU23',new THREE.BufferAttribute(U[1],4));return g;}
const SAT_AILE=[SAT_P.ARG,SAT_P.ARG,SAT_P.CELL,SAT_P.DOS,SAT_P.ARG,SAT_P.ARG]; // un panneau : cellules dessus, dos blanc dessous, cadre d'argent
function geoStarlink(){ // [0] LE STARLINK : x = l'axe des ailes, y = la face des cellules ; demi-envergure ≈ 1 (variante 0 : une aile, 1 : deux)
  const P=SAT_P,C=SAT_P.COQUE,L=[];
  L.push(satBoite(.34,.056,.165,0,0,0,[C,C,P.ARRAY,C,C,C]));                         // la coque plate, le réseau phasé sur le dos
  L.push(satBoite(.075,.010,.06,.06,.033,.040,P.ARG),satBoite(.075,.010,.06,.06,.033,-.040,P.ARG)); // deux tuiles d'antenne
  L.push(satCyl(.030,.018,.022,9,-.115,.039,.042,P.ARG,-1,false,0),satCyl(.030,.018,.022,9,-.115,.039,-.042,P.ARG,-1,false,0)); // deux paraboles (des coupelles)
  L.push(satBoite(.15,.024,.11,-.05,-.040,0,P.OR));                                    // le pan d'isolant d'or sous la coque
  L.push(satBoite(.014,.014,.014,.162,.036,.072,P.BALISE));                            // la balise
  L.push(satBoite(.11,.016,.016,.215,0,0,P.ARG),satBoite(.74,.009,.26,.63,0,0,SAT_AILE)); // le mât et l'aile A
  L.push(satBoite(.11,.016,.016,-.215,0,0,P.ARG,1),satBoite(.74,.009,.26,-.63,0,0,SAT_AILE,1)); // l'aile B (v2 mini seulement)
  return satFusion(L);}
function geoDebris(){ // [1] LES GROS DÉBRIS — 0 satellite mort · 1 étage de fusée · 2 pan de panneau · 3 petit satellite d'or
  const P=SAT_P,C=P.COQUE,L=[];
  // 0 : le SATELLITE MORT — l'aile cassée en deux, pliée, l'isolant arraché qui pend
  L.push(satBoite(.34,.06,.17,0,0,0,[C,C,P.ARRAY,C,C,C],0),satBoite(.12,.03,.10,-.07,-.045,.02,P.OR,0,.3));
  L.push(satBoite(.32,.009,.26,.40,.035,0,SAT_AILE,0,.22),satBoite(.26,.009,.19,.66,.02,.03,SAT_AILE,0,-.75,.2));
  L.push(satBoite(.26,.012,.012,-.28,.03,.05,P.ARG,0,-.5));
  // 1 : L'ÉTAGE DE FUSÉE — blanc, une bande noire, la coiffe, une grosse tuyère sombre
  L.push(satCyl(.20,.20,1.05,8,.05,0,0,P.BLANC,1),satCyl(.203,.203,.14,8,.34,0,0,P.NOIR,1,true));                 // 8 pans : à l'échelle où on le voit, un cylindre (et 1/5 de sommets en moins)
  L.push(satCyl(.07,.20,.18,8,.665,0,0,P.BLANC,1,true,-Math.PI/2),satCyl(.24,.11,.34,8,-.64,0,0,P.TUYERE,1,true)); // la coiffe OUVERTE : sa base est cachée dans l'étage
  // 2 : LE PAN DE PANNEAU ARRACHÉ — deux segments encore liés par la charnière, un lambeau d'or
  L.push(satBoite(.52,.009,.27,0,0,0,SAT_AILE,2),satBoite(.40,.009,.27,.40,.10,0,SAT_AILE,2,.62),satBoite(.09,.02,.07,-.22,.01,.08,P.OR,2,.4));
  // 3 : LE PETIT SATELLITE D'OR — un cube d'isolant, quatre ailes en croix, une antenne
  L.push(satBoite(.22,.22,.22,0,0,0,P.OR,3));
  L.push(satBoite(.40,.008,.16,.33,0,0,SAT_AILE,3),satBoite(.40,.008,.16,-.33,0,0,SAT_AILE,3));
  L.push(satBoite(.16,.008,.40,0,0,.33,SAT_AILE,3,0,0),satBoite(.16,.008,.40,0,0,-.33,SAT_AILE,3));
  L.push(satCyl(.07,.012,.05,7,0,.14,0,P.ARG,3,false,0),satBoite(.012,.16,.012,.07,.19,.07,P.ARG,3));
  return satEmpile(L);}
function geoEclat(){ // [2] L'ÉCLAT : un prisme irrégulier ; dessus −1, dessous −2, tranches −3 → la MATIÈRE vient de l'instance (voir SAT_MAT)
  const b=[[-1,-.62],[.92,-.84],[.66,.74],[-.78,.9]],h=[.07,.05,.09,.06],P=[],U=[];
  const v=(i,up)=>[b[i][0],up?h[i]:-h[i]*.6,b[i][1]];
  const tri=(a,b2,c,u)=>{P.push(...a,...b2,...c);U.push(...u);};
  const uv=i=>[(b[i][0]+1)/2,(b[i][1]+1)/2];
  tri(v(0,1),v(2,1),v(1,1),[...uv(0),...uv(2),...uv(1)]);tri(v(0,1),v(3,1),v(2,1),[...uv(0),...uv(3),...uv(2)]);   // le dessus
  tri(v(0,0),v(1,0),v(2,0),[...uv(0),...uv(1),...uv(2)]);tri(v(0,0),v(2,0),v(3,0),[...uv(0),...uv(2),...uv(3)]);   // le dessous
  for(let i=0;i<4;i++){const j=(i+1)%4;tri(v(i,0),v(i,1),v(j,1),[0,0,0,1,1,1]);tri(v(i,0),v(j,1),v(j,0),[0,0,1,1,1,0]);} // les tranches
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  const A=new Float32Array(36);for(let i=0;i<36;i++)A[i]=i<6?-1:(i<12?-2:-3);
  g.setAttribute('aPart',new THREE.BufferAttribute(A,1));g.setAttribute('aVg',new THREE.BufferAttribute(new Float32Array(36).fill(-1),1));return g;}
const SAT_MAX=IS_MOBILE?[23,19,130]:[340,300,2000]; // Starlink (passants + champ + trains) · gros débris · éclats (champ + anneaux) — (2026-09-30, Sacha : « plus de satellites dans l'espace ») 120/140 → 230/190 (téléphone), 204/220 → 340/300 ; le niveau HARDCORE y prend ses obstacles EN PREMIER
const SAT_PASS=IS_MOBILE?3:44,SAT_TRAINS=IS_MOBILE?[1,2]:[5,26]; /* (2026-10-24, Sacha : « 90 % des satellites en moins », téléphone seulement : 230/190/1300, 30 passants, 3 trains de 20) */ // passants au bord de la route ; trains × satellites par train — (2026-09-30) 18/26 → 30/44 passants, 2/3 → 3/5 trains
const SAT_U={uT:{value:0},uSol:{value:ORB.cle},uTerre:{value:new THREE.Vector3(0,-1,0)},uFog:{value:new THREE.Color(0,0,0)},uOp:{value:0},uForce:{value:0}}; // uForce : (dev) tous les éclats allumés
const SAT_VS=['attribute vec4 aRot,aVar;uniform float uT;',
  'vec3 rotA(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}',
  '#ifdef EMPILE',
  'float trainOff(out vec3 off){off=vec3(0.);return 1.;}',                                    // les débris ne roulent pas en train : deux attributs de moins (voir satEmpile)
  '#else',
  'attribute vec4 aMov;attribute vec2 aTr;',
  // LE TRAIN : l'objet glisse le long de sa file (aMov = direction, vitesse ; aTr = sa place, longueur) et se replie au bout, en fondu
  'float trainOff(out vec3 off){off=vec3(0.);if(aMov.w==0.)return 1.;float u=mod(aTr.x+uT*aMov.w,aTr.y);off=aMov.xyz*(u-aTr.x);',
  '  return smoothstep(0.,.08*aTr.y,u)*smoothstep(aTr.y,.92*aTr.y,u);}',
  '#endif'].join('\n');
const SAT_MAT=new THREE.ShaderMaterial({fog:false,extensions:{derivatives:true},uniforms:SAT_U,
  vertexShader:[SAT_VS,
    '#ifdef EMPILE',
    'attribute vec4 aQ0,aQ1,aQ2,aQ3,aU01,aU23;',
    '#else',
    'attribute float aPart,aVg;',
    '#endif',
    'varying vec3 vVP,vLoc;varying vec2 vUv;varying float vPart,vTon,vPh,vDg;',
    'void main(){',
    '  vec3 off;float sc=trainOff(off),m=aVar.z;vDg=aVar.w;',                                         // (2026-09-30) vDg : 1 = un OBSTACLE sur la route (niveau hardcore)
    '#ifdef EMPILE',                                                                                // les variantes EMPILÉES : l instance lit la sienne
    '  vec4 q=m<.5?aQ0:(m<1.5?aQ1:(m<2.5?aQ2:aQ3));vec3 pos=q.xyz;float pt=q.w;if(pt<-.5)sc=0.;',    // −9 : le bourrage de la variante la plus courte
    '  vec2 uvv=m<.5?aU01.xy:(m<1.5?aU01.zw:(m<2.5?aU23.xy:aU23.zw));',
    '#else',
    '  vec3 pos=position;vec2 uvv=uv;float pt=aPart;if(aVg>-.5&&abs(aVg-m)>.5)sc=0.;',              // les sommets des AUTRES variantes : repliés
    '  if(pt<-.5)pt=m<.5?(pt>-1.5?2.:(pt>-2.5?3.:5.)):(m<1.5?4.:(m<2.5?5.:7.));',                  // l ÉCLAT : sa matière vient de l instance
    '#endif',
    '  vec3 l=rotA(mat3(instanceMatrix)*pos*sc,aRot.xyz,aVar.y+uT*aRot.w);',                       // la ROTATION PROPRE, après l échelle
    '  vec4 mv=modelViewMatrix*vec4(l+instanceMatrix[3].xyz+off,1.);vVP=mv.xyz;vLoc=pos;vUv=uvv;vTon=aVar.x;vPh=aVar.y;vPart=pt;',
    '  gl_Position=sc>0.?projectionMatrix*mv:vec4(0.,0.,2.,1.);}'].join('\n'),
  fragmentShader:['uniform vec3 uSol,uTerre,uFog;uniform float uOp,uT;varying vec3 vVP,vLoc;varying vec2 vUv;varying float vPart,vTon,vPh,vDg;',
    // CE QUE VOIT UN MIROIR DANS L ESPACE : le noir, la Terre en dessous (bleue), le fil lumineux de son atmosphère à l horizon
    'vec3 h3(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}',
    'vec3 envE(vec3 R){float e=dot(R,uTerre);return mix(vec3(.003,.004,.010),vec3(.035,.09,.24),smoothstep(.30,.95,e))+vec3(.12,.26,.55)*exp(-abs(e-.22)*10.)*.30;}',
    'void main(){',
    '  vec3 Nv=normalize(cross(dFdx(vVP),dFdy(vVP)));mat3 iv=mat3(viewMatrix);',
    '  vec3 N=normalize(Nv*iv),V=normalize(-vVP)*iv;',                                                 // la FACETTE et l oeil, ramenés dans le monde
    '  float p=floor(vPart+.5);vec3 alb=vec3(.42,.43,.46),emi=vec3(0.);float ks=.5,sh=30.,met=.45,rf=.10,gl=0.;',  // par défaut : la COQUE, aluminium anodisé
    '  if(p==0.){vec2 g=abs(fract(vUv*vec2(7.,4.))-.5);float t9=smoothstep(.45,.49,max(g.x,g.y));alb=mix(vec3(.10,.105,.12),vec3(.30,.31,.34),t9);ks=.6;sh=40.;met=.3;rf=.08;}', // le RÉSEAU PHASÉ : des tuiles de graphite serties d argent
    '  else if(p==2.){vec2 g=abs(fract(vUv*vec2(34.,9.))-.5);float ln=smoothstep(.44,.495,max(g.x,g.y)),sg=smoothstep(.46,.5,abs(fract(vUv.x*6.)-.5));gl=1.-max(ln*.6,sg);', // les CELLULES : du VERRE bleu nuit, quadrillé d argent
    '    alb=mix(vec3(.012,.020,.075),vec3(.30,.33,.40),max(ln*.42,sg*.85));ks=1.4*gl+.3;sh=240.;met=0.;rf=.10+.35*gl;}',
    '  else if(p==3.){alb=vec3(.80,.79,.76);ks=.18;sh=14.;met=0.;rf=0.;}',                                // le dos des panneaux : blanc
    '  else if(p==4.){vec3 q=mat3(.8,.36,-.48,-.6,.48,-.64,0.,.8,.6)*vLoc*60.+vPh*3.;N=normalize(N+.55*(h3(floor(q))-.5)+.30*(h3(floor(q*2.3+7.))-.5));', // l OR froissé : des FACETTES au hasard, chacune son reflet
    '    alb=vec3(1.,.72,.26);ks=2.4;sh=60.;met=1.;rf=.55;}',
    '  else if(p==5.){alb=vec3(.84,.86,.90);ks=1.;sh=70.;met=.8;rf=.35;}',                               // l argent
    '  else if(p==6.){float b=step(.93,fract(uT*(vDg>.5?2.4:.55)+vPh*.16));alb=vec3(.2);emi=mix(vec3(1.,.10,.06),vec3(.12,1.,.35),step(.5,fract(vPh)))*(.35+6.*b);}', // la BALISE : un éclair toutes les 2 s
    '  else if(p==7.){alb=vec3(.66,.67,.69);ks=.35;sh=30.;met=0.;rf=.03;}',                              // la peinture blanche de l étage
    '  else if(p==8.){alb=vec3(.035,.035,.045);ks=.5;sh=40.;met=0.;rf=.05;}',
    '  else if(p==9.){alb=vec3(.24,.20,.17);ks=.8;sh=35.;met=.6;rf=.2;}',                                // la tuyère : métal brûlé
    '  alb*=.86+.28*vTon;',
    '  float d=dot(N,uSol),dif=max(d,0.),w=clamp(d*.6+.4,0.,1.),fr=pow(1.-max(dot(N,V),0.),5.);',
    '  vec3 H=normalize(uSol+V),sunC=vec3(1.,.97,.92),tint=mix(vec3(1.),alb,met);',
    '  float sp=pow(max(dot(N,H),0.),sh)*ks*(sh+8.)/32.*step(0.,d);',
    '  vec3 col=alb*sunC*dif*1.75*(1.-met*.65);',                                                          // UN soleil, dur, blanc
    '  col+=tint*sunC*sp*1.5;',                                                                             // son reflet : blanc sur le verre, doré sur l or
    '  col+=envE(reflect(-V,N))*tint*(rf+(1.-rf)*fr*max(rf*2.,gl))*2.2;',                                 // le verre et le métal REFLÈTENT l espace et la Terre
    '  col+=alb*vec3(.26,.40,.72)*max(dot(N,uTerre),0.)*.30*(1.-met*.5);',                                  // la Terre éclaire par-dessous (un bleu doux, pas un aplat)
    '  col+=alb*met*vec3(.10,.07,.03)*(1.-dif);',                                                         // l or garde sa couleur dans l ombre
    '  col+=vec3(.11,.016,.19)*(1.-w)*.22;',                                                                // l ombre à l ENCRE
    '  col+=vec3(1.,.92,.78)*pow(1.-max(dot(Nv,normalize(-vVP)),0.),3.)*.14*smoothstep(-.2,.5,d);',        // le liseré côté soleil
    '  col+=emi;',
    '  if(vDg>.5){float fz=pow(1.-max(dot(Nv,normalize(-vVP)),0.),2.);col+=vec3(1.,.28,.10)*(.30+1.3*fz)*(.65+.35*sin(uT*6.+vPh*3.));col+=alb*.45;}', // (2026-09-30) L OBSTACLE se lit dans le noir : liseré rouge qui pulse, coque éclaircie
    '  col=mix(col,uFog,smoothstep(1800.,7500.,length(vVP)));',                                             // le lointain se noie dans le noir bleuté
    '  gl_FragColor=vec4(mix(uFog,col,uOp),1.);}'].join('\n')});
const SAT_MAT_E=new THREE.ShaderMaterial({fog:false,extensions:{derivatives:true},uniforms:SAT_U,defines:{EMPILE:''}, // les gros débris : le même code, chemin des variantes EMPILÉES
  vertexShader:SAT_MAT.vertexShader,fragmentShader:SAT_MAT.fragmentShader});
const SATS=[geoStarlink(),geoDebris(),geoEclat()].map(function(g,k){
  const N=SAT_MAX[k];
  g.setAttribute('aRot',new THREE.InstancedBufferAttribute(new Float32Array(N*4),4));
  g.setAttribute('aVar',new THREE.InstancedBufferAttribute(new Float32Array(N*4),4));
  g.setAttribute('aMov',new THREE.InstancedBufferAttribute(new Float32Array(N*4),4));   // ⚠ PRÉSENT PARTOUT (à zéro hors des trains) : un attribut absent vaut (0,0,0,1) — une vitesse de 1
  g.setAttribute('aTr',new THREE.InstancedBufferAttribute(new Float32Array(N*2).fill(1),2));
  const im=new THREE.InstancedMesh(g,k===1?SAT_MAT_E:SAT_MAT,N);im.count=0;im.visible=false;im.frustumCulled=false; // un champ de plusieurs km : le culling par objet n'a pas de sens
  scene.add(im);return im;});
/* L'ÉCLAT DU SOLEIL SUR LES PANNEAUX — une étoile par Starlink, qui ne vit QUE pendant le reflet (sinon le sommet est jeté hors champ :
   zéro pixel). Le quad partage les tampons d'instances du maillage [0] (matrices, rotation propre, trains) : il suit son satellite. */
/* GLINT RETIRÉ (2026-10-24, Sacha : « enlève glint et flare ») : l'étoile à quatre branches sur chaque Starlink n'existe plus ; l'objet reste, vide, pour les lignes qui posent `count`/`visible`. */
const GLINT={count:0,visible:false};
