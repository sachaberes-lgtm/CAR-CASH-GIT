/* ---------------- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors du volcan) ---------------- */
function volcanVide(){
  if(VOLCAN.root){VOLCAN.root.traverse(function(o){if(!o.userData.jeter||!o.geometry)return;const g=o.geometry;if(o.userData.partage){for(const k in g.attributes)if(k!=='aI')g.deleteAttribute(k);g.setIndex(null);}g.dispose();});VOLCAN.root=null;}
  VOLCAN.sol=null;VOLCAN.solM=null;VOLCAN.morc=null;VOLCAN.bancs=[];VOLCAN.fu=0;VOLCAN.file=[];VOLCAN.fi=0;VOLCAN.msFile=0;VOLCAN.pret=false;VOLCAN.aig=[];VOLCAN.arche=null;VOLCAN.gcol=null;VOLCAN.loin=[];VOLCAN.gey=[];VOLCAN.yRaz=true;
  const E=VOLCAN.erup;E.t=6+Math.random()*3;E.age=-1;VLC_U.uErupt.value=VLC_U.uErupt2.value=0; // (2026-10-14, chasse aux bugs) morte PENDANT une éruption puis REJOUER au volcan : le cratère et les flancs restaient embrasés 6-9 s (rien ne remettait ces uniforms à zéro tant que le volcan restait affiché)
  if(VOLCAN.fx.bL)for(const b of VOLCAN.fx.bL)b.on=false;
}
function buildVolcan(seed){jadeFini(buildVolcanG(seed));} // (2026-10-17, LE PRÉ-BÂTI) d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildVolcanG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  volcanVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='volcan'||!(NP>1)||!VOLCAN.K||!VOLCAN.C)return;
  const t0=performance.now(),M=volcanMats(),G=vlcGeos(),fr=mulberry32((seed^0x7011CA)>>>0),ds=L/(NP-1),MOB=TEL_NATIF?.75:1;
  VOLCAN.graine=(seed>>>0)%100000;VOLCAN.met=LVL.cur.meteo||'soir';VOLCAN.n={};
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);VOLCAN.root=root;trackMeshes.push(root);
  const S=volcanSol(),COL=[];VOLCAN.morc=new Map();VOLCAN.solM=[];VOLCAN.n.sol=0;VOLCAN.n.lave=0;VOLCAN.file=[];VOLCAN.fi=0;VOLCAN.msFile=0;
  if(performance.now()>JF.lim)yield;vlcMerLoin(root);if(performance.now()>JF.lim)yield;
  /* LES BANCS DE FUMÉE (14/10, Sacha : « plus de fumée dans la map volcan : le CHALLENGE vient de la DIFFICULTÉ À VOIR ») ; jamais au départ ni au portail.
     Dedans, volcanTick referme la brume (FUMEE_K) ; leurs bouffées se dessinent avec le panache (vlcPanaches, genre 4). */
  {const R=mulberry32((seed^0xF0E1A)>>>0),vwF=70+100*((typeof lvPiste==='function'?lvPiste():1)-1),kv=Math.sqrt(Math.max(1,vwF/78)),B=[];
   /* (v3, 15/10 — la balade) UN BANC PAR VIRAGE DES FUMERONS (`Q.tours`) : il commence 120-160 m AVANT le virage (on y entre sur du droit) et
      le couvre jusqu'à 40-60 m après sa sortie ; entre deux bancs, une fenêtre dégagée. Le lac et le volcan restent DÉGAGÉS : c'est le paysage. */
   for(const t of (VOLCAN.Q&&VOLCAN.Q.tours)||[]){const s0=Math.max(380,t.s0-(120+R()*40)*kv),s1=Math.min(L-320,t.s1+(40+R()*20)*kv);if(s1-s0<80)continue;
     const pr=B[B.length-1];if(pr&&s0<pr.s1+60)pr.s1=s1;else B.push({s0:s0,s1:s1,k:.9+R()*.1});}
   VOLCAN.bancs=B;VOLCAN.n.bancs=B.length;}
  /* 0. TOUT DE SUITE : les rangées et les morceaux du départ (ce que la caméra voit au portail) ; 1. EN TRANCHES : les autres rangées, du plus
     proche au plus loin — la mer lointaine tient la place en attendant */
  const MO=vlcMorceaux(),pres=MO.filter(function(m){return m.dr<60;}); // (le morceau du départ — ou les deux qui le bordent : leurs seules cases ; les voisins suivent dans les premières images)
  for(const m of pres)S.rangee(Math.max(0,m.cj-1),Math.min(S.nz,m.cj+VLC_CH+2),Math.max(0,m.ci-1),Math.min(S.nx,m.ci+VLC_CH+2));if(performance.now()>JF.lim)yield;for(const m of pres)vlcMorceau(root,m.ci,m.cj);if(performance.now()>JF.lim)yield;
  {const j0=Math.round((pts[0].z-S.z0)/S.C),BJ=8,BA=[];for(let j=0;j<S.nz;j+=BJ)BA.push(j);BA.sort(function(a,b){return Math.abs(a+BJ/2-j0)-Math.abs(b+BJ/2-j0);});
   for(const j of BA)vlcTache(function(){S.rangee(j,Math.min(S.nz,j+BJ));});}
  if(performance.now()>JF.lim)yield;const tS=performance.now();
  const lat9=i=>{const t=T[i],hl=Math.hypot(t.x,t.z)||1;return [-t.z/hl,t.x/hl];};
  const HB=100,grille=new Map(),pg=Math.max(1,Math.round(8/ds));
  for(let i=0;i<NP;i+=pg){const p=pts[i],k=Math.floor(p.x/HB)+','+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)+','+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const loinRoute=(x,z,R)=>{let ok=true;proches(x,z,R,function(j){if(ok&&Math.hypot(pts[j].x-x,pts[j].z-z)<R)ok=false;});return ok;};
  const mat=(x,y,z,ry,sx,sy,sz)=>{const c=Math.cos(ry),s9=Math.sin(ry);return [c*sx,0,-s9*sx,0,0,sy,0,0,s9*sz,0,c*sz,0,x,y,z,1];};
  const archeP=VOLCAN.Q.arche?VOLCAN.Q.arche.p:null,horsArche=(x,z,r)=>!archeP||Math.hypot(x-archeP.x,z-archeP.z)>r;
  /* LES COULOIRS DE SAUT (les raccourcis) : de 60 m avant le bout de l'élan jusqu'au-delà de la pose (≈ 3 s à la vitesse du palier), 100 m de part et
     d'autre — aucune aiguille, aucun hornito, aucun orgue n'y pousse : on y vole */
  const vwB=70+100*((typeof lvPiste==='function'?lvPiste():1)-1),CS=(VOLCAN.sauts||[]).map(function(S){const dx=Math.sin(S.phi),dz=Math.cos(S.phi),l=150+vwB*3;
    return [S.e.x-dx*60,S.e.z-dz*60,dx,dz,l+60];});
  const horsSaut=(x,z)=>{for(const c of CS){const u=Math.max(0,Math.min(c[4],(x-c[0])*c[2]+(z-c[1])*c[3]));if(Math.hypot(x-c[0]-c[2]*u,z-c[1]-c[3]*u)<100)return false;}return true;};
  // ---- 1. LES COULÉES (avant le maillage : elles creusent leur lit) ----
  const RIV=[];
  vlcTache(function(){const nR=PAL_B9('volcanRiv',10),K=VOLCAN.K,C=VOLCAN.C,ta=VOLCAN.th0,tb=VOLCAN.th1;
   for(let k=0;k<Math.ceil(nR*.6);k++){const dans=k<Math.ceil(nR*.42),an=dans?ta+(tb-ta)*(.06+.88*fr()):fr()*6.283,r=K.rc+22; // la plupart dans l'arc que longe la route : elles passent SOUS elle
     const P=vlcCoulee(C.x+Math.sin(an)*r,C.z+Math.cos(an)*r,3600,fr);if(P)RIV.push(P);}
   if(VOLCAN.C2){const K2=VOLCAN.K2,C2=VOLCAN.C2;for(let k=0;k<3;k++){const an=fr()*6.283,r=K2.rc+20,P=vlcCoulee(C2.x+Math.sin(an)*r,C2.z+Math.cos(an)*r,3000,fr);if(P)RIV.push(P);}}
   let nM=0,essais=0;const i0=Math.round(VOLCAN.sSp/L*(NP-1));
   while(nM<3&&essais++<300){const i=i0+Math.round(fr()*(NP-1-i0)),l9=lat9(i),sd=fr()<.5?-1:1,lat=150+fr()*450,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat; // les CASCADES des mesas
     if(vlcH(x,z)<vlcL(x,z)+35)continue;const P=vlcCoulee(x,z,1500,fr);if(P&&P.length>14){RIV.push(P);nM++;}}
  VOLCAN.n.coulees=RIV.length;});
  // ---- 2. LE SOL, LES LACS, LES COULÉES ----
  for(const m of MO)vlcTache(function(){vlcMorceau(root,m.ci,m.cj);}); // (ceux du départ sont REFAITS : les coulées ont creusé leur lit)
  vlcTache(function(){for(const P of RIV)vlcRuban(root,P);});
  // ---- 3. LES AIGUILLES D'OBSIDIENNE : à la corde des virages de la plaine, au large des S du flanc, en quinconce sur les droites ----
  const AG=[];
  const aiguille=(i,sg,lat)=>{const p=pts[i],l9=lat9(i),x=p.x+l9[0]*sg*lat,z=p.z+l9[1]*sg*lat;if(!horsArche(x,z,140)||!horsSaut(x,z))return false;
    const base=Math.min(vlcH(x,z),vlcL(x,z))-4,v=(fr()*3)|0,top=p.y+38+fr()*55,sy=Math.max(.8,(top-base)/100),sxz=Math.min(1.5,Math.max(.7,Math.sqrt(sy)*.85*(.85+fr()*.3)))*(VLC5?1.6:1); // (v5) des FLÈCHES de basalte trapues (les lames fines se lisaient comme des antennes noires) — la collision suit (rR, COL)
    const uR=Math.max(0,Math.min(1,(p.y-base+12)/(112*sy))),rR=14*Math.pow(1-uR,1.25)*sxz+4;
    if(lat<ROAD_HALF+rR+7||p.y-base>260)return false; // (pas d'aiguille de 600 m sous la route haute du cratère)
    for(const g of AG)if(Math.hypot(g.x-x,g.z-z)<60)return false;
    if(!loinRoute(x,z,ROAD_HALF+rR+5))return false;
    AG.push({x:x,z:z,y:base,v:v,sy:sy,sxz:sxz,ry:fr()*6.283,top:base+100*sy,i:i,lave:vlcH(x,z)<vlcL(x,z)+4?1:.35});return true;};
  vlcTache(function(){
  {const st=Math.max(1,Math.round(6/ds)),K9=[];
   for(let i=st;i<NP-st;i+=st){const a=T[i-st],b=T[i+st],th=Math.atan2(a.x*b.z-a.z*b.x,a.x*b.x+a.z*b.z);K9.push([i,th/(2*st*ds)]);}
   const sm=K9.map(function(k,j){let s9=0,n9=0;for(let d=-4;d<=4;d++){const o=K9[j+d];if(o){s9+=o[1];n9++;}}return [k[0],s9/n9];});
   let der=-1e9;
   for(let j=1;j<sm.length-1;j++){const k=sm[j],a=Math.abs(k[1]);if(a<1/1300||a<Math.abs(sm[j-1][1])||a<Math.abs(sm[j+1][1]))continue;
     const sK=k[0]*ds;if(sK-der<120||sK<320||sK>L-200)continue;
     const i=k[0],sd=k[1]>0?1:-1,flanc=false; // le côté INTÉRIEUR du virage
     if(flanc){const l9=lat9(i),q=pts[i];if(Math.hypot(q.x+l9[0]*sd*60-VOLCAN.C.x,q.z+l9[1]*sd*60-VOLCAN.C.z)<Math.hypot(q.x-VOLCAN.C.x,q.z-VOLCAN.C.z))continue;} // au flanc : seulement côté vide
     if(aiguille(i,sd,ROAD_HALF+18+fr()*14)||aiguille(i,sd,ROAD_HALF+34+fr()*20))der=sK;
     if(!flanc&&fr()<.45)aiguille(Math.min(NP-1,i+Math.round((60+fr()*50)/ds)),-sd,ROAD_HALF+24+fr()*22);}}
  {let sd=fr()<.5?-1:1;for(let s9=420;s9<L-220;s9+=110+fr()*90){const i=Math.round(s9/ds);let pres=false;for(const g of AG)if(Math.hypot(g.x-pts[i].x,g.z-pts[i].z)<95){pres=true;break;}
    if(pres)continue;sd=-sd;aiguille(i,sd,ROAD_HALF+20+fr()*40);}}
  {const AGI=[[],[],[]];for(const g of AG){AGI[g.v].push({m:mat(g.x,g.y,g.z,g.ry,g.sxz,g.sy,g.sxz),j:[fr(),0,g.lave,0]});
     const me=G.aig[g.v].userData.meta,c=Math.cos(g.ry),s9=Math.sin(g.ry),tr=q=>[g.x+(q[0]*c+q[2]*s9)*g.sxz,g.y+q[1]*g.sy,g.z+(-q[0]*s9+q[2]*c)*g.sxz];
     for(let k=0;k<me.pts.length-1;k++)COL.push({a:tr(me.pts[k]),b:tr(me.pts[k+1]),r:Math.max(me.rad[k],me.rad[k+1])*g.sxz*.92});}
   for(let v=0;v<3;v++)vlcInst(root,G.aig[v],AGI[v],'aiguilles');}
  VOLCAN.aig=AG;});
  // ---- 4. L'ARCHE DE FEU ----
  vlcTache(function(){vlcArche(root,fr,COL);});
  // ---- 5. LES HORNITOS (petits cônes de scories au bord de la route) ET LEURS GEYSERS ----
  const HO=[],GY=[];
  vlcTache(function(){
  {const nG=PAL_B9('volcanGey',12);let sd=fr()<.5?-1:1;
   for(let s9=520+fr()*200;s9<L-260&&GY.length<nG;s9+=(L-760)/nG*(.75+fr()*.5)){const i=Math.round(s9/ds),l9=lat9(i);sd=-sd;
     for(let e=0;e<8;e++){const lat=ROAD_HALF+40+fr()*200,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,h=vlcH(x,z),yl=vlcL(x,z);
       if(h>pts[i].y-22||!horsArche(x,z,90)||!horsSaut(x,z))continue;
       let pres=false;for(const g of AG)if(Math.hypot(g.x-x,g.z-z)<42){pres=true;break;}if(pres||!loinRoute(x,z,ROAD_HALF+24))continue;
       const sc=.8+fr()*.6,per=6+fr()*5;
       if(h<yl+1.5){GY.push({x:x,y:yl+.5,z:z,per:per,ph:fr(),v:26+fr()*14,sz:3.8+fr()*1.4,pr:0});break;} // dans un LAC : la fontaine jaillit de la lave elle-même
       HO.push({m:mat(x,h-1,z,fr()*6.283,sc,sc,sc),j:[fr(),0,0,0]});GY.push({x:x,y:h-1+12.4*sc,z:z,per:per,ph:fr(),v:30+fr()*16,sz:3.4+fr()*1.4,pr:0});
       COL.push({a:[x,h-2,z],b:[x,h+10*sc,z],r:6.5*sc});break;}}}
  vlcInst(root,G.horn,HO,'hornitos');VOLCAN.gey=GY;
  {const nP=TEL_NATIF?40:56,Pg=[],Rg=[],Ag=[];const R=mulberry32((seed^0x6E75E)>>>0);
   for(const g of GY)for(let k=0;k<nP;k++){Pg.push(g.x,g.y,g.z);Rg.push(R(),R(),R(),R());Ag.push(g.per,g.ph,g.v,g.sz);}
   const fo=(c,K,code,n)=>{const y=K.yP-K.cr*.55+4;for(let k=0;k<n;k++){Pg.push(c.x+(R()-.5)*30,y,c.z+(R()-.5)*30);Rg.push(R(),R(),R(),R());Ag.push(code,0,88+R()*26,9+R()*5);}};
   fo(VOLCAN.C,VOLCAN.K,-1,TEL_NATIF?90:140);if(VOLCAN.C2)fo(VOLCAN.C2,VOLCAN.K2,-2,TEL_NATIF?60:100);  // les FONTAINES des cratères (allumées par l'éruption)
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pg,3));g.setAttribute('aR',new THREE.Float32BufferAttribute(Rg,4));g.setAttribute('aG',new THREE.Float32BufferAttribute(Ag,4));
   const m=new THREE.Points(g,M.gey);m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=8;m.userData.jeter=true;m.name='volcan geysers';root.add(m);VOLCAN.n.gouttes=Pg.length/3;}});
  // ---- 6. LES ORGUES DE BASALTE : des faisceaux de colonnes hexagonales sur les rives et les plateaux ----
  const OR=[];
  vlcTache(function(){
  {const nO=Math.round(PAL_B9('volcanOrgues',52)*MOB);let essais=0,nC=0;
   while(nC<nO&&essais++<nO*8){const i=Math.round(fr()*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1,lat=ROAD_HALF+48+fr()*420,cx=pts[i].x+l9[0]*sd*lat,cz=pts[i].z+l9[1]*sd*lat,h0=vlcH(cx,cz);
     if(h0<vlcL(cx,cz)+2||h0>pts[i].y-26||!horsArche(cx,cz,80)||!horsSaut(cx,cz))continue;
     const R9=6+fr()*7,hm=8+fr()*20;if(!loinRoute(cx,cz,ROAD_HALF+R9+6))continue;const n=6+((fr()*8)|0);
     for(let k=0;k<n;k++){const a=fr()*6.283,r=Math.sqrt(fr())*R9,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,hb=vlcH(x,z)-2,hh=hm*(.55+fr()*.6)*(1-.4*r/R9)+2,rr=1.7+fr()*1.2;
       OR.push({m:mat(x,hb,z,fr()*1.05,rr,hh,rr),j:[fr(),0,0,0]});}
     COL.push({a:[cx,h0-2,cz],b:[cx,h0+hm,cz],r:R9+1.5});nC++;}}
  vlcInst(root,G.org,OR,'orgues');VOLCAN.n.orgues=OR.length;});
  // ---- 7. LES VOLCANS DU LOIN, LES PANACHES ----
  vlcTache(function(){vlcLoin(root,fr);vlcPanaches(root,fr);});
  // ---- 8. LES COLLISIONS en grille de 120 m ----
  vlcTache(function(){
  {const CG=120,Gc=new Map();for(const c of COL){const r=c.r+2,i0=Math.floor((Math.min(c.a[0],c.b[0])-r)/CG),i1=Math.floor((Math.max(c.a[0],c.b[0])+r)/CG),j0=Math.floor((Math.min(c.a[2],c.b[2])-r)/CG),j1=Math.floor((Math.max(c.a[2],c.b[2])+r)/CG);
     for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i+','+j;let a=Gc.get(k);if(!a)Gc.set(k,a=[]);a.push(c);}}
   VOLCAN.gcol={CG:CG,G:Gc,n:COL.length};}
  VOLCAN.n.aiguilles=AG.length;VOLCAN.n.hornitos=HO.length;VOLCAN.n.geysers=GY.length;VOLCAN.n.loin=VOLCAN.loin.length;VOLCAN.pret=true;VOLCAN.msTot=Math.round(VOLCAN.msFile+VOLCAN.ms);});
  VOLCAN.ms=Math.round(performance.now()-t0);VOLCAN.msSol=Math.round(tS-t0); // (le temps TOUT DE SUITE ; le reste se mesure dans VOLCAN.msFile)
  volcanMeteo(VOLCAN.met,started?bioPortDur():.01);
}
/* ---------------- LES MÉTÉOS : le volcan glisse d'un temps à l'autre au même fondu que le ciel ---------------- */
function volcanMeteo(m,dur){const T9=VLC_MET[m]||VLC_MET.soir;VOLCAN.met=VLC_MET[m]?m:'soir';
  if(!VOLCAN.cur)VOLCAN.cur=JSON.parse(JSON.stringify(T9));
  VOLCAN.de=JSON.parse(JSON.stringify(VOLCAN.cur));VOLCAN.to=T9;VOLCAN.k=0;VOLCAN.dur=Math.max(.01,dur||1.2);}
