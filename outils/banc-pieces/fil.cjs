/* BANC DU FIL DE PIÈCES — node outils/banc-pieces/fil.cjs [graines]
   Charge code/gameplay/pieces-fil.js TEL QUEL (fonction pure) et vérifie :
   1. les invariants (nombres finis, s croissants, dans la piste, jamais hors route, jamais sur un obstacle, déterminisme) ;
   2. la RAMASSABILITÉ : un pilote simulé (la vraie loi de braquage de la boucle de conduite : lacetMax, VOL_TAU, cap, vL = vA·sin psi)
      suit le fil et on compte, motif par motif, les pièces prises (portée 3,8 m, trajet balayé) — une série doit être prise ENTIÈRE ;
   3. la densité (pièces au km) face à l'ancien générateur (recopié ici) ;
   4. la variété (motifs tirés, jamais deux fois de suite). */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../../code/gameplay/pieces-fil.js'),'utf8');
const {filPlan,FIL_KIND,filRayon}=new Function(src+'\n;return {filPlan,FIL_KIND,filRayon};')();
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const ERR=+process.env.ERR||0; /* ERR=0.8 : le pilote vise 0,8 m à côté du fil (le joueur n'est pas parfait) */
const SPD=.48,VOL_R0=40,VOL_RK=.3,VOL_TAU=.1;
const lacetMax=v=>{const vw=Math.max(8,Math.abs(v)*SPD);return vw/(VOL_R0+VOL_RK*vw);};
const NSEED=+process.argv[2]||60,L=9000;
/* ---- des obstacles de test : des flaques posées au hasard ---- */
function obst(rnd,HALF){const O=[];for(let s=300+rnd()*200;s<L-100;s+=120+rnd()*260)O.push({s:s,lat:(rnd()*2-1)*(HALF-4),r:3+rnd()*3});return O;}
const bloqueDe=O=>(sp,lt)=>{for(const o of O)if(Math.abs(o.s-sp)<=o.r+2.6&&Math.abs(o.lat-lt)<=o.r+2.2)return true;return false;};
/* ---- le pilote : il suit le fil par poursuite de point, avec la loi de braquage du jeu ---- */
function pilote(fil,coins,STR,spdMult,vA){
  const Rmin=VOL_R0+VOL_RK*vA*SPD,Ld=Math.max(18,Rmin*.55),dt=1/60;
  const fl=s=>{let lo=0,hi=fil.length-1;if(s<=fil[0].s)return fil[0].l;if(s>=fil[hi].s)return fil[hi].l;while(hi-lo>1){const m=(lo+hi)>>1;if(fil[m].s<=s)lo=m;else hi=m;}const a=fil[lo],b=fil[hi];return a.l+(b.l-a.l)*(s-a.s)/(b.s-a.s||1);};
  let s=fil[0].s-60,lat=fl(s),psi=0,yawR=0,k0=0;const pris=new Uint8Array(coins.length);pris.dmin=new Float64Array(coins.length).fill(99);pris.lat=new Float64Array(coins.length);
  let iDeb=0;
  while(s<fil[fil.length-1].s+30){
    const psiD=Math.atan2(fl(s+Ld)+ERR-lat,Ld),st=Math.max(-1,Math.min(1,3*(psiD-psi)));
    const rT=st*lacetMax(vA)*spdMult*Math.min(1,vA/8);
    yawR+=(rT-yawR)*(1-Math.exp(-dt*spdMult/VOL_TAU));psi+=yawR*dt;psi=Math.max(-1.4,Math.min(1.4,psi));
    const vL=vA*Math.sin(psi),s0=s,l0=lat;
    lat+=vL*dt*SPD*spdMult;s+=vA*Math.cos(psi)*dt*SPD*spdMult;
    /* le trajet balayé de l'image : distance point-segment (la hauteur de la pièce au-dessus de la caisse : ~0,8 m) */
    while(iDeb<coins.length&&coins[iDeb].s<s0-6)iDeb++;
    for(let i=iDeb;i<coins.length&&coins[i].s<s+6;i++){if(pris[i])continue;const c=coins[i];
      const dx=s-s0,dy=lat-l0,l2=dx*dx+dy*dy;let t=l2>1e-9?((c.s-s0)*dx+(c.l-l0)*dy)/l2:0;t=Math.max(0,Math.min(1,t));
      const ex=s0+dx*t-c.s,ey=l0+dy*t-c.l;const dd=Math.hypot(ex,ey,1.4);if(dd<pris.dmin[i]){pris.dmin[i]=dd;pris.lat[i]=lat;}if(dd<3.8)pris[i]=1;}
  }
  return pris;
}
/* ---- l'ancien générateur (recopié de spawnPickups : les positions seulement) ---- */
function ancien(rnd,HALF,STR,rich){const out=[];let ss=200;const place=(sp,lt)=>{if(sp<120||sp>L-50)return;out.push({s:sp,l:Math.max(-HALF,Math.min(HALF,lt))});};const esp=v=>v/rich;
  while(ss<L-90){if(rnd()<.24/rich){ss+=esp(120+rnd()*160);continue;}const pat=rnd();
    if(pat<.30){const n=5+((rnd()*4)|0),amp=HALF*(.7+rnd()*.3),ph=1.1+rnd()*1.3,st=(10+rnd()*4)*STR;for(let i=0;i<n;i++){place(ss+i*st,Math.sin(i*ph)*amp);rnd();}ss+=esp(n*st/STR+70+rnd()*50);}
    else if(pat<.52){const n=5+((rnd()*4)|0),amp=HALF*(.75+rnd()*.25),sd=rnd()<.5?-1:1,st=(11+rnd()*4)*STR;for(let i=0;i<n;i++){const u=i/(n-1);place(ss+i*st,sd*amp*Math.sin(u*Math.PI));rnd();}ss+=esp(n*st/STR+70+rnd()*50);}
    else if(pat<.70){const R=Math.min(HALF,5.5+rnd()*4),n=8+((rnd()*4)|0),Rs=R*STR;for(let i=0;i<n;i++){const th=i/n*6.2832;place(ss+Rs+Rs*Math.sin(th),R*Math.cos(th));}ss+=esp(2*R+80+rnd()*50);}
    else if(pat<.80){const n=12+((rnd()*6)|0),st=6*STR;for(let i=0;i<n;i++)place(ss+i*st,Math.sin(i*.55)*2.4);ss+=esp(n*st/STR+140+rnd()*80);}
    else{const n=2+((rnd()*3)|0),st=(20+rnd()*18)*STR;for(let i=0;i<n;i++){place(ss+i*st,(rnd()*2-1)*HALF);rnd();}ss+=esp(n*st/STR+60+rnd()*50);}}
  return out;}
