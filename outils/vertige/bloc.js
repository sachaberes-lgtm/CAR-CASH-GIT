  /* ================= LE VERTIGE (2026-11-12, voir GRT_VG) : le plan, les passages, les tenues, les modules de plus ================= */
  const VG=GRT_VERTIGE&&H9,V9=GRT_VG,VID=[],FOR={},NOMS=[],sm9=THREE.MathUtils.smoothstep;
  const EL=1.8-.8*Math.min(1,Math.max(0,(vw-78)/330)),sec=t=>t*EL*vw; /* la longueur (m) de t secondes RÉELLES : la caisse roule à ~1,8 × la croisière au palier 0, à la croisière passé le palier 25 (DUREE_ELAN) */
  let axeTot=0; /* de combien l'axe a tourné depuis l'entrée (°) */
  const tube=(sA,sB,f)=>{BOY.push({s0:sA,s1:sB,f:f});},vide=(sA,sB)=>{VID.push({s0:sA,s1:sB});};
  const marque=(i0,nom,e)=>{MM.push(Object.assign({i0:i0,i1:ctrl.length-1,nom:nom},e||{}));NOMS.push(nom);};
  const axeDe=p=>{axeTot+=wrap(p-axe)*57.2958;axe=p;}; /* l'axe suit la sortie d'un passage qui tourne (la spirale, le nœud) */
  const sensV=()=>Math.abs(axeTot)>50?(axeTot>0?-1:1):(rv()<.5?-1:1); /* le sens d'un passage qui tourne : celui qui ramène la grotte vers son axe d'entrée */
  /* ---------- LES PASSAGES : on change de salle en descendant ---------- */
  /* LE TOBOGGAN : un tube étroit où la route plonge (jusqu'à +0,24 de pente, ~30 % en tout), une courbe large au milieu une fois sur deux, et l'on débouche en haut de la salle suivante. La pente monte sur 42 % du tube :
     une crête plus sèche ferait décoller la caisse jusqu'à la voûte (la roche tue en vol). */
  const pToboggan=()=>{const T9=V9.toboggan,i0=ctrl.length-1,amp=T9.amp/KV,L1=T9.t*vw,d=rel()>0?-1:1;gDette=0;
    droite(.5*vw);const sA=s,sB=sA+L1;
    gM={s0:sA,s1:sB,f:function(sx){const u=(sx-sA)/L1;return amp*sm9(u,0,.42)*(1-sm9(u,.78,1));}};
    droite(L1*.4);if(rv()<.6)arc(d*(31+rv()*9),Math.max(Rl(),rM*2.4));else droite(L1*.2);droite(Math.max(20,sB-s));gM=null;
    tube(sA-.2*vw,sB-.2*vw,{rh:T9.rh,up:T9.up*Math.sqrt(KV),dn:T9.dn});droite(.7*vw);
    marque(i0,'pToboggan',{fig:'toboggan',tunnel:1});};
  /* LA CASCADE : trois marches en ligne droite — chacune plonge puis se redresse en tremplin : on vole de marche en marche, le vide ouvert dessous */
  const pCascade=()=>{const C9=V9.cascade,i0=ctrl.length-1,Lp=C9.t*vw,amp=C9.amp/Math.sqrt(KV);gDette=0;droite(.4*vw);const sA=s;
    gM={s0:sA,s1:sA+C9.n*Lp,f:function(sx){const u=((sx-sA)/Lp)%1;return u<.58?amp*Math.sin(Math.PI*u/.58):-.5*amp*Math.sin(Math.PI*(u-.58)/.42);}};
    droite(C9.n*Lp);gM=null;vide(sA,s);droite(.5*vw);marque(i0,'pCascade',{fig:'cascade'});};
  /* LA SPIRALE : 1,2-1,3 tour autour d'un vide, 15 % de pente (≥ 100 m d'air d'un tour à l'autre : on coupe en sautant par l'intérieur) ; la grotte repart à ~90° de là où elle arrivait */
  const pSpirale=()=>{const S9=V9.spirale,i0=ctrl.length-1,sg9=sensV(),R=rM*(S9.k[0]+rv()*S9.k[1]),T=S9.tours[0]+rv()*S9.tours[1];gDette=0;
    droite(.6*vw);const sA=s;gF=S9.pente;arc(sg9*T*360,R);gF=null;vide(sA-60,s+60);axeDe(phi);droite(.8*vw);marque(i0,'pSpirale',{g:1,fig:'spirale'});};
  /* LE NŒUD : trois quarts de tour en descente — la route repasse SOUS sa propre arrivée, qu'on voit au-dessus de soi (et d'où l'on peut sauter) */
  const pNoeud=()=>{const N9=V9.noeud,i0=ctrl.length-1,sg9=sensV(),R=rM*(N9.k[0]+rv()*N9.k[1]);gDette=0;
    droite(R+.9*vw);const sA=s;gF=N9.pente;arc(sg9*270,R);droite(R+.5*vw);gF=null;vide(sA-R,s);axeDe(phi);droite(.5*vw);marque(i0,'pNoeud',{g:1,fig:'noeud'});};
  const pSaut=()=>{const i0=ctrl.length-1,e9=gSaut();marque(i0,'gSaut',e9);};
  const pGouffre=()=>{gouf=true;droite((1.8+rv()*.35)*vw);gGouffre();NOMS.push('gGouffre');droite((1.2+rv()*.3)*vw);};
  const PASS={pToboggan:pToboggan,pCascade:pCascade,pSpirale:pSpirale,pNoeud:pNoeud,pSaut:pSaut,pGouffre:pGouffre};
  /* ---------- LES TENUES : une salle vécue ailleurs qu'au sol ---------- */
  /* les motifs d'une tenue AU PLAFOND : chacun rend le cap qu'il a pris (la somme de ses virages est nulle). Il le faut : la route retournée part de l'autre côté dans le monde, et le retournement de sortie ne la
     remet sur son plan que si elle en sort PARALLÈLE à son entrée (la suite n'est alors que décalée de côté, pas tournée). */
  const hS=()=>{const d=rv()<.5?-1:1,a=36+rv()*10,R=rM*(2+rv()*.5);arc(d*a*.5,R);arc(-d*a,R);arc(d*a*.5,R);};
  const hSlalom=()=>{const n=3+((rv()*3)|0),a=32+rv()*8,R=rM*(1.7+rv()*.3);let d=rv()<.5?-1:1;arc(d*a*.5,R);for(let k=0;k<n;k++){d=-d;arc(d*a,R);}arc(-d*a*.5,R);};
  const hChicane=()=>{const d=rv()<.5?-1:1,a=30+rv()*8,R=rM*(1.4+rv()*.2);arc(d*a,R);arc(-d*2*a,R);arc(d*a,R);};
  const hHoule=()=>{const lam=(170+rv()*40)*KV,amp=.06+rv()*.025,s0=s,L9=2*lam;gM={s0:s0,s1:s0+L9,f:function(sx){const u=(sx-s0)/L9;return amp*Math.sin(u*4*Math.PI)*Math.min(1,u*4,(1-u)*4);}};droite(L9);gM=null;};
  const hGrand=()=>{const d=rv()<.5?-1:1,a=52+rv()*14,R=rM*(2.3+rv()*.5);arc(d*a,R);droite((.5+rv()*.4)*vw);arc(-d*a,R);};
  const HOLD=[hS,hSlalom,hChicane,hHoule,hGrand],HOLDN=['S','slalom','chicane','houle','grand'];
  /* LA TENUE AU PLAFOND : un tube, la route s'y retourne (un demi-tour en `roulis` s réelles, sans horizon : la roche tourne avec la dalle) ; on débouche la tête en bas dans la salle — le lac, s'il y en a un, au-dessus
     de soi — et l'on y roule (les motifs ci-dessus) jusqu'au tube de sortie, où la route se remet à l'endroit par le même côté. La pente est TENUE (la même à l'entrée et à la sortie). */
  const tenuePlafond=len=>{const P9=V9.plafond,sr=rv()<.5?1:-1,dR=Math.max(260,sec(P9.roulis)),T9={rh:P9.rh,up:P9.up,dn:P9.dn},dedans=[];gDette=0;
    droite(.5*vw);gF=sa==='lave'?P9.penteLave:P9.pente;gK=true;const ia=ctrl.length-1,sA=s;droite(dR);const ib=ctrl.length-1;tube(sA-.4*vw,s-.1*dR,T9);droite(.5*vw);
    const s0=s,L9=Math.max(sec(P9.mini),len-2*dR-2.6*vw);let der=-1;
    while(s-s0<L9){let m=(rv()*HOLD.length)|0;if(m===der)m=(m+1)%HOLD.length;der=m;HOLD[m]();dedans.push(HOLDN[m]);droite((.5+rv()*.5)*vw);}
    const ic=ctrl.length-1,sC=s;droite(dR);const id=ctrl.length-1;tube(sC+.1*dR,s+.4*vw,T9);gF=null;gK=false;droite(.6*vw);
    MM.push({i0:ia,i1:id,nom:'vPlafond',fig:'plafond',g:1,dedans:dedans,f:[[ia,ib,sr*Math.PI],[ic,id,-sr*Math.PI]]});NOMS.push('vPlafond');};
  /* LA TENUE SUR LES MURS : de grands virages de vélodrome — la dalle se couche à 72° sur la paroi, vers l'INTÉRIEUR du virage (jamais l'inverse : pris par l'extérieur, le virage serait une crête et la caisse décollerait),
     tient tout le virage, puis bascule d'un mur à l'autre dans la droite qui suit. La route garde son tracé (MODMARK.c) : c'est la roche qui passe d'un côté à l'autre. */
  const tenueMurs=len=>{const W9=V9.murs,B=W9.angle,dR=Math.max(170,sec(W9.roulis)),dS=Math.max(240,sec(W9.bascule)),ev=[];gDette=0;
    let d=rel()>0?-1:1;droite(.4*vw);const i0=ctrl.length-1;gF=PENTE[sa];let ia=ctrl.length-1;droite(dR);ev.push([ia,ctrl.length-1,-d*B]);
    const Rw=()=>Math.max(rM*W9.k,vw*.85)*(.95+rv()*.25),n=Math.max(1,Math.min(5,Math.round((len-2*dR)/(Math.max(rM*W9.k,vw*.85)*1.5+dS))));
    for(let k=0;k<n;k++){let a=d*W9.cap-rel();if(a*d<W9.min)a=d*W9.min;arc(a,Rw());
      if(k<n-1){ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,2*d*B]);d=-d;}}
    ia=ctrl.length-1;droite(dR);ev.push([ia,ctrl.length-1,d*B]);gF=null;droite(.4*vw);
    MM.push({i0:i0,i1:ctrl.length-1,nom:'vMurs',fig:'murs',g:1,n:n,c:ev});NOMS.push('vMurs');};
  /* ---------- LES MODULES DE PLUS (les salles au sol) ---------- */
  /* LE SERPENT : des esses dont l'amplitude ENFLE puis retombe (30 → 58 → 38°) : on se laisse prendre au rythme */
  const gSerpent=()=>{gAxe();const A=[32,40,50,58,48,38],n=4+((rv()*3)|0),R=rM*(1.5+rv()*.3);let d=rel()>0?-1:1;tourne(d*30,R);for(let k=0;k<n;k++){d=-d;tourne(d*A[k],R);droite((16+rv()*14)*KV);}};
  /* L'ENTONNOIR : un seul virage qui se RESSERRE (trois arcs du même côté, 2,6 → 1,9 → 1,35 rM, 135-150° en tout), puis la route se déroule vers l'axe : la roche se rapproche à mesure qu'on tourne */
  const gEntonnoir=()=>{gAxe();const d=rel()>0?-1:1,a=45+rv()*5;vers(-d*38,rM*2.2);droite(30*KV);arc(d*a,rM*2.6);arc(d*a,rM*1.9);arc(d*a,rM*1.35);droite((20+rv()*20)*KV);vers(0,rM*1.9);};
  /* LA FAILLE : une fente haute et étroite (48 m de demi-largeur, 170 m de voûte), un S rapide dedans : les deux parois filent au ras de la route */
  const gFaille=()=>{gAxe();const d=rel()>0?-1:1,a=34+rv()*6,R=rM*(1.5+rv()*.2),sA=s;droite(.7*vw);arc(d*a,R);arc(-d*2*a,R);arc(d*a,R);droite(.7*vw);
    tube(sA,s,{rh:48,up:170,dn:70});return {f:[],calme:1,tunnel:1,fig:'faille'};};
  /* LES MONTAGNES RUSSES : trois bosses en ligne droite, plus sèches que la houle : on décolle à chaque sommet */
  const gRusses=()=>{gAxe();const lam=(150+rv()*40)*KV,amp=(.1+rv()*.03)/Math.sqrt(KV),s0=s,L9=3*lam;
    gM={s0:s0,s1:s0+L9,f:function(sx){const u=(sx-s0)/L9;return amp*Math.sin(u*6*Math.PI)*Math.min(1,u*6,(1-u)*6);}};droite(L9);gM=null;return {fig:'russes'};};
  /* LE BALCON : un très long virage (110-135°, 2,7-3,1 rM) au bord du vide — le fond de la salle s'ouvre en entier sous la route */
  const gBalcon=()=>{gAxe();const d=rel()>0?-1:1,sA=s;vers(-d*58,rM*2.2);droite(40*KV);arc(d*(110+rv()*25),rM*(2.7+rv()*.4));droite(40*KV);vide(sA,s);return {g:1,fig:'balcon'};};
  /* LE SURF : trois grands virages alternés (65-80°, 2,2 rM), la dalle couchée à 52° vers l'intérieur de chacun : on monte sur une paroi, puis sur l'autre */
  const gSurf=()=>{gAxe();const B=.9,dS=Math.max(180,sec(1.3)),ev=[];let d=rel()>0?-1:1,ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,-d*B]);
    for(let k=0;k<3;k++){let a=d*38-rel();if(a*d<50)a=d*50;arc(a,rM*(2.2+rv()*.3));if(k<2){ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,2*d*B]);d=-d;}}
    ia=ctrl.length-1;droite(dS);ev.push([ia,ctrl.length-1,d*B]);return {g:1,fig:'surf',c:ev};};
  /* LA PASSERELLE : 2,6-3,2 s de droite au-dessus du vide ouvert, un virage large au bout : la vitesse pure, et l'on voit le fond */
  const gPasserelle=()=>{gAxe();const d=rel()>0?-1:1,sA=s;droite((2.6+rv()*.6)*vw);vide(sA-40,s+40);tourne(d*(34+rv()*14),Rl());return {fig:'passerelle'};};
  const MODV={gSlalom:gSlalom,gLacets:gLacets,gChicane:gChicane,gHoule:gHoule,gEsses:gEsses,gCorde:gCorde,gPlongeon:gPlongeon,gBoyau:gBoyau,gEpingle:gEpingle,gCorniche:gCorniche,gPlafond:gPlafond,
    gSerpent:gSerpent,gEntonnoir:gEntonnoir,gFaille:gFaille,gRusses:gRusses,gBalcon:gBalcon,gSurf:gSurf,gPasserelle:gPasserelle};
  const SANS_SOUFFLE={gBoyau:1,gCorniche:1,gPlongeon:1,gPlafond:1,gFaille:1,gRusses:1,gSurf:1,gPasserelle:1}; /* ceux qui s'ouvrent déjà sur leur propre droite */
  /* LE PAQUET SANS REDITE : battu au hasard, ce qu'on a vu dans les deux dernières grottes (GRT_VUS) passe derrière */
  const paquet=noms=>{const t=noms.slice();for(let i=t.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}
    const vu=n9=>GRT_VUS.some(function(L9){return L9.indexOf(n9)>=0;});return t.filter(function(n9){return !vu(n9);}).concat(t.filter(vu));};
  let DM=[];
  const modV=()=>{if(!DM.length){virages(2);return;}const nom=DM.shift();if(!SANS_SOUFFLE[nom])droite((1.8+rv()*.35)*vw);const i0=ctrl.length-1,e9=MODV[nom]();marque(i0,nom,e9);};
  const corpsSol=len=>{const s0=s;let m=0;const nm=Math.max(1,Math.round(len/(V9.parSalle*KV)));while(s-s0<len-70){const r=len-(s-s0);if(m<nm&&r>430*KV){modV();m++;nMod++;}else virages(1);}};
  /* ---------- LE PLAN DE LA GROTTE ---------- */
  const planVertige=()=>{
    const ORD=['luxe','boyau','stal','lave'];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=ORD[i];ORD[i]=ORD[j];ORD[j]=x;}
    const PART={luxe:.25,boyau:.15,stal:.2,lave:.26,abysse:.14};let sp=0;for(const k in PART){PART[k]*=V9.part[0]+V9.part[1]*rh();sp+=PART[k];}for(const k in PART)PART[k]/=sp;
    const Tvw=B9/vw,nPass=Tvw>=64?5:Tvw>=48?4:Tvw>=36?3:2,nTen=Tvw>=95?(rh()<.5?3:2):Tvw>=55?2:1; /* le budget, en secondes de croisière : une grotte du palier 25 dure quatre fois moins que celle du palier 0 */
    /* les TENUES : la salle de lave au plafond 7 fois sur 10, puis d'autres salles, au plafond ou sur les murs ; une salle trop courte pour sa tenue est allongée */
    const ASS={},cand=ORD.slice();{let nT=nTen;if(rh()<V9.tenues[0]){ASS.lave='plafond';nT--;cand.splice(cand.indexOf('lave'),1);}
      while(nT>0&&cand.length){const k=cand.splice((rh()*cand.length)|0,1)[0];ASS[k]=rh()<V9.tenues[1]?'plafond':'murs';nT--;}}
    const besoin=k=>ASS[k]==='plafond'?2*Math.max(260,sec(V9.plafond.roulis))+sec(V9.plafond.mini)+4*vw:ASS[k]==='murs'?2*Math.max(170,sec(V9.murs.roulis))+sec(V9.murs.mini)+3*vw:0;
    {let dette9=0,libre=0;for(const k in PART){const b=(besoin(k)+(k==='abysse'?0:4*vw))/B9;if(b>PART[k]){dette9+=b-PART[k];PART[k]=b;}else libre+=PART[k]-b*.5;}
      if(dette9>0&&libre>0)for(const k in PART)if(!besoin(k)){PART[k]*=Math.max(.35,1-dette9/libre);}}
    /* la FORME : les coudes de l'axe aux cinq frontières */
    const fo=V9.formes[(rh()*V9.formes.length)|0],sgF=rh()<.5?-1:1,jC=1+((rh()*3)|0),COU=[];
    for(let j=0;j<5;j++)COU.push(fo==='couloir'?(rh()*2-1)*18:fo==='arc'?sgF*(28+rh()*24):fo==='esse'?(j<2?1:j<4?-1:1)*sgF*(34+rh()*24):fo==='crochet'?(j===jC?sgF*(85+rh()*30):(rh()*2-1)*16):(j%2?1:-1)*sgF*(48+rh()*26));
    /* les PASSAGES : sans redite ; jamais le saut ni le gouffre à la sortie de la mine (pisteTord ne tient pas encore la dalle : leur vol et leur coucher y seraient faussés) */
    const PQ=paquet(Object.keys(PASS)),PJ=[null,null,null,null,null];{const fr=[1,2,3,4];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=fr[i];fr[i]=fr[j];fr[j]=x;}
      const ou=[0].concat(fr.slice(0,nPass-1));for(const j of ou){let q=0;if(j===0)while(q<PQ.length&&(PQ[q]==='pSaut'||PQ[q]==='pGouffre'))q++;if(q<PQ.length)PJ[j]=PQ.splice(q,1)[0];}}
    DM=paquet(Object.keys(MODV));
    const stl=[0,1,2,3];for(let i=3;i>0;i--){const j=(rh()*(i+1))|0,x=stl[i];stl[i]=stl[j];stl[j]=x;}
    const HU={},frontiere=(j,k)=>{let d=COU[j];if(Math.abs(axeTot+d)>V9.axeMax)d=-d;salle(k);
      if(PJ[j]==='pSpirale'||PJ[j]==='pNoeud')PASS[PJ[j]](); /* ils tournent d'eux-mêmes : l'axe suit leur sortie */
      else{axe+=d/57.2958;axeTot+=d;{const a=wrap(axe-phi)*57.2958;if(Math.abs(a)>=MINA){gDette=0;arc(a,rM*(1.9+rv()*.5));}else gDette=Math.abs(a)>=BRIQUE.recadreMin?a:0;}
        if(PJ[j])PASS[PJ[j]]();}};
    const piece=(j,k)=>{const s0=s,len=B9*PART[k];FV=V9.styles[stl[j%4]];HU[k]=FV.nm;if(k!=='abysse')FOR[k]={rh:V9.salle.rh[0]+rh()*V9.salle.rh[1],up:V9.salle.up[0]+rh()*V9.salle.up[1]};
      frontiere(j,k);const reste=Math.max(350*KV,len-(s-s0));
      if(ASS[k]==='plafond'){tenuePlafond(reste-1.5*vw);virages(1);}
      else if(ASS[k]==='murs'){tenueMurs(reste-1.5*vw);virages(1);}
      else corpsSol(reste);
      droite(20*KV);};
    for(let j=0;j<4;j++)piece(j,ORD[j]);
    piece(4,'abysse');FV=null;if(!nMod){modV();nMod++;}
    HZ={axe:axe0,coude:Math.round(axeTot),forme:fo,ordre:['mine'].concat(ORD,['abysse']),assiettes:ORD.map(function(k){return k+':'+(ASS[k]||'sol');}).join(' '),passages:PJ.map(function(p){return p||'-';}).join(' '),humeurs:HU,
      parts:Object.keys(PART).map(function(k){return k+':'+Math.round(PART[k]*100);}).join(' '),budget:Math.round(Tvw)};};
