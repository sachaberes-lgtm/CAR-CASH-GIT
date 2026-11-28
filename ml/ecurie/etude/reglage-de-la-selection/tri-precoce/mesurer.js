/* ===== TRI PRECOCE : CE QUE DISENT LES VRAIES COURSES (27/11/2026, etude « tri-precoce » : « faut-il jouer les 12 graines d'un enfant visiblement rate ? ») =====
   Lit la copie figee de la vraie evolution (donnees/, copiee le 27/11 a 23:16, 566 lignes de courses : generation 0 finie, generation 1 presque finie)
   et mesure, sans jouer aucune course, les nombres dont le simulateur (simuler.js) a besoin :
   A. la note de la generation 0 (note.js tel quel : a, â, E, F de chaque pilote) et la dispersion vraie entre pilotes ;
   B. le test-retest des 20 anciens : note sur les 12 graines de la generation 0 contre note sur les graines de la generation 1 ;
   C. les residus du modele pilote + graine (generations 0 et 1), ranges dans residus.json pour le simulateur ;
   D. l'heredite du « bruit » : un mutant refait-il la MEME course que le temoin sur une graine (le jeu est deterministe) ?
   E. le temps reel d'une course selon son palier (un enfant rate fait des courses courtes : on economise moins de temps que de courses) ;
   F. le bruit de E selon le nombre de parties ;
   G. le tri precoce sur les vraies donnees : la moyenne des k premieres graines (dans l'ordre joue) predit-elle celle des 12 ?
   usage : node mesurer.js > mesures.txt   (ecrit aussi residus.json) */
'use strict';
const fs=require('fs'),path=require('path');
const N=require(path.join(__dirname,'..','..','..','..','evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','..','..','evolution','config.json'),'utf8'));
const L=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const REF=N.referenceEpoque();

const moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:NaN;
const vari=A=>{const m=moy(A);return A.reduce((a,b)=>a+(b-m)*(b-m),0)/(A.length-1);};
const sd=A=>Math.sqrt(vari(A));
const cor=(A,B)=>{const ma=moy(A),mb=moy(B);let s=0,sa=0,sb=0;for(let i=0;i<A.length;i++){s+=(A[i]-ma)*(B[i]-mb);sa+=(A[i]-ma)**2;sb+=(B[i]-mb)**2;}return s/Math.sqrt(sa*sb);};
const rang=A=>{const I=A.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=new Array(A.length);I.forEach((p,k)=>r[p[1]]=k);return r;};
const spear=(A,B)=>cor(rang(A),rang(B));
const f2=x=>x==null||x!==x?'  -  ':x.toFixed(2);
const dire=s=>console.log(s);

const ent=L.filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const g0=ent.filter(l=>l.generation===0),g1=ent.filter(l=>l.generation===1);
const temoin='19e3767cc346';
const ids0=[...new Set(g0.map(l=>l.id))];
const graines0=[...new Set(g0.map(l=>l.graine))];      /* dans l'ordre joue (l'ordonnanceur part graine par graine) */
const graines1=[...new Set(g1.map(l=>l.graine))];
dire('DONNEES : '+L.length+' lignes lues ; entrainement mesure : gen. 0 '+g0.length+' ('+ids0.length+' pilotes x '+graines0.length+' graines), gen. 1 '+g1.length+' lignes ('+new Set(g1.map(l=>l.id)).size+' pilotes, '+graines1.length+' graines entamees)');
dire('ordre des graines de la gen. 0 (l\'ordre ou elles ont ete jouees) : '+graines0.join(' '));

/* ===== A. LA NOTE DE LA GENERATION 0 ===== */
const n0=N.noter(g0,{REF,cfg,ids:ids0});
dire('\n== A. LA NOTE DE LA GENERATION 0 (note.js tel quel, 12 graines) ==');
dire('id           |    a  |  â    |  E   | se_E | parties |   F   | se_F');
for(const id of ids0.slice().sort((x,y)=>n0.par[y].F-n0.par[x].F)){const x=n0.par[id];
  dire(id+(id===temoin?'*':' ')+'| '+[x.a,x.ahat,x.E,x.se_E].map(f2).join(' | ')+' |   '+String(x.parties).padStart(2)+'    | '+f2(x.F).padStart(5)+' | '+f2(x.se_F));}