let bug=0;const echec=m=>{bug++;console.log('  ✗ '+m);};
const CAS=[{STR:1,rich:.88,HALF:26.2,nom:'départ'},{STR:1.45,rich:1.4,HALF:26.2,nom:'zone 1'},{STR:2.1,rich:3.4,HALF:26.2,nom:'grand moteur'},{STR:1.2,rich:1.2,HALF:40,nom:'route large'},{STR:1,rich:1,HALF:12,nom:'route étroite'}];
const tot={};
for(const cas of CAS){
  let nP=0,nA=0,sMot=0,sOk=0,sPris=0,sTot=0,pasPris=[],kinds={},rep=0,ser=0,serEntieres=0;
  for(let g=1;g<=NSEED;g++){
    const O=obst(mulberry32(g*7+1),cas.HALF),bl=bloqueDe(O);
    const fil=[],a=filPlan(mulberry32(g*131+5),{L:L,HALF:cas.HALF,STR:cas.STR,rich:cas.rich,fruits:true,bloque:bl,s0:200,fil:fil});
    const b=filPlan(mulberry32(g*131+5),{L:L,HALF:cas.HALF,STR:cas.STR,rich:cas.rich,fruits:true,bloque:bl,s0:200});
    if(JSON.stringify(a)!==JSON.stringify(b))echec('non déterministe graine '+g);
    const A=ancien(mulberry32(g*977+3),cas.HALF,cas.STR,cas.rich);nA+=A.length;nP+=a.length;
    let dern='',dg=0;
    for(const c of a){
      if(!isFinite(c.s)||!isFinite(c.l))echec('NaN graine '+g);
      if(c.s<120||c.s>L-50)echec('hors piste s='+c.s);
      if(Math.abs(c.l)>cas.HALF+1e-6)echec('hors route lat='+c.l);
      if(bl(c.s,c.l))echec('pièce sur obstacle s='+c.s.toFixed(1)+' l='+c.l.toFixed(1));
    }
    /* motifs : on les retrouve par leur numéro de série ; les libres (g=0) sont comptés à part */
    const gr=new Map();for(const c of a){const k=c.g;if(!gr.has(k))gr.set(k,[]);gr.get(k).push(c);}
    const motifs=[...gr.entries()].filter(e=>e[0]>0);
    /* variété : l'ordre des genres */
    let prev='';const ord=[];for(const c of a){if(c.k!==prev){ord.push(c.k);prev=c.k;}}
    for(let i=0;i<ord.length;i++){kinds[ord[i]]=(kinds[ord[i]]||0)+1;if(i&&ord[i]===ord[i-1])rep++;}
    /* la ramassabilité : trois vitesses (croisière, ×1,5 nitro, vitesse de fin) */
    const vs=[{m:1},{m:1.5}];
    for(const v of vs){
      const vA=(190/3.6)*cas.STR*cas.STR; /* maxSp en unités : 190 km/h × late × push (STR² = push × late) */
      const sorted=a.slice().sort((p,q)=>p.s-q.s);
      const pris=pilote(fil,sorted,cas.STR,v.m,vA);
      const idx=new Map();sorted.forEach((c,i)=>{if(c.g>0){if(!idx.has(c.g))idx.set(c.g,[]);idx.get(c.g).push(i);}});
      for(const [g9,ix] of idx){const n=ix.reduce((x,i)=>x+pris[i],0);sTot+=ix.length;sPris+=n;sMot++;if(n===ix.length)sOk++;else if(pasPris.length<4){const j=ix.find(i=>!pris[i]);pasPris.push({v:v.m,motif:sorted[ix[0]].k,n:n+'/'+ix.length,s:Math.round(sorted[ix[0]].s),rate:{l:+sorted[j].l.toFixed(1),car:+pris.lat[j].toFixed(1),d:+pris.dmin[j].toFixed(2)},g:g});}}
    }
  }
  console.log(`\n== ${cas.nom} (STR ${cas.STR}, rich ${cas.rich}, demi-route ${cas.HALF}) — ${NSEED} pistes de ${L} m`);
  console.log(`  pièces/km : ancien ${(nA/NSEED/L*1000).toFixed(1)} → fil ${(nP/NSEED/L*1000).toFixed(1)}  (×${(nP/nA).toFixed(2)})`);
  console.log(`  séries prises ENTIÈRES : ${sOk}/${sMot} (${(100*sOk/sMot).toFixed(1)} %) · pièces des séries prises : ${(100*sPris/sTot).toFixed(2)} %`);
  if(pasPris.length)console.log('  ratés :',JSON.stringify(pasPris));
  console.log('  genres :',Object.entries(kinds).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · '),' | genre répété d\'affilée : '+rep);
  tot[cas.nom]=sOk/sMot;
}
console.log('\n'+(bug?bug+' ANOMALIE(S)':'invariants OK'));
process.exit(bug?1:0);
