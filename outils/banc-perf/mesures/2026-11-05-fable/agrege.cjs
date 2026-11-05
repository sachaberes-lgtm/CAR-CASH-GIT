// Agrège un .cpuprofile : temps propre par fonction, et par LIGNE du script en ligne d'index.html → fichier de code/.
const fs=require('fs');const P=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const carte=JSON.parse(fs.readFileSync(__dirname+'/carte.json','utf8'));
const fichier=l=>{for(const [f,a,b] of carte)if(l>=a&&l<=b)return f+':'+(l-a+1);return '?';};
const byId=new Map();for(const n of P.nodes)byId.set(n.id,n);
const self=new Map();let tot=0;
for(let i=0;i<P.samples.length;i++){const d=P.timeDeltas[i]||0;tot+=d;self.set(P.samples[i],(self.get(P.samples[i])||0)+d);}
const F=new Map(),L=new Map();
for(const [id,us] of self){const n=byId.get(id),cf=n.callFrame;const inl=/index\.html/.test(cf.url);
  const k=(cf.functionName||'(anonyme)')+' @ '+(inl?fichier(cf.lineNumber+1):(cf.url.split('/').pop()||'(natif)')+':'+(cf.lineNumber+1));
  F.set(k,(F.get(k)||0)+us);
  if(n.positionTicks&&inl){const sum=n.positionTicks.reduce((a,p)=>a+p.ticks,0)||1;for(const p of n.positionTicks){const kk=fichier(p.line)+' (index.html:'+p.line+')';L.set(kk,(L.get(kk)||0)+us*p.ticks/sum);}}}
const top=(m,n)=>[...m].sort((a,b)=>b[1]-a[1]).slice(0,n);
console.log('total échantillonné',(tot/1e6).toFixed(2),'s');
console.log('\n=== TEMPS PROPRE PAR FONCTION (ms) ===');for(const [k,v] of top(F,40))console.log((v/1000).toFixed(0).padStart(7),k);
console.log('\n=== TEMPS PROPRE PAR LIGNE DU SCRIPT EN LIGNE (ms) → code/ ===');for(const [k,v] of top(L,60))console.log((v/1000).toFixed(0).padStart(7),k);
// par fichier de code/
const D=new Map();for(const [k,v] of L){const f=k.split(':')[0];D.set(f,(D.get(f)||0)+v);}
console.log('\n=== PAR FICHIER code/ (ms) ===');for(const [k,v] of top(D,30))console.log((v/1000).toFixed(0).padStart(7),k);
