#!/usr/bin/env node
/* ===== LE SIMULATEUR DE LA SELECTION NATURELLE (27/11/2026, l'etude « simulateur » ; la question : « la selection progresse-t-elle,
   et a quelle vitesse ? ») =====
   La boucle de ml/evolution/evoluer.js, SANS AUCUNE COURSE DU JEU. Chaque pilote a une valeur VRAIE cachee (son palier moyen, son ecart E aux
   joueurs) ; une « course » rend cette valeur + l'effet de la graine + un residu RE-TIRE dans les residus reels de l'evolution du 27/11.
   Ce qui est REPRIS TEL QUEL de ml/evolution (require) : graines.js (mulberry32, grainesEntrainement, grainesValidation, rngDe).
   Ce qui est RECOPIE A LA LETTRE (et prouve par --verifier) : le modele pilote + graine de note.js (moindres carres alternes, 10 passes, ā des
   vivants, retrecissement n/(n+12), se_a = sigmaRes/√n), F = â − 4·E, se_F ; le tournoi, les naissances (immigre, croisement 3 fois sur 10,
   mutation), le renvoi, la regle 6, la validation par bootstrap apparie (note.comparer), la malediction du gagnant, les phases, l'economie de graines.
   Ce qui est SUPPOSE (les scenarios) : la loi des effets des mutations (un paysage de 64 genes continus, chacun avec un optimum cache).
   Ce qui est SIMPLIFIE (dit dans le LISEZ-MOI) : E est la moyenne de valeurs par partie (le vrai E est une fonction non lineaire des moyennes des
   mesures) ; les drapeaux et les tetes (phases B et C) ne sont pas simules ; aucune course n'echoue (pas de graine retiree, pas de panne).

   LE MONDE (un tirage par repetition) : 64 genes x dans [0, 1]. Le temoin est en x0. Chaque gene a :
   - q : la part des graines ou il change la trajectoire (0 = silencieux : la course est IDENTIQUE a celle du parent, comme 9627905cd5bb du 27/11
     qui a rejoue son parent au bit pres sur ses 11 graines ; 1 = partout ; sinon uniforme : un gene de carte n'agit que sur sa carte) ;
   - un effet sur le palier, sur les graines ou il agit : w·((x0 − xo)² − (x − xo)²) (xo = l'optimum cache ; w = 0 : sans effet ; « fragile » :
     xo = x0 et w grand : tout pas fait perdre, c'est la mutation letale) ;
   - un effet sur E, meme forme (we, xe) : « inerte » (aucun), « independant » (son propre optimum), « conflit » (l'optimum de E de l'autre cote).
   Palier VRAI du pilote = L0 + Σ q·effet ; E VRAI = E0 − Σ q·effetE (borne a 0).
   UNE COURSE (pilote p, graine g) : la cle de comportement = le XOR des (gene, allele) qui agissent sur g ; niveau = L0 + Σ effets qui agissent
   + b_g ; palier = max(1, round(niveau + r·max(0,15, niveau/7,11))), r = un residu reel tire par hachage (cle, g) : deux pilotes au meme
   comportement sur une graine font la MEME course. La partie compte pour E si la course depasse 60 s (la part reelle selon le palier) ;
   sa valeur = E0 − Σ effetsE + N(0, 0,307) (le bruit reel par partie).

   Usage :
     node simuler.js --verifier                 les preuves de fidelite (contre note.js et les vraies naissances du 27/11) et les cas connus
     node simuler.js --calibrer                 la loi des effets de chaque scenario (parts sans effet / nuisible / letale / utile, plafond)
     node simuler.js --scenario moyen [--repetitions 8] [--budget 200000] [--debit 400] [--graine 1] [--json f.json] [--cfg '{"lambda":12}']
   Un seul processus, aucun fichier ecrit hors de --json. */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os');
const ML=path.join(__dirname,'..','..','..','..');
const Gr=require(path.join(ML,'evolution','graines.js'));
const CFG0=JSON.parse(fs.readFileSync(path.join(ML,'evolution','config.json'),'utf8'));
const CAL=JSON.parse(fs.readFileSync(path.join(__dirname,'donnees','calibrage.json'),'utf8'));

/* ===== LE HACHAGE (deterministe : une meme cle et une meme graine rendent toujours la meme course) ===== */
function fmix(h){h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return h>>>0;}
function mix(a,b){return fmix(Math.imul(fmix(a>>>0)^(b>>>0),0x9e3779b1)^0x632be5ab);}
const U32=4294967296;
const unif=(a,b)=>mix(a,b)/U32;
function normH(a,b){const u1=(mix(a,b)+0.5)/U32,u2=mix(a^0x5bd1e995,b)/U32;return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);}
const expo=R=>-Math.log(1-R.suivant());
const cl=(x,a,b)=>x<a?a:x>b?b:x;

