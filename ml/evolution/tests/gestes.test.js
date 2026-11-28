/* ===== LES TESTS DES CINQ GESTES (27/11/2026, tache « gestes » — Sacha : « donner a la selection de quoi trouver du neuf ») =====
   Sans course (quelques secondes) :
     (g1) la table : 21 genes de plus en fin de BORNES (6 drapeaux a 0, 15 reglages), naissances = les valeurs des enquetes, dans leurs bornes ;
     (g2) LA MIGRATION : un genome v:1 (celui de tests/etat-exemple/, complete aux 86 genes d'alors ; et 200 mutants ecrits par le genome.js d'avant,
          relu dans git) se lit, recoit les gestes a leur naissance, garde ses valeurs et SON IDENTIFIANT ; un v:1 abime n'est pas migre ;
     (g3) la mutation allume les drapeaux des gestes (le taux, mesure sur 20 000 mutations) ;
     (g4) le pilote de chaque geste allume se charge dans le bac (ni require, ni Math.random, ni Date), decide sans erreur et aussi vite ;
          drapeaux eteints, des reglages pousses a leurs bornes ne changent aucune decision ; le coup demande deux lois de plus et le controle des
          rayons les accepte (et pas une de plus).
   Avec --courses (lent : 18 courses de 120 s, 2 a la fois, un processus neuf chacune ; 15 a 25 minutes sur un PC charge ; le coup et le relache sur 4 graines hors decor) :
     (c1) drapeaux eteints, reglages des gestes aux bornes : la meme course que le temoin, au bit pres ;
     (c2) chaque geste allume : une autre course, zero erreur du cerveau, zero « YEUX CHANGES », et le chiffre qui montre qu'il fait ce qu'il dit.
   usage : node ml/evolution/tests/gestes.test.js [--courses] [--graines 910037,910074] [--graines-rares 910000,910074,910222,910259] [--tmax 120] [--travailleurs 2] [--pilotes temoin,coup,…] [--json f]   (code 0 si tout passe) */
'use strict';
const path=require('path'),fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
const D=path.join(__dirname,'..');
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};

/* ===== L'ENFANT D'UNE COURSE TRACEE (un processus neuf) : rend le bilan et les chiffres des gestes, calcules vue par vue ===== */
if(A[0]==='--enfant'){
  process.on('message',function(m){
    const {ouvrir,charger,course}=require(path.join(D,'..','bot','piloter.js'));
    const J=ouvrir({regime:'allege'}),P=charger('evolution.js',{source:m.source});
    const r=course(J,P,m.graine,{tmax:m.tmax,trace:true});
    let mes=null;try{mes=require(path.join(D,'..','bot','ressemblance.js')).mesuresPartie(r.partie)||null;}catch(e){mes=null;}
    const b=r.bilan,res={graine:m.graine,nom:m.nom,palier:b.palier,survie_s:b.duree_s,cause:b.cause,vols:b.vols,erreurs:b.erreurs,pannes:b.pannes,
      derniereErreur:b.derniereErreur==null?null:b.derniereErreur,cerveau_ms_moy:b.cerveau_ms_moy,empreinte:b.empreinte,empreinteVues:b.empreinteVues,
      empreinteTouches:crypto.createHash('sha1').update(JSON.stringify(r.touches)).digest('hex').slice(0,12),
      aller:mes&&mes.aller!=null?mes.aller:null,ondulation:mes&&mes.ondulation!=null?mes.ondulation:null,chiffres:chiffres(r.vues||[])};
    process.send(res,()=>process.exit(0));});
  return;
}
/* LES CHIFFRES DES GESTES, lus dans les vues et les ordres (rien du pilote : seulement ce qu'il a demande) */
function chiffres(V){
  const n0=x=>typeof x==='number'&&x-x===0;
  const poses=[];for(let i=1;i<V.length;i++)if(V[i-1].vue.mode==='vol'&&V[i].vue.mode==='sol')poses.push(V[i].vue.t);
  /* les vols : suites de vues de vol ; la derniere vue au sol avant chacun */
  const vols=[];let cur=null;
  for(let i=0;i<V.length;i++){const x=V[i];
    if(x.vue.mode==='vol'){if(!cur){cur={vues:[],avant:i>0&&V[i-1].vue.mode==='sol'?V[i-1]:null};vols.push(cur);}cur.vues.push(x);}else cur=null;}
  /* 1. les mains lachees : part des vues de vol a 0,35 s ou moins de la pose ou le volant demande vaut 0 */
  let nL=0,zL=0;
  for(const x of V){if(x.vue.mode!=='vol')continue;const tp=poses.find(t=>t>=x.vue.t);if(tp==null||tp-x.vue.t>.35)continue;nL++;if(!x.ordre||!n0(x.ordre.volant)||x.ordre.volant===0)zL++;}
  /* 2. le slalom : changements de cote de la ligne demandee (ligne − lat, au-dela de ±1 m) par seconde de sol, hors depart */
  let sens=0,chg=0,nSol=0;
  for(const x of V){if(x.vue.mode!=='sol'||x.vue.t<6||!x.ordre||!n0(x.ordre.ligne))continue;nSol++;const d=x.ordre.ligne-x.vue.lat;
    if(Math.abs(d)>1){const s=d>0?1:-1;if(sens&&s!==sens)chg++;sens=s;}}
  /* 3. le coup de nitro : COUPS BREFS demandes en vol (nitro demandee 1 ou 2 vues de suite, eteinte avant et apres, apres 0,3 s de vol), par vol
     d'au moins 1,5 s (le reacteur tenu des facons « plane » dure bien plus : ce n'est pas un coup) */
  let coups=0,volsLongs=0;
  for(const f of vols){const d=f.vues.length?f.vues[f.vues.length-1].vue.vol.t:0;if(!(d>=1.5))continue;volsLongs++;
    const N=f.vues.map(x=>!!(x.ordre&&x.ordre.nitro));
    for(let i=1;i<N.length;i++){if(N[i-1]||!N[i]||(+f.vues[i].vue.vol.t||0)<.3)continue;let j=i;while(j<N.length&&N[j])j++;if(j<N.length&&j-i<=2)coups++;}}
  /* 4. le relache : pour les vols decolles nitro demandee (au sol, dans les 0,3 s avant la premiere vue de vol), le temps de vol de la premiere vue
     sans nitro (mediane) */
  const rel=[];
  for(const f of vols){const t0=f.vues[0].vue.t,i0=V.indexOf(f.vues[0]);let tenue=false;
    for(let i=i0-1;i>=0&&V[i].vue.mode==='sol'&&t0-V[i].vue.t<.35;i--)if(V[i].ordre&&V[i].ordre.nitro)tenue=true;
    if(!tenue)continue;const q=f.vues.find(x=>x.ordre&&!x.ordre.nitro);if(q)rel.push(+q.vue.vol.t||0);}
  rel.sort((a,b)=>a-b);
  /* 5. la ligne qui suit : dans les 0,55 s apres une pose, part des vues ou la ligne demandee est du cote ou la caisse glisse (cap au-dela de 0,05) */
  let nS=0,oS=0;
  for(const x of V){if(x.vue.mode!=='sol'||!x.ordre||!n0(x.ordre.ligne))continue;const tp=poses.filter(t=>t<=x.vue.t).pop();if(tp==null||x.vue.t-tp>=.55)continue;
    const c=+x.vue.cap||0;if(Math.abs(c)<=.05)continue;nS++;if((x.ordre.ligne-x.vue.lat)*c>0)oS++;}
  return {poses:poses.length,vols:vols.length,
    lache:{vues:nL,part0:nL?+(zL/nL).toFixed(3):null},
    slalom:{vuesSol:nSol,changementsParS:nSol?+(chg/(nSol*.1)).toFixed(3):null},
    coup:{volsLongs,coups,parVol:volsLongs?+(coups/volsLongs).toFixed(3):null},
    relache:{vols:rel.length,mediane:rel.length?rel[rel.length>>1]:null},
    suit:{vues:nS,partCote:nS?+(oS/nS).toFixed(3):null}};
}

