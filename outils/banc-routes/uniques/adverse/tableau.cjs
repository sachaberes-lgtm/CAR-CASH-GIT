/* CONTRÔLE ADVERSE — attaque 4 (la répartition module × palier) et où tombent les pires points de jouabilité (dans quel module ?)
     node tableau.cjs carte=jade|espace */
const fs=require('fs'),path=require('path'),L=require('./lib.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),PAL=[0,10,20,27],OUT=[];const say=s=>{OUT.push(s);console.log(s);};
const D=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'data',carte+'-apres-p'+p+'.json'))).routes;
const R={};for(const p of PAL)R[p]=D(p);
const PETITS=carte==='jade'?['porte','arche','gorge','passerelles','bosse','toboggan','epingle','ile','remontee']:['mur','esse','marche','bosse','quart','chicane','plongeon','lacet'];
const tous=new Set();for(const p of PAL)for(const r of R[p])for(const m of r.suite)tous.add(m);
say('[4] '+carte.toUpperCase()+' — présence de chaque module (% des 200 routes) par palier :');say('  module          '+PAL.map(p=>('p'+p).padStart(5)).join('')+'   (P = petit module)');
const rows=[...tous].map(m=>[m,PAL.map(p=>Math.round(100*R[p].filter(r=>r.suite.includes(m)).length/R[p].length))]).sort((a,b)=>b[1][0]-a[1][0]);
for(const [m,v] of rows)say('  '+(m+(PETITS.includes(m)?' P':'')).padEnd(16)+v.map(x=>String(x).padStart(5)).join(''));
for(const p of PAL){const n=R[p].reduce((s,r)=>s+r.suite.length,0),np=R[p].reduce((s,r)=>s+r.suite.filter(m=>PETITS.includes(m)).length,0);
  const prem=R[p].filter(r=>PETITS.includes(r.suite[0])).length;say('  p'+p+' : petits modules = '+Math.round(100*np/n)+' % des modules joués ; 1er module petit : '+Math.round(100*prem/R[p].length)+' % ; modules/route '+(n/R[p].length).toFixed(1)+' ; sous 5 % : '+rows.filter(x=>x[1][PAL.indexOf(p)]<5).map(x=>x[0]+' '+x[1][PAL.indexOf(p)]).join(', '));}
/* où tombent le rayon vertical min et le roulis max */
const ou=(r,s)=>{for(const m of r.mods)if(s>=m.s-50&&s<=m.s1+50)return m.nom;return s<(r.mods[0]?r.mods[0].s:0)?'ouverture':'liaison';};
for(const p of PAL){const rp=L.rayonPalier(p),bad=R[p].filter(r=>r.sec.rVertMin<rp),hv={},hr={};
  for(const r of bad){const k=ou(r,r.sec.rVertOu)+':'+r.sec.rVertSens;hv[k]=(hv[k]|0)+1;}
  for(const r of R[p].filter(r=>r.sec.roulisMax>55)){const k=ou(r,r.sec.roulisOu);hr[k]=(hr[k]|0)+1;}
  say('  p'+p+' rayon vertical < rayonPalier ('+Math.round(rp)+' m) : '+bad.length+' routes — où : '+Object.entries(hv).sort((a,b)=>b[1]-a[1]).map(x=>x[0]+' '+x[1]).join(', '));
  say('  p'+p+' roulis > 55 °/s : '+R[p].filter(r=>r.sec.roulisMax>55).length+' routes — où : '+Object.entries(hr).sort((a,b)=>b[1]-a[1]).map(x=>x[0]+' '+x[1]).join(', '));
  const a=R[p].filter(r=>r.reprises>0),b=R[p].filter(r=>!r.reprises),m=(A,k)=>A.length?(A.reduce((s,r)=>s+r.sec[k],0)/A.length).toFixed(1):'—';
  if(a.length)say('  p'+p+' routes refaites ('+a.length+') vs non refaites : roulis max moy '+m(a,'roulisMax')+' / '+m(b,'roulisMax')+' · envers moy '+m(a,'envers')+' / '+m(b,'envers')+' · rayon vertical moy '+m(a,'rVertMin')+' / '+m(b,'rVertMin')+' · modules '+(a.reduce((s,r)=>s+r.suite.length,0)/a.length).toFixed(1)+' / '+(b.reduce((s,r)=>s+r.suite.length,0)/b.length).toFixed(1));}
fs.writeFileSync(path.join(__dirname,'resultats-tableau-'+carte+'.txt'),OUT.join('\n')+'\n');
