/* ===== LES DUNES EN FACETTES (2026-10-23, Léo : « rends-les en mode poly comme les voitures, toute la map, inspiré par la technique de la forêt » · « un effet de lumière, encore plus réaliste sur le sable ») =====
   Le sable ET les décors en facettes PLATES (la normale de chaque triangle, par dérivées de l'écran), une teinte par facette, des éclats quand une facette renvoie le soleil vers l'œil, et les JOINTS
   VITRAIL (de fines arêtes de lumière entre les facettes, qui pâlissent sous ~7 px — voir « LA TECHNIQUE VITRAIL » de la forêt). Le terrain n'a plus de cellule plus petite que ~7,5 m (DN.lmin : le quadtree CDLOD
   ne descend plus plus bas — MOINS de triangles) ; les joints du terrain sortent des coordonnées de la grille (vGp : exact même en plein morph), ceux des décors du numéro de sommet (gl_VertexID, géométrie non indexée).
   La lumière du sable : contre-jour chaud sur les crêtes, voile de diffusion vers le soleil, terminateur orangé (sous-surface), rebond chaud dans l'ombre.
   `?poly=0` = l'ancien rendu à l'identique · `?lumiere=0` = sans les effets de lumière · `dbgDunes('poly',{tint,joint,glint,flat,rim,scat,term,reb})` règle à chaud. */
const DN_POLY=!/[?&]poly=0\b/.test(location.search),DN_LUM=!/[?&]lumiere=0\b/.test(location.search),DN_CELL=7.5;
/* ---- LE SABLE À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const DN_TB='vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}';
const DN_VS=['attribute vec4 aN;uniform sampler2D uTC,uTZ,uTS,uNZ;uniform vec4 uFD,uZD,uSD,uOA,uW,uFin;uniform vec2 uFN,uZN,uSN;uniform vec3 uCam;uniform float uG,uR0,uLam;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_vertex>',DN_TB,
  'float gU,gP,gV,gM;',
  'float dnDune(vec2 x){vec2 W=uW.xy;float u=dot(x,W)/uLam,v=dot(x,vec2(-W.y,W.x)),w1=texture2D(uNZ,x/30000.).r-.5,w2=texture2D(uNZ,x/11000.+vec2(.37,.61)).r-.5,w3=texture2D(uNZ,x/5200.+vec2(.83,.17)).r-.5;',
  '  float a=u+1.4*w1+1.05*w2+.34*w3,f=fract(a);',
  '  float p=f<.72?pow(max(f/.72,1e-5),1.5):pow(max((1.-f)/.28,1e-5),1.15),m=.30+.70*clamp((texture2D(uNZ,vec2(v/9000.+.13,a*.13+.5)).r-.22)*1.9,0.,1.);',
  '  float a2=dot(x,uW.zw)/(uLam*.40)+1.6*w2+.5*w3,f2=fract(a2);',
  '  float p2=f2<.68?pow(max(f2/.68,1e-5),1.4):pow(max((1.-f2)/.32,1e-5),1.1);',
  '  gU=p*m;float h=p*m+.08*p2*(1.-.75*p);',
  /* LES DUNES ÉTOILÉES : la même fonction que dnDune (dunes-1.js) */
  ...(DN_STAR?['  float ts0=(texture2D(uNZ,x/16000.+vec2(.71,.29)).r-.5-.10)/.18,ts=clamp(ts0,0.,1.);ts=ts*ts*(3.-2.*ts);',
  '  if(ts>0.){float k=6.2832/(uLam*1.9);vec2 d2=vec2(-.5*W.x-.866*W.y,.866*W.x-.5*W.y),d3=vec2(-.5*W.x+.866*W.y,-.866*W.x-.5*W.y);',
  '    float s1=cos(k*dot(x,W)+9.*w3+5.*w1),s2=cos(k*dot(x,d2)+8.*w2+4.*w3),s3=cos(k*dot(x,d3)+7.*w3+5.*w2);float st=clamp((s1+s2+s3+1.5)/4.5,0.,1.);st=pow(st,2.2);',
  '    float hs=st*.95+.05*p2*(1.-.5*st);h+=(hs-h)*ts;gU+=(st-gU)*ts;}']:[]),
  '  return h;}',
  /* LES BUTTES : la même fonction que dnMesa (dunes-1.js) — un seuil du bruit (canal g), le haut par un autre (canal b), rien près de la route (Z.g = la distance à la route) */
  'float dnMesa(vec2 x,float dr){if(uFin.w>.5)return 0.;float n=texture2D(uNZ,x/11000.+vec2(.21,.73)).g,e=clamp((n-.58)/.14,0.,1.),m0=e*e*(3.-2.*e);if(m0<=0.)return 0.;',
  '  float t=texture2D(uNZ,x/1700.+vec2(.5,.1)).b,f=clamp((dr-260.)/260.,0.,1.),q=clamp((length(x-uFin.xy)-1800.)/1200.,0.,1.);return m0*f*f*(3.-2.*f)*q*q*(3.-2.*q)*(70.+110.*t);}',
  'vec4 dnHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float me=dnMesa(x,Z.g),mk=clamp(me/20.,0.,1.);float h=Z.r+Z.b*(dnDune(x)-.35)*(1.-.85*Z.a)*(1.-.92*mk)+me;gP=Z.a;gM=mk;gV=0.;',
  '  vec2 fp=(x-uFD.xy)*uFD.zw;if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);h=mix(h,C.r,C.g);}',
  '  float w=0.,dep=0.;if(uOA.z>0.){float rr=length(x-uOA.xy)/uOA.z;if(rr<2.4){float o=rr<1.?uOA.w-12.*(1.-rr*rr):uOA.w+(rr-1.)*uOA.z*.2;h=min(h,o);',
  '    gV=smoothstep(.95,1.06,rr)*(1.-smoothstep(1.30,1.62,rr));if(h<uOA.w-.05){dep=uOA.w-h;h=uOA.w;w=1.;}}}',
  '  return vec4(h,w,dep,0.);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=dnHt(x);float pu=gU,pa=gP,pm=gM,vg=gV,e=S/uG*(1.+k)*2.2;',
  '  float hx=dnHt(x+vec2(e,0.)).x,hz=dnHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-3.,hs+8.,A.x);}',
  '  vA=vec4(A.y,A.z,pu,lit);vB=vec4(pa,pm,0.,vg);vGp=gp;vF=vec4(aN.xy/aN.z,aN.w,uG);', /* (facettes) gp : la case de la grille (entiers aux sommets) · vF : l'indice de la tuile, son niveau, G */
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const DN_FS=['uniform sampler2D uNZ;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uSaA,uSaB,uSaL,uShd,uClay,uVeg,uHaze,uSkH,uSkZ,uWS,uWD,uPhP,uPhD,uPhC;uniform vec4 uQ,uK,uW,uMo,uPl,uLm;uniform float uTime,uFlash,uPoly,uLum;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_fragment>',
  'float dh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
  'void main(){vec3 N=normalize(vN),Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/max(dist,.001);',
  /* LES FACETTES (poly) : Nf = la normale PLATE du triangle (dérivées de la position), ftn = sa teinte, hs9 = son tirage, jn = le joint (la distance, EN PIXELS, aux trois arêtes du triangle : vGp = la case, entiers aux sommets,
     l'interpolation en reste exacte même quand le sommet glisse vers le niveau grossier) — le joint ne se voit que sur des cases larges (> ~7 px) et là où la facette s'écarte de la normale lisse */
  '  vec3 Ns=N,Nf=N;float ftn=1.,jn=0.,hs9=.5;',
  '  if(uPoly>.5){vec3 nf=cross(dFdx(vW),dFdy(vW));float lf=length(nf);if(lf>1e-14){Nf=nf/lf;if(dot(Nf,Ns)<0.)Nf=-Nf;}',
  '    vec2 fg=max(fwidth(vGp),vec2(1e-6)),fq=fract(vGp);float fb=fq.x+fq.y;vec2 ci=floor(vGp+.001)+floor(vF.xy+.5)*vF.w;',
  '    float d3=abs(fb-1.)/max(fwidth(vGp.x+vGp.y),1e-6),dm=min(min(min(fq.x,1.-fq.x)/fg.x,min(fq.y,1.-fq.y)/fg.y),d3);',
  '    hs9=dh2(ci*.731+step(1.,fb)*vec2(3.7,1.9));ftn=1.+(hs9-.5)*uPl.x;',
  '    jn=(1.-smoothstep(.3,1.3,dm))*smoothstep(6.,20.,1./max(fg.x,fg.y))*(.3+.7*smoothstep(.0008,.012,1.-dot(Nf,Ns)))*uPl.y;}',
  '  float wat=vA.x,dep=vA.y,du=clamp(vA.z,0.,1.),lit=clamp(vA.w,0.,1.),pan=clamp(vB.x,0.,1.),veg=clamp(vB.w,0.,1.)*(1.-wat);',
  '  vec4 n0=texture2D(uNZ,vW.xz/1900.),n1=texture2D(uNZ,vW.xz/260.),n2=texture2D(uNZ,vW.xz/37.);',
  '  float stp0=clamp(1.-N.y,0.,1.);vec2 pp=vW.xz,Wd=normalize(uW.xy+vec2(1e-4));float fp=length(fwidth(pp));',
  /* (2026-10-22, Léo : « la texture du sable, j'aime pas, pas très beau ») LE SABLE FAÇON JOURNEY — plus de mosaïque de cubes : des RIDES DU VENT en trois octaves (62 cm de près, 3 m, 13 m : la normale
     ondule en travers du vent, les crêtes serpentent et se fourchent, le vent tourne un peu d'un endroit à l'autre), des traînées longues dans le sens du vent, une lumière chaude côté soleil et froide
     côté ombre, un SATIN sur les crêtes de rides et des ÉCLATS qui scintillent quand l'œil bouge. Chaque octave s'efface avant de tomber sous ~3 px (fwidth : jamais de moiré). */
  '  float rm=(1.-.85*pan)*(1.-veg)*(1.-wat)*(1.-smoothstep(.22,.42,stp0))*uK.y,rv=0.;',
  '  if(rm>.001&&uMo.z>.001){float rot=(n0.r-.5)*.8+(n1.g-.5)*.6;vec2 d=vec2(Wd.x*cos(rot)-Wd.y*sin(rot),Wd.x*sin(rot)+Wd.y*cos(rot));',
  '    float wp=1.5*(n2.r-.5)+.75*(n2.g-.5);',
  '    float k1=(1.-smoothstep(.16,.42,fp/.62))*step(.6,uMo.z),k2=(1.-smoothstep(.16,.42,fp/3.1))*step(.2,uMo.z),k3=1.-smoothstep(.16,.42,fp/13.);',
  '    float a1=.20*k1*(1.-smoothstep(30.,95.,dist)),a2=.13*k2*(1.-smoothstep(300.,900.,dist)),a3=.09*k3*(1.-smoothstep(1000.,2600.,dist));',
  '    float s1=cos(6.2832*(dot(pp,d)/.62+wp)),s2=cos(6.2832*(dot(pp,d)/3.1+.8*wp+n2.r*1.5)),s3=cos(6.2832*(dot(pp,d)/13.+.5*wp+1.2*n1.r));',
  '    float amp=(.55+.9*n1.g)*rm;N=normalize(N-vec3(d.x,0.,d.y)*(a1*s1+a2*s2+a3*s3)*amp);rv=(a1*s1*.8+a2*s2*.55+a3*s3*.4)*amp;}',
  '  float stp=clamp(1.-N.y,0.,1.);vec3 NL=N;if(uPoly>.5){vec3 dv=Nf-Ns;NL=normalize(Ns+dv*min(uPl.w,.30/max(length(dv),1e-4))+(N-Ns)*.55);}', // (facettes) NL : la normale qui éclaire — la plate + la moitié des rides ; la matière (pente, roche…) lit toujours la lisse
  '  float st9=.5;if(uMo.z>.001)st9=texture2D(uNZ,vec2(dot(pp,Wd)/90.,dot(pp,vec2(-Wd.y,Wd.x))/15.)).g;', // les traînées longues, dans le sens du vent
  '  float tn=clamp(.5+(n0.r-.5)*1.7+(n1.g-.5)*.8+(st9-.5)*.55,0.,1.);vec3 sa=mix(uSaA,uSaB,tn)*(.96+.08*n2.b)*(1.+rv*.55);',
  '  sa=mix(sa,uSaL,smoothstep(.80,1.,du)*.40);', // la crête, plus claire
  '  float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));', // l'argile blanche et ses craquelures
  '  vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);vec3 col=mix(sa,clay,cl);col=mix(col,gv,veg);',
  /* LA ROCHE (2026-10-22) : les flancs raides — des buttes de grès — se couvrent de STRATES (des lits de ~20 m, du terracotta sombre à la crème, ondulés par le bruit, un joint sombre entre deux lits) ; sur le plateau, le sable reste */
  '  float rk=clamp(vB.y,0.,1.)*smoothstep(.08,.24,stp);', // (la roche : les BUTTES seulement — les parois de sable restent du sable)
  '  if(rk>.01){float yy=vW.y*.07+.42*n1.r+.12*n2.g,id=floor(yy),fb=fract(yy),h1=dh2(vec2(id,3.7)),h2=dh2(vec2(id,9.1));',
  '    vec3 rc=mix(uSaB*.74,uSaL*.98,h1*h1)*(.82+.36*h2)*(1.-.22*(1.-smoothstep(0.,.07,fb)));',
  '    float ve=texture2D(uNZ,vec2(dot(vW.xz,vec2(.7071,.7071))/11.,vW.y/70.)).g;rc*=.84+.32*ve;', // les cannelures verticales de l'érosion
  '    col=mix(col,rc,rk);}',
  '  if(uPoly>.5)col*=ftn*vec3(1.+(hs9-.5)*.08,1.,1.-(hs9-.5)*.10);vec3 Ls=normalize(vec3(uSunD.x,min(uSunD.y,uK.w),uSunD.z));float ndl=dot(NL,Ls),wr=clamp((ndl+uK.z)/(1.+uK.z),0.,1.);', // (uK.w : le soleil de midi est abaissé pour le RELIEF — la lumière de forme ; l'ombre, elle, reste celle du vrai soleil)
  '  float ao=mix(.80,1.,smoothstep(0.,.45,du));', // le creux d'une dune reçoit moins de ciel
  '  vec3 Lc=uSunC*wr*lit+mix(uGnd,uSky,NL.y*.5+.5)*1.15*ao+uFillC*max(dot(NL,uFillD),0.)*.5+uSunC*(.10+.16*rk)*(1.-lit)*(.6+.4*NL.y)+uGnd*.28*rk;', /* + le REBOND : le sable à l'ombre reçoit la lumière des dunes au soleil (jamais de creux noir) */
  '  vec3 c=col*Lc;',
  '  c=mix(c,c*uShd,(1.-lit*clamp(ndl*2.5+.2,0.,1.))*.45);', // l'ombre du sable tire au VIOLET (la bible)
  '  float fr=pow(1.-max(dot(NL,V),0.),4.);c+=(uSky*.22+uSunC*.16*max(ndl,0.)*lit)*fr*uK.x*(1.-wat);', // le SATIN du sable au rasant
  '  vec3 Hh=normalize(Ls+V);',
  '  if(wat<.5){c+=uSunC*pow(max(dot(NL,Hh),0.),26.)*lit*(.05+.55*rm*abs(rv))*(1.-smoothstep(200.,900.,dist));}', // le LUSTRE des crêtes de rides (sur la ride seulement)
  '  if(dist<115.&&wat<.5&&uMo.z>.9){vec2 gc=floor(pp*11.);float g1=dh2(gc),g2=dh2(gc+17.3),g3=dh2(gc+41.9);vec3 Nc=normalize(NL+vec3(g1-.5,g3*.3,g2-.5)*.9);',
  '    c+=uSunC*pow(max(dot(Nc,Hh),0.),520.)*step(.55,g3)*lit*uQ.w*(1.-smoothstep(40.,115.,dist))*6.;}', // les ÉCLATS : une facette de 9 cm au hasard, juste quand elle renvoie le soleil vers l'œil
  /* LES ÉCLATS DE FACETTE (le sable de près comme de loin : une facette plate qui renvoie le soleil vers l'œil) ET LES JOINTS VITRAIL (une arête de lumière, qui respire d'une onde lente) */
  '  if(uPoly>.5&&wat<.5){float fgl=pow(max(dot(NL,Hh),0.),70.)*step(.5,hs9)*lit*(1.-smoothstep(300.,2200.,dist));c+=uSunC*fgl*uPl.z*2.2;',
  '    float wv=.78+.22*sin(dot(vW.xz,vec2(.0049,.0031))-uTime*.7);c=mix(c,vec3(1.,.90,.72)*(dot(c,vec3(.3,.55,.15))*1.35+.04),jn*wv*.48);}',
  /* LA LUMIÈRE DU SABLE : le contre-jour (les crêtes s'embrasent quand on regarde vers le soleil), le voile de diffusion dans l'air, le terminateur orangé (la lumière qui traverse le grain), le rebond chaud dans l'ombre */
  '  if(uLum>.5&&wat<.5){float vs=max(dot(-V,Ls),0.),rim=pow(1.-max(dot(NL,V),0.),3.),tm=smoothstep(-.10,.16,ndl)*(1.-smoothstep(.16,.62,ndl));',
  '    c+=uSunC*vec3(1.,.70,.40)*rim*vs*vs*vs*lit*uLm.x*(1.-.5*smoothstep(1500.,4000.,dist));',
  '    c+=col*uSunC*vec3(.62,.24,.07)*tm*lit*uLm.z;',
  '    c+=col*uSunC*vec3(.95,.58,.32)*(1.-lit)*(.5+.5*NL.y)*.12*uLm.w;',
  '    c+=uSunC*vec3(1.,.80,.52)*pow(vs,6.)*(1.-exp(-dist/2600.))*uLm.y*.5;}',
  '  if(wat>.01){vec4 nw=texture2D(uNZ,mat2(.8,.6,-.6,.8)*vW.xz/57.+uTime*vec2(.006,.010)),nw2=texture2D(uNZ,vW.xz/143.-uTime*vec2(.004,.002));', /* (des bruits LARGES et tournés : à 18 m la tuile du bruit se répétait en grille sur le lac) */
  '    vec3 Nw=normalize(vec3(0.,6.,0.)+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.));',
  '    float f9=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));',
  '    vec3 cw=wc*(uSunC*(.3+.7*max(dot(Nw,uSunD),0.))*lit+mix(uGnd,uSky,.7))*.9+sk*f9+uSunC*pow(max(dot(R,uSunD),0.),160.)*1.2*lit;c=mix(c,cw,wat);}',
  '  if(uPhC.r+uPhC.g>.001){vec3 lv=vW-uPhP;float dl=length(lv);vec3 ld=lv/max(dl,.01);c+=col*uPhC*smoothstep(.80,.95,dot(ld,uPhD))*max(dot(NL,-ld),0.)/(1.+dl*dl/9000.);}', // les PHARES sur le sable
  /* LE MIRAGE : au loin, le sable presque à plat, vu en rasant, renvoie le ciel — et tremble */
  '  if(uQ.y>.001){float mi=uQ.y*smoothstep(800.,3200.,dist)*(1.-smoothstep(.02,.10,abs(V.y)))*(1.-smoothstep(.06,.25,stp));',
  '   float sh=texture2D(uNZ,vec2(vW.x/260.+uTime*.04,vW.z/260.-uTime*.03)).r;c=mix(c,mix(uSkH,uSkZ,.25)*(.92+.16*sh),mi*(.55+.45*sh));}',
  '  c=mix(c,uHaze,uQ.x*smoothstep(150.,4500.,dist)*.65);', // la poussière en suspension
  '  c=mix(c,uHaze,uQ.z*smoothstep(8.,500.,dist)*.5);', // (le vent de sable et la tempête : la poussière est DANS l'air tout près — le sable proche n'est plus net)
  '  c+=uFlash*col*vec3(.75,.78,1.)*(.35+.65*max(NL.y,0.));',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
/* LES HIÉROGLYPHES (2026-10-22, Léo : « construis ta connaissance culture générale Égypte ») — un atlas de 16 signes de 64 px dessinés au trait (blanc sur noir) : ânkh, œil oudjat, eau, roseau, plume de Maât, hibou, disque solaire, scarabée, papyrus,
   cobra, faucon, sceptre ouas, pilier djed, pain, panier, caille. La pierre gravée (aK 4 : obélisques, pylônes, frises) les lit par rangées (DN_AFS, uGl), assez grands pour se lire de ~60 m, jamais plus fins que ~3 px. */
function dnGlyphes(){if(DN.glT)return DN.glT;const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,256);x.strokeStyle='#fff';x.fillStyle='#fff';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';
  const G=[
   function(){x.beginPath();x.ellipse(32,17,9,12,0,0,6.283);x.stroke();x.beginPath();x.moveTo(32,29);x.lineTo(32,58);x.moveTo(18,36);x.lineTo(46,36);x.stroke();},                                  // ânkh
   function(){x.beginPath();x.moveTo(8,32);x.quadraticCurveTo(30,10,54,30);x.quadraticCurveTo(30,44,8,32);x.stroke();x.beginPath();x.arc(31,30,6,0,6.283);x.fill();x.beginPath();x.moveTo(14,20);x.quadraticCurveTo(30,8,50,18);x.moveTo(30,42);x.lineTo(34,56);x.quadraticCurveTo(46,58,48,48);x.stroke();}, // œil oudjat
   function(){x.beginPath();for(let r=0;r<3;r++){const y=16+r*14;x.moveTo(8,y);x.lineTo(20,y-7);x.lineTo(32,y);x.lineTo(44,y-7);x.lineTo(56,y);}x.stroke();},                                       // l'eau
   function(){x.beginPath();x.moveTo(32,58);x.quadraticCurveTo(14,32,32,6);x.quadraticCurveTo(50,32,32,58);x.stroke();x.beginPath();x.moveTo(32,58);x.lineTo(32,18);x.stroke();},               // le roseau
   function(){x.beginPath();x.moveTo(32,60);x.lineTo(32,8);x.stroke();x.beginPath();x.ellipse(32,30,10,24,0,0,6.283);x.stroke();for(let i=0;i<5;i++){x.beginPath();x.moveTo(32,16+i*8);x.lineTo(24,22+i*8);x.moveTo(32,16+i*8);x.lineTo(40,22+i*8);x.stroke();}}, // la plume de Maât
   function(){x.beginPath();x.ellipse(32,34,13,20,0,0,6.283);x.stroke();x.beginPath();x.arc(26,26,4,0,6.283);x.arc(38,26,4,0,6.283);x.fill();x.beginPath();x.moveTo(32,30);x.lineTo(32,36);x.moveTo(22,44);x.lineTo(42,44);x.moveTo(26,56);x.lineTo(26,62);x.moveTo(38,56);x.lineTo(38,62);x.stroke();}, // le hibou
   function(){x.beginPath();x.arc(32,32,18,0,6.283);x.stroke();x.beginPath();x.arc(32,32,6,0,6.283);x.fill();for(let i=0;i<8;i++){const a=i*.785;x.moveTo(32+Math.cos(a)*22,32+Math.sin(a)*22);x.lineTo(32+Math.cos(a)*28,32+Math.sin(a)*28);}x.stroke();}, // le disque solaire
   function(){x.beginPath();x.ellipse(32,34,12,17,0,0,6.283);x.stroke();x.beginPath();x.moveTo(32,17);x.lineTo(32,51);x.moveTo(22,28);x.lineTo(8,22);x.moveTo(22,40);x.lineTo(8,46);x.moveTo(42,28);x.lineTo(56,22);x.moveTo(42,40);x.lineTo(56,46);x.stroke();x.beginPath();x.arc(32,12,5,0,6.283);x.stroke();}, // le scarabée
   function(){x.beginPath();x.moveTo(32,60);x.lineTo(32,24);x.stroke();for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(32,24);x.quadraticCurveTo(32+i*8,12,32+i*11,6);x.stroke();}x.beginPath();x.moveTo(20,50);x.lineTo(44,50);x.stroke();}, // le papyrus
   function(){x.beginPath();x.moveTo(20,58);x.quadraticCurveTo(46,52,34,36);x.quadraticCurveTo(22,22,32,12);x.stroke();x.beginPath();x.ellipse(32,14,9,7,0,0,6.283);x.stroke();x.beginPath();x.arc(36,11,2,0,6.283);x.fill();}, // le cobra
   function(){x.beginPath();x.moveTo(14,56);x.lineTo(24,30);x.quadraticCurveTo(26,16,38,14);x.lineTo(46,18);x.lineTo(40,24);x.quadraticCurveTo(38,36,40,56);x.stroke();x.beginPath();x.arc(36,20,2.5,0,6.283);x.fill();x.beginPath();x.moveTo(24,40);x.lineTo(56,34);x.stroke();}, // le faucon
   function(){x.beginPath();x.moveTo(32,6);x.lineTo(32,56);x.moveTo(32,56);x.lineTo(22,62);x.moveTo(32,56);x.lineTo(42,62);x.stroke();x.beginPath();x.moveTo(24,8);x.quadraticCurveTo(32,2,40,8);x.stroke();}, // le sceptre ouas
   function(){x.beginPath();x.moveTo(32,6);x.lineTo(32,60);x.stroke();for(let i=0;i<4;i++){x.beginPath();x.moveTo(18,16+i*9);x.lineTo(46,16+i*9);x.stroke();}x.beginPath();x.moveTo(24,8);x.lineTo(40,8);x.stroke();}, // le pilier djed
   function(){x.beginPath();x.moveTo(8,46);x.quadraticCurveTo(32,6,56,46);x.closePath();x.stroke();},                                                                                                   // le pain
   function(){x.beginPath();x.moveTo(10,20);x.lineTo(54,20);x.lineTo(46,54);x.lineTo(18,54);x.closePath();x.stroke();x.beginPath();x.moveTo(14,32);x.lineTo(50,32);x.moveTo(16,44);x.lineTo(48,44);x.stroke();}, // le panier
   function(){x.beginPath();x.ellipse(30,38,17,13,0,0,6.283);x.stroke();x.beginPath();x.arc(44,26,7,0,6.283);x.stroke();x.beginPath();x.moveTo(50,24);x.lineTo(58,26);x.moveTo(26,50);x.lineTo(24,60);x.moveTo(36,50);x.lineTo(38,60);x.stroke();} // la caille
  ];
  for(let i=0;i<16;i++){x.save();x.translate((i%4)*64,Math.floor(i/4)*64);try{G[i]();}catch(e){}x.restore();}
  const tx=new THREE.CanvasTexture(cv);tx.generateMipmaps=true;tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;tx.wrapS=tx.wrapT=THREE.ClampToEdgeWrapping;tx.anisotropy=4;tx.needsUpdate=true;DN.glT=tx;return tx;}