/* ===== LES CONSTANTES MESUREES (donnees/calibrage.json, ecrit par analyser-reel.js) ===== */
/* les residus d'un modele ajuste sont plus petits que le bruit (variance x ddl/N) : on les regonfle de racine(N/ddl) (1,05) */
const RES=Float64Array.from(CAL.residus,x=>x*Math.sqrt(CAL.residus.length/CAL.ddlResidus));
const M0=CAL.palierMoyen;                 /* 7,11 : le palier moyen ou les residus ont ete mesures */
const SD_GRAINE=CAL.sdGraineVraie;        /* 1,82 */
const SIGMA_E1=CAL.sigmaE1;               /* 0,307 : le bruit de E pour UNE partie */
const L0=6.5;                             /* le palier vrai du temoin (a mesure 6,42 ± 0,84 ; moyenne des 20 de la generation 0 : 6,50) */
const E0=CAL.ETemoin;                     /* 0,905 */
const PLONG=(function(){const T=[];for(let p=0;p<=40;p++){const v=CAL.pLongParPalier[p];T.push(v!=null?v:(p<3?0:1));}return T;})();
const MS=(function(){const T=[0];const m=CAL.msParPalier;let last=m[1];for(let p=1;p<=60;p++){if(m[p]!=null)last=m[p];T.push(m[p]!=null?m[p]:(p>20?m[20]+(p-20)*14000:last));}return T;})();
const MS_REF=CAL.msMoyen;                 /* 69,8 s : la course moyenne de l'evolution reelle, celle du debit mesure */

/* ===== LES SCENARIOS (SUPPOSES : rien ne mesure encore la loi des effets ; seule contrainte mesuree : les 19 mutants de la generation 0, 3 a 6
   genes a sigma 0,15, ont une dispersion VRAIE de ~0,59 palier (tres incertaine) et une moyenne a +0,08 ± 0,24 du temoin ; leur E ne se distingue
   pas du bruit : dispersion vraie de E sous ~0,09) ===== */
const SCENARIOS={
  /* les trois sont regles (--calibrer) pour que 19 mutants de generation 0 aient une dispersion vraie de ~0,6 palier comme le 27/11 ; ils different
     par le plafond (ce que le temoin a encore a gagner : ~0,45, ~2,4, ~5,3 paliers en mediane) et par la part de mutations utiles */
  pessimiste:{pSilencieux:.30,pPartout:.10,pNeutre:.45,pFragile:.10,wFragile:25,W:5,D:.10,modeE:'independant',WE:1.2,DE:.10},
  moyen:     {pSilencieux:.30,pPartout:.10,pNeutre:.45,pFragile:.06,wFragile:25,W:5,D:.22,modeE:'independant',WE:.6,DE:.20},
  optimiste: {pSilencieux:.30,pPartout:.10,pNeutre:.40,pFragile:.03,wFragile:20,W:4,D:.40,modeE:'independant',WE:.4,DE:.30},
  /* « etroit » : le scenario central de l'etude voisine « effets » (parametres-pour-le-simulateur.json, ecrit a 23:32 : un mutant de generation 0
     a un effet vrai ~ N(−0,42 ; 0,32), le temoin est presque a son optimum : tout pas coute un peu, presque rien ne rapporte ;
     --calibrer : moyenne −0,20, dispersion 0,34, plafond 0,16) */
  etroit:    {pSilencieux:.30,pPartout:.10,pNeutre:.10,pFragile:0,wFragile:0,W:6,D:.035,modeE:'independant',WE:1.2,DE:.05},
  /* les cas connus (--verifier) */
  nul:       {pSilencieux:.30,pPartout:.10,pNeutre:1,pFragile:0,wFragile:0,W:0,D:0,modeE:'inerte',WE:0,DE:0}
};
const K_GENES=64;   /* les genes continus du genome v:1 de l'evolution du 27/11 (CONTINUS : 64 sur 86 ; les 22 autres sont des drapeaux) */

