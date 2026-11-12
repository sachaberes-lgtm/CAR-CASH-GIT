/* LE BANC DU CANYON (2026-11-12, refonte des modules — Sacha : « la map la plus dure… des modules plus variés, plus larges, sans grand demi-tour ») :
   charge le VRAI genCanyon (code/maps/canyon-route.js, la tranche CY_HZ → fin de genCanyon) et canyon-murs.js dans le vm de charge.cjs, tire N canyons et mesure :
   la longueur, les pièces dans l'ordre, la part de route par GABARIT (fente / gorge serrée / large), les demi-tours (cap qui tourne de plus de 150° du même côté),
   les virages par km, le rayon mini (en RMIN), la pente moyenne, la part de route penchée (dévers > 20°, > 60°), la note de rythme.
   node outils/banc-routes/canyon.cjs [graines=1-40] [palier=0] [--v] [--json=fichier]   (SEARCH="?sans=canyonrefonte" : le canyon d'avant) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const B=require('./charge.cjs'),ctx=B.ctx,RACINE=path.resolve(__dirname,'../..');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-40').split('-').map(Number),pal=+(arg('palier')||0),V=process.argv.includes('--v'),JS=arg('--json');
const src=fs.readFileSync(path.join(RACINE,'code/maps/canyon-route.js'),'utf8'),a0=src.indexOf('const CY_HZ='),a1=src.indexOf('/* LES BRUITS PARTAG');
if(a0<0||a1<0)throw new Error('canyon-route.js : tranche introuvable');
vm.runInContext('var CY={},THICK=5.2;',ctx);
vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/canyon-murs.js'),'utf8'),ctx,{filename:'canyon-murs.js'});
vm.runInContext(src.slice(a0,a1),ctx,{filename:'canyon-route.js'});
vm.runInContext(`function __canyon(graine){LVL.cur={id:'canyon',carte:'canyon',piste:'canyon',__al:.7};MODMARK.length=0;
  const it=genCanyon(mulberry32(graine));let r=it.next();while(!r.done)r=it.next();
  return {C:r.value,Q:CY.Q,hz:CY.hz,murN:CY.murN,murI:CY.murI,gab:CY.gab||null,marks:MODMARK.map(m=>Object.assign({},m)),rythme:RYTHME.der,rmin:CY.rmin,sep:CY.sep};}`,ctx);
const VW=B.VW[pal]||78;
function mesure(graine){
  ctx.__setPalier(pal,VW);const r=ctx.__canyon(graine),C=r.C,n=C.length,S=new Float64Array(n),H=new Float64Array(n);
  for(let i=1;i<n;i++)S[i]=S[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)];H[i]=Math.atan2(b.x-a.x,b.z-a.z);}
  for(let i=1;i<n;i++){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;}
  const L=S[n-1],ix=p=>{let bi=0,bd=1e18;for(let j=0;j<n;j++){const d=C[j].distanceToSquared(p);if(d<bd){bd=d;bi=j;}}return bi;},sQ={};
  for(const k in r.Q)sQ[k]=S[ix(r.Q[k].p)];
  /* les demi-tours : la plus grande rotation du cap, du même côté, dans une fenêtre de 900 m */
  let demi=0,capMax=0;{let i0=0;for(let i=0;i<n;i++){while(S[i]-S[i0]>900)i0++;let mn=1e9,mx=-1e9;for(let j=i0;j<=i;j++){if(H[j]<mn)mn=H[j];if(H[j]>mx)mx=H[j];}capMax=Math.max(capMax,mx-mn);}}
  {let vu=false;for(let i=1;i<n;i++){let j=i;while(j>0&&S[i]-S[j]<700)j--;const d=Math.abs(H[i]-H[j]);if(d>150*Math.PI/180){if(!vu){demi++;vu=true;}}else if(d<60*Math.PI/180)vu=false;}}
  /* le cap extrême autour du cap moyen (on ne revient jamais en arrière si < 90°) */
  let hm=0;for(let i=0;i<n;i++)hm+=H[i];hm/=n;let ecart=0;for(let i=0;i<n;i++)ecart=Math.max(ecart,Math.abs(H[i]-hm));
  /* les gabarits : ceux que genCanyon déclare (CY.gab : [s0, s1, nom]) ; sinon (le canyon d'avant) lus dans les repères : fente = les étroits, large = raccourcis, amphithéâtre, mur */
  /* la part de route par gabarit : un genre par segment de contrôle (0 gorge serrée, 1 fente, 2 large/ouvert, 3 corniche, 4 vallée), puis la somme des longueurs.
     (2026-11-12 : la première écriture — des cumuls dans un objet indexé par une clé lue dans un objet du vm — rendait, d'un lancement à l'autre et à partir de la 17e graine,
     les mêmes parts figées pour toutes les graines : un tableau d'entiers et cinq cumuls nombres, relus deux fois de suite à l'identique) */
  const genre=new Uint8Array(n),cum=[0,0,0,0,0],NUM={fente:1,large:2,ouvert:2,corniche:3,vallee:4};
  if(r.gab&&r.hz&&r.hz.refonte){for(let q=0;q<r.gab.length;q++){const g=r.gab[q],k=NUM[String(g.t)]|0;if(!k)continue;const b=Math.min(n-1,g.i1|0);for(let i=(g.i0|0)+1;i<=b;i++)if(!genre[i])genre[i]=k;}}
  else{const marque=(a,b,k)=>{if(a==null||b==null||!(b>a))return;for(let i=1;i<n;i++)if(S[i]>a&&S[i]<=b&&!genre[i])genre[i]=k;};
    marque(sQ.etroit0,sQ.etroit1,1);marque(sQ.amphi0,sQ.amphi1,2);marque(sQ.mur0,sQ.mur2,2);
    for(const k in sQ){const m=/^(rac[A-H])0$/.exec(k);if(m)marque(sQ[m[1]+'0']-60,sQ[m[1]+'3']+60,2);}}
  if(sQ.breche0!=null)for(let i=1;i<n;i++)if(S[i]<=sQ.breche0&&!genre[i])genre[i]=2; /* la Route 67 : la vallée des Mitaines, ouverte */
  for(let i=1;i<n;i++)cum[genre[i]]+=S[i]-S[i-1];
  const part={fente:+(cum[1]/L).toFixed(3),gorge:+(cum[0]/L).toFixed(3),large:+(cum[2]/L).toFixed(3),corniche:+(cum[3]/L).toFixed(3),vallee:+(cum[4]/L).toFixed(3)};
  /* le dévers */
  let pen20=0,pen60=0;if(r.murN)for(let i=1;i<n;i++){const a=Math.acos(Math.max(-1,Math.min(1,r.murN[i].y)))*57.2958;if(a>20)pen20+=S[i]-S[i-1];if(a>60)pen60+=S[i]-S[i-1];}
  const f=r.rythme&&r.rythme.fiche||{};
  return {graine,L:Math.round(L),pieces:r.hz?r.hz.p.map(p=>p[0]):[],lon:r.hz?r.hz.p:[],demi,capMaxDeg:Math.round(capMax*57.2958),ecartDeg:Math.round(ecart*57.2958),part,
    virKm:f.virKm,serreKm:f.serreKm,rMinRP:f.rMinRP,droiteS:f.droiteS,descente:+((C[0].y-C[n-1].y)/L).toFixed(3),montee:f.montee,penteP95:f.penteP95,note:r.rythme?+r.rythme.note.toFixed(1):null,
    pen20:+(pen20/L).toFixed(3),pen60:+(pen60/L).toFixed(3),sep:r.sep,marks:r.marks.map(m=>m.fig||m.nm||'-')};
}
const out=[];for(let g=g0;g<=g1;g++){let m;try{m=mesure(g*7919+4242);}catch(e){console.log('graine',g,'ERREUR',e.stack.split('\n').slice(0,3).join(' | '));continue;}out.push(m);
  if(V)console.log(g,'L',m.L,'demi',m.demi,'cap',m.capMaxDeg,'part',JSON.stringify(m.part),'vir/km',m.virKm&&m.virKm.toFixed(1),'rMin',m.rMinRP&&m.rMinRP.toFixed(2),'note',m.note,'|',m.pieces.join(' '));}