function vlcPas(dt){if(!VOLCAN.cur||VOLCAN.k>=1)return;VOLCAN.k=Math.min(1,VOLCAN.k+dt/VOLCAN.dur);const e=VOLCAN.k*VOLCAN.k*(3-2*VOLCAN.k),a=VOLCAN.de,b=VOLCAN.to,o=VOLCAN.cur;
  for(const k in b){const v=b[k];if(typeof v==='number')o[k]=a[k]+(v-a[k])*e;else if(Array.isArray(v))for(let i=0;i<v.length;i++)o[k][i]=a[k][i]+(v[i]-a[k][i])*e;else o[k]=v;}}
/* ---------------- LES EFFETS AUTOUR DE LA CAISSE (bâtis une fois, cachés hors du volcan) ----------------
   les BRAISES et la CENDRE (des points dans une boîte qui suit la caisse), les BOMBES de l'éruption (36 points posés par le processeur),
   les HALOS des cratères et les ÉCLABOUSSURES de lave où tombent les bombes. */
function vlcFx(){const fx=VOLCAN.fx;if(fx.bra)return fx;const M=volcanMats(),R=mulberry32(0xB4A15E);
  const nuage=(n,mat,nom)=>{const g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
    const p=new THREE.Points(g,mat);p.name=nom;p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return p;};
  const nP=PAL_B9('volcanPart',1000);fx.bra=nuage(nP,M.bra,'volcan braises');fx.cen=nuage(Math.round(nP*.8),M.cen,'volcan cendre');
  {const n=36,g=new THREE.BufferGeometry(),P=new Float32Array(n*3).fill(-1e5);g.setAttribute('position',new THREE.BufferAttribute(P,3));
   fx.bombes=new THREE.Points(g,M.bombe);fx.bombes.name='volcan bombes';fx.bombes.frustumCulled=false;fx.bombes.matrixAutoUpdate=false;fx.bombes.visible=false;fx.bombes.renderOrder=9;scene.add(fx.bombes);
   fx.bL=[];for(let k=0;k<n;k++)fx.bL.push({on:false,t:0,Tf:1,S:new THREE.Vector3(),v:new THREE.Vector3(),E:new THREE.Vector3()});}
  /* (v3, 15/10 — Sacha : « un voile de visibilité mal géré ») LA CLOCHE DE FUMÉE : une sphère retournée qui suit la caméra, au rayon de la brume
     (fog.far), de la couleur de la brume. Sans elle, dans un banc, le SOL disparaissait à 250 m mais le CIEL restait grand ouvert (le dôme ne
     prend pas le brouillard) : un mur rouge à l'horizon sous un ciel de carte postale, au lieu d'être DANS la fumée. Avec elle, tout se ferme pareil. */
  fx.cloche=new THREE.Mesh(new THREE.SphereGeometry(1,24,12),new THREE.MeshBasicMaterial({color:0x000000,side:THREE.BackSide,transparent:true,depthWrite:false,fog:false,opacity:0}));
  fx.cloche.visible=false;fx.cloche.frustumCulled=false;fx.cloche.renderOrder=1;fx.cloche.name='volcan cloche de fumee';scene.add(fx.cloche);
  fx.halos=[];for(let k=0;k<4;k++){const h=new THREE.Sprite(M.halo[k]);h.visible=false;h.renderOrder=2;h.frustumCulled=false;scene.add(h);fx.halos.push(h);}
  fx.ecl=[];for(let k=0;k<6;k++){const m9=M.halo[4].clone();m9.dispose=function(){};const h=new THREE.Sprite(m9);h.visible=false;h.renderOrder=9;h.frustumCulled=false;scene.add(h);fx.ecl.push({sp:h,age:9});}
  return fx;}
