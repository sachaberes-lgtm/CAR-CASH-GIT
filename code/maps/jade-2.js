/* ---- LA MATIÈRE : des CUBES de pierre réaliste ---- */
const JADE_VR_VS=[
  'attribute float aM,aAO;attribute vec4 aJ;varying vec3 vW,vO,vN,vNo;varying float vM,vAO;varying vec4 vJ;',
  '#include <fog_pars_vertex>',
  'void main(){',
  '#ifdef USE_INSTANCING',
  '  mat4 mw=modelMatrix*instanceMatrix;',
  '#else',
  '  mat4 mw=modelMatrix;',
  '#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vO=position;vNo=normal;vN=normalize(mat3(mw)*normal);vM=aM;vAO=aAO;vJ=aJ;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;',
  '#include <fog_vertex>',
  '}'].join('\n');
const JADE_VR_FS=[
  'uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillD,uFillC,uMist,uGhost,uCielH,uCielZ,uRocT,uVerT;uniform float uMerY,uBump,uTime,uEcart,uSous;',
  'varying vec3 vW,vO,vN,vNo;varying float vM,vAO;varying vec4 vJ;',
  '#include <fog_pars_fragment>',
  'float rh(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}',
  'float rn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  '  return mix(mix(mix(rh(i),rh(i+vec3(1,0,0)),f.x),mix(rh(i+vec3(0,1,0)),rh(i+vec3(1,1,0)),f.x),f.y),',
  '             mix(mix(rh(i+vec3(0,0,1)),rh(i+vec3(1,0,1)),f.x),mix(rh(i+vec3(0,1,1)),rh(i+vec3(1,1,1)),f.x),f.y),f.z);}',
  JADE_ONDE,'uniform float uEauT;',JADE_EAU_GLSL,
  'void main(){',
  '  float wl9=vW.y-(uMerY+jMerH(floor(vW.xz/JMS))*JMS);if(uSous<.5?wl9<0.:wl9>0.)discard;',     // (2026-10-13) l objectif SOUS l eau : le pied immergé, plus rien au-dessus (la peau de l eau le cache)     // (v17) SOUS L EAU, plus rien : la mer du ciel prend la place
  '#ifdef PREPASS',
  '  gl_FragColor=vec4(1.);return;',                                                // la profondeur de la face la plus proche (rien à peindre)
  '#endif',
  '  vec3 an=abs(vNo);vec2 uv=an.x>.5?vO.zy:(an.y>.5?vO.xz:vO.xy),f=fract(uv);',   // la face du cube (en cubes)
  '  vec3 vox=floor(vO-vNo*.5+.001),Ng=normalize(vN),p=vW+vJ.x*137.;',
  '  float hC=rh(vox+vJ.x*31.);',                                                   // CHAQUE PETIT CUBE sa nuance (légère : une mosaïque, pas un carrelage)
  // les champs de la roche réaliste (monde, continus d un bloc à l autre) : coulées, rugosité, fissures nettes
  '  float st=rn(vec3(p.x*.24,p.y*.022,p.z*.24)),rg=rn(p*.11)*.5+rn(p*.27)*.3+rn(p*.65)*.2;',
  '  float fv=pow(1.-abs(2.*rn(vec3(p.x*.13,p.y*.028,p.z*.13)+19.)-1.),13.);',
  '  float h=st*.35+rg*.4-fv*.4;',                                                  // (v7) plus de JOINT dessiné entre les blocs : c était le carrelage de Minecraft
  '  float pxs=length(fwidth(vW)),dF=1.-smoothstep(1.,6.,pxs);',
  '  vec3 dpx=dFdx(vW),dpy=dFdy(vW);float dhx=dFdx(h),dhy=dFdy(h);',              // ⚠ dérivées hors de toute branche
  '  vec3 r1=cross(dpy,Ng),r2=cross(Ng,dpx);float de=dot(dpx,r1);',
  '  vec3 N=normalize(abs(de)*Ng-sign(de)*(dhx*r1+dhy*r2)*uBump*dF);',
  '  int m=int(vM+.5);vec3 alb;',
  '  vec3 roc=mix('+('vec3(.45,.55,.51),vec3(.33,.41,.39)')+',rn(p*.011+3.));roc=mix(roc,vec3(.56,.51,.44),smoothstep(.62,.9,rn(vec3(vJ.x*9.,p.y*.03,1.)))*.4);',
  '  roc*=mix(.45,1.,smoothstep(.1,.6,st))*(.93+.14*hC)*uRocT;',
  '  float hv=smoothstep(uMerY-20.,uMerY+380.,vW.y);',
  '  if(m==1||m==2){alb=roc*mix(.94,'+('.88+.14*rg')+',dF)*(1.-fv*.42*dF);',
  '    if(m==2)alb=mix(alb,vec3(.52,.37,.27)*(.85+.3*rg),.6);',
  '    alb=mix(alb,vec3(.74,.74,.64),step(.935,rn(p*.85))*dF*.4);',               // le lichen
  '    float mo=max(step(.5,Ng.y)*smoothstep(.3,.62,rn(p*.13)),smoothstep(.6,.78,rn(p*.05+11.)*.7+(1.-st)*.3)*hv*(1.-smoothstep(.4,.95,vAO))*.8)*vJ.y;',
  '    alb=mix(alb,mix(vec3(.09,.16,.07),vec3(.22,.32,.12),rn(p*.4))*uVerT,mo);}',      // la mousse
  '  else if(m==3){vec3 g=mix(vec3(.11,.24,.06),vec3(.25,.40,.10),rn(p*.35))*(.82+.32*rg)*uVerT,r9=roc*mix(.94,.82+.3*rg,dF);', // l HERBE : sur le dessus seulement, en PLAQUES de mousse sur la pierre (la frange sur les côtés et la dalle verte unie, c était le bloc d herbe de Minecraft)
  '    alb=Ng.y>.5?mix(r9,g,smoothstep(.38,.62,rn(p*.09+5.)*.7+rn(p*.5)*.3)):r9;}',
  '  else if(m==4)alb=mix(vec3(.07,.14,.06),vec3(.19,.30,.11),rn(p*.6))*(.7+.45*rn(p*1.9))*uVerT;', // les FEUILLES
  '  else if(m==5)alb=vec3(.27,.20,.15)*(.85+.3*rg);',
  '  else if(m==6)alb=vec3(.55,.13,.09);else if(m==7)alb=vec3(.16,.19,.19);else if(m==8)alb=vec3(.86,.66,.30);else if(m==10)alb=roc*.75;else alb=vec3(.62,.60,.55)*(.9+.2*rg);',
  '  vec3 V=normalize(cameraPosition-vW);',
  '  float cav=mix(.3,1.,vAO)*mix(.6,1.,smoothstep(.05,.5,h)),dif=max((dot(N,uSunDir)+.12)/1.12,0.);',
  '  vec3 col=alb*(mix(uGnd,uSky,N.y*.5+.5)*cav*.85+uSunC*dif*mix(.5,1.,cav)*.85+uFillC*max(dot(N,-uFillD),0.)*cav);', // (v7) le soleil un cran plus doux : les grandes faces au soleil sortaient crème
  // LE VERRE DE JADE (v6, Léo : « je parlais de la transparence des CUBES qui font la montagne ; c est trop clair là ») : chaque bloc est une
  // brique de jade teinté — on voit au travers les blocs de derrière, l autre face de la montagne et ses plans intérieurs (matière 10), assombris
  // et verdis ; les arêtes des cubes absorbent plus (on lit les blocs). Une lueur discrète au contre-jour et dans les joints, rien de plus.
  '  float nv=abs(dot(Ng,V)),rim=pow(1.-nv,2.5),tr=pow(max(dot(-V,uSunDir),0.),3.)*(1.-max(dot(Ng,uSunDir),0.));',
  '  vec3 ir9=mix(vec3(1.,.58,.90),vec3(.50,.95,1.),.5+.5*sin(nv*8.+vW.y*.012+vJ.x*6.));col+=ir9*(rim*.13+tr*.16)*vJ.y;',     // (v17) FÉERIQUE : le bord du verre s irise (rose ↔ turquoise selon l angle)
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm*hm*(3.-2.*hm));',
  '  float fo=0.;',
  '#ifdef USE_FOG',
  '  fo=smoothstep(fogNear,fogFar,fogDepth);',
  '#endif',
  '  float sg9=pow(max(0.,sin(uEauT*1.7+dot(vW.xz,vec2(.023,.019))+vJ.x*23.)),3.),fe9=1.-smoothstep(0.,5.+14.*sg9,wl9+4.*rh(floor(vW*.5)));',  // (v17) LA VAGUE QUI FRAPPE : l écume au ras de l eau, qui monte par à-coups
  '  fe9*=step(.22-.18*sg9,rh(floor(vW*.85)+floor(uEauT*5.)));col=mix(col,vec3(.98,.97,1.)*(uSunC*.5+uSky*.65),fe9*.95);',
  '  float opB=m==4?.9:m==3?.88:m==2?.76:m==10?.13:m>=5?.95:.72,op=opB*(1.-fo);op=mix(op,0.,hm*.85);op=max(op,fe9*.92*(1.-fo));', // l OPACITÉ du bloc (la brume l efface au loin)
  '#ifdef VITRAIL',                                                                // (v10) LES ÉCAILLES : opaques, écartées (la lumière du cœur passe par les joints)
  '  if(m==10)discard;float dd=length(vW-cameraPosition),e9=min(min(f.x,1.-f.x),min(f.y,1.-f.y)),jw=(1.-uEcart)*.5*(1.-smoothstep(70.,160.,dd));',
  '  float on=exp(-pow((vW.y-onde(vJ.x))/16.,2.));vec3 gl=vec3(.50,.95,.78);',
  'col=mix(col,mix(uCielH,uCielZ,.5),pow(1.-nv,3.)*.35);',                     // le verre par-dessus : le ciel en rasant
  '#ifdef JOINT_LUM',
  '  col=mix(col,col*vec3(.72,.98,.90),.65);col=mix(col,gl*(.30+1.1*on),smoothstep(jw+.012,jw*.4,e9)*dF*dF*.45*(1.-smoothstep(40.,110.,dd)));',              // l arche, le pont : rien derrière, le joint EST la lumière
  '#else',
  '  if(e9<jw)discard;',                                                             // le joint : on voit le cœur
  '  {float fd=smoothstep(170.,125.,dd);if(fd<1.&&fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))>fd)discard;}', // l apparition, en fondu tramé
  '#endif',
  '  col+=gl*smoothstep(.10,0.,e9-jw)*(.10+1.4*on)*dF;',                             // les arêtes s allument au passage de l onde
  '#ifdef USE_FOG','  col=mix(col,fogColor,fo);','#endif','  gl_FragColor=vec4(col,1.);',
  '#elif defined(OPAQUE)',                                                          // (v17) LE LOIN, en une passe : le verre deviné (le fond pris dans la brume)
  '  float oq=max(mix(opB,0.,hm*.85),fe9*.92);vec3 Tq=vec3(1.-oq)*mix(vec3(1.),vec3(.52,.78,.64),oq),bq=uMist;',
  '#ifdef USE_FOG','  bq=fogColor;','#endif',
  '  vec3 cq=col*oq*.6+bq*Tq;',
  '#ifdef USE_FOG','  cq=mix(cq,fogColor,fo);','#endif',
  '  gl_FragColor=vec4(cq,1.);',
  '#elif defined(PASSE_M)',
  '  vec3 Tr=vec3(1.-op)*mix(vec3(1.),vec3(.52,.78,.64),op);', // ce qu on voit À TRAVERS : assombri, verdi
  '  if(!gl_FrontFacing&&m!=10)Tr=mix(vec3(1.),Tr,.8);',
  '  gl_FragColor=vec4(Tr,1.);',
  '#else',
  '  gl_FragColor=vec4(col*op*.6,1.);',                                                 // la LUMIÈRE de la face la plus proche (une seule : la profondeur l a gardée)
  '#endif',
  '}'].join('\n');