function dnTerrain(){ if(DN.mesh)return;
  cyBruits();
  const G=PAL.b('dnGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];DN.G=G;DN.R0=PAL.b('dnR0',118);DN.lmin=DN_POLY?Math.max(0,Math.ceil(Math.log2(DN_CELL*G/DN.S0))):0; /* (facettes) la plus petite cellule : ~7,5 m (G=32 : niveau 2 = 8 m · G=16 : niveau 1 = 8 m) */
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  DN.aN=new THREE.InstancedBufferAttribute(new Float32Array(DN.maxN*4),4);DN.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',DN.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);DN.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;
  const C3=()=>({value:new THREE.Color()});
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTZ:{value:z1},uTS:{value:z1},uNZ:{value:CY.tNz},uGl:{value:dnGlyphes()},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uOA:{value:new THREE.Vector4(0,0,0,0)},uW:{value:new THREE.Vector4(1,0,1,0)},uLam:{value:560},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:DN.R0},uTime:{value:0},uFlash:{value:0},uSunD:{value:SUN_DIR},
    uSunC:C3(),uSky:C3(),uGnd:C3(),uFillC:C3(),uFillD:{value:new THREE.Vector3(0,-1,0)},uSaA:C3(),uSaB:C3(),uSaL:C3(),uShd:C3(),uClay:C3(),uVeg:C3(),uHaze:C3(),uSkH:C3(),uSkZ:C3(),uWS:C3(),uWD:C3(),
    uQ:{value:new THREE.Vector4()},uPoly:{value:DN_POLY?1:0},uLum:{value:DN_POLY&&DN_LUM?1:0},uPl:{value:new THREE.Vector4(.24,.8,1,3.2)},uLm:{value:new THREE.Vector4(.5,.25,.30,.06)},uFin:{value:new THREE.Vector4(0,0,0,0)},uK:{value:new THREE.Vector4(.5,1,.25,1)},uMo:{value:new THREE.Vector4(.8,.010,1,0)},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  DN.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_VS,fragmentShader:DN_FS,fog:true});DN.mat.dispose=function(){};
  const m=new THREE.Mesh(g,DN.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='dunes';m.renderOrder=-1;scene.add(m);DN.mesh=m;
  const gr=new THREE.Group();gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);DN.grp=gr;
}
/* LE QUADTREE (CDLOD), à chaque rendu — celui du canyon (cySelect), sur la grille des dunes */
function dnSelect(cam){const M=DN.mesh;if(!M||!M.visible)return;
  DN.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);DN.fr.setFromProjectionMatrix(DN.pm);
  const cx=cam.position.x,cz=cam.position.z,R0=DN.R0,A=DN.aN.array,MAX=DN.maxN,y0=DN.yMin,y1=DN.yMax,bx=DN.box,L9=DN.lods,lm=DN.lmin|0;let n=0;
  const dR=(x0,z0,s)=>{const dx=Math.max(x0-cx,0,cx-x0-s),dz=Math.max(z0-cz,0,cz-z0-s);return Math.sqrt(dx*dx+dz*dz);};
  const add=(x0,z0,s,l)=>{if(n>=MAX)return;const o=n*4;A[o]=x0;A[o+1]=z0;A[o+2]=s;A[o+3]=l;n++;};
  const sel=(x0,z0,s,l)=>{const d=dR(x0,z0,s);if(d>R0*Math.pow(2,l))return false;
    bx.min.set(x0,y0,z0);bx.max.set(x0+s,y1,z0+s);if(!DN.fr.intersectsBox(bx))return true;
    if(l<=lm||d>R0*Math.pow(2,l-1)){add(x0,z0,s,l);return true;}
    const h=s/2;for(let q=0;q<4;q++){const qx=x0+(q&1)*h,qz=z0+(q>>1)*h;if(!sel(qx,qz,h,l-1))add(qx,qz,h,l-1);}return true;};
  const SR=DN.S0*Math.pow(2,L9),reach=Math.min(R0*Math.pow(2,L9),(cam.far||9800)+400);
  for(let ix=Math.floor((cx-reach)/SR);ix<=Math.floor((cx+reach)/SR);ix++)for(let iz=Math.floor((cz-reach)/SR);iz<=Math.floor((cz+reach)/SR);iz++){
    if(dR(ix*SR,iz*SR,SR)>reach)continue;if(!sel(ix*SR,iz*SR,SR,L9))add(ix*SR,iz*SR,SR,L9);}
  DN.n=n;DN.tri=n*DN.G*DN.G*2;DN.geo.instanceCount=n;DN.aN.updateRange.offset=0;DN.aN.updateRange.count=n*4;DN.aN.needsUpdate=true;
  DN.mat.uniforms.uCam.value.copy(cam.position);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{if(DN.on)dnSelect(cam);}catch(e){window.__dnErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* chaque image : les lumières de la scène dans la matière du sable, l'ambiance des dunes (BIO.cur.dn*), l'éclair — et l'ombre des crêtes SUR LA
   CAISSE (la clé baisse quand on passe à l'ombre d'une dune : seul écrit du soleil hors de bioApply, et seulement ici — comme canyonTick, qu'il suit) */
/* (2026-10-20, LE DÉSERT AU HASARD) LES PALETTES DU SABLE : la teinte de l'ambiance tirée vers une autre teinte À LUMINANCE ÉGALE (la nuit reste la nuit) —
   [r, g, b de la teinte, part, gain de luminance] ; l'or = le sable d'avant */
const DN_SAB={or:null,rouge:[.82,.28,.15,.62,.92],blanc:[1,.95,.86,.78,1.2],rose:[.96,.60,.58,.6,1.06]};
function dnTeinte(c,T){const l=c.r*.3+c.g*.55+c.b*.15,n=T[0]*.3+T[1]*.55+T[2]*.15,g=l*T[4]/n,k=T[3];c.r+=(T[0]*g-c.r)*k;c.g+=(T[1]*g-c.g)*k;c.b+=(T[2]*g-c.b)*k;}
function dunesTick(dt){
  if(!DN.mat)return;const U=DN.mat.uniforms,c=BIO.cur,k=LVL.dunes||0;
  if(DN.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(DN.gx>1&&(mode!=='fall'||!DN.on))DN.gx=1; // le vol fini (ou la map quittée) : la pesanteur redevient la sienne
  U.uPoly.value=DN_POLY?1:0;U.uLum.value=DN_POLY&&DN_LUM&&!QUAL_LOW?1:0; /* (facettes) qualité basse : les facettes restent (moins de triangles), sans les effets de lumière */
  if(DN.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const f=(u,k9)=>{const a=c[k9];if(a)u.value.fromArray(a);};
    f(U.uSaA,'dnA');f(U.uSaB,'dnB');f(U.uSaL,'dnL');f(U.uShd,'dnS');f(U.uClay,'dnC');f(U.uVeg,'dnV');f(U.uHaze,'dnH');f(U.uWS,'dnW');f(U.uWD,'dnX');f(U.uSkH,'cyH');f(U.uSkZ,'cyZ');
    const D9=DN.deco,T9=D9&&DN_SAB[D9.sable];if(T9){dnTeinte(U.uSaA.value,T9);dnTeinte(U.uSaB.value,T9);dnTeinte(U.uSaL.value,T9);} // (2026-10-20) LA COULEUR DU SABLE tirée (relue chaque image : rien ne s'accumule)
    const Q9=c.dnQ||[0,0,0,0],K9=c.dnK||[.5,1,.25,1];U.uQ.value.set(Q9[0],Q9[1],Q9[2],Q9[3]);U.uK.value.set(K9[0],K9[1]*(D9?D9.vent.rides:1),K9[2],K9[3]);{const M9=c.dnM||[.8,.010,1,0];U.uMo.value.set(M9[0],M9[1],QUAL_LOW||!DN_MOSA?0:M9[2]*PAL.b('dnMo',1),M9[3]);} /* (2026-10-22, Léo : « le niveau dune n'est pas au niveau — regarde jade, la grotte, la forêt ») LA MOSAÏQUE du sable : [case de près (m), case par mètre de distance, force, —] */
    U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value;
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et dans la tempête
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}}
  let ombre=1;
  if(DN.on&&DN.O&&started&&!gameOver){const p=carGroup.position,O=DN.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/12));}}
  DN.ombre+=(ombre-DN.ombre)*Math.min(1,dt*5);dnPartTick(dt,c);
  if(k>.001||DN.ecrit){const e=DN.on?k:0;sun.intensity=c.sunI*(1-.62*(1-DN.ombre)*e);DN.ecrit=e>.001;}
  dnCaravane(dt);dnTornades(dt);dnVautours(dt);}
