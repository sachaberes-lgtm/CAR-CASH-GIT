/* ===== TESTS DE genome.js ET modele.js, SANS COURSE (27/11/2026, etape 2 : tests c, d et e de la specification + amendement 3) =====
   (c) reparer : 10 000 mutations au hasard (phases A, B, C, croisements, immigres) respectent bornes et contraintes ; reparer est idempotent ;
   (d) ecrirePilote : zero \r, sha stable, chargement dans le bac (piloter.charger) en moins de 20 ms ;
   (e) le controle de l'ordre des rayons : des vues de vol truquees levent « YEUX CHANGES », les vues conformes (d'apres yeux.js, radarVol) passent.
   Et : le temoin vaut pilote-voltige.js (reglages, tetes muettes), le tirage des tetes, muter/croiser deterministes et sans effet sur l'entree.
   usage : node ml/evolution/tests/genome.test.js   (code 0 si tout passe, 1 sinon ; Node pur, aucun jeu charge) */
'use strict';
const path=require('path'),fs=require('fs'),vm=require('vm');
const D=path.join(__dirname,'..');
const Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js')),C=require(path.join(D,'commun.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const cfg=C.lireConfig();
cfg.temoin='c0025';   /* (28/11, portage) ces tests decrivent le temoin pilote-voltige, quel que soit le temoin de config.json */
let rates=0,passes=0;
function test(nom,f){try{f();passes++;console.log('PASSE  '+nom);}catch(e){rates++;console.log('ECHEC  '+nom+'\n       '+(e&&e.stack||e));}}
function vrai(c,m){if(!c)throw new Error(m||'faux');}
function egal(a,b,m){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((m||'different')+' : '+JSON.stringify(a).slice(0,300)+' contre '+JSON.stringify(b).slice(0,300));}
const copie=g=>JSON.parse(JSON.stringify(g));
const T=Gn.genomeTemoin(cfg);

/* ---------- le genome ---------- */
/* (27/11/2026, tache « gestes ») 86 -> 107 genes : les 21 des cinq gestes (15 reels, 6 drapeaux) en fin de BORNES ; leurs tests : tests/gestes.test.js
   (28/11/2026, tache « portage ») 107 -> 121 genes : les 14 du portage de la boucle payante (9 reels, 4 drapeaux, 1 entier) ; tests/portage.test.js */
test('BORNES : 121 genes, 88 reels, cles uniques, temoin dans ses bornes',()=>{
  vrai(Gn.BORNES.length===121,'genes '+Gn.BORNES.length);vrai(Gn.CONTINUS.length===88,'reels '+Gn.CONTINUS.length);
  vrai(new Set(Gn.BORNES.map(b=>b.cle)).size===121,'cles en double');vrai(Object.isFrozen(Gn.BORNES)&&Object.isFrozen(Gn.BORNES[0]),'BORNES non figees');
  const n={reel:0,drapeau:0,choix:0,entier:0};for(const b of Gn.BORNES)n[b.type]++;egal(n,{reel:88,drapeau:30,choix:1,entier:2});
  vrai(Gn.valider(T)===null,'temoin non conforme : '+Gn.valider(T));
  egal(Object.keys(T.A),Gn.BORNES.map(b=>b.cle),'ordre de A');});

test('le temoin porte les REGLAGES de pilote-voltige.js et les naissances du contrat',()=>{
  const src=fs.readFileSync(Gn.VOLTIGE,'utf8'),m=src.match(/const REGLAGES=\{[\s\S]*?\r?\n\};/);
  const R=vm.runInContext(m[0]+'\nREGLAGES;',vm.createContext(Object.create(null)));
  for(const b of Gn.BORNES)if(b.ou==='R'&&b.cle in R)vrai(T.A[b.cle]===R[b.cle],b.cle+' : '+T.A[b.cle]+' contre '+R[b.cle]);
  vrai(T.A.volRetourOn===0&&R.volRetour===0,'volRetour');
  for(const c of Gn.CARTES){vrai(T.A['raccCartes_'+c]===(R.raccCartes[c]===0?0:1),'raccCartes '+c);vrai(T.A['raccJumeau_'+c]===(R.raccJumeau[c]?1:0),'raccJumeau '+c);}
  egal([T.A.retourOn,T.A.retMarge,T.A.retCap,T.A.retGain,T.A.retAvance,T.A.retourPrime,T.A.volMieux],[0,8,.8,.8,.15,4,0],'loi retour');
  egal(['axePoids','vTemps','vPortail','vLevre','vLibreBase','vLibrePente','vCourt','rAxe','rTemps','rPlane','rLourde','bVersRoute','bVersRoutePlane','bRien'].map(k=>T.A[k]),
    [20,3,94,80,12,2,34,250,25,40,40,3,2,1],'constantes promues');});