/* LE VERRE SANS DÉSORDRE (v6) — trois passes, aucun tri :
   1. l'ABSORPTION (renderOrder 2) : TOUTES les couches (faces avant, de dos, plans intérieurs, montagnes derrière) multiplient le fond par ce
      qu'elles laissent passer — assombri, verdi, l'arête plus sombre : on voit les cubes qui font la montagne, en ombres dans le verre ;
   2. la PROFONDEUR de la face avant la plus proche (renderOrder 2.5, sans couleur) ;
   3. la LUMIÈRE (renderOrder 3) : seule cette face-là ajoute sa lumière (la profondeur a écarté les autres) — rien ne s'additionne en lueur.
   Pour une couche c'est l'exact « fond × (1 − α) + bloc × α ». La brume de three n'est pas appliquée telle quelle : c'est l'OPACITÉ qui
   s'éteint au loin (le fond reprend sa place). La brume, les cascades, les rayons passent après : derrière une montagne, la profondeur les cache. */
function jadeVRMat(k){if(k==='V'||k==='VM'){const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uBump:JADE_BUMP,uEcart:JADE_VIT_U.uEcart,uCielH:JADE_VIT_U.uCielH,uCielZ:JADE_VIT_U.uCielZ}),defines:k==='V'?{VITRAIL:''}:{VITRAIL:'',JOINT_LUM:''},
    vertexShader:JADE_VR_VS,fragmentShader:JADE_VR_FS,fog:true,extensions:{derivatives:true},side:THREE.FrontSide});m.dispose=function(){};return m;} // (v10) les ÉCAILLES du vitrail : opaques, une passe
  const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uBump:JADE_BUMP,uEcart:JADE_VIT_U.uEcart,uCielH:JADE_VIT_U.uCielH,uCielZ:JADE_VIT_U.uCielZ}),defines:k==='O'?{OPAQUE:''}:k==='M'?{PASSE_M:''}:k==='P'?{PREPASS:''}:{},
    vertexShader:JADE_VR_VS,fragmentShader:JADE_VR_FS,fog:true,extensions:{derivatives:true},transparent:k!=='O',depthWrite:k==='P'||k==='O',colorWrite:k!=='P',side:k==='M'?THREE.DoubleSide:THREE.FrontSide,
    blending:k==='M'?THREE.MultiplyBlending:k==='A'?THREE.AdditiveBlending:THREE.NormalBlending});
  if(k==='A'){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;}m.dispose=function(){};return m;}
