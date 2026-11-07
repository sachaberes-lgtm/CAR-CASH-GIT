/* ===== L'ARGENT DE L'ATELIER (2026-10-01, Sacha : « plus on gagne d'argent, plus il doit y avoir des tas de billets sur le sol du garage,
   un peu placés partout dans le garage, sur les meubles et tout ») =====
   Le COMPTE (bank()) se voit : des liasses VERTES (tranche vert-de-gris, face vert billet, bande kraft) en TAS bas dans le couloir de
   la caméra (33 cm : sous les 45 cm de la règle des 8,3 m), en GROS TAS au pied des murs, en piles sur les meubles (fûts, distributeur,
   étagères du rack, servante, établi), et — quand on devient riche — en PALETTES contre les murs, loin de l'orbite. Rien entre la
   caméra et la caisse (c'est la vedette), rien dans l'allée de la porte (elle sort par là), rien de haut devant l'affiche du record.
   · TOUT EST BÂTI UNE FOIS (à la 1re visite, avec l'atelier) dans UN seul mesh en couleurs de sommets, dans la matière MATE des meubles
     (le même programme : zéro programme de plus). Les objets sont rangés dans l'ORDRE où ils apparaissent ; le compte règle seulement
     combien on en dessine (`setDrawRange`) — gagner, dépenser : rien ne se reconstruit, une comparaison par image.
   · L'ORDRE : chaque place s'ouvre à un seuil (`a`), puis c'est la place la MOINS remplie qui reçoit l'objet suivant — les tas montent
     ensemble, du bas vers le haut (jamais une liasse en l'air) ; une palette qui s'ouvre avale d'un coup ce qui tombe, puis tout
     repart ensemble. Les places VUES de la caméra (fixe, côté établi, qui regarde la porte) passent d'abord.
   · LA COURBE : n = 12 × (compte / 50)^0,4 — 100 € → 16 objets, 1 k → 40, 10 k → 100, 100 k → 250, 1 M → 630, 2,5 M (la plus chère de
     la boutique) → 910 ; ~1 320 au plus depuis le 2026-11-07 (tours, éventails, glissades, tapis : il reste de quoi grandir au-delà).
     Dépenser fait donc FONDRE les tas : l'argent part de l'atelier.
   `dbgArgent(compte)` force un compte (sans toucher la sauvegarde) · `dbgArgent()` rend l'état · `dbgArgent(null)` relâche. */
/* ===== LE GARAGE QUI SE REMPLIT (2026-11-07, Sacha : « sois plus inventif dans la manière dont les billets sont disposés dans le garage, là
   ils sont tassés par couleur alors que ça doit être un peu mélangé ; que ça soit vraiment jouissif de gagner de l'argent et de remplir son
   garage avec ») =====
   · LE MÉLANGE : chaque tas garde une coupure qui DOMINE (six sur dix), le reste ce sont surtout ses VOISINES dans la série (des 20 et des 100
     dans un tas de 50) et quelques intruses ; les tranches se zèbrent, comme une vraie pile d'euros. Les palettes restent RANGÉES, mais en
     strates de deux ou trois couleurs (le coffre-fort contre le bazar des tas). Les coupures ont leur propre graine (`rc`).
   · LES FORMES : des TOURS de liasses croisées deux par deux (Jenga) qui vrillent et penchent un peu en montant, contre les murs ; des
     GLISSADES (quand un tas est plein, des liasses glissent et restent penchées contre son pied — l'angle est calculé sur les liasses
     vraiment posées dessous, elles ne traversent rien) ; des ÉVENTAILS de billets au sol (une main de poker jetée) ; et, riche, un TAPIS
     de billets qui part des tas et gagne le sol. Les billets seuls ont la taille du billet du dessus d'une liasse (ils se voient).
   · LA CASCADE : quand le compte a monté depuis la dernière fois que l'atelier s'est affiché, les nouveaux objets TOMBENT du plafond un par
     un, de plus en plus serrés (2,1 s au plus, 160 au plus — au-delà, les premiers sont déjà posés) : une liasse tournoie, s'écrase un peu
     et rebondit ; un billet plane et se balance ; une palette tombe lourd. Chaque arrivée sonne une pièce qui MONTE la pentatonique, un
     froissement de billets passe de temps en temps, un tic sous le doigt ; un gros gain finit sur un accord. Les objets en vol sont
     recopiés chaque image dans un 2e mesh (même matière : zéro programme de plus), puis rendus au grand mesh dès qu'ils sont posés.
     Dépenser : rien ne change, les tas fondent d'un coup. */
const GARG={mesh:null,offs:null,n:-1,cible:-1,bank:-1,force:null,K:12,E:.4,places:0,vol:null,src:null,cas:null,tm:0};
function garArgentN(b){return Math.max(0,Math.round(GARG.K*Math.pow(Math.max(0,b||0)/50,GARG.E)));}
function garArgentMaj(){
  if(!GARG.mesh)return;
  const t=performance.now(),dt=Math.min(.05,Math.max(0,(t-(GARG.tm||t))/1000)),revient=t-(GARG.tm||0)>400;GARG.tm=t; /* revient : l'atelier vient de se rouvrir (on lui laisse le temps d'apparaître) */
  const b=GARG.force!=null?GARG.force:bank();
  if(b!==GARG.bank){GARG.bank=b;const n=Math.min(GARG.offs.length-1,garArgentN(b));
    if(n!==GARG.cible){const avant=GARG.cible;GARG.cible=n;
      if(GARG.n<0||n<avant||!GARG.vol)garCasFin(n); /* la 1re visite (rien ne tombe) · une dépense (les tas fondent d'un coup) */
      else garCasPart(revient);}}
  if(GARG.cas)try{garCasPas(dt);}catch(e){console.warn('cascade',e);garCasFin(GARG.cible);} /* garageRender l'appelle hors try : une panne ici ne doit jamais figer l'atelier */
}
/* ---- LA CASCADE (voir « LE GARAGE QUI SE REMPLIT ») ---- */
const GCAS_MAX=160,GCAS_M=new THREE.Matrix4(),GCAS_E=new THREE.Euler(0,0,0,'YXZ');
function garCasDur(nb){return Math.min(2.1,.12+.055*nb);}
function garCasFin(n){GARG.cas=null;GARG.n=n;GARG.mesh.geometry.setDrawRange(0,GARG.offs[n]);GARG.mesh.visible=n>0;if(GARG.vol)GARG.vol.visible=false;}
function garCasCap(nv){const v=GARG.vol;if((v.userData.cap||0)>=nv)return;const cap=Math.max(nv,Math.ceil((v.userData.cap||0)*1.5),4096),g9=new THREE.BufferGeometry();
  for(const k of ['position','normal','color']){const a=new THREE.BufferAttribute(new Float32Array(cap*3),3);a.setUsage(THREE.DynamicDrawUsage);g9.setAttribute(k,a);}
  g9.setDrawRange(0,0);v.geometry.dispose();v.geometry=g9;v.userData.cap=cap;}
