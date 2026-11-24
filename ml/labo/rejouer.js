#!/usr/bin/env node
/* ===== REJOUER UNE COURSE GARDEE (2026-11-24, etape 1 bis BOTS-ML : « refaire n'importe quelle video plus tard ») =====
   Remet les TOUCHES d'un rejeu dans le vrai jeu sans ecran, image par image, sans le cerveau : la course doit etre la meme, au bit pres.
   usage : node rejouer.js rejeux/c0001-g910000.json [--serie etat.json]     une course (ce processus est neuf : une seule course)
           node rejouer.js --tout [--coeurs 4]                                tous les rejeux gardes, un processus neuf chacun
     --serie   ecrit l'etat de la caisse a chaque decision (10 par seconde) et l'etat du hasard a chaque image : la salle de projection s'en sert
               pour se recaler et pour dire si l'image montre la meme course
   --tout est LE CONTROLE A REFAIRE APRES CHAQUE MISE A JOUR DU JEU (« le jeu change : rejouer les champions a chaque version ») :
   un rejeu qui ne redonne plus la meme course dit que le jeu ne se conduit plus pareil. */
const fs=require('fs'),path=require('path'),os=require('os'),{fork}=require('child_process');
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};

function un(fichier,serie){
  const R=JSON.parse(fs.readFileSync(fichier,'utf8')),jeu=L.versionJeu();
  const {ouvrir,rejouer}=require('../bot/piloter');
  const t0=Date.now();
  const r=L.ensilence(()=>rejouer(ouvrir({regime:R.jeu&&R.jeu.regime}),R.graine,L.decoderTouches(R.touches),{carte:R.carte,meteo:R.meteo,tmax:R.tmax,serie:!!serie,hasard:!!serie}));
  if(serie)fs.writeFileSync(serie,JSON.stringify({rejeu:path.basename(fichier),jeu:jeu,serie:r.serie,hasard:r.hasard}));
  const f=r.partie.fin||{},meme=r.empreinte===R.empreinte&&r.images===R.images&&f.argent===R.fin.argent&&f.cause===R.fin.cause;
  return {fichier:path.basename(fichier),exact:meme,memeJeu:jeu.sha===R.jeu.sha,jeu:jeu,origine:R.jeu,empreinte:[R.empreinte,r.empreinte],images:[R.images,r.images],
    cause:[R.fin.cause,f.cause],argent:[R.fin.argent,f.argent],ms:Date.now()-t0};
}
function dit(x){
  console.log(`${x.fichier} : ${x.exact?'EXACT':'DIFFERENT'} · empreinte ${x.empreinte[0]} → ${x.empreinte[1]} · ${x.images[0]} → ${x.images[1]} images · fin ${x.cause[0]} → ${x.cause[1]} · argent ${x.argent[0]} → ${x.argent[1]}`
    +(x.memeJeu?'':` · ⚠ le jeu n'est plus celui du rejeu (${x.origine.version} ${x.origine.sha}, commit ${x.origine.commit} → ${x.jeu.version} ${x.jeu.sha})`));
}
if(A.includes('--enfant')){process.on('message',m=>{let x;try{x=un(m.fichier);}catch(e){x={fichier:path.basename(m.fichier),erreur:String(e.message||e)};}process.send(x,()=>process.exit(0));});return;}
if(A.includes('--tout')){
  const F=fs.existsSync(L.D.rejeux)?fs.readdirSync(L.D.rejeux).filter(f=>/\.json$/.test(f)).sort().map(f=>path.join(L.D.rejeux,f)):[];
  if(!F.length){console.log('aucun rejeu garde dans '+L.D.rejeux);process.exit(1);}
  const K=Math.max(1,Math.min(F.length,+opt('coeurs',Math.max(1,Math.min(4,os.cpus().length-2)))));let i=0,finis=0,exacts=0;
  const lance=()=>{if(i>=F.length)return;const f=F[i++],c=fork(__filename,['--enfant'],{silent:true});let recu=false;
    c.on('message',x=>{recu=true;if(x.erreur)console.log(x.fichier+' : ERREUR '+x.erreur);else{dit(x);if(x.exact)exacts++;}});
    c.on('exit',()=>{if(!recu)console.log(path.basename(f)+' : ERREUR, le processus n\'a rien rendu');finis++;
      if(finis===F.length){console.log(`\n${exacts} rejeu(x) exact(s) sur ${F.length}`);process.exit(exacts===F.length?0:1);}else lance();});
    c.send({fichier:f});};
  for(let k=0;k<K;k++)lance();
  return;
}
const fichier=A[0]&&!A[0].startsWith('--')?(fs.existsSync(A[0])?A[0]:path.join(L.D.rejeux,A[0].replace(/\.json$/,'')+'.json')):null;
if(!fichier||!fs.existsSync(fichier)){console.log('usage : node rejouer.js <rejeu.json> [--serie etat.json]   ou   node rejouer.js --tout');process.exit(1);}
const x=un(fichier,opt('serie',null));dit(x);process.exit(x.exact?0:1);
