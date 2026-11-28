#!/usr/bin/env node
/* ===== VITESSE : LA PREUVE D'UNE ACCELERATION « SANS EFFET », SUR N COURSES DEJA CONNUES (2026-11-27, etude « vitesse ») =====
   PAS LANCE dans cette etude (le PC est occupe ; la tache n'autorisait que 4 courses) : c'est l'outil propose pour prouver une acceleration (a)
   avant de la mettre dans ml/evolution. Seul le mode --a-sec (aucune course : il dit ce qu'il jouerait) a ete essaye.
   Principe : on reprend N lignes MESUREES d'un journal courses-*.jsonl (pilote, graine, tmax, et ses trois empreintes), on rejoue chacune
   dans un processus neuf avec l'acceleration (chronometrer.js et ses options, par exemple --sans-ciel), et on exige les MEMES
   empreinte, empreinteVues, empreinteTouches. Une seule difference = l'acceleration change les courses : on la jette.
   Le choix des lignes : le plus de maps et de fins differentes possible (une ligne par cause de mort tant qu'il y en a, puis les plus longues),
   et toujours la tmax de la ligne (une course coupee plus tot ne se compare pas).
   Usage : node preuve-identite.js --lignes <courses.jsonl> --pilotes <dossier pilotes/> [--n 24] [--options "--sans-ciel"] [--a-sec]
     Le pilote d'une ligne est <pilotes>/<sha12>.js (etat/pilotes de l'evolution : ces fichiers sont le texte exact envoye a l'enfant).
     Ne lit jamais etat/ d'une evolution en marche directement : passer une COPIE (comme donnees/ ici). Une course a la fois.
   Sortie : preuve-<date>.json dans ce dossier, et une ligne par course a l'ecran. Code 0 si toutes identiques. */
'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const lignes=opt('lignes',null),pilotes=opt('pilotes',null),N=+opt('n',24),options=(opt('options','--sans-ciel')||'').split(/\s+/).filter(Boolean),aSec=A.includes('--a-sec');
if(!lignes||!pilotes){process.stderr.write('usage : node preuve-identite.js --lignes <courses.jsonl> --pilotes <dossier> [--n 24] [--options "--sans-ciel"] [--a-sec]\n');process.exit(2);}
const L=fs.readFileSync(lignes,'utf8').split('\n').filter(Boolean).map(JSON.parse).filter(l=>l.mesuree&&l.empreinte&&fs.existsSync(path.join(pilotes,l.pilote.slice(0,12)+'.js')));
/* le choix : une ligne par cause (la plus courte d'abord : c'est la moins chere), puis les plus longues, sans deux fois la meme graine */
const choix=[],graines=new Set();
const parCause=new Map();for(const l of L.slice().sort((a,b)=>a.survie_s-b.survie_s)){if(!parCause.has(l.cause))parCause.set(l.cause,l);}
for(const l of parCause.values()){if(choix.length>=N)break;if(graines.has(l.graine))continue;choix.push(l);graines.add(l.graine);}
for(const l of L.slice().sort((a,b)=>b.survie_s-a.survie_s)){if(choix.length>=N)break;if(graines.has(l.graine))continue;choix.push(l);graines.add(l.graine);}
const jeu=choix.reduce((s,l)=>s+l.survie_s,0);
process.stdout.write('preuve : '+choix.length+' courses ('+parCause.size+' causes de fin differentes dans le journal), '+Math.round(jeu)+' s de jeu, options '+JSON.stringify(options)+(aSec?' — A SEC, rien n\'est joue':'')+'\n');
const R=[];let ko=0;
for(const l of choix){
  const pil=path.join(pilotes,l.pilote.slice(0,12)+'.js');
  if(aSec){process.stdout.write('  jouerait '+l.id+' graine '+l.graine+' tmax '+l.tmax+' ('+l.survie_s+' s, '+l.cause+') attendu '+l.empreinte+'/'+l.empreinteVues+'/'+l.empreinteTouches+'\n');continue;}
  const p=spawnSync(process.execPath,[path.join(__dirname,'chronometrer.js'),pil,String(l.graine),String(l.tmax)].concat(options),{encoding:'utf8',maxBuffer:1<<24,windowsHide:true});
  let r=null;try{r=JSON.parse(String(p.stdout).split('\n')[0]);}catch(e){r=null;}
  const ok=!!r&&r.empreinte===l.empreinte&&r.empreinteVues===l.empreinteVues&&r.empreinteTouches===l.empreinteTouches;
  if(!ok)ko++;
  R.push({id:l.id,graine:l.graine,tmax:l.tmax,attendu:[l.empreinte,l.empreinteVues,l.empreinteTouches],obtenu:r?[r.empreinte,r.empreinteVues,r.empreinteTouches]:null,identique:ok,total_ms:r?r.total_ms:null});
  process.stdout.write('  '+(ok?'IDENTIQUE ':'DIFFERENTE')+' '+l.id+' graine '+l.graine+' ('+l.survie_s+' s, '+l.cause+')'+(r?' '+Math.round(r.total_ms/1000)+' s':'  (pas de resultat : '+String(p.stderr).slice(-200)+')')+'\n');
}
if(!aSec){fs.writeFileSync(path.join(__dirname,'preuve-'+new Date().toISOString().slice(0,10)+'.json'),JSON.stringify({options,courses:R,differentes:ko},null,1)+'\n');
  process.stdout.write('bilan : '+(R.length-ko)+'/'+R.length+' identiques\n');process.exit(ko?1:0);}
