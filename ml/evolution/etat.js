'use strict';
/* ===== ETAT.JS : LE RESUME EN 10 LIGNES (27/11/2026, Sacha : « une population de pilotes evolue seule sur un PC ») =====
   Lecture seule : relit population.json, les journaux (generations, validations, coffre), verrou.json, STOP/PAUSE/ARRETE et, pour les pannes,
   les deux derniers fichiers courses-AAAA-SS.jsonl. N'ecrit rien. Ne plante jamais sur un etat vide, absent ou tronque : ce qu'il ne peut pas
   lire devient une alerte (ligne 10).
   API (INTERFACES.md § 2.9) : require('./etat').resume(cfg) -> string[] (au plus 10 lignes).
   En plus (pour tableau.js) : lire(cfg) -> les donnees lues, lireConfig(fichier?), args(argv) ; (28/11, l'integrateur, INTERFACES § 11.7)
   mesureTau(cfg, o?), tauLigne(x), resumeComplet(cfg, o?) = les 10 lignes, une vide, la ligne « Mutations comptent-elles ? » (resume.txt).
   Ligne de commande : node ml/evolution/etat.js [--config f.json]
   Les lignes sont sans accents : elles s'impriment dans une console Windows (page de code 850) et dans resume.txt. */
const fs=require('fs'),path=require('path');

const DOSSIER=__dirname;
const LARGEUR=118;  /* une ligne du resume tient dans une console de 120 colonnes */

/* commun.js (INTERFACES.md § 0) s'il est la ; sinon le strict necessaire, recopie du contrat (le tableau doit marcher meme seul) */
let C=null;
try{C=require('./commun');}catch(e){C=null;}

function fusionner(a,b){
  if(b===null||typeof b!=='object'||Array.isArray(b))return b;
  const r=(a&&typeof a==='object'&&!Array.isArray(a))?Object.assign({},a):{};
  for(const k of Object.keys(b))r[k]=fusionner(r[k],b[k]);
  return r;}
function lireConfig(fichier){
  if(C&&typeof C.lireConfig==='function')return C.lireConfig(fichier);
  const base=JSON.parse(fs.readFileSync(path.join(DOSSIER,'config.json'),'utf8'));
  let cfg=base,second=null;
  if(fichier){
    second=fs.existsSync(path.resolve(fichier))?path.resolve(fichier):path.join(DOSSIER,fichier);
    cfg=fusionner(base,JSON.parse(fs.readFileSync(second,'utf8')));}
  if(cfg.format!=='evolution-config-1')throw new Error('etat : config au format inconnu « '+cfg.format+' »');
  cfg._fichier=second;
  return cfg;}
function chemin(cfg,rel){
  if(C&&typeof C.chemin==='function')return C.chemin(cfg,rel);
  return path.resolve(DOSSIER,rel);}
function vivant(pid){
  if(C&&typeof C.vivant==='function')return C.vivant(pid);
  if(!(pid>0))return false;
  try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}}

/* Lecture tolerante : un fichier absent rend [] ; une ligne illisible (tronquee a la fin, ou abimee au milieu) est sautee et comptee.
   (commun.lireJsonl leve sur une ligne abimee au milieu : ici on prefere afficher ce qu'on peut et le dire en alerte.) */
function lireJsonlTolerant(fichier,alertes,filtre){
  let texte;
  try{texte=fs.readFileSync(fichier,'utf8');}catch(e){return [];}
  const L=texte.split('\n'),R=[];let abimees=0;
  for(let i=0;i<L.length;i++){
    const s=L[i].trim();if(!s)continue;
    if(filtre&&!filtre(s))continue;
    try{R.push(JSON.parse(s));}catch(e){if(i<L.length-1&&L.slice(i+1).some(x=>x.trim()))abimees++;}}
  if(abimees&&alertes)alertes.push(abimees+' ligne(s) abimee(s) dans '+path.basename(fichier));
  return R;}
function lireJsonTolerant(fichier,alertes){
  let texte;
  try{texte=fs.readFileSync(fichier,'utf8');}catch(e){return {absent:true,v:null};}
  try{return {absent:false,v:JSON.parse(texte)};}
  catch(e){if(alertes)alertes.push(path.basename(fichier)+' illisible (tronque ?)');return {absent:false,v:null};}}
