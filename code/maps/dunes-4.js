/* ===== LES SCÈNES DES DUNES (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt ») =====
   Une MAP A DES LIEUX : jade a ses piliers, la forêt ses géants, la grotte ses salles. Les dunes en ont désormais — chaque tronçon de route (entre deux sauts) peut recevoir une SCÈNE, tirée
   dans le flux du décor (`D.sd`) : LA PORTE DU DÉPART (deux pylônes de part et d'autre de la route, les mâts et leurs oriflammes), L'ALLÉE DES SPHINX (des paires qui regardent la route, des
   obélisques entre elles), LA RANGÉE DE COLOSSES (quatre pharaons assis, façon Abou Simbel), LA COLONNADE (deux files de géants à architraves, certains brisés, des tambours à terre : elle
   mène aux pyramides) et LES RUINES éparses. Le sable tombait trop vite au bord de la route (une crête, des flancs à 22-32°) pour qu'on y pose quoi que ce soit : chaque scène a son PLATEAU
   (S.pw : sa demi-largeur depuis l'axe, qui monte et s'élargit en douceur sur 120 m avant la scène, dnProfil le lit) — le sable s'y tient à hauteur de la dalle. Les colonnes, colosses,
   sphinx et pylônes TUENT en vol (ils entrent dans DN.mo). `?sans=dunesscenes` = sans elles. */
const DN_SCN={on:!/[?&]sans=([^&]*,)?dunesscenes(,|&|$)/.test(location.search)};
function dnPos(S,s,lat){const i=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));return {x:S.x[i]-S.tz[i]*lat,z:S.z[i]+S.tx[i]*lat,yr:S.y[i],t:Math.atan2(S.tx[i],S.tz[i]),i:i};}
// les tronçons de route (hors sauts) : [{a, b, courbe}] — `courbe` = le cap total tourné (rad) : une longue droite = une scène de monuments
function dnTroncons(){const S=DN.S,out=[];if(!S)return out;let a=0;const cut=(a9,b9)=>{if(b9-a9<150)return;let tot=0,p=null;for(let s9=a9;s9<=b9;s9+=24){const i=Math.max(0,Math.min(S.n-1,Math.round(s9/S.ds))),h=Math.atan2(S.tx[i],S.tz[i]);if(p!=null){let d=h-p;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;tot+=Math.abs(d);}p=h;}out.push({a:a9,b:b9,courbe:tot});};
  for(const v of DN.lev||[]){cut(a,v.s);a=v.e;}cut(a,L);return out;}
