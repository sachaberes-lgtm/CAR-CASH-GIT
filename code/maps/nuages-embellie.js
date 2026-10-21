/* ===== LA MER DE NUAGES EMBELLIE (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures,
   améliorer les lumières — sans que ce soit trop gourmand pour le téléphone ») =====
   Du VIVANT dans le ciel de la map NUAGES, en UN seul programme de shader et DEUX appels de dessin (~3 500 triangles au palier récent) :
     · des POUSSIÈRES DE LUMIÈRE : de petits flocons doux qui dérivent autour de la route (or et azur le jour, ambre et lilas au soir, azur et lilas la nuit) ;
     · des BANCS D'OISEAUX très lointains : de petits V qui battent des ailes, en silhouette teintée de l'heure, jamais la nuit ;
     · des ÉCLATS CASH : une étincelle en croix, rose #F24AA0 ou or #FFD75E, qui ne s'allume que rarement et brièvement (la signature de la marque).
   Tout est BILLBOARD en instances (un quad par chose) : la position, la dérive, le battement d'ailes, le scintillement et le fondu sont calculés dans le shader
   à partir d'un seul uniforme de temps — AUCUN calcul par instance côté processeur, aucune lumière, aucune passe, aucune texture. Les poussières et les
   éclats sont ADDITIFS (une lumière, pas un aplat), les oiseaux en fusion normale. Dessinés APRÈS les nuages, testés contre leur profondeur (un nuage devant les cache).
   LE COULOIR RESTE LIBRE : sur une coquille de 70 à 560 m autour de chaque point de la piste (toutes directions : la route est « sans haut ni bas »), refusés s'ils
   touchent la garde de la route (cotonTouche), estompés à moins de 60 m de l'objectif et au-delà de leur portée (poussières 420 m, éclats 600 m, oiseaux 900 m).
   LA PISTE NE BOUGE PAS D'UN BIT : le hasard est un `mulberry32` LOCAL (graine = la longueur de la piste), jamais `rnd` ni `cr`.
   PALIERS : PAL.B.nuEmb = [ancien .3 · moyen .65 · récent 1] × la population (poussières 1 par 9 m de piste, éclats 1 par 120 m, bancs 1 par 520 m).
   Cycle de vie = celui des nuages de coton : bâti à la fin de buildCoton, retiré par cotonVide (qui est appelée avant chaque construction).
   `dbgEmbNuages()` : l'état · `(true|false)` : montrer/cacher (A/B au même instant) · `('nu',{nuK:[…],nuR:[…],nuLav:[…]})` : régler à chaud la matière
   des cumulus de l'ambiance courante · `('u',{uG:[…]})` : les gains. */
PAL.B.nuEmb=[.3,.65,1];
const NUEMB={A:null,B:null,sig:'',t0:performance.now(),vis:true,chaud:false,n:{m:0,e:0,o:0},
  U:{uT:{value:0},uC0:{value:new THREE.Vector3(1,.78,.42)},uC1:{value:new THREE.Vector3(.14,.42,1)},uC2:{value:new THREE.Vector3(1,.1,.4)},uC3:{value:new THREE.Vector3(1,.68,.12)},
    uCb:{value:new THREE.Vector3(.10,.14,.34)},uG:{value:new THREE.Vector3(1,1,1)}}, /* c0 chaud · c1 froid (poussières) · c2 rose · c3 or (éclats) · cb la silhouette des oiseaux · g le gain (poussières, éclats, oiseaux) */
  AMB:{ /* par météo, en LINÉAIRE (avant ACES) — le trio de la bible : or #FFD75E, rose #F24AA0, azur #5EA8FF de la map */
    matin:{c0:[1,.78,.42],c1:[.14,.42,1],c2:[1,.10,.40],c3:[1,.68,.12],cb:[.10,.14,.34],g:[.8,.9,.85]},
    midi:{c0:[1,.90,.70],c1:[.14,.42,1],c2:[1,.10,.40],c3:[1,.68,.12],cb:[.10,.16,.36],g:[.6,.7,.8]},
    soir:{c0:[1,.50,.24],c1:[.65,.40,1],c2:[1,.10,.45],c3:[1,.72,.20],cb:[.17,.06,.20],g:[1,1,.9]},
    nuit:{c0:[.25,.45,1],c1:[.55,.35,1],c2:[1,.10,.45],c3:[1,.72,.20],cb:[.05,.05,.15],g:[1.1,1.2,0]}}};
