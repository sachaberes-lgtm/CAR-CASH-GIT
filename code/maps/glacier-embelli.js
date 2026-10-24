/* ======================= LE GLACIER EMBELLI (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures, améliorer les lumières — sans que ce soit trop gourmand pour le téléphone ») =======================
   MESURÉ AVANT : devant la caisse, deux plans seulement — la glace de la piste et les pics à moins de 3,6 km ; au-delà, l'horizon est un bandeau de brume SANS RIEN dedans (un dégradé plat),
   et rien ne vit dans l'air à part la neige qui tombe. Cette passe ajoute les plans qui manquent, dans la charte (clé chaude + remplissage froid, brume teintée, rose/or rares) :
   · LES CRÊTES LOINTAINES (pilier « trois plans ») : un anneau de montagnes à 7,3 / 8 / 8,7 km qui SUIT la caméra (à l'infini, comme les aurores), trois rangées de facettes plates
     (une teinte par facette : le côté du soleil chaud, l'ombre bleu-violet), la neige haut, la glace bleue bas, le pied qui fond dans la brume TEINTÉE (la plus loin est la plus pâle) ;
     elles lisent les mêmes uniforms que le reste de la banquise (uSunC, uSky, uAlpC, uAurC, uIceT, uMistC, uHazeC) : l'alpenglow les embrase au matin et au soir, l'aurore les bleuit la nuit
     et la couleur de la glace, des aurores et de l'alpenglow TIRÉS PAR LE DÉCOR AU HASARD (BANQ.dz) les suivent sans qu'on y touche ; un liseré d'or chaud, très fin, sur leur arête éclairée ;
   · LES PANACHES DE NEIGE (pilier « un détail vivant ») : de la neige soufflée qui file des plus hautes cimes, deux feuilles croisées par panache, qui ondulent et défilent avec uTime
     (rien à faire côté processeur) ; effacés par la neige et le blizzard (ils se noieraient dans la brume).
   Tout est à l'infini (aucun décor près de la piste, aucun calcul par image, aucune lumière), UN seul programme (les deux maillages partagent le même shader, `uPl` choisit crête / panache),
   deux appels de dessin, ~2 000 triangles. Le tirage vient de la graine de la piste mais dans un flux À LUI (`mulberry32(graine ^ 0xC4E7E5)`) : aucun tirage dans `fr`, la piste ne bouge pas.
   Paliers : `PAL.B.banqCreteL` (nombre de rangées 1/2/3), `banqCreteN` (facettes par tour), `banqPana` (panaches 0/8/14). `?sans=glacierembelli` = la banquise d'avant (rien de tout ceci).
   Console : `dbgBanq('embelli')` (les comptes), `dbgBanq('embelli',{k:…})`. */
const BK_EMB=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacierembelli(,|&|$)/.test(location.search);
try{Object.assign(PAL.B,{banqCreteL:[1,2,3],banqCreteN:[150,230,320],banqPana:[0,14,24]});}catch(e){}
const BK_CRE_LAY=[[8700,1900,.80],[8000,1400,.66],[7300,950,.50]]; /* [rayon (m), hauteur max au-dessus de la caméra (m), part de brume] — du plus loin au plus près */
const BK_CRE_B=-300; // le pied de l'anneau, sous l'horizon : il fond dans la brume (alpha 0)
const BK_CRE_VS=['attribute vec4 aK;uniform float uTime,uPl;varying vec3 vW;varying vec4 vK;',
  'void main(){vec3 p=position;',
  '  if(uPl>.5){float ph=aK.w;p.y+=sin(uTime*.37+aK.y*5.+ph*6.2832)*70.*aK.y;p.xz+=vec2(cos(ph*6.2832),sin(ph*6.2832))*sin(uTime*.29+aK.y*4.+ph*9.)*60.*aK.y;}', // le panache ondule : plus on va vers la queue, plus il flotte
  '  vec4 wp=modelMatrix*vec4(p,1.);vW=wp.xyz;vK=aK;gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n');