const existe=f=>{try{return fs.existsSync(f);}catch(e){return false;}};

/* Les fichiers courses-AAAA-SS.jsonl, tries par nom (donc par semaine) */
function fichiersCourses(dossier){
  try{return fs.readdirSync(dossier).filter(x=>/^courses-.*\.jsonl$/.test(x)).sort().map(x=>path.join(dossier,x));}catch(e){return [];}}

/* TOUT CE QUE LE RESUME ET LE TABLEAU LISENT */
function lire(cfg,o){
  o=o||{};
  const dossier=chemin(cfg,cfg.dossierEtat||'etat'),alertes=[];
  const P=lireJsonTolerant(path.join(dossier,'population.json'),alertes);
  let pop=P.v;
  if(pop&&pop.format!=='evolution-population-1'){alertes.push('population.json : format inconnu');pop=null;}
  const generations=lireJsonlTolerant(path.join(dossier,'generations.jsonl'),alertes).filter(g=>g&&typeof g.generation==='number');
  const validations=lireJsonlTolerant(path.join(dossier,'validations.jsonl'),alertes).filter(v=>v&&typeof v==='object');
  const coffre=lireJsonlTolerant(path.join(dossier,'coffre.jsonl'),alertes).filter(v=>v&&typeof v==='object');
  const morts=o.morts?lireJsonlTolerant(path.join(dossier,'morts.jsonl'),alertes).filter(v=>v&&typeof v==='object'):[];
  const V=lireJsonTolerant(path.join(dossier,'verrou.json'),alertes);
  return {dossier,existe:existe(dossier),pop,popAbsente:P.absent,generations,validations,coffre,morts,
    verrou:V.v,verrouPresent:!V.absent,
    stop:existe(path.join(dossier,'STOP')),pause:existe(path.join(dossier,'PAUSE')),arrete:existe(path.join(dossier,'ARRETE')),
    fichiersCourses:fichiersCourses(dossier),alertes};}

/* Les pannes de cerveau d'une generation (usage entrainement), dans les deux derniers fichiers de courses ; on ne decode que les lignes
   qui en portent (filtre sur le texte : un fichier de la semaine pese des dizaines de Mo) */
function pannesDe(D,generation){
  let n=0;
  for(const f of D.fichiersCourses.slice(-2))
    for(const l of lireJsonlTolerant(f,null,s=>/"pannes":[1-9]/.test(s)))
      if(l.generation===generation&&(l.pannes|0)>0)n+=l.pannes|0;
  return n;}

/* mise en forme */
const nb=(x,d)=>(typeof x==='number'&&isFinite(x))?x.toFixed(d==null?1:d):'?';
const sg=(x,d)=>(typeof x==='number'&&isFinite(x))?(x>=0?'+':'')+x.toFixed(d==null?1:d):'?';
const court=id=>id?String(id).slice(0,12):'?';
function duree(s){
  if(!(s>=0))return '?';
  if(s<90)return Math.round(s)+' s';
  if(s<5400)return Math.round(s/60)+' min';
  if(s<172800)return (s/3600).toFixed(1).replace(/\.0$/,'')+' h';
  return Math.round(s/86400)+' jours';}
function dateCourte(iso){
  const d=new Date(iso);if(isNaN(d))return '?';
  const p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes());}
function note(x){
  if(!x||typeof x!=='object')return 'pas encore note';
  return 'F '+nb(x.F)+(x.se_F!=null?' +- '+nb(x.se_F):'')+', palier '+nb(x.ahat!=null?x.ahat:x.a)+', ecart E '+nb(x.E,2)+(x.n!=null?' ('+x.n+' courses)':'');}
