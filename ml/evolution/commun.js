/* ===== LA SELECTION NATURELLE : L'OUTILLAGE COMMUN (2026-11-27, etape 1, INTERFACES.md § 0 « Le module ajoute : commun.js ») =====
   Pur outillage, sans etat : la config, les chemins, l'ecriture atomique, les journaux JSONL, le sha1, la semaine ISO, « ce processus vit-il ».
   Tous les fichiers ecrits ici le sont en LF, en UTF-8. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');

const DOSSIER=__dirname;
const RACINE=path.join(__dirname,'..','..');

/* la fusion d'une surcouche : objets en profondeur, tableaux et scalaires remplaces */
function fusionner(base,dessus){
  if(!dessus||typeof dessus!=='object'||Array.isArray(dessus))return dessus;
  const r=Object.assign({},base);
  for(const k of Object.keys(dessus)){
    const v=dessus[k],b=base?base[k]:undefined;
    if(v&&typeof v==='object'&&!Array.isArray(v)&&b&&typeof b==='object'&&!Array.isArray(b))r[k]=fusionner(b,v);
    else r[k]=v;
  }
  return r;
}

function lireJsonFichier(f,quoi){
  let t;
  try{t=fs.readFileSync(f,'utf8');}catch(e){throw new Error('commun : '+quoi+' illisible ('+f+') : '+e.message);}
  try{return JSON.parse(t);}catch(e){throw new Error('commun : '+quoi+' n\'est pas du JSON ('+f+') : '+e.message);}
}

/* config.json, puis `fichier` (relatif au cwd, sinon a ml/evolution) fusionne par-dessus ; cfg._fichier = le chemin du second ou null.
   (2026-11-27, « machine ») travailleurs et banc.travailleurs sont controles ; travailleurs "auto" est resolu ici en un NOMBRE (machine.json du
   dossier d'etat, sinon le repli) : tout lecteur de cfg.travailleurs (courses.js, identite.js, inscrire-champion.js) recoit un entier.
   Voir LE REGLAGE PAR MACHINE plus bas. */
function lireConfig(fichier){
  const base=lireJsonFichier(path.join(DOSSIER,'config.json'),'config.json');
  if(base.format!=='evolution-config-1')throw new Error('commun : config.json n\'a pas le format evolution-config-1');
  let cfg=base,second=null;
  if(fichier){
    const a=path.resolve(process.cwd(),fichier),b=path.resolve(DOSSIER,fichier);
    second=fs.existsSync(a)?a:b;
    const dessus=lireJsonFichier(second,'la config '+fichier);
    if(dessus.format!==undefined&&dessus.format!=='evolution-config-1')throw new Error('commun : '+fichier+' n\'a pas le format evolution-config-1');
    cfg=fusionner(base,dessus);
  }
  cfg._fichier=second;
  const d=controlerTravailleurs(cfg);
  if(d)throw new Error('commun : '+d+(second?' ('+path.basename(second)+' par-dessus config.json)':' (config.json)'));
  cfg._travailleursConfig=cfg.travailleurs===undefined?'auto':cfg.travailleurs;
  resoudreTravailleurs(cfg);
  return cfg;
}

/* ===== LE REGLAGE PAR MACHINE (2026-11-27, « machine » ; Fable : « le meme depot doit marcher sur n'importe quel PC sans retouche a la main ») =====
   Le nombre de courses a la fois (« travailleurs ») depend du PC, pas de la selection : il ne vit plus dans config.json (suivi par git, partage)
   mais dans <dossierEtat>/machine.json (un par PC, ecrit par le banc d'evoluer.js). Il ne change le resultat d'AUCUNE course (une course = un
   processus neuf, meme graine = meme course ; un PC trop charge donne des pannes, donc une course NON mesuree et rejouee, jamais une autre note) :
   il n'entre pas dans l'epoque.
   config.json : "travailleurs": "auto" (ou un nombre, qui l'emporte partout) ; "banc": {"travailleurs": "auto" (ou une liste), courses, tmax}.
   machine.json : {format:'evolution-machine-1', ordinateur, cpus, modeleCpu, memoireGo, node, travailleurs, source:'auto'|'banc', date,
                   banc:{date, resultats:[{travailleurs, coursesParHeure, pannes, nonMesurees, …}], retenu:N|null, raison?, echecs?, interrompu?}|null}
   Un machine.json d'un autre ordinateur (autre nom, autre nombre de coeurs) est ignore : le banc est refait. */
