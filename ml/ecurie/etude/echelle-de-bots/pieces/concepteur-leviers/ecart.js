/* ===== LE CONCEPTEUR DES LEVIERS, 1 : le tableau de l'ecart (2026-11-28, etude « echelle de bots », pieces) =====
   Lecture seule. Joueurs : ml/bot/etalon (partiesJoueurs, finVraie). c0025 : ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (20 parties).
   L'identite : pieces/min = route au sol + route en l'air + figures ;
                route au sol / min = (part du temps au sol) x (km de sol par minute de sol) x (pieces de route par km de sol).
   Les km de SOL seulement : un raccourci avance le long de la route sans rien ramasser (aucune piece n'est posee en l'air).
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/concepteur-leviers/ecart.js            -> sortie-ecart.txt
             node ml/ecurie/etude/echelle-de-bots/pieces/concepteur-leviers/ecart.js --avant 180  -> sortie-ecart-avant-180.txt (chaque partie coupee a 180 s : a duree egale, sans la queue des parties longues) */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),M=require(path.join(RAC,'ml','bot','mesures.js')),{volsDe}=require(path.join(RAC,'ml','bot','voltige.js'));
const out=[],f0=x=>x==null||x!==x?'-':Math.round(x)+'',f1=x=>x==null||x!==x?'-':x.toFixed(1),f2=x=>x==null||x!==x?'-':x.toFixed(2);
const lus=fs.readdirSync(path.join(RAC,'ml','bot','etalon')).filter(f=>f.endsWith('.json')).sort().map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml','bot','etalon',f),'utf8'))}));
const iA=process.argv.indexOf('--avant'),AVANT=iA>=0?+process.argv[iA+1]:null;
const coupe=c=>{if(!AVANT||!(c.fin.t>AVANT))return c;const it=c.cols.indexOf('t');return Object.assign({},c,{ech:c.ech.filter(e=>e[it]<=AVANT),ev:c.ev.filter(e=>e[0]<=AVANT),fin:Object.assign({},c.fin,{t:AVANT})});};
const J=M.partiesJoueurs(lus).parties.map(M.finVraie).map(coupe);
const B=JSON.parse(fs.readFileSync(path.join(RAC,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8')).parties.map(p=>coupe(M.finVraie(p.partie)));
const GP=[[1,3],[4,6],[7,9],[10,12],[13,30]],gpDe=p=>GP.findIndex(x=>p>=x[0]&&p<=x[1]);
const Z=()=>({dt:0,dtSol:0,kmSol:0,kmAir:0,pSol:0,pAir:0,pFig:0,nitSol:0,kmhOn:0,dtOn:0,kmhOff:0,dtOff:0});
/* une partie -> ses cases : tout, par groupe de palier (g), par zone (z = portails franchis, 3 = 3 et plus), par carte (c), par minute (m) */
function cases(c){
  const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]],A={};
  const fp=new Set(c.ev.filter(e=>e[1]==='figure_payee').map(e=>e[0])),P=c.ev.filter(e=>e[1]==='piece');let ip=0,cum=0;
  const carte=r=>((c.routes||[])[r]||{}).carte||'?';
  for(let j=0;j<E.length;j++){const e=E[j],t=g(e,'t'),sol=g(e,'m')===0;let ps=0,pa=0,pf=0;
    while(ip<P.length&&P[ip][0]<=t){const n=P[ip][2]|0;cum+=n;if(fp.has(P[ip][0]))pf+=n;else if(sol)ps+=n;else pa+=n;ip++;}
    const pal=M.palierDe(cum),r=g(e,'r'),dt=j?Math.min(.25,t-g(E[j-1],'t')):0;
    let ds=0;if(j&&r===g(E[j-1],'r')){const d=g(e,'s')-g(E[j-1],'s');if(d>0&&d<400)ds=d/1000;}
    const solP=j&&g(E[j-1],'m')===0&&sol;
    for(const k of ['*','g'+gpDe(pal),'z'+Math.min(3,r),'c'+carte(r),'m'+Math.min(3,Math.floor(t/60))]){const a=A[k]||(A[k]=Z());
      a.dt+=dt;a.pSol+=ps;a.pAir+=pa;a.pFig+=pf;
      if(sol){a.dtSol+=dt;if(g(e,'nit')){a.nitSol+=dt;a.kmhOn+=g(e,'kmh')*dt;a.dtOn+=dt;}else{a.kmhOff+=g(e,'kmh')*dt;a.dtOff+=dt;}}
      if(solP)a.kmSol+=ds;else a.kmAir+=ds;}}
  /* les pieces d'apres le dernier echantillon (rares) : au total seulement */
  while(ip<P.length){const n=P[ip][2]|0;(A['*']||(A['*']=Z()))[fp.has(P[ip][0])?'pFig':'pSol']+=n;ip++;}
  return A;}
const CJ=J.map(cases),CB=B.map(cases);
const somme=(L,k)=>{const a=Z();for(const A of L){const x=A[k];if(x)for(const q in a)a[q]+=x[q];}return a;};
const taux=a=>{const min=a.dt/60,minS=a.dtSol/60;return {min,total:(a.pSol+a.pAir+a.pFig)/min,sol:a.pSol/min,air:a.pAir/min,fig:a.pFig/min,
  fSol:a.dtSol/a.dt,vSol:a.kmSol/minS,dSol:a.pSol/a.kmSol,kmTot:(a.kmSol+a.kmAir)/min,kmAir:a.kmAir/min,nit:a.nitSol/a.dtSol,
  kmhOn:a.kmhOn/a.dtOn,kmhOff:a.kmhOff/a.dtOff,kmh:(a.kmhOn+a.kmhOff)/(a.dtOn+a.dtOff)};};
const TJ=taux(somme(CJ,'*')),TB=taux(somme(CB,'*'));

/* ---------- 1. l'identite ---------- */
out.push('# Le tableau de l\'ecart'+(AVANT?' — chaque partie coupee a '+AVANT+' s':'')+' (joueurs : '+J.length+' parties, '+f1(TJ.min)+' min ; c0025 : '+B.length+' parties, '+f1(TB.min)+' min)');
out.push('\n## 1. Par source (pieces par minute)');
out.push('| source | joueurs | c0025 | ecart | part de l\'ecart |');out.push('|---|---|---|---|---|');
const E0=TJ.total-TB.total;
for(const [n,k] of [['route, au sol','sol'],['route, en l\'air','air'],['figures (poses payees)','fig'],['TOTAL','total']])
  out.push(`| ${n} | ${f0(TJ[k])} | ${f0(TB[k])} | ${f0(TJ[k]-TB[k])} | ${f0(100*(TJ[k]-TB[k])/E0)} % |`);
out.push('\n## 2. La route au sol = part du temps au sol x km de sol par minute de sol x pieces par km de sol');
out.push('| facteur | joueurs | c0025 | rapport J/B | part de l\'ecart « route au sol » (logarithme) | en pieces/min |');out.push('|---|---|---|---|---|---|');
const lr=Math.log(TJ.sol/TB.sol),eSol=TJ.sol-TB.sol;
for(const [n,k,u] of [['part du temps au sol','fSol',100],['km de sol par minute de sol','vSol',1],['pieces de route par km de sol','dSol',1]])
  out.push(`| ${n} | ${k==='fSol'?f0(TJ[k]*100)+' %':f2(TJ[k])} | ${k==='fSol'?f0(TB[k]*100)+' %':f2(TB[k])} | ${f2(TJ[k]/TB[k])} | ${f0(100*Math.log(TJ[k]/TB[k])/lr)} % | ${f0(eSol*Math.log(TJ[k]/TB[k])/lr)} |`);
out.push(`| produit | ${f0(TJ.sol)} | ${f0(TB.sol)} | ${f2(TJ.sol/TB.sol)} | 100 % | ${f0(eSol)} |`);
out.push(`(km en tout par minute, raccourcis compris : ${f2(TJ.kmTot)} / ${f2(TB.kmTot)} ; dont km avances EN VOL : ${f2(TJ.kmAir)} / ${f2(TB.kmAir)} ; nitro au sol : ${f0(100*TJ.nit)} % / ${f0(100*TB.nit)} %)`);

/* ---------- 3. la vitesse au sol : a palier egal, et le melange des paliers ---------- */
out.push('\n## 3. La vitesse au sol, par groupe de palier');
out.push('| paliers | min de sol J / B | km de sol par min de sol J / B | rapport | nitro au sol % J / B | km/h nitro allumee J / B | km/h nitro coupee J / B | km/h de c0025 s\'il avait la part de nitro des joueurs |');out.push('|---|---|---|---|---|---|---|---|');
const parG=GP.map((x,i)=>({x,j:somme(CJ,'g'+i),b:somme(CB,'g'+i)}));
for(const {x,j,b} of parG){const a=taux(j),c=taux(b);
  out.push(`| ${x[0]}-${x[1]} | ${f1(j.dtSol/60)} / ${f1(b.dtSol/60)} | ${f2(a.vSol)} / ${f2(c.vSol)} | ${f2(a.vSol/c.vSol)} | ${f0(100*a.nit)} / ${f0(100*c.nit)} | ${f0(a.kmhOn)} / ${f0(c.kmhOn)} | ${f0(a.kmhOff)} / ${f0(c.kmhOff)} | ${f0(c.kmhOn*a.nit+c.kmhOff*(1-a.nit))} (au lieu de ${f0(c.kmh)} ; joueurs ${f0(a.kmh)}) |`);}
/* standardisation : la vitesse des joueurs au melange de paliers de c0025 (poids = minutes de sol de c0025) */
function std(LJ,LB,pre,n,num,den,wden){let s=0,w=0;for(let i=0;i<n;i++){const j=somme(LJ,pre+i),b=somme(LB,pre+i);if(!(j[den]>0)||!(b[wden]>0))continue;s+=b[wden]*j[num]/j[den];w+=b[wden];}return s/w;}
const vJstd=std(CJ,CB,'g',5,'kmSol','dtSol','dtSol')*60;
out.push(`\nLa vitesse au sol des joueurs AU MELANGE DE PALIERS DE c0025 : ${f2(vJstd)} km/min (c0025 : ${f2(TB.vSol)} ; joueurs tels quels : ${f2(TJ.vSol)}).`);
out.push(`- a palier egal : x${f2(vJstd/TB.vSol)} ; par le melange des paliers (les joueurs passent plus de temps aux paliers hauts) : x${f2(TJ.vSol/vJstd)}.`);
/* ---------- 4. la densite : a zone egale, et le melange des zones ---------- */
out.push('\n## 4. Les pieces de route par km de sol, par zone (portails franchis)');
out.push('| zone | km de sol J / B | pieces par km de sol J / B | rapport | la formule de economie.md (offertes par km) |');out.push('|---|---|---|---|---|');
const off=z=>Math.min(240,2.15*30*Math.pow(Math.min(3.4,Math.max(.88,.88+.52*z)),1.2));
for(let z=0;z<4;z++){const j=somme(CJ,'z'+z),b=somme(CB,'z'+z);out.push(`| ${z}${z===3?' et plus':''} | ${f0(j.kmSol)} / ${f0(b.kmSol)} | ${f1(j.pSol/j.kmSol)} / ${f1(b.pSol/b.kmSol)} | ${f2((j.pSol/j.kmSol)/(b.pSol/b.kmSol))} | ${f0(off(z))} |`);}
const dJstd=std(CJ,CB,'z',4,'pSol','kmSol','kmSol');
out.push(`\nLa densite ramassee des joueurs AU MELANGE DE ZONES DE c0025 : ${f1(dJstd)} par km (c0025 : ${f1(TB.dSol)} ; joueurs tels quels : ${f1(TJ.dSol)}).`);
out.push(`- a zone egale : x${f2(dJstd/TB.dSol)} ; par le melange des zones (les joueurs roulent plus loin dans les zones riches) : x${f2(TJ.dSol/dJstd)}.`);

/* ---------- 5. le tableau final : la somme fait le total ---------- */
const parts=[];
const lv=Math.log(TJ.vSol/TB.vSol),ld=Math.log(TJ.dSol/TB.dSol),lf=Math.log(TJ.fSol/TB.fSol);
const pv=eSol*lv/lr,pd=eSol*ld/lr,pf=eSol*lf/lr;
parts.push(['vitesse au sol, A PALIER EGAL (nitro, elan)',pv*Math.log(vJstd/TB.vSol)/lv]);
parts.push(['vitesse au sol, par le melange des paliers (consequence : la boucle, et les 2 parties longues)',pv*Math.log(TJ.vSol/vJstd)/lv]);
parts.push(['pieces par km de sol, A ZONE EGALE (le vise)',pd*Math.log(dJstd/TB.dSol)/ld]);
parts.push(['pieces par km de sol, par le melange des zones (portails passes plus tot)',pd*Math.log(TJ.dSol/dJstd)/ld]);
parts.push(['part du temps au sol (les joueurs volent plus : cela leur COUTE)',pf]);
parts.push(['pieces de route prises en l\'air',TJ.air-TB.air]);
parts.push(['figures (poses payees)',TJ.fig-TB.fig]);
out.push('\n## 5. Le tableau final (pieces par minute ; la somme fait l\'ecart total)');
out.push('| cause | pieces/min | part |');out.push('|---|---|---|');let S=0;
for(const [n,v] of parts){S+=v;out.push(`| ${n} | ${v>=0?'+':''}${f0(v)} | ${f0(100*v/E0)} % |`);}
out.push(`| TOTAL | ${f0(S)} (ecart mesure ${f0(E0)}) | 100 % |`);

/* ---------- 6. les intervalles (tirage des parties, 3 000 fois) ---------- */
function rnd(s){let x=s>>>0;return ()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
const rr=rnd(20261128),NB=3000,V={};const pousse=(k,v)=>(V[k]=V[k]||[]).push(v);
for(let b=0;b<NB;b++){const LJ=CJ.map(()=>CJ[(rr()*CJ.length)|0]),LB=CB.map(()=>CB[(rr()*CB.length)|0]);
  const a=taux(somme(LJ,'*')),c=taux(somme(LB,'*')),e=a.total-c.total,es=a.sol-c.sol,l=Math.log(a.sol/c.sol);
  const vs=std(LJ,LB,'g',5,'kmSol','dtSol','dtSol')*60,dz=std(LJ,LB,'z',4,'pSol','kmSol','kmSol');
  pousse('rapport total',a.total/c.total);pousse('rapport vitesse au sol',a.vSol/c.vSol);pousse('rapport vitesse au sol a palier egal',vs/c.vSol);
  pousse('rapport pieces par km de sol',a.dSol/c.dSol);pousse('rapport pieces par km de sol a zone egale',dz/c.dSol);pousse('rapport part du temps au sol',a.fSol/c.fSol);
  pousse('part de l\'ecart : vitesse au sol (%)',100*es*Math.log(a.vSol/c.vSol)/l/e);pousse('part : vitesse a palier egal (%)',100*es*Math.log(vs/c.vSol)/l/e);
  pousse('part : pieces par km de sol (%)',100*es*Math.log(a.dSol/c.dSol)/l/e);pousse('part : a zone egale (%)',100*es*Math.log(dz/c.dSol)/l/e);
  pousse('part : figures (%)',100*(a.fig-c.fig)/e);pousse('part : en l\'air (%)',100*(a.air-c.air)/e);}
out.push('\n## 6. Les intervalles a 95 % (tirage des parties avec remise, '+NB+' fois)');
for(const k in V){const A=V[k].filter(x=>x===x).sort((a,b)=>a-b);out.push(`- ${k} : [${f2(A[Math.floor(.025*A.length)])} ; ${f2(A[Math.floor(.975*A.length)])}]`);}

/* ---------- 7. minute par minute : les km de sol et la densite ---------- */
out.push('\n## 7. Minute par minute');
out.push('| minute | min J / B | route au sol par min J / B | part au sol % J / B | km de sol par min de sol J / B | pieces par km de sol J / B | nitro au sol % J / B |');out.push('|---|---|---|---|---|---|---|');
for(let m=0;m<4;m++){const a=taux(somme(CJ,'m'+m)),c=taux(somme(CB,'m'+m));
  out.push(`| ${m+1}${m===3?' et plus':''} | ${f1(a.min)} / ${f1(c.min)} | ${f0(a.sol)} / ${f0(c.sol)} | ${f0(100*a.fSol)} / ${f0(100*c.fSol)} | ${f2(a.vSol)} / ${f2(c.vSol)} | ${f1(a.dSol)} / ${f1(c.dSol)} | ${f0(100*a.nit)} / ${f0(100*c.nit)} |`);}

/* ---------- 8. les raccourcis, par carte ---------- */
out.push('\n## 8. Les raccourcis (poses a 60 m gagnes ou plus, volsDe de ml/bot/voltige.js), par carte');
out.push('| carte | min J / B | raccourcis J / B | par minute J / B | m gagnes par minute J / B | gene de c0025 (raccCartes) |');out.push('|---|---|---|---|---|---|');
const RC={nuages:1,ville:1,jade:0,espace:1,grotte:0,canyon:0};
function racc(L,CL){const R={};L.forEach((c,i)=>{for(const k in CL[i])if(k[0]==='c'){const r=R[k.slice(1)]||(R[k.slice(1)]={dt:0,n:0,m:0,vols:0,morts:0});r.dt+=CL[i][k].dt;}
  for(const v of volsDe(c)){const r=R[v.carte]||(R[v.carte]={dt:0,n:0,m:0,vols:0,morts:0});r.vols++;if(v.mort)r.morts++;if(!v.mort&&v.gain>=60){r.n++;r.m+=v.gain;}}});return R;}
const RJ=racc(J,CJ),RB=racc(B,CB);
for(const k of [...new Set(Object.keys(RJ).concat(Object.keys(RB)))].sort()){const a=RJ[k]||{dt:0,n:0,m:0},b=RB[k]||{dt:0,n:0,m:0};
  out.push(`| ${k} | ${f1(a.dt/60)} / ${f1(b.dt/60)} | ${a.n} / ${b.n} | ${a.dt?f2(a.n/(a.dt/60)):'-'} / ${b.dt?f2(b.n/(b.dt/60)):'-'} | ${a.dt?f0(a.m/(a.dt/60)):'-'} / ${b.dt?f0(b.m/(b.dt/60)):'-'} | ${RC[k]==null?'?':RC[k]?'ouvert':'FERME'} |`);}
const tot=(R,q)=>Object.values(R).reduce((a,r)=>a+r[q],0);
const ferm=R=>['jade','grotte','canyon'].reduce((a,k)=>a+((R[k]||{}).m||0),0);
out.push(`Metres gagnes par minute, toutes cartes : joueurs ${f0(tot(RJ,'m')/TJ.min)}, c0025 ${f0(tot(RB,'m')/TB.min)}. Dont sur les cartes FERMEES a c0025 (jade, grotte, canyon) : joueurs ${f0(ferm(RJ)/TJ.min)} par minute de partie (${f0(100*ferm(RJ)/tot(RJ,'m'))} % de leurs metres), c0025 ${f0(ferm(RB)/TB.min)}.`);

/* ---------- 9. l'heure des portails, et ce que les raccourcis y font ---------- */
out.push('\n## 9. Le temps passe sur une zone finie (du depart ou d\'un portail au portail suivant)');
function zones(L){const R=[];for(const c of L){const col={};c.cols.forEach((n,i)=>col[n]=i);const tr=[0].concat(c.ev.filter(e=>e[1]==='route').map(e=>e[0]));const V=volsDe(c);
  for(let z=0;z+1<tr.length;z++){const Lr=((c.routes||[])[z]||{}).L||0,g=V.filter(v=>v.r===z&&!v.mort&&v.gain>=60).reduce((a,v)=>a+v.gain,0);R.push({z:Math.min(z,2),t:tr[z+1]-tr[z],L:Lr,g});}}return R;}
const ZJ=zones(J),ZB=zones(B),medi=A=>{A=A.slice().sort((a,b)=>a-b);return A.length?A[A.length>>1]:NaN;},moy=A=>A.reduce((a,b)=>a+b,0)/Math.max(1,A.length);
out.push('| zone | zones finies J / B | duree mediane s J / B | longueur moyenne m J / B | m sautes par raccourci, part de la longueur J / B | vitesse moyenne de traversee (L / duree) km/min J / B |');out.push('|---|---|---|---|---|---|');
for(let z=0;z<3;z++){const a=ZJ.filter(x=>x.z===z),b=ZB.filter(x=>x.z===z);
  out.push(`| ${z}${z===2?' et plus':''} | ${a.length} / ${b.length} | ${f0(medi(a.map(x=>x.t)))} / ${f0(medi(b.map(x=>x.t)))} | ${f0(moy(a.map(x=>x.L)))} / ${f0(moy(b.map(x=>x.L)))} | ${f0(100*moy(a.map(x=>x.g))/moy(a.map(x=>x.L)))} % / ${f0(100*moy(b.map(x=>x.g))/moy(b.map(x=>x.L)))} % | ${f2(moy(a.map(x=>x.L))/1000/(moy(a.map(x=>x.t))/60))} / ${f2(moy(b.map(x=>x.L))/1000/(moy(b.map(x=>x.t))/60))} |`);}

/* ---------- 10. les figures : d'ou vient une pose payee ---------- */
out.push('\n## 10. Les poses payees : avec ou sans figure de la main');
function poses(L){const o={vols:0,poses:0,f0:0,f0p:0,f0pc:0,f1:0,f1p:0,f1pc:0,min:0,dur0:[],dur1:[],route:0,routePc:0};
  for(const c of L){o.min+=c.fin.t/60;const fpT=c.ev.filter(e=>e[1]==='figure_payee').map(e=>e[0]),pc=t=>c.ev.filter(q=>q[1]==='piece'&&Math.abs(q[0]-t)<.001).reduce((a,q)=>a+q[2],0);const pris=new Set();
    for(const v of volsDe(c)){o.vols++;if(v.mort)continue;o.poses++;const t=fpT.find(x=>Math.abs(x-v.tPose)<=.25),k=v.figs.length?'f1':'f0';o[k]++;(v.figs.length?o.dur1:o.dur0).push(v.duree);if(t!=null){pris.add(t);o[k+'p']++;o[k+'pc']+=pc(t);}}
    for(const t of fpT)if(!pris.has(t)){o.route++;o.routePc+=pc(t);}}return o;}
const PJ=poses(J),PB=poses(B);
out.push('| | joueurs | c0025 |');out.push('|---|---|---|');
for(const [n,f] of [['vols par minute',o=>f2(o.vols/o.min)],['poses SANS figure de la main, par minute',o=>f2(o.f0/o.min)],['… dont payees (part)',o=>f0(100*o.f0p/o.f0)+' %'],['… pieces par pose payee',o=>f1(o.f0pc/o.f0p)],['… pieces par minute',o=>f1(o.f0pc/o.min)],
  ['poses AVEC figure de la main, par minute',o=>f2(o.f1/o.min)],['… dont payees (part)',o=>f0(100*o.f1p/o.f1)+' %'],['… pieces par pose payee',o=>f1(o.f1pc/o.f1p)],['… pieces par minute',o=>f1(o.f1pc/o.min)],
  ['duree mediane d\'un vol pose sans figure / avec (s)',o=>f2(medi(o.dur0))+' / '+f2(medi(o.dur1))],['paiements hors d\'une pose (figures de route), par minute',o=>f2(o.route/o.min)],['… pieces par minute',o=>f1(o.routePc/o.min)]])
  out.push(`| ${n} | ${f(PJ)} | ${f(PB)} |`);
fs.writeFileSync(path.join(__dirname,AVANT?'sortie-ecart-avant-'+AVANT+'.txt':'sortie-ecart.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
