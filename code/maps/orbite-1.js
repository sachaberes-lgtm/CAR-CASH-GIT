/* ============================================================================
   L'ORBITE : LA LUNE QUI TE REGARDE, LES STARLINK, LA LUMIÈRE DE L'ESPACE (2026-09-27, suite de la vague 3)
   Sacha : « dans le niveau dans l'espace la lune suit le joueur bizarrement, c'est un bug mais j'aime bien : mets sur la lune un
   visage inspiration troll face qui a une expression CHOQUÉE, comme s'il suivait le joueur et qu'il le regardait ; à la place des
   astéroïdes on doit mettre des satellites STARLINK et des débris de satellite, travaille-les bien, que tout soit joli ; après,
   travaille sur la lumière — essaie d'avoir une lumière SPATIALE ».
   ----------------------------------------------------------------------------
   · LA LUNE (`LUNE`) : l'astre peint UNE fois (`lunePinceau` : 1024 × 512, albédo / relief / mers dans R/G/B), posé en CERCLE à
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
const LUNE_D=3000,LUNE_R=640; // à 3 km, ~24° de diamètre (sa place dans le cadre : voir orbiteTick) — 520 → 640 : le visage doit se lire
const LUNE=(function(){
  const cv=document.createElement('canvas');cv.width=1024;cv.height=512;
  const tex=new THREE.CanvasTexture(cv); // mipmaps (défaut) : la couture est sur la face cachée, jamais à l'écran
  /* ⚠ UN CERCLE À L'ÉCRAN, PAS UNE SPHÈRE EN PERSPECTIVE (mesuré : un ŒUF). La caméra de poursuite plonge de ~50° avec un champ de
     ~130° : à 45° de l'axe, la projection plane étire tout objet de ×1,4 vers le bord — une vraie sphère y devient ovale. Le quad est
     donc posé en ESPACE ÉCRAN autour du centre projeté, à la taille angulaire qu'elle aurait au centre de l'image : ronde partout.
     Le repère d'ombrage (vSol, vTer) est celui de l'écran, calculé ici depuis viewMatrix (exact à l'image près), et `vRo` tourne la
     carte pour qu'elle suive l'horizon du MONDE (la caméra vrille en vol : la lune ne vrille pas avec elle — son visage non plus). */
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,extensions:{derivatives:true},
    uniforms:{uTex:{value:tex},uC:{value:new THREE.Vector3()},uA:{value:new THREE.Vector3(0,0,-1)},uAng:{value:Math.tan(Math.asin(LUNE_R/LUNE_D))},
      uSol:{value:new THREE.Vector3(0,1,0)},uTerre:{value:new THREE.Vector3(0,-1,0)},uLib:{value:0},uOp:{value:0},
      uOeil:{value:new THREE.Vector2(-.5,-.8)},uChoc:{value:.55},uCligne:{value:0},uT:{value:0}},
    vertexShader:['uniform vec3 uC,uA,uSol,uTerre;uniform float uAng;varying vec2 vQ,vRo;varying vec3 vSol,vTer;',
      'void main(){vQ=position.xy*1.04;', // un poil plus grand que le disque : la frange d anticrénelage y tient
      '  vec4 cc=projectionMatrix*viewMatrix*vec4(uC,1.);',
      '  vec3 W=-uA,cr=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);',          // la droite de l ÉCRAN, dans le monde
      '  vec3 U=normalize(cr-W*dot(cr,W)+vec3(1e-5)),V=cross(W,U);',
      '  vSol=vec3(dot(uSol,U),dot(uSol,V),dot(uSol,W));vTer=vec3(dot(uTerre,U),dot(uTerre,V),dot(uTerre,W));',
      '  vec3 Ut=normalize(cross(uA,vec3(0.,1.,0.))),Vt=cross(Ut,uA);vRo=vec2(dot(U,Ut),dot(U,Vt));', // le roulis écran → monde
      '  gl_Position=cc+vec4(vQ.x*uAng*projectionMatrix[0][0],vQ.y*uAng*projectionMatrix[1][1],0.,0.)*cc.w;gl_Position.z=gl_Position.w;}'].join('\n'), // le plan lointain, comme le dôme et la Terre
    fragmentShader:['uniform sampler2D uTex;uniform float uLib,uOp,uChoc,uCligne,uT;uniform vec2 uOeil;varying vec2 vQ,vRo;varying vec3 vSol,vTer;',
      'vec3 ro(vec3 v){return vec3(v.x*vRo.x-v.y*vRo.y,v.x*vRo.y+v.y*vRo.x,v.z);}',             // écran → carte (l horizon du monde)
      /* LE VISAGE — des distances signées : ellipses (yeux, pupilles, bouche, langue) et ARCS (sourcils, rides, plis) dont le trait
         s effile vers les bouts, comme un coup de pinceau. f = la face vue de face, en rayons de lune ; y en haut. */
      'float trait(float d,float w,float aa){return 1.-smoothstep(w-aa,w+aa,d);}',
      'float ell(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}',
      'float arcD(vec2 p,vec2 c,float R,float am,float hw,out float tp){',                          // centre, rayon, angle du milieu, demi-ouverture
      '  vec2 q=p-c;float cs=cos(am),sn=sin(am);q=vec2(q.x*cs+q.y*sn,-q.x*sn+q.y*cs);',
      '  float a=atan(q.y,q.x);tp=clamp(abs(a)/hw,0.,1.);',
      '  if(abs(a)<hw)return abs(length(q)-R);',
      '  return length(q-R*vec2(cos(hw),sign(a)*sin(hw)));}',
      'void visage(vec2 f,vec2 oe,float aa,out float ink,out float blanc,out float noir,out float dent,out float lang,out float refl){',
      '  float s=uChoc,lw=max(.022,aa*1.05),tp;ink=0.;blanc=0.;noir=0.;dent=0.;lang=0.;refl=0.;',
      '  for(int i=0;i<2;i++){float sg=i==0?-1.:1.;',                                                 // LES YEUX, écarquillés
      '    vec2 c=vec2(.29*sg,.21+.012*sg),r=vec2(i==0?.150:.172,(i==0?.162:.186)+.04*s);',
      '    r.y*=max(.07,1.-uCligne);',                                                                 // la paupière qui tombe
      '    float d=ell(f-c,r),dans=1.-smoothstep(-aa,aa,d);blanc=max(blanc,dans);',
      '    ink=max(ink,trait(abs(d),lw*1.3,aa));',
      '    float pr=max(.060-.010*s,aa*1.6);vec2 pc=c+oe*max(r-vec2(pr+.018),vec2(0.));',                  // la PUPILLE : petite (le choc) mais jamais sous ~3 px — c est ELLE qui dit « je te regarde » ; elle vise la caisse
      '    noir=max(noir,(1.-smoothstep(pr-aa,pr+aa,length(f-pc)))*dans);',
      '    refl=max(refl,(1.-smoothstep(.013-aa,.013+aa,length(f-pc-vec2(-.017,.019))))*dans);',       // l étincelle dans l oeil
      '    ink=max(ink,trait(arcD(f,c+vec2(0.,.22),.44,-1.5708+.06*sg,.30,tp),lw*.75*(1.-tp*.8),aa));', // la POCHE sous l oeil (la signature du troll)
      '    ink=max(ink,trait(arcD(f,c+vec2(.030*sg,.07+.08*s),r.x*1.62,1.5708-.20*sg,.62,tp),lw*1.55*(1.-tp*.75),aa));}', // le SOURCIL, remonté par la stupeur — le bout INTÉRIEUR plus haut (sinon il a l air fâché)
      '  for(int i=0;i<3;i++){float fi=float(i);',                                                   // LE FRONT QUI SE PLISSE
      '    float d=arcD(f,vec2(0.,-.30),.93+.075*fi,1.5708,.34-.05*fi,tp)+.009*sin(f.x*21.+fi*2.1);',
      '    ink=max(ink,trait(d,lw*.8*(1.-tp*.85),aa)*(.35+.65*s));}',
      '  ink=max(ink,trait(arcD(f,vec2(.02,.0),.075,-1.25,1.15,tp),lw*.95*(1.-tp*.6),aa));',          // LE NEZ en crochet
      '  ink=max(ink,trait(arcD(f,vec2(-.03,-.30),.40,2.70,.60,tp),lw*.95*(1.-tp*.8),aa));',          // LES PLIS du nez aux coins de la bouche
      '  ink=max(ink,trait(arcD(f,vec2(.03,-.30),.40,.44,.60,tp),lw*.95*(1.-tp*.8),aa));',
      '  float tr=.007*sin(uT*31.)*s;',                                                              // LA BOUCHE BÉANTE — la mâchoire tremble
      '  vec2 mc=vec2(0.,-.41-.04*s),mr=vec2(.24+.05*s,.13+.12*s+tr),mp=f-mc;',
      '  mp.x*=1.+.24*clamp(-mp.y/mr.y,-1.,1.);',                                                   // plus large en haut : une bouche qui s effondre
      '  float md=ell(mp,mr),mi=1.-smoothstep(-aa,aa,md);noir=max(noir,mi);',
      '  ink=max(ink,trait(abs(md),lw*1.35,aa));',
      '  float bd=smoothstep(mc.y+mr.y-.078-aa,mc.y+mr.y-.078+aa,f.y)*mi;',                          // les DENTS du haut
      '  dent=bd*(1.-trait(abs(fract((f.x+.5)/.068)-.5)*.068,lw*.45,aa));',
      '  lang=(1.-smoothstep(-aa,aa,ell(f-vec2(0.,mc.y-mr.y+.065),vec2(mr.x*.55,.07))))*mi*(1.-bd);',  // la LANGUE au fond
      '  ink=max(ink,trait(arcD(f,vec2(0.,-.40),.40+.05*s,-1.5708,.40,tp),lw*.8*(1.-tp*.8),aa));',   // LE MENTON, deux plis
      '  ink=max(ink,trait(arcD(f,vec2(0.,-.47),.42+.05*s,-1.5708,.24,tp),lw*.7*(1.-tp*.8),aa));}',
      'void main(){',
      '  float r=length(vQ),al=clamp((1.-r)/max(fwidth(r),1e-4)+.5,0.,1.)*uOp;if(al<=0.)discard;',
      '  vec2 q=vQ/max(r,1.);vec3 N=ro(vec3(q,sqrt(max(0.,1.-dot(q,q))))),S=ro(vSol),Te=ro(vTer);',  // la sphère : x à droite, y en haut, z vers l oeil
      '  float la=asin(clamp(N.y,-1.,1.)),lo=atan(N.x,N.z)+uLib;vec2 uv=vec2(lo/6.2831853+.5,la/3.1415927+.5);',
      '  vec3 tx=texture2D(uTex,uv).rgb;',                                                               // R albédo, G relief, B mers
      '  float hE=texture2D(uTex,uv+vec2(.0015,0.)).g-texture2D(uTex,uv-vec2(.0015,0.)).g,hN=texture2D(uTex,uv+vec2(0.,.003)).g-texture2D(uTex,uv-vec2(0.,.003)).g;',
      '  vec3 E=normalize(vec3(N.z,0.,-N.x)+vec3(1e-5,0.,0.)),No=cross(N,E);',
      '  vec3 Nb=normalize(N-(E*hE/max(cos(la),.3)+No*hN)*1.8);',                                        // LE RELIEF : les cratères prennent la lumière rasante
      '  float d0=dot(N,S),d=dot(Nb,S),lam=max(d,0.),ls=lam/(lam+max(N.z,.08));',
      '  float dif=mix(lam,ls*1.7,.4)*smoothstep(-.06,.10,d0);',                                          // terminateur net mais pas tranché
      '  vec3 alb=tx.r*mix(vec3(1.02,.95,.86),vec3(.70,.77,.95),tx.b);',                                 // hautes terres crème, mers ardoise bleutée
      // LE VISAGE : la face vise la caisse (elle tourne de ~22° sur la sphère), les traits se posent dans SON repère
      '  vec2 oe=ro(vec3(uOeil,0.)).xy;vec3 F=normalize(vec3(oe*.40,1.)),Fu=normalize(cross(vec3(0.,1.,0.),F)),Fv=cross(F,Fu);',
      '  float fz=dot(N,F),fm=smoothstep(.02,.30,fz);vec2 f=vec2(dot(N,Fu),dot(N,Fv))/.88;',
      '  float aa=(abs(dFdx(f.x))+abs(dFdy(f.x))+abs(dFdx(f.y))+abs(dFdy(f.y)))*.5+1e-4;',
      '  float ink,blanc,noir,dent,lang,refl;visage(f,oe,aa,ink,blanc,noir,dent,lang,refl);',
      '  alb=mix(alb,vec3(dot(alb,vec3(.333)))*vec3(1.03,.98,.90),.38*fm);',                           // sous le visage la lune se lisse un peu : les traits passent devant les mers
      '  vec3 col=alb*vec3(1.,.96,.90)*dif*1.45;',
      '  float nuit=1.-smoothstep(-.12,.16,d0);',
      '  col+=alb*vec3(.30,.55,1.)*(.30+.70*max(dot(Nb,Te),0.))*.34*nuit;',                              // le CLAIR DE TERRE : la face de nuit se lit, bleutée, mers comprises
      '  col+=vec3(.11,.016,.19)*.20*nuit;',                                                             // l ombre à l ENCRE
      '  float lum=dif*1.25+.10+.25*nuit;',                                                               // ce que voient les yeux : le soleil, et la Terre la nuit
      '  vec3 cB=vec3(1.,.97,.90)*(dif*1.35+.42);',                                                       // le BLANC DES YEUX garde une lueur propre : le regard ne s éteint jamais
      '  col=mix(col,cB,blanc*fm);',
      '  col=mix(col,vec3(.030,.010,.030)*(.4+lum),noir*fm);',                                           // pupilles et gorge : le noir
      '  col=mix(col,vec3(.96,.93,.84)*(lum*1.1+.22),dent*fm);',
      '  col=mix(col,vec3(.62,.16,.20)*(lum+.18),lang*fm);',
      '  col=mix(col,vec3(1.3,1.25,1.15),refl*fm);',                                                     // l étincelle
      '  col=mix(col,vec3(.035,.025,.055)*(.5+lum*.6),ink*fm*.94);',                                     // l ENCRE du dessin
      '  float rim=pow(1.-N.z,4.);',
      '  col+=vec3(1.,.90,.70)*rim*.40*smoothstep(.0,.35,d0)+vec3(.35,.62,1.)*rim*.12*nuit;',             // le LISERÉ : doré côté jour, bleu Terre côté nuit
      '  gl_FragColor=vec4(col,al);}'].join('\n')});
  const me=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m);
  me.frustumCulled=false;me.matrixAutoUpdate=false;me.visible=false;me.renderOrder=-9; // transparent, avant le limbe et le halo de la Terre
  me.userData.cv=cv;me.userData.tex=tex;scene.add(me);return me;
})();
/* LA CARTE DE LA LUNE — 1024 × 512, équirectangulaire, peinte UNE fois au menu. ⚠ MESURÉ d'une traite : 140 ms (PC) — une image
   gelée au menu, bien pire sur iPhone. Le pinceau est donc un GÉNÉRATEUR : une étape par image au menu (`luneAvance`, appelé par la
   boucle via orbiteTick), chacune de quelques ms ; les toiles de travail restent en mémoire CPU (`willReadFrequently` : les relire
   n'est plus un aller-retour GPU). `lunePeint()` finit d'une traite si on en a besoin tout de suite (orbite atteinte avant la fin). */
