// contrôle de syntaxe : chaque <script> sans src de VERSION PRINCIPALE/index.html passé à new Function
const fs=require('fs');const h=fs.readFileSync(__dirname+'/../../../VERSION PRINCIPALE/index.html','utf8');
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;let m,n=0,bad=0;
while((m=re.exec(h))){n++;try{new Function(m[1]);}catch(e){bad++;console.log('script n° '+n+' : '+e.message);}}
console.log(n+' scripts, '+bad+' en échec');
