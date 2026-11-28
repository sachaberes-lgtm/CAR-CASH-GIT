'use strict';
/* ===== LES TESTS DE LA MESURE GRATUITE DE TAU (28/11/2026, lot « tau » : « verifie ton outil sur des cas dont tu connais la reponse ») =====
   1. Des journaux FABRIQUES dont on connait la reponse (une selection imitee : μ 20, λ 6, 12 graines, hasard 3,26 par course, effets de graine,
      renvoi des plus bas, enfants nes de parents tires) : τ = 1 doit etre retrouve et reconnu ; τ = 0 ne doit jamais faire crier victoire ;
      τ = 0,9 (le cas du piege d'effets/ : la methode naive y trouvait 0,62) doit etre retrouve sans biais en moyenne sur 12 mondes ;
      les deux pieges trouves en route se voient (sans centrage sur la generation ; reference « tous les pilotes »).
   2. Jamais de conclusion avant le nombre requis (191 enfants a 12 graines et λ = 6 : les 160 de la synthese, plus un enfant par generation
      perdu au centrage) ; la formule redonne la table de la synthese.
   3. Les courses pour rien (M4) : des clones fabriques sont comptes exactement, en nombre et en temps.
   4. Il ne leve jamais : dossier absent, vide, population.json tronque, ligne illisible au milieu, epoque neuve, etats d'essai a 3 graines,
      etat d'exemple ecrit par l'ancien code (tests/etat-exemple) et tous les etats de essais/ (ecrits par le code d'avant ce lot) : « trop tot ».
   5. La ligne de commande : --etat, --json, code 0 meme sur un dossier absent.
   Aucune course n'est jouee. Les journaux fabriques vont dans essais/tau/ (efface au depart).
   node ml/evolution/tests/mesure-tau.test.js -> code 0 si tout passe, 1 sinon (~30 s). */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const EV=path.join(__dirname,'..');
const M=require(path.join(EV,'mesure-tau.js'));
const BAC=path.join(EV,'essais','tau');

let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom+(detail!=null?'  ('+detail+')':''));else{echecs++;console.log('ECHEC  '+nom+(detail!=null?'\n       '+String(detail).split('\n').join('\n       '):''));}}
function essai(nom,f){try{f();}catch(e){total++;echecs++;console.log('ECHEC  '+nom+' : a leve\n       '+(e&&e.stack||e));}}

/* ===== LE MONDE FABRIQUE =====
   Chaque pilote a un niveau vrai : le temoin 0, chaque autre N(0, τ) tire a sa naissance (τ est donc exactement l'ecart vrai entre enfants).
   Une course : round(10 + niveau + b_graine + N(0, σ)), b_graine ~ N(0, 1,5). Tous les vivants jouent les 12 graines neuves de la generation.
   Renvoi en fin de generation : parmi les nes avant G (hors temoin), les plus bas en palier moyen, jusqu'a μ vivants (comme evoluer.js).
   o.clones : part des courses d'un enfant « mutation » rendues identiques a celles de son parent (meme empreinte, meme palier).
   Les lignes ont les champs que lit la mesure (INTERFACES § 3.3) ; les journaux, ceux de § 3.4 a 3.7. */
