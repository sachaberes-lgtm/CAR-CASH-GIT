#!/usr/bin/env node
/* ===== LES SORTIES DU DESSOUS : CE QUE PROMETTAIT LE RAYON « vers la route » DU COTE CHOISI A L'ENGAGEMENT (28/11/2026, le concepteur libre) =====
   Lecture seule (../../sortie-preparee/sorties). AUCUNE course. Doublons « libre » retires. usage : node dessous-promesse.js -> dessous-promesse.txt */
'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib');
const S=path.join(__dirname,'..','..','sortie-preparee','sorties');
const DOUBLONS={'libre-3970400':1,'libre-3970585':1,'libre-3970659':1},DEC={canyon:1,grotte:1,jade:1,ville:1};
const D=JSON.parse(fs.readFileSync(path.join(S,'decollages.json'),'utf8')).decollages.filter(x=>x.voulu&&x.raccourci&&x.raccourci.d&&!DOUBLONS[x.course]);
const L=[],T={},V9={};
for(const x of D){
  const V=z.gunzipSync(fs.readFileSync(path.join(S,'lignes',x.course+'.jsonl.gz'))).toString().split('\n').filter(Boolean).map(JSON.parse).filter(o=>o.mo);
  const R=x.raccourci,k=R.c>0?'Sg':'Sd',k2=R.c>0?'Sd':'Sg',v0=V.find(o=>Math.abs(o.t-R.t0)<.026);
  const f=X=>X&&X.R?X.R.map(r=>r.m+':'+r.i+(r.i==='pose'?(r.d?'-DESSOUS':'-dessus')+(r.p?'':'-travers')+' axe '+r.a+' dans '+r.t+' s':'')+(r.c?' ('+r.c+')':'')).join(' ; '):'-';
  const vr=v0&&v0[k]&&v0[k].R?v0[k].R.find(r=>r.m==='versRoute'):null;
  const cl=vr&&vr.i==='pose'?(vr.d?'pose dessous':'pose dessus')+(vr.p?'':' de travers'):vr?vr.i:'pas de rayon';
  const dec=DEC[x.carte]?(x.carte==='ville'?'ville':'autre decor'):'sans decor',kk=dec+' | '+cl;
  T[kk]=T[kk]||[0,0];T[kk][0]++;if(x.issue.k==='mort')T[kk][1]++;
  const kv=dec+' | vitesse '+(x.vitesse>=100?'>= 100 m/s':'< 100 m/s');V9[kv]=V9[kv]||[0,0];V9[kv][0]++;if(x.issue.k==='mort')V9[kv][1]++;
  if(x.carte==='ville'||x.issue.k==='mort')L.push(['  '+x.course,'t0 '+R.t0,'v '+x.vitesse,'cote choisi : '+f(v0&&v0[k]),'| autre cote : '+f(v0&&v0[k2]),'| '+x.issue.k+' '+(x.issue.cause||'')].join(' '));}
const out=['sorties du dessous distinctes : '+D.length,'promesse du rayon versRoute du cote choisi, a l\'engagement : [vols, morts]'];
for(const k of Object.keys(T).sort())out.push('  '+k+' : '+T[k][0]+' vols, '+T[k][1]+' morts');
out.push('par vitesse au decollage :');for(const k of Object.keys(V9).sort())out.push('  '+k+' : '+V9[k][0]+' vols, '+V9[k][1]+' morts');
out.push('les sorties du dessous de ville, et les mortelles :');
fs.writeFileSync(path.join(__dirname,'dessous-promesse.txt'),out.concat(L).join('\n')+'\n');console.log(out.concat(L).join('\n'));
