#!/usr/bin/env node
/* ===== LES REGLES D'UNE GENERATION, AVEC UN FAUX ORDONNANCEUR (2026-11-27, le correcteur ; d'apres les relectures statistique et robustesse) =====
   usage : node ml/evolution/tests/generation.test.js   (code 0 si tout passe ; ~20 s, AUCUNE course jouee)
   courses.creer est remplace par un faux (des lignes fabriquees, ecrites comme le vrai dans courses-*.jsonl, avec un cache) et identite.verifier
   par un faux qui compte ses appels. evoluer.generation tourne pour de vrai sur un etat a part (config-essai.json : mu 4, lambda 2, 3 graines).
     G1 retraits     : une graine ratee par UN seul pilote reste pour les autres ; ratee par deux (dont le temoin) : retiree ;
                       un pilote a 2 courses non mesurees : vire 'non-mesuree' ; des pannes sur un premier essai (pannesEssais 2) : vire 'pannes'
     G2 morts        : une generation interrompue pendant le coffre n'ecrit AUCUNE ligne dans morts.jsonl ; reprise : ses morts y entrent, et seulement eux
     G3-G5 economie  : courses longues -> grainesEconomie ; courtes -> retour a grainesParGeneration ; une PAUSE ne compte pas
     G6-G7 identite  : une empreinte d'identite perimee refait le controle, une fois
     G8 epoque       : un enfant qui a charge d'autres fichiers du bot coupe la generation (ctx.arret.epoque)
     (28/11/2026, lot « regles »)
     A4 age          : a 12 graines et a 8, un enfant n'est jamais renvoye a sa naissance, il l'est a la generation suivante ; ses parents ont 2 generations
     A6 ordre        : une generation jouee dans l'ordre d'origine et les longues d'abord : autre ordre des demandes, memes courses, notes et journaux
     compatibilite   : tests/etat-v2-ancien (ecrit par l'ancien code, genome v:2) se relit et fait une generation, reserve d'avant pleine ou vide */
'use strict';
const fs=require('fs'),path=require('path');
const C=require('../commun'),K=require('../courses'),I=require('../identite'),N=require('../note');
const BAC=path.join(C.DOSSIER,'essais','tests-generation'),ETAT=path.join(BAC,'etat');
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const attendre=ms=>new Promise(r=>setTimeout(r,ms));
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}

/* ---------- les faux ---------- */
let appelsIdentite=0;
I.verifier=async function(){appelsIdentite++;return {ok:true,lignes:[]};};
const SC={ligne:null,attente_ms:0,pause_ms:0,journal:null};   /* le scenario de la generation en cours */
const REF=N.referenceEpoque(),MES={};for(const k of Object.keys(REF))if(REF[k])MES[k]=REF[k].m;
const h=s=>{let x=0;for(const c of String(s))x=(x*31+c.charCodeAt(0))>>>0;return x;};
function ligneNormale(t,ep){
  const palier=5+h(t.id)%4+(t.graine%7)-3;
  return {cle:t.shaPilote+'|'+t.graine+'|'+t.tmax+'|'+ep.courses,pilote:t.shaPilote,id:t.id,usage:t.usage,generation:t.generation,epoque:ep.courses,essai:1,
    mesuree:true,raison:null,date:new Date().toISOString(),graine:t.graine,tmax:t.tmax,palier:palier,pieces:10,survie_s:20*palier+30,cause:'roche',morts:0,vols:5,
    pannes:0,pannesEssais:0,erreurs:0,mesures:Object.assign({},MES),yeuxTirages:0};
}
K.creer=function(o){
  const ep=o.epoque,d=o.dossierEtat,memoire=new Map(),S={jouees:0,cache:0,nonMesurees:0,relancees:0,tuees:0,ms:0};
  for(const l of K.lireCourses(d))if(l.epoque===ep.courses&&l.mesuree===true)memoire.set(l.cle,l);
  return {
    async demander(taches){
      if(SC.journal){const j=SC.journal;SC.journal=null;o.journal(j);}
      /* la PAUSE : une seule fois (courir fait un demander par tache, en parallele) */
      const pz=SC.pause_ms;SC.pause_ms=0;
      if(pz){const p=path.join(d,'PAUSE');fs.writeFileSync(p,'');o.enPause();await attendre(pz);fs.unlinkSync(p);o.enPause();}
      if(SC.attente_ms)await attendre(SC.attente_ms);
      return taches.map(t=>{
        if(o.doitArreter())return null;
        const base=ligneNormale(t,ep);
        /* le scenario passe avant le cache : une course « tuee » (null) l'est meme si elle est connue */
        const l=SC.ligne?SC.ligne(t,base):base;
        if(l===null)return null;
        if(memoire.has(base.cle)){S.cache++;return memoire.get(base.cle);}
        C.ajouterLigne(path.join(d,'courses-'+C.semaineIso(new Date())+'.jsonl'),l);
        S.jouees++;if(!l.mesuree)S.nonMesurees++;else memoire.set(l.cle,l);
        return l;});
    },
    arreter(){return Promise.resolve();},enCours(){return 0;},stats(){return Object.assign({},S);},epoque:ep,trieur:'faux'};
};
const E=require('../evoluer');