function fabriquer(dossier,o){
  o=Object.assign({tau:0,sigma:3.26,generations:40,mu:20,lambda:6,graines:12,graine:1,clones:0,ecrire:true},o);
  const R=M.mulberry32(o.graine);
  const nor=()=>{const u=R()+1e-12,v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
  const hex=()=>{let s='';for(let i=0;i<12;i++)s+='0123456789abcdef'[Math.floor(R()*16)];return s;};
  const EP='e00000000001';
  let compteur=0;const nouvelId=()=>'p'+String(++compteur).padStart(11,'0');
  const niveau=new Map(),info=new Map();
  const temoin=nouvelId();niveau.set(temoin,0);info.set(temoin,{id:temoin,ne:0,origine:'temoin',parents:[]});
  let vivants=[temoin];
  for(let i=1;i<o.mu;i++){const id=nouvelId();niveau.set(id,o.tau*nor());info.set(id,{id,ne:0,origine:'g0',parents:[temoin]});vivants.push(id);}
  const courses=[],gens=[],morts=[];let graineSuivante=910000,clonesFaits=0,clonesMs=0;
  const parCle=new Map(),somme=new Map(),nb=new Map();
  for(let G=0;G<o.generations;G++){
    const naissances=[];
    if(G>=1){
      for(let k=0;k<o.lambda;k++){
        const id=nouvelId(),origine=k===0?'immigre':(R()<0.3?'croisement':'mutation');
        const p1=vivants[Math.floor(R()*vivants.length)],p2=vivants[Math.floor(R()*vivants.length)];
        const parents=origine==='croisement'?[p1,p2]:[origine==='immigre'?temoin:p1];
        niveau.set(id,o.tau*nor());info.set(id,{id,ne:G,origine,parents});vivants.push(id);
        naissances.push({id,parents,origine,mutes:['marge']});}}
    const graines=[];for(let i=0;i<o.graines;i++){graines.push(graineSuivante);graineSuivante+=37;}
    const b=new Map(graines.map(g=>[g,1.5*nor()]));
    for(const g of graines)for(const id of vivants){
      const x=info.get(id);let palier=Math.max(0,Math.round(10+niveau.get(id)+b.get(g)+o.sigma*nor())),empreinte=hex();
      const ms=Math.round(30000+R()*120000);
      if(o.clones>0&&x.origine==='mutation'&&R()<o.clones){const q=parCle.get(x.parents[0]+'|'+g);
        if(q){palier=q.palier;empreinte=q.empreinte;clonesFaits++;clonesMs+=ms;}}
      const l={cle:id+'|'+g,pilote:id+'0'.repeat(28),id,usage:'entrainement',generation:G,epoque:EP,essai:1,mesuree:true,raison:null,
        graine:g,tmax:900,palier,survie_s:100,cause:'roche',empreinte,ms};
      courses.push(l);parCle.set(id+'|'+g,l);somme.set(id,(somme.get(id)||0)+palier);nb.set(id,(nb.get(id)||0)+1);}
    /* une ligne non mesuree de temps en temps (elle ne doit pas compter) */
    courses.push({id:vivants[1],usage:'entrainement',generation:G,epoque:EP,mesuree:false,raison:'chien de garde',graine:graines[0],tmax:900,palier:null,ms:1000});
    const morts_G=[];
    const elig=vivants.filter(id=>id!==temoin&&info.get(id).ne<G).sort((a,b)=>somme.get(a)/nb.get(a)-somme.get(b)/nb.get(b));
    const aVirer=Math.max(0,Math.min(elig.length,vivants.length-o.mu));
    for(const id of elig.slice(0,aVirer)){const x=info.get(id);morts.push({id,genome:{v:2},parents:x.parents,origine:x.origine,ne:x.ne,mort:G,raison:'renvoi',n:nb.get(id),epoque:EP});
      morts_G.push({id,raison:'renvoi'});}
    const vir=new Set(elig.slice(0,aVirer));vivants=vivants.filter(id=>!vir.has(id));
    gens.push({generation:G,date:'2026-11-28T00:00:00.000Z',epoque:EP,phase:G<o.generations/2?'A':'B',nGraines:o.graines,graines,naissances:G===0?[...info.values()].map(x=>({id:x.id,parents:x.parents,origine:x.origine,mutes:[]})):naissances,morts:morts_G});}
  const pop={format:'evolution-population-1',generation:o.generations-1,etape:'fin',phase:'A',epoque:{courses:EP,note:'n00000000001',depuis:0},
    nGraines:o.graines,grainesRetirees:[],temoin,champion:{id:temoin},vivants:vivants.map(id=>Object.assign({genome:{v:2}},info.get(id)))};
  if(o.ecrire){
    fs.rmSync(dossier,{recursive:true,force:true});fs.mkdirSync(dossier,{recursive:true});
    const jl=A=>A.map(x=>JSON.stringify(x)).join('\n')+(A.length?'\n':'');
    fs.writeFileSync(path.join(dossier,'courses-2026-48.jsonl'),jl(courses));
    fs.writeFileSync(path.join(dossier,'generations.jsonl'),jl(gens));
    fs.writeFileSync(path.join(dossier,'morts.jsonl'),jl(morts));
    fs.writeFileSync(path.join(dossier,'population.json'),JSON.stringify(pop)+'\n');
    for(const f of ['validations.jsonl','coffre.jsonl'])fs.writeFileSync(path.join(dossier,f),'');}
  return {courses,generations:gens,morts,population:pop,defauts:[],clonesFaits,clonesMs,niveau,info};}

fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});
const t0=Date.now();

