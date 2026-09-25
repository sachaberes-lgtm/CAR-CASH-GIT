/* SYNCHRO DES DEUX ÉDITIONS DE CASH CAR — `node synchro-versions.js` depuis la racine du dépôt.
   « VERSION PRINCIPALE » (la version mobile) est la SEULE qu'on modifie. « AUTRE VERSION » (la version PC)
   en est une copie conforme, à UNE ligne près : `const EDITION='mobile'` devient `const EDITION='pc'`.
   Le script recopie tout (jeu, sons, polices, vendor) sauf le README propre à chaque dossier, puis
   vérifie que la bascule a bien eu lieu — une copie qui oublierait la ligne donnerait deux versions mobiles. */
const fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'VERSION PRINCIPALE'),DST=path.join(__dirname,'AUTRE VERSION');
const GARDER=new Set(['README.md']); // chaque dossier garde le sien
function copie(de,vers){
  fs.mkdirSync(vers,{recursive:true});
  for(const n of fs.readdirSync(de)){
    const a=path.join(de,n),b=path.join(vers,n);
    if(fs.statSync(a).isDirectory())copie(a,b);
    else if(!(de===SRC&&GARDER.has(n)))fs.copyFileSync(a,b);
  }
}
copie(SRC,DST);
const f=path.join(DST,'index.html'),s=fs.readFileSync(f,'utf8');
const n=(s.match(/const EDITION='mobile';/g)||[]).length;
if(n!==1){console.error('✗ ligne EDITION introuvable ('+n+' occurrence) — rien n\'a été basculé');process.exit(1);}
fs.writeFileSync(f,s.replace("const EDITION='mobile';","const EDITION='pc';"));
console.log('✓ AUTRE VERSION régénérée depuis VERSION PRINCIPALE (EDITION=pc)');
