/* LES RACCOURCIS DE L'ORBITE, EN DÉTAIL (2026-11-15, après le vérificateur : « R6 p0 échoue toujours ») — le juge commun (juge-page.js) tel quel,
   mais il rend chaque raccourci : abscisse, gain, vitesses qui le prennent (×croisière), et le module où il part / où il se pose.
   node outils/banc-routes/raccourcis-orbite.cjs <racine> [paliers=0] [graines=1-8]   (SEARCH='?orbrac=0' pour une variante) */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=path.resolve(process.argv[2]);const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const JP=process.env.JUGE||'C:/Users/sacha/AppData/Local/Temp/claude/99debcfcb46141a2/41173955-e94a-4cd1-b554-6f38afff3dc5/scratchpad/wt-juge/outils/banc-juge/juge-page.js';
let src=fs.readFileSync(JP,'utf8');
const a9='rac:racs.length,';if(src.split(a9).length!==2)throw new Error('juge-page.js a changé : '+a9);
src=src.replace(a9,'_racs:racs.map(function(r){return {s:r.s,s1:r.s1,gain:r.gain,vm:Array.from(r.vm).sort()};}),'+a9);
/* où se pose chaque tir réussi : on garde la pose la plus lointaine par seau */
const b9='s9.gain=Math.max(s9.gain,Math.round(gain));';if(src.split(b9).length!==2)throw new Error('juge-page.js a changé : '+b9);
src=src.replace(b9,b9+'s9.pose=Math.max(s9.pose||0,Math.round(S[r.j]));');
const c9='else racs.push({s:s9.s,s1:s9.s,gain:s9.gain,vm:new Set(s9.vm)});';if(src.split(c9).length!==2)throw new Error('juge-page.js a changé : '+c9);
src=src.replace('if(l&&s9.s-l.s1<=200){l.s1=s9.s;l.gain=Math.max(l.gain,s9.gain);','if(l&&s9.s-l.s1<=200){l.s1=s9.s;l.gain=Math.max(l.gain,s9.gain);l.pose=Math.max(l.pose,s9.pose);').replace(c9,'else racs.push({s:s9.s,s1:s9.s,gain:s9.gain,pose:s9.pose,vm:new Set(s9.vm)});');
src=src.replace('return {s:r.s,s1:r.s1,gain:r.gain,','return {s:r.s,s1:r.s1,pose:r.pose,gain:r.gain,');
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const jc=vm.createContext({Math,performance,Float64Array,Uint8Array,Map,Set,Array,Object,Number,String,JSON,console,Infinity,isNaN});jc.window=jc;vm.runInContext(src,jc);
const PAL=(arg('paliers')||'0').split(',').map(Number),G=(arg('graines')||'1-8').split('-').map(Number);
const v3=function(v,k){return [+v.x.toFixed(k),+v.y.toFixed(k),+v.z.toFixed(k)];};
for(const p of PAL){let nOk=0,nG=0;for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p);nG++;
  const o={carte:'espace',graine:g,palier:p,vP:r.vw,half:28,ctrl:r.ctrl.map(function(v){return v3(v,2);}),N:r.N?r.N.map(function(v){return v3(v,3);}):null,ctrl0:r.ctrl0.map(function(v){return v3(v,2);}),marks:r.marks0.map(function(m){return Object.assign({},m,{f:undefined});})};
  const j=jc.__juge(o,{});const at=function(s){const m=j.mods.find(function(m){return s>=m[1]-30&&s<=m[2]+30;});return m?m[0].replace(/^(la |le |l')/,''):'liaison';};
  const ok=j.rac>=2&&j.racRobustes>=1;if(ok)nOk++;
  console.log('p'+p,'g'+g,'R6',j.rac+'('+j.racRobustes+')',ok?'✓':'✗','R7',j.sautable+'%','·',j._racs.map(function(x){return x.s+'-'+x.s1+'→'+x.pose+' ['+at(x.s)+'→'+at(x.pose)+'] +'+x.gain+' m ×'+x.vm.join('/');}).join(' | '));}
  console.log('p'+p,'routes qui passent R6 :',nOk+'/'+nG);}
