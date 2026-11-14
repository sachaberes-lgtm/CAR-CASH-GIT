/* ville-torsades.cjs (2026-11-14, MAPS PRO — la ville ; Sacha : « la ville a besoin d'avoir moins de torsades et de boucles serrées dans sa génération »)
   LA MESURE « AVANT / APRÈS » des torsades et des boucles de la ville et de Crypto City, en Node (les VRAIS morceaux, par charge.cjs), comme le jeu :
   VILLE_BANK.graine = la graine (depart-avance.js) — sans elle le grand moment et la vrille se tirent au hasard, pas comme en jeu.
   Tout est à la VITESSE RÉELLE (la croisière × l'élan 1,8 → 1 au palier 25, comme le juge commun).
   Par route :
     · ROULIS : taux max et 95e centile (°/s, lissé 0,5 s), part du temps à plus de 45° / 60° / 90° (tête en bas), le dévers max ;
       TORSADES = les bascules de la dalle d'au moins 45° d'un seul élan (un tour complet de vrille = 1 torsade de 360°) : nombre, la pire (°, s, °/s) ;
       vrilles = les tours complets ; murs = les tenues à plus de 60° ;
     · BOUCLES : les suites de virages du MÊME côté (un contre-virage de 15° remet à zéro) de 180° et plus : nombre, angle, rayon moyen et mini (m et rP), secondes ;
       rmin = le plus petit rayon tenu (fenêtre de 20 m) de toute la route (m, rP) et l'accélération de côté qu'il demande (v²/R, en g) ;
       serrés = les virages de 60° et plus dont le rayon moyen est sous 2 rP ; tours = la somme des |virages| en tours complets.
   node ville-torsades.cjs [racine=<worktree>] [graines=1-12] [paliers=0,10,20] [carte=ville,crypto] [detail=1] [json=<fichier>]   (SEARCH='?sans=villeame' : une variante) */