function creerMonde(sc,graine){
  const R=Gr.mulberry32(graine>>>0),K=K_GENES;
  const M={K,graine:graine>>>0,q:new Float64Array(K),w:new Float64Array(K),xo:new Float64Array(K),x0:new Float64Array(K),we:new Float64Array(K),xe:new Float64Array(K),
    cleGene:new Uint32Array(K),type:[]};
  for(let l=0;l<K;l++){
    M.x0[l]=.2+.6*R.suivant();M.cleGene[l]=mix(graine,l+101);
    const r=R.suivant();M.q[l]=r<sc.pSilencieux?0:r<sc.pSilencieux+sc.pPartout?1:R.suivant();
    const t=R.suivant();
    if(t<sc.pNeutre){M.w[l]=0;M.xo[l]=M.x0[l];M.type.push('neutre');}
    else if(t<sc.pNeutre+sc.pFragile){M.w[l]=sc.wFragile*(.5+expo(R));M.xo[l]=M.x0[l];M.type.push('fragile');}
    else{M.w[l]=sc.W*expo(R);M.xo[l]=cl(M.x0[l]+R.normal()*sc.D,0,1);M.type.push('normal');}
    const nz=M.type[l]==='normal';
    if(sc.modeE==='independant'&&nz){M.we[l]=sc.WE*expo(R);M.xe[l]=cl(M.x0[l]+R.normal()*sc.DE,0,1);}
    else if(sc.modeE==='conflit'&&nz){M.we[l]=sc.WE*expo(R);M.xe[l]=cl(M.x0[l]-(M.xo[l]-M.x0[l])*(sc.D>0?sc.DE/sc.D:0),0,1);}
    else{M.we[l]=0;M.xe[l]=M.x0[l];}
  }
  /* le plafond : le palier gagne par un pilote qui aurait TOUS ses genes a l'optimum (inaccessible en pratique : les genes sont bornes a [0,1]) */
  let pl=0,plE=0;for(let l=0;l<K;l++){pl+=M.q[l]*M.w[l]*Math.pow(M.x0[l]-M.xo[l],2);plE+=M.q[l]*M.we[l]*Math.pow(M.x0[l]-M.xe[l],2);}
  M.plafond=pl;M.plafondE=plE;
  return M;
}
const effP=(M,l,x)=>M.w[l]*((M.x0[l]-M.xo[l])*(M.x0[l]-M.xo[l])-(x-M.xo[l])*(x-M.xo[l]));
const effE=(M,l,x)=>M.we[l]*((M.x0[l]-M.xe[l])*(M.x0[l]-M.xe[l])-(x-M.xe[l])*(x-M.xe[l]));
const bGraine=(M,g)=>SD_GRAINE*normH(M.graine^0x2545f491,g);

/* ===== LES PILOTES ===== */
function pilote(st,x,al,o){
  const M=st.M,v={i:st.nPil++,x:x,al:al,ne:o.ne,origine:o.origine,parents:o.parents||[],n:0,parties:0,sE:0,sE2:0,joue:new Set(),vraiP:L0,vraiE:E0};
  let p=0,e=0;for(let l=0;l<M.K;l++)if(al[l]!==0){p+=M.q[l]*effP(M,l,x[l]);e+=M.q[l]*effE(M,l,x[l]);}
  v.vraiP=L0+p;v.vraiE=Math.max(0,E0-e);v.vraiF=v.vraiP-st.cfg.note.poidsEcart*v.vraiE;
  st.pilotes.push(v);
  return v;
}
/* la mutation du simulateur : la regle de genome.muter pour les reels (m = genes ?? 1 + poisson(2) genes distincts, x + N(0,1)·sigma, reflexion aux
   bornes) ; chaque gene touche recoit un nouvel allele (nouvelle trajectoire sur les graines ou il agit) */
function muterSim(st,par,rng,o){
  const K=st.M.K,x=Float64Array.from(par.x),al=Int32Array.from(par.al);
  const sigma=o.sigma!=null?o.sigma:st.cfg.sigmaMutation;
  let m=o.genes!=null?o.genes:1+rng.poisson(st.cfg.poissonMutations);m=Math.max(0,Math.min(K,m));
  const urne=[];for(let l=0;l<K;l++)urne.push(l);
  for(let n=0;n<m;n++){const l=urne.splice(rng.entier(urne.length),1)[0];let y=x[l]+rng.normal()*sigma;if(y>1)y=2-y;else if(y<0)y=-y;x[l]=cl(y,0,1);al[l]=++st.nAllele;}
  return {x,al};
}
function croiserSim(st,p1,p2,rng){
  const K=st.M.K,x=new Float64Array(K),al=new Int32Array(K);
  for(let l=0;l<K;l++){const g=rng.suivant()<.5?p1:p2;x[l]=g.x[l];al[l]=g.al[l];}
  return {x,al};
}

/* ===== UNE COURSE ===== */
function course(st,v,g){
  const M=st.M;let cle=0x6a09e667,sh=0,se=0;
  for(let l=0;l<M.K;l++){const a=v.al[l];if(a===0)continue;const q=M.q[l];if(q<=0)continue;
    if(q>=1||unif(M.cleGene[l],g)<q){cle^=mix(l+1,a);sh+=effP(M,l,v.x[l]);se+=effE(M,l,v.x[l]);}}
  const niv=L0+sh+(st.sansBruit?0:bGraine(M,g));
  const r=st.sansBruit?0:RES[mix(cle^M.graine,g)%RES.length];
  let p=Math.round(niv+r*Math.max(.15,niv/M0));if(p<1)p=1;
  const longue=unif(cle^0x3c6ef372,g)<PLONG[Math.min(40,p)];
  const e=E0-se+(st.sansBruit?0:SIGMA_E1*normH(cle^0x13579bdf,g));
  st.mur_s+=3600/st.debit*MS[Math.min(60,p)]/MS_REF;
  return {palier:p,longue:longue,e:e};
}
/* une course d'entrainement : la ligne entre dans la note (une seule par pilote et par graine : le cache de courses.js) */
function courseEntrainement(st,v,g){
  if(v.joue.has(g)){st.cache++;return false;}
  v.joue.add(g);
  const c=course(st,v,g);
  let gi=st.idxGraine.get(g);if(gi===undefined){gi=st.nGr++;st.idxGraine.set(g,gi);}
  if(st.nL>=st.lp.length){const n=st.lp.length*2,a=new Int32Array(n),b=new Int32Array(n),y=new Float64Array(n);a.set(st.lp);b.set(st.lg);y.set(st.ly);st.lp=a;st.lg=b;st.ly=y;}
  st.lp[st.nL]=v.i;st.lg[st.nL]=gi;st.ly[st.nL]=c.palier;st.nL++;
  v.n++;if(c.longue){v.parties++;v.sE+=c.e;v.sE2+=c.e*c.e;}
  st.courses.entrainement++;
  return c;
}

