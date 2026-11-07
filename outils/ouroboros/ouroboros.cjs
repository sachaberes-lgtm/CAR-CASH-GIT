/* ===== L'OUROBOROS DU CHARGEMENT (2026-11-03, Sacha : « son corps ne doit pas tourner : c'est sa TÊTE qui avance autour de son corps en le mangeant ; le corps se nourrit de boules de matière qui passent et qu'il avale » ; 2026-11-05 : « la tête est trop grosse, pas assez détaillée, trop blanche » puis « plus détaillée, le délire reptile, écailles, pics, presque dragon mais pas trop, toujours sobre, noir et nuances de gris, corps animé, tête animée parfaitement ») =====
   Dessiné par Fable 5.1. `node outils/ouroboros/ouroboros.cjs` régénère tout dans ce dossier :
   - ouroboros-52px-48img.png : la bande de 48 images de 52 × 52 px (le rendu fait 64 × 64, on rogne 6 px de noir tout autour), 6 gris tranchés (PNG à 4 bits, 9 Ko)
   - ouroboros.css : le bloc CSS pur à coller dans la page (data-URL de la bande, steps(48) à 60 images/s = 0,8 s par tour (2,4 s avant le 05/11 : « il tourne pas assez vite »), affiché ×2)
   - demo.html : la page de démo (?zoom=3 pour voir les pixels) ; planche-16-images.png, tete-6-angles.png, tete-dessin.png : des aperçus pour l'œil humain
   LE STYLE (05/11, Sacha : « rends-le un peu cartoon Undertale ») : pixels NETS, aplats de gris tranchés (noir, 4 gris, blanc), formes simples et épaisses, gros œil expressif, contour clair d'un pixel autour de la tête ET du corps (pics et bosses des boules compris).
   Chaque pixel vote sur 5 × 5 échantillons (le gris dominant gagne ; le blanc et le noir des détails passent avant), la lumière des formes est peinte en dégradé puis posterisée.
   LE CORPS NE TOURNE PAS : un anneau fixe, en relief (tube éclairé par l'extérieur : arête claire, ventre sombre), recouvert d'écailles en losanges, hérissé de 14 petits pics couchés vers l'arrière.
   Il est pourtant vivant : trois reflets le parcourent à contresens de la tête (un tiers de tour par boucle), et des boules de matière le traversent en le gonflant.
   LA TÊTE (~15 × 12 px avec les pics, `HS` = son échelle) tourne d'un tour complet par boucle (7,5° par image, sens horaire). Elle est PEINTE à 8 cellules par pixel dans le repère COURBE de l'anneau (a le long du fil, v vers l'extérieur) :
   crâne en dôme éclairé, écailles en losanges, 4 pics dorsaux de plus en plus petits vers la nuque, pointe de joue, arcade, GROS œil à pupille en fente (il cligne une fois par tour), narine, dents cernées de noir,
   gorge sombre où le corps entre. La mâchoire du haut pivote à la commissure (`JAW`) : deux bouchées par 12 images, la boule de matière est clampée à la seconde ; la tête recule puis se jette en avant au CLAC (`LUNGE`) ;
   les pics oscillent doucement (`sway`). Vie de dessin animé : le sourcil se lève quand la gueule s'ouvre grand et se fronce au CLAC, la tête s'écrase et s'étire au CLAC (`SQUASH`), la pupille suit la boule de matière qui arrive,
   une petite fumée gris clair sort de la narine après chaque bouchée. La fente de la gueule garde la largeur du corps quelle que soit `HS`.
   LES BOULES DE MATIÈRE : des billes sombres qui voyagent dans le corps (de l'arrière du crâne, tout le tour, jusqu'à la gueule), clampées (CLAC) puis glissées sous le crâne ; une toutes les 12 images, deux visibles à la fois.
   Miettes au CLAC, trois étincelles qui scintillent autour (fixes à l'écran). Boucle parfaite : 48 images = un tour de la tête, 4 boules, 8 bouchées, 3 reflets qui avancent d'un tiers de tour. */
