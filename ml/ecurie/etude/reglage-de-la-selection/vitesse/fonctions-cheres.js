#!/usr/bin/env node
/* ===== VITESSE : LES FONCTIONS DU JEU LES PLUS CHERES, LUES DANS LEUR TEXTE (2026-11-27, etude « vitesse ») =====
   Pour chaque fonction chaude du profil (analyser-profil.js), dans VERSION PRINCIPALE/index.html (lu, jamais modifie) :
     · son texte tire-t-il au hasard (Math.random) LUI-MEME ? (le jeu tire TOUT du meme generateur : une fonction qui tire, retiree ou
       memorisee, decale tous les tirages suivants, donc la route et la course — elle ne peut pas etre sautee sans changer les resultats) ;
     · quelles fonctions du jeu appelle-t-elle (un niveau) : si l'une d'elles tire, la fonction tire aussi (indirectement) ;
     · ecrit-elle autre chose que des objets de dessin ? (recherche grossiere : on liste les noms affectes de premier niveau).
   C'est une LECTURE de texte, pas une preuve : la preuve d'une acceleration reste les empreintes de N courses (LISEZ-MOI.md).
   Controle du script : une fonction connue pour tirer (une qui contient « Math.random » en clair) doit sortir « tire ».
   Usage : node fonctions-cheres.js [noms...] */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.join(__dirname,'..','..','..','..','..');
const H=fs.readFileSync(path.join(RACINE,'VERSION PRINCIPALE','index.html'),'utf8');
/* le texte d'une fonction de haut niveau : de « function nom( » a l'accolade qui la ferme (chaines et commentaires sautes) */
function texteDe(nom){
  const re=new RegExp('function\\s+'+nom.replace(/\$/g,'\\$')+'\\s*\\(','g');const m=re.exec(H);if(!m)return null;
  let i=H.indexOf('{',m.index),d=0,q=null;
  for(let j=i;j<H.length;j++){const c=H[j];
    if(q){if(c==='\\'){j++;continue;}if(c===q)q=null;continue;}
    if(c==='"'||c==="'"||c==='`'){q=c;continue;}
    if(c==='/'&&H[j+1]==='*'){j=H.indexOf('*/',j+2)+1;continue;}
    if(c==='/'&&H[j+1]==='/'){j=H.indexOf('\n',j);continue;}
    if(c==='{')d++;else if(c==='}'){d--;if(d===0)return H.slice(m.index,j+1);}}
  return null;}
const NOMS=process.argv.slice(2).length?process.argv.slice(2):['envCielCalc','nfeuPas','ventDessine','updateMoneyRain','hs','fr','pickupsTick','fabT','sillageStep','nuPouTick','lunePinceau','silRuban','pisteRoute','bornes9','dalleLb','loop'];
const tous=new Set([...H.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const tireDirect=n=>{const t=texteDe(n);return t?/Math\.random|\brnd\s*\(|\brand\s*\(/.test(t):null;};
const out=[];
/* le controle : une fonction quelconque du jeu qui contient Math.random en clair */
const temoin=[...tous].find(n=>{const t=texteDe(n);return t&&t.length<4000&&/Math\.random\(\)/.test(t);});
out.push('controle : la fonction '+temoin+' contient Math.random en clair -> tireDirect = '+tireDirect(temoin));
for(const n of NOMS){const t=texteDe(n);if(!t){out.push(n+' : introuvable (une fonction locale, ou un nom de methode)');continue;}
  const appels=[...new Set([...t.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]).filter(x=>x!==n&&tous.has(x)))];
  const tirent=appels.filter(a=>tireDirect(a));
  out.push(n+' ('+t.length+' caracteres) : tire lui-meme '+(tireDirect(n)?'OUI':'non')+' ; appelle '+appels.length+' fonctions du jeu'+(tirent.length?', dont qui tirent : '+tirent.join(', '):', aucune ne tire en clair')+
    (n==='envCielCalc'?' ; rend : '+(/return OUT/.test(t)?'les 6 faces (OUT), rien d\'autre ecrit hors de ses variables locales':'?'):''));}
process.stdout.write(out.join('\n')+'\n');
