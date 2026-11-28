#!/usr/bin/env node
/* ===== LE COFFRE : LES CHIFFRES (2026-11-28, l'agent « mesure » : « c0101 est-il vraiment meilleur, avec la note de la selection, sur des graines
   jamais vues ? ») =====
   Lit les courses de ./etat (ecrites par jouer.js), garde celles du coffre mesurees dans l'epoque du jour, et calcule :
   - pour chaque pilote, avec les VRAIES fonctions de ml/evolution/note.js : a (palier ajuste), â (retreci), E (ecart dans la foule, etalon et
     zone morte de la config), F = â - 4 E, et leurs erreurs-types ; plus palier moyen, median, record, survie, causes ;
   - les differences APPARIEES graine par graine (palier, survie) : moyenne, intervalle a 95 % par bootstrap apparie sur les graines (percentiles),
     part des graines mieux / pareil / moins bien, test du signe exact ; et note.comparer (dF, dE, criteres du sacre de la selection) ;
   - les courses identiques (meme empreinte, meme empreinte des touches) entre deux pilotes, graine par graine ;
   - la meme chose (palier, survie, empreintes) sur la mesure de la boucle : ml/labo/journal/validations.jsonl (20 graines 950000, pas 37) ;
   - le controle de reproductibilite : les courses 'controle' de ce Xeon contre les empreintes du Ryzen.
   Ecrit sorties/resultats.json, sorties/courses-coffre.jsonl (une ligne par course), sorties/resume.txt. Aucun hasard libre : les bootstraps
   viennent de graines.rngDe (rejouer redonne les memes chiffres).
   Usage : node ml/ecurie/etude/boucle-payante-ryzen/coffre/analyser.js */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.resolve(__dirname,'..','..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const C=require(path.join(EVO,'commun'));
const K=require(path.join(EVO,'courses'));
const N=require(path.join(EVO,'note'));
const Gr=require(path.join(EVO,'graines'));

const PILOTES=['c0025','c0026','c0064','c0101'];
const PAIRES=[['c0026','c0025'],['c0064','c0025'],['c0101','c0025'],['c0064','c0026'],['c0101','c0026'],['c0101','c0064']];
const TIRAGES=4000;
const cfg=C.lireConfig(null);
const ep=K.epoque(cfg);
const REF=N.referenceEpoque();

/* ---------- outils ---------- */
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const mediane=A=>{const B=[...A].sort((x,y)=>x-y),n=B.length;return n%2?B[(n-1)/2]:(B[n/2-1]+B[n/2])/2;};
const quantile=(A,q)=>{const B=[...A].sort((x,y)=>x-y);const i=(B.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return B[lo]+(B[hi]-B[lo])*(i-lo);};
const r2=x=>x==null||x!==x?null:Math.round(x*1000)/1000;
/* test du signe exact, bilateral, sur les graines non egales */
function signe(mieux,moins){const n=mieux+moins;if(!n)return 1;const k=Math.min(mieux,moins);let c=1,s=0;
  for(let i=0;i<=n;i++){if(i>0)c=c*(n-i+1)/i;if(i<=k)s+=c;}return Math.min(1,2*s/Math.pow(2,n));}
/* bootstrap apparie : les memes graines tirees pour les deux pilotes */
function apparie(dif,etiquette){
  const n=dif.length,R=Gr.rngDe('coffre|'+etiquette+'|'+n),v=[];
  for(let t=0;t<TIRAGES;t++){let s=0;for(let i=0;i<n;i++)s+=dif[R.entier(n)];v.push(s/n);}
  const mieux=dif.filter(d=>d>0).length,pareil=dif.filter(d=>d===0).length,moins=dif.filter(d=>d<0).length;
  return {n,moyenne:r2(moy(dif)),mediane:r2(mediane(dif)),ic95:[r2(quantile(v,0.025)),r2(quantile(v,0.975))],se:r2(Math.sqrt(moy(v.map(x=>(x-moy(v))**2)))),
    partPlusPetitQueZero:r2(v.filter(x=>x<=0).length/T(v)),mieux,pareil,moins,pSigne:r2(signe(mieux,moins))};
}
const T=v=>v.length;

/* ---------- les courses ---------- */
/* ===== QUELLE EPOQUE (2026-11-28, le relecteur : « un etat deja existant ») =====
   L'epoque des courses contient l'empreinte de ml/evolution/modele.js et enfant.js : le 28/11 au soir, le lot « portage » a retouche modele.js
   (non commite) et l'epoque du jour est passee de fd590bd3db3d a 66f66d2ae1c2. L'ancien filtre (epoque === celle du jour) ne gardait alors AUCUNE
   course, et le script reecrivait sorties/resultats.json et sorties/courses-coffre.jsonl VIDES avant de planter. Maintenant : --epoque <id> si on
   la donne ; sinon celle du jour si l'etat en a des courses du coffre ; sinon celle qui en a le plus (dit a l'ecran). Rien n'est ecrit si aucune
   graine n'est jouee par les quatre pilotes. (modele.js ne sert pas aux pilotes ecrits a la main : le relecteur a rejoue 12 courses apres la
   retouche, par ml/bot/noter.js, empreintes identiques.) */
const A=process.argv.slice(2),iEp=A.indexOf('--epoque');
const brutes=K.lireCourses(path.join(__dirname,'etat')).filter(Boolean);
const parEpoque={};for(const l of brutes)if(l.usage==='coffre')parEpoque[l.epoque]=(parEpoque[l.epoque]||0)+1;
const EPOQUE=iEp>=0?A[iEp+1]:(parEpoque[ep.courses]?ep.courses:(Object.entries(parEpoque).sort((x,y)=>y[1]-x[1])[0]||[ep.courses])[0]);
if(EPOQUE!==ep.courses)console.log('ATTENTION : epoque des courses lues '+EPOQUE+', celle du jour est '+ep.courses+' (courses du coffre par epoque : '+JSON.stringify(parEpoque)+')');
const toutes=brutes.filter(l=>l.epoque===EPOQUE);
const derniere=new Map();
for(const l of toutes)if(l.mesuree===true)derniere.set(l.usage+'|'+l.id+'|'+l.graine,l);
const nonMesurees=toutes.filter(l=>l.mesuree!==true);
const graines=Gr.grainesCoffre(cfg);
const L={};for(const p of PILOTES)L[p]=graines.map(g=>derniere.get('coffre|'+p+'|'+g)).filter(Boolean);
const communes=graines.filter(g=>PILOTES.every(p=>derniere.has('coffre|'+p+'|'+g)));
if(!communes.length){console.error('analyser : aucune graine du coffre jouee par les '+PILOTES.length+' pilotes dans l\'epoque '+EPOQUE+' : rien n\'est ecrit');process.exit(1);}

/* ---------- 1. les pilotes ---------- */
const lignesNote=[];for(const p of PILOTES)for(const l of L[p])if(communes.includes(l.graine))lignesNote.push(l);
const note=N.noter(lignesNote,{REF,cfg:cfg.note,ids:PILOTES});
const pilotes={};
for(const p of PILOTES){
  const X=L[p].filter(l=>communes.includes(l.graine)),pal=X.map(l=>l.palier),sv=X.map(l=>l.survie_s),q=note.par[p];
  const causes={};for(const l of X)causes[l.cause]=(causes[l.cause]||0)+1;
  pilotes[p]={courses:X.length,palierMoyen:r2(moy(pal)),palierMedian:mediane(pal),palierRecord:Math.max(...pal),palierMin:Math.min(...pal),
    survieMoyenne_s:r2(moy(sv)),survieMediane_s:r2(mediane(sv)),
    a:r2(q.a),ahat:r2(q.ahat),se_a:r2(q.se_a),E:r2(q.E),se_E:r2(q.se_E),F:r2(q.F),se_F:r2(q.se_F),ecartClassique:q.ecartClassique,parties:q.parties,causes,
    paliers:X.map(l=>l.palier)};
}

/* ---------- 2. les paires ---------- */
function parG(X){const M=new Map();for(const l of X)M.set(l.graine,l);return M;}
const paires={};
for(const [x,y] of PAIRES){
  const MX=parG(L[x]),MY=parG(L[y]),G=communes;
  const cmp=N.comparer(G.map(g=>MX.get(g)),G.map(g=>MY.get(g)),{REF,cfg,tirages:2000});
  const identiques=G.filter(g=>MX.get(g).empreinte===MY.get(g).empreinte);
  const touchesIdentiques=G.filter(g=>MX.get(g).empreinteTouches===MY.get(g).empreinteTouches);
  paires[x+'-'+y]={palier:apparie(G.map(g=>MX.get(g).palier-MY.get(g).palier),x+'-'+y+'|palier'),
    survie_s:apparie(G.map(g=>MX.get(g).survie_s-MY.get(g).survie_s),x+'-'+y+'|survie'),
    selection:{dF:r2(cmp.dF),se_dF:r2(cmp.se_dF),dPalier:r2(cmp.dPalier),se_dPalier:r2(cmp.se_dPalier),dE:r2(cmp.dE),se_dE:r2(cmp.se_dE),criteres:cmp.criteres,sacre:cmp.sacre},
    coursesIdentiques:identiques.length,grainesIdentiques:identiques,touchesIdentiques:touchesIdentiques.length};
}

/* ---------- 3. la mesure de la boucle (validations.jsonl) ---------- */
const V=fs.readFileSync(path.join(RACINE,'ml','labo','journal','validations.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const vDe={};for(const v of V)if(PILOTES.includes(v.id))vDe[v.id]=v;   /* la derniere ligne d'un id compte */
const boucle={pilotes:{},paires:{}};
for(const p of PILOTES){const v=vDe[p];if(!v)continue;const pal=v.courses.map(c=>c.palier),sv=v.courses.map(c=>c.duree_s);
  boucle.pilotes[p]={date:v.date,jeu:v.jeu.version+' '+v.jeu.sha,graines:v.graines,tmax:v.tmax,courses:v.courses.length,palierMoyen:r2(moy(pal)),palierMedian:mediane(pal),
    palierRecord:Math.max(...pal),survieMoyenne_s:r2(moy(sv)),
    /* la note de la boucle (celle de ml/labo, pas celle de la selection) : la « barre » [note, record, survie] qu'un candidat suivant devait battre */
    noteDeLaBoucle:(V.find(w=>w.parent===p&&Array.isArray(w.barre))||{barre:[null]}).barre[0]};}
for(const [x,y] of PAIRES){const vx=vDe[x],vy=vDe[y];if(!vx||!vy)continue;
  const MX=new Map(vx.courses.map(c=>[c.graine,c])),MY=new Map(vy.courses.map(c=>[c.graine,c]));
  const G=[...MX.keys()].filter(g=>MY.has(g));
  const id=G.filter(g=>MX.get(g).empreinte===MY.get(g).empreinte);
  boucle.paires[x+'-'+y]={palier:apparie(G.map(g=>MX.get(g).palier-MY.get(g).palier),'boucle|'+x+'-'+y+'|palier'),
    survie_s:apparie(G.map(g=>MX.get(g).duree_s-MY.get(g).duree_s),'boucle|'+x+'-'+y+'|survie'),coursesIdentiques:id.length,graines:G.length};}

/* ---------- 4. la reproductibilite Xeon / Ryzen ---------- */
const controle=[];
for(const l of toutes)if(l.usage==='controle'&&l.mesuree===true){const v=vDe[l.id];const c=v&&v.courses.find(c=>c.graine===l.graine);
  controle.push({id:l.id,graine:l.graine,xeon:l.empreinte,ryzen:c?c.empreinte:null,palierXeon:l.palier,palierRyzen:c?c.palier:null,meme:!!c&&c.empreinte===l.empreinte});}

const res={format:'coffre-boucle-payante-1',date:new Date().toISOString(),epoque:EPOQUE,epoqueDuJour:ep.courses,jeu:ep.composants.version+' '+ep.composants.jeu_sha,node:ep.composants.node,
  regime:ep.composants.regime,tmax:cfg.tmax,note:cfg.note,graines:{depart:graines[0],pas:37,n:graines.length,communes:communes.length},
  nonMesurees:nonMesurees.map(l=>({id:l.id,graine:l.graine,raison:l.raison})),tirages:TIRAGES,pilotes,paires,boucle,controle};
fs.mkdirSync(path.join(__dirname,'sorties'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'sorties','resultats.json'),JSON.stringify(res,null,1)+'\n');
const champs=['usage','id','graine','tmax','mesuree','raison','palier','pieces','survie_s','cause','morts','vols','pannes','yeuxTirages','mesures','empreinte','empreinteVues','empreinteTouches','jeu','jeu_sha','node','ms','pilote','epoque','date'];
fs.writeFileSync(path.join(__dirname,'sorties','courses-coffre.jsonl'),toutes.map(l=>JSON.stringify(Object.fromEntries(champs.map(c=>[c,l[c]===undefined?null:l[c]])))).join('\n')+'\n');

/* ---------- le resume ---------- */
const o=[];const f=x=>x==null?'-':(x>=0?'+':'')+x.toFixed(2);
o.push(`coffre : ${communes.length}/${graines.length} graines jouees par les ${PILOTES.length} pilotes · ${nonMesurees.length} course(s) non mesuree(s) · epoque ${EPOQUE} · ${res.jeu} · ${res.node}`);
o.push('pilote | palier moy / med / max | survie moy / med (s) |   â    |   E   (se)   |   F   (se)   | ecart classique');
for(const p of PILOTES){const x=pilotes[p];o.push(`${p}  | ${x.palierMoyen.toFixed(2)} / ${x.palierMedian} / ${x.palierRecord} | ${x.survieMoyenne_s.toFixed(1)} / ${x.survieMediane_s.toFixed(1)} | ${x.ahat.toFixed(2)} | ${x.E.toFixed(3)} (${x.se_E.toFixed(3)}) | ${x.F.toFixed(2)} (${x.se_F.toFixed(2)}) | ${x.ecartClassique}`);}
o.push('paire (A-B) | d palier moy [IC 95 %] | mieux/pareil/moins (p signe) | d survie moy [IC 95 %] | dF (se) dE (se) sacre | courses identiques');
for(const k of Object.keys(paires)){const x=paires[k];o.push(`${k} | ${f(x.palier.moyenne)} [${f(x.palier.ic95[0])} ; ${f(x.palier.ic95[1])}] | ${x.palier.mieux}/${x.palier.pareil}/${x.palier.moins} (${x.palier.pSigne}) | ${f(x.survie_s.moyenne)} [${f(x.survie_s.ic95[0])} ; ${f(x.survie_s.ic95[1])}] | ${f(x.selection.dF)} (${x.selection.se_dF}) ${f(x.selection.dE)} (${x.selection.se_dE}) ${x.selection.sacre?'OUI':'non'} | ${x.coursesIdentiques}/${communes.length}`);}
o.push('la boucle (validations.jsonl, 20 graines 950000) :');
for(const p of PILOTES){const x=boucle.pilotes[p];if(x)o.push(`${p}  | palier ${x.palierMoyen.toFixed(2)} / ${x.palierMedian} / ${x.palierRecord} | survie ${x.survieMoyenne_s.toFixed(1)} s`);}
for(const k of Object.keys(boucle.paires)){const x=boucle.paires[k];o.push(`${k} | ${f(x.palier.moyenne)} [${f(x.palier.ic95[0])} ; ${f(x.palier.ic95[1])}] | ${x.palier.mieux}/${x.palier.pareil}/${x.palier.moins} (${x.palier.pSigne}) | survie ${f(x.survie_s.moyenne)} [${f(x.survie_s.ic95[0])} ; ${f(x.survie_s.ic95[1])}] | courses identiques ${x.coursesIdentiques}/${x.graines}`);}
o.push('reproductibilite Xeon / Ryzen : '+controle.map(c=>`${c.id} ${c.graine} ${c.meme?'MEME':'DIFFERENTE'} (${c.xeon} / ${c.ryzen})`).join(' · '));
fs.writeFileSync(path.join(__dirname,'sorties','resume.txt'),o.join('\n')+'\n');
console.log(o.join('\n'));