const couper=s=>s.length>LARGEUR?s.slice(0,LARGEUR-3)+'...':s;
/* « ; 9 a la fois (banc du 27/11) » : ce que ce PC joue a la fois et d'ou ca vient ('' si la config ne le dit pas) */
function machineCourte(cfg){
  if(!cfg||typeof cfg.travailleurs!=='number')return '';
  const s=cfg._travailleursSource,m=cfg._machine;
  const d=m&&m.banc&&m.banc.date?dateCourte(m.banc.date).slice(0,5):null;
  const q=s==='banc'?'banc du '+(d||'?'):s==='config'?'ecrit dans la config':s==='auto'?(cfg._bancAFaire?'banc a faire':'sans banc'):String(s||'?');
  return ' ; '+cfg.travailleurs+' a la fois ('+q+')';}

/* L'ETAT DE MARCHE : en marche, arrete proprement, arrete sans prevenir */
function marche(cfg,D,maintenant){
  const v=D.verrou;let t;
  if(v&&v.pid){
    const bat=Date.parse(v.battement||v.debut||''),age=isNaN(bat)?null:(maintenant-bat)/1000;
    const perime=cfg.verrouPerime_s||300;
    if(vivant(v.pid)&&age!=null&&age<perime)t={en:true,texte:'EN MARCHE (pid '+v.pid+', signe de vie il y a '+duree(age)+', lance le '+dateCourte(v.debut)+')'};
    else t={en:false,sale:true,texte:'ARRETE SANS PREVENIR (verrou laisse par le pid '+v.pid+', dernier signe de vie il y a '+duree(age)+')'};}
  else if(D.verrouPresent)t={en:false,sale:true,texte:'ARRETE ? (verrou.json illisible)'};
  else t={en:false,texte:'ARRETE'+(D.arrete?' (arret voulu : les relances automatiques attendent lancer.cmd a la main)':' (proprement)')};
  if(D.pause)t.texte+=' - PAUSE demandee';
  if(D.stop)t.texte+=t.en?' - ARRET demande, il finit ses courses':' - un fichier STOP traine';
  return t;}

