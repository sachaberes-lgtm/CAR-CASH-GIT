/* ============================================================================
   (2026-10-16, Sacha : « la map ville, elle sera toujours la nuit. Tu reprends la map nuit avec de la pluie qui était là de base — la première version finie de la
   ville — et tu la déclines simplement en plusieurs couleurs : une violette, c'est celle de base ; une autre avec des néons verts, une autre avec des néons jaunes,
   une autre bleue — bleu foncé, bleu électrique. La ville est toujours la nuit : des fois du brouillard, des fois de la pluie, des fois pas de pluie. La ville-jour,
   ça marche pas : on abandonne toutes les maps ville-jour. »)
   LA VILLE TOUJOURS LA NUIT, EN QUATRE COULEURS. au JOUER, LA VILLE n'a plus ni matin, ni midi, ni soir (SF_CARTES.ville) ; c'est toujours la map de
   base — la ville au néon d'AU-DESSUS DE LA VILLE — sous quatre temps : la PLUIE (la map d'origine), la NUIT sèche (minuit), le BROUILLARD (villeBrume + LVL.brume :
   le plafond bas sans une goutte), l'ORAGE ; et une TEINTE tirée au hasard à chaque fois (sfTire) : VIOLET (la ville de base, au pixel près), VERT, JAUNE, BLEU.
   Une teinte = un REMAPPAGE SÉLECTIF de la teinte (vtRgb) : seule la famille violet → magenta → rose de la ville (250°-345°) bascule — le violet de l'air vers `a`,
   le magenta des néons vers `b` ; le cyan des enseignes, l'ambre et le cyan des fenêtres, le rouge des balises restent ce qu'ils sont. Il s'applique :
     · aux AMBIANCES de la ville, copiées en `<ambiance>_<teinte>` à leur premier emploi (vtBio) : brume, lumières, vignette, reflets ;
     · aux NÉONS des tours et à l'ACCENT de la route (rails, nappe, flaques, couronnes : buildTrack, buildVoxCity), aux RÉCLAMES (villePubAtlas, repeintes) ;
     · aux couleurs FIXES du ciel (skyU.uFd, skyU.uVc) et du pied des tours (CITY.uPiedC) : posées par vtPose, fondues au portail avec le reste (lvlGo, lvlStep).
   Rien n'est compilé de plus (des uniforms) ; la ville violette garde ses valeurs d'origine.
   `?carte=ville&meteo=brouillard&teinte=vert` · `dbgClassique('ville','pluie','jaune')` puis dbgSaut() · `dbgTeinte()` (ce qui est posé). */
const VTEINTES={violet:null, // a : où va le VIOLET (262°) de l'air · b : où va le MAGENTA (330°) des néons · s, v : saturation et éclat de la bande · sA, vA : ceux de l'AIR seul (le côté violet)
  vert:{a:178,b:128,s:1,v:1,sA:.82,vA:.86,     // l'air sarcelle profond, les néons vert acide — vu au banc : à 166° et pleine saturation, un ciel vert « toxique » ; plus froid et plus sourd, le néon ressort
    fd:[[.04,.10,.16],[.08,.20,.26],[.16,.40,.34],[.24,.58,.36],[.36,.68,.32],[.46,.72,.32],[.10,.24,.22],[.03,.07,.09]]}, // le ciel SEC (la nuit) : bleu-sarcelle en haut, la lueur verte de la ville à l'horizon
  jaune:{a:30,b:50,s:1,v:1.08,sA:.42,vA:.72,   // l'air brun de sodium, SOMBRE, les néons or-jaune — vu au banc : l'air ambre plein faisait un ciel orange brûlé qui noyait le néon jaune
    fd:[[.08,.07,.09],[.17,.13,.12],[.36,.25,.14],[.60,.46,.17],[.68,.58,.20],[.74,.70,.28],[.26,.19,.12],[.05,.045,.05]],vc:{5:[1,.56,.22]},bio:{skyMul:[.56,.54,.40]}}, // presque noir en haut, l'OR à l'horizon — skyMul chaud : le bleuté de la ville (.42,.5,.64) rendait le jaune OLIVE ; vert ≥ .85 × rouge à l'horizon, sinon l'étalonnage (sat 1,38) le pousse au ROUGE de couchant (vu au banc)
  bleu:{a:230,b:218,s:1.05,v:1,                // l'air bleu nuit, les néons bleu électrique
    fd:[[.03,.06,.24],[.07,.14,.42],[.14,.28,.62],[.20,.42,.84],[.30,.58,.92],[.46,.74,.96],[.10,.16,.36],[.03,.05,.13]]}}; // bleu marine en haut, le bleu électrique à l'horizon
/* fd : les huit teintes du dégradé du ciel SEC (cielFond : zénith, violet, mauve, rose, corail, ambre, prune, fond), DESSINÉES pour la teinte — le remappage ne
   touchait que la bande violet → rose : le corail et l'ambre de l'horizon restaient, et un jaune sombre est OLIVE. `bio` : ce que l'ambiance teintée prend en plus. `vc` : une couleur fixe du ciel de la ville DITE (par son rang dans VT_VC0) au lieu de remappée — le cyan de la guirlande (5), mêlé au jaune, verdissait l'horizon (vu au banc) : il passe à l'orange. */
