#!/usr/bin/env node
/* ===== LES TESTS DE L'ETAPE 1 : enfant.js, courses.js, le cache (2026-11-27, SPECIFICATION.md § 10 etape 1, INTERFACES.md § 2.1-2.2) =====
   usage : node ml/evolution/tests/courses.test.js [a] [b] [c] [d] [e] [f] [g] [h] [i]     (sans argument : tous, dans l'ordre)
     a  deux fois la meme (pilote, graine) dans deux processus neufs : meme resultat (hors ms, date, cerveau_ms_moy)
     b  6 courses de ml/ecurie/pilote-voltige.js depuis 910000 a tmax 300, 4 a la fois : palier et duree egaux a ceux de mes-pN2.json (N.courses)
     c  le maitre (la ligne de commande) tue net au milieu, puis relance : seules les courses manquantes tournent ; une ligne tronquee est ignoree
     d  un pilote qui leve au chargement, un qui boucle : courses « non mesurees », relancees une fois, sans blocage ; un qui leve dans decide :
        mesuree (erreurs > 0), comme dans noter.js (une erreur du cerveau se repete a l'identique)
     e  le cache ne rejoue jamais une cle connue (mesuree, ou deux fois non mesuree) ; une cle demandee deux fois ne se joue qu'une fois ;
        une cle deja ratee une fois est rejouee une seule fois (essai 2)
     i  (28/11/2026, lot « genes v4 ») la map imposee et les « declic », en vraies courses, une a la fois : c0025 a la grotte (20 s) et le meme pilote
        qui ajoute un « declic » a chaque ordre : memes trois empreintes (l'enveloppe retire le champ), declenchements comptes, cartes[0] grotte ;
        puis 3963000 a 120 s, carte imposee seule (grotte puis jade) et carte tenue (grotte, grotte)
   Au plus 4 courses a la fois ; tout l'etat va dans ml/evolution/essais/tests-courses/ (efface au debut de chaque test). Code 0 si tout passe. */
'use strict';
const fs=require('fs'),path=require('path'),{fork}=require('child_process');
const C=require('../commun'),K=require('../courses');

const RACINE=C.RACINE,VOLTIGE=path.join(RACINE,'ml','ecurie','pilote-voltige.js');
const BASE=path.join(C.DOSSIER,'essais','tests-courses');
const cfg=C.lireConfig();
cfg.prioriteBasse=true;
/* une epoque figee pour tout le test : un modele.js retouche par un autre pendant le test ne change pas la cle */
const EP=K.epoque(cfg,{tolererManquants:true});

const hh=()=>new Date().toTimeString().slice(0,8);
function dire(t){process.stdout.write(hh()+' '+t+'\n');}
function etatNeuf(nom){const d=path.join(BASE,nom);fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});return d;}
function lirePilote(f){const s=fs.readFileSync(f,'utf8');return {source:s,shaPilote:C.sha1(s),fichier:path.basename(f)};}
function tache(p,graine,tmax,usage){return {source:p.source,fichier:p.fichier,shaPilote:p.shaPilote,id:'test:'+p.fichier,graine,tmax,usage:usage||'essai',generation:null};}
const attendre=ms=>new Promise(r=>setTimeout(r,ms));

const resultats=[];
function verdict(nom,passe,detail){resultats.push({nom,passe,detail});dire((passe?'PASSE  ':'ECHOUE ')+nom+' : '+detail);}

/* ---------- a ---------- */
async function testA(){
  const p=lirePilote(VOLTIGE);
  const L=[];
  for(let i=0;i<2;i++){
    const ord=K.creer({cfg,epoque:EP,cache:false,ecrire:false,travailleurs:2});
    L.push((await ord.demander([tache(p,910074,50)]))[0]);
  }
  /* et deux a la fois (deux ordonnanceurs, deux processus neufs en parallele) */
  const o1=K.creer({cfg,epoque:EP,cache:false,ecrire:false,travailleurs:1}),o2=K.creer({cfg,epoque:EP,cache:false,ecrire:false,travailleurs:1});
  const [x,y]=await Promise.all([o1.demander([tache(p,910074,50)]),o2.demander([tache(p,910074,50)])]);
  L.push(x[0],y[0]);
  const sans=l=>{const r=Object.assign({},l);delete r.ms;delete r.date;delete r.cerveau_ms_moy;return JSON.stringify(r);};
  const ref=sans(L[0]),diff=L.filter(l=>sans(l)!==ref).length;
  verdict('a : meme (pilote, graine), processus neufs',diff===0&&L[0].mesuree===true,
    `${L.length} courses de la graine 910074 (50 s) : ${diff} differente(s) ; empreinte ${L.map(l=>l.empreinte).join(' ')} ; vues ${L[0].empreinteVues} ; touches ${L[0].empreinteTouches} ; palier ${L[0].palier} ; mesuree ${L[0].mesuree}`);
}