/* ===== LA NOTE (note.js : ajuster + ecartFoule + noter ; le palier a l'identique, E simplifie) ===== */
function ajusterSim(st,idsVivants){
  const N=st.nL,P=st.nPil,G=st.nGr,lp=st.lp,lg=st.lg,y=st.ly,passes=st.cfg.note.passes,k=st.cfg.note.retrecir;
  const a=new Float64Array(P),b=new Float64Array(G),n=new Float64Array(P),m=new Float64Array(G),sa=new Float64Array(P),sb=new Float64Array(G);
  for(let i=0;i<N;i++){n[lp[i]]++;m[lg[i]]++;}
  let Pn=0;for(let p=0;p<P;p++)if(n[p]>0)Pn++;
  for(let t=0;t<Math.max(1,passes|0);t++){
    sa.fill(0);for(let i=0;i<N;i++)sa[lp[i]]+=y[i]-b[lg[i]];for(let p=0;p<P;p++)if(n[p]>0)a[p]=sa[p]/n[p];
    sb.fill(0);for(let i=0;i<N;i++)sb[lg[i]]+=y[i]-a[lp[i]];for(let g=0;g<G;g++)b[g]=sb[g]/m[g];
    let c=0;for(let g=0;g<G;g++)c+=b[g];c=G?c/G:0;for(let g=0;g<G;g++)b[g]-=c;for(let p=0;p<P;p++)if(n[p]>0)a[p]+=c;}
  let ssr=0;for(let i=0;i<N;i++){const r=y[i]-a[lp[i]]-b[lg[i]];ssr+=r*r;}
  const ddl=N-Pn-G+1,sigmaRes=N?Math.sqrt(ssr/Math.max(1,ddl)):0;
  const viv=idsVivants.filter(i=>n[i]>0);
  let abar=0;if(viv.length){for(const i of viv)abar+=a[i];abar/=viv.length;}else{let c=0;for(let p=0;p<P;p++)if(n[p]>0){abar+=a[p];c++;}abar/=c;}
  return {a,b,n,sigmaRes,abar,k};
}
function eDe(st,v){
  const cn=st.cfg.note;
  if(v.parties<cn.partiesMin)return {E:cn.ePire,seE:0};
  const m=v.sE/v.parties,vr=Math.max(0,(v.sE2-v.parties*m*m)/(v.parties-1));
  return {E:Math.max(0,m),seE:Math.sqrt(vr/v.parties)};
}
function noterSim(st){
  const V=st.vivants,fit=ajusterSim(st,V.map(v=>v.i)),pe=st.cfg.note.poidsEcart,par=new Map();
  for(const v of V){
    const n=fit.n[v.i],e=eDe(st,v);
    const a=n?fit.a[v.i]:null,ahat=n?(fit.a[v.i]-fit.abar)*n/(n+fit.k)+fit.abar:fit.abar,se_a=n?fit.sigmaRes/Math.sqrt(n):null;
    par.set(v.i,{n,a,ahat,se_a,E:e.E,se_E:e.seE,F:ahat-pe*e.E,se_F:se_a==null?null:Math.sqrt(se_a*se_a+pe*pe*e.seE*e.seE)});
  }
  return {par,sigmaRes:fit.sigmaRes,abar:fit.abar};
}
const nDe=(notes,v)=>{const x=notes.par.get(v.i);return x?x.n:0;};
const fDe=(notes,v)=>{const x=notes.par.get(v.i);return x&&isFinite(x.F)?x.F:-Infinity;};

/* ===== LE TOURNOI ET LES NAISSANCES (evoluer.js tournoi, naissances : meme ordre des tirages du generateur du maitre) =====
   op = {muter(parent, rng, {genes, sigma}) -> genome, croiser(p1, p2, rng) -> genome, naitre(genome, {ne, origine, parents}) -> vivant, id(v)}
   (le simulateur passe les siens ; --verifier passe les vrais genome.muter / croiser du commit de l'evolution) */