const BK_CRE_FS=[FG_BRUIT,
  'uniform vec3 uSunDir,uSunC,uSky,uFillC,uCam,uHazeC,uMistC,uAlpC,uAurC,uAurC2,uIceT;uniform float uTime,uPl,uAlp,uAur,uHazeM,uNeige;varying vec3 vW;varying vec4 vK;',
  'void main(){vec3 rel=vW-uCam;float hr=max(length(rel.xz),1.);vec3 r=vec3(rel.x,0.,rel.z)/hr;float lay=vK.x;',
  '  float hzL=lay<.5?.80:(lay<1.5?.66:.50);vec3 hc=mix(uHazeC,uMistC,.35);',
  '  if(uPl>.5){', /* le PANACHE : t le long (0 à la cime, 1 à la queue), sd le travers */
  '    float t=vK.y,sd=vK.z,ph=vK.w;float st=fn2(vec2(t*6.-uTime*.55+ph*9.,sd*2.2+ph*5.));',
  '    float a=(1.-t)*(1.-t*.6)*smoothstep(1.,.30,abs(sd))*(.30+.80*st)*.90*(1.-smoothstep(.15,.85,uNeige));',
  '    vec3 sn=vec3(.93,.96,1.)*(uSky*.60+uSunC*.55)+uAlpC*uAlp*.45+vec3(1.,.82,.5)*.04*uSunC;',
  '    sn=mix(sn,hc,hzL*.55);gl_FragColor=vec4(sn,a);return;}',
  /* la CRÊTE : la facette a sa pente (vK.z), sa hauteur absolue (vK.y, 0 au pied → 1 au plus haut) et sa place dans la colonne (vK.w, 0 pied → 1 arête) */
  '  float h01=vK.y,k=vK.z,cf=vK.w;vec3 tg=vec3(r.z,0.,-r.x);',
  '  vec3 n=normalize(vec3(-r.x*.55,.50,-r.z*.55)-tg*k*.9);',
  '  float ndl=dot(n,uSunDir),dif=clamp((ndl+.15)/1.15,0.,1.);',
  '  vec2 nq=vec2(atan(rel.x,rel.z)*46.+lay*13.,vW.y*.012);float nz=fn2(nq);',
  '  float sn=smoothstep(.30,.60,h01+(nz-.5)*.16);', /* la neige tient en haut */
  '  vec3 rock=uIceT*vec3(.22,.36,.74)*(.90+.20*fn2(nq*2.7+4.));vec3 snow=vec3(.86,.91,1.);',
  '  vec3 alb=mix(rock,snow,sn);',
  '  vec3 col=alb*(uSky*(.42+.22*n.y)+uSunC*dif*.80+uFillC*.20);', /* la clé chaude de face… */
  '  col=mix(col,col*vec3(.76,.86,1.22),(1.-dif)*.65);', /* …et l'ombre qui bascule au bleu-violet (jamais au gris) */
  '  float sa=max(dot(r,normalize(vec3(uSunDir.x,0.,uSunDir.z)+vec3(1e-4))),0.);',
  '  col+=alb*uAlpC*uAlp*(.25+.75*dif)*(.25+.75*smoothstep(.35,1.,h01))*1.1;', /* l'ALPENGLOW embrase les crêtes */
  '  float rim=smoothstep(.80,1.,cf);',
  '  col+=uSunC*vec3(1.,.80,.50)*rim*(.10+.40*pow(sa,3.))*(.35+.65*dif)*.85;', /* le liseré d'or de l'arête éclairée (le clin d'œil CASH) */
  '  col+=alb*mix(uAurC,uAurC2,.35)*uAur*.24*(.25+.75*h01);', /* la nuit : la couleur de l'aurore sur la neige */
  '  float hz=clamp(hzL+(.97-hzL)*pow(1.-h01,2.5),0.,max(.97,uHazeM));col=mix(col,hc,hz);',
  '  gl_FragColor=vec4(col*.92,smoothstep(0.,.20,cf));}'].join('\n');