function vtCur(){const c=typeof LVL!=='undefined'&&LVL.cur;return (c&&c.id==='ville'&&c.teinte&&VTEINTES[c.teinte])||null;} // la teinte de la ville courante (null : violette, ou pas en ville)
function vtRgb(r,g,b,T,o){ // (r,g,b) remappé par la teinte T → o[0..2] (au-dessus de 1 ça tient : V = le max) ; T nul ou hors de la bande : la couleur telle quelle
  o=o||[0,0,0];const mx=Math.max(r,g,b),d=mx-Math.min(r,g,b);
  if(!T||mx<=0||d<=1e-6){o[0]=r;o[1]=g;o[2]=b;return o;}
  const h=((mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360,s=d/mx;
  const w=(h<236||h>348?0:h<250?(h-236)/14:h>342?(348-h)/6:1)*Math.min(1,s/.12); // la bande violet → rose, fondue aux bords (au-delà de 348° : le ROUGE des balises reste rouge) ; les gris restent gris
  if(w<=0){o[0]=r;o[1]=g;o[2]=b;return o;}
  const t=Math.min(1,Math.max(0,(h-262)/68)),dh=((T.a+(T.b-T.a)*t-h+540)%360)-180; // violet → a, magenta → b, par le plus court chemin
  const wA=w*(1-t),h2=(h+dh*w+360)%360,s2=Math.min(1,s*(1+(T.s-1)*w)*(1+((T.sA||1)-1)*wA)),v2=mx*(1+(T.v-1)*w)*(1+((T.vA||1)-1)*wA), /* wA : le côté VIOLET de la bande (l'air) — sA, vA le retiennent */ c=v2*s2,x=c*(1-Math.abs((h2/60)%2-1)),m=v2-c,k=Math.min(5,(h2/60)|0);
  o[0]=(k===0||k===5?c:k===1||k===4?x:0)+m;o[1]=(k===1||k===2?c:k===0||k===3?x:0)+m;o[2]=(k===3||k===4?c:k===2||k===5?x:0)+m;return o;}
function vtCol(col,T){if(T){const o=vtRgb(col.r,col.g,col.b,T);col.setRGB(o[0],o[1],o[2]);}return col;} // une THREE.Color, en place
function vtHex(s,T){if(!T||typeof s!=='string'||s[0]!=='#')return s;const n=parseInt(s.slice(1),16),o=vtRgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255,T);
  return '#'+o.map(function(v){return ('0'+Math.round(Math.min(1,Math.max(0,v))*255).toString(16)).slice(-2);}).join('');}
const VT_COLS=['fog','fogIn','fogCj','hemiS','hemiG','sunC','fillC','kickC','volSun','volSky','volGnd','vigC','skyMul','skyLift','sunTint','jZen','jMid','jHor','jSol'];
function vtBio(n,te){ // le nom de l'ambiance `n` dans la teinte `te` — créée à son premier emploi, d'après l'ambiance FINIE (toutes les passes d'étalonnage faites)
  if(n==='villeBrume'&&!BIOMES.villeBrume&&BIOMES.nuitNoire) // LE BROUILLARD : la nuit sèche de la ville au néon, noyée — ni étoiles ni lune, la brume se referme à ~1 km et s'éclaire (la ville la porte)
    BIOMES.villeBrume=Object.assign(JSON.parse(JSON.stringify(BIOMES.nuitNoire)),{nm:'VILLE · BROUILLARD',stars:0,moon:0,fog:[.30,.19,.40],fogN:30,fogF:950,fogIn:[.86,.74,.86],expo:.82,city:1.3,vigK:.7}); // (vu au banc : à 60/1100 m les tours proches restaient nettes — un plafond bas plus qu'un brouillard ; la brume plus CLAIRE que les tours : de nuit, c'est ce qui la fait lire)
  const T=VTEINTES[te];if(!T||!BIOMES[n])return n;const k=n+'_'+te;
  if(!BIOMES[k]){const o=JSON.parse(JSON.stringify(BIOMES[n]));o.nm=(o.nm||n)+' · '+te.toUpperCase();
    for(const f of VT_COLS)if(Array.isArray(o[f])&&o[f].length===3)vtRgb(o[f][0],o[f][1],o[f][2],T,o[f]);
    if(Array.isArray(o.env))for(const e of o.env)e[1]=vtHex(e[1],T);
    for(const f of ['eS1','eS2'])if(Array.isArray(o[f])){const a=vtRgb(o[f][0]/255,o[f][1]/255,o[f][2]/255,T);for(let i=0;i<3;i++)o[f][i]=Math.round(Math.min(1,a[i])*255);}
    if(T.bio)Object.assign(o,JSON.parse(JSON.stringify(T.bio)));
    BIOMES[k]=o;}
  return k;}
const VTF={de:null,a:null}; // le fondu des couleurs fixes au portail : d'où (de) vers où (a) — 8 du dégradé (uFd), 6 du ciel de la ville (uVc), le pied des tours, le magenta des flaques
function vtUni(i){return i<8?skyU.uFd.value[i]:i<14?skyU.uVc.value[i-8]:i<15?CITY.uPiedC.value:ROAD_U.uBmM.value;} // + le magenta des flaques (ROAD_U.uBmM)
function vtGo(){const T=vtCur(),src=VT_FD0.concat(VT_VC0,[[.16,.04,.2],[1,.28,.66]]);VTF.de=[];VTF.a=[];
  for(let i=0;i<src.length;i++){const u=vtUni(i);VTF.de.push([u.x,u.y,u.z]);VTF.a.push(T&&T.fd&&i<8?T.fd[i].slice():T&&T.vc&&T.vc[i-8]?T.vc[i-8].slice():vtRgb(src[i][0],src[i][1],src[i][2],T));}}
function vtPose(e){if(!VTF.a)return;for(let i=0;i<VTF.a.length;i++){const a=VTF.a[i],d=VTF.de[i];vtUni(i).set(d[0]+(a[0]-d[0])*e,d[1]+(a[1]-d[1])*e,d[2]+(a[2]-d[2])*e);}if(e>=1)VTF.a=null;}
window.dbgTeinte=function(){const c=typeof LVL!=='undefined'&&LVL.cur;return {teinte:c&&c.teinte||null,ciel:BIO.name,fd:skyU.uFd.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(3);});}),
  vc:skyU.uVc.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(3);});}),pied:CITY.uPiedC.value.toArray().map(function(x){return +x.toFixed(3);}),brume:+((typeof LVL!=='undefined'&&LVL.brume)||0).toFixed(2),
  brumeCiel:+skyU.uPluie.value.toFixed(2),ville:+skyU.uVille.value.toFixed(2),fog:scene.fog?scene.fog.color.toArray().map(function(x){return +x.toFixed(3);}):null,fogNF:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far)]:null,mode:typeof CIEL2!=='undefined'?CIEL2.mode:null};};
