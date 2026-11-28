#!/usr/bin/env node
/* ===== LE BANC DES GENES : LES COURSES (2026-11-28, l'agent « banc des genes » : « mesurer chaque interrupteur ALLUME contre le pilote de depart,
   sur les memes graines ») =====
   Le genome de la selection (ml/evolution/genome.js, v:3) porte neuf interrupteurs eteints a la naissance : cinq gestes des joueurs (lacheOn,
   slalomOn, coupOn, relacheOn, suitOn) et quatre idees de la boucle payante (fuirVite, bordOn, largeOn, libreOn). On ne sait d'aucun s'il aide.
   Ce script joue des « bras » (un pilote chacun, ecrit par Gn.ecrirePilote comme le fait la selection) sur les MEMES graines :
     depart   = le genome du temoin c0025 (Gn.genomeTemoin, temoin 'c0025' : tous les interrupteurs eteints) ;
     un bras par interrupteur = le meme genome, CE drapeau a 1, ses reglages a leur valeur de naissance ;
     c0026    = fuirVite ET dessousMax .8 -> .4 ET dessousPose 25 -> 40 (l'etape c0026 de la boucle payante, notes/portage.md) ;
     gestes5  = les cinq gestes allumes ensemble ;
     c0101    = le genome du temoin c0101 (Gn.genomeTemoin, temoin 'c0101').
   Les graines : une plage A PART, 3 000 000 + 37 j (entrainement 910000…, validation 950000… et a partir de 1 000 000, coffre 990000…).
   tmax et regime : ml/evolution/config.json. Les courses passent par l'ordonnanceur de ml/evolution/courses.js (un processus neuf par course,
   priorite basse, chien de garde, cache) avec un dossier d'etat A NOUS (./etat, jamais ml/evolution/etat).
   L'ordre : graine par graine (tous les bras sur la graine 1, puis tous sur la graine 2…) : un arret en route laisse des graines completes.
   En plus, un controle : ml/ecurie/pilote-voltige.js (le c0025 ecrit a la main) sur les deux premieres graines ; ses empreintes doivent etre
   celles du bras depart (analyser.js le dit).
   Reprise : relancer la meme commande ; une course deja mesuree vient du cache et n'est pas rejouee (dans la meme epoque des courses : si
   ml/evolution/modele.js ou enfant.js, le jeu, les yeux ou node changent, l'epoque change et tout se rejoue ; on le dit au lancement).
   Arret propre : creer le fichier STOP dans le dossier d'etat ; les courses en cours finissent, rien d'autre ne part ; STOP est efface ensuite.
   Ctrl+C fait de meme.
   Usage : node ml/ecurie/etude/banc-des-genes/jouer.js [--travailleurs 4] [--graines 96] [--bras a,b,c] [--depart 3000000] [--etat etat]
           [--verifier]   (--verifier : ecrit etat/bras.json et fait les controles, sans jouer aucune course)
   Codes de sortie : 0 tout mesure ; 1 erreur ou course non mesuree ; 2 refus de partir (verrou, STOP deja la, controle rate) ; 3 arret demande. */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.resolve(__dirname,'..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const C=require(path.join(EVO,'commun'));
const K=require(path.join(EVO,'courses'));
const Gn=require(path.join(EVO,'genome'));

const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0&&A[i+1]!=null?A[i+1]:d;};
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const refuser=(t,code)=>{process.stderr.write('jouer : '+t+'\n');process.exit(code==null?2:code);};

const TRAV=Math.max(1,Math.floor(+opt('travailleurs',4)||4));
const NG=Math.max(1,Math.floor(+opt('graines',96)||96));
const G0=Math.floor(+opt('depart',3000000));
const PAS=37;
const VERIFIER_SEUL=A.includes('--verifier');
if(!(G0>=0))refuser('--depart doit etre un entier positif');
/* (2026-11-28) la plage du banc ne doit croiser aucune graine de la selection : entrainement 910000 + 37 j (j < 1081), validation 1 000 000 + 37 k
   (et son repli 950000…), coffre 990000… : tout est sous 1 040 000 tant que la validation n'a pas fait 1 000 paquets. 3 000 000 est loin au-dessus. */
if(G0<2000000)refuser('--depart '+G0+' : la plage du banc doit rester au-dessus de 2 000 000 (les graines de la selection sont en dessous)');

const cfg=C.lireConfig(null);
const dossierEtat=path.resolve(__dirname,opt('etat','etat'));
if(path.resolve(dossierEtat)===path.resolve(C.chemin(cfg,cfg.dossierEtat))||path.resolve(dossierEtat).startsWith(path.resolve(EVO)+path.sep))
  refuser('jamais dans ml/evolution : choisir un autre --etat');
