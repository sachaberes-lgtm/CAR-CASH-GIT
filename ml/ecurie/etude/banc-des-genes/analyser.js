#!/usr/bin/env node
/* ===== LE BANC DES GENES : LES CHIFFRES (2026-11-28, l'agent « banc des genes » : « chaque interrupteur allume aide-t-il, nuit-il, ou ne
   sait-on pas ? ») =====
   Lit les courses de ./etat (ecrites par jouer.js) et etat/bras.json, et pour chaque bras contre le bras depart, sur les graines jouees par les deux :
   - la difference APPARIEE de palier : moyenne, intervalle a 95 % par bootstrap apparie sur les graines (percentiles), mieux / pareil / moins bien,
     test du signe exact (bilateral) ; la difference de survie de meme ;
   - le nombre de courses EXACTEMENT identiques (meme empreinte : l'interrupteur ne s'est pas declenche, ou n'a rien change) ;
   - avec les vraies fonctions de ml/evolution/note.js : E (l'ecart aux joueurs) et F = â - 4 E de chaque bras (noter, sur les graines jouees par
     tous les bras), dE, dF et leurs erreurs-types (comparer, bootstrap apparie de la selection) ;
   - les causes de mort, en part des courses ;
   - un verdict prudent : « aide » seulement si l'intervalle a 95 % de dF ou de d palier exclut zero vers le haut (et aucun des deux vers le bas) ;
     « nuit » de meme vers le bas ; sinon « on ne sait pas », avec le nombre de graines de plus qu'il faudrait (depuis l'ecart-type apparie observe) ;
   - combien de verdicts passeraient le seuil corrige de Bonferroni (5 % divise par le nombre de bras compares).
   Et le controle : les courses de pilote-voltige.js (ecrit a la main) contre celles du bras depart, empreinte par empreinte.
   Ecrit <sorties>/resultats.json et <sorties>/resume.txt ; rien si aucune graine n'est jouee par depart et un autre bras. Aucun hasard libre :
   les bootstraps viennent de graines.rngDe (rejouer redonne les memes chiffres).
   L'epoque (repris de coffre/analyser.js apres sa correction) : --epoque <id> si on la donne ; sinon celle du jour si l'etat en a des courses du
   banc ; sinon celle qui en a le plus (dit a l'ecran).
   Usage : node ml/ecurie/etude/banc-des-genes/analyser.js [--etat etat] [--epoque id] [--sorties sorties]
           (--sorties : par defaut ./sorties pour l'etat ./etat, <etat>/sorties pour un autre etat) */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.resolve(__dirname,'..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const C=require(path.join(EVO,'commun'));
const K=require(path.join(EVO,'courses'));
const N=require(path.join(EVO,'note'));
const Gr=require(path.join(EVO,'graines'));

const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0&&A[i+1]!=null?A[i+1]:d;};
const etatRel=opt('etat','etat');
const dossierEtat=path.resolve(__dirname,etatRel);
const dossierSorties=path.resolve(__dirname,opt('sorties',path.resolve(dossierEtat)===path.resolve(__dirname,'etat')?'sorties':path.join(dossierEtat,'sorties')));
const TIRAGES=4000;
/* (2026-11-28, l'essai a 2 graines) sous NMIN graines communes, le bootstrap n'a presque rien a tirer : ses intervalles sont trop etroits et
   donnaient « aide » ou « nuit » sur 2 graines. Pas de verdict en dessous. */
const NMIN=10;
const cfg=C.lireConfig(null);
const ep=K.epoque(cfg);
const REF=N.referenceEpoque();
const finir=t=>{console.error('analyser : '+t);process.exit(1);};

/* ---------- outils ---------- */
const moy=X=>X.reduce((s,x)=>s+x,0)/X.length;
const etype=X=>{if(X.length<2)return 0;const m=moy(X);return Math.sqrt(X.reduce((s,x)=>s+(x-m)**2,0)/(X.length-1));};
const quantile=(X,q)=>{const B=[...X].sort((x,y)=>x-y);const i=(B.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return B[lo]+(B[hi]-B[lo])*(i-lo);};
const r3=x=>x==null||x!==x?null:Math.round(x*1000)/1000;
/* la loi normale : repartition (Abramowitz et Stegun 7.1.26) et son inverse par dichotomie (assez pour un seuil) */
function phi(z){const t=1/(1+.3275911*Math.abs(z)/Math.SQRT2),e=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-z*z/2);return z>=0?(1+e)/2:(1-e)/2;}
function zDe(p){let a=-10,b=10;for(let i=0;i<100;i++){const m=(a+b)/2;if(phi(m)<p)a=m;else b=m;}return (a+b)/2;}
/* test du signe exact, bilateral, sur les graines non egales */
function signe(mieux,moins){const n=mieux+moins;if(!n)return 1;const k=Math.min(mieux,moins);let c=1,s=0;
  for(let i=0;i<=n;i++){if(i>0)c=c*(n-i+1)/i;if(i<=k)s+=c;}return Math.min(1,2*s/Math.pow(2,n));}
