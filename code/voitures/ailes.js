/* ============================================================================
   LES AILES — quatorze paires, chacune son DESSIN, sa matière et son GESTE (2026-10-14 : LES AILES POP · 2026-10-16 : LES AILES VIVANTES).
   ----------------------------------------------------------------------------
   Elles se posent sur les pivots des mini-ailes (`carWingL/R` : rentrées dans le flanc au sol, dépliées en vol par `wingT`, ouvertes au
   garage dans l'onglet AILES). Un bâtisseur par style, appelé par buildCar : (pivot, côté ±1, largeur, longueur, hauteur, bas de caisse,
   matières de la caisse). Repère du pivot : x = vers l'EXTÉRIEUR (× côté), z = vers l'AVANT, y = le toit. Les contours se donnent À PLAT
   (x dehors, y = vers l'ARRIÈRE) et passent par `ailForme`, qui les couche et les met en miroir du côté droit (`bx` = la boîte des UV :
   une aile coupée en deux garde UNE texture).
   Ce qui BOUGE s'inscrit dans `BLING.anim` par `ailAnime` (vidé à chaque buildCar, appelé chaque image au menu, au garage et en course) et
   porte `userData.bouge` (`ailB`). Les textures peintes sont cuites UNE fois (`AIL_TX`) : buildCar libère les matières, pas les textures.

   LES AILES VIVANTES (2026-10-16, Sacha : « retravaille les ailes, fais-leur des petites animations. Par exemple, les ailes X-Wing, quand tu
   boostes, elles doivent s'ouvrir comme dans le vrai jeu Star Wars. Les ailes de dragon, elles doivent battre, celles de pigeon et tout.
   Essaye de donner du détail pour chaque, prends-les une par une et apporte-leur du soin. Fais le max, qu'elles donnent toute envie d'acheter »)
   · ⚠ CE QUI DEVAIT BOUGER NE BOUGEAIT PAS : la soudure (`caisseSoude` → `fusGroupe`, passe perf du 27/09) aspirait les pièces des groupes
     animés dans le pivot — les AILES EN X ne s'ouvraient jamais (leurs deux plans soudés l'un sur l'autre), les os du DRAGON restaient figés
     sous une membrane qui battait seule, le MONARQUE et le PIGEON ne battaient plus. Ce qui porte `userData.bouge` est respecté : un groupe
     animé se soude dans SON repère, une pièce animée reste seule (voir fusGroupe). `dbgAiles(id)` compte ce qui bouge.
   · UNE horloge et UN état pour les deux côtés (`AILV`, tenu par `ailvTick`) : chaque côté tirait son temps au hasard, la gauche et la
     droite battaient à contretemps. AILV.n = le BOOST (nitro tenue en vol, lissé) · AILV.vir = le virage · AILV.mon = on monte (+) / plonge (−).
   · LA VITRINE (garage, ailes ouvertes) : toutes les 7,5 s un boost de 2,6 s et un virage qui va et vient — l'acheteur VOIT le geste.
   · LA PHOTO (boutique, inventaire) : `ailvPose` joue 1,5 s du geste, boost tenu, avant le déclic (les ailes en X y sont ouvertes) ; les
     effets (`userData.fx` : jets, traînées, essaims) n'entrent pas dans le cadrage.
   · Des ARTICULATIONS (`ailCoupe` coupe une membrane au poignet ; la main bat en retard sur le bras : le battement fait une VAGUE), un
     battement vrai (`ailBat` : la poussée vers le bas rapide, la remontée lente) et des ESSAIMS de cubes de lumière (`ailEtincelles` :
     braises, étincelles, poussière, vapeur — une passe de dessin par aile, rien d'alloué en vol).
   ========================================================================== */
/* LES AILES QU'ON VEUT (2026-10-15 soir, Sacha : « retravaille toutes les traînées, il faut qu'elles soient toutes désirables, pareil pour les ailes »)
   — VU sur les photos de la boutique (dbgAile) et en vol : plusieurs ailes se perdaient à côté de la caisse — le PIGEON minuscule, la FÉE grise et
   pâle, le PHÉNIX (la mythique !) deux baguettes, les HÉLICES maigres, les PANNEAUX (l'aile offerte) deux planches mates à la couleur de la caisse,
   les PLUMES des marches blanches sans éclat. `AILE_K` : la taille de chaque aile (posée au pivot ; le déploiement en vol et la photo de la
   boutique la gardent), et les matières des plus faibles relevées : un filet de néon aux PANNEAUX, la lumière d'ange et l'or des PLUMES, les
   voiles irisés de la FÉE, le halo du PHÉNIX. `?ailes=avant` = les ailes d'avant. */
const AILE_K_ON=!/[?&]ailes=avant\b/.test(location.search);
const AILE_K={panneaux:1.12,helices:1.3,plumes:1.2,chauve:1.12,pigeon:1.5,origami:1.15,monarque:1.25,pixel:1.15,baron:1.1,rouages:1.15,xwing:1.1,fee:1.45,dragon:1.05,phenix:1.7};
var AILES_POP=null;const AIL_TX={};
var AILV={t:0,n:0,vir:0,mon:0,vitr:0,photo:0,force:null};
function ailvTick(dt){if(!carWingL)return;AILV.t+=dt; // une fois par image, avant blingTick
  const vol=mode==='fall'&&!garageOn,vitr=garageOn&&wingT>.3;AILV.vitr=vitr?1:0;
  let nT=vol&&nitroOn?1:0,vT=vol?steer:0,mT=vol?Math.max(-1,Math.min(1,volVu(fallVel)*.09)):0;
  if(vitr){const c=AILV.t%7.5;nT=c>3.2&&c<5.8?1:0;vT=.75*Math.sin(AILV.t*.85);mT=.4*Math.sin(AILV.t*.5);} // LA VITRINE : le boost, le virage, la montée
  const F=AILV.force;if(F){if(F.n!=null)nT=F.n;if(F.vir!=null)vT=F.vir;if(F.mon!=null)mT=F.mon;} // (banc) dbgAilesForce
  AILV.n+=(nT-AILV.n)*Math.min(1,dt*(nT>AILV.n?9:2.6));AILV.vir+=(vT-AILV.vir)*Math.min(1,dt*5);AILV.mon+=(mT-AILV.mon)*Math.min(1,dt*2.5);}
/* (2026-10-16, session SON des ailes) LES GESTES ONT LEUR SON — le CLAC des ailes en X, le WOUF du dragon, les deux claps du pigeon (recettes
   `ailes.*`, bloc AILES de atelier-son/recettes.js). EN VOL seulement : ni à la vitrine du garage (un clac toutes les 7,5 s sous la musique), ni
   à la photo ; une aile à peine sortie sonne plus bas (`e` = wingT). Le bâtisseur ne l'appelle que d'UN côté (sd > 0) : les deux battent ensemble. */
function ailSon(id,e,db){if(mode!=='fall'||garageOn||AILV.photo||!(e>.25))return null;return sfx(id,{vol:(db||0)+20*Math.log10(Math.min(1,e))});}
function ailvPose(){ // LA PHOTO : 1,5 s du geste, boost tenu, ailes dépliées — puis tout revient comme avant
  if(!BLING.anim.length)return;const s=[AILV.t,AILV.n,AILV.vir,AILV.mon,AILV.photo],w9=wingT;
  AILV.photo=1;AILV.n=1;AILV.vir=0;AILV.mon=.3;wingT=1;
  try{for(let k=0;k<45;k++){AILV.t+=1/30;for(const f of BLING.anim)f(1/30);}}catch(e){}
  wingT=w9;AILV.t=s[0];AILV.n=s[1];AILV.vir=s[2];AILV.mon=s[3];AILV.photo=s[4];}
function ailTex(nom,f,w,h){if(AIL_TX[nom])return AIL_TX[nom];const cv=document.createElement('canvas');cv.width=w||256;cv.height=h||256;f(cv.getContext('2d'),cv.width,cv.height);
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return AIL_TX[nom]=t;}
function ailUV(g,bx){const uv=g.attributes.uv;if(!uv)return g;let a=1e9,b=1e9,c=-1e9,d=-1e9; // les UV d'un contour = ses coordonnées : on les ramène à 0..1 sur sa boîte (ou sur `bx`)
  if(bx){a=bx[0];b=bx[1];c=bx[2];d=bx[3];}else for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);if(u<a)a=u;if(v<b)b=v;if(u>c)c=u;if(v>d)d=v;}
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)-a)/((c-a)||1),(uv.getY(i)-b)/((d-b)||1));return g;}
function ailForme(sh,sd,ep,bx){ // un contour (Shape, ou liste [x dehors, y arrière]) → la plaque couchée, en miroir à droite ; `ep` = son épaisseur ; `bx` = la boîte des UV
  if(Array.isArray(sh)){const s=new THREE.Shape();s.moveTo(sh[0][0],sh[0][1]);for(let i=1;i<sh.length;i++)s.lineTo(sh[i][0],sh[i][1]);sh=s;}
  const g=ep?new THREE.ExtrudeGeometry(sh,{depth:ep,bevelEnabled:false,curveSegments:10}):new THREE.ShapeGeometry(sh,10);
  ailUV(g,bx);g.rotateX(-Math.PI/2);if(ep)g.translate(0,-ep/2,0);if(sd<0)g.scale(-1,1,1);g.computeVertexNormals();return g;}
function ailMat(o){return new THREE.MeshPhongMaterial(Object.assign({side:THREE.DoubleSide,shininess:40,specular:0x444444},o));}
function ailTige(par,mat,r,a,b,r2){const d=new THREE.Vector3().subVectors(b,a),l=d.length(),m=new THREE.Mesh(new THREE.CylinderGeometry(r2==null?r:r2,r,l,6),mat); // une tige de a à b (r au pied, r2 en tête)
  m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());par.add(m);return m;}
function ailPointe(par,mat,r,h,p,d){const u=d.clone().normalize(),m=new THREE.Mesh(new THREE.ConeGeometry(r,h,6),mat); // une griffe, une épine : la base en p, la pointe vers d
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),u);m.position.copy(p).addScaledVector(u,h/2);par.add(m);return m;}
function ailB(o){o.userData.bouge=1;return o;} // ÇA BOUGE : la soudure le laisse à sa place (voir fusGroupe)
function ailBat(p){p-=Math.floor(p);return p<.42?Math.cos(p/.42*Math.PI):-Math.cos((p-.42)/.58*Math.PI);} // 1 = en haut, −1 = en bas : la poussée (la descente) prend 42 % du cycle
function ailQuad(L,a,c,b,n){for(let i=1;i<=n;i++){const u=i/n,v=1-u;L.push([v*v*a[0]+2*v*u*c[0]+u*u*b[0],v*v*a[1]+2*v*u*c[1]+u*u*b[1]]);}return L;} // une courbe → des points (a exclu)
function ailCoupe(P,xc,cote){ // un contour coupé par la droite x = xc : cote > 0 garde x ≥ xc (la MAIN), cote < 0 garde x ≤ xc (le BRAS)
  const o=[],n=P.length,de=function(p){return cote>0?p[0]>=xc-1e-9:p[0]<=xc+1e-9;},pu=function(p){const q=o[o.length-1];if(!q||Math.abs(q[0]-p[0])+Math.abs(q[1]-p[1])>1e-6)o.push(p);};
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],ia=de(a),ib=de(b);if(ia)pu(a);
    if(ia!==ib){const k=(xc-a[0])/(b[0]-a[0]);pu([xc,a[1]+(b[1]-a[1])*k]);}}
  if(o.length>2&&Math.abs(o[0][0]-o[o.length-1][0])+Math.abs(o[0][1]-o[o.length-1][1])<1e-6)o.pop();return o;}
function ailRz(v,a){const c=Math.cos(a),s=Math.sin(a),x=v.x*c-v.y*s;v.y=v.x*s+v.y*c;v.x=x;return v;} // un point tourné comme un groupe (rotation.z, puis .y)
function ailRy(v,a){const c=Math.cos(a),s=Math.sin(a),x=v.x*c+v.z*s;v.z=-v.x*s+v.z*c;v.x=x;return v;}
function ailAnime(f){if(typeof BLING!=='object'||!BLING||!BLING.anim)return; // (le temps est COMMUN aux deux côtés : AILV.t)
  BLING.anim.push(function(dt){if(wingT<.02&&!AILV.photo)return;f(AILV.t,wingT,Math.min(dt||0,.05));});}
