/* LES NOUVEAUX FRUITS DE LA ROUTE (2026-10-20, Léo : « les boosts de la route disparaissent, on booste non-stop en attrapant des fruits ») — ÉTAPE 1 : les FORMES.
   9 fruits NORMAUX (même nitro chacun) : myrtille, cerise, kiwi en quart, pêche, orange, mangue, pomme, melon en quart, litchi en quart — et les formes des
   5 FRUITS-POUVOIRS (`FRN_PIMENT` nitro infinie, `FRN_CITRON` vitesse ×2, `FRN_DRAGON` aura ×2/×3, `FRN_RAISIN` airtime ×2, `FRN_POMMEDOREE` aimant), utilisées par `mkPower`.
   Les 13 anciens fruits (dont les 7 exotiques du SOLEIL DE JADE et du CANYON) sont rangés dans `FRUIT_EXO` : ils restent au cahier des charges, HORS du jeu.
   Recettes nées à l'atelier (même kit que les caisses : `lpKit`, facettes colorées une à une) ; palette sombre exprès (le studio du jeu éclaire fort).
   ⚠ `FRUIT_DEFS` est MUTÉ ici (jamais réassigné) : tout le reste du jeu (mkFruit, fruitPick, l'étal) le lit tel quel. */
/* (généré le 2026-10-20 depuis les recettes de l'atelier de Léo : fruits-v2/v3/v5) */
const FRUIT_PAL_N={jl1:0x7d1625,jl2:0x903540,jl3:0x530a18,jlP:0x947449,jlT:0x36230e,jlL:0x1c5319,jll:0x103811,jlC:0xa5a09a,jlc:0x968d87,jlN:0x23100a,jk1:0x99490b,jk2:0x996a2c,jk3:0x7e3106,jk4:0x997d43,jkC:0x355019,jkc:0x203d0e,jkT:0x2c1f0b,jp1:0x860d49,jp2:0x992f64,jp3:0x600531,jpS:0x5c8b1d,jpW:0xa8a2a6,jpw:0xa08d9a,jpK:0x100a0e,jm1:0x36102c,jm2:0x531d43,jm3:0x1e0a19,jmC:0x356022,jmc:0x1f4312,jmT:0x362913,jmW:0xa8a5a1,jmw:0x99918f,jmR:0x733a60,cb1:0x780b2c,cb2:0x8f2344,cb3:0x863d12,cb4:0x915c1d,cbS:0xa2945b,cbs:0x6e5c26,cbT:0x401013,cbG:0x2c5318,dt1:0x491d0a,dt2:0x6e3a11,dt3:0x2c1004,dt4:0x866030,dtC:0x826a43,dtB:0x405319,dtb:0x23360e,dtR:0x36230c,me1:0x7e7144,me2:0x5c5c31,me3:0x3a4822,meN:0xa0997c,me4:0x362c13,meF:0x995c26,mef:0x997240,meE:0x6e824d,meG:0xa09874,meL:0x235318,mel:0x123811,ce1:0x6a0a19,ce2:0x861929,ce3:0x3e040d,ceH:0x994950,ceT:0x2c4914,ceL:0x1c5319,cel:0x103811,ki1:0x493619,ki2:0x5c4928,kiS:0x78823e,kiF:0x4a7313,kiG:0x35600c,kiL:0x7b904d,kiW:0xa4a489,kiK:0x100c0a,ma1:0x8b5c0e,ma2:0x92731d,ma3:0x821d11,ma4:0x49651d,maT:0x2c230e,maL:0x1c5319,mal:0x103811,pm1:0x7d1116,pm2:0x902923,pm3:0x53070e,pmY:0x8b6c23,pmT:0x2c1f0c,pmL:0x1c5319,pml:0x103811,pi1:0x7d0a11,pi2:0x902316,pi3:0x490205,pi4:0x994930,piG:0x235c14,pig:0x12400c,ci1:0x907f0c,ci2:0xa8a145,ci3:0x6e5c07,ciT:0x36400e,ciL:0x235c18,cil:0x124011,rg1:0x401965,rg2:0x7d377a,rg3:0x2c0c48,rgH:0xa4779a,rg4:0x601935,rg5:0x56266a,rg6:0x49132b,rgT:0x36230e,rgL:0x235c18,rgl:0x124011,wgW:0xffffff,wgw:0xf2ecdc,wgG:0xffeaa8,go1:0x86600a,go2:0x99822c,go3:0x5c3b02,goH:0xa8a06a,goT:0x402c0a,goL:0x786a1d,gol:0x53490a,piY:0x996e22,piO:0x99490e,piH:0x497d2b,piT:0x234910,piL:0x236219,pil:0x12400e,ciW:0xfcf9de,ciF:0xf2ed7a,ciG:0xc3bf40,ciH:0xfcf9a8,ciD:0xb4ad31,ciK:0x655c26,kiD:0x25530a,kiH:0x6e8e30,jpY:0x82992c,jpM:0x7d0a49};
function frPomme(K,k){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,22,14),v=>{const r=Math.hypot(v.x,v.z),a=Math.atan2(v.z,v.x);
    let y=v.y*.84,w=.82*(1+.06*v.y)*(1+.03*Math.cos(5*a)*(v.y<-.4?1:0));
    if(v.y>0)y-=.26*Math.exp(-r*r/.07); else y+=.10*Math.exp(-r*r/.05);
    v.set(v.x*w,y,v.z*w);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x*2,y*2,z*2),L=.5*nx+.6*ny+.35*nz+(h-.5)*.3;
    if(ny>.8&&y>.45)return k[3]; // le creux, côté queue
    if(Math.abs(Math.sin(Math.atan2(z,x)*6+y*2))<.18&&y<.3)return k[3];
    return L>.7?k[1]:L>.2?k[0]:k[2];});
  K.put(k[4],new T.CylinderGeometry(.035,.05,.34,5),.03,.66,0,0,0,.2);
  H.LF(k[5],k[6],.6,.2,.22,.1,.07,.74,0,.55,.5,.35,6);
}
const FRN_CERISE=function(K){const H=frH(K),T=H.T;
  const ce=(cx,cy,cz)=>{const g=H.D(new T.SphereGeometry(1,16,12),v=>{const r=Math.hypot(v.x,v.z);
      v.set(v.x*.40,v.y*.38-(v.y>0?.10:0)*Math.exp(-r*r/.05),v.z*.40);});
    g.translate(cx,cy,cz);
    H.P(g,(x,y,z,nx,ny,nz)=>{const L=.5*nx+.6*ny+.4*nz;if(L>.82)return 'ceH';return L>.5?'ce2':L>.05?'ce1':'ce3';});};
  ce(-.36,-.28,0);ce(.34,-.34,.06);
  const tige=(x0,y0,z0,x1,y1,z1)=>{const L=Math.hypot(x1-x0,y1-y0,z1-z0),mx=(x0+x1)/2,my=(y0+y1)/2,mz=(z0+z1)/2,
      rz=-Math.atan2(x1-x0,y1-y0);K.put('ceT',new T.CylinderGeometry(.028,.028,L,5),mx,my,mz,0,0,rz);};
  tige(-.36,-.04,0,.02,.62,.03);tige(.34,-.10,.06,.02,.62,.03);
  H.LF('ceL','cel',.55,.2,.22,.1,.02,.62,.03,.5,.7,.5,6);
};
const FRN_KIWI=function(K){const H=frH(K),T=H.T;
  // kiwi entier, un quartier ôté : peau velue ; chair en dégradé (lime clair près du cœur, émeraude au bord), 24 rayons
  const NT=14,NP=28,J0=7,CZ=.66,BY=.80,NF=24;
  const TO=(k,a,b,c,n)=>{const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];if(nx*n[0]+ny*n[1]+nz*n[2]<0)K.tri(k,a,c,b);else K.tri(k,a,b,c);};
  
  const S=(t,f,r)=>[CZ*Math.sin(t)*Math.cos(f)*r,BY*Math.cos(t)*r,CZ*Math.sin(t)*Math.sin(f)*r];
  for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(let j=J0;j<NP;j++){const f0=j/NP*6.2832,f1=(j+1)/NP*6.2832,a=S(t0,f0,1),b=S(t1,f0,1),c=S(t1,f1,1),d=S(t0,f1,1);
      const h=H.hs(i*2.7,j*1.9,5),k=h>.62?'ki2':'ki1';K.tri(k,a,b,c);K.tri(k,a,c,d);}}
  // chair : rayons fins, relief en léger toit (centre de chaque rayon surélevé)
  for(const f of [J0/NP*6.2832,6.2832]){const ca=Math.cos(f),sa=Math.sin(f);
    const nrm=f>6?[0,0,1]:[sa,0,-ca];
    const Q=(t,r,h)=>{const p=S(t,f,r);return [p[0]+nrm[0]*h,p[1]+nrm[1]*h,p[2]+nrm[2]*h];};
    const bands=[[0,.12,'kiW',0],[.12,.26,'kiL',.01],[.26,.55,null,.02],[.55,.86,null,.012],[.86,.93,'kiS',0],[.93,1,'ki2',0]];
    for(let i=0;i<NF;i++){const t0=i/NF*Math.PI,t1=(i+1)/NF*Math.PI,tm=(t0+t1)/2;
      for(const q of bands){const raised=q[3];
        const a=Q(t0,q[0],0),b=Q(t1,q[0],0),c=Q(t1,q[1],0),d=Q(t0,q[1],0),m0=Q(tm,q[0],raised),m1=Q(tm,q[1],raised);
        const outer=q[1]>.5;const ka=q[2]||(outer?(i%2?'kiG':'kiD'):(i%2?'kiH':'kiF')),kb=q[2]||(outer?(i%2?'kiD':'kiG'):(i%2?'kiF':'kiH'));
        TO(ka,a,m0,m1,nrm);TO(ka,a,m1,d,nrm);TO(kb,m0,b,c,nrm);TO(kb,m0,c,m1,nrm);}}
    // pépins en deux couronnes, forme de larme
    const seed=(c,u,v,n)=>{const g=(a,b,h)=>[c[0]+u[0]*a+v[0]*b+n[0]*h,c[1]+u[1]*a+v[1]*b+n[1]*h,c[2]+u[2]*a+v[2]*b+n[2]*h];
      const A=g(-.034,0,.004),B=g(0,-.014,.004),C=g(.034,0,.004),E=g(0,.014,.004),Hh=g(0,0,.016);
      K.tri('kiK',A,B,Hh);K.tri('kiK',B,C,Hh);K.tri('kiK',C,E,Hh);K.tri('kiK',E,A,Hh);};
    for(let i=0;i<26;i++){const th=i/26*Math.PI+.06,r=.2+.045*(i%2),p=Q(th,r,.02);
      const dx=Q(th+.01,r,0),dy=Q(th,r+.01,0);const u=[dy[0]-p[0],dy[1]-p[1],dy[2]-p[2]],l=Math.hypot(...u)||1;
      seed([p[0],p[1],p[2]],[u[0]/l,u[1]/l,u[2]/l],[nrm[1]*0,1,0],nrm);}}
  K.put('ki1',new T.CylinderGeometry(.04,.06,.1,5),0,.8,0);
};
const FRN_MANGUE=function(K){const H=frH(K),T=H.T;
  const g=H.D(new T.SphereGeometry(1,22,14),v=>{const y=v.y;
    const bend=.14*y*y,w=.52*(1+.14*y)*(y>0.7?1-(y-.7)*.8:1);
    v.set(v.x*w*1.15+bend,y*.80,v.z*w*.9);});
  H.P(g,(x,y,z,nx,ny,nz)=>{const h=H.hs(x*2,y*2,z*2),joue=-.7*nx+.2*ny+.5*nz+(h-.5)*.5;
    if(y>.55)return h>.5?'ma4':'ma2';
    if(joue>.45)return h>.4?'ma3':'ma1';
    const L=.5*nx+.6*ny+.3*nz;return L>.5?'ma2':'ma1';});
  K.put('maT',new T.CylinderGeometry(.03,.045,.2,5),.12,.78,0,0,0,-.35);
  H.LF('maL','mal',.7,.16,.2,.1,.12,.78,0,.5,.3,.4,6);
};
const FRN_POMME=function(K){frPomme(K,['pm1','pm2','pm3','pmY','pmT','pmL','pml']);};
const FRN_MELON=function(K){const H=frH(K),T=H.T;
  // melon brodé de son filet, un quartier ôté : la chair orange, les pépins
  const AX=.86,BY=.80,CZ=.86,NT=14,NP=28,J0=7;
  const S=(t,f,r)=>[AX*Math.cos(t)*0+CZ*Math.sin(t)*Math.cos(f)*r,BY*Math.cos(t)*r,CZ*Math.sin(t)*Math.sin(f)*r];
  for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(let j=J0;j<NP;j++){const f0=j/NP*6.2832,f1=(j+1)/NP*6.2832;
      const a=S(t0,f0,1),b=S(t1,f0,1),c=S(t1,f1,1),d=S(t0,f1,1);
      const cote=Math.abs(Math.sin(f0*5))<.35;
      const filet=H.hs(i*1.7,j*2.9,4)>.42;
      const h=H.hs(i*2.3,j*1.9,1);
      const k=cote?(h>.5?'me3':'me2'):(filet?(h>.4?'meN':'me1'):(h>.7?'me1':'me2'));
      K.tri(k,a,b,c);K.tri(k,a,c,d);}}
  const RG=[[0,.55,'mef'],[.55,.82,'meF'],[.82,.9,'meG'],[.9,1,'meE']];
  for(const f of [J0/NP*6.2832,6.2832])for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(const q of RG){const a=S(t0,f,q[0]),b=S(t1,f,q[0]),c=S(t1,f,q[1]),d=S(t0,f,q[1]);K.tri(q[2],a,b,c);K.tri(q[2],a,c,d);}}
  // pépins : petites larmes crème au cœur de la chair
  const seed=(c,u,v,n)=>{const q=(a,b,h)=>[c[0]+u[0]*a+v[0]*b+n[0]*h,c[1]+u[1]*a+v[1]*b+n[1]*h,c[2]+u[2]*a+v[2]*b+n[2]*h];
    const A=q(-.03,0,.004),B=q(0,-.05,.004),C=q(.03,0,.004),E=q(0,.07,.004),Hh=q(0,0,.025);
    K.tri('meN',A,B,Hh);K.tri('meN',B,C,Hh);K.tri('meN',C,E,Hh);K.tri('meN',E,A,Hh);};
  const fA=J0/NP*6.2832;
  // la coupe « fA » est dans un plan tourné : on sème en reprenant S
  for(let i=0;i<10;i++){const t=.5+H.hs(i,3,3)*2.1,r=.25+H.hs(i,4,5)*.35;
    const p=S(t,6.2832,r);seed(p,[1,0,0],[0,1,0],[0,0,1]);
    const q=S(t,fA,r);const ca=Math.cos(fA),sa=Math.sin(fA);seed(q,[ -sa,0,ca],[0,1,0],[ca,0,sa]);}
  // tige tordue + feuille
  K.put('me4',new T.CylinderGeometry(.045,.07,.2,5),0,.8,0,0,0,.2);
  H.LF('meL','mel',.6,.2,.25,.12,.04,.86,0,.5,.4,.4,6);
};
const FRN_LITCHI=function(K){const H=frH(K),T=H.T;
  // l'écorce bosselée, un quartier ôté : la chair nacrée et le noyau brun
  const NT=16,NP=30,J0=7,R0=.68;
  const rv=(t,f)=>{const d=[Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)];
    return R0*(1+.15*H.hs(Math.round(d[0]*7),Math.round(d[1]*7),Math.round(d[2]*7)));};
  const S=(t,f,r)=>{const q=rv(t,f);return [q*Math.sin(t)*Math.cos(f)*r,q*Math.cos(t)*r*1.04,q*Math.sin(t)*Math.sin(f)*r];};
  for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(let j=J0;j<NP;j++){const f0=j/NP*6.2832,f1=(j+1)/NP*6.2832,a=S(t0,f0,1),b=S(t1,f0,1),c=S(t1,f1,1),d=S(t0,f1,1);
      const h=H.hs(Math.round(a[0]*9),Math.round(a[1]*9),Math.round(a[2]*9));
      const k=i<1?'jlN':(h>.8?'jlP':h<.22?'jl3':h>.5?'jl2':'jl1');K.tri(k,a,b,c);K.tri(k,a,c,d);}}
  // faces de coupe (plan de coupe plat, rayon moyen) : peau, chair nacrée
  const SS=(t,f,r)=>[R0*Math.sin(t)*Math.cos(f)*r,R0*Math.cos(t)*r*1.04,R0*Math.sin(t)*Math.sin(f)*r];
  for(const f of [J0/NP*6.2832,6.2832])for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(const q of [[0,.86,'jlC'],[.86,.93,'jlc'],[.93,1,'jl3']]){const a=SS(t0,f,q[0]),b=SS(t1,f,q[0]),c=SS(t1,f,q[1]),d=SS(t0,f,q[1]);K.tri(q[2],a,b,c);K.tri(q[2],a,c,d);}}
  // le noyau brun luisant, dans le creux du quartier
  K.put('jlT',new T.IcosahedronGeometry(1,1),0,0,0,0,0,0,.26,.36,.26);
  K.put('jlT',new T.CylinderGeometry(.03,.045,.26,5),.03,.82,0,0,0,-.25);
  H.LF('jlL','jll',.62,.2,.22,.12,.06,.84,0,.6,.9,.45,6);
  H.LF('jlL','jll',.46,.16,.22,.1,.04,.84,0,-.5,3.6,.5,5);
};
const FRN_PIMENT=function(K){const H=frH(K),T=H.T;
  const NU=24,NK=9,sm=x=>x*x*(3-2*x);
  const TO=(k,a,b,c,n)=>{const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];if(nx*n[0]+ny*n[1]+nz*n[2]<0)K.tri(k,a,c,b);else K.tri(k,a,b,c);};
  
  const pos=u=>{const a=-1.05+u*2.9,R=1.15-.5*u;return [.8*R*Math.sin(a),.8*(-R*Math.cos(a)+.55),a];};
  const rad=u=>.8*(u<.1?(.15+.25*sm(u/.1)):.40*Math.pow(1-u,.62)*(1+.30*Math.sin(Math.min(u*4,1)*1.5708))*(1+.05*Math.sin(u*34)));
  const sec=[];for(let i=0;i<=NU;i++){const u=i/NU,p=pos(u),r=rad(u),a=p[2],nX=Math.sin(a),nY=-Math.cos(a),pts=[];
    for(let k=0;k<NK;k++){const q=k/NK*6.2832,c=Math.cos(q)*r,s=Math.sin(q)*r*.92;pts.push([p[0]+nX*c,p[1]+nY*c,s]);}
    sec.push({u,pts,c:[p[0],p[1],0]});}
  for(let i=0;i<NU;i++){const S0=sec[i],S1=sec[i+1],um=(S0.u+S1.u)/2;
    for(let k=0;k<NK;k++){const k2=(k+1)%NK,a=S0.pts[k],b=S0.pts[k2],c=S1.pts[k2],d=S1.pts[k];
      const q=(k+.5)/NK*6.2832,L=Math.cos(q)*.55+.35*Math.sin(q+.8),h=H.hs(i,k,3);
      let key=L>.72?'pi4':L>.2?(h>.55?'pi2':'pi1'):'pi3';
      if(um>.72&&L>0.1)key=um>.88?'piY':'piO';
      if(um<.1)key=(k%2)?'piG':'pig';K.tri(key,a,b,c);K.tri(key,a,c,d);}}
  const E=sec[NU];for(let k=0;k<NK;k++)K.tri('piY',E.pts[k],E.pts[(k+1)%NK],[E.c[0]+.05,E.c[1]+.1,0]);
  // la queue : un arc effilé qui se recourbe, deux feuilles
  const p0=sec[0].c,T0=[-Math.cos(pos(0)[2]),-Math.sin(pos(0)[2])];
  const tige=(x0,y0,x1,y1,r0,r1)=>{const L=Math.hypot(x1-x0,y1-y0);K.put('piT',new T.CylinderGeometry(r1,r0,L,6),(x0+x1)/2,(y0+y1)/2,0,0,0,-Math.atan2(x1-x0,y1-y0));};
  const s1=[p0[0]+T0[0]*.18,p0[1]+T0[1]*.18],s2=[s1[0]-.02+T0[0]*.14,s1[1]+T0[1]*.14],s3=[s2[0]+.12,s2[1]+.10];
  tige(p0[0],p0[1],s1[0],s1[1],.07,.055);tige(s1[0],s1[1],s2[0],s2[1],.055,.045);tige(s2[0],s2[1],s3[0],s3[1],.045,.035);
  H.LF('piL','pil',.62,.2,.25,.12,s2[0],s2[1],0,.4,.5,.7,6);
  H.LF('piL','pil',.46,.15,.25,.1,s1[0]-.02,s1[1],0,-.5,2.7,.8,5);
};
const FRN_CITRON=function(K){const H=frH(K),T=H.T;
  // citron tranché : écorce, cloison blanche, dix quartiers BOMBÉS en gouttelettes de jus, pépins
  const XC=.52,AX=.9,RAD=.64,TH=Math.acos(XC/AX),NT=14,NF=30;
  const rot=(p)=>{let [x,y,z]=p;const a=.9,c=Math.cos(a),s=Math.sin(a);let x1=x*c-z*s,z1=x*s+z*c;const b=.28,cb=Math.cos(b),sb=Math.sin(b);return [x1*cb-y*sb,x1*sb+y*cb,z1];};
  const prof=t=>{const nip=Math.pow(Math.max(0,(t-2.55)/(Math.PI-2.55)),2)*.14;return [AX*Math.cos(t)-nip,RAD*Math.sin(t)*(1-.25*Math.pow(Math.max(0,(t-2.45)/(Math.PI-2.45)),2))];};
  for(let i=0;i<NT;i++){const t0=TH+(Math.PI-TH)*i/NT,t1=TH+(Math.PI-TH)*(i+1)/NT;
    for(let j=0;j<NF;j++){const f0=j/NF*6.2832,f1=(j+1)/NF*6.2832,P0=prof(t0),P1=prof(t1);
      const a=rot([P0[0],P0[1]*Math.cos(f0),P0[1]*Math.sin(f0)]),b=rot([P1[0],P1[1]*Math.cos(f0),P1[1]*Math.sin(f0)]),c=rot([P1[0],P1[1]*Math.cos(f1),P1[1]*Math.sin(f1)]),d=rot([P0[0],P0[1]*Math.cos(f1),P0[1]*Math.sin(f1)]);
      const x=(a[0]+c[0])/2,y=(a[1]+c[1])/2,z=(a[2]+c[2])/2,h=H.hs(x*6,y*6,z*6),L=.6*y+.4*z+(h-.5)*.3;
      const k=(t0>2.9)?'ci3':L>.35?'ci2':L>-.1?'ci1':'ci3';K.tri(k,a,b,c);K.tri(k,a,c,d);}}
  const R0=prof(TH)[1],P=(f,r,h)=>rot([XC+h,R0*r*Math.cos(f),R0*r*Math.sin(f)]);
  const NC=rot([1,0,0]);
  const TO=(k,a,b,c,n)=>{const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];if(nx*n[0]+ny*n[1]+nz*n[2]<0)K.tri(k,a,c,b);else K.tri(k,a,b,c);};
  const tr=(k,a,b,c)=>TO(k,a,b,c,NC);
  // anneaux plats : écorce jaune, cloison blanche
  const ring=(r0,r1,k)=>{for(let j=0;j<NF;j++){const f0=j/NF*6.2832,f1=(j+1)/NF*6.2832;tr(k,P(f0,r0,0),P(f1,r0,0),P(f1,r1,0));tr(k,P(f0,r0,0),P(f1,r1,0),P(f0,r1,0));}};
  ring(.9,1,'ci1');ring(.84,.9,'ciW');
  // dix quartiers : chacun une pyramide basse, une moitié claire, une moitié plus mûre, cloisons blanches entre eux
  const NS=10,GAP=.06;
  for(let s=0;s<NS;s++){const a0=s/NS*6.2832+GAP,a1=(s+1)/NS*6.2832-GAP,am=(a0+a1)/2;
    const q0=P(a0,.14,.012),q1=P(a1,.14,.012),r0=P(a0,.80,.012),r1=P(a1,.80,.012),rm=P(am,.82,.02),qm=P(am,.14,.02);
    const ma=P(a0*.7+am*.3,.5,.03),mb=P(a1*.7+am*.3,.5,.03),mm=P(am,.5,.045);
    tr('ciG',q0,r0,ma);tr('ciG',ma,r0,rm);tr('ciF',q0,ma,qm);tr('ciF',qm,ma,mm);            // moitié ambrée
    tr('ciD',q1,mb,r1);tr('ciD',mb,rm,r1);tr('ciH',qm,mm,mb);tr('ciH',qm,mb,q1);tr('ciH',mm,rm,mb);tr('ciH',mm,ma,rm);   // moitié claire et son reflet
    // cloison blanche entre deux quartiers
    const w0=P(a1,.12,.0),w1=P(a1+GAP*2,.12,.0),w2=P(a1+GAP*2,.84,.0),w3=P(a1,.84,.0);tr('ciW',w0,w1,w2);tr('ciW',w0,w2,w3);}
  for(let i=0;i<4;i++){const a=i/4*6.2832+.9,p=P(a,.45,.1);K.put('ciK',new T.OctahedronGeometry(1,0),p[0],p[1],p[2],0,0,a,.04,.022,.016);}
  const tp=rot([-AX-.02,0,0]);K.put('ciT',new T.CylinderGeometry(.03,.05,.14,5),tp[0]-.04,tp[1]+.02,tp[2],0,0,1.2);
  H.LF('ciL','cil',.6,.2,.25,.1,tp[0]-.03,tp[1]+.06,tp[2],.5,2.8,.5,6);
};
const FRN_DRAGON=function(K){const H=frH(K),T=H.T;
  // fruit du dragon : silhouette en oeuf allongé, ventru en bas, à écailles en spirale qui s'enroulent ; coupe en cibles + pépins en spirale d'or
  const NT=16,NP=28,J0=6,CZ=.62,BY=.86;
  const sh=t=>1-.14*Math.cos(t)-.05*Math.cos(2*t);       // plus large vers le bas, bout haut resserré
  const S=(t,f,r)=>{const q=sh(t)*CZ*Math.sin(t);return [q*Math.cos(f)*r,BY*Math.cos(t)*r,q*Math.sin(f)*r];};
  for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(let j=J0;j<NP;j++){const f0=j/NP*6.2832,f1=(j+1)/NP*6.2832,a=S(t0,f0,1),b=S(t1,f0,1),c=S(t1,f1,1),d=S(t0,f1,1);
      const m=H.hs(i*3.1,j*1.7,2),k=m>.7?'jp2':m<.25?'jp3':'jp1';K.tri(k,a,b,c);K.tri(k,a,c,d);}}
  const RG=[[0,.16,'jpW'],[.16,.32,'jpM'],[.32,.48,'jpW'],[.48,.64,'jpM'],[.64,.80,'jpW'],[.80,.88,'jpM'],[.88,1,'jp3']];
  for(const f of [1.5708,6.2832])for(let i=0;i<NT;i++){const t0=i/NT*Math.PI,t1=(i+1)/NT*Math.PI;
    for(const q of RG){const a=S(t0,f,q[0]),b=S(t1,f,q[0]),c=S(t1,f,q[1]),d=S(t0,f,q[1]);K.tri(q[2],a,b,c);K.tri(q[2],a,c,d);}}
  const seed=(c,u,v,n)=>{const q=(a,b,h)=>[c[0]+u[0]*a+v[0]*b+n[0]*h,c[1]+u[1]*a+v[1]*b+n[1]*h,c[2]+u[2]*a+v[2]*b+n[2]*h];
    const A=q(-.034,0,.004),B=q(0,-.034,.004),C=q(.034,0,.004),E=q(0,.034,.004),Hh=q(0,0,.022);
    K.tri('jpK',A,B,Hh);K.tri('jpK',B,C,Hh);K.tri('jpK',C,E,Hh);K.tri('jpK',E,A,Hh);};
  for(let i=0;i<64;i++){const th=i*2.39996,rho=.075*Math.sqrt(i+1)*.98;if(rho>.78)continue;
    seed([0,BY*rho*Math.sin(th),CZ*rho*Math.cos(th)],[0,0,1],[0,1,0],[1,0,0]);}
  for(let i=0;i<36;i++){const th=i*2.39996,rho=.1*Math.sqrt(i+1);if(rho>.76)continue;seed([CZ*rho*Math.cos(th),BY*rho*Math.sin(th),0],[1,0,0],[0,1,0],[0,0,1]);}
  // écailles : 6 rangées en spirale, grosses en bas, qui rapetissent vers le haut ; pointes qui se recourbent, base rose, bout jaune-vert
  for(let j=0;j<6;j++){const yy=-.68+j*.27,tt=Math.acos(Math.max(-1,Math.min(1,yy/BY))),rr=CZ*sh(tt)*Math.sin(tt)*.97,n=j<2?8:7,sc=1-.09*j;
    for(let i=0;i<n;i++){const a=i/n*6.2832+j*.42;if(a%6.2832>1.5708-.15&&a%6.2832<1.5708+.15)continue;if(a%6.2832<1.75&&a%6.2832>-.2&&j>1)continue;
      H.LF('jp1','jpY',.62*sc,.2*sc,.38,-.16,Math.cos(a)*rr,yy,Math.sin(a)*rr,0,-a,.7+.08*j,5);}}
  for(let i=0;i<6;i++){const a=i/6*6.2832+.3;H.LF('jpS','jpY',.4,.12,.3,-.05,0,.8,0,0,-a,1.15,4);}
};
const FRN_RAISIN=function(K){const H=frH(K),T=H.T;
  // la grappe : couronnes de baies qui se resserrent vers le bas
  let n=0;const baie=(x,y,z,r)=>{n++;const kk=H.hs(n,1,2);K.put(kk>.8?'rg2':kk>.6?'rg5':kk>.4?'rg1':kk>.2?'rg4':'rg6',new T.IcosahedronGeometry(1,1),x,y,z,0,0,0,r,r*1.05,r);
    K.put('rgH',new T.OctahedronGeometry(1,0),x-r*.35,y+r*.45,z+r*.55,0,0,0,r*.18,r*.12,r*.1);};
  const rows=[[6,.40,.30],[5,.30,.05],[4,.22,-.20],[3,.14,-.42],[1,0,-.62]];
  for(const [c,rr,y] of rows)for(let i=0;i<c;i++){const a=i/c*6.2832+y*3;baie(Math.cos(a)*rr,y,Math.sin(a)*rr,.19);}
  baie(0,.18,0,.22);
  K.put('rgT',new T.CylinderGeometry(.035,.05,.34,5),.02,.62,0,0,0,.15);
  H.LF('rgL','rgl',.5,.18,.2,.1,.05,.62,0,.5,.6,.3,5);
  // les ailes d'ange : de vraies PLUMES (lame à bout arrondi, nervure centrale), trois rangs superposés — petites couvertures, secondaires, grandes primaires —
  // éventail vers le haut et l'extérieur, les plus longues au milieu de l'éventail ; une pointe d'or aux primaires
  const plume=(k1,k2,kT,sg,bx,by,bz,ang,L,W,cur)=>{
    const dx=sg*Math.cos(ang),dy=Math.sin(ang),px=-dy,py=dx*sg*sg;           // direction dans le plan de l'aile, et sa perpendiculaire
    const NS=7,pts=[],CUP=.42,FOLD=.5;
    for(let i=0;i<=NS;i++){const u=i/NS,l=L*u,cx=bx+dx*l+px*cur*l*u,cy=by+dy*l+py*cur*l*u,cz=bz+CUP*l*l*.5,
        hw=W*Math.pow(Math.sin(Math.PI*Math.pow(u,.72)),.62)+.004;
      pts.push({m:[cx,cy,cz+FOLD*hw*.6],l:[cx-px*hw,cy-py*hw,cz-FOLD*hw*.4],r:[cx+px*hw,cy+py*hw,cz-FOLD*hw*.4]});}   // nervure en relief, deux demi-lames qui retombent
    for(let i=0;i<NS;i++){const A=pts[i],B=pts[i+1],kk=(i>=NS-2&&kT)?kT:null;
      K.tri(kk||k1,A.m,A.l,B.l);K.tri(kk||k1,A.m,B.l,B.m);K.tri(kk||k2,A.m,B.m,B.r);K.tri(kk||k2,A.m,B.r,A.r);}};
  const aile=(sg)=>{
    const bx=sg*.30,by=.36;
    // couvertures (courtes, rondes) devant
    for(let i=0;i<6;i++){const a=.45+i*.2;plume('wgW','wgw',null,sg,bx,by,.02,a,.26+.03*Math.sin(i*1.3),.10,.10);}
    // secondaires
    for(let i=0;i<6;i++){const a=.35+i*.21;plume('wgW','wgw',null,sg,bx,by+.02,-.02,a,.42+.07*Math.sin(i*.9+.4),.11,.14);}
    // grandes primaires derrière, bout doré
    for(let i=0;i<6;i++){const a=.25+i*.22;plume('wgW','wgw','wgG',sg,bx,by+.04,-.06,a,.62+.12*Math.sin(i*.8+.3),.12,.16);}
  };
  aile(1);aile(-1);
};
const FRN_POMMEDOREE=function(K){frPomme(K,['go1','go2','go3','goH','goT','goL','gol']);};

