/* ---------------- LES DÉCORS ET LEURS LUMIÈRES (des formes low-poly, la DA des autres maps) ----------------
   · LA MINE : un CADRE de bois tous les 32 m (deux poteaux, la poutre à 28 m, les corbeaux), une torche sur un poteau sur deux, en quinconce ;
   · LES TORCHES (toutes les salles, une tous les ~42 m, en quinconce) : sur la paroi la plus proche (≤ 96 m du bord de la route), sinon
     plantées au sol au bord de la route — le chemin que quelqu'un a déjà exploré ; la salle de lave n'en a qu'une sur deux ;
   · LES GEMMES : des grappes de DIAMANTS (bleu) et d'OR dans les parois, près de la route — elles luisent : c'est CASH CAR ;
   · LA GROTTE LUXURIANTE : des LIANES aux BAIES qui luisent pendues à la voûte (chacune une lumière orange), des AZALÉES fleuries sur la mousse ;
   · LE BOYAU : des grappes de CRISTAUX violets, roses et azur (grottes-embellies.js) qui sortent de ses parois — (2026-10-25) la géode est partie ;
   · LES STALACTITES : des CONCRÉTIONS en cônes à six pans, pendues ou dressées ;
   · LE LAC DE LAVE : des CHUTES DE LAVE de la voûte au lac (trois lumières chacune) ;
   · LES ABYSSES : des CAPTEURS de sculk (leurs vrilles battent en cyan), les PILIERS d'ardoise d'une cité oubliée et leur feu d'âme bleu.
   Rien ne touche la route : chaque décor passe `grtLibre` (36 m d'air au-dessus d'elle, 14 m sous la dalle — le « dessus » étant celui de la DALLE, qui roule sur les parois). */