/* bootstrap apparie : les memes graines tirees pour les deux bras ; ic95 et l'intervalle au seuil corrige (alphaC) */
function apparie(dif,etiquette,alphaC){
  const n=dif.length,R=Gr.rngDe('banc-des-genes|'+etiquette+'|'+n),v=[];
  for(let t=0;t<TIRAGES;t++){let s=0;for(let i=0;i<n;i++)s+=dif[R.entier(n)];v.push(s/n);}
  const mieux=dif.filter(d=>d>0).length,pareil=dif.filter(d=>d===0).length,moins=dif.filter(d=>d<0).length;
  return {n,moyenne:r3(moy(dif)),ecartType:r3(etype(dif)),ic95:[r3(quantile(v,.025)),r3(quantile(v,.975))],
    icCorrige:[r3(quantile(v,alphaC/2)),r3(quantile(v,1-alphaC/2))],se:r3(etype(v)),mieux,pareil,moins,pSigne:r3(signe(mieux,moins))};}
/* les graines de plus pour voir un effet egal a celui observe, 8 fois sur 10, a 95 % : n = ((1,96 + 0,84) s / |d|)² */
function grainesDePlus(d,s,n){
  if(!(s>0))return {n:null,dit:'la meme difference sur toutes les graines (souvent : le meme palier partout) : rien a chiffrer'};
  if(!d)return {n:null,dit:'effet observe nul : on ne peut pas chiffrer les graines qu\'il faudrait'};
  const tot=Math.ceil(((1.96+0.8416)*s/Math.abs(d))**2);
  return {n:Math.max(0,tot-n),total:tot};}

/* ---------- les bras, les courses ---------- */
const BJ=C.lireJson(path.join(dossierEtat,'bras.json'),null);
if(!BJ||!Array.isArray(BJ.bras))finir('pas de bras.json dans '+dossierEtat+' : lancer jouer.js d\'abord');
const BRAS=BJ.bras.map(b=>b.nom);
if(BRAS[0]!=='depart')finir('bras.json : le premier bras doit etre depart');
const brutes=K.lireCourses(dossierEtat).filter(Boolean);
const parEpoque={};for(const l of brutes)if(l.usage==='banc')parEpoque[l.epoque]=(parEpoque[l.epoque]||0)+1;
const EPOQUE=opt('epoque',null)||(parEpoque[ep.courses]?ep.courses:(Object.entries(parEpoque).sort((x,y)=>y[1]-x[1])[0]||[ep.courses])[0]);
const avis=[];
if(EPOQUE!==ep.courses)avis.push('ATTENTION : epoque des courses lues '+EPOQUE+', celle du jour est '+ep.courses+' (courses du banc par epoque : '+JSON.stringify(parEpoque)+')');
const toutes=brutes.filter(l=>l.epoque===EPOQUE);
const nonMesurees=toutes.filter(l=>l.mesuree!==true);
/* le pilote de chaque bras : celui de bras.json s'il a des courses dans l'epoque, sinon le plus frequent sous ce nom (dit) */
const L={},shaDe={};
for(const b of BJ.bras){
  const X=toutes.filter(l=>l.usage==='banc'&&l.id===b.nom&&l.mesuree===true);
  const compte={};for(const l of X)compte[l.pilote]=(compte[l.pilote]||0)+1;
  let sha=compte[b.shaPilote]?b.shaPilote:(Object.entries(compte).sort((x,y)=>y[1]-x[1])[0]||[b.shaPilote])[0];
  if(Object.keys(compte).length>1||(X.length&&sha!==b.shaPilote))
    avis.push('ATTENTION : le bras '+b.nom+' a des courses de '+Object.keys(compte).length+' pilotes '+JSON.stringify(compte)+' ; on garde '+String(sha).slice(0,12)+
      (sha===b.shaPilote?' (celui de bras.json)':' (le plus frequent : bras.json en nomme un autre)'));
  shaDe[b.nom]=sha;
  const M=new Map();for(const l of X)if(l.pilote===sha)M.set(l.graine,l);   /* la derniere ligne d'une graine compte */
  L[b.nom]=M;}