/* LES TREMPLINS DE CRÊTE (2026-10-22, Léo : « les routes qui font sauter embrassent une haute colline de sable… le joueur peut piquer en bas ou décoller »). La route est CONTINUE : chaque vague a son apex (DN.lev[k].s,
   le haut de la crête), et derrière lui la route redescend sur l'éperon. Une caisse qui y passe VITE (≥ 90 km/h) est lancée JUSTE ce qu'il faut pour retomber SUR la route de la descente (DN.lev[k].aim : la distance
   visée depuis l'apex), à n'importe quelle vitesse — t = aim / la vitesse (entre 0,6 et 2,6 s), la montée = ½ g t − la descente à franchir / t, moins ce que la pente de l'apex donne déjà (MESURÉ au pilote : « la pose
   se déclare dès 0,35 s si la caisse est à moins de 3 m du bitume » : on garde la caisse à plus de 4 m du ruban au bout de 0,35 s). En l'air le joueur choisit : PIQUER (le pouce vers le bas : la caisse se pose plus tôt,
   sur la pente) ou DÉCOLLER pour de bon (planer, des figures, se poser plus loin). Plus lente que 90 km/h, la caisse ne décolle pas : elle roule par-dessus la crête et DESCEND avec la route. g monde ~23 m/s²
   (FALL_G × SPD). Pas de recharge (rampCd). DN.sauts = le compte (banc). */
const DN_LF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const DN_GX={on:!/[?&]sans=([^&]*,)?dunesgrav(,|&|$)/.test(location.search),v0:110,p:1.3,max:2.3}; /* la pesanteur du vol : (vitesse / 110)^1,3, de ×1 à ×2,3 — `?sans=dunesgrav` = la pesanteur d'avant */
function dnLevre(s0){if(side<0||introD||driveDir<0)return;const a=Math.min(s0,s),b=Math.max(s0,s);
  for(const k of DN.lev){if(b<k.s||a>=k.e-2)continue;if(!(k.s>=a-.01&&k.s<=b+.01)&&!(s>k.s&&s<k.e-2))continue;if(Math.abs(lat)>ROAD_HALF)return;
    const vm=vitMult(),vx=Math.max(12,Math.abs(vA)*SPD*vm);if(vx*3.6<90)return; /* (trop lent : il roule par-dessus la crête) */
    const S9=DN.S,yAt=q=>{const f=Math.max(0,Math.min(S9.n-1.001,q/S9.ds)),i=Math.floor(f);return S9.y[i]+(S9.y[i+1]-S9.y[i])*(f-i);},gx=DN_GX.on?Math.max(1,Math.min(DN_GX.max,Math.pow(vx/DN_GX.v0,DN_GX.p))):1,g2=FALL_G*SPD*.5*gx,sb=Math.max(s,k.s),y0=yAt(sb);DN.gx=gx;
    const t=Math.max(.6,Math.min(2.6,Math.max(30,k.s+k.aim-sb)/vx)),D=y0-yAt(sb+vx*t),d35=y0-yAt(sb+vx*.35);
    frameAt(sb,DN_LF);const ty=DN_LF.t.y;
    const vy=Math.min(24,Math.max((g2*t*t-D)/t,(4+g2*.1225-d35)/.35)),u=THREE.MathUtils.clamp(vy/SPD-ty*Math.abs(vA)*vm,0,60);DN.dbgLev={gx:+gx.toFixed(2),vx:+vx.toFixed(1),vy:+vy.toFixed(1),u:+u.toFixed(1),ty:+ty.toFixed(3),t:+t.toFixed(2),D:+D.toFixed(1),d35:+d35.toFixed(1),k:DN.lev.indexOf(k),tag:k.tag};
    rampCd=1.2;startFall(u,1);shake=Math.max(shake,.42);fovPunch=Math.max(fovPunch,9);try{hap([8,14]);}catch(e){}DN.sauts=(DN.sauts|0)+1;return;}} // (le coup de tremplin : un coup de grand-angle et une secousse)
/* EN VOL : le sable, l'eau de l'oasis, les obélisques et la pyramide tuent (5 points de caisse) — renvoie la cause, ou '' */
/* LA CAISSE REPLACÉE REPART LANCÉE (2026-10-22, DEBUGGING : la seconde chance des dunes) — respawn() repose la caisse 8 m avant safeS, à vA 26 (~45 km/h). Dans les
   dunes, la dernière dalle roulée avant une chute est la LÈVRE : la caisse replacée y arrive au pas, dnLevre la lance à ~23 m/s, 2,6 s de vol font ~60 m au-dessus d'un
   vide de 70 à 200 m → ENSEVELI DANS LE SABLE à coup sûr (MESURÉ : la reprise gagnée d'une pub re-meurt sur la même lèvre ; sous le bouclier, chaque chute la replace
   au même endroit). Sur une map à trous, la caisse replacée repart à la croisière du palier (vPalier) : la lèvre suivante la pose comme d'habitude. */
function dnRelance(){if(!DN.on||!TROUS.length||mode!=='drive')return;const v9=vPalier()/(SPD*vitMult());if(Math.abs(vA)<v9){vA=v9;DN.relance=(DN.relance|0)+1;}}
/* (2026-10-23, Léo : « comme le jeu du pingouin où il faut atterrir pour prendre la vitesse ») SE POSER SUR LA PENTE — la route descend (sl = −T.y > 3,5 %) et la caisse arrive dans son axe : a = 1 quand l'écart entre sa trajectoire
   et la pente est nul (0 à 16°), pondéré par la raideur (plein à 10 %) ; la perte de la pose fond de 92 % × a et la caisse GAGNE g = a·(5 % + 45 % × sl) de vitesse (+ 5 à + 17 %). Une pose ratée, ou à plat, ne gagne rien. La pente
   elle-même accélère déjà (boucle-2 : −GRAV × T.y) ; ceci récompense le geste. `?sans=dunessurf` l'éteint. */
const DN_SURF=!/[?&]sans=([^&]*,)?dunessurf(,|&|$)/.test(location.search);
function dnSurf(i,fv,ratee){if(!DN_SURF||ratee)return null;const T9=T[i];if(!T9)return null;const sl=-T9.y;if(sl<.035)return null;const sp=fv.length();if(sp<8)return null;
  const ang=Math.acos(Math.max(-1,Math.min(1,fv.dot(T9)/sp)))*57.2958,a=Math.max(0,1-ang/16)*Math.min(1,(sl-.025)/.075);if(a<.12)return null;return {a:a,g:a*(.05+.45*sl),sl:sl,ang:ang};}
function dnSurfFx(o){DN.surf=(DN.surf|0)+1;DN.surfG=+o.g.toFixed(3);shake=Math.max(shake,.25+.3*o.a);fovPunch=Math.max(fovPunch,4+7*o.a);try{hap([6,10]);}catch(e){}
  if(o.a>.35)try{trickMsg(o.a>.75?'DESCENTE PARFAITE':'BONNE DESCENTE',o.a>.75?1:true);}catch(e){}}
const DN_H9={};
function dunesHeurt(p){if(!DN.on||!DN.Z)return '';
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1],h=dnHauteur(x,z,DN_H9);if(p.y<h+.7)return DN_H9.eau?'oasis':'sable';}
  return dnMonuHeurt(p);}
function dnMonuHeurt(p){
  for(const b of DN.ob){const dx=p.x-b.x,dz=p.z-b.z,t=Math.max(0,Math.min(1,(p.y-b.y)/b.h)),rr=b.r*(1.35-.69*t)+1.2;if(dx*dx+dz*dz<rr*rr&&p.y>b.y-2&&p.y<b.y+b.h+1)return 'obelisque';}
  const P=DN.pyr;if(P){const dx=p.x-P.x,dz=p.z-P.z,ca=Math.cos(P.a),sa=Math.sin(P.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca));
    if(p.y>P.y-20&&p.y<P.y+P.h+1&&e<P.hw*(1-(p.y-P.y)/P.h)+1.5)return 'pyramide';}
  for(const Q of DN.pyrs){if(Q===P)continue;const dx=p.x-Q.x,dz=p.z-Q.z,ca=Math.cos(Q.a),sa=Math.sin(Q.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca)); // (2026-10-20) les autres pyramides du tirage
    if(p.y>Q.y-20&&p.y<Q.y+Q.h+1&&e<Q.hw*(1-(p.y-Q.y)/Q.h)+1.5)return 'pyramide';}
  for(const m of DN.mo){const dx=p.x-m.x,dz=p.z-m.z;if(dx*dx+dz*dz<(m.r+1.2)*(m.r+1.2)&&p.y>m.y-2&&p.y<m.y+m.h+1)return 'roche';} // les grands monuments (sphinx, colosses, temple, portes)
  return '';}
