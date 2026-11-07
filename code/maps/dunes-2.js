/* ===== LES DUNES EN FACETTES (2026-10-23, Léo : « rends-les en mode poly comme les voitures, toute la map, inspiré par la technique de la forêt » · « un effet de lumière, encore plus réaliste sur le sable ») =====
   Le sable ET les décors en facettes PLATES (la normale de chaque triangle, par dérivées de l'écran), une teinte par facette, des éclats quand une facette renvoie le soleil vers l'œil, et les JOINTS
   VITRAIL (de fines arêtes de lumière entre les facettes, qui pâlissent sous ~7 px — voir « LA TECHNIQUE VITRAIL » de la forêt). Le terrain n'a plus de cellule plus petite que ~7,5 m (DN.lmin : le quadtree CDLOD
   ne descend plus plus bas — MOINS de triangles) ; les joints du terrain sortent des coordonnées de la grille (vGp : exact même en plein morph), ceux des décors du numéro de sommet (gl_VertexID, géométrie non indexée).
   La lumière du sable : contre-jour chaud sur les crêtes, voile de diffusion vers le soleil, terminateur orangé (sous-surface), rebond chaud dans l'ombre.
   `?poly=0` = l'ancien rendu à l'identique · `?lumiere=0` = sans les effets de lumière · `dbgDunes('poly',{tint,joint,glint,flat,rim,scat,term,reb})` règle à chaud. */