function resume(cfg,o){
  o=o||{};
  const maintenant=o.maintenant!=null?o.maintenant:Date.now();
  let D;
  try{D=o.donnees||lire(cfg);}
  catch(e){return ['Etat illisible : '+String(e.message||e).slice(0,100)];}
  const L=[],alertes=D.alertes.slice();
  const G=D.generations.length?D.generations[D.generations.length-1]:null,pop=D.pop;
  const M=marche(cfg,D,maintenant);
  if(M.sale)alertes.push('arret sans prevenir : relancer avec lancer.cmd (la reprise ne perd que les courses en cours)');

  /* 1. generation, phase, epoque */
  if(pop||G){
    const gen=pop?pop.generation:G.generation,phase=(pop&&pop.phase)||(G&&G.phase)||'?';
    const ep=pop&&pop.epoque?pop.epoque:{courses:G&&G.epoque,depuis:null};
    L.push('Generation '+gen+', phase '+phase+', epoque '+(ep.courses||'?')+(ep.depuis!=null?' (depuis la gen. '+ep.depuis+')':'')+
      ', '+((pop&&pop.nGraines)||(G&&G.nGraines)||'?')+' graines par generation, '+(pop&&pop.vivants?pop.vivants.length:'?')+' vivants');}
  else L.push(D.existe?'Aucune generation encore (etat vide : '+D.dossier+')':'Pas encore lance (le dossier '+D.dossier+' n\'existe pas)');

  /* 2. en marche ou arrete */
  L.push(M.texte);

  /* 3. debit ; (27/11, « machine ») et le nombre de courses a la fois de ce PC (etat/machine.json, resolu par commun.lireConfig) */
  const aLaFois=machineCourte(cfg);
  if(G){const c=G.courses||{};
    L.push('Debit : '+nb(G.debit_h,0)+' courses/h (gen. '+G.generation+' : '+(c.demandees!=null?c.demandees:'?')+' courses dont '+
      (c.jouees!=null?c.jouees:'?')+' jouees, '+(c.cache!=null?c.cache:'?')+' du cache, en '+duree(G.duree_s)+')'+aLaFois);}
  else L.push('Debit : pas encore de generation finie'+aLaFois);

  /* 4. 5. 6. champion, meneur, temoin (les notes de la derniere generation) */
  const champId=(pop&&pop.champion&&pop.champion.id)||(G&&G.champion&&G.champion.id);
  const depuis=pop&&pop.champion&&pop.champion.depuis!=null?' (depuis gen. '+pop.champion.depuis+')':'';
  const estTemoin=champId&&pop&&pop.temoin===champId;
  L.push('Champion '+court(champId)+(estTemoin?' (= le temoin)':depuis)+' : '+note(G&&G.champion));
  L.push('Meneur   '+court(G&&G.meneur&&G.meneur.id)+' : '+note(G&&G.meneur));
  L.push('Temoin   '+court((pop&&pop.temoin)||(G&&G.temoin&&G.temoin.id))+(pop?' ('+temoinNom(pop)+')':'')+' : '+note(G&&G.temoin));

  /* 7. dernier coffre */
  const K=D.coffre.length?D.coffre[D.coffre.length-1]:null;
  if(K&&K.diff)L.push('Coffre ('+dateCourte(K.date)+', gen. '+K.generation+', '+(K.graines||'?')+' courses) : champion - temoin = palier '+sg(K.diff.palier,2)+
    ', E '+sg(K.diff.E,2)+', ecart classique '+sg(K.diff.ecartClassique,2));
  else L.push('Coffre : pas encore mesure');

  /* 8. derniere validation */
  const Vl=D.validations.length?D.validations[D.validations.length-1]:null;
  if(Vl){const v=Vl.validation||{};
    /* (28/11, lot « sacre ») une validation sequentielle dit a quel regard elle a fini : « SACRE au 3e regard, sur 48 graines » (ids sur 8 caracteres
       pour tenir dans les 118 colonnes) ; une ligne d'avant (sans regards) garde la phrase d'avant */
    /* (28/11/2026, le relecteur) l'arret au 1er regard, le cas le plus frequent, faisait 124 caracteres avec son z et son dF : couper() le tronquait
       en « (dF +0.25 +... ». Le dF (deja dit par le z) n'est ajoute que s'il tient dans la ligne. */
    if(Vl.usage!=='revalidation'&&Array.isArray(Vl.regards)&&Vl.regards.length){
      const t0='Validation (gen. '+Vl.generation+') : '+String(Vl.meneur||'?').slice(0,8)+' contre '+String(Vl.champion||'?').slice(0,8)+' : '+regardsClair(Vl),
        tdF=' (dF '+sg(v.dF,2)+' +- '+nb(v.se_dF,2)+')';
      L.push(t0.length+tdF.length<=LARGEUR?t0+tdF:t0);}
    else L.push((Vl.usage==='revalidation'?'Revalidation':'Validation')+' (gen. '+Vl.generation+') : '+court(Vl.meneur)+' contre '+court(Vl.champion)+' : '+
      (Vl.usage==='revalidation'?(Vl.sacre?'GARDE SON TITRE':'PERD SON TITRE'):(Vl.sacre?'SACRE':'pas sacre'))+
      ' (dF '+sg(v.dF,2)+' +- '+nb(v.se_dF,2)+' sur '+(v.graines!=null?v.graines:'?')+' graines)');}
  else L.push('Validation : aucune encore');

  /* 9. non mesurees et pannes de la derniere generation */
  if(G){const c=G.courses||{},dem=c.demandees||0,nm=c.nonMesurees||0;
    let pannes=null;try{pannes=pannesDe(D,G.generation);}catch(e){pannes=null;}
    const part=dem?100*nm/dem:0;
    L.push('Gen. '+G.generation+' : '+nm+' course(s) non mesuree(s) sur '+dem+' ('+part.toFixed(1)+' %), '+(pannes==null?'?':pannes)+' panne(s) de cerveau'+
      (c.relancees?', '+c.relancees+' relancee(s)':'')+(c.tuees?', '+c.tuees+' tuee(s) par le chien de garde':''));
    if(part>2)alertes.push('plus de 2 % de courses non mesurees');
    if(pannes>0)alertes.push(pannes+' panne(s) de cerveau');
    if(typeof G.distance==='number'&&G.distance<(cfg.alarmeDistance||0.05))alertes.push('population trop semblable (distance '+nb(G.distance,3)+')');
    if(M.en&&G.date){const age=(maintenant-Date.parse(G.date))/1000;
      const seuil=Math.max(3*3600,3*(G.duree_s||0));
      if(age>seuil)alertes.push('aucune generation finie depuis '+duree(age));}}
  else L.push('Courses : rien encore');

  /* 10. alertes */
  if(D.pop===null&&!D.popAbsente&&!alertes.some(a=>/population/.test(a)))alertes.push('population.json illisible');
  L.push('Alertes : '+(alertes.length?alertes.join(' ; '):'aucune'));
  return L.slice(0,10).map(couper);}