function grtDecors(V,R,fr,MOB){const D=new Map(),T9=[],P9=[],B=V.B,b=R.bornes,RHd=ROAD_HALF,UP=[0,1,0],BAS=[0,-1,0],VZ=GRT_VASTE; // VZ : LA GROTTE VASTE (19/10) — les décors à l'échelle des salles
  GROTTE.col={G:new Map(),n:0};const nb={};
  const lum=function(x,y,z,r,c,I){P9.push({x:x,y:y,z:z,r:r,r2:r*r,c:c,I:I});};
  const torche=function(x,y,z,k){k=k||1;grtPrisme(D,V,x,y-4.2*k,z,UP,5,.42*k,.36*k,4.4*k,GT.BOIS,fr()*6);grtOcta(D,V,x,y+.9*k,z,.85*k,1.5*k,GT.FLAMME,fr()*6);T9.push({x:x,y:y+k,z:z});nb.torches=(nb.torches|0)+1;}; // (k : la taille — les torches des grandes salles se voient de loin)
  const cel=function(x,y,z){return [Math.floor((x-V.ox)/B),Math.floor((y-V.oy)/B),Math.floor((z-V.oz)/B)];};
  // le plafond et le plancher d'une colonne : là où la DENSITÉ change de signe (la surface qu'on voit)
  const plafond=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy<y+mx;yy+=2)if(grtDensIci(V,x,yy,z)<=0)return yy-1;return null;};
  const plancher=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy>y-mx;yy-=2)if(grtDensIci(V,x,yy,z)<=0){const v=grtIci(V,x,yy-1,z);return v===0?yy+1:null;}return null;}; // (sur la roche seulement : jamais sur la lave ou l'eau)
  const pris=function(s0,s1){if(s0==null||s1==null)return -1;let a=R.i0,z=R.n-21;while(a<z&&R.S[a]<s0)a++;let e=a;while(e<z&&R.S[e+1]<=s1)e++;if(e<=a)return -1;return a+((fr()*(e-a+1))|0);}; // un échantillon au hasard DANS la salle
  const cote=function(q,lat){const sd=fr()<.5?-1:1;cote.y=R.Y[q]+R.BY[q]*sd*lat;return [R.X[q]+R.BX[q]*sd*lat,R.Z[q]+R.BZ[q]*sd*lat];}; /* (SUR LES PAROIS) le CÔTÉ de la dalle (qui roule) : x, z, et cote.y la hauteur du point — le décor part de là */
  // la paroi la plus proche, à hauteur y, dans la direction latérale sd : [x, z, nx, nz] juste devant elle, ou null
  const paroi=function(q,sd,y,d0,d1){const bx=R.BX[q]*sd,by=R.BY[q]*sd,bz=R.BZ[q]*sd,h=y-R.Y[q],y0=R.Y[q]+R.NNY[q]*h,x0=R.X[q]+R.NNX[q]*h,z0=R.Z[q]+R.NNZ[q]*h; /* (SUR LES PAROIS) on marche le long du CÔTÉ de la dalle, à h au-dessus d'elle : [x, z, nx, nz, distance, y] juste devant la roche */
    for(let dd=d0;dd<d1;dd+=2){if(grtDensIci(V,x0+bx*dd,y0+by*dd,z0+bz*dd)<=0){const d2=dd-2.2;return [x0+bx*d2,z0+bz*d2,-bx,-bz,d2,y0+by*d2];}}return null;};
  // ---- 0 · LA MINE ----
  const ap=R.apres||{}; // (LES PROFONDEURS AU HASARD) la fin de chaque salle : le début de la suivante, quelle qu'elle soit
  if(b.mine!=null&&ap.mine!=null){let n=0,der=-1;
    for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q];if(s9<b.mine+20||s9>ap.mine-60)continue;const t=Math.floor(s9/32);if(t===der)continue;der=t;
      const x=R.X[q],y=R.Y[q],z=R.Z[q],tx=R.TX[q],tz=R.TZ[q],yaw=Math.atan2(tx,tz),la=RHd+7,y0=y-THICK-7,y1=y+27.5;
      for(const sd of [-1,1]){grtBoite(D,V,x+tz*sd*la,(y0+y1)/2,z-tx*sd*la,.9,(y1-y0)/2,.9,GT.BOIS,yaw,'roche');
        grtBoite(D,V,x+tz*sd*(la-3.2),y1-2.4,z-tx*sd*(la-3.2),2.4,.7,.7,GT.BOIS,yaw,'roche');
        if(n%2===(sd>0?0:1))torche(x+tz*sd*(la-1.4),y+9,z-tx*sd*(la-1.4));}
      grtBoite(D,V,x,y1+.6,z,la+1,1.1,1.1,GT.BOIS,yaw,'roche');n++;}nb.cadres=n;}
  // ---- LES TORCHES (hors de la mine) ----
  {let sd=1,der=-1e9;for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q],sal=R.SAL[q];if(sal===0||s9-der<(sal===4?84:42))continue;der=s9;sd=-sd;
    const y=R.Y[q]+7,tk=GRV.torK,w=paroi(q,sd,y,RHd+4,VZ?Math.min(R.RH[q]*1.45,600):96);let ok=false;
    if(w&&w[4]>=RHd+3&&grtDensIci(V,w[0],w[5]+5,w[1])>0){torche(w[0],w[5],w[1],tk);ok=true;}
    if(!ok){const bx=R.TZ[q]*sd,bz=-R.TX[q]*sd,tx=R.X[q]+bx*(RHd+9),tz=R.Z[q]+bz*(RHd+9),yf=plancher(tx,R.Y[q]-THICK-3,tz,70);if(yf!=null&&grtLibre(R,tx,tz,yf,yf+5*tk,1))torche(tx,yf+4.6*tk,tz,tk);}}}
  // ---- LES GEMMES : diamants et or dans les parois, près de la route (une grappe tous les ~110 m) ----
  {let n=0;for(let q=R.i0;q<R.n-20;q+=Math.max(1,Math.round(110/6))){const sal=R.SAL[q];if(sal===0)continue;const sd=fr()<.5?-1:1,y=R.Y[q]+4+fr()*18,w=paroi(q,sd,y,RHd+6,VZ?Math.min(R.RH[q]*1.45,600):160);if(!w)continue;
    const t=(sal>=4||fr()<.55)?GT.DIAMANT:GT.OR,k9=3+((fr()*3)|0),g9=VZ?2:1;
    for(let k=0;k<k9;k++){const a=fr()*6.28,r9=fr()*3.2*g9;grtOcta(D,V,w[0]-w[2]*1.2*g9+Math.cos(a)*r9,w[5]+(fr()-.5)*5*g9,w[1]-w[3]*1.2*g9+Math.sin(a)*r9,(1+fr()*1.3)*g9,(1.5+fr()*2.2)*g9,t,fr()*6);}
    lum(w[0],w[5],w[1],22*(VZ?1.9:1),t===GT.DIAMANT?[.25,.85,1]:[1,.78,.25],.55);n++;}nb.gemmes=n;}
  // ---- 1 · LA GROTTE LUXURIANTE : les lianes à baies, les azalées ----
  {let n=0,na=0;const N=Math.round((VZ?190:110)*MOB),NA=Math.round((VZ?80:46)*MOB),g9=VZ?1.7:1;
    for(let e=0;e<N*8&&n<N;e++){const q=pris(b.luxe,ap.luxe);if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.72:104)),yc=plafond(xz[0],cote.y+6,xz[1],VZ?R.UP[q]*1.5:120);if(yc==null)continue;
      const Lv=(10+fr()*32)*(VZ?2.4:1),yb=yc-Lv;if(!grtLibre(R,xz[0],xz[1],yb,yc,2*g9))continue;
      grtPrisme(D,V,xz[0],yc+2,xz[1],BAS,4,.4*g9,.25*g9,Lv+2,GT.FEUILLE,fr()*6);
      for(let u=2.5*g9;u<Lv-g9;u+=(2.8+fr()*1.6)*g9)grtOcta(D,V,xz[0]+(fr()<.5?-.6:.6)*g9,yc-u,xz[1]+(fr()-.5)*.7*g9,.62*g9,.75*g9,GT.BAIE,fr()*6);
      lum(xz[0],yc-Lv*.65,xz[1],VZ?50:30,[1,.5,.12],.8);n++;}
    for(let e=0;e<NA*8&&na<NA;e++){const q=pris(b.luxe,ap.luxe);if(q<0)break;const xz=cote(q,RHd+10+fr()*(VZ?R.RH[q]*.7:90)),yf=plancher(xz[0],cote.y-THICK-4,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      const w=(2.6+fr()*2.4)*g9,h=(2.2+fr()*1.8)*g9;if(!grtLibre(R,xz[0],xz[1],yf,yf+2*h,w))continue;
      grtOcta(D,V,xz[0],yf+h,xz[1],w,h*1.05,GT.FEUILLE,fr()*6);grtOcta(D,V,xz[0]+(fr()-.5)*w,yf+h*1.25,xz[1]+(fr()-.5)*w,w*.7,h*.8,GT.FEUILLE,fr()*6);
      for(let k=0;k<4;k++)grtOcta(D,V,xz[0]+(fr()-.5)*w*1.5,yf+h*(1.4+fr()*.5),xz[1]+(fr()-.5)*w*1.5,.55*g9,.55*g9,GT.FLEUR,fr()*6);na++;}
    nb.lianes=n;nb.azalees=na;}
  // ---- 2 · LE BOYAU : ses cristaux sont ceux des grottes embellies (grtCristauxG) — plus de géode ----
  // ---- 3 · LES STALACTITES : les concrétions, des cônes à six pans ----
  {let n=0;const N=Math.round((VZ?240:140)*MOB),g9=VZ?1.25:1;
    for(let e=0;e<N*8&&n<N;e++){const q=pris(b.stal,ap.stal);if(q<0)break;const xz=cote(q,RHd+8+fr()*(VZ?R.RH[q]*.8:118)),pend=fr()<.55,k=.75+fr()*.5;
      if(pend){const yc=plafond(xz[0],cote.y+8,xz[1],VZ?R.UP[q]*1.5:150);if(yc==null)continue;const Ld=(8+fr()*38)*(VZ?2.6:1);if(!grtLibre(R,xz[0],xz[1],yc-Ld,yc,5))continue;
        grtPrisme(D,V,xz[0],yc+3,xz[1],BAS,6,3.4*k*(.8+Ld/60)*g9,0,Ld+3,GT.CONCRETION,fr()*6,'roche');}
      else{const yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:140);if(yf==null)continue;const Hs=(6+fr()*30)*(VZ?2.4:1);if(!grtLibre(R,xz[0],xz[1],yf,yf+Hs,5))continue;
        grtPrisme(D,V,xz[0],yf-2,xz[1],UP,6,3.2*k*(.8+Hs/50)*g9,0,Hs+2,GT.CONCRETION,fr()*6,'roche');}
      n++;}nb.concretions=n;}
  // ---- 4 · LE LAC DE LAVE : les chutes de lave ----
  {let n=0;const lac=GROTTE.lac;if(lac){const N=Math.round((VZ?14:9)*MOB),cw=VZ?6:3.4;
    for(let e=0;e<N*10&&n<N;e++){const q=pris(b.lave,ap.lave);if(q<0)break;const sd=fr()<.5?-1:1,y=R.Y[q]+28,w=paroi(q,sd,y,RHd+30,VZ?Math.min(R.RH[q]*1.45,640):300);if(!w)continue;
      const x=w[0]+w[2]*(VZ?6:3),z=w[1]+w[3]*(VZ?6:3),yc=plafond(x,w[5],z,VZ?R.UP[q]*1.6:140);if(yc==null)continue; // (5 m devant la paroi, côté route)
      if(!grtLibre(R,x,z,lac.y-4,yc,5))continue;const h=(yc+2-lac.y)/2;grtBoite(D,V,x,lac.y+h,z,cw,h,cw,GT.LAVE,Math.atan2(w[2],w[3]),'lave');
      for(const u of VZ?[.12,.37,.62,.88]:[.2,.55,.88])lum(x,lac.y+2*h*u,z,VZ?120:78,[1,.36,.07],1.35);n++;}}nb.chutes=n;}
  // ---- 5 · LES ABYSSES : capteurs de sculk, piliers de la cité oubliée, feux d'âme ----
  {let n=0,np=0;const N=Math.round((VZ?90:48)*MOB),NP9=Math.round((VZ?28:16)*MOB),g9=VZ?1.8:1;
    for(let e=0;e<N*8&&n<N;e++){const q=pris(b.abysse,1e9);if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.7:76)),yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:90);if(yf==null)continue;
      if(!grtLibre(R,xz[0],xz[1],yf,yf+5*g9,3*g9))continue;grtPrisme(D,V,xz[0],yf-1,xz[1],UP,6,2.6*g9,1.9*g9,2.4*g9,GT.SCULK,fr()*6);
      for(const o of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])grtPrisme(D,V,xz[0]+o[0]*g9,yf+1.2*g9,xz[1]+o[1]*g9,UP,4,.32*g9,.12*g9,(2.6+fr()*1.2)*g9,GT.CAPTEUR,fr()*6);
      lum(xz[0],yf+4*g9,xz[1],VZ?44:24,[.12,.85,.95],.85);n++;}
    for(let e=0;e<NP9*10&&np<NP9;e++){const q=pris(b.abysse,1e9);if(q<0)break;const xz=cote(q,RHd+22+fr()*(VZ?R.RH[q]*.7:70)),yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      const yc=plafond(xz[0],yf+2,xz[1],VZ?450:200);let H=(26+fr()*46)*(VZ?2.6:1);if(yc!=null)H=Math.min(H,yc-yf-8);if(H<14)continue;if(!grtLibre(R,xz[0],xz[1],yf,yf+H+5,6*g9))continue;
      const rot=fr()*1.5;grtBoite(D,V,xz[0],yf+H/2,xz[1],3.8*g9,H/2,3.8*g9,GT.BRIQUE,rot,'roche');grtBoite(D,V,xz[0],yf+H+1.1*g9,xz[1],4.8*g9,1.1*g9,4.8*g9,GT.BRIQUE,rot,'roche');
      grtOcta(D,V,xz[0],yf+H+3.6*g9,xz[1],1.5*g9,2.2*g9,GT.AME,fr()*6);lum(xz[0],yf+H+4*g9,xz[1],VZ?60:34,[.25,.75,1],1.1);np++;}
    nb.capteurs=n;nb.piliersCite=np;}
  return {D:D,T:T9,P:P9,n:nb};}
