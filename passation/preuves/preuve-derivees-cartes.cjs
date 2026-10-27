#!/usr/bin/env node
/* LES DÉRIVÉES DES SHADERS DES CARTES EN WEBGL 1 (24/10, relecture M2 : forêt, glacier, dunes)
   usage : node preuve-derivees-cartes.cjs <index.html corrigé> [index.html ancien]
   En WebGL 1, un fragment shader qui lit dFdx / dFdy / fwidth ne compile qu'avec #extension GL_OES_standard_derivatives, que three r128 ne
   pose que si la matière a `extensions:{derivatives:true}` (en WebGL 2 : rien, le programme est le même). Sans elle, la matière ne se dessine
   pas du tout. La preuve lit dans le fichier les VRAIES fonctions foretMats() et banqMats() (et leurs shaders), les exécute avec un THREE de
   bouchons, et vérifie chaque ShaderMaterial rendu : s'il lit une dérivée, la directive doit être demandée.
   Les DUNES : leurs matières ne sont bâties que si DUNES_OK (= CANYON_OK = renderer.capabilities.isWebGL2) — la carte n'existe pas en
   WebGL 1 : SANS OBJET, vérifié dans le texte. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs=require('fs'),vm=require('vm');
const DER=/\b(dFdx|dFdy|fwidth)\b/;
function tranche(src,debut,fin){const a=src.indexOf(debut);if(a<0)return null;const b=src.indexOf(fin,a);if(b<0)return null;return src.slice(a,b+fin.length);}
function releve(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const tF=tranche(src,'const FG_BRUIT=','return FORET.mats=M;}'),tB=tranche(src,'const BK_LUM=','return BANQ.mats=M;}');
  if(!tF||!tB){console.log(chemin+'\n  repère introuvable : '+(!tF?'FG_BRUIT … foretMats':'BK_LUM … banqMats'));return null;}
  class Mat{constructor(p){this.extensions={derivatives:false};Object.assign(this,p||{});}}
  const prox=new Proxy({},{get:()=>({value:0})});
  const ctx={console:console,
    THREE:{ShaderMaterial:Mat,SpriteMaterial:Mat,UniformsLib:{fog:{}},UniformsUtils:{clone:o=>Object.assign({},o)},Color:class{},Vector3:class{},DoubleSide:2,AdditiveBlending:2},
    FORET:{mats:null},BANQ:{mats:null},FOR_U:{},BK_U:prox,lampTex:{},BK_RECALE:true,
    forFleursTex:()=>({}),forAilesTex:()=>({}),forLuneTex:()=>({}),forLoupTex:()=>({})};
  vm.createContext(ctx);
  vm.runInContext(tF+'\n'+tB+'\n;this.__F=foretMats();this.__B=banqMats();',ctx);
  const fautes=[],vus=[];
  for(const [nom,M] of [['forêt',ctx.__F],['glacier',ctx.__B]])for(const k in M){const m=M[k];if(!(m instanceof Mat)||m.fragmentShader==null)continue;
    const lit=DER.test(m.fragmentShader)||DER.test(m.vertexShader||'');if(!lit)continue;
    const ok=!!(m.extensions&&m.extensions.derivatives);vus.push(nom+'.'+k+(ok?' ✓':' ✗'));if(!ok)fautes.push(nom+'.'+k);}
  const dunesW2=/const DUNES_OK=CANYON_OK\b/.test(src)&&/const CANYON_OK=!!\(renderer\.capabilities&&renderer\.capabilities\.isWebGL2\)/.test(src);
  console.log(chemin+'\n  matières qui lisent une dérivée : '+(vus.join(' · ')||'aucune')+'\n  dunes : '+(dunesW2?'WebGL 2 seulement (DUNES_OK = isWebGL2) : sans objet':'⚠ la carte n\'est plus réservée au WebGL 2 — DN_FS / DN_AFS lisent dFdx et fwidth, DN_MVS gl_VertexID : à revoir'));
  return {fautes:fautes,dunesW2:dunesW2};}
const a=releve(process.argv[2]);if(!a){console.log('PREUVE KO — repères introuvables');process.exit(1);}
const okA=!a.fautes.length&&a.dunesW2;
let okB=true;if(process.argv[3]){const b=releve(process.argv[3]);okB=!!b&&b.fautes.length>0;if(!okB)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');}
console.log(okA&&okB?'PREUVE OK':'PREUVE KO'+(a.fautes.length?' — sans l\'extension des dérivées (ne compilent pas en WebGL 1) : '+a.fautes.join(', '):'')+(a.dunesW2?'':' — dunes hors WebGL 2'));
process.exit(okA&&okB?0:1);
