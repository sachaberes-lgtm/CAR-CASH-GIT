/* ================= LA CONTINUITÉ DES MAPS — LA RECETTE COMMUNE (2026-10-17, voir contiMap près de routeSig) =================
   Regardées ENSEMBLE (le mur des maps, mesuré en Lab sur les photos du répertoire), les six maps hors ville et jade ne parlaient pas la même langue :
   · LA ROUTE, la seule matière commune, était un PERVENCHE saturé partout (chroma 40-95 ; 94 aux nuages de nuit) qui écrasait la couleur propre de
     chaque map — la lave orange, la glace, la forêt — et blanchissait au midi du canyon ;
   · LA SATURATION allait du simple au double : effective = sat × POP 1,18 × DA 1,17 × écran 1,12, soit 1,58-1,82 sur les ciels des nuages, du canyon,
     du volcan (soir des nuages : pointes de chroma à 125) ;
   · LA NUIT était un CIEL NOIR (canyon, forêt, volcan : L* 2-4 au ciel) ou une NAPPE d'un seul bleu (nuages : chroma 86 sur toute l'image), la lune
     n'éclairait rien et les néons de route s'éteignaient (voir villeApres) — quand la ville, la référence, tient un ciel L* 13-27 bien coloré.
   LA RECETTE, pareille pour les six : une SATURATION par temps (matin 1,04 · midi 1,0 · soir 1,08 · nuit 1,0 · pluie ,92 · orage ,96 — avant ×1,31 de la
   chaîne : « vif et pop mais pas trop »), un contraste et une vignette à l'encre bleu nuit, le CONTRE-JOUR ROSE de la bible à toutes les heures (plus fort
   la nuit), et LE BITUME COMMUN : un béton ardoise qui PREND la lumière du lieu au lieu de la peindre en violet (`rtT` : sa teinte, `rtA` : la part de la
   brume dans sa clarté — lus par routeTick, sur les six maps seulement).
   LA NUIT CAR CASH : DEUX TEMPÉRATURES, jamais un ciel noir ni une nappe d'un seul bleu — zénith marine profond, milieu indigo, HORIZON qui brûle de
   l'accent de la map (rose-violet, braise de lave, aurore turquoise), une LUNE argent qui éclaire vraiment (la clé froide), le REMPLISSAGE à l'accent de
   la map (la clé chaude ou colorée), une brume indigo PLUS CLAIRE que les silhouettes (c'est elle qui découpe les plans), les néons de route pleins.
   Ce que chaque map garde : sa géographie, ses matières, son accent (azur, sable, vert, glace, lave, planète). */
