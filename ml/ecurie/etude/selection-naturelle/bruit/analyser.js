/* analyser.js : le bruit des notes (lit courses-0.json fait par extraire.js, et relit les 4 notes de 900 s pour couper leurs courses a 300 s).
   usage : node analyser.js > resultats.txt */
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','..');
const R=require(path.join(D,'..','..','..','bot','ressemblance.js')),{palierDe}=require(path.join(D,'..','..','..','bot','mesures.js'));
const X=JSON.parse(fs.readFileSync(path.join(__dirname,'courses-0.json'),'utf8'));
const REF=R.reference(R.joueurs('clavier'));
const med=A=>{A=A.filter(x=>x!=null&&x===x).slice().sort((a,b)=>a-b);const n=A.length;return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):null;};
const moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:NaN;
const vari=A=>{const m=moy(A);return A.reduce((a,b)=>a+(b-m)*(b-m),0)/(A.length-1);};
const sd=A=>Math.sqrt(vari(A));
const cor=(A,B)=>{const ma=moy(A),mb=moy(B);let s=0,sa=0,sb=0;for(let i=0;i<A.length;i++){s+=(A[i]-ma)*(B[i]-mb);sa+=(A[i]-ma)**2;sb+=(B[i]-mb)**2;}return s/Math.sqrt(sa*sb);};
const rang=A=>{const I=A.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=new Array(A.length);I.forEach((p,k)=>r[p[1]]=k);return r;};
const spear=(A,B)=>cor(rang(A),rang(B));
const f2=x=>x==null||x!==x?'  -  ':(Math.abs(x)>=100?x.toFixed(0):Math.abs(x)>=10?x.toFixed(1):x.toFixed(2));
let rnd=12345;const alea=()=>{rnd=(rnd*1103515245+12345)%2147483648;return rnd/2147483648;};
const out=[];const dire=s=>{out.push(s);console.log(s);};

/* ===== LES STATISTIQUES D'UN LOT (une liste de courses) ===== */
const ecartDe=C=>{const M=C.map(c=>c.m).filter(Boolean);if(!M.length)return NaN;const E=R.ecart(null,{mesures:M,reference:REF});return E?E.ecart:NaN;};
const LOT={
  palier_median:C=>med(C.map(c=>c.palier)),
  palier_moyen:C=>moy(C.map(c=>c.palier)),
  somme_paliers:C=>C.reduce((a,c)=>a+c.palier,0),
  survie_mediane:C=>med(C.map(c=>c.duree_s)),
  survie_moyenne:C=>moy(C.map(c=>c.duree_s)),
  pieces_min:C=>60*C.reduce((a,c)=>a+c.pieces,0)/C.reduce((a,c)=>a+c.duree_s,0),
  distance_min:C=>60*C.reduce((a,c)=>a+c.distance_m,0)/C.reduce((a,c)=>a+c.duree_s,0),
  morts_100vols:C=>100*C.reduce((a,c)=>a+(c.morts_en_vol|0),0)/Math.max(1,C.reduce((a,c)=>a+(c.vols|0),0)),
  log_palier:C=>moy(C.map(c=>Math.log(c.palier))),
  coupees_pct:C=>100*C.filter(c=>c.cause==='temps').length/C.length,
  ecart:ecartDe,
  mixte:C=>med(C.map(c=>c.palier))-6*ecartDe(C),
  mixte_moyen:C=>moy(C.map(c=>c.palier))-6*ecartDe(C)};
const PARCOURSE={palier:c=>c.palier,log_palier:c=>Math.log(c.palier),survie:c=>c.duree_s,pieces:c=>c.pieces,pieces_min:c=>60*c.pieces/c.duree_s,
  distance:c=>c.distance_m,distance_min:c=>60*c.distance_m/c.duree_s,morts_vol:c=>c.morts_en_vol|0,vols_min:c=>60*(c.vols|0)/c.duree_s,coupee:c=>c.cause==='temps'?1:0};

/* les pilotes : par empreinte du fichier, avec leurs deux lots de 300 s */
const P={};for(const x of X){const k=x.sha;P[k]=P[k]||{nom:[],l1:null,l2:null,t9:null};P[k].nom.push(x.fichier.replace(/\.json$/,''));
  if(x.tmax===900)P[k].t9=x;else if(x.graines.depart===910000)P[k].l1=x;else P[k].l2=x;}
