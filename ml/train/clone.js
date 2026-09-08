#!/usr/bin/env node
/* ================================================================================================
   CLONE — apprendre a conduire en REGARDANT quelqu'un conduire (clonage comportemental)
   ------------------------------------------------------------------------------------------------
   L'evolution partait de 24 reseaux au hasard : 90 % des bots mouraient en 2 s, le fitness etait
   plat, la selection n'avait rien a se mettre sous la dent. On arrete de partir de zero.

   Ici on prend les parties enregistrees (results/demos/demo-*.json), et on entraine le MEME reseau
   12->16->4 par descente de gradient a repondre ce que le joueur a repondu. Pas de librairie, pas
   de modele externe : backprop a la main, erreur quadratique, tanh.

   Le fichier de sortie (results/cloned-brain.json) porte les poids DANS L'ORDRE EXACT que lit
   MLP.prototype.forward :
       pour chaque neurone cache : [biais, 12 poids]
       pour chaque sortie        : [biais, 16 poids]
   Si cet ordre change dans train.html, il change ici. C'est le seul couplage entre les deux.

   Usage : node clone.js [--epochs 600] [--lr 0.05] [--seed 1] [--quiet]
   ================================================================================================ */
const fs=require('fs'),path=require('path');

const IN=12,HID=16,OUT=4;
const SIZE=(IN+1)*HID+(HID+1)*OUT;                       // 276, comme MLP.SIZE
const argS=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?process.argv[i+1]:d; };
const DEMOS=path.resolve(__dirname,argS('demos',path.join('results','demos')));
const OUTF=path.resolve(__dirname,argS('out',path.join('results','cloned-brain.json')));

const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseFloat(process.argv[i+1]):d; };
const EPOCHS=arg('epochs',600), LR0=arg('lr',0.05), SEED=arg('seed',1);
const QUIET=process.argv.indexOf('--quiet')>0;
// tanh ne touche jamais +-1 : viser 1 tout rond, c'est demander l'infini et tuer le gradient.
const SAT=0.95;

function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rnd=mulberry32(SEED);

/* ---------- 1. LES DEMOS ---------- */
if(!fs.existsSync(DEMOS)){
  console.log('clone.js : aucun dossier '+DEMOS+' — rien a apprendre.');
  console.log('           Lance ENREGISTRER.bat, joue quelques minutes, puis reviens.');
  process.exit(0);
}
const files=fs.readdirSync(DEMOS).filter(f=>/^demo-.*\.json$/.test(f)).sort();
if(!files.length){
  console.log('clone.js : aucune demo dans '+DEMOS+' — rien a apprendre.');
  console.log('           Lance ENREGISTRER.bat, joue quelques minutes, puis reviens.');
  process.exit(0);
}
const X=[],Y=[];
let nAir=0;
for(const f of files){
  let j;
  try{ j=JSON.parse(fs.readFileSync(path.join(DEMOS,f),'utf8')); }
  catch(e){ console.error('  demo illisible, ignoree : '+f+' ('+e.message+')'); continue; }
  if(!j.rows||!j.rows.length){ console.error('  demo vide, ignoree : '+f); continue; }
  if(j.in!==IN){ console.error('  demo au mauvais format ('+j.in+' entrees), ignoree : '+f); continue; }
  for(const r of j.rows){
    if(r.length!==IN+4)continue;
    const x=r.slice(0,IN);
    // les 4 cibles, ramenees dans ce qu'un tanh sait produire
    const cl=v=>Math.max(-SAT,Math.min(SAT,v));
    Y.push([cl(r[IN]), cl(r[IN+1]), r[IN+2]>0.5?SAT:-SAT, cl(r[IN+3])]);
    X.push(x);
    if(x[8]>0.5)nAir++;
  }
  if(!QUIET)console.log('  '+f+' : '+j.rows.length+' pas ('+(j.secondes||'?')+' s)');
}
const N=X.length;
if(N<200){ console.error('\nECHEC : seulement '+N+' pas exploitables. Il en faut quelques milliers.'); process.exit(1); }
console.log('\n'+files.length+' demo(s) · '+N+' pas · '+(N/60/60).toFixed(1)+' min de jeu · '+
            (100*nAir/N).toFixed(0)+'% en vol');
if(nAir/N<0.02)
  console.log('⚠ Presque aucune frame EN VOL : le clone saura rouler mais pas se poser — or c\'est en\n'+
              '  vol que les bots meurent. Refais quelques parties en sautant et en atterrissant.');

/* ---------- 2. MELANGE + COUPE 80/20 ----------
   On melange AVANT de couper : sinon la validation serait la fin d'une seule partie, donc un seul
   bout de piste — on mesurerait la memoire, pas la generalisation. */
const idx=[...Array(N).keys()];
for(let i=N-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const t=idx[i];idx[i]=idx[j];idx[j]=t; }
const nTr=Math.floor(N*0.8);
const TR=idx.slice(0,nTr), VA=idx.slice(nTr);
console.log('entrainement '+TR.length+' pas · validation '+VA.length+' pas\n');

/* ---------- 3. LE RESEAU, A PLAT (meme ordre que MLP.forward) ---------- */
const W=new Float64Array(SIZE), G=new Float64Array(SIZE), V=new Float64Array(SIZE);
const OFF_H=0, OFF_O=(IN+1)*HID;
{ // init Xavier : trop gros, tanh sature des le depart et rien n'apprend
  const sh=Math.sqrt(6/(IN+HID)), so=Math.sqrt(6/(HID+OUT));
  for(let i=0;i<HID;i++){ W[OFF_H+i*(IN+1)]=0; for(let j=0;j<IN;j++) W[OFF_H+i*(IN+1)+1+j]=(rnd()*2-1)*sh; }
  for(let i=0;i<OUT;i++){ W[OFF_O+i*(HID+1)]=0; for(let j=0;j<HID;j++) W[OFF_O+i*(HID+1)+1+j]=(rnd()*2-1)*so; }
}
const h=new Float64Array(HID), o=new Float64Array(OUT), dh=new Float64Array(HID), doo=new Float64Array(OUT);