const CONTI={
  temps:{
    matin:{sat:1.04,con:1.18,vigK:.26,vigC:[.05,.04,.10],kickC:[1,.40,.66],kickI:.16,rimK:.3,rtT:[1.02,1.0,.92],rtA:.8},
    midi: {sat:1.0, con:1.2, vigK:.22,vigC:[.04,.04,.09],kickC:[1,.42,.68],kickI:.14,rimK:.25,rtT:[1.02,1.0,.92],rtA:.8},
    soir: {sat:1.08,con:1.2, vigK:.3, vigC:[.06,.03,.09],kickC:[1,.36,.64],kickI:.2, rimK:.45,rtT:[1.03,.99,.88],rtA:.8},
    nuit: {sat:1.0, con:1.1, vigK:.5, vigC:[.025,.02,.07],kickC:[1,.30,.68],kickI:.26,rimK:.85,rimS:.55,rtT:[1.08,1.0,.78],rtA:.45,rtK:.75,bloomS:.56,bloomT:.86,stars:1.15}, /* (mesuré : la route de nuit sortait à L* 35-38, chroma 44 — lavande sous la lune ; la ville tient L* 13-18) */
    pluie:{sat:.92,con:1.14,vigK:.32,vigC:[.04,.04,.08],kickC:[1,.38,.66],kickI:.18,rimK:.45,rtT:[1.05,1.0,.86],rtA:.7},
    orage:{sat:.96,con:1.18,vigK:.45,vigC:[.02,.02,.06],kickC:[1,.32,.70],kickI:.24,rimK:.75,rtT:[1.06,1.0,.84],rtA:.55}},
  /* les ambiances de chaque map, par temps (celles que SF_CARTES tire ; les nuages prennent les copies de course, le menu garde les siennes) */
  cartes:{
    nuages:{matin:'nuagesMatinCC',midi:'nuagesMidiCC',soir:'nuagesSoir',nuit:'nuagesNuit',pluie:'nuagesPluie',orage:'tempete'},
    canyon:{matin:'canyonMatin',midi:'canyonMidi',soir:'canyonSoir',nuit:'canyonNuit',pluie:'canyonPluie',orage:'canyonOrage'},
    dunes:{matin:'dunesMatin',midi:'dunesMidi',soir:'dunesSoir',nuit:'dunesNuit',pluie:'dunesVent',orage:'dunesTempete'}, // (2026-10-18) LES DUNES D'OR
    foret:{matin:'foretMatin',midi:'foretMidi',soir:'foretSoir',nuit:'foretNuit',pluie:'foretPluie',orage:'foretOrage'},
    banquise:{matin:'banqMatin',midi:'banqMidi',soir:'banqSoir',nuit:'banqNuit',pluie:'banqNeige',orage:'banqBlizzard'},
    espace:{matin:'espaceMatin',midi:'espace',soir:'espaceSoir'}},
  /* LES NUITS, map par map : le ciel (jZen/jMid/jHor en LINÉAIRE ; le canyon a le sien, cy*), la brume, la lune (sunC/sunI = la clé froide), le ciel et
     le sol de l'hémisphère, le remplissage à l'accent de la map */
  nuits:{
    nuagesNuit:{rtK:.45,jZen:[.026,.036,.17],jMid:[.07,.06,.22],jHor:[.20,.08,.26],fog:[.06,.055,.15],fogCj:[.14,.10,.24],hemiS:[.36,.40,.72],hemiG:[.16,.12,.28],hemiI:.6,
      sunC:[.82,.88,1],sunI:1.05,fillC:[.62,.34,.92],fillI:.24,volSun:[1.25,1.30,1.5],volSky:[.30,.30,.58],volGnd:[.10,.07,.20],nuLav:[.44,.40,.66],mzH:[.16,.18,.40,.8],moon:1.3},
    canyonNuit:{cyZ:[.04,.05,.22],cyM:[.09,.07,.27],cyH:[.12,.06,.18],cyC:[.12,.12,.20],cyD:[.03,.03,.07],cyR:[.04,.04,.10],cyF:[.07,.06,.15],cyL:[.18,.15,.22],
      jZen:[.04,.05,.22],jMid:[.09,.07,.27],jHor:[.12,.06,.18],fog:[.05,.045,.12],fogCj:[.12,.12,.24],fogIn:[.14,.14,.24],
      hemiS:[.28,.32,.64],hemiG:[.10,.06,.09],hemiI:.46,sunC:[.60,.70,1],sunI:.62,fillC:[.48,.30,.78],fillI:.22,expo:.9}, // (mesuré : à .95 la lune blanchissait les parois des Étroits comme en plein jour)
    dunesNuit:{cyZ:[.04,.05,.22],cyM:[.09,.07,.27],cyH:[.16,.10,.26],cyC:[.12,.12,.20],cyD:[.03,.03,.07],cyR:[.12,.11,.25],cyF:[.07,.06,.15],cyL:[.18,.15,.22], /* (MESURÉ à la photo : la brume du canyon, plus sombre que le sable lunaire, faisait une BANDE NOIRE à l'horizon — la bible : une brume indigo PLUS CLAIRE que les silhouettes) */
      jZen:[.04,.05,.22],jMid:[.09,.07,.27],jHor:[.16,.10,.26],fog:[.13,.12,.27],fogCj:[.20,.17,.34],fogIn:[.18,.17,.30],
      hemiS:[.30,.34,.66],hemiG:[.12,.08,.10],hemiI:.50,sunC:[.62,.72,1],sunI:.70,fillC:[.48,.30,.78],fillI:.22,expo:.92}, // (2026-10-18) LES DUNES D'OR : la nuit du canyon, la lune un peu plus forte (le sable la renvoie)
    foretNuit:{jZen:[.05,.07,.26],jMid:[.09,.10,.30],jHor:[.10,.09,.24],fog:[.07,.08,.16],fogCj:[.14,.16,.26],fogIn:[.16,.18,.26],
      hemiS:[.34,.42,.72],hemiG:[.06,.09,.09],hemiI:.66,sunC:[.68,.78,1],sunI:1.0,fillC:[.24,.52,.42],fillI:.26,expo:1.0},
    banqNuit:{jZen:[.04,.06,.24],jMid:[.07,.11,.30],jHor:[.06,.13,.22],fog:[.045,.06,.14],fogCj:[.12,.24,.28],fogIn:[.12,.20,.26],
      hemiS:[.30,.46,.74],hemiG:[.12,.18,.26],hemiI:.62,sunC:[.62,.76,1],sunI:.95,fillC:[.22,.60,.50],fillI:.28}}, /* (mesuré : à 1,1 de contraste et zénith ×4 le ciel de nuit sort enfin du noir ; la lune du dôme, à ,9, dessinait un losange) */
  /* LE CIEL DE JOUR CONTINU (Sacha : « le dégradé de ciel-soleil est à refaire complètement ») : le même ciel à la même heure sur les quatre maps au
     ciel d'altitude (nuages, forêt, glacier — le canyon a le sien) — zénith azur, milieu bleu clair, HORIZON PÂLE tout autour (l'air, jamais une
     bande orange : le glacier avait un horizon orange en plein midi), la CHALEUR seulement du côté du soleil (jSol, large) ; le soir garde son horizon
     de braise. LINÉAIRE. `cielJ_map` : l'accent d'une map par-dessus. */
  cielJ:{
    matin:{jZen:[.10,.28,.66],jMid:[.34,.50,.80],jHor:[.88,.84,.86],jSol:[.85,.48,.24]},
    midi: {jZen:[.07,.25,.68],jMid:[.30,.54,.88],jHor:[.76,.85,.95],jSol:[.34,.30,.22]},
    soir: {jZen:[.09,.10,.34],jMid:[.40,.28,.46],jHor:[.98,.64,.50],jSol:[1,.46,.16]}},
  cielJ_map:{
    banqSoir:{jMid:[.44,.26,.50],jHor:[1,.58,.48]}},
  /* LE JOUR, les retouches propres (au-delà de la recette) : le midi du canyon ne blanchit plus sa route, le soir des nuages retrouve
     un horizon qui brûle sans saturer tout l'écran */
  jours:{
    canyonMidi:{rtK:.6,sunI:1.6},dunesMidi:{rtK:.6,sunI:1.6},
    nuagesMatinCC:{rtT:[.97,1,1.05]},nuagesMidiCC:{rtT:[.97,1,1.05]}, // (mesuré) la route des nuages de jour était déjà NEUTRE (ROUTE_JOUR) : la teinte commune la faisait beige
    nuagesSoir:{volSun:[1.95,1.65,1.40]}}
};
{
  for(const k in BIOMES){const b=BIOMES[k];if(!b||typeof b!=='object')continue;if(!b.rtT)b.rtT=[1,1,1];if(b.rtA==null)b.rtA=1;}
  if(!BIO.cur.rtT)BIO.cur.rtT=[1,1,1];if(BIO.cur.rtA==null)BIO.cur.rtA=1; // (bioLerp écrit DANS les tableaux de l'ambiance courante : elle doit les avoir)
  const garde9={espace:{sat:1,con:1,vigK:1,rimK:1,stars:1}}; // l'ORBITE est déjà la map la plus sobre (chroma 15-23 mesurée) : elle garde son grade, elle prend la route, la vignette et le contre-jour
  for(const c in CONTI.cartes)for(const t in CONTI.cartes[c]){const b=BIOMES[CONTI.cartes[c][t]];if(!b)continue;const r=CONTI.temps[t],g9=garde9[c]||{};
    for(const f in r)if(!g9[f])b[f]=Array.isArray(r[f])?r[f].slice():r[f];}
  for(const c of ['nuages','foret','banquise'])for(const t in CONTI.cielJ){const b=BIOMES[CONTI.cartes[c][t]];if(b)Object.assign(b,JSON.parse(JSON.stringify(CONTI.cielJ[t])));}
  for(const k in CONTI.cielJ_map)if(BIOMES[k])Object.assign(BIOMES[k],JSON.parse(JSON.stringify(CONTI.cielJ_map[k])));
  for(const k in CONTI.nuits)if(BIOMES[k])Object.assign(BIOMES[k],JSON.parse(JSON.stringify(CONTI.nuits[k])));
  for(const k in CONTI.jours)if(BIOMES[k])Object.assign(BIOMES[k],JSON.parse(JSON.stringify(CONTI.jours[k])));
  // la BRUME BASSE des nuits (celle qui noie les vallées sous la route) prend l'indigo de la nuit commune : la forêt la tirait au noir-sarcelle, le glacier au vert sombre
  if(FOR_MET.nuit)FOR_MET.nuit.mC=[.06,.07,.15];if(BK_MET.nuit)BK_MET.nuit.mC=[.05,.09,.17];
}
grtConti(); // (2026-10-18) LES PROFONDEURS : ses 24 ambiances prennent la recette commune de leur temps (saturation, contraste, vignette, contre-jour rose, bitume commun)
/* (2026-10-17, Léo : « joue sur le contraste, que l'obscurité soit belle là aussi ») LA FORÊT CONTRASTÉE — APRÈS la continuité de Sacha (elle réécrit
   contraste, vignette et nuits de toutes les maps) : un cran de contraste, un peu plus de halo pour les éclats des mini-cubes ; la nuit et l'orage plus
   NOIRS (moins de ciel, moins d'exposition) — la lune, les lucioles, les éclats et les phares ressortent. */
