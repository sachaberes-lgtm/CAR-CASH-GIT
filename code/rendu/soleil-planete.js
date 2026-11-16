// SOLEIL « 1.61 » : les grands numéros lumineux du studio se couchent à l'horizon
const sunSprite=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=512;
  const c=cv.getContext('2d');
  const tex=new THREE.CanvasTexture(cv);
  const cvO=document.createElement('canvas');cvO.width=cvO.height=512;const texO=new THREE.CanvasTexture(cvO); // (vague 2) les chiffres d'or
  function draw(){
    c.clearRect(0,0,512,512);
    // UNE VRAIE SOURCE DE LUMIÈRE (2026-08-03) : le disque était volontairement « contenu » et
    // dessiné en fusion NORMALE — il PEIGNAIT le ciel au lieu d'y AJOUTER de la lumière, d'où un
    // aplat terne. Il passe en additif (voir le matériau) et gagne un vrai noyau brûlant : un cœur
    // blanc franc, une couronne dorée large, puis la longue retombée corail qui se noie dans le ciel.
    const g=c.createRadialGradient(256,256,10,256,256,252);
    g.addColorStop(0,'rgba(255,252,242,1)');      // le NOYAU : blanc chaud, pas crème
    g.addColorStop(.09,'rgba(255,236,190,.98)');  // il tient jusqu'à 9 % — c'est ça qui fait « ça brûle »
    g.addColorStop(.20,'rgba(255,198,120,.62)');  // couronne dorée large
    g.addColorStop(.46,'rgba(255,132,104,.24)');
    g.addColorStop(1,'rgba(255,124,110,0)');      // retombée corail jusqu'à zéro AVANT le bord du disque
    c.fillStyle=g;c.beginPath();c.arc(256,256,252,0,7);c.fill();
    /* LE « 1.61 » EN OR (2026-09-26, vague 2 — « l'encre et l'or »). En additif, les chiffres blancs sur un ciel de jour clair ne
       pouvaient qu'AJOUTER un peu de lumière : un fantôme pâle, illisible (mesuré par le directeur artistique). Le disque reste ici,
       ADDITIF, avec son sillon creusé (le halo ne lave pas les glyphes) ; les CHIFFRES passent sur un second sprite, en fusion
       NORMALE, peints comme une plaque du HUD : OR #ffd75e, reflet #fff3b0 en tête, tranche #b8860b, liseré d'ENCRE #1c0430. La
       lumière, c'est l'argent : l'astre du niveau est une pièce d'or. */
    c.font='84px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
    c.lineJoin='round';
    c.globalCompositeOperation='destination-out';
    c.lineWidth=30;c.strokeStyle='rgba(0,0,0,.70)';c.strokeText('1.61',256,260); // le sillon
    c.globalCompositeOperation='source-over';
    tex.needsUpdate=true;
    // les CHIFFRES D'OR (même cadrage 512 : le sprite enfant se superpose au pixel près)
    const d=cvO.getContext('2d');d.clearRect(0,0,512,512);
    d.font=c.font;d.textAlign='center';d.textBaseline='middle';d.lineJoin='miter';
    d.lineWidth=16;d.strokeStyle='#1c0430';d.strokeText('1.61',256,266);d.strokeText('1.61',256,260); // le liseré d'encre, tranche comprise
    d.fillStyle='#b8860b';d.fillText('1.61',256,266);                                             // la TRANCHE : l'épaisseur de la pièce
    const cvL=document.createElement('canvas');cvL.width=cvL.height=512;const l=cvL.getContext('2d');   // la face : or plein, reflet clair en tête
    l.font=c.font;l.textAlign='center';l.textBaseline='middle';l.fillStyle='#ffd75e';l.fillText('1.61',256,260);
    l.globalCompositeOperation='source-atop';l.fillStyle='#fff3b0';l.fillRect(0,0,512,248);
    d.drawImage(cvL,0,0);toileRend(cvL); // (2026-10-14, passe perf mobile) toile de travail 512² : 1 Mo rendu tout de suite, à chaque dessin
    texO.needsUpdate=true;
  }
  draw();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw).catch(function(){});
  // ADDITIF : c'est ce qui fait la différence entre un autocollant et une source de lumière — le disque
  // AJOUTE sa lumière au ciel, le bloom l'attrape, et le halo se fond au lieu de se découper.
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
  // renderOrder ÉPINGLÉ (2026-07-20 v3) : sans lui, le tri des transparents (distance CAMÉRA,
  // recalculée chaque frame) faisait passer le soleil devant/derrière les titans au gré du shake
  // → gros clignotement à l'horizon. Le trio soleil/nappe/rayons dessine toujours JUSTE après le
  // skyDome (-9), donc toujours DERRIÈRE les nuages : ordre fixe, plus aucun flip possible.
  sp.renderOrder=-8;
  /* LE 1.61 DEVIENT UN ASTRE (2026-08-08). Il était « contenu » : 940 d'échelle à 3600 de distance,
     soit ~15° — un logo posé à l'horizon. Il passe à 2050, soit **~31° de large, 43 % de la hauteur
     d'écran** : on ne le regarde plus, il nous regarde. C'est l'ancre du niveau 1, le point fixe
     autour duquel tout le reste tourne. ⚠ l'échelle est la SEULE chose que la musique pilote ici
     (`sunSprite.scale`) : l'opacité appartient aux BIOMES (`bioApply`) et la lui disputer ferait
     clignoter le soleil à chaque portail. Le battement passe donc par `material.color`, que
     personne d'autre n'écrit. */
  sp.userData.base=2050;
  sp.scale.set(2050,2050,1);
  // (vague 2) LES CHIFFRES D'OR : un enfant du disque — même place, même échelle (la musique le fait battre avec lui), caché avec lui
  // (garage, étal, orbite, pluie). Fusion NORMALE : l'or se PEINT sur le ciel, il ne s'y dilue plus. Dessiné après la nappe et les rayons.
  const chif=new THREE.Sprite(new THREE.SpriteMaterial({map:texO,transparent:true,depthWrite:false,fog:false}));
  chif.renderOrder=-5;sp.add(chif);sp.userData.chif=chif;
  return sp;
})();
// LUEUR D'HORIZON + RAYONS CRÉPUSCULAIRES (purement visuels — constantes réglables)
const GLOW_DROP=260,RAY_LIFT=520,RAY_OFF=[-520,-180,150,480],RAY_ANGLES=[-.42,-.15,.12,.38],RAY_OPACITY=.12;
const horizonGlow=(function(){ // nappe très large et plate : l'horizon embrasé sous le soleil
  // ⚠ LE RECTANGLE À L'HORIZON, C'ÉTAIT ICI (corrigé 2026-08-03, MESURÉ). Le dégradé radial avait un
  // rayon de 124 px dans un canvas haut de 64 (32 depuis le centre) : verticalement il n'atteignait
  // JAMAIS sa dernière étape transparente, il était TRANCHÉ par le bord. Alpha relevé sur les bords
  // haut et bas : 149/255, soit 58 % d'opacité qui tombe à 0 d'un coup — sur un sprite ADDITIF de
  // 3000 × 560, ça dessine une barre rectangulaire franche en travers du ciel.
  // LA CORRECTION : on rend le dégradé ELLIPTIQUE (le canvas 2D ne sait faire que des cercles, donc
  // on écrase le repère en Y) et on cale son zéro AVANT le bord — 30 px sur 32, il reste une marge
  // de sécurité complètement transparente tout autour.
  const cv=document.createElement('canvas');cv.width=256;cv.height=64;
  const c=cv.getContext('2d');
  const R9=124;
  const g=c.createRadialGradient(0,0,2,0,0,R9);
  g.addColorStop(0,'rgba(255,182,128,.82)');g.addColorStop(.45,'rgba(240,110,126,.38)');g.addColorStop(1,'rgba(240,110,126,0)');
  c.save();
  c.translate(128,32);c.scale(1,30/R9); // 30 (et non 32) : le dégradé s'éteint 2 px avant le bord
  c.fillStyle=g;c.fillRect(-R9,-R9,R9*2,R9*2);
  c.restore();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:.8}));
  sp.renderOrder=-7; // épinglé derrière les nuages (voir sunSprite)
  sp.scale.set(3000,560,1);return sp;
})();
// ---------- LA PLANÈTE : une Terre bleu-vert qui flotte haut dans le ciel, vue depuis l'orbite ----------
// Un ancrage céleste de plus (comme la lune), volontairement PETIT : elle habite le cadre sans le manger.
const PLANET_DIR=new THREE.Vector3(-.76,.11,.64).normalize(); // BASSE et DÉPORTÉE : une partie sort du cadre → on lit une DEMI-SPHÈRE, pas une bille (et la route reste dégagée)
// ON EST AU RAS DE L'ATMOSPHÈRE : la Terre n'est plus une bille dans le ciel mais un MONDE dont on
// voit la COURBURE (~40° d'arc ≈ la moitié de la hauteur d'écran), posé bas, avec son limbe qui brille.
const PLANET_R=1560,PLANET_D=3400; // ~62 % de la hauteur : la demi-sphère barre franchement le ciel — on rase l'atmosphère
/* LA TERRE PEINTE (2026-11-09, Sacha : « retravaille la terre dans le niveau espace, là c'est juste une boule bleue »)
   Une toile équirectangulaire 1024 × 512, tout est procédural (aucun asset). Les vrais CONTINENTS (contours à la main, ~2-3° de
   pas) sont déformés par du bruit pour des côtes déchiquetées, entourés d'un PLATEAU CONTINENTAL turquoise ; les terres prennent
   leur BIOME (désert, steppe, prairie, forêt, jungle, taïga, toundra, glace), leur RELIEF (chaînes de montagnes, neiges, ombrage de
   colline). Les océans vont du marine des pôles à l'azur des tropiques. Le bruit est périodique en longitude (la toile boucle) et
   tiré de `Math.random` — la Terre est repeinte avec une graine fixe (voir peintTerre). `W`,`H` : la taille de la toile. */
