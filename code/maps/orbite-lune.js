/* ==========================================================================
   LA LUNE CHOQUÉE REVIENT, EN FRÉNÉSIE SEULEMENT (2026-11-11, Sacha : « retrouve le code de la lune qui suit le joueur en étant choquée et
   remets-la dans l'espace que quand le joueur est en frénésie, fais ça sans bug »)
   ----------------------------------------------------------------------------
   Le code est celui du 2026-09-27 (« la lune qui te regarde »), retiré du ciel le 22/10 puis supprimé le 24/10 (v882) : repris tel quel de l'historique
   (toile 1024 × 512 peinte UNE fois au menu par étapes, cercle à l'écran calculé comme une sphère, visage de troll à l'encre, regard qui vise la caisse,
   stupeur qui monte en vol, à la nitro, à l'explosion). Ce qui change :
   · elle n'est VUE qu'en orbite ET en frénésie (`FLOW.lv===4`, en course) : `ORB.lunF` monte en ~0,6 s quand la frénésie part, redescend en ~0,9 s
     quand elle tombe ; à 0 le maillage est invisible (zéro pixel, zéro appel de rendu). Garage, vitrine, menu : éteinte d'un coup ;
   · sa PLACE ne dépend plus d'elle : `ORB.dm` (le tiers haut-droit de l'image, rejoint avec retard — « c'est un bug mais j'aime bien ») est calculé
     chaque image par orbiteTick pour la clé froide ; la lune s'y pose quand elle paraît, sans saut ;
   · le pinceau ne gèle jamais une image : une étape par image au menu ; si l'orbite arrive avant la fin, il continue en course (la lune attend d'être peinte).
   `?lune=0` la retire entièrement (ni scène, ni toile, ni programme). Hook : `dbgLune()` (état), `dbgLune('force',1)` (la montre sans frénésie),
   `dbgLune('carte')` (la carte peinte).
   ========================================================================== */
const LUNE_D=3000,LUNE_R=640; /* à 3 km, ~24° de diamètre (sa place dans le cadre : voir orbiteTick) */
const LUNE_ON=!/[?&]lune=0\b/.test(location.search);
ORB.lunF=0;ORB.lunForce=0;
function luneAlea(){ORB.rs=ORB.rs*16807%2147483647;return ORB.rs/2147483647;} /* le hasard du REGARD (saccades, clignements) : un flux à lui */
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
  me.userData.cv=cv;me.userData.tex=tex;if(LUNE_ON)scene.add(me);return me; // retirée du ciel : hors scène, renderer.compile() ne la voit pas non plus
})();
/* LA CARTE DE LA LUNE — 1024 × 512, équirectangulaire, peinte UNE fois au menu. ⚠ MESURÉ d'une traite : 140 ms (PC) — une image
   gelée au menu, bien pire sur iPhone. Le pinceau est donc un GÉNÉRATEUR : une étape par image au menu (`luneAvance`, appelé par la
   boucle via orbiteTick), chacune de quelques ms ; les toiles de travail restent en mémoire CPU (`willReadFrequently` : les relire
   n'est plus un aller-retour GPU). `lunePeint()` finit d'une traite si on en a besoin tout de suite (orbite atteinte avant la fin). */
