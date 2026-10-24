// Preuve sans navigateur (flou-fond-safari) : Safari ne lit `backdrop-filter` que sous sa forme `-webkit-backdrop-filter` avant Safari 18
// (macOS / iOS 15 → 17). Une règle qui ne pose que la forme standard n'a AUCUN flou d'arrière-plan sous ces Safari. Scénario : sur un Mac
// (Safari 17), l'accueil et l'écran de fin (#overlay, `blur(9px)` voulu : « le jeu reste visible derrière, flou léger ») montrent la course
// nette derrière le texte. On lit le VRAI CSS de index.html (blocs <style>) : toute règle qui pose un backdrop-filter autre que `none` doit
// aussi poser `-webkit-backdrop-filter`. Usage : node preuve-flou-fond-safari.cjs "<index.html>"   Sort 0 si OK, 1 sinon.
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
let css='';html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi,function(_,c){css+=c+'\n';return _;});
css=css.replace(/\/\*[\s\S]*?\*\//g,'');const fautifs=[];let n=0;const re=/([^{}]*)\{([^{}]*)\}/g;let m;
while((m=re.exec(css))){const b=m[2];const u=/(^|[;\s])backdrop-filter\s*:\s*([^;!]*)/.exec(b);if(!u)continue;n++;
  if(u[2].trim()!=='none'&&!/-webkit-backdrop-filter\s*:/.test(b))fautifs.push(m[1].trim().replace(/\s+/g,' ').slice(-70)+' { backdrop-filter:'+u[2].trim()+' }');}
for(const f of fautifs)console.log('  sans -webkit- : '+f);
console.log(fautifs.length?'PREUVE KO — '+fautifs.length+' règle(s) sans flou d’arrière-plan sous Safari < 18':'PREUVE OK — les '+n+' règles à backdrop-filter ont leur forme -webkit- (Safari 15 → 17)');
process.exit(fautifs.length?1:0);