const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const cfg=C.lireConfig();
cfg.temoin='c0025';   /* (28/11, portage) les gestes sont decrits sur le temoin pilote-voltige, quel que soit le temoin de config.json */
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}
function test(nom,f){try{const d=f();bilan(nom,true,d);}catch(e){bilan(nom,false,String(e&&e.stack||e));}}
function vrai(x,m){if(!x)throw new Error(m||'faux');}
const copie=x=>JSON.parse(JSON.stringify(x));
const T=Gn.genomeTemoin(cfg);
const DRAPEAUX={lache:'lacheOn',slalom:'slalomOn',coup:'coupOn',relache:'relacheOn',suit:'suitOn'};
const REGLAGES_DE={lache:['lacheAvant'],slalom:['slalomCap','slalomDemi','slalomH'],
  coup:['coupDepuis','coupEcart','coupDuree','coupPoseMin','coupAxe','coupAir','coupJauge','coupPerte','coupDecor'],relache:['relacheT'],suit:['suitDerive','suitMarge']};
function avec(geste){const g=copie(T);g.A[DRAPEAUX[geste]]=1;return Gn.reparer(g,cfg);}
/* drapeaux eteints, chaque reglage des gestes pousse a une borne (min ou max, en alternance) : doit conduire comme le temoin */
function inerte(){const g=copie(T);let i=0;for(const b of Gn.GESTES)if(b.type==='reel'||b.cle==='coupDecor'){g.A[b.cle]=b.cle==='coupDecor'?1:(i++%2?b.min:b.max);}return Gn.reparer(g,cfg);}

