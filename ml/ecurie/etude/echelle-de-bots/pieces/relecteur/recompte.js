/* ===== LE RELECTEUR DES PIECES, 1 : le recomptage de l'ecart (2026-11-28, etude « echelle de bots », pieces) =====
   Lecture seule. Une SEULE fonction decoupe une partie, la meme pour les joueurs et pour c0025 :
     · figure : le gain de l'evenement 'piece' tombe a l'instant exact d'un 'figure_payee' (meme image) ;
     · en l'air : un gain entre un 'decol' et sa 'pose' ou sa 'mort' (les evenements, pas les echantillons) ;
     · route au sol : le reste.
   Les km : avance le long de la route ('s'), entre deux echantillons de la meme route ; « de sol » si les deux echantillons sont au sol (m = 0).
   LE PALIER est refait comme le jeu le tient : la somme des gains, MAIS a la reprise d'une seconde chance on repart des pieces du 2e morceau
   (fin.pieces - gains d'apres la reprise) : la reprise retire un palier (gameplay/seconde-chance.js:188). Les compteurs, eux, sommaient tout.
   Controles : (1) somme des sources = somme des 'piece' = fin.pieces (hors seconde chance) ; (2) poses payees de plus de 18 pieces dans l'image ;
   (3) l'ecart a duree egale (coupe a 60, 120, 180 s ; parties qui vivent jusque-la), a palier egal, sans les parties a seconde chance, sans une partie.
   Joueurs : ml/bot/etalon (partiesJoueurs, finVraie). c0025 : ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (20 parties).
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/relecteur/recompte.js  -> sortie-recompte.txt */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),M=require(path.join(RAC,'ml','bot','mesures.js'));
const lus=fs.readdirSync(path.join(RAC,'ml','bot','etalon')).filter(f=>f.endsWith('.json')).sort().map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml','bot','etalon',f),'utf8'))}));
const J=M.partiesJoueurs(lus).parties.map(M.finVraie);
const B=JSON.parse(fs.readFileSync(path.join(RAC,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8')).parties.map(p=>M.finVraie(p.partie));
const out=[],f0=x=>x==null||x!==x?'-':Math.round(x)+'',f1=x=>x==null||x!==x?'-':x.toFixed(1),f2=x=>x==null||x!==x?'-':x.toFixed(2);

/* une partie -> une liste de tranches de 0,1 s environ : {t, dt, sol, kmSol, kmAir, route, air, fig, pal} + les controles */
function decoupe(c){
  const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,ev=c.ev,g=(e,n)=>e[col[n]];
  const fpT=new Map();for(const e of ev)if(e[1]==='figure_payee')fpT.set(e[0],(fpT.get(e[0])||0)+(e[2]|0));
  const vols=[];let d=null;for(const e of ev){if(e[1]==='decol')d=e[0];else if((e[1]==='pose'||e[1]==='mort')&&d!=null){vols.push([d,e[0]]);d=null;}}
  const enVol=t=>vols.some(v=>t>v[0]&&t<=v[1]+1e-9);
  const tSC=(ev.find(e=>e[1]==='seconde_chance')||[null])[0];
  const P=ev.filter(e=>e[1]==='piece');const apresSC=tSC==null?0:P.filter(e=>e[0]>tSC).reduce((a,e)=>a+(e[2]|0),0);
  const repart=tSC==null?null:(c.fin.pieces|0)-apresSC; /* les pieces de la caisse a la reprise */
  /* les gains, chacun avec sa source et le palier du moment (avant le gain) */
  let cum=0,scFait=false;const G=[];let gros=0,payeesSans=0;
  for(const e of P){if(tSC!=null&&!scFait&&e[0]>tSC){cum=repart;scFait=true;}
    const n=e[2]|0,src=fpT.has(e[0])?'fig':enVol(e[0])?'air':'route';
    if(src==='fig'&&n>18*fpT.get(e[0]))gros++;
    G.push({t:e[0],n,src,pal:M.palierDe(cum)});cum+=n;}
  for(const [t] of fpT)if(!P.some(e=>e[0]===t))payeesSans++;
  /* les tranches : chaque echantillon porte le temps depuis le precedent et les gains d'ici au suivant */
  const T=[];let ig=0;
  for(let j=0;j<E.length;j++){const e=E[j],t=g(e,'t'),dt=j?Math.min(.25,t-g(E[j-1],'t')):0,sol=g(e,'m')===0;
    let ds=0;if(j&&g(e,'r')===g(E[j-1],'r')){const x=g(e,'s')-g(E[j-1],'s');if(x>0&&x<400)ds=x/1000;}
    const solP=j&&g(E[j-1],'m')===0&&sol;
    const a={t,dt,sol,r:Math.min(3,g(e,'r')),kmSol:solP?ds:0,kmAir:solP?0:ds,route:0,air:0,fig:0,pal:null,nit:sol&&g(e,'nit')?dt:0,dtSol:sol?dt:0};
    while(ig<G.length&&G[ig].t<=t){a[G[ig].src]+=G[ig].n;ig++;}
    T.push(a);}
  const reste={route:0,air:0,fig:0};while(ig<G.length){reste[G[ig].src]+=G[ig].n;ig++;}
  /* le palier de chaque tranche : celui du dernier gain avant elle (refait avec la reprise) */
  let c2=0,sc3=false,i2=0;for(const a of T){while(i2<G.length&&G[i2].t<=a.t){if(tSC!=null&&!sc3&&G[i2].t>tSC){c2=repart;sc3=true;}c2+=G[i2].n;i2++;}a.pal=M.palierDe(c2);}
  const somme=G.reduce((x,y)=>x+y.n,0),parSrc={route:0,air:0,fig:0};for(const x of G)parSrc[x.src]+=x.n;
  return {c,T,reste,somme,parSrc,fin:c.fin.pieces|0,sommet:Math.max(c.fin.pieces|0,c.pieces_max|0),sc:tSC!=null,repris:tSC==null?0:somme-(c.fin.pieces|0),gros,payeesSans,
    nPay:[...fpT.values()].reduce((a,b)=>a+b,0),dur:c.fin.t,palFin:M.palierDe(Math.max(c.fin.pieces|0,c.pieces_max|0))};}
const DJ=J.map(decoupe),DB=B.map(decoupe);

/* ---------- 1. les controles ---------- */
out.push('# Le recomptage du relecteur (joueurs : '+DJ.length+' parties ; c0025 : '+DB.length+' parties)');
out.push('\n## 1. Les controles, partie par partie');
out.push('| lot | partie | duree s | palier (sommet) | somme des gains | fin.pieces | ecart | seconde chance (pieces reprises) | sources route/air/figure | apres le dernier echantillon | figures payees sans piece | images de figure > 18 pieces par figure |');
out.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
for(const [nom,L] of [['J',DJ],['B',DB]])L.forEach((x,i)=>{const s=x.parSrc;
  out.push(`| ${nom} | ${i} | ${f1(x.dur)} | ${x.palFin} | ${x.somme} | ${x.fin} | ${x.somme-x.fin} | ${x.sc?'oui ('+x.repris+')':'non'} | ${s.route}/${s.air}/${s.fig} (somme ${s.route+s.air+s.fig}) | ${x.reste.route+x.reste.air+x.reste.fig} | ${x.payeesSans} | ${x.gros} |`);});

/* ---------- 2. le tableau de l'ecart, avec un filtre ---------- */
const Z=()=>({min:0,minSol:0,kmSol:0,kmAir:0,route:0,air:0,fig:0,nit:0,n:0}),ajoute=(a,q)=>{a.min+=q.dt/60;a.minSol+=q.dtSol/60;a.kmSol+=q.kmSol;a.kmAir+=q.kmAir;a.route+=q.route;a.air+=q.air;a.fig+=q.fig;a.nit+=q.nit/60;};
const MEMO=new Map(),MEMOP=new Map(); /* les sommes d'une partie pour un filtre, calculees une fois (le tirage reprend les memes parties) */
function part(x,filtre){let m=MEMO.get(filtre);if(!m)MEMO.set(filtre,m=new Map());let r=m.get(x);if(r)return r;r=Z();let vu=false;for(const q of x.T)if(filtre(q,x)){vu=true;ajoute(r,q);}r.n=vu?1:0;m.set(x,r);return r;}
function partPal(x,filtre){let m=MEMOP.get(filtre);if(!m)MEMOP.set(filtre,m=new Map());let r=m.get(x);if(r)return r;r=[];for(let k=0;k<=30;k++)r.push(Z());for(const q of x.T)if(filtre(q,x))ajoute(r[q.pal],q);m.set(x,r);return r;}
function finit(a){a.tot=(a.route+a.air+a.fig)/a.min;a.r=a.route/a.min;a.a=a.air/a.min;a.f=a.fig/a.min;a.fSol=a.minSol/a.min;a.vSol=a.kmSol/a.minSol;a.dSol=a.route/a.kmSol;a.km=(a.kmSol+a.kmAir)/a.min;a.nitP=a.nit/a.minSol;return a;}
function somme(parts){const a=Z();for(const r of parts){for(const k in a)a[k]+=r[k];}return finit(a);}
function agrege(L,filtre){return somme(L.map(x=>part(x,filtre)));}
function ligne(nom,L1,L2,filtre){const a=agrege(L1,filtre),b=agrege(L2,filtre),e=a.tot-b.tot;
  return `| ${nom} | ${a.n} / ${b.n} | ${f1(a.min)} / ${f1(b.min)} | ${f0(a.tot)} / ${f0(b.tot)} | ${f2(a.tot/b.tot)} | ${f0(e)} | ${f0(a.r-b.r)} (${f0(100*(a.r-b.r)/e)} %) | ${f0(a.a-b.a)} (${f0(100*(a.a-b.a)/e)} %) | ${f0(a.f-b.f)} (${f0(100*(a.f-b.f)/e)} %) | ${f2(a.vSol)} / ${f2(b.vSol)} | ${f1(a.dSol)} / ${f1(b.dSol)} | ${f0(100*a.fSol)} / ${f0(100*b.fSol)} | ${f0(100*a.nitP)} / ${f0(100*b.nitP)} |`;}
const TETE='| filtre | parties J / B | minutes J / B | pieces/min J / B | rapport | ecart | dont route au sol | dont en l\'air | dont figures | km de sol par min de sol J / B | route par km de sol J / B | % du temps au sol J / B | nitro au sol % J / B |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|';
const tout=()=>true,sansSC=(q,x)=>!x.sc,c180=q=>q.t<=180,c60=q=>q.t<=60,f60_180=q=>q.t>60&&q.t<=180;
out.push('\n## 2. L\'ecart, par source, sous plusieurs filtres (pieces par minute vecue dans le filtre)');out.push(TETE);
out.push(ligne('tout',DJ,DB,tout));
out.push(ligne('sans les parties a seconde chance (2 J, 2 B)',DJ,DB,sansSC));
out.push(ligne('sans les seules 2 parties J a seconde chance',DJ,DB,(q,x)=>DJ.includes(x)?!x.sc:true));
for(const T of [60,120,180])out.push(ligne('chaque partie coupee a '+T+' s (toutes)',DJ,DB,q=>q.t<=T));
for(const [a,b] of [[0,60],[60,120],[120,180],[180,1e9]])out.push(ligne('fenetre '+a+'-'+(b>1e8?'fin':b)+' s',DJ,DB,q=>q.t>a&&q.t<=b));
/* a duree egale, sur des parties qui vivent : on ne garde que les parties qui depassent T, coupees a T */
for(const T of [120,180])out.push(ligne('parties de plus de '+T+' s, coupees a '+T+' s',DJ,DB,(q,x)=>x.dur>=T&&q.t<=T));
for(const [a,b] of [[1,4],[5,8],[9,12],[13,30]])out.push(ligne('palier courant '+a+'-'+b,DJ,DB,q=>q.pal>=a&&q.pal<=b));
out.push(ligne('palier courant 1-12, coupe a 180 s',DJ,DB,q=>q.pal<=12&&q.t<=180));

/* ---------- 3. a palier egal, standardise : les joueurs ramenes aux minutes de c0025 par palier ---------- */
out.push('\n## 3. A palier egal (palier courant exact, les joueurs ponderes par les minutes de c0025 a chaque palier)');
function std(L1,L2,cle,filtre){let s=0,w=0,sb=0;const A=L1.map(x=>partPal(x,filtre)),Bq=L2.map(x=>partPal(x,filtre));
  for(let p=1;p<=30;p++){const a=somme(A.map(r=>r[p])),b=somme(Bq.map(r=>r[p]));if(!(a.min>.3)||!(b.min>0))continue;s+=b.min*a[cle];sb+=b.min*b[cle];w+=b.min;}return [s/w,sb/w,w];}
for(const [nom,f] of [['tout',tout],['coupe a 180 s',c180],['sans seconde chance',sansSC]]){
  const [a,b,w]=std(DJ,DB,'tot',f),[ar,br]=std(DJ,DB,'r',f),[af,bf]=std(DJ,DB,'f',f),[aa,ba]=std(DJ,DB,'a',f);
  out.push(`- ${nom} (${f1(w)} min de c0025 aux paliers ou les joueurs ont plus de 0,3 min) : pieces/min J ${f0(a)} / B ${f0(b)} = x${f2(a/b)} ; route au sol ${f0(ar)} / ${f0(br)} ; en l'air ${f0(aa)} / ${f0(ba)} ; figures ${f0(af)} / ${f0(bf)}`);}

/* ---------- 4. le poids de chaque partie : sans une partie de joueur, que devient le rapport ? ---------- */
out.push('\n## 4. Sans une partie de joueur (le rapport des pieces par minute, tout)');
const base=agrege(DJ,tout).tot/agrege(DB,tout).tot;out.push('- avec les 14 : x'+f2(base));
const L1=DJ.map((x,i)=>({i,d:x.dur,p:x.palFin,r:agrege(DJ.filter(y=>y!==x),tout).tot/agrege(DB,tout).tot}));
for(const z of L1.sort((a,b)=>a.r-b.r).slice(0,4))out.push(`- sans J${z.i} (${f0(z.d)} s, palier ${z.p}) : x${f2(z.r)}`);
const sans2=agrege(DJ.filter(x=>x.dur<390),tout).tot/agrege(DB,tout).tot;out.push('- sans les deux plus longues (396 et 545 s) : x'+f2(sans2));

/* ---------- 5. les intervalles (tirage des parties, 2 000 fois) ---------- */
function rnd(s){let x=s>>>0;return ()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
const rr=rnd(28112026),NB=2000;
function ic(f){const V=[];for(let b=0;b<NB;b++){const a=DJ.map(()=>DJ[(rr()*DJ.length)|0]),c=DB.map(()=>DB[(rr()*DB.length)|0]);V.push(f(a,c));}
  const A=V.filter(x=>x===x&&isFinite(x)).sort((a,b)=>a-b);return '['+f2(A[Math.floor(.025*A.length)])+' ; '+f2(A[Math.floor(.975*A.length)])+']';}
out.push('\n## 5. Intervalles a 95 % (tirage des parties avec remise, '+NB+' fois)');
const R=(F,k)=>(a,c)=>agrege(a,F)[k]/agrege(c,F)[k];
for(const [nom,F] of [['tout',tout],['coupe a 180 s',c180],['fenetre 0-60 s',c60],['fenetre 60-180 s',f60_180],['sans seconde chance',sansSC]]){
  out.push(`- ${nom} : pieces/min x${f2(agrege(DJ,F).tot/agrege(DB,F).tot)} ${ic(R(F,'tot'))} ; route au sol x${f2(agrege(DJ,F).r/agrege(DB,F).r)} ${ic(R(F,'r'))} ; km de sol par min de sol ${ic(R(F,'vSol'))} ; route par km de sol ${ic(R(F,'dSol'))} ; part des figures dans l'ecart ${ic((a,c)=>{const x=agrege(a,F),y=agrege(c,F);return (x.f-y.f)/(x.tot-y.tot);})}`);}
out.push(`- a palier egal (tout) : ${ic((a,c)=>{const [x,y]=std(a,c,'tot',tout);return x/y;})} ; a palier egal coupe a 180 s : ${ic((a,c)=>{const [x,y]=std(a,c,'tot',c180);return x/y;})}`);

/* ---------- 6. le partage « route au sol » : temps au sol x vitesse de sol x densite de sol (logarithme), coupe a 180 s et tout ---------- */
out.push('\n## 6. La route au sol = part du temps au sol x km de sol par minute de sol x pieces par km de sol (partage par logarithme)');
for(const [nom,F] of [['tout',tout],['coupe a 180 s',q=>q.t<=180],['palier courant 1-12',q=>q.pal<=12]]){const a=agrege(DJ,F),b=agrege(DB,F),l=Math.log(a.r/b.r),e=a.tot-b.tot,es=a.r-b.r;
  const p=k=>es*Math.log(a[k]/b[k])/l;
  out.push(`- ${nom} : ecart total ${f0(e)} ; route au sol ${f0(es)} = temps au sol ${f0(p('fSol'))} + vitesse de sol ${f0(p('vSol'))} (x${f2(a.vSol/b.vSol)}) + densite de sol ${f0(p('dSol'))} (x${f2(a.dSol/b.dSol)}) ; en l'air ${f0(a.a-b.a)} ; figures ${f0(a.f-b.f)} ; km en tout par minute ${f2(a.km)} / ${f2(b.km)}`);}


/* ---------- 7. la densite de sol : a zone egale (portails franchis) et a palier egal ---------- */
out.push('\n## 7. Pieces de route par km de sol, par zone (r = portails franchis, 3 = 3 et plus) et a zone egale');
out.push('| zone | km de sol J / B | route par km de sol J / B | rapport |');out.push('|---|---|---|---|');
const ZF=[0,1,2,3].map(z=>(q=>q.r===z));
ZF.forEach((F,z)=>{const a=agrege(DJ,F),b=agrege(DB,F);out.push(`| ${z} | ${f0(a.kmSol)} / ${f0(b.kmSol)} | ${f1(a.dSol)} / ${f1(b.dSol)} | ${f2(a.dSol/b.dSol)} |`);});
function stdZ(L1,L2){let s=0,w=0,sb=0;for(const F of ZF){const a=agrege(L1,F),b=agrege(L2,F);if(!(a.kmSol>2)||!(b.kmSol>0))continue;s+=b.kmSol*a.dSol;sb+=b.kmSol*b.dSol;w+=b.kmSol;}return s/sb;}
const dz=stdZ(DJ,DB),dt=agrege(DJ,tout).dSol/agrege(DB,tout).dSol;
out.push('- a zone egale (joueurs ponderes par les km de sol de c0025 dans chaque zone) : x'+f2(dz)+' '+ic((a,c)=>stdZ(a,c))+' ; tel quel x'+f2(dt)+' ; part du melange des zones dans le rapport (logarithme) : '+f0(100*Math.log(dt/dz)/Math.log(dt))+' %');
function stdP(L1,L2,F0){let s=0,sb=0;const A=L1.map(x=>partPal(x,F0)),Bq=L2.map(x=>partPal(x,F0));for(let p=1;p<=30;p++){const a=somme(A.map(r=>r[p])),b=somme(Bq.map(r=>r[p]));if(!(a.kmSol>2)||!(b.kmSol>0))continue;s+=b.kmSol*a.dSol;sb+=b.kmSol*b.dSol;}return s/sb;}
out.push('- a palier egal (km de sol de c0025 par palier exact) : x'+f2(stdP(DJ,DB,tout))+' '+ic((a,c)=>stdP(a,c,tout)));
function stdV(L1,L2,F0){let s=0,sb=0;const A=L1.map(x=>partPal(x,F0)),Bq=L2.map(x=>partPal(x,F0));for(let p=1;p<=30;p++){const a=somme(A.map(r=>r[p])),b=somme(Bq.map(r=>r[p]));if(!(a.minSol>.3)||!(b.minSol>0))continue;s+=b.minSol*a.vSol;sb+=b.minSol*b.vSol;}return s/sb;}
out.push('- vitesse de sol a palier egal : x'+f2(stdV(DJ,DB,tout))+' '+ic((a,c)=>stdV(a,c,tout))+' ; coupe a 180 s : x'+f2(stdV(DJ,DB,c180))+' '+ic((a,c)=>stdV(a,c,c180)));

fs.writeFileSync(path.join(__dirname,'sortie-recompte.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