function lunePeint(){if(ORB.peinte||!LUNE_ON)return;if(!ORB.pinceau)ORB.pinceau=lunePinceau();while(!ORB.pinceau.next().done){}ORB.pinceau=null;}
function luneAvance(){ // une étape du pinceau (au menu) ; la dernière monte la carte au GPU
  if(ORB.peinte||!LUNE_ON)return;if(!ORB.pinceau)ORB.pinceau=lunePinceau();
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
/* ---- CHAQUE IMAGE (depuis orbiteTick) ---- */
function luneVoile(dt9,lunOk){ /* AVANT les sorties d'orbiteTick : le pinceau avance, le fondu de la frénésie, la visibilité — rend vrai si la lune se dessine */
  if(!LUNE_ON)return false;
  if(!ORB.peinte&&((ORB.pinceau&&(!started||gameOver))||(ORB.actif&&lunOk)))luneAvance(); /* au menu : une étape par image ; en orbite sans carte : pareil, jamais d'un bloc */
  const fr=lunOk&&ORB.peinte&&(ORB.lunForce>0||(started&&FLOW.lv===4&&!PARK.on));
  ORB.lunF=!lunOk?0:fr?Math.min(1,ORB.lunF+dt9*1.7):Math.max(0,ORB.lunF-dt9*1.1);
  LUNE.visible=lunOk&&ORB.lunF>.004;
  if(!LUNE.visible)LUNE.material.uniforms.uOp.value=0;
  return LUNE.visible;}
function lunePose(t,dt9){ /* APRÈS le calcul d'ORB.dm : sa place, son soleil, son regard, sa stupeur — zéro allocation */
  const tc=ORB.t1.subVectors(camera.position,planetGroup.position).normalize();
  const A=ORB.A.copy(ORB.dm);
  const P=ORB.t2.copy(tc).negate(),c9=A.dot(P),mini=Math.asin(Math.min(.99,PLANET_R*LVL.planete*1.06/PLANET_D))+LUNE_R/LUNE_D+.05; /* jamais devant la planète : elle s'écarte le long du grand cercle */
  if(c9>Math.cos(mini)){const pr=ORB.t3.copy(A).addScaledVector(P,-c9);if(pr.lengthSq()<1e-6)pr.set(0,1,0);pr.normalize();A.copy(P).multiplyScalar(Math.cos(mini)).addScaledVector(pr,Math.sin(mini)).normalize();}
  const u=LUNE.material.uniforms;u.uA.value.copy(A);u.uC.value.copy(camera.position).addScaledVector(A,LUNE_D);
  /* SON SOLEIL : la formule du globe appliquée à SA direction (au-dessus, un peu à gauche, derrière l'œil) : Terre et lune éclairées du même côté, la lune reste gibbeuse. */
  const tm=ORB.t2.copy(A).negate(),sm=ORB.t3.crossVectors(tm,ORB.haut);if(sm.lengthSq()<1e-6)sm.set(1,0,0);sm.normalize();
  u.uSol.value.copy(tm).multiplyScalar(.5).addScaledVector(ORB.haut,.75).addScaledVector(sm,.45).normalize();
  u.uTerre.value.subVectors(planetGroup.position,u.uC.value).normalize(); /* d'où vient le clair de Terre */
  u.uLib.value=Math.sin(t*.023)*.09+Math.sin(t*.0071+1.3)*.05; /* la LIBRATION : la lune se balance */
  u.uOp.value=Math.min(1,LVL.espace)*ORB.lunF*ORB.lunF*(3-2*ORB.lunF);
  /* SON REGARD : la direction, à l'écran, de la lune vers la CAISSE — lissée, plus de petites saccades. En vol, à la nitro, à l'explosion, la stupeur monte. */
  const pc=ORB.pc.copy(carGroup.position).project(camera),pm=ORB.pm.copy(u.uC.value).project(camera);
  const ex=(pc.x-pm.x)*camera.aspect,ey=pc.y-pm.y,el=Math.hypot(ex,ey);
  if(el>1e-4&&pc.z<1&&isFinite(el))ORB.oeilC.set(ex/el*.95,ey/el*.95);
  if(t>ORB.sacT||ORB.sacT-t>3){ORB.sacT=t+.35+luneAlea()*1.1;ORB.sac.set((luneAlea()-.5)*.26,(luneAlea()-.5)*.20);} /* (l'horloge peut repartir de zéro : on ne reste pas figé) */
  ORB.sac.multiplyScalar(Math.max(0,1-dt9*2.5));
  ORB.oeil.lerp(ORB.oeilC,Math.min(1,dt9*9));u.uOeil.value.copy(ORB.oeil).add(ORB.sac);
  if(u.uOeil.value.lengthSq()>1)u.uOeil.value.normalize();
  const boom=mode==='boom'||gameOver,choc=boom?1:.62+(mode==='fall'?.26:0)+(nitroOn?.12:0); /* en frénésie elle est déjà sidérée (.62) ; pétrifiée à l'explosion */
  ORB.choc+=(Math.min(1,choc)-ORB.choc)*Math.min(1,dt9*(choc>ORB.choc?6:1.5));u.uChoc.value=ORB.choc;
  if((t>ORB.cligProchain||ORB.cligProchain-t>12)&&ORB.choc<.9){ORB.cligT=t;ORB.cligProchain=t+3.5+luneAlea()*5.5;} /* un clignement rare — pas quand elle est pétrifiée */
  const kc=(t-ORB.cligT)/.17;u.uCligne.value=kc>=0&&kc<1?Math.sin(kc*Math.PI):0;
  u.uT.value=t%1000;}
window.dbgLune=function(k,v){ /* (dev) dbgLune() : l'état · dbgLune('force',1|0) : la montrer sans frénésie · dbgLune('carte') : la carte (R albédo, G relief, B mers) */
  if(k==='force'){ORB.lunForce=+v||0;return ORB.lunForce;}
  if(k==='carte'){lunePeint();return LUNE.userData.cv.width?LUNE.userData.cv.toDataURL('image/png'):'toile rendue (téléphone)';}
  const u=LUNE.material.uniforms,p=u.uC.value.clone().project(camera);
  return {on:LUNE_ON,dansScene:LUNE.parent===scene,peinte:ORB.peinte,pinceau:!!ORB.pinceau,pireEtapeMs:ORB.pireMs|0,orbite:ORB.actif,luneDuNiveau:ORB.lune,espace:+LVL.espace.toFixed(2),
    frenesie:FLOW.lv===4,fondu:+ORB.lunF.toFixed(3),visible:LUNE.visible,op:+u.uOp.value.toFixed(3),choc:+ORB.choc.toFixed(2),regard:u.uOeil.value.toArray().map(x=>+x.toFixed(2)),
    ecran:[Math.round((p.x*.5+.5)*innerWidth),Math.round((.5-p.y*.5)*innerHeight),p.z<1?'devant':'derriere'],force:ORB.lunForce};};
