/* Banc Node : l'icosphère des roches de l'orbite, indexée ou non (2026-11-14, v7.2).
   Usage : node outils/banc-routes/roches-index.cjs [racine]
   Rejoue la fonction rochesIndexe de code/maps/orbite-roches.js sur la géométrie du jeu (three du vendor),
   compte les sommets que le vertex shader calcule par roche, et vérifie que les triangles sont les MÊMES
   (mêmes positions au bit près, même ordre des coins). */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const R=path.resolve(process.argv[2]||'.');
const ctx={window:{},self:{},console};ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R,'VERSION PRINCIPALE/vendor/three.min.js'),'utf8'),ctx);
const THREE=ctx.THREE||ctx.window.THREE;
const src=fs.readFileSync(path.join(R,'code/maps/orbite-roches.js'),'utf8');
const m=src.match(/function rochesIndexe\(g\)\{[\s\S]*?\n\}/);if(!m)throw new Error('rochesIndexe introuvable');
const rochesIndexe=new Function('THREE','return '+m[0])(THREE);
for(const det of [3,1]){
  const g0=new THREE.IcosahedronGeometry(1,det),g=g0.index?g0.toNonIndexed():g0,P=g.attributes.position.array;
  const gi=rochesIndexe(g),Q=gi.attributes.position.array,I=gi.index.array;
  let diff=0;for(let k=0;k<I.length;k++)for(let c=0;c<3;c++)if(Q[I[k]*3+c]!==P[k*3+c])diff++;
  console.log(JSON.stringify({detail:det,triangles:P.length/9,sommetsAvant:P.length/3,sommetsApres:Q.length/3,indices:I.length,coinsDifferents:diff,attributs:Object.keys(gi.attributes)}));
}
