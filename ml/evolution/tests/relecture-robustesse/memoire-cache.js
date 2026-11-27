#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : LA MEMOIRE DU CACHE SUR DES SEMAINES (2026-11-27, le relecteur) =====
   courses.creer() garde en memoire TOUTES les lignes de TOUS les courses-*.jsonl (toutes epoques), et evoluer.chargerLignes relit tout.
   On fabrique un dossier de N lignes (copies des vraies lignes de l'essai, cles changees) et on mesure le tas et le temps de creer().
   node --expose-gc memoire-cache.js 50000 */
'use strict';
const path=require('path'),fs=require('fs');
const O=require('./outils'),K=require(path.join(O.EVOL,'courses.js')),C=require(path.join(O.EVOL,'commun.js'));
const N=+(process.argv[2]||50000);
const src=path.join(O.EVOL,'essais','tests-evoluer','etat','courses-2026-48.jsonl');
const L=fs.readFileSync(src,'utf8').split('\n').filter(Boolean);
const d=path.join(O.ICI,'etat-memoire');fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
let n=0,sem=0;
while(n<N){const out=[];for(let i=0;i<5000&&n<N;i++,n++){const x=JSON.parse(L[n%L.length]);x.cle=x.cle+'#'+n;out.push(JSON.stringify(x));}
  fs.writeFileSync(path.join(d,'courses-2026-'+String(sem++).padStart(2,'0')+'.jsonl'),out.join('\n')+'\n');}
const octets=fs.readdirSync(d).reduce((s,f)=>s+fs.statSync(path.join(d,f)).size,0);
global.gc&&global.gc();const h0=process.memoryUsage().heapUsed,t0=Date.now();
const cfg=C.lireConfig('config-essai.json');
const ep=JSON.parse(JSON.stringify({courses:'x',note:'y',composants:{jeu_sha:'a',simulateur:'b',node:process.version,version:'v'}}));
const ord=K.creer({cfg,epoque:ep,dossierEtat:d,ecrire:false});
const t1=Date.now();global.gc&&global.gc();const h1=process.memoryUsage().heapUsed;
O.dire(N+' lignes ('+(octets/1e6).toFixed(1)+' Mo sur disque) : creer() en '+(t1-t0)+' ms, tas +'+((h1-h0)/1e6).toFixed(0)+' Mo ('+Math.round((h1-h0)/N)+' octets par ligne)');
void ord;
