#!/usr/bin/env node
/* ===== REJOUER UNE COURSE GARDEE (2026-11-24, etape 1 bis BOTS-ML : « refaire n'importe quelle video plus tard ») =====
   Remet les TOUCHES d'un rejeu dans le vrai jeu sans ecran, image par image, sans le cerveau : la course doit etre la meme, au bit pres.
   usage : node rejouer.js rejeux/c0001-g910000.json [--serie etat.json]     une course (ce processus est neuf : une seule course)
           node rejouer.js --tout [--coeurs 4]                                tous les rejeux gardes, un processus neuf chacun
     --serie   ecrit l'etat de la caisse a chaque decision (10 par seconde) et l'etat du hasard a chaque image : la salle de projection s'en sert
               pour se recaler et pour dire si l'image montre la meme course
   --tout est LE CONTROLE A REFAIRE APRES CHAQUE MISE A JOUR DU JEU (« le jeu change : rejouer les champions a chaque version ») :
   un rejeu qui ne redonne plus la meme course dit que le jeu ne se conduit plus pareil.
   (2026-11-25, simulateur fidele) Chaque rejeu se rejoue dans LE SIMULATEUR DE SON ENREGISTREMENT (jeu.simulateur ; absent = « avant-relief », le
   canyon sans relief d'avant le 25/11 — ml/reel/jeu-reel.js, REQUETES). Le verdict le dit, et dit si la course passe au canyon : un rejeu d'avant le
   relief qui y passe reste EXACT dans son simulateur, mais ce n'est pas une course possible dans le vrai jeu. */
const fs=require('fs'),path=require('path'),os=require('os'),{fork}=require('child_process');
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};

function un(fichier,serie){
  const R=JSON.parse(fs.readFileSync(fichier,'utf8')),jeu=L.versionJeu();
  const {ouvrir,rejouer}=require('../bot/piloter');
  const t0=Date.now();
  /* (2026-11-25, simulateur fidele) dans LE SIMULATEUR DE SON ENREGISTREMENT (un rejeu sans le champ est d'avant le relief du canyon) : comme la version
     du jeu, la version du simulateur fait la course ; elle est dite a cote du verdict. */
  const sim=L.simulateurDe(R.jeu);
  const r=L.ensilence(()=>rejouer(ouvrir({regime:R.jeu&&R.jeu.regime,simulateur:sim}),R.graine,L.decoderTouches(R.touches),{carte:R.carte,meteo:R.meteo,tmax:R.tmax,serie:!!serie,hasard:!!serie}));
  if(serie)L.ecrireAtomique(serie,JSON.stringify({rejeu:path.basename(fichier),jeu:jeu,regime:(R.jeu&&R.jeu.regime)||'max',simulateur:sim,serie:r.serie,hasard:r.hasard})); /* d'un coup : la salle de projection peut le lire pendant ce temps */
  const f=r.partie.fin||{},meme=r.empreinte===R.empreinte&&r.images===R.images&&f.argent===R.fin.argent&&f.cause===R.fin.cause;
  return {fichier:path.basename(fichier),exact:meme,memeJeu:jeu.sha===R.jeu.sha,simulateur:sim,cartes:R.cartes||[],jeu:jeu,origine:R.jeu,empreinte:[R.empreinte,r.empreinte],images:[R.images,r.images],
    cause:[R.fin.cause,f.cause],argent:[R.fin.argent,f.argent],ms:Date.now()-t0};
}
function dit(x){
  console.log(`${x.fichier} : ${x.exact?'EXACT':'DIFFERENT'} · empreinte ${x.empreinte[0]} → ${x.empreinte[1]} · ${x.images[0]} → ${x.images[1]} images · fin ${x.cause[0]} → ${x.cause[1]} · argent ${x.argent[0]} → ${x.argent[1]}`
    +(x.simulateur!==L.SIMULATEUR?` · simulateur `+x.simulateur+(x.simulateur==='avant-relief'?' (enregistre avant le relief du canyon, 25/11 : rejoue sans lui'+((x.cartes||[]).indexOf('canyon')>=0?' — elle passe au canyon : ce n\'est PAS une course possible dans le vrai jeu)':' — elle ne passe pas au canyon)'):''):'')
    +(x.memeJeu?'':` · ⚠ le jeu n'est plus celui du rejeu (${x.origine.version} ${x.origine.sha}, commit ${x.origine.commit} → ${x.jeu.version} ${x.jeu.sha})`));
}
if(A.includes('--enfant')){process.on('message',m=>{let x;try{x=un(m.fichier);}catch(e){x={fichier:path.basename(m.fichier),erreur:String(e.message||e)};}process.send(x,()=>process.exit(0));});return;}
if(A.includes('--tout')){
  const F=fs.existsSync(L.D.rejeux)?fs.readdirSync(L.D.rejeux).filter(f=>/\.json$/.test(f)).sort().map(f=>path.join(L.D.rejeux,f)):[];
  if(!F.length){console.log('aucun rejeu garde dans '+L.D.rejeux);process.exit(1);}
  const K=Math.max(1,Math.min(F.length,+opt('coeurs',Math.max(1,Math.min(4,os.cpus().length-2)))));let i=0,finis=0,exacts=0,vieux=0;
  const lance=()=>{if(i>=F.length)return;const f=F[i++],c=fork(__filename,['--enfant'],{stdio:['ignore','ignore','pipe','ipc']});let recu=false,err9='';
    /* (2026-11-24) la sortie du jeu n'est pas lue : un tuyau jamais vide finirait par bloquer l'enfant ; on garde la fin de ses erreurs, pour dire pourquoi */
    c.stderr.on('data',x=>{err9=(err9+x).slice(-400);});
    c.on('message',x=>{recu=true;if(x.erreur)console.log(x.fichier+' : ERREUR '+x.erreur);else{dit(x);if(x.exact)exacts++;if(x.simulateur!==L.SIMULATEUR)vieux++;}});
    c.on('exit',()=>{if(!recu)console.log(path.basename(f)+' : ERREUR, le processus n\'a rien rendu'+(err9?' — '+err9.replace(/\s+/g,' ').trim().slice(-200):''));finis++;
      if(finis===F.length){console.log(`\n${exacts} rejeu(x) exact(s) sur ${F.length}`+(vieux?` (dont ${vieux} enregistre(s) avant le relief du canyon du 25/11, rejoue(s) dans le simulateur de leur enregistrement)`:''));process.exit(exacts===F.length?0:1);}else lance();});
    c.send({fichier:f});};
  for(let k=0;k<K;k++)lance();
  return;
}
const fichier=A[0]&&!A[0].startsWith('--')?(fs.existsSync(A[0])?A[0]:path.join(L.D.rejeux,A[0].replace(/\.json$/,'')+'.json')):null;
if(!fichier||!fs.existsSync(fichier)){console.log('usage : node rejouer.js <rejeu.json> [--serie etat.json]   ou   node rejouer.js --tout');process.exit(1);}
const x=un(fichier,opt('serie',null));dit(x);process.exit(x.exact?0:1);