const DN_POLY=!/[?&]poly=0\b/.test(location.search),DN_LUM=!/[?&]lumiere=0\b/.test(location.search),DN_CELL=4;
/* ---- LE SABLE À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const DN_TB='vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}';
const dnF=function(n){const t=String(+n);return /[.e]/.test(t)?t:t+'.';}; /* (un nombre écrit pour le GLSL : toujours un flottant) */
const DN_VS=['attribute vec4 aN;uniform sampler2D uTC,uTZ,uTS,uNZ;uniform vec4 uFD,uZD,uSD,uOA,uW,uFin;uniform vec2 uFN,uZN,uSN,uDs;uniform vec3 uCam;uniform float uG,uR0,uLam;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_vertex>',DN_TB,
  'float gU,gP,gV,gM,gR;',
  /* LES SOMMETS ARRONDIS : la même fonction que cyNzS (dunes-1.js) — le bruit (canal r) lu à interpolation douce, sans angle aux nœuds des texels */
  ...(DN_PTE?['vec4 nzS(vec2 p){vec2 t=p*256.-.5,i=floor(t),f=t-i;f=f*f*(3.-2.*f);return texture2D(uNZ,(i+f+.5)/256.);}']:[]),
  /* LES SOMMETS ARRONDIS : la même fonction que dnLis (dunes-1.js) — le minimum doux de la montée et de la face d'avalanche, qui arrondit l'arête des crêtes */
  ...(DN_PTE?['float dnLis(float a,float b){float h=max('+dnF(DN_PK)+'-abs(a-b),0.)/'+dnF(DN_PK)+';return min(a,b)-h*h*'+dnF(DN_PK/4)+';}']:[]),
  'float dnDune(vec2 x){vec2 W=uW.xy;float u=dot(x,W)/uLam,v=dot(x,vec2(-W.y,W.x)),w1=texture2D(uNZ,x/30000.).r-.5,w2=texture2D(uNZ,x/11000.+vec2(.37,.61)).r-.5,w3=texture2D(uNZ,x/5200.+vec2(.83,.17)).r-.5,w4='+(DN_FORME.sn?'texture2D(uNZ,x/1800.+vec2(.29,.53)).r-.5':'0.')+';',
  '  float a=u+1.4*w1+1.05*w2+.34*w3+'+dnF(DN_FORME.sn)+'*w4,f=fract(a);',
  '  float p='+(DN_PTE?'dnLis(pow(max(f/'+dnF(DN_FORME.fs)+',1e-5),1.5)*'+dnF(1+DN_PK/8)+',pow(max((1.-f)/'+dnF(1-DN_FORME.fs)+',1e-5),'+dnF(DN_FORME.ps)+')*'+dnF(1+DN_PK/8)+')':'f<'+dnF(DN_FORME.fs)+'?pow(max(f/'+dnF(DN_FORME.fs)+',1e-5),1.5):pow(max((1.-f)/'+dnF(1-DN_FORME.fs)+',1e-5),'+dnF(DN_FORME.ps)+')')+',m='+dnF(DN_FORME.mb)+'+'+dnF(1-DN_FORME.mb)+'*clamp(('+(DN_PTE?'nzS(vec2(v/9000.+.13,a*.13+.5)).r':'texture2D(uNZ,vec2(v/9000.+.13,a*.13+.5)).r')+'-.22)*1.9,0.,1.);',
  /* LES JONCTIONS : la même fonction que dnDune (dunes-1.js) — la 2e famille de crêtes, tournée de 12°, fondue par plaques */
  ...(DN_FORME.yj&&DN_PTE?['  {vec2 Wb=vec2(W.x*.978-W.y*.208,W.x*.208+W.y*.978);float ab=dot(x,Wb)/(uLam*1.17)+1.1*w2-.9*w1+.6*w3+.37,fb=fract(ab);',
  '   float pb=dnLis(pow(max(fb/'+dnF(DN_FORME.fs)+',1e-5),1.5)*'+dnF(1+DN_PK/8)+',pow(max((1.-fb)/'+dnF(1-DN_FORME.fs)+',1e-5),'+dnF(DN_FORME.ps)+')*'+dnF(1+DN_PK/8)+');',
  '   float wb=clamp((texture2D(uNZ,x/7000.+vec2(.44,.12)).r-.5+.08)/.16,0.,1.);wb=wb*wb*(3.-2.*wb);p=p+wb*(-dnLis(-p,-pb*.92)-p);}']:[]),
  '  float a2=dot(x,uW.zw)/(uLam*.40)+1.6*w2+.5*w3,f2=fract(a2);',
  '  float p2=f2<.68?pow(max(f2/.68,1e-5),1.4):pow(max((1.-f2)/.32,1e-5),1.1);',
  '  gU=p*m;float h=p*m+.08*p2*(1.-.75*p);',
  /* LES SOUS-DUNES : la même fonction que dnDune (dunes-1.js) — la petite houle en dents de scie sur la face au vent */
  ...(DN_PTE?['  if(uDs.x>0.){float a3=dot(x,W)/(uLam*uDs.y)+2.2*w2+1.3*w3+1.7*(nzS(vec2(v/2100.+.27,a*.9+.13)).r-.5),f3=fract(a3);',
  '    float s3=dnLis(pow(max(f3/.8,1e-5),1.3)*'+dnF(1+DN_PK/8)+',pow(max((1.-f3)/.2,1e-5),1.2)*'+dnF(1+DN_PK/8)+');h+=uDs.x*(s3-.4)*(1.-p)*(.4+.6*m);}']:[]),
  /* LES DUNES ÉTOILÉES : la même fonction que dnDune (dunes-1.js) */
  ...(DN_STAR?['  float ts0=(texture2D(uNZ,x/16000.+vec2(.71,.29)).r-.5-'+dnF(DN_FORME.ss)+')/.14,ts=clamp(ts0,0.,1.);ts=ts*ts*(3.-2.*ts);',
  '  if(ts>0.){float k=6.2832/(uLam*1.9);vec2 d2=vec2(-.5*W.x-.866*W.y,.866*W.x-.5*W.y),d3=vec2(-.5*W.x+.866*W.y,-.866*W.x-.5*W.y);',
  '    float s1=cos(k*dot(x,W)+9.*w3+5.*w1),s2=cos(k*dot(x,d2)+8.*w2+4.*w3),s3=cos(k*dot(x,d3)+7.*w3+5.*w2);float st=clamp((s1+s2+s3+1.5)/4.5,0.,1.);st=pow(st,2.2);'+(DN_PTE?'st=1.5*st*(1.-st*st/3.);':'')+'',
  '    float hs=st*.95+.05*p2*(1.-.5*st);h+=(hs-h)*ts;gU+=(st-gU)*ts;}']:[]),
  '  return h;}',
  /* LES BUTTES : la même fonction que dnMesa (dunes-1.js) — un seuil du bruit (canal g), le haut par un autre (canal b), rien près de la route (Z.g = la distance à la route) */
  'float dnMesa(vec2 x,float dr){if(uFin.w>.5)return 0.;float n=texture2D(uNZ,x/11000.+vec2(.21,.73)).g,e=clamp((n-'+dnF(DN_FORME.ms)+')/'+dnF(DN_FORME.mw)+',0.,1.),m0=e*e*(3.-2.*e);if(m0<=0.)return 0.;',
  '  float t='+(DN_PTE?'nzS(x/7200.+vec2(.5,.1)).b':'texture2D(uNZ,x/1700.+vec2(.5,.1)).b')+',f=clamp((dr-260.)/260.,0.,1.),q=clamp((length(x-uFin.xy)-1800.)/1200.,0.,1.);return m0*f*f*(3.-2.*f)*q*q*(3.-2.*q)*('+dnF(DN_FORME.mh[0])+'+'+dnF(DN_FORME.mh[1])+'*t);}',
  /* L'IMMENSITÉ : la même fonction que dnGeant (dunes-1.js) — les dunes géantes de l'horizon, nées à `r1` m de la route (Z.g), pleines à `r2`, éteintes autour de l'arrivée */
  ...(DN_IMM.on?['float dnGeant(vec2 x,float dr,float mk){float t=clamp((dr-'+dnF(DN_IMM.r1)+')/'+dnF(DN_IMM.r2-DN_IMM.r1)+',0.,1.),rd=t*t*(3.-2.*t);if(rd<=0.)return 0.;',
  '  float s=clamp((length(x-uFin.xy)-'+dnF(DN_IMM.f1)+')/'+dnF(DN_IMM.f2-DN_IMM.f1)+',0.,1.),q=s*s*(3.-2.*s);if(q<=0.)return 0.;',
  '  vec2 W=uW.xy;float n1=texture2D(uNZ,x/30000.+vec2(.19,.43)).r-.5,n2=texture2D(uNZ,x/11000.+vec2(.52,.08)).r-.5,a=dot(x,W)/(uLam*'+dnF(DN_IMM.l)+')+2.2*n1+1.4*n2,f=fract(a);',
  '  float p='+(DN_PTE?'dnLis(pow(max(f/.7,1e-5),1.6)*'+dnF(1+DN_PK/8)+',pow(max((1.-f)/.3,1e-5),1.2)*'+dnF(1+DN_PK/8)+')':'f<.7?pow(max(f/.7,1e-5),1.6):pow(max((1.-f)/.3,1e-5),1.2)')+',v=-x.x*W.y+x.y*W.x,m=.5+.5*clamp(('+(DN_PTE?'nzS(vec2(v/12000.+.31,a*.11+.2)).r':'texture2D(uNZ,vec2(v/12000.+.31,a*.11+.2)).r')+'-.15)*1.6,0.,1.);',
  '  return '+dnF(DN_IMM.h)+'*(m*p+'+dnF(DN_IMM.b)+')*rd*q*(1.-.92*mk);}']:[]),
  'vec4 dnHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float me=dnMesa(x,Z.g),mk=clamp(me/20.,0.,1.);float h=Z.r+Z.b*(dnDune(x)-.35)*(1.-.85*Z.a)*(1.-.92*mk)+me'+(DN_IMM.on?'+dnGeant(x,Z.g,mk)':'')+';gP=Z.a;gM=mk;gV=0.;gR=Z.g;',
  '  vec2 fp=(x-uFD.xy)*uFD.zw;if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);h=mix(h,C.r,C.g);}',
  '  float w=0.,dep=0.;if(uOA.z>0.){float rr=length(x-uOA.xy)/uOA.z;if(rr<2.4){float o=rr<1.?uOA.w-12.*(1.-rr*rr):uOA.w+(rr-1.)*uOA.z*.2;h=min(h,o);',
  '    gV=smoothstep(.95,1.06,rr)*(1.-smoothstep(1.30,1.62,rr));if(h<uOA.w-.05){dep=uOA.w-h;h=uOA.w;w=1.;}}}',
  '  return vec4(h,w,dep,0.);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=dnHt(x);float pu=gU,pa=gP,pm=gM,vg=gV,pr=gR,e=S/uG*(1.+k)*2.2;',
  '  float hx=dnHt(x+vec2(e,0.)).x,hz=dnHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-5.,hs+9.,A.x);}',
  '  vA=vec4(A.y,A.z,pu,lit);vB=vec4(pa,pm,pr,vg);vGp=gp;vF=vec4(aN.xy/aN.z,aN.w,uG);', /* (facettes) gp : la case de la grille (entiers aux sommets) · vF : l'indice de la tuile, son niveau, G */
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const DN_FS=['uniform sampler2D uNZ;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uSaA,uSaB,uSaL,uShd,uClay,uVeg,uHaze,uSkH,uSkZ,uWS,uWD,uPhP,uPhD,uPhC;uniform vec4 uQ,uK,uW,uMo,uPl,uLm,uEx,uSp;uniform vec2 uDk;uniform float uTime,uFlash,uPoly,uLum;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_fragment>',
  PH_GLSL,'float dh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
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
  /* ===== LE SABLE DU SAHARA (2026-10-26, Léo : « les gros tas de sable changent de couleur d'un coup, brutalement · tout est tracé de lignes comme des trucs japonais, mais on est dans le Sahara · deux types de matière de sable · je veux l'immensité ») =====
     Fini les rides en cos() à 62 cm / 3 m / 13 m, les traînées, les filets : aucune ligne régulière à aucune distance. À la place, de la MATIÈRE : (1) un GRAIN isotrope lu dans les bruits de uNZ (deux lectures, ~3,7 m et ~1,3 m de tuile : les octaves fines de la texture
     font la peau du sable, et ses mipmaps l'effacent d'elles-mêmes avec la distance — jamais de moiré), qui moire la teinte, penche une normale minuscule (satin, éclats) ; (2) de grandes HOULES très douces (la normale et la teinte ondulent sur des centaines de mètres : l'immensité) ;
     (3) DEUX MATIÈRES, mêlées par un masque très large (le creux des dunes, le bord de la route, de grandes plaques) : le sable FIN doré, lustre de soie serré, et le sable GROS ocre-rouge, plus sombre, plus rugueux, un lustre large et des éclats de quartz plus nombreux.
     LA BASCULE BRUTALE (cause mesurée, sorties de débogage sur `lit`, `shw` et `wr`) : (a) le teint de l'ombre passait de « plein soleil » à « violet plat » dans une fenêtre de 0,4 de produit scalaire (clamp(ndl*2.5+.2)) et REMPLAÇAIT la couleur du sable par celle de uShd à
     même luminance : un à-plat ; (b) l'ombre portée (`lit`, lue aux sommets) tombait de 1 à 0 sur 4 m de hauteur, soit une case de 8 m : une arête ; (c) les rides de 3 m et 13 m retournaient la normale de part et d'autre de cette fenêtre : marbrures. Désormais le teint suit
     une rampe douce (smoothstep(-.32,.52,ndl) × lit) qui ne garde plus que la part de violet qu'il faut ; la pénombre de l'ombre portée s'étale sur 14 m ; le creux d'une dune s'assombrit (ao) et la face à l'ombre reçoit du ciel selon son orientation : une forme, pas un aplat. */
  '  float rm=(1.-.85*pan)*(1.-veg)*(1.-wat)*(1.-smoothstep(.55,.85,stp0))*uK.y,dr=vB.z;',
  '  float mc=clamp(.62*(1.-smoothstep(0.,.6,du))+.78*(1.-smoothstep(30.,300.,dr))+1.6*(n0.g-.5)-.05,0.,1.);mc=mc*mc*(3.-2.*mc);',
  '  float hl=(n0.r-.5)*1.1+(n1.r-.5)*.6;N=normalize(N+vec3((n1.r-.5)+.8*(n0.g-.5),0.,(n1.g-.5)+.8*(n0.b-.5))*.34*rm);',
  /* ===== LE VRAI SABLE (2026-11-05, Sacha : « ça fait pas du tout un aspect sable, la texture n'est pas belle ») =====
     Le grain seul faisait une peau de satin ; le sable réel se reconnaît à trois choses : (1) les RIDES DU VENT — des petites crêtes (~80 cm) couchées en travers du vent, qui se FOURCHENT et se défont (la phase est tordue par trois bruits, l'amplitude varie par plaques : jamais la ligne régulière
     « japonaise » de l'ancienne version), visibles tant que la rangée fait plus de ~3 px (`fp`, l'empreinte d'un pixel en m : aucune moirée), et par-dessus des MÉGA-RIDES de 5 m qui portent plus loin ; (2) les deux faces d'une dune ne se ressemblent pas : la face sous le vent (`lee`, la normale penche
     dans le sens du vent) est lisse, plus sombre, striée par les petites avalanches qui coulent dans la pente ; (3) le grain ne s'éteint plus à 95 m mais à 150 m. */
  '  float lee=smoothstep(.06,.40,dot(N.xz,Wd))*smoothstep(0.,.25,stp0);',
  '  {vec2 Wq=vec2(-Wd.y,Wd.x);float pr=dot(pp,Wd),pq=dot(pp,Wq),fall=(1.-lee)*rm*(1.-smoothstep(70.,300.,dist));',
  '   float r1=fall*smoothstep(.34,.11,fp)*(.25+.75*smoothstep(.26,.68,n1.b)),ph1=pr/.78+7.*(n1.g-.5)+4.*(n0.b-.5)+2.*(n2.r-.5)+.9*sin(pq/6.+3.*n0.r);',
  '   float r2=fall*smoothstep(1.9,.55,fp)*(.30+.70*smoothstep(.22,.70,n0.g)),ph2=pr/5.2+5.*(n0.r-.5)+3.*(n1.r-.5)+.7*sin(pq/31.+4.*n0.g);',
  '   N=normalize(N+vec3(Wd.x,0.,Wd.y)*(sin(ph1)*.17*r1+sin(ph2)*.075*r2));}',
  '  vec4 q1=texture2D(uNZ,pp/3.7+vec2(.31,.77)+(n2.rg-.5)*.55),q2=texture2D(uNZ,mat2(.8,.6,-.6,.8)*pp/1.31+vec2(.13,.53)+(n2.gb-.5)*.5);',
  /* ===== LES RIDES DU VENT (2026-11-05, Sacha : « j'aime pas la texture du sable » · Arrakis) =====
     Le sable était un aplat lisse tacheté de nuages sales. Maintenant il est RIDÉ comme un vrai désert : des bandes de bruit ÉTIRÉES en travers du vent (courtes dans le sens du vent, longues en travers : jamais des lignes régulières, des rides qui se coupent, se perdent et repartent) qui penchent la normale vers le vent (la lumière rasante accroche une arête, l'autre est dans l'ombre) et creusent un peu la teinte. Elles s'éteignent avec la distance (120 → 700 m) et sur la route, l'eau, la végétation. */
  '  float rip=rm*(uMo.z>.001?1.:0.)*(1.-smoothstep(90.,520.,dist));float rpl=0.;',
  '  if(rip>.01){vec2 wq9=vec2(-Wd.y,Wd.x);vec2 ru=vec2(dot(pp,Wd)/9.+.37,dot(pp,wq9)/130.)+(n2.rg-.5)*.35;float r1=texture2D(uNZ,ru).g,r2=texture2D(uNZ,vec2(dot(pp,Wd)/3.4,dot(pp,wq9)/60.)+vec2(.61,.19)+(n2.gb-.5)*.3).b;rpl=((r1-.5)*1.1+(r2-.5)*.7)*rip;',
  '    N=normalize(N+vec3(Wd.x,0.,Wd.y)*rpl*.26);}',
  '  float kg=rm*min(uEx.y,1.)*(uMo.z>.001?1.:0.)*(1.-smoothstep(40.,260.,dist));vec3 Nm=vec3(q1.b-.5+.7*(q2.b-.5),0.,q1.a-.5+.7*(q2.a-.5))*(.46+.60*mc)*kg;',
  '  float stp=clamp(1.-N.y,0.,1.);vec3 NL=N;if(uPoly>.5){vec3 dv=Nf-Ns;NL=normalize(Ns+dv*min(uPl.w,.30/max(length(dv),1e-4))+(N-Ns));}', // (facettes) NL : la normale qui éclaire — la plate + la moitié des rides ; la matière (pente, roche…) lit toujours la lisse
  '  float tn=clamp(.5+(n0.r-.5)*1.7+(n1.g-.5)*.8+.45*dot(N.xz,Wd),0.,1.);vec3 sa=mix(uSaA,uSaB,tn)*(.95+.08*n2.b+.06*(n2.a-.5))*(1.+.10*hl);sa=mix(sa,sa*vec3(1.,.94,.88)*.97,mc);',
  '  sa=mix(sa,uSaL,smoothstep(.80,1.,du)*.40);', // la crête, plus claire
  '  sa*=1.-lee*rm*.16;if(lee>.04){float av=texture2D(uNZ,vec2(dot(pp,vec2(-Wd.y,Wd.x))/2.7+.4,dot(pp,Wd)/19.+.2)).a;sa*=1.-lee*rm*.30*smoothstep(.36,.76,av);}', // la face sous le vent : plus sombre, striée par les avalanches
  '  float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));', // l'argile blanche et ses craquelures
  '  vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);vec3 col=mix(sa,clay,cl);col=mix(col,gv,veg);',
  /* LA ROCHE (2026-10-22) : les flancs raides — des buttes de grès — se couvrent de STRATES (des lits de ~20 m, du terracotta sombre à la crème, ondulés par le bruit, un joint sombre entre deux lits) ; sur le plateau, le sable reste */
  '  float rk=clamp(vB.y,0.,1.)*smoothstep(.08,.24,stp);', // (la roche : les BUTTES seulement — les parois de sable restent du sable)
  '  if(rk>.01){float yy=vW.y*.07+.42*n1.r+.12*n2.g,id=floor(yy),fb=smoothstep(.35,1.,fract(yy)),h1=mix(dh2(vec2(id,3.7)),dh2(vec2(id+1.,3.7)),fb),h2=mix(dh2(vec2(id,9.1)),dh2(vec2(id+1.,9.1)),fb);',
  '    vec3 rc=mix(uSaB*.84,uSaL*.94,.25+.5*h1)*(.90+.20*h2)*(.94+.12*n2.g);',
  '    col=mix(col,rc,rk);}',
  /* LE GRAIN (albedo) : la teinte du sable moirée par les deux lectures de grain (plus marquée dans le sable gros, qui sème en plus de petits cailloux sombres) ; il s'éteint avec la distance (10 → 95 m) : au loin, ce sont les houles qui parlent */
  '  vec2 wd=uW.xy,wq=vec2(-uW.y,uW.x);float wx=dot(vW.xz,wd),wz=dot(vW.xz,wq),gk=min(uEx.y,1.)*(1.-.85*pan)*(1.-veg)*(1.-wat)*(1.-smoothstep(14.,150.,dist))*(uMo.z>.001?1.:0.);',
  '  col*=1.+rpl*.07;',
  '  col*=1.+gk*(1.+.45*mc)*((q1.a-.5)*.30+(q2.a-.5)*.26);col=mix(col,col*vec3(.78,.66,.62),gk*mc*smoothstep(.60,.80,q1.b)*.20);',
  '  if(uPoly>.5)col*=ftn*vec3(1.+(hs9-.5)*.02,1.,1.-(hs9-.5)*.025);vec3 Ls=normalize(vec3(uSunD.x,min(uSunD.y,uK.w),uSunD.z));float ndl=dot(NL,Ls);vec3 NG=normalize(NL+Nm);float wr=clamp((dot(normalize(NL+Nm*.40),Ls)+uK.z)/(1.+uK.z),0.,1.);', // (uK.w : le soleil de midi est abaissé pour le RELIEF — la lumière de forme ; l'ombre, elle, reste celle du vrai soleil)
  '  float ao=mix(.70,1.,smoothstep(0.,.5,du));', // le creux d'une dune reçoit moins de ciel
  '  vec3 Lc=uSunC*wr*lit+mix(uGnd,uSky,NL.y*.5+.5)*1.15*ao*(.88+.12*lit)+uSunC*.10*(1.-lit)*smoothstep(-.8,.4,ndl)+uFillC*max(dot(NL,uFillD),0.)*.5+uSunC*(.10+.16*rk)*(1.-lit)*(.6+.4*NL.y)+uGnd*.28*rk;', /* + le REBOND : le sable à l'ombre reçoit la lumière des dunes au soleil (jamais de creux noir) */
  /* (2026-10-27, Léo : « désature le sable éclairé : plus doré/crème, moins orange vif ») la lumière chaude du biome (uSunC) laisse la couleur du SABLE seul : après l'éclairage, le sable éclairé est tiré vers un or crème à luminance égale (la part baisse dans l'ombre, où le violet reprend la main) ; ni le ciel ni les décors ne bougent */
  '  vec3 c=col*Lc;',
  '  float shw=1.-lit*smoothstep(-.32,.52,ndl);c=mix(c,vec3(1.,.90,.74)*dot(c,vec3(.3,.55,.15))/.906,(.58-.38*shw)*smoothstep(.0,.30,uSunC.r-uSunC.b));c=mix(c,c*uShd,shw*.72);',
  /* LES DEUX TEMPÉRATURES : à l'ombre, le sable ne devient plus un rouge sombre mais un violet-bleu de MÊME valeur (la clé chaude, le remplissage froid) */
  '  {float ly=dot(c,vec3(.3,.55,.15));c=mix(c,ly*uShd/dot(uShd,vec3(.3,.55,.15)),clamp(shw*.64*uEx.x,0.,.9));}',
  '  float fr=pow(1.-max(dot(NL,V),0.),4.);c+=(uSky*.22+uSunC*.16*max(ndl,0.)*lit)*fr*uK.x*(1.-wat);', // le SATIN du sable au rasant
  '  vec3 Hh=normalize(Ls+V);',
  '  if(wat<.5){float nh=max(dot(NG,Hh),0.),sf=pow(nh,22.)*.12,sc=pow(nh,6.)*.05+pow(nh,48.)*q2.a*kg*.16;c+=mix(uSunC,col*uSunC*1.5,.55)*mix(sf,sc,mc)*lit*(1.-pan*.8)*(1.-veg)*(.4+uK.x)*(1.-smoothstep(200.,900.,dist));}',  /* le LUSTRE : de soie serré sur le sable fin, large et grenu sur le gros (jamais un blanc de plastique : le reflet prend la teinte du sable) */
  '  if(dist<115.&&wat<.5&&uMo.z>.9){vec2 gc=floor(pp*11.);float g1=dh2(gc),g2=dh2(gc+17.3),g3=dh2(gc+41.9);vec3 Nc=normalize(NL+vec3(g1-.5,g3*.3,g2-.5)*.9);',
  '    c+=uSunC*pow(max(dot(Nc,Hh),0.),520.)*step(.56-.18*mc,g3)*lit*uQ.w*(1.-smoothstep(40.,115.,dist))*6.;}', // les ÉCLATS : une facette de 9 cm au hasard, juste quand elle renvoie le soleil vers l'œil
  /* LES ÉCLATS DE FACETTE (le sable de près comme de loin : une facette plate qui renvoie le soleil vers l'œil) ET LES JOINTS VITRAIL (une arête de lumière, qui respire d'une onde lente) */
  '  if(uPoly>.5&&wat<.5){float fgl=pow(max(dot(NL,Hh),0.),70.)*step(.5,hs9)*lit*(1.-smoothstep(300.,2200.,dist));c+=uSunC*fgl*uPl.z*2.2;',
  '    float wv=.78+.22*sin(dot(vW.xz,vec2(.0049,.0031))-uTime*.7);c=mix(c,vec3(1.,.90,.72)*(dot(c,vec3(.3,.55,.15))*1.35+.04),jn*wv*.48);}',
  /* LA LUMIÈRE DU SABLE : le contre-jour (les crêtes s'embrasent quand on regarde vers le soleil), le voile de diffusion dans l'air, le terminateur orangé (la lumière qui traverse le grain), le rebond chaud dans l'ombre */
  '  if(uLum>.5&&wat<.5){float vs=max(dot(-V,Ls),0.),rim=pow(1.-max(dot(NL,V),0.),3.),tm=smoothstep(-.10,.16,ndl)*(1.-smoothstep(.16,.62,ndl));',
  '    c+=uSunC*vec3(1.,.70,.40)*rim*vs*vs*vs*lit*uLm.x*(1.-.5*smoothstep(1500.,4000.,dist));',
  '    c+=col*uSunC*vec3(.46,.28,.15)*tm*lit*uLm.z;',
  '    c+=col*uSunC*vec3(.95,.58,.32)*(1.-lit)*(.5+.5*NL.y)*.12*uLm.w;',
  '    c+=uSunC*vec3(1.,.80,.52)*pow(vs,6.)*(1.-exp(-dist/2600.))*uLm.y*.5;}',
  /* ===== LE SABLE v3 (2026-11-06, Léo : « le shading du sable beaucoup plus gourmand, type shader Minecraft ultra réaliste ») — quatre gestes, tous sous `uLum` (qualité haute ; le téléphone allégé les saute) :
     (1) LA LUMIÈRE RASANTE SCULPTE LES RIDES : plus le soleil est bas sur la face (ndl petit), plus l'arête d'une ride est claire et son creux sombre (contraste ×~1,6, éteint au loin et à l'ombre : jamais de moiré) ;
     (2) L'OMBRE PROPRE DES CRÊTES : le haut d'une dune prend un liseré clair, juste derrière lui la face sous le vent plonge (une arête nette, pas un dégradé mou) ;
     (3) LE SUBSURFACE DOUX : la lumière qui traverse le grain ressort ROUGE-ORANGÉ dans une large bande au terminateur et jusque dans la pénombre (le sable fin est translucide sur quelques mm) ;
     (4) LE GRAIN QUI SCINTILLE : de petits cristaux plus clairs que la teinte, nombreux de près, serrés en lumière rasante. */
  '  if(uLum>.5&&wat<.5&&uMo.z>.001){float gz=1.-smoothstep(.04,.60,ndl),near=1.-smoothstep(50.,420.,dist),cs=smoothstep(.84,.97,du)*(1.-smoothstep(.985,1.,du));',
  '    c*=1.+rpl*gz*.60*near*(.35+.65*lit)*(1.-pan);',
  '    c*=1.-lee*smoothstep(.55,.90,du)*.20*lit*(1.-pan);c+=uSunC*vec3(1.,.78,.52)*cs*lit*max(ndl,0.)*.10*(1.-pan)*(1.-veg);',
  '    float sb=smoothstep(-.40,.08,ndl)*(1.-smoothstep(.08,.55,ndl));c+=col*uSunC*vec3(1.,.46,.22)*sb*(.45+.55*lit)*.26*(1.-.65*uDk.x)*(1.-pan)*(1.-veg);',
  '    float gs=dh2(floor(pp*38.)),gs2=dh2(floor(pp*38.)+9.1);c+=col*uSunC*step(.93+.06*max(uDk.x,uDk.y),gs)*(.25+.75*step(.5,gs2))*lit*(.4+.9*gz)*(1.-smoothstep(8.,70.,dist))*.30*(1.-pan)*(1.-veg);}',
  /* ===== LE SABLE AU CRÉPUSCULE ET LA NUIT (2026-11-06, Léo : « le jour me plaît ; le soir et la nuit, pas trop ») — `uDk` : x = le soir, y = la nuit (0 le jour : RIEN ne change au jour).
     CRÉPUSCULE : deux températures franches — les faces au soleil virent à l'or (la lumière rasante, longue), l'autre côté du terminateur plonge dans un bleu-violet frais (au lieu de l'orange boueux),
     les rides se creusent davantage (ombres longues), la crête prend un liseré d'or net. NUIT : le sable devient du sable de LUNE — un liseré argenté sur les crêtes, les rides lisibles, un satin froid
     qui accroche aux silhouettes (au lieu d'un bleu plat). */
  '  if(uLum>.5&&wat<.5&&uDk.x+uDk.y>.001){float dk=uDk.x,nk=uDk.y,gz2=1.-smoothstep(.04,.60,ndl),nr2=1.-smoothstep(50.,420.,dist),cs2=smoothstep(.84,.97,du)*(1.-smoothstep(.985,1.,du)),sd2=(1.-pan)*(1.-veg);',
  '    c=mix(c,c*vec3(.66,.72,1.04),dk*(1.-smoothstep(-.06,.34,ndl))*.55*sd2);',
  '    c+=col*uSunC*vec3(1.,.72,.40)*smoothstep(.06,.55,ndl)*lit*.24*dk*sd2;',
  '    c+=uSunC*vec3(1.,.80,.50)*cs2*lit*.40*dk*sd2;',
  '    c*=1.+rpl*gz2*nr2*(.38*dk+.55*nk)*(.35+.65*lit);',
  '    float sa2=pow(1.-max(dot(NL,V),0.),3.);c+=vec3(.10,.17,.34)*sa2*nk*sd2*(1.-smoothstep(300.,2500.,dist));c+=vec3(.50,.62,1.)*cs2*.14*nk*sd2;}',
  /* LES ÉTINCELLES D'OR (l'éclat cash) : de rares grains qui s'allument un instant, or ou rose, jusqu'à 2 km — la cellule grandit avec la distance (≈ 3 px à l'écran) */
  '  if(uSp.w>.001&&wat<.5){float cs=exp2(floor(log2(max(dist,4.)*.0042)*2.)*.5),hq=dh2(floor(vW.xz/cs)+cs),tw=pow(.5+.5*sin(uTime*(2.4+3.*fract(hq*91.))+hq*600.),10.);',
  '    c+=mix(uSp.rgb,vec3(1.,.92,.74),step(.72,fract(hq*37.)))*step(.986,hq)*tw*lit*(1.-.9*pan)*(1.-smoothstep(500.,2400.,dist))*2.4*uSp.w;}',
  /* LA CRÊTE VIVE : le grain diffuse la lumière vers l'avant au rasant (un liseré d'or sur les crêtes en contre-jour), et le sable FILE des crêtes dans le vent (bandes qui dérivent, uTime) */
  '  {float fg=pow(max(dot(-V,uSunD),0.),3.)*fr*lit*(1.-wat);float spd=smoothstep(.88,.97,du)*(1.-smoothstep(.992,1.,du)),sn=texture2D(uNZ,vec2((wx-uTime*11.)/110.,wz/85.)).a;',
  '   c+=mix(uSunC,uSaL*dot(uSunC,vec3(.33)),.4)*(fg*.55+spd*smoothstep(.40,.80,sn)*.42*lit)*uEx.w*(1.-pan)*(1.-.7*smoothstep(900.,3000.,dist));}',
  '  if(wat>.01){vec4 nw=texture2D(uNZ,mat2(.8,.6,-.6,.8)*vW.xz/57.+uTime*vec2(.006,.010)),nw2=texture2D(uNZ,vW.xz/143.-uTime*vec2(.004,.002));', /* (des bruits LARGES et tournés : à 18 m la tuile du bruit se répétait en grille sur le lac) */
  '    vec3 Nw=normalize(vec3(0.,6.,0.)+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.));',
  '    float f9=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));',
  '    vec3 cw=wc*(uSunC*(.3+.7*max(dot(Nw,uSunD),0.))*lit+mix(uGnd,uSky,.7))*.9+sk*f9+uSunC*pow(max(dot(R,uSunD),0.),160.)*1.2*lit;c=mix(c,cw,wat);}',
  '  if(uPhC.r+uPhC.g>.001)c+=phBeam(col,NL,vW,uPhP,uPhD,uPhC);', // les PHARES sur le sable
  /* LE MIRAGE : au loin, le sable presque à plat, vu en rasant, renvoie le ciel — et tremble */
  '  if(uQ.y>.001){float mi=uQ.y*smoothstep(800.,3200.,dist)*(1.-smoothstep('+(DN_IMM.on?'.012,.05':'.02,.10')+',abs(V.y)))*(1.-smoothstep(.06,.25,stp))'+(DN_IMM.on?'*smoothstep(-.015,.012,V.y)':'')+';',
  '   float sh=texture2D(uNZ,vec2(vW.x/260.+uTime*.04,vW.z/260.-uTime*.03)).r;c=mix(c,mix(mix(uSkH,uSkZ,.25),uWS*1.3+.06,.42*uEx.z)*(.92+.16*sh),mi*(.55+.45*sh));}',
  /* LA BRUME EN PLANS : la poussière du proche reste chaude, celle du lointain vire au froid du ciel (le plan lointain est plus clair et plus froid) et s'épaissit dans les creux */
  '  {float far=smoothstep(1500.,6500.,dist)*uEx.z,low=smoothstep(40.,-150.,vW.y-uCam.y)*smoothstep(500.,2600.,dist);vec3 hc=mix(uHaze,uHaze*.45+mix(uSkH,uSkZ,.45)*.75,far);',
  '   c=mix(c,hc,clamp(uQ.x*smoothstep(150.,4500.,dist)*.65*(1.+.6*low*uEx.z),0.,1.));}', // la poussière en suspension
  /* L'IMMENSITÉ : la PERSPECTIVE AÉRIENNE du lointain — au-delà de ~1,5 km chaque plan perd son contraste et vire à la brume froide du ciel (plus vite dans les creux : ils se remplissent), de sorte que chaque crête géante est plus claire et plus bleue que celle qui la précède */
  ...(DN_IMM.on?['  {float im=smoothstep(1500.,6500.,dist)*uEx.z*'+dnF(DN_IMM.air)+'*(1.+.45*smoothstep(60.,-200.,vW.y-uCam.y));vec3 hz=mix(uSkH,uSkZ,.5);','#ifdef USE_FOG','   hz=mix(fogColor,hz,.35);','#endif','   c=mix(c,hz,clamp(im,0.,.92));}']:[]),
  '  c=mix(c,uHaze,uQ.z*smoothstep(8.,500.,dist)*.5);', // (le vent de sable et la tempête : la poussière est DANS l'air tout près — le sable proche n'est plus net)
  '  c+=uFlash*col*vec3(.75,.78,1.)*(.35+.65*max(NL.y,0.));',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
/* (2026-11-05, Sacha : « on enlève toutes les références à l'Égypte ») plus aucun signe gravé : la texture de la pierre gravée (aK 4, aucun modèle ne l'emploie plus) est vide. */
function dnGlyphes(){if(DN.glT)return DN.glT;const tx=new THREE.DataTexture(new Uint8Array([0,0,0,255]),1,1,THREE.RGBAFormat);tx.needsUpdate=true;DN.glT=tx;return tx;}
/* (2026-10-25, LES DUNES SOBRES ; 2026-10-26 : plus de rides, le sable du Sahara à une seule lecture de grain) le shader de pixels du sable, sur téléphone : la même image à 6/255 près au pire (le grain animé d'une image à l'autre en fait déjà 4 : chaque lecture de texture n'est faite que là où son résultat compte — la végétation, l'argile, la crête vive ;
   le 2e grain, le plus fin, est abandonné), sans le calcul des FACETTES du sable (dérivées, hachage, joints : leurs poids joint/éclat/plat valent 0 dans toutes les ambiances, il ne restait qu'une teinte de ±1,5 % par triangle : ~0,9 ms, 8 % de l'image). Un remplacement qui ne trouve plus son texte est ignoré : le shader d'origine reste juste. */
function dnLite(fs){const R=[["vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);vec3 col=mix(sa,clay,cl);col=mix(col,gv,veg);", "vec3 col=mix(sa,clay,cl);if(veg>.001){vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);col=mix(col,gv,veg);}"], ["float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));", "float cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay;if(cl>.001){float cr=texture2D(uNZ,vW.xz/14.).r;clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));}"], ["sn=texture2D(uNZ,vec2((wx-uTime*11.)/110.,wz/85.)).a;", "sn=du>.88?texture2D(uNZ,vec2((wx-uTime*11.)/110.,wz/85.)).a:0.;"], ["q2=texture2D(uNZ,mat2(.8,.6,-.6,.8)*pp/1.31+vec2(.13,.53)+(n2.gb-.5)*.5);", "q2=vec4(.5);"], ["if(uPoly>.5){vec3 nf=cross(", "if(false){vec3 nf=cross("], ["vec3 NL=N;if(uPoly>.5){vec3 dv=Nf-Ns;", "vec3 NL=N;if(false){vec3 dv=Nf-Ns;"], ["if(uPoly>.5)col*=ftn*vec3(", "if(false)col*=ftn*vec3("], ["if(uPoly>.5&&wat<.5){float fgl=", "if(false){float fgl="]];for(let i=0;i<R.length;i++)if(fs.indexOf(R[i][0])>=0)fs=fs.replace(R[i][0],R[i][1]);return fs;}
function dnTerrain(){ if(DN.mesh)return;
  cyBruits();
  const G=PAL.b('dnGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];DN.G=G;DN.R0=PAL.b('dnR0',118);DN.lmin=DN_POLY?Math.max(0,Math.ceil(Math.log2(DN_CELL*G/DN.S0))):0; /* (facettes) la plus petite cellule : ~7,5 m (G=32 : niveau 2 = 8 m · G=16 : niveau 1 = 8 m) */
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  DN.aN=new THREE.InstancedBufferAttribute(new Float32Array(DN.maxN*4),4);DN.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',DN.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);DN.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;DN.z1=z1; /* (le texel vide : la matière le reprend quand les dunes rendent la puce, dnLibere) */
  const C3=()=>({value:new THREE.Color()});
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTZ:{value:z1},uTS:{value:z1},uNZ:{value:CY.tNz},uGl:{value:dnGlyphes()},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uOA:{value:new THREE.Vector4(0,0,0,0)},uW:{value:new THREE.Vector4(1,0,1,0)},uLam:{value:560},uDs:{value:new THREE.Vector2(0,.12)},uEx:{value:new THREE.Vector4(1,1,.8,1)},uSp:{value:new THREE.Vector4(1,.8,.45,1)},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:DN.R0},uTime:{value:0},uFlash:{value:0},uSunD:{value:SUN_DIR},
    uSunC:C3(),uSky:C3(),uGnd:C3(),uFillC:C3(),uFillD:{value:new THREE.Vector3(0,-1,0)},uSaA:C3(),uSaB:C3(),uSaL:C3(),uShd:C3(),uClay:C3(),uVeg:C3(),uHaze:C3(),uSkH:C3(),uSkZ:C3(),uWS:C3(),uWD:C3(),
    uDk:{value:new THREE.Vector2()},uQ:{value:new THREE.Vector4()},uPoly:{value:DN_POLY?1:0},uLum:{value:DN_POLY&&DN_LUM?1:0},uPl:{value:new THREE.Vector4(.03,0,0,0)},uLm:{value:new THREE.Vector4(.34,.25,.12,.04)},uFin:{value:new THREE.Vector4(0,0,0,0)},uK:{value:new THREE.Vector4(.5,1,.25,1)},uMo:{value:new THREE.Vector4(.8,.010,1,0)},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  DN.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_VS,fragmentShader:DN_MOB?dnLite(DN_FS):DN_FS,fog:true});DN.mat.dispose=function(){};
  const m=new THREE.Mesh(g,DN.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='dunes';m.renderOrder=-1;scene.add(m);DN.mesh=m;
  const gr=new THREE.Group();gr.name='dunes décor';gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);DN.grp=gr;
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
const DN_SAB={or:null,rouge:[.80,.60,.46,.18,.97],blanc:[.98,.93,.84,.6,1.12],rose:[.90,.74,.66,.16,1.02]};
function dnTeinte(c,T){const l=c.r*.3+c.g*.55+c.b*.15,n=T[0]*.3+T[1]*.55+T[2]*.15,g=l*T[4]/n,k=T[3];c.r+=(T[0]*g-c.r)*k;c.g+=(T[1]*g-c.g)*k;c.b+=(T[2]*g-c.b)*k;}
/* (2026-10-23, Léo : « inspire-toi de plusieurs météos et couleurs ») LES VARIANTES D'AMBIANCE, tirées avec la graine du décor (`DN.deco.sd`, sans toucher dnTirage) : le SOIR est ROSE-VIOLET (le crépuscule d'origine) ou DORÉ (soleil bas, ciel bleu-or), le MIDI BLEU PUR ou NUAGEUX
   (lumière filtrée, ciel gris-bleu). Les valeurs de base sont gardées à part (`__o`) : rien ne s'accumule d'une partie à l'autre. `?ciel=0` = les ambiances d'avant, `?ciel=dore|rose|nuageux|bleu` en force une. */
const DN_VAR={soir:{rose:{},dore:{jZen:[.22,.28,.46],jMid:[.72,.54,.46],jHor:[1,.74,.44],jSol:[1,.60,.26],fog:[.97,.76,.54],fogCj:[1,.74,.46],hemiS:[.54,.56,.74],hemiG:[.80,.58,.40],sunC:[1,.76,.46],cyZ:[.22,.28,.46],cyM:[.72,.54,.46],cyH:[1,.74,.44],cyS:[1,.64,.32],cyC:[1,.72,.50],cyR:[.86,.56,.40],dnA:[.90,.74,.56],dnB:[.78,.57,.40],dnL:[1,.87,.68],dnS:[.54,.50,.54],dnH:[1,.74,.50],cyK:[.66,.35,0,0]}},
  midi:{bleu:{},nuageux:{jZen:[.30,.40,.58],jMid:[.54,.62,.76],jHor:[.88,.86,.80],fog:[.82,.78,.70],fogCj:[.92,.86,.76],hemiS:[.52,.62,.84],sunI:.95,cyZ:[.30,.40,.58],cyM:[.54,.62,.76],cyH:[.88,.86,.80],cyS:[1,.94,.84],cyB:[.62,.64,.72],cyC:[.98,.98,.98],cyN:[0,.9,2.4,0],cyK:[.95,.3,0,0],dnS:[.58,.56,.58],dnH:[.90,.86,.76],dnA:[.88,.77,.58],dnB:[.76,.62,.45]}}};
function dnAmb(){const D=DN.deco;if(!D||DN._amb===D.sd)return;DN._amb=D.sd;const f=/[?&]ciel=(\w+)/.exec(location.search),h=(Math.imul((D.sd^0xC1E10)>>>0,0x9E3779B1)>>>0)/4294967296;
  for(const nm in DN_VAR){const B=BIOMES['dunes'+nm[0].toUpperCase()+nm.slice(1)];if(!B)continue;const o=B.__o||(B.__o={}),V=DN_VAR[nm],ks=Object.keys(V);let v=f&&f[1]==='0'?null:V[ks[h<.5?0:1]];if(f&&V[f[1]])v=V[f[1]];
    const cp=function(x){return Array.isArray(x)?x.slice():x;};for(const k in o)B[k]=cp(o[k]);                          /* d'abord la base */
    if(v)for(const k in v){if(o[k]===undefined)o[k]=cp(B[k]);B[k]=cp(v[k]);}}
  {const B=BIO.to;if(B&&/^dunes/.test(BIO.name||'')){bioLerp(B,B,1,BIO.cur);bioApply(BIO.cur);envPeintAvance(B);}}} /* (2026-10-31) le ciel des reflets de la variante : par le travailleur (voir envPeintAvance) */ /* l'ambiance courante est recalculée tout de suite */
const DN_NUA=!/[?&]nuages=0\b/.test(location.search); /* (2026-10-23, Léo : « plus de nuages ») `?nuages=0` : le ciel d'avant (peu de nuages, ronds, plats) */
function dnNuages(){const on=DN.on&&DN_NUA&&!QUAL_LOW&&/^dunes/.test(BIO.name||''),W=skyU.uCyW.value;if(!on){W.set(0,0);return;}W.set(.4,1);if(!DN_NUA&&skyU.uCyK){}} // bandes étirées, nuages modelés
function dunesTick(dt){dnAmb();envPeintTick();dnNuages();
  if(DN.on&&DN.sunAz!=null&&DN.sunEl!=null&&BIO.cur.cyA&&BIO.cur.cyA[0]<14)BIO.cur.cyA=[DN.sunEl,DN.sunAz,BIO.cur.cyA[2],BIO.cur.cyA[3]]; // le soir : le soleil dans l'axe de l'arrivée (voir buildDunes)
  if(!DN.mat)return;const U=DN.mat.uniforms,c=BIO.cur,k=LVL.dunes||0;
  if(DN.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(DN.gx>1&&(mode!=='fall'||!DN.on))DN.gx=1; // le vol fini (ou la map quittée) : la pesanteur redevient la sienne
  {const bn9=BIO.name||'';U.uDk.value.set(bn9==='dunesSoir'?1:0,bn9==='dunesNuit'?1:0);} /* (2026-11-06) le crépuscule et la nuit reçoivent leur propre sculpture du sable ; le JOUR (0, 0) reste celui validé */U.uPoly.value=DN_POLY?1:0;U.uLum.value=DN_POLY&&DN_LUM&&!QUAL_LOW?1:0; /* (facettes) qualité basse : les facettes restent (moins de triangles), sans les effets de lumière */
  if(DN.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const f=(u,k9)=>{const a=c[k9];if(a)u.value.fromArray(a);};
    f(U.uSaA,'dnA');f(U.uSaB,'dnB');f(U.uSaL,'dnL');f(U.uShd,'dnS');f(U.uClay,'dnC');f(U.uVeg,'dnV');f(U.uHaze,'dnH');f(U.uWS,'dnW');f(U.uWD,'dnX');f(U.uSkH,'cyH');f(U.uSkZ,'cyZ');
    const D9=DN.deco,T9=D9&&DN_SAB[D9.sable];if(T9){dnTeinte(U.uSaA.value,T9);dnTeinte(U.uSaB.value,T9);dnTeinte(U.uSaL.value,T9);} // (2026-10-20) LA COULEUR DU SABLE tirée (relue chaque image : rien ne s'accumule)
    const Q9=c.dnQ||[0,0,0,0],K9=c.dnK||[.5,1,.25,1];U.uQ.value.set(Q9[0],Q9[1],Q9[2],Q9[3]);U.uK.value.set(K9[0],K9[1]*(D9?D9.vent.rides:1),K9[2],K9[3]);{const R9=DN.reg||{},E9=R9.ex||c.dnE||[1,1,.8,1],P9=R9.sp||c.dnP||[1,.8,.45,1],pm=PAL.b('dnMat',1);U.uEx.value.set(E9[0],E9[1]*pm,E9[2],E9[3]*pm);U.uSp.value.set(P9[0],P9[1],P9[2],P9[3]*pm);} /* (2026-10-21) le grain, les crêtes qui filent, les étincelles, la brume en plans : dnE = [ombre froide, grain, brume lointaine froide, crêtes vives] et dnP = [teinte, quantité] des étincelles ; réduits aux paliers ANCIEN / MOYEN */ {const M9=c.dnM||[.8,.010,1,0];U.uMo.value.set(M9[0],M9[1],QUAL_LOW||!DN_MOSA?0:M9[2]*PAL.b('dnMo',1),M9[3]);} /* (2026-10-22, Léo : « le niveau dune n'est pas au niveau — regarde jade, la grotte, la forêt ») LA MOSAÏQUE du sable : [case de près (m), case par mètre de distance, force, —] */
    U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value;
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et dans la tempête
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}}
  let ombre=1;
  if(DN.on&&DN.O&&started&&!gameOver){const p=carGroup.position,O=DN.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/12));}}
  DN.ombre+=(ombre-DN.ombre)*Math.min(1,dt*5);dnPartTick(dt,c);
  if(k>.001||DN.ecrit){const e=DN.on?k:0;sun.intensity=c.sunI*(1-.62*(1-DN.ombre)*e);DN.ecrit=e>.001;}
  dnTornades(dt);}
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
  for(const b of DN.ob){const dx=p.x-b.x,dz=p.z-b.z,t=Math.max(0,Math.min(1,(p.y-b.y)/b.h)),rr=b.r*(1.35-.69*t)+1.2;if(dx*dx+dz*dz<rr*rr&&p.y>b.y-2&&p.y<b.y+b.h+1)return 'monolithe';}
  const P=DN.pyr;if(P){const dx=p.x-P.x,dz=p.z-P.z,ca=Math.cos(P.a),sa=Math.sin(P.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca));
    if(p.y>P.y-20&&p.y<P.y+P.h+1&&e<P.hw*(1-(p.y-P.y)/P.h)+1.5)return 'rocher';}
  for(const Q of DN.pyrs){if(Q===P)continue;const dx=p.x-Q.x,dz=p.z-Q.z,ca=Math.cos(Q.a),sa=Math.sin(Q.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca)); // (2026-10-20) les autres pyramides du tirage
    if(p.y>Q.y-20&&p.y<Q.y+Q.h+1&&e<Q.hw*(1-(p.y-Q.y)/Q.h)+1.5)return 'rocher';}
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
const DN_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uShd,uFillC,uFillD,uSaA,uSaB;uniform float uFlash,uTime,uPoly;uniform vec4 uMo,uPl;uniform sampler2D uNZ,uGl;varying vec3 vW,vN,vCol,vBc;varying float vLit,vK;','#include <fog_pars_fragment>',
  'float dh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'vec4 blk(vec2 uv,float ch,float sd){float row=floor(uv.y/ch),off=mod(row,2.)*.5;vec2 q=vec2(uv.x/(2.*ch)+off,uv.y/ch),ic=floor(q),fr=fract(q),e=min(fr,1.-fr);',
  '  float r=dh3(vec3(ic,sd)),r2=dh3(vec3(ic+7.7,sd+3.1)),j=1.-smoothstep(0.,.07,min(e.x*2.,e.y));vec2 g=(fr-.5)*vec2(1.6,1.);',
  '  float gl=step(abs(g.x),.5)*step(abs(g.y),.36)*step(.5,fract(g.y*3.4+r*6.))*step(.45,r2)*(1.-j);return vec4(r,j,r2,gl);}',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 N0=N,Nf=N;if(uPoly>.5){vec3 nf=cross(dFdx(vW),dFdy(vW));float lf=length(nf);if(lf>1e-14){Nf=nf/lf;if(dot(Nf,N0)<0.)Nf=-Nf;}}float dist=length(cameraPosition-vW);vec3 c=vCol*vCol;float su=step(39.5,vK)*(1.-step(49.5,vK))*(vK-40.)+step(49.5,vK),kk=mix(vK,mix(1.,0.,step(49.5,vK)),step(39.5,vK)),isB=step(.5,kk)*step(kk,1.5)+step(3.5,kk)*step(kk,4.5),isR=step(1.5,kk)*step(kk,2.5),isG=step(2.5,kk)*step(kk,3.5),isS=step(4.5,kk)*step(kk,5.5),pierre=min(1.,isB+isR+isS);c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,mix(1.25,1.0,pierre)),0.);',
  '  vec3 aN=abs(N);vec2 tg=normalize(vec2(-N.z,N.x)+vec2(1e-5));vec2 uv=aN.y>.88?vW.xz:vec2(dot(vW.xz,tg),vW.y);', // (les assises SUIVENT la face : le long de sa tangente horizontale et de la hauteur — plus de tuiles en biais sur les flancs inclinés d'une pyramide, plus de couture entre deux axes)
  '  float Lg=log2(max(dist*.011,.75)/.75),l0=floor(Lg),wl=Lg-l0,ch=.75*exp2(l0),kf=(1.-smoothstep(.45,1.1,length(fwidth(uv))/ch))*uMo.z;',
  '  if(isB+isR>.5&&uMo.z>.001){vec4 b=mix(blk(uv,ch,l0),blk(uv,ch*2.,l0+1.),wl);c*=(1.+(b.x-.5)*.42*kf)*(1.-b.y*(.20+.06*isB)*kf)*(1.+.10*pierre);N=normalize(N+(vec3(b.x,b.z,fract(b.x*7.31))-.5)*.22*kf);',
  '    if(kk>3.5){float gs=max(ch*1.7,.9),kg=1.-smoothstep(.20,.55,length(fwidth(uv))/gs);vec2 gq=uv/gs,gc=floor(gq),gf=fract(gq);float hr=dh3(vec3(gc.y,3.3,1.)),hc=dh3(vec3(gc,5.5)),ok=step(.20,hr)*step(.10,hc)*step(.07,gf.x)*step(gf.x,.93)*step(.07,gf.y)*step(gf.y,.93);float ix=floor(hc*16.);',
  '      float gly=texture2D(uGl,(vec2(mod(ix,4.),floor(ix/4.))+gf*.84+.08)/4.).r;c*=1.-.46*gly*ok*kg;}}',
  '  if(isR>.5){vec2 nq=vec2(dot(vW.xz,vec2(.7071,.7071))/9.,vW.y/60.);float nr=texture2D(uNZ,nq).g;c*=.80+.40*nr;}',
  '  if(isS>.5){float nq=texture2D(uNZ,vW.xz/5.+vec2(vW.y/7.,vW.y/11.)).g,nb=texture2D(uNZ,vW.xz/1.3+vec2(vW.y/1.7,0.)).r;c*=(.82+.34*nq)*(.94+.12*nb);}',
  '  c=mix(c,mix(uSaA,uSaB,.45)*.97,max(su,step(39.5,vK)*(1.-step(49.5,vK))*smoothstep(.45,.9,N0.y)*.6));','  vec3 NL=N;','#ifndef DN_TOR','  float pf9=step(.5,uPoly)*(1.-step(21.5,kk)*step(kk,22.5));NL=normalize(mix(N,normalize(Nf+(N-N0)*.8),pf9*min(uPl.w,1.)));','#endif',
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
function dnGeoPlus(g){
  g.boite=(x0,x1,y0,y1,z0,z1,col)=>{const a=[x0,y0,z0],b=[x1,y0,z0],c=[x1,y0,z1],d=[x0,y0,z1],e=[x0,y1,z0],f=[x1,y1,z0],h=[x1,y1,z1],i=[x0,y1,z1];
    g.quad(a,b,f,e,col);g.quad(b,c,h,f,col);g.quad(c,d,i,h,col);g.quad(d,a,e,i,col);g.quad(e,f,h,i,col);g.quad(a,d,c,b,col);};
  g.tube=(n,A,B,r0,r1,col,rot)=>{const ax=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(ax[0],ax[1],ax[2])||1;for(let k=0;k<3;k++)ax[k]/=l;
    const up=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],u=[ax[1]*up[2]-ax[2]*up[1],ax[2]*up[0]-ax[0]*up[2],ax[0]*up[1]-ax[1]*up[0]],ul=Math.hypot(u[0],u[1],u[2]);for(let k=0;k<3;k++)u[k]/=ul;
    const v=[ax[1]*u[2]-ax[2]*u[1],ax[2]*u[0]-ax[0]*u[2],ax[0]*u[1]-ax[1]*u[0]],p=(O,r,t)=>[O[0]+(u[0]*Math.cos(t)+v[0]*Math.sin(t))*r,O[1]+(u[1]*Math.cos(t)+v[1]*Math.sin(t))*r,O[2]+(u[2]*Math.cos(t)+v[2]*Math.sin(t))*r];
    for(let k=0;k<n;k++){const t1=(rot||0)+k/n*6.2832,t2=(rot||0)+(k+1)/n*6.2832;if(r1>0)g.quad(p(A,r0,t1),p(B,r1,t1),p(B,r1,t2),p(A,r0,t2),col);else g.tri(p(A,r0,t1),B,p(A,r0,t2),col);}};
  return g;}
