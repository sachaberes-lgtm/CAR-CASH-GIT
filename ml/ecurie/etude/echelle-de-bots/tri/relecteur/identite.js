#!/usr/bin/env node
/* ===== LE RELECTEUR REFAIT LA PREUVE D'IDENTITE DU TEST B (28/11/2026, etude « l'echelle de bots », le relecteur adverse) =====
   Sans rejouer : relit tri/parties-banc/*.json.gz et la ligne du banc (bras depart) de chaque graine ; compare palier, survie, cause, pieces et
   les trois empreintes ; verifie que la partie enregistree finit a la survie annoncee ; ecrit la note relecteur/note-test-b-40.json au format
   de noter.js --parties (lue par ml/bot/discerner.js sans le changer).
   usage : node ml/ecurie/etude/echelle-de-bots/tri/relecteur/identite.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,TRI=path.join(ICI,'..'),RACINE=path.resolve(TRI,'..','..','..','..','..');
const {finVraie}=require(path.join(RACINE,'ml','bot','mesures'));
const banc={};for(const s of fs.readFileSync(path.join(RACINE,'ml','ecurie','etude','banc-des-genes','etat','courses-2026-48.jsonl'),'utf8').trim().split('\n')){const l=JSON.parse(s);if(l.id==='depart')banc[l.graine]=l;}
const D=path.join(TRI,'parties-banc'),P=[],L=[];let ok=0;const surv=[];
for(const f of fs.readdirSync(D).filter(f=>/\.json\.gz$/.test(f)).sort()){
  const j=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(D,f))).toString('utf8')),r=j.resultat,b=banc[r.graine];
  const champs=['palier','survie_s','cause','pieces','empreinte','empreinteVues','empreinteTouches'],dif=champs.filter(k=>r[k]!==b[k]);
  const fin=finVraie(j.partie).fin.t,t0=j.partie.ech[0][j.partie.cols.indexOf('t')];
  if(!dif.length)ok++;surv.push(r.survie_s);
  L.push(`${r.graine} palier ${r.palier} survie ${r.survie_s} ${r.cause} · banc ${b.palier} ${b.survie_s} ${b.cause} · ${dif.length?'DIFFERE : '+dif.join(','):'identique'} · fin de la partie enregistree ${fin.toFixed(1)} s (1er echantillon ${t0.toFixed(2)}) · pilote ${r.shaPilote.slice(0,12)}`);
  P.push({partie:j.partie});}
surv.sort((a,b)=>a-b);const n=surv.length,med=n?(n%2?surv[(n-1)/2]:(surv[n/2-1]+surv[n/2])/2):null;
const tete=`${n} courses lues ; identiques a leur ligne du banc sur 7 champs : ${ok}/${n} ; survie mediane ${med} s`;
fs.writeFileSync(path.join(ICI,'identite.txt'),tete+'\n'+L.join('\n')+'\n');
fs.writeFileSync(path.join(ICI,'note-test-b-40.json'),JSON.stringify({cerveau:'c0025, bras depart du banc des genes (6e05036f219e)',parties:P}));
console.log(tete);
