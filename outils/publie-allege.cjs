#!/usr/bin/env node
/* LA COPIE ALLÉGÉE (2026-10-18, Sacha : « retirer les commentaires de la copie mise en ligne » + « les outils de test dbg… de la copie
   mise en ligne ») — appelée par vercel-build.sh sur .vercel-static/jouer, APRÈS le retrait des outils locaux et AVANT l'empreinte du jeu.
   LE SOURCE GARDE TOUT (les sessions lisent les commentaires) ; seule la copie publiée perd :
   1. LES COMMENTAIRES : JS des <script> en ligne d'index.html et des .js publiés (hors vendor/ et sons-banque.js), CSS des <style>,
      HTML <!-- -->. Le NOMBRE DE LIGNES EST GARDÉ (un commentaire sur plusieurs lignes laisse ses sauts de ligne) : les numéros de
      ligne des erreurs restent ceux du source. En CSS un commentaire collé entre deux sélecteurs ne vaut PAS une espace (`.a` + commentaire
      + `.b` = `.a.b`) : il en reste alors un vide ; en HTML il reste un `<!---->` vide (le DOM garde ses nœuds).
   2. LES CROCHETS DE TEST `window.dbgX=function…` (ou `=nom`) d'index.html que RIEN de publié ne nomme ailleurs (ni le jeu, ni le banc
      ?banc=1, ni une autre page) — calculé en point fixe : un crochet qui n'est nommé que par d'autres crochets retirés part aussi.
      Les bancs servent le source local : ils ne voient rien de tout ça.
   SÛRETÉ : un fichier n'est réécrit que si sa version allégée se relit avec acorn et donne EXACTEMENT les mêmes jetons que l'original
   (moins les crochets retirés, chacun remplacé par un `;`). Au moindre doute, il part tel quel. Ce script ne fait jamais échouer la
   publication (sortie 0 sauf dossier introuvable).
   Essai : node outils/publie-allege.cjs <dossier> --essai   (n'écrit rien, affiche les gains)
   Banc sur la copie allégée : --garde-dbg dbgState,dbgBoom (la fumée a besoin de ces deux crochets)
   acorn (MIT) est vendu dans outils/vendor/ : rien à installer sur Vercel. */
'use strict';
const fs=require('fs'),path=require('path');
const acorn=require('./vendor/acorn.js');
const DOS=process.argv[2],ESSAI=process.argv.includes('--essai');
if(!DOS||!fs.existsSync(path.join(DOS,'index.html'))){console.error('publie-allege : pas d\'index.html dans '+DOS);process.exit(2);}
const OPT={ecmaVersion:'latest',allowHashBang:true};
const FIN=new RegExp('\r\n|[\n\r'+String.fromCharCode(0x2028,0x2029)+']','g');
const SEP=String.fromCharCode(1);
const sauts=t=>(t.match(FIN)||[]).length;

function lireJS(src){let e0;for(const t of ['script','module']){const com=[];
  try{const ast=acorn.parse(src,Object.assign({sourceType:t,onComment:com},OPT));return {ast,com,type:t};}catch(e){e0=e0||e;}}throw e0;}
function jetons(src,type){const L=[];for(const t of acorn.tokenizer(src,Object.assign({sourceType:type},OPT))){
  const v=t.type.label==='regexp'?t.value.pattern+'/'+t.value.flags:(t.value===undefined?'':String(t.value));L.push({k:t.type.label+SEP+v,a:t.start});}return L;}

/* les crochets candidats : `window.dbgX = function|flèche|nom` en instruction seule */
function crochets(ast){const out=[];(function w(n){if(!n||typeof n.type!=='string')return;
  if(n.type==='ExpressionStatement'){const e=n.expression;
    if(e&&e.type==='AssignmentExpression'&&e.operator==='='&&e.left.type==='MemberExpression'&&!e.left.computed&&
       e.left.object.type==='Identifier'&&e.left.object.name==='window'&&/^dbg[A-Za-z0-9_$]*$/.test(e.left.property.name)&&
       /^(FunctionExpression|ArrowFunctionExpression|Identifier)$/.test(e.right.type))out.push({nom:e.left.property.name,a:n.start,b:n.end});}
  for(const k in n){if(k==='loc')continue;const v=n[k];if(Array.isArray(v))v.forEach(w);else if(v&&typeof v.type==='string')w(v);}})(ast);return out;}

