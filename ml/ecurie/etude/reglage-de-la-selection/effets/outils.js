/* ===== L'ETUDE « EFFETS » : LES CALCULS (27/11/2026, la tache : « que font vraiment les mutations ? ») =====
   Fonctions pures, sans fichier : analyser.js les applique aux vraies courses, verifier.js a des courses inventees dont on connait la reponse.
   - difference appariee mutant - temoin graine par graine (palier, survie) : moyenne, erreur-type, intervalle de Student a 95 %,
     p de permutation (inversion des signes) ;
   - « courses identiques » : meme graine, meme empreinte (la course entiere, decisions comprises) ;
   - la loi des effets : effets vrais s_i ~ N(mu, tau^2) vus a travers le bruit (d_i ~ N(s_i, se_i^2)), ajustee par vraisemblance sur une grille,
     incertitude par bootstrap des mutants. */
'use strict';

/* ===== OUTILS ===== */
const moy=A=>{let s=0;for(const x of A)s+=x;return A.length?s/A.length:NaN;};
const etype=A=>{const n=A.length;if(n<2)return 0;const m=moy(A);let s=0;for(const x of A)s+=(x-m)*(x-m);return Math.sqrt(s/(n-1));};
const mediane=A=>{const B=A.slice().sort((a,b)=>a-b),n=B.length;return n?(n%2?B[(n-1)/2]:(B[n/2-1]+B[n/2])/2):NaN;};
/* le generateur des tirages : mulberry32, graine fixe (une reprise redonne les memes chiffres) */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
/* quantile de Student a 97,5 % (table ; au-dela de 30 degres, 1,96 + correction) */
const T975=[NaN,12.706,4.303,3.182,2.776,2.571,2.447,2.365,2.306,2.262,2.228,2.201,2.179,2.160,2.145,2.131,2.120,2.110,2.101,2.093,2.086,2.080,2.074,2.069,2.064,2.060,2.056,2.052,2.048,2.045,2.042];
const t975=ddl=>ddl<1?NaN:ddl<=30?T975[ddl]:1.96+2.4/ddl;
/* loi normale : densite et repartition (Abramowitz-Stegun 26.2.17, erreur < 1e-7) */
const phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function Phi(x){const t=1/(1+0.2316419*Math.abs(x)),d=phi(x),p=d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x>=0?1-p:p;}
/* intervalle de Clopper-Pearson a 95 % pour k succes sur n (par dichotomie sur la binomiale) */
function binomCdf(k,n,p){let s=0,c=1;for(let i=0;i<=k;i++){if(i>0)c=c*(n-i+1)/i;s+=c*Math.pow(p,i)*Math.pow(1-p,n-i);}return s;}
function clopperPearson(k,n){
  const bis=f=>{let a=0,b=1;for(let i=0;i<60;i++){const m=(a+b)/2;if(f(m))b=m;else a=m;}return (a+b)/2;};
  const bas=k===0?0:bis(p=>1-binomCdf(k-1,n,p)>=0.025);
  const haut=k===n?1:bis(p=>binomCdf(k,n,p)<=0.025);
  return [bas,haut];}

/* ===== LA DIFFERENCE APPARIEE =====
   A, B : Map graine -> ligne. Rend, sur les graines communes : n, identiques (meme empreinte), et pour chaque cle (palier, survie_s)
   moyenne, ET, erreur-type, IC 95 % de Student, p bilateral de permutation (inversion des signes, tirages fixes). */
function apparier(A,B,o){
  o=o||{};const cles=o.cles||['palier','survie_s'],tirages=o.tirages==null?20000:o.tirages;
  const G=[...A.keys()].filter(g=>B.has(g)).sort((x,y)=>x-y);
  const r={graines:G,n:G.length,identiques:0,grainesIdentiques:[],par:{}};
  for(const g of G)if(A.get(g).empreinte&&A.get(g).empreinte===B.get(g).empreinte){r.identiques++;r.grainesIdentiques.push(g);}
  for(const c of cles){
    const d=G.map(g=>A.get(g)[c]-B.get(g)[c]);
    const m=moy(d),s=etype(d),se=d.length?s/Math.sqrt(d.length):NaN,t=t975(d.length-1);
    /* permutation : sous « aucun effet », chaque difference a autant de chances d'etre de signe contraire */
    const R=mulberry32(o.graine==null?12345:o.graine);let plus=0;const obs=Math.abs(m);
    if(d.length&&d.some(x=>x!==0)){for(let k=0;k<tirages;k++){let S=0;for(const x of d)S+=R()<.5?-x:x;if(Math.abs(S/d.length)>=obs-1e-12)plus++;}}
    else plus=tirages;
    r.par[c]={d,moy:m,et:s,se,ic:[m-t*se,m+t*se],p:(plus+1)/(tirages+1)};}
  return r;}

