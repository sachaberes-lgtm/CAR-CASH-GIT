#!/usr/bin/env node
/* ===== NOTER UN CERVEAU (2026-11-23, etape 1 BOTS-ML) =====
   Un cerveau conduit N graines dans le vrai jeu ; on en tire les MEMES chiffres que ceux de l'etalon (mesures.js).
   UNE COURSE = UN PROCESSUS NEUF : c'est la condition pour que (version du jeu, graine, map, cerveau) redonne la meme course au bit pres
   (etape 0 : dans un meme processus, une course depend un peu de celles d'avant). Les courses tournent en parallele, une par coeur.
   usage : node noter.js [cerveau.js] [--graines 20] [--depart 910000] [--tmax 900] [--carte ville] [--meteo nuit] [--coeurs 2]
                         [--regime allege|max] [--sortie fichier.json] [--force] [--parties]
     cerveau.js   par defaut reference.js
     --graines    le nombre de courses (une graine = une course ; sans --carte, la graine tire aussi la map)
     --tmax       la duree maximale d'une course, en secondes de jeu. 900 par defaut depuis le 24/11 (defaut 17) : a 180 s, le palier d'un bot
                  ne pouvait pas depasser ~15 ; une course coupee est marquee « temps » et la note les compte a part (`coupees`)
     --coeurs     combien de courses a la fois (par defaut : les coeurs du PC moins deux, 4 au plus ; sur un PC partage : --coeurs 2)
     --regime     allege | max : la version du jeu (voir piloter.js, LE REGIME DU JEU). Par defaut max, comme les notes d'avant le 24/11
     --parties    garde aussi l'enregistrement complet et les touches de chaque course dans la sortie (lourd : ~150 Ko par minute de jeu)
   resultat : results/note-<nom>[-allege][-t<tmax>][-<map>].json + le tableau a l'ecran.
   (2026-11-24, defaut 5 : « node noter.js ecrasait en silence la note de reference documentee ») LE NOM DIT LE REGLAGE : la note canonique,
   results/note-<nom>.json, est celle du regime max a 300 s ; tout autre reglage ajoute -allege, -t<tmax>, -<map> au nom. Et une sortie qui
   existe deja avec d'AUTRES reglages (graines, depart, tmax, regime, map, meteo) n'est pas ecrasee sans --force.
   (2026-11-24, defauts 15 et 16) CE QUI N'ENTRE PAS DANS LA NOTE, compte a part (`ecartees`, avec la raison) et dit a l'ecran :
     · une course abandonnee ou dont des decisions ont ete coupees par la limite de temps (`pannes`) : elle n'est pas repetable ;
     · une course jouee sur une AUTRE version du jeu que celle du debut de la note (l'empreinte sha1 d'index.html + figures.js, lue par chaque
       processus avant et apres son chargement : un autre agent qui reassemble le jeu pendant la note ne mele plus deux jeux sous une etiquette).
     Une erreur du cerveau (`erreurs`) ne l'ecarte pas : elle se repete a l'identique, la course reste repetable ; elle est affichee. */
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};

if(A.includes('--enfant')){
  /* UN PROCESSUS NEUF, UNE COURSE : le jeu se charge, la course se joue, le resultat remonte. Le cerveau arrive en TEXTE (celui que le parent a lu
     une fois) : un fichier modifie pendant la note ne change pas la moitie des courses. */
  const {ouvrir,charger,course}=require('./piloter');
  process.on('message',function(m){
    const J=ouvrir({regime:m.regime}),C=charger(m.fichier,{source:m.source});
    const r=course(J,C,m.graine,{carte:m.carte,meteo:m.meteo,tmax:m.tmax});
    process.send({bilan:r.bilan,partie:r.partie,touches:r.touches,jeu:J.version,jeu_sha:J.sha,simulateur:J.simulateur,nom:C.nom},function(){process.exit(0);});
  });
  return;
}

