#!/usr/bin/env node
/* ===== VITESSE : LECTURE D'UN PROFIL CPU (node --cpu-prof) D'UNE COURSE (2026-11-27, etude « vitesse ») =====
   Lit un .cpuprofile et la sortie de chronometrer.js (l'heure de chaque etape), et rend :
     · le temps PROPRE (self) par famille de code : le jeu (index.html), three.js, les yeux (ml/bot/yeux.js, evalue dans le jeu), le pilote et
       son bac (evolution.js, bac.js, piloter.js decide), le simulateur (sim-env-reel.js, jeu-reel.js), node lui-meme, le ramasse-miettes
       (garbage collector), « (program) » (le moteur hors JavaScript : compilation, analyse du texte, appels natifs) ;
     · le meme decoupage PAR ETAPE : le chargement (ouvrir), la mise en piste (J.lancer), la boucle ;
     · les 25 fonctions les plus cheres en temps propre, et quelques fonctions en temps INCLUS (elle + tout ce qu'elle appelle).
   Le controle du script : la somme des temps propres doit redonner la duree du profil (a l'echantillon pres).
   Usage : node analyser-profil.js profils/<nom>.cpuprofile profils/<nom>.json > profils/<nom>-lecture.txt */
'use strict';
const fs=require('fs'),path=require('path');
const P=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let CH=null;try{CH=JSON.parse(fs.readFileSync(process.argv[3],'utf8').split('\n')[0]);}catch(e){CH=null;}
const parId=new Map(P.nodes.map(n=>[n.id,n]));
const parent=new Map();for(const n of P.nodes)for(const c of n.children||[])parent.set(c,n.id);
/* la famille d'un noeud : d'apres son fichier, puis son nom */
function famille(n){
  const u=n.callFrame.url||'',f=n.callFrame.functionName;
  if(f==='(garbage collector)')return 'ramasse-miettes';
  if(f==='(program)'||f==='(idle)'||f==='(root)')return 'moteur hors JS (program)';
  if(/three(\.min)?\.js/.test(u))return 'three.js';
  if(/index\.html$/.test(u))return 'le jeu (index.html)';
  if(/figures\.js$/.test(u))return 'le jeu (figures.js)';
  if(/yeux/.test(u))return 'les yeux (yeux.js)';
  if(/evolution\.js$|bac\.js$/.test(u))return 'le pilote (bac)';
  if(/piloter\.js$/.test(u))return 'piloter.js (boucle, decide, vues en texte)';
  if(/doigts\.js$/.test(u))return 'les doigts (doigts.js)';
  if(/mesures\.js$|ressemblance\.js$/.test(u))return 'mesures';
  if(/sim-env-reel\.js$|jeu-reel\.js$/.test(u))return 'le simulateur (sim-env-reel, jeu-reel)';
  if(/^node:|^internal/.test(u))return 'node';
  if(u==='')return 'natif (sans fichier : JSON, regex, vm...)';
  return 'autre : '+path.basename(u);
}
/* l'url des yeux : yeux.js pose son code dans le jeu par J.ev — son nom de fichier dans le profil peut etre vide ou index.html ; on regarde ce qui est vu */
const urls={};for(const n of P.nodes){const u=n.callFrame.url||'(vide)';urls[u]=(urls[u]||0)+(n.hitCount||0);}
/* les echantillons, et leur heure (debut du profil = 0) */
const T=[];{let t=0;for(let i=0;i<P.samples.length;i++){t+=P.timeDeltas[i]||0;T.push(t/1000);}}   /* ms */
const dureeProfil=(P.endTime-P.startTime)/1000;
/* les bornes des etapes, depuis le debut du profil (le profil part a peu pres au demarrage du processus) */
let bornes=null;
if(CH){const e=CH.etapes;const d0=CH.demarrageNode_ms||0;let x=d0+e.fichiersEpoque_ms+e.requireBot_ms;const o0=x;x+=e.ouvrir_ms;const o1=x;x+=e.charger_ms;const c0=x;
  const lan=CH.horsBoucleDansCourse_ms;x+=e.course_ms;const c1=x;
  /* dans course() : J.lancer d'abord, puis la boucle (bilan.ms), puis une fin courte ; on attribue le hors-boucle au debut (la fin est mesuree a ~0,1 s) */
  bornes=[['avant le jeu (node, require)',0,o0],['chargement du jeu (ouvrir)',o0,o1],['pilote (charger)',o1,c0],['mise en piste (J.lancer) et fin',c0,c0+lan],['la boucle de course',c0+lan,c1],['apres (mesures, sortie)',c1,1e12]];}
const pas=P.samples.length?dureeProfil/P.samples.length:0;
const fam={},famEt={},self=new Map();
for(let i=0;i<P.samples.length;i++){const n=parId.get(P.samples[i]);const dt=(P.timeDeltas[i+1]!=null?P.timeDeltas[i+1]:P.timeDeltas[i])/1000;
  const f=famille(n);fam[f]=(fam[f]||0)+dt;self.set(n.id,(self.get(n.id)||0)+dt);
  if(bornes){const b=bornes.find(b=>T[i]>=b[1]&&T[i]<b[2]);const k=b?b[0]:'?';famEt[k]=famEt[k]||{};famEt[k][f]=(famEt[k][f]||0)+dt;}}
