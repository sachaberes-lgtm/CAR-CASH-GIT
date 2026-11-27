#!/usr/bin/env node
/* ===== LA SELECTION NATURELLE : LE MAITRE (2026-11-27, etapes 4 et 5 — SPECIFICATION.md § 7 et 8, INTERFACES.md § 2.10 et § 6 ;
   Sacha : « une population de pilotes evolue seule sur un PC, le moins bon est vire a chaque generation ») =====
   Le seul processus long. Une generation : l'epoque (et le controle d'identite a chaque epoque neuve), les naissances (tournoi, croisement,
   mutation, immigre), population.json ecrit d'un coup, les courses (tous les vivants x les graines de la generation, le cache saute celles
   deja faites), la note sur toute l'epoque, le renvoi des moins bons, la validation par bootstrap apparie, le coffre, les phases, les journaux,
   le tableau. Puis STOP / PAUSE, puis la suivante.
   REPRISE : population.json est ecrit au debut de chaque generation (etape 'courses', apres les naissances) ET a sa fin (etape 'fin') ;
   une coupure ne perd que les courses en cours (le cache courses-*.jsonl rend les autres). Les journaux d'une generation refaite ne sont
   pas ecrits deux fois.
   Ligne de commande : node ml/evolution/evoluer.js [--config f.json] [--etat dossier] [--travailleurs N] [--une-generation] [--arret-apres N]
                       [--banc] [--valider-maintenant] [--bavard] [--aide]   (USAGE, plus bas ; toute option est controlee avant de partir)
   Codes de sortie : 0 arret propre (ou --aide) ; 1 erreur fatale (YEUX CHANGES, identite ratee, temoin en panne…) ; 2 refus de partir (verrou, labo,
   boucle.js) ou option mal ecrite.
   (27/11, « machine ») le nombre de courses a la fois vient de <etat>/machine.json (le banc, fait seul au premier lancement sur un PC) : voir LE BANC. */
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const C=require('./commun'),K=require('./courses'),Gn=require('./genome'),Gr=require('./graines'),N=require('./note');

const hh=()=>new Date().toTimeString().slice(0,8);

/* ===== LA CONSOLE QUI NE TUE PAS LE MAITRE (27/11/2026, « machine » ; Fable : le maitre est mort sans prevenir quand sa console a ete fermee,
   sa sortie etait un tube vers « head » : EPIPE) =====
   Un maitre qui tourne des jours ne doit pas mourir parce que personne ne lit sa console. Toute erreur de process.stdout / process.stderr (EPIPE,
   EOF, console fermee…) est attrapee : la console est declaree morte, le travail continue. L'essentiel est deja dans les journaux de etat/
   (population.json, generations.jsonl, courses-*.jsonl…) ; a partir de la mort de la console, les lignes du maitre vont en plus a la fin de
   <etat>/sortie.log (CONSOLE.secours, pose par principal une fois le dossier d'etat connu : sous lancer.cmd la console EST sortie.log et ne meurt pas). */
const CONSOLE={morte:false,erreurMorte:false,raison:null,secours:null,gardee:false};
function ajouterSecours(t){if(CONSOLE.secours){try{fs.mkdirSync(path.dirname(CONSOLE.secours),{recursive:true});fs.appendFileSync(CONSOLE.secours,t);}catch(e){}}}
function consoleMorte(e){
  if(CONSOLE.morte)return;
  CONSOLE.morte=true;CONSOLE.raison=String(e&&(e.code||e.message)||e);
  ajouterSecours(hh()+' evoluer : la console ne repond plus ('+CONSOLE.raison+') : le travail continue, la suite du journal est ici (pid '+process.pid+')\n');
}
function ecrireConsole(t){
  if(!CONSOLE.morte){try{process.stdout.write(t);return;}catch(e){consoleMorte(e);}}
  ajouterSecours(t);
}
function ecrireErreur(t){
  if(!CONSOLE.erreurMorte){try{process.stderr.write(t);return;}catch(e){CONSOLE.erreurMorte=true;}}
  ajouterSecours(t);
}
function garderConsole(){
  if(CONSOLE.gardee)return;CONSOLE.gardee=true;
  try{process.stdout.on('error',consoleMorte);}catch(e){}
  try{process.stderr.on('error',function(){CONSOLE.erreurMorte=true;});}catch(e){}
}
const direDefaut=t=>ecrireConsole(hh()+' '+t+'\n');
const fini=x=>typeof x==='number'&&x-x===0;
const r4=x=>fini(x)?+x.toFixed(4):(x==null?null:x);
const court=id=>String(id||'?').slice(0,12);

/* ---------- LES CHEMINS ---------- */
function chemins(cfg){
  const d=C.chemin(cfg,cfg.dossierEtat||'etat');
  return {dossier:d,pop:path.join(d,'population.json'),generations:path.join(d,'generations.jsonl'),validations:path.join(d,'validations.jsonl'),
    morts:path.join(d,'morts.jsonl'),coffre:path.join(d,'coffre.jsonl'),verrou:path.join(d,'verrou.json'),stop:path.join(d,'STOP'),pause:path.join(d,'PAUSE'),
    champions:C.chemin(cfg,cfg.dossierChampions||'champions')};
}

/* ---------- LE VERROU (§ 3.9) ---------- */
/* (2026-11-27, le correcteur ; relecture robustesse « le verrou ne protege pas ») :
   - la creation est TOUJOURS exclusive (openSync 'wx'), reprise comprise : un verrou mort est d'abord deplace (verrou.json.mort-<pid>) sous la
     garde d'un second fichier exclusif (verrou.json.reprise), puis recree en 'wx' ; deux maitres partis ensemble : un seul gagne, l'autre refuse ;
   - le verrou d'un pid VIVANT n'est jamais repris sur la seule foi d'un battement en retard (veille, hibernation) : si ce pid est un processus
     node, refus ; s'il n'est pas un node (pid reutilise par un autre programme apres un redemarrage), le verrou est mort ;
   - le battement relit verrou.json avant de l'ecrire : si le pid n'est plus le sien, il n'ecrit pas et appelle o.surPerte (« verrou perdu »).
   Toute erreur ici rend {ok:false} (code 2), jamais une exception. */
function lireVerrou(f){try{return {texte:fs.readFileSync(f,'utf8')};}catch(e){return e.code==='ENOENT'?null:{texte:null};}}
/* un pid vivant est-il un processus node (donc peut-etre un maitre) ? Un pid reutilise apres un redemarrage est presque toujours un autre programme. */
function estMaitre(pid){
  const L=processusNode({timeout_ms:15000});
  if(!L)return true;   /* on ne sait pas : prudence, on le croit maitre */
  return L.some(x=>x.pid===pid);
}
function verrouiller(cfg,o){
  o=o||{};
  const P=chemins(cfg);
  try{
    fs.mkdirSync(P.dossier,{recursive:true});
    const debut=new Date().toISOString();
    const contenu=()=>JSON.stringify({pid:process.pid,debut:debut,battement:new Date().toISOString(),config:cfg._fichier?path.basename(cfg._fichier):'config.json'})+'\n';
    const creer=()=>{const fd=fs.openSync(P.verrou,'wx');try{fs.writeSync(fd,contenu());}finally{fs.closeSync(fd);}};
    let repris=null;
    try{creer();}
    catch(e){
      if(e.code!=='EEXIST'&&e.code!=='EPERM')throw e;
      const lu=lireVerrou(P.verrou);
      if(!lu){creer();}   /* disparu entre-temps : a nous, en 'wx' (EEXIST si un autre l'a pris : refus plus bas) */
      else{
        let v=null;try{v=JSON.parse(lu.texte);}catch(x){v=null;}
        if(v&&v.pid&&v.pid!==process.pid&&C.vivant(v.pid)){
          const age=(Date.now()-Date.parse(v.battement||v.debut||''))/1000;
          if(fini(age)&&age<(cfg.verrouPerime_s||300))
            return {ok:false,raison:'une evolution tourne deja sur cet etat (pid '+v.pid+', signe de vie il y a '+Math.round(age)+' s) : '+P.verrou};
          if(estMaitre(v.pid))
            return {ok:false,raison:'le maitre pid '+v.pid+' vit encore mais son signe de vie a '+(fini(age)?Math.round(age)+' s':'un age illisible')+
              ' (veille ?) : on ne lui prend pas son verrou ('+P.verrou+')'};
        }
        /* le verrou est mort : on le reprend sous la garde de verrou.json.reprise (creation exclusive) */
        const garde=P.verrou+'.reprise';
        try{const fd=fs.openSync(garde,'wx');fs.writeSync(fd,JSON.stringify({pid:process.pid,date:new Date().toISOString()})+'\n');fs.closeSync(fd);}
        catch(x){
          if(x.code!=='EEXIST'&&x.code!=='EPERM')throw x;
          /* une garde laissee par un processus mort depuis plus d'une minute : effacee, la prochaine relance passera */
          try{const g=JSON.parse(fs.readFileSync(garde,'utf8'));const st=fs.statSync(garde);if(!C.vivant(g.pid)&&Date.now()-st.mtimeMs>60000)fs.unlinkSync(garde);}catch(y){}
          return {ok:false,raison:'un autre maitre reprend le verrou en ce moment ('+garde+')'};
        }
        try{
          const re=lireVerrou(P.verrou);
          if(re&&re.texte!==lu.texte)return {ok:false,raison:'le verrou a ete pris par un autre maitre pendant la reprise ('+P.verrou+')'};
          if(re)C.renommerSur(P.verrou,P.verrou+'.mort-'+process.pid);
          creer();
        }finally{try{fs.unlinkSync(garde);}catch(y){}}
        repris=v||{illisible:true};
      }
    }
    let perdu=false;
    const t=setInterval(function(){
      if(perdu)return;
      try{
        const lu=lireVerrou(P.verrou);let v=null;try{v=lu&&lu.texte?JSON.parse(lu.texte):null;}catch(x){v=null;}
        if(!v||v.pid!==process.pid){perdu=true;if(o.surPerte)o.surPerte(v&&v.pid?'le verrou est au pid '+v.pid:'le verrou a disparu');return;}
        C.ecrireAtomique(P.verrou,contenu());
      }catch(e){}
    },Math.max(1,cfg.battement_s||30)*1000);
    if(t.unref)t.unref();
    return {ok:true,repris:repris,lacher:function(){
      clearInterval(t);
      try{const v=JSON.parse(fs.readFileSync(P.verrou,'utf8'));if(v.pid===process.pid)fs.unlinkSync(P.verrou);}catch(e){}
    }};
  }catch(e){
    return {ok:false,raison:'verrou impossible a prendre ('+(e&&e.code||'')+' '+String(e&&e.message||e).slice(0,200)+') : '+P.verrou};
  }
}

