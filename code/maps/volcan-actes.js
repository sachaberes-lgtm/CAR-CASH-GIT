/* ===== LE VOLCAN EN ACTES (2026-10-23, Sacha : « pas du tout assez bien et divertissant : mets-toi dans la peau d'un designer de jeu vidéo senior et fais ça bien ») =====
   LE CONSTAT (banc des tracés, vue de dessus + profil) : la balade d'avant était un fil qui serpente dans une direction, UNE descente, puis la spirale — aucun
   moment fort, aucune surprise, la même courbe d'intensité partout. LE PRINCIPE : une course de 20-45 s (4-6 km) est une suite de TEMPS FORTS, chacun avec
   son identité (on le reconnaît, on s'en souvient), son annonce (on le voit venir), son défi, puis sa récompense (un souffle, un panorama) — et le défi de
   VISIBILITÉ (la cendre) est posé sur les temps forts, pas au hasard : il y a toujours un moment où l'on y voit clair pour viser.
   LES ACTES (tirés au hasard, 2 à 4 selon la longueur visée ; l'ordre aussi) :
     LA FAILLE   · la route PLONGE : des LACETS qui descendent la paroi (2 ou 4 épingles à 178°), ou une PLONGÉE en S larges (11-14 %), ou des MARCHES de lave.
                   Sous la CENDRE (tempête k 0,95) : on lit la route au dernier moment.
     LA CRÊTE    · on GRIMPE (9-12 %, des S) puis la route se casse net : le RESSAUT lance la caisse, la descente à 12-14 % l'attend ; ou LES ROULEAUX (trois
                   bosses de 15-20 m à la suite : les montagnes russes). La cendre s'arrête 130 m AVANT la crête : on voit le tremplin.
     LE LAC      · le SOUFFLE : air limpide, la lave partout, des courbes larges — la traversée, ou l'ANNEAU (la route fait le tour d'un lac, 150-190°, et
                   l'axe de la map se retourne), un pont de basalte. Aucune cendre : c'est le panorama.
     LE RACCOURCI· la BOUCLE (celle de la v4, éprouvée) : un tour complet qui descend de 36-44 m — ne pas tourner, voler tout droit et retomber sur la sortie.
   Entre eux des LIENS (un module moyen : slalom, corde, chicane, houle, crochet, geysers — la cendre sur les trois premiers une fois sur deux — et les
   fumerons), l'INTRO (la plaine de cendre : courbes larges, l'arche, une première petite bosse) et le FINAL, toujours la montée en spirale du volcan
   (cendre sur sa 2e moitié, dégagée sur les 100 derniers mètres pour voir le portail). La route sort `Q.actes` et `Q.orages` (lus par buildVolcanG).
   Gardés : les rayons (rM), la butée de cap, le contrôle des croisements, le cône taillé pour la spirale (vlc3Cone), la longueur visée (`longueurCible`).
   `?sans=volcanactes` = la route d'avant (vlcTraceH). */
