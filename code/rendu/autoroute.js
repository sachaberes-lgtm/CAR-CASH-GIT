/* ===== L'AUTOROUTE VIVANTE (2026-11-13, Sacha, devant les quatre maquettes : « ma préférée c'est la C, celle qu'on garde de base ; après, en
   fonction des maps et des fois, un mélange de tout un peu, par segments ; des variations smooth, qu'on fasse pas vraiment la différence mais
   qu'on se dise « ah, des fois la route elle est différente » ; discret, sobre ; deviens artiste ») =====
   LA BASE, la C (« 95 EXPRESS », Miami) : bord gauche jaune plein, bord droit blanc plein ; à gauche deux voies EXPRESS derrière une double
   ligne blanche hérissée de poteaux orange flexibles ; puis huit voies ; tirets de 3 m tous les 12 m (les 10-30 pieds de la Floride) suivis
   d'une ombre noire sur le béton ; un plot réfléchissant au milieu de chaque vide ; bandes rugueuses sur les accotements.
   LA ROUTE VIVANTE : la piste se découpe en PALIERS (1,3 à 3 km) reliés par des TRANSITIONS longues (350 à 650 m, en douceur) qui ne
   changent qu'UNE chose à la fois, comme une vraie autoroute :
     · une voie naît à droite ou s'y referme (des flèches de rabattement la préviennent) — à 11 voies, c'est la A ;
     · les voies express finissent (la double ligne se resserre en un simple tiret) ou reviennent (« EXPRESS » peint au sol) ;
     · un ACCÈS : quelques centaines de mètres où la double ligne se fait tirets et où les poteaux s'interrompent ;
     · l'ÎLOT : la double ligne s'écarte en un îlot hachuré de chevrons (le terre-plein de la B), puis se resserre ;
     · le TERRE-PLEIN : un îlot hachuré s'ouvre au milieu des voies (la B), puis se referme ;
     · le GRAND LARGE : moins de voies, tirets longs (9 m sur 36), traits plus gras, DORÉS sur les maps à la signature (la D) ;
     · les LIGNES PLEINES : un tronçon où l'on ne change pas de voie.
   La peinture vit aussi, à chaque reprise de chaussée : plus ou moins usée (et chaque tiret son âge), ombre noire (béton) ou non (bitume),
   plots plus ou moins complets, bandes rugueuses ou non. Les plots sont ROUGES vus à contresens (les vrais plots de Floride).
   CHAQUE MAP A SON CARACTÈRE (AR_CARTES) : le canyon, peinture crème brûlée de soleil, peu d'express, souvent le grand large ; la ville,
   Miami : express, accès, poteaux ; la grotte, un tunnel : lignes pleines, plots partout, pas d'express ; l'orbite, neuve et froide ; la jade,
   pâle et discrète ; les dunes, argentées et ensablées…  ET JAMAIS LA MÊME ROUTE : le scénario se tire d'une graine dérivée de celle de la
   piste (le tirage rnd() de la piste n'en perd pas un pas : même piste, même route, bâtie d'avance ou au passage).
   MÉCANIQUE : un ruban par trait, seulement là où le trait existe (des courses de rangées) ; son décalage, sa largeur, son motif, sa couleur et
   son usure varient le long de la route. Le motif se calcule dans le shader : un créneau FILTRÉ (la largeur du filtre = le pas du pixel ou la
   route parcourue pendant l'image, comme LES TIRETS FILENT) : ni scintillement au loin, ni bégaiement à grande vitesse. Le dessous de la dalle
   porte les mêmes traits, en blanc. Les poteaux : une instance par poteau ; ils PLIENT quand la caisse les frôle (shader, aucun calcul par image).
   `?autoroute=0` : la route d'avant (la ligne centrale) ; `?autoroute=fige` : la C seule, sans variation ; `?argraine=n` : un autre scénario.
   Banc : dbgAutoroute() (le scénario de la piste), dbgAutoroute('profil',pas), dbgAutoroute('aller',s,lat), dbgAutoroute(0|1) ;
   outils/banc-autoroute/. */
const AR_ON=!/[?&]autoroute=0\b/.test(location.search),AR_FIGE=/[?&]autoroute=fige\b/.test(location.search),
  AR_GRAINE=+((/[?&]argraine=(\d+)/.exec(location.search)||[])[1]||0);
