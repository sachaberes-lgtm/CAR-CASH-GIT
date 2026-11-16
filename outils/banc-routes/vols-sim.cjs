/* LE SAUT, PARTOUT (2026-11-13, LE PARCOURS CARTE POSTALE) : un saut nitro simulé tous les `pas` m de la route des nuages, et ce qu'il devient — posé (durée), trop long (« air »), à côté
   (« vide ») — puis ce qu'en dit la règle du jeu (nuaSautRefuse : les fenêtres `ss` des tableaux + le regard devant). Le danger, c'est un saut PERMIS qui finit mal.
   Le vol est celui du jeu, simplifié : l'élan de la route (sa tangente × v) + l'impulsion du saut le long de la normale (`vj`), la gravité du vol le long de −normale de la dalle la plus
   proche (LE VOL QUI SUIT LA ROUTE, 23 m/s² ; × `plane` quand la nitro est tenue : le réacteur en reprend 60 %), sans coup de volant en l'air (le pire cas : un joueur corrige).
   node vols-sim.cjs [palier=0] [graines=1-6] [vitesse=1.8] [vj=10] [plane=1] [pas=4] [volant=1] [detail=1]
   Pose = la caisse revient sur sa dalle à moins de ROAD_HALF de l'axe · long = plus de `long` s (2) · air = plus de 6 s · vide = repassée sous sa dalle, hors de la route. */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),V3=B.ctx.THREE.Vector3;
