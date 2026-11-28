#!/usr/bin/env node
/* ===== LE BANC DES GENES V2 : LA LIGNE DE COMMANDE ET LA BOUCLE DES REGARDS (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 6 (il fait foi), § 8.4 (les tests : banc/tests/banc.test.js).
   Une VAGUE compare 1 a 5 bras (un gene allume, ou quelques-uns) au temoin, sur des graines NEUVES a elle, avec un critere par bras annonce avant de
   jouer. Elle regarde apres 24 graines, puis toutes les 24, jusqu'a 192 (par defaut), et arrete un bras des que c'est clair (« net »), qu'il est trop
   rare (1er regard), qu'il ne montre rien (futilite, des le 2e) ou au plafond. Le taux de faux « net » d'une vague reste sous 5 % : la borne
   d'O'Brien-Fleming, et Bonferroni entre les bras (plan.js). Un « net-aide » n'est qu'un CANDIDAT : il faut une vague de confirmation.
   Le banc n'allume jamais rien lui-meme et ne touche pas a la selection : son etat est banc/etat/ (le cache des courses), jamais ml/evolution/etat.

   node ml/evolution/banc/banc.js --vague ml/evolution/banc/vagues/v001-maps-a-decor [--travailleurs 2] [--config ml/evolution/config.json]
                                  [--verifier] [--resume] [--etat <dossier>] [--bras <bras.json>]
     --verifier : lit tout, fabrique les pilotes, calcule le plan et sa constante, ecrit plan.json s'il manque, ne joue rien ;
     --resume   : reecrit et imprime resume.txt depuis regards.json, ne joue rien ;
     --etat, --bras : un autre dossier d'etat, un autre catalogue de bras (les tests ; par defaut banc/etat et banc/bras.json).
   Arret : creer banc/etat/STOP, ou Ctrl+C (une fois : plus de lancement ; deux fois : les courses en cours sont tuees). Reprise : la meme commande.
   Codes : 0 fini (ou --verifier / --resume sans defaut) ; 1 entree mal ecrite ; 2 une course rend YEUX CHANGES, une erreur du cerveau, une carte
   imposee non appliquee, ou plus de 10 % des courses d'un regard non mesurees ; 3 interrompue ; 4 la vague, l'epoque, la note, le bootstrap ou un
   pilote a change depuis le depart (plan.json) ; 5 un autre banc tient le verrou.
   La reprise : a chaque lancement tout est refabrique et compare a plan.json, puis tout se recalcule depuis les courses (le cache rend celles deja
   jouees ; chaque regard ne lit que SES graines ; les bootstraps ont leur graine) : memes decisions, regards.json reecrit en entier. */
'use strict';
const fs=require('fs'),path=require('path');
const BANC=__dirname,EVO=path.join(__dirname,'..');
const C=require(path.join(EVO,'commun'));
const Gr=require(path.join(EVO,'graines'));
const P=require('./plan'),Cr=require('./criteres'),B=require('./bras'),Rp=require('./rapport');
const {ErreurBanc}=P;

const PART_NON_MESUREES_MAX=0.10;
const r6=x=>typeof x==='number'&&isFinite(x)?Math.round(x*1e6)/1e6:x;

/* ===== LE DEROULEMENT D'UNE VAGUE (pur : les courses viennent de o.jouer) =====
   o = {plan (lirePlan), regards (regardsDe), c, bras:[{nom, critere}], jouer(paquet) -> Promise<lignes | null>, statistique(paires, critere, nom),
        apresRegard(etat) (facultatif)}
   paquet = [{qui:'temoin'|nom, i}] : les graines i (indices du plan) a jouer pour ce regard, le temoin d'abord puis les bras actifs, graine par graine.
   jouer rend les lignes dans le meme ordre, ou null si la vague est interrompue (rien n'est decide pour ce regard).
   Rend {fini, interrompu, regards:[…], bras:{nom:{decision, j, n, premier, dernier}}, lignes:{qui:[ligne par i]}}. */