const AR_U={uTrav:{value:0},uNuit:{value:0},uCar:{value:new THREE.Vector3(0,-1e6,0)}};
const AR={plans:[],atlas:null,poteau:null,sg:-1,vis:true}; /* sg : une latérale NÉGATIVE est à DROITE de la caisse (banc du 13/11) ; les plans s'écrivent « négatif = à gauche » */
const AR_CARTES={ /* le caractère de chaque map : base (N voies dont 2 express si exp), poids des événements, peinture */
  defaut:{N:10,exp:1,style:'fl',Nmin:7,Nmax:11,Nlarge:8,seg:[850,2000],retouche:.35,
    w:{calme:.8,voie:1,express:.7,acces:.8,ilot:.6,centre:.7,large:.55,plein:.45},
    peint:{b:0xf3f1ea,j:0xf3c13a,o:0xffd75e,op:.88},usure:[.8,.95],contraste:.5,gronde:.5,plots:.9,or:false},
  nuages:{or:true},
  orage:{usure:[.72,.9],contraste:.4,plots:.95,or:true},
  canyon:{N:9,peint:{b:0xefe4d0,j:0xe2a63a,o:0xf2c25a,op:.84},usure:[.6,.84],contraste:.15,gronde:.85,plots:.6,or:true,
    w:{express:.35,acces:.4,large:1.3,voie:1.3,centre:.5}},
  jade:{peint:{b:0xe4eee6,j:0xe6cf7e,o:0xf2b93b,op:.64},usure:[.82,.94],contraste:.55,gronde:.25,plots:.5,or:true,w:{centre:1.3,ilot:1,large:.7}},
  ville:{peint:{b:0xf6f4ee,j:0xf5c542,o:0xffd75e,op:.92},usure:[.86,.97],contraste:.25,gronde:.15,plots:1,w:{express:1.2,acces:1.4,ilot:.9,large:.25,plein:.6}},
  espace:{peint:{b:0xeef4f8,j:0xf0d48a,o:0xffe08a,op:.86},usure:[.93,1],contraste:0,gronde:0,plots:.75,or:true,w:{large:1.3,centre:1.1,plein:.8,express:.6}},
  dunes:{N:9,peint:{b:0xe6e3dc,j:0xdcc37e,o:0xe8cf8a,op:.8},usure:[.55,.8],contraste:0,gronde:.45,plots:.5,or:true,w:{large:1.4,voie:1.2,express:.4}},
  grotte:{N:8,exp:0,style:'plein',peint:{b:0xe2dfd6,j:0xd6b040,o:0xe0c070,op:.82},usure:[.62,.82],contraste:.3,gronde:0,plots:1,
    w:{express:0,acces:0,ilot:0,large:.35,plein:1.6,centre:.4}},
  banquise:{peint:{b:0xf2f5f8,j:0xf0c040,o:0xffd75e,op:.78},usure:[.5,.75],contraste:0,gronde:.3,plots:.6,or:true}
};
function arPerso(id){const D=AR_CARTES.defaut,P=AR_CARTES[id]||{},o=Object.assign({},D,P);o.w=Object.assign({},D.w,P.w||{});o.peint=Object.assign({},D.peint,P.peint||{});o.id=id||'';return o;}
/* ----- LE SCÉNARIO : des paliers et des transitions ; un seul changement à la fois ; plus on s'éloigne de la base, plus on y revient ----- */
function arChoix(st,P,base,R){
  const w=P.w,E=[],ajoute=function(e,x){if(x>0)E.push(e,x);},dN=st.N-base.N,large=st.style==='long';
  ajoute('calme',w.calme);ajoute('peinture',P.retouche*.6);
  if(!st.isl){ajoute('voie+',w.voie*(st.N<P.Nmax?1:0)*(dN<0?2.4:dN>0?.3:1)*(large?.3:1));
    ajoute('voie-',w.voie*(st.N>P.Nmin?1:0)*(dN>0?2.4:dN<0?.3:1)*(large?1.5:1));}
  if(st.exp&&st.buf==='pot'){ajoute('express-',w.express*(base.exp?.45:2));ajoute('acces',w.acces);ajoute('ilot',w.ilot);}
  if(!st.exp&&st.N>=7)ajoute('express+',w.express*(base.exp?2.4:.5));
  if(!st.isl&&st.N-(st.exp?2:0)>=5)ajoute('centre+',w.centre*.8);
  if(st.isl)ajoute('centre-',w.centre*2.6+.4);
  if(st.style==='fl'&&!st.isl)ajoute('large',w.large*1.5); /* le GRAND LARGE : deux voies se referment à droite et les tirets s'allongent */
  if(st.style==='long'&&!st.isl)ajoute('large-',w.large*1.6+.5);
  if(st.style!=='long')ajoute('plein',w.plein);
  let t=0;for(let i=1;i<E.length;i+=2)t+=E[i];let x=R()*t;
  for(let i=0;i<E.length;i+=2){x-=E[i+1];if(x<=0)return E[i];}
  return 'calme';}
function arTrans(ev,R){const r=function(a,b){return a+(b-a)*R();}; /* la longueur de la transition (m) */
  return ev==='voie+'||ev==='voie-'||ev==='large'||ev==='large-'?r(460,680):ev==='express+'||ev==='express-'?r(380,560):ev==='ilot'||ev==='ilot-'?r(320,480):
    ev==='centre+'||ev==='centre-'?r(360,540):ev==='calme'||ev==='peinture'?60:ev==='acces'||ev==='acces-'?14:10;}
function arApplique(ev,st,P,R){const n=Object.assign({},st);
  if(ev==='voie+')n.N++;else if(ev==='voie-')n.N--;
  else if(ev==='express-')n.exp=0;
  else if(ev==='express+'){n.exp=1;n.buf='pot';n.bw=1.4;}
  else if(ev==='acces')n.buf='ouv';else if(ev==='acces-')n.buf='pot';
  else if(ev==='ilot'){n.buf='ilot';n.bw=4.4+1.8*R();}else if(ev==='ilot-'){n.buf='pot';n.bw=1.4;}
  else if(ev==='centre+'){n.isl=1;n.iw=3.4+1.8*R();const g=st.exp?2:0;n.m=Math.max(3,g+Math.max(1,Math.round((st.N-g)/2)));}
  else if(ev==='centre-')n.isl=0;
  else if(ev==='large'){n.style='long';n.N=Math.max(P.Nmin,Math.min(st.N-1,P.Nlarge));}else if(ev==='large-'){n.style='fl';n.N=Math.max(st.N,P.N);}
  else if(ev==='plein'){n.style0=st.style;n.style=st.style==='plein'?'fl':'plein';}
  else if(ev==='plein-')n.style=st.style0||P.style;
  const lw=(56-6-(n.exp?n.bw:0)-(n.isl?n.iw:0))/n.N; /* (les plans s'écrivent pour la route de 56 m ; ils s'étirent avec elle) */
  if(lw<3.7||lw>9.5)return null;
  if(n.isl&&(n.m>=n.N||n.m<3))return null;
  return n;}
function arPlanBatit(seed,Lm,H,id,sEnt){
  const P=arPerso(id),R=mulberry32(((seed|0)^0x2545F491^Math.imul(AR_GRAINE|0,0x9E3779B1))>>>0),rr=function(a,b){return a+(b-a)*R();};
  const base={N:P.N,exp:P.exp,buf:'pot',bw:1.4,isl:0,iw:0,m:0,style:P.style,style0:P.style};
  const peint=function(){return {u:rr(P.usure[0],P.usure[1]),c:R()<P.contraste?1:0,g:R()<P.gronde?1:0,p:P.plots*(.82+.18*R())};};
  const vC=70+((typeof lvPiste==='function'?lvPiste():1)-1)*100, /* MODS va de 60 m avant la figure à une croisière (vC9) après : on ne garde que la FIGURE elle-même */
    mods=(typeof MODS!=='undefined'&&MODS?MODS:[]).map(function(m){return [m.s0+60,Math.max(m.s0+60,m.s1-vC)];}).sort(function(a,b){return a[0]-b[0];});
  const K=[{s0:-1,s1:0,st:base,pe:peint(),ev:'depart'}],plan={K:K,P:P,base:base,mods:mods,L:Lm,H:H,seed:seed|0,id:id||'',sEnt:sEnt||0};
  if(AR_FIGE)return plan;
  let st=base,pe=K[0].pe,s=Math.max(0,sEnt||0)+rr(900,1700),force=null,garde=0;
  while(garde++<400){
    const ev=force||arChoix(st,P,base,R),T=arTrans(ev,R);
    if(s+T>Lm-450)break;
    const nx=arApplique(ev,st,P,R);if(!nx){s+=150;force=null;continue;}
    force=null;const pe2=(ev==='peinture'||((ev==='calme'||ev==='voie+'||ev==='voie-'||ev==='express+'||ev==='express-')&&R()<P.retouche))?peint():pe; /* la chaussée se refait aux grands changements, jamais au milieu d'un épisode */
    K.push({s0:s,s1:s+T,st:nx,pe:pe2,ev:ev});st=nx;pe=pe2;s+=T;
    if(ev==='acces'){force='acces-';s+=rr(240,460);}
    else if(ev==='ilot'){force='ilot-';s+=rr(520,1150);}
    else if(ev==='plein'){force='plein-';s+=rr(380,760);}
    else if(ev==='large'){force='large-';s+=rr(1000,2000);} /* le grand large et le terre-plein sont des ÉPISODES : la base revient */
    else if(ev==='centre+'){force='centre-';s+=rr(700,1600);}
    else s+=rr(P.seg[0],P.seg[1]);
  }
  return plan;}