for(const k in FRUIT_PAL_N)FRUIT_PAL[k]={g:'f',c:FRUIT_PAL_N[k]};
const FRUIT_EXO=FRUIT_DEFS.splice(0,FRUIT_DEFS.length); // les 13 d'avant : hors du jeu, au cahier des charges
const FRN_ANC=n=>FRUIT_EXO.find(f=>f.n===n);
FRUIT_DEFS.push(
  Object.assign({},FRN_ANC('MYRTILLE'),{boost:.6,freq:10}),
  {n:'CERISE',boost:.6,freq:10,jus:0xd01030,lp:FRN_CERISE},
  {n:'KIWI',boost:.6,freq:10,jus:0x7cc020,lp:FRN_KIWI},
  Object.assign({},FRN_ANC('PÊCHE PLATE'),{n:'PÊCHE',boost:.6,freq:10}),
  Object.assign({},FRN_ANC('ORANGE'),{boost:.6,freq:10}),
  {n:'MANGUE',boost:.6,freq:10,jus:0xf4b030,lp:FRN_MANGUE},
  {n:'POMME',boost:.6,freq:10,jus:0xe02a2a,lp:FRN_POMME},
  {n:'MELON',boost:.6,freq:10,jus:0xf0a050,lp:FRN_MELON},
  {n:'LITCHI',boost:.6,freq:10,jus:0xf6e6ee,lp:FRN_LITCHI}
);
/* LES FORMES DES FRUITS-POUVOIRS : une géométrie par pouvoir, coulée à la 1re demande (comme fruitGeo) et partagée */
const FRUIT_POW={n:{n:'PIMENT',lp:FRN_PIMENT,jus:0xff3a10},v:{n:'CITRON',lp:FRN_CITRON,jus:0xfff060},x:{n:'FRUIT DU DRAGON',lp:FRN_DRAGON,jus:0xe0157a},
  a:{n:'RAISIN',lp:FRN_RAISIN,jus:0xb050d0},m:{n:'POMME DORÉE',lp:FRN_POMMEDOREE,jus:0xffd24a}};
const FRUIT_POW_GEO={};
function fruitPowGeo(k){
  if(!FRUIT_POW_GEO[k]){const K=lpKit(FRUIT_PAL);FRUIT_POW[k].lp(K);FRUIT_POW_GEO[k]=K.done().f;}
  if(!FRUIT_MAT){FRUIT_MAT=lpMat('f');FRUIT_MAT.userData.lp=0;}
  return FRUIT_POW_GEO[k];
}

const PADS_OFF=!/[?&]pads=1/.test(location.search); // plus de plaques turbo (?pads=1 les rend, pour comparer)
const PWR_LIGNE=!/[?&]cristaux=1/.test(location.search); // les fruits-pouvoirs tombent au bout de la file de fruits (?cristaux=1 : les anciens cristaux au hasard)
const PWR_EGAUX=true; // les cinq pouvoirs à la même fréquence