/* 1. LES ENFANTS REQUIS : la table de la synthese (synthese/sorties/taille-de-la-mesure.txt, s = 3,26) */
essai('enfants requis',()=>{
  const T=[[0.5,12,160],[0.7,12,60],[0.3,12,921],[1,12,26],[0.5,8,311],[0.7,8,106],[0.5,24,58]];
  for(const [tau,n,m] of T)ok(`requis τ ${tau}, ${n} graines par moitie = ${m}`,M.enfantsRequis(tau,n,n,3.26)===m,M.enfantsRequis(tau,n,n,3.26));
  ok('r attendu τ 1, 12 graines = 0,530 (le controle de la synthese)',Math.abs(M.rAttendu(1,12,12,3.26)-0.530)<0.001,M.rAttendu(1,12,12,3.26).toFixed(3));
  ok('3 graines par moitie (config-essai) : bien plus de 160',M.enfantsRequis(0.5,3,3,3.26)>1000,M.enfantsRequis(0.5,3,3,3.26));});

/* 2. τ = 1 : retrouve et reconnu (40 generations, 234 enfants mesures, au-dela des 160) */
essai('tau 1',()=>{
  const d=path.join(BAC,'tau1');fabriquer(d,{tau:1,graine:11});
  const x=M.mesurer(d,{tirages:400});
  ok('τ = 1 : enfants mesures au-dela des requis',x.enfants.mesures>=x.enfants.requis,x.enfants.mesures+' / '+x.enfants.requis);
  ok('τ = 1 : verdict « comptent »',x.verdict==='comptent',x.verdict+' ; r '+x.r);
  ok('τ = 1 : estimation entre 0,6 et 1,4',x.tau>0.6&&x.tau<1.4,x.tau&&x.tau.toFixed(3));
  ok('τ = 1 : l\'intervalle couvre 1 et exclut 0',x.icTau&&x.icTau[0]<=1&&x.icTau[1]>=1&&x.icTau[0]>0,JSON.stringify(x.icTau));
  ok('τ = 1 : la phrase le dit',/^les mutations comptent/.test(x.phrase),x.phrase);
  ok('τ = 1 : r proche de l\'attendu 0,53',Math.abs(x.r-0.53)<0.15,x.r.toFixed(3));
  ok('τ = 1 : enfants requis 191 (160 de la synthese, plus un par generation perdu au centrage)',x.enfants.requis>=188&&x.enfants.requis<=194,x.enfants.requis);
  ok('τ = 1 : la version sans centrage est rendue a cote',x.sansCentrage&&x.sansCentrage.tau>0.5,x.sansCentrage&&x.sansCentrage.tau);
  ok('τ = 1 : par origine (mutation, croisement, immigre)',['mutation','croisement','immigre'].every(k=>x.parOrigine[k]&&x.parOrigine[k].enfants>0),JSON.stringify(Object.keys(x.parOrigine)));
  ok('τ = 1 : par phase (A, B)',x.parPhase.A&&x.parPhase.B&&x.parPhase.A.assez,JSON.stringify(Object.keys(x.parPhase)));
  ok('τ = 1 : aucune course pour rien (pas de clone fabrique)',x.clones.identiques===0,x.clones.identiques);});