test('tetes : 222 et 90 poids, W1 tire (mulberry32, graineReseaux), W2 = 0, deterministe',()=>{
  vrai(T.WV.length===222&&T.WS.length===90);
  for(let i=216;i<222;i++)vrai(T.WV[i]===0&&1/T.WV[i]>0,'W2 rayon '+i);for(let i=72;i<90;i++)vrai(T.WS[i]===0&&1/T.WS[i]>0,'W2 sol '+i);
  const r=Gr.mulberry32(cfg.graineReseaux>>>0);
  for(let i=0;i<216;i++){const x=+(r.normal()/6).toFixed(6);vrai(T.WV[i]===(x===0?0:x),'WV '+i);}
  for(let i=0;i<72;i++){const x=+(r.normal()/Math.sqrt(12)).toFixed(6);vrai(T.WS[i]===(x===0?0:x),'WS '+i);}
  egal(Gn.tirerReseaux(cfg.graineReseaux),{WV:T.WV,WS:T.WS});
  let s=0;for(let i=0;i<216;i++)s+=T.WV[i]*T.WV[i];vrai(Math.abs(s/216-1/36)<.012,'variance W1 rayon '+s/216);});

test('shaGenome stable, idDe = 12 premiers ; muter ne touche pas son entree et rejoue a graine egale',()=>{
  vrai(/^[0-9a-f]{40}$/.test(Gn.shaGenome(T)));vrai(Gn.idDe(T)===Gn.shaGenome(T).slice(0,12));
  vrai(Gn.shaGenome(copie(T))===Gn.shaGenome(T),'sha apres copie JSON');
  const avant=JSON.stringify(T);
  const a=Gn.muter(T,Gr.mulberry32(5),{phase:'C',cfg}),b=Gn.muter(T,Gr.mulberry32(5),{phase:'C',cfg});
  vrai(JSON.stringify(T)===avant,'muter a touche son entree');egal(a,b,'muter non deterministe');
  vrai(a.mutes.length>0,'aucun gene mute');
  for(const m of a.mutes)if(m.cle!=='WV'&&m.cle!=='WS')vrai(T.A[m.cle]===m.avant&&a.genome.A[m.cle]===m.apres&&m.avant!==m.apres,'mutes faux '+JSON.stringify(m));
  const imm=Gn.muter(T,Gr.mulberry32(9),{phase:'A',cfg,genes:8,sigma:.3});
  vrai(imm.mutes.filter(m=>Gn.CONTINUS.includes(m.cle)).length>=6,'immigre : '+imm.mutes.length+' genes');
  vrai(imm.genome.WV.every((x,i)=>x===T.WV[i])&&imm.genome.WS.every((x,i)=>x===T.WS[i]),'phase A : les tetes ont change');});

test('phase B : seuls des W2 changent (2 sur 6 ou 5 sur 18) ; phase C : des W1 aussi',()=>{
  let vuB=0,vuC=0;
  for(let s=0;s<200;s++){
    const b=Gn.muter(T,Gr.mulberry32(1000+s),{phase:'B',cfg}).genome;
    const dV=[],dS=[];for(let i=0;i<222;i++)if(b.WV[i]!==T.WV[i])dV.push(i);for(let i=0;i<90;i++)if(b.WS[i]!==T.WS[i])dS.push(i);
    vrai(dV.every(i=>i>=216)&&dS.every(i=>i>=72),'phase B a touche un W1');vrai(dV.length<=2&&dS.length<=5&&!(dV.length&&dS.length),'phase B : '+dV.length+'/'+dS.length);
    if(dV.length||dS.length)vuB++;
    const c=Gn.muter(T,Gr.mulberry32(5000+s),{phase:'C',cfg}).genome;
    let w1=0;for(let i=0;i<216;i++)if(c.WV[i]!==T.WV[i])w1++;for(let i=0;i<72;i++)if(c.WS[i]!==T.WS[i])w1++;
    if(w1)vuC++;vrai(w1<=22,'phase C : '+w1+' W1');}
  vrai(vuB>60&&vuB<140,'phase B : tetes touchees '+vuB+'/200 (attendu ~100)');vrai(vuC>30&&vuC<90,'phase C : W1 touches '+vuC+'/200 (attendu ~60)');});