/* ---------------- LE RENDU : UNE matière à FACETTES (la DA des autres maps) ----------------
   La normale de la FACETTE vient des dérivées (aucune normale à stocker : le low-poly des pics du glacier et du cône du volcan), tournée vers
   la caméra ; la paroi et le sol de chaque SALLE (`GRT_MUR`/`GRT_SOL` : couleurs pleines et saturées, des strates douces, une variation par paquet
   de facettes — aucune texture) ; les matières vives : la LAVE à plaques de croûte, l'eau, l'améthyste, les cristaux, les baies, le sculk dont les
   veines battent, les capteurs, les feux, les gemmes. La lumière : le plancher, les TORCHES et le LIEU (cuits aux sommets, dosés par la météo),
   une lumière douce d'en haut qui dessine les facettes, l'occlusion, la LANTERNE de la caisse. Les éclats PERCENT le brouillard. */
const GRT_MUR=[[.46,.32,.22],[.22,.36,.33],[.32,.25,.46],[.60,.38,.22],[.17,.15,.24],[.10,.15,.24]]; // mine, luxuriante, puits, stalactites, lave, abysses
const GRT_SOL=[[.42,.28,.15],[.24,.56,.16],[.26,.22,.40],[.68,.48,.28],[.24,.11,.09],[.04,.17,.21]];
const GRT_U={uTime:{value:0},uTorch:{value:1},uLieu:{value:1},uAmb:{value:new THREE.Color(.05,.05,.06)},uEmi:{value:1},uLav:{value:1},uFlam:{value:1},uLant:{value:1},uVein:{value:1},uGlint:{value:1},
  uTorchC:{value:new THREE.Color(1.5,.86,.42)},uLantC:{value:new THREE.Color(1.05,.95,.82)},uLantP:{value:new THREE.Vector3(0,-1e5,0)},
  uMur:{value:GRT_MUR.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})},uSol:{value:GRT_SOL.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})}};
