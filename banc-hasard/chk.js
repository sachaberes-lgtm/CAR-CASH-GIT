const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
let s=fs.readFileSync(process.argv[2],'utf8').replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0,ko=0;
while((m=re.exec(s))){const f=path.join(os.tmpdir(),'cc-chk-'+(i++)+'.js');fs.writeFileSync(f,m[1]);
  try{cp.execFileSync(process.execPath,['--check',f],{stdio:'pipe'});}catch(e){ko++;console.log('bloc '+i+' :\n'+e.stderr);}}
console.log(i+' blocs, '+ko+' en erreur');process.exit(ko?1:0);