/* ---------- (c) reparer ---------- */
function respecte(g){
  const d=Gn.valider(g,cfg);if(d)return d;
  for(const b of Gn.BORNES){const x=g.A[b.cle];if(!(x>=b.min&&x<=b.max))return b.cle+' hors borne';}
  if(!(g.A.braqueFort>=g.A.braqueDoux+.1-1e-9))return 'braqueFort '+g.A.braqueFort+' < braqueDoux '+g.A.braqueDoux+' + 0,1';
  if(!(g.A.jaugeCoupe<=g.A.jaugeAllume))return 'jaugeCoupe > jaugeAllume';
  if(!(g.A.departMax>=g.A.departMin))return 'departMax < departMin';
  for(const t of ['WV','WS'])for(const x of g[t])if(!(x>=-cfg.bornePoids&&x<=cfg.bornePoids)||(x===0&&1/x<0))return t+' hors de ±'+cfg.bornePoids;
  return null;}
test('(c) 10 000 mutations au hasard : bornes, contraintes, idempotence de reparer',()=>{
  const rng=Gr.mulberry32(20261127);const pop=[T];let n=0,fautes=[],contraintes=0;
  for(let i=0;i<10000;i++){
    const phase=['A','B','C'][rng.entier(3)],p1=pop[rng.entier(pop.length)];
    let g=rng.suivant()<.3?Gn.croiser(p1,pop[rng.entier(pop.length)],rng):p1;
    const o={phase,cfg};if(rng.suivant()<.25){o.genes=1+rng.entier(64);o.sigma=rng.suivant()*2;}
    g=Gn.muter(g,rng,o).genome;n++;
    const d=respecte(g);if(d&&fautes.length<5)fautes.push(i+' : '+d);
    const s=Gn.shaGenome(g),g2=Gn.reparer(copie(g),cfg);if(Gn.shaGenome(g2)!==s&&fautes.length<5)fautes.push(i+' : reparer non idempotent');
    if(g.A.braqueFort===+(g.A.braqueDoux+.1).toFixed(4)||g.A.jaugeCoupe===g.A.jaugeAllume||g.A.departMax===g.A.departMin)contraintes++;
    if(pop.length<40)pop.push(g);else pop[rng.entier(40)]=g;}
  vrai(fautes.length===0,fautes.join(' ; '));
  vrai(contraintes>0,'aucune contrainte n\'a joue en 10 000 mutations (le test ne la verifie pas)');
  console.log('       '+n+' mutations, '+contraintes+' genomes au ras d\'une contrainte');});

test('(c) reparer : un genome abime (hors bornes, NaN, -0, types, cles en trop ou manquantes) revient conforme',()=>{
  const rng=Gr.mulberry32(77);
  for(let i=0;i<2000;i++){
    const g=copie(T);
    for(const b of Gn.BORNES){const u=rng.suivant();
      if(u<.15)g.A[b.cle]=(rng.suivant()-.5)*4*(b.max-b.min+1);else if(u<.18)g.A[b.cle]=NaN;else if(u<.2)delete g.A[b.cle];else if(u<.22)g.A[b.cle]=-0;else if(u<.24)g.A[b.cle]=String(g.A[b.cle]);}
    g.A.intrus=3;g.WV=g.WV.map(x=>rng.suivant()<.1?(rng.suivant()-.5)*20:rng.suivant()<.02?-0:x);g.WS[3]=Infinity;
    const r=Gn.reparer(g,cfg);vrai(r===g,'reparer doit rendre le meme objet');
    const d=respecte(g);vrai(!d,'essai '+i+' : '+d);vrai(!('intrus' in g.A),'cle en trop gardee');}
  let leve=false;try{Gn.reparer({v:1,A:{},WV:[1,2],WS:[]},cfg);}catch(e){leve=/WV/.test(e.message);}vrai(leve,'une tete de mauvaise longueur doit lever');
  const g=copie(T);g.A.braqueDoux=.5;g.A.braqueFort=.2;g.A.jaugeAllume=.3;g.A.jaugeCoupe=.7;g.A.departMin=3.2;g.A.departMax=1.1;Gn.reparer(g,cfg);
  egal([g.A.braqueDoux,g.A.braqueFort,g.A.jaugeCoupe,g.A.departMax],[.5,.6,.3,3.2],'les trois contraintes');});

