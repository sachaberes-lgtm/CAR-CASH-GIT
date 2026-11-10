/* ===== LES ICÔNES DU BOUTON BOOST (2026-11-01, Léo : « change l'éclair par un truc intelligent ou stylé, genre une bouteille nitro, on peut tester plusieurs trucs ») ===== ?boost=bouteille|chevrons|anneau (SVG) ou flamme (en pixels, voir plus bas) : un SVG en verre dans #tNitro à la place de l'éclair en pixels (le style vit dans charte-7-details.css) ; rien dans l'URL = l'éclair, comme avant. */
const BV_ICO={"bouteille": "<svg class=\"bvIco bv-bouteille\" viewBox=\"0 0 40 66\" aria-hidden=\"true\"><defs><clipPath id=\"bvCb\"><path d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/></clipPath></defs><g clip-path=\"url(#bvCb)\"><rect class=\"bvLx\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/><rect class=\"bvLq\" x=\"0\" y=\"15\" width=\"40\" height=\"52\"/></g><path class=\"bvLn\" d=\"M14 9h12v6q8 2 8 12v27q0 8-8 8H14q-8 0-8-8V27q0-10 8-12z\"/><path class=\"bvLn\" d=\"M11 4h18v5H11z\"/><path class=\"bvBr\" d=\"M10 31h20M10 36h20\"/><path class=\"bvSh\" d=\"M11 22q-2 4-2 10\"/></svg>", "chevrons": "<svg class=\"bvIco bv-chevrons\" viewBox=\"0 0 48 52\" aria-hidden=\"true\"><path class=\"bvCh c3\" d=\"M8 46l16-14 16 14\"/><path class=\"bvCh c2\" d=\"M8 31l16-14 16 14\"/><path class=\"bvCh c1\" d=\"M8 16l16-14 16 14\"/></svg>", "anneau": "<svg class=\"bvIco bv-anneau\" viewBox=\"0 0 64 64\" aria-hidden=\"true\"><circle class=\"bvPi\" cx=\"32\" cy=\"32\" r=\"27\"/><circle class=\"bvRx\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><circle class=\"bvRq\" cx=\"32\" cy=\"32\" r=\"27\" pathLength=\"100\"/><path class=\"bvCh d2\" d=\"M21 38l11-10 11 10\"/><path class=\"bvCh d1\" d=\"M21 29l11-10 11 10\"/></svg>"};
{const bv=(/[?&]boost=([a-z]+)/.exec(location.search)||[])[1],bt=document.getElementById('tNitro');
 if(!bv||bv==='flamme'){NX3.flame=true;document.body.classList.add('bvF');} // (2026-11-01, Léo : « changer l'icône en haut aussi ») LA FLAMME EST LE BOUTON PAR DÉFAUT ; ?boost=eclair rend l'éclair d'avant
 else if(bv==='eclair'){}
 else if(bv&&BV_ICO[bv]&&bt){bt.insertAdjacentHTML('beforeend',BV_ICO[bv]);document.body.classList.add('bv','bv-'+bv);}}
/* ===== LA FLAMME EN PIXELS (2026-11-01, Léo : « flamme mais plus stylé, qui autour du doigt s'enflamme de plus en plus (couleurs et intensité) quand on maintient, même style que l'éclair actuel mais flamme ») =====
   Même pipeline que l'éclair (grille de cases, contour d'encre, épaisseur dessous, lueur en cases, enfoncement) — seule la FORME change : une flamme qui vacille (tête qui se balance,
   flancs qui bougent), dessinée du bord vers le cœur (bord foncé → plein → clair → cœur blanc). NX3.heat (0 → 1 en 2,2 s de doigt posé, retombe en 0,7 s) la fait GRANDIR, lui donne
   deux langues de chaque côté (> 30 % et > 55 %), des étincelles (> 50 %), un cœur blanc-bleu (> 70 %) et la fait passer de la braise (f0) au blanc brûlant (f3) ; la réserve bleue,
   la nitro infinie (violet) et le « à sec » (gris) gardent leurs palettes. Redessinée 7 à 16 fois par seconde, pas à chaque image. */
