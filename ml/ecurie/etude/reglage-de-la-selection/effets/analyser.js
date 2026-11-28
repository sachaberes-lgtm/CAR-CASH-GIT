/* ===== L'ETUDE « EFFETS » : QUE FONT VRAIMENT LES MUTATIONS ? (27/11/2026, la tache de l'orchestrateur : « pour chaque mutant : sa difference
   au temoin, graine par graine ; la loi des effets qu'il faut donner a un simulateur de la selection ; les courses identiques ») =====
   Lit donnees/ (la copie figee par extraire.js ; rien n'est lu dans le dossier de l'evolution qui tourne) et ecrit :
   resultats.txt (les tableaux), resultats.json (tout), parametres-pour-le-simulateur.json (la loi des effets, avec ses fourchettes).
   Un seul processus, aucune course du jeu. La note F vient de ml/evolution/note.js (les memes fonctions que le maitre, en lecture).
   Usage : node analyser.js */
'use strict';
const fs=require('fs'),path=require('path');
const O=require('./outils');
const RAC=path.resolve(__dirname,'..','..','..','..','..');
const N=require(path.join(RAC,'ml','evolution','note.js'));
const GEN=require(path.join(RAC,'ml','evolution','genome.js'));
const D=path.join(__dirname,'donnees');
const t0=Date.now();
const sortie=[];const dire=s=>{sortie.push(s);console.log(s);};
const f2=x=>x==null||x!==x?'  -  ':(x>=0?'+':'')+x.toFixed(2);
const f1=x=>x==null||x!==x?' - ':x.toFixed(1);
const pc=x=>x==null||x!==x?' - ':(100*x).toFixed(0)+' %';
const lireJsonl=f=>fs.readFileSync(f,'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));

/* ===== 1. LES DONNEES ===== */
const lecture=JSON.parse(fs.readFileSync(path.join(D,'LECTURE.json'),'utf8'));
const cfg=JSON.parse(fs.readFileSync(path.join(D,'config.json'),'utf8'));
const L=[];for(const n of fs.readdirSync(D).filter(n=>/^courses-.*\.jsonl$/.test(n)))L.push(...lireJsonl(path.join(D,n)));
const GENS=lireJsonl(path.join(D,'generations.jsonl'));
/* les genomes et les genes mutes (avant / apres) : population.json au debut de la generation 1, quand les 26 pilotes etaient vivants
   (figee a part, population-g1-debut.json ; la population.json recopiee plus tard n'a plus les renvoyes) */
const POP=JSON.parse(fs.readFileSync(path.join(D,'population-g1-debut.json'),'utf8'));
const T=POP.temoin;
const BORNE={};for(const b of GEN.BORNES)BORNE[b.cle]=b;
const ENT=L.filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const epoques=[...new Set(ENT.map(l=>l.epoque))];
const parId=new Map();for(const l of ENT){if(!parId.has(l.id))parId.set(l.id,new Map());parId.get(l.id).set(l.graine,l);}
const S0=GENS[0].graines,S1=POP.grainesGeneration;
const vivant=Object.fromEntries(POP.vivants.map(v=>[v.id,v]));
const g0=POP.vivants.filter(v=>v.origine==='g0').map(v=>v.id);
const nes1=POP.vivants.filter(v=>v.ne===1).map(v=>v.id);
const dans=(M,S)=>new Map([...M].filter(([g])=>S.includes(g)));
dire(`ETUDE « EFFETS » — ${new Date().toISOString()}`);
dire(`Donnees figees le ${lecture.heureLocale} (${Object.entries(lecture.fichiers).map(([k,v])=>k+' '+(v.lignes!=null?v.lignes+' lignes':v.octets+' o')).join(', ')}).`);
dire(`${L.length} lignes de courses, ${ENT.length} d'entrainement mesurees, epoque(s) ${epoques.join(',')} ; generations dans generations.jsonl : ${GENS.map(g=>g.generation).join(',')}.`);
dire(`Temoin ${T} ; ${g0.length} mutants de la generation 0 ; ${nes1.length} nes a la generation 1 ; graines G0 ${S0.length}, G1 ${S1.length} (jouees par le temoin : ${[...parId.get(T).keys()].filter(g=>S1.includes(g)).length}).`);

/* ===== 2. CONTROLES (un cas dont on connait la reponse) ===== */
dire('\n== 0. CONTROLES ==');
/* (a) meme graine + meme empreinte => meme palier, meme survie, meme cause, memes touches */
{let paires=0,faux=0;const parG=new Map();for(const l of ENT){const k=l.graine+'|'+l.empreinte;if(!parG.has(k))parG.set(k,[]);parG.get(k).push(l);}
 /* l'empreinte est celle du bilan de la PARTIE (la route jouee) : les vues (ce que les yeux rendent, qui dependent de reglages comme bandeDecor)
    et les touches (une touche sans effet sur la partie) peuvent differer sans changer la partie ; on les compte a part */
 var vuesDiff=0,touchesDiff=0;
 for(const g of parG.values())for(let i=1;i<g.length;i++){paires++;const a=g[0],b=g[i];if(a.palier!==b.palier||a.survie_s!==b.survie_s||a.cause!==b.cause||a.pieces!==b.pieces||a.vols!==b.vols)faux++;
   if(a.empreinteVues!==b.empreinteVues)vuesDiff++;if(a.empreinteTouches!==b.empreinteTouches)touchesDiff++;}
 /* et l'inverse : meme palier + meme survie au dixieme mais empreinte differente (des courses peut-etre identiques que l'empreinte separerait a tort) */
 let presque=0;const parPS=new Map();for(const l of ENT){const k=l.graine+'|'+l.palier+'|'+l.survie_s+'|'+l.cause;if(!parPS.has(k))parPS.set(k,new Set());parPS.get(k).add(l.empreinte);}
 for(const s of parPS.values())if(s.size>1)presque+=s.size-1;
 dire(`(a) ${paires} paires de courses a la meme empreinte sur la meme graine : ${faux} different par le palier, la survie, la cause, les pieces ou les vols (attendu 0) ;`);
 dire(`    a partie identique, ${vuesDiff} ont d'autres vues et ${touchesDiff} d'autres touches (sans effet sur la partie : on les compte quand meme comme identiques).`);
 dire(`    ${presque} courses ont le meme palier, la meme survie et la meme cause qu'une autre sur la meme graine SANS la meme empreinte (des courses presque identiques).`);}
/* (b) la note : note.js sur les seules courses de la generation 0 redonne les F ecrits par le maitre dans generations.jsonl */
const REF=N.referenceEpoque();
{const L0=ENT.filter(l=>l.generation===0);const ids0=GENS[0].population.map(p=>p.id);
 const r=N.noter(L0,{REF,cfg:cfg.note,ids:ids0});let ecart=0;for(const p of GENS[0].population)ecart=Math.max(ecart,Math.abs(r.par[p.id].F-p.F),Math.abs(r.par[p.id].ahat-p.ahat));
 dire(`(b) note.js refait sur la generation 0 : plus grand ecart a la note du maitre (F et â) ${ecart.toExponential(2)} (attendu ~0 ; le maitre arrondit) ; sigma des residus ${r.sigmaRes.toFixed(3)} (maitre ${GENS[0].sigmaRes}).`);}
/* (c) le temoin contre lui-meme : difference nulle, toutes ses courses identiques */
{const ap=O.apparier(parId.get(T),parId.get(T));dire(`(c) temoin contre lui-meme : ${ap.identiques}/${ap.n} identiques, difference de palier ${ap.par.palier.moy}, classe « ${O.classer(ap)} » (attendu : nul exact).`);}

/* ===== 3. CHAQUE MUTANT CONTRE LE TEMOIN ===== */
const taille=m=>{const b=BORNE[m.cle];if(!b)return null;return b.type==='reel'?Math.abs(m.apres-m.avant)/(b.max-b.min):1;};
/* genes muets par construction (lecture de genome.js, e2ea8d2c9, lignes 262 et 266 : la valeur de volRetour n'est ecrite que si volRetourOn vaut 1,
   les cinq reglages de la loi « retour » ne sont ecrits que si retourOn vaut 1 ; au temoin, les deux drapeaux valent 0) */
const MUET_SI={volRetour:'volRetourOn',retMarge:'retourOn',retCap:'retourOn',retGain:'retourOn',retAvance:'retourOn',retourPrime:'retourOn'};
const muetParConstruction=(m,A)=>MUET_SI[m.cle]!=null&&!A[MUET_SI[m.cle]];
const fiche={};
function etudier(id,refId,S,refMap){
  const A=dans(parId.get(id)||new Map(),S),B=refMap?dans(refMap,S):dans(parId.get(refId),S);
  const ap=O.apparier(A,B,{graine:id.length});
  return ap;}
dire('\n== 1. CHAQUE MUTANT DE LA GENERATION 0 CONTRE LE TEMOIN, GRAINE PAR GRAINE (G0 + G1) ==');
dire('palier : difference moyenne mutant - temoin [IC 95 % Student], p de permutation ; survie en s ; F : note.comparer (bootstrap apparie, 400 tirages)');
dire('id           | n  | ident | dPalier [IC 95 %]        |   p   | dSurvie [IC 95 %]     |  dF  ± se  |  dE   | G0 dP | G1 dP | classe        | genes mutes (taille / etendue ; * = muet par construction)');
const Lid=id=>ENT.filter(l=>l.id===id);
for(const id of g0){
  const ap=etudier(id,T,S0.concat(S1));
  const a0=etudier(id,T,S0),a1=etudier(id,T,S1);
  const cmp=N.comparer(Lid(id),Lid(T),{REF,cfg:cfg.note,tirages:400});
  const v=vivant[id],mut=v.mutes.map(m=>({...m,type:BORNE[m.cle]?BORNE[m.cle].type:'?',taille:taille(m),muet:muetParConstruction(m,v.genome.A)}));
  fiche[id]={id,origine:'g0',parents:v.parents,ref:T,n:ap.n,graines:ap.graines,identiques:ap.identiques,grainesIdentiques:ap.grainesIdentiques,
    palier:{moy:ap.par.palier.moy,se:ap.par.palier.se,ic:ap.par.palier.ic,p:ap.par.palier.p,d:ap.par.palier.d},
    survie:{moy:ap.par.survie_s.moy,se:ap.par.survie_s.se,ic:ap.par.survie_s.ic,p:ap.par.survie_s.p},
    G0:{n:a0.n,moy:a0.par.palier.moy,se:a0.par.palier.se,identiques:a0.identiques},G1:{n:a1.n,moy:a1.par.palier.moy,se:a1.par.palier.se,identiques:a1.identiques},
    F:{dF:cmp.dF,se_dF:cmp.se_dF,dE:cmp.dE,se_dE:cmp.se_dE,dPalier:cmp.dPalier},classe:O.classer(ap),mutes:mut};
  const x=fiche[id];
  dire(`${id} | ${String(x.n).padStart(2)} | ${String(x.identiques).padStart(2)}/${String(x.n).padEnd(2)}| ${f2(x.palier.moy)} [${f2(x.palier.ic[0])} ; ${f2(x.palier.ic[1])}]`.padEnd(64)+
    `| ${x.palier.p.toFixed(3)} | ${f1(x.survie.moy).padStart(6)} [${f1(x.survie.ic[0])} ; ${f1(x.survie.ic[1])}]`.padEnd(30)+
    `| ${f2(x.F.dF)} ± ${x.F.se_dF==null?'-':x.F.se_dF.toFixed(2)} | ${f2(x.F.dE)} | ${f2(x.G0.moy)} | ${f2(x.G1.moy)} | ${x.classe.padEnd(13)} | `+
    mut.map(m=>`${m.cle}${m.muet?'*':''}(${m.type==='reel'?m.taille.toFixed(2):m.avant+'>'+m.apres})`).join(' '));}

/* les effets se repetent-ils d'un lot de graines a l'autre ? (correlation entre mutants de dPalier sur G0 et sur G1) */
const nonId=g0.filter(id=>fiche[id].identiques<fiche[id].n);
const corr=(X,Y)=>{const mx=O.moy(X),my=O.moy(Y);let s=0,sx=0,sy=0;for(let i=0;i<X.length;i++){s+=(X[i]-mx)*(Y[i]-my);sx+=(X[i]-mx)**2;sy+=(Y[i]-my)**2;}return s/Math.sqrt(sx*sy);};
const avecG1=nonId.filter(id=>fiche[id].G1.n>0);
const rG=avecG1.length>2?corr(avecG1.map(id=>fiche[id].G0.moy),avecG1.map(id=>fiche[id].G1.moy)):NaN;
/* sous « aucun effet vrai », la correlation de deux lots independants est ~0 : on la compare a des permutations des mutants */
let rPerm=0;{const R=O.mulberry32(99),X=avecG1.map(id=>fiche[id].G0.moy),Y=avecG1.map(id=>fiche[id].G1.moy);let k=0;const T2=5000;
 for(let t=0;t<T2;t++){const Z=Y.slice();for(let i=Z.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[Z[i],Z[j]]=[Z[j],Z[i]];}if(corr(X,Z)>=rG)k++;}rPerm=(k+1)/(T2+1);}
dire(`\nRepetabilite : correlation entre mutants (${avecG1.length} non identiques au temoin) de leur dPalier sur les graines G0 et sur les graines G1 : r = ${rG.toFixed(2)} (p unilateral de permutation ${rPerm.toFixed(3)}).`);
const cls={};for(const id of g0)cls[fiche[id].classe]=(cls[fiche[id].classe]||0)+1;
dire(`Classes (sur le palier, IC 95 %) : ${Object.entries(cls).map(([k,v])=>k+' '+v).join(', ')} sur ${g0.length} mutants. Faux positifs attendus a 5 % : ${(0.05*nonId.length).toFixed(1)} (${0.025*nonId.length} de chaque cote).`);
{const sig=g0.filter(id=>fiche[id].F.dF!=null&&Math.abs(fiche[id].F.dF)>2*fiche[id].F.se_dF);
 dire(`Sur la note F (|dF| > 2 se) : ${sig.length} mutant(s) : ${sig.map(id=>id+' '+f2(fiche[id].F.dF)).join(', ')||'aucun'}.`);}

/* ===== 4. LES NES DE LA GENERATION 1 : contre leur parent (la mutation seule) et contre le temoin ===== */
dire('\n== 2. LES NES DE LA GENERATION 1 (12 graines G1) : contre leur parent, et contre le temoin ==');
dire('id           | origine    | parent(s)                 | n  | ident. parent | dP vs parent [IC]        | ident. temoin | dP vs temoin [IC]        | dP vs les 20 de G0 [IC] | genes mutes');
/* la reference la moins bruitee pour un ne de G1 : la moyenne des 20 pilotes de la generation 0 sur chaque graine G1 (le temoin seul y a son bruit) */
const moyG0=new Map();for(const g of S1){const v=[T].concat(g0).map(i=>parId.get(i)&&parId.get(i).get(g)).filter(Boolean);if(v.length===g0.length+1)moyG0.set(g,{palier:O.moy(v.map(l=>l.palier)),survie_s:O.moy(v.map(l=>l.survie_s)),empreinte:null});}
for(const id of nes1){
  const v=vivant[id];let refMap,refTxt;
  if(v.origine==='croisement'){
    /* la moyenne des deux parents, graine par graine (empreinte nulle : jamais « identique » a une moyenne) */
    const [p1,p2]=v.parents,M=new Map();for(const g of S1){const a=parId.get(p1)&&parId.get(p1).get(g),b=parId.get(p2)&&parId.get(p2).get(g);if(a&&b)M.set(g,{palier:(a.palier+b.palier)/2,survie_s:(a.survie_s+b.survie_s)/2,empreinte:null});}
    refMap=M;refTxt=p1+'+'+p2;}
  else{refMap=parId.get(v.parents[0]);refTxt=v.parents[0];}
  const apP=etudier(id,null,S1,refMap),apT=etudier(id,T,S1),apM=etudier(id,null,S1,moyG0);
  /* un croisement : combien de ses courses sont identiques a celles de l'un de ses parents ? */
  let identParent=apP.identiques;
  if(v.origine==='croisement'){identParent=0;for(const g of S1){const c=parId.get(id)&&parId.get(id).get(g);if(!c)continue;for(const p of v.parents){const q=parId.get(p)&&parId.get(p).get(g);if(q&&q.empreinte===c.empreinte){identParent++;break;}}}}
  const mut=v.mutes.map(m=>({...m,type:BORNE[m.cle]?BORNE[m.cle].type:'?',taille:taille(m),muet:muetParConstruction(m,v.genome.A)}));
  fiche[id]={id,origine:v.origine,parents:v.parents,ref:refTxt,n:apP.n,identiquesParent:identParent,identiquesTemoin:apT.identiques,
    palier:{moy:apP.par.palier.moy,se:apP.par.palier.se,ic:apP.par.palier.ic,p:apP.par.palier.p,d:apP.par.palier.d},
    vsTemoin:{n:apT.n,moy:apT.par.palier.moy,se:apT.par.palier.se,ic:apT.par.palier.ic},vsG0:{n:apM.n,moy:apM.par.palier.moy,se:apM.par.palier.se,ic:apM.par.palier.ic},mutes:mut,
    classe:apP.n&&identParent===apP.n&&v.origine!=='croisement'?'nul exact':O.classer(apP)};
  const x=fiche[id];
  dire(`${id} | ${v.origine.padEnd(10)} | ${refTxt.padEnd(25)} | ${String(x.n).padStart(2)} | ${String(identParent).padStart(5)}/${x.n}      | ${f2(x.palier.moy)} [${f2(x.palier.ic[0])} ; ${f2(x.palier.ic[1])}]`.padEnd(120)+
    ` | ${String(apT.identiques).padStart(5)}/${apT.n}      | ${f2(x.vsTemoin.moy)} [${f2(x.vsTemoin.ic[0])} ; ${f2(x.vsTemoin.ic[1])}] | ${f2(x.vsG0.moy)} [${f2(x.vsG0.ic[0])} ; ${f2(x.vsG0.ic[1])}] | `+mut.map(m=>`${m.cle}${m.muet?'*':''}`).join(' '));}

/* ===== 5. LE BRUIT, RECONTROLE SUR CES DONNEES ===== */
dire('\n== 3. LE BRUIT DU PALIER (l\'etude du bruit : ecart-type residuel 3,21 par course, sur 300 s) ==');
const fitTous=N.ajuster(ENT,{passes:10,retrecir:12});
/* sans les doublons : une seule course par (graine, empreinte), la premiere jouee */
const vus=new Set(),distinctes=[];for(const l of ENT.slice().sort((a,b)=>a.date<b.date?-1:1)){const k=l.graine+'|'+l.empreinte;if(vus.has(k))continue;vus.add(k);distinctes.push(l);}
const fitDist=N.ajuster(distinctes,{passes:10,retrecir:12});
/* la difference appariee mutant - temoin sur les graines NON identiques, centree par mutant : son ecart-type, et la correlation qu'il implique */
let ssd=0,ddl=0;const dNI=[];for(const id of g0){const x=fiche[id];const d=x.palier.d.filter((_,i)=>!x.grainesIdentiques.includes(x.graines[i]));
  if(d.length>1){const m=O.moy(d);for(const v of d){ssd+=(v-m)**2;dNI.push(v-m);}ddl+=d.length-1;}}
const sigD=Math.sqrt(ssd/ddl);
const tem=[...parId.get(T).values()].map(l=>l.palier),cof=L.filter(l=>l.id===T&&l.usage==='coffre'&&l.mesuree).map(l=>l.palier);
const rhoClone=1-sigD*sigD/(2*fitDist.sigmaRes*fitDist.sigmaRes);
dire(`Modele pilote + graine (note.ajuster) sur ${ENT.length} courses : sigma des residus ${fitTous.sigmaRes.toFixed(2)} ; sur les ${distinctes.length} courses distinctes (doublons retires) : ${fitDist.sigmaRes.toFixed(2)}.`);
dire(`Difference appariee mutant - temoin, graines non identiques, centree par mutant : ecart-type ${sigD.toFixed(2)} (${ddl} ddl) ; deux pilotes independants donneraient ${(Math.SQRT2*fitDist.sigmaRes).toFixed(2)} (racine(2) x sigma) ;`);
dire(`  la correlation mutant / temoin sur une meme graine qui en decoule : ${rhoClone.toFixed(2)} (l'etude du bruit : 0,16 entre pilotes differents).`);
dire(`Temoin seul : palier moyen ${O.moy(tem).toFixed(2)}, ecart-type entre graines ${O.etype(tem).toFixed(2)} (${tem.length} graines d'entrainement) ; coffre ${O.moy(cof).toFixed(2)} ± ${O.etype(cof).toFixed(2)} (${cof.length} graines).`);
const seMed=O.mediane(g0.filter(id=>fiche[id].identiques<fiche[id].n).map(id=>fiche[id].palier.se));
dire(`Erreur-type mediane du dPalier d'un mutant (${fiche[g0[0]].n} graines) : ${seMed.toFixed(2)} ; plus petit effet vu 8 fois sur 10 (bilateral 5 %) : ${(2.8*seMed).toFixed(2)} palier.`);
dire(`Graines appariees qu'il faudrait pour voir un effet de 0,5 palier 8 fois sur 10 : ${Math.ceil((2.8*sigD/0.5)**2)} ; de 1 palier : ${Math.ceil((2.8*sigD/1)**2)}.`);

/* ===== 6. LA LOI DES EFFETS ===== */
dire('\n== 4. LA LOI DES EFFETS DES MUTATIONS (pour un simulateur de la selection) ==');
const exacts=g0.filter(id=>fiche[id].identiques===fiche[id].n);
const autres=g0.filter(id=>fiche[id].identiques<fiche[id].n);
const temMoy=O.moy(tem);
const cpE=O.clopperPearson(exacts.length,g0.length);
dire(`Mutants dont TOUTES les courses sont identiques au temoin (effet exactement nul sur ces graines) : ${exacts.length}/${g0.length} = ${pc(exacts.length/g0.length)} [IC 95 % ${pc(cpE[0])} ; ${pc(cpE[1])}].`);
/* tous les mutants sont compares au MEME temoin sur les MEMES graines : outils.loiDesEffets (verifie par verifier.js, cas 2) */
const X={lots:[S0,S1],sigma:fitDist.sigmaRes,tirages:400,graine:2711,mut:autres.map(id=>{const x=fiche[id];return {d:new Map(x.graines.map((g,i)=>[g,x.palier.d[i]])),ident:new Set(x.grainesIdentiques)};})};
const LOI=O.loiDesEffets(X);
/* pour comparer : l'ajustement qui compte le bruit du temoin chez chaque mutant (il ecrase tau vers 0 : verifier.js) */
const naif=O.ajusterNormale(autres.map(id=>fiche[id].palier.moy),autres.map(id=>fiche[id].palier.se),{pas:0.05});
dire(`Les ${autres.length} autres : effets vrais s_i ~ N(mu, tau), mesures contre le meme temoin (bootstrap des graines ET des mutants, 400 tirages) :`);
dire(`  mu (effet moyen d'un mutant g0, en palier) = ${f2(LOI.mu)} [IC 95 % ${f2(LOI.icMu[0])} ; ${f2(LOI.icMu[1])}]`);
dire(`  tau (etalement des effets vrais entre mutants) : (A) moitie G0 / moitie G1 ${LOI.tauA.toFixed(2)} (tau² ${LOI.tau2A.toFixed(2)}) [${LOI.icTauA[0].toFixed(2)} ; ${LOI.icTauA[1].toFixed(2)}] ;`);
dire(`      (B) moments ${LOI.tauB.toFixed(2)} (tau² ${LOI.tau2B.toFixed(2)}) [${LOI.icTauB[0].toFixed(2)} ; ${LOI.icTauB[1].toFixed(2)}] ; (C) vraisemblance ${LOI.tauC.toFixed(2)} [vraisemblance ${LOI.icTauCvrais[0].toFixed(2)} ; ${LOI.icTauCvrais[1].toFixed(2)}] [bootstrap ${LOI.icTauC[0].toFixed(2)} ; ${LOI.icTauC[1].toFixed(2)}]`);
dire(`      (l'ajustement naif, qui compte le bruit du temoin chez chacun : tau ${naif.tau.toFixed(2)}, mu ${f2(naif.mu)})`);
const fourchette={mu:LOI.icMu,tau:[0,Math.max(LOI.icTauA[1],LOI.icTauB[1],LOI.icTauC[1],LOI.icTauCvrais[1])]};
const SEUILS={letale:(mu,tau)=>O.partSous(mu,tau,-temMoy/2),nuisible:(mu,tau)=>O.partSous(mu,tau,-0.5),
  quasiNeutre:(mu,tau)=>O.partSous(mu,tau,0.5)-O.partSous(mu,tau,-0.5),utile:(mu,tau)=>O.partSur(mu,tau,0.5),meilleure:(mu,tau)=>O.partSur(mu,tau,0)};
/* les parts : au point (mu, tau de C), et leur fourchette sur les tirages du bootstrap (chaque tirage : son mu et son tau C) */
dire(`  Fourchette retenue : mu ${f2(fourchette.mu[0])} ; ${f2(fourchette.mu[1])}, tau 0 ; ${fourchette.tau[1].toFixed(2)} (la plus haute des bornes de A, B, C).`);
dire(`  Parts parmi les mutants qui changent quelque chose (seuils : letale = perd plus de la moitie du palier du temoin, < ${(-temMoy/2).toFixed(2)} ; nuisible < -0,5 ; quasi neutre |s| < 0,5 ; utile > +0,5) :`);
const qq=(A,p)=>{const C=A.slice().sort((x,y)=>x-y);return C[Math.round(p*(C.length-1))];};
for(const k of Object.keys(SEUILS)){const v=LOI.tirages.mu.map((m,i)=>SEUILS[k](m,LOI.tirages.tauC[i]));fourchette[k]=[qq(v,.025),qq(v,.975)];
  dire(`    ${k.padEnd(12)} au point ${pc(SEUILS[k](LOI.mu,LOI.tauC)).padStart(5)} ; bootstrap 2,5 %-97,5 % : ${pc(fourchette[k][0])} ; ${pc(fourchette[k][1])}`);}
/* trois scenarios pour un simulateur : la loi depend surtout de mu, mal connu (le temoin n'a que 24 courses) */
const SCEN={prudent:[fourchette.mu[0],fourchette.tau[1]],central:[LOI.mu,LOI.tauC],optimiste:[fourchette.mu[1],fourchette.tau[1]],neutreEtroit:[0,0.3]};
dire(`  Scenarios (mu, tau) -> parts letale / nuisible / quasi neutre / utile / meilleure que le parent :`);
for(const [k,[m,t]] of Object.entries(SCEN))dire(`    ${k.padEnd(13)} mu ${f2(m)} tau ${t.toFixed(2)} : ${Object.keys(SEUILS).map(s=>pc(SEUILS[s](m,t))).join(" / ")}`);
fourchette.scenarios=Object.fromEntries(Object.entries(SCEN).map(([k,[m,t]])=>[k,{mu:+m.toFixed(3),tau:+t.toFixed(3),parts:Object.fromEntries(Object.keys(SEUILS).map(s=>[s,+SEUILS[s](m,t).toFixed(3)]))}]));
/* ce que la selection peut voir : la fiabilite du classement des vivants sur leurs n courses (tau² / (tau² + sigma²/n)) */
{const s2=fitDist.sigmaRes**2;const fi=(t,n)=>t*t/(t*t+s2/n);
 dire(`  Fiabilite du classement des mutants par la note (part de la variance des notes qui est vraie) : tau ${LOI.tauC.toFixed(2)} -> ${pc(fi(LOI.tauC,24))} a 24 courses, ${pc(fi(LOI.tauC,12))} a 12 ; tau ${fourchette.tau[1].toFixed(2)} -> ${pc(fi(fourchette.tau[1],24))} a 24, ${pc(fi(fourchette.tau[1],12))} a 12.`);
 dire(`  Correlation moitie/moitie attendue (12 + 12 graines) : ${fi(LOI.tauC,12).toFixed(2)} pour tau ${LOI.tauC.toFixed(2)}, ${fi(fourchette.tau[1],12).toFixed(2)} pour tau ${fourchette.tau[1].toFixed(2)} ; mesuree ${rG.toFixed(2)}.`);
 fourchette.fiabilite={tauCentral:{n24:+fi(LOI.tauC,24).toFixed(3),n12:+fi(LOI.tauC,12).toFixed(3)},tauHaut:{n24:+fi(fourchette.tau[1],24).toFixed(3),n12:+fi(fourchette.tau[1],12).toFixed(3)}};}
/* les comptes bruts, sans modele */
const nPire=g0.filter(id=>fiche[id].classe==='pire').length,nMieux=g0.filter(id=>fiche[id].classe==='meilleur ?').length;
const cpP=O.clopperPearson(nPire,g0.length),cpM=O.clopperPearson(nMieux,g0.length);
dire(`Comptes bruts (IC 95 % de Student par mutant) : nettement pires ${nPire}/${g0.length} [part vraie ${pc(cpP[0])} ; ${pc(cpP[1])}], peut-etre meilleurs ${nMieux}/${g0.length} [${pc(cpM[0])} ; ${pc(cpM[1])}].`);
/* les letales : un mutant qui perdrait la moitie du palier se verrait (plus de 4 erreurs-types) ; on compte les mutants g0 et les nes de G1 */
{const tous=g0.concat(nes1),let_=tous.filter(id=>fiche[id].palier.ic[1]< -temMoy/2).length,cp=O.clopperPearson(let_,tous.length);
 dire(`Letales (IC entierement sous ${(-temMoy/2).toFixed(2)}) : ${let_}/${tous.length} (mutants g0 + nes de G1) => part vraie des letales [${pc(cp[0])} ; ${pc(cp[1])}].`);fourchette.letaleComptee=cp;}
/* ce qu'on ne peut PAS dire : une borne sur les mutations utiles ASSEZ grandes pour etre vues */
const s80=2.8*seMed;
dire(`Une mutation utile de +${s80.toFixed(1)} palier ou plus serait vue 8 fois sur 10 ; ${nMieux} vue(s) => part des mutations utiles d'au moins +${s80.toFixed(1)} : au plus ~${pc(Math.min(1,cpM[1]/0.8))} (borne haute a 95 %, puissance 0,8). Sous ce seuil, ces courses ne disent rien.`);
/* la note F : dF par lot (note.comparer sur les graines de chaque lot) ; tau_F par la moitie contre la moitie */
const LidS=(id,S)=>ENT.filter(l=>l.id===id&&S.includes(l.graine));
const dFlot=autres.map(id=>[0,1].map(k=>N.comparer(LidS(id,[S0,S1][k]),LidS(T,[S0,S1][k]),{REF,cfg:cfg.note,tirages:20}).dF));
const ddF=autres.map(id=>fiche[id].F.dF),dEs=autres.map(id=>fiche[id].F.dE);
const covF=(()=>{const A=dFlot.map(x=>x[0]),B=dFlot.map(x=>x[1]),ma=O.moy(A),mb=O.moy(B);let s=0;for(let i=0;i<A.length;i++)s+=(A[i]-ma)*(B[i]-mb);return s/(A.length-1);})();
let covFb=[];{const Rb=O.mulberry32(5);for(let t=0;t<2000;t++){const I=autres.map(()=>Math.floor(Rb()*autres.length));const A=I.map(i=>dFlot[i][0]),B=I.map(i=>dFlot[i][1]),ma=O.moy(A),mb=O.moy(B);let s=0;for(let i=0;i<A.length;i++)s+=(A[i]-ma)*(B[i]-mb);covFb.push(s/(A.length-1));}covFb.sort((a,b)=>a-b);}
const tauF=[covF,covFb[50],covFb[1949]].map(x=>x>0?Math.sqrt(x):0);
dire(`Sur la note F : dF moyen ${f2(O.moy(ddF))} (dE moyen ${f2(O.moy(dEs))}, ET des dE entre mutants ${O.etype(dEs).toFixed(2)} : l'ecart aux joueurs ne bouge presque pas) ; tau_F moitie/moitie ${tauF[0].toFixed(2)} [${tauF[1].toFixed(2)} ; ${tauF[2].toFixed(2)}].`);
const fit={mu:LOI.mu,tau:LOI.tauC},fitF={mu:O.moy(ddF),tau:tauF[0],icTau:[tauF[1],tauF[2]]};

/* ===== 7. LES GENES ===== */
dire('\n== 5. LES GENES : lesquels cassent, lesquels ne font rien ? ==');
const parGene={};
for(const x of Object.values(fiche)){
  for(const m of x.mutes){
    const g=parGene[m.cle]||(parGene[m.cle]={cle:m.cle,type:m.type,porteurs:[],muetParConstruction:0,dansNulExact:0,dansPire:0,dP:[]});
    g.porteurs.push(x.id);if(m.muet)g.muetParConstruction++;if(x.classe==='nul exact')g.dansNulExact++;if(x.classe==='pire')g.dansPire++;g.dP.push(x.palier.moy);}}
const lg=Object.values(parGene).sort((a,b)=>O.moy(a.dP)-O.moy(b.dP));
dire('gene                | type    | porteurs | dans « pire » | dans « nul exact » | muet par construction | dPalier moyen des porteurs');
for(const g of lg)dire(`${g.cle.padEnd(19)} | ${g.type.padEnd(7)} | ${String(g.porteurs.length).padStart(8)} | ${String(g.dansPire).padStart(13)} | ${String(g.dansNulExact).padStart(18)} | ${String(g.muetParConstruction).padStart(21)} | ${f2(O.moy(g.dP))}`);
/* les mutations reelles muettes par construction : part attendue au tirage (les 64 reels de CONTINUS, dont 6 muets au temoin) */
const nCont=GEN.CONTINUS.filter(c=>BORNE[c]&&!/^(geste|gst)/.test(c)).length;
let mReels=0,mMuets=0;for(const x of Object.values(fiche))for(const m of x.mutes)if(m.type==='reel'){mReels++;if(m.muet)mMuets++;}
dire(`Mutations de reels observees : ${mReels}, dont ${mMuets} muettes par construction (${pc(mMuets/mReels)}) ; au tirage : ${Object.keys(MUET_SI).length} reels muets sur les reels du genome v:1 (64) = ${pc(6/64)}.`);

/* ===== 8. LES COURSES IDENTIQUES ===== */
dire('\n== 6. LES COURSES IDENTIQUES (meme graine, meme empreinte) ==');
const grp=new Map();for(const l of ENT){const k=l.graine+'|'+l.empreinte;if(!grp.has(k))grp.set(k,[]);grp.get(k).push(l);}
let doublons=0,msDoublons=0,msTout=0,avecTemoin=0,sansTemoin=0;const parGen={};
for(const l of ENT){msTout+=l.ms||0;const G=l.generation;parGen[G]=parGen[G]||{courses:0,doublons:0,ms:0,msD:0};parGen[G].courses++;parGen[G].ms+=l.ms||0;}
for(const g of grp.values()){if(g.length<2)continue;const tri=g.slice().sort((a,b)=>a.date<b.date?-1:1);
  const aT=g.some(l=>l.id===T);
  for(const l of tri.slice(1)){doublons++;msDoublons+=l.ms||0;parGen[l.generation].doublons++;parGen[l.generation].msD+=l.ms||0;if(aT)avecTemoin++;else sansTemoin++;}}
dire(`${doublons} courses sur ${ENT.length} (${pc(doublons/ENT.length)}) rejouent EXACTEMENT une course deja jouee (meme graine, meme empreinte) : ${avecTemoin} copies d'une course du temoin, ${sansTemoin} entre deux autres pilotes.`);
dire(`Temps de calcul de ces courses : ${(msDoublons/3600000).toFixed(2)} h sur ${(msTout/3600000).toFixed(2)} h de courses (${pc(msDoublons/msTout)}) ; par generation : ${Object.entries(parGen).map(([G,x])=>`G${G} ${x.doublons}/${x.courses} courses, ${pc(x.msD/x.ms)} du temps`).join(' ; ')}.`);
{const c=ENT.filter(l=>l.id!==T);const ms=O.moy(c.map(l=>l.ms));dire(`Duree moyenne d'une course (ms reel, 4 a la fois sur le Xeon) : ${(ms/1000).toFixed(1)} s ; une course identique coute autant qu'une autre (l'empreinte n'est connue qu'a la fin).`);}
{const idT=new Set();for(const g of grp.values())if(g.length>1)for(const l of g)idT.add(l);const S=ENT.filter(l=>idT.has(l)).map(l=>l.survie_s),A=ENT.filter(l=>!idT.has(l)).map(l=>l.survie_s);
 dire(`Les courses jouees en double (toutes les copies) durent en moyenne ${O.moy(S).toFixed(1)} s (mediane ${O.mediane(S).toFixed(1)}), les autres ${O.moy(A).toFixed(1)} s (mediane ${O.mediane(A).toFixed(1)}) : ce sont surtout des courses courtes, finies avant que les genes changes servent.`);}
/* graine par graine : quelle part des mutants g0 copie le temoin ? et pourquoi (genes) */
const partId=g0.map(id=>fiche[id].identiques/fiche[id].n);
dire(`Part des courses d'un mutant g0 identiques au temoin : mediane ${pc(O.mediane(partId))} ; repartition : ${[0,0.25,0.5,0.75,1].map((s,i,A)=>i<A.length-1?`${pc(s)}-${pc(A[i+1])} : ${partId.filter(p=>p>=s&&(i===A.length-2?p<=A[i+1]:p<A[i+1])).length}`:'').filter(Boolean).join(', ')}.`);
dire('mutant       | identiques | genes mutes (* = muet par construction)');
for(const id of g0.slice().sort((a,b)=>fiche[b].identiques/fiche[b].n-fiche[a].identiques/fiche[a].n)){const x=fiche[id];if(!x.identiques)continue;
  dire(`${id} | ${String(x.identiques).padStart(4)}/${x.n}    | ${x.mutes.map(m=>m.cle+(m.muet?'*':'')+(m.type==='reel'?'('+m.taille.toFixed(2)+')':'('+m.avant+'>'+m.apres+')')).join(' ')}`);}
for(const id of nes1){const x=fiche[id];dire(`${id} (ne G1, ${x.origine}) : ${x.identiquesParent}/${x.n} identiques a un parent, ${x.identiquesTemoin}/${x.n} au temoin ; ${x.mutes.map(m=>m.cle+(m.muet?'*':'')).join(' ')}`);}

/* ===== 9. ECRITURE ===== */
const res={date:new Date().toISOString(),lecture,controles:{},fiches:fiche,repetabilite:{r:rG,p:rPerm,mutants:avecG1.length},
  bruit:{sigmaResTous:fitTous.sigmaRes,sigmaResDistinctes:fitDist.sigmaRes,sigmaDiffAppariee:sigD,ddl,rhoMutantTemoin:rhoClone,temoin:{moy:temMoy,et:O.etype(tem),n:tem.length},coffre:{moy:O.moy(cof),et:O.etype(cof),n:cof.length},seMedianMutant:seMed},
  loi:{exacts:exacts.length,mutants:g0.length,icExacts:cpE,loiDesEffets:{...LOI,d:undefined,v:undefined},naif,fourchette,F:{...fitF,dFlot},pires:nPire,meilleurs:nMieux},
  doublons:{n:doublons,courses:ENT.length,avecTemoin,sansTemoin,h:msDoublons/3600000,hTotal:msTout/3600000,parGen},genes:lg.map(g=>({...g,dPmoy:O.moy(g.dP)}))};
fs.writeFileSync(path.join(__dirname,'resultats.json'),JSON.stringify(res,null,1));
const r2=x=>+x.toFixed(3);
const param={
  quoi:"La loi des effets d'une mutation sur le palier (et la note F), mesuree sur la vraie evolution du 27/11 (genome v:1, 86 genes ; generation 0 : temoin + 19 mutants de 3 a 6 genes, sigma 0,15 ; generations 0 et 1 : 24 graines appariees). Ecrit par ml/ecurie/etude/reglage-de-la-selection/effets/analyser.js.",
  date:res.date,donnees:lecture.heureLocale,
  unite:"palier moyen par graine ; un effet s = palier(mutant) - palier(parent) sur les memes graines",
  bruit:{sigmaResiduelParCourse:{estimation:r2(fitDist.sigmaRes),note:"modele pilote + graine, courses distinctes, tmax 900 s (l'etude du bruit : 3,21 sur 300 s)"},
    correlationEnfantParentMemeGraine:{estimation:r2(rhoClone),note:"hors courses identiques ; entre pilotes sans parente : 0,16 (etude du bruit)"},
    ecartTypeDifferenceAppariee:{estimation:r2(sigD),note:"par graine, enfant - parent, hors courses identiques"},
    partDesCoursesIdentiquesAuParent:{estimation:r2(O.moy(partId)),note:"moyenne sur les mutants g0 ; une course identique donne une difference exactement nulle"}},
  loi:{
    partMutantsSansAucunEffet:{estimation:r2(exacts.length/g0.length),ic95:cpE.map(r2),note:"toutes les courses identiques au temoin"},
    effetsDesAutres:{loi:"normale (supposee)",mu:{estimation:r2(fit.mu),fourchette:fourchette.mu.map(r2)},tau:{estimation:r2(fit.tau),fourchette:fourchette.tau.map(r2),note:"estimation (C) vraisemblance ; (A) moitie/moitie et (B) moments dans resultats.json ; borne haute = la plus haute des trois"}},
    partsParmiLesMutantsQuiChangentQuelqueChose:Object.fromEntries(Object.keys(SEUILS).map(k=>[k,{estimation:r2(SEUILS[k](fit.mu,fit.tau)),fourchette:fourchette[k].map(r2)}])),
    fourchettes:"mu : bootstrap des graines et des mutants (le bruit du temoin, commun a tous, compris) ; tau : de 0 a la plus haute des bornes des trois estimations ; parts : quantiles 2,5 %-97,5 % sur les tirages du bootstrap (mu et tau C de chaque tirage) ; la forme normale est supposee",
    scenarios:fourchette.scenarios,
    fiabiliteDuClassement:fourchette.fiabilite,
    letalesComptees:{part:0,ic95:fourchette.letaleComptee.map(r2),note:"aucun mutant (g0 et nes de G1) ne perd la moitie du palier ; borne de Clopper-Pearson"},
    seuils:{letale:r2(-temMoy/2),nuisible:-0.5,utile:0.5},
    noteF:{mu:{estimation:r2(fitF.mu),note:"F = palier - 4 E ; E ne bouge presque pas, la fourchette de mu en palier vaut a peu pres pour F"},tau:{estimation:r2(fitF.tau),ic95:fitF.icTau.map(r2)}}},
  ceQuOnNePeutPasDire:`La part des mutations utiles : aucune mutation n'est nettement meilleure, mais avec ${fiche[g0[0]].n} graines on ne voit qu'un effet de +${s80.toFixed(1)} palier ou plus. La loi normale ajustee donne une part d'utiles (> +0,5) entre ${pc(fourchette.utile[0])} et ${pc(fourchette.utile[1])} : c'est la forme supposee (normale) qui la donne, pas les courses. Un simulateur doit essayer plusieurs valeurs dans cette fourchette.`,
  genesMuetsParConstruction:{genes:Object.keys(MUET_SI),part:r2(6/64),note:"tant que volRetourOn / retourOn valent 0 (genome.js e2ea8d2c9, lignes 262, 266)"},
  /* (27/11, la relecture) l'ancienne consigne « course d'enfant = course du parent + s + bruit apparie d'ecart-type 4,33 » donnait a l'enfant un bruit
     de racine(3,26² + 4,33²) = 5,4 par course : les 4,33 contiennent deja le bruit des DEUX pilotes */
  aSimuler:"mutant : avec la part partMutantsSansAucunEffet, effet 0 et courses identiques au parent (meme bruit) ; sinon s ~ N(mu, tau). Une course d'un pilote = son niveau vrai + la difficulte de la graine + e, e d'ecart-type sigmaResiduelParCourse ; sur une graine non identique, e(enfant) = r·e(parent) + racine(1 - r²)·sigma·z, r = correlationEnfantParentMemeGraine. Ne pas ajouter a la course du parent un bruit independant d'ecart-type ecartTypeDifferenceAppariee : il contient deja le bruit des deux pilotes (relecture du 27/11). Attention : partMutantsSansAucunEffet et partDesCoursesIdentiquesAuParent sont mesures sur les mutants g0 (4,8 reels changes en moyenne) ; les naissances « mutation » ordinaires (1 + Poisson(2) reels) en ont moins : sur les 3 de la generation 1, 1 nul exact et 14 courses sur 36 identiques au parent (relecture/contre-verifier.txt) ; a balayer de 0 a 0,4."};
fs.writeFileSync(path.join(__dirname,'parametres-pour-le-simulateur.json'),JSON.stringify(param,null,1));
dire(`\n(${((Date.now()-t0)/1000).toFixed(1)} s)`);
fs.writeFileSync(path.join(__dirname,'resultats.txt'),sortie.join('\n')+'\n');