test('croiser : chaque gene vient d\'un parent, chaque tete entiere d\'un seul',()=>{
  const a=Gn.muter(T,Gr.mulberry32(1),{phase:'C',cfg,genes:30,sigma:.5}).genome,b=Gn.muter(T,Gr.mulberry32(2),{phase:'C',cfg,genes:30,sigma:.5}).genome;
  for(let s=0;s<50;s++){const c=Gn.croiser(a,b,Gr.mulberry32(s));
    for(const k of ['WV','WS'])vrai(JSON.stringify(c[k])===JSON.stringify(a[k])||JSON.stringify(c[k])===JSON.stringify(b[k]),'tete '+k+' melangee');
    for(const x of Gn.BORNES)if(!['braqueFort','braqueDoux','jaugeCoupe','departMax'].includes(x.cle))vrai(c.A[x.cle]===a.A[x.cle]||c.A[x.cle]===b.A[x.cle],x.cle);
    vrai(!respecte(c),'croise non conforme');}});

test('distance et distanceW2',()=>{
  vrai(Gn.distance(T,T)===0&&Gn.distanceW2(T,T)===0);
  const g=copie(T);g.A.marge=20;vrai(Math.abs(Gn.distance(T,g)-((20-10)/17)/Gn.BORNES.length)<1e-12,'distance '+Gn.distance(T,g));
  g.WV[216]=.24;vrai(Math.abs(Gn.distanceW2(T,g)-.01)<1e-12,'distanceW2 '+Gn.distanceW2(T,g));});

/* ---------- (d) ecrirePilote ---------- */
test('(d) ecrirePilote : le bloc du § 5.1, zero \\r, sha stable, balise unique exigee',()=>{
  const t=Gn.ecrirePilote(T),t2=Gn.ecrirePilote(copie(T));
  vrai(t.indexOf('\r')<0,'\\r dans le pilote');vrai(t===t2&&Gn.shaPilote(t)===Gn.shaPilote(t2),'sha instable');
  const crlf=fs.readFileSync(Gn.MODELE,'utf8').replace(/\n/g,'\r\n');vrai(Gn.ecrirePilote(T,{modele:crlf})===t,'un modele en CRLF doit donner le meme pilote');
  vrai(t.split('\n').filter(l=>l==='/*@GENOME@*/').length===0,'balise restee');
  const L=t.split('\n'),i=L.findIndex(l=>l.startsWith('const REGLAGES={'));
  vrai(L[i-1].startsWith('/*@GENOME@ debut : ecrit par ml/evolution/genome.js (ecrirePilote), genome '+Gn.idDe(T)),'en-tete du bloc');
  vrai(L[i]==='const REGLAGES={marge:10,bandeDecor:99,nitroDecor:1,margeCouloir:15,avance:0.3,glisse:0.12,glisseUrgence:0.3,ligneLoin:320,piecesLoin:180,capLigne:0.3,avanceCap:0.25,capAvance:0.25,braqueDoux:0.15,braqueFort:0.5,braqueNitro:0.7,margeAllumer:0.05,margeTenir:0,jaugeAllume:0.45,jaugeCoupe:0.25,capMax:0.35,bascule:10,tenirFacon:0.35,derive:0.3,raccVirage:0.2,raccGain:80,raccAxe:0.75,raccTmin:0.7,raccChute:120,raccTmax:3.6,raccAir:1.2,raccBord:5,raccAttente:1.6,raccCartes:{jade:0,grotte:0,canyon:0},raccJumeau:{ville:1,jade:1},raccRepos:1.5,figPlongeon:2.2,figTemps:1.5,figJauge:0.4,figEcart:0.55,dessousMax:0.8,dessousAveugle:1,dessousDecor:1,dessousNitro:0,dessousFuir:1,dessousPose:25,departMin:1.5,departMax:5.5,portailVol:1,volDemiTour:1,volRetour:0,volAvance:0.25,figMax:2,figDepuis:0.4,figHaut:15,retourOn:0,retMarge:8,retCap:0.8,retGain:0.8,retAvance:0.15,retourPrime:4,volMieux:0,lacheOn:0,lacheAvant:0.35,slalomOn:0,slalomCap:0.35,slalomDemi:0.45,slalomH:3,coupOn:0,coupDepuis:0.6,coupEcart:0.7,coupDuree:0.15,coupPoseMin:0.8,coupAxe:0.35,coupAir:0.8,coupJauge:0.35,coupPerte:10,coupDecor:0,relacheOn:0,relacheT:0.25,suitOn:0,suitDerive:0.3,suitMarge:0.25,fuirVite:0,bordOn:0,bordNitro:0.7,bordJauge:0.5,largeOn:0,largeHaut:4,largeT1:2.2,largeT2:1.8,largeAxe:0.5,largeAir:1.5,largeMax:3,libreOn:0,nitroLibreK:1.25,tenirLibre:0.05,volNitro:0,retours:[]};',
    'REGLAGES du temoin : '+L[i]);
  vrai(L[i+1]==='const G={axePoids:20,vTemps:3,vPortail:94,vLevre:80,vLibreBase:12,vLibrePente:2,vCourt:34,rAxe:250,rTemps:25,rPlane:40,rLourde:40,bVersRoute:3,bVersRoutePlane:2,bRien:1};','G');
  vrai(L[i+3]==='const CONTROLE_RAYONS=true;'&&L[i+4]==='/*@GENOME@ fin*/','fin du bloc');
  vrai(Gn.ecrirePilote(T,{controleRayons:false}).indexOf('const CONTROLE_RAYONS=false;')>0,'controleRayons:false');
  const m=fs.readFileSync(Gn.MODELE,'utf8');
  let leve=0;
  try{Gn.ecrirePilote(T,{modele:m.replace('/*@GENOME@*/\n','')});}catch(e){leve++;}
  try{Gn.ecrirePilote(T,{modele:m.replace('/*@GENOME@*/\n','/*@GENOME@*/\n/*@GENOME@*/\n')});}catch(e){leve++;}
  try{const g=copie(T);g.A.marge=99;Gn.ecrirePilote(g);}catch(e){leve++;}
  vrai(leve===3,'balise manquante, en double, genome hors borne : '+leve+' refus sur 3');
  const r=copie(T);r.A.retourOn=1;r.A.volRetourOn=1;r.A.volRetour=.6;r.A.raccCartes_canyon=1;r.A.raccJumeau_nuages=1;Gn.reparer(r,cfg);const tr=Gn.ecrirePilote(r);
  vrai(tr.indexOf('retours:[{marge:8,cap:0.8,gain:0.8,avance:0.15,rv:0.2,rm:0.24,rn:0.18}]};')>0,'la loi retour ecrite');
  vrai(tr.indexOf('volRetour:0.6,')>0&&tr.indexOf('raccCartes:{jade:0,grotte:0}')>0&&tr.indexOf('raccJumeau:{nuages:1,ville:1,jade:1}')>0,'volRetour, raccCartes, raccJumeau');});