function tournoi(cfg,V,notes,rng,exclure,id){
  let pool=V.filter(v=>nDe(notes,v)>=cfg.protectionCourses);
  const taille=cfg.tournoi||3;
  if(pool.length<taille){let nmax=0;for(const v of V)nmax=Math.max(nmax,nDe(notes,v));pool=V.filter(v=>nDe(notes,v)===nmax);}
  if(exclure!=null&&pool.length>=2)pool=pool.filter(v=>id(v)!==exclure);
  const urne=pool.slice(),pris=[];
  for(let i=0;i<taille&&urne.length;i++)pris.push(urne.splice(rng.entier(urne.length),1)[0]);
  pris.sort((a,b)=>(fDe(notes,b)-fDe(notes,a))||(id(a)<id(b)?-1:id(a)>id(b)?1:0));
  return pris[0];
}
function naissancesRegle(cfg,V,champion,notes,rng,op,G){
  const nes=[];
  for(let k=0;k<cfg.lambda;k++){
    let g,parents,origine;
    if(k<(cfg.immigres||0)){g=op.muter(champion,rng,{genes:cfg.immigreGenes,sigma:cfg.immigreSigma});parents=[champion];origine='immigre';}
    else{
      const p1=tournoi(cfg,V,notes,rng,null,op.id),u=rng.suivant();
      if(u<cfg.pCroisement){const p2=tournoi(cfg,V,notes,rng,op.id(p1),op.id);g=op.muter(op.croiser(p1,p2,rng),rng,{});parents=[p1,p2];origine='croisement';}
      else{g=op.muter(p1,rng,{});parents=[p1];origine='mutation';}
    }
    const v=op.naitre(g,{ne:G,origine,parents:parents.map(op.id)},rng);
    if(v)nes.push(v);
  }
  return nes;
}

/* ===== LA VALIDATION (note.comparer : bootstrap apparie par graine, le meme generateur rngDe('comparer|'+n)) ===== */
function eLot(st,P){
  const cn=st.cfg.note;if(P.length<cn.partiesMin)return cn.ePire;
  let s=0;for(const x of P)s+=x;return Math.max(0,s/P.length);
}
function comparerSim(st,cA,cB){
  const cfg=st.cfg,pe=cfg.note.poidsEcart,n=cA.length,T=cfg.validation.bootstrap;
  const pA=cA.map(c=>c.palier),pB=cB.map(c=>c.palier);
  const un=idx=>{let s=0;const XA=[],XB=[];for(const i of idx){s+=pA[i]-pB[i];if(cA[i].longue)XA.push(cA[i].e);if(cB[i].longue)XB.push(cB[i].e);}
    const dP=s/idx.length,dE=eLot(st,XA)-eLot(st,XB);return {dP,dE,dF:dP-pe*dE};};
  const tous=[];for(let i=0;i<n;i++)tous.push(i);
  const p=un(tous),R=Gr.rngDe('comparer|'+n),vP=[],vE=[],vF=[];
  for(let t=0;t<T;t++){const idx=new Array(n);for(let i=0;i<n;i++)idx[i]=R.entier(n);const x=un(idx);vP.push(x.dP);vE.push(x.dE);vF.push(x.dF);}
  const et=A=>{const m=A.reduce((s,x)=>s+x,0)/A.length;let s=0;for(const x of A)s+=(x-m)*(x-m);return A.length>1?Math.sqrt(s/(A.length-1)):0;};
  const se_dF=et(vF),se_dP=et(vP),se_dE=et(vE),seuil=cfg.validation.seuilSacre;
  const crit={a:p.dF>seuil*se_dF,b:p.dP>-1*se_dP,c:p.dE<1*se_dE};
  return {dF:p.dF,se_dF,dP:p.dP,dE:p.dE,sacre:crit.a&&crit.b&&crit.c};
}

/* ===== LA CONFIG ===== */
function fusion(a,b){const r=JSON.parse(JSON.stringify(a));for(const k of Object.keys(b||{})){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&r[k]&&typeof r[k]==='object')r[k]=fusion(r[k],b[k]);else r[k]=b[k];}return r;}
/* les reglages propres au simulateur (absents de la vraie config) :
   rejouer : 'tous' (la vraie regle) ou un nombre k : ne rejouent la generation que les jeunes (n < rejouerJeunes), le temoin, le champion et les k
   meilleurs F (PROPOSITION, pas la vraie regle) */
const SIM_DEFAUT={rejouer:'tous',rejouerJeunes:48};