function cfgEssai(){const c=C.lireConfig('config-essai.json');c.dossierEtat=ETAT;c.dossierChampions=path.join(BAC,'champions');return c;}

/* ===== A4 : LA PROTECTION PAR L'AGE (28/11/2026, lot « regles » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 2 A4) =====
   Un etat a part par regime (essais/tests-generation/a4-<n>), n graines par generation, mu 4, lambda 2. Tous les enfants (nes en G >= 1) font
   palier 0 a chaque course : ce sont les pires de la population. La regle par l'age veut :
     - un enfant ne en G n'est JAMAIS renvoye en G (il est le pire, mais protege) ;
     - il est renvoye en G+1 (renvoyable des sa deuxieme generation), a 12 graines (24 courses : l'ancienne regle aussi) comme a 8 (16 courses :
       l'ancienne regle des 24 courses l'aurait protege une generation de plus) ;
     - les parents des naissances de G sont nes en G-2 ou avant. */
function cfgA(dossier,o){const c=C.lireConfig('config-essai.json');c.dossierEtat=path.join(BAC,dossier,'etat');c.dossierChampions=path.join(BAC,dossier,'champions');
  return Object.assign(c,o||{});}
async function casA4(n){
  const cfg=cfgA('a4-'+n,{grainesParGeneration:n,grainesEconomie:n,seuilEconomie_s:1e9}),journal=[];
  fs.rmSync(path.join(BAC,'a4-'+n),{recursive:true,force:true});
  const ctx=E.charger(cfg,{dire:t=>journal.push(t)});
  const neDe=id=>{const v=ctx.pop&&ctx.pop.vivants.find(x=>x.id===id);return v?v.ne:null;};
  SC.ligne=(t,l)=>t.usage==='entrainement'&&neDe(t.id)>=1?Object.assign({},l,{palier:0,survie_s:30}):l;
  const parents=[];
  try{
    for(let G=0;G<=5;G++){
      await E.generation(ctx);
      const vus=new Map();for(const m of C.lireJsonl(path.join(cfg.dossierEtat,'morts.jsonl')))vus.set(m.id,m);
      for(const x of ctx.pop.naissancesGeneration||[])for(const p of x.parents){const ne=neDe(p)!=null?neDe(p):(vus.get(p)||{}).ne;parents.push({G:ctx.pop.generation,p,ne});}}
  }finally{SC.ligne=null;}
  const M=C.lireJsonl(path.join(cfg.dossierEtat,'morts.jsonl')),renvois=M.filter(m=>m.raison==='renvoi');
  const enfants=M.filter(m=>m.ne>=1&&m.ne<=4);
  const okNaissance=renvois.every(m=>m.mort>m.ne);
  const okSuivante=enfants.length>=6&&enfants.every(m=>m.raison==='renvoi'&&m.mort===m.ne+1);
  const okParents=parents.filter(x=>x.G>=2).every(x=>x.ne!=null&&x.ne<=x.G-2);
  const nAuRenvoi=[...new Set(enfants.map(m=>m.n))];
  verdict('A4 a '+n+' graines : un enfant n\'est jamais renvoye a sa naissance, il l\'est a la generation suivante ; ses parents ont 2 generations',
    okNaissance&&okSuivante&&okParents,
    enfants.length+' enfants renvoyes, tous a ne+1 : '+enfants.map(m=>m.id.slice(0,6)+' ne '+m.ne+' mort '+m.mort).join(', ')+' ; courses au renvoi : '+nAuRenvoi.join(',')+
    (nAuRenvoi.every(x=>x<24)?' (moins de 24 : l\'ancienne regle l\'aurait protege une generation de plus)':' (24 : l\'ancienne regle faisait pareil)')+
    ' ; parents des naissances de G>=2 nes en G-2 ou avant : '+(okParents?'oui':'NON '+JSON.stringify(parents.filter(x=>x.G>=2&&!(x.ne<=x.G-2)))));
  if(!(okNaissance&&okSuivante&&okParents))fs.writeFileSync(path.join(BAC,'a4-'+n,'journal.txt'),journal.join('\n')+'\n');
}

