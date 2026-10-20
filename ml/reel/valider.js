#!/usr/bin/env node
/* ===== LE CHAMPION SUR DES PISTES JAMAIS VUES (2026-10-20) =====
   Les « records » d'un entrainement sont des meilleurs coups de la population sur la piste du jour. Ici : le cerveau tout seul,
   `--tmax` secondes (90 par defaut) sur `--n` graines que l'entrainement n'a pas utilisees. Rien n'est ecrit.
   usage : node valider.js [results/champion-reel-g1.json] [--n 6] [--tmax 90] */
const fs=require('fs'),path=require('path');
const f=process.argv[2]&&process.argv[2][0]!=='-'?process.argv[2]:path.join(__dirname,'results','champion-reel-g1.json');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?+process.argv[i+1]:d; };
const N=arg('n',6), TMAX=arg('tmax',90);
const {creer}=require('./jeu-reel'); const W=require('./worker'); /* worker.js exporte evaluer ; il n'ecoute que s'il est fork */
const champ=JSON.parse(fs.readFileSync(f,'utf8')); const w=Float64Array.from(champ.w);
const R=[]; for(let i=0;i<N;i++){ const r=W.evaluerSeul(w,900000+i*37,TMAX); R.push(r); console.log('piste',i,JSON.stringify({dist:Math.round(r.dist),mort:r.mort,t:+r.t.toFixed(1),vMax:Math.round(r.vMax),air_s:+r.air.toFixed(1),figures:r.tricks,braq_s:+r.braqParS.toFixed(2),nitro_appuis_s:+r.appuisNitroParS.toFixed(2)}).slice(0,200)); }
const m=g=>R.reduce((a,x)=>a+g(x),0)/R.length;
console.log('BILAN',N,'pistes x',TMAX,'s | survivent',R.filter(x=>!x.mort).length+'/'+N,'| distance moyenne',Math.round(m(x=>x.dist)),'m | vitesse max moy',Math.round(m(x=>x.vMax)),'| en l air',m(x=>x.air).toFixed(1),'s | figures',m(x=>x.tricks).toFixed(1),'| changements de volant /s',m(x=>x.braqParS).toFixed(2),'| appuis NITRO /s',m(x=>x.appuisNitroParS).toFixed(2));
process.exit(0);