const JADE_BUMP={value:6};
const JADE_M={vrO:null,vrOM:null,vr:null,vrM:null,vrX:null,vrXM:null,vrP:null,vrPM:null,col:null,arb:null,vit:null,vitM:null,peau:null,coeur:null};
function jadeMats(){if(!JADE_M.vr){JADE_M.vr=jadeVRMat('A');JADE_M.vrO=jadeVRMat('O');JADE_M.vrOM=jadeVRMat('O');JADE_M.vrM=jadeVRMat('A');JADE_M.vrX=jadeVRMat('M');JADE_M.vrXM=jadeVRMat('M');JADE_M.vrP=jadeVRMat('P');JADE_M.vrPM=jadeVRMat('P'); // vr : en instances · vrM : un maillage seul (la muraille, l'arche) — un programme chacun
    JADE_M.col=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U),vertexShader:JADE_COL_VS,fragmentShader:JADE_COL_FS,fog:true});JADE_M.col.dispose=function(){};
    JADE_M.arb=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),JADE_U,{uTex:{value:jadeArbresTex()}}),vertexShader:JADE_ARB_VS,fragmentShader:JADE_ARB_FS,fog:true,side:THREE.DoubleSide});JADE_M.arb.dispose=function(){};}
  return JADE_M;}
/* LES GABARITS : bâtis une fois par session — dix montagnes, trois rochers flottants (à la suite : `JADE_NTPL` les sépare), les temples */
/* LES GABARITS TAILLÉS AU MENU (2026-10-14, session OPTIMISATION — passation perf n° 2 : « JOUER ~1,0-1,3 s : 1 280 ms de JavaScript dans le
   fn() du volet »). MESURÉ (profil, PC, palier 0) : le volet du JOUER figeait 641 ms, dont 389 ms pour jadeGabarits — les gabarits de la jade,
   taillés « une fois par session, sous le voile » quel que soit le niveau tiré. Ce sont déjà des générateurs à échéance (voxPilierG, voir LES
   TRANCHES) : au MENU, une fois la chauffe finie (CHAUFFE_R.fait), hors volet et hors lâcher, jadeGabFond en taille quelques ms par image
   (gabFondMs). Un JOUER qui arrive avant la fin les finit d'un trait (jadeGabarits) là où elles en sont : les mêmes gabarits au bit près (le
   hasard de chacune est sa graine, une tranche ne fait que suspendre). `ms` = le travail cumulé. dbgGabarits() : l'état. */
PAL.B.gabFondMs=[5,6,8];
const GAB_FOND={it:null,ms:0,n:0,fini:false,sync:0};
function* jadeGabaritsG(){const p=[];
  for(let k=0;k<JADE_TPL.length;k++){const q=JADE_TPL[k];p.push(yield* voxPilierG(q[0]/VX,Math.round(q[1]/VX),q[2],0x51A0+k*131));}
  for(let v=0;v<3;v++)p.push(yield* voxPilierG((6.5+v*2.2)/VX,Math.round((20+v*7.5)/VX),v%3,0xCA11+v*71)); // les ROCHERS qui flottent (6,5-11 m, 20-35 m)
  if(performance.now()>JF.lim)yield;
  return {p:p,pag:jadeTempleGeo(5),pav:jadeTempleGeo(1),arbreQ:new THREE.PlaneGeometry(1,1),ms:0};}