const VLC_ACTES=!/[?&]sans=([^&]*,)?volcanactes(,|&|$)/.test(location.search);
function vlcTraceA(rnd,LV){
  const rh=mulberry32((rnd()*4294967296)>>>0),rv=mulberry32((rh()*4294967296)>>>0);
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const Rs=()=>rM*(1.30+rh()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,200);return a+rh()*(b-a);},Rl=()=>Math.max(rM*2,200)+rh()*90;
  // LA PENTE (positive = on descend) : la plaine respire à peine (± 2 %), les temps forts posent leur PROFIL (gM) par-dessus, la boucle a le sien (gL, gF)
  const ph1=rh()*6.283,ph2=rh()*6.283;let gF=null,gL=null,gM=null,mode=0;
  const pente=s9=>{if(gL&&s9>=gL.s0&&s9<gL.s0+gL.l)return gL.a;if(gF!=null)return gF;
    let g=mode===2?.004+.01*Math.sin(s9/420*6.283+ph1):mode===3?0:.004+.014*Math.sin(s9/520*6.283+ph1)+.008*Math.sin(s9/230*6.283+ph2);
    if(s9<280)g=.01+(g-.01)*THREE.MathUtils.smoothstep(s9,160,280);
    return Math.max(-.15,Math.min(.15,Math.max(-.05,Math.min(.06,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0)));};
  let P=new THREE.Vector3(0,0,0),phi=0,s=0,y=0;
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=Math.max(2,Math.round(l/25));for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  let AX0=0,AX=0;const LIM=72,rel=()=>wrap(phi-AX)*57.2958;
  const tourne=(aDeg,R)=>{const r9=rel();let a=aDeg;if(r9+a>LIM)a=LIM-r9;if(r9+a<-LIM)a=-LIM-r9;if(Math.abs(a)>2)arc(a,R);return a;};
  const vers=(cible,R)=>{const a=wrap(cible*Math.PI/180+AX-phi)*57.2958;if(Math.abs(a)>3)arc(a,R);};
  let sg=rh()<.5?-1:1;
  const vAxe=()=>{if(Math.abs(rel())>20)vers((rel()>0?1:-1)*12,rM*(1.7+rv()*.3));};
  // DES COURBES qui alternent de part et d'autre de l'axe, sur une longueur donnée (a0 + da : l'angle ; Rf : le rayon)
  const sCourbes=(L9,a0,da,Rf)=>{const s0=s;for(let n=0;(s-s0<L9-30*KV||!n)&&n<24;n++){const sb=s,r9=rel();sg=Math.abs(r9)>28?(r9>0?-1:1):-sg;tourne(sg*(a0+rh()*da),Rf());if(s-sb<5)droite(60*KV);if(rh()<.25)droite((25+rh()*40)*KV);}};
  // LES PROFILS DE PENTE : posés sur une longueur, en mètres depuis le début (f(d, L9)) ; A > 0 = on descend
  const profil=(L9,f)=>{const s0=s;gM={s0:s0,s1:s0+L9,f:function(s9){return f(s9-s0,L9);}};};
  const trap=(A,k)=>(d,L9)=>{const u=d/L9;return A*Math.min(1,u*k,(1-u)*k);};
  // LE RESSAUT : on monte à Aup sur La, la route SE CASSE (30 m) et plonge à Adn sur Lb — la caisse décolle à la crête
  const cretePr=(La,Aup,Lb,Adn)=>(d)=>d<La-15?-Aup*Math.min(1,d/80):d<La+15?-Aup+(Aup+Adn)*(d-La+15)/30:d<La+Lb?Adn*Math.min(1,(La+Lb-d)/110):0;
  const ACT=[],MS=[],lacs=[],lacsS=[],geyS=[],ponts=[],tours=[],arches=[],sauts=[];
  const LC9=typeof longueurCible==='function'?longueurCible():0;
  // ---------- LES LIAISONS ET LES COUDES ----------
  const CAR=['virages','houle','serpent','derive','cassures'],PLAN=[];let cLast=-1;
  const liaison=n=>{let c=(rh()*5)|0;if(c===cLast)c=(c+1+((rh()*4)|0))%5;cLast=c;PLAN.push(CAR[c]);let dS=1;
    for(let k=0;k<n;k++){const r9=rel();
      if(c===0){sg=Math.abs(r9)>30?(r9>0?-1:1):-sg;tourne(sg*(36+rh()*28),rh()<.33?Rs():Rn());if(rh()<.2)droite((30+rh()*40)*KV);}
      else if(c===1){sg=Math.abs(r9)>25?(r9>0?-1:1):-sg;tourne(sg*(26+rh()*18),rM*(2.2+rh()*.8));droite((20+rh()*40)*KV);}
      else if(c===2){for(let j=0;j<2;j++){const r8=rel();sg=Math.abs(r8)>35?(r8>0?-1:1):-sg;tourne(sg*(46+rh()*18),rM*(1.3+rh()*.3));}}
      else if(c===3){if(!k){dS=(r9>0?1:-1)*(rh()<.7?1:-1);vers(dS*(48+rh()*14),rM*2.1);}sg=-sg;tourne(sg*(14+rh()*10),rM*(2+rh()*.6));droite((30+rh()*40)*KV);}
      else{droite((70+rh()*70)*KV);sg=Math.abs(r9)>20?(r9>0?-1:1):(rh()<.5?-1:1);tourne(sg*(28+rh()*22),Rn());}}};
  const coude=()=>{if(rh()<.55){const d=(rh()<.5?-1:1)*(8+rh()*10)/57.2958;AX=AX0+Math.max(-18/57.2958,Math.min(18/57.2958,wrap(AX+d-AX0)));}};
  // ---------- LES MODULES MOYENS (les liens) ----------
  const vSlalom=()=>{vAxe();const n=3+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=rel()>0?-1:1;tourne(s9*a*.5,R);for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const vCorde=()=>{const T=90+rv()*25,s9=rel()>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((30+rv()*30)*KV);
    tourne(s9*a1,R);droite((30+rv()*40)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((30+rv()*30)*KV);};
  const vChicane=()=>{vAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=rel()>0?-1:1;droite(40*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(40*KV);};
  const vHoule=()=>{vAxe();const n=2,lam=(280+rv()*60)*KV,amp=.07+rv()*.03,L9=n*lam;profil(L9,(d,L)=>{const u=d/L;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);});
    let s9=rel()>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;};
  const vGeysers=()=>{vAxe();const s0=s,a=48+rv()*16,R=rM*(1.7+rv()*.3),s9=rel()>0?-1:1;droite(30*KV);tourne(s9*a,R);droite((30+rv()*20)*KV);tourne(-s9*a,R);droite(40*KV);geyS.push([s0,s]);};
  const vCrochet=()=>{const s9=rel()>0?-1:1;vers(-s9*(44+rv()*10),rM*(1.8+rv()*.3));droite((40+rv()*30)*KV);tourne(s9*(112+rv()*20),rM*(1.45+rv()*.25));droite((50+rv()*30)*KV);};
  const MOY=[['slalom',vSlalom,1],['corde',vCorde,1],['chicane',vChicane,1],['houle',vHoule,0],['crochet',vCrochet,0],['geysers',vGeysers,0]];let moyPaq=[],moyLast=-1;
  const moyen=()=>{if(!moyPaq.length){moyPaq=MOY.map(function(_,i){return i;});for(let i=moyPaq.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=moyPaq[i];moyPaq[i]=moyPaq[j];moyPaq[j]=x;}}
    let m=moyPaq.shift();if(m===moyLast&&moyPaq.length)m=moyPaq.shift();moyLast=m;const s0=s;MOY[m][1]();MS.push({nom:MOY[m][0],s0:s0,s1:s,orage:MOY[m][2]});};
  const fumeron=()=>{droite((70+rh()*50)*KV);const r9=rel();sg=Math.abs(r9)>12?(r9>0?-1:1):(rh()<.5?-1:1);const s0=s,a=tourne(sg*(55+rh()*30),Rs());tours.push({s0:s0,s1:s,a:Math.round(a)});};
  const pArche=()=>{vAxe();droite(50*KV);droite(80*KV);arches.push({p:P.clone(),phi:phi,s:s});droite(80*KV);};
  // ---------- LES TEMPS FORTS ----------
  const lacets=dir=>{vAxe();const n=2*(1+(rv()<.35?1:0)),R=rM*(1.5+rv()*.35),leg=(55+rv()*60)*KV;let sd=rel()>0?-1:1;
    profil(n*Math.PI*R+(n+1)*leg,trap(dir*(.115+rv()*.03),5));droite(leg);for(let k=0;k<n;k++){arc(sd*178,R);droite(leg);sd=-sd;}gM=null;vers(0,R*1.4);};
  const plongee=()=>{vAxe();const L9=(600+rv()*300)*KV;profil(L9,trap(.12+rv()*.025,4));sCourbes(L9,36,22,()=>rM*(2.1+rv()*.7));gM=null;};
  const marches=()=>{vAxe();for(let k=0;k<2;k++){const L1=(250+rv()*100)*KV;profil(L1,trap(.10+rv()*.03,5));sCourbes(L1,30,20,()=>rM*(2+rv()*.6));gM=null;if(!k)droite(70*KV);}};
  const faille=o=>{const v=rh();if(v<.4){o.v='lacets';lacets(1);}else if(v<.75){o.v='plongee';plongee();}else{o.v='marches';marches();}};
  const ressaut=o=>{vAxe();const La=(480+rv()*240)*KV,Aup=.10+rv()*.02,Lb=(300+rv()*120)*KV,Adn=.13+rv()*.015,s0=s;profil(La+Lb,cretePr(La,Aup,Lb,Adn));
    sCourbes(La-110*KV,28,18,()=>rM*(2+rv()*.8));const rest=La-(s-s0);if(rest>5)droite(rest);o.c=s; // les 110 derniers mètres de la montée : DROIT (le tremplin se lit)
    sg=rel()>0?-1:1;tourne(sg*(30+rv()*14),rM*(2.4+rv()*.6));const r2=La+Lb-(s-s0);if(r2>5)droite(r2);gM=null;};
  const rouleaux=o=>{vAxe();const n=3,seg=[];let tot=0;for(let k=0;k<n;k++){const La=(190+rv()*70)*KV,Aup=.115+rv()*.015,Lb=(150+rv()*40)*KV,Adn=.14+rv()*.01;seg.push([tot,La,Aup,Lb,Adn]);tot+=La+Lb;}const s0=s;
    profil(tot,(d)=>{for(const q of seg)if(d<q[0]+q[1]+q[3])return cretePr(q[1],q[2],q[3],q[4])(d-q[0]);return 0;});
    for(const q of seg){const t0=s;droite(q[1]+q[3]*.55);sg=-sg;tourne(sg*(22+rv()*12),rM*(2.4+rv()*.6));const r2=q[1]+q[3]-(s-t0);if(r2>5)droite(r2);}gM=null;o.c=s0+seg[n-1][0]+seg[n-1][1];};
  const lacetsMontants=o=>{lacets(-1);const La=(260+rv()*100)*KV,Lb=(260+rv()*80)*KV,s0=s;profil(La+Lb,cretePr(La,.10,Lb,.14));droite(La);o.c=s;sg=rel()>0?-1:1;tourne(sg*(30+rv()*14),rM*(2.4+rv()*.6));const r2=La+Lb-(s-s0);if(r2>5)droite(r2);gM=null;};
  const crete=o=>{const v=rh();if(v<.45){o.v='ressaut';ressaut(o);}else if(v<.75){o.v='rouleaux';rouleaux(o);}else{o.v='lacets-montants';lacetsMontants(o);}};
  const lacTraverse=()=>{vAxe();mode=2;const sL0=s,n=2+((rh()*2)|0);droite(50*KV);for(let k=0;k<n;k++){const r9=rel();sg=Math.abs(r9)>20?(r9>0?-1:1):-sg;tourne(sg*(30+rh()*20),Rl());if(rh()<.4)droite((30+rh()*40)*KV);}lacs.push([sL0,s]);mode=0;};
  const vPont=()=>{vAxe();vers(0,rM*(1.8+rv()*.3));droite(30*KV);const l9=(220+rv()*100)*KV,amp=.04+rv()*.02,s0=s;profil(l9,(d)=>-amp*Math.cos(d/l9*Math.PI));droite(l9);gM=null;ponts.push([s0,s]);lacsS.push([s0+l9*.15,s-l9*.15,40]);droite(30*KV);};
  const lacAnneau=()=>{vAxe();mode=2;const sL0=s,R=Math.max(300,rM*(3.4+rh()*1.2)),sd=rel()>0?-1:1;droite(60*KV);arc(sd*(150+rh()*40),R);droite(50*KV);lacs.push([sL0,s]);mode=0;AX0=AX=phi;};
  const lac=o=>{const v=rh();if(v<.45){o.v='traversee';lacTraverse();}else if(v<.8){o.v='anneau';lacAnneau();}else{o.v='pont';lacTraverse();vPont();}};
  const hand=rh()<.5?-1:1;let nB=0;
  const boucle=o=>{vAxe();{const a=wrap(AX+(rv()-.5)*.5-phi)*57.2958;if(Math.abs(a)>3)arc(a,Math.max(220,rM*2)+rv()*60);}
    droite(140*KV);const tb=(nB++%2?1:-1)*hand,R1=rM*(1.25+rv()*.25),Dx=22+rv()*8,R2=R1+Dx/2,len=Math.PI*(R1+R2),drop=36+rv()*8,yE=y,pE=P.clone(),phE=phi,sE=s,lP=120*KV;
    gL={s0:s,l:lP,a:.16};gF=Math.max(.02,(drop-.16*lP)/Math.max(50,len-lP));arc(tb*180,R1);arc(tb*180,R2);gF=null;gL=null;
    sauts.push({e:pE,phi:phE,sE:sE,sS:s,yE:yE,yS:y,D:Dx,tb:tb,R1:R1});ici('b'+sauts.length);
    droite(Math.max(250,vw*2.4)+rv()*40);sg=rv()<.5?-1:1;arc(sg*(18+rv()*8),Rn());};
  const ACTES={faille:faille,crete:crete,lac:lac,raccourci:boucle};
  // ---------- LE FINAL : la spirale (budget d'abord : sa longueur fixe celui des actes) ----------
  const R1=Math.max(250,rM*2.4)*(1+rh()*.2),Rb=Math.max(450,rM*3.8);let tr=.95+rh()*.5,R0=Math.max(R1+140*tr,Rb*(.9+rh()*.3));
  if(LC9){const Lx=tr*Math.PI*(R0+R1);if(Lx>.55*LC9){tr=Math.max(.9,tr*.55*LC9/Lx);R0=Math.max(R1+140*tr,Math.min(R0,Rb*1.05));}}
  const TH=Math.min(tr*6.2832,(R0-R1)/135*6.2832),pM=.055+rh()*.02,phW=rh()*6.2832,AW=r=>Math.max(0,Math.min(25,(1/(1.5*rM)-1/r)*(r/6)*(r/6))),Lsp9=TH*(R0+R1)/2;
  // ---------- LE PLAN : les actes que la longueur tient, dans un ordre tiré ----------
  const B9=LC9?Math.max(1100,LC9-Lsp9-250):5000*KV,EST={intro:430*KV,faille:850*KV,crete:950*KV,lac:720*KV,raccourci:1080*KV,lien:330*KV,arche:210*KV,fum:240*KV};
  const POOL=['faille','crete','lac','raccourci'];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=POOL[i];POOL[i]=POOL[j];POOL[j]=x;}
  const plan=[];let tot=EST.intro+230*KV;for(const k of POOL){if(plan.length>=(B9<1500*KV?1:2)&&tot+EST[k]>B9)continue;plan.push(k);tot+=EST[k];}
  const mots={arche:tot+EST.arche<=B9};if(mots.arche)tot+=EST.arche;
  const nLien=Math.max(0,Math.min(plan.length,Math.floor((B9-tot)/EST.lien)));if(nLien)tot+=nLien*EST.lien;
  const fumOk=B9-tot>EST.fum;
  // ---------- LA ROUTE ----------
  push();ici('depart');
  const o0={nom:'intro',s0:0};droite((110+rh()*60)*KV);if(mots.arche&&rh()<.6){pArche();mots.arche=0;}
  if(rh()<.55){const La=(140+rh()*40)*KV,Lb=(120+rh()*40)*KV;profil(La+Lb,cretePr(La,.07,Lb,.10));droite(La+Lb);gM=null;} // la première petite bosse : un avant-goût de vol
  sCourbes((300+rh()*150)*KV,24,20,()=>rM*(2.3+rh()*.9));o0.s1=s;ACT.push(o0);
  let li=0;
  for(let i=0;i<plan.length;i++){const nom=plan[i],o={nom:nom,s0:0};
    if(i||rh()<.5){liaison(1);coude();}
    if(mots.arche&&i===1){pArche();mots.arche=0;}
    o.s0=s;ACTES[nom](o);o.s1=s;ACT.push(o);
    if(li<nLien&&i<plan.length-1){moyen();li++;if(fumOk&&i===0)fumeron();}}
  while(li<nLien){moyen();li++;}
  if(mots.arche){pArche();mots.arche=0;}
  // LA MONTÉE DU VOLCAN : en travers de l'axe, le cône DEVANT, la spirale qui grimpe, le portail là-haut
  liaison(1);const hv=wrap(phi-AX0)>=0?1:-1;AX=AX0;vers(hv*90,Math.max(rM*2,220));droite(60*KV);
  const cA=new THREE.Vector3(P.x+R0*Math.cos(phi),0,P.z-R0*Math.sin(phi)),cB=new THREE.Vector3(P.x-R0*Math.cos(phi),0,P.z+R0*Math.sin(phi)),C=cA.z>cB.z?cA:cB;
  const b0=Math.atan2(P.x-C.x,P.z-C.z),yH0=y,sH0=s;ici('vlc0');gF=-pM;
  {const t0x=Math.sin(phi),t0z=Math.cos(phi),sgB=(Math.cos(b0)*t0x-Math.sin(b0)*t0z)>0?1:-1,nP=Math.max(60,Math.ceil(Lsp9/12));
    for(let k=1;k<=nP;k++){const t=k/nP,b=b0+sgB*TH*t,rL=R0+(R1-R0)*t,r=rL+AW(rL)*Math.sin(6*(b-b0)+phW)*Math.min(1,t*8,(1-t)*8);
      const nx=C.x+Math.sin(b)*r,nz=C.z+Math.cos(b)*r;phi=Math.atan2(nx-P.x,nz-P.z);avance(nx,nz);}
    var bFin=b0+sgB*TH;}
  gF=null;mode=3;const yH1=y,sSp=s;ici('vlc1');droite(60*KV);ici('fin');droite(50*KV);
  const th0=Math.min(b0,bFin),th1=Math.max(b0,bFin);
  // LE CONTRÔLE DES CROISEMENTS : un passage à moins de 70 m d'un autre tronçon ; avec moins de 32 m d'air = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  // LES LACS (un cercle par traversée ; ceux des ponts : marge 40 m au lieu de 180)
  const cercle=(a,b,m)=>{let sx=0,sz=0,n=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=a&&DN[i+3]<=b){sx+=DN[i];sz+=DN[i+2];n++;}if(!n)return null;
    const cx=sx/n,cz=sz/n;let r=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=a&&DN[i+3]<=b)r=Math.max(r,Math.hypot(DN[i]-cx,DN[i+2]-cz));return {x:cx,z:cz,r:r+m};};
  const LACS=[];for(const l of lacs){const c=cercle(l[0],l[1],180);if(c)LACS.push(c);}for(const l of lacsS){const c=cercle(l[0],l[1],l[2]);if(c){c.pont=1;LACS.push(c);}}
  let yMin=1e9;for(const p of ctrl)yMin=Math.min(yMin,p.y);const ySea=yMin-48;
  const lo=Math.min(yH0,yH1),hi=Math.max(yH0,yH1),rc9=Math.max(110,R1*.42),K=vlc3Cone(R0,lo-24,R1,hi-24,hi-24+1.6*(hi-lo)/Math.max(60,R0-R1)*(R1-rc9)+40,rc9,70,ySea);
  // LA CENDRE : où la visibilité s'effondre (s0, s1 en mètres de route, k l'intensité) — sur les temps forts, jamais sur le panorama ni sur le tremplin
  const OR=[],add=(a,b,k)=>{if(b-a>90)OR.push({s0:Math.max(380,a),s1:b,k:k});};
  for(const a of ACT){if(a.nom==='faille')add(a.s0+40,a.s1-30,.95);else if(a.nom==='crete'&&a.c)add(a.s0,a.c-130*KV,.9);else if(a.nom==='intro')continue;}
  for(const m of MS)if(m.orage&&rh()<.5)add(m.s0-80*KV,m.s1,.85);
  add(sH0+(sSp-sH0)*.42,sSp-90,1);
  // L'AXE : la route dessinée face à +z TOURNE EN BLOC autour du départ
  const AXE=rh()*6.2832-3.1416,c9=Math.cos(AXE),s9=Math.sin(AXE),ro=v=>{const x=v.x*c9+v.z*s9;v.z=v.z*c9-v.x*s9;v.x=x;};
  for(const p of ctrl)ro(p);ro(C);for(const k in Q){ro(Q[k].p);Q[k].phi+=AXE;}for(const a of arches){ro(a.p);a.phi+=AXE;}for(const l of LACS)ro(l);for(const S of sauts){ro(S.e);S.phi+=AXE;}
  const hzN=ACT.map(function(a){return a.nom+(a.v?':'+a.v:'');});
  Q.tours=tours;Q.arches=arches;if(arches.length)Q.arche=arches[0];Q.lacs=LACS;Q.geyS=geyS;Q.ponts=ponts;Q.actes=ACT;Q.orages=OR;
  const lacP=LACS.find(function(l){return !l.pont;})||null;
  return {ctrl:ctrl,K:K,C:C,K2:null,C2:null,Q:Q,plg:[],sauts:sauts,sSp:sSp,ySea:ySea,conflits:conflits,croise:croise,th0:th0+AXE,th1:th1+AXE,lac:lacP,mods:[],
    hz:{recette:'actes',axe:Math.round(AXE*57.2958),plan:hzN,mods:MS.map(function(m){return m.nom;}),liaisons:PLAN,arches:arches.length,lacs:LACS.length,fumerons:tours.length,orages:OR.length,LC:Math.round(LC9),B9:Math.round(B9),L:Math.round(s)}};
}