/* ===== UNE EVOLUTION COMPLETE ===== */
function evoluer(o){
  const sc=Object.assign({},SCENARIOS[o.scenario]||o.scenario,o.scenarioPlus||{});
  const cfg=fusion(fusion(CFG0,SIM_DEFAUT),o.cfg||{});
  const M=creerMonde(sc,o.graineMonde!=null?o.graineMonde:mix(o.graine||1,77));
  const st={cfg,M,debit:o.debit||400,sansBruit:!!o.sansBruit,pilotes:[],vivants:[],nPil:0,nAllele:0,
    lp:new Int32Array(1<<14),lg:new Int32Array(1<<14),ly:new Float64Array(1<<14),nL:0,idxGraine:new Map(),nGr:0,
    courses:{entrainement:0,validation:0,coffre:0},cache:0,mur_s:0,validations:0,sacres:0,fauxSacres:0,sacresPires:0,maledictions:[],regle6:cfg.validation.regle6,
    derniereValidation:-99,phase:'A',phaseDepuis:0,sansSacre:0,nGraines:cfg.grainesParGeneration,journal:[]};
  const rng=Gr.mulberry32(((o.graine||1)*2654435761+cfg.graineMaitre)>>>0);
  const op={id:v=>v.i,
    muter:(par,r,mo)=>muterSim(st,par,r,mo),croiser:(a,b,r)=>croiserSim(st,a,b,r),
    naitre:(g,mo)=>pilote(st,g.x,g.al,mo)};
  /* generation 0 : le temoin + mu−1 mutants (3 a 6 genes, sigma 0,15) */
  const K=M.K,T=pilote(st,Float64Array.from(M.x0),new Int32Array(K),{ne:0,origine:'temoin'});
  st.vivants.push(T);st.temoin=T;st.champion=T;
  const g0=cfg.generation0;
  while(st.vivants.length<cfg.mu){const g=muterSim(st,T,rng,{genes:g0.genesMin+rng.entier(g0.genesMax-g0.genesMin+1),sigma:g0.sigma});st.vivants.push(pilote(st,g.x,g.al,{ne:0,origine:'g0',parents:[T.i]}));}
  let eg=Gr.etatInitial(cfg),r0=Gr.grainesEntrainement(eg,rng,cfg.grainesParGeneration,cfg);eg=r0.eg;let graines=r0.graines;
  st.courses.coffre+=cfg.coffre&&cfg.coffre.sim===false?0:40;   /* le coffre « epoque » de la generation 0 : le temoin sur 40 graines */
  const budgets=(o.budgets||[10000,50000,200000]).slice().sort((a,b)=>a-b),points=[];
  const total=()=>st.courses.entrainement+st.courses.validation+st.courses.coffre;
  const etatMesure=()=>mesurer(st);
  let G=0;
  for(;;){
    if(G>0){
      const notes=noterSim(st);
      const champ=st.vivants.indexOf(st.champion)>=0?st.champion:st.temoin;
      const nes=naissancesRegle(cfg,st.vivants,champ,notes,rng,op,G);
      for(const v of nes)st.vivants.push(v);
      const r=Gr.grainesEntrainement(eg,rng,st.nGraines,cfg);eg=r.eg;graines=r.graines;
      st.notesAvant=notes;
    }
    /* 3. LES COURSES : graine par graine, vivant par vivant */
    let joueurs=st.vivants;
    if(cfg.rejouer!=='tous'&&G>0){
      const N0=st.notesAvant,kk=+cfg.rejouer;
      const top=new Set(st.vivants.filter(v=>v!==st.champion&&v!==st.temoin).sort((a,b)=>fDe(N0,b)-fDe(N0,a)).slice(0,kk));
      joueurs=st.vivants.filter(v=>v===st.temoin||v===st.champion||top.has(v)||v.n<cfg.rejouerJeunes);
    }
    const mur0=st.mur_s,e0=st.courses.entrainement;let taches=0;
    for(const g of graines)for(const v of joueurs){taches++;courseEntrainement(st,v,g);}
    const dureeEnt=st.mur_s-mur0,joueesEnt=st.courses.entrainement-e0;
    /* 5. LA NOTE ; 6. LE RENVOI */
    let notes=noterSim(st);
    const elig=st.vivants.filter(v=>v!==st.temoin&&v!==st.champion&&nDe(notes,v)>=cfg.protectionCourses);
    const nVirer=Math.max(0,Math.min(elig.length,st.vivants.length-cfg.mu));
    elig.sort((a,b)=>(fDe(notes,a)-fDe(notes,b))||(a.i-b.i));
    const vires=new Set(elig.slice(0,nVirer));
    st.vivants=st.vivants.filter(v=>!vires.has(v));
    /* 7. LA VALIDATION (la regle 6) */
    let sacre=false;
    const meneur=st.vivants.filter(v=>v!==st.champion&&nDe(notes,v)>=cfg.validation.nMin).sort((a,b)=>(fDe(notes,b)-fDe(notes,a))||(a.i-b.i))[0]||null;
    if(meneur&&G-st.derniereValidation>=cfg.validation.intervalle){
      const nm=notes.par.get(meneur.i),nc=notes.par.get(st.champion.i);
      if(nm&&nc&&isFinite(nm.F)&&isFinite(nc.F)&&nm.se_F!=null&&nc.se_F!=null&&nm.F-nc.F>st.regle6*Math.sqrt(nm.se_F*nm.se_F+nc.se_F*nc.se_F)){
        const rv=Gr.grainesValidation(eg,cfg.validation.graines,cfg);eg=rv.eg;
        if(rv.graines.length){
          const cA=rv.graines.map(g=>course(st,meneur,g)),cB=rv.graines.map(g=>course(st,st.champion,g));
          st.courses.validation+=2*rv.graines.length;st.validations++;
          const cmp=comparerSim(st,cA,cB);
          st.derniereValidation=G;
          const mal=(nm.F-nc.F)-cmp.dF;
          st.maledictions.push(mal);
          if(cmp.sacre){
            if(meneur.vraiF<=st.champion.vraiF)st.fauxSacres++;
            if(meneur.vraiF<st.temoin.vraiF)st.sacresPires++;
            st.journal.push({G,sacre:meneur.i,ancien:st.champion.i,gainVraiF:meneur.vraiF-st.champion.vraiF,dF:cmp.dF});
            st.champion=meneur;st.sacres++;sacre=true;
            st.courses.coffre+=40;   /* le coffre « sacre » : le nouveau champion sur 40 graines (le temoin y est deja : cache) */
          }
          const F=cfg.validation.maledictionFenetre||10,Mw=st.maledictions.slice(-F);
          if(Mw.length>=F&&Mw.reduce((s,x)=>s+x,0)/Mw.length>cfg.validation.maledictionSeuil&&st.regle6!==cfg.validation.regle6Haute)st.regle6=cfg.validation.regle6Haute;
        }
      }
    }
    /* les phases (les tetes ne sont pas simulees : la phase ne change rien ici, elle est comptee) */
    st.sansSacre=sacre?0:st.sansSacre+1;
    const SUITE={A:'B',B:'C'},pp=cfg.phases.passage;
    if(SUITE[st.phase]&&(st.sansSacre>=pp.sansSacre||G-st.phaseDepuis>=pp.generations)){st.phase=SUITE[st.phase];st.phaseDepuis=G;st.sansSacre=0;}
    /* l'economie de graines (duree des courses d'entrainement au debit choisi, ramenee a grainesParGeneration graines) */
    if(joueesEnt>0&&joueesEnt>=taches/2&&cfg.economie!==false){
      const pleine=dureeEnt*taches/joueesEnt*cfg.grainesParGeneration/Math.max(1,graines.length);
      if(pleine>cfg.seuilEconomie_s&&st.nGraines!==cfg.grainesEconomie)st.nGraines=cfg.grainesEconomie;
      else if(pleine<=.9*cfg.seuilEconomie_s&&st.nGraines!==cfg.grainesParGeneration)st.nGraines=cfg.grainesParGeneration;
    }
    st.G=G;
    while(budgets.length&&total()>=budgets[0]){const b=budgets.shift();points.push(Object.assign({budget:b},etatMesure()));}
    if(o.surGeneration)o.surGeneration(st,notes);
    if(!budgets.length||(o.generationsMax!=null&&G>=o.generationsMax))break;
    G++;
  }
  return {points,st};
}

