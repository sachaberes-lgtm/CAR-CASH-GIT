const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2],'utf8');
const re=/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;let m,n=0,ko=0;
while((m=re.exec(h))){if(/type=["'](?!text\/javascript|module)/.test(m[1]))continue;n++;try{new vm.Script(m[2]);}catch(e){ko++;console.log('KO script',n,'ligne',h.slice(0,m.index).split('\n').length,e.message);}}
console.log(n,'scripts,',ko,'en erreur');
