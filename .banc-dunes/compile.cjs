const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2],'utf8');let i=0;
for(const m of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/\bsrc=/.test(m[1]))continue;i++;try{new vm.Script(m[2]);console.log(i,'ok',m[2].length,m[1].trim().slice(0,40));}catch(e){console.log(i,'ERREUR',e.message,m[1].trim().slice(0,40));}}