function jadeGabarits(){if(JADE.geos)return JADE.geos;
  const t0=performance.now(),it=GAB_FOND.it||jadeGabaritsG(),l0=JF.lim;GAB_FOND.it=null;GAB_FOND.fini=true;JF.lim=Infinity;
  try{const g=jadeFini(it);GAB_FOND.sync=performance.now()-t0;GAB_FOND.ms+=GAB_FOND.sync;g.ms=Math.round(GAB_FOND.ms);JADE.geos=g;}finally{JF.lim=l0;}
  return JADE.geos;}
function jadeGabFond(){ // une tranche par image, au menu (voir LES GABARITS TAILLÉS AU MENU)
  if(JADE.geos||GAB_FOND.fini||(started&&!gameOver)||!CHAUFFE_R.fait||ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go))return;
  const t=performance.now(),l0=JF.lim;if(!GAB_FOND.it)GAB_FOND.it=jadeGabaritsG();JF.lim=t+PAL.b('gabFondMs',6);chauffeGrace(); // (la qualité auto ne lit pas une tranche comme une faiblesse)
  let r;try{r=GAB_FOND.it.next();}catch(e){GAB_FOND.it=null;GAB_FOND.fini=true;console.warn('gabarits',e);return;}finally{JF.lim=l0;GAB_FOND.ms+=performance.now()-t;GAB_FOND.n++;}
  if(r.done){GAB_FOND.it=null;GAB_FOND.fini=true;r.value.ms=Math.round(GAB_FOND.ms);JADE.geos=r.value;}}
window.dbgGabarits=function(){return {pret:!!JADE.geos,tranches:GAB_FOND.n,msTravail:Math.round(GAB_FOND.ms),msFinSurPlace:Math.round(GAB_FOND.sync),enCours:!!GAB_FOND.it};}; // (banc)
function jadeTplDe(r){let bi=0,bd=1e9;for(let k=0;k<JADE_NTPL;k++){const d=Math.abs(JADE_TPL[k][0]-r);if(d<bd){bd=d;bi=k;}}return bi;}
/* ---- LA MATIÈRE DES TEMPLES (couleur par sommet, lumière du niveau, brume) ---- */
const JADE_COL_VS=['attribute vec3 aCol;attribute vec4 aJ;varying vec3 vW,vN,vC;','#include <fog_pars_vertex>','void main(){',
  '#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(mw)*normal);vC=aCol;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const JADE_COL_FS=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uMist;uniform float uMerY;varying vec3 vW,vN,vC;','#include <fog_pars_fragment>','void main(){',
  '  vec3 N=normalize(vN);float dif=max((dot(N,uSunDir)+.15)/1.15,0.);vec3 col=vC*(mix(uGnd,uSky,N.y*.5+.5)+uSunC*dif);',
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* ---- LA FORÊT PEINTE : une planche de 8 dessins (4 × 2) — cinq pins du Huangshan (tronc tordu, plateaux d'aiguilles en nuages), trois
   touffes de feuillus. Chaque dessin : des centaines de touches (ombre dessous, lumière dessus), un alpha franc. ---- */
function jadeArbresTex(){const W=256,cv=document.createElement('canvas');cv.width=W*4;cv.height=W*2;const c=cv.getContext('2d'),rg=mulberry32(0xA7B3);
  const touche=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();};
  const vert=(l,k)=>{const a=[[18,34,18],[27,48,25],[40,66,32],[56,84,40],[74,100,48]][Math.min(4,Math.max(0,l))];const v=k||1;return 'rgb('+Math.round(a[0]*v)+','+Math.round(a[1]*v)+','+Math.round(a[2]*v)+')';};
  for(let n=0;n<8;n++){const ox=(n%4)*W,oy=Math.floor(n/4)*W;c.save();c.translate(ox,oy);c.beginPath();c.rect(0,0,W,W);c.clip();
    if(n>=6){ // LA LIANE (peinte « à l'envers » : posée la tête en bas, elle pend sous la montagne)
      for(let k=0;k<14;k++){let x=20+rg()*(W-40),y=W;const L=90+rg()*150,dx=(rg()-.5)*.5;c.strokeStyle=vert(1,.7);c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);
        for(let q=0;q<L;q+=6){x+=dx*3+(rg()-.5)*2;y-=6;c.lineTo(x,y);}c.stroke();
        for(let q=0;q<L;q+=3){const yy=W-q,xx=x-(L-q)*dx*.5;touche(xx+(rg()-.5)*10,yy,1.5+rg()*2.8*(1-q/L*.6),vert(q<L*.3?2:1,.75+rg()*.4));}}
    }else if(n<4){ // LE PIN : un tronc qui se tord, des branches presque horizontales, des plateaux d'aiguilles
      let x=W/2+(rg()-.5)*20,y=W-2;const pts=[[x,y]],dx=(rg()-.5)*2.2;
      for(let k=0;k<9;k++){x+=dx*6+(rg()-.5)*10;y-=24+rg()*5;pts.push([x,y]);}
      c.strokeStyle='#2b2018';c.lineCap='round';for(let k=0;k<pts.length-1;k++){c.lineWidth=9-k*.8;c.beginPath();c.moveTo(pts[k][0],pts[k][1]);c.lineTo(pts[k+1][0],pts[k+1][1]);c.stroke();}
      const np=3+((rg()*3)|0);
      for(let k=0;k<np;k++){const b=pts[Math.min(pts.length-1,3+Math.round(k*(pts.length-4)/np))],sg=rg()<.5?-1:1,L=30+rg()*60*(k===0?1.4:1),cx=b[0]+sg*L*.6,cy=b[1]-6-rg()*8;
        c.lineWidth=4;c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo((b[0]+cx)/2,b[1]+4,cx,cy+4);c.stroke();
        const rx=26+rg()*(k===0?54:36),ry=9+rg()*9;
        for(let q=0;q<170;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*rx*rr,ty=cy+Math.sin(a)*ry*rr;const hi=(cy-ty)/ry;
          touche(tx,ty+3,2.6+rg()*3.2,vert(hi>.25?3:hi>-.3?2:1,.8+rg()*.35));}
        for(let q=0;q<40;q++){const a=rg()*3.1416+3.1416,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*rx*rr*.9,ty=cy+Math.sin(a)*ry*rr*.8;touche(tx,ty,1.8+rg()*2,vert(4,.85+rg()*.3));}}
      // la couronne : un dernier plateau au sommet
      const t=pts[pts.length-1];for(let q=0;q<120;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=t[0]+Math.cos(a)*30*rr,ty=t[1]+Math.sin(a)*14*rr;touche(tx,ty,2.4+rg()*3,vert((t[1]-ty)/14>.2?3:2,.8+rg()*.35));}
    }else{ // LA TOUFFE : un nuage de feuillage, l'ombre dessous, le soleil dessus
      const cx=W/2,cy=W*.62;for(let q=0;q<900;q++){const a=rg()*6.2832,rr=Math.sqrt(rg()),tx=cx+Math.cos(a)*100*rr,ty=cy+Math.sin(a)*82*rr*(Math.sin(a)>0?.85:1.1);if(ty>W-4)continue;
        const hi=(cy-ty)/82;touche(tx,ty,3+rg()*4.5,vert(hi>.35?4:hi>0?3:hi>-.4?2:1,.75+rg()*.4));}}
    c.restore();}
  const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.minFilter=THREE.LinearMipmapLinearFilter;return texLibere(t);} // (2026-10-14, passe perf mobile) la planche 1024 × 512, peinte une fois : 2 Mo rendus après l'envoi (paliers 0-1)
