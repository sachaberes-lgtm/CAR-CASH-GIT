#!/usr/bin/env node
// Vérifie la syntaxe JS du gros script de train.html (mode train inerte si pas ?train=1).
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const HTML=path.join(__dirname,'train.html');
const html=fs.readFileSync(HTML,'utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=blocks.find(b=>b.includes('survTick')&&b.includes('buildTrack'));
if(!code){ console.error('script principal introuvable'); process.exit(1); }
try{
  new vm.Script(code,{filename:'train.html'});
  console.log('OK syntaxe JS');
  process.exit(0);
}catch(e){
  console.error('ERREUR SYNTAXE:',e.message);
  console.error(e.stack);
  process.exit(1);
}