function ailEtincelles(par,n,taille,col,o){ // un ESSAIM de cubes de lumière : `pousse(x,y,z, vx,vy,vz, vie, taille)` en fait naître un, `pas(dt, g, frein)` les fait vivre
  o=o||{};const mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:o.op||1,blending:o.normal?THREE.NormalBlending:THREE.AdditiveBlending,depthWrite:false}),
    im=new THREE.InstancedMesh(new THREE.BoxGeometry(taille,taille,taille),mat,n);im.frustumCulled=false;im.userData.bouge=1;im.userData.fx=1;par.add(im);
  const P=[],Z=new THREE.Matrix4().makeScale(0,0,0),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),eu=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();let j=0,vif=0;
  for(let i=0;i<n;i++){P.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,a:1,l:1,s:0,r:0});im.setMatrixAt(i,Z);}
  return {im:im,mat:mat,
    pousse:function(x,y,z,vx,vy,vz,l,s){const p=P[j];j=(j+1)%n;p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.a=0;p.l=l;p.s=s;p.r=Math.random()*6.28;vif=1;},
    pas:function(dt,g,fr){if(!vif)return;let nv=0;const f=Math.exp(-(fr||1.5)*dt);
      for(let i=0;i<n;i++){const p=P[i];if(p.a>=p.l)continue;p.a+=dt;if(p.a>=p.l){im.setMatrixAt(i,Z);continue;}nv++;
        p.vx*=f;p.vy=p.vy*f+(g||0)*dt;p.vz*=f;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
        const u=p.a/p.l;let s=o.grow?p.s*(.35+u)*(1-u*u*u):p.s*(1-u);if(o.tw)s*=.55+.45*Math.sin(p.a*26+p.r*3); // la vapeur GONFLE, la poussière de fée SCINTILLE
        eu.set(p.r+p.a*4,p.r*1.3+p.a*3,0);q.setFromEuler(eu);m4.compose(v.set(p.x,p.y,p.z),q,sc.set(s,s,s));im.setMatrixAt(i,m4);}
      im.instanceMatrix.needsUpdate=true;if(!nv)vif=0;}};}