function terrePeintre(x,W,H){
  const rnd=Math.random,S=W/1024,cl=function(v,a,b){return v<a?a:v>b?b:v;},sm=function(a,b,v){const t=cl((v-a)/(b-a),0,1);return t*t*(3-2*t);},mx=function(a,b,t){return a+(b-a)*t;};
  /* ---- le bruit : une table de valeurs, interpolée ; `cx` cases en travers (la toile boucle), `o` décale la table par octave ---- */
  const T=new Float32Array(65536);for(let i=0;i<65536;i++)T[i]=rnd();
  const nz=function(u,v,cx,o){const cy=cx>>1,px=u*cx,py=v*cy,ix=px|0,iy=py|0,fx=px-ix,fy=py-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),
    x0=((ix%cx)+o*37)&255,x1=(((ix+1)%cx)+o*37)&255,y0=(iy+o*91)&255,y1=(iy+1+o*91)&255,a=T[y0*256+x0],b=T[y0*256+x1],c=T[y1*256+x0],d=T[y1*256+x1];
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};
  const fbm=function(u,v,cx,o,n){let s=0,a=.5,t=0;for(let k=0;k<n;k++){s+=a*nz(u,v,cx<<k,o+k);t+=a;a*=.5;}return s/t;};
  /* les champs DOUX (montagnes, climats, bruits de couleur) se calculent sur une grille 256 × 128 puis se lisent en bilinéaire : 16 fois moins de calcul, même image */
  const GW=256,GH=128,grille=function(fn){const a=new Float32Array(GW*GH);for(let j=0;j<GH;j++)for(let k=0;k<GW;k++)a[j*GW+k]=fn((k+.5)/GW,(j+.5)/GH);return a;};
  const lit=function(a,u,v){const px=u*GW-.5,py=cl(v*GH-.5,0,GH-1.001),ix=Math.floor(px),iy=py|0,fx=px-ix,fy=py-iy,x0=((ix%GW)+GW)%GW,x1=(x0+1)%GW,
    A=a[iy*GW+x0],Bv=a[iy*GW+x1],C=a[(iy+1)*GW+x0],Dv=a[(iy+1)*GW+x1];return A+(Bv-A)*fx+(C-A)*fy+(A-Bv-C+Dv)*fx*fy;};
  /* ---- les terres : [lon,lat, lon,lat, …] ---- */
  const TERRES=[
    // AMÉRIQUE DU NORD + CENTRALE
    [-168,65.5,-163,69,-156,71.3,-141,70,-128,70,-115,68.5,-100,68,-95,69.5,-86,69,-82,66,-88,64,-93,60,-94.5,58.5,-90,57,-85,55,-82,52.5,-79.5,51.5,-79,55,-77,59,-78,62,-72,61.5,-65,60,-62,57,-57,53,-56,51.5,-60,50,-66,49.2,-64,46,-61,45.6,-66,44.5,-70,43.5,-70,41.7,-74,40.5,-76,37.5,-76,35,-81,31.5,-80,27,-80,25.2,-82,26.8,-83,29.5,-85,29.8,-89,30,-91,29.2,-94,29.6,-97,27.5,-97.7,23,-96,19.5,-94,18.3,-91,18.8,-90,21,-87,21.5,-87.5,18,-88.5,15.8,-84,15.5,-83.4,11,-81,8.8,-79,9.4,-77.5,8.5,-78,7.2,-80.5,7.5,-83,8.3,-85.7,10,-87.5,12.8,-91,13.6,-94,16,-97,15.8,-101,17.6,-105.5,20,-105.4,22.6,-108,25.5,-110.5,28.5,-112.8,31,-114.8,31.8,-114.5,30,-112.5,27,-110.2,24.2,-109.4,23.2,-111.8,25.2,-113.5,28,-115.2,29.8,-116.8,32.5,-118.5,34,-120.6,34.8,-122.5,37.5,-124,40.5,-124.3,43,-124,46.5,-124.7,48.4,-123,48.8,-123.2,50,-127,52.2,-130,54.8,-134,58,-137,58.5,-140.5,59.8,-145,60.2,-149.5,59.7,-152,58.5,-154,57.3,-158,56.3,-162,55,-164.5,54.6,-160,57.5,-157.5,58.7,-162,59.8,-165.5,61.5,-166,63,-161,64.5,-164,64.6,-168,65.5],
    // AMÉRIQUE DU SUD
    [-77.5,8.5,-75.5,10.8,-72,12.2,-71.2,10.9,-68,10.7,-64,10.5,-61.5,10.3,-59,8,-57,6,-53.5,5.4,-51.5,4.2,-50,1.5,-50,-0.2,-47,-0.8,-44,-2.4,-40,-2.9,-37,-4.8,-35,-6,-34.9,-8,-36.5,-10.8,-38.8,-13,-39,-17.5,-40.5,-20.5,-41.9,-22.7,-44.5,-23.2,-48.5,-26,-48.8,-28.5,-51.5,-31,-53.5,-33.8,-56,-34.8,-57.2,-36,-57,-38,-62,-39.2,-62.3,-41,-65,-41,-64.2,-42.5,-65.5,-45,-67.5,-46.2,-66.5,-48.3,-69,-50.2,-68.5,-52.5,-65.5,-55,-68.5,-55.1,-72,-54.2,-73.8,-51,-75.5,-48,-74,-44,-73.5,-40,-73.5,-37,-72,-32,-71.5,-28,-70.5,-22,-70.3,-18.3,-75,-15.5,-76.2,-13.5,-78.5,-10,-81,-6.2,-81.2,-4.7,-80.3,-2.3,-79.7,0.6,-78.8,1.8,-77.5,3.8,-77.3,6.5,-77.5,8.5],
    // EUROPE + ASIE
    [-9.5,37,-9,39,-9.5,41.5,-8.8,43.4,-4,43.5,-1.8,43.3,-1.2,46,-4.6,47.8,-4.5,48.6,-1.5,48.7,-1.2,49.7,1.6,50.8,3.4,51.4,4.5,52.8,7,53.4,8.7,54,8.6,56.5,10.5,57.7,10.5,56,9.8,54.8,12,54.2,14.3,54,18.5,54.7,19.8,54.4,21.2,56.8,24,57.2,24.2,59.2,28,59.5,30,60,28.4,60.4,23,59.9,21.5,61.5,21.3,63,25.3,65.2,24.5,65.8,21.5,65.2,17.5,62.5,17.3,60.8,19.5,60.3,18.6,59,16.5,57.3,15.6,56.2,13,55.5,11.5,58,11.2,59.2,8,58,6,58.5,5,60.5,5.5,62.5,9.5,64.5,13,66.5,15,68.5,19,70,25,71.1,31,70.5,31.2,69.5,40,67.7,33.5,66.2,35,64.8,38,64.2,40.5,66.2,44,66.4,43.5,68.5,46,68,53,68.4,59,68.7,65,69,68.5,68.2,73,68.4,73.5,71.2,80.5,72.7,80.8,73.7,87,74.8,98,76.2,104,77.6,113,75.5,113,73.5,120,73.2,129,72,140,72.8,150,71.4,160,70.2,170,70,180,68.8,180,65,175,64.5,177.5,62.5,172,60.5,165,60.2,164,62,160.2,61.2,163,59.2,162,56.5,156.7,51.2,156,53,155.8,57,157,58.5,152,59,143.5,59.2,136,54.5,141.5,53.2,140.5,50,140,48,135.5,43.5,132,42.8,129.5,41,129.3,38,129,35.6,126.7,34.5,126.5,37,125,38.5,125.2,39.6,121.6,39,121.4,40.6,119,39.2,118.6,37.6,122.5,37.2,120,35.5,121.8,32,121,31,122,30,120.5,27.5,119.5,25.5,117.5,23.5,114.5,22.4,111,21.3,110.5,20.2,109.8,21.7,108,21.5,106.5,18.8,108.5,15.8,109.3,12.5,107,10.4,105.4,8.7,104.8,10.4,102.3,12.4,100.5,13.4,99.2,10.5,100.3,7.5,102.5,5.5,103.5,2.5,104.2,1.4,102,2.5,100.3,4.2,98.5,8.2,98.4,11,97.7,16.5,94.5,16.5,94.2,19,92.2,21.3,91.5,22.8,90,22,88,21.8,86.8,20.5,85,19.5,82,17,80.2,15.6,80.3,13,79.9,10.3,78.5,9,77.4,8.1,76,10.5,74.8,12.7,73.4,16.5,72.7,20,72.9,21.5,70.5,20.8,68.8,22.5,70.2,23.2,67,24.7,66.5,25.4,61.5,25.2,57.3,25.9,56.5,27.2,54,26.7,51.5,27.8,50.2,29.7,48.5,30,48,29.2,50,26.5,51.5,24.5,51.8,24,54,24.2,56.2,26,56.5,24.5,59.8,22.5,57.8,19,55.2,17.2,52,16,49,14.2,45,12.8,43.3,12.8,42.8,15.5,41,19,39,21.5,37,25,35,28.5,34.5,28.1,33.2,28.3,32.6,30,32.8,31.2,34.2,31.3,35.2,33.5,35.9,34.6,36,36.7,34.5,36.8,32.5,36.1,30.5,36.5,28.5,36.8,27.2,37.2,26.3,38.5,26.7,40.2,29,40.4,29.2,41.1,31.5,41.1,33.8,42,36.5,41.4,38,41,41.5,41.3,41.8,42.5,38,44.5,37.6,47,38.5,47.2,35.5,45.4,35,45,33.5,44.6,32.5,46,30.5,46.4,29.8,45.2,28.6,44,28.1,42,27.8,41.8,26.4,40.8,25.5,40.9,24,40.3,23,40.2,22.8,38.5,24,37.7,23,36.5,21.7,36.8,21,38.3,19.5,40,18.2,40.3,17,39.5,16.1,38,15.7,38,16.2,40,13,41.5,10.4,43.2,8,44.2,6.8,43.2,4,43.4,3.1,42.4,0,39.6,-0.4,38.4,-2.2,36.8,-5.4,36.1,-6.5,36.9,-9.5,37],
    // AFRIQUE
    [-5.9,35.8,-2,35.2,3,36.8,10,37.3,11,35.7,10.2,34.3,11.2,33.2,15,32.3,19.5,30.6,20.2,32.2,23,32.6,25,31.7,29.5,30.9,32.5,31.2,32.7,29.8,34,27.5,35.5,24,37.2,21,37.5,18,39.7,15.3,41.5,13.6,43.3,12.8,45,11.9,51.3,11.8,51,10.4,49.5,7.5,47.7,4.5,45,2,42,-1,40.2,-3.5,39.3,-5.5,38.8,-9,40.5,-11,40.7,-15,36.5,-18.5,35,-22,35.5,-24,33,-25.8,32.8,-28.5,31,-30.5,28.5,-32.5,25.5,-34,22,-34.2,19,-34.8,18.2,-32,17.2,-29,15.2,-26.5,14.5,-22.5,12,-18,13.5,-12.5,13,-9,12,-5.5,9,-1,9.7,3.7,8,4.5,5,5.8,2,6.3,-2,4.8,-5,5.2,-7.8,4.4,-11,6.8,-13.3,9,-14.8,10.8,-16.8,12.5,-16.8,14.8,-17.2,17.5,-16.1,19.8,-16.5,23,-14.8,26,-13,27.6,-10,29.5,-9.6,31.5,-8.5,33.3,-6.8,34.5,-5.9,35.8],
    // AUSTRALIE
    [113.7,-22,113.4,-26,115,-30,115.2,-34,118,-35,121.5,-33.8,124.5,-33.5,129,-31.6,131.5,-31.5,134,-32.8,135.8,-34.8,137.8,-33,138,-35.5,140,-37.5,142,-38.2,144.5,-38.2,146.5,-39,149.5,-37.6,150.8,-34.5,152.5,-32,153.6,-28.5,153,-25.5,150.8,-22.5,149,-20,146.3,-18.7,145.5,-15,143.8,-14,143.2,-11,142.3,-10.7,141.6,-13,141.5,-16.5,139.5,-17.5,136.8,-15.8,135.5,-14.8,136.8,-12.2,133,-11.5,131,-12,129,-14.9,127,-14,125,-15.4,123,-17,121,-19.2,119,-20,116,-20.7,113.7,-22],
    // GROENLAND
    [-73,78.5,-67,80,-60,82,-45,83.2,-30,83.6,-20,81.5,-18.5,78,-19.5,75,-21.5,72,-24,70.5,-22.5,69.5,-26,68.3,-31,68,-34,66,-38,65.5,-41.5,63.5,-43.5,60,-47,60.5,-49.5,62,-51.5,64,-53,66.5,-54,69,-55.5,71,-56,73.5,-60.5,75.5,-66,76.5,-72,77.5,-73,78.5],
    // ANTARCTIQUE
    [-180,-90,-180,-77,-170,-78.5,-160,-78,-150,-77,-140,-76,-125,-74,-110,-73.5,-100,-73,-90,-72.5,-80,-73,-72,-72,-67,-70,-65,-65.5,-62,-64,-58,-63.5,-60,-67,-62,-70,-61,-72.5,-56,-74.5,-48,-77.5,-40,-78.5,-30,-77,-24,-74,-15,-71,0,-70,15,-69.5,30,-69.5,40,-68.5,50,-67.5,60,-67.5,68,-69,73,-69.5,80,-67.5,88,-66.5,100,-66,110,-66.2,120,-66.6,135,-66,145,-67,155,-69,164,-70.8,172,-72,180,-71,180,-90],
    // GRANDES ÎLES
    [-5.5,50.1,-2.5,50.6,1.4,51.1,1.7,52.7,0.3,53.4,-0.3,54.5,-1.7,55.6,-2.2,57.6,-3.5,58.6,-5,58.6,-6,57,-5.6,55.3,-3,54.8,-3.1,53.4,-4.6,52.8,-4.2,51.6,-5.5,50.1],
    [-10.3,52,-6.2,52.2,-6,53.8,-5.8,54.6,-8,55.3,-10,54,-10.3,52],
    [-24,64.2,-21.5,63.8,-18,63.4,-14.5,64.4,-13.6,65.3,-15.2,66.4,-19,66.2,-22.5,66.4,-24.2,65.4,-24,64.2],
    [130.2,31.2,131.5,31.4,132,33.6,134.5,34,135.3,33.6,136.8,34.3,138.8,34.6,140.8,35.5,141,38.5,142,39.8,141.5,41.3,140,40.2,139.8,38,137,37,136,35.8,132.5,35.5,131,34.5,130.2,33.5,130.2,31.2],
    [140,42,141.5,41.7,143.4,42,145.5,43.3,144,44.2,142,45.4,141.7,44.2,140.3,43.3,140,42],
    [108.5,1,109.5,2,111,2.5,113,3.3,114.8,4.8,116.5,6.9,119,5.2,118,2,117.5,0,117,-1.2,116.5,-3.3,114.5,-4,113.5,-3,111.5,-3.2,110,-1.7,109,-0.5,108.5,1],
    [95.3,5.6,97.5,5.2,100,3,102,1.7,104,-1,106,-3,106,-5.8,104.5,-5.8,102,-4,100.5,-2,98.5,0.5,96.5,2.7,95.3,5.6],
    [105.5,-6.8,106.5,-6,108.5,-6.5,111,-6.6,113,-6.9,114.5,-7.8,114.4,-8.7,111,-8.3,108,-7.8,106,-7.3,105.5,-6.8],
    [119.3,-5.5,119.5,-3,119.8,-0.8,121.6,0.8,124.7,1.5,125,0.6,123,0.3,121.5,-1,122.4,-3,123.3,-4.8,121.5,-4.6,120.5,-5.6,119.3,-5.5],
    [131,-1.2,134,-0.8,135.5,-3.3,138,-1.6,141,-2.7,144.5,-3.8,146,-5.7,147.5,-6.2,148,-8.3,150.7,-10.2,148,-10.2,146,-8.2,143.5,-8.5,141,-9.1,138.5,-8.3,138,-7.5,139.8,-6,137.5,-5,135,-4.3,133,-4,132.5,-2.6,131,-1.2],
    [120,18.4,122.2,18.5,122.5,16.5,121.7,14.2,123.8,12.8,124,13.6,121.4,13.8,120.6,14.6,120,16.5,120,18.4],
    [122,7.8,124,8.6,126.2,7.3,126.5,6.2,125.4,5.6,124.3,6.9,123,7.4,122,7.8],
    [80.1,9.7,81.8,7.5,81.1,6,79.9,6.4,79.8,8.6,80.1,9.7],
    [44.2,-25.3,46,-25.6,47.8,-24.8,49.5,-17,49.8,-15.2,49.2,-12.2,47.8,-13.8,44.2,-16.2,43.8,-21,44.2,-25.3],
    [172.8,-34.5,174.8,-36.8,175.8,-37.6,178.5,-37.7,177,-39,175.2,-41.5,174.6,-40,173.8,-39.2,174.5,-37.5,172.8,-34.5],
    [172.8,-40.6,174.2,-41.5,173.3,-43,171,-44.5,169,-46,166.8,-46,167.5,-44.3,170.2,-42.8,172.8,-40.6],
    [144.7,-40.8,148.3,-40.9,148,-43.2,146.5,-43.6,145.2,-42.2,144.7,-40.8],
    [-85,21.9,-82,23.1,-79,22.5,-77.2,21,-74.2,20.2,-77.8,19.9,-80,21.5,-82.5,22.2,-85,21.9],
    [-74.4,19.8,-72,19.8,-69.9,19.7,-68.4,18.6,-70,18.2,-72.7,18.2,-74.4,18.4,-74.4,19.8],
    [-59.5,47.6,-56.5,51.5,-55.5,51.3,-52.8,47.8,-53.5,46.7,-56,47.4,-59.5,47.6],
    [-80.5,63.5,-77,65.5,-72,67.2,-68,68.7,-62.5,66.7,-64,64,-65.5,62.2,-71,61.8,-74,62.5,-78.5,62.7,-80.5,63.5],
    [-118,71.2,-110,73.3,-104,73,-100.5,71,-103,69.2,-109,68.7,-114,69.8,-118,71.2],
    [-120,74.5,-112,76.5,-105,75.5,-102,73.8,-111,73.7,-118,73.5,-120,74.5],
    [-96,76.5,-88,77.4,-82,79,-75,79.5,-63,81.7,-70,83,-85,82.5,-92,81,-96,76.5],
    [-98,74,-93,74.4,-90,72,-95,71.3,-98,72.5,-98,74],
    [-120,75.4,-112,76,-108,77.8,-116,77.4,-120,75.4],
    [52,71,55,73.2,62,75.8,68,76.8,60,74,56,72,52,71],
    [10,78,15,80.2,22,80,27,79,22,77,15,76.7,10,78],
    [138,-8.6,141,-8.9,141,-7,138,-7.2,138,-8.6],
    [-157,19,-155,19.6,-155,18.9,-156,18.9,-157,19],
    [178,-17,180,-16.5,180,-18,178,-18.2,178,-17],
    [141,45.8,142.8,47.2,144,49.8,143,53,142,54.3,141.5,52,142,49,141,45.8],
    [120,22,121.4,25.2,122,25,120.8,22,120,22]
  ];
  const cm=document.createElement('canvas');cm.width=W;cm.height=H;const cx2=cm.getContext('2d');
  cx2.fillStyle='#000';cx2.fillRect(0,0,W,H);cx2.fillStyle='#fff';
  for(const P of TERRES){cx2.beginPath();for(let i=0;i<P.length;i+=2){const px=(P[i]+180)/360*W,py=(90-P[i+1])/180*H;if(i)cx2.lineTo(px,py);else cx2.moveTo(px,py);}cx2.closePath();cx2.fill();}
  const md=cx2.getImageData(0,0,W,H).data,M=new Float32Array(W*H);
  for(let i=0;i<W*H;i++)M[i]=md[i*4]/255;
  /* ---- le flou de la carte des terres (la distance à la côte), séparable, bouclé en longitude ---- */
  const blur=function(src,r){const t=new Float32Array(W*H),o=new Float32Array(W*H),n=2*r+1;
    for(let y=0;y<H;y++){const row=y*W;let s=0;for(let k=-r;k<=r;k++)s+=src[row+((k+W)%W)];
      for(let q=0;q<W;q++){t[row+q]=s/n;s+=src[row+((q+r+1)%W)]-src[row+((q-r+W)%W)];}}
    for(let q=0;q<W;q++){let s=0;for(let k=-r;k<=r;k++)s+=t[Math.min(H-1,Math.max(0,k))*W+q];
      for(let y=0;y<H;y++){o[y*W+q]=s/n;s+=t[Math.min(H-1,y+r+1)*W+q]-t[Math.max(0,y-r)*W+q];}}
    return o;};
  const r1=Math.max(1,Math.round(2*S)),B=blur(blur(M,r1),r1),B2=blur(B,Math.max(2,Math.round(9*S)));
  /* ---- les chaînes de montagnes : [lon1,lat1,lon2,lat2, largeur(°), force] ---- */
  const CHAINES=[
    [-135,62,-125,55,4,.9],[-125,55,-114,46,4,1],[-114,46,-107,37,4.5,1],[-107,37,-105,31,3,.6],[-106,30,-101,22,3.2,.7],[-101,22,-96,17,2.5,.55],
    [-86,36.5,-77,40,2.4,.45],[-77,40,-70,45,2.2,.4],[-152,61,-142,62.5,3,.8],[-92,17,-85,13,2.2,.5],
    [-77,8,-76,0,2.8,.85],[-76,0,-71,-14,3.4,1.05],[-71,-14,-68.5,-23,3.2,1.1],[-68.5,-23,-70,-34,2.6,1.1],[-70,-34,-72,-46,2.4,.85],[-72,-46,-72.5,-53,2.2,.6],
    [-67,5,-61,5,3,.45],[-45,-17,-42,-21,2.6,.4],
    [-8,31,-1,34,2.2,.6],[-1,34,8,36.2,1.6,.5],[-5,36.8,-3,37,1.6,.45],[6,44,7.5,46.5,2.4,.9],[7.5,46.5,13,47,2.8,1],[13,47,20,47.5,2.2,.7],[15,41,10,44,2,.4],
    [7,61,13,64,2.4,.7],[13,64,18,68,2.4,.75],[60,51,59,57,1.6,.55],[59,57,64,66,1.7,.6],[64,66,66,69,1.4,.5],
    [36,43,43,42.2,1.8,.75],[43,42.2,49,40.5,1.8,.6],[44,38,48,34,2.6,.6],[48,34,54,28,2.6,.65],[56,27,62,25.5,2.4,.45],
    [62,37,70,37,3,.6],[68,36,74,36.5,3,.95],[72,35,80,33,3.4,1.1],[80,32,88,28.5,3.4,1.15],[88,28.5,95,28,3,1.1],[95,28,98,24.5,2.6,.8],[98,24.5,99,17,2.4,.55],
    [74,43,80,43,3.2,.85],[80,43,87,42.5,3.2,.8],[96,49,105,50,3,.55],[88,32,95,33,6,.8],[100,31,103,27,3.5,.7],[106,36,108,33,2.6,.5],
    [120,52,126,48,2.4,.4],[130,45,134,48,2,.35],[137,35.5,139,36,1.4,.5],[142,38,141,42,1.2,.4],
    [38,12,40,8,3,.8],[35,5,37,-5,2.4,.5],[33,-9,34.5,-14,2,.45],[29,-31,31,-27,2,.6],[24,-33,19,-33.7,1.4,.4],[12,-17,15,-10,2.4,.35],[10,4,12,1,2,.4],[5,8,9,7,2.4,.35],
    [145,-37.5,149,-34,2.2,.45],[149,-34,147,-25,2.2,.5],[147,-25,145.5,-16.5,2,.5],[134,-23,129,-25,2.6,.5],
    [146,-6,142,-6,2.2,.75],[142,-6,137,-4,2.2,.7],[174,-41,171,-43.5,1.4,.9],[171,-43.5,168.5,-45.7,1.4,.8],
    [-70,-80,-120,-85,10,.9],[-60,-72,-65,-66,3,.6],[20,-80,70,-82,8,.8],[100,-78,150,-80,8,.8],
    [-45,70,-40,64,2.5,.5],[-54,67,-30,72,6,.5]];
  const mont=function(lon,lat){let m=0,k=Math.cos(lat*.01745);for(let i=0;i<CHAINES.length;i++){const c=CHAINES[i],dx=(c[2]-c[0])*k,dy=c[3]-c[1],
      px=(lon-c[0])*k,py=lat-c[1],l2=dx*dx+dy*dy,t=l2>0?cl((px*dx+py*dy)/l2,0,1):0,ex=px-dx*t,ey=py-dy*t,d2=(ex*ex+ey*ey)/(c[4]*c[4]);
      if(d2<6){const v=c[5]*Math.exp(-d2);if(v>m)m=v;}}return m;};
  /* ---- les régions de climat : [lon,lat, rayonLon,rayonLat, force] ---- */
  const DESERTS=[[2,24,24,7,1],[16,26,10,6,1],[30,25,8,6,1],[40,25,14,10,1],[52,23,10,6,1],[60,31,12,6,.55],[68,27,6,5,.8],[66,43,13,6,.6],[100,42,13,6,.75],
    [88,41,10,4,.6],[22,-23,8,7,.8],[16,-26,3,6,.9],[134,-25,13,8,.95],[121,-26,6,7,.7],[-110,32,7,5,.65],[-114,36,4,4,.5],[-70,-25,3,6,.85],[-67,-40,6,8,.5],[44,8,5,5,.6],
    [-102,28,5,4,.5],[-70,12,3,2,.35]];
  const JUNGLES=[[-62,-4,15,8,1],[-72,-8,5,6,.6],[22,0,10,6,1],[10,4,5,4,.6],[-5,6,6,3,.5],[104,5,5,6,.9],[117,0,8,5,1],[112,-6,7,3,.5],[135,-5,9,3,.8],
    [-78,6,5,4,.6],[-85,11,4,3,.55],[96,22,5,4,.55],[106,15,5,6,.6],[50,-17,2,4,.7],[-47,-3,6,3,.45],[82,22,6,4,.35],[75,12,2,5,.45],[145,-16,3,4,.4]];
  const rg=function(L,lon,lat){let m=0;for(let i=0;i<L.length;i++){const c=L[i],dx=(lon-c[0])/c[2],dy=(lat-c[1])/c[3],d=dx*dx+dy*dy;if(d<1.6){const v=c[4]*(1-sm(.25,1.4,d));if(v>m)m=v;}}return m;};
  /* ---- les champs doux, sur la grille ---- */
  const GM=grille(function(u,v){return mont(u*360-180,90-v*180);}),GD=grille(function(u,v){return rg(DESERTS,u*360-180,90-v*180);}),GJ=grille(function(u,v){return rg(JUNGLES,u*360-180,90-v*180);}),
    GH0=grille(function(u,v){return fbm(u,v,9,21,3);}),GS=grille(function(u,v){return fbm(u,v,18,31,2);}),GP=grille(function(u,v){return fbm(u,v,26,41,2);}),
    GN=grille(function(u,v){return fbm(u,v,30,51,2);}),GI=grille(function(u,v){return fbm(u,v,20,61,2);}),GE=grille(function(u,v){return fbm(u,v,14,11,3);}),
    GR=grille(function(u,v){return 1-Math.abs(2*nz(u,v,40,13)-1);}),GO=grille(function(u,v){return fbm(u,v,8,71,3);}),GG=grille(function(u,v){return fbm(u,v,14,81,3);}),GV=grille(function(u,v){return fbm(u,v,40,91,3);});
  /* ---- passe 1 : où est la terre (la côte déchiquetée), à quelle hauteur ---- */
  const LAND=new Uint8Array(W*H),EL=new Float32Array(W*H),AW=14*S,AW2=5*S;
  for(let y=0;y<H;y++){const v=(y+.5)/H,lat=90-v*180;
    for(let q=0;q<W;q++){const i=y*W+q,b2=B2[i];
      if(b2<.003)continue;
      const u=(q+.5)/W;
      if(b2<.997){const wx=(nz(u,v,10,1)-.5)*2*AW+(nz(u,v,36,2)-.5)*2*AW2,wy=(nz(u,v,10,3)-.5)*2*AW*.7+(nz(u,v,36,4)-.5)*2*AW2,
          bx=((q+wx+.5)|0),by=cl((y+wy+.5)|0,0,H-1),Lw=B[by*W+((bx%W)+W)%W]+(fbm(u,v,24,6,4)-.5)*.62;
        if(Lw<=.5)continue;}
      LAND[i]=1;
      const inl=sm(.5,.92,b2);
      EL[i]=cl((.05+.16*lit(GE,u,v)+lit(GM,u,v)*(.34+.5*lit(GR,u,v))*(.5+.5*inl))*(.4+.6*inl),0,1);}}
  /* ---- passe 2 : les couleurs (sans allocation : R,G,Bc se mélangent en place ; ce qui ne dépend que de la latitude se calcule une fois par ligne) ---- */
  const img=x.createImageData(W,H),D=img.data;
  const SABLE=[226,196,136],OCRE=[196,146,92],PALE=[238,222,176],STEPPE=[176,170,100],PRAIRIE=[104,152,70],FORET=[46,114,62],JUNGLE=[26,92,54],TAIGA=[40,88,68],
    TOUNDRA=[138,138,116],ROCHE=[148,126,102],NEIGE=[246,250,253],GLACE=[222,236,248];
  let R=0,G=0,Bc=0;
  const set=function(a){R=a[0];G=a[1];Bc=a[2];},to=function(a,t){R+=(a[0]-R)*t;G+=(a[1]-G)*t;Bc+=(a[2]-Bc)*t;};
  for(let y=0;y<H;y++){const v=(y+.5)/H,lat=90-v*180,al=Math.abs(lat),
      base=.62-.34*Math.exp(-Math.pow((al-24)/9,2))+.14*Math.exp(-Math.pow(lat/8,2)),
      tTaiga=sm(48,58,al),tTundra=al,ligne=.68-.28*Math.min(1,al/66),trop=1-sm(8,58,al),glN=lat>0?77:64,
      pr0=mx(8,22,trop*.7+.1),pg0=mx(40,100,trop*.8+.1),pb0=mx(92,182,trop*.7+.2),sr=mx(30,56,trop),sg=mx(150,196,trop),sb=mx(176,194,trop);
    for(let q=0;q<W;q++){const i=y*W+q,u=(q+.5)/W;let r,g,b;
      if(LAND[i]){
        const lon=u*360-180,el=EL[i],des=lit(GD,u,v),jun=lit(GJ,u,v),
          hum=cl(base+(lit(GH0,u,v)-.5)*.9-des*1.15+jun*.9,0,1);
        if(hum<.3){const t=sm(.1,.3,hum),k=sm(.35,.75,lit(GS,u,v));R=SABLE[0]+(OCRE[0]-SABLE[0])*k;G=SABLE[1]+(OCRE[1]-SABLE[1])*k;Bc=SABLE[2]+(OCRE[2]-SABLE[2])*k;to(STEPPE,t*.6);if(hum<.12)to(PALE,sm(.55,.8,lit(GP,u,v))*.55);}
        else if(hum<.5){set(STEPPE);to(PRAIRIE,sm(.3,.5,hum));}
        else{set(PRAIRIE);to(FORET,sm(.5,.72,hum));}
        if(jun>.35)to(JUNGLE,sm(.35,.8,jun));
        if(tTaiga>0)to(TAIGA,tTaiga*sm(.35,.55,hum)*(1-jun));
        if(al>58)to(TOUNDRA,sm(60,68,al-el*8));
        if(el>.3)to(ROCHE,sm(.3,.55,el)*.85);
        if(el>.5-.28*Math.min(1,al/66))to(NEIGE,sm(ligne,ligne+.24,el+(lit(GN,u,v)-.5)*.16));
        let ice=0;
        if(lat<-63)ice=1;
        else if(lat>59.5){if(lon>-75&&lon<-11){ice=sm(60,70,lat);if(lon>-26&&lat<67)ice*=.25;}else if(al>78)ice=sm(78,84,al);}
        let sh=1;
        if(ice>0){const k=sm(.4,.6,lit(GI,u,v));R+=(GLACE[0]+(NEIGE[0]-GLACE[0])*k-R)*ice;G+=(GLACE[1]+(NEIGE[1]-GLACE[1])*k-G)*ice;Bc+=(GLACE[2]+(NEIGE[2]-GLACE[2])*k-Bc)*ice;}
        else{ // l'ombrage de colline : le soleil au nord-ouest (un voisin qui n'est pas de la terre prend la hauteur d'ici : pas de ressaut au bord)
          const iN=(y>0?i-W:i),iS=(y<H-1?i+W:i),iE=(q<W-1?i+1:i-W+1),iW=(q>0?i-1:i+W-1),
            eN=LAND[iN]?EL[iN]:el,eS=LAND[iS]?EL[iS]:el,eE=LAND[iE]?EL[iE]:el,eW=LAND[iW]?EL[iW]:el;
          sh=cl(1+((eW+eN)-(eE+eS))*1.1,.84,1.16);}
        const gr=sh*(1+((nz(u,v,200,9)-.5)*.16+(nz(u,v,100,10)-.5)*.1+(lit(GV,u,v)-.5)*.5)*(1-ice*.8)); /* le grain fin + les plaques de terrain (champs, forêts claires, roche) */ // le grain : la terre n'est pas lisse
        r=R*gr;g=G*gr;b=Bc*gr;
      }else{
        const b2=B2[i],bruit=lit(GO,u,v)-.5,
          k=sm(.02,.36,b2)*(.28+.5*trop),
          pr=pr0+bruit*7,pg=pg0+bruit*30,pb=pb0+bruit*45;
        r=pr+(sr-pr)*k;g=pg+(sg-pg)*k;b=pb+(sb-pb)*k;
        if(al>glN-16){const glace=sm(0,1,(al-glN-(lit(GG,u,v)-.5)*16)/7);
          if(glace>0){r+=(236-r)*glace;g+=(244-g)*glace;b+=(250-b)*glace;}}
      }
      const o=i*4;D[o]=r<0?0:r>255?255:r;D[o+1]=g<0?0:g>255?255:g;D[o+2]=b<0?0:b>255?255:b;D[o+3]=255;}}
  x.putImageData(img,0,0);
}
const TERRE_VOLUTES=false; // (2026-10-14, passe graphismes) interrupteur d'UNE ligne : les volutes blanches peintes sur la Terre (les seuls « nuages » qu'on voie en orbite — buildClouds/buildCoton/mkCloud n'y créent rien, lvlNuageOk dit non). false = Terre sans nuages. FALSE (Sacha a validé le retrait des « nuages » de l'espace, 14/10) : la Terre du matin est nette ; remettre true pour les revoir.
const TERRE_PETITE=(function(){try{var q=location.search,mm=function(m){return !!(window.matchMedia&&matchMedia(m).matches);},tn=(mm('(pointer:coarse)')||('ontouchstart' in window)||navigator.maxTouchPoints>0)&&(mm('(hover:none)')||Math.min(screen.width,screen.height)<600);return !/[?&]allege=0\b/.test(q)&&(tn||/[?&](tel|mobile|allege)=1\b/.test(q));}catch(e){return false;}})(); /* (2026-11-09) la toile de la Terre : 512 × 256 sur téléphone (même test qu'ALLEGE, défini plus bas : SANS_DAUPHIN fait pareil), 1024 × 512 sur l'ordi */
const planetGroup=(function(){
  const g=new THREE.Group();
  // texture : océans profonds, continents verts, calottes blanches et volutes nuageuses
  // TEXTURE ÉQUIRECTANGULAIRE d'après la réf : EUROPE + AFRIQUE, océan azur vif, Sahara ocre,
  // massifs enneigés, récifs et fosses. Tout est procédural (aucun asset) mais géographiquement lisible.
  const W9=TERRE_PETITE?512:1024,H9=W9>>1,cv=document.createElement('canvas');cv.width=W9;cv.height=H9;const x=cv.getContext('2d');
  const paintTerre=function(x){ /* (2026-11-09, Sacha : « c'est juste une boule bleue ») la Terre est peinte par terrePeintre : vrais continents, biomes, reliefs, plateau continental */
  terrePeintre(x,W9,H9);
  };const peintTerre=function(x){const r0=Math.random;Math.random=planetesAlea(77);try{paintTerre(x);}finally{Math.random=r0;}};peintTerre(x); // (graine fixe : la Terre est la même à chaque repeinte)
  const tex=new THREE.CanvasTexture(cv);tex.wrapS=THREE.RepeatWrapping;texLibere(tex); // (2026-10-14, passe perf mobile) 1024 × 512 peinte une fois : 2 Mo rendus après l'envoi (paliers 0-1)
  // ⚠ le grade final (expo + saturation + bloom) BRÛLE tout ce qui est clair : mesurée à [253,231,239],
  // la planète ressortait BLANCHE. On la rentre donc volontairement sombre — c'est le post qui la rallume.
  const globe=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R,44,30),
    new THREE.MeshBasicMaterial({map:tex,fog:false,color:0x8a98b0})); // teinte multiplicative : garde le bleu-vert au lieu de saturer
  /* LE JOUR ET LA NUIT SUR LA TERRE (2026-09-26). En MeshBasic, le globe était éclairé UNIFORMÉMENT — une bille peinte, sans
     volume. Il prend un soleil — ⚠ PAS `SUN_DIR` : en orbite la planète suit le CAP de la caméra (lvlPlanete), et avec le vrai
     soleil on la voyait par sa face de NUIT la moitié du niveau (mesuré : en roulant vers le couchant, un disque bleu-noir). La
     lumière vient donc du dessus, un peu de côté et de derrière l'œil : la face visible est TOUJOURS le jour, le terminateur
     court sur le bord bas (le plus souvent sous la route). En orbite le disque « 1.61 » est éteint : rien ne le contredit.
     Une face de jour un peu plus vive, une face de NUIT bleu-nuit (jamais noire — la Terre reste lisible), un TERMINATEUR large et
     ourlé d'une bande de couchant, le REFLET du soleil sur les océans (masqué hors des bleus : Mars ou Vénus n'ont pas de mer),
     et un liseré d'atmosphère DANS le disque, plus fort côté jour. ⚠ le limbe additif et le halo qui BAT au rythme sont d'autres
     coquilles : on n'y touche pas. Compilé au menu par les `renderer.compile` de chauffe (le globe est dans la scène, même caché). */
  globe.material.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWN9,vWP9,vL9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvWN9=normalize(mat3(modelMatrix)*normal);vWP9=(modelMatrix*vec4(transformed,1.)).xyz;'+
        'vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vL9=normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);'+
        'gl_Position.z=gl_Position.w;'); // (2026-09-26, vague 2) sur le plan lointain, comme le dôme : tout ce qui est devant la cache, test de profondeur compris
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWN9,vWP9,vL9;')
      .replace('#include <envmap_fragment>',[
        '{ vec3 N=normalize(vWN9),V=normalize(cameraPosition-vWP9),uSol=normalize(vL9);float ndl=dot(N,uSol);',
        '  float jour=smoothstep(-.22,.30,ndl);vec3 c0=outgoingLight;',
        '  vec3 c=mix(c0*vec3(.30,.36,.58)+vec3(.004,.008,.026),c0*1.12,jour);',            // nuit bleu-nuit ↔ jour
        '  c+=vec3(1.,.42,.20)*.16*(1.-smoothstep(0.,.20,abs(ndl-.02)));',                  // le couchant qui court sur le terminateur
        '  float mer=smoothstep(.02,.12,c0.b-max(c0.r,c0.g));vec3 H=normalize(uSol+V);',
        '  c+=vec3(1.,.9,.74)*pow(max(dot(N,H),0.),70.)*mer*jour*.55;',                     // le soleil qui scintille sur l océan
        '  vec3 rim9=mix(mix(vec3(.85,.52,.30),vec3(.92,.82,.58),clamp(opacity*3.,0.,1.)),vec3(.30,.62,1.),step(.9,opacity));diffuseColor.a=1.;', // (2026-10-14, passe graphismes) la couleur du liseré se lit dans `opacity` (uniforme déjà là, inutilisé par un globe opaque) : 1 = bleu de la Terre (inchangé), 0 = ocre (Mars), .3 = crème (Jupiter, Saturne) ; l'alpha reste 1
        '  c+=rim9*pow(1.-max(dot(N,V),0.),3.)*(.12+.40*jour);',                // l atmosphère vue par la tranche, DANS le disque
        '  outgoingLight=c; }',
        '#include <envmap_fragment>'].join('\n'));
  };
  globe.material.customProgramCacheKey=function(){return 'globeJourNuit3';};
  globe.rotation.z=.28; // axe incliné, comme la vraie
  g.add(globe);
  // ATMOSPHÈRE : un liseré bleu qui déborde du disque (BackSide = on ne voit que le pourtour)
  // LE LIMBE : vu d'aussi près, c'est LUI qui vend l'altitude — un liseré d'atmosphère qui déborde
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.045,40,28),
    new THREE.MeshBasicMaterial({color:0x8fd4ff,transparent:true,opacity:.20,side:THREE.BackSide,
      blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  /* L'ATMOSPHÈRE EN DÉGRADÉ (2026-09-26, vague 2). La coquille ajoutait une opacité CONSTANTE : autour du disque un anneau bleu marine
     plat (mesuré #072e61, cerné net des deux côtés) — un liseré de dessin animé, pas de l'air — et un voile uniforme sur tout le globe.
     Elle dose désormais sa lumière à l'angle de vue : pleine au ras du disque (là où le regard traverse le plus d'air), nulle au bord
     extérieur de la coquille et au centre du globe. Même couleur, même opacité pilotée par la musique (LVLFX) et par le niveau (lvlAstre) :
     seul le PROFIL change. Le halo qui bat au rythme (la coquille suivante) n'est pas touché. */
  atmo.material.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vN9a,vV9a;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvN9a=normalMatrix*normal;vV9a=-mvPosition.xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vN9a,vV9a;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',
        'float nd9=abs(dot(normalize(vN9a),normalize(vV9a)));'+ // 0 au bord extérieur de la coquille, ≈ .29 au ras du disque (R / 1,045 R), → 1 au centre
        'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));');
  };
  atmo.material.customProgramCacheKey=function(){return 'atmoDegrade';};
  g.add(atmo);
  /* LE LIMBE QUI RESPIRE (2026-08-08) — « fais briller certains éléments comme la planète ».
     ⚠ ON NE TOUCHE PAS AU GLOBE. La doc juste au-dessus le dit : le grade final BRÛLE tout ce qui
     est clair, la planète est rentrée volontairement sombre pour que le post la rallume. Éclairer
     la TEXTURE la ramènerait au blanc plat qu'on avait déjà corrigé une fois. C'est donc le LIMBE,
     et lui seul, qui prend la musique : une seconde coquille additive plus large que la première,
     dont l'opacité et la teinte cognent au beat. Un halo qui gonfle autour d'un globe sombre se lit
     comme une atmosphère qui s'illumine ; un globe qui blanchit se lit comme un bug. */
  const halo=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.135,36,24),
    new THREE.MeshBasicMaterial({color:0x6fc0ff,transparent:true,opacity:.10,side:THREE.BackSide,
      blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  g.add(halo);
  // ⚠ le renderOrder d'un GROUP ne se propage PAS aux enfants (mesuré : la planète n'apparaissait
  // pas du tout — différence de pixels 0). Comme tout astre, elle se dessine en PREMIER, sans test
  // de profondeur : le ciel derrière, tout le reste (nuages, route) la recouvre naturellement ensuite.
  g.traverse(o=>{if(o.material){o.material.depthWrite=false;o.material.depthTest=false;o.renderOrder=-8;}});
  /* (2026-09-26, vague 2 — audit GPU) LE GLOBE SE PEINT APRÈS LE CIEL. Le dôme passe désormais APRÈS les opaques (voir skyDome) : le globe,
     s'il restait premier et sans test de profondeur, serait recouvert par le ciel. Il se pose donc lui aussi sur le plan lointain (z = w)
     et se dessine juste après le dôme (21 > 20), AVEC le test de profondeur : la route, les caisses, la ville le cachent sans qu'on ait
     à peindre ses pixels pour rien. Même image. */
  globe.material.depthTest=true;globe.renderOrder=21;
  /* ⚠ LE HALO TRAVERSAIT LA ROUTE (2026-09-25, user : « on voit le rayonnement de la Terre à travers la route »).
     Le globe est OPAQUE : il passe dans la liste opaque, en premier, et la route le recouvre — parfait. Mais l'atmosphère
     et le limbe sont TRANSPARENTS : three.js dessine TOUS les transparents APRÈS tous les opaques, renderOrder ou pas.
     Sans test de profondeur, ils se peignaient donc PAR-DESSUS la route déjà posée. Ils reprennent le test (sans écrire
     de profondeur) : la route, les caisses, la ville les masquent ; le ciel, lui, est plus loin qu'eux. */
  atmo.material.depthTest=true;halo.material.depthTest=true;
  g.userData.globe=globe;g.userData.atmo=atmo;g.userData.halo=halo;
  g.userData.tex=tex;g.userData.peintTerre=peintTerre;g.userData.W9=W9;g.userData.H9=H9;g.userData.peint='terre'; // (2026-10-14, passe graphismes) de quoi repeindre la toile (planetesPeint)
  scene.add(g);return g;
})();
/* <<<FIN CIEL>>> */
/* ===== LE FLOU DES TOILES SANS `ctx.filter` (24/10, relecture WebKit : « les bugs qui n'existent que sous Safari / WKWebView ») =====
   `ctx.filter='blur(Npx)'` n'existe dans AUCUN Safari (iOS 15 → 18 : derrière le réglage « Canvas Filters », éteint par défaut) : l'affectation
   y crée une simple propriété et rien n'est flouté — les rayons du soleil et les faisceaux des phares de TOUTES les caisses sortaient à bords
   nets sur iPhone (le `try` ne voit rien : il n'y a pas d'erreur). Là où le filtre manque, `flou2dRepli` floute la toile APRÈS le dessin :
   trois flous-boîtes séparables (≈ la gaussienne d'écart-type N du filtre CSS), en alpha prémultiplié (pas de frange sombre), le dehors de la
   toile transparent. Une fois par texture, au chargement (256 × 256 : quelques ms). Là où `ctx.filter` existe (Chrome, Firefox, Android) :
   la fonction rend tout de suite, rien ne change. */