const FORMAT_MACHINE='evolution-machine-1';
const TRAVAILLEURS_MAX=256;
const ECHECS_BANC_MAX=3;   /* un banc FINI sans aucun nombre valable n'est retente que 3 fois (un interrompu, toujours) */
const entierDans=(x,a,b)=>typeof x==='number'&&Number.isInteger(x)&&x>=a&&x<=b;

function coeursLogiques(){
  let n=0;
  try{n=typeof os.availableParallelism==='function'?os.availableParallelism():os.cpus().length;}catch(e){n=0;}
  if(!(n>=1)){try{n=os.cpus().length;}catch(e){n=0;}}
  return n>=1?n:1;
}
/* la liste essayee par le banc « auto » : {ceil(L/2), L-4, L-2, L-1}, sans doublon, chacun dans [1, L], en ordre croissant */
function listeBancAuto(L){
  L=Math.max(1,Math.floor(L)||1);
  const r=[...new Set([Math.ceil(L/2),L-4,L-2,L-1])].filter(n=>n>=1&&n<=L).sort((a,b)=>a-b);
  return r.length?r:[1];
}
/* la liste du banc pour cette config ("auto" ou la liste ecrite) */
function listeBanc(cfg,L){
  const b=cfg&&cfg.banc&&cfg.banc.travailleurs;
  if(Array.isArray(b))return [...new Set(b)].sort((a,c)=>a-c);
  return listeBancAuto(L==null?coeursLogiques():L);
}
/* le repli sans banc reussi : max(1, L-2) ; borne par le plus grand nombre d'une liste de banc ecrite a la main (un essai a 2 courses a la fois
   ne doit pas en lancer 6 parce que son banc a echoue) */
function repliTravailleurs(L,cfg){
  let n=Math.max(1,(Math.floor(L)||1)-2);
  const b=cfg&&cfg.banc&&cfg.banc.travailleurs;
  if(Array.isArray(b)&&b.length)n=Math.min(n,Math.max(...b));
  return n;
}
/* le choix du banc : le meilleur debit SANS panne, sans course non mesuree ni relancee ; a debit egal (moins de 5 % d'ecart) le plus PETIT nombre
   (le PC reste utilisable). null si aucun nombre n'est valable. */
