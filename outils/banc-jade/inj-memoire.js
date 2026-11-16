/* (2026-11-14, optimiseur de Jade, banc) LA MÉMOIRE DE LA VALLÉE, en compteurs DÉTERMINISTES (le tas JS après ramasse-miettes varie de 115 à 232 Mo d'une
   page à l'autre sur la même graine : inutilisable) — glissé dans la fonction du jeu par sonde-tel.cjs (INJECTE=<ce fichier>), sur wt-avant comme sur la branche :
   les gabarits taillés (grilles, quatre géométries, cubes fins, listes de cases), les familles d'instances (matrices gardées, tampons), les maillages de la
   racine, et ce que la carte graphique tient (géométries et textures vivantes de three). Rien n'est écrit. */
window.dbgJadeMemoire=function(){const o={gab:0,grille:0,geo:0,fin:0,cases:0,fam:0,inst:0,famOct:0,racineOct:0,quartiers:0,col:0};
  const og=function(g){if(!g)return 0;let b=0;for(const k in g.attributes){const a=g.attributes[k];if(a&&a.array&&!a.isInstancedBufferAttribute)b+=a.array.byteLength;}if(g.index&&g.index.array)b+=g.index.array.byteLength;return b;};
  const P=(JADE.geos&&JADE.geos.p)||[];
  for(const T9 of P){if(!T9)continue;o.gab++;o.grille+=T9.G&&T9.G.d?T9.G.d.byteLength:0;for(const g of (T9.geo||[]))o.geo+=og(g);o.fin+=og(T9.fin);o.cases+=(T9.tops||[]).length+(T9.cor||[]).length+(T9.des||[]).length;}
  for(const F of (JADE.fam||[])){o.fam++;o.inst+=F.n;o.famOct+=F.M.byteLength+F.J.byteLength+F.im.instanceMatrix.array.byteLength+(F.aJ?F.aJ.array.byteLength:0)+(F.qk?F.qk.byteLength:0);}
  for(const FF of (FIN.fam||[]))if(FF)o.famOct+=FF.im.instanceMatrix.array.byteLength+FF.aJ.array.byteLength;
  if(JADE.root)JADE.root.traverse(function(x){if(x.geometry&&!x.isInstancedMesh)o.racineOct+=og(x.geometry);if(x.isInstancedMesh&&x.geometry&&x.geometry.attributes.aB)o.racineOct+=x.geometry.attributes.aB.array.byteLength+x.instanceMatrix.array.byteLength;});
  o.quartiers=JADE.quart?JADE.quart.length:0;o.col=JADE.col?JADE.col.P.length:0;
  for(const k of ['grille','geo','fin','famOct','racineOct'])o[k]=+(o[k]/1048576).toFixed(2);
  o.cases=Math.round(o.cases/1000)+'k';const r=renderer.info.memory;o.gpuGeo=r.geometries;o.gpuTex=r.textures;o.progs=renderer.info.programs?renderer.info.programs.length:null;
  return o;};
