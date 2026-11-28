#!/usr/bin/env node
/* ===== LE SIMULATEUR : LES PLANS D'ETUDE (27/11/2026, l'etude « simulateur ») =====
   Chaque plan est une liste de reglages ; chaque reglage est joue sur R mondes (repetitions : un nouveau paysage de mutations et un nouveau bruit
   a chaque fois, les MEMES graines de monde d'un reglage a l'autre : les comparaisons sont appariees).
   node etudes.js <plan> --partie i/n     joue la i-eme part (sur n) du plan ; ecrit resultats/<plan>-<i>.json ; un seul processus, < 5 min par part
   node etudes.js <plan> --compter        dit combien de runs et une estimation du temps
   Plans : principal (Q1), sensibilite (Q2, un reglage a la fois), ensemble (Q2, les meilleurs ensemble, a 200 000 courses), note (Q3), nul (faux sacres). */
'use strict';
const fs=require('fs'),path=require('path');
const S=require('./simuler.js');
const SCEN=['pessimiste','moyen','optimiste'];

function plans(){
  const P={};
  /* Q1 : la vraie configuration, trois scenarios, trois debits (le debit change l'economie de graines : 8 graines au lieu de 12 quand une
     generation pleine depasse 1 h 30) */
  P.principal=[];for(const s of SCEN)for(const d of [200,400,800])P.principal.push({nom:s+' '+d+'/h',scenario:s,debit:d,cfg:{},reps:10,budgets:[10000,50000,200000]});
  /* Q1 bis : le scenario central de l'etude « effets » (presque rien a gagner) */
  P.etroit=[{nom:'etroit 400/h',scenario:'etroit',debit:400,cfg:{},reps:10,budgets:[10000,50000,200000]}];
  /* Q2 : un reglage a la fois, a 50 000 courses ; l'economie de graines est coupee pour que « graines par generation » soit bien ce qu'on regle */
  const base={economie:false};
  const un=[['defaut',{}],
    ['graines 6',{grainesParGeneration:6}],['graines 24',{grainesParGeneration:24}],
    ['naissances 3',{lambda:3}],['naissances 12',{lambda:12}],
    ['population 10',{mu:10}],['population 40',{mu:40}],
    ['rejouer jeunes+4',{rejouer:4}],
    ['seuilSacre 1',{validation:{seuilSacre:1}}],['seuilSacre 3',{validation:{seuilSacre:3}}],
    ['validation 12 graines',{validation:{graines:12}}],['validation 48 graines',{validation:{graines:48}}],
    ['intervalle 2',{validation:{intervalle:2}}],
    /* la proposition R2 de l'etude voisine « effets » : des mutations plus fortes */
    ['sigmaMutation 0,30',{sigmaMutation:.30}],['poissonMutations 4',{poissonMutations:4}]];
  P.sensibilite=[];for(const s of SCEN)for(const [n,c] of un)P.sensibilite.push({nom:s+' | '+n,scenario:s,debit:400,cfg:S.fusion(base,c),reps:14,budgets:[10000,50000]});
  /* Q3 : la note F = palier − 4·E ; trois lois de E (inerte, independante du palier, en conflit avec le palier) ; poids 0 (le palier seul), 4 (la
     vraie note), 16 */
  P.note=[];for(const s of SCEN)for(const mE of ['inerte','independant','conflit'])for(const pe of [0,4,16])
    P.note.push({nom:s+' | E '+mE+' | poids '+pe,scenario:s,scenarioPlus:{modeE:mE},debit:400,cfg:{economie:false,note:{poidsEcart:pe}},reps:10,budgets:[10000,50000]});
  /* le taux de faux sacres dans un monde sans effet, selon seuilSacre et le nombre de graines de validation */
  P.nul=[];for(const ss of [1,2,3])for(const vg of [12,24,48])P.nul.push({nom:'nul | seuil '+ss+' | '+vg+' graines',scenario:'nul',debit:400,cfg:{economie:false,validation:{seuilSacre:ss,graines:vg}},reps:8,budgets:[50000]});
  return P;
}
/* les reglages « ensemble » se lisent dans resultats/ensemble.json (ecrit a la main apres la sensibilite : la liste des reglages a combiner) */
function planEnsemble(){
  const f=path.join(__dirname,'resultats','ensemble-reglages.json');
  const R=JSON.parse(fs.readFileSync(f,'utf8')),L=[];
  for(const s of SCEN)for(const r of R)L.push({nom:s+' | '+r.nom,scenario:s,debit:400,cfg:r.cfg,reps:r.reps||8,budgets:[10000,50000,200000]});
  return L;
}

function main(){
  const A=process.argv.slice(2),nom=A[0],opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  const L=nom==='ensemble'?planEnsemble():plans()[nom];
  if(!L){console.error('plan inconnu : '+nom);process.exit(2);}
  const runs=[];L.forEach((c,ci)=>{for(let k=0;k<c.reps;k++)runs.push({ci,k});});
  if(A.includes('--compter')){const s=L.reduce((t,c)=>t+c.reps*Math.pow(Math.max(...c.budgets)/50000,2)*1.1,0);console.log(runs.length+' runs, ~'+Math.round(s)+' s');return;}
  const [i,n]=(opt('partie','1/1')).split('/').map(Number);
  const t0=Date.now(),out=[];
  runs.forEach((r,j)=>{
    if(j%n!==i-1)return;
    const c=L[r.ci];
    const res=S.evoluer({scenario:c.scenario,scenarioPlus:c.scenarioPlus,graine:1000+r.k,debit:c.debit,cfg:c.cfg,budgets:c.budgets});
    out.push({nom:c.nom,scenario:c.scenario,debit:c.debit,k:r.k,points:res.points});
  });
  fs.mkdirSync(path.join(__dirname,'resultats'),{recursive:true});
  const f=path.join(__dirname,'resultats',nom+'-'+i+'.json');
  fs.writeFileSync(f,JSON.stringify(out)+'\n');
  console.log(nom+' partie '+i+'/'+n+' : '+out.length+' runs en '+((Date.now()-t0)/1000).toFixed(0)+' s -> '+path.relative(__dirname,f));
}
main();
