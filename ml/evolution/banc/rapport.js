/* ===== LE BANC DES GENES V2 : LES TEXTES (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 6.7. Pur : on lui donne le plan, les regards (et le resultat a la fin), il rend des textes.
   - resume(planJ, regardsJ)          : resume.txt, pour Sacha (lignes de 118 colonnes au plus). Pendant la vague : SEULEMENT l'avancement (aucune
                                        difference chiffree tant qu'un bras joue). A la fin : une ligne par bras, puis ce qu'on peut dire et ce qu'on ne
                                        peut pas dire ;
   - journal(planJ, regardsJ, res, o) : journal.md (le portfolio) : la question, les bras et pourquoi, les criteres, le plan, chaque regard, les verdicts,
                                        le cout, les courses non mesurees ;
   - index(I) / lireIndex(texte)      : vagues/INDEX.md, avec sa table lisible par la machine dans un commentaire (les numeros pris, les vagues conclues) ;
   - pourJson(x)                      : +inf / -inf en texte (JSON n'a pas d'infini). */
'use strict';
const Cr=require('./criteres');

const LARGEUR=118;
const VERDICTS={'net-aide':'NET : aide (candidat)','net-nuit':'NET : nuit','rare':'trop rare','futilite':'rien de net (arret tot)','plafond':'rien de net au plafond',
  'continuer':'en cours'};

/* ---------- outils ---------- */
/* coupe un texte en lignes de LARGEUR colonnes au plus ; suite = le retrait des lignes suivantes */
function plier(texte,suite,largeur){
  largeur=largeur||LARGEUR;suite=suite||'';
  const mots=String(texte).split(/ +/),L=[];let cour='';
  for(const m of mots){
    const essai=cour?cour+' '+m:m;
    if(essai.length<=largeur||!cour){cour=essai;continue;}
    L.push(cour);cour=suite+m;}
  if(cour)L.push(cour);
  /* un mot plus long que la ligne (un chemin) : coupe dur */
  const R=[];for(const l of L){let x=l;while(x.length>largeur){R.push(x.slice(0,largeur));x=suite+x.slice(largeur);}R.push(x);}
  return R;}
const virgule=(x,k)=>x==null?'-':(typeof x==='string'?x:x.toFixed(k==null?2:k).replace('.',','));
const signe=(x,k)=>x==null?'-':typeof x==='string'?x:(x>=0?'+':'')+virgule(x,k);
const pc=x=>x==null?'-':Math.round(100*x)+' %';
const rang=j=>j===1?'1er':j+'e';
function pourJson(x){
  if(typeof x==='number'&&!isFinite(x))return x!==x?null:(x>0?'+inf':'-inf');
  if(Array.isArray(x))return x.map(pourJson);
  if(x&&typeof x==='object'){const o={};for(const k of Object.keys(x))o[k]=pourJson(x[k]);return o;}
  return x;}

/* l'etat de chaque bras d'apres les regards : son arret (regard, decision) ou « actif » */
function etatDesBras(planJ,regardsJ){
  const E={};for(const b of planJ.bras)E[b.nom]={actif:true,j:null,n:null,decision:null,dernier:null,premier:null};
  for(const r of regardsJ.regards||[])for(const [nom,x] of Object.entries(r.bras||{})){
    const e=E[nom];if(!e)continue;e.dernier=Object.assign({j:r.j,n:r.n},x);if(!e.premier)e.premier=e.dernier;
    if(x.decision!=='continuer'){e.actif=false;e.j=r.j;e.n=r.n;e.decision=x.decision;}}
  return E;}
const fini=(planJ,regardsJ)=>{const E=etatDesBras(planJ,regardsJ);return planJ.bras.every(b=>!E[b.nom].actif);};

