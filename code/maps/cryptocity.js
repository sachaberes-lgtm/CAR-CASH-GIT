/* ================================ CRYPTOCITY — LA VILLE EN BULL RUN ================================
   (2026-10-13, Léo : « avec le même système de génération automatique que les autres maps, génère une ville mais avec un twist majeur :
   c'est CRYPTOCITY, mais en BULL RUN — ciel joyeux, trouve plein de détails émerveillants du bull run, toute l'ambiance est différente,
   ça respire la réussite et l'argent ; un immeuble BULL, et tout ; et pour la peine ramène la pluie d'argent que t'as enlevée entretemps,
   et augmente la qualité »)
   LE NIVEAU (`NIV_CRYPTO` : id 'ville' + crypto:1, comme MINUIT EN VILLE) : la piste et les tours sont celles de la VILLE — genCtrl (ruban
   sans looping, l'entrée surélevée), buildVoxCity (le canyon, la forêt, la règle d'or : jamais une tour sur la route), les tours DURES, la
   loi 15 du flow. À graine égale c'est la MÊME ville (les tirages `vr` ne bougent pas d'un pas : tout ce qui est à CRYPTOCITY tire dans
   son propre flux `cr`). Ce qui change, c'est tout le reste :
   · LE CIEL DU BULL RUN (biome `bullrun`) : le jour d'altitude, un azur profond, l'horizon et la brume en OR, le soleil franc ; la lune du
     dôme cède la place à une PIÈCE ₿ qui tourne dans le ciel (la lune, c'est là où l'on va) ; route anthracite et glacée (elle renvoie le ciel).
   · LES TOURS QUI REFLÈTENT (`cryptoMatTours`, 2026-10-15, Sacha : « des vitrés, des dorés, des argentés, des métalliques et des blancs ») :
     VERRE bleu-vert, OR, ARGENT miroir, MÉTAL brossé à lames, BLANC en résille de céramique — elles renvoient le ciel, l'éclat du soleil sur
     les vitres, et sur les plus hautes un BANDEAU DE COURS qui défile (chiffres verts et ▲) ; néons verts, or, orange bitcoin ; réclames LED
     du bull run (`cryptoPubAtlas` : BTC +420 %, TO THE MOON, HODL, ATH, WAGMI…).
   · LES TAUREAUX (`cryptoTaureau`) : deux gratte-ciel en forme de taureau qui CHARGE (celui de Wall Street), en verre d'or, à côté de la
     route, tête basse vers la caisse qui arrive, cornes au ciel, les yeux LASER ; ses pattes sont des tours qui plongent dans la brume d'or.
     (2026-10-18, LE TAUREAU v2 : la pose du « Charging Bull » — tête basse et large, cornes en avant, bosse, croupe haute, queue en S —,
     une statue d'OR POLI à facettes posée sur quatre tours à gradins ; ce qu'on voit et ce qui est dur sortent de la même `taureauForme`.)
   · LE GRAPHIQUE : des rangées de BOUGIES VERTES géantes qui montent le long de la route (le cours qui grimpe, deux petites rouges pour
     le vrai), des bougies dans la forêt du lointain ; des PIÈCES ₿ GÉANTES qui tournent au-dessus du canyon (la traverser en vol paie), des
     DIAMANTS (diamond hands), des DIRIGEABLES à écran (le cours en direct), des FUSÉES « TO THE MOON » qui décollent des toits vers la
     lune, des FEUX D'ARTIFICE verts et or ; les pièces de la route frappées du ₿ (coinPeint 'B').
   · LE NOUVEL ATH : toutes les ~35 s, « NOUVEL ATH ! », le cours du bitcoin qui grimpe, une salve de feux d'artifice, et la pluie qui redouble.
   · LA PLUIE D'ARGENT v2 (`PLA`) : voir son bloc juste après.
   Lancement : une map du MODE CLASSIQUE AU HASARD (SF_CARTES.crypto, 2026-10-15) ; `?carte=crypto` / `?niveau=crypto`, `dbgNiveauCrypto(meteo)`. Console : `dbgCrypto()`. */
const MOON_DIR=new THREE.Vector3(-.52,.40,-.72).normalize(); // la lune du dôme (cielLune) — CRYPTOCITY y pose sa pièce, les fusées y vont
const CRYPTO={root:null,res:[],toits:[],taureaux:[],bougies:null,pieces:null,pInfo:[],diam:null,dInfo:[],dirig:[],fus:[],feux:null,lune:null,
  sites:null,colExtra:[],jeter:[],ath:{t:20,n:0,prix:104000},fusT:4,feuT:2.5,rf:null,tick:null,mat:{},
  uT:{value:0},uSun:{value:new THREE.Vector3().copy(SUN_DIR)},uNuit:{value:0},
  v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),m4:new THREE.Matrix4(),q:new THREE.Quaternion(),s:new THREE.Vector3(),
  ax:new THREE.Vector3(0,1,0),c:new THREE.Color()};