const NUEMB_VS=['attribute vec4 aP,aA,aD;uniform float uT;uniform vec3 uC0,uC1,uC2,uC3,uCb,uG;varying vec2 vQ;varying vec3 vC;varying float vA,vK,vF;',
  /* aP = centre (xyz) et demi-taille (m) · aA = genre (0 poussière, 1 oiseau, 2 éclat), phase, phase du battement, hasard · aD = cap (xyz) et portée (oiseaux) */
  'void main(){float kd=aA.x,ph=aA.y,pk=aA.w,tw=1.,g=1.;vec3 c=aP.xyz,col=vec3(1.);',
  '  if(kd<.5){c+=vec3(sin(uT*.31+ph*40.),sin(uT*.23+ph*27.),sin(uT*.27+ph*33.))*1.6;', /* la poussière dérive, très peu */
  '    tw=.55+.45*sin(uT*(.8+pk*1.4)+ph*60.);col=mix(uC0,uC1,step(.45,pk))*(.75+.5*fract(pk*7.));g=uG.x;}',
  '  else if(kd<1.5){float s=fract(ph+uT/80.);c+=aD.xyz*(s-.5)*aD.w;tw=smoothstep(0.,.08,s)*smoothstep(1.,.92,s);col=uCb;g=uG.z;}', /* le banc traverse en 80 s et s'éteint aux deux bouts */
  '  else{float f=sin(uT*(.28+.4*fract(pk*5.))+ph*18.85);tw=pow(max(f,0.),28.);col=mix(uC2,uC3,step(.5,fract(pk*3.7)));g=uG.y;}', /* l'éclat : une impulsion rare (~7 % du temps) */
  '  vec4 mv=viewMatrix*vec4(c,1.);float d=-mv.z,far=kd<.5?420.:kd<1.5?900.:600.;',
  '  vA=tw*g*smoothstep(22.,60.,d)*(1.-smoothstep(far*.62,far,d));',
  '  if(vA<.004||d<1.){gl_Position=vec4(2.,2.,2.,1.);vQ=vec2(0.);vC=vec3(0.);vK=0.;vF=0.;return;}', /* éteint ou hors de portée : jeté avant la rastérisation */
  '  mv.xy+=position.xy*aP.w*(kd>1.5?.4+.6*tw:1.);gl_Position=projectionMatrix*mv;vQ=position.xy;vC=col;vK=kd;vF=aA.z*6.2832+uT*(11.+pk*3.);}'].join('\n');
const NUEMB_FS=['varying vec2 vQ;varying vec3 vC;varying float vA,vK,vF;',
  'void main(){vec2 q=vQ;float a;',
  '  if(vK<.5){float r=dot(q,q);a=exp(-r*5.)*(1.-smoothstep(.55,1.,r));}', /* un flocon de lumière : un cœur doux, sans bord */
  '  else if(vK<1.5){float ax=abs(q.x),f=sin(vF),yw=ax*.55*f-ax*ax*.15,th=.20-.14*ax;', /* le V : deux ailes qui montent et descendent, un corps minuscule */
  '    a=smoothstep(th,th*.45,abs(q.y-yw))*step(ax,.95)*(1.-smoothstep(.7,.95,ax));a=max(a,smoothstep(.22,.08,length(q*vec2(1.2,2.2))));}',
  '  else{vec2 p=abs(q);a=exp(-p.x*p.y*22.)*(1.-smoothstep(.45,1.,max(p.x,p.y)))+exp(-dot(q,q)*26.)*1.1;a=min(a,1.4);}', /* l'étincelle en croix */
  '  if(a*vA<.004)discard;',
  '  gl_FragColor=(vK>.5&&vK<1.5)?vec4(vC,a*vA):vec4(vC*a*vA,1.);}'].join('\n');
