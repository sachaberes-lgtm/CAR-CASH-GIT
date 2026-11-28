#!/usr/bin/env node
/* ===== COMPLEMENTS A L'ANALYSE (28/11/2026, le mesureur) : la vitesse sans les courses au pouvoir VITESSE, l'entree de virage en Fisher.
   Lecture seule (sorties/lignes). usage : node complements.js -> sorties/complements.txt ===== */
'use strict';
const fs=require('fs'),path=require('path');
const {lireCourses,decollages,rangStrate,fisher}=require('./analyser');
const ANC=new Set();for(let i=200;i<208;i++)ANC.add(3963000+37*i);
const {C}=lireCourses(c=>ANC.has(c.res.graine));
const D=decollages(C).filter(d=>!d.fin);
const L=[],P=s=>L.push(s);
const sansX=D.filter(d=>!d.sol.some(s=>d.t0-s.t<=3&&s.vm>1.01));
P('decollages sans pouvoir VITESSE dans les 3 s avant : '+sansX.filter(d=>d.mort).length+' morts, '+sansX.filter(d=>!d.mort).length+' poses');
for(const x of [2,1.5,1,.6]){const it=sansX.map(d=>{const s=d.a(x);return s?{mort:d.mort,carte:d.carte,v:s.v,pal:s.pal,rel:s.P&&s.P.vx?s.v/s.P.vx:null}:null;}).filter(Boolean);
  const a=rangStrate(it,o=>o.v,o=>o.carte),b=rangStrate(it,o=>o.pal,o=>o.carte),c=rangStrate(it,o=>o.v,o=>o.carte+'|'+o.pal),e=rangStrate(it,o=>o.rel,o=>o.carte);
  P(x+' s avant, sans pouvoir VITESSE : vitesse rang '+a.rang+' p '+a.p+' ('+a.morts+'/'+a.poses+') ; palier rang '+b.rang+' p '+b.p+' ; vitesse a carte et palier egaux rang '+c.rang+' p '+c.p+' ('+c.morts+'/'+c.poses+', '+c.strates+' strates) ; v/vmax rang '+e.rang+' p '+e.p);}
/* entree de virage, Fisher, sur les decollages classes */
const cls=d=>{const s1=d.a(1.5),s0=d.sol.filter(s=>d.t0-s.t<=.5);if(!s1||!s0.length)return null;const k1=Math.abs(s1.lr/Math.max(6,s1.v)),k0=s0.reduce((a,s)=>a+Math.abs(s.lr/Math.max(6,s.v)),0)/s0.length;
  return (k0<.0015&&k1<.0015)?'droit':k0>k1*1.5?'entree':k1>k0*1.5?'sortie':'stable';};
const M=D.filter(d=>d.mort&&cls(d)),Po=D.filter(d=>!d.mort&&cls(d));
const a=M.filter(d=>cls(d)==='entree').length,c=Po.filter(d=>cls(d)==='entree').length;
P('entree de virage (courbure x1,5 entre 1,5 s avant et la derniere demi-seconde) : morts '+a+' sur '+M.length+', poses '+c+' sur '+Po.length+' ; Fisher unilateral p '+fisher(a,M.length,c,Po.length));
fs.writeFileSync(path.join(__dirname,'sorties','complements.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
