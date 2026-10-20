// POUVOIRS : grosses orbes rares — sphère de verre teinté + cœur brûlant + anneau qui tourne
const pwrGeo=new THREE.IcosahedronGeometry(1.9,1),pwrCoreGeo=new THREE.OctahedronGeometry(.95,0), // (2026-09-26) le CRISTAL à facettes et son cœur-étoile
      pwrRingGeo=new THREE.TorusGeometry(2.6,.12,6,32);
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») UN POUVOIR = UNE COULEUR, du cristal à l'écran. La NITRO MAX était BLEUE en 3D (#1e7bff),
   bleu clair sur sa plaque (#4db8ff)… et sa jauge brûle en OR : trois couleurs pour une seule chose. Et les cristaux n (bleu) et a
   (#7dffec) se confondaient de loin. Désormais : n = OR-FEU #ffb040 (la jauge, la plaque et les bords d'écran suivent `tint`/`fx`),
   a = CYAN #5ee6ff (l'air), v = MAGENTA #ff3ec8 (la vitesse). Et le cristal ÉMET : verre plus dense (.78), émissif .9, cœur ×1,3, et un
   HALO additif en sprite (une matière par pouvoir, PARTAGÉE, la texture `lampTex` commune) — on le repère au bout de la route. */
/* LES POUVOIRS v2 (2026-09-28, Sacha : « rajoute des nouveaux items de power up, augmente la durée des power up — des petits trucs
   grisants, que les débutants prennent leur pied autant que les vétérans »). Chaque fiche porte désormais TOUT ce qui la distingue :
   `t` la durée (s) · `px` le pictogramme pixel (PXI_G) · `plq` le nom sur la plaque du HUD · `sp` la gerbe de ramassage.
   · DURÉES ALLONGÉES : nitro 6 → 9 s, airtime 10 → 14 s, vitesse 6 → 8 s.
   · LE MÊME POUVOIR SE CUMULE : repris pendant qu'il court, il AJOUTE sa durée (plafond 2 × `t`) — « +9 S » jaillit de la caisse.
   · TROIS NOUVEAUX : m AIMANT (vert billet : il attire l'argent) — tout l'or de la route vient à toi, d'un bord à l'autre et loin
     devant ; x AURA ×2 (l'OR : la nitro max prend le
     violet) — chaque point d'aura compte double.
   · DEUX POUVOIRS EN MÊME TEMPS = « DOUBLÉ ! », trois = « TRIPLÉ ! » : de l'aura en plus — la chasse aux cristaux devient un jeu.
   · LE TIRAGE LIT LE JOUEUR (`pwrTire`) : un débutant voit surtout AIMANT et AIR MAX, et le tout premier cristal de ses premières
     parties est un AIMANT ; un vétéran voit plus d'AURA ×2 et de VITESSE.
   · (2026-09-29, Sacha : « supprime le pouvoir bouclier ») LE BOUCLIER EST RETIRÉ — il y avait six pouvoirs, il en reste CINQ. Plus de
     chute pardonnée par un cristal (plus aucun filet), plus de plots qui
     « DÉMOLI », plus d'huile neutralisée. Ses poids de tirage sont rendus aux autres (pwrPoids) ; le 1er cristal du débutant est un AIMANT. */
const PWR_DEFS={ // n = nitro infinie · a = airtime infini · v = vitesse ×2 · m = aimant · x = aura ×2 (b = bouclier : retiré le 29/09)
  n:{col:0xffb040,core:0xfff2c8,ico:'',px:'flamme',plq:'NITRO MAX',sp:'or',msg:'NITRO INFINIE — 9 s À FOND !',hud:'NITRO ∞',tint:'#ffb040',t:9,gros:'NITRO ILLIMITEE',sous:'9 S A FOND',c2:'#ff7a24',fx:'rgba(255,176,64,.85)',fx2:'rgba(255,122,36,.35)'},
  a:{col:0x5ee6ff,core:0xe8fcff,ico:'🪂',px:'aile',plq:'AIR MAX',sp:'bleu',msg:'🪂 AIRTIME INFINI — 14 s DE VOL !',hud:'AIR ∞',tint:'#5ee6ff',t:14,gros:'AIRTIME INFINI',sous:'14 S DE VOL',c2:'#1fa2e0',fx:'rgba(94,230,255,.8)',fx2:'rgba(30,150,230,.3)'},
  v:{col:0xff3ec8,core:0xffd6f2,ico:'⚡',px:'eclair',plq:'VITESSE ×2',sp:'rose',msg:'⚡ VITESSE ×2 — 8 s !',hud:'VITESSE ×2',tint:'#ff3ec8',t:8,gros:'VITESSE ×2',sous:'8 S',c2:'#ff2e8a',fx:'rgba(255,62,200,.85)',fx2:'rgba(255,46,138,.35)'},
  m:{col:0x3fe06a,core:0xe6ffec,ico:'',px:'aimant',plq:'AIMANT',sp:'or',msg:'AIMANT — 12 s : TOUT L\'OR VIENT À TOI !',hud:'AIMANT',tint:'#5ee37a',t:12,gros:'AIMANT',sous:'L\'OR VIENT A TOI',c2:'#1fae4a',fx:'rgba(94,227,122,.55)',fx2:'rgba(31,174,74,.2)'} /* (2026-09-29, critique DA : le bord d'écran vert faisait un voile sarcelle fort, surtout en ville de nuit — adouci) */,
  x:{col:0xffc93a,core:0xfff6d8,ico:'',px:'etoile',plq:'AURA ×2',sp:'or',msg:'AURA ×2 — 12 s : TOUTE L\'AURA COMPTE DOUBLE !',hud:'AURA ×2',tint:'#ffd75e',t:12,gros:'AURA ×2',sous:'TOUTE L\'AURA COMPTE DOUBLE',c2:'#ffb000',fx:'rgba(255,215,94,.85)',fx2:'rgba(255,176,0,.35)'}}; // (x en OR : la NITRO MAX passe au violet côté session UHD)
/* (2026-09-28, Sacha : « nitro infini doit être VIOLET — les flammes, la traînée, la barre de nitro ») LA NITRO INFINIE A SA COULEUR : l'or-feu
   #ffb040 se confondait avec la nitro ordinaire (orange) — on ne voyait pas qu'on avait le pouvoir. Un VIOLET électrique, loin du magenta de
   VITESSE ×2 : le cristal, la plaque du HUD, les bords d'écran, la jauge et son feu, la plume, la traînée et le reflet de la caisse le portent
   tous (`NINF`, lu par la boucle). Une ligne à part : l'objet ci-dessus appartient à la logique des pouvoirs. */
Object.assign(PWR_DEFS.n,{col:0xa45cff,core:0xf1e2ff,tint:'#b06bff',c2:'#7b34f0',fx:'rgba(164,92,255,.85)',fx2:'rgba(123,52,240,.35)'});
/* (2026-10-14, passe graphismes · étalonnage commun) LE VOILE DES BONUS, DOSÉ : les bords d'écran qui battent pendant TOUT le pouvoir (#pwrFx :
   deux ombres internes `fx` 50 px + `fx2` 150 px) recoloraient les coins et la moitié de l'image — vert sous l'aimant, magenta sous la vitesse ×2
   (9 captures sur 24 à l'audit) : la palette de la météo disparaissait. Leur force (l'alpha) est divisée par 2,5 dans une copie `bd`/`bd2`,
   lue seulement par les bords TENUS ; l'éclair bref du ramassage (`flashEcran(d.fx)`) garde la sienne. Revenir : PWR_BORD_K=1. */
const PWR_BORD_K=1/2.5;for(const k9 in PWR_DEFS){const d9=PWR_DEFS[k9],f9=function(c){return c.replace(/,([.\d]+)\)$/,function(m,a){return ','+(+a*PWR_BORD_K).toFixed(3)+')';});};d9.bd=f9(d9.fx);d9.bd2=f9(d9.fx2);}
const NINF={jet:0x9d4dff,core:0xf3e6ff,rac:0xd8b8ff,trail:[.95,.45,1.6]}; // la nitro infinie dans le monde : plume, cœur, racine du brûleur, ruban
for(const k in PWR_DEFS){const d=PWR_DEFS[k];
  d.glassM=new THREE.MeshPhongMaterial({color:d.col,emissive:d.col,emissiveIntensity:.9,shininess:260,specular:0xffffff,envMap:envTex,reflectivity:.6,transparent:true,opacity:.78,depthWrite:false,flatShading:true});
  d.coreM=new THREE.MeshBasicMaterial({color:d.core});
  d.ringM=new THREE.MeshBasicMaterial({color:d.col,transparent:true,opacity:.85});
  d.haloM=new THREE.SpriteMaterial({map:lampTex,color:d.col,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending}); // le HALO : partagé par tous les cristaux du même pouvoir
  // ÉTIQUETTE FLOTTANTE : pictogramme + nom au-dessus de l'orbe — on sait ce qu'on vise AVANT de le prendre
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  d.icoM=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false});
  /* (2026-09-29, passe « jeu pro » — deux critiques : « un petit carré doré cerné de noir au centre exact de l'écran, un pixel mort ou un marqueur
     de débogage ») : c'était cette étiquette, vue de loin (6 m à 300 m = un carré de 3 px). Elle s'efface entre 110 et 160 m ; le cristal et
     son halo, eux, restent visibles de loin. Programme compilé avec la piste du menu (les cristaux y sont déjà). */
  d.icoM.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vD9;').replace('#include <fog_vertex>','#include <fog_vertex>\nvD9=-mvPosition.z;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vD9;').replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.a*=1.-smoothstep(110.,160.,vD9);');};
  d.icoM.customProgramCacheKey=function(){return 'pwrEtiquette';};
  d.icoDessine=function(){const c=cv.getContext('2d');c.clearRect(0,0,128,128);c.textAlign='center';
    /* (2026-09-26, vague 2) LE PICTOGRAMME EN PIXELS, LE MÊME QUE SUR LA PLAQUE DU HUD (`PXI_G` : flamme / aile / éclair). C'était un
       EMOJI (🪂, ⚡) — dessiné par la police du système, en couleurs de dessin animé, différent sur chaque téléphone : la seule image
       du jeu qui n'était pas en pixels. Grille 9×9 à 5 px la case, cernée d'ENCRE (4 décalages), à la couleur du pouvoir. */
    const g=PXI_G[d.px]; // (pouvoirs v2) le pictogramme est dans la fiche
    if(g){const rows=g.split('|'),Z=5,X0=64-4.5*Z,Y0=12;
      for(const o of [[-2,0],[2,0],[0,-2],[0,2],[0,0]]){c.fillStyle=o[0]||o[1]?'#1c0430':d.tint;
        for(let y=0;y<9;y++)for(let x=0;x<9;x++)if(rows[y][x]==='#')c.fillRect(X0+x*Z+o[0],Y0+y*Z+o[1],Z,Z);}}
    // (2026-09-26) l'étiquette dans la POLICE DU JEU (pixel), cerclée d'ENCRE — « ∞ » n'existe pas en pixel : MAX
    const lb=sansAcc(TR(String(d.hud).replace('∞','MAX').replace(' +60%','')));c.font=(lb.length>9?'11px':'13px')+' "Press Start 2P",monospace';c.lineWidth=6;c.lineJoin='round';c.strokeStyle='#1c0430'; /* (pouvoirs v2) traduit ; un nom long en plus petit (le canvas fait 128 px) — (2026-09-29) le contour d'ENCRE était avalé par ce commentaire : trait noir d'1 px */
    c.strokeText(lb,64,102);c.fillStyle=d.tint;c.fillText(lb,64,102);d.icoM.map.needsUpdate=true;};
  d.icoDessine();
}
// (vague 2) la police pixel est une woff2 locale : si elle n'était pas encore chargée au premier dessin, l'étiquette serait restée en
// monospace de secours pour toute la partie — on la redessine UNE fois quand la police est prête (un petit canvas, aucun shader).
try{if(document.fonts&&document.fonts.load)document.fonts.load('13px "Press Start 2P"').then(function(){for(const k in PWR_DEFS)PWR_DEFS[k].icoDessine();}).catch(function(){});}catch(e){}
/* (2026-10-20, Léo : « les boosts de la route deviennent des FRUITS ») LES CRISTAUX SONT DEVENUS DES FRUITS-POUVOIRS : piment (n, nitro infinie), raisin (a, airtime ×2),
   citron (v, vitesse ×2), pomme dorée (m, aimant), fruit du dragon (x, aura ×2). Même clé, même minuteur, mêmes plaques : seule l'ENVELOPPE change (forme du fruit
   `fruitPowGeo`, aura en shader `fauraFruit` — voir fruits-auras.js). Le dessin des cristaux reste dessous, pour `?cristaux=1`. */