function flou2dNatif(){if(flou2dNatif.v===undefined){try{flou2dNatif.v=typeof CanvasRenderingContext2D!=='undefined'&&('filter' in CanvasRenderingContext2D.prototype);}catch(e){flou2dNatif.v=false;}}return flou2dNatif.v;}
function flou2dRepli(c,w,h,s){if(flou2dNatif()||!(s>0))return;try{
  const im=c.getImageData(0,0,w,h),d=im.data,n=w*h,A=new Float32Array(n*4),B=new Float32Array(n*4);
  for(let i=0;i<n;i++){const a=d[i*4+3]/255;A[i*4]=d[i*4]*a;A[i*4+1]=d[i*4+1]*a;A[i*4+2]=d[i*4+2]*a;A[i*4+3]=d[i*4+3];}
  const wi=Math.sqrt(4*s*s+1);let wl=Math.floor(wi);if(wl%2===0)wl--;const m=Math.round((12*s*s-3*wl*wl-12*wl-9)/(-4*wl-4)); /* les 3 boîtes d'une gaussienne : m de largeur wl, les autres wl+2 */
  const passe=function(S,D,r,hz){const L=hz?w:h,K=hz?h:w,st=hz?4:w*4,k=1/(2*r+1);
    for(let j=0;j<K;j++){const o=hz?j*w*4:j*4;for(let ch=0;ch<4;ch++){let acc=0;for(let t=0;t<=r&&t<L;t++)acc+=S[o+t*st+ch];
      for(let i=0;i<L;i++){D[o+i*st+ch]=acc*k;const ad=i+r+1,ot=i-r;if(ad<L)acc+=S[o+ad*st+ch];if(ot>=0)acc-=S[o+ot*st+ch];}}}};
  for(let b=0;b<3;b++){const r=((b<m?wl:wl+2)-1)/2;passe(A,B,r,true);passe(B,A,r,false);}
  for(let i=0;i<n;i++){const a=A[i*4+3],q=a>0?255/a:0;d[i*4+3]=Math.round(a);d[i*4]=Math.round(A[i*4]*q);d[i*4+1]=Math.round(A[i*4+1]*q);d[i*4+2]=Math.round(A[i*4+2]*q);}
  c.putImageData(im,0,0);}catch(e){}}
