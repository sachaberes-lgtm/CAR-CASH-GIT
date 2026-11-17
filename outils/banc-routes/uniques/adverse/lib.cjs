/* ===== CONTRÔLE ADVERSE DES ROUTES UNIQUES — la bibliothèque (2026-11-17) =====
   Charge le code (worktree ou ref=<commit>) par outils/banc-routes/uniques/routes.cjs (seulement son chargement de fichiers : la route et ses normales
   sont relues ici), rééchantillonne, et mesure avec NOS outils (pas ceux des auteurs) : repère du départ, distances, roulis, crêtes, recoupes. */
const path=require('path'),vm=require('vm');
const R=require('../routes.cjs');
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const vElan=p=>VW[p]*(1.8+(1-1.8)*Math.min(1,p/25)); /* vT : la vitesse ressentie (DUREE_ELAN 1,8 → 1 sur 25 paliers) */
const rayonPalier=p=>40+.3*VW[p];
function graines(n,base){let a=base>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const G=[];for(let i=0;i<n;i++)G.push((f()*1e9)|0);return G;} /* comme le jeu : (Math.random()*1e9)|0 */

/* le moteur : route(g,p) → {ctrl:[[x,y,z]], N:[[x,y,z]]|null, suite:[noms], mods:[{nom,i0,i1}], ms, plan, reprises} */
function moteur(carte,search,ref){
  const M=R.moteur(carte,search||'',ref||''),ctx=M.ctx,run=s=>vm.runInContext(s,ctx);
  const aRU=run("typeof RU!=='undefined'");
  const vSum=()=>aRU?run("(function(){let s=0;for(const k in RU.V)s+=RU.V[k];return s;})()"):0;
  const o={carte,ctx,run,aRU,
    raz(){if(aRU)run("RU.H={};RU.P.clear();RU.V={};");if(carte==='espace')run("ORB_PIOCHE.der={};ORB_PIOCHE.voyDer=undefined;ORB_PIOCHE.vo=null;ORB_PIOCHE.hum=null;");if(carte==='jade')run("JADE_AMEMO.m.clear()");},
    route(g,p){const v0=vSum(),t0=process.hrtime.bigint();let ctrl,N=null,mods;
      if(carte==='jade'){const r=M.route(g,p);ctrl=r.ctrl;const bn=ctx.JADE.bankN;N=bn&&bn.length===ctrl.length?bn.map(v=>({x:v.x,y:v.y,z:v.z})):null;mods=r.mods;}
      else{ctx.__setPalier(p|0,VW[p|0]);ctx.LVL.cur={id:'espace',espace:1,carte:'espace',sansFin:1};ctx.window.dbgEspOff=false;ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
        let c=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0);const n0=c.length;const m0=ctx.MODMARK.map(m=>Object.assign({},m));
        const tord=ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn());
        if(tord){const h=ctx.pisteTordPropre(c,g);c=h.ctrl;N=h.N.map(v=>({x:v.x,y:v.y,z:v.z}));}
        ctrl=c.map(q=>({x:q.x,y:q.y,z:q.z}));mods=ctx.MODMARK.filter(m=>m.fig).map(m=>({nom:m.fig,i0:m.i0,i1:m.i1,climax:!!m.climax}));}
      const ms=Number(process.hrtime.bigint()-t0)/1e6,v1=vSum();
      const suite=[];for(const m of mods){const f=norm(m.nom);if(suite.indexOf(f)<0)suite.push(f);} /* comme orbUNoms : un nom par module */
      const seq=[];for(const m of mods){const f=norm(m.nom);if(seq[seq.length-1]!==f)seq.push(f);}
      let plan=null;if(aRU){try{plan=carte==='jade'?run("JADE.u?JSON.stringify({cap:JADE.u.cap,relief:JADE.u.relief,ouv:JADE.u.ouv,itin:JADE.u.itin}):null"):run("OU.der?JSON.stringify({ouv:OU.der.ouv,fin:OU.der.fin,rel:OU.der.rel,sil:OU.der.sil,cx:OU.der.cx}):null");plan=plan&&JSON.parse(plan);}catch(e){}}
      return {g,p,ctrl,N,mods,suite,seq,ms,plan,reprises:v1>=v0?v1-v0:v1};}};
  return o;}
const FIG2={'grande-torsade':'torsade','s-retourne':'sret','envers-entree':'failleEnvers','faille-envers':'failleEnvers','envers-sortie':'failleEnvers'};
function norm(f){f=String(f);return FIG2[f]||(/^(envers-|faille-envers)/.test(f)?'failleEnvers':f.replace(/-(entree|sortie)$/,''));}

/* ---------- géométrie ---------- */
function abs(P){const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y,P[i].z-P[i-1].z));return S;}
function interp(P,S,s,j){ /* j : indice de départ (curseur) */ if(s<=0)return [P[0],0,0];const n=S.length;if(s>=S[n-1])return [P[n-1],n-2,1];while(j<n-2&&S[j+1]<s)j++;const t=(s-S[j])/((S[j+1]-S[j])||1);
  const a=P[j],b=P[j+1];return [{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t},j,t];}