/* ===== LES MESURES D'UN ETAT (le VRAI, que la selection ne voit pas) ===== */
function mesurer(st){
  const T=st.temoin,C=st.champion,V=st.vivants,pe=st.cfg.note.poidsEcart;
  const notes=noterSim(st);
  let best=V[0],bestF=V[0],meneur=null,mF=-Infinity;
  for(const v of V){if(v.vraiP>best.vraiP)best=v;if(v.vraiF>bestF.vraiF)bestF=v;
    if(v!==C){const f=fDe(notes,v);if(f>mF){mF=f;meneur=v;}}}
  let pm=0;for(const v of V)pm+=v.vraiP;pm/=V.length;
  return {G:st.G,courses:st.courses.entrainement+st.courses.validation+st.courses.coffre,entrainement:st.courses.entrainement,validation:st.courses.validation,
    coffre:st.courses.coffre,cache:st.cache,heures:st.mur_s/3600,
    champion:{dP:C.vraiP-T.vraiP,dE:C.vraiE-T.vraiE,dF:C.vraiF-T.vraiF,temoin:C===T},
    meilleurVivantP:best.vraiP-T.vraiP,meilleurVivantF:bestF.vraiF-T.vraiF,
    meilleurVivantFdP:bestF.vraiP-T.vraiP,meilleurVivantFdE:bestF.vraiE-T.vraiE,
    meneur:meneur?{dP:meneur.vraiP-T.vraiP,dE:meneur.vraiE-T.vraiE,dF:meneur.vraiF-T.vraiF}:null,
    populationP:pm-T.vraiP,
    sacres:st.sacres,fauxSacres:st.fauxSacres,sacresPires:st.sacresPires,validations:st.validations,championPireQueTemoin:C.vraiF<T.vraiF-1e-12,
    regle6:st.regle6,nGraines:st.nGraines,phase:st.phase,plafond:st.M.plafond,plafondE:st.M.plafondE};
}