function bkCretesMat(pl){const m=new THREE.ShaderMaterial({uniforms:Object.assign({uPl:{value:pl}},BK_U),vertexShader:BK_CRE_VS,fragmentShader:BK_CRE_FS,transparent:true,depthWrite:!pl,side:THREE.DoubleSide,fog:false});
  m.dispose=function(){};return m;} // jamais libérées : un seul jeu pour toutes les banquises ; les deux gardent `transparent` : UN programme pour les deux
/* LA GÉNÉRATION : une rangée = un bruit périodique en valeur, REDRESSÉ (1-|2n-1|)² (des pointes, pas des vagues), cinq octaves, trois massifs en bosse ; chaque facette (un segment de l'anneau)
   a sa pente constante (aK.z) → éclairée à plat, comme les cristaux de la piste. Les plus hautes pointes des rangées lointaines portent un panache. */
function bkCretesGen(fx){
  const R=mulberry32((((BANQ.graine|0)^0xC4E7E5)>>>0)),LL=PAL_BK('banqCreteL',3),NS=PAL_BK('banqCreteN',320),PN=PAL_BK('banqPana',14);
  const rangs=LL>=3?[0,1,2]:LL===2?[0,2]:[1],P=[],K=[],pics=[],TP=Math.PI*2;
  const tri=(a,b,c)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);K.push(a[3],a[4],a[5],a[6],b[3],b[4],b[5],b[6],c[3],c[4],c[5],c[6]);};
  for(const j of rangs){
    const Rr=BK_CRE_LAY[j][0],Hm=BK_CRE_LAY[j][1],FQ=[3,7,16,34,70],AM=[.30,.26,.22,.14,.08],tb=FQ.map(f=>{const a=[];for(let i=0;i<f;i++)a.push(R());return a;}),bump=[];
    for(let b=0;b<3;b++)bump.push([R()*TP,.07+R()*.09,.55+R()*.45]);
    const H=new Float32Array(NS+1);
    for(let i=0;i<=NS;i++){const u=(i%NS)/NS;let h=0;
      for(let o=0;o<5;o++){const f=FQ[o],x=u*f,fl=Math.floor(x),i0=fl%f,i1=(i0+1)%f,t=x-fl,s=t*t*(3-2*t),n=tb[o][i0]+(tb[o][i1]-tb[o][i0])*s,rr=1-Math.abs(2*n-1);h+=AM[o]*rr*rr;}
      h=1-Math.exp(-h*2.2); /* un genou doux : des pointes distinctes, plus de plateau écrêté */
      for(const b of bump){let d=Math.abs(u*TP-b[0]);if(d>Math.PI)d=TP-d;h=Math.max(h,b[2]*Math.exp(-(d/b[1])*(d/b[1])));}
      H[i]=.10+.90*h;}
    H[NS]=H[0];
    const top=i=>BK_CRE_B+(Hm-BK_CRE_B)*H[i],h01=i=>top(i)-BK_CRE_B,hn=Hm-BK_CRE_B,xz=(i)=>{const a=(i%NS)/NS*TP;return [Math.sin(a)*Rr,Math.cos(a)*Rr];};
    for(let i=0;i<NS;i++){const a=xz(i),b=xz(i+1),k=Math.max(-1,Math.min(1,(top(i+1)-top(i))/(Rr*TP/NS)*.55));
      const A=[a[0],BK_CRE_B,a[1],j,0,k,0],B=[a[0],top(i),a[1],j,h01(i)/hn,k,1],C=[b[0],BK_CRE_B,b[1],j,0,k,0],D=[b[0],top(i+1),b[1],j,h01(i+1)/hn,k,1];
      tri(A,B,C);tri(C,B,D);
      if(j<2&&H[i]>.52&&H[i]>=H[(i+NS-1)%NS]&&H[i]>=H[i+1])pics.push([j,i,H[i],a[0],top(i),a[1]]);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,4));g.computeBoundingSphere();
  if(fx.cre.geometry)fx.cre.geometry.dispose();fx.cre.geometry=g;
  /* LES PANACHES : les plus hautes pointes, espacées d'au moins 0,22 rad, soufflées dans le sens du vent de la piste ; deux feuilles croisées (une verticale, une à plat) de sept éléments */
  const wd=R()*TP,dwx=Math.sin(wd),dwz=Math.cos(wd),pxz=[Math.cos(wd),-Math.sin(wd)],PP=[],PK=[],M=7;pics.sort((a,b)=>b[2]-a[2]);const pris=[];
  for(const p of pics){if(pris.length>=PN)break;const an=Math.atan2(p[3],p[5]);let ok=true;for(const q of pris){let d=Math.abs(an-q);if(d>Math.PI)d=TP-d;if(d<.22){ok=false;break;}}if(!ok)continue;pris.push(an);
    const ph=R(),Lp=1100+R()*800,W0=130+R()*80,rr=.985,ax=p[3]*rr,ay=p[4],az=p[5]*rr,v=[];
    for(let m=0;m<=M;m++){const t=m/M,W=W0*(.35+1.5*t),cx=ax+dwx*t*Lp,cy=ay+Lp*.12*Math.sin(t*2.2),cz=az+dwz*t*Lp;v.push([cx,cy,cz,W]);}
    for(const sheet of [0,1])for(let m=0;m<M;m++){const q0=v[m],q1=v[m+1],t0=m/M,t1=(m+1)/M,off=(q,s)=>sheet?[q[0]+pxz[0]*q[3]*.5*s,q[1],q[2]+pxz[1]*q[3]*.5*s]:[q[0],q[1]+q[3]*.5*s,q[2]];
      const a0=off(q0,-1),b0=off(q0,1),a1=off(q1,-1),b1=off(q1,1),V=(o,t,s)=>[o[0],o[1],o[2],p[0],t,s,ph];
      const A=V(a0,t0,-1),B=V(b0,t0,1),C=V(a1,t1,-1),D=V(b1,t1,1);
      for(const w of [A,B,C,C,B,D]){PP.push(w[0],w[1],w[2]);PK.push(w[3],w[4],w[5],w[6]);}}}
  if(PP.length){const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));g2.setAttribute('aK',new THREE.Float32BufferAttribute(PK,4));g2.computeBoundingSphere();
    if(!fx.pan){fx.pan=new THREE.Mesh(g2,fx.mPan);fx.pan.name='banquise panaches';fx.pan.frustumCulled=false;fx.pan.matrixAutoUpdate=false;fx.pan.renderOrder=-2.5;fx.pan.visible=false;scene.add(fx.pan);}
    else{if(fx.pan.geometry)fx.pan.geometry.dispose();fx.pan.geometry=g2;}}
  fx.cG=BANQ.graine|0;fx.cN={tri:P.length/9,pana:pris.length,panaTri:PP.length/9,rangs:rangs.length};}