const JADE_ARB_VS=['attribute vec4 aJ;uniform float uTime;varying vec2 vUv,vL;varying vec3 vW;','#include <fog_pars_vertex>',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
  '  vec3 R=normalize(vec3(viewMatrix[0][0],0.,viewMatrix[2][0])+vec3(1e-4,0.,0.)),U=normalize(vec3(0.,1.,0.)+vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1])*.35);', // face à la caméra (un peu penché vers elle d en haut)
  '  float y=position.y+.5,sw=sin(uTime*.8+aJ.w*40.)*y*y*.04*aJ.y;',
  '  vec3 wp=c+R*(position.x*aJ.x+sw)+U*y*aJ.y;vW=wp;',
  '  float k=aJ.z;vUv=(vec2(mod(k,4.),floor(k/4.))+vec2(position.x+.5,1.-y))*vec2(.25,.5);vUv.y=1.-vUv.y;vL=vec2(y,aJ.w);',
  '  vec4 mvPosition=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const JADE_ARB_FS=['uniform sampler2D uTex;uniform vec3 uSunC,uSky,uGnd,uMist,uSunDir;uniform float uMerY;varying vec2 vUv,vL;varying vec3 vW;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.45||vW.y<uMerY+1.)discard;',
  '  vec3 col=mix(t.rgb,vec3(dot(t.rgb,vec3(.3,.59,.11))),.15)*(.8+.25*vL.y)*(mix(uGnd,uSky,.35+.5*vL.x)*.9+uSunC*(.35+.4*vL.x));',
  '  float hm=((1.-smoothstep(0.,130.,vW.y-uMerY))*.38);col=mix(col,uMist,hm);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* ---- LES TEMPLES : la PAGODE (octogonale, cinq étages, avant-toits relevés) et le PAVILLON (un toit, huit colonnes) ---- */
function jadeTempleGeo(etages){const P=[],C=[],add=(g,col)=>{const h=g.index?g.toNonIndexed():g,a=h.attributes.position.array;for(let i=0;i<a.length;i++)P.push(a[i]);for(let i=0;i<a.length/3;i++)C.push(col[0],col[1],col[2]);};
  const bois=[.32,.12,.08],mur=[.70,.66,.58],tuile=[.17,.19,.19],pierre=[.55,.53,.49],or=[.86,.66,.30];
  const lathe=(prof,col)=>add(new THREE.LatheGeometry(prof.map(function(q){return new THREE.Vector2(q[0],q[1]);}),8),col);
  lathe([[0,0],[7.5,0],[7.5,1.6],[0,1.6]],pierre);
  let y=1.6,r=5;
  for(let k=0;k<etages;k++){const h=k===0?6:4.2;
    lathe([[0,y],[r,y],[r,y+h],[0,y+h]],k%2?bois:mur);
    const e=r*1.55,ys=y+h;lathe([[0,ys+2.4],[r*.62,ys+2.2],[r*1.05,ys+1.3],[e*.92,ys+.35],[e,ys+.75],[e*.98,ys+.55],[r*.5,ys-.3],[0,ys-.3]],tuile); // l'avant-toit RELEVÉ
    y=ys+1.6;r*=.84;}
  lathe([[0,y],[.45,y],[.25,y+5],[0,y+6.2]],or);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aCol',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g;}
/* LES CASCADES : un ruban qui fait face à la caméra (autour de la verticale), qui s'écarte un peu de la paroi en tombant ; l'eau défile
   (des filets blancs qui coulent), s'élargit et se défait en brume vers le bas. Toutes dans UN maillage. */
const JADE_CHUTE_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,side:THREE.DoubleSide,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTime:JADE_U.uTime,uMist:JADE_U.uMist,uSunC:JADE_U.uSunC}),
  vertexShader:['attribute vec3 aTop;attribute vec4 aW;attribute vec2 aO;varying vec2 vP;varying vec4 vWw;','#include <fog_pars_vertex>',
    'void main(){float t=position.x,sd=position.y;vec3 out3=vec3(aO.x,0.,aO.y);',
    '  vec3 c=aTop+out3*(aW.x*.4+t*t*aW.y*.07)-vec3(0.,1.,0.)*t*aW.y;',
    '  vec3 tc=cameraPosition-c;tc.y=0.;vec3 R=normalize(vec3(tc.z,0.,-tc.x)+vec3(1e-4,0.,0.));',
    '  vec3 wp=c+R*sd*aW.x*(.5+t*1.4);vP=vec2(t,sd);vWw=aW;',
    '  vec4 mvPosition=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform float uTime;uniform vec3 uMist,uSunC;varying vec2 vP;varying vec4 vWw;','#include <fog_pars_fragment>',
    'float ch(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float cn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ch(i),ch(i+vec2(1,0)),f.x),mix(ch(i+vec2(0,1)),ch(i+vec2(1,1)),f.x),f.y);}',
    'void main(){float t=vP.x,x=vP.y;',
    '  float L=vWw.y,fl=cn(vec2(x*7.+vWw.z*13.,t*L*.035-uTime*1.6))*.6+cn(vec2(x*17.,t*L*.08-uTime*2.7))*.4;', // les filets qui coulent
    '  float e=1.-smoothstep(.25,.5,abs(x));float a=e*(.35+.65*fl)*smoothstep(0.,.04,t)*(1.-smoothstep(.45,1.,t));',
    '  a*=mix(.95,.55,t);vec3 col=mix(vec3(.93,.96,.98),uMist,t*.7)+uSunC*.04;',
    '  gl_FragColor=vec4(col,a*.9);','#include <fog_fragment>','}'].join('\n')});m.dispose=function(){};return m;})();