for(const k of ['foretMatin','foretMidi','foretSoir','foretNuit','foretPluie','foretOrage'])if(BIOMES[k]){const b=BIOMES[k],n9=k==='foretNuit'||k==='foretOrage';
  b.con=(b.con||1)+(n9?.08:.06);b.vigK=(b.vigK||.3)+(n9?.08:.03);b.bloomS=(b.bloomS||.45)+.06;
  if(n9){b.expo=(b.expo||1)*.84;b.hemiI=(b.hemiI||.5)*.7;}}
function planetesAlea(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};} // (même générateur que mulberry32, local : la Terre en dépend à la construction)
function planetesMars(x,W,H){ // MARS : rouille et ocre, mers sombres, poussière claire, une faille, quelques cratères, deux calottes. AUCUN nuage (Sacha).
  const R=planetesAlea(4242),rd=function(a,b){return a+R()*(b-a);};
  const fond=x.createLinearGradient(0,0,0,H); // plus clair et plus ocre vers les pôles
  fond.addColorStop(0,'#cf9a72');fond.addColorStop(.17,'#b8663f');fond.addColorStop(.5,'#a94a28');fond.addColorStop(.83,'#b8663f');fond.addColorStop(1,'#cf9a72');
  x.fillStyle=fond;x.fillRect(0,0,W,H);
  const tache=function(cx,cy,rx,ry,rot,col,a){ // une tache DOUCE (dégradé radial), recopiée de part et d'autre si elle coupe le bord (la toile se raccorde)
    for(let k=-1;k<=1;k++){const X=cx+k*W;if(X+rx<0||X-rx>W)continue;
      x.save();x.translate(X,cy);x.rotate(rot);x.scale(1,ry/rx);
      const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(.6,'rgba('+col+','+(a*.7)+')');g.addColorStop(1,'rgba('+col+',0)');
      x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,6.2832);x.fill();x.restore();}};
  for(let i=0;i<11;i++)tache(rd(0,W),rd(90,430),rd(80,190),rd(34,80),rd(-.5,.5),'240,184,132',rd(.42,.62)); // poussière claire (Arabia, Hellas…)
  for(let i=0;i<13;i++)tache(rd(0,W),rd(90,430),rd(70,170),rd(30,70),rd(-.6,.6),'70,30,20',rd(.7,.9)); // les mers sombres (Syrtis, Acidalia…) : franches, le grade final aplatit tout (mesuré : à .5-.7 elles ne se lisaient pas)
  for(let i=0;i<26;i++)tache(rd(0,W),rd(80,440),rd(16,44),rd(10,24),rd(-.8,.8),'84,36,24',rd(.45,.7)); // taches fines
  tache(700,372,95,70,0,'236,204,176',.65);tache(190,228,34,28,0,'238,196,156',.8); // un grand bassin clair, un volcan clair
  x.lineCap='round';x.strokeStyle='rgba(66,28,20,.8)';x.lineWidth=5; // la grande faille équatoriale (Valles Marineris)
  x.beginPath();x.moveTo(262,266);for(let i=1;i<=9;i++)x.lineTo(262+i*21,266+Math.sin(i*1.3)*7+i*1.4);x.stroke();
  x.strokeStyle='rgba(66,28,20,.5)';x.lineWidth=3;x.beginPath();x.moveTo(300,258);for(let i=1;i<=6;i++)x.lineTo(300+i*20,258+Math.sin(i*1.9)*5+i*2.2);x.stroke();
  x.lineWidth=1.6; // cratères : un anneau sombre, un reflet clair de l'autre côté (retenue : peu, et petits)
  for(let i=0;i<70;i++){const cx=rd(0,W),cy=rd(60,H-60),r=rd(3,9);
    x.strokeStyle='rgba(60,28,20,.38)';x.beginPath();x.arc(cx,cy,r,0,6.2832);x.stroke();
    x.strokeStyle='rgba(240,200,160,.30)';x.beginPath();x.arc(cx+1,cy+1,r,.4,2.4);x.stroke();}
  for(let i=0;i<700;i++){x.fillStyle=R()<.5?'rgba(60,28,20,.13)':'rgba(236,190,150,.13)';const s=1+R()*2;x.fillRect(rd(0,W),rd(0,H),s,s);} // le grain de la poussière
  for(const haut of [1,0]){ // calottes polaires : irrégulières, petites, d'un blanc rosé (jamais un blanc de Terre)
    const y0=haut?0:H;x.fillStyle='rgba(248,238,230,.96)';
    for(let i=0;i<46;i++){x.beginPath();x.arc(rd(0,W),y0+(haut?1:-1)*rd(0,12),rd(10,26),0,6.2832);x.fill();}
    x.fillRect(0,haut?0:H-12,W,12);}
}
function planetesBandes(x,W,H,R,cols,n,amp,streaks){ // des BANDES horizontales à bords ondulés (périodiques : la toile se raccorde), puis des filets fins ; un bord est partagé par deux bandes (aucun interstice)
  const hs=[];let tot=0;for(let i=0;i<n;i++){const h=.55+R()*.95;hs.push(h);tot+=h;}
  const bord=[];let y=0;for(let j=0;j<=n;j++){bord.push({y:j===0?-12:j===n?H+12:y,a:(j===0||j===n)?0:amp*(.5+R()),k:2+((R()*4)|0),p:R()*6.28,k2:5+((R()*5)|0),p2:R()*6.28});if(j<n)y+=hs[j]/tot*H;}
  const yb=function(b,X){return b.y+b.a*(Math.sin(6.2832*b.k*X/W+b.p)*.62+Math.sin(6.2832*b.k2*X/W+b.p2)*.38);};
  let prev=-1;
  for(let i=0;i<n;i++){let c;do{c=(R()*cols.length)|0;}while(c===prev&&cols.length>1);prev=c;
    x.fillStyle=cols[c];x.beginPath();x.moveTo(0,yb(bord[i],0));for(let X=8;X<=W;X+=8)x.lineTo(X,yb(bord[i],X));
    for(let X=W;X>=0;X-=8)x.lineTo(X,yb(bord[i+1],X));x.closePath();x.fill();}
  x.lineCap='round';
  for(let i=0;i<streaks;i++){const b=bord[1+((R()*(n-1))|0)],o=(R()-.5)*14,k=2+((R()*5)|0),p=R()*6.28,a=2+R()*5;
    x.strokeStyle=R()<.5?'rgba(90,56,38,'+(.14+R()*.14)+')':'rgba(246,230,196,'+(.14+R()*.14)+')';x.lineWidth=1+R()*2.6;
    x.beginPath();for(let X=0;X<=W;X+=8){const Y=yb(b,X)+o+a*Math.sin(6.2832*k*X/W+p);if(X===0)x.moveTo(X,Y);else x.lineTo(X,Y);}x.stroke();}
  return bord;}