const path=require('path'),fs=require('fs'),vm=require('vm');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const RAC=path.resolve(arg('racine',path.join(__dirname,'../..')));
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||''),ctx=B.ctx;
const [g0,g1]=arg('graines','1-12').split('-').map(Number),PAL=arg('paliers','0,10,20').split(',').map(Number),CARTES=arg('carte','ville,crypto').split(','),DET=arg('detail')==='1',JS=arg('json');
const D=57.29578;
function mesure(carte,g,pal){
  vm.runInContext('VILLE_BANK.graine='+(g|0)+';if(typeof VILLE_ENTREE!=="undefined")VILLE_ENTREE=null;',ctx);
  const tG0=performance.now(),r=B.piste(carte,g,pal),tGen=performance.now()-tG0,ctrl=r.ctrl,n=ctrl.length,vw=r.vw,rP=40+.3*vw,EL=1.8-.8*Math.min(1,Math.max(0,pal/25)),vR=vw*EL;
  const NB=vm.runInContext('VILLE_BANK.N',ctx),marks=r.marks;
  /* --- le roulis par point de contrôle (déroulé) --- */
  const sc=new Float64Array(n),b=new Float64Array(n);
  for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(ctrl[i].x-ctrl[i-1].x,ctrl[i].y-ctrl[i-1].y,ctrl[i].z-ctrl[i-1].z);
  const okN=NB&&NB.length===n;
  if(okN)for(let i=0;i<n;i++){const a=ctrl[Math.max(0,i-1)],c=ctrl[Math.min(n-1,i+1)],tl=Math.hypot(c.x-a.x,c.z-a.z)||1,tx=(c.x-a.x)/tl,tz=(c.z-a.z)/tl,N=NB[i];
    b[i]=Math.atan2(-N.x*tz+N.z*tx,N.y);if(i){let d=b[i]-b[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;b[i]=b[i-1]+d;}}
  const L=sc[n-1],PAS=2,nR=Math.floor(L/PAS)+1,rl=new Float64Array(nR),im=new Int32Array(nR);
  {let k=0;for(let q=0;q<nR;q++){const s=q*PAS;while(k<n-2&&sc[k+1]<s)k++;const t=Math.max(0,Math.min(1,(s-sc[k])/((sc[k+1]-sc[k])||1)));rl[q]=b[k]+(b[k+1]-b[k])*t;im[q]=k;}}
  const quoi=function(s){let best=null;for(const m of marks){const a=sc[Math.max(0,Math.min(n-1,m.ia!=null?m.ia:m.i0))],c=sc[Math.max(0,Math.min(n-1,m.i2!=null?m.i2:m.i1))];if(s>=a-20&&s<=c+20)best=m.fig||'?';}return best||'liaison';};
  /* taux lissé sur 0,5 s */
  const w=Math.max(1,Math.round(.5*vR/PAS)),taux=[];for(let q=w;q<nR;q++)taux.push(Math.abs(rl[q]-rl[q-w])/(w*PAS)*vR*D);
  const tri=taux.slice().sort((x,y)=>x-y),rollMax=tri.length?tri[tri.length-1]:0,rollP95=tri.length?tri[Math.floor(tri.length*.95)]:0;
  let iMax=0;for(let q=0;q<taux.length;q++)if(taux[q]===rollMax){iMax=q;break;}
  let n45=0,n60=0,n90=0,devMax=0;const plie=x=>{let a=Math.abs(x)%(2*Math.PI);if(a>Math.PI)a=2*Math.PI-a;return a;};
  for(let q=0;q<nR;q++){const a=plie(rl[q])*D;if(a>45)n45++;if(a>60)n60++;if(a>90)n90++;if(a>devMax)devMax=a;}
  /* LE SAUT REFUSÉ (villeEnversRefuse, ville-scenes.js) : la part de la route où le jeu refuse le saut — une dalle à plus de 72,5° (N.y < 0,3) entre 20 m derrière et max(200 m, 4 s de vitesse réelle) devant */
  let nRef=0;{const av=Math.round(Math.max(200,4*vR)/PAS),ar=Math.round(20/PAS);let der=-1e9;const dur=new Uint8Array(nR);for(let q=0;q<nR;q++)dur[q]=Math.cos(plie(rl[q]))<.3?1:0;
    /* der : le dernier point dur à l'indice ≤ q+av */let j=0;for(let q=0;q<nR;q++){while(j<nR&&j<=q+av){if(dur[j])der=j;j++;}if(der>=q-ar)nRef++;}}
  /* les torsades : les bascules monotones (un retour de moins de 6° ne coupe pas) d'au moins 45° */
  const tors=[];{let i0=0,ext=rl[0],sg=0;const clos=function(i1){const amp=Math.abs(rl[i1]-rl[i0])*D;if(amp>=45){const dt=(i1-i0)*PAS/vR;tors.push({amp:Math.round(amp),s:+dt.toFixed(1),taux:Math.round(amp/Math.max(dt,.01)),at:Math.round(i0*PAS),quoi:quoi((i0+i1)/2*PAS)});}};
    let iExt=0;for(let q=1;q<nR;q++){const d=rl[q]-rl[i0];if(sg===0){if(Math.abs(d)>6/D){sg=Math.sign(d);ext=rl[q];iExt=q;}else if(Math.abs(rl[q]-rl[q-1])<1e-9)i0=q;continue;}
      if(sg*(rl[q]-ext)>0){ext=rl[q];iExt=q;}
      if(sg*(ext-rl[q])>6/D||q===nR-1){clos(iExt);i0=iExt;sg=0;ext=rl[q];}}}
  let murs=0;{let dans=false;for(let q=0;q<nR;q++){const a=plie(rl[q])*D>60;if(a&&!dans)murs++;dans=a;}}
  const vrilles=Math.round(Math.abs(rl[nR-1]-rl[0])/(2*Math.PI))+tors.filter(t=>t.amp>=300).length*0; let nVr=0;for(const t of tors)if(t.amp>=300)nVr++;
  /* --- le cap et les boucles (la courbe du jeu, tous les 5 m) --- */
  const T=ctx.THREE,cv=new T.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,n*16);
  const Lc=cv.getLength(),Nc=Math.max(50,Math.round(Lc/5)),P=cv.getSpacedPoints(Nc),ds=Lc/Nc,H=new Float64Array(Nc+1);
  for(let i=0;i<=Nc;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(Nc,i+1)];H[i]=Math.atan2(c.x-a.x,c.z-a.z);}
  for(let i=1;i<=Nc;i++){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;}
  const W=Math.max(1,Math.round(10/ds));let rmin=1e9,rminAt=0,tours=0;
  for(let i=1;i<=Nc;i++)tours+=Math.abs(H[i]-H[i-1]);
  for(let i=W;i<=Nc-W;i++){const k=Math.abs(H[i+W]-H[i-W])/(2*W*ds);if(k>1e-9&&1/k<rmin){rmin=1/k;rminAt=i*ds;}}
  /* les suites du même côté */
  const suites=[];{let i0=0,ext=H[0],sg=0,iExt=0;const clos=function(i1){const ang=Math.abs(H[i1]-H[i0]);if(ang>=60/D){let rm=1e9;for(let i=Math.max(W,i0);i<=Math.min(Nc-W,i1);i++){const k=Math.abs(H[i+W]-H[i-W])/(2*W*ds);if(k>1e-9)rm=Math.min(rm,1/k);}
        /* le rayon moyen des parties qui tournent (courbure > 1/(6 rP)) */let la=0,aa=0;for(let i=Math.max(1,i0+1);i<=i1;i++){const dk=Math.abs(H[i]-H[i-1]);if(dk/ds>1/(6*rP)){la+=ds;aa+=dk;}}
        suites.push({ang:Math.round(ang*D),rmoy:aa?Math.round(la/aa):0,rmin:Math.round(rm),s:+((i1-i0)*ds/vR).toFixed(1),at:Math.round(i0*ds),quoi:quoi((i0+i1)/2*ds)});}};
    for(let i=1;i<=Nc;i++){const d=H[i]-H[i0];if(sg===0){if(Math.abs(d)>.26){sg=Math.sign(d);ext=H[i];iExt=i;}continue;}
      if(sg*(H[i]-ext)>0){ext=H[i];iExt=i;}
      if(sg*(ext-H[i])>.26||i===Nc){clos(iExt);i0=iExt;sg=-sg;ext=H[i];iExt=i;}}}
  /* les recoupements EN PLAN : la route repasse sur (ou sous) elle-même — deux segments de 5 m à plus de 150 m l'un de l'autre sur la route qui se coupent vus de dessus */
  let recoupe=0;{const ecart=Math.round(150/ds);for(let i=0;i<Nc;i++){const a=P[i],b=P[i+1];for(let j=i+ecart;j<Nc;j++){const c=P[j],d=P[j+1];
    const d1=(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x),d2=(b.x-a.x)*(d.z-a.z)-(b.z-a.z)*(d.x-a.x);if(d1*d2>0)continue;const d3=(d.x-c.x)*(a.z-c.z)-(d.z-c.z)*(a.x-c.x),d4=(d.x-c.x)*(b.z-c.z)-(d.z-c.z)*(b.x-c.x);if(d3*d4<=0)recoupe++;}}}
  const boucles=suites.filter(x=>x.ang>=180),serres=suites.filter(x=>x.ang>=60&&x.rmoy<2*rP);
  /* (l'après) rmin80 : le rayon mini tenu sur 80 m (la fenêtre de 20 m lit surtout le raccord de la spline entre un arc et une droite) · tors60 : les torsades de 60° et plus (un S entre deux dévers de 24° en fait déjà 48)
     · b250 : les boucles de 250° et plus · hors220 : les suites de plus de 220° hors raccourci */
  let rmin80=1e9;{const W8=Math.max(1,Math.round(40/ds));for(let i=W8;i<=Nc-W8;i++){const k=Math.abs(H[i+W8]-H[i-W8])/(2*W8*ds);if(k>1e-9&&1/k<rmin80)rmin80=1/k;}}
  const tors60=tors.filter(t=>t.amp>=60).length,b250=boucles.filter(x=>x.ang>=250).length,hors220=boucles.filter(x=>x.ang>220&&!/saut/.test(x.quoi)).length;
  return {carte,g,pal,vR:Math.round(vR),rP:Math.round(rP),dur:+(L/vR).toFixed(1),L:Math.round(L),okN:!!okN,mods:marks.map(m=>m.fig||'?'),
    rollMax:Math.round(rollMax),rollMaxQuoi:quoi((iMax+w/2)*PAS),rollP95:Math.round(rollP95),p45:+(n45/nR*100).toFixed(1),p60:+(n60/nR*100).toFixed(1),p90:+(n90/nR*100).toFixed(1),devMax:Math.round(devMax),
    sautRefuse:+(nRef/nR*100).toFixed(1),recoupe,genMs:+tGen.toFixed(1),tors,nTors:tors.length,nVr,murs,boucles,nBoucles:boucles.length,serres:serres.length,suiteMax:suites.reduce((a,x)=>Math.max(a,x.ang),0),
    rmin80RP:+(rmin80/rP).toFixed(2),tors60,b250,hors220,rmin:Math.round(rmin),rminRP:+(rmin/rP).toFixed(2),rminQuoi:quoi(rminAt),gLat:+(vR*vR/rmin/9.81).toFixed(1),tours:+(tours/(2*Math.PI)).toFixed(2),toursMin:+(tours/(2*Math.PI)/(L/vR)*60).toFixed(2)};
}
const tout=[];
for(const c of CARTES)for(const pal of PAL){const rs=[];
  for(let g=g0;g<=g1;g++){const m=mesure(c,g,pal);rs.push(m);tout.push(m);
    if(DET)console.log('  '+c,'p'+pal,'g'+g,m.dur+'s','| roulis max',m.rollMax+'°/s['+m.rollMaxQuoi+'] p95',m.rollP95,'>45°',m.p45+'% >60°',m.p60+'% envers',m.p90+'%','| torsades',m.nTors,m.tors.map(t=>t.amp+'°/'+t.s+'s['+t.quoi+']').join(' '),'| boucles',m.nBoucles,m.boucles.map(x=>x.ang+'° R'+x.rmoy+'m('+(x.rmoy/m.rP).toFixed(1)+'rP) '+x.s+'s['+x.quoi+']').join(' '),'| rmin',m.rmin+'m='+m.rminRP+'rP['+m.rminQuoi+'] '+m.gLat+'g','| serrés',m.serres,'recoupe',m.recoupe,'tours',m.tours,'·',m.mods.join(','));}
  const mo=k=>+(rs.reduce((a,r)=>a+r[k],0)/rs.length).toFixed(2),mx=k=>Math.max.apply(null,rs.map(r=>r[k])),mn=k=>Math.min.apply(null,rs.map(r=>r[k]));
  const tq={},bq={};for(const r of rs){for(const t of r.tors)tq[t.quoi]=(tq[t.quoi]||0)+1;for(const x of r.boucles)bq[x.quoi]=(bq[x.quoi]||0)+1;}
  const angB=[],rB=[];for(const r of rs)for(const x of r.boucles){angB.push(x.ang);rB.push(x.rmoy/r.rP);}
  console.log(c.padEnd(6),'p'+String(pal).padEnd(2),'durée',mo('dur')+'s','| ROULIS max',mx('rollMax')+'°/s moy',mo('rollMax'),'p95',mx('rollP95'),'· >45°',mo('p45')+'% >60°',mo('p60')+'% envers',mo('p90')+'% (min',mn('p90')+', max',mx('p90')+')','· dévers max',mx('devMax')+'°','· saut refusé',mo('sautRefuse')+'% de la route',
    '| TORSADES/route',mo('nTors'),'(min',mn('nTors'),'max',mx('nTors')+')','vrilles',mo('nVr'),'murs>60°',mo('murs'),JSON.stringify(tq),
    '| BOUCLES≥180°/route',mo('nBoucles'),'(max',mx('nBoucles')+')',JSON.stringify(bq),'angle max',mx('suiteMax')+'°','rayon des boucles',rB.length?Math.min.apply(null,rB).toFixed(2)+'-'+Math.max.apply(null,rB).toFixed(2)+' rP':'-',
    '| RMIN',mn('rmin')+'m',mn('rminRP')+'rP (moy',mo('rminRP')+')','g latéral max',mx('gLat'),'| serrés/route',mo('serres'),'| recoupements en plan/route',mo('recoupe'),'(max',mx('recoupe')+')','| tirage',mo('genMs')+' ms (max',mx('genMs')+')','| tours/min',mo('toursMin'),'| torsades≥60°/route',mo('tors60'),'· boucles≥250°/route',mo('b250'),'· suites>220° hors raccourci/route',mo('hors220'),'· rmin sur 80 m',mn('rmin80RP')+' rP');}
if(JS){fs.writeFileSync(JS,JSON.stringify(tout));console.log('→',JS);}