function forward(x){
  for(let i=0;i<HID;i++){
    let s=W[OFF_H+i*(IN+1)];
    for(let j=0;j<IN;j++) s+=W[OFF_H+i*(IN+1)+1+j]*x[j];
    h[i]=Math.tanh(s);
  }
  for(let i=0;i<OUT;i++){
    let s=W[OFF_O+i*(HID+1)];
    for(let j=0;j<HID;j++) s+=W[OFF_O+i*(HID+1)+1+j]*h[j];
    o[i]=Math.tanh(s);
  }
}
// gradient de l'erreur quadratique, accumule dans G
function backward(x,y){
  let err=0;
  for(let i=0;i<OUT;i++){ const d=o[i]-y[i]; err+=d*d; doo[i]=2*d*(1-o[i]*o[i]); }
  for(let i=0;i<HID;i++){
    let s=0;
    for(let k=0;k<OUT;k++) s+=W[OFF_O+k*(HID+1)+1+i]*doo[k];
    dh[i]=s*(1-h[i]*h[i]);
  }
  for(let i=0;i<OUT;i++){
    const b=OFF_O+i*(HID+1);
    G[b]+=doo[i];
    for(let j=0;j<HID;j++) G[b+1+j]+=doo[i]*h[j];
  }
  for(let i=0;i<HID;i++){
    const b=OFF_H+i*(IN+1);
    G[b]+=dh[i];
    for(let j=0;j<IN;j++) G[b+1+j]+=dh[i]*x[j];
  }
  return err/OUT;
}
function mse(list){
  let e=0;
  for(const k of list){ forward(X[k]); const y=Y[k]; for(let i=0;i<OUT;i++){ const d=o[i]-y[i]; e+=d*d; } }
  return e/(list.length*OUT);
}
// ce qui parle vraiment : le clone prendrait-il la MEME decision que le joueur ?
function accord(list){
  let g=0,n=0,st=0;
  for(const k of list){
    forward(X[k]); const y=Y[k];
    if((o[0]>0)===(y[0]>0)||Math.abs(y[0])<0.1)st++;
    if((o[1]>0.5)===(y[1]>0.5))g++;
    if((o[2]>0.5)===(y[2]>0.5))n++;
  }
  const p=v=>(100*v/list.length).toFixed(1)+'%';
  return {volant:p(st),gaz:p(g),nitro:p(n)};
}

/* ---------- 4. DESCENTE DE GRADIENT (mini-lots, momentum) ---------- */
const BATCH=64, MOM=0.9;
console.log('epoque |  err.entrainement  err.validation');
let bestVal=Infinity, bestW=null, bestEp=0;
for(let ep=1;ep<=EPOCHS;ep++){
  for(let i=TR.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const t=TR[i];TR[i]=TR[j];TR[j]=t; }
  const lr=LR0*(1-0.9*ep/EPOCHS);   // on ralentit en approchant : sinon ca oscille sans se poser
  for(let b=0;b<TR.length;b+=BATCH){
    G.fill(0);
    const end=Math.min(b+BATCH,TR.length), m=end-b;
    for(let k=b;k<end;k++){ forward(X[TR[k]]); backward(X[TR[k]],Y[TR[k]]); }
    for(let i=0;i<SIZE;i++){ V[i]=MOM*V[i]-lr*G[i]/m; W[i]+=V[i]; }
  }
  if(ep%50===0||ep===1){
    const eT=mse(TR), eV=mse(VA);
    console.log(String(ep).padStart(6)+' |  '+eT.toFixed(5)+'            '+eV.toFixed(5));
    if(eV<bestVal){ bestVal=eV; bestW=Float64Array.from(W); bestEp=ep; }
  }
}
// on garde le reseau qui generalisait le mieux, pas le dernier (le dernier peut avoir sur-appris)
if(bestW) W.set(bestW);

/* ---------- 5. VERDICT + SAUVEGARDE ---------- */
const aT=accord(TR), aV=accord(VA);
console.log('\nmeilleure validation : '+bestVal.toFixed(5)+' (epoque '+bestEp+')');
console.log('memes decisions que le joueur — entrainement : volant '+aT.volant+'  gaz '+aT.gaz+'  nitro '+aT.nitro);
console.log('                                validation   : volant '+aV.volant+'  gaz '+aV.gaz+'  nitro '+aV.nitro);
fs.mkdirSync(path.dirname(OUTF),{recursive:true});
fs.writeFileSync(OUTF,JSON.stringify({
  v:1, in:IN, hid:HID, out:OUT, size:SIZE,
  ordre:'par neurone cache [biais,12 poids], puis par sortie [biais,16 poids] — comme MLP.forward',
  demos:files.length, pas:N, partEnVol:+(nAir/N).toFixed(3),
  epoques:EPOCHS, erreurValidation:+bestVal.toFixed(6), accordValidation:aV,
  date:new Date().toISOString(),
  w:Array.from(W,x=>+x.toFixed(6))
},null,1));
console.log('\ncerveau ecrit : '+OUTF);
console.log('Il servira de graine a la generation 0 (TRAIN.newGen). ?clone=0 pour revenir au hasard.');
process.exit(0);