/* ---- LES DÉCORS (low-poly à facettes : une face, une normale) — la même lumière que le sable et la même ombre (DN_MVS lit la grille de l'ombre) ---- */
const DN_MVS=['attribute float aK;uniform float uTime;uniform sampler2D uTS;uniform vec4 uSD;uniform vec2 uSN;varying vec3 vW,vN,vCol,vBc;varying float vLit,vK;','#include <fog_pars_vertex>',DN_TB,
  'void main(){','#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);if(aK>19.5&&aK<21.5){float u=clamp(aK-20.,0.,1.);wp.y+=sin(uTime*3.1+wp.x*.21+wp.z*.17+u*7.)*.55*u;wp.z+=cos(uTime*2.3+wp.x*.19+u*6.)*1.0*u;wp.x+=sin(uTime*2.7+u*5.)*.35*u;}vW=wp.xyz;vN=normalize(mat3(mw)*normal);',
  '#ifdef USE_COLOR','  vCol=color;','#else','  vCol=vec3(1.);','#endif',
  '  float cr9=mod(float(gl_VertexID),3.);vBc=vec3(1.-step(.5,cr9),step(.5,cr9)*(1.-step(1.5,cr9)),step(1.5,cr9));', // (facettes) le coin du triangle (géométrie NON indexée) : les coordonnées barycentriques des joints
  '  vK=aK;float lit=1.;vec2 sp=(wp.xz-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-3.,hs+8.,wp.y);}vLit=lit;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
/* (2026-10-22, Léo : « le niveau dune n'est pas au niveau ») LA MATIÈRE DES DÉCORS, REFAITE — par SOMMET (aK) : 0 peint (feuillage, toile, bois : lisse) · 1 ASSISES de pierre (rangées, joints décalés, la taille suit
   la distance : jamais plus fine que ~6 px) · 2 ROCHE (assises + lits) · 3 OR (brille) · 4 pierre GRAVÉE (assises + des glyphes, de près) · 5 GRÈS LISSE (la statue : une pierre d'une pièce, patinée) ; chaque bloc sa nuance et sa facette, son joint un peu sombre ; elles s'effacent sous ~2 px */
const DN_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uShd,uFillC,uFillD;uniform float uFlash,uTime,uPoly;uniform vec4 uMo,uPl;uniform sampler2D uNZ,uGl;varying vec3 vW,vN,vCol,vBc;varying float vLit,vK;','#include <fog_pars_fragment>',
  'float dh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'vec4 blk(vec2 uv,float ch,float sd){float row=floor(uv.y/ch),off=mod(row,2.)*.5;vec2 q=vec2(uv.x/(2.*ch)+off,uv.y/ch),ic=floor(q),fr=fract(q),e=min(fr,1.-fr);',
  '  float r=dh3(vec3(ic,sd)),r2=dh3(vec3(ic+7.7,sd+3.1)),j=1.-smoothstep(0.,.07,min(e.x*2.,e.y));vec2 g=(fr-.5)*vec2(1.6,1.);',
  '  float gl=step(abs(g.x),.5)*step(abs(g.y),.36)*step(.5,fract(g.y*3.4+r*6.))*step(.45,r2)*(1.-j);return vec4(r,j,r2,gl);}',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 N0=N,Nf=N;if(uPoly>.5){vec3 nf=cross(dFdx(vW),dFdy(vW));float lf=length(nf);if(lf>1e-14){Nf=nf/lf;if(dot(Nf,N0)<0.)Nf=-Nf;}}float dist=length(cameraPosition-vW);vec3 c=vCol*vCol;float kk=vK,isB=step(.5,kk)*step(kk,1.5)+step(3.5,kk)*step(kk,4.5),isR=step(1.5,kk)*step(kk,2.5),isG=step(2.5,kk)*step(kk,3.5),isS=step(4.5,kk)*step(kk,5.5),pierre=min(1.,isB+isR+isS);c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,mix(1.25,1.0,pierre)),0.);',
  '  vec3 aN=abs(N);vec2 tg=normalize(vec2(-N.z,N.x)+vec2(1e-5));vec2 uv=aN.y>.88?vW.xz:vec2(dot(vW.xz,tg),vW.y);', // (les assises SUIVENT la face : le long de sa tangente horizontale et de la hauteur — plus de tuiles en biais sur les flancs inclinés d'une pyramide, plus de couture entre deux axes)
  '  float Lg=log2(max(dist*.011,.75)/.75),l0=floor(Lg),wl=Lg-l0,ch=.75*exp2(l0),kf=(1.-smoothstep(.45,1.1,length(fwidth(uv))/ch))*uMo.z;',
  '  if(isB+isR>.5&&uMo.z>.001){vec4 b=mix(blk(uv,ch,l0),blk(uv,ch*2.,l0+1.),wl);c*=(1.+(b.x-.5)*.42*kf)*(1.-b.y*(.20+.06*isB)*kf)*(1.+.10*pierre);N=normalize(N+(vec3(b.x,b.z,fract(b.x*7.31))-.5)*.22*kf);',
  '    if(kk>3.5){float gs=max(ch*1.7,.9),kg=1.-smoothstep(.20,.55,length(fwidth(uv))/gs);vec2 gq=uv/gs,gc=floor(gq),gf=fract(gq);float hr=dh3(vec3(gc.y,3.3,1.)),hc=dh3(vec3(gc,5.5)),ok=step(.20,hr)*step(.10,hc)*step(.07,gf.x)*step(gf.x,.93)*step(.07,gf.y)*step(gf.y,.93);float ix=floor(hc*16.);',
  '      float gly=texture2D(uGl,(vec2(mod(ix,4.),floor(ix/4.))+gf*.84+.08)/4.).r;c*=1.-.46*gly*ok*kg;}}',
  '  if(isR>.5){vec2 nq=vec2(dot(vW.xz,vec2(.7071,.7071))/9.,vW.y/60.);float nr=texture2D(uNZ,nq).g;c*=.80+.40*nr;}',
  '  if(isS>.5){float nq=texture2D(uNZ,vW.xz/5.+vec2(vW.y/7.,vW.y/11.)).g,nb=texture2D(uNZ,vW.xz/1.3+vec2(vW.y/1.7,0.)).r;c*=(.82+.34*nq)*(.94+.12*nb);}',
  '  vec3 NL=N;','#ifndef DN_TOR','  float pf9=step(.5,uPoly)*(1.-step(21.5,kk)*step(kk,22.5));NL=normalize(mix(N,normalize(Nf+(N-N0)*.8),pf9*min(uPl.w,1.)));','#endif',
  '  float ndl=max(dot(NL,uSunD),0.);',
  '  vec3 L=uSunC*ndl*vLit*mix(1.,.78,pierre)+mix(uGnd,uSky,NL.y*.5+.5)+uGnd*.45*pierre*(1.-abs(NL.y))+uFillC*max(dot(NL,uFillD),0.)*.5;vec3 o=c*L;o=mix(o,o*uShd,(1.-vLit*min(1.,ndl*3.))*.45);',
  '  if(isG>.5){vec3 V=normalize(cameraPosition-vW),R=reflect(-uSunD,NL);o+=c*uSunC*pow(max(dot(R,V),0.),22.)*1.5*vLit+c*mix(uGnd,uSky,.6)*.3*pow(1.-max(dot(NL,V),0.),2.)+c*.34;}',
  '#ifdef DN_OR','  {vec3 V=normalize(cameraPosition-vW),R=reflect(-uSunD,NL);o+=c*uSunC*pow(max(dot(R,V),0.),24.)*1.8*vLit+c*mix(uGnd,uSky,.6)*.4*pow(1.-max(dot(NL,V),0.),2.);}','#endif',
  '#ifndef DN_TOR',
  '  if(uPoly>.5&&pf9>.5){vec3 Vp=normalize(cameraPosition-vW),Hp=normalize(uSunD+Vp);o*=1.+uPl.x*.5*sin(dot(Nf,vec3(37.1,53.7,41.3))+kk*1.7);', // (facettes) une teinte par facette, un éclat quand elle renvoie le soleil vers l'œil
  '    o+=c*uSunC*pow(max(dot(NL,Hp),0.),mix(70.,36.,isG))*vLit*mix(.18,1.3,isG)*uPl.z*(1.+.8*isS);',
  '    vec3 fw=max(fwidth(vBc),vec3(1e-6));float dj=min(min(vBc.x/fw.x,vBc.y/fw.y),vBc.z/fw.z),fpx=1./max(max(fw.x,fw.y),fw.z),cj=smoothstep(.0012,.014,1.-dot(Nf,N0));', // (VITRAIL) les joints : l'arête du triangle, là où la facette s'écarte de la normale lisse
  '    float jj=(1.-smoothstep(.35,1.4,dj))*smoothstep(7.,24.,fpx)*cj*uPl.y*(.78+.22*sin(dot(vW.xz,vec2(.0049,.0031))-uTime*.7));',
  '    o=mix(o,vec3(1.,.90,.72)*(dot(o,vec3(.3,.55,.15))*1.45+.03),jj*.6);}','#endif',
  '  if(kk>21.5&&kk<22.5)o=c*(2.3+.7*sin(uTime*11.+vW.x*2.3+vW.z*3.1));', // (la flamme : lumineuse de l'intérieur, elle vacille)
  '  o+=uFlash*c*.4;gl_FragColor=vec4(o,1.);','#ifdef DN_TOR','  {float fa=abs(dot(normalize(vN),normalize(cameraPosition-vW))),sw=texture2D(uNZ,vec2(vW.x*.0042+vW.z*.0031,vW.y/55.-uTime*.22)).g;gl_FragColor.a=vK>29.5?(.46*pow(1.-clamp(vK-30.,0.,1.),2.4))*(.7+.6*sw):(.03+.20*smoothstep(0.,.75,fa))*(.30+1.3*sw);}','#endif','#include <fog_fragment>','}'].join('\n');
function dnMats(){if(DN.mm)return DN.mm;const U=DN.mat.uniforms;
  const mk=or=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_MVS,fragmentShader:DN_AFS,fog:true,vertexColors:true,side:THREE.DoubleSide});if(or)m.defines={DN_OR:''};m.dispose=function(){};return m;};
  const mkT=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_MVS,fragmentShader:DN_AFS,fog:true,vertexColors:true,side:THREE.DoubleSide,transparent:true,depthWrite:false});m.defines={DN_TOR:''};m.dispose=function(){};return m;}; // le DIABLE DE SABLE : une colonne de poussière TRANSLUCIDE (plus un éclat de pierre)
  DN.mm={t:mk(false),g:mk(true),d:mkT()};return DN.mm;}
function dnGeo(){const P=[],C=[];
  const tri=(a,b,c,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const v=.92+.16*Math.abs(Math.sin(P.length*.731));for(let k=0;k<3;k++)C.push(col[0]*v,col[1]*v,col[2]*v);};
  const quad=(a,b,c,d,col)=>{tri(a,b,c,col);tri(a,c,d,col);};
  // un tronc de prisme à n pans : du rayon r0 (hauteur y0, centre o0) au rayon r1 (y1, o1) — r1 = 0 : une pointe
  const prisme=(n,y0,y1,r0,r1,col,o0,o1,rot)=>{o0=o0||[0,0];o1=o1||o0;rot=rot||0;const p=(a,y,r,o)=>[o[0]+Math.cos(a)*r,y,o[1]+Math.sin(a)*r];
    for(let k=0;k<n;k++){const a1=rot+k/n*6.2832,a2=rot+(k+1)/n*6.2832;if(r1>0)quad(p(a1,y0,r0,o0),p(a1,y1,r1,o1),p(a2,y1,r1,o1),p(a2,y0,r0,o0),col);else tri(p(a1,y0,r0,o0),[o1[0],y1,o1[1]],p(a2,y0,r0,o0),col);}};
  const fin=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.setAttribute('aK',new THREE.Float32BufferAttribute(new Float32Array(P.length/3),1));return g;}; // (aK = 0 : peint)
  return {tri:tri,quad:quad,prisme:prisme,fin:fin};}
function dnGeos(){if(DN.geos)return DN.geos;const G9={};
  {const g=dnGeo(),pi4=Math.PI/4,pierre=[.30,.44,.78],sombre=[1,.80,.34]; /* (MESURÉ à la photo : en grès, l'obélisque se perdait dans le sable — LAPIS-LAZULI cerclé d'or : le teal contre l'or de la DA) */g.prisme(4,0,.04,1.42,1.36,sombre,null,null,pi4);     // L'OBÉLISQUE (r = 1, h = 1) : le socle, le fût en trois tambours
    g.prisme(4,.04,.36,1,.89,pierre,null,null,pi4);g.prisme(4,.36,.38,.89,.885,sombre,null,null,pi4);g.prisme(4,.38,.64,.885,.79,pierre,null,null,pi4);g.prisme(4,.64,.66,.79,.785,sombre,null,null,pi4);g.prisme(4,.66,.90,.785,.70,pierre,null,null,pi4);G9.ob=g.fin();}
  {const g=dnGeo();g.prisme(4,.90,1,.70,0,[1,.80,.32],null,null,Math.PI/4);G9.obOr=g.fin();}                                      // son pyramidion d'or
  {const g=dnGeo(),pi4=Math.PI/4,c1=[.98,.80,.54],c2=[.92,.72,.46];                                                                  // LA PYRAMIDE (demi-base 1, h 1) : des assises en gradins doux
    for(let k=0;k<6;k++){const y0=k*.155,y1=(k+1)*.155,r0=(1-y0)*1.4142,r1=(1-y1)*1.4142;g.prisme(4,y0,y1,r0,r1,k&1?c2:c1,null,null,pi4);}
    g.prisme(4,.93,.94,.07*1.4142,.06*1.4142,c2,null,null,pi4);G9.pyr=g.fin();}
  {const g=dnGeo();g.prisme(4,.94,1,.06*1.4142,0,[1,.82,.30],null,null,Math.PI/4);G9.pyrOr=g.fin();}                               // la coiffe d'or
  {const g=dnGeo(),n9=[.13,.09,.07],n8=[.18,.12,.09];g.prisme(5,0,.42,.06,.04,n9,[0,0],[.05,.02]);                                   // L'ACACIA MORT (h = 1) : le tronc tordu, les branches
    for(const [ax,az,l,y] of [[.9,.3,.55,.40],[-.7,.6,.5,.38],[.2,-.95,.45,.42],[-.4,-.5,.38,.55],[.6,.75,.35,.6]]){const ex=.05+ax*l,ez=.02+az*l;g.prisme(4,y,y+.28+l*.4,.03,.012,n8,[.05,.02],[ex,ez]);}
    G9.arb=g.fin();}
  {const g=dnGeo(),tr=[.52,.38,.24],tr2=[.44,.31,.19],ve=[.22,.52,.16],ve2=[.16,.42,.12];let ox=0;                                    // LE PALMIER (h = 1) : le stipe qui penche, sept palmes qui retombent
    for(let k=0;k<5;k++){const y0=k*.18,y1=(k+1)*.18,o0=ox;ox+=.025+k*.012;g.prisme(5,y0,y1,.032-k*.003,.029-k*.003,k&1?tr2:tr,[o0,0],[ox,0]);}
    for(let k=0;k<7;k++){const a=k/7*6.2832+.3,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,c0=[ox,.90,0],m=[ox+ca*.22,.98,sa*.22],e=[ox+ca*.42,.80,sa*.42],w=.07;
      g.tri(c0,[m[0]+px*w,m[1],m[2]+pz*w],m,k&1?ve:ve2);g.tri(c0,m,[m[0]-px*w,m[1],m[2]-pz*w],k&1?ve2:ve);g.tri(m,[m[0]+px*w,m[1],m[2]+pz*w],e,ve2);g.tri(m,e,[m[0]-px*w,m[1],m[2]-pz*w],ve);}
    G9.pal=g.fin();}
  {const g=dnGeo(),ro=[.80,.58,.36],ro2=[.70,.48,.28],q=(x,y,z,sx,sy,sz,col)=>g.prisme(4,y,y+sy,Math.hypot(sx,sz)*.5,Math.hypot(sx,sz)*.5,col,[x,z],[x,z],Math.PI/4); // LE CHAMEAU (h ≈ 1, long ≈ 1,1, vers +z)
    q(0,.52,0,.30,.22,.62,ro);g.prisme(4,.74,.96,.17,.0,ro2,[0,-.02],[0,.0]);                                                         // le corps, la bosse
    g.prisme(4,.62,.92,.07,.05,ro,[0,.30],[0,.44]);g.prisme(4,.92,1,.06,.05,ro2,[0,.44],[0,.56]);                                     // le cou, la tête
    for(const [x,z] of [[.10,.22],[-.10,.22],[.10,-.22],[-.10,-.22]])g.prisme(4,0,.54,.035,.045,ro2,[x,z],[x,z]);                    // les quatre jambes
    G9.cha=g.fin();}
  DN.geos=G9;return G9;}