function nxfMasque(fh,fr){
  const gw=15,gh=20,m=NX3.fm||(NX3.fm=new Uint8Array(gw*gh));m.fill(0);
  const fl=function(cx,haut,w,ph,sw){const bas=gh-1;
    for(let y=bas;y>=Math.max(0,bas-haut);y--){const v=(bas-y)/haut,hw=w*Math.pow(1-v,.7)*(.55+.45*Math.sin(Math.min(1,v*3)*1.5708)),
      c=cx+sw*Math.pow(v,1.5)*Math.sin(fr*.9+ph+v*3),j=.35*Math.sin(fr*1.3+ph*2+y*1.1);
      for(let x=0;x<gw;x++)if(Math.abs(x-c)<=hw+j+.35)m[y*gw+x]=1;}};
  fl(7,Math.round(11+8*fh+1.2*Math.sin(fr*.7)),4+.8*fh,0,1.6+fh);
  if(fh>.3)fl(2,Math.round(5+7*fh+1.2*Math.sin(fr+1)),2,2,1);
  if(fh>.55)fl(12,Math.round(5+7*fh+1.2*Math.sin(fr*1.1+4)),2,4,1);
  return m;
}
/* ===== LA BOULE DE FEU-POUCE (2026-11-10, Sacha : « plus gros, la forme d'une boule de feu à l'envers et surtout d'un pouce — la chair en rouge, l'ongle en jaune — que ça se déplace un peu comme un joystick,
   et que la flamme parte dans l'autre sens, comme du vent ») =====
   Même pipeline que la flamme d'avant (grille de cases, contour d'encre, lueur en cases, palettes f0 → f3 selon la chaleur du doigt) — seule la FORME change. Tout est dessiné en « unités »
   (1 unité = 4/3 case ; NXP.Z) pour que la grille puisse être affinée sans refaire la forme :
   · LA TÊTE : un disque de feu de NXP.R unités dont la lisière ondule (deux harmoniques qui tournent), TÊTE EN HAUT, queue vers le bas — la boule « à l'envers », qui pend sous le pouce comme une comète
     qui monte ; le feu se lit du bord vers le centre (bord foncé → plein → clair → cœur) ; la lisière est grignotée par un bruit qui change à chaque image (le feu qui mord).
   · LE POUCE : au centre, un doigt un peu incliné — la CHAIR en rouge (lumière à gauche, ombre à droite, un seul pli d'articulation), la pointe en dôme, le bas FONDU dans le feu par un tramage —
     et son ONGLE jaune (lunule pâle, reflet, filet ambré). Appuyer blanchit l'ongle. Les palettes bleue (réserve), violette (infinie) et grise (à sec) recolorent aussi le doigt.
   · LA QUEUE : une goutte principale qui ondule en S + 2 à 4 langues (selon la chaleur) + 3 mèches qui montent de la tête, chacune à son rythme.
   · LE VENT : NX3.wx (−1 gauche … 1 droite) et NX3.wy (> 0 : la boule monte, la queue s'allonge) courbent chaque langue, la pointe plus que la racine, et penchent le pouce.
     Ils viennent du glissé du doigt (voir nx3Souffle) : la boule file d'un côté, la flamme part de l'AUTRE.
   · LES ÉTINCELLES : NX3.sp, quelques cases qui se détachent de la queue et filent dans le sens du vent.
   Redessinée 7 à 16 fois par seconde (plus vite pendant un glissé), pas à chaque image : ~3 000 cases, quelques dizaines de µs par case. */
