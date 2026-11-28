#!/usr/bin/env node
/* ===== LES GREFFES, SANS AUCUNE COURSE (28/11/2026, greffes ; notes/greffes.md) =====
   usage : node ml/evolution/tests/greffes.test.js   (code 0 si tout passe ; quelques secondes ; AUCUNE course jouee)
   Les fichiers de travail vont dans $GREFFES_TMP (sinon le dossier temporaire du systeme), jamais dans ml/evolution/etat.
     V  la validation de config "greffes" : absente / null / [] -> aucune greffe ; gene inconnu, reel, tete, valeur hors bornes ou non entiere,
        objet vide, liste qui n'en est pas une, gene fige (simule : une copie de BORNES ou bordOn porte fige:true) -> refus en francais ;
        principal (la ligne de commande) refuse une config mal ecrite avec le code 1, avant toute course.
     Y  le cycle : le rang pour G = 1..12 avec n = 0, 1, 4 ensembles et immigres = 1 et 2 (table ecrite a la main).
     A  l'application : le champion n'est pas modifie ; les valeurs sont forcees ; l'identifiant change ; le genome reste valide.
     N  naissances() avec greffes : l'enfant greffe = le champion + les genes forces, rien d'autre ; aucun tirage consomme (les autres enfants et
        l'etat du generateur sont ceux d'une generation sans immigre) ; greffe:{...} dans vivants et naissancesGeneration ; journal et evenement ;
        mutes = les genes greffes ; voie de repli (champion qui porte deja les valeurs ; enfant deja vu) : valeurs tenues, identifiant neuf.
     R  la non-regression : avec "greffes" absente, null ou [], naissances() (et generation0) font EXACTEMENT ce que faisait evoluer.js du commit
        46842ee77 (lu par git show, charge comme module de reference) : meme population.json, memes journaux, memes evenements, meme generateur,
        sur 6 generations enchainees, avec immigres = 1 et 2. */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const EV=path.join(__dirname,'..');
const C=require('../commun'),Gn=require('../genome'),Gf=require('../greffes'),N=require('../note'),E=require('../evoluer');

const REFERENCE='46842ee77';
const TMP=path.join(process.env.GREFFES_TMP||path.join(os.tmpdir(),'cashcar-greffes-test'),'t'+process.pid);
fs.mkdirSync(TMP,{recursive:true});
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail!=null?'\n       '+String(detail).slice(0,600):''));}}
function essai(nom,f){try{f();}catch(e){total++;echecs++;console.log('ECHEC  '+nom+' : a leve\n       '+(e&&e.stack||e));}}
function leve(f){try{f();return null;}catch(e){return String(e&&e.message||e);}}
const json=x=>JSON.stringify(x);

/* ---------- V. LA VALIDATION ---------- */
essai('V',()=>{
  ok('V absente -> []',json(Gf.lireGreffes({}))==='[]');
  ok('V null -> []',json(Gf.lireGreffes({greffes:null}))==='[]');
  ok('V [] -> []',json(Gf.lireGreffes({greffes:[]}))==='[]');
  const bon=[{bordOn:1},{slalomOn:1},{bordOn:1,slalomOn:1},{bordOn:1,suitOn:1,fuirVite:1},{dessousDecor:2,figMax:0}];
  const lu=Gf.lireGreffes({greffes:bon});
  ok('V une liste correcte est lue telle quelle',json(lu)===json(bon),json(lu));
  const refus=[
    ['liste qui n\'en est pas une',{bordOn:1},/doit etre une liste/],
    ['gene inconnu',[{volantMagique:1}],/gene inconnu « volantMagique »/],
    ['__proto__ (gene inconnu)',JSON.parse('[{"__proto__":1}]'),/gene inconnu « __proto__ »/],
    ['reel',[{bordNitro:1}],/bordNitro.*reel/],
    ['tete',[{WV:1}],/tete de neurones/],
    ['valeur hors bornes (drapeau 2)',[{bordOn:2}],/vaut 2, hors de \[0 ; 1\]/],
    ['valeur hors bornes (choix 3)',[{dessousDecor:3}],/hors de \[0 ; 2\]/],
    ['valeur hors bornes (entier -1)',[{figMax:-1}],/hors de \[0 ; 5\]/],
    ['valeur non entiere',[{figMax:1.5}],/doit valoir un entier/],
    ['valeur texte',[{bordOn:'1'}],/doit valoir un entier/],
    ['objet vide',[{bordOn:1},{}],/ensemble n° 2 : ensemble vide/],
    ['element qui n\'est pas un objet',[1],/doit etre un objet/],
    ['element liste',[[{bordOn:1}]],/doit etre un objet/]];
  for(const [nom,L,re] of refus){const m=leve(()=>Gf.lireGreffes({greffes:L}));ok('V refus : '+nom,m&&re.test(m)&&/^evoluer : config "greffes"/.test(m),m);}
  const figees=Gn.BORNES.map(b=>b.cle==='bordOn'?Object.assign({},b,{fige:true}):b);
  const m=leve(()=>Gf.lireGreffes({greffes:[{slalomOn:1},{bordOn:1}]},{bornes:figees}));
  ok('V refus : gene fige (simule)',m&&/ensemble n° 2.*« bordOn » est fige/.test(m),m);
  ok('V un gene non fige passe avec les bornes simulees',json(Gf.lireGreffes({greffes:[{slalomOn:1}]},{bornes:figees}))==='[{"slalomOn":1}]');
  ok('V aucun gene de genome.js n\'est fige aujourd\'hui',!Gn.BORNES.some(b=>b.fige===true));
});

