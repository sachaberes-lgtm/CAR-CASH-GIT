// Preuve : les fonctions recopiées dans les Workers (dunes, canyon) n'utilisent-elles que ce que le Worker définit ?
const H='/Users/sachaberes/.hermes/hermes-agent/node_modules/';
const acorn=require(H+'acorn'),{Linter}=require(H+'eslint');
const fs=require('fs'),path=require('path');
const root='/Users/sachaberes/cash-car/debug-gameplay/code';
const fn={};
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(f.endsWith('.js')){const src=fs.readFileSync(p,'utf8');let ast;try{ast=acorn.parse(src,{ecmaVersion:2022,locations:true,allowReturnOutsideFunction:true});}catch(e){console.error('parse KO',p,e.message);continue;}
 for(const n of ast.body)if(n.type==='FunctionDeclaration'){(fn[n.id.name]=fn[n.id.name]||[]).push({file:p,src:src.slice(n.start,n.end)});}}}})(root);
function check(nom,names,header){
  const code=header+'\n'+names.map(n=>{const a=fn[n];if(!a)return '/*MANQUE '+n+'*/';return a[a.length-1].src;}).join('\n')+'\nonmessage=function(e){};';
  const L=new Linter();
  const r=L.verify(code,{languageOptions:{ecmaVersion:2022,sourceType:'script',globals:{self:'readonly',onmessage:'writable',postMessage:'readonly',Math:'readonly',Float32Array:'readonly',Float64Array:'readonly',Uint8Array:'readonly',Int32Array:'readonly',Uint16Array:'readonly',Uint32Array:'readonly',Int8Array:'readonly',Int16Array:'readonly',Array:'readonly',Object:'readonly',Number:'readonly',JSON:'readonly',String:'readonly',Set:'readonly',Map:'readonly',performance:'readonly',console:'readonly',isFinite:'readonly',isNaN:'readonly',Infinity:'readonly',NaN:'readonly',parseFloat:'readonly',parseInt:'readonly',Date:'readonly',Error:'readonly',Boolean:'readonly',Uint8ClampedArray:'readonly',ArrayBuffer:'readonly',Symbol:'readonly'}},rules:{'no-undef':'error'}});
  console.log('==',nom,'doublons:',names.filter(n=>fn[n]&&fn[n].length>1).join(',')||'-');
  const seen={};for(const m of r){const k=m.message;if(seen[k])continue;seen[k]=1;console.log('  L'+m.line+' '+m.message);}
  if(!r.length)console.log('  OK');
}
const cy="'use strict';var CY={},CY_O9={},L=0,ROAD_HALF=28,PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};";
check('canyon',['mulberry32','cyNz','cyBil','cyButteDe','cyButtesH','cyHauteur','cyHauteurVite','cyProfil','cyOmbre','cyMitaines','cyMonuPrevoir','cyMondeCalc'],cy);
check('dunes',['mulberry32','cyNz','cyNzS','cyBil','dnLis','dnDune','dnMesa','dnGeant','dnFar','dnHauteur','dnPf','dnProfil','dnPyr3','dnPrevoir','dnPrevoirDeco','dnOmbre','dnMondeCalc'],"'use strict';var CY={},DN={},DN_O9={},DN_BATI=1,DN_STAR=1,DN_PTE=1,DN_PK=1,DN_FORME={},DN_IMM={},PAL={B:{},b:function(k,d){return d;}};");
const g="'use strict';var GRT={B:12,K:1.6},GRV={nzK:2},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity},GRT_ARETES=[],GRT_TMP={},GRT_AMB=[],GROTTE={},GT={},MV=null,MLL=null;";
const gn=['grtH3','grtN3','grtRoche','grtMonde','grtCh','grtNoyau','grtCreuse1','grtD','grtLit','grtMatieres','grtLum','grtTampons','grtR6','grtMailleNetsG'];
check('grotte',gn,g);
// propriétés lues sur les objets que le Worker initialise : lesquelles ?
const refs={};
for(const n of gn){const a=fn[n];if(!a)continue;const s=a[a.length-1].src;for(const m of s.matchAll(/\b(GRV|GRT|GROTTE|GT|GRT_TMP)\.([A-Za-z0-9_]+)/g)){(refs[m[1]]=refs[m[1]]||new Set()).add(m[2]+'@'+n);}}
for(const k in refs)console.log(k,[...refs[k]].join(' '));
