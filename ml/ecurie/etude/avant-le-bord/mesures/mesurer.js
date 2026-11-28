#!/usr/bin/env node
/* ===== LES COURSES DE LA MESURE « AVANT LE BORD » (28/11/2026, le mesureur) =====
   Trois lots, 2 courses a la fois AU PLUS (une vague du banc tourne sur ce PC), en priorite basse, reprise (une course faite n'est pas rejouee) :
     --lot anciennes : les 40 courses de ../../sortie-preparee (memes graines 3963000 + 37 i, i = 200..207 ; grotte, ville, jade, canyon en carte
                       TENUE, et 8 sans carte ; tmax 180), rejouees avec le diagnostic etendu (course-diag.js --diag 1) ;
     --lot preuve    : 4 courses --diag 0 (une par map a decor, des graines que la preuve d'avant n'avait pas : canyon 3970511, grotte 3970548,
                       ville 3970585, jade 3970622), comparees a leurs jumelles --diag 1 du lot « anciennes » ;
     --lot ville     : 16 courses de ville tenue NEUVES, graines 3963000 + 37 i, i = 400..415 (la prediction est ecrite AVANT : prediction-ville.md).
   Apres « anciennes » et « preuve » : sorties/preuve.json (diag 0 contre diag 1 ; et chaque course rejouee contre la mesure d'avant).
   usage : node mesurer.js --lot anciennes|preuve|ville [--travailleurs 2] */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const ICI=__dirname,SORT=path.join(ICI,'sorties'),LIG=path.join(SORT,'lignes'),AVANT=path.join(ICI,'..','..','sortie-preparee','sorties','lignes');
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
const TRAV=Math.min(2,Math.max(1,+opt('travailleurs',2))),TMAX=180,LOT=opt('lot',null);
const G=i=>3963000+37*i;
const ANC=[];for(let i=200;i<208;i++)ANC.push(G(i));
const VIL=[];for(let i=400;i<416;i++)VIL.push(G(i));
fs.mkdirSync(LIG,{recursive:true});
const nomDe=t=>(t.carte?t.carte+'-tenue':'libre')+'-'+t.graine+(t.diag===0?'-ref':'');
const taches=[];
if(LOT==='anciennes'){for(const c of ['grotte','ville','jade','canyon'])for(const g of ANC)taches.push({carte:c,graine:g,diag:1});for(const g of ANC)taches.push({carte:null,graine:g,diag:1});}
else if(LOT==='preuve'){taches.push({carte:'canyon',graine:G(203),diag:0},{carte:'grotte',graine:G(204),diag:0},{carte:'ville',graine:G(205),diag:0},{carte:'jade',graine:G(206),diag:0});}
else if(LOT==='ville'){for(const g of VIL)taches.push({carte:'ville',graine:g,diag:1});}
else{process.stderr.write('usage : node mesurer.js --lot anciennes|preuve|ville\n');process.exit(1);}

