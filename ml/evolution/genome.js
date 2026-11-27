#!/usr/bin/env node
/* ===== LE GENOME DE LA SELECTION NATURELLE (2026-11-27, etape 2 — Sacha : « une population de pilotes evolue seule sur un PC, le moins bon est vire ») =====
   Contrat : ml/evolution/INTERFACES.md § 2.3, § 3.2, § 4 et § 5 (il fait foi). Specification : SPECIFICATION.md § 4.
   Un genome = { v:1, A:{86 genes, dans l'ordre de BORNES}, WV:[222 poids de la tete RAYON], WS:[90 poids de la tete SOL] }.
   - BORNES : 64 reels (45 de REGLAGES, 5 de la loi « retour », 14 constantes promues de pilote-voltige.js), 20 drapeaux, dessousDecor (choix 0/1/2),
     figMax (entier 0..5). Les cartes de raccCartes_* / raccJumeau_* sont celles de config.json (cartesTirage), lues une fois au chargement.
   - genomeTemoin(cfg) : le genome de ml/ecurie/pilote-voltige.js (REGLAGES lu par une regex, evalue dans un contexte vide) ; les tetes tirees une fois
     (graineReseaux), W2 = 0 : le pilote fabrique joue alors au bit pres comme pilote-voltige (identite.js le prouve).
   - muter / croiser / reparer : § 4.2 et § 6.2 du contrat. Tout tirage passe par le Rng recu (mulberry32 de graines.js), jamais Math.random.
   - ecrirePilote(genome) : le texte du pilote (modele.js, la balise remplacee par le bloc du genome), en LF, pret pour piloter.charger.
   Ligne de commande : node ml/evolution/genome.js --temoin [--ecrire sortie.js] | --essai-reparer 10000 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('./commun');
const {mulberry32}=require('./graines');

const CFG0=C.lireConfig();
const CARTES=Object.freeze(CFG0.cartesTirage.slice());
const MODELE=path.join(C.DOSSIER,'modele.js');
const VOLTIGE=path.join(C.RACINE,'ml','ecurie','pilote-voltige.js');
const BALISE='/*@GENOME@*/';

/* ===== LES BORNES (INTERFACES.md § 4.1) ===== */
/* les 45 reels de REGLAGES, dans l'ordre de leur apparition dans pilote-voltige.js : [cle, min, max, temoin (= naissance)] */
const REELS_R=[
  ['marge',3,20,10],['bandeDecor',10,99,99],['nitroDecor',0,1.5,1],['margeCouloir',5,25,15],['avance',.1,.8,.3],['glisse',.04,.3,.12],
  ['glisseUrgence',.1,.6,.3],['ligneLoin',100,500,320],['piecesLoin',60,350,180],['capLigne',.1,.5,.3],['avanceCap',0,.6,.25],['capAvance',0,.5,.25],
  ['braqueDoux',0,.5,.15],['braqueFort',.2,1,.5],['braqueNitro',.2,1.2,.7],['margeAllumer',-.1,.5,.05],['margeTenir',-.2,.3,0],['jaugeAllume',.2,1.2,.45],
  ['jaugeCoupe',0,.8,.25],['capMax',.1,.8,.35],['bascule',0,40,10],['tenirFacon',.1,1.5,.35],['derive',0,.6,.3],
  ['raccVirage',0,.6,.2],['raccGain',40,300,80],['raccAxe',.3,.95,.75],['raccTmin',.3,1.5,.7],['raccChute',30,300,120],['raccTmax',2,5.5,3.6],
  ['raccAir',.3,3,1.2],['raccBord',1,12,5],['raccAttente',.6,3,1.6],['raccRepos',.3,4,1.5],['figPlongeon',1.4,3.5,2.2],['figTemps',1.4,3,1.5],
  ['figJauge',.35,1,.4],['figEcart',.5,2,.55],['dessousMax',.2,3,.8],['dessousPose',0,60,25],['departMin',0,4,1.5],['departMax',1,8,5.5],
  ['volRetour',.2,1.5,.8],['volAvance',0,.4,.25],['figDepuis',.1,1.2,.4],['figHaut',0,60,15]];