function choisirTravailleurs(resultats){
  const ok=(resultats||[]).filter(r=>r&&entierDans(r.travailleurs,1,TRAVAILLEURS_MAX)&&(r.pannes|0)===0&&(r.nonMesurees|0)===0&&!(r.relancees>0)&&
    typeof r.coursesParHeure==='number'&&r.coursesParHeure>0&&!r.interrompu);
  if(!ok.length)return null;
  const max=Math.max(...ok.map(r=>r.coursesParHeure));
  return ok.filter(r=>r.coursesParHeure>=0.95*max).sort((a,b)=>a.travailleurs-b.travailleurs)[0].travailleurs;
}
/* "auto" ou un entier ; la liste du banc : "auto" ou des entiers. Rend le defaut en texte, ou null. */
function controlerTravailleurs(cfg){
  const t=cfg.travailleurs;
  if(t!==undefined&&t!=='auto'&&!entierDans(t,1,TRAVAILLEURS_MAX))
    return 'travailleurs doit etre "auto" ou un nombre entier de 1 a '+TRAVAILLEURS_MAX+' (lu : '+JSON.stringify(t)+')';
  const b=cfg.banc;
  if(b!==undefined){
    if(!b||typeof b!=='object'||Array.isArray(b))return 'banc doit etre un objet {travailleurs, courses, tmax}';
    const bt=b.travailleurs;
    if(bt!==undefined&&bt!=='auto'&&!(Array.isArray(bt)&&bt.length&&bt.every(n=>entierDans(n,1,TRAVAILLEURS_MAX))))
      return 'banc.travailleurs doit etre "auto" ou une liste de nombres entiers de 1 a '+TRAVAILLEURS_MAX+' (lu : '+JSON.stringify(bt)+')';
    if(b.courses!==undefined&&!entierDans(b.courses,1,10000))return 'banc.courses doit etre un nombre entier de 1 a 10000 (lu : '+JSON.stringify(b.courses)+')';
    if(b.tmax!==undefined&&!entierDans(b.tmax,1,100000))return 'banc.tmax doit etre un nombre entier de secondes (lu : '+JSON.stringify(b.tmax)+')';
  }
  return null;
}
function empreintePc(){return 'pc-'+require('crypto').createHash('sha256').update(String(os.hostname()||'')).digest('hex').slice(0,8);}
/* ce que l'on sait de ce PC (les champs d'identite de machine.json) */
function descriptionMachine(){
  let modele='?',mem=null;
  try{const c=os.cpus();modele=c&&c[0]?String(c[0].model).trim():'?';}catch(e){}
  try{mem=+(os.totalmem()/1073741824).toFixed(1);}catch(e){}
  /* (27/11/2026, Fable) machine.json part sur GitHub avec les traces, et le depot est public : on n'y ecrit pas le nom Windows du PC,
     seulement son empreinte (assez pour reconnaitre « ce PC-ci », rien a lire pour un inconnu) */
  return {ordinateur:empreintePc(),cpus:coeursLogiques(),modeleCpu:modele,memoireGo:mem,node:process.version};
}
function cheminMachine(dossierEtat){return path.join(dossierEtat,'machine.json');}
/* -> {machine|null, pourquoi|null} : null si absent, illisible, d'un autre format ou d'un autre ordinateur (pourquoi le dit) */
function lireMachine(dossierEtat){
  const f=cheminMachine(dossierEtat);
  let t;
  try{t=fs.readFileSync(f,'utf8');}catch(e){return {machine:null,pourquoi:e.code==='ENOENT'?'absent':'illisible ('+e.code+')'};}
  let m;
  try{m=JSON.parse(t);}catch(e){return {machine:null,pourquoi:'illisible (pas du JSON)'};}
  if(!m||m.format!==FORMAT_MACHINE)return {machine:null,pourquoi:'format inconnu'};
  if(!entierDans(m.travailleurs,1,TRAVAILLEURS_MAX))return {machine:null,pourquoi:'travailleurs absurde ('+JSON.stringify(m.travailleurs)+')'};
  const ici=descriptionMachine();
  if(m.ordinateur!==ici.ordinateur||m.cpus!==ici.cpus)
    return {machine:null,pourquoi:'il vient d\'un autre PC ('+m.ordinateur+', '+m.cpus+' coeurs ; ici '+ici.ordinateur+', '+ici.cpus+' coeurs)',autre:m};
  /* (27/11, le relecteur) plus de courses a la fois que de coeurs logiques : jamais donne par « auto » (le banc auto et le repli restent dans [1, L]) ;
     seule une liste de banc ecrite a la main peut le mesurer (elle est alors dans banc.liste). Sinon, un machine.json retouche : ignore, banc refait. */
  const liste=m.banc&&Array.isArray(m.banc.liste)?m.banc.liste:[];
  if(m.travailleurs>ici.cpus&&!liste.includes(m.travailleurs))
    return {machine:null,pourquoi:'travailleurs '+m.travailleurs+' pour '+ici.cpus+' coeurs logiques (retouche a la main ?)'};
  return {machine:m,pourquoi:null};
}
/* ecriture atomique ; o = {travailleurs, source, banc} -> l'objet ecrit */
function ecrireMachine(dossierEtat,o){
  const m=Object.assign({format:FORMAT_MACHINE},descriptionMachine(),{travailleurs:o.travailleurs,source:o.source,date:new Date().toISOString(),banc:o.banc||null});
  ecrireAtomique(cheminMachine(dossierEtat),JSON.stringify(m,null,1)+'\n');
  return m;
}
/* faut-il (re)faire le banc avec ce machine.json ? */
function bancAFaire(m){
  if(!m)return true;
  const b=m.banc;
  if(b&&entierDans(b.retenu,1,TRAVAILLEURS_MAX))return false;
  if(b&&!b.interrompu&&(b.echecs|0)>=ECHECS_BANC_MAX)return false;
  return true;
}
/* cfg.travailleurs devient un entier ; o.ligne (--travailleurs N) l'emporte ; o.dossierEtat (sinon cfg.dossierEtat).
   Pose cfg._travailleursSource ('ligne de commande' | 'config' (un nombre ecrit dans la config) | 'banc' | 'auto'), cfg._bancAFaire (bool), cfg._machine (machine.json lu ou null),
   cfg._machinePourquoi (pourquoi il ne sert pas). */