function vlcFxCache(){const fx=VOLCAN.fx;if(!fx.bra||!fx.on)return;fx.on=false;fx.bra.visible=fx.cen.visible=fx.bombes.visible=fx.cloche.visible=false;for(const h of fx.halos)h.visible=false;for(const e of fx.ecl)e.sp.visible=false;
  VLC_U.uErupt.value=VLC_U.uErupt2.value=0;VOLCAN.fu=0;FUMEE_K=0;if(VOLCAN.amb){try{VOLCAN.amb.stop(.8);}catch(e){}VOLCAN.amb=null;}}
const VLC_V=new THREE.Vector3(),VLC_V2=new THREE.Vector3();
/* L'ÉRUPTION : le cratère s'embrase (uErupt : la lumière sur les flancs, le pied du panache, la fontaine), puis les BOMBES partent vers
   les lacs DEVANT la caisse, du côté du vide (5,5-8,5 s de vol, ~30 m/s² : de grands arcs au-dessus de la route) — jamais sur elle. */
function vlcEruption(qui){const E=VOLCAN.erup,fx=vlcFx(),U=VLC_U;E.age=0;E.n++;E.qui=qui;
  const K=qui?VOLCAN.K2:VOLCAN.K,C=qui?VOLCAN.C2:VOLCAN.C;if(!K||!C)return;
  U.uCrat.value.set(C.x,K.yP+20,C.z);
  const ds=L/Math.max(1,NP-1),v9=Math.max(40,Math.min(160,VOLCAN.vit||80)),nb=qui?14:22+((Math.random()*8)|0);let lance=0;
  for(const b of fx.bL){if(lance>=nb)break;if(b.on)continue;
    const Tf=5.5+Math.random()*3,sv=s+v9*Tf*(.75+Math.random()*.35)+60+Math.random()*260,i=Math.max(0,Math.min(NP-1,Math.round(sv/ds))),t=T[i],hl=Math.hypot(t.x,t.z)||1;
    let lx=-t.z/hl,lz=t.x/hl;if(!qui&&(pts[i].x+lx*50-C.x)**2+(pts[i].z+lz*50-C.z)**2<(pts[i].x-C.x)**2+(pts[i].z-C.z)**2){lx=-lx;lz=-lz;} // du côté du vide
    else if(qui&&Math.random()<.5){lx=-lx;lz=-lz;}
    const lat=ROAD_HALF+70+Math.random()*320,ex=pts[i].x+lx*lat,ez=pts[i].z+lz*lat,ey=VOLCAN.sol?Math.max(vlcH(ex,ez),vlcL(ex,ez)):pts[i].y-60;
    b.S.set(C.x+(Math.random()-.5)*40,K.yP-K.cr*.4,C.z+(Math.random()-.5)*40);b.E.set(ex,ey,ez);b.Tf=Tf;b.t=-.15-Math.random()*1.4;b.on=true;
    b.v.subVectors(b.E,b.S).multiplyScalar(1/Tf);b.v.y+=.5*30*Tf;lance++;}
  // le son : le BOUM du cratère, puis le grondement ; la caisse tremble si le volcan est proche
  const d=Math.hypot(U.uCarP.value.x-C.x,U.uCarP.value.z-C.z);
  try{if(typeof sfx==='function'){if(!sfx('volcan.eruption',{vol:-2-Math.min(10,d/260)}))sfx('tonnerre',{vol:-4-Math.min(10,d/260)});}}catch(e){}
  if(d<2600){shake=Math.max(shake,.45*(1-d/2600)+.08);try{hap(4);}catch(e){}}}
