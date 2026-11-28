#!/usr/bin/env node
/* ===== LA PREUVE RELUE (28/11/2026, le relecteur adverse des mesures A et C) =====
   Lecture seule. AUCUNE course. Code a part de mesurer.js : il ne reprend ni sa liste de cles ni son verdict.
   1. Les 40 courses rejouees (../sorties/lignes) contre la mesure d'avant (../../../sortie-preparee/sorties/lignes, commitee en d30db9519) :
      TOUS les champs communs du resultat compact (hors temps de calcul et identite du texte du pilote), le journal des evenements (ev) compris ;
      puis les vues au sol et en vol, une par une, sur les champs que les deux diagnostics gardent (t, mode, carte, vitesse, lat, cap, nitro, palier, ordre).
   2. Les 4 courses --diag 0 (-ref) contre leurs jumelles --diag 1, sur tous les champs communs.
   3. Chaque .json contre l'en-tete de son .jsonl.gz.
   usage (racine du depot) : node ml/ecurie/etude/avant-le-bord/mesures/relecteur/preuve.js -> relecteur/sorties/preuve-relue.txt */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,NEUF=path.join(ICI,'..','sorties','lignes'),VIEUX=path.join(ICI,'..','..','..','sortie-preparee','sorties','lignes');
const OUT=path.join(ICI,'sorties');fs.mkdirSync(OUT,{recursive:true});
const HORS=new Set(['ms','msMur','cerveau_ms_moy','shaPilote','diag','node']);
const lj=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const lz=f=>zlib.gunzipSync(fs.readFileSync(f)).toString().trim().split('\n').map(x=>JSON.parse(x));
const L=[],P=s=>L.push(s);
function compare(a,b){const k=[...new Set(Object.keys(a).concat(Object.keys(b)))].filter(x=>!HORS.has(x));const diff=[],seul=[];
  for(const x of k){if(!(x in a)||!(x in b)){seul.push(x);continue;}if(JSON.stringify(a[x])!==JSON.stringify(b[x]))diff.push(x);}return {n:k.length,diff,seul};}
const G=i=>3963000+37*i;const noms=[];
for(const c of ['grotte','ville','jade','canyon',null])for(let i=200;i<208;i++)noms.push((c?c+'-tenue':'libre')+'-'+G(i));
let okR=0,okV=0,nV=0,dV=0;const seuls=new Set();
P('== 1. les 40 courses rejouees contre la mesure d\'avant ==');
for(const n of noms){
  const a=lj(path.join(VIEUX,n+'.json')),b=lj(path.join(NEUF,n+'.json'));const r=compare(a,b);r.seul.forEach(x=>seuls.add(x));
  if(!r.diff.length)okR++;else P('  DIFFERENT '+n+' : '+r.diff.join(','));
  /* les vues, une par une */
  const va=lz(path.join(VIEUX,n+'.jsonl.gz')).slice(1).filter(v=>v.mo),vb=lz(path.join(NEUF,n+'.jsonl.gz')).slice(1).filter(v=>v.mo);
  /* chaque champ que la vue d'AVANT garde (l'ancien diagnostic ne gardait pas le palier en vol : un champ absent n'est pas compare) */
  /* YR et ret : les trois lois « retour » que l'ancien hote demandait EN PLUS (le nouveau ne les demande plus) : hors comparaison */
  const pareil=(x,y)=>Object.keys(x).filter(k=>k!=='YR'&&k!=='ret').every(k=>JSON.stringify(x[k])===JSON.stringify(y[k]));
  let d=0;if(va.length!==vb.length)d=Math.abs(va.length-vb.length)+1;else for(let i=0;i<va.length;i++)if(!pareil(va[i],vb[i]))d++;
  nV+=vb.length;dV+=d;if(!d)okV++;else P('  VUES DIFFERENTES '+n+' : '+d+' sur '+vb.length+' (avant '+va.length+')');}
P('  resultat compact identique (tous champs communs, ev compris) : '+okR+' sur '+noms.length+' ; champs presents d\'un seul cote (ignores) : '+([...seuls].join(',')||'aucun'));
P('  vues identiques une par une (TOUS les champs que la vue d\'avant garde : t, vitesse, lat, cap, nitro, tenue, rayons du bord et des cotes, radar, ordre, diag du pilote...) : '+okV+' courses sur '+noms.length+' ; '+dV+' vues differentes sur '+nV);
P('');P('== 2. --diag 0 contre --diag 1 ==');
for(const [c,i] of [['canyon',203],['grotte',204],['ville',205],['jade',206]]){const n=c+'-tenue-'+G(i);
  const a=lj(path.join(NEUF,n+'-ref.json')),b=lj(path.join(NEUF,n+'.json'));const r=compare(a,b);
  P('  '+n+' : '+(r.diff.length?'DIFFERENT ('+r.diff.join(',')+')':'IDENTIQUE')+' sur '+r.n+' champs ; empreinte '+a.empreinte+' / '+b.empreinte+' ; textes du pilote '+a.shaPilote.slice(0,8)+' / '+b.shaPilote.slice(0,8));}
P('');P('== 3. chaque .json contre l\'en-tete de son .jsonl.gz ==');
let okH=0,nH=0;for(const f of fs.readdirSync(NEUF).filter(x=>/\.jsonl\.gz$/.test(x))){nH++;const h=lz(path.join(NEUF,f))[0],j=lj(path.join(NEUF,f.replace('.jsonl.gz','.json')));
  const r=compare(Object.assign({},h,{entete:undefined,touches:undefined}),j);if(!r.diff.length)okH++;else P('  DIFFERENT '+f+' : '+r.diff.join(','));}
P('  '+okH+' sur '+nH+' identiques');
fs.writeFileSync(path.join(OUT,'preuve-relue.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
