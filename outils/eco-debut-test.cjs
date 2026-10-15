// eco-debut-test.cjs — teste le VRAI bloc ECOD de index.html (extrait tel quel) : node outils/eco-debut-test.cjs [chemin/index.html]  — 16 cas, code de sortie 0 si tout passe
// Teste le VRAI code de index.html (le bloc ECOD extrait tel quel) avec une sauvegarde et une boutique simulees.
const fs=require('fs'),path=require('path');const SRC=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','VERSION PRINCIPALE','index.html'),'utf8');
const i=SRC.indexOf('const ECO_ANCIEN='),j=SRC.indexOf('// LANGUE & DEVISE (2026-09-03)');
const code=SRC.slice(i,j);
const denomLine=/function denom\(\)\{[^\n]*?\}/.exec(SRC)[0].replace(/\}\s*\/\/.*$/,'}');
const COSM={peinture:[{id:'usine',p:0},{id:'menthe',p:2500},{id:'minuit',p:5000},{id:'or',mis:4}],aile:[{id:'x',p:3000}],trainee:[{id:'menthe',p:2000}]};
function monde(save,search,cousinOn){
  const f=new Function('SAVE','COSM','bank','cousin','location','window','DENOMS','engTier','ECO3',
    code+'\n'+denomLine+'\nreturn {ECOD,ecoDebutMaj,ecoDebutEtat,denom,dbg:window.dbgEcoDebut};');
  const win={};return f(save,COSM,()=>save.d.bank||0,()=>!!cousinOn,{search:search||''},win,[3,3,3,4],0,{gain:.25});
}
const neuf=()=>({d:{bank:0,owned:[],figs:['tonneau'],shop:{own:[]},ex:{runs:0}}});
let ko=0;const t=(nom,ok)=>{console.log((ok?'OK  ':'KO  ')+nom);if(!ok)ko++;};
let m=monde(neuf());m.ecoDebutMaj();t('joueur neuf : actif, k=1.5, denom x1.5',m.ECOD.k===1.5&&m.ECOD.raison==='actif'&&Math.abs(m.denom()-3*.25*1.5)<1e-9);
let s=neuf();s.d.bank=2499;m=monde(s);m.ecoDebutMaj();t('banque 2499 : encore actif',m.ECOD.k===1.5);
s=neuf();s.d.bank=2500;m=monde(s);m.ecoDebutMaj();t('banque 2500 : filet « assez », k=1',m.ECOD.k===1&&m.ECOD.raison==='assez'&&Math.abs(m.denom()-.75)<1e-9);
s=neuf();s.d.owned=[7];m=monde(s);m.ecoDebutMaj();t('une caisse achetee : eteint',m.ECOD.k===1&&m.ECOD.raison==='achat');
s=neuf();s.d.figs=['tonneau','shimmy'];m=monde(s);m.ecoDebutMaj();t('une figure achetee : eteint',m.ECOD.k===1&&m.ECOD.raison==='achat');
s=neuf();s.d.shop.own=['peinture:menthe'];m=monde(s);m.ecoDebutMaj();t('une peinture achetee : eteint',m.ECOD.k===1&&m.ECOD.raison==='achat');
s=neuf();s.d.shop.own=['trainee:menthe'];m=monde(s);m.ecoDebutMaj();t('une trainee achetee : eteint',m.ECOD.k===1&&m.ECOD.raison==='achat');
s=neuf();s.d.shop.own=['aile:x'];m=monde(s);m.ecoDebutMaj();t('une aile achetee : eteint',m.ECOD.k===1&&m.ECOD.raison==='achat');
s=neuf();s.d.shop.own=['peinture:or'];m=monde(s);m.ecoDebutMaj();t('une peinture GAGNEE (carnet) : ne compte pas, reste actif',m.ECOD.k===1.5);
s=neuf();m=monde(s,'?x=1&eco=ancien');m.ecoDebutMaj();t('?eco=ancien : k=1 strict',m.ECOD.k===1&&m.ECOD.raison==='ancien'&&Math.abs(m.denom()-.75)<1e-9);
s=neuf();m=monde(s,'?eco=ancienne');m.ecoDebutMaj();t('?eco=ancienne n\'est pas « ancien »',m.ECOD.k===1.5);
m=monde(neuf(),'',true);m.ecoDebutMaj();t('code cousin : k=1',m.ECOD.k===1&&m.ECOD.raison==='cousin');
m=monde(undefined);m.ecoDebutMaj();t('SAVE absent : erreur -> k=1, pas de plantage',m.ECOD.k===1&&m.ECOD.raison==='erreur');
s=neuf();m=monde(s);m.ecoDebutMaj();s.d.owned=[1];t('achat apres le depart : la partie en cours garde k (constant pendant la partie)',m.ECOD.k===1.5);
m.ecoDebutMaj();t('…et la partie SUIVANTE repasse a 1',m.ECOD.k===1);
s=neuf();s.d.bank=700;s.d.ex.runs=2;m=monde(s);m.ecoDebutMaj();const d=m.dbg();t('dbgEcoDebut : etat lisible',d.actif&&d.k===1.5&&d.parties===2&&d.peintureMin===2500&&d.manque===1800&&d.achatFait===false&&d.ancien===false);
console.log(JSON.stringify(d));
process.exit(ko?1:0);