function vlcEruptTick(dt,c,vit){const E=VOLCAN.erup,U=VLC_U,fx=VOLCAN.fx;
  const pres=s<VOLCAN.sSp+650||!VOLCAN.C2; // près du grand volcan, c'est lui qui crache ; ensuite le second, droit devant
  if(vit&&started&&running&&!gameOver&&mode!=='boom'){E.t-=dt*c.eru;if(E.t<=0&&E.age<0){vlcEruption(pres?0:1);E.t=15+Math.random()*14;}}
  if(E.age>=0){if(vit)E.age+=dt;const a=E.age,k=(a<.22?a/.22:1)*(1-THREE.MathUtils.smoothstep(a,2.6,6.8));
    if(E.qui)U.uErupt2.value=k;else U.uErupt.value=k;if(a>7){E.age=-1;U.uErupt.value=U.uErupt2.value=0;}}
  // LES BOMBES : la parabole, le point de chute → une éclaboussure (un éclair orange qui s'étale et s'éteint)
  let n=0;const A=fx.bombes.geometry.attributes.position.array;
  for(let k=0;k<fx.bL.length;k++){const b=fx.bL[k];
    if(b.on&&vit){b.t+=dt;if(b.t>=b.Tf){b.on=false;for(const e of fx.ecl)if(e.age>=1){e.age=0;e.sp.position.copy(b.E);e.sp.position.y+=6;break;}
      if(Math.random()<.35)try{const dd=b.E.distanceTo(U.uCarP.value);if(dd<700)sfx('volcan.lave',{vol:-8-dd/60,pan:Math.random()*1.4-.7});}catch(e){}}}
    if(b.on&&b.t>0){const t=b.t;A[k*3]=b.S.x+b.v.x*t;A[k*3+1]=b.S.y+b.v.y*t-15*t*t;A[k*3+2]=b.S.z+b.v.z*t;n++;}else{A[k*3]=0;A[k*3+1]=-1e5;A[k*3+2]=0;}}
  fx.bombes.visible=n>0;if(n)fx.bombes.geometry.attributes.position.needsUpdate=true;
  for(const e of fx.ecl){if(e.age<1){if(vit)e.age+=dt*1.25;const a=e.age;e.sp.visible=a<1;e.sp.scale.setScalar(20+90*Math.sqrt(a));e.sp.material.opacity=(1-a)*.9;}else e.sp.visible=false;}}