const NXP={Z:4/3,GW:60,GH:66,CX:22.5,CY:16,R:10.5,BOX_W:40,BOX_H:46,JR:34,UW:45,UH:49.5,
  /* [chair, chair claire, chair sombre, contour du doigt] · [ongle, reflet, lunule, filet] — la chair et l'ongle de chaque palette de flamme */
  DOIGT:{f0:[['#e8282a','#ff6e4e','#a8121f','#5a0820'],['#ffd23f','#fff7c2','#fff0a0','#b86a00']],
         f1:[['#ee2e2a','#ff7650','#b0141f','#5a0820'],['#ffd93f','#ffffff','#fff3a8','#b86a00']],
         f2:[['#f23a2c','#ff8858','#b8181f','#5a0820'],['#ffe35a','#ffffff','#fff6b8','#c47a00']],
         f3:[['#ff5a3a','#ffa070','#c0201f','#5a0820'],['#ffdc4a','#fff7c2','#fff3a8','#c47a00']],
         bleu:[['#4a68f0','#8fa4ff','#2a44c8','#0b0a2e'],['#e8edff','#ffffff','#ffffff','#2a44c8']],
         vio:[['#c40a00','#ff4a3a','#6e0500','#2a0430'],['#ffe0dc','#ffffff','#ffffff','#a01008']],
         vioF:[['#e01a0a','#ff7a6a','#8a0a00','#2a0430'],['#ffffff','#ffffff','#ffffff','#c01808']],
         sec:[['#6e6890','#8a84aa','#4a4468','#211d38'],['#a49cc4','#c8c2e0','#c8c2e0','#4a4468']]},
  /* les BANDES du feu par palier de chaleur [bord, plein, clair, cœur] — plus orangées que f0-f3 d'avant (le blanc brûlant mangeait l'ongle) ; les autres palettes gardent les leurs */
  BANDES:{f0:['#c8330a','#ff7a1a','#ffb52e','#ffe27a'],f1:['#d8420a','#ff8f1f','#ffc24a','#fff0a0'],f2:['#e85a0c','#ffa21f','#ffd95a','#fff6c0'],f3:['#ff8a1a','#ffc844','#fff0a0','#ffffff']},
  B:null};