/* ----- L'ÉTAT EN UN POINT (s) : les voies ouvertes, la double ligne, l'îlot, le style, la peinture — en douceur dans les transitions ----- */
function arEtat(plan,sv,E,cur){
  const K=plan.K;let j=cur.j;
  while(j+1<K.length&&K[j+1].s0<=sv)j++;
  while(j>0&&K[j].s0>sv)j--;
  cur.j=j;
  const B=K[j].st,pB=K[j].pe;let A=B,pA=pB,t=1,tl=1;
  if(j>0&&sv<K[j].s1){A=K[j-1].st;pA=K[j-1].pe;tl=Math.min(1,Math.max(0,(sv-K[j].s0)/Math.max(1,K[j].s1-K[j].s0)));t=tl*tl*(3-2*tl);}
  for(let i=1;i<=plan.P.Nmax;i++)E.o[i]=(A.N>=i?1:0)*(1-t)+(B.N>=i?1:0)*t;
  const bA=A.exp?A.bw:0,bB=B.exp?B.bw:0;E.buf=bA*(1-t)+bB*t;
  E.kind=!A.exp?B.buf:!B.exp?A.buf:(t<.5?A.buf:B.buf);
  E.postes=((A.exp?A.buf==='pot':true)&&(B.exp?B.buf==='pot':true)&&E.buf>1.15&&E.buf<1.6)?1:0; /* les poteaux : seulement sur la double ligne étroite */
  const iA=A.isl?A.iw:0,iB=B.isl?B.iw:0;E.isl=iA*(1-t)+iB*t;E.m=A.isl?A.m:B.m;
  E.style=t<.5?A.style:B.style;
  E.u=pA.u+(pB.u-pA.u)*tl;E.c=pA.c+(pB.c-pA.c)*tl;E.g=pA.g+(pB.g-pA.g)*tl;E.p=pA.p+(pB.p-pA.p)*tl;
  E.mod=0; /* (les FIGURES couvrent jusqu'aux deux tiers d'une piste des nuages : la route y vit comme ailleurs) */
}
/* ----- LA COUPE EN TRAVERS : la place (m, négatif = à gauche) et la nature de chaque trait. Un emplacement par trait possible :
   0 le bord gauche ; 2i-1 la ligne entre les voies i et i+1 ; 2i son double (la droite de la double ligne ou de l'îlot) ; 2·Nmax−1 le bord droit. ----- */
function arCoupe(plan,E,O){
  const P=plan.P,H=plan.H,kH=plan.kH,Nm=P.Nmax,sh=3*kH,buf=E.buf*kH,isl=E.isl*kH,op=P.peint.op*E.u;
  let so=0;for(let i=1;i<=Nm;i++)so+=E.o[i];
  const u=(2*H-2*sh-buf-isl)/Math.max(.001,so),sc=E.style==='long'?3:E.style==='plein'?1:2,or=plan.or&&sc===3;
  O.k.fill(0);O.zb=0;O.zi=0;
  let x=-H+sh;
  O.x[0]=x;O.hw[0]=.11;O.k[0]=1+4;O.a[0]=op;O.c[0]=0;O.p[0]=E.p; /* le bord gauche : jaune plein, plots jaunes */
  for(let i=1;i<Nm;i++){
    x+=E.o[i]*u;
    let gap=0,plein=1,bufI=false;
    if(i===2&&buf>0){gap=buf;plein=E.kind==='ouv'?0:1;bufI=true;}
    else if(isl>0&&i===E.m)gap=isl;
    const a=2*i-1,b=2*i;
    if(E.o[i+1]<=.015){x+=gap;continue;} /* la voie de droite est fermée : le trait suivant (le bord) la représente */
    if(gap>.06){const cd=plein?1:2;
      O.x[a]=x;O.hw[a]=.09;O.k[a]=cd;O.a[a]=op;O.c[a]=0;O.p[a]=0;
      O.x[b]=x+gap;O.hw[b]=.09;O.k[b]=cd;O.a[b]=op;O.c[b]=0;O.p[b]=0;
      if(bufI)O.pb=x+gap*.5;
      if(gap>1.7){if(bufI){O.zb=1;O.zbx=x+gap*.5;O.zbw=gap*.5-.24;}else{O.zi=1;O.zix=x+gap*.5;O.ziw=gap*.5-.24;}} /* les chevrons de l'îlot */
      x+=gap;}
    else{O.x[a]=x+gap*.5;O.hw[a]=sc===3?.15:.1;O.k[a]=sc+(or?8:0);O.a[a]=op;O.c[a]=sc===2?E.c:0;O.p[a]=E.p;x+=gap;}
  }
  const e=2*Nm-1;O.x[e]=H-sh;O.hw[e]=.11;O.k[e]=1;O.a[e]=op;O.c[e]=0;O.p[e]=0; /* le bord droit : blanc plein */
  O.rg=E.g;O.rx0=-H+sh-.45;O.rx1=H-sh+.45;O.op=op;
}
function arVoie(plan,E,j){ /* le milieu (m) et la largeur de la voie j (1 = la plus à gauche) */
  const P=plan.P,H=plan.H,kH=plan.kH,Nm=P.Nmax,sh=3*kH,buf=E.buf*kH,isl=E.isl*kH;let so=0;for(let i=1;i<=Nm;i++)so+=E.o[i];
  const u=(2*H-2*sh-buf-isl)/Math.max(.001,so);let x=-H+sh;
  for(let i=1;i<j;i++){x+=E.o[i]*u;if(i===2)x+=buf;if(isl>0&&i===E.m)x+=isl;}
  return [x+E.o[j]*u*.5,E.o[j]*u];}
