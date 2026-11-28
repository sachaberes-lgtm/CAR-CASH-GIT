/* ===== LES TESTS DES GENES V4, SANS COURSE (28/11/2026, lot « genes v4 », premier temps : le genome v:4 et les regles, sans les compteurs) =====
   Contrat : ml/evolution/notes/genes-v4.md § 8.1 (il fait foi). Le code d'avant est EPINGLE par commit (jamais HEAD, qui avance) :
     v:1 e2ea8d2c9, v:2 7f9543955, v:3 ddca156d8 ; pour chacun, genome.js ET modele.js relus par git show, copies dans ml/evolution/essais/genes-v4/<commit>/
     (hors git), et l'ancien pilote est ecrit avec SON modele.js (ecrirePilote(g,{cfg,modele:<ancien texte>})). Un test qui saute est un echec.
   (v1)     la table : 8 genes en fin de BORNES (index 121 a 128), types, bornes, naissances ; 129 genes, 91 reels ; GARDES 12 drapeaux, 33 reels ; seul
            chancePalierMin est fige ; DECLICS = les 25 noms du § 4.2 ; aucun tic('…') de modele.js hors de DECLICS ;
   (v2)     la migration, la chaine complete : 200 mutants de chaque ancien genome.js, et les etats de tests/ (etat-e93ff5cb5, etat-v2-ancien,
            etat-v3-ddca156d8) -> v:4 conformes, valeurs gardees, genes v4 a leur naissance, meme identifiant, memes decisions ; les temoins ;
            un v:3 abime n'est pas migre ;
   (v3)     eteint = au bit pres : le temoin v4, le pilote de ddca156d8 et pilote-voltige.js ; c0101 v4, celui de ddca156d8 et c0101-pilote.js ;
            sur toutes les suites (inventaire, suites de portage.test.js, suites des genes v4) ; aucun ordre ne porte « declic » ;
   (v3 bis) la main : profilSha de c0025, c0101 et des 200 mutants v:3 egal a celui d'avant ; PROFIL sous la balise ; palierMin entier 12 ;
   (v4)     allume = change, et seulement ce qu'il faut : sortieOn, rienOn, loiFidele 1 et 2, secoursOn (et son tableau des places), chancePalierMin ;
   (v6)     le gene fige : muter ne le change jamais (et ne tire rien pour lui), croiser garde celui du premier parent, valider et reparer.
   Les compteurs (v1 dans les deux sens, v5, v5 bis) sont a ecrire par l'agent des compteurs : notes/genes-v4-lot-a.md.
   usage : node ml/evolution/tests/genes-v4.test.js   (code 0 si tout passe ; Node pur, aucun jeu charge) */
'use strict';
const path=require('path'),fs=require('fs'),cp=require('child_process');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const V=require(path.join(__dirname,'vues-genes-v4.js'));
const cfg=C.lireConfig();cfg.temoin='c0025';
const cfg101=Object.assign({},cfg,{temoin:'c0101'});
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}
function test(nom,f){try{const d=f();bilan(nom,true,d);}catch(e){bilan(nom,false,String(e&&e.stack||e));}}
function vrai(x,m){if(!x)throw new Error(m||'faux');}
const copie=V.copie,J=JSON.stringify;
const T=Gn.genomeTemoin(cfg),T101=Gn.genomeTemoin(cfg101);
const PAR=Gn.BORNES.reduce((o,b)=>{o[b.cle]=b;return o;},{});

/* ===== LE CODE D'AVANT, EPINGLE PAR COMMIT ===== */
const COMMITS={v1:'e2ea8d2c9',v2:'7f9543955',v3:'ddca156d8'};
const SIGNE={v1:'if(BORNES.length!==86',v2:'const VERSION=2;',v3:'const VERSION=3;'};
function ancien(cle){
  const commit=COMMITS[cle];
  const lire=f=>cp.execFileSync('git',['show',commit+':ml/evolution/'+f],{cwd:D,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64<<20}).replace(/\r\n/g,'\n');
  const tg=lire('genome.js'),tm=lire('modele.js');
  if(tg.indexOf(SIGNE[cle])<0)throw new Error('le genome.js de '+commit+' n\'est pas celui de '+cle);
  /* garde-fou (§ 8) : l'ancien modele ne connait pas chancePalierMin et porte palierMin:12 en dur */
  if(tm.indexOf('chancePalierMin')>=0||tm.indexOf('palierMin:12}')<0)throw new Error('le modele.js de '+commit+' n\'est pas un modele d\'avant les genes v4');
  const dos=path.join(D,'essais','genes-v4',commit);fs.mkdirSync(dos,{recursive:true});
  C.ecrireAtomique(path.join(dos,'modele.js'),tm);
  const f=path.join(dos,'genome.js');
  C.ecrireAtomique(f,tg.replace("require('./commun')","require('../../../commun')").replace("require('./graines')","require('../../../graines')"));
  delete require.cache[f];
  return {G:require(f),modele:tm,commit};}
const ANC={};let ERREUR_ANC=null;
try{for(const k in COMMITS)ANC[k]=ancien(k);}catch(e){ERREUR_ANC=e;}
function exigerAnciens(){if(ERREUR_ANC)throw new Error('le code d\'avant ne se relit pas dans git (un SAUTE est un echec) : '+(ERREUR_ANC.message||ERREUR_ANC));}

/* ===== LES PILOTES ET LES DECISIONS ===== */
function sansDeclic(o){if(!o||typeof o!=='object'||!('declic' in o))return o;const r=Object.assign({},o);delete r.declic;return r;}
function essai(P,vue){const e0=P.erreurs,o=P.decide(vue);return {o:sansDeclic(o),declic:!!(o&&o.declic),erreur:P.erreurs>e0?P.derniere:null};}
function decisions(P,S){return S.map(s=>{P.neuve();return s.vues.map(v=>essai(P,copie(v)));});}
const sansMarque=R=>R.map(x=>x.map(y=>({o:y.o,erreur:y.erreur})));
const pilote=(g,o)=>charger('evolution.js',{source:Gn.ecrirePilote(g,Object.assign({cfg},o||{}))});
/* l'ancien pilote d'un genome : un v:4 aux genes v4 a leur naissance est d'abord ramene a sa forme v:3 (les 121 premieres cles) */
function versV3(g){if(g.v!==4)return copie(g);for(const b of Gn.GENES_V4)vrai(g.A[b.cle]===b.naissance,'versV3 : '+b.cle+' allume');
  const A={};for(const k of Gn.CLES_V3)A[k]=g.A[k];return {v:3,A,WV:g.WV.slice(),WS:g.WS.slice()};}
