/* Contrôle de portée : les fonctions déclarées DANS UN BLOC (if/for/{}) du jeu en mode strict ne se voient pas d'ailleurs.
   node portee.cjs <index.html> [nom…] → liste des déclarations en bloc ; avec des noms : dit où chacun est déclaré. */
const fs=require('fs'),path=require('path');
const acorn=require(path.join(__dirname,'../outils/vendor/acorn.js'));
const h=fs.readFileSync(process.argv[2],'utf8'),noms=process.argv.slice(3);
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,n=0,enBloc=[];
while((m=re.exec(h))){n++;let ast;try{ast=acorn.parse(m[1],{ecmaVersion:2022,sourceType:'script'});}catch(e){continue;}
  (function marche(nd,pile){ if(!nd||typeof nd.type!=='string')return;
    if(nd.type==='FunctionDeclaration'){const p=pile[pile.length-1],pp=pile[pile.length-2];
      const top=p&&(p.type==='Program'||(p.type==='BlockStatement'&&pp&&/Function/.test(pp.type)));
      if(noms.includes(nd.id.name))console.log(nd.id.name,'fonctions englobantes: '+pile.filter(x=>/Function/.test(x.type)).length,top?'déclarée au niveau d\'une fonction (visible dans toute la fonction)':'DÉCLARÉE DANS UN BLOC (portée de bloc)');
      if(!top)enBloc.push(nd.id.name);}
    for(const k in nd){const v=nd[k];if(k==='loc')continue;if(Array.isArray(v))v.forEach(c=>c&&typeof c.type==='string'&&marche(c,pile.concat(nd)));else if(v&&typeof v.type==='string')marche(v,pile.concat(nd));}
  })(ast,[]);}
if(!noms.length)console.log('scripts',n,'— fonctions déclarées en bloc:',enBloc.length,enBloc.slice(0,40).join(' '));