const tmax=cfg.tmax;
const graines=[];for(let j=0;j<NG;j++)graines.push(G0+PAS*j);

/* ===== LES BRAS (2026-11-28, l'agent « banc des genes ») ===== */
const cfgT=Object.assign({},cfg,{temoin:'c0025'});
const ID_TEMOIN_C0025='19e3767cc346';   /* l'identifiant du genome du temoin, inchange depuis l'etape 2 (INTERFACES.md § 9.3, § 10.1) */
const INTERRUPTEURS=['lacheOn','slalomOn','coupOn','relacheOn','suitOn','fuirVite','bordOn','largeOn','libreOn'];
const GESTES5=['lacheOn','slalomOn','coupOn','relacheOn','suitOn'];
/* les reglages d'un interrupteur : les genes qui le suivent dans GESTES ou PORTAGE, jusqu'au prochain interrupteur */
const REGLAGES_DE={};
for(const liste of [Gn.GESTES,Gn.PORTAGE]){let cour=null;
  for(const b of liste){if(INTERRUPTEURS.includes(b.cle)){cour=b.cle;REGLAGES_DE[cour]=[];}else if(cour)REGLAGES_DE[cour].push(b);}}
for(const n of INTERRUPTEURS)if(!REGLAGES_DE[n])throw new Error('jouer : interrupteur « '+n+' » absent de genome.js (GESTES / PORTAGE)');
const PAR_CLE={};for(const b of Gn.BORNES)PAR_CLE[b.cle]=b;

const T0=Gn.genomeTemoin(cfgT);
const copie=g=>JSON.parse(JSON.stringify(g));
/* le genome de depart, modifie de `changes`, repare et valide ; chaque valeur demandee doit survivre a reparer */
function avec(changes){
  const g=copie(T0);
  for(const [k,v] of Object.entries(changes)){if(!PAR_CLE[k])throw new Error('jouer : gene inconnu « '+k+' »');g.A[k]=v;}
  Gn.reparer(g,cfgT);
  const d=Gn.valider(g,cfgT);if(d)throw new Error('jouer : genome non conforme : '+d);
  for(const [k,v] of Object.entries(changes))if(g.A[k]!==v)throw new Error('jouer : « '+k+' » = '+v+' ne survit pas a reparer ('+g.A[k]+')');
  return g;}
/* un interrupteur allume, ses reglages a leur naissance */
const allume=noms=>{const ch={};for(const n of noms){ch[n]=1;for(const b of REGLAGES_DE[n])ch[b.cle]=b.naissance;}return ch;};

const DEFS=[
  {nom:'depart',dit:'le temoin c0025 (pilote-voltige), tous les interrupteurs eteints',g:()=>avec({})},
  {nom:'lacheOn',dit:'geste 1 : lacher le volant juste avant la pose sur la dalle',g:()=>avec(allume(['lacheOn']))},
  {nom:'slalomOn',dit:'geste 2 : le slalom demande par le pilote (cap alterne, horizon allonge)',g:()=>avec(allume(['slalomOn']))},
  {nom:'coupOn',dit:'geste 3 : le coup de nitro bref en vol, version serree',g:()=>avec(allume(['coupOn']))},
  {nom:'relacheOn',dit:'geste 4 : garder la nitro un instant apres un decollage nitro tenue, puis la lacher',g:()=>avec(allume(['relacheOn']))},
  {nom:'suitOn',dit:'geste 5 : au sol apres la pose, la ligne suit la glisse de la caisse',g:()=>avec(allume(['suitOn']))},
  {nom:'gestes5',dit:'les cinq gestes allumes ensemble',g:()=>avec(allume(GESTES5))},
  {nom:'fuirVite',dit:'boucle payante, idee de c0026 seule : sous la dalle, fuir tout de suite vers un rayon qui se pose',g:()=>avec(allume(['fuirVite']))},
  {nom:'c0026',dit:'l\'etape c0026 entiere : fuirVite, dessousMax .8 -> .4, dessousPose 25 -> 40',g:()=>avec(Object.assign(allume(['fuirVite']),{dessousMax:.4,dessousPose:40})),
    egalA:'c0026'},
  {nom:'bordOn',dit:'boucle payante, idee de c0064 : decoller nitro allumee quand le bord arrive (maps sans decor)',g:()=>avec(allume(['bordOn']))},
  {nom:'largeOn',dit:'boucle payante, idee de c0072 (reglages de c0101) : des figures dans les vols subis bien partis',g:()=>avec(allume(['largeOn']))},
  {nom:'libreOn',dit:'boucle payante, idee de c0087 : la nitro deja allumee tenue plus longtemps en virage (maps sans decor)',g:()=>avec(allume(['libreOn']))},
  {nom:'c0101',dit:'le genome du temoin c0101 (le dernier champion de la boucle payante : les quatre idees et les reglages de c0026)',
    g:()=>Gn.genomeTemoin(Object.assign({},cfg,{temoin:'c0101'})),egalA:'c0101'}];