function cryptoOn(){return !!(LVL.cur&&LVL.cur.crypto&&!PARK.on);}
function cryptoReserve(x,z,r){const R=CRYPTO.res;for(let i=0;i<R.length;i+=3){const dx=x-R[i],dz=z-R[i+1],q=R[i+2]+r;if(dx*dx+dz*dz<q*q)return true;}return false;}
function cryptoVide(){ // (buildVoxCity, à chaque piste) ce que la ville d'avant avait de crypto s'en va avec elle
  for(const o of CRYPTO.jeter){try{if(o.isInstancedMesh)o.dispose();else if(o.geometry)o.geometry.dispose();}catch(e){}}
  CRYPTO.jeter.length=0;CRYPTO.res.length=0;CRYPTO.toits.length=0;CRYPTO.taureaux.length=0;CRYPTO.colExtra.length=0;
  CRYPTO.bougies=CRYPTO.pieces=CRYPTO.diam=null;CRYPTO.pInfo.length=0;CRYPTO.dInfo.length=0;CRYPTO.dirig.length=0;CRYPTO.sites=null;CRYPTO.root=null;
  for(const f of CRYPTO.fus){f.on=false;f.g.visible=false;f.tr.visible=false;}
  if(CRYPTO.feux){CRYPTO.feux.visible=false;for(let k=0;k<CRYPTO.feux.userData.K;k++)CRYPTO.feux.material.uniforms.uO.value[k].w=-99;}
  if(CRYPTO.lune)CRYPTO.lune.visible=false;
  crhVide(); // (2026-10-21) l'horizon et les projecteurs de la ville d'avant s'en vont aussi
}
/* LE PLAN — appelé par buildVoxCity AVANT les tours (`proches` = sa grille de la piste) : où vont les taureaux, les bougies, les pièces,
   les diamants et les dirigeables. Chaque site vérifie qu'aucun étage de la route ne le traverse (`libre`) et se RÉSERVE : les tours qui
   tomberaient dessus sont bâties puis retirées (leurs tirages ont eu lieu : la ville d'à côté ne bouge pas). */