/* ===== UN ETAT ECRIT PAR L'ANCIEN CODE (28/11/2026, lot « regles ») =====
   tests/etat-v2-ancien : population.json et les quatre journaux d'une vraie marche du 27/11 au soir (essais/tests-evoluer, config-essai, 5 generations
   de vraies courses), ecrits par le code d'avant le portage : genome v:2, graines sans « blocs », vivants sans « temoinNom ». Copie, puis une
   generation avec le code d'aujourd'hui (protection par l'age, urne des reels lus, courses longues d'abord, la reserve d'entrainement) ; puis la meme
   chose avec la reserve d'avant VIDE (le Ryzen apres 90 generations) : la generation prend ses graines dans la suite (1000021 + 37 j), sans en rejouer. */
/* (28/11/2026, l'integrateur du reglage) aussi tests/etat-e93ff5cb5 : un etat ecrit par le code EXACT du Ryzen (commit e93ff5cb5, git worktree hors du
   depot, config-essai, 2 generations de vraies courses puis --valider-maintenant : une ligne de validation d'avant, epoque d'avant le portage). */
/* (28/11/2026, lot « genes v4 ») et tests/etat-v3-ddca156d8 : un etat en genome v:3, ECRIT PAR LE CODE de ddca156d8 (son propre generation.test.js,
   joue dans une copie de l'arbre de ce commit tiree par git archive : etat-e93ff5cb5 relu, puis une generation avec le faux ordonnanceur ; le cas
   compat-c, ses cinq fichiers sans les courses fabriquees). Pour les trois sources : genomes migres en v:Gn.VERSION, memes identifiants avant et apres
   la migration, pop.temoin = l'identifiant du temoin (19e3767cc346), dejaVus garde. */