function jadeChutes(L9){ // L9 : [x, y, z, ox, oz, largeur, longueur, graine]
  const n=L9.length,S=24,P=[],T9=[],W=[],O=[],I=[];
  for(let k=0;k<n;k++){const q=L9[k],b=P.length/3;for(let i=0;i<=S;i++)for(const sd of [-.5,.5]){P.push(i/S,sd,0);T9.push(q[0],q[1],q[2]);O.push(q[3],q[4]);W.push(q[5],q[6],q[7],0);}
    for(let i=0;i<S;i++){const a=b+i*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aTop',new THREE.Float32BufferAttribute(T9,3));
  g.setAttribute('aO',new THREE.Float32BufferAttribute(O,2));g.setAttribute('aW',new THREE.Float32BufferAttribute(W,4));g.setIndex(I);
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);return g;}
/* LA BRUME QUI FLOTTE : des nappes en billboard (face caméra), un bruit doux dans le shader, un dessus éclairé, un ventre lavande ;
   elles s'effacent près de l'objectif (pas de voile plein écran quand on les traverse) et au loin dans la brume de three. */
const JADE_BRUME_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTime:JADE_U.uTime,uSunC:JADE_U.uSunC,uMist:JADE_U.uMist,uSky:JADE_U.uSky,uOp:{value:1}}),
  vertexShader:['attribute vec4 aB;varying vec2 vU;varying vec4 vB;varying float vNear;','#include <fog_pars_vertex>',
    'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
    '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
    '  vec3 wp=c+R*position.x*aB.x+U*position.y*aB.y;vU=position.xy;vB=aB;',
    '  vec4 mvPosition=viewMatrix*vec4(wp,1.);vNear=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform float uTime,uOp;uniform vec3 uSunC,uMist,uSky;varying vec2 vU;varying vec4 vB;varying float vNear;','#include <fog_pars_fragment>',
    'float bh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
    'float bn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bh(i),bh(i+vec2(1,0)),f.x),mix(bh(i+vec2(0,1)),bh(i+vec2(1,1)),f.x),f.y);}',
    'void main(){vec2 q=vU*2.;float r=length(q*vec2(1.,1.15));',
    '  vec2 p=vU*vec2(3.2,2.)+vB.z*17.+vec2(uTime*.02,0.);float n=bn(p)*.55+bn(p*2.1+3.)*.3+bn(p*4.3-5.)*.15;',
    '  float a=smoothstep(1.,.15,r+(n-.5)*.9)*vB.w*uOp;a*=smoothstep(25.,140.,vNear);if(a<.004)discard;',
    '  vec3 col=mix(uMist*vec3(.86,.88,.95),uMist*1.06+uSunC*.05,smoothstep(-.6,.5,vU.y+n*.4-.2));',
    '  gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
  m.dispose=function(){};return m;})();
/* ---- LA CONSTRUCTION ---- */
const JADE_LOD=(function(){const k=TEL_NATIF?.8:1;return {r0:220*k,r1:750*k,pin:900*k,pav:1300*k,d1:1500*k};})(); // les distances (m) : cubes de 1,75 → 3,5 → 7 m, arbres, temples, cubes de 14 m
/* (2026-10-14, passe perf mobile) LE VERRE EN TROIS PASSES, PAR PALIER — MESURÉ (iPhone 7 émulé) : la bande 220-750 m (cubes de 3,5 m) passe
   TROIS fois par la puce (absorption, profondeur, lumière : 3 × 48 000 triangles). Les trois passes sont solidaires (la lumière est ADDITIVE
   et n'écrit pas la profondeur : seule, elle ferait une lueur sans corps) — on n'en cache donc aucune ; on rapproche la frontière où la
   montagne passe au verre « deviné » en UNE passe opaque (cubes de 7 m, le mécanisme de la v17). Palier 2 : 750 m, comme avant. */
PAL.B.jadeVerreR1=[400,600,750];JADE_LOD.r1=PAL.b('jadeVerreR1',750)*(TEL_NATIF?.8:1);
function jadeBande(d){const L9=JADE_LOD;return d<L9.r0?0:d<L9.r1?1:d<L9.pin?2:d<L9.pav?3:d<L9.d1?4:5;}
function jadeMatPilier(q,k){ // la matrice d'une montagne (gabarit q[5], quart de tour q[6]) à son niveau de détail k (0 à 3)
  const T9=JADE.geos.p[q[5]],e=1<<(k|0);
  return new THREE.Matrix4().makeTranslation(q[0],q[3],q[1]).multiply(new THREE.Matrix4().makeRotationY(q[6]*Math.PI/2)).multiply(new THREE.Matrix4().makeScale(VX*e,VX*e,VX*e)).multiply(new THREE.Matrix4().makeTranslation(-T9.M/e,0,-T9.M/e));}