/* (2026-10-14, LA BIBLE CAR CASH — passation/DA-CARCASH.md, validée par Sacha) LA SIGNATURE DE ROUTE : bords néon ROSE + nappe + ligne centrale OR, sur
   chaque map passée à la bible (une map à la fois). routeSig() dit si la map courante la porte. La ville au néon (villeRose) garde
   sa peinture caméléon d'origine ; les autres reçoivent le rose de la marque, plein la nuit et sous la pluie, ~70 % de jour (jamais blanc ni éteint). */
/* LA CONTINUITÉ DES MAPS (2026-10-17, Sacha : « grosse session d'amélioration des maps : mets-toi dans la peau d'un game designer senior, regarde
   toutes les maps comme un tout ; il faut une vraie continuité dans les maps, tant dans la colorimétrie que dans les textures — pour l'instant les
   seules maps à ne pas toucher sont les montagnes chinoises (jade) et la ville » · « c'est surtout l'éclairage de NUIT que tu arrives mal à faire » ·
   « des couleurs vives et pop mais pas trop : la journée dans les nuages est trop saturée ; un vrai équilibre ») — six maps : NUAGES, CANYON, FORÊT,
   GLACIER, VOLCAN, ORBITE. Le détail (la recette commune par temps, la route commune, la nuit) est dans `CONTI` (après l'étalonnage) et au JOURNAL.
   `contiMap()` : la map courante est l'une des six (JAMAIS la ville ni le jade). */
function contiMap(){const c=typeof LVL!=='undefined'&&LVL.cur;return !!c&&(c.id==='nuages'||c.id==='canyon'||c.id==='foret'||c.id==='banquise'||c.id==='volcan'||c.id==='espace'||c.id==='grotte'||c.id==='dunes');} /* (2026-10-18) + LES PROFONDEURS : la grotte suit la recette commune (grtConti) */
function routeSig(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!c||!c.bio)return false;
  return c.id==='nuages'||c.id==='banquise'||c.id==='volcan'||c.id==='canyon'||c.id==='dunes'||c.id==='espace'||c.id==='foret'||c.id==='jade'||!!c.vitre;} /* (continuité) la signature rose + or sur TOUTES les météos des nuages · (2026-10-17) la VILLE VITRÉE la porte aussi */
const BORDS={jour:new THREE.Color(0xc9c3b6),nuit:new THREE.Color(0xe8e4da),kJ:1,kNuit:.62,glowN:.4,jf:1}; // kNuit .62 = le « rail blanc doux » (le rail est opaque : on baisse sa couleur ; .5 sortait un peu mince au banc, le bord du vide doit rester lisible) · glowN .4 = la nappe ambre garde 40 % de son opacité la nuit
const LIGNE_OPJ=.55; // l'opacité de la ligne centrale aux PICS DE JADE (blanc cassé sur béton clair : un peu plus franche)
const _c9=new THREE.Color(),_d9=new THREE.Color();
/* (2026-10-17, Léo : « je voudrais que les maps aient les côtés lumineux de la route en fonction de la map, les couleurs, et qu'ils évoluent en
   fonction de comment la personne booste ») LES BORDS DE LA MAP. Chaque map du JOUER a SA couleur de bord (`BMAP_PAL`) — les rails, leur nappe
   de lueur et le liseré des flancs (ROAD_U.uAcc) la prennent : ~70 % de jour, pleine la nuit et sous la pluie (la règle de la bible, qui mettait le
   ROSE partout). La MER DE NUAGES garde le rose de la marque (son orage le retrouve : il avait perdu la signature) ; la VILLE au néon garde ses
   teintes et son caméléon (elle n'est pas dans la palette). La NAPPE porte une couleur de sommet NEUTRE (sa force, ka9) et sa MATIÈRE la teinte
   (accC, posée par buildTrack) : à l'image près la même chose pour les maps hors palette.
   (2026-10-18, Léo : « quand on booste, les côtés scintillent un peu en mode RGB, mais chaque niveau a sa couleur de base ») LE BOOST RGB : au boost,
   les bords quittent leur couleur pour un ARC-EN-CIEL qui court le long de la route (tout le spectre en ~60 m, `aS` = l'abscisse de la piste) et
   SCINTILLE (chaque tronçon de ~2,5 m tire son éclat 16 fois par seconde, un sur sept éclate en blanc) ; ils s'allument un peu plus fort (la lueur prend) ; lâché, la
   couleur de la map revient en ~0,3 s. C'est le trait des bords (`traitMat`, rails et nappe : leurs programmes à eux seuls) qui le peint, mené par
   trois uniformes (`BMAP_U`) : aucun programme de plus (mesuré : dbgProgs). `?bordsboost=0` = pas d'effet au boost. `dbgBordsMap()` (ce qui est posé),
   `dbgBordsMap('canyon',0x22e0c2)` (essayer une couleur), `dbgBordsMap('rgb',1)` (l'arc-en-ciel sans boost, pour les photos).
   (2026-10-18, Sacha : « change le RGB que Léo a mis sur le bord de la route pour qu'il soit de la même couleur que la traînée choisie par le joueur »)
   LA COULEUR DE LA TRAÎNÉE : au boost, les bords prennent la couleur de la traînée que porte la caisse (`bmapTrainee` : celle de la boutique, sinon la
   signature de la caisse, sinon l'orange du nitro) au lieu de l'arc-en-ciel ; le SCINTILLEMENT et les éclats blancs restent. La traînée ARC-EN-CIEL
   (et le chat) garde l'arc-en-ciel. `?bordsboost=rgb` = l'arc-en-ciel pour toutes (la version de Léo). Deux uniformes de plus, aucun programme de plus.
   (2026-10-18, Sacha : « il faut aussi que les côtés de la route clignotent, mais surtout le même jeu de lumière que la traînée : si la traînée a 70 % de
   pixels roses et 30 % de blancs, il faut le même jeu de clignotement ») LE JEU DE LUMIÈRE DE LA TRAÎNÉE : chaque tronçon de 2 m du bord devient un PIXEL
   du feu de la traînée — il change ~8 fois par seconde, chacun à son temps, et tire à chaque fois une des 10 nuances du feu (`NFEU.pal` : cœur blanc,
   couleur pleine, braise, fumée) dans la part qu'elle a DANS LE FEU à cet instant (`NFEU.part`, mesurée par nfeuPas sur la surface des cubes, lissée
   ~0,12 s), avec l'éclat ± 8 % de chaque cube. En réserve bleue et en nitro infinie, le feu change de palette : les bords aussi. `dbgBordsMap()`
   donne la palette et les parts (`trainee`). Uniformes : `uPal` (10 couleurs), `uCum` (parts cumulées) — toujours aucun programme de plus. */