/* ----- LES MATIÈRES ----- */
const AR_GLSL_F='highp float arF(highp float t,float a,float b){return floor(t)*(b-a)+clamp(fract(t)-a,0.,b-a);}\n'+
  'float arPulse(highp float t,float a,float b,float w){w=max(w,1e-4);return clamp((arF(t+w*.5,a,b)-arF(t-w*.5,a,b))/w,0.,1.);}\n'+
  'float arH(float n){return fract(sin(n*12.9898)*43758.5453);}\n';
function arLignesMat(P){ /* les traits : peinture (pleine, tirets 3/12 m, tirets longs 9/36 m), ombre noire, plots — tout dans le shader */
  const m=traitMat(new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),1.15,2);
  m.extensions={derivatives:true};
  const pal=[P.peint.b,P.peint.j,P.peint.o,0x050506,0xffffff,0xffd24a,0xff2a1e].map(function(h){return new THREE.Color(h);});
  const ob=m.onBeforeCompile;
  m.onBeforeCompile=function(sh){ob(sh);
    sh.uniforms.uArPal={value:pal};sh.uniforms.uArTrav=AR_U.uTrav;sh.uniforms.uArNuit=AR_U.uNuit;
    sh.vertexShader=sh.vertexShader.replace('attribute vec3 aLat;','attribute vec4 aLatQ;attribute float aV;attribute vec4 aK;varying highp float vArV;varying vec4 vArK;vec3 aLat;')
      .replace('void main() {','void main() {\n\taLat=aLatQ.xyz*(aLatQ.w*.5);vArV=aV;vArK=aK;');
    sh.fragmentShader='uniform vec3 uArPal[7];uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArK;\n'+AR_GLSL_F+sh.fragmentShader.replace('#include <color_fragment>',
      '{float k9=floor(vArK.x*255.+.5),cd=mod(k9,4.),ci=floor(k9/4.),per=cd>2.5?36.:12.;highp float t=vArV/per;float w=max(fwidth(t),uArTrav/per);'+
      'float cw=cd<1.5?1.:arPulse(t,0.,.25,w),cb=cd>1.5&&cd<2.5?arPulse(t,.25,.5,w)*vArK.z:0.;'+ /* le tiret au début de chaque période, l'ombre noire juste derrière */
      'float dn=floor(t),us=vArK.y*(.84+.16*arH(dn+ci*17.3));'+ /* chaque tiret son âge */
      'vec3 pc=(ci<.5?uArPal[0]:ci<1.5?uArPal[1]:uArPal[2])*(1.-.4*uArNuit);'+
      'float a=cw*us,ab=cb*.8*(1.-a);vec3 c=pc*a+uArPal[3]*ab;float A=a+ab;'+
      'if(vArK.w>.004){float pp=cd<1.5?24.:per;highp float tp=vArV/pp;float o=cd<1.5?.5:(vArK.z>.5?.75:.625),d=.24/pp;'+ /* le plot : au milieu du vide (ou tous les 24 m sur un trait plein) */
      'float cp=arPulse(tp,o-d*.5,o+d*.5,max(fwidth(tp),uArTrav/pp))*step(arH(floor(tp)*1.31+ci*7.7),vArK.w);'+ /* il en manque, selon l'usure */
      'float sv9=dFdy(vArV);vec3 qc=mix(ci>.5&&ci<1.5?uArPal[5]:uArPal[4],uArPal[6],step(sv9,-.5*fwidth(vArV)))*(1.+.7*uArNuit);'+ /* rouge vu à contresens */
      'c=c*(1.-cp)+qc*cp;A=A+cp*(1.-A);}'+
      'diffuseColor.rgb=A>1e-4?c/A:pc;diffuseColor.a*=A;}');};
  m.customProgramCacheKey=function(){return 'arLignes';};
  return m;}
function arZoneMat(P,ilot){ /* les chevrons de l'îlot (blancs) ou les sillons des bandes rugueuses (sombres) : aI = (travers ±1, demi-largeur, s, force) */
  const m=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  m.extensions={derivatives:true};const col=new THREE.Color(ilot?P.peint.b:0x050506);
  m.onBeforeCompile=function(sh){sh.uniforms.uArC={value:col};sh.uniforms.uArTrav=AR_U.uTrav;sh.uniforms.uArNuit=AR_U.uNuit;
    sh.vertexShader='attribute vec4 aI;varying highp vec4 vArI;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvArI=aI;');
    sh.fragmentShader='uniform vec3 uArC;uniform float uArTrav,uArNuit;varying highp vec4 vArI;\n'+AR_GLSL_F+sh.fragmentShader.replace('#include <color_fragment>',ilot?
      '{float xm=vArI.x*vArI.y;highp float t=(vArI.z-abs(xm))/7.;float c=arPulse(t,0.,.07,max(fwidth(t),uArTrav/7.));'+ /* des chevrons à 45°, la pointe vers la caisse */
      'diffuseColor=vec4(uArC*(1.-.4*uArNuit),c*vArI.w*(.84+.16*arH(floor(t))));}':
      '{highp float t=vArI.z/.55;float c=arPulse(t,0.,.5,max(fwidth(t),uArTrav/.55));diffuseColor=vec4(uArC,c*vArI.w);}');};
  m.customProgramCacheKey=function(){return ilot?'arIlot':'arGronde';};
  return m;}
function arAtlas(){ /* les mots et les flèches peints au sol (une toile 512 × 512 : EXPRESS à gauche, la flèche de rabattement à droite) */
  if(AR.atlas)return AR.atlas;
  const cv=document.createElement('canvas');cv.width=512;cv.height=512;
  const dessine=function(){const c=cv.getContext('2d');c.clearRect(0,0,512,512);c.fillStyle='#fff';
    c.save();c.textAlign='center';c.textBaseline='alphabetic';c.font='32px "Press Start 2P",monospace';c.translate(128,500);c.scale(1,13.6);c.fillText('EXPRESS',0,0);c.restore();
    c.save();c.translate(384,0);c.lineCap='butt';c.lineJoin='round';c.strokeStyle='#fff';c.lineWidth=30; /* la flèche : une hampe qui monte puis s'incline vers la gauche */
    c.beginPath();c.moveTo(18,508);c.lineTo(18,250);c.bezierCurveTo(18,170,-40,120,-58,70);c.stroke();
    c.beginPath();c.moveTo(-90,96);c.lineTo(-74,12);c.lineTo(-16,74);c.closePath();c.fill();c.restore();};
  dessine();
  const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(ALLEGE?4:8,renderer.capabilities.getMaxAnisotropy());
  try{if(document.fonts&&!document.fonts.check('32px "Press Start 2P"'))document.fonts.load('32px "Press Start 2P"').then(function(){dessine();t.needsUpdate=true;});}catch(e){}
  AR.atlas=t;return t;}