const graines=[...new Set([].concat(...BRAS.map(n=>[...L[n].keys()])))].sort((x,y)=>x-y);
const avecCourses=BRAS.filter(n=>L[n].size);
const compares=avecCourses.filter(n=>n!=='depart'&&[...L[n].keys()].some(g=>L.depart.has(g)));
if(!compares.length)finir('aucune graine jouee par depart et un autre bras dans l\'epoque '+EPOQUE+' : rien n\'est ecrit');
const KC=compares.length,ALPHA_C=.05/KC,Z95=1.959964,ZC=-zDe(ALPHA_C/2);

/* ---------- 1. les bras : E et F sur les graines jouees par tous les bras qui ont des courses ---------- */
const communes=graines.filter(g=>avecCourses.every(n=>L[n].has(g)));
const lignesNote=[];for(const n of avecCourses)for(const g of communes)lignesNote.push(L[n].get(g));
const note=communes.length?N.noter(lignesNote,{REF,cfg:cfg.note,ids:avecCourses}):null;
const bras={};
for(const n of BRAS){
  const X=[...L[n].values()],q=note&&note.par[n];
  const causes={};for(const l of X)causes[l.cause]=(causes[l.cause]||0)+1;
  const parts={};for(const [c,k] of Object.entries(causes))parts[c]=r3(k/X.length);
  bras[n]={courses:X.length,palierMoyen:X.length?r3(moy(X.map(l=>l.palier))):null,survieMoyenne_s:X.length?r3(moy(X.map(l=>l.survie_s))):null,
    surCommunes:q?{graines:communes.length,ahat:r3(q.ahat),se_a:r3(q.se_a),E:r3(q.E),se_E:r3(q.se_E),F:r3(q.F),se_F:r3(q.se_F),ecartClassique:q.ecartClassique,parties:q.parties}:null,
    causes,partCauses:parts,shaPilote:shaDe[n],differences:(BJ.bras.find(b=>b.nom===n)||{}).differences||{}};}

/* ---------- 2. chaque bras contre depart ---------- */
const contre={};
for(const n of compares){
  const G=[...L[n].keys()].filter(g=>L.depart.has(g)).sort((x,y)=>x-y),MX=L[n],MY=L.depart;
  const dP=G.map(g=>MX.get(g).palier-MY.get(g).palier),dS=G.map(g=>MX.get(g).survie_s-MY.get(g).survie_s);
  const cmp=N.comparer(G.map(g=>MX.get(g)),G.map(g=>MY.get(g)),{REF,cfg,tirages:2000});
  const identiques=G.filter(g=>MX.get(g).empreinte===MY.get(g).empreinte);
  const pal=apparie(dP,n+'|palier',ALPHA_C),sur=apparie(dS,n+'|survie',ALPHA_C);
  const icF=cmp.dF==null?[null,null]:[r3(cmp.dF-Z95*cmp.se_dF),r3(cmp.dF+Z95*cmp.se_dF)];
  const icFC=cmp.dF==null?[null,null]:[r3(cmp.dF-ZC*cmp.se_dF),r3(cmp.dF+ZC*cmp.se_dF)];
  /* le verdict : aide / nuit si un des deux intervalles exclut zero et qu'aucun ne l'exclut de l'autre cote */
  const haut=(ic)=>ic[0]!=null&&ic[0]>0,bas=(ic)=>ic[1]!=null&&ic[1]<0;
  const juge=(icP,icFF)=>{const h=haut(icP)||haut(icFF),b=bas(icP)||bas(icFF);return h&&b?'contradictoire':h?'aide':b?'nuit':'on ne sait pas';};
  const peu=G.length<NMIN;
  const verdict=peu?'trop peu de graines':juge(pal.ic95,icF),verdictCorrige=peu?'trop peu de graines':juge(pal.icCorrige,icFC);
  const plusP=grainesDePlus(moy(dP),etype(dP),G.length);
  const sF=cmp.se_dF==null?0:cmp.se_dF*Math.sqrt(G.length);
  const plusF=grainesDePlus(cmp.dF,sF,G.length);
  contre[n]={graines:G.length,palier:pal,survie_s:sur,
    selection:{dF:r3(cmp.dF),se_dF:r3(cmp.se_dF),ic95_dF:icF,icCorrige_dF:icFC,dPalier:r3(cmp.dPalier),se_dPalier:r3(cmp.se_dPalier),dE:r3(cmp.dE),se_dE:r3(cmp.se_dE),
      criteres:cmp.criteres,sacre:cmp.sacre},
    coursesIdentiques:identiques.length,grainesDifferentes:G.filter(g=>MX.get(g).empreinte!==MY.get(g).empreinte),
    verdict,verdictCorrige,signeCorrige:pal.pSigne<ALPHA_C,grainesDePlus:{palier:plusP,dF:plusF}};}

