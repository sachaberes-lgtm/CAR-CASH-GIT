/* COMPARE-GROUPES (2026-11-14, pro-ville) : lit deux dossiers de banc.cjs gen lancés avec --auditfile=audit-triangles-groupes.js
   (avant / après, mêmes graines) et rend, graine par graine, les triangles de scène, la longueur de route, les triangles par km,
   puis la somme des groupes (top 14 de chaque graine) avant → après.
   node outils/banc-maps/compare-groupes.cjs <dossier-avant> <dossier-apres> */
const fs=require('fs'),path=require('path');
const lit=function(d){const f=fs.readdirSync(d).find(function(x){return x.endsWith('.json');});return JSON.parse(fs.readFileSync(path.join(d,f),'utf8'));};
const A=lit(process.argv[2]),B=lit(process.argv[3]);
const ligne=function(r){const p=r.perso||{};return {g:r.graine,tri:p.sceneTri||0,geo:p.geo||0,L:r.L||0,top:p.top||[]};};
let sa=0,sb=0,la=0,lb=0,ga=0,gb=0,n=0;const GA={},GB={};
const ajoute=function(G,top){for(const t of top){const m=/^(.*)=(\d+)k$/.exec(t);if(m){const k=m[1].replace(/\|inst$/,'');G[k]=(G[k]||0)+(+m[2]);}}};
console.log('graine  tri avant → après (k)   L avant → après (m)   k/km avant → après   géo avant → après');
for(const ra of A){const rb=B.find(function(x){return x.graine===ra.graine;});if(!rb)continue;const a=ligne(ra),b=ligne(rb);if(!a.tri||!b.tri)continue;
  n++;sa+=a.tri;sb+=b.tri;la+=a.L;lb+=b.L;ga+=a.geo;gb+=b.geo;ajoute(GA,a.top);ajoute(GB,b.top);
  console.log(String(a.g).padStart(6),(Math.round(a.tri/1e3)+' → '+Math.round(b.tri/1e3)).padStart(20),(Math.round(a.L)+' → '+Math.round(b.L)).padStart(20),
    (Math.round(a.tri/a.L)+' → '+Math.round(b.tri/b.L)).padStart(20),(a.geo+' → '+b.geo).padStart(16));}
const pc=function(x,y){return (y>=x?'+':'')+((y/x-1)*100).toFixed(1)+' %';};
console.log('MOYENNE (n='+n+') tri',Math.round(sa/n/1e3),'→',Math.round(sb/n/1e3),'k ('+pc(sa,sb)+') · L',Math.round(la/n),'→',Math.round(lb/n),'m ('+pc(la,lb)+') · k/km',
  Math.round(sa/la),'→',Math.round(sb/lb),'('+pc(sa/la,sb/lb)+') · géo',(ga/n).toFixed(1),'→',(gb/n).toFixed(1));
const cles=Array.from(new Set(Object.keys(GA).concat(Object.keys(GB)))).sort(function(x,y){return Math.abs((GB[y]||0)-(GA[y]||0))-Math.abs((GB[x]||0)-(GA[x]||0));});
console.log('GROUPES (somme des top 14, k, écart le plus grand d\'abord) :');
for(const k of cles.slice(0,16))console.log('  '+k.padEnd(60),String(GA[k]||0).padStart(6),'→',String(GB[k]||0).padStart(6),'  ',((GB[k]||0)-(GA[k]||0)>=0?'+':'')+((GB[k]||0)-(GA[k]||0)));