const tous=Object.values(P),deux=tous.filter(p=>p.l1&&p.l2);
const S1=tous.filter(p=>p.l1)[0].l1.courses.map(c=>c.graine),S2=deux[0].l2.courses.map(c=>c.graine);
dire(`DONNEES : ${X.length} fichiers, ${tous.length} pilotes distincts (empreinte du fichier), ${tous.filter(p=>p.l1).length} avec le lot 910000, ${tous.filter(p=>p.l2).length} avec le lot 930000, ${deux.length} avec les deux, ${tous.filter(p=>p.t9).length} avec une note de 900 s.`);
for(const p of deux)for(const [L,S] of [[p.l1,S1],[p.l2,S2]])if(L.courses.map(c=>c.graine).join()!==S.join())throw new Error('graines differentes '+p.nom);

/* ===== 0. DETERMINISME : la course de 900 s et la course de 300 s d'un meme pilote sur une meme graine ===== */
dire('\n== 0. DETERMINISME (meme pilote, meme graine : 300 s contre les 12 premieres graines de 900 s) ==');
const T9={};
for(const p of tous.filter(p=>p.t9)){
  const j=JSON.parse(fs.readFileSync(path.join(D,p.t9.fichier),'utf8'));
  p.t9.courses.forEach((c,i)=>{const pa=j.parties[i].partie;let s=0;const ev=(pa.ev||[]).filter(e=>e[1]==='piece');
    c.coupe={};for(const T of [300,600]){s=ev.filter(e=>e[0]<=T).reduce((a,e)=>a+(e[2]|0),0);c.coupe[T]={palier:c.duree_s<=T?c.palier:palierDe(s),duree_s:Math.min(T,c.duree_s)};}
    c.sommeEv=ev.reduce((a,e)=>a+(e[2]|0),0);});
  let pareil=0,diff=0,morts=0,txt=[];
  if(p.l1)p.l1.courses.forEach((c,i)=>{const d=p.t9.courses[i];if(d.graine!==c.graine)return;
    if(c.duree_s<299&&d.duree_s<299){morts++;if(c.palier===d.palier&&Math.abs(c.duree_s-d.duree_s)<.2)pareil++;else{diff++;txt.push(`${c.graine}: 300s ${c.palier}/${c.duree_s}s, 900s ${d.palier}/${d.duree_s}s`);}}
    else txt.push(`${c.graine}: 300s ${c.palier}/${c.duree_s}s coupee=${c.cause} -> 900s coupee a 300 : palier ${d.coupe[300].palier} (fin ${d.palier} a ${d.duree_s}s)`);});
  const ecEv=p.t9.courses.filter(c=>palierDe(c.sommeEv)!==c.palier).length;
  dire(`${p.nom.join('/')} : ${morts} courses finies avant 300 s dans les deux notes, ${pareil} identiques, ${diff} differentes ; palier reconstruit des evenements "piece" different du bilan sur ${ecEv}/20 courses`);
  txt.forEach(t=>dire('   '+t));}

/* ===== 1. LE BRUIT D'UN LOT A L'AUTRE, MEME PILOTE ===== */
dire('\n== 1. BRUIT D\'UN LOT DE 12 COURSES DE 300 S A L\'AUTRE, MEME PILOTE ('+deux.length+' pilotes, lots 910000 et 930000) ==');
dire('stat              | moy lot1 | moy lot2 | decalage moyen (graines) | ET lot->lot (d centre)/V2 | ET bootstrap 12 graines (meme pilote) | corr lot1/lot2 entre pilotes (Pearson / Spearman)');
const boot=(C,n)=>{const r=[];for(let i=0;i<n;i++)r.push(C[Math.floor(alea()*C.length)]);return r;};
const RES1={};
for(const k in LOT){
  const a=deux.map(p=>LOT[k](p.l1.courses)),b=deux.map(p=>LOT[k](p.l2.courses)),d=a.map((x,i)=>x-b[i]);
  const etLot=sd(d)/Math.SQRT2;
  /* bootstrap : 24 courses du pilote (les deux lots), tirages de 12 avec remise */
  const eb=moy(deux.map(p=>{const C=p.l1.courses.concat(p.l2.courses),v=[];for(let i=0;i<150;i++)v.push(LOT[k](boot(C,12)));return sd(v.filter(x=>x===x));}));
  RES1[k]={etLot,eb,r:cor(a,b)};
  dire(`${k.padEnd(17)} | ${f2(moy(a)).padStart(8)} | ${f2(moy(b)).padStart(8)} | ${f2(moy(d)).padStart(8)} | ${f2(etLot).padStart(8)} | ${f2(eb).padStart(8)} | ${f2(cor(a,b))} / ${f2(spear(a,b))}  (ET entre pilotes lot1 ${f2(sd(a))})`);}

