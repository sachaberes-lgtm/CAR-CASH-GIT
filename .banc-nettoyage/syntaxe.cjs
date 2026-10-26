const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2]||'VERSION PRINCIPALE/index.html','utf8');
let n=0,bad=0;const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m;
while((m=re.exec(h))){n++;try{new vm.Script(m[1]);}catch(e){bad++;console.log('script',n,'ERREUR',e.message);}}
console.log(n,'scripts inline,',bad,'en erreur');