function resoudreTravailleurs(cfg,o){
  o=o||{};
  const brut=cfg._travailleursConfig!==undefined?cfg._travailleursConfig:(cfg.travailleurs===undefined?'auto':cfg.travailleurs);
  const dossier=o.dossierEtat||chemin(cfg,cfg.dossierEtat||'etat');
  const lu=lireMachine(dossier);
  cfg._machine=lu.machine;cfg._machinePourquoi=lu.pourquoi;cfg._bancAFaire=false;
  if(o.ligne!=null){cfg.travailleurs=o.ligne;cfg._travailleursSource='ligne de commande';return cfg;}
  if(brut!=='auto'){cfg.travailleurs=brut;cfg._travailleursSource='config';return cfg;}
  if(lu.machine){
    cfg.travailleurs=lu.machine.travailleurs;cfg._travailleursSource=lu.machine.source==='banc'?'banc':'auto';
    cfg._bancAFaire=bancAFaire(lu.machine);
    return cfg;
  }
  cfg.travailleurs=repliTravailleurs(coeursLogiques(),cfg);cfg._travailleursSource='auto';cfg._bancAFaire=true;
  return cfg;
}

function chemin(cfg,rel){return path.resolve(DOSSIER,rel);}

/* une attente SYNCHRONE (les ecritures atomiques sont synchrones partout) */
function dormir(ms){try{Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,Math.max(0,ms|0));}catch(e){const t=Date.now();while(Date.now()-t<ms){}}}

/* ===== LE RENAME QUI REESSAIE (2026-11-27, le correcteur ; relecture robustesse « ecrireAtomique leve EPERM sans reessayer ») =====
   Sous Windows, un antivirus, l'indexeur ou une sauvegarde qui tient le fichier ouvert (sans FILE_SHARE_DELETE) fait echouer renameSync en
   EPERM / EACCES / EBUSY pendant quelques secondes. On reessaie avec une attente croissante jusqu'a ~10 s (comme graceful-fs), puis on leve. */
const CODES_OCCUPE=new Set(['EPERM','EACCES','EBUSY']);
function renommerSur(de,vers,o){
  o=o||{};const total=o.total_ms==null?10000:o.total_ms;
  let attente=20,ecoule=0;
  for(;;){
    try{fs.renameSync(de,vers);return;}
    catch(e){
      if(!CODES_OCCUPE.has(e&&e.code)||ecoule>=total)throw e;
      dormir(attente);ecoule+=attente;attente=Math.min(attente*2,1000);
    }
  }
}

/* mkdir -p, ecrit fichier+'.'+pid+'.tmp', rename (reessaye si le fichier est tenu ouvert) ; LF exige ; le .tmp est efface si tout echoue */
function ecrireAtomique(fichier,texte,o){
  if(typeof texte!=='string')throw new Error('commun : ecrireAtomique attend un texte');
  if(texte.indexOf('\r')>=0)throw new Error('commun : texte avec un \\r refuse (LF seulement) pour '+fichier);
  ecrireAtomiqueOctets(fichier,texte,o);
}
/* la meme chose sans le controle LF (pilotes/<sha12>.js : le texte EXACT envoye a l'enfant) */
function ecrireAtomiqueOctets(fichier,donnees,o){
  fs.mkdirSync(path.dirname(fichier),{recursive:true});
  const tmp=fichier+'.'+process.pid+'.tmp';
  try{fs.writeFileSync(tmp,donnees,typeof donnees==='string'?'utf8':undefined);renommerSur(tmp,fichier,o);}
  catch(e){try{fs.unlinkSync(tmp);}catch(x){}throw e;}
}

function ajouterLigne(fichier,objet){
  fs.mkdirSync(path.dirname(fichier),{recursive:true});
  fs.appendFileSync(fichier,JSON.stringify(objet)+'\n','utf8');
}

/* [] si absent ; une derniere ligne illisible (tronquee par un arret brutal) est ignoree ; une ligne illisible au milieu leve */
function lireJsonl(fichier){
  let t;
  try{t=fs.readFileSync(fichier,'utf8');}catch(e){if(e.code==='ENOENT')return [];throw e;}
  const L=t.split('\n'),r=[];
  /* l'indice de la derniere ligne non vide */
  let der=L.length-1;while(der>=0&&L[der].trim()==='')der--;
  for(let i=0;i<=der;i++){
    const s=L[i].trim();if(!s)continue;
    try{r.push(JSON.parse(s));}
    catch(e){if(i===der)break;throw new Error('commun : '+fichier+' ligne '+(i+1)+' illisible : '+e.message);}
  }
  return r;
}

/* ===== LA FIN D'UN JOURNAL REPAREE (2026-11-27, le correcteur ; relecture robustesse « journaux jamais repares apres une ligne tronquee ») =====
   Une ligne sans « \n » final (arret brutal pendant ajouterLigne) : mise de cote dans <fichier>.fragment-<date>, puis coupee du fichier, pour que
   la prochaine ligne ajoutee ne s'y colle pas (elle deviendrait une ligne illisible AU MILIEU, qui fait lever lireJsonl). Rend true si repare. */