const Gn=require('../genome');
async function casCompat(){
  const L=[];let ok=true;
  const idTemoin=Gn.idDe(Gn.genomeTemoin(cfgA('compat-temoin')));
  if(idTemoin!=='19e3767cc346'){ok=false;L.push('le temoin a change d\'identifiant : '+idTemoin);}
  for(const [source,lettres] of [['etat-v2-ancien','ab'],['etat-e93ff5cb5','cd'],['etat-v3-ddca156d8','ef']])
  for(const cas of ['tel quel','reserve vide']){
    const src=path.join(__dirname,source);
    const d='compat-'+(cas==='tel quel'?lettres[0]:lettres[1]);fs.rmSync(path.join(BAC,d),{recursive:true,force:true});
    const cfg=cfgA(d);fs.mkdirSync(cfg.dossierEtat,{recursive:true});
    for(const f of fs.readdirSync(src))fs.copyFileSync(path.join(src,f),path.join(cfg.dossierEtat,f));
    const p0=JSON.parse(fs.readFileSync(path.join(cfg.dossierEtat,'population.json'),'utf8'));
    const v0=[...new Set(p0.vivants.map(v=>v.genome.v))],blocs0='blocs' in p0.graines,joues=new Set();
    for(const g of C.lireJsonl(path.join(cfg.dossierEtat,'generations.jsonl')))for(const s of g.graines||[])joues.add(s);
    if(cas==='reserve vide'){p0.graines.reserve=[];fs.writeFileSync(path.join(cfg.dossierEtat,'population.json'),JSON.stringify(p0)+'\n');}
    const journal=[];let r=null,err=null,ids=null;
    try{const ctx=E.charger(cfg,{dire:t=>journal.push(t)});
      /* (genes v4) apres le chargement (la migration) : les memes vivants, chacun sous son identifiant d'avant, et le meme temoin */
      ids={avant:p0.vivants.map(v=>v.id).sort().join(','),apres:ctx.pop.vivants.map(v=>v.id).sort().join(','),
        justes:ctx.pop.vivants.every(v=>v.genome.v===Gn.VERSION&&Gn.idDe(v.genome)===v.id),temoin:ctx.pop.temoin};
      r=await E.generation(ctx);}catch(e){err=e;}
    const p1=C.lireJson(path.join(cfg.dossierEtat,'population.json'));
    const idsBons=!!ids&&ids.avant===ids.apres&&ids.justes&&ids.temoin===idTemoin&&!!p1&&p1.temoin===idTemoin&&
      (p0.dejaVus||[]).every(id=>(p1.dejaVus||[]).includes(id))&&p1.vivants.every(v=>Gn.idDe(v.genome)===v.id);
    if(!idsBons)L.push(source+', '+cas+' : IDENTIFIANTS '+JSON.stringify(ids)+' temoin apres '+(p1&&p1.temoin));
    const bon=idsBons&&!err&&r&&!r.interrompue&&r.generation===p0.generation+1&&p1.etape==='fin'&&p1.vivants.every(v=>v.genome.v===Gn.VERSION)&&
      !journal.some(t=>/tableau : non ecrit/.test(t))&&r.graines.every(s=>!joues.has(s))&&
      (cas==='tel quel'?p1.graines.blocs===0&&r.graines.every(s=>s<950000):p1.graines.blocs===1&&r.graines.every(s=>s>=1000021));
    if(!bon)ok=false;
    L.push(source+', '+cas+' : '+(err?'ERREUR '+String(err.message).slice(0,200):'generation '+(r&&r.generation)+' finie, genomes v:'+v0.join(',')+' -> v:'+Gn.VERSION+' (memes identifiants), « blocs » '+(blocs0?'deja la':'absent')+' -> '+
      p1.graines.blocs+', graines '+(r&&r.graines.join(' '))+' (aucune deja jouee : '+(r&&r.graines.every(s=>!joues.has(s))?'oui':'NON')+')'));}
  verdict('compatibilite : un etat ecrit par l\'ancien code (genome v:2, graines sans « blocs ») se relit et fait une generation ; reserve d\'avant vide : la suite',ok,L.join(' ; '));
}

/* ===== A6 : LES COURSES LONGUES DEMANDEES D'ABORD (28/11/2026, lot « regles ») =====
   Le meme etat (essais/tests-generation/a6, apres trois generations a 12 graines) copie deux fois ; la generation suivante jouee une fois dans l'ordre
   d'avant (ordreCourses "origine"), une fois les longues d'abord. Le faux ordonnanceur note l'ordre des demandes. Attendu : deux ordres differents,
   celui des longues decroissant en duree attendue ; et RIEN d'autre ne change : les memes cles de courses, population.json, morts.jsonl,
   validations.jsonl et la meme ligne de generations.jsonl (hors date et durees). */