function planetesJupiter(x,W,H){ // JUPITER : bandes crème / ocre / roux / brun, UNE grande tache rouille (discrète), trois ovales clairs. Pas de nuage dessiné : de la couleur.
  const R=planetesAlea(1969);
  x.fillStyle='#c99a64';x.fillRect(0,0,W,H);
  planetesBandes(x,W,H,R,['#ecd9b0','#c8955c','#9a5a36','#f2e3be','#6a4030','#d8b484'],15,7,46); // (bandes plus franches : le grade rapproche tout vers l'orange)
  const tache=function(cx,cy,rx,ry,col,a){x.save();x.translate(cx,cy);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(.7,'rgba('+col+','+(a*.8)+')');g.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,6.2832);x.fill();x.restore();};
  tache(330,338,50,27,'190,84,50',.8);x.strokeStyle='rgba(240,214,176,.45)';x.lineWidth=2.5;x.beginPath();x.ellipse(330,338,46,24,0,0,6.2832);x.stroke(); // la Grande Tache et son anneau clair
  tache(700,300,17,9,'246,232,208',.6);tache(780,352,14,8,'246,232,208',.55);tache(520,176,15,8,'246,232,208',.5); // petits ovales blancs
  for(const haut of [1,0]){const g=x.createLinearGradient(0,haut?0:H,0,haut?H*.2:H*.8);g.addColorStop(0,'rgba(78,52,40,.55)');g.addColorStop(1,'rgba(78,52,40,0)');x.fillStyle=g;x.fillRect(0,haut?0:H*.8,W,H*.2);} // les pôles s'assombrissent
}
const PLANETES_PEINTRES={mars:planetesMars,jupiter:planetesJupiter};
function planetesGarde(a){ // un niveau SANS planète n'a pas à la repeindre : on la laisse telle quelle, elle s'éteint en fondu (sinon un flash de teinte au portail)
  const c=LVL.cur;return !(c&&c.espace)&&planetGroup.userData.peint!=='terre';}
function planetesPeint(a){ // la toile change si la planète change — UNE repeinte à la naissance du niveau (même taille, même canvas recréé puis rendu après l'envoi)
  const g=planetGroup.userData,nom=(a&&a.peint)||'terre';
  try{PLANET_BLEU.setHex(a&&a.limbe!=null?a.limbe:0x6fc0ff);}catch(e){} // le limbe au repos prend la couleur de l'atmosphère de CETTE planète
  g.globe.material.opacity=a&&a.rim!=null?a.rim:1; // la couleur du liseré intérieur (voir le shader du globe)
  if(g.peint===nom)return;
  const cv=document.createElement('canvas');cv.width=g.W9;cv.height=g.H9;const x=cv.getContext('2d');
  if(nom==='terre')g.peintTerre(x);else (PLANETES_PEINTRES[nom]||g.peintTerre)(x,g.W9,g.H9);
  g.tex.image=cv;g.tex._lib=0;texLibere(g.tex);g.tex.needsUpdate=true;g.peint=nom;}
let planetesCache=null;
window.dbgPlanete=function(nom,o){ // banc : peint la planète `nom` tout de suite, réglages à chaud o={teinte,atmo,limbe} ; o.vue = cadre la planète et re-rend une image (course en pause) ; vue:2 = SEULE (ni route, ni voiture, ni lune) ; '?' = laquelle est peinte
  if(planetesCache){for(const c of planetesCache)c[0].visible=c[1];planetesCache=null;}
  if(nom==='?'){const r={peint:planetGroup.userData.peint};
    if(o&&o.mesure){const I=renderer.info;I.autoReset=false;I.reset();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);r.appels=I.render.calls;r.triangles=I.render.triangles;r.programmes=I.programs?I.programs.length:null;I.autoReset=true;} // banc : le coût d'UNE image
    return r;}
  const base=PLANETES[nom||'terre'];if(!base)return Object.keys(PLANETES);
  const a=Object.assign({},base,o||{}),g=planetGroup.userData;g.globe.material.color.setHex(a.teinte);g.atmo.material.color.setHex(a.atmo);planetesPeint(a);
  if(o&&o.vue){camera.lookAt(planetGroup.position);camera.updateMatrixWorld();
    if(o.vue===2){planetesCache=scene.children.map(function(c){return [c,c.visible];});for(const c of scene.children)if(c!==planetGroup&&c!==skyDome)c.visible=false;}
    if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  return {peint:g.peint,teinte:a.teinte,atmo:a.atmo,limbe:a.limbe};};
function sfNiveau(c,m,te){ // le NIVEAU d'un couple map × météo, sous la forme que lit tout le jeu (id, bio, pluie, nuit, route…) — (2026-10-16) `te` : la TEINTE de la ville (VTEINTES)
  const C=SF_CARTES[c],M=C.m[m],B=SF_NIV[M.niv||C.base];
  const o=Object.assign({},B,M,{nm:C.nm,mt:M.mt||SF_METEOS[m],carte:c,meteo:m,sansFin:1,graine:0}); // graine 0 : une piste neuve à chaque fois (la jade comprise)
  o.bio=[M.bio||B.bio[0]];delete o.niv;delete o.p;
  if(C.teintes&&te){o.teinte=te;o.bioBase=o.bio[0];o.bio=[vtBio(o.bio[0],te)];} // (teintes) l'ambiance teintée, créée à son premier emploi ; bioBase : l'ambiance d'origine (villeRose)
  else if(C.teintes)vtBio(o.bio[0],'violet'); // (le brouillard violet a lui aussi besoin de naître)
  return o;}
function sfTeinte(c,prev){const L=SF_CARTES[c].teintes;if(!L)return null;let t=L[(Math.random()*L.length)|0];if(prev&&t===prev.teinte)t=L[(Math.random()*L.length)|0];return t;} // (2026-10-16) la TEINTE de la ville, au hasard
function sfTire(prev,cF){ // une MAP au hasard (jamais celle d'avant), puis une MÉTÉO permise dans cette map (pas deux fois la même de suite si on peut l'éviter) — cF : la map imposée (sa météo tirée)
  const cs=cF?[cF]:Object.keys(SF_CARTES).filter(function(k){return (!prev||k!==prev.carte)&&!SF_HORS[k];}),c=cs[(Math.random()*cs.length)|0],M=SF_CARTES[c].m,ks=Object.keys(M);
  const pick=function(){let tot=0;for(const k of ks)tot+=M[k].p==null?1:M[k].p;let r=Math.random()*tot;for(const k of ks){r-=M[k].p==null?1:M[k].p;if(r<=0)return k;}return ks[ks.length-1];};
  let m=pick();if(prev&&m===prev.meteo)m=pick();
  return {carte:c,meteo:m,teinte:sfTeinte(c,prev)};}
function sfImpose(prev){ // le couple imposé (lien de test, banc) s'il existe — la météo absente de la map est tirée
  const f=SF.force;SF.force=null;if(!f)return sfTire(prev);
  const c=f.carte&&SF_CARTES[f.carte]?f.carte:sfTire(prev).carte,M=SF_CARTES[c].m,L=SF_CARTES[c].teintes;
  const te=L?(f.teinte&&L.indexOf(f.teinte)>=0?f.teinte:sfTeinte(c,null)):null; // (2026-10-16) la teinte imposée, sinon tirée
  if(f.meteo&&M[f.meteo])return {carte:c,meteo:f.meteo,teinte:te};
  const t=sfTire(null,c);t.teinte=te;return t;} // (2026-10-18) la météo tirée DANS la map imposée (une map hors du tirage ne sortirait jamais de sfTire)