function enTete(planJ){
  const v=planJ.vague,o=[];
  o.push(...plier('LE BANC DES GENES V2 : vague '+v.nom+' (numero '+v.numero+(v.numero===0?', l\'essai : jamais conclu':'')+')'));
  o.push(...plier('La question : '+v.question,'  '));
  o.push(...plier('Le temoin : '+v.temoin+' (genome '+planJ.temoin.genome+') ; '+(v.carte?'carte imposee : '+v.carte+' (seule la premiere map : le jeu tire les suivantes)':'la graine tire les maps')+
    ' ; tmax '+planJ.tmax+' s ; graines '+planJ.graines.premiere+' a '+planJ.graines.derniere+' au plus (pas 37, neuves pour cette vague).','  '));
  /* (28/11, le relecteur « banc-courses ») le plan dit d'abord en mots ce que fait le banc ; les noms des methodes (Bonferroni, O'Brien-Fleming)
     restent en fin de phrase, pour qui veut les chercher ; plus de « |z| » (un symbole que Sacha ne lit pas) */
  const arrets=['son ecart au temoin est assez grand pour ne pas etre le hasard (« net »)'];
  if(planJ.vague.plan.fMin>0)arrets.push('il change moins de '+pc(planJ.vague.plan.fMin)+' des courses au premier point (« trop rare »)');
  if(planJ.vague.plan.futilite>0)arrets.push('des le deuxieme point, son ecart est trop petit pour devenir net (« rien de net »)');
  o.push(...plier('Le plan : le banc fait le point apres '+planJ.regards.join(', ')+' graines. A chaque point, un bras s\'arrete si '+
    arrets.map((x,i)=>i===0?x:(i===arrets.length-1?'ou si ':'si ')+x).join(', ')+', et au dernier point dans tous les cas. '+
    'Le seuil du « net » est tres haut au premier point et descend a chaque point. Risque de dire « net » par hasard : '+virgule(100*planJ.alpha,0)+
    ' % pour toute la vague ('+planJ.k+' bras, '+virgule(100*planJ.alphaBras,2)+' % chacun : Bonferroni ; seuils d\'O\'Brien-Fleming, constante '+virgule(planJ.c,3)+').','  '));
  return o;}

/* (28/11, le relecteur « banc-courses ») l'unite d'un ecart, pour que « +0,40 » dise de quoi il parle */
function unite(c){
  if(!c)return '';
  if(c.type==='palier')return ' palier par course';
  if(c.type==='causes')return ' mort par course';
  if(c.type==='survie')return ' s de survie par course';
  if(c.type==='vols')return ' vol par course';
  if(c.type==='F')return ' point de note F par course';
  if(c.type==='E')return ' d\'ecart E aux joueurs';
  if(c.type==='mesure')return ' sur la mesure '+c.cle;
  return '';}