/* classement d'un effet sur son IC : « pire » (IC sous 0), « meilleur ? » (IC au-dessus de 0), « nul exact » (toutes les courses identiques), « indiscernable » */
function classer(ap,cle){
  if(ap.n&&ap.identiques===ap.n)return 'nul exact';
  const x=ap.par[cle||'palier'];
  if(x.ic[1]<0)return 'pire';
  if(x.ic[0]>0)return 'meilleur ?';
  return 'indiscernable';}

/* ===== LA LOI DES EFFETS : d_i ~ N(s_i, se_i^2), s_i ~ N(mu, tau^2) ; vraisemblance sur une grille ===== */
function ajusterNormale(d,se,o){
  o=o||{};const pas=o.pas||0.05,muMin=o.muMin==null?-8:o.muMin,muMax=o.muMax==null?4:o.muMax,tauMax=o.tauMax==null?6:o.tauMax;
  let best={ll:-Infinity};const surface=[];
  for(let tau=0;tau<=tauMax+1e-9;tau+=pas){
    const v=se.map(s=>s*s+tau*tau);
    for(let mu=muMin;mu<=muMax+1e-9;mu+=pas){
      let ll=0;for(let i=0;i<d.length;i++)ll+=-0.5*Math.log(v[i])-(d[i]-mu)*(d[i]-mu)/(2*v[i]);
      if(o.surface)surface.push({mu,tau,ll});
      if(ll>best.ll)best={ll,mu,tau};}}
  if(o.surface){
    /* intervalle de vraisemblance profilee a 95 % (chute de 1,92) pour tau et mu */
    const ok=surface.filter(x=>x.ll>=best.ll-1.92);
    best.icTau=[Math.min(...ok.map(x=>x.tau)),Math.max(...ok.map(x=>x.tau))];
    best.icMu=[Math.min(...ok.map(x=>x.mu)),Math.max(...ok.map(x=>x.mu))];
    best.region=ok.map(x=>[x.mu,x.tau]);}
  return best;}

/* parts de la loi N(mu, tau) : sous un seuil, au-dessus d'un seuil */
const partSous=(mu,tau,x)=>tau>0?Phi((x-mu)/tau):(mu<x?1:0);
const partSur=(mu,tau,x)=>1-partSous(mu,tau,x);

/* bootstrap des mutants : on retire les mutants avec remise et on refait l'ajustement (grille plus grossiere) */
function bootstrapLoi(d,se,o){
  o=o||{};const T=o.tirages||400,R=mulberry32(o.graine||777),seuils=o.seuils||{};
  const out={mu:[],tau:[]};for(const k of Object.keys(seuils))out[k]=[];
  for(let t=0;t<T;t++){
    const D=[],S=[];for(let i=0;i<d.length;i++){const j=Math.floor(R()*d.length);D.push(d[j]);S.push(se[j]);}
    const f=ajusterNormale(D,S,{pas:o.pas||0.1});
    out.mu.push(f.mu);out.tau.push(f.tau);
    for(const [k,fn] of Object.entries(seuils))out[k].push(fn(f.mu,f.tau));}
  const q=(A,p)=>{const B=A.slice().sort((a,b)=>a-b);return B[Math.min(B.length-1,Math.max(0,Math.round(p*(B.length-1))))];};
  const res={};for(const [k,A] of Object.entries(out))res[k]={q025:q(A,.025),q50:q(A,.5),q975:q(A,.975)};
  return res;}

/* l'etendue d'une quantite derivee (une part) sur la region de vraisemblance a 95 % : plus prudente que le bootstrap de peu de mutants
   (verifier.js : le bootstrap de 14 mutants couvre mu ~16 fois sur 20 et tau ~14 fois sur 20) */
function etendueRegion(region,fn){let a=Infinity,b=-Infinity;for(const [mu,tau] of region){const v=fn(mu,tau);if(v<a)a=v;if(v>b)b=v;}return [a,b];}
/* la fourchette retenue : l'union de la region de vraisemblance et du bootstrap */
const union=(x,y)=>[Math.min(x[0],y[0]),Math.max(x[1],y[1])];

