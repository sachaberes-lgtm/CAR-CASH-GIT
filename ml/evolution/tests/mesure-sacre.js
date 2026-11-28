#!/usr/bin/env node
/* ===== LA MESURE DE LA VALIDATION SEQUENTIELLE, AVEC LE VRAI CODE (28/11/2026, lot « sacre » ; la synthese
   ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 2 A5 : « refais toi-meme le taux de faux sacres et la puissance de TON code ») =====
   Pas une copie de la regle : chaque regard est evoluer.regarder (le vrai), qui appelle le vrai note.comparer (bootstrap de la config, 400 tirages)
   a la borne du vrai planValidation(config.json), puis le vrai evoluer.decisionRegard. Les courses sont celles de l'etude sacre/ (aucune course jouee) :
   une course simulee = le residu de palier ET les mesures d'une meme vraie course du 27/11 (sacre/donnees/courses-2026-48.jsonl), plus le vrai niveau
   du pilote ; les MEMES tirages que l'etude (memes generateurs, meme ordre) :
   - « nul » : les tirages de g-controle-nul.js (graine 99) : pilotes egaux, 96 graines chacun ;
   - « regards » : les tirages de d-regards.js evolution (graine 161 + 9, les cas dans le meme ordre ; les cas non mesures ici sont tires quand meme,
     pour garder la suite) : d = -0,5, 0, +1, +2 paliers.
   usage : node ml/evolution/tests/mesure-sacre.js [nul=9000] [parCas=800] [seuils=1,2] > sortie
   Un seul processus, aucune course du jeu, ecrit seulement sur la sortie standard. ~10 a 40 min selon le nombre d'essais. */
'use strict';
const fs=require('fs'),path=require('path');
const C=require('../commun'),N=require('../note'),Gr=require('../graines'),E=require('../evoluer');
const ETUDE=path.join(C.RACINE,'ml','ecurie','etude','reglage-de-la-selection','sacre');
const nNul=+(process.argv[2]||9000),parCas=+(process.argv[3]||800),SEUILS=String(process.argv[4]||'1,2').split(',').map(Number);
const REF=N.referenceEpoque(),CFG0=C.lireConfig();

