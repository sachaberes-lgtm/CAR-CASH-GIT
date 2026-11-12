/* ===== LA REVUE DES INTERFACES (2026-11-07, Sacha : « revois les interfaces, fais un screen de chaque écran et paufine tout parfaitement. pas de bouton
   inutile. clarifie. ergonomie mobile ») : LES PLAQUES DE NOM QUI DÉBORDENT =====
   Relevé au banc des écrans en anglais : la plaque sous une boîte de la boutique (.bqKn, boites-blister.css) tient 9 lettres par ligne sur deux lignes ;
   cinq noms anglais en demandent trois et finissaient en « THE YELLOW… ». Plutôt que de deviner la largeur (elle change debout, couché, par rayon), on
   MESURE : dès qu'une plaque est posée dans le panneau de la boutique, si son texte dépasse sa hauteur, elle reçoit .lg (7 px sans espacement, voir
   css/revue-interfaces.css). Un seul passage par plaque (data-lg), lectures groupées avant les écritures (une seule mise en page), déclenché par
   un MutationObserver sur le garage (le panneau #gBqPan n'existe qu'à la première ouverture de la boutique), débité à une image. */
const REVUE={ob:null,raf:0};
function bqNomsAjuste(){REVUE.raf=0;const pan=document.getElementById('gBqPan');if(!pan)return;
  const L=pan.querySelectorAll('.bqKn:not([data-lg])');if(!L.length)return;
  const deb=[];for(let i=0;i<L.length;i++){const e=L[i];if(!e.clientHeight)continue; /* pas encore visible (rayon caché) : on repassera */
    e.setAttribute('data-lg','1');if(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)deb.push(e);}
  for(let i=0;i<deb.length;i++)deb[i].classList.add('lg');
  const deb2=[];for(let i=0;i<deb.length;i++){const e=deb[i];if(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)deb2.push(e);} /* 2e mesure (une mise en page de plus, seulement s'il y a eu un .lg) */
  for(let i=0;i<deb2.length;i++)deb2[i].classList.add('lg2');}
function bqNomsVeille(){const g=document.getElementById('garage');if(!g||REVUE.ob||typeof MutationObserver!=='function')return;
  REVUE.ob=new MutationObserver(function(){if(!REVUE.raf)REVUE.raf=requestAnimationFrame(bqNomsAjuste);});
  REVUE.ob.observe(g,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
try{bqNomsVeille();}catch(e){}
