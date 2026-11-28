#!/usr/bin/env node
/* brouillon : la survie et la cause de mort des 32 courses a carte tenue sur decor (en-tetes des traces de sortie-preparee). Lecture seule. */
'use strict';
const fs=require('fs'),path=require('path');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const o={};
for(const n of fs.readdirSync(LIG).filter(x=>/tenue.*\.json$/.test(x)&&!/jsonl/.test(x)).sort()){
  const j=JSON.parse(fs.readFileSync(path.join(LIG,n),'utf8'));const h=j.entete?j:(j.resultat||j);
  const c=n.split('-')[0];(o[c]=o[c]||[]).push({s:h.survie_s,cause:h.cause,pal:h.palier,tmax:h.tmax});}
for(const c in o){const S=o[c].map(x=>x.s).sort((a,b)=>a-b),m=S.reduce((a,x)=>a+x,0)/S.length,sd=Math.sqrt(S.reduce((a,x)=>a+(x-m)*(x-m),0)/(S.length-1));
  console.log(c.padEnd(8)+' n '+S.length+' survie '+S.join(' ')+' | moyenne '+m.toFixed(0)+' ecart-type '+sd.toFixed(0)+' | causes '+o[c].map(x=>x.cause).join(',')+' | paliers '+o[c].map(x=>x.pal).join(',')+' | tmax '+o[c][0].tmax);}