/* ---------- b ---------- */
async function testB(){
  const ref=require(path.join(__dirname,'donnees','reference-voltige-6-courses.json'));
  const N=ref.N||ref;
  const p=lirePilote(VOLTIGE);
  /* (28/11/2026, lot « genes v4 », l'integrateur) le sha de reference est celui du texte en fins de ligne Unix : une copie de travail Windows
     (core.autocrlf) a le meme pilote en fins de ligne Windows, d'un autre sha ; on compare donc aussi le texte ramene a \n */
  const memePilote=N.sha_cerveau===p.shaPilote||N.sha_cerveau===C.sha1(p.source.replace(/\r\n/g,'\n')),memeJeu=N.jeu_sha===EP.composants.jeu_sha&&N.jeu===EP.composants.version&&N.simulateur===EP.composants.simulateur;
  dire(`b : reference ${N.cerveau} ${String(N.sha_cerveau).slice(0,12)} (${memePilote?'meme pilote':'AUTRE PILOTE'}), jeu ${N.jeu} ${N.jeu_sha} (${memeJeu?'meme jeu':'AUTRE JEU'}), tmax ${N.tmax}, regime ${N.regime}`);
  const d=etatNeuf('b');
  const ord=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:4,journal:t=>{if(/lancee|NON MESUREE/.test(t))dire('   '+t);}});
  const graines=[];for(let i=0;i<6;i++)graines.push(910000+37*i);
  const t0=Date.now();
  const L=await ord.demander(graines.map(g=>tache(p,g,300)));
  let egaux=0,empreintes=0;const lignes=[];
  for(const l of L){
    const r=N.courses.find(c=>c.graine===l.graine);
    const ok=r&&l.mesuree&&l.palier===r.palier&&l.survie_s===r.duree_s;
    if(ok)egaux++;if(r&&l.empreinte===r.empreinte)empreintes++;
    lignes.push(`${l.graine} palier ${l.palier}/${r&&r.palier} duree ${l.survie_s}/${r&&r.duree_s} ${l.cause}/${r&&r.cause} empreinte ${l.empreinte===(r&&r.empreinte)?'=':'≠'}${ok?'':' ← DIFFERENT'}${l.mesuree?'':' NON MESUREE '+l.raison}`);
  }
  for(const s of lignes)dire('   '+s);
  verdict('b : 6 courses de pilote-voltige = mes-pN2.json',egaux===6&&memePilote,
    `${egaux}/6 palier et duree egaux, ${empreintes}/6 empreintes egales, ${Math.round((Date.now()-t0)/1000)} s pour 6 courses, 4 a la fois${memePilote?'':' (le pilote a change depuis mes-pN2.json)'}`);
}

