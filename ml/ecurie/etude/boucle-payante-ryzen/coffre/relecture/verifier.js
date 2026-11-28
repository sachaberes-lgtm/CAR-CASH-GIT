#!/usr/bin/env node
/* ===== LA RELECTURE DU LOT « MESURE » : UN SECOND CHEMIN (2026-11-28, le relecteur : « refais au moins une preuve cle par un chemin independant ») =====
   Les courses de ce dossier ont ete jouees par ml/bot/noter.js (son propre processus par course, sans l'ordonnanceur de ml/evolution), 2 a la fois :
     node ml/bot/noter.js ml/labo/cerveaux/<p>-pilote.js --graines 4 --depart 990000 --tmax 900 --regime allege --coeurs 2 --sortie .../noter-<p>-990000-4.json
     node ml/bot/noter.js ml/labo/cerveaux/<p>-pilote.js --graines 6 --depart 990148 --tmax 900 --regime allege --coeurs 2 --sortie .../noter-<p>-990148-6.json
   pour p = c0025, c0064, c0101 : les 10 premieres graines du coffre (990000 + 37 j, j = 0..9).
   Ce script (aucune fonction de l'auteur, aucun hasard de graines.rngDe) :
   1. compare les 4 premieres graines aux courses de l'auteur (../etat), empreinte par empreinte ;
   2. calcule les differences appariees graine par graine (palier, survie), un bootstrap apparie maison (20000 tirages, generateur congruentiel fixe)
      et le test du signe exact ;
   3. compte les courses identiques (meme empreinte) entre pilotes.
   Usage : node ml/ecurie/etude/boucle-payante-ryzen/coffre/relecture/verifier.js */
'use strict';
const fs=require('fs'),path=require('path');
const P=['c0025','c0064','c0101'],D={};
for(const p of P){D[p]=new Map();
  for(const f of ['-990000-4','-990148-6']){const n=JSON.parse(fs.readFileSync(path.join(__dirname,'noter-'+p+f+'.json'),'utf8'));
    if(n.ecartees&&n.ecartees.length)console.log('ECARTEES',p,JSON.stringify(n.ecartees));
    for(const c of n.courses)D[p].set(c.graine,c);}}
const G=[...D.c0025.keys()].sort((a,b)=>a-b);

/* 1. le meme jeu que l'auteur ? */
const etat=path.join(__dirname,'..','etat');
const lignes=[];for(const f of fs.readdirSync(etat))if(/^courses-.*\.jsonl$/.test(f))
  for(const t of fs.readFileSync(path.join(etat,f),'utf8').split(/\r?\n/))if(t.trim())lignes.push(JSON.parse(t));
let memes=0,comparees=0;
for(const p of P)for(const g of G){const l=lignes.find(x=>x.usage==='coffre'&&x.id===p&&x.graine===g&&x.mesuree===true);if(!l)continue;
  comparees++;if(l.empreinte===D[p].get(g).empreinte)memes++;else console.log('DIFFERENTE',p,g,l.empreinte,D[p].get(g).empreinte);}
console.log('courses de l\'auteur rejouees par noter.js : '+memes+'/'+comparees+' empreintes identiques');

/* 2. le detail et les paires */
console.log('graine | '+P.map(p=>p+' (palier / survie s, empreinte)').join(' | '));
for(const g of G)console.log(g+' | '+P.map(p=>{const c=D[p].get(g);return String(c.palier).padStart(2)+' / '+String(c.duree_s).padStart(5)+' '+c.empreinte;}).join(' | '));
let s=987654321;const tirer=n=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return Math.floor(s/4294967296*n);};
function apparie(d){const n=d.length,m=d.reduce((a,b)=>a+b,0)/n,v=[];
  for(let t=0;t<20000;t++){let q=0;for(let i=0;i<n;i++)q+=d[tirer(n)];v.push(q/n);}v.sort((a,b)=>a-b);
  const mieux=d.filter(x=>x>0).length,moins=d.filter(x=>x<0).length,N=mieux+moins,k=Math.min(mieux,moins);
  let c=1,q=0;for(let i=0;i<=k;i++){if(i)c=c*(N-i+1)/i;q+=c;}const pS=N?Math.min(1,2*q/Math.pow(2,N)):1;
  return 'moyenne '+(m>=0?'+':'')+m.toFixed(2)+' IC 95 % ['+v[500].toFixed(2)+' ; '+v[19499].toFixed(2)+'] mieux/pareil/moins '+mieux+'/'+(n-N)+'/'+moins+' p signe '+pS.toFixed(3);}
for(const [a,b] of [['c0064','c0025'],['c0101','c0025'],['c0101','c0064']]){
  console.log(a+' - '+b+' palier : '+apparie(G.map(g=>D[a].get(g).palier-D[b].get(g).palier)));
  console.log(a+' - '+b+' survie : '+apparie(G.map(g=>D[a].get(g).duree_s-D[b].get(g).duree_s)));
  console.log(a+' - '+b+' courses identiques : '+G.filter(g=>D[a].get(g).empreinte===D[b].get(g).empreinte).length+'/'+G.length);}
for(const p of P){const x=G.map(g=>D[p].get(g).palier);console.log(p+' palier moyen '+(x.reduce((a,b)=>a+b,0)/x.length).toFixed(2)+' sur '+x.length+' graines');}