async function derouler(o){
  const plan=o.plan,R=o.regards,noms=o.bras.map(b=>b.nom);
  const L={temoin:[]};for(const n of noms)L[n]=[];
  const E={};for(const b of o.bras)E[b.nom]={critere:b.critere,actif:true,decision:null,j:null,n:null,premier:null,dernier:null};
  const regards=[];let courses=0,nonMesurees=0,ms=0;
  for(let j=1;j<=R.length;j++){
    const n=R[j-1],avant=j>1?R[j-2]:0,actifs=noms.filter(x=>E[x].actif);
    if(!actifs.length)break;
    const paquet=[];for(let i=avant;i<n;i++){paquet.push({qui:'temoin',i});for(const x of actifs)paquet.push({qui:x,i});}
    const lignes=await o.jouer(paquet);
    if(lignes==null)return {fini:false,interrompu:true,regards,bras:E,lignes:L};
    let nm=0;
    for(let k=0;k<paquet.length;k++){const l=lignes[k];L[paquet[k].qui][paquet[k].i]=l;if(!l||l.mesuree!==true)nm++;if(l&&typeof l.ms==='number')ms+=l.ms;}
    courses+=paquet.length;nonMesurees+=nm;
    if(nm>PART_NON_MESUREES_MAX*paquet.length)
      throw new ErreurBanc('regard '+j+' : '+nm+' courses non mesurees sur '+paquet.length+' (plus de 10 %) : arret, rien n\'est conclu (voir le journal des courses)',2);
    const rec={j,n,temoin:{mesurees:0},bras:{},nonMesurees,courses,minutes:r6(ms/60000)};
    for(let i=0;i<n;i++)if(L.temoin[i]&&L.temoin[i].mesuree===true)rec.temoin.mesurees++;
    for(const x of actifs){
      const paires=[];
      for(let i=0;i<n;i++){const t=L.temoin[i],b=L[x][i];if(t&&b&&t.mesuree===true&&b.mesuree===true)paires.push({i,t,b});}
      const s=o.statistique(paires,E[x].critere,x);
      const pc=Cr.partChangee(paires);
      const borne=P.borne(plan,o.c,s.m);
      const decision=P.decision(plan,{j,n,z:s.z,borne,f:pc.f,sens:E[x].critere.sens});
      const y={m:s.m,identiques:pc.identiques,f:pc.f,d:s.d,se:s.se,z:s.z,borne,decision};
      rec.bras[x]=y;
      const e=E[x];e.dernier=Object.assign({j,n},y);if(!e.premier)e.premier=e.dernier;
      if(decision!=='continuer'){e.actif=false;e.decision=decision;e.j=j;e.n=n;}}
    regards.push(rec);
    if(o.apresRegard)await o.apresRegard({regards,bras:E,lignes:L});}
  return {fini:noms.every(x=>!E[x].actif),interrompu:false,regards,bras:E,lignes:L};}

/* ===== LES MESURES SECONDAIRES D'UN BRAS (« ne decident rien » : non corrigees) =====
   Sur les graines lues par le bras jusqu'a son arret, mesurees chez lui et chez le temoin. o = {N, REF, cfg, nomVague} */
