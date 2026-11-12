// Résout chaque nom utilisé dans les lignes AJOUTÉES (git diff f0fb32e5..HEAD -- code/) dans le script assemblé :
// déclaration trouvée ? const réassignée ? déclaration let/const placée APRÈS l'usage dans la même portée d'exécution (zone morte possible) ?
const fs=require('fs'),cp=require('child_process');
const NM='/Users/sachaberes/.hermes/hermes-agent/node_modules/';
const acorn=require(NM+'acorn'),escope=require(NM+'eslint-scope');
const html=fs.readFileSync('VERSION PRINCIPALE/index.html','utf8');
let best='',re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g,m;while((m=re.exec(html)))if(m[1].length>best.length)best=m[1];
const ast=acorn.parse(best,{ecmaVersion:2022,ranges:true,locations:true});
const sm=escope.analyze(ast,{ecmaVersion:2022,sourceType:'script'});
const diff=cp.execSync('git diff -U0 f0fb32e5..HEAD -- code/',{maxBuffer:1e8}).toString();
const ranges=[];for(const l of diff.split('\n')){if(l[0]==='+'&&!l.startsWith('+++')){const t=l.slice(1).replace(/\r$/,'');if(t.trim().length<3)continue;const p=best.indexOf(t);if(p<0){console.log('ligne ajoutée introuvable :',t.slice(0,80));continue;}if(best.indexOf(t,p+1)>=0)console.log('(ligne ajoutée non unique)',t.slice(0,60));ranges.push([p,p+t.length]);}}
const inR=p=>ranges.some(([a,b])=>p>=a&&p<b);
const seen=new Map();
for(const sc of sm.scopes)for(const r of sc.references){const id=r.identifier;if(!inR(id.range[0]))continue;
  const key=id.name+'@'+id.loc.start.line;const v=r.resolved;let msg;
  if(!v){msg='GLOBAL (non déclaré dans le jeu)';}
  else{const d=v.defs[0];const kind=d.type==='Variable'?d.parent.kind:d.type;
    msg=kind+' déclaré ligne '+d.name.loc.start.line;
    if(kind==='const'&&r.isWrite()&&!(d.name===id))msg+=' !!! ÉCRITURE D\'UNE CONST';
    if((kind==='let'||kind==='const'||kind==='ClassName')&&d.name.range[0]>id.range[0]){
      // même fonction ?
      const fnOf=s=>{while(s&&s.type!=='function'&&s.type!=='global')s=s.upper;return s;};
      msg+=(fnOf(sc)===fnOf(v.scope)?' !!! DÉCLARÉ APRÈS DANS LA MÊME FONCTION (TDZ)':' (déclaré plus bas, usage dans une fonction appelée plus tard : vérifier le moment)');}
  }
  if(!seen.has(key))seen.set(key,msg);}
const out=[...seen].sort((a,b)=>a[1].includes('!!!')===b[1].includes('!!!')?0:a[1].includes('!!!')?-1:1);
for(const [k,v] of out)if(!/^(Variable|FunctionName|Parameter|ImplicitGlobal)/.test(v)||v.includes('!!!')||v.includes('GLOBAL')||v.includes('plus bas'))console.log(k.padEnd(28),v);
console.log('— ',seen.size,'noms résolus');