const piloteAncien=(A,g)=>charger('evolution.js',{source:A.G.ecrirePilote(versV3(g),{cfg,modele:A.modele})});
function genomeDe(base,poser){const g=copie(base);Object.assign(g.A,poser);Gn.reparer(g,cfg);for(const k in poser)vrai(g.A[k]===poser[k],'reparer a change '+k);return g;}
const SUITES=V.suitesPortage().concat(V.suitesV4());
const QUELQUES=SUITES.filter((s,i)=>i<3||i%11===0);
/* une vue sans les rayons retour<i> ni vue.vol.retours (ce que voit un pilote qui ne demande aucune loi) */
function sansLois(v){const w=copie(v);if(w.vol&&w.vol.radar&&Array.isArray(w.vol.radar.rayons))w.vol.radar.rayons=w.vol.radar.rayons.filter(r=>!(r&&/^retour/.test(r.m)));if(w.vol)delete w.vol.retours;return w;}
const sansRetours=o=>{if(!o)return o;const r=Object.assign({},o);delete r.retours;return r;};
function joue(P,vues){P.neuve();return vues.map(v=>{const x=essai(P,copie(v));vrai(!x.erreur,'erreur du cerveau : '+x.erreur);return x.o;});}

/* ===== (v1) LA TABLE ===== */
test('(v1) 8 genes v4 en fin de BORNES (121 a 128) ; 129 genes, 91 reels ; GARDES 12 drapeaux, 33 reels ; seul chancePalierMin fige ; DECLICS',()=>{
  vrai(Gn.VERSION===4,'version '+Gn.VERSION);vrai(Gn.BORNES.length===129&&Gn.CONTINUS.length===91,Gn.BORNES.length+' genes, '+Gn.CONTINUS.length+' reels');
  const att=[['sortieOn','drapeau',0,1,0,'R'],['sortieT','reel',.3,1.2,.7,'R'],['sortieJauge','reel',.2,1,.5,'R'],['rienOn','drapeau',0,1,0,'R'],['rienEcart','reel',.1,.4,.2,'R'],
    ['loiFidele','choix',0,2,0,'R'],['secoursOn','drapeau',0,1,0,'R'],['chancePalierMin','entier',1,30,12,'profil']];
  vrai(J(Gn.BORNES.slice(121).map(b=>[b.cle,b.type,b.min,b.max,b.naissance,b.ou]))===J(att),'les 8 genes : '+J(Gn.BORNES.slice(121).map(b=>b.cle)));
  vrai(J(Gn.GENES_V4.map(b=>b.cle))===J(Gn.ORDRE_V4)&&J(Gn.ORDRE_V4)===J(att.map(x=>x[0])),'GENES_V4 / ORDRE_V4');
  vrai(Gn.N_V3===121&&J(Gn.CLES_V3)===J(Gn.BORNES.slice(0,121).map(b=>b.cle)),'CLES_V3');
  const n={reel:0,drapeau:0,choix:0,entier:0};for(const b of Gn.BORNES)n[b.type]++;vrai(J(n)===J({reel:91,drapeau:33,choix:2,entier:3}),J(n));
  vrai(Object.keys(Gn.GARDES).length===12&&Object.keys(Gn.GARDE_DE).length===33,'GARDES '+Object.keys(Gn.GARDES).length+' / '+Object.keys(Gn.GARDE_DE).length);
  vrai(J(Gn.GARDES.sortieOn)===J(['sortieT','sortieJauge'])&&J(Gn.GARDES.rienOn)===J(['rienEcart']),'GARDES des genes v4');
  vrai(J(Gn.BORNES.filter(b=>b.fige).map(b=>b.cle))===J(['chancePalierMin']),'fige : '+Gn.BORNES.filter(b=>b.fige).map(b=>b.cle));
  for(const b of Gn.GENES_V4)vrai(T.A[b.cle]===b.naissance&&T101.A[b.cle]===b.naissance,'temoin : '+b.cle);
  const noms=['volRetourOn','retourOn','retourOn.reacteur','volMieux','dessousNitro','lacheOn','slalomOn','coupOn','coupDecor','relacheOn','suitOn','suitOn.ensuite',
    'fuirVite','bordOn','largeOn','libreOn','raccCartes','raccJumeau','sortieOn','sortieOn.vol','sortieOn.pose','rienOn','loiFidele.desaccord','loiFidele.suit','secoursOn'];
  vrai(J(Gn.DECLICS)===J(noms)&&Object.isFrozen(Gn.DECLICS),'DECLICS : '+J(Gn.DECLICS));
  /* le sens « chaque tic du texte est dans DECLICS » (l'autre sens, chaque nom a son tic, est pour l'agent des compteurs) */
  const texte=fs.readFileSync(Gn.MODELE,'utf8'),tics=[...texte.matchAll(/\btic\('([^']*)'\)/g)].map(x=>x[1]);
  for(const t of tics)vrai(Gn.DECLICS.includes(t),'tic hors de DECLICS : '+t);
  /* les reperes laisses a l'agent des compteurs */
  const reperes=(texte.match(/\/\* COMPTEURS : ici/g)||[]).length;vrai(reperes>=25,'reperes /* COMPTEURS : ici */ : '+reperes);
  return '129 genes ; GARDES '+Object.keys(Gn.GARDES).join(', ')+' ; '+tics.length+' tic dans modele.js, '+reperes+' reperes « COMPTEURS : ici »';});

/* ===== (v2) LA MIGRATION, LA CHAINE COMPLETE ===== */
test('(v2) temoins : c0025 19e3767cc346, c0101 f70ddcb5a565, et le meme identifiant par l\'ancien genome.js de chaque version',()=>{
  exigerAnciens();
  vrai(Gn.idDe(T)==='19e3767cc346','c0025 '+Gn.idDe(T));vrai(Gn.idDe(T101)==='f70ddcb5a565','c0101 '+Gn.idDe(T101));
  for(const k in ANC){vrai(ANC[k].G.idDe(ANC[k].G.genomeTemoin(cfg))==='19e3767cc346',k+' : c0025 '+ANC[k].G.idDe(ANC[k].G.genomeTemoin(cfg)));}
  vrai(ANC.v3.G.idDe(ANC.v3.G.genomeTemoin(cfg101))==='f70ddcb5a565','v3 : c0101');
  return 'c0025 et c0101 gardent leur identifiant (v:1 '+COMMITS.v1+', v:2 '+COMMITS.v2+', v:3 '+COMMITS.v3+')';});
const MUTANTS={};
test('(v2) 200 mutants de chaque ancien genome.js (v:1, v:2, v:3) : v:4 conformes, valeurs gardees, genes v4 a leur naissance, meme identifiant, memes decisions',()=>{
  exigerAnciens();const L=[];
  for(const k of ['v1','v2','v3']){
    const A=ANC[k],rng=Gr.mulberry32(20261128+k.charCodeAt(1)),T0=A.G.genomeTemoin(cfg);let g=T0,vues=0;MUTANTS[k]=[];
    for(let i=0;i<200;i++){
      g=A.G.muter(i%7?g:T0,rng,{phase:['A','B','C'][i%3],cfg}).genome;
      const vAvant=g.v,id0=A.G.idDe(g),h=copie(g),cles0=Object.keys(g.A);
      vrai(vAvant===+k.slice(1),k+' mutant '+i+' : v '+vAvant);
      const d=Gn.valider(h,cfg);vrai(d===null,k+' mutant '+i+' refuse : '+d);
      vrai(h.v===4&&J(Object.keys(h.A))===J(Gn.BORNES.map(b=>b.cle)),k+' mutant '+i+' pas migre');
      for(const c of cles0)vrai(h.A[c]===g.A[c],k+' mutant '+i+' : '+c+' change');
      for(const b of Gn.BORNES)if(!cles0.includes(b.cle))vrai(h.A[b.cle]===b.naissance,k+' mutant '+i+' : '+b.cle+' pas a sa naissance');
      vrai(J(h.WV)===J(g.WV)&&J(h.WS)===J(g.WS),k+' mutant '+i+' : tetes');
      vrai(Gn.idDe(h)===id0&&Gn.idDe(g)===id0,k+' mutant '+i+' : identifiant '+id0+' -> '+Gn.idDe(h));
      MUTANTS[k].push({avant:g,migre:h});
      if(i%20===0){const a=decisions(piloteAncien(A,g),QUELQUES),b=decisions(pilote(h),QUELQUES);
        for(let s=0;s<QUELQUES.length;s++)for(let j=0;j<a[s].length;j++){vues++;vrai(J(a[s][j].o)===J(b[s][j].o)&&a[s][j].erreur===b[s][j].erreur,k+' mutant '+i+' / '+QUELQUES[s].nom+' vue '+j);}}}
    L.push(k+' ('+A.commit+') : 200 mutants migres, memes identifiants ; '+vues+' decisions comparees (ancien genome.js + ancien modele.js contre le nouveau)');}
  return L.join('\n');});
test('(v2) les etats de tests/ (etat-e93ff5cb5, etat-v2-ancien, etat-v3-ddca156d8) : chaque vivant et chaque mort migre en v:4 sous son identifiant',()=>{
  const L=[];
  for(const dos of ['etat-e93ff5cb5','etat-v2-ancien','etat-v3-ddca156d8']){
    const p=JSON.parse(fs.readFileSync(path.join(__dirname,dos,'population.json'),'utf8'));let n=0;
    const genomes=p.vivants.map(v=>({id:v.id,g:v.genome}));
    for(const l of C.lireJsonl(path.join(__dirname,dos,'morts.jsonl')))if(l&&l.genome&&l.id)genomes.push({id:l.id,g:l.genome});
    const vs=new Set();
    for(const {id,g} of genomes){vs.add(g.v);const h=copie(g);const d=Gn.valider(h,cfg);vrai(d===null,dos+' '+id+' : '+d);vrai(h.v===4,dos+' '+id+' v '+h.v);
      vrai(Gn.idDe(h)===id&&Gn.idDe(g)===id,dos+' '+id+' : identifiant '+Gn.idDe(h));for(const b of Gn.GENES_V4)vrai(h.A[b.cle]===b.naissance,dos+' '+id+' '+b.cle);n++;}
    vrai(p.temoin==='19e3767cc346',dos+' : temoin '+p.temoin);
    L.push(dos+' : '+n+' genomes v:'+[...vs].join(',')+' -> v:4, memes identifiants');}
  return L.join('\n');});
test('(v2) un genome abime (v:3 a une cle en moins, ou dans le desordre) n\'est pas migre ; un v:4 a 121 genes est refuse',()=>{
  const v3={v:3,A:{},WV:T.WV.slice(),WS:T.WS.slice()};for(const k of Gn.CLES_V3)v3.A[k]=T.A[k];
  const a=copie(v3);delete a.A.marge;vrai(Gn.valider(a,cfg)!==null&&a.v===3,'v:3 abime migre');
  const b=copie(v3);const x=b.A.marge;delete b.A.marge;b.A.marge=x;vrai(Gn.valider(b,cfg)!==null&&b.v===3,'v:3 dans le desordre migre');
  const c=copie(v3);c.v=4;vrai(/121 genes/.test(String(Gn.valider(c,cfg))),'v:4 a 121 genes : '+Gn.valider(c,cfg));
  const ok=copie(v3);vrai(Gn.valider(ok,cfg)===null&&ok.v===4&&Gn.idDe(ok)===Gn.idDe(T),'v:3 conforme');
  vrai(/attendu 4, ou 1 avec ses 86 genes, ou 2 avec ses 107, ou 3 avec ses 121/.test(Gn.valider({v:5,A:{},WV:[],WS:[]},cfg)),'message de valider');
  return 'ok';});

/* ===== (v3) ETEINT = AU BIT PRES ===== */
test('(v3) eteint : le temoin v4 = le pilote de ddca156d8 = pilote-voltige.js ; c0101 v4 = celui de ddca156d8 = c0101-pilote.js ('+SUITES.length+' suites)',()=>{
  exigerAnciens();const L=[];
  for(const [nom,g,c] of [['c0025',T,cfg],['c0101',T101,cfg101]]){
    const fichier=Gn.sourceTemoin(c),F=charger(path.basename(fichier),{source:fs.readFileSync(fichier,'utf8')});
    /* contre ddca156d8 : toutes les vues (un rayon retour<i> non demande leve « YEUX CHANGES » dans les deux) ; contre le fichier ecrit a la main, qui
       n'a pas le controle des rayons : les memes vues sans les rayons retour<i> (sansLois) */
    const SL=SUITES.map(s=>({nom:s.nom,vues:s.vues.map(sansLois)}));
    const a=decisions(pilote(g),SUITES),b=decisions(piloteAncien(ANC.v3,g),SUITES),a2=decisions(pilote(g),SL),f=decisions(F,SL);let n=0,err=0;
    for(let s=0;s<SUITES.length;s++)for(let j=0;j<a[s].length;j++){n++;
      /* (compteurs, 28/11) c0025 ne porte jamais « declic » ; c0101 en porte (bordOn, fuirVite, largeOn, libreOn allumes : § 8.1 v3 « sauf les anciens
         genes allumes ») : ses noms sont verifies par tests/compteurs.test.js, et ses ordres sont compares ici sans le champ */
      if(nom==='c0025')vrai(!a[s][j].declic&&!a2[s][j].declic,nom+' / '+SUITES[s].nom+' vue '+j+' : un ordre porte declic');
      if(a[s][j].erreur)err++;
      vrai(J(a[s][j].o)===J(b[s][j].o)&&a[s][j].erreur===b[s][j].erreur,nom+' / '+SUITES[s].nom+' vue '+j+' : v4 '+J(a[s][j])+'\n ddca156d8 '+J(b[s][j]));
      vrai(!a2[s][j].erreur&&J(a2[s][j].o)===J(f[s][j].o)&&f[s][j].erreur===null,nom+' / '+SUITES[s].nom+' vue '+j+' (sans lois) : v4 '+J(a2[s][j])+'\n fichier '+J(f[s][j]));}
    L.push(nom+' : '+n+' decisions identiques a ddca156d8 (dont '+err+' « YEUX CHANGES » : des rayons retour<i> que ce pilote ne demande pas), et au fichier sur les memes vues sans ces rayons');}
  return L.join('\n');});
test('(v3) eteint : les 200 mutants v:3 (pilote de ddca156d8 contre pilote v4 du genome migre), toutes les suites pour un mutant sur dix',()=>{
  exigerAnciens();vrai(MUTANTS.v3&&MUTANTS.v3.length===200,'(v2) n\'a pas tourne');let n=0;
  for(let i=0;i<200;i++){const {avant,migre}=MUTANTS.v3[i];const S=i%10===0?SUITES:QUELQUES;
    const a=decisions(piloteAncien(ANC.v3,avant),S),b=decisions(pilote(migre),S);
    for(let s=0;s<S.length;s++)for(let j=0;j<a[s].length;j++){n++;vrai(J(a[s][j].o)===J(b[s][j].o)&&a[s][j].erreur===b[s][j].erreur,'mutant '+i+' / '+S[s].nom+' vue '+j);
      vrai(!b[s][j].declic||Gn.BORNES.some(x=>x.naissance===0&&x.type==='drapeau'&&migre.A[x.cle]===1),'mutant '+i+' : declic sans gene allume');}}
  return n+' decisions identiques';});

/* ===== (v3 bis) LA MAIN ===== */
test('(v3 bis) la main : profilSha de c0025, c0101 et des 200 mutants v:3 egal a celui d\'avant ; PROFIL sous la balise ; palierMin entier 12',()=>{
  exigerAnciens();
  const V25=charger('pilote-voltige.js',{source:fs.readFileSync(Gn.VOLTIGE,'utf8')}),V101=charger('c0101-pilote.js',{source:fs.readFileSync(Gn.sourceTemoin(cfg101),'utf8')});
  const t=Gn.ecrirePilote(T,{cfg}),P=charger('evolution.js',{source:t});
  vrai(P.profilSha&&P.profilSha===V25.profilSha,'c0025 : '+P.profilSha+' contre '+V25.profilSha);
  vrai(pilote(T101).profilSha===V101.profilSha,'c0101');
  vrai(P.profil&&P.profil.chance&&P.profil.chance.palierMin===12&&Number.isInteger(P.profil.chance.palierMin),'palierMin '+J(P.profil&&P.profil.chance));
  const L=t.split('\n'),fin=L.indexOf('/*@GENOME@ fin*/'),pr=L.findIndex(l=>l.startsWith('const PROFIL={'));
  vrai(fin>0&&pr>fin,'PROFIL n\'est pas sous la balise ('+pr+' / '+fin+')');
  vrai(L.some(l=>/chance:\{prend:1,palierMin:REGLAGES\.chancePalierMin\}/.test(l)),'PROFIL ne lit pas REGLAGES.chancePalierMin');
  let n=0;for(const {avant,migre} of MUTANTS.v3){vrai(pilote(migre).profilSha===piloteAncien(ANC.v3,avant).profilSha,'mutant '+n);n++;}
  return 'profilSha '+P.profilSha+' ; '+n+' mutants : la meme main';});

/* ===== (v4) ALLUME = CHANGE, ET SEULEMENT CE QU'IL FAUT ===== */
const P0=pilote(T);
/* (28/11/2026, reecrit apres la mesure des decollages : ml/ecurie/etude/sortie-preparee) sortieOn = la nitro au decollage sur les maps a decor, le
   pendant de bordOn : au sol la nitro est gardee, aucun rayon du bord n'est lu, et le vol part comme sans le gene (« vers la route ») */
test('(v4) sortieOn : au bord d\'une map a decor, la nitro gardee au sol, quels que soient les rayons du bord ; le vol ne change pas ; rien sans decor, t > sortieT, jauge basse, dessous, glisse, rebond',()=>{
  const P=pilote(genomeDe(T,{sortieOn:1}));const L=[];
  /* la regle vraie : nitro au sol ; seule la nitro change ; la premiere vue de vol rend l'ordre du temoin (versRoute) */
  const s=[V.solBord(),V.volApres()],a=joue(P0,s),b=joue(P,s);
  vrai(a[0].nitro===false&&b[0].nitro===true,'sol : '+J(a[0])+' / '+J(b[0]));
  vrai(J(Object.assign({},a[0],{nitro:true}))===J(b[0]),'sol : autre chose que la nitro change');
  vrai(J(a[1])===J(b[1]),'vol : la facon change\n temoin '+J(a[1])+'\n sortie '+J(b[1]));
  L.push('grotte : sol '+J(b[0])+' ; vol (comme le temoin) '+J(b[1]));
  /* les rayons du bord ne sont plus lus : plane au choc, sale, dessous, a la levre, rien ou versRoute qui se posent, et pas de rayons du tout */
  const lus=[['plane choc',{plane:'choc'}],['plane sale',{propre:false}],['plane dessous',{dessous:true}],['plane levre',{plane:'levre'}],['rien pose',{rien:'pose'}],
    ['versRoute levre',{versRoute:'levre'}]];
  for(const [nom,o] of lus){const v=[V.solBord(o),V.volApres()],x=joue(P,v),y=joue(P0,v);vrai(x[0].nitro===true&&y[0].nitro===false&&J(x[1])===J(y[1]),'rayons du bord lus : '+nom+' '+J(x));}
  const sansRayons=[V.vueSol(v=>{const w=V.solBord();Object.assign(v,w);v.sorties=null;}),V.volApres()];
  vrai(joue(P,sansRayons)[0].nitro===true&&joue(P0,sansRayons)[0].nitro===false,'sans v.sorties : '+J(joue(P,sansRayons)[0]));
  L.push('nitro gardee quels que soient les rayons : '+lus.map(x=>x[0]).join(', ')+', sans v.sorties');
  /* aucun changement : carte sans decor, t au-dela de sortieT, jauge sous sortieJauge, dessous, glisse, rebond */
  const pareil=[['espace',{carte:'espace'}],['nuages',{carte:'nuages'}],['t 1.3',{t:1.3}],['t .9',{t:.9}],['jauge .3',{jauge:.3}]];
  for(const [nom,o] of pareil){const v=[V.solBord(o),V.volApres({carte:o.carte})];vrai(J(joue(P0,v))===J(joue(P,v)),'change : '+nom);}
  for(const k of ['dessous','glisse','rebond']){const v=[V.vueSol(w=>{Object.assign(w,V.solBord());w[k]=true;}),V.volApres()];vrai(J(joue(P0,v))===J(joue(P,v)),'change : '+k);}
  L.push('inchange : '+pareil.map(x=>x[0]).join(', ')+', dessous, glisse, rebond');
  /* les quatre maps a decor */
  for(const carte of ['canyon','jade','ville'])vrai(joue(P,[V.solBord({carte})])[0].nitro===true,carte);
  /* l'annonce contraire (la regle vraie, puis fausse : t 0,9), puis le decollage : le vol part comme le temoin */
  const ac=[V.solBord(),V.solBord({t0:8.15,t:.9}),V.volApres({t:8.25})],ac0=joue(P0,ac),ac1=joue(P,ac);
  vrai(ac1[0].nitro===true&&J(ac0.slice(1))===J(ac1.slice(1)),'annonce contraire : '+J(ac1));
  /* m.voulu reste faux : viser se pose (et vaut le plus) mais n'est pas pris (pas de cible dans l'ordre) */
  const sv=V.suitesV4().find(x=>x.nom==='sortie puis viser').vues,bv=joue(P,sv);vrai(!('cible' in bv[1])&&bv[0].nitro===true,'viser pris : '+J(bv[1]));
  vrai(J(bv[1])===J(joue(P0,sv)[1]),'sortie puis viser : le vol change');
  /* aucune vue de vol ne change, sur toutes les suites « sortie … » (le gene n'agit qu'au sol) */
  let nv=0;for(const st of V.suitesV4().filter(x=>/^sortie/.test(x.nom))){const x=joue(P,st.vues),y=joue(P0,st.vues);
    st.vues.forEach((w,i)=>{if(w.mode==='vol'){nv++;vrai(J(x[i])===J(y[i]),st.nom+' vue '+i+' (vol) change');}});}
  L.push(nv+' vues de vol des suites « sortie » : toutes comme le temoin');
  return L.join('\n');});
test('(v4) sortieOn et un raccourci engage : la nitro de l\'ordre au sol reste celle d\'aujourd\'hui (ville, deux vues de raccourci puis le bord)',()=>{
  const P=pilote(genomeDe(T,{sortieOn:1}));
  /* deux vues de raccourci a gauche (route qui tient), puis la route lache, le rayon du bord comme plus haut */
  const racc=t=>V.vueSol(v=>{v.carte='ville';v.t=t;v.troncons=[{d:100}];v.tenue={tient:true,approx:true};v.nitro=.9;v.reserve=0;
    v.sorties={pourquoi:'demande',bord:null,droite:null,saut:null,gauche:{t:.6,rayons:[V.pose({m:'versRoute',t:1.5,axe:.2,gain:200,lat:-3,chute:20,air:3})]}};});
  const engage=[racc(8.1),racc(8.2)],a0=joue(P0,engage);
  vrai(a0[1].volant===1&&a0[1].regarder==='sorties','le raccourci ne s\'engage pas : '+J(a0));
  const bord=V.solBord({carte:'ville',t0:8.3,jauge:.9});bord.sorties.gauche={t:.4,rayons:[V.pose({m:'versRoute',t:1.5,axe:.2,gain:200,lat:-3,chute:20,air:3})]};
  const S=engage.concat([bord]),a=joue(P0,S),b=joue(P,S);
  vrai(J(a)===J(b),'raccourci engage : la regle a change l\'ordre\n temoin '+J(a)+'\n sortie '+J(b));
  /* temoin du test : la meme vue du bord sans raccourci engage allume bien la nitro */
  vrai(joue(P,[bord])[0].nitro===true&&joue(P0,[bord])[0].nitro===false,'la vue du bord seule ne declenche pas la regle : '+J(joue(P,[bord])));
  return 'engage : '+J(b[2]);});
/* (28/11/2026, reecrit apres la mesure des decollages) le vol ne part plus en « plane » et le choix du depart n'est plus marque fait : avec retourOn,
   le choix du depart se fait comme sans sortieOn */
test('(v4) sortieOn et retourOn : le choix du depart se fait comme sans sortieOn (le vol n\'est plus marque « choisi » au decollage)',()=>{
  const P=pilote(genomeDe(T,{sortieOn:1,retourOn:1})),P1=pilote(genomeDe(T,{retourOn:1}));
  const v1=V.volApres({f:(v,par)=>{Object.assign(par.plane,{issue:'choc',t:.5,cause:'roche'});}});
  const v2=V.volApres({t:8.3,f:(v,par)=>{v.vol.t=.15;v.vol.radar.rayons.push(V.pose({m:'retour0',t:.9,axe:0,gain:500}));v.vol.retours=[{volant:.77,manche:.5,nitro:true}];}});
  for(const S of [[V.solBord(),v2],[V.solBord(),v1,v2]]){const b=joue(P,S),c=joue(P1,S);
    vrai(b[0].nitro===true&&c[0].nitro===false,'sol : '+J(b[0])+' / '+J(c[0]));
    vrai(J(b.slice(1))===J(c.slice(1)),'vol : sortieOn change le choix du depart\n sortie '+J(b)+'\n retour '+J(c));}
  const c=joue(P1,[V.solBord(),v2]);vrai(c[1].volant===.77,'temoin du test : le choix du depart ne prend pas retour0 : '+J(c));
  return 'vol : '+J(c[1]);});
/* § 3.6 apres l'amendement : avec relacheOn, la nitro gardee au sol par sortieOn compte comme demandee (m.tNitroSol) : elle reste tenue au debut du vol */
test('(v4) sortieOn et relacheOn : la nitro gardee au bord reste tenue au debut du vol (relacheT) ; sans sortieOn, le vol part nitro coupee',()=>{
  const P=pilote(genomeDe(T,{sortieOn:1,relacheOn:1})),P1=pilote(genomeDe(T,{relacheOn:1}));
  const S=[V.solBord(),V.volApres()],b=joue(P,S),c=joue(P1,S);
  vrai(b[0].nitro===true&&c[0].nitro===false,'sol : '+J(b[0])+' / '+J(c[0]));
  vrai(b[1].nitro===true&&c[1].nitro===false&&J(Object.assign({},c[1],{nitro:true}))===J(b[1]),'vol : '+J(b[1])+' / '+J(c[1]));
  return 'vol : '+J(b[1]);});
test('(v4) rienOn : versRoute (axe 0,5) contre rien (axe 0,1) : le volant lache apres tenirFacon et deux vues de suite ; une fois par vol',()=>{
  const P=pilote(genomeDe(T,{rienOn:1})),S=n=>V.suitesV4().find(x=>x.nom===n).vues;const L=[];
  const a=joue(P0,S('rien simple')),b=joue(P,S('rien simple'));
  /* vues a 30,0 ; 30,1 ; … tenirFacon 0,35 : la 1re vue ou ca compte est la 5e (0,4 s), la bascule a la 6e */
  for(let i=0;i<5;i++)vrai(J(a[i])===J(b[i]),'vue '+i+' changee');
  vrai(b[5].volant===0&&b[5].manche===0&&b[5].nitro===false&&a[5].volant!==0,'vue 5 : '+J(a[5])+' / '+J(b[5]));
  L.push('simple : '+J(b.map(x=>x.volant)));
  for(const n of ['rien une seule vue','rien ecart .35','rien dessous'])vrai(J(joue(P0,S(n)))===J(joue(P,S(n))),'change : '+n);
  vrai(J(joue(P0,S('rien axe 0.3')))!==J(joue(P,S('rien axe 0.3'))),'axe 0,3 (ecart 0,2 tout juste) ne bascule pas');
  /* apres un retour de la bascule ordinaire vers versRoute, pas de second passage a rien dans le meme vol */
  const r=joue(P,S('rien puis retour'));vrai(r[5].volant===0&&r[7].volant!==0&&r.slice(8).every(x=>x.volant!==0),'second passage : '+J(r.map(x=>x.volant)));
  /* la figure suivante juge sur la pose de rien (2,5 s) et non sur celle de versRoute (1 s, sous figTemps) */
  const f0=joue(P0,S('rien et figure')),f1=joue(P,S('rien et figure'));
  vrai(f0.every(x=>!x.geste)&&f1[5].geste==='figure','figure : '+J(f1[5]));
  L.push('figure a la bascule : '+J(f1[5]));
  /* rienEcart pousse aux bornes : 0,1 bascule a axe 0,35, 0,4 ne bascule plus a axe 0,25 */
  vrai(joue(pilote(genomeDe(T,{rienOn:1,rienEcart:.1})),S('rien ecart .35'))[5].volant===0,'rienEcart 0,1');
  vrai(joue(pilote(genomeDe(T,{rienOn:1,rienEcart:.4})),S('rien axe 0.25'))[5].volant!==0,'rienEcart 0,4');
  return L.join('\n');});
test('(v4) rienOn et coupOn : un coup de nitro en cours s\'arrete au passage a rien',()=>{
  const vue=(i)=>V.vueVol((v,par)=>{v.carte='nuages';v.vol.radar.decor='nuages';v.t=+(30+.1*i).toFixed(2);v.vol.t=+(.38+.1*i).toFixed(2);v.nitro=1;v.reserve=1;v.vol.air={reste:5,jauges:1};
    Object.assign(par.versRoute,V.pose({m:'versRoute',t:2.5,axe:.5}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});Object.assign(par.versRoutePlane,{issue:'choc',t:2,cause:'roche'});
    Object.assign(par.pique,{issue:'choc',t:.8,cause:'roche'});Object.assign(par.rien,V.pose({m:'rien',t:2.2,axe:.1}));
    v.vol.radar.rayons.push(V.pose({m:'retour0',t:1.6,gain:100,lat:0}),V.pose({m:'retour1',t:1.5,gain:100,lat:0}));v.vol.retours=[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true}];});
  const S=Array.from({length:7},(x,i)=>vue(i));
  const c=joue(pilote(genomeDe(T,{coupOn:1,coupDepuis:.7})),S),r=joue(pilote(genomeDe(T,{coupOn:1,coupDepuis:.7,rienOn:1})),S);
  vrai(c[4].nitro===true&&c[5].nitro===true,'le coup ne part pas a la vue 4 ou ne dure pas : '+J(c.map(x=>x.nitro)));
  vrai(r[4].nitro===true&&r[5].volant===0&&r[5].nitro===false,'coup + rien : '+J(r.map(x=>[x.volant,x.nitro])));
  return 'coup seul '+J(c.map(x=>x.nitro))+' ; coup + rien '+J(r.map(x=>x.nitro));});