const GRT_VS=['attribute vec4 aF;attribute vec4 aL;uniform vec3 uMur[6],uSol[6];varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vF=aF;vL=aL;int s=int(aF.y+.5);vMur=uMur[s];vSol=uSol[s];vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const GRT_FS=['uniform float uTime,uTorch,uLieu,uEmi,uLav,uFlam,uLant,uVein,uGlint;uniform vec3 uAmb,uTorchC,uLantC,uLantP;','varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_fragment>',FG_BRUIT,
  'void main(){',
  '  vec3 n=normalize(cross(dFdx(vW),dFdy(vW)));if(dot(n,cameraPosition-vW)<0.)n=-n;', // la FACETTE
  '  float mt=floor(vF.x+.5),sal=floor(vF.y+.5),fc=fh3(floor(vW*'+(GRT_VASTE?'.13':'.19')+')+sal*7.);vec3 alb;vec3 em=vec3(0.);',
  '  if(mt<.5){float up=smoothstep(.45,.85,n.y),st=fh2(vec2(floor(vW.y*.14),sal*3.1));alb=mix(vMur,vSol,up)*(.84+.24*st)*(.88+.2*fc);', // la ROCHE : la paroi, le sol, les strates
  '    if(sal>4.5)em=vec3(.10,.85,.95)*step(.8,fc)*up*.7*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.2-length(vW.xz)*.02+fc*6.),3.));', // le SCULK : des plaques du sol des abysses qui battent en cyan
  '    else if(sal>.5&&sal<1.5)em=vec3(.35,.95,.25)*step(.84,fc)*up*.22*uEmi;', // la mousse qui luit par plaques
  /* LES FILONS (embellir, 2026-10-24) : des lignes de minerai qui courent sur les parois et les voûtes (jamais le sol) — l'isoligne d'une onde plane tordue (aucun bruit, ~30 opérations),
     par zones de ~30 m, qui s'élargit avec la distance (fwidth : pas de scintillement de pixel) et s'efface avant 420 m ; ils scintillent par bandes qui montent le long de la paroi.
     La couleur du filon suit la salle (or, or, rose, miel, braise, rose) — écrite ici, en constantes : aucun varying de plus (les vieux GPU en ont 8) */
  '    if(uVein>.001){vec3 q=vW*.05,vv=sal<1.5?vec3(1.,.73,.29):sal<2.5?vec3(1.,.40,.78):sal<3.5?vec3(1.,.70,.32):sal<4.5?vec3(1.,.50,.10):vec3(1.,.30,.78);',
  '      float w1=sin(q.x*.7+q.y*1.9-q.z*.5+sin(q.z*1.2+q.y*.8)*.8+sal*2.3),zn=step(.7,fh3(floor(vW*.032)+sal*3.));',
  '      float fv=zn*(1.-up)*(1.-smoothstep(0.,.13+fwidth(w1)*1.6,abs(w1)))*(1.-smoothstep(160.,420.,length(cameraPosition-vW)));',
  '      float gl=pow(max(0.,sin(uTime*1.9+vW.y*.21+fc*30.)),14.);alb=mix(alb,vv*.4,fv*.7);em+=vv*fv*(.3+.45*gl*uGlint)*uVein;}}',
  '  else if(mt<1.5){vec2 p=vW.xz*.035;float f=fn2(p+vec2(uTime*.07,uTime*.045))*.65+fn2(p*2.3-uTime*.11)*.35;',
  '    vec3 c=mix(vec3(.95,.22,.02),vec3(1.,.72,.18),smoothstep(.45,.82,f));c=mix(vec3(.30,.04,.02),c,smoothstep(.28,.42,f));alb=c*.15;em=c*2.2*uLav;}', // la LAVE : des plaques de croûte entre la lave vive
  '  else if(mt<2.5){float f=fn2(vW.xz*.05+vec2(uTime*.05,uTime*.03));alb=mix(vec3(.02,.12,.22),vec3(.06,.30,.42),f);em=vec3(.03,.16,.22)*(.6+.4*f);}', // l'EAU
  '  else if(mt<3.5){alb=mix(vec3(.40,.16,.72),vec3(.72,.42,1.),fc*.7);em=vec3(.55,.22,.95)*(.35+.25*fc)*uEmi*(.8+.2*sin(uTime*1.3+fc*9.));}', // l'AMÉTHYSTE de la géode
  '  else if(mt<4.5)alb=vec3(.42,.25,.12)*(.85+.25*fc);', // le BOIS
  '  else if(mt<5.5){alb=vec3(0.);em=mix(vec3(1.,.5,.12),vec3(1.,.9,.5),fc)*2.6*uFlam*(.82+.18*sin(uTime*13.+vW.x*2.3+vW.z*1.7));}', // la FLAMME des torches
  '  else if(mt<6.5){alb=vec3(.45,.2,.8);em=mix(vec3(.62,.28,1.),vec3(1.,.72,1.),fc)*1.5*uEmi*(.85+.15*sin(uTime*2.+fc*5.));}', // les CRISTAUX
  '  else if(mt<7.5){alb=vec3(.5,.2,.05);em=vec3(1.,.48,.08)*2.*uEmi;}', // les BAIES
  '  else if(mt<8.5)alb=mix(vec3(.10,.34,.08),vec3(.22,.52,.14),fc);', // les FEUILLES
  '  else if(mt<9.5){alb=vec3(1.,.42,.72);em=vec3(1.,.42,.72)*.18;}', // les FLEURS d'azalée
  '  else if(mt<10.5)alb=mix(vec3(.52,.32,.18),vec3(.66,.44,.26),fc)*(.85+.2*fh2(vec2(floor(vW.y*.5),3.)));', // la CONCRÉTION
  '  else if(mt<11.5)alb=vec3(.10,.10,.14)*(.85+.3*fc);', // le BASALTE
  '  else if(mt<12.5){alb=vec3(.02,.09,.12);em=vec3(.10,.8,.92)*step(.7,fc)*.6*uEmi;}', // le SCULK (le pied des capteurs)
  '  else if(mt<13.5){alb=vec3(.05,.6,.7);em=vec3(.06,.80,.95)*1.8*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.5+fc*6.),3.));}', // les CAPTEURS
  '  else if(mt<14.5)alb=vec3(.13,.14,.19)*(.85+.25*fc);', // les BRIQUES de la cité
  '  else if(mt<15.5){alb=vec3(0.);em=mix(vec3(.2,.75,1.),vec3(.7,1.,1.),fc)*2.4*(.82+.18*sin(uTime*11.+vW.x));}', // le FEU D'ÂME
  '  else if(mt<16.5){alb=vec3(.3,.9,1.);em=vec3(.25,.9,1.)*1.3*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // le DIAMANT
  '  else if(mt<17.5){alb=vec3(1.,.75,.15);em=vec3(1.,.72,.15)*.9*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // l'OR
  '  else if(mt<18.5){alb=vec3(.16,.05,.04);em=vec3(1.,.38,.06)*(.25+.75*step(.55,fc))*1.1*uLav*(.75+.25*sin(uTime*2.+fc*8.));}', // le MAGMA du rivage : des facettes qui rougeoient
  /* LES CRISTAUX À TEINTES (embellir) : rose #F24AA0, violet, azur, or miel — la lumière-vedette des parois ; une lueur par facette (le prisme se lit), un pouls lent, de rares éclats qui courent */
  '  else{vec3 hc=mt<19.5?vec3(1.,.26,.58):mt<20.5?vec3(.60,.30,1.):mt<21.5?vec3(.22,.60,1.):vec3(1.,.72,.26);',
  '    float fk=.55+.6*abs(dot(n,vec3(.42,.71,.57))),gl=pow(max(0.,sin(uTime*2.3+fc*50.+vW.y*.4)),16.);alb=hc*.3;',
  '    em=hc*fk*(1.1+.4*fc)*(.55+.45*uEmi)*(.88+.12*sin(uTime*1.6+fc*9.))+vec3(1.,.92,.96)*gl*.5*uGlint;}',
  '  float ao=vF.z/255.,key=.6+.4*max(0.,dot(n,vec3(.3,.86,.41)));',
  '  vec3 dl=uLantP-vW;float d2=dot(dl,dl),lam=max(0.,dot(n,dl))*inversesqrt(d2+1.);vec3 Lc=uLantC*uLant*(.25+.75*lam)/(1.+d2/1600.);',
  /* L'HUMIDITÉ (embellir) : des plaques de roche mouillée qui brillent quand les phares passent (le reflet de la lanterne sur les facettes) — le détail vivant, sans calcul côté processeur ; le vieux téléphone ne la paie pas (uVein = 0) */
  '  if(mt<.5&&uVein>.001&&uLant>.01){vec3 Hh=normalize(normalize(cameraPosition-vW)+normalize(dl));float wm=step(.5,fh3(floor(vW*.045)+sal*5.))*(1.-.6*smoothstep(.45,.85,n.y));',
  '    em+=uLantC*pow(max(dot(n,Hh),0.),30.)*wm*uLant*.7/(1.+d2/2200.);}',
  '  vec3 col=alb*(((uAmb+uTorchC*(vL.x*uTorch)+vL.yzw*(2.*uLieu))*key+Lc)*ao);',
  '  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.55);','  #else','  col+=em;','  #endif',
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* LES POUSSIÈRES (700 points ronds et doux autour de la caméra, comme les braises du volcan) : la poussière de la mine, les spores, les paillettes
   de la géode, les gouttes, les braises, les âmes — chaque salle les siennes, fondues en ~1 s. */
const GRT_PU={uK:{value:0},uSz:{value:.4},uSw:{value:1},uBoxC:{value:new THREE.Vector3()},uVel:{value:new THREE.Vector3()},uPC:{value:new THREE.Color(1,1,1)},uPx:{value:1}};
const GRT_PART_VS=['attribute vec4 aR;uniform float uTime,uPx,uK,uSz,uSw;uniform vec3 uBoxC,uVel,uPC;varying vec3 vC;varying float vA;',
  'void main(){vec3 p=aR.xyz*180.+uVel*uTime*(.55+.9*aR.w)+vec3(sin(uTime*.7+aR.w*20.),.5*sin(uTime*.5+aR.w*13.),cos(uTime*.6+aR.w*7.))*uSw;',
  ' p=mod(p-uBoxC+90.,180.)-90.+uBoxC;vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float dd=-mv.z;',
  ' gl_PointSize=clamp(uSz*uPx*(420./max(dd,2.))*(.55+.9*aR.w),1.,9.*uPx);vA=uK*smoothstep(150.,45.,dd)*smoothstep(5.,16.,dd)*(.55+.45*sin(uTime*2.3+aR.w*31.));vC=uPC;}'].join('\n');
const GRT_PART_FS='varying vec3 vC;varying float vA;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));if(a*vA<.004)discard;gl_FragColor=vec4(vC*vA*a,1.);}';
const GRT_PART=[{c:[.95,.70,.42],v:[0,-.6,0],w:1.2,z:.32,k:.5},{c:[.55,1,.32],v:[0,.9,0],w:3,z:.42,k:.75},{c:[1,.55,1],v:[0,.3,0],w:2,z:.36,k:.85},
  {c:[.55,.78,1],v:[0,-16,0],w:.3,z:.28,k:.7},{c:[1,.42,.08],v:[0,7,0],w:2.4,z:.4,k:.95},{c:[.25,1,1],v:[0,2.6,0],w:4,z:.4,k:.8}]; // mine, luxe, boyau, stalactites, lave, abysses (z : la taille en mètres)
try{Object.assign(PAL.B,{grottePart:[380,560,700]});}catch(e){}
const GRT_MATS={roche:null,part:null},GRT_FX={part:null,p:null};
function grtMats(){if(GRT_MATS.roche)return GRT_MATS;
  const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),GRT_U),vertexShader:GRT_VS,fragmentShader:GRT_FS,fog:true,side:THREE.DoubleSide,extensions:{derivatives:true}});
  m.dispose=function(){};GRT_MATS.roche=m; // jamais libérée : un seul jeu pour toutes les grottes
  const p=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:GRT_U.uTime},GRT_PU),vertexShader:GRT_PART_VS,fragmentShader:GRT_PART_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  p.dispose=function(){};GRT_MATS.part=p;return GRT_MATS;}