const FRUIT_POW_AURA={n:0,v:1,x:2,a:3,m:4};
function mkPower(kind,dir){
  const d=PWR_DEFS[kind],g=new THREE.Group();
  if(FRUIT_POW[kind]&&!/[?&]cristaux=1/.test(location.search)){
    const geo=fruitPowGeo(kind);if(!geo.boundingBox)geo.computeBoundingBox();
    const m=new THREE.Mesh(geo,FRUIT_MAT);m.scale.setScalar(4.8);g.add(m); // ×4,8 : les fruits-pouvoirs sont GROS, trois fois les fruits normaux
    g.userData.lev=-geo.boundingBox.min.y*4.8+.08; // POSÉ SUR LE BITUME (Léo : « qu'ils ne flottent pas ») : le centre du groupe est à `lev` au-dessus du sol
    {const au=fauraCubes(FRUIT_POW_AURA[kind],g.userData.lev);if(au.children.length)g.add(au);} // l'aura en MINI CUBES vit AUTOUR du fruit, sans jamais le cacher
    if(kind==='m'){const sh=fauraFruit(4,geo);if(sh.children.length)m.add(sh);} // la pomme dorée : rien autour, c'est le fruit qui SCINTILLE
    g.userData.fruit=true;
    return g;
  }
  const co=new THREE.Mesh(pwrCoreGeo,d.coreM);co.scale.setScalar(1.3); // (vague 2) le cœur ×1,3 : il perce le verre plus dense
  g.add(co,new THREE.Mesh(pwrGeo,d.glassM));
  const ring=new THREE.Mesh(pwrRingGeo,d.ringM);ring.rotation.x=Math.PI/2;g.add(ring);
  const ring2=new THREE.Mesh(pwrRingGeo,d.ringM);ring2.rotation.set(Math.PI/2,.9,0);ring2.scale.setScalar(.84);g.add(ring2); // (2026-09-26) le 2e anneau, croisé : un gyroscope
  const ic=new THREE.Sprite(d.icoM);ic.scale.set(6,6,1);ic.position.y=(dir||1)*4.1;g.add(ic); // sous la route : étiquette côté joueur
  const ha=new THREE.Sprite(d.haloM);ha.scale.set(6,6,1);ha.renderOrder=2;ha.updateMatrix();ha.matrixAutoUpdate=false;g.add(ha); // (vague 2) le HALO additif (sprite : 4 sommets, zéro lumière)
  return g;
}
