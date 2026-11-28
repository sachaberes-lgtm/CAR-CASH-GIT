#!/usr/bin/env node
/* ===== LE COFFRE CONTRE LES CHAMPIONS DE LA BOUCLE PAYANTE (2026-11-28, l'agent « mesure » : « c0101 est-il vraiment meilleur, avec la note de la
   selection, sur des graines jamais vues ? ») =====
   Joue c0025, c0026, c0064 et c0101 (ml/labo/cerveaux/c00NN-pilote.js, lus tels quels) sur les 40 graines du coffre de la selection
   (ml/evolution/config.json : graines.coffre, 990000 + 37 j, j = 0..39), tmax 900, regime de la config (allege), par l'ordonnanceur de
   ml/evolution (courses.js : un processus neuf par course, priorite basse, chien de garde, cache). L'etat est A NOUS : ./etat (jamais
   ml/evolution/etat). 4 courses a la fois au plus (le Xeon est partage).
   En plus, un controle de reproductibilite : c0025 et c0101 sur deux graines de validation de la boucle (950000, 950037) ; leurs empreintes
   doivent etre celles de ml/labo/journal/validations.jsonl (jouees sur le Ryzen).
   Reprise : relancer la meme commande ; une course deja mesuree vient du cache et n'est pas rejouee.
   Usage : node ml/ecurie/etude/boucle-payante-ryzen/coffre/jouer.js [--travailleurs 4] */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.resolve(__dirname,'..','..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const C=require(path.join(EVO,'commun'));
const K=require(path.join(EVO,'courses'));
const Gr=require(path.join(EVO,'graines'));

const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const TRAV=Math.min(4,Math.max(1,+opt('travailleurs',4)));
const PILOTES=['c0025','c0026','c0064','c0101'];
const CONTROLE={pilotes:['c0025','c0101'],graines:[950000,950037]};
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');

const cfg=C.lireConfig(null);
const dossierEtat=path.join(__dirname,'etat');
if(path.resolve(dossierEtat)===path.resolve(C.chemin(cfg,cfg.dossierEtat)))throw new Error('jouer : jamais dans ml/evolution/etat');
fs.mkdirSync(dossierEtat,{recursive:true});
const graines=Gr.grainesCoffre(cfg);
const tmax=cfg.tmax;
const ep=K.epoque(cfg);
/* (2026-11-28, le relecteur : « un etat deja existant ») le cache de courses.js ne sert que les courses de L'EPOQUE DU JOUR, et l'epoque contient
   l'empreinte de ml/evolution/modele.js et enfant.js. Si l'un d'eux a change depuis les premieres courses (le 28/11 : le lot « portage » a retouche
   modele.js, fd590bd3db3d -> 66f66d2ae1c2), les courses deja faites sont REJOUEES (20 courses, quelques minutes : pour un pilote ecrit a la main
   elles redonnent les memes empreintes) ; on le dit au lieu de promettre la reprise. analyser.js lit l'epoque du jour, ou --epoque <id>. */
{const vieilles={};for(const l of K.lireCourses(dossierEtat))if(l&&l.epoque&&l.epoque!==ep.courses)vieilles[l.epoque]=(vieilles[l.epoque]||0)+1;
  if(Object.keys(vieilles).length)dire('ATTENTION : l\'etat a des courses d\'une autre epoque '+JSON.stringify(vieilles)+' ; l\'epoque du jour est '+ep.courses+
    ' : elles ne viennent PAS du cache et seront rejouees (modele.js ou enfant.js de ml/evolution a change)');}
const source={};
for(const p of PILOTES)source[p]=fs.readFileSync(path.join(RACINE,'ml','labo','cerveaux',p+'-pilote.js'),'utf8');
const tache=(p,g,usage)=>({source:source[p],fichier:p+'-pilote.js',shaPilote:C.sha1(source[p]),id:p,graine:g,tmax,usage,generation:null});

/* l'ordre : graine par graine (les quatre pilotes de la meme graine ensemble), pour qu'un arret en route laisse des paires completes ; le
   controle de reproductibilite d'abord (il dit tout de suite si ce Xeon joue le meme jeu que le Ryzen) */
const taches=[];
for(const g of CONTROLE.graines)for(const p of CONTROLE.pilotes)taches.push(tache(p,g,'controle'));
for(const g of graines)for(const p of PILOTES)taches.push(tache(p,g,'coffre'));

const ord=K.creer({cfg,epoque:ep,dossierEtat,travailleurs:TRAV,journal:t=>{if(/NON MESUREE|ERREUR|tronquee/.test(t))dire(t);}});
dire('coffre : '+PILOTES.join(', ')+' sur '+graines.length+' graines ('+graines[0]+' .. '+graines[graines.length-1]+'), tmax '+tmax+', regime '+(cfg.regime||'allege')+
  ', '+TRAV+' a la fois, epoque '+ep.courses+', jeu '+ep.composants.version+' '+ep.composants.jeu_sha+', node '+ep.composants.node+', tri '+ord.trieur);
let fini=0;const t0=Date.now();
process.on('SIGINT',function(){dire('Ctrl+C : plus de lancement, on attend les courses en cours');ord.arreter({dur:false}).then(()=>process.exit(1));});
const P=taches.map(t=>ord.demander([t]).then(L=>{const l=L[0];fini++;
  if(l)dire(String(fini).padStart(3)+'/'+taches.length+' '+t.id+' graine '+l.graine+' palier '+String(l.palier).padStart(2)+' survie '+String(l.survie_s).padStart(6)+' s '+
    String(l.cause).padEnd(8)+' '+(l.mesuree?'':'NON MESUREE ('+l.raison+') ')+(l._cache?'cache ':'')+'empreinte '+l.empreinte+' · '+((Date.now()-t0)/60000).toFixed(1)+' min');
  return l;}));
Promise.all(P).then(function(L){
  const st=ord.stats();
  dire('fin : '+L.filter(l=>l&&l.mesuree).length+'/'+taches.length+' mesurees · jouees '+st.jouees+' · cache '+st.cache+' · non mesurees '+st.nonMesurees+' · tuees '+st.tuees);
  process.exit(L.every(l=>l&&l.mesuree)?0:1);
},function(e){process.stderr.write(String(e&&e.message||e)+'\n');process.exit(1);});
