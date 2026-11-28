#!/usr/bin/env node
/* L'ECART-TYPE APPARIE DE LA SURVIE ET DU PALIER (28/11/2026, concepteur vitesse) : lu sur les courses du banc d'etude
   (ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl, bras « depart » = pilote 6e05036f, maps tirees, 900 s). Aucune course.
   Sert a dire combien de graines il faut pour voir un ecart de survie. usage : node ml/ecurie/etude/avant-le-bord/concepteur-vitesse/sigma-survie.js */
'use strict';
const fs=require('fs'),path=require('path');
const L=fs.readFileSync(path.join(__dirname,'..','..','banc-des-genes','etat','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x));
const par={};for(const l of L){par[l.pilote]=par[l.pilote]||{};par[l.pilote][l.graine]=l;}
const dep=par[Object.keys(par).find(k=>k.indexOf('6e05036f')===0)];
const sd=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return [+m.toFixed(2),+Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/(a.length-1)).toFixed(2)];};
const D=Object.values(dep);
console.log('depart : '+D.length+' courses ; survie moyenne/ecart-type '+sd(D.map(l=>l.survie_s)).join(' / ')+' s ; palier '+sd(D.map(l=>l.palier)).join(' / ')+' ; morts par course '+sd(D.map(l=>l.morts||0)).join(' / ')+' ; finies a tmax '+D.filter(l=>l.survie_s>=l.tmax-1).length);
const tS=[],tP=[];
for(const n of Object.keys(par)){if(par[n]===dep||Object.keys(par[n]).length<50)continue;const dS=[],dP=[];let tous=0;
  for(const g of Object.keys(dep)){const a=par[n][g],b=dep[g];if(!a)continue;tous++;if(a.empreinte!==b.empreinte){dS.push(a.survie_s-b.survie_s);dP.push(a.palier-b.palier);}}
  if(dS.length>=20){const s=sd(dS),p=sd(dP);tS.push(s[1]);tP.push(p[1]);console.log(n.slice(0,8)+' : changees '+dS.length+'/'+tous+' ; ecart de survie (moy / e.-t.) '+s.join(' / ')+' s ; ecart de palier '+p.join(' / '));}}
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
console.log('ecart-type apparie median, courses changees : survie '+med(tS)+' s ; palier '+med(tP));