const RAYS=(function(){ // 3-4 faisceaux diffus en éventail derrière les nuages (discrets)
  const cv=document.createElement('canvas');cv.width=64;cv.height=256;
  const c=cv.getContext('2d');
  try{c.filter='blur(5px)';}catch(e){}
  // MÊME PIÈGE que la nappe d'horizon : la 1re étape valait .5 EN BAS DU CANVAS, pile sur le bord —
  // une coupure franche en travers d'un sprite additif de 260 × 1700. On part donc de zéro et on
  // monte en 6 % de hauteur : le pied du rayon s'allume au lieu d'être tranché au couteau.
  const g=c.createLinearGradient(0,256,0,0);
  g.addColorStop(0,'rgba(255,190,150,0)');g.addColorStop(.06,'rgba(255,190,150,.5)');
  g.addColorStop(.55,'rgba(250,150,140,.18)');g.addColorStop(1,'rgba(240,130,130,0)');
  c.fillStyle=g;
  c.beginPath();c.moveTo(26,256);c.lineTo(38,256);c.lineTo(58,0);c.lineTo(6,0);c.closePath();c.fill();
  flou2dRepli(c,64,256,5); /* (24/10) Safari n'a pas `ctx.filter` : le même flou, après coup (voir LE FLOU DES TOILES SANS ctx.filter) */
  const tex=new THREE.CanvasTexture(cv);
  const arr=[];
  for(let i=0;i<RAY_ANGLES.length;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:RAY_OPACITY,rotation:RAY_ANGLES[i]}));
    sp.renderOrder=-6; // épinglé derrière les nuages (voir sunSprite)
    sp.scale.set(260,1700,1);arr.push(sp);
  }
  return arr;
})();
const SUN_PERP=new THREE.Vector3().crossVectors(SUN_DIR,new THREE.Vector3(0,1,0)).normalize();
// Détection mobile / matériel faible AVANT le renderer : elle pilote antialias, DPR, ombres et post-traitement.
/* ⚠ `?tel=1` (ou `?mobile=1`) — LA VERSION TÉLÉPHONE SUR L'ÉCRAN D'ORDI (2026-09-24). « Une version
   mobile et tactile, jouable sur mon écran d'ordi avec le même affichage que sur un téléphone, mais
   sans simuler un écran de téléphone » : le jeu garde TOUTE la fenêtre, et prend le chemin téléphone
   complet — coque de menu, écran nu, volant à gauche, NITRO à droite, gaz auto, rendu mobile.
   Ce qui change par rapport à un vrai téléphone, et seulement ça : pas de gel « téléphone couché »
   (un écran d'ordi est en paysage, c'est normal), pas de plein écran forcé au premier clic, et une
   résolution d'image à la mesure d'un moniteur (voir `applyQ`). Toutes les commandes tactiles ont un
   repli souris ; le clavier reste branché ; un écran tactile d'ordi marche au doigt. */