/* les drapeaux, choix et entiers de REGLAGES, dans l'ordre de leur apparition (raccCartes_* et raccJumeau_* a la place de leur objet) */
const NON_REELS=[];
for(const c of CARTES)NON_REELS.push({cle:'raccCartes_'+c,type:'drapeau',min:0,max:1,naissance:(c==='grotte'||c==='canyon'||c==='jade')?0:1,ou:'raccCartes',carte:c});
for(const c of CARTES)NON_REELS.push({cle:'raccJumeau_'+c,type:'drapeau',min:0,max:1,naissance:(c==='jade'||c==='ville')?1:0,ou:'raccJumeau',carte:c});
NON_REELS.push({cle:'dessousAveugle',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'dessousDecor',type:'choix',min:0,max:2,naissance:1,ou:'R'});
NON_REELS.push({cle:'dessousNitro',type:'drapeau',min:0,max:1,naissance:0,ou:'R'});
NON_REELS.push({cle:'dessousFuir',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'portailVol',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'volDemiTour',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'volRetourOn',type:'drapeau',min:0,max:1,naissance:0,ou:'volRetour'});
NON_REELS.push({cle:'figMax',type:'entier',min:0,max:5,naissance:2,ou:'R'});
/* la loi « retour » (amendement 2) */
const RETOUR=[
  {cle:'retourOn',type:'drapeau',min:0,max:1,naissance:0,ou:'retours'},
  {cle:'retMarge',type:'reel',min:4,max:14,naissance:8,ou:'R'},
  {cle:'retCap',type:'reel',min:.45,max:.9,naissance:.8,ou:'R'},
  {cle:'retGain',type:'reel',min:.7,max:1.4,naissance:.8,ou:'R'},
  {cle:'retAvance',type:'reel',min:.1,max:.25,naissance:.15,ou:'R'},
  {cle:'retourPrime',type:'reel',min:0,max:15,naissance:4,ou:'R'},
  {cle:'volMieux',type:'drapeau',min:0,max:1,naissance:0,ou:'R'}];
/* les 14 constantes promues (ecrites en dur dans pilote-voltige.js, lues G.<cle> dans modele.js) */
const PROMUES=[['axePoids',5,60,20],['vTemps',0,10,3],['vPortail',60,100,94],['vLevre',40,95,80],['vLibreBase',0,30,12],['vLibrePente',0,6,2],
  ['vCourt',10,60,34],['rAxe',50,500,250],['rTemps',0,80,25],['rPlane',0,100,40],['rLourde',0,100,40],['bVersRoute',0,10,3],['bVersRoutePlane',0,10,2],['bRien',0,10,1]];
/* les extraits de pilote-voltige.js qui portent ces constantes (§ 5.3) : s'ils manquent, pilote-voltige a change et le temoin ne se lit plus */
const EXTRAITS=['100-20*Math.abs(axe)-3*t-',"if(r.issue==='portail')return 94;",'return 80-3*t;','return 12+2*t;','return 34-Math.min(20,',
  "const s=Math.min(gain,600)-250*axe-25*t-(r.m==='plane'?40:0)-(r.note==='lourde'?40:0);",
  "(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0)"];

const BORNES=Object.freeze([].concat(
  REELS_R.map(([cle,min,max,n])=>({cle,type:'reel',min,max,naissance:n,ou:cle==='volRetour'?'volRetour':'R'})),
  NON_REELS,RETOUR,
  PROMUES.map(([cle,min,max,n])=>({cle,type:'reel',min,max,naissance:n,ou:'G'}))).map(b=>Object.freeze(b)));
const PAR_CLE=Object.freeze(BORNES.reduce((o,b)=>{o[b.cle]=b;return o;},{}));
const CONTINUS=Object.freeze(BORNES.filter(b=>b.type==='reel').map(b=>b.cle));
const TETES=Object.freeze({rayon:Object.freeze({cle:'WV',nIn:36,nH:6,nOut:1,nW1:216,nW2:6}),sol:Object.freeze({cle:'WS',nIn:12,nH:6,nOut:3,nW1:72,nW2:18})});
const LONGUEUR={WV:222,WS:90};
if(BORNES.length!==86||CONTINUS.length!==64)throw new Error('genome : BORNES mal construites ('+BORNES.length+' genes, '+CONTINUS.length+' reels)');
for(const b of BORNES)if(!(b.naissance>=b.min&&b.naissance<=b.max))throw new Error('genome : naissance hors borne pour « '+b.cle+' »');