/* ---------- la reserve de l'etude (commun.js de sacre/, reserveEvolution), avec les mesures entieres de chaque course ---------- */
function reserve(){
  const t=fs.readFileSync(path.join(ETUDE,'donnees','courses-2026-48.jsonl'),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
  const M=new Map();for(const l of t)if(l.usage==='entrainement'&&l.mesuree===true&&typeof l.palier==='number')M.set(l.id+'|'+l.graine,l);
  const lignes=[...M.values()];
  const f=N.ajuster(lignes,{passes:30,retrecir:0});
  const ids=new Set(lignes.map(l=>l.id)),gr=new Set(lignes.map(l=>l.graine));
  const k=Math.sqrt(lignes.length/(lignes.length-ids.size-gr.size+1));
  return lignes.map(l=>({r:(l.palier-f.a[l.id]-f.b[l.graine])*k,m:l.mesures||null}));
}
/* n courses d'un pilote de niveau a : les memes tirages que S.courses de l'etude (un rng.entier par course) */
function courses(R,a,n,rng){const out=new Array(n);for(let i=0;i<n;i++){const c=R[rng.entier(R.length)];out[i]={p:a+c.r,m:c.m};}return out;}
const lignesDe=(X,id)=>X.map((c,i)=>({id:id,graine:1000000+37*i,palier:c.p,mesures:c.m,mesuree:true}));

/* ---------- une validation sequentielle entiere, regard apres regard, par le vrai code ---------- */
function valider(plan,cfg,A,B){
  const LA=lignesDe(A,'meneur'),LB=lignesDe(B,'champion');
  let n=0,x=null;
  for(let k=0;;k++){
    n+=k===0?plan.premier:Math.min(plan.pas,plan.plafond-n);
    x=E.regarder(plan,LA.slice(0,n),LB.slice(0,n),n,{REF:REF,cfg:cfg});
    if(x.decision!=='continuer')break;
  }
  return {sacre:x.decision==='sacre',graines:n,regards:Math.round(1+(n-plan.premier)/plan.pas)};
}
const cfgSeuil=s=>{const c=JSON.parse(JSON.stringify(CFG0));c.validation.seuilB=s;c.validation.seuilC=s;return c;};
const wilson=(k,n)=>{const z=1.96,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return '['+(100*Math.max(0,c-h)).toFixed(1)+' ; '+(100*Math.min(1,c+h)).toFixed(1)+']';};
const pct=(k,n)=>(100*k/n).toFixed(1)+' %';

const R=reserve(),t0=Date.now();
const cfgs=SEUILS.map(s=>({s:s,cfg:cfgSeuil(s),plan:E.planValidation(cfgSeuil(s))}));
const p0=cfgs[0].plan;
console.log('le plan de config.json : '+p0.nom+', '+p0.premier+' graines puis '+p0.pas+' par '+p0.pas+' jusqu\'a '+p0.plafond+', borne '+p0.borneOBF+' x racine('+p0.plafond+'/n), arret si z < '+p0.futilite+
  ' ; bootstrap '+CFG0.validation.bootstrap+' tirages ; reserve : '+R.length+' vraies courses du 27/11');
const compter=()=>{const o={};for(const c of cfgs)o[c.s]={s:0,g:0,r:0};return o;};
const ajouter=(cpt,A,B)=>{for(const c of cfgs){const v=valider(c.plan,c.cfg,A,B);if(v.sacre)cpt[c.s].s++;cpt[c.s].g+=v.graines;cpt[c.s].r+=v.regards;}};
const dire=(titre,cpt,n)=>{for(const c of cfgs)console.log('  '+titre.padEnd(34)+' criteres (b)(c) a '+c.s+' se : sacres '+pct(cpt[c.s].s,n).padStart(7)+' '+wilson(cpt[c.s].s,n).padEnd(14)+
  ' ; graines jouees en moyenne '+(cpt[c.s].g/n).toFixed(1)+' ; regards '+(cpt[c.s].r/n).toFixed(2)+' ('+n+' essais)');};

/* 1. les faux sacres : les tirages de g-controle-nul.js (graine 99) */
if(nNul>0){
  const rng=Gr.mulberry32(99),cpt=compter();
  for(let t=0;t<nNul;t++){const A=courses(R,0,96,rng),B=courses(R,0,96,rng);ajouter(cpt,A,B);
    if((t+1)%1000===0)process.stderr.write('nul '+(t+1)+'/'+nNul+' ('+Math.round((Date.now()-t0)/1000)+' s)\n');}
  console.log('\n1. pilotes egaux, tirages de g-controle-nul.js (graine 99) — l\'etude : 1,8 % [1,5 ; 2,1] (a 1 et a 2 se), 37 graines');
  dire('faux sacres (d = 0)',cpt,nNul);
}
/* 2. la puissance : les tirages de d-regards.js evolution (graine 161 + longueur de « evolution »), cas dans le meme ordre */
if(parCas>0){
  const rng=Gr.mulberry32(161+'evolution'.length);
  const CAS=[[0,1600],[-1,800],[-0.5,800],[0.5,800],[1,800],[2,800]],VOULU=new Set([0,-0.5,1,2]);
  console.log('\n2. tirages de d-regards.js evolution (memes essais que sorties/regards-evolution.json, '+parCas+' premiers essais de chaque cas mesures)');
  console.log('   l\'etude (e-plans-evolution.txt, seqOBF-2.2-0.5-96) : a 1 se  d-0.5 0,0 · d0 1,6 · d+1 32,4 · d+2 80,3 ; a 2 se  d-0.5 0,0 · d0 1,6 · d+1 33,4 · d+2 86,3 ; graines 38 (d0) / 60 (d+1)');
  for(const [d,n] of CAS){
    const cpt=compter();let m=0;
    for(let t=0;t<n;t++){const A=courses(R,d,96,rng),B=courses(R,0,96,rng);
      if(VOULU.has(d)&&t<parCas){ajouter(cpt,A,B);m++;}}
    if(m){dire('vrai ecart d = '+(d>0?'+':'')+d+' palier',cpt,m);process.stderr.write('cas '+d+' fini ('+Math.round((Date.now()-t0)/1000)+' s)\n');}
  }
}
console.log('\n('+Math.round((Date.now()-t0)/1000)+' s)');