function jouer(t){
  const n=nomDe(t),fRes=path.join(LIG,n+'.json'),fV=path.join(LIG,n+'.jsonl.gz');
  if(fs.existsSync(fRes)){try{return Promise.resolve(JSON.parse(fs.readFileSync(fRes,'utf8')));}catch(e){}}
  const args=[path.join(ICI,'course-diag.js'),'--graine',String(t.graine),'--tmax',String(TMAX),'--diag',String(t.diag)];
  if(t.carte)args.push('--carte',t.carte,'--tenue');
  if(t.diag===1)args.push('--sortie',path.relative(process.cwd(),fV).split(path.sep).join('/'));
  return new Promise(ok=>{
    const c=spawn(process.execPath,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
    try{os.setPriority(c.pid,os.constants.priority.PRIORITY_BELOW_NORMAL);}catch(e){}
    let out='',err='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>{err+=d;if(err.length>20000)err=err.slice(-10000);});
    c.on('close',code=>{let r=null;try{r=JSON.parse(out.trim().split('\n').pop());}catch(e){}
      if(code!==0||!r){r={erreur:'code '+code,fin:err.slice(-800)};}
      else fs.writeFileSync(fRes,JSON.stringify(r));
      process.stdout.write(new Date().toISOString().slice(11,19)+' '+n+' : '+(r.erreur?r.erreur+' '+r.fin:('palier '+r.palier+', '+r.survie_s+' s, '+r.cause+', '+(r.cartes||[]).join('>')+', '+Math.round(r.msMur/1000)+' s'))+'\n');
      ok(r);});});
}
const CLES=['empreinte','empreinteVues','empreinteTouches','palier','survie_s','cause','pieces'];
function lire(f){try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){return null;}}
function preuve(){
  const out={cles:CLES,diag0contreDiag1:[],contreAvant:[]};
  for(const t of [{carte:'canyon',graine:G(203)},{carte:'grotte',graine:G(204)},{carte:'ville',graine:G(205)},{carte:'jade',graine:G(206)}]){
    const a=lire(path.join(LIG,nomDe(Object.assign({diag:0},t))+'.json')),b=lire(path.join(LIG,nomDe(Object.assign({diag:1},t))+'.json'));
    if(!a||!b||a.erreur||b.erreur){out.diag0contreDiag1.push({course:nomDe(t),verdict:'NON JOUEE'});continue;}
    const ok=CLES.every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
    out.diag0contreDiag1.push({course:nomDe(Object.assign({diag:1},t)),verdict:ok?'IDENTIQUE':'DIFFERENTE',sansDiag:CLES.map(k=>a[k]),avecDiag:CLES.map(k=>b[k]),shaSansDiag:a.shaPilote,shaAvecDiag:b.shaPilote});}
  for(const c of ['grotte','ville','jade','canyon',null])for(const g of ANC){const t={carte:c,graine:g,diag:1},n=nomDe(t);
    const a=lire(path.join(AVANT,n+'.json')),b=lire(path.join(LIG,n+'.json'));
    if(!a||!b||b.erreur){out.contreAvant.push({course:n,verdict:'NON JOUEE'});continue;}
    const ok=CLES.every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
    out.contreAvant.push({course:n,verdict:ok?'IDENTIQUE':'DIFFERENTE',avant:CLES.map(k=>a[k]),maintenant:CLES.map(k=>b[k]),shaAvant:a.shaPilote,shaMaintenant:b.shaPilote});}
  fs.writeFileSync(path.join(SORT,'preuve.json'),JSON.stringify(out,null,1));
  const n=(L,v)=>L.filter(x=>x.verdict===v).length;
  process.stdout.write('PREUVE diag0/diag1 : '+n(out.diag0contreDiag1,'IDENTIQUE')+' identiques, '+n(out.diag0contreDiag1,'DIFFERENTE')+' differentes, '+n(out.diag0contreDiag1,'NON JOUEE')+' non jouees\n');
  process.stdout.write('PREUVE contre la mesure d\'avant : '+n(out.contreAvant,'IDENTIQUE')+' identiques, '+n(out.contreAvant,'DIFFERENTE')+' differentes, '+n(out.contreAvant,'NON JOUEE')+' non jouees\n');
  for(const x of out.contreAvant.concat(out.diag0contreDiag1))if(x.verdict==='DIFFERENTE')process.stdout.write('  DIFFERENTE '+x.course+' '+JSON.stringify(x)+'\n');
}
async function tout(){
  const t0=Date.now();let k=0;
  async function ouvrier(){while(k<taches.length){const i=k++;await jouer(taches[i]);}}
  await Promise.all(Array.from({length:TRAV},ouvrier));
  process.stdout.write('FIN du lot '+LOT+' : '+((Date.now()-t0)/60000).toFixed(1)+' min\n');
  if(LOT!=='ville')preuve();
}
if(A.includes('--seulement-preuve'))preuve();else tout().catch(e=>{process.stdout.write('ERREUR '+(e&&e.stack||e)+'\n');process.exit(1);});