/* L'ORDRE DES CLES DE REGLAGES dans pilote-voltige.js (le bloc ecrit suit cet ordre, comme l'exemple du § 5.1 ; les cles de la loi « retour » ensuite) */
const ORDRE_VOLTIGE=['marge','bandeDecor','nitroDecor','margeCouloir','avance','glisse','glisseUrgence','ligneLoin','piecesLoin','capLigne','avanceCap',
  'capAvance','braqueDoux','braqueFort','braqueNitro','margeAllumer','margeTenir','jaugeAllume','jaugeCoupe','capMax','bascule','tenirFacon','derive',
  'raccVirage','raccGain','raccAxe','raccTmin','raccChute','raccTmax','raccAir','raccBord','raccAttente','raccCartes','raccJumeau','raccRepos',
  'figPlongeon','figTemps','figJauge','figEcart','dessousMax','dessousAveugle','dessousDecor','dessousNitro','dessousFuir','dessousPose','departMin',
  'departMax','portailVol','volDemiTour','volRetour','volAvance','figMax','figDepuis','figHaut'];
const ORDRE_RETOUR=['retourOn','retMarge','retCap','retGain','retAvance','retourPrime','volMieux'];

/* ===== LES ARRONDIS ===== */
const sansMoinsZero=x=>x===0?0:x;
const arr4=x=>sansMoinsZero(+(+x).toFixed(4));
const arr6=x=>sansMoinsZero(+(+x).toFixed(6));
const fini=x=>typeof x==='number'&&x-x===0;
const cl=(x,a,b)=>x<a?a:x>b?b:x;
const TOL=1e-9;

function cfgDe(cfg){
  const c=cfg||CFG0;
  if(Array.isArray(c.cartesTirage)&&c.cartesTirage.join(',')!==CARTES.join(','))
    throw new Error('genome : cfg.cartesTirage ('+c.cartesTirage.join(',')+') differe de config.json ('+CARTES.join(',')+') : les genes raccCartes_*/raccJumeau_* ne correspondent plus');
  return c;}
function bornePoids(cfg){const b=(cfg||CFG0).bornePoids;return fini(b)&&b>0?b:4;}

/* ===== LES TETES A LA NAISSANCE (§ 3.2) : W1 ~ N(0, 1/sqrt(nIn)), dans l'ordre des indices ; W2 = 0 ===== */
function tirerReseaux(graine){
  const rng=mulberry32(graine>>>0),bp=bornePoids();
  const WV=new Array(LONGUEUR.WV).fill(0),WS=new Array(LONGUEUR.WS).fill(0);
  for(let i=0;i<TETES.rayon.nW1;i++)WV[i]=arr6(cl(rng.normal()/6,-bp,bp));
  for(let i=0;i<TETES.sol.nW1;i++)WS[i]=arr6(cl(rng.normal()/Math.sqrt(12),-bp,bp));
  return {WV,WS};}