/* 3. τ = 0 : jamais de victoire */
essai('tau 0',()=>{
  const d=path.join(BAC,'tau0');fabriquer(d,{tau:0,graine:12});
  const x=M.mesurer(d,{tirages:400});
  ok('τ = 0 : verdict « ne semblent pas compter » (au-dela des requis)',x.verdict==='ne-comptent-pas',x.verdict+' ; r '+x.r+' ; '+x.enfants.mesures+' enfants');
  ok('τ = 0 : l\'intervalle de τ part de 0',x.icTau&&x.icTau[0]===0,JSON.stringify(x.icTau));
  ok('τ = 0 : estimation sous 0,5',x.tau<0.5,x.tau);
  ok('τ = 0 : la phrase le dit',/^les mutations ne semblent pas compter/.test(x.phrase),x.phrase);
  /* faux cris de victoire sur 30 mondes neufs a τ = 0 (attendu 2,5 % : test unilateral a 1,96) */
  let faux=0,fauxSans=0,rs=0,rsSans=0;
  for(let k=0;k<30;k++){const D=fabriquer(null,{tau:0,graine:1000+k,ecrire:false}),y=M.analyser(D,{tirages:0});
    if(y.verdict==='comptent')faux++;rs+=y.r;rsSans+=y.sansCentrage.r;
    const ddl=y.sansCentrage.enfants-3;if(y.sansCentrage.r>Math.tanh(1.96/Math.sqrt(ddl)))fauxSans++;}
  ok('τ = 0 : au plus 3 « comptent » sur 30 mondes',faux<=3,faux+' / 30 ; r moyen '+(rs/30).toFixed(3));
  /* le second piege, montre : sans centrer sur la generation, la derive du modele fait crier victoire (on ne s'en sert pas pour decider) */
  ok('τ = 0 : sans centrage, le piege se voit (r moyen > 0,04, au moins 4 « victoires » de plus)',rsSans/30>0.04&&fauxSans>=faux+4,'r moyen '+(rsSans/30).toFixed(3)+', '+fauxSans+' / 30');
  /* la reference « tous les pilotes » (b_g sans l'enfant) : biaisee vers zero, d'ou la reference des pilotes etablis */
  let ecart=0;for(let k=0;k<10;k++){const D=fabriquer(null,{tau:0.9,graine:3000+k,ecrire:false});ecart+=M.analyser(D,{tirages:0}).tau2-M.analyser(D,{tirages:0,reference:'tous'}).tau2;}
  ok('la reference « tous » sort τ² plus bas que celle des etablis (en moyenne sur 10 mondes)',ecart/10>0.01,(ecart/10).toFixed(3));});

/* 4. τ = 0,9 : le piege d'effets/ (0,62 trouve pour 0,9 vrai) ; moyenne de τ² sur 12 mondes */
essai('tau 0.9',()=>{
  const v=[];for(let k=0;k<12;k++){const D=fabriquer(null,{tau:0.9,graine:2000+k,ecrire:false});v.push(M.analyser(D,{tirages:0}).tau2);}
  const m=v.reduce((a,b)=>a+b,0)/v.length,se=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1)/v.length);
  ok('τ = 0,9 : τ² moyen 0,81 a 2,5 erreurs-types pres',Math.abs(m-0.81)<2.5*se+0.05,'τ² moyen '+m.toFixed(3)+' ± '+se.toFixed(3)+' -> τ '+Math.sqrt(Math.max(0,m)).toFixed(3));});