function cryptoPlace(seed,proches){
  const cr=mulberry32(seed^0xB0117A11),S={taureaux:[],bougies:[],pieces:[],diam:[],dirig:[]},dS=L/(NP-1),iE=CITY.entree?CITY.entree[1]:0;
  CRYPTO.res.length=0;CRYPTO.rf=mulberry32(seed^0xF0E57B0);CRYPTO.sd=seed;
  const libre=function(x,z,R,y0,y1){let ok=true;proches(x,z,R,function(i){if(!ok)return;const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<R*R&&p.y>y0-45&&p.y<y1+45)ok=false;});return ok;};
  const dessous=function(x,z,R,y){let h=-1e9;proches(x,z,R,function(i){const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<R*R&&p.y<y&&p.y>h)h=p.y;});return h;};
  const cadre=function(i){const T9=T[i],hl=Math.hypot(T9.x,T9.z)||1;return {px:-T9.z/hl,pz:T9.x/hl,tx:T9.x/hl,tz:T9.z/hl};};
  const ix=function(f){return Math.min(NP-2,Math.max(iE+6,Math.floor(f*NP)));};
  // LES TAUREAUX : à 30 % et à 70 % de la piste, à ~230 m de l'axe, le ventre 70 m sous la route (le dos 120 m au-dessus, les cornes 230)
  const poseT=function(t){t.ph=cr()*6.28;S.taureaux.push(t);CRYPTO.res.push(t.x,t.z,330);const p=pts[t.i];
    for(const f of [.3,.52,.74])CRYPTO.res.push(t.x+(p.x-t.x)*f,t.z+(p.z-t.z)*f,95);}; // L'ESPLANADE : pas une tour entre le taureau et la route qu'il regarde
  for(const F0 of [.3,.7]){let rep=null,ok=false;
    for(let k=0;k<14;k++){const i=ix(F0+(cr()-.5)*.2),c=cadre(i),sg=cr()<.5?-1:1,lat=ROAD_HALF+300+cr()*80;
      const x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,yb=pts[i].y-70;
      if(cryptoReserve(x,z,330)||!libre(x,z,280,yb-20,yb+440))continue;
      const pied=Math.max(yb-820,dessous(x,z,280,yb)+70),a=.45; // la tête : vers la caisse qui arrive (−T), tournée vers la route (−sg·B)
      const hx=-c.tx*Math.cos(a)-sg*c.px*Math.sin(a),hz=-c.tz*Math.cos(a)-sg*c.pz*Math.sin(a),cap=Math.atan2(hx,hz),F9=taureauForme((pied-yb)/TAUREAU_K);
      if(!taureauLibre(F9,x,yb,z,cap,proches))continue; // (2026-10-18) la ROUTE ne passe à moins de 30 m d'AUCUNE partie du taureau — mesuré : le cercle de 280 m laissait la route à 4 m de sa tête
      const t={x:x,z:z,y:yb,pied:pied,cap:cap,F:F9,s:i*dS,i:i};
      if(pied>yb-250){if(!rep)rep=t;continue;} // (2026-10-18) une route passe juste dessous : ses pattes s'arrêteraient en moignons — on cherche une place où elles plongent, celle-ci en dernier recours
      poseT(t);ok=true;break;}
    if(!ok&&rep)poseT(rep);}
  // LE GRAPHIQUE : trois rangées de bougies qui MONTENT le long de la route (une bougie tous les ~42 m), deux petites rouges dans chaque
  for(const F0 of [.13,.5,.88]){const i0=ix(F0+(cr()-.5)*.05),sg=cr()<.5?-1:1,lat0=ROAD_HALF+115+cr()*90,pas=Math.max(1,Math.round(42/dS)),n=10+((cr()*4)|0),r1=2+((cr()*4)|0);
    let niv=pts[i0].y-150;
    for(let k=0;k<n;k++){const i=Math.min(NP-1,i0+k*pas),c=cadre(i),lat=lat0+(cr()-.5)*14,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat;
      const rouge=(k===r1||k===r1+4)&&k<n-2,h=rouge?14+cr()*16:28+cr()*52,y0=rouge?niv-h:niv,y1=y0+h,mh=12+cr()*28,mb=8+cr()*22,w=16+cr()*6;
      if(cryptoReserve(x,z,w*.75)||!libre(x,z,w*.75+4,y0-mb,y1+mh)){niv+=rouge?-h*.5:h*.7;continue;}
      S.bougies.push({x:x,z:z,y0:y0,y1:y1,mh:mh,mb:mb,w:w,rouge:rouge});CRYPTO.res.push(x,z,w*.75+3);
      niv=rouge?y0+h*.3:y1-h*.22+cr()*8;}}
  // LES PIÈCES ₿ GÉANTES : douze, de 13 à 25 m de rayon, à 40-150 m du bord, 45-155 m au-dessus de la route
  for(let k=0;k<12;k++){for(let e=0;e<4;e++){const i=ix(.07+.86*(k+cr()*.7)/12),c=cadre(i),sg=cr()<.5?-1:1,r=13+cr()*12;
      const lat=ROAD_HALF+r+40+cr()*110,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+45+cr()*110;
      if(cryptoReserve(x,z,r+6)||!libre(x,z,r+18,y-r-10,y+r+10))continue;
      S.pieces.push({x:x,y:y,z:z,r:r,a:cr()*6.28,w:(.35+cr()*.4)*(cr()<.5?-1:1),ph:cr()*6.28,cd:0});CRYPTO.res.push(x,z,r+8);break;}}
  // LES DIAMANTS (diamond hands) : huit, plus petits, plus haut
  for(let k=0;k<8;k++){for(let e=0;e<4;e++){const i=ix(.1+.8*(k+cr())/8),c=cadre(i),sg=cr()<.5?-1:1,r=6+cr()*5;
      const lat=ROAD_HALF+r+60+cr()*160,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+90+cr()*120;
      if(cryptoReserve(x,z,r+6)||!libre(x,z,r+14,y-r*1.6-10,y+r*1.6+10))continue;
      S.diam.push({x:x,y:y,z:z,r:r,a:cr()*6.28,w:.5+cr()*.6,ph:cr()*6.28});CRYPTO.res.push(x,z,r+6);break;}}
  // LES DIRIGEABLES À ÉCRAN : trois, le long de la route, au-dessus du canyon
  for(const F0 of [.24,.56,.84]){for(let k=0;k<8;k++){const i=ix(F0+(cr()-.5)*.12),c=cadre(i),sg=cr()<.5?-1:1;
      const lat=ROAD_HALF+75+cr()*80,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat,y=pts[i].y+70+cr()*50;
      if(cryptoReserve(x,z,48)||!libre(x,z,62,y-28,y+28))continue;
      S.dirig.push({x:x,y:y,z:z,cap:Math.atan2(c.tx,c.tz),ph:cr()*6.28});CRYPTO.res.push(x,z,48);break;}}
  CRYPTO.sites=S;return S;
}
// la tour (cx,cz) qu'on vient de bâtir : retirée si elle tombe sur un site ; dans la forêt, une sur huit devient une BOUGIE (rend vrai = retirée)
function cryptoTour(cx,cz,hd,b,t,canyon){
  if(cryptoReserve(cx,cz,hd))return true;
  const H=t-b;
  if(!canyon&&CRYPTO.rf()<.13&&H>160){const w=Math.max(14,Math.min(30,hd*.75)),rouge=CRYPTO.rf()<.16,y1=t-20-CRYPTO.rf()*40,y0=Math.max(b+40,y1-(rouge?50:90+CRYPTO.rf()*160));
    CRYPTO.sites.bougies.push({x:cx,z:cz,y0:y0,y1:y1,mh:14+CRYPTO.rf()*30,mb:Math.min(y0-b,30+CRYPTO.rf()*90),w:w,rouge:rouge});return true;}
  if(H>200&&CRYPTO.toits.length<1800)CRYPTO.toits.push(cx,t,cz);
  return false;
}
function cryptoColBougies(){ // les bougies sont DURES, comme les tours (villeHeurt les lit dans CITY.col)
  const X=CRYPTO.colExtra;X.length=0;if(!CRYPTO.sites)return X;
  for(const b of CRYPTO.sites.bougies){const yb=b.y0-b.mb,yt=b.y1+b.mh;X.push(b.x,(b.y0+b.y1)/2,b.z,b.w,b.y1-b.y0,b.w);X.push(b.x,(yb+yt)/2,b.z,3,yt-yb,3);}
  return X;
}
/* ---- LES MATIÈRES (partagées, jamais disposées ; compilées au menu par cryptoChauffe) ---- */
/* ===== LES FAÇADES DU BULL RUN VIVENT (2026-10-21, Sacha : « amélioration visuelle des maps », passe CRYPTO CITY) =====
   Le ciel REFLÉTÉ n'était qu'une couleur par tour (le reflet d'une façade verticale ne dépend que du regard) : plates, de près comme de loin.
   Maintenant, dans le même shader (aucun programme de plus) : (1) le reflet CHANGE DE FACE — chaud côté soleil, froid à l'opposé ;
   (2) il change D'ÉTAGE — l'horizon d'or en bas, l'azur en haut — et la façade s'assombrit, se réchauffe au pied, se refroidit au sommet ;
   (3) de larges BANDES de reflet (un nuage, la tour d'en face) glissent en diagonale ; (4) un COUP DE LUMIÈRE balaie une tour de temps en temps
   (un uniform de temps, ~25 s par tour, chacune à sa phase ; rose la nuit : le clin d'œil CASH) — absent au palier ancien ;
   (5) la nuit les bureaux ne sont plus tous or : un sur huit rose, un sur sept cyan (le trio de la marque), et un toit sur sept s'allume en rose. */