const tot=Object.values(fam).reduce((s,x)=>s+x,0);
const out=[];const dire=t=>out.push(t);const r0=x=>Math.round(x),pc=x=>(100*x/tot).toFixed(1)+' %';
dire('PROFIL '+path.basename(process.argv[2])+' : '+P.samples.length+' echantillons, '+r0(dureeProfil)+' ms de profil, somme des temps propres '+r0(tot)+' ms (controle : ecart '+(100*(tot-dureeProfil)/dureeProfil).toFixed(2)+' %)');
dire('\nTEMPS PROPRE PAR FAMILLE (toute la vie du processus)');
for(const [k,v] of Object.entries(fam).sort((a,b)=>b[1]-a[1]))dire('  '+k.padEnd(48)+String(r0(v)).padStart(7)+' ms  '+pc(v));
if(bornes){dire('\nPAR ETAPE (bornes de chronometrer.js)');
  for(const b of bornes){const F=famEt[b[0]]||{};const s=Object.values(F).reduce((a,x)=>a+x,0);if(!s)continue;
    dire('  '+b[0]+' : '+r0(s)+' ms');
    for(const [k,v] of Object.entries(F).sort((a,b)=>b[1]-a[1]).slice(0,7))dire('      '+k.padEnd(46)+String(r0(v)).padStart(7)+' ms  '+(100*v/s).toFixed(1)+' %');}}
dire('\nLES 25 FONCTIONS LES PLUS CHERES (temps propre)');
const parFn=new Map();for(const [id,v] of self){const n=parId.get(id);const k=(n.callFrame.functionName||'(anonyme)')+' @ '+path.basename(n.callFrame.url||'')+':'+(n.callFrame.lineNumber+1);parFn.set(k,(parFn.get(k)||0)+v);}
for(const [k,v] of [...parFn].sort((a,b)=>b[1]-a[1]).slice(0,25))dire('  '+String(r0(v)).padStart(7)+' ms  '+pc(v).padStart(7)+'  '+k.slice(0,110));
/* temps INCLUS : un noeud et tous ses descendants (un meme nom compte une fois par chemin : pas de double compte, on ne descend pas sous un noeud deja compte) */
function inclus(pred){let s=0;const vu=new Set();
  function desc(id){let x=self.get(id)||0;for(const c of parId.get(id).children||[])x+=desc(c);return x;}
  function marche(id,dedans){const n=parId.get(id);const ok=!dedans&&pred(n);if(ok)s+=desc(id);for(const c of n.children||[])marche(c,dedans||ok);}
  marche(P.nodes[0].id,false);return s;}
dire('\nTEMPS INCLUS (la fonction et tout ce qu\'elle appelle)');
const Q=[['loop (la boucle du jeu, une image)',n=>n.callFrame.functionName==='loop'&&/index\.html/.test(n.callFrame.url)],
  ['__YEUX / voir (les yeux, une vue)',n=>/__YEUX|^voir$/.test(n.callFrame.functionName)&&!/index\.html/.test(n.callFrame.url)||n.callFrame.functionName==='voir'],
  ['decide (le pilote, piloter.js)',n=>n.callFrame.functionName==='decide'&&/piloter\.js/.test(n.callFrame.url)],
  ['resetGame (mise en piste)',n=>n.callFrame.functionName==='resetGame'],
  ['newTrack / buildTrack (bâtir une piste)',n=>/^(newTrack|buildTrack)$/.test(n.callFrame.functionName)],
  ['loadGame (le chargement du faux navigateur)',n=>n.callFrame.functionName==='loadGame'],
  ['photo de l\'etat propre (__propre.photo)',n=>n.callFrame.functionName==='photo'],
  ['remise de l\'etat propre (__propre.remet)',n=>n.callFrame.functionName==='remet'],
  ['nomsHautNiveau (relire code/ a chaque processus)',n=>n.callFrame.functionName==='nomsHautNiveau'],
  ['tick (les minuteries du jeu)',n=>n.callFrame.functionName==='tick'&&/sim-env-reel/.test(n.callFrame.url)],
  ['mesures (de la partie)',n=>n.callFrame.functionName==='mesures'||n.callFrame.functionName==='mesuresPartie'],
  ['envCielCalc (le ciel reflete sur la caisse : pur, sans hasard)',n=>n.callFrame.functionName==='envCielCalc'],
  ['nfeuPas (la flamme de nitro : tire au hasard)',n=>n.callFrame.functionName==='nfeuPas'],
  ['J.image (une image : minuteries + loop)',n=>n.callFrame.functionName==='J.image'],
  ['runInContext / Script (compiler un texte dans vm)',n=>/^(runInContext|Script)$/.test(n.callFrame.functionName)&&/node:vm/.test(n.callFrame.url)]];
for(const [nom,pred] of Q){const v=inclus(pred);dire('  '+nom.padEnd(52)+String(r0(v)).padStart(7)+' ms  '+pc(v));}
/* envCielCalc par etape : combien dans la mise en piste, combien dans la boucle */
if(bornes){const ids=new Set();(function m(id,d){const n=parId.get(id);const ok=d||n.callFrame.functionName==='envCielCalc';if(ok)ids.add(id);for(const c of n.children||[])m(c,ok);})(P.nodes[0].id,false);
  const parEt={};for(let i=0;i<P.samples.length;i++){if(!ids.has(P.samples[i]))continue;const b=bornes.find(b=>T[i]>=b[1]&&T[i]<b[2]);const k=b?b[0]:'?';parEt[k]=(parEt[k]||0)+(P.timeDeltas[i+1]||0)/1000;}
  dire('\nenvCielCalc par etape (ms) : '+JSON.stringify(Object.fromEntries(Object.entries(parEt).map(x=>[x[0],r0(x[1])]))));}
dire('\nFICHIERS VUS (echantillons par url) : '+JSON.stringify(Object.fromEntries(Object.entries(urls).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>[x[0].slice(-50),x[1]]))));
process.stdout.write(out.join('\n')+'\n');