const NOMS=DEFS.map(d=>d.nom);
let choisis=NOMS;
if(opt('bras',null)){
  const v=String(opt('bras')).split(',').map(s=>s.trim()).filter(Boolean);
  for(const n of v)if(!NOMS.includes(n))refuser('bras inconnu « '+n+' » (connus : '+NOMS.join(', ')+')');
  choisis=NOMS.filter(n=>n==='depart'||v.includes(n));   /* depart toujours : tout se compare a lui */
}

/* ===== LES CONTROLES DES BRAS ===== */
const verifs=[];let rate=false;
const verif=(ok,t)=>{verifs.push({ok:!!ok,dit:t});if(!ok)rate=true;dire((ok?'controle OK : ':'CONTROLE RATE : ')+t);};
/* 1. tous les reglages des gestes et du portage sont a leur naissance chez le temoin : un interrupteur allume apporte bien sa naissance */
{const pas=[];for(const n of INTERRUPTEURS)for(const b of REGLAGES_DE[n])if(T0.A[b.cle]!==b.naissance)pas.push(b.cle+'='+T0.A[b.cle]);
  for(const n of INTERRUPTEURS)if(T0.A[n]!==0)pas.push(n+'='+T0.A[n]);
  verif(!pas.length,'le temoin c0025 a ses neuf interrupteurs a 0 et leurs reglages a la naissance'+(pas.length?' (faux : '+pas.join(', ')+')':''));}
const bras=[];
const depart=DEFS[0].g();
const diff=g=>{const o={};for(const b of Gn.BORNES)if(g.A[b.cle]!==depart.A[b.cle])o[b.cle]=[depart.A[b.cle],g.A[b.cle]];
  for(const t of ['WV','WS'])if(g[t].some((x,i)=>x!==depart[t][i]))o[t]=['tete du depart','autre tete'];return o;};
for(const d of DEFS){
  if(!choisis.includes(d.nom))continue;
  const g=d.g(),texte=Gn.ecrirePilote(g,{cfg:cfgT});
  const b={nom:d.nom,dit:d.dit,differences:diff(g),genome:Gn.idDe(g),shaPilote:Gn.shaPilote(texte),texte};
  if(d.egalA){const T=Gn.genomeTemoin(Object.assign({},cfg,{temoin:d.egalA}));
    b.egalTemoin=d.egalA;b.memeGenomeQueLeTemoin=Gn.shaGenome(T)===Gn.shaGenome(g);
    verif(b.memeGenomeQueLeTemoin,'le bras '+d.nom+' a le genome de Gn.genomeTemoin(temoin '+d.egalA+') ('+Gn.idDe(T)+' / '+b.genome+')');}
  bras.push(b);
}
/* 2. le pilote du bras depart est celui que la selection ecrit pour le temoin c0025 (evoluer.js : Gn.ecrirePilote(Gn.genomeTemoin(cfg), {cfg})) */
const texteSelection=Gn.ecrirePilote(Gn.genomeTemoin(cfgT),{cfg:cfgT});
const B0=bras[0];
verif(B0.nom==='depart'&&B0.shaPilote===Gn.shaPilote(texteSelection),'le pilote du bras depart ('+B0.shaPilote.slice(0,12)+') est celui que la selection ecrit pour le temoin c0025 ('+
  Gn.shaPilote(texteSelection).slice(0,12)+')');
verif(B0.genome===ID_TEMOIN_C0025,'le genome du bras depart garde l\'identifiant du temoin '+ID_TEMOIN_C0025+' ('+B0.genome+')');
verif(!Object.keys(B0.differences).length,'le bras depart ne differe en rien du temoin');
/* 3. chaque bras differe du depart (sinon il ne mesurerait rien) et deux bras n'ont jamais le meme pilote */
for(const b of bras.slice(1))verif(Object.keys(b.differences).length>0,'le bras '+b.nom+' differe du depart : '+Object.entries(b.differences).map(([k,v])=>k+' '+v[0]+' -> '+v[1]).join(', '));
verif(new Set(bras.map(b=>b.shaPilote)).size===bras.length,'les '+bras.length+' bras ont '+bras.length+' pilotes differents');