/* ---------- c ---------- */
function lancerCli(d,fichierEp,n,tmax,trav){
  const c=fork(path.join(C.DOSSIER,'courses.js'),[VOLTIGE,'--graines',String(n),'--depart','910000','--tmax',String(tmax),'--travailleurs',String(trav),
    '--etat',path.relative(C.DOSSIER,d),'--epoque',fichierEp],{silent:true,windowsHide:true});
  const o={c,sortie:'',pids:[],fini:null};
  c.stdout.on('data',x=>{o.sortie+=x;for(const m of String(x).matchAll(/pid (\d+)/g))o.pids.push(+m[1]);});
  c.stderr.on('data',x=>{o.sortie+=x;});
  o.fini=new Promise(r=>c.on('exit',code=>r(code)));
  return o;
}
function lignesEtat(d){return K.lireCourses(d);}
async function testC(){
  const d=etatNeuf('c'),fEp=path.join(d,'epoque.json');
  C.ecrireAtomique(fEp,JSON.stringify(EP));
  const N=6,TM=45;
  dire('c : premier lancement, 6 graines de 45 s, 2 a la fois ; on le tue des que 2 courses sont ecrites');
  const m1=lancerCli(d,fEp,N,TM,2);
  const t0=Date.now();
  while(lignesEtat(d).length<2){
    if(Date.now()-t0>600000){m1.c.kill('SIGKILL');verdict('c : reprise apres un arret brutal',false,'2 courses non ecrites en 10 min');return;}
    await attendre(250);
  }
  process.kill(m1.c.pid,'SIGKILL');
  await m1.fini;
  const avant=lignesEtat(d);
  dire(`   maitre tue (SIGKILL) avec ${avant.length} ligne(s) ecrite(s) ; enfants lances : ${m1.pids.join(' ')} ; on attend que les orphelins finissent`);
  for(let i=0;i<600&&m1.pids.some(C.vivant);i++)await attendre(500);
  const orph=m1.pids.filter(C.vivant);
  /* un arret brutal pendant une ecriture : un bout de ligne sans fin de ligne */
  const fj=fs.readdirSync(d).filter(x=>/^courses-.*\.jsonl$/.test(x)).map(x=>path.join(d,x))[0];
  fs.appendFileSync(fj,'{"cle":"'+EP.courses+'|tronquee","mesu');
  const lus=lignesEtat(d);
  dire(`   ligne tronquee ajoutee a la main ; lireCourses en lit ${lus.length} (attendu ${avant.length})`);
  const deja=new Set(avant.filter(l=>l.mesuree).map(l=>l.graine));
  dire('   relance');
  const m2=lancerCli(d,fEp,N,TM,2);
  const code=await m2.fini;
  const apres=lignesEtat(d);
  const sortie=m2.sortie;
  const enCache=(sortie.match(/· mesuree · cache ·/g)||[]).length,lancees=(sortie.match(/course : lancee/g)||[]).length;
  const grainesLancees=[...sortie.matchAll(/course : lancee graine (\d+)/g)].map(m=>+m[1]);
  const rejouees=grainesLancees.filter(g=>deja.has(g));
  const cles=apres.map(l=>l.cle),doublons=cles.length-new Set(cles).size;
  const fragments=fs.readdirSync(d).filter(x=>/fragment/.test(x)).length;
  dire(sortie.split('\n').filter(Boolean).map(s=>'   | '+s).join('\n'));
  const ok=code===0&&lus.length===avant.length&&enCache===deja.size&&lancees===N-deja.size&&rejouees.length===0&&doublons===0&&apres.length===N&&fragments===1&&orph.length===0;
  verdict('c : reprise apres un arret brutal',ok,
    `${deja.size} course(s) faites avant le coup, ${enCache} rendue(s) du cache, ${lancees} lancee(s) a la reprise (attendu ${N-deja.size}), deja faites rejouees : ${rejouees.length}, `+
    `lignes ${apres.length} (attendu ${N}), cles en double ${doublons}, fragment mis de cote ${fragments}, orphelins encore vivants ${orph.length}, code ${code}`);
}

/* ---------- d ---------- */
async function testD(){
  const d=etatNeuf('d');
  const cfgD=Object.assign({},cfg,{chienDeGarde_s:25});
  const pL=lirePilote(path.join(__dirname,'pilotes','leve-au-chargement.js'));
  const pB=lirePilote(path.join(__dirname,'pilotes','boucle.js'));
  const pE=lirePilote(path.join(__dirname,'pilotes','leve-dans-decide.js'));
  const ord=K.creer({cfg:cfgD,epoque:EP,dossierEtat:d,travailleurs:3,journal:t=>dire('   '+t)});
  const t0=Date.now();
  const L=await ord.demander([tache(pL,910000,45),tache(pB,910000,45),tache(pE,910000,45)]);
  const s=Math.round((Date.now()-t0)/1000),st=ord.stats(),tout=lignesEtat(d);
  const [l,b,e]=L;
  const nb=k=>tout.filter(x=>x.cle===k).length;
  dire(`   leve au chargement : mesuree ${l.mesuree}, essai ${l.essai}, raison « ${l.raison} », ${nb(l.cle)} ligne(s)`);
  dire(`   boucle            : mesuree ${b.mesuree}, essai ${b.essai}, raison « ${b.raison} », ${nb(b.cle)} ligne(s)`);
  dire(`   leve dans decide  : mesuree ${e.mesuree}, erreurs ${e.erreurs}, derniereErreur « ${String(e.derniereErreur).slice(0,60)} », palier ${e.palier}, ${nb(e.cle)} ligne(s)`);
  const okL=l.mesuree===false&&/^chargement : /.test(l.raison)&&l.essai===2&&nb(l.cle)===2;
  const okB=b.mesuree===false&&b.raison==='chien de garde'&&b.essai===2&&nb(b.cle)===2;
  const okE=e.mesuree===true&&e.erreurs>0&&nb(e.cle)===1;
  verdict('d1 : pilote qui leve au chargement',okL,`non mesuree, relancee une fois, raison « ${l.raison} »`);
  verdict('d2 : pilote qui boucle (chien de garde a 25 s)',okB,`non mesuree, ${st.tuees} enfant(s) tue(s), relancee une fois, ${s} s en tout, ${ord.enCours()} enfant(s) encore en cours`);
  verdict('d3 : pilote qui leve dans decide',okE,`mesuree ${e.mesuree} avec ${e.erreurs} erreurs (regle de noter.js : une erreur du cerveau n'ecarte pas)`);
}

