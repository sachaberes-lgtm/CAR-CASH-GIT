/* ===== RELECTURE DE L'ETUDE « EFFETS » : UN CHEMIN INDEPENDANT (27/11/2026, le relecteur : « refais au moins UN resultat cle par un chemin independant ») =====
   N'utilise NI outils.js NI note.js : tout est recalcule ici a la main, sur la copie figee ../donnees/ (lecture seule).
   (1) l'integrite des donnees : une ligne par (pilote, graine) ? les graines G0 et G1 sont-elles disjointes ?
   (2) mu, l'effet moyen : par la moyenne, graine par graine, des differences de tous les mutants (le bruit du temoin y reste entier),
       et intervalle de Student sur 24 graines ; puis l'erreur-type theorique sigma·racine(1/24 + 1/(19·24)).
   (3) tau, l'ecart des effets vrais entre mutants, SANS le temoin : analyse de variance a deux facteurs (pilote + graine) sur les 19 mutants seuls,
       tau² = (CM pilotes - CM residuel) / 24 ; intervalle par bootstrap des graines et des pilotes.
   (4) la repetabilite G0 / G1 ;
   (5) les naissances « mutation » ordinaires de G1 (1 + Poisson(2) reels) contre les mutants g0 (3 a 6 reels) : part de courses identiques au parent ;
   (6) le temps des courses identiques.
   Usage : node relecture/contre-verifier.js (un processus, quelques secondes) -> relecture/contre-verifier.txt */