function nxpBruit(x,y,f){let h=(x*374761393+y*668265263+f*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}
function nxfDessine(d,pal,a,clig){
  const G=NXP,Z=G.Z,W=G.GW,H=G.GH,N=W*H,u=NX3.u32,P=NX3_PAL[pal]||NX3_PAL.f1,fh=NX3.fh||0,fr=NX3.ft||0,wx=NX3.wx||0,wy=NX3.wy||0,press=d>=2,
    B=G.B||(G.B=new Uint8Array(N)),pl=G.DOIGT[pal]||G.DOIGT.f1,bd=(G.BANDES[pal]||[P[3],P[1],P[2],P[0]]).map(nx3Rgb),ink=nx3Rgb(clig?'#ff5a6e':P[7]);
  u.fill(0);B.fill(0);
  const cx=G.CX,cy=G.CY+(press?.8:0),R=G.R+.5*Math.sin(fr*.9)*(.3+fh),
    L=Math.max(12,Math.min(24,(20+3*fh+3*Math.max(0,wy)-5*Math.max(0,-wy))*(1-.16*Math.abs(wx)))),sw=2.2+2.2*fh,KW=15;
  /* les langues : [x de la racine, y de la racine, dx, dy, longueur, rayon de base, phase] — la principale d'abord, puis les côtés, puis (chaud) deux de plus, puis les mèches de la tête */
  const S=[[cx,cy,0,1,L,R,0],[cx-6.8,cy+2.5,0,1,L*.66,3.7,2.1],[cx+6.8,cy+2.5,0,1,L*.58,3.3,4.2]];
  if(fh>.42)S.push([cx-3.4,cy+5,0,1,L*.88,3.4,1],[cx+3.4,cy+5,0,1,L*.82,3,5]);
  S.push([cx-5.6,cy-8,-.3,-.95,4.2+2.5*fh+1.4*Math.sin(fr*1.3),3,3.3],[cx+.4,cy-9.5,.04,-1,5+2.8*fh+1.6*Math.sin(fr*1.1+2),3.2,.9],[cx+6,cy-8.2,.42,-.9,3.9+2.5*fh+1.4*Math.sin(fr*1.7+4),2.8,5.1]);
  const ns=S.length;
  /* la BOÎTE de ce qui peut brûler (racines, pointes, + le vent et l'ondulation) : seules ses cases sont évaluées — un tiers de la toile */
  let ux0=1e9,ux1=-1e9,uy0=1e9,uy1=-1e9;
  for(let k=0;k<ns;k++){const s9=S[k],lat=KW*(k<5?1:.3)*Math.abs(wx)+sw+s9[5]+1,ex=s9[0]+s9[2]*s9[4],ey=s9[1]+s9[3]*s9[4];
    ux0=Math.min(ux0,s9[0]-s9[5],ex-lat);ux1=Math.max(ux1,s9[0]+s9[5],ex+lat);uy0=Math.min(uy0,s9[1]-s9[5],ey-1);uy1=Math.max(uy1,s9[1]+s9[5],ey+1);}
  const bx0=Math.max(1,Math.floor(ux0*Z)-1),bx1=Math.min(W-2,Math.ceil(ux1*Z)+1),by0=Math.max(1,Math.floor(uy0*Z)-1),by1=Math.min(H-2,Math.ceil(uy1*Z)+1);
  for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){
    let q=-1;const px=(x+.5)/Z,py=(y+.5)/Z;
    for(let k=0;k<ns;k++){const s9=S[k],dx=s9[2],dy=s9[3],Ls=s9[4],r0=s9[5],vx=px-s9[0],vy=py-s9[1],s=vx*dx+vy*dy;
      if(s<-r0||s>=Ls)continue;
      const t=s<0?0:s/Ls,perx=dy,pery=-dx,kf=k<5?1:.3,kk=k===0?1:k<5?.65:.5,ph9=s9[6]+fr*.9+s*.42,uu=vx*perx+vy*pery-KW*kf*wx*Math.pow(t,1.7)*perx-sw*Math.sin(ph9)*t*kk;
      let qk;
      if(s<0){const r=Math.hypot(s,uu),th=Math.atan2(uu,s);qk=1-r/(k===0?r0*(1+.07*Math.sin(3*th+fr*.55)+.05*Math.sin(5*th-fr*.8)):r0);}
      else{const m=KW*kf*wx*1.7*Math.pow(t,.7)/Ls+sw*kk*(Math.cos(ph9)*.42*t+Math.sin(ph9)/Ls),w=r0*(1-Math.pow(t,1.1))*Math.sqrt(1+m*m);qk=w>0?1-Math.abs(uu)/w:-1;} /* la pente de l'axe élargit la coupe horizontale (sinon une queue très penchée se réduit à des points) */
      if(qk>q)q=qk;}
    if(q<=-1)continue;
    const nz=(nxpBruit(x,y,fr>>1)-.5);
    if(q+nz*.16>0){const qq=q+nz*.2;B[y*W+x]=1;u[y*W+x]=qq<.2?bd[0]:qq<.5?bd[1]:qq<.8?bd[2]:bd[3];}
  }
  /* les trous de 1-2 cases entre deux langues se bouchent (un trou d'encre isolé, dans le feu, faisait un œil)… */
  for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(B[i])continue;let n=0;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++)if(B[i+j*W+k])n++;if(n>=6){B[i]=3;u[i]=bd[0];}}
  for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++)if(B[y*W+x]===3)B[y*W+x]=1;
  /* …et tout vide ENCLOS (non relié au bord de la boîte) se remplit : une langue qui se replie sur la queue laissait une tache d'encre au milieu du feu */
  {const E=G.E||(G.E=new Uint8Array(N)),pile=G.P||(G.P=new Int32Array(N));let sp9=0;
   for(let y=by0-1;y<=by1+1;y++)for(let x=bx0-1;x<=bx1+1;x++)E[y*W+x]=0;
   const pousse=function(i){if(!B[i]&&!E[i]){E[i]=1;pile[sp9++]=i;}};
   for(let x=bx0;x<=bx1;x++){pousse(by0*W+x);pousse(by1*W+x);}for(let y=by0;y<=by1;y++){pousse(y*W+bx0);pousse(y*W+bx1);}
   while(sp9>0){const i=pile[--sp9],x=i%W,y=(i/W)|0;if(x>bx0)pousse(i-1);if(x<bx1)pousse(i+1);if(y>by0)pousse(i-W);if(y<by1)pousse(i+W);}
   for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const i=y*W+x;if(!B[i]&&!E[i]){B[i]=1;u[i]=bd[1];}}}
  /* LE POUCE : un doigt incliné (le vent le penche), dôme en haut, plus large vers le bas, qui fond dans le feu sous l'articulation */
  const phi=-.14-.2*wx,cf=Math.cos(phi),sf=Math.sin(phi),tx=cx+wx*.8,ty=cy+.5,chair=pl[0].map(nx3Rgb),ong=pl[1].map(nx3Rgb),
    loc=function(X,Y){const dx=(X+.5)/Z-tx,dy=(Y+.5)/Z-ty;return [cf*dx+sf*dy,-sf*dx+cf*dy];},
    dedans=function(X,Y){const p=loc(X,Y),xl=p[0],yl=p[1],ax=Math.abs(xl);if(yl<-10.2||yl>9)return false;
      const hw=5.2+1.5*Math.min(1,Math.max(0,(yl+10)/12));
      if(yl<-4.6)return ax<=Math.sqrt(Math.max(0,5.4*5.4-(yl+4.6)*(yl+4.6)))*(hw/5.4);
      if(yl>4.2){const m=(9-yl)/4.8;return ax<=hw&&nxpBruit(X,Y,7)<m*m*1.15;}   /* le bas se tramé dans le feu */
      return ax<=hw;},
    ongle=function(X,Y){const p=loc(X,Y),xl=p[0],yl=p[1],ax=Math.abs(xl);if(yl<-8.6||yl>-.4)return false;
      const hw=3.5+.4*Math.min(1,(yl+8.6)/3);
      if(yl<-6.2)return ax<=hw-(-6.2-yl)*.8;
      return ax<=hw;};
  const ex=Math.ceil(9*Z)+2;
  for(let y=Math.floor(ty*Z)-ex*1.4|0;y<=Math.ceil(ty*Z)+ex*1.4;y++)for(let x=Math.floor(tx*Z)-ex;x<=Math.ceil(tx*Z)+ex;x++){
    if(x<0||y<0||x>=W||y>=H||!dedans(x,y))continue;
    const i=y*W+x,p=loc(x,y),xl=p[0],yl=p[1],bord=yl<4.6&&(!dedans(x-1,y)||!dedans(x+1,y)||!dedans(x,y-1)||!dedans(x,y+1));
    let c;B[i]=1;
    if(bord)c=chair[3];
    else if(ongle(x,y)){
      const nb=!ongle(x-1,y)||!ongle(x+1,y)||!ongle(x,y-1)||!ongle(x,y+1);
      if(nb)c=ong[3];
      else if(yl>-2.8)c=ong[2];                                 /* la lunule, en bas de l'ongle */
      else if(xl<-.9&&xl>-2.8&&yl<-4.4&&yl>-7)c=ong[1];         /* le reflet, en haut à gauche */
      else c=press?ong[1]:ong[0];                               /* appuyé : l'ongle blanchit */
    }
    else if(Math.abs(yl-3.2-.18*(xl-2.2)*(xl-2.2))<.55&&xl>.8&&xl<4.6)c=chair[2];   /* un seul pli, à droite : l'articulation (deux plis jumeaux faisaient des yeux) */
    else if(xl<-3.1)c=chair[1];                                 /* la lumière vient de la gauche */
    else if(xl>3.2||yl>6.2)c=chair[2];                          /* l'ombre à droite et vers le bas */
    else c=chair[0];
    u[i]=c;
  }
  /* les étincelles (positions en unités, relatives à la toile) : une case chacune, du jaune au rouge */
  const sp=NX3.sp;if(sp&&sp.length)for(let k=0;k<sp.length;k++){const e=sp[k],X=Math.round(e.x*Z),Y=Math.round(e.y*Z);
    if(X>=0&&Y>=0&&X<W&&Y<H&&!B[Y*W+X]){B[Y*W+X]=2;u[Y*W+X]=e.l>.55?bd[3]:e.l>.28?bd[2]:bd[1];}}
  /* le contour d'encre (1 case) et la lueur en cases (2 anneaux) : trois dilations successives du feu (carré 3 × 3, deux passes séparables), sans toucher les cases déjà peintes */
  const cG=nx3Rgb(pal==='f3'?'#ffb347':P[6])&0x00ffffff,g1=(cG|Math.round(a*.78*255)<<24)>>>0,g2=(cG|Math.round(a*.36*255)<<24)>>>0,
    X0=Math.max(1,Math.min(bx0,Math.floor((tx-9)*Z))-4),X1=Math.min(W-2,Math.max(bx1,Math.ceil((tx+9)*Z))+4),Y0=Math.max(1,by0-4),Y1=Math.min(H-2,by1+4),
    T=G.T||(G.T=new Uint8Array(N)),D=G.D||(G.D=new Uint8Array(N));
  for(let y=Y0-1;y<=Y1+1;y++)for(let x=X0-1;x<=X1+1;x++){const i=y*W+x;D[i]=B[i]===1?1:0;}
  const nTours=a>.02?3:1;
  for(let r=1;r<=nTours;r++){
    for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const i=y*W+x;T[i]=D[i-1]|D[i]|D[i+1];}
    for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const i=y*W+x;if(T[i-W]|T[i]|T[i+W]){if(!D[i]&&!B[i])u[i]=r===1?ink:r===2?g1:g2;D[i]=1;}}
  }
  NX3.cx.putImageData(NX3.img,0,0);
}
/* LE GLISSÉ ET LE VENT (même demande) : la boule se déplace sous le pouce dans un rayon de NXP.JR px, comme un joystick, SEULEMENT pendant l'appui (le point d'appui = le centre) ; la flamme part
   dans l'autre sens. Un ressort suit le doigt (légèrement amorti), au lâcher il revient en dépassant son point de repos — la flamme fouette. Pure décoration : la nitro, la figure au glissé (GLI)
   et le volant ne voient rien de ce déplacement (écouteurs à part, passifs). Réduire les animations : pas de dépassement, pas d'étincelles, pas de souffle ambiant. */