/* rééchantillonne au pas `pas` (m) ; rend X,Y,Z (repère du départ : z = cap moyen des 50 premiers m, x = à droite… signe arbitraire mais commun), et N rééchantillonné */
function resample(r,pas){const P=r.ctrl,S=abs(P),L=S[S.length-1],n=Math.floor(L/pas)+1;const pts=[],nn=[];let j=0;
  for(let k=0;k<n;k++){const q=interp(P,S,k*pas,j);j=q[1];pts.push(q[0]);if(r.N){const a=r.N[q[1]],b=r.N[Math.min(r.N.length-1,q[1]+1)],t=q[2];let v={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};const l=Math.hypot(v.x,v.y,v.z)||1;nn.push({x:v.x/l,y:v.y/l,z:v.z/l});}}
  const o=pts[0],k50=Math.min(n-1,Math.round(50/pas)),h=Math.atan2(pts[k50].x-o.x,pts[k50].z-o.z),c=Math.cos(h),s=Math.sin(h);
  const X=new Float64Array(n),Y=new Float64Array(n),Z=new Float64Array(n);
  for(let k=0;k<n;k++){const dx=pts[k].x-o.x,dz=pts[k].z-o.z;X[k]=dx*c-dz*s;Z[k]=dx*s+dz*c;Y[k]=pts[k].y-o.y;}
  return {L,pas,n,X,Y,Z,W:pts,N:nn.length?nn:null,S};}
/* cap déroulé (deg) et pente (deg) d'un échantillonnage */
function capPente(G){const n=G.n,CAP=new Float64Array(n),PEN=new Float64Array(n);let cap=0,prev=null;
  for(let k=0;k<n;k++){const a=Math.max(0,k-1),b=Math.min(n-1,k+1),dx=G.X[b]-G.X[a],dz=G.Z[b]-G.Z[a],dpl=Math.hypot(dx,dz),dy=G.Y[b]-G.Y[a];PEN[k]=Math.atan2(dy,dpl)*57.2958;
    if(dpl>.2*G.pas*(b-a)){const h=Math.atan2(dx,dz);if(prev==null)cap=h*57.2958;else{let d=h-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;cap+=d*57.2958;}prev=h;}CAP[k]=cap;}
  return {CAP,PEN};}