/* LA BOUCLE DU VOLCAN (chaque image, après la caméra, juste avant le rendu) */
function volcanTick(dt){
  const on=!!VOLCAN.root&&!!LVL.cur&&LVL.cur.id==='volcan'&&!PARK.on;
  if(!on){vlcFxCache();return;}
  if(VOLCAN.file&&VOLCAN.fi<VOLCAN.file.length)vlcTranches(paused?12:5); // LES TRANCHES : la construction se finit quelques millisecondes par image
  const fx=vlcFx(),U=VLC_U,c=VOLCAN.cur||(volcanMeteo(VOLCAN.met,.01),VOLCAN.cur);fx.on=true;
  const vit=!paused;vlcPas(dt);if(vit)U.uTime.value+=dt;
  // LA LUMIÈRE : l'azimut du soleil du ciel, la hauteur de la météo ; les couleurs, celles de bioApply
  {const a=Math.atan2(SUN_DIR.x,SUN_DIR.z),el=c.el*Math.PI/180;U.uSunDir.value.set(Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el));}
  U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize().negate();
  U.uCam.value.copy(camera.position);
  {const cg=carGroup;if(vit&&dt>0){const d=cg.position.distanceTo(U.uCarP.value);if(d<80)VOLCAN.vit=(VOLCAN.vit||0)+(d/dt-(VOLCAN.vit||0))*Math.min(1,dt*1.5);}
   U.uCarP.value.copy(cg.position);U.uCarF.value.set(0,0,1).applyQuaternion(cg.quaternion);}
  U.uPhare.value=c.phare*(mode==='boom'||!carGroup.visible?0:1);U.uFlash.value=(LVL.cur&&LVL.cur.orage)?(CAMP_FLASH||0):0;
  U.uLue.value=c.lue;U.uBruK.value=c.bru;U.uBruC.value.setRGB(c.bC[0],c.bC[1],c.bC[2]);if(scene.fog)U.uBruC.value.lerp(scene.fog.color,.3);
  {const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1))));const y9=pts[i]?pts[i].y:0;U.uBruY.value+=(y9-U.uBruY.value)*Math.min(1,dt*2+(VOLCAN.yRaz?1:0));VOLCAN.yRaz=false;}
  U.uFumC.value.setRGB(c.fumC[0],c.fumC[1],c.fumC[2]);U.uFum.value=c.fum;U.uCen.value=c.cen;U.uBra.value=c.bra;U.uGey.value=c.gey;U.uPx.value=renderer.getPixelRatio();
  {const f=U.uCarF.value,p=U.uCarP.value;U.uBoxC.value.set(p.x+f.x*70,p.y+10,p.z+f.z*70);}
  /* LES BANCS DE FUMÉE : où en est-on (la route sous la caisse, en vol aussi) ; la brume se referme DEDANS (FUMEE_K, lu par updateClouds),
     les braises triplent, la cendre s'épaissit — en entrant comme en sortant, en ~0,3 s */
  {const sc=mode==='fall'?lastNearS:s;let f=0;for(const b of VOLCAN.bancs||[]){if(sc<b.s0-80||sc>b.s1+80)continue;f=Math.max(f,b.k*THREE.MathUtils.smoothstep(sc,b.s0-70,b.s0+50)*(1-THREE.MathUtils.smoothstep(sc,b.s1-50,b.s1+70)));}
   /* (2026-10-20, Sacha : « le filtre de visibilité avec la cendre et la fumée, mais EN PERMANENCE : le challenge de cette map doit être la faible visibilité ») : un voile de fond partout (0,7), les bancs le refermant jusqu'à 1 ; épargné seulement au départ (fondu de 60 à 260 m) pour ne pas cacher le portail */
   f=Math.max(f,.7*THREE.MathUtils.smoothstep(sc,60,260));
   VOLCAN.fu+=(f*(c.fu||1)-VOLCAN.fu)*Math.min(1,dt*3);if(VOLCAN.fu<.002)VOLCAN.fu=0;FUMEE_K=VOLCAN.fu;FUMEE_F=c.fuF||250;if(c.fuC)FOG_FUMEE.setRGB(c.fuC[0],c.fuC[1],c.fuC[2]);
   U.uBra.value=c.bra*(1+VOLCAN.fu*2.5);U.uCen.value=Math.min(1,c.cen+VOLCAN.fu*.6);}
  fx.bra.visible=U.uBra.value>.01;fx.cen.visible=U.uCen.value>.01;
  {const k=FUMEE_K,cl=fx.cloche;cl.visible=k>.01&&!!scene.fog;if(cl.visible){cl.position.copy(camera.position);cl.scale.setScalar(Math.min(3000,scene.fog.far*.97));cl.material.color.copy(scene.fog.color);cl.material.opacity=Math.min(1,k*1.1);cl.updateMatrix();cl.updateMatrixWorld();}}
  if(VOLCAN.solM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of VOLCAN.solM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+60;if(m.visible!==v)m.visible=v;}}
  vlcEruptTick(dt,c,vit);
  U.uLav.value=c.lav*(1+(U.uErupt.value+U.uErupt2.value)*.25);
  // LES HALOS DES CRATÈRES : ils couvent, ils s'embrasent à l'éruption ; ceux du loin respirent
  {const t=U.uTime.value,H=fx.halos,L9=[[VOLCAN.C,VOLCAN.K,U.uErupt.value,420],[VOLCAN.C2,VOLCAN.K2,U.uErupt2.value,340]];
   for(let k=0;k<4;k++){const h=H[k];let o=null;if(k<2)o=L9[k];else{const l=VOLCAN.loin[k-2];if(l)o=[l.c,l.K,.25+.25*Math.sin(t*.6+l.ph),300];}
     if(!o||!o[0]){h.visible=false;continue;}h.visible=true;h.position.set(o[0].x,o[1].yP+18,o[0].z);h.scale.setScalar(o[3]*(1+o[2]*.9));
     h.material.opacity=Math.min(1,(.22+.2*c.lue)*(.85+.15*Math.sin(t*1.3+k*2.1))+o[2]*.8);}}
  if(vit)vlcSons(dt,c);
}
/* ---------------- LES VOIX DU VOLCAN : le grondement, la lave qui bulle, les geysers qui crachent (aucune nappe de souffle par-dessus la musique) ---------------- */
const VLC_SONS={jour:[['volcan.lave',5,10,-17],['volcan.gronde',20,36,-14]],soir:[['volcan.lave',4,9,-16],['volcan.gronde',16,30,-13]],
  nuit:[['volcan.lave',3,7,-14],['volcan.gronde',13,24,-12]],cendre:[['volcan.lave',5,10,-17],['volcan.gronde',11,20,-11]],orage:[['volcan.lave',5,10,-17],['volcan.gronde',10,18,-11]]};
