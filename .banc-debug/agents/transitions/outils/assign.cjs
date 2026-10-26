// liste les identifiants NUS assignés dans le corps d'une fonction (approx.) : node assign.cjs ref.html nomFn...
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8');
function corps(nom){const re=new RegExp('function\\*?\\s+'+nom+'\\s*\\(');const m=re.exec(src);if(!m)return null;let i=src.indexOf('{',m.index+m[0].length-1);
 // sauter la liste des paramètres
 let p=src.indexOf(')',m.index);const params=src.slice(m.index+m[0].length,p);i=src.indexOf('{',p);let d=0,j=i,str=null;
 for(;j<src.length;j++){const c=src[j];if(str){if(c==='\\'){j++;continue;}if(c===str)str=null;continue;}
  if(c==='/'&&src[j+1]==='*'){j=src.indexOf('*/',j+2)+1;continue;}if(c==='/'&&src[j+1]==='/'){j=src.indexOf('\n',j);continue;}
  if(c==='"'||c==="'"||c==='`'){str=c;continue;}if(c==='{')d++;else if(c==='}'){d--;if(d===0)break;}}
 return {params,body:src.slice(i,j+1)};}
for(const nom of process.argv.slice(3)){const r=corps(nom);if(!r){console.log(nom,': introuvable');continue;}
 let b=r.body.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g,'""');
 const loc=new Set(r.params.split(/[,=\s(){}\[\].]+/).filter(Boolean));
 for(const m of b.matchAll(/\b(?:const|let|var)\s+([^;]*?)(?:;|$)/gm)){for(const d of m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?==|,|$|\s+of\b|\s+in\b)/g))loc.add(d[1]);}
 for(const m of b.matchAll(/\bfunction\s*\*?\s*([\w$]*)\s*\(([^)]*)\)/g)){if(m[1])loc.add(m[1]);for(const q of m[2].split(/[,\s=]+/))if(q)loc.add(q);}
 for(const m of b.matchAll(/\b(?:const|let|var)\s+\[([^\]]*)\]/g))for(const q of m[1].split(/[,\s]+/))if(q)loc.add(q);
 for(const m of b.matchAll(/\b(?:const|let|var)\s+\{([^}]*)\}/g))for(const q of m[1].split(/[,\s:]+/))if(q)loc.add(q);
 const out=new Map();
 for(const m of b.matchAll(/(^|[^\w$.'"])([A-Za-z_$][\w$]*)((?:\.[A-Za-z_$][\w$]*|\[[^\]]{0,30}\])*)\s*(=(?![=>])|\+=|-=|\*=|\/=|\|=|&=|\+\+|--)/g)){
   const id=m[2];if(loc.has(id)||/^(if|return|else|for|while|case)$/.test(id))continue;const k=id+(m[3]?m[3].replace(/\[[^\]]*\]/g,'[]'):'');out.set(k,(out.get(k)||0)+1);}
 // méthodes mutantes
 for(const m of b.matchAll(/(^|[^\w$.])([A-Za-z_$][\w$]*)((?:\.[A-Za-z_$][\w$]*)*)\.(push|splice|length\s*=|set|copy|add)\b/g)){const id=m[2];if(loc.has(id))continue;const k=id+m[3]+'.'+m[4];out.set(k,(out.get(k)||0)+1);}
 console.log('==',nom,':',[...out.keys()].sort().join(' '));}
