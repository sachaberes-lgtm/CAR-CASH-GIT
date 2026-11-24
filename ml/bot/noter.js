#!/usr/bin/env node
/* ===== NOTER UN CERVEAU (2026-11-23, etape 1 BOTS-ML) =====
   Un cerveau conduit N graines dans le vrai jeu ; on en tire les MEMES chiffres que ceux de l'etalon (mesures.js).
   UNE COURSE = UN PROCESSUS NEUF : c'est la condition pour que (version du jeu, graine, map, cerveau) redonne la meme course au bit pres
   (etape 0 : dans un meme processus, une course depend un peu de celles d'avant). Les courses tournent en parallele, une par coeur.
   usage : node noter.js [cerveau.js] [--graines 20] [--depart 910000] [--tmax 180] [--carte ville] [--meteo nuit] [--coeurs 4]
                         [--sortie fichier.json] [--parties]
     cerveau.js   par defaut reference.js
     --graines    le nombre de courses (une graine = une course ; sans --carte, la graine tire aussi la map)
     --tmax       la duree maximale d'une course, en secondes de jeu
     --coeurs     combien de courses a la fois (par defaut : les coeurs du PC moins deux, 4 au plus)
     --regime     allege | max : la version du jeu (voir piloter.js, LE REGIME DU JEU). Par defaut max, comme les notes d'avant le 24/11
     --parties    garde aussi l'enregistrement complet et les touches de chaque course dans la sortie (lourd : ~150 Ko par minute de jeu)
   resultat : results/note-<nom>.json (dans git : « ce qui n'est pas dans git n'existe pas ») + le tableau a l'ecran. */
const fs=require('fs'),path=require('path'),os=require('os'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};

if(A.includes('--enfant')){
  /* UN PROCESSUS NEUF, UNE COURSE : le jeu se charge, la course se joue, le resultat remonte */
  const {ouvrir,charger,course}=require('./piloter');
  process.on('message',function(m){
    const J=ouvrir({regime:m.regime}),C=charger(m.fichier);
    const r=course(J,C,m.graine,{carte:m.carte,meteo:m.meteo,tmax:m.tmax});
    process.send({bilan:r.bilan,partie:r.partie,touches:r.touches,jeu:J.version,nom:C.nom},function(){process.exit(0);});
  });
  return;
}

const {barre,lignes}=require('./mesures');
const fichier=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:path.join(__dirname,'reference.js'));
const NG=+opt('graines',20),G0=+opt('depart',910000),TMAX=+opt('tmax',180),CARTE=opt('carte',null),METEO=opt('meteo',null),REGIME=opt('regime','max')==='allege'?'allege':'max';
const K=Math.max(1,Math.min(NG,+opt('coeurs',Math.max(1,Math.min(4,os.cpus().length-2)))));
const t0=Date.now(),graines=[];for(let i=0;i<NG;i++)graines.push(G0+i*37);
console.log(`cerveau ${path.basename(fichier)} · ${NG} graines a partir de ${G0} · ${TMAX} s au plus · ${K} courses a la fois · regime ${REGIME}${CARTE?' · map '+CARTE+(METEO?'/'+METEO:''):''}`);

const R=new Array(NG);let suivant=0,finis=0,jeu='?',nom=path.basename(fichier,'.js');
function ligne(b){return `graine ${b.graine} · ${String(b.cartes.join('>')).padEnd(22)} ${String(b.duree_s).padStart(6)} s · ${String(b.cause).padEnd(8)} palier ${String(b.palier).padStart(2)} · pieces ${String(b.pieces).padStart(4)} · argent ${String(Math.round(b.argent)).padStart(6)} · figures ${String(b.figures_payees).padStart(2)} · air ${String(b.air_pct).padStart(4)} % · raccourcis ${b.raccourcis} · x${b.foisTempsReel}${b.pannes?' · PANNES '+b.pannes:''}`;}
function lance(){
  if(suivant>=NG)return;
  const i=suivant++,g=graines[i];
  const c=fork(__filename,['--enfant'],{silent:true}); /* silent : le jeu bavarde au chargement, on ne garde que le resultat */
  let recu=false;
  c.on('message',function(m){recu=true;R[i]=m;jeu=m.jeu;nom=m.nom;console.log(ligne(m.bilan));});
  c.on('exit',function(){
    if(!recu){R[i]=null;console.log(`graine ${g} · ERREUR : le processus n'a rien rendu`);}
    finis++;if(finis===NG)bilan();else lance();});
  c.send({fichier:fichier,graine:g,carte:CARTE,meteo:METEO,tmax:TMAX,regime:REGIME});
}
function bilan(){
  const ok=R.filter(Boolean);
  if(!ok.length){console.log('aucune course n\'a abouti');process.exit(1);}
  const B=barre(ok.map(r=>r.partie));
  console.log('\n=== NOTE de « '+nom+' » ('+jeu+') ===\n'+lignes(B).join('\n'));
  const sortie=path.resolve(opt('sortie',path.join(__dirname,'results','note-'+nom+'.json')));
  fs.mkdirSync(path.dirname(sortie),{recursive:true});
  delete B.detail;
  fs.writeFileSync(sortie,JSON.stringify({date:new Date().toISOString(),jeu:jeu,cerveau:nom,graines:{n:NG,depart:G0,pas:37},tmax:TMAX,regime:REGIME,carte:CARTE,meteo:METEO,
    note:B,courses:ok.map(r=>r.bilan),echecs:NG-ok.length,
    parties:A.includes('--parties')?ok.map(r=>({partie:r.partie,touches:r.touches})):undefined},null,1));
  console.log('\necrit :',path.relative(process.cwd(),sortie),'·',Math.round((Date.now()-t0)/1000),'s');
  process.exit(0);
}
for(let k=0;k<K;k++)lance();