/* (2026-10-20, LE DÉSERT AU HASARD) LES PIÈCES NEUVES — la même kit à facettes (prismes, boîtes, tubes), couleurs pleines, à l'unité : elles ne sont pas
   dessinées telles quelles, elles sont CUITES (decoCuiseur) dans une géométrie par piste, la matière des décors (M9.t) : aucun programme neuf. */
function dnGeoPlus(g){
  g.boite=(x0,x1,y0,y1,z0,z1,col)=>{const a=[x0,y0,z0],b=[x1,y0,z0],c=[x1,y0,z1],d=[x0,y0,z1],e=[x0,y1,z0],f=[x1,y1,z0],h=[x1,y1,z1],i=[x0,y1,z1];
    g.quad(a,b,f,e,col);g.quad(b,c,h,f,col);g.quad(c,d,i,h,col);g.quad(d,a,e,i,col);g.quad(e,f,h,i,col);g.quad(a,d,c,b,col);};
  g.tube=(n,A,B,r0,r1,col,rot)=>{const ax=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(ax[0],ax[1],ax[2])||1;for(let k=0;k<3;k++)ax[k]/=l;
    const up=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],u=[ax[1]*up[2]-ax[2]*up[1],ax[2]*up[0]-ax[0]*up[2],ax[0]*up[1]-ax[1]*up[0]],ul=Math.hypot(u[0],u[1],u[2]);for(let k=0;k<3;k++)u[k]/=ul;
    const v=[ax[1]*u[2]-ax[2]*u[1],ax[2]*u[0]-ax[0]*u[2],ax[0]*u[1]-ax[1]*u[0]],p=(O,r,t)=>[O[0]+(u[0]*Math.cos(t)+v[0]*Math.sin(t))*r,O[1]+(u[1]*Math.cos(t)+v[1]*Math.sin(t))*r,O[2]+(u[2]*Math.cos(t)+v[2]*Math.sin(t))*r];
    for(let k=0;k<n;k++){const t1=(rot||0)+k/n*6.2832,t2=(rot||0)+(k+1)/n*6.2832;if(r1>0)g.quad(p(A,r0,t1),p(B,r1,t1),p(B,r1,t2),p(A,r0,t2),col);else g.tri(p(A,r0,t1),B,p(A,r0,t2),col);}};
  return g;}
function dnGeos2(){if(DN.geos2)return DN.geos2;const G9={},pi4=Math.PI/4,PIE=[.90,.74,.52],PI2=[.80,.63,.42],LAP=[.30,.44,.78],OR=[1,.80,.32];
  {const g=dnGeoPlus(dnGeo()),ca=[.97,.92,.82];g.prisme(4,0,.30,1.4142,.70*1.4142,ca,null,null,pi4);g.prisme(4,.30,.31,.70*1.4142,.69*1.4142,[.88,.82,.70],null,null,pi4);  // LA PYRAMIDE LISSE (demi-base 1, h 1) : le parement de calcaire
    g.prisme(4,.31,.94,.69*1.4142,.06*1.4142,ca,null,null,pi4);G9.pyrL=g.fin();}
  {const g=dnGeoPlus(dnGeo()),N=6;for(let k=0;k<N;k++){const y0=k/N,y1=(k+1)/N-.004,r0=(1-k/(N+.6))*1.4142,r1=(1-(k+1)/(N+.6))*1.4142;          // LA PYRAMIDE À DEGRÉS (Djoser) : des gradins droits
      g.prisme(4,y0,y1,r0,r0*.985,k&1?PI2:PIE,null,null,pi4);g.prisme(4,y1,y1+.004,r0*.985,k<N-1?r1:0,[.95,.82,.60],null,null,pi4);}G9.pyrE=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.boite(-.2,.2,0,.03,-.5,.52,PI2);g.boite(-.14,.14,.03,.2,-.46,.16,PIE);g.prisme(6,.03,.19,.15,.13,PIE,[0,-.40],[0,-.42]);       // LE SPHINX (long 1, vers +z) : le socle, le corps, la croupe
    g.boite(-.13,-.05,.03,.08,.12,.48,PIE);g.boite(.05,.13,.03,.08,.12,.48,PIE);g.boite(-.12,.12,.03,.25,.10,.27,PI2);                                         // les pattes, le poitrail
    g.prisme(4,.20,.33,.17,.11,LAP,[0,.22],[0,.23],pi4);g.boite(-.065,.065,.21,.32,.24,.33,PIE);g.prisme(4,.33,.345,.11,.05,OR,[0,.23],[0,.23],pi4);          // le némès (lapis), la face, la coiffe
    g.boite(-.1,.1,.18,.21,.27,.31,OR);G9.sphinx=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.boite(-.27,.27,0,.56,-.30,.06,PI2);g.boite(-.27,.27,.56,.86,-.30,-.20,PI2);                                                   // LE COLOSSE ASSIS (h 1, vers +z) : le trône
    for(const sx of [-1,1]){g.boite(sx<0?-.2:.03,sx<0?-.03:.2,.36,.5,-.04,.30,PIE);g.boite(sx<0?-.19:.04,sx<0?-.04:.19,0,.46,.21,.31,PIE);g.boite(sx<0?-.21:.02,sx<0?-.02:.21,0,.05,.26,.42,PIE); // cuisses, jambes, pieds
      g.boite(sx<0?-.28:.20,sx<0?-.20:.28,.48,.76,-.14,-.02,PIE);g.boite(sx<0?-.26:.18,sx<0?-.18:.26,.46,.52,-.02,.28,PIE);}                                     // les bras sur les cuisses
    g.prisme(4,.5,.80,.21,.16,PIE,[0,-.08],[0,-.08],pi4);g.boite(-.07,.07,.79,.93,-.15,-.01,PIE);g.prisme(4,.84,1,.12,.05,LAP,[0,-.09],[0,-.09],pi4);g.boite(-.03,.03,.72,.80,.0,.03,OR);G9.colosse=g.fin();}
  {const g=dnGeoPlus(dnGeo()),bl=[.95,.90,.80];g.boite(-.13,.13,0,.05,-.13,.13,bl);g.prisme(8,.05,.9,.1,.088,bl);g.prisme(8,.86,.9,.088,.12,bl);g.boite(-.14,.14,.9,1,-.14,.14,bl);G9.colonne=g.fin();} // LA COLONNE (h 1)
  {const g=dnGeoPlus(dnGeo());g.boite(-.5,.5,0,1,-.5,.5,[1,1,1]);G9.boite=g.fin();}                                                                          // LA BOÎTE (teintée à la cuisson : dalles, poutres, maisons de terre)
  {const g=dnGeoPlus(dnGeo()),P2=[.86,.70,.48],P3=[.78,.60,.40];                                                                                            // LA PORTE DE PIERRE (le pylône, h 1, large 2,2, vers +z)
    const pyl=(x0,x1)=>{const a=[x0,0,-.13],b=[x1,0,-.13],c=[x1,0,.13],d=[x0,0,.13],m=(x0+x1)/2,w=(x1-x0)/2*.82,e=[m-w,1,-.09],f=[m+w,1,-.09],h=[m+w,1,.09],i=[m-w,1,.09];
      g.quad(a,b,f,e,P2);g.quad(b,c,h,f,P3);g.quad(c,d,i,h,P2);g.quad(d,a,e,i,P3);g.quad(e,f,h,i,P2);g.boite(m-w-.02,m+w+.02,1,1.05,-.12,.12,P3);g.boite(m-w,m+w,.84,.88,.09,.1,LAP);};
    pyl(-1.1,-.18);pyl(.18,1.1);g.boite(-.2,-.13,0,.62,-.09,.09,P2);g.boite(.13,.2,0,.62,-.09,.09,P2);g.boite(-.22,.22,.62,.72,-.11,.11,P3);g.boite(-.18,.18,.64,.7,.11,.12,OR);G9.porte=g.fin();}
  {const g=dnGeoPlus(dnGeo()),c1=[.24,.17,.13],c2=[.58,.34,.20],A=[-.5,.06,-.5],B=[-.5,.06,.5],C=[0,.5,.5],E=[0,.5,-.5],A2=[.5,.06,-.5],B2=[.5,.06,.5];      // LA TENTE BÉDOUINE (1 × 1, h ,5)
    g.quad(A,B,C,E,c1);g.quad(A2,E,C,B2,c2);g.tri(A,E,A2,c1);g.tri(B,B2,C,c2);g.boite(-.5,.5,0,.06,-.5,.5,[.40,.28,.20]);G9.tente=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.prisme(5,0,.7,.32,0,[1,.52,.10]);g.prisme(4,0,.45,.2,0,[1,.86,.30],null,null,.5);for(let k=0;k<7;k++){const a=k/7*6.28;g.boite(Math.cos(a)*.45-.06,Math.cos(a)*.45+.06,0,.1,Math.sin(a)*.45-.06,Math.sin(a)*.45+.06,[.42,.38,.34]);}G9.feu=g.fin();} // LE FEU de camp et ses pierres
  {const g=dnGeoPlus(dnGeo()),os=[.96,.93,.84];g.tube(4,[0,.1,-.5],[0,.1,.42],.018,.012,os);g.boite(-.05,.05,.02,.1,.42,.56,os);g.boite(-.035,.035,0,.03,.44,.6,os); // LE SQUELETTE GÉANT (long 1) : l'échine, le crâne, la mâchoire
    for(let k=0;k<8;k++){const z=-.28+k*.075,s9=1-Math.abs(k-3)*.12;for(const sx of [-1,1]){const P9=[[0,.1],[.10*s9,.12*s9+.02],[.17*s9,.05],[.16*s9,-.01]];for(let j=0;j<3;j++)g.tube(4,[sx*P9[j][0],P9[j][1],z],[sx*P9[j+1][0],P9[j+1][1],z+.01],.008,.007,os);}}
    G9.os=g.fin();}
  {const g=dnGeoPlus(dnGeo()),al=[.80,.82,.84],al2=[.66,.68,.70],ro=[.62,.34,.20],rg=[.74,.16,.14];g.tube(7,[0,0,-.42],[0,0,.40],.07,.065,al);g.tube(7,[0,0,.40],[0,-.01,.5],.065,.02,al2); // L'ÉPAVE D'AVION (long 1, vers +z)
    g.tube(7,[0,0,-.42],[0,.03,-.56],.07,.015,al2);g.boite(-.03,.03,0,.17,-.56,-.46,rg);g.boite(-.2,.2,0,.01,-.56,-.5,al2);g.boite(-.52,.30,-.015,.012,-.04,.12,al);g.boite(.3,.36,-.02,.01,-.02,.10,ro);
    g.boite(-.072,.072,-.02,.02,.1,.14,rg);G9.avion=g.fin();}
  {const g=dnGeoPlus(dnGeo()),bo=[.48,.32,.18],bo2=[.40,.26,.14],pt=[.62,.46,.28],Z9=[-.5,-.3,0,.3,.5],W9=[.05,.13,.16,.12,0],Y9=[.20,.15,.15,.17,.26];   // LE BOUTRE ÉCHOUÉ (long 1, vers +z)
    for(let k=0;k<4;k++)for(const sx of [-1,1]){const a=[sx*W9[k],Y9[k],Z9[k]],b=[sx*W9[k+1],Y9[k+1],Z9[k+1]],c=[0,0,Z9[k+1]*.9],d=[0,0,Z9[k]*.9];g.quad(a,b,c,d,sx<0?bo:bo2);}
    for(let k=0;k<4;k++)g.quad([-W9[k],Y9[k],Z9[k]],[W9[k],Y9[k],Z9[k]],[W9[k+1],Y9[k+1],Z9[k+1]],[-W9[k+1],Y9[k+1],Z9[k+1]],pt);
    g.tube(5,[0,.15,.06],[.02,.72,.04],.012,.008,bo2);g.tube(4,[0,.70,-.26],[0,.44,.42],.006,.005,bo2);g.tri([0,.69,-.24],[0,.46,.38],[.01,.2,.1],[.90,.84,.70]);G9.bateau=g.fin();}
  {const g=dnGeoPlus(dnGeo()),O=[[0,0,0],[.02,.18,.01],[-.03,.36,.03],[.04,.55,-.02],[-.02,.75,.04],[.05,1,0]],R9=[.03,.06,.10,.15,.22,.32];               // LE DIABLE DE SABLE (h 1) : une colonne qui se tord et s'évase
    for(let k=0;k<5;k++)g.tube(7,O[k],O[k+1],R9[k],R9[k+1],[.88+k*.012,.68+k*.03,.46+k*.04],k*.4);G9.tor=g.fin();}
  {const g=dnGeoPlus(dnGeo()),N=48,M=5,y9=j=>1+.12*Math.sin(j*.7)+.06*Math.sin(j*1.9);                                                // LE MUR DE TEMPÊTE (un arc de 1,8 rad, rayon 1, h ~1) : un RIDEAU de poussière — le pied dense, le haut qui s'efface (aK 30 + la hauteur, voir DN_AFS)
    for(let j=0;j<N;j++){const t1=-.9+1.8*j/N,t2=-.9+1.8*(j+1)/N,p=(t,y)=>[Math.sin(t),y,Math.cos(t)];
      for(let m=0;m<M;m++){const a9=m/M,b9=(m+1)/M,c9=[.62+.22*a9,.40+.20*a9,.24+.18*a9];g.quad(p(t1,y9(j)*a9),p(t2,y9(j+1)*a9),p(t2,y9(j+1)*b9),p(t1,y9(j)*b9),c9);}}
    const gm=g.fin(),pp=gm.attributes.position,Kk=new Float32Array(pp.count);for(let i=0;i<pp.count;i++)Kk[i]=30+Math.max(0,Math.min(1,pp.getY(i)/1.3));gm.setAttribute('aK',new THREE.BufferAttribute(Kk,1));G9.mur=gm;}
  {const g=dnGeoPlus(dnGeo());g.prisme(5,0,1,.55,0,[.66,.60,.30]);g.prisme(4,0,.7,.4,0,[.56,.52,.24],[.18,0],[.3,.05],.3);G9.touffe=g.fin();}                  // LA TOUFFE D'HERBE SÈCHE (h 1)
  {const g=dnGeoPlus(dnGeo()),v=[.34,.54,.24],v2=[.28,.46,.20];g.tube(6,[0,0,0],[0,.95,0],.08,.07,v);g.prisme(6,.95,1.02,.07,0,v2);                          // LE CACTUS (h 1) : le fût, deux bras
    for(const [sx,y0] of [[1,.42],[-1,.55]]){g.tube(5,[0,y0,0],[sx*.2,y0+.02,0],.05,.05,v2);g.tube(5,[sx*.2,y0,0],[sx*.2,y0+.3,0],.05,.045,v);g.prisme(5,y0+.3,y0+.34,.045,0,v2,[sx*.2,0]);}G9.cactus=g.fin();}
  DN.geos2=G9;return G9;}