/* ---------- e ---------- */
async function testE(){
  const d=etatNeuf('e');
  const p=lirePilote(VOLTIGE),pL=lirePilote(path.join(__dirname,'pilotes','leve-au-chargement.js'));
  /* 1. premier passage : t1 deux fois dans la meme demande, t2 une fois */
  const t1=tache(p,910111,45),t2=tache(p,910148,45);
  const o1=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:3});
  const L1=await o1.demander([t1,t1,t2]);
  const s1=o1.stats();
  /* 2. un ordonnanceur neuf sur le meme etat : rien ne se joue */
  const o2=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:3});
  const L2=await o2.demander([t2,t1,t1]);
  const s2=o2.stats();
  const memes=JSON.stringify(L2[0])===JSON.stringify(L1[2])&&JSON.stringify(L2[1])===JSON.stringify(L1[0]);
  /* 3. une cle ratee deux fois (lignes fabriquees) n'est plus relancee ; une cle ratee une fois l'est une fois (essai 2) */
  const kA=K.cle(tache(pL,910185,45),EP),kB=K.cle(tache(pL,910222,45),EP),f=path.join(d,'courses-'+C.semaineIso(new Date())+'.jsonl');
  const faux=(k,g,essai)=>({cle:k,pilote:pL.shaPilote,id:'test',usage:'essai',generation:null,epoque:EP.courses,essai,mesuree:false,raison:'fabriquee par le test',date:new Date().toISOString(),graine:g,tmax:45});
  C.ajouterLigne(f,faux(kA,910185,1));C.ajouterLigne(f,faux(kA,910185,2));C.ajouterLigne(f,faux(kB,910222,1));
  const o3=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:3});
  const L3=await o3.demander([tache(pL,910185,45),tache(pL,910222,45)]);
  const s3=o3.stats();
  const nbB=K.lireCourses(d).filter(x=>x.cle===kB).length;
  dire(`   passage 1 : jouees ${s1.jouees}, cache ${s1.cache} ; passage 2 : jouees ${s2.jouees}, cache ${s2.cache}, lignes identiques ${memes} ; `+
    `ratee 2 fois : rendue « ${L3[0].raison} » ; ratee 1 fois : rejouee ${s3.jouees} fois, essai ${L3[1].essai}, ${nbB} lignes`);
  const ok=s1.jouees===2&&L1[0]===L1[1]&&s2.jouees===0&&s2.cache===3&&memes&&s3.jouees===1&&L3[0].raison==='fabriquee par le test'&&L3[1].essai===2&&nbB===2;
  verdict('e : le cache ne rejoue jamais une cle connue',ok,`2 cles jouees une fois chacune (t1 demandee deux fois), 0 rejouee au second passage, une cle ratee deux fois jamais relancee, une ratee une fois rejouee une fois`);
}

/* ---------- f (2026-11-27, le correcteur ; relecture robustesse « un arret qui tombe pendant que les enfants meurent ») ----------
   La DERNIERE tache d'un lot (file vide) : l'arret est demande et l'enfant meurt (Ctrl+C dans la console) : la tache doit rendre null
   (= generation interrompue), pas une ligne non mesuree qui retirerait la graine ; la ligne reste au cache (essai 1, env) ; un lancement suivant
   rejoue la cle et la mesure. */