/* ===== LA LOI DES EFFETS D'UN SCENARIO (--calibrer) : sur des mondes tires, les naissances simples depuis le temoin ===== */
function calibrer(nom,nMondes){
  const sc=SCENARIOS[nom],cfg=fusion(CFG0,SIM_DEFAUT);
  const one=[],g0=[],g0E=[],imm=[],pl=[],plE=[];
  for(let w=0;w<nMondes;w++){
    const st={cfg,M:creerMonde(sc,mix(w+1,991)),pilotes:[],nPil:0,nAllele:0};
    const T=pilote(st,Float64Array.from(st.M.x0),new Int32Array(st.M.K),{ne:0,origine:'temoin'});
    const R=Gr.mulberry32(w*7+3);pl.push(st.M.plafond);plE.push(st.M.plafondE);
    for(let i=0;i<200;i++){const g=muterSim(st,T,R,{});const v=pilote(st,g.x,g.al,{});one.push({dP:v.vraiP-L0,dE:v.vraiE-E0,touche:[...g.al].some((a,l)=>a!==0&&st.M.q[l]>0)});}
    for(let i=0;i<19;i++){const g=muterSim(st,T,R,{genes:3+R.entier(4),sigma:.15});const v=pilote(st,g.x,g.al,{});g0.push(v.vraiP-L0);g0E.push(v.vraiE-E0);}
    for(let i=0;i<50;i++){const g=muterSim(st,T,R,{genes:8,sigma:.30});const v=pilote(st,g.x,g.al,{});imm.push(v.vraiP-L0);}
  }
  const moy=A=>A.reduce((s,x)=>s+x,0)/A.length,et=A=>{const m=moy(A);return Math.sqrt(A.reduce((s,x)=>s+(x-m)*(x-m),0)/(A.length-1));};
  const q=(A,p)=>{const B=A.slice().sort((a,b)=>a-b);return B[Math.floor(p*(B.length-1))];};
  const sans=one.filter(x=>Math.abs(x.dP)<.05).length/one.length,nuis=one.filter(x=>x.dP<=-.05&&x.dP>-1.5).length/one.length,
    let_=one.filter(x=>x.dP<=-1.5).length/one.length,util=one.filter(x=>x.dP>=.05),silence=one.filter(x=>!x.touche).length/one.length;
  return {scenario:nom,mondes:nMondes,naissance:{sansEffet:sans,nuisible:nuis,letale:let_,utile:util.length/one.length,tailleUtileMoyenne:util.length?moy(util.map(x=>x.dP)):0,
      silencieuse:silence,moyenne:moy(one.map(x=>x.dP)),et:et(one.map(x=>x.dP)),etE:et(one.map(x=>x.dE))},
    generation0:{moyenne:moy(g0),et:et(g0),etE:et(g0E)},immigre:{moyenne:moy(imm),et:et(imm)},
    plafond:{mediane:q(pl,.5),p10:q(pl,.1),p90:q(pl,.9)},plafondE:{mediane:q(plE,.5)}};
}

module.exports={evoluer,calibrer,SCENARIOS,creerMonde,ajusterSim,noterSim,naissancesRegle,tournoi,comparerSim,fusion,CFG0,SIM_DEFAUT,mix,pilote,course,courseEntrainement,L0,E0};

/* ===== LIGNE DE COMMANDE ===== */
if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  if(A.includes('--verifier')){require('./verifier.js').tout();}
  else if(A.includes('--calibrer')){
    const n=+opt('mondes',200);
    for(const nom of ['etroit','pessimiste','moyen','optimiste']){const c=calibrer(nom,n);console.log(JSON.stringify(c));}
  }else if(opt('scenario')){
    const t0=Date.now(),reps=+opt('repetitions',8),budget=+opt('budget',200000),debit=+opt('debit',400),g=+opt('graine',1);
    const cfg=opt('cfg')?JSON.parse(opt('cfg')):{};
    const R=[];
    for(let k=0;k<reps;k++){const r=evoluer({scenario:opt('scenario'),graine:g+k,debit,cfg,budgets:[10000,50000,200000].filter(b=>b<=budget)});R.push(r.points);
      const p=r.points[r.points.length-1];
      console.log('repetition '+(k+1)+' : '+p.courses+' courses, G '+p.G+', '+p.heures.toFixed(0)+' h ; champion vrai palier '+p.champion.dP.toFixed(2)+', E '+p.champion.dE.toFixed(3)+
        ' ; meilleur vivant '+p.meilleurVivantP.toFixed(2)+' ; sacres '+p.sacres+' (faux '+p.fauxSacres+') ; plafond '+p.plafond.toFixed(2)+' ('+((Date.now()-t0)/1000).toFixed(1)+' s)');}
    if(opt('json'))fs.writeFileSync(opt('json'),JSON.stringify(R)+'\n');
  }else{
    process.stdout.write(fs.readFileSync(__filename,'utf8').split('\n').slice(1,40).join('\n')+'\n');
  }
}
