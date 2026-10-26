/* Balayage (24/10, relecture) : un `//` au milieu d'une ligne qui AVALE du code — la fin de ligne après le `//` ressemble à des
   instructions JS terminées par `;`. Ignore les `//` dans les chaînes et dans les commentaires en bloc.
   node commentaire-avaleur.cjs <dossier code/>   → fichier:ligne  » la partie avalée. Trouvé le 24/10 : boutique-scene-1.js:122
   (souffle de la boutique 3D muet + nappe jamais débranchée), richesse-2.js:334 (sans effet), simpson.js:212 (lunette arrière absente). */
const fs=require('fs'),path=require('path');const R=process.argv[2]||'code';
function* F(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())yield* F(p);else if(/\.js$/.test(f))yield p;}}
const un=/(?:^|[\s)\]>»])((?:[A-Za-z_$][\w$]*)(?:\.[\w$]+|\[[^\]]*\])*\s*(?:\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|[+\-*]?=\s*[^;=\s][^;]*)\s*;\s*)+$/;
let n=0;for(const f of F(R)){const L=fs.readFileSync(f,'utf8').split('\n');let bloc=false;
 L.forEach((l,i)=>{let q=null,esc=false;for(let k=0;k<l.length-1;k++){const c=l[k];if(bloc){if(c==='*'&&l[k+1]==='/'){bloc=false;k++;}continue;}if(esc){esc=false;continue;}if(c==='\\'){esc=true;continue;}
  if(q){if(c===q)q=null;continue;}if(c==='"'||c==="'"||c==='`'){q=c;continue;}
  if(c==='/'&&l[k+1]==='*'){bloc=true;k++;continue;}
  if(c==='/'&&l[k+1]==='/'&&l[k-1]!==':'){const av=l.slice(0,k).trim(),reste=l.slice(k+2);const m=reste.match(un);
    if(av&&m&&/[=(]/.test(m[1])&&!/^\s*(voir|cf|ex|soit|donc|puis|et|ou|le|la|les|un|une)\b/i.test(m[1])){console.log(path.relative(R,f)+':'+(i+1)+'  »'+m[1].trim().slice(0,140));n++;}break;}}});}
console.log('total',n);