/* ---------- 3. le controle : pilote-voltige.js ecrit a la main contre le bras depart ---------- */
const controle=[];
for(const l of toutes)if(l.usage==='controle'&&l.mesuree===true){const d=L.depart.get(l.graine);
  controle.push({graine:l.graine,voltige:l.empreinte,depart:d?d.empreinte:null,touchesVoltige:l.empreinteTouches,touchesDepart:d?d.empreinteTouches:null,
    palierVoltige:l.palier,palierDepart:d?d.palier:null,meme:!!d&&d.empreinte===l.empreinte&&d.empreinteTouches===l.empreinteTouches});}

const res={format:'banc-des-genes-1',date:new Date().toISOString(),epoque:EPOQUE,epoqueDuJour:ep.courses,jeu:ep.composants.version+' '+ep.composants.jeu_sha,node:ep.composants.node,
  regime:ep.composants.regime,tmax:cfg.tmax,note:cfg.note,graines:{plan:BJ.graines,jouees:graines.length,communesATous:communes.length},
  comparaisons:KC,alphaCorrige:r3(ALPHA_C*1000)/1000,zCorrige:r3(ZC),hasardAuMoinsUn:r3(1-Math.pow(.95,KC)),
  nonMesurees:nonMesurees.map(l=>({id:l.id,graine:l.graine,raison:l.raison})),tirages:TIRAGES,avis,bras,contre,controle};

/* ---------- le resume ---------- */
const o=[];const f=(x,k)=>x==null?'-':(x>=0?'+':'')+x.toFixed(k==null?2:k);const pc=x=>Math.round(100*x)+' %';
o.push('LE BANC DES GENES — chaque interrupteur allume contre le pilote de depart (c0025, tout eteint), sur les memes graines');
o.push('');
o.push('A LIRE D\'ABORD : '+KC+' bras sont compares au depart en meme temps. Meme si AUCUN interrupteur ne changeait rien, regarder '+KC+' bras a 95 % donne au moins');
o.push('un verdict « aide » ou « nuit » par pur hasard '+pc(1-Math.pow(.95,KC))+' du temps (1 - 0,95^'+KC+'), soit environ une fois sur deux ; et le verdict regarde DEUX');
o.push('intervalles (palier et dF), ce qui en ajoute encore. Le seuil corrige de Bonferroni (5 % / '+KC+' = '+(100*ALPHA_C).toFixed(2)+' % par bras) retire ce risque :');
const passent=compares.filter(n=>contre[n].verdictCorrige==='aide'||contre[n].verdictCorrige==='nuit');
o.push('  verdicts a 95 % : '+compares.filter(n=>contre[n].verdict==='aide').length+' « aide », '+compares.filter(n=>contre[n].verdict==='nuit').length+' « nuit » ; au seuil corrige : '+
  (passent.length?passent.map(n=>n+' '+contre[n].verdictCorrige).join(', '):'AUCUN')+'.');
o.push('');
for(const a of avis)o.push(a);
o.push(`graines jouees : ${graines.length} (plan ${BJ.graines.depart} + ${BJ.graines.pas} j, j < ${BJ.graines.n}) · communes a tous les bras : ${communes.length} · ${nonMesurees.length} course(s) non mesuree(s) · epoque ${EPOQUE} · ${res.jeu} · ${res.node} · tmax ${cfg.tmax}`);
o.push('');
o.push('bras      | courses | palier moy | survie moy (s) | E (se)        | F (se)        | ce qui change');
for(const n of BRAS){const x=bras[n],q=x.surCommunes;
  o.push(`${n.padEnd(9)} | ${String(x.courses).padStart(7)} | ${x.palierMoyen==null?'   -  ':x.palierMoyen.toFixed(2).padStart(10)} | ${x.survieMoyenne_s==null?'   -':x.survieMoyenne_s.toFixed(1).padStart(14)} | `+
    `${q?(q.E.toFixed(3)+' ('+q.se_E.toFixed(3)+')').padEnd(13):'-'.padEnd(13)} | ${q?(q.F.toFixed(2)+' ('+(q.se_F==null?'-':q.se_F.toFixed(2))+')').padEnd(13):'-'.padEnd(13)} | `+
    (Object.keys(x.differences).length?Object.entries(x.differences).map(([k,v])=>k+' '+v[0]+'->'+v[1]).join(', '):'rien (la reference)'));}