function dnMonuments(seed){
  if(DN.grp){for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}
  DN.tor=[];DN.torIm=null;DN.decoN=null;
  if(DN.deco){try{dnMonumentsTires(seed);return;}catch(e){console.warn('dunes : décor tiré',e);for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}}
  const M9=dnMats(),G9=dnGeos(),S=DN.S,K=Math.sqrt(lvPiste()),rg=mulberry32((seed^0x7A55)>>>0),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0),v9=new THREE.Vector3(),s9=new THREE.Vector3();DN.grp.visible=true;
  const inst=(geo,mat,L9,nom)=>{if(!L9.length)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  // LES OBÉLISQUES et leurs pyramidions
  {const L9=DN.ob.map(function(b){return [b.x,b.y,b.z,b.r,b.a,b.h,b.r];});inst(G9.ob,M9.t,L9,'obélisques');inst(G9.obOr,M9.g,L9,'pyramidions');}
  // LA GRANDE PYRAMIDE
  if(DN.pyr){const P=DN.pyr,L9=[[P.x,P.y,P.z,P.hw,P.a,P.h,P.hw]];inst(G9.pyr,M9.t,L9,'pyramide');inst(G9.pyrOr,M9.g,L9,'coiffe');}
  // LES ACACIAS MORTS de la vallée (sur l'argile, sous la route)
  {const L9=[],N9=PAL.b('dnArbres',140),a0=DN.sQ.vlei0,a1=DN.sQ.vlei1,o9={};
   if(S&&a0!=null&&a1!=null)for(let k=0;k<N9*8&&L9.length<N9;k++){const s0=a0-200+rg()*(a1-a0+400),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+14+rg()*rg()*380*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=(6+rg()*7)*(1+.3*rg());if(o9.eau)continue;
     if(dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.4,z,ht,rg()*6.28]);}
   inst(G9.arb,M9.t,L9,'acacias');DN.nArb=L9.length;}
  // LES PALMIERS de l'oasis (sur la rive)
  {const L9=[],N9=PAL.b('dnPalmes',48),A9=DN.oa,o9={};
   if(A9)for(let k=0;k<N9*10&&L9.length<N9;k++){const an=rg()*6.2832,rr=(1.03+rg()*.42)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),ht=(13+rg()*10)*(1+.2*rg());
     if(o9.eau||dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}
   inst(G9.pal,M9.t,L9,'palmiers');DN.nPal=L9.length;}
  // LES CARAVANES : sept chameaux en file sur une crête, à 70-140 m de la route (la crête du Grand Erg, la vallée morte, la deuxième crête)
  DN.car=[];DN.carIm=null;
  {const L9=[];for(const nm of ['erg0','vlei0','cr2a']){const s0=DN.sQ[nm];if(s0==null||!S)continue;const i=Math.max(0,Math.min(S.n-1,Math.round((s0+160)/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+(70+rg()*70)*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,dir=Math.atan2(S.tx[i],S.tz[i])+(rg()<.5?0:Math.PI)+(rg()-.5)*.6;
     DN.car.push({x:x,z:z,a:dir,t:rg()*60,n:7});for(let k=0;k<7;k++)L9.push([x,0,z,3.4,dir]);}
   if(L9.length){DN.carIm=inst(G9.cha,M9.t,L9,'caravanes');if(DN.carIm){DN.carIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);DN.carT=0;dnCaravane(0,true);}}}
  DN.grp.updateMatrixWorld(true);}
/* (2026-10-20, LE DÉSERT AU HASARD) LE DÉCOR TIRÉ (DN.deco) : les obélisques (les brisés sans pyramidion, leur tronçon couché à côté), les pyramides de chaque
   style, les grands monuments (dnPrevoirDeco les a posés : ils ombrent et tuent), puis — à la pose, ici, sur le sable relu — le village, les campements,
   les caravanes, la flore, les diables de sable, le mur de tempête, les squelettes, les épaves. Les pièces neuves sont CUITES dans UNE géométrie (une
   instance, M9.t) : un seul appel de dessin de plus, aucun programme neuf. Son hasard : `D.sd` (rien de `rnd`, rien du tracé). */
function dnMonumentsTires(seed){
  const D=DN.deco,M9=dnMats(),G9=dnGeos(),G2=dnGeos2(),S=DN.S,K=Math.sqrt(lvPiste()),RH=ROAD_HALF,t0=performance.now(),rg=mulberry32((D.sd^0x7A55D)>>>0),o9={},N={};
  const mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(0,0,0,'YXZ'),v9=new THREE.Vector3(),s9=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0),CU=dnCuiseur();DN.grp.visible=true;
  const cuis=(geo,x,y,z,sx,sy,sz,ry,tx,tz,te)=>{e9.set(tx||0,ry||0,tz||0);q9.setFromEuler(e9);mt.compose(v9.set(x,y,z),q9,s9.set(sx,sy,sz));CU.ajoute(geo,mt,te);};
  const inst=(geo,mat,L9,nom)=>{if(!L9.length)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  const libre=(x,z,r)=>{for(const p of DN.pyrs)if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+r+20)return false;for(const m of DN.mo)if(Math.hypot(m.x-x,m.z-z)<m.r+r+15)return false;
    for(const b of DN.ob)if(Math.hypot(b.x-x,b.z-z)<b.r*2+r+6)return false;return true;};
  const site=(lat0,lat1,clear,top,r,f0,f1)=>{for(let e=0;e<24;e++){const s0=L*(f0+(f1-f0)*rg()),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds)));if(S.gd[i]>.01)continue;
      const sg=rg()<.5?-1:1,lat=RH+(lat0+rg()*(lat1-lat0))*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9);
      if(o9.eau||!libre(x,z,r)||dnPresRoute(x,z,RH+clear,h+top))continue;return {x:x,z:z,h:h,i:i,t:Math.atan2(S.tx[i],S.tz[i])};}return null;};
  const tch=(c,k)=>[c[0]*(1-k+2*k*rg()),c[1]*(1-k+2*k*rg()),c[2]*(1-k+2*k*rg())];
  // LES OBÉLISQUES (le modèle neuf : fût de lapis gravé, bandeaux et pyramidion d'or) : le brisé n'a plus de pointe (un fût en dents de scie), son tronçon tombé gît à côté
  {const MO=dnMod('obelisque'),MB=dnMod('obeliskTronc');
   for(const b of DN.ob)cuis(b.br?MB:MO,b.x,b.y,b.z,b.r/4,b.h/(b.br?55:64),b.r/4,b.a);
   for(const b of DN.ob){if(!b.br)continue;const an=rg()*6.28,fl=(30+rg()*26)*K*.7,x0=b.x+Math.sin(an)*b.r*1.8,z0=b.z+Math.cos(an)*b.r*1.8,x1=x0+Math.sin(an)*fl,z1=z0+Math.cos(an)*fl;
      const y=Math.min(dnHauteur(x0,z0),dnHauteur((x0+x1)/2,(z0+z1)/2),dnHauteur(x1,z1))+b.r*.25;if(dnPresRoute(x1,z1,RH+b.r+6,y+b.r)||dnPresRoute((x0+x1)/2,(z0+z1)/2,RH+b.r+6,y+b.r))continue;
      cuis(MO,x0,y,z0,b.r*.85/4,fl/64,b.r*.85/4,an,Math.PI/2,0);N.troncons=(N.troncons|0)+1;}}
  // LES PYRAMIDES : à gradins, lisses de calcaire, à degrés — pierre en assises, coiffe d'or, une porte sombre au pied
  for(const P of DN.pyrs)cuis(dnMod(P.st==='giza'?'pyrGiza':P.st==='cap'?'pyrCap':P.st==='rouge'?'pyrRouge':P.st==='lisse'?'pyrLisse':P.st==='etagee'?'pyrDegres':'pyrGradins'),P.x,P.y,P.z,P.hw,P.h,P.hw,P.a);
  // LES GRANDS MONUMENTS : le sphinx, les colosses et la porte regardent la route ; le temple s'aligne sur elle (colonnes, architraves, tambours tombés)
  for(const m of DN.mo){
    if(m.k==='sphinx'){const l=m.r/.55;cuis(dnMod(dnLegNom(m)),m.x,m.y,m.z,l,l,l,m.a);}
    else if(m.k==='colosse')cuis(dnMod(dnLegNom(m)),m.x,m.y,m.z,m.h,m.h,m.h,m.a);
    else if(m.k==='porte'){const sc=m.h/30;cuis(dnMod('porte'),m.x,m.y,m.z,sc,sc,sc,m.a);}
    else if(m.k==='temple'){const l=m.r/.62,H=m.h,ct=Math.cos(m.t),st=Math.sin(m.t),W=(lx,lz)=>[m.x+lx*ct+lz*st,m.z-lx*st+lz*ct],nc=5+((rg()*3)|0),y0=m.y+3.5;
      {const p=W(0,0);cuis(dnMod('bloc'),p[0],m.y,p[1],l*.5,3.5,l*1.0,m.t,0,0,[.90,.84,.72]);}
      for(const sx of [-1,1]){let prec=null;for(let k=0;k<nc;k++){const lz=-l*.42+k*l*.84/(nc-1),p=W(sx*l*.19,lz),br=rg()<.35,hy=br?H*(.25+rg()*.45):H;
        cuis(dnMod('colonne'),p[0],y0,p[1],H/22,hy/22,H/22,m.t);
        if(br&&rg()<.6){const an=rg()*6.28,d=H*.3+rg()*H*.4,q=[p[0]+Math.sin(an)*d,p[1]+Math.cos(an)*d];cuis(dnMod('colonne'),q[0],dnHauteur(q[0],q[1])+H*.05,q[1],H*.9/22,H*(.2+rg()*.25)/22,H*.9/22,an,Math.PI/2,0);}
        if(!br&&prec!=null){const zm=(prec+lz)/2,c=W(sx*l*.19,zm);cuis(dnMod('bloc'),c[0],y0+H,c[1],H*.3,H*.11,lz-prec+H*.28,m.t,0,0,[.93,.88,.78]);}prec=br?null:lz;}}}}
  // LE VILLAGE DE TERRE en ruine : des maisons cubes, des murs bas
  if(D.village){const c=site(70,210,50,10,60,.08,.9);if(c){const n=8+((rg()*8)|0);N.maisons=0;
    for(let k=0;k<n+4;k++){const an=rg()*6.28,d=rg()*48*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,h0=dnHauteur(x,z,o9),mur=k>=n,w=mur?(12+rg()*18):(5+rg()*5),dp=mur?.9:(5+rg()*5),hh=mur?(1.4+rg()*1.6):(rg()<.35?1.2+rg()*1.5:3+rg()*3);
      if(o9.eau||dnPresRoute(x,z,RH+10,h0+hh+2))continue;cuis(dnMod('bloc'),x,h0-.8,z,w,hh+.8,dp,c.t+(rg()<.6?0:Math.PI/2)+(rg()-.5)*.2,0,0,tch([.82,.60,.42],.08));N.maisons++;}}}
  // LES CAMPEMENTS : des tentes en rond, le feu au milieu, des chameaux couchés
  N.camps=0;for(let k=0;k<D.camps;k++){const c=site(40,170,30,6,30,.05,.92);if(!c)continue;N.camps++;const nt=3+((rg()*4)|0);
    for(let j=0;j<nt;j++){const an=j/nt*6.28+rg()*.5,d=(10+rg()*10)*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,w=(8+rg()*4)*K;cuis(G2.tente,x,dnHauteur(x,z)-.3,z,w,w*(.8+rg()*.4),w*(.7+rg()*.3),an+Math.PI/2,0,0,tch([1,1,1],.1));}
    cuis(G2.feu,c.x,c.h-.1,c.z,2.4*K,2.6*K,2.4*K,rg()*6);
    for(let j=0;j<2+((rg()*4)|0);j++){const an=rg()*6.28,d=(22+rg()*14)*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d;cuis(dnMod('chameau'),x,dnHauteur(x,z)-1.75,z,3.4,3.4,3.4,rg()*6.28);}}
  // LES CARAVANES : 1 à 4, de 4 à 11 bêtes, sur une crête tirée, dans un sens tiré
  DN.car=[];DN.carIm=null;
  {const L9=[];for(const C9 of D.caravanes){const c=site(46,120,40,8,12,.04,.9);if(!c)continue;const dir=c.t+(rg()<.5?0:Math.PI)+(rg()-.5)*.8;
     DN.car.push({x:c.x,z:c.z,a:dir,t:rg()*60,n:C9.n,k:C9.k,v:C9.v});for(let k=0;k<C9.n;k++)L9.push([c.x,0,c.z,DN_CAM*C9.k,dir]);}
   if(L9.length){DN.carIm=inst(dnMod('chameau'),M9.t,L9,'caravanes');if(DN.carIm){DN.carIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);DN.carT=0;dnCaravane(0,true);}}}
  // LA FLORE : les acacias morts (la vallée, et épars), les palmiers (l'oasis, les palmeraies), les touffes, les cactus
  {const L9=[],N9=Math.round(PAL.b('dnArbres',140)*D.flore.acacias),a0=DN.sQ.vlei0,a1=DN.sQ.vlei1;
   if(a0!=null&&a1!=null)for(let k=0;k<N9*8&&L9.length<N9;k++){const s0=a0-200+rg()*(a1-a0+400),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=rg()<.5?-1:1,lat=RH+14+rg()*rg()*380*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=(6+rg()*7)*(1+.3*rg());if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.4,z,ht,rg()*6.28]);}
   for(let k=0;k<D.flore.epars*4&&L9.length<N9+D.flore.epars;k++){const c=site(14,200,10,14,4,.03,.97);if(c)L9.push([c.x,c.h-.4,c.z,(6+rg()*8)*(1+.3*rg()),rg()*6.28]);}
   inst(G9.arb,M9.t,L9,'acacias');DN.nArb=L9.length;}
  {const L9=[],A9=DN.oa;
   if(A9){const N9=Math.round(PAL.b('dnPalmes',48)*Math.min(1.5,D.oasis.k));for(let k=0;k<N9*10&&L9.length<N9;k++){const an=rg()*6.2832,rr=(1.03+rg()*.42)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),ht=(13+rg()*10)*(1+.2*rg());
     if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}}
   for(let g9=0;g9<D.flore.palmeraies;g9++){const c=site(50,220,30,25,50,.05,.9);if(!c)continue;const n=10+((rg()*16)|0);
     for(let k=0;k<n*3&&n>0;k++){const an=rg()*6.28,d=rg()*45*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,h=dnHauteur(x,z,o9),ht=(11+rg()*10)*(1+.2*rg());if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}}
   inst(dnMod('palmier'),M9.t,L9,'palmiers');DN.nPal=L9.length;}
  // L'OASIS VIVANTE (2026-10-22) : des touffes de PAPYRUS au bord de l'eau, des LOTUS BLEUS qui flottent, des FELOUQUES sur le lac
  {const A9=DN.oa;if(A9){const Lp=[],Ll=[],nP=Math.round(70*Math.min(1.5,D.oasis.k)),nL=Math.round(26*Math.min(1.5,D.oasis.k));
    for(let k=0;k<nP*14&&Lp.length<nP;k++){const an=rg()*6.2832,rr=(.94+rg()*.16)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),d=h-A9.y,ht=1.8+rg()*1.9;
      if(d<-.6||d>2.2||dnPresRoute(x,z,RH+12,h+ht+2))continue;Lp.push([x,Math.max(h,A9.y)-.1,z,ht,rg()*6.28]);}
    for(let k=0;k<nL*14&&Ll.length<nL;k++){const an=rg()*6.2832,rr=Math.sqrt(rg())*.9*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr;dnHauteur(x,z,o9);if(!o9.eau)continue;const sc=1.4+rg()*1.2;Ll.push([x,A9.y+.05,z,sc,rg()*6.28]);}
    inst(dnMod('papyrus'),M9.t,Lp,'papyrus');inst(dnMod('lotus'),M9.t,Ll,'lotus');N.papyrus=Lp.length;N.lotus=Ll.length;
    const nb=1+((rg()*2.4)|0);N.bateaux=0;for(let k=0;k<nb*8&&N.bateaux<nb;k++){const an=rg()*6.2832,rr=(.25+rg()*.5)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr;dnHauteur(x,z,o9);if(!o9.eau)continue;
      const l=(9+rg()*5)*Math.min(1.3,K);cuis(dnMod('felouque'),x,A9.y-.35*l*.2,z,l,l,l,rg()*6.28);N.bateaux++;}}}
  N.touffes=0;for(let k=0;k<D.flore.touffes*2&&N.touffes<D.flore.touffes;k++){const i=Math.floor(rg()*(S.n-1)),sg=rg()<.5?-1:1,lat=RH+6+rg()*rg()*150*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=1.3+rg()*1.6;
    if(o9.eau||S.gd[i]>.01||dnPresRoute(x,z,RH+4,h+ht+1))continue;cuis(G2.touffe,x,h-.2,z,ht*1.4,ht,ht*1.4,rg()*6.28,0,0,tch([1,1,1],.12));N.touffes++;}
  N.cactus=0;for(let k=0;k<D.flore.cactus;k++){const c=site(10,220,8,14,4,.03,.97);if(!c)continue;const ht=(6+rg()*7)*K;cuis(G2.cactus,c.x,c.h-.3,c.z,ht,ht,ht,rg()*6.28);N.cactus++;}
  // LES DIABLES DE SABLE (ils tournent, dnTornades), LE MUR DE TEMPÊTE au loin, LES SQUELETTES, LES ÉPAVES
  DN.tor=[];DN.torIm=null;
  {const L9=[];for(let k=0;k<D.tornades;k++){const c=site(180,620,160,400,40,.05,.95);if(!c)continue;const h=(120+rg()*170)*K;DN.tor.push({x:c.x,y:c.h-4,z:c.z,h:h,a:rg()*6.28,w:1.2+rg()*1.6,p:rg()*6.28});L9.push([c.x,c.h-4,c.z,h*.34,0,h,h*.34]);}
   if(L9.length){DN.torIm=inst(G2.tor,M9.d,L9,'diables');if(DN.torIm)DN.torIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);}}
  if(D.tempete){const b=S.bb,cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,R9=Math.max(5200,Math.hypot(b[1]-b[0],b[3]-b[2])*.5+3600);let ym=1e9;for(let i=0;i<S.n;i+=8)ym=Math.min(ym,S.y[i]);inst(G2.mur,M9.d,[[cx,ym-420,cz,R9,D.tempete.a,1500,R9]],'mur');N.tempete=Math.round(R9);}
  N.os=0;for(let k=0;k<D.os;k++){const c=site(15,110,10,3,15,.05,.95);if(!c)continue;const l=(16+rg()*24)*K;cuis(G2.os,c.x,c.h-.6,c.z,l,l,l,rg()*6.28,(rg()-.5)*.1);N.os++;}
  if(D.avion){const c=site(40,160,25,12,25,.05,.9);if(c){const l=(30+rg()*10)*K;cuis(G2.avion,c.x,c.h-.03*l,c.z,l,l,l,rg()*6.28,.16+rg()*.1,.25);N.avion=1;}}
  if(D.bateau){const c=site(40,170,25,12,25,.05,.9);if(c){const l=(24+rg()*12)*K;cuis(G2.bateau,c.x,c.h-.06*l,c.z,l,l,l,rg()*6.28,-.06,.28);N.bateau=1;}}
  try{dnScenes({rg:rg,cuis:cuis,K:K,RH:RH,N:N});}catch(e){console.warn('dunes : scènes',e);} // (2026-10-22) les scènes le long de la route (dunes-4.js)
  if(CU.n()){const g=CU.fin(),im=new THREE.InstancedMesh(g,M9.t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;
    im.userData.jeter=1;im.name='dunes décor tiré';DN.grp.add(im);N.sommets=CU.n();}
  DN.grp.updateMatrixWorld(true);N.ms=Math.round(performance.now()-t0);DN.decoN=N;}