function grtPartObj(){if(GRT_FX.part)return GRT_FX.part;const M=grtMats(),n=Math.round(PAL_B9('grottePart',700)*(TEL_NATIF?.75:1)),R9=mulberry32(0x6A7C1E),a=new Float32Array(n*4);for(let i=0;i<n*4;i++)a[i]=R9();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(a,4));
  const p=new THREE.Points(g,M.part);p.frustumCulled=false;p.visible=false;p.matrixAutoUpdate=false;p.renderOrder=8;scene.add(p);GRT_FX.part=p;GRT_FX.p=JSON.parse(JSON.stringify(GRT_PART[0]));return p;}
/* ---------------- LA CONSTRUCTION ----------------
   1 · les échantillons de route, la boîte, la grille ; 2 · CREUSER (en tranches au pré-bâti) ; 3 · le puits, les lacs, les piliers ; 4 · les
   décors et leurs lumières ; 5 · les MAILLES, tronçon par tronçon, du départ vers l'arrivée — au pré-bâti, toutes ; en direct (le premier
   portail, un rejouer), les 1 100 premiers mètres tout de suite et le reste quelques millisecondes par image (grotteTick). */
/* (2026-10-22, DEBUGGING : un TROU NOIR dans la paroi du puits — graine 3333, 24 × 48 m, à ~260 m de la route) LES TRONÇONS QUI FERMENT LA ROCHE.
   La facette d'une arête qui traverse la paroi est posée par le tronçon du côté BAS de l'arête (x, y ou z) ; si ce tronçon n'a jamais été
   alloué (aucun creusement n'y est passé), l'air d'à côté reste ouvert : on voit le vide à travers une roche qui tue (grtD : -127). Le puits
   coupe son entonnoir au cylindre Rmax, que le bruit et le haut de l'entonnoir dépassent parfois. Chaque tronçon qui a de l'air sur une face basse
   reçoit son voisin manquant (de la roche pleine, maillé dans le même ordre) : la densité, donc la collision, ne change pas. */
function grtBouche(V){const n0=V.pool.length;let n=0;
  for(let c=0;c<n0;c++){const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,DN=V.dn[c];
    for(let ax=0;ax<3;ax++){const a=ci-(ax===0?1:0),b=cj-(ax===1?1:0),e=ck-(ax===2?1:0);if(a<0||b<0||e<0||V.dir[a+V.CX*(b+V.CY*e)]>=0)continue;
      let air=false;for(let u=0;u<16&&!air;u++)for(let w=0;w<16;w++)if(DN[ax===0?(u<<4)|(w<<8):ax===1?u|(w<<8):u|(w<<4)]>0){air=true;break;}
      if(air){const c2=grtCh(V,a,b,e);V.chS[c2]=Math.min(V.chS[c2],V.chS[c]);n++;}}}
  return n;}
function grotteVide(){
  if(GROTTE.root){GROTTE.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});GROTTE.root=null;}
  GROTTE.V=null;GROTTE.R=null;GROTTE.grp=[];GROTTE.file=null;GROTTE.fi=0;GROTTE.msFile=0;GROTTE.pret=false;GROTTE.col=null;GROTTE.salle=-1;GROTTE.piliers=null;
  GROTTE.puits=null;GROTTE.lac=null;GROTTE.lavLum=null;GROTTE.eau=null;GROTTE.dec=null;GROTTE.LL=null;GROTTE.heurt='';}
