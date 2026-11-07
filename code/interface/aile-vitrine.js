/* ===== LA VITRE DES AILES (2026-11-07, Léo : « ce qu'il a fait sur les WINGS c'est super ; ajoute une vitre devant les wings, qu'on peut casser aussi » puis « pas autour de la voiture : autour du choix, entre les deux flèches — un mini-effet 3D, sur le rectangle arrondi, en bonne résolution ») =====
   Chaque carte de la molette d'ailes (boutique-aile.js) qui n'est pas encore à toi est SOUS VERRE : une vitre en CSS (boutique-aile.css,
   « LA VITRE DES AILES ») posée sur tout le rectangle arrondi — reflet en biais, teinte et liseré de la rareté, une tranche sur le haut et le
   côté droit qui donne l'épaisseur. Nette à toute résolution (pas d'image).
   · On change d'aile : la carte du milieu reçoit une NOUVELLE vitre (elle se pose en se dépliant) — un nouveau truc, une nouvelle boîte.
   · Une aile À TOI (.a) : pas de vitre.
   · On l'achète : la vitre de SA carte éclate (les éclats et le DÉBLOQUÉ de vitre-brisee.js, posés sur la carte), puis la carte reste sans verre.
   Le crochet : bqAileMaj appelle aileVitrineMaj(on, dt) à chaque image ; il ne fait que guetter l'aile essayée qui devient à toi. */
const AVT={k:'',avant:false,casse:''};
/* LA BOÎTE QUI DÉFILE (2026-11-07, Léo : « un effet de cube rectangle qui défile ») : chaque carte reçoit --o (sa distance au milieu de la molette, de -1 à 1) et --oa (sa valeur absolue) ; le CSS la fait tourner et montre sa tranche (boutique-aile.css, « LA BOÎTE QUI DÉFILE »). */
function aileBoiteDefile(){const r=BQA.el&&BQA.el.querySelector('.baRail');if(!r)return;const R=r.getBoundingClientRect(),v=BQA.el.parentNode&&BQA.el.parentNode.classList.contains('cote'),m=v?R.top+R.height/2:R.left+R.width/2;
  r.querySelectorAll('.baK').forEach(function(k){const b=k.getBoundingClientRect(),c=v?b.top+b.height/2:b.left+b.width/2,t=(v?b.height:b.width)*2.2,o=Math.max(-1,Math.min(1,(c-m)/Math.max(1,t))),os=o.toFixed(3);
    if(k.dataset.o!==os){k.dataset.o=os;k.style.setProperty('--o',os);k.style.setProperty('--oa',Math.abs(o).toFixed(3));}});}
function aileVitrineMaj(on){if(on)try{aileBoiteDefile();}catch(e){}
  const ess=on&&typeof BQA!=='undefined'?String(BQA.essK||''):'',id=ess.indexOf('aile:')===0?ess.slice(5):'';
  if(!id){AVT.k='';AVT.avant=false;return;}
  const a=shopOwned('aile',id);
  if(AVT.k===id&&!AVT.avant&&a&&AVT.casse!==id){AVT.casse=id; /* achetée à l'instant : sa carte (re-dessinée par la molette) perd sa vitre en éclats */
    requestAnimationFrame(function(){const k=BQA.el&&BQA.el.querySelector('.baK[data-k="aile:'+id+'"]');if(k)try{bqVitreBriseSur(k);}catch(e){}});}
  AVT.k=id;AVT.avant=a;}
