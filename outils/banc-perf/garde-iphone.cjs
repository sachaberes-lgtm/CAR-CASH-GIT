#!/usr/bin/env node
/* (2026-11-07, passe 3, P7) LA GARDE DE L'IPHONE : lit la sortie BRUTE de boite-noire.sh (le vrai 13 Pro) et dit si les seuils tiennent. Sortie 0 = OK, 1 = un seuil franchi (la vague ne part pas sur main).
     sh outils/banc-perf/boite-noire.sh > brut.txt ; node outils/banc-perf/garde-iphone.cjs brut.txt [--depuis "07/11 10:00"] [--plantages N]
   Seuils : serpent 0 trou > 120 ms hors le trou initial (t ≤ 0,5 s) · fluide p50 ≤ 20 ms à 8 min (lignes ≥ 470 s) · mémoire ±5 % (textures, géométries, programmes) entre deux parties
   consécutives · 0 gel > 1 s · 0 plantage (--plantages N : nombre de JetsamEvent/rapports de l'app sur la période, relevé à la main dans systemCrashLogs ; absent = non vérifié, avertissement). */
const fs=require('fs');const a=process.argv.slice(2);const f=a.find(x=>!x.startsWith('--')&&fs.existsSync(x));
if(!f){console.error('usage : garde-iphone.cjs brut.txt [--depuis "jj/mm HH:MM"] [--plantages N]');process.exit(2);}
const opt=n=>{const i=a.indexOf(n);return i>=0?a[i+1]:null;};const depuis=opt('--depuis'),plant=opt('--plantages');
const cle=s=>{const m=/^(\d\d)\/(\d\d) (\d\d:\d\d:\d\d)/.exec(s);return m?m[2]+m[1]+m[3]:'';};
let L=fs.readFileSync(f,'utf8').split('\n').filter(l=>/^\d\d\/\d\d /.test(l));
if(depuis)L=L.filter(l=>cle(l)>=cle(depuis+':00'));
const ko=[],ok=[];const note=(b,m)=>(b?ok:ko).push(m);
// serpent
const trous=L.filter(l=>/ serpent \|/.test(l)).map(l=>{const t=/\| ([\d.]+) s : trou (\d+) ms/.exec(l);return t?{t:+t[1],ms:+t[2]}:null;}).filter(Boolean);
const gros=trous.filter(x=>x.ms>120&&x.t>0.5);
note(gros.length===0,'serpent : '+(gros.length?gros.length+' trou(s) > 120 ms hors le trou initial : '+gros.map(x=>x.ms+' ms @'+x.t+' s').join(', '):'0 trou > 120 ms hors le trou initial ('+trous.length+' relevé(s))'));
// fluide
const fl=L.filter(l=>/ fluide \|/.test(l)).map(l=>{const m=/\| ([\d.]+) s ·.*p50 ([\d.]+)/.exec(l);return m?{t:+m[1],p50:+m[2]}:null;}).filter(Boolean);
const tard=fl.filter(x=>x.t>=470);
if(!tard.length)ko.push('fluide : aucune ligne à ≥ 8 min (470 s) — partie trop courte, seuil NON vérifié');
else{const pire=Math.max(...tard.map(x=>x.p50));note(pire<=20,'fluide : p50 à 8 min = '+tard.map(x=>x.p50).join('/')+' ms (seuil ≤ 20)');}
// mémoire
const me=L.filter(l=>/ memoire \|/.test(l)).map(l=>{const m=/textures (\d+) géométries (\d+) programmes (\d+)/.exec(l);return m?{tex:+m[1],geo:+m[2],prog:+m[3]}:null;}).filter(Boolean);
if(me.length<2)ko.push('mémoire : moins de 2 parties relevées — seuil NON vérifié');
else{let bad=[];for(let i=1;i<me.length;i++)for(const k of['tex','geo','prog']){const d=Math.abs(me[i][k]-me[i-1][k])/Math.max(1,me[i-1][k])*100;if(d>5)bad.push(k+' '+me[i-1][k]+'→'+me[i][k]+' ('+d.toFixed(0)+' %)');}
  note(!bad.length,'mémoire : '+(bad.length?bad.join(' ; '):me.length+' parties à ±5 %'));}
// gels
const gels=L.filter(l=>/ gel \|/.test(l)).map(l=>{const m=/ gel \| ([\d.]+) s/.exec(l);return m?+m[1]:0;}).filter(s=>s>1);
note(gels.length===0,'gels > 1 s : '+(gels.length?gels.length+' ('+gels.join(', ')+' s)':'0'));
// plantages
if(plant==null)console.log('⚠ plantages : non vérifié (passer --plantages N après lecture de systemCrashLogs)');else note(+plant===0,'plantages : '+plant);
ok.forEach(m=>console.log('✔',m));ko.forEach(m=>console.log('✘',m));
console.log(ko.length?'✘ GARDE IPHONE : '+ko.length+' seuil(s) franchi(s) — la vague ne part pas':'✔ garde iPhone : tous les seuils tiennent');process.exit(ko.length?1:0);
