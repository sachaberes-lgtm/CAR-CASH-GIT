#!/usr/bin/env node
/* ===== RASSEMBLER LES 40 PARTIES DU TEST B AU FORMAT DE noter.js --parties (28/11/2026, etude « l'echelle de bots », le mesureur du test B) =====
   Lit tri/parties-banc/<graine>.json.gz (ecrits par course-tri.js), verifie chaque course contre sa ligne du banc des genes (palier, survie, cause,
   empreintes), et ecrit trois notes lisibles par ml/bot/discerner.js ({parties:[{partie}]}) : toutes, paliers 4-5, paliers 6-8 ; plus
   sorties/identite.txt (la comparaison course par course) et la survie mediane des 40.
   usage : node ml/ecurie/etude/echelle-de-bots/tri/rassembler.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,RACINE=path.resolve(ICI,'..','..','..','..','..');
const GRAINES=[3000037,3000111,3000222,3000259,3000333,3000370,3000444,3000592,3000666,3000703,3000740,3000777,3000851,3000925,3000962,3000999,3001073,3001184,3001295,3001554,
  3001665,3001702,3001813,3001850,3001887,3001924,3001961,3001998,3002109,3002146,3002294,3002331,3002368,3002479,3002516,3002553,3002590,3002664,3002701,3002775];
const banc={};for(const s of fs.readFileSync(path.join(RACINE,'ml','ecurie','etude','banc-des-genes','etat','courses-2026-48.jsonl'),'utf8').trim().split('\n')){
  const l=JSON.parse(s);if(l.id==='depart')banc[l.graine]=l;}
const toutes=[],b45=[],b68=[],L=[],surv=[];let pareil=0,manque=0;
for(const g of GRAINES){
  const f=path.join(ICI,'parties-banc',g+'.json.gz');
  if(!fs.existsSync(f)){manque++;L.push(g+' : PAS ENCORE JOUEE');continue;}
  const j=JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8')),r=j.resultat,b=banc[g];
  const ok=r.palier===b.palier&&r.survie_s===b.survie_s&&r.cause===b.cause&&r.empreinte===b.empreinte&&r.empreinteVues===b.empreinteVues&&r.empreinteTouches===b.empreinteTouches;
  if(ok)pareil++;
  L.push(`${g} : rejouee palier ${r.palier} survie ${r.survie_s} ${r.cause} ${r.empreinte}/${r.empreinteVues}/${r.empreinteTouches} · banc palier ${b.palier} survie ${b.survie_s} ${b.cause} ${b.empreinte}/${b.empreinteVues}/${b.empreinteTouches} · ${ok?'IDENTIQUE':'DIFFERENTE'} · cartes ${(r.cartes||[]).join('>')} · seconde chance ${r.chancePrise}`);
  const p={partie:j.partie};toutes.push(p);(r.palier<=5?b45:b68).push(p);surv.push(r.survie_s);}
surv.sort((a,b)=>a-b);const med=surv.length?(surv.length%2?surv[(surv.length-1)/2]:(surv[surv.length/2-1]+surv[surv.length/2])/2):null;
const tete=`${toutes.length} courses lues, ${manque} manquantes ; identiques au banc (palier, survie, cause, 3 empreintes) : ${pareil}/${toutes.length} ; survie mediane ${med} s ; 4-5 : ${b45.length}, 6-8 : ${b68.length}`;
fs.writeFileSync(path.join(ICI,'sorties','identite.txt'),tete+'\n'+L.join('\n')+'\n');
const ecr=(n,P)=>fs.writeFileSync(path.join(ICI,'notes',n),JSON.stringify({cerveau:'c0025 (bras depart du banc des genes, 6e05036f219e)',jeu:'cashcar-v1627 e7e1eed4718f',regime:'allege',tmax:900,parties:P}));
fs.mkdirSync(path.join(ICI,'notes'),{recursive:true});
ecr('test-b-40.json',toutes);ecr('test-b-paliers-4-5.json',b45);ecr('test-b-paliers-6-8.json',b68);
console.log(tete);