function sfPlayOk(){return SF.on&&!PARK.on&&!SURV.armed&&!!SAVE.d.tuto;} // le JOUER lance le mode classique au hasard (un joueur neuf, ou qui a demandé à revoir l'auto-école, passe d'abord par elle : l'ancien chemin)
window.dbgClassique=function(c,m,te){if(c){SF.force={carte:c,meteo:m||null,teinte:te||null};if(started&&!gameOver&&PCUBE.on&&SF.on){const zn=Math.max(0,(runStats.zones|0)-(LVL.tutoZ|0));SF.tirage[zn+1]=sfImpose(SF.tirage[zn]||null);pcubeDest();}} /* (2026-10-17) le portail de cubes tire la suite d'avance : on remplace celle qu'il montre */return {on:SF.on,pret:SF.pret,tirage:SF.tirage.slice(),force:SF.force,niveau:LVL.cur?{carte:LVL.cur.carte||LVL.cur.id,meteo:LVL.cur.meteo||null,teinte:LVL.cur.teinte||null,ciel:BIO.name,pluie:+LVL.pluie.toFixed(2),nuit:+LVL.nuit.toFixed(2),orage:!!(LVL.cur.orage||LVL.cur.id==='orage')}:null,
  cartes:Object.keys(SF_CARTES).map(function(k){return k+' : '+Object.keys(SF_CARTES[k].m).join(', ');})};};
const LVL={cur:null,n:0,k:1,dur:4,paris:0,parisDe:0,parisA:0, // paris : le CIEL DE PARIS (toits bas, lueur d'or) — fondu comme la ville
 
  espace:0,espaceDe:0,espaceA:0,       // uSpace : 0 = le ciel de toujours, 1 = le noir étoilé de l'orbite
  planete:1,planeteDe:1,planeteA:1,    // échelle de la planète (1 = sa taille historique)
  pluie:0,pluieDe:0,pluieA:0,          // opacité du rideau de pluie (niveau VILLE)
  brume:0,brumeDe:0,brumeA:0,          // (2026-10-16) LE BROUILLARD de la ville : le plafond bas du ciel (uPluie du dôme) SANS la pluie — ni rideau, ni route mouillée
  ville:0,villeDe:0,villeA:0,          // présence de la VILLE dans le ciel (skyline, abîme) — le plafond, lui, suit la pluie
  nuit:0,nuitDe:0,nuitA:0,             // (2026-09-30) MINUIT EN VILLE : 1 = fenêtres éteintes, néons baissés, phares puissants (villeApres, carVit, les faisceaux)
  jade:0,jadeDe:0,jadeA:0,             // (2026-10-09) LES PICS DE JADE : le rouleau peint du dôme (uJade)
  crypto:0,cryptoDe:0,cryptoA:0,       // (2026-10-13) CRYPTO CITY : le bitume anthracite et glacé du jour (routeTick)
  canyon:0,canyonDe:0,canyonA:0,grotte:0,grotteDe:0,grotteA:0,dunes:0,dunesDe:0,dunesA:0,       // (2026-10-14) LE CANYON DES GÉANTS : son ciel, son relief, son soleil (uCanyon, canyonSoleil)
  mer:0,merDe:0,merA:0,                // (2026-09-26) la MER DE NUAGES peinte sous l'horizon (niveau NUAGES, pas l'auto-école au ciel nu)
  route:0,routeDe:0,routeA:0,sheen:.1,sheenDe:.1,sheenA:.1, // bitume v2 : clarté et brillance d'horizon du niveau (routeTick)
  dir:PLANET_DIR.clone(),tmp:new THREE.Vector3(),tmp2:new THREE.Vector3(),haut:new THREE.Vector3(0,1,0)};