function secondaires(Lt,Lb,n,nom,o){
  const paires=[];for(let i=0;i<n;i++){const t=Lt[i],b=Lb[i];if(t&&b&&t.mesuree===true&&b.mesuree===true)paires.push({i,t,b});}
  const S={nonCorrigees:true,dit:'mesures secondaires : elles ne decident rien (aucune correction pour leur nombre)',graines:paires.length};
  if(!paires.length)return S;
  const cmp=o.N.comparer(paires.map(p=>p.b),paires.map(p=>p.t),{REF:o.REF,cfg:o.cfg,rng:Gr.rngDe('banc|'+o.nomVague+'|'+nom+'|secondaires|'+paires.length)});
  Object.assign(S,{dPalier:r6(cmp.dPalier),se_dPalier:r6(cmp.se_dPalier),dF:r6(cmp.dF),se_dF:r6(cmp.se_dF),dE:r6(cmp.dE),se_dE:r6(cmp.se_dE)});
  const pc=Cr.partChangee(paires);S.f=r6(pc.f);
  S.partVuesDifferentes=r6(paires.filter(p=>p.b.empreinteVues!==p.t.empreinteVues).length/paires.length);
  /* les compteurs : la moyenne par course et la part des graines ou il depasse 0 (bras et temoin) */
  const cpt=(lignes)=>{const noms=new Set();for(const l of lignes)if(l.declenchements&&typeof l.declenchements==='object')for(const k of Object.keys(l.declenchements))noms.add(k);
    const r={};for(const k of [...noms].sort()){let s=0,p=0;for(const l of lignes){const v=(l.declenchements&&l.declenchements[k])|0;s+=v;if(v>0)p++;}
      r[k]={moyenneParCourse:r6(s/lignes.length),partGrainesPlusDeZero:r6(p/lignes.length)};}return r;};
  const LB=paires.map(p=>p.b),LT=paires.map(p=>p.t);
  S.compteurs={bras:cpt(LB),temoin:cpt(LT),lignesSansCompteurs:LB.filter(l=>l.declenchements==null).length};
  {let vol=0,pose=0;for(const l of LB){const d=l.declenchements||{};vol+=d['sortieOn.vol']|0;pose+=d['sortieOn.pose']|0;}
    S.sortiesFinissantMal=vol>0?{vol,pose,part:r6((vol-pose)/vol)}:null;}
  const causes=lignes=>{const r={};let sans=0;for(const l of lignes){if(!Array.isArray(l.causesMorts)){sans++;continue;}for(const c of l.causesMorts)r[c]=(r[c]||0)+1;}
    const o2={};for(const k of Object.keys(r).sort())o2[k]=r[k];return {morts:o2,lignesSansCausesMorts:sans};};
  S.causesMorts={bras:causes(LB),temoin:causes(LT)};
  const moy=(lignes,k)=>{const X=lignes.map(l=>l[k]).filter(x=>typeof x==='number'&&isFinite(x));return X.length?r6(X.reduce((s,x)=>s+x,0)/X.length):null;};
  S.survie_s={bras:moy(LB,'survie_s'),temoin:moy(LT,'survie_s')};
  S.palier={bras:moy(LB,'palier'),temoin:moy(LT,'palier')};
  const cartes=lignes=>{const r={};for(const l of lignes)if(Array.isArray(l.cartes))for(const c of l.cartes)r[c]=(r[c]||0)+1;return r;};
  S.cartes={bras:cartes(LB),temoin:cartes(LT)};
  const chance=lignes=>{const X=lignes.filter(l=>l.chancePrise===true||l.chancePrise===false);return X.length?r6(X.filter(l=>l.chancePrise).length/X.length):null;};
  S.partChancesPrises={bras:chance(LB),temoin:chance(LT)};
  return S;}

/* ===== LE RESULTAT (resultat.json) : deterministe (sauf « date ») : le meme apres une reprise ===== */
function resultat(planJ,D,o){
  const res={format:'banc-resultat-1',date:o.maintenant(),vague:planJ.vague.nom,numero:planJ.vague.numero,question:planJ.vague.question,
    epoque:planJ.epoque,temoin:{genome:planJ.temoin.genome,shaPilote:planJ.temoin.shaPilote},k:planJ.k,alphaBras:planJ.alphaBras,c:r6(planJ.c),bras:{}};
  for(const b of planJ.bras){const e=D.bras[b.nom],x=e.dernier,x1=e.premier;
    res.bras[b.nom]={critere:b.critere,verdict:e.decision,regard:e.j,graines:e.n,m:x.m,d:r6(x.d),se:r6(x.se),z:r6(x.z),borne:r6(x.borne),
      biaiseParLArret:/^net/.test(e.decision)&&e.n<planJ.vague.plan.plafond,dPremier:r6(x1.d),sePremier:r6(x1.se),candidat:e.decision==='net-aide',
      f:r6(x.f),identiques:x.identiques,secondaires:secondaires(D.lignes.temoin,D.lignes[b.nom],e.n,b.nom,o)};}
  const der=D.regards[D.regards.length-1];
  res.courses=der?der.courses:0;
  res.nonMesurees=o.nonMesurees;
  res.confirmation=planJ.k===1&&planJ.regards.length===1;
  return Rp.pourJson(res);}