/* 5. JAMAIS DE CONCLUSION AVANT LE NOMBRE REQUIS : τ = 1 franc, mais 10 generations (54 enfants) */
essai('trop tot',()=>{
  const d=path.join(BAC,'court');fabriquer(d,{tau:1.5,generations:10,graine:13});
  /* sigma 3,26 impose : sinon le nombre requis suit le hasard mesure dans ce petit monde (3,1 a 3,3) */
  const x=M.mesurer(d,{tirages:200,sigma:3.26});
  ok('10 generations : « trop tot » meme a τ = 1,5',x.verdict==='trop-tot',x.verdict+' ; r '+x.r+' (significatif : '+x.significatif+')');
  ok('la phrase dit « 67 enfants mesures sur 191 » (19 g0 + 8 × 6 nes : ceux de la derniere generation n\'ont pas de seconde moitie)',
    x.phrase==='trop tôt pour le dire (67 enfants mesurés sur 191)',x.phrase);
  ok('l\'estimation est quand meme rendue (r, τ, intervalle)',x.r!=null&&x.tau!=null&&x.icTau!=null);});

/* 6. M4 : LES CLONES FABRIQUES SONT COMPTES EXACTEMENT */
essai('clones',()=>{
  const d=path.join(BAC,'clones');const W=fabriquer(d,{tau:0.5,generations:12,graine:14,clones:0.4});
  const x=M.mesurer(d,{tirages:0});
  ok('clones fabriques > 0',W.clonesFaits>0,W.clonesFaits);
  ok('M4 : toutes les courses identiques au parent comptees',x.clones.identiques===W.clonesFaits,x.clones.identiques+' / '+W.clonesFaits);
  ok('M4 : leur temps aussi',Math.abs(x.clones.heuresIdentiques-W.clonesMs/3.6e6)<1e-9,x.clones.heuresIdentiques.toFixed(4)+' h');
  ok('M4 : rangees chez les « mutation » seulement',x.clones.parOrigine.mutation.identiques===W.clonesFaits&&!(x.clones.parOrigine.croisement||{}).identiques);
  ok('M4 : part du temps d\'entrainement entre 0 et 1',x.clones.partTempsEntrainement>0&&x.clones.partTempsEntrainement<1,x.clones.partTempsEntrainement);
  ok('M4 : la ligne le dit',M.lignes(x).some(l=>/^courses pour rien/.test(l)));});

/* 7. IL NE LEVE JAMAIS */
function sansErreur(nom,dossier,o){
  let x=null,err=null;try{x=M.mesurer(dossier,Object.assign({tirages:100},o||{}));}catch(e){err=e;}
  ok(nom+' : ne leve pas',!err,err&&err.message);
  if(x){ok(nom+' : rend un verdict et une phrase',typeof x.verdict==='string'&&typeof x.phrase==='string'&&x.phrase.length>0,x.phrase);
    let t='';try{t=M.lignes(x).join('\n')+M.ligneCourte(x);}catch(e){t='LEVE '+e.message;}
    ok(nom+' : le texte s\'ecrit sans NaN ni undefined',!/NaN|undefined|LEVE/.test(t),t.split('\n')[0]);}
  return x;}