o.push('(E et F : note.noter sur les '+communes.length+' graines jouees par tous ; F = â - 4 E, plus haut = mieux ; E plus bas = plus proche des joueurs'+
  (BRAS.some(n=>bras[n].surCommunes&&bras[n].surCommunes.E===cfg.note.ePire)?' ; E = '+cfg.note.ePire+' (le pire) pour un bras qui a moins de '+cfg.note.partiesMin+' parties mesurees':'')+')');
o.push('');
o.push('bras - depart | graines | d palier moy [IC 95 %]     | mieux/pareil/moins (p signe) | d survie moy [IC 95 %]      | dE (se)         | dF (se) [IC 95 %]               | identiques');
for(const n of compares){const x=contre[n],p=x.palier,s=x.survie_s,q=x.selection;
  o.push(`${n.padEnd(13)} | ${String(x.graines).padStart(7)} | ${(f(p.moyenne)+' ['+f(p.ic95[0])+' ; '+f(p.ic95[1])+']').padEnd(26)} | ${(p.mieux+'/'+p.pareil+'/'+p.moins+' ('+p.pSigne+')').padEnd(28)} | `+
    `${(f(s.moyenne,1)+' ['+f(s.ic95[0],1)+' ; '+f(s.ic95[1],1)+']').padEnd(27)} | ${(f(q.dE,3)+' ('+(q.se_dE==null?'-':q.se_dE.toFixed(3))+')').padEnd(15)} | `+
    `${(f(q.dF)+' ('+(q.se_dF==null?'-':q.se_dF.toFixed(2))+') ['+f(q.ic95_dF[0])+' ; '+f(q.ic95_dF[1])+']').padEnd(31)} | ${x.coursesIdentiques}/${x.graines}`);}
o.push('');
o.push('LES VERDICTS (aide / nuit : l\'intervalle a 95 % de d palier ou de dF exclut zero ; sinon on ne sait pas)');
for(const n of compares){const x=contre[n],gp=x.grainesDePlus;let t;
  if(x.verdict==='trop peu de graines')t='pas de verdict : '+x.graines+' graine(s) seulement (il en faut au moins '+NMIN+' pour que l\'intervalle veuille dire quelque chose)';
  else if(x.verdict==='on ne sait pas'){
    const cand=[['d palier',gp.palier],['dF',gp.dF]].filter(c=>c[1].n!=null).sort((a,b)=>a[1].n-b[1].n);
    if(x.coursesIdentiques===x.graines)t='on ne sait pas : les '+x.graines+' courses sont IDENTIQUES a celles du depart (l\'interrupteur ne s\'est jamais declenche ou n\'a rien change)';
    else if(cand.length)t='on ne sait pas (il faudrait environ '+cand[0][1].n+' graines de plus pour voir, 8 fois sur 10, un effet de la taille observee sur '+cand[0][0]+
      (cand[1]?' ; '+cand[1][1].n+' sur '+cand[1][0]:'')+')';
    else t='on ne sait pas ('+gp.palier.dit+')';
  }else t=x.verdict+(x.verdictCorrige===x.verdict?' (et au seuil corrige de Bonferroni aussi)':' a 95 %, mais PAS au seuil corrige de Bonferroni : peut-etre le hasard des '+KC+' comparaisons');
  o.push(`${n.padEnd(9)} : ${t}`);}
o.push('');
o.push('LES CAUSES DE MORT (part des courses de chaque bras)');
const toutesCauses=[...new Set([].concat(...BRAS.map(n=>Object.keys(bras[n].causes))))].sort();
o.push('bras      | '+toutesCauses.map(c=>String(c).padStart(8)).join(' | '));
for(const n of BRAS)if(bras[n].courses)o.push(`${n.padEnd(9)} | `+toutesCauses.map(c=>(bras[n].partCauses[c]==null?'-':pc(bras[n].partCauses[c])).padStart(8)).join(' | '));
o.push('');
o.push('LE CONTROLE (pilote-voltige.js, ecrit a la main, contre le bras depart) : '+(controle.length?controle.map(c=>`graine ${c.graine} ${c.meme?'MEME COURSE':'DIFFERENTE'} (${c.voltige} / ${c.depart})`).join(' · '):'aucune course de controle mesuree'));
const texte=o.join('\n')+'\n';
fs.mkdirSync(dossierSorties,{recursive:true});
fs.writeFileSync(path.join(dossierSorties,'resultats.json'),JSON.stringify(res,null,1)+'\n');
fs.writeFileSync(path.join(dossierSorties,'resume.txt'),texte);
process.stdout.write(texte);