/* ---------- resume.txt ---------- */
function resume(planJ,regardsJ){
  const o=enTete(planJ),E=etatDesBras(planJ,regardsJ),R=regardsJ.regards||[],der=R[R.length-1];
  o.push('');
  if(!fini(planJ,regardsJ)){
    /* (28/11, le relecteur « banc-courses ») « 2e regard fait sur 6 » se lisait « fait sur 6 graines » */
    o.push('EN COURS : '+(der?'point '+der.j+' sur '+planJ.regards.length+' fait, '+der.n+' graines jouees (au plus '+planJ.vague.plan.plafond+')':'aucun point fait encore')+'.');
    const actifs=planJ.bras.filter(b=>E[b.nom].actif).map(b=>b.nom),arr=planJ.bras.filter(b=>!E[b.nom].actif);
    o.push(...plier('Bras qui jouent encore : '+(actifs.length?actifs.join(', '):'aucun')+'.','  '));
    if(arr.length)o.push(...plier('Bras deja arretes : '+arr.map(b=>{const d=E[b.nom].decision;return b.nom+' au '+rang(E[b.nom].j)+' point ('+(d==='net-aide'||d==='net-nuit'?'net':(VERDICTS[d]||d))+')';}).join(' ; ')+'.','  '));
    o.push(...plier('Aucun chiffre tant qu\'un bras joue : on ne tire aucune conclusion d\'une lecture en cours (le sens d\'un « net » et les ecarts '+
      'paraissent a la fin de la vague).'));
    if(der)o.push(...plier('Courses jouees ou lues jusqu\'ici : '+der.courses+' ; non mesurees : '+der.nonMesurees+'.'));
    return o.join('\n')+'\n';}
  o.push('LA VAGUE EST FINIE. Une ligne par bras (le critere a ete annonce avant de jouer) :');
  const T=[['bras','critere annonce','verdict','graines lues','courses changees']];
  for(const b of planJ.bras){const e=E[b.nom];T.push([b.nom,Cr.dire(b.critere),VERDICTS[e.decision]||e.decision,e.n+' ('+rang(e.j)+' point)',pc(e.dernier&&e.dernier.f)]);}
  const W=T[0].map((_,i)=>Math.max(...T.map(r=>r[i].length)));
  for(const r of T){const l=r.map((x,i)=>x.padEnd(W[i])).join(' | ');o.push(...(l.length<=LARGEUR?[l]:plier(r.join(' | '),'    ')));}
  o.push('');
  o.push('CE QU\'ON PEUT DIRE');
  const nets=planJ.bras.filter(b=>/^net/.test(E[b.nom].decision));
  const confirmation=planJ.k===1&&planJ.regards.length===1;
  for(const b of planJ.bras){const e=E[b.nom],x=e.dernier||{},x1=e.premier||{};
    if(e.decision==='net-aide')o.push(...plier('- '+b.nom+' fait mieux que le temoin sur son critere ('+Cr.dire(b.critere)+'), de facon nette au '+rang(e.j)+' point. '+
      (confirmation?'C\'est une vague de confirmation : le candidat est CONFIRME sur des graines neuves.':
        'C\'est un CANDIDAT, pas une preuve : il faut une vague de confirmation (un seul bras, un numero neuf, un nombre fixe de graines, le meme critere) avant de proposer de l\'allumer.')+
      /* (28/11, le relecteur « banc-courses ») l'unite de l'ecart ; « gonfle par l'arret » seulement s'il est tot (au plafond, rien ne le gonfle) */
      ' Ecart lu a l\'arret : '+signe(x.d)+unite(b.critere)+(e.n<planJ.vague.plan.plafond?' (gonfle : un arret tot tombe souvent sur un bon moment)':'')+
      ' ; au premier point il valait '+signe(x1.d)+'.','  '));
    else if(e.decision==='net-nuit')o.push(...plier('- '+b.nom+' fait moins bien que le temoin sur son critere ('+Cr.dire(b.critere)+'), de facon nette au '+rang(e.j)+
      ' point (ecart '+signe(x.d)+unite(b.critere)+(e.n<planJ.vague.plan.plafond?', gonfle par l\'arret tot':'')+' ; au premier point '+signe(x1.d)+').','  '));
    else if(e.decision==='rare')o.push(...plier('- '+b.nom+' ne change que '+pc(x.f)+' des courses ici : le banc ne peut pas le mesurer sur ces maps (essayer une carte imposee ou il agit).','  '));}
  if(!nets.length)o.push(...plier('- Aucun bras ne fait mieux ou moins bien que le temoin de facon nette, sur son critere annonce.','  '));
  /* (28/11, le relecteur « banc-courses ») une confirmation ratee se dit aussi clairement qu'une confirmation reussie */
  if(confirmation&&!planJ.bras.some(b=>E[b.nom].decision==='net-aide'))
    o.push(...plier('- C\'etait une vague de confirmation : le candidat n\'est PAS confirme sur ces graines neuves (le « net » de la vague d\'avant etait peut-etre le hasard).','  '));
  o.push('');
  o.push('CE QU\'ON NE PEUT PAS DIRE');
  /* (28/11, le relecteur « banc-courses ») le chiffre de puissance (§ 6.5) ne vaut que pour 5 bras et 192 graines : il est dit comme tel */
  o.push(...plier('- « Rien de net » ne veut pas dire « ne fait rien » : un gene qui ferait gagner 1 palier par course n\'est reconnu qu\'environ 3 fois sur 4 '+
    '(chiffre calcule pour 5 bras et 192 graines'+(planJ.vague.plan.plafond!==192||planJ.k!==5?' ; ici '+planJ.k+' bras et '+planJ.vague.plan.plafond+' graines au plus':'')+
    '), et moins souvent s\'il ne change qu\'une partie des courses.','  '));
  o.push(...plier('- Le risque d\'un faux « net » est de '+virgule(100*planJ.alpha,0)+' % pour cette vague entiere : sur 10 vagues, environ un demi faux « net » est attendu (vagues/INDEX.md les compte).','  '));
  o.push(...plier('- Les mesures secondaires de resultat.json (les compteurs, les causes, la survie, les cartes) ne decident rien : elles ne sont pas corrigees.','  '));
  if(planJ.vague.carte)o.push(...plier('- Seule la premiere map est imposee ('+planJ.vague.carte+') : la suite de chaque course est tiree par le jeu.','  '));
  o.push(...plier('- Un bras est mesure seul, sur ce temoin : ce qui aide ici peut ne rien apporter sur un autre pilote.','  '));
  if(der)o.push('','Courses : '+der.courses+' ; non mesurees : '+der.nonMesurees+' ; temps de course cumule : '+virgule(der.minutes/60,1)+' h.');
  return o.join('\n')+'\n';}