async function casA6(){
  const base=cfgA('a6',{grainesParGeneration:12,grainesEconomie:12,seuilEconomie_s:1e9});
  fs.rmSync(path.join(BAC,'a6'),{recursive:true,force:true});
  /* des survies tres differentes d'un pilote a l'autre : l'ordre des longues n'est pas celui d'origine */
  const survie=(t,l)=>Object.assign({},l,{survie_s:20+(h(t.id)%13)*37+(t.graine%5)});
  SC.ligne=survie;
  {const ctx=E.charger(base,{dire:()=>{}});for(let G=0;G<3;G++)await E.generation(ctx);}
  const R={};
  for(const ordre of ['origine','longues']){
    const d=path.join(BAC,'a6-'+ordre);fs.rmSync(d,{recursive:true,force:true});fs.cpSync(path.join(BAC,'a6'),d,{recursive:true});
    const cfg=cfgA('a6-'+ordre,{grainesParGeneration:12,grainesEconomie:12,seuilEconomie_s:1e9,ordreCourses:ordre});
    const ctx=E.charger(cfg,{dire:()=>{}}),demandes=[];
    SC.ligne=(t,l)=>{if(t.usage==='entrainement')demandes.push({id:t.id,graine:t.graine});return survie(t,l);};
    const r=await E.generation(ctx);
    /* la duree attendue que la regle voit (survies connues avant la generation) */
    const lire=f=>fs.existsSync(path.join(cfg.dossierEtat,f))?fs.readFileSync(path.join(cfg.dossierEtat,f),'utf8'):'';
    const lignes=K.lireCourses(cfg.dossierEtat).filter(l=>l.usage==='entrainement').map(l=>l.cle).sort();
    const sansDates=x=>{const y=JSON.parse(JSON.stringify(x));for(const k of ['date','duree_s','dureeEntrainement_s','pleine_s','debit_h'])delete y[k];return y;};
    const pop=JSON.parse(lire('population.json'));
    R[ordre]={demandes,rapport:sansDates(r),morts:lire('morts.jsonl'),validations:lire('validations.jsonl').split('\n').map(t=>t?JSON.stringify(sansDates(JSON.parse(t))):'').join('\n'),
      pop:JSON.stringify(pop),lignes:JSON.stringify(lignes),generation:pop.generation};}
  SC.ligne=null;
  const a=R.origine,b=R.longues;
  const ordreDiff=JSON.stringify(a.demandes)!==JSON.stringify(b.demandes);
  const memesTaches=JSON.stringify(a.demandes.map(x=>x.id+'|'+x.graine).sort())===JSON.stringify(b.demandes.map(x=>x.id+'|'+x.graine).sort());
  /* decroissant : la survie moyenne connue de chaque pilote avant cette generation, lue dans l'etat de depart */
  const avant=K.lireCourses(path.join(BAC,'a6','etat')).filter(l=>l.mesuree===true&&l.usage==='entrainement');
  const moy=new Map();for(const l of avant){const x=moy.get(l.id)||{s:0,n:0};x.s+=l.survie_s;x.n++;moy.set(l.id,x);}
  const popA=JSON.parse(a.pop),parent=id=>{const v=popA.vivants.find(x=>x.id===id);return v&&v.parents&&v.parents[0];};
  const att=id=>{const x=moy.get(id)||moy.get(parent(id));return x?x.s/x.n:null;};
  const dur=b.demandes.map(x=>att(x.id));
  const decroissant=dur.every((x,i)=>i===0||x==null||dur[i-1]==null||dur[i-1]>=x);
  const pareil=JSON.stringify(a.rapport)===JSON.stringify(b.rapport)&&a.morts===b.morts&&a.validations===b.validations&&a.pop===b.pop&&a.lignes===b.lignes;
  verdict('A6 : la generation '+a.generation+' jouee dans l\'ordre d\'origine et les longues d\'abord : autre ordre des demandes, memes courses, notes et journaux',
    ordreDiff&&memesTaches&&decroissant&&pareil,
    a.demandes.length+' courses ; ordre '+(ordreDiff?'different':'IDENTIQUE')+' ; longues d\'abord '+(decroissant?'decroissant':'NON decroissant')+' (attendu '+
    Math.round(dur[0])+' s ... '+Math.round(dur[dur.length-1])+' s) ; rapport, population.json, morts, validations, cles des courses : '+(pareil?'identiques':'DIFFERENTS'));
}
const morts=()=>C.lireJsonl(path.join(ETAT,'morts.jsonl'));
const popDisque=()=>C.lireJson(path.join(ETAT,'population.json'));