const DN_CAM=5.2; // la haute des chameaux d'une caravane (m)
const DN_VAU={n:5,im:null,L:[],m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),sc:new THREE.Vector3()};
/* LES VAUTOURS (2026-10-22, la recette du canyon) : de 3 à 7 oiseaux qui planent, par grands cercles, devant la caisse (350-1250 m), à 25-120 m au-dessus de la dalle ; l'un qui retombe derrière est reposé devant */
function dnVautours(dt){const V=DN_VAU,on=DN.on&&started&&!gameOver&&mode!=='boom'&&!!DN.S;
  if(!V.im){if(!on)return;V.im=new THREE.InstancedMesh(dnMod('vautour'),dnMats().t,9);V.im.frustumCulled=false;V.im.matrixAutoUpdate=false;V.im.count=0;scene.add(V.im);}
  V.im.visible=!!on;if(!on){V.L.length=0;return;}
  const S=DN.S,cp=carGroup.position,i0=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));V.n=3+(((DN.deco?DN.deco.sd:0)>>>5)%5);
  for(let k=0;k<V.n;k++){let b=V.L[k];
    if(!b||cp.distanceTo(V.v.set(b.cx,b.cy,b.cz))>1900){const i=Math.min(S.n-1,i0+Math.round((350+Math.random()*900)/S.ds)),lat=(Math.random()-.5)*480;
      b=V.L[k]={cx:S.x[i]-S.tz[i]*lat,cz:S.z[i]+S.tx[i]*lat,cy:S.y[i]+25+Math.random()*95,r:45+Math.random()*85,a:Math.random()*6.28,w:(.14+Math.random()*.12)*(Math.random()<.5?-1:1),k:5.5+Math.random()*3};}
    if(!paused)b.a+=b.w*dt;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=b.cy+Math.sin(b.a*2.3)*5;
    V.e.set(Math.sin(b.a*1.7)*.05,b.w>0?-b.a:Math.PI-b.a,b.w>0?.32:-.32);V.q.setFromEuler(V.e);V.m4.compose(V.v.set(x,y,z),V.q,V.sc.set(b.k,b.k,b.k));V.im.setMatrixAt(k,V.m4);}
  V.im.count=V.n;V.im.instanceMatrix.needsUpdate=true;}
/* LES DIABLES DE SABLE tournent sur eux-mêmes et errent un peu (rien d'alloué ; seulement si l'on est assez près) */
function dnTornades(dt){const im=DN.torIm;if(!im||!DN.on||paused||!DN.tor.length)return;const p=carGroup.position;let pres=false;for(const c of DN.tor)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<4000)pres=true;if(!pres)return;
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.tor){c.a=(c.a+dt*c.w)%6.2832;c.p=(c.p+dt*.05)%6.2832;e9.set(Math.sin(c.p*3)*.04,c.a,Math.cos(c.p*2)*.04);q9.setFromEuler(e9);
    mt.compose(v9.set(c.x+Math.sin(c.p)*30,c.y,c.z+Math.cos(c.p)*30),q9,s9.set(c.h*.34,c.h,c.h*.34));im.setMatrixAt(k++,mt);}
  im.instanceMatrix.needsUpdate=true;}
function dnPresRoute(x,z,lat,y){const S=DN.S;if(!S)return false;if(dnMesa(x,z,1e9)>1.5)return true; /* (une butte : rien ne s'y pose) */for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lat*lat&&y>S.y[i]-THICK-60)return true;}return false;} // un décor trop près d'une dalle (et pas loin dessous)
/* LES CARAVANES marchent (1,3 m/s, un pas qui balance) : la hauteur du sable relue chaque image pour les quatorze bêtes — seulement si on est assez près */
const DN_CT={m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),s:new THREE.Vector3(3.4,3.4,3.4)}; // (rien d'alloué dans la boucle)
function dnCaravane(dt,force){const im=DN.carIm;if(!im||!DN.on||!DN.Z)return;
  if(!force){if(paused)return;const p=carGroup.position;let pres=false;for(const c of DN.car)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<2200)pres=true;if(!pres)return;}
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.car){c.t=(c.t+dt*1.3*(c.v||1))%140;const ca=Math.sin(c.a),cz=Math.cos(c.a);s9.setScalar(DN_CAM*(c.k||1)); /* (2026-10-20) la taille et le pas de CHAQUE caravane (le tirage) */
    for(let j=0;j<c.n;j++){const d=c.t-j*DN_CAM*2.4,x=c.x+ca*d,z=c.z+cz*d,ph=(c.t+j*2.3)*2.2,h=dnHauteur(x,z);
      e9.set(Math.sin(ph)*.035,c.a,Math.sin(ph*.5)*.03);q9.setFromEuler(e9);mt.compose(v9.set(x,h-.15+Math.abs(Math.sin(ph))*.12,z),q9,s9);im.setMatrixAt(k++,mt);}}
  im.instanceMatrix.needsUpdate=true;}
/* LE SABLE QUI VOLE (le VENT DE SABLE, la TEMPÊTE) : des grains dans une boîte de 260 m qui suit la caméra, poussés par le vent de la map (DN.vent), qui
   tourbillonnent un peu — leur force est dnQ.z de l'ambiance (0 ailleurs : invisibles). Une instance, le mouvement dans le sommet, aucune allocation. */
/* (2026-10-22, Léo : « le niveau dune n'est pas au niveau ») LE SABLE QUI VOLE, REFAIT : de grosses boules floues dans tout le ciel (neige, bulles) → de FINS GRAINS dorés dans une couche
   mince posée sur le sable (uBoxC.y suit le sol sous la caméra), qui filent avec le vent : de la poussière, plus de ciel étoilé de jour */
const DN_PART_VS=['attribute vec4 aR;uniform float uTime,uK,uPx;uniform vec3 uBoxC,uVent,uCol;varying float vA;varying vec3 vC;',
  'void main(){float sk=smoothstep(.25,.9,uK);vec3 B=vec3(240.,20.+75.*sk,240.);', // (la couche s'épaissit avec le vent : fine un jour calme, un vrai brouillard de sable dans la tempête)
  '  vec3 pa=uVent*uTime*(.7+.6*aR.w)+vec3(sin(uTime*1.3+aR.y*9.)*2.,sin(uTime*.9+aR.x*7.)*.9,cos(uTime*1.1+aR.z*8.)*2.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  vA=smoothstep(0.,.10,e)*uK*(.35+.65*aR.w);vC=uCol*(.8+.4*aR.z);',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.003?0.:clamp((.26+aR.z*.45)*(1.+1.6*sk)*uPx*300./max(1.,-mv.z),1.2*uPx,(5.+5.*sk)*uPx);}'].join('\n');
const DN_PART_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);if(vA*a<.004)discard;gl_FragColor=vec4(vC,min(1.,vA*a*1.4));}'].join('\n');
const DN_V=new THREE.Vector3();
function dnPart(){if(DN.part)return DN.part;const n=PAL.b('dnPart',1600),R=mulberry32(0x5AB1E),g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
  const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uK:{value:0},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uVent:{value:new THREE.Vector3(1,0,0)},uCol:{value:new THREE.Color()}},
    vertexShader:DN_PART_VS,fragmentShader:DN_PART_FS,transparent:true,depthWrite:false});m.dispose=function(){};
  const p=new THREE.Points(g,m);p.name='dunes sable';p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return DN.part=p;}
function dnPartTick(dt,c){const k9=DN.on&&started?Math.max(c.dnQ?c.dnQ[2]:0,DN.deco?DN.deco.vent.vole:0,.16):0; /* (2026-10-20) + le sable qui vole du tirage (un jour de vent) */if(!(k9>.01)&&!(DN.part&&DN.part.visible))return;
  const P9=dnPart(),u=P9.material.uniforms;P9.visible=k9>.01;if(!P9.visible)return;u.uK.value=k9;if(!paused)u.uTime.value=(u.uTime.value+dt)%600;u.uPx.value=renderer.getPixelRatio();
  camera.getWorldDirection(DN_V);u.uBoxC.value.copy(camera.position).addScaledVector(DN_V,60);
  try{const g9=dnHauteur(u.uBoxC.value.x,u.uBoxC.value.z);const hB=20+75*Math.min(1,Math.max(0,(k9-.25)/.65));u.uBoxC.value.y=Math.max(camera.position.y-40,Math.min(camera.position.y+2,g9+Math.max(6,hB*.32)));}catch(e){} // la couche de grains : 6 m au-dessus du sable sous la caméra (jamais plus de 30 m sous elle, jamais au-dessus)
 u.uVent.value.set(DN.vent[0],-.04,DN.vent[1]).multiplyScalar(14+24*k9);if(c.dnH)u.uCol.value.fromArray(c.dnH).multiplyScalar(1.3);}
function dunesChauffe(){ // au menu (chauffeDivers) : le sable et les décors compilés et dessinés une fois hors écran — 0 programme en course
  if(!DUNES_OK)return;dnTerrain();const m=DN.mesh,v=m.visible,n=DN.geo.instanceCount;DN.geo.instanceCount=1;DN.aN.array[2]=64;m.visible=true;
  const M9=dnMats(),g9=new THREE.Group(),bx9=new THREE.BoxGeometry(1,1,1),c9=new Float32Array(bx9.attributes.position.count*3).fill(1);bx9.setAttribute('color',new THREE.BufferAttribute(c9,3));bx9.setAttribute('aK',new THREE.BufferAttribute(new Float32Array(bx9.attributes.position.count),1));
  for(const mt of [M9.t,M9.g,M9.d]){g9.add(new THREE.Mesh(bx9,mt));const im=new THREE.InstancedMesh(bx9,mt,1);im.setMatrixAt(0,new THREE.Matrix4());g9.add(im);}
  g9.traverse(function(o){o.frustumCulled=false;});scene.add(g9);const P9=dnPart(),pv=P9.visible;P9.visible=true;
  try{chauffeRendu([m,g9,P9]);}finally{m.visible=v;DN.geo.instanceCount=n;scene.remove(g9);bx9.dispose();P9.visible=pv;}}
