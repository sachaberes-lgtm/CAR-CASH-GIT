// chk.cjs <index.html> : compile (vm.Script) chaque <script> en ligne — syntaxe ET doublons de const/let dans une même portée
const fs=require('fs'),vm=require('vm');
let s=fs.readFileSync(process.argv[2],'utf8').replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
const re=/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;let m,i=0,ko=0;
while((m=re.exec(s))){i++;if(/type=["'](?!text\/javascript|module)/.test(m[1]))continue;
  try{new vm.Script(m[2],{filename:'bloc'+i});}catch(e){ko++;console.log('bloc '+i+' : '+e.message+'\n'+(e.stack||'').split('\n').slice(0,2).join('\n'));}}
console.log(i+' blocs, '+ko+' en erreur');process.exit(ko?1:0);