test('(d) le pilote se charge dans le bac en moins de 20 ms, au nom « evolution », profil clavier',()=>{
  const t=Gn.ecrirePilote(T),ms=[];let P=null;
  for(let i=0;i<5;i++){const t0=process.hrtime.bigint();P=charger('evolution.js',{source:t});ms.push(Number(process.hrtime.bigint()-t0)/1e6);}
  console.log('       charger : '+ms.map(x=>x.toFixed(1)).join(', ')+' ms (le premier compte la compilation a froid)');
  vrai(Math.max(...ms)<20,'charger trop lent : '+ms.join(', ')+' ms');
  vrai(P.nom==='evolution','nom '+P.nom);vrai(P.profil&&P.profil.modele==='clavier','profil '+JSON.stringify(P.profil));
  const V=charger('pilote-voltige.js',{source:fs.readFileSync(Gn.VOLTIGE,'utf8')});vrai(P.profilSha===V.profilSha,'le profil differe de pilote-voltige');});

/* ---------- (e) le controle des rayons ---------- */
const EX=require(path.join(D,'..','ecurie','etude','selection-naturelle','inventaire','vue-exemple.json'));
const P0=charger('evolution.js',{source:Gn.ecrirePilote(T)});
const RG=copie(T);RG.A.retourOn=1;const PR=charger('evolution.js',{source:Gn.ecrirePilote(RG)});
const PS=charger('evolution.js',{source:Gn.ecrirePilote(T,{controleRayons:false})});
const VO=charger('pilote-voltige.js',{source:fs.readFileSync(Gn.VOLTIGE,'utf8')});
function vueVol(noms,cible){const v=copie(EX.vol.vue),R=v.vol.radar.rayons,par={};for(const r of R)par[r.m]=r;
  v.vol.radar.rayons=noms.map(n=>Object.assign({},par[n]||par.versRoute,{m:n}));v.vol.cible=cible===undefined?(noms.includes('viser')?EX.vol.vue.vol.cible:null):cible;
  if(noms.some(n=>/^retour/.test(n)))v.vol.retours=noms.filter(n=>/^retour/.test(n)).map(()=>({volant:.3,manche:0,nitro:false}));return v;}