/* ===== LE VERROU ===== */
function prendreVerrou(f){
  for(let essai=0;essai<2;essai++){
    try{fs.mkdirSync(path.dirname(f),{recursive:true});const fd=fs.openSync(f,'wx');try{fs.writeSync(fd,JSON.stringify({pid:process.pid,date:new Date().toISOString()})+'\n');}finally{fs.closeSync(fd);}return;}
    catch(e){if(e.code!=='EEXIST')throw e;
      let v=null;try{v=JSON.parse(fs.readFileSync(f,'utf8'));}catch(x){}
      if(v&&C.vivant(v.pid))throw new ErreurBanc('un autre banc tient le verrou (pid '+v.pid+', depuis '+v.date+') : '+f+' (s\'il ne tourne plus, effacer ce fichier)',5);
      try{fs.renameSync(f,f+'.mort-'+Date.now());}catch(x){}}}
  throw new ErreurBanc('verrou impossible a prendre : '+f,5);}
function rendreVerrou(f){try{const v=JSON.parse(fs.readFileSync(f,'utf8'));if(v.pid===process.pid)fs.unlinkSync(f);}catch(e){}}

/* ===== LA LIGNE DE COMMANDE ===== */
const USAGE='usage : node ml/evolution/banc/banc.js --vague <dossier de la vague> [--travailleurs 2] [--config f.json] [--verifier] [--resume] [--etat d] [--bras f.json]';
function lireArgs(argv){
  const a={travailleurs:2,verifier:false,resume:false};
  const AVEC=['vague','travailleurs','config','etat','bras'];
  for(let i=0;i<argv.length;i++){
    const x=argv[i];
    if(x==='--verifier'){a.verifier=true;continue;}
    if(x==='--resume'){a.resume=true;continue;}
    const k=x.replace(/^--/,'');
    if(x.indexOf('--')!==0||!AVEC.includes(k))throw new ErreurBanc('option inconnue « '+x+' »\n'+USAGE,1);
    const v=argv[++i];
    if(v==null||String(v).indexOf('--')===0)throw new ErreurBanc('--'+k+' sans valeur\n'+USAGE,1);
    a[k]=v;}
  if(!a.vague)throw new ErreurBanc('--vague manque\n'+USAGE,1);
  const t=+a.travailleurs;
  if(!(t>=1&&t===Math.floor(t)))throw new ErreurBanc('--travailleurs doit etre un entier >= 1',1);
  a.travailleurs=t;
  return a;}

/* principal(argv, o) -> le code de sortie. o (les tests) : {creer (remplace courses.creer), REF, maintenant(), epoque (objet ou fonction(cfg)),
   Gn, N, dire, signaux (Ctrl+C : la ligne de commande seulement)} */