const {barre,lignes}=require('./mesures'),{shaJeu,TMAX_DEFAUT}=require('./piloter'),{SIMULATEUR}=require('../reel/jeu-reel');
const fichier=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:path.join(__dirname,'reference.js'));
const NG=+opt('graines',20),G0=+opt('depart',910000),TMAX=+opt('tmax',TMAX_DEFAUT),CARTE=opt('carte',null),METEO=opt('meteo',null),REGIME=opt('regime','max')==='allege'?'allege':'max';
const K=Math.max(1,Math.min(NG,+opt('coeurs',Math.max(1,Math.min(4,os.cpus().length-2)))));
const SOURCE=fs.readFileSync(fichier,'utf8'),SHA_CERVEAU=crypto.createHash('sha1').update(SOURCE).digest('hex');
const SHA0=shaJeu(),V0=(fs.readFileSync(path.join(__dirname,'..','..','VERSION PRINCIPALE','sw.js'),'utf8').match(/cashcar-v\d+/)||['?'])[0];
const t0=Date.now(),graines=[];for(let i=0;i<NG;i++)graines.push(G0+i*37);
let nom=path.basename(fichier,'.js');
/* LA SORTIE, decidee AVANT de jouer (un refus apres 10 minutes de note ferait tout perdre) */
const suffixe=(REGIME!=='max'?'-allege':'')+(TMAX!==300?'-t'+TMAX:'')+(CARTE?'-'+String(CARTE).replace(/[^a-z0-9-]/gi,'')+(METEO?'-'+String(METEO).replace(/[^a-z0-9-]/gi,''):''):'');
const SORTIE=path.resolve(opt('sortie',path.join(__dirname,'results','note-'+nom+suffixe+'.json')));
if(fs.existsSync(SORTIE)&&!A.includes('--force')){
  let v=null;try{v=JSON.parse(fs.readFileSync(SORTIE,'utf8'));}catch(e){}
  const pareil=v&&v.graines&&v.graines.n===NG&&v.graines.depart===G0&&v.tmax===TMAX&&(v.regime||'max')===REGIME&&(v.carte||null)===CARTE&&(v.meteo||null)===METEO&&(v.simulateur||'avant-relief')===SIMULATEUR; /* (25/11) une note d'un autre simulateur n'est pas ecrasee non plus */
  if(!pareil){console.log(`${path.relative(process.cwd(),SORTIE)} existe deja`+(v?` avec d'autres reglages (${v.graines&&v.graines.n} graines depuis ${v.graines&&v.graines.depart}, ${v.tmax} s, regime ${v.regime||'max'}${v.carte?', map '+v.carte:''})`:' (illisible)')+
    ` : rien n'est joue. Choisir --sortie autre.json, ou --force pour l'ecraser.`);process.exit(1);}
}
console.log(`cerveau ${path.basename(fichier)} · ${NG} graines a partir de ${G0} · ${TMAX} s au plus${opt('tmax',null)==null?' (par defaut : la limite ne plafonne plus le palier)':''} · ${K} courses a la fois · regime ${REGIME}${CARTE?' · map '+CARTE+(METEO?'/'+METEO:''):''} · jeu ${V0} ${SHA0}`);

