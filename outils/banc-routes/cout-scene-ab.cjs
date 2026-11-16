/* LA SCÈNE BÂTIE, RÉFÉRENCE / BRANCHE, ALTERNÉES (2026-11-15) : lance banc-maps gen avec cout-scene-page.js pour chaque météo (planète) × ordi/téléphone,
   la référence puis la branche (l'ordre s'inverse d'une météo à l'autre), puis écrit le tableau (moyennes sur les graines) ; `lire=1` : le tableau seul.
   node outils/banc-routes/cout-scene-ab.cjs <dossier> portRef=8351 portBr=8350 cdp=9552 graines=2,3,4 meteos=matin,midi,soir tels=0,1 [q=…] [lire=1] */
const cp=require('child_process'),fs=require('fs'),path=require('path');
const D=path.resolve(process.argv[2]),arg=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const RAC=path.resolve(__dirname,'../..'),BANC=path.join(RAC,'outils/banc-maps/banc.cjs'),PAGE=path.join(RAC,'outils/banc-routes/'+arg('page','cout-scene-page.js')); /* page=appels-groupes-page.js : les appels et triangles PAR IMAGE en course (lire avec appels-tableau.cjs) */
const M=arg('meteos','matin,midi,soir').split(','),T=arg('tels','0,1').split(','),Q='poste=max&pioche=0'+(arg('q','')?'&'+arg('q',''):'');
const QUI={ref:arg('portRef','8351'),br:arg('portBr','8350')};
if(arg('lire','0')!=='1'){let k=0;for(const tel of T)for(const me of M){const ordre=(k++%2)?['br','ref']:['ref','br'];for(const qui of ordre){const out=path.join(D,qui+'-'+me+'-tel'+tel);fs.mkdirSync(out,{recursive:true});
  const a=[BANC,'gen','--carte=espace','--meteo='+me,'--graines='+arg('graines','2,3,4'),'--port='+QUI[qui],'--cdp='+arg('cdp','9552'),'--profil=pro-espace-'+qui,'--out='+out,'--q='+Q,'--auditfile='+PAGE];if(tel==='1')a.push('--tel=1');
  const r=cp.spawnSync('node',a,{encoding:'utf8',timeout:1200000,cwd:RAC});console.log(qui,me,'tel'+tel,(/BILAN.*/.exec(r.stdout||'')||['?'])[0].slice(0,120));}}}
/* le tableau */
const lit=function(dir){const f=fs.existsSync(dir)&&fs.readdirSync(dir).find(function(x){return /^gen-.*\.json$/.test(x);});if(!f)return [];let j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));const R=Array.isArray(j)?j:(j.res||[j]);
  return R.map(function(r){let p=r.perso;if(typeof p==='string'){try{p=JSON.parse(p);}catch(e){p=null;}}return p&&p.decor?Object.assign({graine:r.graine},p):null;}).filter(Boolean);};
const moy=function(A,f){return A.length?A.reduce(function(a,x){return a+f(x);},0)/A.length:NaN;},k=function(x){return Math.abs(x)>=1e4?(x/1000).toFixed(0)+'k':x.toFixed(0);};
console.log('| passage | n | scène tri · sommets (réf → branche) | DÉCOR tri · sommets | tampons Mo | géométries · textures · programmes |');console.log('|---|---|---|---|---|---|');
for(const tel of T)for(const me of M){const A=lit(path.join(D,'ref-'+me+'-tel'+tel)),B=lit(path.join(D,'br-'+me+'-tel'+tel));
  const c=function(f){return k(moy(A,f))+' → '+k(moy(B,f));},c1=function(f){return moy(A,f).toFixed(1)+' → '+moy(B,f).toFixed(1);};
  console.log('| '+me+(tel==='1'?' tél.':' ordi')+' | '+A.length+'/'+B.length+' | '+c(function(x){return x.tri;})+' · '+c(function(x){return x.som;})+' | '+c(function(x){return x.decor.tri;})+' · '+c(function(x){return x.decor.som;})+' | '+c1(function(x){return x.Mo;})+' | '+c(function(x){return x.geo;})+' · '+c(function(x){return x.tex;})+' · '+c(function(x){return x.prog;})+' |');
  if(arg('detail','0')==='1')for(const x of A.concat(B))console.log('   ',x.graine,x.tri,x.som,JSON.stringify(x.decor),x.groupes.filter(function(g){return !/^(piste|autoroute|pièces|carrosserie)/.test(g[0]);}).slice(0,8).map(function(g){return g[0]+':'+g[2]+'/'+g[3];}).join(' ; '));}
