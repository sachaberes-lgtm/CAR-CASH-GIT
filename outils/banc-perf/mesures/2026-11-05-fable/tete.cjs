const fs=require('fs');const P=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const carte=JSON.parse(fs.readFileSync(__dirname+'/carte.json','utf8'));
const fichier=l=>{for(const [f,a,b] of carte)if(l>=a&&l<=b)return f+':'+(l-a+1);return '?';};
const byId=new Map();for(const n of P.nodes)byId.set(n.id,n);const parent=new Map();for(const n of P.nodes)for(const c of n.children||[])parent.set(c,n.id);
const self=new Map();for(let i=0;i<P.samples.length;i++)self.set(P.samples[i],(self.get(P.samples[i])||0)+(P.timeDeltas[i]||0));
const incl=new Map();for(const [id,us] of self){let k=id;while(k!==undefined){incl.set(k,(incl.get(k)||0)+us);k=parent.get(k);}}
const nom=n=>{const cf=n.callFrame;const inl=/index\.html/.test(cf.url);return (cf.functionName||'(anonyme)')+' @ '+(inl?fichier(cf.lineNumber+1):(cf.url.split('/').pop()||'(natif)')+':'+(cf.lineNumber+1));};
// le nœud du script de tête : parent = (root), nom bibliotheques.html:19 ; on descend d'un cran (le :20) et on liste ses enfants
const tete=P.nodes.filter(n=>nom(n).includes('bibliotheques.html:19')&&byId.get(parent.get(n.id)).callFrame.functionName==='(root)');
for(const t of tete){console.log('TÊTE',nom(t),(incl.get(t.id)/1000).toFixed(0),'ms, self',((self.get(t.id)||0)/1000).toFixed(0));
  let n=t;while(n.children&&n.children.length===1&&nom(byId.get(n.children[0])).includes('bibliotheques.html'))n=byId.get(n.children[0]);
  console.log(' niveau',nom(n),'self',((self.get(n.id)||0)/1000).toFixed(0),'ms');
  const K=(n.children||[]).map(c=>byId.get(c)).sort((a,b)=>(incl.get(b.id)||0)-(incl.get(a.id)||0));
  console.log(' --- enfants directs (inclusif ms) ---');for(const c of K.slice(0,40))console.log(((incl.get(c.id)||0)/1000).toFixed(0).padStart(6),nom(c));
  console.log(' --- lignes de tête les plus chères (self du nœud de tête, par ligne) ---');
  const pt=(n.positionTicks||[]).sort((a,b)=>b.ticks-a.ticks).slice(0,25);const tot=(n.positionTicks||[]).reduce((a,p)=>a+p.ticks,0)||1;
  for(const p of pt)console.log(((self.get(n.id)||0)/1000*p.ticks/tot).toFixed(0).padStart(6),fichier(p.line),'(index.html:'+p.line+')');}