function arDecalMat(P){const m=new THREE.MeshBasicMaterial({map:arAtlas(),color:P.peint.b,transparent:true,opacity:P.peint.op*.95,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  m.onBeforeCompile=function(sh){sh.uniforms.uArNuit=AR_U.uNuit;sh.fragmentShader='uniform float uArNuit;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=1.-.4*uArNuit;');};
  m.customProgramCacheKey=function(){return 'arDecal';};return m;}
function arPoteauGeo(){ /* un poteau flexible de 95 Express : 9 cm de côté, 80 cm de haut, orange à deux bandes blanches réfléchissantes */
  if(AR.poteau)return AR.poteau;
  const bandes=[[0,.56,1],[.56,.66,0],[.66,.8,1]], /* (léger : 26 triangles) */P9=[],C9=[],I9=[],r=.045,co=[[-r,-r],[r,-r],[r,r],[-r,r]];
  const or9=[.93,.42,.13],bl=[.95,.95,.92];
  for(const b of bandes){const c=b[2]?or9:bl,v0=P9.length/3;
    for(const y of [b[0],b[1]])for(const q of co){P9.push(q[0],y,q[1]);C9.push(c[0],c[1],c[2]);}
    for(let k=0;k<4;k++){const a=v0+k,b2=v0+(k+1)%4,c2=a+4,d2=b2+4;I9.push(a,b2,d2,a,d2,c2);}}
  const v0=P9.length/3;for(const q of co){P9.push(q[0],.8,q[1]);C9.push(or9[0],or9[1],or9[2]);}I9.push(v0,v0+1,v0+2,v0,v0+2,v0+3);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C9,3));g.setIndex(I9);
  AR.poteau=g;return g;}
function arPoteauMat(){const m=new THREE.MeshBasicMaterial({vertexColors:true});
  m.onBeforeCompile=function(sh){sh.uniforms.uArCar=AR_U.uCar;sh.uniforms.uArNuit=AR_U.uNuit;
    sh.vertexShader='uniform vec3 uArCar;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+
      '{vec3 o9=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]),d9=o9-uArCar;'+ /* ILS PLIENT : la caisse à moins de 2,4 m couche le poteau loin d'elle */
      'vec3 l9=vec3(dot(d9,vec3(instanceMatrix[0])),dot(d9,vec3(instanceMatrix[1])),dot(d9,vec3(instanceMatrix[2])));'+
      'float r9=length(l9.xz),k9=(1.-smoothstep(.5,2.4,r9))*(1.-smoothstep(1.5,3.,abs(l9.y)));vec2 u9=r9>.001?l9.xz/r9:vec2(0.,1.);'+
      'float a9=k9*1.3,y9=transformed.y;transformed.xz+=u9*sin(a9)*y9;transformed.y=y9*cos(a9);}');
    sh.fragmentShader='uniform float uArNuit;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+
      'diffuseColor.rgb*=mix(1.-.45*uArNuit,1.+.3*uArNuit,step(.8,diffuseColor.b));');};
  m.customProgramCacheKey=function(){return 'arPoteau';};return m;}
/* ----- LE PEINTRE : appelé par la construction de la piste (depart-avance), après la ligne centrale ----- */
function arMaille(nom,g,mat,ordre){sphere9(g);g.boundingSphere.radius+=20;memLibere(g);
  const m=new THREE.Mesh(g,mat);m.name=nom;m.renderOrder=ordre;m.updateMatrix();m.matrixAutoUpdate=false;
  trackMeshes.push(m);PISTE_LOD.push({hi:m,lo:null,mo:null,s:g.boundingSphere,loin:false,et:0});return m;}
function arMaille2(nom,gHi,gMo,mat,a,b){ /* a, b (2026-11-13) : ses points de piste — LA TRANCHE MOYENNE PAR L'ABSCISSE (piste-prebati.js) */ /* la tranche fine (de près) et sa MOYENNE (une rangée sur quatre, au-delà de PISTE_MOY_D) : pisteLoin les échange, et cache les deux au-delà du brouillard */
  const fab=function(g,n){sphere9(g);g.boundingSphere.radius+=20;memLibere(g);const m=new THREE.Mesh(g,mat);m.name=n;m.renderOrder=1;m.updateMatrix();m.matrixAutoUpdate=false;trackMeshes.push(m);return m;};
  const hi=fab(gHi,nom);let mo=null;if(gMo){mo=fab(gMo,nom+' moyen');mo.visible=false;mo.userData.moyenne=true;}
  PISTE_LOD.push({hi:hi,lo:null,mo:mo,s:gHi.boundingSphere,loin:false,et:0,a:a,b:b});return hi;}