const A0=ids0.map(i=>n0.par[i].a),E0=ids0.map(i=>n0.par[i].E),F0=ids0.map(i=>n0.par[i].F),seE0=ids0.map(i=>n0.par[i].se_E);
const vBruitA=n0.sigmaRes**2/12;
dire('sigmaRes '+f2(n0.sigmaRes)+' ; ET des a entre pilotes '+f2(sd(A0))+' (bruit attendu sigma/sqrt12 = '+f2(Math.sqrt(vBruitA))+') -> ET VRAIE des a ~ '+f2(Math.sqrt(Math.max(0,vari(A0)-vBruitA))));
const vBruitE=moy(seE0.map(s=>s*s));
dire('ET des E entre pilotes '+f2(sd(E0))+' (bruit moyen se_E '+f2(Math.sqrt(vBruitE))+') -> ET VRAIE des E ~ '+f2(Math.sqrt(Math.max(0,vari(E0)-vBruitE)))+' ; x4 dans F : '+f2(4*Math.sqrt(Math.max(0,vari(E0)-vBruitE))));
dire('ET des F entre pilotes '+f2(sd(F0))+' ; corr(a, E) entre pilotes '+f2(cor(A0,E0)));

/* ===== B. TEST-RETEST DES ANCIENS (gen. 0 contre gen. 1, graines differentes) ===== */
const ids1=ids0.filter(i=>g1.filter(l=>l.id===i).length>=10);
const n1=N.noter(g1,{REF,cfg,ids:ids1});
const n01=N.noter(g0.concat(g1),{REF,cfg,ids:[...new Set(g0.concat(g1).map(l=>l.id))]});
dire('\n== B. TEST-RETEST : LES '+ids1.length+' ANCIENS NOTES SUR LA GEN. 0 PUIS SUR LA GEN. 1 (graines differentes, au moins 10 courses en gen. 1) ==');
const X=k=>[ids1.map(i=>n0.par[i][k]),ids1.map(i=>n1.par[i][k])];
for(const k of ['a','E','F']){const [u,v]=X(k);dire(k.padEnd(2)+' : corr gen0/gen1 Pearson '+f2(cor(u,v))+' Spearman '+f2(spear(u,v))+' ; ET gen0 '+f2(sd(u))+' gen1 '+f2(sd(v))+' ; ET de la difference '+f2(sd(u.map((x,j)=>x-v[j]))));}
{const [u,v]=X('F');const bas0=new Set(rang(u).map((r,j)=>r<6?ids1[j]:null).filter(Boolean)),bas1=new Set(rang(v).map((r,j)=>r<6?ids1[j]:null).filter(Boolean));
  dire('les 6 F les plus bas : '+[...bas0].filter(i=>bas1.has(i)).length+' en commun sur 6 entre gen0 et gen1 (au hasard : '+f2(36/ids1.length)+' attendus)');}

/* ===== C. LES RESIDUS DU MODELE PILOTE + GRAINE ===== */
const fit=N.ajuster(g0.concat(g1),{passes:10,retrecir:12});
const res=[];for(const l of g0.concat(g1))res.push(l.palier-fit.a[l.id]-fit.b[l.graine]);
const m2=moy(res.map(r=>r*r)),m4=moy(res.map(r=>r**4));
dire('\n== C. RESIDUS (gen. 0 + 1, '+res.length+' courses) ==');
dire('sigmaRes (ddl du modele) '+f2(fit.sigmaRes)+' ; ET brute des residus '+f2(Math.sqrt(m2))+' ; aplatissement '+f2(m4/(m2*m2))+' (3 = normal) ; ET des b (graines) '+f2(sd(Object.values(fit.b))));
const cent=res.map(r=>r*fit.sigmaRes/Math.sqrt(m2));   /* recentres a l'ET du modele (les residus bruts sont trop petits de N/ddl) */
const sortieRes={note:'residus du modele pilote + graine, gen. 0 et 1 de la vraie evolution, ramenes a sigmaRes ; lus par simuler.js',sigmaRes:fit.sigmaRes,
  etGraines:sd(Object.values(fit.b)),residus:cent.map(r=>Math.round(r*1000)/1000)};