/* ===== 2. ANOVA PAR COURSE : pilote x graine (24 graines, pilotes aux deux lots) ===== */
dire('\n== 2. CE QUE LES GRAINES COMMUNES APPORTENT (analyse de variance pilote x graine, '+deux.length+' pilotes x 24 graines, une course par case) ==');
dire('stat par course   | ET totale | ET graine | ET pilote | ET residu | rho (2 pilotes, meme graine) | variance de la difference : graines communes / graines differentes | courses pour 1 ET pilote a 80 % (communes / differentes)');
const RES2={};
function anova(M){const Pn=M.length,Sn=M[0].length,g=moy(M.flat()),rm=M.map(moy),cm=M[0].map((_,j)=>moy(M.map(r=>r[j])));
  let ssr=0;for(let i=0;i<Pn;i++)for(let j=0;j<Sn;j++)ssr+=(M[i][j]-rm[i]-cm[j]+g)**2;
  const msr=ssr/((Pn-1)*(Sn-1)),msp=Sn*rm.reduce((a,x)=>a+(x-g)**2,0)/(Pn-1),mss=Pn*cm.reduce((a,x)=>a+(x-g)**2,0)/(Sn-1);
  return {res:msr,pil:Math.max(0,(msp-msr)/Sn),gr:Math.max(0,(mss-msr)/Pn),tot:vari(M.flat())};}
for(const k in PARCOURSE){
  const M=deux.map(p=>p.l1.courses.concat(p.l2.courses).map(PARCOURSE[k]));const A=anova(M);
  const rho=A.gr/(A.gr+A.res),vc=2*A.res,vi=2*(A.gr+A.res);
  const nC=A.pil>0?Math.ceil(6.18*vc/A.pil):Infinity,nI=A.pil>0?Math.ceil(6.18*vi/A.pil):Infinity;
  RES2[k]=A;
  dire(`${k.padEnd(17)} | ${f2(Math.sqrt(A.tot)).padStart(8)} | ${f2(Math.sqrt(A.gr)).padStart(8)} | ${f2(Math.sqrt(A.pil)).padStart(8)} | ${f2(Math.sqrt(A.res)).padStart(8)} | ${f2(rho)} | ${f2(vc/vi)} | ${nC} / ${nI}`);}
dire('(« courses pour 1 ET pilote » : nombre de graines pour voir, une fois sur 1,25 au moins (80 %, seuil unilateral 5 %), une difference de UN ecart-type de la dispersion VRAIE entre ces variantes)');

/* verification au niveau du lot : la difference entre deux pilotes, mesuree dans le lot 1 puis le lot 2 */
dire('\n-- la difference entre deux pilotes se repete-t-elle d\'un lot a l\'autre ? (toutes les paires parmi les '+deux.length+' pilotes) --');
dire('stat du lot      | ET du bruit de la difference, graines communes (lot1 vs lot2) | ET du bruit, graines differentes (bootstrap) | corr(diff lot1, diff lot2)');
const RES2b={};
for(const k of ['palier_median','somme_paliers','palier_moyen','survie_mediane','pieces_min','distance_min','morts_100vols','log_palier','ecart','mixte','mixte_moyen']){
  const a=deux.map(p=>LOT[k](p.l1.courses)),b=deux.map(p=>LOT[k](p.l2.courses));const D1=[],D2=[];
  for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){D1.push(a[i]-a[j]);D2.push(b[i]-b[j]);}
  const etc=Math.sqrt(moy(D1.map((x,i)=>(x-D2[i])**2))/2);
  /* bootstrap sur 60 paires tirees : graines communes (meme tirage) contre graines independantes */
  const vc=[],vi=[];for(let q=0;q<60;q++){const i=Math.floor(alea()*deux.length);let j=Math.floor(alea()*deux.length);if(j===i)j=(j+1)%deux.length;
    const Ci=deux[i].l1.courses.concat(deux[i].l2.courses),Cj=deux[j].l1.courses.concat(deux[j].l2.courses),c=[],u=[];
    for(let t=0;t<120;t++){const I=[],J=[];for(let s=0;s<12;s++){I.push(Math.floor(alea()*24));J.push(Math.floor(alea()*24));}
      c.push(LOT[k](I.map(x=>Ci[x]))-LOT[k](I.map(x=>Cj[x])));u.push(LOT[k](I.map(x=>Ci[x]))-LOT[k](J.map(x=>Cj[x])));}
    vc.push(vari(c.filter(x=>x===x)));vi.push(vari(u.filter(x=>x===x)));}
  RES2b[k]={etc,ebc:Math.sqrt(moy(vc)),ebi:Math.sqrt(moy(vi)),r:cor(D1,D2)};
  dire(`${k.padEnd(16)} | ${f2(etc).padStart(6)} (bootstrap ${f2(Math.sqrt(moy(vc)))}) | ${f2(Math.sqrt(moy(vi))).padStart(6)} | ${f2(cor(D1,D2))}`);}