function dnMonuments(seed){
  if(DN.grp){for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}
  DN.tor=[];DN.torIm=null;DN.decoN=null;
  if(DN.deco){try{dnMonumentsTires(seed);return;}catch(e){console.warn('dunes : décor tiré',e);for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}}
  try{dnEmbellir();}catch(e){console.warn('dunes : plan moyen',e);} /* (2026-10-21) les buttes, les arbres morts, les touffes : voir dunes-embellie.js */
  try{dnRuinesEns({});}catch(e){console.warn('dunes : ruines ensablées',e);} /* (2026-10-26) le décor d'avant : les ruines ont leur propre géométrie */
  DN.grp.updateMatrixWorld(true);}
/* (2026-10-20, LE DÉSERT AU HASARD) LE DÉCOR TIRÉ (DN.deco) : les obélisques (les brisés sans pyramidion, leur tronçon couché à côté), les pyramides de chaque
   style, les grands monuments (dnPrevoirDeco les a posés : ils ombrent et tuent), puis — à la pose, ici, sur le sable relu — le village, les campements,
   les caravanes, la flore, les diables de sable, le mur de tempête, les squelettes, les épaves. Les pièces neuves sont CUITES dans UNE géométrie (une
   instance, M9.t) : un seul appel de dessin de plus, aucun programme neuf. Son hasard : `D.sd` (rien de `rnd`, rien du tracé). */