const R=new Array(NG);let suivant=0,finis=0;
function ligne(b){return `graine ${b.graine} · ${String(b.cartes.join('>')).padEnd(22)} ${String(b.duree_s).padStart(6)} s · ${String(b.cause).padEnd(8)} palier ${String(b.palier).padStart(2)} · pieces ${String(b.pieces).padStart(4)} · argent ${String(Math.round(b.argent)).padStart(6)} · figures ${String(b.figures_payees).padStart(2)} · air ${String(b.air_pct).padStart(4)} % · raccourcis ${b.raccourcis} · x${b.foisTempsReel}${b.pannes?' · PANNES '+b.pannes:''}${b.erreurs?' · ERREURS DU CERVEAU '+b.erreurs+' ('+String(b.derniereErreur).slice(0,60)+')':''}`;}
function lance(){
  if(suivant>=NG)return;
  const i=suivant++,g=graines[i];
  const c=fork(__filename,['--enfant'],{silent:true}); /* silent : le jeu bavarde au chargement, on ne garde que le resultat */
  let recu=false;
  c.on('message',function(m){recu=true;R[i]=m;nom=m.nom;console.log(ligne(m.bilan));});
  let err9='';if(c.stderr)c.stderr.on('data',function(x){err9=(err9+x).slice(-600);});
  c.on('exit',function(code,sig){if(!recu)console.log('   (processus fini : code '+code+(sig?', signal '+sig:'')+') '+err9.replace(/\s+/g,' ').slice(-300));
    if(!recu){R[i]=null;console.log(`graine ${g} · ERREUR : le processus n'a rien rendu`);}
    finis++;if(finis===NG)bilan();else lance();});
  c.send({fichier:fichier,source:SOURCE,graine:g,carte:CARTE,meteo:METEO,tmax:TMAX,regime:REGIME});
}
/* pourquoi une course n'entre pas dans la note (null : elle y entre) */
function pourquoiEcartee(m){
  const b=m.bilan;
  if(b.pannes>0||b.cause==='panne')return `${b.pannes} decision(s) coupee(s) par la limite de temps${b.cause==='panne'?', course abandonnee':''} : pas repetable`;
  if(!m.jeu_sha)return 'le jeu a ete reecrit pendant son chargement (empreinte instable)';
  if(m.simulateur!==SIMULATEUR)return `jouee dans un autre simulateur (${m.simulateur}, la note est faite dans ${SIMULATEUR})`;
  if(m.jeu_sha!==SHA0||m.jeu!==V0)return `jouee sur un autre jeu (${m.jeu} ${m.jeu_sha}, la note est sur ${V0} ${SHA0})`;
  return null;}
function bilan(){
  const ok=R.filter(Boolean);
  if(!ok.length){console.log('aucune course n\'a abouti');process.exit(1);}
  const ecartees=[],bonnes=[];
  for(const m of ok){const p=pourquoiEcartee(m);if(p){ecartees.push({graine:m.bilan.graine,raison:p});m.bilan.ecartee=p;}else bonnes.push(m);}
  if(ecartees.length){console.log(`\n⚠ ${ecartees.length} course(s) HORS de la note :`);for(const e of ecartees)console.log(`   graine ${e.graine} : ${e.raison}`);}
  const erreurs=ok.filter(m=>m.bilan.erreurs>0);
  if(erreurs.length)console.log(`⚠ ${erreurs.length} course(s) avec des ERREURS DU CERVEAU (repetables, comptees dans la note) : graines ${erreurs.map(m=>m.bilan.graine).join(' ')}`);
  if(!bonnes.length){console.log('aucune course valable : pas de note');process.exit(1);}
  const B=barre(bonnes.map(r=>r.partie));
  console.log('\n=== NOTE de « '+nom+' » ('+V0+' '+SHA0+', regime '+REGIME+', simulateur '+SIMULATEUR+', '+TMAX+' s au plus) sur '+bonnes.length+' course(s) ===\n'+lignes(B).join('\n'));
  fs.mkdirSync(path.dirname(SORTIE),{recursive:true});
  delete B.detail;
  /* courses et parties restent ALIGNEES (meme indice) et comptent TOUTES les courses rendues ; `note` ne compte que les bonnes */
  fs.writeFileSync(SORTIE,JSON.stringify({date:new Date().toISOString(),jeu:V0,jeu_sha:SHA0,cerveau:nom,sha_cerveau:SHA_CERVEAU,graines:{n:NG,depart:G0,pas:37},tmax:TMAX,regime:REGIME,carte:CARTE,meteo:METEO,simulateur:SIMULATEUR,
    note:B,courses:ok.map(r=>r.bilan),echecs:NG-ok.length,ecartees:ecartees,
    parties:A.includes('--parties')?ok.map(r=>({partie:r.partie,touches:r.touches})):undefined},null,1));
  console.log('\necrit :',path.relative(process.cwd(),SORTIE),'·',Math.round((Date.now()-t0)/1000),'s');
  process.exit(0);
}
for(let k=0;k<K;k++)lance();