function vlcSons(dt,c){
  const ok=SONV2&&started&&running&&!gameOver&&!garageOn&&mode!=='boom',T9=VOLCAN.son;
  if(!ok){if(VOLCAN.amb){try{VOLCAN.amb.stop(.6);}catch(e){}VOLCAN.amb=null;}return;}
  const L9=VLC_SONS[c.sons]||VLC_SONS.jour;
  for(const e of L9){if(T9.k[e[0]]==null)T9.k[e[0]]=e[1]*Math.random();T9.k[e[0]]-=dt;if(T9.k[e[0]]<=0){T9.k[e[0]]=e[1]+Math.random()*(e[2]-e[1]);try{sfx(e[0],{vol:e[3],pan:Math.random()*1.6-.8});}catch(x){}}}
  // les GEYSERS proches : le même calendrier que le shader (période, phase) — on entend celui qui part
  {const t=VLC_U.uTime.value,p=VLC_U.uCarP.value;VLC_V2.set(1,0,0).applyQuaternion(camera.quaternion);
   for(const g of VOLCAN.gey){const ph=((t/g.per+g.ph)%1+1)%1,dx=g.x-p.x,dz=g.z-p.z,d=Math.hypot(dx,dz);
     if(ph<.05&&g.pr>.5&&d<320&&c.gey>.2){VLC_V.set(dx,0,dz).normalize();try{sfx('volcan.geyser',{vol:-6-d/45,pan:Math.max(-.9,Math.min(.9,VLC_V.dot(VLC_V2)*1.2))});}catch(e){}}g.pr=ph;}}
  if(!VOLCAN.amb&&performance.now()>(VOLCAN.ambT||0)){VOLCAN.ambT=performance.now()+900;try{VOLCAN.amb=sfx('volcan.amb',{loop:true,vol:-22});}catch(e){VOLCAN.amb=null;}}}