const BMAP_PAL={nuages:0xf24aa0,jade:0x2ee8a6,foret:0xc8f03c,banquise:0x52d8ff,volcan:0xffe03a,crypto:0xffc23a,espace:0x8c6bff,canyon:0x22e0c2,vitree:0x2f8cff,grotte:0x3ef0ff,dunes:0x1fd6ff}; // (2026-10-18) LES PROFONDEURS : les bords au bleu DIAMANT
const BMAP_B=!/[?&]bordsboost=0\b/.test(location.search);
const BMAP_ARC=/[?&]bordsboost=rgb\b/.test(location.search); // ?bordsboost=rgb : l'arc-en-ciel de Léo pour toutes les traînées (comparer)
const BMAP_PART0=[.07,.09,.11,.12,.13,.12,.11,.1,.08,.07]; // la part des 10 nuances avant le premier nitro (la durée de chacune dans la vie d'un cube : NFEU_B10) — remplacée par la mesure dès que le feu brûle
const BMAP={c:new THREE.Color(),g:new THREE.Color(),t:0,ph:0,cle:null,i:0,rgb:0,force:null};
function bmapCle(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!c||PARK.on)return null; // la map de la palette (null : la ville au néon, le parc, une map sans couleur)
  const k=c.carte||(c.crypto?'crypto':c.vitre?'vitree':c.id==='orage'?'nuages':c.id);return BMAP_PAL[k]!=null&&c.id!=='paris'?k:null;}
function bmapBoost(){ // L'ÉLAN DU BOOST → BMAP.rgb (part d'arc-en-ciel), BMAP.i (éclat en plus) ; fait défiler et scintiller l'arc-en-ciel (BMAP_U)
  let e=0,ig=0,pad=0,dt=0;
  try{const t=performance.now()*.001;dt=paused?0:Math.min(.1,Math.max(0,t-BMAP.t));BMAP.t=t; // (bordsTick tourne dès buildTrack : NFX et la course peuvent ne pas être nés)
    const vit=running&&!gameOver&&mode!=='boom';e=vit?NFX.len:0;ig=vit?NFX.ign*NFX.ign*NFX.ignK:0;pad=vit&&!nitroOn&&boost>0?1:0;}catch(x){}
  if(!BMAP_B)e=ig=pad=0;if(BMAP.force!=null)e=BMAP.force;
  BMAP.rgb=Math.min(1,.82*e+.3*ig);BMAP.i=.6*e+.15*pad; // NFX.len : il s'ouvre en ~0,1 s, se referme en ~0,3 s — le pad turbo allume un peu, sans arc-en-ciel
  BMAP.ph=(BMAP.ph+dt*(.45+.5*e))%1; // l'arc-en-ciel défile vers l'arrière (il double la vitesse de la caisse)
  BMAP_U.uRgb.value=BMAP.rgb;BMAP_U.uRgbT.value=BMAP.ph;BMAP_U.uRgbK.value=(BMAP.t*16)%997; // l'horloge du scintillement (×16 : l'arc-en-ciel en prend l'entier, les pixels de la traînée la moitié, chacun décalé)
  if(BMAP.rgb>.001)bmapTrainee();}
function bmapTrainee(){ // (2026-10-18, Sacha : « même couleur que la traînée », puis « le même jeu de lumière que la traînée ») → BMAP_U.uPal / uCum / uRgbM
  let F=null,arc=BMAP_ARC,P=null,W=null;
  try{F=FX_EFF||(CARS[level]&&CARS[level].fx)||null;if((NYAN.on&&!FX_EFF)||(F&&F.rainbow))arc=true;}catch(x){} // la traînée ARC-EN-CIEL (ou le chat) : les bords gardent l'arc-en-ciel de Léo
  if(arc){BMAP_U.uRgbM.value=0;return;}
  try{P=NFEU.pal;W=NFEU.part;}catch(x){} // le FEU DE PIXELS de la traînée, tel qu'il brûle : ses 10 nuances (celles de la traînée achetée, sinon l'orange du nitro ; bleuies en réserve, violettes en nitro infinie)…
  if(!P){let T9=null;try{T9=nfeuPalTrainee();}catch(x){}P=T9?T9.pal:NFEU_P10.f;} // (le feu n'a pas encore brûlé : la palette qu'il prendra)
  if(!W)W=BMAP_PART0; // … et la part de chacune, MESURÉE dans le feu à chaque image (nfeuPas : la surface de ses cubes, nuance par nuance)
  let nm=1e-3,s=0;for(let i=2;i<6;i++)nm=Math.max(nm,P[i][0],P[i][1],P[i][2]); // ramenées à la couleur pleine du feu (les nuances 2 à 5) : le cœur chauffé à blanc passe au-dessus (la lueur prend), la braise et la fumée en dessous
  for(let i=0;i<10;i++){const c=P[i];BMAP_U.uPal.value[i].set(Math.min(2.2,c[0]/nm),Math.min(2.2,c[1]/nm),Math.min(2.2,c[2]/nm));s+=W[i];}
  let a=0;for(let i=0;i<10;i++){a+=W[i];BMAP_U.uCum.value[i]=s>0?a/s:(i+1)/10;}BMAP_U.uCum.value[9]=1.01;BMAP_U.uRgbM.value=1;}
