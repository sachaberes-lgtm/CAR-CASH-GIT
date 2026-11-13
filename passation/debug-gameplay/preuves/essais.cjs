/* statistique des essais du meilleur-de-N (rythme.notes de chaque JSON) : part d'essais rejetés (note > 50), routes dont tous les essais sont mauvais, note gardée */
const fs=require('fs'),path=require('path');const by={};
for(const dir of process.argv.slice(2))for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){const m=f.match(/^(\w+)-p(\d+)-g(\d+)\.json$/);const o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));if(o.erreur||!o.rythme)continue;
 const k=m[1]+' p'+m[2];const b=by[k]=by[k]||{n:0,ess:0,rej:0,toutMauvais:0,best:[],maxN:0,garde:[],aucunBon:[]};const N=o.rythme.notes||[];b.n++;b.ess+=N.length;b.rej+=N.filter(x=>x>50).length;b.maxN=Math.max(b.maxN,Math.max(...N));
 if(N.length&&Math.min(...N)>5){b.toutMauvais++;b.aucunBon.push('g'+m[3]+'='+Math.min(...N).toFixed(1));}}
for(const k of Object.keys(by)){const b=by[k];console.log(k.padEnd(12),'routes',b.n,'essais/route',(b.ess/b.n).toFixed(1),'essais rejetés(>50)',b.rej,'('+(100*b.rej/b.ess).toFixed(0)+'%)','note max d\'essai',b.maxN.toFixed(0),'routes dont le MEILLEUR essai > 5 :',b.toutMauvais,b.aucunBon.slice(0,6).join(' '));}