function nuEmbMats(){ // deux matériaux, UN programme (même source) : la fusion est un réglage d'état, pas de code
  if(NUEMB.M)return NUEMB.M;
  const mk=function(bl){const m=new THREE.ShaderMaterial({uniforms:NUEMB.U,vertexShader:NUEMB_VS,fragmentShader:NUEMB_FS,transparent:true,depthWrite:false,depthTest:true,blending:bl,fog:false});m.dispose=function(){};return m;};
  return (NUEMB.M={add:mk(THREE.AdditiveBlending),nrm:mk(THREE.NormalBlending)});}
function nuEmbVide(){ // appelée par cotonVide : le niveau d'avant s'en va avec ses nuages
  for(const k of ['A','B']){const m=NUEMB[k];if(!m)continue;if(m.parent)m.parent.remove(m);m.geometry.dispose();NUEMB[k]=null;}
  NUEMB.n.m=NUEMB.n.e=NUEMB.n.o=0;NUEMB.sig='';}
function nuEmbBati(){ // appelée à la fin de buildCoton (le niveau NUAGES, jamais l'orage, jamais l'auto-école)
  nuEmbVide();
  const c=LVL.cur;if(!c||c.id!=='nuages'||c.sansNuages||c.piste)return;
  const mt=c.meteo||'midi',A=NUEMB.AMB[mt];if(!A||!(NP>1)||!pts.length||!COTON.grid||!COTON.root)return;
  const k=PAL.b('nuEmb',1);if(!(k>0))return;
  const rg=mulberry32(((Math.round(L)*2654435761)^0x5EA1C10D)>>>0); // le hasard à part : la piste ne le voit pas
  const nM=Math.round(L/9*k),nE=Math.round(L/120*k),nF=Math.round(L/520*k)*(A.g[2]>0?1:0);
  const coq=function(rmin,rmax,j,n,out){ // un point sur la coquille autour de la piste, hors du couloir ; null s'il touche la garde
    for(let t=0;t<5;t++){const i=Math.min(NP-1,Math.floor((j+rg())/n*NP)),p=pts[i],z=rg()*2-1,a=rg()*6.2832,w=Math.sqrt(1-z*z),d=rmin+(rmax-rmin)*Math.sqrt(rg());
      const x=p.x+w*Math.cos(a)*d,y=p.y+z*d,zz=p.z+w*Math.sin(a)*d;if(!cotonTouche(x,y,zz,28,28)){out[0]=x;out[1]=y;out[2]=zz;return true;}}
    return false;};
  const pt=[0,0,0],PA=[],AA=[],DA=[],PB=[],AB=[],DB=[];
  for(let j=0;j<nM;j++){if(!coq(70,340,j,nM,pt))continue;PA.push(pt[0],pt[1],pt[2],.45+rg()*.9);AA.push(0,rg(),0,rg());DA.push(0,0,0,0);}
  const nm=PA.length/4;
  for(let j=0;j<nE;j++){if(!coq(120,480,j,nE,pt))continue;PA.push(pt[0],pt[1],pt[2],2.5+rg()*3.5);AA.push(2,rg(),0,rg());DA.push(0,0,0,0);}
  const ne=PA.length/4-nm;
  for(let j=0;j<nF;j++){if(!coq(180,520,j,nF,pt))continue; // un banc : un chef et des paires en V derrière lui, sur son cap
    const u=rg()*2-1,a=rg()*6.2832,w=Math.sqrt(1-u*u*.6),dx=w*Math.cos(a),dy=u*.6,dz=w*Math.sin(a),l=Math.hypot(dx,dy,dz),hx=dx/l,hy=dy/l,hz=dz/l;
    let sx=hz,sy=0,sz=-hx;{const ls=Math.hypot(sx,sz)||1;sx/=ls;sz/=ls;} // le travers (horizontal)
    const ph=rg(),span=700+rg()*400,sc=2.2+rg()*1,nb=5+Math.floor(rg()*3),pk=rg();
    for(let b=0;b<nb;b++){const r=Math.ceil(b/2),sd=b===0?0:(b%2?1:-1),back=r*sc*3.4,side=sd*r*sc*2.6;
      PB.push(pt[0]-hx*back+sx*side,pt[1]-hy*back,pt[2]-hz*back+sz*side,sc*(.9+rg()*.2));AB.push(1,ph,rg(),pk);DB.push(hx,hy,hz,span);}}
  const no=PB.length/4;NUEMB.n.m=nm;NUEMB.n.e=ne;NUEMB.n.o=no;
  const M=nuEmbMats(),mkg=function(P,Aa,D){const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3));g.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2,0,2,3]),1));
    g.setAttribute('aP',new THREE.InstancedBufferAttribute(new Float32Array(P),4));g.setAttribute('aA',new THREE.InstancedBufferAttribute(new Float32Array(Aa),4));g.setAttribute('aD',new THREE.InstancedBufferAttribute(new Float32Array(D),4));
    g.instanceCount=P.length/4;return g;};
  const tick=function(){NUEMB.U.uT.value=((performance.now()-NUEMB.t0)*.001)%1e4;}; // l'unique travail par image : un nombre
  if(nm+ne>0){const m=new THREE.Mesh(mkg(PA,AA,DA),M.add);m.name='nuEmbLumiere';m.frustumCulled=false;m.renderOrder=3;m.matrixAutoUpdate=false;m.visible=NUEMB.vis;m.onBeforeRender=tick;COTON.root.add(m);NUEMB.A=m;}
  if(no>0){const m=new THREE.Mesh(mkg(PB,AB,DB),M.nrm);m.name='nuEmbOiseaux';m.frustumCulled=false;m.renderOrder=3;m.matrixAutoUpdate=false;m.visible=NUEMB.vis;m.onBeforeRender=tick;COTON.root.add(m);NUEMB.B=m;}
  const U=NUEMB.U;U.uC0.value.fromArray(A.c0);U.uC1.value.fromArray(A.c1);U.uC2.value.fromArray(A.c2);U.uC3.value.fromArray(A.c3);U.uCb.value.fromArray(A.cb);U.uG.value.fromArray(A.g);NUEMB.sig=mt;
  if(!NUEMB.chaud&&typeof renderer!=='undefined'){NUEMB.chaud=true;try{const sc=new THREE.Scene(),a=NUEMB.A,b=NUEMB.B; // le programme se compile ICI, sous le voile du JOUER, pas à la 1re image en course
    for(const m9 of [a,b])if(m9){sc.add(m9);}renderer.compile(sc,camera);for(const m9 of [a,b])if(m9){sc.remove(m9);COTON.root.add(m9);}}catch(e9){}}
}
window.dbgEmbNuages=function(a,o){ /* (banc) sans argument : l'état · true/false : montrer / cacher · ('nu',{nuK,nuR,nuLav…}) : la matière des cumulus de l'ambiance courante, à chaud · ('u',{uG:[…],uC0:[…]…}) */
  if(a==='nu'){const n=BIO.name,B=BIOMES[n];if(B&&o){Object.assign(B,JSON.parse(JSON.stringify(o)));bioGo(n,.01);bioStep(1);}return B&&{bio:n,nuLav:B.nuLav,nuR:B.nuR,nuK:B.nuK};}
  if(a==='u'){for(const q in o)if(NUEMB.U[q]&&NUEMB.U[q].value.fromArray)NUEMB.U[q].value.fromArray(o[q]);return true;}
  if(a!==undefined){NUEMB.vis=!!a;for(const m of [NUEMB.A,NUEMB.B])if(m)m.visible=NUEMB.vis;}
  return {on:NUEMB.vis,meteo:NUEMB.sig,n:NUEMB.n,paliers:PAL.b('nuEmb',1),appels:(NUEMB.A?1:0)+(NUEMB.B?1:0)};};
