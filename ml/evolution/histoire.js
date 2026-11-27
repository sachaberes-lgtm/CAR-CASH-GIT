'use strict';
/* ===== HISTOIRE.JS : LE RECIT DE LA SELECTION, ECRIT PAR ELLE-MEME (27/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Reecrit <dossierEtat>/histoire.md en entier a chaque appel (contenu derive des journaux, ecriture atomique) : en tete, « Ou on en est » en dix lignes,
   puis une entree par generation, en phrases francaises simples, de la plus ancienne a la plus recente. Rien n'est invente : chaque phrase vient d'un
   champ de generations.jsonl, validations.jsonl, coffre.jsonl, morts.jsonl ou population.json ; un evenement que ce fichier ne sait pas traduire est
   recopie tel quel. Le texte peut etre colle tel quel dans le journal de bord du portfolio (ml/ecurie/portfolio/journal) : du Markdown simple, sans HTML.
   API : require('./histoire').ecrire(cfg, o?) -> chemin de histoire.md ; texte(cfg, o?) -> le Markdown ; message(cfg) -> une ligne ASCII (le commit de
   sauver-traces.cmd) ; nomPc() -> le nom du PC en minuscules (la branche evolution-<pc>).
     o : {donnees?: rendu de etat.lire(cfg,{morts:true}), maintenant?: ms}.
   Ligne de commande : node ml/evolution/histoire.js [--config f.json] [--etat dossier] [--message | --pc] */
const fs=require('fs'),path=require('path'),os=require('os');
const ET=require('./etat');
const A=require('./arbre');
let C=null;
try{C=require('./commun');}catch(e){C=null;}
function ecrireAtomique(fichier,texte){
  if(C&&typeof C.ecrireAtomique==='function')return C.ecrireAtomique(fichier,texte);
  if(texte.indexOf('\r')>=0)throw new Error('histoire : texte avec \\r');
  fs.mkdirSync(path.dirname(fichier),{recursive:true});
  const tmp=fichier+'.'+process.pid+'.tmp';
  fs.writeFileSync(tmp,texte,'utf8');fs.renameSync(tmp,fichier);}

/* ---------- mise en forme ---------- */
const fini=x=>typeof x==='number'&&isFinite(x);
const fr=(x,d)=>fini(x)?x.toFixed(d==null?2:d).replace('.',',').replace(/^-/,'−'):'?';
const frs=(x,d)=>fini(x)?(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d==null?2:d).replace('.',','):'?';
const nb=x=>String(x).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const court=id=>id?'`'+String(id).slice(0,8)+'`':'?';
const pluriel=(n,un,plus)=>n+' '+(n>1?(plus||un+'s'):un);
function dateFr(iso){
  const d=new Date(iso);if(isNaN(d))return '?';const p=k=>String(k).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' à '+p(d.getHours())+' h '+p(d.getMinutes());}
function duree(s){
  if(!(s>=0))return '?';
  const j=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.round(s%3600/60);
  if(j)return pluriel(j,'jour')+(h?' et '+h+' h':'');
  if(h)return h+' h'+(m?' '+String(m).padStart(2,'0'):'');
  return Math.max(1,m)+' min';}
const ORIG={g0:['mutant de départ','mutants de départ'],mutation:['mutation','mutations'],croisement:['croisement','croisements'],immigre:['immigré','immigrés'],temoin:['témoin','témoins']};
const RAISONS={renvoi:['note trop basse','notes trop basses'],pannes:['d\'office pour pannes de cerveau','d\'office pour pannes de cerveau'],
  'non-mesuree':['d\'office pour deux courses ratées','d\'office pour courses ratées']};
function compter(L,cle,noms){
  const c=new Map();for(const x of L){const k=x&&x[cle]||'?';c.set(k,(c.get(k)||0)+1);}
  return [...c.entries()].map(([k,n])=>n+' '+((noms[k]||[k,k])[n>1?1:0])).join(', ');}
const note=x=>x?'palier '+fr(x.ahat!=null?x.ahat:x.a)+', écart aux joueurs '+fr(x.E)+', note F '+fr(x.F,1)+(fini(x.n)?', '+x.n+' courses':''):'';