/* ===== REPARER (§ 4.2) : bornes, types, les trois contraintes, arrondis, -0 -> 0 ; en place, idempotent ===== */
function reparer(genome,cfg){
  if(!genome||typeof genome!=='object')throw new Error('genome : reparer attend un genome (objet)');
  const A0=genome.A&&typeof genome.A==='object'?genome.A:{},A={};
  for(const b of BORNES){
    let x=A0[b.cle];
    if(b.type==='reel'){x=+x;if(!fini(x))x=b.naissance;A[b.cle]=arr4(cl(x,b.min,b.max));}
    else if(b.type==='drapeau')A[b.cle]=x?1:0;
    else{x=+x;if(!fini(x))x=b.naissance;A[b.cle]=sansMoinsZero(cl(Math.round(x),b.min,b.max));}}
  /* 1. braqueFort >= braqueDoux + 0,1 */
  if(A.braqueFort<A.braqueDoux+.1-TOL){
    A.braqueFort=arr4(A.braqueDoux+.1);
    if(A.braqueFort>PAR_CLE.braqueFort.max){A.braqueFort=PAR_CLE.braqueFort.max;A.braqueDoux=arr4(A.braqueFort-.1);}}
  /* 2. jaugeCoupe <= jaugeAllume */
  if(A.jaugeCoupe>A.jaugeAllume)A.jaugeCoupe=A.jaugeAllume;
  /* 3. departMax >= departMin */
  if(A.departMax<A.departMin)A.departMax=A.departMin;
  genome.v=1;genome.A=A;
  const bp=bornePoids(cfg);
  for(const t of ['WV','WS']){
    const W=genome[t];
    if(!W||typeof W.length!=='number'||W.length!==LONGUEUR[t])throw new Error('genome : la tete '+t+' doit avoir '+LONGUEUR[t]+' poids ('+(W&&W.length)+')');
    const R=new Array(LONGUEUR[t]);
    for(let i=0;i<R.length;i++){let x=+W[i];if(!fini(x))x=0;R[i]=arr6(cl(x,-bp,bp));}
    genome[t]=R;}
  return genome;}

/* ===== VALIDER : null si conforme, sinon le premier defaut ===== */
function valider(genome,cfg){
  if(!genome||typeof genome!=='object')return 'pas un objet';
  if(genome.v!==1)return 'version '+genome.v+' (attendu 1)';
  const A=genome.A;if(!A||typeof A!=='object')return 'A manque';
  const k=Object.keys(A);
  if(k.length!==BORNES.length)return 'A a '+k.length+' genes (attendu '+BORNES.length+')';
  for(let i=0;i<BORNES.length;i++){const b=BORNES[i],x=A[b.cle];
    if(k[i]!==b.cle)return 'A : cle « '+k[i]+' » a la place de « '+b.cle+' »';
    if(!fini(x))return 'gene « '+b.cle+' » non numerique';
    if(x<b.min||x>b.max)return 'gene « '+b.cle+' » hors borne ('+x+' hors ['+b.min+', '+b.max+'])';
    if(b.type!=='reel'&&x!==Math.round(x))return 'gene « '+b.cle+' » non entier';
    if(b.type==='reel'&&x!==arr4(x))return 'gene « '+b.cle+' » non arrondi a 4 decimales';
    if(x===0&&1/x<0)return 'gene « '+b.cle+' » vaut -0';}
  if(A.braqueFort<A.braqueDoux+.1-TOL)return 'contrainte braqueFort >= braqueDoux + 0,1';
  if(A.jaugeCoupe>A.jaugeAllume)return 'contrainte jaugeCoupe <= jaugeAllume';
  if(A.departMax<A.departMin)return 'contrainte departMax >= departMin';
  const bp=bornePoids(cfg);
  for(const t of ['WV','WS']){const W=genome[t];
    if(!W||typeof W.length!=='number'||W.length!==LONGUEUR[t])return 'tete '+t+' : '+(W&&W.length)+' poids (attendu '+LONGUEUR[t]+')';
    for(let i=0;i<W.length;i++){const x=W[i];
      if(!fini(x))return 'tete '+t+' : poids '+i+' non fini';
      if(x<-bp||x>bp)return 'tete '+t+' : poids '+i+' hors de ±'+bp;
      if(x===0&&1/x<0)return 'tete '+t+' : poids '+i+' vaut -0';}}
  return null;}

function copier(g){return {v:1,A:Object.assign({},g.A),WV:Array.from(g.WV),WS:Array.from(g.WS)};}

/* ===== LE TEMOIN : le genome de ml/ecurie/pilote-voltige.js ===== */
function lireReglagesVoltige(texte){
  const m=texte.match(/const REGLAGES=\{[\s\S]*?\r?\n\};/);
  if(!m)throw new Error('genome : pilote-voltige.js a change (bloc const REGLAGES={…}; introuvable)');
  const ctx=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
  const R=vm.runInContext(m[0]+'\nREGLAGES;',ctx,{timeout:1000});
  if(!R||typeof R!=='object')throw new Error('genome : REGLAGES de pilote-voltige.js illisible');
  return JSON.parse(JSON.stringify(R));}
