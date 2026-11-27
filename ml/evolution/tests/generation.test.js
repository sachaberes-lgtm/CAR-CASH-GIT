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
     G8 epoque       : un enfant qui a charge d'autres fichiers du bot coupe la generation (ctx.arret.epoque) */
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