/* ===== (g1) LA TABLE ===== */
test('(g1) 21 genes de plus, en fin de BORNES : 6 drapeaux a 0, 15 reglages, naissances dans leurs bornes ; le temoin les a a leur naissance',()=>{
  vrai(Gn.VERSION===4&&Gn.BORNES.length===129,'version '+Gn.VERSION+', '+Gn.BORNES.length+' genes');   /* (28/11, portage) les 14 genes du portage viennent apres les gestes ; (28/11, lot « genes v4 ») v:4, 129 genes */
  vrai(Gn.GESTES.length===21,'gestes '+Gn.GESTES.length);
  const fin=Gn.BORNES.slice(86,107).map(b=>b.cle);vrai(JSON.stringify(fin)===JSON.stringify(Gn.GESTES.map(b=>b.cle)),'les gestes ne sont pas juste apres les 86 genes v:1');
  vrai(JSON.stringify(Gn.CLES_V1)===JSON.stringify(Gn.BORNES.slice(0,86).map(b=>b.cle)),'les 86 genes v:1 ont bouge');
  const dr=Gn.GESTES.filter(b=>b.type==='drapeau'),re=Gn.GESTES.filter(b=>b.type==='reel');
  vrai(dr.length===6&&re.length===15,dr.length+' drapeaux, '+re.length+' reels');
  for(const b of dr)vrai(b.naissance===0,b.cle+' naissance '+b.naissance);
  for(const b of Gn.GESTES)vrai(b.naissance>=b.min&&b.naissance<=b.max&&b.ou==='R',b.cle);
  for(const k of Object.values(DRAPEAUX))vrai(Gn.GESTES.some(b=>b.cle===k&&b.type==='drapeau'),k);
  for(const b of Gn.GESTES)vrai(T.A[b.cle]===b.naissance,'temoin : '+b.cle+' '+T.A[b.cle]);
  /* slalomDemi : 0,45 et non 0,42 (relecture du 27/11 : le verificateur, PROPOSITIONS.md l.239, « garder slalomDemi a 0,45 au moins ») */
  const nais={lacheAvant:.35,slalomCap:.35,slalomDemi:.45,slalomH:3,coupDepuis:.6,coupEcart:.7,coupDuree:.15,coupPoseMin:.8,coupAxe:.35,coupAir:.8,coupJauge:.35,relacheT:.25,suitDerive:.3,suitMarge:.25};
  for(const k in nais)vrai(T.A[k]===nais[k],'naissance de '+k+' : '+T.A[k]+' (l\'enquete propose '+nais[k]+')');
  return Gn.BORNES.length+' genes, '+Gn.CONTINUS.length+' reels ; drapeaux '+dr.map(b=>b.cle).join(', ');});

/* ===== (g2) LA MIGRATION ===== */
/* le genome.js d'avant les gestes, relu dans git, pour ecrire de vrais genomes v:1 ; null si git ne le donne pas.
   (28/11/2026, lot « genes v4 ») EPINGLE au commit e2ea8d2c9 (v:1, 86 genes) au lieu de HEAD, qui avance : la preuve ne saute plus (un SAUTE est un echec) */
const COMMIT_V1='e2ea8d2c9';
function genomeV1(){
  try{const t=cp.execFileSync('git',['show',COMMIT_V1+':ml/evolution/genome.js'],{cwd:D,encoding:'utf8',stdio:['ignore','pipe','ignore']});
    if(t.indexOf("if(BORNES.length!==86")<0)return null;   /* ce n'est pas le genome.js v:1 : les tests (g2) echouent */
    const dos=path.join(D,'essais','gestes');fs.mkdirSync(dos,{recursive:true});
    const f=path.join(dos,'genome-v1.js');
    C.ecrireAtomique(f,t.replace(/\r\n/g,'\n').replace("require('./commun')","require('../../commun')").replace("require('./graines')","require('../../graines')"));
    delete require.cache[f];return require(f);}catch(e){return null;}}
const V1=genomeV1();
test('(g2) un genome v:1 de tests/etat-exemple/ se lit : gestes a leur naissance, drapeaux a 0, valeurs et identifiant inchanges',()=>{
  const pop=JSON.parse(fs.readFileSync(path.join(__dirname,'etat-exemple','population.json'),'utf8'));
  /* les chiffres de l'exemple sont inventes (fabriquer-etat-exemple.js) : on prend le premier mutant dont les genes tombent dans leurs bornes */
  const dans=v=>Object.keys(v.genome.A).every(k=>{const b=Gn.BORNES.find(x=>x.cle===k);const x=v.genome.A[k];return b&&x>=b.min&&x<=b.max&&x===+(+x).toFixed(4);});
  const ex=pop.vivants.find(v=>v.origine!=='temoin'&&v.mutes&&v.mutes.length&&dans(v));
  vrai(ex,'aucun mutant de l\'exemple dans les bornes');
  vrai(ex.genome.v===1,'l\'exemple n\'est pas v:1');
  /* l'exemple ne porte que 12 genes et des tetes vides (le tableau ne lit pas le reste) : on le complete aux 86 genes d'un vrai v:1 */
  const base=V1?V1.genomeTemoin(cfg):copie(T),A={};
  for(const k of Gn.CLES_V1)A[k]=k in ex.genome.A?ex.genome.A[k]:base.A[k];
  const g1={v:1,A:A,WV:base.WV.slice(),WS:base.WS.slice()};
  const avant=copie(g1),idAvant=V1?V1.idDe(copie(g1)):null;
  const d=Gn.valider(g1,cfg);vrai(d===null,'refuse : '+d);
  vrai(g1.v===Gn.VERSION&&Object.keys(g1.A).length===Gn.BORNES.length,'pas migre : v '+g1.v+', '+Object.keys(g1.A).length+' genes');
  for(const b of Gn.PORTAGE)vrai(g1.A[b.cle]===b.naissance,'portage : '+b.cle+' '+g1.A[b.cle]);
  for(const k of Gn.CLES_V1)vrai(g1.A[k]===avant.A[k],'valeur changee : '+k);
  for(const b of Gn.GESTES)vrai(g1.A[b.cle]===b.naissance,b.cle+' '+g1.A[b.cle]);
  vrai(JSON.stringify(g1.WV)===JSON.stringify(avant.WV)&&JSON.stringify(g1.WS)===JSON.stringify(avant.WS),'tetes changees');
  const idApres=Gn.idDe(g1),idSansToucher=Gn.idDe(copie(avant));
  vrai(idApres===idSansToucher,'id du v:1 lu sans migrer ('+idSansToucher+') et apres ('+idApres+')');
  vrai(V1,'git ne donne pas le genome.js v:1 du commit '+COMMIT_V1);
  vrai(idApres===idAvant,'identifiant change par la migration : '+idAvant+' -> '+idApres);
  const t=Gn.ecrirePilote(g1,{cfg});vrai(/lacheOn:0,.*slalomOn:0,.*coupOn:0,.*relacheOn:0,.*suitOn:0,/.test(t),'gestes allumes dans le pilote migre');
  charger('evolution.js',{source:t});
  /* un genome v:1 non conforme (une cle manque) n'est pas migre : valider dit son defaut */
  const b1=copie(avant);delete b1.A.marge;vrai(Gn.valider(b1,cfg)!==null&&b1.v===1,'un v:1 abime est passe');
  /* allumer un geste change l'identifiant */
  const on=copie(g1);on.A.coupOn=1;vrai(Gn.idDe(on)!==idApres,'un geste allume garde l\'identifiant');
  return 'exemple '+ex.id+' ('+Object.keys(ex.genome.A).length+' genes) ; id '+idApres+(idAvant?' = celui du genome.js d\'avant':' (genome.js d\'avant introuvable dans git : comparaison sautee)');});