function genomeTemoin(cfg){
  cfg=cfgDe(cfg);
  const texte=fs.readFileSync(VOLTIGE,'utf8');
  for(const e of EXTRAITS)if(texte.indexOf(e)<0)throw new Error('genome : pilote-voltige.js a change (extrait introuvable : '+e+')');
  const R=lireReglagesVoltige(texte);
  const k=Object.keys(R),attendu=new Set(ORDRE_VOLTIGE);
  for(const c of k)if(!attendu.has(c))throw new Error('genome : REGLAGES de pilote-voltige.js a une cle absente de BORNES « '+c+' »');
  for(const c of ORDRE_VOLTIGE)if(!(c in R))throw new Error('genome : la cle « '+c+' » de BORNES manque dans REGLAGES de pilote-voltige.js');
  const A={};
  for(const b of BORNES){
    let x;
    if(b.ou==='R')x=(b.cle in R)?R[b.cle]:b.naissance;
    else if(b.ou==='G'||b.ou==='retours')x=b.naissance;
    else if(b.ou==='raccCartes')x=R.raccCartes&&R.raccCartes[b.carte]===0?0:1;
    else if(b.ou==='raccJumeau')x=R.raccJumeau&&R.raccJumeau[b.carte]?1:0;
    else if(b.cle==='volRetourOn')x=R.volRetour>0?1:0;
    else if(b.cle==='volRetour')x=R.volRetour>0?R.volRetour:b.naissance;
    else throw new Error('genome : gene « '+b.cle+' » sans source');
    if(!fini(x))throw new Error('genome : valeur du temoin non numerique pour « '+b.cle+' »');
    if(x<b.min||x>b.max)throw new Error('genome : la valeur du temoin sort de sa borne pour « '+b.cle+' » ('+x+' hors ['+b.min+', '+b.max+'])');
    A[b.cle]=x;}
  /* une cle de pilote-voltige a valeur reelle qui ne tombe pas sur une borne : refuse (toutes les cles hors objets sont des genes) */
  const net=reparer(Object.assign({v:1,A},tirerReseaux(cfg.graineReseaux>>>0)),cfg);
  for(const b of BORNES)if(Math.abs(net.A[b.cle]-A[b.cle])>TOL)throw new Error('genome : la valeur du temoin de « '+b.cle+' » ne survit pas a reparer ('+A[b.cle]+' -> '+net.A[b.cle]+')');
  return net;}

/* ===== MUTER (§ 6.2) ===== */
function muter(genome,rng,o){
  o=o||{};const cfg=cfgDe(o.cfg),phase=o.phase||'A';
  if(phase!=='A'&&phase!=='B'&&phase!=='C')throw new Error('genome : phase inconnue « '+phase+' »');
  const avant=copier(genome),g=copier(genome),A=g.A;
  const sigma=o.sigma!=null?+o.sigma:+cfg.sigmaMutation;
  let m=o.genes!=null?Math.round(+o.genes):1+rng.poisson(+cfg.poissonMutations);
  m=Math.max(0,Math.min(CONTINUS.length,m));
  /* les reels : m distincts tires dans CONTINUS ; x + N(0,1)·sigma·etendue, reflexion aux bornes puis bornage */
  const urne=CONTINUS.slice();
  for(let n=0;n<m;n++){
    const cle=urne.splice(rng.entier(urne.length),1)[0],b=PAR_CLE[cle],e=b.max-b.min;
    let x=(+A[cle])+rng.normal()*sigma*e;
    if(x>b.max)x=2*b.max-x;else if(x<b.min)x=2*b.min-x;
    A[cle]=cl(x,b.min,b.max);}
  /* les drapeaux, dessousDecor, figMax : un tirage chacun, dans l'ordre de BORNES */
  const pD=+cfg.pDrapeau,pF=+cfg.pFigMax;
  for(const b of BORNES){
    if(b.type==='drapeau'){if(rng.suivant()<pD)A[b.cle]=A[b.cle]?0:1;}
    else if(b.type==='choix'){if(rng.suivant()<pD){const autres=[];for(let v=b.min;v<=b.max;v++)if(v!==A[b.cle])autres.push(v);A[b.cle]=autres[rng.entier(autres.length)];}}
    else if(b.type==='entier'){if(rng.suivant()<pF)A[b.cle]=cl(A[b.cle]+(rng.suivant()<.5?-1:1),b.min,b.max);}}
  /* les tetes : W2 en phase B et C, W1 en plus en phase C */
  const ouvrir=(P,partie)=>{
    if(!P||!(rng.suivant()<+P.pTete))return;
    const t=rng.suivant()<.5?TETES.rayon:TETES.sol,W=g[t.cle];
    const n=partie==='W2'?t.nW2:t.nW1,off=partie==='W2'?t.nW1:0,k=Math.max(1,Math.round(+P.part*n));
    const ids=[];for(let i=0;i<n;i++)ids.push(i);
    const pris=[];for(let j=0;j<k&&ids.length;j++)pris.push(ids.splice(rng.entier(ids.length),1)[0]);
    for(const i of pris)W[off+i]=W[off+i]+rng.normal()*(+P.sigma);};
  if(phase==='B'||phase==='C')ouvrir(cfg.phases&&cfg.phases.B,'W2');
  if(phase==='C')ouvrir(cfg.phases&&cfg.phases.C,'W1');
  reparer(g,cfg);
  const mutes=[];
  for(const b of BORNES)if(g.A[b.cle]!==avant.A[b.cle])mutes.push({cle:b.cle,avant:avant.A[b.cle],apres:g.A[b.cle]});
  for(const t of ['WV','WS'])if(g[t].some((x,i)=>x!==avant[t][i]))mutes.push({cle:t,avant:null,apres:null});
  return {genome:g,mutes};}