function dnMonumentsTires(seed){return jadeFini(dnMonumentsTiresG(seed));}
/* (2026-11-01, Léo : « règle ce qui reste ») LES MONUMENTS EN PAS : des rendez-vous JF.lim entre les familles et dans les longues boucles, AVANT tout tirage
   (le hasard rg tombe dans le même ordre : le même décor) — d'un trait au passage (JF.lim infini), en pas au pré-bâti (dnMonuAvanceG, dunes-1.js). */
function* dnMonumentsTiresG(seed){
  DN.cuisJ=[];const D=DN.deco,M9=dnMats(),G2=dnGeos2(),S=DN.S,K=Math.sqrt(lvPiste()),RH=ROAD_HALF,t0=performance.now(),rg=mulberry32((D.sd^0x7A55D)>>>0),o9={},N={};
  const mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(0,0,0,'YXZ'),v9=new THREE.Vector3(),s9=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0),CU=dnCuiseur();DN.grp.visible=true;
  const cuis=(geo,x,y,z,sx,sy,sz,ry,tx,tz,te)=>{e9.set(tx||0,ry||0,tz||0);q9.setFromEuler(e9);mt.compose(v9.set(x,y,z),q9,s9.set(sx,sy,sz));CU.ajoute(geo,mt,te);};
  /* (2026-10-27, chasse aux gels) pas de géométrie, pas d'instance : depuis le 24/10, le dnGeos2 de dunes-embellie.js remplace celui d'ici (buttes et touffes
     seulement) — G2.tor et G2.mur n'existent plus. Les diables et le mur de tempête étaient des maillages VIDES : rien à l'écran, mais leur matière sans
     couleur de sommet (« vertexAlphas » de three) compilait un programme EN COURSE à l'arrivée dans les dunes. L'image ne change pas. */
  const inst=(geo,mat,L9,nom)=>{if(!L9.length||!geo)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  const libre=(x,z,r)=>{for(const p of DN.pyrs)if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+r+20)return false;for(const m of DN.mo)if(Math.hypot(m.x-x,m.z-z)<m.r+r+15)return false;
    for(const b of DN.ob)if(Math.hypot(b.x-x,b.z-z)<b.r*2+r+6)return false;return true;};
  const site=(lat0,lat1,clear,top,r,f0,f1)=>{for(let e=0;e<24;e++){const s0=L*(f0+(f1-f0)*rg()),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds)));if(S.gd[i]>.01)continue;
      const sg=rg()<.5?-1:1,lat=RH+(lat0+rg()*(lat1-lat0))*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9);
      if(o9.eau||!libre(x,z,r)||dnPresRoute(x,z,RH+clear,h+top))continue;return {x:x,z:z,h:h,i:i,t:Math.atan2(S.tx[i],S.tz[i])};}return null;};
  const tch=(c,k)=>[c[0]*(1-k+2*k*rg()),c[1]*(1-k+2*k*rg()),c[2]*(1-k+2*k*rg())];
  // LES MONOLITHES ÉPARS (2026-11-05, ARRAKIS — remplacent les obélisques) : un rocher dressé, érodé ; le brisé n'a plus de pointe (un fût en dents de scie), son tronçon tombé gît à côté
  {const MO=dnMod('monolithe'),MB=dnMod('monolitheCasse');
   for(const b of DN.ob)cuis(b.br?MB:MO,b.x,b.y,b.z,b.r/4,b.h/(b.br?55:64),b.r/4,b.a);
   for(const b of DN.ob){if(!b.br)continue;const an=rg()*6.28,fl=(30+rg()*26)*K*.7,x0=b.x+Math.sin(an)*b.r*1.8,z0=b.z+Math.cos(an)*b.r*1.8,x1=x0+Math.sin(an)*fl,z1=z0+Math.cos(an)*fl;
      const y=Math.min(dnHauteur(x0,z0),dnHauteur((x0+x1)/2,(z0+z1)/2),dnHauteur(x1,z1))+b.r*.25;if(dnPresRoute(x1,z1,RH+b.r+6,y+b.r)||dnPresRoute((x0+x1)/2,(z0+z1)/2,RH+b.r+6,y+b.r))continue;
      cuis(MO,x0,y,z0,b.r*.85/4,fl/64,b.r*.85/4,an,Math.PI/2,0);N.troncons=(N.troncons|0)+1;}}
  if(performance.now()>JF.lim)yield;
  // LES ROCHERS D'ARRAKIS (2026-11-05 — remplacent les pyramides : même tirage, même position, juste des aiguilles de grès érodées au lieu de pyramides)
  for(const P of DN.pyrs)cuis(dnMod(dnRocherNom(P.x*131+P.z*7|0)),P.x,P.y,P.z,P.hw,P.h,P.hw,P.a);
  if(performance.now()>JF.lim)yield;
  // LES ROCHERS JUMEAUX (2026-10-23, Léo : « des séries de pyramides, comme la photo » — désormais des rochers plus petits au pied des deux premiers grands)
  if(DN_ACTES.on)for(let k=0;k<Math.min(2,DN.pyrs.length);k++){const P=DN.pyrs[k],ca=Math.cos(P.a),sa=Math.sin(P.a);for(let j=0;j<3;j++){const hq=P.hw*(.15-.025*j),lx=P.hw*(1.32+.12*j),lz=(j-1)*P.hw*.62,x=P.x+ca*lx+sa*lz,z=P.z-sa*lx+ca*lz,h0=dnHauteur(x,z,o9);
    if(o9.eau||dnPresRoute(x,z,RH+hq*1.4+10,h0+hq*1.2))continue;
    /* (2026-11-07) MESURÉ : posé au sable du CENTRE, un rocher de 120 m de base pendait jusqu'à 119 m au-dessus d'une dune qui tombe (graine 2) : le pied part du sable le plus bas de son emprise (5 × 5) ; si le sable y varie de plus de 60 % de sa hauteur, il ne tient pas (pas posé) */
    const ry9=P.a+(j-1)*.05,lo9=dnSolBas(x,z,hq*1.15,hq*1.15,ry9,4); /* (9 × 9 : une emprise de 120 m) */if(h0-lo9>hq*1.15*.6)continue;cuis(dnMod(dnRocherNom(j)),x,Math.min(h0,lo9)-2-.03*hq,z,hq,hq*1.15,hq,ry9);N.reines=(N.reines|0)+1;}}
  if(performance.now()>JF.lim)yield;
  // LE VILLAGE DE TERRE en ruine : des maisons cubes, des murs bas
  if(D.village){const c=site(70,210,50,10,60,.08,.9);if(c){const n=8+((rg()*8)|0);N.maisons=0;
    for(let k=0;k<n+4;k++){const an=rg()*6.28,d=rg()*48*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,h0=dnHauteur(x,z,o9),mur=k>=n,w=mur?(12+rg()*18):(5+rg()*5),dp=mur?.9:(5+rg()*5),hh=mur?(1.4+rg()*1.6):(rg()<.35?1.2+rg()*1.5:3+rg()*3);
      if(o9.eau||dnPresRoute(x,z,RH+10,h0+hh+2))continue;const ry9=c.t+(rg()<.6?0:Math.PI/2)+(rg()-.5)*.2,lo9=Math.min(h0,dnSolBas(x,z,w*.5,dp*.5,ry9)); /* (2026-11-07) du sable le plus bas de l'emprise (rien ne pend) */
      cuis(dnMod('bloc'),x,lo9-.8,z,w,hh+.8+(h0-lo9),dp,ry9,0,0,tch([.82,.60,.42],.08));N.maisons++;}}}
  DN.car=[];DN.carIm=null; /* (plus de campements ni de caravanes : Arrakis ne connaît pas le chameau) */
  DN.nArb=0;DN.nPal=0; /* (plus d'acacias ni de palmiers, plus d'oasis vivante : le désert est nu) */
  if(performance.now()>JF.lim)yield;
  // LES DIABLES DE SABLE (ils tournent, dnTornades), LE MUR DE TEMPÊTE au loin, LES SQUELETTES, LES ÉPAVES
  DN.tor=[];DN.torIm=null;
  {const L9=[];for(let k=0;k<D.tornades;k++){const c=site(180,620,160,400,40,.05,.95);if(!c)continue;const h=(120+rg()*170)*K;DN.tor.push({x:c.x,y:c.h-4,z:c.z,h:h,a:rg()*6.28,w:1.2+rg()*1.6,p:rg()*6.28});L9.push([c.x,c.h-4,c.z,h*.34,0,h,h*.34]);}
   if(L9.length){DN.torIm=inst(G2.tor,M9.d,L9,'diables');if(DN.torIm)DN.torIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);}}
  if(D.tempete){const b=S.bb,cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,R9=Math.max(5200,Math.hypot(b[1]-b[0],b[3]-b[2])*.5+3600);let ym=1e9;for(let i=0;i<S.n;i+=8)ym=Math.min(ym,S.y[i]);inst(G2.mur,M9.d,[[cx,ym-420,cz,R9,D.tempete.a,1500,R9]],'mur');N.tempete=Math.round(R9);}
  try{yield* dnScenesG({rg:rg,cuis:cuis,K:K,RH:RH,N:N});}catch(e){console.warn('dunes : scènes',e);} // (2026-10-22) les scènes le long de la route (dunes-4.js)
  try{yield* dnRuinesEnsG({CU:CU,N:N});}catch(e){console.warn('dunes : ruines ensablées',e);} /* (2026-10-26) les ruines à moitié avalées par le sable : voir dunes-ruines.js */
  if(performance.now()>JF.lim)yield;
  if(CU.n()){const g=CU.fin(),im=new THREE.InstancedMesh(g,M9.t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;
    im.userData.jeter=1;im.name='dunes décor tiré';DN.grp.add(im);N.sommets=CU.n();}
  DN.grp.updateMatrixWorld(true);N.ms=Math.round(performance.now()-t0);DN.decoN=N;}