const moy=f=>{const a=out.map(f).filter(x=>x!=null&&isFinite(x));return a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(3):null;},max=f=>Math.max.apply(null,out.map(f).filter(x=>x!=null&&isFinite(x))),min=f=>Math.min.apply(null,out.map(f).filter(x=>x!=null&&isFinite(x)));
const cpt={};for(const m of out)for(const p of new Set(m.pieces))cpt[p]=(cpt[p]||0)+1;
const nb={};for(const m of out)for(const p of m.pieces)nb[p]=(nb[p]||0)+1;
const nPieces=moy(m=>Math.floor(m.pieces.length/2));
const ordres=new Set(out.map(m=>m.pieces.filter((p,k)=>m.pieces.length%2?k%2===1:!/^(module|souffle|meandres|gorge|serpent|derive|cassures)$/.test(p)).join('>'))).size; /* les pièces = les rangs impairs de hz.p (liaison, pièce, liaison, pièce… liaison) */
const R={n:out.length,palier:pal,L:moy(m=>m.L),demiToursParCanyon:moy(m=>m.demi),capMaxDeg:max(m=>m.capMaxDeg),ecartCapMaxDeg:max(m=>m.ecartDeg),
  part:{fente:moy(m=>m.part.fente),gorge:moy(m=>m.part.gorge),large:moy(m=>m.part.large),corniche:moy(m=>m.part.corniche),vallee:moy(m=>m.part.vallee)},
  virKm:moy(m=>m.virKm),serreKm:moy(m=>m.serreKm),rMinRP:[min(m=>m.rMinRP),moy(m=>m.rMinRP)],droiteSmax:max(m=>m.droiteS),descente:moy(m=>m.descente),monteeMax:max(m=>m.montee),penteP95:moy(m=>m.penteP95),
  note:[moy(m=>m.note),max(m=>m.note)],penche20:moy(m=>m.pen20),penche60:moy(m=>m.pen60),sepMin:min(m=>m.sep),ordres,piecesParCanyon:nPieces,canyonsAvec:cpt,parCanyon:Object.fromEntries(Object.entries(nb).map(([k,v])=>[k,+(v/out.length).toFixed(2)]))};
console.log(JSON.stringify(R,null,1));
if(JS)fs.writeFileSync(JS,JSON.stringify({resume:R,detail:out}));
