// syntaxe.cjs fichier.html : compile chaque <script> en ligne (sans l'exécuter) — une double déclaration, une parenthèse en trop = erreur
const fs=require('fs'),vm=require('vm');const h=fs.readFileSync(process.argv[2],'utf8');let n=0,err=0;
for(const m of h.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)){const at=m[1]||'';if(/\bsrc=/.test(at)||/type=["'](?!text\/javascript|module)/.test(at))continue;n++;
  try{new vm.Script(m[2],{filename:'script'+n});}catch(e){err++;const l=h.slice(0,m.index).split('\n').length;console.log('✘ script '+n+' (ligne '+l+' de la page) : '+e.message);}}
console.log(err?'✘ '+err+' erreur(s) sur '+n+' scripts':'✔ '+n+' scripts compilent');process.exit(err?1:0);
