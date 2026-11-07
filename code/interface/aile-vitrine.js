/* ===== LA VITRE DES AILES (2026-11-07, Léo : « ce qu'il a fait sur les WINGS c'est super ; ajoute une vitre devant les wings, qu'on peut casser aussi » puis « pas autour de la voiture : autour du choix, entre les deux flèches — un mini-effet 3D, sur le rectangle arrondi, en bonne résolution ») =====
   Chaque carte de la molette d'ailes (boutique-aile.js) qui n'est pas encore à toi est SOUS VERRE : une vitre en CSS (boutique-aile.css,
   « LA VITRE DES AILES ») posée sur tout le rectangle arrondi — reflet en biais, teinte et liseré de la rareté, une tranche sur le haut et le
   côté droit qui donne l'épaisseur. Nette à toute résolution (pas d'image).
   · On change d'aile : la carte du milieu reçoit une NOUVELLE vitre (elle se pose en se dépliant) — un nouveau truc, une nouvelle boîte.
   · Une aile À TOI (.a) : pas de vitre.
   · On l'achète : la vitre de SA carte éclate (les éclats et le DÉBLOQUÉ de vitre-brisee.js, posés sur la carte), puis la carte reste sans verre.
   Le crochet : bqAileMaj appelle aileVitrineMaj(on, dt) à chaque image ; il ne fait que guetter l'aile essayée qui devient à toi. */
const AVT={k:'',avant:false,casse:''};
function aileVitrineMaj(on){
  const ess=on&&typeof BQA!=='undefined'?String(BQA.essK||''):'',id=ess.indexOf('aile:')===0?ess.slice(5):'';
  if(!id){AVT.k='';AVT.avant=false;return;}
  const a=shopOwned('aile',id);
  if(AVT.k===id&&!AVT.avant&&a&&AVT.casse!==id){AVT.casse=id; /* achetée à l'instant : sa carte (re-dessinée par la molette) perd sa vitre en éclats */
    requestAnimationFrame(function(){const k=BQA.el&&BQA.el.querySelector('.baK[data-k="aile:'+id+'"]');if(k)try{bqVitreBriseSur(k);}catch(e){}});}
  AVT.k=id;AVT.avant=a;}