/* ⚠ LES DEUX ÉDITIONS : `EDITION` est déclarée dans le <head> (2026-09-28), à côté de la COLONNE de l'ordi qui en dépend —
   c'est toujours la SEULE ligne qui diffère entre VERSION PRINCIPALE et AUTRE VERSION (voir synchro-versions.js). Dans la
   colonne, ce qui suit voit un écran de 390 × 844 non tactile : c'est donc ce chemin `FORCE_TEL` qui y tourne. */
const TACTILE_NATIF=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||('ontouchstart'in window)||navigator.maxTouchPoints>0;
const TEL_NATIF=TACTILE_NATIF&&((window.matchMedia&&matchMedia('(hover:none)').matches)||Math.min(screen.width,screen.height)<600); // (2026-10-01) l'ÉCRAN, pas la fenêtre — même test que la colonne du <head>
const FORCE_TEL=/[?&](tel|mobile)=1/.test(location.search)||(EDITION==='mobile'&&!TEL_NATIF&&!/[?&](pc|desktop)=1/.test(location.search)); // l'ORDI qui joue la version téléphone
const IS_MOBILE=FORCE_TEL||TEL_NATIF;
/* ===== LES DEUX VERSIONS DU JEU : MAX SUR ORDINATEUR, OPTIMISÉE SUR TÉLÉPHONE (2026-10-25, Sacha : « quand on lance Vercel, ça arrive sur la version
   maximum ; quand on lance le téléphone, c'est la version optimisée — que j'aie pas à te le redire ») =====
   UN SEUL code, DEUX régimes, séparés par UN SEUL drapeau :
     · `ALLEGE` = la version OPTIMISÉE : le VRAI téléphone (TEL_NATIF), ou un essai à la main (`?tel=1` / `?mobile=1` / `?allege=1`). `?allege=0` la coupe (comparer).
       C'est LUI qui garde TOUT ce qui retire de l'image : résolution, ombres, bloom, anticrénelage, densité des décors, satellites, cartes retirées du tirage…
     · l'ORDINATEUR (Vercel, /jouer/) = le MAX : chaque branche « PC » du code, jamais allégée.
   ⚠ `IS_MOBILE` NE DIT PAS « téléphone » : il est vrai AUSSI sur l'ordi, qui joue l'édition 'mobile' dans son cadre de téléphone (FORCE_TEL, voir EDITION). Il ne sert
   donc QU'À L'INTERFACE (tactile, disposition, cadre). Tout allègement de rendu ou de contenu se garde sur `ALLEGE` — `garde-allege.sh` (lancée par vercel-build.sh)
   REFUSE la publication si `IS_MOBILE` apparaît hors de la liste des fichiers d'interface. Les paliers `PAL.b(...)` restent sûrs (l'ordi est au palier 2).
   Le 24/10, des retraits « téléphone » gardés par IS_MOBILE ont dégradé le PC (forêt, dunes, Crypto City, Jade, satellites) : c'est pour que ça ne revienne pas. */
