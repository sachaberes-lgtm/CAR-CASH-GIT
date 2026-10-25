#!/usr/bin/env node
/* LE CIEL SE COMPILE EN WebGL1 (24/10, relecture RENDU)
   usage : node preuve-ciel-webgl1.cjs <index.html corrigé> [index.html ancien]
   Le VRAI code du dôme (de `const SUN_DIR=` jusqu'à `let FOG_N=`) est rejoué avec un THREE bouchon qui garde chaque ShaderMaterial.
   Pour chacun des programmes du ciel (plein, basN, netN, basV, netV, cy, jd), on prépare le texte comme le ferait le préprocesseur GLSL :
   · en WebGL1 (__VERSION__ 100) : aucune fonction propre au GLSL ES 3.00 (textureGrad, texelFetch, textureLod, textureSize) ne doit rester,
     et dFdx/dFdy/fwidth exigent `extensions.derivatives` (three ne pose la directive OES_standard_derivatives que sur demande) ;
   · en WebGL2 (__VERSION__ 300), avec l'ancien fichier : le texte préparé doit être IDENTIQUE à celui d'avant (rien ne change en WebGL2).
   Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs=require('fs'),vm=require('vm');
function programmes(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const a=src.indexOf('const SUN_DIR=new THREE.Vector3('),b=src.indexOf('\nlet FOG_N=',a);
  if(a<0||b<0)throw new Error(chemin+' : repères du ciel introuvables');
  const morceau=src.slice(a,b);
  const V=function(x,y,z,w){this.x=x||0;this.y=y||0;this.z=z||0;this.w=w==null?1:w;};
  V.prototype.normalize=function(){return this;};V.prototype.set=function(){return this;};
  const THREE={Vector2:V,Vector3:V,Vector4:V,Color:function(){},BackSide:1,
    ShaderMaterial:function(o){Object.assign(this,o);},SphereGeometry:function(){},Mesh:function(g,m){this.material=m;this.userData={};}};
  const ctx={THREE:THREE,location:{search:''},scene:{add:function(){}},console:console};
  vm.createContext(ctx);
  vm.runInContext(morceau+'\n;this.__ciel=skyDome.userData.ciel;',ctx);
  const C=ctx.__ciel,out={};
  for(const k of ['plein','basN','netN','basV','netV','cy','jd'])if(C[k])out[k]={fs:C[k].fragmentShader,der:!!(C[k].extensions&&C[k].extensions.derivatives)};
  return out;
}
function prepare(fs9,version){ // le préprocesseur, pour les seuls `#if __VERSION__…` (les autres directives restent, leurs deux côtés gardés)
  const L=fs9.split('\n'),pile=[],o=[];
  const actif=()=>pile.every(p=>p.actif);
  for(const l of L){const t=l.trim();
    let m=/^#if\s+__VERSION__\s*(>=|>|<|<=|==)\s*(\d+)/.exec(t);
    if(m){const v=+m[2],op=m[1],ok=op==='>='?version>=v:op==='>'?version>v:op==='<'?version<v:op==='<='?version<=v:version===v;pile.push({ver:1,actif:ok});continue;}
    if(/^#(if|ifdef|ifndef)\b/.test(t)){pile.push({ver:0,actif:true});o.push(l);continue;}
    if(/^#else\b/.test(t)){const p=pile[pile.length-1];if(p&&p.ver){p.actif=!p.actif;continue;}o.push(l);continue;}
    if(/^#endif\b/.test(t)){const p=pile.pop();if(p&&p.ver)continue;o.push(l);continue;}
    if(actif())o.push(l);}
  return o.join('\n');
}
function juge(chemin){
  const P=programmes(chemin),fautes=[];
  for(const k in P){const t=prepare(P[k].fs,100);
    const es3=(t.match(/\b(textureGrad|texelFetch|textureLod|textureSize)\s*\(/g)||[]);
    const der=/\b(dFdx|dFdy|fwidth)\s*\(/.test(t);
    if(es3.length)fautes.push(k+' : '+es3.length+' appel(s) GLSL ES 3.00 en WebGL1 ('+[...new Set(es3.map(s=>s.replace(/\s*\($/,'')))].join(', ')+')');
    if(der&&!P[k].der)fautes.push(k+' : dFdx/dFdy sans extensions.derivatives (pas de directive OES_standard_derivatives en WebGL1)');}
  console.log(chemin+'\n  programmes du ciel : '+Object.keys(P).join(' · ')+'\n  '+(fautes.length?fautes.join('\n  '):'WebGL1 : aucun appel ES 3.00, dérivées demandées'));
  return {P,ok:!fautes.length};
}
const A=juge(process.argv[2]);let okB=true,memeW2=true;
if(process.argv[3]){const B=juge(process.argv[3]);okB=!B.ok;if(!okB)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');
  for(const k in B.P){if(!A.P[k]||prepare(A.P[k].fs,300)!==prepare(B.P[k].fs,300)){memeW2=false;console.log('  WebGL2 : le programme '+k+' a CHANGÉ');}}
  if(memeW2)console.log('  WebGL2 : les '+Object.keys(B.P).length+' programmes préparés sont identiques à ceux d\'avant');}
const ok=A.ok&&okB&&memeW2;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
