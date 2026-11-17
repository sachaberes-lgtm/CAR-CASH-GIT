/* (2026-11-17, LES ROUTES UNIQUES) le sac de Jade en chiffres, sans navigateur : N routes DE SUITE (le sac garde sa mémoire d'une route à l'autre, comme dans une séance de jeu).
   node outils/banc-jade/uniques-stat.cjs [n=200] [palier=0] [sans=1 (l'ancien tirage)] [avatar=1 (avec ?jade=avatar)] */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=path.resolve(__dirname,'../..'),lire=function(f){return fs.readFileSync(path.join(RAC,f),'utf8');};
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const n=+(arg('n')||200),p=+(arg('palier')||0),VW={0:78,5:105,10:158,15:236,20:341,27:439};
const src=lire('outils/banc-jade/verbes-node.cjs'),i0=src.indexOf('function creer'),i1=src.indexOf('const ctx=creer');
const creer=new Function('vm','lire','console','performance',src.slice(i0,i1)+';return creer;')(vm,lire,console,performance);
const ctx=creer('?'+(arg('sans')==='1'?'sans=uniques&':'')+(arg('avatar')==='1'?'jade=avatar':''));
ctx.__pal(p,VW[p]);const vus={},prem={},ouv={},cap={},rel={},tri={};let nm=0,mn=99,mx=0,env=0,rac=0,ms=0,ess=0,pire=0,memes=0,der=null,lon=0,exc=0,nEnv=0;const notes=[];
for(let g=1;g<=n;g++){let o;try{o=ctx.__gen(1000+g*7919);}catch(e){exc++;console.log('EXCEPTION g'+g+' '+(e&&e.stack||e).toString().split('\n').slice(0,2).join(' | '));continue;}
  const a=o.a3,S=a.scenes,u=vm.runInContext('JADE.u',ctx);for(const s of new Set(S))vus[s]=(vus[s]||0)+1;prem[S[0]]=(prem[S[0]]||0)+1;const t=S.slice(0,3).join('>');tri[t]=(tri[t]||0)+1;
  if(u){ouv[u.ouv]=(ouv[u.ouv]||0)+1;cap[u.cap]=(cap[u.cap]||0)+1;rel[u.relief]=(rel[u.relief]||0)+1;}
  if(der)memes+=S.filter(function(s){return der.indexOf(s)>=0;}).length;der=S;
  nm+=S.length;mn=Math.min(mn,S.length);mx=Math.max(mx,S.length);env+=a.envers;if(a.envers>0)nEnv++;rac+=a.racOk;ms+=a.ms;ess+=a.notes.length;notes.push(a.note);if(a.note>pire)pire=a.note;lon+=a.lon/a.LC;}
const tr=function(o){return Object.keys(o).sort(function(a,b){return o[b]-o[a];}).map(function(k){return k+' '+o[k];}).join(', ');};
notes.sort(function(a,b){return a-b;});
console.log('palier '+p+', '+n+' routes de suite, exceptions '+exc+' : modules par route '+(nm/n).toFixed(2)+' ['+mn+'-'+mx+'], distincts vus '+Object.keys(vus).length+', repris de la route d\'avant '+(memes/(n-1)).toFixed(2)+' par route');
console.log('  note moy '+(notes.reduce(function(a,b){return a+b;},0)/n).toFixed(2)+' p95 '+notes[Math.floor(.95*n)]+' pire '+pire+' ; essais '+(ess/n).toFixed(1)+' ; '+Math.round(ms/n)+' ms/route ; longueur/visée '+(lon/n).toFixed(2)+' ; envers moy '+(env/n).toFixed(1)+' % ('+nEnv+' routes) ; sauts tenus '+(rac/n).toFixed(2)+'/route');
console.log('  vus (routes) : '+tr(vus));console.log('  1er module ('+Object.keys(prem).length+' différents) : '+tr(prem));
const T=Object.keys(tri).sort(function(a,b){return tri[b]-tri[a];});console.log('  débuts de 3 modules : '+T.length+' différents sur '+n+' ; le plus fréquent '+T[0]+' ×'+tri[T[0]]);
console.log('  ouvertures : '+tr(ouv));console.log('  caps : '+tr(cap));console.log('  reliefs : '+tr(rel));
/* L'UNICITÉ (Sacha, 17/11) : aucune suite de modules jouée deux fois */
{const S=new Set(),ctx2=creer('?');let dup=0;ctx2.__pal(p,VW[p]);for(let g=1;g<=n;g++){const k=ctx2.__gen(1000+g*7919).a3.scenes.join('>');if(S.has(k))dup++;S.add(k);}console.log('  UNICITÉ : '+S.size+' suites différentes sur '+n+' ('+dup+' redite'+(dup>1?'s':'')+')');if(dup&&arg('sans')!=='1')process.exitCode=1;}