const fs=require('fs'),{pngIndexed,pngRGB}=require('./png.cjs');
const N=64,F=48,FPS=60,SS=5,CX=32,CY=32,R=16,TH=4.6,HW=TH/2;
const C0=6,CS=52; /* LE CADRE LIVRÉ : on rogne les 6 px de noir autour du rendu de 64 × 64 (l'encre tient dans 7 → 56) : 52 × 52 px, 34 % de pixels en moins, la bande reste sous 16 384 px de large même à 3 pixels d'écran par pixel CSS */
const DEG=Math.PI/180,TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),sm=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k);};
const LV=[0,44,92,146,200,255],PAL=LV.map(v=>[v,v,v]); /* (2026-11-07) LA PALETTE EST POSITIVE : fond noir, serpent clair (blanc sur noir, pour le chargement de l'interface). Le NÉGATIF (noir sur fond blanc : lancement d'une partie, transitions longues) n'a PAS sa propre bande : `.serpentCh.neg{filter:invert(1)}` inverse exactement les gris (255 - v) — même image, zéro octet de plus. */
const quant=l=>{const x=clamp(l,0,1)*255;let bi=0,bd=1e9;for(let i=0;i<LV.length;i++){const d=Math.abs(LV[i]-x);if(d<bd){bd=d;bi=i;}}return bi;};
const JAW=[11,10,6,1,0,3,9,11,7,1,0,3].map(d=>d*DEG); /* l'angle dont la mâchoire du haut se relève, sur 12 images : deux bouchées (CLAC aux images 4 et 10) */
/* LE REPÈRE DE LA TÊTE : a = l'abscisse le long de l'anneau (px, vers l'avant = sens horaire), v = l'écart au fil du corps (px, vers l'extérieur = le dessus de la tête). */
const PH0=-10*DEG; /* l'angle (depuis le haut, sens horaire) du centre de la tête dans le repère du serpent */
const AM=-3; /* l'abscisse où le fil des boules s'arrête, sous le crâne (caché) */
const ringXY=(a,v)=>{const f=PH0+a/R,r=R+v;return [CX+r*Math.sin(f),CY-r*Math.cos(f)];};
const HJ=[-.2,2.35]; /* le pivot de la mâchoire du haut (la commissure) ; la fente de la gueule fait ±2,35 autour du fil du corps */
/* la silhouette de la tête (polygones en (a,v)) */
const SK=[[-5.2,-2.4],[-6,-.2],[-6,2],[-5.4,3.8],[-4.2,5],[-2.6,5.8],[-.8,6.1],[1,5.9],[2,5.6],[2,2.35],[-.2,2.35],[-.2,-2.35],[.6,-2.35],[.6,-3.8],[-1.6,-3.9],[-3.6,-3.4]];
const LOWJ=[[.2,-2.35],[6,-2.35],[6,-3.2],[5,-3.9],[3,-4.2],[.2,-4.3]]; /* la mâchoire du bas : fine, qui recule */
const UPJ=[[-.3,2.35],[6.8,2.35],[6.8,3.7],[6,4.6],[4.2,5.3],[2.2,5.8],[.6,5.9],[-.3,5]]; /* le museau : un bec court qui s'effile (dans son repère de mâchoire fermée) */
const TOP=[[-5.4,3.8],[-4.2,5],[-2.6,5.8],[-.8,6.1],[1,5.9],[2,5.6]]; /* la ligne du dos du crâne, pour planter les pics */
const topAt=a=>{if(a<=TOP[0][0])return TOP[0][1];for(let i=1;i<TOP.length;i++)if(a<=TOP[i][0]){const [a0,v0]=TOP[i-1],[a1,v1]=TOP[i];return v0+(v1-v0)*(a-a0)/(a1-a0);}return TOP[TOP.length-1][1];};
const SPIKES=[[-.4,1.9],[-2,1.7],[-3.5,1.5],[-4.8,1.1]]; /* les pics dorsaux : [abscisse, hauteur], de plus en plus petits vers la nuque */
const CHEEK=[[-5.6,1.2],[-5.5,-.9],[-7.6,-.1]]; /* la pointe de joue */
const TEETH_UP=[1.9,3.1,4.3,5.5],TEETH_LO=[2.5,3.7,4.9]; /* les dents : abscisses le long de la fente */
const inPoly=(p,a,v)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [ai,vi]=p[i],[aj,vj]=p[j];if((vi>v)!==(vj>v)&&a<(aj-ai)*(v-vi)/(vj-vi)+ai)c=!c;}return c;};
const inEll=(a,v,ca,cv,ra,rv)=>((a-ca)/ra)**2+((v-cv)/rv)**2<=1;
const tube=q=>.4+.47*Math.exp(-(((q-.32)/.68)**2))+.16*Math.exp(-(((q-.45)/.16)**2)); /* LE modèle de lumière commun : un tube éclairé par l'extérieur (q de -1 le ventre à 1 le dos) : ventre sombre, arête claire */
const HK=.58; /* la tête reprend ce modèle en un cran plus sombre (Sacha : « tête plus foncée que le corps », mais raccord) */
const frac=x=>x-Math.floor(x),edge=x=>{const f=frac(x);return sm(.16,0,Math.min(f,1-f));}; /* 1 sur une arête de losange, 0 au cœur */
/* LA TÊTE PEINTE : une texture de luminance (0 à 1) à 8 cellules par pixel dans le repère (a,v), pour une mâchoire relevée de d radians, un clignement b (0 ouvert, 1 fermé), un balancement des pics */
const GA0=-9,GA1=10.5,GV0=-6,GV1=11,RES=8,GW=Math.round((GA1-GA0)*RES),GH=Math.round((GV1-GV0)*RES);
function paintHead(d,b,t,pup,brow){
  const cd=Math.cos(d),sd=Math.sin(d),rotJ=(a,v)=>{const x=a-HJ[0],y=v-HJ[1];return [HJ[0]+x*cd+y*sd,HJ[1]-x*sd+y*cd];}; /* du monde au dessin de la mâchoire du haut (rotation −d) */
  const sway=k=>.32*Math.sin(TAU*2*t/F+k*1.1);
  const spk=SPIKES.map(([a0,h],k)=>[[a0+.95,topAt(a0+.95)-.5],[a0-.95,topAt(a0-.95)-.5],[a0-1.5+sway(k),topAt(a0)+h]]);
  const sil=(a,v,ua,uv)=>inPoly(SK,a,v)||inPoly(LOWJ,a,v)||inPoly(UPJ,ua,uv)||inPoly(CHEEK,a,v)||spk.some(p=>inPoly(p,a,v))
    ||(a>-.2&&a<1.5&&v>-2.35&&uv<2.35)||TEETH_UP.some(a0=>inPoly([[a0-.66,2.45],[a0+.66,2.45],[a0,.95]],ua,uv))||TEETH_LO.some(a0=>inPoly([[a0-.66,-2.45],[a0+.66,-2.45],[a0,-1]],a,v));
  const msk=new Uint8Array(GW*GH),lum=new Float32Array(GW*GH);
  for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const a=GA0+(i+.5)/RES,v=GV1-(j+.5)/RES,[ua,uv]=rotJ(a,v);if(sil(a,v,ua,uv))msk[j*GW+i]=1;}
  const ex=-1,ey=3.4; /* l'œil : gros, à la Undertale */
  for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const q=j*GW+i;if(!msk[q])continue;
    const a=GA0+(i+.5)/RES,v=GV1-(j+.5)/RES,[ua,uv]=rotJ(a,v),jawPart=inPoly(UPJ,ua,uv)&&!inPoly(SK,a,v),pa=jawPart?ua:a,pv=jawPart?uv:v;
    /* le dôme éclairé par le haut, le dessous dans l'ombre */
    let L=HK*tube(clamp((pv-1)/5,-1,1))+.05*Math.exp(-((((pa+1.6)/3)**2)+(((pv-4.3)/1.5)**2)));
    L*=1-.46*Math.max(edge(pa/2.3+pv/1.3),edge(pa/2.3-pv/1.3)); /* les écailles en losanges, grosses et franches */
    /* la gorge */
    if(a>-.2&&a<1.5&&v>-2.35&&uv<2.35&&!inPoly(SK,a,v))L=.07;
    /* les lèvres : un trait sombre le long de la fente */
    if(a>-.1&&a<6.9){if(Math.abs(uv-2.35)<.22&&jawPart)L=Math.min(L,.1);if(Math.abs(v+2.35)<.22&&inPoly(LOWJ,a,v))L=Math.min(L,.1);}
    /* les dents : claires, cernées de noir */
    for(const a0 of TEETH_UP){if(inPoly([[a0-.66,2.45],[a0+.66,2.45],[a0,.95]],ua,uv))L=.97;else if(inPoly([[a0-1,2.5],[a0+1,2.5],[a0,.6]],ua,uv)&&!jawPart)L=.1;}
    for(const a0 of TEETH_LO){if(inPoly([[a0-.66,-2.45],[a0+.66,-2.45],[a0,-1]],a,v))L=.97;else if(inPoly([[a0-1,-2.5],[a0+1,-2.5],[a0,-.65]],a,v)&&!inPoly(LOWJ,a,v))L=.1;}
    /* la narine */
    if(inEll(ua,uv,6.05,3.95,.45,.3))L=.05;
    /* l'arcade : un bourrelet clair au-dessus d'un trait sombre */
    if(inPoly([[-2.6,5.6+brow[0]+brow[1]],[-1,6+brow[0]],[.7,5.6+brow[0]-brow[1]],[.7,5.2+brow[0]-brow[1]],[-1,5.5+brow[0]],[-2.6,5.1+brow[0]+brow[1]]],a,v))L=.8; /* le sourcil : il se lève, se fronce */
    
    /* l'œil : orbite sombre, globe clair, pupille en fente (qui se ferme au clignement) */
    if(inEll(a,v,ex,ey,1.85,1.95))L=.06;
    const ry=1.6*(1-b)+.1;if(inEll(a,v,ex,ey,1.5,ry))L=.98;
    if(inEll(a,v,ex+.2+pup,ey,.62,Math.max(.08,1.25*(1-b))))L=.03;
    lum[q]=clamp(L,0,1);}
  return {msk,lum};
}
const HS=1.22; /* l'échelle de la tête : crâne, mâchoires, œil et pics grossissent, la fente de la gueule reste à la largeur du corps */
const hsA=(a,k)=>HJ[0]+(a-HJ[0])/(HS*k[0]),hsV=(v,k)=>Math.abs(v)<=2.35?v:Math.sign(v)*(2.35+(Math.abs(v)-2.35)/(HS*k[1]));
const headSample=(tex,a,v)=>{const i=Math.floor((a-GA0)*RES),j=Math.floor((GV1-v)*RES);if(i<0||j<0||i>=GW||j>=GH)return -1;const q=j*GW+i;return tex.msk[q]?tex.lum[q]:-1;};
const NSP=14,NSC=30,L0=TAU*R-2,S_END=.5; /* 14 pics sur le corps, 38 losanges d'écailles par tour, les boules vont de L0 à S_END */
const wrapP=(x,p)=>x-p*Math.round(x/p);
const SQUASH=[0,0,0,.35,1,.5,0,0,0,.35,1,.5]; /* l'écrasement au CLAC : la tête s'allonge et s'aplatit, puis reprend sa forme */
const LUNGE=[-.6,-.6,-.3,.6,.9,.3,-.6,-.6,-.3,.6,.9,.3]; /* le coup de tête : elle recule pour prendre son élan (gueule grande ouverte), puis se jette en avant au CLAC */
function render(t){
  const c=t%12,ph=TAU*t/F,d=JAW[c],bl=t>=38&&t<=41?[.5,1,1,.5][t-38]:0,lunge=LUNGE[c],sq=SQUASH[c],hk=[1+.09*sq,1-.08*sq];
  const wide=sm(.3,1,d/JAW[0]),brow=[.55*wide-.3*(1-wide)*sm(.5,0,d/JAW[0]),.22*(1-wide)*sm(.5,0,d/JAW[0])]; /* [hauteur, inclinaison] : levé quand la gueule s'ouvre grand, froncé au CLAC */
  const ahead=[c,c+12].map(age=>L0-(L0-S_END)*(age/24)).filter(sb=>sb>11).reduce((m,sb)=>Math.min(m,sb),99),pup=ahead<99?.4*(1-clamp((ahead-11)/45,0,1)):0; /* la pupille suit la boule qui arrive */
  const tex=paintHead(d,bl,t,pup,brow);
  const balls=[];for(const age of [c,c+12])balls.push(L0-(L0-S_END)*(age/24)); /* l'abscisse (le long du fil) de chaque boule de matière : de l'arrière du crâne à la gueule, tout le tour */
  const gl=[0,1,2].map(k=>k*TAU/3-TAU/3*(t/F)); /* les trois reflets, qui avancent à contresens de la tête (un tiers de tour par boucle) */
  const toScreen=(x,y)=>{const dx=x-CX,dy=y-CY,cp=Math.cos(ph),sp=Math.sin(ph);return [CX+dx*cp-dy*sp,CY+dx*sp+dy*cp];};
  const NL=LV.length,g=new Uint8Array(N*N),hd=new Uint8Array(N*N),bd=new Uint8Array(N*N),T=SS*SS,mode=h=>{let bi=1,bn=-1;for(let k=1;k<NL;k++)if(h[k]>bn){bn=h[k];bi=k;}return bi;};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const hc=new Uint8Array(NL),bc=new Uint8Array(NL);let nh=0,nb=0;
    for(let oy=0;oy<SS;oy++)for(let ox=0;ox<SS;ox++){
      const dx=i+(ox+.5)/SS-CX,dy=j+(oy+.5)/SS-CY,r=Math.hypot(dx,dy);
      if(r>R+11||r<R-7)continue; /* hors de la couronne de l'anneau et de la tête : noir */
      const phS=Math.atan2(dx,-dy),phN=phS-ph; /* l'angle à l'écran (le corps ne tourne pas) et dans le repère du serpent (celui de la tête et des boules) */
      const aB=wrapP((phN-PH0)*R,TAU*R),ht=headSample(tex,hsA(aB-lunge,hk),hsV(r-R,hk));if(ht>=0){hc[quant(ht)]++;nh++;continue;}
      const u=r-R,s=(((phN-PH0-AM/R)%TAU+TAU)%TAU)*R;
      let bump=0;for(const bs of balls)bump=Math.max(bump,2.1*Math.exp(-(((s-bs)/7)**2)));
      const f=frac(phS/TAU*NSP+.5)-.5,spike=1.5*Math.max(0,1-Math.abs(f+.06*Math.max(0,u-HW))/.18); /* un pic couché vers l'arrière */
      const wo=HW+Math.max(bump,spike);
      if(u<-HW||u>wo)continue;
      const q=u>=0?u/wo:u/HW; /* la section du tube, de -1 (ventre) à 1 (dos) */
      let L=tube(q)*(1-.2*Math.exp(-Math.max(0,-7.3-aB)/10)); /* le cou : le corps s'assombrit en approchant du crâne, pour que tête et corps soient un seul animal */
      const pa=phS/TAU*NSC; L*=1-.34*Math.max(edge(pa+u/1.5),edge(pa-u/1.5)); /* les écailles en losanges */
      let glow=0;for(const gk of gl){const dd=R*wrapP(phS-gk,TAU);glow=Math.max(glow,Math.exp(-((dd/3.2)**2)));}
      L+=.24*glow*(.35+.65*sm(-1,.5,q)); /* les reflets qui courent le long du corps */
      for(const bs of balls){const ds=s-bs,rho2=(ds*ds+u*u)/4;if(rho2<1){const nz=Math.sqrt(1-rho2);L=.09+.36*nz+.5*Math.exp(-(((ds+.5)**2+(u-.7)**2)/.3));}} /* la boule de matière : une bille sombre à reflet */
      bc[quant(clamp(L,0,1))]++;nb++;
    }
    const q=j*N+i;
    if(nh/T>=.45){g[q]=hc[NL-1]/nh>=.35?NL-1:hc[0]/nh>=.32?0:mode(hc);hd[q]=1;} /* la tête gagne le pixel : le blanc et le noir des détails passent avant le fond */
    else if(nb/T>=.4){g[q]=bc[NL-1]/nb>=.35?NL-1:mode(bc);bd[q]=1;}
  }
  /* LE CONTOUR : un pixel clair tout autour de la tête ET du corps (contre le noir, et la tête contre le corps), comme un trait de dessin animé ; le blanc des dents, de l'œil et des reflets reste blanc */
  {const rim=[],empty=q=>!hd[q]&&!bd[q];for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q=j*N+i;if(g[q]>3||!(hd[q]||bd[q]))continue;
    const edgeFrame=i===0||j===0||i===N-1||j===N-1;
    if(hd[q]?(edgeFrame||!hd[q-1]||!hd[q+1]||!hd[q-N]||!hd[q+N]):(edgeFrame||empty(q-1)||empty(q+1)||empty(q-N)||empty(q+N)))rim.push(q);}
    for(const q of rim)g[q]=4;}
  /* étincelles (fixes à l'écran) et miettes (au CLAC, qui tournent avec le serpent) */
  const W=LV.length-1,px=(x,y,lv=W)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<N&&y<N&&g[y*N+x]===0)g[y*N+x]=lv;};
  for(const [x,y,t0] of [[10,12,4],[54,53,20],[53,14,35]]) /* les trois étincelles, dans les coins vides du cadre rogné */{const k=(t-t0+F)%F;if(k>4)continue;
    px(x,y);if(k===1||k===3){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1);}if(k===2){for(let dd=1;dd<=2;dd++){px(x-dd,y);px(x+dd,y);px(x,y-dd);px(x,y+dd);}}}
  const cr=c>=9&&c<=11?c-9:-1;if(cr>=0)for(const [da,dv] of [[[1,3],[3.5,5]],[[2,5],[5,7]],[[3,7.5],[6.5,9]]][cr]){const [x,y]=toScreen(...ringXY(6+da,dv+1.5));px(x,y);}
  /* la fumée de la narine, après chaque CLAC : deux volutes grises qui montent et se dissipent (un clin d'œil de dragon, sobre) */
  const sk=[4,5,6,10,11,0].indexOf(c);if(sk>=0){const k=sk%3,a0=6.4*HS*hk[0],v0=2.35+(3.95-2.35)*HS*hk[1];
    for(const [da,lv] of [[0,4],[1.6,3]]){const [x,y]=toScreen(...ringXY(a0+da*(.5+k*.35)+k*.5,v0+1.2+k*1.5+da*.6));px(x,y,lv-(k>1?1:0));}}
  return {g,hd,bd};
}
function sheet(frames,scale,cols,file){const rows=Math.ceil(frames.length/cols),W=cols*(N*scale+2),H=rows*(N*scale+2),rgb=new Uint8Array(W*H*3).fill(40);
  frames.forEach((g,k)=>{const ox=(k%cols)*(N*scale+2)+1,oy=Math.floor(k/cols)*(N*scale+2)+1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const col=PAL[g[y*N+x]];for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){const p=((oy+y*scale+sy)*W+ox+x*scale+sx)*3;rgb[p]=col[0];rgb[p+1]=col[1];rgb[p+2]=col[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
function strip(frames,file){const W=CS*frames.length,idx=new Uint8Array(W*CS);frames.forEach((g,k)=>{for(let y=0;y<CS;y++)for(let x=0;x<CS;x++)idx[y*W+k*CS+x]=g[(y+C0)*N+x+C0];});const png=pngIndexed(W,CS,idx,PAL);fs.writeFileSync(file,png);return png;}
function headCrop(ts,half,sc,file){const w=half*2,cw=w*sc+3,W=ts.length*cw,H=cw,rgb=new Uint8Array(W*H*3).fill(45);
  ts.forEach((t,k)=>{const {g}=render(t),ph=TAU*t/F,[hx,hy]=ringXY(0,.5),dx=hx-CX,dy=hy-CY,cx=CX+dx*Math.cos(ph)-dy*Math.sin(ph),cy=CY+dx*Math.sin(ph)+dy*Math.cos(ph),x0=Math.round(cx-half),y0=Math.round(cy-half);
    for(let y=0;y<w;y++)for(let x=0;x<w;x++){const gx=x0+x,gy=y0+y,c=(gx<0||gy<0||gx>=N||gy>=N)?PAL[0]:PAL[g[gy*N+gx]];
      for(let a=0;a<sc;a++)for(let b=0;b<sc;b++){const p=((1+y*sc+a)*W+k*cw+1+x*sc+b)*3,e=(a===0||b===0);rgb[p]=e?58:c[0];rgb[p+1]=e?58:c[1];rgb[p+2]=e?58:c[2];}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
/* la tête peinte, à plat et en grand, pour 4 moments de la bouchée : ce que le pixel doit rendre */
function spriteSheet(file){const ds=[11,6,1,0].map(d=>d*DEG),sc=3,cw=GW*sc+4,W=ds.length*cw,H=GH*sc+2,rgb=new Uint8Array(W*H*3).fill(30);
  ds.forEach((d,k)=>{const {msk,lum}=paintHead(d,0,0,0,[0,0]);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const q=j*GW+i;if(!msk[q])continue;const v=Math.round(lum[q]*255);
    for(let a=0;a<sc;a++)for(let b=0;b<sc;b++){const p=((1+j*sc+a)*W+k*cw+1+i*sc+b)*3;rgb[p]=rgb[p+1]=rgb[p+2]=v;}}});
  fs.writeFileSync(file,pngRGB(W,H,rgb));}
module.exports={render,sheet,strip,headCrop,spriteSheet,N,F,FPS,PAL};
if(require.main===module){
  process.chdir(__dirname);
  const fr=[];for(let t=0;t<F;t++)fr.push(render(t).g);
  sheet(fr.filter((_,k)=>k%3===0),4,8,'planche-16-images.png');headCrop([0,6,12,18,24,30],12,12,'tete-6-angles.png');spriteSheet('tete-dessin.png');
  let clip=0;for(const g of fr){for(let i=0;i<CS;i++)if(g[C0*N+C0+i]||g[(C0+CS-1)*N+C0+i]||g[(C0+i)*N+C0]||g[(C0+i)*N+C0+CS-1])clip++;} /* de l'encre sur le bord du cadre rogné = on rognerait le dessin */
  const png=strip(fr,'ouroboros-52px-48img.png'),b64=png.toString('base64');
  /* LE CSS PUR : aucun JS, visible dès la première image. La bande défile par pas (steps) sur un transform : le compositeur la joue même quand le script du jeu est occupé à construire la scène. */
  const SCALE=2,D=CS*SCALE,TOT=D*F;
  const css=`#spCharge,.serpentCh{position:absolute;left:50%;top:46%;width:${D}px;height:${D}px;margin:-${D/2}px 0 0 -${D/2}px;z-index:5;pointer-events:none;overflow:hidden;contain:strict}#spCharge::before,.serpentCh::before{content:"";position:absolute;left:0;top:0;width:${TOT}px;height:${D}px;background:url("data:image/png;base64,${b64}") 0 0/100% 100% no-repeat;image-rendering:pixelated;image-rendering:crisp-edges;animation:spOuro ${F/FPS}s steps(${F}) infinite;will-change:transform}@keyframes spOuro{to{transform:translate3d(-100%,0,0)}}.serpentCh.neg{filter:invert(1)}@media(min-aspect-ratio:23/20){#spCharge,.serpentCh{top:50%}}@media(prefers-reduced-motion:reduce){#spCharge::before,.serpentCh::before{animation:none}}`;
  fs.writeFileSync('ouroboros.css',css);
  const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Ouroboros — chargement CASH CAR</title>
<style>@font-face{font-family:'Press Start 2P';src:url('../../VERSION%20PRINCIPALE/assets/fonts/pressstart2p.woff2') format('woff2')}
html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:'Press Start 2P',monospace;color:#fff}
#splash{position:fixed;inset:0;background:#000}
${css}
#spCharge{transform:scale(var(--z,1));transform-origin:50% 50%}
#leg{position:fixed;left:0;right:0;bottom:max(18px,env(safe-area-inset-bottom));text-align:center;font-size:8px;line-height:2;letter-spacing:1px;color:rgba(255,255,255,.38)}
#leg b{color:#fff;font-weight:normal}
</style></head><body><div id="splash"><div id="spCharge"></div></div>
<div id="leg">OUROBOROS · ${CS} PX · ${F} IMAGES · ${FPS} IM/S · CSS PUR · ${(b64.length/1024).toFixed(1)} KO<br><b>?zoom=3</b> POUR VOIR LES PIXELS</div>
<script>const z=+new URLSearchParams(location.search).get('zoom');if(z>0)document.getElementById('spCharge').style.setProperty('--z',z);</script>
</body></html>`;
  fs.writeFileSync('demo.html',html);
  console.log('bande',png.length,'octets · css',css.length,'octets · pixels allumés sur le bord :',clip);
}
