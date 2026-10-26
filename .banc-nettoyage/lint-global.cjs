/* ESLint (règles à fort signal) sur TOUT le script du jeu dans index.html ; chaque message ramené à son morceau de code/ (ORDRE.txt).
   node .banc-sortie/lint-global.cjs  (depuis la racine d'un worktree) */
const fs=require('fs');const {Linter}=require('/Users/sachaberes/.npm/_npx/6dd5ed8b79486459/node_modules/eslint');
const html=fs.readFileSync('VERSION PRINCIPALE/index.html','utf8');
/* carte ligne d'index.html → morceau (assemblage = concaténation brute dans l'ordre d'ORDRE.txt) */
const ord=fs.readFileSync('code/ORDRE.txt','utf8').split('\n').map(l=>l.trim().split(/\s+/)[0]).filter(p=>p&&!p.startsWith('#')&&fs.existsSync('code/'+p));
let lig=1;const carte=[];for(const p of ord){const t=fs.readFileSync('code/'+p,'utf8');carte.push([lig,p]);lig+=t.split('\n').length-1;}
const ou=l=>{let r=carte[0];for(const c of carte){if(c[0]<=l)r=c;else break;}return r[1]+':'+(l-r[0]+1);};
const iB=html.indexOf('function buildCar(spec){');const a=html.lastIndexOf('<script>',iB),b=html.indexOf('</script>',iB);
const base=html.slice(0,a+8).split('\n').length-1;const js=html.slice(a+8,b);
const rules={'no-undef':2,'no-redeclare':2,'no-const-assign':2,'no-dupe-keys':2,'no-unreachable':2,'no-self-assign':2,'no-cond-assign':2,'no-dupe-else-if':2,
 'use-isnan':2,'valid-typeof':2,'no-func-assign':2,'no-self-compare':2,'no-fallthrough':2,'no-dupe-args':2,'no-unsafe-negation':2,'no-loss-of-precision':2,
 'no-compare-neg-zero':2,'no-sparse-arrays':2,'no-constant-condition':[2,{checkLoops:false}],'no-import-assign':2,'getter-return':2,'no-setter-return':2,'for-direction':2,'no-unsafe-finally':2};
const msgs=new Linter().verify(js,{parserOptions:{ecmaVersion:2022,sourceType:'script'},env:{browser:true,es2021:true},globals:{THREE:'readonly',Capacitor:'readonly'},rules});
const par={};for(const m of msgs){(par[m.ruleId]=par[m.ruleId]||[]).push(m);}
for(const k in par){console.log('== '+k+' : '+par[k].length);for(const m of par[k].slice(0,40))console.log('   '+ou(m.line+base)+'  '+m.message.slice(0,110));}
/* --- filtre des no-undef : les noms posés sur window (window.X=), ceux des scripts externes chargés par la page, les globales du navigateur/Capacitor --- */
{const ext=new Set();const vp='VERSION PRINCIPALE/';
 for(const m of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)){const f=vp+m[1].split('?')[0];if(!fs.existsSync(f))continue;const t=fs.readFileSync(f,'utf8');
   for(const d of t.matchAll(/(?:^|[;{}\s])(?:function\s+([A-Za-z_$][\w$]*)|(?:var|let|const)\s+([A-Za-z_$][\w$]*)|window\.([A-Za-z_$][\w$]*)\s*=)/g))ext.add(d[1]||d[2]||d[3]);}
 for(const d of html.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g))ext.add(d[1]);
 const vrais=(par['no-undef']||[]).filter(m=>{const n=(m.message.match(/'([^']+)'/)||[])[1];return !ext.has(n);});
 const noms={};for(const m of vrais){const n=(m.message.match(/'([^']+)'/)||[])[1];(noms[n]=noms[n]||[]).push(ou(m.line+base));}
 console.log('\n== no-undef APRÈS FILTRE : '+vrais.length+' usages, '+Object.keys(noms).length+' noms');for(const n in noms)console.log('   '+n+' ×'+noms[n].length+'  '+noms[n].slice(0,3).join(' '));}