/* ===== 3. QUELLE STATISTIQUE CLASSE LE MIEUX ===== */
dire('\n== 3. FIABILITE POUR CLASSER (test-retest entre pilotes, lot 910000 contre lot 930000) et LIEN AVEC LE PALIER ==');
dire('stat du lot      | fiabilite r (Spearman) | signal/bruit sqrt(r/(1-r)) | corr avec le palier moyen de l\'AUTRE lot | corr avec l\'ecart de l\'autre lot');
for(const k in LOT){const a=deux.map(p=>LOT[k](p.l1.courses)),b=deux.map(p=>LOT[k](p.l2.courses));
  const r=cor(a,b),pa=deux.map(p=>LOT.palier_moyen(p.l2.courses)),pb=deux.map(p=>LOT.palier_moyen(p.l1.courses)),ea=deux.map(p=>LOT.ecart(p.l2.courses)),eb=deux.map(p=>LOT.ecart(p.l1.courses));
  dire(`${k.padEnd(16)} | ${f2(r)} (${f2(spear(a,b))}) | ${r>0?f2(Math.sqrt(r/(1-r))):'0'} | ${f2((cor(a,pa)+cor(b,pb))/2)} | ${f2((cor(a,ea)+cor(b,eb))/2)}`);}
dire('les 15 mesures de ressemblance, une par une (moyenne du lot ; fiabilite lot1/lot2 et part du bruit) :');
for(const [k,nom] of R.MESURES){const f=C=>moy(C.map(c=>c.m&&c.m[k]).filter(x=>x!=null&&x===x));const a=deux.map(p=>f(p.l1.courses)),b=deux.map(p=>f(p.l2.courses));
  const z=x=>REF[k]?(x-REF[k].m)/REF[k].s:NaN;const za=a.map(z),zb=b.map(z);
  dire(`  ${nom.padEnd(48)} r ${f2(cor(a,b))} · z moyen ${f2(moy(za))} · ET du z d'un lot a l'autre ${f2(sd(za.map((x,i)=>x-zb[i]))/Math.SQRT2)} · ET du z entre pilotes ${f2(sd(za))}`);}

/* ===== 4. PUISSANCE : combien de courses ===== */
dire('\n== 4. COMBIEN DE COURSES POUR VOIR +1 PALIER MEDIAN OU -0,2 D\'ECART (80 %, unilateral 5 % : (1,645+0,842)^2 = 6,18) ==');
const n80=(et12,delta)=>Math.ceil(12*6.18*et12*et12/(delta*delta));
for(const [k,dl] of [['palier_median',1],['palier_moyen',1],['somme_paliers',12],['ecart',.2],['mixte',1],['mixte_moyen',1]]){const r=RES2b[k];
  dire(`${k.padEnd(14)} delta ${dl} : ET de la difference sur 12 courses = ${f2(r.etc)} (communes) / ${f2(r.ebi)} (differentes) -> ${n80(r.etc,dl)} courses par pilote (communes), ${n80(r.ebi,dl)} (differentes)`);}