function reparerFin(fichier,journal){
  let b;
  try{b=fs.readFileSync(fichier);}catch(e){if(e.code==='ENOENT')return false;throw e;}
  if(!b.length||b[b.length-1]===0x0a)return false;
  const fin=b.lastIndexOf(0x0a)+1;
  const frag=b.slice(fin);
  fs.writeFileSync(fichier+'.fragment-'+new Date().toISOString().replace(/[:.]/g,'-'),frag);
  fs.truncateSync(fichier,fin);
  if(journal)journal('ligne tronquee en fin de '+path.basename(fichier)+' ('+frag.length+' octets) mise de cote et coupee');
  return true;
}

/* ===== LES FICHIERS DU BOT QUI FONT L'EPOQUE (deplaces ici depuis courses.js : enfant.js les hashe aussi, au moment ou il les charge) ===== */
const FICHIERS_EPOQUE=['ml/bot/yeux.js','ml/bot/doigts.js','ml/bot/piloter.js','ml/bot/ressemblance.js','ml/bot/mesures.js','ml/bot/voltige.js',
  'ml/reel/jeu-reel.js','ml/reel/sim-env-reel.js','ml/evolution/modele.js','ml/evolution/enfant.js'];
/* {rel: sha1 des octets | 'absent'} ; o.tolererManquants : 'absent' au lieu de lever */
function shaFichiersEpoque(o){
  o=o||{};const r={};
  for(const rel of FICHIERS_EPOQUE){
    const f=path.join(RACINE,...rel.split('/'));
    let b=null;
    try{b=fs.readFileSync(f);}catch(e){if(!o.tolererManquants)throw new Error('courses : fichier de l\'epoque introuvable : '+rel);}
    r[rel]=b?sha1(b):'absent';
  }
  return r;
}
/* l'empreinte d'ensemble de ces fichiers (12 hex) : l'enfant la rend, le tri la compare a celle de l'epoque */
function shaDesFichiers(fichiers){return sha1(JSON.stringify(fichiers)).slice(0,12);}

/* ===== LES RESTES D'ECRITURE (*.<pid>.tmp) DONT LE PROCESSUS NE VIT PLUS : effaces (le dossier et un niveau de sous-dossiers) ===== */
function nettoyerTmp(dossier,journal){
  let n=0;
  const passer=(d,prof)=>{
    let noms=[];try{noms=fs.readdirSync(d,{withFileTypes:true});}catch(e){return;}
    for(const x of noms){
      const f=path.join(d,x.name);
      if(x.isDirectory()){if(prof<1)passer(f,prof+1);continue;}
      const m=/\.(\d+)\.tmp$/.exec(x.name);
      if(m&&+m[1]!==process.pid&&!vivant(+m[1])){try{fs.unlinkSync(f);n++;}catch(e){}}
    }
  };
  passer(dossier,0);
  if(n&&journal)journal(n+' reste(s) d\'ecriture *.tmp efface(s) dans '+path.basename(dossier));
  return n;
}

function lireJson(fichier,defaut){
  if(!fs.existsSync(fichier)){if(arguments.length>=2)return defaut;throw new Error('commun : '+fichier+' absent');}
  return lireJsonFichier(fichier,path.basename(fichier));
}

function sha1(x){return crypto.createHash('sha1').update(x).digest('hex');}

/* la semaine ISO 8601 : 'AAAA-SS' (la semaine du jeudi) */
function semaineIso(date){
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  const j=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-j);
  const an=d.getUTCFullYear(),debut=new Date(Date.UTC(an,0,1));
  const s=Math.ceil(((d-debut)/86400000+1)/7);
  return an+'-'+String(s).padStart(2,'0');
}

function vivant(pid){
  if(!pid)return false;
  try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}
}

module.exports={empreintePc,RACINE,DOSSIER,lireConfig,chemin,ecrireAtomique,ecrireAtomiqueOctets,renommerSur,dormir,ajouterLigne,lireJsonl,lireJson,sha1,semaineIso,vivant,
  fusionner,reparerFin,FICHIERS_EPOQUE,shaFichiersEpoque,shaDesFichiers,nettoyerTmp,
  FORMAT_MACHINE,TRAVAILLEURS_MAX,ECHECS_BANC_MAX,coeursLogiques,listeBancAuto,listeBanc,repliTravailleurs,choisirTravailleurs,controlerTravailleurs,
  descriptionMachine,cheminMachine,lireMachine,ecrireMachine,bancAFaire,resoudreTravailleurs};
