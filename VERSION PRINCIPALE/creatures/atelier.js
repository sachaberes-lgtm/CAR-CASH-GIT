/* L'ATELIER DES CRÉATURES (2026-10-15) — un Worker : les formes VITRAIL des singes du SOLEIL DE JADE se calculent ICI, hors du fil du jeu.
   MESURÉ : 3,5 s de calcul (trois poses + la course, ~0,9 s chacune sur le Mac du banc) — découpées en tranches de 5 ms dans la page, elles
   demandaient 8 à 13 s de menu ; un joueur qui touchait JOUER tout de suite les faisait finir, et compiler, en pleine course. Ici le menu ne
   paie rien et les formes sont prêtes en quelques secondes. Le jeu envoie {formes:['bonjour',…,'course']} et reçoit, pour chacune, les
   tableaux des deux géométries (lisse, écailles) — transférés, pas copiés ; il refait les BufferGeometry (jsgGeo, dans index.html).
   Sans Worker (file://, refus du navigateur, erreur ici) le jeu repasse au calcul en tranches d'avant : rien ne casse. */
importScripts('../vendor/three.min.js','vitrail.js?v=1','singe.js?v=1');
function paquet(G){const a={};for(const k in G.attributes){const A=G.attributes[k];a[k]=[A.array,A.itemSize];}
  const s=G.boundingSphere;return {a:a,i:G.index.array,bs:[s.center.x,s.center.y,s.center.z,s.radius]};}
onmessage=function(e){
  const out=[],tr=new Set();
  for(const n of e.data.formes){const F=n==='course'?SINGE_FC:singePoseForme(n);vitrailFini(vitrailPrepare(F));
    const o={n:n,lisse:paquet(F._geo.lisse),ecailles:paquet(F._geo.ecailles)};out.push(o);
    for(const G of [o.lisse,o.ecailles]){for(const k in G.a)tr.add(G.a[k][0].buffer);tr.add(G.i.buffer);}} // ⚠ la normale et aN partagent leur tableau : un seul transfert par tampon
  postMessage(out,Array.from(tr));
};