PAL.B.cryptoReflets=[0,1,1];
// LES TOURS DE VERRE — la tour de la ville (même sommet : tri hors champ, portée des lampes, pied noyé), une autre façade : le jour.
const CRYPTO_VERRE=
  '{vec3 an=abs(vNrm9);float fv=step(an.y,.5)*step(9.,min(vSc9.x,vSc9.z));'+
  'float s1=fract(vSeed9*7.13),s2=fract(vSeed9*13.71),s3=fract(vSeed9*29.37),s4=fract(vSeed9*53.17),sty=s3<.26?0.:s3<.44?1.:s3<.64?2.:s3<.80?3.:4.;'+ // (2026-10-15, Sacha) 26 % VERRE · 18 % OR · 20 % ARGENT · 16 % MÉTAL · 20 % BLANC (les mêmes seuils que la structure, dans buildVoxCity)
  'vec2 cel=vec2(1.7+s1*1.5,3.9+s2*.5),uv=(an.x>an.z?vLoc9.zy:vLoc9.xy)/cel,fw=max(fwidth(uv),vec2(1e-4));'+
  'float tt=step(.5,vNrm9.y)*step(9.,min(vSc9.x,vSc9.z)),de=min(vSc9.x*.5-abs(vLoc9.x),vSc9.z*.5-abs(vLoc9.z)),fe=max(fwidth(de),1e-4);'+
  'float ux=(an.x>an.z?vLoc9.z*sign(vNrm9.x):-vLoc9.x*sign(vNrm9.z)),fu=max(fwidth(ux),1e-4);'+ // le long de la façade, pour le bandeau
  '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+
  'if(VIS9){vec3 V9=normalize(vW9-cameraPosition);'+
  ' if(fv>0.){vec3 N9=normalize(vec3(vNrm9.x,0.,vNrm9.z)),R9=reflect(V9,N9);float ry=R9.y,hh9=clamp(vB9/max(vSc9.y,1.),0.,1.);'+
  '  gl_FragColor.rgb*=mix(vec3(.98,.88,.77),vec3(1.01,1.04,1.11),smoothstep(.04,.85,hh9));'+ // la façade : le pied chaud et sombre (le rebond de l'or du sol), le sommet clair et froid (le ciel)
  '  vec3 sky=ry>0.?mix(mix(uHor9,uMid9,smoothstep(0.,.16,ry)),uZen9,smoothstep(.12,.92,ry)):mix(uHor9*.72,vec3(.12,.11,.09),smoothstep(0.,-.28,ry));'+ // en dessous : la ville et sa brume, sombres
  '  {vec2 hz=R9.xz/max(length(R9.xz),1e-3),sz=uSun9.xz/max(length(uSun9.xz),1e-3);float sd2=dot(hz,sz)*.5+.5;'+
  '   sky=mix(sky*vec3(.88,.95,1.08),sky*vec3(1.2,1.02,.8),sd2);'+ // le ciel reflété change de FACE : chaud du côté du soleil, froid à l'opposé
  '   sky=mix(sky,mix(uHor9*1.15,uZen9*1.6+.04,smoothstep(.12,.95,hh9)),.38);'+ // …et d'ÉTAGE : l'horizon d'or en bas, l'azur en haut
  '   sky*=.86+.3*(.5+.5*sin(ux*.052+vB9*.024+s2*6.28));}'+ // …et de larges BANDES de reflet glissent en diagonale (un nuage, la tour d'en face)
  '  float lu=dot(sky,vec3(.3,.59,.11)),sd=max(dot(R9,uSun9),0.),or9=step(.5,sty)*step(sty,1.5),ag9=step(1.5,sty)*step(sty,2.5),mt9=step(2.5,sty)*step(sty,3.5),bl9=step(3.5,sty);'+
  '  float gl=mix(pow(sd,220.)*5.+pow(sd,14.)*.25,pow(sd,36.)*1.7+pow(sd,7.)*.3,mt9);'+ // l'éclat du soleil : une pointe sur le verre, une traînée large sur le métal brossé
  '  float fr=clamp((.50+.50*pow(1.-abs(dot(V9,N9)),5.))*(1.+.4*or9+.6*ag9+.25*mt9),0.,1.);vec3 rf=mix(sky,vec3(lu),.4-.28*ag9+.35*or9+.38*mt9);'+ // FRESNEL : de face l'intérieur, de biais le ciel ; l'or renvoie la LUMIÈRE du ciel ; l'ARGENT est un miroir (il garde le bleu) ; le MÉTAL brouille son reflet
  '  vec3 tint=sty<.5?vec3(.50,.84,.98):sty<1.5?vec3(1.,.74,.34):sty<2.5?vec3(.95,.98,1.04):sty<3.5?vec3(.68,.70,.76):vec3(.62,.76,.94);'+ // verre bleu-vert · or · argent · titane · le verre des tours blanches
  '  vec2 f=fract(uv),hw=vec2(mix(.41,.47,s2),mix(.40,.46,s1));if(bl9>0.)hw*=vec2(.56,.78);if(mt9>0.)hw.x*=.4;'+ // le BLANC : une résille de céramique autour de baies étroites ; le MÉTAL : des lames verticales
  '  vec2 dd=(hw-abs(f-.5))/fw;float far=smoothstep(.3,.75,max(fw.x,fw.y)),pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),4.*hw.x*hw.y,far);'+
  '  float ph=fract(sin(dot(floor(uv)+vSeed9*31.,vec2(12.9898,78.233)))*43758.5453);'+
  '  float pk=fract(ph*13.7+s4*5.3);vec3 wc=pk<.12?vec3(1.,.36,.66):pk<.27?vec3(.38,.92,1.):vec3(1.,.80,.50);'+ // les bureaux de la nuit : l'or, un peu de cyan, un peu de rose (le trio)
  '  vec3 ins=tint*(.055+.05*or9+.07*ag9)*(.7+.6*ph)+uNuit9*wc*step(.45,ph)*(.3+.5*ph)*(1.-.45*far);'+ // l'intérieur, sombre (un bureau derrière une vitre teintée) — la NUIT, les bureaux restent allumés (la ville ne dort pas pendant un bull run)
  '  vec3 glass=mix(ins,rf*tint*1.08,clamp(fr*(.82+.36*ph*(1.-far)),0.,1.))+gl*vec3(1.,.95,.8)+vec3(1.,.8,.5)*.2*step(.972,ph)*(1.-far);'+
  (PAL.b('cryptoReflets',1)?'  {float q9=ux*.5+vB9*.85,qc=-140.+fract(uT9*.038+s2*7.3+s1*3.)*(vSc9.y*.85+280.),gb=smoothstep(30.,0.,abs(q9-qc));gb*=gb;'+
  '   glass+=gb*mix(vec3(1.,.9,.7),vec3(1.,.42,.78),uNuit9)*(.45+.55*or9+.45*ag9)*(1.-.5*far);}'+'\n':'')+ // LE COUP DE LUMIÈRE : une bande diagonale qui monte le long de la tour (rose la nuit)
  '  gl_FragColor.rgb=mix(gl_FragColor.rgb,glass,pane*.93);'+
  // LE BANDEAU DE COURS : sur une tour haute sur deux, à mi-hauteur, des chiffres verts et des ▲ qui défilent
  '  if(s4>.5&&vSc9.y>150.){float bh=6.5+s2*3.,yb=vSc9.y*(.56+.24*s1),yy=vB9-yb;'+
  '   if(abs(yy)<bh*.5+.9){float ps=bh/7.,gx=(ux-uT9*(9.+s1*7.))/ps,gy=floor((yy+bh*.5)/ps),ch=floor(gx/6.),cx=floor(mod(gx,6.));'+
  '    float fl=step(abs(yy),bh*.5),cad=1.-fl;vec3 led=vec3(.004,.012,.006);'+
  '    if(fl>0.&&fu<ps*.5){float on=0.;if(mod(ch,5.)<.5){float r=gy-1.;on=step(0.,r)*step(r,4.)*step(abs(cx-2.),2.-r*.5+.01);}'+ // le ▲
  '     else on=step(cx,4.)*step(1.,gy)*step(gy,5.)*step(.42,fract(sin(dot(vec3(cx,gy,ch+vSeed9*17.),vec3(12.9898,78.233,37.719)))*43758.5453));'+
  '     led+=mix(vec3(.15,1.6,.55),vec3(1.8,1.3,.3),step(.8,fract(ch*.37+vSeed9)))*on;}'+
  '    else if(fl>0.)led+=vec3(.08,.5,.2);'+ // trop loin pour lire : la moyenne du bandeau
  '    gl_FragColor.rgb=mix(gl_FragColor.rgb,led+cad*vec3(1.,.78,.32)*.9,max(fl,cad));}}'+
  ' }'+
  // LES TOITS : le parapet allumé (menthe sur le verre, or sur l'or, blanc chaud sur l'argent, le métal et le blanc)
  ' if(tt>0.&&fe<1.4){vec3 rc=sty<.5?vec3(.3,1.,.8):sty<1.5?vec3(1.,.78,.3):vec3(1.,.95,.86);if(fract(s1*17.3+s4*3.1)<.14)rc=vec3(1.,.32,.64);gl_FragColor.rgb+=rc*tt*(1.-smoothstep(.55,.55+fe*1.5,de))*(1.-smoothstep(.5,1.4,fe))*.75;}'+
  '}}\n';
