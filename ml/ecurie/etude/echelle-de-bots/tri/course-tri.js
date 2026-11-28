#!/usr/bin/env node
/* ===== UNE COURSE DE c0025 AVEC SA PARTIE ENREGISTREE (28/11/2026, etude « l'echelle de bots », le mesureur du test B) =====
   Un processus = une course, exactement comme ml/evolution/enfant.js (jouer : ouvrir le jeu en allege, charger le pilote en texte, envelopper les
   compteurs, optionsCourse({tmax}), piloter.course, resultatCompact) ; rien de ml/evolution ni de ml/bot n'est modifie : ce fichier les REQUIERT.
   En plus : la partie complete (r.partie, le format cashcar-jeurec-1 que lit discerner.js) et les touches sont gardees.
   usage : node ml/ecurie/etude/echelle-de-bots/tri/course-tri.js --graine 3000037 [--pilote banc|actuel] [--tmax 900] [--sortie f.json.gz]
     --pilote banc   : le texte exact du bras « depart » du banc des genes (banc-des-genes/etat/pilotes/6e05036f219e.js) ;
     --pilote actuel : le texte que la selection ecrit aujourd'hui pour le temoin c0025 (Gn.ecrirePilote(Gn.genomeTemoin(cfg temoin c0025))).
   stdout : une ligne JSON (le resultat compact) ; stderr : le bavardage du jeu. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const RACINE=path.resolve(__dirname,'..','..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const ecrire=process.stdout.write.bind(process.stdout);
const versErr=function(){process.stderr.write(Array.prototype.map.call(arguments,String).join(' ')+'\n');};
console.log=versErr;console.info=versErr;console.warn=versErr;
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
const GRAINE=+opt('graine',NaN),TMAX=+opt('tmax',900),QUEL=opt('pilote','banc'),SORTIE=opt('sortie',null);
if(!(GRAINE>=0)||!(TMAX>0)||['banc','actuel'].indexOf(QUEL)<0){versErr('usage : node course-tri.js --graine N [--pilote banc|actuel] [--tmax 900] [--sortie f]');process.exit(1);}
const Cm=require(path.join(EVO,'commun')),Gn=require(path.join(EVO,'genome'));
let texte;
if(QUEL==='banc')texte=fs.readFileSync(path.join(RACINE,'ml','ecurie','etude','banc-des-genes','etat','pilotes','6e05036f219e.js'),'utf8');
else{const cfg=Cm.lireConfig(null),cfgT=Object.assign({},cfg,{temoin:'c0025'});texte=Gn.ecrirePilote(Gn.genomeTemoin(cfgT),{cfg:cfgT});}
const {envelopper,resultatCompact,optionsCourse}=require(path.join(EVO,'enfant'));
const {ouvrir,charger,course}=require(path.join(RACINE,'ml','bot','piloter'));
const J=ouvrir({regime:'allege'});
const C=charger('evolution.js',{source:texte});
const compte=envelopper(C);
const oc=optionsCourse({tmax:TMAX});
const t0=Date.now();
const r=course(J,C,GRAINE,oc);
const res=resultatCompact(r,J,C,GRAINE,compte);
res.tmax=TMAX;res.pilote=QUEL;res.shaPilote=Gn.shaPilote(texte);res.msMur=Date.now()-t0;
if(SORTIE){fs.mkdirSync(path.dirname(path.resolve(SORTIE)),{recursive:true});
  fs.writeFileSync(SORTIE,zlib.gzipSync(JSON.stringify({resultat:res,partie:r.partie,touches:r.touches})));}
ecrire(JSON.stringify(res)+'\n');
process.exit(0);