essai('robustesse',()=>{
  const x0=sansErreur('dossier absent',path.join(BAC,'absent'));ok('dossier absent : « trop tot »',x0.verdict==='trop-tot');
  const vide=path.join(BAC,'vide');fs.mkdirSync(vide,{recursive:true});
  const x1=sansErreur('dossier vide',vide);ok('dossier vide : « trop tot (0 enfant mesure sur 191) »',x1.phrase==='trop tôt pour le dire (0 enfant mesuré sur 191)',x1.phrase);
  /* une epoque neuve : la population vient de naitre, aucune course */
  const neuf=path.join(BAC,'neuf');fs.mkdirSync(neuf,{recursive:true});
  fs.writeFileSync(path.join(neuf,'population.json'),JSON.stringify({format:'evolution-population-1',generation:0,etape:'courses',epoque:{courses:'abc'},vivants:[{id:'t',ne:0,origine:'temoin',parents:[]}],temoin:'t'}));
  fs.writeFileSync(path.join(neuf,'generations.jsonl'),'');
  ok('epoque neuve : « trop tot »',sansErreur('epoque neuve',neuf).verdict==='trop-tot');
  /* tronque : population.json coupe, une ligne illisible AU MILIEU de courses et de morts, une derniere ligne coupee */
  const tr=path.join(BAC,'tronque');fabriquer(tr,{tau:1,generations:8,graine:15});
  const pj=fs.readFileSync(path.join(tr,'population.json'),'utf8');fs.writeFileSync(path.join(tr,'population.json'),pj.slice(0,pj.length>>1));
  for(const f of ['courses-2026-48.jsonl','morts.jsonl','generations.jsonl']){const L=fs.readFileSync(path.join(tr,f),'utf8').split('\n');
    L.splice(Math.floor(L.length/2),0,'{"id":"coupe au mil');fs.writeFileSync(path.join(tr,f),L.join('\n').replace(/\n$/,'').slice(0,-7));}
  const x2=sansErreur('fichiers tronques',tr);
  ok('fichiers tronques : « trop tot », et les defauts sont dits',x2.verdict==='trop-tot'&&x2.defauts.length>=3,x2.defauts.join(' | '));
  ok('fichiers tronques : les enfants restent comptes (les generations et les morts suppleent population.json)',x2.enfants.mesures>20,x2.enfants.mesures);
  /* un fichier qui n'est pas du JSON du tout, et un JSON qui n'est pas un objet */
  const bz=path.join(BAC,'bizarre');fs.mkdirSync(bz,{recursive:true});
  fs.writeFileSync(path.join(bz,'courses-2026-48.jsonl'),'null\n42\n"texte"\n[1,2]\n{"usage":"entrainement","mesuree":true,"palier":"7","graine":1,"id":3,"epoque":5}\n');
  fs.writeFileSync(path.join(bz,'population.json'),'[]');fs.writeFileSync(path.join(bz,'generations.jsonl'),'{"generation":"x","naissances":"non"}\n');
  fs.writeFileSync(path.join(bz,'morts.jsonl'),'{"id":null}\n');
  ok('journaux bizarres : « trop tot »',sansErreur('journaux bizarres',bz).verdict==='trop-tot');
  /* une analyse qui leverait (note.js remplace par un faux qui leve) : mesurer rend quand meme « trop tot » */
  const tau1=path.join(BAC,'tau1');let x3=null,err=null;
  try{x3=M.mesurer(tau1,{tirages:0,note:{ajuster(){throw new Error('panne simulee');}}});}catch(e){err=e;}
  ok('une panne dans l\'analyse : ne leve pas, « trop tot », la panne est dite',!err&&x3.verdict==='trop-tot'&&x3.defauts.some(d=>/panne simulee/.test(d)),err?err.message:x3.defauts.join(' | '));});

/* 8. LES ETATS ECRITS PAR L'ANCIEN CODE (avant ce lot ; genome v:1 et v:2 ; a 3 graines pour les essais) */
essai('anciens etats',()=>{
  const ex=path.join(__dirname,'etat-exemple');
  ok('l\'etat d\'exemple existe',fs.existsSync(path.join(ex,'population.json')));
  const x=sansErreur('etat d\'exemple (tests/etat-exemple)',ex);
  ok('etat d\'exemple : « trop tot »',x.verdict==='trop-tot',x.phrase);
  /* tous les dossiers d'etat de essais/ (hors ce bac) : ceux qui ont un population.json ou un generations.jsonl */
  const etats=[];const fouiller=(d,prof)=>{let n=[];try{n=fs.readdirSync(d,{withFileTypes:true});}catch(e){return;}
    if(n.some(e=>e.isFile()&&(e.name==='population.json'||e.name==='generations.jsonl')))etats.push(d);
    if(prof<5)for(const e of n)if(e.isDirectory()&&e.name!=='tau'&&e.name!=='pilotes')fouiller(path.join(d,e.name),prof+1);};
  fouiller(path.join(EV,'essais'),0);
  ok('des etats d\'essai trouves',etats.length>=5,etats.length+' etats');
  let leve=0,pasTropTot=[];const t=Date.now();
  for(const d of etats){let r=null;try{r=M.mesurer(d,{tirages:50,nNominal:3});}catch(e){leve++;continue;}if(r.verdict!=='trop-tot')pasTropTot.push(path.relative(EV,d));}
  ok('aucun etat d\'essai ne fait lever ('+etats.length+' etats, '+((Date.now()-t)/1000).toFixed(1)+' s)',leve===0,leve);
  ok('tous les etats d\'essai rendent « trop tot »',pasTropTot.length===0,pasTropTot.join(', '));});