/* les options de ligne de commande : --config f */
function args(argv){
  const o={};
  for(let i=0;i<argv.length;i++){if(argv[i]==='--config')o.config=argv[++i];}
  return o;}

/* ===== LE NOM DU TEMOIN EN CLAIR (28/11/2026, tache « portage ») =====
   population.json temoinNom (absent = c0025, le seul temoin d'avant le portage) -> les mots des pages et du resume. */
function temoinNom(pop){return (pop&&typeof pop.temoinNom==='string'&&pop.temoinNom)||'c0025';}
function temoinClair(pop){
  const n=temoinNom(pop);
  if(n==='c0025')return 'pilote-voltige (c0025)';
  if(n==='c0101')return 'c0101, le dernier champion de la boucle payante';
  return n+', un champion de la boucle payante';}

/* ===== LA VALIDATION SEQUENTIELLE EN CLAIR (28/11/2026, lot « sacre » : « sacre au 3e regard, sur 48 graines », « arrete au 1er regard ») =====
   v : une ligne de validations.jsonl (usage 'validation'). Une ligne d'avant le lot (sans regards) ou du plan « fixe » : un seul lot.
   o.accents : les mots des pages (histoire.md, tableau.html, arbre.html) ; sans : le resume, sans accents (console en page de code 850).
   -> texte sans point final ; null pour une revalidation (elle garde ses mots a elle). Ne leve jamais. */
function regardsClair(v,o){
  o=o||{};const a=!!o.accents;
  if(!v||typeof v!=='object'||v.usage==='revalidation')return null;
  const R=Array.isArray(v.regards)?v.regards.filter(x=>x&&typeof x==='object'):[];
  const V=v.validation||{},plan=v.plan||{};
  const graines=n=>(typeof n==='number'?n:'?')+' graines';
  const nTout=R.length&&typeof R[R.length-1].n==='number'?R[R.length-1].n:(Array.isArray(v.graines)&&v.graines.length?v.graines.length:V.graines);
  const S=a?'sacré':'SACRE',PS=a?'pas sacré':'pas sacre',AR=a?'arrêté':'arrete';
  if(!R.length||plan.nom==='fixe')return (v.sacre?S:PS)+' sur '+graines(nTout)+' (un seul lot)';
  const k=R.length,ord=k===1?'1er':k+'e',der=R[k-1],arret=v.arret||der.decision;
  const num=x=>typeof x==='number'&&isFinite(x)?(a?x.toFixed(2).replace('.',','):x.toFixed(2)):(x==null?'?':String(x));
  if(v.sacre)return S+' au '+ord+' regard, sur '+graines(der.n);
  if(arret==='futilite')return AR+' au '+ord+' regard, sur '+graines(der.n)+' (z '+num(der.z)+' sous '+num(plan.futilite)+')';
  if(arret==='plafond')return PS+' au plafond ('+ord+' regard, '+graines(der.n)+')';
  if(arret==='epuisees')return AR+' au '+ord+' regard, sur '+graines(der.n)+(a?' : plus de graines de validation':' : plus de graines');   /* (28/11, le relecteur) court : tient dans les 118 colonnes */
  return PS+' ('+ord+' regard, '+graines(der.n)+')';}