function garCasPart(revient){
  let c=GARG.cas;const k1=GARG.cible;
  if(c&&k1-c.sp>GCAS_MAX){garCasFin(c.sp);c=null;} /* un gain énorme pendant une cascade : ce qui vole se pose, on repart */
  if(!c){let k0=GARG.n;if(k1-k0>GCAS_MAX){k0=k1-GCAS_MAX;garCasFin(k0);}
    c=GARG.cas={k0:k0,sp:k0,T:0,dl:revient?.55:.06,from:k0,nb:Math.max(1,k1-k0),t0:0,dur:garCasDur(k1-k0),o:[],nfL:0,nson:0,tson:-1};}
  else{c.from=c.sp;c.nb=Math.max(1,k1-c.sp);c.t0=c.T;c.dur=garCasDur(c.nb);} /* le compte monte encore : la suite se replanifie à partir de maintenant */
  garCasCap(GARG.offs[k1]-GARG.offs[GARG.n]);
}
/* un objet qui naît : sa boîte (prise dans le grand mesh), sa nature (au nombre de sommets : 36 = un billet, 144 = une liasse, plus = la
   palette), sa hauteur de chute (sous le plafond), sa vrille */
function garCasNait(c,k){const of=GARG.offs,a=of[k],b=of[k+1],o={t:c.T,fin:false,pose:false};c.o[k-c.k0]=o;
  if(b<=a){o.fin=o.pose=o.vide=true;return;}
  const p=GARG.src.p,R=Math.random;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
  for(let i=a*3;i<b*3;i+=3){const x=p[i],y=p[i+1],z=p[i+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
  o.cx=(x0+x1)/2;o.cy=(y0+y1)/2;o.cz=(z0+z1)/2;o.hc=o.cy-y0;const nv=b-a;o.ty=nv<=36?0:nv>300?2:1;
  if(o.ty===0){o.H=Math.max(.6,Math.min(GAR.H-.4-y1,1.6+R()*1.6));o.tf=.8+R()*.45;o.A=.18+R()*.22;o.w=6+R()*4;o.ph=R()*6.2832;o.a0=(R()-.5)*5;}
  else{const L=o.ty===2;o.H=Math.max(.9,GAR.H-.35-y1-R()*1.3);o.tf=Math.sqrt(2*o.H/(L?24:19));o.a0=(R()<.5?-1:1)*(1.2+R()*2.6)*(L?.2:1);
    o.rx0=(R()-.5)*1.1*(L?.15:1);o.rz0=(R()-.5)*1.1*(L?.15:1);}
}
function garCasPas(dt){
  const c=GARG.cas;
  if(c.T===0){const w9=document.getElementById('wipe');if(w9&&w9.className==='in')c.dl=Math.max(c.dl,.3);} /* le volet couvre encore l'écran : on attend qu'il se lève */
  if(c.dl>0){c.dl-=dt;return;}c.T+=dt;
  const k1=GARG.cible,of=GARG.offs;
  while(c.sp<k1&&c.T>=c.t0+c.dur*Math.pow((c.sp-c.from)/c.nb,.62)){garCasNait(c,c.sp);c.sp++;} /* l'exposant < 1 : les arrivées se SERRENT */
  let pose=0,lourd=0;
  for(let k=GARG.n;k<c.sp;k++){const o=c.o[k-c.k0];if(!o||o.fin)continue;const a=c.T-o.t;
    o.dx=o.dy=o.dz=o.rx=o.ry=o.rz=0;o.sy=o.sxz=o.s=1;
    if(a<o.tf){const u=a/o.tf,w=1-u;o.s=Math.min(1,.3+a/.09);
      if(o.ty===0){const sw=Math.sin(o.w*a+o.ph);o.dy=o.H*Math.pow(w,1.2);o.dx=o.A*sw*w;o.dz=o.A*Math.cos(o.w*.77*a+o.ph)*w;o.ry=o.a0*w;o.rz=.6*sw*w;o.rx=.4*Math.cos(o.w*.9*a)*w;} /* le billet plane et se balance */
      else{o.dy=o.H*(1-u*u);o.ry=o.a0*Math.pow(w,1.6);o.rx=o.rx0*w*w;o.rz=o.rz0*w*w;}} /* la liasse tombe (gravité) en vrillant, et se redresse en arrivant */
    else{const v=a-o.tf;if(!o.pose){o.pose=true;if(o.ty===1)pose++;else if(o.ty===2)lourd++;}
      if(o.ty===1){if(v<.1){const q=Math.sin(Math.PI*v/.1);o.sy=1-.3*q;o.sxz=1+.13*q;}else if(v<.27)o.dy=.05*Math.sin(Math.PI*(v-.1)/.17);else o.fin=true;} /* l'écrasement, puis un rebond de 5 cm */
      else if(o.ty===2){if(v<.16){const q=Math.sin(Math.PI*v/.16);o.sy=1-.12*q;o.sxz=1+.05*q;}else o.fin=true;}
      else o.fin=true;}}
  /* ce qui est posé, dans l'ordre, retourne au grand mesh */
  let n=GARG.n;while(n<c.sp){const o=c.o[n-c.k0];if(!o||!o.fin)break;n++;}
  if(n!==GARG.n){GARG.n=n;GARG.mesh.geometry.setDrawRange(0,of[n]);GARG.mesh.visible=n>0;}
  /* ce qui vole : recopié, tourné autour de son centre, écrasé sur sa base */
  const S9=GARG.src,vg=GARG.vol.geometry,PA=vg.attributes.position.array,NA=vg.attributes.normal.array,CA=vg.attributes.color.array,m=GCAS_M.elements;let u9=0;
  for(let k=GARG.n;k<c.sp;k++){const o=c.o[k-c.k0];if(!o||o.vide)continue;const i0=of[k]*3,i1=of[k+1]*3;
    GCAS_E.set(o.rx,o.ry,o.rz);GCAS_M.makeRotationFromEuler(GCAS_E);const sx=o.sxz*o.s,sy=o.sy*o.s,hc=o.hc,X=o.cx+o.dx,Y=o.cy+o.dy,Z=o.cz+o.dz;
    for(let i=i0;i<i1;i+=3,u9+=3){const px=S9.p[i]-o.cx,py=S9.p[i+1]-o.cy,pz=S9.p[i+2]-o.cz,nx=S9.nm[i],ny=S9.nm[i+1],nz=S9.nm[i+2];
      PA[u9]=X+(m[0]*px+m[4]*py+m[8]*pz)*sx;PA[u9+1]=Y+(m[1]*px+m[5]*py+m[9]*pz+hc)*sy-hc;PA[u9+2]=Z+(m[2]*px+m[6]*py+m[10]*pz)*sx;
      NA[u9]=m[0]*nx+m[4]*ny+m[8]*nz;NA[u9+1]=m[1]*nx+m[5]*ny+m[9]*nz;NA[u9+2]=m[2]*nx+m[6]*ny+m[10]*nz;
      CA[u9]=S9.c[i];CA[u9+1]=S9.c[i+1];CA[u9+2]=S9.c[i+2];}}
  if(u9>0)for(const k of ['position','normal','color']){const at=vg.attributes[k];at.updateRange.offset=0;at.updateRange.count=u9;at.needsUpdate=true;}
  vg.setDrawRange(0,u9/3);GARG.vol.visible=u9>0;
  /* le son : une pièce qui monte d'un degré toutes les deux arrivées (75 ms au moins entre deux), un froissement une fois sur quatre */
  if(pose||lourd){c.nfL+=pose+lourd;if(c.T-c.tson>.075){c.tson=c.T;const deg=Math.min(7,c.nson>>1);c.nson++;
    try{if(lourd)sfx('pose.lourde',{vol:-10});sfx('piece',{st:sonPd(deg),vol:-11});if(c.nson%4===1)sfx('fourgon.billets',{vol:-13});}catch(e){}try{hap(4);}catch(e){}}}
  if(GARG.n>=k1&&c.sp>=k1){GARG.cas=null;GARG.vol.visible=false;garCasBouquet(c.nfL);}
}
function garCasBouquet(n){if(n<5)return;try{sfx(n>=50?'argent.gros':'piece.recolte',{vol:n>=50?-4:-3});}catch(e){}try{hap(n>=50?[14,40,22,40,30]:[10,30,16]);}catch(e){}}
window.dbgArgent=function(c){if(c!==undefined)GARG.force=c;
  return {force:GARG.force,bank:GARG.bank,cible:GARG.cible,n:GARG.n,max:GARG.offs?GARG.offs.length-1:0,places:GARG.places,ms:GARG.ms,types:GARG.types,
    cas:GARG.cas?{k0:GARG.cas.k0,sp:GARG.cas.sp,T:+GARG.cas.T.toFixed(2),dur:+GARG.cas.dur.toFixed(2),poses:GARG.cas.nfL}:null,pos:GARG.pos};};
function garArgent(g){
  const t00=performance.now(),T0=new THREE.BoxGeometry(1,1,1).toNonIndexed(),TP=T0.attributes.position.array;T0.dispose(); // le cube unité, 36 sommets
  const P=[],C=[],M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E9=new THREE.Euler(0,0,0,'YXZ'),V=new THREE.Vector3(),S=new THREE.Vector3(),co=new THREE.Color();
  let sd=0x5eed51;const rn=()=>{sd=(sd+0x6D2B79F5)|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;}; // à part : le rnd du jeu n'est pas touché
  /* (2026-11-07) les COUPURES ont leur graine à elles : `voisin(d, pd, pv)` rend la coupure d avec la chance pd, une voisine (d ± 1) avec pv,
     sinon n'importe laquelle */
  let sc=0xc0ffee;const rc=()=>{sc=(sc+0x6D2B79F5)|0;let q=Math.imul(sc^sc>>>15,1|sc);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;};
  const NC=TC_EUR.length,voisin=(d,pd,pv)=>{const r=rc();if(r<pd)return d;if(r<pd+pv){const s=rc()<.5?-1:1;return d+s<0||d+s>=NC?d-s:d+s;}return (rc()*NC)|0;};
  const e=M.elements;
  // une boîte : taille (w,h,d), CENTRE (x,y,z), cap/tangage/roulis — une couleur, un grain de ±5 % (du papier, pas du plastique)
  const bx=(w,h,d,x,y,z,ry,rx,rz,hex,gr)=>{E9.set(rx||0,ry||0,rz||0);Q.setFromEuler(E9);M.compose(V.set(x,y,z),Q,S.set(w,h,d));
    co.setHex(hex);const k=1+((gr==null?rn():gr)-.5)*.1;
    for(let i=0;i<108;i+=3){const a=TP[i],b=TP[i+1],c=TP[i+2];
      P.push(e[0]*a+e[4]*b+e[8]*c+e[12],e[1]*a+e[5]*b+e[9]*c+e[13],e[2]*a+e[6]*b+e[10]*c+e[14]);C.push(co.r*k,co.g*k,co.b*k);}};
  /* LA LIASSE (v2, après capture : des bandes or / rose / cyan et une tranche crème se lisaient comme des CONFETTIS) : tout est VERT
     BILLET, sombre (SON règle la clé de la boutique : pas de fluo) — tranche vert-de-gris, face vert foncé, bande papier kraft doré
     éteint ; et plus grosse (×3,2 d'une vraie liasse : de la caméra, à 10 m, une vraie serait une miette). */
  /* (2026-11-06, Sacha : « dans le garage remplace les liasses de billets de dollars par des liasses d'euros ») LES LIASSES EN EUROS : le billet du dessus
     prend la couleur de sa coupure dans la série Europa (`TC_EUR` : 5 gris · 10 rouge · 20 bleu · 50 orange · 100 vert · 200 jaune · 500 violet), assombrie
     comme l'ancien vert (×,62) ; la tranche est du papier pâle qui garde un soupçon de la couleur ; la bande reste kraft ; la bande argentée de l'hologramme
     court sur le billet. Les listes ci-dessous donnent la coupure qui DOMINE chaque tas / pile / palette ; depuis le 2026-11-07 elle se mélange à ses
     voisines (voir « LE GARAGE QUI SE REMPLIT ») ; les palettes, les plus riches, sont en grosses coupures. */
  const BAND=[0xbfa25c,0xbfa25c,0xa9884a],ARGENT=0xb4bec2;
  const eurHex=(h,k)=>{const n=parseInt(h.slice(1),16);return (Math.round((n>>16&255)*k)<<16)|(Math.round((n>>8&255)*k)<<8)|Math.round((n&255)*k);};
  const FACE=TC_EUR.map(e=>eurHex(e[3],.62)),TRANCHE=TC_EUR.map(e=>{const n=eurHex(e[3],.62),m=0x9aa098;  // la tranche : 70 % papier pâle, 30 % la couleur de la face
    return (Math.round((m>>16&255)*.7+(n>>16&255)*.3)<<16)|(Math.round((m>>8&255)*.7+(n>>8&255)*.3)<<8)|Math.round((m&255)*.7+(n&255)*.3);}),SOL=TC_EUR.map(e=>{const n=eurHex(e[3],.66),m=0x8c9088; /* (2026-11-07, après capture) le billet seul : le ton de la face d'une liasse, 25 % de papier — à ×,85 il brillait comme un confetti */
    return (Math.round((n>>16&255)*.75+(m>>16&255)*.25)<<16)|(Math.round((n>>8&255)*.75+(m>>8&255)*.25)<<8)|Math.round((n&255)*.75+(m&255)*.25);});
  const DB=[1,2,0,3,2,1,3,2,0,4],DG=[3,2,4,1,3,5,2],DM=[2,1,3,0,2,3,1,2,4,3,2,1,3,5],DP=[3,4,5,6,4,5]; // les coupures : tas bas · gros tas · piles des meubles · palettes
  const LL=.5,LT=.11,LW=.24,BL=.44,BW=.2;
  /* (2026-11-07) la liasse tourne EN ENTIER (cap, tangage, roulis) : une glissade penche de 25°, ses pièces doivent suivre */
  const Q2=new THREE.Quaternion(),E2=new THREE.Euler(0,0,0,'YXZ'),V2=new THREE.Vector3();
  const liasse=(x,y,z,ry,rx,rz,d)=>{const u=rn(),f=FACE[d],b=BAND[(rn()*BAND.length)|0];E2.set(rx||0,ry||0,rz||0);Q2.setFromEuler(E2);
    const at=(lx,ly,lz)=>{V2.set(lx,ly,lz).applyQuaternion(Q2);return [x+V2.x,y+V2.y,z+V2.z];};
    let q=at(0,.048,0);bx(LL-.014,.096,LW-.014,q[0],q[1],q[2],ry,rx,rz,TRANCHE[d],u);   // la tranche : la pile de billets vue de côté
    q=at(0,.103,0);bx(LL,.014,LW,q[0],q[1],q[2],ry,rx,rz,f,u);                       // la face du billet du dessus
    q=at(.13,.1105,0);bx(.034,.004,LW-.05,q[0],q[1],q[2],ry,rx,rz,ARGENT,.5);        // la bande argentée de l'hologramme, à droite de la bande kraft
    q=at(0,.055,0);bx(.09,LT+.004,LW+.01,q[0],q[1],q[2],ry,rx,rz,b,u);};             // la bande
  /* le billet seul, posé (y = le dessous) : la taille du billet du dessus d'une liasse (avant, 24 × 11 cm : une miette à 10 m) */
  const billet=(x,y,z,ry,rx,rz,d)=>bx(BL,.005,BW,x,y+.004,z,ry,rx,rz,SOL[d]);
  const palette=(x,z,ry)=>{const c=Math.cos(ry),s=Math.sin(ry),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
    for(const lz of [-.4,0,.4]){const q=at(0,lz);bx(1.12,.02,.12,q[0],.01,q[1],ry,0,0,0x6e4d2c);}
    for(const lx of [-.5,0,.5])for(const lz of [-.4,0,.4]){const q=at(lx,lz);bx(.12,.085,.12,q[0],.0625,q[1],ry,0,0,0x5f4226);}
    for(const lz of [-.39,-.195,0,.195,.39]){const q=at(0,lz);bx(1.12,.022,.14,q[0],.116,q[1],ry,0,0,0x86603a);}};
  /* ---- OÙ POSER : les meubles (rectangles de leurs ombres au sol, les mêmes que `F9`), le bazar du couloir, l'allée et la PORTE (la
     caisse sort par là), l'affiche du record (rien de haut devant), et rien ENTRE la caméra et la caisse (SON : « elle est la vedette ») ---- */
  const zB=-GAR.D/2+.9,RECT=[[-3,zB,9.8,1.5],[-9.4,-1.6,.8,1.5],[-9.5,2.6,.9,2.1],[-9.6,-7.2,.8,.8],[-9.6,-5.1,.8,.8],[-9.4,7.4,.8,.8],[-8.9,5.6,.7,.7],
     [-9.9,-9.4,1.2,1.0],[7.7,-6.4,3.4,1.8],[9.0,-2.2,1.9,1.2],[9.6,3.4,1.5,4.4],[10.3,8.4,.9,1.5],[-5.6,10.4,3.2,1.0],[9.9,-10.3,1.2,4.0],
     [-8.2,-5.4,.6,1.4],[-8.6,1.2,.5,1.5],[7.6,-4.2,.6,.6],[-8.16,9.2,1.3,.3],[-3.35,10.4,1.1,.9]];
  const ROND=[[5.9,3.3,.45],[6.5,2.62,.45],[-5.4,-5.6,.45],[-5.6,4.4,.5],[6.79,-3.48,.4],[7.2,1.4,.4],[-6.4,-2.6,.55],[5.2,5.6,.3],
     [-4.4,6.5,.4],[-3.6,6.2,.35],[-1.6,-6.4,.65],[4.6,-5.2,1.1],[-6.2,2.2,1.2],[-8.2,-3.6,.25],[-8.7,-3.0,.25],[5.8,-6.4,.9]];
  for(let i=0;i<9;i++){const a=1.1+i*.42,r9=5.4+((i*7)%5)*.5;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.2]);}      // la rallonge
  for(let i=0;i<7;i++){const a=i*2.4,r9=5.2+((i*3)%5)*.6;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.25]);}         // les clés semées
  const PAL=[[9.6,11.0,0],[-9.6,11.3,0],[-9.6,4.45,Math.PI/2],[9.7,-.2,Math.PI/2],[4.2,-11.5,0],[-9.4,-11.4,0]];
  for(const p9 of PAL)RECT.push([p9[0],p9[1],p9[2]?.92:1.12,p9[2]?1.12:.92]);
  const libre=(x,z,m)=>{if(Math.abs(x)>GAR.W/2-.7||Math.abs(z)>GAR.D/2-.7)return false;
    if(Math.abs(x)<2.4+m&&z>3)return false;                              // l'allée de la porte : la caisse sort par là (sa largeur + le tas)
    if(z>9.9&&x>4.4&&x<7.6)return false;                                 // (2026-10-19) l'ÉTAL du moteur, au mur de la porte (à gauche)
    if(z>11.2&&x<-4.9&&x>-8.2)return false;                              // l'affiche du record, au mur de la porte (passée à droite)
    if(z<-4.2&&Math.abs(x)<4.6)return false;                             // entre la caméra (côté établi) et la caisse : rien
    for(const r of RECT)if(Math.abs(x-r[0])<r[2]/2+m&&Math.abs(z-r[1])<r[3]/2+m)return false;
    for(const o of ROND)if(Math.hypot(x-o[0],z-o[1])<o[2]+m)return false;return true;};
  // l'ordre de ce que la caméra VOIT : elle est fixe côté établi (≈ 0, 3, −10,5) et regarde la caisse — puis la porte derrière elle
  const cam=new THREE.Vector3(0,3,-10.5),fw=new THREE.Vector3(0,.8,0).sub(cam).normalize(),vu=(x,z)=>{V.set(x,.2,z).sub(cam).normalize();return Math.acos(Math.max(-1,Math.min(1,V.dot(fw))));};
  /* (2026-11-07) `ok` : une condition de plus pour la place (les tours : rien de haut devant l'affiche ni l'étal) */
  const choisir=(r0,r1,m,ecart,nb,deja,ok)=>{const cand=[];
    for(let x=-10;x<=10;x+=.5)for(let z=-12;z<=12;z+=.5){const r=Math.hypot(x,z);if(r<r0||r>r1||!libre(x,z,m)||(ok&&!ok(x,z)))continue;cand.push([x,z,vu(x,z)]);}
    cand.sort((a,b)=>a[2]-b[2]);const pris=[];
    for(const c of cand){if(pris.length>=nb)break;if(pris.concat(deja).every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>=ecart))pris.push(c);}
    return pris;};
  /* LES GLISSADES (2026-11-07) : le tas est plein, des liasses glissent et restent PENCHÉES contre son pied. Le bout extérieur touche le sol,
     la liasse s'appuie sur le plus haut point des liasses vraiment posées sous elle (`haut` : la hauteur du tas en un point, liasse par
     liasse) — l'angle qui la fait toucher sans rien traverser. La première regarde la caméra (elle se voit), les autres partent sur les côtés. */
  const haut=(R,px,pz)=>{let h=0;for(const L of R){const dx=px-L.x,dz=pz-L.z,c=Math.cos(L.ry),s=Math.sin(L.ry),lx=c*dx-s*dz,lz=s*dx+c*dz;
      if(Math.abs(lx)<=LL/2&&Math.abs(lz)<=LW/2&&L.y+LT>h)h=L.y+LT;}return h;};
  const glissades=(x0,z0,R,d,ng,it)=>{const vers=Math.atan2(cam.z-z0,cam.x-x0);
    for(let j=0;j<ng;j++){const phi=j===0?vers+(rn()-.5)*1.1:vers+(j%2?1:-1)*(1.4+rn()*.9),ux=Math.cos(phi),uz=Math.sin(phi);
      let e0=0;for(const L of R)if(L.y<.01){const p=(L.x-x0)*ux+(L.z-z0)*uz;if(p>e0)e0=p;}
      const ro=e0+.2+.1*rn(),ox=x0+ux*ro,oz=z0+uz*ro;if(!libre(ox,oz,.02))continue;
      let th=0;for(let s9=.03;s9<=LL;s9+=.03)for(const w of [-.1,0,.1]){const h=haut(R,ox-ux*s9-uz*w,oz-uz*s9+ux*w);if(h>0){const a=Math.atan2(h,s9);if(a>th)th=a;}}
      if(th<.05||th>.7)continue;
      const G={x:ox-ux*(LL/2)*Math.cos(th),y:(LL/2)*Math.sin(th),z:oz-uz*(LL/2)*Math.cos(th),ry:Math.atan2(uz,-ux)+(rn()-.5)*.12,rz:th,d:voisin(d,.6,.32)};
      it.push(()=>liasse(G.x,G.y,G.z,G.ry,0,G.rz,G.d));}};
  // un TAS : des couches qui rétrécissent, de travers, et quelques billets échappés autour
  // (2026-11-01, Sacha : « des liasses qui flottent, rends ça plus joli ») CHAQUE ÉTAGE REPOSE SUR LE PRÉCÉDENT : avant, chaque couche
  // tirait ses points au hasard dans son propre rayon, sans lien avec celle du dessous — une liasse du sommet pouvait n'avoir RIEN sous
  // elle à cet endroit précis et semblait flotter. Désormais l'étage 0 seul est tiré au hasard (Poisson) ; chaque étage suivant reprend
  // les points de celui d'en dessous, resserrés vers le centre (×.72) puis triés du plus central au plus loin — la pyramide tient debout.
  /* (2026-11-07) chaque liasse est tirée à la création (place, cap, coupure mélangée) : les glissades en ont besoin pour s'appuyer dessus ;
     les billets échappés partent au-delà du pied du tas (ils sont plus grands) */
  const tas=(x0,z0,couches,d,ng)=>{const it=[],R=[],R0=couches[0][1];let y=0,bas=null;
    const vole=()=>{const a=rn()*6.2832,dd=R0+.32+rn()*.42,F={x:x0+Math.cos(a)*dd,z:z0+Math.sin(a)*dd,ry:rn()*6.2832,rx:(rn()-.5)*.06,rz:(rn()-.5)*.06,d:voisin(d,.45,.3)};
      if(libre(F.x,F.z,0))it.push(()=>billet(F.x,0,F.z,F.ry,F.rx,F.rz,F.d));};
    couches.forEach((cc,l)=>{const n=cc[0],Rl=cc[1],y9=y,tilt=l?.12:.04;let pts;
      if(!bas){pts=[];for(let k=0;k<80&&pts.length<n;k++){const a=rn()*6.2832,d=Math.sqrt(rn())*Rl,px=x0+Math.cos(a)*d,pz=z0+Math.sin(a)*d;
        if(pts.every(q=>Math.hypot(q[0]-px,q[1]-pz)>.27))pts.push([px,pz]);}}
      else{pts=bas.map(q=>[x0+(q[0]-x0)*.72+(rn()-.5)*.05,z0+(q[1]-z0)*.72+(rn()-.5)*.05])
        .sort((a,b)=>Math.hypot(a[0]-x0,a[1]-z0)-Math.hypot(b[0]-x0,b[1]-z0)).slice(0,n);}
      for(const q of pts){const L={x:q[0],y:y9,z:q[1],ry:rn()*6.2832,rx:(rn()-.5)*tilt,rz:(rn()-.5)*tilt,d:voisin(d,.6,.32)};R.push(L);
        it.push(()=>liasse(L.x,L.y,L.z,L.ry,L.rx,L.rz,L.d));}
      vole();y+=LT*.96;bas=pts;});
    glissades(x0,z0,R,d,ng,it);
    return {it:it,a:0,ty:'tas'};};
  // LES TAS BAS du couloir de la caméra (3 couches : 33 cm, sous les 45 cm de la règle) — puis LES GROS TAS au pied des murs (5 couches)
  const bas=choisir(5.1,8.1,.72,1.7,10,[]),gros=choisir(8.4,11.2,1.0,2.2,7,bas);
  const TB=bas.map((c,i)=>tas(c[0],c[1],[[6,.55],[4,.4],[2,.22]],DB[i%DB.length],1+(i%2))),TG=gros.map((c,i)=>tas(c[0],c[1],[[9,.8],[7,.62],[5,.46],[3,.3],[1,.08]],DG[i%DG.length],2+(i%2)));
  // LES MEUBLES : des piles bien rangées sur ce qui est plat (colonnes [dx, dz], couches)
  let np=0;const pile=(x,y,z,ry,cols,couches)=>{const it=[],d=DM[np++%DM.length];for(let l=0;l<couches;l++)for(const c9 of cols){const d9=voisin(d,.72,.26);
      it.push(()=>liasse(x+c9[0]+(rn()-.5)*.02,y+l*LT,z+c9[1]+(rn()-.5)*.02,ry+(rn()-.5)*.08,0,0,d9));}return {it:it,a:0,ty:'pile'};};
  /* (2026-11-07, Sacha : « dans le garage il y a des tas de billets qui flottent ») les deux piles « sur les fûts » (−6,6 et −4,6 ; 1 m)
     sont ENLEVÉES : les fûts ont disparu de l'atelier (« l'atelier aéré », garage-salle.js), les liasses restaient à 1 m dans le vide. */
  const M9=[
    pile(10.3,2.13,8.4,Math.PI/2,[[0,-.27],[0,.27]],4),                        // sur le distributeur
    pile(9.6,.57,2.93,0,[[0,0]],3),pile(9.6,1.72,3.8,0,[[0,0]],3),            // les étagères du rack (places libres entre bacs, cartons, jantes)
    pile(-9.4,1.26,-1.6,Math.PI/2,[[0,-.36],[0,.36]],4),                       // la servante
    pile(9.6,2.87,3.25,0,[[0,0]],3),pile(9.6,.57,5.2,0,[[0,0]],3),
    pile(-3.1,.98,-11.95,0,[[-.27,0],[.27,0]],5),pile(.95,.98,-11.95,0,[[-.27,0],[.27,0]],4),pile(-7.45,.98,-11.95,Math.PI/2,[[0,0]],4), // l'établi (derrière la caméra)
    pile(9.6,1.72,5.2,0,[[0,0]],3),pile(9.6,2.87,1.55,0,[[0,0]],3),pile(9.6,4.02,3.55,0,[[0,0]],2)];
  // LES PALETTES (riche) : contre les murs, au-delà de l'orbite — 1 palette + 10 couches de 8 liasses (1,23 m)
  /* (2026-11-07) en STRATES : deux ou trois coupures qui alternent par bandes de 2 ou 3 couches, et une liasse égarée de loin en loin */
  const pal=(x,z,ry,d)=>{const it=[()=>palette(x,z,ry)],c=Math.cos(ry),s=Math.sin(ry),cols=[d,voisin(d,0,1),voisin(d,0,.7)],bs=2+((rc()*2)|0);
    for(let l=0;l<10;l++){const dl=cols[((l/bs)|0)%cols.length];for(let j=0;j<4;j++)for(let i=0;i<2;i++){const lx=(i-.5)*.505+(rn()-.5)*.012,lz=(j-1.5)*.232+(rn()-.5)*.012,d9=rc()<.04?(rc()*NC)|0:dl;
      it.push(()=>liasse(x+c*lx+s*lz,.127+l*LT,z-s*lx+c*lz,ry+(rn()-.5)*.03,0,0,d9));}}
    return {it:it,a:0,ty:'palette'};};
  const P9=PAL.map((p9,i)=>pal(p9[0],p9[1],p9[2],DP[i%DP.length]));
  /* LES TOURS (2026-11-07) : deux liasses côte à côte, la couche suivante en travers (Jenga), chaque couche vrillée de 4° de plus et un peu
     décalée (la tour penche, son centre reste sur sa base) ; la couleur change toutes les deux couches. Contre les murs, au-delà des
     8,3 m, jamais devant l'affiche du record ni l'étal du moteur. */
  const tour=(x0,z0,nl,d,phi0)=>{const it=[],psi=rn()*6.2832,pen=.007+rn()*.006;let dl=d;
    for(let l=0;l<nl;l++){if(l%2===0&&l)dl=voisin(dl,.3,.6);const ry=phi0+l*(Math.PI/2+.075),cx=x0+Math.cos(psi)*pen*l,cz=z0+Math.sin(psi)*pen*l,px=Math.sin(ry),pz=Math.cos(ry);
      for(const sg of [-1,1]){const T={x:cx+px*sg*.126+(rn()-.5)*.012,z:cz+pz*sg*.126+(rn()-.5)*.012,ry:ry+(rn()-.5)*.04,d:rc()<.85?dl:voisin(dl,0,.8)};
        it.push(()=>liasse(T.x,l*LT,T.z,T.ry,0,0,T.d));}}
    return {it:it,a:0,ty:'tour'};};
  const haute=(x,z)=>!(z>8.2&&x>-9&&x<-4.1)&&!(z>8.2&&x>3.8&&x<8.2);
  /* deux tours de chaque côté de la caisse (à la 1re capture, les quatre s'alignaient sur le même mur) */
  const tg=choisir(8.6,11.6,.45,3,2,bas.concat(gros),(x,z)=>x<0&&haute(x,z)),tours=tg.concat(choisir(8.6,11.6,.45,3,2,bas.concat(gros,tg),(x,z)=>x>0&&haute(x,z)));
  const TT=tours.map((c,i)=>tour(c[0],c[1],[16,12,14,10][i%4],[4,5,3,6][i%4],rn()*1.5708));
  /* LES ÉVENTAILS (2026-11-07) : cinq à huit billets ouverts autour d'un même coin, chacun un peu au-dessus du précédent */
  const eventail=(x0,z0,nb,phi0,d)=>{const it=[];
    for(let i=0;i<nb;i++){const ry=phi0+(i-(nb-1)/2)*.24,F={x:x0+Math.cos(ry)*BL*.36,z:z0-Math.sin(ry)*BL*.36,y:i*.0052,ry:ry,rx:(rn()-.5)*.03,d:voisin(d,.5,.35)};
      it.push(()=>billet(F.x,F.y,F.z,F.ry,F.rx,0,F.d));}
    return {it:it,a:0,ty:'eventail'};};
  /* (après capture) rien d'épars au PREMIER PLAN : côté caméra (z < −1) et à moins de 8,5 m, un billet seul est énorme à l'écran */
  const devant=(x,z)=>z>-1||Math.hypot(x,z)>8.5;
  const evs=choisir(4.4,10.6,.5,1.8,9,bas.concat(gros,tours),devant);
  const TE=evs.map(c=>eventail(c[0]+(rc()-.5)*.3,c[1]+(rc()-.5)*.3,5+((rc()*4)|0),rc()*6.2832,(rc()*NC)|0));
  /* LE TAPIS (2026-11-07, riche) : des billets épars sur le sol libre, rangés du plus proche d'un tas au plus loin (bruité) — l'argent
     déborde des tas et gagne la pièce ; quatre anneaux qui s'ouvrent l'un après l'autre. Jamais sous la caisse, ni sous un tas, une tour
     ou un éventail (deux billets au même niveau scintilleraient). */
  /* (après capture : 360 billets de toutes les couleurs faisaient des CONFETTIS) 260 au plus, et chacun prend surtout la coupure du tas
     le plus proche : l'argent coule de SES tas. Sur l'anneau où tourne la caméra (moins de 8 m), seulement près d'un tas : un billet
     isolé sous l'objectif faisait la moitié de l'écran. */
  const occ=[].concat(bas.map((c,i)=>[c[0],c[1],1.45,DB[i%DB.length]]),gros.map((c,i)=>[c[0],c[1],1.7,DG[i%DG.length]]),tours.map(c=>[c[0],c[1],.6,-1]),evs.map(c=>[c[0],c[1],.8,-1]));
  const tap=[];for(let x=-10.4;x<=10.4;x+=.52)for(let z=-12.4;z<=12.4;z+=.52){const px=x+(rc()-.5)*.36,pz=z+(rc()-.5)*.36;
    if(Math.hypot(px,pz)<3.4||!libre(px,pz,.14))continue;let dm=99,dp=3,ok=true;for(const o of occ){const d9=Math.hypot(px-o[0],pz-o[1]);if(d9<o[2]){ok=false;break;}if(d9<dm&&o[3]>=0){dm=d9;dp=o[3];}}
    if(ok&&(dm<2.2||Math.hypot(px,pz)>=8)&&devant(px,pz))tap.push([px,pz,dm+rc()*1.6,dp]);}
  tap.sort((a,b)=>a[2]-b[2]);
  const NT=Math.min(tap.length,260),TA=[0,1,2,3].map(()=>({it:[],a:0,ty:'tapis'}));
  for(let i=0;i<NT;i++){const q=tap[i],F={x:q[0],z:q[1],y:(i%5)*.0013,ry:rc()*6.2832,rx:(rc()-.5)*.05,rz:(rc()-.5)*.05,d:voisin(q[3],.45,.3)};
    TA[Math.min(3,(i*4/NT)|0)].it.push(()=>billet(F.x,F.y,F.z,F.ry,F.rx,F.rz,F.d));}
  // les seuils d'ouverture : tas bas et meubles entremêlés (ce qu'on voit d'abord), les gros tas, puis les palettes quand on devient riche
  const ord=[],A1=[0,1,3,6,8,11,14,17,21,25,29,33,38,43,48,54,60,66,72,80,88,96,104,112];
  for(let i=0,ti=0,mi=0;ti<TB.length||mi<M9.length;i++){const p9=(i%2===0&&ti<TB.length)||mi>=M9.length?TB[ti++]:M9[mi++];p9.a=A1[Math.min(i,A1.length-1)]+Math.max(0,i-A1.length+1)*8;ord.push(p9);}
  TG.forEach((p9,i)=>{p9.a=70+i*28;ord.push(p9);});
  const A2=[160,240,340,460,600,760];P9.forEach((p9,i)=>{p9.a=A2[i];ord.push(p9);});
  /* (2026-11-07) les éventails tôt (le garage d'un débutant vit déjà), les tours au milieu, le tapis quand on est riche */
  const A3=[3,7,12,18,26,36,50,66,84];TE.forEach((p9,i)=>{p9.a=A3[i]!=null?A3[i]:90+i*12;ord.push(p9);});
  const A4=[110,190,290,420];TT.forEach((p9,i)=>{p9.a=A4[i]!=null?A4[i]:420+i*90;ord.push(p9);});
  const A5=[330,450,600,780];TA.forEach((p9,i)=>{p9.a=A5[i];if(p9.it.length)ord.push(p9);});
  // ---- LA FILE : à chaque pas, la place ouverte la MOINS remplie reçoit l'objet suivant ----
  const offs=[0],fait=ord.map(()=>0);
  for(let n=0;;n++){let best=-1,bf=2;
    for(let k=0;k<ord.length;k++){const p9=ord[k];if(p9.a>n||fait[k]>=p9.it.length)continue;const f=fait[k]/p9.it.length;if(f<bf){bf=f;best=k;}}
    if(best<0){if(ord.every((p9,k)=>fait[k]>=p9.it.length))break;offs.push(P.length/3);continue;} // un seuil pas encore atteint : l'objet n (rien de neuf)
    ord[best].it[fait[best]++]();offs.push(P.length/3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  geo.computeVertexNormals();lpOmbre(geo,.6); // l'ombre cuite au pied des tas (celle des meubles)
  let mt=null;for(const m9 of GAR.meubles||[])if(m9.material&&m9.material.userData&&m9.material.userData.g==='m'){mt=m9.material;break;}
  if(!mt){mt=lpMat('m');if(!mt.envMap){mt.envMap=envTex;mt.combine=THREE.MixOperation;mt.reflectivity=0;}}
  const me=new THREE.Mesh(geo,mt);me.matrixAutoUpdate=false;me.updateMatrix();me.visible=false;g.add(me);
  /* (2026-11-07) LE MESH DE LA CASCADE : vide tant que rien ne tombe (voir garCasCap), même matière, même repère */
  const vol=new THREE.Mesh(new THREE.BufferGeometry(),mt);vol.matrixAutoUpdate=false;vol.updateMatrix();vol.frustumCulled=false;vol.visible=false;vol.userData.cap=0;g.add(vol);
  const types={};for(const p9 of ord)types[p9.ty]=(types[p9.ty]||0)+p9.it.length;
  GARG.mesh=me;GARG.vol=vol;GARG.src={p:geo.attributes.position.array,nm:geo.attributes.normal.array,c:geo.attributes.color.array};GARG.types=types;
  GARG.offs=offs;GARG.n=-1;GARG.cible=-1;GARG.bank=-1;GARG.cas=null;GARG.places=ord.length;GARG.ms=Math.round(performance.now()-t00);
  GARG.pos={bas:bas.map(c=>[c[0],c[1]]),gros:gros.map(c=>[c[0],c[1]]),tours:tours.map(c=>[c[0],c[1]]),eventails:evs.map(c=>[c[0],c[1]])};garArgentMaj();
}