/* 8 bis. (28/11/2026, le relecteur) UN MONDE SANS HASARD ne fait pas baisser le nombre requis sous celui de la synthese (le faux pilote des tests
   de generation.test.js joue des paliers sans hasard : l'outil concluait « comptent » sur 7 enfants) ; un enfant renvoye des sa generation
   de naissance est signale (τ trop bas). */
essai('relecture',()=>{
  const D=fabriquer(null,{tau:1,sigma:0,generations:6,graine:16,ecrire:false});
  const x=M.analyser(D,{tirages:0});
  ok('sans hasard (σ mesure ~0) : « trop tot », requis au moins 191',x.verdict==='trop-tot'&&x.enfants.requis>=191&&x.enfants.sigma<0.5,
    x.verdict+' ; '+x.enfants.mesures+' / '+x.enfants.requis+' ; σ '+x.enfants.sigma);
  const D2=fabriquer(null,{tau:0.5,generations:6,graine:17,ecrire:false});
  const n=D2.generations[3].naissances[1];D2.morts.push({id:n.id,parents:n.parents,origine:n.origine,ne:3,mort:3,raison:'renvoi'});
  const y=M.analyser(D2,{tirages:0}),y2=M.analyser(D2,{tirages:0});
  ok('un enfant renvoye a sa naissance : compte et dit',y.enfants.renvoyesAvantSecondeMoitie===1&&y.defauts.some(d=>/avant leur seconde moitie/.test(d)),JSON.stringify(y.defauts));
  ok('analyser ne modifie pas les journaux qu\'on lui passe (deux appels, un seul avis)',y2.defauts.length===y.defauts.length&&D2.defauts.length===0,y2.defauts.length);});

/* 9. LA LIGNE DE COMMANDE */
essai('ligne de commande',()=>{
  const lancer=a=>cp.spawnSync(process.execPath,[path.join(EV,'mesure-tau.js')].concat(a),{encoding:'utf8'});
  const r1=lancer(['--etat',path.join(BAC,'tau1'),'--tirages','100']);
  ok('--etat : code 0',r1.status===0,r1.stderr);
  ok('--etat : la premiere ligne de mesure porte la phrase',/LES MUTATIONS COMPTENT-ELLES \? les mutations comptent/.test(r1.stdout),r1.stdout.split('\n')[1]);
  const r2=lancer(['--etat',path.join(BAC,'tau0'),'--json','--tirages','50']);
  let j=null;try{j=JSON.parse(r2.stdout);}catch(e){}
  ok('--json : du JSON au format evolution-mesure-tau-1',r2.status===0&&j&&j.format==='evolution-mesure-tau-1'&&j.verdict==='ne-comptent-pas',j&&j.verdict);
  const r3=lancer(['--etat',path.join(BAC,'nulle-part')]);
  ok('dossier absent : code 0 et « trop tot »',r3.status===0&&/trop tôt pour le dire/.test(r3.stdout),r3.stdout+r3.stderr);
  const r4=lancer(['--config','config-essai.json','--etat',path.join(BAC,'vide')]);
  ok('--config config-essai.json : code 0, requis compte a 3 graines',r4.status===0&&/requis pour voir τ = 0,5 : (\d{4,})/.test(r4.stdout),r4.stdout.split('\n')[2]);});

console.log(`\n${total-echecs} / ${total} passes, ${echecs} echec(s) (${((Date.now()-t0)/1000).toFixed(1)} s)`);
process.exit(echecs?1:0);
