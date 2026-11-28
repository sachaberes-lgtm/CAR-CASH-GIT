#!/usr/bin/env node
/* ===== LA VILLE : COTE BORDE CONTRE COTE OUVERT, JUGE PAR LA REGLE ECRITE AVANT (28/11/2026, le mesureur ; prediction-ville.md) =====
   Lecture seule de sorties/lignes/ville-tenue-*.jsonl.gz. Les sorties voulues : volsDe (../../sortie-preparee/analyser.js), voulu ET raccourci engage.
   La classe du cote : la definition de ../concepteur-libre/cote-borde.js, recopiee SANS retouche (classe, et la vue d'engagement a 0,026 s de raccourci.t0).
   Les 16 courses neuves (graines 3963000 + 37 i, i = 400..415) SEULES jugent ; l'ensemble (avec les 8 de la mesure d'avant, rejouees ici) est donne a part.
   usage : node ville.js -> sorties/ville.txt, sorties/ville.json */
'use strict';
const fs=require('fs'),path=require('path');
const ICI=__dirname;
const {volsDe}=require(path.join(ICI,'..','..','sortie-preparee','analyser'));
const {lireCourses,fisher}=require('./analyser');
const NEUVES=new Set();for(let i=400;i<416;i++)NEUVES.add(3963000+37*i);
const ANC=new Set();for(let i=200;i<208;i++)ANC.add(3963000+37*i);
/* recopie de cote-borde.js */
const classe=X=>{if(!X||!Array.isArray(X.R))return null;const r=X.R.find(q=>q.m==='rien'),p=X.R.find(q=>q.m==='plane');
  const n=(r&&r.i==='choc'?1:0)+(p&&p.i==='choc'?1:0);return n===2?'borde':n===1?'mi-borde':'ouvert';};
const cause=X=>{if(!X||!Array.isArray(X.R))return null;const r=X.R.find(q=>(q.m==='rien'||q.m==='plane')&&q.i==='choc');return r?r.c:null;};
function sorties(C){const out=[];
  for(const c of C){const V=c.vues;for(const x of volsDe(c).vols){if(!(x.voulu&&x.raccourci)||x.carte!=='ville')continue;const R=x.raccourci,k=R.c>0?'Sg':'Sd';
    const i0=V.findIndex(o=>Math.abs(o.t-R.t0)<.026);if(i0<0){out.push({course:c.nom,neuve:NEUVES.has(c.res.graine),classe:'sans vue',dessous:!!R.d,mort:x.issue.k==='mort'});continue;}
    out.push({course:c.nom,neuve:NEUVES.has(c.res.graine),t0:R.t0,dessous:!!R.d,facon:R.f,mort:x.issue.k==='mort',cause:x.issue.cause||null,classe:String(classe(V[i0][k])),decor:cause(V[i0][k])});}}
  return out;}
function juger(a,b,c,d){
  if(b<1||d<1)return 'INDECISE (un cote sans sortie)';
  const rb=a/b,ro=c/d,rap=ro>0?rb/ro:(a>=2?Infinity:(a===0?0:1)),p=fisher(a,b,c,d);
  const v=rap>=3&&p<=.05?'CONFIRMEE':(b>=10&&d>=10&&rap<1.5)?'REFUTEE':'INDECISE';
  return v+' (rapport '+(rap===Infinity?'infini':rap.toFixed(2))+', Fisher unilateral p '+p+')';}
const {C}=lireCourses(c=>c.res.carteDemandee==='ville'&&(NEUVES.has(c.res.graine)||ANC.has(c.res.graine)));
const S=sorties(C),L=[],P=s=>L.push(s);
const neuves=C.filter(c=>NEUVES.has(c.res.graine));
P('LA VILLE (prediction-ville.md) : '+neuves.length+' courses neuves, '+(C.length-neuves.length)+' courses de la mesure d\'avant rejouees');
P('courses neuves : '+neuves.map(c=>c.res.graine+' '+c.res.survie_s+' s '+c.res.cause+' p'+c.res.palier).join(' ; '));
for(const [mot,f] of [['LES 16 COURSES NEUVES SEULES (elles jugent)',s=>s.neuve],['LES 8 COURSES D\'AVANT (rejouees)',s=>!s.neuve],['L\'ENSEMBLE (ne juge rien)',s=>true]]){
  const X=S.filter(f);P('');P('== '+mot+' : '+X.length+' sorties voulues, '+X.filter(s=>s.mort).length+' morts ==');
  for(const [sm,g] of [['vrais raccourcis',s=>!s.dessous],['sorties du dessous',s=>s.dessous],['toutes',s=>true]]){
    const T={};for(const s of X.filter(g)){T[s.classe]=T[s.classe]||[0,0];T[s.classe][0]++;if(s.mort)T[s.classe][1]++;}
    P('  '+sm+' : '+Object.keys(T).sort().map(k=>k+' '+T[k][1]+' morts / '+T[k][0]+' sorties').join(' ; '));
    const b=T.borde||[0,0],o=T.ouvert||[0,0];P('    jugement (borde contre ouvert) : '+juger(b[1],b[0],o[1],o[0]));}}
P('');P('== chaque sortie voulue mortelle ==');for(const s of S.filter(s=>s.mort))P('  '+(s.neuve?'NEUVE ':'avant ')+s.course+' t0 '+s.t0+' '+(s.dessous?'dessous':'raccourci')+' '+s.facon+' '+s.classe+(s.decor?' ('+s.decor+')':'')+' -> '+s.cause);
fs.writeFileSync(path.join(ICI,'sorties','ville.json'),JSON.stringify({sorties:S},null,1));
fs.writeFileSync(path.join(ICI,'sorties','ville.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
