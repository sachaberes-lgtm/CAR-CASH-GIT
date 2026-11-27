/* ===== LA SELECTION NATURELLE : L'OUTILLAGE COMMUN (2026-11-27, etape 1, INTERFACES.md § 0 « Le module ajoute : commun.js ») =====
   Pur outillage, sans etat : la config, les chemins, l'ecriture atomique, les journaux JSONL, le sha1, la semaine ISO, « ce processus vit-il ».
   Tous les fichiers ecrits ici le sont en LF, en UTF-8. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');

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

/* config.json, puis `fichier` (relatif au cwd, sinon a ml/evolution) fusionne par-dessus ; cfg._fichier = le chemin du second ou null */
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

module.exports={RACINE,DOSSIER,lireConfig,chemin,ecrireAtomique,ecrireAtomiqueOctets,renommerSur,dormir,ajouterLigne,lireJsonl,lireJson,sha1,semaineIso,vivant,
  fusionner,reparerFin,FICHIERS_EPOQUE,shaFichiersEpoque,shaDesFichiers,nettoyerTmp};
