#!/usr/bin/env node
/* tas-diff.cjs (2026-11-07, Perf 3 — P1) : compare deux instantanés de tas (.heapsnapshot, CDP HeapProfiler.takeHeapSnapshot) par CONSTRUCTEUR.
   Usage : node outils/banc-perf/tas-diff.cjs avant.heapsnapshot apres.heapsnapshot [N=40]
   Le « self size » de tous les nœuds d'un même nom est additionné (objets : le nom du constructeur ; chaînes, tableaux, fermetures, code,
   « system / JSArrayBufferData » = les tampons typés hors tas : géométries, PCM, canvas…). Sort les N constructeurs qui grossissent le plus. */
const fs=require('fs');
function lit(f){
  const d=JSON.parse(fs.readFileSync(f,'utf8')),m=d.snapshot.meta,F=m.node_fields,nf=F.length,T=m.node_types[0];
  const it=F.indexOf('type'),inom=F.indexOf('name'),iss=F.indexOf('self_size'),S=d.strings,N=d.nodes,tot=new Map(),cnt=new Map();
  for(let i=0;i<N.length;i+=nf){
    const ty=T[N[i+it]],nom=S[N[i+inom]];let k;
    if(ty==='object')k=nom;else if(ty==='string'||ty==='concatenated string'||ty==='sliced string')k='(chaîne)';
    else if(ty==='closure')k='(fermeture)';else if(ty==='array')k='(tableau '+nom+')';else if(ty==='code')k='(code)';
    else if(ty==='native')k='(natif '+nom+')';else if(ty==='hidden'||ty==='synthetic')k='('+ty+' '+nom.slice(0,40)+')';else k='('+ty+')';
    tot.set(k,(tot.get(k)||0)+N[i+iss]);cnt.set(k,(cnt.get(k)||0)+1);
  }
  return {tot,cnt,nodes:N.length/nf,taille:[...tot.values()].reduce((a,b)=>a+b,0)};
}
const [a,b,n]=[process.argv[2],process.argv[3],+process.argv[4]||40];
const A=lit(a),B=b?lit(b):null;
if(!B){const L=[...A.tot].sort((x,y)=>y[1]-x[1]).slice(0,n);console.log('total',(A.taille/1048576).toFixed(1),'Mo,',A.nodes,'nœuds');for(const [k,v] of L)console.log((v/1048576).toFixed(2).padStart(8),'Mo',String(A.cnt.get(k)).padStart(9),k);process.exit(0);}
console.log('A',(A.taille/1048576).toFixed(1),'Mo',A.nodes,'nœuds · B',(B.taille/1048576).toFixed(1),'Mo',B.nodes,'nœuds · Δ',((B.taille-A.taille)/1048576).toFixed(1),'Mo');
const L=[];for(const [k,v] of B.tot)L.push([k,v-(A.tot.get(k)||0),(B.cnt.get(k)||0)-(A.cnt.get(k)||0),v]);
L.sort((x,y)=>y[1]-x[1]);
console.log('  Δ Mo   Δ nombre     B Mo  constructeur');
for(const [k,d,dc,v] of L.slice(0,n))console.log((d/1048576).toFixed(2).padStart(7),String(dc).padStart(10),(v/1048576).toFixed(2).padStart(9),k);