test('(g2) 200 mutants ecrits par le genome.js d\'avant (git e2ea8d2c9) : lus, memes identifiants, mutables',()=>{
  vrai(V1,'git ne donne pas le genome.js v:1 du commit '+COMMIT_V1);
  const rng=Gr.mulberry32(4242),T1=V1.genomeTemoin(cfg);let g=T1,n=0;
  vrai(V1.idDe(T1)===Gn.idDe(T),'le temoin a change d\'identifiant : '+V1.idDe(T1)+' -> '+Gn.idDe(T));
  for(let i=0;i<200;i++){
    g=V1.muter(i%7?g:T1,rng,{phase:['A','B','C'][i%3],cfg}).genome;
    const id1=V1.idDe(g),h=copie(g);
    const d=Gn.valider(h,cfg);vrai(d===null,'mutant '+i+' refuse : '+d);
    vrai(Gn.idDe(h)===id1,'mutant '+i+' : identifiant '+id1+' -> '+Gn.idDe(h));
    const e=Gn.muter(h,rng,{phase:'C',cfg}).genome;vrai(Gn.valider(e,cfg)===null,'enfant du mutant '+i);
    Gn.ecrirePilote(h,{cfg});n++;}
  return n+' mutants v:1 : valides, memes identifiants, un enfant chacun';});

/* ===== (g3) LA MUTATION ALLUME LES DRAPEAUX ===== */
test('(g3) la mutation allume chaque drapeau des gestes (taux par enfant, 20 000 mutations du temoin)',()=>{
  const rng=Gr.mulberry32(20261127),n=20000,c={};for(const k of Object.values(DRAPEAUX))c[k]=0;
  for(let i=0;i<n;i++){const g=Gn.muter(T,rng,{phase:'A',cfg}).genome;for(const k in c)if(g.A[k]===1)c[k]++;}
  const p=+cfg.pDrapeau,lignes=[];
  for(const k in c){const t=c[k]/n;vrai(Math.abs(t-p)<.006,k+' : '+t+' (pDrapeau '+p+')');lignes.push(k+' '+(100*t).toFixed(2)+' %');}
  const parGen=1-Math.pow(1-p,cfg.lambda);
  return lignes.join(', ')+' ; pDrapeau '+p+' : sur '+cfg.lambda+' naissances, '+(100*parGen).toFixed(0)+' % des generations ont au moins un enfant qui allume un geste donne';});

/* ===== (g4) LE PILOTE DANS LE BAC ===== */
const EX=require(path.join(D,'..','ecurie','etude','selection-naturelle','inventaire','vue-exemple.json'));
function essai(P,vue){P.neuve();const e0=P.erreurs,o=P.decide(vue);return {o,erreur:P.erreurs>e0?P.derniere:null};}
function vueVol(noms){const v=copie(EX.vol.vue),R=v.vol.radar.rayons,par={};for(const r of R)par[r.m]=r;
  v.vol.radar.rayons=noms.map(n=>Object.assign({},par[n]||par.versRoute,{m:n}));v.vol.cible=noms.includes('viser')?EX.vol.vue.vol.cible:null;
  if(noms.some(n=>/^retour/.test(n)))v.vol.retours=noms.filter(n=>/^retour/.test(n)).map(()=>({volant:.3,manche:0,nitro:false}));return v;}