/* ===== LA MESURE DE TAU POUR LES PAGES (28/11/2026, l'integrateur : « branche la mesure de tau : une ligne dans resume.txt, une section dans
   tableau.html, un paragraphe dans histoire.md, sans jamais faire echouer ces pages ») =====
   mesure-tau.js (notes/tau.md) relit tous les courses-*.jsonl d'un etat : ici, une fois par appel, et jamais plus de TAU_MAX_OCTETS de journaux
   (le tableau est refait DANS le processus de la selection a chaque generation : un etat de plusieurs mois ne doit pas lui couter la memoire ;
   au-dela, la phrase dit de lancer la mesure a part). Ne leve jamais : toute erreur rend « trop tot » (verdict 'trop-tot').
   o.tau : une mesure deja faite (tableau.ecrire la fait une fois pour la page, resume.txt et le recit). -> l'objet de mesure-tau.mesurer. */
const TAU_MAX_OCTETS=100*1024*1024;
function tauDefaut(phrase,defaut){
  return {format:'evolution-mesure-tau-1',verdict:'trop-tot',phrase:phrase||'trop tôt pour le dire',enfants:{mesures:0,requis:null},
    r:null,tau:null,icTau:null,clones:null,defauts:defaut?[defaut]:[]};}
function mesureTau(cfg,o){
  o=o||{};
  if(o.tau&&typeof o.tau==='object'&&typeof o.tau.phrase==='string')return o.tau;
  try{
    const MT=require('./mesure-tau');
    const dossier=chemin(cfg,cfg.dossierEtat||'etat');
    let octets=0;for(const f of fichiersCourses(dossier)){try{octets+=fs.statSync(f).size;}catch(e){}}
    if(octets>TAU_MAX_OCTETS){const x=tauDefaut('pas mesuré ici : les journaux de courses dépassent '+Math.round(TAU_MAX_OCTETS/1048576)+
      ' Mo (lancer à part : node ml/evolution/mesure-tau.js)');x.lourd=true;return x;}
    const x=MT.mesurer(dossier,MT.optionsDe(cfg,{tirages:o.tiragesTau||400}));
    return x&&typeof x==='object'&&typeof x.phrase==='string'?x:tauDefaut(null,'mesure illisible');
  }catch(e){return tauDefaut(null,'mesure impossible : '+String(e&&e.message||e).slice(0,120));}}
/* la ligne de resume.txt, sans accents (page de code 850) et dans les 118 colonnes */
function asciiCourt(s){return String(s).replace(/τ/g,'tau').replace(/[−–]/g,'-').normalize('NFD').replace(/[^ -~]/g,'');}
function tauLigne(x){
  try{
    x=x||tauDefaut();
    const n=v=>typeof v==='number'&&isFinite(v)?v.toFixed(2):'?';
    let s='Mutations comptent-elles ? '+asciiCourt(x.phrase);
    if(typeof x.r==='number'&&isFinite(x.r))s+=' ; r '+n(x.r)+', tau '+n(x.tau)+(Array.isArray(x.icTau)?' ['+n(x.icTau[0])+' ; '+n(x.icTau[1])+']':'');
    if(x.clones&&x.clones.comparees>0&&typeof x.clones.part==='number'){const t=' ; courses pour rien '+Math.round(100*x.clones.part)+' %';if(s.length+t.length<=LARGEUR)s+=t;}
    return couper(s);
  }catch(e){return 'Mutations comptent-elles ? trop tot pour le dire';}}
/* les 10 lignes du resume, puis une ligne vide et la ligne de la mesure de tau : ce qu'ecrit resume.txt (la ligne de commande garde ses 10 lignes) */
function resumeComplet(cfg,o){
  const L=resume(cfg,o);
  let t;try{t=tauLigne(mesureTau(cfg,o));}catch(e){t='Mutations comptent-elles ? trop tot pour le dire';}
  return L.concat(['',t]);}

module.exports={resume,resumeComplet,lire,lireConfig,chemin,args,lireJsonlTolerant,fichiersCourses,temoinNom,temoinClair,regardsClair,
  mesureTau,tauLigne,TAU_MAX_OCTETS};

if(require.main===module){
  try{
    const o=args(process.argv.slice(2)),cfg=lireConfig(o.config);
    process.stdout.write(resume(cfg).join('\n')+'\n');
  }catch(e){process.stderr.write('etat : '+(e&&e.message||e)+'\n');process.exit(1);}
}
