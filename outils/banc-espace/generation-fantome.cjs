/* LE PRÉ-BÂTI ANNULÉ (route-memoire.js) : histoire de 5 routes, photo rmPrend, une route FANTÔME (palier p1), rmRemet, puis la vraie route X (palier p2) ;
   contre : la même histoire puis X directement. Identiques = la mémoire remise est complète. node generation-fantome.cjs [n=30] [p1=10] [p2=11→ on prend 10/20] */
const C=require('./generation-charge.cjs'),fs=require('fs'),path=require('path'),vm=require('vm');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};const n=+arg('n',30),p1=+arg('p1',10),p2=+arg('p2',20);
const src=fs.readFileSync(path.resolve(__dirname,'../../code/moteur/route-memoire.js'),'utf8');
function emp(r){let h=2166136261>>>0;const f=x=>{h=Math.imul(h^(Math.round(x*1000)|0),16777619)>>>0;};for(const p of r.ctrl){f(p.x);f(p.y);f(p.z);}if(r.N)for(const p of r.N){f(p.x);f(p.y);f(p.z);}return h.toString(16);}
let ok=0;const ko=[];
for(let k=0;k<n;k++){const H=[1,2,3,4,5].map(i=>(k*977+i*131071)%1000000007),gF=k*31+7,gX=k*53+11;
  const A=C.creer('');vm.runInContext(src,A.ctx);for(const g of H)A.route(g,0);const S=vm.runInContext('rmPrend()',A.ctx);A.ctx.__S=S;A.route(gF,p1);vm.runInContext('rmRemet(__S)',A.ctx);const xa=A.route(gX,p2);
  const B=C.creer('');for(const g of H)B.route(g,0);const xb=B.route(gX,p2);
  if(emp(xa)===emp(xb))ok++;else ko.push({k,gX,a:xa.marks0.map(m=>m.fig).join(' '),b:xb.marks0.map(m=>m.fig).join(' ')});}
console.log(JSON.stringify({n,p1,p2,identiques:ok,differents:ko.slice(0,5)},null,1));