test('(v4) loiFidele 1 : juger sur le rayon fidele (bascule, figures) ; 2 : suivre sa commande ; avec coupOn : la meme loi, 2 lois demandees',()=>{
  const S=n=>V.suitesV4().find(x=>x.nom===n).vues,P1=pilote(genomeDe(T,{loiFidele:1})),P2=pilote(genomeDe(T,{loiFidele:2}));const L=[];
  /* versRoute du radar « air », le fidele se pose : le temoin bascule (sur la vue sans loi), le fidele garde versRoute */
  const a=joue(P0,S('fidele air/pose').map(sansLois)),b=joue(P1,S('fidele air/pose'));
  const vr=joue(P0,[V.vueVol((v,par)=>{v.carte='nuages';v.vol.radar.decor='nuages';v.t=50;v.vol.t=.5;Object.assign(par.versRoute,V.pose({m:'versRoute'}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});})]);
  vrai(J(sansRetours(b[0]))===J(vr[0])&&J(a[0])!==J(vr[0]),'air/pose : temoin '+J(a[0])+' fidele '+J(b[0])+' versRoute '+J(vr[0]));
  vrai(J(b[0].retours)===J([{marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2}]),'loi demandee : '+J(b[0].retours));
  L.push('air/pose : temoin '+J(a[0])+' ; fidele '+J(sansRetours(b[0])));
  /* l'inverse : le radar se pose, le fidele meurt : le fidele bascule, pas le temoin */
  vrai(J(joue(P0,S('fidele pose/air').map(sansLois))[0])!==J(sansRetours(joue(P1,S('fidele pose/air'))[0])),'pose/air : rien ne change');
  /* les figures : le seuil figTemps se lit sur le fidele */
  vrai(joue(P1,S('fidele figure'))[0].geste==='figure'&&!joue(P0,S('fidele figure').map(sansLois))[0].geste,'figure sur le fidele');
  vrai(!joue(P1,S('fidele pas de figure'))[0].geste&&joue(P0,S('fidele pas de figure').map(sansLois))[0].geste==='figure','pas de figure sur le fidele');
  /* 2 : le volant et le manche de la loi fidele (0,3 ; 0) ; la nitro de versRoute */
  const c=joue(P2,S('fidele air/pose'))[0];vrai(c.volant===.3&&c.manche===0&&c.nitro===false,'loiFidele 2 : '+J(c));
  /* 2 sans commande (vue.vol.retours absent) : repli sur versRoute */
  const sc=S('fidele air/pose').map(v=>{const w=copie(v);delete w.vol.retours;return w;});vrai(J(sansRetours(joue(P2,sc)[0]))===J(sansRetours(joue(P1,sc)[0])),'repli sans commande');
  L.push('loiFidele 2 : '+J(sansRetours(c)));
  /* avec coupOn : COUP_LOIS[0] est la loi fidele (indice 0), 2 lois demandees et non 3 ; le rayon retour0 sert aux deux */
  const Pc=pilote(genomeDe(T,{loiFidele:1,coupOn:1})),sol=joue(Pc,[V.vueSol()])[0];
  vrai(sol.retours.length===2&&J(sol.retours[0])===J({marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2})&&sol.retours[1].coup===.2,'coup + fidele : '+J(sol.retours));
  const vc=S('fidele air/pose').map(v=>{const w=copie(v);w.vol.radar.rayons.push({m:'retour1',issue:'air',t:1});w.vol.retours.push({volant:0,manche:0,nitro:true});return w;});
  vrai(J(sansRetours(joue(Pc,vc)[0]))===J(vr[0]),'coup + fidele : le rayon retour0 ne juge pas : '+J(joue(Pc,vc)[0]));
  return L.join('\n');});
