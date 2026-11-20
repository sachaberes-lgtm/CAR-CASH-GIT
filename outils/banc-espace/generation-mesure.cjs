/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — les mesures d'une route (2026-11-18, rôle « generation ») =====
   mesure(r, d, palier) : r = route (generation-charge.cjs), d = sa dalle jouée. Rend une fiche : par module (la marque qui couvre l'abscisse, sinon « liaison »),
   par raccord (±0,5 s autour du début/fin de chaque module), et pour la route entière. Toutes les vitesses : v = vPalier × élan (la vitesse réelle, elanReel). */
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const vReel=p=>VW[p]*(1.8+(1-1.8)*Math.min(1,p/25));
const rayonPalier=p=>40+.3*VW[p];
const FIG2={'grande-torsade':'torsade','s-retourne':'sret','envers-entree':'failleEnvers','faille-envers':'failleEnvers','envers-sortie':'failleEnvers'};
function norm(f){if(!f)return 'liaison';f=String(f);return FIG2[f]||(/^(envers-|faille-envers)/.test(f)?'failleEnvers':f.replace(/-(entree|sortie)$/,''));}
const ENVERS_VOULU={failleEnvers:1,torsade:1,sret:1,roue:1,lune:1,asteroide:1,nebuleuse:1,spirale:1,ceinture:1,bobsleigh:1,fronde:1,surbaisse:1,plongeant:1,stengel:1,rentree:1,balancier:1,cascade:1,faille:1,plongee:1,mur:1,quart:1};
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
function crossNT(n,t){return {x:n.y*t.z-n.z*t.y,y:n.z*t.x-n.x*t.z,z:n.x*t.y-n.y*t.x};} /* B = Nn × T, comme le jeu */
function mesure(r,d,p){
  const v=vReel(p),rP=rayonPalier(p),out={g:r.graine,p,err:r.err,ms:Math.round(r.ms),reprises:r.reprises,plan:r.plan,essai:r.info&&r.info.essai,contacts:r.info&&r.info.contacts,L:d?Math.round(d.L):0};
  if(r.err||!d)return out;
  const NP=d.NP,ds=d.ds,P=d.pts,T=d.T,N=d.Nn,L=d.L;
  /* (g) NaN, points confondus du contrôle */
  let nan=0;for(let i=0;i<NP;i++)if(!isFinite(P[i].x+P[i].y+P[i].z+N[i].x+N[i].y+N[i].z+T[i].x+T[i].y+T[i].z))nan++;out.nan=nan;
  {const C=r.ctrl;let dmin=1e9,dmax=0,coude=0,coudeOu=0;for(let i=1;i<C.length;i++){const a=Math.hypot(C[i].x-C[i-1].x,C[i].y-C[i-1].y,C[i].z-C[i-1].z);if(a<dmin)dmin=a;if(a>dmax)dmax=a;
      if(i<C.length-1){const ux=C[i].x-C[i-1].x,uy=C[i].y-C[i-1].y,uz=C[i].z-C[i-1].z,wx=C[i+1].x-C[i].x,wy=C[i+1].y-C[i].y,wz=C[i+1].z-C[i].z,lu=Math.hypot(ux,uy,uz)||1,lw=Math.hypot(wx,wy,wz)||1;
        const an=Math.acos(Math.max(-1,Math.min(1,(ux*wx+uy*wy+uz*wz)/lu/lw)))*57.3;if(an>coude){coude=an;coudeOu=i;}}}
    out.ctrlPasMin=+dmin.toFixed(2);out.ctrlPasMax=Math.round(dmax);out.ctrlCoude=+coude.toFixed(1);out.nCtrl=C.length;}
  /* les marques (f) */
  const mods=d.mods.filter(m=>m.fig);const mk=[];let climax=0;
  for(let k=0;k<mods.length;k++){const m=mods[k];if(m.climax)climax++;
    if(!(m.i1>m.i0))mk.push('i0>=i1 '+m.fig);if(m.a<0||m.b>L+1)mk.push('hors route '+m.fig);if(m.b-m.a<20)mk.push('longueur '+Math.round(m.b-m.a)+' '+m.fig);
    if(k&&m.a<mods[k-1].b-1)mk.push('chevauche '+mods[k-1].fig+'/'+m.fig+' '+Math.round(mods[k-1].b-m.a)+'m');}
  out.marques=mk;out.nClimax=mods.filter(m=>m.climax).map(m=>norm(m.fig)).filter((x,i,a)=>a.indexOf(x)===i).length;out.suite=mods.map(m=>m.fig);
  /* zones refusées par pisteTord (info.zones : [fig,a,b,s0,fin,ok]) */
  out.zonesRefusees=r.info&&r.info.zones?r.info.zones.filter(z=>!z[5]).map(z=>z[0]+'@'+z[1]+'-'+z[2]+(z[2]>z[4]-40?' (fin '+z[4]+')':'')+(z[1]<z[3]+60?' (départ)':'')):[];
  /* l'étiquette de chaque point */
  const lab=new Array(NP);{let k=0;for(let i=0;i<NP;i++){const s=i*ds;let f='liaison';for(const m of mods)if(s>=m.a&&s<=m.b){f=m.fig;break;}lab[i]=f;}}
  /* les grandeurs point par point */
  const h=Math.max(1,Math.round(2/ds));const roll=new Float64Array(NP),kn=new Float64Array(NP),kg=new Float64Array(NP),ny=new Float64Array(NP),pen=new Float64Array(NP);
  for(let i=0;i<NP;i++){const a=Math.max(0,i-h),b=Math.min(NP-1,i+h),dsab=(b-a)*ds||1;const B=crossNT(N[i],T[i]);
    const dN={x:(N[b].x-N[a].x)/dsab,y:(N[b].y-N[a].y)/dsab,z:(N[b].z-N[a].z)/dsab},dT={x:(T[b].x-T[a].x)/dsab,y:(T[b].y-T[a].y)/dsab,z:(T[b].z-T[a].z)/dsab};
    roll[i]=Math.abs(dot(dN,B))*v*57.2958;kn[i]=dot(dT,N[i]);kg[i]=dot(dT,B);ny[i]=N[i].y;pen[i]=Math.asin(Math.max(-1,Math.min(1,T[i].y)))*57.2958;}
  /* le demi-tour de la normale en 0,5 s */
  const kH=Math.max(1,Math.round(.5*v/ds));const flip=new Float64Array(NP).fill(1);for(let i=0;i+kH<NP;i++)flip[i]=dot(N[i],N[i+kH]);
  /* les fiches par module */
  const M={};const fiche=f=>M[f]||(M[f]={m:0,rollMax:0,rollMaxOu:0,t60:0,t90:0,t120:0,run90:0,run90Max:0,env:0,envRun:0,envRunMax:0,rvMin:1e9,rvSens:'',rvOu:0,sousRP:0,rhMin:1e9,sousRPh:0,penMin:90,penMax:-90,flipMin:1,flipOu:0,nyMin:1});
  for(let i=0;i<NP;i++){const F=fiche(norm(lab[i]));F.m+=ds;const w=roll[i];if(w>F.rollMax){F.rollMax=w;F.rollMaxOu=Math.round(i*ds);}
    if(w>60)F.t60+=ds/v;if(w>90){F.t90+=ds/v;F.run90+=ds/v;if(F.run90>F.run90Max)F.run90Max=F.run90;}else F.run90=0;if(w>120)F.t120+=ds/v;
    if(ny[i]<0){F.env+=ds/v;F.envRun+=ds/v;if(F.envRun>F.envRunMax)F.envRunMax=F.envRun;}else F.envRun=0;if(ny[i]<F.nyMin)F.nyMin=ny[i];
    if(ny[i]>.3){const R=Math.abs(kn[i])>1e-9?1/Math.abs(kn[i]):1e9;if(R<F.rvMin){F.rvMin=R;F.rvSens=kn[i]<0?'crete':'creux';F.rvOu=Math.round(i*ds);}if(R<rP)F.sousRP+=ds;}
    {const R=Math.abs(kg[i])>1e-9?1/Math.abs(kg[i]):1e9;if(R<F.rhMin)F.rhMin=R;if(R<rP)F.sousRPh+=ds;}
    if(ny[i]>.3){if(pen[i]<F.penMin)F.penMin=pen[i];if(pen[i]>F.penMax)F.penMax=pen[i];}
    if(flip[i]<F.flipMin){F.flipMin=flip[i];F.flipOu=Math.round(i*ds);}}
  for(const f in M){const F=M[f];delete F.run90;delete F.envRun;for(const k in F)if(typeof F[k]==='number')F[k]=+F[k].toFixed(k==='flipMin'||k==='nyMin'?3:2);}
  out.mods=M;
  /* la montée tenue la plus raide sur 100 m (dalle à l'endroit), et la descente */
  {const w=Math.round(100/ds);let mu=-90,md=90,muOu=0;for(let i=0;i+w<NP;i+=2){if(ny[i]<.5||ny[i+w]<.5)continue;const dy=P[i+w].y-P[i].y,a=Math.asin(Math.max(-1,Math.min(1,dy/(w*ds))))*57.3;if(a>mu){mu=a;muOu=Math.round(i*ds);}if(a<md)md=a;}
    out.monte100=+mu.toFixed(1);out.monte100Ou=muOu;out.monte100Mod=norm(lab[Math.round(muOu/ds)]);out.descend100=+md.toFixed(1);}
  /* les raccords : ±0,5 s autour du début et de la fin de chaque module */
  const R={};const W=Math.round(.5*v/ds);
  const racc=(nom,i0)=>{const F=R[nom]||(R[nom]={n:0,rollMax:0,rvMin:1e9,dNMax:0,flipMin:1});F.n++;for(let i=Math.max(1,i0-W);i<=Math.min(NP-2,i0+W);i++){if(roll[i]>F.rollMax)F.rollMax=+roll[i].toFixed(1);
      if(ny[i]>.3){const R9=Math.abs(kn[i])>1e-9?1/Math.abs(kn[i]):1e9;if(R9<F.rvMin)F.rvMin=Math.round(R9);}
      const an=Math.acos(Math.max(-1,Math.min(1,dot(N[i],N[i+1]))))*57.3/ds;if(an>F.dNMax)F.dNMax=+an.toFixed(2);if(flip[i]<F.flipMin)F.flipMin=+flip[i].toFixed(3);}};
  for(let k=0;k<mods.length;k++){const m=mods[k],prev=k?norm(mods[k-1].fig):'liaison';
    if(k&&Math.abs(m.a-mods[k-1].b)<30){if(norm(m.fig)!==prev)racc(prev+'>'+norm(m.fig),Math.round(m.a/ds));}
    else {racc('liaison>'+norm(m.fig),Math.round(m.a/ds));}
    const nx=mods[k+1];if(!nx||Math.abs(nx.a-m.b)>=30)racc(norm(m.fig)+'>liaison',Math.round(m.b/ds));}
  out.racc=R;
  /* le départ et l'arrivée */
  {let n0=1,n1=1;for(let i=0;i<NP;i++){const s=i*ds;if(s<300&&ny[i]<n0)n0=ny[i];if(s>L-200&&ny[i]<n1)n1=ny[i];}out.nyDepart=+n0.toFixed(3);out.nyArrivee=+n1.toFixed(3);}
  /* (a) LA ROUTE QUI SE FRÔLE : la dalle jouée, tous les 3 m, contre elle-même à plus de 250 m de route (le critère de tordContacts : |d·N| < 16 et |d·B| < 62),
     vu des DEUX dalles (le jeu ne regarde que depuis la plus tôt sur l'orbite) ; « plafond » : une autre dalle 0-30 m au-dessus de la caisse, dans sa largeur (|d·B| < 40) */
  {const st=Math.max(1,Math.round(3/ds)),C=75,g=new Map(),key=(x,y,z)=>((x&2047)*2048+(y&2047))*2048+(z&2047);
    for(let i=0;i<NP;i+=st){const q=P[i],k=key(Math.floor(q.x/C),Math.floor(q.y/C),Math.floor(q.z/C));let l=g.get(k);if(!l)g.set(k,l=[]);l.push(i);}
    const ev={jeu:[],sym:[],plafond:[]};let dmin=1e9,dminOu=null;
    for(let i=0;i<NP;i+=st){const p0=P[i],cx=Math.floor(p0.x/C),cy=Math.floor(p0.y/C),cz=Math.floor(p0.z/C),Bi=crossNT(N[i],T[i]);
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const l=g.get(key(cx+a,cy+b,cz+c));if(!l)continue;
        for(const j of l){if((j-i)*ds<250)continue;const dx=P[j].x-p0.x,dy=P[j].y-p0.y,dz=P[j].z-p0.z,dd=dx*dx+dy*dy+dz*dz;if(dd>75*75)continue;const D={x:dx,y:dy,z:dz},dl=Math.sqrt(dd);
          if(dl<dmin){dmin=dl;dminOu=[Math.round(i*ds),Math.round(j*ds)];}
          const un=dot(D,N[i]),ub=dot(D,Bi),Bj=crossNT(N[j],T[j]),vn=-dot(D,N[j]),vb=-dot(D,Bj);
          const e=[Math.round(i*ds),Math.round(j*ds),norm(lab[i]),norm(lab[j]),Math.round(dl)];
          if(Math.abs(un)<16&&Math.abs(ub)<62)ev.jeu.push(e);else if(Math.abs(vn)<16&&Math.abs(vb)<62)ev.sym.push(e);
          if((un>0&&un<30&&Math.abs(ub)<40)||(vn>0&&vn<30&&Math.abs(vb)<40))ev.plafond.push(e);}}}
    const grp=L9=>{const o=[];let der=-1e9;for(const e of L9.sort((x,y)=>x[0]-y[0])){if(e[0]-der>300){o.push(e);der=e[0];}else if(e[4]<o[o.length-1][4])o[o.length-1]=e;}return o;};
    out.frole={dmin:dmin>1e8?null:Math.round(dmin),dminOu,jeu:grp(ev.jeu),sym:grp(ev.sym),plafond:grp(ev.plafond)};}
  /* (h) LES GÉANTS DES VOYAGES : la géométrie de leur décor, refaite comme voyRoue / voyLune / voyAsteroide (orbite-voyages-decor.js) sur la dalle jouée */
  const fa=s=>{s=Math.max(0,Math.min(L-.01,s));const f=s/L*(NP-1),i=Math.floor(f),j=Math.min(i+1,NP-1),u=f-i;const lp=(A,B)=>({x:A.x+(B.x-A.x)*u,y:A.y+(B.y-A.y)*u,z:A.z+(B.z-A.z)*u});
    const p=lp(P[i],P[j]),t=lp(T[i],T[j]),lt=Math.hypot(t.x,t.y,t.z)||1;t.x/=lt;t.y/=lt;t.z/=lt;const n=lp(N[i],N[j]),k=dot(n,t);n.x-=k*t.x;n.y-=k*t.y;n.z-=k*t.z;const ln=Math.hypot(n.x,n.y,n.z)||1;n.x/=ln;n.y/=ln;n.z/=ln;return {p,t,n,b:crossNT(n,t)};};
  const dist=(A,B)=>Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z);
  const gtPas=Math.max(1,Math.round(6/ds));const distRoute=(C,x0,x1)=>{let d2=1e18;for(let i=0;i<NP;i+=gtPas){const s9=i*ds;if(s9>x0&&s9<x1)continue;const q=P[i],e=(q.x-C.x)**2+(q.y-C.y)**2+(q.z-C.z)**2;if(e<d2)d2=e;}return Math.sqrt(d2);};
  const G=[];
  for(const m of mods){if(!m.nu||!m.nu.length||m.nu[0].t!=='voy')continue;const k=m.nu[0].k,sa=m.nu[0].s,sm=m.nu[1].s,sb=m.nu[2].s,o={k,sa:Math.round(sa),sm:Math.round(sm),sb:Math.round(sb),marqueA:Math.round(m.a),marqueB:Math.round(m.b)};
    o.decaleMarque=Math.round(Math.max(Math.abs(sa-m.a),Math.abs(sb-m.b)));
    if(k==='roue'){const A=fa(sa).p,F=fa(sm),B=F.p,Cc=fa(sb).p;const a={x:A.x-B.x,y:A.y-B.y,z:A.z-B.z},b={x:Cc.x-B.x,y:Cc.y-B.y,z:Cc.z-B.z};
      const axb={x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x},l2=dot(axb,axb);
      if(l2<1e-6)o.cercle=null;else{const aa=dot(a,a),bb=dot(b,b),u={x:b.x*aa-a.x*bb,y:b.y*aa-a.y*bb,z:b.z*aa-a.z*bb},c=crossNT(u,axb);/* u × axb */const Cn={x:(u.y*axb.z-u.z*axb.y)/(2*l2)+B.x,y:(u.z*axb.x-u.x*axb.z)/(2*l2)+B.y,z:(u.x*axb.y-u.y*axb.x)/(2*l2)+B.z};
        const R=dist(Cn,B),dir={x:(Cn.x-B.x)/R,y:(Cn.y-B.y)/R,z:(Cn.z-B.z)/R},face=dot(F.n,dir);o.R=Math.round(R);o.face=+face.toFixed(2);o.jante=(R>150&&R<1400&&face>.45)?1:0;
        /* la dalle colle-t-elle au cercle ? l'écart de la route [sa,sb] au cercle (distance au centre − R) */
        let e=0,eM=0,nE=0;for(let s9=sa;s9<=sb;s9+=10){const q=fa(s9).p,x=Math.abs(dist(q,Cn)-R);e+=x;nE++;if(x>eM)eM=x;}o.ecartMoy=Math.round(e/Math.max(1,nE));o.ecartMax=Math.round(eM);
        /* la route d'à côté (sa−120..sa−30, sb+30..sb+120 : là où voyRoue ne regarde pas) qui passerait dans la jante (le chenal : ±78 m de large, 30 m de haut) */
        if(o.jante){const ax={x:axb.x/Math.sqrt(l2),y:axb.y/Math.sqrt(l2),z:axb.z/Math.sqrt(l2)};let pire=1e9,pireOu=0;
          for(const [x0,x1] of [[sa-120,sa-30],[sb+30,sb+120]])for(let s9=x0;s9<=x1;s9+=5){const q=fa(s9).p,dq={x:q.x-Cn.x,y:q.y-Cn.y,z:q.z-Cn.z},hz=dot(dq,ax),pl={x:dq.x-hz*ax.x,y:dq.y-hz*ax.y,z:dq.z-hz*ax.z},rr=Math.hypot(pl.x,pl.y,pl.z);
            const dc=Math.hypot(rr-R,Math.max(0,Math.abs(hz)-78));if(dc<pire){pire=dc;pireOu=Math.round(s9);}}
          o.voisineJante=Math.round(pire);o.voisineJanteOu=pireOu;
          /* LA COQUE de la jante (voyRoue : la roue hors de l'arc de la route, θ de tb+gap à 2π−gap ; sol à R+OFF, coque à R+OFF+22, lèvres à ±78 m jusqu'à R−30)
             contre la dalle d'approche et de sortie (sa−120..sa, sb..sb+120, que le filtre `ok` ne regarde pas) : le centre et les deux bords (±28 m) */
          const e1={x:(A.x-Cn.x)/R,y:(A.y-Cn.y)/R,z:(A.z-Cn.z)/R};let e2=crossNT(ax,e1);const cc={x:Cc.x-Cn.x,y:Cc.y-Cn.y,z:Cc.z-Cn.z};let tb=Math.atan2(dot(cc,e2),dot(cc,e1));if(tb<0){e2={x:-e2.x,y:-e2.y,z:-e2.z};tb=-tb;}
          const gap=Math.max(.16,90/R),OFF=5.2+1.2;let coque=0,coqueOu=null,levre=0,rrMax9=-1e9;
          for(const [x0,x1] of [[sa-120,sa-1],[sb+1,sb+120]])for(let s9=x0;s9<=x1;s9+=2){const F9=fa(s9);let hit=0,lv=0;for(const lat of [-28,0,28]){const q={x:F9.p.x+F9.b.x*lat,y:F9.p.y+F9.b.y*lat,z:F9.p.z+F9.b.z*lat},dq={x:q.x-Cn.x,y:q.y-Cn.y,z:q.z-Cn.z},hz=dot(dq,ax);
              let th=Math.atan2(dot(dq,e2),dot(dq,e1));if(th<0)th+=2*Math.PI;if(!(th>=tb+gap&&th<=2*Math.PI-gap))continue;const pl={x:dq.x-hz*ax.x,y:dq.y-hz*ax.y,z:dq.z-hz*ax.z},rr=Math.hypot(pl.x,pl.y,pl.z)-R;
              const rd9={x:Math.cos(th)*e1.x+Math.sin(th)*e2.x,y:Math.cos(th)*e1.y+Math.sin(th)*e2.y,z:Math.cos(th)*e1.z+Math.sin(th)*e2.z},Pk={x:Cn.x+rd9.x*R,y:Cn.y+rd9.y*R,z:Cn.z+rd9.z*R};const okP=Q=>distRoute(Q,sa-120,sb+120)>98;const pose9=okP(Pk)&&okP({x:Pk.x+ax.x*78,y:Pk.y+ax.y*78,z:Pk.z+ax.z*78})&&okP({x:Pk.x-ax.x*78,y:Pk.y-ax.y*78,z:Pk.z-ax.z*78});if(!pose9)continue;if(Math.abs(hz)<78&&rr>OFF+1&&rr<OFF+22+5.2)hit=1;if(Math.abs(hz)<78&&rr>OFF+1&&lat===0&&rr>rrMax9)rrMax9=rr;if(Math.abs(Math.abs(hz)-78)<2&&rr>-30&&rr<OFF)lv=1;}
            if(hit){coque+=2;if(!coqueOu)coqueOu=Math.round(s9);}if(lv)levre+=2;}
          o.coque=coque;o.coqueOu=coqueOu;o.levre=levre;o.coqueProf=rrMax9>-1e8?+(rrMax9-OFF).toFixed(1):null;}}}
    else if(k==='lune'){const S9=[];for(let s9=sa;s9<=sb;s9+=20){const F=fa(s9);S9.push([F.p,F.n]);}
      if(S9.length>=4){let best=null;for(let Rm=140;Rm<=720;Rm+=20){const C={x:0,y:0,z:0};for(const q of S9){C.x+=q[0].x-q[1].x*(Rm+12);C.y+=q[0].y-q[1].y*(Rm+12);C.z+=q[0].z-q[1].z*(Rm+12);}C.x/=S9.length;C.y/=S9.length;C.z/=S9.length;
          let e=0;for(const q of S9)e+=Math.abs(dist(q[0],C)-(Rm+12));e/=S9.length;if(!best||e<best.e)best={C,Rm,e};}
        const C=best.C;let R=1e9;for(const q of S9)R=Math.min(R,dist(q[0],C)-14-5.2);R=Math.min(R,distRoute(C,sa-150,sb+150)-28-45,900);o.R=Math.round(R);o.ecart=Math.round(best.e);o.Rm=best.Rm;o.posee=R>=110?1:0;
        if(o.posee){/* la route qui entre dans la lune (en vol : 'paroi', la mort) : sur [sa−150, sb+150] (voyLune ne borne R que par S9, de 20 en 20 m, et par la route hors de cet intervalle) */
          let pire=1e9,pireOu=0;for(let s9=sa-150;s9<=sb+150;s9+=3){const F=fa(s9),dd=dist(F.p,C)-R;if(dd<pire){pire=dd;pireOu=Math.round(s9);}}o.routeSurface=Math.round(pire);o.routeSurfaceOu=pireOu;
          /* au-dessus de la dalle (le vol : un saut de 20-60 m de haut) : la lune à moins de 60 m dans la direction de la normale ? */
          let vol=1e9,volOu=0;for(let s9=sa-300;s9<=sb+300;s9+=5){const F=fa(s9);for(const hh of [10,25,45,70]){const q={x:F.p.x+F.n.x*hh,y:F.p.y+F.n.y*hh,z:F.p.z+F.n.z*hh},dd=dist(q,C)-R;if(dd<vol){vol=dd;volOu=Math.round(s9)+'/'+hh;}}}o.volSurface=Math.round(vol);o.volSurfaceOu=volOu;}}}
    else if(k==='asteroide'){const CT=[];for(let s9=sa-40;s9<=sb+40;s9+=8){const F=fa(s9);CT.push({x:F.p.x+F.n.x*20,y:F.p.y+F.n.y*20,z:F.p.z+F.n.z*20});}
      const F=fa(sm),C={x:F.p.x+F.n.x*20,y:F.p.y+F.n.y*20,z:F.p.z+F.n.z*20};let Ra=.5*dist(CT[0],CT[CT.length-1])-30;const dR=distRoute(C,sa-260,sb+260)-28-40;Ra=Math.min(Ra,dR);o.Ra=Math.round(Ra);o.posee=Ra>=110?1:0;
      if(o.posee){/* la route DANS la roche hors du trou du tunnel (centres CT, trou de 68 m) : la dalle entre dans la roche pleine — sur [sa−260, sb+260] */
        let dedans=0,pire=1e9,pireOu=0;for(let s9=sa-260;s9<=sb+260;s9+=3){const q=fa(s9).p;const dc=dist(q,C);if(dc<Ra){let dt=1e9;for(const t of CT){const e=dist(q,t);if(e<dt)dt=e;}
            if(dt>68){dedans+=3;if(Ra-dc<pire||pire===1e9){}if(dc-Ra<pire){pire=dc-Ra;pireOu=Math.round(s9);}}}}
        o.routeDansRoche=dedans;o.routeDansRocheOu=pireOu;}}
    else if(k==='nebuleuse'){o.posee=1;}
    G.push(o);}
  out.geants=G;
  return out;}
module.exports={mesure,norm,vReel,rayonPalier,VW};