/* 300 s contre 900 s : les 4 pilotes notes a 900 s, coupes a 300 s */
const N9=tous.filter(p=>p.t9);
dire('\n-- 300 s contre 900 s : '+N9.length+' pilotes x 20 graines, les memes courses coupees a 300 s et a 600 s --');
for(const T of [300,600,900]){
  const C=p=>p.t9.courses.map(c=>T===900?{palier:c.palier,duree_s:c.duree_s}:c.coupe[T]);
  const M=N9.map(p=>C(p).map(c=>c.palier));const A=anova(M);
  const cout=moy(N9.flatMap(p=>C(p).map(c=>c.duree_s)));
  const pm=N9.map(p=>med(C(p).map(c=>c.palier))),pmoy=N9.map(p=>moy(C(p).map(c=>c.palier)));
  /* bootstrap des paires : ET de la difference de palier median sur 12 courses communes */
  const v=[];for(let i=0;i<N9.length;i++)for(let j=i+1;j<N9.length;j++){const a=C(N9[i]),b=C(N9[j]),d=[];for(let t=0;t<300;t++){const I=[];for(let s=0;s<12;s++)I.push(Math.floor(alea()*20));d.push(med(I.map(x=>a[x].palier))-med(I.map(x=>b[x].palier)));}v.push(vari(d));}
  const etd=Math.sqrt(moy(v));
  dire(`coupe a ${T} s : cout moyen d'une course ${f2(cout)} s de jeu · palier median par pilote ${pm.join(' ')} · palier moyen ${pmoy.map(f2).join(' ')} · ET residu par course ${f2(Math.sqrt(A.res))} · ET graine ${f2(Math.sqrt(A.gr))} · ET pilote ${f2(Math.sqrt(A.pil))} · ET de la diff. de palier median sur 12 courses communes ${f2(etd)} -> ${n80(etd,1)} courses pour +1 palier median (soit ${f2(n80(etd,1)*cout/60)} min de jeu par pilote)`);}
dire('correlation, course par course (80 courses), du palier a 300 s avec le palier final a 900 s : '+f2(cor(N9.flatMap(p=>p.t9.courses.map(c=>c.coupe[300].palier)),N9.flatMap(p=>p.t9.courses.map(c=>c.palier)))));
dire('part des courses de 900 s encore en vie a 300 s : '+f2(100*moy(N9.flatMap(p=>p.t9.courses.map(c=>c.duree_s>300?1:0))))+' % ; a 600 s : '+f2(100*moy(N9.flatMap(p=>p.t9.courses.map(c=>c.duree_s>600?1:0))))+' %');
dire('courses coupees (encore en vie) a 300 s dans les lots de 300 s : '+f2(moy(deux.map(p=>LOT.coupees_pct(p.l1.courses.concat(p.l2.courses)))))+' %');

/* ===== 5. LA RESSEMBLANCE SUR 12 COURSES DE 300 S ===== */
dire('\n== 5. LA RESSEMBLANCE : STABLE SUR 12 COURSES DE 300 S ? ==');
const nM=tous.flatMap(p=>[p.l1,p.l2].filter(Boolean).map(L=>L.courses.filter(c=>c.m).length));
dire(`parties de plus de ${60} s (MIN_S) par lot de 12 : min ${Math.min(...nM)}, mediane ${med(nM)}, max ${Math.max(...nM)} (moyenne ${f2(moy(nM))})`);
const e12=deux.map(p=>(LOT.ecart(p.l1.courses)+LOT.ecart(p.l2.courses))/2),e24=deux.map(p=>LOT.ecart(p.l1.courses.concat(p.l2.courses)));
dire(`biais de taille : ecart moyen sur 12 courses ${f2(moy(e12))} contre ${f2(moy(e24))} sur 24 (le bruit des moyennes gonfle les |z|)`);
for(const n of [6,12,24,48]){const v=[];for(const p of deux){const C=p.l1.courses.concat(p.l2.courses),e=[];for(let t=0;t<150;t++)e.push(LOT.ecart(boot(C,n)));v.push(sd(e.filter(x=>x===x)));}
  dire(`  ET bootstrap de l'ecart, ${n} courses de 300 s : ${f2(moy(v))}`);}
if(N9.length){const v=[];for(const p of N9){const C=p.t9.courses,e=[];for(let t=0;t<150;t++)e.push(LOT.ecart(boot(C,12)));v.push(sd(e.filter(x=>x===x)));}
  dire(`  ET bootstrap de l'ecart, 12 courses de 900 s (${N9.length} pilotes) : ${f2(moy(v))} ; ecart sur les 20 courses : ${N9.map(p=>f2(LOT.ecart(p.t9.courses))).join(' ')} ; sur leurs 24 courses de 300 s : ${N9.filter(p=>p.l1&&p.l2).map(p=>f2(LOT.ecart(p.l1.courses.concat(p.l2.courses)))).join(' ')}`);}
fs.writeFileSync(path.join(__dirname,'resultats.txt'),out.join('\n')+'\n');