test('(v4) secoursOn : tout meurt -> la loi de secours qui se pose ; les courts « libre » ne bloquent pas ; un long « libre » bloque ; tableau des places',()=>{
  const S=n=>V.suitesV4().find(x=>x.nom===n).vues,P=pilote(genomeDe(T,{secoursOn:1}));const L=[];
  const b=joue(P,S('secours S1'))[0];vrai(b.volant===.21&&b.manche===.5&&b.nitro===true,'S1 : '+J(b));
  vrai(J(joue(P0,S('secours S1').map(sansLois))[0])!==J(sansRetours(b)),'le temoin fait deja pareil');
  const b2=joue(P,S('secours S2'))[0];vrai(b2.volant===-.33&&b2.manche===1,'S2 : '+J(b2));
  /* les deux se posent : celui qui vaut le plus (S2, plus droit et plus tot) */
  vrai(joue(P,S('secours les deux'))[0].volant===-.33,'les deux');
  /* les courts au choc : la bascule prend un long, le secours le remplace quand meme */
  vrai(joue(P,S('secours courts choc'))[0].volant===-.33,'courts choc');
  /* un long libre bloque : comme le temoin */
  vrai(J(sansRetours(joue(P,S('secours long libre'))[0]))===J(joue(P0,S('secours long libre').map(sansLois))[0]),'long libre : le secours est pris');
  /* deux vues : la facon de secours se pose, elle est tenue */
  vrai(J(joue(P,S('secours deux vues')).map(x=>x.volant))===J([-.33,-.33]),'deux vues');
  /* un long absent est saute : un vol VOULU (raccourci engage au sol, ville) sans cible : viser et viserPlane sont des facons longues permises, mais
     leurs rayons sont absents ; s'ils comptaient comme « ne meurt pas », le secours ne partirait jamais. Et retourOn allume : S1 = retour1. */
  const Pr=pilote(genomeDe(T,{secoursOn:1,retourOn:1}));
  const racc=t=>V.vueSol(v=>{v.carte='ville';v.t=t;v.troncons=[{d:100}];v.tenue={tient:true,approx:true};v.nitro=.9;v.reserve=0;
    v.sorties={pourquoi:'demande',bord:null,droite:null,saut:null,gauche:{t:.6,rayons:[V.pose({m:'versRoute',t:1.5,axe:.2,gain:200,lat:-3,chute:20,air:3})]}};});
  const vr=V.volSecours({carte:'ville',t:8.4,rayons:[{m:'retour0',issue:'choc',t:1,cause:'roche'},V.pose({m:'retour1',t:1.6})],retours:[{volant:.1,manche:0,nitro:false},{volant:.44,manche:.5,nitro:true}]});
  const br=joue(Pr,[racc(8.1),racc(8.2),vr]);vrai(br[1].regarder==='sorties'&&br[1].volant===1,'le raccourci ne s\'engage pas : '+J(br[1]));
  vrai(br[2].volant===.44,'vol voulu, viser absent, retourOn + secours : '+J(br[2]));
  /* pas de figure pendant un vol de secours (proche haut 20, S1 pose a 2,6 s) */
  const vf=V.volSecours({rayons:[V.pose({m:'retour0',t:2.6}),{m:'retour1',issue:'choc',t:1,cause:'roche'}],retours:[{volant:.21,manche:0,nitro:false},{volant:0,manche:0,nitro:false}],
    f:v=>{v.vol.proche=Object.assign({},v.vol.proche,{haut:20});v.vol.t=.5;}});
  const vf2=copie(vf);vf2.t=40.1;vf2.vol.t=.6;
  const bf=joue(P,[vf,vf2]);vrai(bf.every(x=>!x.geste),'une figure pendant le secours : '+J(bf));
  L.push('S1 '+J(sansRetours(b))+' ; S2 '+J(sansRetours(b2))+' ; vol voulu + retourOn '+J(sansRetours(br[2])));
  /* retourPrime (garde par retourOn) n'est jamais lu pour une facon de secours : retourOn eteint, retourPrime a ses bornes, memes decisions */
  const sec=V.suitesV4().filter(x=>/^secours/.test(x.nom));
  vrai(J(decisions(pilote(genomeDe(T,{secoursOn:1,retourPrime:0})),sec))===J(decisions(pilote(genomeDe(T,{secoursOn:1,retourPrime:15})),sec)),'retourPrime lu par un secours');
  /* le tableau des places (§ 3.4) : la liste des lois demandees, pour les six combinaisons */
  const LP={marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2},S1=Object.assign({},LP,{nitro:3,nitroHaut:5}),S2=Object.assign({},LP,{cabre:0});
  const RET={marge:8,cap:.8,gain:.8,avance:.15,rv:.2,rm:.24,rn:.18},COUP=[LP,Object.assign({},LP,{coup:.2})];
  const tab=[[{},[S1,S2]],[{retourOn:1},[RET,S1,S2]],[{loiFidele:1},[LP,S1,S2]],[{loiFidele:2,retourOn:1},[RET,LP,S1,S2]],[{coupOn:1},COUP.concat([S1,S2])],
    [{coupOn:1,loiFidele:2},COUP.concat([S1,S2])],[{coupOn:1,retourOn:1},[RET].concat(COUP,[S1])],[{coupOn:1,retourOn:1,loiFidele:1},[RET].concat(COUP,[S1])]];
  for(const [poser,att] of tab){const o=joue(pilote(genomeDe(T,Object.assign({secoursOn:1},poser))),[V.vueSol()])[0];
    vrai(J(o.retours)===J(att),J(poser)+' : '+J(o.retours));L.push(J(poser)+' : '+o.retours.length+' lois');}
  /* coupOn + secoursOn : un coup lance s'arrete au secours (S1 = retour2, sa commande sans nitro) */
  const vc=(i,meurt)=>{const v=meurt?V.volSecours({t:+(30+.1*i).toFixed(2),ft:+(.38+.1*i).toFixed(2),rayons:[{m:'retour0',issue:'choc',t:1,cause:'roche'},{m:'retour1',issue:'choc',t:1,cause:'roche'},
      V.pose({m:'retour2',t:1.6}),{m:'retour3',issue:'choc',t:1,cause:'roche'}],retours:[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true},{volant:.2,manche:0,nitro:false},{volant:0,manche:1,nitro:false}]})
    :V.vueVol((w,par)=>{w.carte='nuages';w.vol.radar.decor='nuages';w.t=+(30+.1*i).toFixed(2);w.vol.t=+(.38+.1*i).toFixed(2);
      Object.assign(par.versRoute,V.pose({m:'versRoute',t:2.5}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});
      w.vol.radar.rayons.push(V.pose({m:'retour0',t:1.6,gain:100,lat:0}),V.pose({m:'retour1',t:1.5,gain:100,lat:0}),{m:'retour2',issue:'air',t:3},{m:'retour3',issue:'air',t:3});
      w.vol.retours=[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true},{volant:.2,manche:0,nitro:false},{volant:0,manche:1,nitro:false}];});
    v.nitro=1;v.reserve=1;v.vol.air={reste:5,jauges:1};return v;};
  const SC=[0,1,2,3,4].map(i=>vc(i,false)).concat([vc(5,true)]);
  const cs=joue(pilote(genomeDe(T,{coupOn:1,coupDepuis:.7,secoursOn:1})),SC);
  vrai(cs[4].nitro===true&&cs[5].volant===.2&&cs[5].nitro===false,'coup + secours : '+J(cs.map(x=>[x.volant,x.nitro])));
  const c1=joue(pilote(genomeDe(T,{coupOn:1,coupDepuis:.7})),SC.map(v=>{const w=copie(v);w.vol.radar.rayons=w.vol.radar.rayons.filter(r=>r.m!=='retour2'&&r.m!=='retour3');w.vol.retours=w.vol.retours.slice(0,2);return w;}));
  vrai(c1[5].nitro===true,'sans secours, le coup continue a la vue 5 (sinon ce cas ne prouve rien) : '+J(c1.map(x=>x.nitro)));
  return L.join('\n');});
