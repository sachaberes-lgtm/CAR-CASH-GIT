#!/usr/bin/env node
/* ===== VITESSE : UNE COURSE CHRONOMETREE ETAPE PAR ETAPE (2026-11-27, etude « vitesse ») =====
   Le meme travail que ml/evolution/enfant.js jouer() — fichiersLus, require de ml/bot/piloter, ouvrir, charger, course, resultatCompact —
   dans le meme ordre et avec les memes fonctions (rien n'est recopie de la course elle-meme : on appelle piloter.js et enfant.resultatCompact),
   mais avec l'heure de chaque etape. Ne modifie aucun fichier du depot ; n'ecrit que la ligne JSON de sortie.
   La course rendue doit avoir LES MEMES empreintes (empreinte, empreinteVues, empreinteTouches) que la ligne de la vraie evolution :
   c'est la preuve que la course chronometree est bien celle de la selection (meme pilote, meme graine, meme jeu).
   Usage : node [--cpu-prof --cpu-prof-dir=profils] chronometrer.js <pilote.js> <graine> [tmax=120] [--minuteries] [--sans-ciel] [--deux]
     --minuteries : chronometre les minuteries du jeu (g.tick), sans rien y changer ;
     --sans-ciel  : l'acceleration essayee : envCielCalc remplacee apres le chargement (voir plus bas ; un compteur d'appels dans
                    globalThis.__nCielEtude, rendu en appelsCielRemplace) ;
     --deux : rejoue la MEME graine une seconde fois dans le MEME processus (J.lancer remet l'etat propre, ml/reel/jeu-reel.js) :
              dit si la seconde course est identique a la premiere, et ce qu'elle coute sans le chargement. (Ecrit, PAS lance dans cette
              etude : il coute deux courses, et la tache n'en permettait que 4.)
   Sortie : une ligne JSON sur stdout (le bavardage du jeu part sur stderr). */
'use strict';
const T0=process.hrtime.bigint();
const depuis=()=>Number(process.hrtime.bigint()-T0)/1e6;
/* le demarrage de node avant la premiere ligne de ce script : performance.now() part de l'origine du processus */
const demarrageNode_ms=performance.now()-depuis();
const path=require('path'),fs=require('fs');
const ecrire=process.stdout.write.bind(process.stdout);
const versErr=function(){process.stderr.write(Array.prototype.map.call(arguments,String).join(' ')+'\n');};
console.log=versErr;console.info=versErr;console.warn=versErr;
const A=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const deux=process.argv.includes('--deux');
const fichier=path.resolve(A[0]||''),graine=+A[1],tmax=+(A[2]||120);
if(!A[0]||!(graine>=0)){versErr('usage : node chronometrer.js <pilote.js> <graine> [tmax=120] [--deux]');process.exit(1);}
const RACINE=path.join(__dirname,'..','..','..','..','..');
const EV=path.join(RACINE,'ml','evolution');
const etapes={};let t=depuis();
function marque(nom){const n=depuis();etapes[nom]=Math.round(n-t);t=n;}
const source=fs.readFileSync(fichier,'utf8');
/* 1. ce que l'enfant fait avant le jeu : l'empreinte des fichiers de l'epoque (enfant.js fichiersLus) */
const Cm=require(path.join(EV,'commun'));
const fichiers_sha=Cm.shaDesFichiers(Cm.shaFichiersEpoque({tolererManquants:true}));
marque('fichiersEpoque_ms');
/* 2. le require du bot : three.js, yeux, doigts, mesures, jeu-reel */
const {ouvrir,charger,course}=require(path.join(RACINE,'ml','bot','piloter'));
const {resultatCompact}=require(path.join(EV,'enfant'));
marque('requireBot_ms');
/* 3. le jeu : lecture de index.html (13 Mo), compilation, chauffe (start, premiere piste, 30 images), photo de l'etat propre, yeux */
const J=ouvrir({regime:'allege'});
marque('ouvrir_ms');
/* --minuteries : le temps des minuteries du jeu (g.tick, ml/reel/sim-env-reel.js), mesure autour de la fonction d'origine, sans rien changer a ce
   qu'elle fait (J.image appelle g.tick() par son nom a chaque image : on l'enveloppe). Compte aussi la longueur moyenne de la file. */