function bmapPeint(k){ // remplace la peinture des bords pour une map de la palette (appelée par bordsTick, à chaque image)
  const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf;BMAP.cle=k;bmapBoost();
  let kk=1;if(!contiMap())try{const kv=1-.6*LVL.nuit;if(kv<.999)kk=1/(.07+.93*kv);}catch(e){} // villeApres baissera les rails ×kr et la nappe ×kr² (les PICS DE JADE et CRYPTO CITY ne sont pas des six maps) : on l'annule d'avance — pleins la nuit
  BMAP.c.setHex(BMAP_PAL[k]);ROAD_U.uAcc.value.copy(BMAP.c); // le liseré des flancs et le reflet des flaques parlent la même couleur
  const dj=.7+.3*(1-jf),I=BMAP.i; // de jour à 70 % ; le boost rallume jusqu'au plein (et au-delà : la lueur — bloom — prend au-dessus de ~0,92)
  _c9.copy(BMAP.c).multiplyScalar(Math.min(1.9,dj+(1-dj)*Math.min(1,I)+.55*I)*kk);
  for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
  BMAP.g.copy(BMAP.c).multiplyScalar(1+1.6*I); // la nappe (additive) : sa couleur monte avec le boost, son opacité suit le jour
  const og=Math.min(1,.78*(.55+.45*(1-jf))+.22*Math.min(1,I))*kk*kk;if(og>1)BMAP.g.multiplyScalar(og); // (au-delà d'une opacité pleine, c'est la couleur qui porte le reste : la nappe additive reste pleine la nuit sous villeApres)
  for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i];if(m.userData.base!=null){m.color.copy(BMAP.g);m.opacity=Math.min(1,og);}}}
window.dbgBordsMap=function(k,hex){if(k==='rgb'){BMAP.force=hex==null?null:+hex;}else if(k&&hex!=null){BMAP_PAL[k]=hex;}if(k){bordsTick();try{villeApres();}catch(e){}if(paused&&POST_ON&&composer)composer.render();}
  return {boost:BMAP_B,cle:BMAP.cle,pal:Object.keys(BMAP_PAL).map(function(n){return n+' #'+('00000'+BMAP_PAL[n].toString(16)).slice(-6);}),
  rgb:+BMAP.rgb.toFixed(2),i:+BMAP.i.toFixed(2),force:BMAP.force,u:[+BMAP_U.uRgb.value.toFixed(2),+BMAP_U.uRgbT.value.toFixed(2),BMAP_U.uRgbK.value],trainee:BMAP_U.uRgbM.value?BMAP_U.uPal.value.map(function(v,i){return '#'+new THREE.Color(Math.min(1,v.x),Math.min(1,v.y),Math.min(1,v.z)).getHexString()+' '+Math.round(100*(BMAP_U.uCum.value[i]-(i?BMAP_U.uCum.value[i-1]:0)))+'%';}):'arc-en-ciel',rail:NEON_RAILS[0]?NEON_RAILS[0].color.toArray().map(function(x){return +x.toFixed(3);}):null,
  nappe:NEON_GLOW[0]?NEON_GLOW[0].color.toArray().map(function(x){return +x.toFixed(3);}).concat([+NEON_GLOW[0].opacity.toFixed(3)]):null};};
function bordsTick(){ // appelée par musicTick, APRÈS la peinture « caméléon » des rails et de la nappe
  skyU.uRose.value=villeRose()?1:0; // (plafrose, Sacha : « la ville la nuit = ROSE ») le plafond de la pluie et de l'orage retrouve sa lueur LILAS et son éclair violet en ville au néon
  BMAP_U.uRgb.value=0; // (2026-10-18, boost RGB) l'arc-en-ciel n'est posé que par bmapPeint (maps de la palette)
  if(villeRose())return; // (villerose) la ville au néon garde ses rails et sa nappe ROSES (la peinture caméléon d'avant)
  {const k9=bmapCle();if(k9){bmapPeint(k9);return;}} // (2026-10-17, Léo) LES BORDS DE LA MAP : la couleur de la map, et le boost (voir BMAP)
  if(routeSig()){const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf;_c9.setHex(LVL.cur&&LVL.cur.vitre?0x2f8cff:0xf24aa0) /* (2026-10-17, Léo) la VILLE VITRÉE : les bords de la route en BLEU */.multiplyScalar(.7+.3*(1-jf)); // (bible) la SIGNATURE : rails roses (70 % de jour, plein la nuit), nappe à 55 % de jour
    for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
    for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i],b=m.userData.base;if(b!=null)m.opacity=Math.min(1,b*(.55+.45*(1-jf)));}return;}
  const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf; // 1 = plein jour sec ; 0 = nuit / pluie / orage (fondus par lvlStep au portail)
  _c9.copy(BORDS.nuit).multiplyScalar(BORDS.kNuit);_d9.copy(BORDS.jour).multiplyScalar(BORDS.kJ);_c9.lerp(_d9,jf);
  let kk=1,kg=BORDS.glowN*(1-jf);
  if(!contiMap())try{const nu=LVL.nuit,k=1-.6*nu;if(k<.999){kk=1/(.07+.93*k);kg*=kk*kk;}}catch(e){} // (continuité : villeApres ne baisse plus les néons des six maps) villeApres multipliera la couleur par kr et l'opacité par kr² : on l'annule d'avance
  _c9.multiplyScalar(kk);
  for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
  for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i],b=m.userData.base;if(b!=null)m.opacity=Math.min(1,b*kg);}
}
window.dbgBords=function(o){if(o){for(const k in o){if(k==='jour'||k==='nuit')BORDS[k].setRGB(o[k][0],o[k][1],o[k][2]);else BORDS[k]=o[k];}bordsTick();if(paused&&POST_ON&&composer)composer.render();}return {jf:BORDS.jf,kJ:BORDS.kJ,kNuit:BORDS.kNuit,glowN:BORDS.glowN,fog:FOG_BASE.toArray(),fogS:scene.fog.color.toArray(),hemi:hemi.intensity,sun:sun.intensity,nuit:LVL.nuit,pluie:LVL.pluie,bio:BIO.name,acc:ROAD_U.uAcc.value.toArray(),rail:NEON_RAILS[0]?NEON_RAILS[0].color.toArray():null,glow:NEON_GLOW[0]?NEON_GLOW[0].opacity:null};}; // banc
let LIGNE_TEX=null;
/* (2026-10-07) LES TIRETS FILENT : la ligne centrale a un tiret tous les ~31 m. À 30 images par seconde (l'iPhone bride), passé ~1 100 km/h
   la caisse avance d'un tiers de période par image et les tirets se mettent à BÉGAYER (ils semblent ralentir, puis sauter — l'effet de la
   roue de charrette) : la sensation de vitesse s'effondre pile quand elle devrait exploser. Le tiret s'étire désormais de ce que la route
   parcourt pendant UNE image (`LIGNE_U.uFile`, en part de période, écrite par la boucle : vitesse × durée de l'image ÷ période, plafond .42) :
   quatre lectures de la carte le long de la route. Lent → rien ne change ; vite → des traits qui filent, comme sur une photo à la pose. */