test('(v4) chancePalierMin : 12 = le profil de pilote-voltige.js ; 8 -> palierMin 8 ; seul PROFIL change (memes decisions)',()=>{
  const V25=charger('pilote-voltige.js',{source:fs.readFileSync(Gn.VOLTIGE,'utf8')});
  vrai(P0.profilSha===V25.profilSha,'12');
  const g8=genomeDe(T,{chancePalierMin:8}),P8=pilote(g8);
  vrai(P8.profil.chance.palierMin===8&&P8.profilSha!==V25.profilSha,'8 : '+J(P8.profil));
  vrai(Gn.idDe(g8)!==Gn.idDe(T),'chancePalierMin 8 garde l\'identifiant du temoin');
  vrai(J(decisions(P8,QUELQUES))===J(decisions(P0,QUELQUES)),'chancePalierMin change une decision');
  return 'profil a 8 : '+J(P8.profil);});
test('(v4) tous les genes v4 allumes ensemble, avec tous les anciens drapeaux : aucune erreur du cerveau hors « YEUX CHANGES » sur toutes les suites',()=>{
  const tout={};for(const b of Gn.BORNES)if(b.type==='drapeau'&&b.naissance===0)tout[b.cle]=1;
  let n=0,yeux=0;
  for(const lf of [1,2]){const R=decisions(pilote(genomeDe(T101,Object.assign({},tout,{loiFidele:lf}))),SUITES);
    for(const x of R)for(const y of x){n++;if(y.erreur){vrai(/^YEUX CHANGES/.test(y.erreur),'erreur '+y.erreur);yeux++;}}}
  return n+' decisions, '+yeux+' « YEUX CHANGES »';});