async function principal(argv,o){
  o=o||{};
  const dire=o.dire||(t=>process.stdout.write(t+'\n'));
  const maintenant=o.maintenant||(()=>new Date().toISOString());
  let verrou=null;
  try{
    const a=lireArgs(argv||[]);
    const dossierVague=path.resolve(a.vague);
    const fPlan=path.join(dossierVague,'plan.json'),fRegards=path.join(dossierVague,'regards.json'),fResume=path.join(dossierVague,'resume.txt');
    const fResultat=path.join(dossierVague,'resultat.json'),fJournal=path.join(dossierVague,'journal.md');
    const fIndex=path.join(path.dirname(dossierVague),'INDEX.md');

    /* --resume : rien d'autre que le texte */
    if(a.resume){
      const planJ=C.lireJson(fPlan,null),regJ=C.lireJson(fRegards,null);
      if(!planJ)throw new ErreurBanc('--resume : pas de plan.json dans '+dossierVague,1);
      const t=Rp.resume(planJ,regJ||{regards:[]});
      C.ecrireAtomique(fResume,t);dire(t.replace(/\n$/,''));
      return 0;}

    let cfg;
    try{cfg=C.lireConfig(a.config||null);}catch(e){throw new ErreurBanc(String(e&&e.message||e),1);}
    const Gn=o.Gn||require(path.join(EVO,'genome')),N=o.N||require(path.join(EVO,'note'));
    const dossierEtat=path.resolve(a.etat||path.join(BANC,'etat'));
    /* (28/11, le relecteur « banc-courses ») sous Windows, « ETAT » et « etat » sont le meme dossier : la comparaison ignore la casse (comme courses.js) */
    const pareil=(x,y)=>process.platform==='win32'?x.toLowerCase()===y.toLowerCase():x===y;
    if(pareil(dossierEtat,path.resolve(C.chemin(cfg,cfg.dossierEtat))))throw new ErreurBanc('--etat : jamais le dossier d\'etat de la selection ('+dossierEtat+')',1);

    /* la vague : figee des la premiere course (le sha1 de son texte est dans plan.json) */
    const V=B.lireVague(dossierVague);
    const planAvant=C.lireJson(fPlan,null);
    if(planAvant&&planAvant.vagueSha!==V.sha)
      throw new ErreurBanc('vague.json a change depuis le depart de la vague ('+String(planAvant.vagueSha).slice(0,12)+' -> '+V.sha.slice(0,12)+') : la remettre telle quelle, ou faire une autre vague sous un autre numero',4);
    const {vague,avis}=B.controlerVague(V.vague,{cfg,declics:Gn.DECLICS||[],temoins:Gn.TEMOINS});
    for(const x of avis)dire('avertissement : '+x);

    /* le numero : unique, lu dans INDEX.md (commite) ; 0 = l'essai, jamais inscrit */
    let I=null;
    if(vague.numero!==0){
      let texteIndex=null;try{texteIndex=fs.readFileSync(fIndex,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
      try{I=Rp.lireIndex(texteIndex);}catch(e){throw new ErreurBanc(fIndex+' : '+e.message,1);}
      const pris=I.numeros[vague.numero];
      const reprise=planAvant&&planAvant.vague&&planAvant.vague.numero===vague.numero&&planAvant.vague.nom===vague.nom;
      if(pris&&(!reprise||pris.nom!==vague.nom))
        throw new ErreurBanc('le numero '+vague.numero+' est deja pris (vague « '+pris.nom+' », inscrite le '+String(pris.date).slice(0,10)+', vagues/INDEX.md) : ses graines ont ete jouees ; prendre un numero neuf',1);
      const autre=Object.entries(I.numeros).find(([n,x])=>x.nom===vague.nom&&+n!==vague.numero);
      if(autre)throw new ErreurBanc('le nom « '+vague.nom+' » est deja inscrit sous le numero '+autre[0]+' (vagues/INDEX.md)',1);}

    /* les pilotes */
    let F;
    try{F=B.fabriquer(vague,B.lireCatalogue(path.resolve(a.bras||path.join(BANC,'bras.json'))),{cfg,Gn});}
    catch(e){if(e instanceof ErreurBanc)throw e;throw new ErreurBanc('les pilotes ne se fabriquent pas : '+(e&&e.message||e),1);}

    /* le plan et sa constante */
    const regards=P.regardsDe(vague.plan),k=vague.bras.length,alphaBras=vague.plan.alpha/k;
    const c=P.constanteOBF(alphaBras,regards);
    const graines=[];for(let i=0;i<vague.plan.plafond;i++)graines.push(P.graine(vague.numero,i));
    const ep=typeof o.epoque==='function'?o.epoque(cfg):(o.epoque||require(path.join(EVO,'courses')).epoque(cfg));
    const bootstrap=cfg.validation&&cfg.validation.bootstrap!=null?cfg.validation.bootstrap:400;
    const planJ={format:'banc-plan-1',date:maintenant(),vague,vagueSha:V.sha,
      temoin:{nom:'temoin',dit:F.temoin.dit,genes:F.temoin.genes,ecarts:F.temoin.ecarts,genome:F.temoin.id,shaPilote:F.temoin.shaPilote},
      bras:F.bras.map(b=>({nom:b.nom,dit:b.dit,genes:b.genes,ecarts:b.ecarts,critere:b.critere,genome:b.id,shaPilote:b.shaPilote})),
      k,alpha:vague.plan.alpha,alphaBras,c,regards,graines:{premiere:graines[0],derniere:graines[graines.length-1],pas:P.PAS_GRAINE},
      tmax:vague.tmax,epoque:{courses:ep.courses,note:ep.note},bootstrap};

    /* la reprise : tout ce qui fait la vague doit etre ce qu'il etait au depart */
    if(planAvant){
      const ecart=[];
      if(planAvant.epoque.courses!==ep.courses)ecart.push('l\'epoque des courses a change ('+planAvant.epoque.courses+' -> '+ep.courses+') : le code ou le jeu a change ; refaire la vague sous un autre numero (rien n\'est efface)');
      if(planAvant.epoque.note!==ep.note)ecart.push('l\'epoque de la note a change ('+planAvant.epoque.note+' -> '+ep.note+' : l\'etalon des joueurs ou cfg.note)');
      if(planAvant.bootstrap!==bootstrap)ecart.push('le nombre de tirages du bootstrap a change ('+planAvant.bootstrap+' -> '+bootstrap+', cfg.validation.bootstrap)');
      if(planAvant.tmax!==planJ.tmax)ecart.push('tmax a change ('+planAvant.tmax+' -> '+planJ.tmax+')');
      if(planAvant.temoin.genome!==planJ.temoin.genome||planAvant.temoin.shaPilote!==planJ.temoin.shaPilote)
        ecart.push('le temoin refabrique n\'est plus celui du depart (genome '+planAvant.temoin.genome+' -> '+planJ.temoin.genome+', pilote '+String(planAvant.temoin.shaPilote).slice(0,12)+' -> '+planJ.temoin.shaPilote.slice(0,12)+')');
      for(const b of planJ.bras){const x=(planAvant.bras||[]).find(y=>y.nom===b.nom);
        if(!x)ecart.push('le bras « '+b.nom+' » n\'est pas dans plan.json');
        else if(x.genome!==b.genome||x.shaPilote!==b.shaPilote)ecart.push('le bras « '+b.nom+' » refabrique n\'est plus celui du depart (genome '+x.genome+' -> '+b.genome+', pilote '+String(x.shaPilote).slice(0,12)+' -> '+b.shaPilote.slice(0,12)+')');}
      if(ecart.length)throw new ErreurBanc('la vague ne peut pas reprendre : '+ecart.join(' ; '),4);
      planJ.date=planAvant.date;}

    const ecrirePlan=()=>{
      if(!planAvant)C.ecrireAtomique(fPlan,JSON.stringify(Rp.pourJson(planJ),null,1)+'\n');
      if(I&&!I.numeros[vague.numero]){I.numeros[vague.numero]={nom:vague.nom,date:planJ.date};C.ecrireAtomique(fIndex,Rp.index(I));}};
    const direPlan=()=>{
      dire('vague '+vague.nom+' (numero '+vague.numero+') : temoin '+vague.temoin+' genome '+F.temoin.id+' pilote '+F.temoin.shaPilote.slice(0,12)+
        (vague.carte?' ; carte '+vague.carte:'')+' ; tmax '+vague.tmax+' s');
      for(const b of F.bras)dire('  bras '+b.nom+' : '+JSON.stringify(b.genes)+' -> genome '+b.id+' pilote '+b.shaPilote.slice(0,12)+' ; critere : '+Cr.dire(b.critere));
      dire('  plan : regards a '+regards.join(', ')+' ; k '+k+', alpha par bras '+alphaBras.toFixed(4)+', constante '+c.toFixed(3)+' ; graines '+graines[0]+' a '+graines[graines.length-1]+
        ' ; epoque des courses '+ep.courses+', de la note '+ep.note+' ; bootstrap '+bootstrap);};

    if(a.verifier){ecrirePlan();direPlan();dire('--verifier : tout se lit et se fabrique ; aucune course jouee'+(planAvant?' (plan.json deja la, identique)':' (plan.json ecrit)'));return 0;}

    /* le verrou, STOP */
    const fStop=path.join(dossierEtat,'STOP'),fVerrou=path.join(dossierEtat,'verrou.json');
    prendreVerrou(fVerrou);verrou=fVerrou;
    if(fs.existsSync(fStop))throw new ErreurBanc('le fichier STOP est deja la ('+fStop+') : l\'effacer pour lancer',3);
    ecrirePlan();direPlan();

    /* les courses */
    let arret=false,fatal=null;
    const doitArreter=()=>arret||!!fatal||fs.existsSync(fStop);
    const creer=o.creer||require(path.join(EVO,'courses')).creer;
    const ord=creer({cfg,epoque:ep,dossierEtat,travailleurs:a.travailleurs,doitArreter,journal:t=>{if(/NON MESUREE|ERREUR|tronquee/.test(t))dire(t);}});
    let surSigint=null;
    if(o.signaux){surSigint=function(){if(arret){dire('second Ctrl+C : on tue les courses en cours');ord.arreter({dur:true});return;}
      arret=true;dire('Ctrl+C : plus de lancement, on attend les courses en cours (encore Ctrl+C : on les tue)');ord.arreter({dur:false});};
      process.on('SIGINT',surSigint);}
    const pilotes={temoin:F.temoin};for(const b of F.bras)pilotes[b.nom]=b;
    const nonMesurees=[];
    const tache=x=>{const p=pilotes[x.qui],t={source:p.texte,fichier:'evolution.js',shaPilote:p.shaPilote,id:x.qui,graine:graines[x.i],tmax:vague.tmax,usage:'banc',generation:null};
      if(vague.carte)t.carte=vague.carte;return t;};
    const juger=(l,x)=>{
      if(!l)return;
      const qui=x.qui+' graine '+graines[x.i];
      if(l.derniereErreur&&String(l.derniereErreur).indexOf('YEUX CHANGES')>=0)fatal=fatal||'YEUX CHANGES ('+qui+') : '+String(l.derniereErreur).slice(0,300);
      else if(l.erreurs>0)fatal=fatal||'erreur du cerveau ('+qui+', '+l.erreurs+' erreur(s)) : '+String(l.derniereErreur||'').slice(0,300);
      else if(/^carte imposee non appliquee/.test(String(l.raison||'')))fatal=fatal||l.raison+' ('+qui+')';
      else if(vague.carte&&l.mesuree===true&&Array.isArray(l.cartes)&&l.cartes.length&&l.cartes[0]!==vague.carte)fatal=fatal||'carte imposee non appliquee (jouee sur '+l.cartes[0]+', '+qui+')';
      if(l.mesuree!==true&&!nonMesurees.some(y=>y.id===x.qui&&y.graine===graines[x.i]))nonMesurees.push({id:x.qui,graine:graines[x.i],raison:l.raison||null});};
    const REF=o.REF||N.referenceEpoque();
    const t0=Date.now();
    const ecrireEnCours=(D)=>{
      const regJ=Rp.pourJson({format:'banc-regards-1',vague:vague.nom,epoque:ep.courses,regards:D.regards});
      C.ecrireAtomique(fRegards,JSON.stringify(regJ,null,1)+'\n');
      const pj=Rp.pourJson(planJ);
      C.ecrireAtomique(fResume,Rp.resume(pj,regJ));
      return {regJ,pj};};
    let D;
    try{
      D=await derouler({plan:vague.plan,regards,c,bras:planJ.bras,
        jouer:async paquet=>{
          let L;
          try{L=await Promise.all(paquet.map(x=>ord.demander([tache(x)]).then(R=>{const l=R&&R[0]||null;juger(l,x);return l;})));}
          catch(e){arret=true;throw new ErreurBanc('l\'ordonnanceur des courses a refuse ou echoue : '+String(e&&e.message||e)+' : arret, rien n\'est conclu',2);}
          if(fatal)throw new ErreurBanc(fatal+' : arret, rien n\'est conclu',2);
          if(L.some(l=>l==null))return null;
          return L;},
        statistique:(paires,critere,nom)=>Cr.statistique(paires,critere,{N,REF,cfg,rng:Gr.rngDe('banc|'+vague.nom+'|'+nom+'|'+paires.length)}),
        apresRegard:D2=>{const {regJ,pj}=ecrireEnCours(D2);
          const der=D2.regards[D2.regards.length-1];
          dire('regard '+der.j+' sur '+der.n+' graines : '+Object.entries(der.bras).map(([x,y])=>x+' '+(y.decision==='continuer'?'continue':'arrete')).join(', '));
          if(!Rp.fini(pj,regJ))C.ecrireAtomique(fJournal,Rp.journal(pj,regJ,null,{nonMesurees,horloge_min:(Date.now()-t0)/60000}));}});
    }finally{if(surSigint)process.removeListener('SIGINT',surSigint);}
    if(D.interrompu){
      try{fs.unlinkSync(fStop);}catch(e){}
      dire('interrompue : rien n\'est ecrit pour le regard en cours ('+D.regards.length+' regard(s) gardes) ; relancer la meme commande reprend la (STOP est efface)');
      return 3;}
    /* la fin */
    const {regJ,pj}=ecrireEnCours(D);
    const res=resultat(pj,D,{N,REF,cfg,nomVague:vague.nom,maintenant,nonMesurees});
    C.ecrireAtomique(fResultat,JSON.stringify(res,null,1)+'\n');
    C.ecrireAtomique(fJournal,Rp.journal(pj,regJ,res,{nonMesurees,horloge_min:(Date.now()-t0)/60000}));
    if(I){
      const nets=Object.values(res.bras).filter(x=>x.verdict==='net-aide');
      I.vagues[vague.nom]={numero:vague.numero,nom:vague.nom,date:res.date,question:vague.question,alpha:vague.plan.alpha,k,
        verdicts:Object.fromEntries(Object.entries(res.bras).map(([x,y])=>[x,y.verdict])),
        statut:nets.length?(res.confirmation?'confirme':'candidat'):'rien a confirmer'};
      C.ecrireAtomique(fIndex,Rp.index(I));}
    dire(Rp.resume(pj,regJ).replace(/\n$/,''));
    return 0;
  }catch(e){
    if(e instanceof ErreurBanc){dire('banc : '+e.message);return e.code;}
    dire('banc : erreur : '+String(e&&e.stack||e));
    return 1;
  }finally{if(verrou)rendreVerrou(verrou);}
}

module.exports={principal,derouler,secondaires,resultat,lireArgs,PART_NON_MESUREES_MAX};

if(require.main===module){
  principal(process.argv.slice(2),{signaux:true}).then(code=>process.exit(code),e=>{process.stderr.write(String(e&&e.stack||e)+'\n');process.exit(1);});
}