function bkCretes(fx){ // une fois, au premier tour de la banquise (banqFx) : les matières, le maillage de l'anneau, puis sa génération
  if(!BK_EMB||fx.cre)return;
  fx.mCre=bkCretesMat(0);fx.mPan=bkCretesMat(1);
  fx.cre=new THREE.Mesh(new THREE.BufferGeometry(),fx.mCre);fx.cre.name='banquise crêtes lointaines';fx.cre.frustumCulled=false;fx.cre.matrixAutoUpdate=false;fx.cre.renderOrder=-3;fx.cre.visible=false;scene.add(fx.cre);
  bkCretesGen(fx);}
function bkCretesTick(fx){ // chaque image, dans banqTick : l'anneau suit la caméra (rien d'autre : tout le reste vit dans le shader)
  if(!fx.cre)return;
  if(fx.cG!==(BANQ.graine|0))bkCretesGen(fx); // une piste neuve : d'autres crêtes (un seul passage, < 1 ms)
  const cp=camera.position;
  for(const m of [fx.cre,fx.pan]){if(!m)continue;m.visible=true;m.position.copy(cp);m.updateMatrix();m.updateMatrixWorld(true);}}
function bkCretesCache(fx){if(fx.cre)fx.cre.visible=false;if(fx.pan)fx.pan.visible=false;}
function bkCretesChauffe(fx){return fx.cre?(fx.pan?[fx.cre,fx.pan]:[fx.cre]):[];}