const pal=+(arg('palier')||0),G=(arg('graines')||'1-6').split('-').map(Number),kv=+(arg('vitesse')||1.8),VJ=+(arg('vj')||10),PL=+(arg('plane')||1),PAS=+(arg('pas')||4),LONG=+(arg('long')||2),DET=!!arg('detail'),VOLANT=arg('volant')!=='0',VERROU=+(arg('verrou')||0),TN=+(arg('tn')||2),EVN=+(arg('evn')||6),MORT=arg('mort')==='1'; /* tn, evn : la règle nitro tenue · mort=1 : seuls les vols MORTELS (air, vide) comptent comme mauvais */ /* volant=0 : sans coup de volant en l'air (le pilote du banc par défaut) */
const H=28,g0=23*PL,dt=1/60;
const parZone={};let nTot=0,nMauvais=0,nMauvaisPermis=0;
for(let g=G[0];g<=(G[1]||G[0]);g++){const r=B.piste('nuages',g,pal),C=r.ctrl,Nc=r.N,vw=r.vw,v=vw*kv;
  const cv=new B.ctx.THREE.CatmullRomCurve3(C,false,'centripetal');cv.arcLengthDivisions=C.length*16;const L=cv.getLength(),NP=Math.round(L)+1,ds=L/(NP-1);
  const P=cv.getSpacedPoints(NP-1),T=[],N=[],Bn=[];for(let i=0;i<NP;i++)T.push(cv.getTangentAt(Math.min(1,i/(NP-1))));
  const lg=cv.getLengths(),nC=C.length-1,sOfC=[];for(let j=0;j<=nC;j++){const f=j/nC*(lg.length-1),k=Math.min(lg.length-2,Math.floor(f));sOfC.push(lg[k]+(lg[k+1]-lg[k])*(f-k));}
  {let j=0;for(let i=0;i<NP;i++){const si=i*ds;while(j<nC-1&&sOfC[j+1]<si)j++;const u=(si-sOfC[j])/Math.max(1e-6,sOfC[j+1]-sOfC[j]);const n=new V3().copy(Nc[j]).lerp(Nc[j+1],Math.max(0,Math.min(1,u)));n.addScaledVector(T[i],-n.dot(T[i])).normalize();N.push(n);Bn.push(new V3().crossVectors(T[i],n));}}
  const ss=[];for(const m of r.marks)if(m.ss)for(const e of m.ss)ss.push([sOfC[Math.min(nC,e.j0!=null?e.j0:e[0])],sOfC[Math.min(nC,e.j1!=null?e.j1:e[1])]]);
  const ou=s=>{for(const m of r.marks)if(m.fig&&s>=sOfC[m.i0]&&s<=sOfC[Math.min(nC,m.i1)])return m.fig.replace('nu-','');return 'liaison';};
  const refuse=function(s){const b=s+v*(PL<1?TN:1.2);for(const e of ss)if(b>=e[0]&&s<=e[1])return true;const i0=Math.round(s/ds),i1=Math.min(NP-2,Math.round(b/ds));let d=0;for(let q=i0;q<i1;q++){const x=new V3().subVectors(T[q+1],T[q]).dot(N[q]);if(x<0)d-=x;}return v*d>(PL<1?EVN:8);}; /* la règle du jeu : nitro tenue (PL < 1), on regarde plus loin et le seuil baisse */
  const p=new V3(),w=new V3(),q=new V3(),u=new V3();
  for(let s=200;s<L-300;s+=PAS){const i0=Math.round(s/ds);p.copy(P[i0]).addScaledVector(N[i0],.6);w.copy(T[i0]).multiplyScalar(v).addScaledVector(N[i0],VJ);u.copy(N[i0]);
    let j=i0,t=0,fin='air',tPose=0,lat=0;
    while(t<6){t+=dt;
      /* la dalle la plus proche, en avançant (et un peu en arrière) */
      let jb=j,db=1e18;for(let k=Math.max(0,j-30);k<=Math.min(NP-1,j+400);k+=2){const d=P[k].distanceToSquared(p);if(d<db){db=d;jb=k;}}j=jb;
      const n=N[j],sg=n.dot(u)>=0?1:-1;u.copy(n).multiplyScalar(sg); /* la face d'où l'on vient (jamais de bascule de plus de 90°) */
      q.subVectors(p,P[j]);lat=q.dot(Bn[j]);
      if(VOLANT&&t>VERROU){ /* LE VOLANT EN L'AIR (lacetVol, vol-equilibre.js) : après le verrou (0 pour un saut VOULU — veqSaut : « le volant tenu continue de tourner » ; 0,35 s sinon), le joueur ramène sa trajectoire vers l'axe de la route, au plus 1,5 × (1,15 + min(0,9 ; 0,004 v)) rad/s */
        const om=1.5*(1.15+Math.min(.9,w.length()/.48*.004)),wn=w.dot(u),wh=new V3().copy(w).addScaledVector(u,-wn),lh=wh.length();
        if(lh>1){const d=new V3().copy(T[j]).addScaledVector(Bn[j],-Math.max(-.5,Math.min(.5,lat/60)));d.addScaledVector(u,-d.dot(u)).normalize();
          const a=Math.atan2(new V3().crossVectors(wh,d).dot(u),wh.dot(d)/lh),r=Math.max(-om*dt,Math.min(om*dt,a));wh.applyAxisAngle(u,r);w.copy(wh).addScaledVector(u,wn);}}
      w.addScaledVector(u,-g0*dt);p.addScaledVector(w,dt);
      q.subVectors(p,P[j]);const h=q.dot(u);lat=q.dot(Bn[j]);
      if(h<=0){if(Math.abs(lat)<=H){fin='pose';tPose=t;}else fin='vide';break;}}
    const s0=ou(s),z=parZone[s0]=parZone[s0]||{n:0,long:0,air:0,vide:0,permis:0,ex:[]};z.n++;nTot++;
    const mauvais=MORT?fin!=='pose':(fin!=='pose'||tPose>LONG);
    if(fin==='air')z.air++;else if(fin==='vide')z.vide++;else if(tPose>LONG)z.long++;
    if(mauvais){nMauvais++;if(!refuse(s)){z.permis++;nMauvaisPermis++;if(z.ex.length<4)z.ex.push('g'+g+'@'+Math.round(s)+':'+fin+(fin==='pose'?' '+tPose.toFixed(1)+'s':'')+' lat'+Math.round(lat));}}}}
console.log('palier',pal,'· vitesse ×'+kv,'· saut',VJ,'m/s','· gravité ×'+PL,'|',nTot,'sauts simulés,',nMauvais,'mauvais (long > '+LONG+' s, air ou vide),',nMauvaisPermis,'PERMIS par la règle');
for(const k of Object.keys(parZone).sort((a,b)=>parZone[b].n-parZone[a].n)){const z=parZone[k];if(DET||z.permis)console.log('  ',k.padEnd(14),'sauts',String(z.n).padStart(5),'| long',z.long,'air',z.air,'vide',z.vide,'| PERMIS',z.permis,z.ex.join(' '));}