(async function(){
  const t0=Date.now();
  fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(ETAT,{recursive:true});
  const cfg=cfgEssai(),journal=[];
  let ctx=E.charger(cfg,{dire:t=>journal.push(t)});

  /* G0 */
  await E.generation(ctx);
  verdict('G0 : la generation 0 finit, controle d\'identite une fois, empreinte gardee',ctx.pop.generation===0&&ctx.pop.etape==='fin'&&appelsIdentite===1&&/^[0-9a-f]{12}$/.test(ctx.pop.identite||''),
    'identite '+ctx.pop.identite+', appels '+appelsIdentite);

  /* G1 : les retraits et les renvois d'office */
  const V0=ctx.pop.vivants.map(v=>v.id),T=ctx.pop.temoin,[X,Y,Z]=V0.filter(i=>i!==T);
  SC.ligne=function(t,l){
    if(t.usage!=='entrainement')return l;
    const g=ctx.pop.grainesGeneration;
    const rate=r=>Object.assign({},l,{mesuree:false,raison:r,palier:null,mesures:null});
    if(t.id===X&&(t.graine===g[0]||t.graine===g[1]))return rate('chargement : faux echec de X');
    if(t.id===Y&&t.graine===g[0])return Object.assign({},l,{essai:2,pannesEssais:2});   /* 2 pannes au premier essai, mesuree au second */
    if((t.id===Z||t.id===T)&&t.graine===g[2])return rate('chargement : faux echec commun');
    return l;};
  const r1=await E.generation(ctx);
  const g1=r1.graines,M1=morts();
  const mX=M1.find(m=>m.id===X),mY=M1.find(m=>m.id===Y);
  verdict('G1 : une graine ratee par un seul pilote reste ; ratee par deux, retiree',ctx.pop.grainesRetirees.indexOf(g1[0])<0&&ctx.pop.grainesRetirees.indexOf(g1[1])<0&&
    ctx.pop.grainesRetirees.indexOf(g1[2])>=0&&ctx.pop.grainesRetirees.length===1,'graines '+g1.join(' ')+' ; retirees '+ctx.pop.grainesRetirees.join(' '));
  verdict('G1 : 2 courses non mesurees : vire d\'office (non-mesuree)',!!mX&&mX.raison==='non-mesuree'&&!ctx.pop.vivants.some(v=>v.id===X),mX?mX.raison:'X vivant');
  verdict('G1 : pannes d\'un premier essai comptees (pannesEssais) : vire d\'office (pannes)',!!mY&&mY.raison==='pannes'&&!ctx.pop.vivants.some(v=>v.id===Y),mY?mY.raison:'Y vivant');
  verdict('G1 : le temoin et Z (une seule course ratee) restent',ctx.pop.vivants.some(v=>v.id===T)&&ctx.pop.vivants.some(v=>v.id===Z));
  SC.ligne=null;

  /* G2 : interrompue pendant le coffre : aucune mort ecrite ; puis reprise */
  const nM=morts().length;
  ctx.pop.coffreEpoque=true;
  SC.ligne=(t,l)=>t.usage==='coffre'?null:l;
  const r2=await E.generation(ctx);
  const virésEnMemoire=6-ctx.pop.vivants.length,disque=popDisque();
  verdict('G2 : interrompue pendant le coffre : morts.jsonl intact',r2&&r2.interrompue===true&&morts().length===nM&&disque.etape==='courses'&&disque.generation===2&&virésEnMemoire>0,
    'interrompue '+(r2&&r2.interrompue)+', vires en memoire '+virésEnMemoire+', lignes de morts '+nM+' -> '+morts().length+', population.json etape '+disque.etape);
  SC.ligne=null;
  ctx=E.charger(cfg,{dire:t=>journal.push(t)});
  const r2b=await E.generation(ctx);
  const M2=morts().slice(nM);
  verdict('G2 reprise : ses morts sont ecrits, et ce sont bien des morts',!r2b.interrompue&&r2b.generation===2&&M2.length===r2b.morts.length&&M2.length>0&&
    M2.every(m=>m.mort===2&&!ctx.pop.vivants.some(v=>v.id===m.id)),M2.map(m=>m.id.slice(0,8)+' '+m.raison).join(', '));

  /* G3-G5 : l'economie */
  cfg.seuilEconomie_s=1;cfg.grainesEconomie=2;
  SC.attente_ms=2300;
  await E.generation(ctx);
  const n3=ctx.pop.nGraines;
  SC.attente_ms=0;
  const r4=await E.generation(ctx);
  const n4=ctx.pop.nGraines;
  SC.pause_ms=2600;
  const r5=await E.generation(ctx);
  const n5=ctx.pop.nGraines;
  verdict('G3-G5 : economie sur la duree des courses, retour sous le seuil, PAUSE exclue',n3===2&&r4.graines.length===2&&n4===3&&n5===3&&r5.dureeEntrainement_s<=1,
    'apres G3 '+n3+' graines ; G4 (2 graines, rapide) -> '+n4+' ; G5 avec 2,6 s de PAUSE : entrainement '+r5.dureeEntrainement_s+' s, -> '+n5);

  /* G6-G7 : l'identite */
  const a0=appelsIdentite,vraie=ctx.pop.identite;
  ctx.pop.identite='perimee';
  await E.generation(ctx);
  const a6=appelsIdentite;
  await E.generation(ctx);
  verdict('G6-G7 : une empreinte d\'identite perimee refait le controle, une seule fois',a6===a0+1&&appelsIdentite===a6&&ctx.pop.identite===vraie,'appels '+a0+' -> '+a6+' -> '+appelsIdentite);

  /* G8 : d'autres fichiers du bot */
  SC.journal='course : graine 1 NON MESUREE (essai 1) : jouee avec d\'autres fichiers du bot (yeux, main, modele… aaaa, l\'epoque a bbbb)';
  const r8=await E.generation(ctx);
  verdict('G8 : un enfant qui a charge d\'autres fichiers coupe la generation',r8.interrompue===true&&ctx.arret.epoque===true);

  /* ===== A4 et A6 (28/11/2026, lot « regles ») ===== */
  await casA4(12);
  await casA4(8);
  await casA6();
  await casCompat();

  /* la reference rechargee */
  const avant=require.cache[require.resolve('../../bot/ressemblance.js')].exports;
  const R2=N.referenceEpoque({recharger:true});
  const apres=require.cache[require.resolve('../../bot/ressemblance.js')].exports;
  verdict('referenceEpoque({recharger}) relit ressemblance.js et l\'etalon',avant!==apres&&JSON.stringify(R2)===JSON.stringify(REF));

  /* le tri : d'autres fichiers du bot, un echec d'environnement */
  const ep=K.epoque(C.lireConfig());
  const bon={palier:3,pannes:0,jeu_sha:ep.composants.jeu_sha,jeu:ep.composants.version,simulateur:ep.composants.simulateur,yeuxTirages:0,node:ep.composants.node,fichiers_sha:ep.composants.fichiers_sha};
  const r=N.pourquoiEcartee(Object.assign({},bon,{fichiers_sha:'000000000000'}),ep.composants);
  verdict('tri : une course jouee avec d\'autres fichiers du bot est ecartee, comme echec d\'environnement',N.pourquoiEcartee(bon,ep.composants)===null&&/autres fichiers du bot/.test(r||'')&&
    K.estEnv({mesuree:false,raison:r})&&!K.estEnv({mesuree:false,raison:'chargement : x'}),r);

  const ko=res.filter(x=>!x.ok);
  if(ko.length)fs.writeFileSync(path.join(BAC,'journal.txt'),journal.join('\n')+'\n');
  dire(`=== ${res.length-ko.length}/${res.length} passent en ${Math.round((Date.now()-t0)/1000)} s${ko.length?' ; ECHOUENT : '+ko.map(x=>x.nom).join(' | ')+' (journal : essais/tests-generation/journal.txt)':''}`);
  process.exit(ko.length?1:0);
})().catch(e=>{dire('ECHOUE exception : '+String(e&&e.stack||e));process.exit(1);});