async function testF(){
  const d=etatNeuf('f');
  const p=lirePilote(VOLTIGE);
  let stop=false,pid=null;
  const o1=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:1,doitArreter:()=>stop,journal:t=>{const m=/lancee graine \d+ pid (\d+)/.exec(t);if(m)pid=+m[1];}});
  const P=o1.demander([tache(p,910259,45)]);
  for(let i=0;i<200&&!pid;i++)await attendre(100);
  await attendre(1500);
  stop=true;try{process.kill(pid,'SIGKILL');}catch(e){}
  const L1=await P;
  const lignes=K.lireCourses(d);
  const o2=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:1});
  const L2=await o2.demander([tache(p,910259,45)]);
  const s2=o2.stats();
  dire(`   arret + enfant tue : rendu ${JSON.stringify(L1[0])} ; ${lignes.length} ligne(s) au cache (essai ${lignes[0]&&lignes[0].essai}, env ${lignes[0]&&lignes[0].env}, « ${lignes[0]&&String(lignes[0].raison).slice(0,50)} ») ; `+
    `lancement suivant : jouees ${s2.jouees}, mesuree ${L2[0].mesuree}, essai ${L2[0].essai}`);
  const ok=L1[0]===null&&lignes.length===1&&lignes[0].mesuree===false&&lignes[0].essai===1&&lignes[0].env===true&&s2.jouees===1&&L2[0].mesuree===true&&L2[0].essai===1;
  verdict('f : arret en fin de lot avec un enfant mort : tache interrompue, pas de graine perdue',ok,'null rendu, ligne env gardee, rejouee et mesuree au lancement suivant');
}

/* ---------- g (2026-11-27, le correcteur ; relecture robustesse « les echecs dus a la machine sont mis au cache pour toujours ») ----------
   Chien de garde a 4 s : deux essais tues (echec d'environnement) ; dans CE lancement la cle est finie (pas de troisieme essai) ; un lancement
   suivant avec le chien normal la rejoue et la mesure. Un echec DETERMINISTE (chargement) reste definitif (test e). */
async function testG(){
  const d=etatNeuf('g');
  const p=lirePilote(VOLTIGE);
  const o1=K.creer({cfg:Object.assign({},cfg,{chienDeGarde_s:4}),epoque:EP,dossierEtat:d,travailleurs:2});
  const L1=await o1.demander([tache(p,910296,45)]);
  const L1b=await o1.demander([tache(p,910296,45)]);
  const s1=o1.stats();
  const o2=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:2});
  const L2=await o2.demander([tache(p,910296,45)]);
  const s2=o2.stats(),tout=K.lireCourses(d);
  dire(`   chien 4 s : « ${L1[0].raison} » essai ${L1[0].essai}, env ${L1[0].env} ; redemandee dans le meme lancement : cache ${s1.cache}, jouees ${s1.jouees} ; `+
    `lancement suivant : jouees ${s2.jouees}, mesuree ${L2[0].mesuree}, essai ${L2[0].essai} ; ${tout.length} lignes`);
  const ok=L1[0].mesuree===false&&L1[0].raison==='chien de garde'&&L1[0].essai===2&&L1[0].env===true&&L1b[0].raison==='chien de garde'&&s1.jouees===2&&s1.cache===1&&
    s2.jouees===1&&L2[0].mesuree===true&&L2[0].essai===1&&tout.length===3;
  verdict('g : un echec d\'environnement ne vaut que pour son lancement',ok,'2 essais tues, pas de 3e dans le meme lancement, rejouee et mesuree au suivant');
}

/* ---------- h (2026-11-27, le correcteur ; relecture statistique « les pannes ne sont comptees que sur le dernier essai ») ----------
   Le pilote qui boucle, chien de garde a 400 s : chaque decision est coupee a 60 s, la course est abandonnee a la 2e panne (« panne »),
   relancee une fois : la ligne rendue porte pannesEssais = les pannes des DEUX essais. ~4 min, une course a la fois. */