function lunePeint(){if(ORB.peinte)return;if(!ORB.pinceau)ORB.pinceau=lunePinceau();while(!ORB.pinceau.next().done){}ORB.pinceau=null;}
function luneAvance(){ // une étape du pinceau (au menu) ; la dernière monte la carte au GPU
  if(ORB.peinte)return;if(!ORB.pinceau)ORB.pinceau=lunePinceau();
  const t0=performance.now(),fin=ORB.pinceau.next().done;ORB.pireMs=Math.max(ORB.pireMs|0,Math.round(performance.now()-t0));
  if(fin){renderer.initTexture(LUNE.userData.tex);ORB.pinceau=null;} // (2026-10-14, passe perf mobile) le générateur fini ne retient plus ses toiles ni ses tableaux
}
function* lunePinceau(){
  const W=1024,H=512,R=mulberry32(0x1C0430),D=Math.PI/180;
  const toile=f=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle=f;x.fillRect(0,0,W,H);return x;};
  const xa=toile('#a8a8a8'),xh=toile('#808080'),xm=toile('#000'); // albédo · relief · masque des mers
  yield;
  // LES TAMPONS : un profil radial signé (f > 0 = blanc, f < 0 = noir, alpha = |f|), peint UNE fois en pixels puis posé à l'échelle
  const tampon=f=>{const S=96,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),im=x.createImageData(S,S),d=im.data;
    for(let j=0;j<S;j++)for(let i=0;i<S;i++){const q=f(Math.hypot((i+.5)/S*2-1,(j+.5)/S*2-1)*1.6),o=(j*S+i)*4; // le tampon couvre 1,6 rayon de cratère
      d[o]=d[o+1]=d[o+2]=q>0?255:0;d[o+3]=Math.min(255,Math.abs(q)*255);}
    x.putImageData(im,0,0);return c;};
  const g=(d,c,w)=>Math.exp(-((d-c)/w)*((d-c)/w));
  const tBol=tampon(d=>(d<.9?-.62*(1-(d/.9)*(d/.9)):0)+.55*g(d,.97,.11)+.12*g(d,1.22,.25));                     // petit cratère : un bol, une lèvre
  const tCplx=tampon(d=>(d<.86?-.48*(1-Math.pow(d/.86,6)):0)+.55*g(d,.96,.09)+.52*g(d,0,.14)+.10*g(d,1.2,.3));   // grand : fond plat, pic central
  const tAlb=tampon(d=>(d<.84?-.14:0)+.46*g(d,.95,.10)+.12*g(d,1.18,.30));                                       // fond un peu sombre, BORD CLAIR, éjectas
  const tBlanc=tampon(d=>Math.exp(-d*d*1.6)),tNoir=tampon(d=>-Math.exp(-d*d*1.6));                              // taches douces
  yield;
  const pose=(x,c,lon,lat,ar,a)=>{const X=(lon/360+.5)*W,Y=(.5-lat/180)*H,ry=ar/180*H*1.6,rx=ry/Math.max(.2,Math.cos(lat*D));
    x.globalAlpha=a;for(const ox of [0,-W,W]){const X9=X+ox;if(X9+rx>0&&X9-rx<W)x.drawImage(c,X9-rx,Y-ry,rx*2,ry*2);}x.globalAlpha=1;};
  // LE GRAIN DES HAUTES TERRES
  for(let i=0;i<700;i++){const lo=R()*360-180,la=Math.asin(R()*2-1)/D,ar=1+R()*R()*9;pose(xa,R()<.5?tBlanc:tNoir,lo,la,ar,.05+R()*.08);}
  yield;
  /* LES MERS — la vraie face visible, stylisée (longitude + = à droite vu de chez nous) : Imbrium, Procellarum, Serenitatis,
     Tranquillitatis, Crisium, Fecunditatis, Nectaris, Nubium, Humorum, Frigoris, Vaporum, Cognitum — [lon, lat, rayon].
     Un CHAMP (somme de bosses douces sur la sphère) troublé par un bruit fractal 3D (sans couture), seuillé : des côtes
     déchiquetées qui se rejoignent, pas des taches rondes. Calculé en 256 × 128 puis agrandi (lissé par le canvas). */
  const MERS=[[-16,34,14],[-55,25,13],[-62,8,12],[-45,-5,9],[-50,40,9],[17,28,9],[30,8,10],[22,3,6],[59,17,7],[50,-5,8],[34,-15,5.5],
    [-17,-20,9],[-5,-25,6],[-39,-24,5.5],[-20,56,5],[5,57,5],[-40,55,4.5],[25,55,4],[4,13,5],[-25,-8,7],[-28,8,7]].map(m9=>{const lo=m9[0]*D,la=m9[1]*D;
      return [Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo),1/((m9[2]*D)*(m9[2]*D))];});
  const hs=(x,y,z)=>{let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(z,1274126177)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
  const vn=(x,y,z)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf),l=(a,b2,t)=>a+(b2-a)*t;
    return l(l(l(hs(xi,yi,zi),hs(xi+1,yi,zi),u),l(hs(xi,yi+1,zi),hs(xi+1,yi+1,zi),u),v),l(l(hs(xi,yi,zi+1),hs(xi+1,yi,zi+1),u),l(hs(xi,yi+1,zi+1),hs(xi+1,yi+1,zi+1),u),v),w);};
  const MW=256,MH=128,mf=new Float32Array(MW*MH),cm=document.createElement('canvas');cm.width=MW;cm.height=MH;const xcm=cm.getContext('2d'),imM=xcm.createImageData(MW,MH);
  for(let j=0;j<MH;j++){if(j&&!(j%16))yield;for(let i=0;i<MW;i++){const lo=((i+.5)/MW-.5)*6.2832,la=(.5-(j+.5)/MH)*3.1416,x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);
    let f=0;for(const m9 of MERS){const dx=x-m9[0],dy=y-m9[1],dz=z-m9[2];f+=Math.exp(-(dx*dx+dy*dy+dz*dz)*m9[3]*.9);}
    let n9=0,a9=.5,q=3.2;for(let o=0;o<4;o++){n9+=a9*vn(x*q+7.1,y*q+3.3,z*q+1.9);q*=2.07;a9*=.5;}
    const t=Math.max(0,Math.min(1,(f+(n9-.47)*1.1-.40)/.16)),m=t*t*(3-2*t);mf[j*MW+i]=m;
    const n2=vn(x*9+2.7,y*9+8.1,z*9+5.3)*.6+vn(x*19,y*19,z*19)*.4; // les mers ne sont pas des aplats : des coulées plus ou moins sombres
    const o=(j*MW+i)*4;imM.data[o]=imM.data[o+1]=imM.data[o+2]=Math.round(m*(.62+.38*n2)*255);imM.data[o+3]=255;}}
  xcm.putImageData(imM,0,0);xm.imageSmoothingEnabled=true;xm.drawImage(cm,0,0,W,H);
  yield;
  const mer=(lo,la)=>mf[Math.min(MH-1,Math.max(0,Math.floor((.5-la/180)*MH)))*MW+Math.min(MW-1,Math.max(0,Math.floor((lo/360+.5)*MW)))]>.5;
  // LES CRATÈRES : loi de puissance (beaucoup de petits, peu de gros), rares dans les mers (elles sont plus jeunes)
  for(let i=0;i<1900;i++){if(i&&!(i%200))yield;const lo=R()*230-115,la=Math.asin(R()*1.96-.98)/D,ar=Math.min(5,.5*Math.pow(1-R()*.995,-1/1.7));
    if(mer(lo,la)&&R()<.8)continue;const jeune=R()<.3; // les JEUNES sont nets et clairs ; les vieux, émoussés, se devinent (sinon : un semis de bulles toutes pareilles)
    pose(xh,ar>2.2?tCplx:tBol,lo,la,ar,jeune?.75+R()*.2:.18+R()*.25);pose(xa,tAlb,lo,la,ar,jeune?.55:.12);}
  // LES CRATÈRES QU'ON NOMME — Copernic, Tycho, Kepler, Aristarque, Platon (fond sombre), Clavius, Ptolémée, Langrenus, Théophile
  const NOMS=[[-20,10,2.6,1,9],[-11,-43,2.1,1,12],[-38,8,1.3,1,7],[-47,24,1,1,5],[-9,51,2,-1,0],[-14,-58,3.6,0,0],[-2,-9,3,0,0],[61,-9,2.5,0,0],[26,-11,1.8,0,0]];
  for(const c9 of NOMS){yield;pose(xh,tCplx,c9[0],c9[1],c9[2],.95);pose(xa,c9[3]<0?tNoir:tAlb,c9[0],c9[1],c9[2]*(c9[3]<0?.8:1),c9[3]<0?.55:.85);
    if(c9[3]>0){pose(xa,tBlanc,c9[0],c9[1],c9[2]*1.4,.35); // l'auréole d'éjectas
      const X=(c9[0]/360+.5)*W,Y=(.5-c9[1]/180)*H,px=c9[2]/180*H;
      for(let k=0;k<c9[4];k++){const a9=R()*6.283,Lr=px*(4+R()*7),gr=xa.createLinearGradient(0,0,Lr,0); // les RAIS : des traînées claires qui filent loin du cratère
        gr.addColorStop(0,'rgba(255,255,255,.32)');gr.addColorStop(1,'rgba(255,255,255,0)');
        xa.save();xa.translate(X,Y);xa.scale(1/Math.max(.3,Math.cos(c9[1]*D)),1);xa.rotate(a9);xa.fillStyle=gr;
        xa.beginPath();xa.moveTo(px*.8,-px*.18);xa.lineTo(Lr,-px*.04);xa.lineTo(Lr,px*.04);xa.lineTo(px*.8,px*.18);xa.fill();xa.restore();}}}
  yield;
  const A9=xa.getImageData(0,0,W,H).data;yield;const H9=xh.getImageData(0,0,W,H).data;yield;const M9=xm.getImageData(0,0,W,H).data;yield;
  const out=LUNE.userData.cv.getContext('2d'),im=out.createImageData(W,H),o=im.data;
  for(let i=0;i<o.length;i+=4){if(i&&!(i%524288))yield;const m=M9[i]/255;o[i]=A9[i]*(1-.36*m);o[i+1]=H9[i]-m*9;o[i+2]=M9[i];o[i+3]=255;} // les mers : plus sombres, un peu plus basses (en 4 fois)
  yield;
  out.putImageData(im,0,0);LUNE.userData.tex.needsUpdate=true;ORB.peinte=true;
  toileRend(xa.canvas);toileRend(xh.canvas);toileRend(xm.canvas);toileRend(cm);texLibere(LUNE.userData.tex); // (2026-10-14, passe perf mobile) les 3 toiles de travail 1024 × 512 (6,3 Mo, pour tous) + la carte finie (2 Mo, paliers 0-1) : peinte UNE fois
}
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
const SAT_MAX=IS_MOBILE?[230,190,1300]:[340,300,2000]; // Starlink (passants + champ + trains) · gros débris · éclats (champ + anneaux) — (2026-09-30, Sacha : « plus de satellites dans l'espace ») 120/140 → 230/190 (téléphone), 204/220 → 340/300 ; le niveau HARDCORE y prend ses obstacles EN PREMIER
const SAT_PASS=IS_MOBILE?30:44,SAT_TRAINS=IS_MOBILE?[3,20]:[5,26]; // passants au bord de la route ; trains × satellites par train — (2026-09-30) 18/26 → 30/44 passants, 2/3 → 3/5 trains
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
const GLINT=(function(){
  const s0=SATS[0].geometry,g=new THREE.PlaneGeometry(2,2);
  for(const k of ['aRot','aVar','aMov','aTr'])g.setAttribute(k,s0.attributes[k]);
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:false,
    uniforms:{uT:SAT_U.uT,uSol:SAT_U.uSol,uOp:SAT_U.uOp,uForce:SAT_U.uForce},
    vertexShader:[SAT_VS,'uniform vec3 uSol;uniform float uOp,uForce;varying vec2 vQ;varying float vG;',
      'void main(){',
      '  vec3 off;float sc=trainOff(off);mat3 R=mat3(instanceMatrix);float rad=length(R[0]);',
      '  vec3 c=instanceMatrix[3].xyz+off,Np=normalize(rotA(R*vec3(0.,1.,0.),aRot.xyz,aVar.y+uT*aRot.w));',
      '  vec3 V=cameraPosition-c;float dist=length(V);V/=dist;',
      '  float g=(dot(Np,V)>0.&&dot(Np,uSol)>0.)?pow(max(dot(reflect(-V,Np),uSol),0.),80.):0.;',   // le panneau renvoie le soleil vers l oeil
      '  if(aMov.w!=0.)g=max(g,.20+.10*sin(uT*1.7+aVar.y));',
      '  if(aVar.w>.5)g=max(g,.50+.35*sin(uT*5.+aVar.x*6.3));',                                         // (2026-09-30) l OBSTACLE de la pluie de satellites porte une étoile qui PULSE : on le voit venir de loin                                          // un satellite de TRAIN luit toujours un peu : la file se lit en pointillé lumineux (le « collier de perles »)
      '  g=max(g,uForce);g*=sc*uOp*smoothstep(9000.,2500.,dist);vG=g;vQ=position.xy;',
      '  if(g<.02){gl_Position=vec4(0.,0.,2.,1.);return;}',
      '  vec4 mv=viewMatrix*vec4(c,1.);mv.xyz+=normalize(-mv.xyz)*rad*1.15;',                         // devant l aile : l étoile n est pas coupée par son propre panneau
      '  mv.xy+=position.xy*dist*.050*(.4+.6*g);gl_Position=projectionMatrix*mv;}'].join('\n'),
    fragmentShader:['varying vec2 vQ;varying float vG;',
      'void main(){vec2 q=vQ;float r=length(q);',
      '  float br=exp(-abs(q.y)*34.)*(1.-smoothstep(.0,1.,abs(q.x)))+exp(-abs(q.x)*34.)*(1.-smoothstep(.0,1.,abs(q.y)));', // les quatre branches
      '  vec2 d=vec2(q.x+q.y,q.x-q.y)*.7071;br+=.32*(exp(-abs(d.y)*50.)*(1.-smoothstep(0.,.7,abs(d.x)))+exp(-abs(d.x)*50.)*(1.-smoothstep(0.,.7,abs(d.y))));',
      '  float a=(exp(-r*r*60.)*1.8+br+exp(-r*r*7.)*.28)*vG;',
      '  gl_FragColor=vec4(vec3(1.,.95,.84)*a,1.);}'].join('\n')});
  const im=new THREE.InstancedMesh(g,m,SAT_MAX[0]);im.instanceMatrix=SATS[0].instanceMatrix; // les MÊMES matrices que les Starlink
  im.count=0;im.visible=false;im.frustumCulled=false;im.renderOrder=2;scene.add(im);return im;})();