function buildGrotte(seed){jadeFini(buildGrotteG(seed));} // d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildGrotteG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  grotteVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='grotte'||!(NP>1)||!GROTTE.salles)return;
  const t0=performance.now(),direct=JF.lim===Infinity,fr=mulberry32((seed^0x6A07E)>>>0),MOB=TEL_NATIF?.75:1;
  GROTTE.met=GRT_MET[LVL.cur.meteo]?LVL.cur.meteo:'matin';GROTTE.n={};
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);GROTTE.root=root;trackMeshes.push(root);
  const R=grtEchantillons();GROTTE.R=R;
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(let q=0;q<R.n;q++){const r=Math.max(R.RH[q]+Math.abs(R.LAT[q]),R.UP[q],R.DN[q],R.BAS[q])*1.4+30; /* (SUR LES PAROIS) le creux tourne avec la dalle : la même marge dans les trois sens */
    x0=Math.min(x0,R.X[q]-r);x1=Math.max(x1,R.X[q]+r);z0=Math.min(z0,R.Z[q]-r);z1=Math.max(z1,R.Z[q]+r);y0=Math.min(y0,R.Y[q]-r);y1=Math.max(y1,R.Y[q]+r);}
  const V=grtMonde(x0,y0,z0,x1,y1,z1);GROTTE.V=V;
  if(performance.now()>JF.lim)yield;
  const tm={ech:Math.round(performance.now()-t0)};let t9=performance.now();
  /* (le pas de creusement suit la largeur : un ellipsoïde tous les rh/3,2 m — entre deux, le creux des parois fait ~1,5 m, sous la facette et le bruit) */
  for(let q=0,ac=1e9,nq=0;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;grtCreuse1(V,R,q);if(R.BAS[q]>0)grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]});nq++;if(performance.now()>JF.lim)yield;} /* (2026-10-24, passe perf) un rendez-vous par creusement (tous les 8 : des tranches de 40-60 ms ×4 au pré-bâti) */
  tm.creuse=Math.round(performance.now()-t9);t9=performance.now();
  tm.puits=0;
  t9=performance.now();grtLacs(V,R);GROTTE.piliers=grtPiliers(V,R,fr);GROTTE.n.bouche=grtBouche(V);V.nzc=null;tm.lacs=Math.round(performance.now()-t9);if(performance.now()>JF.lim)yield; // (le cache du bruit ne sert plus)
  t9=performance.now();const dec=grtDecors(V,R,fr,MOB);yield* grtCristauxG(V,R,dec,seed);tm.decors=Math.round(performance.now()-t9);GROTTE.tm=tm; /* (2026-10-24, embellir) les cristaux à teintes : un flux de hasard à part, leurs lumières rejoignent dec.P */
  GROTTE.dec=dec.D;GROTTE.LL=grtLumListes(V,dec.T,dec.P);Object.assign(GROTTE.n,dec.n);GROTTE.n.lumieres=dec.P.length;GROTTE.n.piliers=GROTTE.piliers.length;
  GROTTE.n.troncons=V.pool.length;GROTTE.n.air=V.nAir;GROTTE.n.col=GROTTE.col.n;GROTTE.msCreuse=tm.creuse+tm.puits;
  if(performance.now()>JF.lim)yield;t9=performance.now();
  const ord=[];for(let c=0;c<V.pool.length;c++)ord.push(c);ord.sort(function(a,b){return V.chS[a]-V.chS[b];});GROTTE.file=ord;GROTTE.fi=0;
  /* (2026-10-20, Sacha : « beaucoup de freeze et de latence sur la version vercel ») « D'UN TRAIT » SE RELIT ICI, PAS SEULEMENT AU DÉBUT. Un pré-bâti
     pas fini quand vient le JOUER (ou le portail) est fini par prebTravaille(Infinity) : `direct`, lu au début du générateur, valait faux, et
     TOUTE la grotte restante se maillait dans la même image (MESURÉ en ligne, trace Chrome : 220 ms de grtTroncon/grtMailleNets au JOUER, sur
     l'ordi). Comme un bâti direct : les 1 100 premiers mètres tout de suite, le reste par les tranches de grotteTick (grtTranches). */
  while(GROTTE.fi<ord.length){const c=ord[GROTTE.fi];if((direct||JF.lim===Infinity)&&R.S[Math.min(R.n-1,V.chS[c])]>1100)break;yield* grtTronconG(c);GROTTE.fi++;if(performance.now()>JF.lim)yield;}
  GROTTE.pret=GROTTE.fi>=ord.length;tm.mailles=Math.round(performance.now()-t9);
  GROTTE.ms=Math.round(performance.now()-t0);
  grotteMeteo(GROTTE.met,started?bioPortDur():.01);
}
function grtTroncon(c){jadeFini(grtTronconG(c));} // d'un trait (les tranches en course) — au pré-bâti : yield* grtTronconG
function* grtTronconG(c){const V=GROTTE.V,d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,C=16*V.B,M=grtMats(),LL=GROTTE.LL&&GROTTE.LL.get(d)||null;
  const g=new THREE.Group();g.position.set(V.ox+ci*C,V.oy+cj*C,V.oz+ck*C);g.matrixAutoUpdate=false;g.updateMatrix();
  const mk=function(p){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(p.P,3));ge.setAttribute('aF',new THREE.BufferAttribute(p.F,4));ge.setAttribute('aL',new THREE.BufferAttribute(p.L,4,true));
    if(p.I)ge.setIndex(new THREE.BufferAttribute(p.I,1));ge.computeBoundingSphere();const me=new THREE.Mesh(ge,M.roche);me.matrixAutoUpdate=false;me.updateMatrix();me.userData.jeter=1;g.add(me);};
  const m=yield* grtMailleNetsG(V,c,LL);GROTTE.n.triangles=(GROTTE.n.triangles|0)+m.nt;
  const L9=GROTTE.dec&&GROTTE.dec.get(d);let pd=null;
  if(L9&&L9.length){const qs=V.chS[c],sal=qs<1e9&&GROTTE.R?GROTTE.R.SAL[Math.min(GROTTE.R.n-1,qs)]:0,p=grtMailleDecor(V,c,L9,LL,sal);if(p.nv){pd=p;GROTTE.n.decors=(GROTTE.n.decors|0)+L9.length;GROTTE.n.triangles+=p.I.length/3;}}
  /* (2026-10-24, embellir) LA ROCHE ET LES DÉCORS D'UN TRONÇON EN UN SEUL MAILLAGE (un seul appel de dessin : avant, chaque tronçon à décors en payait deux — les cristaux à teintes en ajoutent partout) : les sommets du décor (indexé) sont dépliés à la suite de ceux de la roche (non indexée), même matière, mêmes attributs */
  if(pd&&m.nt){const na=m.nv,nb=pd.I.length,P=new Float32Array((na+nb)*3),F=new Uint8Array((na+nb)*4),Lt=new Uint8Array((na+nb)*4);
    P.set(m.P.subarray(0,na*3));F.set(m.F.subarray(0,na*4));Lt.set(m.L.subarray(0,na*4));
    for(let i=0;i<nb;i++){const v=pd.I[i],o=na+i;P[o*3]=pd.P[v*3];P[o*3+1]=pd.P[v*3+1];P[o*3+2]=pd.P[v*3+2];F[o*4]=pd.F[v*4];F[o*4+1]=pd.F[v*4+1];F[o*4+2]=pd.F[v*4+2];F[o*4+3]=pd.F[v*4+3];Lt[o*4]=pd.L[v*4];Lt[o*4+1]=pd.L[v*4+1];Lt[o*4+2]=pd.L[v*4+2];Lt[o*4+3]=pd.L[v*4+3];}
    mk({P:P,F:F,L:Lt,I:null,nv:na+nb,nt:(na+nb)/3});}
  else{if(m.nt)mk(m);if(pd)mk(pd);}
  g.userData.c=new THREE.Vector3(g.position.x+C/2,g.position.y+C/2,g.position.z+C/2);GROTTE.root.add(g);GROTTE.grp.push(g);}
function grtTranches(ms){const F=GROTTE.file;if(!F||GROTTE.fi>=F.length)return;const t0=performance.now();
  while(GROTTE.fi<F.length&&performance.now()-t0<ms){grtTroncon(F[GROTTE.fi]);GROTTE.fi++;}
  GROTTE.msFile+=performance.now()-t0;if(GROTTE.fi>=F.length)GROTTE.pret=true;}
/* ---------------- LES MÉTÉOS : la grotte glisse d'un temps à l'autre au même fondu que l'ambiance ---------------- */
function grotteMeteo(m,dur){const T9=GRT_MET[m]||GRT_MET.matin;GROTTE.met=GRT_MET[m]?m:'matin';
  if(!GROTTE.cur)GROTTE.cur=JSON.parse(JSON.stringify(T9));
  GROTTE.de=JSON.parse(JSON.stringify(GROTTE.cur));GROTTE.to=T9;GROTTE.k=0;GROTTE.dur=Math.max(.01,dur||1.2);}
function grtPas(dt){if(!GROTTE.cur||GROTTE.k>=1)return;GROTTE.k=Math.min(1,GROTTE.k+dt/GROTTE.dur);const e=GROTTE.k*GROTTE.k*(3-2*GROTTE.k),a=GROTTE.de,b=GROTTE.to,o=GROTTE.cur;
  for(const k in b)o[k]=a[k]+(b[k]-a[k])*e;}