/* ---------------- EN VOL : CE QUI TUE — une aiguille, l'arche, la roche, LA LAVE ---------------- */
function volcanHeurt(p){
  if(!VOLCAN.root||!VOLCAN.sol)return '';const G=VOLCAN.gcol;
  if(G){const a=G.G.get(Math.floor(p.x/G.CG)+','+Math.floor(p.z/G.CG));
    if(a)for(let j=0;j<a.length;j++){const c=a[j],ax=c.a[0],ay=c.a[1],az=c.a[2],bx=c.b[0]-ax,by=c.b[1]-ay,bz=c.b[2]-az,l2=bx*bx+by*by+bz*bz;let u=l2>0?((p.x-ax)*bx+(p.y-ay)*by+(p.z-az)*bz)/l2:0;u=Math.max(0,Math.min(1,u));
      const dx=p.x-ax-bx*u,dy=p.y-ay-by*u,dz=p.z-az-bz*u;if(dx*dx+dy*dy+dz*dz<(c.r+1.2)*(c.r+1.2))return 'roche';}}
  const S=VOLCAN.sol;if(p.x<S.x0||p.z<S.z0||p.x>S.x0+(S.nx-1)*S.C||p.z>S.z0+(S.nz-1)*S.C)return p.y<VOLCAN.ySea+.8?'lave':''; // au-delà de la grille : la mer
  const h=vlcH(p.x,p.z),yl=vlcL(p.x,p.z);
  if(h<yl&&p.y<yl+.8)return 'lave';
  if(p.y<h+1.2){const i=Math.round((p.x-S.x0)/S.C),j=Math.round((p.z-S.z0)/S.C);return S.riv[i+j*S.nx]?'lave':'roche';}
  return '';}