/* ===== LA LOI DES EFFETS, EN TENANT COMPTE DU BRUIT DU TEMOIN (partage par tous les mutants) =====
   Tous les mutants sont compares au MEME temoin sur les MEMES graines : la malchance du temoin sur une graine entre dans la difference de tous.
   Elle deplace la moyenne mu de tous (on la mesure par un bootstrap qui retire les graines, le meme tirage pour tous), mais pas l'etalement
   tau entre mutants. Trois estimations de tau :
   (A) la moitie contre la moitie : tau² = covariance entre mutants de d(lot G0) et d(lot G1) (le bruit des deux lots est independant) ;
   (B) les moments : tau² = Var(d) - moyenne(v_i), v_i = sigma²·(1 - part identique)/n_i (le bruit PROPRE du mutant ; celui du temoin est commun) ;
   (C) la vraisemblance sur la grille, d_i ~ N(mu, tau² + v_i).
   X = {mut:[{d:Map graine -> difference, ident:Set graines identiques}], lots:[[graines],[graines]], sigma, tirages, graine} */
function loiDesEffets(X){
  const lots=X.lots,sigma=X.sigma,T=X.tirages||400,R=mulberry32(X.graine||4242);
  const dbar=(m,S)=>{let s=0,n=0;for(const g of S)if(m.d.has(g)){s+=m.d.get(g);n++;}return n?s/n:NaN;};
  const vPropre=(m,S)=>{let n=0,id=0;for(const g of S)if(m.d.has(g)){n++;if(m.ident.has(g))id++;}return n?sigma*sigma*(1-id/n)/n:NaN;};
  const cov=(A,B)=>{const ma=moy(A),mb=moy(B);let s=0;for(let i=0;i<A.length;i++)s+=(A[i]-ma)*(B[i]-mb);return s/(A.length-1);};
  function estimer(M,S0,S1,grille){
    const S=S0.concat(S1),d=M.map(m=>dbar(m,S)),v=M.map(m=>vPropre(m,S));
    const r={mu:moy(d),tau2A:cov(M.map(m=>dbar(m,S0)),M.map(m=>dbar(m,S1))),tau2B:etype(d)**2-moy(v)};
    if(grille){const f=ajusterNormale(d,v.map(Math.sqrt),grille);r.tauC=f.tau;r.muC=f.mu;r.fitC=f;}
    r.d=d;r.v=v;return r;}
  const p=estimer(X.mut,lots[0],lots[1],{pas:0.02,surface:true,muMin:-6,muMax:4,tauMax:4});
  const B={mu:[],tau2A:[],tau2B:[],tauC:[]};
  for(let t=0;t<T;t++){
    const M=X.mut.map(()=>X.mut[Math.floor(R()*X.mut.length)]);
    const S0=lots[0].map(()=>lots[0][Math.floor(R()*lots[0].length)]),S1=lots[1].map(()=>lots[1][Math.floor(R()*lots[1].length)]);
    const e=estimer(M,S0,S1,{pas:0.05,muMin:-6,muMax:4,tauMax:4});
    B.mu.push(e.mu);B.tau2A.push(e.tau2A);B.tau2B.push(e.tau2B);B.tauC.push(e.tauC);}
  const q=(A,pr)=>{const C=A.slice().sort((a,b)=>a-b);return C[Math.min(C.length-1,Math.max(0,Math.round(pr*(C.length-1))))];};
  const ic=A=>[q(A,.025),q(A,.975)];
  const racine=x=>x>0?Math.sqrt(x):0;
  return {mu:p.mu,icMu:ic(B.mu),
    tauA:racine(p.tau2A),tau2A:p.tau2A,icTauA:ic(B.tau2A).map(racine),
    tauB:racine(p.tau2B),tau2B:p.tau2B,icTauB:ic(B.tau2B).map(racine),
    tauC:p.tauC,icTauCvrais:p.fitC.icTau,icTauC:ic(B.tauC),d:p.d,v:p.v,tirages:{mu:B.mu,tauC:B.tauC}};}

/* methode des moments : tau^2 = Var(d) - moyenne(se^2) (rend 0 si negatif) */
function tauMoments(d,se){const v=etype(d)**2-moy(se.map(s=>s*s));return {tau2:v,tau:v>0?Math.sqrt(v):0};}

module.exports={moy,etype,mediane,mulberry32,t975,phi,Phi,clopperPearson,apparier,classer,ajusterNormale,partSous,partSur,bootstrapLoi,tauMoments,etendueRegion,union,loiDesEffets};