const MIN={ns:0n,appels:0,file:0};
if(process.argv.includes('--minuteries')){const t0=J.g.tick;J.g.tick=function(){MIN.appels++;MIN.file+=J.g.minuteries.q.length;const h=process.hrtime.bigint();t0();MIN.ns+=process.hrtime.bigint()-h;};}
/* --sans-ciel : L'ESSAI D'UNE ACCELERATION. envCielCalc (code/voitures/finition.js) est une fonction PURE du jeu, sans hasard, qui peint les 6 faces du
   ciel reflete sur la carrosserie ; ici ses octets ne vont qu'a un faux canevas. On la remplace, APRES le chargement, par une fonction qui rend
   6 faces noires de la meme taille. Si la course redonne les memes empreintes que la vraie evolution, ce calcul ne sert pas a la course. */
if(process.argv.includes('--sans-ciel'))J.ev('(envCielCalc=function(stops,s1,s2,sunHalo,sd,T,ECL,S){globalThis.__nCielEtude=(globalThis.__nCielEtude|0)+1;const O=[];for(let f=0;f<6;f++)O.push(new Uint8ClampedArray(S*S*4));return O;},1)');
/* 4. le pilote dans son bac */
const C=charger('evolution.js',{source});
marque('charger_ms');
/* 5. la course : J.lancer (remise, resetGame, la premiere piste) + la boucle (bilan.ms) + la fin (enregistrement, mesures) */
const r=course(J,C,graine,{tmax});
marque('course_ms');
const res=resultatCompact(r,J,C,graine);res.fichiers_sha=fichiers_sha;
marque('resultatCompact_ms');
const sortie={graine,tmax,demarrageNode_ms:Math.round(demarrageNode_ms),etapes,boucle_ms:r.bilan.ms,horsBoucleDansCourse_ms:etapes.course_ms-r.bilan.ms,
  images:r.bilan.images,decisions:r.bilan.decisions,survie_s:res.survie_s,palier:res.palier,cause:res.cause,
  empreinte:res.empreinte,empreinteVues:res.empreinteVues,empreinteTouches:res.empreinteTouches,
  cerveau_ms_moy:res.cerveau_ms_moy,yeux:r.bilan.yeux,
  /* le temps des yeux sur toute la course : le moyen d'une vue x le nombre de vues */
  yeuxTotal_ms:Math.round(r.bilan.yeux.ms_moy*(r.bilan.yeux.vues_sol+r.bilan.yeux.vues_vol)),
  cerveauTotal_ms:Math.round(res.cerveau_ms_moy*r.bilan.decisions),
  memoireMo:Math.round(process.memoryUsage().rss/1048576),
  options:process.argv.filter(a=>a.startsWith('--')),
  appelsCielRemplace:process.argv.includes('--sans-ciel')?J.ev('globalThis.__nCielEtude|0'):null,
  minuteries:MIN.appels?{ms:Math.round(Number(MIN.ns)/1e6),appels:MIN.appels,fileMoyenne:Math.round(MIN.file/MIN.appels)}:null};
if(deux){
  const t2=depuis();
  const C2=charger('evolution.js',{source});
  const r2=course(J,C2,graine,{tmax});
  const res2=resultatCompact(r2,J,C2,graine);
  sortie.seconde={total_ms:Math.round(depuis()-t2),boucle_ms:r2.bilan.ms,survie_s:res2.survie_s,palier:res2.palier,
    empreinte:res2.empreinte,empreinteVues:res2.empreinteVues,empreinteTouches:res2.empreinteTouches,
    identique:res2.empreinte===res.empreinte&&res2.empreinteVues===res.empreinteVues&&res2.empreinteTouches===res.empreinteTouches,
    propreRemis:J.propreRemis,nesApres:J.ev('__propre.nesApres()')};
}
sortie.total_ms=Math.round(depuis());
ecrire(JSON.stringify(sortie)+'\n');
process.exit(0);