/* `LOOK_TEL` = L'IMAGE TELLE QU'ELLE A ÉTÉ RÉGLÉE (DA, étalonnage dans l'ACES, bloom .44, flou de boost) : elle a été mise au point dans le cadre téléphone,
   donc la MÊME sur ordi et sur téléphone — ce n'est PAS un allègement, on n'y touche pas pour « améliorer » le PC (ça changerait les couleurs et le halo que Sacha a validés). */
const LOOK_TEL=FORCE_TEL||TEL_NATIF;
const POSTE_BANC=[7,10]; /* le banc du processeur (ms) : au-delà du 1er seuil le poste part ALLÉGÉ, du 2e LÉGER — voir POSTE */
/* ===== LE RÉGIME DU POSTE — POSTE (2026-11-10, Sacha : « une vraie session d'optimisation pour la version Vercel PC, qui s'adapte à chaque type de PC : pas de latence, peu importe l'ordi ») =====
   MESURÉ (outils/banc-pc/lent.cjs, page-cadre 1920×1080, course au pilote auto) : l'ordi de Sacha tient 55-59 i/s ; le même avec un processeur 4× plus lent : 22 i/s HACHÉES (17 / 33 / 50 ms en vrac) ;
   sans carte graphique (rendu logiciel) : 1 i/s. Dans les trois cas le jeu restait au MAXIMUM, cran 0 : depuis le 14/10 l'échelle de qualité ne décidait que sur un vrai téléphone, et « l'ordi a toujours
   le max » (25/10) valait aussi pour l'ordi qui ne le tient pas. La règle devient : l'ordinateur a le maximum QUE SA MACHINE TIENT. Un poste qui tient 60 i/s ne change pas d'un pixel.
   QUATRE RÉGIMES, choisis AU CHARGEMENT (les budgets de contenu se lisent à la construction) :
     3 · MAX      : l'image d'avant, au pixel près.
     2 · ALLÉGÉ   : la version optimisée du téléphone récent (ALLEGE : maps sobres, résolution plafonnée à 1,5, ombres et halo du téléphone).
     1 · LÉGER    : ALLÉGÉ + palier MOYEN (budgets de triangles, de particules, menus à 30 i/s).
     0 · MINIMUM  : ALLÉGÉ + palier ANCIEN (30 i/s stables dès le départ, halo coupé).
   COMMENT ON SAIT : `?poste=0..3` (banc) · IMAGE = HAUTE choisie par le joueur → MAX, jamais baissé · ce que le jeu a APPRIS sur ce poste (`localStorage.cashcarPoste`, écrit par le juge de course :
   moteur/poste-juge.js) · sinon, à la 1re visite : la carte graphique (rendu logiciel → MINIMUM ; puce intégrée ancienne → ALLÉGÉ), le nombre de cœurs, la mémoire, et un petit banc du processeur.
   EN COURSE, À CHAUD (aucun rechargement) : l'échelle QL joue désormais sur l'ordi aussi (ombre, halo, puis la résolution jusqu'à 72 % — 50 % en cas d'effondrement — des pixels réels ; elle remonte
   seule quand la marge revient), puis la cadence stable (30 i/s régulières plutôt que 22 hachées). Le JUGE compte : à bout de leviers et toujours lent, ou calé sur 30 la moitié de la course →
   un régime plus bas à la prochaine visite ; une course entière avec de la marge → un régime plus haut (un régime qui a échoué est un MUR : 1 jour, puis 2, 4, 8, 14).
   `?poste=max` = le jeu d'avant (rien ne s'adapte) ; `dbgPoste()` décrit ; `dbgPoste('oubli')` efface ce qui a été appris. Le téléphone (TEL_NATIF) n'est pas concerné : POSTE.auto y est faux. */
