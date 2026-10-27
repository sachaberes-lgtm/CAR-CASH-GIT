#!/usr/bin/env node
/* LA GARDE DU DÉMARRAGE (2026-10-27, Léo : « utilise les techniques Cloudflare pour soigner notre jeu, et fais en sorte que mon jeu ne bugge
   plus du tout » — choisi : « leur méthode anti-bugs »). Même esprit que garde-burnout.sh : une version qui ne PEUT PAS démarrer n'est pas
   publiée — la construction Vercel échoue et le site garde la version d'avant (les joueurs ne voient jamais l'écran « a calé »).
   Ce qu'elle refuse :
   (avertit seulement) index.html qui n'est plus l'assemblage de code/ (une retouche faite d'un seul côté, perdue au prochain assemblage) ;
   1. un <script> en ligne d'index.html ou un .js local qu'il charge qui ne se LIT pas (faute de syntaxe = page blanche sur tous les
      téléphones) — lu par acorn (outils/vendor/acorn.js, déjà vendu pour publie-allege) ;
   2. un <script src> local qui n'existe pas (404 = un morceau du jeu absent, en silence).
   Usage : node outils/garde-demarrage.cjs [dossier du jeu, défaut « VERSION PRINCIPALE »] · GARDE_DEMARRAGE=0 la coupe. Sortie 0 = OK, 1 = refus. */
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
if(process.env.GARDE_DEMARRAGE==='0'){console.log('garde du démarrage : désactivée (GARDE_DEMARRAGE=0)');process.exit(0);}
const RACINE=path.resolve(__dirname,'..'),DOS=path.resolve(RACINE,process.argv[2]||'VERSION PRINCIPALE');
const acorn=require('./vendor/acorn.js');
const OPT={ecmaVersion:'latest',allowHashBang:true};
const fautes=[];
const lit=(src,quoi)=>{let e0;for(const t of ['script','module']){try{acorn.parse(src,Object.assign({sourceType:t},OPT));return;}catch(e){e0=e0||e;}}
  fautes.push(quoi+' : '+e0.message);};
/* (avertissement) code/ ⇄ index.html (seulement sur le dépôt, pas sur une copie publiée) */
if(fs.existsSync(path.join(RACINE,'code','assembler.cjs'))&&path.basename(DOS)==='VERSION PRINCIPALE'){
  try{execFileSync(process.execPath,[path.join(RACINE,'code','assembler.cjs'),'--verifier'],{cwd:RACINE,stdio:['ignore','pipe','pipe']});}
  catch(e){console.warn('⚠ garde du démarrage : index.html ≠ code/ assemblé — lancer  node code/assembler.cjs  puis committer les deux (avertissement : le jeu marche, mais la retouche faite d\'un seul côté sera perdue au prochain assemblage)');}}
/* 1 et 2. les scripts */
const h=fs.readFileSync(path.join(DOS,'index.html'),'utf8');
const ligne=i=>h.slice(0,i).split('\n').length;
let n=0;
/* les <script> du document, hors commentaires HTML (un commentaire peut citer « <script> » en toutes lettres) */
const blocs=[];for(let i=0;;){const c=h.indexOf('<!--',i),rs=/<script\b/gi;rs.lastIndex=i;const ks=rs.exec(h),o=ks?ks.index:-1;
  if(o<0)break;if(c>=0&&c<o){const z=h.indexOf('-->',c+4);if(z<0)break;i=z+3;continue;}
  const r=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;r.lastIndex=o;const m=r.exec(h);if(!m)break;blocs.push(m);i=m.index+m[0].length;}
for(const m of blocs){
  const at=m[1],src=/\ssrc=["']([^"']+)["']/i.exec(at);
  if(src){const u=src[1].split(/[?#]/)[0];if(/^[a-z]+:|^\/\//i.test(u))continue;
    const f=path.join(DOS,u);if(!fs.existsSync(f)){fautes.push('index.html charge '+u+' : fichier absent');continue;}
    if(/\.m?js$/.test(u)){lit(fs.readFileSync(f,'utf8'),u);n++;}continue;}
  const ty=/\stype=["']([^"']+)["']/i.exec(at);if(ty&&!/javascript|module/i.test(ty[1]))continue;
  lit(m[2],'index.html, <script> de la ligne '+ligne(m.index));n++;}
if(fautes.length){console.error('✘ GARDE DU DÉMARRAGE — cette version ne serait pas publiée :');for(const f of fautes)console.error('  · '+f);process.exit(1);}
console.log('garde du démarrage : OK ('+n+' scripts lus)');