/* ===== CROISER (§ 6.2) : chaque gene chez l'un ou l'autre ; chaque tete entiere chez l'un ===== */
function croiser(g1,g2,rng){
  const A={};
  for(const b of BORNES)A[b.cle]=rng.suivant()<.5?g1.A[b.cle]:g2.A[b.cle];
  const WV=Array.from(rng.suivant()<.5?g1.WV:g2.WV),WS=Array.from(rng.suivant()<.5?g1.WS:g2.WS);
  return reparer({v:1,A,WV,WS});}

/* ===== LES EMPREINTES ===== */
function enOrdre(genome){const A={};for(const b of BORNES)A[b.cle]=genome.A[b.cle];return A;}
function shaGenome(genome){return C.sha1(JSON.stringify({v:genome.v,A:enOrdre(genome),WV:Array.from(genome.WV),WS:Array.from(genome.WS)}));}
function idDe(genome){return shaGenome(genome).slice(0,12);}
function shaPilote(texte){return C.sha1(texte);}

/* ===== DISTANCES (le tableau) ===== */
function distance(g1,g2){
  let s=0;
  for(const b of BORNES){const a=g1.A[b.cle],c=g2.A[b.cle];
    if(b.type==='reel'||b.type==='entier')s+=Math.abs(a-c)/(b.max-b.min);else s+=a!==c?1:0;}
  return s/BORNES.length;}
function distanceW2(g1,g2){
  let s=0,n=0;
  for(const t of [TETES.rayon,TETES.sol])for(let i=t.nW1;i<t.nW1+t.nW2;i++){s+=Math.abs(g1[t.cle][i]-g2[t.cle][i]);n++;}
  return s/n;}