AILES_POP={
  panneaux:function(piv,sd,W9,L9,H9,y0,M){ // PANNEAUX (offertes) — les planches d'origine en vrai profil : flèche, SAUMON relevé à la couleur de la caisse,
    // un AILERON qui suit le virage (un côté monte, l'autre descend), les FEUX DE POSITION d'un avion (rouge à gauche, vert à droite) et
    // l'éclat blanc qui clignote deux fois ; au boost, deux TRAÎNÉES DE CONDENSATION sortent des saumons
    const S=W9*.92,C=L9*.32,acc=M.acc,body=M.body;
    piv.add(new THREE.Mesh(ailForme([[0,-C*.48],[S*.8,-C*.4],[S,-C*.3],[S,C*.08],[S*.96,C*.12],[S*.42,C*.12],[S*.42,C*.36],[0,C*.36]],sd,.05),acc));
    const ai=ailB(new THREE.Group());ai.position.set(sd*S*.69,0,-C*.12);piv.add(ai); // l'aileron, sur sa charnière
    const ap=new THREE.Mesh(new THREE.BoxGeometry(S*.5,.03,C*.22),body);ap.position.z=-C*.11;ai.add(ap);
    if(AILE_K_ON){const hs9={};new THREE.Color(acc.color).getHSL(hs9);const neM=new THREE.MeshBasicMaterial({color:hs9.s<.2?new THREE.Color(.25,1.5,1.7):new THREE.Color().setHSL(hs9.h,1,.6).multiplyScalar(1.6)}); // (2026-10-15 soir, LES AILES QU'ON VEUT) le filet de NÉON à la couleur d'accent — au bord d'attaque, et au bord de fuite de l'aileron (il suit l'aileron)
      const nb=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(S*.8,C*.08),.03,.06),neM);nb.position.set(sd*S*.4,.035,C*.43);nb.rotation.y=sd*Math.atan2(C*.08,S*.8);piv.add(nb);
      const na=new THREE.Mesh(new THREE.BoxGeometry(S*.5,.03,.05),neM);na.position.set(0,.02,-C*.21);ai.add(na);}
    const wl=new THREE.Group();wl.position.set(sd*S,0,0);wl.rotation.z=-sd*.2;piv.add(wl);  // le saumon, penché vers le dehors
    const sw=new THREE.Shape();sw.moveTo(-C*.3,0);sw.lineTo(C*.08,0);sw.lineTo(C*.02,.24);sw.lineTo(-C*.16,.26);sw.lineTo(-C*.3,0);
    const gw=new THREE.ExtrudeGeometry(sw,{depth:.035,bevelEnabled:false});gw.rotateY(Math.PI/2);gw.translate(-.0175,0,0);gw.computeVertexNormals();wl.add(new THREE.Mesh(gw,body));
    const nav=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.07),new THREE.MeshBasicMaterial({color:sd>0?new THREE.Color(2.4,.28,.22):new THREE.Color(.3,2.2,.7)}));nav.position.set(0,.25,C*.14);wl.add(nav);
    const st=ailB(new THREE.Mesh(new THREE.BoxGeometry(.045,.045,.045),new THREE.MeshBasicMaterial({color:new THREE.Color(3,3,3)})));st.position.set(0,.27,-C*.03);wl.add(st);
    const gt=new THREE.CylinderGeometry(.03,.006,1,6,1,true);gt.translate(0,-.5,0);gt.rotateX(Math.PI/2); // la traînée : de 0 à −1 en z, qui s'efface vers la queue
    {const ps=gt.attributes.position,cl=new Float32Array(ps.count*3);for(let i=0;i<ps.count;i++){const k=Math.pow(1+ps.getZ(i),2.2)*.8;cl[i*3]=cl[i*3+1]=cl[i*3+2]=k;}gt.setAttribute('color',new THREE.BufferAttribute(cl,3));}
    const trM=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const tr=ailB(new THREE.Mesh(gt,trM));tr.userData.fx=1;tr.position.set(sd*(S+.05),.25,-C*.05);tr.scale.z=.001;piv.add(tr);
    ailAnime(function(t,e){ai.rotation.x=(.55*AILV.vir*sd-.15*AILV.mon)*e;
      const s=t%1.4;st.scale.setScalar(s<.05||(s>.16&&s<.21)?1:.001);                       // l'éclat : deux flashs, comme un avion de ligne
      const k=AILV.n;tr.visible=!AILV.photo;tr.scale.z=.001+2.8*k;trM.opacity=.3*k;});}, // (la traînée est un effet de VOL : pas sur la photo)
  xwing:function(piv,sd,W9){ // AILES EN X — EN CROISIÈRE les deux plans sont l'un sur l'autre ; dès qu'on BOOSTE, la mécanique se déverrouille (un temps),
    // ils s'écartent en X d'un coup sec, rebondissent et se VERROUILLENT en position d'attaque (un frisson) ; les canons s'arment (pointes
    // rouges qui battent), les quatre réacteurs rugissent (tuyères chauffées à blanc et jet de lumière). On relâche : ils se referment, après un temps.
    const S=W9*.98,tex=ailTex('xwing',function(x,w,h){x.fillStyle='#d6d2c6';x.fillRect(0,0,w,h);
        for(let i=0;i<700;i++){x.fillStyle='rgba(90,84,72,'+(Math.random()*.1)+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*4,1);} // la patine
        x.strokeStyle='rgba(80,76,68,.85)';x.lineWidth=1.5;for(const u of [.2,.45,.68,.86]){x.beginPath();x.moveTo(u*w,0);x.lineTo(u*w,h);x.stroke();} // les panneaux
        for(const v of [.28,.86]){x.beginPath();x.moveTo(0,v*h);x.lineTo(w,v*h);x.stroke();}
        x.fillStyle='rgba(70,68,62,.55)';for(let u=.03;u<1;u+=.04){x.fillRect(u*w,.28*h-1,1.6,1.6);x.fillRect(u*w,.86*h-1,1.6,1.6);} // les rivets
        x.fillStyle='#b01d16';x.fillRect(0,.42*h,.6*w,.1*h);x.fillRect(0,.6*h,.46*w,.1*h);                       // les BANDES ROUGES de l'escadron
        x.fillStyle='rgba(150,30,25,.9)';x.fillRect(.78*w,.12*h,.07*w,.07*h);x.fillRect(.78*w,.22*h,.07*w,.07*h);        // deux trappes
        let g=x.createLinearGradient(0,0,0,.35*h);g.addColorStop(0,'rgba(30,24,20,.45)');g.addColorStop(1,'rgba(30,24,20,0)');x.fillStyle=g;x.fillRect(0,0,.28*w,.35*h); // la suie du réacteur
        g=x.createLinearGradient(w,0,.8*w,0);g.addColorStop(0,'rgba(30,24,20,.5)');g.addColorStop(1,'rgba(30,24,20,0)');x.fillStyle=g;x.fillRect(.8*w,0,.2*w,h); // celle du canon
        x.strokeStyle='rgba(60,55,50,.35)';for(let i=0;i<14;i++){const a=Math.random()*w,b=Math.random()*h;x.beginPath();x.moveTo(a,b);x.lineTo(a+6+Math.random()*16,b+(Math.random()-.5)*4);x.stroke();} // les éraflures
      },256,128),
      coque=ailMat({map:tex,shininess:45,specular:0x555555}),gris=ailMat({color:0x4a4f58,shininess:90,specular:0x999999}),sombre=ailMat({color:0x17191d,shininess:20}),
      feu=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,.62,.5),side:THREE.DoubleSide}),arme=new THREE.MeshBasicMaterial({color:new THREE.Color(.5,.06,.05)}),
      jetM=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const gj=new THREE.ConeGeometry(.1,1,10,1,true);gj.translate(0,.5,0);gj.rotateX(-Math.PI/2); // le jet : sa base sur la tuyère, sa pointe vers l'arrière, qui s'efface
    {const ps=gj.attributes.position,cl=new Float32Array(ps.count*3);for(let i=0;i<ps.count;i++){const k=Math.pow(Math.max(0,1+ps.getZ(i)),1.5);cl[i*3]=1.6*k;cl[i*3+1]=.5*k;cl[i*3+2]=.45*k;}gj.setAttribute('color',new THREE.BufferAttribute(cl,3));}
    const plans=[],jets=[];
    for(const sg of [1,-1]){const g=ailB(new THREE.Group());g.position.y=sg*.035;piv.add(g);plans.push([g,sg]);
      g.add(new THREE.Mesh(ailForme([[0,-.42],[S,-.12],[S,.2],[S*.62,.36],[0,.48]],sd,.045),coque));
      const cn=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,1.3,8),gris);cn.rotation.x=Math.PI/2;cn.position.set(sd*S,0,.2);g.add(cn);    // le CANON : le fût,
      const cb=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.45,8),gris);cb.rotation.x=Math.PI/2;cb.position.set(sd*S,0,-.08);g.add(cb);  // le manchon,
      const cf=new THREE.Mesh(new THREE.CylinderGeometry(.044,.044,.15,8),sombre);cf.rotation.x=Math.PI/2;cf.position.set(sd*S,0,.86);g.add(cf); // le cache-flamme
      const pt=new THREE.Mesh(new THREE.CylinderGeometry(.016,.03,.07,8),arme);pt.rotation.x=Math.PI/2;pt.position.set(sd*S,0,.965);g.add(pt);   // et la pointe qui s'ARME
      const re=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.95,12),gris);re.rotation.x=Math.PI/2;re.position.set(sd*.24,sg*.06,.05);g.add(re); // le RÉACTEUR :
      const ea=new THREE.Mesh(new THREE.CircleGeometry(.108,14),sombre);ea.position.set(sd*.24,sg*.06,.527);g.add(ea);                                // l'entrée d'air,
      const lv=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,6,16),gris);lv.position.set(sd*.24,sg*.06,.53);g.add(lv);                              // sa lèvre,
      const fe=new THREE.Mesh(new THREE.CircleGeometry(.11,14),feu);fe.position.set(sd*.24,sg*.06,-.431);fe.rotation.y=Math.PI;g.add(fe);         // la tuyère
      const jt=ailB(new THREE.Mesh(gj,jetM));jt.userData.fx=1;jt.position.set(sd*.24,sg*.06,-.44);jt.scale.z=.25;g.add(jt);jets.push(jt);}        // et son jet
    let x=0,v=0,veut=0,tv=9,cib=0,clac=0;
    ailAnime(function(t,e,dt){const n=AILV.n;
      if(n>.55&&!veut){veut=1;tv=0;}else if(n<.2&&veut){veut=0;tv=0;}tv+=dt;
      const c0=cib;if(veut&&tv>.08)cib=1;else if(!veut&&tv>.45)cib=0;                       // la mécanique : un temps pour s'ouvrir, un temps avant de se refermer
      if(c0&&!cib&&x>.5&&sd>0)ailSon('ailes.xwingFerme',e);                                  // (2026-10-16, son) le verrou lâche : tchk, le servo, et le TONK des plans 0,15 s plus tard (cuit dans le son)
      const x0=x;v+=((cib-x)*170-v*13)*dt;x=Math.max(-.08,Math.min(1.2,x+v*dt));           // le ressort : sec, avec un petit rebond
      if(x0<.97&&x>=.97&&cib){clac=1;if(sd>0)ailSon('ailes.xwing',e);}clac=Math.max(0,clac-dt*6); // le VERROU : un frisson quand les plans arrivent — et son K-CHAK (2026-10-16)
      const a=(.015+.29*x+clac*.03*Math.sin(t*95))*e;for(const q of plans)q[0].rotation.z=sd*q[1]*a;
      const ar=Math.max(0,Math.min(1,x));arme.color.setRGB(.5+2.3*ar*(.7+.3*Math.sin(t*14)),.06+.3*ar,.05+.22*ar); // les canons armés
      const k=.72+.14*Math.sin(t*31)+1.1*n;feu.color.setRGB(2.4*k,.62*k,.5*k);
      const L=.25+1.3*n+.07*Math.sin(t*40);for(const j of jets)j.scale.z=L;jetM.opacity=.22+.6*n;});},
  air:function(piv,sd,W9,L9,H9,y0){ // SANS AILES (2026-10-18, Léo : « un nouveau type d'aile, mais la blague c'est qu'il n'y a pas d'aile : juste le système de
    // propulsion présenté tout récemment, qui permet à une voiture de pivoter et voler ») — AUCUNE aile : cinq BUSES À AIR COMPRIMÉ par côté, dix en tout,
    // posées SUR la tôle de la caisse (un rayon cherche sa carrosserie : le flanc avant, le flanc arrière, la poupe, deux sous le bas de caisse). Elles
    // crachent des bouffées BLANCHES en cubes (la grammaire des flammes du jeu) : la poupe au BOOST, les flancs quand on tourne EN L'AIR — l'avant d'un
    // côté, l'arrière de l'autre : ce sont elles qui font PIVOTER la caisse —, le dessous quand on monte, un petit « pfft » de stabilisation de temps en
    // temps, et une bouffée de TOUTES à la sortie (elle « se gonfle »). L'anneau de chaque buse s'allume quand elle souffle.
    // Le pivot s'étire et penche au déploiement (scale.x, dièdre) : `g1`/`g2` l'annulent (`piv.userData.recale`, rappelé par la boucle juste après
    // qu'elle les pose, et par la photo) — les buses restent en vrais mètres, collées à la tôle.
    const V=THREE.Vector3,g1=ailB(new THREE.Group()),g2=ailB(new THREE.Group());piv.add(g1);g1.add(g2);const P0=piv.position.clone();
    const recale=function(){const s=piv.scale;g1.scale.set(1/Math.max(.01,s.x),1/Math.max(.01,s.y),1/Math.max(.01,s.z));g2.rotation.z=-piv.rotation.z;};piv.userData.recale=recale;
    const cib=[];carGroup.updateMatrixWorld(true); // LA TÔLE : ce que la caisse a déjà posé (ni verre, ni halos, ni flaques au sol — les roues et les ailes ne sont pas encore là)
    carGroup.traverse(function(o){if(o.isMesh&&o.visible&&!(o.userData&&o.userData.sol)&&o.material&&!o.material.transparent&&o.material.blending!==THREE.AdditiveBlending)cib.push(o);});
    const Mw=carGroup.matrixWorld,Mi=new THREE.Matrix4().copy(Mw).invert(),rc=new THREE.Raycaster();
    const tire=function(o,d,lim){rc.set(o.applyMatrix4(Mw),d.transformDirection(Mw));rc.far=lim||12;const h=cib.length?rc.intersectObjects(cib,false)[0]:null;return h?h.point.applyMatrix4(Mi):null;}; // le 1er point de tôle sur ce rayon (repère caisse)
    const flanc=function(z){for(const k of [1,.93,.86,.78]){const p=tire(new V(sd*6,y0+H9*.42,z*k),new V(-sd,0,0));if(p)return p;}return new V(sd*W9*.5,y0+H9*.42,z);};
    const dessous=function(z){return tire(new V(sd*W9*.3,y0-3,z),new V(0,1,0),3+H9*.4)||new V(sd*W9*.3,y0+.05,z);};
    let po=null;for(const k of [1,.8,.6]){po=tire(new V(sd*W9*.3*k,y0+H9*.45,-L9*2),new V(0,0,1));if(po)break;}if(!po)po=new V(sd*W9*.3,y0+H9*.45,-L9*.5);
    const X=new V(sd,0,0),B=[{p:flanc(L9*.44),d:X},{p:flanc(-L9*.44),d:X},{p:po,d:new V(0,0,-1)},{p:dessous(L9*.3),d:new V(0,-1,0)},{p:dessous(-L9*.3),d:new V(0,-1,0)}]; // 0 flanc AVANT · 1 flanc ARRIÈRE · 2 POUPE · 3-4 DESSOUS
    const mBu=ailMat({color:0x30343c,shininess:110,specular:0x9aa0aa}),mTr=new THREE.MeshBasicMaterial({color:0x06070a}),
      gBu=new THREE.CylinderGeometry(.1,.115,.07,10),gTr=new THREE.CircleGeometry(.064,10),gLe=new THREE.TorusGeometry(.083,.013,4,14),Y=new V(0,1,0),Z=new V(0,0,1),leds=[];
    for(const b of B){const o=b.p.clone().sub(P0);b.o=o; // (dans g2 : la caisse, à l'origine du pivot)
      const c=new THREE.Mesh(gBu,mBu);c.quaternion.setFromUnitVectors(Y,b.d);c.position.copy(o).addScaledVector(b.d,.01);g2.add(c);        // le fût, à moitié dans la tôle
      const t=new THREE.Mesh(gTr,mTr);t.quaternion.setFromUnitVectors(Z,b.d);t.position.copy(o).addScaledVector(b.d,.047);g2.add(t);       // la bouche
      const lm=new THREE.MeshBasicMaterial({color:new THREE.Color(.12,.35,.5)}),l=ailB(new THREE.Mesh(gLe,lm));l.quaternion.setFromUnitVectors(Z,b.d);l.position.copy(o).addScaledVector(b.d,.049);g2.add(l);leds.push(lm);} // son anneau
    const fum=ailEtincelles(g2,150,.25,0xeef5ff,{normal:1,grow:1,op:.82}),E=B.map(function(){return {a:0,f:0};}),nv=[0,0,0,0,0];let e0=0,n0=0,pf=.6;
    const souffle=function(i,n,v,s,vent,vie){const b=B[i],o=b.o,d=b.d,j=v*.35;vie=vie||.3; // (la vie courte de la poupe : sa bouffée ne doit pas monter jusqu'à l'objectif, 7-9 m derrière — MESURÉ au banc : à 20 m/s et 0,45 s elle couvrait le tiers de l'écran)
      for(let k=0;k<n;k++)fum.pousse(o.x+d.x*.06,o.y+d.y*.06,o.z+d.z*.06,d.x*v+(Math.random()-.5)*j,d.y*v+(Math.random()-.5)*j+.4,d.z*v+(Math.random()-.5)*j-vent,vie+Math.random()*vie,s*(.7+Math.random()*.6));};
    ailAnime(function(t,e,dt){recale();
      const vol=mode==='fall'&&!garageOn,vent=vol?5:1.2,n=AILV.n,vr=AILV.vir,mo=AILV.mon,cl=function(x){return x<0?0:x>1?1:x;};
      if(AILV.photo){nv[0]=nv[1]=nv[3]=nv[4]=.7;nv[2]=.8;} // LA PHOTO de la boutique : toutes soufflent — la vignette montre l'air, pas l'aile
      else{nv[0]=cl((-sd*vr-.12)*1.8);nv[1]=cl((sd*vr-.12)*1.8);nv[2]=n;nv[3]=nv[4]=cl(mo*1.6);} // le virage (+ = à gauche) : l'avant DROIT et l'arrière GAUCHE soufflent, et inversement
      if(e0<.55&&e>=.55){for(let i=0;i<5;i++){souffle(i,i===2?5:8,5,2.3,vent,.25);E[i].f=1;}if(sd>0)ailSon('ailes.air',e);}e0=e; // LA SORTIE : elle se gonfle
      if(n0<.5&&n>=.5&&sd>0&&!AILV.photo)ailSon('ailes.air',e,-4);n0=n;                                                     // le boost : la poupe lâche tout
      if(e>.9&&!AILV.photo){pf-=dt;if(pf<0){pf=.45+Math.random()*.9;const i=[0,1,3,4][Math.floor(Math.random()*4)];if(nv[i]<.1){souffle(i,3,3.5,1.5,vent);E[i].f=Math.max(E[i].f,.6);}}} // la stabilisation : pfft
      for(let i=0;i<5;i++){const q=E[i];q.a+=nv[i]*(i===2?60:40)*dt;while(q.a>=1){q.a-=1;if(i===2)souffle(2,1,10,2.4,vent*.6,.26);else souffle(i,1,7,2,vent);}
        q.f=Math.max(nv[i],q.f-dt*4);leds[i].color.setRGB(.12+.75*q.f,.35+1.55*q.f,.5+2.1*q.f);}
      fum.pas(dt,.3,1.1);});},
  baron:function(piv,sd,W9){ // BARON ROUGE — un biplan de toile rouge entoilée (nervures, coutures, une pièce rapiécée, des taches d'huile), des mâts de bois,
    // des haubans en croix, les AILERONS qui suivent le virage et L'ÉCHARPE DU PILOTE nouée au mât, qui claque au vent (fort au boost)
    const S=W9*1.02,tex=ailTex('baron',function(x,w,h){x.fillStyle='#b5181c';x.fillRect(0,0,w,h);
        for(let i=0;i<900;i++){x.fillStyle='rgba('+(Math.random()<.5?'60,0,0':'255,90,80')+','+(Math.random()*.06)+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1);} // le lin enduit
        for(let i=1;i<7;i++){const u=i/6.5*w;x.fillStyle='rgba(255,120,110,.28)';x.fillRect(u-3,0,6,h);x.fillStyle='rgba(80,0,0,.5)';for(let y=2;y<h;y+=5)x.fillRect(u-.5,y,1,2);} // les bandes des nervures, cousues
        x.fillStyle='rgba(60,0,0,.35)';x.fillRect(0,0,w,.1*h);x.fillRect(0,.9*h,w,.1*h);                         // les bords d'attaque et de fuite
        x.fillStyle='#c62a2c';x.fillRect(.62*w,.38*h,.12*w,.2*h);x.strokeStyle='rgba(240,220,190,.7)';x.setLineDash([2,2]);x.strokeRect(.62*w,.38*h,.12*w,.2*h);x.setLineDash([]); // la pièce rapiécée
        for(let i=0;i<6;i++){x.fillStyle='rgba(40,20,5,'+(.12+Math.random()*.15)+')';x.beginPath();x.arc(.05*w+Math.random()*.2*w,.2*h+Math.random()*.6*h,3+Math.random()*7,0,Math.PI*2);x.fill();} // l'huile de ricin
      },256,128),
      toile=ailMat({map:tex,shininess:18,specular:0x2a1010}),cote=ailMat({color:0xead8b8,shininess:8}),bois=ailMat({color:0x5a3a1e,shininess:20}),fil=ailMat({color:0x1d1d1d,shininess:60}),
      soie=ailMat({color:0xf4ecd8,shininess:50,specular:0x666666});
    const plan=function(y,k,P,ec){const m=new THREE.Mesh(ailForme(P,sd,.06),toile);m.position.y=y;piv.add(m);
      for(let i=1;i<=6;i++){const c9=ec&&i>=4,n=new THREE.Mesh(new THREE.BoxGeometry(.03,.012,c9?.55:.7),cote);n.position.set(sd*S*k*i/6.5,y+.036,c9?.075:0);piv.add(n);}}; // (les nervures s'arrêtent avant l'aileron)
    plan(.38,1,[[0,-.36],[S*.9,-.36],[S,-.27],[S,.12],[S*.97,.2],[S*.55,.2],[S*.55,.36],[0,.36]],1);          // le plan du haut, échancré pour ses ailerons
    plan(-.02,.94,[[0,-.36],[S*.85,-.36],[S*.94,-.27],[S*.94,.27],[S*.85,.36],[0,.36]]);
    const ai=ailB(new THREE.Group());ai.position.set(sd*S*.76,.38,-.2);piv.add(ai);                       // l'aileron, sur sa charnière
    const am=new THREE.Mesh(new THREE.BoxGeometry(S*.42,.045,.16),toile);am.position.z=-.08;ai.add(am);
    const A=new THREE.Vector3(),B=new THREE.Vector3();
    for(const fx of [.5,.9])for(const fz of [-.24,.24])ailTige(piv,bois,.024,A.set(sd*S*fx,-.02,fz),B.set(sd*S*fx,.38,fz)); // les mâts
    for(const fz of [-.24,.24]){ailTige(piv,fil,.006,A.set(sd*S*.5,-.02,fz),B.set(sd*S*.9,.38,fz));ailTige(piv,fil,.006,A.set(sd*S*.5,.38,fz),B.set(sd*S*.9,-.02,fz));} // les haubans
    const nd=new THREE.Mesh(new THREE.SphereGeometry(.04,6,4),soie);nd.position.set(sd*S*.9,.3,.24);piv.add(nd); // le nœud
    const ech=[],Le=.15;let par=piv;                                                                       // L'ÉCHARPE : sept pans en chaîne
    for(let i=0;i<7;i++){const g=ailB(new THREE.Group());if(i)g.position.z=-Le;else g.position.set(sd*S*.9,.3,.24);par.add(g);
      const ge=new THREE.PlaneGeometry(Le,.1*(1-i*.06));ge.translate(Le/2,0,0);ge.rotateY(Math.PI/2);g.add(new THREE.Mesh(ge,soie));ech.push(g);par=g;}
    ailAnime(function(t,e){const n=AILV.n;piv.rotation.x=n*Math.sin(t*26)*.012*e;                       // la toile vibre sous la poussée
      ai.rotation.x=.5*AILV.vir*sd*e;
      const w=11+9*n,am9=(.32+.4*n)*e;ech[0].rotation.x=-.18*(1-.6*n)*e;
      for(let i=0;i<ech.length;i++){ech[i].rotation.y=am9*(.3+.09*i)*Math.sin(t*w-i*.9);if(i)ech[i].rotation.x=am9*.35*Math.sin(t*w*.7-i*.7+1);}});},
  monarque:function(piv,sd,W9){ // MONARQUE — le vrai dessin : cellules orange, nervures noires, bord noir semé de DEUX rangs de points blancs, l'apex noir taché ;
    // l'aile de devant et celle de derrière battent ensemble (l'arrière un rien en retard), la pointe avance à la descente ; le papillon bat…
    // puis PLANE ailes relevées en V, et rebat ; les écailles accrochent la lumière à chaque coup
    const K=W9*.58,g=ailB(new THREE.Group()),h=ailB(new THREE.Group());piv.add(g);piv.add(h);
    const lisse=function(P){const s=new THREE.Shape();s.moveTo(P[0][0]*K,P[0][1]*K);s.splineThru(P.slice(1).concat([P[0]]).map(function(p){return new THREE.Vector2(p[0]*K,p[1]*K);}));return s;};
    const aile=function(nom,P,R,apex,yo,par){const sh=lisse(P),pts=sh.getPoints(8),bx=[1e9,1e9,-1e9,-1e9];
      for(const p of pts){bx[0]=Math.min(bx[0],p.x);bx[1]=Math.min(bx[1],p.y);bx[2]=Math.max(bx[2],p.x);bx[3]=Math.max(bx[3],p.y);}
      const tex=ailTex(nom,function(x,w,h){const X=function(px,py){return [(px-bx[0])/(bx[2]-bx[0])*w,(1-(py-bx[1])/(bx[3]-bx[1]))*h];},Rk=R*K,
          ins=function(p,k){return [p.x*k,Rk+(p.y-Rk)*k];},chemin=function(k){x.beginPath();pts.forEach(function(p,i){const q=ins(p,k),c=X(q[0],q[1]);if(i)x.lineTo(c[0],c[1]);else x.moveTo(c[0],c[1]);});x.closePath();};
        x.fillStyle='#120b0c';x.fillRect(0,0,w,h);
        const o=X(0,Rk),gr=x.createRadialGradient(o[0],o[1],4,o[0],o[1],w*.9);gr.addColorStop(0,'#b63e06');gr.addColorStop(.45,'#e8620c');gr.addColorStop(1,'#f88a1e');
        chemin(.82);x.fillStyle=gr;x.fill();                                                                    // les cellules ORANGE
        x.strokeStyle='#120b0c';x.lineCap='round';x.lineWidth=w*.024;
        for(let i=Math.round(pts.length*.08);i<pts.length*.92;i+=Math.round(pts.length/8)){const q=ins(pts[i],.86),c=X(q[0],q[1]);x.beginPath();x.moveTo(o[0],o[1]);x.quadraticCurveTo((o[0]+c[0])*.5+w*.03,(o[1]+c[1])*.5,c[0],c[1]);x.stroke();} // les nervures
        x.lineWidth=w*.016;chemin(.42);x.stroke();                                                             // la cellule discale
        for(const r of [[.93,.017],[.88,.011]])for(let i=0;i<pts.length;i+=2){const q=ins(pts[i],r[0]),c=X(q[0],q[1]);if(q[0]<.06*K)continue;
          x.fillStyle='#fff6e6';x.beginPath();x.arc(c[0],c[1],w*r[1],0,Math.PI*2);x.fill();}                  // DEUX rangs de points blancs dans le bord noir
        if(apex){let m=pts[0];for(const p of pts)if(p.x>m.x)m=p;for(let i=0;i<5;i++){const q=ins(m,.78-i*.06),c=X(q[0],q[1]-(i-2)*.05*K);x.fillStyle=i%2?'#ffd29a':'#fff6e6';
          x.beginPath();x.arc(c[0],c[1],w*.024,0,Math.PI*2);x.fill();}}},256,256);                            // les taches de l'apex
      const m=new THREE.Mesh(ailForme(sh,sd,0,[bx[0],bx[1],bx[2],bx[3]]),mat(tex));m.position.y=yo;par.add(m);return m;};
    const MT=[],mat=function(tex){const m=ailMat({map:tex,emissiveMap:tex,emissive:0xc04a00,emissiveIntensity:.55,shininess:24,specular:0x221a1a});MT.push(m);return m;};
    aile('monarqueA',[[0,-.05],[.3,-.32],[.75,-.5],[1.2,-.52],[1.5,-.4],[1.55,-.15],[1.3,.12],[.8,.22],[.3,.22],[0,.18]],.06,1,0,g);
    aile('monarqueP',[[0,.18],[.45,.2],[.85,.35],[1.05,.6],[.95,.9],[.62,1.05],[.3,.95],[.1,.7],[0,.45]],.3,0,-.008,h);
    let ph=0;
    ailAnime(function(t,e,dt){const n=AILV.n,c=(t*.37)%1,pl=n<.3&&!AILV.photo&&c>.76?Math.min(1,(c-.76)/.05,(1-c)/.05):0; // de temps en temps il PLANE
      ph+=dt*(2.3+1.9*n+.5*Math.max(0,AILV.mon))*(1-pl);const P=AILV.photo,b=P?-.3:ailBat(ph),bh=P?-.25:ailBat(ph-.06);
      g.rotation.z=sd*((.42+.56*b)*(1-pl)+.5*pl)*e;h.rotation.z=sd*((.42+.56*bh)*(1-pl)+.46*pl)*e;
      g.rotation.y=sd*.1*b*e;const em=.45+.3*Math.max(0,-b)+.35*n;for(const m of MT)m.emissiveIntensity=em;});},
  dragon:function(piv,sd,W9){ // DRAGON — l'avant-bras et la MAIN articulés au poignet (la membrane est coupée là) : la main bat en retard sur le bras, l'aile
    // fait une vague ; quatre doigts griffus, des épines, la griffe du pouce ; les veines de LAVE rougeoient au bas de chaque coup ; au boost les coups
    // redoublent, la lave flambe et des BRAISES s'arrachent du bord de fuite
    const S=W9*1.22,Sy=S*.62,Y0=-.35,Y1=1, // le contour en unités (x de 0 à 1, y de Y0 à Y1) : la texture se dessine dans la même boîte
      C=function(X,Y,w,h){return [X*w,(1-(Y-Y0)/(Y1-Y0))*h];},
      TIP=[[1,-.18],[.93,.52],[.68,.92],[.36,1]],CR=[[.78,.12],[.66,.5],[.47,.68],[.22,.64]],W=[.5,-.35];
    const trace=function(x,w,h){const m=function(p){const q=C(p[0],p[1],w,h);return q;};let q=m([0,-.12]);x.beginPath();x.moveTo(q[0],q[1]);q=m(W);x.lineTo(q[0],q[1]);q=m(TIP[0]);x.lineTo(q[0],q[1]);
      for(let i=1;i<4;i++){const c=m(CR[i-1]),p=m(TIP[i]);x.quadraticCurveTo(c[0],c[1],p[0],p[1]);}const c=m(CR[3]),p=m([0,.6]);x.quadraticCurveTo(c[0],c[1],p[0],p[1]);x.closePath();};
    const veines=function(x,w,h,col,lw){const m=function(p){return C(p[0],p[1],w,h);},o=m(W);x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';
      for(let i=0;i<4;i++){const c=m(CR[i]),a=m(TIP[i]);for(const f of [.35,.6,.82]){const p=[TIP[i][0]+(CR[i][0]-TIP[i][0])*f*.7,TIP[i][1]+(CR[i][1]-TIP[i][1])*f*.7],q=m(p);
          x.beginPath();x.moveTo(o[0]+(a[0]-o[0])*f*.55,o[1]+(a[1]-o[1])*f*.55);x.quadraticCurveTo((o[0]+q[0])*.5+8,(o[1]+q[1])*.5,q[0],q[1]);x.stroke();}
        x.beginPath();x.moveTo(o[0],o[1]);x.quadraticCurveTo((o[0]+c[0])*.5,(o[1]+c[1])*.5+10,c[0],c[1]);x.stroke();}};
    const tex=ailTex('dragonP',function(x,w,h){const o=C(W[0],W[1],w,h),g=x.createRadialGradient(o[0],o[1],10,o[0],o[1],w*1.1);
      g.addColorStop(0,'#5a1014');g.addColorStop(.5,'#2e080b');g.addColorStop(1,'#140407');x.fillStyle=g;x.fillRect(0,0,w,h);
      for(let i=0;i<260;i++){x.fillStyle='rgba(0,0,0,'+(Math.random()*.25)+')';x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*4,0,Math.PI*2);x.fill();} // le cuir
      veines(x,w,h,'rgba(20,3,4,.85)',5);},256,256);
    const lum=ailTex('dragonL',function(x,w,h){x.fillStyle='#000';x.fillRect(0,0,w,h);x.shadowColor='#ff4a00';x.shadowBlur=10;veines(x,w,h,'#ff7a1a',2.6); // les veines de LAVE (carte d'émission)
      x.shadowBlur=14;trace(x,w,h);x.strokeStyle='#ff5a10';x.lineWidth=5;x.stroke();},256,256);                                                     // et le bord qui couve
    const mem=ailMat({color:0x9c8a8a,map:tex,emissiveMap:lum,emissive:0xff5a14,emissiveIntensity:.9,shininess:25,specular:0x332222}),
      os=ailMat({color:0x2a1d1f,shininess:50,specular:0x554444}),ivoire=ailMat({color:0xe9dcc2,shininess:60});
    const PU=[[0,-.12],W,TIP[0]];for(let i=1;i<4;i++)ailQuad(PU,TIP[i-1],CR[i-1],TIP[i],8);ailQuad(PU,TIP[3],CR[3],[0,.6],8);
    const PP=PU.map(function(p){return [p[0]*S,p[1]*Sy];}),bx=[0,Y0*Sy,S,Y1*Sy],xc=W[0]*S;
    const bras=ailB(new THREE.Group()),main=ailB(new THREE.Group());piv.add(bras);main.position.x=sd*xc;bras.add(main);
    bras.add(new THREE.Mesh(ailForme(ailCoupe(PP,xc,-1),sd,0,bx),mem));                                     // la membrane du BRAS
    const gm=ailForme(ailCoupe(PP,xc,1),sd,0,bx);gm.translate(-sd*xc,0,0);main.add(new THREE.Mesh(gm,mem)); // celle de la MAIN, sur sa charnière
    const V=function(p,y){return new THREE.Vector3(sd*p[0]*S,y||.02,-p[1]*Sy);},Vm=function(p,y){return V(p,y).setX(sd*(p[0]*S-xc));},wr=V(W);
    ailTige(bras,os,.06,V([0,-.12]),wr,.042);                                                               // l'avant-bras
    const kn=new THREE.Mesh(new THREE.SphereGeometry(.06,6,5),os);kn.position.copy(wr);bras.add(kn);       // le poignet
    for(const f of [.25,.5,.75])ailPointe(bras,os,.032,.15,V([W[0]*f,-.12+(W[1]+.12)*f],.04),new THREE.Vector3(0,1,.35)); // les épines du bras
    ailPointe(bras,ivoire,.05,.26,wr.clone().add(new THREE.Vector3(0,.03,.02)),new THREE.Vector3(sd*.15,.25,1));        // la GRIFFE du pouce
    const w0=Vm(W),TP=[];
    for(let i=0;i<4;i++){const tp=Vm(TIP[i]);ailTige(main,os,.034,w0,tp,.012);TP.push(tp);                 // les quatre doigts…
      ailPointe(main,ivoire,.022,.13,tp,tp.clone().sub(w0));}                                               // …et leurs griffes
    for(const f of [.35,.7])ailPointe(main,os,.024,.11,w0.clone().lerp(TP[0],f).setY(.04),new THREE.Vector3(0,1,.3)); // les épines du bord d'attaque
    const fx=ailEtincelles(piv,18,.07,new THREE.Color(2.6,.9,.25)),T=new THREE.Vector3();
    let ph=0,acc=0,b0=0;
    ailAnime(function(t,e,dt){const n=AILV.n;ph+=dt*(.72+.5*n+.2*Math.max(0,AILV.mon));
      const P=AILV.photo,b=P?0:ailBat(ph),bl=P?.12:ailBat(ph-.11);
      if(b0>=0&&b<0&&sd>0)ailSon('ailes.dragon',e,-1+4*n);b0=b;                                       // (2026-10-16, son) au plus vite du coup, le WOUF de l'air chassé (plus fort au boost)
      bras.rotation.z=sd*(.1+.42*b)*e;main.rotation.z=sd*(.55*(bl-b)+.06)*e;                           // le BRAS donne le coup, la MAIN suit en retard
      mem.emissiveIntensity=.5+.18*(1-b)+1.1*n+.1*Math.sin(t*3.1);                                        // la lave rougeoie au bas du coup, flambe au boost
      acc+=dt*(1+24*n);while(acc>=1){acc-=1;const i=1+((Math.random()*3)|0);T.copy(w0).lerp(TP[i],.45+Math.random()*.55); // les BRAISES, du bord de fuite
        ailRz(T,main.rotation.z);T.x+=sd*xc;ailRz(T,bras.rotation.z);
        fx.pousse(T.x,T.y,T.z,sd*(Math.random()-.3)*.8,.8+Math.random()*1.8,-1.2-Math.random()*2,.6+Math.random()*.7,.5+Math.random()*.6);}
      fx.pas(dt,1.6,1.2);});},
  phenix:function(piv,sd,W9){ // PHÉNIX — des plumes de feu (du rouge à l'emplanture au blanc chauffé au bout) sur un BRAS et une MAIN qui battent en vague ;
    // chaque rémige vacille comme une flamme et un essaim d'ÉTINCELLES monte des pointes — au boost les plumes s'ouvrent en grand et le feu redouble
    const S=W9*1.15,xc=S*.4,bras=ailB(new THREE.Group()),main=ailB(new THREE.Group());piv.add(bras);main.position.x=sd*xc;bras.add(main);
    const vc=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}),
      halo=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const plume=function(par,len,w,dim,x,y,z,ang,bouge){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(len*.45,-w,len,0);s.quadraticCurveTo(len*.45,w*.7,0,0);
      const ge=ailForme(s,sd),ps=ge.attributes.position,cl=new Float32Array(ps.count*3);
      for(let i=0;i<ps.count;i++){const u=Math.min(1,Math.abs(ps.getX(i))/len),o=i*3;let r,gg,b;
        if(u<.35){const f=u/.35;r=1+.6*f;gg=.12+.43*f;b=.02+.03*f;}else if(u<.75){const f=(u-.35)/.4;r=1.6+.3*f;gg=.55+.7*f;b=.05+.2*f;}else{const f=(u-.75)/.25;r=1.9+.3*f;gg=1.25+.75*f;b=.25+1.05*f;}
        cl[o]=r*dim;cl[o+1]=gg*dim;cl[o+2]=b*dim;}
      ge.setAttribute('color',new THREE.BufferAttribute(cl,3));
      const f=new THREE.Group();if(bouge)ailB(f);f.position.set(x,y,z);f.rotation.y=sd*ang;par.add(f);f.add(new THREE.Mesh(ge,vc));
      const hm=new THREE.Mesh(ge,halo);hm.scale.set(1.06,1,1.9);hm.position.y=-.01;f.add(hm);return f;};
    for(let k=0;k<6;k++)plume(bras,S*.48,.24*S/2.3,.8,0,.012,0,-.25+k*.22);                              // les couvertures, plus sombres
    for(let k=0;k<5;k++)plume(bras,S*.5,.22*S/2.3,.9,sd*S*(.06+k*.075),-.004,-.05,1.25-k*.08);              // les secondaires, le long du bras
    const pr=[],pr0=[],PL=[];
    for(let k=0;k<7;k++){const L=S*(.7-k*.03),a=-.3+k*.19;pr.push(plume(main,L,.27*S/2.3,1,0,-.002*k,.04-k*.025,a,1));pr0.push(a);PL.push(L);} // les RÉMIGES, sur la main
    const fx=ailEtincelles(piv,28,.055,new THREE.Color(2.6,1.7,.55)),T=new THREE.Vector3();
    let ph=0,acc=0;
    ailAnime(function(t,e,dt){const n=AILV.n;ph+=dt*(.8+.55*n);const P=AILV.photo,b=P?.4:ailBat(ph),bl=P?.66:ailBat(ph-.1);
      bras.rotation.z=sd*(.14+.3*b)*e;main.rotation.z=sd*(.45*(bl-b)+.05)*e;halo.opacity=(AILE_K_ON?.4:.25)+.12*Math.sin(t*17)+.15*n; /* (15/10 soir) le halo relevé (AILE_K_ON) */
      for(let i=0;i<pr.length;i++){const f=pr[i];f.rotation.y=sd*(pr0[i]*(1+.35*n)+.035*Math.sin(t*7+i));f.scale.x=1+.07*Math.sin(t*12+i*1.9)+.1*n;}
      acc+=dt*(6+34*n);while(acc>=1){acc-=1;const i=(Math.random()*pr.length)|0,a=pr[i].rotation.y*sd,L=PL[i]*(.8+Math.random()*.25); // les ÉTINCELLES, des pointes
        T.set(sd*L*Math.cos(a),0,pr[i].position.z-L*Math.sin(a));ailRz(T,main.rotation.z);T.x+=sd*xc;ailRz(T,bras.rotation.z);
        fx.pousse(T.x,T.y,T.z,sd*(Math.random()-.4)*.6,1+Math.random()*2,-.8-Math.random()*1.6,.5+Math.random()*.7,.5+Math.random()*.7);}
      fx.pas(dt,2.2,1.4);});},
  fee:function(piv,sd,W9,L9,H9,y0){ // FÉE — quatre voiles irisés qui naissent du TOIT, en ailes de fée (pointe effilée devant, queue d'hirondelle derrière) ;
    // l'avant et l'arrière battent en OPPOSITION, comme une libellule, un voile FANTÔME dit le flou du bourdonnement ; une POUSSIÈRE DE FÉE
    // scintille et tombe des pointes (une pluie au boost) ; les couleurs tournent
    piv.position.y=y0+H9*.92;
    const K=W9*.62,mats=[],fant=[];
    const voile=function(nom,sh,rotY,base,ph){const pts=sh.getPoints(10),bx=[1e9,1e9,-1e9,-1e9];for(const p of pts){bx[0]=Math.min(bx[0],p.x);bx[1]=Math.min(bx[1],p.y);bx[2]=Math.max(bx[2],p.x);bx[3]=Math.max(bx[3],p.y);}
      const tex=ailTex(nom,function(x,w,h){const X=function(p){return [(p.x-bx[0])/(bx[2]-bx[0])*w,(1-(p.y-bx[1])/(bx[3]-bx[1]))*h];},ch=function(){x.beginPath();pts.forEach(function(p,i){const c=X(p);if(i)x.lineTo(c[0],c[1]);else x.moveTo(c[0],c[1]);});x.closePath();};
        x.save();ch();x.clip();const g=x.createLinearGradient(0,0,w,h*.3);g.addColorStop(0,'#7fe8ff');g.addColorStop(.4,'#c79bff');g.addColorStop(.75,'#ff8fd0');g.addColorStop(1,'#ffe48a');x.fillStyle=g;x.fillRect(0,0,w,h);
        x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2.4;const o=X({x:0,y:0});x.beginPath();x.moveTo(o[0],o[1]);x.quadraticCurveTo(w*.5,h*.42,w*.96,h*.5);x.stroke(); // la nervure maîtresse
        x.lineWidth=1.1;for(let i=1;i<11;i++){const u=i/11;x.beginPath();x.moveTo(w*u*.95,h*(.44+.04*u));x.quadraticCurveTo(w*(u+.05),h*.18,w*(u+.1),0);x.stroke();
          x.beginPath();x.moveTo(w*u*.95,h*(.5+.02*u));x.quadraticCurveTo(w*(u+.05),h*.8,w*(u+.1),h);x.stroke();}
        for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,'+(.3+Math.random()*.6)+')';x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);} // les paillettes
        x.restore();x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=3;ch();x.stroke();},256,128);
      const mat=ailMat({map:tex,transparent:true,opacity:AILE_K_ON?.88:.74,depthWrite:false,shininess:120,specular:0xffffff,emissive:0x334455,emissiveIntensity:AILE_K_ON?1.15:.6,envMap:envTex,reflectivity:.18,combine:THREE.MixOperation}), /* (15/10 soir) des voiles qui se voient (AILE_K_ON) */
        mf=ailMat({map:tex,transparent:true,opacity:.2,depthWrite:false,shininess:60,emissive:0x334455,emissiveIntensity:.8});mats.push(mat);fant.push(mf);
      const ge=ailForme(sh,sd,0,[bx[0],bx[1],bx[2],bx[3]]);
      const gr=ailB(new THREE.Group());piv.add(gr);const m=new THREE.Mesh(ge,mat);m.rotation.y=sd*rotY;gr.add(m);
      const gf=ailB(new THREE.Group());piv.add(gf);const mf9=new THREE.Mesh(ge,mf);mf9.rotation.y=sd*rotY;gf.add(mf9); // le FANTÔME, à l'autre bout du battement
      let tp={x:0,y:0};for(const p of pts)if(p.x>tp.x)tp=p;const tip=ailRy(new THREE.Vector3(sd*tp.x,0,-tp.y),sd*rotY);
      return {g:gr,f:gf,b:base,ph:ph,tip:tip};};
    const L1=1.6*K,W1=.44*K,s1=new THREE.Shape();s1.moveTo(0,0);s1.bezierCurveTo(.25*L1,-.5*W1,.8*L1,-.62*W1,L1,-.32*W1);s1.bezierCurveTo(1.05*L1,-.05*W1,.75*L1,.42*W1,.4*L1,.36*W1);s1.quadraticCurveTo(.12*L1,.3*W1,0,0);
    const L2=1.1*K,W2=.5*K,s2=new THREE.Shape();s2.moveTo(0,0);s2.bezierCurveTo(.2*L2,-.3*W2,.75*L2,-.45*W2,.92*L2,-.15*W2);s2.bezierCurveTo(1.04*L2,.1*W2,.98*L2,.55*W2,.8*L2,.85*W2);
    s2.quadraticCurveTo(.62*L2,.42*W2,.32*L2,.38*W2);s2.quadraticCurveTo(.1*L2,.3*W2,0,0);
    const V=[voile('feeA',s1,.18,.42,0),voile('feeP',s2,.75,.2,Math.PI)];
    const fx=ailEtincelles(piv,26,.035,new THREE.Color(1.7,1.45,2.1),{tw:1}),T=new THREE.Vector3();
    let acc=0;
    ailAnime(function(t,e,dt){const n=AILV.n,w=38+22*n,am=(.22+.1*n),P=AILV.photo;
      for(const v of V){const s=P?.6:Math.sin(t*w+v.ph);v.g.rotation.z=sd*(v.b+am*s)*e;v.f.rotation.z=sd*(v.b-am*s)*e;}
      for(let i=0;i<mats.length;i++){mats[i].emissive.setHSL((t*.08+i*.15)%1,AILE_K_ON?.85:.7,(AILE_K_ON?.3:.22)+.08*n);fant[i].emissive.copy(mats[i].emissive);}
      acc+=dt*(5+30*n);while(acc>=1){acc-=1;const v=V[Math.random()<.65?0:1];T.copy(v.tip).multiplyScalar(.45+Math.random()*.55);ailRz(T,v.g.rotation.z); // la POUSSIÈRE DE FÉE
        fx.pousse(T.x,T.y,T.z,sd*(Math.random()-.5)*.4,-.15-Math.random()*.4,-.4-Math.random()*.9,1+Math.random()*.9,.6+Math.random()*.8);}
      fx.pas(dt,-.5,.9);});},
  rouages:function(piv,sd,W9){ // ENGRENAGES — l'ORNITHOPTÈRE de Léonard : la grande roue dentée tourne, son MANETON tire une BIELLE qui fait battre l'aile
    // (le battement EST le mouvement des rouages) ; la voile se gonfle à chaque coup ; au boost la machine s'emballe, l'aiguille du MANOMÈTRE
    // grimpe et la chaudière crache sa VAPEUR
    const S=W9*1.05,laiton=ailMat({color:0xc8902e,shininess:95,specular:0xffe2a0,envMap:envTex,reflectivity:.28,combine:THREE.MixOperation}),cuivre=ailMat({color:0xa0522d,shininess:70,specular:0xffc090});
    const voile=ailMat({shininess:6,specular:0x111111,map:ailTex('voile',function(x,w,h){const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#efe2bf');g.addColorStop(1,'#d9c393');x.fillStyle=g;x.fillRect(0,0,w,h);
      for(let i=0;i<900;i++){x.fillStyle='rgba(120,90,40,'+(Math.random()*.08)+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1);} // la fibre
      x.strokeStyle='rgba(110,75,30,.5)';x.setLineDash([5,4]);x.lineWidth=1.5;for(let i=1;i<6;i++){x.beginPath();x.moveTo(w*i/6,0);x.lineTo(w*i/6,h);x.stroke();} // les coutures
      x.setLineDash([]);x.strokeStyle='rgba(90,60,25,.35)';x.lineWidth=1;for(let i=0;i<14;i++){x.beginPath();x.arc(w*.3,h*.5,20+i*9,-.6,.9);x.stroke();} // le croquis, au crayon
      x.strokeStyle='rgba(100,70,30,.8)';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);})});
    const A=new THREE.Vector3(),B=new THREE.Vector3(),bord=[[0,-.04],[S,-.04],[S*.97,.3],[S*.72,.52],[S*.45,.66],[S*.18,.7],[0,.62]];
    const ail=ailB(new THREE.Group());piv.add(ail);                                                          // L'AILE qui bat : voile, longeron, nervures, rivets
    const v=ailB(new THREE.Mesh(ailForme(bord,sd),voile));v.position.y=-.012;ail.add(v);
    ailTige(ail,laiton,.045,A.set(0,0,.04),B.set(sd*S,0,.04),.03);                                         // le longeron
    for(let i=2;i<6;i++)ailTige(ail,laiton,.018,A.set(sd*bord[i][0]*.55,0,.04),B.set(sd*bord[i][0],0,-bord[i][1])); // les nervures
    for(let i=1;i<7;i++){const r=new THREE.Mesh(new THREE.SphereGeometry(.028,6,4),cuivre);r.position.set(sd*S*i/7,.035,.04);ail.add(r);} // les rivets
    const roue=function(r,n){const s=new THREE.Shape(),N=n*4;for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,rr=(i%4<2)?r:r*.82;if(i)s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);else s.moveTo(rr,0);}
      for(let i=0;i<4;i++){const h=new THREE.Path(),a=i*Math.PI/2+.4;h.absarc(Math.cos(a)*r*.5,Math.sin(a)*r*.5,r*.17,0,Math.PI*2,true);s.holes.push(h);}
      const ge=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false,curveSegments:6});ge.rotateX(-Math.PI/2);ge.translate(0,-.025,0);return ailB(new THREE.Mesh(ge,laiton));};
    const g1=roue(.32,12),g2=roue(.2,8),G1=new THREE.Vector3(sd*.42,.06,-.14);g1.position.copy(G1);g2.position.set(sd*(.42+.32+.2-.05),.06,-.14);piv.add(g1);piv.add(g2);
    const mt=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.09,8),cuivre);mt.position.set(.2,.06,0);g1.add(mt);                  // le MANETON, sur la grande roue
    const bi=ailB(new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1,6),laiton));piv.add(bi);                                    // la BIELLE
    const ch=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.42,12),cuivre);ch.rotation.z=Math.PI/2;ch.position.set(sd*.2,.12,.26);piv.add(ch); // la chaudière,
    const che=new THREE.Mesh(new THREE.CylinderGeometry(.032,.04,.16,8),laiton);che.position.set(sd*.08,.3,.26);piv.add(che);                     // sa cheminée,
    const ca=new THREE.Mesh(new THREE.CircleGeometry(.065,16),ailMat({color:0xf2ead8,shininess:30}));ca.rotation.x=-Math.PI/2;ca.position.set(sd*.3,.232,.26);piv.add(ca); // son MANOMÈTRE
    const ce=new THREE.Mesh(new THREE.TorusGeometry(.068,.012,4,16),laiton);ce.rotation.x=Math.PI/2;ce.position.copy(ca.position);piv.add(ce);
    const ai=ailB(new THREE.Group());ai.position.copy(ca.position).add(new THREE.Vector3(0,.006,0));piv.add(ai);
    const ag=new THREE.Mesh(new THREE.BoxGeometry(.008,.004,.055),ailMat({color:0xc0201a,shininess:20}));ag.position.z=.022;ai.add(ag);
    const vap=ailEtincelles(piv,16,.07,new THREE.Color(.92,.92,.95),{normal:1,op:.55,grow:1}),Y=new THREE.Vector3(0,1,0),P1=new THREE.Vector3(),P2=new THREE.Vector3(),Q=new THREE.Quaternion();
    let cr=0,acc=0;
    ailAnime(function(t,e,dt){const n=AILV.n;cr+=dt*(1.8+5.5*n)*e;                                        // la manivelle
      g1.rotation.y=cr*sd;g2.rotation.y=-cr*1.5*sd+.2;
      const P=AILV.photo,a=sd*(.1+.22*(P?.5:Math.sin(cr)))*e;ail.rotation.z=a;v.scale.z=1+.05*Math.cos(cr)*e;      // l'aile bat AU RYTHME de la roue
      P1.set(.2*Math.cos(cr*sd),.11,-.2*Math.sin(cr*sd)).add(G1);P2.set(sd*S*.55,0,.04);ailRz(P2,a);              // la bielle : du maneton au longeron
      bi.position.copy(P1).add(P2).multiplyScalar(.5);P2.sub(P1);bi.scale.y=P2.length();bi.quaternion.setFromUnitVectors(Y,P2.normalize());
      ai.rotation.y=-(-1.1+2.3*n+(n>.5?.06*Math.sin(t*40):0));                                                    // l'aiguille grimpe
      acc+=dt*(1.2+14*n);while(acc>=1){acc-=1;vap.pousse(sd*.08+(Math.random()-.5)*.03,.4,.26,(Math.random()-.5)*.3,.7+Math.random()*.6,-.5-Math.random()*.8,.8+Math.random()*.6,.6+Math.random()*.6);}
      vap.pas(dt,.4,1.8);});},
  pixel:function(piv,sd,W9){ // 8-BIT — des ailes d'ange en VOXELS animées IMAGE PAR IMAGE, comme un sprite : à chaque image l'aile se plie en ESCALIER
    // (un cran de pixel par colonne), monte, s'aplatit, descend ; au boost elles clignotent de toutes les couleurs (l'étoile d'invincibilité)
    // et des pixels d'étincelle s'allument au bout
    const M=['GGGGGGGGGG..','WWWWWWWWWWWG','WWWWWWWWWWW.','BWWWWWWWWW..','BBWWWWWWWW..','.BWWWBWWWB..','.BBWW.BWW...','..BW..BW....','..B...B.....'],
      c=W9*.075,P0={G:[1,.84,.37],W:[.95,.965,1],B:[.61,.76,1]},cel=[];
    M.forEach(function(r,y){for(let k=0;k<r.length;k++)if(P0[r[k]])cel.push([k,y,r[k]]);});
    const n=cel.length,NE=4,im=new THREE.InstancedMesh(new THREE.BoxGeometry(c*.96,c*.55,c*.96),ailMat({shininess:30,specular:0x555555,side:THREE.FrontSide}),n+NE);
    im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array((n+NE)*3),3);im.frustumCulled=false;ailB(im);
    const g=ailB(new THREE.Group());piv.add(g);g.add(im);const m4=new THREE.Matrix4(),Z=new THREE.Matrix4().makeScale(0,0,0),col=new THREE.Color(),c2=new THREE.Color();
    const IM=[{r:.34,b:.5},{r:.2,b:.2},{r:.02,b:-.25},{r:.2,b:.2}];                                          // les quatre images du battement
    const EC=[];for(let i=0;i<NE;i++){EC.push({a:1,l:.3,k:0,y:0});im.setMatrixAt(n+i,Z);im.instanceColor.setXYZ(n+i,1,1,.85);}
    const pose=function(fi,arc,fr){const F=IM[fi];g.rotation.z=sd*F.r*wingT;
      for(let i=0;i<n;i++){const C=cel[i],k=C[0],y=C[1],b=P0[C[2]];
        m4.makeTranslation(sd*(k+.5)*c,(C[2]==='G'?.012:0)+Math.round(k*F.b)*c*.55,.35+.5*c-y*c);im.setMatrixAt(i,m4);
        if(arc<.05)col.setRGB(b[0],b[1],b[2]);else{col.setHSL((fr*.17+k*.07+y*.05)%1,.95,.6);col.lerp(c2.setRGB(b[0],b[1],b[2]),1-arc);}
        im.instanceColor.setXYZ(i,col.r,col.g,col.b);}
      im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;};
    pose(1,0,0);
    let ph=0,fr0=-1,arc0=0,acc=0;
    ailAnime(function(t,e,dt){const arc=AILV.photo?0:AILV.n;ph+=dt*(7+5*arc);const fr=Math.floor(ph),fi=AILV.photo?0:fr%4;
      if(fr!==fr0||(arc>.05)!==(arc0>.05)){pose(fi,arc,fr);fr0=fr;}arc0=arc;g.rotation.z=sd*IM[fi].r*e;
      acc+=dt*(2+12*arc);while(acc>=1){acc-=1;const E=EC[(Math.random()*NE)|0];if(E.a<E.l)continue;E.a=0;E.k=6+Math.random()*6;E.y=Math.random()*5;} // une étincelle-pixel s'allume
      for(let i=0;i<NE;i++){const E=EC[i];if(E.a>=E.l)continue;E.a+=dt;if(E.a>=E.l){im.setMatrixAt(n+i,Z);continue;}const s=Math.sin(E.a/E.l*Math.PI);
        m4.makeScale(s,s*1.6,s);m4.setPosition(sd*(E.k+.5)*c,c*.9+Math.round(E.k*IM[fi].b)*c*.55,.35+.5*c-E.y*c);im.setMatrixAt(n+i,m4);}
      im.instanceMatrix.needsUpdate=true;});},
  pigeon:function(piv,sd,W9){ // PIGEON — couvertures grises, DEUX BARRES NOIRES, cou IRISÉ qui passe du vert au violet ; la MAIN (les rémiges) bat en retard
    // sur le bras et s'ouvre en doigts quand il plane ; il CLAQUE des ailes en sortant (deux claps au-dessus du dos), bat trop vite… puis plane
    // (toujours battant quand il monte ou boost)
    const S=W9*.95,g=ailB(new THREE.Group()),h=ailB(new THREE.Group());piv.add(g);h.position.x=sd*S*.5;g.add(h);
    const gris=ailMat({color:0x9aa1ac,shininess:18,specular:0x222222}),fonce=ailMat({color:0x454a54,shininess:14,specular:0x222222}),sombre=ailMat({color:0x272a31,shininess:14,specular:0x222222}),
      noir=ailMat({color:0x1b1c21,shininess:20}),sec=ailMat({color:0x7d838e,shininess:14,specular:0x222222}),reflet=ailMat({color:0x3d5c4c,shininess:110,specular:0xb36bff});
    g.add(new THREE.Mesh(ailForme([[0,-.2],[S*.3,-.26],[S*.52,-.24],[S*.56,.06],[S*.48,.34],[S*.25,.44],[0,.42]],sd,.03),gris)); // les couvertures
    for(const z of [.17,.3]){const b=new THREE.Mesh(new THREE.BoxGeometry(S*.38,.012,.055),noir);b.position.set(sd*S*.3,.022,-z);g.add(b);}     // les DEUX BARRES
    const rf=new THREE.Mesh(ailForme([[0,-.18],[S*.16,-.2],[S*.18,.1],[0,.14]],sd,.034),reflet);rf.position.y=.004;g.add(rf);
    const plume=function(par,len,w,mat,x,z,a,bouge){const s=new THREE.Shape();s.moveTo(0,-w*.5);s.lineTo(len*.8,-w*.5);s.quadraticCurveTo(len,-w*.3,len,0);s.quadraticCurveTo(len*.98,w*.5,len*.75,w*.5);s.lineTo(0,w*.5);s.closePath();
      const m=new THREE.Mesh(ailForme(s,sd,.018),mat);m.position.set(sd*x,-.008,-z);m.rotation.y=sd*a;if(bouge)ailB(m);par.add(m);return m;};
    const pr=[],pr0=[];for(let k=0;k<7;k++){pr.push(plume(h,S*(.55-k*.03),.18,k%2?sombre:fonce,0,.02+k*.03,-.15+k*.12,1));pr0.push(-.15+k*.12);} // les primaires, sur la main
    for(let k=0;k<5;k++)plume(g,S*.36,.13,sec,S*(.08+k*.1),.34,1.35);                                                      // les secondaires
    let ph=0,clap=0,w0=0,cy=0;
    ailAnime(function(t,e,dt){const n=AILV.n,P=AILV.photo;
      if(e>.85&&w0<=.85&&!P){clap=.62;if(sd>0)ailSon('ailes.pigeon',e);}w0=e;cy=(cy+dt)%2.4;                // il vient de sortir les ailes : CLAP CLAP (2026-10-16 : et on les entend, à +0,155 et +0,465 s)
      const bat=P||n>.3||AILV.mon>.25||cy<1.4;let a,hr,fan;
      if(clap>0){clap-=dt;const s=Math.abs(Math.sin(Math.max(0,clap)/.62*Math.PI*2));a=.15+.95*s;hr=.2*s;fan=.15;}   // deux claps : les ailes se touchent au-dessus du dos
      else if(P){a=.14;hr=.06;fan=.4;}                                                                    // la photo : à plat, les doigts écartés
      else if(bat){ph+=dt*(6.5+3*n);const b=ailBat(ph);a=.1+.42*b;hr=.5*(ailBat(ph-.08)-b)+.04;fan=.25-.15*b;}
      else{a=.16+.03*Math.sin(t*3);hr=-.04;fan=.65;}                                                        // il PLANE : ailes en V, les doigts écartés
      g.rotation.z+=(sd*a*e-g.rotation.z)*Math.min(1,dt*(bat||clap>0?40:7));h.rotation.z=sd*hr*e;
      for(let i=0;i<pr.length;i++)pr[i].rotation.y=sd*(pr0[i]+fan*(i-3)*.08);
      const ir=.5+.5*Math.sin(t*1.3);reflet.color.setHSL(.38+.4*ir,.42,.3);reflet.specular.setHSL(.78-.4*ir,.8,.6);});}, // le cou irisé : vert ↔ violet
  origami:function(piv,sd,W9){ // AVION EN PAPIER — une feuille à grands carreaux GRIBOUILLÉE (étoile, cœur, spirale, une petite voiture au crayon, un rond de café) ;
    // le pan du dehors CLAQUE au vent autour du pli (fort au boost), le volet plié du bord de fuite suit la montée et le virage
    const S=W9*1.1,Sy=S*.62,g=ailB(new THREE.Group());piv.add(g);
    const P=function(X,Y){return new THREE.Vector3(sd*X*S,0,-Y*Sy);},A=P(0,-.85),B=P(1,.42),C=P(0,.55),M=P(.45,.4915);
    const u=new THREE.Vector3().subVectors(M,A).normalize();let sg=1;{const b=B.clone().sub(A).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(u,.42));if(b.y<0)sg=-1;} // le pan doit MONTER
    const papier=ailMat({shininess:6,specular:0x222222,flatShading:true,map:ailTex('seyesG',function(x,w,h){x.fillStyle='#fbfaf5';x.fillRect(0,0,w,h);
      for(let y=0;y<h;y+=8){x.fillStyle=y%32===0?'#8fb6e6':'#c4dbf3';x.fillRect(0,y,w,1);}                 // le cahier à grands carreaux
      for(let xx=32;xx<w;xx+=32){x.fillStyle='#c4dbf3';x.fillRect(xx,0,1,h);}x.fillStyle='#e88a9a';x.fillRect(40,0,2,h); // et sa marge rouge
      x.lineCap='round';x.lineJoin='round';
      x.strokeStyle='rgba(120,90,50,.28)';x.lineWidth=3;x.beginPath();x.arc(.2*w,.16*h,.07*w,0,Math.PI*1.8);x.stroke();  // le rond de café
      x.strokeStyle='#6d6d78';x.lineWidth=2;x.beginPath();for(let i=0;i<=10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.022*w:.055*w;const px=.14*w+Math.cos(a)*r,py=.4*h+Math.sin(a)*r;if(i)x.lineTo(px,py);else x.moveTo(px,py);}x.stroke(); // l'étoile au crayon
      x.strokeStyle='#d8344a';x.lineWidth=2.4;x.beginPath();const hx=.62*w,hy=.17*h,hs=.03*w;x.moveTo(hx,hy+hs);x.bezierCurveTo(hx-2.2*hs,hy-.4*hs,hx-.9*hs,hy-1.9*hs,hx,hy-.6*hs);x.bezierCurveTo(hx+.9*hs,hy-1.9*hs,hx+2.2*hs,hy-.4*hs,hx,hy+hs);x.stroke(); // le cœur au stylo
      x.strokeStyle='#3456b0';x.lineWidth=1.8;x.beginPath();for(let i=0;i<60;i++){const a=i*.35,r=.0012*w*i;const px=.06*w+Math.cos(a)*r,py=.72*h+Math.sin(a)*r;if(i)x.lineTo(px,py);else x.moveTo(px,py);}x.stroke(); // la spirale
      x.strokeStyle='#55555f';x.lineWidth=1.8;const cx=.72*w,cy=.13*h;x.strokeRect(cx-14,cy-6,28,7);x.beginPath();x.moveTo(cx-8,cy-6);x.lineTo(cx-4,cy-12);x.lineTo(cx+6,cy-12);x.lineTo(cx+9,cy-6);x.stroke(); // la petite voiture
      x.beginPath();x.arc(cx-8,cy+2,3.5,0,Math.PI*2);x.stroke();x.beginPath();x.arc(cx+8,cy+2,3.5,0,Math.PI*2);x.stroke();
      x.beginPath();x.moveTo(cx-24,cy-3);x.lineTo(cx-17,cy-3);x.moveTo(cx-26,cy+1);x.lineTo(cx-18,cy+1);x.stroke();})});              // et sa vitesse
    const tri=function(pts,uv){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.computeVertexNormals();return ge;};
    g.add(new THREE.Mesh(tri([A.x,A.y,A.z,M.x,M.y,M.z,C.x,C.y,C.z],[0,0,.45,.95,0,1]),papier));                          // le pan de dedans
    const pan=ailB(new THREE.Group());pan.position.copy(A);g.add(pan);const b=B.clone().sub(A),m=M.clone().sub(A);       // le pan du DEHORS, sur le pli
    pan.add(new THREE.Mesh(tri([0,0,0,b.x,b.y,b.z,m.x,m.y,m.z],[0,0,1,.9,.45,.95]),papier));
    ailTige(g,ailMat({color:0xc9c2b2,shininess:4}),.006,A.clone().setY(.004),M.clone().setY(.004));        // le pli
    const F1=C.clone().lerp(M,.2),F2=C.clone().lerp(M,.65),ax=F2.clone().sub(F1).normalize(),d=new THREE.Vector3(0,0,-.17*Sy),f2=F2.clone().sub(F1); // le VOLET plié
    const vo=ailB(new THREE.Group());vo.position.copy(F1);g.add(vo);
    vo.add(new THREE.Mesh(tri([0,0,0,f2.x,f2.y,f2.z,f2.x+d.x,f2.y+d.y,f2.z+d.z,0,0,0,f2.x+d.x,f2.y+d.y,f2.z+d.z,d.x,d.y,d.z],[.08,.97,.32,.96,.32,1,.08,.97,.32,1,.08,1]),papier));
    ailAnime(function(t,e){const n=AILV.n,P=AILV.photo,fl=P?0:(.04+.16*n)*Math.sin(t*(18+14*n)+.6*Math.sin(t*7))*e; // le pan CLAQUE au vent
      pan.quaternion.setFromAxisAngle(u,sg*(.42+fl));vo.quaternion.setFromAxisAngle(ax,(.35+.35*AILV.mon+.35*AILV.vir*sd)*e);
      g.rotation.x=Math.sin(t*23)*.012*e*(1+n);});},
  plumes:function(piv,sd,W9){ // PLUMES D'ANGE — de VRAIES plumes (rachis, barbes, pointe dorée) en trois rangs, sur un bras et une MAIN : elles battent lentement,
    // la main en retard, et s'ouvrent en éventail à chaque descente ; un liseré d'or court le long du bras ; au boost elles s'embrasent d'or et
    // sèment de la POUSSIÈRE D'OR
    const S=W9*1.18,xc=S*.42,bras=ailB(new THREE.Group()),main=ailB(new THREE.Group());piv.add(bras);main.position.x=sd*xc;bras.add(main);
    const tex=ailTex('plumeAnge',function(x,w,h){const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#e9e6f2');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#ece8f4');x.fillStyle=g;x.fillRect(0,0,w,h);
        x.strokeStyle='rgba(170,165,195,.45)';x.lineWidth=1;for(let i=0;i<46;i++){const u=i/46*w;x.beginPath();x.moveTo(u,h*.5);x.lineTo(u+w*.07,0);x.moveTo(u,h*.5);x.lineTo(u+w*.07,h);x.stroke();} // les barbes
        const o=x.createLinearGradient(w*.62,0,w,0);o.addColorStop(0,'rgba(255,215,94,0)');o.addColorStop(.5,'rgba(255,205,80,.85)');o.addColorStop(1,'#ffb020');x.fillStyle=o;x.fillRect(w*.62,0,w*.38,h); // la pointe dorée
        x.strokeStyle='#e7d6a8';x.lineWidth=3;x.beginPath();x.moveTo(0,h*.5);x.quadraticCurveTo(w*.5,h*.44,w,h*.5);x.stroke();},256,64); // le rachis
    const plM=ailMat({map:tex,emissiveMap:tex,emissive:0xffe2a8,emissiveIntensity:.14,shininess:30,specular:0x9a9a9a}),orM=ailMat({color:0xffd75e,emissive:0xffb020,emissiveIntensity:.5,shininess:120,specular:0xffffff});
    const plume=function(par,len,w,x,y,z,ang,bouge){const s=new THREE.Shape();s.moveTo(0,-w*.22);s.quadraticCurveTo(len*.5,-w*.62,len*.94,-w*.2);s.quadraticCurveTo(len*1.02,0,len*.92,w*.3);
      s.quadraticCurveTo(len*.45,w*.62,0,w*.22);s.lineTo(0,-w*.22);const m=new THREE.Mesh(ailForme(s,sd),plM);m.position.set(sd*x,y,-z);m.rotation.y=sd*ang;if(bouge)ailB(m);par.add(m);return m;};
    for(let k=0;k<6;k++)plume(bras,S*.55,.22,S*(.02+k*.075),-.012,.02,1.25-k*.05);                          // les secondaires
    for(let k=0;k<5;k++)plume(bras,S*.3,.17,S*(.03+k*.085),0,-.04,1.0);                                    // les couvertures
    for(let k=0;k<5;k++)plume(bras,S*.22,.15,S*(.05+k*.08),.01,-.12,.8);
    const pr=[],pr0=[],PL=[];for(let k=0;k<6;k++){const L=S*(.72-k*.05);pr.push(plume(main,L,.22,0,-.005*k,-.05+k*.03,-.15+k*.16,1));pr0.push(-.15+k*.16);PL.push(L);} // les RÉMIGES
    ailTige(bras,orM,.03,new THREE.Vector3(0,.02,.15),new THREE.Vector3(sd*xc,.02,.12),.022);              // le liseré d'or
    const fx=ailEtincelles(piv,20,.045,new THREE.Color(2.2,1.85,1),{tw:1}),T=new THREE.Vector3();
    let ph=0,acc=0;
    ailAnime(function(t,e,dt){const n=AILV.n;ph+=dt*(.7+.5*n+.2*Math.max(0,AILV.mon));const P=AILV.photo,b=P?.3:ailBat(ph),bl=P?.55:ailBat(ph-.1);
      bras.rotation.z=sd*(.12+.36*b)*e;main.rotation.z=sd*(.5*(bl-b)+.04)*e;const fan=.85-.2*b+.25*n;   // l'éventail s'ouvre à la descente
      for(let i=0;i<pr.length;i++)pr[i].rotation.y=sd*(-.15+(pr0[i]+.15)*fan);
      plM.emissiveIntensity=.1+.06*(1-b)+.22*n;orM.emissiveIntensity=.5+.8*n;
      acc+=dt*(1.5+18*n);while(acc>=1){acc-=1;const i=(Math.random()*pr.length)|0,a=pr[i].rotation.y*sd,L=PL[i]*(.75+Math.random()*.3); // la POUSSIÈRE D'OR
        T.set(sd*L*Math.cos(a),0,pr[i].position.z-L*Math.sin(a));ailRz(T,main.rotation.z);T.x+=sd*xc;ailRz(T,bras.rotation.z);
        fx.pousse(T.x,T.y,T.z,sd*(Math.random()-.5)*.3,-.1+Math.random()*.4,-.5-Math.random()*1,1+Math.random()*.8,.6+Math.random()*.7);}
      fx.pas(dt,-.3,1);});},
  chauve:function(piv,sd,W9){ // CHAUVE-SOURIS — une membrane veinée de violet tendue entre quatre doigts d'os, coupée au poignet : elle bat VITE et de
    // TRAVERS (le rythme hésite, la caisse fait des embardées), la main se REPLIE à chaque remontée ; au boost, ailes en flèche : le PIQUÉ
    const Wd=W9*1.15,bx=[0,-.22,Wd,.84],xc=.5*Wd;
    const PU=[[0,-.12],[.5,-.22],[1,.02]];ailQuad(PU,[1,.02],[.84,.28],[.86,.55],6);ailQuad(PU,[.86,.55],[.68,.5],[.62,.78],6);ailQuad(PU,[.62,.78],[.46,.6],[.34,.84],6);ailQuad(PU,[.34,.84],[.16,.56],[0,.62],6);
    const PP=PU.map(function(p){return [p[0]*Wd,p[1]];}),FT=[[1,.02],[.86,.55],[.62,.78],[.34,.84]],Wr=[.5,-.22];
    const C=function(p,w,h){return [p[0]*w,(1-(p[1]-bx[1])/(bx[3]-bx[1]))*h];};
    const veines=function(x,w,h,col,lw){const o=C(Wr,w,h);x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';
      for(const f of FT){const q=C(f,w,h);for(const k of [.35,.65]){const a=[o[0]+(q[0]-o[0])*k,o[1]+(q[1]-o[1])*k];x.beginPath();x.moveTo(a[0],a[1]);x.quadraticCurveTo(a[0]-8,a[1]+h*.12,a[0]-w*.06,a[1]+h*.25);x.stroke();}}
      for(let i=0;i<5;i++){const y=h*(.35+i*.12);x.beginPath();x.moveTo(0,y);x.quadraticCurveTo(w*.25,y-12,w*.45,y+6);x.stroke();}};
    const tex=ailTex('chauveP',function(x,w,h){const o=C(Wr,w,h),g=x.createRadialGradient(o[0],o[1],8,o[0],o[1],w);g.addColorStop(0,'#12071a');g.addColorStop(.6,'#2a0e3a');g.addColorStop(1,'#43195a');
      x.fillStyle=g;x.fillRect(0,0,w,h);for(let i=0;i<200;i++){x.fillStyle='rgba(0,0,0,'+(Math.random()*.2)+')';x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,Math.PI*2);x.fill();}
      veines(x,w,h,'rgba(15,5,20,.8)',3);},256,256);
    const lum=ailTex('chauveL',function(x,w,h){x.fillStyle='#000';x.fillRect(0,0,w,h);x.shadowColor='#b040ff';x.shadowBlur=8;veines(x,w,h,'#9a3ad0',1.6);},256,256); // les veines qui luisent
    const mb=ailMat({map:tex,emissiveMap:lum,emissive:0xb050e0,emissiveIntensity:.6,shininess:30,specular:0x663366}),os=ailMat({color:0x14101a,shininess:60,specular:0x444444}),gr=ailMat({color:0xcfc3b0,shininess:60});
    const bras=ailB(new THREE.Group()),main=ailB(new THREE.Group());piv.add(bras);main.position.x=sd*xc;bras.add(main);
    bras.add(new THREE.Mesh(ailForme(ailCoupe(PP,xc,-1),sd,0,bx),mb));
    const gm=ailForme(ailCoupe(PP,xc,1),sd,0,bx);gm.translate(-sd*xc,0,0);main.add(new THREE.Mesh(gm,mb));
    const V=function(p){return new THREE.Vector3(sd*p[0]*Wd,.02,-p[1]);},Vm=function(p){return V(p).setX(sd*(p[0]*Wd-xc));};
    ailTige(bras,os,.045,V([0,-.12]),V(Wr),.035);ailTige(bras,os,.022,V(Wr),V(FT[3]),.008);               // le bras, le 5e doigt
    for(let i=0;i<3;i++)ailTige(main,os,.026,Vm(Wr),Vm(FT[i]),.008);                                       // les doigts de la main
    ailPointe(bras,gr,.03,.14,V(Wr).add(new THREE.Vector3(0,.02,0)),new THREE.Vector3(sd*.2,.3,1));        // la griffe du pouce
    let ph=0;
    ailAnime(function(t,e,dt){const n=AILV.n;ph+=dt*(3+1.8*n)*(1+.18*Math.sin(t*1.7)+.1*Math.sin(t*4.3));   // le vol de la chauve-souris : rapide et de TRAVERS
      const P=AILV.photo,b=P?.25:ailBat(ph),bl=P?.55:ailBat(ph-.13);
      bras.rotation.z=sd*(.08+.44*b)*e;main.rotation.z=sd*(.85*(bl-b)+.05)*e;                           // à la remontée, la main se REPLIE
      bras.rotation.y=sd*.4*n*e;bras.rotation.x=.06*Math.sin(t*9.3)*e;mb.emissiveIntensity=.5+.6*n;});}   // au boost : en flèche, le piqué
};
/* (2026-10-16, LES AILES VIVANTES) les descriptions disent le GESTE (les anciennes restent traduites) */
Object.assign(I18N,{
  "Deux planches de planeur, un aileron qui suit tes virages, des feux de position. Au boost, elles tirent deux traînées blanches.":"Two glider boards, an aileron that follows your turns, navigation lights. When you boost, they pull two white contrails.",
  "Quatre rotors qui s'emballent au boost et piquent du nez pour foncer. Ça ne vole pas mieux, mais ça brasse de l'air.":"Four rotors that rev up when you boost and dip their noses to charge. It doesn't fly any better, but it sure moves some air.",
  "De vraies plumes blanches et dorées qui battent lentement et s'ouvrent en éventail. Au boost, elles sèment de la poussière d'or.":"Real white-and-gold feathers that beat slowly and fan open. When you boost, they scatter gold dust.",
  "Membranes veinées de violet, doigts d'os. Elles battent vite, de travers, et se replient en flèche au boost. Pour les vols de nuit.":"Purple-veined membranes, bony fingers. They flap fast and crooked, and sweep back when you boost. For night flights.",
  "Gris, deux barres noires, un cou vert-violet. Il claque des ailes au décollage, bat trop vite et plane sans savoir pourquoi.":"Gray, two black bars, a green-purple neck. It claps its wings on takeoff, flaps too fast and glides without knowing why.",
  "Une feuille à grands carreaux pleine de gribouillis, un volet plié. Le pan claque au vent quand tu boostes : c'est toi qui pilotes.":"A sheet of school paper full of doodles, a folded flap. The fold snaps in the wind when you boost: you're the pilot.",
  "Orange et noir, nervures et points blancs, comme les vrais. Elles battent, planent, battent encore. Jusqu'à 900 à l'heure.":"Orange and black, veins and white dots, like the real thing. They flap, glide, flap again. Up to 900 km/h.",
  "Des ailes d'ange en gros pixels, animées image par image. Au boost, elles clignotent de toutes les couleurs, comme avec l'étoile.":"Angel wings in chunky pixels, animated frame by frame. When you boost, they flash every color, just like with the star.",
  "Toile rouge, haubans, ailerons, et l'écharpe du pilote qui claque au vent. Un chien sur sa niche en rêve encore.":"Red canvas, bracing wires, ailerons, and the pilot's scarf snapping in the wind. A dog on his doghouse still dreams about it.",
  "Les rouages font battre l'aile, la chaudière crache sa vapeur au boost. Léonard l'avait dessinée, toi tu la pilotes.":"The gears make the wing beat, the boiler puffs steam when you boost. Leonardo drew it; you fly it.",
  "Repliées en croisière, elles s'écartent en X dès que tu boostes, réacteurs à fond. Verrouillez les ailes en position d'attaque.":"Folded while cruising, they split into an X the moment you boost, engines roaring. Lock wings in attack position.",
  "Quatre voiles irisés qui bourdonnent et sèment de la poussière de fée. Il suffit d'y croire. Et d'un plein de nitro.":"Four shimmering veils that buzz and scatter fairy dust. You just have to believe. And have a full tank of nitro.",
  "Membranes veinées de lave, griffes, grands coups d'aile. Au boost, la lave flambe et crache des braises.":"Lava-veined membranes, claws, mighty wingbeats. When you boost, the lava flares and spits embers.",
  "Des plumes de feu qui battent en semant des étincelles. Tu exploses ? Tu renais de tes cendres. Au prochain run.":"Feathers of fire that beat and scatter sparks. You blow up? You rise from your ashes. Next run."});