function posteLit(){try{const a=JSON.parse(localStorage.getItem('cashcarPoste')||'null');return a&&a.v===1?a:null;}catch(e){return null;}}
function posteEcrit(o){try{const a=Object.assign(posteLit()||{v:1},o,{t:Date.now()});localStorage.setItem('cashcarPoste',JSON.stringify(a));return a;}catch(e){return null;}}
const POSTE=(function(){
  const P={pc:!TEL_NATIF,auto:false,r:3,pal:2,allege:false,src:'défaut',puce:'',logiciel:false,faible:false,coeurs:navigator.hardwareConcurrency||0,mem:navigator.deviceMemory||0,banc:null,appris:null,k0:0};
  const q=location.search;
  if(!P.pc){P.src='téléphone';return P;}
  if(/[?&]poste=max\b/.test(q)){P.src='?poste=max';return P;}
  if(/[?&](tel|mobile|allege)=[01]\b/.test(q)){P.src='essai à la main (?tel / ?allege)';return P;} /* les essais « téléphone sur l'ordi » et les bancs gardent leur régime exact */
  P.auto=true;
  /* (2026-11-11, Sacha : « mon Mac a eu 15 Go de RAM utilisés par Vercel, ça a crashé ») macOS : la résolution ne change JAMAIS en course (aucune réallocation de la toile ni des cibles à chaud — non vérifiable sur Mac depuis le banc, et c'est le seul travail à chaud du régime qui alloue de la mémoire graphique). Le Mac s'adapte par le régime choisi au chargement, les crans sans réallocation (ombre en vol) et la cadence stable. `?postefixe=0|1` force. */
  P.fixe=/[?&]postefixe=1/.test(q)||(!/[?&]postefixe=0/.test(q)&&(/Mac/i.test(navigator.platform||'')||/Macintosh|Mac OS X/i.test(navigator.userAgent||'')));
  const a=posteLit();P.appris=a;
  /* la carte graphique : retenue d'une visite à l'autre (palPuce la relit sur le vrai contexte et corrige) ; à la 1re visite, un contexte d'une ligne, rendu aussitôt */
  let puce=(a&&a.puce)||'';
  if(!puce){try{const c=document.createElement('canvas');c.width=c.height=1;const o={powerPreference:'high-performance'},g=c.getContext('webgl2',o)||c.getContext('webgl',o);
    if(g){const x=g.getExtension('WEBGL_debug_renderer_info');puce=x?String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)||''):'';const l=g.getExtension('WEBGL_lose_context');if(l)l.loseContext();}}catch(e){}}
  P.puce=puce;
  P.logiciel=/SwiftShader|llvmpipe|softpipe|Software|Basic Render|WARP/i.test(puce);
  P.faible=/Intel[^,]*\b(HD|UHD) Graphics|\bGMA \d|Mali-|Adreno|PowerVR|VideoCore|Radeon\(?T?M?\)? (HD|R[2-5]) |GeForce (GT|GTS)? ?[2-7]\d\d\b/i.test(puce);
  /* le petit banc du processeur (le même que PAL : ~4-5 ms sur un ordi récent), UNE fois par poste */
  const banc=function(){try{const N=4096,x=new Float32Array(N),y=new Float32Array(N);let m=1e9;
      for(let r=0;r<4;r++){const t0=performance.now();let s=0,h=7;
        for(let k=0;k<120;k++)for(let i=0;i<N;i++){h=(Math.imul(h,1103515245)+12345)|0;x[i]=(h>>>8)*5.96e-8;y[i]=x[i]*x[(i+17)&4095]+y[(i+4095)&4095]*.5;s+=y[i];}
        const d=performance.now()-t0;if(s===s&&d<m)m=d;}
      return +m.toFixed(1);}catch(e){return null;}};
  const force=/[?&]poste=([0-3])\b/.exec(q);
  let haute=false;try{const s9=JSON.parse(localStorage.getItem('cashcarSave')||'null');haute=!!(s9&&s9.q==='haute'&&s9.qChoisi!==0);}catch(e){}
  if(force){P.r=+force[1];P.src='?poste';}
  else if(haute){P.r=3;P.src='IMAGE : HAUTE (choix du joueur)';}
  else if(P.logiciel){P.r=0;P.src='rendu logiciel (pas de carte graphique)';}
  else if(a&&a.src==='mesure'&&a.r>=0&&a.r<=3){P.r=a.r;P.src='appris en course';P.banc=a.banc!=null?a.banc:null;}
  else{
    P.banc=(a&&a.banc!=null)?a.banc:banc();
    let r=3,pq=[];
    if(P.faible){r=2;pq.push('puce intégrée');}
    if(P.coeurs&&P.coeurs<=2){r=Math.min(r,1);pq.push(P.coeurs+' cœurs');}
    else if(P.coeurs&&P.coeurs<=4&&P.mem&&P.mem<=4){r=Math.min(r,2);pq.push(P.coeurs+' cœurs, '+P.mem+' Go');}
    if(P.banc!=null&&P.banc>=POSTE_BANC[1]){r=Math.min(r,1);pq.push('banc '+P.banc+' ms');}
    else if(P.banc!=null&&P.banc>=POSTE_BANC[0]){r=Math.min(r,2);pq.push('banc '+P.banc+' ms');}
    P.r=r;P.src=pq.length?pq.join(' · '):'poste récent';
    posteEcrit({r:r,src:'depart',puce:puce,banc:P.banc});}
  P.pal=[0,1,2,2][P.r];P.allege=P.r<=2;
  if(a&&a.k>0&&a.kr===P.r)P.k0=a.k|0; /* le cran où l'échelle s'était posée à la dernière course de ce régime : on en repart, sans les secondes de saccades du début */
  try{document.documentElement.dataset.poste=String(P.r);}catch(e){}
  return P;})();