// LA LARGEUR PAR NIVEAU (× ROAD_HALF0 = 14) : très large pour apprendre (47,6 m), puis la route se resserre à chaque
// portail jusqu'au plancher ×1,1 (30,8 m). Une nouvelle partie repart au niveau 1.
const LARGEUR=[2.0]; // (2026-09-26, user : « fais les routes un peu plus larges ») 1,7 → 2,0 : 47,6 → 56 m // (2026-09-25, user : « enlève le rétrécissement de la route, ça sert à rien, la vitesse fait tout le travail ») : 47,6 m partout — était [1.7,1.55,1.4,1.25,1.1]
function lvlChoisir(){ // appelé par newTrack AVANT buildTrack
  const z=runStats.zones|0;
  if(z===0)LVL.tutoZ=TUTO.on?1:0; // (2026-09-29) la zone 0 de cette partie est-elle la piste de l'école ? (voir plus bas)
  ROAD_HALF=ROAD_HALF0*(PARK.on?1.4:LARGEUR[Math.min(LARGEUR.length-1,z)]);
  if(PARK.on){LVL.cur=null;lvlAstre(null);return null;}
  if(BALADE||JADE_JEU){LVL.cur=NIV_JADE;LVL.n=1;LVL.tutoZ=0;lvlAstre(null);return LVL.cur;}
  // (2026-10-09) LA BALADE : toujours les PICS DE JADE, chaque portail mène à une autre vallée
  /* (2026-09-29, audit « 10 premières minutes », session INTERFACE) LA PISTE DE L'ÉCOLE N'EST PAS UN NIVEAU : elle occupait la zone 0, donc
     après le permis le portail menait à NIVEAUX[1] — la VILLE — au lieu des NUAGES (verdict du 25/09 : « NUAGES en 1er »). `LVL.tutoZ` dit, au
     départ de chaque partie (z = 0), si la zone 0 est la leçon ; les niveaux se comptent APRÈS elle. */
  if(TUTO.on&&z===0){ // L'AUTO-ÉCOLE : la piste dessinée à la main, sous le ciel nu de l'aurore
    LVL.cur=Object.assign({},NIVEAUX.find(n9=>n9.id==='nuages'),{bio:['aurore'],sansNuages:1,piste:'tuto'}); // (l'auto-école garde le ciel NU de l'aurore : on y lit tout)
    LVL.n=1;lvlAstre(null);ROAD_HALF=ROAD_HALF0*2.0;return LVL.cur;}
  /* (2026-10-13, Sacha) LE MODE CLASSIQUE AU HASARD — en course (et sous le voile du JOUER : SF.pret) ; la piste du MENU garde NIVEAUX[0] et son ciel */
  if(SF.on&&(started||SF.pret)){const zn=Math.max(0,z-(LVL.tutoZ|0));let t=SF.tirage[zn];
    if(!t){t=SF.tirage[zn]=SF.force?sfImpose(SF.tirage[zn-1]||null):sfTire(SF.tirage[zn-1]||SF.der);SF.der=t;SF.prochain=null;}else if(SF.der!==t){SF.der=t;SF.prochain=null;} /* (2026-10-17) le couple tiré D'AVANCE par le portail de cubes (portDest) : arrivé ici, c'est lui le dernier */ // (2026-10-14, chasse aux bugs) SF.der change : le couple « annoncé d'avance » (calculé contre l'ancien der) est périmé — il pouvait ressortir au JOUER suivant = la même map deux fois de suite
    LVL.cur=sfNiveau(t.carte,t.meteo,t.teinte);LVL.n=zn+1;lvlAstre(LVL.cur.astre||null);return LVL.cur;} // (2026-10-14, passe graphismes) la variante peut porter sa planète (PLANETES)
  {const zn=Math.max(0,z-(LVL.tutoZ|0));LVL.cur=NIVEAUX[zn%NIVEAUX.length];LVL.n=zn+1;lvlAstre(null);}
  return LVL.cur;
}
function lvlBiome(){ // le ciel du niveau : tiré dans SA liste, jamais deux fois le même de suite
  const p=LVL.cur.bio;if(p.length===1)return p[0];
  let b;do{b=p[(Math.random()*p.length)|0];}while(b===BIO.name);
  return b;
}
function lvlGo(dur){ // les deux leviers HORS biome (uSpace, taille de planète) suivent le même fondu que le ciel
  const c=LVL.cur;
  LVL.espaceDe=LVL.espace;LVL.planeteDe=LVL.planete;LVL.pluieDe=LVL.pluie;LVL.villeDe=LVL.ville;LVL.villeA=c&&c.id==='ville'&&!c.crypto&&!c.vitre?1:0;LVL.cryptoDe=LVL.crypto;LVL.cryptoA=c&&(c.crypto||c.vitre)?1:0;LVL.nuitDe=LVL.nuit;LVL.parisDe=LVL.paris;LVL.parisA=c&&c.id==='paris'?1:0;LVL.nuitA=c&&c.nuit?1:0;LVL.jadeDe=LVL.jade;LVL.jadeA=c&&c.id==='jade'?1:0;LVL.canyonDe=LVL.canyon;LVL.canyonA=c&&(c.id==='canyon'||c.id==='dunes')?1:0;LVL.dunesDe=LVL.dunes;LVL.dunesA=c&&c.id==='dunes'?1:0;LVL.grotteDe=LVL.grotte;LVL.grotteA=c&&c.id==='grotte'?1:0;LVL.merDe=LVL.mer;LVL.merA=c&&(c.id==='nuages'||c.id==='orage'||c.crypto||c.vitre)&&!c.sansNuages?1:0;LVL.routeDe=LVL.route;LVL.sheenDe=LVL.sheen;
  LVL.brumeDe=LVL.brume;LVL.brumeA=c&&c.brume?c.brume:0;vtGo(); // (2026-10-16) le brouillard de la ville et les couleurs fixes de sa teinte suivent le même fondu
  LVL.espaceA=c?c.espace:0;LVL.planeteA=c?c.planete:0;LVL.pluieA=c?c.pluie:0;LVL.routeA=c&&c.route!=null?c.route:0;LVL.sheenA=c&&c.sheen!=null?c.sheen:.1; // (planète : 0 par défaut — plus de Terre là où le niveau ne la demande pas)
  LVL.symDe=LVL.sym||0;LVL.symA=hautOn()?1:0; // (2026-10-15) LE CIEL SANS DESSOUS : la map NUAGES en course (voir hautOn, uSym)
  LVL.k=0;LVL.dur=dur||4;
  if(LVL.dur<=.05)lvlStep(1);
}
function lvlStep(dt){
  if(LVL.k>=1)return;
  LVL.k=Math.min(1,LVL.k+dt/LVL.dur);
  const e=LVL.k*LVL.k*(3-2*LVL.k); // même smoothstep que bioStep : les deux basculent d'un seul mouvement
  LVL.espace=LVL.espaceDe+(LVL.espaceA-LVL.espaceDe)*e;
  LVL.planete=LVL.planeteDe+(LVL.planeteA-LVL.planeteDe)*e;
  LVL.pluie=LVL.pluieDe+(LVL.pluieA-LVL.pluieDe)*e;LVL.brume=LVL.brumeDe+(LVL.brumeA-LVL.brumeDe)*e;vtPose(e);LVL.ville=LVL.villeDe+(LVL.villeA-LVL.villeDe)*e;LVL.nuit=LVL.nuitDe+(LVL.nuitA-LVL.nuitDe)*e;LVL.paris=LVL.parisDe+(LVL.parisA-LVL.parisDe)*e;
  LVL.route=LVL.routeDe+(LVL.routeA-LVL.routeDe)*e;LVL.sheen=LVL.sheenDe+(LVL.sheenA-LVL.sheenDe)*e;
  LVL.jade=LVL.jadeDe+(LVL.jadeA-LVL.jadeDe)*e;skyU.uJade.value=LVL.jade;LVL.crypto=LVL.cryptoDe+(LVL.cryptoA-LVL.cryptoDe)*e;LVL.canyon=LVL.canyonDe+(LVL.canyonA-LVL.canyonDe)*e;LVL.grotte=LVL.grotteDe+(LVL.grotteA-LVL.grotteDe)*e;skyU.uCanyon.value=LVL.canyon;LVL.dunes=LVL.dunesDe+(LVL.dunesA-LVL.dunesDe)*e;skyU.uCyDn.value=LVL.dunes;
  LVL.mer=LVL.merDe+(LVL.merA-LVL.merDe)*e;skyU.uMer.value=LVL.mer;
  LVL.sym=(LVL.symDe||0)+((LVL.symA||0)-(LVL.symDe||0))*e;skyU.uSym.value=LVL.sym;
  skyU.uSpace.value=LVL.espace;
}
/* LA PLANÈTE DU NIVEAU. Hors orbite elle garde sa place de toujours (`PLANET_DIR`, fixe dans le monde).
   En orbite une direction fixe ne suffit plus : la piste tourne, et la Terre passerait la moitié du
   niveau dans le dos de la caméra. Elle se cale donc sur le CAP de la caméra — un peu sur la gauche,
   35° sous l'horizon — avec un gros RETARD : on la voit glisser, elle ne colle jamais à l'écran.
   Échelle 1,35 : le bord haut affleure l'horizon, le reste est SOUS la route (à 1,5 elle mangeait
   tout le cadre dès qu'on plongeait). Le halo le plus large (×1,135) reste à ~1 000 unités de la
   caméra et loin du plan lointain (9 800). */
