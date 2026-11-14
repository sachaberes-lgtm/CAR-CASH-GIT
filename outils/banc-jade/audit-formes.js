(async function(){
  /* (2026-11-14) l'audit des FORMES de Jade : --auditfile de outils/banc-maps/banc.cjs gen. Les crochets dbgJadePil / dbgJadePan sont dans le jeu (jade-secoue.js) ;
     sur une référence d'avant (wt-avant), les servir avec outils/banc-jade/serveur-sonde.cjs, qui les injecte. Les mesures de mémoire et d'image d'ABORD : dbgJadePil(1)
     taille ensuite tout le catalogue (la planche des silhouettes, le coût du catalogue entier). */
  const o={};
  try{const a=dbgJadeAudit();o.audit=a&&{couloir:a.couloir,frole:a.frole,panneaux:a.panneaux,flottants:a.flottants,cascades:a.cascades,temoin:a.temoin,emp:a.emp,n:a.n};}catch(e){o.audit='erreur : '+e.message;}
  try{const j=dbgJade();o.jade={triangles:j.triangles,appels:j.appels,fins:j.fins,triFins:j.triFins,finPrets:j.finPrets,err:j.err,montagnes:j.montagnes,rochers:j.rochers,arbres:j.arbres,cascades:j.cascades,cascPlateaux:j.cascPlateaux,ms:j.ms};}catch(e){o.jade='erreur : '+e.message;}
  try{o.a3=dbgJadeA&&dbgJadeA();if(o.a3)o.a3={famille:o.a3.famille,scenes:o.a3.scenes||o.a3.noms||null,note:o.a3.note};}catch(e){}
  try{o.regle=dbgJadeRegle();}catch(e){o.regle='erreur : '+e.message;}
  try{o.pan=dbgJadePan();}catch(e){o.pan='erreur : '+e.message;}
  try{o.gab=dbgGabarits();}catch(e){}
  try{const r=dbgScene().rdr.info;o.info={calls:r.render.calls,tri:r.render.triangles,geo:r.memory.geometries,tex:r.memory.textures,prog:r.programs?r.programs.length:null};}catch(e){}
  try{const a=dbgAppels(12);o.appels={appels:a.appels,triangles:a.triangles,liste:a.liste};}catch(e){}
  try{o.tas=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null;}catch(e){}
  try{o.uni=dbgUniformes();}catch(e){}
  try{const p0=dbgJadePil();o.palette=p0&&{nTpl:p0.nTpl,octGrilles:p0.octGrilles,octGeos:p0.octGeos,gabMs:p0.gabMs};}catch(e){}
  try{o.pil=dbgJadePil(1);}catch(e){o.pil='erreur : '+e.message;}
  return o;
})()
