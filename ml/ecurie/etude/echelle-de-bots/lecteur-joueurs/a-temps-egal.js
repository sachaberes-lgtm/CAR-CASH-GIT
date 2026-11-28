#!/usr/bin/env node
/* ===== A TEMPS EGAL (2026-11-28, etude « echelle de bots ») : le rythme et la vitesse grandissent avec le temps de la partie ; pour comparer une
   partie faible et une forte sans ce biais, on lit les pieces ramassees et la vitesse au sol aux MEMES instants (0-60 s, 60-120 s, 120-180 s).
   usage : node ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/a-temps-egal.js > ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/a-temps-egal.txt
   Lit sortie.json ? non : relit l'etalon comme parties.js. Lecture seule. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..','..','..','..');
const {partiesJoueurs,mesures,finVraie}=require(path.join(R,'ml/bot/mesures'));
const D=path.join(R,'ml/bot/etalon');
const QUI={'cashcar-parties-2026-11-23-1950.json':'Sacha','cashcar-parties-2026-11-23-2020.json':'Sacha','cashcar-parties-2026-11-24-1213.json':'Sacha','cashcar-parties-2026-11-24-11-05.json':'Leo'};
const lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).sort().map(x=>{const j=JSON.parse(fs.readFileSync(path.join(D,x),'utf8'));(j.parties||[]).forEach(p=>p._f=x);return {nom:x,j};});
const P=partiesJoueurs(lus).parties.map(c0=>({c:finVraie(c0),m:mesures(c0),qui:QUI[c0._f]})).sort((a,b)=>String(a.c.debut).localeCompare(String(b.c.debut)));
const F=[[0,60],[60,120],[120,180],[180,240]];
console.log('joueur | debut | palier | duree | ecran (w x h, tel, app) | pour chaque fenetre de 60 s : pieces ramassees · km/h moyen au sol · nitro % (- = partie finie avant)');
for(const {c,m,qui} of P){const col={};c.cols.forEach((n,i)=>col[n]=i);
  const cell=F.map(([a,b])=>{if(m.duree_s<b)return '-';const pc=c.ev.filter(e=>e[1]==='piece'&&e[0]>=a&&e[0]<b).reduce((s,e)=>s+(e[2]|0),0);
    const E=c.ech.filter(e=>e[col.t]>=a&&e[col.t]<b),S=E.filter(e=>e[col.m]===0);
    return pc+' · '+(S.length?Math.round(S.reduce((s,e)=>s+e[col.kmh],0)/S.length):'?')+' · '+(E.length?Math.round(100*E.filter(e=>e[col.nit]).length/E.length):'?');});
  console.log([qui,c.debut.slice(5,16),'P'+m.palier,m.duree_s,c.ecran?`${c.ecran.w}x${c.ecran.h} tel=${c.ecran.tel} app=${c.ecran.app}`:'?'].concat(cell).join(' | '));}
/* les morts : cause et map, tous */
const C={};for(const {m,c} of P){const k=m.cause+' @ '+(c.routes[c.routes.length-1]||{}).carte;C[k]=(C[k]||0)+1;}
console.log('\nmorts (cause @ map de la derniere route) : '+Object.entries(C).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · '));
/* le temps passe sur chaque map, tous joueurs (secondes d'echantillons) */
const T={};for(const {c} of P){const col={};c.cols.forEach((n,i)=>col[n]=i);for(let i=1;i<c.ech.length;i++){const d=c.ech[i][col.t]-c.ech[i-1][col.t];if(d>0&&d<.25){const k=(c.routes[c.ech[i][col.r]]||{}).carte;T[k]=(T[k]||0)+d;}}}
console.log('minutes par map : '+Object.entries(T).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+(e[1]/60).toFixed(1)).join(' · '));