function lvlPlanete(dt){
  const sc=LVL.planete;
  planetGroup.visible=sc>.02; // la VILLE sous la pluie n'a pas de planète : ciel bouché
  planetGroup.scale.setScalar(Math.max(.02,sc));
  const t=LVL.tmp;camera.getWorldDirection(t);t.y=0;
  if(t.lengthSq()<1e-6)t.copy(LVL.dir);
  t.normalize().applyAxisAngle(LVL.haut,.5);t.y=-.70;t.normalize();
  LVL.dir.lerp(t,Math.min(1,dt*.35)).normalize();
  const d=LVL.tmp2.copy(PLANET_DIR).lerp(LVL.dir,LVL.espace).normalize();
  planetGroup.position.copy(camera.position).addScaledVector(d,PLANET_D);
}
function lvlNuageOk(o){ // quelles familles de nuages chaque monde garde (lu par mkCloud)
  const c=LVL.cur;if(!c)return true;
  if(c.sansNuages)return false; // un niveau au ciel NU (l'aurore d'apprentissage) : pas un seul nuage
  if(o.sea&&(c.id==='nuages'||c.id==='orage')&&!MER_MOTIF)return false; // (2026-09-28) l'ABÎME BLEU : plus de nappes de nuages plates sous la route (les cumulus du ciel de coton restent)
  if(c.id==='banquise')return false; // (2026-10-14) LA BANQUISE : sa brume de vallée et sa neige sont à elle (buildBanq)
  if(c.id==='foret')return false; // (2026-10-14) LA FORÊT NOIRE : sa brume et ses rayons sont à elle (buildForet)
  if(c.id==='grotte')return false; // (2026-10-18) LES PROFONDEURS : sous la terre, pas un nuage
  if(c.id==='jade')return false; // (2026-10-09) LES PICS DE JADE : leur brume est à eux (buildJade)
  if(c.id==='canyon'||c.id==='dunes')return false; // (2026-10-14) LE CANYON DES GÉANTS : ses nuages sont dans son ciel (canyonCiel)
  if(c.id==='espace')return false; // (2026-09-26, user : « pas de nuage dans l'espace ») — même plus les coussins de vol
  if(c.id==='ville'||c.id==='paris')return false; // (2026-09-28) PARIS : un ciel de nuit dégagé, on voit les toits                                        // la VILLE n'a AUCUN nuage (user, 2026-09-25) : on la voit de haut en bas, jusqu'à l'horizon
  return true;
}
let lvlBanT=0;
/* (2026-09-30) LA PROMESSE SE LIT EN ENTIER. La bannière à promesse restait 3,8 s à l'écran mais ne réservait le couloir que 2,8 s (la
   carte suivante s'affichait PAR-DESSUS pendant la dernière seconde) et, en priorité 1, une carte MOTEUR (2) la coupait à tout instant :
   la règle du niveau disparaissait au portail, pile quand elle sert. Désormais le couloir est réservé toute sa durée (3,8 s) et VERROUILLÉ
   3 s (`ferme` : même une voix plus forte attend dans la file — la carte moteur passe à 3 s, un record patiente) ; seule la mort la
   coupe : l'explosion (hautVide). Sans promesse : inchangé (2,8 s, coupable à 1,4 s). */
const LVL_BAN={ms:2400,msPr:3800,verrou:3000,prom:0,num:0}; // (2026-09-30, Sacha : « trop de texte, laisse juste MER DE NUAGES ») prom / num : la promesse et « NIVEAU n » — éteints ; la bannière ne dit plus que le NOM
function lvlPromesse(){ // la ligne sous le nom ('' = aucune) — UN seul endroit : le couloir (sa durée) et la bannière (son texte, sa durée) la lisent
  const c=LVL.cur;if(!c||c.piste==='tuto'||!LVL_BAN.prom)return ''; // la piste de l'école hérite des NUAGES : pas de « LES NUAGES CACHENT LES VIRAGES » sous son ciel nu
  return c.pr||(c.espace>=.5&&!PARK.on?'GRAVITE REDUITE : SAUTS 2 FOIS PLUS LONGS':''); // (2026-09-28) l'espace a SA promesse : la gravité
}
function lvlAnnonce(){ // (vague 2) le niveau prend son tour dans la file du couloir : il ne parle plus PAR-DESSUS un palier ou un record
  if(!document.getElementById('lvlBan')||!LVL.cur)return;
  if(lvlPromesse())hautPasse(lvlMontre,LVL_BAN.msPr,'lvl',1,{min:LVL_BAN.verrou,ferme:1});else hautPasse(lvlMontre,LVL_BAN.ms,'lvl',1);}
function lvlMontre(){ // la bannière « NIVEAU n — LIEU » (fondu d'opacité seul : rien ne bouge, REDUCED_MOTION compris)
  const b=document.getElementById('lvlBan');if(!b||!LVL.cur)return;
  {const n9=document.getElementById('lvlNum');n9.style.display=LVL_BAN.num?'':'none';}
  document.getElementById('lvlNum').innerHTML=Array.from(TR('NIVEAU')+' '+LVL.n).map(function(c,i){return '<i style="animation-delay:'+(i*45)+'ms">'+(c===' '?'&nbsp;':c)+'</i>';}).join(''); // (2026-09-26) les lettres TOMBENT une à une
  {const nm9=document.getElementById('lvlNom');
   nm9.textContent=TR(LVL.cur.nm)+(LVL.cur.mt?' — '+TR(LVL.cur.mt):''); // (2026-10-13) le mode classique dit aussi sa MÉTÉO
   const pr9=lvlPromesse(); // (2026-09-30) lue au même endroit que la durée du couloir (lvlAnnonce)
   if(pr9){const e9=document.createElement('em');e9.textContent=TR(pr9);nm9.appendChild(e9);}} // (2026-09-27) la PROMESSE du niveau, une ligne sous le nom
  b.classList.add('on');clearTimeout(lvlBanT);lvlBanT=setTimeout(function(){b.classList.remove('on');},lvlPromesse()?LVL_BAN.msPr:LVL_BAN.ms);
  /* (2026-09-28, console de son) la bannière s'abat (ui.banniere) et ses lettres tombent en micro-frappes : une sur deux, plus la dernière
     (le numéro), au plus dix, chacune ~100 ms après le départ de sa chute (45 ms d'écart). setTimeout et pas `{t:}` : ui.lettre n'a que
     trois voix, dix notes programmées d'un coup se couperaient entre elles avant d'avoir sonné. Carte d'auto-école à l'écran : elle la cache. */
  if(SONV2&&!document.body.classList.contains('coOn'))try{sfx('ui.banniere');
    if(!REDUCED_MOTION&&LVL_BAN.num){const L9=Array.from(TR('NIVEAU')+' '+LVL.n);let k9=0,n9=0; /* (les micro-frappes accompagnent les lettres de « NIVEAU n » : sans elles, silence) */
      L9.forEach(function(ch,i){if(ch===' ')return;const d9=(k9++%2===0)||i===L9.length-1;if(!d9||n9>=10)return;n9++;
        setTimeout(function(){try{if(b.classList.contains('on'))sfx('ui.lettre');}catch(e){}},i*45+100);});}}catch(e){}
}
/* ---- LA PLUIE DU VILLAGE (2026-09-24) — un rideau de traits qui tombe AUTOUR de la caméra ----------------
   ⚠ ZÉRO CPU PAR FRAME : 1 100 traits (600 sur téléphone) dont la chute ET le repliement vivent dans le
   vertex shader. Chaque goutte est une graine fixe dans une boîte de 170 × 130 × 170 ; le shader la fait
   descendre avec le temps puis la replie (`mod`) dans la boîte centrée sur la caméra — la caméra peut foncer
   à 1 400 km/h, il pleut toujours autour d'elle. Un seul draw call, deux sommets par goutte.
   ⚠ CRÉÉE ET COMPILÉE À L'INIT (même règle que les lumières du changement de moteur) : un matériau neuf au
   premier portail de la ville, c'est un hoquet de compilation au pire moment. Elle reste donc DANS la scène,
   invisible hors niveau VILLE ; `uOp` suit le fondu du niveau (`LVL.pluie`). */