window.dbgDunes=function(k,a,b,c,d){
  if(k==='ecart'){if(!DN.on)return 'pas de dunes';const cs=(+a||DN.S0*Math.pow(2,DN.lmin|0)/DN.G),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},T9={},H=(i,j)=>dnHauteur(i*cs,j*cs,T9);
    /* (facettes, banc) l'ÉCART entre le sable RENDU (interpolation linéaire sur la grille de `cs` m, les deux triangles de chaque case) et la vraie fonction dnHauteur, le long de la route jusqu'à ±90 m, et la marge route − sable RENDU (≥ 1 m) */
    const lin=(x,z)=>{const i=Math.floor(x/cs),j=Math.floor(z/cs),u=x/cs-i,v=z/cs-j,ha=H(i,j),hb=H(i+1,j),hc=H(i,j+1),hd=H(i+1,j+1);return u+v<=1?ha+(hb-ha)*u+(hc-ha)*v:hd+(hc-hd)*(1-u)+(hb-hd)*(1-v);};
    const E=[];let pire=1e9,piresS=-1,mx=0,mxAt=null;
    for(let s9=0;s9<L;s9+=8){frameAt(s9,F9);for(let lt=-90;lt<=90;lt+=6){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,t9=dnHauteur(x,z,T9),l9=lin(x,z);E.push(Math.abs(l9-t9));if(Math.abs(l9-t9)>mx){mx=Math.abs(l9-t9);mxAt=[s9,lt,Math.round(x),Math.round(z),+t9.toFixed(1),+l9.toFixed(1)];}
      if(Math.abs(lt)<=ROAD_HALF+1){const m=F9.p.y+F9.b.y*lt-l9;if(m<pire){pire=m;piresS=s9;}}}}
    E.sort((p,q)=>p-q);return {cell:cs,max:+mx.toFixed(2),p50:+E[E.length>>1].toFixed(2),p95:+E[Math.floor(E.length*.95)].toFixed(2),p99:+E[Math.floor(E.length*.99)].toFixed(2),margeMinRendu:+pire.toFixed(2),en:piresS,max9:mxAt,n:E.length};}
  if(k==='test'){if(!DN.on)return 'pas de dunes';let dessus=0,pire=1e9,od=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; /* (LA ROUTE CONTINUE) le sable doit rester SOUS le bitume : marge = bitume − sable, sur toute la largeur ; < 1 m = le sable mord la route */
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,-ROAD_HALF*.5,0,ROAD_HALF*.5,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,m=y-dnHauteur(x,z);
      if(m<1){dessus++;if(od.length<40)od.push(Math.round(s9)+(lt?(lt>0?'d':'g'):'c')+'('+m.toFixed(1)+')');}pire=Math.min(pire,m);}}
    let mo=0;for(let s9=0;s9<L;s9+=10){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){F9.p.addScaledVector(F9.b,lt);F9.p.y+=1;if(dnMonuHeurt(F9.p))mo++;F9.p.y-=1;F9.p.addScaledVector(F9.b,-lt);}}
    return {dessus:dessus,dessusOu:od.join(' '),margeMin:+pire.toFixed(1),decorsSurLaRoute:mo,sep:DN.sep};}
  if(k==='bank'){if(!DN.on||!DN.S)return 'pas de dunes';const S9=DN.S,F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},o=[]; /* (banc) l'inclinaison de la dalle à l'abscisse a..b (pas c) : celle de la route (frameAt) contre celle que le sable a reçue (S.bk), et la marge aux deux bords */
    for(let q=+a||0;q<=(+b||+a||0);q+=(+c||16)){frameAt(q,F9);const i=Math.max(0,Math.min(S9.n-1,Math.round(q/S9.ds))),m=function(lt){return +(F9.p.y+F9.b.y*lt-dnHauteur(F9.p.x+F9.b.x*lt,F9.p.z+F9.b.z*lt)).toFixed(2);};
      o.push({s:Math.round(q),route:+(Math.asin(Math.max(-1,Math.min(1,-F9.b.y)))*57.2958).toFixed(1),sable:+(S9.bk[i]*57.2958).toFixed(1),gauche:m(-ROAD_HALF),droite:m(ROAD_HALF)});}return o;}
  if(k==='lev')return {lev:DN.dbgLev||null,surf:DN.surf|0,surfG:DN.surfG||0,tous:DN.lev.map(function(v){return [Math.round(v.s),Math.round(v.aim),v.tag];})}; /* (banc) le dernier tremplin pris : vitesse, impulsion, durée visée… et la liste des tremplins */
  if(k==='ech'){if(!DN.on||!DN.S)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||+a||0);q+=(+c||8)){const i=Math.max(0,Math.min(S9.n-1,Math.round(q/S9.ds))),f=function(v){return +v[i].toFixed(1);}; /* (banc) les paramètres du terrain prescrit à l'abscisse q : route, mer, côtés (h = la colline ou l'éperon, w = sa largeur) */
      o.push({s:Math.round(q),y:f(S9.y),B:f(S9.B),hP:f(S9.hP),wP:f(S9.wP),hM:f(S9.hM),wM:f(S9.wM),RE:Math.round(S9.RE[i]),pw:f(S9.pw),pan:f(S9.pan)});}return o;}
  if(k==='suit'){if(!started||gameOver)return 'pas de course';if(!paused)togglePause();const q=carGroup.position,f=DN_V.set(0,0,1).applyQuaternion(carGroup.quaternion); /* (banc) gèle la course et pose la caméra derrière la caisse : a = recul (m), b = hauteur, c = champ */
    camera.position.set(q.x-f.x*(a||14),q.y+(b||5),q.z-f.z*(a||14));camera.up.set(0,1,0);camera.lookAt(q.x+f.x*8,q.y+1,q.z+f.z*8);if(c)camera.fov=c;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {car:q.toArray().map(Math.round),s:Math.round(s),mode:mode};}
  if(k==='sauts')return (DN.lev||[]).map(function(v,j){return {n:j,tag:v.tag,lip:Math.round(v.s),pose:Math.round(v.e),vide:Math.round(v.e-v.s),visee:Math.round(v.aim),segment:v.seg,dy:DN.S?Math.round(DN.S.y[Math.min(DN.S.n-1,Math.round(v.s/DN.S.ds))]-DN.S.y[Math.min(DN.S.n-1,Math.round(v.e/DN.S.ds))]):0};});
  if(k==='tp'){if(!started||gameOver||mode!=='drive')return 'pas au sol';s=Math.max(0,Math.min(L-30,+a||0));lat=0;if(b!=null)vA=+b/SPD;return {s:Math.round(s),vA:+vA.toFixed(1)};} /* (banc) la caisse posée à l'abscisse a, à la vitesse monde b (m/s) */
  if(k==='marge'){if(!DN.on)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||L);q+=(+c||10)){const i=Math.min(S9.n-1,Math.round(q/S9.ds));o.push(Math.round(q)+':'+(S9.y[i]-dnHauteur(S9.x[i],S9.z[i])).toFixed(0)+'/D'+S9.D[i].toFixed(0)+'/z'+S9.zC[i].toFixed(1));}return o.join(' ');} /* (banc) la hauteur de la ligne de route au-dessus du sable, de a à b tous les c m */
  if(k==='raccourcis')return DN.rac||[];
  if(k==='const')return {ROAD_HALF:ROAD_HALF,THICK:THICK,L:Math.round(L),NP:NP,SPD:SPD,FALL_G:FALL_G,GRAV_K:GRAV_K,vPalier:Math.round(vPalier()),rayon:Math.round(rayonPalier()),lv:+lvPiste().toFixed(2),lcible:Math.round(longueurCible()),eng:engTier,y0:Math.round(pts[0].y),yFin:Math.round(pts[NP-1].y),vitMult:+vitMult().toFixed(2),vA:+vA.toFixed(1)}; /* (banc) les constantes du jeu que le banc ne peut pas lire (rien n'est global) */
  if(k==='gpu'){const gl=renderer.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');if(!ext)return 'pas de chrono';const n=a||20,reps=b||5; /* (banc) le coût GPU d'une image FIGÉE (la caméra de dbgDunes('vueA'…)) : n rendus d'affilée chronométrés par la puce, reps fois — {min, med} en ms par image */
    return (async function(){const all=[];for(let rep=0;rep<reps;rep++){const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);for(let i=0;i<n;i++){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}gl.endQuery(ext.TIME_ELAPSED_EXT);const t0=performance.now();while(!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&performance.now()-t0<4000)await new Promise(function(r){setTimeout(r,5);});const ok=!gl.getParameter(ext.GPU_DISJOINT_EXT),v=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6/n;gl.deleteQuery(q);if(ok)all.push(v);}all.sort(function(x,y){return x-y;});return all.length?{min:+all[0].toFixed(2),med:+all[all.length>>1].toFixed(2)}:null;})();}
  if(k==='profil'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},r=[];frameAt(Math.max(0,Math.min(L-1,+a||0)),F9);for(let lt=-(b||80);lt<=(b||80);lt+=(c||8)){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;r.push(lt+':'+(dnHauteur(x,z)-F9.p.y).toFixed(1));}return r.join(' ');} /* (banc) le sable (m, par rapport à la dalle) en travers de la route à l'abscisse a, de -b à +b tous les c m */
  if(k==='galerie')return dnGalerie(a,b,c,d,arguments[5]);
  if(k==='modele'){const g=dnMod(a),p=g.attributes.position,n=g.attributes.normal;g.computeBoundingBox();const bb=g.boundingBox;let pos=0,neg=0,nan=0;const c=bb.getCenter(new THREE.Vector3());for(let j=0;j<p.count;j++){const dx=p.getX(j)-c.x,dz=p.getZ(j)-c.z,l=Math.hypot(dx,dz)||1,d=(dx*n.getX(j)+dz*n.getZ(j))/l;if(d>0)pos++;else neg++;if(!isFinite(n.getX(j)+n.getY(j)+n.getZ(j)))nan++;}
    return {sommets:p.count,triangles:p.count/3,bb:[bb.min.toArray().map(function(v){return +v.toFixed(2);}),bb.max.toArray().map(function(v){return +v.toFixed(2);})],normalesVersLexterieur:pos,vers_linterieur:neg,nan:nan};} /* (banc) un modèle : sa taille, ses sommets, le sens de ses normales */
  if(k==='shader'){const m=a==='sable'?DN.mat:(DN.mm&&DN.mm[a]);if(!m)return 'pas de matière';const f0=m.fragmentShader;m.fragmentShader=f0.split(b).join(c);m.needsUpdate=true;return {change:f0!==m.fragmentShader};} /* (banc) retouche la matière à chaud : a = sable | t | g, b = le texte à remplacer, c = son remplaçant */
  if(k==='poly'){const U=DN.mat&&DN.mat.uniforms;if(!U)return 'pas de matière';const o=a||{};if(o.tint!=null)U.uPl.value.x=o.tint;if(o.joint!=null)U.uPl.value.y=o.joint;if(o.glint!=null)U.uPl.value.z=o.glint;if(o.flat!=null)U.uPl.value.w=o.flat;if(o.rim!=null)U.uLm.value.x=o.rim;if(o.scat!=null)U.uLm.value.y=o.scat;if(o.term!=null)U.uLm.value.z=o.term;if(o.reb!=null)U.uLm.value.w=o.reb;return {pl:U.uPl.value.toArray(),lm:U.uLm.value.toArray(),poly:U.uPoly.value,lum:U.uLum.value};}
  if(k==='uni'){const U=DN.mat&&DN.mat.uniforms;if(!U)return 'pas de matière';return {mo:U.uMo.value.toArray(),k:U.uK.value.toArray(),q:U.uQ.value.toArray(),fs:DN.mat.fragmentShader.length,mosaique:DN.mat.fragmentShader.indexOf('uMo')>=0,decor:DN.mm?{t:DN.mm.t.fragmentShader.indexOf('blk(')>=0,g:DN.mm.g.fragmentShader.indexOf('blk(')>=0}:null};} /* (banc) les réglages de la matière du sable */
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='cam'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const P=a||[0,0,0],T=b||[0,0,1]; /* (banc) la caméra où l'on veut : a = [x,y,z] de l'œil, b = [x,y,z] de la cible, c = le champ (degrés) */
    camera.position.set(P[0],P[1],P[2]);camera.up.set(0,1,0);camera.lookAt(T[0],T[1],T[2]);if(c){camera.fov=c;camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  if(k==='vueL'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; /* (banc) la caméra à l'abscisse a, décalée de b m sur le côté (+ = à droite), à c m de haut, cap d° ; e = la pente du regard */
    frameAt(Math.max(0,Math.min(L-1,a||0)),F9);const lt=b||0,cap=(d||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap),pe=arguments[5]!=null?arguments[5]:.06;
    camera.position.set(F9.p.x+F9.b.x*lt,F9.p.y+(c||8),F9.p.z+F9.b.z*lt);camera.up.set(0,1,0);camera.lookAt(camera.position.x+dx*200,camera.position.y-200*pe,camera.position.z+dz*200);if(arguments[6]){camera.fov=arguments[6];camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round)};}
  if(k==='decors'){const r=function(o){return o.map(function(q){return {x:Math.round(q.x),y:Math.round(q.y),z:Math.round(q.z),h:Math.round(q.h||0),k:q.k||q.st||''};});};return {ob:r(DN.ob||[]),pyrs:r(DN.pyrs||[]),mo:r(DN.mo||[]),oasis:DN.oa?{x:Math.round(DN.oa.x),z:Math.round(DN.oa.z),r:Math.round(DN.oa.r)}:null,n:DN.decoN||null};} /* (banc) où sont les décors */
  if(k==='vue'||k==='vueA'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9);const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(d!=null?d:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  return {on:DN.on,ms:DN.ms,noeuds:DN.n,sep:DN.sep,rmin:DN.rmin,F:DN.F?[DN.F.nx,DN.F.nz,DN.F.ts]:null,Z:DN.Z?[DN.Z.nx,DN.Z.nz,DN.Z.ts]:null,O:DN.O?[DN.O.nx,DN.O.nz,DN.O.ts]:null,
    ciel:CIEL2.mode,attente:!!DN.attente,sQ:DN.sQ,L:Math.round(L),obelisques:DN.ob.length,pyramide:!!DN.pyr,acacias:DN.nArb|0,palmiers:DN.nPal|0,caravanes:DN.car.length,oasis:DN.oa?{r:Math.round(DN.oa.r),y:Math.round(DN.oa.y)}:null,
    hz:DN.hz||null,deco:DN.deco?Object.assign({},DN.deco,{pose:DN.decoN,pyramides:DN.pyrs.map(function(p){return p.st+':'+Math.round(p.hw*2)+'m';}),monuments:DN.mo.map(function(m){return m.k;})}):null,levres:(DN.lev||[]).length,scenes:DN.scn||null,heurt:DN.heurt||'',sauts:DN.sauts|0,levre:DN.dbgLev||null,vent:DN.vent.map(v=>+v.toFixed(2)),lam:Math.round(DN.lam),soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+DN.ombre.toFixed(2),dunes:+(LVL.dunes||0).toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    tri:DN.tri|0,lmin:DN.lmin|0,carHaut:DN.on?+(carGroup.position.y-dnHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