function cryptoPied(){const s9=villePied(function(c){return c;});return s9.split('uPiedC9*uPied9').join('vec3(.05,.04,0.)').split('vec3(.16,.04,.2)*uPied9').join('vec3(.05,.04,0.)').split('vec3(.16,.04,.2)').join('vec3(.05,.04,0.)');} // le pied dans la brume d'or (la lueur violette des rues de la ville la nuit n'a rien à faire ici)
function cryptoMatToursLoin(){ // la tour AU LOIN (voir villeMatToursLoin) : la couleur de la brume, le pied doré
  if(CRYPTO.mat.toursL)return CRYPTO.mat.toursL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uWet9=ROAD_U.uWet;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vB9;varying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvB9=(position.y+.5)*length(instanceMatrix[1].xyz);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvB9=position.y+.5;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWet9;varying float vB9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+cryptoPied());};
  m.customProgramCacheKey=function(){return 'toursLoinCrypto';};m.dispose=function(){};
  CRYPTO.mat.toursL=m;return m;
}
function cryptoMatTours(){
  if(CRYPTO.mat.tours)return CRYPTO.mat.tours;
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x0c0a06});
  m.extensions={derivatives:true};
  const DECL='varying vec3 vLoc9;varying vec3 vNrm9;varying float vB9;varying float vSeed9;varying vec3 vSc9;varying vec3 vW9;';
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CITY.uT,uWet9:ROAD_U.uWet,uLum9:CITY.uL,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,uSun9:CRYPTO.uSun,uNuit9:CRYPTO.uNuit});
    sh.vertexShader='#undef USE_SHADOWMAP\n'+sh.vertexShader.replace('#include <common>','#include <common>\n'+DECL+'\nuniform vec4 uLum9[4];\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vec3 sc9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));'+
        'vSeed9=fract(instanceMatrix[3].x*.0131+instanceMatrix[3].z*.0173);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvec3 sc9=vec3(1.);vSeed9=0.;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n'+
        'vLoc9=position*sc9;vNrm9=normal;vB9=(position.y+.5)*sc9.y;vSc9=sc9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+VILLE_TRI+
        '#ifdef USE_INSTANCING\nbool proche9=false;{vec3 w9=(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;float r9=.5*length(sc9)+1.;'+
        'for(int i=0;i<4;i++)if(distance(w9,uLum9[i].xyz)<uLum9[i].w+r9)proche9=true;}\n#else\nbool proche9=true;\n#endif\n')
      .replace('#include <lights_lambert_vertex>','vLightFront=vec3(0.);vIndirectFront=vec3(0.);\nif(!loin9){\n'+VILLE_LLV+'\n}');
    sh.fragmentShader='#undef USE_SHADOWMAP\n'+sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uWet9,uNuit9;uniform vec3 uZen9,uMid9,uHor9,uSun9;'+DECL)
      .replace('#include <fog_fragment>',CRYPTO_VERRE+'#include <fog_fragment>\n'+cryptoPied());};
  m.customProgramCacheKey=function(){return 'toursCrypto2';};m.dispose=function(){};
  CRYPTO.mat.tours=m;return m;
}
/* LES RÉCLAMES DU BULL RUN : seize écrans LED (la police du jeu ; ▲, ₿, Ξ, fusée, taureau, diamant, bougies dessinés au pinceau) —
   OPAQUES (en plein jour l'additif de la ville la nuit ne se voyait plus), balayage et glitch comme les réclames de la ville. */
