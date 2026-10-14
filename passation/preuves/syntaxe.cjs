// vérifie la syntaxe de chaque <script> inline de index.html (node --check sur chaque bloc ; commentaires HTML ignorés)
const fs=require('fs'),cp=require('child_process'),os=require('os'),path=require('path');
const f=process.argv[2];const h=fs.readFileSync(f,'utf8').replace(/<!--[\s\S]*?-->/g,'');
const re=/<script([^>]*)>([\s\S]*?)<\/script>/g;let m,i=0,bad=0;
while((m=re.exec(h))){i++;if(/\bsrc=/.test(m[1]))continue;const typ=(m[1].match(/type=["']?([^"' >]+)/)||[])[1]||'';
 if(typ&&!/javascript|module/.test(typ))continue;
 const tmp=path.join(os.tmpdir(),'cc-syn-'+process.pid+'-'+i+(typ==='module'?'.mjs':'.js'));fs.writeFileSync(tmp,m[2]);
 try{cp.execFileSync(process.execPath,['--check',tmp],{stdio:'pipe'});}catch(e){bad++;console.log('script #'+i,typ,String(e.stderr).split('\n').slice(0,5).join(' | ').slice(0,400));}
 fs.unlinkSync(tmp);}
console.log('scripts inline:',i,'— erreurs de syntaxe:',bad);process.exit(bad?1:0);
