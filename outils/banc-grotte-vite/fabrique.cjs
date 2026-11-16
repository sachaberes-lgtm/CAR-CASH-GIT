/* Fabrique le code du travailleur à partir de la SOURCE courante (code/maps/grottes-1.js) : reprend le code capturé (captures/travailleur.js) et y remplace
   chaque fonction du creusement par sa version actuelle, aplatie comme grwPlat le fait dans le jeu. node fabrique.cjs [sortie.js] [--generateurs] */
const fs=require('fs'),path=require('path');const here=__dirname,racine=path.join(here,'../..');
const src=fs.readdirSync(path.join(racine,'code/maps')).filter(f=>/^grott/.test(f)).map(f=>fs.readFileSync(path.join(racine,'code/maps',f),'utf8')).join('\n');
const gen=process.argv.includes('--generateurs');const out=process.argv.slice(2).find(a=>a.endsWith('.js'))||path.join(here,'courant.js');
function extrait(s,nom){const re=new RegExp('^function\\*?\\s*'+nom+'\\(','m');const m=re.exec(s);if(!m)return null;let i=s.indexOf('{',m.index),d=0;
  for(;i<s.length;i++){const c=s[i];if(c==='/'&&s[i+1]==='*'){i=s.indexOf('*/',i+2)+1;continue;}if(c==='/'&&s[i+1]==='/'){i=s.indexOf('\n',i);continue;}
    if(c==='"'||c==="'"){const q=c;i++;while(s[i]!==q){if(s[i]==='\\')i++;i++;}continue;}if(c==='{')d++;else if(c==='}'){d--;if(d===0)return s.slice(m.index,i+1);}}return null;}
function plat(t){if(gen||t.indexOf('function*')!==0)return t;const u=t.replace(/^function\*\s*/,'function ').replace(/if\([^;{}]*?performance\.now\(\)>JF\.lim\)yield;/g,'');return /\byield\b/.test(u)?t:u;}
/* le code entier comme grwTravailleur le colle : sa déclaration `const code=…;` est évaluée ici avec les sources courantes */
const tw=fs.readFileSync(path.join(racine,'code/maps/grotte-travailleur.js'),'utf8');const a=tw.indexOf('const code="'),b=tw.indexOf('\n    const W=new Worker',a);if(a<0||b<0)throw new Error('déclaration du code introuvable');
const noms=['grtH3','grtN3','grtRoche','grtMonde','grtCh','grtNoyau','grtCreuse1','grtD','grtLit','grtMatieres','grtLum','grtTampons','grtR6','grtMailleNetsG'];
const GRW={platN:0},GRT_RANG=!process.env.SANS_RANG,GRT_BRUITM=!process.env.SANS_BRUIT;const fns=noms.map(nm=>{const t=extrait(src,nm);if(!t)throw new Error('introuvable '+nm);const u=plat(t);if(u!==t)GRW.platN++;return u;}).join('\n');
const GRT_ARETES=eval('('+/const GRT_ARETES=(\[[^;]*\]);/.exec(src)[1]+')');
const code=new Function('GRW','fns','GRT_ARETES','GRT_RANG','GRT_BRUITM',tw.slice(a,b)+'\nreturn code;')(GRW,fns,GRT_ARETES,GRT_RANG,GRT_BRUITM);
fs.writeFileSync(out,code);console.log('→',path.relative(process.cwd(),out));