function cryptoPicto(x,k,cx,cy,s,col){x.save();x.translate(cx,cy);x.fillStyle=x.strokeStyle=col;x.lineWidth=s*.12;x.lineJoin='round';
  const tri=function(px,py,r){x.beginPath();x.moveTo(px,py-r);x.lineTo(px+r,py+r*.8);x.lineTo(px-r,py+r*.8);x.closePath();x.fill();};
  if(k==='up'){tri(0,0,s*.55);}
  else if(k==='btc'){x.beginPath();x.arc(0,0,s*.55,0,6.283);x.fill();x.fillStyle='#08130c';x.font=Math.round(s*.6)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('B',s*.03,s*.04);
    x.fillRect(-s*.16,-s*.47,s*.08,s*.16);x.fillRect(s*.04,-s*.47,s*.08,s*.16);x.fillRect(-s*.16,s*.3,s*.08,s*.16);x.fillRect(s*.04,s*.3,s*.08,s*.16);}
  else if(k==='eth'){x.beginPath();x.moveTo(0,-s*.6);x.lineTo(s*.36,0);x.lineTo(0,s*.18);x.lineTo(-s*.36,0);x.closePath();x.fill();x.beginPath();x.moveTo(-s*.36,s*.1);x.lineTo(0,s*.3);x.lineTo(s*.36,s*.1);x.lineTo(0,s*.6);x.closePath();x.fill();}
  else if(k==='fusee'){x.rotate(.6);x.beginPath();x.moveTo(0,-s*.62);x.quadraticCurveTo(s*.22,-s*.3,s*.18,s*.3);x.lineTo(-s*.18,s*.3);x.quadraticCurveTo(-s*.22,-s*.3,0,-s*.62);x.fill();
    x.fillRect(-s*.32,s*.12,s*.14,s*.26);x.fillRect(s*.18,s*.12,s*.14,s*.26);x.fillStyle='#ff9a2e';x.beginPath();x.moveTo(-s*.12,s*.34);x.lineTo(0,s*.7);x.lineTo(s*.12,s*.34);x.fill();}
  else if(k==='taureau'){x.beginPath();x.ellipse(0,s*.08,s*.42,s*.3,0,0,6.283);x.fill();x.lineWidth=s*.11;x.beginPath();x.moveTo(-s*.3,-s*.08);x.quadraticCurveTo(-s*.7,-s*.2,-s*.56,-s*.62);x.stroke();
    x.beginPath();x.moveTo(s*.3,-s*.08);x.quadraticCurveTo(s*.7,-s*.2,s*.56,-s*.62);x.stroke();x.fillStyle='#ff2a2a';x.fillRect(-s*.2,-s*.02,s*.1,s*.08);x.fillRect(s*.1,-s*.02,s*.1,s*.08);}
  else if(k==='diam'){x.beginPath();x.moveTo(-s*.5,-s*.2);x.lineTo(-s*.25,-s*.5);x.lineTo(s*.25,-s*.5);x.lineTo(s*.5,-s*.2);x.lineTo(0,s*.6);x.closePath();x.fill();
    x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=s*.04;x.beginPath();x.moveTo(-s*.5,-s*.2);x.lineTo(s*.5,-s*.2);x.moveTo(-s*.12,-s*.5);x.lineTo(-s*.2,-s*.2);x.lineTo(0,s*.6);x.moveTo(s*.12,-s*.5);x.lineTo(s*.2,-s*.2);x.lineTo(0,s*.6);x.stroke();}
  else if(k==='bougies'){for(let i=0;i<5;i++){const h=s*(.22+i*.14),px=-s*.5+i*s*.25;x.fillRect(px-s*.07,s*.5-h-s*.08*i,s*.14,h);x.fillRect(px-s*.015,s*.5-h-s*.08*i-s*.1,s*.03,h+s*.2);}}
  else if(k==='lune'){x.beginPath();x.arc(0,0,s*.5,0,6.283);x.fill();x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.arc(-s*.15,-s*.1,s*.11,0,6.283);x.arc(s*.18,s*.16,s*.08,0,6.283);x.fill();}
  x.restore();}