function grtBioNom(met,k){return 'grt-'+(GRT_MET[met]?met:'matin')+'-'+GRT_SALLES[k|0];}
function grtSalleIci(sc){const R=GROTTE.R;if(!R)return 0;let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=sc)lo=m;else hi=m-1;}return R.SAL[lo];}
const GRT_V=new THREE.Vector3();
function grotteTick(dt){
  const on=!!GROTTE.root&&!!LVL.cur&&LVL.cur.id==='grotte'&&!PARK.on;
  if(!on){if(GRT_FX.part&&GRT_FX.part.visible)GRT_FX.part.visible=false;if(GROTTE.root&&!GROTTE.root.parent)grotteVide();return;} // (la grotte quittée : ses mailles rendues à la carte graphique tout de suite, pas au prochain passage)
  if(GROTTE.file&&GROTTE.fi<GROTTE.file.length)grtTranches(paused?12:4); // LES TRANCHES : la grotte se finit quelques millisecondes par image
  const U=GRT_U,c=GROTTE.cur||(grotteMeteo(GROTTE.met,.01),GROTTE.cur),vit=!paused;grtPas(dt);if(vit)U.uTime.value+=dt;
  U.uTorch.value=c.torche;U.uLieu.value=c.lieu;U.uAmb.value.setRGB(c.amb*.85,c.amb*.9,c.amb*1.15);U.uEmi.value=c.emi;U.uLav.value=c.lav;U.uFlam.value=c.flam;
  U.uLant.value=c.lant*(mode==='boom'||!carGroup.visible?0:1);U.uVein.value=c.vein*PAL_B9('grotteVeine',1);U.uGlint.value=c.glint;
  GRT_V.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uLantP.value.copy(carGroup.position).addScaledVector(GRT_V,12);U.uLantP.value.y+=2;
  // LA SALLE : sous la caisse (en vol, la route survolée) ; en entrant, l'ambiance de la salle (2,4 s)
  if(GROTTE.envPret!==GROTTE.root){GROTTE.envPret=GROTTE.root;for(const m9 in GRT_MET)for(let k9=0;k9<GRT_SALLES.length;k9++)envPrepare(BIOMES[grtBioNom(m9,k9)]);} /* (2026-10-24, passe perf) les ciels des reflets de TOUTES les salles, à tous les temps (la grotte change de temps en route : 24 ciels), partent au travailleur (envPrepare) : chaque entrée de salle recalculait le cube des reflets en JS — 210 ms d'image figée sur PC, en pleine course */
  const k=grtSalleIci(mode==='fall'?lastNearS:s);
  if(k!==GROTTE.salle){const nm=grtBioNom(GROTTE.met,k);if(!BIOMES[nm]||BIO.name===nm)GROTTE.salle=k;else if(BIO.k>=1){bioGo(nm,2.4);GROTTE.salle=k;}} // (pendant le fondu du portail : on attend qu'il finisse)
  // LES TRONÇONS : cachés au-delà du brouillard
  {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position,f2=ff*ff;for(const g of GROTTE.grp){const b=g.userData.c,v=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<f2;if(g.visible!==v)g.visible=v;}}
  // LES POUSSIÈRES
  {const P=grtPartObj(),cur=GRT_FX.p,to=GRT_PART[k]||GRT_PART[0],a=Math.min(1,dt*1.2);
   for(const f of ['w','z','k'])cur[f]+=(to[f]-cur[f])*a;for(let i=0;i<3;i++){cur.c[i]+=(to.c[i]-cur.c[i])*a;cur.v[i]+=(to.v[i]-cur.v[i])*a;}
   const u=GRT_PU;u.uK.value=cur.k*c.part;u.uSz.value=cur.z;u.uSw.value=cur.w;u.uVel.value.fromArray(cur.v);u.uPC.value.setRGB(cur.c[0],cur.c[1],cur.c[2]);u.uPx.value=renderer.getPixelRatio();
   u.uBoxC.value.copy(camera.position);P.visible=u.uK.value>.01;}
}
/* ---------------- CE QUI TUE EN VOL : la roche (la densité au point, la surface qu'on voit), la lave, l'eau, et les gros décors (boîtes orientées) ---------------- */
function grtDansCone(q,p){const dx=p.x-q[0],dy=p.y-q[1],dz=p.z-q[2],t=dx*q[3]+dy*q[4]+dz*q[5];if(t<-1||t>q[8]+1)return false; /* (2026-10-22, DEBUGGING) dans le prisme d'une concrétion (base q0-2, axe q3-5, rayon q6 → q7 sur q8 m), avec la marge d'1 m des boîtes */
  const r=q[6]+(q[7]-q[6])*Math.max(0,Math.min(1,t/q[8]))+1;return dx*dx+dy*dy+dz*dz-t*t<r*r;}
function grotteHeurt(p){const V=GROTTE.V;if(!V)return '';
  if(grtDensIci(V,p.x,p.y,p.z)<=0){const a=grtIci(V,p.x,p.y,p.z),b=grtIci(V,p.x,p.y-V.B*.5,p.z); /* (2026-10-22, DEBUGGING : « 4 m plus bas » datait des cases de 8 m — avec celles de 12 m (LA GROTTE VASTE), quand un centre de case tombe 0 à 2 m au-dessus de la surface d'un lac, le point et ses 4 m plus bas restaient dans cette case non marquée : toute chute dans CE lac (lave, eau, bassin du puits) se lisait « roche » ; une demi-case plus bas est toujours sous la surface) */return a===4||b===4?'lave':a===5||b===5?'eau':'roche';}
  const G=GROTTE.col;if(G){const a=G.G.get(Math.floor(p.x/64)+','+Math.floor(p.z/64));
    if(a)for(let i=0;i<a.length;i++){const o=a[i],dx=p.x-o.x,dz=p.z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;
      if(Math.abs(lx)<o.hx+1&&Math.abs(p.y-o.y)<o.hy+1&&Math.abs(lz)<o.hz+1&&(!o.cone||grtDansCone(o.cone,p)))return o.k;}}
  return '';}
/* ---------------- LA CHAUFFE AU MENU : la roche et les poussières ---------------- */
function grotteChauffe(){const M=grtMats(),g9=new THREE.BufferGeometry();
  g9.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g9.setAttribute('aF',new THREE.BufferAttribute(new Uint8Array(12),4));g9.setAttribute('aL',new THREE.BufferAttribute(new Uint8Array(12),4,true));
  const me=new THREE.Mesh(g9,M.roche),P=grtPartObj();me.frustumCulled=false;const g=new THREE.Group();g.add(me);scene.add(g);
  const v=P.visible;P.visible=true;try{chauffeRendu([g,P]);}finally{scene.remove(g);P.visible=v;g9.dispose();}}
/* ---------------- LA CONSOLE ---------------- */
window.dbgGrotte=function(k,o){
  if(k==='test'){ // LA RÈGLE D'OR : de l'air tous les 6 m au bord et au milieu de la route, sous la dalle (−THICK−1,5), dessus (+1,5) et à hauteur de saut (+14) ; aucun décor dur
    if(!GROTTE.V)return 'pas de grotte bâtie';let roc=0,dec=0;const ou=[],F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},p=new THREE.Vector3();
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF])for(const h of [-THICK-1.5,1.5,14]){p.copy(F9.p).addScaledVector(F9.b,lt).addScaledVector(F9.n,h);
      if(!grotteHeurt(p))continue;if(grtDensIci(GROTTE.V,p.x,p.y,p.z)<=0){roc++;if(ou.length<30)ou.push('R'+Math.round(s9)+'('+lt+','+h+')salle'+grtSalleIci(s9)+'/dLac'+(GROTTE.lac?Math.round(p.y-GROTTE.lac.y):'-'));}else{dec++;if(ou.length<30)ou.push('D'+Math.round(s9)+'('+lt+','+h+')');}}}
    return {roche:roc,decors:dec,ou:ou.join(' ')};}
  if(k==='meteo'){grotteMeteo(o||'nuit',.01);GROTTE.cur=JSON.parse(JSON.stringify(GRT_MET[GROTTE.met]));GROTTE.k=1;const nm=grtBioNom(GROTTE.met,Math.max(0,GROTTE.salle));
    if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}grotteTick(0);return GROTTE.met;} // (tout de suite, même en pause : les photos)
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);if(o.up)camera.up.fromArray(o.up);else camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);
    {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position;for(const g of GROTTE.grp){const b=g.userData.c;g.visible=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<ff*ff;}}
    if(scene.fog){scene.fog.color.copy(FOG_BASE);scene.fog.near=FOG_N;scene.fog.far=FOG_F;} // (2026-10-19) la brume de la salle : en pause la boucle ne la recopie pas — les photos du banc avaient toutes celle de la mine
    GRT_PU.uBoxC.value.copy(camera.position);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'salle' (o.k = mine|luxe|boyau|stal|lave|abysse|fin, o.d m après l'entrée, o.h m de haut, o.r m en arrière) */
  if(k==='salle'){const R=GROTTE.R;if(!R)return 'pas de grotte';const sb=R.bornes[(o&&o.k)||'luxe'];if(sb==null)return 'pas de salle';
    const s9=Math.max(0,Math.min(L-1,sb+((o&&o.d)||60))),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(s9,F9);
    const r=(o&&o.r)||22,h=(o&&o.h)||9,p=F9.p.clone().addScaledVector(F9.t,-r).addScaledVector(F9.n,h),c=F9.p.clone().addScaledVector(F9.t,120).addScaledVector(F9.n,h*.4);
    const k9=grtSalleIci(s9),nm=grtBioNom(GROTTE.met,k9);if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}GROTTE.salle=k9;
    return window.dbgGrotte('vue',{p:p.toArray(),c:c.toArray(),fov:o&&o.fov,up:o&&o.slab?F9.n.toArray():null});} /* o.slab : la caméra dans le repère de la dalle (ce que le joueur voit : le haut de la caisse en haut de l'image) */
  return {on:!!GROTTE.root,met:GROTTE.met,salle:GROTTE.salle,ms:GROTTE.ms,msCreuse:GROTTE.msCreuse,msFile:Math.round(GROTTE.msFile||0),pret:GROTTE.pret,tm:GROTTE.tm,
    file:GROTTE.file?GROTTE.file.length-GROTTE.fi:0,n:GROTTE.n,conflits:GROTTE.conflits,croise:GROTTE.croise,L:Math.round(L),
    salles:GROTTE.R?GROTTE.R.bornes:null,hasard:GROTTE.Q&&GROTTE.Q.hasard||null,roule:grtTordOn(),
    lac:GROTTE.lac&&Math.round(GROTTE.lac.y),eau:GROTTE.eau&&Math.round(GROTTE.eau.y)};};