function dnTornades(dt){const im=DN.torIm;if(!im||!DN.on||paused||!DN.tor.length)return;const p=carGroup.position;let pres=false;for(const c of DN.tor)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<4000)pres=true;if(!pres)return;
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.tor){c.a=(c.a+dt*c.w)%6.2832;c.p=(c.p+dt*.05)%6.2832;e9.set(Math.sin(c.p*3)*.04,c.a,Math.cos(c.p*2)*.04);q9.setFromEuler(e9);
    mt.compose(v9.set(c.x+Math.sin(c.p)*30,c.y,c.z+Math.cos(c.p)*30),q9,s9.set(c.h*.34,c.h,c.h*.34));im.setMatrixAt(k++,mt);}
  im.instanceMatrix.needsUpdate=true;}
function dnPresRoute(x,z,lat,y){const S=DN.S;if(!S)return false;if(dnMesa(x,z,1e9)>1.5)return true; /* (une butte : rien ne s'y pose) */for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lat*lat&&y>S.y[i]-THICK-60)return true;}return false;} // un décor trop près d'une dalle (et pas loin dessous)
/* LES CARAVANES marchent (1,3 m/s, un pas qui balance) : la hauteur du sable relue chaque image pour les quatorze bêtes — seulement si on est assez près */
const DN_CT={m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),s:new THREE.Vector3(3.4,3.4,3.4)}; // (rien d'alloué dans la boucle)
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
  if(k==='decor')return dnAuditDecor(a); /* (2026-11-07) le décor cuit contre la route et contre le sable : voir dnAuditDecor (dunes-3.js) */
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
  if(k==='prof'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},o=[]; /* (banc) le profil en travers à l'abscisse a : [décalage latéral, hauteur de la dalle (jusqu'au bord), hauteur du sable] */
    frameAt(+a||0,F9);for(let lt=-60;lt<=60;lt+=(+b||6)){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;o.push([lt,Math.abs(lt)<=ROAD_HALF?+(F9.p.y+F9.b.y*lt).toFixed(1):null,+dnHauteur(x,z).toFixed(1)]);}return o;}
  if(k==='ech'){if(!DN.on||!DN.S)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||+a||0);q+=(+c||8)){const i=Math.max(0,Math.min(S9.n-1,Math.round(q/S9.ds))),f=function(v){return +v[i].toFixed(1);}; /* (banc) les paramètres du terrain prescrit à l'abscisse q : route, mer, côtés (h = la colline ou l'éperon, w = sa largeur) */
      o.push({s:Math.round(q),y:f(S9.y),B:f(S9.B),hP:f(S9.hP),wP:f(S9.wP),hM:f(S9.hM),wM:f(S9.wM),RE:Math.round(S9.RE[i]),pw:f(S9.pw),pan:f(S9.pan)});}return o;}
  if(k==='suit'){if(!started||gameOver)return 'pas de course';if(!paused)togglePause();const q=carGroup.position,f=DN_V.set(0,0,1).applyQuaternion(carGroup.quaternion); /* (banc) gèle la course et pose la caméra derrière la caisse : a = recul (m), b = hauteur, c = champ */
    camera.position.set(q.x-f.x*(a||14),q.y+(b||5),q.z-f.z*(a||14));camera.up.set(0,1,0);camera.lookAt(q.x+f.x*8,q.y+1,q.z+f.z*8);if(c)camera.fov=c;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {car:q.toArray().map(Math.round),s:Math.round(s),mode:mode};}
  if(k==='sauts')return (DN.lev||[]).map(function(v,j){return {n:j,tag:v.tag,lip:Math.round(v.s),pose:Math.round(v.e),vide:Math.round(v.e-v.s),visee:Math.round(v.aim),segment:v.seg,dy:DN.S?Math.round(DN.S.y[Math.min(DN.S.n-1,Math.round(v.s/DN.S.ds))]-DN.S.y[Math.min(DN.S.n-1,Math.round(v.e/DN.S.ds))]):0};});
  if(k==='tp'){if(!started||gameOver||mode!=='drive')return 'pas au sol';s=Math.max(0,Math.min(L-30,+a||0));lat=0;if(b!=null)vA=+b/SPD;return {s:Math.round(s),vA:+vA.toFixed(1)};} /* (banc) la caisse posée à l'abscisse a, à la vitesse monde b (m/s) */
  if(k==='marge'){if(!DN.on)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||L);q+=(+c||10)){const i=Math.min(S9.n-1,Math.round(q/S9.ds));o.push(Math.round(q)+':'+(S9.y[i]-dnHauteur(S9.x[i],S9.z[i])).toFixed(0)+'/D'+S9.D[i].toFixed(0)+'/z'+S9.zC[i].toFixed(1));}return o.join(' ');} /* (banc) la hauteur de la ligne de route au-dessus du sable, de a à b tous les c m */
  if(k==='raccourcis')return DN.rac||[];
  if(k==='libere')return {rendu:DN.libere||null,groupe:DN.grp?DN.grp.children.length:0,textures:['tC','tZ','tS'].filter(function(q){return !!DN[q];}).length}; /* (2026-11-03) ce que l'extinction a rendu à la puce (dnLibere) */
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
  if(k==='regle'){DN.reg=a||null;return DN.reg;} /* (banc, 2026-10-21) {ex:[…],sp:[…]} : règle les uniformes de l'embellissement sans recharger ; null = les valeurs de l'ambiance */
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='cam'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const P=a||[0,0,0],T=b||[0,0,1]; /* (banc) la caméra où l'on veut : a = [x,y,z] de l'œil, b = [x,y,z] de la cible, c = le champ (degrés) */
    camera.position.set(P[0],P[1],P[2]);camera.up.set(0,1,0);camera.lookAt(T[0],T[1],T[2]);if(c){camera.fov=c;camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  if(k==='vueL'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; /* (banc) la caméra à l'abscisse a, décalée de b m sur le côté (+ = à droite), à c m de haut, cap d° ; e = la pente du regard */
    frameAt(Math.max(0,Math.min(L-1,a||0)),F9);const lt=b||0,cap=(d||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap),pe=arguments[5]!=null?arguments[5]:.06;
    camera.position.set(F9.p.x+F9.b.x*lt,F9.p.y+(c||8),F9.p.z+F9.b.z*lt);camera.up.set(0,1,0);camera.lookAt(camera.position.x+dx*200,camera.position.y-200*pe,camera.position.z+dz*200);if(arguments[6]){camera.fov=arguments[6];camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round)};}
  if(k==='decors'){const r=function(o){return o.map(function(q){return {x:Math.round(q.x),y:Math.round(q.y),z:Math.round(q.z),h:Math.round(q.h||0),k:q.k||q.st||''};});};return {ob:r(DN.ob||[]),pyrs:r(DN.pyrs||[]),mo:r(DN.mo||[]),oasis:DN.oa?{x:Math.round(DN.oa.x),z:Math.round(DN.oa.z),r:Math.round(DN.oa.r)}:null,n:DN.decoN||null};} /* (banc) où sont les décors */
  if(k==='immense'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},H9={}; /* (banc, L'IMMENSITÉ) le profil de l'HORIZON vu de l'abscisse a, à b m au-dessus de la dalle : tous les c azimuts (défaut 24), l'élévation du sable le plus haut (degrés) et la distance où il se trouve ; + la moyenne et le nombre de crêtes successives (plans) sur chaque azimut */
    frameAt(Math.max(0,Math.min(L-1,a||0)),F9);const ey=F9.p.y+(b||4),n=Math.max(4,c|0||24),o=[];let sm9=0,pl9=0;
    for(let i=0;i<n;i++){const an=i/n*6.2832,ux=Math.cos(an),uz=Math.sin(an);let mx=-90,md=0,nb=0,vu=0;for(let d9=150;d9<=12000;d9+=d9<2000?50:100){const e=Math.atan2(dnHauteur(F9.p.x+ux*d9,F9.p.z+uz*d9,H9)-ey,d9)*57.2958;if(e>mx+.05){if(d9>1500&&e>vu+.15&&mx>-89)nb++;mx=e;md=d9;vu=e;}}
      o.push([Math.round(an*57.2958),+mx.toFixed(1),md,nb]);sm9+=mx;pl9+=nb;}
    return {moy:+(sm9/n).toFixed(2),plans:+(pl9/n).toFixed(1),az:o};}
  if(k==='h'){if(!DN.on)return 'pas de dunes';const H9={};return (a||[]).map(function(q){const hh=dnHauteur(q[0],q[1],H9);if(b===2){const o2={},dd=dnDune(q[0],q[1],DN.vent,DN.lam,o2);return [+dd.toFixed(3),+o2.du.toFixed(3)];}return b?[+hh.toFixed(1),+H9.dun.toFixed(1),+H9.B.toFixed(1)]:+hh.toFixed(1);});} /* (banc) la hauteur du sable aux points [x,z] de a ; avec b : [hauteur, dunes, fond] */
  if(k==='pointes'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},H9={},Z=DN.Z; /* (banc, LES SOMMETS ARRONDIS) la POINTE des sommets : une fenêtre de ±c m (défaut 2500) autour de l'abscisse a (défaut le milieu), maille b m (défaut 30) ; pour chaque maximum local d'au moins 10 m de relief : l'angle moyen (degrés) de la pente à 36 m du sommet (une dune ronde : ~10-18°, une aiguille : 30° et plus) ; `cones` : les sommets qui descendent dans TOUTES les directions (la plus faible descente > 18° = un cône, pas une crête) et le rayon de courbure du sommet (m) ; rend les centiles, le nombre d'aiguilles (> 28°) et les plus pointus */
    frameAt(Math.max(0,Math.min(L-1,a==null?L/2:+a)),F9);const e=+b||30,R=+c||2500,n=Math.floor(2*R/e)+1,G=new Float32Array(n*n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++)G[j*n+i]=dnHauteur(F9.p.x-R+i*e,F9.p.z-R+j*e,H9);
    const out=[],ds=36;for(let j=2;j<n-2;j++)for(let i=2;i<n-2;i++){const h=G[j*n+i];let top=true;for(let dj=-1;dj<=1&&top;dj++)for(let di=-1;di<=1;di++)if((di||dj)&&G[(j+dj)*n+i+di]>h){top=false;break;}
      if(!top)continue;const x=F9.p.x-R+i*e,z=F9.p.z-R+j*e;let sm9=0,mn=1e9,dm=1e9;for(let q=0;q<8;q++){const th=q*.7854,hh=dnHauteur(x+Math.cos(th)*ds,z+Math.sin(th)*ds,H9);sm9+=h-hh;if(h-hh<dm)dm=h-hh;const h2=dnHauteur(x+Math.cos(th)*130,z+Math.sin(th)*130,H9);if(h2<mn)mn=h2;}
      if(h-mn<10)continue;const dr=Z?cyBil(Z.d,Z.nx,Z.nz,4,1,(x-(Z.x0-Z.ts*.5))/Z.ts,(z-(Z.z0-Z.ts*.5))/Z.ts):0,md=sm9/8;out.push({cone:Math.atan(dm/ds)*57.2958,ang:Math.atan(md/ds)*57.2958,R:ds*ds/(2*Math.max(md,.01)),dr:dr,x:Math.round(x),z:Math.round(z),y:Math.round(h)});}
    const ct=function(v,q){return v.length?+v[Math.min(v.length-1,Math.floor(v.length*q))].toFixed(1):null;},an=out.map(function(o){return o.ang;}).sort(function(u,v){return u-v;}),rr=out.map(function(o){return o.R;}).sort(function(u,v){return u-v;});
    const bk=[[0,300],[300,900],[900,1e9]].map(function(r){const q=out.filter(function(o){return o.dr>=r[0]&&o.dr<r[1];}),w=q.map(function(o){return o.ang;}).sort(function(u,v){return u-v;});return {dr:r[0]+'-'+(r[1]>1e8?'':r[1]),n:q.length,angP50:ct(w,.5),aig:q.filter(function(o){return o.ang>28;}).length};});
    const co=out.slice().sort(function(u,v){return v.cone-u.cone;});out.sort(function(u,v){return v.ang-u.ang;});
    return {cones:{n18:co.filter(function(o){return o.cone>18;}).length,n25:co.filter(function(o){return o.cone>25;}).length,pires:co.slice(0,5).map(function(o){return [Math.round(o.cone),Math.round(o.R),Math.round(o.dr),o.x,o.z,o.y];})},par_dr:bk,n:out.length,angP50:ct(an,.5),angP90:ct(an,.9),angMax:an.length?+an[an.length-1].toFixed(1):null,aiguilles:out.filter(function(o){return o.ang>28;}).length,rayonP10:ct(rr,.1),rayonP50:ct(rr,.5),pires:out.slice(0,5).map(function(o){return [Math.round(o.ang),Math.round(o.R),Math.round(o.dr),o.x,o.z,o.y];})};}
  if(k==='parite'){if(!DN.on||!DN.mat)return 'pas de dunes';const N=+a||64,U=DN.mat.uniforms,Vs=DN.mat.vertexShader,i0=Vs.indexOf('void main(){float S=aN.z;');if(i0<0)return 'prefixe introuvable'; /* (banc, L'IMMENSITÉ) la PARITÉ JS/GLSL : N points du désert lointain, la hauteur lue par la puce (dnHt du vertex shader, rendue dans une cible flottante) contre dnHauteur ; rend l'écart max / moyen (m) et le nombre de points où le géant n'est pas nul */
    const pts=[],Z=DN.Z,H9={};let ng=0;for(let i=0;i<N;i++){const r1=Math.sin(i*12.9898+1.3)*43758.5453,r2=Math.sin(i*78.233+2.1)*24634.6345,u=r1-Math.floor(r1),v=r2-Math.floor(r2),x=Z.x0+u*(Z.nx-1)*Z.ts,z=Z.z0+v*(Z.nz-1)*Z.ts;pts.push(x,z);if(dnGeant(x,z,cyBil(Z.d,Z.nx,Z.nz,4,1,(x-(Z.x0-Z.ts*.5))/Z.ts,(z-(Z.z0-Z.ts*.5))/Z.ts),0)>5)ng++;}
    const g=new THREE.BufferGeometry(),pos=new Float32Array(N*3),px=new Float32Array(N*2);for(let i=0;i<N;i++){pos[i*3]=((i+.5)/N)*2-1;pos[i*3+1]=0;pos[i*3+2]=0;px[i*2]=pts[i*2];px[i*2+1]=pts[i*2+1];}
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('pXZ',new THREE.BufferAttribute(px,2));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e9);
    const mt=new THREE.ShaderMaterial({uniforms:U,vertexShader:Vs.slice(0,i0)+'attribute vec2 pXZ;varying float vHt;void main(){vHt=dnHt(pXZ).x;gl_PointSize=1.;gl_Position=vec4(position.x,0.,0.,1.);}',fragmentShader:'varying float vHt;void main(){gl_FragColor=vec4(vHt,0.,0.,1.);}',depthTest:false,depthWrite:false});
    const rt=new THREE.WebGLRenderTarget(N,1,{type:THREE.FloatType,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false}),sc=new THREE.Scene(),cm=new THREE.Camera(),pt=new THREE.Points(g,mt);pt.frustumCulled=false;sc.add(pt);
    const rto=renderer.getRenderTarget(),ac=renderer.autoClear;renderer.autoClear=true;renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.render(sc,cm);const out=new Float32Array(N*4);renderer.readRenderTargetPixels(rt,0,0,N,1,out);renderer.setRenderTarget(rto);renderer.autoClear=ac;
    let mx=0,sm9=0,mxA=null;for(let i=0;i<N;i++){const hj=dnHauteur(pts[i*2],pts[i*2+1],H9),e=Math.abs(out[i*4]-hj);sm9+=e;if(e>mx){mx=e;mxA=[Math.round(pts[i*2]),Math.round(pts[i*2+1]),+hj.toFixed(2),+out[i*4].toFixed(2)];}}
    rt.dispose();g.dispose();mt.dispose();return {n:N,geants:ng,ecartMax:+mx.toFixed(3),ecartMoy:+(sm9/N).toFixed(3),pire:mxA};}
  if(k==='vue'||k==='vueA'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9);const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(d!=null?d:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  return {on:DN.on,ms:DN.ms,noeuds:DN.n,sep:DN.sep,rmin:DN.rmin,F:DN.F?[DN.F.nx,DN.F.nz,DN.F.ts]:null,Z:DN.Z?[DN.Z.nx,DN.Z.nz,DN.Z.ts]:null,O:DN.O?[DN.O.nx,DN.O.nz,DN.O.ts]:null,
    ciel:CIEL2.mode,attente:!!DN.attente,sQ:DN.sQ,L:Math.round(L),obelisques:DN.ob.length,pyramide:!!DN.pyr,acacias:DN.nArb|0,palmiers:DN.nPal|0,emb:DN.emb||null,caravanes:DN.car.length,oasis:DN.oa?{r:Math.round(DN.oa.r),y:Math.round(DN.oa.y)}:null,
    sol:[DN.sunAz,DN.sunEl,DN.fin&&DN.fin.x,DN.fin&&DN.fin.z,DN.pyrs&&DN.pyrs[2]&&[DN.pyrs[2].x,DN.pyrs[2].y,DN.pyrs[2].z,DN.pyrs[2].hw,DN.pyrs[2].h]],hz:DN.hz||null,deco:DN.deco?Object.assign({},DN.deco,{pose:DN.decoN,pyramides:DN.pyrs.map(function(p){return p.st+':'+Math.round(p.hw*2)+'m';}),monuments:DN.mo.map(function(m){return m.k;})}):null,levres:(DN.lev||[]).length,scenes:DN.scn||null,heurt:DN.heurt||'',sauts:DN.sauts|0,levre:DN.dbgLev||null,vent:DN.vent.map(v=>+v.toFixed(2)),lam:Math.round(DN.lam),soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+DN.ombre.toFixed(2),dunes:+(LVL.dunes||0).toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    tri:DN.tri|0,lmin:DN.lmin|0,carHaut:DN.on?+(carGroup.position.y-dnHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