function posteVu(r){ /* (appelé par palPuce) la carte graphique du VRAI contexte : si elle contredit celle retenue, on la note pour la prochaine visite */
  if(!POSTE.auto||!r||r===POSTE.puce)return;POSTE.puceVraie=r;posteEcrit({puce:r});}
const ALLEGE=!/[?&]allege=0\b/.test(location.search)&&(TEL_NATIF||POSTE.allege||/[?&](tel|mobile|allege)=1\b/.test(location.search)); /* (2026-11-10) + l'ordinateur qui ne tient pas le maximum : voir POSTE */
/* ===== LES VAO DES MAILLAGES INSTANCIÉS (2026-11-13, gpu-base) ===== three r128 (`vendor/three.min.js`, WebGLBindingStates.setup) réécrivait TOUS les attributs d'un InstancedMesh à chaque appel de
   dessin (`isInstancedMesh → updateBuffers=true`), alors que son VAO les garde déjà. MESURÉ (banc 390×844, ?tel=1, ville de nuit en course) : 1 866 appels WebGL par image, dont 402 `vertexAttribPointer` et 336
   `bindBuffer` — 366 de ces 402 pour UN maillage instancié. Sur iPhone chaque appel WebGL traverse le processus GPU de WebKit (traduit en Metal) : c'est du travail par image, sans aucun pixel.
   `self.__ccVao` vrai : la retouche de three ne réécrit le VAO que si la matrice ou la couleur d'instances (ou leur tampon GL) a changé depuis le dernier passage sur ce VAO. Même image au pixel près.
   Seulement en ALLEGE (téléphone, `?tel=1`) ; `?sans=vao` = comme avant. */
self.__ccVao=ALLEGE&&!/[?&]sans=[^&]*\bvao\b/.test(location.search);
window.__ccAllege=ALLEGE; /* (2026-11-09, musique figée) pouce-bleu-jeu.js (un fichier à part) y lit « téléphone » (vrai ou ?tel=1) : les 10 morceaux de course y jouent en paliers pré-rendus ; ?musique=live = le direct */
/* (2026-10-09, Léo : « la capacité d'aller dans cette map avec une voiture, la mobilité comme le main, mais seulement ça : pas de jeu, que la
   voiture dans la map ») LA BALADE — `?map=jade` : la caisse sur la route des PICS DE JADE, sa conduite telle quelle ; ni pièces, ni plots,
   ni score, ni HUD ; la mort n'est qu'un replacement (le bac à sable) ; rien n'est écrit dans la sauvegarde. Voir « LES PICS DE JADE ». */
const BALADE=/[?&](map=jade|balade=1)\b/.test(location.search);
/* (2026-10-12, Léo : « là, il n'y a pas de fruits, tout ça : fais-en un niveau complet avec ses aspects — fruits custom, pièces ¥ yuan
   yen — qu'on ajoute au système audio (le simulateur) pour tester, référencé par un nom que tu choisis ») LE NIVEAU « SOLEIL DE JADE » :
   la map des PICS DE JADE en VRAI niveau (pièces, fruits, plaques, plots, pouvoirs, score, HUD, mort) — `dbgNiveauJade()` le lance
   (le simulateur l'appelle), `?niveau=jade` le choisit dès le chargement. JADE_JEU vrai = lvlChoisir rend la map, ses fruits à elle,
   ses pièces frappées du ¥. La BALADE (`?map=jade`, la voiture seule) ne change pas. */
let JADE_JEU=/[?&]niveau=jade\b/.test(location.search)&&!BALADE;
/* (2026-10-12, Léo : « lance-le en tant que map qui se déclenche quand on appuie sur JOUER, avec CETTE musique-là, précisément ; on retouchera
   la map directement sur le main ») LE JOUER = LE SOLEIL DE JADE : le JOUER de l'accueil et celui du garage lancent ce niveau (jadeJouer) —
   sauf pour un tout premier joueur (l'auto-école d'abord) et au simulateur pour ses parties SANS FIN (`?play=sansfin`). (Sa musique, GLISSE V2, est partie le 18/10 : Pouce bleu joue seul en course.) */
const JADE_PLAY=/[?&]play=jade\b/.test(location.search)&&!BALADE; // (2026-10-13, Sacha : « refonte du mode classique ») JOUER lance le MODE CLASSIQUE AU HASARD (classiqueJouer) — le SOLEIL DE JADE en direct : `?play=jade`
/* (2026-10-12, Léo : « l'important avec ce simulateur, c'est qu'on puisse jouer dans la map : enlève l'écran d'accueil ») LE JEU DU SIMULATEUR —
   `?simu=1` (posé par simulateur/course.html) : pas d'écran titre (le voile s'ouvre tout seul, comme la balade), pas de rechargement automatique
   quand une nouvelle version sort (le simulateur garde la main) ; le reste est le jeu tel quel. `dbgQuitte()` finit la course sans explosion. */
const SIMU_JEU=/[?&]simu=1\b/.test(location.search);
/* ===== L'INTRO NE COMMENCE QUE QUAND TOUT EST PRÊT (2026-11-08, Sacha, sur le 13 Pro : « l'animation du début a toujours des latences, c'est pas acceptable ; rallonge le temps de chargement s'il le faut ») =====
   INTRO_APRES : 0 = l'ancien (le film part tout de suite, le chargement se fait SOUS la boule) ; 1 = TÉLÉPHONE (TEL_NATIF) : tout le travail se fait AVANT le film, sous le serpent (script, étapes, liaison des programmes, chauffe du menu,
   textures, vignettes de la boule, photos, départ d'avance, son), le film part tout seul dès que tout est prêt, et RIEN ne travaille pendant qu'il joue (`window.__introPause` : la boucle du jeu, les photos, le pré-bâti se taisent ;
   ils reprennent au menu) ; 2 = comme 1, mais le film attend un toucher (retenu s'il est venu avant). `?intro=sous` = l'ancien ; `?introapres=0|1|2` règle (banc : sur le Mac, ?tel=1 ne suffit pas, il faut ?introapres=1). Ordinateur : 0. */
const INTRO_APRES=(function(){const m=/[?&]introapres=([012])\b/.exec(location.search);if(BALADE||SIMU_JEU||/[?&]depart=toucher\b/.test(location.search))return 0;if(m)return +m[1];if(/[?&]intro=sous\b/.test(location.search))return 0;return TEL_NATIF?1:0;})();
/* (2026-10-12, le simulateur) la page des maps pose ce jeu en PETIT sur une image puis en PLEIN ÉCRAN : son cadre change de zoom, donc de
   devicePixelRatio — le plafond de résolution (DPR_CAP), pris une fois au démarrage, restait celui de la petite image (plein écran flou).
   En ?simu=1 seulement, il suit le zoom du cadre (même calcul qu'au démarrage). */
if(SIMU_JEU){let dpr9=devicePixelRatio;setInterval(function(){if(Math.abs(devicePixelRatio-dpr9)<.01)return;dpr9=devicePixelRatio;
  try{DPR_CAP=Math.min(devicePixelRatio,ALLEGE?1:1.5);qlReprise();}catch(e){}},250);}
if(BALADE)document.documentElement.classList.add('balade');
/* (2026-11-03, Léo : « les graphismes sont nuls sur Vercel ») le nombre de cœurs ne rabat plus l'ORDINATEUR : un Mac à 4 cœurs perdait anticrénelage, MSAA, ombres et bloom — contre « l'ordi a toujours le MAX ». Seul ALLEGE (vrai téléphone) allège. */
const IS_LOW_END=ALLEGE;