/* LA SÉCURITÉ d'une route (pas 5 m) — v : la vitesse ressentie (m/s), rP : rayonPalier, g : 33 (FALL_G) */
function securite(r,v,rP){const G=resample(r,5),n=G.n,W=G.W,N=G.N,up={x:0,y:1,z:0};const out={L:Math.round(G.L)};
  const T=[];for(let k=0;k<n;k++){const a=W[Math.max(0,k-1)],b=W[Math.min(n-1,k+1)];let t={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z};const l=Math.hypot(t.x,t.y,t.z)||1;T.push({x:t.x/l,y:t.y/l,z:t.z/l});}
  /* rayons : 3D et en plan, sur ±10 m (deux pas) */
  let rMin3=1e9,rMinPl=1e9,sousRP=0,droit=0,droitMax=0,droit3=0,droit3Max=0,penMax=0,lev=0,levMax=0,levN=0,rollMax=0,rollT=[],env=0,envRun=0,envMax=0,penRun=[];
  const kk=2;
  for(let k=kk;k<n-kk;k++){const a=T[k-kk],b=T[k+kk],ds=2*kk*G.pas;const dT={x:(b.x-a.x)/ds,y:(b.y-a.y)/ds,z:(b.z-a.z)/ds},kap=Math.hypot(dT.x,dT.y,dT.z);const R3=kap>1e-9?1/kap:1e9;
    const ha=Math.atan2(a.x,a.z),hb=Math.atan2(b.x,b.z);let dh=hb-ha;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;const hor=Math.hypot(T[k].x,T[k].z),Rpl=Math.abs(dh)>1e-9?ds*hor/Math.abs(dh):1e9;
    const debout=N?N[k].y>.3:true,vertical=Math.abs(T[k].y)>.9;
    if(R3<rMin3)rMin3=R3;if(!vertical&&debout&&Rpl<rMinPl)rMinPl=Rpl;if(!vertical&&debout&&Rpl<rP)sousRP+=G.pas;
    if(Rpl>450&&!vertical){droit+=G.pas;if(droit>droitMax)droitMax=droit;}else droit=0;
    if(R3>450){droit3+=G.pas;if(droit3>droit3Max)droit3Max=droit3;}else droit3=0;
    /* la droite « vécue » : la direction tourne (en 3D) de moins de 5 °/s à la vitesse du palier */
    if(kap*v*57.2958<5){out._dt=(out._dt||0)+G.pas;if(out._dt>(out._dtM||0)){out._dtM=out._dt;out._dtO=k*G.pas;}}else out._dt=0;
    /* le rayon vertical (le long de la normale), sur la dalle debout : creux (κn>0) et crêtes (κn<0) */
    if(N&&N[k].y>.3){const kn=dT.x*N[k].x+dT.y*N[k].y+dT.z*N[k].z,Rv=Math.abs(kn)>1e-9?1/Math.abs(kn):1e9;if(Rv<(out.rVertMin||1e9)){out.rVertMin=Math.round(Rv);out.rVertOu=k*G.pas;out.rVertSens=kn<0?'crete':'creux';}}
    const pen=Math.asin(Math.max(-1,Math.min(1,T[k].y)))*57.2958;if(debout&&Math.abs(pen)>penMax)penMax=Math.abs(pen);
    /* la crête : la route s'éloigne de sa normale (κn < 0) plus vite que la gravité ne la retient */
    if(N){const kn=dT.x*N[k].x+dT.y*N[k].y+dT.z*N[k].z;if(N[k].y>.3&&kn<0){const q=v*v*(-kn)/(33*N[k].y);if(q>levMax)levMax=q;if(q>1)lev+=G.pas;}}
    else{/* sans normales : la verticale */const kn=dT.y;if(kn<0&&!vertical){const q=v*v*(-kn)/33;if(q>levMax)levMax=q;if(q>1)lev+=G.pas;}}}
  out.rMin3=Math.round(rMin3);out.rMinPlan=Math.round(rMinPl);out.sousRP=Math.round(sousRP);out.droitePlanMax=Math.round(droitMax);out.droitePlanS=+(droitMax/v).toFixed(2);out.droite3Max=Math.round(droit3Max);out.droite3S=+(droit3Max/v).toFixed(2);
  out.droiteVecueS=+((out._dtM||0)/v).toFixed(2);out.droiteVecueOu=out._dtO||0;delete out._dt;delete out._dtM;delete out._dtO;
  out.penteMax=+penMax.toFixed(1);out.leveMax=+levMax.toFixed(2);out.leveM=Math.round(lev);
  /* pente moyenne sur 300 m, la plus forte */
  {let m=0;const w=60;for(let k=0;k+w<n;k+=4){const d=(G.W[k+w].y-G.W[k].y)/Math.max(1,Math.hypot(G.W[k+w].x-G.W[k].x,G.W[k+w].z-G.W[k].z));const a=Math.abs(Math.atan(d))*57.2958;if(a>m)m=a;}out.pente300Max=+m.toFixed(1);}
  /* roulis vu de l'horizon (°/s) sur ±12,5 m, et l'envers */
  if(N){const roll=new Float64Array(n),ok=new Uint8Array(n);
    for(let k=0;k<n;k++){const t=T[k];let sx=t.z,sz=-t.x;const sl=Math.hypot(sx,sz);if(sl<.3){ok[k]=0;continue;}sx/=sl;sz/=sl; /* side = T × up */
      const ux=-t.y*sz*0+ (sz*t.y), uy=(sx*t.z-sz*t.x), uz=(-sx*t.y); /* upp = side × T */
      const ns=N[k].x*sx+N[k].z*sz,nu=N[k].x*ux+N[k].y*uy+N[k].z*uz;roll[k]=Math.atan2(ns,nu);ok[k]=1;}
    const h=3;let mx=0;const rates=[];for(let k=h;k<n-h;k++){if(!ok[k-h]||!ok[k+h])continue;let d=roll[k+h]-roll[k-h];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const rate=Math.abs(d)/(2*h*G.pas)*v*57.2958;rates.push(rate);if(rate>mx){mx=rate;out.roulisOu=k*G.pas;}}
    rates.sort((a,b)=>a-b);out.roulisMax=Math.round(mx);out.roulisP99=Math.round(rates[Math.floor(rates.length*.99)]||0);out.roulisSur60=+(rates.filter(x=>x>60).length*G.pas/v).toFixed(2);
    for(let k=0;k<n;k++){if(N[k].y<0){env+=G.pas;envRun+=G.pas;if(envRun>envMax)envMax=envRun;}else envRun=0;}out.envers=+(env/G.L).toFixed(3);out.enversMaxS=+(envMax/v).toFixed(2);}
  /* la recoupe : le plus court écart entre deux passages séparés de plus de 400 m de route (pas 10 m, grille de 120 m) */
  {const pas=2,cell=120,map=new Map();for(let k=0;k<n;k+=pas){const p=W[k],key=Math.floor(p.x/cell)+','+Math.floor(p.y/cell)+','+Math.floor(p.z/cell);if(!map.has(key))map.set(key,[]);map.get(key).push(k);}
    let dmin=1e9,dminPl=null;for(let k=0;k<n;k+=pas){const p=W[k],cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell),cz=Math.floor(p.z/cell);
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const L9=map.get((cx+a)+','+(cy+b)+','+(cz+c));if(!L9)continue;for(const j of L9){if(j<=k+400/G.pas)continue;const q=W[j],d=Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z);if(d<dmin){dmin=d;dminPl=[k*G.pas,j*G.pas];}}}}
    out.recoupe=dmin>1e8?null:Math.round(dmin);out.recoupeOu=dminPl;}
  return out;}
module.exports={moteur,graines,VW,vElan,rayonPalier,resample,capPente,securite,norm,abs};