function* arPeint(seed,id,sEnt){
  if(!AR_ON)return;
  const H=ROAD_HALF;if(!(H>0)||H>40)return; /* (la piste de glace, 123-196 m, reste nue) */
  let cpu=0,tMax=0,tA=performance.now();const pause=function(){const d9=performance.now()-tA;cpu+=d9;if(d9>tMax)tMax=d9;}; /* tMax : la plus longue tranche (le pré-bâti n'a que 3 à 6 ms par image) */const reprise=function(){tA=performance.now();};
  const plan=arPlanBatit(seed,L,H,id,sEnt);plan.kH=Math.max(.7,Math.min(1.6,H/28));plan.or=!!plan.P.or&&routeSig();
  AR.plans.push(plan);if(AR.plans.length>3)AR.plans.shift();
  AR_U.uNuit.value=+LVL.nuit||0;
  const P=plan.P,Nm=P.Nmax,S=2*Nm,np=Math.ceil(NP/2),ds=L/Math.max(1,NP-1),CHR=Math.max(60,Math.round(PISTE_CH/4)),sg=AR.sg,TH=THICK,FACES=ALLEGE?[0]:[0,1];
  const matL=arLignesMat(P),matI=arZoneMat(P,true),matG=arZoneMat(P,false),matD=arDecalMat(P),matP=arPoteauMat();
  plan.mats=[matL,matI,matG,matD,matP];for(const m of plan.mats)m.visible=AR.vis;
  const E={o:new Float32Array(Nm+2)},O={x:new Float32Array(S),hw:new Float32Array(S),k:new Uint8Array(S),a:new Float32Array(S),c:new Float32Array(S),p:new Float32Array(S)},cur={j:0};
  const st={verts:0,octets:0,mailles:0,poteaux:0,mots:0,fleches:0,segments:plan.K.length};
  const trou=function(i){return !!(TROU&&(TROU[i]||TROU[Math.min(NP-1,i+1)]));};
  for(let c=0;c*CHR<np-1;c++){
    const r0=c*CHR,r1=Math.min(np-1,(c+1)*CHR),nr=r1-r0+1;
    const X=new Float32Array(nr*S),HW=new Float32Array(nr*S),KK=new Uint8Array(nr*S),A=new Float32Array(nr*S),C=new Float32Array(nr*S),PP=new Float32Array(nr*S);
    const ZB=new Float32Array(nr*3),ZI=new Float32Array(nr*3),RG=new Float32Array(nr),RX=new Float32Array(2);
    for(let r=0;r<nr;r++){const sv=(r0+r)*2*ds;arEtat(plan,sv,E,cur);arCoupe(plan,E,O);
      X.set(O.x,r*S);HW.set(O.hw,r*S);KK.set(O.k,r*S);A.set(O.a,r*S);C.set(O.c,r*S);PP.set(O.p,r*S);
      if(O.zb){ZB[r*3]=O.zbx;ZB[r*3+1]=O.zbw;ZB[r*3+2]=O.op;}if(O.zi){ZI[r*3]=O.zix;ZI[r*3+1]=O.ziw;ZI[r*3+2]=O.op;}
      RG[r]=O.rg;RX[0]=O.rx0;RX[1]=O.rx1;
      if((r&63)===63){pause();yield;reprise();}} /* (des tranches courtes : le pré-bâti n'a que quelques ms par image) */
    pause();yield;reprise();
    /* les courses : des rangées consécutives d'un même trait, de même motif et même couleur, sans trou */
    const courses=[];
    for(let q=0;q<S;q++){let d=-1,kd=0;
      for(let r=0;r<nr;r++){const k=KK[r*S+q],coupe=r>0&&trou(2*(r0+r-1));
        if(d>=0){
          if(coupe||!k){if(r-1>d)courses.push(q,d,r-1,kd);d=-1;} /* le trait s'arrête à la rangée d'avant (ou un trou coupe la route) */
          else if(k!==kd){if(r>d)courses.push(q,d,r,kd);d=r;kd=k;continue;}} /* le motif change : la course d'avant va jusqu'ici, la neuve en repart (pas de jour) */
        if(d<0&&k){d=r;kd=k;}}
      if(d>=0&&nr-1>d)courses.push(q,d,nr-1,kd);}
    /* chaque tranche en DEUX finesses : toutes les rangées (de près) et une sur quatre (la MOYENNE, au-delà de 400 m : PISTE_LOD les échange) */
    const rangs=function(a,b,pas){if(pas===1){const R9=[];for(let r=a;r<=b;r++)R9.push(r);return R9;}
      const R9=[a];for(let r=a+1;r<b;r++)if((r0+r)%pas===0)R9.push(r);R9.push(b);return R9;};
    const fabL=function(pas){const RR=[];let nv=0; /* le dessous de la dalle : seulement sur l'ordinateur (on n'y roule presque jamais) */
      for(let i=0;i<courses.length;i+=4){const R9=rangs(courses[i+1],courses[i+2],pas);RR.push(R9);nv+=2*R9.length*FACES.length;}
      if(!nv)return null;
      const pos=new Float32Array(nv*3),lq=new Int8Array(nv*4),av=new Float32Array(nv),ak=new Uint8Array(nv*4),ix=[];let v=0;
      for(const dess of FACES){const h=dess?-TH-.05:.05;
        for(let i=0,ci=0;i<courses.length;i+=4,ci++){const q=courses[i],k0=courses[i+3],R9=RR[ci],v0=v,k=dess?(k0&3):k0; /* dessous : tout en blanc, sans ombre ni plot */
          for(const r of R9){const pi=Math.min(NP-1,2*(r0+r)),p=pts[pi],bb=B[pi],nn=Nn[pi],o=r*S+q,lat=sg*X[o],hw=HW[o];
            for(let sd=-1;sd<=1;sd+=2){const l=lat+sd*hw;
              pos[v*3]=p.x+bb.x*l+nn.x*h;pos[v*3+1]=p.y+bb.y*l+nn.y*h;pos[v*3+2]=p.z+bb.z*l+nn.z*h;
              lq[v*4]=Math.round(bb.x*sd*127);lq[v*4+1]=Math.round(bb.y*sd*127);lq[v*4+2]=Math.round(bb.z*sd*127);lq[v*4+3]=Math.min(127,Math.round(hw/.5*127));
              av[v]=(r0+r)*2*ds;ak[v*4]=k;ak[v*4+1]=Math.round(Math.min(1,A[o])*255);ak[v*4+2]=dess?0:Math.round(C[o]*255);ak[v*4+3]=dess?0:Math.round(Math.min(1,PP[o])*255);v++;}}
          for(let r=0;r<R9.length-1;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aLatQ',new THREE.BufferAttribute(lq,4,true));
      g.setAttribute('aV',new THREE.BufferAttribute(av,1));g.setAttribute('aK',new THREE.BufferAttribute(ak,4,true));
      g.setIndex(v>65535?new THREE.Uint32BufferAttribute(ix,1):new THREE.Uint16BufferAttribute(ix,1));
      st.verts+=v;st.octets+=v*24+ix.length*(v>65535?4:2);return g;};
    {const gH=fabL(1);if(gH){pause();yield;reprise();arMaille2('autoroute traits',gH,fabL(4),matL,2*r0,2*r1);}}
    pause();yield;reprise();
    /* les chevrons des îlots (fins et moyens) et les sillons des bandes rugueuses (de près seulement : au loin ils ne se voient plus) */
    /* les rubans simples, regroupés par matière (un appel de dessin chacun) : les chevrons des îlots (fins et moyens) ; les sillons des bandes rugueuses,
       de près seulement et sur l'ordinateur (au loin, ou dans l'image du téléphone, ils ne se voient plus) */
    const fabZ=function(lst,pas){const RR=[];let n9=0;
      for(const Z of lst)for(let i=0;i<Z.run.length;i+=2){const R9=rangs(Z.run[i],Z.run[i+1],pas);RR.push([Z,R9]);n9+=2*R9.length;}
      if(!n9)return null;
      const pos=new Float32Array(n9*3),ai=new Float32Array(n9*4),ix=[];let v=0;
      for(const e of RR){const Z=e[0],R9=e[1],v0=v;
        for(const r of R9){const pi=Math.min(NP-1,2*(r0+r)),p=pts[pi],bb=B[pi],nn=Nn[pi];
          const xc=Z.t?Z.t[r*3]:(Z.cote<0?RX[0]:RX[1]),hw=Z.t?Z.t[r*3+1]:.2,al=Z.t?Z.t[r*3+2]:RG[r]*.26;
          for(let sd=-1;sd<=1;sd+=2){const l=sg*xc+sd*hw;
            pos[v*3]=p.x+bb.x*l+nn.x*Z.h;pos[v*3+1]=p.y+bb.y*l+nn.y*Z.h;pos[v*3+2]=p.z+bb.z*l+nn.z*Z.h;
            ai[v*4]=sd;ai[v*4+1]=hw;ai[v*4+2]=(r0+r)*2*ds;ai[v*4+3]=al;v++;}}
        for(let r=0;r<R9.length-1;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aI',new THREE.BufferAttribute(ai,4));
      g.setIndex(v>65535?new THREE.Uint32BufferAttribute(ix,1):new THREE.Uint16BufferAttribute(ix,1));st.verts+=v;st.octets+=v*28+ix.length*2;return g;};
    const courir=function(on){const run=[];let d=-1;
      for(let r=0;r<nr;r++){const coupe=r>0&&trou(2*(r0+r-1));if(d>=0&&(!on(r)||coupe)){if(r-1>d)run.push(d,r-1);d=-1;}if(on(r)&&d<0)d=r;}
      if(d>=0&&nr-1>d)run.push(d,nr-1);return run;};
    const ilots=[ZB,ZI].map(function(t){return {t:t,h:.045,run:courir(function(r){return t[r*3+1]>.05;})};}).filter(function(Z){return Z.run.length;});
    if(ilots.length)arMaille2('autoroute ilots',fabZ(ilots,1),fabZ(ilots,4),matI,2*r0,2*r1);
    if(!ALLEGE){const rg=courir(function(r){return RG[r]>.05;});if(rg.length)arMaille2('autoroute gronde',fabZ([{cote:-1,h:.04,run:rg},{cote:1,h:.04,run:rg}],1),null,matG);}
    pause();yield;reprise();
  }
  /* LES POTEAUX (un tous les 6 m sur la double ligne étroite), LES MOTS ET LES FLÈCHES (une graine à part : le scénario n'en dépend pas) */
  const R2=mulberry32(((seed|0)^0x51ED2709)>>>0),c2={j:0},E2={o:new Float32Array(Nm+2)},sh=3*plan.kH,MT=new THREE.Matrix4(),VZ=new THREE.Vector3();
  const pot=[];
  for(let sv=8;sv<L-30;sv+=6){const pi=Math.round(sv/ds);if(pi>=NP-1||trou(pi))continue;arEtat(plan,sv,E2,c2);if(!E2.postes)continue;
    let so=0;for(let i=1;i<=Nm;i++)so+=E2.o[i];const u=(2*H-2*sh-E2.buf*plan.kH-E2.isl*plan.kH)/Math.max(.001,so);
    pot.push(pi,-H+sh+(E2.o[1]+E2.o[2])*u+E2.buf*plan.kH*.5);
    if((pot.length&2047)===0){pause();yield;reprise();}}
  const geoP=arPoteauGeo(),parCh=new Map();
  for(let i=0;i<pot.length;i+=2){const ch=Math.floor(pot[i]*ds/400); /* des paquets de 400 m : arTick ne montre que ceux à moins de 380 m de la caméra */if(!parCh.has(ch))parCh.set(ch,[]);parCh.get(ch).push(pot[i],pot[i+1]);}
  for(const [ch,lst] of parCh){const n=lst.length/2,g=geoP.clone(),im=new THREE.InstancedMesh(g,matP,n);let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
    for(let k=0;k<n;k++){const pi=lst[2*k],p=pts[pi],bb=B[pi],nn=Nn[pi],tt=T[pi],l=sg*lst[2*k+1];
      VZ.crossVectors(bb,nn);if(VZ.dot(tt)<0)VZ.negate();
      MT.makeBasis(bb,nn,VZ);MT.setPosition(p.x+bb.x*l,p.y+bb.y*l,p.z+bb.z*l);im.setMatrixAt(k,MT);
      const px=p.x+bb.x*l,py=p.y+bb.y*l,pz=p.z+bb.z*l;if(px<x0)x0=px;if(py<y0)y0=py;if(pz<z0)z0=pz;if(px>x1)x1=px;if(py>y1)y1=py;if(pz>z1)z1=pz;}
    im.instanceMatrix.needsUpdate=true;g.boundingSphere=new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+2);
    im.name='autoroute poteaux';im.renderOrder=1;im.updateMatrix();im.matrixAutoUpdate=false;trackMeshes.push(im);(plan.potM||(plan.potM=[])).push(im);
    st.poteaux+=n;st.octets+=n*64;st.mailles++;}
  pause();yield;reprise();
  const dec=[]; /* {s0, s1, x (milieu), w (demi-largeur), cellule} */
  const libre=function(a,b){if(a<20||b>L-40)return false;for(let i=Math.floor(a/ds);i<=Math.ceil(b/ds);i++)if(trou(i))return false;return true;};
  const K=plan.K;
  for(let j=0;j<K.length;j++){const S0=K[j].s1,S1=j+1<K.length?K[j+1].s0:L;
    if(K[j].st.exp&&K[j].st.buf==='pot'){ /* « EXPRESS » à l'entrée des voies express, puis de loin en loin */
      for(let sv=Math.max(S0,j===0?Math.max(200,sEnt||0):S0)+70,ln=1;sv<S1-160;sv+=680+360*R2(),ln=3-ln){
        if(!libre(sv,sv+9))continue;arEtat(plan,sv,E2,c2);const vl=arVoie(plan,E2,ln);
        dec.push(sv,sv+8,vl[0],Math.min(1.9,vl[1]*.4),0);st.mots++;}}
    if((K[j].ev==='voie-'||K[j].ev==='large')&&j>0&&K[j].st.N<K[j-1].st.N){const ln=K[j-1].st.N; /* les flèches de rabattement dans la voie qui se ferme */
      for(const sv of [K[j].s0-190,K[j].s0+.12*(K[j].s1-K[j].s0)]){if(!libre(sv,sv+8))continue;arEtat(plan,sv,E2,c2);const vl=arVoie(plan,E2,ln);if(vl[1]<2.6)continue;
        dec.push(sv,sv+8,vl[0],1.3,1);st.fleches++;}}}
  if(dec.length){let n9=0;const lims=[];
    for(let i=0;i<dec.length;i+=5){const a=Math.floor(dec[i]/ds),b=Math.min(NP-1,Math.ceil(dec[i+1]/ds));lims.push(a,b);n9+=2*(b-a+1);}
    const pos=new Float32Array(n9*3),uv=new Float32Array(n9*2),ix=[];let v=0;
    for(let i=0,q=0;i<dec.length;i+=5,q+=2){const a=lims[q],b=lims[q+1],v0=v,c0=dec[i+4]*.5;
      for(let pi=a;pi<=b;pi++){const p=pts[pi],bb=B[pi],nn=Nn[pi],vv=(pi*ds-dec[i])/(dec[i+1]-dec[i]);
        for(let sd=0;sd<=1;sd++){const xd=dec[i+2]+(sd?1:-1)*dec[i+3],l=sg*xd; /* sd = 0 : le bord GAUCHE du mot (le début de la lecture) */
          pos[v*3]=p.x+bb.x*l+nn.x*.055;pos[v*3+1]=p.y+bb.y*l+nn.y*.055;pos[v*3+2]=p.z+bb.z*l+nn.z*.055;uv[v*2]=c0+(sd?.5:0);uv[v*2+1]=vv;v++;}}
      for(let r=0;r<b-a;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    g.setIndex(new THREE.Uint16BufferAttribute(ix,1));arMaille('autoroute mots',g,matD,1);st.verts+=v;st.octets+=v*20+ix.length*2;st.mailles++;}
  pause();plan.stats=Object.assign(st,{ms:+cpu.toFixed(1),msMax:+tMax.toFixed(1),Ko:Math.round(st.octets/1024)});plan.dec=dec;plan.pot=pot.length/2;
}
function arChauffe(){ /* (vignette-moteur, la chauffe au menu) les cinq programmes de l'autoroute compilés hors écran : aucun ne naît au 1er départ */
  if(!AR_ON||AR.chauffe)return;const P=arPerso('nuages'),tri=function(at){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));
    for(const k in at){const T9=at[k][0],n=at[k][1];g.setAttribute(k,new THREE.BufferAttribute(new T9(3*n),n,!!at[k][2]));}return g;};
  const L9=[new THREE.Mesh(tri({aLatQ:[Int8Array,4,1],aV:[Float32Array,1],aK:[Uint8Array,4,1]}),arLignesMat(P)),new THREE.Mesh(tri({aI:[Float32Array,4]}),arZoneMat(P,true)),
    new THREE.Mesh(tri({aI:[Float32Array,4]}),arZoneMat(P,false)),new THREE.Mesh(tri({uv:[Float32Array,2]}),arDecalMat(P))];
  const im=new THREE.InstancedMesh(arPoteauGeo().clone(),arPoteauMat(),1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);
  AR.chauffe=L9; /* gardées : une matière jetée relâcherait son programme */
  for(const o of L9){o.frustumCulled=false;scene.add(o);}
  try{chauffeRendu(L9);}finally{for(const o of L9)scene.remove(o);}}
function arTick(){ /* (boucle-2, en conduite) la route parcourue pendant l'image (le filé), la nuit, la caisse (les poteaux qui plient), les poteaux proches seulement */
  AR_U.uTrav.value=LIGNE_U.uFile.value*LIGNE_PER.v;AR_U.uNuit.value=+LVL.nuit||0;AR_U.uCar.value.copy(carGroup.position);
  const P=arPlanCourant();if(P&&P.potM){const c=camera.position;for(const m of P.potM){const s9=m.geometry.boundingSphere,d=s9.center.distanceTo(c)-s9.radius;m.visible=d<380;}}}
function arPlanCourant(){let b=null;for(const p of AR.plans)if(Math.abs(p.L-L)<.5)b=p;return b||AR.plans[AR.plans.length-1]||null;}
window.dbgAutoroute=function(a,b,c){
  if(a===0||a===1||a===true||a===false){AR.vis=!!a;for(const p of AR.plans)for(const m of (p.mats||[]))m.visible=AR.vis;
    for(const m of trackMeshes)if(m.name==='piste ligne centrale')m.material.visible=!AR.vis;return {vis:AR.vis};}
  if(a==='cout'){const r=[],ia=renderer.info.autoReset;renderer.info.autoReset=false; /* (banc) le dessin de la même image, sans puis avec l'autoroute */
    for(const v of [0,1]){window.dbgAutoroute(v);renderer.info.reset();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);r.push({appels:renderer.info.render.calls,triangles:renderer.info.render.triangles});}
    renderer.info.autoReset=ia;return {sans:r[0],avec:r[1]};}
  if(a==='ou')return {s:Math.round(s),lat:+lat.toFixed(2),L:Math.round(L),mode:mode,go:gameOver};
  if(a==='aller'){s=Math.max(0,Math.min(L-60,+b||0));safeS=s;psi=0;vL=0;if(c!=null)lat=+c;return {s:Math.round(s),lat:lat};}
  const P=arPlanCourant();if(!P)return {on:AR_ON,plan:null};
  if(a==='profil'){const pas=Math.max(2,+b||10),E9={o:new Float32Array(P.P.Nmax+2)},S9=2*P.P.Nmax,
      O9={x:new Float32Array(S9),hw:new Float32Array(S9),k:new Uint8Array(S9),a:new Float32Array(S9),c:new Float32Array(S9),p:new Float32Array(S9)},c9={j:0},rows=[];
    for(let sv=0;sv<P.L;sv+=pas){arEtat(P,sv,E9,c9);arCoupe(P,E9,O9);const tr=[];
      for(let q=0;q<S9;q++)if(O9.k[q])tr.push(+O9.x[q].toFixed(2),O9.k[q],+O9.a[q].toFixed(2),+O9.c[q].toFixed(1),+O9.p[q].toFixed(1));
      rows.push([Math.round(sv),tr,O9.zb?[+O9.zbx.toFixed(2),+O9.zbw.toFixed(2)]:0,O9.zi?[+O9.zix.toFixed(2),+O9.ziw.toFixed(2)]:0,E9.postes?+O9.pb.toFixed(2):0,+E9.g.toFixed(1),E9.mod]);}
    return {L:Math.round(P.L),H:P.H,carte:P.id,rows:rows,dec:P.dec,mods:P.mods};}
  return {on:AR_ON,fige:AR_FIGE,carte:P.id,graine:P.seed,L:P.L,sEnt:P.sEnt,argraine:AR_GRAINE,or:P.or,stats:P.stats,poteaux:P.pot,
    mods:P.mods.map(function(m){return [Math.round(m[0]),Math.round(m[1])];}),segments:P.K.map(function(k){return {s0:Math.round(k.s0),s1:Math.round(k.s1),ev:k.ev,N:k.st.N,exp:k.st.exp,buf:k.st.buf,isl:k.st.isl,style:k.st.style,usure:+k.pe.u.toFixed(2),ombre:k.pe.c,gronde:k.pe.g,plots:+k.pe.p.toFixed(2)};})};};
