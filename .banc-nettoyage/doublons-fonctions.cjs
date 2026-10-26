/* Balayage (24/10, relecture) : une FONCTION déclarée deux fois dans la même portée du jeu — en JS c'est permis et la DERNIÈRE gagne
   en silence (contrairement à un `const` en double, qui empêche le démarrage). Trouvé le 24/10 : dnGeos2 (dunes-2.js / dunes-embellie.js).
   node doublons-fonctions.cjs <index.html> → chaque nom déclaré plusieurs fois dans une même portée, avec ses lignes. */
const fs=require('fs'),path=require('path');const acorn=require(path.join(__dirname,'../outils/vendor/acorn.js'));
const h=fs.readFileSync(process.argv[2],'utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,lig0=0;
while((m=re.exec(h))){const deb=h.slice(0,m.index+m[0].indexOf('>')+1).split('\n').length-1;let ast;try{ast=acorn.parse(m[1],{ecmaVersion:2022,locations:true});}catch(e){continue;}
  (function marche(nd){if(!nd||typeof nd.type!=='string')return;
    const corps=nd.type==='Program'?nd.body:(nd.type==='BlockStatement'?nd.body:null);
    if(corps){const vus={};for(const s of corps)if(s.type==='FunctionDeclaration'){(vus[s.id.name]=vus[s.id.name]||[]).push(s.loc.start.line+deb);}
      for(const k in vus)if(vus[k].length>1)console.log(k+' : déclarée '+vus[k].length+' fois, lignes de index.html '+vus[k].join(', '));}
    for(const k in nd){if(k==='loc')continue;const v=nd[k];if(Array.isArray(v))v.forEach(c=>c&&typeof c.type==='string'&&marche(c));else if(v&&typeof v.type==='string')marche(v);}
  })(ast);}