function nx3Pouce(){
  const J=NX3.J={id:null,x0:0,y0:0,tx:0,ty:0,ox:0,oy:0,vx:0,vy:0};
  const dn=function(id,x,y){if(J.id!=null)return;J.id=id;J.x0=x;J.y0=y;J.tx=J.ty=0;},
    mv=function(id,x,y){if(J.id!==id)return;let dx=x-J.x0,dy=y-J.y0;const r=Math.hypot(dx,dy),R=NXP.JR;if(r>R){dx*=R/r;dy*=R/r;}J.tx=dx;J.ty=dy;},
    up=function(id){if(J.id!==id)return;J.id=null;J.tx=J.ty=0;};
  [document.getElementById('tNitro'),document.getElementById('tNitroZone')].forEach(function(el){if(!el)return;
    el.addEventListener('touchstart',function(e){const t=e.changedTouches[0];if(t)dn('t'+t.identifier,t.clientX,t.clientY);},{passive:true});
    el.addEventListener('touchmove',function(e){for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];mv('t'+t.identifier,t.clientX,t.clientY);}},{passive:true});
    el.addEventListener('touchend',function(e){for(let i=0;i<e.changedTouches.length;i++)up('t'+e.changedTouches[i].identifier);},{passive:true});
    el.addEventListener('touchcancel',function(e){for(let i=0;i<e.changedTouches.length;i++)up('t'+e.changedTouches[i].identifier);},{passive:true});
    el.addEventListener('mousedown',function(e){dn('m',e.clientX,e.clientY);});});
  addEventListener('mousemove',function(e){mv('m',e.clientX,e.clientY);});
  addEventListener('mouseup',function(){up('m');});
  addEventListener('blur',function(){J.id=null;J.tx=J.ty=0;});
}
function nx3Souffle(dt,appui,rm,fh){
  const J=NX3.J;if(!J)return;
  const tenu=J.id!=null,h=Math.min(dt,.05)/2,k=tenu?520:760,c=tenu?42:(rm?60:17);
  for(let i=0;i<2;i++){J.vx+=(k*((tenu?J.tx:0)-J.ox)-c*J.vx)*h;J.vy+=(k*((tenu?J.ty:0)-J.oy)-c*J.vy)*h;J.ox+=J.vx*h;J.oy+=J.vy*h;}
  if(!tenu&&Math.abs(J.ox)<.05&&Math.abs(J.oy)<.05&&Math.abs(J.vx)<1&&Math.abs(J.vy)<1){J.ox=J.oy=J.vx=J.vy=0;}
  const R=NXP.JR,cl=function(v){return Math.max(-1,Math.min(1,v));},
    wxT=cl(-J.ox/R*1.05-J.vx/(R*16))+(rm?0:.07*Math.sin(NX3.t*1.9)),wyT=cl(-J.oy/R*.85-J.vy/(R*20)),f=Math.min(1,dt*16);
  const vF=NX3.vF;NX3.wx=(NX3.wx||0)+((vF?vF[0]:wxT)-(NX3.wx||0))*f;NX3.wy=(NX3.wy||0)+((vF?vF[1]:wyT)-(NX3.wy||0))*f;
  const tr='translate('+Math.round(J.ox*2)/2+'px,'+Math.round(J.oy*2)/2+'px)';
  if(tr!==NX3.tr){NX3.tr=tr;NX3.cv.style.transform=tr;}
  NX3.wq=Math.round(NX3.wx*14)+','+Math.round(NX3.wy*10);
  /* les étincelles : 4 à 10 par seconde selon la chaleur, qui se détachent de la queue et filent dans le sens du vent (positions en unités) */
  const sp=NX3.sp||(NX3.sp=[]),veut=rm?0:(appui?10:(NX3.k>.5?7:(fh>.2?4:0)));
  NX3.spT=(NX3.spT||0)+dt*veut;if(NX3.spT>2)NX3.spT=0;
  while(NX3.spT>=1&&sp.length<14){NX3.spT-=1;sp.push({x:NXP.CX+(Math.random()-.5)*11,y:NXP.CY+8+Math.random()*10,vx:(Math.random()-.5)*8+(NX3.wx||0)*20,vy:9+Math.random()*10,l:1});}
  for(let i=sp.length-1;i>=0;i--){const e=sp[i];e.l-=dt*1.5;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx+=(NX3.wx||0)*30*dt;if(e.l<=0||e.y>=NXP.UH-1||e.x<1||e.x>=NXP.UW-1)sp.splice(i,1);}
}
function nxfRows(){const m=nxfMasque(.35,2),r=[];for(let y=0;y<20;y++){let t='';for(let x=0;x<15;x++)t+=m[y*15+x]?'#':'.';r.push(t);}return r;} // la flamme en lignes de cases, pour le dessin SVG du réglage des figures (même forme que NX3_G)