/* le controle de course : le c0025 ecrit a la main, sur les deux premieres graines */
const VOLTIGE=path.join(RACINE,'ml','ecurie','pilote-voltige.js');
const texteVoltige=fs.readFileSync(VOLTIGE,'utf8');
const CONTROLE={id:'voltige',fichier:'ml/ecurie/pilote-voltige.js',shaPilote:C.sha1(texteVoltige),graines:graines.slice(0,2)};

const ep=K.epoque(cfg);
fs.mkdirSync(dossierEtat,{recursive:true});
const BRAS_JSON={format:'banc-des-genes-bras-1',date:new Date().toISOString(),epoque:ep.courses,jeu:ep.composants.version+' '+ep.composants.jeu_sha,node:ep.composants.node,
  regime:cfg.regime||'allege',tmax,graines:{depart:G0,pas:PAS,n:NG},temoin:'c0025',
  bras:bras.map(b=>({nom:b.nom,dit:b.dit,differences:b.differences,genome:b.genome,shaPilote:b.shaPilote,egalTemoin:b.egalTemoin,memeGenomeQueLeTemoin:b.memeGenomeQueLeTemoin})),
  controle:{id:CONTROLE.id,fichier:CONTROLE.fichier,shaPilote:CONTROLE.shaPilote,graines:CONTROLE.graines,
    dit:'le c0025 ecrit a la main : ses empreintes doivent etre celles du bras depart sur les memes graines'},
  verifications:verifs};
/* bras.json garde les bras d'avant (un autre --bras, un genome.js change) : la liste `historique` dit quel sha a porte quel nom */
{const f=path.join(dossierEtat,'bras.json'),av=C.lireJson(f,null);const H=(av&&av.historique)||[];
  for(const b of (av&&av.bras)||[])if(!H.some(h=>h.nom===b.nom&&h.shaPilote===b.shaPilote))H.push({nom:b.nom,shaPilote:b.shaPilote,genome:b.genome,date:av.date});
  for(const b of BRAS_JSON.bras)if(!H.some(h=>h.nom===b.nom&&h.shaPilote===b.shaPilote))H.push({nom:b.nom,shaPilote:b.shaPilote,genome:b.genome,date:BRAS_JSON.date});
  BRAS_JSON.historique=H;
  /* les bras d'un lancement precedent que celui-ci ne joue pas restent dans bras.json (analyser.js les lit encore) */
  for(const b of (av&&av.bras)||[])if(!BRAS_JSON.bras.some(x=>x.nom===b.nom))BRAS_JSON.bras.push(Object.assign({},b,{pasCeLancement:true}));
  BRAS_JSON.bras.sort((x,y)=>NOMS.indexOf(x.nom)-NOMS.indexOf(y.nom));
  C.ecrireAtomique(f,JSON.stringify(BRAS_JSON,null,1)+'\n');}
if(rate)refuser('un controle des bras est rate : rien n\'est joue (voir '+path.join(dossierEtat,'bras.json')+')',2);
if(VERIFIER_SEUL){dire('--verifier : '+bras.length+' bras ecrits dans '+path.relative(RACINE,path.join(dossierEtat,'bras.json'))+', tous les controles passent ; aucune course jouee');process.exit(0);}

/* ===== LE VERROU, STOP ===== */
const STOP=path.join(dossierEtat,'STOP'),VERROU=path.join(dossierEtat,'verrou.json');
if(fs.existsSync(STOP))refuser('le fichier STOP est deja la ('+STOP+') : l\'effacer pour lancer',2);
function prendreVerrou(){
  for(let essai=0;essai<2;essai++){
    try{const fd=fs.openSync(VERROU,'wx');try{fs.writeSync(fd,JSON.stringify({pid:process.pid,date:new Date().toISOString()})+'\n');}finally{fs.closeSync(fd);}return;}
    catch(e){if(e.code!=='EEXIST')throw e;
      let v=null;try{v=JSON.parse(fs.readFileSync(VERROU,'utf8'));}catch(x){}
      if(v&&C.vivant(v.pid))refuser('un jouer.js tourne deja sur cet etat (pid '+v.pid+', depuis '+v.date+') : '+VERROU+' (s\'il ne tourne plus, effacer ce fichier)',2);
      try{fs.renameSync(VERROU,VERROU+'.mort-'+Date.now());}catch(x){}}}
  refuser('verrou impossible a prendre : '+VERROU,2);}
prendreVerrou();
process.on('exit',function(){try{const v=JSON.parse(fs.readFileSync(VERROU,'utf8'));if(v.pid===process.pid)fs.unlinkSync(VERROU);}catch(e){}});