/* ===== (v6) LE GENE FIGE ===== */
test('(v6) chancePalierMin fige : 20 000 muter (phases A, B, C, genes et sigma forces) ne le changent pas et ne tirent rien pour lui ; croiser ; valider ; reparer',()=>{
  const rng=Gr.mulberry32(20261128);let n=0;
  const g8=genomeDe(T,{chancePalierMin:8});
  for(let i=0;i<20000;i++){const o={phase:['A','B','C'][i%3],cfg};if(i%4===1){o.genes=1+(i%64);o.sigma=(i%7)/3;}
    const base=i%2?T:g8,r=Gn.muter(base,rng,o).genome;vrai(r.A.chancePalierMin===base.A.chancePalierMin,'muter '+i);n++;}
  /* aucun tirage pour lui : a la meme graine, un parent a 8 et un parent a 12 donnent les memes enfants (hors ce gene) */
  for(let s=0;s<300;s++){const a=Gn.muter(T,Gr.mulberry32(s),{phase:'C',cfg}).genome,b=Gn.muter(g8,Gr.mulberry32(s),{phase:'C',cfg}).genome;
    b.A.chancePalierMin=12;vrai(J(a)===J(b),'graine '+s+' : le gene fige consomme un tirage');}
  for(let s=0;s<200;s++){vrai(Gn.croiser(T,g8,Gr.mulberry32(s)).A.chancePalierMin===12&&Gn.croiser(g8,T,Gr.mulberry32(s)).A.chancePalierMin===8,'croiser '+s);
    /* croiser ne tire rien pour lui : les autres genes sont ceux d'un croisement de deux parents a 12 */
    const t8=copie(T);t8.A.chancePalierMin=12;const g12=copie(g8);g12.A.chancePalierMin=12;
    const x=Gn.croiser(T,g8,Gr.mulberry32(s)),y=Gn.croiser(t8,g12,Gr.mulberry32(s));vrai(J(x)===J(y),'croiser '+s+' : un tirage pour le gene fige');}
  for(const [x,att] of [[0,1],[31,30],[12.5,13],[-3,1],['8',8]]){const g=copie(T);g.A.chancePalierMin=x;vrai(typeof x==='string'||Gn.valider(copie(g),cfg)!==null,'valider accepte '+x);
    Gn.reparer(g,cfg);vrai(g.A.chancePalierMin===att,'reparer '+x+' -> '+g.A.chancePalierMin);}
  return n+' mutations, le gene fige n\'a jamais bouge';});

console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates');
process.exit(rates?1:0);