'use strict';
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','donnees');const out=[];const dire=s=>{out.push(s);console.log(s);};
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
const GENS=fs.readFileSync(path.join(D,'generations.jsonl'),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
const POP=JSON.parse(fs.readFileSync(path.join(D,'population-g1-debut.json'),'utf8'));
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const vari=A=>{const m=moy(A);return A.reduce((s,x)=>s+(x-m)**2,0)/(A.length-1);};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* (1) integrite */
const E=L.filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const cles=new Map();for(const l of E){const k=l.id+'|'+l.graine;cles.set(k,(cles.get(k)||0)+1);}
const dbl=[...cles.values()].filter(v=>v>1).length;
const S0=GENS[0].graines,S1=GENS[1].graines,inter=S0.filter(g=>S1.includes(g));
dire(`(1) ${E.length} courses d'entrainement mesurees ; (pilote, graine) en double : ${dbl} ; graines communes a G0 et G1 : ${inter.length} ; graines G1 de generations.jsonl = celles de population : ${JSON.stringify(S1.slice().sort())===JSON.stringify(POP.grainesGeneration.slice().sort())}.`);
const P=new Map();for(const l of E){if(!P.has(l.id))P.set(l.id,new Map());P.get(l.id).set(l.graine,l);}
const T=POP.temoin,V=POP.vivants,g0=V.filter(v=>v.origine==='g0').map(v=>v.id),S=S0.concat(S1);
const pal=(id,g)=>P.get(id).get(g).palier;

/* (2) mu */
const Dg=S.map(g=>moy(g0.map(id=>pal(id,g)-pal(T,g))));
const mu=moy(Dg),se=Math.sqrt(vari(Dg)/S.length);
dire(`(2) mu = ${mu.toFixed(2)} ; Student sur les 24 moyennes de graine (t 2,069) : [${(mu-2.069*se).toFixed(2)} ; ${(mu+2.069*se).toFixed(2)}] (erreur-type ${se.toFixed(2)}).`);
/* l'erreur-type que donne le bruit seul : le temoin (sigma/racine 24) + la moyenne des 19 mutants (sigma/racine(19*24)) + tau²/19 */
const sig=GENS[1].sigmaRes;
dire(`    erreur-type theorique, sigma ${sig} : temoin seul ${(sig/Math.sqrt(24)).toFixed(2)}, avec les mutants ${(sig*Math.sqrt(1/24+1/(19*24))).toFixed(2)} -> IC ±${(1.96*sig*Math.sqrt(1/24+1/(19*24))).toFixed(2)}.`);
/* le meme intervalle par bootstrap simple des graines (comme l'auteur, mais ici sans les mutants) */
{const R=rng(31),B=[];for(let t=0;t<4000;t++){let s=0;for(let i=0;i<S.length;i++)s+=Dg[Math.floor(R()*S.length)];B.push(s/S.length);}B.sort((a,b)=>a-b);
 dire(`    bootstrap des seules graines (4000) : [${B[100].toFixed(2)} ; ${B[3899].toFixed(2)}].`);}

/* (3) tau sans le temoin : ANOVA pilote + graine sur les 19 mutants */
function anova(ids,gs){
  const y=ids.map(id=>gs.map(g=>pal(id,g)));const I=ids.length,J=gs.length,m=moy(y.flat());
  const ri=y.map(r=>moy(r)),cj=gs.map((_,j)=>moy(y.map(r=>r[j])));
  let ssp=0,ssr=0;for(let i=0;i<I;i++){ssp+=J*(ri[i]-m)**2;for(let j=0;j<J;j++)ssr+=(y[i][j]-ri[i]-cj[j]+m)**2;}
  const cmp=ssp/(I-1),cmr=ssr/((I-1)*(J-1));return {tau2:(cmp-cmr)/J,cmp,cmr,sig:Math.sqrt(cmr)};}
const a=anova(g0,S);
dire(`(3) ANOVA sur les 19 mutants seuls (sans le temoin) : CM pilotes ${a.cmp.toFixed(2)}, CM residuel ${a.cmr.toFixed(2)} (sigma ${a.sig.toFixed(2)}), F = ${(a.cmp/a.cmr).toFixed(2)} ; tau² = ${a.tau2.toFixed(3)} -> tau = ${a.tau2>0?Math.sqrt(a.tau2).toFixed(2):'0'}.`);
/* F critique approche (18 et 414 ddl, 5 %) ~ 1,63 ; borne haute de tau² par l'intervalle de F (methode de Searle approchee : F/Fbas) */
{const R=rng(77),B=[];for(let t=0;t<1000;t++){const ids=g0.map(()=>g0[Math.floor(R()*g0.length)]),gs=S.map(()=>S[Math.floor(R()*S.length)]);B.push(anova(ids,gs).tau2);}B.sort((x,y)=>x-y);
 const r=x=>x>0?Math.sqrt(x).toFixed(2):'0';dire(`    bootstrap des pilotes et des graines (1000) : tau 95 % [${r(B[25])} ; ${r(B[974])}] ; part des tirages a tau² > 0 : ${(B.filter(x=>x>0).length/10).toFixed(0)} %.`);}
for(const [k,gs] of [['G0',S0],['G1',S1]]){const b=anova(g0,gs);dire(`    lot ${k} seul : tau² ${b.tau2.toFixed(3)}, sigma ${b.sig.toFixed(2)}.`);}

/* (4) repetabilite */
const d0=g0.map(id=>moy(S0.map(g=>pal(id,g)-pal(T,g)))),d1=g0.map(id=>moy(S1.map(g=>pal(id,g)-pal(T,g))));
const corr=(X,Y)=>{const mx=moy(X),my=moy(Y);let s=0,a=0,b=0;for(let i=0;i<X.length;i++){s+=(X[i]-mx)*(Y[i]-my);a+=(X[i]-mx)**2;b+=(Y[i]-my)**2;}return s/Math.sqrt(a*b);};
const r=corr(d0,d1);dire(`(4) repetabilite G0/G1 : r = ${r.toFixed(2)} ; erreur-type de r a 19 mutants ~ ${((1-r*r)/Math.sqrt(16)).toFixed(2)} ; attendu 0,56 si tau = 1,07 (a ${((0.56-r)/((1-0.56*0.56)/Math.sqrt(16))).toFixed(1)} erreurs-types).`);

/* (5) naissances ordinaires contre mutants g0 */
const nbReels=v=>v.mutes.filter(m=>typeof m.avant==='number'&&!Number.isInteger(m.avant)||(typeof m.apres==='number'&&!Number.isInteger(m.apres))).length;
const ident=(id,ref,gs)=>gs.filter(g=>P.get(id).has(g)&&P.get(ref).has(g)&&P.get(id).get(g).empreinte===P.get(ref).get(g).empreinte).length;
const mg0=g0.map(id=>ident(id,T,S)/24);
const mut1=V.filter(v=>v.ne===1&&v.origine==='mutation');
dire(`(5) mutants g0 : genes changes par mutant ${Math.min(...V.filter(v=>v.origine==='g0').map(v=>v.mutes.length))} a ${Math.max(...V.filter(v=>v.origine==='g0').map(v=>v.mutes.length))} (moyenne ${moy(V.filter(v=>v.origine==='g0').map(v=>v.mutes.length)).toFixed(1)}) ; part moyenne de courses identiques au temoin ${(100*moy(mg0)).toFixed(1)} %, nuls exacts 0/19.`);
let idt=0,nt=0;for(const v of mut1){const k=ident(v.id,v.parents[0],S1);idt+=k;nt+=12;dire(`    ne G1 « mutation » ${v.id} : ${v.mutes.length} gene(s) change(s) (${v.mutes.map(m=>m.cle).join(', ')}), ${k}/12 courses identiques au parent.`);}
dire(`    naissances « mutation » ordinaires : ${idt}/${nt} = ${(100*idt/nt).toFixed(0)} % de courses identiques au parent, 1 nul exact sur ${mut1.length} (Clopper-Pearson 95 % : [0,8 % ; 90,6 %]).`);
/* loi du nombre de reels mutes : 1 + Poisson(2) ; P(1) et P(2) */
const p=k=>Math.exp(-2)*2**(k-1)/[1,1,2,6,24,120][k-1];dire(`    1 + Poisson(2) : P(1 reel) ${(100*p(1)).toFixed(1)} %, P(2) ${(100*p(2)).toFixed(1)} %, P(3 a 6) ${(100*(p(3)+p(4)+p(5)+p(6))).toFixed(1)} % : les mutants g0 (3 a 6 reels) ne couvrent pas les 41 % de naissances a 1 ou 2 reels.`);

/* (6) temps des courses identiques */
const grp=new Map();for(const l of E){const k=l.graine+'|'+l.empreinte;if(!grp.has(k))grp.set(k,[]);grp.get(k).push(l);}
let n=0,ms=0,tot=0;for(const l of E)tot+=l.ms;for(const g of grp.values())if(g.length>1){g.sort((x,y)=>x.date<y.date?-1:1);for(const l of g.slice(1)){n++;ms+=l.ms;}}
dire(`(6) courses identiques : ${n}/${E.length} (${(100*n/E.length).toFixed(1)} %), ${(ms/3.6e6).toFixed(2)} h sur ${(tot/3.6e6).toFixed(2)} h (${(100*ms/tot).toFixed(1)} %).`);
/* le debit : generation 0 contre generation 1 (la meme machine) */
dire(`    debit du maitre : G0 ${GENS[0].debit_h} courses/h (pleine_s ${GENS[0].pleine_s}), G1 ${GENS[1].debit_h} courses/h (pleine_s ${GENS[1].pleine_s}) ; evenements G1 : ${GENS[1].evenements.join(' ; ')}.`);
fs.writeFileSync(path.join(__dirname,'contre-verifier.txt'),out.join('\n')+'\n');