function jadeVueGeo(g){const c=new THREE.BufferGeometry();for(const k in g.attributes)if(k!=='aJ')c.setAttribute(k,g.attributes[k]);if(g.index)c.setIndex(g.index);c.boundingSphere=g.boundingSphere;return c;} // une géométrie qui PARTAGE les tampons d'un gabarit (son aJ à elle)
function jadeQuart(r,ox,oz){const c=Math.round(Math.cos(r*Math.PI/2)),s=Math.round(Math.sin(r*Math.PI/2));return [ox*c+oz*s,-ox*s+oz*c];} // un vecteur du gabarit tourné comme l'instance
/* (2026-10-13, passe perf « le JOUER qui gèle ») LA CARTE GARDÉE. MESURÉ : la graine du niveau est FIXE (NIV_JADE.graine) et pourtant la
   carte était jetée puis rebâtie à l'identique à chaque JOUER — et DEUX fois à partir du 2e (rebuildMenuScene sous le volet, puis resetGame
   au lâcher : deux newTrack). Désormais la carte qu'on quitte n'est plus jetée : elle est RANGÉE hors de la scène (JADE_GARDE, une seule), et
   le prochain buildJade de la MÊME vallée (même graine, même ruban au bit près : `jadeCle`) la reprend telle quelle en quelques ms
   (jadeReprend : l'effondrement défait comme au redémarrage du niveau, les familles et les cubes fins à retrier, monuments et pièces du bord
   comme neufs). Une autre vallée (la balade, ?graine=) jette l'ancienne ; une course sur un autre niveau (portail, carrière, CRYPTOCITY)
   aussi : hors du menu, jamais deux cartes. Rangée, elle rend à la carte graphique ce qu'elle seule y tenait (jadeRendGPU : la même mémoire
   GPU au menu qu'avant ; three renvoie ses tableaux au prochain rendu). Le menu garde SON ciel : la carte rangée n'est plus dans la scène. */
const JADE_GARDE={m:null,reprises:0,ms:0};
const JADE_CH=['root','fam','col','porte','pont','brume','monu','merY','eauY','quart','n9','nuages','nuTri','eauPil','eauT','depart','n','msPorte','msPont','tPorte','cle','dz','deco'],
  FIN_CH=['fam','cap','vit','stamp','was','gen','mats','dans'],NUVOX_CH=['L','ims','S','sig'],JCH_CH=['L','fixe','splash','sp']; // TOUT ce qu'une carte écrit hors d'elle-même (voir jadeBatit)
function jadeEtatLit(){const m={J:{},F:{},N:{},C:{}};for(const k of JADE_CH)m.J[k]=JADE[k];for(const k of FIN_CH)m.F[k]=FIN[k];for(const k of NUVOX_CH)m.N[k]=NUVOX[k];for(const k of JCH_CH)m.C[k]=JCH[k];return m;}
function jadeEtatEcrit(m){for(const k of JADE_CH)JADE[k]=m.J[k];for(const k of FIN_CH)FIN[k]=m.F[k];for(const k of NUVOX_CH)NUVOX[k]=m.N[k];for(const k of JCH_CH)JCH[k]=m.C[k];}
function jadeEtatVide(){ // plus de carte en place (les valeurs que buildJade posait avant de bâtir)
  NUVOX.L=null;NUVOX.ims=[];JADE.fam=[];FIN.fam=[];FIN.near.length=0;FIN.sig=0;FIN.mats=new Map();FIN.dans=new Set();JADE.col=null;JADE.porte=null;JADE.pont=null;JADE.brume=null;JADE.sig=0;JADE.root=null;JADE.monu=[];JADE.cle=null;JADE.quart=null;JADE.dz=null;JADE.deco=null;JCH.L=[];JCH.splash=null;JCH.sp=[];}
function jadeJette(m){ // libère une carte : ses familles (tampons d'instances, sans toucher aux gabarits partagés), ses maillages à elle, les tampons de ses instances
  for(const o of m.J.monu||[])if(o.loIt){try{o.loIt.return();}catch(e){}o.loIt=null;} // (2026-10-14, passe perf mobile) le monument de loin en cours : la file fermée (VOXM rendu), rien n'est ajouté à la carte jetée
  for(const F of m.J.fam.concat(m.F.fam.filter(Boolean))){F.im.dispose();if(F.im2&&F.im2!==F.im){F.im2.dispose();F.im3.dispose();}const g9=F.im.geometry;for(const k in g9.attributes)if(k!=='aJ')g9.deleteAttribute(k);g9.setIndex(null);g9.dispose();}
  if(m.J.root)m.J.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});}
function jadeRendGPU(m){m.J.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose();});} // (ses tableaux restent : three les renverra)
function jadeRange(){ // la carte en place quitte la scène, rangée telle quelle — l'ancienne carte rangée est libérée
  const m=jadeEtatLit();if(JADE.root.parent)JADE.root.parent.remove(JADE.root);
  if(JADE_GARDE.m){jadeJette(JADE_GARDE.m);JADE_GARDE.m=null;}
  if(m.J.cle){jadeRendGPU(m);JADE_GARDE.m=m;}else jadeJette(m);} // (une carte bâtie à moitié — une exception en route — n'est pas gardée)