function essai(P,vue){P.neuve();const e0=P.erreurs,o=P.decide(vue);return {o,erreur:P.erreurs>e0?P.derniere:null};}
const D10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
test('(e) la vue de vol de l\'inventaire (12 rayons) passe, et le pilote y decide comme pilote-voltige',()=>{
  const a=essai(P0,copie(EX.vol.vue)),b=essai(VO,copie(EX.vol.vue));
  vrai(!a.erreur,'erreur : '+a.erreur);egal(a.o,b.o,'ordre different de pilote-voltige');
  const s=essai(P0,copie(EX.sol.vue)),t=essai(VO,copie(EX.sol.vue));vrai(!s.erreur,'sol : '+s.erreur);egal(s.o,t.o,'ordre au sol different');});
test('(e) les formes conformes passent : 10 rayons, +viser/viserPlane, +retour0 (loi demandee), retour0 absent a la 1re vue',()=>{
  for(const [P,noms] of [[P0,D10],[P0,D10.concat(['viser','viserPlane'])],[PR,D10.concat(['retour0'])],[PR,D10.concat(['viser','viserPlane','retour0'])],[PR,D10]]){
    const r=essai(P,vueVol(noms));vrai(!r.erreur,noms.join(',')+' : '+r.erreur);vrai(r.o&&typeof r.o==='object','ordre vide pour '+noms.join(','));}
  const r=essai(PR,vueVol(D10.concat(['retour0'])));vrai(Array.isArray(r.o.retours)&&r.o.retours.length===1&&r.o.retours[0].marge===8,'la loi retour n\'est pas demandee : '+JSON.stringify(r.o));
  const r0=essai(P0,vueVol(D10));vrai(!('retours' in r0.o),'le temoin demande des lois retour');});
test('(e) les vues truquees levent « YEUX CHANGES » (et la decision est vide)',()=>{
  const echange=D10.slice();echange[2]='droite';echange[3]='gauche';
  const cas=[
    ['deux rayons echanges',P0,vueVol(echange.concat(['viser','viserPlane']))],
    ['un rayon manquant',P0,vueVol(D10.slice(0,9))],
    ['viser sans viserPlane',P0,vueVol(D10.concat(['viser']))],
    ['viserPlane avant viser',P0,vueVol(D10.concat(['viserPlane','viser']))],
    ['viser sans cible',P0,vueVol(D10.concat(['viser','viserPlane']),null)],
    ['une cible sans viser',P0,vueVol(D10,EX.vol.vue.vol.cible)],
    ['retour0 sans loi demandee',P0,vueVol(D10.concat(['retour0']))],
    ['retour1 sans retour0',PR,vueVol(D10.concat(['retour1']))],
    ['deux lois quand une est demandee',PR,vueVol(D10.concat(['retour0','retour1']))],
    ['un rayon inconnu a la fin',P0,vueVol(D10.concat(['viser','viserPlane','frein']))],
    ['un rayon inconnu au milieu',P0,vueVol(D10.slice(0,5).concat(['frein'],D10.slice(5)))],
    ['les 12 rayons de la specification dans le desordre',P0,vueVol(['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','viser','viserPlane','versRoute','versRoutePlane'])]];
  for(const [nom,P,v] of cas){const r=essai(P,v);vrai(r.erreur&&r.erreur.indexOf('YEUX CHANGES')===0,nom+' : pas d\'erreur ('+JSON.stringify(r.o)+')');vrai(r.o===null,nom+' : ordre non vide');}
  /* sans controle (controleRayons:false), la meme vue truquee ne leve rien */
  const r=essai(PS,vueVol(echange));vrai(!r.erreur,'controleRayons:false leve quand meme');
  /* un radar sans rayons (eventail en erreur) ou nul (portail) : pas de controle */
  const v1=copie(EX.vol.vue);v1.vol.radar={erreur:'x'};vrai(!essai(P0,v1).erreur,'radar en erreur');
  const v2=copie(EX.vol.vue);v2.vol.radar=null;vrai(!essai(P0,v2).erreur,'radar nul');});

console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates');
process.exit(rates?1:0);
