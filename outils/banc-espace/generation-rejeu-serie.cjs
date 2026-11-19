/* la même série (graines du crible, base 20261118) rejouée : node generation-rejeu-serie.cjs palier n sortie.json [lent] — compare ensuite deux sorties */
const C=require('./generation-charge.cjs'),fs=require('fs');const [p,n,out,lent]=process.argv.slice(2);
let a=(20261118+(+p)*7919)>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const M=C.creer('',{lent:lent==null?1:+lent});const S=[];for(let i=0;i<30+(+n);i++){const g=(f()*1e9)|0;const r=M.route(g,+p);S.push([g,r.marks0.map(m=>m.fig).join(' '),Math.round(r.ms)]);}
fs.writeFileSync(out,JSON.stringify(S));