/* ---------- LE REFUS DE PARTIR (§ 8) : une inscription du labo en cours, ou ml/ecurie/boucle.js qui tourne. Lecture seule. ---------- */
/* (2026-11-27, « machine » ; essaye pour de vrai avec un faux ml/ecurie/boucle.js : ~0,6 s sur le PC de developpement) : PowerShell a au plus
   o.timeout_ms (5 s par defaut ; il etait de 60 s) ; PowerShell absent, lent, ou une sortie illisible : null, et o.pourquoi.texte dit pourquoi.
   o.commande = [exe, ...arguments] remplace PowerShell (les tests : un faux PowerShell lent, absent ou qui repond n'importe quoi). */
const PS_NODE="Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress";
function processusNode(o){
  o=o||{};
  const t0=Date.now(),dit=t=>{if(o.pourquoi)o.pourquoi.texte=t;};
  try{
    if(process.platform==='win32'||o.commande){
      const cmd=o.commande||['powershell.exe','-NoProfile','-NonInteractive','-Command',PS_NODE];
      const s=execFileSync(cmd[0],cmd.slice(1),{encoding:'utf8',windowsHide:true,timeout:o.timeout_ms||5000,killSignal:'SIGKILL',
        maxBuffer:32*1024*1024,stdio:['ignore','pipe','ignore']});
      const t=String(s||'').trim();if(!t)return [];
      const j=JSON.parse(t);
      const L=(Array.isArray(j)?j:[j]).filter(p=>p&&typeof p==='object').map(p=>({pid:+p.ProcessId,ligne:String(p.CommandLine||'')}));
      if(o.pourquoi)o.pourquoi.ms=Date.now()-t0;
      return L;
    }
    const s=execFileSync('ps',['-eo','pid=,args='],{encoding:'utf8',timeout:o.timeout_ms||5000,stdio:['ignore','pipe','ignore']});
    return s.split('\n').map(l=>{const m=/^\s*(\d+)\s+(.*)$/.exec(l);return m?{pid:+m[1],ligne:m[2]}:null;}).filter(Boolean);
  }catch(e){
    const ms=Date.now()-t0;
    dit(e&&e.code==='ETIMEDOUT'?'pas de reponse en '+Math.round(ms/100)/10+' s':e&&e.code==='ENOENT'?'PowerShell introuvable':
      e instanceof SyntaxError?'reponse illisible':String(e&&(e.code||e.message)||e).slice(0,120));
    return null;
  }
}
/* o.dire : dit quand boucle.js n'a pas pu etre cherche (en cas de doute, on part, et on l'ecrit) ; o.timeout_ms, o.commande : voir processusNode */
function refusDePartir(o){
  o=o||{};
  const tampon=path.join(C.RACINE,'ml','labo','tampon');
  let noms=[];try{noms=fs.readdirSync(tampon);}catch(e){noms=[];}
  for(const f of noms){
    const m=/^inscription-(\d+)\.en-cours$/.exec(f);
    if(m&&+m[1]!==process.pid&&C.vivant(+m[1]))return 'une inscription du labo est en cours (ml/labo/tampon/'+f+', pid '+m[1]+') : attendre qu\'elle finisse';
  }
  const pourquoi={};
  const L=processusNode({timeout_ms:o.timeout_ms||5000,commande:o.commande,pourquoi:pourquoi});
  if(!L){
    if(o.dire)o.dire('refus de partir : impossible de verifier que ml/ecurie/boucle.js ne tourne pas ('+(pourquoi.texte||'?')+') : on part quand meme');
    return null;
  }
  for(const p of L){
    if(p.pid===process.pid)continue;
    if(/ecurie[\\\/]boucle\.js/i.test(p.ligne)||/node(\.exe)?"?\s+boucle\.js(\s|$)/i.test(p.ligne))
      return 'ml/ecurie/boucle.js tourne (pid '+p.pid+') : la selection naturelle ne part pas en meme temps';
  }
  return null;
}

/* ---------- LE CONTEXTE ---------- */
const RE_AUTRES_FICHIERS=/jouee avec d'autres fichiers du bot/;
function creerOrd(ctx){
  const cfg=ctx.cfg;
  return K.creer({cfg:cfg,epoque:ctx.epoque,dossierEtat:ctx.P.dossier,travailleurs:cfg.travailleurs,
    journal:function(t){
      if(ctx.bavard||/NON MESUREE|tronquee|ERREUR/.test(t))ctx.dire(t);
      /* un enfant a charge d'autres fichiers du bot que ceux de l'epoque : la generation s'arrete (sans relance de la course) et reprend
         dans la nouvelle epoque (2026-11-27, le correcteur) */
      if(RE_AUTRES_FICHIERS.test(t)&&!ctx.arret.epoque){ctx.arret.epoque=true;ctx.dire('les fichiers du bot ont change pendant la generation : on s\'arrete et on reprend dans la nouvelle epoque');}
    },
    doitArreter:function(){return doitArreter(ctx);},
    enPause:function(){return enPause(ctx);}});
}
function doitArreter(ctx){
  if(ctx.arret.demande||ctx.arret.epoque)return true;
  if(fs.existsSync(ctx.P.stop)){if(!ctx.arret.stopVu){ctx.arret.stopVu=true;ctx.dire('STOP : plus aucune course lancee, on attend celles en cours');}return true;}
  return false;
}
/* la pause est aussi chronometree (ctx.pause) : l'economie de graines ne compte que le temps des courses */
function enPause(ctx){
  const p=fs.existsSync(ctx.P.pause);
  if(p&&!ctx.arret.pauseVue){ctx.arret.pauseVue=true;ctx.dire('PAUSE : plus aucune course lancee tant que le fichier PAUSE existe');}
  if(!p&&ctx.arret.pauseVue){ctx.arret.pauseVue=false;ctx.dire('PAUSE levee : les courses reprennent');}
  if(ctx.pause){
    if(p&&ctx.pause.debut==null)ctx.pause.debut=Date.now();
    if(!p&&ctx.pause.debut!=null){ctx.pause.total+=Date.now()-ctx.pause.debut;ctx.pause.debut=null;}
  }
  return p;
}
function pauseMs(ctx){const x=ctx.pause;return x?x.total+(x.debut!=null?Date.now()-x.debut:0):0;}

/* L'EMPREINTE D'IDENTITE (2026-11-27, le correcteur ; relecture determinisme « le controle d'identite ne se relance pas quand genome.js ou
   pilote-voltige.js changent ») : sha1 de genome.js et de pilote-voltige.js TELS QUE CHARGES (lus au chargement de ce module) et du texte du
   temoin. Gardee dans population.json (identite) ; si elle change, le controle d'identite est refait, sans changer l'epoque des courses. */
const OCTETS_IDENTITE=(function(){
  const lire=f=>{try{return fs.readFileSync(f);}catch(e){return Buffer.from('absent');}};
  return [lire(path.join(__dirname,'genome.js')),lire(Gn.VOLTIGE)];
})();
function shaIdentite(cfg){
  const h=require('crypto').createHash('sha1');
  for(const b of OCTETS_IDENTITE){h.update(b);h.update('\n--\n');}
  h.update(Gn.ecrirePilote(Gn.genomeTemoin(cfg),{cfg:cfg}));
  return h.digest('hex').slice(0,12);
}
/* les lignes d'entrainement mesurees de l'epoque des courses (cle -> ligne) : la note se fait dessus */
function chargerLignes(ctx){
  ctx.lignes=new Map();
  for(const l of K.lireCourses(ctx.P.dossier))
    if(l&&l.mesuree===true&&l.usage==='entrainement'&&l.epoque===ctx.epoque.courses&&l.cle)ctx.lignes.set(l.cle,l);
}
/* (2026-11-27, le correcteur ; relecture robustesse « les journaux du maitre ne sont jamais repares ») : plus de lecture qui avale l'erreur.
   charger() repare d'abord la fin des 4 journaux (commun.reparerFin : fragment mis de cote, puis coupe) ; une ligne illisible AU MILIEU leve
   (erreur fatale, dite par principal), au lieu de vider en silence les morts, les validations et la malediction du gagnant. */
function lireJournal(f){
  try{return C.lireJsonl(f);}
  catch(e){throw new Error('evoluer : journal illisible, rien n\'est lance ('+String(e&&e.message||e)+') : reparer ou mettre de cote la ligne fautive');}
}

function charger(cfg,o){
  o=o||{};
  const P=chemins(cfg);
  fs.mkdirSync(P.dossier,{recursive:true});
  const dire0=o.dire||direDefaut;
  for(const f of [P.generations,P.validations,P.morts,P.coffre]){
    if(!fs.existsSync(f))fs.writeFileSync(f,'');
    else C.reparerFin(f,t=>dire0('evoluer : '+t));
  }
  C.nettoyerTmp(P.dossier,t=>dire0('evoluer : '+t));
  const pop=C.lireJson(P.pop,null);
  if(pop){
    if(pop.format!=='evolution-population-1')throw new Error('evoluer : population.json au format inconnu « '+pop.format+' »');
    for(const v of pop.vivants){const d=Gn.valider(v.genome,cfg);if(d)throw new Error('evoluer : genome incompatible pour '+v.id+' ('+d+') : population.json vient d\'un autre genome.js');}
    if(!pop.etape)pop.etape='courses';
  }
  const ctx={cfg:cfg,P:P,dossier:P.dossier,pop:pop,epoque:K.epoque(cfg),ord:null,REF:null,dire:dire0,bavard:!!o.bavard,
    evenements:[],textes:new Map(),lignes:new Map(),arret:{demande:false,stopVu:false,pauseVue:false,epoque:false},fatal:null,taches:0,
    pause:{debut:null,total:0},
    deja:{morts:new Set(),validations:new Set(),coffre:new Set(),generations:new Set()},maledictions:[]};
  ctx.ord=creerOrd(ctx);
  ctx.REF=N.referenceEpoque();
  chargerLignes(ctx);
  for(const m of lireJournal(P.morts))if(m&&m.id)ctx.deja.morts.add(m.id);
  for(const v of lireJournal(P.validations)){
    if(!v)continue;ctx.deja.validations.add(cleValidation(v));
    if(compteMalediction(v))ctx.maledictions.push(v.malediction);}
  for(const k of lireJournal(P.coffre))if(k)ctx.deja.coffre.add(k.generation+'|'+k.raison);
  for(const g of lireJournal(P.generations))if(g&&fini(g.generation))ctx.deja.generations.add(g.generation);
  return ctx;
}
/* la malediction du gagnant ne se mesure que sur les validations de la regle 6 (pas sur celles forcees par --valider-maintenant) */
const compteMalediction=v=>v.usage==='validation'&&!v.forcee&&fini(v.malediction);
const cleValidation=v=>v.generation+'|'+v.usage+'|'+v.meneur+'|'+v.champion+'|'+((v.graines&&v.graines[0])||'');

function ecrirePop(ctx){C.ecrireAtomique(ctx.P.pop,JSON.stringify(ctx.pop)+'\n');}
function evenement(ctx,t){ctx.evenements.push(t);ctx.dire('evenement : '+t);}

/* ---------- LES PILOTES ---------- */
function texteDe(ctx,v){
  const k=v.id+'|'+ctx.epoque.courses;
  let t=ctx.textes.get(k);
  if(!t){t=Gn.ecrirePilote(v.genome,{cfg:ctx.cfg});ctx.textes.set(k,t);v.shaPilote=Gn.shaPilote(t);}
  return t;
}
function tache(ctx,v,graine,usage,G){
  const source=texteDe(ctx,v);
  return {source:source,fichier:'evolution.js',shaPilote:v.shaPilote,id:v.id,graine:graine,tmax:ctx.cfg.tmax,usage:usage,generation:G};
}
function vivantDe(ctx,id){return ctx.pop.vivants.find(v=>v.id===id)||null;}

/* les courses : une demande par tache (pour voir tot un YEUX CHANGES et le dire course par course) */
async function courir(ctx,taches){
  ctx.taches+=taches.length;
  const L=await Promise.all(taches.map(t=>ctx.ord.demander([t]).then(function(r){
    const l=r[0];
    if(!l)return null;
    if(l.derniereErreur&&String(l.derniereErreur).indexOf('YEUX CHANGES')>=0&&!ctx.fatal){
      ctx.fatal='YEUX CHANGES (pilote '+court(l.id)+', graine '+l.graine+') : '+String(l.derniereErreur).slice(0,300);
      ctx.arret.demande=true;
      ctx.dire('ERREUR : '+ctx.fatal+' — tout s\'arrete');}
    if(l.mesuree===true&&l.usage==='entrainement'&&l.epoque===ctx.epoque.courses)ctx.lignes.set(l.cle,l);
    if(!l._cache)ctx.dire('course '+l.usage+' graine '+l.graine+' '+court(l.id)+' : '+(l.mesuree?'palier '+l.palier+', '+l.survie_s+' s, '+l.cause:'NON MESUREE ('+l.raison+')'));
    return l;})));
  if(ctx.fatal)throw new Error('evoluer : '+ctx.fatal);
  return L;
}

/* ---------- LA NOTE ---------- */
function noterTous(ctx){
  return N.noter([...ctx.lignes.values()],{REF:ctx.REF,cfg:ctx.cfg,exclure:new Set(ctx.pop.grainesRetirees||[]),ids:ctx.pop.vivants.map(v=>v.id)});
}
function resumeNote(x){
  if(!x)return null;
  return {id:x.id,n:x.n,a:r4(x.a),ahat:r4(x.ahat),E:r4(x.E),F:r4(x.F),se_F:r4(x.se_F),ecartClassique:r4(x.ecartClassique)};
}
const nDe=(notes,id)=>(notes.par[id]&&notes.par[id].n)||0;
const fDe=(notes,id)=>{const x=notes.par[id];return x&&fini(x.F)?x.F:-Infinity;};

/* ---------- LES NAISSANCES (§ 6.2) ---------- */
function diffGenomes(g,ref){
  const m=[];
  for(const b of Gn.BORNES)if(g.A[b.cle]!==ref.A[b.cle])m.push({cle:b.cle,avant:ref.A[b.cle],apres:g.A[b.cle]});
  for(const t of ['WV','WS'])if(g[t].some((x,i)=>x!==ref[t][i]))m.push({cle:t,avant:null,apres:null});
  return m;
}
function tournoi(ctx,notes,rng,exclure){
  const cfg=ctx.cfg,V=ctx.pop.vivants;
  let pool=V.filter(v=>nDe(notes,v.id)>=cfg.protectionCourses);
  const taille=cfg.tournoi||3;
  if(pool.length<taille){
    let nmax=0;for(const v of V)nmax=Math.max(nmax,nDe(notes,v.id));
    pool=V.filter(v=>nDe(notes,v.id)===nmax);
  }
  if(exclure&&pool.length>=2)pool=pool.filter(v=>v.id!==exclure);
  const urne=pool.slice(),pris=[];
  for(let i=0;i<taille&&urne.length;i++)pris.push(urne.splice(rng.entier(urne.length),1)[0]);
  pris.sort((a,b)=>(fDe(notes,b.id)-fDe(notes,a.id))||(a.id<b.id?-1:a.id>b.id?1:0));
  return pris[0];
}
function naissances(ctx,G){
  const cfg=ctx.cfg,pop=ctx.pop,rng=Gr.mulberry32(pop.rng>>>0);
  const notes=noterTous(ctx),vus=new Set(pop.dejaVus),phase=pop.phase;
  const champion=vivantDe(ctx,pop.champion.id)||vivantDe(ctx,pop.temoin);
  const nes=[],abandons=[];
  for(let k=0;k<cfg.lambda;k++){
    let g,parents,origine;
    if(k<(cfg.immigres||0)){
      g=Gn.muter(champion.genome,rng,{phase:phase,cfg:cfg,genes:cfg.immigreGenes,sigma:cfg.immigreSigma}).genome;parents=[champion.id];origine='immigre';
    }else{
      const p1=tournoi(ctx,notes,rng,null),u=rng.suivant();
      if(u<cfg.pCroisement){
        const p2=tournoi(ctx,notes,rng,p1.id);
        g=Gn.muter(Gn.croiser(p1.genome,p2.genome,rng),rng,{phase:phase,cfg:cfg}).genome;parents=[p1.id,p2.id];origine='croisement';
      }else{g=Gn.muter(p1.genome,rng,{phase:phase,cfg:cfg}).genome;parents=[p1.id];origine='mutation';}
    }
    let id=Gn.idDe(g),essais=0;
    while(vus.has(id)&&essais<cfg.essaisDoublon){g=Gn.muter(g,rng,{phase:phase,cfg:cfg}).genome;id=Gn.idDe(g);essais++;}
    if(vus.has(id)){abandons.push({id:id,parents:parents,origine:origine});evenement(ctx,'enfant abandonne : doublon apres '+essais+' remutations');continue;}
    vus.add(id);
    const p0=vivantDe(ctx,parents[0]);
    const v={id:id,genome:g,shaPilote:null,ne:G,parents:parents,origine:origine,mutes:diffGenomes(g,p0.genome),pannesGeneration:0};
    nes.push(v);
  }
  for(const v of nes){pop.vivants.push(v);texteDe(ctx,v);}
  const r=Gr.grainesEntrainement(pop.graines,rng,pop.nGraines,cfg);
  pop.graines=r.eg;pop.grainesGeneration=r.graines;
  pop.rng=rng.etat();pop.generation=G;pop.etape='courses';pop.dejaVus=[...vus];
  pop.naissancesGeneration=nes.map(v=>({id:v.id,parents:v.parents,origine:v.origine,mutes:v.mutes.map(m=>m.cle)}));
  pop.abandonsGeneration=abandons;
  for(const v of pop.vivants)v.pannesGeneration=0;
  ecrirePop(ctx);
  ctx.dire('generation '+G+' : '+nes.length+' naissance(s) ('+nes.map(v=>court(v.id)+' '+v.origine).join(', ')+') ; graines '+r.graines.join(' '));
}

/* ---------- LA GENERATION 0 (§ 6.2) ---------- */
function generation0(ctx){
  const cfg=ctx.cfg,rng=Gr.mulberry32(cfg.graineMaitre>>>0);
  const T=Gn.genomeTemoin(cfg),tid=Gn.idDe(T);
  const vivants=[{id:tid,genome:T,shaPilote:null,ne:0,parents:[],origine:'temoin',mutes:[],pannesGeneration:0}],vus=new Set([tid]);
  const g0=cfg.generation0||{genesMin:3,genesMax:6,sigma:.15};
  while(vivants.length<cfg.mu){
    let g=Gn.muter(T,rng,{phase:'A',cfg:cfg,genes:g0.genesMin+rng.entier(g0.genesMax-g0.genesMin+1),sigma:g0.sigma}).genome,id=Gn.idDe(g),essais=0;
    while(vus.has(id)&&essais<cfg.essaisDoublon){g=Gn.muter(g,rng,{phase:'A',cfg:cfg}).genome;id=Gn.idDe(g);essais++;}
    if(vus.has(id))throw new Error('evoluer : generation 0 impossible (doublons)');
    vus.add(id);vivants.push({id:id,genome:g,shaPilote:null,ne:0,parents:[tid],origine:'g0',mutes:diffGenomes(g,T),pannesGeneration:0});
  }
  const eg0=Gr.etatInitial(cfg),nG=cfg.grainesParGeneration,r=Gr.grainesEntrainement(eg0,rng,nG,cfg);
  ctx.pop={format:'evolution-population-1',generation:0,etape:'courses',phase:'A',phaseDepuis:0,sansSacre:0,
    epoque:{courses:ctx.epoque.courses,note:ctx.epoque.note,depuis:0,composants:ctx.epoque.composants},
    rng:rng.etat(),graines:r.eg,grainesGeneration:r.graines,nGraines:nG,grainesRetirees:[],regle6:cfg.validation.regle6,
    temoin:tid,champion:{id:tid,depuis:0,fichier:null,revalider:false},derniereValidation:-99,dernierCoffre:null,nSacres:0,coffreEpoque:true,
    vivants:vivants,dejaVus:[...vus],naissancesGeneration:vivants.map(v=>({id:v.id,parents:v.parents,origine:v.origine,mutes:v.mutes.map(m=>m.cle)})),abandonsGeneration:[]};
  for(const v of vivants)texteDe(ctx,v);
  ecrirePop(ctx);
  ctx.neeIci=true;
  ctx.dire('generation 0 : le temoin '+tid+' et '+(vivants.length-1)+' mutants ; graines '+r.graines.join(' '));
}

/* ---------- L'EPOQUE ET L'IDENTITE (§ 6.1, etape 1) ---------- */
function ceQuiAChange(a,b){
  if(!a||!b)return 'inconnu';
  const r=[];
  for(const k of ['jeu_sha','version','simulateur','node','regime','reseaux','etalon','noteCfg'])if(a[k]!==b[k])r.push(k==='reseaux'?'reseaux/retourFige':k);
  const fa=a.fichiers||{},fb=b.fichiers||{};
  for(const k of Object.keys(Object.assign({},fa,fb)))if(fa[k]!==fb[k])r.push(k.replace(/^ml\/(bot|evolution|reel)\//,''));
  return r.join(', ')||'inconnu';
}
async function controleIdentite(ctx){
  const I=require('./identite');
  ctx.dire('identite : le temoin doit rejouer pilote-voltige au bit pres ('+((ctx.cfg.identite&&ctx.cfg.identite.graines)||[]).join(' ')+', '+((ctx.cfg.identite&&ctx.cfg.identite.tmax)||45)+' s)');
  const r=await I.verifier({cfg:ctx.cfg,travailleurs:Math.max(1,Math.min(4,ctx.cfg.travailleurs||1))});
  for(const l of r.lignes)ctx.dire('identite : graine '+l.graine+' : '+(l.identique?'IDENTIQUE ('+(l.temoin&&l.temoin.empreinte)+')':
    'DIFFERENT (temoin '+(l.temoin&&l.temoin.empreinte)+(l.temoin&&l.temoin.raison?' ['+l.temoin.raison+']':'')+' ; voltige '+(l.voltige&&l.voltige.empreinte)+')'));
  if(!r.ok)throw new Error('evoluer : identite ratee : le genome temoin ne rejoue plus pilote-voltige.js (modele.js, genome.js ou les yeux ont change)');
  evenement(ctx,'identite verifiee');
}
async function preparer(ctx){
  const cfg=ctx.cfg,ep=K.epoque(cfg);
  if(ep.courses!==ctx.epoque.courses){
    /* un fichier de l'epoque a change pendant la marche : nouvel ordonnanceur, nouvelles lignes */
    await ctx.ord.arreter();
    ctx.epoque=ep;ctx.textes.clear();ctx.ord=creerOrd(ctx);chargerLignes(ctx);
  }
  /* l'epoque des notes a change (l'etalon des joueurs) : la reference est relue sur le disque, pas reprise du cache de ressemblance.js */
  const noteChangee=ep.note!==ctx.epoque.note;
  ctx.epoque=ep;
  ctx.REF=N.referenceEpoque({recharger:noteChangee});
  const shaId=shaIdentite(cfg);
  if(!ctx.pop){
    evenement(ctx,'premier lancement : epoque '+ep.courses);
    await controleIdentite(ctx);
    generation0(ctx);
    ctx.pop.identite=shaId;ecrirePop(ctx);
    return;
  }
  const pop=ctx.pop;
  const temoinNeuf=Gn.idDe(Gn.genomeTemoin(cfg));
  if(temoinNeuf!==pop.temoin&&ctx.temoinDit!==temoinNeuf){
    ctx.temoinDit=temoinNeuf;
    evenement(ctx,'ATTENTION : pilote-voltige.js ne donne plus le genome du temoin de la population ('+court(pop.temoin)+' ; aujourd\'hui '+court(temoinNeuf)+
      ') : le temoin reste celui de la naissance de la population');
  }
  if(pop.epoque.courses!==ep.courses){
    evenement(ctx,'nouvelle epoque : '+ceQuiAChange(pop.epoque.composants,ep.composants)+' ('+pop.epoque.courses+' -> '+ep.courses+')');
    await controleIdentite(ctx);
    pop.identite=shaId;
    pop.epoque={courses:ep.courses,note:ep.note,depuis:pop.etape==='fin'?pop.generation+1:pop.generation,composants:ep.composants};
    pop.grainesRetirees=[];pop.nGraines=cfg.grainesParGeneration;
    pop.champion.revalider=pop.champion.id!==pop.temoin;
    pop.coffreEpoque=true;
    ctx.textes.clear();for(const v of pop.vivants)texteDe(ctx,v);
    ecrirePop(ctx);
  }else if(pop.epoque.note!==ep.note){
    evenement(ctx,'nouvelle epoque de notes : '+ceQuiAChange(pop.epoque.composants,ep.composants)+' (les courses restent valables)');
    pop.epoque.note=ep.note;pop.epoque.composants=ep.composants;
    ctx.REF=N.referenceEpoque({recharger:true});
    ecrirePop(ctx);
  }else for(const v of pop.vivants)texteDe(ctx,v);
  if(pop.identite!==shaId){
    /* genome.js, pilote-voltige.js ou le texte du temoin ont change sans changer l'epoque des courses (le shaPilote, dans la cle, suffit au cache) */
    evenement(ctx,'genome.js, pilote-voltige.js ou le texte du temoin ont change ('+(pop.identite||'aucune empreinte')+' -> '+shaId+') : controle d\'identite');
    await controleIdentite(ctx);
    pop.identite=shaId;
    ctx.textes.clear();for(const v of pop.vivants)texteDe(ctx,v);
    ecrirePop(ctx);
  }
}

/* ---------- LES MORTS ---------- */
function ligneMort(ctx,v,G,raison,note){
  const x=note||{};
  return {id:v.id,genome:v.genome,parents:v.parents,origine:v.origine,ne:v.ne,mort:G,raison:raison,n:x.n||0,a:r4(x.a),ahat:r4(x.ahat),E:r4(x.E),
    F:r4(x.F),se_F:r4(x.se_F),ecartClassique:r4(x.ecartClassique),epoque:ctx.epoque.courses};
}
function ecrireMort(ctx,l){
  if(ctx.deja.morts.has(l.id))return;
  C.ajouterLigne(ctx.P.morts,l);ctx.deja.morts.add(l.id);
}

/* ---------- LE CHAMPION (§ 3.11) ---------- */
function nombreCourt(x){return String(x);}
function ecrireChampion(ctx,v,G,o){
  o=o||{};
  const cfg=ctx.cfg,pop=ctx.pop,texte=texteDe(ctx,v),sha=v.shaPilote;
  const nom='g'+String(G).padStart(4,'0')+'-'+sha.slice(0,8);
  fs.mkdirSync(ctx.P.champions,{recursive:true});
  const fjs=path.join(ctx.P.champions,nom+'.js'),fjson=path.join(ctx.P.champions,nom+'.json');
  C.ecrireAtomique(fjs,texte);
  const T=vivantDe(ctx,pop.temoin);
  const mutes=[];
  if(T){for(const b of Gn.BORNES)if(v.genome.A[b.cle]!==T.genome.A[b.cle])mutes.push({cle:b.cle,temoin:T.genome.A[b.cle],valeur:v.genome.A[b.cle]});
    for(const t of ['WV','WS'])if(v.genome[t].some((x,i)=>x!==T.genome[t][i]))mutes.push({cle:t,temoin:null,valeur:'tete modifiee'});}
  const reels=mutes.filter(m=>m.cle!=='WV'&&m.cle!=='WS'),tetes=mutes.filter(m=>m.cle==='WV'||m.cle==='WS');
  const raison='generation '+G+' : '+reels.length+' reglage'+(reels.length>1?'s':'')+' mute'+(reels.length>1?'s':'')+(reels.length?' : '+
    reels.slice(0,8).map(m=>m.cle+' '+nombreCourt(m.temoin)+'→'+nombreCourt(m.valeur)).join(', ')+(reels.length>8?', …':''):'')+
    (tetes.length?' ; tetes modifiees : '+tetes.map(m=>m.cle).join(', '):'')+' ; phase '+pop.phase;
  const j={format:'evolution-champion-1',generation:G,id:v.id,shaPilote:sha,epoque:ctx.epoque.courses,phase:pop.phase,date:new Date().toISOString(),
    genome:v.genome,parents:v.parents,ne:v.ne,precedent:o.precedent||null,mutesDepuisTemoin:mutes,raison:raison,
    entrainement:o.entrainement||null,validation:o.validation||null,coffre:null};
  C.ecrireAtomique(fjson,JSON.stringify(j,null,1)+'\n');
  return {js:fjs,json:fjson,rel:path.relative(C.DOSSIER,fjs).split(path.sep).join('/')};
}

/* ---------- LA VALIDATION (§ 6.4, 6.5) ---------- */
async function validation(ctx,G,A,B,usage,notes,forcee){
  const cfg=ctx.cfg,pop=ctx.pop;
  const r=Gr.grainesValidation(pop.graines,cfg.validation.graines,cfg);
  if(r.alerte)evenement(ctx,r.alerte);
  pop.graines=r.eg;
  if(!r.graines.length)return null;
  ctx.dire((usage==='revalidation'?'revalidation : ':'validation : ')+court(A.id)+' contre '+court(B.id)+' sur '+r.graines.length+' graines neuves ('+r.graines[0]+'…)');
  const taches=[];for(const g of r.graines){taches.push(tache(ctx,A,g,usage,G));taches.push(tache(ctx,B,g,usage,G));}
  const L=await courir(ctx,taches);
  if(L.some(l=>l===null))return {interrompue:true};
  const LA=L.filter(l=>l.id===A.id),LB=L.filter(l=>l.id===B.id);
  const cmp=N.comparer(LA,LB,{REF:ctx.REF,cfg:cfg});
  const nA=notes.par[A.id]||{},nB=notes.par[B.id]||{};
  const dFe=fini(nA.F)&&fini(nB.F)?nA.F-nB.F:null,se=Math.sqrt(Math.pow(nA.se_F||0,2)+Math.pow(nB.se_F||0,2));
  const malediction=dFe!=null&&cmp.dF!=null?dFe-cmp.dF:null;
  let moyenne=null;
  if(usage==='validation'&&!forcee&&fini(malediction)){
    const M=ctx.maledictions.concat([malediction]).slice(-(cfg.validation.maledictionFenetre||10));
    moyenne=M.reduce((s,x)=>s+x,0)/M.length;
  }
  const V0={generation:G,date:new Date().toISOString(),usage:usage};
  if(forcee)V0.forcee=true;
  return Object.assign(V0,{meneur:A.id,champion:B.id,graines:r.graines,
    entrainement:{dF:r4(dFe),se_dF:r4(se)},
    validation:{graines:cmp.graines,dF:r4(cmp.dF),se_dF:r4(cmp.se_dF),dPalier:r4(cmp.dPalier),se_dPalier:r4(cmp.se_dPalier),dE:r4(cmp.dE),se_dE:r4(cmp.se_dE)},
    criteres:cmp.criteres,sacre:cmp.sacre,malediction:r4(malediction),maledictionMoyenne:r4(moyenne),fichier:null,_cmp:cmp,_nA:nA});
}
function ecrireValidation(ctx,V){
  const l=Object.assign({},V);delete l._cmp;delete l._nA;delete l.interrompue;
  const k=cleValidation(l);
  if(!ctx.deja.validations.has(k)){C.ajouterLigne(ctx.P.validations,l);ctx.deja.validations.add(k);
    if(compteMalediction(l))ctx.maledictions.push(l.malediction);}
  return l;
}
/* un sacre : fichiers du champion, nouveau protege */
function sacrer(ctx,v,G,V){
  const pop=ctx.pop,nA=V._nA||{};
  const f=ecrireChampion(ctx,v,G,{precedent:pop.champion.id,
    entrainement:{n:nA.n,a:r4(nA.a),ahat:r4(nA.ahat),E:r4(nA.E),F:r4(nA.F),se_F:r4(nA.se_F),ecartClassique:r4(nA.ecartClassique)},
    validation:Object.assign({graines:V.graines},V.validation,{graines:V.graines})});
  V.fichier=f.rel;
  evenement(ctx,'SACRE : '+v.id+' devient champion (ancien : '+pop.champion.id+') -> '+f.rel);
  pop.champion={id:v.id,depuis:G,fichier:f.rel,revalider:false};
  pop.nSacres=(pop.nSacres||0)+1;
  return f;
}

/* ---------- LE COFFRE (§ 6.6) ---------- */
async function coffre(ctx,G,raison){
  const cfg=ctx.cfg,pop=ctx.pop,graines=Gr.grainesCoffre(cfg);
  const ch=vivantDe(ctx,pop.champion.id),te=vivantDe(ctx,pop.temoin),qui=ch.id===te.id?[te]:[ch,te];
  ctx.dire('coffre ('+raison+') : '+qui.map(v=>court(v.id)).join(' et ')+' sur les '+graines.length+' graines du coffre');
  const taches=[];for(const g of graines)for(const v of qui)taches.push(tache(ctx,v,g,'coffre',G));
  const L=await courir(ctx,taches);
  if(L.some(l=>l===null))return {interrompue:true};
  const bilan=v=>{
    const M=L.filter(l=>l.id===v.id&&l.mesuree===true);
    const e=N.ecartFoule(M.map(l=>l.mesures),ctx.REF,cfg,Gr.rngDe('coffre|'+v.id+'|'+M.length));
    return {id:v.id,n:M.length,palierMoyen:M.length?r4(M.reduce((s,l)=>s+l.palier,0)/M.length):null,E:r4(e.E),ecartClassique:r4(e.ecartClassique)};};
  const bt=bilan(te),bc=ch.id===te.id?bt:bilan(ch);
  const d=(a,b)=>fini(a)&&fini(b)?r4(a-b):null;
  return {date:new Date().toISOString(),generation:G,epoque:ctx.epoque.courses,raison:raison,graines:graines.length,champion:bc,temoin:bt,
    diff:{palier:d(bc.palierMoyen,bt.palierMoyen),E:d(bc.E,bt.E),ecartClassique:d(bc.ecartClassique,bt.ecartClassique)}};
}
function ecrireCoffre(ctx,k){
  const c=k.generation+'|'+k.raison;
  if(!ctx.deja.coffre.has(c)){C.ajouterLigne(ctx.P.coffre,k);ctx.deja.coffre.add(c);}
  ctx.pop.dernierCoffre=k.date;
}

/* ---------- LA DIVERSITE ---------- */
function diversite(V){
  let s=0,s2=0,n=0;
  for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){s+=Gn.distance(V[i].genome,V[j].genome);s2+=Gn.distanceW2(V[i].genome,V[j].genome);n++;}
  return {distance:n?r4(s/n):0,distanceW2:n?+(s2/n).toFixed(6):0};
}

/* ---------- UNE GENERATION (§ 6.1) ---------- */
async function generation(ctx){
  const cfg=ctx.cfg;
  const t0=Date.now(),st0=ctx.ord.stats(),taches0=ctx.taches;
  await preparer(ctx);
  const pop=ctx.pop;
  if(pop.etape==='fin')naissances(ctx,pop.generation+1);
  else if(!ctx.neeIci)ctx.dire('generation '+pop.generation+' : reprise (naissances deja faites, le cache rend les courses deja jouees)');
  const G=pop.generation;
  const stA=ctx.ord.stats();   /* l'ordonnanceur a pu etre recree par preparer */
  const base=stA.jouees<st0.jouees?{jouees:0,cache:0,nonMesurees:0,relancees:0,tuees:0,ms:0}:st0;

  /* 3. LES COURSES */
  const taches=[];
  for(const g of pop.grainesGeneration)for(const v of pop.vivants)taches.push(tache(ctx,v,g,'entrainement',G));
  ctx.dire('generation '+G+' : '+taches.length+' courses ('+pop.vivants.length+' pilotes x '+pop.grainesGeneration.length+' graines, '+cfg.tmax+' s au plus, '+cfg.travailleurs+' a la fois)');
  /* la duree des seules courses d'entrainement, sans la PAUSE (l'economie de graines se decide dessus) */
  const tE0=Date.now(),pE0=pauseMs(ctx),jE0=ctx.ord.stats().jouees;
  const L=await courir(ctx,taches);
  if(L.some(l=>l===null))return {interrompue:true,generation:G};
  enPause(ctx);
  const dureeEnt_s=Math.max(0,Math.round(((Date.now()-tE0)-(pauseMs(ctx)-pE0))/1000)),joueesEnt=ctx.ord.stats().jouees-jE0;

  /* 4. RETRAITS ET PANNES (2026-11-27, le correcteur ; relecture statistique) :
     - une graine n'est retiree pour l'epoque que si elle a manque a DEUX pilotes ou plus (ou au temoin) : l'echec d'un seul pilote est le sien,
       ses lignes non mesurees n'entrent pas dans la note et le modele pilote + graine juge les autres sur toutes leurs graines ;
     - les pannes de cerveau se comptent sur TOUS les essais (l.pannesEssais) ;
     - un pilote (hors temoin) qui a cfg.nonMesureesVire (2) courses non mesurees ou plus dans la generation est vire d'office ('non-mesuree') :
       sinon, n'ayant aucune course mesuree, il ne serait jamais renvoyable. */
  const morts=[],mortsJ=[];
  pop.grainesRetirees=pop.grainesRetirees||[];
  const ratesParGraine=new Map(),ratesParPilote=new Map();
  for(const l of L)if(l.mesuree!==true){
    if(!ratesParGraine.has(l.graine))ratesParGraine.set(l.graine,new Map());
    ratesParGraine.get(l.graine).set(l.id,l.raison);
    ratesParPilote.set(l.id,(ratesParPilote.get(l.id)||0)+1);
  }
  for(const [g,qui] of ratesParGraine){
    if(pop.grainesRetirees.indexOf(g)>=0)continue;
    const ids=[...qui.keys()];
    if(ids.length===1&&ids[0]!==pop.temoin){
      evenement(ctx,'graine '+g+' : seul '+court(ids[0])+' n\'est pas mesure ('+qui.get(ids[0])+') : la graine reste pour les autres');continue;}
    pop.grainesRetirees.push(g);
    evenement(ctx,'graine '+g+' retiree pour l\'epoque ('+ids.map(i=>court(i)+(i===pop.temoin?' (temoin)':'')).join(', ')+' : '+qui.get(ids[0])+')');
  }
  for(const v of pop.vivants){v.pannesGeneration=0;for(const l of L)if(l.id===v.id)v.pannesGeneration+=(l.pannesEssais!=null?l.pannesEssais:l.pannes)|0;}
  let notes=noterTous(ctx);
  const virerOffice=(v,raison,texte)=>{
    const l=ligneMort(ctx,v,G,raison,notes.par[v.id]);mortsJ.push(l);morts.push({id:v.id,raison:raison});
    pop.vivants=pop.vivants.filter(x=>x!==v);
    evenement(ctx,court(v.id)+' vire d\'office : '+texte);
    if(v.id===pop.champion.id){evenement(ctx,'le champion est mort ('+raison+') : le temoin redevient champion');pop.champion={id:pop.temoin,depuis:G,fichier:null,revalider:false};}
  };
  for(const v of pop.vivants.slice()){
    if(v.pannesGeneration<(cfg.pannesVire||2))continue;
    if(v.id===pop.temoin)throw new Error('evoluer : le temoin a fait '+v.pannesGeneration+' pannes de cerveau dans la generation '+G+' : le PC est trop charge ou le simulateur derive');
    virerOffice(v,'pannes',v.pannesGeneration+' pannes de cerveau');
  }
  for(const v of pop.vivants.slice()){
    const n=ratesParPilote.get(v.id)||0;
    if(v.id===pop.temoin||n<(cfg.nonMesureesVire||2))continue;
    virerOffice(v,'non-mesuree',n+' courses non mesurees dans la generation');
  }

  /* 5. LA NOTE */
  notes=noterTous(ctx);

  /* 6. LE RENVOI */
  const elig=pop.vivants.filter(v=>v.id!==pop.temoin&&v.id!==pop.champion.id&&nDe(notes,v.id)>=cfg.protectionCourses);
  const nVirer=Math.max(0,Math.min(elig.length,pop.vivants.length-cfg.mu));
  const surv=id=>{const x=notes.par[id];return x&&fini(x.survie)?x.survie:-Infinity;};
  elig.sort((a,b)=>(fDe(notes,a.id)-fDe(notes,b.id))||(surv(a.id)-surv(b.id))||(a.id<b.id?-1:a.id>b.id?1:0));
  for(const v of elig.slice(0,nVirer)){
    mortsJ.push(ligneMort(ctx,v,G,'renvoi',notes.par[v.id]));morts.push({id:v.id,raison:'renvoi'});
    pop.vivants=pop.vivants.filter(x=>x!==v);
    ctx.dire('renvoi : '+court(v.id)+' (F '+(fini(fDe(notes,v.id))?fDe(notes,v.id).toFixed(2):'?')+', '+nDe(notes,v.id)+' courses)');
  }
  /* les lignes de morts.jsonl ne s'ecrivent qu'avec l'etat final (plus bas, juste avant population.json etape 'fin') : une generation interrompue
     pendant la validation ou le coffre refait son renvoi a la reprise, et morts.jsonl ne doit pas garder un pilote resté vivant (2026-11-27, le correcteur) */

  /* 7. VALIDATION, COFFRE, PHASE, ECONOMIE */
  let V=null,raisonCoffre=null,sacre=false;
  const champ=()=>vivantDe(ctx,pop.champion.id);
  if(pop.champion.revalider){
    if(pop.champion.id!==pop.temoin){
      const R=await validation(ctx,G,champ(),vivantDe(ctx,pop.temoin),'revalidation',notes);
      if(R&&R.interrompue)return {interrompue:true,generation:G};
      if(R){
        const perd=R.validation.dF!=null&&R.validation.dF< -(cfg.validation.revalidationPerte||1)*(R.validation.se_dF||0);
        R.sacre=!perd;
        if(perd){evenement(ctx,'revalidation : le champion '+court(pop.champion.id)+' perd son titre, le temoin redevient champion');pop.champion={id:pop.temoin,depuis:G,fichier:null,revalider:false};}
        else evenement(ctx,'revalidation : le champion '+court(pop.champion.id)+' garde son titre');
        V=ecrireValidation(ctx,R);
      }
    }
    pop.champion.revalider=false;
  }
  const meneur=pop.vivants.filter(v=>v.id!==pop.champion.id&&nDe(notes,v.id)>=cfg.validation.nMin)
    .sort((a,b)=>(fDe(notes,b.id)-fDe(notes,a.id))||(a.id<b.id?-1:1))[0]||null;
  if(!V&&meneur&&G-pop.derniereValidation>=cfg.validation.intervalle){
    const nm=notes.par[meneur.id],nc=notes.par[pop.champion.id];
    if(nm&&nc&&fini(nm.F)&&fini(nc.F)&&fini(nm.se_F)&&fini(nc.se_F)&&nm.F-nc.F>pop.regle6*Math.sqrt(nm.se_F*nm.se_F+nc.se_F*nc.se_F)){
      const R=await validation(ctx,G,meneur,champ(),'validation',notes);
      if(R&&R.interrompue)return {interrompue:true,generation:G};
      if(R){
        pop.derniereValidation=G;
        if(R.sacre){sacrer(ctx,meneur,G,R);sacre=true;}
        else ctx.dire('validation : '+court(meneur.id)+' pas sacre (dF '+R.validation.dF+' +- '+R.validation.se_dF+')');
        V=ecrireValidation(ctx,R);
        const M=ctx.maledictions.slice(-(cfg.validation.maledictionFenetre||10));
        if(M.length>=(cfg.validation.maledictionFenetre||10)&&M.reduce((s,x)=>s+x,0)/M.length>cfg.validation.maledictionSeuil&&pop.regle6!==cfg.validation.regle6Haute){
          evenement(ctx,'regle 6 : '+pop.regle6+' -> '+cfg.validation.regle6Haute+' (malediction du gagnant moyenne '+(M.reduce((s,x)=>s+x,0)/M.length).toFixed(2)+')');
          pop.regle6=cfg.validation.regle6Haute;}
      }
    }
  }
  if(sacre)raisonCoffre='sacre';
  else if(pop.coffreEpoque)raisonCoffre='epoque';
  else if(!pop.dernierCoffre||Date.now()-Date.parse(pop.dernierCoffre)>(cfg.coffre.intervalle_h||24)*3600e3)raisonCoffre='24h';
  let K0=null;
  if(raisonCoffre){
    const k=await coffre(ctx,G,raisonCoffre);
    if(k&&k.interrompue)return {interrompue:true,generation:G};
    ecrireCoffre(ctx,k);K0=k;pop.coffreEpoque=false;
    ctx.dire('coffre : champion - temoin = palier '+k.diff.palier+', E '+k.diff.E+', ecart classique '+k.diff.ecartClassique);
  }
  pop.sansSacre=sacre?0:(pop.sansSacre||0)+1;
  const SUITE={A:'B',B:'C'},pp=cfg.phases.passage;
  if(SUITE[pop.phase]&&(pop.sansSacre>=pp.sansSacre||G-pop.phaseDepuis>=pp.generations)){
    evenement(ctx,'phase '+SUITE[pop.phase]+' (apres '+pop.sansSacre+' generations sans sacre, '+(G-pop.phaseDepuis)+' depuis la phase '+pop.phase+')');
    pop.phase=SUITE[pop.phase];pop.phaseDepuis=G;pop.sansSacre=0;
  }
  const duree_s=Math.round((Date.now()-t0)/1000);
  /* L'ECONOMIE (2026-11-27, le correcteur ; relecture statistique « l'economie se declenche sur une duree qui compte la PAUSE, la validation et
     le coffre ») : sur la seule duree des courses d'entrainement, hors PAUSE, ramenee a toutes les courses demandees (le cache en saute) et a
     grainesParGeneration graines. Au-dessus du seuil : grainesEconomie ; sous 90 % du seuil : retour a grainesParGeneration. Une generation dont
     moins de la moitie des courses a ete jouee (reprise) ne decide rien. */
  let pleine_s=null;
  if(joueesEnt>0&&joueesEnt>=taches.length/2){
    pleine_s=Math.round(dureeEnt_s*taches.length/joueesEnt*cfg.grainesParGeneration/Math.max(1,pop.grainesGeneration.length));
    if(pleine_s>cfg.seuilEconomie_s&&pop.nGraines!==cfg.grainesEconomie){
      evenement(ctx,'graines '+pop.nGraines+' -> '+cfg.grainesEconomie+' (courses d\'entrainement : '+dureeEnt_s+' s, soit '+pleine_s+' s pour '+cfg.grainesParGeneration+' graines)');
      pop.nGraines=cfg.grainesEconomie;}
    else if(pleine_s<=0.9*cfg.seuilEconomie_s&&pop.nGraines!==cfg.grainesParGeneration){
      evenement(ctx,'graines '+pop.nGraines+' -> '+cfg.grainesParGeneration+' (courses d\'entrainement : '+pleine_s+' s pour '+cfg.grainesParGeneration+' graines, sous le seuil)');
      pop.nGraines=cfg.grainesParGeneration;}
  }

  /* 8. LE JOURNAL, L'ETAT, LE TABLEAU */
  const st=ctx.ord.stats(),dS=k=>st[k]-base[k];
  const meneurN=meneur?resumeNote(notes.par[meneur.id]):null;
  const div=diversite(pop.vivants);
  const rapport={generation:G,date:new Date().toISOString(),duree_s:duree_s,dureeEntrainement_s:dureeEnt_s,pleine_s:pleine_s,epoque:ctx.epoque.courses,epoqueNote:ctx.epoque.note,phase:pop.phase,
    nGraines:pop.grainesGeneration.length,graines:pop.grainesGeneration,
    courses:{demandees:ctx.taches-taches0,cache:dS('cache'),jouees:dS('jouees'),nonMesurees:dS('nonMesurees'),relancees:dS('relancees'),tuees:dS('tuees'),
      grainesRetirees:(pop.grainesRetirees||[]).slice()},
    debit_h:duree_s>0?+(dS('jouees')*3600/duree_s).toFixed(1):null,
    naissances:pop.naissancesGeneration||[],morts:morts,
    meneur:meneurN,temoin:resumeNote(notes.par[pop.temoin]),champion:resumeNote(notes.par[pop.champion.id]),
    population:pop.vivants.map(v=>{const x=notes.par[v.id]||{};return {id:v.id,ne:v.ne,n:x.n||0,ahat:r4(x.ahat),E:r4(x.E),F:r4(x.F),se_F:r4(x.se_F)};}),
    distance:div.distance,distanceW2:div.distanceW2,sigmaRes:r4(notes.sigmaRes),
    validation:V?{usage:V.usage,meneur:V.meneur,champion:V.champion,sacre:V.sacre,dF:V.validation.dF,se_dF:V.validation.se_dF}:null,
    coffre:K0?{raison:K0.raison,diff:K0.diff}:null,
    evenements:ctx.evenements.splice(0)};
  for(const l of mortsJ)ecrireMort(ctx,l);
  if(!ctx.deja.generations.has(G)){C.ajouterLigne(ctx.P.generations,rapport);ctx.deja.generations.add(G);}
  else ctx.dire('generation '+G+' : deja au journal (reprise d\'une generation finie) : la ligne n\'est pas recopiee');
  pop.etape='fin';
  ecrirePop(ctx);
  ecrireTableau(ctx);
  ctx.dire('generation '+G+' finie en '+duree_s+' s : '+rapport.courses.jouees+' jouees, '+rapport.courses.cache+' du cache ; meneur '+(meneurN?court(meneurN.id)+' F '+meneurN.F:'aucun')+
    ' ; vires '+(morts.map(m=>court(m.id)+' ('+m.raison+')').join(', ')||'aucun')+' ; champion '+court(pop.champion.id)+(pop.champion.id===pop.temoin?' (le temoin)':''));
  return rapport;
}
function ecrireTableau(ctx){
  try{require('./tableau').ecrire(ctx.cfg);}catch(e){ctx.dire('tableau : non ecrit ('+String(e&&e.message||e).slice(0,200)+')');}
}

/* ---------- --valider-maintenant ---------- */
async function validerMaintenant(ctx){
  if(!ctx.pop)throw new Error('evoluer : --valider-maintenant sans population (lancer au moins une generation d\'abord)');
  await preparer(ctx);
  const pop=ctx.pop,cfg=ctx.cfg,notes=noterTous(ctx),G=pop.generation;
  const autres=pop.vivants.filter(v=>v.id!==pop.champion.id).sort((a,b)=>(fDe(notes,b.id)-fDe(notes,a.id))||(a.id<b.id?-1:1));
  const meneur=autres.find(v=>nDe(notes,v.id)>=cfg.validation.nMin)||autres[0];
  if(!meneur)throw new Error('evoluer : aucun meneur a valider (un seul vivant ?)');
  /* forcee : sans le filtre de la regle 6 ni nMin ; elle n'entre pas dans la malediction du gagnant */
  const R=await validation(ctx,G,meneur,vivantDe(ctx,pop.champion.id),'validation',notes,true);
  if(!R){ctx.dire('validation : plus de graines de validation');return null;}
  if(R.interrompue){ctx.dire('validation interrompue (STOP)');return R;}
  pop.derniereValidation=G;
  if(R.sacre){sacrer(ctx,meneur,G,R);}
  const l=ecrireValidation(ctx,R);
  ctx.dire('validation : '+court(meneur.id)+' contre '+court(l.champion)+' : '+(l.sacre?'SACRE':'pas sacre')+' (dF '+l.validation.dF+' +- '+l.validation.se_dF+
    ', dPalier '+l.validation.dPalier+', dE '+l.validation.dE+' ; criteres a '+l.criteres.a+' b '+l.criteres.b+' c '+l.criteres.c+')');
  if(R.sacre){const k=await coffre(ctx,G,'sacre');if(k&&!k.interrompue)ecrireCoffre(ctx,k);}
  ecrirePop(ctx);
  ecrireTableau(ctx);
  return l;
}

/* ===== LE BANC : COMBIEN DE COURSES A LA FOIS SUR CE PC (§ 5.4 ; 2026-11-27, « machine » : plus jamais dans config.json, dans <etat>/machine.json) =====
   Pour chaque nombre n de la liste (C.listeBanc : "auto" = {L/2, L-4, L-2, L-1}, L = coeurs logiques ; ou la liste de la config), le temoin joue
   n x max(2, ceil(cfg.banc.courses / n)) courses de cfg.banc.tmax s (des vagues pleines : le meme travail par vague pour chaque n), sur les memes
   graines d'entrainement depuis 910000, sans cache et sans rien ecrire dans courses.jsonl. Retenu : le meilleur debit sans panne, sans course non
   mesuree ni relancee ; a moins de 5 % du meilleur, le plus PETIT n (C.choisirTravailleurs).
   o = {dossierEtat, doitArreter:fn, surOrd:fn(ord), ecrire:true}. STOP, PAUSE ou Ctrl+C (doitArreter) : interrompu.
   Sans nombre valable (echec, interruption, erreur) : repli C.repliTravailleurs (max(1, L-2)), source 'auto', et le banc sera refait au lancement
   suivant (un banc FINI sans nombre valable : au plus C.ECHECS_BANC_MAX fois). Un machine.json qui avait deja un banc reussi n'est jamais ecrase
   par un banc rate (--banc refait a la main sur un PC charge).
   -> {travailleurs, retenu:N|null, interrompu, raison, resultats, machine:objet ecrit|null} */
const SECONDES_REELLES_PAR_SECONDE_DE_JEU=[0.25,1];   /* mesure du 27/11 : ~0,37 s par seconde de jeu en moyenne, jusqu'a ~1 s */
function planBanc(cfg,L){
  const B=cfg.banc||{},liste=C.listeBanc(cfg,L),nC=B.courses||20,tmax=B.tmax||300;
  const etapes=liste.map(n=>{const vagues=Math.max(2,Math.ceil(nC/n));return {travailleurs:n,courses:n*vagues,vagues:vagues};});
  const vagues=etapes.reduce((s,e)=>s+e.vagues,0);
  return {liste:liste,tmax:tmax,etapes:etapes,min_s:Math.round(vagues*tmax*SECONDES_REELLES_PAR_SECONDE_DE_JEU[0]),max_s:Math.round(vagues*tmax*SECONDES_REELLES_PAR_SECONDE_DE_JEU[1]+vagues*5)};
}
const minutes=s=>s<90?Math.round(s)+' s':Math.round(s/60)+' min';
async function banc(cfg,dire,o){
  o=o||{};dire=dire||direDefaut;
  const L=C.coeursLogiques(),dossier=o.dossierEtat||C.chemin(cfg,cfg.dossierEtat),doitArreter=o.doitArreter||(()=>false);
  const plan=planBanc(cfg,L),res=[];
  const avant=C.lireMachine(dossier).machine;
  let interrompu=false,raison=null;
  dire('banc : '+L+' coeurs logiques ; essais a '+plan.liste.join(', ')+' courses a la fois, '+plan.tmax+' s de jeu chacune ('+plan.etapes.map(e=>e.courses+' a '+e.travailleurs).join(', ')+
    ') ; entre '+minutes(plan.min_s)+' et '+minutes(plan.max_s)+' environ');
  try{
    const T=Gn.ecrirePilote(Gn.genomeTemoin(cfg),{cfg:cfg}),sha=Gn.shaPilote(T),E=cfg.graines.entrainement;
    for(const et of plan.etapes){
      if(doitArreter()){interrompu=true;raison='arret demande (STOP, PAUSE ou Ctrl+C)';break;}
      const n=et.travailleurs;
      const ord=K.creer({cfg:cfg,cache:false,ecrire:false,travailleurs:n,doitArreter:doitArreter,
        journal:function(t){if(/NON MESUREE|ERREUR|chien de garde/.test(t))dire('banc : '+t);}});
      if(o.surOrd)o.surOrd(ord);
      const taches=[];for(let i=0;i<et.courses;i++)taches.push({source:T,shaPilote:sha,id:'banc',graine:E.depart+E.pas*i,tmax:plan.tmax,usage:'essai',generation:null});
      dire('banc : '+et.courses+' courses de '+plan.tmax+' s, '+n+' a la fois');
      const t0=Date.now(),R=await ord.demander(taches);await ord.arreter();
      if(o.surOrd)o.surOrd(null);
      const s=(Date.now()-t0)/1000,st=ord.stats();
      if(R.some(l=>l===null)||doitArreter()){interrompu=true;raison='arret demande pendant les courses a '+n+' a la fois';break;}
      const mes=R.filter(l=>l&&l.mesuree===true);
      const r={travailleurs:n,coursesParHeure:+(mes.length*3600/Math.max(1e-3,s)).toFixed(1),
        pannes:R.reduce((x,l)=>x+(((l.pannesEssais!=null?l.pannesEssais:l.pannes))|0),0),nonMesurees:R.filter(l=>l.mesuree!==true).length,
        relancees:st.relancees|0,courses:et.courses,duree_s:Math.round(s)};
      res.push(r);
      dire('banc : '+n+' a la fois : '+r.coursesParHeure+' courses/h en '+minutes(r.duree_s)+(r.pannes||r.nonMesurees||r.relancees?' ; '+r.pannes+' panne(s), '+
        r.nonMesurees+' non mesuree(s), '+r.relancees+' relancee(s) : ce nombre est ecarte':''));
    }
  }catch(e){
    raison='erreur : '+String(e&&e.message||e).slice(0,200);
    dire('banc : '+raison);
  }
  const retenu=interrompu||raison?null:C.choisirTravailleurs(res);
  if(!retenu&&!raison)raison='aucun nombre sans panne ni course non mesuree';
  const bancObj={date:new Date().toISOString(),liste:plan.liste,tmax:plan.tmax,resultats:res,retenu:retenu};
  let machine=null,travailleurs;
  /* (27/11, le relecteur de « machine ») machine.json impossible a ecrire (un dossier a sa place, un fichier tenu ou en lecture seule) : ce n'est
     PAS une erreur fatale (avant : ERREUR FATALE apres des minutes de banc, a chaque lancement) ; le nombre vaut pour ce lancement, on le dit */
  const ecrire=x=>{
    if(o.ecrire===false)return null;
    try{return C.ecrireMachine(dossier,x);}
    catch(e){dire('banc : '+C.cheminMachine(dossier)+' impossible a ecrire ('+String(e&&(e.code||e.message)||e).slice(0,80)+
      ') : le nombre ne vaut que pour ce lancement, le banc sera refait au prochain');return null;}
  };
  if(retenu){
    travailleurs=retenu;
    machine=ecrire({travailleurs:retenu,source:'banc',banc:bancObj});
    dire('banc : '+retenu+' courses a la fois retenu'+(machine?' -> '+C.cheminMachine(dossier):''));
  }else if(avant&&avant.banc&&avant.banc.retenu){
    travailleurs=avant.travailleurs;
    dire('banc : pas de nouveau nombre ('+raison+') : on garde '+avant.travailleurs+', mesure le '+String(avant.banc.date||'?').slice(0,10)+' (machine.json inchange)');
  }else{
    travailleurs=C.repliTravailleurs(L,cfg);
    const echecs=((avant&&avant.banc&&avant.banc.echecs)|0)+(interrompu?0:1);
    Object.assign(bancObj,{raison:raison,interrompu:interrompu,echecs:echecs});
    machine=ecrire({travailleurs:travailleurs,source:'auto',banc:bancObj});
    dire('banc : pas de nombre mesure ('+raison+') : repli sur '+travailleurs+' courses a la fois ; '+
      (interrompu||echecs<C.ECHECS_BANC_MAX?'le banc sera refait au prochain lancement':'banc rate '+echecs+' fois : il ne sera plus refait seul (evoluer.js --banc pour le refaire)'));
  }
  return {travailleurs:travailleurs,retenu:retenu,interrompu:interrompu,raison:raison,resultats:res,machine:machine};
}

/* ===== LA LIGNE DE COMMANDE (27/11/2026, « machine » ; Fable : « node ml/evolution/evoluer.js --aide a LANCE LA VRAIE EVOLUTION ») =====
   Toute option est controlee AVANT la config, le verrou et toute course : --aide / --help / -h affichent l'usage (code 0) ; une option inconnue,
   un mot en trop, une valeur manquante ou absurde, une option donnee deux fois ou deux options incompatibles : l'erreur et l'usage sur stderr, code 2.
   « --option=valeur » vaut « --option valeur ». */
const USAGE=['Usage : node ml/evolution/evoluer.js [options]',
  '  sans option            la selection tourne jusqu\'a STOP (arreter.cmd), Ctrl+C ou une erreur',
  '  --config f.json        une config fusionnee par-dessus config.json (ex. config-essai.json)',
  '  --etat dossier         le dossier d\'etat (relatif a ml/evolution/, ou absolu) ; les champions vont dans <dossier>/champions',
  '  --travailleurs N       N courses a la fois pour ce lancement seulement (1 a '+C.TRAVAILLEURS_MAX+', rien n\'est ecrit)',
  '  --une-generation       une generation, puis arret (= --arret-apres 1)',
  '  --arret-apres N        N generations (N >= 1), puis arret',
  '  --banc                 refait le banc de ce PC (combien de courses a la fois), l\'ecrit dans <etat>/machine.json, puis sort',
  '  --valider-maintenant   une validation meneur contre champion tout de suite, puis sortie',
  '  --bavard               le journal entier des courses',
  '  --aide, --help, -h     ce texte',
  'Sans --travailleurs : le nombre de <etat>/machine.json, mesure par le banc ; au premier lancement sur un PC, le banc est fait d\'abord.',
  'Codes de sortie : 0 arret propre (ou l\'aide) ; 1 erreur fatale ; 2 refus de partir (deja lance, labo, boucle.js) ou option mal ecrite.'].join('\n');
const OPTIONS={'--config':'fichier','--etat':'dossier','--travailleurs':'entier','--arret-apres':'entier',
  '--une-generation':null,'--banc':null,'--valider-maintenant':null,'--bavard':null};
const INCOMPATIBLES=[['--banc','--valider-maintenant'],['--banc','--une-generation'],['--banc','--arret-apres'],['--banc','--travailleurs'],
  ['--valider-maintenant','--une-generation'],['--valider-maintenant','--arret-apres'],['--une-generation','--arret-apres']];
/* -> {aide:true} | {erreur:texte} | {o:{config, etat, travailleurs, arretApres, banc, validerMaintenant, bavard}} ; o.existe(f) (tests) */
function lireOptions(argv,o){
  o=o||{};
  const existe=o.existe||(f=>{try{return fs.existsSync(f);}catch(e){return false;}});
  const A=(argv||[]).map(String),vus=new Map();
  if(A.some(a=>a==='--aide'||a==='--help'||a==='-h'||a==='/?'))return {aide:true};
  for(let i=0;i<A.length;i++){
    let a=A[i],v;
    const eg=/^(--[a-z-]+)=(.*)$/.exec(a);
    if(eg&&Object.prototype.hasOwnProperty.call(OPTIONS,eg[1])){a=eg[1];v=eg[2];}
    if(!Object.prototype.hasOwnProperty.call(OPTIONS,a))
      return {erreur:(/^-/.test(a)?'option inconnue "'+a+'"':'mot inattendu "'+a+'" (une option commence par --)')};
    if(vus.has(a))return {erreur:'option donnee deux fois : '+a};
    const genre=OPTIONS[a];
    if(genre===null){if(v!==undefined)return {erreur:a+' ne prend pas de valeur (lu : "'+A[i]+'")'};vus.set(a,true);continue;}
    if(v===undefined){v=A[i+1];if(v===undefined||/^--/.test(v))return {erreur:a+' attend une valeur ('+genre+')'};i++;}
    if(v.trim()==='')return {erreur:a+' attend une valeur ('+genre+'), pas un texte vide'};
    if(genre==='entier'){
      if(!/^\d+$/.test(v.trim()))return {erreur:a+' attend un nombre entier (lu : "'+v+'")'};
      const n=+v.trim(),max=a==='--travailleurs'?C.TRAVAILLEURS_MAX:1e6;
      if(n<1||n>max)return {erreur:a+' attend un nombre de 1 a '+max+' (lu : '+v+')'};
      v=n;
    }
    if(genre==='fichier'&&!existe(path.resolve(process.cwd(),v))&&!existe(path.resolve(C.DOSSIER,v)))
      return {erreur:a+' : fichier introuvable "'+v+'" (cherche depuis le dossier courant, puis dans ml/evolution/)'};
    vus.set(a,v);
  }
  for(const [x,y] of INCOMPATIBLES)if(vus.has(x)&&vus.has(y))return {erreur:x+' et '+y+' ne vont pas ensemble'};
  const g=k=>vus.has(k)?vus.get(k):null;
  return {o:{config:g('--config'),etat:g('--etat'),travailleurs:g('--travailleurs'),arretApres:vus.has('--une-generation')?1:g('--arret-apres'),
    banc:vus.has('--banc'),validerMaintenant:vus.has('--valider-maintenant'),bavard:vus.has('--bavard')}};
}
/* le nombre de travailleurs et d'ou il vient, en une phrase */
function sourceTravailleurs(cfg){
  const s=cfg._travailleursSource,m=cfg._machine;
  if(s==='ligne de commande')return 'force par --travailleurs';
  if(s==='config')return 'ecrit dans la config';
  if(s==='banc'&&m&&m.banc)return 'mesure par le banc du '+String(m.banc.date||'?').slice(0,10)+', etat/machine.json';
  return 'repli sans banc'+(cfg._bancAFaire?', le banc est a faire':' (banc rate, evoluer.js --banc pour le refaire)');
}

async function principal(argv){
  garderConsole();
  const lu=lireOptions(argv);
  if(lu.aide){ecrireConsole(USAGE+'\n');return 0;}
  if(lu.erreur){ecrireErreur('evoluer : '+lu.erreur+'\n\n'+USAGE+'\n');return 2;}
  const op=lu.o,dire=direDefaut;
  let cfg;
  try{
    cfg=C.lireConfig(op.config);
    if(op.etat){const d=path.resolve(C.DOSSIER,op.etat);cfg.dossierEtat=d;cfg.dossierChampions=path.join(d,'champions');}
    C.resoudreTravailleurs(cfg,{ligne:op.travailleurs});
  }catch(e){ecrireErreur(String(e&&e.message||e)+'\n');return 1;}
  CONSOLE.secours=path.join(C.chemin(cfg,cfg.dossierEtat),'sortie.log');
  const arretApres=op.arretApres!=null?op.arretApres:Infinity;
  dire('evoluer : pid '+process.pid+', etat '+C.chemin(cfg,cfg.dossierEtat)+(cfg._fichier?', config '+path.basename(cfg._fichier):'')+', '+cfg.travailleurs+
    ' courses a la fois ('+sourceTravailleurs(cfg)+'), '+C.coeursLogiques()+' coeurs, node '+process.version);
  let ctx=null,code=0,ctrlC=0,ordBanc=null;
  const avant={demande:false};   /* Ctrl+C avant que ctx n'existe (pendant le banc) */
  const refus=refusDePartir({dire:dire});
  if(refus){dire('REFUS DE PARTIR : '+refus);return 2;}
  /* verrouiller ne leve jamais (toute erreur : refus, code 2) ; surPerte : un autre a pris le verrou, on s'arrete comme sur STOP */
  const V=verrouiller(cfg,{surPerte:function(q){dire('VERROU PERDU ('+q+') : on s\'arrete comme sur STOP');avant.demande=true;if(ctx)ctx.arret.demande=true;}});
  if(!V.ok){dire('REFUS DE PARTIR : '+V.raison);return 2;}
  if(V.repris)dire('verrou repris'+(V.repris.pid?' (laisse par le pid '+V.repris.pid+', qui ne vit plus)':' (illisible)'));
  process.on('SIGINT',function(){
    ctrlC++;
    if(ctrlC===1){dire('Ctrl+C : comme STOP (encore Ctrl+C : on tue les courses en cours)');avant.demande=true;if(ctx)ctx.arret.demande=true;}
    else{dire('Ctrl+C encore : les courses en cours sont tuees (la reprise ne perd qu\'elles)');
      const fin=()=>{V.lacher();process.exit(1);};
      const o=(ctx&&ctx.ord)||ordBanc;
      if(o)o.arreter({dur:true}).then(fin,fin);else fin();}
  });
  const P=chemins(cfg);
  const arretBanc=()=>avant.demande||fs.existsSync(P.stop)||fs.existsSync(P.pause);
  try{
    if(op.banc){
      const R=await banc(cfg,dire,{dossierEtat:P.dossier,doitArreter:arretBanc,surOrd:o=>{ordBanc=o;}});
      if(!R.retenu&&!R.interrompu)code=1;
    }else{
      /* (27/11, le relecteur) --valider-maintenant ne fait pas le banc (jusqu'a une heure avant une validation demandee « maintenant ») : le repli,
         et le banc reste a faire au prochain lancement ordinaire */
      if(cfg._bancAFaire&&op.validerMaintenant){cfg._bancAFaire=false;dire('banc : pas de banc pour --valider-maintenant : '+cfg.travailleurs+' courses a la fois (repli), le banc sera fait au prochain lancement');}
      /* une PAUSE posee avant le banc : on attend qu'elle soit levee (le banc mesure un PC libre) */
      if(cfg._bancAFaire)while(fs.existsSync(P.pause)&&!avant.demande&&!fs.existsSync(P.stop)){
        if(!avant.pauseDite){avant.pauseDite=true;dire('PAUSE : le banc attend que le fichier PAUSE soit efface');}
        await new Promise(r=>setTimeout(r,5000));}
      if(cfg._bancAFaire&&!arretBanc()){
        dire('banc : premier lancement sur ce PC ('+(cfg._machinePourquoi==='absent'?'pas de machine.json':'machine.json '+(cfg._machinePourquoi||'sans banc reussi'))+
          ') : avant la generation, on mesure combien de courses ce PC joue a la fois sans se gener ; le resultat va dans '+C.cheminMachine(P.dossier));
        const R=await banc(cfg,dire,{dossierEtat:P.dossier,doitArreter:arretBanc,surOrd:o=>{ordBanc=o;}});
        cfg.travailleurs=R.travailleurs;cfg._travailleursSource=R.retenu?'banc':'auto';
        /* (27/11, le relecteur) le tableau et etat.js lisent cfg._machine : sans cela, « banc du ? » jusqu'au lancement suivant */
        if(R.machine){cfg._machine=R.machine;cfg._machinePourquoi=null;}
        cfg._bancAFaire=C.bancAFaire(R.machine||cfg._machine);
        dire('evoluer : '+cfg.travailleurs+' courses a la fois pour la suite');
      }
      ctx=charger(cfg,{dire:dire,bavard:op.bavard});
      if(avant.demande)ctx.arret.demande=true;
      if(op.validerMaintenant)await validerMaintenant(ctx);
      else{
        let faites=0,relus=0;
        for(;;){
          if(doitArreter(ctx)){dire('arret demande : on s\'arrete entre deux generations');break;}
          while(enPause(ctx)&&!doitArreter(ctx))await new Promise(r=>setTimeout(r,5000));
          if(doitArreter(ctx))break;
          const r=await generation(ctx);
          if(r&&r.interrompue&&ctx.arret.epoque&&!ctx.arret.demande&&!fs.existsSync(ctx.P.stop)&&(++relus)<=3){
            /* les fichiers du bot ont change pendant la generation : l'etat est relu du disque (rien de la generation coupee n'y est ecrit)
               et la generation reprend dans la nouvelle epoque */
            dire('generation '+r.generation+' coupee : les fichiers du bot ont change ; elle reprend dans la nouvelle epoque');
            await ctx.ord.arreter({dur:false});
            ctx=charger(cfg,{dire:dire,bavard:op.bavard});
            continue;
          }
          if(r&&r.interrompue){dire('generation '+r.generation+' interrompue : elle sera reprise au prochain lancement');ecrireTableau(ctx);break;}
          faites++;
          if(faites>=arretApres){dire(faites+' generation(s) faite(s) : arret demande par la ligne de commande');break;}
        }
      }
    }
  }catch(e){
    code=1;
    dire('ERREUR FATALE : '+String(e&&e.message||e));
    if(e&&e.stack&&!/^evoluer : /.test(String(e.message)))ecrireConsole(String(e.stack)+'\n');
  }
  if(ctx&&ctx.ord){try{await ctx.ord.arreter({dur:false});}catch(e){}}
  V.lacher();
  if(code===0){try{if(fs.existsSync(P.stop)){fs.unlinkSync(P.stop);dire('STOP efface');}}catch(e){}}
  /* le tableau une derniere fois, verrou rendu : son resume dit « ARRETE » */
  if(ctx&&ctx.pop)ecrireTableau(ctx);
  dire('evoluer : fin, code '+code);
  return code;
}

module.exports={generation,charger,verrouiller,refusDePartir,ecrireChampion,validerMaintenant,preparer,banc,chemins,lireOptions,USAGE,planBanc,processusNode};

if(require.main===module){
  principal(process.argv.slice(2)).then(c=>process.exit(c),e=>{ecrireErreur(String(e&&e.stack||e)+'\n');process.exit(1);});
}