/* ---------------- LES AMBIANCES : une par salle et par météo (appelée après les biomes du volcan, une fois BIOMES né) ----------------
   La grammaire des nuits de la bible (deux températures : la brume froide et sombre, la lumière du lieu chaude ou colorée), la brume est la
   couleur de la grotte AU LOIN (jamais un gris : un teal profond, un violet, un ambre, un pourpre, un noir bleuté). Ciel = brume (on ne le voit
   jamais : la roche est partout). Puis LA RECETTE COMMUNE des maps (`grtConti`, après CONTI) : saturation, contraste, vignette, contre-jour
   rose, bitume commun, par temps — la grotte parle la langue des six autres. */
function grtBiomes(){if(typeof BIOMES==='undefined'||!BIOMES.nuagesNuit)return;
  const S={mine:{fog:[.07,.048,.033],hemiS:[.40,.32,.26],hemiG:[.34,.20,.10],fillC:[1,.58,.26],kickC:[1,.46,.30]},
    luxe:{fog:[.028,.088,.074],hemiS:[.28,.48,.40],hemiG:[.22,.42,.14],fillC:[1,.58,.20],kickC:[.50,1,.70]},
    boyau:{fog:[.074,.032,.13],hemiS:[.46,.32,.70],hemiG:[.36,.16,.52],fillC:[.78,.40,1],kickC:[1,.45,1]},
    stal:{fog:[.094,.066,.042],hemiS:[.50,.42,.32],hemiG:[.36,.26,.16],fillC:[1,.72,.40],kickC:[1,.56,.40]},
    lave:{fog:[.15,.04,.022],hemiS:[.38,.22,.30],hemiG:[.70,.18,.04],fillC:[1,.36,.08],kickC:[1,.30,.12]},
    abysse:{fog:[.01,.045,.06],hemiS:[.12,.30,.36],hemiG:[.04,.20,.24],fillC:[.12,.80,.90],kickC:[.30,.90,1]}};
  const M={matin:{k:1,fogN:50,fogF:680,hemiI:.52,fillI:.34,expo:1,bloomS:.55,bloomT:.86},midi:{k:.9,fogN:60,fogF:740,hemiI:.46,fillI:.42,expo:1,bloomS:.66,bloomT:.82},
    soir:{k:1.05,fogN:50,fogF:640,hemiI:.5,fillI:.42,expo:.98,bloomS:.62,bloomT:.84},nuit:{k:.5,fogN:30,fogF:460,hemiI:.3,fillI:.26,expo:1,bloomS:.6,bloomT:.84}};
  const hx=function(c,k){return '#'+c.map(function(v){return ('0'+Math.round(Math.min(1,Math.pow(Math.max(0,v*k),1/2.2))*255).toString(16)).slice(-2);}).join('');};
  for(const m in M)for(const k of GRT_SALLES){const a=S[k],b=M[m],kc=GRV.fogS[GRT_SALLES.indexOf(k)]*(k==='mine'?1:GRV.fogC),f=a.fog.map(function(v){return v*b.k*kc;}),sky=f.map(function(v){return v*.8;});
    BIOMES['grt-'+m+'-'+k]=bioMet(BIOMES.nuagesNuit,{nm:'GROTTE · '+k.toUpperCase()+' · '+m.toUpperCase(),jour:1,jZen:sky,jMid:sky,jHor:f,jSol:f,sunTint:[.5,.5,.6],sunHalo:0,stars:0,moon:0,city:0,
      fog:f,fogN:b.fogN*(k==='mine'?1:GRV.fog*GRV.fogN),fogF:b.fogF*(k==='mine'?1:GRV.fog),fogCj:f, /* (GROTTE VASTE) la mine, étroite, garde sa brume : au-delà, des tronçons cachés en moins */fogIn:f.map(function(v){return v*1.6;}),hemiS:a.hemiS,hemiG:a.hemiG,hemiI:b.hemiI,sunC:[.5,.5,.62],sunI:.12,fillC:a.fillC,fillI:b.fillI,kickC:a.kickC,kickI:.22,
      expo:b.expo,sat:1.04,con:1.16,rtK:1,wb:[1,1,1],sh:[0,.006,.02],hi:[.01,.004,-.004],daSh:.4,vigK:.46,vigC:[.01,.01,.03],bloomS:b.bloomS,bloomT:b.bloomT,rimK:.8,
      env:[[0,hx(f,.6)],[.3,hx(f,1.6)],[.48,hx(a.fillC,.35)],[.58,hx(a.fillC,.55)],[.66,hx(f,1.2)],[1,hx(f,.5)]],
      eS1:a.fillC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.42]),eS2:a.kickC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.26])});}}
function grtConti(){for(const m of ['matin','midi','soir','nuit']){const r=CONTI.temps[m];if(!r)continue;for(const k of GRT_SALLES){const b=BIOMES['grt-'+m+'-'+k];if(!b)continue;
  for(const f in r)if(f!=='stars')b[f]=Array.isArray(r[f])?r[f].slice():r[f];}}}
function grtTextes(){Object.assign(I18N,{'LES PROFONDEURS':'THE DEPTHS','LA ROCHE NE PARDONNE PAS':'THE ROCK NEVER FORGIVES','TORCHES':'TORCHES','CRISTAUX':'CRYSTALS','MAGMA':'MAGMA','NOIR COMPLET':'PITCH BLACK',
  'SUIS LES TORCHES':'FOLLOW THE TORCHES','LES CRISTAUX T ECLAIRENT':'THE CRYSTALS LIGHT YOUR WAY','LA LAVE MONTE':'THE LAVA IS RISING','TES PHARES, TA SEULE LUMIERE':'YOUR HEADLIGHTS, YOUR ONLY LIGHT',
  'AU FOND DE L EAU':'AT THE BOTTOM OF THE WATER'});} // (2026-10-18) LES PROFONDEURS — appelée avec grtBiomes (I18N naît plus bas que ce bloc)
/* <<<FIN GROTTE>>> */