/* ---------------- LA CHAUFFE AU MENU : chaque matière compilée et dessinée une fois hors écran (0 programme en course) ---------------- */
function volcanChauffe(){
  const M=volcanMats(),G=vlcGeos(),fx=vlcFx(),L9=[];
  const tri=(at,n)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));g.setAttribute(at,new THREE.Float32BufferAttribute(new Float32Array(3*n),n));return g;};
  L9.push(new THREE.Mesh(tri('aS',4),M.sol),new THREE.Mesh(tri('aV',4),M.lave));
  {const g=new THREE.BufferGeometry();for(const k in G.org.attributes)g.setAttribute(k,G.org.attributes[k]);g.setIndex(G.org.index);g.setAttribute('aI',new THREE.InstancedBufferAttribute(new Float32Array(4),4));
   const im=new THREE.InstancedMesh(g,M.roc,1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);}
  {const g=new THREE.InstancedBufferGeometry(),pl=new THREE.PlaneGeometry(1,1);g.index=pl.index;g.setAttribute('position',pl.attributes.position);g.setAttribute('uv',pl.attributes.uv);
   g.setAttribute('aC',new THREE.InstancedBufferAttribute(new Float32Array(4),4));g.setAttribute('aP',new THREE.InstancedBufferAttribute(new Float32Array([.5,1,1,0]),4));g.instanceCount=1;L9.push(new THREE.Mesh(g,M.fum));}
  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));g.setAttribute('aR',new THREE.Float32BufferAttribute([.5,.5,.5,.5],4));g.setAttribute('aG',new THREE.Float32BufferAttribute([8,0,30,4],4));L9.push(new THREE.Points(g,M.gey));}
  for(const o of L9)o.frustumCulled=false;
  const vus=[[fx.bra,fx.bra.visible],[fx.cen,fx.cen.visible],[fx.bombes,fx.bombes.visible],[fx.cloche,fx.cloche.visible]].concat(fx.halos.map(h=>[h,h.visible]),fx.ecl.map(e=>[e.sp,e.sp.visible]));
  for(const v of vus)v[0].visible=true;
  const g=new THREE.Group();for(const o of L9)g.add(o);scene.add(g);
  try{chauffeRendu([g,fx.bra,fx.cen,fx.bombes,fx.cloche].concat(fx.halos,fx.ecl.map(e=>e.sp)));}finally{scene.remove(g);for(const v of vus)v[0].visible=v[1];}
}
/* ---------------- LA CONSOLE ---------------- */
window.dbgVolcan=function(k,o){
  if(k==='test'){ // (2026-10-18) LA RÈGLE D'OR, comme dbgCanyon('test') : la roche sous la dalle (dessous) ou sur la route (dessus), tous les 6 m, au bord et au milieu
    if(!VOLCAN.sol||!VOLCAN.sol.h)return 'pas de volcan bâti';let dessus=0,dessous=0,pire=1e9;const ou=[],F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,h=vlcH(x,z);
      if(h>y-THICK-1.5){dessous++;if(ou.length<30)ou.push('D'+Math.round(s9)+'('+(y-THICK-h).toFixed(1)+')');}if(h>y+1.5)dessus++;pire=Math.min(pire,y-THICK-h);}}
    return {dessus:dessus,dessous:dessous,margeMin:+pire.toFixed(1),ou:ou.join(" ")};}
  if(k==='meteo'){volcanMeteo(o||'nuit',.01);return VOLCAN.met;}
  if(k==='eruption'){vlcEruption(o?1:0);return 'éruption '+(o?'du second':'du grand')+' volcan';}
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);volcanTick(0);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'aiguille' = la prochaine aiguille devant · 'arche' · 'volcan' = vers le grand cratère · 'second' = vers le second ; o.d m en arrière, o.h m de haut
     · 'banc' (o.k, o.dedans) : devant un BANC DE FUMÉE (240 m avant) ou DEDANS · 'saut' (o.k = la boucle) : du bout de l'élan, le regard sur la sortie d'en dessous — le raccourci tel qu'on le voit avant de sauter */
  if(k==='banc'){const b=(VOLCAN.bancs||[])[(o&&o.k)|0];if(!b)return 'pas de banc';const ds9=L/(NP-1),dd=!!(o&&o.dedans),sm=dd?(b.s0+b.s1)/2:b.s0-((o&&o.d)||240),
    i=Math.max(0,Math.min(NP-1,Math.round(sm/ds9))),j=Math.min(NP-1,i+Math.round(160/ds9)),p=pts[i],q=pts[j],f=dd?b.k:0; // (photo : la brume du banc posée à la main — en pause, updateClouds ne tourne pas)
    VOLCAN.fu=f;FUMEE_K=f;if(scene.fog){scene.fog.near=FOG_N+(Math.min(FOG_N,30)-FOG_N)*f;scene.fog.far=FOG_F+(Math.min(FOG_F,FUMEE_F)-FOG_F)*f;scene.fog.color.copy(FOG_BASE).lerp(FOG_FUMEE,f);}
    return window.dbgVolcan('vue',{p:[p.x,p.y+9,p.z],c:[q.x,q.y+2,q.z],fov:o&&o.fov});}
  if(k==='saut'){const S=(VOLCAN.sauts||[])[(o&&o.k)|0];if(!S)return 'pas de boucle';const dx=Math.sin(S.phi),dz=Math.cos(S.phi),d=(o&&o.d)||90,h=(o&&o.h)||22;
    return window.dbgVolcan('vue',{p:[S.e.x-dx*d,S.e.y+h,S.e.z-dz*d],c:[S.e.x+dx*240,S.yS-10,S.e.z+dz*240],fov:o&&o.fov});}
  if(k==='aiguille'||k==='arche'||k==='volcan'||k==='second'){const ds=L/(NP-1),d=(o&&o.d)||70,h=(o&&o.h)||9;let i=-1,cible=null;
    if(k==='aiguille'){for(const g of VOLCAN.aig)if(g.i*ds>s+60){i=g.i;cible=[g.x,pts[g.i].y+(o&&o.y!=null?o.y:20),g.z];break;}}
    else if(k==='arche'&&VOLCAN.arche){i=VOLCAN.arche.i;const c=VOLCAN.arche.c;cible=[c.x,c.y-14,c.z];}
    else{const C=k==='volcan'?VOLCAN.C:VOLCAN.C2,K9=k==='volcan'?VOLCAN.K:VOLCAN.K2;if(C){i=Math.min(NP-1,Math.round(s/ds)+Math.round(d/ds));cible=[C.x,K9.yP*.6+pts[i].y*.4,C.z];}}
    if(i<0||!cible)return 'rien devant';const j=Math.max(0,i-Math.round(d/ds)),p=pts[j];volcanTick(0);
    return window.dbgVolcan('vue',{p:[p.x,p.y+h,p.z],c:cible,fov:o&&o.fov});}
  return {on:!!VOLCAN.root,met:VOLCAN.met,ms:VOLCAN.ms,msSol:VOLCAN.msSol,n:VOLCAN.n,col:VOLCAN.gcol&&VOLCAN.gcol.n,sSp:Math.round(VOLCAN.sSp),L:Math.round(L),
    sauts:(VOLCAN.sauts||[]).map(function(S){return [Math.round(S.sE),Math.round(S.sS),Math.round(S.yE-S.yS)];}),conflits:VOLCAN.conflits,croise:VOLCAN.croise,ySea:Math.round(VOLCAN.ySea||0),
    erup:{t:+VOLCAN.erup.t.toFixed(1),age:+VOLCAN.erup.age.toFixed(1),n:VOLCAN.erup.n},vit:Math.round(VOLCAN.vit||0),
    pret:!!VOLCAN.pret,fu:+(VOLCAN.fu||0).toFixed(2),bancs:(VOLCAN.bancs||[]).map(function(b){return [Math.round(b.s0),Math.round(b.s1)];}),file:VOLCAN.file?VOLCAN.file.length-VOLCAN.fi:0,msFile:Math.round(VOLCAN.msFile||0),msTot:VOLCAN.msTot,
    cur:VOLCAN.cur&&{lue:+VOLCAN.cur.lue.toFixed(2),lav:+VOLCAN.cur.lav.toFixed(2),cen:+VOLCAN.cur.cen.toFixed(2)}};};
/* <<<FIN VOLCAN>>> */
