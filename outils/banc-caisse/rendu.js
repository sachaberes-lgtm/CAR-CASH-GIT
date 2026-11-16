/* (banc du lot caisse) LA MÊME IMAGE, redessinée et relue DANS LA MÊME TÂCHE (la photo du navigateur rate l'image quand la boucle est figée) :
   window.__bancPose(expr) évalue expr, redessine (composer ou scène) et rend la toile en PNG (data URL), aux pixels de la toile. */
window.__bancPose=function(expr){try{(0,eval)(expr);}catch(e){return 'ERR '+e.message;}
  const S=dbgScene(),rd=S.rdr,pn=performance.now,dn=Date.now,mr=Math.random;let g=12345;window.__bancT=window.__bancT||pn.call(performance); /* l'horloge et le hasard FIGÉS pendant le rendu */
  performance.now=function(){return window.__bancT;};Date.now=function(){return 1.7e12;};Math.random=function(){g=(g*16807)%2147483647;return g/2147483647;};
  try{for(let k=0;k<4;k++){try{dbgLoupe({rendre:1});}catch(e){rd.render(S.scene,S.cam);}}return rd.domElement.toDataURL('image/png');} /* QUATRE rendus, le dernier relu : le premier après la boucle diffère, et le ciel se dessine en deux temps (une image sur deux) — même parité à chaque pose */finally{performance.now=pn;Date.now=dn;Math.random=mr;}};
1
