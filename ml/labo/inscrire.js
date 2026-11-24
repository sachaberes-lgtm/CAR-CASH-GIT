#!/usr/bin/env node
/* ===== INSCRIRE UN CANDIDAT (2026-11-24, etape 1 bis BOTS-ML) =====
   UNE commande pour qu'un cerveau entre au labo : il est note sur ses graines dans le vrai jeu (ml/bot/noter.js, un processus neuf par
   course), puis son code, sa raison, sa note, chacune de ses courses et son cout s'ecrivent au journal. Ses courses completes
   (enregistrement du jeu + touches) vont au tampon : clore.js y choisira celles qu'on garde.
   usage : node inscrire.js <cerveau.js> --etape 3 --generation 0 --modele opus-5-5 --raison "pourquoi ce changement"
             [--parents c0001,c0004] [--entree 4200 --sortie 1800 --euros 0.09] [--echange demande-reponse.json]
             [--graines 20] [--depart 910000] [--tmax 300] [--coeurs 4] [--carte ville] [--meteo nuit]
           node inscrire.js --valider c0007 [--depart 950000] [--graines 20] …   renote un candidat sur des graines jamais vues
     --modele    qui a ecrit le code : « main » (ecrit a la main, pas de cout), sinon le modele de l'API (le cout est alors exige)
     --raison    la phrase qui dit ce qui change et pourquoi : elle fait l'arbre et le recit
     --parents   le ou les candidats dont il descend (aucun : une racine)
   Les graines : depart + 37 × i (celles de noter.js). L'entrainement part de 910000 ; la validation d'ailleurs (950000 par defaut). */
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const VAL=opt('valider',null);
let fichier=A[0]&&!A[0].startsWith('--')?path.resolve(A[0]):null,ligne0=null;
if(VAL){ligne0=L.lire(L.F.cerveaux).find(l=>l.id===VAL);if(!ligne0){console.log('candidat inconnu : '+VAL);process.exit(1);}fichier=path.join(L.RACINE,ligne0.code);}
if(!fichier||!fs.existsSync(fichier)){console.log('usage : node inscrire.js <cerveau.js> --etape N --generation G --modele M --raison "…"   (detail en tete du fichier)');process.exit(1);}
const NG=+opt('graines',20),G0=+opt('depart',VAL?950000:910000),TMAX=+opt('tmax',300);
const source=fs.readFileSync(fichier,'utf8'),jeu=L.versionJeu();
if(jeu.propre===false)console.log('⚠ index.html ou figures.js differe du commit '+jeu.commit+' : un rejeu ne se refera que sur CE fichier (empreinte '+jeu.sha+')');

/* refuser AVANT de jouer 10 minutes : la meme verification que le journal, sur ce qu'on sait deja */
if(!VAL){
  const manque=[];
  if(opt('etape',null)==null)manque.push('--etape');if(opt('generation',null)==null)manque.push('--generation');
  if(!opt('modele',null))manque.push('--modele');if(String(opt('raison','')).trim().length<12)manque.push('--raison "une vraie phrase"');
  if(!L.sansCout(opt('modele','main'))&&(opt('entree',null)==null||opt('sortie',null)==null))manque.push('--entree et --sortie (les jetons de l\'API)');
  if(manque.length){console.log('il manque : '+manque.join(', '));process.exit(1);}
}
/* la note : noter.js, tel quel, avec les enregistrements complets */
fs.mkdirSync(L.D.tampon,{recursive:true});
const tmp=path.join(L.D.tampon,'note-en-cours-'+process.pid+'.json');
const args=[path.join(__dirname,'..','bot','noter.js'),fichier,'--graines',String(NG),'--depart',String(G0),'--tmax',String(TMAX),'--sortie',tmp,'--parties'];
for(const k of ['coeurs','carte','meteo','regime'])if(opt(k,null)!=null)args.push('--'+k,String(opt(k)));
/* --note <fichier> : une note DEJA faite par noter.js (avec --parties) pour ce meme code : on l'inscrit sans rejouer (la boucle note d'abord, inscrit ensuite) */
let N;
if(opt('note',null)){N=JSON.parse(fs.readFileSync(opt('note'),'utf8'));
  if(!N.parties||!N.parties.length){console.log('cette note n\'a pas ses parties (noter.js --parties) : rien n\'est inscrit');process.exit(1);}}
else{const r=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(r.status!==0||!fs.existsSync(tmp)){console.log('la note n\'a pas abouti : rien n\'est inscrit');process.exit(1);}
  N=JSON.parse(fs.readFileSync(tmp,'utf8'));fs.unlinkSync(tmp);}
const courses=N.parties.map((p,i)=>({bilan:N.courses[i],partie:p.partie,touches:p.touches}));
const commun={jeu:Object.assign({},jeu,{version:N.jeu,regime:N.regime||'max'}),graines:N.graines,tmax:N.tmax,note:N.note,courses:courses,echecs:N.echecs};
let ligne;
try{
  if(VAL)ligne=L.valider(VAL,commun);
  else{
    let echange=null;if(opt('echange',null))echange=JSON.parse(fs.readFileSync(opt('echange'),'utf8'));
    const modele=opt('modele'),nom=(source.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1]||path.basename(fichier,'.js');
    ligne=L.inscrire(Object.assign({nom:nom.replace(/[^a-z0-9-]/gi,'-'),source:source,etape:opt('etape'),generation:parseInt(opt('generation'),10),
      parents:String(opt('parents','')).split(',').map(s=>s.trim()).filter(Boolean),modele:modele,raison:opt('raison'),echange:echange,
      cout:L.sansCout(modele)?null:{entree:+opt('entree'),sortie:+opt('sortie'),euros:opt('euros',null)==null?null:+opt('euros')}},commun));
  }
}catch(e){console.log(String(e.message||e));process.exit(1);}
const enPanne=ligne.courses.filter(c=>c.pannes>0);
if(enPanne.length)console.log(`\n⚠ ${enPanne.length} course(s) avec des decisions coupees (graines ${enPanne.map(c=>c.graine).join(' ')}) : ces courses ne sont pas repetables — cerveau trop lent, ou ordinateur surcharge pendant la note`);
if(VAL)console.log(`\nVALIDATION de ${VAL} (« ${ligne0.nom} ») ecrite : ${ligne.courses.length} courses sur des graines a partir de ${G0}`);
else console.log(`\nINSCRIT : ${ligne.id} « ${ligne.nom} » · etape ${ligne.etape}, generation ${ligne.generation} · parents ${ligne.parents.join(', ')||'aucun (racine)'} · ${ligne.courses.length} courses au tampon`
  +(ligne.jumeau?`\n⚠ meme code que ${ligne.jumeau} (un jumeau)`:''));