/* réécrit un JS : commentaires hors des plages retirées + plages retirées → `;` et leurs sauts de ligne */
function reecrireJS(src,com,retire){const ed=[];
  for(const r of retire)ed.push({a:r.a,b:r.b,t:';'+'\n'.repeat(sauts(src.slice(r.a,r.b)))});
  for(const c of com){if(retire.some(r=>c.start>=r.a&&c.end<=r.b))continue;let a=c.start;
    while(a>0&&(src[a-1]===' '||src[a-1]==='\t'))a--; /* les blancs juste avant : hors de tout jeton */
    if(retire.some(r=>a<r.b&&c.start>=r.b))a=c.start;
    const n=sauts(src.slice(c.start,c.end));ed.push({a,b:c.end,t:c.type==='Line'?'':(n?'\n'.repeat(n):' ')});}
  ed.sort((x,y)=>x.a-y.a);let o=[],i=0;for(const e of ed){if(e.a<i)continue;o.push(src.slice(i,e.a),e.t);i=e.b;}o.push(src.slice(i));return o.join('');}
function verifieJS(avant,apres,type,retire){const A=jetons(avant,type),B=jetons(apres,type),att=[];let r=0;const R=retire.slice().sort((x,y)=>x.a-y.a);
  for(const t of A){while(r<R.length&&t.a>=R[r].b)r++;if(r<R.length&&t.a>=R[r].a){if(t.a===R[r].a)att.push(';'+SEP);continue;}att.push(t.k);}
  if(att.length!==B.length)return false;for(let k=0;k<B.length;k++)if(B[k].k!==att[k])return false;return true;}