const PLUIE=(function(){
  const N=IS_MOBILE?600:1100,pos=new Float32Array(N*6),bout=new Float32Array(N*2); // dosée pour que la route reste LISIBLE à travers
  for(let i=0;i<N;i++){const a=Math.random(),b=Math.random(),c=Math.random();
    pos.set([a,b,c,a,b,c],i*6);bout[i*2]=0;bout[i*2+1]=1;}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); // la GRAINE de la goutte (three exige un attribut `position`)
  g.setAttribute('aBout',new THREE.BufferAttribute(bout,1));   // 0 = la tête, 1 = la queue du trait
  /* LA PLUIE v2 (2026-09-26) — (1) la traînée suit la vitesse RELATIVE de la goutte (sa chute MOINS la course de la caméra, `uVel`) :
     à l'arrêt elle tombe droit, à fond elle file vers l'objectif comme de vraies gouttes filées par l'obturateur — la vitesse se VOIT
     dans la pluie ; la queue est là où la goutte ÉTAIT (l'ancienne pendait sous la tête). (2) Plus de gouttes qui APPARAISSENT au bord
     de la boîte repliée ni de traits géants qui balafrent l'écran à 1 m de l'objectif : fondu près de l'œil et aux parois. (3) Chaque
     goutte a son éclat, et une sur sept ACCROCHE un néon (magenta, cyan). Toujours un appel de rendu, zéro CPU par goutte. */
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
    uniforms:{uTime:{value:0},uOp:{value:0},uCam:{value:new THREE.Vector3()},uVel:{value:new THREE.Vector3()},uNeon:{value:1},uEcl:{value:0},uVent:{value:new THREE.Vector3(1.4,0,.6)},uDens:{value:1},uOr:{value:0}}, // (2026-09-30) uNeon/uEcl/uVent : voir pluieTick
    vertexShader:['attribute float aBout;uniform float uTime;uniform vec3 uCam,uVel;uniform float uOp;uniform float uNeon,uEcl,uDens,uOr;uniform vec3 uVent;varying float vA;varying vec3 vC;',
      'void main(){',
      '  vec3 B=vec3(170.,130.,170.);',
      '  vec3 p=position*B;float vy=95.+position.x*45.;',
      '  p.y-=uTime*vy;p.xz+=uTime*(uVent.xz-vec2(1.4,.6));',   // (2026-09-30) le VENT de l orage pousse les gouttes (nul en ville : la pluie d avant)                                // la chute, un peu différente pour chaque goutte
      '  vec3 o=uCam-B*.5;',
      '  p=o+mod(p-o,B);',                             // repliée dans la boîte qui suit la caméra
      '  vec3 tr=(vec3(uVent.x,-vy,uVent.z)-uVel)*.055;float L=length(tr);tr*=min(1.,16./max(L,.001));', // la traînée : vitesse RELATIVE × obturateur (plafonnée à 16 m)
      '  vec3 d=p-uCam;float fo=smoothstep(2.5,8.,length(d))*(1.-smoothstep(58.,84.,max(abs(d.x),abs(d.z))))*(1.-smoothstep(44.,64.,abs(d.y)));', // ni près de l oeil ni au bord de la boîte
      '  p-=tr*aBout;',                                  // la QUEUE : là où la goutte était
      '  float h=fract(position.y*113.7+position.z*57.3);',
      '  vec3 e9=vec3(.80,.90,.96);vC=h>.93?mix(e9,vec3(1.,.42,.82),uNeon):h>.86?mix(e9,vec3(.45,.95,1.),uNeon):e9;vC+=vec3(.7,.75,1.)*uEcl*.9;', // les gouttes néon : EN VILLE seulement (uNeon) · l éclair les allume en argent            // une goutte sur sept accroche un néon ; les autres ont l EAU de la bible (#dff6ff, à l éclat d avant)
      '  vC=mix(vC,h>.86?vec3(1.,.74,.38):vec3(.86,.84,.8),uOr);',                     // (Paris) la BRUINE accroche l or des façades, pas les néons            // une goutte sur sept accroche un néon ; les autres ont l EAU de la bible (#dff6ff, à l éclat d avant)
      '  vA=(1.-aBout*.8)*uOp*fo*(.55+.9*fract(h*7.31))*clamp(7./max(L,.001),.45,1.)*(1.+uEcl*1.5);', // chaque goutte son éclat ; une longue traînée étale sa lumière
      '  vA*=step(fract(h*3.17+position.x*5.3),uDens);',                                 // (Paris) une pluie FINE : moins de gouttes
      '  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}'].join('\n'),
    fragmentShader:'varying float vA;varying vec3 vC;void main(){gl_FragColor=vec4(vC,vA*.36);}'});
  const l=new THREE.LineSegments(g,m);l.frustumCulled=false;l.renderOrder=9;
  scene.add(l);return l;
})();
function pluieTick(t){ // appelée par la boucle : suit la caméra, suit le fondu — et ne dessine RIEN hors de la ville
  const u=PLUIE.material.uniforms,U=PLUIE.userData,or9=LVL.cur&&(LVL.cur.id==='orage'||LVL.cur.orage)?1:0;u.uOp.value=Math.max(LVL.pluie*(1+.3*or9),parisPluie());u.uDens.value=1-.5*LVL.paris;u.uOr.value=LVL.paris;u.uTime.value=t;
  u.uNeon.value=LVL.ville;try{u.uEcl.value=CAMP_FLASH;}catch(e){}u.uVent.value.set(1.4+12.6*or9,0,.6+5.4*or9); // (2026-09-30, revue GAMEPLAY) sans ville, pas de gouttes-enseignes ; l'éclair allume la pluie ; l'ORAGE a du VENT et plus de pluie
  if(!U.pv){U.pv=new THREE.Vector3().copy(camera.position);U.v9=new THREE.Vector3();U.t=t;}
  const dt9=t-U.t;if(dt9>1e-4&&dt9<.25){U.v9.subVectors(camera.position,U.pv).divideScalar(dt9);if(U.v9.lengthSq()>4.9e5)U.v9.set(0,0,0); // la vitesse de la caméra (un téléport ne compte pas)
    u.uVel.value.lerp(U.v9,Math.min(1,dt9*10));}
  U.pv.copy(camera.position);U.t=t;u.uCam.value.copy(camera.position);
  PLUIE.visible=Math.max(LVL.pluie,parisPluie())>.01||!PLUIE.userData.vu; // dessinée UNE fois au boot (compilation), ensuite seulement quand il pleut
  PLUIE.userData.vu=true;
}
