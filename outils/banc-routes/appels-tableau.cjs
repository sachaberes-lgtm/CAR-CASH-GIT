/* lit un dossier de cout-scene-ab.cjs lancé avec page=appels-groupes-page.js : par passage, appels et triangles PAR IMAGE en course (moyenne sur les graines),
   et les groupes qui diffèrent le plus entre référence et branche. node appels-tableau.cjs <dossier> [groupes=8] */
const fs=require('fs'),path=require('path');const D=process.argv[2],NG=+((process.argv.find(x=>x.startsWith('groupes='))||'groupes=8').slice(8));
const lit=function(dir){if(!fs.existsSync(dir))return [];const f=fs.readdirSync(dir).find(x=>/^gen-.*\.json$/.test(x));if(!f)return [];const j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  return j.map(function(r){let p=r.perso;try{p=JSON.parse(p);}catch(e){return null;}return p&&p.groupes?p:null;}).filter(Boolean);};
const moy=function(A,f){return A.length?A.reduce(function(a,x){return a+f(x);},0)/A.length:NaN;};
const passages=new Set(fs.readdirSync(D).filter(n=>/^(ref|br)-/.test(n)).map(n=>n.replace(/^(ref|br)-/,'')));
console.log('| passage | n | images | appels / image (réf → branche) | triangles / image |');console.log('|---|---|---|---|---|');
for(const p of passages){const A=lit(path.join(D,'ref-'+p)),B=lit(path.join(D,'br-'+p));
  console.log('| '+p+' | '+A.length+'/'+B.length+' | '+Math.round(moy(A,x=>x.images))+' → '+Math.round(moy(B,x=>x.images))+' | '+moy(A,x=>x.appelsParImage).toFixed(1)+' → '+moy(B,x=>x.appelsParImage).toFixed(1)+' | '+Math.round(moy(A,x=>x.triParImage)/1000)+'k → '+Math.round(moy(B,x=>x.triParImage)/1000)+'k |');
  const G={};for(const [k,X] of [['a',A],['b',B]])for(const x of X)for(const g of x.groupes){const e=G[g[0]]||(G[g[0]]={a:0,b:0,ta:0,tb:0});e[k]+=g[1]/X.length;e['t'+k]+=g[2]/X.length;}
  const L=Object.keys(G).map(k=>[k,G[k]]).sort((x,y)=>Math.abs(y[1].tb-y[1].ta)-Math.abs(x[1].tb-x[1].ta)).slice(0,NG);
  for(const [k,e] of L)console.log('      '+k.slice(0,60).padEnd(60)+' appels '+e.a.toFixed(1)+' → '+e.b.toFixed(1)+' · tri '+Math.round(e.ta)+' → '+Math.round(e.tb));}