function cryptoPubAtlas(){
  if(CRYPTO.mat.pubT)return CRYPTO.mat.pubT;
  const C=256,cv=document.createElement('canvas');cv.width=2048;cv.height=1024;const x=cv.getContext('2d'); // (2026-10-15) 8 × 4 écrans
  const PUB=[['BTC','#3dff9a','#03170c','+420 %','up'],['TO THE MOON','#ffd75e','#140c3a','NEXT STOP','fusee'],['HODL','#7df9ff','#2a0c4a','DIAMOND HANDS','diam'],['ATH','#3dff9a','#062014','ALL TIME HIGH','up'],
    ['BULL RUN','#ffd75e','#0b3a1c','GREEN ONLY','taureau'],['WAGMI','#ffffff','#0f7a3a','WE ALL MAKE IT','up'],['100X','#ffd75e','#3a1206','LEVIER MAX','up'],['ETH','#d8e2ff','#2b1d6e','+69 %','eth'],
    ['LAMBO','#ffe23e','#0a0a0a','WEN ? NOW.','up'],['PUMP','#3dff9a','#0c0c18','IT. ALWAYS.','bougies'],['GM','#ff9a2e','#1a0f04','GOOD MORNING','btc'],['$1 000 000','#ffd75e','#08130c','1 BTC','btc'],
    ['NUMBER','#3dff9a','#03170c','GO UP','bougies'],['CASH CAR','#ffd75e','#b0106a','LA CAISSE QUI PAIE','btc'],['BUY','#3dff9a','#062014','QUEL DIP ?','up'],['MOON','#ffffff','#0d1640','MISSION','lune'],
    /* (2026-10-15, Sacha : « pleine de références à la token culture, à l'argent et à la tech ») seize de plus */
    ['NFT','#ff6ad5','#1a0630','JPEG MILLIONAIRE','diam'],['SATOSHI','#ffb347','#1a0f04','NAKAMOTO','btc'],['WEB3','#7df9ff','#04162a','THE FUTURE','up'],['DEFI','#3dff9a','#062014','APY 1000 %','bougies'],
    ['AIRDROP','#ffd75e','#0d1640','FREE TOKENS','fusee'],['STAKE','#3dff9a','#03170c','APY 420 %','up'],['WHALE','#7df9ff','#0a1a3a','10 000 BTC','btc'],['FOMO','#ff9a2e','#2a0a04','BUY NOW','up'],
    ['DOGE','#ffd75e','#3a2a06','MUCH WOW','lune'],['DAO','#d8e2ff','#2b1d6e','VOTE ON-CHAIN','eth'],['GAS 0','#3dff9a','#062014','GWEI','eth'],['AI','#7df9ff','#08102a','SUPERCYCLE','diam'],
    ['MINING','#ffb347','#14100a','HASHRATE ATH','bougies'],['LFG','#3dff9a','#03170c','LETS GO','fusee'],['SER','#ffffff','#0f7a3a','PROBABLY NOTHING','up'],['1 BTC','#ffd75e','#08130c','= 1 BTC','btc']];
  pubLangue(PUB); // les réclames parlent la langue du joueur
  PUB.forEach(function(p,k){const ox=(k%8)*C,oy=((k/8)|0)*C;
    const g=x.createLinearGradient(0,oy,0,oy+C);g.addColorStop(0,p[2]);g.addColorStop(1,'#020304');x.fillStyle=g;x.fillRect(ox+6,oy+6,C-12,C-12);
    x.strokeStyle=p[1];x.lineWidth=6;x.strokeRect(ox+12,oy+12,C-24,C-24);x.globalAlpha=.35;x.lineWidth=2;x.strokeRect(ox+24,oy+24,C-48,C-48);x.globalAlpha=1;
    cryptoPicto(x,p[4],ox+C/2,oy+C*.3,C*.3,p[1]);
    x.fillStyle=p[1];x.textAlign='center';x.textBaseline='middle';
    const fz=Math.min(40,Math.floor((C-44)/Math.max(3,p[0].length)));x.font=fz+'px "Press Start 2P",monospace';x.fillText(p[0],ox+C/2,oy+C*.62);
    x.font='12px "Press Start 2P",monospace';x.fillStyle='#ffffff';x.fillText(p[3],ox+C/2,oy+C*.8);
    if(p[4]==='up'||p[4]==='bougies'){x.fillStyle=p[1];x.globalAlpha=.6;for(let i=0;i<7;i++)x.fillRect(ox+30+i*28,oy+C-34-i*3,16,6+i*3);x.globalAlpha=1;}});
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=4;texLibere(t); // (2026-10-14, passe perf mobile) — (2026-10-15) 2048 × 1024 : 8 Mo, rendus après l'envoi
  CRYPTO.mat.pubT=t;return t;
}
function cryptoMatPub(){
  if(CRYPTO.mat.pub)return CRYPTO.mat.pub;
  const m=new THREE.MeshBasicMaterial({map:cryptoPubAtlas(),side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CITY.uT;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT9;varying float vS9;')
      .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\n'+
        'vS9=fract(instanceMatrix[3].x*.0713+instanceMatrix[3].z*.0419+instanceMatrix[3].y*.017);float c9=floor(vS9*32.);'+
        'float gl9=step(.95,fract(uT9*(.3+vS9*.4)+vS9*9.))*(fract(sin(floor(uT9*12.)+vS9*50.)*43.7)-.5)*.3;'+
        'vUv=(vec2(clamp(vUv.x+gl9,0.,1.),vUv.y)*.97+.015+vec2(mod(c9,8.),3.-floor(c9/8.)))/vec2(8.,4.);\n#else\nvS9=0.;\n#endif');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9;varying float vS9;')
      .replace('#include <fog_fragment>','gl_FragColor.rgb*=(.86+.14*step(.5,fract(gl_FragCoord.y*.25-uT9*6.)))*(1.25+.15*sin(uT9*(3.+vS9*4.)));\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'pubsCrypto2';};m.dispose=function(){};
  CRYPTO.mat.pub=m;return m;
}
// LES BOUGIES : un prisme de verre qui s'allume du bas vers le haut, ses arêtes plus claires, des données qui montent dedans
function cryptoMatBougie(){
  if(CRYPTO.mat.bougie)return CRYPTO.mat.bougie;
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CRYPTO.uT;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vL9,vN9,vC9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvC9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\n#else\nvC9=vec3(1.);\n#endif\nvL9=position*vC9;vN9=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9;varying vec3 vL9,vN9,vC9;')
      .replace('#include <fog_fragment>','{vec3 an=abs(vN9);vec2 p=an.y>.5?vL9.xz:(an.x>an.z?vL9.zy:vL9.xy),hs=an.y>.5?vC9.xz*.5:(an.x>an.z?vC9.zy:vC9.xy)*.5;'+
        'vec2 e=hs-abs(p),fe=max(fwidth(p),vec2(1e-3));float ar=1.-smoothstep(0.,max(fe.x,fe.y)*2.5+.6,min(e.x,e.y));'+
        'float h=clamp(vL9.y/vC9.y+.5,0.,1.),sc=smoothstep(.9,1.,fract(vL9.y*.03-uT9*.3))*step(9.,vC9.x),me=step(vC9.x,5.);'+ // me : la MÈCHE (pleine lumière)
        'float k9=mix((.16+.30*h+.22*sc)+1.25*ar+.7*step(.5,an.y),1.,me);gl_FragColor.rgb*=k9;}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'bougiesCrypto1';};m.dispose=function(){};
  CRYPTO.mat.bougie=m;return m;
}
