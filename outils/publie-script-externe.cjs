#!/usr/bin/env node
/* LE JEU EN FICHIER EXTERNE (2026-11-04, Sacha : « le jeu doit se lancer plus vite aux lancements suivants ») — appelé par vercel-build.sh sur
   .vercel-static/jouer, APRÈS publie-allege (qui lit index.html tel que le dépôt l'a) et AVANT l'empreinte du jeu.
   POURQUOI : le gros <script> en ligne d'index.html (~7 Mo une fois allégé) est lu et compilé par V8 à CHAQUE lancement — Chrome et Safari ne
   gardent un cache de bytecode que pour les scripts EXTERNES (jamais pour un script en ligne). Sorti dans `jeu.<empreinte>.js` (nom changé à
   chaque version, servi `immutable` : voir vercel.json), il n'est compilé qu'au 1er lancement ; les suivants réutilisent le bytecode.
   LA COPIE PUBLIÉE SEULEMENT : le source garde son <script> en ligne (index.html ≡ code/, voir assembler.cjs et garde-demarrage).
   ORDRE D'EXÉCUTION INCHANGÉ : `<script src="jeu.<empreinte>.js"></script>` prend la place exacte du bloc, sans defer ni async (le script
   suivant, sons-banque.js, est `defer`). Le fichier est lu d'un bloc comme le script en ligne l'était : l'ordre ne bouge pas.
   LES NUMÉROS DE LIGNE (la boîte noire window.__ccNote note `fichier:ligne:colonne`) : le fichier commence par un commentaire d'UNE ligne,
   écrit AVANT le premier saut de ligne du bloc (le bloc commence par « <script>\n ») — la ligne L du fichier est donc la ligne L+N-1 d'index.html
   (N = la ligne de la balise <script> d'origine, écrite dans l'en-tête). Une erreur « jeu.abc.js:5000 » = ligne 5000+N-1 du SOURCE index.html.
   SÛRETÉ : le fichier et le bloc d'origine sont relus avec acorn : mêmes jetons (même type script/module, et module refusé : un module est
   différé). Au moindre doute, ou si le bloc n'est pas un gros script classique, RIEN n'est écrit (sortie 0, message) : la copie garde son
   script en ligne et marche comme avant. Ce script ne fait jamais échouer la publication (sortie 2 seulement si le dossier est introuvable).
   Usage : node outils/publie-script-externe.cjs <dossier publié> */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const acorn=require('./vendor/acorn.js');
const DOS=process.argv[2];
if(!DOS||!fs.existsSync(path.join(DOS,'index.html'))){console.error('publie-script-externe : pas d\'index.html dans '+DOS);process.exit(2);}
const OPT={ecmaVersion:'latest',allowHashBang:true};
const SEP=String.fromCharCode(1);
const MIN=512*1024; /* en dessous, le gain de compilation ne vaut pas une requête de plus */
const rien=m=>{console.log('publie-script-externe : rien écrit — '+m);process.exit(0);};

function jetons(src,type){const L=[];for(const t of acorn.tokenizer(src,Object.assign({sourceType:type},OPT))){
  const v=t.type.label==='regexp'?t.value.pattern+'/'+t.value.flags:(t.value===undefined?'':String(t.value));L.push(t.type.label+SEP+v);}return L;}
function memes(a,b,type){const A=jetons(a,type),B=jetons(b,type);if(A.length!==B.length)return false;for(let i=0;i<A.length;i++)if(A[i]!==B[i])return false;return true;}

const FI=path.join(DOS,'index.html'),html=fs.readFileSync(FI,'utf8'),low=html.toLowerCase();
/* les <script> en ligne, comme les lit un navigateur (commentaires HTML sautés) */
const blocs=[],re=/<!--|<script\b/gi;let m;
while((m=re.exec(html))){const i=m.index;
  if(m[0]==='<!--'){const e=html.indexOf('-->',i+4);if(e<0)break;re.lastIndex=e+3;continue;}
  const f=html.indexOf('>',i),c=low.indexOf('</script',f);if(f<0||c<0)break;
  const at=html.slice(i+7,f);
  if(!/\bsrc\s*=/i.test(at))blocs.push({a:i,f:f+1,c,at});
  re.lastIndex=c;}
if(!blocs.length)rien('aucun <script> en ligne');
const gros=blocs.reduce((x,y)=>(y.c-y.f)>(x.c-x.f)?y:x);
const src=html.slice(gros.f,gros.c);
if(Buffer.byteLength(src)<MIN)rien('le plus gros <script> en ligne est trop petit ('+(Buffer.byteLength(src)/1024).toFixed(0)+' Ko)');
if(gros.at.trim()!==''&&!/^\s*type\s*=\s*["']?text\/javascript["']?\s*$/i.test(gros.at))rien('<script'+gros.at+'> a des attributs ('+gros.at.trim()+')');
if(/<\/script/i.test(src))rien('le script cite </script');

/* la ligne de la balise d'origine (1 = première ligne) */
const N=html.slice(0,gros.a).split('\n').length;
let type;try{acorn.parse(src,Object.assign({sourceType:'script'},OPT));type='script';}catch(e){rien('le script ne se lit pas en script classique ('+e.message+')');}

const entete='/* extrait de index.html ligne '+N+' : ajouter '+(N-1)+' aux numéros de ligne des erreurs (ligne L du fichier = ligne L+'+(N-1)+' de index.html) */';
const contenu=entete+src;
/* le commentaire doit tenir sur la ligne 1 sans en ajouter une : le bloc commence par son propre saut de ligne */
if(!/^\r?\n/.test(src))rien('le bloc ne commence pas par un saut de ligne (les numéros de ligne ne se recaleraient pas)');
try{if(!memes(src,contenu,type))rien('jetons différents après l\'en-tête');}catch(e){rien('relecture impossible ('+e.message+')');}

const nom='jeu.'+crypto.createHash('sha1').update(contenu).digest('hex').slice(0,10)+'.js';
const balise='<script src="'+nom+'"></script>';
/* (2026-11-10, passe optimisation) LE JEU ANNONCÉ DANS LA TÊTE : la balise est en fin de corps, après ~1,3 Mo de CSS en ligne — le navigateur ne lançait le plus gros
   fichier qu'une fois ces octets reçus. Un preload dans <head> (posé SUR la ligne de </head> : aucun numéro de ligne ne bouge) le fait descendre tout de suite. */
const iTete=html.search(/<\/head>/i),avant=html.slice(0,gros.a);
const tete=(iTete>=0&&iTete<gros.a)?avant.slice(0,iTete)+'<link rel="preload" as="script" href="'+nom+'">'+avant.slice(iTete):avant;
const html2=tete+balise+html.slice(gros.c+'</script>'.length);
if(html.slice(gros.c,gros.c+9).toLowerCase()!=='</script>')rien('fermeture </script> inattendue');
/* la page réécrite doit garder les mêmes autres blocs : on relit le fichier écrit comme il sera lu */
fs.writeFileSync(path.join(DOS,nom),contenu);
const relu=fs.readFileSync(path.join(DOS,nom),'utf8');
if(relu!==contenu){fs.rmSync(path.join(DOS,nom),{force:true});rien('écriture infidèle');}
fs.writeFileSync(FI,html2);
console.log('publie-script-externe : '+nom+' ('+(Buffer.byteLength(contenu)/1048576).toFixed(2)+' Mo) ← <script> de la ligne '+N+' ; index.html '
  +(Buffer.byteLength(html)/1048576).toFixed(2)+' → '+(Buffer.byteLength(html2)/1048576).toFixed(2)+' Mo');