/* ===== D. L'HEREDITE DU BRUIT : le mutant refait-il la course du temoin ? ===== */
dire('\n== D. HEREDITE : MUTANT ET TEMOIN SUR LA MEME GRAINE (gen. 0 et 1, le jeu est deterministe) ==');
const parPG=new Map();for(const l of g0.concat(g1))parPG.set(l.id+'|'+l.graine,l);
const resPG=new Map();for(const l of g0.concat(g1))resPG.set(l.id+'|'+l.graine,l.palier-fit.a[l.id]-fit.b[l.graine]);
let idem=0,tot=0,idemEmp=0;const rM=[],rT=[];
for(const id of ids0){if(id===temoin)continue;for(const g of graines0.concat(graines1)){const a=parPG.get(id+'|'+g),t=parPG.get(temoin+'|'+g);if(!a||!t)continue;
  tot++;if(a.palier===t.palier&&a.survie_s===t.survie_s)idem++;if(a.empreinte===t.empreinte)idemEmp++;rM.push(resPG.get(id+'|'+g));rT.push(resPG.get(temoin+'|'+g));}}
dire('courses mutant/temoin sur une meme graine : '+tot+' ; meme palier ET meme survie : '+idem+' ('+f2(100*idem/tot)+' %) ; meme empreinte : '+idemEmp);
dire('correlation des residus mutant / temoin, meme graine : '+f2(cor(rM,rT))+' (0 = bruit neuf ; 1 = la meme course)');
/* entre deux mutants de la gen. 0 (cousins) */
const rX=[],rY=[];let idemX=0,totX=0;
for(let i=0;i<ids0.length;i++)for(let j=i+1;j<ids0.length;j++){const p=ids0[i],q=ids0[j];if(p===temoin||q===temoin)continue;
  for(const g of graines0.concat(graines1)){const a=parPG.get(p+'|'+g),b=parPG.get(q+'|'+g);if(!a||!b)continue;totX++;if(a.palier===b.palier&&a.survie_s===b.survie_s)idemX++;rX.push(resPG.get(p+'|'+g));rY.push(resPG.get(q+'|'+g));}}
dire('entre deux mutants (cousins) : '+totX+' paires-courses, identiques '+f2(100*idemX/totX)+' %, correlation des residus '+f2(cor(rX,rY)));
sortieRes.rhoParentEnfant=cor(rM,rT);sortieRes.rhoCousins=cor(rX,rY);sortieRes.partIdentiques=idem/tot;

/* ===== E. LE TEMPS D'UNE COURSE SELON SON PALIER ===== */
dire('\n== E. LE TEMPS REEL D\'UNE COURSE (ms, gen. 0 et 1) ==');
const T=g0.concat(g1).filter(l=>l.ms>0);
const P=T.map(l=>l.palier),MS=T.map(l=>l.ms/1000);
const pente=cor(P,MS)*sd(MS)/sd(P),orig=moy(MS)-pente*moy(P);
dire('course moyenne '+f2(moy(MS))+' s de calcul ; regression : temps = '+f2(orig)+' + '+f2(pente)+' x palier (corr '+f2(cor(P,MS))+') ; palier moyen '+f2(moy(P)));
const parPil=ids0.map(i=>{const x=T.filter(l=>l.id===i);return [moy(x.map(l=>l.palier)),moy(x.map(l=>l.ms/1000))];});
dire('par pilote : corr(palier moyen, temps moyen) '+f2(cor(parPil.map(x=>x[0]),parPil.map(x=>x[1])))+' ; le plus lent '+f2(Math.max(...parPil.map(x=>x[1])))+' s, le plus rapide '+f2(Math.min(...parPil.map(x=>x[1])))+' s');
sortieRes.tempsOrigine=orig;sortieRes.tempsPente=pente;sortieRes.tempsMoyen=moy(MS);
const parties=g0.concat(g1).filter(l=>l.mesures).length/g0.concat(g1).length;
sortieRes.partParties=parties;

