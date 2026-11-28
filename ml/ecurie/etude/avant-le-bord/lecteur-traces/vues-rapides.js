#!/usr/bin/env node
/* ===== AVANT LE BORD : LA PART DU TEMPS AU SOL AU-DESSUS DE 143 m/s (28/11/2026, le lecteur des traces) =====
   Compte les vues au sol sur les maps a decor (canyon, grotte, jade, ville) et celles ou vue.vitesse > 143 m/s, sans les trois courses « libre »
   qui rejouent une course tenue (relecture.js). Sans course. usage : node vues-rapides.js */
'use strict';
const z=require('zlib'),fs=require('fs'),path=require('path');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes'),DECOR={canyon:1,grotte:1,jade:1,ville:1},SEUIL=143;
const dup=['libre-3970400','libre-3970585','libre-3970659'];const o={};let n=0,h=0;
for(const f of fs.readdirSync(LIG).filter(x=>x.endsWith('.jsonl.gz'))){if(dup.includes(f.replace('.jsonl.gz','')))continue;
  const L=z.gunzipSync(fs.readFileSync(path.join(LIG,f))).toString().trim().split('\n').map(JSON.parse);
  for(const v of L.slice(1)){if(v.mo!=='s'||!DECOR[v.c])continue;const k=v.c;o[k]=o[k]||{vues:0,rapides:0};o[k].vues++;n++;if(v.v>SEUIL){o[k].rapides++;h++;}}}
const txt='vues au sol sur decor '+n+', au-dessus de '+SEUIL+' m/s '+h+' ('+Math.round(100*h/n)+' %) ; par carte '+JSON.stringify(o)+'\n';
fs.writeFileSync(path.join(__dirname,'sorties','vues-rapides.txt'),txt);process.stdout.write(txt);
