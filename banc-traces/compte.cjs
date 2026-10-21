const path=require('path');const [,,idx,pal0]=process.argv;const B=require('./charge.cjs')(path.resolve(idx));
const h={};for(let g=1;g<=80;g++){const r=B.trace('volcan',g,+pal0||0);const k='fum'+(r.Q.tours||[]).length+' mod'+r.mods.length;h[k]=(h[k]||0)+1;}
console.log(path.basename(idx),'palier',pal0,JSON.stringify(h));
