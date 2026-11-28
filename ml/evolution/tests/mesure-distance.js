/* ===== LA DISTANCE DE NAISSANCE (28/11/2026, lot « regles » : le seuil alarmeDistance sur 121 genes) =====
   La distance genetique moyenne d'une population de mu (20) a la naissance (generation0 d'evoluer.js, recopiee) et sa somme sur les genes ; avec
   l'urne des reels lus et avec l'ancienne. usage : node ml/evolution/tests/mesure-distance.js [graines 200] [temoin c0025]   (quelques secondes, aucune course) */
'use strict';
const path=require('path'),D=path.join(__dirname,'..');
const C=require(path.join(D,'commun')),Gn=require(path.join(D,'genome')),Gr=require(path.join(D,'graines'));
const cfg=C.lireConfig();cfg.temoin=process.argv[3]||'c0025';
function naissance(graine,urneComplete){
  const rng=Gr.mulberry32(graine>>>0),T=Gn.genomeTemoin(cfg),V=[T],vus=new Set([Gn.idDe(T)]),g0=cfg.generation0;
  while(V.length<cfg.mu){let g=Gn.muter(T,rng,{phase:'A',cfg,genes:g0.genesMin+rng.entier(g0.genesMax-g0.genesMin+1),sigma:g0.sigma,urneComplete}).genome,id=Gn.idDe(g),e=0;
    while(vus.has(id)&&e<cfg.essaisDoublon){g=Gn.muter(g,rng,{phase:'A',cfg,urneComplete}).genome;id=Gn.idDe(g);e++;}vus.add(id);V.push(g);}
  let s=0,n=0;for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){s+=Gn.distance(V[i],V[j]);n++;}return s/n;}
const k=+(process.argv[2]||200);
for(const u of [false,true]){
  const vraie=naissance(cfg.graineMaitre,u);let s=0,mn=9,mx=0;for(let i=0;i<k;i++){const d=naissance(1000+i,u);s+=d;mn=Math.min(mn,d);mx=Math.max(mx,d);}
  console.log((u?'ancienne urne':'nouvelle urne')+' : graineMaitre '+vraie.toFixed(5)+' (somme '+(vraie*Gn.BORNES.length).toFixed(3)+') ; '+k+' graines : moyenne '+(s/k).toFixed(5)+' [min '+mn.toFixed(5)+', max '+mx.toFixed(5)+'] somme '+(s/k*Gn.BORNES.length).toFixed(3));}
