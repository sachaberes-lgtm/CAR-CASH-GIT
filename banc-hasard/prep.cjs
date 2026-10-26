// Banc des tracés (NON COMMITÉ) : fabrique site-<nom>/ = VERSION PRINCIPALE en liens, index.html = la source + le crochet __ev/__ctrl.
// node prep.cjs [nom] [ref]   — ref = un commit git (« HEAD », « origin/main ») ; sans ref : le fichier de travail.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const nom=process.argv[2]||'apres',ref=process.argv[3]||'';
const RAC=path.resolve(__dirname,'..'),VP=path.join(RAC,'VERSION PRINCIPALE'),DST=path.join(__dirname,'site-'+nom);
fs.rmSync(DST,{recursive:true,force:true});fs.mkdirSync(DST);
for(const e of fs.readdirSync(VP)){if(e==='index.html')continue;fs.symlinkSync(path.join(VP,e),path.join(DST,e));}
let src=ref?cp.execFileSync('git',['-C',RAC,'show',ref+':VERSION PRINCIPALE/index.html'],{maxBuffer:1<<30}).toString('utf8'):fs.readFileSync(path.join(VP,'index.html'),'utf8');
const crochet="window.__ev=function(__c9){return eval(__c9);};window.__ctrl=function(c,m,seed){const sv=LVL.cur;LVL.cur=sfNiveau(c,m||Object.keys(SF_CARTES[c].m)[0]);const rnd=mulberry32(seed);const run=g=>{if(g&&typeof g.next==='function'&&!Array.isArray(g)){let r;do{r=g.next();}while(!r.done);return r.value;}return g;};const p=LVL.cur.piste;let ctrl;try{ctrl=p==='jade'?genJade(rnd):p==='foret'?run(genForet(rnd)):p==='volcan'?run(genVolcan(rnd)):p==='canyon'?run(genCanyon(rnd)):p==='dunes'?run(genDunes(rnd)):p==='banquise'?genBanq(rnd):p==='grotte'?run(genGrotte(rnd)):genCtrl(rnd,new THREE.Vector3(0,0,0),0);}finally{LVL.cur=sv;}return ctrl.map(v=>[v.x,v.y,v.z]);};\n";
const k=src.indexOf('function sfPlayOk(){');if(k<0)throw new Error('sfPlayOk introuvable');
src=src.slice(0,k)+crochet+src.slice(k);
fs.writeFileSync(path.join(DST,'index.html'),src);
console.log('ok',DST,src.length);