/* LE PLAN DES SCÈNES (dans buildDunes, avant le monde : les plateaux entrent dans la route) : DN.scn = [{k, a, b, pw, …}] et S.pw (la demi-largeur du plateau, par échantillon) */
function dnPlanScenes(S,K,RH,D){
  DN.scn=[];DN.scnV=[];S.pw.fill(0);if(!DN_SCN.on||!D)return;const seg=dnTroncons();if(!seg.length)return;
  const rs=mulberry32((D.sd^0x5CE9E)>>>0),R=()=>rs(),Kc=Math.min(1.3,K),Kd=Math.min(1.25,K);
  /* LES OMBRES : chaque scène donne ses volumes (x, z, rayon, hauteur) à la grille d'ombre du travailleur (dnOmbre) — les mêmes positions que le placement, au hasard près (±3 m : sous une case de 44 m) */
  DN.scnV=[];const vol=(c)=>{const RH9=RH;
    if(c.k==='colonnade'){const sc=c.H/22,pas=26*sc*1.05,lat=RH9+8+3.8*sc+1.5;for(let s9=c.a;s9<=c.b;s9+=pas)for(const sg of [-1,1]){const q=dnPos(S,s9,sg*lat);DN.scnV.push({x:q.x,z:q.z,r:3.9*sc,h:c.H});}}
    else if(c.k==='allee'){const lat=RH9+c.len*.5+8,pas=c.len*2.2;for(let s9=c.a+c.len;s9<=c.b-c.len;s9+=pas)for(const sg of [-1,1]){const q=dnPos(S,s9,sg*lat);DN.scnV.push({x:q.x,z:q.z,r:c.len*.5,h:c.len*.5});}}
    else if(c.k==='colosses'){for(const sg of [-1,1])for(let k=0;k<2;k++){const q=dnPos(S,c.a+k*c.H*1.9,sg*(RH9+c.H*.29+9));DN.scnV.push({x:q.x,z:q.z,r:c.H*.34,h:c.H});}}
    else if(c.k==='porte'){const sc=c.H/30;for(const sg of [-1,1]){const q=dnPos(S,(c.a+c.b)/2,sg*(RH9+7*sc+8));DN.scnV.push({x:q.x,z:q.z,r:c.H*.3,h:c.H});}}};
  const ajoute=(k,a,b,pw,ex)=>{DN.scn.push(Object.assign({k:k,a:Math.round(a),b:Math.round(b),pw:Math.round(pw)},ex||{}));vol(DN.scn[DN.scn.length-1]);
    for(let i=0;i<S.n;i++){const s9=i*S.ds,u=Math.max(0,Math.min(1,(s9-(a-120))/120))*Math.max(0,Math.min(1,((b+120)-s9)/120));if(u>0){const e=u*u*(3-2*u);if(S.pw[i]<pw*e)S.pw[i]=pw*e;}}};
  const faire=function(k,q){const L9=q.b-q.a;
    if(k==='porte'){const H=(38+R()*8)*Kd,sc=H/30,a=Math.max(q.a+40,Math.min(q.b-60,q.a+170+R()*Math.max(0,L9-340)));ajoute('porte',a-20,a+20,RH+22*sc+8,{H:H});return true;}
    if(k==='allee'){const len=(34+R()*10)*Kd,a=q.a+50,b=Math.min(q.b-40,a+380+R()*160);if(b-a>len*3.4){ajoute('allee',a,b,RH+len*1.0+16,{len:len});return true;}return false;}
    if(k==='colonnade'){const Hc=(36+R()*10)*Kc,sc=Hc/22,a=q.a+70,b=Math.min(q.b-40,a+360+R()*170);if(b-a>sc*26*5){ajoute('colonnade',a,b,RH+8+3.8*sc*2.2+10,{H:Hc});return true;}return false;}
    if(k==='colosses'){const H=(46+R()*10)*Kd,a=q.a+90+R()*Math.max(0,L9-H*3.4-180),b=a+H*1.9+40;if(b<q.b-40){ajoute('colosses',a,b,RH+H*.6+16,{H:H});return true;}return false;}
    return false;};
  // le DÉPART a sa porte ; l'ARRIVÉE sa colonnade (4 fois sur 5, sinon une allée) ; le milieu : l'allée, les colosses, parfois une 2e porte, parfois une 2e colonnade — dans un ordre tiré
  faire('porte',seg[0]);
  const dern=seg.length>1?seg[seg.length-1]:null;if(dern){if(R()<.8){if(!faire('colonnade',dern))faire('allee',dern);}else faire('allee',dern);}
  const mid=seg.slice(1,Math.max(1,seg.length-1)),kinds=['allee','colosses'];if(R()<.5)kinds.push('porte');if(R()<.4)kinds.push('colonnade');
  for(let i=kinds.length-1;i>0;i--){const j=(R()*(i+1))|0,t=kinds[i];kinds[i]=kinds[j];kinds[j]=t;}
  // « l'avenue » du tirage (les obélisques) porte une allée si elle existe
  const av=DN.sQ&&DN.sQ.obel0!=null?mid.findIndex(function(q){return DN.sQ.obel0>=q.a-20&&DN.sQ.obel0<=q.b;}):-1;if(av>=0){const k=kinds.indexOf('allee');if(k>=0){kinds.splice(k,1);}faire('allee',mid[av]);mid.splice(av,1);}
  for(let i=0;i<mid.length&&i<kinds.length;i++)faire(kinds[i],mid[i]);}
// un décor posé à (x, z) : le plateau le tient à la hauteur de la dalle ; sinon un PODIUM de pierre rattrape le sable (jamais plus de 26 m) — rend la hauteur de la base
const o9s={};
function dnAssise(cuis,x,z,yr,larg,rot){const h=dnHauteur(x,z,o9s);if(o9s.eau)return null;const yb=Math.max(h-.3,yr-1.2);if(yb-h>26)return null;
  if(yb-h>1.2){const w9=larg*1.15+(yb-h)*.12;cuis(dnMod('bloc'),x,h-2,z,w9,yb-h+2,w9,rot,0,0,[.90,.80,.62]);cuis(dnMod('bloc'),x,yb-.5,z,w9*1.08,.9,w9*1.08,rot,0,0,[.96,.86,.68]);}return yb;}
