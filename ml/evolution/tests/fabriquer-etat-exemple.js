'use strict';
/* ===== UN ETAT D'EXEMPLE POUR LE TABLEAU (27/11/2026, Sacha : « une population de pilotes evolue seule sur un PC ») =====
   evoluer.js n'existe pas encore : ce script INVENTE 30 generations conformes a INTERFACES.md § 3 (population.json, generations.jsonl,
   validations.jsonl, morts.jsonl, coffre.jsonl, un courses-AAAA-SS.jsonl, verrou.json) dans tests/etat-exemple/. Les chiffres sont faux mais
   plausibles ; tout est deterministe (mulberry32 a graine fixe, une date de depart fixe). Une nouvelle epoque a la generation 13 (yeux.js),
   l'economie 12 -> 8 graines a la 18, un sacre a la 20, la phase B a la 25.
   Ligne de commande : node ml/evolution/tests/fabriquer-etat-exemple.js [dossier]   (defaut : tests/etat-exemple) */
const fs=require('fs'),path=require('path'),crypto=require('crypto');

const DOSSIER=process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'etat-exemple');
function mulberry32(etat){let a=etat|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const rnd=mulberry32(20261127),normal=()=>Math.sqrt(-2*Math.log(1-rnd()))*Math.cos(2*Math.PI*rnd());
const r2=x=>+x.toFixed(2),r3=x=>+x.toFixed(3),r1=x=>+x.toFixed(1);
const sha=t=>crypto.createHash('sha1').update(String(t)).digest('hex');
const id=t=>sha('id|'+t).slice(0,12);
const T0=Date.parse('2026-11-26T09:00:00.000Z');
const iso=s=>new Date(T0+s*1000).toISOString();

const EPOQUES=['0b1c2d3e4f50','7e8f90a1b2c3'],NOTE=['a1b2c3d4e5f6','c3d4e5f6a7b8'];
const epoqueDe=g=>g<13?0:1;
const MU=20,LAMBDA=6;
const GENES=['marge','bandeDecor','nitroDecor','braqueNitro','figTemps','figJauge','raccTmax','glisse','avance','retourOn','retCap','axePoids'];
const TEMOIN_A={marge:10,bandeDecor:99,nitroDecor:1,braqueNitro:0.7,figTemps:1.5,figJauge:0.4,raccTmax:3.6,glisse:0.12,avance:0.3,retourOn:0,retCap:0.8,axePoids:20};
const genome=(A)=>({v:1,A,WV:[],WS:[]});   /* tetes vides : le tableau ne les lit pas (un vrai genome a 222 et 90 poids) */

/* la population : chaque pilote a un « vrai niveau » cache, la note en est tiree avec du bruit */
let n=0;
function naitre(ne,origine,parents){
  const A=Object.assign({},TEMOIN_A),mutes=[];
  if(origine!=='temoin'){const k=1+Math.floor(rnd()*3);
    for(let i=0;i<k;i++){const c=GENES[Math.floor(rnd()*GENES.length)];if(c==='retourOn'){A[c]=1-A[c];}else A[c]=+(A[c]*(1+.15*normal())).toFixed(4);
      if(!mutes.some(m=>m.cle===c))mutes.push({cle:c,avant:TEMOIN_A[c],apres:A[c]});}}
  const p={id:id(n++),genome:genome(A),shaPilote:sha('pilote|'+n),ne,parents:parents||[],origine,mutes,pannesGeneration:0};
  p._niveau=origine==='temoin'?7.5:7.2+ne*.03+.6*normal();p._E=origine==='temoin'?1.25:1.25-ne*.008+.12*normal();p._n=0;
  return p;}
const vivants=[naitre(0,'temoin')];
const temoin=vivants[0].id;
for(let i=1;i<MU;i++)vivants.push(naitre(0,'g0',[temoin]));
let champion=temoin,championDepuis=0,phase='A',phaseDepuis=0,sansSacre=0,nGraines=12,derniereValidation=-99,dernierCoffre=null,nSacres=0;
const dejaVus=vivants.map(v=>v.id);
const generations=[],validations=[],morts=[],coffre=[],courses=[];
let horloge=0,validationK=0;
const noteDe=(p,g)=>{const n=p._n,a=p._niveau+(epoqueDe(g)?.3:0)+3.3*normal()/Math.sqrt(Math.max(1,n)),ahat=a*(n/(n+12))+7.4*(12/(n+12));
  const E=Math.max(.6,p._E+.1*normal()/Math.sqrt(Math.max(1,n/12))),se_a=3.3/Math.sqrt(Math.max(1,n)),se_E=.09,F=ahat-4*E;
  return {id:p.id,n,a:r2(a),ahat:r2(ahat),se_a:r2(se_a),E:r2(E),se_E:se_E,F:r2(F),se_F:r2(Math.sqrt(se_a*se_a+16*se_E*se_E)),ecartClassique:r2(E+.55),ne:p.ne};};
const MES_REF={nitro:.637,nitroSol:.779,nitroDecol:.625,air:.309,vols:7.86,volDuree:2.18,volHaut:39.9,volsCourts:.138,raccourcis:3.2,figures:3.26,
  poseCentre:.409,dessous:.022,aller:.576,ondulation:.18,vitesse:449.5};
const MES_S={nitro:.095,nitroSol:.117,nitroDecol:.113,air:.058,vols:1.42,volDuree:.35,volHaut:17.5,volsCourts:.072,raccourcis:1.07,figures:2.38,
  poseCentre:.123,dessous:.021,aller:.086,ondulation:.027,vitesse:67.4};
const BIAIS={nitro:-1.2,nitroSol:-2.1,nitroDecol:.4,air:-.6,vols:1.8,volDuree:-1.4,volHaut:.3,volsCourts:2.6,raccourcis:-.8,figures:-.3,poseCentre:-1.9,dessous:.2,aller:4.2,ondulation:-2.4,vitesse:1.1};
function mesures(){const m={};for(const k in MES_REF)m[k]=r3(MES_REF[k]+MES_S[k]*(BIAIS[k]+.5*normal()));return m;}

for(let G=0;G<=30;G++){
  const ev=[],naissances=[],mortsG=[];
  if(G===13){ev.push('nouvelle epoque : ml/bot/yeux.js');ev.push('identite verifiee');for(const v of vivants)v._n=0;nGraines=12;}
  if(G===18){ev.push('graines 12 -> 8');nGraines=8;}
  if(G===25){phase='B';phaseDepuis=25;sansSacre=0;ev.push('phase B');}
  if(G>=1){
    for(let k=0;k<LAMBDA;k++){const o=k===0?'immigre':(rnd()<.3?'croisement':'mutation');
      const pa=vivants[Math.floor(rnd()*vivants.length)].id,pb=vivants[Math.floor(rnd()*vivants.length)].id;
      const p=naitre(G,o,o==='croisement'?[pa,pb]:[o==='immigre'?champion:pa]);vivants.push(p);dejaVus.push(p.id);
      naissances.push({id:p.id,parents:p.parents,origine:o,mutes:p.mutes.map(m=>m.cle)});}}
  const graines=[];for(let i=0;i<nGraines;i++)graines.push(910000+37*Math.floor(rnd()*1081));
  for(const v of vivants)v._n+=nGraines;
  /* les courses du champion (pour ses 15 mesures) et quelques pannes */
  for(const v of vivants){
    if(v.id!==champion&&!(G===22&&v===vivants[5]))continue;
    for(const gr of graines){const pannes=(G===22&&v===vivants[5]&&gr===graines[0])?1:0;
      courses.push({cle:v.shaPilote+'|'+gr+'|900|1a2b3c4d5e6f|relief-canyon|v24.22.3|'+EPOQUES[epoqueDe(G)],pilote:v.shaPilote,id:v.id,usage:'entrainement',
        generation:G,epoque:EPOQUES[epoqueDe(G)],essai:1,mesuree:true,raison:null,date:iso(horloge),graine:gr,tmax:900,palier:Math.max(1,Math.round(v._niveau+3*normal())),
        pieces:400,survie_s:r1(150+40*normal()),cause:'roche',morts:1,vols:10,pannes,erreurs:0,derniereErreur:null,cerveau_ms_moy:.41,yeuxTirages:0,
        mesures:mesures(),jeu:'cashcar-v512',jeu_sha:'1a2b3c4d5e6f',simulateur:'relief-canyon',node:'v24.22.3',empreinte:sha('e'+gr+v.id).slice(0,12),
        empreinteVues:sha('v'+gr).slice(0,12),empreinteTouches:sha('t'+gr).slice(0,12),ms:63000});}}
  const notes=vivants.map(v=>noteDe(v,G));
  const par={};for(const x of notes)par[x.id]=x;
  /* renvoi */
  const elig=vivants.filter(v=>v.id!==temoin&&v.id!==champion&&v._n>=24).sort((a,b)=>par[a.id].F-par[b.id].F);
  const nVire=Math.min(elig.length,vivants.length-MU);
  for(const v of elig.slice(0,nVire)){const x=par[v.id];mortsG.push({id:v.id,raison:'renvoi'});
    morts.push({id:v.id,genome:v.genome,parents:v.parents,origine:v.origine,ne:v.ne,mort:G,raison:'renvoi',n:x.n,a:x.a,ahat:x.ahat,E:x.E,F:x.F,se_F:x.se_F,
      ecartClassique:x.ecartClassique,epoque:EPOQUES[epoqueDe(G)]});
    vivants.splice(vivants.indexOf(v),1);}
  const cands=vivants.filter(v=>v.id!==champion&&v._n>=48).map(v=>par[v.id]).sort((a,b)=>b.F-a.F);
  const meneur=cands[0]||null;
  const duree=G<18?2300+300*rnd():1700+200*rnd(),demandees=vivants.length*nGraines+(G>0?LAMBDA*0:0);
  horloge+=duree;
  /* validation, revalidation, coffre */
  let validation=null,cof=null;
  const valider=(qui,contre,usage,sacre,dFe)=>{const gr=[];for(let i=0;i<24;i++)gr.push(1000000+37*(validationK++));
    const dF=r2(dFe-.9+.4*normal()),se=r2(.42+.05*rnd());
    const prec=validations.filter(v=>v.usage==='validation').map(v=>v.malediction);const mal=r2(dFe-dF);prec.push(mal);
    const V={generation:G,date:iso(horloge),usage,meneur:qui,champion:contre,graines:gr,entrainement:{dF:r2(dFe),se_dF:.6},
      validation:{graines:24,dF,se_dF:se,dPalier:r2(dF+.3),se_dPalier:.8,dE:r2(-.02+.05*normal()),se_dE:.07},criteres:{a:sacre,b:true,c:true},sacre,
      malediction:mal,maledictionMoyenne:r2(prec.reduce((a,b)=>a+b,0)/prec.length),fichier:null};
    validations.push(V);derniereValidation=G;return V;};
  if(G===13)validation=valider(champion,temoin,'revalidation',true,0);
  if(meneur&&[8,20,26].includes(G)){
    const sacre=G===20,v=valider(meneur.id,champion,'validation',sacre,r2(meneur.F-par[champion].F));validation=v;
    if(sacre){champion=meneur.id;championDepuis=G;nSacres++;sansSacre=0;v.fichier='champions/g0020-'+vivants.find(x=>x.id===champion).shaPilote.slice(0,8)+'.json';ev.push('sacre : '+champion);}}
  if(G>0&&!validation)sansSacre++;
  const coffrer=raison=>{const c=par[champion],t=par[temoin],pc=r2(7.4+(champion===temoin?0:.5)+(epoqueDe(G)?.3:0)),pt=r2(7.4+(epoqueDe(G)?.3:0)+.1*normal());
    const tE=r2(1.2+.03*normal()),cE=champion===temoin?tE:r2(tE-.12),tC=r2(tE+.5),cC=champion===temoin?tC:r2(tC-.09),pcc=champion===temoin?pt:pc;
    const K={date:iso(horloge),generation:G,epoque:EPOQUES[epoqueDe(G)],raison,graines:40,
      champion:{id:champion,n:40,palierMoyen:pcc,E:cE,ecartClassique:cC},temoin:{id:temoin,n:40,palierMoyen:pt,E:tE,ecartClassique:tC},
      diff:{palier:r2(pcc-pt),E:r2(cE-tE),ecartClassique:r2(cC-tC)}};
    coffre.push(K);dernierCoffre=K.date;return K;};
  if(G===10)cof=coffrer('24h');if(G===13)cof=coffrer('epoque');if(G===20)cof=coffrer('sacre');if(G===29)cof=coffrer('24h');
  const resume=x=>x?{id:x.id,n:x.n,a:x.a,ahat:x.ahat,E:x.E,F:x.F,se_F:x.se_F,ecartClassique:x.ecartClassique}:null;
  const jouees=G===0?demandees:Math.round(demandees*(LAMBDA/vivants.length))+(validation?48:0)+(cof?80:0);
  generations.push({generation:G,date:iso(horloge),duree_s:Math.round(duree),epoque:EPOQUES[epoqueDe(G)],epoqueNote:NOTE[epoqueDe(G)],phase,nGraines,graines,
    courses:{demandees,cache:demandees-jouees>0?demandees-jouees:0,jouees,nonMesurees:G===22?3:(G%7===3?1:0),relancees:G===22?3:(G%7===3?1:0),tuees:G===22?1:0,grainesRetirees:[]},
    debit_h:r1(jouees/(duree/3600)),naissances,morts:mortsG,meneur:resume(meneur),temoin:resume(par[temoin]),champion:resume(par[champion]),
    population:vivants.map(v=>({id:v.id,ne:v.ne,n:par[v.id].n,ahat:par[v.id].ahat,E:par[v.id].E,F:par[v.id].F,se_F:par[v.id].se_F})),
    distance:r3(Math.max(.03,.14-G*.0025+.01*normal())),distanceW2:G>=25?r3(.02*(G-24)):0,sigmaRes:r2(3.3+.05*normal()),
    validation:validation?{sacre:validation.sacre,usage:validation.usage}:null,coffre:cof?{raison:cof.raison,diff:cof.diff}:null,evenements:ev});}

/* population.json : ecrite au debut de la generation 31 (naissances faites, notes pas encore) */
const G=31;for(let k=0;k<LAMBDA;k++){const p=naitre(G,k===0?'immigre':'mutation',[champion]);vivants.push(p);dejaVus.push(p.id);}
const population={format:'evolution-population-1',generation:G,phase,phaseDepuis,sansSacre,epoque:{courses:EPOQUES[1],note:NOTE[1],depuis:13},rng:2918734561,
  graines:{reserve:[0,4,5,9],recentes:[[910074],[910111]],validationK,validationRepli:false,validationFinie:false},
  grainesGeneration:[910407,911183,912034,913255,914920,915034,916660,917030],nGraines,grainesRetirees:[],regle6:2,temoin,
  champion:{id:champion,depuis:championDepuis,fichier:'champions/g0020-'+vivants.find(x=>x.id===champion).shaPilote.slice(0,8)+'.js',revalider:false},
  derniereValidation,dernierCoffre,nSacres,
  vivants:vivants.map(v=>({id:v.id,genome:v.genome,shaPilote:v.shaPilote,ne:v.ne,parents:v.parents,origine:v.origine,mutes:v.mutes,pannesGeneration:0})),dejaVus};

fs.mkdirSync(DOSSIER,{recursive:true});
const ecr=(f,t)=>fs.writeFileSync(path.join(DOSSIER,f),t,'utf8');
const jsonl=A=>A.map(x=>JSON.stringify(x)).join('\n')+'\n';
ecr('population.json',JSON.stringify(population,null,1)+'\n');
ecr('generations.jsonl',jsonl(generations));ecr('validations.jsonl',jsonl(validations));ecr('morts.jsonl',jsonl(morts));ecr('coffre.jsonl',jsonl(coffre));
ecr('courses-2026-48.jsonl',jsonl(courses));
/* un verrou laisse par un processus mort (pid 999999, qui ne vit pas) : le resume doit dire « arrete sans prevenir » */
ecr('verrou.json',JSON.stringify({pid:999999,debut:iso(0),battement:iso(horloge),config:'config.json'})+'\n');
console.log('etat d\'exemple ecrit dans '+DOSSIER+' : '+generations.length+' generations, '+validations.length+' validations, '+coffre.length+' coffres, '+
  morts.length+' morts, '+courses.length+' courses');