/* ---------- journal.md ---------- */
function journal(planJ,regardsJ,res,o){
  o=o||{};
  const v=planJ.vague,E=etatDesBras(planJ,regardsJ),F=fini(planJ,regardsJ),L=[];
  L.push('# Vague '+v.nom+' (numero '+v.numero+')','');
  L.push('Ecrit par le banc des genes v2 (`ml/evolution/banc/banc.js`), jamais a la main : une note libre va dans `notes.md`.','');
  L.push('- depart : '+planJ.date+(res?' ; fin : '+res.date:' ; en cours'));
  L.push('- temoin : '+v.temoin+', genome `'+planJ.temoin.genome+'`, pilote `'+String(planJ.temoin.shaPilote).slice(0,12)+'`'+
    (Object.keys(v.fixes).length?' ; fixes (temoin et bras) : `'+JSON.stringify(v.fixes)+'`':''));
  L.push('- carte : '+(v.carte?v.carte+' (la premiere map seulement)':'tiree par la graine')+' ; tmax '+planJ.tmax+' s ; epoque des courses `'+planJ.epoque.courses+'`, de la note `'+planJ.epoque.note+'` ; bootstrap '+planJ.bootstrap+' tirages','');
  L.push('## La question','',v.question,'');
  L.push('## Les bras, pourquoi, et le critere annonce avant de jouer','');
  L.push('| bras | pourquoi | genes | genome | pilote | critere |','|---|---|---|---|---|---|');
  for(const b of planJ.bras)L.push('| '+b.nom+' | '+b.dit+' | `'+JSON.stringify(b.genes)+'` | `'+b.genome+'` | `'+String(b.shaPilote).slice(0,12)+'` | '+Cr.dire(b.critere)+' |');
  L.push('');
  L.push('## Le plan','');
  L.push('- regards a '+planJ.regards.join(', ')+' graines ; graines '+planJ.graines.premiere+' a '+planJ.graines.derniere+' (4 000 000 + 37 x (1 000 x (numero - 1) + i))');
  L.push('- k = '+planJ.k+' bras ; alpha '+planJ.alpha+' pour la vague, '+planJ.alphaBras+' par bras (Bonferroni) ; constante c = '+planJ.c.toFixed(4)+
    ' (200 000 chemins, mulberry32(20261128), dichotomie a 40 pas) ; borne = c x racine(plafond / m)');
  L.push('- bornes si toutes les graines sont mesurees : '+planJ.regards.map(n=>n+' -> '+(planJ.c*Math.sqrt(v.plan.plafond/n)).toFixed(2)).join(', '));
  L.push('- arret « rare » au 1er regard si f < '+v.plan.fMin+' ; futilite des le 2e regard si |z| < '+v.plan.futilite,'');
  L.push('## Les regards','');
  if(!F)L.push('La vague est en cours : seules les decisions sont ecrites ici ; les chiffres de chaque regard paraissent a la fin (aucune conclusion d\'une lecture en cours).','');
  L.push('| regard | graines | bras | m | f | d | se | z | borne | decision |','|---|---|---|---|---|---|---|---|---|---|');
  for(const r of regardsJ.regards||[])for(const [nom,x] of Object.entries(r.bras)){
    if(F)L.push('| '+r.j+' | '+r.n+' | '+nom+' | '+x.m+' | '+(x.f==null?'-':x.f.toFixed(3))+' | '+(x.d==null?'-':(+x.d).toFixed(4))+' | '+(x.se==null?'-':(+x.se).toFixed(4))+' | '+
      (x.z==null?'-':typeof x.z==='string'?x.z:x.z.toFixed(3))+' | '+
      /* (28/11, le relecteur « banc-courses ») une borne infinie (m = 0) arrive ici en texte « +inf » (pourJson) : toFixed levait */
      (x.borne==null?'inf':typeof x.borne==='string'?x.borne:x.borne.toFixed(3))+' | '+x.decision+' |');
    else L.push('| '+r.j+' | '+r.n+' | '+nom+' | | | | | | | '+(x.decision==='continuer'?'continuer':'arrete')+' |');}
  L.push('');
  if(res){
    L.push('## Les verdicts','');
    for(const b of planJ.bras){const x=res.bras[b.nom];
      L.push('- **'+b.nom+'** : '+(VERDICTS[x.verdict]||x.verdict)+' au '+rang(x.regard)+' regard, sur '+x.m+' graines mesurees ('+x.graines+' jouees) ; d '+signe(x.d,3)+
        ', se '+virgule(x.se,3)+(x.biaiseParLArret?' (biaise par l\'arret)':'')+' ; au premier regard d '+signe(x.dPremier,3)+', se '+virgule(x.sePremier,3)+' ; courses changees '+pc(x.f)+
        (x.candidat?' ; **candidat** : a confirmer par une vague neuve':''));}
    L.push('');
    L.push('Les mesures secondaires (dans `resultat.json`, `secondaires`) ne decident rien : elles ne sont pas corrigees.','');}
  const der=(regardsJ.regards||[]).slice(-1)[0];
  L.push('## Le cout','');
  L.push('- courses : '+(der?der.courses:0)+' ; temps de course cumule : '+(der?(der.minutes/60).toFixed(2):'0')+' h'+(o.horloge_min!=null?' ; ce lancement : '+o.horloge_min.toFixed(1)+' min d\'horloge':''));
  const NM=o.nonMesurees||[];
  L.push('- courses non mesurees : '+(NM.length?NM.length:'aucune'));
  for(const x of NM.slice(0,50))L.push('  - '+x.id+' graine '+x.graine+' : '+x.raison);
  if(NM.length>50)L.push('  - … et '+(NM.length-50)+' de plus (regards.json)');
  return L.join('\n')+'\n';}