async function testH(){
  const d=etatNeuf('h');
  const pB=lirePilote(path.join(__dirname,'pilotes','boucle.js'));
  const o=K.creer({cfg:Object.assign({},cfg,{chienDeGarde_s:400}),epoque:EP,dossierEtat:d,travailleurs:1});
  const t0=Date.now();
  const L=await o.demander([tache(pB,910000,45)]);
  const l=L[0],tout=K.lireCourses(d);
  dire(`   boucle : « ${l.raison} », essai ${l.essai}, pannes ${l.pannes}, pannesEssais ${l.pannesEssais}, env ${l.env}, ${tout.length} lignes, ${Math.round((Date.now()-t0)/1000)} s`);
  const ok=l.mesuree===false&&l.essai===2&&l.pannes>0&&l.pannesEssais===tout.reduce((s,x)=>s+(x.pannes|0),0)&&l.pannesEssais===2*l.pannes&&l.env===true;
  verdict('h : les pannes de tous les essais',ok,'pannesEssais '+l.pannesEssais+' = somme des deux essais');
}

/* ---------- i (28/11/2026, lot « genes v4 », notes/genes-v4.md § 4.5 point 3 et § 5) ----------
   Mesure (28/11, ce code) : les deux courses de 20 s ont les empreintes e2304c441f6d, 5976023aaa41, 5f46d81d87a1 et 200 decisions comptees ;
   3963000 a 120 s : imposee ['grotte','jade'], tenue ['grotte','grotte']. */
async function testI(){
  const d=etatNeuf('i');
  const p=lirePilote(VOLTIGE);
  const s1=p.source+"\n;(function(){const _d=module.exports.decide;module.exports.decide=function(v,m){const o=_d(v,m);if(o&&typeof o==='object')o.declic=['essai','essai','autre'];return o;};})();\n";
  const pD={source:s1,shaPilote:C.sha1(s1),fichier:'voltige-declic.js'};
  const o=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:1});
  const [a]=await o.demander([Object.assign(tache(p,3963000,20),{carte:'grotte'})]);
  const [b]=await o.demander([Object.assign(tache(pD,3963000,20),{carte:'grotte'})]);
  const [c]=await o.demander([Object.assign(tache(p,3963000,120),{carte:'grotte'})]);
  const [t]=await o.demander([Object.assign(tache(p,3963000,120),{carte:'grotte',carteTenue:true})]);
  const memes=a.empreinte===b.empreinte&&a.empreinteVues===b.empreinteVues&&a.empreinteTouches===b.empreinteTouches;
  dire(`   grotte 20 s : ${a.empreinte} ${a.empreinteVues} ${a.empreinteTouches} / avec declic ${b.empreinte} ${b.empreinteVues} ${b.empreinteTouches} ${JSON.stringify(b.declenchements)} ; `+
    `120 s imposee ${JSON.stringify(c.cartes)}, tenue ${JSON.stringify(t.cartes)} (${t.raison||'mesuree'})`);
  const ok=a.mesuree&&b.mesuree&&c.mesuree&&t.mesuree&&memes&&JSON.stringify(a.declenchements)==='{}'&&b.declenchements&&b.declenchements.essai>0&&b.declenchements.essai===b.declenchements.autre&&
    a.carte==='grotte'&&a.cartes[0]==='grotte'&&a.cle.endsWith('|carte:grotte')&&c.cartes.length>1&&t.cartes.length>1&&t.cartes.every(x=>x==='grotte')&&t.carteTenue===true&&c.cartes.some(x=>x!=='grotte');
  verdict('i : la map imposee, la carte tenue, les declic retires',ok,'memes empreintes avec et sans declic, declenchements comptes, premiere map imposee, carte tenue a chaque portail');
}

(async function(){
  const voulus=process.argv.slice(2).filter(x=>/^[a-i]$/.test(x));
  const T={a:testA,b:testB,c:testC,d:testD,e:testE,f:testF,g:testG,h:testH,i:testI},liste=voulus.length?voulus:Object.keys(T);
  dire(`epoque figee ${EP.courses} (jeu ${EP.composants.version} ${EP.composants.jeu_sha}, ${EP.composants.simulateur}, node ${EP.composants.node}) ; tests ${liste.join(' ')}`);
  for(const k of liste){
    try{await T[k]();}catch(e){verdict(k+' (exception)',false,String(e&&e.stack||e));}
  }
  const ko=resultats.filter(r=>!r.passe);
  dire(`=== ${resultats.length-ko.length}/${resultats.length} passent${ko.length?' ; ECHOUENT : '+ko.map(r=>r.nom).join(' | '):''}`);
  process.exit(ko.length?1:0);
})();
