/* (2026-11-13, LE CANYON V3 + la charte des routes) LE BANC RAPIDE DE LA CHARTE : les règles du juge commun qui ne demandent aucun vol, sur le VRAI genCanyon (graines brutes,
   comme dbgGenRoute) — 40 graines × 3 paliers en une minute, pour itérer :
   · R1/R2 : la plus longue tenue dans un cône de 30° / 8° autour de la direction d'entrée (et le cap en plan à moins de 30° / 8°), en secondes à la vitesse RÉELLE
     (la croisière × l'élan : 1,8 au palier 0 → 1 au palier 25) — la définition de juge-page.js, au point près ;
   · R3 : le roulis lissé sur 0,5 s, deux mesures : JUGE (la normale qui tourne autour de la tangente : compte aussi la torsion d'une descente qui tourne) et HORIZON (l'angle de la
     normale avec la verticale projetée : ce que voit le joueur) ;
   · R4/R5 : les modules nommés (MODMARK.nom), le plus grand trou entre deux, les répétitions, le Jaccard de deux graines voisines (hors raccourcis `rac`).
   Les vols (R6, R7) restent au juge complet (canyon-juge.cjs ou juge.cjs).
   node outils/banc-routes/canyon-charte.cjs [graines=1-40] [paliers=0,10,20] [--detail] */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('./charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-40').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),DET=process.argv.includes('--detail');
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
vm.runInContext('var CY={},THICK=5.2;',ctx);
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-murs.js'),'utf8'),ctx,{filename:'canyon-murs.js'});
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-v3.js'),'utf8'),ctx,{filename:'canyon-v3.js'});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext(`function __charte(graine){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7,sansFin:1};MODMARK.length=0;
  const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();const C=r.value;
  return {C:C.map(p=>[p.x,p.y,p.z]),N:CY.murN?CY.murN.map(v=>[v.x,v.y,v.z]):null,marks:MODMARK.map(m=>({nom:m.nom,i0:m.i0,i1:m.i1,rac:m.rac?1:0,climax:m.climax?1:0})),
    pieces:CY.hz&&CY.hz.p?CY.hz.p.map(p=>p[0]):[],dix:CY.hz&&CY.hz.dix||null,gab:(CY.gab||[]).map(g=>[g.t,g.i0,g.i1])};}`,ctx);
const R2D=180/Math.PI;
function mesure(o,vw,pal){const ELAN=1.8-.8*Math.min(1,Math.max(0,pal/25)),vP=vw*ELAN,P=o.C,N0=o.N,n0=P.length;
  const S0=new Float64Array(n0);for(let i=1;i<n0;i++)S0[i]=S0[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]);
  const L=S0[n0-1],PAS=2,nR=Math.max(3,Math.floor(L/PAS)+1),Q=new Float64Array(nR*3),NN=new Float64Array(nR*3),T=new Float64Array(nR*3),S=new Float64Array(nR);let k=0;
  for(let r=0;r<nR;r++){const s=Math.min(L,r*PAS);while(k<n0-2&&S0[k+1]<s)k++;const t=Math.max(0,Math.min(1,(s-S0[k])/((S0[k+1]-S0[k])||1)));
    for(let c=0;c<3;c++){Q[r*3+c]=P[k][c]+(P[k+1][c]-P[k][c])*t;NN[r*3+c]=N0?N0[k][c]+(N0[k+1][c]-N0[k][c])*t:(c===1?1:0);}S[r]=s;}
  for(let r=0;r<nR;r++){const a=Math.max(0,r-1),b=Math.min(nR-1,r+1);let x=Q[b*3]-Q[a*3],y=Q[b*3+1]-Q[a*3+1],z=Q[b*3+2]-Q[a*3+2];const l=Math.hypot(x,y,z)||1;T[r*3]=x/l;T[r*3+1]=y/l;T[r*3+2]=z/l;
    let nx=NN[r*3],ny=NN[r*3+1],nz=NN[r*3+2];const d=nx*T[r*3]+ny*T[r*3+1]+nz*T[r*3+2];nx-=d*T[r*3];ny-=d*T[r*3+1];nz-=d*T[r*3+2];const ln=Math.hypot(nx,ny,nz)||1;NN[r*3]=nx/ln;NN[r*3+1]=ny/ln;NN[r*3+2]=nz/ln;}
  const dotT=(i,j)=>T[i*3]*T[j*3]+T[i*3+1]*T[j*3+1]+T[i*3+2]*T[j*3+2],cap=new Float64Array(nR),hz9=new Float64Array(nR);
  for(let i=0;i<nR;i++){cap[i]=Math.atan2(T[i*3],T[i*3+2]);hz9[i]=Math.hypot(T[i*3],T[i*3+2]);}
  const ecartCap=(i,j)=>{if(hz9[i]<.35||hz9[j]<.35)return 0;let d=cap[j]-cap[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return Math.abs(d);};
  const tenue=deg=>{const c=Math.cos(deg/R2D),a=deg/R2D;let best=0,at=0;for(let i=0;i<nR-1;i++){let j=i+1;while(j<nR&&dotT(i,j)>=c&&ecartCap(i,j)<=a)j++;const d=S[j-1]-S[i];if(d>best){best=d;at=S[i];}if(j>=nR)break;}return {s:+(best/vP).toFixed(2),at:Math.round(at)};};
  const t30=tenue(30),t8=tenue(8);
  const incJ=new Float64Array(nR),ph=new Float64Array(nR),incH=new Float64Array(nR);
  for(let i=0;i<nR-1;i++){const tx=T[i*3],ty=T[i*3+1],tz=T[i*3+2];let mx=NN[i*3+3],my=NN[i*3+4],mz=NN[i*3+5];const d=mx*tx+my*ty+mz*tz;mx-=d*tx;my-=d*ty;mz-=d*tz;
    const ax=NN[i*3],ay=NN[i*3+1],az=NN[i*3+2],cx=ay*mz-az*my,cy=az*mx-ax*mz,cz=ax*my-ay*mx;incJ[i]=Math.atan2(cx*tx+cy*ty+cz*tz,ax*mx+ay*my+az*mz);}
  for(let i=0;i<nR;i++){const tx=T[i*3],ty=T[i*3+1],tz=T[i*3+2];let ux=-ty*tx,uy=1-ty*ty,uz=-ty*tz;const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;
    const nx=NN[i*3],ny=NN[i*3+1],nz=NN[i*3+2],cx=uy*nz-uz*ny,cy=uz*nx-ux*nz,cz=ux*ny-uy*nx;ph[i]=Math.atan2(cx*tx+cy*ty+cz*tz,ux*nx+uy*ny+uz*nz);}
  for(let i=0;i<nR-1;i++){let d=ph[i+1]-ph[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;incH[i]=d;}
  const taux=A=>{const w=Math.max(1,Math.round(.5*vP/PAS)),out=[];let acc=0,m=0,mAt=0;for(let i=0;i<nR-1;i++){acc+=A[i];if(i>=w)acc-=A[i-w];if(i>=w-1){const v=Math.abs(acc)/(w*PAS)*vP*R2D;out.push(v);if(v>m){m=v;mAt=S[i];}}}
    out.sort((a,b)=>a-b);return {max:Math.round(m),at:Math.round(mAt),p95:Math.round(out[Math.min(out.length-1,Math.floor(.95*out.length))]||0)};};
  const rJ=taux(incJ),rH=taux(incH);
  /* R13 (la charte, Sacha : « la route est tout le temps plate ») : l'envers (normale sous l'horizontale), couchée à plus de 45° / 60°, à plat (moins de 15°), la plus longue tenue à plat ; la part de gorge large (gabarits larges) */
  let nEnv=0,n45=0,n60=0,nPl=0,run=0,runMax=0,runAt=0;for(let i=0;i<nR;i++){const up=NN[i*3+1];if(up<0)nEnv++;if(up<.7071)n45++;if(up<.5)n60++;if(Math.abs(ph[i])<.2618){nPl++;run+=PAS;if(run>runMax){runMax=run;runAt=S[i]-run;}}else run=0;} /* à plat : le dévers VU (l'horizon) sous 15°, quelle que soit la pente */
  const LRG9=/^(large|ouvert|vallee|corniche|boucle|pont|tonneau)$/;let lg=0;{const iv=(o.gab||[]).filter(g=>LRG9.test(g[0])).map(g=>[S0[Math.max(0,Math.min(n0-1,g[1]))],S0[Math.max(0,Math.min(n0-1,g[2]))]]).sort((a,b)=>a[0]-b[0]);let c0=-1,c1=-1;for(const v of iv){if(v[0]>c1){if(c1>c0)lg+=c1-c0;c0=v[0];c1=v[1];}else c1=Math.max(c1,v[1]);}if(c1>c0)lg+=c1-c0;}
  const r13={env:+(nEnv/nR*100).toFixed(1),h45:+(n45/nR*100).toFixed(1),h60:+(n60/nR*100).toFixed(1),plat:+(nPl/nR*100).toFixed(1),platMax:+(runMax/vP).toFixed(1),platAt:Math.round(runAt),large:+(lg/L*100).toFixed(1)};
  const Sp=new Float64Array(n0);for(let i=1;i<n0;i++)Sp[i]=S0[i];
  const mods=o.marks.map(m=>({nom:m.nom,s0:Sp[Math.max(0,Math.min(n0-1,m.i0))],s1:Sp[Math.max(0,Math.min(n0-1,m.i1))],rac:m.rac,climax:m.climax})).sort((a,b)=>a.s0-b.s0);
  const fen=[];for(const m of mods){const l=fen[fen.length-1];if(l&&m.s0<=l.s1+1)l.s1=Math.max(l.s1,m.s1);else fen.push({s0:m.s0,s1:m.s1});}
  let gap=0,gapAt=0;{let prev=0;for(const f of fen){const g=(f.s0-prev)/vP;if(g>gap){gap=g;gapAt=prev;}prev=Math.max(prev,f.s1);}const g=(L-prev)/vP;if(g>gap){gap=g;gapAt=prev;}}
  const noms=mods.map(m=>m.nom).filter(x=>x!=null).map(String);let rep=0;for(let i=1;i<noms.length;i++)if(noms[i]===noms[i-1])rep++;
  const cpt={};for(const x of noms)cpt[x]=(cpt[x]||0)+1;
  const ou=s=>{const m=mods.find(m=>!m.rac&&s>=m.s0&&s<=m.s1);return m?m.nom:'liaison';};
  return {dur:+(L/vP).toFixed(1),L:Math.round(L),t30:t30.s,t30At:t30.at,t30Ou:ou(t30.at),t8:t8.s,t8At:t8.at,t8Ou:ou(t8.at),rJ:rJ,rH:rH,rOu:ou(rJ.at),gap:+gap.toFixed(1),gapAt:Math.round(gapAt),gapOu:ou(gapAt+1)+' → '+ou(gapAt+gap*vP+1),nMods:mods.length,noms:noms,nomsVar:mods.filter(m=>!m.rac).map(m=>String(m.nom)),
    r13:r13,rep:rep,maxMeme:noms.length?Math.max(...Object.values(cpt)):0,climax:mods.some(m=>m.climax),racMarques:mods.filter(m=>m.rac).length,pieces:o.pieces.join(' ')};}
const res={};
for(const pal of PAL){const vw=B.VW[pal]||78;res[pal]=[];
  for(let g=g0;g<=g1;g++){ctx.__setPalier(pal,vw);let m;try{const o9=ctx.__charte(g);if(process.argv.includes("--sans-devers"))o9.N=null;m=mesure(o9,vw,pal);}catch(e){console.log('p'+pal+' g'+g+' ERREUR '+e.stack.split('\n').slice(0,3).join(' | '));continue;}m.g=g;res[pal].push(m);
    if(DET||m.t30>9||m.rH.max>55||m.rH.p95>45)console.log('p'+pal+' g'+g+' '+m.dur+'s cap30 '+m.t30+'s@'+m.t30At+'('+m.t30Ou+') droit8 '+m.t8+' roulis juge '+m.rJ.max+'/p95 '+m.rJ.p95+' · horizon '+m.rH.max+'@'+m.rH.at+'('+m.rOu+')/p95 '+m.rH.p95+' · trou '+m.gap+'s · mods '+m.nMods+(DET?' · '+m.pieces:''));}}
for(const pal of PAL){const rs=res[pal];if(!rs.length)continue;const mx=f=>Math.max(...rs.map(f)),mn=f=>Math.min(...rs.map(f)),moy=f=>+(rs.reduce((a,r)=>a+f(r),0)/rs.length).toFixed(2);
  let jac=0,jAt='';const tous=new Set();for(let i=0;i<rs.length;i++){for(const x of rs[i].noms)tous.add(x);if(i){const A=new Set(rs[i-1].nomsVar),Bs=new Set(rs[i].nomsVar);let n=0;for(const x of A)if(Bs.has(x))n++;const u=new Set([...A,...Bs]).size,j=u?n/u:0;if(j>jac){jac=j;jAt=rs[i-1].g+'-'+rs[i].g;}}}
  const n9=x=>rs.filter(x).length;
  /* (R5) le Jaccard MOYEN de deux routes prises au hasard (toutes les paires, pas seulement les voisines) et la fréquence de chaque module */
  let jS=0,jN=0,j5=0;for(let i=0;i<rs.length;i++)for(let k=i+1;k<rs.length;k++){const A=new Set(rs[i].nomsVar),Bs=new Set(rs[k].nomsVar);let n=0;for(const x of A)if(Bs.has(x))n++;const u=new Set([...A,...Bs]).size,j=u?n/u:0;jS+=j;jN++;if(j>.5)j5++;}
  if(process.argv.includes('--noms')){const f={};for(const r of rs)for(const x of new Set(r.nomsVar))f[x]=(f[x]||0)+1;console.log('   fréquences : '+Object.keys(f).sort((a,b)=>f[b]-f[a]).map(k=>k+' '+Math.round(f[k]/rs.length*100)+'%').join(' · '));}
  console.log('   R5 : Jaccard moyen de deux routes au hasard '+(jN?(jS/jN).toFixed(2):'-')+' · paires au-dessus de 0,5 : '+(jN?(j5/jN*100).toFixed(1):'-')+' %');
  console.log('p'+pal+' · '+rs.length+' routes · durée '+moy(r=>r.dur)+'s ('+mn(r=>r.dur)+'-'+mx(r=>r.dur)+') · R1 cap30 max '+mx(r=>r.t30)+' moy '+moy(r=>r.t30)+' (>10 s : '+n9(r=>r.t30>10)+', >7 : '+n9(r=>r.t30>7)+') · R2 droit8 max '+mx(r=>r.t8)+' moy '+moy(r=>r.t8)+
    ' · R3 juge max '+mx(r=>r.rJ.max)+' p95 '+mx(r=>r.rJ.p95)+' | horizon max '+mx(r=>r.rH.max)+' p95 '+mx(r=>r.rH.p95)+' · R4 trou '+mx(r=>r.gap)+'s mods≥'+mn(r=>r.nMods)+' · R5 rép '+mx(r=>r.rep)+' même '+mx(r=>r.maxMeme)+' jac '+jac.toFixed(2)+' ('+jAt+') noms '+tous.size+
    ' · climax '+n9(r=>r.climax)+'/'+rs.length+' · rac marqués ≥'+mn(r=>r.racMarques));
  console.log('   R13 : envers min '+mn(r=>r.r13.env)+' % (routes sans envers : '+n9(r=>r.r13.env<.5)+') moy '+moy(r=>r.r13.env)+' · >45° moy '+moy(r=>r.r13.h45)+' % · >60° moy '+moy(r=>r.r13.h60)+' % min '+mn(r=>r.r13.h60)+' · à plat moy '+moy(r=>r.r13.plat)+' % · plus long plat '+mx(r=>r.r13.platMax)+' s · gorge large moy '+moy(r=>r.r13.large)+' %');
  if(process.argv.includes('--pires')){const top=(k,f)=>rs.slice().sort((a,b)=>f(b)-f(a)).slice(0,4);
    console.log('   R1 : '+top('t30',r=>r.t30).map(r=>'g'+r.g+' '+r.t30+'s@'+r.t30At+'('+r.t30Ou+')').join(' · '));
    console.log('   PLAT : '+top('plat',r=>r.r13.platMax).map(r=>'g'+r.g+' '+r.r13.platMax+'s@'+r.r13.platAt).join(' · '));
    console.log('   R2 : '+top('t8',r=>r.t8).map(r=>'g'+r.g+' '+r.t8+'s@'+r.t8At+'('+r.t8Ou+')').join(' · '));
    console.log('   R4 : '+top('gap',r=>r.gap).map(r=>'g'+r.g+' '+r.gap+'s@'+r.gapAt+'('+r.gapOu+')').join(' · '));
    const J=[];for(let i=1;i<rs.length;i++){const A=new Set(rs[i-1].nomsVar),Bs=new Set(rs[i].nomsVar),com=[...A].filter(x=>Bs.has(x)),u=new Set([...A,...Bs]).size;J.push([com.length/u,rs[i-1].g+'-'+rs[i].g,com.join(','),[...A].join(',')+' | '+[...Bs].join(',')]);}
    J.sort((a,b)=>b[0]-a[0]);for(const j of J.slice(0,3))console.log('   R5 : '+j[1]+' jac '+j[0].toFixed(2)+' communs ['+j[2]+'] · '+j[3]);}}