const LIGNE_U={uFile:{value:0}},LIGNE_PER={v:30};
function ligneMat(){ // la peinture de la ligne centrale : tirets dans une texture mipmappée (voir buildTrack) — texture unique, matériau par piste
  if(!LIGNE_TEX){const cv=document.createElement('canvas');cv.width=4;cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#fff';c.fillRect(0,1,4,27);c.globalAlpha=.5;c.fillRect(0,0,4,1);c.fillRect(0,28,4,1); // 7/16 de tiret, bouts adoucis d'un texel
    LIGNE_TEX=new THREE.CanvasTexture(cv);LIGNE_TEX.wrapT=THREE.RepeatWrapping;
    LIGNE_TEX.anisotropy=Math.min(IS_MOBILE?4:8,renderer.capabilities.getMaxAnisotropy());} // vue RASANTE : sans anisotropie, la carte réduite gommerait les tirets dès 30 m
  // (2026-09-26, vague 2) la peinture passe du SODIUM doré (0xffc978) au BLANC lavande : sous le grade, les tirets se lisaient ORANGE,
  // une rangée de fausses pièces au milieu de la route. L'or ne sert qu'à ce qui rapporte ; la peinture n'est que de la peinture.
  const m9=traitMat(new THREE.MeshBasicMaterial({map:LIGNE_TEX,color:routeSig()?0xffd75e:0xf2eee6,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),1.2,2);
  const ob9=m9.onBeforeCompile;m9.onBeforeCompile=function(sh){ob9(sh);sh.uniforms.uFile9=LIGNE_U.uFile;
    sh.fragmentShader='uniform float uFile9;\n'+sh.fragmentShader.replace('#include <map_fragment>',
      '{vec4 texelColor=(texture2D(map,vUv+vec2(0.,uFile9*.375))+texture2D(map,vUv+vec2(0.,uFile9*.125))+texture2D(map,vUv-vec2(0.,uFile9*.125))+texture2D(map,vUv-vec2(0.,uFile9*.375)))*.25;'+
      'texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;}');};
  m9.customProgramCacheKey=function(){return 'ligneFile';}; /* (sa propre clé : le trait de même réglage n'a pas le filé) */
  return m9;
}
/* LES TRANCHES S'ALLUMENT (2026-09-26) — la dalle fait 2,6 m d'épaisseur, et ses flancs n'étaient qu'un bandeau violet-noir : vu d'avion
   (vol libre, plongeons, les étages de la spirale de la VILLE), le ruban se perdait dans la nuit des tours. Chaque flanc porte désormais
   un LISERÉ à l'accent de la zone à mi-hauteur, ponctué de CATADIOPTRES tous les 6 m (des tirets, pas des ronds) : on lit la route
   comme une structure, de loin et d'en dessous. Anticrénelé, et fondu en lueur moyenne quand il passe sous le pixel. Aucun sommet de
   plus (la géométrie reçoit seulement ses UV) ; la teinte est `ROAD_U.uAcc`, posée par buildTrack. */
function trancheMat(){
  const m=new THREE.MeshLambertMaterial({color:0x3a3833,side:THREE.DoubleSide});m.extensions={derivatives:true}; /* (2026-10-14, bords-route) le flanc en BÉTON sombre #3A3833 (c'était l'encre violette) ; liseré plus discret, catadioptres ambre (uAcc) */ // (vague 2) le flanc à l'ENCRE de la bible #1c0430 (c'était un gris-violet neutre 0x14101f)
  m.onBeforeCompile=function(sh){sh.uniforms.uAcc9=ROAD_U.uAcc;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vTr9;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTr9=uv;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uAcc9;varying vec2 vTr9;').replace('#include <fog_fragment>',
      '{float fy=max(fwidth(vTr9.y),1e-4),fx=max(fwidth(vTr9.x),1e-4);'+
      'float bd=1.-smoothstep(.025,.025+fx*1.5,abs(vTr9.x-.5));'+                                       // le liseré (13 cm sur 2,6 m)
      'float ce=(1.-smoothstep(.13,.13+fy/6.*1.5,abs(fract(vTr9.y/6.)-.5)))*step(abs(vTr9.x-.5),.09);'+ // les catadioptres : 1,5 m tous les 6 m
      'float lo=smoothstep(.5,1.6,fy);'+                                                                // un pixel couvre plus d un demi-mètre de route : la lueur moyenne
      'gl_FragColor.rgb+=uAcc9*(mix('+('bd*.30+ce*1.')+',.09,lo))*(1.-smoothstep(.08,.3,fx));}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'trancheV3';};
  return m;
}
const ROUTE_JOUR=[1.10,1.07,1.0]; /* (2026-10-14, passe graphismes) LE BÉTON : la base est déjà un gris neutre — le jour d'altitude le réchauffe et le relève un peu (vu au banc : le midi le tirait vers un gris-bleu sombre) ; il reste bien sous les nuages (c'était [.86,.94,.86], qui dé-violettait l'indigo) */ /* (niveau 1 v2) [1,1.12,.88] → plus SOMBRE : au banc le bitume du midi sortait gris clair (L* ~55), au niveau des nuages — la route doit être le ruban le plus sombre de l'image pour que la caisse orange et le ciel clair se lisent contre elle (L10 26 → 10) */ // (2026-09-30) la teinte du bitume au jour d'altitude (× la base violette 0x322e40 → un anthracite à peine bleuté)
const GLACE={k:1,nuages:.45,espace:.5,jade:.55,crypto:.5}; // (v11) l'émeraude est polie comme une pierre taillée — (v12) « beaucoup plus brillante » : .5 → .8 // (v9) le jade est POLI : il renvoie le ciel en rasant
const ROUTE_JADE=[1,1,.96]; /* (2026-10-14, passe graphismes) béton : un rien plus chaud aux PICS DE JADE (c'était [.95,1.04,.86] × la base violette) */ // (2026-10-09) LES PICS DE JADE : le bitume en gris de pierre (× la base violette) // (passe graphismes mobile) la part du ciel dans le bitume sec, par niveau (la VILLE a son eau) — `dbgGfx({glace:0})` = l'ancien bitume
const _px9=new THREE.Vector2();
/* LE BÉTON DE JOUR (2026-10-15 soir, Sacha : « les couleurs en plein jour sont mal gérées ») — MESURÉ sur les photos de course : en plein jour le
   béton sortait BLEU-VIOLET — nuages midi #5b5fb4 (saturation .37), matin #6d5eb1, forêt midi #516ad5 (.61), canyon midi #9f9cf4 (.80) — et non gris.
   La cause : la passe « vives » du même jour (Sacha : « les maps sont trop ternes, sature un peu plus ») a teinté le béton lui-même en ardoise bleue
   (BETON.t .86/.93/1.2), lui a fait prendre 40 % de la couleur de l'air (BETON.amb .22 → .4), puis l'étalonnage sature ×1,18 de plus. De JOUR,
   le béton revient vers une ardoise NEUTRE (ROUTE_JOUR_T) et ne prend plus que 15 % de l'air ; la nuit garde la passe « vives » telle quelle (et
   l'orbite, et les routes de jade). ROUTE_NEUTRE = la part (0,85). `?beton=bleu` = avant. */
const ROUTE_NEUTRE=/[?&]beton=bleu\b/.test(location.search)?0:.85,ROUTE_JOUR_T=[.95,1,.99],ROUTE_T9=[1,1,1];
/* LE CIEL DE JOUR SANS BLEU ÉLECTRIQUE (même demande) — MESURÉ : le zénith de midi sortait SATURÉ À BLOC, le rouge à ZÉRO — forêt #0058fd, canyon
   #0044f8 (saturation 1,00) : la passe « vives » (×1,18 sur chaque ambiance) poussait le bleu du ciel hors de l'écran. Le ciel de JOUR garde
   sa teinte mais sa chroma est ramenée (`cielSat` à la fin des programmes du ciel : plein, passe lisse, canyon) ; la nuit, l'orbite et le ciel de
   jade ne bougent pas. `?ciel=vif` = avant. */
const CIEL_DESAT=/[?&]ciel=vif\b/.test(location.search)?0:.5;
function routeTick(){ // le bitume suit le NIVEAU (fondu du portail : LVL.route / LVL.sheen, voir lvlStep)
  renderer.getDrawingBufferSize(_px9);TRAIT_U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,_px9.y); // la taille d'un pixel à 1 m (suit le FOV de vol et la résolution adaptative)
  const r=LVL.route,pa9=LVL.paris||0;ROAD_U.uLift.value.setRGB(.010+.15*r+(.004-.006*r)*pa9,.009+.13*r+(.005+.012*r)*pa9,.016+.16*r-(.004+.03*r)*pa9); // (Paris) un gris d'asphalte NEUTRE, pas le violet de la nuit // ⚠ l'étalonnage de la pluie écrase le rouge et le vert : la clarté doit être NEUTRE et franche pour se lire (mesuré : (0,0,17) → (2,0,47) avec une clarté bleutée de .05)
  ROAD_U.uSheen.value=LVL.sheen;ROAD_U.uWet.value=Math.max(LVL.pluie,parisPluie()*1.8);ROAD_U.uVil.value=LVL.ville;try{ROAD_U.uEcl.value=CAMP_FLASH;}catch(e){} /* (2026-09-30) les enseignes reflétées : en VILLE seulement · l'éclair dans les flaques (CAMP_FLASH est déclaré plus bas : le try couvre l'init) */ // (2026-09-26) le bitume se mouille avec la pluie du niveau, au même fondu
  ROAD_U.uGlace.value=GLACE.k*(GLACE.nuages*LVL.mer+GLACE.espace*LVL.espace+GLACE.jade*(LVL.jade||0)+GLACE.crypto*(LVL.crypto||0))*(1-LVL.pluie);
  {const j9=Math.max(LVL.mer,LVL.crypto||0)*skyU.uJour.value,jd9=LVL.jade||0;ROAD_U.uTeinte.value.setRGB((1+(ROUTE_JOUR[0]-1)*j9)*(1+(ROUTE_JADE[0]-1)*jd9),(1+(ROUTE_JOUR[1]-1)*j9)*(1+(ROUTE_JADE[1]-1)*jd9),(1+(ROUTE_JOUR[2]-1)*j9)*(1+(ROUTE_JADE[2]-1)*jd9));} // (2026-09-30) LE JOUR D'ALTITUDE : l'asphalte des NUAGES en gris d'anthracite (le violet de la nuit, sous un ciel turquoise, se lisait en encre violette) // (passe graphismes mobile) le bitume GLACÉ des routes sèches — voir roadMat
  ROAD_U.uSheenCol.value.copy(scene.fog.color).multiplyScalar(.9); // (2026-09-26) ×1,5 → ×0,9 : la brillance rasante blanchissait tout le lointain
  {let rk9=1;try{rk9=BIO.cur.rtK;if(rk9==null)rk9=1;}catch(e9){} /* (2026-10-14, passe graphismes · contrôle) CLARTÉ DU BÉTON PAR AMBIANCE : `rtK` (1 par défaut, voir BIO_ETAL0) multiplie la clarté de niveau ET la teinte — le béton de jour était à L* 50-60 (cible 32-45) */ const jr9=ROUTE_NEUTRE*(1-Math.min(1,LVL.nuit||0))*(1-Math.min(1,LVL.espace||0))*(1-Math.min(1,LVL.jade||0)); /* (2026-10-15 soir) LE BÉTON DE JOUR (voir ROUTE_NEUTRE) */
   for(let c9=0;c9<3;c9++)ROUTE_T9[c9]=BETON.t[c9]+(ROUTE_JOUR_T[c9]-BETON.t[c9])*jr9;
   skyU.uCiel2.value=contiMap()?1:0; // (continuité) le ciel continu sur les six maps
   skyU.uSkySat.value=1-CIEL_DESAT*(contiMap()?.55:1)*(1-Math.min(1,LVL.nuit||0))*(1-Math.min(1,LVL.espace||0))*(1-Math.min(1,LVL.jade||0)); /* (2026-10-15 soir) LE CIEL DE JOUR SANS BLEU ÉLECTRIQUE (voir CIEL_DESAT) */
   const cm9=contiMap(),rA9=cm9&&BIO.cur.rtA!=null?BIO.cur.rtA:1, // (continuité) `rtA` : la part de l'air du lieu dans la clarté du béton (× ; la nuit, la brume violette teignait toute la route)
    b=BETON,f=scene.fog.color,fm=Math.max(f.r,f.g,f.b,.02),k=(b.lift0+b.lift*LVL.route)*rk9,a9=(b.amb+(.15-b.amb)*jr9)*rA9,w9=Math.min(1,ROAD_U.uWet.value), // (2026-10-14, passe graphismes) LE BÉTON BRUT — tout est valeur d'uniforme, rien de plus pour la puce :
    m9=ROUTE_T9,e9=rk9*(1+(b.ville-1)*LVL.ville)*(1+(b.espace-1)*LVL.espace)*(1-b.mouille*w9);
   ROAD_U.uLift.value.setRGB(k*(1-a9+a9*f.r/fm),k*(1-a9+a9*f.g/fm),k*(1-a9+a9*f.b/fm)); // la clarté de niveau en gris MINÉRAL (plus de violet), à peine teintée par l'air du lieu
   ROAD_U.uTeinte.value.r*=m9[0]*e9;ROAD_U.uTeinte.value.g*=m9[1]*e9;ROAD_U.uTeinte.value.b*=m9[2]*e9; // le béton mouillé FONCE (la pluie), chaque monde sa teinte
   if(cm9&&BIO.cur.rtT){const t9=BIO.cur.rtT;ROAD_U.uTeinte.value.r*=t9[0];ROAD_U.uTeinte.value.g*=t9[1];ROAD_U.uTeinte.value.b*=t9[2];} // (continuité) LE BITUME COMMUN : `rtT` corrige la teinte du béton par temps (voir CONTI) — le ciel bleu ×1,5 de saturation le peignait en pervenche
   ROAD_U.uSheen.value*=Math.min(1,w9+b.sheen); // MAT à sec : la brillance d'horizon ne vit que sous la pluie
   ROAD_U.uGlace.value=0;} // … et plus de « bitume glacé » : le béton sec ne renvoie pas le ciel
}
window.dbgBeton=function(o){if(o){for(const k in o){if(k==='col'){BETON.col=o.col;for(const m of trackMeshes)if(m.isMesh&&m.material&&m.material.userData&&m.material.userData.bitume)m.material.color.setHex(o.col);}else if(k==='jour'||k==='jade'){const A=k==='jour'?ROUTE_JOUR:ROUTE_JADE;A[0]=o[k][0];A[1]=o[k][1];A[2]=o[k][2];}else BETON[k]=o[k];}routeTick();if(paused&&POST_ON&&composer)composer.render();}return {BETON:BETON,jour:ROUTE_JOUR,jade:ROUTE_JADE,lift:ROAD_U.uLift.value.toArray(),teinte:ROAD_U.uTeinte.value.toArray(),sheen:ROAD_U.uSheen.value,glace:ROAD_U.uGlace.value,wet:ROAD_U.uWet.value};}; // banc (2026-10-14, passe graphismes) : le béton retouché à chaud
/* LES MATIÈRES D'UNE PISTE MEURENT APRÈS LA SUIVANTE (2026-09-26, passe perf, lot 4). MESURÉ à chaque portail et à chaque « rejouer » :
   6 shaders RECOMPILÉS (bitume, bandes, nappes…) — 40 à 160 ms d'image figée, pire sur iPhone. Libérer une matière relâche son programme ;
   s'il n'a plus d'autre utilisateur, three le DÉTRUIT, et la piste neuve (mêmes réglages, donc même programme) doit le recompiler. Les
   matières sortantes attendent donc 3 images rendues (`matSursisTick`, après le rendu de la boucle) : la piste neuve a déjà pris les mêmes
   programmes, la libération ne détruit plus rien. Une matière que la piste neuve a REPRISE n'est jamais libérée. */
const MAT_SURSIS=new Set();let matSursisN=0;
/* (2026-10-18, PASSE PERF, Léo : « optimisation des performances ») LE SURSIS NE SUFFIT PAS QUAND LA MAP SUIVANTE A UNE AUTRE ROUTE : le glacier
   (sa piste nue) ne reprend ni le bitume, ni la tranche, ni les rails, ni la ligne — leurs matières partaient, three DÉTRUISAIT leurs 5 programmes,
   et la map d'après (nuages, volcan…) les recompilait EN COURSE (MESURÉ, banc ×4 : 5 programmes à l'entrée de la map qui suit le glacier).
   Comme `CAR_GARDE` pour les caisses : la 1re matière de route vue de chaque programme n'est jamais libérée (`PISTE_GARDE`) — un programme de route
   compilé une fois l'est pour la session. Coût : une poignée de matières gardées (leurs textures sont celles de toutes les routes). */
const PISTE_GARDE=new Map();
function pisteGarde(m){const pp=renderer.properties.get(m).programs;if(!pp)return false;
  let g=false;for(const k of pp.keys())if(!PISTE_GARDE.has(k)){PISTE_GARDE.set(k,m);g=true;}
  return g;}
function matSursisTick(){
  if(!MAT_SURSIS.size||--matSursisN>0)return;
  const vif=new Set();for(const m of trackMeshes)if(m.material)vif.add(m.material);
  for(const m of MAT_SURSIS)if(!vif.has(m)&&!pisteGarde(m))m.dispose();
  MAT_SURSIS.clear();
}
