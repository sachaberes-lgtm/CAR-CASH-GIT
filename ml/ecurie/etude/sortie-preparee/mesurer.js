#!/usr/bin/env node
/* ===== LA MESURE DES DECOLLAGES DE c0025 (28/11/2026, etude « sortie preparee », le mesureur) =====
   Joue c0025 avec son diagnostic (course-diag.js --diag 1) : grotte, ville, jade, canyon en carte TENUE (la meme carte a chaque portail), 8 graines
   chacune, et 8 courses sans carte imposee ; tmax 180 ; 2 courses a la fois au plus, en priorite basse. Puis la preuve (--diag 0, le pilote ne sans
   une ligne de plus, sur 2 graines : memes empreintes de course, de vues et de touches), puis analyser.js.
   Les graines : celles du numero 0 (l'essai) du banc v2, 3 963 000 + 37 i (banc/plan.js : « le numero 0 (l'essai) prend 3 963 000 a 3 999 963 »),
   ici i = 200 a 207 (3 970 400 a 3 970 659) : hors de toute plage reservee (notes/regles.md), et pas celles de la vague d'essai (i = 0 a 5).
   Reprise : une course dont la sortie existe n'est pas rejouee.
   usage : node mesurer.js [--travailleurs 2] [--tmax 180] [--seulement preuve|courses] [--sans-analyse] */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ICI=__dirname,SORT=path.join(ICI,'sorties'),LIG=path.join(SORT,'lignes');
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
const TRAV=Math.min(2,Math.max(1,+opt('travailleurs',2))),TMAX=Math.min(180,+opt('tmax',180)),SEUL=opt('seulement',null);
const GRAINES=[];for(let i=200;i<208;i++)GRAINES.push(3963000+37*i);
const CARTES=['grotte','ville','jade','canyon'];
fs.mkdirSync(LIG,{recursive:true});

const nomDe=t=>(t.carte?t.carte+'-tenue':'libre')+'-'+t.graine+(t.diag===0?'-ref':'');
const taches=[];
if(SEUL!=='preuve'){
  for(const c of CARTES)for(const g of GRAINES)taches.push({carte:c,tenue:true,graine:g,diag:1});
  for(const g of GRAINES)taches.push({carte:null,tenue:false,graine:g,diag:1});}
if(SEUL!=='courses'){
  taches.push({carte:'grotte',tenue:true,graine:GRAINES[0],diag:0});
  taches.push({carte:null,tenue:false,graine:GRAINES[0],diag:0});
  taches.push({carte:'jade',tenue:true,graine:GRAINES[1],diag:0});}   /* une autre graine, 180 s pleins */

function jouer(t){
  const n=nomDe(t),fRes=path.join(LIG,n+'.json'),fV=path.join(LIG,n+'.jsonl.gz');
  if(fs.existsSync(fRes)){try{return Promise.resolve(JSON.parse(fs.readFileSync(fRes,'utf8')));}catch(e){}}
  const args=[path.join(ICI,'course-diag.js'),'--graine',String(t.graine),'--tmax',String(TMAX),'--diag',String(t.diag)];
  if(t.carte){args.push('--carte',t.carte);if(t.tenue)args.push('--tenue');}
  if(t.diag===1)args.push('--sortie',path.relative(process.cwd(),fV).split(path.sep).join('/'));
  return new Promise(ok=>{
    const c=spawn(process.execPath,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
    try{os.setPriority(c.pid,os.constants.priority.PRIORITY_BELOW_NORMAL);}catch(e){}
    let out='',err='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>{err+=d;if(err.length>20000)err=err.slice(-10000);});
    c.on('close',code=>{let r=null;try{r=JSON.parse(out.trim().split('\n').pop());}catch(e){}
      if(code!==0||!r){r={erreur:'code '+code,fin:err.slice(-800)};}
      else fs.writeFileSync(fRes,JSON.stringify(r));
      process.stdout.write(new Date().toISOString().slice(11,19)+' '+n+' : '+(r.erreur?r.erreur:('palier '+r.palier+', '+r.survie_s+' s, '+r.cause+', '+(r.cartes||[]).join('>')+', '+Math.round(r.msMur/1000)+' s'))+'\n');
      ok(r);});});
}
async function tout(){
  const t0=Date.now(),R=new Array(taches.length);let k=0;
  async function ouvrier(){while(k<taches.length){const i=k++;R[i]=await jouer(taches[i]);}}
  await Promise.all(Array.from({length:TRAV},ouvrier));
  /* LA PREUVE : diag 0 contre diag 1, memes graines */
  const preuve=[];
  for(let i=0;i<taches.length;i++){const t=taches[i];if(t.diag!==0)continue;
    const j=taches.findIndex(u=>u.diag===1&&u.graine===t.graine&&u.carte===t.carte);
    const a=R[i],b=j>=0?R[j]:null;
    if(!a||!b||a.erreur||b.erreur){preuve.push({course:nomDe(t),verdict:'NON JOUEE'});continue;}
    const cles=['empreinte','empreinteVues','empreinteTouches','palier','survie_s','cause','pieces'];
    const ok=cles.every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
    preuve.push({course:nomDe(t),verdict:ok?'IDENTIQUE':'DIFFERENTE',sansDiag:cles.map(k=>a[k]),avecDiag:cles.map(k=>b[k]),shaSansDiag:a.shaPilote,shaAvecDiag:b.shaPilote});}
  fs.writeFileSync(path.join(SORT,'preuve.json'),JSON.stringify({cles:['empreinte','empreinteVues','empreinteTouches','palier','survie_s','cause','pieces'],preuve},null,1));
  for(const p of preuve)process.stdout.write('PREUVE '+p.course+' : '+p.verdict+'\n');
  process.stdout.write('FIN '+((Date.now()-t0)/60000).toFixed(1)+' min\n');
  if(!A.includes('--sans-analyse'))require('./analyser').analyser();
}
tout().catch(e=>{process.stdout.write('ERREUR '+(e&&e.stack||e)+'\n');process.exit(1);});