/* ---------- vagues/INDEX.md ---------- */
const BALISE_INDEX='<!-- banc-index ';
function indexVide(){return {format:'banc-index-1',numeros:{},vagues:{}};}
function lireIndex(texte){
  if(texte==null)return indexVide();
  const i=texte.indexOf(BALISE_INDEX);
  if(i<0)throw new Error('INDEX.md sans sa table (le commentaire « banc-index ») : refait a la main ? (le banc ne sait plus quels numeros sont pris)');
  const j=texte.indexOf(' -->',i);
  const I=JSON.parse(texte.slice(i+BALISE_INDEX.length,j));
  if(!I||I.format!=='banc-index-1'||typeof I.numeros!=='object'||typeof I.vagues!=='object')throw new Error('INDEX.md : table illisible');
  return I;}
function index(I){
  const conclues=Object.values(I.vagues);
  const attendus=conclues.reduce((s,v)=>s+(v.alpha||0.05),0);
  const L=['# Le banc des genes v2 : les vagues','',
    'Refait par le banc a chaque depart et a chaque fin de vague (`ml/evolution/banc/banc.js`). Ne pas l\'editer a la main : la table cachee en bas',
    'tient les numeros pris (un numero pris ne se reprend jamais : ses graines ont ete jouees).','',
    '**Vagues conclues : '+conclues.length+'. Faux « net » attendus par hasard sur ces vagues : '+attendus.toFixed(2).replace('.',',')+'** (5 % par vague : sur 10 vagues, environ 0,5).',
    'Un « net-aide » est un candidat ; seule une vague de confirmation (un bras, un numero neuf, un nombre fixe de graines) le confirme.','',
    '## Les numeros pris','','| numero | vague | inscrit le |','|---|---|---|'];
  for(const n of Object.keys(I.numeros).map(Number).sort((a,b)=>a-b))L.push('| '+n+' | '+I.numeros[n].nom+' | '+String(I.numeros[n].date).slice(0,10)+' |');
  L.push('','## Les vagues conclues','','| date | numero | vague | question | verdicts | statut |','|---|---|---|---|---|---|');
  for(const v of conclues.slice().sort((a,b)=>a.numero-b.numero))
    L.push('| '+String(v.date).slice(0,10)+' | '+v.numero+' | '+v.nom+' | '+String(v.question).replace(/\|/g,'/')+' | '+Object.entries(v.verdicts).map(([b,d])=>b+' : '+d).join(', ')+' | '+v.statut+' |');
  L.push('',BALISE_INDEX+JSON.stringify(I).replace(/-->/g,'--\\u003e')+' -->','');
  return L.join('\n');}

module.exports={LARGEUR,VERDICTS,plier,pourJson,etatDesBras,fini,resume,journal,index,lireIndex,indexVide};
