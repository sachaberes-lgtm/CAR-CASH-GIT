const fs=require('fs');const P=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const carte=JSON.parse(fs.readFileSync(__dirname+'/carte.json','utf8'));
const fichier=l=>{for(const [f,a,b] of carte)if(l>=a&&l<=b)return f+':'+(l-a+1);return '?';};
const byId=new Map();for(const n of P.nodes)byId.set(n.id,n);const parent=new Map();for(const n of P.nodes)for(const c of n.children||[])parent.set(c,n.id);
const self=new Map();for(let i=0;i<P.samples.length;i++)self.set(P.samples[i],(self.get(P.samples[i])||0)+(P.timeDeltas[i]||0));
const incl=new Map();for(const [id,us] of self){let k=id;while(k!==undefined){incl.set(k,(incl.get(k)||0)+us);k=parent.get(k);}}
const nom=n=>{const cf=n.callFrame;const inl=/index\.html/.test(cf.url);return (cf.functionName||'(anonyme)')+' @ '+(inl?fichier(cf.lineNumber+1):(cf.url.split('/').pop()||'(natif)')+':'+(cf.lineNumber+1));};
// temps inclusif par nom (fusion des nœuds de même nom, sans double compte : on ne somme que les nœuds dont aucun ancêtre n'a le même nom)
const I=new Map();for(const n of P.nodes){const k=nom(n);let p=parent.get(n.id),dup=false;while(p!==undefined){if(nom(byId.get(p))===k){dup=true;break;}p=parent.get(p);}if(!dup)I.set(k,(I.get(k)||0)+(incl.get(n.id)||0));}
console.log('=== TEMPS INCLUSIF (ms), top 45 hors racine ===');for(const [k,v] of [...I].sort((a,b)=>b[1]-a[1]).slice(0,45))console.log((v/1000).toFixed(0).padStart(7),k);
// les enfants directs du (des) script(s) de tête : les nœuds anonymes à la ligne d'ouverture du grand script, et leurs enfants
console.log('\n=== ENFANTS DU NIVEAU DU SCRIPT (nœuds dont le parent est (root) ou (program)) ===');
for(const n of P.nodes){const p=parent.get(n.id);const pn=p!==undefined?byId.get(p).callFrame.functionName:'';if(pn==='(root)'){const v=incl.get(n.id)||0;if(v>20000)console.log((v/1000).toFixed(0).padStart(7),nom(n));}}