/* (2026-11-28, repris de coffre/jouer.js) le cache ne sert que les courses de L'EPOQUE DU JOUR : on dit combien d'anciennes seront rejouees */
{const vieilles={};for(const l of K.lireCourses(dossierEtat))if(l&&l.epoque&&l.epoque!==ep.courses)vieilles[l.epoque]=(vieilles[l.epoque]||0)+1;
  if(Object.keys(vieilles).length)dire('ATTENTION : l\'etat a des courses d\'une autre epoque '+JSON.stringify(vieilles)+' ; l\'epoque du jour est '+ep.courses+
    ' : elles ne viennent PAS du cache et seront rejouees (modele.js ou enfant.js de ml/evolution, le jeu, les yeux ou node a change)');}

/* ===== LES COURSES ===== */
const tache=(b,g)=>({source:b.texte,fichier:'evolution.js',shaPilote:b.shaPilote,id:b.nom,graine:g,tmax,usage:'banc',generation:null});
const taches=[];
for(const g of CONTROLE.graines)taches.push({source:texteVoltige,fichier:'pilote-voltige.js',shaPilote:CONTROLE.shaPilote,id:CONTROLE.id,graine:g,tmax,usage:'controle',generation:null});
for(const g of graines)for(const b of bras)taches.push(tache(b,g));

let arretDemande=false;
const doitArreter=()=>arretDemande||fs.existsSync(STOP);
const ord=K.creer({cfg,epoque:ep,dossierEtat,travailleurs:TRAV,doitArreter,journal:t=>{if(/NON MESUREE|ERREUR|tronquee/.test(t))dire(t);}});
dire('banc des genes : '+bras.length+' bras ('+bras.map(b=>b.nom).join(', ')+') sur '+NG+' graines ('+graines[0]+' .. '+graines[NG-1]+', pas '+PAS+') + '+CONTROLE.graines.length+
  ' courses de controle (pilote-voltige.js) = '+taches.length+' courses ; tmax '+tmax+', regime '+(cfg.regime||'allege')+', '+TRAV+' a la fois, epoque '+ep.courses+
  ', jeu '+ep.composants.version+' '+ep.composants.jeu_sha+', node '+ep.composants.node+', etat '+path.relative(RACINE,dossierEtat));
process.on('SIGINT',function(){if(arretDemande){dire('second Ctrl+C : on tue les courses en cours');ord.arreter({dur:true}).then(()=>process.exit(3));return;}
  arretDemande=true;dire('Ctrl+C : plus de lancement, on attend les courses en cours (encore Ctrl+C : on les tue)');ord.arreter({dur:false});});

let fini=0,jouees=0,cache=0;const t0=Date.now();
const P=taches.map(t=>ord.demander([t]).then(L=>{const l=L[0];
  if(!l)return null;
  fini++;
  if(l._cache){cache++;return l;}
  jouees++;
  const ecoule=(Date.now()-t0)/60000,reste=taches.length-fini;
  const fin=jouees>=TRAV?' · reste ~'+(ecoule/jouees*Math.max(0,reste-0)).toFixed(0)+' min':'';
  dire(String(fini).padStart(4)+'/'+taches.length+' '+String(l.id).padEnd(9)+' graine '+l.graine+' palier '+String(l.palier).padStart(2)+' survie '+String(l.survie_s).padStart(6)+' s '+
    String(l.cause).padEnd(8)+' '+(l.mesuree?'':'NON MESUREE ('+l.raison+') ')+'empreinte '+l.empreinte+' · '+ecoule.toFixed(1)+' min'+fin);
  return l;}));
Promise.all(P).then(function(L){
  const st=ord.stats(),mes=L.filter(l=>l&&l.mesuree).length,non=L.filter(l=>l===null).length;
  const stop=fs.existsSync(STOP);
  if(cache)dire(cache+' course(s) deja mesuree(s) : venues du cache, pas rejouees');
  dire('fin : '+mes+'/'+taches.length+' mesurees · jouees '+st.jouees+' · cache '+st.cache+' · non mesurees '+st.nonMesurees+' · relancees '+st.relancees+' · tuees '+st.tuees+
    (non?' · '+non+' non lancees (arret)':'')+' · '+((Date.now()-t0)/60000).toFixed(1)+' min');
  if(stop){try{fs.unlinkSync(STOP);}catch(e){}dire('arret par STOP : le fichier STOP est efface ; relancer la meme commande reprend la ou on s\'est arrete');}
  process.exit(non||arretDemande||stop?3:(mes===taches.length?0:1));
},function(e){process.stderr.write(String(e&&e.message||e)+'\n');process.exit(1);});