const D10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
test('(g4) chaque geste allume : le pilote se charge (rien d\'interdit), decide sans erreur, aussi vite que le temoin',()=>{
  const lignes=[];
  const PT=charger('evolution.js',{source:Gn.ecrirePilote(T,{cfg})});
  const chrono=P=>{const vs=[copie(EX.sol.vue),copie(EX.vol.vue)];let ms=0,k=0;for(let i=0;i<400;i++){const v=copie(vs[i%2]);P.neuve();const t0=process.hrtime.bigint();P.decide(v);ms+=Number(process.hrtime.bigint()-t0)/1e6;k++;}return ms/k;};
  const mT=chrono(PT);
  for(const geste of Object.keys(DRAPEAUX).concat(['tous'])){
    let g;if(geste==='tous'){g=copie(T);for(const k of Object.values(DRAPEAUX))g.A[k]=1;Gn.reparer(g,cfg);}else g=avec(geste);
    const t=Gn.ecrirePilote(g,{cfg}),code=t.replace(/\/\*[\s\S]*?\*\//g,'');   /* les commentaires nomment ce qui est interdit : on lit le code seul */
    for(const mot of [/\brequire\s*\(/,/Math\.random/,/\bDate\b/,/\beval\s*\(/,/\bFunction\s*\(/])vrai(!mot.test(code),geste+' : '+mot);
    const P=charger('evolution.js',{source:t});
    const s=essai(P,copie(EX.sol.vue)),v=essai(P,copie(EX.vol.vue));vrai(!s.erreur&&!v.erreur,geste+' : '+(s.erreur||v.erreur));
    vrai(s.o&&v.o,geste+' : ordre vide');
    const ms=chrono(P);vrai(ms<1,geste+' : '+ms.toFixed(4)+' ms par decision');
    lignes.push(geste+' '+ms.toFixed(4)+' ms');}
  return 'temoin '+mT.toFixed(4)+' ms par decision ; '+lignes.join(' ; ');});
test('(g4) drapeaux eteints : des reglages des gestes pousses a leurs bornes ne changent aucune decision (vues de l\'inventaire)',()=>{
  const PT=charger('evolution.js',{source:Gn.ecrirePilote(T,{cfg})}),PI=charger('evolution.js',{source:Gn.ecrirePilote(inerte(),{cfg})});
  const vues=[copie(EX.sol.vue),copie(EX.vol.vue),vueVol(D10),vueVol(D10.concat(['viser','viserPlane']))];
  for(let i=0;i<vues.length;i++){const a=essai(PT,copie(vues[i])),b=essai(PI,copie(vues[i]));vrai(JSON.stringify(a)===JSON.stringify(b),'vue '+i+' : '+JSON.stringify(a.o)+' contre '+JSON.stringify(b.o));}
  /* une suite de vues (la memoire compte) : sol, vol, vol, sol */
  PT.neuve();PI.neuve();const suite=[EX.sol.vue,EX.vol.vue,EX.vol.vue,EX.sol.vue].map(copie);
  for(let i=0;i<suite.length;i++){const v=copie(suite[i]);v.t=+(10+i*.1).toFixed(2);const a=PT.decide(copie(v)),b=PI.decide(copie(v));vrai(JSON.stringify(a)===JSON.stringify(b),'suite '+i);}
  return vues.length+' vues et une suite de 4';});
test('(g4) le coup demande deux lois « retour » de plus ; le controle des rayons accepte retour0, retour1 et refuse un troisieme',()=>{
  const P=charger('evolution.js',{source:Gn.ecrirePilote(avec('coup'),{cfg})});
  const r=essai(P,vueVol(D10));vrai(!r.erreur,r.erreur);vrai(Array.isArray(r.o.retours)&&r.o.retours.length===2&&!r.o.retours[0].coup&&r.o.retours[1].coup===.2,'lois demandees : '+JSON.stringify(r.o.retours));
  vrai(!essai(P,vueVol(D10.concat(['retour0','retour1']))).erreur,'retour0, retour1 refuses');
  vrai(!essai(P,vueVol(D10.concat(['viser','viserPlane','retour0','retour1']))).erreur,'viser + retour0, retour1 refuses');
  const e=essai(P,vueVol(D10.concat(['retour0','retour1','retour2'])));vrai(e.erreur&&e.erreur.indexOf('YEUX CHANGES')===0,'retour2 accepte');
  /* avec la loi « retour » du pilote ET le coup : trois lois, la sienne d'abord */
  const g=avec('coup');g.A.retourOn=1;Gn.reparer(g,cfg);const P3=charger('evolution.js',{source:Gn.ecrirePilote(g,{cfg})});
  const r3=essai(P3,vueVol(D10.concat(['retour0','retour1','retour2'])));vrai(!r3.erreur,r3.erreur);
  vrai(r3.o.retours.length===3&&r3.o.retours[0].marge===8&&r3.o.retours[2].coup===.2,'trois lois : '+JSON.stringify(r3.o.retours));
  /* coup eteint : aucune loi demandee (comme le temoin) */
  const PT=charger('evolution.js',{source:Gn.ecrirePilote(T,{cfg})});vrai(!('retours' in essai(PT,vueVol(D10)).o),'le temoin demande des lois');
  return 'coup : 2 lois ; coup + retourOn : 3 lois';});

/* ===== (r) LA RELECTURE DU 27/11/2026 : un test par defaut corrige ===== */
/* (r1) le coup ne se donne pas pendant une nitro deja demandee (le relache, une facon a reacteur) ni a la vue qui suit : le jeu ne donne le coup qu'au
   RE-APPUI, apres un lacher. Avant la correction, avec relacheOn et coupOn, le coup partait pendant le relache (gaspille, sans effet en jeu) et
   coupEcart bloquait le vrai coup qui suivait. */
function vueCoup(t,ft){const v=copie(EX.vol.vue);v.t=t;v.vol.t=ft;v.carte='nuages';v.nitro=1;v.reserve=1;v.vol.cible=null;
  const R=v.vol.radar.rayons.filter(r=>r.m!=='viser'&&r.m!=='viserPlane');
  for(const r of R)if(r.m==='versRoute'){r.issue='pose';r.t=2;r.axe=.1;r.propre=true;}
  R.push({m:'retour0',issue:'pose',t:1.6,axe:.1,propre:true,gain:100,lat:0},{m:'retour1',issue:'pose',t:1.5,axe:.1,propre:true,gain:100,lat:0});
  v.vol.radar.rayons=R;v.vol.retours=[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true}];return v;}
test('(r1) coup + relache : pas de coup pendant la nitro tenue ni a la vue qui suit ; le coup part a la vue d\'apres (re-appui)',()=>{
  const g=avec('coup');g.A.relacheOn=1;g.A.relacheT=.45;g.A.coupDepuis=.35;Gn.reparer(g,cfg);
  const P=charger('evolution.js',{source:Gn.ecrirePilote(g,{cfg})});P.neuve();
  const sol=copie(EX.sol.vue);sol.t=8.1;vrai(P.decide(copie(sol)).nitro===true,'la vue au sol ne demande pas la nitro');
  const N=[[8.2,.38],[8.3,.48],[8.4,.58],[8.5,.68],[8.6,.78]].map(([t,ft])=>!!P.decide(vueCoup(t,ft)).nitro);
  vrai(P.erreurs===0,'erreur du cerveau : '+P.derniere);
  /* 8,2 : le relache tient la nitro ; 8,3 : lachee (le jeu rearme le coup) ; 8,4 et 8,5 : le coup (0,15 s) ; 8,6 : lache */
  vrai(JSON.stringify(N)===JSON.stringify([true,false,true,true,false]),'nitro demandee '+JSON.stringify(N)+' (attendu true,false,true,true,false)');
  return 'nitro vue par vue : '+N.join(', ');});
/* (r2) le croisement d'un genome v:1 et d'un v:2 ; un genome hors bornes refuse ; reparer le ramene */
test('(r2) croiser un v:1 et un genome a gestes : un genome conforme (v:3), gestes de l\'un ou a la naissance ; valider refuse un geste hors borne',()=>{
  const g1={v:1,A:{},WV:T.WV.slice(),WS:T.WS.slice()};for(const k of Gn.CLES_V1)g1.A[k]=T.A[k];
  const g2=copie(T);g2.A.coupOn=1;g2.A.slalomCap=.5;g2.A.suitOn=1;
  const rng=Gr.mulberry32(99);let vu1=0,vu0=0;
  for(let i=0;i<200;i++){const e=Gn.croiser(copie(g1),copie(g2),rng);vrai(Gn.valider(e,cfg)===null,'enfant '+i+' : '+Gn.valider(e,cfg));
    vrai(e.v===Gn.VERSION,'v '+e.v);vrai(e.A.coupOn===0||e.A.coupOn===1,'coupOn '+e.A.coupOn);vrai(e.A.slalomCap===.35||e.A.slalomCap===.5,'slalomCap '+e.A.slalomCap);
    if(e.A.coupOn)vu1++;else vu0++;}
  vrai(vu1>50&&vu0>50,'le drapeau ne vient pas des deux parents : '+vu1+' / '+vu0);
  const h=copie(T);h.A.lacheAvant=.9;vrai(/lacheAvant.*hors borne/.test(String(Gn.valider(h,cfg))),'lacheAvant 0,9 accepte');
  const d=copie(T);d.A.slalomOn=2;vrai(/slalomOn.*hors borne/.test(String(Gn.valider(d,cfg))),'slalomOn 2 accepte');
  const q=copie(T);q.A.coupPerte=10.12345;vrai(/coupPerte.*arrondi/.test(String(Gn.valider(q,cfg))),'coupPerte non arrondi accepte');
  Gn.reparer(h,cfg);Gn.reparer(d,cfg);vrai(h.A.lacheAvant===.5&&d.A.slalomOn===1&&Gn.valider(h,cfg)===null,'reparer');
  return '200 enfants : coupOn '+vu1+' du v:2, '+vu0+' du v:1 (naissance)';});
/* (r3) la mutation : sur 10 000 naissances simulees (une population de 20, croisement 3 fois sur 10), chaque drapeau s'allume ; meme graine = memes
   enfants, et une reprise (etat du hasard relu a mi-chemin) aussi */
test('(r3) 10 000 naissances simulees : chaque geste s\'allume (taux par naissance) ; la reprise reste deterministe',()=>{
  const FL=Object.values(DRAPEAUX);
  function simuler(graine,n,coupe){let rng=Gr.mulberry32(graine>>>0);const pop=[T],ids=[],al={};for(const k of FL)al[k]=0;
    for(let i=0;i<n;i++){if(coupe&&i===coupe)rng=Gr.mulberry32(rng.etat());
      const p1=pop[rng.entier(pop.length)];let g;
      if(rng.suivant()<cfg.pCroisement){const p2=pop[rng.entier(pop.length)];g=Gn.muter(Gn.croiser(p1,p2,rng),rng,{phase:'A',cfg}).genome;}
      else g=Gn.muter(p1,rng,{phase:'A',cfg}).genome;
      for(const k of FL)if(g.A[k]===1&&p1.A[k]===0)al[k]++;
      ids.push(Gn.idDe(g));if(pop.length<20)pop.push(g);else pop[rng.entier(20)]=g;}
    return {al,ids:ids.join()};}
  const n=+opt('naissances',10000),a=simuler(20261127,n),b=simuler(20261127,n),c=simuler(20261127,n,n>>1);
  vrai(a.ids===b.ids,'meme graine, autres enfants');vrai(a.ids===c.ids,'la reprise change les enfants');
  for(const k of FL)vrai(a.al[k]/n>.015,k+' : '+a.al[k]+' allumages sur '+n);
  return FL.map(k=>k+' '+(100*a.al[k]/n).toFixed(2)+' %').join(', ')+' des naissances (parent eteint -> enfant allume)';});

/* ===== (c) LES COURSES (--courses) ===== */
function jouer(taches,travailleurs){
  return new Promise(fin=>{
    const res=new Array(taches.length);let i=0,vivants=0,finies=0;
    const suivante=()=>{
      while(vivants<travailleurs&&i<taches.length){const k=i++,t=taches[k];vivants++;
        const c=cp.fork(__filename,['--enfant'],{silent:true,windowsHide:true});let err='',r=null;
        c.stderr.on('data',d=>{err=(err+d).slice(-800);});c.stdout.resume();
        c.on('message',x=>{r=x;});
        c.on('exit',code=>{res[k]=r||{nom:t.nom,graine:t.graine,erreurs:1,derniereErreur:'processus fini sans resultat (code '+code+') '+err};vivants--;finies++;
          console.log('       course '+finies+'/'+taches.length+' : '+t.nom+' '+t.graine+(r?' palier '+r.palier+', '+r.survie_s+' s, '+r.vols+' vols, '+r.cerveau_ms_moy+' ms':' ECHEC'));
          if(finies===taches.length)fin(res);else suivante();});
        c.send({source:t.source,graine:t.graine,tmax:t.tmax,nom:t.nom});}};
    suivante();});
}
async function courses(){
  /* les graines : 910037 (grotte, puis jade) et 910074 (nuages, puis jade) pour tous ; le coup (pas de coup sur les maps a decor : coupDecor 0) et le
     relache (il ne joue qu'aux decollages nitro tenue) sur quatre graines qui partent hors decor : 910000 (espace), 910074, 910222 (nuages), 910259 (espace) */
  const liste=(k,d)=>String(opt(k,d)).split(',').map(Number);
  const graines=liste('graines','910037,910074'),grainesRares=liste('graines-rares','910000,910074,910222,910259');
  const tmax=+opt('tmax',120),trav=Math.max(1,Math.min(2,+opt('travailleurs',2)));
  const pilotes={temoin:T,inerte:inerte()};for(const g of Object.keys(DRAPEAUX))pilotes[g]=avec(g);
  const grainesDe=nom=>nom==='coup'||nom==='relache'?grainesRares:graines;
  const choisis=opt('pilotes',null)?String(opt('pilotes')).split(','):Object.keys(pilotes);
  for(const n of choisis)if(!pilotes[n])throw new Error('pilote inconnu : '+n);
  const voulu={};for(const n of choisis)if(n!=='temoin')for(const g of grainesDe(n)){voulu[n+'|'+g]=1;voulu['temoin|'+g]=1;}
  if(choisis.includes('temoin'))for(const g of graines)voulu['temoin|'+g]=1;
  const taches=[];
  for(const nom of ['temoin'].concat(Object.keys(pilotes).filter(n=>n!=='temoin')))for(const g of [...new Set(graines.concat(grainesRares))])
    if(voulu[nom+'|'+g])taches.push({nom,graine:g,tmax,source:Gn.ecrirePilote(pilotes[nom],{cfg})});
  console.log('       '+taches.length+' courses de '+tmax+' s ('+choisis.join(', ')+'), '+trav+' a la fois…');
  const t0=Date.now(),R=await jouer(taches,trav),par={};
  for(const r of R)par[r.nom+'|'+r.graine]=r;
  const E3=r=>[r.empreinte,r.empreinteVues,r.empreinteTouches].join(' ');
  const pareil=(a,b)=>!!(a&&b&&a.empreinte)&&E3(a)===E3(b);
  const sain=r=>r&&!r.erreurs&&!r.pannes&&!(r.derniereErreur&&String(r.derniereErreur).indexOf('YEUX CHANGES')>=0)&&!!r.empreinte;
  /* (c1) */
  if(choisis.includes('inerte')){const G=grainesDe('inerte'),ok=G.every(g=>pareil(par['inerte|'+g],par['temoin|'+g])&&sain(par['inerte|'+g]));
    bilan('(c1) drapeaux eteints, reglages des gestes a leurs bornes : la course du temoin au bit pres',ok,
      G.map(g=>{const a=par['inerte|'+g],t=par['temoin|'+g];return g+' : '+(pareil(a,t)?'IDENTIQUE ':'DIFFERENTE ')+E3(a)+' (temoin '+E3(t)+')';}).join('\n'));}
  /* (c2) : chaque geste, avec son chiffre */
  const C2={
    lache:{dit:'part des vues de vol a 0,35 s ou moins de la pose ou le volant demande vaut 0',lire:r=>r.chiffres.lache.part0,n:r=>r.chiffres.lache.vues+' vues'},
    slalom:{dit:'changements de cote de la ligne demandee par seconde de sol (et l\'aller des mesures)',lire:r=>r.chiffres.slalom.changementsParS,n:r=>'aller '+(r.aller==null?null:+r.aller.toFixed(3))+' s'},
    coup:{dit:'coups brefs de nitro (1 ou 2 vues) demandes en vol, par vol de 1,5 s et plus',somme:r=>r.chiffres.coup.coups,lire:r=>r.chiffres.coup.parVol,n:r=>r.chiffres.coup.coups+' coups / '+r.chiffres.coup.volsLongs+' vols'},
    relache:{dit:'temps de vol (mediane) de la premiere vue sans nitro, pour les vols decolles nitro tenue',lire:r=>r.chiffres.relache.mediane,n:r=>r.chiffres.relache.vols+' vols'},
    suit:{dit:'dans les 0,55 s apres une pose, part des vues ou la ligne demandee est du cote ou la caisse glisse',lire:r=>r.chiffres.suit.partCote,n:r=>r.chiffres.suit.vues+' vues'}};
  for(const g of Object.keys(DRAPEAUX)){if(!choisis.includes(g))continue;
    const c=C2[g],G=grainesDe(g);let diff=0,sains=0,mieux=0,mesure=0,sa=0,st=0;
    const det=G.map(gr=>{const a=par[g+'|'+gr],t=par['temoin|'+gr];if(!pareil(a,t))diff++;if(sain(a))sains++;
      const x=a&&a.chiffres?c.lire(a):null,y=t&&t.chiffres?c.lire(t):null;
      if(x!=null&&y!=null){mesure++;if(x>y)mieux++;}
      if(c.somme&&a&&t&&a.chiffres&&t.chiffres){sa+=c.somme(a);st+=c.somme(t);}
      return gr+' : '+(pareil(a,t)?'identique ':'DIFFERENTE ')+(a?'palier '+a.palier+', '+a.survie_s+' s, '+a.cause+', '+a.vols+' vols, '+a.cerveau_ms_moy+' ms, erreurs '+(a.erreurs|0)+(a.derniereErreur?' « '+a.derniereErreur+' »':''):'(rien)')+
        '\n         chiffre : '+x+' (temoin '+y+') — '+(a&&a.chiffres?c.n(a):'')+' / temoin '+(t&&t.chiffres?c.n(t):'');});
    /* le geste doit changer la course sur au moins une graine et ne rien casser ; son chiffre doit monter partout ou il se mesure (le coup : en tout,
       sur ses graines, plus de coups brefs que le temoin — un geste rare ne joue pas sur chaque course) */
    const chiffreOk=c.somme?sa>st:(mesure>0&&mieux===mesure);
    bilan('(c2) '+g+' allume : une autre course, sans erreur ni YEUX CHANGES ; '+c.dit,diff>0&&sains===G.length&&chiffreOk,
      det.join('\n')+(c.somme?'\nen tout : '+sa+' coups brefs contre '+st+' pour le temoin':''));}
  /* le temps de decision : sous 1 ms, et pas plus de 15 % au-dessus du temoin sur les memes graines */
  {const moy=n=>{const L=R.filter(r=>r.nom===n);return L.reduce((s,r)=>s+(+r.cerveau_ms_moy||0),0)/Math.max(1,L.length);};
    const noms=[...new Set(R.map(r=>r.nom))],lignes=[];let ok=true;
    for(const n of noms){const L=R.filter(r=>r.nom===n);let rap=0;for(const r of L){const t=par['temoin|'+r.graine];rap+=(+r.cerveau_ms_moy||0)/Math.max(1e-6,+t.cerveau_ms_moy||0);}rap/=L.length;
      if(!(moy(n)<1&&rap<1.15))ok=false;lignes.push(n+' '+moy(n).toFixed(3)+' ms (x'+rap.toFixed(3)+' du temoin)');}
    bilan('(c2) le temps de decision reste sous 1 ms et au plus 15 % au-dessus du temoin',ok,lignes.join(' ; '));}
  console.log('       courses jouees en '+Math.round((Date.now()-t0)/1000)+' s');
  if(opt('json',null))C.ecrireAtomique(path.resolve(opt('json')),JSON.stringify(R,null,1)+'\n');
}

(async function(){
  const t0=Date.now();
  if(A.includes('--courses'))await courses();
  else console.log('       (sans --courses : les essais en course ne sont pas joues)');
  console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates ('+Math.round((Date.now()-t0)/1000)+' s)');
  process.exit(rates?1:0);
})().catch(e=>{console.log('ECHEC  le test a leve : '+String(e&&e.stack||e));process.exit(1);});
