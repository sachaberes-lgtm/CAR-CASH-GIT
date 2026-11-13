/* LE JUGE COMMUN EN NODE (la supervision des routes : juge-page.js tel quel, sur les routes de charge.cjs = dbgGenRoute) : les mêmes chiffres que le banc juge, en quelques secondes.
   node juge-node.cjs <racine> [paliers=0,10,20] [graines=1-8] [detail=1] [zones=1]   (SEARCH='?espace=v4' pour une variante ; JUGE=<juge-page.js> pour un autre juge)
   zones=1 : le roulis (°/s réels) par module : part du temps au-dessus de 45, pointe. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=path.resolve(process.argv[2]);const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const JP=process.env.JUGE||'C:/Users/sacha/AppData/Local/Temp/claude/99debcfcb46141a2/41173955-e94a-4cd1-b554-6f38afff3dc5/scratchpad/wt-juge/outils/banc-juge/juge-page.js';
let src=fs.readFileSync(JP,'utf8');const a9='return {profil:profil,';if(src.split(a9).length!==2)throw new Error('juge-page.js a changé : '+a9);
src=src.replace(a9,'return {_taux:opt.taux?taux:undefined,_S:opt.taux?S:undefined,_w:w,'+a9.slice(8));
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const jc=vm.createContext({Math,performance,Float64Array,Map,Set,Array,Object,Number,String,JSON,console,Infinity,isNaN});jc.window=jc;vm.runInContext(src,jc);
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-8').split('-').map(Number),detail=arg('detail')==='1',zones=arg('zones')==='1';
const v3=function(v,k){return [+v.x.toFixed(k),+v.y.toFixed(k),+v.z.toFixed(k)];};
const Z={};let score=0,nR=0;
for(const p of PAL){const rs=[];
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p);
    const o={carte:'espace',graine:g,palier:p,vP:r.vw,half:28,ctrl:r.ctrl.map(function(v){return v3(v,2);}),N:r.N?r.N.map(function(v){return v3(v,3);}):null,ctrl0:r.ctrl0.map(function(v){return v3(v,2);}),marks:r.marks0.map(function(m){return Object.assign({},m,{f:undefined});})};
    const j=jc.__juge(o,{taux:zones});j.graine=g;j.palier=p;rs.push(j);
    const at=function(s){const m=j.mods.find(function(m){return s>=m[1]-30&&s<=m[2]+30;});return m?m[0]:'liaison';};
    if(zones&&j._taux){const S=j._S,w=j._w;for(let k=0;k<j._taux.length;k++){const s=S[k+w-1],nom=at(s),t=j._taux[k];const z=Z[nom]||(Z[nom]={n:0,n45:0,n60:0,max:0});z.n++;if(t>45)z.n45++;if(t>60)z.n60++;if(t>z.max)z.max=t;}}
    if(detail)console.log('p'+p,'g'+g,j.dur+'s','R1',j.t30,'R2',j.t8+'@'+j.t8At,'R3',j.rollMax+'@'+j.rollMaxAt+'['+at(j.rollMaxAt)+'] p95',j.rollP95,'R4',j.gapMax+'@'+j.gapAt,'mods',j.nMods,'R6',j.rac+'('+j.racRobustes+') '+JSON.stringify(j.racPos),'R7',j.sautable+'%','R8',j.envers+'% '+j.enversMaxS+'s','dMin',j.dMin,'·',j.mods.map(function(m){return m[0].replace(/^(la |le |l')/,'')+'@'+m[1];}).join(' '));}
  /* le bilan, règle par règle (juge.cjs) */
  const mx=function(k){return Math.max.apply(null,rs.map(function(r){return r[k];}));},mn=function(k){return Math.min.apply(null,rs.map(function(r){return r[k];}));},moy=function(k){return +(rs.reduce(function(a,r){return a+r[k];},0)/rs.length).toFixed(1);};
  let jac=0;const tous=new Set();for(let i=0;i<rs.length;i++){for(const x of rs[i].noms)tous.add(x);if(i){const A=new Set(rs[i-1].nomsVar||rs[i-1].noms),Bs=new Set(rs[i].nomsVar||rs[i].noms);let inter=0;for(const x of A)if(Bs.has(x))inter++;const uni=new Set([].concat(Array.from(A),Array.from(Bs))).size;jac=Math.max(jac,uni?inter/uni:0);}}
  const nomsOk=rs.every(function(r){return r.nomsAbsents===0&&r.nMods>0;});
  const R={R1:mx('t30')<=10&&moy('t30')<=7,R2:mx('t8')<=5&&moy('t8')<=3,R3:mx('rollMax')<=60&&mx('rollP95')<=45,R4:mx('gapMax')<=15&&(p>0||mn('nMods')>=4),
    R5:nomsOk&&mx('repDeSuite')===0&&mx('maxMeme')<=2&&jac<=.5&&(p>0||tous.size>=12),R6:p>0||(mn('rac')>=2&&mn('racRobustes')>=1),R7:mn('sautable')>=(p>=20?55:p>=10?65:75),R8:mx('envers')<=25&&mx('enversMaxS')<=9.5,R10:mn('dMin')>=8};
  const ok=function(b){return b?'✓':'✗';};for(const k in R){nR++;if(R[k])score++;}
  console.log('p'+p,'| R1',mx('t30'),'moy',moy('t30'),ok(R.R1),'| R2',mx('t8'),'moy',moy('t8'),ok(R.R2),'| R3',mx('rollMax'),'p95',mx('rollP95'),ok(R.R3),'| R4',mx('gapMax')+'s mods≥'+mn('nMods'),ok(R.R4),'| R5 rép',mx('repDeSuite'),'même',mx('maxMeme'),'jac',jac.toFixed(2),'diff',tous.size,ok(R.R5),'| R6',mn('rac')+'('+mn('racRobustes')+')',ok(R.R6),'| R7',mn('sautable')+'%',ok(R.R7),'| R8',mx('envers')+'% '+mx('enversMaxS')+'s',ok(R.R8),'| R10',mn('dMin'),ok(R.R10),'| durée',moy('dur')+'s');}
console.log('NOTE',score+'/'+nR);
if(zones)for(const k of Object.keys(Z).sort(function(a,b){return Z[b].n45/Z[b].n-Z[a].n45/Z[a].n;}))console.log('   ',k.padEnd(34),'>45 : '+(Z[k].n45/Z[k].n*100).toFixed(0).padStart(3)+'% · >60 : '+(Z[k].n60/Z[k].n*100).toFixed(0).padStart(3)+'% · pointe',Z[k].max.toFixed(0));