/* CSS : un petit lecteur qui saute les chaînes et url(…) */
function reecrireCSS(css){const o=[];let i=0,n=css.length,dern=0;const blanc=c=>c===undefined||/\s/.test(c);
  while(i<n){const ch=css[i];
    if(ch==='"'||ch==="'"){let j=i+1;while(j<n&&css[j]!==ch&&css[j]!=='\n'){if(css[j]==='\\')j++;j++;}i=j+1;continue;}
    if((ch==='u'||ch==='U')&&/^url\(\s*[^"'\s)]/i.test(css.slice(i,i+6))){const j=css.indexOf(')',i);if(j<0)return null;i=j+1;continue;}
    if(ch==='/'&&css[i+1]==='*'){const e=css.indexOf('*/',i+2);if(e<0)return null;const t=css.slice(i,e+2),s=sauts(t);
      const av=css[i-1],ap=css[e+2];o.push(css.slice(dern,i));
      o.push(blanc(av)||blanc(ap)?(s?'\n'.repeat(s):''):(s?'/*'+'\n'.repeat(s)+'*/':'/**/'));i=dern=e+2;continue;}
    i++;}
  o.push(css.slice(dern));return o.join('');}
function accolades(css){let s=css.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g,'""').replace(/\/\*[\s\S]*?\*\//g,'');return (s.match(/\{/g)||[]).length+'/'+(s.match(/\}/g)||[]).length;}

/* index.html découpé comme le lit un navigateur : commentaires HTML, <script>, <style> */
function decoupe(html){const P=[],low=html.toLowerCase(),re=/<!--|<script\b|<style\b/gi;let m;
  while((m=re.exec(html))){const i=m.index;
    if(m[0]==='<!--'){const e=html.indexOf('-->',i+4);if(e<0)break;P.push({k:'html',a:i,b:e+3});re.lastIndex=e+3;continue;}
    const tag=m[0].toLowerCase()==='<script'?'script':'style',f=html.indexOf('>',i),c=low.indexOf('</'+tag,f);if(f<0||c<0)break;
    const at=html.slice(i,f+1);
    if(tag==='style')P.push({k:'css',a:f+1,b:c});
    else if(!/\bsrc\s*=/i.test(at)&&!/type\s*=\s*["']?(?!text\/javascript|module|application\/javascript)[a-z]/i.test(at))P.push({k:'js',a:f+1,b:c});
    re.lastIndex=c;}
  return P;}

function fichiers(d){const r=[];(function w(p){for(const n of fs.readdirSync(p)){const q=path.join(p,n),s=fs.statSync(q);
  if(s.isDirectory()){if(n!=='vendor'&&n!=='node_modules')w(q);}else if(/\.(js|html)$/.test(n))r.push(q);}})(d);return r;}

const bilan=[];let gainTot=0;
function ecrit(f,avant,apres,note){const g=Buffer.byteLength(avant)-Buffer.byteLength(apres);gainTot+=g;
  bilan.push(path.relative(DOS,f).replace(/\\/g,'/')+' : −'+(g/1024).toFixed(0)+' Ko'+(note?' ('+note+')':''));if(!ESSAI)fs.writeFileSync(f,apres);}

/* 1. index.html */
const FI=path.join(DOS,'index.html');const html=fs.readFileSync(FI,'utf8');const P=decoupe(html);
const autres=fichiers(DOS).filter(f=>f!==FI&&!/sons-banque(-2)?\.js$/.test(f));
const texteAutres=autres.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const JS=P.filter(p=>p.k==='js').map(p=>{const src=html.slice(p.a,p.b);try{const L=lireJS(src);return Object.assign(p,{src,L,cand:crochets(L.ast)});}
  catch(e){console.log('⚠ script en ligne illisible, gardé tel quel :',e.message);return Object.assign(p,{src,L:null,cand:[]});}});
/* le point fixe des crochets : un nom reste s'il est nommé hors des crochets encore retirables (un crochet niché dans un autre reste) */
const blancs=(s,plages)=>{let o=[],i=0;for(const r of plages.slice().sort((x,y)=>x.a-y.a)){o.push(s.slice(i,r.a),' '.repeat(r.b-r.a));i=r.b;}o.push(s.slice(i));return o.join('');};
for(const p of JS)p.cand=p.cand.filter(c=>!p.cand.some(d=>d!==c&&d.a<=c.a&&c.b<=d.b));
const MOT=/\bdbg[A-Za-z0-9_$]*/g,dehors=new Set((blancs(html,P.filter(p=>p.k==='js'))+String.fromCharCode(10)+texteAutres).match(MOT)||[]),occ=new Map();
for(const p of JS){const t=p.L?blancs(p.src,p.L.com.map(c=>({a:c.start,b:c.end}))):p.src;let m;MOT.lastIndex=0;
  while((m=MOT.exec(t))){const c=p.cand.find(c=>m.index>=c.a&&m.index<c.b);if(!occ.has(m[0]))occ.set(m[0],[]);occ.get(m[0]).push(c?c.nom:null);}}
const GARDE_DBG=new Set((process.argv[process.argv.indexOf('--garde-dbg')+1]||'').split(',').filter(x=>process.argv.includes('--garde-dbg')&&x)); /* banc : garder des crochets */
let retirables=new Set(JS.flatMap(p=>p.cand.map(c=>c.nom)).filter(n=>!GARDE_DBG.has(n)));
for(let ch=true;ch;){ch=false;for(const n of [...retirables])if(dehors.has(n)||(occ.get(n)||[]).some(o=>o===null||!retirables.has(o))){retirables.delete(n);ch=true;}}
let sortie=[],i=0,nbRet=0;
for(const p of P){sortie.push(html.slice(i,p.a));const t=html.slice(p.a,p.b);let r=t;
  if(p.k==='html'){const s=sauts(t);r=s?'<!--'+'\n'.repeat(s)+'-->':'<!---->';}
  else if(p.k==='css'){const c=reecrireCSS(t);r=(c!==null&&accolades(c)===accolades(t))?c:t;if(r===t&&c!==null)console.log('⚠ un <style> gardé tel quel (accolades)');}
  else if(p.L){const ret=p.cand.filter(c=>retirables.has(c.nom));const c=reecrireJS(t,p.L.com,ret);
    if(verifieJS(t,c,p.L.type,ret)){r=c;nbRet+=ret.length;}else console.log('⚠ un <script> gardé tel quel (jetons différents)');}
  sortie.push(r);i=p.b;}
sortie.push(html.slice(i));const html2=sortie.join('');
if(sauts(html2)!==sauts(html))console.log('⚠ index.html : nombre de lignes changé ('+sauts(html)+' → '+sauts(html2)+')');
ecrit(FI,html,html2,nbRet+' crochets dbg retirés');

/* 2. les autres .js publiés (les commentaires seulement) */
for(const f of autres){if(!/\.js$/.test(f))continue;const src=fs.readFileSync(f,'utf8');let L;
  try{L=lireJS(src);}catch(e){console.log('⚠ '+path.relative(DOS,f)+' illisible, gardé tel quel');continue;}
  if(!L.com.length)continue;const c=reecrireJS(src,L.com,[]);
  if(verifieJS(src,c,L.type,[]))ecrit(f,src,c);else console.log('⚠ '+path.relative(DOS,f)+' gardé tel quel (jetons différents)');}

console.log('publie-allege'+(ESSAI?' (essai, rien écrit)':'')+' : −'+(gainTot/1048576).toFixed(2)+' Mo');
for(const l of bilan)if(!/: −0 Ko/.test(l))console.log('  '+l);