function jadeOublie(){if(JADE_GARDE.m){jadeJette(JADE_GARDE.m);JADE_GARDE.m=null;}}
function jadeCle(seed){ // l'identité d'une vallée : la graine et le ruban tel que buildTrack l'a posé (au bit près), la largeur, les réglages qui changent la carte
  const f=new Float64Array(1),u=new Uint32Array(f.buffer);let h=0x811c9dc5;const mx=x=>{f[0]=x;h=Math.imul(h^u[0],16777619);h=Math.imul(h^u[1],16777619);};
  mx(seed);mx(NP);mx(L);mx(ROAD_HALF);mx(VX);mx(VXG);mx(FIN.on?1:0);mx(0);mx(JADE_NUVOX?1:0);mx(TEL_NATIF?1:0);
  for(let i=0;i<NP;i++){const p=pts[i],t=T[i],b=B[i],n=Nn[i];mx(p.x);mx(p.y);mx(p.z);mx(t.x);mx(t.y);mx(t.z);mx(b.x);mx(b.y);mx(b.z);mx(n.x);mx(n.y);mx(n.z);}
  const Q=JADE.Q||{};for(const k of Object.keys(Q).sort()){mx(k.length);mx(Q[k].p.x);mx(Q[k].p.y);mx(Q[k].p.z);mx(Q[k].phi);}
  return seed+':'+NP+':'+(h>>>0).toString(36);}
function jadePose(ok){ // la carte bâtie entre dans la scène (avant : dès le début de buildJade — l'ordre n'y change rien), l'eau à son niveau, le style de la route
  scene.add(JADE.root);trackMeshes.push(JADE.root);JADE_U.uMerY.value=JADE.eauY;skyU.uJMerY.value=JADE.eauY;
  {const Z=JADE.dz;JADE_U.uRocT.value.fromArray(Z?Z.roc:[1,1,1]);JADE_U.uVerT.value.fromArray(Z?Z.ver:[1,1,1]);} /* (2026-10-20, LE DÉCOR AU HASARD) la teinte de CETTE vallée — posée à l'entrée en scène (bâtie d'avance, elle ne déteint pas sur celle d'en place) */
  if(ok)try{jadeRoute();}catch(e){console.warn('route',e);}}
function jadeReprend(){const t0=performance.now(),m=JADE_GARDE.m;JADE_GARDE.m=null;
  jadeEtatEcrit(m);
  // ce que la partie d'avant a touché revient comme au sortir de buildJade
  jadeChuteRaz(); // les montagnes tombées remises debout, rendues aux chocs, l'écume vidée (le redémarrage du niveau, jadeRedemarre)
  for(const F of JADE.fam){F.sig=undefined;F.sale=false;F.im.count=0;if(F.im2){F.im2.count=0;F.im3.count=0;}if(F.dst)F.dst.clear();} // jadeTri récrit tout (JADE.sig = 0)
  for(const FF of FIN.fam)if(FF){FF.sig=undefined;FF.im.count=FF.im2.count=FF.im3.count=0;FF.im.visible=FF.im2.visible=FF.im3.visible=false;}
  FIN.near.length=0;FIN.sig=0;FIN.sale=false;FIN.mats=new Map();FIN.dans=new Set();if(FIN.stamp){FIN.stamp.fill(0);FIN.was.fill(0);}FIN.gen=0;
  NUVOX.sig=0;for(const im of NUVOX.ims||[]){im.count=0;im.visible=false;}for(const n of NUVOX.L||[])n.v=0;
  for(const e of JADE.eauPil||[])e.t=0;JADE.eauT=0;JADE.sale=false;
  for(const o of JADE.monu||[]){o.loin=false;o.g.visible=true;if(o.L){o.L[0].material=JADE_M.vrM;o.L[0].renderOrder=3;o.L[1].visible=o.L[2].visible=true;if(o.lo){o.lo.visible=false;o.L[0].visible=true;}}}
  for(const M9 of [JADE.porte,JADE.pont]){if(!M9||!M9.mF)continue;M9.pres=false;for(const x of M9.mF)x.visible=false;for(const x of M9.mL)x.visible=true;}
  if(FIN.on&&JADE.geos&&FIN.cap)for(let t=0;t<JADE.geos.p.length;t++)if(JADE.geos.p[t].fin&&!FIN.fam[t])finFamille(t); // (les gabarits fins finis depuis : leur famille, comme une carte neuve)
  jadePose(true);
  JADE_GARDE.reprises++;JADE_GARDE.ms=Math.round(performance.now()-t0);}
function buildJade(seed){
  JADE.t0=0;JADE.fini=false; // (2026-10-12, passe qualité) le chrono d'ARRIVÉE repart à chaque piste (après REJOUER il comptait les essais d'avant, menus compris)
  try{JADE_ESPRITS.visible=false;}catch(e){} // …et les lucioles s'éteignent : jadeTick ne tourne plus hors de la map, elles restaient figées dans le niveau suivant
  if(JADE.root)jadeRange(); // (2026-10-13) la carte en place n'est plus jetée : rangée (voir LA CARTE GARDÉE)
  jadeEtatVide();
  try{coinSymbole((JADE_JEU||(LVL.cur&&LVL.cur.sansFin))&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on?'Y':LVL.cur&&LVL.cur.crypto&&!PARK.on?'B':'$');}catch(e){} // (2026-10-12) les pièces du SOLEIL DE JADE frappées du ¥
  try{jadeEauRaz();}catch(e){} // (2026-10-13) la mer : rien sous l'eau d'une piste à l'autre
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='jade'||!(NP>1)){if(started&&!gameOver)jadeOublie();return;} // une course sur un autre niveau : la carte rangée est libérée (au menu, elle attend le prochain JOUER)
  const cle=jadeCle(seed);
  if(JADE_GARDE.m&&JADE_GARDE.m.J.cle===cle){jadeReprend();return;} // LA MÊME VALLÉE : reprise telle quelle
  jadeOublie(); // une autre vallée : l'ancienne carte est libérée avant de bâtir
  let ok=false;
  try{jadeFini(jadeBatit(seed,cle));ok=true;}
  finally{if(JADE.root)jadePose(ok);}
}