function dnScenes(X){
  if(!DN_SCN.on||!DN.S||!DN.scn||!DN.scn.length)return;const S=DN.S,rg=X.rg,cuis=X.cuis,K=X.K,RH=X.RH,N=X.N,mo=DN.mo,M=n=>dnMod(n);N.sc=[];
  const kill=(k,x,y,z,r,h)=>{mo.push({k:k,x:x,y:y,z:z,r:r,h:h,a:0,t:0});};
  // LA COLONNADE : deux files de colonnes (une tous les ~26 m × l'échelle), un architrave entre deux colonnes voisines, des brisées, des tambours à terre
  const colonnade=(a,b,H)=>{const sc=H/22,pas=26*sc*1.05,lat=RH+8+3.8*sc+rg()*3;let n=0;
    for(let s=a;s<=b;s+=pas){for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat);if(S.gd[q.i]>.01)continue;
        const yb=dnAssise(cuis,q.x,q.z,q.yr,9*sc,q.t);if(yb==null)continue;const br=rg()<.18,hy=br?H*(.35+rg()*.4):H;
        cuis(M('colonne'),q.x,yb,q.z,sc,hy/22,sc,q.t);kill('colonne',q.x,yb,q.z,3.9*sc,hy);n++;
        if(br){const an=rg()*6.28,d=H*.25+rg()*H*.3,x2=q.x+Math.sin(an)*d,z2=q.z+Math.cos(an)*d;cuis(M('tambour'),x2,dnHauteur(x2,z2)+.6*sc,z2,2.3*sc,2.6*sc,2.3*sc,an,Math.PI/2*(rg()<.5?1:0),rg()*2);}
        else{const nx=dnPos(S,s+pas,sg*lat);if(nx.i!==q.i&&s+pas<=b){const ln=Math.hypot(nx.x-q.x,nx.z-q.z);cuis(M('bloc'),(q.x+nx.x)/2,yb+H*1.01,(q.z+nx.z)/2,3.4*sc,H*.07,ln,Math.atan2(nx.x-q.x,nx.z-q.z),0,0,[.94,.84,.66]);}}}}
    N.colonnade=n;N.sc.push(['colonnade',Math.round(a),Math.round(b)]);};
  // L'ALLÉE DES SPHINX : des paires tous les ~2,2 longueurs (un sphinx de chaque côté, le regard vers la route), un obélisque entre deux paires
  const allee=(a,b,len)=>{const lat=RH+len*.5+8,pas=len*2.2;let n=0;
    for(let s=a+len;s<=b-len;s+=pas){for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat);if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,len*.55,q.t);if(yb==null)continue;
        const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z);cuis(M('sphinx'),q.x,yb,q.z,len,len,len,ar);kill('sphinx',q.x,yb,q.z,len*.5,len*.5);n++;}
      const m=dnPos(S,s+pas/2,(rg()<.5?-1:1)*(RH+len*.55+10));if(S.gd[m.i]<=.01){const yb=dnAssise(cuis,m.x,m.z,m.yr,8,m.t);if(yb!=null){const hs=26+rg()*12;cuis(M('obelisque'),m.x,yb,m.z,hs/64*1.1,hs/64,hs/64*1.1,m.t);kill('obelisque',m.x,yb,m.z,4.4,hs);}}}
    N.allee=n;N.sc.push(['allee',Math.round(a),Math.round(b)]);};
  // LA RANGÉE DE COLOSSES : quatre pharaons assis (deux de chaque côté) qui regardent la route
  const colosses=(a,H)=>{let n=0;for(const sg of [-1,1])for(let k=0;k<2;k++){const q=dnPos(S,a+k*H*1.9,sg*(RH+H*.29+9));if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,H*.7,q.t);if(yb==null)continue;
      const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z);cuis(M('colosse'),q.x,yb,q.z,H,H,H,ar);kill('colosse',q.x,yb,q.z,H*.34,H);n++;}N.colosses=n;N.sc.push(['colosses',Math.round(a),Math.round(a+H*1.9)]);};
  // LA PORTE : deux pylônes de part et d'autre de la route, la baie le long d'elle
  const porte=(a,H)=>{const sc=H/30;for(const sg of [-1,1]){const q=dnPos(S,a,sg*(RH+7*sc+8));if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,H*.6,q.t);if(yb==null)continue;
      cuis(M('pylone'),q.x,yb,q.z,sc,sc,sc,q.t);kill('pylone',q.x,yb,q.z,H*.3,H);}N.portes=(N.portes|0)+1;N.sc.push(['porte',Math.round(a),Math.round(a)]);};
  for(const c of DN.scn){if(c.k==='porte')porte((c.a+c.b)/2,c.H);else if(c.k==='allee')allee(c.a,c.b,c.len);else if(c.k==='colonnade')colonnade(c.a,c.b,c.H);else if(c.k==='colosses')colosses(c.a,c.H);}
  // LES RUINES : des tambours, des têtes, des blocs, de part et d'autre, à 10-70 m du bord, sur chaque tronçon
  const seg=dnTroncons();let nr=0;for(const q of seg){const n9=Math.round((q.b-q.a)/38*PAL.b('dnRuines',1));for(let k=0;k<n9;k++){const s=q.a+rg()*(q.b-q.a),sg=rg()<.5?-1:1,lat=RH+10+rg()*rg()*60,p=dnPos(S,s,sg*lat);if(S.gd[p.i]>.01)continue;const g=dnHauteur(p.x,p.z,o9s);if(o9s.eau)continue;
      const r=rg();if(r<.45){const sc=(1.4+rg()*1.6)*K*.8;cuis(M('tambour'),p.x,g+.25*sc,p.z,sc,sc*(1.2+rg()*.8),sc,rg()*6.28,Math.PI/2,rg()*2);}
      else if(r<.62){const sc=(4+rg()*5)*K*.8;cuis(M('tete'),p.x,g-sc*.42,p.z,sc,sc,sc,Math.atan2(S.x[p.i]-p.x,S.z[p.i]-p.z)+(rg()-.5)*.8,(rg()-.5)*.5,(rg()-.4)*.4);}
      else{const sc=(2+rg()*4)*K*.8;cuis(M('bloc'),p.x,g-.4,p.z,sc*(1+rg()),sc*(.6+rg()*.6),sc*(1+rg()),rg()*6.28,(rg()-.5)*.4,(rg()-.5)*.4,[.88,.76,.58]);}nr++;}}N.ruines=nr;}
/* <<<FIN DUNES>>> */