/* ===== LE PILOTE (§ 5.1) : modele.js, la balise remplacee par le bloc du genome ===== */
function bloc(genome,o){
  const cfg=cfgDe(o.cfg),A=genome.A,F=cfg.retourFige||{rv:.2,rm:.24,rn:.18};
  const r=[];
  for(const k of ORDRE_VOLTIGE){
    if(k==='raccCartes')r.push('raccCartes:{'+CARTES.filter(c=>A['raccCartes_'+c]===0).map(c=>c+':0').join(',')+'}');
    else if(k==='raccJumeau')r.push('raccJumeau:{'+CARTES.filter(c=>A['raccJumeau_'+c]===1).map(c=>c+':1').join(',')+'}');
    else if(k==='volRetour')r.push('volRetour:'+(A.volRetourOn?String(A.volRetour):'0'));
    else r.push(k+':'+String(A[k]));}
  for(const k of ORDRE_RETOUR)r.push(k+':'+String(A[k]));
  r.push('volNitro:0');
  r.push('retours:['+(A.retourOn?'{marge:'+A.retMarge+',cap:'+A.retCap+',gain:'+A.retGain+',avance:'+A.retAvance+',rv:'+String(+F.rv)+',rm:'+String(+F.rm)+',rn:'+String(+F.rn)+'}':'')+']');
  const gG=PROMUES.map(([k])=>k+':'+String(A[k])).join(',');
  return ['/*@GENOME@ debut : ecrit par ml/evolution/genome.js (ecrirePilote), genome '+idDe(genome)+' — ne pas editer */',
    'const REGLAGES={'+r.join(',')+'};',
    'const G={'+gG+'};',
    'const WV=new Float64Array(['+genome.WV.map(String).join(',')+']),WS=new Float64Array(['+genome.WS.map(String).join(',')+']);',
    'const CONTROLE_RAYONS='+(o.controleRayons!==false)+';',
    '/*@GENOME@ fin*/'];}
function ecrirePilote(genome,o){
  o=o||{};
  const d=valider(genome,o.cfg);if(d)throw new Error('genome : ecrirePilote refuse un genome non conforme : '+d);
  const modele=(o.modele!=null?String(o.modele):fs.readFileSync(MODELE,'utf8')).replace(/\r\n?/g,'\n');
  const L=modele.split('\n'),ou=[];
  for(let i=0;i<L.length;i++)if(L[i]===BALISE)ou.push(i);
  if(ou.length!==1)throw new Error('genome : modele.js doit porter une seule ligne « '+BALISE+' » ('+(ou.length?ou.length+' trouvees':'aucune')+')');
  L.splice(ou[0],1,...bloc(genome,o));
  return L.join('\n');}

module.exports={BORNES,CONTINUS,TETES,genomeTemoin,tirerReseaux,muter,croiser,reparer,shaGenome,idDe,ecrirePilote,shaPilote,distance,distanceW2,valider,
  /* outillage pour les tests */
  CARTES,ORDRE_VOLTIGE,EXTRAITS,MODELE,VOLTIGE};

/* ===== LA LIGNE DE COMMANDE ===== */
function essaiReparer(n){
  const rng=mulberry32(20261127),T=genomeTemoin(),pop=[T];let fautes=0,premiere=null;
  for(let i=0;i<n;i++){
    const phase=['A','B','C'][rng.entier(3)],p1=pop[rng.entier(pop.length)];
    let g;
    if(rng.suivant()<.3)g=croiser(p1,pop[rng.entier(pop.length)],rng);else g=p1;
    g=muter(g,rng,{phase,genes:rng.suivant()<.2?1+rng.entier(64):undefined,sigma:rng.suivant()<.2?rng.suivant()*2:undefined}).genome;
    const d=valider(g);
    const g2=reparer(copier(g));
    if(d||shaGenome(g2)!==shaGenome(g)){fautes++;if(!premiere)premiere=d||'reparer non idempotent';}
    if(pop.length<30)pop.push(g);else pop[rng.entier(30)]=g;}
  return {n,fautes,premiere};}
if(require.main===module){
  const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
  try{
    if(A.includes('--temoin')){
      const T=genomeTemoin();
      const sortie=opt('ecrire',null);
      if(sortie){const t=ecrirePilote(T);C.ecrireAtomique(path.resolve(sortie),t);console.log('pilote temoin ecrit : '+sortie+' (genome '+idDe(T)+', pilote '+shaPilote(t).slice(0,12)+')');}
      else console.log(JSON.stringify(T));
      process.exit(0);}
    if(A.includes('--essai-reparer')){
      const r=essaiReparer(+opt('essai-reparer',10000)||10000);
      console.log((r.fautes?'ECHEC':'OK')+' : '+r.n+' mutations, '+r.fautes+' genome(s) hors bornes ou contraintes'+(r.premiere?' (premier : '+r.premiere+')':''));
      process.exit(r.fautes?1:0);}
    console.error('usage : node ml/evolution/genome.js --temoin [--ecrire sortie.js] | --essai-reparer 10000');process.exit(1);
  }catch(e){console.error(String(e&&e.message||e));process.exit(1);}
}