/* ===== LES EVENEMENTS EN CLAIR (les textes d'evoluer.js, § 6 et § 8 d'INTERFACES.md) ===== */
function evenementClair(e){
  e=String(e);let m;
  if((m=/^premier lancement/.exec(e)))return 'Premier lancement : la population de départ est née.';
  if(e==='identite verifiee')return 'Contrôle d\'identité réussi : le pilote fabriqué à partir du génome du témoin conduit exactement comme pilote-voltige, au bit près.';
  if((m=/^nouvelle epoque de notes : (.*?)( \(les courses restent valables\))?$/.exec(e)))
    return 'Nouvelle époque de notes ('+m[1]+' a changé) : les notes sont recalculées, les courses déjà jouées restent valables.';
  if((m=/^nouvelle epoque : (.*?) \(([0-9a-f]+) -> ([0-9a-f]+)\)$/.exec(e))||(m=/^nouvelle epoque : (.*)$/.exec(e)))
    return 'Nouvelle époque : '+m[1]+' a changé (le jeu, les yeux ou la main du bot). Les notes repartent de zéro ; les pilotes restent.';
  if((m=/^SACRE : ([0-9a-f]+) devient champion \(ancien : ([0-9a-f]+)\) -> (.*)$/.exec(e)))
    return 'Sacre : '+court(m[1])+' devient le champion, à la place de '+court(m[2])+'. Son pilote est rangé dans `'+m[3]+'`.';
  if((m=/^phase ([ABC]) \(apres (\d+) generations sans sacre, (\d+) depuis la phase ([ABC])\)$/.exec(e)))
    return 'Changement de phase : '+m[4]+' → '+m[1]+' ('+m[2]+' générations sans sacre, '+m[3]+' générations dans la phase '+m[4]+'). '+
      (m[1]==='B'?'Les petits réseaux de neurones peuvent maintenant changer un peu à chaque naissance.':'Les petits réseaux de neurones peuvent maintenant changer plus profondément.');
  if((m=/^phase ([ABC])$/.exec(e)))return 'Changement de phase : '+m[1]+'.';
  if((m=/^graines (\d+) -> (\d+)/.exec(e)))
    return +m[2]<+m[1]?'Économie : '+m[2]+' courses par pilote et par génération au lieu de '+m[1]+' (les générations duraient trop longtemps).':
      'Retour à '+m[2]+' courses par pilote et par génération (au lieu de '+m[1]+').';
  if((m=/^regle 6 : ([\d.]+) -> ([\d.]+)/.exec(e)))
    return 'La barre pour tenter un sacre monte de '+m[1]+' à '+m[2]+' : les meneurs avaient trop souvent été chanceux à l\'entraînement.';
  if((m=/^revalidation : le champion ([0-9a-f]+) garde son titre/.exec(e)))return 'Revalidation : après la nouvelle époque, le champion '+court(m[1])+' garde son titre face au témoin.';
  if((m=/^revalidation : le champion ([0-9a-f]+) perd son titre/.exec(e)))return 'Revalidation : après la nouvelle époque, le champion '+court(m[1])+' perd son titre ; le témoin redevient champion.';
  if((m=/^le champion est mort \(([^)]*)\)/.exec(e)))return 'Le champion a été renvoyé d\'office ('+m[1]+') : le témoin redevient champion.';
  if((m=/^([0-9a-f]+) vire d'office : (.*)$/.exec(e)))return court(m[1])+' est renvoyé d\'office : '+m[2]+'.';
  if((m=/^graine (\d+) retiree pour l'epoque/.exec(e)))return 'La course '+m[1]+' est retirée des notes pour toute l\'époque : plusieurs pilotes (ou le témoin) l\'ont ratée.';
  if((m=/^graine (\d+) : seul ([0-9a-f]+) n'est pas mesure/.exec(e)))return 'La course '+m[1]+' a été ratée par '+court(m[2])+' seulement : elle reste comptée pour les autres.';
  if((m=/^sacre : ([0-9a-f]+)$/i.exec(e)))return 'Sacre : '+court(m[1])+' devient le champion.';
  if(/^enfant abandonne : doublon/.test(e))return 'Un enfant a été abandonné : il était identique à un pilote déjà né.';
  if(/^ATTENTION/.test(e))return '**'+e+'**';
  if(/controle d'identite$/.test(e))return 'Un fichier du pilote a changé ('+e.replace(/ : controle d'identite$/,'')+') : le contrôle d\'identité est refait.';
  return e;}

/* ===== LA VALIDATION ET LE COFFRE, EN UNE PHRASE ===== */
function phraseValidation(v,cfg){
  const V=v.validation||{},T=v.entrainement||{},seuil=(cfg.validation&&cfg.validation.seuilSacre)||2;
  const neuves=fini(V.graines)?V.graines+' courses neuves':'des courses neuves';
  if(v.usage==='revalidation')
    return 'Revalidation (le champion '+court(v.meneur)+' contre le témoin, sur '+neuves+') : avance de note '+frs(V.dF)+' ± '+fr(V.se_dF)+' ; '+(v.sacre?'il garde son titre.':'il perd son titre.');
  const crit=v.criteres||{},manque=[];
  if(crit.a===false)manque.push('avance de note pas assez nette (il faut plus de '+seuil+' fois l\'incertitude)');
  if(crit.b===false)manque.push('il va moins loin');
  if(crit.c===false)manque.push('il ressemble moins aux joueurs');
  let s='Validation'+(v.forcee?' (demandée à la main)':'')+' : le meneur '+court(v.meneur)+' rejoue contre le champion '+court(v.champion)+' sur '+neuves+'. '+
    'Son avance de note y est de '+frs(V.dF)+' ± '+fr(V.se_dF)+(fini(T.dF)?' (elle était de '+frs(T.dF)+' à l\'entraînement)':'')+'. ';
  s+=v.sacre?'**Il est sacré nouveau champion.**':'Il n\'est pas sacré'+(manque.length?' : '+manque.join(' ; '):'')+'.';
  return s;}
const RAISON_COFFRE={sacre:'après le sacre',epoque:'nouvelle époque','24h':'la mesure du jour'};
/* ===== LE BRUIT DU COFFRE (27/11/2026, le relecteur : « la selection apprend » ne s'ecrit que si le coffre le montre au-dela de son bruit) =====
   coffre.jsonl ne porte pas d'incertitude. L'etude du bruit (ml/ecurie/etude/selection-naturelle/bruit/resultats.txt, § 1) mesure, pour la difference
   de palier moyen entre deux pilotes sur 12 graines communes, un bruit de 1,37 palier ; sur les 40 graines du coffre : 1,37 x racine(12/40) = 0,75.
   Une difference de moins de deux fois cela (1,5 palier) peut venir du hasard des courses : le recit le dit, et ne conclut rien. */
const BRUIT_COFFRE=1.5;
function verdictBruit(dp){
  if(!fini(dp))return '';
  return Math.abs(dp)<BRUIT_COFFRE?'dans le bruit : sur 40 courses, moins de '+fr(BRUIT_COFFRE,1)+' palier d\'écart peut venir du hasard des courses':
    'au-delà du bruit des courses ('+fr(BRUIT_COFFRE,1)+' palier sur 40 courses)';}
function phraseCoffre(k){
  const c=k.champion||{},t=k.temoin||{},d=k.diff||{},n=k.graines||40;
  if(c.id&&t.id&&c.id===t.id)
    return 'Coffre ('+(RAISON_COFFRE[k.raison]||k.raison||'?')+') : le champion est encore le témoin ; palier moyen '+fr(t.palierMoyen)+' sur les '+n+' courses du coffre.';
  return 'Coffre ('+(RAISON_COFFRE[k.raison]||k.raison||'?')+') : sur les '+n+' courses qui ne servent jamais à l\'entraînement, le champion '+court(c.id)+' va '+
    (fini(d.palier)?(d.palier>=0?fr(Math.abs(d.palier))+' palier'+(Math.abs(d.palier)>=2?'s':'')+' plus loin':fr(Math.abs(d.palier))+' palier'+(Math.abs(d.palier)>=2?'s':'')+' moins loin'):'?')+
    ' que le témoin'+(fini(d.palier)?' ('+verdictBruit(d.palier)+')':'')+' et '+(fini(d.ecartClassique)?(d.ecartClassique<=0?'ressemble davantage':'ressemble moins')+' aux joueurs (écart '+frs(d.ecartClassique)+')':'?')+'.';}
/* « La selection apprend-elle vraiment ? » : une mesure par champion (la derniere de chacun : les mesures repetees d'un meme champion sur les memes
   40 courses ne sont pas des preuves de plus), et une conclusion seulement au-dela du bruit */
function phraseApprend(K){
  const parCh=new Map();for(const k of K)if(k.champion&&k.temoin&&k.champion.id!==k.temoin.id&&k.diff&&fini(k.diff.palier))parCh.set(k.champion.id,k);
  const L=[...parCh.values()];
  if(!L.length)return '**La sélection apprend-elle vraiment ?** On ne le sait pas encore : tant que le champion est le témoin, le coffre n\'a rien à comparer.';
  const mieux=L.filter(k=>k.diff.palier>=BRUIT_COFFRE).length,moins=L.filter(k=>k.diff.palier<=-BRUIT_COFFRE).length,der=L[L.length-1];
  let s='**La sélection apprend-elle vraiment ?** '+pluriel(L.length,'champion','champions')+' autre'+(L.length>1?'s':'')+' que le témoin '+(L.length>1?'ont':'a')+
    ' été mesuré'+(L.length>1?'s':'')+' au coffre. Le dernier, '+court(der.champion.id)+', y va '+fr(Math.abs(der.diff.palier))+' palier'+(Math.abs(der.diff.palier)>=2?'s':'')+
    (der.diff.palier>=0?' plus loin':' moins loin')+' que le témoin, '+verdictBruit(der.diff.palier)+'. ';
  if(mieux)s+=(mieux===L.length?(L.length>1?'Tous vont':'Il va'):mieux+' sur '+L.length+' vont')+' plus loin que le témoin au-delà du bruit : sur des courses qui n\'ont jamais servi à l\'entraînement, la sélection a trouvé mieux que le pilote de départ.';
  else s+='Aucun ne va plus loin que le témoin au-delà du bruit : on ne peut pas encore dire que la sélection apprend.';
  if(moins)s+=' '+pluriel(moins,'champion','champions')+' '+(moins>1?'vont':'va')+' nettement moins loin que le témoin.';
  return s;}

/* ===== LE TEXTE ===== */
function texte(cfg,o){
  o=o||{};
  const D=o.donnees||ET.lire(cfg,{morts:true});
  const M=A.modele(cfg,{donnees:D});
  const G=M.generations,pop=D.pop,maintenant=o.maintenant!=null?o.maintenant:Date.now();
  const parG=(L)=>{const m=new Map();for(const x of L){if(!x||!fini(x.generation))continue;if(!m.has(x.generation))m.set(x.generation,[]);m.get(x.generation).push(x);}return m;};
  const VAL=parG(D.validations),COF=parG(D.coffre);
  const out=[];
  out.push('# Le récit de la sélection naturelle des bots');
  out.push('');
  out.push('*Écrit par la sélection elle-même (`ml/evolution/histoire.js`), à partir de ses journaux, à la fin de chaque génération. Rien n\'y est ajouté à la main ; '+
    'les identifiants entre guillemets inversés (`77ab12cd`) sont les huit premiers caractères du nom d\'un pilote, comme dans l\'arbre généalogique (`arbre.html`). '+
    'Dernière mise à jour : '+dateFr(new Date(maintenant).toISOString())+'.*');
  out.push('');
  out.push('Les mots : le **palier** dit jusqu\'où un pilote va dans une course ; l\'**écart aux joueurs** dit à quel point il conduit autrement que les vrais joueurs (0 = comme eux) ; '+
    'la **note F** = palier − '+((cfg.note&&cfg.note.poidsEcart)||4)+' × écart décide qui reste. Le **témoin** est le pilote de départ, écrit à la main, jamais modifié. '+
    'Le **champion** est le meilleur pilote prouvé sur des courses neuves ; au début, c\'est le témoin. Le **coffre** : 40 courses qui ne servent jamais à l\'entraînement, le seul vrai juge. '+
    'Le **meneur** est le mieux noté des autres ; il tente parfois un **sacre** (rejouer contre le champion sur des courses neuves). '+
    'Un **immigré** est une copie très changée du champion, ajoutée pour garder de la variété. Une **nouvelle époque** commence quand le jeu ou le bot change : '+
    'les notes repartent de zéro et le champion doit se **revalider** face au témoin.');
  out.push('');

  /* ---------- OU ON EN EST (dix lignes) ---------- */
  out.push('## Où on en est');
  out.push('');
  if(!G.length&&!pop){out.push('Rien encore : la sélection n\'a pas commencé (aucun journal dans ce dossier).');out.push('');return out.join('\n')+'\n';}
  const L=[],dern=G.length?G[G.length-1]:null,prem=G.length?G[0]:null;
  const t0=prem?Date.parse(prem.date)-(prem.duree_s||0)*1000:NaN,t1=dern?Date.parse(dern.date):NaN;
  const epoques=[];for(const g of G)if(epoques[epoques.length-1]!==g.epoque)epoques.push(g.epoque);
  const nEp=new Set(epoques).size;
  L.push('**'+pluriel(G.length,'génération finie','générations finies')+'**'+(isFinite(t0)?' depuis le '+dateFr(new Date(t0).toISOString())+(isFinite(t1)?' ('+duree((t1-t0)/1000)+')':''):'')+
    ' ; phase '+((pop&&pop.phase)||(dern&&dern.phase)||'?')+(nEp>1?', '+nEp+'e époque':'')+
    (pop&&pop.etape!=='fin'&&(!dern||pop.generation>dern.generation)?' ; la génération '+pop.generation+' est en cours':'')+'.');
  const nes=M.individus.length,morts=M.individus.filter(x=>!x.vivant).length;
  L.push(nb(nes)+' pilotes sont nés (dont '+(M.individus.filter(x=>x.ne===0).length)+' au départ), '+nb(morts)+' ont été renvoyés, '+(nes-morts)+' vivent.');
  const ch=M.champion,te=M.temoin,nCh=dern&&dern.champion;
  const sacres=D.validations.filter(v=>v&&v.usage==='validation'&&v.sacre===true);
  if(ch&&ch!==te){const s=M.sacres.get(ch);
    L.push('Le champion en titre est **'+court(ch)+'**'+(s&&s.length?', sacré à la génération '+s[s.length-1]:'')+(nCh&&nCh.id===ch?' ('+note(nCh)+')':'')+'.');}
  else if(!sacres.length)L.push('Le champion est encore **le témoin** : aucun pilote n\'a encore prouvé, sur des courses neuves, qu\'il faisait mieux.');
  else{
    /* (27/11/2026, le relecteur) il y a eu un sacre : « aucun pilote n'a encore prouve » serait faux. On dit qui a perdu le titre, quand et comment
       (les evenements d'evoluer.js : revalidation perdue, champion renvoye d'office). */
    let perte=null;
    for(const g of G)for(const e of (g.evenements||[])){const s=String(e);
      if(/^revalidation : le champion [0-9a-f]+ perd son titre/.test(s))perte={g:g.generation,comment:'à la revalidation d\'une nouvelle époque'};
      else if(/^le champion est mort/.test(s))perte={g:g.generation,comment:'renvoyé d\'office'};}
    const der=sacres[sacres.length-1];
    L.push('Le champion est de nouveau **le témoin** : le dernier sacré, '+court(der.meneur)+' (génération '+der.generation+'), a perdu son titre'+
      (perte?' à la génération '+perte.g+' ('+perte.comment+')':'')+'.');}
  const men=dern&&dern.meneur;
  L.push(men?'Le meneur de la dernière génération (le mieux noté après le champion) est '+court(men.id)+' : '+note(men)+'.':'Pas encore de meneur (il faut '+((cfg.validation&&cfg.validation.nMin)||48)+' courses pour être candidat).');
  const tem=dern&&dern.temoin;
  L.push('Le témoin, pilote-voltige jamais modifié : '+(tem?note(tem):'pas encore noté')+'.');
  const Vv=D.validations.filter(v=>v&&v.usage==='validation'&&!v.forcee);
  if(Vv.length){const mal=Vv.map(v=>v.malediction).filter(fini),moy=mal.length?mal.reduce((s,x)=>s+x,0)/mal.length:null;
    L.push(pluriel(Vv.length,'tentative','tentatives')+' de sacre, '+pluriel(Vv.filter(v=>v.sacre).length,'réussie','réussies')+'.'+
      (fini(moy)?' En moyenne, l\'avance du meneur fondait de '+fr(moy)+' point de note sur les courses neuves : c\'est la part de chance qu\'il avait eue à l\'entraînement.':''));}
  else L.push('Aucune tentative de sacre encore : aucun meneur n\'a eu assez d\'avance sur le champion.');
  const K=D.coffre.filter(k=>k&&fini(k.generation)),derK=K.length?K[K.length-1]:null;
  L.push(derK?'Dernière mesure du coffre (génération '+derK.generation+') : '+phraseCoffre(derK).replace(/^Coffre \([^)]*\) : /,''):'Le coffre n\'a pas encore été mesuré.');
  L.push(phraseApprend(K));
  const dist=G.filter(g=>fini(g.distance));
  if(dist.length){const a=dist[0],b=dist[dist.length-1],al=cfg.alarmeDistance||0.05;
    L.push('Diversité : la distance moyenne entre les pilotes vivants est passée de '+fr(a.distance,3)+' (génération '+a.generation+') à '+fr(b.distance,3)+' (génération '+b.generation+')'+
      (b.distance<al?', **sous le seuil d\'alarme de '+fr(al)+'** : les pilotes se ressemblent trop':'')+' (0 = tous pareils).');}
  else L.push('Diversité : pas encore mesurée.');
  let jouees=0,dem=0,nm=0,trous=0;
  for(let i=0;i<G.length;i++){const c=G[i].courses||{};jouees+=c.jouees||0;dem+=c.demandees||0;nm+=c.nonMesurees||0;
    if(i&&trou(G[i-1],G[i])>3600)trous++;}
  L.push('La machine : '+nb(jouees)+' courses jouées'+(dem?', '+fr(100*nm/Math.max(1,dem),1)+' % non mesurées':'')+(trous?' ; '+pluriel(trous,'arrêt','arrêts')+' de plus d\'une heure entre deux générations':'')+'.');
  L.forEach((l,i)=>out.push((i+1)+'. '+l));
  out.push('');

  /* ---------- GENERATION PAR GENERATION ---------- */
  out.push('## Génération par génération');
  out.push('');
  out.push('*De la plus ancienne à la plus récente.*');
  out.push('');
  let avant=null;
  for(const g of G){out.push(...entree(g,avant,VAL.get(g.generation)||[],COF.get(g.generation)||[],cfg));avant=g;}
  if(pop&&pop.etape!=='fin'&&(!dern||pop.generation>dern.generation)){
    const nesP=pop.naissancesGeneration||[];
    out.push('### Génération '+pop.generation+' — en cours');
    out.push('');
    out.push((nesP.length?pluriel(nesP.length,'naissance')+' ('+compter(nesP,'origine',ORIG)+')':'Aucune naissance')+'. Les courses sont en train de se jouer.');
    out.push('');}
  return out.join('\n')+'\n';}

/* le temps sans travail avant la generation g (en s) : son debut moins la fin de la precedente */
function trou(a,g){const fa=Date.parse(a&&a.date),dg=Date.parse(g&&g.date)-((g&&g.duree_s)||0)*1000;return isFinite(fa)&&isFinite(dg)?(dg-fa)/1000:0;}

function entree(g,avant,vals,cofs,cfg){
  const out=[],P=[];
  out.push('### Génération '+g.generation+(g.date?' — '+dateFr(g.date):''));
  out.push('');
  if(avant){const t=trou(avant,g);if(t>3600)P.push('Avant elle, '+duree(t)+' sans génération (arrêt, veille ou coupure).');}
  const nes=g.naissances||[];
  if(g.generation===0){const n=(g.population||[]).length||nes.length;
    P.push('La population de départ : '+pluriel(n,'pilote')+', le témoin (pilote-voltige, écrit à la main) et '+Math.max(0,n-1)+' mutants de départ, des copies du témoin aux réglages un peu changés.');}
  else P.push(nes.length?pluriel(nes.length,'naissance')+' ('+compter(nes,'origine',ORIG)+').':'Aucune naissance.');
  const mo=g.morts||[];
  P.push(!mo.length?'Aucun renvoi.':mo.every(m=>m&&m.raison==='renvoi')?pluriel(mo.length,'renvoi')+' : '+(mo.length>1?'les notes F les plus basses.':'la note F la plus basse.'):
    pluriel(mo.length,'renvoi')+' ('+compter(mo,'raison',RAISONS)+').');
  if(g.meneur&&g.meneur.id)P.push('Le meneur est '+court(g.meneur.id)+' : '+note(g.meneur)+'.');
  const c=g.courses||{};
  if(fini(c.jouees))P.push(pluriel(c.jouees,'course jouée','courses jouées')+(fini(g.duree_s)?' en '+duree(g.duree_s):'')+
    (c.nonMesurees?', dont '+pluriel(c.nonMesurees,'non mesurée','non mesurées')+' (ratée ou jouée dans de mauvaises conditions)':'')+'.');
  for(const v of vals)P.push(phraseValidation(v,cfg));
  if(!vals.length&&g.validation&&g.validation.usage)P.push(g.validation.usage==='revalidation'?'Revalidation du champion : '+(g.validation.sacre?'il garde son titre.':'il perd son titre.'):
    'Validation du meneur : '+(g.validation.sacre?'**sacré nouveau champion**.':'pas sacré.'));
  for(const k of cofs)P.push(phraseCoffre(k));
  if(!cofs.length&&g.coffre&&g.coffre.diff)P.push('Coffre ('+(RAISON_COFFRE[g.coffre.raison]||g.coffre.raison||'?')+') : champion − témoin = '+frs(g.coffre.diff.palier)+' palier.');
  out.push(P.join(' '));
  const ev=g.evenements||[];
  if(ev.length){out.push('');for(const e of ev)out.push('- '+evenementClair(e));}
  out.push('');
  return out;}

/* ===== POUR sauver-traces.cmd : le message du commit (ASCII : la console Windows) et le nom du PC ===== */
function ascii(s){return String(s).normalize('NFD').replace(/[^ -~]/g,'');}   /* NFD separe les accents, qui partent avec le reste */
function message(cfg,o){
  o=o||{};
  const D=o.donnees||ET.lire(cfg,{morts:true});
  const G=D.generations,dern=G.length?G[G.length-1]:null,pop=D.pop;
  if(!dern&&!pop)return 'pas encore de generation';
  const M=A.modele(cfg,{donnees:D});
  const nSacres=[...M.sacres.values()].reduce((s,L)=>s+L.length,0);
  const parts=['generation '+(dern?dern.generation:pop.generation)];
  parts.push(M.individus.length+' nes',M.individus.filter(x=>!x.vivant).length+' renvoyes',nSacres+' sacre'+(nSacres>1?'s':''));
  parts.push(M.champion&&M.champion!==M.temoin?'champion '+String(M.champion).slice(0,8):'champion = temoin');
  const derK=D.coffre.length?D.coffre[D.coffre.length-1]:null;
  if(derK&&derK.diff&&fini(derK.diff.palier)&&derK.champion&&derK.temoin&&derK.champion.id!==derK.temoin.id)parts.push('coffre '+(derK.diff.palier>=0?'+':'')+derK.diff.palier.toFixed(2)+' palier');
  return ascii(parts.join(', '));}
function nomPc(){
  const n=String(process.env.EVOLUTION_PC||os.hostname()||'pc').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^[-.]+|[-.]+$/g,'');
  return n||'pc';}

function ecrire(cfg,o){
  const dossier=ET.chemin(cfg,cfg.dossierEtat||'etat');
  const f=path.join(dossier,'histoire.md');
  ecrireAtomique(f,texte(cfg,o).replace(/\r/g,''));
  return f;}

module.exports={ecrire,texte,message,nomPc,evenementClair,phraseValidation,phraseCoffre};

if(require.main===module){
  try{
    const argv=process.argv.slice(2),cfg=A.lireLigne(argv);
    if(argv.indexOf('--pc')>=0)process.stdout.write(nomPc()+'\n');
    else if(argv.indexOf('--message')>=0)process.stdout.write(message(cfg)+'\n');
    else process.stdout.write('histoire : '+ecrire(cfg)+'\n');
  }catch(e){process.stderr.write('histoire : '+(e&&e.message||e)+'\n');process.exit(1);}
}
