/* la route dépend-elle du palier ? pour chaque map et graine : la suite de figures/marques (types) à p0/p10/p20, et le cap du premier virage ; compte les graines où la suite est identique */
const fs=require('fs'),path=require('path');const dir=process.argv[2];
const cartes=[...new Set(fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>f.split('-')[0]))];
for(const c of cartes){let mêmeSuite=0,n=0,mêmeSens=0,ex=[];
 for(let g=1;g<=60;g++){const o=[0,10,20].map(p=>{const f=path.join(dir,`${c}-p${p}-g${g}.json`);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;});if(o.some(x=>!x||x.erreur))continue;n++;
  const suite=x=>x.marks.map(m=>m.fig||'m').join(',');const s=o.map(suite);if(s[0]===s[1]&&s[1]===s[2])mêmeSuite++;
  const sens=x=>{const C=x.ctrl0;let a=0;for(let i=2;i<Math.min(C.length,40);i++){const h1=Math.atan2(C[i-1][0]-C[i-2][0],C[i-1][2]-C[i-2][2]),h2=Math.atan2(C[i][0]-C[i-1][0],C[i][2]-C[i-1][2]);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;a+=d;}return Math.sign(a);};
  if(sens(o[0])===sens(o[1])&&sens(o[1])===sens(o[2]))mêmeSens++;
  if(g<=2)ex.push('g'+g+' '+s.map((x,i)=>'p'+[0,10,20][i]+':'+x.slice(0,50)).join(' | '));}
 console.log(c.padEnd(8),'graines',n,'suite de marques identique aux 3 paliers',mêmeSuite,'sens du 1er virage identique',mêmeSens);if(process.argv[3])console.log('   '+ex.join('\n   '));}