/* la ligne de commande : une config mal ecrite -> code 1 et le message, avant toute course (aucun banc, aucun dossier d'etat cree) */
essai('V principal',()=>{
  const etat=path.join(TMP,'etat-refus'),fc=path.join(TMP,'config-refus.json');
  fs.writeFileSync(fc,json({format:'evolution-config-1',greffes:[{bordNitro:1}]}));
  const r=cp.spawnSync(process.execPath,[path.join(EV,'evoluer.js'),'--config',fc,'--etat',etat,'--une-generation'],{encoding:'utf8',timeout:60000});
  ok('V principal : code 1',r.status===1,'code '+r.status+' ; '+(r.stderr||'')+(r.stdout||''));
  ok('V principal : le message dit le defaut',/config "greffes".*bordNitro/.test(r.stderr||''),r.stderr);
  ok('V principal : rien n\'a ete lance (aucun etat cree)',!fs.existsSync(etat));
});

/* ---------- Y. LE CYCLE ---------- */
essai('Y',()=>{
  /* la table a la main : pour chaque (n, immigres), les rangs de G = 1..12 ; avec 2 immigres, [k=0, k=1] */
  const att={
    '0|1':[0,0,0,0,0,0,0,0,0,0,0,0],
    '1|1':[0,1,0,1,0,1,0,1,0,1,0,1],
    '4|1':[0,1,2,3,4,0,1,2,3,4,0,1],
    '0|2':[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    '1|2':[[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1],[0,1]],
    '4|2':[[0,1],[2,3],[4,0],[1,2],[3,4],[0,1],[2,3],[4,0],[1,2],[3,4],[0,1],[2,3]]};
  for(const n of [0,1,4])for(const im of [1,2]){
    const lu=[];for(let G=1;G<=12;G++){const r=[];for(let k=0;k<im;k++)r.push(Gf.rangCycle(G,k,im,n));lu.push(im===1?r[0]:r);}
    ok('Y rangs n='+n+' immigres='+im,json(lu)===json(att[n+'|'+im]),json(lu));}
  const L=[{bordOn:1},{slalomOn:1},{bordOn:1,slalomOn:1},{bordOn:1,suitOn:1,fuirVite:1}];
  const seq=[];for(let G=1;G<=6;G++){const e=Gf.ensembleDe(L,G,0,1);seq.push(e?Gf.texte(e):'immigre');}
  ok('Y ensembleDe suit le cycle (4 ensembles, 1 immigre)',json(seq)===json(['bordOn=1','slalomOn=1','bordOn=1 + slalomOn=1','bordOn=1 + suitOn=1 + fuirVite=1','immigre','bordOn=1']),json(seq));
  ok('Y ensembleDe : aucune greffe sans liste, ni en generation 0',Gf.ensembleDe([],3,0,1)===null&&Gf.ensembleDe(L,0,0,1)===null);
});

/* ---------- A. L'APPLICATION ---------- */
const cfg0=C.lireConfig();
const T=Gn.genomeTemoin(cfg0);
essai('A',()=>{
  const avant=json(T),set={bordOn:1,slalomOn:1};
  const g=Gf.forcer(T,set);
  ok('A le champion n\'est pas modifie',json(T)===avant);
  ok('A les valeurs sont forcees',g.A.bordOn===1&&g.A.slalomOn===1);
  ok('A tout le reste est celui du champion',Gn.BORNES.every(b=>b.cle in set||g.A[b.cle]===T.A[b.cle])&&json(g.WV)===json(T.WV)&&json(g.WS)===json(T.WS));
  ok('A les tetes et A sont des copies',g.A!==T.A&&g.WV!==T.WV&&g.WS!==T.WS);
  ok('A l\'ordre des genes ne bouge pas',json(Object.keys(g.A))===json(Object.keys(T.A)));
  ok('A l\'identifiant change',Gn.idDe(g)!==Gn.idDe(T),Gn.idDe(g));
  ok('A le genome greffe est valide',Gn.valider(g,cfg0)===null,Gn.valider(g,cfg0));
  ok('A dejaPorte : non pour bordOn=1 chez c0025, oui pour bordOn=0',!Gf.dejaPorte(T,set)&&Gf.dejaPorte(T,{bordOn:0}));
  ok('A forcer refuse un gene que le genome n\'a pas',!!leve(()=>Gf.forcer(T,{inconnu:1})));
});

/* ---------- LE CONTEXTE SANS COURSE ---------- */
/* les lignes de course fabriquees (comme tests/generation.test.js) : la note marche, aucun bot ne roule */
const REF=N.referenceEpoque(),MES={};for(const k of Object.keys(REF))if(REF[k])MES[k]=REF[k].m;
const hsh=s=>{let x=0;for(const c of String(s))x=(x*31+c.charCodeAt(0))>>>0;return x;};
function ligne(id,graine,G){
  const palier=5+hsh(id)%4+(graine%7)-3;
  return {cle:id+'|'+graine,pilote:id,id:id,usage:'entrainement',generation:G,epoque:'essai',essai:1,mesuree:true,raison:null,graine:graine,tmax:900,
    palier:palier,pieces:10,survie_s:20*palier+30,cause:'roche',morts:0,vols:5,pannes:0,pannesEssais:0,erreurs:0,mesures:Object.assign({},MES),yeuxTirages:0};
}
function cfgDe(extra,nom){
  const c=C.lireConfig();delete c.greffes;
  c.dossierEtat=path.join(TMP,nom||'etat');c.dossierChampions=path.join(c.dossierEtat,'champions');
  return Object.assign(c,extra||{});
}
function ctxDe(cfg,pop,lignes,journal){
  const P={pop:path.join(cfg.dossierEtat,'population.json')};fs.mkdirSync(cfg.dossierEtat,{recursive:true});
  return {cfg:cfg,P:P,dossier:cfg.dossierEtat,pop:pop?JSON.parse(json(pop)):null,epoque:{courses:'essai',note:'essai',composants:{}},REF:REF,
    dire:t=>journal.push(t),evenements:[],textes:new Map(),lignes:new Map((lignes||[]).map(l=>[l.cle,l]))};
}
/* une generation de courses fabriquees pour tous les vivants (les graines de la generation) */
function courir(ctx,lignes){
  for(const v of ctx.pop.vivants)for(const gr of ctx.pop.grainesGeneration){const l=ligne(v.id,gr,ctx.pop.generation);
    if(!ctx.lignes.has(l.cle)){ctx.lignes.set(l.cle,l);lignes.push(l);}}
}
/* la population de depart (generation0 du code actuel) et une generation de courses */
function depart(cfg){
  const j=[],ctx=ctxDe(cfg,null,[],j);E.generation0(ctx);const L=[];courir(ctx,L);ctx.pop.etape='fin';
  return {pop:ctx.pop,lignes:L};
}

/* ---------- N. NAISSANCES AVEC GREFFES ---------- */
essai('N',()=>{
  const base=cfgDe({},'etat-n'),D=depart(base);
  /* le champion : un vivant qui n'est pas le temoin */
  const pop0=JSON.parse(json(D.pop));const ch=pop0.vivants[3];pop0.champion={id:ch.id,depuis:0,fichier:null,revalider:false};
  const set={bordOn:1,slalomOn:1};
  const jG=[],cG=ctxDe(cfgDe({greffes:[set]},'etat-n'),pop0,D.lignes,jG);
  const chAvant=json(cG.pop.vivants[3].genome);
  E.naissances(cG,1);
  const enf=cG.pop.vivants[cG.pop.vivants.length-cG.cfg.lambda];
  ok('N l\'enfant 0 est l\'immigre greffe',enf.origine==='immigre'&&json(enf.greffe)===json(set)&&json(enf.parents)===json([ch.id]),json({o:enf.origine,g:enf.greffe,p:enf.parents}));
  ok('N le champion n\'est pas modifie',json(cG.pop.vivants[3].genome)===chAvant);
  ok('N son genome = le champion + les genes forces, rien d\'autre',json(enf.genome)===json(Gf.forcer(ch.genome,set)));
  ok('N mutes = les genes greffes qui different du champion',json(enf.mutes.map(m=>m.cle))===json(['slalomOn','bordOn'].filter(c=>ch.genome.A[c]!==set[c]).sort((a,b)=>Gn.BORNES.findIndex(x=>x.cle===a)-Gn.BORNES.findIndex(x=>x.cle===b))),json(enf.mutes));
  ok('N mutes porte avant et apres',enf.mutes.every(m=>m.avant===ch.genome.A[m.cle]&&m.apres===set[m.cle]));
  const nG=cG.pop.naissancesGeneration[0];
  ok('N naissancesGeneration porte greffe',nG.id===enf.id&&json(nG.greffe)===json(set)&&nG.origine==='immigre'&&json(nG.mutes)===json(enf.mutes.map(m=>m.cle)),json(nG));
  ok('N les autres naissances n\'ont pas de champ greffe',cG.pop.naissancesGeneration.slice(1).every(x=>!('greffe' in x))&&cG.pop.vivants.filter(v=>v.id!==enf.id).every(v=>!('greffe' in v)));
  ok('N le journal dit « greffe bordOn=1 + slalomOn=1 »',jG.some(t=>/^generation 1 : 6 naissance\(s\) \([0-9a-f]+ immigre greffe bordOn=1 \+ slalomOn=1, /.test(t)),jG.join('\n'));
  ok('N l\'evenement dit la greffe',cG.evenements.some(t=>/^greffe bordOn=1 \+ slalomOn=1 : [0-9a-f]+ ne du champion [0-9a-f]+ \(aucune autre mutation\)$/.test(t)),json(cG.evenements));
  /* (28/11/2026, le relecteur) la reprise d'une generation interrompue redit l'evenement depuis naissancesGeneration (generation()) : meme texte */
  ok('N reprise : l\'evenement redit depuis naissancesGeneration est le meme',cG.evenements.includes(E.texteGreffe(nG.greffe,nG.id,nG.parents[0],nG.mutes.some(c=>!(c in nG.greffe)),0)),json(cG.evenements));
  const disque=C.lireJson(cG.P.pop,null);
  ok('N population.json ecrit porte greffe (vivant et naissance)',disque&&disque.vivants.some(v=>v.id===enf.id&&json(v.greffe)===json(set))&&json(disque.naissancesGeneration[0].greffe)===json(set));
  /* aucun tirage : les 5 autres enfants et le generateur sont ceux d'une generation sans immigre (lambda 5) */
  const jS=[],cS=ctxDe(cfgDe({immigres:0,lambda:5},'etat-n'),pop0,D.lignes,jS);E.naissances(cS,1);
  ok('N aucun tirage consomme par la greffe : memes autres enfants',json(cG.pop.naissancesGeneration.slice(1).map(x=>x.id))===json(cS.pop.naissancesGeneration.map(x=>x.id)));
  ok('N aucun tirage consomme par la greffe : meme generateur, memes graines',cG.pop.rng===cS.pop.rng&&json(cG.pop.grainesGeneration)===json(cS.pop.grainesGeneration));
  /* G = 2 avec un seul ensemble : rang 1 = l'immigre ordinaire */
  const j2=[],c2=ctxDe(cfgDe({greffes:[set]},'etat-n'),cG.pop,[...cG.lignes.values()],j2);courir(c2,[]);E.naissances(c2,2);
  ok('N generation 2 (1 ensemble) : l\'immigre ordinaire',c2.pop.naissancesGeneration[0].origine==='immigre'&&!('greffe' in c2.pop.naissancesGeneration[0])&&!c2.evenements.some(t=>/^greffe/.test(t)));

  /* la voie de repli 1 : le champion porte deja les valeurs (quatre drapeaux, pour que la mutation en retourne parfois un) */
  const set4={bordOn:1,slalomOn:1,suitOn:1,fuirVite:1};
  let tenues=0,neufs=0,valides=0,mutees=0,essais=0,consomme=0,repris=0,reprisN=0;
  for(let s=0;s<120;s++){
    const p=JSON.parse(json(D.pop));const porteur=Gf.forcer(p.vivants[2].genome,set4);p.vivants[2].genome=porteur;p.vivants[2].id=Gn.idDe(porteur);
    p.dejaVus.push(p.vivants[2].id);p.champion={id:p.vivants[2].id,depuis:0,fichier:null,revalider:false};p.rng=(1000+s*7919)>>>0;
    const L=D.lignes.map(l=>l.id===D.pop.vivants[2].id?Object.assign({},l,{id:p.vivants[2].id,pilote:p.vivants[2].id,cle:p.vivants[2].id+'|'+l.graine}):l);
    const jj=[],c=ctxDe(cfgDe({greffes:[set4],lambda:1},'etat-n'),p,L,jj);E.naissances(c,1);
    const v=c.pop.vivants[c.pop.vivants.length-1];essais++;
    if(Object.keys(set4).every(k=>v.genome.A[k]===set4[k]))tenues++;
    if(v.id!==p.champion.id&&!D.pop.dejaVus.includes(v.id))neufs++;
    if(Gn.valider(JSON.parse(json(v.genome)),cfgDe())===null)valides++;
    if(v.mutes.length>0&&json(v.greffe)===json(set4)&&v.origine==='immigre')mutees++;
    if(c.pop.rng!==p.rng)consomme++;
    if(s===0)ok('N repli : l\'evenement le dit',c.evenements.some(t=>/^greffe bordOn=1 \+ slalomOn=1 \+ suitOn=1 \+ fuirVite=1 : .*portait deja ces valeurs/.test(t)),json(c.evenements));
    {const n=c.pop.naissancesGeneration[0];if(n&&n.greffe&&/portait deja ces valeurs ou l'enfant etait deja vu : plus une mutation ordinaire\)$/.test(c.evenements.find(t=>/^greffe/.test(t))||''))
      repris+=c.evenements.includes(E.texteGreffe(n.greffe,n.id,n.parents[0],n.mutes.some(k=>!(k in n.greffe)),0))?1:0,reprisN++;}}
  ok('N repli : a la reprise, le meme evenement (sans remutation) '+repris+'/'+reprisN,reprisN>0&&repris===reprisN);
  ok('N repli (champion qui porte deja les valeurs) : valeurs tenues '+tenues+'/'+essais,tenues===essais);
  ok('N repli : identifiant neuf '+neufs+'/'+essais,neufs===essais);
  ok('N repli : genome valide '+valides+'/'+essais,valides===essais);
  ok('N repli : une mutation ordinaire a eu lieu (mutes non vide, greffe gardee) '+mutees+'/'+essais,mutees===essais);
  ok('N repli : le generateur a servi '+consomme+'/'+essais,consomme===essais);

  /* la voie de repli 2 : l'enfant greffe est deja dans dejaVus */
  const p=JSON.parse(json(pop0));p.dejaVus.push(Gn.idDe(Gf.forcer(ch.genome,set)));
  const j3=[],c3=ctxDe(cfgDe({greffes:[set]},'etat-n'),p,D.lignes,j3);E.naissances(c3,1);
  const v3=c3.pop.vivants[c3.pop.vivants.length-c3.cfg.lambda];
  ok('N repli (deja vu) : identifiant neuf, valeurs tenues, greffe gardee',v3.id!==Gn.idDe(Gf.forcer(ch.genome,set))&&v3.genome.A.bordOn===1&&v3.genome.A.slalomOn===1&&json(v3.greffe)===json(set)&&v3.origine==='immigre');
  ok('N repli (deja vu) : mutes contient les genes greffes',['bordOn','slalomOn'].filter(c=>ch.genome.A[c]!==1).every(c=>v3.mutes.some(m=>m.cle===c)),json(v3.mutes));
});

/* ---------- R. LA NON-REGRESSION CONTRE LE CODE DE REFERENCE ---------- */
function moduleReference(){
  let src;
  try{src=cp.execFileSync('git',['show',REFERENCE+':ml/evolution/evoluer.js'],{cwd:EV,encoding:'utf8',maxBuffer:64*1024*1024,stdio:['ignore','pipe','pipe']});}
  catch(e){return null;}
  const abs=s=>JSON.stringify(path.join(EV,s));
  src=src.replace(/require\('\.\/([a-z\-]+)'\)/g,(m,n)=>'require('+abs(n)+')').replace(/__dirname/g,JSON.stringify(EV));
  src+='\nmodule.exports.naissances=naissances;module.exports.generation0=generation0;\n';
  const f=path.join(TMP,'evoluer-reference-'+REFERENCE+'.js');fs.writeFileSync(f,src);
  return require(f);
}
essai('R',()=>{
  const R=moduleReference();
  if(!R){ok('R module de reference ('+REFERENCE+') lu par git show',false,'git show a echoue : test impossible ici');return;}
  ok('R module de reference ('+REFERENCE+') lu par git show',typeof R.naissances==='function'&&typeof R.generation0==='function');
  for(const im of [1,2])for(const [nom,extra] of [['absente',{}],['null',{greffes:null}],['[]',{greffes:[]}]]){
    const etiquette='greffes '+nom+', immigres '+im;
    /* generation 0 */
    const cA=cfgDe(Object.assign({immigres:im},extra),'etat-r-a'),cB=cfgDe({immigres:im},'etat-r-b');
    const jA=[],jB=[],xA=ctxDe(cA,null,[],jA),xB=ctxDe(cB,null,[],jB);
    E.generation0(xA);R.generation0(xB);
    let pareil=json(xA.pop)===json(xB.pop)&&json(jA)===json(jB);
    let detail='generation 0';
    /* 6 generations de naissances enchainees, les memes courses fabriquees des deux cotes ; un champion qui change en cours de route */
    const LA=[],LB=[];courir(xA,LA);courir(xB,LB);
    for(let G=1;G<=6&&pareil;G++){
      xA.pop.etape='fin';xB.pop.etape='fin';
      if(G===3){const c=xA.pop.vivants[5].id;xA.pop.champion.id=c;xB.pop.champion.id=c;}
      xA.evenements=[];xB.evenements=[];jA.length=0;jB.length=0;
      E.naissances(xA,G);R.naissances(xB,G);
      const dA=fs.readFileSync(xA.P.pop,'utf8'),dB=fs.readFileSync(xB.P.pop,'utf8');
      pareil=json(xA.pop)===json(xB.pop)&&json(jA)===json(jB)&&json(xA.evenements)===json(xB.evenements)&&dA===dB&&xA.pop.rng===xB.pop.rng;
      if(!pareil)detail='generation '+G+' differe : '+json(jA).slice(0,200)+' / '+json(jB).slice(0,200);
      else detail='6 generations, '+xA.pop.vivants.length+' pilotes nes, generateur '+xA.pop.rng;
      courir(xA,LA);courir(xB,LB);}
    ok('R '+etiquette+' : memes enfants, memes journaux, meme population.json, meme generateur que '+REFERENCE,pareil,detail);}
});

console.log('\n'+(total-echecs)+' / '+total+' controles passent'+(echecs?' ; '+echecs+' ECHEC(S)':''));
try{fs.rmSync(TMP,{recursive:true,force:true});}catch(e){}
process.exit(echecs?1:0);
