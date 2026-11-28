/* ===== L'ETUDE « EFFETS » : FIGER LES DONNEES DE LA VRAIE EVOLUTION (27/11/2026, la tache : « tu ne touches a RIEN dans ce dossier,
   tu copies ce que tu lis si tu veux le figer (dis l'heure de ta lecture et le nombre de lignes) ») =====
   Lit (en lecture seule) le dossier etat\ de l'evolution qui tourne et en recopie ici, dans donnees/ :
   courses-*.jsonl, population.json, generations.jsonl, coffre.jsonl. Rien d'autre n'est lu ni ecrit la-bas.
   Ecrit donnees/LECTURE.json : l'heure de la lecture, la taille et le nombre de lignes de chaque fichier recopie.
   Usage : node extraire.js [dossier etat]   (par defaut le dossier de l'essai, a cote du depot : ..\CASH-CAR-evolution-essai\ml\evolution\etat)
   population-g1-debut.json n'est PAS ecrit ici : c'est population.json lu le 27/11 a 23:16:25, au debut de la generation 1, quand les 26 pilotes
   (temoin, 19 mutants, 6 nes) etaient vivants avec leurs genes mutes (avant / apres) ; la population.json de fin de generation n'a plus les renvoyes. */
'use strict';
const fs=require('fs'),path=require('path');
const SOURCE=process.argv[2]||path.resolve(__dirname,'..','..','..','..','..','..','CASH-CAR-evolution-essai','ml','evolution','etat');
const CIBLE=path.join(__dirname,'donnees');
fs.mkdirSync(CIBLE,{recursive:true});
const noms=fs.readdirSync(SOURCE).filter(n=>/^courses-.*\.jsonl$/.test(n)||['population.json','generations.jsonl','coffre.jsonl'].includes(n));
const lecture={heure:new Date().toISOString(),heureLocale:new Date().toLocaleString('fr-FR'),source:'etat\\ de l evolution du 27/11 (code e2ea8d2c9)',fichiers:{}};
for(const n of noms){
  /* une seule lecture du fichier, recopiee telle quelle : la copie est coherente avec le compte de lignes */
  const texte=fs.readFileSync(path.join(SOURCE,n),'utf8');
  fs.writeFileSync(path.join(CIBLE,n),texte);
  lecture.fichiers[n]={octets:Buffer.byteLength(texte),lignes:texte.split('\n').filter(x=>x.trim()).length};}
/* la configuration de l'evolution lancee (ml/evolution/config.json du dossier de l'essai, a cote de etat\), lue seulement */
{const c=fs.readFileSync(path.join(SOURCE,'..','config.json'),'utf8');fs.writeFileSync(path.join(CIBLE,'config.json'),c);lecture.fichiers['config.json (ml/evolution)']={octets:Buffer.byteLength(c)};}
fs.writeFileSync(path.join(CIBLE,'LECTURE.json'),JSON.stringify(lecture,null,1));
console.log(JSON.stringify(lecture,null,1));