/* ===== F. LE BRUIT DE E SELON LE NOMBRE DE PARTIES (bootstrap de note.js, gen. 0) ===== */
dire('\n== F. LE BRUIT DE E ==');
dire('part des courses qui donnent une partie (plus de 60 s, mesures non nulles) : '+f2(100*parties)+' %');
const kE=moy(ids0.map(i=>n0.par[i].se_E*Math.sqrt(n0.par[i].parties)));
dire('se_E x sqrt(parties), moyenne gen. 0 : '+f2(kE)+' (l\'etude du bruit : 0,17 a 6 parties -> 0,42 ; 0,12 a 12 -> 0,42)');
sortieRes.kE=kE;sortieRes.etVraieE=Math.sqrt(Math.max(0,vari(E0)-vBruitE));sortieRes.etVraieA=Math.sqrt(Math.max(0,vari(A0)-vBruitA));sortieRes.Emoyen=moy(E0);
/* E sur les k premieres courses : biais (moins de 5 parties -> E = 4) */
for(const k of [2,3,4,6]){let pire=0,d=[];for(const id of ids0){const x=g0.filter(l=>l.id===id);const lk=graines0.slice(0,k).map(g=>x.find(l=>l.graine===g)).filter(Boolean);
  const e=N.ecartFoule(lk.map(l=>l.mesures),REF,cfg);if(e.parties<cfg.note.partiesMin)pire++;else d.push(e.E-n0.par[id].E);}
  dire('E sur les '+k+' premieres graines : '+pire+'/'+ids0.length+' pilotes sous 5 parties (E = 4, le pire) ; les autres : E_k - E_12 moyen '+f2(moy(d))+' ET '+f2(d.length>1?sd(d):NaN));}

/* ===== G. LE TRI PRECOCE SUR LES VRAIES DONNEES ===== */
dire('\n== G. LES k PREMIERES GRAINES PREDISENT-ELLES LES 12 ? (gen. 0, ordre joue, palier corrige de la graine b_g du modele gen. 0) ==');
const fit0=N.ajuster(g0,{passes:10,retrecir:12});
const pk=(id,k)=>{const x=g0.filter(l=>l.id===id);return moy(graines0.slice(0,k).map(g=>{const l=x.find(y=>y.graine===g);return l.palier-fit0.b[g];}));};
const mut=ids0.filter(i=>i!==temoin);
for(const k of [2,3,4,6]){const u=mut.map(i=>pk(i,k)),v=mut.map(i=>fit0.a[i]),w=mut.map(i=>n01.par[i]?n01.par[i].a:NaN);
  dire('k='+k+' : corr(moyenne des k premieres, a sur 12) '+f2(cor(u,v))+' (en partie la meme course) ; corr(moyenne des k premieres, a sur gen0+gen1) '+f2(cor(u,w))+' ; theorie sans heredite : sqrt(k/12) = '+f2(Math.sqrt(k/12)));}
/* la regle « courante » appliquee a la main : seuil = F du 7e plus bas des 20 (le moins bon vivant apres 6 renvois), sur la gen. 0 + 1 */
const tous=ids1.map(i=>[i,n01.par[i].F]).sort((x,y)=>x[1]-y[1]);
dire('F sur gen. 0 + 1 (24 courses) des '+tous.length+' anciens, du plus bas au plus haut : '+tous.map(x=>x[0].slice(0,4)+' '+f2(x[1])).join(', '));
dire('le 7e plus bas (le « moins bon vivant » apres 6 renvois) : F '+f2(tous[6][1])+' ; â de ce pilote '+f2(n01.par[tous[6][0]].ahat)+', E '+f2(n01.par[tous[6][0]].E));
sortieRes.F24=tous.map(x=>({id:x[0],F:x[1],a:n01.par[x[0]].a,ahat:n01.par[x[0]].ahat,E:n01.par[x[0]].E,n:n01.par[x[0]].n}));
fs.writeFileSync(path.join(__dirname,'residus.json'),JSON.stringify(sortieRes)+'\n');
dire('\n(residus.json ecrit : '+cent.length+' residus, et les nombres du simulateur)');
